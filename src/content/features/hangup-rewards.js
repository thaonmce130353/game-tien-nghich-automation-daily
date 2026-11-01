
        // 7. Nhận thưởng Treo Máy & Mua/Quét Treo Máy Nhanh
        function handleHangup(ctx) {
            const now = Date.now();
            let acted = false;

            if (CONFIG.autoHangupReward && (now - lastHangupCheck > 40000)) {
                lastHangupCheck = now;
                try {
                    if (ctx.HangupCtrl && ctx.HangupCtrl.gInst) {
                        const hgCtrl = ctx.HangupCtrl.gInst();
                        if (hgCtrl.reqHangupBaseInfo) hgCtrl.reqHangupBaseInfo();
                        if (hgCtrl.reqGetHangupAwards) {
                            hgCtrl.reqGetHangupAwards();
                            sendLog("🎁 [Treo Máy] Đã tự động nhận thưởng tích lũy treo máy!", "action");
                            acted = true;
                        }
                    }
                } catch (e) { }
            }

            if (CONFIG.autoQuickHang && (now - lastQuickHangCheck > 25000)) {
                lastQuickHangCheck = now;
                try {
                    if (ctx.HangupCtrl && ctx.HangupCtrl.gInst) {
                        const hgCtrl = ctx.HangupCtrl.gInst();
                        const baseInfo = hgCtrl.m_stageBaseInfo;
                        if (baseInfo) {
                            const freeCount = baseInfo.left_free_count || 0;
                            const buyCount = baseInfo.left_buy_count || 0;
                            if (freeCount > 0 || buyCount > 0) {
                                if (ctx.NetMgr && ctx.NProtoNum && ctx.NProtoNum.S14105) {
                                    ctx.NetMgr.gInst().sendMsg(ctx.NProtoNum.S14105);
                                    sendLog(`⚡ [Treo Máy Nhanh] Đã quét nhanh treo máy (còn ${freeCount} miễn phí, ${buyCount} lượt mua)!`, "action");
                                    acted = true;
                                } else if (hgCtrl.reqGetWipeoutAwards) {
                                    hgCtrl.reqGetWipeoutAwards();
                                    sendLog(`⚡ [Treo Máy Nhanh] Đã kích hoạt quét treo máy nhanh!`, "action");
                                    acted = true;
                                }
                            }
                        } else if (hgCtrl.reqHangupBaseInfo) hgCtrl.reqHangupBaseInfo();
                    }
                } catch (e) { }
            }

            return acted;
        }

        // 8. Soi từng case Nhiệm Vụ Ngày, Tự Làm & Nhận Rương Năng Động
