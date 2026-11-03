
        // [Module 4a] Cửu Uyển Nhi (MzCtrl, giao diện mzUi): chỉ bấm "Quét nhanh" khi game cho phép.
        // Nút Quét nhanh (saoDangBtn) chỉ hiện khi đủ điều kiện (đủ ngày mở / đủ lần vượt khó); bấm nút
        // game hỏi xác nhận rồi gửi sd20221, nên ở đây gọi thẳng sd20221 như nút xác nhận. Xác nhận thành công
        // khi máy chủ trả lời và game đặt cờ isCAwrd (rv20221). Mỗi ngày tối đa một lần gửi.
        // Trả về: 'done' (đã xong / không có gì làm) | 'acted' (vừa thao tác) | 'wait' (đang chờ game).
        const UYEN_NHI_TIMEOUT_MS = 20000;
        let uyenNhiState = null;
        runResetHooks.push(() => {
            if (uyenNhiState && uyenNhiState.failed && uyenNhiState.phase === 'done') uyenNhiState = null;
        });

        function uyenNhiFinish(state, message, type, failed) {
            state.phase = 'done';
            if (failed) state.failed = true;
            sendLog(message, type || "info");
        }

        function handleUyenNhi(ctx) {
            if (!ctx.MzCtrl || !ctx.MzCtrl.gInst || !ctx.ViewMgr || !ctx.ViewMgr.gInst) {
                logUnsupportedOnce('uyen-nhi', "⚠️ [M4 - Cửu Uyển Nhi] Game chưa sẵn sàng (MzCtrl); bỏ qua bước này.");
                return 'done';
            }
            const dayKey = new Date().toDateString();
            if (!uyenNhiState || uyenNhiState.dayKey !== dayKey) {
                uyenNhiState = { dayKey, phase: 'open', failed: false, openedAt: 0, sentAt: 0 };
                sendLog("🧩 [M4 - Cửu Uyển Nhi] Bắt đầu/khởi động lại: mở màn Cửu Uyển Nhi và kiểm tra nút Quét nhanh từ game.", "action");
            }
            const state = uyenNhiState;
            if (state.phase === 'done') return 'done';

            const ctrl = ctx.MzCtrl.gInst();
            const vm = ctx.ViewMgr.gInst();
            const now = Date.now();
            const mzVisible = vm.viewIsVisible('mzUi');

            if (state.phase === 'open') {
                if (!mzVisible) {
                    if (!tryAttemptTarget('uyen-nhi-open', "[M4 - Cửu Uyển Nhi] Mở màn Cửu Uyển Nhi")) {
                        uyenNhiFinish(state, "❌ [M4 - Cửu Uyển Nhi] Không mở được màn Cửu Uyển Nhi (chưa mở khóa hoặc game bận); bỏ qua.", "error", true);
                        return 'done';
                    }
                    ctrl.opMzUi();
                    state.openedAt = now;
                    return 'acted';
                }
                // Chờ dữ liệu màn (rv20201 -> baseDt) và nút được game dựng xong.
                const ui = vm.getViewByName('mzUi');
                if (!ctrl.baseDt || !ui || !ui.saoDangBtn) {
                    if (now - state.openedAt > UYEN_NHI_TIMEOUT_MS) {
                        uyenNhiFinish(state, "❌ [M4 - Cửu Uyển Nhi] Máy chủ chưa trả dữ liệu Cửu Uyển Nhi; bỏ qua.", "error", true);
                        vm.closeView('mzUi');
                        return 'done';
                    }
                    return 'wait';
                }
                if (!ctrl.baseDt.isOp) {
                    uyenNhiFinish(state, "ℹ️ [M4 - Cửu Uyển Nhi] Hoạt động hiện chưa mở; không có gì để quét.", "info");
                    ctrl.clsMz();
                    return 'done';
                }
                if (!ui.saoDangBtn.visible) {
                    uyenNhiFinish(state, "ℹ️ [M4 - Cửu Uyển Nhi] Nút Quét nhanh chưa khả dụng (chưa đủ điều kiện); bỏ qua.", "info");
                    ctrl.clsMz();
                    return 'done';
                }
                // Cờ này game chỉ đặt true khi máy chủ trả lời quét nhanh thành công; đặt lại để xác nhận rõ ràng.
                ctrl.isCAwrd = false;
                ctrl.sd20221();
                state.phase = 'confirm';
                state.sentAt = now;
                sendLog("🧩 [M4 - Cửu Uyển Nhi] Nút Quét nhanh khả dụng; đã gửi yêu cầu Quét nhanh, chờ máy chủ xác nhận.", "action");
                return 'acted';
            }

            if (state.phase === 'confirm') {
                if (ctrl.isCAwrd === true) {
                    uyenNhiFinish(state, "✅ [M4 - Cửu Uyển Nhi] Máy chủ xác nhận Quét nhanh thành công.", "result");
                    if (vm.viewIsVisible('mzFinish')) vm.closeView('mzFinish');
                    try { ctrl.sd20201(); } catch (e) { }
                    ctrl.clsMz();
                    return 'acted';
                }
                if (now - state.sentAt > UYEN_NHI_TIMEOUT_MS) {
                    uyenNhiFinish(state, "❌ [M4 - Cửu Uyển Nhi] Máy chủ chưa xác nhận Quét nhanh (có thể hôm nay đã quét hoặc chưa đủ điều kiện); không gửi lại.", "error", true);
                    ctrl.clsMz();
                    return 'done';
                }
                return 'wait';
            }
            return 'done';
        }
