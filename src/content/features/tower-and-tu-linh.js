
        
        // =========================================================================
        // HỆ THỐNG 8 MODULE TỰ ĐỘNG HÓA ƯU TIÊN (VISION & CONTROLLER HYBRID)
        // =========================================================================

        // [Module 1] Thông Thiên Tháp & Tứ Linh Tháp
        function handleTowerAndTuLinh(ctx) {
            const now = Date.now();
            try {
                if (ctx.DailyDungeonCtrl && ctx.DailyDungeonCtrl.gInst) {
                    const dd = ctx.DailyDungeonCtrl.gInst();
                    // 1. Quét thông thiên tháp
                    if (typeof dd.sweepTower === 'function') {
                        dd.sweepTower();
                        sendLog("🗼 [M1 - Thông Thiên Tháp] Đang quét sạch tầng Thông Thiên Tháp...", "action");
                    }
                    // 2. Mua thêm lượt quét nếu cấu hình bật
                    if (CONFIG.buyTowerSweep && typeof dd.buyTowerSweepCount === 'function') {
                        dd.buyTowerSweepCount();
                    }
                }
                // 3. Tứ Linh Tháp: Cử trợ trận & khiêu chiến 4 tháp
                if (ctx.CampCtrl && ctx.CampCtrl.gInst) {
                    const camp = ctx.CampCtrl.gInst();
                    if (typeof camp.sendHelpHero === 'function') {
                        camp.sendHelpHero(0); // Cử tướng đầu tiên
                    }
                    if (typeof camp.challengeCampTower === 'function') {
                        camp.challengeCampTower();
                        sendLog("🛡️ [M1 - Tứ Linh Tháp] Đang leo tháp Tứ Linh (Skip tự động)...", "action");
                    }
                }
                return handleTongTianTower(ctx) || handleClimbCamp(ctx);
            } catch(e) { return false; }
        }
