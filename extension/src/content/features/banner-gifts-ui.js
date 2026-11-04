    // =========================================================================
    // SỰ KIỆN ĐANG MỞ: tab điều khiển ở cửa sổ trên cùng (một tính năng "Tướng Thần Lâm / Đạp Thiên" cho mọi banner đang mở)
    // =========================================================================
    const BANNER_REQ_SOURCE = 'TIEN_NGHICH_AUTO_BANNER_REQ';
    const BANNER_RES_SOURCE = 'TIEN_NGHICH_AUTO_BANNER_RES';
    const BANNER_POLL_MS = 30000;

    if (isTopWindow) {
        let bannerUiBuilt = false;

        function bannerUiPost(message) {
            document.querySelectorAll('iframe').forEach((f) => {
                try { f.contentWindow.postMessage(message, '*'); } catch (e) { }
            });
            try { window.postMessage(message, '*'); } catch (e) { }
        }

        function bannerUiLog(message, logType) {
            try {
                window.postMessage({ source: 'TIEN_NGHICH_AUTO_GAME', action: 'LOG', message, logType: logType || 'info' }, '*');
            } catch (e) { }
        }

        function bannerUiRequest() {
            bannerUiPost({ source: BANNER_REQ_SOURCE });
        }

        function bannerUiFormatRemain(sec) {
            const s = sec > 1e9 ? sec / 1000 : sec;
            if (!(s > 0)) return 'đã đóng';
            return 'còn ' + Math.floor(s / 86400) + 'd ' + Math.floor(s % 86400 / 3600) + 'h';
        }

        // Trạng thái tải: vòng xoay + khung xương cho danh sách banner hero, vòng xoay cho dòng thông tin banner skin.
        const BANNER_UI_LOADING_MAX_MS = 8000;
        const BANNER_UI_MIN_LOADING_MS = 600;
        let bannerUiLoadingTimer = null;

        function bannerUiSpinnerText(text) {
            const frag = document.createDocumentFragment();
            const spin = document.createElement('span');
            spin.className = 'tn-spin';
            frag.append(spin, document.createTextNode(text));
            return frag;
        }

        function bannerUiBuild() {
            if (bannerUiBuilt) return true;
            const holder = document.getElementById('tn-banner-extra');
            if (!holder) return false;
            bannerUiBuilt = true;

            // Danh sách banner đang mở: nằm dưới tính năng, chỉ để xem.
            const bar = document.createElement('div');
            bar.style.cssText = 'display:flex;gap:6px;align-items:center;margin:0 0 0 10px;';
            const refresh = document.createElement('button');
            refresh.textContent = 'Tải lại danh sách';
            refresh.style.cssText = 'background:#45475a;color:#cdd6f4;border:0;border-radius:4px;padding:3px 8px;cursor:pointer;font-size:10px;';
            const status = document.createElement('span');
            status.style.cssText = 'font-size:10px;color:#a6adc8;';
            status.textContent = 'Đang tải...';
            bar.append(refresh, status);

            const listBox = document.createElement('div');
            listBox.style.cssText = 'display:flex;flex-direction:column;gap:5px;margin-left:10px;';

            const skinLine = () => document.querySelector('.tn-feat-cfg[data-cfg-for="autoSkinBanner"]');

            // Bắt đầu tải: hiện hiệu ứng; không có phản hồi từ game sau BANNER_UI_LOADING_MAX_MS thì dừng hiệu ứng và báo chưa có dữ liệu.
            let loadingStartedAt = 0;
            function setLoading() {
                loadingStartedAt = Date.now();
                status.textContent = '';
                status.appendChild(bannerUiSpinnerText('Đang tải banner...'));
                listBox.textContent = '';
                for (let i = 0; i < 2; i++) {
                    const sk = document.createElement('div');
                    sk.className = 'tn-skeleton';
                    sk.append(document.createElement('i'), document.createElement('i'));
                    listBox.appendChild(sk);
                }
                const line = skinLine();
                if (line) { line.textContent = ''; line.appendChild(bannerUiSpinnerText('Đang tải sự kiện skin...')); }
                // Quá lâu chưa có dữ liệu (đang ở màn đăng nhập...): giữ hiệu ứng nhưng đổi lời cho rõ ràng.
                clearTimeout(bannerUiLoadingTimer);
                bannerUiLoadingTimer = setTimeout(() => {
                    if (listBox.querySelector('.tn-skeleton')) { status.textContent = ''; status.appendChild(bannerUiSpinnerText('Đang chờ game tải dữ liệu banner...')); }
                    const l = skinLine();
                    if (l && l.querySelector('.tn-spin')) { l.textContent = ''; l.appendChild(bannerUiSpinnerText('Đang chờ game tải dữ liệu sự kiện skin...')); }
                }, BANNER_UI_LOADING_MAX_MS);
            }

            refresh.addEventListener('click', () => { setLoading(); bannerUiRequest(); });

            holder.append(bar, listBox);

            function render(res) {
                listBox.textContent = '';
                if (res.error) { status.textContent = 'Lỗi: ' + res.error; return; }
                if (!res.ready) { status.textContent = 'Chưa có dữ liệu banner từ game.'; return; }
                status.textContent = res.banners.length ? res.banners.length + ' banner đang mở' : 'Hiện không có banner nào đang mở.';
                for (const b of res.banners) {
                    const item = document.createElement('div');
                    item.className = 'tn-opt-item';
                    item.style.cssText = 'border-left:3px solid #cba6f7;padding:4px 8px;cursor:default;';
                    const text = document.createElement('div');
                    const title = document.createElement('div');
                    title.style.cssText = 'font-weight:bold;color:#cba6f7;font-size:10.5px;';
                    title.textContent = '🎴 ' + b.series + (b.heroName ? ' · ' + b.heroName : '');
                    const desc = document.createElement('div');
                    desc.style.cssText = 'font-size:9.5px;color:#a6adc8;margin-top:2px;line-height:1.3;';
                    desc.textContent = '#' + b.uniqueId + (b.heroName ? '' : ' · hero ' + b.heroId) + ' · ' + bannerUiFormatRemain(b.remainSec);
                    text.append(title, desc);
                    item.appendChild(text);
                    listBox.appendChild(item);
                }
            }

            window.addEventListener('message', (event) => {
                const data = event.data;
                if (!data || data.source !== BANNER_RES_SOURCE) return;
                const frames = [...document.querySelectorAll('iframe')].map((f) => f.contentWindow);
                if (event.source !== window && !frames.includes(event.source)) return;
                // Giữ hiệu ứng tải ít nhất BANNER_UI_MIN_LOADING_MS để người dùng kịp thấy (game thường trả lời gần như ngay).
                const wait = loadingStartedAt + BANNER_UI_MIN_LOADING_MS - Date.now();
                if (wait > 0 && (listBox.querySelector('.tn-skeleton') || (skinLine() && skinLine().querySelector('.tn-spin')))) {
                    setTimeout(() => applyResponse(data), wait);
                    return;
                }
                applyResponse(data);
            });

            function applyResponse(data) {
                // Frame game trả về dữ liệu thật; frame rỗng trả ready=false nên bỏ qua nếu đã có kết quả tốt.
                if (data.skin && !data.skin.unknown) {
                    const el = document.querySelector('.tn-feat-cfg[data-cfg-for="autoSkinBanner"]');
                    if (el) {
                        el.textContent = data.skin.open
                            ? '🎴 ' + (data.skin.name || 'Skin') + ' · #' + data.skin.uniqueId + ' · ' + bannerUiFormatRemain(data.skin.remainSec)
                            : 'ℹ️ ' + (() => { const r = String(data.skin.reason || 'sự kiện skin chưa mở'); return r.charAt(0).toUpperCase() + r.slice(1) + '.'; })();
                    }
                }
                if (!data.ready && listBox.childElementCount > 0 && !listBox.querySelector('.tn-skeleton')) return;
                if (!data.ready && listBox.querySelector('.tn-skeleton')) return;     // vẫn đang tải: đợi khung game trả lời
                render(data);
            }

            setLoading();
            // Hỏi lại mỗi 2 giây khi còn đang tải (tới khi game có dữ liệu), sau đó mỗi BANNER_POLL_MS.
            let lastRequestAt = 0;
            const request = () => { lastRequestAt = Date.now(); bannerUiRequest(); };
            request();
            setInterval(() => {
                const loading = listBox.querySelector('.tn-skeleton') || (skinLine() && skinLine().querySelector('.tn-spin'));
                if (loading || Date.now() - lastRequestAt >= BANNER_POLL_MS) request();
            }, 2000);
            return true;
        }

        const bannerUiTimer = setInterval(() => { if (bannerUiBuild()) clearInterval(bannerUiTimer); }, 400);
    }

