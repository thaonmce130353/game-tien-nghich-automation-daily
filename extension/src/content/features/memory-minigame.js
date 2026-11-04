        // [Module 6] Ảo Cảnh Pháp Trận (FaZhenMirageCtrl, giao diện faZhenMirageMainUi / FZMirageFlipUi, kết quả fmDazzlingResultUi)
        // Quy trình giống người chơi, mỗi nhịp một việc:
        //   1. Mở Ảo Cảnh Pháp Trận, tải dữ liệu (send32060), đọc số lượt nhận thưởng còn lại.
        //   2. Bấm "Bắt đầu" (send32061(0)); máy chủ lật hết 16 thẻ cho xem trong card_item_time giây rồi úp lại.
        //   3. Chờ hết thời gian xem, rồi ghép lần lượt 8 cặp cùng base_id (send32062 với 2 uid), mỗi cặp cách nhau
        //      khoảng 0,9s để cả ván xong trong ~8-10s; mỗi cặp phải được máy chủ xác nhận (status = 1).
        //   4. Xong ván máy chủ gửi bảng kết quả: đóng lại, chơi tiếp nếu còn lượt thưởng.
        //   5. Nhận thưởng mốc điểm (send32064) khi đủ điểm, xác nhận bằng dữ liệu máy chủ.
        //   6. Nhận thưởng nhiệm vụ Ảo Cảnh (devilSeaTrialUi, loại FZMFlipTask): cả "Nhiệm vụ hằng ngày" và "Nhiệm vụ thành tựu"
        //      nằm chung một danh sách nhiệm vụ của máy chủ (send30040); mỗi nhiệm vụ đã hoàn thành (status 1) nhận bằng
        //      send30041(loại, id) như nút Nhận của game; xác nhận khi status chuyển 2.
        // Chỉ ghi "đã" khi dữ liệu máy chủ xác nhận; thiếu phản hồi thì báo lỗi và không gửi lại.
        const MEMORY_REQUEST_TIMEOUT_MS = 15000;
        const MEMORY_MAX_ROUNDS = 12;
        const MEMORY_ROUND_TARGET_MS = 9000;   // cả ván (tính từ lúc bấm Bắt đầu) khoảng 8-10s

        let memoryState = null;
        runResetHooks.push(() => { memoryState = null; });

        function createMemoryState() {
            return {
                dayKey: new Date().toDateString(),
                phase: 'open',            // open -> start -> preview -> solve -> finish -> claim -> tasks -> done
                failed: false,
                refreshing: null,
                rounds: 0,
                nextAt: 0,
                pairs: null,              // [[uid, uid], ...] chưa ghép
                pairsTotal: 0,
                sentPairs: 0,
                startSentAt: 0,
                roundStartedAt: 0,
                passBefore: 0,
                scoreBefore: 0,
                claimBefore: 0,
                tasks: { stage: 'query', refreshing: null, sent: {}, pending: {}, claimed: 0, rounds: 0, lastSendAt: 0, lastPopupAt: 0, any: false }
            };
        }

        function memoryRead(ctrl) {
            const d = ctrl.sc32060;
            if (!d) return null;
            const model = ctrl.getCurlModel && ctrl.getCurlModel();
            const total = model && model.getcfg1 ? Number(model.getcfg1('challenge_reward_num')) : NaN;
            return {
                token: d,
                beginMs: parseLongVal(d.begin_ms),
                scores: Number(d.scores) || 0,
                passTaken: Number(d.pass_award_take) || 0,
                rewardRuns: total,
                previewSec: model && model.getcfg1 ? Number(model.getcfg1('card_item_time')) || 3 : 3
            };
        }

        function memoryClaimable(ctrl) {
            return typeof ctrl.checkRewardRed === 'function' && ctrl.checkRewardRed();
        }

        function memoryFail(state, message) {
            sendLog(`❌ [Ảo Cảnh Pháp Trận] ${message}`, "error");
            state.failed = true;
            // Ván lỗi không được làm mất thưởng mốc điểm đã đủ: thử nhận thưởng một lần rồi mới dừng.
            if (!state.claimBlocked && !state.claimDone && !state.claimSent) { state.phase = 'claim'; state.claimReturn = 'tasks'; }
            else state.phase = 'tasks';
        }

        // Chữ ký trạng thái các mốc điểm (score -> status) từ máy chủ; đổi nghĩa là máy chủ đã phản hồi nhận thưởng.
        function memoryStatusSig(ctrl) {
            try { return JSON.stringify(ctrl.statusDic || {}); } catch (e) { return ''; }
        }

        function memoryMilestoneText(ctrl) {
            try {
                const model = ctrl.getCurlModel();
                const cfg = model && model.getcfg2 ? model.getcfg2() : [];
                return cfg.map((c) => `${c.num}:${ctrl.getStatusByScore(c.num)}`).join(', ');
            } catch (e) { return '?'; }
        }

        // Hẹn giờ gửi lần lượt 8 cặp, cặp cuối vào khoảng MEMORY_ROUND_TARGET_MS sau lúc bấm Bắt đầu. Gửi nối tiếp,
        // không chờ từng cặp (mỗi lần chờ phản hồi + nhịp 0,5s làm ván kéo dài gấp đôi); kết quả kiểm tra ở bước finish.
        function memoryScheduleSolve(ctrl, s) {
            const first = Math.max(Date.now() + 100, s.firstPairAt);
            const last = Math.max(first + 7 * 350, s.startSentAt + MEMORY_ROUND_TARGET_MS);
            const step = (last - first) / Math.max(1, s.pairsTotal - 1);
            s.sentPairs = 0;
            const pairs = s.pairs.slice();
            s.pairs = [];
            pairs.forEach((uids, i) => {
                const at = first + i * step + (i === 0 ? 0 : (Math.random() - 0.5) * step * 0.3);
                setTimeout(() => {
                    if (memoryState !== s || s.phase !== 'solve' || !CONFIG.running) { s.sentPairs = s.pairsTotal; return; }
                    try { ctrl.send32062(uids.map((uid) => ({ uid }))); } catch (e) { }
                    s.sentPairs++;
                }, Math.max(0, at - Date.now()));
            });
        }

        function memoryBuildPairs(ctrl) {
            const byBase = {};
            const dic = ctrl.cardDic || {};
            for (const uid of Object.keys(dic)) {
                const c = dic[uid];
                if (!c || c.status === 1) continue;
                (byBase[c.base_id] = byBase[c.base_id] || []).push(Number(uid));
            }
            const pairs = [];
            for (const base of Object.keys(byBase)) {
                const list = byBase[base];
                for (let i = 0; i + 1 < list.length; i += 2) pairs.push([list[i], list[i + 1]]);
            }
            return pairs;
        }

        const MEMORY_TASK_GAP_MS = 250;           // khoảng cách giữa hai lần gửi nhận nhiệm vụ
        const MEMORY_TASK_MAX_ROUNDS = 3;         // nhận xong có thể mở thêm nhiệm vụ: tải lại tối đa chừng này vòng

        // Nhận thưởng nhiệm vụ Ảo Cảnh (hằng ngày + thành tựu). Mỗi nhịp một việc; chỉ ghi "đã" khi máy chủ đổi status sang 2.
        function memoryStepTasks(ctx, s, now) {
            const t = s.tasks;
            const ds = ctx.DevilSeaCtrl && ctx.DevilSeaCtrl.gInst && ctx.DevilSeaCtrl.gInst();
            const type = ctx.DevilSeaConst && ctx.DevilSeaConst.TrialTaskType && ctx.DevilSeaConst.TrialTaskType.FZMFlipTask;
            if (!ds || type === undefined || typeof ds.send30040 !== 'function' || typeof ds.send30041 !== 'function' || typeof ds.getTaskInfo !== 'function') {
                logUnsupportedOnce('m6-task', "⚠️ [Ảo Cảnh Pháp Trận] Không có DevilSeaCtrl để nhận nhiệm vụ Ảo Cảnh; bỏ qua.");
                s.phase = 'done';
                return false;
            }
            // Nhận quà làm hiện bảng thưởng: đóng định kỳ.
            if (now - t.lastPopupAt >= 700) { t.lastPopupAt = now; closeStrayPopups(); }
            const list = () => ds.getTaskInfo(type) || [];

            if (t.stage === 'query') {
                const r = pollTowerDailyRefresh(t, 'refreshing', now, () => ds.send30040(type), () => ds.getTaskInfo(type));
                if (r === 'wait') return true;
                if (r !== 'ready') {
                    sendLog("⚠️ [Ảo Cảnh Pháp Trận] Máy chủ chưa trả danh sách nhiệm vụ Ảo Cảnh; bỏ qua nhận nhiệm vụ.", "warn");
                    s.failed = true;
                    s.phase = 'done';
                    return false;
                }
                t.queue = list().filter((x) => x.status === 1 && !t.sent[x.id]).map((x) => x.id);
                t.stage = 'send';
                t.rounds++;
                t.roundClaimed = 0;
                if (t.queue.length) sendLog(`🎁 [Ảo Cảnh Pháp Trận] Có ${t.queue.length} nhiệm vụ đã hoàn thành (hằng ngày/thành tựu); nhận liên tiếp.`, "action");
                return true;
            }

            // Xác nhận các nhiệm vụ đã gửi: status của mục trong danh sách máy chủ chuyển sang 2.
            for (const id of Object.keys(t.pending)) {
                const entry = list().find((x) => String(x.id) === id);
                if (entry && entry.status === 2) {
                    delete t.pending[id];
                    t.claimed++;
                    t.roundClaimed++;
                    t.any = true;
                } else if (now - t.pending[id] >= MEMORY_REQUEST_TIMEOUT_MS) {
                    delete t.pending[id];
                    s.failed = true;
                    sendLog(`⚠️ [Ảo Cảnh Pháp Trận] Máy chủ chưa xác nhận nhận nhiệm vụ #${id}; không gửi lại.`, "warn");
                }
            }

            if (t.stage === 'send') {
                if (t.queue.length) {
                    if (now - t.lastSendAt < MEMORY_TASK_GAP_MS) return true;
                    const id = t.queue.shift();
                    t.lastSendAt = now;
                    t.sent[id] = true;
                    t.pending[id] = now;
                    ds.send30041(type, id);
                    return true;
                }
                t.stage = 'confirm';
                return true;
            }

            // stage === 'confirm': đợi hết nhiệm vụ đang chờ xác nhận.
            if (Object.keys(t.pending).length) return true;
            if (t.roundClaimed > 0 && t.rounds < MEMORY_TASK_MAX_ROUNDS) {
                // Nhận xong có thể mở thêm nhiệm vụ (chuỗi thành tựu): tải lại danh sách một lần nữa.
                t.stage = 'query';
                t.refreshing = null;
                return true;
            }
            if (t.claimed) sendLog(`✅ [Ảo Cảnh Pháp Trận] Máy chủ xác nhận đã nhận ${t.claimed} thưởng nhiệm vụ (hằng ngày + thành tựu).`, "result");
            else if (!Object.keys(t.sent).length) sendLog("ℹ️ [Ảo Cảnh Pháp Trận] Không có thưởng nhiệm vụ Ảo Cảnh nào để nhận.", "info");
            s.phase = 'done';
            return false;
        }

        function handleMinigameMemory(ctx) {
            try {
                if (!ctx.FaZhenMirageCtrl || !ctx.FaZhenMirageCtrl.gInst || !ctx.ViewMgr || !ctx.ViewMgr.gInst) {
                    logUnsupportedOnce('m6', "⚠️ [Ảo Cảnh Pháp Trận] Bản game hiện tại không có FaZhenMirageCtrl; tính năng chưa hỗ trợ, không gửi thao tác nào.");
                    return false;
                }
                const ctrl = ctx.FaZhenMirageCtrl.gInst();
                const vm = ctx.ViewMgr.gInst();
                if (!ctrl || typeof ctrl.send32060 !== 'function' || typeof ctrl.send32061 !== 'function' ||
                    typeof ctrl.send32062 !== 'function' || typeof ctrl.send32064 !== 'function') {
                    logUnsupportedOnce('m6', "⚠️ [Ảo Cảnh Pháp Trận] FaZhenMirageCtrl thiếu lệnh gửi cần thiết (bản game đổi); không gửi thao tác nào.");
                    return false;
                }
                if (!memoryState) memoryState = createMemoryState();
                const s = memoryState;
                if (s.phase === 'done') return false;
                const now = Date.now();
                const tokenOf = () => ctrl.sc32060;
                const closeResult = () => { for (const name of ['fmDazzlingResultUi', 'backpackGetAwardTipsUi']) { try { if (vm.viewIsVisible(name)) vm.closeView(name); } catch (e) { } } };
                const openMain = () => { try { if (!vm.viewIsVisible('faZhenMirageMainUi') && typeof ctrl.opFaZhenMirageUi === 'function') ctrl.opFaZhenMirageUi(); } catch (e) { } };

                // Bảng kết quả có thể che màn hình: đóng ngay khi hiện.
                if (s.phase !== 'solve' && vm.viewIsVisible && vm.viewIsVisible('fmDazzlingResultUi')) { closeResult(); return true; }

                if (s.phase === 'open') {
                    openMain();
                    const r = pollTowerDailyRefresh(s, 'refreshing', now, () => ctrl.send32060(), tokenOf);
                    if (r === 'wait') return false;
                    if (r !== 'ready') { memoryFail(s, "Máy chủ chưa trả dữ liệu Ảo Cảnh Pháp Trận; dừng, không gửi lại."); return false; }
                    const d = memoryRead(ctrl);
                    if (!d || !(d.rewardRuns > 0)) { memoryFail(s, "Không đọc được số lượt thưởng Ảo Cảnh (bản game đổi); dừng."); return false; }
                    const left = d.rewardRuns - d.passTaken;
                    if (d.beginMs === 0 && left <= 0 && !s.claimDone && !s.claimBlocked && memoryClaimable(ctrl)) {
                        sendLog(`🎁 [Ảo Cảnh Pháp Trận] Đã chơi đủ ${d.passTaken}/${d.rewardRuns} ván (điểm ${d.scores}; mốc ${memoryMilestoneText(ctrl)}); nhận thưởng mốc cuối (một lần nhận hết).`, "action");
                        s.phase = 'claim';
                        s.claimReturn = 'open';
                        return true;
                    }
                    if (d.beginMs > 0) {
                        sendLog("ℹ️ [Ảo Cảnh Pháp Trận] Đang có ván dở; tiếp tục ghép thẻ.", "info");
                        s.pairs = memoryBuildPairs(ctrl);
                        s.pairsTotal = s.pairs.length;
                        s.roundStartedAt = now;
                        s.startSentAt = now - 3000;
                        s.firstPairAt = now + 300;
                        memoryScheduleSolve(ctrl, s);
                        s.phase = 'solve';
                        return true;
                    }
                    // Chỉ chơi đủ số ván có thưởng (không chơi thêm ván nào sau khi hết lượt thưởng).
                    if (left <= 0 || s.rounds >= MEMORY_MAX_ROUNDS) {
                        sendLog(`ℹ️ [Ảo Cảnh Pháp Trận] Hết ván cần chơi (${d.passTaken}/${d.rewardRuns}); chuyển sang nhận thưởng mốc điểm.`, "info");
                        s.phase = 'claim';
                        s.claimReturn = 'tasks';
                        return true;
                    }
                    s.passBefore = d.passTaken;
                    s.scoreBefore = d.scores;
                    s.phase = 'start';
                    sendLog(`🧩 [Ảo Cảnh Pháp Trận] Lượt thưởng còn ${Math.max(0, left)}/${d.rewardRuns}; bấm Bắt đầu.`, "action");
                    return true;
                }

                if (s.phase === 'start') {
                    if (now < s.nextAt) return false;
                    if (!s.startSentAt) s.startSentAt = now;
                    const r = pollTowerDailyRefresh(s, 'refreshing', now, () => ctrl.send32061(0), tokenOf);
                    if (r === 'wait') return true;
                    if (r !== 'ready') { memoryFail(s, "Máy chủ chưa xác nhận việc bắt đầu ván; không gửi lại để tránh mất lượt."); return false; }
                    const d = memoryRead(ctrl);
                    if (!d || d.beginMs <= 0) { memoryFail(s, "Đã bấm Bắt đầu nhưng máy chủ chưa mở ván (begin_ms = 0); dừng."); return false; }
                    s.rounds++;
                    s.roundStartedAt = now;
                    s.pairs = memoryBuildPairs(ctrl);
                    s.pairsTotal = s.pairs.length;
                    if (s.pairsTotal !== 8) { memoryFail(s, `Bàn có ${s.pairsTotal} cặp thay vì 8 (bản game đổi); không tự ghép.`); return false; }
                    const previewMs = d.previewSec * 1000;
                    s.firstPairAt = s.startSentAt + previewMs + 300;
                    s.phase = 'preview';
                    sendLog(`🧩 [Ảo Cảnh Pháp Trận] Ván ${s.rounds} đã mở; xem thẻ ${d.previewSec}s rồi ghép 8 cặp.`, "action");
                    return true;
                }

                if (s.phase === 'preview') {
                    if (now < s.firstPairAt - 400) return false;
                    memoryScheduleSolve(ctrl, s);
                    s.phase = 'solve';
                    return false;
                }

                if (s.phase === 'solve') {
                    // Các cặp đã được hẹn giờ gửi (memoryScheduleSolve); chờ gửi xong rồi kiểm tra bằng dữ liệu máy chủ.
                    if (s.sentPairs >= s.pairsTotal) {
                        s.phase = 'finish';
                        s.refreshing = null;
                        s.nextAt = now + 800;
                    }
                    return false;
                }

                if (s.phase === 'finish') {
                    if (now < s.nextAt) return false;
                    closeResult();
                    const r = pollTowerDailyRefresh(s, 'refreshing', now, () => ctrl.send32060(), tokenOf);
                    if (r === 'wait') return false;
                    const d = memoryRead(ctrl);
                    if (r !== 'ready' || !d) { memoryFail(s, "Không tải lại được dữ liệu sau ván; dừng."); return false; }
                    const secs = Math.round((now - s.roundStartedAt) / 100) / 10;
                    if (d.beginMs === 0) {
                        sendLog(`✅ [Ảo Cảnh Pháp Trận] Máy chủ xác nhận đã đóng ván ${s.rounds} sau ${secs}s (điểm ${s.scoreBefore} → ${d.scores}, lượt thưởng ${s.passBefore} → ${d.passTaken}).`, "action");
                        s.phase = 'open';
                        s.startSentAt = 0;
                        s.refreshing = null;
                        s.nextAt = now + humanDelay(1500);
                        return true;
                    }
                    memoryFail(s, `Đã ghép đủ 8 cặp nhưng máy chủ chưa đóng ván (begin_ms=${d.beginMs}, điểm ${d.scores}); dừng.`);
                    return false;
                }

                if (s.phase === 'tasks') return memoryStepTasks(ctx, s, now);

                if (s.phase === 'claim') {
                    const back = () => { s.claimDone = true; s.claimSent = 0; s.phase = s.claimReturn || 'tasks'; s.claimReturn = null; if (s.phase === 'open') { s.refreshing = null; s.nextAt = now + humanDelay(1200); } };
                    if (s.claimSent) {
                        if (memoryStatusSig(ctrl) !== s.claimSig) {
                            closeResult();
                            const rest = memoryClaimable(ctrl);
                            sendLog(rest ? `⚠️ [Ảo Cảnh Pháp Trận] Máy chủ đã phản hồi nhận thưởng nhưng còn mốc chưa nhận (mốc ${memoryMilestoneText(ctrl)}).` : `✅ [Ảo Cảnh Pháp Trận] Máy chủ xác nhận đã nhận thưởng mốc điểm (mốc ${memoryMilestoneText(ctrl)}).`, rest ? "warn" : "result");
                            back();
                            return true;
                        }
                        if (now - s.claimSent >= MEMORY_REQUEST_TIMEOUT_MS) {
                            sendLog(`⚠️ [Ảo Cảnh Pháp Trận] Đã gửi nhận thưởng mốc điểm nhưng máy chủ chưa xác nhận (mốc ${memoryMilestoneText(ctrl)}); không gửi lại.`, "warn");
                            s.claimBlocked = true;
                            s.failed = true;
                            back();
                        }
                        return false;
                    }
                    if (s.claimBlocked || (s.claimDone && s.claimReturn === 'tasks')) { back(); return false; }   // đã gửi mà máy chủ không xác nhận: không gửi lại
                    if (!memoryClaimable(ctrl)) {
                        const d = memoryRead(ctrl);
                        sendLog(`ℹ️ [Ảo Cảnh Pháp Trận] Không có thưởng mốc điểm nào để nhận (điểm ${d ? d.scores : '?'}; mốc ${memoryMilestoneText(ctrl)}).`, "info");
                        back();
                        return false;
                    }
                    s.claimSent = now;
                    s.claimSig = memoryStatusSig(ctrl);
                    ctrl.send32064();
                    sendLog("🎁 [Ảo Cảnh Pháp Trận] Đã gửi nhận thưởng mốc điểm; chờ máy chủ xác nhận.", "action");
                    return true;
                }
                return false;
            } catch (e) {
                sendLog(`❌ [Ảo Cảnh Pháp Trận] Lỗi: ${e && e.message || e}`, "error");
                if (memoryState) { memoryState.failed = true; memoryState.phase = 'done'; }
                return false;
            }
        }
