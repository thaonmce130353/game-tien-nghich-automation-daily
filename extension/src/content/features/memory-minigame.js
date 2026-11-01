
        // [Module 6] Minigame Ảo Cảnh Pháp Trận (Lưới 4x4)
        function handleMinigameMemory(ctx) {
            try {
                if (ctx.MemoryGameCtrl && ctx.MemoryGameCtrl.gInst) {
                    const mg = ctx.MemoryGameCtrl.gInst();
                    if (typeof mg.solveMemoryBoard === 'function') {
                        mg.solveMemoryBoard();
                        sendLog("🧩 [M6 - Ảo Cảnh] Đã tự động giải hoàn hảo 8 cặp thẻ bài 4x4!", "action");
                    }
                    if (typeof mg.claimChests === 'function') mg.claimChests(); // 100, 200, 300
                    if (typeof mg.claimTasks === 'function') mg.claimTasks();
                    if (typeof mg.likeRankings === 'function') mg.likeRankings(); // Like 2 tab BXH
                    return true;
                }
                return false;
            } catch(e) { return false; }
        }
