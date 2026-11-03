        // =========================================================================
        // DEBUG: EXPOSURE PROBE (CHỈ ĐỌC)
        // Liệt kê các *Ctrl global và method trên prototype của chúng, gắn cờ nhóm nhạy cảm
        // (mua bán / nạp / nhận thưởng / GM). KHÔNG gọi gInst() và KHÔNG gọi bất kỳ method nào.
        // =========================================================================
        const PROBE_CTRL_CATEGORIES = [
            ['gm', /^GmCtrl$/],
            ['purchase', /Shop|Market|Recharge|Fund|BankBook|Renewal|LuckyDraw|JewelDraw|SuperVip|^VipCtrl$|CommonBuy/],
            ['reward', /Welfare|SevenLogin|TotalSign|Rwd|Reward|^AcvCtrl$|^EmailCtrl$|BackRwd|WarOrder|Propitious|Festival|Anniversary|HalfYear|YearCtrl$|Act(Ctrl)?$/]
        ];
        const PROBE_METHOD_CATEGORIES = [
            ['gm', /^gm($|[A-Z_])|Gm[A-Z]/],
            ['purchase', /buy|purchase|pay|recharge|order/i],
            ['reward', /reward|rwd|award|receive|claim|draw|getGift/i]
        ];

        function probeCollectMethods(ctrl) {
            const methods = new Set();
            let proto = typeof ctrl === 'function' ? ctrl.prototype : null;
            let guard = 0;
            while (proto && proto !== Object.prototype && guard++ < 20) {
                for (const name of Object.getOwnPropertyNames(proto)) {
                    if (name === 'constructor') continue;
                    const desc = Object.getOwnPropertyDescriptor(proto, name);
                    if (desc && typeof desc.value === 'function') methods.add(name);
                }
                proto = Object.getPrototypeOf(proto);
            }
            return [...methods].sort();
        }

        function probeRunExposure() {
            const controllers = [];
            const names = Object.getOwnPropertyNames(window).filter((n) => /Ctrl$/.test(n)).sort();
            for (const name of names) {
                let ctrl;
                try { ctrl = window[name]; } catch (e) { continue; }
                if (typeof ctrl !== 'function') continue;

                const methods = probeCollectMethods(ctrl);
                const flags = PROBE_CTRL_CATEGORIES.filter(([, re]) => re.test(name)).map(([cat]) => cat);
                const flagged = {};
                for (const [cat, re] of PROBE_METHOD_CATEGORIES) {
                    const hit = methods.filter((m) => re.test(m));
                    if (hit.length) flagged[cat] = hit;
                }
                controllers.push({
                    name,
                    hasGInst: typeof ctrl.gInst === 'function',
                    methodCount: methods.length,
                    sendMethods: methods.filter((m) => /^send\d+/.test(m)),
                    onMethods: methods.filter((m) => /^on\d+/.test(m)),
                    ctrlFlags: flags,
                    flaggedMethods: flagged
                });
            }
            return {
                generatedAt: new Date().toISOString(),
                frame: location.href,
                controllerCount: controllers.length,
                controllers
            };
        }

        // Banner hero (super hero) lịch sự kiện: chỉ gọi getter, không gọi send*.
        const PROBE_BANNER_LEGACY = { SuperHeroCtrl: 'activity_id5601', NewSuperHeroCtrl: 'activity_id7701' };
        const PROBE_BANNER_CFG_KEYS = /time|day|open|start|end|activity|period|round|term|name|type|hero|unit|preview|fight|system/i;

        function probePrimitives(obj, keyFilter) {
            const out = {};
            if (!obj || typeof obj !== 'object') return out;
            for (const k of Object.keys(obj)) {
                if (keyFilter && !keyFilter.test(k)) continue;
                const v = obj[k];
                if (v === null || ['number', 'string', 'boolean'].includes(typeof v)) out[k] = v;
                else if (v && typeof v.dataNum === 'number') out[k] = v.dataNum;
            }
            return out;
        }

        function probeRunBanners() {
            const rows = [];
            const errors = [];
            const now = window.NetMgr && NetMgr.gInst().getTime();
            // Chỉ đọc thụ động: không gInst(), không getBaseConfig() (xem bannerPeekInstance).
            const D = bannerPeekInstance(window.DesenoActivityCtrl);
            const deseno = D && D.getCurlModel();
            const openStatus = window.ComCt && ComCt.activityStatus && ComCt.activityStatus.open;

            function describe(ctrlName, uniqueId, activityId) {
                const dat = deseno && deseno.getActDat ? deseno.getActDat(activityId) : undefined;
                const closeTime = dat ? dat.close_time : 0;
                const startTime = dat ? dat.start_time || 0 : 0;
                const endTime = dat ? dat.end_time : 0;
                const state = !dat ? 'no-data' : dat.status === openStatus ? 'open' : (startTime > now ? 'upcoming' : closeTime > now ? 'not-open' : 'ended');
                return {
                    ctrl: ctrlName, uniqueId, activityId, state, startTime, closeTime, endTime,
                    closeInSec: closeTime ? closeTime - now : null,
                    activityData: probePrimitives(dat)
                };
            }

            try {
                const ctrl = bannerPeekInstance(window.SuperHeroEncoreCtrl);
                const model = ctrl && ctrl.getCurlModel();
                const cfgs = model && model.baseConfigDic;
                if (cfgs && Object.keys(cfgs).length) {
                    for (const key of Object.keys(cfgs)) {
                        const cfg = cfgs[key];
                        const row = describe('SuperHeroEncoreCtrl', cfg.activity_id !== undefined ? cfg.activity_id : key, cfg.activity);
                        row.cfg = probePrimitives(cfg, PROBE_BANNER_CFG_KEYS);
                        row.selected = ctrl.currentUniqueId === row.uniqueId;
                        rows.push(row);
                    }
                }
            } catch (e) { errors.push('SuperHeroEncoreCtrl: ' + (e && e.message || e)); }

            for (const name of Object.keys(PROBE_BANNER_LEGACY)) {
                try {
                    const inst = bannerPeekInstance(window[name]);
                    if (!inst) continue;
                    const activityId = window.DesenoActivityConst && DesenoActivityConst.activityIds[PROBE_BANNER_LEGACY[name]];
                    const row = describe(name, inst.getActivityId(), activityId);
                    row.legacyActivityKey = PROBE_BANNER_LEGACY[name];
                    rows.push(row);
                } catch (e) { errors.push(name + ': ' + (e && e.message || e)); }
            }

            return {
                kind: 'banner',
                generatedAt: new Date().toISOString(),
                frame: location.href,
                now,
                rowCount: rows.length,
                controllerCount: rows.length,
                rows,
                errors
            };
        }

        // Màn hình đang mở (chỉ đọc): tên view trong m_viewCacheGroup, lớp, tên method và các trường nguyên thủy.
        // Không gọi gInst() hay bất kỳ method nào. Mở màn hình cần dò trong game rồi bấm nút.
        function probeRunViews() {
            const vm = window.ViewMgr && ViewMgr.gViewMgr;
            const errors = [];
            const views = [];
            if (!vm) errors.push('ViewMgr chưa được tạo');
            for (const dicName of ['m_viewCacheGroup', 'm_upViewCacheGroup']) {
                const dic = vm && vm[dicName];
                if (!dic) continue;
                for (const name of Object.keys(dic)) {
                    try {
                        const v = dic[name];
                        if (!v || v.visible === false) continue;
                        const proto = Object.getPrototypeOf(v);
                        const methods = [];
                        for (let p = proto, g = 0; p && p !== Object.prototype && g++ < 8; p = Object.getPrototypeOf(p)) {
                            const ctor = p.constructor && p.constructor.name;
                            if (ctor && /^(Sprite|DisplayObject|Group|Component|EventDispatcher|HashObject|BaseUi|.*Base)$/.test(ctor) && p !== proto) break;
                            for (const m of Object.getOwnPropertyNames(p)) {
                                const d = Object.getOwnPropertyDescriptor(p, m);
                                if (m !== 'constructor' && d && typeof d.value === 'function' && !/^\$|^_/.test(m)) methods.push(m);
                            }
                        }
                        views.push({
                            group: dicName,
                            name,
                            className: (proto.constructor && proto.constructor.name) || '',
                            methods: [...new Set(methods)].sort().slice(0, 120),
                            fields: probePrimitives(v, /^(m_|cur|sel|day|wave|round|stage|level|lv|num|count|buff|state|status)/i)
                        });
                    } catch (e) { errors.push(name + ': ' + (e && e.message || e)); }
                }
            }
            return { kind: 'views', generatedAt: new Date().toISOString(), frame: location.href, controllerCount: views.length, views, errors };
        }

        window.addEventListener('message', (event) => {
            const data = event.data;
            if (!data || data.source !== PROBE_SOURCE_REQ) return;
            if (event.source !== window && event.source !== window.top && event.source !== window.parent) return;
            let report;
            try {
                report = data.kind === 'banner' ? probeRunBanners() : (data.kind === 'views' ? probeRunViews() : probeRunExposure());
            } catch (e) {
                report = { error: String(e && e.message || e), controllers: [], controllerCount: 0 };
            }
            try {
                window.top.postMessage({ source: PROBE_SOURCE_RES, kind: data.kind || 'exposure', report }, '*');
            } catch (e) { }
        });
