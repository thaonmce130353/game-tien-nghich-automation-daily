
        // 5. TỰ ĐỘNG LEO TỨ LINH TRẬN
        const CAMP_TYPES = [8, 9, 10, 11];
        function handleClimbCamp(ctx) {
            if (!CONFIG.autoClimbCamp) return false;
            const now = Date.now();
            if (now - lastCampClimbTime < 3000) return false;

            const dd = ctx.DailyDungeonCtrl.gInst();
            if (!dd) return false;

            for (let i = 0; i < CAMP_TYPES.length; i++) {
                const idx = (lastCampClimbIndex + i) % CAMP_TYPES.length;
                const cType = CAMP_TYPES[idx];
                const nextId = getNextDungeonId(ctx, cType);

                if (nextId > 0 && (!failCounts[nextId] || failCounts[nextId] < 2)) {
                    lastCampClimbIndex = (idx + 1) % CAMP_TYPES.length;
                    lastCampClimbTime = now;

                    if (typeof dd.sRMFightData === 'function') dd.sRMFightData(nextId);
                    dd.send11001(nextId, 0);
                    if (typeof dd.inSingCampFight === 'function') dd.inSingCampFight();
                    sendLog(`🛡️ [Leo Tứ Linh Trận] Đang khiêu chiến ải mới #${nextId}...`, "action");
                    return true;
                }
            }
            return false;
        }
