        // Cài đặt con của từng tính năng: nút ⚙ cạnh tên tính năng mở cửa sổ popup; mô tả tính năng hiện giá trị đang dùng.
        // Thêm cài đặt mới: khai báo trong FEATURE_SETTINGS (key = data-key của tính năng) + giá trị mặc định trong CONFIG,
        // và thêm nút `<button class="tn-gear-btn" data-gear="<key>">` cạnh tên tính năng trong ui-markup.js.
        const FEATURE_SETTINGS = {
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
            }
        };

        // Popup Quét nhanh đang mở: chữ ký các sự kiện đã hiển thị (null = không mở) và hàm làm mới khi game báo dữ liệu mới.
        let quickPopupSig = null;
        let quickPopupRefresh = null;
        const quickEventSig = () => JSON.stringify(quickStepsCatalog.filter((st) => st.event)
            .map((st) => [st.key, st.open === undefined ? null : st.open, st.detail]));

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

            const close = () => { overlay.classList.remove('open'); quickPopupSig = null; };
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

            // Cài đặt QUÉT NHANH: tick chọn các bước (thứ tự cố định, không đổi được). Đổi lựa chọn thì bỏ tiến độ tạm dừng cũ.
            function openQuickSteps() {
                const prevScroll = (card.querySelector('.tn-set-list') || {}).scrollTop || 0;
                quickPopupSig = quickEventSig();
                card.textContent = '';
                const head = document.createElement('div');
                head.className = 'tn-set-head';
                const title = document.createElement('span');
                title.textContent = '⚙ Cài đặt: Quét Nhanh';
                const x = document.createElement('button');
                x.type = 'button';
                x.className = 'tn-set-close';
                x.textContent = '✕';
                x.addEventListener('click', close);
                head.append(title, x);
                card.appendChild(head);

                const note = document.createElement('div');
                note.className = 'tn-set-hint';
                note.style.margin = '0 0 6px 0';
                note.textContent = quickStepsCatalog.length
                    ? 'Tick các bước muốn chạy (thứ tự cố định). Đổi lựa chọn sẽ bỏ tiến độ tạm dừng trước đó.'
                    : 'Chưa nhận được danh sách bước từ game; đợi vài giây rồi mở lại.';
                card.appendChild(note);
                const locked = Boolean(CONFIG.running);
                if (locked) {
                    const warn = document.createElement('div');
                    warn.className = 'tn-set-hint';
                    warn.style.cssText = 'margin:0 0 6px 0;color:#f9e2af;';
                    warn.textContent = 'Auto đang chạy: tạm dừng trước khi đổi bước.';
                    card.appendChild(warn);
                }

                const boxes = [];
                const list = document.createElement('div');
                list.className = 'tn-set-list';
                card.appendChild(list);
                const apply = (changedBox) => {
                    const keys = quickStepsCatalog.filter((st, i) => boxes[i].checked).map((st) => st.key);
                    if (!keys.length) { changedBox.checked = true; return; }   // phải còn ít nhất một bước
                    CONFIG.quickSteps = keys.length === quickStepsCatalog.length ? null : keys;
                    try {
                        if (CONFIG.quickSteps) localStorage.setItem('TN_QUICK_STEPS_V1', JSON.stringify(CONFIG.quickSteps));
                        else localStorage.removeItem('TN_QUICK_STEPS_V1');
                    } catch (e) { }
                    sendCommandToGame('UPDATE_CONFIG', { config: CONFIG });
                    if (quickSavedInfo) {
                        updateQuickButtons(null, null);
                        addLogToUI('⚙ Quét nhanh: đã đổi các bước nên bỏ tiến độ tạm dừng cũ.', 'info');
                    }
                    addLogToUI('⚙ Quét nhanh: chạy ' + keys.length + '/' + quickStepsCatalog.length + ' bước.', 'info');
                };
                const selected = new Set(Array.isArray(CONFIG.quickSteps) ? CONFIG.quickSteps : quickStepsCatalog.map((st) => st.key));
                // Hai phần: các bước thường (đánh số) và phần "Sự kiện" riêng (tự bỏ qua khi game báo không có sự kiện đang mở).
                let evBox = null;     // phần Sự kiện cố định bên dưới, không cuộn theo danh sách bước thường
                let eventsLoading = false;
                let stepNo = 0;
                // Phần thường trước, phần Sự kiện sau (thứ tự chạy thật vẫn theo dãy gốc, Nhận Cuối Ngày luôn cuối).
                const order = quickStepsCatalog.map((st, i) => i).sort((x, y) => (quickStepsCatalog[x].event ? 1 : 0) - (quickStepsCatalog[y].event ? 1 : 0) || x - y);
                order.forEach((i) => {
                    const st = quickStepsCatalog[i];
                    // Sự kiện chưa có dữ liệu từ game: chưa hiện lựa chọn (giữ nguyên trạng thái đã chọn), hiện khi game đã báo.
                    const unknown = st.event && (st.open === null || st.open === undefined);
                    if (st.event && !evBox) {
                        evBox = document.createElement('div');
                        evBox.className = 'tn-set-events';
                        card.appendChild(evBox);
                        const head2 = document.createElement('div');
                        head2.className = 'tn-set-hint';
                        head2.style.cssText = 'margin:8px 0 4px 0;padding-top:6px;border-top:1px solid rgba(203,166,247,0.35);color:#cba6f7;font-weight:bold;';
                        head2.textContent = '🎴 Sự kiện';
                        const sub2 = document.createElement('div');
                        sub2.className = 'tn-set-hint';
                        sub2.style.margin = '0 0 4px 0';
                        sub2.textContent = 'Tự bỏ qua khi game báo hiện không có sự kiện đó đang mở (không tính vào số bước).';
                        evBox.append(head2, sub2);
                    }
                    if (unknown) { boxes[i] = { checked: selected.has(st.key) }; eventsLoading = true; return; }
                    const row = document.createElement('label');
                    row.className = 'tn-set-field';
                    const text = document.createElement('div');
                    const label = document.createElement('div');
                    label.className = 'tn-set-label';
                    label.textContent = st.event ? st.label : (++stepNo) + '. ' + st.label;
                    text.appendChild(label);
                    if (st.event) {
                        // Trạng thái nằm cạnh tên bước (cùng một dòng).
                        const state = document.createElement('span');
                        state.style.cssText = 'margin-left:8px;font-weight:normal;font-size:9.5px;color:' + (st.open === true ? '#a6e3a1' : '#fab387') + ';';
                        state.textContent = st.open === true ? '● Đang mở' : '○ Hiện không có (sẽ bỏ qua)';
                        label.appendChild(state);
                        // Mỗi tên một dòng.
                        if (st.open === true && st.detail) {
                            (Array.isArray(st.detail) ? st.detail : [st.detail]).forEach((n) => {
                                const name = document.createElement('div');
                                name.className = 'tn-set-hint';
                                name.style.cssText = 'color:#f5c2e7;font-weight:bold;';
                                name.textContent = n;
                                text.appendChild(name);
                            });
                        }
                    }
                    const input = document.createElement('input');
                    input.type = 'checkbox';
                    input.checked = selected.has(st.key);
                    input.disabled = locked;
                    input.addEventListener('change', () => apply(input));
                    boxes[i] = input;
                    row.append(text, input);
                    (st.event ? evBox : list).appendChild(row);
                });
                // Còn sự kiện chưa có dữ liệu: hiện hiệu ứng tải bên dưới phần Sự kiện (tự thay bằng lựa chọn khi game báo).
                if (evBox && eventsLoading) {
                    const loading = document.createElement('div');
                    loading.className = 'tn-set-hint';
                    loading.style.cssText = 'padding:6px 4px;';
                    const spin = document.createElement('span');
                    spin.className = 'tn-spin';
                    loading.append(spin, 'Đang tải thông tin sự kiện...');
                    evBox.appendChild(loading);
                }
                // "Chọn tất cả" và "Xong" cùng một hàng.
                const btnRow = document.createElement('div');
                btnRow.className = 'tn-set-btnrow';
                if (quickStepsCatalog.length && !locked) {
                    const all = document.createElement('button');
                    all.type = 'button';
                    all.className = 'tn-action-btn tn-btn-start';
                    all.textContent = 'Chọn tất cả';
                    all.addEventListener('click', () => { boxes.forEach((b) => { b.checked = true; }); apply(boxes[0]); });
                    btnRow.appendChild(all);
                }
                const done = document.createElement('button');
                done.type = 'button';
                done.className = 'tn-action-btn tn-btn-start';
                done.textContent = 'Xong';
                done.addEventListener('click', close);
                btnRow.appendChild(done);
                card.appendChild(btnRow);
                const newList = card.querySelector('.tn-set-list');
                if (newList) newList.scrollTop = prevScroll;
                overlay.classList.add('open');
            }
            // Game báo trạng thái sự kiện mới trong lúc popup đang mở: dựng lại để hiện các sự kiện vừa có dữ liệu.
            // Tự theo dõi (không phụ thuộc nơi nhận tin nhắn): popup đang mở mà dữ liệu sự kiện đổi thì dựng lại.
            quickPopupRefresh = () => {
                if (quickPopupSig !== null && overlay.classList.contains('open') && quickEventSig() !== quickPopupSig) openQuickSteps();
            };
            setInterval(() => { try { quickPopupRefresh(); } catch (e) { } }, 700);
            const quickCfgBtn = document.getElementById('tn-btn-quick-cfg');
            if (quickCfgBtn) quickCfgBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); openQuickSteps(); });

            document.querySelectorAll('.tn-gear-btn').forEach((btn) => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    open(btn.dataset.gear);
                });
            });
            refreshFeatureSummaries();
        }
