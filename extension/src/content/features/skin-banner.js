        // =========================================================================
        // BANNER SKIN (Ảo Hình) - FashionRecCtrl; views fashionRecHallUi / fashionRecGoodGiftUi / devilSeaTrialUi.
        // Chạy đúng MỘT lượt khi bấm BẮT ĐẦU (hoặc là một bước của Quét nhanh), cùng cơ chế với Banner hero
        // (cờ bận bannerGiftBusy, bannerSleep/bannerWaitFor, runFinish khi xong). Các bước:
        //   1. Quà Ảo Hình (fashionRecGoodGiftUi): quà miễn phí + tối đa 1 quà mua bằng Tiên Ngọc mỗi ngày
        //      (không bao giờ đụng quà có price = tiền thật). Xác nhận khi getGiftBuyCount tăng.
        //   2. Chiêu mộ 1 lần (tab Chiêu Mộ, reqTreasure(1)): chỉ khi đã có vật phẩm chiêu mộ (không mở bảng "lấy thêm"), 1 lần/ngày.
        //   3. Chiến Lệnh Tầm Cẩm (tab Chiến Lệnh): nhận điểm nhiệm vụ rồi "Nhận nhanh".
        // Chỉ đọc qua thể hiện controller game đã tạo (bannerPeekInstance), không gọi gInst() sớm.
        // =========================================================================
        const SKIN_HALL_VIEW = 'fashionRecHallUi';
        const SKIN_GIFT_VIEW = 'fashionRecGoodGiftUi';
        const SKIN_POPUP_VIEWS = ['backpackGetAwardTipsUi', 'fashionRecPreviewUi', 'fashionRecGotoGetUi', 'heroPreviewUi'];
        const SKIN_MAX_PAID_GIFTS = 1;          // số quà Tiên Ngọc tối đa mỗi ngày
        const SKIN_MAX_RECRUITS = 1;            // số lần Chiêu mộ 1 lần tối đa mỗi ngày

        // Bộ đếm theo ngày giữ trong sessionStorage (tính ngay lúc gửi, sống qua lần tải lại trang).
        function skinDayCounterKey(name) {
            // Theo từng sự kiện (unique_id) và ngày: banner skin mới bắt đầu giữa ngày có bộ đếm riêng.
            let uid = 0;
            try { const c = skinGetController(); uid = c && c.getUniqueId ? c.getUniqueId() : 0; } catch (e) { }
            return `tnSkin:${uid}:${name}:${new Date().toDateString()}`;
        }
        function skinDayCounterRead(name) { try { return Number(sessionStorage.getItem(skinDayCounterKey(name))) || 0; } catch (e) { return 0; } }
        function skinDayCounterWrite(name, value) { try { sessionStorage.setItem(skinDayCounterKey(name), String(value)); } catch (e) { } }

        function skinGetController() {
            return bannerPeekInstance(window.FashionRecCtrl);
        }

        // Sự kiện skin đang mở và đã có dữ liệu máy chủ? Trả về { ok, ctrl, cfg } hoặc { ok:false, reason }.
        function skinOpenInfo() {
            const ctrl = skinGetController();
            if (!ctrl || typeof ctrl.getCfg !== 'function' || typeof ctrl.bInActTime !== 'function') return { ok: false, reason: 'chưa có dữ liệu sự kiện skin từ game' };
            if (!ctrl.sc19532) return { ok: false, reason: 'hiện không có sự kiện skin nào đang mở' };
            let cfg = null;
            try { cfg = ctrl.getCfg(); } catch (e) { }
            if (!cfg) return { ok: false, reason: 'hiện không có sự kiện skin nào đang mở' };
            if (!ctrl.bInActTime()) return { ok: false, reason: 'sự kiện skin đã hết hạn' };
            try {
                if (window.CityCtrl && window.CityCtrl.gInst && cfg.system_id && !window.CityCtrl.gInst().isHasShow(cfg.system_id)) {
                    return { ok: false, reason: 'sự kiện skin chưa mở khóa trong game' };
                }
            } catch (e) { }
            return { ok: true, ctrl, cfg };
        }

        // Tên skin của sự kiện: skin mục tiêu trong bể thưởng (đã chọn nếu sự kiện cho chọn, ngược lại các skin cố định).
        function skinEventName(ctrl, cfg) {
            try {
                const model = ctrl.getCurlModel();
                const propsCtrl = bannerPeekInstance(window.PropsCtrl) || (window.PropsCtrl && window.PropsCtrl.gInst && window.PropsCtrl.gInst());
                let ids = [];
                if (cfg.choice) {
                    const chosen = ctrl.sc19532 && ctrl.sc19532.grand_id;
                    if (!chosen) return 'chưa chọn skin mục tiêu';
                    ids = [chosen];
                } else {
                    ids = JSON.parse(cfg.pool_reward_id) || [];
                }
                const names = [];
                for (const id of ids.slice(0, 3)) {
                    const pool = model.getPoolRw(id);
                    const baseId = pool && pool.item && pool.item[0] && pool.item[0].base_id;
                    const name = baseId && propsCtrl ? propsCtrl.getItemNameByBaseId(baseId) : '';
                    if (name) names.push(String(name));
                }
                if (names.length) return names.join(', ');
            } catch (e) { }
            return '';
        }

        // Trạng thái hiển thị trên HUD (chỉ đọc; skinOpenInfo chỉ chạm cấu hình khi game đã nhận dữ liệu sự kiện).
        function skinHudStatus() {
            if (!skinGetController()) return { unknown: true };     // khung không có game (HUD): không báo gì, tránh ghi đè kết quả của khung game
            const info = skinOpenInfo();
            if (!info.ok) {
                // Chưa có dữ liệu sự kiện: nếu danh sách hoạt động từ máy chủ cũng chưa về thì vẫn đang tải, chưa kết luận "không có".
                try {
                    const D = bannerPeekInstance(window.DesenoActivityCtrl);
                    const dic = D && D.getCurlModel && D.getCurlModel().activity_status_dic;
                    if (!dic || !Object.keys(dic).length) return { unknown: true };
                } catch (e) { return { unknown: true }; }
                return { open: false, reason: info.reason };
            }
            let remainSec = 0;
            try { remainSec = info.ctrl.getCloseTime() - window.NetMgr.gInst().getTime(); } catch (e) { }
            return { open: true, uniqueId: info.ctrl.getUniqueId(), name: skinEventName(info.ctrl, info.cfg), remainSec };
        }

        // Quyết định cho một dòng quà: không bao giờ chọn quà có price (tiền thật).
        function skinGiftDecision(gift, remaining, paidSoFar) {
            if (Number(gift.price) > 0) return { action: 'skip', reason: 'quà nạp tiền thật (không mua)' };
            if (remaining <= 0) return { action: 'skip', reason: 'đã nhận/mua đủ hôm nay', silent: true };
            const gold = Number(gift.gold) || 0;
            if (gold === 0) return { action: 'claim', reason: 'miễn phí' };
            const cap = Number(CONFIG.bannerGoldPrice) || 300;
            if (gold > cap) return { action: 'skip', reason: `giá ${gold} Tiên Ngọc vượt trần ${cap}` };
            if (paidSoFar >= SKIN_MAX_PAID_GIFTS) return { action: 'skip', reason: `đã mua ${paidSoFar}/${SKIN_MAX_PAID_GIFTS} quà Tiên Ngọc hôm nay` };
            return { action: 'buy', reason: `${gold} Tiên Ngọc` };
        }

        async function skinStepGifts(ctx) {
            const { ctrl, vm, tag } = ctx;
            const model = ctrl.getCurlModel();
            if (typeof ctrl.openGoodGift !== 'function' || typeof ctrl.getGiftBuyCount !== 'function' || !model ||
                typeof model.getGiftCfgVo !== 'function') {
                sendLog(`⚠️ ${tag} Không tìm thấy bộ điều khiển quà skin.`, 'err');
                return;
            }
            try {
                ctrl.openGoodGift();
                const view = await bannerWaitFor(() => {
                    const v = vm.getViewByName(SKIN_GIFT_VIEW);
                    return v && vm.viewIsVisible(SKIN_GIFT_VIEW) && v.giftList && v.giftList.numElements > 0 && ctrl.buyGiftDataDic ? v : null;
                }, 6000);
                if (!view) {
                    sendLog(`⚠️ ${tag} Không mở được bảng Quà Ảo Hình hoặc chưa nhận dữ liệu từ máy chủ.`, 'err');
                    return;
                }
                const list = view.giftList;
                const rendered = [];
                for (let i = 0; i < list.numElements; i++) {
                    const el = list.getElementAt(i);
                    if (el && el.data) rendered.push(el);
                }
                const source = view.giftListCol && Array.isArray(view.giftListCol.source) && view.giftListCol.source.length
                    ? view.giftListCol.source.slice() : rendered.map((el) => el.data);
                sendLog(`ℹ️ ${tag} Bảng Quà Ảo Hình có ${source.length} dòng.`, 'info');

                let claimed = 0;
                let bought = 0;
                for (const gift of source) {
                    if (!gift) continue;
                    if (!ctrl.bInActTime()) { sendLog(`ℹ️ ${tag} Sự kiện đã đóng; dừng.`, 'info'); break; }
                    const before = ctrl.getGiftBuyCount(gift.charge_id);
                    const remaining = (Number(gift.purchase_times) || 0) - before;
                    const decision = skinGiftDecision(gift, remaining, skinDayCounterRead('paid'));
                    const name = gift.name || `#${gift.charge_id}`;
                    if (decision.action === 'skip') {
                        if (!decision.silent) sendLog(`ℹ️ ${tag} Bỏ qua "${name}": ${decision.reason}.`, 'info');
                        continue;
                    }
                    const item = rendered.find((el) => el.data && el.data.charge_id === gift.charge_id) || null;
                    if (item) {
                        const button = decision.action === 'claim' ? item.buyBtn : item.moneyBtn;
                        if (!bannerOffered(button)) {
                            sendLog(`ℹ️ ${tag} "${name}" không có nút ${decision.action === 'claim' ? 'Nhận' : 'mua Tiên Ngọc'} trên giao diện; bỏ qua.`, 'info');
                            continue;
                        }
                    } else if (!window.RechargeCtrl || typeof window.RechargeCtrl.gInst !== 'function' ||
                        typeof window.RechargeCtrl.gInst().send12323 !== 'function') {
                        sendLog(`⚠️ ${tag} "${name}" chưa hiển thị và không tìm thấy lệnh mua của game; bỏ qua.`, 'err');
                        continue;
                    }
                    if (decision.action === 'buy' && window.CommonUtils && typeof window.CommonUtils.getRoleAsset === 'function' &&
                        (Number(window.CommonUtils.getRoleAsset('gold')) || 0) < (Number(gift.gold) || 0)) {
                        sendLog(`ℹ️ ${tag} Không đủ Tiên Ngọc để mua "${name}" (${gift.gold}); bỏ qua.`, 'info');
                        continue;
                    }

                    // Mua bằng Tiên Ngọc: tính vào bộ đếm ngày ngay lúc gửi (kể cả khi mạng rớt chưa kịp xác nhận).
                    if (decision.action === 'buy') skinDayCounterWrite('paid', skinDayCounterRead('paid') + 1);
                    sendLog(`🎁 ${tag} ${decision.action === 'buy' ? 'Mua' : 'Nhận'} "${name}" (${decision.reason}).`, decision.action === 'buy' ? 'result' : 'action');
                    // Cùng đường gửi với nút của ô quà (không có giá nạp tiền): send12323(charge_id).
                    if (item) item.onBuyHandler();
                    else window.RechargeCtrl.gInst().send12323(gift.charge_id);

                    let confirmed = false;
                    const clickedAt = Date.now();
                    await bannerSleep(800);
                    try { ctrl.send19535(); } catch (e) { }
                    while (Date.now() - clickedAt < BANNER_CONFIRM_MS) {
                        if (ctrl.getGiftBuyCount(gift.charge_id) > before) { confirmed = true; break; }
                        await bannerSleep(300);
                    }
                    if (confirmed) {
                        if (decision.action === 'buy') bought++; else claimed++;
                        sendLog(`✅ ${tag} Đã ${decision.action === 'buy' ? 'mua' : 'nhận'} "${name}".`, 'result');
                    } else {
                        sendLog(`⚠️ ${tag} Máy chủ chưa xác nhận "${name}".`, 'err');
                    }
                    // Đóng bảng thưởng vừa hiện (nếu có) để không chặn dòng kế.
                    bannerCloseViews(ctx, SKIN_POPUP_VIEWS);
                }
                if (!claimed && !bought) sendLog(`ℹ️ ${tag} Không có quà Ảo Hình nào để nhận/mua lúc này.`, 'info');
            } finally {
                try { vm.closeView(SKIN_GIFT_VIEW); } catch (e) { }
            }
        }

        // Mở Sảnh skin ở đúng tab (đóng Sảnh cũ trước để tab được chọn lại) và đợi tab sẵn sàng.
        async function skinOpenHallTab(ctx, tabType, isReady) {
            try { ctx.vm.closeView(SKIN_HALL_VIEW); } catch (e) { }
            await bannerSleep(300);
            ctx.ctrl.openHall(tabType);
            const hallNow = await bannerWaitFor(() => {
                const h = ctx.vm.getViewByName(SKIN_HALL_VIEW);
                return h && ctx.vm.viewIsVisible(SKIN_HALL_VIEW) ? h : null;
            }, 5000);
            if (hallNow && typeof hallNow.getTabIsOpen === 'function' && !hallNow.getTabIsOpen(tabType)) {
                sendLog(`ℹ️ ${ctx.tag} Tab này chưa mở trong game; bỏ qua.`, 'info');
                return null;
            }
            return bannerWaitFor(() => {
                const hall = ctx.vm.getViewByName(SKIN_HALL_VIEW);
                if (!hall || !ctx.vm.viewIsVisible(SKIN_HALL_VIEW) || !hall.currView) return null;
                if (typeof hall.getSelectIdx === 'function' && hall.getSelectIdx() !== tabType) return null;
                return isReady(hall.currView) ? hall.currView : null;
            }, 8000);
        }

        async function skinStepRecruit(ctx) {
            const { ctrl, vm, tag, cfg } = ctx;
            const TabType = window.FashionRecConst && window.FashionRecConst.TabType;
            const props = window.PropsCtrl && window.PropsCtrl.gInst ? window.PropsCtrl.gInst() : null;
            if (!TabType || !props) { sendLog(`⚠️ ${tag} Không tìm thấy tab Chiêu Mộ của game.`, 'err'); return; }
            if (skinDayCounterRead('recruit') >= SKIN_MAX_RECRUITS) {
                sendLog(`ℹ️ ${tag} Hôm nay đã chiêu mộ ${SKIN_MAX_RECRUITS} lần; không chiêu mộ thêm.`, 'info');
                return;
            }
            const have = Number(props.getGoodsNumByBaseId(cfg.recruit_item)) || 0;
            if (have < 1) {
                sendLog(`ℹ️ ${tag} Không đủ vật phẩm Chiêu Mộ (cần 1); bỏ qua bước Chiêu Mộ.`, 'info');
                return;
            }
            if (cfg.choice && !(ctrl.sc19532 && ctrl.sc19532.grand_id)) {
                sendLog(`ℹ️ ${tag} Chưa chọn skin mục tiêu cho Chiêu Mộ (cần chọn tay trong game); bỏ qua.`, 'info');
                return;
            }
            const view = await skinOpenHallTab(ctx, TabType.recruit,
                (v) => typeof v.reqTreasure === 'function' && bannerOffered(v.treasureBtn1));
            if (!view) { sendLog(`⚠️ ${tag} Không mở được tab Chiêu Mộ.`, 'err'); return; }
            const timesBefore = Number(ctrl.sc19532.recruit_times) || 0;
            skinDayCounterWrite('recruit', skinDayCounterRead('recruit') + 1);     // tính ngay lúc gửi
            sendLog(`🎯 ${tag} Chiêu mộ 1 lần.`, 'action');
            view.reqTreasure(1);
            const confirmed = await bannerWaitFor(() =>
                (Number(ctrl.sc19532.recruit_times) || 0) > timesBefore ||
                Number(props.getGoodsNumByBaseId(cfg.recruit_item)) < have ||
                SKIN_POPUP_VIEWS.some((name) => vm.viewIsVisible(name)), 8000);
            // Đóng bảng kết quả (phần thưởng / xem skin mới) cho tới khi không còn hiện.
            for (let quiet = 0; quiet < 3;) {
                await bannerSleep(500);
                quiet = bannerCloseViews(ctx, SKIN_POPUP_VIEWS) ? 0 : quiet + 1;
            }
            sendLog(confirmed ? `✅ ${tag} Đã chiêu mộ 1 lần.` : `⚠️ ${tag} Máy chủ chưa xác nhận lượt chiêu mộ.`, confirmed ? 'result' : 'err');
        }

        async function skinStepZhanling(ctx) {
            const { tag } = ctx;
            const TabType = window.FashionRecConst && window.FashionRecConst.TabType;
            if (!TabType) { sendLog(`⚠️ ${tag} Không tìm thấy tab Chiến Lệnh của game.`, 'err'); return; }
            const zl = await skinOpenHallTab(ctx, TabType.zhanling,
                (v) => typeof v.onClickTrial === 'function' && typeof v.onClick === 'function' && v.onekeyBtn);
            if (!zl) { sendLog(`⚠️ ${tag} Không mở được tab Chiến Lệnh.`, 'err'); return; }
            await bannerZhanlingTasksAndQuickClaim(ctx, zl);
        }

        async function skinBannerRunOnce() {
            if (CONFIG.activeFeature !== 'autoSkinBanner' || bannerGiftBusy) return;

            bannerGiftBusy = true;
            bannerAbortRequested = false;
            let aborted = false;
            let ctx = null;
            try {
                const vm = window.ViewMgr && window.ViewMgr.gInst ? window.ViewMgr.gInst() : null;
                if (!vm || typeof vm.viewIsVisible !== 'function') {
                    sendLog('⚠️ [Banner Skin] Game chưa sẵn sàng; bấm BẮT ĐẦU lại sau.', 'err');
                    return;
                }
                if (BANNER_BUSY_VIEWS.some((name) => vm.viewIsVisible(name)) || bannerIsFighting()) {
                    sendLog('⚠️ [Banner Skin] Đang ở màn hình trận đấu/đội hình; bấm BẮT ĐẦU lại sau.', 'err');
                    return;
                }
                const info = skinOpenInfo();
                if (!info.ok) {
                    sendLog(`ℹ️ [Banner Skin] ${info.reason}; không có gì để làm.`, 'info');
                    return;
                }
                const tag = '[Banner Skin]';
                ctx = { ctrl: info.ctrl, vm, cfg: info.cfg, tag };
                const skinName = skinEventName(info.ctrl, info.cfg);
                sendLog(`👘 [Banner Skin${skinName ? ' - ' + skinName : ''}] Làm việc ngày: Quà Ảo Hình → Chiêu mộ 1 lần → Chiến Lệnh.`, 'action');
                const steps = [['Quà Ảo Hình', skinStepGifts], ['Chiêu Mộ', skinStepRecruit], ['Chiến Lệnh', skinStepZhanling]];
                for (const [label, step] of steps) {
                    if (!info.ctrl.bInActTime()) { sendLog(`ℹ️ ${tag} Sự kiện đã đóng; dừng.`, 'info'); break; }
                    try {
                        await step(ctx);
                    } catch (error) {
                        if (error && error.bannerAbort) throw error;
                        sendLog(`⚠️ ${tag} Lỗi ở bước ${label}: ${error && error.message || error}`, 'err');
                    }
                }
            } catch (error) {
                if (error && error.bannerAbort) aborted = true;
                else sendLog(`⚠️ [Banner Skin] Lỗi: ${error && error.message || error}`, 'err');
            } finally {
                if (ctx) bannerCloseViews(ctx, [SKIN_GIFT_VIEW, SKIN_HALL_VIEW, BANNER_TRIAL_VIEW].concat(SKIN_POPUP_VIEWS));
                bannerGiftBusy = false;
                bannerAbortRequested = false;
                if (!aborted && CONFIG.activeFeature === 'autoSkinBanner') runFinish('');
            }
        }
