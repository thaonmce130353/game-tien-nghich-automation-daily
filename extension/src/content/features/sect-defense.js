
        // [Module 3] Thủ Vệ Tứ Phái (Thí Luyện vô tận - ETCtrl, giao diện eTMainUi / embattleUi / eTBfUi)
        // Quy trình giống người chơi, mỗi nhịp chỉ làm một việc:
        //   1. Hỏi máy chủ trạng thái (endLsData.status: 1 sẵn sàng, 2 đang đánh, 3 hết lượt).
        //   2. Mở Thủ Vệ Tứ Phái -> bảng đội hình (trial): xếp đội một chạm -> bấm Khiêu Chiến.
        //   3. Mỗi trận xong game mở bảng chọn Buff (eTBfUi): chọn Buff ở GIỮA.
        //   4. Lặp đến khi máy chủ báo kết thúc (is_quit / status 3), đóng giao diện trận.
        //   5. Màn Thủ Vệ Tứ Phái: nếu số trận thắng (maxId) đã chạm mốc thưởng kế tiếp thì nhận thưởng mốc (nút nhận của màn chính).
        //   6. Vào Chiến Lệnh (zhanLingUi, loại 2): chỉ nhận phần thưởng MIỄN PHÍ đã đủ điều kiện (nút "nhận nhanh" của game).
        // Bước chỉ được tính là xong khi dữ liệu máy chủ xác nhận (fResult mới / status / zlDic đổi).
        const SECT_REQUEST_TIMEOUT_MS = 20000;
        const SECT_FIGHT_TIMEOUT_MS = 90000;
        const SECT_MAX_BATTLES = 100;
        const SECT_MAX_RESTARTS = 1;      // số lần bấm "Bắt đầu lại" (chơi thêm một lượt sau khi lượt đầu kết thúc) mỗi lần chạy
        const SECT_ZL_TERM_ID = 1;
        const SECT_MAX_STAGE_CLAIMS = 20;
        let sectDidSend = false;          // nhịp này đã gửi yêu cầu thật (nếu không: chỉ chờ, scheduler kiểm tra lại ngay)
        const SECT_STATE_READY = 1;
        const SECT_STATE_FIGHTING = 2;
        const SECT_STATE_END = 3;
        let sectDefenseState = null;
        runResetHooks.push(() => {
            // Lần chạy trước có bước lỗi: kiểm tra lại từ máy chủ (bước đã xong sẽ tự bỏ qua).
            if (sectDefenseState && sectDefenseState.failed && sectDefenseState.phase === 'done') sectDefenseState = null;
        });

        function createSectDefenseState() {
            return {
                dayKey: new Date().toDateString(),
                phase: 'status',          // status -> fight -> status(sau trận) -> stageReward -> claim -> done
                failed: false,
                logged: {},
                refreshing: null,
                battles: 0,
                restarts: 0,
                endSeen: false,
                resumeTries: 0,           // số lần tải lại trạng thái khi Bắt đầu không vào trận giữa lượt
                lastResult: null,         // ctrl.fResult đã xử lý
                pendingBuff: null,        // { at, eId } đã chọn Buff, chờ máy chủ xác nhận
                buffSeenAt: 0,
                emb: null,
                idleSince: Date.now(),
                lastEntryAt: 0,
                stageReward: { claimed: 0, batch: null },
                claim: { stage: 'open', refreshing: null, before: 0 }
            };
        }

        function logSect(state, key, message, type) {
            if (state.logged[key]) return;
            state.logged[key] = true;
            sendLog(message, type || "info");
        }

        function failSect(state, key, message, nextPhase) {
            state.failed = true;
            logSect(state, key, `❌ [Thủ Vệ Tứ Phái] ${message}`, "error");
            if (nextPhase) state.phase = nextPhase;
        }

        function sectViewVisible(vm, name) {
            return !!(vm && typeof vm.viewIsVisible === 'function' && vm.viewIsVisible(name));
        }

        // Số phần thưởng Chiến Lệnh miễn phí đã đủ điều kiện nhưng chưa nhận (theo dữ liệu game).
        function sectCountFreeZlRewards(rc, type) {
            const model = rc.getCurlModel && rc.getCurlModel();
            const list = model && typeof model.getZlRewardTermList === 'function'
                ? model.getZlRewardTermList(type, SECT_ZL_TERM_ID) : null;
            if (!list || typeof rc.isCanNormalIdRewardByTermId !== 'function') return null;
            let count = 0;
            for (const reward of list) {
                if (rc.isCanNormalIdRewardByTermId(type, SECT_ZL_TERM_ID, reward.id)) count++;
            }
            return count;
        }

        function sectChooseBuff(ctrl, vm, state, now) {
            const view = vm.getViewByName('eTBfUi');
            if (!view) return false;
            if (!state.buffSeenAt) {
                state.buffSeenAt = now;
                state.buffWaitMs = humanDelay(900);
            }
            if (ctrl.is_send_11031) return false;
            if (now - state.buffSeenAt < state.buffWaitMs) return false;
            if (state.pendingBuff && now - state.pendingBuff.at < SECT_FIGHT_TIMEOUT_MS) return false;

            let buffs = view.lsCltn && (view.lsCltn.source || view.lsCltn);
            if (!buffs || typeof buffs.length !== 'number') buffs = view.exData && view.exData.bfLs;
            if (!buffs || !buffs.length) {
                logSect(state, 'buff-empty', "⚠️ [Thủ Vệ Tứ Phái] Bảng chọn Buff chưa có dữ liệu; chờ game tải.", "warn");
                return false;
            }
            // Lần đầu chọn Buff ở giữa; nếu máy chủ từ chối ("Buff chọn bị lỗi") thì thử Buff khác (đầu, rồi cuối).
            const eId = view.exData && view.exData.eId;
            // Bảng này đã được chọn Buff thành công (máy chủ xác nhận trận): dữ liệu cũ, KHÔNG chọn lại trên đó (máy chủ trả "Buff chọn bị lỗi").
            // Đóng bằng hàm của game; bước khiêu chiến mở lại bảng mới (opEBuffUi -> 11033 trả danh sách Buff của màn kế tiếp).
            if (state.acceptedBuffEIds && state.acceptedBuffEIds[eId]) {
                try { if (typeof ctrl.clsEBuffUi === 'function') ctrl.clsEBuffUi(); else vm.closeView('eTBfUi'); } catch (e) { }
                state.idleSince = now;
                return false;
            }
            state.buffTries = state.buffTries || {};
            const tried = state.buffTries[eId] || 0;
            const order = [Math.floor(buffs.length / 2), 0, buffs.length - 1];
            const index = order[Math.min(tried, order.length - 1)];
            const buff = buffs[index];
            if (!buff || typeof buff.id !== 'number' && typeof buff.id !== 'string') return false;
            if (!tryAttemptTarget(`sect-buff-${eId}`, `[Thủ Vệ Tứ Phái] Chọn Buff màn #${eId}`)) {
                // Sang nhận thưởng rồi kết thúc (không quay lại 'status': status báo "đang đánh" -> lại bảng Buff -> lặp gửi sd11030 vô hạn).
                failSect(state, 'buff-rejected', "Máy chủ từ chối cả 3 lần chọn Buff; dừng chọn Buff, nhận thưởng còn lại rồi kết thúc.", 'claim');
                return true;
            }
            state.buffTries[eId] = tried + 1;

            ctrl.choiceBuffId(buff.id);
            state.pendingBuff = { at: now, eId, result: ctrl.fResult };
            state.buffSeenAt = 0;
            sendLog(`✨ [Thủ Vệ Tứ Phái] Chọn Buff ở giữa (vị trí ${index + 1}/${buffs.length}, #${buff.id}); chờ máy chủ xác nhận trận.`, "action");
            return true;
        }

        function sectStartFromEmbattle(ctx, vm, state, now) {
            const embUi = vm.getViewByName('embattleUi');
            const trialType = ctx.EmbattleConst && ctx.EmbattleConst.embattleType && ctx.EmbattleConst.embattleType.trial;
            if (!embUi || trialType === undefined) return false;
            if (embUi.embattleType !== trialType) {
                logSect(state, 'emb-other', "ℹ️ [Thủ Vệ Tứ Phái] Đang mở bảng đội hình của chức năng khác; chờ bạn đóng hoặc hoàn tất.", "info");
                return false;
            }
            // Bấm "Lên trận nhanh", kiểm tra ô đội hình có tướng, mới bấm "Khiêu Chiến" (Bắt đầu).
            if (!state.emb) state.emb = { at: 0, clicked: 0, starts: 0 };
            const step = embattleStep(embUi, state.emb, now);
            if (step === 'wait') return false;
            if (step === 'arranged') {
                sendLog(`🛡️ [Thủ Vệ Tứ Phái] Đã bấm Lên trận nhanh (lần ${state.emb.clicked}); kiểm tra đội hình.`, "action");
                return true;
            }
            if (step === 'failed') {
                const diag = embattleDiagnose(embUi, state.emb);
                const pressedStart = (state.emb.starts || 0) >= EMBATTLE_START_TRIES;
                const startAt = state.emb.firstStartAt || 0;
                state.emb = null;
                try { vm.closeView('embattleUi'); } catch (e) { }
                // Bắt đầu = sd11033; máy chủ trả 11033 không có enter_id khi hôm nay không còn ải (game không mở bảng Buff).
                const r11033 = typeof netLastReply === 'function' ? netLastReply(11033) : null;
                const noStage = Boolean(startAt && r11033 && r11033.at >= startAt && !(r11033.data && r11033.data.enter_id));
                if (pressedStart && (noStage || state.restarts > 0 || state.endSeen)) {
                    sendLog(`ℹ️ [Thủ Vệ Tứ Phái] Máy chủ không mở thêm ải sau ${state.battles} trận (${noStage ? '11033 không có ải mới' : 'lượt đã kết thúc'}); hôm nay đã hết lượt, chuyển sang nhận thưởng.`, "info");
                    state.phase = 'stageReward';
                    return true;
                }
                if (pressedStart && state.battles > 0 && (state.resumeTries || 0) < 1) {
                    // Đã thấy live (2026-11-06): sau vài trận thắng, Bắt đầu ở bảng đội hình không gửi gì, nhưng lượt vẫn đang đánh dở
                    // (tải lại trang thì 11030 báo status 2 và bảng Buff mở bình thường). Tải lại trạng thái một lần: status 2 → opEBuffUi.
                    state.resumeTries = (state.resumeTries || 0) + 1;
                    sendLog(`ℹ️ [Thủ Vệ Tứ Phái] Bắt đầu không vào trận sau ${state.battles} trận (${diag}); tải lại trạng thái để tiếp tục lượt đang đánh dở.`, "info");
                    state.phase = 'status';
                    return true;
                }
                if (pressedStart && state.battles > 0) {
                    // Đã đánh trong lượt này nhưng không rõ vì sao không vào trận: vẫn nhận thưởng mốc (không bỏ sót), báo để xem lại.
                    sendLog(`⚠️ [Thủ Vệ Tứ Phái] Bắt đầu không vào trận sau ${state.battles} trận (${diag}${r11033 ? '' : ', không thấy phản hồi 11033'}); dừng đánh, vẫn nhận thưởng mốc.`, "warn");
                    state.phase = 'stageReward';
                    return true;
                }
                failSect(state, 'emb-empty', pressedStart
                    ? "Đã bấm Bắt đầu " + EMBATTLE_START_TRIES + " lần nhưng không vào trận (" + diag + "); dừng."
                    : "Không xếp được đội hình sau " + EMBATTLE_ARRANGE_TRIES + " lần Lên trận nhanh (" + diag + "); không khiêu chiến, dừng.", 'claim');
                return false;
            }
            if (typeof embUi.cBtnH2 !== 'function') {
                failSect(state, 'no-challenge', "Bảng đội hình không có nút Khiêu Chiến (bản game đổi); dừng.", 'claim');
                return false;
            }
            if (typeof netTapInstall === 'function') netTapInstall();
            if (!state.emb.firstStartAt) state.emb.firstStartAt = now;
            embattleMarkStarted(state.emb);
            embUi.cBtnH2();
            state.lastEntryAt = now;
            state.idleSince = now;
            sendLog("⚔️ [Thủ Vệ Tứ Phái] Đã bấm Khiêu Chiến; chờ bảng chọn Buff.", "action");
            return true;
        }

        // Máy chủ báo trận vừa xong: fResult được game gán mới trong rv11031 (chỉ khi res=1).
        function sectCheckBattleResult(ctrl, state, now) {
            if (!state.pendingBuff || ctrl.fResult === state.pendingBuff.result) {
                // Máy chủ đã trả lời (cờ gửi đã tắt) nhưng không có kết quả trận mới = bị từ chối (toast "Buff chọn bị lỗi").
                if (state.pendingBuff && !ctrl.is_send_11031 && now - state.pendingBuff.at >= 1500) {
                    state.pendingBuff = null;
                    state.buffSeenAt = 0;
                    sendLog("⚠️ [Thủ Vệ Tứ Phái] Máy chủ từ chối Buff vừa chọn (Buff chọn bị lỗi); thử Buff khác.", "warn");
                    return true;
                }
                if (state.pendingBuff && now - state.pendingBuff.at >= SECT_FIGHT_TIMEOUT_MS) {
                    state.pendingBuff = null;
                    failSect(state, 'battle-timeout', "Máy chủ chưa xác nhận trận sau khi chọn Buff; kiểm tra lại trạng thái, không gửi lại.", 'status');
                    return true;
                }
                return false;
            }
            // Buff đã được nhận: xóa đếm thử của bảng này, đánh dấu bảng là cũ (không chọn lại trên cùng dữ liệu).
            state.acceptedBuffEIds = state.acceptedBuffEIds || {};
            state.acceptedBuffEIds[state.pendingBuff.eId] = true;
            clearTargetAttempts(`sect-buff-${state.pendingBuff.eId}`);
            if (state.buffTries) delete state.buffTries[state.pendingBuff.eId];
            state.pendingBuff = null;
            state.battles++;
            clearTargetAttempts('sect-entry');
            state.idleSince = now;
            const won = ctrl.isCgeSess === true;
            sendLog(`✅ [Thủ Vệ Tứ Phái] Máy chủ xác nhận trận ${state.battles} đã kết thúc (${won ? 'thắng' : 'thua'}${ctrl.is_quit ? ', kết thúc lượt' : ''}).`, "action");
            if (ctrl.is_quit) state.endSeen = true;
            if (ctrl.is_quit || !won) state.phase = 'status';
            return true;
        }

        function sectHandleStatus(ctx, ctrl, state, now) {
            const result = pollTowerDailyRefresh(state, 'refreshing', now, () => ctrl.sd11030(1), () => ctrl.endLsData);
            if (result === 'wait') return false;
            if (result === 'timeout' || result === 'error') {
                failSect(state, 'status-timeout', "Máy chủ chưa trả trạng thái Thí Luyện; không thể tiếp tục an toàn.", 'claim');
                return true;
            }
            const status = ctrl.endLsData && ctrl.endLsData.status;
            if (status === SECT_STATE_END) state.endSeen = true;
            if (status === SECT_STATE_END && state.restarts < SECT_MAX_RESTARTS) {
                // Lượt đã kết thúc nhưng màn Thủ Vệ có nút "Bắt đầu lại": bấm để chơi thêm một lượt (giống người chơi) thay vì kết thúc sớm.
                state.restarts++;
                sendLog(`🔁 [Thủ Vệ Tứ Phái] Lượt khiêu chiến đã kết thúc (hôm nay vượt ${Number(ctrl.endLsData.maxNums) || 0} ải); bấm "Bắt đầu lại" để chơi tiếp (lần ${state.restarts}/${SECT_MAX_RESTARTS}).`, "action");
                state.phase = 'fight';
                state.idleSince = 0;
                state.logged['status-end'] = false;
            } else if (status === SECT_STATE_END) {
                logSect(state, 'status-end', `✅ [Thủ Vệ Tứ Phái] Máy chủ báo đã hết lượt khiêu chiến${state.battles ? ` (đã đánh ${state.battles} trận trong lượt này)` : ' hôm nay'}.`, "action");
                state.phase = 'stageReward';
            } else if (status === SECT_STATE_READY || status === SECT_STATE_FIGHTING) {
                state.phase = 'fight';
                state.idleSince = now;
                state.logged['status-end'] = false;
            } else {
                failSect(state, 'status-unknown', `Trạng thái Thí Luyện không nhận diện được (${status}); dừng.`, 'claim');
            }
            return true;
        }

        function sectHandleFight(ctx, ctrl, vm, state, now) {
            if (state.battles >= SECT_MAX_BATTLES) {
                failSect(state, 'battle-cap', `Đã đánh ${SECT_MAX_BATTLES} trận trong một lượt; dừng để an toàn.`, 'claim');
                return false;
            }
            // Đang chờ game mở bảng Buff/đội hình hoặc chờ trận chạy: không làm gì thêm.
            if (state.pendingBuff || sectViewVisible(vm, 'eTFightUi')) return false;
            if (now - state.idleSince < humanDelay(2500)) return false;
            if (!tryAttemptTarget('sect-entry', "[Thủ Vệ Tứ Phái] Mở Thí Luyện / vào trận")) {
                failSect(state, 'entry-stuck', "Không vào được trận sau 3 lần thử; dừng và kiểm tra lại sau.", 'claim');
                return false;
            }
            const fc = ctx.FightCtrl && ctx.FightCtrl.gInst && ctx.FightCtrl.gInst();
            if (fc && typeof fc.gCanFight === 'function' && !fc.gCanFight(0)) {
                clearTargetAttempts('sect-entry');
                return false;
            }
            const status = ctrl.endLsData && ctrl.endLsData.status;
            state.idleSince = now;
            if (status === SECT_STATE_READY || status === SECT_STATE_END) {
                // END: màn chính hiện nút "Bắt đầu lại" (cp18); nút đó chỉ hiện hộp xác nhận rồi mở bảng đội hình như Khiêu Chiến.
                if (!sectViewVisible(vm, 'eTMainUi')) {
                    ctrl.sd11030(0);          // game tự mở eTMainUi khi sẵn sàng
                    sendLog("🛡️ [Thủ Vệ Tứ Phái] Đang mở màn Thủ Vệ Tứ Phái...", "action");
                } else {
                    ctx.EmbattleCtrl.gInst().openEmbattle(ctx.EmbattleConst.embattleType.trial);
                    sendLog("🛡️ [Thủ Vệ Tứ Phái] Đã bấm Khiêu Chiến, mở bảng đội hình.", "action");
                }
            } else {
                ctrl.opEBuffUi(null);       // đang đánh dở: game mở lại bảng chọn Buff
                sendLog("🛡️ [Thủ Vệ Tứ Phái] Tiếp tục lượt đang đánh dở, mở bảng chọn Buff.", "action");
            }
            return true;
        }

        // Thưởng mốc của màn Thủ Vệ Tứ Phái: cùng điều kiện với ctrl.gNextSTRwId() của game, nhưng liệt kê TẤT CẢ mốc đã đạt
        // (id > mốc đã nhận cuối cùng, id <= maxId đã thắng tới). Mỗi mốc nhận bằng sd11032(id); máy chủ trả lời từng cái rồi game tự
        // tải lại trạng thái, nên có thể gửi liên tiếp rồi xác nhận một lần (nhanh hơn đợi từng mốc).
        function sectReachedStageRewardIds(ctrl, data) {
            const model = ctrl.getCurlModel();
            const cfg = model.getStRwCfg();
            const ids = Object.keys(cfg).map(Number).sort((x, y) => x - y);
            const done = data.fAwrdIds || [];
            const last = done.length ? done[done.length - 1].id : 0;
            if (done.length && last >= model.getLastGuanKaId()) return [];
            const maxId = Number(data.maxId) || 0;
            return ids.filter((id) => id > last && id <= maxId);
        }

        const SECT_STAGE_CLAIM_GAP_MS = 200;      // khoảng cách giữa hai lần gửi nhận mốc
        const SECT_STAGE_SETTLE_MS = 3000;        // số mốc còn lại không đổi trong khoảng này sau khi gửi xong -> kết luận

        function sectHandleStageReward(ctrl, state, now) {
            const sr = state.stageReward;
            if (typeof ctrl.getCurlModel !== 'function' || typeof ctrl.sd11032 !== 'function') {
                failSect(state, 'sr-missing', "Bản game không có hàm nhận thưởng mốc; bỏ qua bước này.", 'claim');
                return false;
            }
            const data = ctrl.endLsData;
            if (!data) {
                failSect(state, 'sr-nodata', "Chưa có dữ liệu Thí Luyện để kiểm tra thưởng mốc.", 'claim');
                return false;
            }
            let ids;
            try { ids = sectReachedStageRewardIds(ctrl, data); } catch (e) {
                failSect(state, 'sr-cfg', "Không đọc được danh sách mốc thưởng; bỏ qua bước này.", 'claim');
                return false;
            }
            const b = sr.batch;
            if (!b) {
                if (!ids.length || sr.claimed >= SECT_MAX_STAGE_CLAIMS) {
                    sendLog(sr.claimed
                        ? `ℹ️ [Thủ Vệ Tứ Phái] Đã nhận ${sr.claimed} thưởng mốc; không còn mốc nào đủ điều kiện (đã thắng tới #${Number(data.maxId) || 0}).`
                        : `ℹ️ [Thủ Vệ Tứ Phái] Chưa có thưởng mốc nào đủ điều kiện nhận (đã thắng tới #${Number(data.maxId) || 0}).`, "info");
                    state.phase = 'claim';
                    return true;
                }
                const take = ids.slice(0, SECT_MAX_STAGE_CLAIMS - sr.claimed);
                sr.batch = { ids: take, sent: 0, lastAt: 0, token: data, remaining: take.length, changedAt: now };
                sendLog(`🎁 [Thủ Vệ Tứ Phái] Đã chạm ${take.length} mốc thưởng (${take.map((x) => '#' + x).join(', ')}; thắng tới #${Number(data.maxId) || 0}); nhận liên tiếp.`, "action");
                return true;
            }
            // Gửi lần lượt các mốc (không đợi từng phản hồi).
            if (b.sent < b.ids.length) {
                if (now - b.lastAt < SECT_STAGE_CLAIM_GAP_MS) return true;
                b.lastAt = now;
                sectDidSend = true;
                ctrl.sd11032(b.ids[b.sent]);
                b.sent++;
                b.changedAt = now;
                return true;
            }
            // Đã gửi hết: đợi dữ liệu máy chủ (game tự tải lại sau mỗi phản hồi) cho thấy các mốc đã nhận.
            const refreshed = ctrl.endLsData !== b.token;
            const remaining = refreshed ? ids.filter((x) => b.ids.includes(x)).length : b.ids.length;
            if (remaining !== b.remaining) { b.remaining = remaining; b.changedAt = now; }
            const settled = now - b.changedAt >= SECT_STAGE_SETTLE_MS;
            if (refreshed && remaining === 0) {
                sr.claimed += b.ids.length;
                sr.batch = null;
                sendLog(`✅ [Thủ Vệ Tứ Phái] Máy chủ xác nhận đã nhận ${b.ids.length} thưởng mốc.`, "result");
                state.phase = 'claim';
                return true;
            }
            if (now - b.lastAt >= SECT_REQUEST_TIMEOUT_MS || (refreshed && settled)) {
                const got = b.ids.length - remaining;
                sr.claimed += got;
                sr.batch = null;
                if (got > 0) sendLog(`✅ [Thủ Vệ Tứ Phái] Máy chủ xác nhận đã nhận ${got}/${b.ids.length} thưởng mốc.`, "result");
                failSect(state, 'sr-unconfirmed', `Còn ${remaining} mốc thưởng chưa được máy chủ xác nhận sau khi gửi; không gửi lại để tránh trùng.`, 'claim');
            }
            return true;
        }

        function sectHandleClaim(ctx, ctrl, vm, state, now) {
            const rc = ctx.RechargeCtrl && ctx.RechargeCtrl.gInst && ctx.RechargeCtrl.gInst();
            const zlType = ctx.RechargeConst && ctx.RechargeConst.ZhanLingType && ctx.RechargeConst.ZhanLingType.zhanLingType_2 || 2;
            const c = state.claim;
            if (!rc || typeof rc.send12322 !== 'function' || typeof rc.openZhanLingUi !== 'function') {
                failSect(state, 'no-zl', "Game chưa sẵn sàng cho Chiến Lệnh (RechargeCtrl); bỏ qua bước nhận.", 'done');
                return false;
            }
            // Đóng màn Thủ Vệ Tứ Phái (nút đóng của game) trước khi sang Chiến Lệnh.
            if (c.stage === 'open' && sectViewVisible(vm, 'eTMainUi') && typeof ctrl.clsElessTUi === 'function') {
                sectDidSend = true;
                ctrl.clsElessTUi();
                return true;
            }
            const tokenOf = () => rc.getZlNetVoByType(zlType);
            if (c.stage === 'open') {
                const r = pollTowerDailyRefresh(c, 'refreshing', now, () => { sectDidSend = true; rc.openZhanLingUi(zlType, SECT_ZL_TERM_ID); }, tokenOf);
                if (r === 'wait') return true;
                if (r !== 'ready') {
                    failSect(state, 'zl-open', "Máy chủ chưa trả dữ liệu Chiến Lệnh; bỏ qua bước nhận.", 'done');
                    sectCloseZl(vm);
                    return true;
                }
                const available = sectCountFreeZlRewards(rc, zlType);
                if (available === null) {
                    failSect(state, 'zl-count', "Không đọc được danh sách thưởng Chiến Lệnh (bản game đổi); không nhận.", 'done');
                    sectCloseZl(vm);
                } else if (available === 0) {
                    logSect(state, 'zl-none', "ℹ️ [Thủ Vệ Tứ Phái - Chiến Lệnh] Không có phần thưởng miễn phí nào để nhận lúc này.", "info");
                    state.phase = 'done';
                    sectCloseZl(vm);
                } else {
                    c.before = available;
                    c.stage = 'claim';
                    sendLog(`🎁 [Thủ Vệ Tứ Phái - Chiến Lệnh] Có ${available} phần thưởng miễn phí có thể nhận; đang nhận.`, "action");
                }
                return true;
            }
            if (c.stage === 'claim') {
                const r = pollTowerDailyRefresh(c, 'refreshing', now, () => { sectDidSend = true; return rc.send12322(zlType, SECT_ZL_TERM_ID); }, tokenOf);
                if (r === 'wait') return true;
                if (r !== 'ready') {
                    failSect(state, 'zl-claim', "Máy chủ chưa xác nhận việc nhận Chiến Lệnh; không gửi lại để tránh trùng.", 'done');
                    sectCloseZl(vm);
                    return true;
                }
                const left = sectCountFreeZlRewards(rc, zlType);
                if (left === 0) sendLog(`✅ [Thủ Vệ Tứ Phái - Chiến Lệnh] Máy chủ xác nhận đã nhận ${c.before} phần thưởng.`, "result");
                else failSect(state, 'zl-partial', `Đã gửi nhận nhưng còn ${left} phần thưởng chưa nhận được (có thể cần điều kiện khác).`);
                state.phase = 'done';
                sectCloseZl(vm);
                return true;
            }
            return false;
        }

        function sectCloseZl(vm) {
            try { if (sectViewVisible(vm, 'zhanLingUi')) vm.closeView('zhanLingUi'); } catch (e) { }
        }

        function handleSectDefense(ctx) {
            try {
                if (!ctx.ETCtrl || !ctx.ETCtrl.gInst || !ctx.ViewMgr || !ctx.ViewMgr.gInst) {
                    logUnsupportedOnce('m3', "⚠️ [Thủ Vệ Tứ Phái] Game chưa sẵn sàng (ETCtrl); sẽ thử lại.");
                    return false;
                }
                const ctrl = ctx.ETCtrl.gInst();
                const vm = ctx.ViewMgr.gInst();
                const dayKey = new Date().toDateString();
                if (!sectDefenseState || sectDefenseState.dayKey !== dayKey) {
                    sectDefenseState = createSectDefenseState();
                    sendLog("🛡️ [Thủ Vệ Tứ Phái] Bắt đầu/khởi động lại: kiểm tra trạng thái từ game, khiêu chiến, chọn Buff giữa rồi nhận Chiến Lệnh.", "action");
                }
                const state = sectDefenseState;
                if (state.phase === 'done') {
                    logSect(state, 'done', state.failed
                        ? "⚠️ [Thủ Vệ Tứ Phái] Kết thúc nhưng có bước lỗi/chưa xác nhận; sẽ kiểm tra lại khi Auto khởi động lại."
                        : "✅ [Thủ Vệ Tứ Phái] Đã hoàn tất hôm nay (khiêu chiến + Chiến Lệnh).", state.failed ? "warn" : "action");
                    return false;
                }

                const now = Date.now();
                if (state.phase === 'status') return sectHandleStatus(ctx, ctrl, state, now);
                // Hai bước nhận thưởng toàn là gửi + chờ máy chủ: 'wait' khi chưa gửi gì để scheduler kiểm tra lại ngay.
                if (state.phase === 'stageReward') { sectDidSend = false; const r = sectHandleStageReward(ctrl, state, now); return r === true && !sectDidSend ? 'wait' : r; }
                if (state.phase === 'claim') { sectDidSend = false; const r = sectHandleClaim(ctx, ctrl, vm, state, now); return r === true && !sectDidSend ? 'wait' : r; }

                // phase === 'fight'
                if (sectCheckBattleResult(ctrl, state, now)) return true;
                if (sectViewVisible(vm, 'eTBfUi')) return sectChooseBuff(ctrl, vm, state, now);
                state.buffSeenAt = 0;
                if (sectViewVisible(vm, 'embattleUi')) return sectStartFromEmbattle(ctx, vm, state, now);
                state.emb = null;
                return sectHandleFight(ctx, ctrl, vm, state, now);
            } catch (e) {
                const message = `❌ [Thủ Vệ Tứ Phái] Lỗi: ${e && e.message ? e.message : e}`;
                if (message !== lastSectDefenseError) {
                    lastSectDefenseError = message;
                    sendLog(message, "error");
                }
                return false;
            }
        }
        let lastSectDefenseError = '';
