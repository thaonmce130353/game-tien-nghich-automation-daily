        // =====================================================================
        // QUÉT NHANH (1 CHẠM): chạy lần lượt gần như mọi tính năng, mỗi bước y như bấm BẮT ĐẦU cho một tính năng riêng
        // (CONFIG.activeFeature + runBegin + runFinishProbe/runFinish có sẵn). Bước xong (hoặc lỗi) thì sang bước kế tiếp;
        // Nhận Cuối Ngày luôn là bước cuối để gom hết thư/quà phát sinh. Quy tắc chi tiêu = đúng cài đặt từng tính năng.
        // =====================================================================
        const QUICK_RUN_QUEUE = [
            'autoTamTienDai', 'autoTienHuu', 'autoThaiCo', 'autoTroChien', 'autoTienMinh',
            'autoTongTian',            // chế độ quét: Thông Thiên 3 lần (2 free + 1 mua) + Tứ Linh 10 ải mới/tháp, KHÔNG leo
            'autoDailyDungeon', 'autoSectDefense', 'autoOtherTrials', 'autoExtremeYin', 'autoImmortalRelic',
            'autoMinigameMemory', 'autoMinigameDragon', 'autoClimbYMAbyss', 'autoArena', 'autoMaDao', 'autoBanner',
            'autoCuoiNgay'             // luôn cuối cùng
        ];
        const QUICK_STEP_MAX_MS = 10 * 60 * 1000;     // một bước kẹt quá lâu thì bỏ qua, chạy bước kế tiếp
const QUICK_STEP_MAX_MS_BY_KEY = {};            // giới hạn riêng theo bước (mặc định mọi bước 10 phút)
function quickStepMaxMs(key) { return QUICK_STEP_MAX_MS_BY_KEY[key] || QUICK_STEP_MAX_MS; }
        const QUICK_STEP_GAP_MS = 1500;               // nghỉ giữa hai bước (đóng bảng còn mở, chờ game ổn định)
        // Cờ CONFIG.<khóa tính năng> cũng phải khớp: nhiều tính năng tự kiểm tra cờ của mình (ví dụ `if (!CONFIG.autoClimbYMAbyss) return false`);
        // khi bấm BẮT ĐẦU thường thì checkbox đặt cờ này, nên Quét nhanh phải tự đặt theo từng bước.
        const QUICK_CONFIG_LOCKED_KEYS = ['activeFeature', 'running', 'towerSweepOnly', 'towerDailyRoutine', 'quickSteps'].concat(QUICK_RUN_QUEUE);

        // Các bước người dùng chọn (CONFIG.quickSteps = mảng khóa, null = tất cả). Thứ tự luôn theo QUICK_RUN_QUEUE; không đổi được.
        function quickSelectedQueue() {
            const sel = CONFIG.quickSteps;
            if (!Array.isArray(sel)) return QUICK_RUN_QUEUE.slice();
            const q = QUICK_RUN_QUEUE.filter((k) => sel.includes(k));
            return q.length ? q : QUICK_RUN_QUEUE.slice();
        }
        // Dãy đang áp dụng: dãy đã chốt lúc bắt đầu chạy (không đổi giữa chừng), nếu không thì dãy đang chọn.
        function quickQueueNow() { return quickRun ? quickRun.queue : quickSelectedQueue(); }
        let quickRun = null;
const QUICK_ARENA_BATTLES = 3;     // Đấu Tiên Đài trong Quét nhanh: tối đa 3 trận

        // ---- Lưu tiến độ để dừng giữa chừng rồi TIẾP TỤC (hoặc chạy lại từ đầu). sessionStorage: sống qua lần tải lại trang
        // (tự vào lại game), chỉ hợp lệ trong ngày. idx = bước sẽ chạy tiếp theo; results = các bước đã xong.
        const QUICK_SAVE_KEY = 'tn-quick-run-saved';
const QUICK_ACTIVE_KEY = 'tn-quick-run-active';   // đang chạy dở khi trang bị tải lại (tự vào lại game) -> tiếp tục dãy
        function quickSaveLoad() {
            try {
                const o = JSON.parse(sessionStorage.getItem(QUICK_SAVE_KEY) || 'null');
                if (o && o.day === new Date().toDateString() && Array.isArray(o.keys) && o.keys.join() === quickSelectedQueue().join() && o.total === o.keys.length &&
                    Number.isInteger(o.idx) && o.idx > 0 && o.idx < o.total && Array.isArray(o.results)) return o;
            } catch (e) { }
            return null;
        }
        function quickSaveWrite(nextIdx, results, keys) {
            keys = keys || quickQueueNow();
            try {
                if (nextIdx <= 0) { sessionStorage.removeItem(QUICK_SAVE_KEY); return; }
                sessionStorage.setItem(QUICK_SAVE_KEY, JSON.stringify({ day: new Date().toDateString(), total: keys.length, keys, idx: nextIdx, results }));
            } catch (e) { }
        }
        function quickSaveClear() { try { sessionStorage.removeItem(QUICK_SAVE_KEY); } catch (e) { } }
        function quickActiveFlag(on) { try { if (on) sessionStorage.setItem(QUICK_ACTIVE_KEY, '1'); else sessionStorage.removeItem(QUICK_ACTIVE_KEY); } catch (e) { } }
        // Sau khi tự vào lại game: dãy Quét nhanh đang chạy dở thì chạy tiếp từ bước đã lưu (không chạy nhầm tính năng đang chọn trên HUD).
        function quickRunShouldResumeAfterReload() {
            try { return sessionStorage.getItem(QUICK_ACTIVE_KEY) === '1' && Boolean(quickSaveLoad()); } catch (e) { return false; }
        }

        // Báo cho HUD biết trạng thái Quét nhanh: saved = tiến độ đã lưu (null = không có hoặc đang chạy), active = đang chạy bước nào.
        function quickReportSaved(completed) {
            let saved = null, active = null;
            if (quickRun) {
                active = { idx: quickRun.idx, total: quickRun.queue.length, label: RUN_LABELS[quickRun.queue[quickRun.idx]] || quickRun.queue[quickRun.idx] };
            } else {
                const o = quickSaveLoad();
                if (o) saved = { idx: o.idx, total: o.total, label: RUN_LABELS[o.keys[o.idx]] || o.keys[o.idx], done: o.results.length };
            }
            try { window.top.postMessage({ source: 'TIEN_NGHICH_AUTO_GAME', action: 'QUICK_RUN_SAVED', saved, active, total: quickQueueNow().length, steps: QUICK_RUN_QUEUE.map((k) => ({ key: k, label: RUN_LABELS[k] || k })), selected: quickSelectedQueue(), completed: Boolean(completed) }, '*'); } catch (e) { }
        }

        // Cài đặt chọn bước đổi: tiến độ tạm dừng cũ không còn khớp dãy mới -> xóa (không đụng khi đang chạy; HUD cũng khóa lúc đó).
        function quickStepsConfigChanged() {
            if (quickRun) return;
            try {
                const o = JSON.parse(sessionStorage.getItem(QUICK_SAVE_KEY) || 'null');
                if (o && (!Array.isArray(o.keys) || o.keys.join() !== quickSelectedQueue().join())) quickSaveClear();
            } catch (e) { }
            quickReportSaved();
        }

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
            const key = quickRun.queue[index];
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
            quickReportSaved();
            sendLog(`▶️ [Quét nhanh] Bước ${index + 1}/${quickRun.queue.length}: ${RUN_LABELS[key] || key}`, 'run');
            if (key === 'autoBanner') bannerRunOnce();
        }

        function quickRunStart(mode) {
            if (quickRun) return;
            const open = quickVisibleViews();
            const saved = mode === 'resume' ? quickSaveLoad() : null;
            quickSaveClear();
            quickActiveFlag(true);
            quickRun = {
                queue: quickSelectedQueue(),
                idx: saved ? saved.idx : 0, results: saved ? saved.results : [], startedAt: Date.now(), stepStartedAt: Date.now(), gapUntil: 0,
                savedActive: CONFIG.activeFeature, savedTowerDaily: CONFIG.towerDailyRoutine,
                savedFlags: QUICK_RUN_QUEUE.map((k) => [k, CONFIG[k]]),
                baseViews: open ? new Set(open) : null
            };
            if (saved) {
                quickRun.priorMs = saved.results.reduce((t, x) => t + (x.ms || 0), 0);
                sendLog(`⏯ [Quét nhanh] Tiếp tục từ bước ${saved.idx + 1}/${quickRun.queue.length} (đã xong ${saved.results.length} bước).`, 'run');
            } else {
                sendLog(`⚡ [Quét nhanh] Bắt đầu ${quickRun.queue.length} bước${quickRun.queue.includes('autoCuoiNgay') ? ', Nhận Cuối Ngày là bước cuối' : ''}. Dừng bất cứ lúc nào bằng nút TẠM DỪNG (có thể tiếp tục sau).`, 'run');
            }
            quickReportSaved();
            quickRunBeginStep(quickRun.idx);
        }

        // Gọi từ runFinish() sau dòng "Hoàn tất" của bước. true = dãy vẫn chạy (không dừng nút Auto).
        function quickRunAfterStep(info, bad, reason) {
            if (!quickRun) return false;
            quickRun.results.push({ key: info.key, label: info.label, bad: Boolean(bad), reason: reason || '', ms: Date.now() - info.startedAt });
            if (quickRun.idx + 1 < quickRun.queue.length) {
                quickSaveWrite(quickRun.idx + 1, quickRun.results, quickRun.queue);
                quickReturnToMain();
                quickRun.gapUntil = Date.now() + QUICK_STEP_GAP_MS;
                return true;
            }
            const r = quickRun;
            quickReturnToMain();
            quickRestoreConfig();
            quickRun = null;
            quickSaveClear();
            quickActiveFlag(false);
            quickReportSaved(true);     // xong cả dãy: HUD bỏ nút TIẾP TỤC / CHẠY LẠI TỪ ĐẦU
            const badSteps = r.results.filter((x) => x.bad);
            sendLog(`${badSteps.length ? '⚠️' : '✅'} [Quét nhanh] Hoàn tất ${r.results.length}/${r.queue.length} bước (${runFormatDuration((r.priorMs || 0) + Date.now() - r.startedAt)})` +
                `${badSteps.length ? '; cần xem lại: ' + badSteps.map((x) => x.label).join(', ') : ''}.`, 'result');
            return false;
        }

        // Người dùng dừng giữa chừng.
        function quickRunAbort() {
            if (!quickRun) return;
            const r = quickRun;
            // Dừng giữa hai bước: bước đó đã xong, chạy tiếp từ bước sau; dừng giữa bước: làm lại bước đang dở.
            const nextIdx = r.gapUntil ? r.idx + 1 : r.idx;
            quickRestoreConfig();
            quickRun = null;
            quickActiveFlag(false);
            quickSaveWrite(nextIdx, r.results, r.queue);
            quickReportSaved();
            sendLog(`⏸ [Quét nhanh] Đã dừng sau ${r.results.length}/${r.queue.length} bước.` +
                (nextIdx > 0 && nextIdx < r.queue.length ? ` Đã lưu tiến độ: bấm TIẾP TỤC QUÉT NHANH để chạy tiếp từ bước ${nextIdx + 1}, hoặc CHẠY LẠI TỪ ĐẦU.` : ''), 'run');
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
            if (runInfo && now - quickRun.stepStartedAt > quickStepMaxMs(runInfo.key)) {
                sendLog(`⚠️ [Quét nhanh] Bước "${runInfo.label}" quá ${Math.round(quickStepMaxMs(runInfo.key) / 60000)} phút chưa xong; bỏ qua, chạy bước kế tiếp.`, 'warn');
                if (typeof resetUnfinishedRunStates === 'function') resetUnfinishedRunStates();
                runFinish('quá thời gian tối đa của bước', true);
                return true;
            }
            return false;
        }
