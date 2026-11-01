        const TAM_TIEN_GIFT_CATEGORIES = [
            { typeKey: 'type_1', label: 'Quà Pháp Bảo' },
            { typeKey: 'type_2', label: 'Quà Linh Thú' },
            { typeKey: 'type_3', label: 'Quà Pháp Trận' }
        ];
        const TAM_TIEN_REQUEST_TIMEOUT_MS = 20000;
        const TIEN_HUU_REQUEST_TIMEOUT_MS = 20000;
        const CUOI_NGAY_REQUEST_TIMEOUT_MS = 20000;
        const TIEN_MINH_REQUEST_TIMEOUT_MS = 20000;
        let tamTienDaiState = null;
        let tienHuuState = null;
        let cuoiNgayState = null;
        let tienMinhState = null;
        let tienMinhControllerUnavailableLogged = false;
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
            sendLog(`⚠️ [M8 - Cuối Ngày] ${message}`, "err");
        }

        function finishCuoiNgay(state) {
            state.phase = 'done';
            const confirmedClaims = state.mail.claimed + state.rank.worshipped +
                state.tasks.taskClaims + state.tasks.chestClaims;
            if (state.failed) {
                sendLog("⚠️ [M8 - Cuối Ngày] Đã kiểm tra xong nhưng một số thao tác chưa được máy chủ xác nhận; xem các lỗi phía trên.", "err");
            } else if (confirmedClaims > 0) {
                sendLog(`✅ [M8 - Cuối Ngày] Máy chủ xác nhận ${state.mail.claimed} lượt nhận nhanh Thư, ${state.rank.worshipped} lượt Hành Lễ và ${state.tasks.taskClaims + state.tasks.chestClaims} thưởng Nhiệm Vụ/Rương.`, "action");
            } else {
                sendLog("ℹ️ [M8 - Cuối Ngày] Đã kiểm tra trạng thái; không còn phần thưởng đang chờ nhận, không gửi lại thao tác đã hoàn tất.", "info");
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
                sendLog("ℹ️ [M8 - Cuối Ngày - Thư] Đã mở Thư; đang tải trạng thái trước khi nhận nhanh.", "info");
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
                    sendLog("✅ [M8 - Cuối Ngày - Thư] Máy chủ xác nhận đã nhận nhanh thư có đính kèm.", "action");
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
                sendLog(`ℹ️ [M8 - Cuối Ngày - Thư] Không có thư chờ nhận ở loại ${type}; bỏ qua.`, "info");
                state.mail.typeIndex++;
                return true;
            }

            state.mail.pending = { type, startedAt: Date.now() };
            emailCtrl.send16007(type);
            sendLog(`ℹ️ [M8 - Cuối Ngày - Thư] Đã yêu cầu Nhận nhanh loại ${type}; đang chờ máy chủ xác nhận.`, "info");
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
                state.rank.view.reqRankList();
                sendLog("ℹ️ [M8 - Cuối Ngày - BXH] Đã mở BXH Sức Mạnh; đang tải trạng thái các biểu tượng Hành Lễ.", "info");
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
                    sendLog(`✅ [M8 - Cuối Ngày - BXH] Máy chủ xác nhận đã Hành Lễ qua biểu tượng BXH loại ${type}.`, "action");
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
                    sendLog(`ℹ️ [M8 - Cuối Ngày - BXH] Không còn lượt Hành Lễ khả dụng; đã bỏ qua ${state.rank.skipped} biểu tượng.`, "info");
                } else if (state.rank.skipped > 0) {
                    sendLog(`ℹ️ [M8 - Cuối Ngày - BXH] Đã bỏ qua ${state.rank.skipped} biểu tượng không còn lượt Hành Lễ khả dụng.`, "info");
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
            sendLog(`ℹ️ [M8 - Cuối Ngày - BXH] Đã bấm biểu tượng Hành Lễ loại ${type}; đang chờ máy chủ xác nhận.`, "info");
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
                sendLog("ℹ️ [M8 - Cuối Ngày - Nhiệm Vụ] Đã mở Nhiệm Vụ; đang tải trạng thái nhiệm vụ và rương.", "info");
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
                        sendLog(`✅ [M8 - Cuối Ngày - Nhiệm Vụ] Máy chủ xác nhận đã nhận nhiệm vụ #${pending.taskId}.`, "action");
                        state.tasks.pending = null;
                    }
                } else if (acvCtrl.tskStateLs[pending.index] === taskState.gain) {
                    state.tasks.chestClaims++;
                    sendLog(`✅ [M8 - Cuối Ngày - Rương] Máy chủ xác nhận đã nhận rương năng động #${pending.index + 1}.`, "action");
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
                sendLog(`ℹ️ [M8 - Cuối Ngày - Nhiệm Vụ] Đã yêu cầu nhận nhiệm vụ #${task.task_id}; đang chờ máy chủ xác nhận.`, "info");
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
                sendLog(`ℹ️ [M8 - Cuối Ngày - Rương] Đã yêu cầu nhận rương năng động #${chestIndex + 1}; đang chờ máy chủ xác nhận.`, "info");
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
                sendLog("⚠️ [M8 - Tâm Tiên Đài] Không tìm thấy bộ điều khiển quà miễn phí.", "err");
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
                sendLog("⚠️ [M8 - Tâm Tiên Đài] API nhận quà miễn phí chưa sẵn sàng.", "err");
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
                    sendLog(`⚠️ [M8 - Tâm Tiên Đài] Không thể theo dõi trạng thái quà: ${error.message || error}`, "err");
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
                            sendLog(`✅ [M8 - Tâm Tiên Đài - ${category.label}] Đã mua quà #${pending.gift.gift_id} bằng ${Number(pending.gift.gold)} Tiên Ngọc.`, "action");
                        } else {
                            sendLog(`✅ [M8 - Tâm Tiên Đài - ${category.label}] Đã nhận quà miễn phí #${pending.gift.gift_id}.`, "action");
                        }
                        state.pendingGiftClaim = null;
                        state.giftRowIndex++;
                    } else if (now - pending.startedAt >= TAM_TIEN_REQUEST_TIMEOUT_MS) {
                        const action = Number(pending.gift.gold) > 0 ? 'mua quà Tiên Ngọc' : 'nhận quà miễn phí';
                        sendLog(`⚠️ [M8 - Tâm Tiên Đài - ${category.label}] Chưa xác nhận được việc ${action} #${pending.gift.gift_id} từ máy chủ.`, "err");
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
                        sendLog(`⚠️ [M8 - Tâm Tiên Đài - ${category.label}] Không nhận được trạng thái quà từ máy chủ.`, "err");
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
                        sendLog(`ℹ️ [M8 - Tâm Tiên Đài - ${category.label}] Không có quà miễn phí để nhận.`, "info");
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
                        sendLog(`⚠️ [M8 - Tâm Tiên Đài - ${category.label}] Không xác định được loại quà.`, "err");
                        state.giftCategoryIndex++;
                        return true;
                    }

                    state.waitingGiftList = { type: giftType, startedAt: now, ready: false };
                    try {
                        welfareController.send30120(giftType);
                    } catch (error) {
                        state.waitingGiftList = null;
                        sendLog(`⚠️ [M8 - Tâm Tiên Đài - ${category.label}] Không thể kiểm tra quà: ${error.message || error}`, "err");
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
                if (tienNgocCost > 0 && !CONFIG.buyTamTienGifts) {
                    sendLog(`ℹ️ [M8 - Tâm Tiên Đài - ${category.label}] Bỏ qua quà Tiên Ngọc #${gift.gift_id} vì tùy chọn mua đang tắt.`, "info");
                    state.giftRowIndex++;
                    return true;
                }

                const purchase = welfareController.getLimitGiftBuyNetVo(gift.gift_id);
                const buyTimes = purchase ? Number(purchase.buy_times) || 0 : 0;
                const purchaseLimit = Number(gift.purchase_times) || 0;
                if (buyTimes >= purchaseLimit) {
                    const giftDescription = tienNgocCost > 0
                        ? `Quà Tiên Ngọc #${gift.gift_id}`
                        : `Quà miễn phí #${gift.gift_id}`;
                    sendLog(`ℹ️ [M8 - Tâm Tiên Đài - ${category.label}] ${giftDescription} đã mua đủ hôm nay.`, "info");
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
                } catch (error) {
                    state.pendingGiftClaim = null;
                    const action = tienNgocCost > 0 ? 'mua quà Tiên Ngọc' : 'nhận quà miễn phí';
                    sendLog(`⚠️ [M8 - Tâm Tiên Đài - ${category.label}] Không thể ${action} #${gift.gift_id}: ${error.message || error}`, "err");
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
                    sendLog("⚠️ [M8 - Tâm Tiên Đài - Chiêu Mộ] Không tìm thấy bộ điều khiển chiêu mộ miễn phí.", "err");
                    state.phase = 'done';
                    return true;
                }

                if (!recruitController.m_recruitBaseInfo) {
                    if (!state.recruitInfoRequestedAt) {
                        state.recruitInfoRequestedAt = now;
                        try {
                            recruitController.reqRecruitInfo();
                        } catch (error) {
                            sendLog(`⚠️ [M8 - Tâm Tiên Đài - Chiêu Mộ] Không thể kiểm tra lượt miễn phí: ${error.message || error}`, "err");
                            state.phase = 'done';
                        }
                    } else if (now - state.recruitInfoRequestedAt >= TAM_TIEN_REQUEST_TIMEOUT_MS) {
                        sendLog("⚠️ [M8 - Tâm Tiên Đài - Chiêu Mộ] Không nhận được trạng thái lượt miễn phí từ máy chủ.", "err");
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
                        sendLog(`✅ [M8 - Tâm Tiên Đài - Chiêu Mộ] Đã nhận lượt miễn phí: ${pending.label}.`, "action");
                        state.pendingRecruit = null;
                        state.recruitIndex++;
                    } else if (!recruitController.m_isRecruiting &&
                        now - pending.startedAt >= TAM_TIEN_REQUEST_TIMEOUT_MS) {
                        sendLog(`⚠️ [M8 - Tâm Tiên Đài - Chiêu Mộ] Máy chủ chưa xác nhận lượt miễn phí: ${pending.label}.`, "err");
                        state.pendingRecruit = null;
                        state.recruitIndex++;
                    }
                    return true;
                }

                if (recruitController.m_isRecruiting) {
                    if (!state.recruitBusySince) state.recruitBusySince = now;
                    if (now - state.recruitBusySince >= TAM_TIEN_REQUEST_TIMEOUT_MS) {
                        sendLog("⚠️ [M8 - Tâm Tiên Đài - Chiêu Mộ] Đang chờ một lượt chiêu mộ khác hoàn tất.", "err");
                        state.phase = 'done';
                    }
                    return true;
                }
                state.recruitBusySince = 0;

                if (state.recruitIndex >= recruitTypes.length) {
                    state.phase = 'done';
                    sendLog("✨ [M8 - Tâm Tiên Đài] Đã kiểm tra xong quà miễn phí, quà Tiên Ngọc theo tùy chọn và Chiêu Mộ.", "action");
                    return true;
                }

                const recruitType = recruitTypes[state.recruitIndex];
                const available = Number(recruitController.m_recruitBaseInfo[recruitType.key]) || 0;
                if (available <= 0) {
                    sendLog(`ℹ️ [M8 - Tâm Tiên Đài - Chiêu Mộ] ${recruitType.label}: hiện không có lượt miễn phí (đã dùng hoặc đang hồi).`, "info");
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
                } catch (error) {
                    state.pendingRecruit = null;
                    sendLog(`⚠️ [M8 - Tâm Tiên Đài - Chiêu Mộ] Không thể nhận lượt miễn phí ${recruitType.label}: ${error.message || error}`, "err");
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
                sendLog("⚠️ [M8 - Tiên Hữu] Không tìm thấy bộ điều khiển bạn bè.", "err");
                state.phase = 'error';
                return true;
            }

            if (!friendCtrl.m_friend_data) {
                if (state.phase === 'loading') {
                    if (now - state.startedAt >= TIEN_HUU_REQUEST_TIMEOUT_MS) {
                        sendLog("⚠️ [M8 - Tiên Hữu] Hết thời gian chờ danh sách bạn bè từ máy chủ.", "err");
                        state.phase = 'error';
                    }
                    return true;
                }
                if (typeof friendCtrl.send11801Msg !== 'function') {
                    sendLog("⚠️ [M8 - Tiên Hữu] API tải danh sách bạn bè chưa sẵn sàng.", "err");
                    state.phase = 'error';
                    return true;
                }
                try {
                    friendCtrl.send11801Msg();
                    state.phase = 'loading';
                    state.startedAt = now;
                    sendLog("ℹ️ [M8 - Tiên Hữu] Đang tải danh sách bạn bè để kiểm tra Tặng nhanh.", "info");
                } catch (error) {
                    sendLog(`⚠️ [M8 - Tiên Hữu] Không thể tải danh sách bạn bè: ${error.message || error}`, "err");
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
                    sendLog(`✅ [M8 - Tiên Hữu] Máy chủ xác nhận Tặng nhanh: ${results.join(', ')}.`, "success");
                    state.phase = 'done';
                } else if (now - state.startedAt >= TIEN_HUU_REQUEST_TIMEOUT_MS) {
                    sendLog("⚠️ [M8 - Tiên Hữu] Máy chủ chưa xác nhận thao tác Tặng nhanh.", "err");
                    state.phase = 'error';
                }
                return true;
            }

            if (typeof friendCtrl.getFriendListByType !== 'function' ||
                typeof friendCtrl.getAndSendLove !== 'function' ||
                !ctx.FriendConst || !ctx.FriendConst.friendRelationType) {
                sendLog("⚠️ [M8 - Tiên Hữu] API Tặng nhanh chưa sẵn sàng.", "err");
                state.phase = 'error';
                return true;
            }

            let friends;
            try {
                friends = friendCtrl.getFriendListByType(ctx.FriendConst.friendRelationType.friend);
            } catch (error) {
                sendLog(`⚠️ [M8 - Tiên Hữu] Không thể đọc danh sách bạn bè: ${error.message || error}`, "err");
                state.phase = 'error';
                return true;
            }
            if (!Array.isArray(friends)) {
                sendLog("⚠️ [M8 - Tiên Hữu] Danh sách bạn bè không hợp lệ.", "err");
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
                sendLog("ℹ️ [M8 - Tiên Hữu] Đã Tặng nhanh hoặc không có bạn bè cần gửi/nhận thể lực.", "info");
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
                sendLog(`⚠️ [M8 - Tiên Hữu] Không thể thực hiện Tặng nhanh: ${error.message || error}`, "err");
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
                dungeon: {
                    opened: false,
                    initialized: false,
                    freeBattlesRemaining: 0,
                    paidFightAvailable: false,
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
                    city: null,
                    targetType: null
                },
                asked: { opened: false, count: 0, pending: null },
                help: {
                    opened: false,
                    slotIndex: 0,
                    selectingSlot: 0,
                    usedCategoryIds: new Set(),
                    pending: null,
                    helping: false
                },
                fete: { opened: false, pending: null, closeAttempted: false }
            };
        }

        function logTienMinh(state, key, message, type) {
            if (state.logged.has(key)) return;
            state.logged.add(key);
            sendLog(message, type);
        }

        function failTienMinhStep(state, key, message, nextPhase) {
            state.failed = true;
            logTienMinh(state, key, `⚠️ [M8 - Tiên Minh] ${message}`, "err");
            state.phase = nextPhase;
        }

        function skipTienMinhStep(state, key, message, nextPhase) {
            state.skippedSteps++;
            logTienMinh(state, key, `ℹ️ [M8 - Tiên Minh] ${message}`, "info");
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
                        logTienMinh(state, 'bargain-offer-confirmed', "✅ [M8 - Tiên Minh - Shop Tiên Giới] Máy chủ xác nhận đã Trả Giá.", "action");
                        bargain.step = 'check-buy';
                    } else {
                        state.confirmedActions++;
                        logTienMinh(state, 'bargain-buy-confirmed', "✅ [M8 - Tiên Minh - Shop Tiên Giới] Máy chủ xác nhận đã Mua vật phẩm sau khi Trả Giá.", "action");
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
                if (typeof gc.openGuildTreasureUi !== 'function' ||
                    typeof gc.send18070 !== 'function') {
                    failTienMinhStep(state, 'bargain-api', 'API mở Shop Tiên Giới/kiểm tra Trả Giá chưa sẵn sàng.', 'dungeon');
                    return true;
                }
                try {
                    gc.openGuildTreasureUi();
                    gc.send18070();
                    bargain.pending = {
                        kind: 'load',
                        signature: getTienMinhBargainSignature(getTienMinhBargainInfo(gc)),
                        startedAt: now
                    };
                    bargain.opened = true;
                    logTienMinh(state, 'bargain-loading', "ℹ️ [M8 - Tiên Minh - Shop Tiên Giới] Đang tải trạng thái Trả Giá.", "info");
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

        function sendTienMinhDungeonFight(ctx, state, kind, now, data) {
            const gc = state.guildCtrl;
            const dungeonView = getTienMinhDungeonView(ctx);
            const dungeonId = Number(dungeonView && dungeonView.guildDungeonCurId);
            if (!Number.isFinite(dungeonId) || dungeonId <= 0 ||
                typeof gc.saveGuildDungeonFightData !== 'function' ||
                typeof gc.send18053Msg !== 'function') {
                failTienMinhStep(state, `dungeon-${kind}-api`, 'Không tìm thấy API hoặc ải Bí Cảnh Tông Môn hợp lệ để Khiêu Chiến.', 'war');
                return;
            }
            const beforeFightCount = Number(data.fight_count);
            state.dungeon.pending = {
                kind,
                beforeFightCount,
                startedAt: now
            };
            try {
                gc.saveGuildDungeonFightData(dungeonId);
                gc.send18053Msg(dungeonId);
            } catch (error) {
                state.dungeon.pending = null;
                failTienMinhStep(state, `dungeon-${kind}-error`, `Không thể Khiêu Chiến Bí Cảnh Tông Môn: ${error.message || error}`, 'war');
            }
        }

        function handleTienMinhDungeon(ctx, state, now) {
            const gc = state.guildCtrl;
            const dungeon = state.dungeon;
            const data = gc.m_curModel && gc.m_curModel.scmd18052Data;

            if (dungeon.pending) {
                const pending = dungeon.pending;
                const fightCount = Number(data && data.fight_count);
                const buyCount = Number(data && data.buy_count);
                const confirmed = pending.kind === 'buy'
                    ? Number.isFinite(buyCount) && buyCount > pending.beforeBuyCount
                    : Number.isFinite(fightCount) && fightCount > pending.beforeFightCount;
                if (confirmed) {
                    dungeon.pending = null;
                    state.confirmedActions++;
                    if (pending.kind === 'buy') {
                        dungeon.paidFightAvailable = true;
                        logTienMinh(state, 'dungeon-buy-confirmed', "✅ [M8 - Tiên Minh - Bí Cảnh Tông Môn] Máy chủ xác nhận đã mua thêm 1 lượt với giá 20 Tiên Ngọc.", "action");
                    } else if (pending.kind === 'paid-fight') {
                        logTienMinh(state, 'dungeon-paid-confirmed', "✅ [M8 - Tiên Minh - Bí Cảnh Tông Môn] Máy chủ xác nhận trận Khiêu Chiến trả phí.", "action");
                        state.phase = 'war';
                    } else {
                        dungeon.freeBattlesRemaining--;
                        logTienMinh(state, `dungeon-free-${dungeon.freeBattlesRemaining}`, `✅ [M8 - Tiên Minh - Bí Cảnh Tông Môn] Máy chủ xác nhận lượt miễn phí; còn ${dungeon.freeBattlesRemaining} lượt miễn phí trong kế hoạch.`, "action");
                    }
                } else if (now - pending.startedAt >= TIEN_MINH_REQUEST_TIMEOUT_MS) {
                    failTienMinhStep(
                        state,
                        `dungeon-${pending.kind}-timeout`,
                        `Máy chủ chưa xác nhận ${pending.kind === 'buy' ? 'mua thêm lượt' : 'trận Khiêu Chiến'} Bí Cảnh Tông Môn; không gửi lại để tránh lặp trận hoặc mua trùng.`,
                        'war'
                    );
                }
                return true;
            }

            if (!dungeon.opened) {
                if (typeof gc.openGuildDungeonUi !== 'function') {
                    failTienMinhStep(state, 'dungeon-open-api', 'API mở Bí Cảnh Tông Môn chưa sẵn sàng.', 'war');
                    return true;
                }
                try {
                    gc.openGuildDungeonUi();
                    dungeon.opened = true;
                    dungeon.openedAt = now;
                } catch (error) {
                    failTienMinhStep(state, 'dungeon-open-error', `Không thể mở Bí Cảnh Tông Môn: ${error.message || error}`, 'war');
                    return true;
                }
                return true;
            }

            const fightCount = Number(data && data.fight_count);
            const maxCount = Number(data && data.max_count);
            const buyCount = Number(data && data.buy_count);
            if (!data || !Number.isFinite(fightCount) || !Number.isFinite(maxCount) ||
                !Number.isFinite(buyCount)) {
                if (now - dungeon.openedAt >= TIEN_MINH_REQUEST_TIMEOUT_MS) {
                    failTienMinhStep(state, 'dungeon-state-timeout', 'Không tải được trạng thái lượt Bí Cảnh Tông Môn từ máy chủ.', 'war');
                }
                return true;
            }

            if (!dungeon.initialized) {
                dungeon.initialized = true;
                dungeon.freeBattlesRemaining = Math.max(0, maxCount - fightCount);
                if (dungeon.freeBattlesRemaining === 0) {
                    skipTienMinhStep(state, 'dungeon-no-free-turns', 'Bí Cảnh Tông Môn đã hết lượt còn; không mua hoặc Khiêu Chiến thêm.', 'war');
                    return true;
                }
            }

            if (dungeon.freeBattlesRemaining > 0) {
                sendTienMinhDungeonFight(ctx, state, 'free-fight', now, data);
                return true;
            }

            if (!dungeon.paidFightAvailable) {
                if (buyCount > 0) {
                    skipTienMinhStep(state, 'dungeon-paid-already-used', 'Đã có lượt Bí Cảnh mua thêm; không mua thêm lần nữa.', 'war');
                    return true;
                }
                if (typeof gc.getDungeonBuyLoss !== 'function' ||
                    typeof gc.send18057Msg !== 'function') {
                    failTienMinhStep(state, 'dungeon-buy-api', 'API kiểm tra giá/mua lượt Bí Cảnh chưa sẵn sàng.', 'war');
                    return true;
                }
                let cost;
                try {
                    cost = Number(gc.getDungeonBuyLoss());
                } catch (error) {
                    failTienMinhStep(state, 'dungeon-buy-cost-error', `Không thể kiểm tra giá mua lượt Bí Cảnh: ${error.message || error}`, 'war');
                    return true;
                }
                if (cost !== 20) {
                    skipTienMinhStep(state, 'dungeon-buy-cost', `Giá mua lượt Bí Cảnh hiện là ${Number.isFinite(cost) ? cost : 'không xác định'} Tiên Ngọc, không phải 20; không mua.`, 'war');
                    return true;
                }
                dungeon.pending = {
                    kind: 'buy',
                    beforeBuyCount: buyCount,
                    startedAt: now
                };
                try {
                    gc.send18057Msg(1);
                } catch (error) {
                    dungeon.pending = null;
                    failTienMinhStep(state, 'dungeon-buy-error', `Không thể mua lượt Bí Cảnh: ${error.message || error}`, 'war');
                }
                return true;
            }

            sendTienMinhDungeonFight(ctx, state, 'paid-fight', now, data);
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

        function isTienMinhOtherGuildCity(city) {
            const guildId = city && city.gldId;
            const cityId = Number(city && city.cityId);
            const high = Number(guildId && guildId.m_highInt);
            const low = Number(guildId && guildId.m_lowInt);
            return Number.isFinite(cityId) && cityId > 0 &&
                Number.isFinite(high) && Number.isFinite(low) &&
                (high !== 0 || low !== 0);
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
                    logTienMinh(state, `war-fight-${Number(base.doneNums)}`, `✅ [M8 - Tiên Minh - Tỉ Thí Tông Môn] Máy chủ xác nhận lượt Khiêu Chiến tại ${targetType}.`, "action");
                    return true;
                } else if (now - pending.startedAt >= TIEN_MINH_REQUEST_TIMEOUT_MS) {
                    failTienMinhStep(state, 'war-fight-timeout', 'Máy chủ chưa xác nhận lượt Tỉ Thí Tông Môn; không gửi lại để tránh lặp trận.', 'asked');
                    return true;
                } else {
                    return true;
                }
            }

            if (doneCount >= maxCount) {
                skipTienMinhStep(state, 'war-no-turns', 'Tỉ Thí Tông Môn đã hết lượt Khiêu Chiến trong ngày.', 'asked');
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
                const cityIndex = cities.findIndex((city) => city &&
                    (city.isSelf === true || Number(city.isSelf) === 1));
                if (cityIndex < 0) {
                    const availableCities = cities
                        .map((city, index) => ({ city, index }))
                        .filter(({ city }) => isTienMinhNeutralCity(city));
                    if (availableCities.length > 0) {
                        const selected = availableCities[Math.floor(Math.random() * availableCities.length)];
                        state.war.city = selected.city;
                        state.war.cityIndex = selected.index;
                        state.war.targetType = 'neutral';
                        logTienMinh(state, 'war-neutral-city-selected', `ℹ️ [M8 - Tiên Minh - Tỉ Thí Tông Môn] Không có thành trì do Tông Môn chiếm; chọn ngẫu nhiên thành trung lập ${selected.city.cityId}.`, "info");
                    } else {
                        const otherGuildCities = cities
                            .map((city, index) => ({ city, index }))
                            .filter(({ city }) => isTienMinhOtherGuildCity(city));
                        if (otherGuildCities.length === 0) {
                            skipTienMinhStep(state, 'war-no-target-city', 'Tông Môn không chiếm thành và bản đồ không có thành trung lập hoặc thành của Tông Môn khác để Tỉ Thí.', 'asked');
                            return true;
                        }
                        const selected = otherGuildCities[Math.floor(Math.random() * otherGuildCities.length)];
                        state.war.city = selected.city;
                        state.war.cityIndex = selected.index;
                        state.war.targetType = 'other';
                        logTienMinh(state, 'war-other-guild-city-selected', `ℹ️ [M8 - Tiên Minh - Tỉ Thí Tông Môn] Không có thành trì do Tông Môn chiếm hoặc thành trung lập; chọn ngẫu nhiên thành ${selected.city.cityId} của Tông Môn khác.`, "info");
                    }
                } else {
                    state.war.city = cities[cityIndex];
                    state.war.cityIndex = cityIndex;
                    state.war.targetType = 'owned';
                }
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
                startedAt: now
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

        function getTienMinhAskedSignature(data) {
            if (!data) return '';
            return JSON.stringify([
                data.is_active,
                data.damage,
                data.guild_damage,
                data.tar_guild_damage,
                Array.isArray(data.damage_award_ids) ? data.damage_award_ids.length : -1
            ]);
        }

        function handleTienMinhAsked(state, now) {
            const gc = state.guildCtrl;
            const asked = state.asked;
            const model = gc.m_curModel;
            const data = gc.m_curModel && gc.m_curModel.scmd18140Data;
            if (!asked.opened && model && typeof model.getAskedIsOpen === 'function') {
                let isOpenToday;
                try {
                    isOpenToday = model.getAskedIsOpen();
                } catch (error) {
                    failTienMinhStep(state, 'asked-schedule-state', `Không thể kiểm tra lịch mở Tông Môn Vấn Đạo: ${error.message || error}`, 'help');
                    return true;
                }
                if (!isOpenToday) {
                    skipTienMinhStep(state, 'asked-not-scheduled', 'Tông Môn Vấn Đạo không mở theo lịch hôm nay; bỏ qua.', 'help');
                    return true;
                }
            }
            if (asked.pending) {
                const pending = asked.pending;
                const currentData = gc.m_curModel && gc.m_curModel.scmd18140Data;
                if (getTienMinhAskedSignature(currentData) !== pending.signature) {
                    asked.pending = null;
                    asked.count++;
                    state.confirmedActions++;
                    logTienMinh(state, `asked-fight-${asked.count}`, `✅ [M8 - Tiên Minh - Tông Môn Vấn Đạo] Máy chủ xác nhận lượt Khiêu Chiến ${asked.count}/2.`, "action");
                    return true;
                } else if (now - pending.startedAt >= TIEN_MINH_REQUEST_TIMEOUT_MS) {
                    failTienMinhStep(state, 'asked-fight-timeout', 'Máy chủ chưa xác nhận trận Tông Môn Vấn Đạo; không gửi lại để tránh lặp trận.', 'help');
                    return true;
                } else {
                    return true;
                }
            }

            if (!asked.opened) {
                if (typeof gc.openGuildAskedUi !== 'function') {
                    failTienMinhStep(state, 'asked-open-api', 'API mở Tông Môn Vấn Đạo chưa sẵn sàng.', 'help');
                    return true;
                }
                try {
                    gc.openGuildAskedUi();
                    asked.opened = true;
                    asked.openedAt = now;
                } catch (error) {
                    failTienMinhStep(state, 'asked-open-error', `Không thể mở Tông Môn Vấn Đạo: ${error.message || error}`, 'help');
                }
                return true;
            }

            if (!data || !Number.isFinite(Number(data.is_active))) {
                if (now - asked.openedAt >= TIEN_MINH_REQUEST_TIMEOUT_MS) {
                    failTienMinhStep(state, 'asked-state-timeout', 'Không tải được trạng thái Tông Môn Vấn Đạo từ máy chủ.', 'help');
                }
                return true;
            }
            if (Number(data.is_active) !== 1) {
                if (now - asked.openedAt < 1500) return true;
                skipTienMinhStep(state, 'asked-inactive', 'Tông Môn Vấn Đạo hiện không mở; bỏ qua.', 'help');
                return true;
            }
            if (asked.count >= 2) {
                state.phase = 'help';
                return true;
            }

            if (typeof gc.isActBtnSend18140 !== 'boolean' ||
                typeof gc.getAskedChallengeUnitId !== 'function' ||
                typeof gc.send18140 !== 'function') {
                failTienMinhStep(state, 'asked-challenge-api', 'API kiểm tra/Khiêu Chiến Tông Môn Vấn Đạo chưa sẵn sàng.', 'help');
                return true;
            }
            let enabled;
            let challengeUnitId;
            try {
                enabled = gc.isActBtnSend18140;
                challengeUnitId = Number(gc.getAskedChallengeUnitId());
            } catch (error) {
                failTienMinhStep(state, 'asked-challenge-state', `Không đọc được trạng thái nút Khiêu Chiến: ${error.message || error}`, 'help');
                return true;
            }
            if (!enabled) {
                skipTienMinhStep(state, 'asked-no-challenge', 'Nút Khiêu Chiến Tông Môn Vấn Đạo không bật hoặc đã hết lượt.', 'help');
                return true;
            }
            if (!Number.isFinite(challengeUnitId) || challengeUnitId <= 0) {
                failTienMinhStep(state, 'asked-target', 'Không tìm thấy mục tiêu hợp lệ cho Tông Môn Vấn Đạo.', 'help');
                return true;
            }
            asked.pending = {
                signature: getTienMinhAskedSignature(data),
                startedAt: now
            };
            try {
                gc.send18140(challengeUnitId);
            } catch (error) {
                asked.pending = null;
                failTienMinhStep(state, 'asked-challenge-error', `Không thể Khiêu Chiến Tông Môn Vấn Đạo: ${error.message || error}`, 'help');
            }
            return true;
        }

        function getTienMinhHelpSignature(data) {
            if (!data) return '';
            const ids = (list) => Array.isArray(list) ? list.map((item) => item && [
                item.base_id,
                item.item_id,
                item.hero_id,
                item.type_id,
                item.status,
                item.help_status
            ]) : [];
            return JSON.stringify([
                data.count,
                ids(data.my_list),
                ids(data.list)
            ]);
        }

        function getTienMinhUsedHelpIds(data) {
            const ids = new Set();
            const list = data && Array.isArray(data.my_list) ? data.my_list : [];
            for (const item of list) {
                if (!item) continue;
                for (const key of ['base_id', 'item_id', 'hero_id', 'type_id', 'category_id', 'goods_id']) {
                    const id = Number(item[key]);
                    if (Number.isFinite(id) && id > 0) ids.add(id);
                }
            }
            return ids;
        }

        function getTienMinhHelpView(ctx) {
            const manager = ctx.ViewMgr && ctx.ViewMgr.gViewMgr;
            const cache = manager && manager.m_viewCacheGroup;
            return cache && cache.guildHelpUi;
        }

        function getTienMinhHelpCategory(ctx, state, helpData) {
            const manager = ctx.ViewMgr && ctx.ViewMgr.gViewMgr;
            const cache = manager && manager.m_viewCacheGroup;
            const selector = cache && cache.guildHelpSelect;
            if (!selector) return null;
            const usedIds = getTienMinhUsedHelpIds(helpData);
            state.help.usedCategoryIds.forEach((id) => usedIds.add(id));
            const options = [];
            for (let index = 1; index <= 4; index++) {
                const item = selector[`item${index}`];
                const baseData = item && item.m_itemBaseData;
                const id = Number(baseData && baseData.base_id);
                const lock = selector[`lock${index}`];
                if (item && item.visible !== false && Number.isFinite(id) && id > 0 &&
                    !usedIds.has(id) && !(lock && lock.visible)) {
                    options.push(id);
                }
            }
            if (options.length === 0) return null;
            return options[Math.floor(Math.random() * options.length)];
        }

        function handleTienMinhHelp(ctx, state, now) {
            const gc = state.guildCtrl;
            const help = state.help;
            const data = gc.m_curModel && gc.m_curModel.scmd18040Data;
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
                const signature = getTienMinhHelpSignature(data);
                if (pending.kind === 'help-all') {
                    if (Number(data.count) > pending.beforeCount || signature !== pending.signature) {
                        help.pending = null;
                        help.helping = false;
                        state.confirmedActions++;
                        logTienMinh(state, 'help-all-confirmed', "✅ [M8 - Tiên Minh - Viện Trợ] Máy chủ xác nhận đã dùng lượt Viện trợ nhanh cho thành viên.", "action");
                        state.phase = 'fete';
                    } else if (now - pending.startedAt >= TIEN_MINH_REQUEST_TIMEOUT_MS) {
                        failTienMinhStep(state, 'help-all-timeout', 'Máy chủ chưa xác nhận lượt Viện trợ nhanh; không gửi lại để tránh trùng lượt.', 'fete');
                    }
                    return true;
                }
                const changed = signature !== pending.signature;
                if (pending.kind === 'category' && changed) {
                    help.pending = null;
                    help.usedCategoryIds.add(pending.categoryId);
                    help.pending = {
                        kind: 'request',
                        slot: pending.slot,
                        signature,
                        startedAt: now
                    };
                    try {
                        gc.send18043Msg(pending.slot);
                    } catch (error) {
                        help.pending = null;
                        failTienMinhStep(state, 'help-request-error', `Không thể gửi Cầu cứu ô ${pending.slot}: ${error.message || error}`, 'fete');
                    }
                    return true;
                }
                if (pending.kind === 'request' && changed) {
                    help.pending = null;
                    help.slotIndex++;
                    state.confirmedActions++;
                    logTienMinh(state, `help-request-${pending.slot}`, `✅ [M8 - Tiên Minh - Xin Giúp] Máy chủ xác nhận đã gửi Cầu cứu ô ${pending.slot}.`, "action");
                    return true;
                }
                if (now - pending.startedAt >= TIEN_MINH_REQUEST_TIMEOUT_MS) {
                    failTienMinhStep(
                        state,
                        `help-${pending.kind}-timeout`,
                        `Máy chủ chưa xác nhận ${pending.kind === 'category' ? 'chọn loại trợ giúp' : `Cầu cứu ô ${pending.slot}`}; không gửi lại để tránh tạo yêu cầu trùng.`,
                        'fete'
                    );
                }
                return true;
            }

            if (help.slotIndex < 2) {
                const slot = help.slotIndex + 1;
                const view = getTienMinhHelpView(ctx);
                if (!view) {
                    if (now - help.openedAt >= TIEN_MINH_REQUEST_TIMEOUT_MS) {
                        failTienMinhStep(state, 'help-view-timeout', 'Không mở được giao diện Xin Giúp để kiểm tra hai ô yêu cầu.', 'fete');
                    }
                    return true;
                }
                const plus = view && view[`jia${slot - 1}`];
                if (!plus || plus.visible !== true) {
                    help.slotIndex++;
                    logTienMinh(state, `help-slot-${slot}-occupied`, `ℹ️ [M8 - Tiên Minh - Xin Giúp] Ô ${slot} đã được cấu hình hoặc không còn nút +; không tạo yêu cầu trùng.`, "info");
                    return true;
                }
                if (!help.selectingSlot) {
                    if (typeof gc.openGuildHelpSelectUi !== 'function') {
                        failTienMinhStep(state, 'help-select-api', 'API mở danh mục Xin Giúp chưa sẵn sàng.', 'fete');
                        return true;
                    }
                    try {
                        gc.openGuildHelpSelectUi(slot);
                        help.selectingSlot = slot;
                        help.selectStartedAt = now;
                    } catch (error) {
                        failTienMinhStep(state, 'help-select-error', `Không thể mở danh mục Xin Giúp ô ${slot}: ${error.message || error}`, 'fete');
                    }
                    return true;
                }
                const categoryId = getTienMinhHelpCategory(ctx, state, data);
                if (!categoryId) {
                    if (now - help.selectStartedAt >= TIEN_MINH_REQUEST_TIMEOUT_MS) {
                        failTienMinhStep(state, `help-options-${slot}`, `Không có danh mục Xin Giúp khả dụng, không trùng cho ô ${slot}.`, 'fete');
                    }
                    return true;
                }
                if (typeof gc.send18041Msg !== 'function' ||
                    typeof gc.send18043Msg !== 'function') {
                    failTienMinhStep(state, 'help-action-api', 'API chọn danh mục/Cầu cứu chưa sẵn sàng.', 'fete');
                    return true;
                }
                help.pending = {
                    kind: 'category',
                    slot,
                    categoryId,
                    signature: getTienMinhHelpSignature(data),
                    startedAt: now
                };
                help.selectingSlot = 0;
                try {
                    gc.send18041Msg(slot, categoryId);
                } catch (error) {
                    help.pending = null;
                    failTienMinhStep(state, `help-category-error-${slot}`, `Không thể chọn danh mục Xin Giúp ô ${slot}: ${error.message || error}`, 'fete');
                }
                return true;
            }

            const count = Number(data.count);
            const maxCount = Number(data.max_count);
            if (!Number.isFinite(count) || !Number.isFinite(maxCount)) {
                failTienMinhStep(state, 'help-count-state', 'Không đọc được giới hạn lượt Viện Trợ Tông Môn.', 'fete');
                return true;
            }
            if (count >= maxCount) {
                skipTienMinhStep(state, 'help-limit', 'Đã chạm giới hạn lượt Viện trợ Tông Môn trong ngày.', 'fete');
                return true;
            }
            if (data.list.length === 0) {
                skipTienMinhStep(state, 'help-no-requests', 'Không có thành viên nào cần Viện trợ Tông Môn.', 'fete');
                return true;
            }
            if (help.helping) {
                return true;
            }
            if (typeof gc.send18044Msg !== 'function') {
                failTienMinhStep(state, 'help-all-api', 'API Viện trợ nhanh thành viên chưa sẵn sàng.', 'fete');
                return true;
            }
            help.helping = true;
            help.pending = {
                kind: 'help-all',
                slot: 0,
                signature: getTienMinhHelpSignature(data),
                startedAt: now,
                beforeCount: count
            };
            try {
                gc.send18044Msg();
            } catch (error) {
                help.pending = null;
                failTienMinhStep(state, 'help-all-error', `Không thể Viện trợ nhanh thành viên: ${error.message || error}`, 'fete');
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
                    logTienMinh(state, 'fete-confirmed', "✅ [M8 - Tiên Minh - Tổ Sư Đường] Máy chủ xác nhận đã Cung phụng Dâng Tôn Sư.", "action");
                    state.phase = 'done';
                } else if (now - pending.startedAt >= TIEN_MINH_REQUEST_TIMEOUT_MS) {
                    failTienMinhStep(state, 'fete-timeout', 'Máy chủ chưa xác nhận Cung phụng Dâng Tôn Sư.', 'done');
                }
                return true;
            }

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
                skipTienMinhStep(state, 'fete-already-done', 'Cung phụng Dâng Tôn Sư không còn khả dụng hoặc đã hoàn tất.', 'done');
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
            state.phase = 'done';
            state.finalized = true;
            if (state.failed) {
                sendLog(`⚠️ [M8 - Tiên Minh] Đã kiểm tra xong; ${state.confirmedActions} thao tác được xác nhận, ${state.skippedSteps} bước đã bỏ qua. Có bước chưa được máy chủ xác nhận.`, "err");
            } else if (state.confirmedActions > 0) {
                sendLog(`✅ [M8 - Tiên Minh] Đã kiểm tra xong; máy chủ xác nhận ${state.confirmedActions} thao tác, ${state.skippedSteps} bước đã hoàn tất/không khả dụng.`, "action");
            } else {
                sendLog(`ℹ️ [M8 - Tiên Minh] Đã kiểm tra trạng thái; không có thao tác nào cần thực hiện (${state.skippedSteps} bước đã hoàn tất/không khả dụng).`, "info");
            }
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
                    sendLog("⚠️ [M8 - Tiên Minh] Không tìm thấy bộ điều khiển Bang Hội; chưa thể chạy các công việc.", "err");
                }
                return true;
            }
            tienMinhControllerUnavailableLogged = false;

            const dayKey = new Date().toDateString();
            if (!tienMinhState || tienMinhState.dayKey !== dayKey ||
                tienMinhState.guildCtrl !== gc) {
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

            if (state.phase === 'bargain') return handleTienMinhBargain(state, Date.now());
            if (state.phase === 'dungeon') return handleTienMinhDungeon(ctx, state, Date.now());
            if (state.phase === 'war') return handleTienMinhWar(state, Date.now(), ctx);
            if (state.phase === 'asked') return handleTienMinhAsked(state, Date.now());
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

        function handleDailyRoutine(ctx) {
            try {
                // 1. Trợ chiến linh thú
                if (CONFIG.activeFeature === 'autoTroChien' && ctx.LinhThuCtrl && ctx.LinhThuCtrl.gInst) {
                    const lt = ctx.LinhThuCtrl.gInst();
                    if (typeof lt.claimAllRefund === 'function') {
                        lt.claimAllRefund();
                        sendLog("🐾 [M8 - Trợ Chiến] Đã nhận nhanh toàn bộ Linh Thú tab Hoàn!", "action");
                    }
                }
                // 2. Tâm Tiên Đài
                if (CONFIG.activeFeature === 'autoTamTienDai') {
                    return handleTamTienDai(ctx);
                }
                // 3. Tiên Hữu (Bạn bè)
                if (CONFIG.activeFeature === 'autoTienHuu') {
                    return handleTienHuu(ctx);
                }
                // 4. Tiên Minh (Bang Hội)
                if (CONFIG.activeFeature === 'autoTienMinh') {
                    return handleTienMinh(ctx);
                }
                // 5. Cuối Ngày (Thư, Like BXH, Sôi Nổi)
                if (CONFIG.activeFeature === 'autoCuoiNgay') {
                    return handleCuoiNgay(ctx);
                }
                return false;
            } catch (error) {
                const message = error && error.message ? error.message : String(error);
                if (message !== lastDailyRoutineError) {
                    sendLog(`⚠️ [M8 - Hoạt động ngày] Lỗi xử lý: ${message}`, "err");
                    lastDailyRoutineError = message;
                }
                return false;
            }
        }
