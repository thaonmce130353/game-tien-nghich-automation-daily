
        let arenaRunState = {
            battlesCompleted: 0,
            pendingBattle: false,
            pendingSince: 0,
            resultRecorded: false,
            returnRequestedAt: 0,
            limitReachedLogged: false,
            noAttemptsLogged: false
        };

        // Số trận của lượt chạy được lưu trong sessionStorage của tab để tự vào lại game (làm mới trang)
        // không đặt lại bộ đếm và vượt giới hạn trận.
        const ARENA_RUN_STORAGE_KEY = 'TN_AUTO_ARENA_RUN_V1';

        function saveArenaRunCount() {
            try {
                sessionStorage.setItem(ARENA_RUN_STORAGE_KEY, JSON.stringify({
                    dayKey: new Date().toDateString(),
                    battlesCompleted: arenaRunState.battlesCompleted
                }));
            } catch (e) { }
        }

        function resetArenaRun(resumed = false) {
            let restored = 0;
            if (resumed) {
                try {
                    const saved = JSON.parse(sessionStorage.getItem(ARENA_RUN_STORAGE_KEY) || 'null');
                    if (saved && saved.dayKey === new Date().toDateString()) restored = Number(saved.battlesCompleted) || 0;
                } catch (e) { }
            }
            arenaRunState.battlesCompleted = restored;
            arenaRunState.limitReachedLogged = false;
            arenaRunState.noAttemptsLogged = false;
            saveArenaRunCount();
            if (resumed && CONFIG.activeFeature === 'autoArena') {
                sendLog(`ℹ️ [Đấu Tiên Đài] Chạy tiếp sau khi vào lại game: giữ bộ đếm ${restored} trận đã đánh của lượt này.`, "info");
            }
        }

        function recordArenaBattleResult(succeeded) {
            if (!arenaRunState.pendingBattle || arenaRunState.resultRecorded) return;
            arenaRunState.resultRecorded = true;
            arenaRunState.battlesCompleted++;
            saveArenaRunCount();
            const result = succeeded ? "thắng" : "thua";
            sendLog(`✅ [Đấu Tiên Đài] Máy chủ xác nhận trận ${arenaRunState.battlesCompleted} đã kết thúc (${result}).`, "action");
        }

        function handleArenaFightResult(ctx) {
            try {
                if (!ctx.ViewMgr || !ctx.ViewMgr.gInst) return false;
                const vm = ctx.ViewMgr.gInst();
                if (!vm.viewIsVisible) return false;

                const successVisible = vm.viewIsVisible('arenaFightSucUi');
                const failureVisible = vm.viewIsVisible('arenaFightFailUi');
                if (!successVisible && !failureVisible) {
                    if (arenaRunState.returnRequestedAt && vm.viewIsVisible('arenaUi')) {
                        arenaRunState.pendingBattle = false;
                        arenaRunState.pendingSince = 0;
                        arenaRunState.resultRecorded = false;
                        arenaRunState.returnRequestedAt = 0;
                        const returnedAt = Date.now();
                        lastArenaCheckTime = returnedAt;
                        lastArenaFetchTime = returnedAt;
                        const ac = ctx.ArenaCtrl && ctx.ArenaCtrl.gInst ? ctx.ArenaCtrl.gInst() : null;
                        if (ac && typeof ac.send14201 === 'function') ac.send14201();
                        sendLog("✅ [Đấu Tiên Đài] Đã xác nhận quay lại giao diện khiêu chiến.", "action");
                    }
                    return false;
                }

                recordArenaBattleResult(successVisible);
                const now = Date.now();
                if (!arenaRunState.returnRequestedAt || now - arenaRunState.returnRequestedAt >= 2500) {
                    const ac = ctx.ArenaCtrl && ctx.ArenaCtrl.gInst ? ctx.ArenaCtrl.gInst() : null;
                    if (!ac) {
                        sendLog("⚠️ [Đấu Tiên Đài] Không tìm thấy bộ điều khiển để quay lại sau trận đấu.", "err");
                        return true;
                    }

                    if (typeof ac.backToArena === 'function') {
                        ac.backToArena();
                    } else {
                        vm.closeView('arenaFightSucUi');
                        vm.closeView('arenaFightFailUi');
                        if (typeof ac.opAnUi === 'function') ac.opAnUi();
                    }
                    arenaRunState.returnRequestedAt = now;
                    sendLog("🏟️ [Đấu Tiên Đài] Đã yêu cầu quay lại đài; chờ giao diện xác nhận trước trận tiếp theo.", "info");
                }
                return true;
            } catch (e) {
                sendLog(`⚠️ [Đấu Tiên Đài] Lỗi khi xử lý kết quả trận đấu: ${e.message || e}`, "err");
                return true;
            }
        }

        // 4. TỰ ĐỘNG KHIÊU CHIẾN ĐẤU TIÊN ĐÀI
        function handleArena(ctx) {
            if (!CONFIG.autoArena) return false;
            const now = Date.now();

            try {
                if (!ctx.ArenaCtrl || !ctx.ArenaCtrl.gInst) return false;
                const configuredLimit = Number(CONFIG.arenaBattleLimit);
                const baseLimit = Number.isInteger(configuredLimit) && configuredLimit >= 1 ? configuredLimit : 5;
                // Quét nhanh: chỉ đánh ít trận cho nhanh (không vượt giới hạn đã cài).
                const battleLimit = typeof quickRunActive === 'function' && quickRunActive() ? Math.min(baseLimit, QUICK_ARENA_BATTLES) : baseLimit;
                if (arenaRunState.battlesCompleted >= battleLimit) {
                    if (!arenaRunState.limitReachedLogged) {
                        sendLog(`ℹ️ [Đấu Tiên Đài] Đã đạt giới hạn ${battleLimit} trận của lần chạy Auto; bỏ qua các lượt còn lại.`, "info");
                        arenaRunState.limitReachedLogged = true;
                    }
                    return false;
                }

                const ac = ctx.ArenaCtrl.gInst();
                if (arenaRunState.pendingBattle) {
                    const vm = ctx.ViewMgr && ctx.ViewMgr.gInst ? ctx.ViewMgr.gInst() : null;
                    const fightCanStart = ctx.FightCtrl && ctx.FightCtrl.gInst
                        ? ctx.FightCtrl.gInst().gCanFight()
                        : false;
                    const resultVisible = vm && vm.viewIsVisible &&
                        (vm.viewIsVisible('arenaFightSucUi') || vm.viewIsVisible('arenaFightFailUi'));
                    const arenaVisible = vm && vm.viewIsVisible && vm.viewIsVisible('arenaUi');
                    if (arenaRunState.pendingSince && now - arenaRunState.pendingSince >= 15000 &&
                        arenaVisible && !resultVisible && fightCanStart) {
                        arenaRunState.pendingBattle = false;
                        arenaRunState.pendingSince = 0;
                        arenaRunState.resultRecorded = false;
                        arenaRunState.returnRequestedAt = 0;
                        lastArenaCheckTime = now - 1500;
                        sendLog("⚠️ [Đấu Tiên Đài] Khiêu chiến chưa vào trận sau 15 giây; đã mở khóa và sẽ thử lại.", "warn");
                    } else {
                        return false;
                    }
                }

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
                if (totalAvailable <= 0) {
                    if (!arenaRunState.noAttemptsLogged) {
                        sendLog("ℹ️ [Đấu Tiên Đài] Không còn lượt miễn phí hoặc Đấu Tiên Lệnh; bỏ qua khiêu chiến.", "info");
                        arenaRunState.noAttemptsLogged = true;
                    }
                    return false;
                }

                if (now - lastArenaCheckTime < 2500) return false;

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
                    arenaRunState.pendingBattle = true;
                    arenaRunState.pendingSince = now;
                    arenaRunState.noAttemptsLogged = false;
                    const powerStr = minFc < Infinity && minFc > 0 ? minFc.toLocaleString('vi-VN') : '--';
                    sendLog(`🏟️ [Đấu Tiên Đài] Đang khiêu chiến ${bestName} (LC thấp nhất: ${powerStr}, còn ${freeCount} miễn phí, ${ticketCount} vé)...`, "action");
                    // Danh sách đối thủ được làm mới khi quay lại đài (handleArenaFightResult), không cần gửi thêm 14201 ở đây.
                    return true;
                }
            } catch (e) {
                sendLog(`⚠️ [Đấu Tiên Đài] Lỗi khi xử lý khiêu chiến: ${e.message || e}`, "err");
            }
            return false;
        }
