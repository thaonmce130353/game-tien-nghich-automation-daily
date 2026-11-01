
        // 4. TỰ ĐỘNG KHIÊU CHIẾN ĐẤU TIÊN ĐÀI
        function handleArena(ctx) {
            if (!CONFIG.autoArena) return false;
            const now = Date.now();

            try {
                if (!ctx.ArenaCtrl || !ctx.ArenaCtrl.gInst) return false;
                const ac = ctx.ArenaCtrl.gInst();

                if (ctx.ViewMgr && ctx.ViewMgr.gInst) {
                    const vm = ctx.ViewMgr.gInst();
                    if (vm.viewIsVisible && vm.viewIsVisible('douXianTaiMainUi')) vm.closeView('douXianTaiMainUi');
                    if (vm.viewIsVisible && !vm.viewIsVisible('arenaUi') && typeof ac.opAnUi === 'function') ac.opAnUi();
                }

                if (!ac.m_enemyList || ac.m_enemyList.length === 0 || (now - lastArenaFetchTime > 10000)) {
                    lastArenaFetchTime = now;
                    if (typeof ac.send14201 === 'function') ac.send14201();
                }

                if (ctx.FightCtrl && ctx.FightCtrl.gInst && !ctx.FightCtrl.gInst().gCanFight()) return false;

                const freeCount = ac.m_freeCount || 0;
                let ticketCount = 0;
                if (ctx.PropsCtrl && ctx.PropsCtrl.gInst && typeof ctx.PropsCtrl.gInst().findGoodsNum === 'function') {
                    ticketCount = ctx.PropsCtrl.gInst().findGoodsNum(1000110) || 0;
                }
                const totalAvailable = freeCount + ticketCount;
                if (totalAvailable <= 0) return false;

                if (now - lastArenaCheckTime < 1800) return false;

                const enemyList = ac.m_enemyList;
                if (!enemyList || enemyList.length === 0) {
                    if (typeof ac.send14201 === 'function') ac.send14201();
                    return false;
                }

                let bestIdx = 0;
                let minFc = Infinity;
                let bestName = "";

                for (let i = 0; i < enemyList.length; i++) {
                    const emy = enemyList[i];
                    let fcNum = 0;
                    if (ctx.CommonUtils && typeof ctx.CommonUtils.to64Num === 'function' && emy.fc) {
                        fcNum = ctx.CommonUtils.to64Num(emy.fc);
                    } else if (emy.fc && typeof emy.fc.dataNum === 'number') {
                        fcNum = emy.fc.dataNum;
                    } else {
                        fcNum = Number(emy.fc) || 0;
                    }

                    if (fcNum < minFc) {
                        minFc = fcNum;
                        bestIdx = i;
                        bestName = emy.name || `Đối thủ #${i + 1}`;
                    }
                }

                ac.skipArenaFight = true;
                lastArenaCheckTime = now;

                let challenged = false;
                if (ctx.ViewMgr && ctx.ViewMgr.gInst) {
                    const vm = ctx.ViewMgr.gInst();
                    if (vm.viewIsVisible && vm.viewIsVisible('arenaUi')) {
                        const anUi = vm.getViewByName('arenaUi');
                        if (anUi && typeof anUi.clkChnlge === 'function') {
                            anUi.clkChnlge(bestIdx);
                            challenged = true;
                        }
                    }
                }

                if (!challenged && typeof ac.chnlgeEmy === 'function') {
                    ac.chnlgeEmy(bestIdx);
                    challenged = true;
                }

                if (challenged) {
                    const powerStr = minFc < Infinity && minFc > 0 ? minFc.toLocaleString('vi-VN') : '--';
                    sendLog(`🏟️ [Đấu Tiên Đài] Đang khiêu chiến ${bestName} (LC thấp nhất: ${powerStr}, còn ${freeCount} miễn phí, ${ticketCount} vé)...`, "action");
                    setTimeout(() => {
                        if (typeof ac.send14201 === 'function') ac.send14201();
                    }, 1200);
                    return true;
                }
            } catch (e) { }
            return false;
        }
