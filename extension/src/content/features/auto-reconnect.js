
    // =========================================================================
    // TỰ ĐỘNG VÀO LẠI GAME KHI BỊ NGẮT KẾT NỐI (CONFIG.autoReconnect)
    // Chạy ở mọi frame. Phát hiện mất kết nối bằng trạng thái nội bộ của game
    // (không dựa vào hình ảnh trên màn hình), làm mới trang rồi bấm "Vào Game".
    // =========================================================================
    const RECONNECT_STORAGE_KEY = 'TN_AUTO_RECONNECT_V2';
    const RECONNECT_HISTORY_KEY = 'TN_AUTO_RECONNECT_HISTORY_V2';
    const RECONNECT_CONFIRM_TICKS = 3;          // số nhịp 1s trạng thái mất kết nối phải giữ nguyên
    const RECONNECT_ENTRY_RETRY_MS = 3000;
    const RECONNECT_LOGIN_UI_DELAY_MS = 3000;   // chờ nút DOM trước khi dùng nút trong LoginUi
    const RECONNECT_TTL_MS = 3 * 60 * 1000;
    const RECONNECT_MAX_PER_WINDOW = 3;
    const RECONNECT_WINDOW_MS = 15 * 60 * 1000;
    const RECONNECT_SELF_RELOAD_MS = 6000;

    const reconnectPageStart = Date.now();
    let reconnectLossTicks = 0;
    let reconnectWasInGame = false;
    let reconnectReloadTimer = null;
    let reconnectGaveUp = false;

    function reconnectLog(message, logType = 'info') {
        try {
            window.top.postMessage({
                source: 'TIEN_NGHICH_AUTO_GAME',
                action: 'LOG',
                message: message,
                logType: logType
            }, '*');
        } catch (e) { }
    }

    function reconnectReadState() {
        try {
            const raw = sessionStorage.getItem(RECONNECT_STORAGE_KEY);
            if (!raw) return null;
            const state = JSON.parse(raw);
            if (state && typeof state.startedAt === 'number') return state;
        } catch (e) { }
        reconnectClearState();
        return null;
    }

    function reconnectWriteState(state) {
        try {
            sessionStorage.setItem(RECONNECT_STORAGE_KEY, JSON.stringify(state));
            return true;
        } catch (e) {
            return false;
        }
    }

    function reconnectClearState() {
        try { sessionStorage.removeItem(RECONNECT_STORAGE_KEY); } catch (e) { }
    }

    // Đếm số lần khôi phục gần đây để tránh vòng lặp làm mới vô hạn (vd: bị đá do đăng nhập nơi khác).
    function reconnectRecordAttempt() {
        const now = Date.now();
        let history = [];
        try {
            history = JSON.parse(sessionStorage.getItem(RECONNECT_HISTORY_KEY) || '[]')
                .filter((t) => typeof t === 'number' && now - t < RECONNECT_WINDOW_MS);
        } catch (e) { }
        if (history.length >= RECONNECT_MAX_PER_WINDOW) return false;
        history.push(now);
        try { sessionStorage.setItem(RECONNECT_HISTORY_KEY, JSON.stringify(history)); } catch (e) { }
        return true;
    }

    function reconnectGameGlobals() {
        const g = window;
        if (!g.LoginCtrl || !g.StateMgr || !g.EStateGroup ||
            typeof g.LoginCtrl.gInst !== 'function' || typeof g.StateMgr.gInst !== 'function') return null;
        const login = g.LoginCtrl.gInst();
        const stateMgr = g.StateMgr.gInst();
        if (!login || !stateMgr) return null;
        return { login, stateMgr, net: g.NetMgr && g.NetMgr.gInst ? g.NetMgr.gInst() : null, group: g.EStateGroup };
    }

    // Trạng thái kết nối đọc thẳng từ game: hộp thoại "Đăng nhập lại", cờ bị đá/xác minh thất bại, socket.
    function reconnectReadConnection() {
        const ctx = reconnectGameGlobals();
        if (!ctx) return null;
        let dialog = false;
        try {
            const viewMgr = window.ViewMgr && window.ViewMgr.gInst();
            const viewName = (window.ViewConst && window.ViewConst.disconnectUi) || 'disconnectUi';
            dialog = !!(viewMgr && viewMgr.isUpViewVisible(viewName));
        } catch (e) { }
        return {
            inLogin: !!ctx.stateMgr.isCurState(ctx.group.login),
            inMain: !!ctx.stateMgr.isCurState(ctx.group.main),
            connected: ctx.net ? ctx.net.m_isConnectServer !== false : true,
            kicked: ctx.login.m_isKick === true,
            dialog: dialog
        };
    }

    function reconnectIsGameEntered() {
        const c = reconnectReadConnection();
        return !!(c && c.inMain && c.connected && !c.kicked && !c.dialog);
    }

    function reconnectFindEnterGameButton() {
        const candidates = document.querySelectorAll(
            'button, a, [role="button"], input[type="button"], input[type="submit"], div, span'
        );
        for (const el of candidates) {
            if (el.children.length > 0 && !/^(BUTTON|A)$/.test(el.tagName)) continue;
            const text = (el.innerText || el.textContent || el.value || '').replace(/\s+/g, ' ').trim().toLowerCase();
            if (text !== 'vào game') continue;
            const rect = el.getBoundingClientRect();
            const style = getComputedStyle(el);
            if (rect.width > 0 && rect.height > 0 && style.display !== 'none' &&
                style.visibility !== 'hidden' && !el.disabled) return el;
        }
        return null;
    }

    // Nút "Vào game" vẽ trong canvas: màn chọn server (selectServerUi.startBtnClick) hoặc màn loginUi.
    function reconnectFindEntryView() {
        try {
            const viewMgr = window.ViewMgr && window.ViewMgr.gInst();
            if (!viewMgr) return null;
            for (const [name, handler] of [['selectServerUi', 'startBtnClick'], ['loginUi', 'loginBtnClick']]) {
                if (!viewMgr.viewIsVisible(name)) continue;
                const view = viewMgr.getViewByName(name);
                if (view && typeof view[handler] === 'function') return { view, handler, name };
            }
        } catch (e) { }
        return null;
    }

    // Frame game phát hiện mất kết nối -> nhờ cửa sổ trên cùng làm mới trang (frame con khác origin không tự reload được top).
    function reconnectBegin(reason) {
        if (reconnectReadState()) return;
        if (!reconnectRecordAttempt()) {
            if (!reconnectGaveUp) {
                reconnectGaveUp = true;
                reconnectLog(`❌ [Vào lại game] Đã tự vào lại ${RECONNECT_MAX_PER_WINDOW} lần trong ${RECONNECT_WINDOW_MS / 60000} phút mà vẫn mất kết nối (${reason}); dừng tự động để tránh lặp vô hạn. Hãy kiểm tra tài khoản/mạng.`, 'err');
            }
            return;
        }
        const resume = !!CONFIG.running;
        reconnectWriteState({ phase: 'reload', reason, resume, startedAt: Date.now(), lastAttemptAt: 0, attempts: 0 });
        reconnectLog(`⚠️ [Vào lại game] Phát hiện mất kết nối (${reason}); sẽ làm mới trang và bấm “Vào Game”${resume ? ', sau đó tự chạy lại Auto' : ''}.`, 'warn');
        try {
            window.top.postMessage({
                source: 'TIEN_NGHICH_AUTO_GAME',
                action: 'AUTO_RECONNECT_RELOAD',
                reason: reason,
                resume: resume
            }, '*');
        } catch (e) { }
        clearTimeout(reconnectReloadTimer);
        reconnectReloadTimer = setTimeout(() => {
            // Top không phản hồi: tự làm mới frame hiện tại.
            reconnectLog('ℹ️ [Vào lại game] Cửa sổ chính chưa làm mới; tự làm mới frame game.', 'info');
            try { location.reload(); } catch (e) { }
        }, RECONNECT_SELF_RELOAD_MS);
    }

    // Cửa sổ trên cùng: đánh dấu đang chờ vào lại (để tìm nút "Vào Game" trên trang bọc game) rồi làm mới.
    function reconnectTopPrepare(reason, resume) {
        const existing = reconnectReadState();
        if (existing && existing.phase === 'reload' && existing.topMarked) return false;
        const runConfig = Object.assign({}, CONFIG, { running: false });
        reconnectWriteState({
            phase: 'reload', reason, resume: !!resume, startedAt: Date.now(),
            lastAttemptAt: 0, attempts: 0, topMarked: true,
            runConfig: resume ? runConfig : undefined
        });
        return true;
    }

    // Cửa sổ trên cùng: game đã báo vào lại xong -> bỏ trạng thái chờ.
    function reconnectTopDone() {
        reconnectClearState();
    }

    function reconnectFinish(state) {
        clearTimeout(reconnectReloadTimer);
        reconnectClearState();
        reconnectLossTicks = 0;
        reconnectGaveUp = false;
        if (!state) return;
        reconnectLog('✅ [Vào lại game] Đã xác nhận vào lại game (trạng thái game: đã vào màn chính, kết nối ổn định).', 'action');
        try {
            window.top.postMessage({
                source: 'TIEN_NGHICH_AUTO_GAME',
                action: 'AUTO_RECONNECT_GAME_READY',
                resume: !!state.resume
            }, '*');
        } catch (e) { }
    }

    function reconnectPendingTick(state) {
        const now = Date.now();
        if (state.phase === 'reload') {
            // Còn ở trang cũ (đang chờ làm mới): chưa làm gì.
            if (state.startedAt >= reconnectPageStart) return;
            state.phase = 'await-entry';
            state.pageLoadedAt = now;
            reconnectWriteState(state);
            if (reconnectGameGlobals()) reconnectLog('🔄 [Vào lại game] Trang đã làm mới; đang chờ nút “Vào Game”.', 'info');
        }

        if (reconnectIsGameEntered()) {
            reconnectFinish(state);
            return;
        }

        if (now - state.startedAt > RECONNECT_TTL_MS) {
            reconnectClearState();
            if (window === window.top) {
                reconnectLog('❌ [Vào lại game] Quá thời gian chờ vào lại game (không xác nhận được trạng thái vào game); hãy vào game thủ công.', 'err');
            }
            return;
        }

        if (now - (state.lastAttemptAt || 0) < RECONNECT_ENTRY_RETRY_MS) return;

        let clicked = false;
        try {
            const button = reconnectFindEnterGameButton();
            if (button) {
                button.click();
                clicked = true;
            } else if (now - (state.pageLoadedAt || state.startedAt) >= RECONNECT_LOGIN_UI_DELAY_MS) {
                const entry = reconnectFindEntryView();
                const ctx = reconnectGameGlobals();
                if (entry && !(ctx && ctx.login.m_isLoginServer)) {
                    entry.view[entry.handler]({
                        target: entry.view, currentTarget: entry.view,
                        preventDefault() { }, stopPropagation() { }
                    });
                    clicked = true;
                }
            }
        } catch (e) {
            console.error('[Tiên Nghịch Auto] Không thể bấm “Vào Game”.', e);
            reconnectLog('❌ [Vào lại game] Không thể bấm “Vào Game”; xem console để biết chi tiết.', 'err');
        }
        if (clicked) {
            state.lastAttemptAt = now;
            state.attempts = (state.attempts || 0) + 1;
            reconnectWriteState(state);
            if (state.attempts === 1) reconnectLog('🎮 [Vào lại game] Đã bấm “Vào Game”; đang chờ game xác nhận.', 'action');
        }
    }

    function reconnectDetectTick() {
        if (!CONFIG.autoReconnect) { reconnectLossTicks = 0; return; }
        const c = reconnectReadConnection();
        if (!c) return;

        if (c.inMain && c.connected && !c.kicked && !c.dialog) {
            reconnectWasInGame = true;
            reconnectLossTicks = 0;
            reconnectGaveUp = false;
            return;
        }

        let reason = '';
        if (c.dialog && !c.inLogin) reason = 'hộp thoại “Đăng nhập lại”';
        else if (c.kicked && !c.inLogin && reconnectWasInGame) reason = 'Xác minh thất bại / bị ngắt phiên';
        if (!reason) { reconnectLossTicks = 0; return; }

        reconnectLossTicks++;
        if (reconnectLossTicks >= RECONNECT_CONFIRM_TICKS) {
            reconnectLossTicks = 0;
            reconnectBegin(reason);
        }
    }

    setInterval(() => {
        try {
            const state = reconnectReadState();
            if (state) reconnectPendingTick(state);
            else reconnectDetectTick();
        } catch (e) {
            console.error('[Tiên Nghịch Auto] Lỗi theo dõi kết nối.', e);
        }
    }, 1000);
