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

            refresh.addEventListener('click', () => { status.textContent = 'Đang tải...'; bannerUiRequest(); });

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
                // Frame game trả về dữ liệu thật; frame rỗng trả ready=false nên bỏ qua nếu đã có kết quả tốt.
                if (!data.ready && listBox.childElementCount > 0) return;
                render(data);
            });

            bannerUiRequest();
            setTimeout(bannerUiRequest, 2000);
            setInterval(bannerUiRequest, BANNER_POLL_MS);
            return true;
        }

        const bannerUiTimer = setInterval(() => { if (bannerUiBuild()) clearInterval(bannerUiTimer); }, 400);
    }

