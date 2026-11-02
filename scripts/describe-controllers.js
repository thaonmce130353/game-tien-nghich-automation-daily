// Builds docs/controllers/INDEX.md, docs/controllers/<Name>.md and docs/data/game-controller-methods.json
// from a probe export (docs/data/tn-exposure-probe.json) plus a static read of the game bundle.
// Read-only: it parses text, never runs game code, and records structure (names, protocol ids,
// request field names, handler behaviour flags), not the game's source.
const fs = require('node:fs');
const path = require('node:path');

const docsDir = path.resolve(__dirname, '..', 'docs');
const dataDir = path.join(docsDir, 'data');
const controllersDir = path.join(docsDir, 'controllers');
const probePath = path.join(dataDir, 'tn-exposure-probe.json');
const bundlePath = path.join(docsDir, 'game-client', 'main.min_eef72ae3.js');

// Purpose per controller. A trailing "(guess)" means inferred from the name only.
const GLOSSARY = {
    ActWarOrderCtrl: 'Activity battle pass ("war order" / Chiến Lệnh): tiered rewards, paid track.',
    AcvCtrl: 'Achievements and daily activity tasks, including the activity-point chests.',
    AdCtrl: 'Advertisement / video-ad reward flow (guess).',
    AdvCtrl: 'Advancement / upgrade screens (guess).',
    AlertCtrl: 'Generic alert and confirm dialogs.',
    AnniversaryCtrl: 'Anniversary event.',
    ArenaCtrl: 'PvP arena (Đấu Tiên Đài): opponents, battles, ranking.',
    AscendRealmCtrl: 'Realm ascension / breakthrough.',
    BackRwdCtrl: 'Comeback / returning-player rewards.',
    BackpackCtrl: 'Inventory: items, usage, selling.',
    BankBookCtrl: 'Bank-book style deposit-and-claim recharge reward (guess).',
    BnqdCtrl: 'Unknown event system (name not decodable).',
    CGCtrl: 'Cutscenes (CG).',
    ChangePowerCtrl: 'Combat-power change popup.',
    ChatCtrl: 'Chat channels and messaging.',
    ChatHBCtrl: 'Chat red envelopes (hongbao).',
    CityCtrl: 'Main city scene and buildings.',
    ComEmbattleCtrl: 'Common formation presets.',
    CombCtrl: 'Combination / synergy bonuses (guess).',
    CommonBuyGroupCtrl: 'Shared purchase-dialog helper used by shops and events.',
    DailyDungeonCtrl: 'Daily dungeons, Thông Thiên Tháp tower and running-man modes.',
    DesenoActivityCtrl: 'Large hub for timed activities.',
    DevilSeaCtrl: 'Devil Sea (Ma Hải) event.',
    DgnCtrl: 'Dungeon / stage flow (guess).',
    DiceCtrl: 'Dice mini-game.',
    DivineUnionCtrl: 'Divine union / pairing system (guess).',
    DoubleTeamDungeonCtrl: 'Two-team cooperative dungeon.',
    DragonBoatCtrl: 'Dragon Boat festival event.',
    DragonBoatFestCtrl: 'Dragon Boat festival event, second variant.',
    DzrCtrl: 'Unknown system (name not decodable).',
    ETCtrl: 'Unknown system (name not decodable).',
    ElrCtrl: 'Unknown system (name not decodable).',
    EmailCtrl: 'Mailbox: list, read, claim attachments.',
    EmbattleCtrl: 'Battle formation setup.',
    EngraveCtrl: 'Equipment engraving.',
    EpncCtrl: 'Unknown system (name not decodable).',
    ExMatterCtrl: 'Unknown material system (guess).',
    ExtremeYinCtrl: 'Cực Âm Địa dungeon.',
    FaZhenMirageCtrl: 'Fa Zhen (array) mirage feature.',
    FashionCtrl: 'Fashion / skins.',
    FashionRecCtrl: 'Fashion recharge event.',
    FestivalActCtrl: 'Generic festival activity.',
    FightCtrl: 'Combat engine: fight frames, playback, skip, finish.',
    FireTreeCtrl: 'Fire Tree event.',
    FriendCtrl: 'Friends (Tiên Hữu): list, requests, gifting.',
    FullMoonCtrl: 'Full-moon event.',
    FunOpenCtrl: 'Feature unlock gating by level or quest.',
    FundsCtrl: 'Growth / investment funds with staged rewards.',
    GACtrl: 'Unknown, possibly analytics (guess).',
    GLHTZhanlingCtrl: 'Season battle pass ("zhanling") (guess).',
    GameCenterCtrl: 'Game-center / platform hub (guess).',
    GamePreviewCtrl: 'Upcoming-content preview (guess).',
    GetWayCtrl: '"Get way": jumps from an item to where it can be obtained.',
    GldBsCtrl: 'Guild boss (guess).',
    GldWrCtrl: 'Guild war.',
    GlobalCtrl: 'Global helpers: error and tip messages, shared state.',
    GmCtrl: 'GM command sender (send10110Msg).',
    GnrlCtrl: 'Generals / heroes (guess).',
    GodWeaponCtrl: 'Divine weapons.',
    GuideCtrl: 'Tutorial guide.',
    GuildCtrl: 'Guild: membership, donation, tasks.',
    GzlCtrl: 'Unknown system (name not decodable).',
    HalfYearCtrl: 'Half-year anniversary event.',
    HangupCtrl: 'Idle (hangup) rewards and quick-hang purchase.',
    HeavenCtrl: 'Heaven realm content (guess).',
    HeavenWarCtrl: 'Heaven war event (guess).',
    HeroCtrl: 'Heroes: roster, upgrade, equipment.',
    HeroFuseCtrl: 'Hero fusion.',
    HorseYearCtrl: 'Year-of-the-Horse event.',
    ItemColorStoneCtrl: 'Colour stones / gem items (guess).',
    JewelDrawCtrl: 'Jewel gacha draw.',
    KFRainRuinsCtrl: 'Cross-server Rain Ruins event.',
    KfLolCtrl: 'Cross-server competitive mode (guess).',
    LabourDayCtrl: 'Labour Day event.',
    LanguageCtrl: 'Localization.',
    LeagueCraftCtrl: 'League crafting / league content (guess).',
    LeagueCtrl: 'League / alliance system (guess).',
    LoadCtrl: 'Asset loading screen.',
    LoginCtrl: 'Login, server select and reconnect.',
    LuckyDrawCtrl: 'Lottery draw.',
    MagicEmbattleCtrl: 'Magic formation setup.',
    MainCtrl: 'Main UI and scene shell.',
    MarketCtrl: 'Player market (guess).',
    MeituanCtrl: 'Meituan partner promotion (guess).',
    MellowAskCtrl: 'Unknown system (name not decodable).',
    MidAutumnActivityCtrl: 'Mid-Autumn festival event.',
    MxActCtrl: 'Unknown activity (name not decodable).',
    MzCtrl: 'Unknown system (name not decodable).',
    NationalActCtrl: 'National Day event.',
    NewDevilSeaCtrl: 'Revised Devil Sea event.',
    NewSpiritBeastCtrl: 'Revised spirit beast system.',
    NewSuperHeroCtrl: 'Revised super hero system.',
    NewZhongQiuCtrl: 'Revised Mid-Autumn (Zhongqiu) event.',
    OneYuanRenewalCtrl: 'One-yuan renewal / subscription offer.',
    OriginCtrl: 'Unknown, possibly origin / source tracking (guess).',
    PlatCtrl: 'Platform and SDK integration, sharing, platform activities.',
    PropitiousActivityCtrl: '"Propitious" lucky-themed event.',
    PropsCtrl: 'Item / prop definitions and usage.',
    QQCtrl: 'QQ platform features.',
    QiXiFestivalActCtrl: 'Qixi festival event.',
    QingmingCtrl: 'Qingming festival event.',
    QuizCtrl: 'Quiz event.',
    RacingCtrl: 'Racing mini-game.',
    RainRuinsCtrl: 'Rain Ruins event.',
    RankCtrl: 'Leaderboards and worship (BXH).',
    RankRwCtrl: 'Ranking rewards.',
    RechargeCtrl: 'Top-up and VIP packages, purchase checks.',
    RecruitCtrl: 'Hero recruit / gacha.',
    RedCtrl: 'Red-dot notification state.',
    RelicsAdvCtrl: 'Relic advancement.',
    RiseGoldCtrl: 'Gold-gain boost event (guess).',
    RoleCtrl: 'Player character info.',
    SamsaraFundCtrl: 'Samsara fund (reincarnation-themed fund).',
    ScsmCtrl: 'Unknown system (name not decodable).',
    SeTgtCtrl: 'Unknown target/task system (guess).',
    ServerMergeActCtrl: 'Server-merge compensation event.',
    SettingCtrl: 'Settings and account options.',
    SevenLoginCtrl: 'Seven-day login rewards.',
    ShopCtrl: 'Shops and item purchase.',
    SidePlotCtrl: 'Side story content.',
    SongliGifCtrl: 'Gift event (guess).',
    SpiritAnimalCtrl: 'Spirit animals.',
    SpiritBeastCtrl: 'Spirit beasts.',
    StealingHeavenCtrl: 'Stealing Heaven feature.',
    SuperFaBaoCtrl: 'Super magic treasure system.',
    SuperFaZhenCtrl: 'Super array (fa zhen) system.',
    SuperForeverCtrl: 'Super "forever" lifetime offer (guess).',
    SuperHeroCtrl: 'Super heroes.',
    SuperHeroEncoreCtrl: 'Super hero re-run event.',
    SuperSptAniCtrl: 'Super spirit animals.',
    SuperVipCtrl: 'Super VIP tier.',
    SurveyCtrl: 'Questionnaire.',
    SwdCtrl: 'Sword-themed content (guess).',
    SwingGiftCtrl: 'Swing gift event (guess).',
    SwordDirCtrl: 'Sword direction / sword path content (guess).',
    TaxLyCtrl: 'Tax-themed event (guess).',
    TianGongLuCtrl: 'Tiangong Lu content.',
    TipsCtrl: 'Tip popups.',
    TotalSignCtrl: 'Cumulative sign-in.',
    TransGodCtrl: 'God transformation.',
    TravelCtrl: 'Travel / exploration.',
    UpdateCtrl: 'Version update checks.',
    VdoCtrl: 'Video playback.',
    VipCtrl: 'VIP level and privileges.',
    VnOffLieCtrl: 'Vietnam offline / lie-themed activity (guess).',
    VnVideoActCtrl: 'Vietnam video activity.',
    WHPracticeCtrl: 'Practice mode (guess).',
    WanJieDingZunCtrl: 'Wanjie Dingzun content.',
    WarlordsCtrl: 'Warlords contest.',
    WarlordsKfCtrl: 'Cross-server warlords contest.',
    WeixinCtrl: 'WeChat platform features.',
    WelfareCtrl: 'Welfare hub: login, sign-in, recurring claims.',
    WoodCarveCtrl: 'Wood carving mini-game.',
    WoodStarCtrl: 'Wood star event.',
    XianYuanCtrl: 'Tiên Duyên gifts.',
    XunBCtrl: 'Treasure hunt (guess).',
    YD2026Ctrl: '2026 new-year event.',
    YMAbyssCtrl: 'Vực U Minh (abyss) dungeon.',
    YXPracticeCtrl: 'Practice mode (guess).',
    YsEctCtrl: 'Unknown system (name not decodable).',
    YuWaiTreasureCtrl: 'Outer-realm treasure.',
    YuanXiaoCtrl: 'Lantern festival (Yuanxiao) event.'
};

const METHOD_KINDS = [
    ['send', /^send\d+/, 'network request'],
    ['response', /^(scmd|on)\d+/, 'server response handler'],
    ['ui', /^(open|show|close|hide|clk|click|cBtn)/, 'opens or drives a UI view'],
    ['redDot', /(^red|Red$|RedDot)/, 'red-dot notification'],
    ['predicate', /^(is|has|can|check|bIs|bCan)/, 'boolean / state check'],
    ['getter', /^(get|g[A-Z]|query)/, 'getter'],
    ['update', /^(set|up|update|refresh|init|reset|clear)/, 'state update'],
    ['other', /./, 'other']
];

function methodKind(name) {
    for (const [kind, re] of METHOD_KINDS) if (re.test(name)) return kind;
    return 'other';
}

function readBody(src, openBraceIndex) {
    let depth = 0;
    for (let i = openBraceIndex; i < src.length; i++) {
        const ch = src[i];
        if (ch === '"' || ch === "'" || ch === '`') {
            const q = ch;
            i++;
            while (i < src.length && src[i] !== q) { if (src[i] === '\\') i++; i++; }
        } else if (ch === '{') depth++;
        else if (ch === '}') { depth--; if (depth === 0) return src.slice(openBraceIndex, i + 1); }
    }
    return '';
}

function extractMethods(moduleSrc) {
    const methods = {};
    const re = /\be\.prototype\.(\w+)=function\(([^)]*)\)\{/g;
    let m;
    while ((m = re.exec(moduleSrc))) {
        const open = m.index + m[0].length - 1;
        methods[m[1]] = { params: m[2] ? m[2].split(',').filter(Boolean).length : 0, body: readBody(moduleSrc, open) };
    }
    return methods;
}

function requestInfo(body) {
    const call = body.match(/(?:snMsg|sendMsg)\(([^,)]+)(?:,([^)]+))?\)/);
    if (!call) return { proto: null, keys: [] };
    const num = call[1].match(/\d+(?:e\d+)?/);
    const proto = num ? String(Number(num[0])) : null;
    const arg = (call[2] || '').trim();
    let keys = [];
    if (arg.startsWith('{')) keys = [...body.matchAll(/[{,](\w+):/g)].map((x) => x[1]);
    else if (/^\w+$/.test(arg)) keys = [...body.matchAll(new RegExp('\\b' + arg + '\\.(\\w+)=', 'g'))].map((x) => x[1]);
    return { proto, keys: [...new Set(keys)] };
}

function handlerInfo(methods, proto) {
    if (!proto) return null;
    const name = [`scmd${proto}`, `scmd${proto}Handler`, `on${proto}`].find((n) => methods[n]);
    if (!name) return { name: null, notes: ['handler not in this controller'] };
    const b = methods[name].body;
    const notes = [];
    if (/showErrorMsg/.test(b)) notes.push('shows server error');
    if (/m_curModel\.|this\.\w+=/.test(b)) notes.push('updates local state');
    const chain = [...new Set([...b.matchAll(/\.send(\d+)\(/g)].map((x) => x[1]))];
    if (chain.length) notes.push('re-requests ' + chain.map((c) => 'send' + c).join(','));
    if (/showView|openElUi|ViewConst/.test(b)) notes.push('opens UI');
    return { name, notes };
}

function main() {
    const probe = JSON.parse(fs.readFileSync(probePath, 'utf8'));
    const bundle = fs.readFileSync(bundlePath, 'utf8');
    const starts = [...bundle.matchAll(/function\(t,e\)\{var i=function\(t\)\{function e\(\)/g)].map((x) => x.index);
    const out = { source: { probe: path.basename(probePath), generatedAt: probe.generatedAt }, controllers: {} };
    const index = [];
    fs.rmSync(controllersDir, { recursive: true, force: true });
    fs.mkdirSync(controllersDir, { recursive: true });
    fs.mkdirSync(dataDir, { recursive: true });

    for (const c of probe.controllers) {
        const assign = bundle.indexOf(`window.${c.name}=`);
        let methods = {};
        if (assign >= 0) {
            const start = [...starts].reverse().find((s) => s < assign);
            if (start !== undefined) methods = extractMethods(bundle.slice(start, assign));
        }

        const sends = c.sendMethods.map((name) => {
            const own = methods[name];
            if (!own) return { name, inherited: true };
            const req = requestInfo(own.body);
            const clientChecks = /\bif\(|showErrorMsg|\?/.test(own.body);
            return {
                name,
                params: own.params,
                proto: req.proto,
                requestFields: req.keys,
                clientSideChecks: clientChecks,
                response: handlerInfo(methods, req.proto)
            };
        });
        const kinds = {};
        for (const name of Object.keys(methods)) {
            const k = methodKind(name);
            (kinds[k] = kinds[k] || []).push(name);
        }
        const inheritedCount = c.methodCount - Object.keys(methods).length;
        out.controllers[c.name] = {
            purpose: GLOSSARY[c.name] || 'No description yet.',
            hasGInst: c.hasGInst,
            flags: c.ctrlFlags,
            methodCount: c.methodCount,
            ownMethodCount: Object.keys(methods).length,
            inheritedFromBase: inheritedCount > 0 ? inheritedCount : 0,
            kinds,
            flaggedMethods: c.flaggedMethods,
            sends
        };

        const md = [`# ${c.name}`, ''];
        md.push(GLOSSARY[c.name] || 'No description yet.', '');
        md.push(`- gInst: ${c.hasGInst ? 'yes' : 'no'} | methods: ${c.methodCount} (own ${Object.keys(methods).length}) | send: ${c.sendMethods.length}${c.ctrlFlags.length ? ' | flags: ' + c.ctrlFlags.join(', ') : ''}`);
        const kindSummary = Object.entries(kinds).map(([k, v]) => `${k} ${v.length}`).join(', ');
        if (kindSummary) md.push(`- own methods by kind: ${kindSummary}`);
        const flaggedLines = Object.entries(c.flaggedMethods).map(([cat, list]) => `${cat}: ${list.join(', ')}`);
        if (flaggedLines.length) md.push(`- name-flagged methods: ${flaggedLines.join(' | ')}`);
        md.push('');
        if (sends.length) {
            md.push('| Send method | Proto | Request fields | Client check | Response handler |', '| --- | --- | --- | --- | --- |');
            for (const s of sends) {
                if (s.inherited) { md.push(`| ${s.name} | - | - | - | inherited |`); continue; }
                const h = s.response;
                const hs = h ? (h.name ? `${h.name}: ${h.notes.join('; ') || 'no notable effect'}` : h.notes.join('; ')) : '-';
                md.push(`| ${s.name} | ${s.proto || '-'} | ${s.requestFields.join(', ') || (s.params ? `(${s.params} arg)` : 'none')} | ${s.clientSideChecks ? 'yes' : 'no'} | ${hs} |`);
            }
            md.push('');
        }
        for (const [k, list] of Object.entries(kinds)) {
            if (k !== 'send' && k !== 'response') md.push(`**${k}** (${list.length}): ${list.join(' ')}`, '');
        }
        fs.writeFileSync(path.join(controllersDir, `${c.name}.md`), md.join('\n'));
        const flagLetters = [...new Set([...c.ctrlFlags, ...Object.keys(c.flaggedMethods)])].map((f) => f[0].toUpperCase()).sort().join('');
        const purpose = (GLOSSARY[c.name] || '').replace(/\|/g, '/');
        index.push(`| [${c.name}](${c.name}.md) | ${purpose} | ${c.sendMethods.length} | ${flagLetters || '-'} |`);
    }

    fs.writeFileSync(path.join(dataDir, 'game-controller-methods.json'), JSON.stringify(out));
    fs.writeFileSync(path.join(controllersDir, 'INDEX.md'), [
        '# Controller index',
        '',
        `Generated from \`data/${path.basename(probePath)}\` (${probe.controllerCount} controllers, probed ${probe.generatedAt}) plus a static read of the bundle. Open one \`<Name>.md\` for its sender table and method names.`,
        'Purposes marked "(guess)" come from the name only. Flags: P = purchase, R = reward/claim, G = GM (name patterns, so approximate). Request fields are names only; server rules are unknown.',
        'Regenerate: `node scripts/describe-controllers.js`.',
        '',
        '| Controller | Purpose | Senders | Flags |',
        '| --- | --- | --- | --- |',
        ...index,
        ''
    ].join('\n'));
    const total = Object.values(out.controllers).reduce((a, c) => a + c.sends.length, 0);
    const noDesc = Object.entries(out.controllers).filter(([, c]) => c.purpose === 'No description yet.').map(([n]) => n);
    console.log(`Wrote ${Object.keys(out.controllers).length} controllers, ${total} send methods. Without description: ${noDesc.join(', ') || 'none'}`);
}

main();
