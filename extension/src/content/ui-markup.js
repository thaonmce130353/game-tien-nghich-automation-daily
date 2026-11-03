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
                            <label class="tn-opt-item" style="padding:4px 8px; margin-bottom:3px;">
                                <span style="font-weight:bold; color:#cdd6f4;">⚡ Tối đa tốc độ x3</span>
                                <input type="checkbox" id="tn-opt-speed" ${CONFIG.maxSpeed ? 'checked' : ''}>
                            </label>
                            <label class="tn-opt-item" style="padding:4px 8px; margin-bottom:3px;">
                                <span style="font-weight:bold; color:#cdd6f4;">🔌 Tự vào lại game khi bị ngắt kết nối</span>
                                <input type="checkbox" id="tn-opt-reconnect" ${CONFIG.autoReconnect ? 'checked' : ''}>
                            </label>
                            <label class="tn-opt-item" style="padding:4px 8px;">
                                <span style="font-weight:bold; color:#cdd6f4;">📜 Log chi tiết (gỡ lỗi)</span>
                                <input type="checkbox" id="tn-opt-verbose" ${CONFIG.verboseLog ? 'checked' : ''}>
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
                            <span style="font-size:10px; color:#a6adc8; font-weight:normal;">(Mỗi lần tải lại là mới)</span>
                        </div>

                        <!-- THANH ĐIỀU HƯỚNG 5 TAB GAME -->
                        <div class="tn-tab-bar">
                            <button class="tn-tab-btn active" data-tab="daoThanh" title="Khu vực Đạo Thành">🏛️ Đạo Thành</button>
                            <button class="tn-tab-btn" data-tab="troChien" title="Khu vực Trợ Chiến">⚔️ Trợ Chiến</button>
                            <button class="tn-tab-btn" data-tab="lichLuyen" title="Khu vực Lịch Luyện">🗺️ Lịch Luyện</button>
                            <button class="tn-tab-btn" data-tab="maDao" title="Khu vực Ma Đạo">🔥 Ma Đạo</button>
                            <button class="tn-tab-btn" data-tab="banner" title="Sự kiện đang mở (banner tướng Thần Lâm / Đạp Thiên)" style="flex:1.7;">🎴 Sự kiện đang mở</button>
                        </div>

                        <!-- DANH SÁCH TÍNH NĂNG TRONG 5 TAB -->
                        <div class="tn-feature-panels">
                            <!-- TAB 1: ĐẠO THÀNH -->
                            <div id="tn-tab-panel-dao-thanh" class="tn-tab-panel active">
                                <div class="tn-opt-list">
                                    <label class="tn-opt-item" style="border-left: 3px solid #89dceb;">
                                        <div style="min-width:0; flex:1;">
                                            <div class="tn-feat-title" style="color:#89dceb;"><span class="tn-feat-name">✨ Tâm Tiên Đài</span><button type="button" class="tn-gear-btn" data-gear="autoTamTienDai" title="Cài đặt">⚙</button></div>
                                            <div class="tn-feat-desc">Nhận quà miễn phí 4 tab và Chiêu Mộ ngày; có thể mua thêm quà bằng Tiên Ngọc.</div>
                                            <div class="tn-feat-cfg" data-cfg-for="autoTamTienDai"></div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoTamTienDai" ${CONFIG.activeFeature === 'autoTamTienDai' ? 'checked' : ''}>
                                    </label>
                                    <label class="tn-opt-item" style="border-left: 3px solid #a6e3a1;">
                                        <div style="min-width:0; flex:1;">
                                            <div class="tn-feat-title" style="color:#a6e3a1;"><span class="tn-feat-name">🏟️ Đấu Tiên Đài</span><button type="button" class="tn-gear-btn" data-gear="autoArena" title="Cài đặt">⚙</button></div>
                                            <div class="tn-feat-desc">Chọn đối thủ lực chiến thấp; giới hạn tổng số trận (lượt miễn phí + Đấu Tiên Lệnh) mỗi lần chạy Auto.</div>
                                            <div class="tn-feat-cfg" data-cfg-for="autoArena"></div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoArena" ${CONFIG.activeFeature === 'autoArena' ? 'checked' : ''}>
                                    </label>
                                    <label class="tn-opt-item" style="border-left: 3px solid #f9e2af;">
                                        <div style="min-width:0; flex:1;">
                                            <div class="tn-feat-title" style="color:#f9e2af;"><span class="tn-feat-name">🤝 Tiên Hữu</span></div>
                                            <div class="tn-feat-desc">Vào Tiên Hữu, bấm Tặng nhanh điểm tình bạn mỗi ngày.</div>
                                            <div class="tn-feat-cfg" data-cfg-for="autoTienHuu"></div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoTienHuu" ${CONFIG.activeFeature === 'autoTienHuu' ? 'checked' : ''}>
                                    </label>
                                    <label class="tn-opt-item" style="border-left: 3px solid #cba6f7;">
                                        <div style="min-width:0; flex:1;">
                                            <div class="tn-feat-title" style="color:#cba6f7;"><span class="tn-feat-name">🏛️ Tiên Minh</span><button type="button" class="tn-gear-btn" data-gear="autoTienMinh" title="Cài đặt">⚙</button></div>
                                            <div class="tn-feat-desc">Trả giá Shop, Bí Cảnh, Tỉ Thí, Vấn Đạo, Viện trợ Tông Môn & Cung phụng Tôn Sư.</div>
                                            <div class="tn-feat-cfg" data-cfg-for="autoTienMinh"></div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoTienMinh" ${CONFIG.activeFeature === 'autoTienMinh' ? 'checked' : ''}>
                                    </label>
                                    <label class="tn-opt-item" style="border-left: 3px solid #f38ba8;">
                                        <div style="min-width:0; flex:1;">
                                            <div class="tn-feat-title" style="color:#f38ba8;"><span class="tn-feat-name">📬 Nhận Cuối Ngày</span></div>
                                            <div class="tn-feat-desc">Nhận toàn bộ Thư, Like BXH Đạo Thành 3 lần, nhận hết rương Sôi Nổi (25, 50, 75, 100).</div>
                                            <div class="tn-feat-cfg" data-cfg-for="autoCuoiNgay"></div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoCuoiNgay" ${CONFIG.activeFeature === 'autoCuoiNgay' ? 'checked' : ''}>
                                    </label>
                                </div>
                            </div>

                            <!-- TAB 2: TRỢ CHIẾN -->
                            <div id="tn-tab-panel-tro-chien" class="tn-tab-panel">
                                <div class="tn-opt-list">
                                    <label class="tn-opt-item" style="border-left: 3px solid #a6e3a1;">
                                        <div style="min-width:0; flex:1;">
                                            <div class="tn-feat-title" style="color:#a6e3a1;"><span class="tn-feat-name">🐾 Trợ Chiến Linh Thú</span></div>
                                            <div class="tn-feat-desc">Vào Trợ Chiến &rarr; Linh Thú &rarr; Tab Hoàn &rarr; Bấm Nhận nhanh tài nguyên.</div>
                                            <div class="tn-feat-cfg" data-cfg-for="autoTroChien"></div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoTroChien" ${CONFIG.activeFeature === 'autoTroChien' ? 'checked' : ''}>
                                    </label>
                                </div>
                            </div>

                            <!-- TAB 3: LỊCH LUYỆN -->
                            <div id="tn-tab-panel-lich-luyen" class="tn-tab-panel">
                                <div class="tn-opt-list">
                                    <!-- MODULE 1 -->
                                    <label class="tn-opt-item" style="border-left: 3px solid #f5c2e7;">
                                        <div style="min-width:0; flex:1;">
                                            <div class="tn-feat-title" style="color:#f5c2e7;"><span class="tn-feat-name">🗼 Thông Thiên Tháp & Tứ Linh Tháp</span><button type="button" class="tn-gear-btn" data-gear="autoTongTian" title="Cài đặt">⚙</button></div>
                                            <div class="tn-feat-desc">Quét Thông Thiên Tháp (miễn phí + mua bằng Tiên Ngọc), cử trợ trận tướng 1, leo 4 tháp Tứ Linh và quét 2 lần.</div>
                                            <div class="tn-feat-cfg" data-cfg-for="autoTongTian"></div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoTongTian" ${CONFIG.activeFeature === 'autoTongTian' ? 'checked' : ''}>
                                    </label>
                                    <!-- MODULE 2 -->
                                    <label class="tn-opt-item" style="border-left: 3px solid #fab387;">
                                        <div style="min-width:0; flex:1;">
                                            <div class="tn-feat-title" style="color:#fab387;"><span class="tn-feat-name">⚔️ Phụ Bản Ngày & Bí Cảnh Tứ Quốc</span></div>
                                            <div class="tn-feat-desc">Quét PB Ngày chỉ bằng lượt MIỄN PHÍ (1 lần/ngày, không mua lượt bằng Tiên Ngọc). Bí Cảnh Tứ Quốc: đánh ải mới từng tháp đang mở (bỏ qua trận), hết ải thì quét ải cuối tới hết lượt miễn phí.</div>
                                            <div class="tn-feat-cfg" data-cfg-for="autoDailyDungeon"></div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoDailyDungeon" ${CONFIG.activeFeature === 'autoDailyDungeon' ? 'checked' : ''}>
                                    </label>
                                    <!-- MODULE 3 -->
                                    <label class="tn-opt-item" style="border-left: 3px solid #89b4fa;">
                                        <div style="min-width:0; flex:1;">
                                            <div class="tn-feat-title" style="color:#89b4fa;"><span class="tn-feat-name">🛡️ Thủ Vệ Tứ Phái</span></div>
                                            <div class="tn-feat-desc">Xếp đội & Khiêu Chiến, sau mỗi trận chọn Buff ở giữa; hết lượt thì vào Chiến Lệnh nhận thưởng miễn phí.</div>
                                            <div class="tn-feat-cfg" data-cfg-for="autoSectDefense"></div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoSectDefense" ${CONFIG.activeFeature === 'autoSectDefense' ? 'checked' : ''}>
                                    </label>
                                    <!-- MODULE 4 -->
                                    <label class="tn-opt-item" style="border-left: 3px solid #94e2d5;">
                                        <div style="min-width:0; flex:1;">
                                            <div class="tn-feat-title" style="color:#94e2d5;"><span class="tn-feat-name">🏯 Cửu Uyển Nhi & Cổ Thần Địa</span></div>
                                            <div class="tn-feat-desc">Cửu Uyển Nhi: bấm Quét nhanh khi khả dụng. Cổ Thần Địa: xếp tướng, đánh 4 ải quanh rồi ải giữa, dùng vật phẩm đặc biệt, nhận thưởng Diệt Thủ Hộ. Sau đó Cực Âm Địa.</div>
                                            <div class="tn-feat-cfg" data-cfg-for="autoOtherTrials"></div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoOtherTrials" ${CONFIG.activeFeature === 'autoOtherTrials' ? 'checked' : ''}>
                                    </label>
                                    <!-- CỰC ÂM ĐỊA (riêng) -->
                                    <label class="tn-opt-item" style="border-left: 3px solid #94e2d5;">
                                        <div style="min-width:0; flex:1;">
                                            <div class="tn-feat-title" style="color:#94e2d5;"><span class="tn-feat-name">🧘 Cực Âm Địa</span></div>
                                            <div class="tn-feat-desc">Chọn địa từ Huyền Âm trở lên hợp sức, giành vị trí nếu đầy, Đoạt bằng lượt miễn phí rồi nhận Chiến Lệnh Cực Âm; hết giờ thì nhận thưởng.</div>
                                            <div class="tn-feat-cfg" data-cfg-for="autoExtremeYin"></div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoExtremeYin" ${CONFIG.activeFeature === 'autoExtremeYin' ? 'checked' : ''}>
                                    </label>
                                    <!-- MODULE 5 -->
                                    <label class="tn-opt-item" style="border-left: 3px solid #f9e2af;">
                                        <div style="min-width:0; flex:1;">
                                            <div class="tn-feat-title" style="color:#f9e2af;"><span class="tn-feat-name">💎 Di Tích Tiên Giới</span></div>
                                            <div class="tn-feat-desc">Phái 1 đội vào bệ cấp cao nhất. Toàn bệ cấp thấp thì làm mới miễn phí (tối đa 3 lần) tới khi gặp Lv3-5.</div>
                                            <div class="tn-feat-cfg" data-cfg-for="autoImmortalRelic"></div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoImmortalRelic" ${CONFIG.activeFeature === 'autoImmortalRelic' ? 'checked' : ''}>
                                    </label>
                                    <!-- MODULE 6 -->
                                    <label class="tn-opt-item" style="border-left: 3px solid #cba6f7;">
                                        <div style="min-width:0; flex:1;">
                                            <div class="tn-feat-title" style="color:#cba6f7;"><span class="tn-feat-name">🧩 Ảo Cảnh Pháp Trận</span></div>
                                            <div class="tn-feat-desc">Bắt đầu, chờ xem thẻ, ghép 8 cặp trong ~8-10s, chơi lại khi còn lượt thưởng, nhận thưởng mốc điểm.</div>
                                            <div class="tn-feat-cfg" data-cfg-for="autoMinigameMemory"></div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoMinigameMemory" ${CONFIG.activeFeature === 'autoMinigameMemory' ? 'checked' : ''}>
                                    </label>
                                    <!-- MODULE 7 -->
                                    <label class="tn-opt-item" style="border-left: 3px solid #f38ba8;">
                                        <div style="min-width:0; flex:1;">
                                            <div class="tn-feat-title" style="color:#f38ba8;"><span class="tn-feat-name">🐉 Kiếm Hành & Điêu Long</span></div>
                                            <div class="tn-feat-desc">Kiếm Hành: gieo xúc xắc đi hết 1 vòng (hết free thì mua bằng Tiên Ngọc, tối đa 12 lần/ngày), nhận Chiến Lệnh. Điêu Long: bấm nhịp Hoàn Mỹ 5 lần/ván, nhận rương, Khiêu chiến & Chiến Lệnh.</div>
                                            <div class="tn-feat-cfg" data-cfg-for="autoMinigameDragon"></div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoMinigameDragon" ${CONFIG.activeFeature === 'autoMinigameDragon' ? 'checked' : ''}>
                                    </label>
                                    <!-- PHỤ BẢN PHỤ -->
                                    <label class="tn-opt-item" style="border-left: 3px solid #89b4fa;">
                                        <div style="min-width:0; flex:1;">
                                            <div class="tn-feat-title" style="color:#89b4fa;"><span class="tn-feat-name">🌌 Vực U Minh</span></div>
                                            <div class="tn-feat-desc">Tự động đổi trận pháp & vượt ải Vực U Minh thu thập bí bảo.</div>
                                            <div class="tn-feat-cfg" data-cfg-for="autoClimbYMAbyss"></div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoClimbYMAbyss" ${CONFIG.activeFeature === 'autoClimbYMAbyss' ? 'checked' : ''}>
                                    </label>
                                </div>
                            </div>

                            <!-- TAB: SỰ KIỆN ĐANG MỞ -->
                            <div id="tn-tab-panel-banner" class="tn-tab-panel">
                                <div class="tn-opt-list">
                                    <label class="tn-opt-item" style="border-left: 3px solid #cba6f7;">
                                        <div style="min-width:0; flex:1;">
                                            <div class="tn-feat-title" style="color:#cba6f7;"><span class="tn-feat-name">🎴 Tướng Thần Lâm / Đạp Thiên</span></div>
                                            <div class="tn-feat-desc">Làm việc ngày cho TẤT CẢ banner đang mở: nhận Quà (miễn phí + quà Tiên Ngọc ${CONFIG.bannerGoldPrice || 300}) → Chiêu mộ 1 lần → Khiêu Chiến Thí Luyện 1 lần → nhận điểm nhiệm vụ → Chiến Lệnh Nhận nhanh. Chạy một lượt rồi tự dừng. Không mua quà tiền thật.</div>
                                            <div class="tn-feat-cfg" data-cfg-for="autoBanner"></div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoBanner" ${CONFIG.activeFeature === 'autoBanner' ? 'checked' : ''}>
                                    </label>
                                    <div id="tn-banner-extra"></div>
                                </div>
                            </div>

                            <div id="tn-tab-panel-ma-dao" class="tn-tab-panel">
                                <div class="tn-opt-list">
                                    <label class="tn-opt-item" style="border-left: 3px solid #f9e2af;">
                                        <div style="min-width:0; flex:1;">
                                            <div class="tn-feat-title" style="color:#f9e2af;"><span class="tn-feat-name">🔥 Ma Đạo Tổng Hợp</span></div>
                                            <div class="tn-feat-desc">Lần lượt: nhận Thưởng Treo Máy &rarr; Tác Chiến Nhanh (hết free thì MUA bằng Tiên Ngọc, tối đa 20 lần/ngày) &rarr; Đi Ải Chính Tuyến (chưa đủ cấp thì chỉ ghi log) &rarr; Ủy Phái Sử Thi (Nhận nhanh, làm mới tới khi có Sử Thi, tối đa 30 lần làm mới/ngày, có thể tốn Tiên Ngọc).</div>
                                            <div class="tn-feat-cfg" data-cfg-for="autoMaDao"></div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoMaDao" ${CONFIG.activeFeature === 'autoMaDao' ? 'checked' : ''}>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- THANH NÚT CHẠY CỐ ĐỊNH Ở ĐÁY HUD (STICKY / FIXED FOOTER) -->
                <div id="tn-hud-footer">
                    <button id="tn-btn-main" class="tn-action-btn tn-btn-start">▶ BẮT ĐẦU TREO LEO ẢI AUTO</button>
                    <div id="tn-quick-group">
                        <button id="tn-btn-sweep" class="tn-action-btn tn-btn-sweep" title="Chạy lần lượt: Tâm Tiên Đài, Tiên Hữu, Trợ Chiến, Tiên Minh, Thông Thiên (quét 3 lần) + Tứ Linh (10 ải), Phụ Bản Ngày & Bí Cảnh, Thủ Vệ, Cửu Uyển Nhi & Cổ Thần, Cực Âm, Di Tích, Ảo Cảnh, Kiếm Hành & Điêu Long, Vực U Minh, Đấu Tiên Đài, Ma Đạo, Banner; cuối cùng Nhận Cuối Ngày."><span class="tn-qb-main">⚡ QUÉT NHANH</span><span class="tn-qb-sub">1 chạm · 17 bước</span></button>
                        <button id="tn-btn-quick-fresh" class="tn-action-btn tn-btn-sweep" style="display:none;" title="Chạy lại từ đầu (bỏ tiến độ đã lưu)">↺</button>
                    </div>
                </div>
                <div class="tn-resize-handle tn-resize-left" title="Kéo để đổi kích thước"></div>
                <div class="tn-resize-handle tn-resize-right" title="Kéo để đổi kích thước"></div>
            `;
            document.body.appendChild(hud);
