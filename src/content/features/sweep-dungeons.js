
        // 6. QUÉT PHỤ BẢN ĐÃ VƯỢT
        function handleSweepDungeons(ctx, isManual = false) {
            try {
                const ddCtrl = ctx.DailyDungeonCtrl.gInst();
                if (!ddCtrl) return false;
                if (ctx.FightCtrl && ctx.FightCtrl.gInst && !ctx.FightCtrl.gInst().gCanFight()) return false;

                if (typeof ddCtrl.send11002 === 'function') {
                    ddCtrl.send11002(0);
                    ddCtrl.send11002(1);
                    hasSweptToday = true;
                    sendLog("⚡ [Quét Phụ Bản] Đã quét sạch các phụ bản đã vượt hôm nay!", "action");
                    return true;
                }
            } catch (e) { }
            return false;
        }
