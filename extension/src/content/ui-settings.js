        // Cài đặt con của từng tính năng: nút ⚙ cạnh tên tính năng mở cửa sổ popup; mô tả tính năng hiện giá trị đang dùng.
        // Thêm cài đặt mới: khai báo trong FEATURE_SETTINGS (key = data-key của tính năng) + giá trị mặc định trong CONFIG,
        // và thêm nút `<button class="tn-gear-btn" data-gear="<key>">` cạnh tên tính năng trong ui-markup.js.
        const FEATURE_SETTINGS = {
            autoTamTienDai: {
                title: 'Tâm Tiên Đài',
                fields: [
                    { key: 'buyTamTienGifts', type: 'checkbox', label: '🟢 Mua quà bằng Tiên Ngọc', hint: 'Mua quà Pháp Bảo, Linh Thú, Pháp Trận bằng Tiên Ngọc; không bao giờ mua quà tiền thật.' }
                ],
                summary: (c) => `Mua quà bằng Tiên Ngọc: ${c.buyTamTienGifts ? 'BẬT' : 'TẮT'}.`
            },
            autoArena: {
                title: 'Đấu Tiên Đài',
                fields: [
                    { key: 'arenaBattleLimit', type: 'number', min: 1, max: 99, def: 5, label: 'Giới hạn số trận mỗi lần chạy', hint: 'Tổng lượt miễn phí + lượt dùng Đấu Tiên Lệnh.' }
                ],
                summary: (c) => `Tối đa ${c.arenaBattleLimit} trận mỗi lần chạy.`
            },
            autoTienMinh: {
                title: 'Tiên Minh',
                fields: [
                    { key: 'tienMinhDungeonLimit', type: 'number', min: 1, max: 6, def: 3, label: 'Số trận Bí Cảnh Tông Môn', hint: '2 trận đầu miễn phí; trận thứ 3 trở đi tự mua lượt (20 Tiên Ngọc/lượt). Tối đa 6.' }
                ],
                summary: (c) => `Bí Cảnh Tông Môn ${c.tienMinhDungeonLimit} trận` + (c.tienMinhDungeonLimit > 2 ? ` (mua thêm ${c.tienMinhDungeonLimit - 2} lượt, ${(c.tienMinhDungeonLimit - 2) * 20} Tiên Ngọc).` : ' (chỉ lượt miễn phí).')
            },
            autoTongTian: {
                title: 'Thông Thiên Tháp & Tứ Linh Tháp',
                fields: [
                    { key: 'towerDailyRoutine', type: 'checkbox', label: '📅 Nhận thưởng và Quét ải mỗi ngày', hint: 'Thông Thiên Tháp quét 3 lần (2 miễn phí + 1 mua); Tứ Linh Tháp đang mở: 10 ải mới + quét 2 lần miễn phí (không mua).' }
                ],
                summary: (c) => `Nhận thưởng & quét ải mỗi ngày: ${c.towerDailyRoutine ? 'BẬT' : 'TẮT (chỉ leo/bỏ qua Thông Thiên Tháp)'}.`
            }
        };

        function featureSettingNormalize(field, raw) {
            if (field.type === 'checkbox') return Boolean(raw);
            const n = Number(raw);
            return Number.isInteger(n) && n >= field.min && n <= field.max ? n : field.def;
        }

        // Dòng "Hiện tại: ..." dưới mô tả mỗi tính năng có cài đặt.
        function refreshFeatureSummaries() {
            for (const key of Object.keys(FEATURE_SETTINGS)) {
                const el = document.querySelector(`.tn-feat-cfg[data-cfg-for="${key}"]`);
                if (el) el.textContent = '⚙ ' + FEATURE_SETTINGS[key].summary(CONFIG);
            }
        }

        function initFeatureSettings() {
            const hud = document.getElementById('tn-auto-hud');
            if (!hud) return;
            const overlay = document.createElement('div');
            overlay.id = 'tn-settings-overlay';
            const card = document.createElement('div');
            card.id = 'tn-settings-card';
            overlay.appendChild(card);
            hud.appendChild(overlay);

            const close = () => overlay.classList.remove('open');
            overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) close(); });
            document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

            function open(key) {
                const def = FEATURE_SETTINGS[key];
                if (!def) return;
                card.textContent = '';
                const head = document.createElement('div');
                head.className = 'tn-set-head';
                const title = document.createElement('span');
                title.textContent = '⚙ Cài đặt: ' + def.title;
                const x = document.createElement('button');
                x.type = 'button';
                x.className = 'tn-set-close';
                x.textContent = '✕';
                x.addEventListener('click', close);
                head.append(title, x);
                card.appendChild(head);

                for (const f of def.fields) {
                    const row = document.createElement('label');
                    row.className = 'tn-set-field';
                    const text = document.createElement('div');
                    const label = document.createElement('div');
                    label.className = 'tn-set-label';
                    label.textContent = f.label;
                    const hint = document.createElement('div');
                    hint.className = 'tn-set-hint';
                    hint.textContent = f.hint || '';
                    text.append(label, hint);
                    const input = document.createElement('input');
                    input.type = f.type;
                    if (f.type === 'checkbox') input.checked = Boolean(CONFIG[f.key]);
                    else { input.min = f.min; input.max = f.max; input.step = 1; input.value = String(CONFIG[f.key]); }
                    input.addEventListener('change', () => {
                        CONFIG[f.key] = featureSettingNormalize(f, f.type === 'checkbox' ? input.checked : input.value);
                        if (f.type === 'checkbox') input.checked = CONFIG[f.key]; else input.value = String(CONFIG[f.key]);
                        sendCommandToGame('UPDATE_CONFIG', { config: CONFIG });
                        refreshFeatureSummaries();
                        addLogToUI(`⚙ ${def.title}: ${def.summary(CONFIG)}`, 'info');
                    });
                    row.append(text, input);
                    card.appendChild(row);
                }
                const done = document.createElement('button');
                done.type = 'button';
                done.className = 'tn-action-btn tn-btn-start';
                done.style.cssText = 'margin:6px 0 0 0;padding:6px 0;';
                done.textContent = 'Xong';
                done.addEventListener('click', close);
                card.appendChild(done);
                overlay.classList.add('open');
            }

            document.querySelectorAll('.tn-gear-btn').forEach((btn) => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    open(btn.dataset.gear);
                });
            });
            refreshFeatureSummaries();
        }
