
        // [Module 7] Kiếm Hành & Điêu Long Khắc Tinh QTE
        function handleMinigameDragon(ctx) {
            try {
                // 1. Kiếm Hành
                if (ctx.KiemHanhCtrl && ctx.KiemHanhCtrl.gInst) {
                    const kh = ctx.KiemHanhCtrl.gInst();
                    if (typeof kh.rollDice === 'function') {
                        kh.rollDice();
                        sendLog("🎲 [M7 - Kiếm Hành] Gieo xúc xắc bước đi tự động...", "action");
                    }
                }
                // 2. Điêu Long Khắc Tinh QTE Hoàn Mỹ 380ms
                if (ctx.DragonCarveCtrl && ctx.DragonCarveCtrl.gInst) {
                    const dc = ctx.DragonCarveCtrl.gInst();
                    if (typeof dc.triggerPerfectHit === 'function') {
                        dc.triggerPerfectHit(380);
                        sendLog("🐉 [M7 - Điêu Long] Đã bấm QTE chuẩn 380ms đạt mức HOÀN MỸ!", "action");
                    }
                    if (typeof dc.claimChests === 'function') dc.claimChests();
                    if (typeof dc.claimBattlePass === 'function') dc.claimBattlePass();
                    return true;
                }
                if (!ctx.KiemHanhCtrl) {
                    logUnsupportedOnce('m7', "⚠️ [M7 - Kiếm Hành/Điêu Long] Bản game hiện tại không có KiemHanhCtrl/DragonCarveCtrl; tính năng chưa hỗ trợ, không gửi thao tác nào.");
                }
                return false;
            } catch(e) { return false; }
        }

        // [Module 8] Hoạt Động Ngày, Tiên Minh & Nhận Cuối Ngày
