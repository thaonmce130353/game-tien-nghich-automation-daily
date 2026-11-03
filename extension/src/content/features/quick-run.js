        // =====================================================================
        // QUÉT NHANH (1 CHẠM): chạy lần lượt gần như mọi tính năng, mỗi bước y như bấm BẮT ĐẦU cho một tính năng riêng
        // (CONFIG.activeFeature + runBegin + runFinishProbe/runFinish có sẵn). Bước xong (hoặc lỗi) thì sang bước kế tiếp;
        // Nhận Cuối Ngày luôn là bước cuối để gom hết thư/quà phát sinh. Quy tắc chi tiêu = đúng cài đặt từng tính năng.
        // =====================================================================
        const QUICK_RUN_QUEUE = [
            'autoTamTienDai', 'autoTienHuu', 'autoTroChien', 'autoTienMinh',
            'autoTongTian',            // chế độ quét: Thông Thiên 3 lần (2 free + 1 mua) + Tứ Linh 10 ải mới/tháp, KHÔNG leo
            'autoDailyDungeon', 'autoSectDefense', 'autoOtherTrials', 'autoExtremeYin', 'autoImmortalRelic',
            'autoMinigameMemory', 'autoMinigameDragon', 'autoClimbYMAbyss', 'autoArena', 'autoMaDao', 'autoBanner',
            'autoCuoiNgay'             // luôn cuối cùng
        ];
        const QUICK_STEP_MAX_MS = 10 * 60 * 1000;     // một bước kẹt quá lâu thì bỏ qua, chạy bước kế tiếp
        const QUICK_STEP_GAP_MS = 1500;               // nghỉ giữa hai bước (đóng bảng còn mở, chờ game ổn định)
        // Cờ CONFIG.<khóa tính năng> cũng phải khớp: nhiều tính năng tự kiểm tra cờ của mình (ví dụ `if (!CONFIG.autoClimbYMAbyss) return false`);
        // khi bấm BẮT ĐẦU thường thì checkbox đặt cờ này, nên Quét nhanh phải tự đặt theo từng bước.
        const QUICK_CONFIG_LOCKED_KEYS = ['activeFeature', 'running', 'towerSweepOnly', 'towerDailyRoutine'].concat(QUICK_RUN_QUEUE);
        let quickRun = null;

        function quickRunActive() { return Boolean(quickRun); }

        function quickViewMgr() {
            try {
                const vm = window.ViewMgr && window.ViewMgr.gInst && window.ViewMgr.gInst();
                const cache = window.ViewMgr && window.ViewMgr.gViewMgr && window.ViewMgr.gViewMgr.m_viewCacheGroup;
                if (!vm || typeof vm.viewIsVisible !== 'function' || typeof vm.closeView !== 'function' || !cache) return null;
                return { vm, cache };
            } catch (e) { return null; }
        }

        function quickVisibleViews() {
            const v = quickViewMgr();
            if (!v) return null;
            try { return Object.keys(v.cache).filter((name) => v.vm.viewIsVisible(name)); } catch (e) { return null; }
        }

        // Về màn hình chính giữa hai bước: đóng mọi bảng đang mở mà lúc bắt đầu Quét nhanh chưa mở
        // (chụp danh sách bảng lúc bắt đầu; người dùng nên đứng ở thành chính khi bấm).
        function quickReturnToMain() {
            if (!quickRun || !quickRun.baseViews) return 0;
            const v = quickViewMgr();
            const open = quickVisibleViews();
            if (!v || !open) return 0;
            const names = open.filter((n) => !quickRun.baseViews.has(n) && !/fight|disconnect|loading|guide/i.test(n));
            names.forEach((n) => { try { v.vm.closeView(n); } catch (e) { } });
            return names.length;
        }

        function quickRestoreConfig() {
            if (!quickRun) return;
            CONFIG.activeFeature = quickRun.savedActive;
            CONFIG.towerSweepOnly = false;
            CONFIG.towerDailyRoutine = quickRun.savedTowerDaily;
            quickRun.savedFlags.forEach(([k, v]) => { CONFIG[k] = v; });
        }

        // UPDATE_CONFIG/TOGGLE_AUTO từ HUD không được ghi đè tính năng đang chạy của dãy Quét nhanh.
        function quickRunFilterConfig(cfg) {
            if (!quickRun || !cfg) return cfg;
            const copy = Object.assign({}, cfg);
            QUICK_CONFIG_LOCKED_KEYS.forEach((k) => { delete copy[k]; });
            return copy;
        }

        function quickRunBeginStep(index) {
            const key = QUICK_RUN_QUEUE[index];
            quickRun.idx = index;
            quickRun.stepStartedAt = Date.now();
            CONFIG.activeFeature = key;
            CONFIG.towerSweepOnly = key === 'autoTongTian';
            QUICK_RUN_QUEUE.forEach((k) => { CONFIG[k] = (k === key); });
            if (key === 'autoTongTian') {
                CONFIG.towerDailyRoutine = true;
                if (towerDailyState && towerDailyState.phase === 'done' && towerDailyState.failed) towerDailyState = null;
            }
            resetRunGuards();
            nextActionAt = 0;
            if (typeof resetArenaRun === 'function') resetArenaRun(false);
            runBegin(key);
            sendLog(`▶️ [Quét nhanh] Bước ${index + 1}/${QUICK_RUN_QUEUE.length}: ${RUN_LABELS[key] || key}`, 'run');
            if (key === 'autoBanner') bannerRunOnce();
        }

        function quickRunStart() {
            if (quickRun) return;
            const open = quickVisibleViews();
            quickRun = {
                idx: 0, results: [], startedAt: Date.now(), stepStartedAt: Date.now(), gapUntil: 0,
                savedActive: CONFIG.activeFeature, savedTowerDaily: CONFIG.towerDailyRoutine,
                savedFlags: QUICK_RUN_QUEUE.map((k) => [k, CONFIG[k]]),
                baseViews: open ? new Set(open) : null
            };
            sendLog(`⚡ [Quét nhanh] Bắt đầu ${QUICK_RUN_QUEUE.length} bước, Nhận Cuối Ngày là bước cuối. Dừng bất cứ lúc nào bằng nút TẠM DỪNG.`, 'run');
            quickRunBeginStep(0);
        }

        // Gọi từ runFinish() sau dòng "Hoàn tất" của bước. true = dãy vẫn chạy (không dừng nút Auto).
        function quickRunAfterStep(info, bad, reason) {
            if (!quickRun) return false;
            quickRun.results.push({ key: info.key, label: info.label, bad: Boolean(bad), reason: reason || '', ms: Date.now() - info.startedAt });
            if (quickRun.idx + 1 < QUICK_RUN_QUEUE.length) {
                quickReturnToMain();
                quickRun.gapUntil = Date.now() + QUICK_STEP_GAP_MS;
                return true;
            }
            const r = quickRun;
            quickReturnToMain();
            quickRestoreConfig();
            quickRun = null;
            const badSteps = r.results.filter((x) => x.bad);
            sendLog(`${badSteps.length ? '⚠️' : '✅'} [Quét nhanh] Hoàn tất ${r.results.length}/${QUICK_RUN_QUEUE.length} bước (${runFormatDuration(Date.now() - r.startedAt)})` +
                `${badSteps.length ? '; cần xem lại: ' + badSteps.map((x) => x.label).join(', ') : ''}.`, 'result');
            return false;
        }

        // Người dùng dừng giữa chừng.
        function quickRunAbort() {
            if (!quickRun) return;
            const r = quickRun;
            quickRestoreConfig();
            quickRun = null;
            sendLog(`⏸ [Quét nhanh] Đã dừng sau ${r.results.length}/${QUICK_RUN_QUEUE.length} bước.`, 'run');
        }

        // Đầu mỗi nhịp scheduler: nghỉ giữa bước / bắt đầu bước kế / cắt bước kẹt. true = nhịp này đã được dùng.
        function quickRunTick() {
            if (!quickRun) return false;
            const now = Date.now();
            if (quickRun.gapUntil) {
                if (now < quickRun.gapUntil) { runNoteActed(true); return true; }
                quickRun.gapUntil = 0;
                quickReturnToMain();
                quickRunBeginStep(quickRun.idx + 1);
                return true;
            }
            if (runInfo && now - quickRun.stepStartedAt > QUICK_STEP_MAX_MS) {
                sendLog(`⚠️ [Quét nhanh] Bước "${runInfo.label}" quá ${Math.round(QUICK_STEP_MAX_MS / 60000)} phút chưa xong; bỏ qua, chạy bước kế tiếp.`, 'warn');
                if (typeof resetUnfinishedRunStates === 'function') resetUnfinishedRunStates();
                runFinish('quá thời gian tối đa của bước', true);
                return true;
            }
            return false;
        }
