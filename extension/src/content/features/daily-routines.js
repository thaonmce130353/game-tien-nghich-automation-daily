        const TAM_TIEN_GIFT_CATEGORIES = [
            { typeKey: 'type_1', label: 'Quà Pháp Bảo' },
            { typeKey: 'type_2', label: 'Quà Linh Thú' },
            { typeKey: 'type_3', label: 'Quà Pháp Trận' }
        ];
        const TAM_TIEN_REQUEST_TIMEOUT_MS = 20000;
        const TIEN_HUU_REQUEST_TIMEOUT_MS = 20000;
        const CUOI_NGAY_REQUEST_TIMEOUT_MS = 20000;
        // Lượt Cuối Ngày có thật sự mở/gửi/bấm gì không (khác với chỉ chờ máy chủ hoặc chuyển bước): chỉ lượt thật sự thao tác
        // mới cần nghỉ kiểu người chơi; lượt chờ thì quay lại ngay để bắt phản hồi sớm (xem handleDailyRoutine).
        let cuoiNgayDidSend = false;
        let tamTienDidSend = false;      // như cuoiNgayDidSend nhưng cho Tâm Tiên Đài
        const TIEN_MINH_REQUEST_TIMEOUT_MS = 20000;
        const TIEN_MINH_DUNGEON_FIGHT_TIMEOUT_MS = 30000;
        const TIEN_MINH_FIGHT_MAX_WAIT_MS = 90000;
        const TIEN_MINH_DUNGEON_MAX_BUYS = 4;
        const TIEN_MINH_ASKED_FIGHTS = 2;
        const TIEN_MINH_POLL_FIRST_MS = 1000;      // sau khi trận xong: hỏi lại máy chủ sớm (thời gian đánh không tính vào mốc này)
        const TIEN_MINH_POLL_EVERY_MS = 1500;
        let tamTienDaiState = null;
        let tienHuuState = null;
        let cuoiNgayState = null;
        let tienMinhState = null;
        let tienMinhControllerUnavailableLogged = false;
        const TRO_CHIEN_REQUEST_TIMEOUT_MS = 20000;
        let troChienState = null;
        let troChienControllerUnavailableLogged = false;
        let lastDailyRoutineError = '';

        function createCuoiNgayState(emailCtrl, rankCtrl, acvCtrl) {
            return {
                dayKey: new Date().toDateString(),
                emailCtrl,
                rankCtrl,
                acvCtrl,
                phase: 'mail',
                failed: false,
                loggedErrors: new Set(),
                mail: {
                    opened: false,
                    listBefore: null,
                    requestedAt: 0,
                    loaded: false,
                    types: [],
                    typeIndex: 0,
                    pending: null,
                    claimed: 0
                },
                rank: {
                    opened: false,
                    model: null,
                    view: null,
                    types: [],
                    dataBefore: new Map(),
                    worshipBefore: null,
                    requestedAt: 0,
                    loaded: false,
                    rankIndex: 1,
                    pending: null,
                    worshipped: 0,
                    skipped: 0
                },
                tasks: {
                    opened: false,
                    taskListBefore: null,
                    requestedAt: 0,
                    loaded: false,
                    pending: null,
                    taskClaims: 0,
                    chestClaims: 0
                }
            };
        }

        function logCuoiNgayError(state, key, message) {
            state.failed = true;
            if (state.loggedErrors.has(key)) return;
            state.loggedErrors.add(key);
            sendLog(`⚠️ [Nhận Cuối Ngày] ${message}`, "err");
        }

        function finishCuoiNgay(state) {
            state.phase = 'done';
            const confirmedClaims = state.mail.claimed + state.rank.worshipped +
                state.tasks.taskClaims + state.tasks.chestClaims;
            if (state.failed) {
                sendLog("⚠️ [Nhận Cuối Ngày] Đã kiểm tra xong nhưng một số thao tác chưa được máy chủ xác nhận; xem các lỗi phía trên.", "err");
            } else if (confirmedClaims > 0) {
                sendLog(`✅ [Nhận Cuối Ngày] Máy chủ xác nhận ${state.mail.claimed} lượt nhận nhanh Thư, ${state.rank.worshipped} lượt Hành Lễ và ${state.tasks.taskClaims + state.tasks.chestClaims} thưởng Nhiệm Vụ/Rương.`, "result");
            } else {
                sendLog("ℹ️ [Nhận Cuối Ngày] Đã kiểm tra trạng thái; không còn phần thưởng đang chờ nhận, không gửi lại thao tác đã hoàn tất.", "info");
            }
        }

        function handleCuoiNgayMail(ctx, state) {
            const emailCtrl = state.emailCtrl;
            const tabTypes = ctx.EmailConst && ctx.EmailConst.EmailTabType;
            if (!emailCtrl || !tabTypes ||
                typeof emailCtrl.openElUi !== 'function' ||
                typeof emailCtrl.reqDataBeforeEnter !== 'function' ||
                typeof emailCtrl.isCanReward !== 'function' ||
                typeof emailCtrl.send16007 !== 'function') {
                logCuoiNgayError(state, 'mail-api', 'API Thư chưa sẵn sàng; bỏ qua bước nhận Thư.');
                state.phase = 'rank';
                return true;
            }

            if (!state.mail.opened) {
                state.mail.listBefore = emailCtrl.mailDat && emailCtrl.mailDat.list;
                state.mail.requestedAt = Date.now();
                state.mail.opened = true;
                const opened = emailCtrl.openElUi();
                if (opened === false) {
                    logCuoiNgayError(state, 'mail-locked', 'Không thể mở giao diện Thư; hãy kiểm tra điều kiện mở tính năng trong game.');
                    state.phase = 'rank';
                    return true;
                }
                emailCtrl.reqDataBeforeEnter();
                cuoiNgayDidSend = true;
                sendLog("ℹ️ [Nhận Cuối Ngày - Thư] Đã mở Thư; đang tải trạng thái trước khi nhận nhanh.", "info");
                return true;
            }

            if (!state.mail.loaded) {
                const mailList = emailCtrl.mailDat && emailCtrl.mailDat.list;
                if (Array.isArray(mailList) && mailList !== state.mail.listBefore) {
                    state.mail.loaded = true;
                    state.mail.types = [tabTypes.type_1, tabTypes.type_2];
                } else if (Date.now() - state.mail.requestedAt >= CUOI_NGAY_REQUEST_TIMEOUT_MS) {
                    logCuoiNgayError(state, 'mail-timeout', 'Hết thời gian chờ trạng thái Thư từ máy chủ; không xác nhận đã nhận.');
                    state.phase = 'rank';
                    return true;
                } else {
                    return true;
                }
            }

            if (state.mail.pending) {
                if (!emailCtrl.isCanReward(state.mail.pending.type)) {
                    state.mail.claimed++;
                    sendLog("✅ [Nhận Cuối Ngày - Thư] Máy chủ xác nhận đã nhận nhanh thư có đính kèm.", "result");
                    state.mail.typeIndex++;
                    state.mail.pending = null;
                } else if (Date.now() - state.mail.pending.startedAt >= CUOI_NGAY_REQUEST_TIMEOUT_MS) {
                    logCuoiNgayError(state, 'mail-claim-timeout', 'Máy chủ chưa xác nhận nhận nhanh Thư; không thử gửi lại để tránh nhận trùng.');
                    state.mail.typeIndex++;
                    state.mail.pending = null;
                }
                return true;
            }

            if (state.mail.typeIndex >= state.mail.types.length) {
                state.phase = 'rank';
                return true;
            }

            const type = state.mail.types[state.mail.typeIndex];
            if (!Number.isFinite(type)) {
                logCuoiNgayError(state, 'mail-type', 'Không tìm thấy loại Thư hợp lệ; bỏ qua bước nhận Thư.');
                state.phase = 'rank';
                return true;
            }
            if (!emailCtrl.isCanReward(type)) {
                sendLog(`ℹ️ [Nhận Cuối Ngày - Thư] Không có thư chờ nhận ở loại ${type}; bỏ qua.`, "info");
                state.mail.typeIndex++;
                return true;
            }

            state.mail.pending = { type, startedAt: Date.now() };
            emailCtrl.send16007(type);
            cuoiNgayDidSend = true;
            sendLog(`ℹ️ [Nhận Cuối Ngày - Thư] Đã yêu cầu Nhận nhanh loại ${type}; đang chờ máy chủ xác nhận.`, "info");
            return true;
        }

        function handleCuoiNgayRank(ctx, state) {
            const rankCtrl = state.rankCtrl;
            const rankConst = ctx.RankConst;
            const viewMgr = ctx.ViewMgr && typeof ctx.ViewMgr.gInst === 'function'
                ? ctx.ViewMgr.gInst()
                : null;
            if (!rankCtrl || !rankConst || !rankConst.RankType ||
                typeof rankCtrl.getCurlModel !== 'function' ||
                typeof rankCtrl.showRankMainView !== 'function' ||
                typeof rankCtrl.send15005 !== 'function' ||
                typeof rankCtrl.send15006 !== 'function' ||
                !viewMgr || typeof viewMgr.getViewByName !== 'function' ||
                !ctx.ViewConst || !ctx.ViewConst.rankUi ||
                !ctx.egret || !ctx.egret.TouchEvent) {
                logCuoiNgayError(state, 'rank-api', 'API BXH/Hành Lễ chưa sẵn sàng; bỏ qua bước BXH.');
                state.phase = 'tasks';
                return true;
            }

            if (!state.rank.opened) {
                if (!state.rank.requestedAt) {
                    state.rank.model = rankCtrl.getCurlModel();
                    if (!state.rank.model ||
                        typeof state.rank.model.getRankDataByType !== 'function' ||
                        typeof state.rank.model.getCanWorship !== 'function') {
                        logCuoiNgayError(state, 'rank-model', 'Không tìm thấy BXH Sức Mạnh để kiểm tra Hành Lễ.');
                        state.phase = 'tasks';
                        return true;
                    }
                    state.rank.requestedAt = Date.now();
                    rankCtrl.showRankMainView();
                }

                state.rank.view = viewMgr.getViewByName(ctx.ViewConst.rankUi);
                if (!state.rank.view) {
                    if (Date.now() - state.rank.requestedAt >= CUOI_NGAY_REQUEST_TIMEOUT_MS) {
                        logCuoiNgayError(state, 'rank-view-timeout', 'Hết thời gian chờ giao diện BXH Sức Mạnh; không Hành Lễ.');
                        state.phase = 'tasks';
                    }
                    return true;
                }
                if (!state.rank.view.itemList ||
                    typeof state.rank.view.itemList.getElementAt !== 'function' ||
                    typeof state.rank.view.reqRankList !== 'function') {
                    logCuoiNgayError(state, 'rank-view', 'Giao diện BXH chính chưa sẵn sàng để bấm các biểu tượng Hành Lễ.');
                    state.phase = 'tasks';
                    return true;
                }

                const rankTypes = state.rank.view.crtRankTypeArr;
                if (!Array.isArray(rankTypes) || rankTypes.length === 0) {
                    logCuoiNgayError(state, 'rank-types', 'BXH Sức Mạnh chưa có hạng mục khả dụng để Hành Lễ.');
                    state.phase = 'tasks';
                    return true;
                }
                state.rank.types = rankTypes.slice();
                state.rank.types.forEach((type) => {
                    state.rank.dataBefore.set(type, state.rank.model.getRankDataByType(type));
                });
                state.rank.worshipBefore = state.rank.model.worship_dic;
                state.rank.requestedAt = Date.now();
                state.rank.opened = true;
                rankCtrl.send15005();
                cuoiNgayDidSend = true;
                state.rank.view.reqRankList();
                sendLog("ℹ️ [Nhận Cuối Ngày - BXH] Đã mở BXH Sức Mạnh; đang tải trạng thái các biểu tượng Hành Lễ.", "info");
                return true;
            }

            if (!state.rank.loaded) {
                const worshipData = state.rank.model.worship_dic;
                const rankDataLoaded = state.rank.types.every((type) => {
                    const rankData = state.rank.model.getRankDataByType(type);
                    return rankData && rankData !== state.rank.dataBefore.get(type) &&
                        Array.isArray(rankData.list);
                });
                if (rankDataLoaded && worshipData && worshipData !== state.rank.worshipBefore) {
                    state.rank.loaded = true;
                } else if (Date.now() - state.rank.requestedAt >= CUOI_NGAY_REQUEST_TIMEOUT_MS) {
                    logCuoiNgayError(state, 'rank-timeout', 'Hết thời gian chờ trạng thái BXH Sức Mạnh/Hành Lễ; không xác nhận đã tương tác.');
                    state.phase = 'tasks';
                    return true;
                } else {
                    return true;
                }
            }

            if (state.rank.pending) {
                const type = state.rank.pending.type;
                if (!state.rank.model.getCanWorship(type, 1)) {
                    state.rank.worshipped++;
                    sendLog(`✅ [Nhận Cuối Ngày - BXH] Máy chủ xác nhận đã Hành Lễ qua biểu tượng BXH loại ${type}.`, "action");
                    state.rank.rankIndex++;
                    state.rank.pending = null;
                } else if (Date.now() - state.rank.pending.startedAt >= CUOI_NGAY_REQUEST_TIMEOUT_MS) {
                    logCuoiNgayError(state, `rank-claim-timeout-${type}`, `Máy chủ chưa xác nhận Hành Lễ qua biểu tượng BXH loại ${type}; không gửi lại.`);
                    state.rank.rankIndex++;
                    state.rank.pending = null;
                    return true;
                } else {
                    return true;
                }
            }

            if (state.rank.rankIndex > state.rank.types.length) {
                if (state.rank.skipped > 0 && state.rank.worshipped === 0) {
                    sendLog(`ℹ️ [Nhận Cuối Ngày - BXH] Không còn lượt Hành Lễ khả dụng; đã bỏ qua ${state.rank.skipped} biểu tượng.`, "info");
                } else if (state.rank.skipped > 0) {
                    sendLog(`ℹ️ [Nhận Cuối Ngày - BXH] Đã bỏ qua ${state.rank.skipped} biểu tượng không còn lượt Hành Lễ khả dụng.`, "info");
                }
                state.phase = 'tasks';
                return true;
            }

            const type = state.rank.types[state.rank.rankIndex - 1];
            if (!state.rank.model.getCanWorship(type, 1)) {
                state.rank.rankIndex++;
                state.rank.skipped++;
                return true;
            }

            const itemList = state.rank.view.itemList;
            let rankItem = null;
            for (let index = 0; index < itemList.numElements; index++) {
                const item = itemList.getElementAt(index);
                if (item && item.rankType === type) {
                    rankItem = item;
                    break;
                }
            }
            const button = rankItem && rankItem.moBaiBtn;
            if (!rankItem || !rankItem.needMoBai || !button ||
                button.visible === false ||
                typeof button.dispatchEventWith !== 'function') {
                logCuoiNgayError(state, `rank-button-${type}`, `Không tìm thấy biểu tượng Hành Lễ khả dụng trên BXH Sức Mạnh loại ${type}.`);
                state.rank.rankIndex++;
                return true;
            }

            state.rank.pending = { type, startedAt: Date.now() };
            button.dispatchEventWith(ctx.egret.TouchEvent.TOUCH_TAP, true);
            cuoiNgayDidSend = true;
            sendLog(`ℹ️ [Nhận Cuối Ngày - BXH] Đã bấm biểu tượng Hành Lễ loại ${type}; đang chờ máy chủ xác nhận.`, "info");
            return true;
        }

        function handleCuoiNgayTasks(ctx, state) {
            const acvCtrl = state.acvCtrl;
            const taskState = ctx.AcvConst && ctx.AcvConst.ETaskState;
            if (!acvCtrl || !taskState ||
                typeof acvCtrl.openAcvAct !== 'function' ||
                typeof acvCtrl.send30501 !== 'function' ||
                typeof acvCtrl.send12501 !== 'function' ||
                typeof acvCtrl.send30503 !== 'function' ||
                typeof acvCtrl.send30504 !== 'function') {
                logCuoiNgayError(state, 'task-api', 'API Nhiệm Vụ/Rương chưa sẵn sàng; bỏ qua bước nhận thưởng.');
                finishCuoiNgay(state);
                return true;
            }

            if (!state.tasks.opened) {
                state.tasks.taskListBefore = acvCtrl.taskDt;
                state.tasks.requestedAt = Date.now();
                state.tasks.opened = true;
                acvCtrl.openAcvAct(0);
                acvCtrl.send30501();
                acvCtrl.send12501();
                cuoiNgayDidSend = true;
                sendLog("ℹ️ [Nhận Cuối Ngày - Nhiệm Vụ] Đã mở Nhiệm Vụ; đang tải trạng thái nhiệm vụ và rương.", "info");
                return true;
            }

            if (!state.tasks.loaded) {
                if (Array.isArray(acvCtrl.taskDt) &&
                    acvCtrl.taskDt !== state.tasks.taskListBefore &&
                    Array.isArray(acvCtrl.tskStateLs)) {
                    state.tasks.loaded = true;
                } else if (Date.now() - state.tasks.requestedAt >= CUOI_NGAY_REQUEST_TIMEOUT_MS) {
                    logCuoiNgayError(state, 'task-timeout', 'Hết thời gian chờ trạng thái Nhiệm Vụ/Rương; không xác nhận đã nhận.');
                    finishCuoiNgay(state);
                    return true;
                } else {
                    return true;
                }
            }

            if (state.tasks.pending) {
                const pending = state.tasks.pending;
                if (pending.kind === 'task') {
                    const task = acvCtrl.taskDt.find((entry) => entry && entry.task_id === pending.taskId);
                    if (task && Number(task.status) === taskState.gain) {
                        state.tasks.taskClaims++;
                        sendLog(`✅ [Nhận Cuối Ngày - Nhiệm Vụ] Máy chủ xác nhận đã nhận nhiệm vụ #${pending.taskId}.`, "action");
                        state.tasks.pending = null;
                    }
                } else if (acvCtrl.tskStateLs[pending.index] === taskState.gain) {
                    state.tasks.chestClaims++;
                    sendLog(`✅ [Nhận Cuối Ngày - Rương] Máy chủ xác nhận đã nhận rương năng động #${pending.index + 1}.`, "result");
                    state.tasks.pending = null;
                }

                if (state.tasks.pending &&
                    Date.now() - state.tasks.pending.startedAt >= CUOI_NGAY_REQUEST_TIMEOUT_MS) {
                    logCuoiNgayError(state, 'task-claim-timeout', 'Máy chủ chưa xác nhận một yêu cầu nhận thưởng Nhiệm Vụ/Rương; không gửi lại.');
                    state.tasks.pending = null;
                }
                return true;
            }

            const task = acvCtrl.taskDt.find((entry) =>
                entry && Number(entry.status) === taskState.finish
            );
            if (task) {
                state.tasks.pending = {
                    kind: 'task',
                    taskId: task.task_id,
                    startedAt: Date.now()
                };
                acvCtrl.send30503(task.task_id);
                cuoiNgayDidSend = true;
                sendLog(`ℹ️ [Nhận Cuối Ngày - Nhiệm Vụ] Đã yêu cầu nhận nhiệm vụ #${task.task_id}; đang chờ máy chủ xác nhận.`, "info");
                return true;
            }

            const chestIndex = acvCtrl.tskStateLs.findIndex((status) =>
                status === taskState.finish
            );
            if (chestIndex >= 0) {
                state.tasks.pending = {
                    kind: 'chest',
                    index: chestIndex,
                    startedAt: Date.now()
                };
                acvCtrl.send30504(chestIndex);
                cuoiNgayDidSend = true;
                sendLog(`ℹ️ [Nhận Cuối Ngày - Rương] Đã yêu cầu nhận rương năng động #${chestIndex + 1}; đang chờ máy chủ xác nhận.`, "info");
                return true;
            }

            finishCuoiNgay(state);
            return true;
        }

        function handleCuoiNgay(ctx) {
            const emailCtrl = ctx.EmailCtrl && typeof ctx.EmailCtrl.gInst === 'function'
                ? ctx.EmailCtrl.gInst()
                : null;
            const rankCtrl = ctx.RankCtrl && typeof ctx.RankCtrl.gInst === 'function'
                ? ctx.RankCtrl.gInst()
                : null;
            const acvCtrl = ctx.AcvCtrl && typeof ctx.AcvCtrl.gInst === 'function'
                ? ctx.AcvCtrl.gInst()
                : null;
            const dayKey = new Date().toDateString();
            if (!cuoiNgayState || cuoiNgayState.dayKey !== dayKey ||
                cuoiNgayState.emailCtrl !== emailCtrl ||
                cuoiNgayState.rankCtrl !== rankCtrl ||
                cuoiNgayState.acvCtrl !== acvCtrl) {
                cuoiNgayState = createCuoiNgayState(emailCtrl, rankCtrl, acvCtrl);
            }

            const state = cuoiNgayState;
            if (state.phase === 'done') return true;
            if (state.phase === 'mail') return handleCuoiNgayMail(ctx, state);
            if (state.phase === 'rank') return handleCuoiNgayRank(ctx, state);
            return handleCuoiNgayTasks(ctx, state);
        }

        function isTamTienGiftSupported(gift) {
            if (!gift) return false;
            const cashPrice = Number(gift.price);
            const tienNgocCost = Number(gift.gold);
            return Number.isFinite(cashPrice) && cashPrice === 0 &&
                Number.isFinite(tienNgocCost) && tienNgocCost >= 0;
        }

        function removeTamTienDaiListener(state) {
            if (state && state.model && state.eventHandler &&
                typeof state.model.removeEventListener === 'function') {
                state.model.removeEventListener(state.updateEvent, state.eventHandler);
            }
        }

        function createTamTienDaiState(welfareController, model, updateEvent) {
            const state = {
                dayKey: new Date().toDateString(),
                welfareController,
                model,
                updateEvent,
                phase: 'gifts',
                giftCategoryIndex: 0,
                giftRows: null,
                giftRowIndex: 0,
                waitingGiftList: null,
                pendingGiftClaim: null,
                recruitInfoRequestedAt: 0,
                recruitIndex: 0,
                pendingRecruit: null,
                recruitBusySince: 0,
                eventHandler: null
            };

            state.eventHandler = (event) => {
                const eventData = event && typeof event.getDataArray === 'function'
                    ? event.getDataArray()
                    : [];

                if (state.waitingGiftList && eventData[0] === state.waitingGiftList.type) {
                    state.waitingGiftList.ready = true;
                }

                if (state.pendingGiftClaim) {
                    const purchase = state.welfareController.getLimitGiftBuyNetVo(
                        state.pendingGiftClaim.gift.gift_id
                    );
                    const buyTimes = purchase ? Number(purchase.buy_times) || 0 : 0;
                    if (buyTimes > state.pendingGiftClaim.previousBuyTimes) {
                        state.pendingGiftClaim.confirmed = true;
                    }
                }
            };

            model.addEventListener(updateEvent, state.eventHandler);
            return state;
        }

        function handleTamTienDai(ctx) {
            const welfareController = ctx.WelfareCtrl && ctx.WelfareCtrl.gInst
                ? ctx.WelfareCtrl.gInst()
                : null;
            if (!welfareController || typeof welfareController.getCurlModel !== 'function') {
                sendLog("⚠️ [Tâm Tiên Đài] Không tìm thấy bộ điều khiển quà miễn phí.", "err");
                return true;
            }

            const model = welfareController.getCurlModel();
            const welfareConst = ctx.WelfareConst;
            const updateEvent = welfareConst && welfareConst.EVT_LIMIT_GIFT_UPDATE;
            if (!model || !updateEvent || !welfareConst.LimitGiftType ||
                typeof model.addEventListener !== 'function' ||
                typeof welfareController.send30120 !== 'function' ||
                typeof welfareController.send30121 !== 'function' ||
                typeof welfareController.getLimitGiftBuyNetVo !== 'function') {
                sendLog("⚠️ [Tâm Tiên Đài] API nhận quà miễn phí chưa sẵn sàng.", "err");
                return true;
            }

            const dayKey = new Date().toDateString();
            if (!tamTienDaiState || tamTienDaiState.model !== model ||
                tamTienDaiState.dayKey !== dayKey) {
                removeTamTienDaiListener(tamTienDaiState);
                try {
                    tamTienDaiState = createTamTienDaiState(
                        welfareController,
                        model,
                        updateEvent
                    );
                } catch (error) {
                    sendLog(`⚠️ [Tâm Tiên Đài] Không thể theo dõi trạng thái quà: ${error.message || error}`, "err");
                    return true;
                }
            }

            const state = tamTienDaiState;
            const now = Date.now();

            if (state.phase === 'gifts') {
                if (state.pendingGiftClaim) {
                    const pending = state.pendingGiftClaim;
                    const category = TAM_TIEN_GIFT_CATEGORIES[state.giftCategoryIndex];
                    if (pending.confirmed) {
                        if (Number(pending.gift.gold) > 0) {
                            sendLog(`✅ [Tâm Tiên Đài - ${category.label}] Đã mua quà #${pending.gift.gift_id} bằng ${Number(pending.gift.gold)} Tiên Ngọc.`, "result");
                        } else {
                            sendLog(`✅ [Tâm Tiên Đài - ${category.label}] Đã nhận quà miễn phí #${pending.gift.gift_id}.`, "result");
                        }
                        state.pendingGiftClaim = null;
                        state.giftRowIndex++;
                    } else if (now - pending.startedAt >= TAM_TIEN_REQUEST_TIMEOUT_MS) {
                        const action = Number(pending.gift.gold) > 0 ? 'mua quà Tiên Ngọc' : 'nhận quà miễn phí';
                        sendLog(`⚠️ [Tâm Tiên Đài - ${category.label}] Chưa xác nhận được việc ${action} #${pending.gift.gift_id} từ máy chủ.`, "err");
                        state.pendingGiftClaim = null;
                        state.giftRowIndex++;
                    }
                    return true;
                }

                if (state.waitingGiftList) {
                    const waiting = state.waitingGiftList;
                    if (!waiting.ready && now - waiting.startedAt < TAM_TIEN_REQUEST_TIMEOUT_MS) {
                        return true;
                    }
                    state.waitingGiftList = null;
                    if (!waiting.ready) {
                        const category = TAM_TIEN_GIFT_CATEGORIES[state.giftCategoryIndex];
                        sendLog(`⚠️ [Tâm Tiên Đài - ${category.label}] Không nhận được trạng thái quà từ máy chủ.`, "err");
                        state.giftCategoryIndex++;
                        return true;
                    }

                    const category = TAM_TIEN_GIFT_CATEGORIES[state.giftCategoryIndex];
                    const giftType = welfareConst.LimitGiftType[category.typeKey];
                    const giftList = model.getLimitGiftByType(giftType) || [];
                    state.giftRows = giftList.filter((gift) =>
                        isTamTienGiftSupported(gift) && Number(gift.purchase_times) > 0
                    );
                    state.giftRowIndex = 0;

                    if (state.giftRows.length === 0) {
                        sendLog(`ℹ️ [Tâm Tiên Đài - ${category.label}] Không có quà miễn phí để nhận.`, "info");
                        state.giftCategoryIndex++;
                        state.giftRows = null;
                    }
                    return true;
                }

                if (state.giftCategoryIndex >= TAM_TIEN_GIFT_CATEGORIES.length) {
                    state.phase = 'recruit';
                    return true;
                }

                const category = TAM_TIEN_GIFT_CATEGORIES[state.giftCategoryIndex];
                if (!state.giftRows) {
                    const giftType = welfareConst.LimitGiftType[category.typeKey];
                    if (!Number.isInteger(giftType)) {
                        sendLog(`⚠️ [Tâm Tiên Đài - ${category.label}] Không xác định được loại quà.`, "err");
                        state.giftCategoryIndex++;
                        return true;
                    }

                    state.waitingGiftList = { type: giftType, startedAt: now, ready: false };
                    try {
                        welfareController.send30120(giftType);
                        tamTienDidSend = true;
                    } catch (error) {
                        state.waitingGiftList = null;
                        sendLog(`⚠️ [Tâm Tiên Đài - ${category.label}] Không thể kiểm tra quà: ${error.message || error}`, "err");
                        state.giftCategoryIndex++;
                    }
                    return true;
                }

                if (state.giftRowIndex >= state.giftRows.length) {
                    state.giftCategoryIndex++;
                    state.giftRows = null;
                    state.giftRowIndex = 0;
                    return true;
                }

                const gift = state.giftRows[state.giftRowIndex];
                const tienNgocCost = Number(gift.gold);
                const purchase = welfareController.getLimitGiftBuyNetVo(gift.gift_id);
                const buyTimes = purchase ? Number(purchase.buy_times) || 0 : 0;
                const purchaseLimit = Number(gift.purchase_times) || 0;
                if (buyTimes >= purchaseLimit) {
                    const giftDescription = tienNgocCost > 0
                        ? `Quà Tiên Ngọc #${gift.gift_id}`
                        : `Quà miễn phí #${gift.gift_id}`;
                    sendLog(`ℹ️ [Tâm Tiên Đài - ${category.label}] ${giftDescription} đã mua đủ hôm nay.`, "info");
                    state.giftRowIndex++;
                    return true;
                }

                state.pendingGiftClaim = {
                    gift,
                    previousBuyTimes: buyTimes,
                    startedAt: now,
                    confirmed: false
                };
                try {
                    welfareController.send30121(gift.gift_id);
                    tamTienDidSend = true;
                } catch (error) {
                    state.pendingGiftClaim = null;
                    const action = tienNgocCost > 0 ? 'mua quà Tiên Ngọc' : 'nhận quà miễn phí';
                    sendLog(`⚠️ [Tâm Tiên Đài - ${category.label}] Không thể ${action} #${gift.gift_id}: ${error.message || error}`, "err");
                    state.giftRowIndex++;
                }
                return true;
            }

            if (state.phase === 'recruit') {
                const recruitController = ctx.RecruitCtrl && ctx.RecruitCtrl.gInst
                    ? ctx.RecruitCtrl.gInst()
                    : null;
                const recruitConst = ctx.RecruitConst;
                if (!recruitController || !recruitConst || typeof recruitController.freeRecruit !== 'function') {
                    sendLog("⚠️ [Tâm Tiên Đài - Chiêu Mộ] Không tìm thấy bộ điều khiển chiêu mộ miễn phí.", "err");
                    state.phase = 'done';
                    return true;
                }

                if (!recruitController.m_recruitBaseInfo) {
                    if (!state.recruitInfoRequestedAt) {
                        state.recruitInfoRequestedAt = now;
                        try {
                            recruitController.reqRecruitInfo();
                            tamTienDidSend = true;
                        } catch (error) {
                            sendLog(`⚠️ [Tâm Tiên Đài - Chiêu Mộ] Không thể kiểm tra lượt miễn phí: ${error.message || error}`, "err");
                            state.phase = 'done';
                        }
                    } else if (now - state.recruitInfoRequestedAt >= TAM_TIEN_REQUEST_TIMEOUT_MS) {
                        sendLog("⚠️ [Tâm Tiên Đài - Chiêu Mộ] Không nhận được trạng thái lượt miễn phí từ máy chủ.", "err");
                        state.phase = 'done';
                    }
                    return true;
                }

                const recruitTypes = [
                    { type: recruitConst.ERecruitType.war, key: 'free_war', label: 'Chiêu Mộ Thường' },
                    { type: recruitConst.ERecruitType.famous, key: 'free_famous', label: 'Chiêu Mộ Cao' }
                ];

                if (state.pendingRecruit) {
                    const pending = state.pendingRecruit;
                    const remaining = Number(recruitController.m_recruitBaseInfo[pending.key]) || 0;
                    if (remaining < pending.previousCount) {
                        sendLog(`✅ [Tâm Tiên Đài - Chiêu Mộ] Đã nhận lượt miễn phí: ${pending.label}.`, "result");
                        state.pendingRecruit = null;
                        state.recruitIndex++;
                    } else if (!recruitController.m_isRecruiting &&
                        now - pending.startedAt >= TAM_TIEN_REQUEST_TIMEOUT_MS) {
                        sendLog(`⚠️ [Tâm Tiên Đài - Chiêu Mộ] Máy chủ chưa xác nhận lượt miễn phí: ${pending.label}.`, "err");
                        state.pendingRecruit = null;
                        state.recruitIndex++;
                    }
                    return true;
                }

                if (recruitController.m_isRecruiting) {
                    if (!state.recruitBusySince) state.recruitBusySince = now;
                    if (now - state.recruitBusySince >= TAM_TIEN_REQUEST_TIMEOUT_MS) {
                        sendLog("⚠️ [Tâm Tiên Đài - Chiêu Mộ] Đang chờ một lượt chiêu mộ khác hoàn tất.", "err");
                        state.phase = 'done';
                    }
                    return true;
                }
                state.recruitBusySince = 0;

                if (state.recruitIndex >= recruitTypes.length) {
                    state.phase = 'done';
                    sendLog("✨ [Tâm Tiên Đài] Đã kiểm tra xong quà miễn phí, quà Tiên Ngọc theo tùy chọn và Chiêu Mộ.", "action");
                    return true;
                }

                const recruitType = recruitTypes[state.recruitIndex];
                const available = Number(recruitController.m_recruitBaseInfo[recruitType.key]) || 0;
                if (available <= 0) {
                    sendLog(`ℹ️ [Tâm Tiên Đài - Chiêu Mộ] ${recruitType.label}: hiện không có lượt miễn phí (đã dùng hoặc đang hồi).`, "info");
                    state.recruitIndex++;
                    return true;
                }

                state.pendingRecruit = {
                    type: recruitType.type,
                    key: recruitType.key,
                    label: recruitType.label,
                    previousCount: available,
                    startedAt: now
                };
                try {
                    recruitController.freeRecruit(recruitType.type);
                    tamTienDidSend = true;
                } catch (error) {
                    state.pendingRecruit = null;
                    sendLog(`⚠️ [Tâm Tiên Đài - Chiêu Mộ] Không thể nhận lượt miễn phí ${recruitType.label}: ${error.message || error}`, "err");
                    state.recruitIndex++;
                }
                return true;
            }

            return true;
        }

        function handleTienHuu(ctx) {
            const friendCtrl = ctx.FriendCtrl && ctx.FriendCtrl.gInst
                ? ctx.FriendCtrl.gInst()
                : null;
            const dayKey = new Date().toDateString();
            if (!tienHuuState || tienHuuState.friendCtrl !== friendCtrl ||
                tienHuuState.dayKey !== dayKey) {
                tienHuuState = {
                    friendCtrl,
                    dayKey,
                    phase: 'ready',
                    startedAt: 0,
                    giveCount: 0,
                    acceptCount: 0,
                    pendingGifts: [],
                    pendingAccepts: []
                };
            }

            const state = tienHuuState;
            const now = Date.now();
            if (state.phase === 'done' || state.phase === 'error') return true;

            if (!friendCtrl) {
                sendLog("⚠️ [Tiên Hữu] Không tìm thấy bộ điều khiển bạn bè.", "err");
                state.phase = 'error';
                return true;
            }

            if (!friendCtrl.m_friend_data) {
                if (state.phase === 'loading') {
                    if (now - state.startedAt >= TIEN_HUU_REQUEST_TIMEOUT_MS) {
                        sendLog("⚠️ [Tiên Hữu] Hết thời gian chờ danh sách bạn bè từ máy chủ.", "err");
                        state.phase = 'error';
                    }
                    return true;
                }
                if (typeof friendCtrl.send11801Msg !== 'function') {
                    sendLog("⚠️ [Tiên Hữu] API tải danh sách bạn bè chưa sẵn sàng.", "err");
                    state.phase = 'error';
                    return true;
                }
                try {
                    friendCtrl.send11801Msg();
                    state.phase = 'loading';
                    state.startedAt = now;
                    sendLog("ℹ️ [Tiên Hữu] Đang tải danh sách bạn bè để kiểm tra Tặng nhanh.", "info");
                } catch (error) {
                    sendLog(`⚠️ [Tiên Hữu] Không thể tải danh sách bạn bè: ${error.message || error}`, "err");
                    state.phase = 'error';
                }
                return true;
            }

            if (state.phase === 'loading') state.phase = 'ready';

            if (state.phase === 'sending') {
                const sentCount = state.pendingGifts.filter((friend) =>
                    Number(friend.energy_give_status) === 1
                ).length;
                const acceptedCount = state.pendingAccepts.filter((friend) =>
                    Number(friend.energy_accept_status) === 1
                ).length;
                const giveCount = Number(friendCtrl.m_energy_give_count);
                const acceptCount = Number(friendCtrl.m_energy_accept_count);
                const confirmedGifts = Math.max(
                    sentCount,
                    Number.isFinite(giveCount) ? giveCount - state.giveCount : 0
                );
                const confirmedAccepts = Math.max(
                    acceptedCount,
                    Number.isFinite(acceptCount) ? acceptCount - state.acceptCount : 0
                );

                if (confirmedGifts > 0 || confirmedAccepts > 0) {
                    const results = [];
                    if (confirmedGifts > 0) results.push(`đã tặng ${confirmedGifts} bạn bè`);
                    if (confirmedAccepts > 0) results.push(`đã nhận thể lực từ ${confirmedAccepts} bạn bè`);
                    sendLog(`✅ [Tiên Hữu] Máy chủ xác nhận Tặng nhanh: ${results.join(', ')}.`, "result");
                    state.phase = 'done';
                } else if (now - state.startedAt >= TIEN_HUU_REQUEST_TIMEOUT_MS) {
                    sendLog("⚠️ [Tiên Hữu] Máy chủ chưa xác nhận thao tác Tặng nhanh.", "err");
                    state.phase = 'error';
                }
                return true;
            }

            if (typeof friendCtrl.getFriendListByType !== 'function' ||
                typeof friendCtrl.getAndSendLove !== 'function' ||
                !ctx.FriendConst || !ctx.FriendConst.friendRelationType) {
                sendLog("⚠️ [Tiên Hữu] API Tặng nhanh chưa sẵn sàng.", "err");
                state.phase = 'error';
                return true;
            }

            let friends;
            try {
                friends = friendCtrl.getFriendListByType(ctx.FriendConst.friendRelationType.friend);
            } catch (error) {
                sendLog(`⚠️ [Tiên Hữu] Không thể đọc danh sách bạn bè: ${error.message || error}`, "err");
                state.phase = 'error';
                return true;
            }
            if (!Array.isArray(friends)) {
                sendLog("⚠️ [Tiên Hữu] Danh sách bạn bè không hợp lệ.", "err");
                state.phase = 'error';
                return true;
            }

            const pendingGifts = friends.filter((friend) =>
                friend && Number(friend.energy_give_status) === 0
            );
            const maxDailyAccepts = Number(ctx.FriendConst.GET_VIGOR_MAX_NUM);
            const acceptCount = Number(friendCtrl.m_energy_accept_count);
            const pendingAccepts = Number.isFinite(maxDailyAccepts) &&
                Number.isFinite(acceptCount) && acceptCount < maxDailyAccepts
                ? friends.filter((friend) => friend && Number(friend.energy_accept_status) === 2)
                : [];

            if (pendingGifts.length === 0 && pendingAccepts.length === 0) {
                sendLog("ℹ️ [Tiên Hữu] Đã Tặng nhanh hoặc không có bạn bè cần gửi/nhận thể lực.", "info");
                state.phase = 'done';
                return true;
            }

            state.phase = 'sending';
            state.startedAt = now;
            state.giveCount = Number(friendCtrl.m_energy_give_count) || 0;
            state.acceptCount = acceptCount || 0;
            state.pendingGifts = pendingGifts;
            state.pendingAccepts = pendingAccepts;
            try {
                friendCtrl.getAndSendLove();
            } catch (error) {
                sendLog(`⚠️ [Tiên Hữu] Không thể thực hiện Tặng nhanh: ${error.message || error}`, "err");
                state.phase = 'error';
            }
            return true;
        }

        function createTienMinhState(guildCtrl, warCtrl) {
            return {
                dayKey: new Date().toDateString(),
                guildCtrl,
                warCtrl,
                phase: 'bargain',
                failed: false,
                finalized: false,
                confirmedActions: 0,
                skippedSteps: 0,
                logged: new Set(),
                bargain: { opened: false, step: 'open', pending: null },
                fightingSince: 0,
                dungeon: {
                    stage: 'open',
                    refreshing: null,
                    fightsDone: 0,
                    attempts: 0,
                    pending: null
                },
                war: {
                    statusRequested: false,
                    statusLoaded: false,
                    statusStartedAt: 0,
                    statusEventHandler: null,
                    requested: false,
                    requestStartedAt: 0,
                    pending: null,
                    fightsDone: 0,
                    city: null,
                    targetType: null
                },
                asked: { checked: false, loading: null, count: 0, pending: null },
                askedClaim: { loaded: false, loading: null, pending: null, sends: 0 },
                help: {
                    opened: false,
                    pending: null,
                    boxFailed: false,
                    boxesLogged: false,
                    attempted: new Set(),
                    assisted: 0,
                    assistRejected: 0
                },
                fete: { opened: false, pending: null, closeAttempted: false, claiming: false, claimPending: null }
            };
        }

        function logTienMinh(state, key, message, type) {
            if (state.logged.has(key)) return;
            state.logged.add(key);
            sendLog(message, type);
        }

        function failTienMinhStep(state, key, message, nextPhase) {
            state.failed = true;
            logTienMinh(state, key, `⚠️ [Tiên Minh] ${message}`, "err");
            state.phase = nextPhase;
        }

        function skipTienMinhStep(state, key, message, nextPhase) {
            state.skippedSteps++;
            logTienMinh(state, key, `ℹ️ [Tiên Minh] ${message}`, "info");
            state.phase = nextPhase;
        }

        function getTienMinhBargainInfo(guildCtrl) {
            if (typeof guildCtrl.getBargainInfo === 'function') {
                return guildCtrl.getBargainInfo();
            }
            return guildCtrl._bargainInfo;
        }

        function getTienMinhBargainSignature(info) {
            if (!info) return '';
            const items = Array.isArray(info._itemList)
                ? info._itemList.map((item) => item && [
                    item.id,
                    item.item_id,
                    item.price,
                    item.status,
                    item.buy_status,
                    item.bargain_status
                ])
                : [];
            return JSON.stringify([
                info._start_time,
                info._selfStatus,
                info._totalBargain,
                info.curPrice,
                items
            ]);
        }

        function getTienMinhNegativeBargainPrice(info) {
            if (!info) return null;
            const price = Number(info.curPrice);
            return Number.isFinite(price) ? price : null;
        }

        function handleTienMinhBargain(state, now) {
            const gc = state.guildCtrl;
            const bargain = state.bargain;
            if (bargain.pending) {
                const pending = bargain.pending;
                const info = getTienMinhBargainInfo(gc);
                const signature = getTienMinhBargainSignature(info);
                if (signature !== pending.signature) {
                    bargain.pending = null;
                    if (pending.kind === 'load') {
                        bargain.step = 'check';
                    } else if (pending.kind === 'offer') {
                        state.confirmedActions++;
                        logTienMinh(state, 'bargain-offer-confirmed', "✅ [Tiên Minh - Shop Tiên Giới] Máy chủ xác nhận đã Trả Giá.", "result");
                        bargain.step = 'check-buy';
                    } else {
                        state.confirmedActions++;
                        logTienMinh(state, 'bargain-buy-confirmed', "✅ [Tiên Minh - Shop Tiên Giới] Máy chủ xác nhận đã Mua vật phẩm sau khi Trả Giá.", "result");
                        state.phase = 'dungeon';
                    }
                } else if (pending.kind === 'load' && now - pending.startedAt >= 1500) {
                    bargain.pending = null;
                    bargain.step = 'check';
                } else if (now - pending.startedAt >= TIEN_MINH_REQUEST_TIMEOUT_MS) {
                    failTienMinhStep(
                        state,
                        `bargain-${pending.kind}-timeout`,
                        `Shop Tiên Giới chưa xác nhận ${pending.kind === 'offer' ? 'Trả Giá' : pending.kind === 'buy' ? 'Mua' : 'trạng thái khuyến mãi'}; không gửi lại để tránh thao tác trùng.`,
                        pending.kind === 'load' ? 'dungeon' : 'dungeon'
                    );
                }
                return true;
            }

            if (bargain.step === 'open') {
                if (typeof gc.send18070 !== 'function') {
                    failTienMinhStep(state, 'bargain-api', 'API mở Shop Tiên Giới/kiểm tra Trả Giá chưa sẵn sàng.', 'dungeon');
                    return true;
                }
                try {
                    // Chỉ tải dữ liệu Trả Giá; openGuildTreasureUi() sẽ mở nhầm tab Rèn.
                    gc.send18070();
                    bargain.pending = {
                        kind: 'load',
                        signature: getTienMinhBargainSignature(getTienMinhBargainInfo(gc)),
                        startedAt: now
                    };
                    bargain.opened = true;
                    logTienMinh(state, 'bargain-loading', "ℹ️ [Tiên Minh - Shop Tiên Giới] Đang tải trạng thái Trả Giá.", "info");
                } catch (error) {
                    failTienMinhStep(state, 'bargain-open-error', `Không thể mở Shop Tiên Giới: ${error.message || error}`, 'dungeon');
                }
                return true;
            }

            if (bargain.step === 'check') {
                const info = getTienMinhBargainInfo(gc);
                if (!info) {
                    failTienMinhStep(state, 'bargain-state', 'Không đọc được dữ liệu Trả Giá từ máy chủ.', 'dungeon');
                    return true;
                }
                const startTime = Number(info._start_time);
                if (!Array.isArray(info._itemList) || !Number.isFinite(startTime) ||
                    startTime <= 0 || info._itemList.length === 0) {
                    skipTienMinhStep(state, 'bargain-unavailable', 'Shop Tiên Giới không có mục Trả Giá đang mở; bỏ qua.', 'dungeon');
                    return true;
                }
                if (typeof gc.showGuildBargainView === 'function') {
                    gc.showGuildBargainView();
                }
                if (info._selfStatus === undefined || info._selfStatus === null) {
                    failTienMinhStep(state, 'bargain-status', 'Không đọc được trạng thái Trả Giá; bỏ qua để tránh gửi thao tác không xác định.', 'dungeon');
                    return true;
                }
                const selfStatus = Number(info._selfStatus);
                if (!Number.isFinite(selfStatus)) {
                    failTienMinhStep(state, 'bargain-status', 'Không đọc được trạng thái Trả Giá; bỏ qua để tránh gửi thao tác không xác định.', 'dungeon');
                    return true;
                }
                if (selfStatus === 0) {
                    if (typeof gc.send18071 !== 'function') {
                        failTienMinhStep(state, 'bargain-offer-api', 'API Trả Giá chưa sẵn sàng.', 'dungeon');
                        return true;
                    }
                    bargain.pending = {
                        kind: 'offer',
                        signature: getTienMinhBargainSignature(info),
                        startedAt: now
                    };
                    try {
                        gc.send18071();
                    } catch (error) {
                        bargain.pending = null;
                        failTienMinhStep(state, 'bargain-offer-error', `Không thể Trả Giá: ${error.message || error}`, 'dungeon');
                    }
                    return true;
                }
                bargain.step = 'check-buy';
                return true;
            }

            if (bargain.step === 'check-buy') {
                const info = getTienMinhBargainInfo(gc);
                if (!info) {
                    failTienMinhStep(state, 'bargain-buy-state', 'Không đọc được trạng thái giá sau khi Trả Giá.', 'dungeon');
                    return true;
                }
                const price = getTienMinhNegativeBargainPrice(info);
                if (price === null || price >= 0) {
                    skipTienMinhStep(state, 'bargain-no-buy', 'Giá sau khi Trả Giá không dưới 0; không thực hiện Mua.', 'dungeon');
                    return true;
                }
                if (Number(info._selfStatus) === 1) {
                    skipTienMinhStep(state, 'bargain-already-bought', 'Vật phẩm Trả Giá đã được mua trước đó; không mua lại.', 'dungeon');
                    return true;
                }
                if (typeof gc.send18072 !== 'function') {
                    failTienMinhStep(state, 'bargain-buy-api', 'API Mua vật phẩm Trả Giá chưa sẵn sàng.', 'dungeon');
                    return true;
                }
                bargain.pending = {
                    kind: 'buy',
                    signature: getTienMinhBargainSignature(info),
                    startedAt: now
                };
                try {
                    gc.send18072();
                } catch (error) {
                    bargain.pending = null;
                    failTienMinhStep(state, 'bargain-buy-error', `Không thể Mua vật phẩm Trả Giá: ${error.message || error}`, 'dungeon');
                }
                return true;
            }

            state.phase = 'dungeon';
            return true;
        }

        function getTienMinhDungeonView(ctx) {
            const manager = ctx.ViewMgr && ctx.ViewMgr.gViewMgr;
            const cache = manager && manager.m_viewCacheGroup;
            const hall = cache && cache.guildWanFaHallUi;
            return hall && hall.viewDict && hall.viewDict['1'];
        }

        function getTienMinhDungeonLimit() {
            const limit = Number(CONFIG.tienMinhDungeonLimit);
            return Number.isInteger(limit) && limit >= 1 ? Math.min(limit, 6) : 3;
        }

        function getTienMinhDungeonCurId(ctx, gc) {
            const modelId = Number(gc.m_curModel && gc.m_curModel.guildDungeonCurId);
            if (Number.isFinite(modelId) && modelId > 0) return modelId;
            const view = getTienMinhDungeonView(ctx);
            return Number(view && view.guildDungeonCurId);
        }

        function handleTienMinhDungeon(ctx, state, now) {
            const gc = state.guildCtrl;
            const dungeon = state.dungeon;
            const model = gc.m_curModel;
            const data = model && model.scmd18052Data;
            const limit = getTienMinhDungeonLimit();

            if (!model || typeof gc.send18052Msg !== 'function' ||
                typeof gc.send18050Msg !== 'function' ||
                typeof gc.openGuildDungeonUi !== 'function') {
                failTienMinhStep(state, 'dungeon-open-api', 'API Bí Cảnh Tông Môn chưa sẵn sàng.', 'war');
                return true;
            }

            if (dungeon.pending) {
                const pending = dungeon.pending;
                const fightCount = Number(data && data.fight_count);
                const buyCount = Number(data && data.buy_count);
                if (pending.kind === 'buy') {
                    if (Number.isFinite(buyCount) && buyCount > pending.beforeBuyCount) {
                        dungeon.pending = null;
                        state.confirmedActions++;
                        logTienMinh(state, `dungeon-buy-${buyCount}`, `✅ [Tiên Minh - Bí Cảnh Tông Môn] Máy chủ xác nhận đã mua thêm 1 lượt với giá 20 Tiên Ngọc (${buyCount} lượt đã mua).`, "result");
                        dungeon.stage = 'decide';
                    } else if (now - pending.startedAt >= TIEN_MINH_REQUEST_TIMEOUT_MS) {
                        dungeon.pending = null;
                        failTienMinhStep(state, 'dungeon-buy-timeout', 'Máy chủ chưa xác nhận mua thêm lượt Bí Cảnh Tông Môn; không gửi lại để tránh mua trùng.', 'war');
                    }
                    return true;
                }
                if (Number.isFinite(fightCount) && fightCount > pending.beforeFightCount) {
                    dungeon.pending = null;
                    dungeon.fightsDone++;
                    state.confirmedActions++;
                    logTienMinh(state, `dungeon-fight-${fightCount}`, `✅ [Tiên Minh - Bí Cảnh Tông Môn] Máy chủ xác nhận trận ${fightCount}/${limit}.`, "action");
                    dungeon.stage = 'decide';
                } else if (now - pending.startedAt >= TIEN_MINH_DUNGEON_FIGHT_TIMEOUT_MS) {
                    dungeon.pending = null;
                    failTienMinhStep(state, 'dungeon-fight-timeout', 'Máy chủ chưa xác nhận trận Bí Cảnh Tông Môn; không gửi lại để tránh lặp trận.', 'war');
                } else if (now - pending.startedAt >= TIEN_MINH_POLL_FIRST_MS && now - pending.lastRefreshAt >= TIEN_MINH_POLL_EVERY_MS) {
                    // Số trận chỉ cập nhật khi tải lại dữ liệu sau khi trận kết thúc.
                    pending.lastRefreshAt = now;
                    try {
                        gc.send18052Msg();
                    } catch (error) {
                        // Lần kiểm tra kế tiếp sẽ thử lại cho tới khi hết thời gian chờ.
                    }
                }
                return true;
            }

            if (dungeon.stage === 'open') {
                try {
                    gc.openGuildDungeonUi();
                } catch (error) {
                    failTienMinhStep(state, 'dungeon-open-error', `Không thể mở Bí Cảnh Tông Môn: ${error.message || error}`, 'war');
                    return true;
                }
                dungeon.stage = 'refresh';
                return true;
            }

            if (dungeon.stage === 'refresh') {
                if (!dungeon.refreshing) {
                    dungeon.refreshing = { dataRef: data, startedAt: now };
                    try {
                        gc.send18050Msg();
                        gc.send18052Msg();
                    } catch (error) {
                        dungeon.refreshing = null;
                        failTienMinhStep(state, 'dungeon-refresh-error', `Không thể tải trạng thái Bí Cảnh Tông Môn: ${error.message || error}`, 'war');
                    }
                    return true;
                }
                if (data && data !== dungeon.refreshing.dataRef) {
                    dungeon.refreshing = null;
                    dungeon.stage = 'decide';
                } else if (now - dungeon.refreshing.startedAt >= TIEN_MINH_REQUEST_TIMEOUT_MS) {
                    dungeon.refreshing = null;
                    failTienMinhStep(state, 'dungeon-state-timeout', 'Không tải được trạng thái lượt Bí Cảnh Tông Môn từ máy chủ.', 'war');
                }
                return true;
            }

            // stage === 'decide'
            const fightCount = Number(data && data.fight_count);
            const maxCount = Number(data && data.max_count);
            const buyCount = Number(data && data.buy_count);
            if (!data || !Number.isFinite(fightCount) || !Number.isFinite(maxCount) ||
                !Number.isFinite(buyCount)) {
                failTienMinhStep(state, 'dungeon-state', 'Không đọc được số lượt Bí Cảnh Tông Môn.', 'war');
                return true;
            }

            if (fightCount >= limit) {
                if (dungeon.fightsDone > 0) {
                    logTienMinh(state, 'dungeon-limit-reached', `✅ [Tiên Minh - Bí Cảnh Tông Môn] Đã hoàn thành ${fightCount}/${limit} trận trong ngày.`, "action");
                    state.phase = 'war';
                } else {
                    skipTienMinhStep(state, 'dungeon-limit-already', `Bí Cảnh Tông Môn đã đánh ${fightCount}/${limit} trận; không đánh thêm.`, 'war');
                }
                return true;
            }
            if (dungeon.attempts >= 8) {
                failTienMinhStep(state, 'dungeon-attempts', 'Bí Cảnh Tông Môn vượt quá số lần thử trong một lượt chạy; dừng để tránh lặp.', 'war');
                return true;
            }

            if (maxCount - fightCount <= 0) {
                // Hết lượt miễn phí/đã mua: chỉ mua thêm khi giá đúng 20 Tiên Ngọc.
                if (buyCount >= TIEN_MINH_DUNGEON_MAX_BUYS ||
                    typeof model.getDungeonBuyLoss !== 'function' ||
                    typeof gc.send18057Msg !== 'function') {
                    skipTienMinhStep(state, 'dungeon-no-more-turns', `Bí Cảnh Tông Môn hết lượt (${fightCount}/${limit}); không thể mua thêm.`, 'war');
                    return true;
                }
                let cost;
                try {
                    cost = Number(model.getDungeonBuyLoss(buyCount));
                } catch (error) {
                    failTienMinhStep(state, 'dungeon-buy-cost-error', `Không thể kiểm tra giá mua lượt Bí Cảnh: ${error.message || error}`, 'war');
                    return true;
                }
                if (cost !== 20) {
                    skipTienMinhStep(state, 'dungeon-buy-cost', `Giá mua lượt Bí Cảnh hiện là ${Number.isFinite(cost) ? cost : 'không xác định'} Tiên Ngọc, không phải 20; không mua.`, 'war');
                    return true;
                }
                dungeon.attempts++;
                dungeon.pending = { kind: 'buy', beforeBuyCount: buyCount, startedAt: now };
                try {
                    gc.send18057Msg(1);
                } catch (error) {
                    dungeon.pending = null;
                    failTienMinhStep(state, 'dungeon-buy-error', `Không thể mua lượt Bí Cảnh: ${error.message || error}`, 'war');
                }
                return true;
            }

            const dungeonId = getTienMinhDungeonCurId(ctx, gc);
            if (!Number.isFinite(dungeonId) || dungeonId <= 0 ||
                typeof gc.saveGuildDungeonFightData !== 'function' ||
                typeof gc.send18053Msg !== 'function') {
                failTienMinhStep(state, 'dungeon-fight-api', 'Không tìm thấy API hoặc ải Bí Cảnh Tông Môn hợp lệ để Khiêu Chiến.', 'war');
                return true;
            }
            dungeon.attempts++;
            dungeon.pending = {
                kind: 'fight',
                beforeFightCount: fightCount,
                startedAt: now,
                lastRefreshAt: 0
            };
            try {
                gc.saveGuildDungeonFightData(dungeonId);
                gc.send18053Msg(dungeonId);
            } catch (error) {
                dungeon.pending = null;
                failTienMinhStep(state, 'dungeon-fight-error', `Không thể Khiêu Chiến Bí Cảnh Tông Môn: ${error.message || error}`, 'war');
            }
            return true;
        }

        function removeTienMinhWarStatusListener(state) {
            const war = state && state.war;
            const model = state && state.warCtrl && state.warCtrl.m_curModel;
            const event = war && war.statusEvent;
            if (war && war.statusEventHandler && model &&
                typeof model.removeEventListener === 'function' && event) {
                model.removeEventListener(event, war.statusEventHandler);
            }
            if (war) {
                war.statusEventHandler = null;
                war.statusEvent = null;
            }
        }

        function isTienMinhNeutralCity(city) {
            const guildId = city && city.gldId;
            const cityId = Number(city && city.cityId);
            return Number.isFinite(cityId) && cityId > 0 &&
                guildId &&
                Number(guildId.m_highInt) === 0 &&
                Number(guildId.m_lowInt) === 0;
        }

        function handleTienMinhWar(state, now, ctx) {
            const wr = state.warCtrl;
            if (!wr) {
                skipTienMinhStep(state, 'war-controller-missing', 'Không có bộ điều khiển Tỉ Thí Tông Môn; bỏ qua.', 'asked');
                return true;
            }

            if (!state.war.statusRequested) {
                const model = wr.m_curModel;
                const updateEvent = ctx.GldWrConst && ctx.GldWrConst.BASE_EVT;
                if (typeof wr.send18125 !== 'function' || !model || !updateEvent ||
                    typeof model.addEventListener !== 'function' ||
                    typeof model.removeEventListener !== 'function') {
                    failTienMinhStep(state, 'war-status-api', 'API tải lượt mới nhất của Tỉ Thí Tông Môn chưa sẵn sàng.', 'asked');
                    return true;
                }
                state.war.statusEvent = updateEvent;
                state.war.statusEventHandler = () => {
                    state.war.statusLoaded = true;
                    removeTienMinhWarStatusListener(state);
                };
                try {
                    model.addEventListener(updateEvent, state.war.statusEventHandler);
                    state.war.statusRequested = true;
                    state.war.statusStartedAt = now;
                    wr.send18125();
                } catch (error) {
                    removeTienMinhWarStatusListener(state);
                    failTienMinhStep(state, 'war-status-error', `Không thể tải lượt Tỉ Thí Tông Môn: ${error.message || error}`, 'asked');
                }
                return true;
            }
            if (!state.war.statusLoaded) {
                if (now - state.war.statusStartedAt >= TIEN_MINH_REQUEST_TIMEOUT_MS) {
                    removeTienMinhWarStatusListener(state);
                    failTienMinhStep(state, 'war-status-timeout', 'Máy chủ chưa trả về số lượt mới nhất của Tỉ Thí Tông Môn.', 'asked');
                }
                return true;
            }

            const base = wr.wrBaseDt;
            if (!base) {
                failTienMinhStep(state, 'war-count-state', 'Không đọc được trạng thái Tỉ Thí Tông Môn.', 'asked');
                return true;
            }
            if (base.isOpen !== true && Number(base.isOpen) !== 1) {
                skipTienMinhStep(state, 'war-closed', 'Tỉ Thí Tông Môn hiện chưa mở; bỏ qua lượt Khiêu Chiến.', 'asked');
                return true;
            }

            const doneCount = Number(base.doneNums);
            const maxCount = Number(base.maxNums);
            if (!Number.isFinite(doneCount) || !Number.isFinite(maxCount)) {
                failTienMinhStep(state, 'war-count-state', 'Không đọc được số lượt còn lại của Tỉ Thí Tông Môn.', 'asked');
                return true;
            }
            if (state.war.pending) {
                const pending = state.war.pending;
                if (Number(base.doneNums) > pending.beforeCount) {
                    state.war.pending = null;
                    state.confirmedActions++;
                    const targetType = state.war.targetType === 'other'
                        ? 'thành của Tông Môn khác'
                        : state.war.targetType === 'neutral'
                            ? 'thành trung lập'
                            : 'thành trì đang chiếm';
                    logTienMinh(state, `war-fight-${Number(base.doneNums)}`, `✅ [Tiên Minh - Tỉ Thí Tông Môn] Máy chủ xác nhận lượt Khiêu Chiến ${Number(base.doneNums)}/${maxCount} tại ${targetType}.`, "action");
                    state.war.fightsDone++;
                    // Chọn lại mục tiêu ngẫu nhiên cho lượt kế tiếp.
                    state.war.city = null;
                    state.war.cityIndex = null;
                    return true;
                } else if (now - pending.startedAt >= TIEN_MINH_REQUEST_TIMEOUT_MS) {
                    state.war.pending = null;
                    failTienMinhStep(state, 'war-fight-timeout', 'Máy chủ chưa xác nhận lượt Tỉ Thí Tông Môn; không gửi lại để tránh lặp trận.', 'asked');
                    return true;
                } else {
                    // Số lượt chỉ cập nhật khi tải lại dữ liệu sau khi trận kết thúc.
                    if (now - pending.startedAt >= TIEN_MINH_POLL_FIRST_MS * 3 && now - pending.lastRefreshAt >= TIEN_MINH_POLL_EVERY_MS &&
                        typeof wr.send18125 === 'function') {
                        pending.lastRefreshAt = now;
                        try {
                            wr.send18125();
                        } catch (error) {
                            // Lần kiểm tra kế tiếp sẽ thử lại cho tới khi hết thời gian chờ.
                        }
                    }
                    return true;
                }
            }

            if (doneCount >= maxCount) {
                if (state.war.fightsDone > 0) {
                    logTienMinh(state, 'war-limit-reached', `✅ [Tiên Minh - Tỉ Thí Tông Môn] Đã hoàn thành ${doneCount}/${maxCount} lượt Khiêu Chiến trong ngày.`, "action");
                    state.phase = 'asked';
                } else {
                    skipTienMinhStep(state, 'war-no-turns', 'Tỉ Thí Tông Môn đã hết lượt Khiêu Chiến trong ngày.', 'asked');
                }
                return true;
            }

            if (!state.war.requested) {
                if (typeof wr.send18126 !== 'function') {
                    failTienMinhStep(state, 'war-map-api', 'API tải bản đồ Tỉ Thí Tông Môn chưa sẵn sàng.', 'asked');
                    return true;
                }
                try {
                    wr.send18126();
                    state.war.requested = true;
                    state.war.requestStartedAt = now;
                } catch (error) {
                    failTienMinhStep(state, 'war-map-error', `Không thể tải bản đồ Tỉ Thí Tông Môn: ${error.message || error}`, 'asked');
                }
                return true;
            }

            const cities = Array.isArray(wr.cityLs) ? wr.cityLs : [];
            if (!cities.some((city) => city && city.isSelf !== undefined)) {
                if (now - state.war.requestStartedAt >= TIEN_MINH_REQUEST_TIMEOUT_MS) {
                    failTienMinhStep(state, 'war-city-timeout', 'Bản đồ Tỉ Thí chưa trả về trạng thái thành trì đang chiếm.', 'asked');
                }
                return true;
            }

            if (!state.war.city) {
                // Mỗi lượt chọn ngẫu nhiên một thành trì hợp lệ trên bản đồ.
                const candidates = cities
                    .map((city, index) => ({ city, index }))
                    .filter(({ city }) => city && Number.isFinite(Number(city.cityId)) && Number(city.cityId) > 0);
                if (candidates.length === 0) {
                    skipTienMinhStep(state, 'war-no-target-city', 'Bản đồ Tỉ Thí không có thành trì hợp lệ để Khiêu Chiến.', 'asked');
                    return true;
                }
                const selected = candidates[Math.floor(Math.random() * candidates.length)];
                state.war.city = selected.city;
                state.war.cityIndex = selected.index;
                state.war.targetType = (selected.city.isSelf === true || Number(selected.city.isSelf) === 1)
                    ? 'owned'
                    : isTienMinhNeutralCity(selected.city)
                        ? 'neutral'
                        : 'other';
            }

            if (typeof wr.showFightUi !== 'function' ||
                typeof wr.chanllenge !== 'function' ||
                !Number.isFinite(Number(state.war.city.cityId)) ||
                !Number.isFinite(Number(state.war.cityIndex))) {
                failTienMinhStep(state, 'war-challenge-api', 'Không tìm thấy nút Khiêu Chiến hoặc thành trì đang chiếm hợp lệ.', 'asked');
                return true;
            }
            if (wr.isEnter !== true) {
                failTienMinhStep(state, 'war-challenge-unavailable', 'Game chưa cho phép vào giao diện Khiêu Chiến Tỉ Thí Tông Môn; không gửi thao tác.', 'asked');
                return true;
            }
            state.war.pending = {
                beforeCount: doneCount,
                startedAt: now,
                lastRefreshAt: 0
            };
            try {
                wr.cityIdx = state.war.cityIndex;
                wr.showFightUi();
                wr.chanllenge();
            } catch (error) {
                state.war.pending = null;
                failTienMinhStep(state, 'war-challenge-error', `Không thể Khiêu Chiến thành trì đang chiếm: ${error.message || error}`, 'asked');
            }
            return true;
        }

        function handleTienMinhAsked(ctx, state, now) {
            const gc = state.guildCtrl;
            const asked = state.asked;
            const model = gc.m_curModel;
            if (!model || typeof model.getAskedIsOpen !== 'function' ||
                typeof gc.send18140 !== 'function' ||
                typeof gc.canJoinAskedUi !== 'function') {
                failTienMinhStep(state, 'asked-api', 'API kiểm tra/Khiêu Chiến Tông Môn Vấn Đạo chưa sẵn sàng.', 'help');
                return true;
            }

            if (asked.pending) {
                const pending = asked.pending;
                if (model.scmd18144Data !== pending.resultRef) {
                    asked.pending = null;
                    asked.count++;
                    state.confirmedActions++;
                    logTienMinh(state, `asked-fight-${asked.count}`, `✅ [Tiên Minh - Tông Môn Vấn Đạo] Máy chủ xác nhận lượt Khiêu Chiến ${asked.count}/${TIEN_MINH_ASKED_FIGHTS}.`, "action");
                } else if (now - pending.startedAt >= TIEN_MINH_REQUEST_TIMEOUT_MS) {
                    asked.pending = null;
                    failTienMinhStep(state, 'asked-fight-timeout', 'Máy chủ chưa xác nhận trận Tông Môn Vấn Đạo; không gửi lại để tránh lặp trận. Vẫn kiểm tra thưởng sát thương.', 'askedClaim');
                }
                return true;
            }

            if (!asked.checked) {
                let isOpenToday;
                let residueSeconds = 0;
                try {
                    isOpenToday = model.getAskedIsOpen();
                    if (isOpenToday && typeof model.getAskedMatchResidueTime === 'function') {
                        residueSeconds = Number(model.getAskedMatchResidueTime()) || 0;
                    }
                } catch (error) {
                    failTienMinhStep(state, 'asked-schedule-state', `Không thể kiểm tra lịch mở Tông Môn Vấn Đạo: ${error.message || error}`, 'help');
                    return true;
                }
                if (!isOpenToday) {
                    skipTienMinhStep(state, 'asked-not-scheduled', 'Tông Môn Vấn Đạo không mở theo lịch hôm nay; bỏ qua.', 'help');
                    return true;
                }
                if (residueSeconds > 0) {
                    skipTienMinhStep(state, 'asked-matching', `Tông Môn Vấn Đạo đang ghép đối thủ (còn ${Math.ceil(residueSeconds / 60)} phút); bỏ qua lượt này.`, 'help');
                    return true;
                }
                asked.checked = true;
                asked.loading = { dataRef: model.scmd18140Data, startedAt: now };
                try {
                    gc.send18140(1);
                } catch (error) {
                    asked.loading = null;
                    failTienMinhStep(state, 'asked-open-error', `Không thể tải trạng thái Tông Môn Vấn Đạo: ${error.message || error}`, 'help');
                }
                return true;
            }
            if (asked.loading) {
                if (model.scmd18140Data !== asked.loading.dataRef) {
                    asked.loading = null;
                } else {
                    if (now - asked.loading.startedAt >= TIEN_MINH_REQUEST_TIMEOUT_MS) {
                        asked.loading = null;
                        failTienMinhStep(state, 'asked-state-timeout', 'Không tải được trạng thái Tông Môn Vấn Đạo từ máy chủ.', 'help');
                    }
                    return true;
                }
            }

            if (asked.count >= TIEN_MINH_ASKED_FIGHTS) {
                logTienMinh(state, 'asked-done', `ℹ️ [Tiên Minh - Tông Môn Vấn Đạo] Đã hoàn thành ${asked.count}/${TIEN_MINH_ASKED_FIGHTS} lượt Khiêu Chiến.`, "info");
                state.phase = 'askedClaim';
                return true;
            }

            let canJoin;
            try {
                canJoin = gc.canJoinAskedUi(false);
            } catch (error) {
                failTienMinhStep(state, 'asked-challenge-state', `Không đọc được trạng thái Tông Môn Vấn Đạo: ${error.message || error}`, 'help');
                return true;
            }
            if (!canJoin) {
                skipTienMinhStep(state, 'asked-inactive', 'Tông Môn Vấn Đạo hôm nay chưa có đối thủ hoặc không hoạt động; bỏ qua Khiêu Chiến, kiểm tra thưởng.', 'askedClaim');
                return true;
            }

            const embattleType = ctx.EmbattleConst && ctx.EmbattleConst.embattleType;
            if (!ctx.EmbattleCtrl || !ctx.EmbattleCtrl.gInst || !embattleType ||
                embattleType.guildAsked === undefined) {
                failTienMinhStep(state, 'asked-challenge-api', 'API Khiêu Chiến Tông Môn Vấn Đạo chưa sẵn sàng.', 'help');
                return true;
            }
            const fightCtrl = ctx.FightCtrl && ctx.FightCtrl.gInst ? ctx.FightCtrl.gInst() : null;
            if (fightCtrl && typeof fightCtrl.gCanFight === 'function' && !fightCtrl.gCanFight(0)) {
                asked.blocked = (asked.blocked || 0) + 1;
                if (asked.blocked >= 10) {
                    failTienMinhStep(state, 'asked-blocked', 'Game không cho phép Khiêu Chiến Tông Môn Vấn Đạo lúc này (đang trong trận khác). Vẫn kiểm tra thưởng sát thương.', 'askedClaim');
                }
                return true;
            }
            asked.pending = { resultRef: model.scmd18144Data, startedAt: now };
            try {
                // Giống nút Khiêu Chiến: mở đội hình, sau đó bộ xử lý trận bấm Bắt Đầu.
                ctx.EmbattleCtrl.gInst().openEmbattle(embattleType.guildAsked);
            } catch (error) {
                asked.pending = null;
                failTienMinhStep(state, 'asked-challenge-error', `Không thể Khiêu Chiến Tông Môn Vấn Đạo: ${error.message || error}. Vẫn kiểm tra thưởng sát thương.`, 'askedClaim');
            }
            return true;
        }

        // Mốc thưởng sát thương Tông Môn Vấn Đạo đã đạt nhưng chưa nhận (giống điều kiện ô thưởng của game: state 1).
        function getTienMinhAskedClaimable(model, data) {
            if (!data || !data.damage) return [];
            const damage = Number(data.damage.dataNum) || 0;
            const list = model.getAskedHarmRewardCfg(data.damage_award_group) || [];
            return list.filter((cfg) => !model.getHarmRewardById(cfg.id) && damage >= Number(cfg.val));
        }

        // Nhận thưởng mốc sát thương Tông Môn Vấn Đạo (GuildCtrl.send18145, không tham số; game đánh dấu đã nhận qua harmRewardDic).
        function handleTienMinhAskedClaim(ctx, state, now) {
            const gc = state.guildCtrl;
            const claim = state.askedClaim;
            const model = gc.m_curModel;
            if (!model || typeof gc.send18140 !== 'function' || typeof gc.send18145 !== 'function' ||
                typeof model.getAskedHarmRewardCfg !== 'function' || typeof model.getHarmRewardById !== 'function') {
                failTienMinhStep(state, 'asked-claim-api', 'API nhận thưởng Tông Môn Vấn Đạo chưa sẵn sàng.', 'help');
                return true;
            }
            // 1) Tải lại dữ liệu mới nhất (sau các trận vừa đánh).
            if (!claim.loaded) {
                if (!claim.loading) {
                    claim.loading = { dataRef: model.scmd18140Data, startedAt: now };
                    try {
                        gc.send18140(1);
                    } catch (error) {
                        claim.loading = null;
                        failTienMinhStep(state, 'asked-claim-load-error', `Không thể tải thưởng Tông Môn Vấn Đạo: ${error.message || error}`, 'help');
                    }
                    return true;
                }
                if (model.scmd18140Data === claim.loading.dataRef) {
                    if (now - claim.loading.startedAt >= TIEN_MINH_REQUEST_TIMEOUT_MS) {
                        claim.loading = null;
                        failTienMinhStep(state, 'asked-claim-state-timeout', 'Không tải được dữ liệu thưởng Tông Môn Vấn Đạo từ máy chủ.', 'help');
                    }
                    return true;
                }
                claim.loaded = true;
                claim.loading = null;
            }

            const claimable = getTienMinhAskedClaimable(model, model.scmd18140Data);
            if (claim.pending) {
                if (claimable.length < claim.pending.before) {
                    const got = claim.pending.before - claimable.length;
                    claim.pending = null;
                    state.confirmedActions++;
                    logTienMinh(state, `asked-claim-confirmed-${claim.sends}`, `✅ [Tiên Minh - Tông Môn Vấn Đạo] Máy chủ xác nhận đã nhận thưởng ${got} mốc sát thương.`, "result");
                } else if (now - claim.pending.startedAt >= TIEN_MINH_REQUEST_TIMEOUT_MS) {
                    claim.pending = null;
                    failTienMinhStep(state, 'asked-claim-timeout', 'Máy chủ chưa xác nhận nhận thưởng Tông Môn Vấn Đạo; không gửi lại.', 'help');
                    return true;
                } else {
                    return true;
                }
            }
            if (!claimable.length) {
                logTienMinh(state, 'asked-claim-none', "ℹ️ [Tiên Minh - Tông Môn Vấn Đạo] Không có mốc thưởng sát thương nào để nhận.", "info");
                state.phase = 'help';
                return true;
            }
            if (claim.sends >= 4) {
                failTienMinhStep(state, 'asked-claim-limit', 'Đã gửi nhận thưởng nhiều lần mà vẫn còn mốc chưa nhận; dừng.', 'help');
                return true;
            }
            claim.sends++;
            claim.pending = { before: claimable.length, startedAt: now };
            try {
                gc.send18145();
            } catch (error) {
                claim.pending = null;
                failTienMinhStep(state, 'asked-claim-error', `Không thể nhận thưởng Tông Môn Vấn Đạo: ${error.message || error}`, 'help');
            }
            return true;
        }

        function getTienMinhHelpSignature(data) {
            if (!data) return '';
            const mine = Array.isArray(data.my_list)
                ? data.my_list.map((item) => item && [item.pos, item.base_id, item.be_count, item.reward_count])
                : [];
            return JSON.stringify([data.count, data.vip_count, mine, Array.isArray(data.list) ? data.list.length : -1]);
        }

        function getTienMinhHelpEntryKey(entry) {
            const id = entry && entry.id;
            const idKey = id && id.m_highInt !== undefined
                ? `${id.m_highInt}_${id.m_lowInt}`
                : String(id);
            return `${idKey}:${entry && entry.pos}`;
        }

        // Danh mục vật phẩm Xin Giúp lấy từ cấu hình game (không phụ thuộc giao diện đang mở).
        function getTienMinhHelpCategories(gc) {
            const model = gc.m_curModel;
            const cfg = model && typeof model.getGuildConfig === 'function'
                ? model.getGuildConfig()
                : null;
            const raw = cfg && cfg.cfg && cfg.cfg[11] && cfg.cfg[11].val;
            if (typeof raw !== 'string') return [];
            return raw.replace(/[\[\]\s]/g, '').split(',')
                .map(Number)
                .filter((id) => Number.isFinite(id) && id > 0);
        }

        function getTienMinhHelpBoxCount(gc) {
            const model = gc.m_curModel;
            const cfg = model && typeof model.getGuildConfig === 'function'
                ? model.getGuildConfig()
                : null;
            const count = Number(cfg && cfg.cfg && cfg.cfg[9] && cfg.cfg[9].val);
            return Number.isInteger(count) && count > 0 && count <= 4 ? count : 2;
        }

        function handleTienMinhHelp(ctx, state, now) {
            const gc = state.guildCtrl;
            const help = state.help;
            const model = gc.m_curModel;
            const data = model && model.scmd18040Data;
            if (!help.opened) {
                if (typeof gc.openGuildHelpUi !== 'function' ||
                    typeof gc.send18040Msg !== 'function') {
                    failTienMinhStep(state, 'help-open-api', 'API mở/đọc trạng thái Viện Trợ Tông Môn chưa sẵn sàng.', 'fete');
                    return true;
                }
                try {
                    gc.openGuildHelpUi();
                    gc.send18040Msg();
                    help.opened = true;
                    help.openedAt = now;
                } catch (error) {
                    failTienMinhStep(state, 'help-open-error', `Không thể mở Viện Trợ Tông Môn: ${error.message || error}`, 'fete');
                }
                return true;
            }

            if (!data || !Array.isArray(data.my_list) || !Array.isArray(data.list)) {
                if (now - help.openedAt >= TIEN_MINH_REQUEST_TIMEOUT_MS) {
                    failTienMinhStep(state, 'help-state-timeout', 'Không tải được trạng thái Viện Trợ Tông Môn từ máy chủ.', 'fete');
                }
                return true;
            }

            if (help.pending) {
                const pending = help.pending;
                if (pending.kind === 'box') {
                    const placed = data.my_list.some((item) => item && Number(item.pos) === pending.slot);
                    if (placed) {
                        help.pending = null;
                        state.confirmedActions++;
                        logTienMinh(state, `help-box-${pending.slot}`, `✅ [Tiên Minh - Viện Trợ] Máy chủ xác nhận đã chọn vật phẩm Xin Giúp cho ô ${pending.slot}.`, "action");
                    } else if (now - pending.startedAt >= TIEN_MINH_REQUEST_TIMEOUT_MS) {
                        help.pending = null;
                        help.boxFailed = true;
                        failTienMinhStep(state, `help-box-timeout-${pending.slot}`, `Máy chủ chưa xác nhận Xin Giúp ô ${pending.slot}; không gửi lại để tránh yêu cầu trùng.`, 'help');
                    }
                    return true;
                }
                // pending.kind === 'assist': giúp thành viên (tab Viện trợ tông môn)
                const count = Number(data.count);
                if (Number.isFinite(count) && count > pending.beforeCount) {
                    help.pending = null;
                    help.assisted++;
                    state.confirmedActions++;
                    logTienMinh(state, `help-assist-${help.assisted}`, `✅ [Tiên Minh - Viện Trợ] Máy chủ xác nhận đã Viện trợ thành viên (${count}/${Number(data.max_count)} lượt miễn phí hôm nay).`, "action");
                } else if (data !== pending.dataRef) {
                    // Máy chủ từ chối và game tải lại danh sách (rv18042 → send18040Msg).
                    help.pending = null;
                    help.assistRejected++;
                } else if (now - pending.startedAt >= TIEN_MINH_REQUEST_TIMEOUT_MS) {
                    help.pending = null;
                    help.assistRejected++;
                }
                return true;
            }

            // Bước 1: điền đủ các ô (hộp) Xin Giúp.
            const boxCount = getTienMinhHelpBoxCount(gc);
            for (let slot = 1; slot <= boxCount && !help.boxFailed; slot++) {
                if (data.my_list.some((item) => item && Number(item.pos) === slot)) continue;
                if (typeof gc.send18041Msg !== 'function') {
                    failTienMinhStep(state, 'help-action-api', 'API chọn vật phẩm Xin Giúp chưa sẵn sàng.', 'help');
                    help.boxFailed = true;
                    return true;
                }
                const usedIds = new Set(data.my_list.map((item) => Number(item && item.base_id)));
                const options = getTienMinhHelpCategories(gc).filter((id) => !usedIds.has(id));
                if (options.length === 0) {
                    help.boxFailed = true;
                    failTienMinhStep(state, `help-options-${slot}`, `Không có vật phẩm Xin Giúp khả dụng, không trùng cho ô ${slot}.`, 'help');
                    return true;
                }
                const baseId = options[Math.floor(Math.random() * options.length)];
                help.pending = { kind: 'box', slot, startedAt: now };
                try {
                    gc.send18041Msg(slot, baseId);
                } catch (error) {
                    help.pending = null;
                    help.boxFailed = true;
                    failTienMinhStep(state, `help-box-error-${slot}`, `Không thể chọn vật phẩm Xin Giúp ô ${slot}: ${error.message || error}`, 'help');
                }
                return true;
            }
            if (!help.boxesLogged) {
                help.boxesLogged = true;
                if (!help.boxFailed) {
                    logTienMinh(state, 'help-boxes-ready', `ℹ️ [Tiên Minh - Xin Giúp] Cả ${boxCount} ô Xin Giúp đã được cấu hình.`, "info");
                }
            }

            // Bước 2: Viện trợ thành viên khác trong giới hạn lượt miễn phí.
            const count = Number(data.count);
            const maxCount = Number(data.max_count);
            if (!Number.isFinite(count) || !Number.isFinite(maxCount)) {
                failTienMinhStep(state, 'help-count-state', 'Không đọc được giới hạn lượt Viện Trợ Tông Môn.', 'fete');
                return true;
            }
            if (count >= maxCount) {
                skipTienMinhStep(state, 'help-limit', `Đã dùng hết ${count}/${maxCount} lượt Viện trợ miễn phí trong ngày.`, 'fete');
                return true;
            }
            const target = data.list.find((entry) => entry &&
                !help.attempted.has(getTienMinhHelpEntryKey(entry)) &&
                Number(entry.be_count) < Number(entry.max_count));
            if (!target) {
                if (help.assisted > 0) {
                    logTienMinh(state, 'help-assist-done', `ℹ️ [Tiên Minh - Viện Trợ] Đã Viện trợ ${help.assisted} lượt, hết yêu cầu có thể giúp (${count}/${maxCount} lượt miễn phí).`, "info");
                    state.phase = 'fete';
                } else if (help.assistRejected > 0) {
                    skipTienMinhStep(state, 'help-all-rejected', `Máy chủ không nhận ${help.assistRejected} yêu cầu Viện trợ (có thể đã giúp trước đó); không thử lại.`, 'fete');
                } else {
                    skipTienMinhStep(state, 'help-no-requests', 'Không có thành viên nào cần Viện trợ Tông Môn.', 'fete');
                }
                return true;
            }
            if (typeof gc.send18042Msg !== 'function') {
                failTienMinhStep(state, 'help-assist-api', 'API Viện trợ thành viên chưa sẵn sàng.', 'fete');
                return true;
            }
            help.attempted.add(getTienMinhHelpEntryKey(target));
            help.pending = { kind: 'assist', beforeCount: count, dataRef: data, startedAt: now };
            try {
                gc.send18042Msg(target.id, target.pos);
            } catch (error) {
                help.pending = null;
                failTienMinhStep(state, 'help-assist-error', `Không thể Viện trợ thành viên: ${error.message || error}`, 'fete');
            }
            return true;
        }

        function getTienMinhFeteSignature(data) {
            if (!data) return '';
            return JSON.stringify([
                data.fate_type,
                data.fate_num,
                Array.isArray(data.raward_list) ? data.raward_list.length : -1
            ]);
        }

        function handleTienMinhFete(ctx, state, now) {
            const gc = state.guildCtrl;
            const fete = state.fete;
            const data = gc.m_curModel && gc.m_curModel.scmd18035Data;
            const manager = ctx.ViewMgr && ctx.ViewMgr.gViewMgr;
            const cache = manager && manager.m_viewCacheGroup;
            const view = cache && cache.guildFeteUi;
            const button = view && view.feteBtnGroup1;

            if (fete.pending) {
                const pending = fete.pending;
                if (getTienMinhFeteSignature(data) !== pending.signature ||
                    (button && button.visible === false)) {
                    fete.pending = null;
                    state.confirmedActions++;
                    logTienMinh(state, 'fete-confirmed', "✅ [Tiên Minh - Tổ Sư Đường] Máy chủ xác nhận đã Cung phụng Dâng Tôn Sư.", "result");
                    fete.claiming = true;
                } else if (now - pending.startedAt >= TIEN_MINH_REQUEST_TIMEOUT_MS) {
                    failTienMinhStep(state, 'fete-timeout', 'Máy chủ chưa xác nhận Cung phụng Dâng Tôn Sư.', 'done');
                }
                return true;
            }

            if (fete.claiming) return handleTienMinhFeteClaim(state, now);

            if (!fete.opened) {
                if (typeof gc.openGuildFeteUi !== 'function' ||
                    typeof gc.send18035Msg !== 'function') {
                    failTienMinhStep(state, 'fete-open-api', 'API mở Tổ Sư Đường chưa sẵn sàng.', 'done');
                    return true;
                }
                try {
                    gc.openGuildFeteUi();
                    gc.send18035Msg();
                    fete.opened = true;
                    fete.openedAt = now;
                } catch (error) {
                    failTienMinhStep(state, 'fete-open-error', `Không thể mở Tổ Sư Đường: ${error.message || error}`, 'done');
                }
                return true;
            }
            if (!data || !button) {
                if (now - fete.openedAt >= TIEN_MINH_REQUEST_TIMEOUT_MS) {
                    failTienMinhStep(state, 'fete-state-timeout', 'Không tải được trạng thái Cung phụng Dâng Tôn Sư.', 'done');
                }
                return true;
            }
            if (button.visible !== true || button.enabled === false || button.touchEnabled === false) {
                state.skippedSteps++;
                logTienMinh(state, 'fete-already-done', "ℹ️ [Tiên Minh] Cung phụng Dâng Tôn Sư không còn khả dụng hoặc đã hoàn tất; kiểm tra thưởng tiến độ.", "info");
                fete.claiming = true;
                return true;
            }
            if (typeof gc.send18036Msg !== 'function') {
                failTienMinhStep(state, 'fete-action-api', 'API Cung phụng Dâng Tôn Sư chưa sẵn sàng.', 'done');
                return true;
            }
            fete.pending = {
                signature: getTienMinhFeteSignature(data),
                startedAt: now
            };
            try {
                gc.send18036Msg(1);
            } catch (error) {
                fete.pending = null;
                failTienMinhStep(state, 'fete-action-error', `Không thể Cung phụng Dâng Tôn Sư: ${error.message || error}`, 'done');
            }
            return true;
        }

        // Nhận thưởng mốc "Tiến độ cung phụng" (GuildCtrl.send18037Msg(count)): mốc đã đạt (fate_num >= count) và chưa có trong raward_list.
        function handleTienMinhFeteClaim(state, now) {
            const gc = state.guildCtrl;
            const fete = state.fete;
            const model = gc.m_curModel;
            if (!model || typeof gc.send18037Msg !== 'function' || typeof model.getGuildAwardConfig !== 'function' || !model.scmd18035Data) {
                skipTienMinhStep(state, 'fete-claim-api', 'Không đọc được mốc thưởng Cung Phụng; bỏ qua.', 'done');
                return true;
            }
            const claimedNums = () => ((model.scmd18035Data && model.scmd18035Data.raward_list) || []).map((item) => Number(item && item.num));
            if (fete.claimPending) {
                const pending = fete.claimPending;
                if (claimedNums().includes(pending.count)) {
                    fete.claimPending = null;
                    state.confirmedActions++;
                    logTienMinh(state, `fete-claim-${pending.count}`, `✅ [Tiên Minh - Tổ Sư Đường] Máy chủ xác nhận đã nhận thưởng mốc Cung Phụng ${pending.count}.`, "result");
                } else if (now - pending.startedAt >= TIEN_MINH_REQUEST_TIMEOUT_MS) {
                    fete.claimPending = null;
                    failTienMinhStep(state, 'fete-claim-timeout', `Máy chủ chưa xác nhận nhận thưởng mốc Cung Phụng ${pending.count}; không gửi lại.`, 'done');
                    return true;
                } else {
                    return true;
                }
            }
            const fateNum = Number(model.scmd18035Data.fate_num) || 0;
            const done = claimedNums();
            const next = [1, 2, 3].map((t) => model.getGuildAwardConfig(t))
                .filter((cfg) => cfg && Number(cfg.count) > 0)
                .sort((a, b) => Number(a.count) - Number(b.count))
                .find((cfg) => !done.includes(Number(cfg.count)) && fateNum >= Number(cfg.count));
            if (!next) {
                logTienMinh(state, 'fete-claim-none', `ℹ️ [Tiên Minh - Tổ Sư Đường] Tiến độ cung phụng ${fateNum}; không có mốc thưởng nào để nhận.`, "info");
                state.phase = 'done';
                return true;
            }
            fete.claimPending = { count: Number(next.count), startedAt: now };
            try {
                gc.send18037Msg(Number(next.count));
            } catch (error) {
                fete.claimPending = null;
                failTienMinhStep(state, 'fete-claim-error', `Không thể nhận thưởng mốc Cung Phụng: ${error.message || error}`, 'done');
            }
            return true;
        }

        // Về lại màn hình chính khi làm xong: đóng mọi bảng Tông Môn còn mở (bảng con trước, bảng chính sau cùng).
        function closeTienMinhGuildViews() {
            try {
                const vmCtl = window.ViewMgr && window.ViewMgr.gInst && window.ViewMgr.gInst();
                const cache = window.ViewMgr && window.ViewMgr.gViewMgr && window.ViewMgr.gViewMgr.m_viewCacheGroup;
                if (!vmCtl || typeof vmCtl.viewIsVisible !== 'function' || typeof vmCtl.closeView !== 'function' || !cache) return 0;
                const names = Object.keys(cache).filter((name) => /^guild/i.test(name) && vmCtl.viewIsVisible(name));
                names.sort((a, b) => (a === 'guildMainUi') - (b === 'guildMainUi'));
                names.forEach((name) => { try { vmCtl.closeView(name); } catch (e) { } });
                return names.length;
            } catch (e) { return 0; }
        }

        function finishTienMinh(state) {
            if (state.finalized) return;
            if (state.fete.opened && !state.fete.closeAttempted) {
                state.fete.closeAttempted = true;
                if (typeof state.guildCtrl.closeGuildFeteUi !== 'function') {
                    state.failed = true;
                    logTienMinh(state, 'fete-close-api', 'Không thể đóng giao diện Tổ Sư Đường sau khi hoàn tất vì API đóng giao diện chưa sẵn sàng.', "err");
                } else {
                    try {
                        state.guildCtrl.closeGuildFeteUi();
                    } catch (error) {
                        state.failed = true;
                        logTienMinh(state, 'fete-close-error', `Không thể đóng giao diện Tổ Sư Đường sau khi hoàn tất: ${error.message || error}`, "err");
                    }
                }
            }
            closeTienMinhGuildViews();
            state.phase = 'done';
            state.finalized = true;
            if (state.failed) {
                sendLog(`⚠️ [Tiên Minh] Đã kiểm tra xong; ${state.confirmedActions} thao tác được xác nhận, ${state.skippedSteps} bước đã bỏ qua. Có bước chưa được máy chủ xác nhận.`, "err");
            } else if (state.confirmedActions > 0) {
                sendLog(`✅ [Tiên Minh] Đã kiểm tra xong; máy chủ xác nhận ${state.confirmedActions} thao tác, ${state.skippedSteps} bước đã hoàn tất/không khả dụng.`, "result");
            } else {
                sendLog(`ℹ️ [Tiên Minh] Đã kiểm tra trạng thái; không có thao tác nào cần thực hiện (${state.skippedSteps} bước đã hoàn tất/không khả dụng).`, "info");
            }
        }

        function isTienMinhFighting(ctx) {
            try {
                return !!(ctx.EntityMgr && ctx.EntityMgr.gInst && ctx.EntityMgr.gInst().getIsFighting());
            } catch (error) {
                return false;
            }
        }

        function getTienMinhPendings(state) {
            return [state.dungeon.pending, state.war.pending, state.asked.pending].filter(Boolean);
        }

        // Chờ trận đánh kết thúc, tự bấm Bắt Đầu ở bảng đội hình và đóng bảng kết quả.
        // Trả về true nếu bước này đã chiếm lượt xử lý hiện tại.
        function handleTienMinhBattle(ctx, state, now) {
            const pendings = getTienMinhPendings(state);
            if (pendings.length === 0) {
                // Bảng đội hình còn sót lại sau khi hết lượt: đóng lại, không bấm Bắt Đầu nữa.
                const leftoverVm = ctx.ViewMgr && ctx.ViewMgr.gInst ? ctx.ViewMgr.gInst() : null;
                if (leftoverVm && typeof leftoverVm.viewIsVisible === 'function' &&
                    !isTienMinhFighting(ctx) && leftoverVm.viewIsVisible('embattleUi')) {
                    leftoverVm.closeView('embattleUi');
                    tienMinhDidSend = true;
                    logTienMinh(state, 'battle-embattle-leftover', "ℹ️ [Tiên Minh] Đã đóng bảng đội hình còn mở sau khi hết lượt Khiêu Chiến.", "info");
                    return true;
                }
                return false;
            }

            if (isTienMinhFighting(ctx)) {
                if (!state.fightingSince) {
                    state.fightingSince = now;
                    logTienMinh(state, `battle-start-${state.confirmedActions}-${now}`, "ℹ️ [Tiên Minh] Đang trong trận đánh; chờ trận kết thúc (tự bỏ qua hoạt ảnh).", "info");
                }
                if (now - state.fightingSince < TIEN_MINH_FIGHT_MAX_WAIT_MS) {
                    // Thời gian đánh không tính vào thời gian chờ xác nhận của máy chủ.
                    pendings.forEach((pending) => { pending.startedAt = now; });
                    return true;
                }
                return false;
            }
            state.fightingSince = 0;

            const vm = ctx.ViewMgr && ctx.ViewMgr.gInst ? ctx.ViewMgr.gInst() : null;
            if (!vm || typeof vm.viewIsVisible !== 'function') return false;

            let acted = false;
            if (vm.viewIsVisible('embattleUi') && now - (state.lastEmbattleAt || 0) >= 2500) {
                const embattleUi = typeof vm.getViewByName === 'function' ? vm.getViewByName('embattleUi') : null;
                if (embattleUi && typeof embattleUi.cBtnH2 === 'function') {
                    try {
                        // Bấm "Lên trận nhanh", kiểm tra ô đội hình có tướng, mới bấm "Bắt Đầu".
                        if (!state.emb) state.emb = { at: 0, clicked: 0, starts: 0 };
                        const step = embattleStep(embattleUi, state.emb, now);
                        if (step === 'arranged') {
                            acted = true;
                        } else if (step === 'ready') {
                            embattleMarkStarted(state.emb);
                            embattleUi.cBtnH2();
                            state.lastEmbattleAt = now;
                            state.embattleClicks = (state.embattleClicks || 0) + 1;
                            logTienMinh(state, `battle-embattle-${state.embattleClicks}`, "ℹ️ [Tiên Minh] Đã tự chọn đội hình và bấm Bắt Đầu.", "info");
                            acted = true;
                        } else if (step === 'failed') {
                            const diag = embattleDiagnose(embattleUi, state.emb);
                            state.emb = null;
                            state.lastEmbattleAt = now;
                            try { vm.closeView('embattleUi'); } catch (e) { }
                            logTienMinh(state, 'battle-embattle-empty', `❌ [Tiên Minh] Không xếp được đội hình (${diag}); bỏ qua lượt Khiêu Chiến này.`, "error");
                            acted = true;
                        }
                    } catch (error) {
                        logTienMinh(state, 'battle-embattle-error', `⚠️ [Tiên Minh] Không thể bấm Bắt Đầu ở bảng đội hình: ${error.message || error}`, "err");
                    }
                }
            }
            if (!vm.viewIsVisible('embattleUi')) state.emb = null;
            ['fightSuccessUi', 'fightFailUi', 'winUi', 'fightWinUi', 'fightResultUi',
                'adventureResultUi', 'guildAskedFightResultUi'].forEach((name) => {
                if (vm.viewIsVisible(name)) {
                    vm.closeView(name);
                    acted = true;
                }
            });
            if (acted) tienMinhDidSend = true;
            return acted;
        }

        // Tiên Minh là chuỗi ~25 bước, mỗi bước chờ máy chủ. Nhịp chỉ chờ (chưa gửi gì) phải kiểm tra lại ngay ('wait'),
        // không nghỉ kiểu người chơi như khi vừa gửi thật. Cờ tienMinhDidSend được bật tại đúng lúc gọi các hàm gửi/mở
        // giao diện của GuildCtrl / GldWrCtrl / EmbattleCtrl (bọc một lần trên prototype), nên không phải sửa từng bước.
        let tienMinhDidSend = false;
        const TIEN_MINH_SEND_RE = /^(send\d+|openGuild|saveGuildDungeonFightData|showGuildBargainView|closeGuildFeteUi|openEmbattle)/;
        function tienMinhWatchSends(ctrl) {
            try {
                const proto = ctrl && Object.getPrototypeOf(ctrl);
                if (!proto || proto.__tnSendWatched) return;
                proto.__tnSendWatched = true;
                Object.getOwnPropertyNames(proto).forEach((name) => {
                    if (!TIEN_MINH_SEND_RE.test(name)) return;
                    const desc = Object.getOwnPropertyDescriptor(proto, name);
                    const orig = desc && desc.value;
                    if (typeof orig !== 'function') return;
                    proto[name] = function () { tienMinhDidSend = true; return orig.apply(this, arguments); };
                });
            } catch (error) { }
        }

        function handleTienMinh(ctx) {
            const gc = ctx.GuildCtrl && ctx.GuildCtrl.gInst
                ? ctx.GuildCtrl.gInst()
                : null;
            const wr = ctx.GldWrCtrl && ctx.GldWrCtrl.gInst
                ? ctx.GldWrCtrl.gInst()
                : null;
            if (!gc) {
                if (!tienMinhControllerUnavailableLogged) {
                    tienMinhControllerUnavailableLogged = true;
                    sendLog("⚠️ [Tiên Minh] Không tìm thấy bộ điều khiển Bang Hội; chưa thể chạy các công việc.", "err");
                }
                return true;
            }
            tienMinhControllerUnavailableLogged = false;
            tienMinhWatchSends(gc);
            tienMinhWatchSends(wr);
            if (ctx.EmbattleCtrl && ctx.EmbattleCtrl.gInst) tienMinhWatchSends(ctx.EmbattleCtrl.gInst());

            const dayKey = new Date().toDateString();
            if (!tienMinhState || tienMinhState.dayKey !== dayKey ||
                tienMinhState.guildCtrl !== gc) {
                if (tienMinhState && tienMinhState.dayKey === dayKey && tienMinhState.guildCtrl !== gc) {
                    sendLog("ℹ️ [Tiên Minh] Game đã khởi động lại/kết nối lại; kiểm tra lại trạng thái từ máy chủ trước khi tiếp tục (không lặp thao tác đã hoàn tất).", "info");
                }
                tienMinhState = createTienMinhState(gc, wr);
            }
            const state = tienMinhState;
            if (!state.warCtrl && wr) state.warCtrl = wr;
            if (state.phase === 'done') {
                finishTienMinh(state);
                return true;
            }

            if (typeof gc.checkIsHaveGuild === 'function' && !gc.checkIsHaveGuild()) {
                skipTienMinhStep(state, 'no-guild', 'Nhân vật chưa thuộc Tông Môn/Bang Hội; không có công việc Tiên Minh để làm.', 'done');
                finishTienMinh(state);
                return true;
            }

            if (handleTienMinhBattle(ctx, state, Date.now())) return true;

            if (state.phase === 'bargain') return handleTienMinhBargain(state, Date.now());
            if (state.phase === 'dungeon') return handleTienMinhDungeon(ctx, state, Date.now());
            if (state.phase === 'war') return handleTienMinhWar(state, Date.now(), ctx);
            if (state.phase === 'asked') return handleTienMinhAsked(ctx, state, Date.now());
            if (state.phase === 'askedClaim') return handleTienMinhAskedClaim(ctx, state, Date.now());
            if (state.phase === 'help') return handleTienMinhHelp(ctx, state, Date.now());
            if (state.phase === 'fete') return handleTienMinhFete(ctx, state, Date.now());
            if (state.phase === 'done') {
                finishTienMinh(state);
                return true;
            }
            failTienMinhStep(state, 'unknown-phase', `Giai đoạn xử lý không hợp lệ: ${state.phase}.`, 'done');
            finishTienMinh(state);
            return true;
        }

        // ---- Trợ Chiến Linh Thú: Linh Thú -> tab Hoan Thú Viên (garden), nút Nhận nhanh bên ngoài (SpiritAnimalCtrl.send32022) ----
        function failTroChien(ctx, state, key, message) {
            state.failed = true;
            state.phase = 'done';
            closeTroChienView(ctx);
            if (state.loggedErrors.has(key)) return;
            state.loggedErrors.add(key);
            sendLog(`⚠️ [Trợ Chiến Linh Thú] ${message}`, "err");
        }

        function closeTroChienView(ctx) {
            try {
                const ctrl = ctx.SpiritAnimalCtrl && ctx.SpiritAnimalCtrl.gInst ? ctx.SpiritAnimalCtrl.gInst() : null;
                if (ctrl && typeof ctrl.closeSpiritAnimalMainUi === 'function') ctrl.closeSpiritAnimalMainUi();
            } catch (error) { }
        }

        function handleTroChien(ctx) {
            const ctrl = ctx.SpiritAnimalCtrl && ctx.SpiritAnimalCtrl.gInst
                ? ctx.SpiritAnimalCtrl.gInst()
                : null;
            if (!ctrl) {
                if (!troChienControllerUnavailableLogged) {
                    troChienControllerUnavailableLogged = true;
                    sendLog("⚠️ [Trợ Chiến Linh Thú] Không tìm thấy bộ điều khiển Linh Thú; chưa thể chạy.", "err");
                }
                return true;
            }
            troChienControllerUnavailableLogged = false;

            const dayKey = new Date().toDateString();
            if (!troChienState || troChienState.dayKey !== dayKey || troChienState.ctrl !== ctrl) {
                if (troChienState && troChienState.dayKey === dayKey && troChienState.ctrl !== ctrl) {
                    sendLog("ℹ️ [Trợ Chiến Linh Thú] Game đã khởi động lại/kết nối lại; kiểm tra lại trạng thái từ máy chủ trước khi nhận.", "info");
                }
                troChienState = {
                    dayKey, ctrl, phase: 'open', failed: false, loggedErrors: new Set(),
                    dataBefore: null, requestedAt: 0, lastRefreshAt: 0, claimedAt: 0
                };
            }
            const state = troChienState;
            if (state.phase === 'done') return true;

            const indexes = ctx.SpiritAnimalConst && ctx.SpiritAnimalConst.SpiritAnimalMainIndexId;
            if (typeof ctrl.openSpiritAnimalMainUi !== 'function' ||
                typeof ctrl.getSC_32019 !== 'function' ||
                typeof ctrl.isCanGetHomeTypeProduceReward !== 'function' ||
                typeof ctrl.send32019 !== 'function' || typeof ctrl.send32022 !== 'function' ||
                !indexes || !Number.isFinite(indexes.garden)) {
                failTroChien(ctx, state, 'api', 'API Hoan Thú Viên chưa sẵn sàng; không thể nhận nhanh.');
                return true;
            }

            if (state.phase === 'open') {
                state.dataBefore = ctrl.getSC_32019();
                state.requestedAt = Date.now();
                ctrl.openSpiritAnimalMainUi(indexes.garden);
                ctrl.send32019();
                state.phase = 'load';
                sendLog("ℹ️ [Trợ Chiến Linh Thú] Đã mở Linh Thú → Hoan Thú Viên; đang tải trạng thái từ máy chủ.", "info");
                return true;
            }

            if (state.phase === 'load') {
                const data = ctrl.getSC_32019();
                if (data && data !== state.dataBefore) {
                    state.phase = 'claim';
                } else if (Date.now() - state.requestedAt >= TRO_CHIEN_REQUEST_TIMEOUT_MS) {
                    failTroChien(ctx, state, 'load-timeout', 'Hết thời gian chờ trạng thái Hoan Thú Viên từ máy chủ; không xác nhận đã nhận.');
                    return true;
                } else {
                    return true;
                }
            }

            if (state.phase === 'claim') {
                if (!ctrl.isCanGetHomeTypeProduceReward()) {
                    sendLog("ℹ️ [Trợ Chiến Linh Thú] Hoan Thú Viên không có tài nguyên chờ nhận; bỏ qua.", "info");
                    state.phase = 'done';
                    closeTroChienView(ctx);
                    return true;
                }
                ctrl.send32022();
                state.claimedAt = state.lastRefreshAt = Date.now();
                state.phase = 'confirm';
                sendLog("ℹ️ [Trợ Chiến Linh Thú] Đã bấm Nhận nhanh ở Hoan Thú Viên; đang chờ máy chủ xác nhận.", "info");
                return true;
            }

            if (state.phase === 'confirm') {
                const now = Date.now();
                if (!ctrl.isCanGetHomeTypeProduceReward()) {
                    sendLog("✅ [Trợ Chiến Linh Thú] Máy chủ xác nhận đã nhận nhanh tài nguyên Hoan Thú Viên.", "result");
                    state.phase = 'done';
                    closeTroChienView(ctx);
                } else if (now - state.claimedAt >= TRO_CHIEN_REQUEST_TIMEOUT_MS) {
                    failTroChien(ctx, state, 'claim-timeout', 'Máy chủ chưa xác nhận Nhận nhanh Hoan Thú Viên; không gửi lại để tránh nhận trùng.');
                } else if (now - state.lastRefreshAt >= 2000) {
                    state.lastRefreshAt = now;
                    ctrl.send32019();
                }
                return true;
            }

            failTroChien(ctx, state, 'unknown-phase', `Giai đoạn xử lý không hợp lệ: ${state.phase}.`);
            return true;
        }

        function handleDailyRoutine(ctx) {
            try {
                // 1. Trợ chiến linh thú
                if (CONFIG.activeFeature === 'autoTroChien') {
                    return handleTroChien(ctx);
                }
                // 2. Tâm Tiên Đài
                if (CONFIG.activeFeature === 'autoTamTienDai') {
                    tamTienDidSend = false;
                    const acted = handleTamTienDai(ctx);
                    return acted && !tamTienDidSend ? 'wait' : acted;
                }
                // 3. Tiên Hữu (Bạn bè)
                if (CONFIG.activeFeature === 'autoTienHuu') {
                    return handleTienHuu(ctx);
                }
                // 4. Tiên Minh (Bang Hội)
                if (CONFIG.activeFeature === 'autoTienMinh') {
                    tienMinhDidSend = false;
                    const acted = handleTienMinh(ctx);
                    return acted === true && !tienMinhDidSend ? 'wait' : acted;
                }
                // 5. Cuối Ngày (Thư, Like BXH, Sôi Nổi)
                if (CONFIG.activeFeature === 'autoCuoiNgay') {
                    cuoiNgayDidSend = false;
                    const acted = handleCuoiNgay(ctx);
                    return acted && !cuoiNgayDidSend ? 'wait' : acted;
                }
                return false;
            } catch (error) {
                const message = error && error.message ? error.message : String(error);
                if (message !== lastDailyRoutineError) {
                    sendLog(`⚠️ [Hoạt động ngày] Lỗi xử lý: ${message}`, "err");
                    lastDailyRoutineError = message;
                }
                return false;
            }
        }
