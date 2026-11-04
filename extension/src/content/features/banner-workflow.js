        // =========================================================================
        // BANNER HERO: QUY TRÌNH SAU KHI NHẬN QUÀ (cùng một quy trình cho mọi hero)
        //   1. Quà (miễn phí + quà Tiên Ngọc)          -> bannerClaimGifts (banner-gifts.js)
        //   2. Chiêu Mộ: bấm "Chiêu mộ 1 lần"           -> bannerStepRecruit
        //   3. Thí Luyện: "Khiêu Chiến" đúng 1 lần       -> bannerStepChallenge
        //   4. Nhận thưởng Thí Luyện (Lệnh Chiêu Mộ)    -> bannerStepFightRewards
        //   5. Chiến Lệnh: nhận điểm từ nhiệm vụ Thí Luyện rồi "Nhận nhanh" -> bannerStepZhanling
        // Mỗi bước đi qua giao diện (mở Sảnh banner -> tab -> nút của chính tab đó) và chỉ chạy một lần
        // mỗi lượt BẮT ĐẦU. Không gọi gói mua tiền thật; không mở cửa sổ nạp/lấy thêm vật phẩm.
        // =========================================================================
        const BANNER_HALL_VIEW = 'superHeroEncoreHallUi';
        const BANNER_TRIAL_VIEW = 'devilSeaTrialUi';
        const BANNER_POPUP_VIEWS = ['backpackGetAwardTipsUi', 'heroPreviewUi'];
        const BANNER_RESULT_VIEWS = [
            'fightSuccessUi', 'fightFailUi', 'winUi', 'fightWinUi', 'fightResultUi',
            'adventureResultUi', 'guildAskedFightResultUi'
        ];
        const BANNER_FIGHT_START_MS = 15000;
        const BANNER_FIGHT_MAX_MS = 90000;

        async function bannerWaitFor(check, timeoutMs, stepMs) {
            const startedAt = Date.now();
            while (Date.now() - startedAt < timeoutMs) {
                let value = null;
                try { value = check(); } catch (e) { value = null; }
                if (value) return value;
                await bannerSleep(stepMs || 250);
            }
            return null;
        }

        function bannerIsFighting() {
            try {
                return !!(window.EntityMgr && window.EntityMgr.gInst && window.EntityMgr.gInst().getIsFighting());
            } catch (e) {
                return false;
            }
        }

        function bannerCloseViews(ctx, names) {
            let closed = false;
            for (const name of names) {
                try {
                    if (ctx.vm.viewIsVisible(name)) { ctx.vm.closeView(name); closed = true; }
                } catch (e) { }
            }
            return closed;
        }

        function bannerOffered(button) {
            return Boolean(button) && button.visible !== false && button.enabled !== false &&
                (!button.parent || button.parent.visible !== false);
        }

        // Mở Sảnh banner ở đúng tab (đóng Sảnh cũ trước để tab được chọn lại) và đợi tab sẵn sàng.
        async function bannerOpenHallTab(ctx, tabType, isReady) {
            try { ctx.vm.closeView(BANNER_HALL_VIEW); } catch (e) { }
            await bannerSleep(300);
            ctx.ctrl.openHall(ctx.uid, tabType);
            const hallNow = await bannerWaitFor(() => {
                const h = ctx.vm.getViewByName(BANNER_HALL_VIEW);
                return h && ctx.vm.viewIsVisible(BANNER_HALL_VIEW) ? h : null;
            }, 5000);
            if (hallNow && typeof hallNow.getTabIsOpen === 'function' && !hallNow.getTabIsOpen(tabType)) {
                sendLog(`ℹ️ ${ctx.tag} Tab này chưa mở trong game; bỏ qua.`, 'info');
                return null;
            }
            return bannerWaitFor(() => {
                const hall = ctx.vm.getViewByName(BANNER_HALL_VIEW);
                if (!hall || !ctx.vm.viewIsVisible(BANNER_HALL_VIEW) || !hall.currView) return null;
                if (typeof hall.getSelectIdx === 'function' && hall.getSelectIdx() !== tabType) return null;
                return isReady(hall.currView) ? hall.currView : null;
            }, 8000);
        }

        // Mở bảng nhiệm vụ Thí Luyện (DevilSea trial) và đợi dữ liệu từ máy chủ.
        async function bannerOpenTrial(ctx, openFn) {
            try { openFn(); } catch (e) { return null; }
            return bannerWaitFor(() => {
                const view = ctx.vm.getViewByName(BANNER_TRIAL_VIEW);
                return view && ctx.vm.viewIsVisible(BANNER_TRIAL_VIEW) && view.bInitFinish && view.radioGroup && view.list
                    ? view : null;
            }, 8000);
        }

        async function bannerSelectTrialTab(view, tab) {
            view.radioGroup.selectedValue = tab;
            view.onClkTab();
            await bannerSleep(600);
        }

        function bannerTrialItems(view) {
            const items = [];
            const list = view.list;
            for (let i = 0; list && i < list.numElements; i++) {
                const item = list.getElementAt(i);
                if (item && item.data) items.push(item);
            }
            return items;
        }

        // ---- Bước 2: Chiêu Mộ 1 lần ------------------------------------------------------------------
        async function bannerStepRecruit(ctx) {
            const { ctrl, vm, uid, tag, cfg } = ctx;
            const props = window.PropsCtrl && window.PropsCtrl.gInst ? window.PropsCtrl.gInst() : null;
            const have = props ? Number(props.getGoodsNumByBaseId(cfg.recruit_item)) || 0 : 0;
            if (have < 1) {
                sendLog(`ℹ️ ${tag} Không đủ vật phẩm Chiêu Mộ (cần 1); bỏ qua bước Chiêu Mộ.`, 'info');
                return;
            }
            const state = await bannerMissionState(ctx, ['superHeroEncore_recruit']);
            if (state.known && !state.pending) {
                sendLog(`ℹ️ ${tag} Nhiệm vụ Chiêu Mộ đã hoàn thành; không chiêu mộ thêm.`, 'info');
                return;
            }
            const view = await bannerOpenHallTab(ctx, window.SuperHeroEncoreConst.TabType.Recruit,
                (v) => typeof v.reqTreasure === 'function' && bannerOffered(v.treasureBtn1));
            if (!view) {
                sendLog(`⚠️ ${tag} Không mở được tab Chiêu Mộ.`, 'err');
                return;
            }
            sendLog(`🎯 ${tag} Chiêu mộ 1 lần.`, 'action');
            view.reqTreasure(1);

            const confirmed = await bannerWaitFor(() =>
                Number(props.getGoodsNumByBaseId(cfg.recruit_item)) < have ||
                BANNER_POPUP_VIEWS.some((name) => vm.viewIsVisible(name)), 8000);
            // Đóng bảng kết quả (phần thưởng / xem tướng mới) cho tới khi không còn hiện.
            for (let quiet = 0; quiet < 3;) {
                await bannerSleep(500);
                quiet = bannerCloseViews(ctx, BANNER_POPUP_VIEWS) ? 0 : quiet + 1;
            }
            sendLog(confirmed ? `✅ ${tag} Đã chiêu mộ 1 lần.` : `⚠️ ${tag} Máy chủ chưa xác nhận lượt chiêu mộ.`,
                confirmed ? 'result' : 'err');
        }

        // ---- Bước 3: Khiêu Chiến 1 lần ---------------------------------------------------------------
        // Đọc trạng thái nhiệm vụ Thí Luyện trước khi làm: có nhiệm vụ thuộc loại này không (known) và còn
        // nhiệm vụ chưa hoàn thành không (pending: status 0). Dùng để không làm lại việc đã xong.
        async function bannerMissionState(ctx, typeKeys) {
            const E = window.AcvConst && window.AcvConst.EType;
            if (!E || !window.DevilSeaCtrl) return { known: false };
            const fightTypes = typeKeys.map((k) => E[k]).filter((v) => v !== undefined);
            if (!fightTypes.length) return { known: false };
            const view = await bannerOpenTrial(ctx, () => window.DevilSeaCtrl.gInst().openDevilSeaTrialUi(ctx.cfg.client_task_type));
            if (!view) return { known: false };
            let known = false;
            let pending = false;
            try {
                for (const tab of [0, 1]) {
                    await bannerSelectTrialTab(view, tab);
                    for (const item of bannerTrialItems(view)) {
                        const d = item.data;
                        if (fightTypes.includes(d.jump_id || d.type || d.task_type)) {
                            known = true;
                            if (d.status === 0) pending = true;
                        }
                    }
                }
            } finally {
                try { ctx.vm.closeView(BANNER_TRIAL_VIEW); } catch (e) { }
            }
            return { known, pending };
        }

        async function bannerStepChallenge(ctx) {
            const { vm, tag } = ctx;
            const need = await bannerMissionState(ctx, ['superHeroEncore_fight_count', 'superHeroEncore_fight_harm']);
            if (need.known && !need.pending) {
                sendLog(`ℹ️ ${tag} Nhiệm vụ Khiêu Chiến Thí Luyện đã hoàn thành; không đánh lại.`, 'info');
                return;
            }
            const view = await bannerOpenHallTab(ctx, window.SuperHeroEncoreConst.TabType.Fight,
                (v) => typeof v.onClickFight === 'function' && bannerOffered(v.btnChalleng));
            if (!view) {
                sendLog(`⚠️ ${tag} Không mở được tab Thí Luyện hoặc nút Khiêu Chiến không dùng được.`, 'err');
                return;
            }
            sendLog(`⚔️ ${tag} Khiêu Chiến Thí Luyện (1 lần).`, 'action');
            view.onClickFight();

            const embattle = await bannerWaitFor(() => vm.viewIsVisible('embattleUi') && vm.getViewByName('embattleUi'), 8000);
            if (!embattle || typeof embattle.cBtnH2 !== 'function') {
                sendLog(`⚠️ ${tag} Không mở được bảng đội hình; bỏ qua Khiêu Chiến.`, 'err');
                return;
            }
            await bannerSleep(500);
            // Bấm "Lên trận nhanh", đợi bảng cập nhật, chỉ bấm "Bắt đầu" khi ô đội hình đã có tướng.
            let arranged = false;
            for (let attempt = 0; attempt < EMBATTLE_ARRANGE_TRIES && !arranged; attempt++) {
                if (typeof embattle.oneKeyEmbattleLogic === 'function') embattle.oneKeyEmbattleLogic(0);
                await bannerSleep(900);
                arranged = embattleTeamReady(embattle);
            }
            if (!arranged) {
                bannerCloseViews(ctx, ['embattleUi']);
                sendLog(`❌ ${tag} Không xếp được đội hình sau ${EMBATTLE_ARRANGE_TRIES} lần Lên trận nhanh (${embattleDiagnose(embattle, null)}); bỏ qua Khiêu Chiến.`, 'err');
                return;
            }
            embattle.cBtnH2();

            if (!await bannerWaitFor(() => bannerIsFighting(), BANNER_FIGHT_START_MS)) {
                bannerCloseViews(ctx, ['embattleUi']);
                sendLog(`⚠️ ${tag} Trận đánh chưa bắt đầu; bỏ qua.`, 'err');
                return;
            }
            const fightStartedAt = Date.now();
            while (bannerIsFighting() && Date.now() - fightStartedAt < BANNER_FIGHT_MAX_MS) {
                bannerCloseViews(ctx, BANNER_RESULT_VIEWS);
                await bannerSleep(500);
            }
            if (bannerIsFighting()) {
                sendLog(`⚠️ ${tag} Trận đánh chưa kết thúc sau ${BANNER_FIGHT_MAX_MS / 1000}s; dừng chờ.`, 'err');
                return;
            }
            for (let quiet = 0; quiet < 3;) {
                await bannerSleep(500);
                quiet = bannerCloseViews(ctx, BANNER_RESULT_VIEWS.concat(['embattleUi'])) ? 0 : quiet + 1;
            }
            sendLog(`✅ ${tag} Đã Khiêu Chiến xong.`, 'action');
        }

        // ---- Bước 4: nhận thưởng Thí Luyện (Lệnh Chiêu Mộ) sau Khiêu Chiến --------------------------------
        // Ô thưởng theo sát thương ở tab Thí Luyện: bấm một ô đã đạt (onClickItemSlot) nhận tất cả ô đã đạt.
        async function bannerStepFightRewards(ctx) {
            const { ctrl, uid, tag, cfg } = ctx;
            if (typeof ctrl.checkFightRed !== 'function') return;
            const view = await bannerOpenHallTab(ctx, window.SuperHeroEncoreConst.TabType.Fight,
                (v) => typeof v.onClickItemSlot === 'function' && v.stateDic);
            if (!view) {
                sendLog(`⚠️ ${tag} Không mở được tab Thí Luyện để nhận thưởng.`, 'err');
                return;
            }
            const slotOf = () => Object.keys(view.stateDic).find((k) => view.stateDic[k]);
            // Tab Thí Luyện tự yêu cầu dữ liệu mới khi mở; chờ tới khi có ô thưởng đã đạt và chưa nhận.
            const slot = await bannerWaitFor(() => (ctrl.checkFightRed(uid) ? slotOf() : null), 4000);
            if (slot === null || slot === undefined) {
                sendLog(`ℹ️ ${tag} Không có thưởng Thí Luyện nào để nhận.`, 'info');
                return;
            }
            const model = ctrl.getCurlModel();
            const info = model.getFightInfo ? model.getFightInfo(uid) : null;
            const hurt = info && info.hurt ? Number(info.hurt.dataNum) || 0 : 0;
            const rows = model.getChallengeCfgVo ? model.getChallengeCfgVo(uid) || [] : [];
            const hasToken = rows.some((r) => !ctrl.isGetFightReward(r.id, uid) && hurt >= r.harm &&
                (r.reward || []).some((x) => x.base_id === cfg.recruit_item));
            sendLog(`🎁 ${tag} Nhận thưởng Thí Luyện${hasToken ? ' (có Lệnh Chiêu Mộ)' : ''}.`, 'action');
            view.onClickItemSlot(Number(slot));

            const done = await bannerWaitFor(() => !ctrl.checkFightRed(uid), 5000);
            for (let quiet = 0; quiet < 3;) {
                await bannerSleep(500);
                quiet = bannerCloseViews(ctx, BANNER_POPUP_VIEWS) ? 0 : quiet + 1;
            }
            sendLog(done ? `✅ ${tag} Đã nhận thưởng Thí Luyện.` : `⚠️ ${tag} Máy chủ chưa xác nhận thưởng Thí Luyện.`,
                done ? 'result' : 'err');
        }

        // ---- Bước 5: Chiến Lệnh: nhận điểm nhiệm vụ rồi "Nhận nhanh" -----------------------------------
        async function bannerStepZhanling(ctx) {
            const { tag } = ctx;
            const zl = await bannerOpenHallTab(ctx, window.SuperHeroEncoreConst.TabType.Zhanling,
                (v) => typeof v.onClickTrial === 'function' && typeof v.onClick === 'function' && v.onekeyBtn);
            if (!zl) {
                sendLog(`⚠️ ${tag} Không mở được tab Chiến Lệnh.`, 'err');
                return;
            }

            await bannerZhanlingTasksAndQuickClaim(ctx, zl);

            // 3) Mua điểm Chiến Lệnh bằng Tiên Ngọc (nếu bật), rồi "Nhận nhanh" lại phần thưởng vừa đủ điểm.
            if (await bannerZhanlingBuyScore(ctx, zl)) {
                await bannerSleep(800);
                await bannerZhanlingQuickClaim(ctx, zl);
            }
        }

        // Chiến Lệnh (dùng chung Banner hero và Banner skin): nhận điểm từ nhiệm vụ Thí Luyện đã hoàn thành, rồi "Nhận nhanh".
        async function bannerZhanlingTasksAndQuickClaim(ctx, zl) {
            const { tag } = ctx;
            // 1) Nhận điểm từ các nhiệm vụ Thí Luyện đã hoàn thành.
            let claimed = 0;
            const trial = await bannerOpenTrial(ctx, () => zl.onClickTrial());
            if (!trial) {
                sendLog(`⚠️ ${tag} Không mở được bảng nhiệm vụ Thí Luyện.`, 'err');
            } else {
                const tried = new Set();
                try {
                    for (const tab of [0, 1]) {
                        await bannerSelectTrialTab(trial, tab);
                        for (let round = 0; round < 8; round++) {
                            const item = bannerTrialItems(trial).find((it) =>
                                it.data.status === 1 && !tried.has(it.data.id) && bannerOffered(it.getGp));
                            if (!item) break;
                            tried.add(item.data.id);
                            item.ckickGetBtn();
                            claimed++;
                            sendLog(`🎁 ${tag} Nhận điểm nhiệm vụ: ${item.data.word || item.data.name || '#' + item.data.id}.`, 'action');
                            await bannerSleep(1200);
                        }
                    }
                } finally {
                    try { ctx.vm.closeView(BANNER_TRIAL_VIEW); } catch (e) { }
                }
                sendLog(claimed ? `✅ ${tag} Đã nhận ${claimed} nhiệm vụ Thí Luyện.` : `ℹ️ ${tag} Không có nhiệm vụ Thí Luyện nào để nhận.`, claimed ? 'result' : 'info');
            }

            // 2) "Nhận nhanh" ở màn hình Chiến Lệnh.
            await bannerSleep(800);
            await bannerZhanlingQuickClaim(ctx, zl);
        }

        async function bannerZhanlingQuickClaim(ctx, zl) {
            const ready = await bannerWaitFor(() => bannerOffered(zl.onekeyBtn), 3500);
            if (!ready) {
                sendLog(`ℹ️ ${ctx.tag} Chiến Lệnh chưa có phần thưởng để Nhận nhanh.`, 'info');
                return false;
            }
            sendLog(`🎁 ${ctx.tag} Chiến Lệnh: Nhận nhanh.`, 'action');
            zl.onClick({ target: zl.onekeyBtn });
            await bannerSleep(1500);
            bannerCloseViews(ctx, BANNER_POPUP_VIEWS);
            return true;
        }

        // Mua điểm Chiến Lệnh bằng Tiên Ngọc (nút "+" cạnh điểm; game gửi send12326). Chỉ mua khi game cho phép
        // (24 giờ cuối của banner), tối đa CONFIG.bannerZlBuyGold Tiên Ngọc mỗi banner, không bao giờ gọi gói nạp tiền thật.
        // Số đã chi được ghi vào sessionStorage ngay lúc gửi để không vượt trần dù tải lại trang.
        function bannerZlSpentKey(uid, type, term) { return `tnBannerZlBuy:${uid}:${type}:${term}`; }
        function bannerZlSpentRead(key) { try { return Number(sessionStorage.getItem(key)) || 0; } catch (e) { return 0; } }
        function bannerZlSpentWrite(key, value) { try { sessionStorage.setItem(key, String(value)); } catch (e) { } }

        // Hàm thuần: quyết định số lượng mua từ số liệu game (cùng điều kiện với nút "+" của game).
        function bannerZlBuyPlan(info) {
            const { unit, perBuy, label, secondsLeft, need, limitLeft, asset, maxGold, spent } = info;
            if (label !== 'gold') return { qty: 0, reason: `đơn vị tiền "${label}" không phải Tiên Ngọc` };
            if (!(unit > 0) || !(perBuy > 0)) return { qty: 0, reason: 'cấu hình giá không hợp lệ' };
            if (!(secondsLeft > 0)) return { qty: 0, reason: 'banner đã hết hạn' };
            if (secondsLeft > 86400) return { qty: 0, reason: 'game chỉ cho mua điểm trong 24 giờ cuối của banner' };
            if (!(need > 0)) return { qty: 0, reason: 'điểm đã đủ nhận phần thưởng cuối' };
            if (!(limitLeft >= perBuy)) return { qty: 0, reason: 'đã hết giới hạn mua điểm' };
            const budget = Math.min(asset, maxGold - spent);
            const qty = Math.min(Math.ceil(need / perBuy), Math.floor(limitLeft / perBuy), Math.floor(budget / unit));
            if (qty <= 0) {
                return { qty: 0, reason: maxGold - spent < unit ? `đã chi ${spent}/${maxGold} Tiên Ngọc (trần)` : `không đủ Tiên Ngọc (có ${asset}, cần ${unit})` };
            }
            return { qty, cost: qty * unit };
        }

        async function bannerZhanlingBuyScore(ctx, zl) {
            const { tag, uid } = ctx;
            const maxGold = Number(CONFIG.bannerZlBuyGold) || 0;
            if (maxGold <= 0) return false;
            const recharge = window.RechargeCtrl && window.RechargeCtrl.gInst && window.RechargeCtrl.gInst();
            const trans = window.TransGodCtrl && window.TransGodCtrl.gInst && window.TransGodCtrl.gInst();
            const model = recharge && recharge.getCurlModel && recharge.getCurlModel();
            const type = zl.type;
            const term = zl.term_id;
            if (!recharge || !trans || !model || typeof recharge.send12326 !== 'function' ||
                typeof model.getZlScoreBuyConfig !== 'function' || typeof trans.getZlBuyVal !== 'function' ||
                typeof trans.getZlNetVoByType !== 'function' || !window.CommonUtils || !window.NetMgr ||
                type === undefined || term === undefined) {
                logUnsupportedOnce('banner-zl-buy', `${tag} Không tìm thấy bộ điều khiển mua điểm Chiến Lệnh (bản game đổi); bỏ qua.`);
                return false;
            }
            const cfg = model.getZlScoreBuyConfig(type, term);
            if (!cfg || !cfg.loss || !cfg.loss[0]) {
                sendLog(`ℹ️ ${tag} Chiến Lệnh này không có mục mua điểm bằng Tiên Ngọc; bỏ qua.`, 'info');
                return false;
            }
            const last = typeof model.getZlLastRewardTerm === 'function' ? model.getZlLastRewardTerm(type, term) : null;
            const netVo = trans.getZlNetVoByType(type, term);
            const val = netVo ? Number(netVo.val) || 0 : 0;
            const endAt = Number(zl._endTime) || (ctx.ctrl.getEndTime ? Number(ctx.ctrl.getEndTime()) : 0);
            const boughtBefore = Number(trans.getZlBuyVal(type, term)) || 0;
            const key = bannerZlSpentKey(uid, type, term);
            const spent = bannerZlSpentRead(key);
            const label = cfg.loss[0].label;
            const plan = bannerZlBuyPlan({
                unit: Number(cfg.loss[0].num), perBuy: Number(cfg.val), label,
                secondsLeft: endAt - window.NetMgr.gInst().getTime(),
                need: last ? Number(last.val) - val : 0,
                limitLeft: Number(cfg.limit) - boughtBefore,
                asset: Number(window.CommonUtils.getRoleAsset(label)) || 0,
                maxGold, spent
            });
            if (plan.qty <= 0) {
                sendLog(`ℹ️ ${tag} Không mua điểm Chiến Lệnh: ${plan.reason}.`, 'info');
                return false;
            }
            if (!ctx.ctrl.isActivityOpen(uid)) return false;

            // Ghi chi phí ngay lúc gửi (kể cả khi mạng rớt chưa kịp xác nhận) rồi gửi đúng một lần.
            bannerZlSpentWrite(key, spent + plan.cost);
            sendLog(`💎 ${tag} Mua điểm Chiến Lệnh: ${plan.qty} lần (${plan.cost} Tiên Ngọc; trần ${maxGold}).`, 'result');
            recharge.send12326(type, term, plan.qty);
            const confirmed = await bannerWaitFor(() => Number(trans.getZlBuyVal(type, term)) > boughtBefore, 5000, 300);
            if (confirmed) {
                const nv = trans.getZlNetVoByType(type, term);
                sendLog(`✅ ${tag} Máy chủ xác nhận đã mua điểm Chiến Lệnh (điểm ${val} → ${nv ? nv.val : '?'}).`, 'result');
                return true;
            }
            sendLog(`⚠️ ${tag} Máy chủ chưa xác nhận mua điểm Chiến Lệnh; không gửi lại.`, 'err');
            return false;
        }

        // ---- Quy trình đầy đủ cho một banner -----------------------------------------------------------
        async function bannerRunHero(banner) {
            const ctrl = bannerGetController();
            const vm = window.ViewMgr && window.ViewMgr.gInst ? window.ViewMgr.gInst() : null;
            const uid = banner.uniqueId;
            const tag = `[Banner Hero - ${banner.series}]`;
            const cfg = ctrl && typeof ctrl.getCfg === 'function' ? ctrl.getCfg(uid) : null;
            const TabType = window.SuperHeroEncoreConst && window.SuperHeroEncoreConst.TabType;
            if (!ctrl || !vm || !cfg || !TabType || typeof ctrl.openHall !== 'function') {
                sendLog(`⚠️ ${tag} Không tìm thấy bộ điều khiển/cấu hình banner.`, 'err');
                return;
            }
            if (bannerIsFighting()) {
                sendLog(`⚠️ ${tag} Đang trong trận đánh; bấm BẮT ĐẦU lại sau.`, 'err');
                return;
            }
            const ctx = { ctrl, vm, uid, cfg, tag, banner };
            const previousUniqueId = ctrl.currentUniqueId;
            const steps = [
                ['Chiêu Mộ', bannerStepRecruit],
                ['Thí Luyện', bannerStepChallenge],
                ['Thưởng Thí Luyện', bannerStepFightRewards],
                ['Chiến Lệnh', bannerStepZhanling]
            ];
            try {
                const gifts = await bannerClaimGifts(banner);
                if (!gifts.ok || gifts.locked) {
                    sendLog(`⚠️ ${tag} Bước Quà chưa hoàn tất; không chạy các bước tiếp theo.`, 'err');
                    return;
                }
                for (const [label, step] of steps) {
                    if (!ctrl.isActivityOpen(uid)) {
                        sendLog(`ℹ️ ${tag} Banner đã đóng; dừng.`, 'info');
                        return;
                    }
                    try {
                        await step(ctx);
                    } catch (error) {
                        if (error && error.bannerAbort) throw error;
                        sendLog(`⚠️ ${tag} Lỗi ở bước ${label}: ${error && error.message || error}`, 'err');
                    }
                }
            } finally {
                bannerCloseViews(ctx, [BANNER_TRIAL_VIEW, BANNER_HALL_VIEW, 'embattleUi'].concat(BANNER_POPUP_VIEWS, BANNER_RESULT_VIEWS));
                try {
                    if (previousUniqueId !== undefined && previousUniqueId !== uid) ctrl.selectActivity(previousUniqueId);
                } catch (e) { }
            }
        }

