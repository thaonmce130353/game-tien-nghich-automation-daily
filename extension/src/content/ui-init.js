    if (isTopWindow || isStandaloneGame) {
        function addLogToUI(msg, type = "info") {
            const logBox = document.getElementById('tn-log-content');
            if (!logBox) return;
            const time = new Date().toLocaleTimeString();
            const p = document.createElement('div');
            p.style.marginBottom = '3px';
            p.style.fontSize = '11px';
            p.style.lineHeight = '1.3';
            p.style.borderBottom = '1px dashed rgba(255,255,255,0.08)';
            p.style.paddingBottom = '2px';
            
            let color = '#a6e3a1';
            if (type === 'warn') color = '#fab387';
            if (type === 'err') color = '#f38ba8';
            if (type === 'action') color = '#89b4fa';

            p.innerHTML = `<span style="color:#888;">[${time}]</span> <span style="color:${color};">${msg}</span>`;
            logBox.appendChild(p);
            logBox.scrollTop = logBox.scrollHeight;
            
            while (logBox.children.length > 70) {
                logBox.removeChild(logBox.firstChild);
            }
        }

        function updateRoleDisplay(role) {
            if (!role) return;
            const nameEl = document.getElementById('tn-role-name');
            const infoEl = document.getElementById('tn-role-info');

            if (nameEl && role.name) nameEl.textContent = role.name;
            if (infoEl) {
                const power = role.power || 0;
                let formattedPower = '--';
                if (power > 0) {
                    if (power >= 1000000000) {
                        formattedPower = (power / 1000000000).toFixed(2) + ' Tỷ';
                    } else if (power >= 1000000) {
                        formattedPower = (power / 1000000).toFixed(2) + ' Tr';
                    } else if (power >= 1000) {
                        formattedPower = Number(power).toLocaleString('vi-VN');
                    } else {
                        formattedPower = String(power);
                    }
                }
                const lvl = (role.level !== undefined && role.level !== null && role.level !== 0) ? role.level : '--';
                infoEl.textContent = `Lv: ${lvl} | LC: ${formattedPower}`;
            }
        }

        function updateBadge(running) {
            const badge = document.getElementById('tn-status-badge');
            const btnMain = document.getElementById('tn-btn-main');
            if (!badge || !btnMain) return;

            if (running) {
                badge.className = 'tn-badge tn-badge-running';
                badge.textContent = 'ĐANG LEO AUTO';
                btnMain.className = 'tn-action-btn tn-btn-stop';
                btnMain.textContent = '⏹ TẠM DỪNG AUTO';
            } else {
                badge.className = 'tn-badge tn-badge-ready';
                badge.textContent = 'TẠM DỪNG';
                btnMain.className = 'tn-action-btn tn-btn-start';
                btnMain.textContent = '▶ BẮT ĐẦU TREO LEO ẢI AUTO';
            }
        }

        function sendCommandToGame(action, data = {}) {
            const iframes = document.querySelectorAll('iframe');
            iframes.forEach(f => {
                try {
                    f.contentWindow.postMessage({
                        source: 'TIEN_NGHICH_AUTO_HUD',
                        action: action,
                        ...data
                    }, '*');
                } catch (e) { }
            });

            try {
                window.postMessage({
                    source: 'TIEN_NGHICH_AUTO_HUD',
                    action: action,
                    ...data
                }, '*');
            } catch(e) {}

            try {
                if (window.parent && window.parent !== window) {
                    window.parent.postMessage({
                        source: 'TIEN_NGHICH_AUTO_HUD',
                        action: action,
                        ...data
                    }, '*');
                }
            } catch(e) {}
        }

        window.addEventListener('message', (event) => {
            const data = event.data;
            if (!data || data.source !== 'TIEN_NGHICH_AUTO_GAME') return;

            if (data.action === 'ROLE_INFO') {
                updateRoleDisplay(data.role);
            } else if (data.action === 'LOG') {
                addLogToUI(data.message, data.logType);
            } else if (data.action === 'AUTO_RECONNECT_RELOAD') {
                if (!reconnectTopPrepare(data.reason, data.resume)) return;
                addLogToUI('🔄 [Vào lại game] Đang làm mới trang game để vào lại...', 'action');
                setTimeout(() => location.reload(), 800);
            } else if (data.action === 'AUTO_RECONNECT_GAME_READY') {
                reconnectTopDone();
                // Làm mới trang đặt lại running=false; chỉ chạy lại Auto nếu trước đó đang chạy.
                if (data.resume && !CONFIG.running) {
                    CONFIG.running = true;
                    saveConfig();
                    updateBadge(true);
                    sendCommandToGame('UPDATE_CONFIG', { config: CONFIG });
                    sendCommandToGame('TOGGLE_AUTO', { running: true, config: CONFIG });
                    addLogToUI('▶️ [Vào lại game] Auto đã được khởi động lại sau khi vào lại game.', 'action');
                } else {
                    sendCommandToGame('UPDATE_CONFIG', { config: CONFIG });
                    addLogToUI('ℹ️ [Vào lại game] Đã vào lại game; Auto vẫn đang tạm dừng như trước khi ngắt kết nối.', 'info');
                }
            }
        });

        function makeSmoothDraggable(el, handle) {
            let posX = 0, posY = 0, startX = 0, startY = 0;
            let isDragging = false;

            handle.addEventListener('pointerdown', (e) => {
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                const rect = el.getBoundingClientRect();
                posX = rect.left;
                posY = rect.top;
                handle.setPointerCapture(e.pointerId);
                el.style.transition = 'none';
            });

            handle.addEventListener('pointermove', (e) => {
                if (!isDragging) return;
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                let newX = posX + dx;
                let newY = posY + dy;

                // CHO PHÉP DI CHUYỂN TỰ DO HOÀN TOÀN KHẮP MÀN HÌNH ĐIỆN THOẠI
                // Giữ lại tối thiểu 35px mép màn hình để người dùng không bị mất nút kéo
                const minVisible = 35;
                const elWidth = el.offsetWidth || 255;
                const minX = - (elWidth - minVisible);
                const maxX = window.innerWidth - minVisible;
                const minY = 0;
                const maxY = window.innerHeight - minVisible;

                newX = Math.max(minX, Math.min(newX, maxX));
                newY = Math.max(minY, Math.min(newY, maxY));

                el.style.left = `${newX}px`;
                el.style.top = `${newY}px`;
            });

            const stopDrag = (e) => {
                if (!isDragging) return;
                isDragging = false;
                try { handle.releasePointerCapture(e.pointerId); } catch (err) { }
            };

            handle.addEventListener('pointerup', stopDrag);
            handle.addEventListener('pointercancel', stopDrag);
        }

        function makeHudResizable(hud, handle, direction) {
            if (!handle) return;

            let startX = 0;
            let startY = 0;
            let startWidth = 0;
            let startHeight = 0;
            let startLeft = 0;
            let startRight = 0;
            let startTop = 0;

            handle.addEventListener('pointerdown', (event) => {
                if (event.button !== 0) return;
                event.preventDefault();
                event.stopPropagation();

                const rect = hud.getBoundingClientRect();
                startX = event.clientX;
                startY = event.clientY;
                startWidth = rect.width;
                startHeight = rect.height;
                startLeft = rect.left;
                startRight = rect.right;
                startTop = rect.top;

                handle.setPointerCapture(event.pointerId);
                hud.style.transition = 'none';
            });

            handle.addEventListener('pointermove', (event) => {
                if (!handle.hasPointerCapture(event.pointerId)) return;

                hud.classList.add('tn-user-resized');
                const maxWidth = Math.max(360, window.innerWidth - 16);
                const minWidth = Math.min(740, maxWidth);
                const minHeight = 320;
                const maxHeight = Math.max(minHeight, window.innerHeight - startTop - 8);
                const nextHeight = Math.max(minHeight, Math.min(startHeight + event.clientY - startY, maxHeight));
                hud.style.height = `${nextHeight}px`;

                if (direction === 'left') {
                    const minLeft = Math.max(8, startRight - maxWidth);
                    const maxLeft = startRight - minWidth;
                    const nextLeft = Math.max(minLeft, Math.min(startLeft + event.clientX - startX, maxLeft));
                    hud.style.left = `${nextLeft}px`;
                    hud.style.width = `${startRight - nextLeft}px`;
                } else {
                    const availableWidth = Math.max(minWidth, Math.min(maxWidth, window.innerWidth - startLeft - 8));
                    const nextWidth = Math.max(minWidth, Math.min(startWidth + event.clientX - startX, availableWidth));
                    hud.style.width = `${nextWidth}px`;
                }
            });

            const stopResize = (event) => {
                if (!handle.hasPointerCapture(event.pointerId)) return;
                handle.releasePointerCapture(event.pointerId);
                hud.style.transition = '';
            };

            handle.addEventListener('pointerup', stopResize);
            handle.addEventListener('pointercancel', stopResize);
        }

        function initUI() {
            if (document.getElementById('tn-auto-hud')) return;
