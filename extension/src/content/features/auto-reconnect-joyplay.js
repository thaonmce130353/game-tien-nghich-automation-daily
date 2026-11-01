(function () {
    'use strict';

    if (window === window.top && !location.hostname.includes('acejoygame.com')) return;
    if (window.__TN_AUTO_RECONNECT_JOYPLAY_INITIALIZED__) return;
    window.__TN_AUTO_RECONNECT_JOYPLAY_INITIALIZED__ = true;

    const STORAGE_KEY = 'TN_AUTO_RECONNECT_JOYPLAY_V1';
    const DISCONNECT_GRACE_MS = 5000;
    const RELOAD_COOLDOWN_MS = 15000;
    const RELOAD_DELAY_MS = 750;
    const ENTRY_ACTION_DELAY_MS = 5000;
    const ENTRY_BUTTON_RETRY_MS = 3000;
    const RECOVERY_TTL_MS = 10 * 60 * 1000;
    const HOOK_MARKER = '__tnAutoReconnectJoyplayHooked';

    let disconnectTimer = null;
    let entryActionTimer = null;
    let connectionProgressSeen = false;
    let entryWaitReported = false;
    let storageErrorReported = false;
    let lastEntryDiagnosticAt = 0;

    function getEntryDiagnosticSnapshot() {
        const snapshot = {
            canvas: [],
            domButton: false,
            viewMgr: typeof window.ViewMgr === 'function',
            loginViewVisible: false,
            loginViewHandler: false,
            loginCtrl: typeof window.LoginCtrl === 'function',
            startLogin: false,
            reqEnterGame: false,
            roleData: false,
            serverData: false,
            mainCtrl: !!(window.MainCtrl && window.MainCtrl.gMainCtrl),
            stateManager: typeof window.StateMgr === 'function',
            gameEntered: false
        };

        try {
            snapshot.gameEntered = isGameAlreadyEntered();
            snapshot.canvas = Array.from(document.querySelectorAll('canvas')).map((canvas) =>
                `${canvas.width}x${canvas.height}`
            );
            snapshot.domButton = !!findVisibleEnterGameButton();

            if (snapshot.viewMgr && typeof window.ViewMgr.gInst === 'function') {
                const viewMgr = window.ViewMgr.gInst();
                if (viewMgr) {
                    snapshot.loginViewVisible = typeof viewMgr.viewIsVisible === 'function'
                        ? !!viewMgr.viewIsVisible('loginUi')
                        : !!viewMgr.getViewByName('loginUi');
                    const loginView = viewMgr.getViewByName &&
                        viewMgr.getViewByName('loginUi');
                    snapshot.loginViewHandler = !!(loginView &&
                        typeof loginView.loginBtnClick === 'function');
                }
            }

            if (snapshot.loginCtrl && typeof window.LoginCtrl.gInst === 'function') {
                const controller = window.LoginCtrl.gInst();
                snapshot.startLogin = !!(controller && typeof controller.startLogin === 'function');
                snapshot.reqEnterGame = !!(controller && typeof controller.reqEnterGame === 'function');
                snapshot.roleData = !!(controller && controller.m_roleData);
                snapshot.serverData = !!(controller && controller.m_curSelectServerData);
            }
        } catch (error) {
            snapshot.error = true;
            console.error('[Tiên Nghịch Auto] Không thể thu thập chẩn đoán vào game.', error);
        }

        return snapshot;
    }

    function logEntryDiagnostics(state, force = false) {
        const now = Date.now();
        if (!force && now - lastEntryDiagnosticAt < 15000) return;
        lastEntryDiagnosticAt = now;

        const snapshot = getEntryDiagnosticSnapshot();
        sendReconnectLog(
            `🔎 Reconnect debug: phase=${state.phase}; socket=${connectionProgressSeen ? 'connected' : 'not-connected'}; ` +
            `canvas=${snapshot.canvas.join(',') || 'none'}; DOM button=${snapshot.domButton}; ` +
            `loginUi=${snapshot.loginViewVisible}/${snapshot.loginViewHandler}; ` +
            `LoginCtrl=${snapshot.loginCtrl} (start=${snapshot.startLogin}, enter=${snapshot.reqEnterGame}); ` +
            `role=${snapshot.roleData}; server=${snapshot.serverData}; ` +
            `MainCtrl=${snapshot.mainCtrl}; StateMgr=${snapshot.stateManager}; inGame=${snapshot.gameEntered}; ` +
            `entryTries=${state.entryAttemptCount || 0}; snapshotError=${!!snapshot.error}`,
            'info'
        );
    }

    function sendReconnectLog(message, logType = 'info') {
        try {
            window.top.postMessage({
                source: 'TIEN_NGHICH_AUTO_GAME',
                action: 'LOG',
                message,
                logType
            }, '*');
        } catch (error) {
            console.error('[Tiên Nghịch Auto] Không thể gửi log khôi phục kết nối lên giao diện.', error);
        }
    }

    function reportStorageError(error) {
        if (storageErrorReported) return;
        storageErrorReported = true;
        console.error('[Tiên Nghịch Auto] Không thể lưu trạng thái tự kết nối lại.', error);
        sendReconnectLog('❌ Không thể lưu trạng thái tự kết nối lại; đã bỏ qua thao tác để tránh vòng lặp tải lại.', 'err');
    }

    function readRecoveryState() {
        try {
            const stored = sessionStorage.getItem(STORAGE_KEY);
            if (!stored) return null;

            const state = JSON.parse(stored);
            if (!state || typeof state !== 'object' || typeof state.updatedAt !== 'number') {
                sessionStorage.removeItem(STORAGE_KEY);
                sendReconnectLog('⚠️ Trạng thái tự kết nối lại không hợp lệ; đã xóa trạng thái cũ.', 'warn');
                return null;
            }

            if (Date.now() - state.updatedAt > RECOVERY_TTL_MS) {
                sessionStorage.removeItem(STORAGE_KEY);
                sendReconnectLog('⚠️ Đã hết thời gian chờ tự kết nối lại; auto không tiếp tục tải lại trang.', 'warn');
                return null;
            }
            return state;
        } catch (error) {
            reportStorageError(error);
            return null;
        }
    }

    function writeRecoveryState(state) {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            return true;
        } catch (error) {
            reportStorageError(error);
            return false;
        }
    }

    function clearRecoveryState() {
        try {
            sessionStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            reportStorageError(error);
        }
    }

    function findVisibleEnterGameButton() {
        const candidates = document.querySelectorAll('button, a, [role="button"]');
        for (const candidate of candidates) {
            const text = (candidate.innerText || candidate.textContent || '')
                .replace(/\s+/g, ' ')
                .trim()
                .toLowerCase();
            if (text !== 'vào game') continue;

            const rect = candidate.getBoundingClientRect();
            const style = getComputedStyle(candidate);
            if (rect.width > 0 && rect.height > 0 && style.display !== 'none' &&
                style.visibility !== 'hidden' && !candidate.disabled) {
                return candidate;
            }
        }
        return null;
    }

    function findVisibleLoginView() {
        const viewMgrClass = window.ViewMgr;
        if (!viewMgrClass || typeof viewMgrClass.gInst !== 'function') return null;

        const viewMgr = viewMgrClass.gInst();
        if (!viewMgr || typeof viewMgr.getViewByName !== 'function') return null;
        if (typeof viewMgr.viewIsVisible === 'function' && !viewMgr.viewIsVisible('loginUi')) return null;
        return viewMgr.getViewByName('loginUi');
    }

    function getLoginController() {
        const loginCtrlClass = window.LoginCtrl;
        if (!loginCtrlClass || typeof loginCtrlClass.gInst !== 'function') return null;
        return loginCtrlClass.gInst();
    }

    function isGameAlreadyEntered() {
        const stateMgrClass = window.StateMgr;
        const stateGroup = window.EStateGroup;
        if (!stateMgrClass || typeof stateMgrClass.gInst !== 'function' ||
            !stateGroup || typeof stateGroup.main === 'undefined') {
            return false;
        }

        const stateMgr = stateMgrClass.gInst();
        return !!(stateMgr && typeof stateMgr.isCurState === 'function' &&
            stateMgr.isCurState(stateGroup.main));
    }

    function confirmGameEntered() {
        const state = readRecoveryState();
        if (!state) return;

        clearTimeout(disconnectTimer);
        disconnectTimer = null;
        clearTimeout(entryActionTimer);
        entryActionTimer = null;
        clearRecoveryState();
        sendReconnectLog('✅ Đã xác nhận game vào lại thành công.', 'action');
        try {
            window.top.postMessage({
                source: 'TIEN_NGHICH_AUTO_GAME',
                action: 'AUTO_RECONNECT_GAME_READY'
            }, '*');
        } catch (error) {
            console.error('[Tiên Nghịch Auto] Không thể báo trạng thái game đã vào lại.', error);
        }
    }

    function tryClickEnterGame(state) {
        let button;
        let loginView;
        let loginButtonHandler;
        try {
            button = findVisibleEnterGameButton();
            loginView = button ? null : findVisibleLoginView();
            loginButtonHandler = loginView && loginView.loginBtnClick;
        } catch (error) {
            console.error('[Tiên Nghịch Auto] Không thể kiểm tra nút vào game.', error);
            sendReconnectLog('❌ Không thể kiểm tra giao diện đăng nhập; xem console để biết chi tiết.', 'err');
            return true;
        }
        if (!button && typeof loginButtonHandler !== 'function') return false;

        const now = Date.now();
        if (state.phase === 'login-button-clicked' &&
            now - (state.lastEntryAttemptAt || state.updatedAt) < ENTRY_BUTTON_RETRY_MS) {
            return true;
        }

        const attempt = Number.isInteger(state.entryAttemptCount) ? state.entryAttemptCount + 1 : 1;
        state.phase = 'login-button-clicked';
        state.updatedAt = now;
        state.lastEntryAttemptAt = now;
        state.entryAttemptCount = attempt;
        if (!writeRecoveryState(state)) return true;
        try {
            if (button) {
                button.click();
            } else {
                loginButtonHandler.call(loginView, {
                    target: loginView,
                    currentTarget: loginView,
                    preventDefault() {},
                    stopPropagation() {}
                });
            }
            if (attempt === 1) {
                sendReconnectLog(
                    `🎮 Đang thử vào game qua ${button ? 'nút DOM' : 'handler loginUi'}; lần thử ${attempt}.`,
                    'action'
                );
            }
        } catch (error) {
            console.error('[Tiên Nghịch Auto] Không thể kích hoạt nút vào game.', error);
            sendReconnectLog('❌ Không thể kích hoạt nút “Vào Game”; xem console để biết chi tiết.', 'err');
            state.phase = 'entry-error';
            state.updatedAt = Date.now();
            writeRecoveryState(state);
        }
        return true;
    }

    function requestGameEntry(controller) {
        const state = readRecoveryState();
        if (!state) return;
        if (state.phase === 'entry-requested') {
            sendReconnectLog('ℹ️ Yêu cầu vào game đã được gửi; bỏ qua yêu cầu trùng lặp.', 'info');
            return;
        }

        if (isGameAlreadyEntered()) {
            confirmGameEntered();
            return;
        }

        try {
            if (!controller || typeof controller.reqEnterGame !== 'function') {
                sendReconnectLog('❌ Không tìm thấy nút “Vào Game” hoặc hành động vào game trong LoginCtrl.', 'err');
                return;
            }

            state.phase = 'entry-requested';
            state.updatedAt = Date.now();
            if (!writeRecoveryState(state)) return;
            sendReconnectLog(
                `📡 Gửi reqEnterGame: role=${!!controller.m_roleData}; server=${!!controller.m_curSelectServerData}; ` +
                `reconnect=${!!controller.m_isReconnecting}.`,
                'info'
            );
            controller.reqEnterGame();
            sendReconnectLog('🎮 Đã yêu cầu vào game sau khi máy chủ xác nhận đăng nhập.', 'action');
        } catch (error) {
            console.error('[Tiên Nghịch Auto] Thao tác vào game thất bại.', error);
            sendReconnectLog('❌ Thao tác vào game thất bại; xem console để biết chi tiết.', 'err');
            const current = readRecoveryState();
            if (current) {
                current.phase = 'entry-error';
                current.updatedAt = Date.now();
                writeRecoveryState(current);
            }
        }
    }

    function tryRequestEntryFromLoginController(state) {
        if (state.phase !== 'login-started' && state.phase !== 'login-button-clicked') return false;

        try {
            const controller = getLoginController();
            if (!controller || typeof controller.reqEnterGame !== 'function' ||
                !controller.m_roleData || !controller.m_curSelectServerData) {
                return false;
            }

            requestGameEntry(controller);
            return true;
        } catch (error) {
            console.error('[Tiên Nghịch Auto] Không thể gửi yêu cầu vào game từ LoginCtrl.', error);
            sendReconnectLog('❌ Không thể gửi yêu cầu vào game; xem console để biết chi tiết.', 'err');
            return true;
        }
    }

    function beginRecovery(reason) {
        const previous = readRecoveryState();
        if (previous && previous.phase === 'reload-requested') {
            sendReconnectLog('ℹ️ Đã có lần làm mới game đang chờ; bỏ qua tín hiệu ngắt trùng lặp.', 'info');
            return;
        }

        clearTimeout(disconnectTimer);
        disconnectTimer = null;
        const now = Date.now();
        const attempts = previous && Number.isInteger(previous.attempts) ? previous.attempts + 1 : 1;
        const earliestReloadAt = previous && typeof previous.lastReloadAt === 'number'
            ? previous.lastReloadAt + RELOAD_COOLDOWN_MS
            : now;
        const reloadAt = Math.max(now, earliestReloadAt);
        const state = {
            phase: 'reload-requested',
            reason,
            attempts,
            updatedAt: now,
            lastReloadAt: reloadAt
        };
        if (!writeRecoveryState(state)) return;

        const delay = reloadAt - now + RELOAD_DELAY_MS;
        const delaySeconds = Math.ceil(delay / 1000);
        sendReconnectLog(
            delay > RELOAD_DELAY_MS
                ? `🔄 Đã xác nhận mất kết nối; sẽ làm mới game trong ${delaySeconds} giây (lần ${attempts}).`
                : `🔄 Đã xác nhận mất kết nối; đang làm mới game (lần ${attempts}).`,
            'warn'
        );

        setTimeout(() => {
            const current = readRecoveryState();
            if (!current || current.phase !== 'reload-requested' || current.attempts !== attempts) return;
            try {
                location.reload();
            } catch (error) {
                console.error('[Tiên Nghịch Auto] Không thể làm mới khung game.', error);
                sendReconnectLog('❌ Không thể làm mới khung game; xem console để biết chi tiết.', 'err');
            }
        }, delay);
    }

    function scheduleSocketRecovery(reason) {
        clearTimeout(disconnectTimer);
        sendReconnectLog('⚠️ Game báo socket bị ngắt; đang chờ trạng thái kết nối ổn định trước khi khôi phục.', 'warn');
        disconnectTimer = setTimeout(() => {
            disconnectTimer = null;
            if (!connectionProgressSeen) beginRecovery(reason);
        }, DISCONNECT_GRACE_MS);
    }

    function scheduleEntryAction(delay = ENTRY_ACTION_DELAY_MS) {
        clearTimeout(entryActionTimer);
        entryActionTimer = setTimeout(startLoginAfterRefresh, delay);
    }

    function startLoginAfterRefresh() {
        const state = readRecoveryState();
        if (!state || state.phase !== 'awaiting-entry') return;
        if (isGameAlreadyEntered()) {
            confirmGameEntered();
            return;
        }
        if (connectionProgressSeen) {
            if (!entryWaitReported) {
                entryWaitReported = true;
                sendReconnectLog('ℹ️ Máy chủ đã kết nối; đang chờ phản hồi đăng nhập trước khi yêu cầu vào game.', 'info');
            }
            return;
        }

        let controller;
        try {
            if (tryClickEnterGame(state)) return;

            controller = getLoginController();
            if (!controller || typeof controller.startLogin !== 'function') {
                if (!entryWaitReported) {
                    entryWaitReported = true;
                    sendReconnectLog('⚠️ LoginCtrl chưa sẵn sàng; sẽ thử tiếp tục đăng nhập lại.', 'warn');
                }
                scheduleEntryAction(2000);
                return;
            }

            entryWaitReported = false;
            state.phase = 'login-started';
            state.updatedAt = Date.now();
            if (!writeRecoveryState(state)) return;
            controller.startLogin();
            sendReconnectLog('🔐 Đã bắt đầu đăng nhập lại sau khi làm mới game; đang chờ xác nhận vào game.', 'info');
        } catch (error) {
            console.error('[Tiên Nghịch Auto] Không thể bắt đầu đăng nhập lại.', error);
            sendReconnectLog('❌ Không thể bắt đầu đăng nhập lại; xem console để biết chi tiết.', 'err');
            const current = readRecoveryState();
            if (current) {
                current.phase = 'entry-error';
                current.updatedAt = Date.now();
                writeRecoveryState(current);
            }
        }
    }

    function findMethodOwner(prototype, methodName) {
        let current = prototype;
        while (current && current !== Object.prototype) {
            const descriptor = Object.getOwnPropertyDescriptor(current, methodName);
            if (descriptor) return { owner: current, descriptor };
            current = Object.getPrototypeOf(current);
        }
        return null;
    }

    function hookMethod(prototype, methodName, afterCall) {
        const found = findMethodOwner(prototype, methodName);
        if (!found || typeof found.descriptor.value !== 'function' ||
            found.descriptor.value[HOOK_MARKER]) return;

        const original = found.descriptor.value;
        const wrapped = function () {
            const result = original.apply(this, arguments);
            try {
                afterCall.call(this, arguments);
            } catch (error) {
                console.error(`[Tiên Nghịch Auto] Theo dõi trạng thái ${methodName} thất bại.`, error);
                sendReconnectLog(`⚠️ Không thể theo dõi trạng thái ${methodName}; xem console để biết chi tiết.`, 'warn');
            }
            return result;
        };
        Object.defineProperty(wrapped, HOOK_MARKER, { value: true });
        Object.defineProperty(found.owner, methodName, { ...found.descriptor, value: wrapped });
    }

    function installHooks() {
        const loginCtrlClass = window.LoginCtrl;
        if (loginCtrlClass && loginCtrlClass.prototype) {
            hookMethod(loginCtrlClass.prototype, 'recvSocketClosed', () => {
                connectionProgressSeen = false;
                scheduleSocketRecovery('socket-closed');
            });
            hookMethod(loginCtrlClass.prototype, 'recvSocketError', () => {
                connectionProgressSeen = false;
                scheduleSocketRecovery('socket-error');
            });
            hookMethod(loginCtrlClass.prototype, 'recvServerConnect', () => {
                connectionProgressSeen = true;
                if (disconnectTimer) {
                    clearTimeout(disconnectTimer);
                    disconnectTimer = null;
                    sendReconnectLog('✅ Kết nối đã ổn định trước khi tải lại; đã bỏ qua lần làm mới này.', 'info');
                }
                if (readRecoveryState() && !entryWaitReported) {
                    entryWaitReported = true;
                    sendReconnectLog('ℹ️ Máy chủ đã kết nối; đang chờ phản hồi đăng nhập.', 'info');
                }
            });
            hookMethod(loginCtrlClass.prototype, 'recvLoginServer', function () {
                connectionProgressSeen = true;
                clearTimeout(disconnectTimer);
                disconnectTimer = null;
                requestGameEntry(this);
            });
            hookMethod(loginCtrlClass.prototype, 'recvEnterGame', confirmGameEntered);
            hookMethod(loginCtrlClass.prototype, 'recvReEnterGame', confirmGameEntered);
            hookMethod(loginCtrlClass.prototype, 'directShowDisconnect', () => {
                connectionProgressSeen = false;
                beginRecovery('disconnect-dialog');
            });
        }

        const globalCtrlClass = window.GlobalCtrl;
        if (globalCtrlClass && globalCtrlClass.prototype) {
            hookMethod(globalCtrlClass.prototype, 'showErrorMsg', function (args) {
                const failedVerification = Array.from(args).some((value) =>
                    typeof value === 'string' && value.toLowerCase().includes('xác minh thất bại')
                );
                if (failedVerification) beginRecovery('verification-failed');
            });
        }
    }

    function initializePendingRecovery() {
        const state = readRecoveryState();
        if (!state) return;

        if (state.phase === 'reload-requested') {
            state.phase = 'awaiting-entry';
            state.updatedAt = Date.now();
            if (!writeRecoveryState(state)) return;
            sendReconnectLog('🔄 Game đã được làm mới; đang khôi phục đăng nhập và chờ vào game.', 'info');
        } else if (state.phase === 'login-started' || state.phase === 'login-button-clicked' ||
            state.phase === 'entry-requested' || state.phase === 'entry-error') {
            state.phase = 'awaiting-entry';
            state.updatedAt = Date.now();
            if (!writeRecoveryState(state)) return;
        }

        logEntryDiagnostics(state, true);
        scheduleEntryAction();
    }

    installHooks();
    initializePendingRecovery();
    setInterval(() => {
        installHooks();
        const state = readRecoveryState();
        if (state && (state.phase === 'awaiting-entry' || state.phase === 'login-started' ||
            state.phase === 'login-button-clicked')) {
            logEntryDiagnostics(state);
            if (isGameAlreadyEntered()) {
                confirmGameEntered();
                return;
            }
            if (tryRequestEntryFromLoginController(state)) return;
            if (tryClickEnterGame(state)) return;
        } else if (state && state.phase === 'entry-requested' && isGameAlreadyEntered()) {
            confirmGameEntered();
        }
    }, 1000);
})();
