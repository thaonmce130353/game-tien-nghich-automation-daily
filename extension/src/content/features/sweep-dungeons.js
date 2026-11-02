
        // 6. QUÉT PHỤ BẢN ĐÃ VƯỢT
        // Tự động: chỉ gửi 1 lần mỗi ngày (trước đây gửi lại mỗi nhịp). Bấm tay (isManual) luôn gửi.
        function handleSweepDungeons(ctx, isManual = false) {
            try {
                const dayKey = new Date().toDateString();
                if (!isManual && sweptDayKey === dayKey) return false;
                const ddCtrl = ctx.DailyDungeonCtrl.gInst();
                if (!ddCtrl) return false;
                if (ctx.FightCtrl && ctx.FightCtrl.gInst && !ctx.FightCtrl.gInst().gCanFight()) return false;

                if (typeof ddCtrl.send11002 === 'function') {
                    ddCtrl.send11002(0);
                    ddCtrl.send11002(1);
                    sweptDayKey = dayKey;
                    // on11002 chỉ báo lỗi (không có xác nhận thành công riêng) nên chỉ ghi là đã gửi yêu cầu.
                    sendLog("⚡ [Quét Phụ Bản] Đã gửi yêu cầu quét các phụ bản đã vượt hôm nay (lỗi, nếu có, sẽ hiện trong game).", "action");
                    return true;
                }
            } catch (e) { }
            return false;
        }
