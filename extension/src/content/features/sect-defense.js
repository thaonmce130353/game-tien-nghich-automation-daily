
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
        const SECT_ZL_TERM_ID = 1;
        const SECT_MAX_STAGE_CLAIMS = 10;
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
                lastResult: null,         // ctrl.fResult đã xử lý
                pendingBuff: null,        // { at, eId } đã chọn Buff, chờ máy chủ xác nhận
                buffSeenAt: 0,
                emb: null,
                idleSince: Date.now(),
                lastEntryAt: 0,
                stageReward: { refreshing: null, pending: null, claimed: 0 },
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
            const index = Math.floor(buffs.length / 2);
            const buff = buffs[index];
            const eId = view.exData && view.exData.eId;
            if (!buff || typeof buff.id !== 'number' && typeof buff.id !== 'string') return false;
            if (!tryAttemptTarget(`sect-buff-${eId}`, `[Thủ Vệ Tứ Phái] Chọn Buff màn #${eId}`)) return false;

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
                state.emb = null;
                try { vm.closeView('embattleUi'); } catch (e) { }
                failSect(state, 'emb-empty', "Không xếp được đội hình sau " + EMBATTLE_ARRANGE_TRIES + " lần Lên trận nhanh (" + diag + "); không khiêu chiến, dừng.", 'claim');
                return false;
            }
            if (typeof embUi.cBtnH2 !== 'function') {
                failSect(state, 'no-challenge', "Bảng đội hình không có nút Khiêu Chiến (bản game đổi); dừng.", 'claim');
                return false;
            }
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
                if (state.pendingBuff && now - state.pendingBuff.at >= SECT_FIGHT_TIMEOUT_MS) {
                    state.pendingBuff = null;
                    failSect(state, 'battle-timeout', "Máy chủ chưa xác nhận trận sau khi chọn Buff; kiểm tra lại trạng thái, không gửi lại.", 'status');
                    return true;
                }
                return false;
            }
            state.pendingBuff = null;
            state.battles++;
            clearTargetAttempts('sect-entry');
            state.idleSince = now;
            const won = ctrl.isCgeSess === true;
            sendLog(`✅ [Thủ Vệ Tứ Phái] Máy chủ xác nhận trận ${state.battles} đã kết thúc (${won ? 'thắng' : 'thua'}${ctrl.is_quit ? ', kết thúc lượt' : ''}).`, "action");
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
            if (status === SECT_STATE_END) {
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
            if (status === SECT_STATE_READY) {
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

        // Thưởng mốc của màn Thủ Vệ Tứ Phái: nút nhận dùng ctrl.gNextSTRwId(); nhận được khi mốc <= maxId (đã thắng tới đó).
        function sectHandleStageReward(ctrl, state, now) {
            const sr = state.stageReward;
            if (typeof ctrl.gNextSTRwId !== 'function' || typeof ctrl.sd11032 !== 'function') {
                failSect(state, 'sr-missing', "Bản game không có hàm nhận thưởng mốc; bỏ qua bước này.", 'claim');
                return false;
            }
            if (sr.pending) {
                const pending = sr.pending;
                const r = pollTowerDailyRefresh(sr, 'refreshing', now, () => ctrl.sd11032(pending.id), () => ctrl.endLsData);
                if (r === 'wait') return true;
                sr.pending = null;
                if (r !== 'ready') {
                    failSect(state, 'sr-timeout', `Máy chủ chưa xác nhận nhận thưởng mốc #${pending.id}; không gửi lại để tránh trùng.`, 'claim');
                    return true;
                }
                if (ctrl.gNextSTRwId() === pending.id) {
                    failSect(state, 'sr-unconfirmed', `Đã gửi nhận thưởng mốc #${pending.id} nhưng game vẫn chưa ghi nhận; dừng bước này.`, 'claim');
                    return true;
                }
                sr.claimed++;
                sendLog(`✅ [Thủ Vệ Tứ Phái] Máy chủ xác nhận đã nhận thưởng mốc #${pending.id}.`, "result");
                return true;
            }
            const data = ctrl.endLsData;
            if (!data) {
                failSect(state, 'sr-nodata', "Chưa có dữ liệu Thí Luyện để kiểm tra thưởng mốc.", 'claim');
                return false;
            }
            const nextId = ctrl.gNextSTRwId();
            const maxId = Number(data.maxId) || 0;
            if (nextId === null || nextId === undefined || nextId > maxId || sr.claimed >= SECT_MAX_STAGE_CLAIMS) {
                const detail = nextId ? ` (đã thắng tới #${maxId}, mốc kế tiếp #${nextId})` : ' (đã nhận hết các mốc)';
                sendLog(sr.claimed
                    ? `ℹ️ [Thủ Vệ Tứ Phái] Đã nhận ${sr.claimed} thưởng mốc; không còn mốc nào đủ điều kiện${detail}.`
                    : `ℹ️ [Thủ Vệ Tứ Phái] Chưa có thưởng mốc nào đủ điều kiện nhận${detail}.`, "info");
                state.phase = 'claim';
                return true;
            }
            sr.pending = { id: nextId };
            sr.refreshing = null;
            sendLog(`🎁 [Thủ Vệ Tứ Phái] Đã chạm mốc thưởng #${nextId} (thắng tới #${maxId}); đang nhận.`, "action");
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
                ctrl.clsElessTUi();
                return true;
            }
            const tokenOf = () => rc.getZlNetVoByType(zlType);
            if (c.stage === 'open') {
                const r = pollTowerDailyRefresh(c, 'refreshing', now, () => rc.openZhanLingUi(zlType, SECT_ZL_TERM_ID), tokenOf);
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
                const r = pollTowerDailyRefresh(c, 'refreshing', now, () => rc.send12322(zlType, SECT_ZL_TERM_ID), tokenOf);
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
                if (state.phase === 'stageReward') return sectHandleStageReward(ctrl, state, now);
                if (state.phase === 'claim') return sectHandleClaim(ctx, ctrl, vm, state, now);

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
