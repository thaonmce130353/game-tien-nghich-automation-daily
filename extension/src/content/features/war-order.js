
        // Chiến Lệnh (RechargeCtrl, giao diện zhanLingUi) dùng chung: mở màn, đếm phần thưởng MIỄN PHÍ đã đủ điều kiện
        // nhưng chưa nhận, gửi nhận nhanh (send12322, đúng nút nhận của game) rồi kiểm tra lại bằng dữ liệu máy chủ.
        // Không mua gói, không nhận bậc trả phí. holder: { stage, refreshing, before }.
        // Trả về { status: 'wait' | 'acted' | 'done', failed?: boolean }.
        function warOrderCountFree(rc, type, termId) {
            const model = rc.getCurlModel && rc.getCurlModel();
            const list = model && typeof model.getZlRewardTermList === 'function'
                ? model.getZlRewardTermList(type, termId) : null;
            if (!list || typeof rc.isCanNormalIdRewardByTermId !== 'function') return null;
            let count = 0;
            for (const reward of list) {
                if (rc.isCanNormalIdRewardByTermId(type, termId, reward.id)) count++;
            }
            return count;
        }

        function warOrderClaimStep(ctx, vm, holder, opts, now) {
            const rc = ctx.RechargeCtrl && ctx.RechargeCtrl.gInst && ctx.RechargeCtrl.gInst();
            const type = ctx.RechargeConst && ctx.RechargeConst.ZhanLingType && ctx.RechargeConst.ZhanLingType[opts.typeKey] || opts.fallbackType;
            const termId = opts.termId || 1;
            const close = () => { try { if (vm.viewIsVisible('zhanLingUi')) vm.closeView('zhanLingUi'); } catch (e) { } };
            if (!rc || typeof rc.send12322 !== 'function' || typeof rc.openZhanLingUi !== 'function') {
                sendLog(`⚠️ [${opts.label}] Game chưa sẵn sàng cho Chiến Lệnh (RechargeCtrl); bỏ qua bước nhận.`, "warn");
                return { status: 'done', failed: true };
            }
            if (!holder.stage) holder.stage = 'open';
            const tokenOf = () => rc.getZlNetVoByType(type);
            if (holder.stage === 'open') {
                const r = pollTowerDailyRefresh(holder, 'refreshing', now, () => rc.openZhanLingUi(type, termId), tokenOf);
                if (r === 'wait') return { status: 'wait' };
                if (r !== 'ready') {
                    sendLog(`❌ [${opts.label}] Máy chủ chưa trả dữ liệu Chiến Lệnh; bỏ qua bước nhận.`, "error");
                    close();
                    return { status: 'done', failed: true };
                }
                const available = warOrderCountFree(rc, type, termId);
                if (available === null) {
                    sendLog(`❌ [${opts.label}] Không đọc được danh sách thưởng Chiến Lệnh (bản game đổi); không nhận.`, "error");
                    close();
                    return { status: 'done', failed: true };
                }
                if (available === 0) {
                    sendLog(`ℹ️ [${opts.label}] Chiến Lệnh: không có phần thưởng miễn phí nào để nhận lúc này.`, "info");
                    close();
                    return { status: 'done' };
                }
                holder.before = available;
                holder.stage = 'claim';
                holder.refreshing = null;
                sendLog(`🎁 [${opts.label}] Chiến Lệnh: có ${available} phần thưởng miễn phí có thể nhận; đang nhận.`, "action");
                return { status: 'acted' };
            }
            if (holder.stage === 'claim') {
                const r = pollTowerDailyRefresh(holder, 'refreshing', now, () => rc.send12322(type, termId), tokenOf);
                if (r === 'wait') return { status: 'wait' };
                close();
                if (r !== 'ready') {
                    sendLog(`❌ [${opts.label}] Máy chủ chưa xác nhận việc nhận Chiến Lệnh; không gửi lại để tránh trùng.`, "error");
                    return { status: 'done', failed: true };
                }
                const left = warOrderCountFree(rc, type, termId);
                if (left === 0) {
                    sendLog(`✅ [${opts.label}] Chiến Lệnh: máy chủ xác nhận đã nhận ${holder.before} phần thưởng.`, "result");
                    return { status: 'done' };
                }
                sendLog(`⚠️ [${opts.label}] Chiến Lệnh: đã gửi nhận nhưng còn ${left} phần thưởng chưa nhận được (có thể cần điều kiện khác).`, "warn");
                return { status: 'done', failed: true };
            }
            return { status: 'done' };
        }
