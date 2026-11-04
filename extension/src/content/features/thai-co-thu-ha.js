
        // Thái Cổ Thu Hà (DoubleTeamDungeonCtrl, doubleTeamDungeonUi; BXH: RankCtrl, rankListHallUi, RankType.dtd)
        // Mỗi nhịp một việc, máy trạng thái thaiCoState.phase:
        //   open -> sweep -> rank -> done
        //   - open: mở màn Thái Cổ Thu Hà, đợi máy chủ trả dữ liệu (send32080 -> sc32080).
        //   - sweep: "Quét tầng trước" tối đa 2 lần MIỄN PHÍ (send32084(pass_dungeon_uid), chỉ khi checkSweepRed() còn lượt
        //     miễn phí; nhánh trả Tiên Ngọc của nút quét KHÔNG BAO GIỜ được gửi). Xác nhận khi sweep_count tăng.
        //   - rank: mở BXH (rankListHallUi), thả Like top 1-3 (send15006(type, hạng)); xác nhận khi getCanWorship chuyển sang false.
        // Chỉ ghi "đã" khi dữ liệu máy chủ xác nhận; thiếu phản hồi thì báo lỗi, không gửi lại.
        const THAI_CO_REQUEST_TIMEOUT_MS = 15000;
        const THAI_CO_SWEEPS = 2;
        const THAI_CO_LIKE_TOP = 3;
        let thaiCoState = null;
        let thaiCoDidSend = false;     // nhịp này đã gửi yêu cầu thật (nếu không: chỉ chờ, scheduler kiểm tra lại ngay)

        function createThaiCoState() {
            return {
                dayKey: new Date().toDateString(),
                phase: 'open',
                failed: false,
                opened: false,
                refreshing: null,
                swept: 0,
                sweepPending: null,        // { before, id, at }
                rankOpened: false,
                rankRefreshing: null,
                likes: 0,
                likeRank: 1,
                likePending: null,         // { rank, at }
                summarized: false
            };
        }

        function thaiCoFail(s, message, nextPhase) {
            sendLog(`❌ [Thái Cổ Thu Hà] ${message}`, "error");
            s.failed = true;
            s.refreshing = null;
            s.phase = nextPhase;
        }

        function thaiCoCloseViews(vm) {
            ['rankListHallUi', 'doubleTeamDungeonUi'].forEach((name) => {
                try { if (vm.viewIsVisible(name)) vm.closeView(name); } catch (e) { }
            });
        }

        function thaiCoStepOpen(ctx, ctrl, vm, s, now) {
            try {
                if (ctx.FunOpenCtrl && ctx.FunOpenType && ctx.FunOpenType.MT !== undefined &&
                    !ctx.FunOpenCtrl.gInst().check(ctx.FunOpenType.MT, false)) {
                    sendLog("ℹ️ [Thái Cổ Thu Hà] Chức năng chưa mở khóa; bỏ qua.", "info");
                    s.phase = 'done';
                    return;
                }
            } catch (e) { }
            if (!s.opened) {
                s.opened = true;
                thaiCoDidSend = true;
                ctrl.openDoubleTeamDungeonUi();
                return;
            }
            const r = pollTowerDailyRefresh(s, 'refreshing', now, () => { thaiCoDidSend = true; ctrl.send32080(); }, () => ctrl.sc32080);
            if (r === 'wait') return;
            if (r !== 'ready') { thaiCoFail(s, "Máy chủ chưa trả dữ liệu Thái Cổ Thu Hà; bỏ qua cả hai bước.", 'done'); return; }
            s.phase = 'sweep';
        }

        function thaiCoStepSweep(ctrl, s, now) {
            const sc = ctrl.sc32080;
            if (!sc) { thaiCoFail(s, "Không đọc được dữ liệu quét tầng; bỏ qua quét tầng.", 'rank'); return; }
            const total = Number(ctrl.getCurlModel().getBaseCfg().day_mop_up_time) || 0;
            if (s.sweepPending) {
                const p = s.sweepPending;
                if (Number(sc.sweep_count) > p.before) {
                    s.sweepPending = null;
                    s.swept++;
                    sendLog(`✅ [Thái Cổ Thu Hà] Máy chủ xác nhận đã quét tầng trước #${p.id} (đã quét ${sc.sweep_count}/${total} lượt miễn phí).`, "result");
                } else if (now - p.at >= THAI_CO_REQUEST_TIMEOUT_MS) {
                    s.sweepPending = null;
                    thaiCoFail(s, `Đã gửi quét tầng #${p.id} nhưng máy chủ chưa xác nhận; không gửi lại.`, 'rank');
                }
                return;
            }
            // Chỉ nhánh miễn phí: checkSweepRed() = đã qua tầng nào đó và còn lượt quét miễn phí trong ngày.
            if (s.swept >= THAI_CO_SWEEPS || !ctrl.checkSweepRed() || !(Number(sc.pass_dungeon_uid) > 0)) {
                sendLog(s.swept
                    ? `ℹ️ [Thái Cổ Thu Hà] Đã quét tầng trước ${s.swept} lần miễn phí; chuyển sang BXH.`
                    : `ℹ️ [Thái Cổ Thu Hà] Không còn lượt quét miễn phí hoặc chưa qua tầng nào (đã quét ${sc.sweep_count}/${total}); không quét, không mua.`, "info");
                s.phase = 'rank';
                return;
            }
            s.sweepPending = { before: Number(sc.sweep_count) || 0, id: sc.pass_dungeon_uid, at: now };
            thaiCoDidSend = true;
            ctrl.send32084(sc.pass_dungeon_uid);
            sendLog(`🌊 [Thái Cổ Thu Hà] Quét tầng trước #${sc.pass_dungeon_uid} (lượt miễn phí ${(Number(sc.sweep_count) || 0) + 1}/${total})...`, "action");
        }

        function thaiCoStepRank(ctx, vm, s, now) {
            const rc = ctx.RankCtrl && ctx.RankCtrl.gInst && ctx.RankCtrl.gInst();
            const type = ctx.RankConst && ctx.RankConst.RankType && ctx.RankConst.RankType.dtd;
            const model = rc && typeof rc.getCurlModel === 'function' ? rc.getCurlModel() : null;
            if (!rc || type === undefined || !model || typeof rc.send15006 !== 'function' || typeof rc.send15001 !== 'function' ||
                typeof model.getCanWorship !== 'function' || typeof rc.showRankListUi !== 'function') {
                thaiCoFail(s, "API BXH/Like chưa sẵn sàng; bỏ qua Like BXH.", 'done');
                return;
            }
            const dataOf = () => { try { return model.getRankDataByType(type); } catch (e) { return undefined; } };
            if (!s.rankOpened) {
                s.rankOpened = true;
                thaiCoDidSend = true;
                rc.showRankListUi(type);
                sendLog("ℹ️ [Thái Cổ Thu Hà - BXH] Đã mở BXH; đang tải danh sách.", "info");
                return;
            }
            if (!s.rankLoaded) {
                const r = pollTowerDailyRefresh(s, 'rankRefreshing', now, () => { thaiCoDidSend = true; rc.send15001(type); }, dataOf);
                if (r === 'wait') return;
                const d = dataOf();
                if (r !== 'ready' || !d || !Array.isArray(d.list)) { thaiCoFail(s, "Máy chủ chưa trả danh sách BXH Thái Cổ Thu Hà; không Like.", 'done'); return; }
                s.rankLoaded = true;
                return;
            }
            if (s.likePending) {
                const p = s.likePending;
                if (!model.getCanWorship(type, p.rank)) {
                    s.likePending = null;
                    s.likes++;
                    sendLog(`✅ [Thái Cổ Thu Hà - BXH] Máy chủ xác nhận đã Like hạng ${p.rank}.`, "result");
                    s.likeRank++;
                } else if (now - p.at >= THAI_CO_REQUEST_TIMEOUT_MS) {
                    s.likePending = null;
                    sendLog(`⚠️ [Thái Cổ Thu Hà - BXH] Đã gửi Like hạng ${p.rank} nhưng máy chủ chưa xác nhận; không gửi lại.`, "warn");
                    s.failed = true;
                    s.likeRank++;
                }
                return;
            }
            const maxLike = Math.min(THAI_CO_LIKE_TOP, Number(model.getMaxZanCount(type)) || 1);
            if (s.likeRank > maxLike) { s.phase = 'done'; return; }
            const rank = s.likeRank;
            if (!model.getCanWorship(type, rank)) {
                logOnce(`thai-co-like-${rank}`, `ℹ️ [Thái Cổ Thu Hà - BXH] Hạng ${rank} không Like được (đã Like hoặc hết lượt hôm nay); bỏ qua.`, "info");
                s.likeRank++;
                return;
            }
            s.likePending = { rank, at: now };
            thaiCoDidSend = true;
            rc.send15006(type, rank);        // giống nút Like của BXH (RankListZanUi.onClickZanBtn)
            sendLog(`👍 [Thái Cổ Thu Hà - BXH] Like hạng ${rank}...`, "action");
        }

        // Trả về: true (đã gửi/hành động thật) | 'wait' (chỉ chờ máy chủ/chuyển bước) | false.
        function handleThaiCoThuHa(ctx) {
            try {
                if (!ctx.DoubleTeamDungeonCtrl || !ctx.DoubleTeamDungeonCtrl.gInst || !ctx.ViewMgr || !ctx.ViewMgr.gInst) {
                    logUnsupportedOnce('thai-co', "⚠️ [Thái Cổ Thu Hà] Game chưa sẵn sàng (DoubleTeamDungeonCtrl); bỏ qua.");
                    return false;
                }
                const dayKey = new Date().toDateString();
                if (!thaiCoState || thaiCoState.dayKey !== dayKey) {
                    thaiCoState = createThaiCoState();
                    sendLog("🌊 [Thái Cổ Thu Hà] Bắt đầu: quét tầng trước 2 lần miễn phí rồi Like top 3 BXH.", "action");
                }
                const s = thaiCoState;
                const ctrl = ctx.DoubleTeamDungeonCtrl.gInst();
                const vm = ctx.ViewMgr.gInst();
                const now = Date.now();
                if (s.phase === 'done') {
                    // Nhịp "done": đóng các màn đã mở rồi ghi tổng kết một lần.
                    thaiCoCloseViews(vm);
                    if (!s.summarized) {
                        s.summarized = true;
                        sendLog(`${s.failed ? '⚠️' : '✅'} [Thái Cổ Thu Hà] Xong: quét tầng ${s.swept}/${THAI_CO_SWEEPS}, Like BXH ${s.likes}/${THAI_CO_LIKE_TOP}.`, s.failed ? "warn" : "result");
                    }
                    return false;
                }
                thaiCoDidSend = false;
                if (s.phase === 'open') thaiCoStepOpen(ctx, ctrl, vm, s, now);
                else if (s.phase === 'sweep') thaiCoStepSweep(ctrl, s, now);
                else if (s.phase === 'rank') thaiCoStepRank(ctx, vm, s, now);
                return thaiCoDidSend ? true : 'wait';
            } catch (e) {
                sendLog(`❌ [Thái Cổ Thu Hà] Lỗi: ${e && e.message || e}`, "error");
                if (thaiCoState) { thaiCoState.failed = true; thaiCoState.phase = 'done'; }
                return false;
            }
        }
