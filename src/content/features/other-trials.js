
        // [Module 4] Cửu Uyển Nhi, Cổ Thần Địa, Cực Âm Địa
        function handleOtherTrials(ctx) {
            try {
                // 1. Chiến Lệnh Uyển Nhi
                if (ctx.UyenNhiCtrl && ctx.UyenNhiCtrl.gInst) {
                    const un = ctx.UyenNhiCtrl.gInst();
                    if (typeof un.claimRewards === 'function') un.claimRewards();
                }
                // 2. Cổ Thần Địa: Lên trận nhanh & khiêu chiến map
                if (ctx.CoThanCtrl && ctx.CoThanCtrl.gInst) {
                    const ct = ctx.CoThanCtrl.gInst();
                    if (typeof ct.quickEmbattle === 'function') ct.quickEmbattle();
                    if (typeof ct.challengeMap === 'function') {
                        ct.challengeMap();
                        sendLog("⚔️ [M4 - Cổ Thần Địa] Đã tự lên trận nhanh và khiêu chiến ải!", "action");
                    }
                }
                // 3. Cực Âm Địa
                return handleExtremeYin(ctx);
            } catch(e) { return false; }
        }
