        // [Ma Đạo] Gộp: Thưởng Treo Máy (AFK) -> Tác Chiến Nhanh -> Ải Chính Tuyến -> Ủy Phái, chạy lần lượt theo đúng thứ tự.
        //   afk    : HangupCtrl.reqGetHangupAwards (S14103), xác nhận bằng last_time đổi sau khi tải lại (S14101).
        //   quick  : Tác Chiến Nhanh (S14105): hết lượt free thì MUA bằng Tiên Ngọc cho tới hết lượt mua trong ngày
        //            (trần MA_DAO_MAX_QUICK_BUYS); xác nhận bằng left_free_count/left_buy_count giảm.
        //   stage  : Ải Chính Tuyến: nhận thưởng vượt ải miễn phí, kích hoạt chương mới, kiểm tra cấp yêu cầu
        //            (chưa đủ cấp thì chỉ ghi log), rồi khiêu chiến liên tục (bỏ qua trận) tới khi chặn/thua.
        //   travel : Ủy Phái (TravelCtrl, màn travelUi): nhận nhanh (S30205) các việc đã xong, ủy phái việc Sử Thi
        //            (rare_id >= 4 gồm cả bậc cao hơn, bậc cao làm trước; S30202 với tướng gợi ý của game), chưa có Sử Thi thì làm mới (S30204: lượt free, rồi
        //            vật phẩm làm mới, rồi Tiên Ngọc; trần MA_DAO_MAX_TRAVEL_REFRESH mỗi ngày).
        // Chỉ ghi "đã" khi dữ liệu máy chủ xác nhận; thiếu phản hồi thì báo lỗi, không gửi lại.
        const MA_DAO_REQUEST_TIMEOUT_MS = 15000;
        const MA_DAO_FIGHT_TIMEOUT_MS = 90000;
        const MA_DAO_MAX_QUICK_BUYS = 20;
        const MA_DAO_MAX_TRAVEL_REFRESH = 30;
        // Ủy Phái chỉ làm MỘT việc: dùng điểm ủy phái để ủy phái việc MỚI. Không bao giờ gửi send30203 (tăng tốc/hoàn thành sớm: tốn
        // Tiên Ngọc theo thời gian còn lại): việc đã ủy phái cứ để đồng hồ chạy. send30205 chỉ nhận các việc ĐÃ hết giờ (miễn phí).
        // Tiên Ngọc chỉ dùng để làm mới danh sách khi chưa có việc Sử Thi trở lên; mỗi lần dự kiến MA_DAO_REFRESH_GOLD_EXPECTED.
        const MA_DAO_REFRESH_GOLD_EXPECTED = 30;
        function maDaoGold(ctx) {
            try { return Number(ctx.CommonUtils.getRoleAsset('gold')) || 0; } catch (e) { return 0; }
        }
        const MA_DAO_MAX_STAGE_FIGHTS = 200;
        const MA_DAO_SHISHI_RARE = 4;              // TravelCtrl.isShiShiUp: rare_id >= 4 là Sử Thi trở lên
        // Tên bậc việc ủy phái theo rare_id (game chỉ hiện ảnh yl_pic_pinzhi<rare_id>, không có tên chữ trong dữ liệu).
        // Thời gian hoàn thành tăng theo bậc (8h / 12h / 16h) khớp với 3 bậc này; log luôn kèm số giờ để đối chiếu.
        const MA_DAO_RARE_NAMES = { 4: 'Sử Thi', 5: 'Truyền Thuyết', 6: 'Bất Hủ' };

        function maDaoRareName(rareId) {
            return MA_DAO_RARE_NAMES[rareId] || `bậc ${rareId}`;
        }

        // "Bất Hủ, 16h" từ việc ủy phái đã xử lý của game (rare_id, rare_time tính bằng phút).
        function maDaoRareText(ev) {
            const hours = Number(ev.rare_time) > 0 ? `, ${Math.round(Number(ev.rare_time) / 6) / 10}h` : '';
            return `${maDaoRareName(ev.rare_id)}${hours}`;
        }
        const MA_DAO_STORAGE_KEY = 'TN_AUTO_MADAO_V1';

        function maDaoLoadCounts() {
            try {
                const saved = JSON.parse(sessionStorage.getItem(MA_DAO_STORAGE_KEY) || 'null');
                if (saved && saved.dayKey === new Date().toDateString()) return { quickBuys: Number(saved.quickBuys) || 0, refreshes: Number(saved.refreshes) || 0 };
            } catch (e) { }
            return { quickBuys: 0, refreshes: 0 };
        }

        function maDaoSaveCounts(s) {
            try { sessionStorage.setItem(MA_DAO_STORAGE_KEY, JSON.stringify({ dayKey: new Date().toDateString(), quickBuys: s.quickBuys, refreshes: s.refreshes })); } catch (e) { }
        }

        let maDaoState = null;
        runResetHooks.push(() => { maDaoState = null; });

        function createMaDaoState() {
            const counts = maDaoLoadCounts();
            return {
                phase: 'afk',              // afk -> quick -> stage -> travel -> done
                failed: false,
                refreshing: null,
                nextAt: 0,
                afk: { stage: 'refresh' },
                quick: { stage: 'refresh', pending: null, used: 0 },
                stage: { stage: 'refresh', fights: 0, losses: 0, claiming: null, pending: null, activated: 0 },
                travel: { stage: 'query', claimPending: null, dispatchPending: null, refreshPending: null, cycles: 0, heroFail: {} },
                quickBuys: counts.quickBuys,
                refreshes: counts.refreshes
            };
        }

        function maDaoFail(s, message, nextPhase) {
            sendLog(`❌ [Ma Đạo] ${message}`, "error");
            s.failed = true;
            s.refreshing = null;
            s.phase = nextPhase;
        }

        function maDaoRole(ctx) {
            try { return ctx.RoleCtrl.gInst().getRoleInfo() || null; } catch (e) { return null; }
        }

        // ---- 1. Thưởng Treo Máy (AFK) ----
        function maDaoStepAfk(ctx, s, now) {
            const hg = ctx.HangupCtrl.gInst();
            const a = s.afk;
            const tokenOf = () => hg.m_stageBaseInfo;
            if (a.stage === 'refresh') {
                const r = pollTowerDailyRefresh(s, 'refreshing', now, () => hg.reqHangupBaseInfo(), tokenOf);
                if (r === 'wait') return false;
                if (r !== 'ready') { maDaoFail(s, "[Treo Máy] Máy chủ chưa trả dữ liệu treo máy; bỏ qua nhận thưởng treo máy.", 'quick'); return false; }
                const minutes = Math.floor((Number(hg.m_hgTime) || 0) / 60);
                if (minutes < 1) {
                    sendLog("ℹ️ [Treo Máy] Chưa tích lũy được thưởng treo máy để nhận.", "info");
                    s.phase = 'quick';
                    return true;
                }
                a.lastTime = hg.m_stageBaseInfo.last_time;
                a.sentAt = now;
                a.minutes = minutes;
                hg.reqGetHangupAwards();
                a.stage = 'confirm';
                sendLog(`🎁 [Treo Máy] Đã gửi nhận thưởng treo máy (${minutes} phút); chờ máy chủ xác nhận.`, "action");
                return true;
            }
            // confirm: recvHangupAwards đặt last_time mới và m_hgTime = 0
            const info = hg.m_stageBaseInfo;
            if (info && info.last_time !== a.lastTime) {
                sendLog(`✅ [Treo Máy] Máy chủ xác nhận đã nhận thưởng treo máy (${a.minutes} phút).`, "result");
                s.phase = 'quick';
                return true;
            }
            if (now - a.sentAt >= MA_DAO_REQUEST_TIMEOUT_MS) {
                maDaoFail(s, "[Treo Máy] Đã gửi nhận thưởng nhưng máy chủ chưa xác nhận; không gửi lại.", 'quick');
            }
            return false;
        }

        // ---- 2. Tác Chiến Nhanh (free, rồi mua bằng Tiên Ngọc) ----
        function maDaoStepQuick(ctx, s, now) {
            const hg = ctx.HangupCtrl.gInst();
            const q = s.quick;
            const tokenOf = () => hg.m_stageBaseInfo;
            if (q.stage === 'refresh') {
                const r = pollTowerDailyRefresh(s, 'refreshing', now, () => hg.reqHangupBaseInfo(), tokenOf);
                if (r === 'wait') return false;
                if (r !== 'ready') { maDaoFail(s, "[Tác Chiến Nhanh] Máy chủ chưa trả số lượt; bỏ qua Tác Chiến Nhanh.", 'stage'); return false; }
                q.stage = 'next';
            }
            const info = hg.m_stageBaseInfo;
            if (q.pending) {
                const p = q.pending;
                if (info.left_free_count < p.free || info.left_buy_count < p.buy) {
                    q.used++;
                    sendLog(`✅ [Tác Chiến Nhanh] Máy chủ xác nhận đã tác chiến nhanh (${p.paid ? 'mua bằng Tiên Ngọc' : 'lượt free'}); còn ${info.left_free_count} free, ${info.left_buy_count} lượt mua.`, "result");
                    q.pending = null;
                    s.nextAt = now + humanDelay(1500);
                } else if (now - p.at >= MA_DAO_REQUEST_TIMEOUT_MS) {
                    maDaoFail(s, "[Tác Chiến Nhanh] Đã gửi nhưng số lượt không giảm; dừng, không gửi lại.", 'stage');
                    return false;
                } else return false;
            }
            if (now < s.nextAt) return false;
            const free = Number(info.left_free_count) || 0;
            const buy = Number(info.left_buy_count) || 0;
            if (free <= 0 && buy <= 0) {
                sendLog(`ℹ️ [Tác Chiến Nhanh] Hết lượt hôm nay (đã dùng ${q.used} lượt trong lần chạy này).`, "info");
                s.phase = 'stage';
                return true;
            }
            const paid = free <= 0;
            if (paid && s.quickBuys >= MA_DAO_MAX_QUICK_BUYS) {
                sendLog(`⏸️ [Tác Chiến Nhanh] Đã mua ${s.quickBuys} lần hôm nay (trần ${MA_DAO_MAX_QUICK_BUYS}); dừng mua thêm.`, "warn");
                s.phase = 'stage';
                return true;
            }
            if (paid) {
                s.quickBuys++;
                maDaoSaveCounts(s);
                sendLog(`💎 [Tác Chiến Nhanh] Hết lượt free; mua lượt tác chiến nhanh (${info.next_cost} Tiên Ngọc, còn ${buy} lượt mua, lần mua ${s.quickBuys}/${MA_DAO_MAX_QUICK_BUYS}).`, "result");
            } else {
                sendLog(`⚡ [Tác Chiến Nhanh] Dùng lượt free (còn ${free}).`, "action");
            }
            q.pending = { free, buy, paid, at: now };
            ctx.NetMgr.gInst().sendMsg(ctx.NProtoNum.S14105);
            return true;
        }

        // Thưởng ải (hgBossAwardUi): các mốc ải đã qua mà chưa nhận. Tính trực tiếp từ bảng thưởng và ải hiện tại
        // (m_ungainStageIdGroup của game chỉ cập nhật khi tải lại dữ liệu treo máy nên bị cũ sau khi vừa qua ải).
        function maDaoClaimableStageRewards(hg, skip) {
            const out = [];
            const data = hg.m_curModel.getBossAwardData();
            const info = hg.m_stageBaseInfo;
            const cur = hg.m_curStageId;
            const cleared = info && (Number(info.pass_all) === 1 || hg.m_needActiveChapterId > 0);
            for (const k of Object.keys(data || {})) {
                const c = data[k];
                const id = c && c.stage_id;
                if (!id || !c.reward || (skip && skip[id])) continue;
                if (hg.checkIsHasGetById(id)) continue;
                if (id < cur || (id === cur && cleared)) out.push(Number(id));
            }
            return out.sort((a, b) => a - b);
        }

        // ---- 3. Ải Chính Tuyến ----
        function maDaoStepStage(ctx, s, now) {
            const hg = ctx.HangupCtrl.gInst();
            const st = s.stage;
            const vm = ctx.ViewMgr.gInst();
            const tokenOf = () => hg.m_stageBaseInfo;
            if (st.stage === 'refresh') {
                const r = pollTowerDailyRefresh(s, 'refreshing', now, () => hg.reqHangupBaseInfo(), tokenOf);
                if (r === 'wait') return false;
                if (r !== 'ready') { maDaoFail(s, "[Ải Chính Tuyến] Máy chủ chưa trả dữ liệu ải; bỏ qua.", 'travel'); return false; }
                st.stage = 'loop';
            }
            const close = (name) => { try { if (vm.viewIsVisible(name)) vm.closeView(name); } catch (e) { } };
            close('fightSuccessUi'); close('fightFailUi');

            if (st.claiming) {
                const c = st.claiming;
                if (hg.m_gainStageIdGroup && hg.m_gainStageIdGroup[c.id]) {
                    sendLog(`✅ [Ải Chính Tuyến] Máy chủ xác nhận đã nhận thưởng vượt ải ${c.id}.`, "result");
                    st.claiming = null;
                } else if (now - c.at >= MA_DAO_REQUEST_TIMEOUT_MS) {
                    sendLog(`⚠️ [Ải Chính Tuyến] Đã gửi nhận thưởng ải ${c.id} nhưng máy chủ chưa xác nhận; không gửi lại.`, "warn");
                    st.skipClaim = st.skipClaim || {}; st.skipClaim[c.id] = true;
                    st.claiming = null;
                } else return false;
            }

            if (st.pending) {
                const p = st.pending;
                if (hg.m_ischanllaging) {
                    if (now - p.at >= MA_DAO_FIGHT_TIMEOUT_MS) { maDaoFail(s, `[Ải Chính Tuyến] Chờ kết quả ải ${p.stageId} quá lâu; dừng.`, 'travel'); return false; }
                    return false;
                }
                if (now - p.at < 1500) return false;
                if (hg.m_curStageId !== p.stageId) {
                    sendLog(`✅ [Ải Chính Tuyến] Qua ải ${p.stageId} → ${hg.m_curStageId}.`, "action");
                    st.pending = null;
                    st.losses = 0;
                    s.nextAt = now + humanDelay(1500);
                } else {
                    st.losses++;
                    st.pending = null;
                    sendLog(`⚠️ [Ải Chính Tuyến] Chưa qua ải ${p.stageId} (lần thua ${st.losses}).`, "warn");
                    if (st.losses >= 2) {
                        sendLog("⏸️ [Ải Chính Tuyến] Thua 2 lần liên tiếp; dừng đi ải để củng cố lực chiến.", "warn");
                        st.leave = true;
                        return true;
                    }
                    s.nextAt = now + humanDelay(5000);
                }
            }
            if (now < s.nextAt) return false;

            // Nhận thưởng vượt ải miễn phí còn tồn.
            const ungained = maDaoClaimableStageRewards(hg, st.skipClaim);
            if (ungained.length > 0) {
                const id = Number(ungained[0]);
                st.claiming = { id, at: now };
                hg.reqGetStageAwards(id);
                sendLog(`🎁 [Ải Chính Tuyến] Mở Thưởng ải: có ${ungained.length} mốc chưa nhận; gửi nhận mốc ải ${id}, chờ máy chủ xác nhận.`, "action");
                return true;
            }
            if (st.leave) { s.phase = 'travel'; return true; }
            const info = hg.m_stageBaseInfo;
            if (info && Number(info.pass_all) === 1) {
                sendLog("ℹ️ [Ải Chính Tuyến] Đã qua hết các ải hiện có.", "info");
                st.leave = true;
                return true;
            }
            if (hg.m_needActiveChapterId > 0) {
                if (st.activated >= 3) { maDaoFail(s, "[Ải Chính Tuyến] Kích hoạt chương mới nhiều lần mà chưa được; dừng.", 'travel'); return false; }
                st.activated++;
                sendLog(`🔓 [Ải Chính Tuyến] Kích hoạt chương mới (${hg.m_needActiveChapterId}).`, "action");
                hg.reqActiveChapter(hg.m_needActiveChapterId);
                hg.m_needActiveChapterId = 0;
                s.nextAt = now + humanDelay(2500);
                st.stage = 'refresh';
                return true;
            }
            const stageId = hg.m_curStageId;
            const role = maDaoRole(ctx);
            const limit = Number(hg.m_curModel.getStageLimitLv(stageId)) || 0;
            const lev = role ? Number(role.lev) || 0 : 0;
            if (limit > lev) {
                sendLog(`ℹ️ [Ải Chính Tuyến] Ải ${stageId} yêu cầu cấp ${limit}, hiện tại cấp ${lev}; chưa thể khiêu chiến, bỏ qua.`, "info");
                st.leave = true;
                return true;
            }
            if (Number(hg.m_delayChallengeTime) !== 0) return false;
            if (st.fights >= MA_DAO_MAX_STAGE_FIGHTS) { sendLog(`⏸️ [Ải Chính Tuyến] Đã đánh ${st.fights} ải trong lượt này; dừng.`, "warn"); st.leave = true; return true; }
            if (hg.m_ischanllaging || (ctx.FightCtrl && ctx.FightCtrl.gInst().getIsFighting && ctx.FightCtrl.gInst().getIsFighting())) return false;
            st.fights++;
            st.pending = { stageId, at: now };
            sendLog(`🚀 [Ải Chính Tuyến] Khiêu chiến ải ${stageId} (cấp yêu cầu ${limit}, hiện tại ${lev}).`, "action");
            hg.reqChanllgeStage();
            if (!hg.m_ischanllaging) {
                st.pending = null;
                maDaoFail(s, `[Ải Chính Tuyến] Game không cho khiêu chiến ải ${stageId} lúc này; dừng.`, 'travel');
            }
            return true;
        }

        // ---- 4. Ủy Phái ----
        function maDaoTravelEvents(tc) {
            const info = tc.travelInfo;
            return info && info.event_list ? info.event_list : [];
        }

        // Tướng ủy phái: gợi ý của game (đủ điều kiện sao/hệ), rồi điền thêm tướng rảnh sao thấp nhất cho đủ số chỗ
        // (việc Sử Thi cần 3 tướng nhưng chỉ 2 điều kiện; ô còn lại người chơi tự chọn tướng bất kỳ).
        function maDaoPickHeroes(ctx, tc, ev, number) {
            const chosen = (tc.getHeroList(ev.cond_list) || []).slice(0, number);
            if (chosen.length >= number || !ctx.HeroCtrl || !ctx.HeroCtrl.gInst) return chosen;
            const used = {};
            chosen.forEach((h) => { used[h.id] = true; });
            let pool = [];
            try { pool = ctx.HeroCtrl.gInst().getHeroDataByRealm(0) || []; } catch (e) { }
            pool = pool.filter((h) => !used[h.id] && !tc.getIsHeroCarryOut(h.id))
                .sort((a, b) => (a.star - b.star) || (a.base_id - b.base_id));
            for (const h of pool) {
                if (chosen.length >= number) break;
                chosen.push(h);
            }
            return chosen;
        }

        function maDaoStepTravel(ctx, s, now) {
            const tc = ctx.TravelCtrl && ctx.TravelCtrl.gInst && ctx.TravelCtrl.gInst();
            if (!tc || typeof tc.send30201 !== 'function' || typeof tc.send30202 !== 'function' || typeof tc.send30204 !== 'function' || typeof tc.send30205 !== 'function') {
                logUnsupportedOnce('ma-dao-travel', "⚠️ [Ủy Phái] Bản game hiện tại không có TravelCtrl phù hợp; bỏ qua Ủy Phái.");
                s.phase = 'done';
                return false;
            }
            const t = s.travel;
            const tokenOf = () => tc.travelInfo;
            const serverNow = () => { try { return ctx.NetMgr.gInst().getTime(); } catch (e) { return Math.floor(Date.now() / 1000); } };
            const done = () => { sendLog(`🏁 [Ma Đạo] Đã chạy xong${s.failed ? ' (có bước chưa hoàn tất)' : ''}.`, "info"); s.phase = 'done'; };

            if (t.stage === 'query') {
                const r = pollTowerDailyRefresh(s, 'refreshing', now, () => tc.send30201(), tokenOf);
                if (r === 'wait') return false;
                if (r !== 'ready' || !tc.travelInfo) { maDaoFail(s, "[Ủy Phái] Máy chủ chưa trả danh sách ủy phái; bỏ qua.", 'done'); done(); return false; }
                t.stage = 'claim';
                return true;
            }

            // Nhận nhanh các việc đã xong (S30205); xác nhận bằng số việc xong giảm sau khi tải lại.
            if (t.stage === 'claim') {
                const finished = maDaoTravelEvents(tc).filter((e) => e.finish_time > 0 && e.finish_time <= serverNow());
                if (t.claimPending) {
                    const p = t.claimPending;
                    if (tc.travelInfo !== p.token) {
                        sendLog(`✅ [Ủy Phái] Máy chủ xác nhận đã nhận nhanh các việc đã xong (${p.count} việc).`, "result");
                        t.claimPending = null;
                        t.stage = 'plan';
                        return true;
                    }
                    if (now - p.at >= MA_DAO_REQUEST_TIMEOUT_MS) { maDaoFail(s, "[Ủy Phái] Đã bấm nhận nhanh nhưng máy chủ chưa trả danh sách mới; không gửi lại.", 'done'); done(); return false; }
                    return false;
                }
                if (finished.length === 0) {
                    sendLog("ℹ️ [Ủy Phái] Không có việc nào đã xong để nhận.", "info");
                    t.stage = 'plan';
                    return true;
                }
                t.claimPending = { token: tc.travelInfo, at: now, count: finished.length };
                tc.send30205();
                sendLog(`🎁 [Ủy Phái] Đã bấm Nhận nhanh (${finished.length} việc đã xong); chờ máy chủ xác nhận.`, "action");
                return true;
            }

            // Ủy phái việc Sử Thi chưa giao; nếu chưa có Sử Thi thì làm mới.
            if (t.stage === 'plan') {
                if (t.dispatchPending) {
                    const p = t.dispatchPending;
                    const ev = maDaoTravelEvents(tc).find((e) => e.id === p.id);
                    if (ev && ev.finish_time > 0) {
                        sendLog(`✅ [Ủy Phái] Máy chủ xác nhận đã ủy phái "${ev.event_name}" (${maDaoRareText(ev)}), hoàn thành lúc ${new Date(ev.finish_time * 1000).toLocaleTimeString()}.`, "result");
                        t.dispatchPending = null;
                        s.nextAt = now + humanDelay(1500);
                        return true;
                    }
                    if (now - p.at >= MA_DAO_REQUEST_TIMEOUT_MS) {
                        sendLog(`⚠️ [Ủy Phái] Đã gửi ủy phái việc #${p.id} nhưng máy chủ chưa xác nhận; không gửi lại việc này.`, "warn");
                        t.heroFail[p.id] = true;
                        t.dispatchPending = null;
                    } else return false;
                }
                if (t.refreshPending) {
                    const p = t.refreshPending;
                    if (tc.travelInfo !== p.token && p.paid && !p.settledAt) {
                        p.settledAt = now;      // chờ số dư Tiên Ngọc cập nhật rồi mới đo chi phí thật của lần làm mới
                        return false;
                    }
                    if (tc.travelInfo !== p.token && p.paid && now - p.settledAt < 1500) return false;
                    if (tc.travelInfo !== p.token) {
                        if (p.paid && p.goldBefore > 0) {
                            const cost = Math.max(0, p.goldBefore - maDaoGold(ctx));
                            s.goldSpent = (s.goldSpent || 0) + cost;
                            if (cost > MA_DAO_REFRESH_GOLD_EXPECTED) {
                                s.refreshBlocked = true;
                                sendLog(`⚠️ [Ủy Phái] Lần làm mới này tốn ${cost} Tiên Ngọc, cao hơn mức dự kiến ${MA_DAO_REFRESH_GOLD_EXPECTED}; dừng làm mới để tránh chi lạ (tổng ${s.goldSpent}).`, "warn");
                            } else {
                                sendLog(`💎 [Ủy Phái] Làm mới tốn ${cost} Tiên Ngọc (tổng lượt chạy này ${s.goldSpent}).`, "result");
                            }
                        }
                        t.refreshPending = null;
                        
                        s.nextAt = now + humanDelay(1500);
                        return true;
                    }
                    if (now - p.at >= MA_DAO_REQUEST_TIMEOUT_MS) { maDaoFail(s, "[Ủy Phái] Đã bấm làm mới nhưng máy chủ chưa trả danh sách mới; không gửi lại.", 'done'); done(); return false; }
                    return false;
                }
                if (now < s.nextAt) return false;

                const role = maDaoRole(ctx);
                const travelVal = role ? parseLongVal(role.travel) : 0;
                const events = maDaoTravelEvents(tc);
                const epics = events.filter((e) => e.rare_id >= MA_DAO_SHISHI_RARE && e.finish_time === 0 && !t.heroFail[e.id]).sort((a, b) => b.rare_id - a.rare_id);   // bậc cao nhất (Truyền Thuyết...) làm trước
                if (epics.length > 0) {
                    // Việc Sử Thi chưa giao: làm lần lượt tới khi hết điểm ủy phái hoặc hết tướng rảnh.
                    for (const ev of epics) {
                        if (travelVal < Number(ev.travel_value)) {
                            sendLog(`ℹ️ [Ủy Phái] Việc "${ev.event_name}" (${maDaoRareText(ev)}) cần ${ev.travel_value} điểm ủy phái, hiện có ${travelVal}; đã dùng hết điểm, dừng.`, "info");
                            done();
                            return false;
                        }
                        const rare = tc.getRareConfigById(ev.rare_id);
                        const need = rare ? Number(rare.number) : 0;
                        const heroes = need > 0 ? maDaoPickHeroes(ctx, tc, ev, need) : [];
                        if (heroes.length < need || need === 0) {
                            sendLog(`ℹ️ [Ủy Phái] Việc "${ev.event_name}" (${maDaoRareText(ev)}) cần ${need || '?'} tướng, chỉ còn ${heroes.length} tướng rảnh; bỏ qua việc này.`, "info");
                            t.heroFail[ev.id] = true;
                            t.heroShort = true;
                            continue;
                        }
                        t.dispatchPending = { id: ev.id, at: now };
                        tc.send30202(ev.id, heroes.map((h) => ({ id: h.id })));
                        sendLog(`📜 [Ủy Phái] Ủy phái "${ev.event_name}" (${maDaoRareText(ev)}, ${heroes.length} tướng, ${ev.travel_value} điểm; còn ${travelVal} điểm).`, "action");
                        return true;
                    }
                    sendLog("ℹ️ [Ủy Phái] Không còn việc Sử Thi trở lên nào đủ tướng để ủy phái; dừng.", "info");
                    done();
                    return false;
                }

                if (t.heroShort) {
                    sendLog("ℹ️ [Ủy Phái] Hết tướng rảnh cho việc Sử Thi trở lên; dừng, không làm mới (tránh mất việc còn lại).", "info");
                    done();
                    return false;
                }
                // Chưa có Sử Thi nào: làm mới (còn đủ điểm cho một việc Sử Thi nhỏ nhất mới đáng làm mới).
                const epicCfg = tc.getRareConfigById(MA_DAO_SHISHI_RARE);
                const minNeed = epicCfg ? Number(epicCfg.travel_value) : Number(tc.getMinTraveValue());
                if (travelVal < minNeed) {
                    sendLog(`ℹ️ [Ủy Phái] Điểm ủy phái ${travelVal} không đủ cho việc nào (cần tối thiểu ${minNeed}); dừng, không làm mới.`, "info");
                    done();
                    return false;
                }
                if (s.refreshBlocked) {
                    sendLog("ℹ️ [Ủy Phái] Đã dừng làm mới vì giá thực tế cao hơn dự kiến.", "info");
                    done();
                    return false;
                }
                if (t.cycles >= 60 || s.refreshes >= MA_DAO_MAX_TRAVEL_REFRESH) {
                    sendLog(`⏸️ [Ủy Phái] Đã làm mới ${s.refreshes}/${MA_DAO_MAX_TRAVEL_REFRESH} lần hôm nay mà chưa có việc Sử Thi trở lên mới; dừng.`, "result");
                    done();
                    return false;
                }
                const freeLeft = Number(tc.travelInfo.left_ref_times) || 0;
                const refreshItem = ctx.PropsConst && ctx.PropsCtrl ? ctx.PropsCtrl.gInst().findGoodsNum(ctx.PropsConst.BASE_ID_REFRESH_GOODS) : 0;
                t.cycles++;
                s.refreshes++;
                maDaoSaveCounts(s);
                const how = freeLeft > 0 ? `lượt free (còn ${freeLeft})` : refreshItem > 0 ? `vật phẩm làm mới (có ${refreshItem})` : 'Tiên Ngọc';
                sendLog(`🔄 [Ủy Phái] Chưa có việc Sử Thi trở lên nào; làm mới bằng ${how} (lần ${s.refreshes}/${MA_DAO_MAX_TRAVEL_REFRESH} hôm nay).`, freeLeft > 0 || refreshItem > 0 ? "action" : "result");
                t.refreshPending = { token: tc.travelInfo, at: now, paid: !(freeLeft > 0 || refreshItem > 0), goldBefore: maDaoGold(ctx) };
                tc.send30204();
                return true;
            }
            return false;
        }

        function handleMaDao(ctx) {
            try {
                if (!ctx.HangupCtrl || !ctx.HangupCtrl.gInst || !ctx.ViewMgr || !ctx.ViewMgr.gInst || !ctx.NetMgr || !ctx.NProtoNum) {
                    logUnsupportedOnce('ma-dao', "⚠️ [Ma Đạo] Bản game hiện tại thiếu HangupCtrl/NetMgr; tính năng chưa hỗ trợ, không gửi thao tác nào.");
                    return false;
                }
                if (!maDaoState) maDaoState = createMaDaoState();
                const s = maDaoState;
                const now = Date.now();
                switch (s.phase) {
                    case 'afk': return maDaoStepAfk(ctx, s, now);
                    case 'quick': return maDaoStepQuick(ctx, s, now);
                    case 'stage': return maDaoStepStage(ctx, s, now);
                    case 'travel': return maDaoStepTravel(ctx, s, now);
                    default: return false;
                }
            } catch (e) {
                sendLog(`❌ [Ma Đạo] Lỗi: ${e && e.message || e}`, "error");
                if (maDaoState) { maDaoState.failed = true; maDaoState.phase = 'done'; }
                return false;
            }
        }
