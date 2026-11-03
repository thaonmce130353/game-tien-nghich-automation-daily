        // [Module 7] Kiếm Hành (DiceCtrl, diceUi, Chiến Lệnh Thiên Hạ = zhanLingType_8) và
        // Điêu Long Khắc Tinh (EngraveCtrl, engraveLongMainUi, nhiệm vụ DevilSeaCtrl loại 31, Chiến Lệnh Điêu Long = zhanLingType_28).
        // Mỗi nhịp một việc, máy trạng thái dragonState.phase:
        //   dice-open -> dice-roll -> dice-war -> long-open -> long-play -> long-stage -> long-tasks -> long-war -> done
        //   - Kiếm Hành: gieo xúc xắc (free; hết free thì dùng xúc xắc có sẵn; hết nữa thì MUA bằng Tiên Ngọc, có giới hạn)
        //     tới khi đi hết đường (percent = 100), rồi nhận Chiến Lệnh Thiên Hạ.
        //   - Điêu Long: bắt đầu (send32614), 6 lần bấm nhịp đúng khoảng "Hoàn Mỹ" (send32615), kết thúc (send32616);
        //     chơi tới khi đủ điểm ngày; nhận rương mốc (send32613), nhiệm vụ "Khiêu chiến Điêu Long" (send30041),
        //     rồi Chiến Lệnh Điêu Long.
        // Chỉ ghi "đã" khi dữ liệu máy chủ xác nhận; thiếu phản hồi thì báo lỗi, không gửi lại.
        const DRAGON_REQUEST_TIMEOUT_MS = 15000;
        const DRAGON_DICE_MIN_GAP_MS = 3300;      // game tự chặn bấm xúc xắc dưới 3s
        const DRAGON_DICE_MAX_ROLLS = 80;
        const DRAGON_DICE_MAX_BUYS = 12;           // trần số lần MUA xúc xắc bằng Tiên Ngọc trong một ngày
        const DRAGON_DICE_BUY_STORAGE_KEY = 'TN_AUTO_DICE_BUYS_V1';
        const DRAGON_LONG_MAX_PLAYS = 4;
        const DRAGON_LONG_TASK_TYPE = 31;          // DevilSeaConst.TrialTaskType.engraveLongTask
        const DRAGON_PERFECT_GROUP = 3;            // EngraveConst.SCOREEVALUATION.PERFECT

        function loadDiceBuys() {
            try {
                const saved = JSON.parse(sessionStorage.getItem(DRAGON_DICE_BUY_STORAGE_KEY) || 'null');
                if (saved && saved.dayKey === new Date().toDateString()) return Number(saved.buys) || 0;
            } catch (e) { }
            return 0;
        }

        function saveDiceBuys(buys) {
            try { sessionStorage.setItem(DRAGON_DICE_BUY_STORAGE_KEY, JSON.stringify({ dayKey: new Date().toDateString(), buys })); } catch (e) { }
        }

        let dragonState = null;
        runResetHooks.push(() => { dragonState = null; });

        function createDragonState() {
            return {
                phase: 'dice-open',
                failed: false,
                refreshing: null,
                rolls: 0,
                buys: loadDiceBuys(),
                nextAt: 0,
                pendingRoll: null,         // { index, free, at }
                pendingBuy: null,          // { have, need, at }
                warOrder: {},
                plays: 0,
                play: null,
                taskStage: 'query',
                claimedTasks: 0,
                claimPending: null,
                stageSent: 0
            };
        }

        function dragonFail(s, message, nextPhase) {
            sendLog(`❌ [Kiếm Hành & Điêu Long] ${message}`, "error");
            s.failed = true;
            s.refreshing = null;
            s.phase = nextPhase;
        }

        function dragonDiceInfo(dice) {
            const i = dice && dice.infoDt;
            if (!i) return null;
            return { token: i, index: i.index, percent: i.percent, round: i.round, maxRound: i.max_round, free: i.freeTimes, buyTimes: i.buyTimes || 0 };
        }

        // Số xúc xắc có sẵn và số cần cho lần gieo kế (khi hết lượt free).
        function dragonDiceCost(ctx, dice, info) {
            const diceId = dice.getInfoByKey('dice_id');
            const have = diceId ? ctx.PropsCtrl.gInst().findGoodsNum(diceId) : 0;
            const cfg = dice.getCostCfg(info.buyTimes + 1);
            const need = cfg ? Number(cfg.quantity) || 0 : 0;
            return { diceId, have, need, price: Number(dice.getInfoByKey('dice_price')) || 0 };
        }

        function dragonStepDice(ctx, vm, s, now) {
            const dice = ctx.DiceCtrl && ctx.DiceCtrl.gInst && ctx.DiceCtrl.gInst();
            if (!dice || typeof dice.sd20501 !== 'function' || typeof dice.sd20502 !== 'function') {
                logUnsupportedOnce('m7-dice', "⚠️ [Kiếm Hành] Bản game hiện tại không có DiceCtrl phù hợp; bỏ qua Kiếm Hành.");
                s.phase = 'dice-war';
                return false;
            }
            const tokenOf = () => dice.infoDt;
            if (s.phase === 'dice-open') {
                try { if (!vm.viewIsVisible('diceUi') && typeof dice.opDiceUi === 'function') dice.opDiceUi(); } catch (e) { }
                const r = pollTowerDailyRefresh(s, 'refreshing', now, () => dice.sd20501(), tokenOf);
                if (r === 'wait') return false;
                if (r !== 'ready') { dragonFail(s, "[Kiếm Hành] Máy chủ chưa trả dữ liệu xúc xắc; bỏ qua Kiếm Hành.", 'dice-war'); return false; }
                s.phase = 'dice-roll';
                return true;
            }

            // dice-roll
            const info = dragonDiceInfo(dice);
            if (!info) { dragonFail(s, "[Kiếm Hành] Không đọc được tiến độ đường đi; bỏ qua Kiếm Hành.", 'dice-war'); return false; }

            if (s.pendingBuy) {
                const b = s.pendingBuy;
                const cost = dragonDiceCost(ctx, dice, info);
                if (cost.have >= b.need) {
                    sendLog(`✅ [Kiếm Hành] Máy chủ xác nhận đã mua xúc xắc (có ${cost.have}, cần ${b.need}).`, "result");
                    s.pendingBuy = null;
                } else if (now - b.at >= DRAGON_REQUEST_TIMEOUT_MS) {
                    dragonFail(s, "[Kiếm Hành] Đã gửi mua xúc xắc nhưng số xúc xắc không tăng; dừng, không mua lại.", 'dice-war');
                    return false;
                } else return false;
            }

            if (s.pendingRoll) {
                const p = s.pendingRoll;
                if (info.index !== p.index || info.percent >= 100) {
                    s.pendingRoll = null;
                    sendLog(`🎲 [Kiếm Hành] Máy chủ xác nhận đã đi: ô ${p.index} → ${info.index} (${info.percent}%).`, "action");
                    s.nextAt = now + DRAGON_DICE_MIN_GAP_MS + humanDelay(500);
                } else if (now - p.at >= DRAGON_REQUEST_TIMEOUT_MS) {
                    dragonFail(s, "[Kiếm Hành] Đã gieo xúc xắc nhưng máy chủ chưa trả bước đi; dừng, không gieo lại.", 'dice-war');
                    return false;
                } else return false;
            }
            if (now < s.nextAt) return false;

            if (info.percent >= 100) {
                if (info.round >= info.maxRound) {
                    sendLog(`✅ [Kiếm Hành] Đã đi hết đường (vòng ${info.round}/${info.maxRound}, ${info.percent}%).`, "action");
                    s.phase = 'dice-war';
                    return true;
                }
                sendLog(`ℹ️ [Kiếm Hành] Xong vòng ${info.round}/${info.maxRound} (chỉ làm 1 vòng mỗi lượt chạy theo yêu cầu); không làm mới sang vòng kế.`, "info");
                s.phase = 'dice-war';
                return true;
            }
            if (s.rolls >= DRAGON_DICE_MAX_ROLLS) { dragonFail(s, "[Kiếm Hành] Đã gieo quá số lần cho phép trong một lượt chạy; dừng.", 'dice-war'); return false; }

            let free = info.free;
            if (!(free > 0)) {
                const cost = dragonDiceCost(ctx, dice, info);
                if (!(cost.need > 0)) { dragonFail(s, "[Kiếm Hành] Không đọc được giá xúc xắc (bản game đổi); không mua.", 'dice-war'); return false; }
                if (cost.have < cost.need) {
                    if (s.buys >= DRAGON_DICE_MAX_BUYS) {
                        sendLog(`⏸️ [Kiếm Hành] Đã mua ${s.buys} lần hôm nay (trần ${DRAGON_DICE_MAX_BUYS}); dừng mua thêm. Đường đi chưa xong (${info.percent}%).`, "warn");
                        s.phase = 'dice-war';
                        return true;
                    }
                    const missing = cost.need - cost.have;
                    if (!ctx.ShopCtrl || typeof ctx.ShopCtrl.gInst().quickBuy !== 'function') { dragonFail(s, "[Kiếm Hành] Không có lệnh mua xúc xắc; dừng.", 'dice-war'); return false; }
                    s.buys++;
                    saveDiceBuys(s.buys);
                    sendLog(`💎 [Kiếm Hành] Hết xúc xắc free; mua ${missing} xúc xắc (khoảng ${missing * cost.price} Tiên Ngọc, lần mua ${s.buys}/${DRAGON_DICE_MAX_BUYS}).`, "result");
                    ctx.ShopCtrl.gInst().quickBuy(1501001, missing);
                    s.pendingBuy = { need: cost.need, at: now };
                    return true;
                }
            }
            s.rolls++;
            s.pendingRoll = { index: info.index, at: now };
            dice.sd20502();
            sendLog(`🎲 [Kiếm Hành] Gieo xúc xắc lần ${s.rolls} (tại ô ${info.index}, ${info.percent}%${free > 0 ? ', free còn ' + free : ''}).`, "action");
            return true;
        }

        // Khoảng "Hoàn Mỹ" của nhịp, đọc từ bảng cấu hình của game; trả về { lo, hi } theo thang 0-1000 hoặc null.
        function dragonPerfectBand(model) {
            let cfg = null;
            try { cfg = model.getLongScoreConfigById(DRAGON_PERFECT_GROUP); } catch (e) { }
            if (!cfg || typeof cfg !== 'object') return null;
            const nums = (v) => {
                if (Array.isArray(v)) return v.map(Number);
                if (typeof v === 'string') { const m = v.match(/-?\d+(\.\d+)?/g); return m ? m.map(Number) : []; }
                return [];
            };
            let lo = null, hi = null;
            for (const key of Object.keys(cfg)) {
                const k = key.toLowerCase();
                const v = Number(cfg[key]);
                if (!isNaN(v) && /(^|_)(min|low|start|from)/.test(k) && !/score/.test(k)) lo = v;
                if (!isNaN(v) && /(^|_)(max|up|end|to)(_|$)/.test(k) && !/score/.test(k)) hi = v;
            }
            if (lo === null || hi === null) {
                for (const key of Object.keys(cfg)) {
                    if (/score|id$|degree|name|desc|reward/i.test(key)) continue;
                    const n = nums(cfg[key]).filter((x) => !isNaN(x));
                    if (n.length === 2 && n[0] <= n[1]) { lo = n[0]; hi = n[1]; break; }
                }
            }
            if (lo === null || hi === null || !(hi > lo)) return null;
            if (hi <= 1) { lo *= 1000; hi *= 1000; }
            return { lo, hi };
        }

        function dragonStepLongOpen(ctx, vm, s, now) {
            const ec = ctx.EngraveCtrl && ctx.EngraveCtrl.gInst && ctx.EngraveCtrl.gInst();
            if (!ec || typeof ec.send32611 !== 'function' || typeof ec.send32614 !== 'function' || typeof ec.send32615 !== 'function' || typeof ec.send32616 !== 'function') {
                logUnsupportedOnce('m7-long', "⚠️ [Điêu Long] Bản game hiện tại không có EngraveCtrl phù hợp; bỏ qua Điêu Long.");
                s.phase = 'done';
                return false;
            }
            // Màn Điêu Long của game tự bấm vòng nhịp khi mở; đóng lại để chỉ có Auto điều khiển.
            try { if (vm.viewIsVisible('engraveLongMainUi')) vm.closeView('engraveLongMainUi'); } catch (e) { }
            const model = ec.getCurlModel();
            const r = pollTowerDailyRefresh(s, 'refreshing', now, () => ec.send32611(), () => model.engraveLongInfo);
            if (r === 'wait') return false;
            if (r !== 'ready' || !model.engraveLongInfo) { dragonFail(s, "[Điêu Long] Máy chủ chưa trả dữ liệu Điêu Long; bỏ qua Điêu Long.", 'done'); return false; }
            const info = model.engraveLongInfo;
            const maxCfg = model.getLongPointRewardMaxConfig(Number.MAX_SAFE_INTEGER);
            s.longTarget = maxCfg ? Number(maxCfg.num) || 0 : 0;
            sendLog(`🐉 [Điêu Long] Điểm hôm nay ${info.daily_scores_acc}/${s.longTarget || '?'} (cao nhất ${info.history_scores}).`, "info");
            s.phase = 'long-play';
            return true;
        }

        function dragonStepLongPlay(ctx, vm, s, now) {
            const ec = ctx.EngraveCtrl.gInst();
            const model = ec.getCurlModel();
            const info = model.engraveLongInfo;
            const chance = Number((model.getLongBastConfigByKey('wood_carving_game_once_chance') || {}).val) || 5;

            if (!s.play) {
                if (s.longTarget > 0 && info.daily_scores_acc >= s.longTarget) {
                    sendLog(`✅ [Điêu Long] Đã đủ điểm ngày (${info.daily_scores_acc}/${s.longTarget}).`, "action");
                    s.phase = 'long-stage';
                    return true;
                }
                if (s.plays >= DRAGON_LONG_MAX_PLAYS) { sendLog(`⏸️ [Điêu Long] Đã chơi ${s.plays} ván trong lượt này; dừng chơi thêm.`, "warn"); s.phase = 'long-stage'; return true; }
                const band = dragonPerfectBand(model);
                if (!band) { dragonFail(s, "[Điêu Long] Không đọc được khoảng 'Hoàn Mỹ' từ cấu hình game; không tự bấm nhịp.", 'long-stage'); return false; }
                s.play = { stage: 'start', band, step: 0, sentAt: 0, beforeAcc: info.daily_scores_acc, perfects: 0 };
                s.plays++;
                sendLog(`🐉 [Điêu Long] Ván ${s.plays}: khoảng Hoàn Mỹ ${Math.round(band.lo)}–${Math.round(band.hi)}; bấm Bắt đầu.`, "action");
            }
            const p = s.play;

            if (p.stage === 'start') {
                if (ec.isGameStart) { p.stage = 'step'; p.stepAt = 0; return false; }
                if (!p.sentAt) {
                    ec.send32614();
                    p.sentAt = now;
                    return true;
                }
                if (now - p.sentAt >= DRAGON_REQUEST_TIMEOUT_MS) { dragonFail(s, "[Điêu Long] Máy chủ chưa xác nhận bắt đầu ván; dừng, không gửi lại.", 'long-stage'); s.play = null; return false; }
                return false;
            }

            if (p.stage === 'step') {
                if (p.step >= chance) { p.stage = 'end'; p.sentAt = 0; return false; }
                if (!p.stepAt) {
                    if (now < s.nextAt) return false;
                    // Hiện vòng nhịp mới (giống setItemInfoStar của game): ghi bước vào gameScoreArr để máy chủ trả điểm vào đúng bước.
                    const range = JSON.parse((model.getLongBastConfigByKey('wood_carving_game_scale_time') || {}).val || '[1,1]').map(Number);
                    const scTime = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
                    const stepid = ec.gameScoreArr.length + 1;
                    const entry = { stepid, imageId: ec.getImageRandomId(), pos: { x: 0, y: 0 }, scTime };
                    ec.gameScoreArr.push(entry);
                    p.entry = entry;
                    const b = p.band;
                    const margin = (b.hi - b.lo) * 0.2;
                    p.accurate = Math.round(b.lo + margin + Math.random() * Math.max(1, (b.hi - b.lo) - 2 * margin));
                    // Vòng thu nhỏ tuyến tính từ 1 về 0 trong scTime giây; bấm khi còn đúng tỉ lệ p.accurate/1000.
                    p.stepAt = now;
                    p.clickAt = now + (p.step === 0 ? 1500 : 300) + Math.round(scTime * 1000 * (1 - p.accurate / 1000));
                    p.clicked = false;
                    return true;
                }
                if (!p.clicked) {
                    if (now < p.clickAt) return false;
                    p.clicked = true;
                    p.sentAt = now;
                    ec.send32615(p.entry.stepid, p.accurate);
                    return true;
                }
                const got = ec.getGameStepData(p.entry.stepid);
                if (got && got.group !== undefined) {
                    if (got.group === DRAGON_PERFECT_GROUP) p.perfects++;
                    sendLog(`🐉 [Điêu Long] Bước ${p.step + 1}/${chance}: ${got.group === DRAGON_PERFECT_GROUP ? 'HOÀN MỸ' : 'chưa hoàn mỹ (nhóm ' + got.group + ')'} (+${got.score} điểm, đã bấm ${p.accurate}).`, got.group === DRAGON_PERFECT_GROUP ? "action" : "warn");
                    p.step++;
                    p.stepAt = 0;
                    s.nextAt = now + 900 + humanDelay(300);
                    return true;
                }
                if (now - p.sentAt >= DRAGON_REQUEST_TIMEOUT_MS) { dragonFail(s, `[Điêu Long] Máy chủ chưa trả điểm bước ${p.step + 1}; dừng, không gửi lại.`, 'long-stage'); s.play = null; return false; }
                return false;
            }

            if (p.stage === 'end') {
                if (now < s.nextAt) return false;
                if (!p.sentAt) { ec.send32616(); p.sentAt = now; return true; }
                if (!ec.isGameStart) {
                    const total = model.engraveLongGameTotalScore;
                    try { if (vm.viewIsVisible('engraveResultUi')) vm.closeView('engraveResultUi'); } catch (e) { }
                    const after = model.engraveLongInfo ? model.engraveLongInfo.daily_scores_acc : 0;
                    sendLog(`✅ [Điêu Long] Máy chủ xác nhận xong ván ${s.plays}: ${p.perfects}/${chance} hoàn mỹ, điểm ngày ${p.beforeAcc} → ${after}${total ? ` (+${total.daily_scores_last})` : ''}.`, "action");
                    s.play = null;
                    s.nextAt = now + humanDelay(1500);
                    return true;
                }
                if (now - p.sentAt >= DRAGON_REQUEST_TIMEOUT_MS) { dragonFail(s, "[Điêu Long] Máy chủ chưa xác nhận kết thúc ván; dừng, không gửi lại.", 'long-stage'); s.play = null; return false; }
                return false;
            }
            return false;
        }

        // Nhận rương mốc điểm ngày (send32613), xác nhận bằng daily_stage_awards tăng.
        function dragonStepLongStage(ctx, vm, s, now) {
            const ec = ctx.EngraveCtrl.gInst();
            const model = ec.getCurlModel();
            const info = model.engraveLongInfo;
            const claimable = () => ec.checkLongRewardStatRed() === true;
            if (s.stageSent) {
                if (!claimable()) {
                    sendLog("✅ [Điêu Long] Máy chủ xác nhận đã nhận rương mốc điểm.", "result");
                    s.stageSent = 0;
                    s.phase = 'long-tasks';
                    return true;
                }
                if (now - s.stageSent >= DRAGON_REQUEST_TIMEOUT_MS) {
                    sendLog("⚠️ [Điêu Long] Đã gửi nhận rương mốc nhưng máy chủ chưa xác nhận hết; không gửi lại.", "warn");
                    s.stageSent = 0;
                    s.phase = 'long-tasks';
                }
                return false;
            }
            if (!info || !claimable()) { sendLog("ℹ️ [Điêu Long] Không có rương mốc điểm nào để nhận.", "info"); s.phase = 'long-tasks'; return true; }
            ec.send32613();
            s.stageSent = now;
            sendLog("🎁 [Điêu Long] Đã gửi nhận rương mốc điểm; chờ máy chủ xác nhận.", "action");
            return true;
        }

        // "Khiêu chiến Điêu Long": nhiệm vụ DevilSea loại 31; nhận từng nhiệm vụ đã hoàn thành (status 1 -> 2).
        function dragonStepLongTasks(ctx, vm, s, now) {
            const ds = ctx.DevilSeaCtrl && ctx.DevilSeaCtrl.gInst && ctx.DevilSeaCtrl.gInst();
            if (!ds || typeof ds.send30040 !== 'function' || typeof ds.send30041 !== 'function') {
                logUnsupportedOnce('m7-task', "⚠️ [Điêu Long] Không có DevilSeaCtrl để nhận nhiệm vụ Khiêu chiến Điêu Long; bỏ qua.");
                s.phase = 'long-war';
                return false;
            }
            const list = () => ds.getTaskInfo(DRAGON_LONG_TASK_TYPE) || [];
            if (s.taskStage === 'query') {
                const r = pollTowerDailyRefresh(s, 'refreshing', now, () => ds.send30040(DRAGON_LONG_TASK_TYPE), () => ds.getTaskInfo(DRAGON_LONG_TASK_TYPE));
                if (r === 'wait') return false;
                if (r !== 'ready') { dragonFail(s, "[Điêu Long] Máy chủ chưa trả danh sách nhiệm vụ Khiêu chiến; bỏ qua.", 'long-war'); return false; }
                s.taskStage = 'claim';
                return true;
            }
            if (s.claimPending) {
                const t = list().find((x) => x.id === s.claimPending.id);
                if (t && t.status === 2) {
                    s.claimedTasks++;
                    sendLog(`✅ [Điêu Long] Máy chủ xác nhận đã nhận nhiệm vụ Khiêu chiến #${t.id}.`, "result");
                    s.claimPending = null;
                } else if (now - s.claimPending.at >= DRAGON_REQUEST_TIMEOUT_MS) {
                    sendLog(`⚠️ [Điêu Long] Đã gửi nhận nhiệm vụ #${s.claimPending.id} nhưng máy chủ chưa xác nhận; không gửi lại.`, "warn");
                    s.doneTasks = (s.doneTasks || {}); s.doneTasks[s.claimPending.id] = true;
                    s.claimPending = null;
                } else return false;
            }
            s.doneTasks = s.doneTasks || {};
            const next = list().find((x) => x.status === 1 && !s.doneTasks[x.id]);
            if (!next) {
                sendLog(`ℹ️ [Điêu Long] Nhiệm vụ Khiêu chiến: đã nhận ${s.claimedTasks}, không còn nhiệm vụ nào nhận được.`, "info");
                s.phase = 'long-war';
                return true;
            }
            s.doneTasks[next.id] = true;
            s.claimPending = { id: next.id, at: now };
            ds.send30041(DRAGON_LONG_TASK_TYPE, next.id);
            sendLog(`🎁 [Điêu Long] Đã gửi nhận nhiệm vụ Khiêu chiến #${next.id}; chờ máy chủ xác nhận.`, "action");
            return true;
        }

        function handleMinigameDragon(ctx) {
            try {
                if (!ctx.ViewMgr || !ctx.ViewMgr.gInst || !ctx.DiceCtrl && !ctx.EngraveCtrl) {
                    logUnsupportedOnce('m7', "⚠️ [Kiếm Hành & Điêu Long] Bản game hiện tại không có DiceCtrl/EngraveCtrl; tính năng chưa hỗ trợ, không gửi thao tác nào.");
                    return false;
                }
                if (!dragonState) dragonState = createDragonState();
                const s = dragonState;
                const vm = ctx.ViewMgr.gInst();
                const now = Date.now();
                const close = (name) => { try { if (vm.viewIsVisible(name)) vm.closeView(name); } catch (e) { } };
                // Kiếm Hành: đi hết đường thì game bật bảng thưởng/đặt lại đường (cần đóng, không bấm đặt lại).
                if (s.phase === 'dice-roll' || s.phase === 'dice-war') closeStrayPopups();
                switch (s.phase) {
                    case 'dice-open':
                    case 'dice-roll': {
                        const acted = dragonStepDice(ctx, vm, s, now);
                        if (s.phase === 'dice-war') close('diceUi');
                        return acted;
                    }
                    case 'dice-war': {
                        const r = warOrderClaimStep(ctx, vm, s.warOrder, { label: 'Kiếm Hành', typeKey: 'zhanLingType_8', fallbackType: 8, termId: 1 }, now);
                        if (r.status === 'done') { s.phase = 'long-open'; s.refreshing = null; closeStrayPopups(); close('diceUi'); return true; }
                        return r.status === 'acted';
                    }
                    case 'long-open': return dragonStepLongOpen(ctx, vm, s, now);
                    case 'long-play': return dragonStepLongPlay(ctx, vm, s, now);
                    case 'long-stage': return dragonStepLongStage(ctx, vm, s, now);
                    case 'long-tasks': return dragonStepLongTasks(ctx, vm, s, now);
                    case 'long-war': {
                        if (!s.warOrder2) s.warOrder2 = {};
                        const r = warOrderClaimStep(ctx, vm, s.warOrder2, { label: 'Điêu Long', typeKey: 'zhanLingType_28', fallbackType: 28, termId: 1 }, now);
                        if (r.status === 'done') { s.phase = 'done'; sendLog(`🏁 [Kiếm Hành & Điêu Long] Kiếm Hành & Điêu Long đã chạy xong${s.failed ? ' (có bước chưa hoàn tất)' : ''}.`, "info"); return true; }
                        return r.status === 'acted';
                    }
                    default: return false;
                }
            } catch (e) {
                sendLog(`❌ [Kiếm Hành & Điêu Long] Lỗi: ${e && e.message || e}`, "error");
                if (dragonState) { dragonState.failed = true; dragonState.phase = 'done'; }
                return false;
            }
        }
