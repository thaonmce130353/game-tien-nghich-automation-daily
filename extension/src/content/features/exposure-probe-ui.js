    // DEBUG: EXPOSURE PROBE - bảng điều khiển ở cửa sổ trên cùng (chỉ đọc)
    const PROBE_SOURCE_REQ = 'TIEN_NGHICH_AUTO_PROBE_REQ';
    const PROBE_SOURCE_RES = 'TIEN_NGHICH_AUTO_PROBE_RES';

    if (isTopWindow) {
        let probeBest = null;

        function probeBuildPanel() {
            if (document.getElementById('tn-probe-root')) return;
            if (!document.body) { setTimeout(probeBuildPanel, 300); return; }

            const root = document.createElement('div');
            root.id = 'tn-probe-root';
            // Mặc định ở góc trên bên phải (xa HUD và nút BẮT ĐẦU); kéo nút "Probe" để di chuyển, vị trí được nhớ lại.
            root.style.cssText = 'position:fixed;right:8px;top:8px;z-index:2147483646;font:11px/1.35 monospace;color:#cdd6f4;';

            const toggle = document.createElement('button');
            toggle.textContent = '🔍 Probe';
            toggle.style.cssText = 'background:#313244;color:#cdd6f4;border:1px solid #585b70;border-radius:6px;padding:3px 8px;cursor:pointer;';

            const panel = document.createElement('div');
            panel.style.cssText = 'display:none;margin-top:4px;width:340px;max-height:50vh;overflow:auto;background:rgba(17,17,27,0.96);border:1px solid #585b70;border-radius:8px;padding:8px;';

            const bar = document.createElement('div');
            const runBtn = document.createElement('button');
            runBtn.textContent = 'Quét (chỉ đọc)';
            const viewsBtn = document.createElement('button');
            viewsBtn.textContent = 'Màn hình mở';
            const dlBtn = document.createElement('button');
            dlBtn.textContent = 'Xuất JSON';
            dlBtn.disabled = true;
            for (const b of [runBtn, viewsBtn, dlBtn]) {
                b.style.cssText = 'background:#45475a;color:#cdd6f4;border:0;border-radius:4px;padding:3px 8px;margin-right:6px;cursor:pointer;';
            }
            bar.appendChild(runBtn);
            bar.appendChild(viewsBtn);
            bar.appendChild(dlBtn);

            const note = document.createElement('div');
            note.style.cssText = 'color:#a6adc8;margin:6px 0;';
            note.textContent = 'Không gọi gInst() hay bất kỳ method nào.';
            const out = document.createElement('div');

            panel.append(bar, note, out);
            root.append(toggle, panel);
            document.body.appendChild(root);

            // Kéo-thả bằng nút Probe (di chuyển > 4px thì không tính là bấm).
            const PROBE_POS_KEY = 'tn-probe-pos';
            const clampPos = (x, y) => ({
                x: Math.max(0, Math.min(x, window.innerWidth - 60)),
                y: Math.max(0, Math.min(y, window.innerHeight - 30))
            });
            const placeAt = (x, y) => {
                const c = clampPos(x, y);
                root.style.right = 'auto';
                root.style.left = c.x + 'px';
                root.style.top = c.y + 'px';
            };
            try {
                const saved = JSON.parse(localStorage.getItem(PROBE_POS_KEY) || 'null');
                if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) placeAt(saved.x, saved.y);
            } catch (e) { }
            let dragStart = null;
            let dragged = false;
            toggle.addEventListener('pointerdown', (e) => {
                const r = root.getBoundingClientRect();
                dragStart = { px: e.clientX, py: e.clientY, x: r.left, y: r.top };
                dragged = false;
                try { toggle.setPointerCapture(e.pointerId); } catch (err) { }
            });
            toggle.addEventListener('pointermove', (e) => {
                if (!dragStart) return;
                const dx = e.clientX - dragStart.px;
                const dy = e.clientY - dragStart.py;
                if (!dragged && Math.abs(dx) + Math.abs(dy) < 5) return;
                dragged = true;
                placeAt(dragStart.x + dx, dragStart.y + dy);
            });
            toggle.addEventListener('pointerup', () => {
                if (dragged) {
                    const r = root.getBoundingClientRect();
                    try { localStorage.setItem(PROBE_POS_KEY, JSON.stringify({ x: r.left, y: r.top })); } catch (e) { }
                }
                dragStart = null;
            });
            toggle.addEventListener('click', (e) => {
                if (dragged) { e.stopImmediatePropagation(); e.preventDefault(); dragged = false; }
            }, true);

            function line(text, color) {
                const d = document.createElement('div');
                d.textContent = text;
                if (color) d.style.color = color;
                out.appendChild(d);
            }

            function renderViews(report) {
                out.textContent = '';
                line('Màn hình đang mở (chỉ đọc): ' + report.views.length, '#a6e3a1');
                for (const v of report.views) {
                    line('• ' + v.name + ' <' + v.className + '> methods=' + v.methods.length);
                }
                for (const e of report.errors) line('Lỗi: ' + e, '#f38ba8');
            }

            function render(report) {
                if (report.kind === 'views') { renderViews(report); return; }
                out.textContent = '';
                if (report.error) { line('Lỗi: ' + report.error, '#f38ba8'); return; }
                const cs = report.controllers;
                const sends = cs.reduce((a, c) => a + c.sendMethods.length, 0);
                line(`Controller: ${cs.length} | send*: ${sends}`, '#a6e3a1');
                const flaggedCtrls = cs.filter((c) => c.ctrlFlags.length || Object.keys(c.flaggedMethods).length);
                line(`Nhóm nhạy cảm: ${flaggedCtrls.length}`, '#fab387');
                for (const c of flaggedCtrls) {
                    const cats = new Set([...c.ctrlFlags, ...Object.keys(c.flaggedMethods)]);
                    const n = Object.values(c.flaggedMethods).reduce((a, l) => a + l.length, 0);
                    line(`• ${c.name} [${[...cats].join(',')}] send=${c.sendMethods.length} flaggedMethods=${n}`);
                }
            }

            viewsBtn.addEventListener('click', () => {
                probeBest = null;
                out.textContent = '';
                line('Đang đọc màn hình đang mở...');
                const req = { source: PROBE_SOURCE_REQ, kind: 'views' };
                document.querySelectorAll('iframe').forEach((f) => {
                    try { f.contentWindow.postMessage(req, '*'); } catch (e) { }
                });
                try { window.postMessage(req, '*'); } catch (e) { }
                setTimeout(() => { if (!probeBest) line('Không nhận được kết quả từ frame game.', '#f38ba8'); }, 3000);
            });

            toggle.addEventListener('click', () => {
                panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            });

            runBtn.addEventListener('click', () => {
                probeBest = null;
                out.textContent = '';
                line('Đang quét...');
                const req = { source: PROBE_SOURCE_REQ };
                document.querySelectorAll('iframe').forEach((f) => {
                    try { f.contentWindow.postMessage(req, '*'); } catch (e) { }
                });
                try { window.postMessage(req, '*'); } catch (e) { }
                setTimeout(() => { if (!probeBest) line('Không nhận được kết quả từ frame game.', '#f38ba8'); }, 3000);
            });

            dlBtn.addEventListener('click', () => {
                if (!probeBest) return;
                const blob = new Blob([JSON.stringify(probeBest, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = probeBest.kind === 'views' ? 'tn-open-views.json' : 'tn-exposure-probe.json';
                a.click();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            });

            window.addEventListener('message', (event) => {
                const data = event.data;
                if (!data || data.source !== PROBE_SOURCE_RES || !data.report) return;
                const frames = [...document.querySelectorAll('iframe')].map((f) => f.contentWindow);
                if (event.source !== window && !frames.includes(event.source)) return;
                // Giữ báo cáo có nhiều controller nhất (frame game, không phải frame rỗng).
                if (!probeBest || data.report.controllerCount > probeBest.controllerCount || (data.report.kind === 'views' && probeBest.kind !== data.report.kind)) {
                    probeBest = data.report;
                    render(probeBest);
                    dlBtn.disabled = false;
                }
            });
        }

        probeBuildPanel();
        setTimeout(probeBuildPanel, 1500);
    }

