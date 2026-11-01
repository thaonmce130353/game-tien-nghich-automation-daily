
        // [Module 2] Phụ Bản Ngày & Bí Cảnh Tứ Quốc
        function handleDailyAndBiCanh(ctx) {
            try {
                if (ctx.DailyDungeonCtrl && ctx.DailyDungeonCtrl.gInst) {
                    const dd = ctx.DailyDungeonCtrl.gInst();
                    // Quét nhanh phụ bản ngày
                    if (typeof dd.oneKeySweepDaily === 'function') {
                        dd.oneKeySweepDaily();
                        sendLog("⚔️ [M2 - PB Ngày] Quét nhanh toàn bộ phụ bản ngày thành công!", "action");
                    }
                    // Mua thêm 250 Tiên Ngọc nếu bật
                    if (CONFIG.buyDailyDungeon && typeof dd.buyDailyCount === 'function') {
                        dd.buyDailyCount(250);
                    }
                    // Quét Bí Cảnh Tứ Quốc tầng Đủ Vượt 10 lần
                    if (typeof dd.sweepBiCanhMaxPass === 'function') {
                        dd.sweepBiCanhMaxPass(10);
                        sendLog("🗺️ [M2 - Bí Cảnh Tứ Quốc] Đã quét 10 lần tầng Đủ Vượt!", "action");
                    }
                }
                return handleClimbDailyDungeons(ctx) || handleSweepDungeons(ctx);
            } catch(e) { return false; }
        }
