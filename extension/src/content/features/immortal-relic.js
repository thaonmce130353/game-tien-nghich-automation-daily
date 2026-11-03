
        // [Module 5] Di Tích Tiên Giới (RainRuinsCtrl, giao diện rainRuinsUi; bệ = "field", cấp bệ = quality 1-5).
        // Việc duy nhất: phái 1 đội rảnh đi khai thác bệ có cấp cao nhất.
        //   - Có bệ rảnh cấp >= RELIC_GOOD_LEVEL (3) -> phái đội vào bệ cấp cao nhất đó (send32703).
        //   - Toàn bệ cấp thấp -> làm mới (send32702) chỉ bằng lượt MIỄN PHÍ (tối đa RELIC_MAX_FREE_REFRESH lần,
        //     và không quá free_refresh của game), rồi chọn lại. Hết lượt miễn phí thì phái vào bệ tốt nhất hiện có.
        //   - Không bao giờ làm mới bằng vật phẩm/Tiên Ngọc.
        // Chỉ ghi "đã" khi dữ liệu máy chủ xác nhận (fieldDic[index].team_id đổi / daily_refresh_times tăng).
        const RELIC_GOOD_LEVEL = 3;
        const RELIC_MAX_FREE_REFRESH = 3;
        const RELIC_TIMEOUT_MS = 15000;
        let relicState = null;
        runResetHooks.push(() => {
            if (relicState && relicState.failed && relicState.phase === 'done') relicState = null;
        });

        function relicFinish(state, message, type, failed) {
            state.phase = 'done';
            if (failed) state.failed = true;
            sendLog(message, type || "info");
        }

        // Danh sách bệ rảnh (chưa có đội) kèm cấp bệ, cấp cao nhất đứng đầu.
        function relicFreeFields(ctrl) {
            const cfg = ctrl.getCurlModel().getSelfFieldCfg() || {};
            const out = [];
            const dic = ctrl.fieldDic || {};
            for (const key in dic) {
                const f = dic[key];
                if (!f || Number(f.team_id) !== 0) continue;
                const c = cfg[f.field_id];
                out.push({ index: f.index, fieldId: f.field_id, level: c ? Number(c.quality) || 0 : 0 });
            }
            out.sort((a, b) => b.level - a.level || a.index - b.index);
            return out;
        }

        function handleImmortalRelic(ctx) {
            if (!ctx.RainRuinsCtrl || !ctx.RainRuinsCtrl.gInst || !ctx.ViewMgr || !ctx.ViewMgr.gInst) {
                logUnsupportedOnce('m5', "⚠️ [Di Tích Tiên Giới] Game chưa sẵn sàng (RainRuinsCtrl); bỏ qua bước này.");
                return false;
            }
            const dayKey = new Date().toDateString();
            if (!relicState || relicState.dayKey !== dayKey) {
                relicState = { dayKey, phase: 'open', failed: false, openedAt: 0, pending: null, refreshes: 0 };
                sendLog("💎 [Di Tích Tiên Giới] Bắt đầu: mở Di Tích Tiên Giới, phái 1 đội vào bệ cấp cao nhất.", "action");
            }
            const state = relicState;
            if (state.phase === 'done') return false;

            const ctrl = ctx.RainRuinsCtrl.gInst();
            const vm = ctx.ViewMgr.gInst();
            const now = Date.now();
            const visible = vm.viewIsVisible('rainRuinsUi');
            const closeUi = () => { try { if (vm.viewIsVisible('rainRuinsUi')) vm.closeView('rainRuinsUi'); } catch (e) { } };

            try {
                if (ctx.FunOpenCtrl && ctx.FunOpenType && ctx.FunOpenType.RAIN_RUINS !== undefined &&
                    !ctx.FunOpenCtrl.gInst().check(ctx.FunOpenType.RAIN_RUINS, false)) {
                    relicFinish(state, "ℹ️ [Di Tích Tiên Giới] Chức năng chưa mở khóa (chưa đủ cấp độ); bỏ qua.", "info");
                    return false;
                }
            } catch (e) { }

            if (state.phase === 'open') {
                if (!visible) {
                    if (!tryAttemptTarget('relic-open', "[Di Tích Tiên Giới] Mở màn Di Tích")) {
                        relicFinish(state, "❌ [Di Tích Tiên Giới] Không mở được màn Di Tích; bỏ qua.", "error", true);
                        return false;
                    }
                    ctrl.openRainRuinsUi();
                    state.openedAt = now;
                    return true;
                }
                if (!ctrl.sc32700 || !ctrl.fieldDic || Object.keys(ctrl.fieldDic).length === 0) {
                    if (now - state.openedAt > RELIC_TIMEOUT_MS) {
                        relicFinish(state, "❌ [Di Tích Tiên Giới] Máy chủ chưa trả dữ liệu Di Tích; bỏ qua.", "error", true);
                        closeUi();
                    }
                    return false;
                }
                state.phase = 'decide';
                return true;
            }

            if (state.pending) {
                const p = state.pending;
                if (p.kind === 'refresh') {
                    if (Number(ctrl.sc32700.daily_refresh_times) > p.before) {
                        state.pending = null;
                        state.refreshes++;
                        const lv = relicFreeFields(ctrl).map(f => f.level).join(',');
                        sendLog(`✅ [Di Tích Tiên Giới] Máy chủ xác nhận đã làm mới lần ${state.refreshes} (cấp các bệ rảnh: ${lv}).`, "action");
                        return true;
                    }
                } else {
                    const f = ctrl.fieldDic[p.index];
                    if (f && Number(f.team_id) === p.teamId) {
                        state.pending = null;
                        relicFinish(state, `✅ [Di Tích Tiên Giới] Máy chủ xác nhận đã phái đội ${p.teamId} vào bệ #${p.index} (Lv${p.level}).`, "result");
                        closeUi();
                        return true;
                    }
                }
                if (now - p.startedAt > RELIC_TIMEOUT_MS) {
                    state.pending = null;
                    relicFinish(state, `❌ [Di Tích Tiên Giới] Máy chủ chưa xác nhận ${p.kind === 'refresh' ? 'lượt làm mới' : 'việc phái đội'}; không gửi lại.`, "error", true);
                    closeUi();
                }
                return false;
            }

            // phase === 'decide'
            if (!visible) { state.phase = 'open'; return false; }
            const idle = typeof ctrl.getIdleTeamIdArr === 'function' ? ctrl.getIdleTeamIdArr() : [];
            if (!idle.length) {
                relicFinish(state, "ℹ️ [Di Tích Tiên Giới] Không còn đội rảnh (đã phái hết); không có gì để làm.", "info");
                closeUi();
                return false;
            }
            const fields = relicFreeFields(ctrl);
            if (!fields.length) {
                relicFinish(state, "ℹ️ [Di Tích Tiên Giới] Không còn bệ rảnh để phái đội.", "info");
                closeUi();
                return false;
            }
            const best = fields[0];
            const base = ctrl.getCurlModel().getBaseCfg() || {};
            const used = Number(ctrl.sc32700.daily_refresh_times) || 0;
            const freeLeft = Number(base.free_refresh) - used;
            const canRefresh = freeLeft > 0 && state.refreshes < RELIC_MAX_FREE_REFRESH;

            if (best.level < RELIC_GOOD_LEVEL && canRefresh) {
                if (!tryAttemptTarget(`relic-refresh-${state.refreshes}`, "[Di Tích Tiên Giới] Làm mới bệ", 1)) {
                    relicFinish(state, "❌ [Di Tích Tiên Giới] Không gửi được lượt làm mới; dừng.", "error", true);
                    return false;
                }
                sendLog(`💎 [Di Tích Tiên Giới] Bệ cao nhất chỉ Lv${best.level}; làm mới miễn phí lần ${state.refreshes + 1}/${RELIC_MAX_FREE_REFRESH} (còn ${freeLeft} lượt miễn phí của game).`, "action");
                state.pending = { kind: 'refresh', before: used, startedAt: now };
                ctrl.send32702();
                return true;
            }

            if (!tryAttemptTarget('relic-dispatch', "[Di Tích Tiên Giới] Phái đội", 1)) {
                relicFinish(state, "❌ [Di Tích Tiên Giới] Không phái được đội; dừng.", "error", true);
                return false;
            }
            const teamId = idle[0];
            sendLog(`💎 [Di Tích Tiên Giới] Phái đội ${teamId} vào bệ #${best.index} (Lv${best.level})${best.level < RELIC_GOOD_LEVEL ? '; hết lượt làm mới miễn phí nên dùng bệ tốt nhất hiện có' : ''}.`, "action");
            state.pending = { kind: 'dispatch', index: best.index, teamId, level: best.level, startedAt: now };
            ctrl.send32703(best.index, teamId);
            return true;
        }
