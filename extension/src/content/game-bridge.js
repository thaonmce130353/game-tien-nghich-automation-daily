    const isGameContext = !!window.DailyDungeonCtrl || !isTopWindow;
    if (isGameContext) {
        const failCounts = {};
        let isExecuting = false;
        let nextActionAt = 0;
        let isTowerChallenging = false;
        let waitingForFloorUpdate = false;
        let lastPassedFloor = 0;
        let sweptDayKey = '';
        let sweepPending = null;          // quét miễn phí PB Ngày đã gửi, đang chờ xác nhận (xem sweepConfirmTick)
        let runInfo = null;               // lượt chạy hiện tại: { key, label, startedAt, lastActAt, problems }

        // Nhịp thao tác giống người chơi: nghỉ ngẫu nhiên quanh nhịp gốc, thỉnh thoảng (~5%) dừng lâu hơn
        // (thay cho nhịp cố định đều đặn dễ bị nhận ra).
        // noLongPause: bỏ cú nghỉ dài ngẫu nhiên (5%) cho chuỗi nhiều bước nhỏ liên tiếp như Nhận Cuối Ngày.
        function humanDelay(baseMs, noLongPause) {
            const base = baseMs > 0 ? baseMs : 1200;
            let delay = base * (0.85 + Math.random() * 0.75);
            if (!noLongPause && Math.random() < 0.05) delay += 2000 + Math.random() * 3500;
            return Math.round(delay);
        }

        // Giới hạn số lần thử cùng một mục tiêu trong một lượt chạy Auto (tránh gửi lặp vô hạn khi thua/lỗi).
        const MAX_TARGET_ATTEMPTS = 3;
        const targetAttempts = {};
        const unsupportedLogged = {};
        const runResetHooks = [];         // các module đăng ký đặt lại trạng thái khi bắt đầu lượt Auto mới

        function tryAttemptTarget(key, label, maxAttempts, giveUpLogType) {
            const max = maxAttempts || MAX_TARGET_ATTEMPTS;
            const count = targetAttempts[key] || 0;
            if (count >= max) {
                if (count === max) {
                    targetAttempts[key] = count + 1;
                    sendLog(`⏸️ ${label}: đã thử ${max} lần chưa qua; dừng thử mục tiêu này trong lượt Auto này.`, giveUpLogType || "warn");
                }
                return false;
            }
            targetAttempts[key] = count + 1;
            return true;
        }

        function clearTargetAttempts(key) {
            delete targetAttempts[key];
        }

        // Ghi log một lần mỗi lượt Auto cho phần chưa hỗ trợ trên bản game hiện tại.
        function logUnsupportedOnce(key, message) {
            if (unsupportedLogged[key]) return;
            unsupportedLogged[key] = true;
            sendLog(message, "warn");
        }

        // Ghi log một lần mỗi lượt Auto với mức tùy chọn (khác logUnsupportedOnce luôn là cảnh báo).
        function logOnce(key, message, type) {
            if (unsupportedLogged[key]) return;
            unsupportedLogged[key] = true;
            sendLog(message, type || "info");
        }

        function resetRunGuards() {
            for (const k of Object.keys(targetAttempts)) delete targetAttempts[k];
            for (const k of Object.keys(unsupportedLogged)) delete unsupportedLogged[k];
            for (const k of Object.keys(failCounts)) delete failCounts[k];
            runResetHooks.forEach((reset) => { try { reset(); } catch (e) { } });
        }

        // =====================================================================
        // BẢNG ĐỘI HÌNH (embattleUi): bấm "Lên trận nhanh" -> KIỂM TRA ô đội hình đã có tướng -> mới bấm "Bắt đầu".
        // Không gọi saveEmbattleLogic ngay sau khi xếp: nếu bảng chưa kịp cập nhật thì lưu lên máy chủ một đội hình trống.
        // Nút "Bắt đầu" (cBtnH2) tự lưu đội hình hiện tại và tự kiểm tra điều kiện của từng loại bảng.
        // st = { at, clicked, starts } do bên gọi giữ (đặt lại về null khi bảng đóng).
        // =====================================================================
        const EMBATTLE_ARRANGE_TRIES = 3;     // số lần bấm "Lên trận nhanh" mà ô đội hình vẫn trống thì bỏ cuộc
        const EMBATTLE_START_TRIES = 3;       // số lần bấm "Bắt đầu" mà bảng vẫn còn mở thì bỏ cuộc

        function embattleFilledCount(ui) {
            try {
                return (ui.modelItemList || []).filter((it) => {
                    const d = it && typeof it.getItemData === 'function' ? it.getItemData() : null;
                    return Boolean(d && (d.hero_data || d.heroId));
                }).length;
            } catch (e) { return 0; }
        }

        function embattleTeamReady(ui) {
            if (embattleFilledCount(ui) <= 0) return false;
            // Bảng Bí Cảnh Tứ Quốc có điều kiện riêng (ví dụ cần 1 Tu Sĩ Nghịch Tu): dùng chính hàm kiểm tra của game.
            try {
                const et = window.EmbattleConst && window.EmbattleConst.embattleType;
                if (et && typeof ui.checkSiGuoCond === 'function' && ui.embattleType >= et.fairyland_wei && ui.embattleType <= et.fairyland_qun) {
                    return Boolean(ui.checkSiGuoCond());
                }
            } catch (e) { return false; }
            return true;
        }

        // 'wait' | 'arranged' (vừa bấm Lên trận nhanh) | 'ready' (đội hình hợp lệ: bên gọi bấm Bắt đầu rồi gọi embattleMarkStarted) | 'failed'
        function embattleStep(ui, st, now) {
            if (!st.at) st.at = now;
            if (now - st.at < humanDelay(900)) return 'wait';
            if ((st.starts || 0) >= EMBATTLE_START_TRIES) return 'failed';
            if ((st.clicked || 0) > 0 && embattleTeamReady(ui)) return 'ready';
            if ((st.clicked || 0) >= EMBATTLE_ARRANGE_TRIES || typeof ui.oneKeyEmbattleLogic !== 'function') return 'failed';
            st.clicked = (st.clicked || 0) + 1;
            st.at = now;
            // Hàm của game có thể ném lỗi (ví dụ thiếu ải đang chọn); giữ lỗi lại để báo rõ thay vì im lặng.
            try { ui.oneKeyEmbattleLogic(0); st.lastError = ''; } catch (e) { st.lastError = String((e && e.message) || e); }
            return 'arranged';
        }

        // Mô tả ngắn tình trạng bảng đội hình khi xếp thất bại (đưa vào log lỗi).
        function embattleDiagnose(ui, st) {
            const total = ui && ui.modelItemList ? ui.modelItemList.length : 0;
            return `ô có tướng ${embattleFilledCount(ui)}/${total}${st && st.lastError ? '; lỗi từ game: ' + st.lastError : ''}`;
        }

        function embattleMarkStarted(st) {
            st.starts = (st.starts || 0) + 1;
            st.clicked = 0;
            st.at = 0;
        }

        // =====================================================================
        // VÒNG ĐỜI MỘT LƯỢT CHẠY (chuẩn hóa cho mọi tính năng)
        //   - Mỗi lần chỉ chạy MỘT tính năng (CONFIG.activeFeature).
        //   - Xong việc: ghi dòng kết quả rồi tự dừng nút Auto (runFinish), trừ tính năng treo máy liên tục.
        //   - Dừng giữa chừng: đặt lại trạng thái dở dang để tính năng khác/lần sau chạy sạch (runAbort).
        // =====================================================================
        const RUN_LABELS = {
            autoArena: 'Đấu Tiên Đài', autoTongTian: 'Thông Thiên Tháp & Tứ Linh Tháp', autoDailyDungeon: 'Phụ Bản Ngày & Bí Cảnh Tứ Quốc',
            autoSectDefense: 'Thủ Vệ Tứ Phái', autoOtherTrials: 'Cửu Uyển Nhi & Cổ Thần Địa',
            autoImmortalRelic: 'Di Tích Tiên Giới', autoMinigameMemory: 'Ảo Cảnh Pháp Trận', autoMinigameDragon: 'Kiếm Hành & Điêu Long',
            autoTroChien: 'Trợ Chiến Linh Thú', autoTamTienDai: 'Tâm Tiên Đài', autoTienHuu: 'Tiên Hữu', autoThaiCo: 'Thái Cổ Thu Hà', autoTienMinh: 'Tiên Minh',
            autoCuoiNgay: 'Nhận Cuối Ngày', autoClimbDailyDungeons: 'Leo Phụ Bản Ngày', autoClimbYMAbyss: 'Vực U Minh',
            autoExtremeYin: 'Cực Âm Địa', autoClimbCamp: 'Leo Tứ Linh Trận', autoSweepDungeons: 'Quét Phụ Bản',
            autoMaDao: 'Ma Đạo Tổng Hợp', autoXianYuan: 'Quà Tiên Duyên', autoBanner: 'Tướng Thần Lâm / Đạp Thiên'
        };

        // Bảng xác nhận/thông báo/phần thưởng còn sót (hộp thoại, tips, nhận quà) chặn thao tác của tính năng kế tiếp.
        // Chỉ đóng bảng có tên dạng popup; không đụng màn hình chính, mất kết nối, trận đánh.
        const STRAY_POPUP_RE = /(Tips?|Alert|Confirm|Notice|Prompt|Rward|Reward|GOver)Ui$/i;
        const STRAY_POPUP_KEEP_RE = /disconnect|loading|guide|fight|login|reconnect/i;
        function closeStrayPopups() {
            let closed = 0;
            try {
                const vm = window.ViewMgr && window.ViewMgr.gInst && window.ViewMgr.gInst();
                if (!vm) return 0;
                const scan = (cache, close) => {
                    if (!cache || typeof close !== 'function') return;
                    Object.keys(cache).forEach((name) => {
                        if (!STRAY_POPUP_RE.test(name) || STRAY_POPUP_KEEP_RE.test(name)) return;
                        const v = cache[name];
                        if (!v || !v.visible) return;
                        try { close.call(vm, name); closed++; } catch (e) { }
                    });
                };
                scan(vm.m_viewCacheGroup || (window.ViewMgr.gViewMgr && window.ViewMgr.gViewMgr.m_viewCacheGroup), vm.closeView);
                scan(vm.m_upViewCacheGroup, vm.closeUpView);
            } catch (e) { }
            return closed;
        }

        function runBegin(key) {
            closeStrayPopups();     // bước dọn đầu tiên: đóng bảng xác nhận/thông báo còn mở từ tính năng trước
            runInfo = { key, label: RUN_LABELS[key] || key || 'Auto', startedAt: Date.now(), lastActAt: Date.now(), acts: 0, problems: 0 };
        }

        // touch=true: chỉ báo còn sống (game chưa sẵn sàng/đang mất kết nối), không tính là đã làm việc.
        function runNoteActed(touchOnly) {
            if (!runInfo) return;
            runInfo.lastActAt = Date.now();
            if (!touchOnly) runInfo.acts++;
        }

        function runFormatDuration(ms) {
            const sec = Math.max(0, Math.round(ms / 1000));
            return sec >= 60 ? `${Math.floor(sec / 60)}p${sec % 60}s` : `${sec}s`;
        }

        // Tính năng đã xong việc: ghi một dòng kết quả, dừng Auto (nút về trạng thái dừng).
        function runFinish(reason, failed) {
            const info = runInfo;
            if (!info) return;
            runInfo = null;
            const bad = Boolean(failed) || info.problems > 0;
            sendLog(`${bad ? '⚠️' : '✅'} [${info.label}] Hoàn tất${reason ? ': ' + reason : ''} (${runFormatDuration(Date.now() - info.startedAt)})` +
                `${bad ? '; có bước chưa hoàn tất/lỗi, xem các dòng ⚠️/❌ phía trên' : ''}.`, 'run');
            // Dãy Quét nhanh: sang bước kế tiếp, không dừng nút Auto.
            if (typeof quickRunAfterStep === 'function' && quickRunAfterStep(info, bad, reason)) return;
            CONFIG.running = false;
            try {
                window.top.postMessage({ source: 'TIEN_NGHICH_AUTO_GAME', action: 'AUTO_FINISHED' }, '*');
            } catch (e) { }
        }

        // Người dùng dừng giữa chừng: bỏ trạng thái dở dang (giữ bản ghi "hôm nay đã xong" chống làm lại/mua lại).
        function runAbort() {
            const info = runInfo;
            runInfo = null;
            isTowerChallenging = false;
            waitingForFloorUpdate = false;
            nextActionAt = 0;
            if (typeof bannerRequestAbort === 'function') bannerRequestAbort();
            if (typeof quickRunAbort === 'function') quickRunAbort();
            for (const k of Object.keys(failCounts)) delete failCounts[k];
            for (const k of Object.keys(targetAttempts)) delete targetAttempts[k];
            if (typeof resetUnfinishedRunStates === 'function') resetUnfinishedRunStates();
            if (info) sendLog(`⏸ [${info.label}] Đã dừng giữa chừng; đã đặt lại trạng thái dở dang để chạy lại cho sạch.`, 'run');
        }

        let lastDailyClimbIndex = 0;
        let lastDailyClimbTime = 0;
        let lastCampClimbIndex = 0;
        let lastCampClimbTime = 0;
        let lastAbyssClimbTime = 0;
        let lastArenaCheckTime = 0;
        let lastArenaFetchTime = 0;
        function sendLog(message, logType = 'info') {
            try {
                if (runInfo && (logType === 'warn' || logType === 'err' || logType === 'error')) runInfo.problems++;
                if (typeof addLogToUI === 'function') { try { addLogToUI(message, logType); } catch(e){} }
                window.top.postMessage({
                    source: 'TIEN_NGHICH_AUTO_GAME',
                    action: 'LOG',
                    message: message,
                    logType: logType
                }, '*');
            } catch (e) { }
        }

        function parseLongVal(val) {
            if (val === null || val === undefined) return 0;
            if (typeof val === 'number') return val;
            if (typeof val === 'string') return Number(val) || 0;
            if (typeof val === 'object') {
                if (window.CommonUtils && typeof window.CommonUtils.to64Num === 'function') {
                    try { const n = window.CommonUtils.to64Num(val); if (n) return n; } catch(e) {}
                }
                if (typeof val.dataNum === 'number') return val.dataNum;
                if (val.dataStr) return Number(val.dataStr) || 0;
                if (typeof val.toNumber === 'function') {
                    try { return val.toNumber(); } catch(e) {}
                }
                if (typeof val.toString === 'function') {
                    try {
                        const s = val.toString();
                        if (s && s !== '[object Object]') return Number(s) || 0;
                    } catch(e) {}
                }
                if (val.low !== undefined && val.high !== undefined) {
                    return (val.high * 4294967296) + (val.low >>> 0);
                }
            }
            return 0;
        }

        function parseUidVal(val) {
            if (val === null || val === undefined) return '';
            if (typeof val === 'string') return val.trim();
            if (typeof val === 'number') return String(val);
            if (typeof val === 'object') {
                if (val.dataStr) return String(val.dataStr);
                if (typeof val.dataNum === 'number') return String(val.dataNum);
                if (typeof val.toString === 'function') {
                    try {
                        const s = val.toString();
                        if (s && s !== '[object Object]') return s;
                    } catch(e) {}
                }
                if (val.low !== undefined && val.high !== undefined) {
                    return String((val.high * 4294967296) + (val.low >>> 0));
                }
            }
            return '';
        }


        let lastRoleSignature = '';
        let lastRoleSentAt = 0;

        function sendRoleInfo(force = false) {
            try {
                let role = null;
                let curlModel = null;
                let inst = null;

                if (window.RoleCtrl && window.RoleCtrl.gInst) {
                    try {
                        inst = window.RoleCtrl.gInst();
                        if (typeof inst.getRoleInfo === 'function') role = inst.getRoleInfo();
                        if (!role && inst.roleData) role = inst.roleData;
                        if (!role && typeof inst.getCurlModel === 'function') curlModel = inst.getCurlModel();
                    } catch(e) {}
                }

                if (!role && window.PlayerCtrl && window.PlayerCtrl.gInst) {
                    try {
                        const pInst = window.PlayerCtrl.gInst();
                        if (typeof pInst.getPlayerInfo === 'function') role = pInst.getPlayerInfo();
                    } catch(e) {}
                }

                let roleName = '';
                let lvl = 0;
                let power = 0;
                let roleUid = '';

                if (role) {
                    roleName = role.name || role.role_name || role.roleName || role.nick || '';
                    if (role.lev !== undefined && role.lev !== null) lvl = Number(role.lev) || 0;
                    else if (role.level !== undefined && role.level !== null) lvl = Number(role.level) || 0;
                    else if (role.lv !== undefined && role.lv !== null) lvl = Number(role.lv) || 0;

                    power = parseLongVal(role.fc) || parseLongVal(role.power) || parseLongVal(role.fight) || 0;
                    roleUid = parseUidVal(role.rid) || parseUidVal(role.uid) || parseUidVal(role.role_id) || parseUidVal(role.roleId) || parseUidVal(role.id) || parseUidVal(role.playerId) || '';
                }

                if (!roleName && curlModel) {
                    roleName = curlModel.name || '';
                    if (!lvl) lvl = Number(curlModel.lev || curlModel.level || 0);
                    if (!power) power = parseLongVal(curlModel.fc) || 0;
                    if (!roleUid) roleUid = parseUidVal(curlModel.uid) || parseUidVal(curlModel.rid) || '';
                }

                // Fallback lấy level qua getRoleLv()
                if (!lvl && inst && typeof inst.getRoleLv === 'function') {
                    try { lvl = Number(inst.getRoleLv()) || 0; } catch(e) {}
                }

                // Fallback lấy UID qua rid.dataStr hoặc id.dataStr
                if (!roleUid && role && role.rid) {
                    if (role.rid.dataStr) roleUid = String(role.rid.dataStr);
                    else if (typeof role.rid === 'object' && role.rid.low !== undefined) roleUid = parseLongVal(role.rid).toString();
                }
                if (!roleUid && role && role.id) {
                    if (role.id.dataStr) roleUid = String(role.id.dataStr);
                    else if (typeof role.id === 'object' && role.id.low !== undefined) roleUid = parseLongVal(role.id).toString();
                }

                if (!roleUid && window.zsSdk && window.zsSdk.roleId) {
                    roleUid = String(window.zsSdk.roleId);
                }
                if (!roleName && window.zsSdk && window.zsSdk.roleName) {
                    roleName = String(window.zsSdk.roleName);
                }
                if (!roleUid && window.zsChannelSdk && window.zsChannelSdk.roleId) {
                    roleUid = String(window.zsChannelSdk.roleId);
                }

                if (!roleUid && roleName) {
                    roleUid = roleName;
                }

                if (!roleName && !roleUid) return;

                const rolePayload = {
                    uid: roleUid,
                    name: roleName,
                    level: lvl,
                    power: power
                };

                // Chỉ gửi khi thông tin đổi hoặc định kỳ 15s (giảm tải postMessage/DOM/localStorage).
                const signature = JSON.stringify(rolePayload);
                const sentAt = Date.now();
                if (!force && signature === lastRoleSignature && sentAt - lastRoleSentAt < 15000) return;
                const nameChanged = !lastRoleSignature || JSON.parse(lastRoleSignature).name !== roleName;
                lastRoleSignature = signature;
                lastRoleSentAt = sentAt;

                try {
                    if (typeof updateRoleDisplay === 'function') { try { updateRoleDisplay(rolePayload); } catch(e){} }
                    if (roleName && nameChanged) localStorage.setItem('TN_LAST_ROLE_NAME', roleName);
                } catch(e) {}

                try {
                    window.top.postMessage({
                        source: 'TIEN_NGHICH_AUTO_GAME',
                        action: 'ROLE_INFO',
                        role: rolePayload
                    }, '*');
                } catch(e) {}

                // Nếu có Android Native Interface, đồng bộ ngay lập tức
                try {
                    if (window.TNAndroid && typeof window.TNAndroid.onRoleDetected === 'function') {
                        window.TNAndroid.onRoleDetected(roleUid, roleName, lvl, power);
                    }
                } catch(e) {}

            } catch (e) { }
        }

        setInterval(() => sendRoleInfo(false), 3000);

        window.addEventListener('message', (event) => {
            const data = event.data;
            if (!data || data.source !== 'TIEN_NGHICH_AUTO_HUD') return;

            if (data.action === 'REQUEST_ROLE_INFO') {
                sendRoleInfo(true);
                if (typeof quickReportSaved === 'function') quickReportSaved();
                return;
            } else if (data.action === 'UPDATE_CONFIG') {
                Object.assign(CONFIG, quickRunFilterConfig(data.config));
                if (typeof quickStepsConfigChanged === 'function') quickStepsConfigChanged();
            } else if (data.action === 'TOGGLE_AUTO') {
                const wasRunning = CONFIG.running;
                CONFIG.running = data.running;
                if (data.config) Object.assign(CONFIG, quickRunFilterConfig(data.config));
                const quickResumeAfterReload = CONFIG.running && !wasRunning && data.resumed && !data.quick &&
                    typeof quickRunShouldResumeAfterReload === 'function' && quickRunShouldResumeAfterReload();
                if (CONFIG.running && !wasRunning && (data.quick || quickResumeAfterReload)) {
                    // QUÉT NHANH: dãy nhiều bước (features/quick-run.js), mỗi bước như bấm BẮT ĐẦU cho một tính năng.
                    wasAutoRunning = true;
                    resetRunGuards();
                    isTowerChallenging = false;
                    waitingForFloorUpdate = false;
                    quickRunStart(quickResumeAfterReload ? 'resume' : data.quickMode);
                    executeCycle(false);
                } else if (CONFIG.running) {
                    // resumed: Auto được bật lại sau khi tự vào lại game (không phải người dùng bấm BẮT ĐẦU).
                    const resumed = !!data.resumed;
                    if (!wasRunning) {
                        resetRunGuards();
                        nextActionAt = 0;
                        if (typeof resetArenaRun === 'function') resetArenaRun(resumed);
                        runBegin(CONFIG.activeFeature);
                        if (!resumed && CONFIG.activeFeature === 'autoBanner') bannerRunOnce();
                        if (resumed && CONFIG.activeFeature === 'autoBanner') {
                            runFinish('không chạy lại lượt này sau khi vào lại game (chỉ chạy 1 lượt mỗi lần bấm BẮT ĐẦU)');
                            return;
                        }
                        if (resumed && !CONFIG.activeFeature) {
                            CONFIG.running = false;
                            try {
                                window.top.postMessage({
                                    source: 'TIEN_NGHICH_AUTO_GAME',
                                    action: 'AUTO_FINISHED',
                                    message: 'ℹ️ [Vào lại game] Không có tính năng chính để chạy tiếp; Auto tự dừng. Bấm BẮT ĐẦU nếu cần chạy lại Banner Hero.'
                                }, '*');
                            } catch (e) { }
                            return;
                        }
                    }
                    isTowerChallenging = false;
                    waitingForFloorUpdate = false;
                    executeCycle(false);
                } else {
                    wasAutoRunning = false;
                    runAbort();
                }
            }
        });

        // Hook toàn cục mở khóa Chiến Lệnh & Tự Động Chiến Đấu
