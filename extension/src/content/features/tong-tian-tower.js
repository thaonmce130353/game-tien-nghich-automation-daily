        function getNextDungeonId(ctx, dungeonType) {
            const dd = ctx.DailyDungeonCtrl.gInst();
            if (!dd) return 0;

            let curId = 0;
            if (typeof dd.gCurDgnId === 'function') curId = dd.gCurDgnId(dungeonType);
            if ((!curId || curId <= 0) && typeof dd.gTJDgnBaseId === 'function') curId = dd.gTJDgnBaseId(dungeonType);
            if ((!curId || curId <= 0) && dd.dungeonDataDic && dd.dungeonDataDic[dungeonType]) {
                const dData = dd.dungeonDataDic[dungeonType];
                const lastId = dData.maxPassDungeonId || 0;
                if (lastId > 0 && typeof dd.gBaseCfg === 'function') {
                    const cfg = dd.gBaseCfg(lastId);
                    if (cfg && cfg.next_id) curId = cfg.next_id;
                } else if (typeof dd.gDgnBaseTypeArr === 'function') {
                    const arr = dd.gDgnBaseTypeArr(dungeonType);
                    if (arr && arr[0]) curId = arr[0].id;
                }
            }
            if ((!curId || curId <= 0) && typeof dd.send11004 === 'function') dd.send11004(dungeonType);
            return curId || 0;
        }

        const TOWER_MAX_ATTEMPTS = 10;

        function towerClimbActive() {
            return CONFIG.running && CONFIG.activeFeature === 'autoTongTian' && !CONFIG.towerSweepOnly;
        }

        // Hẹn giờ tự đánh tiếp của game được lấy theo tên lúc đặt giờ (timesCall(..., this.toSendAutoFight, this)), nên bọc trên prototype có tác dụng.
        // Ngoài lúc mình đang leo: chạy hàm gốc (người chơi có Chiến Lệnh thật vẫn dùng được nút tự đánh của game).
        function towerAutoChainGuardInstall(ctx) {
            const proto = ctx.RunningManUi && ctx.RunningManUi.prototype;
            if (!proto || proto.__tnNoAutoChain || typeof proto.toSendAutoFight !== 'function') return;
            const orig = proto.toSendAutoFight;
            proto.toSendAutoFight = function () {
                if (towerClimbActive()) { try { if (typeof this.removeTimeLogic === 'function') this.removeTimeLogic(); } catch (e) { } return; }
                return orig.apply(this, arguments);
            };
            proto.__tnNoAutoChain = true;
        }

        // Tầng đang chờ kết quả: { id, sentAt }. Hết chờ khi máy chủ cho biết kết quả (thắng: tầng kế tiếp đổi; thua: bảng thua;
        // từ chối: phản hồi 11001 res=0) thay cho khóa cố định 2,2s; sau đó nghỉ ngắn ngẫu nhiên rồi mới khiêu chiến tiếp.
        const TOWER_RESULT_TIMEOUT_MS = 6000;
        let towerPending = null;
        let towerNextAt = 0;

        // Gọi khi dừng Auto: trả cờ của game về tắt (không để game ở chế độ tự đánh tiếp sau khi mình ngừng leo).
        function towerClimbStop() {
            towerPending = null;
            towerNextAt = 0;
            try { const dd = window.DailyDungeonCtrl && window.DailyDungeonCtrl.gInst(); if (dd) dd.openRunManAutoFight = false; } catch (e) { }
        }

        // 1. TỰ ĐỘNG LEO THÔNG THIÊN THÁP
        function handleTongTianTower(ctx) {
            if (!CONFIG.autoTongTian) return false;
            try {
                const ddCtrl = ctx.DailyDungeonCtrl.gInst();
                if (!ddCtrl) return false;

                // Cờ openRunManAutoFight giữ game ở màn tháp (không chuyển cảnh trận, không mở lại màn tháp + 15008/12321/11004 sau mỗi trận,
                // không hiện bảng thắng). Game tự tắt cờ sau mỗi trận thua (canelAutoFight) nên đặt lại mỗi nhịp.
                // Nhưng chỉ vòng leo của mình khiêu chiến: hẹn giờ tự đánh tiếp của game (RunningManUi.toSendAutoFight -> inRManFight(1),
                // chế độ cần Chiến Lệnh thật) bị vô hiệu trong lúc leo (towerAutoChainGuardInstall).
                towerAutoChainGuardInstall(ctx);
                ddCtrl.openRunManAutoFight = true;

                const towerType = (ctx.DailyDungeonConst && ctx.DailyDungeonConst.dailyDungeonType && ctx.DailyDungeonConst.dailyDungeonType.runningMan) || 1;
                const now = Date.now();
                let lossShown = false;

                if (ctx.ViewMgr && ctx.ViewMgr.gInst) {
                    const vm = ctx.ViewMgr.gInst();
                    // Sau trận thua game mở bảng thua (thắng thì không, nhờ cờ trên): đóng trước khi khiêu chiến tầng kế (không gửi gì).
                    ['fightSuccessUi', 'fightFailUi'].forEach((n) => {
                        try { if (vm.viewIsVisible(n)) { vm.closeView(n); if (n === 'fightFailUi') lossShown = true; } } catch (e) { }
                    });
                }

                // Đang chờ kết quả tầng vừa khiêu chiến.
                if (towerPending) {
                    const reply = typeof netLastReply === 'function' ? netLastReply(11001) : null;
                    const refused = reply && reply.at >= towerPending.sentAt && reply.data && reply.data.res === 0;
                    let won = false;
                    const replied = Boolean(reply && reply.at >= towerPending.sentAt);
                    try { const next = ddCtrl.gCurDgnId(towerType); won = replied && next > 0 && next !== towerPending.id; } catch (e) { }
                    // Thua: bảng thua thường bị bộ xử lý trận chung đóng trước khi nhịp này thấy, nên đọc kết quả trận:
                    // khung trận 14002 đã về, game báo không thắng, và 300ms sau vẫn không có làm mới tầng (thắng) -> thua.
                    if (!won && !lossShown) {
                        const frame = netLastReply(14002);
                        if (frame && frame.at >= towerPending.sentAt && now - frame.at > 300) {
                            try { const fc = ctx.FightCtrl && ctx.FightCtrl.gInst(); if (fc && fc.getIsFightSuccess() === false) lossShown = true; } catch (e) { }
                        }
                    }
                    const timedOut = now - towerPending.sentAt > TOWER_RESULT_TIMEOUT_MS;
                    if (!won && !lossShown && !refused && !timedOut) return 'wait';
                    if (won) clearTargetAttempts(`tower-${towerPending.id}`);
                    // Đo thời gian từng bước (chỉ hiện khi bật "Log chi tiết"): 11001 = máy chủ nhận khiêu chiến, 14002 = khung trận, 11004 = làm mới tầng.
                    try {
                        const t0 = towerPending.sentAt;
                        const ms = (c) => { const r = netLastReply(c); return r && r.at >= t0 ? (r.at - t0) + 'ms' : '-'; };
                        sendLog(`⏱ [Thông Thiên Tháp] #${towerPending.id} ${won ? 'thắng' : (lossShown ? 'thua' : (refused ? 'từ chối' : 'hết giờ'))}: 11001 ${ms(11001)}, 14002 ${ms(14002)}, 11004 ${ms(11004)}, kết quả ${now - t0}ms`, 'info');
                    } catch (e) { }
                    towerPending = null;
                    towerNextAt = now + humanDelay(650);      // nghỉ ngắn ngẫu nhiên (đôi khi dài hơn) như người bấm tiếp
                    return 'wait';
                }
                if (now < towerNextAt) return 'wait';
                isTowerChallenging = false;
                waitingForFloorUpdate = false;

                if (ctx.ViewMgr && ctx.ViewMgr.gInst) {
                    const vm = ctx.ViewMgr.gInst();
                    // Tên view thật là chữ thường đầu (babelEntraceUi); tên sai làm điều kiện luôn sai -> mở lại màn tháp
                    // mỗi thao tác, mỗi lần kéo theo 15008 + 12321 + 11004.
                    const isTowerOpen = vm.viewIsVisible && (vm.viewIsVisible('babelEntraceUi') || vm.viewIsVisible('runningManUi'));
                    if (!isTowerOpen && typeof ddCtrl.opSCpCyUi === 'function') { ddCtrl.opSCpCyUi(0, false); return false; }
                }

                const curDgnId = getNextDungeonId(ctx, towerType);
                if (curDgnId <= 0) return false;
                if (failCounts[curDgnId] >= TOWER_MAX_ATTEMPTS) {
                    logUnsupportedOnce(`tower-rejected-${curDgnId}`, `⏸️ [Thông Thiên Tháp] Máy chủ từ chối tầng #${curDgnId} ${TOWER_MAX_ATTEMPTS} lần; dừng khiêu chiến trong lượt Auto này.`);
                    return false;
                }
                if (!tryAttemptTarget(`tower-${curDgnId}`, `[Thông Thiên Tháp] Tầng #${curDgnId}`, TOWER_MAX_ATTEMPTS)) return false;

                if (typeof netTapInstall === 'function') netTapInstall();
                if (typeof ddCtrl.sRMFightData === 'function') ddCtrl.sRMFightData(curDgnId);
                towerPending = { id: curDgnId, sentAt: now };
                ddCtrl.send11001(curDgnId, 0);
                sendLog(`🗼 [Thông Thiên Tháp] Đang khiêu chiến tầng #${curDgnId}...`, "action");
                return true;
            } catch (e) {
                towerPending = null;
            }
            return false;
        }
