
        // ============================================================================
        // 3. TỰ ĐỘNG ĐI ẢI CHÍNH TUYẾN (MA ĐẠO)
        // ============================================================================
        let lastMainStageAction = 0;
        let mainStageFailStreak = 0;
        let mainStageStopped = false;
        runResetHooks.push(() => { mainStageFailStreak = 0; mainStageStopped = false; });

        function handleMainStage(ctx) {
            if (!ctx.HangupCtrl || !ctx.HangupCtrl.gInst) return false;
            const hg = ctx.HangupCtrl.gInst();
            const now = Date.now();
            if (now - lastMainStageAction < 1500) return true;

            // 1. Tự động nhận thưởng vượt ải nếu có
            if (hg.m_ungainStageIdGroup) {
                const uncollectedIds = Object.keys(hg.m_ungainStageIdGroup);
                if (uncollectedIds.length > 0) {
                    const rewardId = uncollectedIds[0];
                    sendLog(`🎁 Nhận thưởng vượt Ải Chính Tuyến (Ải ${rewardId})...`, 'success');
                    hg.reqGetStageAwards(Number(rewardId));
                    delete hg.m_ungainStageIdGroup[rewardId];
                    lastMainStageAction = now;
                    return true;
                }
            }

            // 2. Nếu đang mở bảng đội hình (EmbattleUi): Tự động xếp đội hình & Bắt đầu
            if (ctx.ViewMgr && ctx.ViewMgr.gInst) {
                const vm = ctx.ViewMgr.gInst();
                if (vm.viewIsVisible && vm.viewIsVisible(ctx.ViewConst.embattleUi)) {
                    sendLog('⚡ Tự động tối ưu đội hình...', 'info');
                    if (ctx.EmbattleCtrl && ctx.EmbattleCtrl.gInst) {
                        try { ctx.EmbattleCtrl.gInst().autoEmbattle(); } catch(e) {}
                    }
                    const embUi = vm.getViewByName(ctx.ViewConst.embattleUi);
                    if (embUi && embUi.challengeBtn && embUi.challengeBtn.visible) {
                        sendLog('⚔️ Vào trận Khiêu Chiến Ải...', 'info');
                        try { embUi.challengeBtn.dispatchEvent(new egret.TouchEvent(egret.TouchEvent.TOUCH_TAP, true, true)); } catch(e) {}
                    }
                    lastMainStageAction = now;
                    return true;
                }

                // 3. Đóng bảng thắng / thua để qua ải kế tiếp
                if (vm.viewIsVisible && vm.viewIsVisible(ctx.ViewConst.fightSuccessUi)) {
                    mainStageFailStreak = 0;
                    sendLog('🎉 Vượt ải THÀNH CÔNG! Chuyển ải tiếp theo...', 'success');
                    const v = vm.getViewByName(ctx.ViewConst.fightSuccessUi);
                    if (v && v.onHide) v.onHide();
                    else vm.closeView(ctx.ViewConst.fightSuccessUi);
                    lastMainStageAction = now;
                    return true;
                }
                if (vm.viewIsVisible && vm.viewIsVisible(ctx.ViewConst.fightFailUi)) {
                    mainStageFailStreak++;
                    if (mainStageFailStreak >= 2) {
                        mainStageStopped = true;
                        sendLog(`⏸️ Thua Ải Chính Tuyến ${mainStageFailStreak} lần liên tiếp; dừng đi ải trong lượt Auto này để củng cố lực chiến.`, 'warn');
                    } else {
                        sendLog('⚠️ Khiêu chiến ải thất bại. Tạm dừng để củng cố lực chiến.', 'warn');
                    }
                    const v = vm.getViewByName(ctx.ViewConst.fightFailUi);
                    if (v && v.onHide) v.onHide();
                    else vm.closeView(ctx.ViewConst.fightFailUi);
                    lastMainStageAction = now + 6000;
                    return true;
                }
            }

            // 4. Nếu cần kích hoạt chương mới
            if (hg.m_needActiveChapterId && hg.m_needActiveChapterId > 0) {
                sendLog(`🔓 Kích hoạt Chương Mới (${hg.m_needActiveChapterId})...`, 'success');
                hg.reqActiveChapter(hg.m_needActiveChapterId);
                hg.m_needActiveChapterId = 0;
                lastMainStageAction = now;
                return true;
            }

            // 5. Bắt đầu Khiêu Chiến ải chính tuyến (dừng khi thua liên tiếp hoặc cùng ải đã thử 3 lần)
            if (mainStageStopped) return false;
            const curStage = hg.m_curStageId || 1;
            if (!tryAttemptTarget(`main-stage-${curStage}`, `[Ải Chính Tuyến] Ải ${curStage}`)) return false;
            sendLog(`🚀 Khiêu chiến Ải Chính Tuyến ${curStage}...`, 'info');
            if (typeof hg.reqChanllgeStage === 'function') {
                hg.reqChanllgeStage();
            } else if (typeof hg.comfirmChallenge === 'function') {
                hg.comfirmChallenge();
            }
            lastMainStageAction = now;
            return true;
        }
