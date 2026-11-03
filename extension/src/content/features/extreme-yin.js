
        // ============================================================================
        // TỰ ĐỘNG CỰC ÂM ĐỊA (LỊCH LUYỆN) - ExtremeYinCtrl
        // Danh sách Cực Âm Địa, sức chứa (seat), phẩm (quality), thưởng/phút (reward) và thời gian tu luyện (time)
        // lấy từ cấu hình của game (model.getBuildConfig), không đoán cứng.
        //   1. Có chỗ và đã đủ giờ  -> nhận thưởng (send32204).
        //   2. Có chỗ, còn lượt Đoạt miễn phí -> Đoạt tài nguyên người chơi yếu hơn trong cùng địa (send32206).
        //   3. Chưa có chỗ -> chọn địa: từ Huyền Âm Địa trở lên, phẩm cao nhất mà sức mình trên 1/3 yếu nhất của
        //      người đang tu luyện ở đó (tránh bị đánh bật). Còn chỗ thì đánh Thủ Vệ vào (send32202); đầy chỗ thì đánh
        //      Thủ Vệ vào rồi đánh người yếu nhất yếu hơn mình để giành vị trí (send32205). Không địa nào được thì
        //      dùng địa thấp hơn tốt nhất còn chỗ.
        //   4. Hết lượt Đoạt miễn phí (hoặc không còn mục tiêu): vào Chiến Lệnh Cực Âm, nhận phần thưởng miễn phí nếu đủ điều kiện.
        //   Không mua lượt Đoạt bằng Tiên Ngọc. Mỗi bước chỉ tính xong khi dữ liệu máy chủ (32201) xác nhận.
        // ============================================================================
        const EY_REQUEST_TIMEOUT_MS = 20000;
        const EY_FIGHT_TIMEOUT_MS = 90000;
        const EY_SYNC_MIN_MS = 30000;
        const EY_SYNC_MAX_MS = 60000;
        const EY_MAX_PLUNDERS_PER_RUN = 30;
        let extremeYinState = null;
        runResetHooks.push(() => { extremeYinState = null; });

        function createExtremeYinState() {
            return {
                phase: 'sync',            // sync -> (claim | plunder | rob | pick -> enter) -> sync ...
                logged: {},
                refreshing: null,
                nextSyncAt: 0,
                plan: null,               // { landId, name, mode: 'occupy' | 'rob' }
                pick: null,               // { cands, idx, results }
                read: null,               // { landId, mode, at }
                emb: { at: 0, clicked: 0, starts: 0 },
                fight: null,              // { kind, at, target, robBefore }
                claim: null,
                warOrder: { stage: '', refreshing: null, before: 0 },
                warOrderFor: -1,          // số lần Đoạt tại lần kiểm tra Chiến Lệnh gần nhất (-1: chưa kiểm tra)
                plunders: 0,
                plunderBlocked: false,
                idleAt: Date.now()
            };
        }

        function logEy(state, key, message, type) {
            if (state.logged[key]) return;
            state.logged[key] = true;
            sendLog(message, type || "info");
        }

        function eyServerNow(ctx) {
            try { return ctx.NetMgr.gInst().getTime(); } catch (e) { return Math.floor(Date.now() / 1000); }
        }

        // Các địa theo phẩm giảm dần, kèm số người đang tu luyện.
        function eyLands(ctrl) {
            const cfgs = ctrl.getCurlModel().getBuildConfig() || {};
            return Object.keys(cfgs).map((key) => {
                const cfg = cfgs[key];
                const id = Number(cfg && cfg.id !== undefined ? cfg.id : key);
                return {
                    id, cfg, name: cfg.name || `#${id}`, quality: Number(cfg.quality) || 0,
                    seat: Number(cfg.seat) || 0, openLv: Number(cfg.open_lv) || 0,
                    count: ctrl.getLandInfo(id) || 0
                };
            }).filter((l) => l.id > 0).sort((a, b) => b.quality - a.quality);
        }

        function eyIsFull(land) {
            return land.seat > 0 && land.count >= land.seat;
        }

        function eyMyRole() {
            const role = window.RoleCtrl && RoleCtrl.gInst && RoleCtrl.gInst().getRoleInfo();
            return { fc: role ? parseLongVal(role.fc) : 0, level: role ? Number(role.lev) || 0 : 0 };
        }

        // Phẩm tối thiểu: Huyền Âm Địa (tìm theo tên; không thấy thì lấy địa cao thứ 3).
        function eyFloorQuality(lands) {
            const huyen = lands.find((l) => /huyền/i.test(l.name));
            if (huyen) return huyen.quality;
            return lands[Math.min(2, lands.length - 1)].quality;
        }

        // Đọc danh sách người tu luyện qua giao diện của game (mở xem, không gửi hành động tốn lượt).
        // Trả về mảng, null khi chưa xong / hết giờ (state.read giữ trạng thái chờ).
        function eyReadPlayers(ctrl, vm, state, landId, mode, now) {
            if (!state.read || state.read.landId !== landId || state.read.mode !== mode) {
                state.read = { landId, mode, at: now, opened: false };
            }
            const r = state.read;
            const ui = vm.viewIsVisible('extremeYinExerciseUi') ? vm.getViewByName('extremeYinExerciseUi') : null;
            if (!ui || !ui.exData || ui.exData.id !== landId || ui.exData.playerState !== mode) {
                if (!r.opened) {
                    r.opened = true;
                    r.at = now;
                    ctrl.lookExercise(landId, mode);
                    return null;
                }
                if (now - r.at > EY_REQUEST_TIMEOUT_MS) { state.read = null; return 'timeout'; }
                return null;
            }
            if (!ui.bInitFinish || !ui.playerListCol) {
                if (now - r.at > EY_REQUEST_TIMEOUT_MS) { state.read = null; try { vm.closeView('extremeYinExerciseUi'); } catch (e) { } return 'timeout'; }
                return null;
            }
            const src = ui.playerListCol.source || [];
            const players = src.map((it) => ({
                id: it.vo && it.vo.id, idStr: parseUidVal(it.vo && it.vo.id), name: it.vo && it.vo.name, fc: Number(it.fc) || 0,
                robLoss: Number(it.vo && it.vo.rob_loss) || 0, startTime: Number(it.start_time) || 0,
                quantity: Number(it.quantity) || 0, limitTime: Number(it.limitTime) || 0
            }));
            state.read = null;
            try { vm.closeView('extremeYinExerciseUi'); } catch (e) { }
            return players;
        }

        // Bảng đội hình jyzd: xếp tự động rồi bấm xác nhận (giống người chơi). 'acted' | 'wait' | 'none'.
        function eyEmbattleStep(ctx, vm, state, now) {
            if (!vm.viewIsVisible('embattleUi')) { state.emb = { at: 0, clicked: 0, starts: 0 }; return 'none'; }
            const ui = vm.getViewByName('embattleUi');
            const type = ctx.EmbattleConst && ctx.EmbattleConst.embattleType && ctx.EmbattleConst.embattleType.jyzd;
            if (!ui || type === undefined || ui.embattleType !== type) return 'none';
            // Bấm "Lên trận nhanh", kiểm tra ô đội hình có tướng, mới bấm "Bắt đầu".
            const step = embattleStep(ui, state.emb, now);
            if (step === 'wait') return 'wait';
            if (step === 'arranged') return 'acted';
            if (step === 'failed') {
                const diag = embattleDiagnose(ui, state.emb);
                try { vm.closeView('embattleUi'); } catch (e) { }
                sendLog(`❌ [Cực Âm Địa] Không xếp được đội hình sau ${EMBATTLE_ARRANGE_TRIES} lần Lên trận nhanh (${diag}); không khiêu chiến, sẽ kiểm tra lại sau.`, "error");
                state.emb = { at: 0, clicked: 0, starts: 0 };
                state.fight = null;
                state.nextSyncAt = now + 120000;
                state.phase = 'wait';
                return 'acted';
            }
            if (typeof ui.cBtnH2 !== 'function') return 'none';
            embattleMarkStarted(state.emb);
            ui.cBtnH2();
            return 'acted';
        }

        function eySync(ctrl, state, now) {
            return pollTowerDailyRefresh(state, 'refreshing', now, () => { ctrl.send32201(); ctrl.send32200(); }, () => ctrl.playerData);
        }

        function eyAfterSync(ctx, ctrl, state, now) {
            const pd = ctrl.getPlayerData();
            const model = ctrl.getCurlModel();
            if (ctrl.bHaveSeat()) {
                const cfg = model.getBuildCfgVo(pd.id);
                const elapsed = eyServerNow(ctx) - pd.start_time;
                if (cfg && elapsed >= cfg.time) { state.phase = 'claim'; return; }
                const left = ctrl.getFreeCount() + (Number(pd.buy_times) || 0) - (Number(pd.rob_times) || 0);
                if (left > 0 && !state.plunderBlocked && state.plunders < EY_MAX_PLUNDERS_PER_RUN) {
                    state.phase = 'plunder';
                    state.idleAt = now;
                    return;
                }
                // Hết lượt Đoạt: kiểm tra Chiến Lệnh Cực Âm (lại sau mỗi đợt Đoạt mới).
                if (state.warOrderFor !== state.plunders) {
                    state.phase = 'warorder';
                    state.warOrder = { stage: '', refreshing: null, before: 0 };
                    state.idleAt = now;
                    return;
                }
                const remain = cfg ? Math.max(0, cfg.time - elapsed) : 60;
                logEy(state, `train-${pd.start_time}`, `🧘 [Cực Âm Địa] Đang tu luyện ${cfg ? cfg.name : '#' + pd.id} (còn ${Math.floor(remain / 60)}p${remain % 60}s, lượt Đoạt còn ${Math.max(0, left)}).`, "info");
                state.nextSyncAt = now + Math.min(Math.max(remain * 1000 + 2000, EY_SYNC_MIN_MS), EY_SYNC_MAX_MS * 3);
                state.phase = 'wait';
                return;
            }
            state.plunders = 0;
            state.plunderBlocked = false;
            state.warOrderFor = -1;
            if (ctrl.bEnterLand()) {
                state.plan = { landId: pd.id, name: model.getBuildName(pd.id), mode: 'rob' };
                state.phase = 'rob';
                state.idleAt = now;
                sendLog(`🛡️ [Cực Âm Địa] Đã vào ${state.plan.name} nhưng chưa có chỗ; đánh người yếu hơn để giành vị trí.`, "action");
                return;
            }
            state.pick = null;
            state.phase = 'pick';
        }

        // Chọn địa: phẩm cao nhất (>= Huyền Âm) mà sức mình trên 1/3 yếu nhất; hết cách thì địa thấp hơn còn chỗ.
        function eyPick(ctx, ctrl, vm, state, now) {
            const lands = eyLands(ctrl);
            if (!lands.length) { logEy(state, 'no-cfg', "⚠️ [Cực Âm Địa] Không đọc được cấu hình các địa; bỏ qua.", "warn"); state.nextSyncAt = now + 120000; state.phase = 'wait'; return false; }
            const me = eyMyRole();
            const floor = eyFloorQuality(lands);
            if (!state.pick) {
                const cands = lands.filter((l) => l.quality >= floor && (!l.openLv || me.level >= l.openLv));
                state.pick = { cands, idx: 0, chosen: null };
            }
            const p = state.pick;
            if (p.idx < p.cands.length) {
                const land = p.cands[p.idx];
                const players = eyReadPlayers(ctrl, vm, state, land.id, 'lookState', now);
                if (players === null) return false;
                if (players === 'timeout') { p.idx++; return true; }
                const fcs = players.map((x) => x.fc).sort((a, b) => a - b);
                const threshold = fcs.length ? fcs[Math.floor(fcs.length / 3)] : 0;
                const safe = me.fc >= threshold;
                const full = eyIsFull(land);
                const weaker = players.filter((x) => x.fc < me.fc).sort((a, b) => a.fc - b.fc);
                if (safe && (!full || weaker.length)) {
                    p.chosen = { land, mode: full ? 'rob' : 'occupy' };
                    sendLog(`🎯 [Cực Âm Địa] Chọn ${land.name} (${land.count}/${land.seat || '∞'}; sức tôi ${me.fc.toLocaleString('vi-VN')}, ngưỡng an toàn ${threshold.toLocaleString('vi-VN')}${full ? ', đầy chỗ → sẽ giành vị trí' : ''}).`, "action");
                } else {
                    sendLog(`ℹ️ [Cực Âm Địa] Bỏ qua ${land.name}: ${!safe ? `sức tôi thấp hơn ngưỡng an toàn (${me.fc.toLocaleString('vi-VN')} < ${threshold.toLocaleString('vi-VN')})` : 'đầy chỗ và không có người yếu hơn để giành vị trí'}.`, "info");
                    p.idx++;
                    return true;
                }
            }
            if (!p.chosen) {
                // Địa thấp hơn tốt nhất còn chỗ (người dùng cho phép khi không địa nào từ Huyền Âm trở lên dùng được).
                const lower = lands.filter((l) => l.quality < floor && !eyIsFull(l) && (!l.openLv || me.level >= l.openLv))[0];
                if (!lower) {
                    logEy(state, 'nothing', "⏸️ [Cực Âm Địa] Không địa nào còn chỗ hoặc phù hợp sức hiện tại; sẽ kiểm tra lại sau.", "warn");
                    state.nextSyncAt = now + 180000;
                    state.phase = 'wait';
                    state.pick = null;
                    return false;
                }
                p.chosen = { land: lower, mode: 'occupy' };
                sendLog(`ℹ️ [Cực Âm Địa] Không địa nào từ Huyền Âm trở lên dùng được; chọn ${lower.name} (${lower.count}/${lower.seat || '∞'}).`, "info");
            }
            state.plan = { landId: p.chosen.land.id, name: p.chosen.land.name, mode: p.chosen.mode };
            state.pick = null;
            state.logged = {};
            state.phase = 'enter';
            state.fight = null;
            state.idleAt = now;
            return true;
        }

        // Đánh Thủ Vệ để vào địa đã chọn; xác nhận khi dữ liệu người chơi báo đã vào địa.
        function eyEnter(ctx, ctrl, vm, state, now) {
            const plan = state.plan;
            const emb = eyEmbattleStep(ctx, vm, state, now);
            if (emb !== 'none') return emb === 'acted';
            if (state.fight) {
                if (now - state.fight.at < 4000) return false;
                const r = eySync(ctrl, state, now);
                if (r === 'wait') return false;
                const pd = ctrl.getPlayerData();
                if (r === 'ready' && pd && pd.id === plan.landId) {
                    state.fight = null;
                    clearTargetAttempts('ey-enter-' + plan.landId);
                    if (ctrl.bHaveSeat()) {
                        sendLog(`✅ [Cực Âm Địa] Máy chủ xác nhận đã có chỗ tu luyện ở ${plan.name}.`, "result");
                        state.phase = 'sync'; state.refreshing = null; state.nextSyncAt = 0;
                    } else {
                        sendLog(`✅ [Cực Âm Địa] Đã vào ${plan.name} nhưng đầy chỗ; chuyển sang giành vị trí.`, "action");
                        state.plan = { landId: plan.landId, name: plan.name, mode: 'rob' };
                        state.phase = 'rob'; state.refreshing = null;
                    }
                    return true;
                }
                if (now - state.fight.at > EY_FIGHT_TIMEOUT_MS) {
                    state.fight = null;
                    sendLog(`❌ [Cực Âm Địa] Máy chủ chưa xác nhận đã vào ${plan.name}; không gửi lại, sẽ kiểm tra lại sau.`, "error");
                    state.nextSyncAt = now + 60000; state.phase = 'wait'; state.refreshing = null;
                }
                return false;
            }
            if (now - state.idleAt < humanDelay(1200)) return false;
            if (!tryAttemptTarget('ey-enter-' + plan.landId, `[Cực Âm Địa] Vào ${plan.name}`)) {
                sendLog(`❌ [Cực Âm Địa] Vào ${plan.name} nhiều lần vẫn chưa được; dừng, sẽ thử lại khi Auto khởi động lại.`, "error");
                state.nextSyncAt = now + 600000; state.phase = 'wait';
                return false;
            }
            const fc = ctx.FightCtrl && ctx.FightCtrl.gInst && ctx.FightCtrl.gInst();
            if (fc && typeof fc.gCanFight === 'function' && !fc.gCanFight(0)) { clearTargetAttempts('ey-enter-' + plan.landId); return false; }
            state.idleAt = now;
            state.fight = { kind: 'enter', at: now };
            state.refreshing = null;
            ctrl.chanllenge(plan.landId);
            sendLog(`⚔️ [Cực Âm Địa] Khiêu chiến Thủ Vệ ${plan.name}; chờ bảng đội hình.`, "action");
            return true;
        }

        // Chọn mục tiêu từ danh sách (mode: challengeState | plunderState) và đánh qua bảng đội hình.
        function eyFightPlayer(ctx, ctrl, vm, state, now, mode, label) {
            const emb = eyEmbattleStep(ctx, vm, state, now);
            if (emb !== 'none') return { acted: emb === 'acted' };
            const me = eyMyRole();
            const landId = state.plan.landId;
            if (state.fight) {
                const f = state.fight;
                if (now - f.at < 4000) return { acted: false };
                const r = eySync(ctrl, state, now);
                if (r === 'wait') return { acted: false };
                state.fight = null;
                return { done: true, ready: r === 'ready', fight: f };
            }
            if (now - state.idleAt < humanDelay(1200)) return { acted: false };
            const players = eyReadPlayers(ctrl, vm, state, landId, mode, now);
            if (players === null) return { acted: false };
            if (players === 'timeout') return { failed: 'timeout' };
            const nowSec = eyServerNow(ctx);
            let pool = players.filter((x) => x.id && x.fc < me.fc);
            if (mode === 'plunderState') {
                pool.forEach((x) => {
                    const mins = Math.max(0, Math.floor(Math.min(nowSec - x.startTime, x.limitTime) / 60));
                    x.steal = Math.max(0, mins * x.quantity - x.robLoss);
                });
                pool = pool.filter((x) => x.steal > 0).sort((a, b) => b.steal - a.steal);
            } else {
                pool.sort((a, b) => a.fc - b.fc);
            }
            if (!pool.length) return { failed: 'no-target' };
            const target = pool[0];
            if (!tryAttemptTarget(`ey-${mode}-${landId}-${state.plunders}-${target.idStr}`, `[Cực Âm Địa] ${label} ${target.name}`)) return { failed: 'attempts' };
            const fc = ctx.FightCtrl && ctx.FightCtrl.gInst && ctx.FightCtrl.gInst();
            if (fc && typeof fc.gCanFight === 'function' && !fc.gCanFight(0)) return { acted: false };
            state.idleAt = now;
            const pd = ctrl.getPlayerData();
            state.fight = { kind: mode, at: now, target, robBefore: pd ? Number(pd.rob_times) || 0 : 0 };
            state.refreshing = null;
            ctrl.openEmBattle({ id: landId, role_id: target.id, bAutoOpenRecord: false, playerState: mode });
            sendLog(`⚔️ [Cực Âm Địa] ${label} ${target.name} (sức ${target.fc.toLocaleString('vi-VN')}${target.steal !== undefined ? `, có thể đoạt ~${target.steal}` : ''}); chờ bảng đội hình.`, "action");
            return { acted: true };
        }

        function eyRob(ctx, ctrl, vm, state, now) {
            const r = eyFightPlayer(ctx, ctrl, vm, state, now, 'challengeState', 'Giành vị trí từ');
            if (r.failed) {
                sendLog(`⏸️ [Cực Âm Địa] Chưa giành được vị trí (${r.failed}); sẽ kiểm tra lại sau.`, "warn");
                state.nextSyncAt = now + 90000; state.phase = 'wait';
                return false;
            }
            if (r.done) {
                if (r.ready && ctrl.bHaveSeat()) {
                    sendLog(`✅ [Cực Âm Địa] Máy chủ xác nhận đã giành được vị trí ở ${state.plan.name}.`, "action");
                    state.phase = 'sync'; state.refreshing = null; state.nextSyncAt = 0;
                } else {
                    sendLog("ℹ️ [Cực Âm Địa] Trận giành vị trí kết thúc nhưng chưa có chỗ; thử người khác.", "info");
                    state.phase = 'rob';
                }
                return true;
            }
            return !!r.acted;
        }

        function eyPlunder(ctx, ctrl, vm, state, now) {
            state.plan = { landId: ctrl.getLandId(), name: ctrl.getCurlModel().getBuildName(ctrl.getLandId()), mode: 'seated' };
            const r = eyFightPlayer(ctx, ctrl, vm, state, now, 'plunderState', 'Đoạt tài nguyên của');
            if (r.failed) {
                logEy(state, 'plunder-' + r.failed, r.failed === 'no-target'
                    ? "ℹ️ [Cực Âm Địa] Không có người nào yếu hơn mà còn tài nguyên để Đoạt; bỏ qua lượt Đoạt lần này."
                    : `⏸️ [Cực Âm Địa] Dừng Đoạt (${r.failed}).`, "info");
                state.plunderBlocked = true; state.phase = 'sync'; state.refreshing = null; state.nextSyncAt = 0;
                return false;
            }
            if (r.done) {
                const pd = ctrl.getPlayerData();
                const used = pd ? Number(pd.rob_times) || 0 : 0;
                if (r.ready && used > r.fight.robBefore) {
                    state.plunders++;
                    sendLog(`✅ [Cực Âm Địa] Máy chủ xác nhận đã Đoạt ${r.fight.target.name} (lượt Đoạt đã dùng ${used}).`, "result");
                } else {
                    state.plunderBlocked = true;
                    sendLog("⚠️ [Cực Âm Địa] Đã đánh nhưng máy chủ chưa ghi nhận lượt Đoạt; dừng Đoạt lần này.", "warn");
                }
                state.phase = 'sync'; state.refreshing = null; state.nextSyncAt = 0;
                return true;
            }
            return !!r.acted;
        }

        function eyWarOrder(ctx, vm, state, now) {
            if (now - state.idleAt < humanDelay(1200)) return false;
            const r = warOrderClaimStep(ctx, vm, state.warOrder, { label: 'Cực Âm Địa', typeKey: 'zhanLingType_6', fallbackType: 6, termId: 1 }, now);
            if (r.status === 'done') {
                state.warOrderFor = state.plunders;
                state.phase = 'sync'; state.refreshing = null; state.nextSyncAt = 0;
                return true;
            }
            return r.status === 'acted';
        }

        function eyClaim(ctx, ctrl, state, now) {
            const pd = ctrl.getPlayerData();
            if (!state.claim) {
                state.claim = { id: pd.id, at: now };
                state.refreshing = null;
                sendLog(`🏆 [Cực Âm Địa] Đã tu luyện xong ${ctrl.getCurlModel().getBuildName(pd.id)}; nhận thưởng.`, "success");
                ctrl.send32204(pd.id);
                return true;
            }
            if (now - state.claim.at < 2500) return false;
            const r = eySync(ctrl, state, now);
            if (r === 'wait') return false;
            const c = state.claim;
            state.claim = null;
            if (r === 'ready' && !ctrl.bHaveSeat()) {
                sendLog("✅ [Cực Âm Địa] Máy chủ xác nhận đã nhận thưởng; sẽ chọn địa mới.", "result");
            } else {
                sendLog("⚠️ [Cực Âm Địa] Đã gửi nhận thưởng nhưng dữ liệu chưa đổi; kiểm tra lại sau, không gửi lại ngay.", "warn");
                state.nextSyncAt = now + 60000; state.phase = 'wait'; return true;
            }
            state.phase = 'sync'; state.refreshing = null; state.nextSyncAt = 0;
            return true;
        }

        function handleExtremeYin(ctx) {
            try {
                if (!ctx.ExtremeYinCtrl || !ctx.ExtremeYinCtrl.gInst || !ctx.ViewMgr || !ctx.ViewMgr.gInst) return false;
                const ctrl = ctx.ExtremeYinCtrl.gInst();
                const vm = ctx.ViewMgr.gInst();
                if (!extremeYinState) {
                    extremeYinState = createExtremeYinState();
                    sendLog("🧘 [Cực Âm Địa] Bắt đầu/khởi động lại: kiểm tra trạng thái từ game rồi tu luyện/Đoạt.", "action");
                }
                const state = extremeYinState;
                const now = Date.now();
                switch (state.phase) {
                    case 'wait':
                        if (now >= state.nextSyncAt) { state.phase = 'sync'; state.refreshing = null; }
                        return true;
                    case 'sync': {
                        if (now < state.nextSyncAt) return true;
                        const r = eySync(ctrl, state, now);
                        if (r === 'wait') return true;
                        if (r !== 'ready') {
                            sendLog("❌ [Cực Âm Địa] Máy chủ chưa trả dữ liệu Cực Âm Địa; thử lại sau.", "error");
                            state.nextSyncAt = now + 60000;
                            return true;
                        }
                        eyAfterSync(ctx, ctrl, state, now);
                        return true;
                    }
                    case 'claim': return eyClaim(ctx, ctrl, state, now) || true;
                    case 'pick': return eyPick(ctx, ctrl, vm, state, now) || true;
                    case 'enter': return eyEnter(ctx, ctrl, vm, state, now) || true;
                    case 'rob': return eyRob(ctx, ctrl, vm, state, now) || true;
                    case 'plunder': return eyPlunder(ctx, ctrl, vm, state, now) || true;
                    case 'warorder': return eyWarOrder(ctx, vm, state, now) || true;
                    default: state.phase = 'sync'; return true;
                }
            } catch (e) {
                const message = `❌ [Cực Âm Địa] Lỗi: ${e && e.message ? e.message : e}`;
                if (message !== lastExtremeYinError) {
                    lastExtremeYinError = message;
                    sendLog(message, "error");
                }
                return true;
            }
        }
        let lastExtremeYinError = '';
