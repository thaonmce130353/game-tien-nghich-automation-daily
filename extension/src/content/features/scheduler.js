
        let wasAutoRunning = false;
        const CUOI_NGAY_ACTION_INTERVAL_MS = 450;
        const TAM_TIEN_ACTION_INTERVAL_MS = 450;
        // Các tính năng là chuỗi nhiều bước nhỏ, mỗi bước chờ máy chủ: nhịp nhanh, không nghỉ dài ngẫu nhiên.
        const FAST_ROUTINE_FEATURES = ['autoCuoiNgay', 'autoTamTienDai'];
        const OTHER_TRIALS_ACTION_INTERVAL_MS = 600;

        let disconnectPauseLogged = false;

        function isGameDisconnected(ctx) {
            try {
                const vm = ctx.ViewMgr && ctx.ViewMgr.gInst && ctx.ViewMgr.gInst();
                const name = (ctx.ViewConst && ctx.ViewConst.disconnectUi) || 'disconnectUi';
                return !!(vm && typeof vm.isUpViewVisible === 'function' && vm.isUpViewVisible(name));
            } catch (e) { return false; }
        }

        function markActed(baseMs, noLongPause) {
            nextActionAt = Date.now() + humanDelay(baseMs, noLongPause);
            runNoteActed();
        }

        // ---- HOÀN TẤT TỰ ĐỘNG -------------------------------------------------------------------------
        // Thông Thiên Tháp là treo máy liên tục (chạy tới khi người dùng dừng); Banner tự gọi runFinish khi xong lượt.
        // Các tính năng khác: xong khi tính năng báo trạng thái "done" (runFinishProbe) hoặc không còn thao tác nào
        // trong RUN_IDLE_FINISH_MS (hết lượt, không qua được ải, chỉ còn chờ giờ...).
        const RUN_IDLE_FINISH_MS = 90000;
        const RUN_NO_IDLE_FEATURES = ['autoTongTian', 'autoBanner', 'autoMinigameMemory', 'autoMinigameDragon'];

        function extremeYinSettled() {
            const st = extremeYinState;
            // Pha 'wait' của Cực Âm Địa = đã vào địa/đang tu luyện (hoặc chưa có việc), chỉ còn chờ tới lần đồng bộ sau.
            return st && st.phase === 'wait' && Date.now() < st.nextSyncAt ? { failed: false } : null;
        }

        function runFinishProbe(key) {
            const today = new Date().toDateString();
            const done = (st) => (st && st.phase === 'done' ? { failed: Boolean(st.failed) } : null);
            switch (key) {
                case 'autoTroChien': return done(troChienState);
                case 'autoTamTienDai': return done(tamTienDaiState);
                case 'autoTienHuu': return done(tienHuuState);
                case 'autoTienMinh': return done(tienMinhState);
                case 'autoCuoiNgay': return done(cuoiNgayState);
                case 'autoSectDefense': return done(sectDefenseState);
                case 'autoImmortalRelic': return done(relicState);
                case 'autoMinigameMemory': return done(memoryState);
                case 'autoMinigameDragon': return done(dragonState);
                case 'autoMaDao': return done(maDaoState);
                case 'autoTongTian': return CONFIG.towerSweepOnly && towerDailyState && towerDailyState.phase === 'done' ? { failed: Boolean(towerDailyState.failed) } : null;
                case 'autoSweepDungeons': return sweptDayKey === today && !sweepPending ? { failed: false } : null;
                case 'autoExtremeYin': return extremeYinSettled();
                case 'autoOtherTrials': return done(uyenNhiState) && done(coThanState) ? extremeYinSettled() : null;
                case 'autoDailyDungeon': return sweptDayKey === today && !sweepPending && done(biCanhState) ? { failed: false } : null;
                case 'autoXianYuan': return xianYuanIdleCycles >= 2 ? { failed: false } : null;
                case 'autoClimbYMAbyss': return abyssGaveUp ? { failed: false, reason: `chưa đủ sức qua tầng #${abyssGaveUp} (đã thử ${MAX_TARGET_ATTEMPTS} lần, bình thường khi lực chiến chưa đủ)` } : null;
                case 'autoArena': return arenaRunState.limitReachedLogged || arenaRunState.noAttemptsLogged ? { failed: false } : null;
                default: return null;
            }
        }

        function checkRunFinished() {
            const info = runInfo;
            if (!CONFIG.running || !info || bannerGiftBusy) return false;
            if ((info.key === 'autoTongTian' && !CONFIG.towerSweepOnly) || info.key === 'autoBanner') return false;
            let probe = null;
            try { probe = runFinishProbe(info.key); } catch (e) { }
            if (probe) {
                // Cho tính năng chạy thêm một nhịp ở trạng thái "done" để nó tự dọn (đóng bảng, ghi tổng kết) rồi mới kết thúc.
                if (!info.finishing) { info.finishing = true; info.finishingAt = Date.now(); return false; }
                if (!info.drained && Date.now() - info.finishingAt < 8000) return false;
                runFinish(probe.reason || (info.acts === 0 ? 'hôm nay đã xong từ trước, không làm lại' : ''), probe.failed);
                return true;
            }
            if (!RUN_NO_IDLE_FEATURES.includes(info.key) && Date.now() - info.lastActAt >= RUN_IDLE_FINISH_MS) {
                runFinish('không còn thao tác nào để làm');
                return true;
            }
            return false;
        }

        // Dừng giữa chừng: bỏ trạng thái dở dang của mọi tính năng. Trạng thái "done" của hôm nay được giữ (chống làm lại/mua lại).
        function resetUnfinishedRunStates() {
            if (tamTienDaiState && tamTienDaiState.phase !== 'done') tamTienDaiState = null;
            if (tienHuuState && tienHuuState.phase !== 'done') tienHuuState = null;
            if (cuoiNgayState && cuoiNgayState.phase !== 'done') cuoiNgayState = null;
            if (tienMinhState && tienMinhState.phase !== 'done') tienMinhState = null;
            if (troChienState && troChienState.phase !== 'done') troChienState = null;
            if (towerDailyState && towerDailyState.phase !== 'done') towerDailyState = null;
            if (biCanhState && biCanhState.phase !== 'done') biCanhState = null;
            if (relicState && relicState.phase !== 'done') relicState = null;
            if (uyenNhiState && uyenNhiState.phase !== 'done') uyenNhiState = null;
            if (coThanState && coThanState.phase !== 'done') coThanState = null;
            if (sectDefenseState && sectDefenseState.phase !== 'done') sectDefenseState = null;
            extremeYinState = null;
            memoryState = null;
            dragonState = null;
            maDaoState = null;
            xianYuanIdleCycles = 0;
            arenaRunState.pendingBattle = false;
            arenaRunState.resultRecorded = false;
            arenaRunState.returnRequestedAt = 0;
        }

        function executeCycle(isManualOnce = false) {
            if (!CONFIG.running && !isManualOnce) {
                wasAutoRunning = false;
                return;
            }
            if (isExecuting || bannerGiftBusy) return;
            if (CONFIG.running && typeof quickRunTick === 'function' && quickRunTick()) return;

            if (CONFIG.running && !wasAutoRunning) {
                wasAutoRunning = true;
                if (CONFIG.activeFeature === 'autoTongTian' && CONFIG.towerDailyRoutine) {
                    if (towerDailyState && towerDailyState.phase === 'done' && towerDailyState.failed &&
                        towerDailyState.dayKey === new Date().toDateString()) {
                        towerDailyState = null;
                        sendLog("ℹ️ [Thông Thiên Tháp - Quét mỗi ngày] Lần chạy trước có bước chưa hoàn tất; bắt đầu lại và kiểm tra trạng thái game.", "info");
                    } else if (towerDailyState && towerDailyState.phase === 'done' &&
                        towerDailyState.dayKey === new Date().toDateString()) {
                        sendLog("ℹ️ [Thông Thiên Tháp - Quét mỗi ngày] Hôm nay đã hoàn tất; không lặp lại, chỉ chạy bỏ qua Thông Thiên Tháp.", "info");
                    } else {
                        sendLog("ℹ️ [Thông Thiên Tháp - Quét mỗi ngày] Auto đã bắt đầu/khởi động lại; đang kiểm tra số lượt từ game trước khi quét.", "info");
                    }
                }
                if (CONFIG.activeFeature === 'autoTamTienDai' &&
                    tamTienDaiState && tamTienDaiState.phase === 'done') {
                    sendLog("ℹ️ [Tâm Tiên Đài] Lượt xử lý hôm nay đã hoàn tất trước đó; không nhận hoặc mua lại quà.", "info");
                }
                if (CONFIG.activeFeature === 'autoTienHuu' &&
                    tienHuuState && tienHuuState.phase === 'done' &&
                    tienHuuState.dayKey === new Date().toDateString()) {
                    sendLog("ℹ️ [Tiên Hữu] Tặng nhanh hôm nay đã hoàn tất; không gửi lại.", "info");
                }
                if (CONFIG.activeFeature === 'autoTienMinh') {
                    if (tienMinhState && tienMinhState.phase === 'done' && tienMinhState.failed &&
                        tienMinhState.dayKey === new Date().toDateString()) {
                        // Lần chạy trước có bước lỗi/chưa xác nhận: kiểm tra lại từ máy chủ (bước đã xong sẽ tự bỏ qua).
                        tienMinhState = null;
                        sendLog("ℹ️ [Tiên Minh] Lần chạy trước có bước chưa hoàn tất; bắt đầu lại và kiểm tra trạng thái game.", "info");
                    } else if (tienMinhState && tienMinhState.phase === 'done' &&
                        tienMinhState.dayKey === new Date().toDateString()) {
                        sendLog("ℹ️ [Tiên Minh] Trạng thái hôm nay đã được kiểm tra; không lặp lại thao tác.", "info");
                    } else {
                        sendLog("ℹ️ [Tiên Minh] Auto đã bắt đầu/khởi động lại; đang kiểm tra trạng thái game trước khi tiếp tục.", "info");
                    }
                }
                if (CONFIG.activeFeature === 'autoTroChien') {
                    if (troChienState && troChienState.phase === 'done' && troChienState.failed &&
                        troChienState.dayKey === new Date().toDateString()) {
                        troChienState = null;
                        sendLog("ℹ️ [Trợ Chiến Linh Thú] Lần chạy trước chưa hoàn tất; bắt đầu lại và kiểm tra trạng thái game.", "info");
                    } else if (troChienState && troChienState.phase === 'done' &&
                        troChienState.dayKey === new Date().toDateString()) {
                        sendLog("ℹ️ [Trợ Chiến Linh Thú] Hôm nay đã kiểm tra/nhận; không gửi lại thao tác.", "info");
                    } else {
                        sendLog("ℹ️ [Trợ Chiến Linh Thú] Auto đã bắt đầu/khởi động lại; đang kiểm tra trạng thái game trước khi nhận.", "info");
                    }
                }
                if (CONFIG.activeFeature === 'autoCuoiNgay') {
                    if (cuoiNgayState && cuoiNgayState.phase === 'done' &&
                        cuoiNgayState.dayKey === new Date().toDateString()) {
                        sendLog("ℹ️ [Nhận Cuối Ngày] Trạng thái hôm nay đã được kiểm tra; không lặp lại thao tác.", "info");
                    } else {
                        sendLog("ℹ️ [Nhận Cuối Ngày] Auto đã bắt đầu/khởi động lại; đang kiểm tra trạng thái game trước khi nhận.", "info");
                    }
                }
            }

            if (CONFIG.running && checkRunFinished()) return;

            const now = Date.now();
            const active = CONFIG.activeFeature;
            // Chuỗi thao tác dài, mỗi bước chờ xác nhận từ máy chủ: nhịp ngắn hơn (vẫn ngẫu nhiên).
            const actionInterval = active === 'autoCuoiNgay'
                ? CUOI_NGAY_ACTION_INTERVAL_MS
                : (active === 'autoTamTienDai' ? TAM_TIEN_ACTION_INTERVAL_MS
                    : (active === 'autoOtherTrials' ? OTHER_TRIALS_ACTION_INTERVAL_MS : (CONFIG.intervalMs || 1200)));
            if (now < nextActionAt) return;

            isExecuting = true;
            try {
                const ctx = window;
                if (!ctx.DailyDungeonCtrl && !ctx.TowerCtrl && !ctx.CampCtrl && !ctx.WJCtrl &&
                    !ctx.GodWeaponCtrl && !ctx.HangupCtrl && !ctx.WelfareCtrl && !ctx.RecruitCtrl &&
                    !ctx.FriendCtrl && !ctx.EmailCtrl && !ctx.RankCtrl && !ctx.AcvCtrl &&
                    !ctx.GuildCtrl && !ctx.GldWrCtrl && !ctx.SpiritAnimalCtrl &&
                    CONFIG.activeFeature !== 'autoTienMinh') { runNoteActed(true); return; }

                sendRoleInfo(false);
                hookGameEvents(ctx);

                // Mất kết nối (hộp thoại "Đăng nhập lại"): không gửi thao tác nào, chờ tự vào lại game.
                if (isGameDisconnected(ctx)) {
                    if (!disconnectPauseLogged) {
                        disconnectPauseLogged = true;
                        sendLog("⚠️ [Kết nối] Game đang báo mất kết nối; tạm dừng mọi thao tác, chờ tự vào lại game (nếu bật).", "warn");
                    }
                    runNoteActed(true);
                    return;
                }
                disconnectPauseLogged = false;

                if ((CONFIG.autoArena || CONFIG.autoSkipFight) && handleArenaFightResult(ctx)) {
                    markActed(actionInterval);
                    return;
                }

                // ⚡ BỎ QUA TRẬN ĐẤU THẦN TỐC: LUÔN CHẠY KÈM TẤT CẢ TÍNH NĂNG KHÁC!
                if (CONFIG.autoSkipFight) {
                    if (handleBattle(ctx)) {
                        markActed(actionInterval);
                        return;
                    }
                }

                // ⚡ TỐI ĐA TỐC ĐỘ X3: ÁP DỤNG TOÀN CỤC
                if (CONFIG.maxSpeed && ctx.FightCtrl && ctx.FightCtrl.gInst) {
                    try { const fc = ctx.FightCtrl.gInst(); if (fc.speed < 3) fc.speed = 3; } catch(e) {}
                }

                if (runInfo && runInfo.finishing) runInfo.drained = true;

                // 🎯 ĐỘC QUYỀN 1 CHỨC NĂNG CHÍNH (MUTEX): CHỐNG XUNG ĐỘT
                // 1. ĐẠO THÀNH: Đấu Tiên Đài
                if (active === 'autoArena' || (CONFIG.autoArena && !active)) {
                    if (handleArena(ctx)) { markActed(actionInterval); return; }
                }
                // --- ĐIỀU PHỐI 8 MODULE ƯU TIÊN VÀ CÁC HOẠT ĐỘNG ---
                // [Module 1] Thông Thiên Tháp & Tứ Linh Tháp
                else if (active === 'autoTongTian' || (CONFIG.autoTongTian && !active)) {
                    if (handleTowerAndTuLinh(ctx)) { markActed(actionInterval); return; }
                }
                // [Module 2] Phụ Bản Ngày & Bí Cảnh Tứ Quốc
                else if (active === 'autoDailyDungeon' || (CONFIG.autoDailyDungeon && !active)) {
                    if (handleDailyAndBiCanh(ctx)) { markActed(actionInterval); return; }
                }
                // [Module 3] Thủ Vệ Tứ Phái
                else if (active === 'autoSectDefense' || (CONFIG.autoSectDefense && !active)) {
                    if (handleSectDefense(ctx)) { markActed(actionInterval); return; }
                }
                // [Module 4] Cửu Uyển Nhi, Cổ Thần Địa, Cực Âm Địa
                else if (active === 'autoOtherTrials' || (CONFIG.autoOtherTrials && !active)) {
                    if (handleOtherTrials(ctx)) { markActed(actionInterval); return; }
                }
                // [Module 5] Di Tích Tiên Giới
                else if (active === 'autoImmortalRelic' || (CONFIG.autoImmortalRelic && !active)) {
                    if (handleImmortalRelic(ctx)) { markActed(actionInterval); return; }
                }
                // [Module 6] Minigame Ảo Cảnh Pháp Trận
                else if (active === 'autoMinigameMemory' || (CONFIG.autoMinigameMemory && !active)) {
                    // Ván ghép thẻ tính giờ: nhịp ngắn cố định; máy trạng thái trong memory-minigame.js tự điều tốc từng cặp.
                    handleMinigameMemory(ctx);
                    runNoteActed();
                    nextActionAt = Date.now() + 150;
                    return;
                }
                // [Module 7] Kiếm Hành & Điêu Long Khắc Tinh QTE
                else if (active === 'autoMinigameDragon' || (CONFIG.autoMinigameDragon && !active)) {
                    // Gieo xúc xắc / bấm nhịp có hẹn giờ riêng trong dragon-minigame.js: nhịp ngắn cố định thay vì nhịp chậm chung.
                    handleMinigameDragon(ctx);
                    runNoteActed();
                    nextActionAt = Date.now() + 150;
                    return;
                }
                // [Module 8] Hoạt Động Ngày, Tiên Minh & Nhận Cuối Ngày
                else if (['autoTroChien', 'autoTamTienDai', 'autoTienHuu', 'autoTienMinh', 'autoCuoiNgay'].includes(active)) {
                    const routine = handleDailyRoutine(ctx);
                    // 'wait' = chỉ chờ máy chủ/chuyển bước (chưa gửi gì): không nghỉ kiểu người chơi, kiểm tra lại ngay nhịp sau.
                    if (routine === 'wait') { nextActionAt = Date.now() + 40; runNoteActed(true); return; }
                    if (routine) { markActed(actionInterval, FAST_ROUTINE_FEATURES.includes(active)); return; }
                }
                // 4. LỊCH LUYỆN: Leo Phụ Bản Ngày
                else if (active === 'autoClimbDailyDungeons' || (CONFIG.autoClimbDailyDungeons && !active)) {
                    if (handleClimbDailyDungeons(ctx)) { markActed(actionInterval); return; }
                }
                // 5. LỊCH LUYỆN: Leo Vực U Minh
                else if (active === 'autoClimbYMAbyss' || (CONFIG.autoClimbYMAbyss && !active)) {
                    if (handleClimbYMAbyss(ctx)) { markActed(actionInterval); return; }
                }
                // 6. LỊCH LUYỆN: Đánh Cực Âm Địa
                else if (active === 'autoExtremeYin' || (CONFIG.autoExtremeYin && !active)) {
                    if (handleExtremeYin(ctx)) { markActed(actionInterval); return; }
                }
                // 7. LỊCH LUYỆN: Leo Tứ Linh Trận
                else if (active === 'autoClimbCamp' || (CONFIG.autoClimbCamp && !active)) {
                    if (handleClimbCamp(ctx)) { markActed(actionInterval); return; }
                }
                // 8. LỊCH LUYỆN: Quét Sạch Phụ Bản Đã Vượt
                else if (active === 'autoSweepDungeons' || (CONFIG.autoSweepDungeons && !active)) {
                    if (handleSweepDungeons(ctx)) { markActed(actionInterval); return; }
                }
                // 9. MA ĐẠO tổng hợp: Treo Máy -> Tác Chiến Nhanh -> Ải Chính Tuyến -> Ủy Phái
                else if (active === 'autoMaDao' || (CONFIG.autoMaDao && !active)) {
                    if (handleMaDao(ctx)) { markActed(actionInterval); return; }
                }
                // 12. MA ĐẠO: Quà Tiên Duyên (SK Rút x1000)
                else if (active === 'autoXianYuan' || (CONFIG.autoXianYuan && !active)) {
                    if (handleXianYuan(ctx)) { markActed(actionInterval); return; }
                }

                if (isManualOnce) {
                    sendLog("Đã kiểm tra xong toàn bộ ải phụ bản, đấu tiên đài và nhiệm vụ!", "info");
                }
            } finally {
                isExecuting = false;
            }
        }

        // Nhịp kiểm tra lệch ngẫu nhiên 450-750ms thay vì đúng một nhịp cố định.
        (function scheduleTick() {
            // Nhịp kiểm tra nhanh hơn khi chạy Nhận Cuối Ngày (chuỗi nhiều bước nhỏ, mỗi bước chờ máy chủ xác nhận).
            const fast = CONFIG.running && FAST_ROUTINE_FEATURES.includes(CONFIG.activeFeature);
            setTimeout(() => {
                try { executeCycle(false); } catch (e) { }
                scheduleTick();
            }, fast ? 120 + Math.floor(Math.random() * 120) : 450 + Math.floor(Math.random() * 300));
        })();
    }
})();
