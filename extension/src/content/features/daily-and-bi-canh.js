
        // [Module 2] Phụ Bản Ngày & Bí Cảnh Tứ Quốc
        // Bản game hiện tại không có hàm quét nhanh / mua lượt / quét Bí Cảnh riêng trong DailyDungeonCtrl,
        // nên M2 chỉ gửi quét phụ bản đã vượt (1 lần mỗi ngày) và không mua gì.
        function handleDailyAndBiCanh(ctx) {
            try {
                if (!ctx.DailyDungeonCtrl || !ctx.DailyDungeonCtrl.gInst) return false;
                const dd = ctx.DailyDungeonCtrl.gInst();
                if (!dd) return false;
                const missing = ['oneKeySweepDaily', 'buyDailyCount', 'sweepBiCanhMaxPass']
                    .filter((name) => typeof dd[name] !== 'function');
                if (missing.length) {
                    logUnsupportedOnce('m2-missing', "ℹ️ [M2] Bản game không có hàm mua lượt PB Ngày / quét Bí Cảnh Tứ Quốc; chỉ quét phụ bản đã vượt 1 lần mỗi ngày, không mua thêm.");
                }
                if (handleClimbDailyDungeons(ctx) || handleSweepDungeons(ctx)) return true;
                if (sweptDayKey === new Date().toDateString()) {
                    logUnsupportedOnce('m2-done', "✅ [M2] Hôm nay đã gửi quét phụ bản; không gửi lại.");
                }
                return false;
            } catch(e) { return false; }
        }
