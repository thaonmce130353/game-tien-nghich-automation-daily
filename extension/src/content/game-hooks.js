        let embattleHookState = null;      // trạng thái xếp đội hình của bộ xử lý trận đánh chung (xem embattleStep)

        function hookRecharge(ctx) {
            if (!ctx.RechargeCtrl) return;
            try {
                const rcProto = ctx.RechargeCtrl.prototype;
                if (!rcProto.__tnHooked) {
                    rcProto.__tnHooked = true;
                    rcProto.bBuyTermById = function (t) { return true; };
                    rcProto.openAutoFight = function (t) { return true; };
                }
            } catch (e) { }

            if (ctx.GlobalCtrl && ctx.GlobalCtrl.prototype) {
                const gProto = ctx.GlobalCtrl.prototype;
                if (!gProto.__tnHookedErr) {
                    gProto.__tnHookedErr = true;
                    const origShowErr = gProto.showErrorMsg;
                    gProto.showErrorMsg = function (msg) {
                        if (typeof msg === 'string' && (msg.includes('chiến lệnh') || msg.includes('81891') || msg.includes('chưa mua'))) {
                            return;
                        }
                        if (origShowErr) origShowErr.apply(this, arguments);
                    };
                }
            }
        }

        const skipUnlistedLogged = {};     // loại trận chưa bỏ qua đã được ghi chẩn đoán (mỗi loại một lần)

        // Hook FightCtrl: TỰ ĐỘNG SKIP KHIÊU CHIẾN CHO MỌI PHỤ BẢN & ĐẤU TRƯỜNG
        function hookFightCtrl(ctx) {
            if (!ctx.FightCtrl) return;
            const fcProto = ctx.FightCtrl.prototype;
            if (fcProto.__tnHookedSkip) return;
            fcProto.__tnHookedSkip = true;

            const origRecvFightFrame = fcProto.recvFightFrame;
            fcProto.recvFightFrame = function (t) {
                const tienMinhActive = CONFIG.running && CONFIG.activeFeature === 'autoTienMinh';
                if ((CONFIG.autoSkipFight || tienMinhActive) && t) {
                    const n = ctx.FightConst && ctx.FightConst.ERoundFightType;
                    if (n) {
                        const isSkippable = (CONFIG.autoSkipFight && (
                            t.type === n.dungeon ||
                            t.type === n.endlessTrial ||     // Thủ Vệ Tứ Phái (ETCtrl)
                            t.type === n.runningMan ||
                            t.type === n.ymAbyss ||
                            t.type === n.adventure ||
                            t.type === n.jyzd ||
                            t.type === n.hangup ||
                            // Bí Cảnh Tứ Quốc (M2) và Thí Luyện banner (superHeroEncore) do tính năng của extension tự khiêu chiến.
                            (n.fairyland_wei !== undefined && t.type >= n.fairyland_wei && t.type <= n.fairyland_qun) ||
                            t.type === n.superHeroEncore ||
                            (t.type >= n.singCamp_wei && t.type <= n.singCamp_qun)
                        )) || (tienMinhActive && (
                            t.type === n.guild ||
                            t.type === n.gldWr ||
                            t.type === n.guildAsked
                        ));
                        if (!isSkippable && CONFIG.running && CONFIG.autoSkipFight && !skipUnlistedLogged[t.type]) {
                            // Chẩn đoán: trận thuộc loại chưa nằm trong danh sách bỏ qua sẽ chạy đủ hoạt ảnh (chậm). Ghi tên loại một lần.
                            skipUnlistedLogged[t.type] = true;
                            sendLog(`ℹ️ [Bỏ qua trận] Loại trận ${t.type} (${n[t.type] || '?'}) chưa có trong danh sách bỏ qua nên chạy đủ hoạt ảnh.`, "info");
                        }
                        if (isSkippable) {
                            const showed = this.executeShowRoundFight(t, true);
                            if (showed) {
                                this.m_roundFightData = t;
                                this.executeFinishFight(true);
                                return;
                            }
                        }
                    }
                }
                return origRecvFightFrame.apply(this, arguments);
            };
        }

        // Hook đồng bộ dữ liệu Thông Thiên Tháp & Phụ Bản
        function hookDailyDungeonCtrl(ctx) {
            if (!ctx.DailyDungeonCtrl) return;
            const ddProto = ctx.DailyDungeonCtrl.prototype;
            if (ddProto.__tnTowerHooked) return;
            ddProto.__tnTowerHooked = true;

            const origOn11009 = ddProto.on11009;
            ddProto.on11009 = function (t) {
                try {
                    const netData = t && t.netData;
                    if (netData && netData.res === 1) {
                        const passedId = netData.dungeon_id || 0;
                        isTowerChallenging = false;
                        waitingForFloorUpdate = false;
                        if (passedId > 0) {
                            lastPassedFloor = passedId;
                            sendLog(`🎉 Vượt ải thành công: #${passedId}!`, "action");
                        }
                    }
                } catch (e) { }

                if (origOn11009) origOn11009.apply(this, arguments);
            };

            const origOn11004 = ddProto.on11004;
            ddProto.on11004 = function (t) {
                try {
                    const netData = t && t.netData;
                    if (netData) {
                        const maxPassed = netData.max_pass_dungoen_id || netData.dungeon_id || netData.cur_id || 0;
                        if (maxPassed > 0) lastPassedFloor = maxPassed;
                        isTowerChallenging = false;
                        waitingForFloorUpdate = false;
                    }
                } catch (e) { }

                if (origOn11004) origOn11004.apply(this, arguments);
            };

            const origOn11001 = ddProto.on11001;
            ddProto.on11001 = function (t) {
                try {
                    const netData = t && t.netData;
                    if (netData && netData.res !== undefined && netData.res !== 1) {
                        isTowerChallenging = false;
                        waitingForFloorUpdate = false;
                        // Máy chủ từ chối khiêu chiến (res 0): đếm lỗi theo ải để các tính năng leo ải ngừng gửi lại.
                        const rejectedId = this.fightId;
                        if (CONFIG.running && rejectedId > 0) {
                            failCounts[rejectedId] = (failCounts[rejectedId] || 0) + 1;
                            sendLog(`⚠️ Máy chủ từ chối khiêu chiến ải #${rejectedId}${netData.msg ? ` (${netData.msg})` : ''}.`, "warn");
                        }
                    }
                } catch (e) { }

                if (origOn11001) origOn11001.apply(this, arguments);
            };
        }

        function hookGameEvents(ctx) {
            hookRecharge(ctx);
            hookDailyDungeonCtrl(ctx);
            hookFightCtrl(ctx);
        }

        // Xử lý bỏ qua trận đánh, tự xếp đội hình, tự bắt đầu & đóng popup
        function handleBattle(ctx) {
            let acted = false;
            try {
                if (CONFIG.autoSkipFight && ctx.DailyDungeonCtrl && ctx.DailyDungeonCtrl.gInst) {
                    const dd = ctx.DailyDungeonCtrl.gInst();
                    dd.openRunManAutoFight = true;
                    dd.saveAlertRunManAutoFight = true;
                }

                if (CONFIG.maxSpeed && ctx.FightCtrl && ctx.FightCtrl.gInst) {
                    const fc = ctx.FightCtrl.gInst();
                    if (fc.speed && fc.speed < 3) fc.speed = 3;
                }

                if (ctx.ViewMgr && ctx.ViewMgr.gInst) {
                    const vm = ctx.ViewMgr.gInst();

                    if (vm.viewIsVisible && (vm.viewIsVisible('ymAbyssChallengeUi') || vm.viewIsVisible('YMAbyssChallengeUi'))) {
                        const chUi = vm.getViewByName('ymAbyssChallengeUi') || vm.getViewByName('YMAbyssChallengeUi');
                        if (chUi && typeof chUi.onClick === 'function') {
                            chUi.onClick();
                            sendLog("🌌 [Vực U Minh] Đã tự động bấm Khiêu Chiến từ bảng ải!", "action");
                            acted = true;
                        }
                    }

                    // Tiên Minh tự xử lý bảng đội hình trong daily-routines.js (có giới hạn và log riêng).
                    // Thủ Vệ Tứ Phái, Cực Âm Địa (M4) tự xử lý bảng đội hình của chúng (sect-defense.js, extreme-yin.js).
                    if (!['autoTienMinh', 'autoSectDefense', 'autoOtherTrials', 'autoExtremeYin', 'autoDailyDungeon'].includes(CONFIG.activeFeature) &&
                        vm.viewIsVisible && vm.viewIsVisible('embattleUi')) {
                        const embUi = vm.getViewByName('embattleUi');
                        if (embUi) {
                            // Bấm "Lên trận nhanh", kiểm tra ô đội hình có tướng, mới bấm "Bắt đầu".
                            if (!embattleHookState) embattleHookState = { at: 0, clicked: 0, starts: 0 };
                            const step = embattleStep(embUi, embattleHookState, Date.now());
                            if (step === 'arranged') {
                                acted = true;
                            } else if (step === 'ready' && typeof embUi.cBtnH2 === 'function') {
                                embattleMarkStarted(embattleHookState);
                                embUi.cBtnH2();
                                sendLog("🌌 [Vực U Minh] Đã xếp đội hình & bấm BẮT ĐẦU!", "action");
                                acted = true;
                            } else if (step === 'failed') {
                                const diag = embattleDiagnose(embUi, embattleHookState);
                                embattleHookState = null;
                                try { vm.closeView('embattleUi'); } catch (e) { }
                                sendLog(`❌ [Đội hình] Không xếp được đội hình (${diag}); không bắt đầu trận.`, "error");
                                acted = true;
                            }
                        }
                    } else if (!(vm.viewIsVisible && vm.viewIsVisible('embattleUi'))) {
                        embattleHookState = null;
                    }

                    const resultViewNames = [
                        'fightSuccessUi', 'fightFailUi', 'winUi', 'fightWinUi', 'fightResultUi', 'adventureResultUi', 'guildAskedFightResultUi'
                    ];

                    resultViewNames.forEach(name => {
                        if (vm.viewIsVisible && vm.viewIsVisible(name)) {
                            vm.closeView(name);
                            acted = true;
                        }
                    });
                }
            } catch (e) { }
            return acted;
        }
