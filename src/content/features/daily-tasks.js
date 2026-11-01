        function handleDailyTasks(ctx) {
            if (!CONFIG.autoDailyTask) return false;
            const now = Date.now();

            const acvCtrl = ctx.AcvCtrl && ctx.AcvCtrl.gInst ? ctx.AcvCtrl.gInst() : null;
            if (!acvCtrl) return false;

            if (now - lastTaskQueryTime > 20000 || !acvCtrl.taskDt) {
                lastTaskQueryTime = now;
                if (acvCtrl.send30501) acvCtrl.send30501();
                if (acvCtrl.send12501) acvCtrl.send12501();
                
                try {
                    if (ctx.WelfareCtrl && ctx.WelfareCtrl.gInst) {
                        const wf = ctx.WelfareCtrl.gInst();
                        if (wf.send30101) wf.send30101();
                        if (wf.send30102) wf.send30102(1);
                        if (wf.send30103) wf.send30103(0);
                    }
                    if (ctx.VipCtrl && ctx.VipCtrl.gInst) {
                        const vp = ctx.VipCtrl.gInst();
                        if (vp.send12401) vp.send12401();
                        if (vp.send12407) vp.send12407();
                        if (vp.send12408) vp.send12408();
                    }
                } catch (e) { }
            }

            let acted = false;
            const taskList = acvCtrl.taskDt;
            if (taskList && taskList.length > 0) {
                for (let i = 0; i < taskList.length; i++) {
                    const task = taskList[i];
                    if (task.status === 1) {
                        acvCtrl.send30503(task.task_id);
                        task.status = 2;
                        sendLog(`📜 [Nhiệm Vụ Ngày] Đã nhận thưởng hoàn thành Nhiệm vụ ID: ${task.task_id}!`, "action");
                        acted = true;
                        break;
                    }
                }

                if (acted) return true;

                if (now - lastTaskActionTime > 3000) {
                    for (let i = 0; i < taskList.length; i++) {
                        const task = taskList[i];
                        if (task.status === 0) {
                            const tid = task.task_id;
                            let didTask = false;

                            switch (tid) {
                                case 2:
                                    if (ctx.FriendCtrl && ctx.FriendCtrl.gInst) {
                                        const fc = ctx.FriendCtrl.gInst();
                                        if (fc.send11800Msg) fc.send11800Msg();
                                        if (fc.getAndSendLove) {
                                            fc.getAndSendLove();
                                            sendLog(`🤝 [Nhiệm Vụ Ngày - Case 2] Tặng & nhận thể lực bạn bè`, "action");
                                            didTask = true;
                                        }
                                    }
                                    break;
                                case 3:
                                    if (ctx.RecruitCtrl && ctx.RecruitCtrl.gInst) {
                                        const rc = ctx.RecruitCtrl.gInst();
                                        if (rc.reqRecruitInfo) rc.reqRecruitInfo();
                                        if (rc.isHasFreeRecruit && rc.isHasFreeRecruit()) {
                                            const type = (ctx.RecruitConst && ctx.RecruitConst.ERecruitType && ctx.RecruitConst.ERecruitType.famous) || 2;
                                            rc.freeRecruit(type);
                                            sendLog(`🎴 [Nhiệm Vụ Ngày - Case 3] Chiêu mộ miễn phí hôm nay`, "action");
                                            didTask = true;
                                        }
                                    }
                                    break;
                                case 4:
                                    if (ctx.ArenaCtrl && ctx.ArenaCtrl.gInst) {
                                        const ac = ctx.ArenaCtrl.gInst();
                                        if (ac.opAnUi) ac.opAnUi();
                                        if (ac.send14201) ac.send14201();
                                        if (ac.chnlgeEmy) {
                                            ac.skipArenaFight = true;
                                            ac.chnlgeEmy(0);
                                            sendLog(`⚔️ [Nhiệm Vụ Ngày - Case 4] Khiêu chiến Đấu Trường`, "action");
                                            didTask = true;
                                        }
                                    }
                                    break;
                                case 8:
                                    if (ctx.GuildCtrl && ctx.GuildCtrl.gInst) {
                                        const gc = ctx.GuildCtrl.gInst();
                                        if (gc.checkIsHaveGuild && gc.checkIsHaveGuild()) {
                                            if (gc.send18035Msg) gc.send18035Msg();
                                            if (gc.send18036Msg) {
                                                gc.send18036Msg(1);
                                                sendLog(`🏛️ [Nhiệm Vụ Ngày - Case 8] Bái kiến tế tự Bang Hội`, "action");
                                                didTask = true;
                                            }
                                        }
                                    }
                                    break;
                                case 10:
                                    if (ctx.TravelCtrl && ctx.TravelCtrl.gInst) {
                                        const tc = ctx.TravelCtrl.gInst();
                                        if (tc.send30201) tc.send30201();
                                        if (tc.send30204) tc.send30204();
                                        if (tc.send30205) tc.send30205();
                                        sendLog(`🗺️ [Nhiệm Vụ Ngày - Case 10] Du ngoạn phái tướng & nhận thưởng`, "action");
                                        didTask = true;
                                    }
                                    break;
                                case 12:
                                    if (ctx.GuildCtrl && ctx.GuildCtrl.gInst) {
                                        const gc = ctx.GuildCtrl.gInst();
                                        if (gc.checkIsHaveGuild && gc.checkIsHaveGuild()) {
                                            if (gc.send18040Msg) gc.send18040Msg();
                                            if (gc.send18044Msg) {
                                                gc.send18044Msg();
                                                sendLog(`👥 [Nhiệm Vụ Ngày - Case 12] Trợ giúp thành viên Bang Hội`, "action");
                                                didTask = true;
                                            }
                                        }
                                    }
                                    break;
                                case 16:
                                    if (ctx.DiceCtrl && ctx.DiceCtrl.gInst) {
                                        const dc = ctx.DiceCtrl.gInst();
                                        if (dc.clickDice) {
                                            dc.clickDice();
                                            sendLog(`🎲 [Nhiệm Vụ Ngày - Case 16] Lắc xúc xắc`, "action");
                                            didTask = true;
                                        }
                                    }
                                    break;
                            }

                            if (didTask) {
                                lastTaskActionTime = now;
                                acted = true;
                                break;
                            }
                        }
                    }
                }
            }

            if (acted) return true;

            const boxStates = acvCtrl.tskStateLs;
            if (boxStates && boxStates.length > 0) {
                for (let b = 0; b < boxStates.length; b++) {
                    if (boxStates[b] === 1) {
                        if (acvCtrl.send30504) {
                            acvCtrl.send30504(b);
                            boxStates[b] = 2;
                            const curAct = acvCtrl.curActive || 0;
                            const maxAct = acvCtrl.maxActive || 0;
                            sendLog(`🎁 [Rương Năng Động] Đã mở nhận Rương Năng Động #${b + 1} (${curAct}/${maxAct} điểm)!`, "action");
                            acted = true;
                            break;
                        }
                    }
                }
            }

            if (acted) return true;

            const acvList = acvCtrl.acvDt;
            if (acvList && acvList.length > 0) {
                for (let a = 0; a < acvList.length; a++) {
                    const acv = acvList[a];
                    if (acv.status === 1) {
                        if (acvCtrl.send12503) {
                            acvCtrl.send12503(acv.id);
                            acv.status = 2;
                            sendLog(`🏆 [Thành Tựu] Đã nhận thưởng Thành Tựu ID: ${acv.id}!`, "action");
                            acted = true;
                            break;
                        }
                    }
                }
            }

            return acted;
        }
