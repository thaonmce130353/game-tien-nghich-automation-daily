
        // Nhận Thưởng Ngày: WelfareCtrl (welfareUi: Điểm danh / Thẻ tháng / Quà giới hạn tuần-tháng), RechargeHall tab Quà ngày
        // (WelfareCtrl) và Tiên Sư tăng bật (VipCtrl, godVipSignUi). Chỉ nhận phần thưởng MIỄN PHÍ, không mua gì, không đụng quà tiền thật.
        // Mỗi nhịp một việc, máy trạng thái dailyRewardState.phase:
        //   signin -> monthcard -> gifts -> vip -> done
        //   - signin:    send30101 (tải) -> send30102 (điểm danh hôm nay) -> hộp điểm danh liên tiếp (send30103) nếu đã tới mốc
        //   - monthcard: send30105 (tải) -> send30107(card_id) cho từng thẻ tháng còn hạn mà chưa nhận Tiên Ngọc hôm nay
        //   - gifts:     send30108 (tải) -> Quà ngày miễn phí (send30115) -> quà giới hạn tuần/tháng giá 0 (send12323(gift_id), như nút của game)
        //   - vip:       send12407 (tải) -> điểm VIP hằng ngày (send12408) nếu chưa nhận
        // Mỗi lời gọi lấy từ đúng nút của game (SignInItemUi, MonthCardUi, RechargeDayGiftItem, GiftItemUi, GodVipSignUi).
        // Chỉ ghi "đã" khi dữ liệu máy chủ xác nhận; thiếu phản hồi thì báo lỗi, không gửi lại. Mỗi lượt chạy kiểm tra lại từ máy chủ
        // (mọi bước đều idempotent: phần đã nhận thì máy chủ báo đã nhận, không gửi gì).
        const DAILY_REWARD_TIMEOUT_MS = 15000;
        const DAILY_REWARD_MONTH_CARD_NAMES = ['Hào Hoa', 'Chí Tôn'];
        let dailyRewardState = null;
        let dailyRewardDidSend = false;     // nhịp này đã gửi yêu cầu thật (nếu không: chỉ chờ, scheduler kiểm tra lại ngay)
        runResetHooks.push(() => { dailyRewardState = null; });

        function createDailyRewardState() {
            return {
                phase: 'signin',
                failed: false,
                confirmed: 0,
                summary: { signin: 0, contBox: 0, monthCards: 0, dailyGift: 0, weekGifts: 0, monthGifts: 0, vip: 0 },
                signin: { stage: 'refresh', refreshing: null, pending: null },
                month: { stage: 'refresh', refreshing: null, index: 0, pending: null },
                gifts: { stage: 'refresh', refreshing: null, daily: 'check', queue: null, pending: null },
                vip: { stage: 'refresh', refreshing: null, pending: null },
                lastPopupAt: 0,
                summarized: false
            };
        }

        function dailyRewardFail(s, section, message, nextPhase) {
            sendLog(`❌ [Nhận Thưởng Ngày - ${section}] ${message}`, "error");
            s.failed = true;
            s.phase = nextPhase;
        }

        function dailyRewardSend(fn) {
            dailyRewardDidSend = true;
            return fn();
        }

        // ---- Điểm danh ---------------------------------------------------------------------------------
        function dailyRewardStepSignin(ctx, s, now) {
            const wc = ctx.WelfareCtrl && ctx.WelfareCtrl.gInst && ctx.WelfareCtrl.gInst();
            const model = wc && wc.getCurlModel && wc.getCurlModel();
            if (!wc || !model || typeof wc.send30101 !== 'function' || typeof wc.send30102 !== 'function') {
                logUnsupportedOnce('daily-reward-signin', "⚠️ [Nhận Thưởng Ngày - Điểm danh] Game chưa sẵn sàng (WelfareCtrl); bỏ qua.");
                s.phase = 'monthcard';
                return;
            }
            const st = s.signin;
            if (st.pending) {
                const p = st.pending;
                const d = model.scmd30101Data;
                const done = p.kind === 'sign' ? d && Number(d.is_sign) === 1 : d && Number(d.is_cont_award) === 1;
                if (done) {
                    st.pending = null;
                    s.confirmed++;
                    if (p.kind === 'sign') {
                        s.summary.signin++;
                        sendLog(`✅ [Nhận Thưởng Ngày - Điểm danh] Máy chủ xác nhận đã điểm danh hôm nay (đã điểm danh ${d.acc_days} ngày, liên tiếp ${d.cont_days} ngày).`, "result");
                    } else {
                        s.summary.contBox++;
                        sendLog(`✅ [Nhận Thưởng Ngày - Điểm danh] Máy chủ xác nhận đã nhận thưởng điểm danh liên tiếp (${d.cont_days} ngày).`, "result");
                    }
                } else if (now - p.at >= DAILY_REWARD_TIMEOUT_MS) {
                    st.pending = null;
                    dailyRewardFail(s, 'Điểm danh', `Máy chủ chưa xác nhận ${p.kind === 'sign' ? 'điểm danh' : 'nhận thưởng liên tiếp'}; không gửi lại.`, 'monthcard');
                }
                return;
            }
            if (st.stage === 'refresh') {
                const r = pollTowerDailyRefresh(st, 'refreshing', now, () => dailyRewardSend(() => wc.send30101()), () => model.scmd30101Data);
                if (r === 'wait') return;
                if (r !== 'ready') { dailyRewardFail(s, 'Điểm danh', "Máy chủ chưa trả dữ liệu điểm danh; bỏ qua bước này.", 'monthcard'); return; }
                st.stage = 'decide';
                return;
            }
            const d = model.scmd30101Data;
            if (!d) { dailyRewardFail(s, 'Điểm danh', "Không đọc được dữ liệu điểm danh.", 'monthcard'); return; }
            if (Number(d.is_sign) === 0 && !st.signSent) {
                st.signSent = true;
                st.pending = { kind: 'sign', at: now };
                dailyRewardSend(() => wc.send30102());
                sendLog(`📅 [Nhận Thưởng Ngày - Điểm danh] Điểm danh hôm nay (ngày ${(Number(d.acc_days) || 0) + 1})...`, "action");
                return;
            }
            // Hộp điểm danh liên tiếp: cùng điều kiện với chấm đỏ của game (mốc đúng bằng số ngày liên tiếp, chưa nhận).
            if (Number(d.is_cont_award) === 0 && !st.contSent && typeof wc.send30103 === 'function' && typeof model.getSignInListByCycle === 'function') {
                let reached = false;
                try {
                    reached = model.getSignInListByCycle(101, d.cont_cycle).some((x) => x.day === d.cont_days);
                } catch (e) { }
                if (reached) {
                    st.contSent = true;
                    st.pending = { kind: 'cont', at: now };
                    dailyRewardSend(() => wc.send30103());
                    sendLog(`🎁 [Nhận Thưởng Ngày - Điểm danh] Nhận thưởng điểm danh liên tiếp (mốc ${d.cont_days} ngày)...`, "action");
                    return;
                }
            }
            if (!st.signSent && !st.contSent) sendLog("ℹ️ [Nhận Thưởng Ngày - Điểm danh] Hôm nay đã điểm danh; không còn thưởng điểm danh để nhận.", "info");
            s.phase = 'monthcard';
        }

        // ---- Thẻ tháng (Hào Hoa / Chí Tôn): Tiên Ngọc hằng ngày --------------------------------------------
        function dailyRewardStepMonthCard(ctx, s, now) {
            const wc = ctx.WelfareCtrl && ctx.WelfareCtrl.gInst && ctx.WelfareCtrl.gInst();
            const model = wc && wc.getCurlModel && wc.getCurlModel();
            if (!wc || !model || typeof wc.send30105 !== 'function' || typeof wc.send30107 !== 'function' ||
                typeof model.getMonthCardList !== 'function' || typeof model.getMonthCardDataById !== 'function') {
                logUnsupportedOnce('daily-reward-month', "⚠️ [Nhận Thưởng Ngày - Thẻ tháng] Game chưa sẵn sàng; bỏ qua.");
                s.phase = 'gifts';
                return;
            }
            const st = s.month;
            const serverNow = () => (ctx.NetMgr && ctx.NetMgr.gInst ? ctx.NetMgr.gInst().getTime() : Date.now() / 1000);
            if (st.pending) {
                const p = st.pending;
                const data = model.getMonthCardDataById(p.cardId);
                if (data && Number(data.is_award) === 1) {
                    st.pending = null;
                    s.confirmed++;
                    s.summary.monthCards++;
                    sendLog(`✅ [Nhận Thưởng Ngày - Thẻ tháng] Máy chủ xác nhận đã nhận Tiên Ngọc thẻ tháng ${p.name}.`, "result");
                    st.index++;
                } else if (now - p.at >= DAILY_REWARD_TIMEOUT_MS) {
                    st.pending = null;
                    sendLog(`⚠️ [Nhận Thưởng Ngày - Thẻ tháng] Máy chủ chưa xác nhận thẻ tháng ${p.name}; không gửi lại.`, "warn");
                    s.failed = true;
                    st.index++;
                }
                return;
            }
            if (st.stage === 'refresh') {
                const r = pollTowerDailyRefresh(st, 'refreshing', now, () => dailyRewardSend(() => wc.send30105()), () => model.scmd30105Data);
                if (r === 'wait') return;
                if (r !== 'ready') { dailyRewardFail(s, 'Thẻ tháng', "Máy chủ chưa trả dữ liệu thẻ tháng; bỏ qua bước này.", 'gifts'); return; }
                st.stage = 'decide';
                return;
            }
            let cards = [];
            try { cards = model.getMonthCardList(); } catch (e) { }
            if (st.index >= cards.length) {
                if (!st.any) sendLog("ℹ️ [Nhận Thưởng Ngày - Thẻ tháng] Không có thẻ tháng nào còn hạn chưa nhận hôm nay.", "info");
                s.phase = 'gifts';
                return;
            }
            const cfg = cards[st.index];
            const name = DAILY_REWARD_MONTH_CARD_NAMES[st.index] || `#${cfg.month_id}`;
            const data = model.getMonthCardDataById(cfg.month_id);
            // Giống MonthCardUi: còn hạn (expire >= giờ máy chủ), đã mua, chưa nhận hôm nay (is_award == 0).
            const active = data && Number(data.expire) >= serverNow() && (Number(data.buy_times) !== 0 || Number(data.expire) !== 0);
            if (!active || Number(data.is_award) !== 0) { st.index++; return; }
            st.any = true;
            st.pending = { cardId: cfg.month_id, name, at: now };
            dailyRewardSend(() => wc.send30107(cfg.month_id));
            sendLog(`💎 [Nhận Thưởng Ngày - Thẻ tháng] Nhận Tiên Ngọc thẻ tháng ${name}...`, "action");
        }

        // ---- Quà ngày miễn phí + quà giới hạn tuần/tháng giá 0 -----------------------------------------------
        function dailyRewardFreeGifts(model, d, type) {
            const cycle = type === ctxWelfareWeek() ? d.week_cycle : d.month_cycle;
            let list = [];
            try { list = model.getGiftListByType(type, cycle) || []; } catch (e) { }
            return list.filter((g) => Number(g.price) === 0);
        }
        function ctxWelfareWeek() { return (window.WelfareConst && window.WelfareConst.WEEK_GIFT_TYPE) || 101; }
        function ctxWelfareMonth() { return (window.WelfareConst && window.WelfareConst.MONTH_GIFT_TYPE) || 102; }

        function dailyRewardGiftRemaining(model, g) {
            const row = model.getGiftDataById(g.gift_id);
            return (Number(g.purchase_time) || 0) - (row ? Number(row.buy_times) || 0 : 0);
        }

        function dailyRewardStepGifts(ctx, s, now) {
            const wc = ctx.WelfareCtrl && ctx.WelfareCtrl.gInst && ctx.WelfareCtrl.gInst();
            const rc = ctx.RechargeCtrl && ctx.RechargeCtrl.gInst && ctx.RechargeCtrl.gInst();
            const model = wc && wc.getCurlModel && wc.getCurlModel();
            if (!wc || !rc || !model || typeof wc.send30108 !== 'function' || typeof wc.send30115 !== 'function' ||
                typeof rc.send12323 !== 'function' || typeof model.getGiftListByType !== 'function' || typeof model.getGiftDataById !== 'function') {
                logUnsupportedOnce('daily-reward-gifts', "⚠️ [Nhận Thưởng Ngày - Quà] Game chưa sẵn sàng; bỏ qua.");
                s.phase = 'vip';
                return;
            }
            const st = s.gifts;
            const refresh = (key) => pollTowerDailyRefresh(st, key, now, () => dailyRewardSend(() => wc.send30108()), () => model.scmd30108Data);
            if (st.pending) {
                const p = st.pending;
                const d = model.scmd30108Data;
                let done = false;
                if (p.kind === 'daily') {
                    done = d && Number(d.is_reward) === 1;
                } else {
                    done = d && d !== p.token && model.getGiftDataById(p.giftId) && Number(model.getGiftDataById(p.giftId).buy_times) > p.before;
                }
                if (done) {
                    st.pending = null;
                    s.confirmed++;
                    if (p.kind === 'daily') {
                        s.summary.dailyGift++;
                        sendLog("✅ [Nhận Thưởng Ngày - Quà ngày] Máy chủ xác nhận đã nhận quà ngày miễn phí.", "result");
                    } else {
                        if (p.type === ctxWelfareWeek()) s.summary.weekGifts++; else s.summary.monthGifts++;
                        sendLog(`✅ [Nhận Thưởng Ngày - Quà ${p.type === ctxWelfareWeek() ? 'tuần' : 'tháng'}] Máy chủ xác nhận đã nhận "${p.name}".`, "result");
                    }
                } else if (now - p.at >= DAILY_REWARD_TIMEOUT_MS) {
                    st.pending = null;
                    sendLog(`⚠️ [Nhận Thưởng Ngày - Quà] Máy chủ chưa xác nhận ${p.kind === 'daily' ? 'quà ngày' : `"${p.name}"`}; không gửi lại.`, "warn");
                    s.failed = true;
                    if (p.kind === 'daily') st.daily = 'done';
                } else if (p.kind !== 'daily' && now - p.at >= 2000 && now - p.lastRefreshAt >= 2000) {
                    // Số lần nhận của quà giới hạn chỉ cập nhật khi tải lại dữ liệu.
                    p.lastRefreshAt = now;
                    dailyRewardSend(() => wc.send30108());
                }
                if (p && !st.pending && p.kind === 'daily') st.daily = 'done';
                return;
            }
            if (st.stage === 'refresh') {
                const r = refresh('refreshing');
                if (r === 'wait') return;
                if (r !== 'ready') { dailyRewardFail(s, 'Quà', "Máy chủ chưa trả dữ liệu quà ngày/tuần/tháng; bỏ qua bước này.", 'vip'); return; }
                st.stage = 'decide';
                return;
            }
            const d = model.scmd30108Data;
            if (!d) { dailyRewardFail(s, 'Quà', "Không đọc được dữ liệu quà ngày/tuần/tháng.", 'vip'); return; }

            // 1) Quà ngày miễn phí (RechargeDayGiftItem: ô miễn phí -> send30115), chỉ khi chưa nhận (is_reward == 0).
            if (st.daily === 'check') {
                if (Number(d.is_reward) === 0) {
                    st.daily = 'sent';
                    st.pending = { kind: 'daily', at: now };
                    dailyRewardSend(() => wc.send30115());
                    sendLog("🎁 [Nhận Thưởng Ngày - Quà ngày] Nhận quà ngày miễn phí...", "action");
                    return;
                }
                st.daily = 'done';
                sendLog("ℹ️ [Nhận Thưởng Ngày - Quà ngày] Quà ngày miễn phí đã nhận hôm nay.", "info");
            }

            // 2) Quà giới hạn tuần/tháng giá 0 (GiftItemUi -> RechargeCtrl.rechargeMoney -> send12323 khi không có giá).
            if (!st.queue) {
                st.queue = [];
                for (const type of [ctxWelfareWeek(), ctxWelfareMonth()]) {
                    for (const g of dailyRewardFreeGifts(model, d, type)) st.queue.push({ type, gift: g });
                }
            }
            while (st.queue.length) {
                const item = st.queue.shift();
                const g = item.gift;
                const remaining = dailyRewardGiftRemaining(model, g);
                if (remaining <= 0) continue;
                // Chốt chặn: chỉ gửi khi cấu hình nạp của quà này thật sự không có giá (không bao giờ là quà tiền thật).
                let priced = true;
                try {
                    const cd = ctx.GlobalCtrl.gInst().getCurlModel().getChargeData(g.gift_id);
                    priced = !cd || Boolean(cd.price);
                } catch (e) { }
                if (priced) {
                    sendLog(`ℹ️ [Nhận Thưởng Ngày - Quà] Bỏ qua "${g.show_name || '#' + g.gift_id}": không xác định là quà miễn phí.`, "info");
                    continue;
                }
                const name = g.show_name || `#${g.gift_id}`;
                st.attemptedLimit = true;
                st.pending = { kind: 'limit', type: item.type, giftId: g.gift_id, name, before: Number((model.getGiftDataById(g.gift_id) || {}).buy_times) || 0, token: d, at: now, lastRefreshAt: now };
                dailyRewardSend(() => rc.send12323(g.gift_id));
                sendLog(`🎁 [Nhận Thưởng Ngày - Quà ${item.type === ctxWelfareWeek() ? 'tuần' : 'tháng'}] Nhận "${name}" (miễn phí)...`, "action");
                return;
            }
            if (!st.attemptedLimit) sendLog("ℹ️ [Nhận Thưởng Ngày - Quà tuần/tháng] Không có quà miễn phí tuần/tháng nào để nhận.", "info");
            s.phase = 'vip';
        }

        // ---- Điểm VIP hằng ngày (Tiên Sư tăng bật: godVipSignUi -> send12408) ---------------------------------
        function dailyRewardStepVip(ctx, s, now) {
            const vc = ctx.VipCtrl && ctx.VipCtrl.gInst && ctx.VipCtrl.gInst();
            if (!vc || typeof vc.send12407 !== 'function' || typeof vc.send12408 !== 'function' || typeof vc.isSignVip !== 'function') {
                logUnsupportedOnce('daily-reward-vip', "⚠️ [Nhận Thưởng Ngày - Điểm VIP] Game chưa sẵn sàng (VipCtrl); bỏ qua.");
                s.phase = 'done';
                return;
            }
            const st = s.vip;
            if (st.pending) {
                const p = st.pending;
                if (vc.isSignVip()) {
                    st.pending = null;
                    s.confirmed++;
                    s.summary.vip++;
                    const d = vc.scmd12407;
                    sendLog(`✅ [Nhận Thưởng Ngày - Điểm VIP] Máy chủ xác nhận đã nhận điểm VIP hằng ngày${d && d.continue_day ? ` (liên tiếp ${d.continue_day} ngày)` : ''}.`, "result");
                    s.phase = 'done';
                } else if (now - p.at >= DAILY_REWARD_TIMEOUT_MS) {
                    st.pending = null;
                    dailyRewardFail(s, 'Điểm VIP', "Máy chủ chưa xác nhận nhận điểm VIP; không gửi lại.", 'done');
                } else if (now - p.at >= 1500 && now - p.lastRefreshAt >= 1500) {
                    p.lastRefreshAt = now;
                    dailyRewardSend(() => vc.send12407());
                }
                return;
            }
            if (st.stage === 'refresh') {
                const r = pollTowerDailyRefresh(st, 'refreshing', now, () => dailyRewardSend(() => vc.send12407()), () => vc.scmd12407);
                if (r === 'wait') return;
                if (r !== 'ready') { dailyRewardFail(s, 'Điểm VIP', "Máy chủ chưa trả dữ liệu điểm danh VIP; bỏ qua bước này.", 'done'); return; }
                st.stage = 'decide';
                return;
            }
            if (vc.isSignVip()) {
                sendLog("ℹ️ [Nhận Thưởng Ngày - Điểm VIP] Hôm nay đã nhận điểm VIP.", "info");
                s.phase = 'done';
                return;
            }
            // Điểm danh VIP chỉ mở từ một cấp VIP nhất định (godVipUi: signGp.visible = vip_lev >= cấu hình.open).
            try {
                const role = ctx.RoleCtrl.gInst().getRoleInfo();
                const cfg = vc.getCurlModel().getVipLevelConfigByLev(role.vip_lev);
                if (cfg && Number(role.vip_lev) < Number(cfg.open)) {
                    sendLog(`ℹ️ [Nhận Thưởng Ngày - Điểm VIP] Chưa đủ cấp VIP để điểm danh (VIP ${role.vip_lev}, cần ${cfg.open}); bỏ qua.`, "info");
                    s.phase = 'done';
                    return;
                }
            } catch (e) { }
            st.pending = { at: now, lastRefreshAt: now };
            dailyRewardSend(() => vc.send12408());
            sendLog("⭐ [Nhận Thưởng Ngày - Điểm VIP] Nhận điểm VIP hằng ngày (Tiên Sư tăng bật)...", "action");
        }

        // Trả về: true (đã gửi/hành động thật) | 'wait' (chỉ chờ máy chủ/chuyển bước) | false (đã xong).
        function handleDailyReward(ctx) {
            try {
                if (!dailyRewardState) {
                    dailyRewardState = createDailyRewardState();
                    sendLog("🎁 [Nhận Thưởng Ngày] Bắt đầu: điểm danh, thẻ tháng, quà ngày/tuần/tháng, điểm VIP (chỉ phần miễn phí).", "action");
                }
                const s = dailyRewardState;
                const now = Date.now();
                // Phần thưởng nhận được làm hiện bảng nhận quà: đóng định kỳ để không chặn màn hình.
                if (now - s.lastPopupAt >= 700) { s.lastPopupAt = now; closeStrayPopups(); }
                if (s.phase === 'done') {
                    if (!s.summarized) {
                        s.summarized = true;
                        const m = s.summary;
                        const parts = [];
                        if (m.signin) parts.push('điểm danh');
                        if (m.contBox) parts.push('thưởng liên tiếp');
                        if (m.monthCards) parts.push(`${m.monthCards} thẻ tháng`);
                        if (m.dailyGift) parts.push('quà ngày');
                        if (m.weekGifts) parts.push(`${m.weekGifts} quà tuần`);
                        if (m.monthGifts) parts.push(`${m.monthGifts} quà tháng`);
                        if (m.vip) parts.push('điểm VIP');
                        sendLog(s.confirmed
                            ? `${s.failed ? '⚠️' : '✅'} [Nhận Thưởng Ngày] Máy chủ xác nhận ${s.confirmed} phần thưởng: ${parts.join(', ')}.`
                            : `${s.failed ? '⚠️' : 'ℹ️'} [Nhận Thưởng Ngày] Không có phần thưởng mới để nhận${s.failed ? ' (có bước lỗi/chưa xác nhận)' : ''}.`,
                            s.confirmed ? 'result' : (s.failed ? 'warn' : 'info'));
                    }
                    return false;
                }
                dailyRewardDidSend = false;
                if (s.phase === 'signin') dailyRewardStepSignin(ctx, s, now);
                else if (s.phase === 'monthcard') dailyRewardStepMonthCard(ctx, s, now);
                else if (s.phase === 'gifts') dailyRewardStepGifts(ctx, s, now);
                else if (s.phase === 'vip') dailyRewardStepVip(ctx, s, now);
                return dailyRewardDidSend ? true : 'wait';
            } catch (e) {
                sendLog(`❌ [Nhận Thưởng Ngày] Lỗi: ${e && e.message || e}`, "error");
                if (dailyRewardState) { dailyRewardState.failed = true; dailyRewardState.phase = 'done'; }
                return false;
            }
        }
