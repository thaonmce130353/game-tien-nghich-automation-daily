
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
                maDao: document.getElementById('tn-tab-panel-ma-dao'),
                banner: document.getElementById('tn-tab-panel-banner')
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
                    sendCommandToGame('UPDATE_CONFIG', { config: CONFIG });
                    addLogToUI(CONFIG.autoSkipFight ? "⏩ Bật bỏ qua trận đấu thần tốc!" : "⏸️ Tắt bỏ qua trận đấu", "info");
                });
            }

            const speedEl = document.getElementById('tn-opt-speed');
            if (speedEl) {
                speedEl.checked = Boolean(CONFIG.maxSpeed);
                speedEl.addEventListener('change', (e) => {
                    CONFIG.maxSpeed = e.target.checked;
                    sendCommandToGame('UPDATE_CONFIG', { config: CONFIG });
                });
            }

            const reconnectEl = document.getElementById('tn-opt-reconnect');
            if (reconnectEl) {
                reconnectEl.checked = Boolean(CONFIG.autoReconnect);
                reconnectEl.addEventListener('change', (e) => {
                    CONFIG.autoReconnect = e.target.checked;
                    sendCommandToGame('UPDATE_CONFIG', { config: CONFIG });
                    addLogToUI(
                        CONFIG.autoReconnect
                            ? "🟢 Đã bật tự vào lại game khi bị ngắt kết nối."
                            : "⏸️ Đã tắt tự vào lại game khi bị ngắt kết nối.",
                        "info"
                    );
                });
            }

            const buyTamTienGiftsEl = document.getElementById('tn-opt-buy-tam-tien-gifts');
            if (buyTamTienGiftsEl) {
                buyTamTienGiftsEl.checked = Boolean(CONFIG.buyTamTienGifts);
                buyTamTienGiftsEl.addEventListener('change', (e) => {
                    CONFIG.buyTamTienGifts = e.target.checked;
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
                    sendCommandToGame('UPDATE_CONFIG', { config: CONFIG });
                });
            }

            const btnMain = document.getElementById('tn-btn-main');
            if (btnMain) {
                btnMain.addEventListener('click', () => {
                    if (!CONFIG.running && !hasRunnableSelection()) {
                        addLogToUI("⚠️ Hãy chọn ít nhất 1 tính năng (hoặc tick 1 banner ở tab Banner) trước khi bắt đầu.", "warn");
                        return;
                    }
                    CONFIG.running = !CONFIG.running;
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
