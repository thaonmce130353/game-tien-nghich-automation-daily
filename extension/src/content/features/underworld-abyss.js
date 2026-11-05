
        // 3. TỰ ĐỘNG LEO VỰC U MINH
        let abyssGaveUp = 0;      // tầng đã thử đủ số lần mà chưa qua: tính năng kết thúc ngay (không chờ 90s rảnh)
        let abyssGaveTries = 0;   // số lần đã thử khi bỏ cuộc (để ghi log kết thúc)
        let abyssQuickAttempt = null;   // Quét nhanh: lần thử duy nhất của tầng hiện tại { id, at, verifyAt }
        runResetHooks.push(() => { abyssGaveUp = 0; abyssGaveTries = 0; abyssQuickAttempt = null; });

        // Đang trong trận / còn bảng đội hình hoặc kết quả của Vực U Minh?
        function abyssFightBusy(ctx) {
            try {
                if (ctx.EntityMgr && ctx.EntityMgr.gInst && ctx.EntityMgr.gInst().getIsFighting()) return true;
                const vm = ctx.ViewMgr && ctx.ViewMgr.gInst && ctx.ViewMgr.gInst();
                if (!vm || typeof vm.viewIsVisible !== 'function') return false;
                return ['embattleUi', 'ymAbyssChallengeUi', 'YMAbyssChallengeUi', 'fightSuccessUi', 'fightFailUi', 'winUi', 'fightWinUi', 'fightResultUi']
                    .some((n) => vm.viewIsVisible(n));
            } catch (e) { return false; }
        }
        let abyssEmbState = null;
        runResetHooks.push(() => { abyssEmbState = null; });
        function abyssDriveEmbattle(ctx, now) {
            const vm = ctx.ViewMgr && ctx.ViewMgr.gInst && ctx.ViewMgr.gInst();
            if (!vm || !vm.viewIsVisible || !vm.viewIsVisible('embattleUi')) { abyssEmbState = null; return false; }
            const embUi = vm.getViewByName('embattleUi');
            if (!embUi) return false;
            if (!abyssEmbState) abyssEmbState = { at: 0, clicked: 0, starts: 0 };
            const step = embattleStep(embUi, abyssEmbState, now);
            if (step === 'arranged') return true;
            if (step === 'ready' && typeof embUi.cBtnH2 === 'function') {
                embattleMarkStarted(abyssEmbState);
                embUi.cBtnH2();
                sendLog("🌌 [Vực U Minh] Đã xếp đội hình & bấm BẮT ĐẦU!", "action");
                return true;
            }
            if (step === 'failed') {
                const diag = embattleDiagnose(embUi, abyssEmbState);
                abyssEmbState = null;
                try { vm.closeView('embattleUi'); } catch (e) { }
                sendLog(`❌ [Vực U Minh] Không xếp được đội hình (${diag}); không bắt đầu trận.`, "error");
                return true;
            }
            return false;
        }
        const ABYSS_QUICK_VERIFY_MS = 4000;     // sau trận: tải lại tầng rồi đợi chừng này mới kết luận chưa qua

        function handleClimbYMAbyss(ctx) {
            if (!CONFIG.autoClimbYMAbyss) return false;
            const now = Date.now();
            if (now - lastAbyssClimbTime < 2400) return false;

            try {
                if (!ctx.YMAbyssCtrl || !ctx.YMAbyssCtrl.gInst) return false;
                const abyss = ctx.YMAbyssCtrl.gInst();

                if (abyss.pass_dungeon_uid === undefined && typeof abyss.send32070 === 'function') abyss.send32070();
                if (typeof abyss.send32073 === 'function' && abyss.chapter_awards && abyss.chapter_awards.length > 0) {
                    abyss.send32073(abyss.chapter_awards[0]);
                }

                const curCfg = abyss.curChapterCfg;
                if (!curCfg || !curCfg.id) {
                    if (typeof abyss.send32070 === 'function') abyss.send32070();
                    return false;
                }

                const curAbyssId = curCfg.id;
                // "Bỏ qua trận" tắt thì handleBattle (game-hooks.js) không chạy: tự xếp đội hình và bấm Bắt đầu như hook.
                if (!CONFIG.autoSkipFight && abyssDriveEmbattle(ctx, now)) return true;
                // Bảng đội hình / trận / kết quả còn mở: lần thử trước chưa xong, không mở lại và không tính thêm lần thử.
                if (abyssFightBusy(ctx)) return false;
                lastAbyssClimbTime = now;
                if (typeof quickRunActive === 'function' && quickRunActive()) {
                    // Quét nhanh: chỉ 1 lần thử mỗi tầng, tính theo KẾT QUẢ (không đếm theo nhịp để trận đang chạy không bị tính là thử lại).
                    const a = abyssQuickAttempt;
                    if (a && a.id === curAbyssId) {
                        if (abyssFightBusy(ctx) || now - a.at < 8000) return false;     // đợi trận bắt đầu/kết thúc (kể cả lúc máy chủ chậm mở bảng)
                        if (!a.verifyAt) {
                            a.verifyAt = now;
                            try { if (typeof abyss.send32070 === 'function') abyss.send32070(); } catch (e) { }
                            return false;
                        }
                        if (now - a.verifyAt < ABYSS_QUICK_VERIFY_MS) return false;
                        abyssGaveUp = curAbyssId;
                        abyssGaveTries = 1;
                        sendLog(`⏸️ [Vực U Minh] Tầng #${curAbyssId}: đã thử 1 lần chưa qua; dừng (Quét nhanh chỉ thử 1 lần mỗi tầng).`, 'info');
                        return false;
                    }
                    abyssQuickAttempt = { id: curAbyssId, at: now, verifyAt: 0 };
                } else if (!tryAttemptTarget(`abyss-${curAbyssId}`, `[Vực U Minh] Tầng #${curAbyssId}`, undefined, 'info')) { abyssGaveUp = curAbyssId; abyssGaveTries = MAX_TARGET_ATTEMPTS; return false; }

                if (ctx.ViewMgr && ctx.ViewMgr.gInst) {
                    const vm = ctx.ViewMgr.gInst();
                    const isAbyssOpen = (vm.viewIsVisible && (vm.viewIsVisible('YMAbyssUi') || vm.viewIsVisible('ymAbyssChallengeUi') || vm.viewIsVisible('embattleUi')));
                    if (!isAbyssOpen) {
                        if (typeof abyss.openYMAbyssChallange === 'function') abyss.openYMAbyssChallange(curAbyssId);
                        else if (typeof abyss.openYMAbyss === 'function') abyss.openYMAbyss();
                    }
                }

                if (ctx.EmbattleCtrl && ctx.EmbattleCtrl.gInst) {
                    const ec = ctx.EmbattleCtrl.gInst();
                    const eType = (ctx.EmbattleConst && ctx.EmbattleConst.embattleType && ctx.EmbattleConst.embattleType.YMAbyss) || 28;
                    const sType = (ctx.EmbattleConst && ctx.EmbattleConst.embattleSecType && ctx.EmbattleConst.embattleSecType.ymAbyss) || 28;
                    if (typeof ec.openEmbattle === 'function') ec.openEmbattle(eType, sType);
                }

                // Không gọi abyss.startFight(1) ở đây: số 1 là số tướng giả, vượt qua kiểm tra đội hình của game nên máy chủ từ chối
                // "Đội hình Tu Sĩ phe công trống" (105002). Bảng đội hình vừa mở được game-hooks.js xếp nhanh, kiểm tra ô có tướng rồi
                // bấm Bắt đầu (cBtnH2 → startFight(số tướng thật)).

                sendLog(`🌌 [Vực U Minh] Đang khiêu chiến tầng #${curAbyssId} (Tự chọn đội hình + Bắt đầu + Thử lại)...`, "action");
                return true;
            } catch (e) { }
            return false;
        }
