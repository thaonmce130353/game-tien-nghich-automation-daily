
        // ============================================================================
        // 2. TỰ ĐỘNG ĐÁNH CỰC ÂM ĐỊA (LỊCH LUYỆN)
        // ============================================================================
        let lastExtremeYinCheck = 0;

        function handleExtremeYin(ctx) {
            if (!ctx.ExtremeYinCtrl || !ctx.ExtremeYinCtrl.gInst) return false;
            const eyCtrl = ctx.ExtremeYinCtrl.gInst();
            const now = Date.now();
            if (now - lastExtremeYinCheck < 3000) return true;

            // Nếu đang tu luyện: Kiểm tra đã xong giờ để nhận thưởng chưa
            if (eyCtrl.bHaveSeat && eyCtrl.bHaveSeat()) {
                const curLandId = eyCtrl.getLandId ? eyCtrl.getLandId() : 0;
                const pData = eyCtrl.getPlayerData ? eyCtrl.getPlayerData() : null;
                const model = eyCtrl.getCurlModel ? eyCtrl.getCurlModel() : null;
                const buildCfg = (model && model.getBuildCfgVo) ? model.getBuildCfgVo(curLandId) : null;
                if (pData && buildCfg && curLandId > 0) {
                    const timePassed = (ctx.NetMgr && ctx.NetMgr.gInst ? ctx.NetMgr.gInst().getTime() : Math.floor(now/1000)) - pData.start_time;
                    if (timePassed >= buildCfg.time) {
                        sendLog('🏆 Đã tu luyện xong Cực Âm Địa! Nhận thưởng...', 'success');
                        eyCtrl.send32204(curLandId);
                        lastExtremeYinCheck = now;
                        return true;
                    } else {
                        const remainSec = buildCfg.time - timePassed;
                        const m = Math.floor(remainSec / 60);
                        const s = remainSec % 60;
                        sendLog(`🧘 Đang tu luyện Cực Âm Địa (Còn ${m}p${s}s)...`, 'info');
                        lastExtremeYinCheck = now + 10000;
                        return true;
                    }
                }
                return false;
            }

            // Nếu chưa có chỗ: Tìm tầng cao nhất còn chỗ trống để đánh chiếm
            sendLog('🔍 Đang kiểm tra các tầng Cực Âm Địa còn chỗ trống...', 'info');
            eyCtrl.toRefreshMainInfo();

            const landCaps = [
                { id: 5, name: 'Thiên Âm Chi Địa', cap: 10 },
                { id: 4, name: 'Địa Âm Địa', cap: 25 },
                { id: 3, name: 'Huyền Âm Địa', cap: 50 },
                { id: 2, name: 'Thượng Giai - Hoàng Âm Địa', cap: 200 },
                { id: 1, name: 'Hoàng Âm Địa', cap: 999999 }
            ];

            let targetLandId = 0;
            for (let i = 0; i < landCaps.length; i++) {
                const land = landCaps[i];
                const curCount = eyCtrl.getLandInfo ? (eyCtrl.getLandInfo(land.id) || 0) : 0;
                if (curCount < land.cap) {
                    targetLandId = land.id;
                    sendLog(`🎯 Tìm thấy ${land.name} còn chỗ (${curCount}/${land.cap}). Tiến hành chiếm địa...`, 'success');
                    break;
                }
            }

            if (!targetLandId) targetLandId = 1; // Fallback Hoàng Âm Địa không giới hạn
            eyCtrl.chanllenge(targetLandId);
            lastExtremeYinCheck = now;
            return true;
        }
