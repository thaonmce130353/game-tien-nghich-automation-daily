

        // =========================================================================
        // HỆ THỐNG 8 MODULE TỰ ĐỘNG HÓA ƯU TIÊN (VISION & CONTROLLER HYBRID)
        // =========================================================================

        // [Module 1] Thông Thiên Tháp & Tứ Linh Tháp
        // Nhận thưởng và Quét ải mỗi ngày (CONFIG.towerDailyRoutine):
        //   - Thông Thiên Tháp: quét hết lượt miễn phí + mua đúng 1 lượt.
        //   - Tứ Linh Tháp: với mỗi tháp đang mở hôm nay, đánh các ải mới (tối đa theo giới hạn ngày)
        //     rồi quét hết lượt miễn phí (không mua thêm).
        // Mọi bước chỉ được tính là thành công khi dữ liệu máy chủ (11004/11021) xác nhận.
        const TOWER_DAILY_REQUEST_TIMEOUT_MS = 20000;
        const TOWER_DAILY_FIGHT_TIMEOUT_MS = 60000;
        const TOWER_DAILY_MAX_BUYS = 1;
        const TOWER_DAILY_DEFAULT_NEW_BATTLES = 10;
        let towerDailyState = null;
let towerDailyDidSend = false;   // nhịp này đã gửi yêu cầu thật tới máy chủ (nếu không: chỉ chờ, scheduler kiểm tra lại ngay)
        let towerDailyUnavailableLogged = false;
        let lastTowerAndTuLinhError = '';

        function createTowerDailyState() {
            return {
                dayKey: new Date().toDateString(),
                phase: 'tower',          // tower -> camp -> done
                failed: false,
                logged: {},
                tower: { stage: 'refresh', pending: null, refreshing: null, attempts: 0, done: 0, bought: 0 },
                camp: { stage: 'open', refreshing: null, list: null, index: 0, cur: null }
            };
        }

        function logTowerDaily(state, key, message, type) {
            if (state.logged[key]) return;
            state.logged[key] = true;
            sendLog(message, type || "info");
        }

        function failTowerDaily(state, key, message, nextPhase) {
            state.failed = true;
            logTowerDaily(state, key, `❌ [Thông Thiên Tháp - Quét mỗi ngày] ${message}`, "error");
            if (nextPhase) state.phase = nextPhase;
        }

        function getTowerDailyTypes(ctx) {
            const types = ctx.DailyDungeonConst && ctx.DailyDungeonConst.dailyDungeonType;
            if (!types || typeof types.runningMan !== 'number' || typeof types.singCamp_wei !== 'number') return null;
            return types;
        }

        // Số liệu lượt của một loại ải theo dữ liệu máy chủ (null nếu chưa tải).
        function readTowerDailyCounts(dd, type) {
            const data = typeof dd.getDungeonData === 'function' ? dd.getDungeonData(type) : null;
            if (!data || !data.his_list) return null;
            const enter = Number(data.enter_count);
            const buy = Number(data.buy_count);
            const totalBuy = Number(data.total_buy_count);
            const dayCount = Number(data.day_count);
            if (![enter, buy, totalBuy, dayCount].every(Number.isFinite)) return null;
            return {
                token: data.his_list,
                enter, buy, totalBuy, dayCount,
                free: dayCount + buy - enter,
                todayPass: Number(data.today_pass) || 0
            };
        }

        function getTowerDailyNewBattleLimit() {
            try {
                const value = Number(GlobalCtrl.gInst().gConstVByK(2));
                if (Number.isInteger(value) && value > 0) return value;
            } catch (e) { }
            return TOWER_DAILY_DEFAULT_NEW_BATTLES;
        }

        // Yêu cầu máy chủ gửi lại dữ liệu loại ải; trả về 'wait' | 'ready' | 'timeout' | 'error'.
        function pollTowerDailyRefresh(holder, key, now, send, tokenOf) {
            if (!holder[key]) {
                holder[key] = { token: tokenOf(), startedAt: now };
                towerDailyDidSend = true;
                try { send(); } catch (e) { holder[key] = null; return 'error'; }
                return 'wait';
            }
            if (tokenOf() !== holder[key].token) {
                holder[key] = null;
                return 'ready';
            }
            if (now - holder[key].startedAt >= TOWER_DAILY_REQUEST_TIMEOUT_MS) {
                holder[key] = null;
                return 'timeout';
            }
            return 'wait';
        }

        function handleTowerDailyTower(ctx, state, types, now) {
            const dd = ctx.DailyDungeonCtrl.gInst();
            const t = state.tower;
            const type = types.runningMan;
            const tokenOf = () => { const d = dd.getDungeonData(type); return d && d.his_list; };
            const refresh = () => pollTowerDailyRefresh(t, 'refreshing', now, () => dd.send11004(type), tokenOf);

            if (t.pending) {
                const pending = t.pending;
                const counts = readTowerDailyCounts(dd, type);
                const progressed = counts && counts.token !== pending.token && counts.enter > pending.beforeEnter &&
                    (pending.kind !== 'buy' || counts.buy > pending.before);
                if (progressed) {
                    t.pending = null;
                    if (pending.kind === 'buy') {
                        t.bought++;
                        logTowerDaily(state, `tower-buy-${counts.buy}`, `✅ [Thông Thiên Tháp] Máy chủ xác nhận đã mua và quét thêm 1 lượt (${counts.buy} lượt đã mua).`, "result");
                    } else {
                        t.done++;
                        logTowerDaily(state, `tower-fight-${counts.enter}`, `✅ [Thông Thiên Tháp] Máy chủ xác nhận đã quét lượt ${counts.enter}/${counts.dayCount + counts.buy}.`, "action");
                    }
                    t.stage = 'decide';
                } else if (now - pending.startedAt >= TOWER_DAILY_REQUEST_TIMEOUT_MS) {
                    t.pending = null;
                    const c2 = readTowerDailyCounts(dd, type);
                    const detail = c2 ? ` [đã vào ${c2.enter}/${c2.dayCount}, đã mua ${c2.buy}, tầng đã vượt #${dd.gLastDgnId(type)}]` : '';
                    failTowerDaily(state, 'tower-pending-timeout', `Máy chủ chưa xác nhận ${pending.kind === 'buy' ? 'lượt mua' : 'lượt quét'} Thông Thiên Tháp${detail}; không gửi lại để tránh mua/đánh trùng. `, 'camp');
                } else if (now - pending.startedAt >= 3000 && now - pending.lastRefreshAt >= 2000) {
                    pending.lastRefreshAt = now;
                    towerDailyDidSend = true;
                    try { dd.send11004(type); } catch (e) { }
                }
                return true;
            }

            if (t.stage === 'refresh') {
                const result = refresh();
                if (result === 'ready') t.stage = 'decide';
                else if (result === 'timeout' || result === 'error') failTowerDaily(state, 'tower-refresh', 'Không tải được số lượt Thông Thiên Tháp từ máy chủ.', 'camp');
                return true;
            }

            // stage === 'decide'
            const counts = readTowerDailyCounts(dd, type);
            if (!counts) {
                failTowerDaily(state, 'tower-counts', 'Không đọc được số lượt Thông Thiên Tháp.', 'camp');
                return true;
            }
            if (t.attempts >= counts.dayCount + TOWER_DAILY_MAX_BUYS + 2) {
                failTowerDaily(state, 'tower-attempts', 'Thông Thiên Tháp vượt quá số lần thử trong một lượt chạy; dừng để tránh lặp.', 'camp');
                return true;
            }

            if (counts.free <= 0) {
                if (counts.buy < TOWER_DAILY_MAX_BUYS && counts.totalBuy > counts.buy) {
                    const lastId = dd.gLastDgnId(type);
                    const cost = typeof dd.gDgnCostCfg2 === 'function' ? dd.gDgnCostCfg2(type, counts.buy + 1) : null;
                    if (!lastId || lastId <= 0 || !cost || typeof dd.send11007 !== 'function') {
                        failTowerDaily(state, 'tower-buy-api', 'Không tìm thấy ải đã vượt hoặc giá mua lượt quét Thông Thiên Tháp hợp lệ; không mua.', 'camp');
                        return true;
                    }
                    t.attempts++;
                    t.pending = { kind: 'buy', before: counts.buy, beforeEnter: counts.enter, token: counts.token, startedAt: now, lastRefreshAt: now };
                    sendLog(`🗼 [Thông Thiên Tháp] Hết lượt quét miễn phí; mua thêm 1 lượt quét (${cost.gold} Tiên Ngọc)...`, "result");
                    towerDailyDidSend = true;
                    try {
                        // Giống nút Quét của game: mua rồi máy chủ tự quét ải đã vượt.
                        dd.send11007(lastId, type, ctx.DailyDungeonConst.buyType.saodang);
                    } catch (e) {
                        t.pending = null;
                        failTowerDaily(state, 'tower-buy-error', `Không thể mua lượt quét Thông Thiên Tháp: ${e.message || e}`, 'camp');
                    }
                    return true;
                }
                if (t.done + t.bought > 0) {
                    logTowerDaily(state, 'tower-finished', `✅ [Thông Thiên Tháp] Đã quét xong lượt trong ngày (${counts.enter}/${counts.dayCount + counts.buy} lượt, đã mua ${counts.buy}).`, "result");
                } else {
                    logTowerDaily(state, 'tower-already', `ℹ️ [Thông Thiên Tháp] Hôm nay đã quét đủ (${counts.enter}/${counts.dayCount + counts.buy} lượt, đã mua ${counts.buy}); bỏ qua.`, "info");
                }
                state.phase = 'camp';
                return true;
            }

            const lastId = dd.gLastDgnId(type);
            if (!lastId || lastId <= 0 || typeof dd.send11005 !== 'function') {
                failTowerDaily(state, 'tower-sweep-api', 'Thông Thiên Tháp chưa có tầng đã vượt để quét.', 'camp');
                return true;
            }
            t.attempts++;
            t.pending = { kind: 'sweep', before: counts.enter, beforeEnter: counts.enter, token: counts.token, startedAt: now, lastRefreshAt: now };
            sendLog(`🗼 [Thông Thiên Tháp] Quét lượt ${counts.enter + 1}/${counts.dayCount + counts.buy} (tầng đã vượt #${lastId})...`, "action");
            towerDailyDidSend = true;
            try {
                dd.send11005(lastId);
            } catch (e) {
                t.pending = null;
                failTowerDaily(state, 'tower-sweep-error', `Không thể quét Thông Thiên Tháp: ${e.message || e}`, 'camp');
            }
            return true;
        }

        function handleTowerDailyCamp(ctx, state, types, now) {
            const dd = ctx.DailyDungeonCtrl.gInst();
            const c = state.camp;

            if (c.stage === 'open') {
                // Tứ Linh Tháp mở theo cấp độ: chưa đủ cấp thì bỏ qua, không coi là lỗi.
                try {
                    if (ctx.FunOpenCtrl && ctx.FunOpenType && ctx.FunOpenType.SING_CAMP !== undefined &&
                        !ctx.FunOpenCtrl.gInst().check(ctx.FunOpenType.SING_CAMP, false)) {
                        logTowerDaily(state, 'camp-locked', "ℹ️ [Tứ Linh Tháp] Chức năng chưa mở khóa (chưa đủ cấp độ); bỏ qua.", "info");
                        state.phase = 'done';
                        return true;
                    }
                } catch (e) { }
                // Máy chủ trả danh sách tháp đang mở hôm nay (openArr: 1..4).
                if (typeof dd.sd11021 !== 'function') {
                    failTowerDaily(state, 'camp-api', 'API danh sách Tứ Linh Tháp chưa sẵn sàng.', 'done');
                    return true;
                }
                const result = pollTowerDailyRefresh(c, 'refreshing', now, () => dd.sd11021(), () => dd.openArr);
                if (result === 'ready') {
                    const open = Array.isArray(dd.openArr) ? dd.openArr.slice() : [];
                    c.list = open.map(n => types.singCamp_wei + Number(n) - 1)
                        .filter(v => v >= types.singCamp_wei && v <= types.singCamp_qun);
                    if (c.list.length === 0) {
                        logTowerDaily(state, 'camp-none-open', "ℹ️ [Tứ Linh Tháp] Hôm nay không có tháp nào đang mở; bỏ qua.", "info");
                        state.phase = 'done';
                    } else {
                        logTowerDaily(state, 'camp-open', `🛡️ [Tứ Linh Tháp] Tháp đang mở hôm nay: ${c.list.map(v => '#' + (v - types.singCamp_wei + 1)).join(', ')}.`, "info");
                        c.stage = 'next';
                    }
                } else if (result === 'timeout' || result === 'error') {
                    failTowerDaily(state, 'camp-open-timeout', 'Không tải được danh sách Tứ Linh Tháp đang mở từ máy chủ.', 'done');
                }
                return true;
            }

            if (c.stage === 'next') {
                if (c.index >= c.list.length) {
                    state.phase = 'done';
                    return true;
                }
                c.cur = { type: c.list[c.index], stage: 'refresh', refreshing: null, pending: null, attempts: 0, fights: 0, sweeps: 0 };
                c.stage = 'run';
                return true;
            }

            // stage === 'run': xử lý lần lượt từng tháp
            const cur = c.cur;
            const label = `#${cur.type - types.singCamp_wei + 1}`;
            const finishCamp = (ok, key, message) => {
                if (ok) logTowerDaily(state, key, message, "action");
                else failTowerDaily(state, key, message);
                c.index++;
                c.stage = 'next';
                return true;
            };
            const tokenOf = () => { const d = dd.getDungeonData(cur.type); return d && d.his_list; };

            if (cur.pending) {
                const p = cur.pending;
                const counts = readTowerDailyCounts(dd, cur.type);
                const progressed = counts && counts.token !== p.token &&
                    (p.kind === 'fight' ? counts.todayPass > p.before : counts.enter > p.before);
                if (progressed) {
                    cur.pending = null;
                    if (p.kind === 'fight') {
                        cur.fights++;
                        logTowerDaily(state, `camp-${label}-fight-${counts.todayPass}`, `✅ [Tứ Linh Tháp ${label}] Máy chủ xác nhận ải mới ${counts.todayPass}/${getTowerDailyNewBattleLimit()}.`, "action");
                    } else {
                        cur.sweeps++;
                        logTowerDaily(state, `camp-${label}-sweep-${counts.enter}`, `✅ [Tứ Linh Tháp ${label}] Máy chủ xác nhận đã quét lượt ${counts.enter}/${counts.dayCount + counts.buy}.`, "action");
                    }
                    cur.stage = 'decide';
                } else if (now - p.startedAt >= TOWER_DAILY_FIGHT_TIMEOUT_MS) {
                    cur.pending = null;
                    return finishCamp(false, `camp-${label}-timeout`, `Máy chủ chưa xác nhận ${p.kind === 'fight' ? 'ải mới' : 'lượt quét'} Tứ Linh Tháp ${label}; chuyển tháp tiếp theo, không gửi lại.`);
                } else if (now - p.startedAt >= 3000 && now - p.lastRefreshAt >= 2000) {
                    p.lastRefreshAt = now;
                    towerDailyDidSend = true;
                    try { dd.send11004(cur.type); } catch (e) { }
                }
                return true;
            }

            if (cur.stage === 'refresh') {
                const result = pollTowerDailyRefresh(cur, 'refreshing', now, () => dd.send11004(cur.type), tokenOf);
                if (result === 'ready') cur.stage = 'decide';
                else if (result === 'timeout' || result === 'error') return finishCamp(false, `camp-${label}-refresh`, `Không tải được dữ liệu Tứ Linh Tháp ${label} từ máy chủ.`);
                return true;
            }

            // cur.stage === 'decide'
            const counts = readTowerDailyCounts(dd, cur.type);
            if (!counts) return finishCamp(false, `camp-${label}-counts`, `Không đọc được dữ liệu Tứ Linh Tháp ${label}.`);
            if (cur.attempts >= getTowerDailyNewBattleLimit() + counts.dayCount + 2) {
                return finishCamp(false, `camp-${label}-attempts`, `Tứ Linh Tháp ${label} vượt quá số lần thử trong một lượt chạy; dừng để tránh lặp.`);
            }

            // 1. Đánh các ải mới cho tới giới hạn trong ngày
            const limit = getTowerDailyNewBattleLimit();
            if (counts.todayPass < limit) {
                const nextId = dd.gCurDgnId(cur.type);
                if (nextId > 0 && typeof dd.send11020 === 'function') {
                    cur.attempts++;
                    cur.pending = { kind: 'fight', before: counts.todayPass, token: counts.token, startedAt: now, lastRefreshAt: now };
                    sendLog(`🛡️ [Tứ Linh Tháp ${label}] Khiêu chiến ải mới ${counts.todayPass + 1}/${limit} (#${nextId})...`, "action");
                    towerDailyDidSend = true;
                    try {
                        if (typeof dd.saveScId === 'function') dd.saveScId(nextId);
                        dd.send11020(nextId);
                    } catch (e) {
                        cur.pending = null;
                        return finishCamp(false, `camp-${label}-fight-error`, `Không thể khiêu chiến Tứ Linh Tháp ${label}: ${e.message || e}`);
                    }
                    return true;
                }
                // Hết ải để đánh: chuyển sang quét.
                logTowerDaily(state, `camp-${label}-no-next`, `ℹ️ [Tứ Linh Tháp ${label}] Không còn ải mới để đánh (${counts.todayPass}/${limit}).`, "info");
            }

            // 2. Quét bằng lượt miễn phí (không mua thêm)
            if (counts.free > 0) {
                const lastId = dd.gLastDgnId(cur.type);
                if (!lastId || lastId <= 0 || typeof dd.send11005 !== 'function') {
                    return finishCamp(false, `camp-${label}-sweep-api`, `Tứ Linh Tháp ${label} chưa có ải đã vượt để quét.`);
                }
                cur.attempts++;
                cur.pending = { kind: 'sweep', before: counts.enter, token: counts.token, startedAt: now, lastRefreshAt: now };
                sendLog(`🛡️ [Tứ Linh Tháp ${label}] Quét ải #${lastId} (còn ${counts.free} lượt miễn phí)...`, "action");
                towerDailyDidSend = true;
                try {
                    dd.send11005(lastId);
                } catch (e) {
                    cur.pending = null;
                    return finishCamp(false, `camp-${label}-sweep-error`, `Không thể quét Tứ Linh Tháp ${label}: ${e.message || e}`);
                }
                return true;
            }

            if (cur.fights + cur.sweeps > 0) {
                return finishCamp(true, `camp-${label}-finished`, `✅ [Tứ Linh Tháp ${label}] Hoàn tất: ${cur.fights} ải mới, ${cur.sweeps} lượt quét (ải mới hôm nay ${counts.todayPass}/${limit}).`);
            }
            logTowerDaily(state, `camp-${label}-already`, `ℹ️ [Tứ Linh Tháp ${label}] Hôm nay đã xong (ải mới ${counts.todayPass}/${limit}, quét ${counts.enter}/${counts.dayCount + counts.buy}); bỏ qua.`, "info");
            c.index++;
            c.stage = 'next';
            return true;
        }

        function finishTowerDaily(state) {
            state.phase = 'done';
            if (state.failed) {
                sendLog("⚠️ [Thông Thiên Tháp - Quét mỗi ngày] Kết thúc nhưng có bước lỗi/chưa xác nhận; sẽ kiểm tra lại khi Auto khởi động lại.", "warn");
            } else {
                sendLog("✅ [Thông Thiên Tháp - Quét mỗi ngày] Đã hoàn tất Thông Thiên Tháp & Tứ Linh Tháp hôm nay.", "result");
            }
        }

        // Trả về true khi đang xử lý (chặn các bước khác); false khi đã xong hôm nay.
        function handleTowerDailyRoutine(ctx) {
            if (!CONFIG.towerDailyRoutine) return false;
            const types = getTowerDailyTypes(ctx);
            const dd = ctx.DailyDungeonCtrl && ctx.DailyDungeonCtrl.gInst && ctx.DailyDungeonCtrl.gInst();
            if (!types || !dd || typeof dd.getDungeonData !== 'function' || typeof dd.send11004 !== 'function') {
                if (!towerDailyUnavailableLogged) {
                    towerDailyUnavailableLogged = true;
                    sendLog("⚠️ [Thông Thiên Tháp - Quét mỗi ngày] Game chưa sẵn sàng (DailyDungeonCtrl); sẽ thử lại.", "warn");
                }
                return false;
            }
            towerDailyUnavailableLogged = false;

            const dayKey = new Date().toDateString();
            if (!towerDailyState || towerDailyState.dayKey !== dayKey) {
                towerDailyState = createTowerDailyState();
                sendLog("🗼 [Thông Thiên Tháp - Quét mỗi ngày] Bắt đầu nhận thưởng và quét ải: Thông Thiên Tháp rồi Tứ Linh Tháp.", "action");
            }
            const state = towerDailyState;
            if (state.phase === 'done') return false;

            const now = Date.now();
            towerDailyDidSend = false;
            if (state.phase === 'tower') handleTowerDailyTower(ctx, state, types, now);
            else if (state.phase === 'camp') handleTowerDailyCamp(ctx, state, types, now);
            if (state.phase === 'done') { finishTowerDaily(state); return true; }
            // 'wait' = chỉ chờ máy chủ/chuyển bước (chưa gửi gì): scheduler kiểm tra lại sau ~40ms, không nghỉ kiểu người chơi.
            return towerDailyDidSend ? true : 'wait';
        }

        function handleTowerAndTuLinh(ctx) {
            try {
                const daily = handleTowerDailyRoutine(ctx);
                if (daily) return daily;
                // Chế độ quét (Quét nhanh): chỉ quét/đánh ải mỗi ngày, xong là thôi, không leo tháp.
                if (CONFIG.towerSweepOnly) return false;
                return handleTongTianTower(ctx) || handleClimbCamp(ctx);
            } catch(e) {
                const message = `❌ [Thông Thiên Tháp & Tứ Linh Tháp] Lỗi: ${e && e.message ? e.message : e}`;
                if (message !== lastTowerAndTuLinhError) {
                    lastTowerAndTuLinhError = message;
                    sendLog(message, "error");
                }
                return false;
            }
        }
