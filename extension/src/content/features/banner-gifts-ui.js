    // =========================================================================
    // BANNER HERO: tab điều khiển ở cửa sổ trên cùng (chọn banner đang mở để tự nhận quà)
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
            const panel = document.getElementById('tn-tab-panel-banner');
            if (!panel) return false;
            bannerUiBuilt = true;
            if (!CONFIG.bannerAuto || typeof CONFIG.bannerAuto !== 'object') CONFIG.bannerAuto = {};

            const intro = document.createElement('div');
            intro.style.cssText = 'font-size:9.5px;color:#a6adc8;line-height:1.35;margin-bottom:6px;';
            intro.textContent = 'Banner hero đang mở. Tick để CHỌN banner; quy trình chỉ chạy đúng một lượt khi bấm ▶ BẮT ĐẦU, và chỉ khi banner còn mở.';

            const bar = document.createElement('div');
            bar.style.cssText = 'display:flex;gap:6px;align-items:center;margin-bottom:6px;';
            const refresh = document.createElement('button');
            refresh.textContent = 'Tải lại danh sách';
            refresh.style.cssText = 'background:#45475a;color:#cdd6f4;border:0;border-radius:4px;padding:3px 8px;cursor:pointer;font-size:10px;';
            const status = document.createElement('span');
            status.style.cssText = 'font-size:10px;color:#a6adc8;';
            status.textContent = 'Đang tải...';
            bar.append(refresh, status);

            const listBox = document.createElement('div');
            listBox.className = 'tn-opt-list';

            const note = document.createElement('div');
            note.style.cssText = 'font-size:9.5px;color:#a6adc8;line-height:1.35;margin-top:6px;';
            note.textContent = 'Quy trình mỗi hero: nhận Quà (miễn phí + quà Tiên Ngọc ' + (CONFIG.bannerGoldPrice || 300) + ') → Chiêu mộ 1 lần → Khiêu Chiến Thí Luyện 1 lần → nhận điểm nhiệm vụ → Chiến Lệnh Nhận nhanh. Không mua quà tiền thật.';

            refresh.addEventListener('click', () => { status.textContent = 'Đang tải...'; bannerUiRequest(); });

            panel.append(intro, bar, listBox, note);

            function render(res) {
                listBox.textContent = '';
                if (res.error) { status.textContent = 'Lỗi: ' + res.error; return; }
                if (!res.ready) { status.textContent = 'Chưa có dữ liệu banner từ game.'; return; }
                status.textContent = res.banners.length ? res.banners.length + ' banner đang mở' : 'Hiện không có banner nào đang mở.';
                for (const b of res.banners) {
                    const label = document.createElement('label');
                    label.className = 'tn-opt-item';
                    label.style.cssText = 'border-left:3px solid #cba6f7;';
                    const text = document.createElement('div');
                    const title = document.createElement('div');
                    title.style.cssText = 'font-weight:bold;color:#cba6f7;';
                    title.textContent = '🎴 Quà ' + b.series;
                    const desc = document.createElement('div');
                    desc.style.cssText = 'font-size:9.5px;color:#a6adc8;margin-top:2px;line-height:1.3;';
                    desc.textContent = '#' + b.uniqueId + ' · hero ' + b.heroId + ' · ' + bannerUiFormatRemain(b.remainSec);
                    text.append(title, desc);
                    const box = document.createElement('input');
                    box.type = 'checkbox';
                    box.checked = Boolean(CONFIG.bannerAuto[b.uniqueId]);
                    box.addEventListener('change', () => {
                        if (box.checked) CONFIG.bannerAuto[b.uniqueId] = true;
                        else delete CONFIG.bannerAuto[b.uniqueId];
                        bannerUiLog((box.checked ? '🟢' : '⏸️') + ' [Banner Hero] ' + (box.checked ? 'Đã chọn' : 'Bỏ chọn') + ' quà ' + b.series + ' #' + b.uniqueId + ' (chỉ chạy khi bấm BẮT ĐẦU).', 'info');
                    });
                    label.append(text, box);
                    listBox.appendChild(label);
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

