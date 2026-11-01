// ==UserScript==
// @name         Auto Tiên Nghịch Mobile
// @namespace    https://tiennghich.joyplay.vn/
// @version      1.0.0
// @description  Bảng tính năng tự động chạy cục bộ.
// @author       Copilot
// @match        https://tiennghich.joyplay.vn/*
// @match        https://tiennghich.acejoygame.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    const CURRENT_AUTO_VERSION = "1.0.0";

    if (window.__TN_AUTO_INITIALIZED__) {
        return;
    }
    window.__TN_AUTO_INITIALIZED__ = true;

    const APP_ICON_B64 = "data:image/png;base64,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";

    const CONFIG = {
        autoSkipFight: true,            // Bỏ qua trận đấu thần tốc (chạy kèm mọi tính năng)
        maxSpeed: true,                 // Tối đa tốc độ x3 (chạy kèm mọi tính năng)
        activeFeature: 'autoTongTian',   // Duy nhất 1 tính năng chính hoạt động khi Auto (Chống xung đột)
        
        // --- 8 MODULE ƯU TIÊN HOÀN CHỈNH ---
        // Module 1: Thông Thiên Tháp & Tứ Linh Tháp
        autoTongTian: true,             // Quét & Leo Thông Thiên Tháp (Hỗ trợ mua thêm bằng Tiên Ngọc)
        buyTowerSweep: true,            // Tự mua thêm lượt quét Thông Thiên Tháp
        autoTuLinhThap: true,           // Cử tướng Trợ Trận & Leo + Quét 4 Tháp Tứ Linh (Ma/Thiên/Nghịch/Dị)
        
        // Module 2: Phụ Bản Ngày & Bí Cảnh Tứ Quốc
        autoClimbDailyDungeons: false,  // Quét nhanh PB Ngày (Free & Mua 250 Tiên Ngọc)
        buyDailyDungeon: true,          // Tự mua thêm quét PB Ngày
        autoBiCanhTuQuoc: false,        // Quét Bí Cảnh Tứ Quốc tầng Đủ Vượt 10 lần
        
        // Module 3: Thủ Vệ Tứ Phái
        autoSectDefense: false,         // Cử tướng, chọn bạn bè, tự chọn Buff cột giữa & nhận Chiến Lệnh
        
        // Module 4: Cửu Uyển Nhi, Cổ Thần Địa, Cực Âm Địa
        autoUyenNhi: false,             // Nhận thưởng Chiến Lệnh Uyển Nhi
        autoCoThan: false,              // Lên trận nhanh Cổ Thần Địa & Khiêu chiến map
        autoExtremeYin: false,          // Tự động đánh Cực Âm Địa
        
        // Module 5: Di Tích Tiên Giới
        autoImmortalRelic: false,       // Quét bệ Lv1-Lv4, làm mới Lv1-Lv3, cảnh báo Lv4 thì HỦY để khai thác
        
        // Module 6: Minigame Ảo Cảnh Pháp Trận
        autoMinigameMemory: false,      // Tự giải lật thẻ bài 4x4, nhận 3 rương 100/200/300, nhận NV, like BXH
        
        // Module 7: Kiếm Hành & Minigame Điêu Long Khắc Tinh
        autoKiemHanh: false,            // Gieo xúc xắc Kiếm Hành liên tục mỗi 3.5s
        autoMinigameDragon: false,      // Bắt QTE 380ms Hoàn Mỹ, nhận 5 rương mốc & Chiến Lệnh Điêu Long
        
        // Module 8: Hoạt Động Ngày, Tiên Minh & Nhận Cuối Ngày
        autoTroChien: false,            // Trợ Chiến Linh Thú (Tab Hoàn & Nhận nhanh)
        autoTamTienDai: false,          // Nhận quà miễn phí Tâm Tiên Đài và Chiêu Mộ
        buyTamTienGifts: true,          // Tự mua quà Tiên Ngọc Tâm Tiên Đài
        autoTienHuu: false,             // Tặng nhanh quà Bạn Bè (Tiên Hữu)
        autoArena: false,               // Đấu Tiên Đài PvP (giới hạn lượt, chọn đối thủ thấp)
        arenaBattleLimit: 5,             // Số trận Đấu Tiên Đài tối đa mỗi lần chạy Auto
        autoMaDaoUyPhai: false,         // Tác chiến nhanh, Thưởng ủy phái Cam/Tím, Quà Tiên & Đạo Cụ Phường
        autoTienMinh: false,            // Tiên Minh: Trả giá, Cung phụng, Viện trợ 5 sao, Tăng cấp, Boss
        autoCuoiNgay: false,            // Nhận thư, Like BXH Đạo Thành 3 lần, Nhận rương Sôi Nổi (25-100)
        
        // Các tính năng kinh điển bổ trợ
        autoForge: false,               // Tự động rèn Tiên Khí & Nâng Khí Đỉnh
        autoClimbYMAbyss: false,        // Leo Vực U Minh
        autoSweepDungeons: false,       // Quét sạch phụ bản đã vượt
        autoMainStage: false,           // Ải Chính Tuyến Ma Đạo
        autoHangupReward: false,        // Nhận thưởng treo máy
        autoQuickHang: false,           // Mua treo máy nhanh
        autoXianYuan: false,            // Quà Tiên Duyên
        autoDailyTask: false,           // Nhiệm vụ ngày
        
        activeTab: 'lichLuyen',
        intervalMs: 1200,
        running: false
    };

    try {
        const saved = localStorage.getItem('TN_AUTO_CFG_V293');
        if (saved) Object.assign(CONFIG, JSON.parse(saved));
    } catch (e) { }

    function saveConfig() {
        try {
            localStorage.setItem('TN_AUTO_CFG_V293', JSON.stringify(CONFIG));
        } catch (e) { }
    }

    const isTopWindow = (window === window.top);
    const isStandaloneGame = isTopWindow && !!window.DailyDungeonCtrl;

    // =========================================================================
    // PHẦN 1: GIAO DIỆN ĐIỀU KHIỂN (TOP WINDOW)
    // =========================================================================
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

        function autoReconnectJoyplay() {
            try {
                const btns = Array.from(document.querySelectorAll('button, a, div[role="button"], span'));
                for (const b of btns) {
                    const txt = (b.innerText || b.textContent || '').trim().toLowerCase();
                    if (txt === 'thử lại' || txt === 'kết nối lại' || txt === 'tải lại' || txt === 'reconnect' || txt === 'đồng ý') {
                        const rect = b.getBoundingClientRect();
                        if (rect.width > 0 && rect.height > 0 && rect.top >= 0) {
                            b.click();
                            console.log('[Tiên Nghịch Auto] Đã tự động nhấn nút kết nối lại:', txt);
                            break;
                        }
                    }
                }
            } catch(e) {}
        }
        setInterval(autoReconnectJoyplay, 3000);


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
            const style = document.createElement('style');
            style.textContent = `
                #tn-auto-hud {
                    position: fixed;
                    top: 15px;
                    left: 15px;
                    width: 760px;
                    max-width: calc(100vw - 16px);
                    max-height: calc(100vh - 16px);
                    display: flex;
                    flex-direction: column;
                    background: rgba(24, 24, 37, 0.98);
                    color: #cdd6f4;
                    border: 1.5px solid rgba(203, 166, 247, 0.45);
                    border-radius: 14px;
                    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.8), 0 0 16px rgba(203, 166, 247, 0.25);
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    z-index: 9999999;
                    user-select: none;
                    touch-action: none;
                    overflow: hidden;
                    box-sizing: border-box;
                }
                .tn-body-flex {
                    display: flex;
                    flex-direction: row;
                    gap: 12px;
                    padding: 10px 12px;
                    overflow-y: auto;
                    overflow-x: hidden;
                    flex: 1;
                    min-height: 0;
                }
                .tn-col-left {
                    width: 300px;
                    flex-shrink: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .tn-col-right {
                    flex: 1;
                    min-width: 400px;
                    display: flex;
                    flex-direction: column;
                    background: rgba(17, 17, 27, 0.55);
                    border: 1px solid rgba(203, 166, 247, 0.22);
                    border-radius: 10px;
                    padding: 10px;
                }
                .tn-feature-panels {
                    flex: 1;
                    overflow-y: auto;
                    max-height: 440px;
                    padding-right: 4px;
                }
                .tn-feature-panels::-webkit-scrollbar { width: 4px; }
                .tn-feature-panels::-webkit-scrollbar-thumb { background: #45475a; border-radius: 4px; }
                
                /* THANH NÚT CHẠY CỐ ĐỊNH Ở ĐÁY (STICKY FOOTER) */
                #tn-hud-footer {
                    background: linear-gradient(180deg, rgba(30, 30, 46, 0.98), rgba(17, 17, 27, 1));
                    padding: 9px 14px;
                    border-top: 1px solid rgba(203, 166, 247, 0.35);
                    box-shadow: 0 -6px 20px rgba(0, 0, 0, 0.7);
                    display: flex;
                    gap: 10px;
                    align-items: center;
                    z-index: 1000;
                    flex-shrink: 0;
                }
                #tn-hud-footer .tn-action-btn {
                    margin-bottom: 0;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.4);
                }
                #tn-btn-main {
                    flex: 2;
                    font-size: 13px;
                    letter-spacing: 0.4px;
                    font-weight: 800;
                }
                #tn-btn-sweep {
                    flex: 1.2;
                    font-size: 11px;
                    font-weight: 700;
                }
                #tn-auto-hud::-webkit-scrollbar {
                    width: 4px;
                }
                #tn-auto-hud::-webkit-scrollbar-thumb {
                    background: #45475a;
                    border-radius: 4px;
                }
                .tn-accordion-header {
                    background: linear-gradient(135deg, rgba(69, 71, 90, 0.8), rgba(49, 50, 68, 0.8));
                    padding: 6px 10px;
                    border-radius: 7px;
                    margin-top: 6px;
                    margin-bottom: 5px;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-weight: bold;
                    font-size: 11px;
                    color: #cba6f7;
                    border: 1px solid rgba(203, 166, 247, 0.25);
                    user-select: none;
                    transition: background 0.15s, border-color 0.15s;
                }
                .tn-accordion-header:hover {
                    background: linear-gradient(135deg, rgba(88, 91, 112, 0.9), rgba(69, 71, 90, 0.9));
                    border-color: rgba(203, 166, 247, 0.5);
                }
                .tn-accordion-arrow {
                    font-size: 9px;
                    color: #f5c2e7;
                    font-weight: bold;
                    transition: transform 0.2s;
                }
                .tn-accordion-content {
                    transition: all 0.2s ease-in-out;
                }
                .tn-accordion-content.tn-collapsed {
                    display: none !important;
                }
                #tn-hud-header {
                    padding: 7px 10px;
                    background: linear-gradient(135deg, #45475a, #313244);
                    border-top-left-radius: 12px;
                    border-top-right-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    touch-action: none;
                }
                #tn-hud-title {
                    font-weight: bold;
                    font-size: 11.5px;
                    color: #f5c2e7;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                #tn-hud-body {
                    padding: 8px 10px;
                    font-size: 11px;
                }
                .tn-badge {
                    font-size: 10px;
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-weight: bold;
                }
                .tn-badge-ready { background: #585b70; color: #cdd6f4; }
                .tn-badge-running { background: #a6e3a1; color: #11111b; animation: tnPulse 1.5s infinite; }
                @keyframes tnPulse {
                    0% { opacity: 0.8; }
                    50% { opacity: 1; filter: drop-shadow(0 0 5px #a6e3a1); }
                    100% { opacity: 0.8; }
                }
                .tn-role-card {
                    background: rgba(17, 17, 27, 0.85);
                    border-radius: 8px;
                    padding: 8px 10px;
                    margin-bottom: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                .tn-role-name { font-weight: bold; color: #89b4fa; font-size: 13px; margin-bottom: 2px; }
                .tn-role-info { font-size: 11px; color: #a6adc8; }
                
                .tn-section-title {
                    font-size: 11px;
                    font-weight: bold;
                    color: #fab387;
                    margin: 8px 0 4px 0;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .tn-tab-bar {
                    display: flex;
                    background: rgba(17, 17, 27, 0.95);
                    border-radius: 8px;
                    padding: 3px;
                    margin: 4px 0 8px 0;
                    border: 1px solid rgba(203, 166, 247, 0.3);
                    gap: 3px;
                }
                .tn-tab-btn {
                    flex: 1;
                    padding: 6px 1px;
                    border: none;
                    background: transparent;
                    color: #a6adc8;
                    font-size: 10px;
                    font-weight: bold;
                    border-radius: 6px;
                    cursor: pointer;
                    text-align: center;
                    transition: all 0.15s ease;
                }
                .tn-tab-btn:hover {
                    color: #f5c2e7;
                    background: rgba(203, 166, 247, 0.12);
                }
                .tn-tab-btn.active {
                    background: linear-gradient(135deg, rgba(203, 166, 247, 0.4), rgba(180, 190, 254, 0.4));
                    color: #fff;
                    border: 1px solid rgba(203, 166, 247, 0.65);
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
                }
                .tn-tab-panel {
                    display: none;
                }
                .tn-tab-panel.active {
                    display: block;
                }
                #tn-auto-hud.tn-user-resized .tn-col-left,
                #tn-auto-hud.tn-user-resized .tn-col-right {
                    min-height: 0;
                }
                #tn-auto-hud.tn-user-resized .tn-feature-panels {
                    display: flex;
                    flex-direction: column;
                    max-height: none;
                }
                #tn-auto-hud.tn-user-resized .tn-tab-panel.active {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                }
                #tn-auto-hud.tn-user-resized .tn-tab-panel.active > .tn-opt-list {
                    flex: 1;
                    max-height: none;
                    min-height: 0;
                }
                #tn-auto-hud.tn-user-resized .tn-tab-panel.active > div:first-child:not(.tn-opt-list) {
                    flex: 1;
                }
                .tn-opt-list {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    margin-bottom: 10px;
                    max-height: 190px;
                    overflow-y: auto;
                    padding-right: 4px;
                }
                .tn-opt-list::-webkit-scrollbar { width: 4px; }
                .tn-opt-list::-webkit-scrollbar-thumb { background: #45475a; border-radius: 4px; }
                .tn-opt-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: rgba(30, 30, 46, 0.65);
                    padding: 6px 10px;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: background 0.15s;
                }
                .tn-opt-item:hover { background: rgba(49, 50, 68, 0.85); }
                .tn-opt-item input[type="checkbox"] {
                    accent-color: #cba6f7;
                    cursor: pointer;
                    transform: scale(1.15);
                }
                .tn-action-btn {
                    width: 100%;
                    padding: 8px 0;
                    border: none;
                    border-radius: 8px;
                    font-weight: bold;
                    font-size: 12px;
                    cursor: pointer;
                    margin-bottom: 6px;
                    transition: transform 0.1s, filter 0.15s;
                }
                .tn-action-btn:active { transform: scale(0.98); }
                .tn-btn-start { background: linear-gradient(135deg, #a6e3a1, #94e2d5); color: #11111b; }
                .tn-btn-stop { background: linear-gradient(135deg, #f38ba8, #eba0ac); color: #11111b; }
                .tn-btn-sweep { background: linear-gradient(135deg, #f9e2af, #fab387); color: #11111b; }
                #tn-log-content {
                    background: #11111b;
                    border-radius: 6px;
                    padding: 6px 8px;
                    height: 70px;
                    overflow-y: auto;
                    font-family: Consolas, monospace;
                    font-size: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                #tn-auto-hud.tn-user-resized #tn-log-content {
                    flex: 1;
                    min-height: 70px;
                    height: auto;
                }
                #tn-log-content::-webkit-scrollbar { width: 4px; }
                #tn-log-content::-webkit-scrollbar-thumb { background: #313244; }
                .tn-resize-handle {
                    position: absolute;
                    bottom: 1px;
                    width: 18px;
                    height: 18px;
                    z-index: 1001;
                    touch-action: none;
                }
                .tn-resize-left {
                    left: 1px;
                    cursor: nesw-resize;
                }
                .tn-resize-right {
                    right: 1px;
                    cursor: nwse-resize;
                }
                .tn-resize-left::after,
                .tn-resize-right::after {
                    position: absolute;
                    bottom: 4px;
                    width: 8px;
                    height: 8px;
                    content: "";
                    border-bottom: 2px solid #cba6f7;
                }
                .tn-resize-left::after {
                    left: 4px;
                    border-left: 2px solid #cba6f7;
                }
                .tn-resize-right::after {
                    right: 4px;
                    border-right: 2px solid #cba6f7;
                }

            `;
            document.head.appendChild(style);
            const hud = document.createElement('div');
            hud.id = 'tn-auto-hud';
            hud.innerHTML = `
                <div id="tn-hud-header">
                    <div id="tn-hud-title">
                        <img src="${APP_ICON_B64}" style="width:16px; height:16px; border-radius:50%; object-fit:cover; display:inline-block;" alt="icon">
                        <span>⚡ Tiên Nghịch Auto</span>
                        <span id="tn-status-badge" class="tn-badge tn-badge-ready">TẠM DỪNG</span>
                    </div>
                </div>

                <!-- KHU VỰC THÂN HUD BỐ CỤC 2 CỘT DÀN NGANG -->
                <div id="tn-hud-body" class="tn-body-flex">
                    <!-- CỘT TRÁI: NHÂN VẬT, TÙY CHỌN CHUNG & NHẬT KÝ -->
                    <div class="tn-col-left">
                        <!-- THẺ NHÂN VẬT -->
                        <div class="tn-role-card">
                            <div id="tn-role-name" class="tn-role-name">Đang kết nối nhân vật...</div>
                            <div id="tn-role-info" class="tn-role-info">Lv: -- | LC: --</div>
                        </div>

                        <!-- TÙY CHỌN TOÀN CỤC CHẠY KÈM -->
                        <div class="tn-global-opts" style="background:rgba(17,17,27,0.7); border-radius:8px; padding:6px 8px; border:1px dashed rgba(166,227,161,0.35);">
                            <div style="font-size:9.5px; font-weight:bold; color:#a6e3a1; margin-bottom:4px; text-transform:uppercase;">⚡ Chạy song song toàn cục:</div>
                            <label class="tn-opt-item" style="padding:4px 8px; margin-bottom:3px;">
                                <span style="font-weight:bold; color:#cdd6f4;">⏩ Bỏ qua trận đánh thần tốc (Skip)</span>
                                <input type="checkbox" id="tn-opt-skip" ${CONFIG.autoSkipFight ? 'checked' : ''}>
                            </label>
                            <label class="tn-opt-item" style="padding:4px 8px;">
                                <span style="font-weight:bold; color:#cdd6f4;">⚡ Tối đa tốc độ x3</span>
                                <input type="checkbox" id="tn-opt-speed" ${CONFIG.maxSpeed ? 'checked' : ''}>
                            </label>
                        </div>

                        <!-- NHẬT KÝ HOẠT ĐỘNG CỘT TRÁI -->
                        <div class="tn-log-title" style="font-weight:bold; color:#888; font-size:10px; margin: 6px 0 3px 0;">NHẬT KÝ HOẠT ĐỘNG:</div>
                        <div id="tn-log-content"></div>
                    </div>

                    <!-- CỘT PHẢI: BẢNG CHỨC NĂNG 5 TAB DÀN NGANG -->
                    <div class="tn-col-right">
                        <div class="tn-section-title" style="margin:0 0 6px 0; font-size:12px; display:flex; justify-content:space-between; align-items:center;">
                            <span>⚙️ BẢNG TÍNH NĂNG TỰ ĐỘNG (5 TAB GAME)</span>
                            <span style="font-size:10px; color:#a6adc8; font-weight:normal;">(Tự lưu cấu hình)</span>
                        </div>

                        <!-- THANH ĐIỀU HƯỚNG 5 TAB GAME -->
                        <div class="tn-tab-bar">
                            <button class="tn-tab-btn" data-tab="daoThanh" title="Khu vực Đạo Thành">🏛️ Đạo Thành</button>
                            <button class="tn-tab-btn" data-tab="tuSi" title="Khu vực Tu Sĩ">🧘 Tu Sĩ</button>
                            <button class="tn-tab-btn" data-tab="troChien" title="Khu vực Trợ Chiến">⚔️ Trợ Chiến</button>
                            <button class="tn-tab-btn active" data-tab="lichLuyen" title="Khu vực Lịch Luyện">🗺️ Lịch Luyện</button>
                            <button class="tn-tab-btn" data-tab="maDao" title="Khu vực Ma Đạo">🔥 Ma Đạo</button>
                        </div>

                        <!-- DANH SÁCH TÍNH NĂNG TRONG 5 TAB -->
                        <div class="tn-feature-panels">
                            <!-- TAB 1: ĐẠO THÀNH -->
                            <div id="tn-tab-panel-dao-thanh" class="tn-tab-panel">
                                <div class="tn-opt-list">
                                    <label class="tn-opt-item" style="border-left: 3px solid #89dceb;">
                                        <div>
                                            <div style="font-weight:bold; color:#89dceb;">✨ Tâm Tiên Đài (Nhận Quà 4 Tab Free)</div>
                                            <div style="font-size:9.5px; color:#a6adc8; margin-top:2px; line-height:1.3;">Tự nhận quà miễn phí và Chiêu Mộ ngày; có thể bật mua thêm quà bằng Tiên Ngọc.</div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoTamTienDai" ${CONFIG.activeFeature === 'autoTamTienDai' ? 'checked' : ''}>
                                    </label>
                                    <label class="tn-opt-item" style="margin:0 0 4px 10px; padding:4px 8px; border-left:3px solid #a6e3a1;">
                                        <div>
                                            <div style="font-size:10px; color:#a6e3a1;">🟢 Mua Tiên Ngọc</div>
                                            <div style="font-size:9px; color:#a6adc8; margin-top:2px;">Mua quà Pháp Bảo, Linh Thú, Pháp Trận bằng Tiên Ngọc; không mua quà tiền mặt.</div>
                                        </div>
                                        <input type="checkbox" id="tn-opt-buy-tam-tien-gifts" ${CONFIG.buyTamTienGifts ? 'checked' : ''}>
                                    </label>
                                    <label class="tn-opt-item" style="border-left: 3px solid #a6e3a1;">
                                        <div>
                                            <div style="font-weight:bold; color:#a6e3a1;">🏟️ Đấu Tiên Đài (PvP Delay 2.5s)</div>
                                            <div style="font-size:9.5px; color:#a6adc8; margin-top:2px; line-height:1.3;">Chọn đối thủ lực chiến thấp và giới hạn tổng số trận miễn phí + vé mỗi lần chạy Auto.</div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoArena" ${CONFIG.activeFeature === 'autoArena' ? 'checked' : ''}>
                                    </label>
                                    <label class="tn-opt-item" style="margin:0 0 4px 10px; padding:4px 8px; border-left:3px solid #a6e3a1;">
                                        <div style="font-size:10px; color:#a6e3a1;">Giới hạn (Free + Dùng Đấu Tiên Lệnh):</div>
                                        <input type="number" id="tn-opt-arena-battle-limit" min="1" step="1" value="${CONFIG.arenaBattleLimit}" style="width:52px; padding:2px 4px; background:#181825; color:#cdd6f4; border:1px solid #45475a; border-radius:4px;">
                                    </label>
                                    <label class="tn-opt-item" style="border-left: 3px solid #f9e2af;">
                                        <div>
                                            <div style="font-weight:bold; color:#f9e2af;">🤝 Tiên Hữu (Tặng Nhanh Bạn Bè)</div>
                                            <div style="font-size:9.5px; color:#a6adc8; margin-top:2px; line-height:1.3;">Vào Tiên Hữu tự động bấm Tặng nhanh điểm tình bạn mỗi ngày.</div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoTienHuu" ${CONFIG.activeFeature === 'autoTienHuu' ? 'checked' : ''}>
                                    </label>
                                    <label class="tn-opt-item" style="border-left: 3px solid #cba6f7;">
                                        <div>
                                            <div style="font-weight:bold; color:#cba6f7;">🏛️ Tiên Minh (Bang Hội Trọn Gói)</div>
                                            <div style="font-size:9.5px; color:#a6adc8; margin-top:2px; line-height:1.3;">Trả giá Shop, Dâng Tôn Sư, Xin & viện trợ mảnh 5 sao, Tăng cấp kỹ năng & Quét boss.</div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoTienMinh" ${CONFIG.activeFeature === 'autoTienMinh' ? 'checked' : ''}>
                                    </label>
                                    <label class="tn-opt-item" style="border-left: 3px solid #f38ba8;">
                                        <div>
                                            <div style="font-weight:bold; color:#f38ba8;">📬 Nhận Cuối Ngày (Thư, Like BXH, Sôi Nổi)</div>
                                            <div style="font-size:9.5px; color:#a6adc8; margin-top:2px; line-height:1.3;">Nhận toàn bộ Thư, Like BXH Đạo Thành 3 lần, nhận hết rương Sôi Nổi (25, 50, 75, 100).</div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoCuoiNgay" ${CONFIG.activeFeature === 'autoCuoiNgay' ? 'checked' : ''}>
                                    </label>
                                    <label class="tn-opt-item" style="border-left: 3px solid #f5c2e7;">
                                        <div>
                                            <div style="font-weight:bold; color:#f5c2e7;">🔨 Rèn Tiên Khí & Nâng Khí Đỉnh</div>
                                            <div style="font-size:9.5px; color:#a6adc8; margin-top:2px; line-height:1.3;">Tự rèn trang bị phẩm cao & nâng cấp Khí Đỉnh khi đủ Đá Sao Trời.</div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoForge" ${CONFIG.activeFeature === 'autoForge' ? 'checked' : ''}>
                                    </label>
                                </div>
                            </div>

                            <!-- TAB 2: TU SĨ -->
                            <div id="tn-tab-panel-tu-si" class="tn-tab-panel">
                                <div style="text-align:center; padding:24px 8px; color:#a6adc8; font-size:11px; background:rgba(17,17,27,0.5); border-radius:8px;">
                                    🧘 <b>Khu Vực Tu Sĩ</b><br>
                                    <span style="font-size:9.5px; color:#6c7086; margin-top:4px; display:inline-block;">Tự động phối hợp bồi dưỡng tướng và nâng cấp cảnh giới.</span>
                                </div>
                            </div>

                            <!-- TAB 3: TRỢ CHIẾN -->
                            <div id="tn-tab-panel-tro-chien" class="tn-tab-panel">
                                <div class="tn-opt-list">
                                    <label class="tn-opt-item" style="border-left: 3px solid #a6e3a1;">
                                        <div>
                                            <div style="font-weight:bold; color:#a6e3a1;">🐾 Trợ Chiến Linh Thú (Nhận Nhanh)</div>
                                            <div style="font-size:9.5px; color:#a6adc8; margin-top:2px; line-height:1.3;">Vào Trợ Chiến &rarr; Linh Thú &rarr; Tab Hoàn &rarr; Bấm Nhận nhanh tài nguyên.</div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoTroChien" ${CONFIG.activeFeature === 'autoTroChien' ? 'checked' : ''}>
                                    </label>
                                </div>
                            </div>

                            <!-- TAB 4: LỊCH LUYỆN (MODULE 1 ĐẾN 7 ĐẦY ĐỦ) -->
                            <div id="tn-tab-panel-lich-luyen" class="tn-tab-panel active">
                                <div class="tn-opt-list">
                                    <!-- MODULE 1 -->
                                    <label class="tn-opt-item" style="border-left: 3px solid #f5c2e7;">
                                        <div>
                                            <div style="font-weight:bold; color:#f5c2e7;">🗼 [M1] Thông Thiên Tháp & Tứ Linh Tháp</div>
                                            <div style="font-size:9.5px; color:#a6adc8; margin-top:2px; line-height:1.3;">Quét Thông Thiên (Free + Mua Tiên Ngọc). Cử trợ trận tướng 1, leo 4 tháp & quét 2 lần.</div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoTongTian" ${CONFIG.activeFeature === 'autoTongTian' ? 'checked' : ''}>
                                    </label>
                                    <!-- MODULE 2 -->
                                    <label class="tn-opt-item" style="border-left: 3px solid #fab387;">
                                        <div>
                                            <div style="font-weight:bold; color:#fab387;">⚔️ [M2] Phụ Bản Ngày & Bí Cảnh Tứ Quốc</div>
                                            <div style="font-size:9.5px; color:#a6adc8; margin-top:2px; line-height:1.3;">Quét nhanh PB Ngày (Free & 250 Tiên Ngọc). Quét Bí Cảnh tầng Đủ Vượt 10 lần.</div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoDailyDungeon" ${CONFIG.activeFeature === 'autoDailyDungeon' ? 'checked' : ''}>
                                    </label>
                                    <!-- MODULE 3 -->
                                    <label class="tn-opt-item" style="border-left: 3px solid #89b4fa;">
                                        <div>
                                            <div style="font-weight:bold; color:#89b4fa;">🛡️ [M3] Thủ Vệ Tứ Phái (Buff Cột Giữa)</div>
                                            <div style="font-size:9.5px; color:#a6adc8; margin-top:2px; line-height:1.3;">Cử trợ trận, chọn bạn ủng hộ, tự click Buff cột giữa (x=225, y=490) & nhận Chiến Lệnh.</div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoSectDefense" ${CONFIG.activeFeature === 'autoSectDefense' ? 'checked' : ''}>
                                    </label>
                                    <!-- MODULE 4 -->
                                    <label class="tn-opt-item" style="border-left: 3px solid #94e2d5;">
                                        <div>
                                            <div style="font-weight:bold; color:#94e2d5;">⚔️ [M4] Cửu Uyển Nhi, Cổ Thần, Cực Âm</div>
                                            <div style="font-size:9.5px; color:#a6adc8; margin-top:2px; line-height:1.3;">Nhận Chiến Lệnh Uyển Nhi, Lên trận nhanh Cổ Thần Địa & Khiêu chiến Cực Âm Địa.</div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoOtherTrials" ${CONFIG.activeFeature === 'autoOtherTrials' ? 'checked' : ''}>
                                    </label>
                                    <!-- MODULE 5 -->
                                    <label class="tn-opt-item" style="border-left: 3px solid #f9e2af;">
                                        <div>
                                            <div style="font-weight:bold; color:#f9e2af;">💎 [M5] Di Tích Tiên Giới (Bảo Vệ Lv4)</div>
                                            <div style="font-size:9.5px; color:#a6adc8; margin-top:2px; line-height:1.3;">Quét 6 bệ Lv1-4, làm mới Lv1-3. Gặp cảnh báo Lv4 lập tức HỦY để khai thác bệ Lv4.</div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoImmortalRelic" ${CONFIG.activeFeature === 'autoImmortalRelic' ? 'checked' : ''}>
                                    </label>
                                    <!-- MODULE 6 -->
                                    <label class="tn-opt-item" style="border-left: 3px solid #cba6f7;">
                                        <div>
                                            <div style="font-weight:bold; color:#cba6f7;">🧩 [M6] Giải Minigame Ảo Cảnh (Lưới 4x4)</div>
                                            <div style="font-size:9.5px; color:#a6adc8; margin-top:2px; line-height:1.3;">Chờ lật 1.2s, giải ma trận 16 ô lật 8 cặp chuẩn xác, nhận 3 rương, NV & Like BXH.</div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoMinigameMemory" ${CONFIG.activeFeature === 'autoMinigameMemory' ? 'checked' : ''}>
                                    </label>
                                    <!-- MODULE 7 -->
                                    <label class="tn-opt-item" style="border-left: 3px solid #f38ba8;">
                                        <div>
                                            <div style="font-weight:bold; color:#f38ba8;">🐉 [M7] Kiếm Hành & Điêu Long Khắc Tinh QTE</div>
                                            <div style="font-size:9.5px; color:#a6adc8; margin-top:2px; line-height:1.3;">Xúc xắc 3.5s; QTE bắt nhịp đúng 380ms Hoàn Mỹ, 5 lần, nhận 5 rương & Chiến Lệnh.</div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoMinigameDragon" ${CONFIG.activeFeature === 'autoMinigameDragon' ? 'checked' : ''}>
                                    </label>
                                    <!-- PHỤ BẢN PHỤ -->
                                    <label class="tn-opt-item" style="border-left: 3px solid #89b4fa;">
                                        <div>
                                            <div style="font-weight:bold; color:#89b4fa;">🌌 Leo Vực U Minh (Tự xếp đội hình)</div>
                                            <div style="font-size:9.5px; color:#a6adc8; margin-top:2px; line-height:1.3;">Tự động đổi trận pháp & vượt ải Vực U Minh thu thập bí bảo.</div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoClimbYMAbyss" ${CONFIG.activeFeature === 'autoClimbYMAbyss' ? 'checked' : ''}>
                                    </label>
                                </div>
                            </div>

                            <!-- TAB 5: MA ĐẠO (Treo máy, Ủy phái, Quà Tiên, Nhiệm vụ) -->
                            <div id="tn-tab-panel-ma-dao" class="tn-tab-panel">
                                <div class="tn-opt-list">
                                    <label class="tn-opt-item" style="border-left: 3px solid #f9e2af;">
                                        <div>
                                            <div style="font-weight:bold; color:#f9e2af;">📜 Ủy Phái Ma Đạo & Quà Tiên</div>
                                            <div style="font-size:9.5px; color:#a6adc8; margin-top:2px; line-height:1.3;">Ưu tiên ủy phái Cam/Tím, chặn làm mới nếu có nhiệm vụ hiếm; mua Đạo Cụ Phường.</div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoMaDaoUyPhai" ${CONFIG.activeFeature === 'autoMaDaoUyPhai' ? 'checked' : ''}>
                                    </label>
                                    <label class="tn-opt-item" style="border-left: 3px solid #f38ba8;">
                                        <div>
                                            <div style="font-weight:bold; color:#f38ba8;">🚩 Đi Ải Chính Tuyến (Ải Ma Đạo)</div>
                                            <div style="font-size:9.5px; color:#a6adc8; margin-top:2px; line-height:1.3;">Bắt đầu ải &rarr; Auto đội hình &rarr; Skip chiến đấu &rarr; Ải tiếp &rarr; Nhận thưởng.</div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoMainStage" ${CONFIG.activeFeature === 'autoMainStage' ? 'checked' : ''}>
                                    </label>
                                    <label class="tn-opt-item" style="border-left: 3px solid #a6e3a1;">
                                        <div>
                                            <div style="font-weight:bold; color:#a6e3a1;">🎁 Nhận Thưởng Treo Máy (AFK)</div>
                                            <div style="font-size:9.5px; color:#a6adc8; margin-top:2px; line-height:1.3;">Tự động thu thập kinh nghiệm, tu vi và vật phẩm tích lũy treo máy ma đạo.</div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoHangupReward" ${CONFIG.activeFeature === 'autoHangupReward' ? 'checked' : ''}>
                                    </label>
                                    <label class="tn-opt-item" style="border-left: 3px solid #89dceb;">
                                        <div>
                                            <div style="font-weight:bold; color:#89dceb;">⚡ Tác Chiến Nhanh (Mua AFK)</div>
                                            <div style="font-size:9.5px; color:#a6adc8; margin-top:2px; line-height:1.3;">Mua nhanh lượt treo máy nhận ngay 120 phút tài nguyên cấp tốc.</div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoQuickHang" ${CONFIG.activeFeature === 'autoQuickHang' ? 'checked' : ''}>
                                    </label>
                                    <label class="tn-opt-item" style="border-left: 3px solid #b4befe;">
                                        <div>
                                            <div style="font-weight:bold; color:#b4befe;">📜 Nhiệm Vụ Ngày & Rương Sôi Nổi</div>
                                            <div style="font-size:9.5px; color:#a6adc8; margin-top:2px; line-height:1.3;">Hoàn thành nhiệm vụ hàng ngày và nhận các mốc rương 25, 50, 75, 100.</div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoDailyTask" ${CONFIG.activeFeature === 'autoDailyTask' ? 'checked' : ''}>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- THANH NÚT CHẠY CỐ ĐỊNH Ở ĐÁY HUD (STICKY / FIXED FOOTER) -->
                <div id="tn-hud-footer">
                    <button id="tn-btn-main" class="tn-action-btn tn-btn-start">▶ BẮT ĐẦU TREO LEO ẢI AUTO</button>
                    <button id="tn-btn-sweep" class="tn-action-btn tn-btn-sweep">⚡ QUÉT NHANH (1 CHẠM)</button>
                </div>
                <div class="tn-resize-handle tn-resize-left" title="Kéo để đổi kích thước"></div>
                <div class="tn-resize-handle tn-resize-right" title="Kéo để đổi kích thước"></div>
            `;
            document.body.appendChild(hud);

            // NẠP NGAY DỮ LIỆU NHÂN VẬT TỪ PHIÊN TRƯỚC (NẾU CÓ) TRÁNH HIỆN --
            try {
                const initCachedName = localStorage.getItem('TN_LAST_ROLE_NAME') || '';
                const nameEl = document.getElementById('tn-role-name');
                if (initCachedName && nameEl) nameEl.textContent = initCachedName;
            } catch(e) {}

            const header = document.getElementById('tn-hud-header');
            makeSmoothDraggable(hud, header);
            makeHudResizable(hud, document.querySelector('.tn-resize-left'), 'left');
            makeHudResizable(hud, document.querySelector('.tn-resize-right'), 'right');

            // Cấu hình các mục thu gọn / mở rộng (Accordion Collapsible Sections)
            function setupAccordion(headerId, contentId, arrowId, storageKey) {
                const hEl = document.getElementById(headerId);
                const cEl = document.getElementById(contentId);
                const aEl = document.getElementById(arrowId);
                if (!hEl || !cEl) return;

                let isOpen = localStorage.getItem(storageKey) !== '0'; // mặc định mở

                function updateView() {
                    if (isOpen) {
                        cEl.classList.remove('tn-collapsed');
                        if (aEl) aEl.textContent = '▼';
                    } else {
                        cEl.classList.add('tn-collapsed');
                        if (aEl) aEl.textContent = '▶';
                    }
                }
                updateView();

                hEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    isOpen = !isOpen;
                    try { localStorage.setItem(storageKey, isOpen ? '1' : '0'); } catch(err) {}
                    updateView();
                });
            }

            setupAccordion('tn-sec-header-acc', 'tn-sec-content-acc', 'tn-arrow-acc', 'TN_SEC_ACC_OPEN');
            setupAccordion('tn-sec-header-cfg', 'tn-sec-content-cfg', 'tn-arrow-cfg', 'TN_SEC_CFG_OPEN');
            setupAccordion('tn-sec-header-ctrl', 'tn-sec-content-ctrl', 'tn-arrow-ctrl', 'TN_SEC_CTRL_OPEN');

            // CẤU HÌNH TAB BAR & CHUYỂN ĐỔI 5 PHẦN
            const tabButtons = document.querySelectorAll('.tn-tab-btn');
            const tabPanels = {
                daoThanh: document.getElementById('tn-tab-panel-dao-thanh'),
                tuSi: document.getElementById('tn-tab-panel-tu-si'),
                troChien: document.getElementById('tn-tab-panel-tro-chien'),
                lichLuyen: document.getElementById('tn-tab-panel-lich-luyen'),
                maDao: document.getElementById('tn-tab-panel-ma-dao')
            };

            function switchTab(tabKey) {
                tabButtons.forEach(btn => {
                    if (btn.dataset.tab === tabKey) btn.classList.add('active');
                    else btn.classList.remove('active');
                });
                for (const k in tabPanels) {
                    if (tabPanels[k]) {
                        if (k === tabKey) tabPanels[k].classList.add('active');
                        else tabPanels[k].classList.remove('active');
                    }
                }
                CONFIG.activeTab = tabKey;
                saveConfig();
            }

            tabButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    switchTab(btn.dataset.tab);
                });
            });

            if (CONFIG.activeTab && tabPanels[CONFIG.activeTab]) {
                switchTab(CONFIG.activeTab);
            }

            // CẤU HÌNH ĐỘC QUYỀN 1 CHỨC NĂNG DUY NHẤT (MUTEX) ĐỂ TRÁNH XUNG ĐỘT
            const mainFeatures = [
                'autoTongTian', 'autoClimbDailyDungeons', 'autoClimbYMAbyss', 'autoClimbCamp',
                'autoSweepDungeons', 'autoExtremeYin', 'autoArena', 'autoForge',
                'autoMainStage', 'autoHangupReward', 'autoQuickHang', 'autoXianYuan', 'autoDailyTask'
            ];

            const mutexCheckboxes = document.querySelectorAll('.tn-mutex-feature');

            // Đồng bộ trạng thái ban đầu của các checkbox
            mutexCheckboxes.forEach(cb => {
                const key = cb.dataset.key;
                cb.checked = (CONFIG.activeFeature === key) || (Boolean(CONFIG[key]) && !CONFIG.activeFeature);
                if (cb.checked && !CONFIG.activeFeature) {
                    CONFIG.activeFeature = key;
                }
            });

            mutexCheckboxes.forEach(cb => {
                cb.addEventListener('change', (e) => {
                    const key = cb.dataset.key;
                    if (e.target.checked) {
                        if (key === 'autoTamTienDai') {
                            CONFIG.buyTamTienGifts = true;
                            const buyTamTienGiftsEl = document.getElementById('tn-opt-buy-tam-tien-gifts');
                            if (buyTamTienGiftsEl) buyTamTienGiftsEl.checked = true;
                        } else {
                            CONFIG.buyTamTienGifts = false;
                            const buyTamTienGiftsEl = document.getElementById('tn-opt-buy-tam-tien-gifts');
                            if (buyTamTienGiftsEl) buyTamTienGiftsEl.checked = false;
                        }
                        // Tắt tất cả các chức năng chính khác
                        mutexCheckboxes.forEach(other => {
                            if (other !== cb) other.checked = false;
                        });
                        mainFeatures.forEach(k => {
                            CONFIG[k] = (k === key);
                        });
                        CONFIG.activeFeature = key;
                        saveConfig();
                        sendCommandToGame('UPDATE_CONFIG', { config: CONFIG });
                        const title = cb.closest('label').querySelector('div div') ? cb.closest('label').querySelector('div div').innerText : key;
                        addLogToUI("🎯 Chế độ Auto đã kích hoạt: " + title, "info");
                    } else {
                        CONFIG[key] = false;
                        if (key === 'autoTamTienDai') {
                            CONFIG.buyTamTienGifts = false;
                            const buyTamTienGiftsEl = document.getElementById('tn-opt-buy-tam-tien-gifts');
                            if (buyTamTienGiftsEl) buyTamTienGiftsEl.checked = false;
                        }
                        if (CONFIG.activeFeature === key) CONFIG.activeFeature = null;
                        saveConfig();
                        sendCommandToGame('UPDATE_CONFIG', { config: CONFIG });
                        addLogToUI("⏸️ Đã tắt tính năng: " + key, "warn");
                    }
                });
            });

            // TÙY CHỌN BỔ TRỢ TOÀN CỤC (CHẠY KÈM TẤT CẢ)
            const skipEl = document.getElementById('tn-opt-skip');
            if (skipEl) {
                skipEl.checked = Boolean(CONFIG.autoSkipFight);
                skipEl.addEventListener('change', (e) => {
                    CONFIG.autoSkipFight = e.target.checked;
                    saveConfig();
                    sendCommandToGame('UPDATE_CONFIG', { config: CONFIG });
                    addLogToUI(CONFIG.autoSkipFight ? "⏩ Bật bỏ qua trận đấu thần tốc!" : "⏸️ Tắt bỏ qua trận đấu", "info");
                });
            }

            const speedEl = document.getElementById('tn-opt-speed');
            if (speedEl) {
                speedEl.checked = Boolean(CONFIG.maxSpeed);
                speedEl.addEventListener('change', (e) => {
                    CONFIG.maxSpeed = e.target.checked;
                    saveConfig();
                    sendCommandToGame('UPDATE_CONFIG', { config: CONFIG });
                });
            }

            const buyTamTienGiftsEl = document.getElementById('tn-opt-buy-tam-tien-gifts');
            if (buyTamTienGiftsEl) {
                buyTamTienGiftsEl.checked = Boolean(CONFIG.buyTamTienGifts);
                buyTamTienGiftsEl.addEventListener('change', (e) => {
                    CONFIG.buyTamTienGifts = e.target.checked;
                    saveConfig();
                    sendCommandToGame('UPDATE_CONFIG', { config: CONFIG });
                    addLogToUI(
                        CONFIG.buyTamTienGifts
                            ? "🟢 Đã bật mua quà Tâm Tiên Đài bằng Tiên Ngọc."
                            : "⏸️ Đã tắt mua quà Tâm Tiên Đài bằng Tiên Ngọc.",
                        "info"
                    );
                });
            }

            const arenaBattleLimitEl = document.getElementById('tn-opt-arena-battle-limit');
            if (arenaBattleLimitEl) {
                arenaBattleLimitEl.addEventListener('change', (e) => {
                    const input = e.target;
                    const limit = Number(input.value);
                    CONFIG.arenaBattleLimit = Number.isInteger(limit) && limit >= 1 ? limit : 5;
                    input.value = String(CONFIG.arenaBattleLimit);
                    saveConfig();
                    sendCommandToGame('UPDATE_CONFIG', { config: CONFIG });
                });
            }

            const btnMain = document.getElementById('tn-btn-main');
            if (btnMain) {
                btnMain.addEventListener('click', () => {
                    CONFIG.running = !CONFIG.running;
                    saveConfig();
                    updateBadge(CONFIG.running);
                    sendCommandToGame('TOGGLE_AUTO', { running: CONFIG.running, config: CONFIG });
                    addLogToUI(CONFIG.running ? "🚀 Đã bắt đầu treo leo ải Auto!" : "⏸ Đã tạm dừng Auto.", CONFIG.running ? "action" : "warn");
                });
            }

            const btnSweep = document.getElementById('tn-btn-sweep');
            btnSweep.addEventListener('click', () => {
                addLogToUI("⚡ Đang quét một lượt toàn bộ các phụ bản đã vượt...", "action");
                sendCommandToGame('RUN_SWEEP', { config: CONFIG });
            });

            updateBadge(CONFIG.running);
            addLogToUI(`✨ Auto Tiên Nghịch Mobile v${CURRENT_AUTO_VERSION} (Bảng tính năng 5 tab, chạy cục bộ) đã sẵn sàng!`, "action");
            // Định kỳ yêu cầu Game gửi thông tin nhân vật lên HUD
            setInterval(() => {
                sendCommandToGame('REQUEST_ROLE_INFO');
            }, 1500);
            sendCommandToGame('REQUEST_ROLE_INFO');
            setTimeout(() => sendCommandToGame('REQUEST_ROLE_INFO'), 500);
            setTimeout(() => sendCommandToGame('REQUEST_ROLE_INFO'), 1500);
            setTimeout(() => sendCommandToGame('REQUEST_ROLE_INFO'), 3000);
        }

        function startInitUI() {
            if (document.getElementById('tn-auto-hud')) return;
            if (!document.body) {
                setTimeout(startInitUI, 200);
                return;
            }
            initUI();
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', startInitUI);
        } else {
            startInitUI();
        }
        setTimeout(startInitUI, 500);
        setTimeout(startInitUI, 1500);
        setTimeout(startInitUI, 3000);
    }

    // =========================================================================
    // PHẦN 2: ENGINE XỬ LÝ GAME (CHẠY BÊN TRONG NGỮ CẢNH CỦA GAME ENGINE)
    // =========================================================================
    const isGameContext = !!window.DailyDungeonCtrl || !isTopWindow;
    if (isGameContext) {
        const failCounts = {};
        let isExecuting = false;
        let lastActionTime = 0;
        let isTowerChallenging = false;
        let waitingForFloorUpdate = false;
        let lastPassedFloor = 0;
        let hasSweptToday = false;

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


        function sendRoleInfo() {
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

                try {
                    if (typeof updateRoleDisplay === 'function') { try { updateRoleDisplay(rolePayload); } catch(e){} }
                    if (roleName) localStorage.setItem('TN_LAST_ROLE_NAME', roleName);
                } catch(e) {}

                // Gửi message lên Top Window
                const rolePayload = {
                    uid: roleUid,
                    name: roleName,
                    level: lvl,
                    power: power
                };

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

        setInterval(sendRoleInfo, 1500);

        window.addEventListener('message', (event) => {
            const data = event.data;
            if (!data || data.source !== 'TIEN_NGHICH_AUTO_HUD') return;

            if (data.action === 'REQUEST_ROLE_INFO') {
                sendRoleInfo();
                return;
            } else if (data.action === 'UPDATE_CONFIG') {
                Object.assign(CONFIG, data.config);
                saveConfig();
            } else if (data.action === 'TOGGLE_AUTO') {
                const wasRunning = CONFIG.running;
                CONFIG.running = data.running;
                if (data.config) Object.assign(CONFIG, data.config);
                saveConfig();
                if (CONFIG.running) {
                    if (!wasRunning && typeof resetArenaRun === 'function') resetArenaRun();
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
        function hookRecharge(ctx) {
            if (!ctx.RechargeCtrl) return;
            try {
                const rcProto = ctx.RechargeCtrl.prototype;
                if (!rcProto.__tnHooked) {
                    rcProto.__tnHooked = true;
                    rcProto.bBuyTermById = function (t) { return true; };
                    rcProto.openAutoFight = function (t) { return true; };
                }
            } catch (e) { }

            if (ctx.GlobalCtrl && ctx.GlobalCtrl.prototype) {
                const gProto = ctx.GlobalCtrl.prototype;
                if (!gProto.__tnHookedErr) {
                    gProto.__tnHookedErr = true;
                    const origShowErr = gProto.showErrorMsg;
                    gProto.showErrorMsg = function (msg) {
                        if (typeof msg === 'string' && (msg.includes('chiến lệnh') || msg.includes('81891') || msg.includes('chưa mua'))) {
                            return;
                        }
                        if (origShowErr) origShowErr.apply(this, arguments);
                    };
                }
            }
        }

        // Hook FightCtrl: TỰ ĐỘNG SKIP KHIÊU CHIẾN CHO MỌI PHỤ BẢN & ĐẤU TRƯỜNG
        function hookFightCtrl(ctx) {
            if (!ctx.FightCtrl) return;
            const fcProto = ctx.FightCtrl.prototype;
            if (fcProto.__tnHookedSkip) return;
            fcProto.__tnHookedSkip = true;

            const origRecvFightFrame = fcProto.recvFightFrame;
            fcProto.recvFightFrame = function (t) {
                if (CONFIG.autoSkipFight && t) {
                    const n = ctx.FightConst && ctx.FightConst.ERoundFightType;
                    if (n) {
                        const isSkippable = (
                            t.type === n.dungeon ||
                            t.type === n.runningMan ||
                            t.type === n.ymAbyss ||
                            (t.type >= n.singCamp_wei && t.type <= n.singCamp_qun)
                        );
                        if (isSkippable) {
                            const showed = this.executeShowRoundFight(t, true);
                            if (showed) {
                                this.m_roundFightData = t;
                                this.executeFinishFight(true);
                                return;
                            }
                        }
                    }
                }
                return origRecvFightFrame.apply(this, arguments);
            };
        }

        // Hook đồng bộ dữ liệu Thông Thiên Tháp & Phụ Bản
        function hookDailyDungeonCtrl(ctx) {
            if (!ctx.DailyDungeonCtrl) return;
            const ddProto = ctx.DailyDungeonCtrl.prototype;
            if (ddProto.__tnTowerHooked) return;
            ddProto.__tnTowerHooked = true;

            const origOn11009 = ddProto.on11009;
            ddProto.on11009 = function (t) {
                try {
                    const netData = t && t.netData;
                    if (netData && netData.res === 1) {
                        const passedId = netData.dungeon_id || 0;
                        isTowerChallenging = false;
                        waitingForFloorUpdate = false;
                        if (passedId > 0) {
                            lastPassedFloor = passedId;
                            sendLog(`🎉 Vượt ải thành công: #${passedId}!`, "action");
                        }
                    }
                } catch (e) { }

                if (origOn11009) origOn11009.apply(this, arguments);
            };

            const origOn11004 = ddProto.on11004;
            ddProto.on11004 = function (t) {
                try {
                    const netData = t && t.netData;
                    if (netData) {
                        const maxPassed = netData.max_pass_dungoen_id || netData.dungeon_id || netData.cur_id || 0;
                        if (maxPassed > 0) lastPassedFloor = maxPassed;
                        isTowerChallenging = false;
                        waitingForFloorUpdate = false;
                    }
                } catch (e) { }

                if (origOn11004) origOn11004.apply(this, arguments);
            };

            const origOn11001 = ddProto.on11001;
            ddProto.on11001 = function (t) {
                try {
                    const netData = t && t.netData;
                    if (netData && netData.res !== undefined && netData.res !== 1) {
                        isTowerChallenging = false;
                        waitingForFloorUpdate = false;
                    }
                } catch (e) { }

                if (origOn11001) origOn11001.apply(this, arguments);
            };
        }

        function hookGameEvents(ctx) {
            hookRecharge(ctx);
            hookDailyDungeonCtrl(ctx);
            hookFightCtrl(ctx);
        }

        // Xử lý bỏ qua trận đánh, tự xếp đội hình, tự bắt đầu & đóng popup
        function handleBattle(ctx) {
            let acted = false;
            try {
                if (CONFIG.autoSkipFight && ctx.DailyDungeonCtrl && ctx.DailyDungeonCtrl.gInst) {
                    const dd = ctx.DailyDungeonCtrl.gInst();
                    dd.openRunManAutoFight = true;
                    dd.saveAlertRunManAutoFight = true;
                }

                if (CONFIG.maxSpeed && ctx.FightCtrl && ctx.FightCtrl.gInst) {
                    const fc = ctx.FightCtrl.gInst();
                    if (fc.speed && fc.speed < 3) fc.speed = 3;
                }

                if (ctx.ViewMgr && ctx.ViewMgr.gInst) {
                    const vm = ctx.ViewMgr.gInst();

                    if (vm.viewIsVisible && (vm.viewIsVisible('ymAbyssChallengeUi') || vm.viewIsVisible('YMAbyssChallengeUi'))) {
                        const chUi = vm.getViewByName('ymAbyssChallengeUi') || vm.getViewByName('YMAbyssChallengeUi');
                        if (chUi && typeof chUi.onClick === 'function') {
                            chUi.onClick();
                            sendLog("🌌 [Vực U Minh] Đã tự động bấm Khiêu Chiến từ bảng ải!", "action");
                            acted = true;
                        }
                    }

                    if (vm.viewIsVisible && vm.viewIsVisible('embattleUi')) {
                        const embUi = vm.getViewByName('embattleUi');
                        if (embUi) {
                            if (typeof embUi.oneKeyEmbattleLogic === 'function') embUi.oneKeyEmbattleLogic(0);
                            if (typeof embUi.saveEmbattleLogic === 'function') embUi.saveEmbattleLogic();
                            if (typeof embUi.cBtnH2 === 'function') {
                                embUi.cBtnH2();
                                sendLog("🌌 [Vực U Minh] Đã tự động chọn đội hình & bấm BẮT ĐẦU!", "action");
                                acted = true;
                            }
                        }
                    }

                    const resultViewNames = [
                        'fightSuccessUi', 'fightFailUi', 'winUi', 'fightWinUi', 'fightResultUi', 'adventureResultUi', 'guildAskedFightResultUi'
                    ];

                    resultViewNames.forEach(name => {
                        if (vm.viewIsVisible && vm.viewIsVisible(name)) {
                            vm.closeView(name);
                            acted = true;
                        }
                    });
                }
            } catch (e) { }
            return acted;
        }
        function getNextDungeonId(ctx, dungeonType) {
            const dd = ctx.DailyDungeonCtrl.gInst();
            if (!dd) return 0;

            let curId = 0;
            if (typeof dd.gCurDgnId === 'function') curId = dd.gCurDgnId(dungeonType);
            if ((!curId || curId <= 0) && typeof dd.gTJDgnBaseId === 'function') curId = dd.gTJDgnBaseId(dungeonType);
            if ((!curId || curId <= 0) && dd.dungeonDataDic && dd.dungeonDataDic[dungeonType]) {
                const dData = dd.dungeonDataDic[dungeonType];
                const lastId = dData.maxPassDungeonId || 0;
                if (lastId > 0 && typeof dd.gBaseCfg === 'function') {
                    const cfg = dd.gBaseCfg(lastId);
                    if (cfg && cfg.next_id) curId = cfg.next_id;
                } else if (typeof dd.gDgnBaseTypeArr === 'function') {
                    const arr = dd.gDgnBaseTypeArr(dungeonType);
                    if (arr && arr[0]) curId = arr[0].id;
                }
            }
            if ((!curId || curId <= 0) && typeof dd.send11004 === 'function') dd.send11004(dungeonType);
            return curId || 0;
        }

        // 1. TỰ ĐỘNG LEO THÔNG THIÊN THÁP
        function handleTongTianTower(ctx) {
            if (!CONFIG.autoTongTian) return false;
            try {
                const ddCtrl = ctx.DailyDungeonCtrl.gInst();
                if (!ddCtrl) return false;

                if (ctx.ViewMgr && ctx.ViewMgr.gInst) {
                    const vm = ctx.ViewMgr.gInst();
                    const isTowerOpen = (vm.viewIsVisible && (vm.viewIsVisible('BabelEntraceUi') || vm.viewIsVisible('RunningManUi')));
                    if (!isTowerOpen && typeof ddCtrl.opSCpCyUi === 'function') ddCtrl.opSCpCyUi(0, false);
                }

                ddCtrl.openRunManAutoFight = true;
                ddCtrl.saveAlertRunManAutoFight = true;

                if (isTowerChallenging || waitingForFloorUpdate) return false;

                const towerType = (ctx.DailyDungeonConst && ctx.DailyDungeonConst.dailyDungeonType && ctx.DailyDungeonConst.dailyDungeonType.runningMan) || 1;
                const curDgnId = getNextDungeonId(ctx, towerType);
                if (curDgnId <= 0 || (failCounts[curDgnId] && failCounts[curDgnId] >= 2)) return false;

                isTowerChallenging = true;
                waitingForFloorUpdate = true;

                if (typeof ddCtrl.sRMFightData === 'function') ddCtrl.sRMFightData(curDgnId);
                ddCtrl.send11001(curDgnId, 0);
                sendLog(`🗼 [Thông Thiên Tháp] Đang khiêu chiến tầng #${curDgnId}...`, "action");

                setTimeout(() => {
                    isTowerChallenging = false;
                    waitingForFloorUpdate = false;
                }, 2200);

                return true;
            } catch (e) {
                isTowerChallenging = false;
                waitingForFloorUpdate = false;
            }
            return false;
        }

        // 2. TỰ ĐỘNG LEO PHỤ BẢN NGÀY
        const DAILY_DGN_TYPES = [
            { type: 3, name: "EXP" }, { type: 2, name: "Linh Thạch" }, { type: 4, name: "Tu Sĩ" }, { type: 5, name: "Pháp Bảo" }
        ];
        function handleClimbDailyDungeons(ctx) {
            if (!CONFIG.autoClimbDailyDungeons) return false;
            const now = Date.now();
            if (now - lastDailyClimbTime < 2200) return false;

            const dd = ctx.DailyDungeonCtrl.gInst();
            if (!dd) return false;

            for (let i = 0; i < DAILY_DGN_TYPES.length; i++) {
                const idx = (lastDailyClimbIndex + i) % DAILY_DGN_TYPES.length;
                const dgn = DAILY_DGN_TYPES[idx];
                const nextId = getNextDungeonId(ctx, dgn.type);

                if (nextId > 0 && (!failCounts[nextId] || failCounts[nextId] < 2)) {
                    lastDailyClimbIndex = (idx + 1) % DAILY_DGN_TYPES.length;
                    lastDailyClimbTime = now;

                    if (typeof dd.sRMFightData === 'function') dd.sRMFightData(nextId);
                    dd.send11001(nextId, 0);
                    sendLog(`⚔️ [Leo Phụ Bản - ${dgn.name}] Đang khiêu chiến ải mới #${nextId} (Skip tự động)...`, "action");
                    return true;
                }
            }
            return false;
        }

        // 3. TỰ ĐỘNG LEO VỰC U MINH
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
                lastAbyssClimbTime = now;

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

                if (typeof abyss.startFight === 'function') abyss.startFight(1);
                else if (typeof abyss.send32071 === 'function') abyss.send32071(curAbyssId);

                sendLog(`🌌 [Vực U Minh] Đang khiêu chiến tầng #${curAbyssId} (Tự chọn đội hình + Bắt đầu + Thử lại)...`, "action");
                return true;
            } catch (e) { }
            return false;
        }

        let arenaRunState = {
            battlesCompleted: 0,
            pendingBattle: false,
            pendingSince: 0,
            resultRecorded: false,
            returnRequestedAt: 0,
            limitReachedLogged: false,
            noAttemptsLogged: false
        };

        function resetArenaRun() {
            arenaRunState.battlesCompleted = 0;
            arenaRunState.limitReachedLogged = false;
            arenaRunState.noAttemptsLogged = false;
        }

        function recordArenaBattleResult(succeeded) {
            if (!arenaRunState.pendingBattle || arenaRunState.resultRecorded) return;
            arenaRunState.resultRecorded = true;
            arenaRunState.battlesCompleted++;
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
                const battleLimit = Number.isInteger(configuredLimit) && configuredLimit >= 1 ? configuredLimit : 5;
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
                    setTimeout(() => {
                        if (typeof ac.send14201 === 'function') ac.send14201();
                    }, 1200);
                    return true;
                }
            } catch (e) {
                sendLog(`⚠️ [Đấu Tiên Đài] Lỗi khi xử lý khiêu chiến: ${e.message || e}`, "err");
            }
            return false;
        }

        // 5. TỰ ĐỘNG LEO TỨ LINH TRẬN
        const CAMP_TYPES = [8, 9, 10, 11];
        function handleClimbCamp(ctx) {
            if (!CONFIG.autoClimbCamp) return false;
            const now = Date.now();
            if (now - lastCampClimbTime < 3000) return false;

            const dd = ctx.DailyDungeonCtrl.gInst();
            if (!dd) return false;

            for (let i = 0; i < CAMP_TYPES.length; i++) {
                const idx = (lastCampClimbIndex + i) % CAMP_TYPES.length;
                const cType = CAMP_TYPES[idx];
                const nextId = getNextDungeonId(ctx, cType);

                if (nextId > 0 && (!failCounts[nextId] || failCounts[nextId] < 2)) {
                    lastCampClimbIndex = (idx + 1) % CAMP_TYPES.length;
                    lastCampClimbTime = now;

                    if (typeof dd.sRMFightData === 'function') dd.sRMFightData(nextId);
                    dd.send11001(nextId, 0);
                    if (typeof dd.inSingCampFight === 'function') dd.inSingCampFight();
                    sendLog(`🛡️ [Leo Tứ Linh Trận] Đang khiêu chiến ải mới #${nextId}...`, "action");
                    return true;
                }
            }
            return false;
        }

        // 6. QUÉT PHỤ BẢN ĐÃ VƯỢT
        function handleSweepDungeons(ctx, isManual = false) {
            try {
                const ddCtrl = ctx.DailyDungeonCtrl.gInst();
                if (!ddCtrl) return false;
                if (ctx.FightCtrl && ctx.FightCtrl.gInst && !ctx.FightCtrl.gInst().gCanFight()) return false;

                if (typeof ddCtrl.send11002 === 'function') {
                    ddCtrl.send11002(0);
                    ddCtrl.send11002(1);
                    hasSweptToday = true;
                    sendLog("⚡ [Quét Phụ Bản] Đã quét sạch các phụ bản đã vượt hôm nay!", "action");
                    return true;
                }
            } catch (e) { }
            return false;
        }

        // 7. Nhận thưởng Treo Máy & Mua/Quét Treo Máy Nhanh
        function handleHangup(ctx) {
            const now = Date.now();
            let acted = false;

            if (CONFIG.autoHangupReward && (now - lastHangupCheck > 40000)) {
                lastHangupCheck = now;
                try {
                    if (ctx.HangupCtrl && ctx.HangupCtrl.gInst) {
                        const hgCtrl = ctx.HangupCtrl.gInst();
                        if (hgCtrl.reqHangupBaseInfo) hgCtrl.reqHangupBaseInfo();
                        if (hgCtrl.reqGetHangupAwards) {
                            hgCtrl.reqGetHangupAwards();
                            sendLog("🎁 [Treo Máy] Đã tự động nhận thưởng tích lũy treo máy!", "action");
                            acted = true;
                        }
                    }
                } catch (e) { }
            }

            if (CONFIG.autoQuickHang && (now - lastQuickHangCheck > 25000)) {
                lastQuickHangCheck = now;
                try {
                    if (ctx.HangupCtrl && ctx.HangupCtrl.gInst) {
                        const hgCtrl = ctx.HangupCtrl.gInst();
                        const baseInfo = hgCtrl.m_stageBaseInfo;
                        if (baseInfo) {
                            const freeCount = baseInfo.left_free_count || 0;
                            const buyCount = baseInfo.left_buy_count || 0;
                            if (freeCount > 0 || buyCount > 0) {
                                if (ctx.NetMgr && ctx.NProtoNum && ctx.NProtoNum.S14105) {
                                    ctx.NetMgr.gInst().sendMsg(ctx.NProtoNum.S14105);
                                    sendLog(`⚡ [Treo Máy Nhanh] Đã quét nhanh treo máy (còn ${freeCount} miễn phí, ${buyCount} lượt mua)!`, "action");
                                    acted = true;
                                } else if (hgCtrl.reqGetWipeoutAwards) {
                                    hgCtrl.reqGetWipeoutAwards();
                                    sendLog(`⚡ [Treo Máy Nhanh] Đã kích hoạt quét treo máy nhanh!`, "action");
                                    acted = true;
                                }
                            }
                        } else if (hgCtrl.reqHangupBaseInfo) hgCtrl.reqHangupBaseInfo();
                    }
                } catch (e) { }
            }

            return acted;
        }

        // 8. Soi từng case Nhiệm Vụ Ngày, Tự Làm & Nhận Rương Năng Động
        function handleDailyTasks(ctx) {
            if (!CONFIG.autoDailyTask) return false;
            const now = Date.now();

            const acvCtrl = ctx.AcvCtrl && ctx.AcvCtrl.gInst ? ctx.AcvCtrl.gInst() : null;
            if (!acvCtrl) return false;

            if (now - lastTaskQueryTime > 20000 || !acvCtrl.taskDt) {
                lastTaskQueryTime = now;
                if (acvCtrl.send30501) acvCtrl.send30501();
                if (acvCtrl.send12501) acvCtrl.send12501();
                
                try {
                    if (ctx.WelfareCtrl && ctx.WelfareCtrl.gInst) {
                        const wf = ctx.WelfareCtrl.gInst();
                        if (wf.send30101) wf.send30101();
                        if (wf.send30102) wf.send30102(1);
                        if (wf.send30103) wf.send30103(0);
                    }
                    if (ctx.VipCtrl && ctx.VipCtrl.gInst) {
                        const vp = ctx.VipCtrl.gInst();
                        if (vp.send12401) vp.send12401();
                        if (vp.send12407) vp.send12407();
                        if (vp.send12408) vp.send12408();
                    }
                } catch (e) { }
            }

            let acted = false;
            const taskList = acvCtrl.taskDt;
            if (taskList && taskList.length > 0) {
                for (let i = 0; i < taskList.length; i++) {
                    const task = taskList[i];
                    if (task.status === 1) {
                        acvCtrl.send30503(task.task_id);
                        task.status = 2;
                        sendLog(`📜 [Nhiệm Vụ Ngày] Đã nhận thưởng hoàn thành Nhiệm vụ ID: ${task.task_id}!`, "action");
                        acted = true;
                        break;
                    }
                }

                if (acted) return true;

                if (now - lastTaskActionTime > 3000) {
                    for (let i = 0; i < taskList.length; i++) {
                        const task = taskList[i];
                        if (task.status === 0) {
                            const tid = task.task_id;
                            let didTask = false;

                            switch (tid) {
                                case 2:
                                    if (ctx.FriendCtrl && ctx.FriendCtrl.gInst) {
                                        const fc = ctx.FriendCtrl.gInst();
                                        if (fc.send11800Msg) fc.send11800Msg();
                                        if (fc.getAndSendLove) {
                                            fc.getAndSendLove();
                                            sendLog(`🤝 [Nhiệm Vụ Ngày - Case 2] Tặng & nhận thể lực bạn bè`, "action");
                                            didTask = true;
                                        }
                                    }
                                    break;
                                case 3:
                                    if (ctx.RecruitCtrl && ctx.RecruitCtrl.gInst) {
                                        const rc = ctx.RecruitCtrl.gInst();
                                        if (rc.reqRecruitInfo) rc.reqRecruitInfo();
                                        if (rc.isHasFreeRecruit && rc.isHasFreeRecruit()) {
                                            const type = (ctx.RecruitConst && ctx.RecruitConst.ERecruitType && ctx.RecruitConst.ERecruitType.famous) || 2;
                                            rc.freeRecruit(type);
                                            sendLog(`🎴 [Nhiệm Vụ Ngày - Case 3] Chiêu mộ miễn phí hôm nay`, "action");
                                            didTask = true;
                                        }
                                    }
                                    break;
                                case 4:
                                    if (ctx.ArenaCtrl && ctx.ArenaCtrl.gInst) {
                                        const ac = ctx.ArenaCtrl.gInst();
                                        if (ac.opAnUi) ac.opAnUi();
                                        if (ac.send14201) ac.send14201();
                                        if (ac.chnlgeEmy) {
                                            ac.skipArenaFight = true;
                                            ac.chnlgeEmy(0);
                                            sendLog(`⚔️ [Nhiệm Vụ Ngày - Case 4] Khiêu chiến Đấu Trường`, "action");
                                            didTask = true;
                                        }
                                    }
                                    break;
                                case 8:
                                    if (ctx.GuildCtrl && ctx.GuildCtrl.gInst) {
                                        const gc = ctx.GuildCtrl.gInst();
                                        if (gc.checkIsHaveGuild && gc.checkIsHaveGuild()) {
                                            if (gc.send18035Msg) gc.send18035Msg();
                                            if (gc.send18036Msg) {
                                                gc.send18036Msg(1);
                                                sendLog(`🏛️ [Nhiệm Vụ Ngày - Case 8] Bái kiến tế tự Bang Hội`, "action");
                                                didTask = true;
                                            }
                                        }
                                    }
                                    break;
                                case 10:
                                    if (ctx.TravelCtrl && ctx.TravelCtrl.gInst) {
                                        const tc = ctx.TravelCtrl.gInst();
                                        if (tc.send30201) tc.send30201();
                                        if (tc.send30204) tc.send30204();
                                        if (tc.send30205) tc.send30205();
                                        sendLog(`🗺️ [Nhiệm Vụ Ngày - Case 10] Du ngoạn phái tướng & nhận thưởng`, "action");
                                        didTask = true;
                                    }
                                    break;
                                case 12:
                                    if (ctx.GuildCtrl && ctx.GuildCtrl.gInst) {
                                        const gc = ctx.GuildCtrl.gInst();
                                        if (gc.checkIsHaveGuild && gc.checkIsHaveGuild()) {
                                            if (gc.send18040Msg) gc.send18040Msg();
                                            if (gc.send18044Msg) {
                                                gc.send18044Msg();
                                                sendLog(`👥 [Nhiệm Vụ Ngày - Case 12] Trợ giúp thành viên Bang Hội`, "action");
                                                didTask = true;
                                            }
                                        }
                                    }
                                    break;
                                case 16:
                                    if (ctx.DiceCtrl && ctx.DiceCtrl.gInst) {
                                        const dc = ctx.DiceCtrl.gInst();
                                        if (dc.clickDice) {
                                            dc.clickDice();
                                            sendLog(`🎲 [Nhiệm Vụ Ngày - Case 16] Lắc xúc xắc`, "action");
                                            didTask = true;
                                        }
                                    }
                                    break;
                            }

                            if (didTask) {
                                lastTaskActionTime = now;
                                acted = true;
                                break;
                            }
                        }
                    }
                }
            }

            if (acted) return true;

            const boxStates = acvCtrl.tskStateLs;
            if (boxStates && boxStates.length > 0) {
                for (let b = 0; b < boxStates.length; b++) {
                    if (boxStates[b] === 1) {
                        if (acvCtrl.send30504) {
                            acvCtrl.send30504(b);
                            boxStates[b] = 2;
                            const curAct = acvCtrl.curActive || 0;
                            const maxAct = acvCtrl.maxActive || 0;
                            sendLog(`🎁 [Rương Năng Động] Đã mở nhận Rương Năng Động #${b + 1} (${curAct}/${maxAct} điểm)!`, "action");
                            acted = true;
                            break;
                        }
                    }
                }
            }

            if (acted) return true;

            const acvList = acvCtrl.acvDt;
            if (acvList && acvList.length > 0) {
                for (let a = 0; a < acvList.length; a++) {
                    const acv = acvList[a];
                    if (acv.status === 1) {
                        if (acvCtrl.send12503) {
                            acvCtrl.send12503(acv.id);
                            acv.status = 2;
                            sendLog(`🏆 [Thành Tựu] Đã nhận thưởng Thành Tựu ID: ${acv.id}!`, "action");
                            acted = true;
                            break;
                        }
                    }
                }
            }

            return acted;
        }

        // VÒNG LẶP ĐIỀU PHỐI CHÍNH
        // ============================================================================
        // 1. TỰ ĐỘNG RÈN TIÊN KHÍ & NÂNG KHÍ ĐỈNH (ĐẠO THÀNH)
        // ============================================================================
        let lastForgeTime = 0;
        let hasSetFilter = false;

        function handleForge(ctx) {
            if (!ctx.GodWeaponCtrl || !ctx.GodWeaponCtrl.gInst) return false;
            const gCtrl = ctx.GodWeaponCtrl.gInst();
            const infoVo = gCtrl.getInfoVo ? gCtrl.getInfoVo() : null;
            const now = Date.now();
            if (now - lastForgeTime < 1500) return true;

            // Bước 1: Kiểm tra nâng cấp Khí Đỉnh nếu đã đủ Đá Sao Trời & Tiên Ngọc
            if (infoVo && infoVo.nextStarCfg) {
                const nextCfg = infoVo.nextStarCfg;
                let enoughMaterials = true;
                const consumeItems = nextCfg.consume_item || [];
                for (let i = 0; i < consumeItems.length; i++) {
                    const itm = consumeItems[i];
                    if (itm && ctx.CommonViewUtils && !ctx.CommonViewUtils.isEnoughCost(itm.base_id, itm.num)) {
                        enoughMaterials = false;
                        break;
                    }
                }
                const isUpgrading = infoVo.isHasRemainTime ? infoVo.isHasRemainTime() : false;
                if (enoughMaterials && !isUpgrading && consumeItems.length > 0) {
                    sendLog('✨ ĐÁ SAO TRỜI & NGUYÊN LIỆU ĐÃ ĐỦ NÂNG CẤP KHÍ ĐỈNH! TIẾN HÀNH TĂNG CẤP...', 'success');
                    gCtrl.send32305(); // Tăng cấp Khí Đỉnh
                    
                    // Dừng tool theo yêu cầu người dùng
                    CONFIG.running = false;
                    saveConfig();
                    try {
                        window.top.postMessage({
                            source: 'TIEN_NGHICH_AUTO_GAME',
                            action: 'LOG',
                            message: '🛑 ĐÃ NÂNG CẤP KHÍ ĐỈNH THÀNH CÔNG VÀ DỪNG AUTO!',
                            logType: 'success'
                        }, '*');
                    } catch(e) {}
                    return true;
                }
            }

            // Bước 2: Thiết lập bộ lọc lần đầu: Tích chọn "Đánh giá Tiên Khí tăng" và Lưu
            if (!hasSetFilter) {
                const setting = gCtrl.getSettingVo ? gCtrl.getSettingVo() : null;
                const curStar = setting ? (setting.star || 0) : 0;
                const affixGroups = setting ? (setting.affix_group_list || []) : [];
                sendLog('⚙️ Đang cấu hình bộ lọc Tiên Khí: Tích chọn [Đánh giá Tiên Khí tăng]...', 'info');
                gCtrl.send32303(curStar, 1, affixGroups); // 1 = is_up_score
                hasSetFilter = true;
                lastForgeTime = now;
                return true;
            }

            // Bước 3: Kiểm tra nếu có Tiên Khí mới trong túi đồ để thay mới (đánh giá cao) hoặc tách/bán (đánh giá thấp)
            if (ctx.BackpackCtrl && ctx.BackpackCtrl.gInst) {
                const bp = ctx.BackpackCtrl.gInst();
                const weaponDic = bp.getGodWeaponDic ? bp.getGodWeaponDic() : {};
                const weaponKeys = Object.keys(weaponDic);
                if (weaponKeys.length > 0) {
                    const newItemUid = weaponKeys[0];
                    const newItem = weaponDic[newItemUid];
                    if (newItem) {
                        const itemCfg = ctx.PropsCtrl && ctx.PropsCtrl.gInst ? ctx.PropsCtrl.gInst().getItemDataConfigByBaseId(newItem.base_id) : null;
                        const pos = itemCfg ? itemCfg.type : 0;
                        const oldWeapon = infoVo && infoVo.weapons ? infoVo.weapons[pos] : null;

                        const scoreType = (ctx.ComCt && ctx.ComCt.IEquipAttrType && ctx.ComCt.IEquipAttrType.godWeaponScore) ? ctx.ComCt.IEquipAttrType.godWeaponScore : 1000;
                        const newScore = bp.getExattrVByK ? (bp.getExattrVByK(newItem.exattr, scoreType) || 0) : 0;
                        const oldScore = (oldWeapon && bp.getExattrVByK) ? (bp.getExattrVByK(oldWeapon.getItemVo().exattr, scoreType) || 0) : 0;

                        if (newScore > oldScore) {
                            sendLog(`⚡ Phát hiện Tiên Khí xịn hơn (${newScore} > ${oldScore})! Thay mới & tách đồ cũ...`, 'success');
                            gCtrl.send32307(newItem.id, 1); // 1 = wear & resolve old
                        } else {
                            sendLog(`🗑️ Tiên Khí mới đánh giá thấp hơn (${newScore} <= ${oldScore}). Tự động tách/bán...`, 'info');
                            gCtrl.send32304(newItem.id); // resolve new item
                        }
                        lastForgeTime = now;
                        return true;
                    }
                }
            }

            // Bước 4: Tiến hành Rèn Tiên Khí
            sendLog('🔨 Đang rèn Tiên Khí...', 'info');
            gCtrl.send32301();
            lastForgeTime = now;
            return true;
        }

        // ============================================================================
        // 2. TỰ ĐỘNG ĐÁNH CỰC ÂM ĐỊA (LỊCH LUYỆN)
        // ============================================================================
        let lastExtremeYinCheck = 0;

        function handleExtremeYin(ctx) {
            if (!ctx.ExtremeYinCtrl || !ctx.ExtremeYinCtrl.gInst) return false;
            const eyCtrl = ctx.ExtremeYinCtrl.gInst();
            const now = Date.now();
            if (now - lastExtremeYinCheck < 3000) return true;

            // Nếu đang tu luyện: Kiểm tra đã xong giờ để nhận thưởng chưa
            if (eyCtrl.bHaveSeat && eyCtrl.bHaveSeat()) {
                const curLandId = eyCtrl.getLandId ? eyCtrl.getLandId() : 0;
                const pData = eyCtrl.getPlayerData ? eyCtrl.getPlayerData() : null;
                const model = eyCtrl.getCurlModel ? eyCtrl.getCurlModel() : null;
                const buildCfg = (model && model.getBuildCfgVo) ? model.getBuildCfgVo(curLandId) : null;
                if (pData && buildCfg && curLandId > 0) {
                    const timePassed = (ctx.NetMgr && ctx.NetMgr.gInst ? ctx.NetMgr.gInst().getTime() : Math.floor(now/1000)) - pData.start_time;
                    if (timePassed >= buildCfg.time) {
                        sendLog('🏆 Đã tu luyện xong Cực Âm Địa! Nhận thưởng...', 'success');
                        eyCtrl.send32204(curLandId);
                        lastExtremeYinCheck = now;
                        return true;
                    } else {
                        const remainSec = buildCfg.time - timePassed;
                        const m = Math.floor(remainSec / 60);
                        const s = remainSec % 60;
                        sendLog(`🧘 Đang tu luyện Cực Âm Địa (Còn ${m}p${s}s)...`, 'info');
                        lastExtremeYinCheck = now + 10000;
                        return true;
                    }
                }
                return false;
            }

            // Nếu chưa có chỗ: Tìm tầng cao nhất còn chỗ trống để đánh chiếm
            sendLog('🔍 Đang kiểm tra các tầng Cực Âm Địa còn chỗ trống...', 'info');
            eyCtrl.toRefreshMainInfo();

            const landCaps = [
                { id: 5, name: 'Thiên Âm Chi Địa', cap: 10 },
                { id: 4, name: 'Địa Âm Địa', cap: 25 },
                { id: 3, name: 'Huyền Âm Địa', cap: 50 },
                { id: 2, name: 'Thượng Giai - Hoàng Âm Địa', cap: 200 },
                { id: 1, name: 'Hoàng Âm Địa', cap: 999999 }
            ];

            let targetLandId = 0;
            for (let i = 0; i < landCaps.length; i++) {
                const land = landCaps[i];
                const curCount = eyCtrl.getLandInfo ? (eyCtrl.getLandInfo(land.id) || 0) : 0;
                if (curCount < land.cap) {
                    targetLandId = land.id;
                    sendLog(`🎯 Tìm thấy ${land.name} còn chỗ (${curCount}/${land.cap}). Tiến hành chiếm địa...`, 'success');
                    break;
                }
            }

            if (!targetLandId) targetLandId = 1; // Fallback Hoàng Âm Địa không giới hạn
            eyCtrl.chanllenge(targetLandId);
            lastExtremeYinCheck = now;
            return true;
        }

        // ============================================================================
        // 3. TỰ ĐỘNG ĐI ẢI CHÍNH TUYẾN (MA ĐẠO)
        // ============================================================================
        let lastMainStageAction = 0;

        function handleMainStage(ctx) {
            if (!ctx.HangupCtrl || !ctx.HangupCtrl.gInst) return false;
            const hg = ctx.HangupCtrl.gInst();
            const now = Date.now();
            if (now - lastMainStageAction < 1500) return true;

            // 1. Tự động nhận thưởng vượt ải nếu có
            if (hg.m_ungainStageIdGroup) {
                const uncollectedIds = Object.keys(hg.m_ungainStageIdGroup);
                if (uncollectedIds.length > 0) {
                    const rewardId = uncollectedIds[0];
                    sendLog(`🎁 Nhận thưởng vượt Ải Chính Tuyến (Ải ${rewardId})...`, 'success');
                    hg.reqGetStageAwards(Number(rewardId));
                    delete hg.m_ungainStageIdGroup[rewardId];
                    lastMainStageAction = now;
                    return true;
                }
            }

            // 2. Nếu đang mở bảng đội hình (EmbattleUi): Tự động xếp đội hình & Bắt đầu
            if (ctx.ViewMgr && ctx.ViewMgr.gInst) {
                const vm = ctx.ViewMgr.gInst();
                if (vm.viewIsVisible && vm.viewIsVisible(ctx.ViewConst.embattleUi)) {
                    sendLog('⚡ Tự động tối ưu đội hình...', 'info');
                    if (ctx.EmbattleCtrl && ctx.EmbattleCtrl.gInst) {
                        try { ctx.EmbattleCtrl.gInst().autoEmbattle(); } catch(e) {}
                    }
                    const embUi = vm.getViewByName(ctx.ViewConst.embattleUi);
                    if (embUi && embUi.challengeBtn && embUi.challengeBtn.visible) {
                        sendLog('⚔️ Vào trận Khiêu Chiến Ải...', 'info');
                        try { embUi.challengeBtn.dispatchEvent(new egret.TouchEvent(egret.TouchEvent.TOUCH_TAP, true, true)); } catch(e) {}
                    }
                    lastMainStageAction = now;
                    return true;
                }

                // 3. Đóng bảng thắng / thua để qua ải kế tiếp
                if (vm.viewIsVisible && vm.viewIsVisible(ctx.ViewConst.fightSuccessUi)) {
                    sendLog('🎉 Vượt ải THÀNH CÔNG! Chuyển ải tiếp theo...', 'success');
                    const v = vm.getViewByName(ctx.ViewConst.fightSuccessUi);
                    if (v && v.onHide) v.onHide();
                    else vm.closeView(ctx.ViewConst.fightSuccessUi);
                    lastMainStageAction = now;
                    return true;
                }
                if (vm.viewIsVisible && vm.viewIsVisible(ctx.ViewConst.fightFailUi)) {
                    sendLog('⚠️ Khiêu chiến ải thất bại. Tạm dừng để củng cố lực chiến.', 'warning');
                    const v = vm.getViewByName(ctx.ViewConst.fightFailUi);
                    if (v && v.onHide) v.onHide();
                    else vm.closeView(ctx.ViewConst.fightFailUi);
                    lastMainStageAction = now + 6000;
                    return true;
                }
            }

            // 4. Nếu cần kích hoạt chương mới
            if (hg.m_needActiveChapterId && hg.m_needActiveChapterId > 0) {
                sendLog(`🔓 Kích hoạt Chương Mới (${hg.m_needActiveChapterId})...`, 'success');
                hg.reqActiveChapter(hg.m_needActiveChapterId);
                hg.m_needActiveChapterId = 0;
                lastMainStageAction = now;
                return true;
            }

            // 5. Bắt đầu Khiêu Chiến ải chính tuyến
            const curStage = hg.m_curStageId || 1;
            sendLog(`🚀 Khiêu chiến Ải Chính Tuyến ${curStage}...`, 'info');
            if (typeof hg.reqChanllgeStage === 'function') {
                hg.reqChanllgeStage();
            } else if (typeof hg.comfirmChallenge === 'function') {
                hg.comfirmChallenge();
            }
            lastMainStageAction = now;
            return true;
        }

        // ============================================================================
        // 4. TỰ ĐỘNG QUÀ TIÊN DUYÊN TRONG SỰ KIỆN RÚT X1000 (MA ĐẠO)
        // ============================================================================
        let lastXianYuanAction = 0;

        function handleXianYuan(ctx) {
            if (!ctx.XianYuanCtrl || !ctx.XianYuanCtrl.gInst) return false;
            const xy = ctx.XianYuanCtrl.gInst();
            const now = Date.now();
            if (now - lastXianYuanAction < 2000) return true;

            // 1. Nhận rương thưởng Quà Tiên Duyên khi đủ điểm
            if (xy.checkXianYuanHaoLiBoxRed && xy.checkXianYuanHaoLiBoxRed()) {
                sendLog('🎁 Điểm Tiên Duyên đã đạt mốc! Nhận rương thưởng lớn...', 'success');
                xy.send32122();
                lastXianYuanAction = now;
                return true;
            }

            // 2. Nhận thưởng các nhiệm vụ Tiên Duyên đã hoàn thành
            if (xy.taskDic) {
                for (const tid in xy.taskDic) {
                    const task = xy.taskDic[tid];
                    const canGetStatus = (ctx.XianYuanConst && ctx.XianYuanConst.TaskStatus && ctx.XianYuanConst.TaskStatus.canGet !== undefined) 
                        ? ctx.XianYuanConst.TaskStatus.canGet : 1;
                    if (task && (task.status === canGetStatus || task.status === 1)) {
                        sendLog(`✨ Nhiệm vụ Tiên Duyên [${task.id || tid}] hoàn thành! Nhận quà...`, 'success');
                        xy.send32121(task.id || tid);
                        task.status = 2;
                        lastXianYuanAction = now;
                        return true;
                    }
                }
            }

            // 3. Định kỳ refresh dữ liệu nhiệm vụ Tiên Duyên
            xy.send32120();
            lastXianYuanAction = now + 4000;
            return true;
        }

        
        // =========================================================================
        // HỆ THỐNG 8 MODULE TỰ ĐỘNG HÓA ƯU TIÊN (VISION & CONTROLLER HYBRID)
        // =========================================================================

        // [Module 1] Thông Thiên Tháp & Tứ Linh Tháp
        function handleTowerAndTuLinh(ctx) {
            const now = Date.now();
            try {
                if (ctx.DailyDungeonCtrl && ctx.DailyDungeonCtrl.gInst) {
                    const dd = ctx.DailyDungeonCtrl.gInst();
                    // 1. Quét thông thiên tháp
                    if (typeof dd.sweepTower === 'function') {
                        dd.sweepTower();
                        sendLog("🗼 [M1 - Thông Thiên Tháp] Đang quét sạch tầng Thông Thiên Tháp...", "action");
                    }
                    // 2. Mua thêm lượt quét nếu cấu hình bật
                    if (CONFIG.buyTowerSweep && typeof dd.buyTowerSweepCount === 'function') {
                        dd.buyTowerSweepCount();
                    }
                }
                // 3. Tứ Linh Tháp: Cử trợ trận & khiêu chiến 4 tháp
                if (ctx.CampCtrl && ctx.CampCtrl.gInst) {
                    const camp = ctx.CampCtrl.gInst();
                    if (typeof camp.sendHelpHero === 'function') {
                        camp.sendHelpHero(0); // Cử tướng đầu tiên
                    }
                    if (typeof camp.challengeCampTower === 'function') {
                        camp.challengeCampTower();
                        sendLog("🛡️ [M1 - Tứ Linh Tháp] Đang leo tháp Tứ Linh (Skip tự động)...", "action");
                    }
                }
                return handleTongTianTower(ctx) || handleClimbCamp(ctx);
            } catch(e) { return false; }
        }

        // [Module 2] Phụ Bản Ngày & Bí Cảnh Tứ Quốc
        function handleDailyAndBiCanh(ctx) {
            try {
                if (ctx.DailyDungeonCtrl && ctx.DailyDungeonCtrl.gInst) {
                    const dd = ctx.DailyDungeonCtrl.gInst();
                    // Quét nhanh phụ bản ngày
                    if (typeof dd.oneKeySweepDaily === 'function') {
                        dd.oneKeySweepDaily();
                        sendLog("⚔️ [M2 - PB Ngày] Quét nhanh toàn bộ phụ bản ngày thành công!", "action");
                    }
                    // Mua thêm 250 Tiên Ngọc nếu bật
                    if (CONFIG.buyDailyDungeon && typeof dd.buyDailyCount === 'function') {
                        dd.buyDailyCount(250);
                    }
                    // Quét Bí Cảnh Tứ Quốc tầng Đủ Vượt 10 lần
                    if (typeof dd.sweepBiCanhMaxPass === 'function') {
                        dd.sweepBiCanhMaxPass(10);
                        sendLog("🗺️ [M2 - Bí Cảnh Tứ Quốc] Đã quét 10 lần tầng Đủ Vượt!", "action");
                    }
                }
                return handleClimbDailyDungeons(ctx) || handleSweepDungeons(ctx);
            } catch(e) { return false; }
        }

        // [Module 3] Thủ Vệ Tứ Phái
        function handleSectDefense(ctx) {
            try {
                if (ctx.SectDefenseCtrl && ctx.SectDefenseCtrl.gInst) {
                    const sd = ctx.SectDefenseCtrl.gInst();
                    if (typeof sd.selectSupportHero === 'function') sd.selectSupportHero(0);
                    if (typeof sd.selectFriendHelp === 'function') sd.selectFriendHelp(0);
                    if (typeof sd.startDefense === 'function') sd.startDefense();
                    // Chọn Buff cột giữa (index 1 / x=225, y=490)
                    if (typeof sd.chooseBuff === 'function') sd.chooseBuff(1);
                    // Nhận Chiến Lệnh
                    if (typeof sd.claimBattlePass === 'function') sd.claimBattlePass();
                    sendLog("🛡️ [M3 - Thủ Vệ Tứ Phái] Tự động chọn trợ trận, chọn Buff cột giữa & nhận Chiến Lệnh!", "action");
                    return true;
                }
                return false;
            } catch(e) { return false; }
        }

        // [Module 4] Cửu Uyển Nhi, Cổ Thần Địa, Cực Âm Địa
        function handleOtherTrials(ctx) {
            try {
                // 1. Chiến Lệnh Uyển Nhi
                if (ctx.UyenNhiCtrl && ctx.UyenNhiCtrl.gInst) {
                    const un = ctx.UyenNhiCtrl.gInst();
                    if (typeof un.claimRewards === 'function') un.claimRewards();
                }
                // 2. Cổ Thần Địa: Lên trận nhanh & khiêu chiến map
                if (ctx.CoThanCtrl && ctx.CoThanCtrl.gInst) {
                    const ct = ctx.CoThanCtrl.gInst();
                    if (typeof ct.quickEmbattle === 'function') ct.quickEmbattle();
                    if (typeof ct.challengeMap === 'function') {
                        ct.challengeMap();
                        sendLog("⚔️ [M4 - Cổ Thần Địa] Đã tự lên trận nhanh và khiêu chiến ải!", "action");
                    }
                }
                // 3. Cực Âm Địa
                return handleExtremeYin(ctx);
            } catch(e) { return false; }
        }

        // [Module 5] Di Tích Tiên Giới
        function handleImmortalRelic(ctx) {
            try {
                if (ctx.RelicCtrl && ctx.RelicCtrl.gInst) {
                    const rc = ctx.RelicCtrl.gInst();
                    // Kiểm tra nếu có Lv4 -> Không làm mới, phái đội khai thác Lv4
                    if (typeof rc.hasLevel4Relic === 'function' && rc.hasLevel4Relic()) {
                        if (typeof rc.dispatchMineLv4 === 'function') {
                            rc.dispatchMineLv4();
                            sendLog("💎 [M5 - Di Tích] Phát hiện bệ tài nguyên Lv4! Đã phái đội khai thác an toàn.", "action");
                            return true;
                        }
                    } else {
                        // Làm mới các bệ Lv1, Lv2, Lv3
                        if (typeof rc.refreshLowerRelics === 'function') {
                            rc.refreshLowerRelics();
                            sendLog("🔄 [M5 - Di Tích] Đã làm mới các bệ tài nguyên Lv1-Lv3 để tìm Lv4.", "info");
                            return true;
                        }
                    }
                }
                return false;
            } catch(e) { return false; }
        }

        // [Module 6] Minigame Ảo Cảnh Pháp Trận (Lưới 4x4)
        function handleMinigameMemory(ctx) {
            try {
                if (ctx.MemoryGameCtrl && ctx.MemoryGameCtrl.gInst) {
                    const mg = ctx.MemoryGameCtrl.gInst();
                    if (typeof mg.solveMemoryBoard === 'function') {
                        mg.solveMemoryBoard();
                        sendLog("🧩 [M6 - Ảo Cảnh] Đã tự động giải hoàn hảo 8 cặp thẻ bài 4x4!", "action");
                    }
                    if (typeof mg.claimChests === 'function') mg.claimChests(); // 100, 200, 300
                    if (typeof mg.claimTasks === 'function') mg.claimTasks();
                    if (typeof mg.likeRankings === 'function') mg.likeRankings(); // Like 2 tab BXH
                    return true;
                }
                return false;
            } catch(e) { return false; }
        }

        // [Module 7] Kiếm Hành & Điêu Long Khắc Tinh QTE
        function handleMinigameDragon(ctx) {
            try {
                // 1. Kiếm Hành
                if (ctx.KiemHanhCtrl && ctx.KiemHanhCtrl.gInst) {
                    const kh = ctx.KiemHanhCtrl.gInst();
                    if (typeof kh.rollDice === 'function') {
                        kh.rollDice();
                        sendLog("🎲 [M7 - Kiếm Hành] Gieo xúc xắc bước đi tự động...", "action");
                    }
                }
                // 2. Điêu Long Khắc Tinh QTE Hoàn Mỹ 380ms
                if (ctx.DragonCarveCtrl && ctx.DragonCarveCtrl.gInst) {
                    const dc = ctx.DragonCarveCtrl.gInst();
                    if (typeof dc.triggerPerfectHit === 'function') {
                        dc.triggerPerfectHit(380);
                        sendLog("🐉 [M7 - Điêu Long] Đã bấm QTE chuẩn 380ms đạt mức HOÀN MỸ!", "action");
                    }
                    if (typeof dc.claimChests === 'function') dc.claimChests();
                    if (typeof dc.claimBattlePass === 'function') dc.claimBattlePass();
                    return true;
                }
                return false;
            } catch(e) { return false; }
        }

        // [Module 8] Hoạt Động Ngày, Tiên Minh & Nhận Cuối Ngày
        const TAM_TIEN_GIFT_CATEGORIES = [
            { typeKey: 'type_1', label: 'Quà Pháp Bảo' },
            { typeKey: 'type_2', label: 'Quà Linh Thú' },
            { typeKey: 'type_3', label: 'Quà Pháp Trận' }
        ];
        const TAM_TIEN_REQUEST_TIMEOUT_MS = 20000;
        const TIEN_HUU_REQUEST_TIMEOUT_MS = 20000;
        let tamTienDaiState = null;
        let tienHuuState = null;
        let lastDailyRoutineError = '';

        function isTamTienGiftSupported(gift) {
            if (!gift) return false;
            const cashPrice = Number(gift.price);
            const tienNgocCost = Number(gift.gold);
            return Number.isFinite(cashPrice) && cashPrice === 0 &&
                Number.isFinite(tienNgocCost) && tienNgocCost >= 0;
        }

        function removeTamTienDaiListener(state) {
            if (state && state.model && state.eventHandler &&
                typeof state.model.removeEventListener === 'function') {
                state.model.removeEventListener(state.updateEvent, state.eventHandler);
            }
        }

        function createTamTienDaiState(welfareController, model, updateEvent) {
            const state = {
                dayKey: new Date().toDateString(),
                welfareController,
                model,
                updateEvent,
                phase: 'gifts',
                giftCategoryIndex: 0,
                giftRows: null,
                giftRowIndex: 0,
                waitingGiftList: null,
                pendingGiftClaim: null,
                recruitInfoRequestedAt: 0,
                recruitIndex: 0,
                pendingRecruit: null,
                recruitBusySince: 0,
                eventHandler: null
            };

            state.eventHandler = (event) => {
                const eventData = event && typeof event.getDataArray === 'function'
                    ? event.getDataArray()
                    : [];

                if (state.waitingGiftList && eventData[0] === state.waitingGiftList.type) {
                    state.waitingGiftList.ready = true;
                }

                if (state.pendingGiftClaim) {
                    const purchase = state.welfareController.getLimitGiftBuyNetVo(
                        state.pendingGiftClaim.gift.gift_id
                    );
                    const buyTimes = purchase ? Number(purchase.buy_times) || 0 : 0;
                    if (buyTimes > state.pendingGiftClaim.previousBuyTimes) {
                        state.pendingGiftClaim.confirmed = true;
                    }
                }
            };

            model.addEventListener(updateEvent, state.eventHandler);
            return state;
        }

        function handleTamTienDai(ctx) {
            const welfareController = ctx.WelfareCtrl && ctx.WelfareCtrl.gInst
                ? ctx.WelfareCtrl.gInst()
                : null;
            if (!welfareController || typeof welfareController.getCurlModel !== 'function') {
                sendLog("⚠️ [M8 - Tâm Tiên Đài] Không tìm thấy bộ điều khiển quà miễn phí.", "err");
                return true;
            }

            const model = welfareController.getCurlModel();
            const welfareConst = ctx.WelfareConst;
            const updateEvent = welfareConst && welfareConst.EVT_LIMIT_GIFT_UPDATE;
            if (!model || !updateEvent || !welfareConst.LimitGiftType ||
                typeof model.addEventListener !== 'function' ||
                typeof welfareController.send30120 !== 'function' ||
                typeof welfareController.send30121 !== 'function' ||
                typeof welfareController.getLimitGiftBuyNetVo !== 'function') {
                sendLog("⚠️ [M8 - Tâm Tiên Đài] API nhận quà miễn phí chưa sẵn sàng.", "err");
                return true;
            }

            const dayKey = new Date().toDateString();
            if (!tamTienDaiState || tamTienDaiState.model !== model ||
                tamTienDaiState.dayKey !== dayKey) {
                removeTamTienDaiListener(tamTienDaiState);
                try {
                    tamTienDaiState = createTamTienDaiState(
                        welfareController,
                        model,
                        updateEvent
                    );
                } catch (error) {
                    sendLog(`⚠️ [M8 - Tâm Tiên Đài] Không thể theo dõi trạng thái quà: ${error.message || error}`, "err");
                    return true;
                }
            }

            const state = tamTienDaiState;
            const now = Date.now();

            if (state.phase === 'gifts') {
                if (state.pendingGiftClaim) {
                    const pending = state.pendingGiftClaim;
                    const category = TAM_TIEN_GIFT_CATEGORIES[state.giftCategoryIndex];
                    if (pending.confirmed) {
                        if (Number(pending.gift.gold) > 0) {
                            sendLog(`✅ [M8 - Tâm Tiên Đài - ${category.label}] Đã mua quà #${pending.gift.gift_id} bằng ${Number(pending.gift.gold)} Tiên Ngọc.`, "action");
                        } else {
                            sendLog(`✅ [M8 - Tâm Tiên Đài - ${category.label}] Đã nhận quà miễn phí #${pending.gift.gift_id}.`, "action");
                        }
                        state.pendingGiftClaim = null;
                        state.giftRowIndex++;
                    } else if (now - pending.startedAt >= TAM_TIEN_REQUEST_TIMEOUT_MS) {
                        const action = Number(pending.gift.gold) > 0 ? 'mua quà Tiên Ngọc' : 'nhận quà miễn phí';
                        sendLog(`⚠️ [M8 - Tâm Tiên Đài - ${category.label}] Chưa xác nhận được việc ${action} #${pending.gift.gift_id} từ máy chủ.`, "err");
                        state.pendingGiftClaim = null;
                        state.giftRowIndex++;
                    }
                    return true;
                }

                if (state.waitingGiftList) {
                    const waiting = state.waitingGiftList;
                    if (!waiting.ready && now - waiting.startedAt < TAM_TIEN_REQUEST_TIMEOUT_MS) {
                        return true;
                    }
                    state.waitingGiftList = null;
                    if (!waiting.ready) {
                        const category = TAM_TIEN_GIFT_CATEGORIES[state.giftCategoryIndex];
                        sendLog(`⚠️ [M8 - Tâm Tiên Đài - ${category.label}] Không nhận được trạng thái quà từ máy chủ.`, "err");
                        state.giftCategoryIndex++;
                        return true;
                    }

                    const category = TAM_TIEN_GIFT_CATEGORIES[state.giftCategoryIndex];
                    const giftType = welfareConst.LimitGiftType[category.typeKey];
                    const giftList = model.getLimitGiftByType(giftType) || [];
                    state.giftRows = giftList.filter((gift) =>
                        isTamTienGiftSupported(gift) && Number(gift.purchase_times) > 0
                    );
                    state.giftRowIndex = 0;

                    if (state.giftRows.length === 0) {
                        sendLog(`ℹ️ [M8 - Tâm Tiên Đài - ${category.label}] Không có quà miễn phí để nhận.`, "info");
                        state.giftCategoryIndex++;
                        state.giftRows = null;
                    }
                    return true;
                }

                if (state.giftCategoryIndex >= TAM_TIEN_GIFT_CATEGORIES.length) {
                    state.phase = 'recruit';
                    return true;
                }

                const category = TAM_TIEN_GIFT_CATEGORIES[state.giftCategoryIndex];
                if (!state.giftRows) {
                    const giftType = welfareConst.LimitGiftType[category.typeKey];
                    if (!Number.isInteger(giftType)) {
                        sendLog(`⚠️ [M8 - Tâm Tiên Đài - ${category.label}] Không xác định được loại quà.`, "err");
                        state.giftCategoryIndex++;
                        return true;
                    }

                    state.waitingGiftList = { type: giftType, startedAt: now, ready: false };
                    try {
                        welfareController.send30120(giftType);
                    } catch (error) {
                        state.waitingGiftList = null;
                        sendLog(`⚠️ [M8 - Tâm Tiên Đài - ${category.label}] Không thể kiểm tra quà: ${error.message || error}`, "err");
                        state.giftCategoryIndex++;
                    }
                    return true;
                }

                if (state.giftRowIndex >= state.giftRows.length) {
                    state.giftCategoryIndex++;
                    state.giftRows = null;
                    state.giftRowIndex = 0;
                    return true;
                }

                const gift = state.giftRows[state.giftRowIndex];
                const tienNgocCost = Number(gift.gold);
                if (tienNgocCost > 0 && !CONFIG.buyTamTienGifts) {
                    sendLog(`ℹ️ [M8 - Tâm Tiên Đài - ${category.label}] Bỏ qua quà Tiên Ngọc #${gift.gift_id} vì tùy chọn mua đang tắt.`, "info");
                    state.giftRowIndex++;
                    return true;
                }

                const purchase = welfareController.getLimitGiftBuyNetVo(gift.gift_id);
                const buyTimes = purchase ? Number(purchase.buy_times) || 0 : 0;
                const purchaseLimit = Number(gift.purchase_times) || 0;
                if (buyTimes >= purchaseLimit) {
                    const giftDescription = tienNgocCost > 0
                        ? `Quà Tiên Ngọc #${gift.gift_id}`
                        : `Quà miễn phí #${gift.gift_id}`;
                    sendLog(`ℹ️ [M8 - Tâm Tiên Đài - ${category.label}] ${giftDescription} đã mua đủ hôm nay.`, "info");
                    state.giftRowIndex++;
                    return true;
                }

                state.pendingGiftClaim = {
                    gift,
                    previousBuyTimes: buyTimes,
                    startedAt: now,
                    confirmed: false
                };
                try {
                    welfareController.send30121(gift.gift_id);
                } catch (error) {
                    state.pendingGiftClaim = null;
                    const action = tienNgocCost > 0 ? 'mua quà Tiên Ngọc' : 'nhận quà miễn phí';
                    sendLog(`⚠️ [M8 - Tâm Tiên Đài - ${category.label}] Không thể ${action} #${gift.gift_id}: ${error.message || error}`, "err");
                    state.giftRowIndex++;
                }
                return true;
            }

            if (state.phase === 'recruit') {
                const recruitController = ctx.RecruitCtrl && ctx.RecruitCtrl.gInst
                    ? ctx.RecruitCtrl.gInst()
                    : null;
                const recruitConst = ctx.RecruitConst;
                if (!recruitController || !recruitConst || typeof recruitController.freeRecruit !== 'function') {
                    sendLog("⚠️ [M8 - Tâm Tiên Đài - Chiêu Mộ] Không tìm thấy bộ điều khiển chiêu mộ miễn phí.", "err");
                    state.phase = 'done';
                    return true;
                }

                if (!recruitController.m_recruitBaseInfo) {
                    if (!state.recruitInfoRequestedAt) {
                        state.recruitInfoRequestedAt = now;
                        try {
                            recruitController.reqRecruitInfo();
                        } catch (error) {
                            sendLog(`⚠️ [M8 - Tâm Tiên Đài - Chiêu Mộ] Không thể kiểm tra lượt miễn phí: ${error.message || error}`, "err");
                            state.phase = 'done';
                        }
                    } else if (now - state.recruitInfoRequestedAt >= TAM_TIEN_REQUEST_TIMEOUT_MS) {
                        sendLog("⚠️ [M8 - Tâm Tiên Đài - Chiêu Mộ] Không nhận được trạng thái lượt miễn phí từ máy chủ.", "err");
                        state.phase = 'done';
                    }
                    return true;
                }

                const recruitTypes = [
                    { type: recruitConst.ERecruitType.war, key: 'free_war', label: 'Chiêu Mộ Thường' },
                    { type: recruitConst.ERecruitType.famous, key: 'free_famous', label: 'Chiêu Mộ Cao' }
                ];

                if (state.pendingRecruit) {
                    const pending = state.pendingRecruit;
                    const remaining = Number(recruitController.m_recruitBaseInfo[pending.key]) || 0;
                    if (remaining < pending.previousCount) {
                        sendLog(`✅ [M8 - Tâm Tiên Đài - Chiêu Mộ] Đã nhận lượt miễn phí: ${pending.label}.`, "action");
                        state.pendingRecruit = null;
                        state.recruitIndex++;
                    } else if (!recruitController.m_isRecruiting &&
                        now - pending.startedAt >= TAM_TIEN_REQUEST_TIMEOUT_MS) {
                        sendLog(`⚠️ [M8 - Tâm Tiên Đài - Chiêu Mộ] Máy chủ chưa xác nhận lượt miễn phí: ${pending.label}.`, "err");
                        state.pendingRecruit = null;
                        state.recruitIndex++;
                    }
                    return true;
                }

                if (recruitController.m_isRecruiting) {
                    if (!state.recruitBusySince) state.recruitBusySince = now;
                    if (now - state.recruitBusySince >= TAM_TIEN_REQUEST_TIMEOUT_MS) {
                        sendLog("⚠️ [M8 - Tâm Tiên Đài - Chiêu Mộ] Đang chờ một lượt chiêu mộ khác hoàn tất.", "err");
                        state.phase = 'done';
                    }
                    return true;
                }
                state.recruitBusySince = 0;

                if (state.recruitIndex >= recruitTypes.length) {
                    state.phase = 'done';
                    sendLog("✨ [M8 - Tâm Tiên Đài] Đã kiểm tra xong quà miễn phí, quà Tiên Ngọc theo tùy chọn và Chiêu Mộ.", "action");
                    return true;
                }

                const recruitType = recruitTypes[state.recruitIndex];
                const available = Number(recruitController.m_recruitBaseInfo[recruitType.key]) || 0;
                if (available <= 0) {
                    sendLog(`ℹ️ [M8 - Tâm Tiên Đài - Chiêu Mộ] ${recruitType.label}: hiện không có lượt miễn phí (đã dùng hoặc đang hồi).`, "info");
                    state.recruitIndex++;
                    return true;
                }

                state.pendingRecruit = {
                    type: recruitType.type,
                    key: recruitType.key,
                    label: recruitType.label,
                    previousCount: available,
                    startedAt: now
                };
                try {
                    recruitController.freeRecruit(recruitType.type);
                } catch (error) {
                    state.pendingRecruit = null;
                    sendLog(`⚠️ [M8 - Tâm Tiên Đài - Chiêu Mộ] Không thể nhận lượt miễn phí ${recruitType.label}: ${error.message || error}`, "err");
                    state.recruitIndex++;
                }
                return true;
            }

            return true;
        }

        function handleTienHuu(ctx) {
            const friendCtrl = ctx.FriendCtrl && ctx.FriendCtrl.gInst
                ? ctx.FriendCtrl.gInst()
                : null;
            const dayKey = new Date().toDateString();
            if (!tienHuuState || tienHuuState.friendCtrl !== friendCtrl ||
                tienHuuState.dayKey !== dayKey) {
                tienHuuState = {
                    friendCtrl,
                    dayKey,
                    phase: 'ready',
                    startedAt: 0,
                    giveCount: 0,
                    acceptCount: 0,
                    pendingGifts: [],
                    pendingAccepts: []
                };
            }

            const state = tienHuuState;
            const now = Date.now();
            if (state.phase === 'done' || state.phase === 'error') return true;

            if (!friendCtrl) {
                sendLog("⚠️ [M8 - Tiên Hữu] Không tìm thấy bộ điều khiển bạn bè.", "err");
                state.phase = 'error';
                return true;
            }

            if (!friendCtrl.m_friend_data) {
                if (state.phase === 'loading') {
                    if (now - state.startedAt >= TIEN_HUU_REQUEST_TIMEOUT_MS) {
                        sendLog("⚠️ [M8 - Tiên Hữu] Hết thời gian chờ danh sách bạn bè từ máy chủ.", "err");
                        state.phase = 'error';
                    }
                    return true;
                }
                if (typeof friendCtrl.send11801Msg !== 'function') {
                    sendLog("⚠️ [M8 - Tiên Hữu] API tải danh sách bạn bè chưa sẵn sàng.", "err");
                    state.phase = 'error';
                    return true;
                }
                try {
                    friendCtrl.send11801Msg();
                    state.phase = 'loading';
                    state.startedAt = now;
                    sendLog("ℹ️ [M8 - Tiên Hữu] Đang tải danh sách bạn bè để kiểm tra Tặng nhanh.", "info");
                } catch (error) {
                    sendLog(`⚠️ [M8 - Tiên Hữu] Không thể tải danh sách bạn bè: ${error.message || error}`, "err");
                    state.phase = 'error';
                }
                return true;
            }

            if (state.phase === 'loading') state.phase = 'ready';

            if (state.phase === 'sending') {
                const sentCount = state.pendingGifts.filter((friend) =>
                    Number(friend.energy_give_status) === 1
                ).length;
                const acceptedCount = state.pendingAccepts.filter((friend) =>
                    Number(friend.energy_accept_status) === 1
                ).length;
                const giveCount = Number(friendCtrl.m_energy_give_count);
                const acceptCount = Number(friendCtrl.m_energy_accept_count);
                const confirmedGifts = Math.max(
                    sentCount,
                    Number.isFinite(giveCount) ? giveCount - state.giveCount : 0
                );
                const confirmedAccepts = Math.max(
                    acceptedCount,
                    Number.isFinite(acceptCount) ? acceptCount - state.acceptCount : 0
                );

                if (confirmedGifts > 0 || confirmedAccepts > 0) {
                    const results = [];
                    if (confirmedGifts > 0) results.push(`đã tặng ${confirmedGifts} bạn bè`);
                    if (confirmedAccepts > 0) results.push(`đã nhận thể lực từ ${confirmedAccepts} bạn bè`);
                    sendLog(`✅ [M8 - Tiên Hữu] Máy chủ xác nhận Tặng nhanh: ${results.join(', ')}.`, "success");
                    state.phase = 'done';
                } else if (now - state.startedAt >= TIEN_HUU_REQUEST_TIMEOUT_MS) {
                    sendLog("⚠️ [M8 - Tiên Hữu] Máy chủ chưa xác nhận thao tác Tặng nhanh.", "err");
                    state.phase = 'error';
                }
                return true;
            }

            if (typeof friendCtrl.getFriendListByType !== 'function' ||
                typeof friendCtrl.getAndSendLove !== 'function' ||
                !ctx.FriendConst || !ctx.FriendConst.friendRelationType) {
                sendLog("⚠️ [M8 - Tiên Hữu] API Tặng nhanh chưa sẵn sàng.", "err");
                state.phase = 'error';
                return true;
            }

            let friends;
            try {
                friends = friendCtrl.getFriendListByType(ctx.FriendConst.friendRelationType.friend);
            } catch (error) {
                sendLog(`⚠️ [M8 - Tiên Hữu] Không thể đọc danh sách bạn bè: ${error.message || error}`, "err");
                state.phase = 'error';
                return true;
            }
            if (!Array.isArray(friends)) {
                sendLog("⚠️ [M8 - Tiên Hữu] Danh sách bạn bè không hợp lệ.", "err");
                state.phase = 'error';
                return true;
            }

            const pendingGifts = friends.filter((friend) =>
                friend && Number(friend.energy_give_status) === 0
            );
            const maxDailyAccepts = Number(ctx.FriendConst.GET_VIGOR_MAX_NUM);
            const acceptCount = Number(friendCtrl.m_energy_accept_count);
            const pendingAccepts = Number.isFinite(maxDailyAccepts) &&
                Number.isFinite(acceptCount) && acceptCount < maxDailyAccepts
                ? friends.filter((friend) => friend && Number(friend.energy_accept_status) === 2)
                : [];

            if (pendingGifts.length === 0 && pendingAccepts.length === 0) {
                sendLog("ℹ️ [M8 - Tiên Hữu] Đã Tặng nhanh hoặc không có bạn bè cần gửi/nhận thể lực.", "info");
                state.phase = 'done';
                return true;
            }

            state.phase = 'sending';
            state.startedAt = now;
            state.giveCount = Number(friendCtrl.m_energy_give_count) || 0;
            state.acceptCount = acceptCount || 0;
            state.pendingGifts = pendingGifts;
            state.pendingAccepts = pendingAccepts;
            try {
                friendCtrl.getAndSendLove();
            } catch (error) {
                sendLog(`⚠️ [M8 - Tiên Hữu] Không thể thực hiện Tặng nhanh: ${error.message || error}`, "err");
                state.phase = 'error';
            }
            return true;
        }

        function handleDailyRoutine(ctx) {
            try {
                // 1. Trợ chiến linh thú
                if (CONFIG.activeFeature === 'autoTroChien' && ctx.LinhThuCtrl && ctx.LinhThuCtrl.gInst) {
                    const lt = ctx.LinhThuCtrl.gInst();
                    if (typeof lt.claimAllRefund === 'function') {
                        lt.claimAllRefund();
                        sendLog("🐾 [M8 - Trợ Chiến] Đã nhận nhanh toàn bộ Linh Thú tab Hoàn!", "action");
                    }
                }
                // 2. Tâm Tiên Đài
                if (CONFIG.activeFeature === 'autoTamTienDai') {
                    return handleTamTienDai(ctx);
                }
                // 3. Tiên Hữu (Bạn bè)
                if (CONFIG.activeFeature === 'autoTienHuu') {
                    return handleTienHuu(ctx);
                }
                // 4. Tiên Minh (Bang Hội)
                if (CONFIG.activeFeature === 'autoTienMinh' && ctx.GuildCtrl && ctx.GuildCtrl.gInst) {
                    const gc = ctx.GuildCtrl.gInst();
                    if (typeof gc.bargainShop === 'function') gc.bargainShop();
                    if (typeof gc.worshipMaster === 'function') gc.worshipMaster();
                    if (typeof gc.requestHeroHelp === 'function') gc.requestHeroHelp();
                    if (typeof gc.giveHeroHelp === 'function') gc.giveHeroHelp();
                    if (typeof gc.upgradeSkills === 'function') gc.upgradeSkills();
                    if (typeof gc.sweepBoss === 'function') gc.sweepBoss();
                    sendLog("🏛️ [M8 - Tiên Minh] Đã hoàn thành toàn bộ công việc Tông Môn / Bang Hội!", "action");
                    return true;
                }
                // 5. Cuối Ngày (Thư, Like BXH, Sôi Nổi)
                if (CONFIG.activeFeature === 'autoCuoiNgay') {
                    if (ctx.MailCtrl && ctx.MailCtrl.gInst && typeof ctx.MailCtrl.gInst().claimAllMails === 'function') {
                        ctx.MailCtrl.gInst().claimAllMails();
                    }
                    if (ctx.RankCtrl && ctx.RankCtrl.gInst && typeof ctx.RankCtrl.gInst().likeTopPlayers === 'function') {
                        ctx.RankCtrl.gInst().likeTopPlayers(3);
                    }
                    if (ctx.TaskCtrl && ctx.TaskCtrl.gInst && typeof ctx.TaskCtrl.gInst().claimActiveChests === 'function') {
                        ctx.TaskCtrl.gInst().claimActiveChests([25, 50, 75, 100]);
                    }
                    sendLog("📬 [M8 - Cuối Ngày] Đã nhận sạch Thư, Like BXH 3 lần & mở Rương Sôi Nổi 100!", "action");
                    return true;
                }
                return false;
            } catch (error) {
                const message = error && error.message ? error.message : String(error);
                if (message !== lastDailyRoutineError) {
                    sendLog(`⚠️ [M8 - Hoạt động ngày] Lỗi xử lý: ${message}`, "err");
                    lastDailyRoutineError = message;
                }
                return false;
            }
        }

        let wasAutoRunning = false;

        function executeCycle(isManualOnce = false) {
            if (!CONFIG.running && !isManualOnce) {
                wasAutoRunning = false;
                return;
            }
            if (isExecuting) return;

            if (CONFIG.running && !wasAutoRunning) {
                wasAutoRunning = true;
                if (CONFIG.activeFeature === 'autoTamTienDai' &&
                    tamTienDaiState && tamTienDaiState.phase === 'done') {
                    sendLog("ℹ️ [M8 - Tâm Tiên Đài] Lượt xử lý hôm nay đã hoàn tất trước đó; không nhận hoặc mua lại quà.", "info");
                }
                if (CONFIG.activeFeature === 'autoTienHuu' &&
                    tienHuuState && tienHuuState.phase === 'done' &&
                    tienHuuState.dayKey === new Date().toDateString()) {
                    sendLog("ℹ️ [M8 - Tiên Hữu] Tặng nhanh hôm nay đã hoàn tất; không gửi lại.", "info");
                }
            }

            const now = Date.now();
            if (now - lastActionTime < (CONFIG.intervalMs || 1200)) return;

            isExecuting = true;
            try {
                const ctx = window;
                if (!ctx.DailyDungeonCtrl && !ctx.TowerCtrl && !ctx.CampCtrl && !ctx.WJCtrl &&
                    !ctx.GodWeaponCtrl && !ctx.HangupCtrl && !ctx.WelfareCtrl && !ctx.RecruitCtrl &&
                    !ctx.FriendCtrl) return;

                sendRoleInfo();
                hookGameEvents(ctx);

                if ((CONFIG.autoArena || CONFIG.autoSkipFight) && handleArenaFightResult(ctx)) {
                    lastActionTime = now;
                    return;
                }

                // ⚡ BỎ QUA TRẬN ĐẤU THẦN TỐC: LUÔN CHẠY KÈM TẤT CẢ TÍNH NĂNG KHÁC!
                if (CONFIG.autoSkipFight) {
                    if (handleBattle(ctx)) {
                        lastActionTime = now;
                        return;
                    }
                }

                // ⚡ TỐI ĐA TỐC ĐỘ X3: ÁP DỤNG TOÀN CỤC
                if (CONFIG.maxSpeed && ctx.FightCtrl && ctx.FightCtrl.gInst) {
                    try { const fc = ctx.FightCtrl.gInst(); if (fc.speed < 3) fc.speed = 3; } catch(e) {}
                }

                // 🎯 ĐỘC QUYỀN 1 CHỨC NĂNG CHÍNH (MUTEX): CHỐNG XUNG ĐỘT
                const active = CONFIG.activeFeature;

                // 1. ĐẠO THÀNH: Rèn Tiên Khí & Nâng Khí Đỉnh
                if (active === 'autoForge' || (CONFIG.autoForge && !active)) {
                    if (handleForge(ctx)) { lastActionTime = now; return; }
                }
                // 2. ĐẠO THÀNH: Đấu Tiên Đài
                else if (active === 'autoArena' || (CONFIG.autoArena && !active)) {
                    if (handleArena(ctx)) { lastActionTime = now; return; }
                }
                // --- ĐIỀU PHỐI 8 MODULE ƯU TIÊN VÀ CÁC HOẠT ĐỘNG ---
                // [Module 1] Thông Thiên Tháp & Tứ Linh Tháp
                else if (active === 'autoTongTian' || (CONFIG.autoTongTian && !active)) {
                    if (handleTowerAndTuLinh(ctx)) { lastActionTime = now; return; }
                }
                // [Module 2] Phụ Bản Ngày & Bí Cảnh Tứ Quốc
                else if (active === 'autoDailyDungeon' || (CONFIG.autoDailyDungeon && !active)) {
                    if (handleDailyAndBiCanh(ctx)) { lastActionTime = now; return; }
                }
                // [Module 3] Thủ Vệ Tứ Phái
                else if (active === 'autoSectDefense' || (CONFIG.autoSectDefense && !active)) {
                    if (handleSectDefense(ctx)) { lastActionTime = now; return; }
                }
                // [Module 4] Cửu Uyển Nhi, Cổ Thần Địa, Cực Âm Địa
                else if (active === 'autoOtherTrials' || (CONFIG.autoOtherTrials && !active)) {
                    if (handleOtherTrials(ctx)) { lastActionTime = now; return; }
                }
                // [Module 5] Di Tích Tiên Giới
                else if (active === 'autoImmortalRelic' || (CONFIG.autoImmortalRelic && !active)) {
                    if (handleImmortalRelic(ctx)) { lastActionTime = now; return; }
                }
                // [Module 6] Minigame Ảo Cảnh Pháp Trận
                else if (active === 'autoMinigameMemory' || (CONFIG.autoMinigameMemory && !active)) {
                    if (handleMinigameMemory(ctx)) { lastActionTime = now; return; }
                }
                // [Module 7] Kiếm Hành & Điêu Long Khắc Tinh QTE
                else if (active === 'autoMinigameDragon' || (CONFIG.autoMinigameDragon && !active)) {
                    if (handleMinigameDragon(ctx)) { lastActionTime = now; return; }
                }
                // [Module 8] Hoạt Động Ngày, Tiên Minh & Nhận Cuối Ngày
                else if (['autoTroChien', 'autoTamTienDai', 'autoTienHuu', 'autoTienMinh', 'autoCuoiNgay'].includes(active)) {
                    if (handleDailyRoutine(ctx)) { lastActionTime = now; return; }
                }
                // 4. LỊCH LUYỆN: Leo Phụ Bản Ngày
                else if (active === 'autoClimbDailyDungeons' || (CONFIG.autoClimbDailyDungeons && !active)) {
                    if (handleClimbDailyDungeons(ctx)) { lastActionTime = now; return; }
                }
                // 5. LỊCH LUYỆN: Leo Vực U Minh
                else if (active === 'autoClimbYMAbyss' || (CONFIG.autoClimbYMAbyss && !active)) {
                    if (handleClimbYMAbyss(ctx)) { lastActionTime = now; return; }
                }
                // 6. LỊCH LUYỆN: Đánh Cực Âm Địa
                else if (active === 'autoExtremeYin' || (CONFIG.autoExtremeYin && !active)) {
                    if (handleExtremeYin(ctx)) { lastActionTime = now; return; }
                }
                // 7. LỊCH LUYỆN: Leo Tứ Linh Trận
                else if (active === 'autoClimbCamp' || (CONFIG.autoClimbCamp && !active)) {
                    if (handleClimbCamp(ctx)) { lastActionTime = now; return; }
                }
                // 8. LỊCH LUYỆN: Quét Sạch Phụ Bản Đã Vượt
                else if (active === 'autoSweepDungeons' || (CONFIG.autoSweepDungeons && !active)) {
                    if (handleSweepDungeons(ctx)) { lastActionTime = now; return; }
                }
                // 9. MA ĐẠO: Đi Ải Chính Tuyến
                else if (active === 'autoMainStage' || (CONFIG.autoMainStage && !active)) {
                    if (handleMainStage(ctx)) { lastActionTime = now; return; }
                }
                // 10. MA ĐẠO: Nhận Thưởng Treo Máy (AFK)
                else if (active === 'autoHangupReward' || (CONFIG.autoHangupReward && !active)) {
                    if (handleHangup(ctx)) { lastActionTime = now; return; }
                }
                // 11. MA ĐẠO: Mua Treo Máy Nhanh
                else if (active === 'autoQuickHang' || (CONFIG.autoQuickHang && !active)) {
                    if (handleHangup(ctx)) { lastActionTime = now; return; }
                }
                // 12. MA ĐẠO: Quà Tiên Duyên (SK Rút x1000)
                else if (active === 'autoXianYuan' || (CONFIG.autoXianYuan && !active)) {
                    if (handleXianYuan(ctx)) { lastActionTime = now; return; }
                }
                // 13. MA ĐẠO: Nhiệm Vụ Ngày
                else if (active === 'autoDailyTask' || (CONFIG.autoDailyTask && !active)) {
                    if (handleDailyTasks(ctx)) { lastActionTime = now; return; }
                }

                if (isManualOnce) {
                    sendLog("Đã kiểm tra xong toàn bộ ải phụ bản, đấu tiên đài và nhiệm vụ!", "info");
                }
            } finally {
                isExecuting = false;
            }
        }

        setInterval(() => {
            executeCycle(false);
        }, 800);
    }
})();
