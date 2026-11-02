
        // ============================================================================
        // 4. TỰ ĐỘNG QUÀ TIÊN DUYÊN TRONG SỰ KIỆN RÚT X1000 (MA ĐẠO)
        // ============================================================================
        let lastXianYuanAction = 0;

        function handleXianYuan(ctx) {
            if (!ctx.XianYuanCtrl || !ctx.XianYuanCtrl.gInst) return false;
            const xy = ctx.XianYuanCtrl.gInst();
            const now = Date.now();
            if (now - lastXianYuanAction < 2000) return true;

            // 1. Nhận rương thưởng Quà Tiên Duyên khi đủ điểm
            if (xy.checkXianYuanHaoLiBoxRed && xy.checkXianYuanHaoLiBoxRed()) {
                sendLog('🎁 Điểm Tiên Duyên đã đạt mốc! Nhận rương thưởng lớn...', 'success');
                xy.send32122();
                lastXianYuanAction = now;
                return true;
            }

            // 2. Nhận thưởng các nhiệm vụ Tiên Duyên đã hoàn thành
            if (xy.taskDic) {
                for (const tid in xy.taskDic) {
                    const task = xy.taskDic[tid];
                    const canGetStatus = (ctx.XianYuanConst && ctx.XianYuanConst.TaskStatus && ctx.XianYuanConst.TaskStatus.canGet !== undefined) 
                        ? ctx.XianYuanConst.TaskStatus.canGet : 1;
                    if (task && (task.status === canGetStatus || task.status === 1)) {
                        sendLog(`✨ Nhiệm vụ Tiên Duyên [${task.id || tid}] hoàn thành! Nhận quà...`, 'success');
                        xy.send32121(task.id || tid);
                        task.status = 2;
                        lastXianYuanAction = now;
                        return true;
                    }
                }
            }

            // 3. Định kỳ refresh dữ liệu nhiệm vụ Tiên Duyên
            // Định kỳ ~30-45s (trước đây ~6s).
            xy.send32120();
            lastXianYuanAction = now + 28000 + Math.floor(Math.random() * 15000);
            return true;
        }
