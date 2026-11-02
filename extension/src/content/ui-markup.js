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
                            <label class="tn-opt-item" style="padding:4px 8px;">
                                <span style="font-weight:bold; color:#cdd6f4;">🔌 Tự vào lại game khi bị ngắt kết nối</span>
                                <input type="checkbox" id="tn-opt-reconnect" ${CONFIG.autoReconnect ? 'checked' : ''}>
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
                            <button class="tn-tab-btn" data-tab="tuSi" title="Khu vực Tu Sĩ">🧘 Tu Sĩ</button>
                            <button class="tn-tab-btn" data-tab="troChien" title="Khu vực Trợ Chiến">⚔️ Trợ Chiến</button>
                            <button class="tn-tab-btn" data-tab="lichLuyen" title="Khu vực Lịch Luyện">🗺️ Lịch Luyện</button>
                            <button class="tn-tab-btn" data-tab="maDao" title="Khu vực Ma Đạo">🔥 Ma Đạo</button>
                            <button class="tn-tab-btn" data-tab="banner" title="Banner hero đang mở">🎴 Banner</button>
                        </div>

                        <!-- DANH SÁCH TÍNH NĂNG TRONG 5 TAB -->
                        <div class="tn-feature-panels">
                            <!-- TAB 1: ĐẠO THÀNH -->
                            <div id="tn-tab-panel-dao-thanh" class="tn-tab-panel active">
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
                            <div id="tn-tab-panel-lich-luyen" class="tn-tab-panel">
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
                                            <div style="font-size:9.5px; color:#a6adc8; margin-top:2px; line-height:1.3;">Mở Thủ Vệ Tứ Phái, xếp đội & Khiêu Chiến, sau mỗi trận chọn Buff ở giữa; hết lượt thì vào Chiến Lệnh nhận thưởng miễn phí.</div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoSectDefense" ${CONFIG.activeFeature === 'autoSectDefense' ? 'checked' : ''}>
                                    </label>
                                    <!-- MODULE 4 -->
                                    <label class="tn-opt-item" style="border-left: 3px solid #94e2d5;">
                                        <div>
                                            <div style="font-weight:bold; color:#94e2d5;">⚔️ [M4] Cửu Uyển Nhi, Cổ Thần, Cực Âm</div>
                                            <div style="font-size:9.5px; color:#a6adc8; margin-top:2px; line-height:1.3;">Cửu Uyển Nhi: bấm Quét nhanh khi khả dụng. Cổ Thần Địa: xếp tướng, đánh 4 ải quanh rồi ải giữa, dùng vật phẩm đặc biệt, nhận thưởng Diệt Thủ Hộ. Sau đó Cực Âm Địa.</div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoOtherTrials" ${CONFIG.activeFeature === 'autoOtherTrials' ? 'checked' : ''}>
                                    </label>
                                    <!-- CỰC ÂM ĐỊA (riêng) -->
                                    <label class="tn-opt-item" style="border-left: 3px solid #94e2d5;">
                                        <div>
                                            <div style="font-weight:bold; color:#94e2d5;">🧘 Cực Âm Địa (chiếm chỗ & Đoạt)</div>
                                            <div style="font-size:9.5px; color:#a6adc8; margin-top:2px; line-height:1.3;">Chọn địa từ Huyền Âm trở lên hợp sức, giành vị trí nếu đầy, Đoạt bằng lượt miễn phí rồi nhận Chiến Lệnh Cực Âm; hết giờ thì nhận thưởng.</div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoExtremeYin" ${CONFIG.activeFeature === 'autoExtremeYin' ? 'checked' : ''}>
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
                                            <div style="font-size:9.5px; color:#a6adc8; margin-top:2px; line-height:1.3;">Bắt đầu, chờ xem thẻ, ghép 8 cặp trong ~8-10s, chơi lại khi còn lượt thưởng, nhận thưởng mốc điểm.</div>
                                        </div>
                                        <input type="checkbox" class="tn-mutex-feature" data-key="autoMinigameMemory" ${CONFIG.activeFeature === 'autoMinigameMemory' ? 'checked' : ''}>
                                    </label>
                                    <!-- MODULE 7 -->
                                    <label class="tn-opt-item" style="border-left: 3px solid #f38ba8;">
                                        <div>
                                            <div style="font-weight:bold; color:#f38ba8;">🐉 [M7] Kiếm Hành & Điêu Long Khắc Tinh QTE</div>
                                            <div style="font-size:9.5px; color:#a6adc8; margin-top:2px; line-height:1.3;">Kiếm Hành: gieo xúc xắc đi hết 1 vòng (hết free thì mua bằng Tiên Ngọc, tối đa 12 lần/ngày), nhận Chiến Lệnh. Điêu Long: bấm nhịp Hoàn Mỹ 5 lần/ván, nhận rương, Khiêu chiến & Chiến Lệnh.</div>
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
                            <div id="tn-tab-panel-banner" class="tn-tab-panel"></div>

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
