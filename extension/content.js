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
        towerDailyRoutine: true,        // Nhận thưởng và Quét ải mỗi ngày: Thông Thiên (2 free + 1 mua) & Tứ Linh (10 ải mới + 2 quét free)
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
        autoTienMinh: false,            // Tiên Minh: Trả giá, Bí Cảnh, Tỉ Thí, Vấn Đạo, Viện trợ, Cung phụng
        tienMinhDungeonLimit: 3,        // Số trận Bí Cảnh Tông Môn tối đa mỗi ngày (2 miễn phí + mua thêm)
        autoCuoiNgay: false,            // Nhận thư, Like BXH Đạo Thành 3 lần, Nhận rương Sôi Nổi (25-100)
        
        // Các tính năng kinh điển bổ trợ
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

    delete CONFIG.keepGameLive;

    if (CONFIG.activeFeature === 'autoForge') CONFIG.activeFeature = null;
    delete CONFIG.autoForge;

    CONFIG.running = false;

    function saveConfig() {
        try {
            localStorage.setItem('TN_AUTO_CFG_V293', JSON.stringify(CONFIG));
        } catch (e) { }
    }

    saveConfig();

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
                    min-height: 0;
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
                    max-height: none;
                    min-height: 400px;
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
                    min-height: 0;
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
                    max-height: none;
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
                    flex: 1 1 0;
                    min-height: 0;
                    overflow-y: auto;
                    font-family: Consolas, monospace;
                    font-size: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
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
                                            <div style="font-size:9.5px; color:#a6adc8; margin-top:2px; line-height:1.3;">Trả giá Shop, Bí Cảnh, Tỉ Thí, Vấn Đạo, Viện trợ Tông Môn & Cung phụng Tôn Sư.</div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoTienMinh" ${CONFIG.activeFeature === 'autoTienMinh' ? 'checked' : ''}>
                                    </label>
                                    <label class="tn-opt-item" style="margin:0 0 4px 10px; padding:4px 8px; border-left:3px solid #cba6f7;">
                                        <div>
                                            <div style="font-size:10px; color:#cba6f7;">Giới hạn Bí Cảnh Tông Môn (2 free + mua 20 Tiên Ngọc/lượt):</div>
                                            <div style="font-size:9px; color:#a6adc8; margin-top:2px;">Trên 2 trận sẽ tự mua thêm lượt; tối đa 6.</div>
                                        </div>
                                        <input type="number" id="tn-opt-tien-minh-dungeon-limit" min="1" max="6" step="1" value="${CONFIG.tienMinhDungeonLimit}" style="width:52px; padding:2px 4px; background:#181825; color:#cdd6f4; border:1px solid #45475a; border-radius:4px;">
                                    </label>
                                    <label class="tn-opt-item" style="border-left: 3px solid #f38ba8;">
                                        <div>
                                            <div style="font-weight:bold; color:#f38ba8;">📬 Nhận Cuối Ngày (Thư, Like BXH, Sôi Nổi)</div>
                                            <div style="font-size:9.5px; color:#a6adc8; margin-top:2px; line-height:1.3;">Nhận toàn bộ Thư, Like BXH Đạo Thành 3 lần, nhận hết rương Sôi Nổi (25, 50, 75, 100).</div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoCuoiNgay" ${CONFIG.activeFeature === 'autoCuoiNgay' ? 'checked' : ''}>
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
                                    <label class="tn-opt-item" style="margin:0 0 4px 10px; padding:4px 8px; border-left:3px solid #f5c2e7;">
                                        <div>
                                            <div style="font-size:10px; color:#f5c2e7;">📅 Nhận thưởng và Quét ải mỗi ngày</div>
                                            <div style="font-size:9px; color:#a6adc8; margin-top:2px;">Thông Thiên Tháp quét 3 lần (2 free + 1 mua); Tứ Linh Tháp đang mở: 10 ải mới + quét 2 lần free (không mua).</div>
                                        </div>
                                        <input type="checkbox" id="tn-opt-tower-daily" ${CONFIG.activeFeature === 'autoTongTian' && CONFIG.towerDailyRoutine ? 'checked' : ''}>
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
                'autoSweepDungeons', 'autoExtremeYin', 'autoArena',
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

            const towerDailyEl = document.getElementById('tn-opt-tower-daily');
            function setTowerDailyRoutine(enabled) {
                CONFIG.towerDailyRoutine = enabled;
                if (towerDailyEl) towerDailyEl.checked = enabled;
            }
            // Tùy chọn con chỉ bật khi M1 đang là chức năng chính.
            if (CONFIG.activeFeature !== 'autoTongTian') setTowerDailyRoutine(false);
            else if (towerDailyEl) towerDailyEl.checked = Boolean(CONFIG.towerDailyRoutine);

            if (towerDailyEl) {
                towerDailyEl.addEventListener('change', (e) => {
                    if (CONFIG.activeFeature !== 'autoTongTian') {
                        e.target.checked = false;
                        return;
                    }
                    CONFIG.towerDailyRoutine = e.target.checked;
                    saveConfig();
                    sendCommandToGame('UPDATE_CONFIG', { config: CONFIG });
                    addLogToUI(
                        CONFIG.towerDailyRoutine
                            ? "🟢 Đã bật Nhận thưởng và Quét ải mỗi ngày (Thông Thiên & Tứ Linh)."
                            : "⏸️ Đã tắt Nhận thưởng và Quét ải mỗi ngày; chỉ chạy bỏ qua Thông Thiên Tháp.",
                        "info"
                    );
                });
            }

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
                        setTowerDailyRoutine(key === 'autoTongTian');
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
                        if (key === 'autoTongTian') setTowerDailyRoutine(false);
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

            const tienMinhDungeonLimitEl = document.getElementById('tn-opt-tien-minh-dungeon-limit');
            if (tienMinhDungeonLimitEl) {
                tienMinhDungeonLimitEl.addEventListener('change', (e) => {
                    const input = e.target;
                    const limit = Number(input.value);
                    CONFIG.tienMinhDungeonLimit = Number.isInteger(limit) && limit >= 1 && limit <= 6 ? limit : 3;
                    input.value = String(CONFIG.tienMinhDungeonLimit);
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
                const tienMinhActive = CONFIG.running && CONFIG.activeFeature === 'autoTienMinh';
                if ((CONFIG.autoSkipFight || tienMinhActive) && t) {
                    const n = ctx.FightConst && ctx.FightConst.ERoundFightType;
                    if (n) {
                        const isSkippable = (CONFIG.autoSkipFight && (
                            t.type === n.dungeon ||
                            t.type === n.runningMan ||
                            t.type === n.ymAbyss ||
                            (t.type >= n.singCamp_wei && t.type <= n.singCamp_qun)
                        )) || (tienMinhActive && (
                            t.type === n.guild ||
                            t.type === n.gldWr ||
                            t.type === n.guildAsked
                        ));
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

                    // Tiên Minh tự xử lý bảng đội hình trong daily-routines.js (có giới hạn và log riêng).
                    if (CONFIG.activeFeature !== 'autoTienMinh' && vm.viewIsVisible && vm.viewIsVisible('embattleUi')) {
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
        // Nhận thưởng và Quét ải mỗi ngày (CONFIG.towerDailyRoutine):
        //   - Thông Thiên Tháp: quét hết lượt miễn phí + mua đúng 1 lượt.
        //   - Tứ Linh Tháp: với mỗi tháp đang mở hôm nay, đánh các ải mới (tối đa theo giới hạn ngày)
        //     rồi quét hết lượt miễn phí (không mua thêm).
        // Mọi bước chỉ được tính là thành công khi dữ liệu máy chủ (11004/11021) xác nhận.
        const TOWER_DAILY_REQUEST_TIMEOUT_MS = 20000;
        const TOWER_DAILY_FIGHT_TIMEOUT_MS = 60000;
        const TOWER_DAILY_MAX_BUYS = 1;
        const TOWER_DAILY_DEFAULT_NEW_BATTLES = 10;
        let towerDailyState = null;
        let towerDailyUnavailableLogged = false;
        let lastTowerAndTuLinhError = '';

        function createTowerDailyState() {
            return {
                dayKey: new Date().toDateString(),
                phase: 'tower',          // tower -> camp -> done
                failed: false,
                logged: {},
                tower: { stage: 'refresh', pending: null, refreshing: null, attempts: 0, done: 0, bought: 0 },
                camp: { stage: 'open', refreshing: null, list: null, index: 0, cur: null }
            };
        }

        function logTowerDaily(state, key, message, type) {
            if (state.logged[key]) return;
            state.logged[key] = true;
            sendLog(message, type || "info");
        }

        function failTowerDaily(state, key, message, nextPhase) {
            state.failed = true;
            logTowerDaily(state, key, `❌ [M1 - Quét mỗi ngày] ${message}`, "error");
            if (nextPhase) state.phase = nextPhase;
        }

        function getTowerDailyTypes(ctx) {
            const types = ctx.DailyDungeonConst && ctx.DailyDungeonConst.dailyDungeonType;
            if (!types || typeof types.runningMan !== 'number' || typeof types.singCamp_wei !== 'number') return null;
            return types;
        }

        // Số liệu lượt của một loại ải theo dữ liệu máy chủ (null nếu chưa tải).
        function readTowerDailyCounts(dd, type) {
            const data = typeof dd.getDungeonData === 'function' ? dd.getDungeonData(type) : null;
            if (!data || !data.his_list) return null;
            const enter = Number(data.enter_count);
            const buy = Number(data.buy_count);
            const totalBuy = Number(data.total_buy_count);
            const dayCount = Number(data.day_count);
            if (![enter, buy, totalBuy, dayCount].every(Number.isFinite)) return null;
            return {
                token: data.his_list,
                enter, buy, totalBuy, dayCount,
                free: dayCount + buy - enter,
                todayPass: Number(data.today_pass) || 0
            };
        }

        function getTowerDailyNewBattleLimit() {
            try {
                const value = Number(GlobalCtrl.gInst().gConstVByK(2));
                if (Number.isInteger(value) && value > 0) return value;
            } catch (e) { }
            return TOWER_DAILY_DEFAULT_NEW_BATTLES;
        }

        // Yêu cầu máy chủ gửi lại dữ liệu loại ải; trả về 'wait' | 'ready' | 'timeout' | 'error'.
        function pollTowerDailyRefresh(holder, key, now, send, tokenOf) {
            if (!holder[key]) {
                holder[key] = { token: tokenOf(), startedAt: now };
                try { send(); } catch (e) { holder[key] = null; return 'error'; }
                return 'wait';
            }
            if (tokenOf() !== holder[key].token) {
                holder[key] = null;
                return 'ready';
            }
            if (now - holder[key].startedAt >= TOWER_DAILY_REQUEST_TIMEOUT_MS) {
                holder[key] = null;
                return 'timeout';
            }
            return 'wait';
        }

        function handleTowerDailyTower(ctx, state, types, now) {
            const dd = ctx.DailyDungeonCtrl.gInst();
            const t = state.tower;
            const type = types.runningMan;
            const tokenOf = () => { const d = dd.getDungeonData(type); return d && d.his_list; };
            const refresh = () => pollTowerDailyRefresh(t, 'refreshing', now, () => dd.send11004(type), tokenOf);

            if (t.pending) {
                const pending = t.pending;
                const counts = readTowerDailyCounts(dd, type);
                const progressed = counts && counts.token !== pending.token && counts.enter > pending.beforeEnter &&
                    (pending.kind !== 'buy' || counts.buy > pending.before);
                if (progressed) {
                    t.pending = null;
                    if (pending.kind === 'buy') {
                        t.bought++;
                        logTowerDaily(state, `tower-buy-${counts.buy}`, `✅ [M1 - Thông Thiên Tháp] Máy chủ xác nhận đã mua và quét thêm 1 lượt (${counts.buy} lượt đã mua).`, "action");
                    } else {
                        t.done++;
                        logTowerDaily(state, `tower-fight-${counts.enter}`, `✅ [M1 - Thông Thiên Tháp] Máy chủ xác nhận đã quét lượt ${counts.enter}/${counts.dayCount + counts.buy}.`, "action");
                    }
                    t.stage = 'decide';
                } else if (now - pending.startedAt >= TOWER_DAILY_REQUEST_TIMEOUT_MS) {
                    t.pending = null;
                    const c2 = readTowerDailyCounts(dd, type);
                    const detail = c2 ? ` [đã vào ${c2.enter}/${c2.dayCount}, đã mua ${c2.buy}, tầng đã vượt #${dd.gLastDgnId(type)}]` : '';
                    failTowerDaily(state, 'tower-pending-timeout', `Máy chủ chưa xác nhận ${pending.kind === 'buy' ? 'lượt mua' : 'lượt quét'} Thông Thiên Tháp${detail}; không gửi lại để tránh mua/đánh trùng. `, 'camp');
                } else if (now - pending.startedAt >= 3000 && now - pending.lastRefreshAt >= 2000) {
                    pending.lastRefreshAt = now;
                    try { dd.send11004(type); } catch (e) { }
                }
                return true;
            }

            if (t.stage === 'refresh') {
                const result = refresh();
                if (result === 'ready') t.stage = 'decide';
                else if (result === 'timeout' || result === 'error') failTowerDaily(state, 'tower-refresh', 'Không tải được số lượt Thông Thiên Tháp từ máy chủ.', 'camp');
                return true;
            }

            // stage === 'decide'
            const counts = readTowerDailyCounts(dd, type);
            if (!counts) {
                failTowerDaily(state, 'tower-counts', 'Không đọc được số lượt Thông Thiên Tháp.', 'camp');
                return true;
            }
            if (t.attempts >= counts.dayCount + TOWER_DAILY_MAX_BUYS + 2) {
                failTowerDaily(state, 'tower-attempts', 'Thông Thiên Tháp vượt quá số lần thử trong một lượt chạy; dừng để tránh lặp.', 'camp');
                return true;
            }

            if (counts.free <= 0) {
                if (counts.buy < TOWER_DAILY_MAX_BUYS && counts.totalBuy > counts.buy) {
                    const lastId = dd.gLastDgnId(type);
                    const cost = typeof dd.gDgnCostCfg2 === 'function' ? dd.gDgnCostCfg2(type, counts.buy + 1) : null;
                    if (!lastId || lastId <= 0 || !cost || typeof dd.send11007 !== 'function') {
                        failTowerDaily(state, 'tower-buy-api', 'Không tìm thấy ải đã vượt hoặc giá mua lượt quét Thông Thiên Tháp hợp lệ; không mua.', 'camp');
                        return true;
                    }
                    t.attempts++;
                    t.pending = { kind: 'buy', before: counts.buy, beforeEnter: counts.enter, token: counts.token, startedAt: now, lastRefreshAt: now };
                    sendLog(`🗼 [M1 - Thông Thiên Tháp] Hết lượt quét miễn phí; mua thêm 1 lượt quét (${cost.gold} Tiên Ngọc)...`, "action");
                    try {
                        // Giống nút Quét của game: mua rồi máy chủ tự quét ải đã vượt.
                        dd.send11007(lastId, type, ctx.DailyDungeonConst.buyType.saodang);
                    } catch (e) {
                        t.pending = null;
                        failTowerDaily(state, 'tower-buy-error', `Không thể mua lượt quét Thông Thiên Tháp: ${e.message || e}`, 'camp');
                    }
                    return true;
                }
                if (t.done + t.bought > 0) {
                    logTowerDaily(state, 'tower-finished', `✅ [M1 - Thông Thiên Tháp] Đã quét xong lượt trong ngày (${counts.enter}/${counts.dayCount + counts.buy} lượt, đã mua ${counts.buy}).`, "action");
                } else {
                    logTowerDaily(state, 'tower-already', `ℹ️ [M1 - Thông Thiên Tháp] Hôm nay đã quét đủ (${counts.enter}/${counts.dayCount + counts.buy} lượt, đã mua ${counts.buy}); bỏ qua.`, "info");
                }
                state.phase = 'camp';
                return true;
            }

            const lastId = dd.gLastDgnId(type);
            if (!lastId || lastId <= 0 || typeof dd.send11005 !== 'function') {
                failTowerDaily(state, 'tower-sweep-api', 'Thông Thiên Tháp chưa có tầng đã vượt để quét.', 'camp');
                return true;
            }
            t.attempts++;
            t.pending = { kind: 'sweep', before: counts.enter, beforeEnter: counts.enter, token: counts.token, startedAt: now, lastRefreshAt: now };
            sendLog(`🗼 [M1 - Thông Thiên Tháp] Quét lượt ${counts.enter + 1}/${counts.dayCount + counts.buy} (tầng đã vượt #${lastId})...`, "action");
            try {
                dd.send11005(lastId);
            } catch (e) {
                t.pending = null;
                failTowerDaily(state, 'tower-sweep-error', `Không thể quét Thông Thiên Tháp: ${e.message || e}`, 'camp');
            }
            return true;
        }

        function handleTowerDailyCamp(ctx, state, types, now) {
            const dd = ctx.DailyDungeonCtrl.gInst();
            const c = state.camp;

            if (c.stage === 'open') {
                // Tứ Linh Tháp mở theo cấp độ: chưa đủ cấp thì bỏ qua, không coi là lỗi.
                try {
                    if (ctx.FunOpenCtrl && ctx.FunOpenType && ctx.FunOpenType.SING_CAMP !== undefined &&
                        !ctx.FunOpenCtrl.gInst().check(ctx.FunOpenType.SING_CAMP, false)) {
                        logTowerDaily(state, 'camp-locked', "ℹ️ [M1 - Tứ Linh Tháp] Chức năng chưa mở khóa (chưa đủ cấp độ); bỏ qua.", "info");
                        state.phase = 'done';
                        return true;
                    }
                } catch (e) { }
                // Máy chủ trả danh sách tháp đang mở hôm nay (openArr: 1..4).
                if (typeof dd.sd11021 !== 'function') {
                    failTowerDaily(state, 'camp-api', 'API danh sách Tứ Linh Tháp chưa sẵn sàng.', 'done');
                    return true;
                }
                const result = pollTowerDailyRefresh(c, 'refreshing', now, () => dd.sd11021(), () => dd.openArr);
                if (result === 'ready') {
                    const open = Array.isArray(dd.openArr) ? dd.openArr.slice() : [];
                    c.list = open.map(n => types.singCamp_wei + Number(n) - 1)
                        .filter(v => v >= types.singCamp_wei && v <= types.singCamp_qun);
                    if (c.list.length === 0) {
                        logTowerDaily(state, 'camp-none-open', "ℹ️ [M1 - Tứ Linh Tháp] Hôm nay không có tháp nào đang mở; bỏ qua.", "info");
                        state.phase = 'done';
                    } else {
                        logTowerDaily(state, 'camp-open', `🛡️ [M1 - Tứ Linh Tháp] Tháp đang mở hôm nay: ${c.list.map(v => '#' + (v - types.singCamp_wei + 1)).join(', ')}.`, "info");
                        c.stage = 'next';
                    }
                } else if (result === 'timeout' || result === 'error') {
                    failTowerDaily(state, 'camp-open-timeout', 'Không tải được danh sách Tứ Linh Tháp đang mở từ máy chủ.', 'done');
                }
                return true;
            }

            if (c.stage === 'next') {
                if (c.index >= c.list.length) {
                    state.phase = 'done';
                    return true;
                }
                c.cur = { type: c.list[c.index], stage: 'refresh', refreshing: null, pending: null, attempts: 0, fights: 0, sweeps: 0 };
                c.stage = 'run';
                return true;
            }

            // stage === 'run': xử lý lần lượt từng tháp
            const cur = c.cur;
            const label = `#${cur.type - types.singCamp_wei + 1}`;
            const finishCamp = (ok, key, message) => {
                if (ok) logTowerDaily(state, key, message, "action");
                else failTowerDaily(state, key, message);
                c.index++;
                c.stage = 'next';
                return true;
            };
            const tokenOf = () => { const d = dd.getDungeonData(cur.type); return d && d.his_list; };

            if (cur.pending) {
                const p = cur.pending;
                const counts = readTowerDailyCounts(dd, cur.type);
                const progressed = counts && counts.token !== p.token &&
                    (p.kind === 'fight' ? counts.todayPass > p.before : counts.enter > p.before);
                if (progressed) {
                    cur.pending = null;
                    if (p.kind === 'fight') {
                        cur.fights++;
                        logTowerDaily(state, `camp-${label}-fight-${counts.todayPass}`, `✅ [M1 - Tứ Linh Tháp ${label}] Máy chủ xác nhận ải mới ${counts.todayPass}/${getTowerDailyNewBattleLimit()}.`, "action");
                    } else {
                        cur.sweeps++;
                        logTowerDaily(state, `camp-${label}-sweep-${counts.enter}`, `✅ [M1 - Tứ Linh Tháp ${label}] Máy chủ xác nhận đã quét lượt ${counts.enter}/${counts.dayCount + counts.buy}.`, "action");
                    }
                    cur.stage = 'decide';
                } else if (now - p.startedAt >= TOWER_DAILY_FIGHT_TIMEOUT_MS) {
                    cur.pending = null;
                    return finishCamp(false, `camp-${label}-timeout`, `Máy chủ chưa xác nhận ${p.kind === 'fight' ? 'ải mới' : 'lượt quét'} Tứ Linh Tháp ${label}; chuyển tháp tiếp theo, không gửi lại.`);
                } else if (now - p.startedAt >= 3000 && now - p.lastRefreshAt >= 2000) {
                    p.lastRefreshAt = now;
                    try { dd.send11004(cur.type); } catch (e) { }
                }
                return true;
            }

            if (cur.stage === 'refresh') {
                const result = pollTowerDailyRefresh(cur, 'refreshing', now, () => dd.send11004(cur.type), tokenOf);
                if (result === 'ready') cur.stage = 'decide';
                else if (result === 'timeout' || result === 'error') return finishCamp(false, `camp-${label}-refresh`, `Không tải được dữ liệu Tứ Linh Tháp ${label} từ máy chủ.`);
                return true;
            }

            // cur.stage === 'decide'
            const counts = readTowerDailyCounts(dd, cur.type);
            if (!counts) return finishCamp(false, `camp-${label}-counts`, `Không đọc được dữ liệu Tứ Linh Tháp ${label}.`);
            if (cur.attempts >= getTowerDailyNewBattleLimit() + counts.dayCount + 2) {
                return finishCamp(false, `camp-${label}-attempts`, `Tứ Linh Tháp ${label} vượt quá số lần thử trong một lượt chạy; dừng để tránh lặp.`);
            }

            // 1. Đánh các ải mới cho tới giới hạn trong ngày
            const limit = getTowerDailyNewBattleLimit();
            if (counts.todayPass < limit) {
                const nextId = dd.gCurDgnId(cur.type);
                if (nextId > 0 && typeof dd.send11020 === 'function') {
                    cur.attempts++;
                    cur.pending = { kind: 'fight', before: counts.todayPass, token: counts.token, startedAt: now, lastRefreshAt: now };
                    sendLog(`🛡️ [M1 - Tứ Linh Tháp ${label}] Khiêu chiến ải mới ${counts.todayPass + 1}/${limit} (#${nextId})...`, "action");
                    try {
                        if (typeof dd.saveScId === 'function') dd.saveScId(nextId);
                        dd.send11020(nextId);
                    } catch (e) {
                        cur.pending = null;
                        return finishCamp(false, `camp-${label}-fight-error`, `Không thể khiêu chiến Tứ Linh Tháp ${label}: ${e.message || e}`);
                    }
                    return true;
                }
                // Hết ải để đánh: chuyển sang quét.
                logTowerDaily(state, `camp-${label}-no-next`, `ℹ️ [M1 - Tứ Linh Tháp ${label}] Không còn ải mới để đánh (${counts.todayPass}/${limit}).`, "info");
            }

            // 2. Quét bằng lượt miễn phí (không mua thêm)
            if (counts.free > 0) {
                const lastId = dd.gLastDgnId(cur.type);
                if (!lastId || lastId <= 0 || typeof dd.send11005 !== 'function') {
                    return finishCamp(false, `camp-${label}-sweep-api`, `Tứ Linh Tháp ${label} chưa có ải đã vượt để quét.`);
                }
                cur.attempts++;
                cur.pending = { kind: 'sweep', before: counts.enter, token: counts.token, startedAt: now, lastRefreshAt: now };
                sendLog(`🛡️ [M1 - Tứ Linh Tháp ${label}] Quét ải #${lastId} (còn ${counts.free} lượt miễn phí)...`, "action");
                try {
                    dd.send11005(lastId);
                } catch (e) {
                    cur.pending = null;
                    return finishCamp(false, `camp-${label}-sweep-error`, `Không thể quét Tứ Linh Tháp ${label}: ${e.message || e}`);
                }
                return true;
            }

            if (cur.fights + cur.sweeps > 0) {
                return finishCamp(true, `camp-${label}-finished`, `✅ [M1 - Tứ Linh Tháp ${label}] Hoàn tất: ${cur.fights} ải mới, ${cur.sweeps} lượt quét (ải mới hôm nay ${counts.todayPass}/${limit}).`);
            }
            logTowerDaily(state, `camp-${label}-already`, `ℹ️ [M1 - Tứ Linh Tháp ${label}] Hôm nay đã xong (ải mới ${counts.todayPass}/${limit}, quét ${counts.enter}/${counts.dayCount + counts.buy}); bỏ qua.`, "info");
            c.index++;
            c.stage = 'next';
            return true;
        }

        function finishTowerDaily(state) {
            state.phase = 'done';
            if (state.failed) {
                sendLog("⚠️ [M1 - Quét mỗi ngày] Kết thúc nhưng có bước lỗi/chưa xác nhận; sẽ kiểm tra lại khi Auto khởi động lại.", "warn");
            } else {
                sendLog("✅ [M1 - Quét mỗi ngày] Đã hoàn tất Thông Thiên Tháp & Tứ Linh Tháp hôm nay.", "action");
            }
        }

        // Trả về true khi đang xử lý (chặn các bước khác); false khi đã xong hôm nay.
        function handleTowerDailyRoutine(ctx) {
            if (!CONFIG.towerDailyRoutine) return false;
            const types = getTowerDailyTypes(ctx);
            const dd = ctx.DailyDungeonCtrl && ctx.DailyDungeonCtrl.gInst && ctx.DailyDungeonCtrl.gInst();
            if (!types || !dd || typeof dd.getDungeonData !== 'function' || typeof dd.send11004 !== 'function') {
                if (!towerDailyUnavailableLogged) {
                    towerDailyUnavailableLogged = true;
                    sendLog("⚠️ [M1 - Quét mỗi ngày] Game chưa sẵn sàng (DailyDungeonCtrl); sẽ thử lại.", "warn");
                }
                return false;
            }
            towerDailyUnavailableLogged = false;

            const dayKey = new Date().toDateString();
            if (!towerDailyState || towerDailyState.dayKey !== dayKey) {
                towerDailyState = createTowerDailyState();
                sendLog("🗼 [M1 - Quét mỗi ngày] Bắt đầu nhận thưởng và quét ải: Thông Thiên Tháp rồi Tứ Linh Tháp.", "action");
            }
            const state = towerDailyState;
            if (state.phase === 'done') return false;

            const now = Date.now();
            if (state.phase === 'tower') handleTowerDailyTower(ctx, state, types, now);
            else if (state.phase === 'camp') handleTowerDailyCamp(ctx, state, types, now);
            if (state.phase === 'done') finishTowerDaily(state);
            return true;
        }

        function handleTowerAndTuLinh(ctx) {
            try {
                if (handleTowerDailyRoutine(ctx)) return true;
                return handleTongTianTower(ctx) || handleClimbCamp(ctx);
            } catch(e) {
                const message = `❌ [M1] Lỗi: ${e && e.message ? e.message : e}`;
                if (message !== lastTowerAndTuLinhError) {
                    lastTowerAndTuLinhError = message;
                    sendLog(message, "error");
                }
                return false;
            }
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
        const CUOI_NGAY_REQUEST_TIMEOUT_MS = 20000;
        const TIEN_MINH_REQUEST_TIMEOUT_MS = 20000;
        const TIEN_MINH_DUNGEON_FIGHT_TIMEOUT_MS = 30000;
        const TIEN_MINH_FIGHT_MAX_WAIT_MS = 90000;
        const TIEN_MINH_DUNGEON_MAX_BUYS = 4;
        const TIEN_MINH_ASKED_FIGHTS = 2;
        let tamTienDaiState = null;
        let tienHuuState = null;
        let cuoiNgayState = null;
        let tienMinhState = null;
        let tienMinhControllerUnavailableLogged = false;
        const TRO_CHIEN_REQUEST_TIMEOUT_MS = 20000;
        let troChienState = null;
        let troChienControllerUnavailableLogged = false;
        let lastDailyRoutineError = '';

        function createCuoiNgayState(emailCtrl, rankCtrl, acvCtrl) {
            return {
                dayKey: new Date().toDateString(),
                emailCtrl,
                rankCtrl,
                acvCtrl,
                phase: 'mail',
                failed: false,
                loggedErrors: new Set(),
                mail: {
                    opened: false,
                    listBefore: null,
                    requestedAt: 0,
                    loaded: false,
                    types: [],
                    typeIndex: 0,
                    pending: null,
                    claimed: 0
                },
                rank: {
                    opened: false,
                    model: null,
                    view: null,
                    types: [],
                    dataBefore: new Map(),
                    worshipBefore: null,
                    requestedAt: 0,
                    loaded: false,
                    rankIndex: 1,
                    pending: null,
                    worshipped: 0,
                    skipped: 0
                },
                tasks: {
                    opened: false,
                    taskListBefore: null,
                    requestedAt: 0,
                    loaded: false,
                    pending: null,
                    taskClaims: 0,
                    chestClaims: 0
                }
            };
        }

        function logCuoiNgayError(state, key, message) {
            state.failed = true;
            if (state.loggedErrors.has(key)) return;
            state.loggedErrors.add(key);
            sendLog(`⚠️ [M8 - Cuối Ngày] ${message}`, "err");
        }

        function finishCuoiNgay(state) {
            state.phase = 'done';
            const confirmedClaims = state.mail.claimed + state.rank.worshipped +
                state.tasks.taskClaims + state.tasks.chestClaims;
            if (state.failed) {
                sendLog("⚠️ [M8 - Cuối Ngày] Đã kiểm tra xong nhưng một số thao tác chưa được máy chủ xác nhận; xem các lỗi phía trên.", "err");
            } else if (confirmedClaims > 0) {
                sendLog(`✅ [M8 - Cuối Ngày] Máy chủ xác nhận ${state.mail.claimed} lượt nhận nhanh Thư, ${state.rank.worshipped} lượt Hành Lễ và ${state.tasks.taskClaims + state.tasks.chestClaims} thưởng Nhiệm Vụ/Rương.`, "action");
            } else {
                sendLog("ℹ️ [M8 - Cuối Ngày] Đã kiểm tra trạng thái; không còn phần thưởng đang chờ nhận, không gửi lại thao tác đã hoàn tất.", "info");
            }
        }

        function handleCuoiNgayMail(ctx, state) {
            const emailCtrl = state.emailCtrl;
            const tabTypes = ctx.EmailConst && ctx.EmailConst.EmailTabType;
            if (!emailCtrl || !tabTypes ||
                typeof emailCtrl.openElUi !== 'function' ||
                typeof emailCtrl.reqDataBeforeEnter !== 'function' ||
                typeof emailCtrl.isCanReward !== 'function' ||
                typeof emailCtrl.send16007 !== 'function') {
                logCuoiNgayError(state, 'mail-api', 'API Thư chưa sẵn sàng; bỏ qua bước nhận Thư.');
                state.phase = 'rank';
                return true;
            }

            if (!state.mail.opened) {
                state.mail.listBefore = emailCtrl.mailDat && emailCtrl.mailDat.list;
                state.mail.requestedAt = Date.now();
                state.mail.opened = true;
                const opened = emailCtrl.openElUi();
                if (opened === false) {
                    logCuoiNgayError(state, 'mail-locked', 'Không thể mở giao diện Thư; hãy kiểm tra điều kiện mở tính năng trong game.');
                    state.phase = 'rank';
                    return true;
                }
                emailCtrl.reqDataBeforeEnter();
                sendLog("ℹ️ [M8 - Cuối Ngày - Thư] Đã mở Thư; đang tải trạng thái trước khi nhận nhanh.", "info");
                return true;
            }

            if (!state.mail.loaded) {
                const mailList = emailCtrl.mailDat && emailCtrl.mailDat.list;
                if (Array.isArray(mailList) && mailList !== state.mail.listBefore) {
                    state.mail.loaded = true;
                    state.mail.types = [tabTypes.type_1, tabTypes.type_2];
                } else if (Date.now() - state.mail.requestedAt >= CUOI_NGAY_REQUEST_TIMEOUT_MS) {
                    logCuoiNgayError(state, 'mail-timeout', 'Hết thời gian chờ trạng thái Thư từ máy chủ; không xác nhận đã nhận.');
                    state.phase = 'rank';
                    return true;
                } else {
                    return true;
                }
            }

            if (state.mail.pending) {
                if (!emailCtrl.isCanReward(state.mail.pending.type)) {
                    state.mail.claimed++;
                    sendLog("✅ [M8 - Cuối Ngày - Thư] Máy chủ xác nhận đã nhận nhanh thư có đính kèm.", "action");
                    state.mail.typeIndex++;
                    state.mail.pending = null;
                } else if (Date.now() - state.mail.pending.startedAt >= CUOI_NGAY_REQUEST_TIMEOUT_MS) {
                    logCuoiNgayError(state, 'mail-claim-timeout', 'Máy chủ chưa xác nhận nhận nhanh Thư; không thử gửi lại để tránh nhận trùng.');
                    state.mail.typeIndex++;
                    state.mail.pending = null;
                }
                return true;
            }

            if (state.mail.typeIndex >= state.mail.types.length) {
                state.phase = 'rank';
                return true;
            }

            const type = state.mail.types[state.mail.typeIndex];
            if (!Number.isFinite(type)) {
                logCuoiNgayError(state, 'mail-type', 'Không tìm thấy loại Thư hợp lệ; bỏ qua bước nhận Thư.');
                state.phase = 'rank';
                return true;
            }
            if (!emailCtrl.isCanReward(type)) {
                sendLog(`ℹ️ [M8 - Cuối Ngày - Thư] Không có thư chờ nhận ở loại ${type}; bỏ qua.`, "info");
                state.mail.typeIndex++;
                return true;
            }

            state.mail.pending = { type, startedAt: Date.now() };
            emailCtrl.send16007(type);
            sendLog(`ℹ️ [M8 - Cuối Ngày - Thư] Đã yêu cầu Nhận nhanh loại ${type}; đang chờ máy chủ xác nhận.`, "info");
            return true;
        }

        function handleCuoiNgayRank(ctx, state) {
            const rankCtrl = state.rankCtrl;
            const rankConst = ctx.RankConst;
            const viewMgr = ctx.ViewMgr && typeof ctx.ViewMgr.gInst === 'function'
                ? ctx.ViewMgr.gInst()
                : null;
            if (!rankCtrl || !rankConst || !rankConst.RankType ||
                typeof rankCtrl.getCurlModel !== 'function' ||
                typeof rankCtrl.showRankMainView !== 'function' ||
                typeof rankCtrl.send15005 !== 'function' ||
                typeof rankCtrl.send15006 !== 'function' ||
                !viewMgr || typeof viewMgr.getViewByName !== 'function' ||
                !ctx.ViewConst || !ctx.ViewConst.rankUi ||
                !ctx.egret || !ctx.egret.TouchEvent) {
                logCuoiNgayError(state, 'rank-api', 'API BXH/Hành Lễ chưa sẵn sàng; bỏ qua bước BXH.');
                state.phase = 'tasks';
                return true;
            }

            if (!state.rank.opened) {
                if (!state.rank.requestedAt) {
                    state.rank.model = rankCtrl.getCurlModel();
                    if (!state.rank.model ||
                        typeof state.rank.model.getRankDataByType !== 'function' ||
                        typeof state.rank.model.getCanWorship !== 'function') {
                        logCuoiNgayError(state, 'rank-model', 'Không tìm thấy BXH Sức Mạnh để kiểm tra Hành Lễ.');
                        state.phase = 'tasks';
                        return true;
                    }
                    state.rank.requestedAt = Date.now();
                    rankCtrl.showRankMainView();
                }

                state.rank.view = viewMgr.getViewByName(ctx.ViewConst.rankUi);
                if (!state.rank.view) {
                    if (Date.now() - state.rank.requestedAt >= CUOI_NGAY_REQUEST_TIMEOUT_MS) {
                        logCuoiNgayError(state, 'rank-view-timeout', 'Hết thời gian chờ giao diện BXH Sức Mạnh; không Hành Lễ.');
                        state.phase = 'tasks';
                    }
                    return true;
                }
                if (!state.rank.view.itemList ||
                    typeof state.rank.view.itemList.getElementAt !== 'function' ||
                    typeof state.rank.view.reqRankList !== 'function') {
                    logCuoiNgayError(state, 'rank-view', 'Giao diện BXH chính chưa sẵn sàng để bấm các biểu tượng Hành Lễ.');
                    state.phase = 'tasks';
                    return true;
                }

                const rankTypes = state.rank.view.crtRankTypeArr;
                if (!Array.isArray(rankTypes) || rankTypes.length === 0) {
                    logCuoiNgayError(state, 'rank-types', 'BXH Sức Mạnh chưa có hạng mục khả dụng để Hành Lễ.');
                    state.phase = 'tasks';
                    return true;
                }
                state.rank.types = rankTypes.slice();
                state.rank.types.forEach((type) => {
                    state.rank.dataBefore.set(type, state.rank.model.getRankDataByType(type));
                });
                state.rank.worshipBefore = state.rank.model.worship_dic;
                state.rank.requestedAt = Date.now();
                state.rank.opened = true;
                rankCtrl.send15005();
                state.rank.view.reqRankList();
                sendLog("ℹ️ [M8 - Cuối Ngày - BXH] Đã mở BXH Sức Mạnh; đang tải trạng thái các biểu tượng Hành Lễ.", "info");
                return true;
            }

            if (!state.rank.loaded) {
                const worshipData = state.rank.model.worship_dic;
                const rankDataLoaded = state.rank.types.every((type) => {
                    const rankData = state.rank.model.getRankDataByType(type);
                    return rankData && rankData !== state.rank.dataBefore.get(type) &&
                        Array.isArray(rankData.list);
                });
                if (rankDataLoaded && worshipData && worshipData !== state.rank.worshipBefore) {
                    state.rank.loaded = true;
                } else if (Date.now() - state.rank.requestedAt >= CUOI_NGAY_REQUEST_TIMEOUT_MS) {
                    logCuoiNgayError(state, 'rank-timeout', 'Hết thời gian chờ trạng thái BXH Sức Mạnh/Hành Lễ; không xác nhận đã tương tác.');
                    state.phase = 'tasks';
                    return true;
                } else {
                    return true;
                }
            }

            if (state.rank.pending) {
                const type = state.rank.pending.type;
                if (!state.rank.model.getCanWorship(type, 1)) {
                    state.rank.worshipped++;
                    sendLog(`✅ [M8 - Cuối Ngày - BXH] Máy chủ xác nhận đã Hành Lễ qua biểu tượng BXH loại ${type}.`, "action");
                    state.rank.rankIndex++;
                    state.rank.pending = null;
                } else if (Date.now() - state.rank.pending.startedAt >= CUOI_NGAY_REQUEST_TIMEOUT_MS) {
                    logCuoiNgayError(state, `rank-claim-timeout-${type}`, `Máy chủ chưa xác nhận Hành Lễ qua biểu tượng BXH loại ${type}; không gửi lại.`);
                    state.rank.rankIndex++;
                    state.rank.pending = null;
                    return true;
                } else {
                    return true;
                }
            }

            if (state.rank.rankIndex > state.rank.types.length) {
                if (state.rank.skipped > 0 && state.rank.worshipped === 0) {
                    sendLog(`ℹ️ [M8 - Cuối Ngày - BXH] Không còn lượt Hành Lễ khả dụng; đã bỏ qua ${state.rank.skipped} biểu tượng.`, "info");
                } else if (state.rank.skipped > 0) {
                    sendLog(`ℹ️ [M8 - Cuối Ngày - BXH] Đã bỏ qua ${state.rank.skipped} biểu tượng không còn lượt Hành Lễ khả dụng.`, "info");
                }
                state.phase = 'tasks';
                return true;
            }

            const type = state.rank.types[state.rank.rankIndex - 1];
            if (!state.rank.model.getCanWorship(type, 1)) {
                state.rank.rankIndex++;
                state.rank.skipped++;
                return true;
            }

            const itemList = state.rank.view.itemList;
            let rankItem = null;
            for (let index = 0; index < itemList.numElements; index++) {
                const item = itemList.getElementAt(index);
                if (item && item.rankType === type) {
                    rankItem = item;
                    break;
                }
            }
            const button = rankItem && rankItem.moBaiBtn;
            if (!rankItem || !rankItem.needMoBai || !button ||
                button.visible === false ||
                typeof button.dispatchEventWith !== 'function') {
                logCuoiNgayError(state, `rank-button-${type}`, `Không tìm thấy biểu tượng Hành Lễ khả dụng trên BXH Sức Mạnh loại ${type}.`);
                state.rank.rankIndex++;
                return true;
            }

            state.rank.pending = { type, startedAt: Date.now() };
            button.dispatchEventWith(ctx.egret.TouchEvent.TOUCH_TAP, true);
            sendLog(`ℹ️ [M8 - Cuối Ngày - BXH] Đã bấm biểu tượng Hành Lễ loại ${type}; đang chờ máy chủ xác nhận.`, "info");
            return true;
        }

        function handleCuoiNgayTasks(ctx, state) {
            const acvCtrl = state.acvCtrl;
            const taskState = ctx.AcvConst && ctx.AcvConst.ETaskState;
            if (!acvCtrl || !taskState ||
                typeof acvCtrl.openAcvAct !== 'function' ||
                typeof acvCtrl.send30501 !== 'function' ||
                typeof acvCtrl.send12501 !== 'function' ||
                typeof acvCtrl.send30503 !== 'function' ||
                typeof acvCtrl.send30504 !== 'function') {
                logCuoiNgayError(state, 'task-api', 'API Nhiệm Vụ/Rương chưa sẵn sàng; bỏ qua bước nhận thưởng.');
                finishCuoiNgay(state);
                return true;
            }

            if (!state.tasks.opened) {
                state.tasks.taskListBefore = acvCtrl.taskDt;
                state.tasks.requestedAt = Date.now();
                state.tasks.opened = true;
                acvCtrl.openAcvAct(0);
                acvCtrl.send30501();
                acvCtrl.send12501();
                sendLog("ℹ️ [M8 - Cuối Ngày - Nhiệm Vụ] Đã mở Nhiệm Vụ; đang tải trạng thái nhiệm vụ và rương.", "info");
                return true;
            }

            if (!state.tasks.loaded) {
                if (Array.isArray(acvCtrl.taskDt) &&
                    acvCtrl.taskDt !== state.tasks.taskListBefore &&
                    Array.isArray(acvCtrl.tskStateLs)) {
                    state.tasks.loaded = true;
                } else if (Date.now() - state.tasks.requestedAt >= CUOI_NGAY_REQUEST_TIMEOUT_MS) {
                    logCuoiNgayError(state, 'task-timeout', 'Hết thời gian chờ trạng thái Nhiệm Vụ/Rương; không xác nhận đã nhận.');
                    finishCuoiNgay(state);
                    return true;
                } else {
                    return true;
                }
            }

            if (state.tasks.pending) {
                const pending = state.tasks.pending;
                if (pending.kind === 'task') {
                    const task = acvCtrl.taskDt.find((entry) => entry && entry.task_id === pending.taskId);
                    if (task && Number(task.status) === taskState.gain) {
                        state.tasks.taskClaims++;
                        sendLog(`✅ [M8 - Cuối Ngày - Nhiệm Vụ] Máy chủ xác nhận đã nhận nhiệm vụ #${pending.taskId}.`, "action");
                        state.tasks.pending = null;
                    }
                } else if (acvCtrl.tskStateLs[pending.index] === taskState.gain) {
                    state.tasks.chestClaims++;
                    sendLog(`✅ [M8 - Cuối Ngày - Rương] Máy chủ xác nhận đã nhận rương năng động #${pending.index + 1}.`, "action");
                    state.tasks.pending = null;
                }

                if (state.tasks.pending &&
                    Date.now() - state.tasks.pending.startedAt >= CUOI_NGAY_REQUEST_TIMEOUT_MS) {
                    logCuoiNgayError(state, 'task-claim-timeout', 'Máy chủ chưa xác nhận một yêu cầu nhận thưởng Nhiệm Vụ/Rương; không gửi lại.');
                    state.tasks.pending = null;
                }
                return true;
            }

            const task = acvCtrl.taskDt.find((entry) =>
                entry && Number(entry.status) === taskState.finish
            );
            if (task) {
                state.tasks.pending = {
                    kind: 'task',
                    taskId: task.task_id,
                    startedAt: Date.now()
                };
                acvCtrl.send30503(task.task_id);
                sendLog(`ℹ️ [M8 - Cuối Ngày - Nhiệm Vụ] Đã yêu cầu nhận nhiệm vụ #${task.task_id}; đang chờ máy chủ xác nhận.`, "info");
                return true;
            }

            const chestIndex = acvCtrl.tskStateLs.findIndex((status) =>
                status === taskState.finish
            );
            if (chestIndex >= 0) {
                state.tasks.pending = {
                    kind: 'chest',
                    index: chestIndex,
                    startedAt: Date.now()
                };
                acvCtrl.send30504(chestIndex);
                sendLog(`ℹ️ [M8 - Cuối Ngày - Rương] Đã yêu cầu nhận rương năng động #${chestIndex + 1}; đang chờ máy chủ xác nhận.`, "info");
                return true;
            }

            finishCuoiNgay(state);
            return true;
        }

        function handleCuoiNgay(ctx) {
            const emailCtrl = ctx.EmailCtrl && typeof ctx.EmailCtrl.gInst === 'function'
                ? ctx.EmailCtrl.gInst()
                : null;
            const rankCtrl = ctx.RankCtrl && typeof ctx.RankCtrl.gInst === 'function'
                ? ctx.RankCtrl.gInst()
                : null;
            const acvCtrl = ctx.AcvCtrl && typeof ctx.AcvCtrl.gInst === 'function'
                ? ctx.AcvCtrl.gInst()
                : null;
            const dayKey = new Date().toDateString();
            if (!cuoiNgayState || cuoiNgayState.dayKey !== dayKey ||
                cuoiNgayState.emailCtrl !== emailCtrl ||
                cuoiNgayState.rankCtrl !== rankCtrl ||
                cuoiNgayState.acvCtrl !== acvCtrl) {
                cuoiNgayState = createCuoiNgayState(emailCtrl, rankCtrl, acvCtrl);
            }

            const state = cuoiNgayState;
            if (state.phase === 'done') return true;
            if (state.phase === 'mail') return handleCuoiNgayMail(ctx, state);
            if (state.phase === 'rank') return handleCuoiNgayRank(ctx, state);
            return handleCuoiNgayTasks(ctx, state);
        }

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

        function createTienMinhState(guildCtrl, warCtrl) {
            return {
                dayKey: new Date().toDateString(),
                guildCtrl,
                warCtrl,
                phase: 'bargain',
                failed: false,
                finalized: false,
                confirmedActions: 0,
                skippedSteps: 0,
                logged: new Set(),
                bargain: { opened: false, step: 'open', pending: null },
                fightingSince: 0,
                dungeon: {
                    stage: 'open',
                    refreshing: null,
                    fightsDone: 0,
                    attempts: 0,
                    pending: null
                },
                war: {
                    statusRequested: false,
                    statusLoaded: false,
                    statusStartedAt: 0,
                    statusEventHandler: null,
                    requested: false,
                    requestStartedAt: 0,
                    pending: null,
                    fightsDone: 0,
                    city: null,
                    targetType: null
                },
                asked: { checked: false, loading: null, count: 0, pending: null },
                help: {
                    opened: false,
                    pending: null,
                    boxFailed: false,
                    boxesLogged: false,
                    attempted: new Set(),
                    assisted: 0,
                    assistRejected: 0
                },
                fete: { opened: false, pending: null, closeAttempted: false }
            };
        }

        function logTienMinh(state, key, message, type) {
            if (state.logged.has(key)) return;
            state.logged.add(key);
            sendLog(message, type);
        }

        function failTienMinhStep(state, key, message, nextPhase) {
            state.failed = true;
            logTienMinh(state, key, `⚠️ [M8 - Tiên Minh] ${message}`, "err");
            state.phase = nextPhase;
        }

        function skipTienMinhStep(state, key, message, nextPhase) {
            state.skippedSteps++;
            logTienMinh(state, key, `ℹ️ [M8 - Tiên Minh] ${message}`, "info");
            state.phase = nextPhase;
        }

        function getTienMinhBargainInfo(guildCtrl) {
            if (typeof guildCtrl.getBargainInfo === 'function') {
                return guildCtrl.getBargainInfo();
            }
            return guildCtrl._bargainInfo;
        }

        function getTienMinhBargainSignature(info) {
            if (!info) return '';
            const items = Array.isArray(info._itemList)
                ? info._itemList.map((item) => item && [
                    item.id,
                    item.item_id,
                    item.price,
                    item.status,
                    item.buy_status,
                    item.bargain_status
                ])
                : [];
            return JSON.stringify([
                info._start_time,
                info._selfStatus,
                info._totalBargain,
                info.curPrice,
                items
            ]);
        }

        function getTienMinhNegativeBargainPrice(info) {
            if (!info) return null;
            const price = Number(info.curPrice);
            return Number.isFinite(price) ? price : null;
        }

        function handleTienMinhBargain(state, now) {
            const gc = state.guildCtrl;
            const bargain = state.bargain;
            if (bargain.pending) {
                const pending = bargain.pending;
                const info = getTienMinhBargainInfo(gc);
                const signature = getTienMinhBargainSignature(info);
                if (signature !== pending.signature) {
                    bargain.pending = null;
                    if (pending.kind === 'load') {
                        bargain.step = 'check';
                    } else if (pending.kind === 'offer') {
                        state.confirmedActions++;
                        logTienMinh(state, 'bargain-offer-confirmed', "✅ [M8 - Tiên Minh - Shop Tiên Giới] Máy chủ xác nhận đã Trả Giá.", "action");
                        bargain.step = 'check-buy';
                    } else {
                        state.confirmedActions++;
                        logTienMinh(state, 'bargain-buy-confirmed', "✅ [M8 - Tiên Minh - Shop Tiên Giới] Máy chủ xác nhận đã Mua vật phẩm sau khi Trả Giá.", "action");
                        state.phase = 'dungeon';
                    }
                } else if (pending.kind === 'load' && now - pending.startedAt >= 1500) {
                    bargain.pending = null;
                    bargain.step = 'check';
                } else if (now - pending.startedAt >= TIEN_MINH_REQUEST_TIMEOUT_MS) {
                    failTienMinhStep(
                        state,
                        `bargain-${pending.kind}-timeout`,
                        `Shop Tiên Giới chưa xác nhận ${pending.kind === 'offer' ? 'Trả Giá' : pending.kind === 'buy' ? 'Mua' : 'trạng thái khuyến mãi'}; không gửi lại để tránh thao tác trùng.`,
                        pending.kind === 'load' ? 'dungeon' : 'dungeon'
                    );
                }
                return true;
            }

            if (bargain.step === 'open') {
                if (typeof gc.send18070 !== 'function') {
                    failTienMinhStep(state, 'bargain-api', 'API mở Shop Tiên Giới/kiểm tra Trả Giá chưa sẵn sàng.', 'dungeon');
                    return true;
                }
                try {
                    // Chỉ tải dữ liệu Trả Giá; openGuildTreasureUi() sẽ mở nhầm tab Rèn.
                    gc.send18070();
                    bargain.pending = {
                        kind: 'load',
                        signature: getTienMinhBargainSignature(getTienMinhBargainInfo(gc)),
                        startedAt: now
                    };
                    bargain.opened = true;
                    logTienMinh(state, 'bargain-loading', "ℹ️ [M8 - Tiên Minh - Shop Tiên Giới] Đang tải trạng thái Trả Giá.", "info");
                } catch (error) {
                    failTienMinhStep(state, 'bargain-open-error', `Không thể mở Shop Tiên Giới: ${error.message || error}`, 'dungeon');
                }
                return true;
            }

            if (bargain.step === 'check') {
                const info = getTienMinhBargainInfo(gc);
                if (!info) {
                    failTienMinhStep(state, 'bargain-state', 'Không đọc được dữ liệu Trả Giá từ máy chủ.', 'dungeon');
                    return true;
                }
                const startTime = Number(info._start_time);
                if (!Array.isArray(info._itemList) || !Number.isFinite(startTime) ||
                    startTime <= 0 || info._itemList.length === 0) {
                    skipTienMinhStep(state, 'bargain-unavailable', 'Shop Tiên Giới không có mục Trả Giá đang mở; bỏ qua.', 'dungeon');
                    return true;
                }
                if (typeof gc.showGuildBargainView === 'function') {
                    gc.showGuildBargainView();
                }
                if (info._selfStatus === undefined || info._selfStatus === null) {
                    failTienMinhStep(state, 'bargain-status', 'Không đọc được trạng thái Trả Giá; bỏ qua để tránh gửi thao tác không xác định.', 'dungeon');
                    return true;
                }
                const selfStatus = Number(info._selfStatus);
                if (!Number.isFinite(selfStatus)) {
                    failTienMinhStep(state, 'bargain-status', 'Không đọc được trạng thái Trả Giá; bỏ qua để tránh gửi thao tác không xác định.', 'dungeon');
                    return true;
                }
                if (selfStatus === 0) {
                    if (typeof gc.send18071 !== 'function') {
                        failTienMinhStep(state, 'bargain-offer-api', 'API Trả Giá chưa sẵn sàng.', 'dungeon');
                        return true;
                    }
                    bargain.pending = {
                        kind: 'offer',
                        signature: getTienMinhBargainSignature(info),
                        startedAt: now
                    };
                    try {
                        gc.send18071();
                    } catch (error) {
                        bargain.pending = null;
                        failTienMinhStep(state, 'bargain-offer-error', `Không thể Trả Giá: ${error.message || error}`, 'dungeon');
                    }
                    return true;
                }
                bargain.step = 'check-buy';
                return true;
            }

            if (bargain.step === 'check-buy') {
                const info = getTienMinhBargainInfo(gc);
                if (!info) {
                    failTienMinhStep(state, 'bargain-buy-state', 'Không đọc được trạng thái giá sau khi Trả Giá.', 'dungeon');
                    return true;
                }
                const price = getTienMinhNegativeBargainPrice(info);
                if (price === null || price >= 0) {
                    skipTienMinhStep(state, 'bargain-no-buy', 'Giá sau khi Trả Giá không dưới 0; không thực hiện Mua.', 'dungeon');
                    return true;
                }
                if (Number(info._selfStatus) === 1) {
                    skipTienMinhStep(state, 'bargain-already-bought', 'Vật phẩm Trả Giá đã được mua trước đó; không mua lại.', 'dungeon');
                    return true;
                }
                if (typeof gc.send18072 !== 'function') {
                    failTienMinhStep(state, 'bargain-buy-api', 'API Mua vật phẩm Trả Giá chưa sẵn sàng.', 'dungeon');
                    return true;
                }
                bargain.pending = {
                    kind: 'buy',
                    signature: getTienMinhBargainSignature(info),
                    startedAt: now
                };
                try {
                    gc.send18072();
                } catch (error) {
                    bargain.pending = null;
                    failTienMinhStep(state, 'bargain-buy-error', `Không thể Mua vật phẩm Trả Giá: ${error.message || error}`, 'dungeon');
                }
                return true;
            }

            state.phase = 'dungeon';
            return true;
        }

        function getTienMinhDungeonView(ctx) {
            const manager = ctx.ViewMgr && ctx.ViewMgr.gViewMgr;
            const cache = manager && manager.m_viewCacheGroup;
            const hall = cache && cache.guildWanFaHallUi;
            return hall && hall.viewDict && hall.viewDict['1'];
        }

        function getTienMinhDungeonLimit() {
            const limit = Number(CONFIG.tienMinhDungeonLimit);
            return Number.isInteger(limit) && limit >= 1 ? Math.min(limit, 6) : 3;
        }

        function getTienMinhDungeonCurId(ctx, gc) {
            const modelId = Number(gc.m_curModel && gc.m_curModel.guildDungeonCurId);
            if (Number.isFinite(modelId) && modelId > 0) return modelId;
            const view = getTienMinhDungeonView(ctx);
            return Number(view && view.guildDungeonCurId);
        }

        function handleTienMinhDungeon(ctx, state, now) {
            const gc = state.guildCtrl;
            const dungeon = state.dungeon;
            const model = gc.m_curModel;
            const data = model && model.scmd18052Data;
            const limit = getTienMinhDungeonLimit();

            if (!model || typeof gc.send18052Msg !== 'function' ||
                typeof gc.send18050Msg !== 'function' ||
                typeof gc.openGuildDungeonUi !== 'function') {
                failTienMinhStep(state, 'dungeon-open-api', 'API Bí Cảnh Tông Môn chưa sẵn sàng.', 'war');
                return true;
            }

            if (dungeon.pending) {
                const pending = dungeon.pending;
                const fightCount = Number(data && data.fight_count);
                const buyCount = Number(data && data.buy_count);
                if (pending.kind === 'buy') {
                    if (Number.isFinite(buyCount) && buyCount > pending.beforeBuyCount) {
                        dungeon.pending = null;
                        state.confirmedActions++;
                        logTienMinh(state, `dungeon-buy-${buyCount}`, `✅ [M8 - Tiên Minh - Bí Cảnh Tông Môn] Máy chủ xác nhận đã mua thêm 1 lượt với giá 20 Tiên Ngọc (${buyCount} lượt đã mua).`, "action");
                        dungeon.stage = 'decide';
                    } else if (now - pending.startedAt >= TIEN_MINH_REQUEST_TIMEOUT_MS) {
                        dungeon.pending = null;
                        failTienMinhStep(state, 'dungeon-buy-timeout', 'Máy chủ chưa xác nhận mua thêm lượt Bí Cảnh Tông Môn; không gửi lại để tránh mua trùng.', 'war');
                    }
                    return true;
                }
                if (Number.isFinite(fightCount) && fightCount > pending.beforeFightCount) {
                    dungeon.pending = null;
                    dungeon.fightsDone++;
                    state.confirmedActions++;
                    logTienMinh(state, `dungeon-fight-${fightCount}`, `✅ [M8 - Tiên Minh - Bí Cảnh Tông Môn] Máy chủ xác nhận trận ${fightCount}/${limit}.`, "action");
                    dungeon.stage = 'decide';
                } else if (now - pending.startedAt >= TIEN_MINH_DUNGEON_FIGHT_TIMEOUT_MS) {
                    dungeon.pending = null;
                    failTienMinhStep(state, 'dungeon-fight-timeout', 'Máy chủ chưa xác nhận trận Bí Cảnh Tông Môn; không gửi lại để tránh lặp trận.', 'war');
                } else if (now - pending.startedAt >= 3000 && now - pending.lastRefreshAt >= 2000) {
                    // Số trận chỉ cập nhật khi tải lại dữ liệu sau khi trận kết thúc.
                    pending.lastRefreshAt = now;
                    try {
                        gc.send18052Msg();
                    } catch (error) {
                        // Lần kiểm tra kế tiếp sẽ thử lại cho tới khi hết thời gian chờ.
                    }
                }
                return true;
            }

            if (dungeon.stage === 'open') {
                try {
                    gc.openGuildDungeonUi();
                } catch (error) {
                    failTienMinhStep(state, 'dungeon-open-error', `Không thể mở Bí Cảnh Tông Môn: ${error.message || error}`, 'war');
                    return true;
                }
                dungeon.stage = 'refresh';
                return true;
            }

            if (dungeon.stage === 'refresh') {
                if (!dungeon.refreshing) {
                    dungeon.refreshing = { dataRef: data, startedAt: now };
                    try {
                        gc.send18050Msg();
                        gc.send18052Msg();
                    } catch (error) {
                        dungeon.refreshing = null;
                        failTienMinhStep(state, 'dungeon-refresh-error', `Không thể tải trạng thái Bí Cảnh Tông Môn: ${error.message || error}`, 'war');
                    }
                    return true;
                }
                if (data && data !== dungeon.refreshing.dataRef) {
                    dungeon.refreshing = null;
                    dungeon.stage = 'decide';
                } else if (now - dungeon.refreshing.startedAt >= TIEN_MINH_REQUEST_TIMEOUT_MS) {
                    dungeon.refreshing = null;
                    failTienMinhStep(state, 'dungeon-state-timeout', 'Không tải được trạng thái lượt Bí Cảnh Tông Môn từ máy chủ.', 'war');
                }
                return true;
            }

            // stage === 'decide'
            const fightCount = Number(data && data.fight_count);
            const maxCount = Number(data && data.max_count);
            const buyCount = Number(data && data.buy_count);
            if (!data || !Number.isFinite(fightCount) || !Number.isFinite(maxCount) ||
                !Number.isFinite(buyCount)) {
                failTienMinhStep(state, 'dungeon-state', 'Không đọc được số lượt Bí Cảnh Tông Môn.', 'war');
                return true;
            }

            if (fightCount >= limit) {
                if (dungeon.fightsDone > 0) {
                    logTienMinh(state, 'dungeon-limit-reached', `✅ [M8 - Tiên Minh - Bí Cảnh Tông Môn] Đã hoàn thành ${fightCount}/${limit} trận trong ngày.`, "action");
                    state.phase = 'war';
                } else {
                    skipTienMinhStep(state, 'dungeon-limit-already', `Bí Cảnh Tông Môn đã đánh ${fightCount}/${limit} trận; không đánh thêm.`, 'war');
                }
                return true;
            }
            if (dungeon.attempts >= 8) {
                failTienMinhStep(state, 'dungeon-attempts', 'Bí Cảnh Tông Môn vượt quá số lần thử trong một lượt chạy; dừng để tránh lặp.', 'war');
                return true;
            }

            if (maxCount - fightCount <= 0) {
                // Hết lượt miễn phí/đã mua: chỉ mua thêm khi giá đúng 20 Tiên Ngọc.
                if (buyCount >= TIEN_MINH_DUNGEON_MAX_BUYS ||
                    typeof model.getDungeonBuyLoss !== 'function' ||
                    typeof gc.send18057Msg !== 'function') {
                    skipTienMinhStep(state, 'dungeon-no-more-turns', `Bí Cảnh Tông Môn hết lượt (${fightCount}/${limit}); không thể mua thêm.`, 'war');
                    return true;
                }
                let cost;
                try {
                    cost = Number(model.getDungeonBuyLoss(buyCount));
                } catch (error) {
                    failTienMinhStep(state, 'dungeon-buy-cost-error', `Không thể kiểm tra giá mua lượt Bí Cảnh: ${error.message || error}`, 'war');
                    return true;
                }
                if (cost !== 20) {
                    skipTienMinhStep(state, 'dungeon-buy-cost', `Giá mua lượt Bí Cảnh hiện là ${Number.isFinite(cost) ? cost : 'không xác định'} Tiên Ngọc, không phải 20; không mua.`, 'war');
                    return true;
                }
                dungeon.attempts++;
                dungeon.pending = { kind: 'buy', beforeBuyCount: buyCount, startedAt: now };
                try {
                    gc.send18057Msg(1);
                } catch (error) {
                    dungeon.pending = null;
                    failTienMinhStep(state, 'dungeon-buy-error', `Không thể mua lượt Bí Cảnh: ${error.message || error}`, 'war');
                }
                return true;
            }

            const dungeonId = getTienMinhDungeonCurId(ctx, gc);
            if (!Number.isFinite(dungeonId) || dungeonId <= 0 ||
                typeof gc.saveGuildDungeonFightData !== 'function' ||
                typeof gc.send18053Msg !== 'function') {
                failTienMinhStep(state, 'dungeon-fight-api', 'Không tìm thấy API hoặc ải Bí Cảnh Tông Môn hợp lệ để Khiêu Chiến.', 'war');
                return true;
            }
            dungeon.attempts++;
            dungeon.pending = {
                kind: 'fight',
                beforeFightCount: fightCount,
                startedAt: now,
                lastRefreshAt: 0
            };
            try {
                gc.saveGuildDungeonFightData(dungeonId);
                gc.send18053Msg(dungeonId);
            } catch (error) {
                dungeon.pending = null;
                failTienMinhStep(state, 'dungeon-fight-error', `Không thể Khiêu Chiến Bí Cảnh Tông Môn: ${error.message || error}`, 'war');
            }
            return true;
        }

        function removeTienMinhWarStatusListener(state) {
            const war = state && state.war;
            const model = state && state.warCtrl && state.warCtrl.m_curModel;
            const event = war && war.statusEvent;
            if (war && war.statusEventHandler && model &&
                typeof model.removeEventListener === 'function' && event) {
                model.removeEventListener(event, war.statusEventHandler);
            }
            if (war) {
                war.statusEventHandler = null;
                war.statusEvent = null;
            }
        }

        function isTienMinhNeutralCity(city) {
            const guildId = city && city.gldId;
            const cityId = Number(city && city.cityId);
            return Number.isFinite(cityId) && cityId > 0 &&
                guildId &&
                Number(guildId.m_highInt) === 0 &&
                Number(guildId.m_lowInt) === 0;
        }

        function handleTienMinhWar(state, now, ctx) {
            const wr = state.warCtrl;
            if (!wr) {
                skipTienMinhStep(state, 'war-controller-missing', 'Không có bộ điều khiển Tỉ Thí Tông Môn; bỏ qua.', 'asked');
                return true;
            }

            if (!state.war.statusRequested) {
                const model = wr.m_curModel;
                const updateEvent = ctx.GldWrConst && ctx.GldWrConst.BASE_EVT;
                if (typeof wr.send18125 !== 'function' || !model || !updateEvent ||
                    typeof model.addEventListener !== 'function' ||
                    typeof model.removeEventListener !== 'function') {
                    failTienMinhStep(state, 'war-status-api', 'API tải lượt mới nhất của Tỉ Thí Tông Môn chưa sẵn sàng.', 'asked');
                    return true;
                }
                state.war.statusEvent = updateEvent;
                state.war.statusEventHandler = () => {
                    state.war.statusLoaded = true;
                    removeTienMinhWarStatusListener(state);
                };
                try {
                    model.addEventListener(updateEvent, state.war.statusEventHandler);
                    state.war.statusRequested = true;
                    state.war.statusStartedAt = now;
                    wr.send18125();
                } catch (error) {
                    removeTienMinhWarStatusListener(state);
                    failTienMinhStep(state, 'war-status-error', `Không thể tải lượt Tỉ Thí Tông Môn: ${error.message || error}`, 'asked');
                }
                return true;
            }
            if (!state.war.statusLoaded) {
                if (now - state.war.statusStartedAt >= TIEN_MINH_REQUEST_TIMEOUT_MS) {
                    removeTienMinhWarStatusListener(state);
                    failTienMinhStep(state, 'war-status-timeout', 'Máy chủ chưa trả về số lượt mới nhất của Tỉ Thí Tông Môn.', 'asked');
                }
                return true;
            }

            const base = wr.wrBaseDt;
            if (!base) {
                failTienMinhStep(state, 'war-count-state', 'Không đọc được trạng thái Tỉ Thí Tông Môn.', 'asked');
                return true;
            }
            if (base.isOpen !== true && Number(base.isOpen) !== 1) {
                skipTienMinhStep(state, 'war-closed', 'Tỉ Thí Tông Môn hiện chưa mở; bỏ qua lượt Khiêu Chiến.', 'asked');
                return true;
            }

            const doneCount = Number(base.doneNums);
            const maxCount = Number(base.maxNums);
            if (!Number.isFinite(doneCount) || !Number.isFinite(maxCount)) {
                failTienMinhStep(state, 'war-count-state', 'Không đọc được số lượt còn lại của Tỉ Thí Tông Môn.', 'asked');
                return true;
            }
            if (state.war.pending) {
                const pending = state.war.pending;
                if (Number(base.doneNums) > pending.beforeCount) {
                    state.war.pending = null;
                    state.confirmedActions++;
                    const targetType = state.war.targetType === 'other'
                        ? 'thành của Tông Môn khác'
                        : state.war.targetType === 'neutral'
                            ? 'thành trung lập'
                            : 'thành trì đang chiếm';
                    logTienMinh(state, `war-fight-${Number(base.doneNums)}`, `✅ [M8 - Tiên Minh - Tỉ Thí Tông Môn] Máy chủ xác nhận lượt Khiêu Chiến ${Number(base.doneNums)}/${maxCount} tại ${targetType}.`, "action");
                    state.war.fightsDone++;
                    // Chọn lại mục tiêu ngẫu nhiên cho lượt kế tiếp.
                    state.war.city = null;
                    state.war.cityIndex = null;
                    return true;
                } else if (now - pending.startedAt >= TIEN_MINH_REQUEST_TIMEOUT_MS) {
                    state.war.pending = null;
                    failTienMinhStep(state, 'war-fight-timeout', 'Máy chủ chưa xác nhận lượt Tỉ Thí Tông Môn; không gửi lại để tránh lặp trận.', 'asked');
                    return true;
                } else {
                    // Số lượt chỉ cập nhật khi tải lại dữ liệu sau khi trận kết thúc.
                    if (now - pending.startedAt >= 3000 && now - pending.lastRefreshAt >= 2000 &&
                        typeof wr.send18125 === 'function') {
                        pending.lastRefreshAt = now;
                        try {
                            wr.send18125();
                        } catch (error) {
                            // Lần kiểm tra kế tiếp sẽ thử lại cho tới khi hết thời gian chờ.
                        }
                    }
                    return true;
                }
            }

            if (doneCount >= maxCount) {
                if (state.war.fightsDone > 0) {
                    logTienMinh(state, 'war-limit-reached', `✅ [M8 - Tiên Minh - Tỉ Thí Tông Môn] Đã hoàn thành ${doneCount}/${maxCount} lượt Khiêu Chiến trong ngày.`, "action");
                    state.phase = 'asked';
                } else {
                    skipTienMinhStep(state, 'war-no-turns', 'Tỉ Thí Tông Môn đã hết lượt Khiêu Chiến trong ngày.', 'asked');
                }
                return true;
            }

            if (!state.war.requested) {
                if (typeof wr.send18126 !== 'function') {
                    failTienMinhStep(state, 'war-map-api', 'API tải bản đồ Tỉ Thí Tông Môn chưa sẵn sàng.', 'asked');
                    return true;
                }
                try {
                    wr.send18126();
                    state.war.requested = true;
                    state.war.requestStartedAt = now;
                } catch (error) {
                    failTienMinhStep(state, 'war-map-error', `Không thể tải bản đồ Tỉ Thí Tông Môn: ${error.message || error}`, 'asked');
                }
                return true;
            }

            const cities = Array.isArray(wr.cityLs) ? wr.cityLs : [];
            if (!cities.some((city) => city && city.isSelf !== undefined)) {
                if (now - state.war.requestStartedAt >= TIEN_MINH_REQUEST_TIMEOUT_MS) {
                    failTienMinhStep(state, 'war-city-timeout', 'Bản đồ Tỉ Thí chưa trả về trạng thái thành trì đang chiếm.', 'asked');
                }
                return true;
            }

            if (!state.war.city) {
                // Mỗi lượt chọn ngẫu nhiên một thành trì hợp lệ trên bản đồ.
                const candidates = cities
                    .map((city, index) => ({ city, index }))
                    .filter(({ city }) => city && Number.isFinite(Number(city.cityId)) && Number(city.cityId) > 0);
                if (candidates.length === 0) {
                    skipTienMinhStep(state, 'war-no-target-city', 'Bản đồ Tỉ Thí không có thành trì hợp lệ để Khiêu Chiến.', 'asked');
                    return true;
                }
                const selected = candidates[Math.floor(Math.random() * candidates.length)];
                state.war.city = selected.city;
                state.war.cityIndex = selected.index;
                state.war.targetType = (selected.city.isSelf === true || Number(selected.city.isSelf) === 1)
                    ? 'owned'
                    : isTienMinhNeutralCity(selected.city)
                        ? 'neutral'
                        : 'other';
            }

            if (typeof wr.showFightUi !== 'function' ||
                typeof wr.chanllenge !== 'function' ||
                !Number.isFinite(Number(state.war.city.cityId)) ||
                !Number.isFinite(Number(state.war.cityIndex))) {
                failTienMinhStep(state, 'war-challenge-api', 'Không tìm thấy nút Khiêu Chiến hoặc thành trì đang chiếm hợp lệ.', 'asked');
                return true;
            }
            if (wr.isEnter !== true) {
                failTienMinhStep(state, 'war-challenge-unavailable', 'Game chưa cho phép vào giao diện Khiêu Chiến Tỉ Thí Tông Môn; không gửi thao tác.', 'asked');
                return true;
            }
            state.war.pending = {
                beforeCount: doneCount,
                startedAt: now,
                lastRefreshAt: 0
            };
            try {
                wr.cityIdx = state.war.cityIndex;
                wr.showFightUi();
                wr.chanllenge();
            } catch (error) {
                state.war.pending = null;
                failTienMinhStep(state, 'war-challenge-error', `Không thể Khiêu Chiến thành trì đang chiếm: ${error.message || error}`, 'asked');
            }
            return true;
        }

        function handleTienMinhAsked(ctx, state, now) {
            const gc = state.guildCtrl;
            const asked = state.asked;
            const model = gc.m_curModel;
            if (!model || typeof model.getAskedIsOpen !== 'function' ||
                typeof gc.send18140 !== 'function' ||
                typeof gc.canJoinAskedUi !== 'function') {
                failTienMinhStep(state, 'asked-api', 'API kiểm tra/Khiêu Chiến Tông Môn Vấn Đạo chưa sẵn sàng.', 'help');
                return true;
            }

            if (asked.pending) {
                const pending = asked.pending;
                if (model.scmd18144Data !== pending.resultRef) {
                    asked.pending = null;
                    asked.count++;
                    state.confirmedActions++;
                    logTienMinh(state, `asked-fight-${asked.count}`, `✅ [M8 - Tiên Minh - Tông Môn Vấn Đạo] Máy chủ xác nhận lượt Khiêu Chiến ${asked.count}/${TIEN_MINH_ASKED_FIGHTS}.`, "action");
                } else if (now - pending.startedAt >= TIEN_MINH_REQUEST_TIMEOUT_MS) {
                    asked.pending = null;
                    failTienMinhStep(state, 'asked-fight-timeout', 'Máy chủ chưa xác nhận trận Tông Môn Vấn Đạo; không gửi lại để tránh lặp trận.', 'help');
                }
                return true;
            }

            if (!asked.checked) {
                let isOpenToday;
                let residueSeconds = 0;
                try {
                    isOpenToday = model.getAskedIsOpen();
                    if (isOpenToday && typeof model.getAskedMatchResidueTime === 'function') {
                        residueSeconds = Number(model.getAskedMatchResidueTime()) || 0;
                    }
                } catch (error) {
                    failTienMinhStep(state, 'asked-schedule-state', `Không thể kiểm tra lịch mở Tông Môn Vấn Đạo: ${error.message || error}`, 'help');
                    return true;
                }
                if (!isOpenToday) {
                    skipTienMinhStep(state, 'asked-not-scheduled', 'Tông Môn Vấn Đạo không mở theo lịch hôm nay; bỏ qua.', 'help');
                    return true;
                }
                if (residueSeconds > 0) {
                    skipTienMinhStep(state, 'asked-matching', `Tông Môn Vấn Đạo đang ghép đối thủ (còn ${Math.ceil(residueSeconds / 60)} phút); bỏ qua lượt này.`, 'help');
                    return true;
                }
                asked.checked = true;
                asked.loading = { dataRef: model.scmd18140Data, startedAt: now };
                try {
                    gc.send18140(1);
                } catch (error) {
                    asked.loading = null;
                    failTienMinhStep(state, 'asked-open-error', `Không thể tải trạng thái Tông Môn Vấn Đạo: ${error.message || error}`, 'help');
                }
                return true;
            }
            if (asked.loading) {
                if (model.scmd18140Data !== asked.loading.dataRef) {
                    asked.loading = null;
                } else {
                    if (now - asked.loading.startedAt >= TIEN_MINH_REQUEST_TIMEOUT_MS) {
                        asked.loading = null;
                        failTienMinhStep(state, 'asked-state-timeout', 'Không tải được trạng thái Tông Môn Vấn Đạo từ máy chủ.', 'help');
                    }
                    return true;
                }
            }

            if (asked.count >= TIEN_MINH_ASKED_FIGHTS) {
                logTienMinh(state, 'asked-done', `ℹ️ [M8 - Tiên Minh - Tông Môn Vấn Đạo] Đã hoàn thành ${asked.count}/${TIEN_MINH_ASKED_FIGHTS} lượt Khiêu Chiến.`, "info");
                state.phase = 'help';
                return true;
            }

            let canJoin;
            try {
                canJoin = gc.canJoinAskedUi(false);
            } catch (error) {
                failTienMinhStep(state, 'asked-challenge-state', `Không đọc được trạng thái Tông Môn Vấn Đạo: ${error.message || error}`, 'help');
                return true;
            }
            if (!canJoin) {
                skipTienMinhStep(state, 'asked-inactive', 'Tông Môn Vấn Đạo hôm nay chưa có đối thủ hoặc không hoạt động; bỏ qua.', 'help');
                return true;
            }

            const embattleType = ctx.EmbattleConst && ctx.EmbattleConst.embattleType;
            if (!ctx.EmbattleCtrl || !ctx.EmbattleCtrl.gInst || !embattleType ||
                embattleType.guildAsked === undefined) {
                failTienMinhStep(state, 'asked-challenge-api', 'API Khiêu Chiến Tông Môn Vấn Đạo chưa sẵn sàng.', 'help');
                return true;
            }
            const fightCtrl = ctx.FightCtrl && ctx.FightCtrl.gInst ? ctx.FightCtrl.gInst() : null;
            if (fightCtrl && typeof fightCtrl.gCanFight === 'function' && !fightCtrl.gCanFight(0)) {
                asked.blocked = (asked.blocked || 0) + 1;
                if (asked.blocked >= 10) {
                    failTienMinhStep(state, 'asked-blocked', 'Game không cho phép Khiêu Chiến Tông Môn Vấn Đạo lúc này (đang trong trận khác).', 'help');
                }
                return true;
            }
            asked.pending = { resultRef: model.scmd18144Data, startedAt: now };
            try {
                // Giống nút Khiêu Chiến: mở đội hình, sau đó bộ xử lý trận bấm Bắt Đầu.
                ctx.EmbattleCtrl.gInst().openEmbattle(embattleType.guildAsked);
            } catch (error) {
                asked.pending = null;
                failTienMinhStep(state, 'asked-challenge-error', `Không thể Khiêu Chiến Tông Môn Vấn Đạo: ${error.message || error}`, 'help');
            }
            return true;
        }

        function getTienMinhHelpSignature(data) {
            if (!data) return '';
            const mine = Array.isArray(data.my_list)
                ? data.my_list.map((item) => item && [item.pos, item.base_id, item.be_count, item.reward_count])
                : [];
            return JSON.stringify([data.count, data.vip_count, mine, Array.isArray(data.list) ? data.list.length : -1]);
        }

        function getTienMinhHelpEntryKey(entry) {
            const id = entry && entry.id;
            const idKey = id && id.m_highInt !== undefined
                ? `${id.m_highInt}_${id.m_lowInt}`
                : String(id);
            return `${idKey}:${entry && entry.pos}`;
        }

        // Danh mục vật phẩm Xin Giúp lấy từ cấu hình game (không phụ thuộc giao diện đang mở).
        function getTienMinhHelpCategories(gc) {
            const model = gc.m_curModel;
            const cfg = model && typeof model.getGuildConfig === 'function'
                ? model.getGuildConfig()
                : null;
            const raw = cfg && cfg.cfg && cfg.cfg[11] && cfg.cfg[11].val;
            if (typeof raw !== 'string') return [];
            return raw.replace(/[\[\]\s]/g, '').split(',')
                .map(Number)
                .filter((id) => Number.isFinite(id) && id > 0);
        }

        function getTienMinhHelpBoxCount(gc) {
            const model = gc.m_curModel;
            const cfg = model && typeof model.getGuildConfig === 'function'
                ? model.getGuildConfig()
                : null;
            const count = Number(cfg && cfg.cfg && cfg.cfg[9] && cfg.cfg[9].val);
            return Number.isInteger(count) && count > 0 && count <= 4 ? count : 2;
        }

        function handleTienMinhHelp(ctx, state, now) {
            const gc = state.guildCtrl;
            const help = state.help;
            const model = gc.m_curModel;
            const data = model && model.scmd18040Data;
            if (!help.opened) {
                if (typeof gc.openGuildHelpUi !== 'function' ||
                    typeof gc.send18040Msg !== 'function') {
                    failTienMinhStep(state, 'help-open-api', 'API mở/đọc trạng thái Viện Trợ Tông Môn chưa sẵn sàng.', 'fete');
                    return true;
                }
                try {
                    gc.openGuildHelpUi();
                    gc.send18040Msg();
                    help.opened = true;
                    help.openedAt = now;
                } catch (error) {
                    failTienMinhStep(state, 'help-open-error', `Không thể mở Viện Trợ Tông Môn: ${error.message || error}`, 'fete');
                }
                return true;
            }

            if (!data || !Array.isArray(data.my_list) || !Array.isArray(data.list)) {
                if (now - help.openedAt >= TIEN_MINH_REQUEST_TIMEOUT_MS) {
                    failTienMinhStep(state, 'help-state-timeout', 'Không tải được trạng thái Viện Trợ Tông Môn từ máy chủ.', 'fete');
                }
                return true;
            }

            if (help.pending) {
                const pending = help.pending;
                if (pending.kind === 'box') {
                    const placed = data.my_list.some((item) => item && Number(item.pos) === pending.slot);
                    if (placed) {
                        help.pending = null;
                        state.confirmedActions++;
                        logTienMinh(state, `help-box-${pending.slot}`, `✅ [M8 - Tiên Minh - Viện Trợ] Máy chủ xác nhận đã chọn vật phẩm Xin Giúp cho ô ${pending.slot}.`, "action");
                    } else if (now - pending.startedAt >= TIEN_MINH_REQUEST_TIMEOUT_MS) {
                        help.pending = null;
                        help.boxFailed = true;
                        failTienMinhStep(state, `help-box-timeout-${pending.slot}`, `Máy chủ chưa xác nhận Xin Giúp ô ${pending.slot}; không gửi lại để tránh yêu cầu trùng.`, 'help');
                    }
                    return true;
                }
                // pending.kind === 'assist': giúp thành viên (tab Viện trợ tông môn)
                const count = Number(data.count);
                if (Number.isFinite(count) && count > pending.beforeCount) {
                    help.pending = null;
                    help.assisted++;
                    state.confirmedActions++;
                    logTienMinh(state, `help-assist-${help.assisted}`, `✅ [M8 - Tiên Minh - Viện Trợ] Máy chủ xác nhận đã Viện trợ thành viên (${count}/${Number(data.max_count)} lượt miễn phí hôm nay).`, "action");
                } else if (data !== pending.dataRef) {
                    // Máy chủ từ chối và game tải lại danh sách (rv18042 → send18040Msg).
                    help.pending = null;
                    help.assistRejected++;
                } else if (now - pending.startedAt >= TIEN_MINH_REQUEST_TIMEOUT_MS) {
                    help.pending = null;
                    help.assistRejected++;
                }
                return true;
            }

            // Bước 1: điền đủ các ô (hộp) Xin Giúp.
            const boxCount = getTienMinhHelpBoxCount(gc);
            for (let slot = 1; slot <= boxCount && !help.boxFailed; slot++) {
                if (data.my_list.some((item) => item && Number(item.pos) === slot)) continue;
                if (typeof gc.send18041Msg !== 'function') {
                    failTienMinhStep(state, 'help-action-api', 'API chọn vật phẩm Xin Giúp chưa sẵn sàng.', 'help');
                    help.boxFailed = true;
                    return true;
                }
                const usedIds = new Set(data.my_list.map((item) => Number(item && item.base_id)));
                const options = getTienMinhHelpCategories(gc).filter((id) => !usedIds.has(id));
                if (options.length === 0) {
                    help.boxFailed = true;
                    failTienMinhStep(state, `help-options-${slot}`, `Không có vật phẩm Xin Giúp khả dụng, không trùng cho ô ${slot}.`, 'help');
                    return true;
                }
                const baseId = options[Math.floor(Math.random() * options.length)];
                help.pending = { kind: 'box', slot, startedAt: now };
                try {
                    gc.send18041Msg(slot, baseId);
                } catch (error) {
                    help.pending = null;
                    help.boxFailed = true;
                    failTienMinhStep(state, `help-box-error-${slot}`, `Không thể chọn vật phẩm Xin Giúp ô ${slot}: ${error.message || error}`, 'help');
                }
                return true;
            }
            if (!help.boxesLogged) {
                help.boxesLogged = true;
                if (!help.boxFailed) {
                    logTienMinh(state, 'help-boxes-ready', `ℹ️ [M8 - Tiên Minh - Xin Giúp] Cả ${boxCount} ô Xin Giúp đã được cấu hình.`, "info");
                }
            }

            // Bước 2: Viện trợ thành viên khác trong giới hạn lượt miễn phí.
            const count = Number(data.count);
            const maxCount = Number(data.max_count);
            if (!Number.isFinite(count) || !Number.isFinite(maxCount)) {
                failTienMinhStep(state, 'help-count-state', 'Không đọc được giới hạn lượt Viện Trợ Tông Môn.', 'fete');
                return true;
            }
            if (count >= maxCount) {
                skipTienMinhStep(state, 'help-limit', `Đã dùng hết ${count}/${maxCount} lượt Viện trợ miễn phí trong ngày.`, 'fete');
                return true;
            }
            const target = data.list.find((entry) => entry &&
                !help.attempted.has(getTienMinhHelpEntryKey(entry)) &&
                Number(entry.be_count) < Number(entry.max_count));
            if (!target) {
                if (help.assisted > 0) {
                    logTienMinh(state, 'help-assist-done', `ℹ️ [M8 - Tiên Minh - Viện Trợ] Đã Viện trợ ${help.assisted} lượt, hết yêu cầu có thể giúp (${count}/${maxCount} lượt miễn phí).`, "info");
                    state.phase = 'fete';
                } else if (help.assistRejected > 0) {
                    skipTienMinhStep(state, 'help-all-rejected', `Máy chủ không nhận ${help.assistRejected} yêu cầu Viện trợ (có thể đã giúp trước đó); không thử lại.`, 'fete');
                } else {
                    skipTienMinhStep(state, 'help-no-requests', 'Không có thành viên nào cần Viện trợ Tông Môn.', 'fete');
                }
                return true;
            }
            if (typeof gc.send18042Msg !== 'function') {
                failTienMinhStep(state, 'help-assist-api', 'API Viện trợ thành viên chưa sẵn sàng.', 'fete');
                return true;
            }
            help.attempted.add(getTienMinhHelpEntryKey(target));
            help.pending = { kind: 'assist', beforeCount: count, dataRef: data, startedAt: now };
            try {
                gc.send18042Msg(target.id, target.pos);
            } catch (error) {
                help.pending = null;
                failTienMinhStep(state, 'help-assist-error', `Không thể Viện trợ thành viên: ${error.message || error}`, 'fete');
            }
            return true;
        }

        function getTienMinhFeteSignature(data) {
            if (!data) return '';
            return JSON.stringify([
                data.fate_type,
                data.fate_num,
                Array.isArray(data.raward_list) ? data.raward_list.length : -1
            ]);
        }

        function handleTienMinhFete(ctx, state, now) {
            const gc = state.guildCtrl;
            const fete = state.fete;
            const data = gc.m_curModel && gc.m_curModel.scmd18035Data;
            const manager = ctx.ViewMgr && ctx.ViewMgr.gViewMgr;
            const cache = manager && manager.m_viewCacheGroup;
            const view = cache && cache.guildFeteUi;
            const button = view && view.feteBtnGroup1;

            if (fete.pending) {
                const pending = fete.pending;
                if (getTienMinhFeteSignature(data) !== pending.signature ||
                    (button && button.visible === false)) {
                    fete.pending = null;
                    state.confirmedActions++;
                    logTienMinh(state, 'fete-confirmed', "✅ [M8 - Tiên Minh - Tổ Sư Đường] Máy chủ xác nhận đã Cung phụng Dâng Tôn Sư.", "action");
                    state.phase = 'done';
                } else if (now - pending.startedAt >= TIEN_MINH_REQUEST_TIMEOUT_MS) {
                    failTienMinhStep(state, 'fete-timeout', 'Máy chủ chưa xác nhận Cung phụng Dâng Tôn Sư.', 'done');
                }
                return true;
            }

            if (!fete.opened) {
                if (typeof gc.openGuildFeteUi !== 'function' ||
                    typeof gc.send18035Msg !== 'function') {
                    failTienMinhStep(state, 'fete-open-api', 'API mở Tổ Sư Đường chưa sẵn sàng.', 'done');
                    return true;
                }
                try {
                    gc.openGuildFeteUi();
                    gc.send18035Msg();
                    fete.opened = true;
                    fete.openedAt = now;
                } catch (error) {
                    failTienMinhStep(state, 'fete-open-error', `Không thể mở Tổ Sư Đường: ${error.message || error}`, 'done');
                }
                return true;
            }
            if (!data || !button) {
                if (now - fete.openedAt >= TIEN_MINH_REQUEST_TIMEOUT_MS) {
                    failTienMinhStep(state, 'fete-state-timeout', 'Không tải được trạng thái Cung phụng Dâng Tôn Sư.', 'done');
                }
                return true;
            }
            if (button.visible !== true || button.enabled === false || button.touchEnabled === false) {
                skipTienMinhStep(state, 'fete-already-done', 'Cung phụng Dâng Tôn Sư không còn khả dụng hoặc đã hoàn tất.', 'done');
                return true;
            }
            if (typeof gc.send18036Msg !== 'function') {
                failTienMinhStep(state, 'fete-action-api', 'API Cung phụng Dâng Tôn Sư chưa sẵn sàng.', 'done');
                return true;
            }
            fete.pending = {
                signature: getTienMinhFeteSignature(data),
                startedAt: now
            };
            try {
                gc.send18036Msg(1);
            } catch (error) {
                fete.pending = null;
                failTienMinhStep(state, 'fete-action-error', `Không thể Cung phụng Dâng Tôn Sư: ${error.message || error}`, 'done');
            }
            return true;
        }

        function finishTienMinh(state) {
            if (state.finalized) return;
            if (state.fete.opened && !state.fete.closeAttempted) {
                state.fete.closeAttempted = true;
                if (typeof state.guildCtrl.closeGuildFeteUi !== 'function') {
                    state.failed = true;
                    logTienMinh(state, 'fete-close-api', 'Không thể đóng giao diện Tổ Sư Đường sau khi hoàn tất vì API đóng giao diện chưa sẵn sàng.', "err");
                } else {
                    try {
                        state.guildCtrl.closeGuildFeteUi();
                    } catch (error) {
                        state.failed = true;
                        logTienMinh(state, 'fete-close-error', `Không thể đóng giao diện Tổ Sư Đường sau khi hoàn tất: ${error.message || error}`, "err");
                    }
                }
            }
            state.phase = 'done';
            state.finalized = true;
            if (state.failed) {
                sendLog(`⚠️ [M8 - Tiên Minh] Đã kiểm tra xong; ${state.confirmedActions} thao tác được xác nhận, ${state.skippedSteps} bước đã bỏ qua. Có bước chưa được máy chủ xác nhận.`, "err");
            } else if (state.confirmedActions > 0) {
                sendLog(`✅ [M8 - Tiên Minh] Đã kiểm tra xong; máy chủ xác nhận ${state.confirmedActions} thao tác, ${state.skippedSteps} bước đã hoàn tất/không khả dụng.`, "action");
            } else {
                sendLog(`ℹ️ [M8 - Tiên Minh] Đã kiểm tra trạng thái; không có thao tác nào cần thực hiện (${state.skippedSteps} bước đã hoàn tất/không khả dụng).`, "info");
            }
        }

        function isTienMinhFighting(ctx) {
            try {
                return !!(ctx.EntityMgr && ctx.EntityMgr.gInst && ctx.EntityMgr.gInst().getIsFighting());
            } catch (error) {
                return false;
            }
        }

        function getTienMinhPendings(state) {
            return [state.dungeon.pending, state.war.pending, state.asked.pending].filter(Boolean);
        }

        // Chờ trận đánh kết thúc, tự bấm Bắt Đầu ở bảng đội hình và đóng bảng kết quả.
        // Trả về true nếu bước này đã chiếm lượt xử lý hiện tại.
        function handleTienMinhBattle(ctx, state, now) {
            const pendings = getTienMinhPendings(state);
            if (pendings.length === 0) {
                // Bảng đội hình còn sót lại sau khi hết lượt: đóng lại, không bấm Bắt Đầu nữa.
                const leftoverVm = ctx.ViewMgr && ctx.ViewMgr.gInst ? ctx.ViewMgr.gInst() : null;
                if (leftoverVm && typeof leftoverVm.viewIsVisible === 'function' &&
                    !isTienMinhFighting(ctx) && leftoverVm.viewIsVisible('embattleUi')) {
                    leftoverVm.closeView('embattleUi');
                    logTienMinh(state, 'battle-embattle-leftover', "ℹ️ [M8 - Tiên Minh] Đã đóng bảng đội hình còn mở sau khi hết lượt Khiêu Chiến.", "info");
                    return true;
                }
                return false;
            }

            if (isTienMinhFighting(ctx)) {
                if (!state.fightingSince) {
                    state.fightingSince = now;
                    logTienMinh(state, `battle-start-${state.confirmedActions}-${now}`, "ℹ️ [M8 - Tiên Minh] Đang trong trận đánh; chờ trận kết thúc (tự bỏ qua hoạt ảnh).", "info");
                }
                if (now - state.fightingSince < TIEN_MINH_FIGHT_MAX_WAIT_MS) {
                    // Thời gian đánh không tính vào thời gian chờ xác nhận của máy chủ.
                    pendings.forEach((pending) => { pending.startedAt = now; });
                    return true;
                }
                return false;
            }
            state.fightingSince = 0;

            const vm = ctx.ViewMgr && ctx.ViewMgr.gInst ? ctx.ViewMgr.gInst() : null;
            if (!vm || typeof vm.viewIsVisible !== 'function') return false;

            let acted = false;
            if (vm.viewIsVisible('embattleUi') && now - (state.lastEmbattleAt || 0) >= 2500) {
                const embattleUi = typeof vm.getViewByName === 'function' ? vm.getViewByName('embattleUi') : null;
                if (embattleUi && typeof embattleUi.cBtnH2 === 'function') {
                    try {
                        if (typeof embattleUi.oneKeyEmbattleLogic === 'function') embattleUi.oneKeyEmbattleLogic(0);
                        if (typeof embattleUi.saveEmbattleLogic === 'function') embattleUi.saveEmbattleLogic();
                        embattleUi.cBtnH2();
                        state.lastEmbattleAt = now;
                        state.embattleClicks = (state.embattleClicks || 0) + 1;
                        logTienMinh(state, `battle-embattle-${state.embattleClicks}`, "ℹ️ [M8 - Tiên Minh] Đã tự chọn đội hình và bấm Bắt Đầu.", "info");
                        acted = true;
                    } catch (error) {
                        logTienMinh(state, 'battle-embattle-error', `⚠️ [M8 - Tiên Minh] Không thể bấm Bắt Đầu ở bảng đội hình: ${error.message || error}`, "err");
                    }
                }
            }
            ['fightSuccessUi', 'fightFailUi', 'winUi', 'fightWinUi', 'fightResultUi',
                'adventureResultUi', 'guildAskedFightResultUi'].forEach((name) => {
                if (vm.viewIsVisible(name)) {
                    vm.closeView(name);
                    acted = true;
                }
            });
            return acted;
        }

        function handleTienMinh(ctx) {
            const gc = ctx.GuildCtrl && ctx.GuildCtrl.gInst
                ? ctx.GuildCtrl.gInst()
                : null;
            const wr = ctx.GldWrCtrl && ctx.GldWrCtrl.gInst
                ? ctx.GldWrCtrl.gInst()
                : null;
            if (!gc) {
                if (!tienMinhControllerUnavailableLogged) {
                    tienMinhControllerUnavailableLogged = true;
                    sendLog("⚠️ [M8 - Tiên Minh] Không tìm thấy bộ điều khiển Bang Hội; chưa thể chạy các công việc.", "err");
                }
                return true;
            }
            tienMinhControllerUnavailableLogged = false;

            const dayKey = new Date().toDateString();
            if (!tienMinhState || tienMinhState.dayKey !== dayKey ||
                tienMinhState.guildCtrl !== gc) {
                if (tienMinhState && tienMinhState.dayKey === dayKey && tienMinhState.guildCtrl !== gc) {
                    sendLog("ℹ️ [M8 - Tiên Minh] Game đã khởi động lại/kết nối lại; kiểm tra lại trạng thái từ máy chủ trước khi tiếp tục (không lặp thao tác đã hoàn tất).", "info");
                }
                tienMinhState = createTienMinhState(gc, wr);
            }
            const state = tienMinhState;
            if (!state.warCtrl && wr) state.warCtrl = wr;
            if (state.phase === 'done') {
                finishTienMinh(state);
                return true;
            }

            if (typeof gc.checkIsHaveGuild === 'function' && !gc.checkIsHaveGuild()) {
                skipTienMinhStep(state, 'no-guild', 'Nhân vật chưa thuộc Tông Môn/Bang Hội; không có công việc Tiên Minh để làm.', 'done');
                finishTienMinh(state);
                return true;
            }

            if (handleTienMinhBattle(ctx, state, Date.now())) return true;

            if (state.phase === 'bargain') return handleTienMinhBargain(state, Date.now());
            if (state.phase === 'dungeon') return handleTienMinhDungeon(ctx, state, Date.now());
            if (state.phase === 'war') return handleTienMinhWar(state, Date.now(), ctx);
            if (state.phase === 'asked') return handleTienMinhAsked(ctx, state, Date.now());
            if (state.phase === 'help') return handleTienMinhHelp(ctx, state, Date.now());
            if (state.phase === 'fete') return handleTienMinhFete(ctx, state, Date.now());
            if (state.phase === 'done') {
                finishTienMinh(state);
                return true;
            }
            failTienMinhStep(state, 'unknown-phase', `Giai đoạn xử lý không hợp lệ: ${state.phase}.`, 'done');
            finishTienMinh(state);
            return true;
        }

        // ---- Trợ Chiến Linh Thú: Linh Thú -> tab Hoan Thú Viên (garden), nút Nhận nhanh bên ngoài (SpiritAnimalCtrl.send32022) ----
        function failTroChien(ctx, state, key, message) {
            state.failed = true;
            state.phase = 'done';
            closeTroChienView(ctx);
            if (state.loggedErrors.has(key)) return;
            state.loggedErrors.add(key);
            sendLog(`⚠️ [M8 - Trợ Chiến] ${message}`, "err");
        }

        function closeTroChienView(ctx) {
            try {
                const ctrl = ctx.SpiritAnimalCtrl && ctx.SpiritAnimalCtrl.gInst ? ctx.SpiritAnimalCtrl.gInst() : null;
                if (ctrl && typeof ctrl.closeSpiritAnimalMainUi === 'function') ctrl.closeSpiritAnimalMainUi();
            } catch (error) { }
        }

        function handleTroChien(ctx) {
            const ctrl = ctx.SpiritAnimalCtrl && ctx.SpiritAnimalCtrl.gInst
                ? ctx.SpiritAnimalCtrl.gInst()
                : null;
            if (!ctrl) {
                if (!troChienControllerUnavailableLogged) {
                    troChienControllerUnavailableLogged = true;
                    sendLog("⚠️ [M8 - Trợ Chiến] Không tìm thấy bộ điều khiển Linh Thú; chưa thể chạy.", "err");
                }
                return true;
            }
            troChienControllerUnavailableLogged = false;

            const dayKey = new Date().toDateString();
            if (!troChienState || troChienState.dayKey !== dayKey || troChienState.ctrl !== ctrl) {
                if (troChienState && troChienState.dayKey === dayKey && troChienState.ctrl !== ctrl) {
                    sendLog("ℹ️ [M8 - Trợ Chiến] Game đã khởi động lại/kết nối lại; kiểm tra lại trạng thái từ máy chủ trước khi nhận.", "info");
                }
                troChienState = {
                    dayKey, ctrl, phase: 'open', failed: false, loggedErrors: new Set(),
                    dataBefore: null, requestedAt: 0, lastRefreshAt: 0, claimedAt: 0
                };
            }
            const state = troChienState;
            if (state.phase === 'done') return true;

            const indexes = ctx.SpiritAnimalConst && ctx.SpiritAnimalConst.SpiritAnimalMainIndexId;
            if (typeof ctrl.openSpiritAnimalMainUi !== 'function' ||
                typeof ctrl.getSC_32019 !== 'function' ||
                typeof ctrl.isCanGetHomeTypeProduceReward !== 'function' ||
                typeof ctrl.send32019 !== 'function' || typeof ctrl.send32022 !== 'function' ||
                !indexes || !Number.isFinite(indexes.garden)) {
                failTroChien(ctx, state, 'api', 'API Hoan Thú Viên chưa sẵn sàng; không thể nhận nhanh.');
                return true;
            }

            if (state.phase === 'open') {
                state.dataBefore = ctrl.getSC_32019();
                state.requestedAt = Date.now();
                ctrl.openSpiritAnimalMainUi(indexes.garden);
                ctrl.send32019();
                state.phase = 'load';
                sendLog("ℹ️ [M8 - Trợ Chiến] Đã mở Linh Thú → Hoan Thú Viên; đang tải trạng thái từ máy chủ.", "info");
                return true;
            }

            if (state.phase === 'load') {
                const data = ctrl.getSC_32019();
                if (data && data !== state.dataBefore) {
                    state.phase = 'claim';
                } else if (Date.now() - state.requestedAt >= TRO_CHIEN_REQUEST_TIMEOUT_MS) {
                    failTroChien(ctx, state, 'load-timeout', 'Hết thời gian chờ trạng thái Hoan Thú Viên từ máy chủ; không xác nhận đã nhận.');
                    return true;
                } else {
                    return true;
                }
            }

            if (state.phase === 'claim') {
                if (!ctrl.isCanGetHomeTypeProduceReward()) {
                    sendLog("ℹ️ [M8 - Trợ Chiến] Hoan Thú Viên không có tài nguyên chờ nhận; bỏ qua.", "info");
                    state.phase = 'done';
                    closeTroChienView(ctx);
                    return true;
                }
                ctrl.send32022();
                state.claimedAt = state.lastRefreshAt = Date.now();
                state.phase = 'confirm';
                sendLog("ℹ️ [M8 - Trợ Chiến] Đã bấm Nhận nhanh ở Hoan Thú Viên; đang chờ máy chủ xác nhận.", "info");
                return true;
            }

            if (state.phase === 'confirm') {
                const now = Date.now();
                if (!ctrl.isCanGetHomeTypeProduceReward()) {
                    sendLog("✅ [M8 - Trợ Chiến] Máy chủ xác nhận đã nhận nhanh tài nguyên Hoan Thú Viên.", "action");
                    state.phase = 'done';
                    closeTroChienView(ctx);
                } else if (now - state.claimedAt >= TRO_CHIEN_REQUEST_TIMEOUT_MS) {
                    failTroChien(ctx, state, 'claim-timeout', 'Máy chủ chưa xác nhận Nhận nhanh Hoan Thú Viên; không gửi lại để tránh nhận trùng.');
                } else if (now - state.lastRefreshAt >= 2000) {
                    state.lastRefreshAt = now;
                    ctrl.send32019();
                }
                return true;
            }

            failTroChien(ctx, state, 'unknown-phase', `Giai đoạn xử lý không hợp lệ: ${state.phase}.`);
            return true;
        }

        function handleDailyRoutine(ctx) {
            try {
                // 1. Trợ chiến linh thú
                if (CONFIG.activeFeature === 'autoTroChien') {
                    return handleTroChien(ctx);
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
                if (CONFIG.activeFeature === 'autoTienMinh') {
                    return handleTienMinh(ctx);
                }
                // 5. Cuối Ngày (Thư, Like BXH, Sôi Nổi)
                if (CONFIG.activeFeature === 'autoCuoiNgay') {
                    return handleCuoiNgay(ctx);
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
        const CUOI_NGAY_ACTION_INTERVAL_MS = 800;

        function executeCycle(isManualOnce = false) {
            if (!CONFIG.running && !isManualOnce) {
                wasAutoRunning = false;
                return;
            }
            if (isExecuting) return;

            if (CONFIG.running && !wasAutoRunning) {
                wasAutoRunning = true;
                if (CONFIG.activeFeature === 'autoTongTian' && CONFIG.towerDailyRoutine) {
                    if (towerDailyState && towerDailyState.phase === 'done' && towerDailyState.failed &&
                        towerDailyState.dayKey === new Date().toDateString()) {
                        towerDailyState = null;
                        sendLog("ℹ️ [M1 - Quét mỗi ngày] Lần chạy trước có bước chưa hoàn tất; bắt đầu lại và kiểm tra trạng thái game.", "info");
                    } else if (towerDailyState && towerDailyState.phase === 'done' &&
                        towerDailyState.dayKey === new Date().toDateString()) {
                        sendLog("ℹ️ [M1 - Quét mỗi ngày] Hôm nay đã hoàn tất; không lặp lại, chỉ chạy bỏ qua Thông Thiên Tháp.", "info");
                    } else {
                        sendLog("ℹ️ [M1 - Quét mỗi ngày] Auto đã bắt đầu/khởi động lại; đang kiểm tra số lượt từ game trước khi quét.", "info");
                    }
                }
                if (CONFIG.activeFeature === 'autoTamTienDai' &&
                    tamTienDaiState && tamTienDaiState.phase === 'done') {
                    sendLog("ℹ️ [M8 - Tâm Tiên Đài] Lượt xử lý hôm nay đã hoàn tất trước đó; không nhận hoặc mua lại quà.", "info");
                }
                if (CONFIG.activeFeature === 'autoTienHuu' &&
                    tienHuuState && tienHuuState.phase === 'done' &&
                    tienHuuState.dayKey === new Date().toDateString()) {
                    sendLog("ℹ️ [M8 - Tiên Hữu] Tặng nhanh hôm nay đã hoàn tất; không gửi lại.", "info");
                }
                if (CONFIG.activeFeature === 'autoTienMinh') {
                    if (tienMinhState && tienMinhState.phase === 'done' && tienMinhState.failed &&
                        tienMinhState.dayKey === new Date().toDateString()) {
                        // Lần chạy trước có bước lỗi/chưa xác nhận: kiểm tra lại từ máy chủ (bước đã xong sẽ tự bỏ qua).
                        tienMinhState = null;
                        sendLog("ℹ️ [M8 - Tiên Minh] Lần chạy trước có bước chưa hoàn tất; bắt đầu lại và kiểm tra trạng thái game.", "info");
                    } else if (tienMinhState && tienMinhState.phase === 'done' &&
                        tienMinhState.dayKey === new Date().toDateString()) {
                        sendLog("ℹ️ [M8 - Tiên Minh] Trạng thái hôm nay đã được kiểm tra; không lặp lại thao tác.", "info");
                    } else {
                        sendLog("ℹ️ [M8 - Tiên Minh] Auto đã bắt đầu/khởi động lại; đang kiểm tra trạng thái game trước khi tiếp tục.", "info");
                    }
                }
                if (CONFIG.activeFeature === 'autoTroChien') {
                    if (troChienState && troChienState.phase === 'done' && troChienState.failed &&
                        troChienState.dayKey === new Date().toDateString()) {
                        troChienState = null;
                        sendLog("ℹ️ [M8 - Trợ Chiến] Lần chạy trước chưa hoàn tất; bắt đầu lại và kiểm tra trạng thái game.", "info");
                    } else if (troChienState && troChienState.phase === 'done' &&
                        troChienState.dayKey === new Date().toDateString()) {
                        sendLog("ℹ️ [M8 - Trợ Chiến] Hôm nay đã kiểm tra/nhận; không gửi lại thao tác.", "info");
                    } else {
                        sendLog("ℹ️ [M8 - Trợ Chiến] Auto đã bắt đầu/khởi động lại; đang kiểm tra trạng thái game trước khi nhận.", "info");
                    }
                }
                if (CONFIG.activeFeature === 'autoCuoiNgay') {
                    if (cuoiNgayState && cuoiNgayState.phase === 'done' &&
                        cuoiNgayState.dayKey === new Date().toDateString()) {
                        sendLog("ℹ️ [M8 - Cuối Ngày] Trạng thái hôm nay đã được kiểm tra; không lặp lại thao tác.", "info");
                    } else {
                        sendLog("ℹ️ [M8 - Cuối Ngày] Auto đã bắt đầu/khởi động lại; đang kiểm tra trạng thái game trước khi nhận.", "info");
                    }
                }
            }

            const now = Date.now();
            const active = CONFIG.activeFeature;
            const actionInterval = active === 'autoCuoiNgay'
                ? CUOI_NGAY_ACTION_INTERVAL_MS
                : (CONFIG.intervalMs || 1200);
            if (now - lastActionTime < actionInterval) return;

            isExecuting = true;
            try {
                const ctx = window;
                if (!ctx.DailyDungeonCtrl && !ctx.TowerCtrl && !ctx.CampCtrl && !ctx.WJCtrl &&
                    !ctx.GodWeaponCtrl && !ctx.HangupCtrl && !ctx.WelfareCtrl && !ctx.RecruitCtrl &&
                    !ctx.FriendCtrl && !ctx.EmailCtrl && !ctx.RankCtrl && !ctx.AcvCtrl &&
                    !ctx.GuildCtrl && !ctx.GldWrCtrl && !ctx.SpiritAnimalCtrl &&
                    CONFIG.activeFeature !== 'autoTienMinh') return;

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
                // 1. ĐẠO THÀNH: Đấu Tiên Đài
                if (active === 'autoArena' || (CONFIG.autoArena && !active)) {
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
