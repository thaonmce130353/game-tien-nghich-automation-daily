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
                            t.type === n.runningMan ||
                            t.type === n.ymAbyss ||
                            t.type === n.adventure ||
                            (t.type >= n.singCamp_wei && t.type <= n.singCamp_qun)
                        )) || (tienMinhActive && (
                            t.type === n.guild ||
                            t.type === n.gldWr ||
                            t.type === n.guildAsked
                        ));
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
                    // Thủ Vệ Tứ Phái cũng tự xử lý bảng đội hình của nó (sect-defense.js).
                    if (CONFIG.activeFeature !== 'autoTienMinh' && CONFIG.activeFeature !== 'autoSectDefense' &&
                        vm.viewIsVisible && vm.viewIsVisible('embattleUi')) {
                        const embUi = vm.getViewByName('embattleUi');
                        if (embUi) {
                            if (typeof embUi.oneKeyEmbattleLogic === 'function') embUi.oneKeyEmbattleLogic(0);
                            if (typeof embUi.saveEmbattleLogic === 'function') embUi.saveEmbattleLogic();
                            if (typeof embUi.cBtnH2 === 'function') {
                                embUi.cBtnH2();
                                sendLog("🌌 [Vực U Minh] Đã tự động chọn đội hình & bấm BẮT ĐẦU!", "action");
                                acted = true;
                            }
                        }
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
