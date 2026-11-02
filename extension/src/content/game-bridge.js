    const isGameContext = !!window.DailyDungeonCtrl || !isTopWindow;
    if (isGameContext) {
        const failCounts = {};
        let isExecuting = false;
        let nextActionAt = 0;
        let isTowerChallenging = false;
        let waitingForFloorUpdate = false;
        let lastPassedFloor = 0;
        let sweptDayKey = '';

        // Nhịp thao tác giống người chơi: nghỉ ngẫu nhiên quanh nhịp gốc, thỉnh thoảng dừng lâu hơn
        // (thay cho nhịp cố định đều đặn dễ bị nhận ra).
        function humanDelay(baseMs) {
            const base = baseMs > 0 ? baseMs : 1200;
            let delay = base * (0.85 + Math.random() * 0.75);
            if (Math.random() < 0.08) delay += 2500 + Math.random() * 5500;
            return Math.round(delay);
        }

        // Giới hạn số lần thử cùng một mục tiêu trong một lượt chạy Auto (tránh gửi lặp vô hạn khi thua/lỗi).
        const MAX_TARGET_ATTEMPTS = 3;
        const targetAttempts = {};
        const unsupportedLogged = {};
        const runResetHooks = [];         // các module đăng ký đặt lại trạng thái khi bắt đầu lượt Auto mới

        function tryAttemptTarget(key, label) {
            const count = targetAttempts[key] || 0;
            if (count >= MAX_TARGET_ATTEMPTS) {
                if (count === MAX_TARGET_ATTEMPTS) {
                    targetAttempts[key] = count + 1;
                    sendLog(`⏸️ ${label}: đã thử ${MAX_TARGET_ATTEMPTS} lần chưa qua; dừng thử mục tiêu này trong lượt Auto này.`, "warn");
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

        function resetRunGuards() {
            for (const k of Object.keys(targetAttempts)) delete targetAttempts[k];
            for (const k of Object.keys(unsupportedLogged)) delete unsupportedLogged[k];
            for (const k of Object.keys(failCounts)) delete failCounts[k];
            runResetHooks.forEach((reset) => { try { reset(); } catch (e) { } });
        }

        let lastHangupCheck = 0;
        let lastQuickHangCheck = 0;
        let lastTaskQueryTime = 0;
        let lastTaskActionTime = 0;
        let lastDailyClimbIndex = 0;
        let lastDailyClimbTime = 0;
        let lastCampClimbIndex = 0;
        let lastCampClimbTime = 0;
        let lastAbyssClimbTime = 0;
        let lastArenaCheckTime = 0;
        let lastArenaFetchTime = 0;
        function sendLog(message, logType = 'info') {
            try {
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
                return;
            } else if (data.action === 'UPDATE_CONFIG') {
                Object.assign(CONFIG, data.config);
            } else if (data.action === 'TOGGLE_AUTO') {
                const wasRunning = CONFIG.running;
                CONFIG.running = data.running;
                if (data.config) Object.assign(CONFIG, data.config);
                if (CONFIG.running) {
                    // resumed: Auto được bật lại sau khi tự vào lại game (không phải người dùng bấm BẮT ĐẦU).
                    const resumed = !!data.resumed;
                    if (!wasRunning) {
                        resetRunGuards();
                        nextActionAt = 0;
                        if (typeof resetArenaRun === 'function') resetArenaRun(resumed);
                        if (!resumed) {
                            bannerRunOnce();
                        } else if (Object.keys(CONFIG.bannerAuto || {}).some((k) => CONFIG.bannerAuto[k])) {
                            sendLog("ℹ️ [Vào lại game] Không chạy lại lượt Banner Hero sau khi vào lại game (chỉ chạy 1 lượt mỗi lần bấm BẮT ĐẦU).", "info");
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
                }
            } else if (data.action === 'RUN_SWEEP') {
                handleSweepDungeons(window, true);
            }
        });

        // Hook toàn cục mở khóa Chiến Lệnh & Tự Động Chiến Đấu
