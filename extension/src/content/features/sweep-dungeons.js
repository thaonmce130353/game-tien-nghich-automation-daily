
        // 6. QUÉT PHỤ BẢN ĐÃ VƯỢT
        // Tự động: chỉ gửi 1 lần mỗi ngày (trước đây gửi lại mỗi nhịp). Bấm tay (isManual) luôn gửi.
        // Số lượt quét MIỄN PHÍ còn lại của mọi loại phụ bản ngày (đúng hàm nút "Quét nhanh" của game dùng); -1 nếu game không có hàm.
        function sweepFreeCount(ddCtrl) {
            if (typeof ddCtrl.getAllMianFeiNum !== 'function') return -1;
            return Number(ddCtrl.getAllMianFeiNum(true)) || 0;
        }

        // Xác nhận quét: số lượt miễn phí phải giảm. Game không có phản hồi thành công riêng (on11002 chỉ báo lỗi), nên sau vài giây
        // tải lại dữ liệu các loại phụ bản một lần rồi so lại; không đổi thì chỉ ghi chú, không coi là lỗi (có thể đã quét từ trước).
        function sweepConfirmTick(ctx) {
            if (!sweepPending) return;
            try {
                const ddCtrl = ctx.DailyDungeonCtrl.gInst();
                const free = sweepFreeCount(ddCtrl);
                const age = Date.now() - sweepPending.at;
                if (free >= 0 && free < sweepPending.before) {
                    sendLog(`✅ [Phụ Bản Ngày] Máy chủ xác nhận đã quét miễn phí (lượt miễn phí ${sweepPending.before} → ${free}).`, "result");
                    sweepPending = null;
                    return;
                }
                if (age >= 3000 && !sweepPending.refreshed) {
                    sweepPending.refreshed = true;
                    const types = (ctx.DailyDungeonConst && ctx.DailyDungeonConst.dailyDungeonTypeArr) || [];
                    types.forEach((t) => { try { if (typeof ddCtrl.send11004 === 'function') ddCtrl.send11004(t); } catch (e) { } });
                }
                if (age >= 12000) {
                    sendLog("ℹ️ [Phụ Bản Ngày] Đã gửi quét miễn phí nhưng số lượt miễn phí chưa đổi (có thể hôm nay đã quét từ trước hoặc game chưa cập nhật); không gửi lại.", "info");
                    sweepPending = null;
                }
            } catch (e) { sweepPending = null; }
        }

        // 6. QUÉT PHỤ BẢN NGÀY: CHỈ lượt MIỄN PHÍ (send11002(0)), tối đa một lần mỗi ngày. KHÔNG bao giờ gửi send11002(1)
        // (đó là quét bằng Tiên Ngọc trong hộp thoại xác nhận của game). Hết lượt miễn phí là bình thường, không phải lỗi.
        function handleSweepDungeons(ctx) {
            try {
                sweepConfirmTick(ctx);
                const dayKey = new Date().toDateString();
                if (sweptDayKey === dayKey) return false;
                const ddCtrl = ctx.DailyDungeonCtrl.gInst();
                if (!ddCtrl) return false;
                if (ctx.FightCtrl && ctx.FightCtrl.gInst && !ctx.FightCtrl.gInst().gCanFight()) return false;

                const free = sweepFreeCount(ddCtrl);
                if (free < 0) {
                    logUnsupportedOnce('sweep-free-api', "⚠️ [Phụ Bản Ngày] Bản game không có hàm đếm lượt quét miễn phí; không quét (tránh quét bằng Tiên Ngọc).");
                    sweptDayKey = dayKey;
                    return false;
                }
                if (free === 0) {
                    sweptDayKey = dayKey;
                    logOnce('sweep-none-free', "ℹ️ [Phụ Bản Ngày] Hôm nay không còn lượt quét miễn phí (đã quét từ trước); không quét, không mua lượt bằng Tiên Ngọc.", "info");
                    return false;
                }
                if (typeof ddCtrl.send11002 === 'function') {
                    ddCtrl.send11002(0);
                    sweptDayKey = dayKey;
                    sweepPending = { before: free, at: Date.now(), refreshed: false };
                    sendLog(`⚡ [Phụ Bản Ngày] Đã gửi quét miễn phí (còn ${free} lượt miễn phí; không mua lượt bằng Tiên Ngọc).`, "action");
                    return true;
                }
            } catch (e) { }
            return false;
        }
