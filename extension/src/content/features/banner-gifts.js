        // =========================================================================
        // BANNER HERO: QUÀ (MIỄN PHÍ + QUÀ TIÊN NGỌC) VÀ ĐIỀU PHỐI QUY TRÌNH KHI BANNER ĐANG MỞ
        // Tick ô banner chỉ là CHỌN. Quy trình chạy đúng MỘT lượt khi bấm "BẮT ĐẦU" (bannerRunOnce),
        // không lặp, không tự thử lại. Bước Quà: chọn banner -> mở bảng Quà (superHeroEncoreGoodGiftUi)
        // -> bấm nút của chính dòng quà (onBuy). Các bước sau nằm trong banner-workflow.js. Không gửi
        // giao thức trực tiếp, không đụng quà tiền thật (price > 0), chỉ làm khi banner còn mở.
        // =========================================================================
        const BANNER_GIFT_VIEW = 'superHeroEncoreGoodGiftUi';
        const BANNER_WAIT_MS = 6000;
        const BANNER_CONFIRM_MS = 4000;
        const BANNER_BUSY_VIEWS = [
            'embattleUi', 'fightSuccessUi', 'fightFailUi', 'winUi', 'fightWinUi', 'fightResultUi',
            'adventureResultUi', 'guildAskedFightResultUi'
        ];

        let bannerGiftBusy = false;
        let bannerAbortRequested = false;

        // Người dùng bấm dừng giữa lượt Banner: mọi lần chờ (bannerSleep) sẽ ném lỗi dừng để luồng thoát và đóng các bảng đã mở.
        function bannerRequestAbort() {
            if (bannerGiftBusy) bannerAbortRequested = true;
        }

        function bannerAbortError() {
            const error = new Error('Banner: đã dừng giữa chừng');
            error.bannerAbort = true;
            return error;
        }

        function bannerSleep(ms) {
            return new Promise((resolve, reject) => {
                if (bannerAbortRequested) { reject(bannerAbortError()); return; }
                setTimeout(() => (bannerAbortRequested ? reject(bannerAbortError()) : resolve()), ms);
            });
        }

        // CHỈ ĐỌC, KHÔNG KÍCH HOẠT: không gọi gInst() (sẽ tạo controller sớm) và không gọi các getter
        // có bộ nhớ đệm như getBaseConfig() (gọi trước khi game nạp cấu hình sẽ lưu rỗng vĩnh viễn và
        // làm mất nút banner). Chỉ dùng thể hiện game đã tạo và dữ liệu game đã tự dựng.
        function bannerPeekInstance(C) {
            if (typeof C !== 'function') return null;
            for (const key of Object.keys(C)) {
                const v = C[key];
                if (v && typeof v === 'object' && v.constructor === C) return v;
            }
            return null;
        }

        function bannerGetController() {
            return bannerPeekInstance(window.SuperHeroEncoreCtrl);
        }

        // Danh sách banner đang mở (chỉ đọc, giống bảng Banner hero trong Probe).
        function bannerGetOpenList() {
            const ctrl = bannerGetController();
            const model = ctrl && typeof ctrl.getCurlModel === 'function' ? ctrl.getCurlModel() : null;
            const D = bannerPeekInstance(window.DesenoActivityCtrl);
            const deseno = D && typeof D.getCurlModel === 'function' ? D.getCurlModel() : null;
            const cfgs = model && model.baseConfigDic;
            if (!cfgs || !Object.keys(cfgs).length || !deseno || !deseno.activity_status_dic ||
                typeof deseno.getActDat !== 'function' || !window.NetMgr) return null;

            const now = window.NetMgr.gInst().getTime();
            const openStatus = window.ComCt && window.ComCt.activityStatus && window.ComCt.activityStatus.open;
            const list = [];
            for (const key of Object.keys(cfgs)) {
                const cfg = cfgs[key];
                const dat = deseno.getActDat(cfg.activity);
                if (!dat || dat.status !== openStatus || !(dat.close_time > now)) continue;
                const match = /Chiến Lệnh\s+([^,]+)/.exec(String(cfg.tabName || ''));
                let heroName = '';
                try {
                    const heroBase = window.HeroCtrl && window.HeroCtrl.gInst().getHeroBaseByBaseId(cfg.hero_id);
                    heroName = heroBase && heroBase.name ? String(heroBase.name) : '';
                } catch (e) { }
                list.push({
                    uniqueId: cfg.activity_id,
                    activityId: cfg.activity,
                    series: match ? match[1].trim() : 'Hero ' + cfg.hero_id,
                    heroId: cfg.hero_id,
                    heroName,
                    giftSystemId: cfg.gift_system_id,
                    closeTime: dat.close_time,
                    remainSec: dat.close_time - now
                });
            }
            return list;
        }

        // Quyết định cho một dòng quà. Không bao giờ chọn quà có price (tiền thật).
        function bannerGiftDecision(gift, remaining) {
            if (Number(gift.price) > 0) return { action: 'skip', reason: 'quà nạp tiền thật (không mua)' };
            if (remaining <= 0) return { action: 'skip', reason: 'đã nhận/mua đủ hôm nay' };
            const gold = Number(gift.gold) || 0;
            if (gold === 0) return { action: 'claim', reason: 'miễn phí' };
            // Quà Tiên Ngọc mua mặc định, nhưng chỉ đúng giá đã định (300); giá khác thì bỏ qua.
            const allowed = Number(CONFIG.bannerGoldPrice) || 300;
            if (gold !== allowed) return { action: 'skip', reason: `giá ${gold} Tiên Ngọc khác ${allowed}` };
            return { action: 'buy', reason: `${gold} Tiên Ngọc` };
        }

        async function bannerClaimGifts(banner) {
            const clicks = {};
            const ctrl = bannerGetController();
            const vm = window.ViewMgr && window.ViewMgr.gInst ? window.ViewMgr.gInst() : null;
            const model = ctrl && ctrl.getCurlModel();
            const tag = `[Banner Hero - ${banner.series}]`;
            const uid = banner.uniqueId;
            if (!ctrl || !vm || !model || typeof ctrl.opGoodGiftUi !== 'function' ||
                typeof ctrl.selectActivity !== 'function' ||
                typeof model.getGiftInfo !== 'function') {
                sendLog(`⚠️ ${tag} Không tìm thấy bộ điều khiển quà banner.`, 'err');
                return { ok: false };
            }
            if (window.CityCtrl && typeof window.CityCtrl.gInst === 'function' &&
                banner.giftSystemId && !window.CityCtrl.gInst().isHasShow(banner.giftSystemId)) {
                sendLog(`ℹ️ ${tag} Mục Quà chưa mở trong game; bỏ qua.`, 'info');
                return { ok: true, locked: true };
            }

            let unconfirmed = false;
            try {
                ctrl.selectActivity(uid);
                ctrl.opGoodGiftUi();

                let view = null;
                const startedAt = Date.now();
                while (Date.now() - startedAt < BANNER_WAIT_MS) {
                    await bannerSleep(300);
                    const candidate = vm.getViewByName(BANNER_GIFT_VIEW);
                    const list = candidate && candidate.giftList;
                    if (candidate && vm.viewIsVisible(BANNER_GIFT_VIEW) && model.getGiftInfo(uid) &&
                        list && list.numElements > 0) { view = candidate; break; }
                }
                if (!view) {
                    sendLog(`⚠️ ${tag} Không mở được bảng Quà hoặc chưa nhận dữ liệu từ máy chủ.`, 'err');
                    return { ok: false };
                }

                const list = view.giftList;
                // Danh sách của game chỉ dựng ô hiển thị cho các dòng đang thấy; lấy đủ các dòng từ dữ liệu để không
                // bỏ sót quà nằm dưới (ví dụ Lệnh Chiêu Mộ mua bằng Tiên Ngọc).
                const rendered = [];
                for (let i = 0; i < list.numElements; i++) {
                    const el = list.getElementAt(i);
                    if (el && el.data) rendered.push(el);
                }
                const source = view.giftListCol && Array.isArray(view.giftListCol.source) && view.giftListCol.source.length
                    ? view.giftListCol.source.slice() : rendered.map((el) => el.data);
                sendLog(`ℹ️ ${tag} Bảng Quà có ${source.length} dòng (đang hiển thị ${rendered.length}).`, 'info');
                for (const gift of source) {
                    if (!gift) continue;
                    const item = rendered.find((el) => el.data && el.data.charge_id === gift.charge_id) || null;
                    if (item && typeof item.onBuy !== 'function') continue;
                    if (!ctrl.isActivityOpen(uid)) {
                        sendLog(`ℹ️ ${tag} Banner đã đóng; dừng.`, 'info');
                        break;
                    }

                    const before = ctrl.getGiftBuyCount(gift.charge_id, uid);
                    const limit = Number(gift.purchase_times) || 0;
                    const decision = bannerGiftDecision(gift, limit - before);
                    const name = gift.name || `#${gift.charge_id}`;
                    if (decision.action === 'skip') {
                        if (!decision.silent) sendLog(`ℹ️ ${tag} Bỏ qua "${name}": ${decision.reason}.`, 'info');
                        continue;
                    }

                    // Dòng đang hiển thị: nút phải đang hiện đúng như giao diện cung cấp. Dòng chưa dựng ô: dùng đúng điều kiện
                    // dữ liệu mà ô của game dùng (không có giá nạp tiền; miễn phí hoặc có giá Tiên Ngọc).
                    if (item) {
                        const button = decision.action === 'claim' ? item.buyBtn : item.moneyBtn;
                        const offered = button && button.visible !== false && (!button.parent || button.parent.visible !== false);
                        if (!offered) {
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

                    // Mỗi dòng quà chỉ bấm tối đa theo giới hạn game trong một lượt (không lặp).
                    clicks[gift.charge_id] = (clicks[gift.charge_id] || 0) + 1;
                    if (clicks[gift.charge_id] > Math.max(limit, 1)) continue;

                    sendLog(`🎁 ${tag} ${decision.action === 'buy' ? 'Mua' : 'Nhận'} "${name}" (${decision.reason}).`, 'action');
                    // Cùng đường gửi với nút của ô quà (không có giá nạp tiền): send12323(charge_id).
                    if (item) item.onBuy();
                    else window.RechargeCtrl.gInst().send12323(gift.charge_id);

                    let confirmed = false;
                    const clickedAt = Date.now();
                    await bannerSleep(800);
                    try { ctrl.send19739(uid); } catch (e) { }
                    while (Date.now() - clickedAt < BANNER_CONFIRM_MS) {
                        if (ctrl.getGiftBuyCount(gift.charge_id, uid) > before) { confirmed = true; break; }
                        await bannerSleep(300);
                    }
                    if (confirmed) {
                        sendLog(`✅ ${tag} Đã ${decision.action === 'buy' ? 'mua' : 'nhận'} "${name}".`, 'result');
                    } else {
                        unconfirmed = true;
                        sendLog(`⚠️ ${tag} Máy chủ chưa xác nhận "${name}".`, 'err');
                    }
                }
            } finally {
                try { vm.closeView(BANNER_GIFT_VIEW); } catch (e) { }
            }
            return { ok: !unconfirmed };
        }

        // Một lượt duy nhất khi bấm BẮT ĐẦU: làm việc ngày cho TẤT CẢ banner đang mở (khi đã tick "Tướng Thần Lâm /
        // Đạp Thiên"). Đặt cờ bận ngay (đồng bộ) để vòng chạy chính nhường chỗ cho tới khi xong.
        async function bannerRunOnce() {
            if (CONFIG.activeFeature !== 'autoBanner' || bannerGiftBusy) return;

            bannerGiftBusy = true;
            bannerAbortRequested = false;
            let aborted = false;
            let ranCount = 0;
            try {
                const vm = window.ViewMgr && window.ViewMgr.gInst ? window.ViewMgr.gInst() : null;
                const banners = bannerGetOpenList();
                if (!vm || typeof vm.viewIsVisible !== 'function' || !banners) {
                    sendLog('⚠️ [Banner Hero] Game chưa sẵn sàng (chưa có dữ liệu banner); bấm BẮT ĐẦU lại sau.', 'err');
                    return;
                }
                if (BANNER_BUSY_VIEWS.some((name) => vm.viewIsVisible(name))) {
                    sendLog('⚠️ [Banner Hero] Đang ở màn hình trận đấu/đội hình; bấm BẮT ĐẦU lại sau.', 'err');
                    return;
                }
                if (!banners.length) {
                    sendLog('ℹ️ [Banner Hero] Hiện không có banner nào đang mở; không có gì để làm.', 'info');
                } else {
                    sendLog(`🎴 [Banner Hero] Làm việc ngày cho ${banners.length} banner đang mở: ${banners.map((b) => b.series).join(', ')}.`, 'action');
                }
                for (const banner of banners) { await bannerRunHero(banner); ranCount++; }
            } catch (error) {
                if (error && error.bannerAbort) aborted = true;
                else sendLog(`⚠️ [Banner Hero] Lỗi: ${error && error.message || error}`, 'err');
            } finally {
                bannerGiftBusy = false;
                bannerAbortRequested = false;
                // Bị dừng giữa chừng: runAbort đã ghi log; xong lượt: ghi kết quả và tự dừng Auto.
                if (!aborted && CONFIG.activeFeature === 'autoBanner') runFinish(`${ranCount} banner`);
            }
        }

        window.addEventListener('message', (event) => {
            const data = event.data;
            if (!data || data.source !== BANNER_REQ_SOURCE) return;
            if (event.source !== window && event.source !== window.top && event.source !== window.parent) return;
            let banners = null;
            let error = null;
            try { banners = bannerGetOpenList(); } catch (e) { error = String(e && e.message || e); }
            try {
                window.top.postMessage({ source: BANNER_RES_SOURCE, ready: Boolean(banners), banners: banners || [], error }, '*');
            } catch (e) { }
        });


