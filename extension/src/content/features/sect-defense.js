
        // [Module 3] Thủ Vệ Tứ Phái
        function handleSectDefense(ctx) {
            try {
                if (ctx.SectDefenseCtrl && ctx.SectDefenseCtrl.gInst) {
                    const sd = ctx.SectDefenseCtrl.gInst();
                    if (typeof sd.selectSupportHero === 'function') sd.selectSupportHero(0);
                    if (typeof sd.selectFriendHelp === 'function') sd.selectFriendHelp(0);
                    if (typeof sd.startDefense === 'function') sd.startDefense();
                    // Chọn Buff cột giữa (index 1 / x=225, y=490)
                    if (typeof sd.chooseBuff === 'function') sd.chooseBuff(1);
                    // Nhận Chiến Lệnh
                    if (typeof sd.claimBattlePass === 'function') sd.claimBattlePass();
                    sendLog("🛡️ [M3 - Thủ Vệ Tứ Phái] Tự động chọn trợ trận, chọn Buff cột giữa & nhận Chiến Lệnh!", "action");
                    return true;
                }
                return false;
            } catch(e) { return false; }
        }
