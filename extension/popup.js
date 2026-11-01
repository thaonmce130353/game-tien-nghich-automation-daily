const GAME_URL = 'https://tiennghich.joyplay.vn/play';

document.addEventListener('DOMContentLoaded', () => {
    const openGameButton = document.getElementById('btn-open-game');
    const status = document.getElementById('popup-status');

    function showPanelReady() {
        openGameButton.hidden = true;
        status.textContent = 'Bảng tính năng đã mở';
    }

    function checkGamePanel(tabs, index = 0, hadError = false) {
        if (index >= tabs.length) {
            if (hadError) status.textContent = 'Không thể kiểm tra trạng thái bảng tính năng.';
            return;
        }

        const tab = tabs[index];
        if (!Number.isInteger(tab.id)) {
            checkGamePanel(tabs, index + 1, hadError);
            return;
        }

        chrome.scripting.executeScript({
            target: { tabId: tab.id, frameIds: [0] },
            world: 'MAIN',
            func: () => Boolean(document.getElementById('tn-auto-hud'))
        }, (results) => {
            if (chrome.runtime.lastError) {
                checkGamePanel(tabs, index + 1, true);
                return;
            }

            if (results && results[0] && results[0].result) {
                showPanelReady();
                return;
            }

            checkGamePanel(tabs, index + 1, hadError);
        });
    }

    if (chrome.tabs && chrome.scripting) {
        chrome.tabs.query({
            url: [
                '*://tiennghich.joyplay.vn/*',
                '*://tiennghich.acejoygame.com/*'
            ]
        }, (tabs) => {
            if (chrome.runtime.lastError) {
                status.textContent = 'Không thể kiểm tra trạng thái bảng tính năng.';
                return;
            }
            checkGamePanel(tabs);
        });
    }

    openGameButton.addEventListener('click', () => {
        if (!chrome.tabs) {
            status.textContent = 'Không thể mở tab game từ trình duyệt này.';
            return;
        }

        chrome.tabs.query({ url: '*://tiennghich.joyplay.vn/*' }, (tabs) => {
            const existingTab = tabs.find((tab) => Number.isInteger(tab.id));
            if (existingTab) {
                chrome.tabs.update(existingTab.id, { active: true, url: GAME_URL }, () => {
                    if (chrome.runtime.lastError) {
                        status.textContent = 'Không thể chuyển đến tab game.';
                        return;
                    }
                    window.close();
                });
                return;
            }

            chrome.tabs.create({ url: GAME_URL }, () => {
                if (chrome.runtime.lastError) {
                    status.textContent = 'Không thể mở tab game.';
                    return;
                }
                window.close();
            });
        });
    });
});
