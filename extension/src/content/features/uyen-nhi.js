
        // [Module 4a] Cửu Uyển Nhi (MzCtrl, giao diện mzUi): chỉ bấm "Quét nhanh" khi game cho phép.
        // Nút Quét nhanh (saoDangBtn) chỉ hiện khi đủ điều kiện (đủ ngày mở / đủ lần vượt khó); bấm nút
        // game hỏi xác nhận rồi gửi sd20221, nên ở đây gọi thẳng sd20221 như nút xác nhận. Xác nhận thành công
        // khi máy chủ trả lời và game đặt cờ isCAwrd (rv20221). Mỗi ngày tối đa một lần gửi.
        // Sau khi quét (hoặc nếu chưa quét được): nhận Thưởng Ải (sd20223) rồi Chiến Lệnh (sd20232), chỉ phần miễn phí đã đủ điều kiện.
        // Trả về: 'done' (đã xong / không có gì làm) | 'acted' (vừa thao tác) | 'wait' (đang chờ game).
        const UYEN_NHI_TIMEOUT_MS = 20000;
        const UYEN_NHI_SETTLE_MS = 1500;      // chờ máy chủ trả danh sách thưởng sau khi tải
        let uyenNhiState = null;
        let uyenNhiVm = null;
        runResetHooks.push(() => {
            if (uyenNhiState && uyenNhiState.failed && uyenNhiState.phase === 'done') uyenNhiState = null;
        });

        function uyenNhiFinish(state, message, type, failed) {
            try {
                const vm = uyenNhiVm;
                if (vm && vm.viewIsVisible('mzFinish')) vm.closeView('mzFinish');
            } catch (e) { }
            state.phase = 'done';
            if (failed) state.failed = true;
            sendLog(message, type || "info");
        }

        function handleUyenNhi(ctx) {
            if (!ctx.MzCtrl || !ctx.MzCtrl.gInst || !ctx.ViewMgr || !ctx.ViewMgr.gInst) {
                logUnsupportedOnce('uyen-nhi', "⚠️ [Cửu Uyển Nhi] Game chưa sẵn sàng (MzCtrl); bỏ qua bước này.");
                return 'done';
            }
            const dayKey = new Date().toDateString();
            if (!uyenNhiState || uyenNhiState.dayKey !== dayKey) {
                uyenNhiState = { dayKey, phase: 'open', failed: false, openedAt: 0, sentAt: 0 };
                sendLog("🧩 [Cửu Uyển Nhi] Bắt đầu/khởi động lại: mở màn Cửu Uyển Nhi và kiểm tra nút Quét nhanh từ game.", "action");
            }
            const state = uyenNhiState;
            if (state.phase === 'done') return 'done';

            const ctrl = ctx.MzCtrl.gInst();
            const vm = ctx.ViewMgr.gInst();
            uyenNhiVm = vm;
            const now = Date.now();
            const mzVisible = vm.viewIsVisible('mzUi');
            // Cửa sổ chúc mừng (mzFinish) có thể hiện muộn sau khi máy chủ trả lời Quét nhanh: đóng ở mọi bước sau đó.
            if (state.phase !== 'open' && vm.viewIsVisible('mzFinish')) {
                try { vm.closeView('mzFinish'); } catch (e) { }
                return 'acted';
            }

            if (state.phase === 'open') {
                if (!mzVisible) {
                    if (!tryAttemptTarget('uyen-nhi-open', "[Cửu Uyển Nhi] Mở màn Cửu Uyển Nhi")) {
                        uyenNhiFinish(state, "❌ [Cửu Uyển Nhi] Không mở được màn Cửu Uyển Nhi (chưa mở khóa hoặc game bận); bỏ qua.", "error", true);
                        return 'done';
                    }
                    // baseDt có thể đã tồn tại từ lúc đăng nhập mà chưa có isOp (do rv20201 chưa về): xóa để chờ dữ liệu thật của máy chủ.
                    if (ctrl.baseDt) ctrl.baseDt.isOp = undefined;
                    ctrl.opMzUi();
                    state.openedAt = now;
                    return 'acted';
                }
                // Chờ dữ liệu màn (rv20201 -> baseDt) và nút được game dựng xong.
                const ui = vm.getViewByName('mzUi');
                if (!state.reqSent && ctrl.baseDt && ctrl.baseDt.isOp === undefined && !state.openedAt) {
                    // Màn đã mở sẵn: yêu cầu dữ liệu mới.
                    state.reqSent = true; state.openedAt = now; ctrl.sd20201();
                }
                if (!ctrl.baseDt || ctrl.baseDt.isOp === undefined || !ui || !ui.saoDangBtn) {
                    if (now - state.openedAt > UYEN_NHI_TIMEOUT_MS) {
                        uyenNhiFinish(state, "❌ [Cửu Uyển Nhi] Máy chủ chưa trả dữ liệu Cửu Uyển Nhi; bỏ qua.", "error", true);
                        vm.closeView('mzUi');
                        return 'done';
                    }
                    return 'wait';
                }
                // Cờ is_activity_open của máy chủ không phải điều kiện của nút Quét nhanh (màn vẫn chơi được khi cờ = 0):
                // chỉ dùng chính điều kiện nút của game (saoDangBtn.visible) bên dưới.
                if (!ui.saoDangBtn.visible) {
                    sendLog("ℹ️ [Cửu Uyển Nhi] Nút Quét nhanh chưa khả dụng (chưa đủ điều kiện); chuyển sang nhận thưởng Ải và Chiến Lệnh.", "info");
                    state.phase = 'passRw';
                    return 'acted';
                }
                // Cờ này game chỉ đặt true khi máy chủ trả lời quét nhanh thành công; đặt lại để xác nhận rõ ràng.
                ctrl.isCAwrd = false;
                ctrl.sd20221();
                state.phase = 'confirm';
                state.sentAt = now;
                sendLog("🧩 [Cửu Uyển Nhi] Nút Quét nhanh khả dụng; đã gửi yêu cầu Quét nhanh, chờ máy chủ xác nhận.", "action");
                return 'acted';
            }

            if (state.phase === 'confirm') {
                if (ctrl.isCAwrd === true) {
                    sendLog("✅ [Cửu Uyển Nhi] Máy chủ xác nhận Quét nhanh thành công.", "result");
                    if (vm.viewIsVisible('mzFinish')) vm.closeView('mzFinish');
                    try { if (vm.viewIsVisible('aletNormalUi')) vm.closeView('aletNormalUi'); } catch (e) { }
                    try { ctrl.sd20201(); } catch (e) { }
                    state.phase = 'passRw';
                    return 'acted';
                }
                if (now - state.sentAt > UYEN_NHI_TIMEOUT_MS) {
                    sendLog("❌ [Cửu Uyển Nhi] Máy chủ chưa xác nhận Quét nhanh (có thể hôm nay đã quét hoặc chưa đủ điều kiện); không gửi lại, vẫn nhận thưởng.", "error");
                    state.failed = true;
                    state.phase = 'passRw';
                    return 'acted';
                }
                return 'wait';
            }

            // Thưởng Ải (mzPassRwUi): sd20222 tải danh sách đã nhận, sd20223(id) nhận từng mốc đủ điều kiện (diff_pass_times >= target).
            if (state.phase === 'passRw') {
                const pr = state.pr || (state.pr = { stage: 'query', at: 0, pending: null, tried: {}, claimed: 0 });
                if (pr.stage === 'query') {
                    if (!pr.at) { pr.at = now; ctrl.sd20222(); return 'acted'; }
                    if (now - pr.at < UYEN_NHI_SETTLE_MS) return 'wait';
                    pr.stage = 'claim';
                }
                if (pr.pending) {
                    const got = ctrl.passRwGetIdDic || {};
                    if (got[pr.pending.id]) {
                        pr.claimed++;
                        sendLog(`✅ [Cửu Uyển Nhi] Máy chủ xác nhận đã nhận Thưởng Ải mốc #${pr.pending.id}.`, "result");
                        pr.pending = null;
                    } else if (now - pr.pending.at >= UYEN_NHI_TIMEOUT_MS) {
                        sendLog(`⚠️ [Cửu Uyển Nhi] Đã gửi nhận Thưởng Ải mốc #${pr.pending.id} nhưng máy chủ chưa xác nhận; không gửi lại.`, "warn");
                        state.failed = true;
                        pr.pending = null;
                    } else return 'wait';
                }
                const rewards = ctrl.getCurlModel().getPassRward() || {};
                const dic = ctrl.passRwGetIdDic || {};
                const times = ctrl.baseDt ? Number(ctrl.baseDt.diff_pass_times) || 0 : 0;
                const next = Object.keys(rewards).map(Number).sort((a, b) => a - b)
                    .find((id) => !dic[id] && !pr.tried[id] && times >= rewards[id].target);
                if (next === undefined) {
                    sendLog(pr.claimed ? `ℹ️ [Cửu Uyển Nhi] Đã nhận ${pr.claimed} Thưởng Ải.` : "ℹ️ [Cửu Uyển Nhi] Không có Thưởng Ải nào để nhận.", "info");
                    state.phase = 'zl';
                    return 'acted';
                }
                pr.tried[next] = true;
                pr.pending = { id: next, at: now };
                ctrl.sd20223(next);
                return 'acted';
            }

            // Chiến Lệnh Cửu Uyển Nhi (mazeZlUi): sd20230 tải dữ liệu, sd20232(mốc) nhận phần thưởng đã đủ điều kiện (miễn phí; không bấm nâng cấp).
            if (state.phase === 'zl') {
                const zl = state.zl || (state.zl = { stage: 'query', ref: null, pending: null, tried: {}, claimed: 0 });
                if (zl.stage === 'query') {
                    const r = pollTowerDailyRefresh(zl, 'ref', now, () => ctrl.sd20230(), () => ctrl.getZlInfo());
                    if (r === 'wait') return 'wait';
                    if (r !== 'ready') {
                        uyenNhiFinish(state, "⚠️ [Cửu Uyển Nhi] Máy chủ chưa trả dữ liệu Chiến Lệnh; bỏ qua.", "warn", true);
                        try { ctrl.clsMz(); } catch (e) { }
                        return 'done';
                    }
                    zl.stage = 'claim';
                    return 'acted';
                }
                if (zl.pending) {
                    if (!ctrl.cMzZlItemRed(zl.pending.num)) {
                        zl.claimed++;
                        sendLog(`✅ [Cửu Uyển Nhi] Máy chủ xác nhận đã nhận Chiến Lệnh mốc ${zl.pending.num}.`, "result");
                        zl.pending = null;
                    } else if (now - zl.pending.at >= UYEN_NHI_TIMEOUT_MS) {
                        sendLog(`⚠️ [Cửu Uyển Nhi] Đã gửi nhận Chiến Lệnh mốc ${zl.pending.num} nhưng máy chủ chưa xác nhận; không gửi lại.`, "warn");
                        state.failed = true;
                        zl.pending = null;
                    } else return 'wait';
                }
                const info = ctrl.getZlInfo();
                const rows = info && info.status !== 0 ? ctrl.gZLRwardLs(info.id) : [];
                const row = rows.find((x) => !zl.tried[x.num] && ctrl.cMzZlItemRed(x.num));
                if (!row) {
                    uyenNhiFinish(state, zl.claimed ? `✅ [Cửu Uyển Nhi] Hoàn tất: đã nhận ${zl.claimed} phần Chiến Lệnh.` : "ℹ️ [Cửu Uyển Nhi] Hoàn tất; Chiến Lệnh không có phần thưởng nào để nhận.", zl.claimed ? "result" : "info");
                    try { ctrl.clsMz(); } catch (e) { }
                    return 'done';
                }
                zl.tried[row.num] = true;
                zl.pending = { num: row.num, at: now };
                ctrl.sd20232(row.num);
                return 'acted';
            }
            return 'done';
        }
