        // =====================================================================
        // AUDIT TẠM (chỉ dùng khi phát triển, gỡ trước khi phát hành như Probe).
        // Ghi lại cho MỖI lượt chạy (tính năng đơn hoặc từng bước Quét nhanh):
        //   - mọi yêu cầu gửi máy chủ (NetMgr.sendMsg) kèm Ctrl.method đã gửi và nguồn gọi (code của mình / game tự gửi)
        //   - phản hồi bị từ chối (res/code = 0 kèm msg), thời gian phản hồi, yêu cầu không thấy phản hồi
        //   - thông báo lỗi (GlobalCtrl.showErrorMsg), tips nổi (MainCtrl.showStringTips), lỗi game (CommonUtils.printER), lỗi JS của mình
        //   - bảng/popup mở trong lượt, còn mở khi xong, mở trễ sau khi xong, bị Quét nhanh / closeStrayPopups dọn hộ
        //   - hiệu năng: thời lượng, thao tác, yêu cầu, đuôi chờ sau yêu cầu cuối, chi phí nhịp scheduler, long task, Tiên Ngọc thay đổi
        // CHỈ QUAN SÁT: không chặn, không gửi gì. Xem: Probe -> "Audit". Tắt: Probe -> "Audit bật/tắt" (áp dụng sau khi tải lại trang).
        // =====================================================================
        const AUDIT_STORE_KEY = 'tn-run-audit';
        const AUDIT_OFF_KEY = 'tn-run-audit-off';
        const AUDIT_MAX_STEPS = 80;
        const AUDIT_SKIP_CMDS = { 10010: 1, 10012: 1 };      // nhịp tim / đồng bộ giờ
        // Lệnh mà máy chủ trả lời bằng số lệnh khác (không có phản hồi cùng số): không tính "không thấy phản hồi".
        // 11020 = trận Tứ Linh Tháp (kết quả qua khung trận + 11004), 32061 = mở ván Ảo Cảnh (bàn mới qua 32060).
        const AUDIT_REPLY_ELSEWHERE = { 11020: 1, 32061: 1 };
        const AUDIT_REPLY_TIMEOUT_MS = 8000;
        const AUDIT_LATE_WINDOW_MS = 4000;                   // popup mở trong khoảng này sau khi xong = popup "trễ" của bước vừa xong
        const AUDIT_SLOW_TAIL_MS = 20000;                    // từ yêu cầu cuối tới lúc kết thúc lâu hơn mức này = chờ thừa
        // Ctrl dùng chung mọi tính năng (Chiến Lệnh, đội hình, trận đánh, đạo cụ, mở chức năng...).
        const AUDIT_SHARED_CTRLS = ['RoleCtrl', 'PropsCtrl', 'FightCtrl', 'EmbattleCtrl', 'GlobalCtrl', 'FunOpenCtrl', 'RechargeCtrl', 'CityCtrl', 'MainCtrl', 'BackpackCtrl', 'PlayerCtrl'];
        // Ctrl mong đợi theo tính năng (lấy từ module tính năng + bảng trong CLAUDE.md). Gọi Ctrl ngoài danh sách = cần xem lại.
        const AUDIT_EXPECTED_CTRLS = {
            autoDailyReward: ['WelfareCtrl', 'VipCtrl', 'WarlordsCtrl'],
            autoTamTienDai: ['WelfareCtrl', 'RecruitCtrl', 'AcvCtrl'],
            autoTienHuu: ['FriendCtrl'],
            autoThaiCo: ['DoubleTeamDungeonCtrl', 'RankCtrl'],
            autoTroChien: ['SpiritAnimalCtrl'],
            autoTienMinh: ['GuildCtrl', 'GldWrCtrl', 'LeagueCtrl'],
            autoTongTian: ['DailyDungeonCtrl', 'TowerCtrl', 'CampCtrl', 'RankCtrl'],
            autoDailyDungeon: ['DailyDungeonCtrl'],
            autoSectDefense: ['ETCtrl'],
            autoOtherTrials: ['MzCtrl', 'AdvCtrl'],
            autoExtremeYin: ['ExtremeYinCtrl'],
            autoImmortalRelic: ['RainRuinsCtrl'],
            autoMinigameMemory: ['FaZhenMirageCtrl', 'DevilSeaCtrl', 'RankCtrl'],
            autoMinigameDragon: ['DiceCtrl', 'EngraveCtrl', 'DevilSeaCtrl', 'ShopCtrl'],
            autoClimbYMAbyss: ['YMAbyssCtrl', 'DailyDungeonCtrl', 'RankCtrl'],
            autoArena: ['ArenaCtrl'],
            autoMaDao: ['HangupCtrl', 'TravelCtrl', 'HeroCtrl'],
            autoBanner: ['SuperHeroEncoreCtrl', 'NewSuperHeroCtrl', 'DesenoActivityCtrl', 'HeroCtrl', 'TransGodCtrl', 'DevilSeaCtrl', 'RankCtrl'],
            autoSkinBanner: ['FashionRecCtrl', 'DesenoActivityCtrl', 'DevilSeaCtrl'],
            autoCuoiNgay: ['EmailCtrl', 'RankCtrl', 'AcvCtrl', 'WelfareCtrl'],
            autoXianYuan: ['XianYuanCtrl'],
            autoClimbDailyDungeons: ['DailyDungeonCtrl'], autoClimbCamp: ['DailyDungeonCtrl', 'CampCtrl'], autoSweepDungeons: ['DailyDungeonCtrl']
        };
        // Mã từ chối là trạng thái bình thường, không phải lỗi (máy chủ báo "không còn gì để làm").
        const AUDIT_BENIGN_CODES = { 218015: 'Cửu Uyển Nhi: đã vượt hết tầng' };
        function auditBenign(msg) { const m = String(msg || '').match(/\[(\d+)\]\s*$/); return Boolean(m && AUDIT_BENIGN_CODES[m[1]]); }
        // Lệnh tuyệt đối không được gửi từ code của mình (CLAUDE.md). Chỉ GHI LẠI là lỗi nghiêm trọng, không chặn.
        const AUDIT_FORBIDDEN = [
            { label: 'TravelCtrl.send30203', why: 'tăng tốc Ủy Phái (trả Tiên Ngọc theo thời gian còn lại)' },
            { label: 'DailyDungeonCtrl.send11002', args: (a) => Number(a[0]) === 1, why: 'quét PB Ngày bằng Tiên Ngọc (send11002(1))' }
        ];

        let audit = null;                 // { v, startedAt, steps[], global{...} }
        let auditCur = null;              // bước đang chạy
        let auditLast = null;             // bước vừa xong (nhận popup trễ / popup bị dọn hộ)
        let auditLateUntil = 0;
        let auditInstalled = false;
        let auditSaveAt = 0;
        const auditCallStack = [];        // Ctrl.method đang chạy (để biết sendMsg đến từ đâu)
        const auditPending = {};          // cmd -> [thời điểm gửi] (chờ phản hồi cùng số lệnh)
        const AUDIT_SELF = (function () {
            try {
                const m = String(new Error().stack).match(/((?:chrome|moz)-extension:\/\/[^/\s]+\/[^\s:)]+)/);
                return m ? m[1] : 'content.js';
            } catch (e) { return 'content.js'; }
        })();

        function auditEnabled() {
            try { return sessionStorage.getItem(AUDIT_OFF_KEY) !== '1'; } catch (e) { return true; }
        }
        // Code của mình có trong chuỗi gọi? Bỏ qua khung của chính audit (hàm bọc nằm trong content.js nên luôn có mặt).
        const AUDIT_OWN_FRAME_RE = /tnAudit|auditOnCtrlCall|auditOnSend|auditStack/;
        function auditOurs(stack) {
            const lines = String(stack || '').split(/\r?\n/);
            for (let i = 1; i < lines.length; i++) {
                if (AUDIT_OWN_FRAME_RE.test(lines[i])) continue;
                if (lines[i].indexOf(AUDIT_SELF) >= 0) return true;
            }
            return false;
        }
        // Hàm game gần nhất trong chuỗi gọi (cho lệnh gửi không qua send*/sd* của Ctrl), ví dụ "?reqGuildInfo".
        function auditGameFrameName(stack) {
            const lines = String(stack || '').split(/\r?\n/);
            for (let i = 1; i < lines.length; i++) {
                if (AUDIT_OWN_FRAME_RE.test(lines[i]) || lines[i].indexOf(AUDIT_SELF) >= 0 || /sendMsg|snMsg/.test(lines[i])) continue;
                const m = lines[i].match(/at (?:[\w$]+\.)?([\w$]+)(?: \[as ([\w$]+)\])? \(/);
                if (m) return '?' + (m[2] || m[1]);
            }
            return '?';
        }
        function auditStack() {
            const old = Error.stackTraceLimit;
            try { Error.stackTraceLimit = 40; return String(new Error().stack || ''); } catch (e) { return ''; } finally { Error.stackTraceLimit = old; }
        }
        function auditBrief(v, max) {
            let s;
            try { s = typeof v === 'string' ? v : JSON.stringify(v); } catch (e) { s = String(v); }
            s = String(s === undefined ? '' : s);
            return s.length > (max || 80) ? s.slice(0, max || 80) + '…' : s;
        }
        function auditPush(arr, item, cap) { if (arr.length < (cap || 30)) arr.push(item); }
        function auditGold() {
            try { return Number(window.CommonUtils && window.CommonUtils.getRoleAsset('gold')); } catch (e) { return NaN; }
        }
        function auditStat(o, v) { o.n++; o.sum += v; if (v > o.max) o.max = v; }

        function auditLoad() {
            try {
                const o = JSON.parse(sessionStorage.getItem(AUDIT_STORE_KEY) || 'null');
                if (o && o.v === 1 && Array.isArray(o.steps)) return o;
            } catch (e) { }
            return { v: 1, startedAt: Date.now(), steps: [], global: { gameErrors: [], jsErrors: [], preClean: [] } };
        }
        function auditSave(force) {
            if (!audit) return;
            const now = Date.now();
            if (!force && now - auditSaveAt < 4000) return;
            auditSaveAt = now;
            try {
                while (audit.steps.length > AUDIT_MAX_STEPS) audit.steps.shift();
                sessionStorage.setItem(AUDIT_STORE_KEY, JSON.stringify(audit));
            } catch (e) { }
        }

        // ---- Bảng đang mở (cả nhóm view thường và nhóm "up" như tips/thông báo/mất kết nối) ----
        function auditVisibleViews() {
            const out = [];
            try {
                const vm = window.ViewMgr && window.ViewMgr.gInst && window.ViewMgr.gInst();
                const g = window.ViewMgr && window.ViewMgr.gViewMgr;
                if (!vm) return out;
                const normal = (g && g.m_viewCacheGroup) || vm.m_viewCacheGroup;
                const up = (g && g.m_upViewCacheGroup) || vm.m_upViewCacheGroup;
                if (normal) Object.keys(normal).forEach((n) => {
                    try { if (typeof vm.viewIsVisible === 'function' ? vm.viewIsVisible(n) : (normal[n] && normal[n].visible)) out.push(n); } catch (e) { }
                });
                if (up) Object.keys(up).forEach((n) => {
                    try { if (typeof vm.isUpViewVisible === 'function' ? vm.isUpViewVisible(n) : (up[n] && up[n].visible)) out.push('up:' + n); } catch (e) { }
                });
            } catch (e) { }
            return out;
        }

        function auditNewStep(key, label) {
            const views = auditVisibleViews();
            return {
                key, label, quick: typeof quickRunActive === 'function' && quickRunActive(),
                quickIdx: (typeof quickRun !== 'undefined' && quickRun) ? quickRun.idx + 1 : 0,
                quickTotal: (typeof quickRun !== 'undefined' && quickRun) ? quickRun.queue.length : 0,
                startedAt: Date.now(), finishedAt: 0, ms: 0, result: 'running', reason: '', acts: 0,
                sendsOurs: 0, sendsGame: 0, lastOurSendAt: 0,
                calls: {},            // 'Ctrl.method' -> { n, ours, cmds: {cmd: n}, args: [..] }
                gameSends: {},        // 'Ctrl.method|cmd' -> n (game tự gửi trong lúc bước chạy)
                lat: {},              // cmd -> { n, sum, max }
                replies: {},          // cmd -> [mẫu phản hồi gần nhất] (chỉ lệnh do Auto gửi)
                noReply: {},          // cmd -> n
                refusals: [], errMsgs: [], tips: [], gameErrors: [], jsErrors: [], warnLogs: [], errLogs: [], goldLogs: [],
                unexpected: {}, forbidden: [],
                viewsBase: views, viewsSeen: [], leftOpen: [], late: [], cleaned: [],
                gold0: auditGold(), gold1: NaN,
                ticks: { n: 0, sum: 0, max: 0, slow: 0 }, longTasks: { n: 0, sum: 0, max: 0 }
            };
        }

        // ---- Móc vào vòng đời lượt chạy (gọi từ game-bridge.js / quick-run.js / scheduler.js) ----
        function auditRunBegin(key, label) {
            if (!auditInstalled) return;
            try {
                if (auditCur) auditCloseStep('bị thay bằng lượt mới', 'aborted');
                auditCur = auditNewStep(key, label);
                auditLateUntil = 0;
                audit.steps.push(auditCur);
                auditSave(true);
            } catch (e) { }
        }

        function auditCloseStep(reason, result, info) {
            const s = auditCur;
            if (!s) return null;
            auditCur = null;
            s.finishedAt = Date.now();
            s.ms = s.finishedAt - s.startedAt;
            s.result = result;
            s.reason = reason || '';
            if (info) s.acts = info.acts || 0;
            s.gold1 = auditGold();
            const base = new Set(s.viewsBase);
            s.leftOpen = auditVisibleViews().filter((n) => !base.has(n));
            Object.keys(auditPending).forEach((cmd) => {
                const n = auditPending[cmd].length;
                if (n) s.noReply[cmd] = (s.noReply[cmd] || 0) + n;
                delete auditPending[cmd];
            });
            auditLast = s;
            auditLateUntil = Date.now() + AUDIT_LATE_WINDOW_MS;
            auditSave(true);
            return s;
        }

        // Gọi TRƯỚC quickRunAfterStep (để chụp bảng còn mở trước khi Quét nhanh dọn hộ).
        function auditRunFinish(info, bad, reason) {
            if (!auditInstalled) return;
            try {
                auditCloseStep(reason, bad ? 'bad' : 'ok', info);     // kết quả chỉ xem ở Probe → Audit, không ghi vào log HUD
            } catch (e) { }
        }

        function auditRunAbort() {
            if (!auditInstalled) return;
            try {
                auditCloseStep('người dùng dừng', 'aborted');
            } catch (e) { }
        }

        // Bảng bị đóng hộ (quickReturnToMain giữa hai bước, closeStrayPopups đầu lượt mới) = tính năng trước chưa tự đóng.
        function auditNoteClosed(names, by) {
            if (!auditInstalled || !names || !names.length) return;
            try {
                const target = auditCur || auditLast;
                const rec = names.map((n) => n + ' (' + by + ')');
                if (target && Date.now() - (target.finishedAt || Date.now()) < 60000) rec.forEach((r) => auditPush(target.cleaned, r, 40));
                else rec.forEach((r) => auditPush(audit.global.preClean, r, 40));
                auditSave();
            } catch (e) { }
        }

        function auditOnLog(message, logType) {
            if (!auditCur) return;
            // Mọi dòng log nhắc Tiên Ngọc (chi/nhận) ghi riêng để thấy khoản chi bị số dư tổng che mất.
            if (/Tiên Ngọc/.test(String(message))) auditPush(auditCur.goldLogs, auditBrief(message, 160), 30);
            if (logType === 'warn') auditPush(auditCur.warnLogs, auditBrief(message, 160), 20);
            else if (logType === 'err' || logType === 'error') auditPush(auditCur.errLogs, auditBrief(message, 160), 20);
        }

        function auditTick(ms) {
            if (!auditCur) return;
            auditStat(auditCur.ticks, ms);
            if (ms > 16) auditCur.ticks.slow++;
        }

        function auditJsError(err, where) {
            if (!auditInstalled) return;
            const rec = { t: Date.now(), where: where || '', msg: auditBrief((err && (err.stack || err.message)) || err, 300) };
            if (auditCur) auditPush(auditCur.jsErrors, rec, 20); else auditPush(audit.global.jsErrors, rec, 30);
            auditSave();
        }

        // ---- Quan sát mạng / lỗi / tips (chỉ bọc, luôn gọi hàm gốc) ----
        function auditWrapCtrls() {
            let wrapped = 0;
            Object.getOwnPropertyNames(window).filter((n) => /Ctrl$/.test(n)).forEach((ctrlName) => {
                let C;
                try { C = window[ctrlName]; } catch (e) { return; }
                if (typeof C !== 'function' || !C.prototype) return;
                const proto = C.prototype;
                Object.getOwnPropertyNames(proto).forEach((m) => {
                    if (!/^(send|sd)[A-Za-z]*\d{3,}$/.test(m)) return;
                    const d = Object.getOwnPropertyDescriptor(proto, m);
                    if (!d || typeof d.value !== 'function' || d.value.__tnAudit || !d.writable) return;
                    const orig = d.value;
                    const label = ctrlName + '.' + m;
                    const w = function tnAuditCtrlWrap() {
                        if (auditCur) auditOnCtrlCall(label, arguments);
                        auditCallStack.push(label);
                        try { return orig.apply(this, arguments); } finally { auditCallStack.pop(); }
                    };
                    w.__tnAudit = orig;
                    try { proto[m] = w; wrapped++; } catch (e) { }
                });
            });
            return wrapped;
        }

        function auditOnCtrlCall(label, args) {
            const s = auditCur;
            const stack = auditStack();
            const ours = auditOurs(stack);
            if (!ours) return;     // game tự gọi: ghi ở sendMsg (gameSends)
            const c = s.calls[label] || (s.calls[label] = { n: 0, cmds: {}, args: [] });
            c.n++;
            auditPush(c.args, auditBrief(Array.prototype.slice.call(args), 70), 4);
            const ctrl = label.split('.')[0];
            const exp = AUDIT_EXPECTED_CTRLS[s.key] || [];
            if (!exp.includes(ctrl) && !AUDIT_SHARED_CTRLS.includes(ctrl)) s.unexpected[label] = (s.unexpected[label] || 0) + 1;
            AUDIT_FORBIDDEN.forEach((f) => {
                if (f.label === label && (!f.args || f.args(args))) auditPush(s.forbidden, { t: Date.now(), label, why: f.why, args: auditBrief(Array.prototype.slice.call(args), 70) }, 10);
            });
        }

        function auditOnSend(cmd) {
            const s = auditCur;
            if (!s || AUDIT_SKIP_CMDS[cmd]) return;
            const stack = auditStack();
            const via = auditCallStack.length ? auditCallStack[auditCallStack.length - 1] : auditGameFrameName(stack);
            if (auditOurs(stack)) {
                s.sendsOurs++;
                s.lastOurSendAt = Date.now();
                const c = s.calls[via] || (s.calls[via] = { n: 0, cmds: {}, args: [] });
                if (via.charAt(0) === '?') c.n++;
                c.cmds[cmd] = (c.cmds[cmd] || 0) + 1;
                if (!AUDIT_REPLY_ELSEWHERE[cmd]) (auditPending[cmd] || (auditPending[cmd] = [])).push(Date.now());
            } else {
                s.sendsGame++;
                const k = via + '|' + cmd;
                s.gameSends[k] = (s.gameSends[k] || 0) + 1;
            }
        }

        function auditOnRecv(cmd, data) {
            const s = auditCur || (Date.now() < auditLateUntil ? auditLast : null);
            if (!s || AUDIT_SKIP_CMDS[cmd]) return;
            const q = auditPending[cmd];
            if (q && q.length) {
                const ms = Date.now() - q.shift();
                const l = s.lat[cmd] || (s.lat[cmd] = { n: 0, sum: 0, max: 0 });
                auditStat(l, ms);
                // Mẫu phản hồi (2 cái gần nhất, tối đa 25 lệnh mỗi lượt) để xem máy chủ thật sự trả gì.
                if (s.replies[cmd] || Object.keys(s.replies).length < 25) {
                    const r = s.replies[cmd] || (s.replies[cmd] = []);
                    r.push(auditBrief(data, 220));
                    if (r.length > 2) r.shift();
                }
            }
            try {
                const fail = window.NNetConst && window.NNetConst.errorCode ? window.NNetConst.errorCode.fail : 0;
                if (data && ((data.res !== undefined && data.res === fail) || (data.code !== undefined && data.code === fail))) {
                    let msg = data.msg;
                    try {
                        if (msg !== undefined && (typeof msg !== 'string' || /^\d+$/.test(msg)) && window.GlobalCtrl) {
                            const g = window.GlobalCtrl.gInst();
                            if (g && typeof g.getNetErrorMsg === 'function') msg = g.getNetErrorMsg(msg) + ' [' + data.msg + ']';
                        }
                    } catch (e) { }
                    auditPush(s.refusals, { t: Date.now(), cmd, msg: auditBrief(msg, 120) }, 30);
                }
            } catch (e) { }
        }

        function auditInstall() {
            if (auditInstalled || !auditEnabled()) return auditInstalled;
            const NM = window.NetMgr;
            if (!NM || !NM.prototype || typeof NM.prototype.sendMsg !== 'function' || !window.GlobalCtrl) return false;
            audit = auditLoad();
            // Bước đang chạy dở khi trang bị tải lại (tự vào lại game).
            audit.steps.forEach((s) => { if (s.result === 'running') { s.result = 'interrupted'; s.reason = 'trang tải lại giữa chừng'; } });

            const origSend = NM.prototype.sendMsg;
            NM.prototype.sendMsg = function tnAuditSendWrap(cmd) {
                try { auditOnSend(cmd); } catch (e) { }
                return origSend.apply(this, arguments);
            };
            const origDispatch = NM.prototype.dispatchEvent;
            if (typeof origDispatch === 'function') {
                NM.prototype.dispatchEvent = function (ev) {
                    try { if (window.NetEvent && ev instanceof window.NetEvent) auditOnRecv(Number(ev.type), ev.netData); } catch (e) { }
                    return origDispatch.apply(this, arguments);
                };
            }
            const GP = window.GlobalCtrl.prototype;
            if (GP && typeof GP.showErrorMsg === 'function') {
                const orig = GP.showErrorMsg;
                GP.showErrorMsg = function (t) {
                    try {
                        const s = auditCur || (Date.now() < auditLateUntil ? auditLast : null);
                        if (s) {
                            let msg = t;
                            if (typeof t !== 'string' || /^\d+$/.test(t)) { try { msg = this.getNetErrorMsg(t) + ' [' + t + ']'; } catch (e) { } }
                            auditPush(s.errMsgs, { t: Date.now(), msg: auditBrief(msg, 120) }, 30);
                        }
                    } catch (e) { }
                    return orig.apply(this, arguments);
                };
            }
            const MP = window.MainCtrl && window.MainCtrl.prototype;
            if (MP && typeof MP.showStringTips === 'function') {
                const orig = MP.showStringTips;
                MP.showStringTips = function (t) {
                    try {
                        const s = auditCur || (Date.now() < auditLateUntil ? auditLast : null);
                        if (s) auditPush(s.tips, auditBrief(t, 100), 30);
                    } catch (e) { }
                    return orig.apply(this, arguments);
                };
            }
            const CU = window.CommonUtils;
            if (CU && typeof CU.printER === 'function') {
                const orig = CU.printER;
                try {
                    CU.printER = function () {
                        try {
                            const msg = auditBrief(Array.prototype.slice.call(arguments).map((a) => (a && a.stack) || a), 240);
                            if (auditCur) auditPush(auditCur.gameErrors, msg, 20); else auditPush(audit.global.gameErrors, msg, 30);
                        } catch (e) { }
                        return orig.apply(this, arguments);
                    };
                } catch (e) { }
            }
            window.addEventListener('error', (ev) => {
                try {
                    const stack = (ev.error && ev.error.stack) || '';
                    if (auditOurs(stack) || auditOurs(ev.filename)) auditJsError(ev.error || ev.message, 'window.onerror');
                    else if (auditCur) auditPush(auditCur.gameErrors, 'uncaught: ' + auditBrief(ev.message, 200), 20);
                } catch (e) { }
            });
            window.addEventListener('unhandledrejection', (ev) => {
                try {
                    const r = ev.reason;
                    if (auditOurs(r && r.stack)) auditJsError(r, 'unhandledrejection');
                } catch (e) { }
            });
            try {
                new PerformanceObserver((list) => {
                    if (!auditCur) return;
                    list.getEntries().forEach((en) => auditStat(auditCur.longTasks, Math.round(en.duration)));
                }).observe({ type: 'longtask', buffered: false });
            } catch (e) { }

            auditInstalled = true;
            const n = auditWrapCtrls();
            // Một số Ctrl có thể được khai báo muộn: quét lại vài lần.
            [5000, 20000, 60000].forEach((ms) => setTimeout(() => { try { auditWrapCtrls(); } catch (e) { } }, ms));
            setInterval(auditPoll, 400);
            try { console.log('[TN audit] đã bật, bọc ' + n + ' hàm send của Ctrl'); } catch (e) { }
            return true;
        }

        function auditPoll() {
            const s = auditCur || (Date.now() < auditLateUntil ? auditLast : null);
            if (!s) return;
            try {
                const vis = auditVisibleViews();
                const base = new Set(s.viewsBase);
                vis.forEach((n) => {
                    if (base.has(n)) return;
                    if (auditCur && !s.viewsSeen.includes(n)) auditPush(s.viewsSeen, n, 60);
                    if (!auditCur && !s.leftOpen.includes(n) && !s.late.includes(n)) auditPush(s.late, n, 20);
                    if (!auditCur && s.result !== 'aborted' && s.leftOpen.includes(n) && Date.now() - s.finishedAt > 1500 && !(s.stillOpen || []).includes(n)) {
                        s.stillOpen = s.stillOpen || [];
                        auditPush(s.stillOpen, n, 20);
                    }
                });
                // Yêu cầu không thấy phản hồi cùng số lệnh.
                const now = Date.now();
                Object.keys(auditPending).forEach((cmd) => {
                    const q = auditPending[cmd];
                    while (q.length && now - q[0] > AUDIT_REPLY_TIMEOUT_MS) {
                        q.shift();
                        s.noReply[cmd] = (s.noReply[cmd] || 0) + 1;
                    }
                });
                auditSave();
            } catch (e) { }
        }

        // ---- Báo cáo ----
        function auditFindings(s) {
            const f = [];
            if (s.forbidden.length) f.push('LỆNH CẤM: ' + s.forbidden.map((x) => x.label + ' ' + x.args).join(', '));
            if (s.jsErrors.length) f.push('lỗi JS của Auto ' + s.jsErrors.length);
            const realRef = s.refusals.filter((x) => !auditBenign(x.msg));
            if (realRef.length) f.push('máy chủ từ chối ' + realRef.length);
            const realErr = s.errMsgs.filter((x) => !/thành công|hành lễ/i.test(x.msg) && !auditBenign(x.msg));
            if (realErr.length) f.push('báo lỗi ' + realErr.length + ' (' + realErr.map((x) => x.msg).slice(0, 3).join(' | ') + ')');
            if (s.errLogs.length) f.push('log ❌ ' + s.errLogs.length + ' (' + s.errLogs.slice(0, 2).join(' | ') + ')');
            if (s.gameErrors.length) f.push('lỗi game ' + s.gameErrors.length);
            const unexp = Object.keys(s.unexpected);
            if (unexp.length) f.push('Ctrl ngoài dự kiến: ' + unexp.join(', '));
            // backpackGetAwardTipsUi = bảng phần thưởng hiện sau khi nhận, runFinish dọn là bình thường.
            const leftPopups = s.leftOpen.filter((n) => (!/^up:/.test(n) || !/disconnect/i.test(n)) && n !== 'backpackGetAwardTipsUi');
            if (leftPopups.length) f.push('tính năng không tự đóng (đã dọn hộ): ' + leftPopups.join(', '));
            if (s.stillOpen && s.stillOpen.length) f.push('VẪN CÒN MỞ sau khi dọn: ' + s.stillOpen.join(', '));
            if (s.late.length) f.push('popup mở trễ: ' + s.late.join(', '));
            const noRep = Object.keys(s.noReply);
            if (noRep.length) f.push('không thấy phản hồi: ' + noRep.map((c) => c + '×' + s.noReply[c]).join(', '));
            if (s.lastOurSendAt && s.finishedAt - s.lastOurSendAt > AUDIT_SLOW_TAIL_MS) f.push('chờ thừa ' + Math.round((s.finishedAt - s.lastOurSendAt) / 1000) + 's sau yêu cầu cuối');
            return f;
        }

        function auditLatSummary(s) {
            let n = 0, sum = 0, max = 0;
            Object.keys(s.lat).forEach((c) => { n += s.lat[c].n; sum += s.lat[c].sum; max = Math.max(max, s.lat[c].max); });
            return n ? { avg: Math.round(sum / n), max, n } : null;
        }

        function auditGoldDelta(s) {
            return Number.isFinite(s.gold0) && Number.isFinite(s.gold1) ? s.gold1 - s.gold0 : null;
        }

        function auditReportLines() {
            const L = [];
            if (!audit) { L.push(auditEnabled() ? 'Audit chưa sẵn sàng (game chưa tải xong).' : 'Audit đang TẮT (bật lại rồi tải lại trang).'); return L; }
            const steps = audit.steps;
            L.push(`AUDIT: ${steps.length} lượt từ ${new Date(audit.startedAt).toLocaleString()}`);
            steps.forEach((s, i) => {
                const lat = auditLatSummary(s);
                const gd = auditGoldDelta(s);
                L.push('');
                L.push(`#${i + 1} ${s.quick ? `[Quét nhanh ${s.quickIdx}/${s.quickTotal}] ` : '[Đơn] '}${s.label} (${s.key}) — ${s.result}${s.reason ? ': ' + s.reason : ''}`);
                L.push(`  bắt đầu ${new Date(s.startedAt).toLocaleTimeString()} · ${runFormatDuration(s.ms || (Date.now() - s.startedAt))} · ${s.acts} thao tác · yêu cầu: ${s.sendsOurs} của Auto, ${s.sendsGame} game tự gửi` +
                    (lat ? ` · phản hồi TB ${lat.avg}ms / max ${lat.max}ms (${lat.n})` : '') +
                    (s.lastOurSendAt && s.finishedAt ? ` · đuôi chờ ${Math.round((s.finishedAt - s.lastOurSendAt) / 1000)}s` : ''));
                L.push(`  nhịp scheduler: ${s.ticks.n} (TB ${s.ticks.n ? (s.ticks.sum / s.ticks.n).toFixed(1) : 0}ms, max ${Math.round(s.ticks.max)}ms, >16ms: ${s.ticks.slow}) · long task: ${s.longTasks.n} (tổng ${s.longTasks.sum}ms, max ${s.longTasks.max}ms)` +
                    (gd !== null ? ` · Tiên Ngọc ${s.gold0} → ${s.gold1} (${gd > 0 ? '+' : ''}${gd})` : ''));
                const calls = Object.keys(s.calls);
                if (calls.length) L.push('  Ctrl đã gọi: ' + calls.map((c) => {
                    const x = s.calls[c];
                    const cmds = Object.keys(x.cmds).map((k) => k + '×' + x.cmds[k]).join('/');
                    return `${c}×${x.n}${cmds ? ' [' + cmds + ']' : ' [không gửi]'}${x.args.length ? ' ' + x.args.join(' ') : ''}`;
                }).join('; '));
                const gs = Object.keys(s.gameSends);
                if (gs.length) L.push('  game tự gửi: ' + gs.map((k) => k + '×' + s.gameSends[k]).join('; '));
                if (s.viewsSeen.length) L.push('  bảng đã mở: ' + s.viewsSeen.join(', '));
                if (s.cleaned.length) L.push('  bị dọn hộ: ' + s.cleaned.join(', '));
                s.refusals.forEach((r) => L.push(`  ✖ từ chối ${r.cmd}: ${r.msg}`));
                Object.keys(s.replies || {}).forEach((c) => L.push(`  phản hồi ${c}: ${s.replies[c].join(' || ')}`));
                s.errMsgs.forEach((r) => L.push(`  ✖ báo lỗi: ${r.msg}`));
                if (s.tips.length) L.push('  tips: ' + s.tips.join(' | '));
                s.forbidden.forEach((r) => L.push(`  ⛔ LỆNH CẤM ${r.label} ${r.args}: ${r.why}`));
                s.jsErrors.forEach((r) => L.push(`  ✖ lỗi JS (${r.where}): ${r.msg}`));
                s.gameErrors.forEach((r) => L.push(`  ✖ lỗi game: ${r}`));
                (s.goldLogs || []).forEach((r) => L.push(`  💎 ${r}`));
                s.errLogs.forEach((r) => L.push(`  log ❌ ${r}`));
                s.warnLogs.forEach((r) => L.push(`  log ⚠ ${r}`));
                const f = auditFindings(s);
                L.push(f.length ? '  => CẦN XEM: ' + f.join(' | ') : '  => OK');
            });
            const g = audit.global;
            if (g.preClean.length) L.push('', 'Bị dọn đầu lượt (không rõ lượt trước): ' + g.preClean.join(', '));
            g.jsErrors.forEach((r) => L.push(`Lỗi JS ngoài lượt (${r.where}): ${r.msg}`));
            if (g.gameErrors.length) L.push('Lỗi game ngoài lượt: ' + g.gameErrors.length + ' (' + g.gameErrors.slice(0, 5).join(' | ') + ')');
            return L;
        }

        window.addEventListener('message', (event) => {
            const data = event.data;
            if (!data || data.source !== PROBE_SOURCE_REQ) return;
            if (data.kind !== 'audit' && data.kind !== 'auditClear' && data.kind !== 'auditToggle') return;
            if (event.source !== window && event.source !== window.top && event.source !== window.parent) return;
            if (!window.DailyDungeonCtrl) return;      // chỉ frame game trả lời
            if (data.kind === 'auditClear') {
                audit = { v: 1, startedAt: Date.now(), steps: [], global: { gameErrors: [], jsErrors: [], preClean: [] } };
                if (auditCur) audit.steps.push(auditCur);
                auditSave(true);
            } else if (data.kind === 'auditToggle') {
                try {
                    if (auditEnabled()) sessionStorage.setItem(AUDIT_OFF_KEY, '1'); else sessionStorage.removeItem(AUDIT_OFF_KEY);
                } catch (e) { }
            }
            const lines = data.kind === 'auditToggle'
                ? [auditEnabled() ? 'Audit sẽ BẬT sau khi tải lại trang.' : 'Audit sẽ TẮT sau khi tải lại trang.']
                : auditReportLines();
            try { window.top.postMessage({ source: PROBE_SOURCE_RES, kind: 'audit', report: { kind: 'audit', controllerCount: 0, lines, data: audit } }, '*'); } catch (e) { }
        });

        (function auditBoot() {
            if (!auditEnabled()) return;
            let tries = 0;
            const t = setInterval(() => {
                tries++;
                try { if (auditInstall() || tries > 600) clearInterval(t); } catch (e) { clearInterval(t); }
            }, 1000);
        })();
