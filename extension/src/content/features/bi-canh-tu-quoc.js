
        // [Module 2b] Bí Cảnh Tứ Quốc (DailyDungeonCtrl, loại fairyland; màn faMainUi -> faSelectUi -> embattleUi).
        // Máy chủ (send11004 loại fairyland) chỉ trả ải của các tháp ĐANG MỞ hôm nay; tháp k (1..4) = round(id/1000)%10.
        // Quy trình giống người chơi, mỗi nhịp một việc:
        //   1. Mở Bí Cảnh Tứ Quốc, đọc danh sách tháp đang mở và số lượt miễn phí dùng chung
        //      (isActive: day+privilege-(enter-buy), ngược lại day-enter).
        //   2. Lần lượt từng tháp: khiêu chiến các ải CHƯA vượt theo thứ tự (tối đa BICANH_MAX_NEW_FLOORS ải/tháp),
        //      xếp đội tự động, bỏ qua trận. Đánh một ải tối đa 2 lần rồi bỏ tháp đó (tránh lặp khi thua).
        //   3. Khi không còn ải mới để đánh: quét ải cuối (ải đã vượt cao nhất của tháp mở cuối cùng) tới hết lượt miễn phí.
        // Không bao giờ mua lượt: chỉ bấm khi còn lượt miễn phí (hết lượt game sẽ hỏi mua bằng Tiên Ngọc, ở đây không gửi).
        // Chỉ ghi "đã" khi dữ liệu máy chủ xác nhận (enter_count tăng / ải chuyển sang đã vượt); thiếu phản hồi thì báo lỗi, không gửi lại.
        const BICANH_MAX_NEW_FLOORS = 10;
        const BICANH_MAX_SWEEPS = 15;
        const BICANH_FIGHT_TIMEOUT_MS = 90000;
        let biCanhState = null;
        runResetHooks.push(() => {
            if (biCanhState && biCanhState.failed && biCanhState.phase === 'done') biCanhState = null;
        });

        function biCanhFinish(state, message, type, failed) {
            state.phase = 'done';
            if (failed) state.failed = true;
            sendLog(message, type || "info");
        }

        function biCanhFree(dd, data) {
            const day = Number(data.day_count) || 0, enter = Number(data.enter_count) || 0;
            const buy = Number(data.buy_count) || 0, priv = Number(data.privilege_count) || 0;
            return dd.isActive ? day + priv - (enter - buy) : day - enter;
        }

        // { copyType: [item sắp theo dungeon_id] } chỉ gồm các tháp đang mở.
        function biCanhTowers(data) {
            const map = {};
            (data.dungeon_data_list || []).forEach((it) => {
                const k = Math.round(it.dungeon_id / 1000) % 10;
                (map[k] = map[k] || []).push(it);
            });
            Object.keys(map).forEach((k) => map[k].sort((a, b) => a.dungeon_id - b.dungeon_id));
            return map;
        }

        function handleBiCanhTuQuoc(ctx) {
            const types = ctx.DailyDungeonConst && ctx.DailyDungeonConst.dailyDungeonType;
            if (!ctx.DailyDungeonCtrl || !ctx.ViewMgr || !ctx.EmbattleConst || !types || typeof types.fairyland !== 'number') return false;
            const dayKey = new Date().toDateString();
            if (!biCanhState || biCanhState.dayKey !== dayKey) {
                biCanhState = { dayKey, phase: 'open', failed: false, refreshing: null, pending: null,
                    selected: 0, newFloors: {}, blocked: {}, sweeps: 0, emb: null, listedOpen: false };
                sendLog("🏯 [M2 - Bí Cảnh Tứ Quốc] Bắt đầu: mở Bí Cảnh, đánh ải mới từng tháp đang mở rồi quét ải cuối bằng lượt miễn phí.", "action");
            }
            const state = biCanhState;
            if (state.phase === 'done') return false;

            const FL = types.fairyland;
            const dd = ctx.DailyDungeonCtrl.gInst();
            const vm = ctx.ViewMgr.gInst();
            const now = Date.now();
            const data = () => dd.getDungeonData(FL);
            const tokenOf = () => { const d = data(); return d && d.his_list; };
            const closeUis = () => {
                ['faSelectUi', 'faMainUi'].forEach((n) => { try { if (vm.viewIsVisible(n)) vm.closeView(n); } catch (e) { } });
            };
            const stop = (ok, msg) => { biCanhFinish(state, msg, ok ? "result" : "error", !ok); closeUis(); return true; };

            try {
                if (ctx.FunOpenCtrl && ctx.FunOpenType && ctx.FunOpenType.FAIRYLAND !== undefined &&
                    !ctx.FunOpenCtrl.gInst().check(ctx.FunOpenType.FAIRYLAND, false)) {
                    biCanhFinish(state, "ℹ️ [M2 - Bí Cảnh Tứ Quốc] Chức năng chưa mở khóa (chưa đủ cấp độ); bỏ qua.", "info");
                    return false;
                }
            } catch (e) { }

            // --- đang chờ kết quả một thao tác ---
            if (state.pending) {
                const p = state.pending;
                const d = data();
                if (!vm.viewIsVisible('embattleUi')) state.emb = null;
                if (p.kind === 'fight' && !p.started && vm.viewIsVisible('embattleUi')) {
                    const embUi = vm.getViewByName('embattleUi');
                    const et = ctx.EmbattleConst.embattleType;
                    if (embUi && embUi.embattleType >= et.fairyland_wei && embUi.embattleType <= et.fairyland_qun) {
                        // Bấm "Lên trận nhanh", kiểm tra ô đội hình có tướng, mới bấm "Khiêu Chiến" (Bắt đầu).
                        if (!state.emb) state.emb = { at: 0, clicked: 0, starts: 0 };
                        const step = embattleStep(embUi, state.emb, now);
                        if (step === 'wait') return false;
                        if (step === 'arranged') {
                            sendLog(`🏯 [M2 - Bí Cảnh Tứ Quốc] Đã bấm Lên trận nhanh (lần ${state.emb.clicked}); kiểm tra đội hình.`, "action");
                            return true;
                        }
                        if (step === 'failed') {
                            const diag = embattleDiagnose(embUi, state.emb);
                            state.pending = null;
                            state.emb = null;
                            try { vm.closeView('embattleUi'); } catch (e) { }
                            return stop(false, "❌ [M2 - Bí Cảnh Tứ Quốc] Không xếp được đội hình sau " + EMBATTLE_ARRANGE_TRIES + " lần Lên trận nhanh (" + diag + "); không khiêu chiến, dừng.");
                        }
                        if (typeof embUi.cBtnH2 !== 'function') {
                            state.pending = null;
                            return stop(false, "❌ [M2 - Bí Cảnh Tứ Quốc] Bảng đội hình không có nút Khiêu Chiến (bản game đổi); dừng.");
                        }
                        embattleMarkStarted(state.emb);
                        embUi.cBtnH2();
                        p.started = true;          // đã bấm: chỉ chờ kết quả, không bấm lại dù bảng còn hiện dưới bảng kết quả
                        p.startedAt = now;
                        sendLog("⚔️ [M2 - Bí Cảnh Tứ Quốc] Đã bấm Khiêu Chiến; chờ máy chủ xác nhận.", "action");
                        return true;
                    }
                }
                if (d && Number(d.enter_count) > p.beforeEnter) {
                    // Lượt đã bị trừ: tải lại dữ liệu để xem ải đã vượt chưa.
                    const r = pollTowerDailyRefresh(p, 'refreshing', now, () => dd.send11004(FL), tokenOf);
                    if (r === 'wait') return false;
                    if (r === 'timeout' || r === 'error') {
                        state.pending = null;
                        return stop(false, "❌ [M2 - Bí Cảnh Tứ Quốc] Không tải lại được dữ liệu Bí Cảnh sau khi đánh/quét; dừng, không gửi lại.");
                    }
                    state.pending = null;
                    const nd = data();
                    const free = nd ? biCanhFree(dd, nd) : 0;
                    const item = ((nd && nd.dungeon_data_list) || []).find((it) => it.dungeon_id === p.id);
                    if (p.kind === 'sweep') {
                        state.sweeps++;
                        sendLog(`✅ [M2 - Bí Cảnh Tứ Quốc] Máy chủ xác nhận đã quét ải #${p.id} (lần ${state.sweeps}; còn ${free} lượt miễn phí).`, "result");
                    } else if (item && item.is_pass) {
                        state.newFloors[p.k] = (state.newFloors[p.k] || 0) + 1;
                        sendLog(`✅ [M2 - Bí Cảnh Tứ Quốc] Máy chủ xác nhận đã vượt ải #${p.id} (tháp ${p.k}, ải mới ${state.newFloors[p.k]}/${BICANH_MAX_NEW_FLOORS}; còn ${free} lượt miễn phí).`, "action");
                    } else {
                        sendLog(`⚠️ [M2 - Bí Cảnh Tứ Quốc] Đã đánh ải #${p.id} (tháp ${p.k}) nhưng chưa vượt (thua?); còn ${free} lượt miễn phí.`, "warn");
                    }
                    return true;
                }
                if (now - p.startedAt >= BICANH_FIGHT_TIMEOUT_MS) {
                    state.pending = null;
                    if (p.kind === 'fight') state.blocked[p.k] = true;
                    sendLog(`❌ [M2 - Bí Cảnh Tứ Quốc] Máy chủ chưa xác nhận ${p.kind === 'fight' ? 'trận đánh' : 'lượt quét'} ải #${p.id}; không gửi lại.`, "error");
                    if (p.kind === 'sweep') return stop(false, "❌ [M2 - Bí Cảnh Tứ Quốc] Dừng quét vì máy chủ không xác nhận.");
                    return true;
                }
                if (now - p.startedAt >= 3000 && now - p.lastPoll >= 2000) {
                    p.lastPoll = now;
                    try { dd.send11004(FL); } catch (e) { }
                }
                return false;
            }

            // --- mở màn và tải dữ liệu ---
            if (state.phase === 'open') {
                if (!vm.viewIsVisible('faMainUi') && !vm.viewIsVisible('faSelectUi')) {
                    if (!tryAttemptTarget('bicanh-open', "[M2 - Bí Cảnh Tứ Quốc] Mở màn Bí Cảnh")) {
                        return stop(false, "❌ [M2 - Bí Cảnh Tứ Quốc] Không mở được màn Bí Cảnh; bỏ qua.");
                    }
                    dd.openFaMainUi();
                    return true;
                }
                state.phase = 'load';
                return true;
            }
            if (state.phase === 'load') {
                const r = pollTowerDailyRefresh(state, 'refreshing', now, () => { dd.send11008(); dd.send11004(FL); }, tokenOf);
                if (r === 'ready') state.phase = 'run';
                else if (r === 'timeout' || r === 'error') return stop(false, "❌ [M2 - Bí Cảnh Tứ Quốc] Không tải được dữ liệu Bí Cảnh từ máy chủ; bỏ qua.");
                return r !== 'wait';
            }

            // --- phase 'run': chọn việc kế tiếp ---
            const d = data();
            if (!d || !Array.isArray(d.dungeon_data_list)) return stop(false, "❌ [M2 - Bí Cảnh Tứ Quốc] Thiếu dữ liệu danh sách ải; dừng.");
            const towers = biCanhTowers(d);
            const keys = Object.keys(towers).map(Number).sort((a, b) => a - b);
            if (!keys.length) return stop(true, "ℹ️ [M2 - Bí Cảnh Tứ Quốc] Hôm nay không có tháp nào đang mở; bỏ qua.");
            const free = biCanhFree(dd, d);
            if (!state.listedOpen) {
                state.listedOpen = true;
                sendLog(`🏯 [M2 - Bí Cảnh Tứ Quốc] Tháp đang mở: ${keys.map((k) => '#' + k).join(', ')}; lượt miễn phí ${free}.`, "info");
            }
            if (free <= 0) return stop(true, "✅ [M2 - Bí Cảnh Tứ Quốc] Đã dùng hết lượt miễn phí hôm nay.");

            const send = (k, item, kind) => {
                if (state.selected !== k) { dd.openFaSelUi(k); state.selected = k; return true; }
                // Giống dòng ải trong danh sách của game: cliFaSelItem(nút, cấu hình ải, dòng dữ liệu). Tham số 2 PHẢI là
                // cấu hình ải (có .id): game lưu ải đang chọn bằng saveFaId(e.id), bảng đội hình và nút "Lên trận nhanh" cần nó.
                const model = typeof dd.getCurlModel === 'function' ? dd.getCurlModel() : dd.m_curModel;
                const baseVo = model && typeof model.getDungeonBaseConfigVo === 'function' ? model.getDungeonBaseConfigVo(item.dungeon_id) : null;
                if (!baseVo || baseVo.id === undefined) {
                    return stop(false, `❌ [M2 - Bí Cảnh Tứ Quốc] Không đọc được cấu hình ải #${item.dungeon_id}; dừng.`);
                }
                const fightCtrl = ctx.FightCtrl && ctx.FightCtrl.gInst && ctx.FightCtrl.gInst();
                if (fightCtrl && typeof fightCtrl.gCanFight === 'function' && !fightCtrl.gCanFight()) return false;
                const tries = kind === 'fight' ? 2 : BICANH_MAX_SWEEPS;
                if (!tryAttemptTarget(`bicanh-${kind}-${item.dungeon_id}`, `[M2 - Bí Cảnh Tứ Quốc] ${kind === 'fight' ? 'Khiêu chiến' : 'Quét'} ải #${item.dungeon_id}`, tries)) {
                    if (kind === 'fight') { state.blocked[k] = true; return true; }
                    return stop(false, "❌ [M2 - Bí Cảnh Tứ Quốc] Quét quá số lần thử; dừng.");
                }
                state.emb = null;
                state.pending = { kind, id: item.dungeon_id, k, beforeEnter: Number(d.enter_count) || 0, startedAt: now, lastPoll: now };
                sendLog(`${kind === 'fight' ? '⚔️' : '🔁'} [M2 - Bí Cảnh Tứ Quốc] ${kind === 'fight' ? 'Khiêu chiến ải mới' : 'Quét ải cuối'} #${item.dungeon_id} (tháp ${k}; còn ${free} lượt miễn phí).`, "action");
                dd.cliFaSelItem({ label: '' }, baseVo, item);
                return true;
            };

            for (const k of keys) {
                if (state.blocked[k] || (state.newFloors[k] || 0) >= BICANH_MAX_NEW_FLOORS) continue;
                const next = towers[k].find((it) => !it.is_pass);
                if (next) return send(k, next, 'fight');
            }
            // Không còn ải mới: quét ải đã vượt cao nhất của tháp mở cuối cùng.
            const lastK = keys[keys.length - 1];
            const passed = towers[lastK].filter((it) => it.is_pass);
            if (!passed.length) return stop(true, "ℹ️ [M2 - Bí Cảnh Tứ Quốc] Không có ải đã vượt để quét; kết thúc.");
            if (state.sweeps >= BICANH_MAX_SWEEPS) return stop(false, "❌ [M2 - Bí Cảnh Tứ Quốc] Quét quá số lần cho phép trong một lượt; dừng.");
            return send(lastK, passed[passed.length - 1], 'sweep');
        }
