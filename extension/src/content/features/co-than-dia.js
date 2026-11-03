
        // [Module 4b] Cổ Thần Địa (AdvCtrl, giao diện adventureMainUi / adventureFightUi / adventureUseSpecialUi / adventureTarAwardUi)
        // Quy trình giống người chơi, mỗi nhịp một việc:
        //   1. Mở Cổ Thần Địa; nếu chưa có tướng thì mở bảng chọn tướng, bấm xếp tự động rồi xác nhận.
        //   2. Khiêu chiến 4 ải xung quanh (ô 17, 19, 9, 7 - dễ đến khó), rồi ải giữa (ô 13). Mỗi ải: bấm ô ->
        //      bảng khiêu chiến -> nút Khiêu chiến (send11066). Hạ xong ải giữa, ô đó thành cửa "Tầng sau"
        //      (etype NEXT_SGC): đi qua cửa (send11063) sang tầng kế và lặp lại 4 ải + ải giữa, tới khi hết tướng còn sức.
        //   3. Hết tướng: dùng vật phẩm đặc biệt (Cấm Tuyệt Mệnh, send11079) lên ải còn lại, tối đa 5 lần.
        //   4. Nhận thưởng Diệt Thủ Hộ (mốc hạ gục đã đạt, send11084).
        // Mỗi bước chỉ tính thành công khi dữ liệu máy chủ tải lại (send11060) xác nhận.
        const CO_THAN_REQUEST_TIMEOUT_MS = 20000;
        const CO_THAN_FIGHT_TIMEOUT_MS = 90000;
        const CO_THAN_BOSS_ORDER = [17, 19, 9, 7, 13];
        const CO_THAN_MAX_SPECIAL_USES = 5;
        const CO_THAN_MAX_CLAIMS = 10;
        const CO_THAN_MAX_FIGHTS = 1000;
        const CO_THAN_MAX_FLOORS = 200;
        const CO_THAN_NEXT_FLOOR_ETYPE = 99999;
        // Số lần đã gửi dùng vật phẩm đặc biệt được giữ trong sessionStorage của tab: tự vào lại game (làm mới trang)
        // không được đặt lại bộ đếm và vượt giới hạn.
        const CO_THAN_SPECIAL_STORAGE_KEY = 'TN_AUTO_COTHAN_SPECIAL_V1';

        function loadCoThanSpecialSent() {
            try {
                const saved = JSON.parse(sessionStorage.getItem(CO_THAN_SPECIAL_STORAGE_KEY) || 'null');
                if (saved && saved.dayKey === new Date().toDateString()) return Number(saved.sent) || 0;
            } catch (e) { }
            return 0;
        }

        function saveCoThanSpecialSent(sent) {
            try {
                sessionStorage.setItem(CO_THAN_SPECIAL_STORAGE_KEY, JSON.stringify({ dayKey: new Date().toDateString(), sent }));
            } catch (e) { }
        }

        let coThanState = null;
        runResetHooks.push(() => {
            if (coThanState && coThanState.failed && coThanState.phase === 'done') coThanState = null;
        });

        function createCoThanState() {
            return {
                dayKey: new Date().toDateString(),
                phase: 'open',            // open -> heroes -> fight -> special -> reward -> done
                failed: false,
                logged: {},
                refreshing: null,
                sent: false,
                tokenBefore: null,
                step: '',
                stepAt: 0,
                heroStage: 'arrange',
                fights: 0,
                floors: 0,
                door: null,               // { gridId, at, layer } đã gửi đi qua cửa, chờ máy chủ xác nhận
                pending: null,            // { gridId, at, killBefore, hpBefore }
                special: { uses: loadCoThanSpecialSent(), pending: null },
                claim: { done: 0, pending: null },
                idleAt: Date.now()
            };
        }

        function logCoThan(state, key, message, type) {
            if (state.logged[key]) return;
            state.logged[key] = true;
            sendLog(message, type || "info");
        }

        function failCoThan(state, key, message, nextPhase) {
            state.failed = true;
            logCoThan(state, key, `❌ [Cổ Thần Địa] ${message}`, "error");
            state.phase = nextPhase || 'done';
        }

        function coThanAliveCount(dt) {
            return (dt.heroLs || []).filter((h) => h.hp > 0).length;
        }

        function coThanTotalHp(dt) {
            return (dt.heroLs || []).reduce((a, h) => a + (Number(h.hp) || 0), 0);
        }

        // Ải còn đánh được, theo thứ tự: 4 ải quanh rồi ải giữa.
        function coThanPickGrid(dt) {
            for (const id of CO_THAN_BOSS_ORDER) {
                const g = (dt.gridLs || []).find((x) => x.id === id);
                if (g && g.isOpen === 1 && g.isFsh !== 1 && g.bossBsId) return g;
            }
            return null;
        }

        // Cửa sang tầng sau: ô loại NEXT_SGC đã mở, chưa đi qua.
        function coThanFindDoor(ctx, dt) {
            const type = ctx.AdvConst && ctx.AdvConst.NEXT_SGC || CO_THAN_NEXT_FLOOR_ETYPE;
            return (dt.gridLs || []).find((g) => g.eType === type && g.isOpen === 1 && g.isFsh !== 1) || null;
        }

        function coThanRemainingBosses(dt) {
            return (dt.gridLs || []).filter((g) => g.isOpen === 1 && g.isFsh !== 1 && g.bossBsId && (g.bossLv || g.isBsGrid))
                .sort((a, b) => (a.bossLv || 99) - (b.bossLv || 99));
        }

        // Mất dữ liệu giữa chừng (thường do rớt mạng): không dùng vật phẩm/nhận thưởng trên dữ liệu cũ mà
        // quay lại bước mở để lấy lại trạng thái từ máy chủ (tối đa 3 lần mỗi lượt Auto).
        function coThanResync(state, key, message) {
            state.pending = null;
            state.door = null;
            state.refreshing = null;
            if (!tryAttemptTarget('co-than-resync', "[Cổ Thần Địa] Tải lại trạng thái")) {
                failCoThan(state, key, `${message} Đã thử tải lại nhiều lần mà không được; dừng để an toàn.`, 'done');
                return;
            }
            sendLog(`⚠️ [Cổ Thần Địa] ${message}`, "warn");
            state.phase = 'open';
            state.sent = false;
        }

        function coThanRefresh(ctrl, state, now) {
            return pollTowerDailyRefresh(state, 'refreshing', now, () => ctrl.send11060(2), () => ctrl.mainUiDt);
        }

        function coThanOpen(ctx, ctrl, vm, state, now) {
            if (!state.sent) {
                try {
                    if (ctx.FunOpenCtrl && ctx.FunOpenType && !ctx.FunOpenCtrl.gInst().check(ctx.FunOpenType.GSZD_DUNGEON, false)) {
                        failCoThan(state, 'locked', "Cổ Thần Địa chưa mở khóa; bỏ qua.");
                        return false;
                    }
                } catch (e) { }
                state.tokenBefore = ctrl.mainUiDt;
                state.stepAt = now;
                state.sent = true;
                ctrl.send11060(1);
                sendLog("🗺️ [Cổ Thần Địa] Đang mở Cổ Thần Địa và kiểm tra dữ liệu từ game...", "action");
                return true;
            }
            if (vm.viewIsVisible('adventureHeroMainUi')) {
                state.phase = 'heroes';
                state.stepAt = now;
                sendLog("ℹ️ [Cổ Thần Địa] Chưa có tướng xuất chiến; chuyển sang chọn tướng tự động.", "info");
                return false;
            }
            const dt = ctrl.mainUiDt;
            if (dt && dt !== state.tokenBefore && dt.heroLs && dt.heroLs.length) {
                if (!vm.viewIsVisible('adventureMainUi')) ctrl.openMainUi();
                const left = Number(dt.eTime) - (ctx.NetMgr && ctx.NetMgr.gInst ? ctx.NetMgr.gInst().getTime() : Date.now() / 1000);
                if (Number.isFinite(left) && left <= 0) {
                    failCoThan(state, 'ended', "Hoạt động Cổ Thần Địa đã kết thúc.");
                    return false;
                }
                state.phase = 'fight';
                state.idleAt = now;
                sendLog(`✅ [Cổ Thần Địa] Đã vào Cổ Thần Địa: ${coThanAliveCount(dt)}/${dt.heroLs.length} tướng còn sức, ${dt.killNum || 0} lượt hạ gục.`, "action");
                return true;
            }
            if (now - state.stepAt > CO_THAN_REQUEST_TIMEOUT_MS) {
                failCoThan(state, 'open-timeout', "Máy chủ chưa trả dữ liệu Cổ Thần Địa; bỏ qua.");
            }
            return false;
        }

        function coThanHeroes(ctrl, vm, state, now) {
            const ui = vm.viewIsVisible('adventureHeroMainUi') ? vm.getViewByName('adventureHeroMainUi') : null;
            if (!ui) {
                // Bảng đã đóng: game tự mở lại màn chính khi xác nhận (scmd11065 -> clkAdv); kiểm tra dữ liệu.
                if (ctrl.mainUiDt && ctrl.mainUiDt.heroLs && ctrl.mainUiDt.heroLs.length) {
                    state.phase = 'fight';
                    state.idleAt = now;
                    sendLog(`✅ [Cổ Thần Địa] Máy chủ xác nhận đã chọn ${ctrl.mainUiDt.heroLs.length} tướng xuất chiến.`, "action");
                    return true;
                }
                if (now - state.stepAt > CO_THAN_REQUEST_TIMEOUT_MS) failCoThan(state, 'heroes-timeout', "Không chọn được tướng xuất chiến; bỏ qua.");
                return false;
            }
            if (now - state.stepAt < humanDelay(1100)) return false;
            if (!tryAttemptTarget('co-than-heroes', "[Cổ Thần Địa] Chọn tướng xuất chiến")) {
                failCoThan(state, 'heroes-stuck', "Chọn tướng nhiều lần vẫn chưa được; dừng.");
                return false;
            }
            state.stepAt = now;
            if (state.heroStage === 'arrange') {
                ui.clickBtnHandler2({ target: ui.buzhenBtn });
                state.heroStage = 'confirm';
                sendLog("🛡️ [Cổ Thần Địa] Đã xếp tướng tự động.", "action");
            } else {
                const picked = (ctrl.selFightLs || []).filter(Boolean).length;
                if (!picked) {
                    state.heroStage = 'arrange';
                    logCoThan(state, 'no-heroes', "⚠️ [Cổ Thần Địa] Xếp tự động chưa chọn được tướng nào (có thể thiếu tướng ở tộc đang chọn).", "warn");
                    return false;
                }
                ui.clickBtnHandler2({ target: ui.enterBtn });
                state.heroStage = 'arrange';
                sendLog(`⚔️ [Cổ Thần Địa] Đã xác nhận ${picked} tướng xuất chiến; chờ máy chủ.`, "action");
            }
            return true;
        }

        function coThanFight(ctx, ctrl, vm, state, now) {
            const dt = ctrl.mainUiDt;
            if (!dt) { state.phase = 'open'; state.sent = false; return false; }

            if (state.door) {
                const d = state.door;
                if (now - d.at < 1500) return false;
                const r = coThanRefresh(ctrl, state, now);
                if (r === 'wait') return false;
                state.door = null;
                if (r !== 'ready') {
                    failCoThan(state, 'door-refresh', "Máy chủ chưa trả dữ liệu sau khi qua cửa; dừng để an toàn.", 'special');
                    return true;
                }
                const after = ctrl.mainUiDt;
                if (Number(after.cLayer) > Number(d.layer)) {
                    state.floors++;
                    clearTargetAttempts('co-than-door-' + d.layer);
                    sendLog(`✅ [Cổ Thần Địa] Máy chủ xác nhận đã sang tầng ${after.cLayer} (tầng trước ${d.layer}); tiếp tục 4 ải quanh + ải giữa.`, "action");
                } else {
                    failCoThan(state, 'door-unconfirmed', `Đã đi qua cửa ô #${d.gridId} nhưng vẫn ở tầng ${after.cLayer}; dừng đi tầng mới.`, 'special');
                }
                state.idleAt = now;
                return true;
            }

            if (state.pending) {
                const p = state.pending;
                const fc = ctx.FightCtrl && ctx.FightCtrl.gInst && ctx.FightCtrl.gInst();
                const busy = vm.viewIsVisible('adventureFightUi') || (fc && typeof fc.gCanFight === 'function' && !fc.gCanFight(0));
                if (now - p.at > CO_THAN_FIGHT_TIMEOUT_MS) {
                    state.pending = null;
                    coThanResync(state, 'fight-timeout', `Máy chủ chưa xác nhận trận ở ô #${p.gridId}; tải lại trạng thái từ game, không gửi lại.`);
                    return true;
                }
                if (busy || now - p.at < 2000) return false;
                const r = coThanRefresh(ctrl, state, now);
                if (r === 'wait') return false;
                state.pending = null;
                if (r !== 'ready') {
                    coThanResync(state, 'fight-refresh', "Máy chủ chưa trả dữ liệu sau trận; tải lại trạng thái từ game trước khi làm tiếp.");
                    return true;
                }
                const after = ctrl.mainUiDt;
                const grid = (after.gridLs || []).find((x) => x.id === p.gridId);
                state.fights++;
                clearTargetAttempts('co-than-open-' + p.gridId);
                if (grid && grid.isFsh === 1) {
                    sendLog(`✅ [Cổ Thần Địa] Máy chủ xác nhận đã hạ ải ô #${p.gridId} (hạ gục ${after.killNum || 0}).`, "action");
                } else if (grid && grid.eType === (ctx.AdvConst && ctx.AdvConst.NEXT_SGC || CO_THAN_NEXT_FLOOR_ETYPE)) {
                    sendLog(`✅ [Cổ Thần Địa] Máy chủ xác nhận đã hạ ải giữa ô #${p.gridId}; cửa sang tầng sau đã xuất hiện (hạ gục ${after.killNum || 0}).`, "action");
                } else {
                    sendLog(`ℹ️ [Cổ Thần Địa] Trận ô #${p.gridId} kết thúc nhưng ải chưa bị hạ (HP đội ${p.hpBefore} -> ${coThanTotalHp(after)}).`, "info");
                }
                state.idleAt = now;
                return true;
            }

            if (state.fights >= CO_THAN_MAX_FIGHTS) {
                failCoThan(state, 'fight-cap', `Đã đánh ${CO_THAN_MAX_FIGHTS} trận trong một lượt; dừng để an toàn.`, 'special');
                return false;
            }

            // Bảng khiêu chiến đang mở: bấm nút Khiêu chiến (send11066) sau một nhịp ngẫu nhiên.
            if (vm.viewIsVisible('adventureFightUi')) {
                const ui = vm.getViewByName('adventureFightUi');
                const gridId = ui && ui.m_data && ui.m_data.gridId;
                if (!gridId) return false;
                if (now - state.idleAt < humanDelay(450)) return false;
                state.pending = { gridId, at: now, hpBefore: coThanTotalHp(dt) };
                state.refreshing = null;
                ctrl.send11066(gridId, 0);
                sendLog(`⚔️ [Cổ Thần Địa] Khiêu chiến ải ô #${gridId}.`, "action");
                return true;
            }

            if (coThanAliveCount(dt) === 0) {
                sendLog("ℹ️ [Cổ Thần Địa] Đã hết tướng còn sức; chuyển sang dùng vật phẩm đặc biệt.", "info");
                state.phase = 'special';
                return false;
            }
            const grid = coThanPickGrid(dt);
            if (!grid) {
                const door = coThanFindDoor(ctx, dt);
                if (door && state.floors < CO_THAN_MAX_FLOORS) {
                    if (now - state.idleAt < humanDelay(800)) return false;
                    const layer = Number(dt.cLayer) || 0;
                    if (!tryAttemptTarget('co-than-door-' + layer, `[Cổ Thần Địa] Cửa tầng sau (tầng ${layer})`)) {
                        failCoThan(state, 'door-stuck', "Qua cửa sang tầng sau nhiều lần vẫn chưa được; dừng đi tầng mới.", 'special');
                        return false;
                    }
                    state.idleAt = now;
                    state.door = { gridId: door.id, at: now, layer };
                    state.refreshing = null;
                    ctrl.send11063(door.id);
                    sendLog(`🚪 [Cổ Thần Địa] Đã hạ hết ải tầng ${layer}; đi qua cửa ô #${door.id} sang tầng sau.`, "action");
                    return true;
                }
                if (door) logCoThan(state, 'floor-cap', `ℹ️ [Cổ Thần Địa] Đã đi ${CO_THAN_MAX_FLOORS} tầng trong một lượt (giới hạn an toàn); dừng ở đây.`, "info");
                else sendLog("✅ [Cổ Thần Địa] Không còn ải nào để khiêu chiến.", "action");
                state.phase = 'special';
                return false;
            }
            if (now - state.idleAt < humanDelay(600)) return false;
            if (!tryAttemptTarget('co-than-open-' + grid.id, `[Cổ Thần Địa] Ô #${grid.id}`)) {
                // Ô này mãi không mở bảng khiêu chiến/không hạ được: bỏ qua ô, đánh tiếp ô khác nếu còn.
                grid.isFsh = 1;
                return false;
            }
            state.idleAt = now;
            ctrl.clkBossGrid(grid);
            sendLog(`🗺️ [Cổ Thần Địa] Chọn ải ô #${grid.id}${grid.id === 13 ? ' (ải giữa)' : ''}; chờ bảng khiêu chiến.`, "action");
            return true;
        }

        // Phản hồi 11079 (dùng vật phẩm đặc biệt): máy chủ trả res/msg; game chỉ hiện msg rồi đóng bảng nên tự ghi lại
        // để biết vì sao bị từ chối. Đăng ký thêm một listener (NetMgr là EventDispatcher, không ghi đè listener của game).
        let coThanSpecialReply = null;
        let coThanSpecialWatched = false;
        function coThanWatchSpecialReply() {
            if (coThanSpecialWatched) return;
            try {
                const nm = window.NetMgr && window.NetMgr.gInst && window.NetMgr.gInst();
                if (!nm || typeof nm.addEventListener !== 'function' || !window.NProtoNum) return;
                nm.addEventListener(String(window.NProtoNum.R11079), (ev) => {
                    const d = ev && ev.netData;
                    if (d) coThanSpecialReply = { res: Number(d.res), msg: String(d.msg || ''), grid: d.grid_id, at: Date.now() };
                }, window);
                coThanSpecialWatched = true;
            } catch (e) { }
        }

        function coThanSpecial(ctrl, vm, state, now) {
            const sp = state.special;
            const dt = ctrl.mainUiDt;
            coThanWatchSpecialReply();
            if (sp.pending) {
                if (now - sp.pending.at < 2500) return false;
                const reply = coThanSpecialReply && coThanSpecialReply.at >= sp.pending.at - 50 ? coThanSpecialReply : null;
                if (reply && reply.res !== 1 && !sp.pending.replyLogged) {
                    sp.pending.replyLogged = true;
                    let text = reply.msg;
                    try {
                        // Thông báo dạng số là mã ngôn ngữ; game đổi ra chữ bằng GlobalCtrl.getNetErrorMsg.
                        if (/^[0-9]+$/.test(reply.msg) && window.GlobalCtrl) text = `${reply.msg} = ${window.GlobalCtrl.gInst().getNetErrorMsg(reply.msg) || '?'}`;
                    } catch (e) { }
                    // 196050 = "Tầng hiện tại không thể dùng Tuyệt Mệnh Cấm Chế lên Thủ Lĩnh": từ chối bình thường khi chỉ còn ải giữa, không phải lỗi.
                    const knownRefusal = String(reply.msg) === '196050';
                    sendLog(`${knownRefusal ? 'ℹ️' : '⚠️'} [Cổ Thần Địa] Máy chủ trả lời dùng vật phẩm ô #${sp.pending.gridId}: res=${reply.res}, thông báo: "${text || '(trống)'}".`, knownRefusal ? "info" : "warn");
                }
                if (reply && reply.res !== 1) {
                    // Máy chủ từ chối rõ ràng (ví dụ "không thể dùng lên Thủ Lĩnh ở tầng này"): vật phẩm chưa bị trừ, nên
                    // hoàn lại lượt đếm, bỏ ô này khỏi danh sách mục tiêu và đi tiếp thay vì báo lỗi.
                    sp.denied = sp.denied || new Set();
                    sp.denied.add(sp.pending.gridId);
                    sp.uses = Math.max(0, sp.uses - 1);
                    saveCoThanSpecialSent(sp.uses);
                    sp.pending = null;
                    state.refreshing = null;
                    return true;
                }
                const r = coThanRefresh(ctrl, state, now);
                if (r === 'wait') return false;
                const pending = sp.pending;
                sp.pending = null;
                if (r !== 'ready') {
                    failCoThan(state, 'sp-refresh', "Máy chủ chưa trả dữ liệu sau khi dùng vật phẩm; dừng bước này.", 'reward');
                    return true;
                }
                const after = ctrl.mainUiDt;
                const grid = (after.gridLs || []).find((x) => x.id === pending.gridId);
                const spent = after.lsPotion < pending.left || after.slPotion < pending.owned;
                if (spent || (grid && grid.isFsh === 1)) {
                    sendLog(`✅ [Cổ Thần Địa] Máy chủ xác nhận đã dùng vật phẩm đặc biệt lên ô #${pending.gridId} (lần ${sp.uses}/${CO_THAN_MAX_SPECIAL_USES}).`, "result");
                } else {
                    failCoThan(state, 'sp-unconfirmed', `Đã dùng vật phẩm lên ô #${pending.gridId} nhưng game chưa ghi nhận; dừng bước này.`, 'reward');
                }
                return true;
            }
            if (!dt) { state.phase = 'reward'; return false; }
            const owned = Number(dt.slPotion) || 0;
            const left = Number(dt.lsPotion) || 0;
            const targets = coThanRemainingBosses(dt).filter((g) => !(sp.denied && sp.denied.has(g.id)));
            if (sp.uses >= CO_THAN_MAX_SPECIAL_USES || owned <= 0 || left <= 0 || !targets.length) {
                const why = sp.uses >= CO_THAN_MAX_SPECIAL_USES ? 'đã đủ số lần'
                    : (!targets.length ? 'không còn ải' : 'hết vật phẩm/lượt');
                sendLog(`ℹ️ [Cổ Thần Địa] Kết thúc dùng vật phẩm đặc biệt (${why}; đã dùng ${sp.uses} lần, còn ${owned} vật phẩm, ${left} lượt).`, "info");
                state.phase = 'reward';
                state.refreshing = null;
                return false;
            }
            if (now - state.idleAt < humanDelay(1400)) return false;
            state.idleAt = now;
            const target = targets[0];
            sp.pending = { gridId: target.id, at: now, owned, left };
            coThanSpecialReply = null;
            state.refreshing = null;
            // Tính ngay lúc gửi (kể cả khi mạng rớt chưa kịp xác nhận) để không bao giờ vượt giới hạn.
            sp.uses++;
            saveCoThanSpecialSent(sp.uses);
            ctrl.send11079(target.id);
            sendLog(`🛡️ [Cổ Thần Địa] Dùng vật phẩm đặc biệt (Cấm Tuyệt Mệnh) lên ô #${target.id}.`, "action");
            return true;
        }

        function coThanReward(ctrl, vm, state, now) {
            const cl = state.claim;
            if (cl.pending) {
                const r = coThanRefresh(ctrl, state, now);
                if (r === 'wait') return false;
                const pending = cl.pending;
                cl.pending = null;
                const entry = (ctrl.mainUiDt && ctrl.mainUiDt.killLs || []).find((k) => k.num === pending.num);
                if (r === 'ready' && entry && entry.status === 2) {
                    cl.done++;
                    sendLog(`✅ [Cổ Thần Địa] Máy chủ xác nhận đã nhận thưởng Diệt Thủ Hộ mốc ${pending.num}.`, "result");
                } else {
                    failCoThan(state, 'claim-unconfirmed', `Đã gửi nhận thưởng mốc ${pending.num} nhưng game chưa ghi nhận; dừng bước này.`);
                }
                return true;
            }
            if (!cl.checked) {
                const r = coThanRefresh(ctrl, state, now);
                if (r === 'wait') return false;
                if (r !== 'ready') { failCoThan(state, 'claim-refresh', "Máy chủ chưa trả dữ liệu thưởng Diệt Thủ Hộ; bỏ qua."); return false; }
                cl.checked = true;
                return true;
            }
            const dt = ctrl.mainUiDt;
            const next = dt && (dt.killLs || []).find((k) => k.status === 1);
            if (!next || cl.done >= CO_THAN_MAX_CLAIMS) {
                sendLog(cl.done
                    ? `ℹ️ [Cổ Thần Địa] Đã nhận ${cl.done} thưởng Diệt Thủ Hộ; không còn mốc nào đủ điều kiện.`
                    : `ℹ️ [Cổ Thần Địa] Chưa có thưởng Diệt Thủ Hộ nào đủ điều kiện nhận (hạ gục ${dt ? dt.killNum : 0}).`, "info");
                state.phase = 'done';
                if (vm.viewIsVisible('adventureTarAwardUi')) vm.closeView('adventureTarAwardUi');
                if (vm.viewIsVisible('adventureMainUi')) ctrl.closeMainUi();
                return true;
            }
            if (now - state.idleAt < humanDelay(1200)) return false;
            state.idleAt = now;
            cl.pending = { num: next.num };
            state.refreshing = null;
            ctrl.send11084(next.num);
            sendLog(`🎁 [Cổ Thần Địa] Nhận thưởng Diệt Thủ Hộ mốc ${next.num}.`, "action");
            return true;
        }

        // Trả về: 'done' | 'acted' | 'wait'.
        function handleCoThanDia(ctx) {
            try {
                if (!ctx.AdvCtrl || !ctx.AdvCtrl.gInst || !ctx.ViewMgr || !ctx.ViewMgr.gInst) {
                    logUnsupportedOnce('co-than', "⚠️ [Cổ Thần Địa] Game chưa sẵn sàng (AdvCtrl); bỏ qua bước này.");
                    return 'done';
                }
                const dayKey = new Date().toDateString();
                if (!coThanState || coThanState.dayKey !== dayKey) {
                    coThanState = createCoThanState();
                    sendLog("🗺️ [Cổ Thần Địa] Bắt đầu/khởi động lại: kiểm tra trạng thái từ game, khiêu chiến ải quanh rồi ải giữa, dùng vật phẩm, nhận thưởng.", "action");
                }
                const state = coThanState;
                if (state.phase === 'done') {
                    logCoThan(state, 'done', state.failed
                        ? "⚠️ [Cổ Thần Địa] Kết thúc nhưng có bước lỗi/chưa xác nhận; sẽ kiểm tra lại khi Auto khởi động lại."
                        : "✅ [Cổ Thần Địa] Đã hoàn tất hôm nay.", state.failed ? "warn" : "action");
                    return 'done';
                }
                const ctrl = ctx.AdvCtrl.gInst();
                const vm = ctx.ViewMgr.gInst();
                const now = Date.now();
                let acted = false;
                if (state.phase === 'open') acted = coThanOpen(ctx, ctrl, vm, state, now);
                else if (state.phase === 'heroes') acted = coThanHeroes(ctrl, vm, state, now);
                else if (state.phase === 'fight') acted = coThanFight(ctx, ctrl, vm, state, now);
                else if (state.phase === 'special') acted = coThanSpecial(ctrl, vm, state, now);
                else if (state.phase === 'reward') acted = coThanReward(ctrl, vm, state, now);
                if (state.phase === 'done') return 'acted';
                return acted ? 'acted' : 'wait';
            } catch (e) {
                const message = `❌ [Cổ Thần Địa] Lỗi: ${e && e.message ? e.message : e}`;
                if (message !== lastCoThanError) {
                    lastCoThanError = message;
                    sendLog(message, "error");
                }
                return 'wait';
            }
        }
        let lastCoThanError = '';
