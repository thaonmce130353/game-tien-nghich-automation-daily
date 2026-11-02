        function getNextDungeonId(ctx, dungeonType) {
            const dd = ctx.DailyDungeonCtrl.gInst();
            if (!dd) return 0;

            let curId = 0;
            if (typeof dd.gCurDgnId === 'function') curId = dd.gCurDgnId(dungeonType);
            if ((!curId || curId <= 0) && typeof dd.gTJDgnBaseId === 'function') curId = dd.gTJDgnBaseId(dungeonType);
            if ((!curId || curId <= 0) && dd.dungeonDataDic && dd.dungeonDataDic[dungeonType]) {
                const dData = dd.dungeonDataDic[dungeonType];
                const lastId = dData.maxPassDungeonId || 0;
                if (lastId > 0 && typeof dd.gBaseCfg === 'function') {
                    const cfg = dd.gBaseCfg(lastId);
                    if (cfg && cfg.next_id) curId = cfg.next_id;
                } else if (typeof dd.gDgnBaseTypeArr === 'function') {
                    const arr = dd.gDgnBaseTypeArr(dungeonType);
                    if (arr && arr[0]) curId = arr[0].id;
                }
            }
            if ((!curId || curId <= 0) && typeof dd.send11004 === 'function') dd.send11004(dungeonType);
            return curId || 0;
        }

        // 1. TỰ ĐỘNG LEO THÔNG THIÊN THÁP
        function handleTongTianTower(ctx) {
            if (!CONFIG.autoTongTian) return false;
            try {
                const ddCtrl = ctx.DailyDungeonCtrl.gInst();
                if (!ddCtrl) return false;

                if (ctx.ViewMgr && ctx.ViewMgr.gInst) {
                    const vm = ctx.ViewMgr.gInst();
                    const isTowerOpen = (vm.viewIsVisible && (vm.viewIsVisible('BabelEntraceUi') || vm.viewIsVisible('RunningManUi')));
                    if (!isTowerOpen && typeof ddCtrl.opSCpCyUi === 'function') ddCtrl.opSCpCyUi(0, false);
                }

                ddCtrl.openRunManAutoFight = true;
                ddCtrl.saveAlertRunManAutoFight = true;

                if (isTowerChallenging || waitingForFloorUpdate) return false;

                const towerType = (ctx.DailyDungeonConst && ctx.DailyDungeonConst.dailyDungeonType && ctx.DailyDungeonConst.dailyDungeonType.runningMan) || 1;
                const curDgnId = getNextDungeonId(ctx, towerType);
                if (curDgnId <= 0) return false;
                if (failCounts[curDgnId] >= 2) {
                    logUnsupportedOnce(`tower-rejected-${curDgnId}`, `⏸️ [Thông Thiên Tháp] Máy chủ từ chối tầng #${curDgnId} nhiều lần; dừng khiêu chiến trong lượt Auto này.`);
                    return false;
                }
                if (!tryAttemptTarget(`tower-${curDgnId}`, `[Thông Thiên Tháp] Tầng #${curDgnId}`)) return false;

                isTowerChallenging = true;
                waitingForFloorUpdate = true;

                if (typeof ddCtrl.sRMFightData === 'function') ddCtrl.sRMFightData(curDgnId);
                ddCtrl.send11001(curDgnId, 0);
                sendLog(`🗼 [Thông Thiên Tháp] Đang khiêu chiến tầng #${curDgnId}...`, "action");

                setTimeout(() => {
                    isTowerChallenging = false;
                    waitingForFloorUpdate = false;
                }, 2200);

                return true;
            } catch (e) {
                isTowerChallenging = false;
                waitingForFloorUpdate = false;
            }
            return false;
        }
