
        // 2. TỰ ĐỘNG LEO PHỤ BẢN NGÀY
        const DAILY_DGN_TYPES = [
            { type: 3, name: "EXP" }, { type: 2, name: "Linh Thạch" }, { type: 4, name: "Tu Sĩ" }, { type: 5, name: "Pháp Bảo" }
        ];
        function handleClimbDailyDungeons(ctx) {
            if (!CONFIG.autoClimbDailyDungeons) return false;
            const now = Date.now();
            if (now - lastDailyClimbTime < 2200) return false;

            const dd = ctx.DailyDungeonCtrl.gInst();
            if (!dd) return false;

            for (let i = 0; i < DAILY_DGN_TYPES.length; i++) {
                const idx = (lastDailyClimbIndex + i) % DAILY_DGN_TYPES.length;
                const dgn = DAILY_DGN_TYPES[idx];
                const nextId = getNextDungeonId(ctx, dgn.type);

                if (nextId > 0 && (!failCounts[nextId] || failCounts[nextId] < 2)) {
                    lastDailyClimbIndex = (idx + 1) % DAILY_DGN_TYPES.length;
                    lastDailyClimbTime = now;

                    if (typeof dd.sRMFightData === 'function') dd.sRMFightData(nextId);
                    dd.send11001(nextId, 0);
                    sendLog(`⚔️ [Leo Phụ Bản - ${dgn.name}] Đang khiêu chiến ải mới #${nextId} (Skip tự động)...`, "action");
                    return true;
                }
            }
            return false;
        }
