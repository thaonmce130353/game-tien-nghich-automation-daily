# Game controller reference

This is a non-verbatim runtime inventory for future feature work. It records
controller identifiers and where the game client loads its code; it does not
archive the game's proprietary implementation.

## Capture details

- Observed: 2026-11-01
- Game page: `https://tiennghich.joyplay.vn/play`
- Game client frame: `https://tiennghich.acejoygame.com/vnmaster/index_vnh5.html`
- Runtime assets observed:
  - `https://tiennghich.acejoygame.com/vnmaster/js/game.min_30b4cc21.js`
  - `https://tiennghich.acejoygame.com/vnmaster/js/main.min_eef72ae3.js`
- Inventory: 162 global names ending in `Ctrl` in the loaded game frame.

These are runtime observations, not a stable or exhaustive public API. The game
can change its assets, names, methods, and behavior at any time.

## Controller globals

```text
ActWarOrderCtrl, AcvCtrl, AdCtrl, AdvCtrl, AlertCtrl, AnniversaryCtrl,
ArenaCtrl, AscendRealmCtrl, BackRwdCtrl, BackpackCtrl, BankBookCtrl, BnqdCtrl,
CGCtrl, ChangePowerCtrl, ChatCtrl, ChatHBCtrl, CityCtrl, ComEmbattleCtrl,
CombCtrl, CommonBuyGroupCtrl, DailyDungeonCtrl, DesenoActivityCtrl,
DevilSeaCtrl, DgnCtrl, DiceCtrl, DivineUnionCtrl, DoubleTeamDungeonCtrl,
DragonBoatCtrl, DragonBoatFestCtrl, DzrCtrl, ETCtrl, ElrCtrl, EmailCtrl,
EmbattleCtrl, EngraveCtrl, EpncCtrl, ExMatterCtrl, ExtremeYinCtrl,
FaZhenMirageCtrl, FashionCtrl, FashionRecCtrl, FestivalActCtrl, FightCtrl,
FireTreeCtrl, FriendCtrl, FullMoonCtrl, FunOpenCtrl, FundsCtrl, GACtrl,
GLHTZhanlingCtrl, GameCenterCtrl, GamePreviewCtrl, GetWayCtrl, GldBsCtrl,
GldWrCtrl, GlobalCtrl, GmCtrl, GnrlCtrl, GodWeaponCtrl, GuideCtrl, GuildCtrl,
GzlCtrl, HalfYearCtrl, HangupCtrl, HeavenCtrl, HeavenWarCtrl, HeroCtrl,
HeroFuseCtrl, HorseYearCtrl, ItemColorStoneCtrl, JewelDrawCtrl,
KFRainRuinsCtrl, KfLolCtrl, LabourDayCtrl, LanguageCtrl, LeagueCraftCtrl,
LeagueCtrl, LoadCtrl, LoginCtrl, LuckyDrawCtrl, MagicEmbattleCtrl, MainCtrl,
MarketCtrl, MeituanCtrl, MellowAskCtrl, MidAutumnActivityCtrl, MxActCtrl,
MzCtrl, NationalActCtrl, NewDevilSeaCtrl, NewSpiritBeastCtrl, NewSuperHeroCtrl,
NewZhongQiuCtrl, OneYuanRenewalCtrl, OriginCtrl, PlatCtrl,
PropitiousActivityCtrl, PropsCtrl, QQCtrl, QiXiFestivalActCtrl, QingmingCtrl,
QuizCtrl, RacingCtrl, RainRuinsCtrl, RankCtrl, RankRwCtrl, RechargeCtrl,
RecruitCtrl, RedCtrl, RelicsAdvCtrl, RiseGoldCtrl, RoleCtrl, SamsaraFundCtrl,
ScsmCtrl, SeTgtCtrl, ServerMergeActCtrl, SettingCtrl, SevenLoginCtrl,
ShopCtrl, SidePlotCtrl, SongliGifCtrl, SpiritAnimalCtrl, SpiritBeastCtrl,
StealingHeavenCtrl, SuperFaBaoCtrl, SuperFaZhenCtrl, SuperForeverCtrl,
SuperHeroCtrl, SuperHeroEncoreCtrl, SuperSptAniCtrl, SuperVipCtrl,
SurveyCtrl, SwdCtrl, SwingGiftCtrl, SwordDirCtrl, TaxLyCtrl, TianGongLuCtrl,
TipsCtrl, TotalSignCtrl, TransGodCtrl, TravelCtrl, UpdateCtrl, VdoCtrl,
VipCtrl, VnOffLieCtrl, VnVideoActCtrl, WHPracticeCtrl, WanJieDingZunCtrl,
WarlordsCtrl, WarlordsKfCtrl, WeixinCtrl, WelfareCtrl, WoodCarveCtrl,
WoodStarCtrl, XianYuanCtrl, XunBCtrl, YD2026Ctrl, YMAbyssCtrl, YXPracticeCtrl,
YsEctCtrl, YuWaiTreasureCtrl, YuanXiaoCtrl
```

## Inspect method names without calling game actions

In the game frame's developer console, this lists method names on a controller
and its prototype chain. It does not invoke those methods or send game requests:

```js
function listControllerMethods(controller) {
  let prototype = typeof controller === "function"
    ? controller.prototype
    : controller;
  const methods = new Set();

  while (prototype && prototype !== Object.prototype) {
    for (const name of Object.getOwnPropertyNames(prototype)) {
      if (name !== "constructor" && typeof prototype[name] === "function") {
        methods.add(name);
      }
    }
    prototype = Object.getPrototypeOf(prototype);
  }

  return [...methods].sort();
}

listControllerMethods(window.EmailCtrl);
```

Inspect one controller at a time and verify its current state, UI handler, and
server-confirmation path before using a method in automation. Do not invoke
unknown controller methods during investigation; they may mutate game state,
spend resources, or send requests.

## Existing extension references

The extension already uses these controller flows in
[`daily-routines.js`](../extension/src/content/features/daily-routines.js):

- Mail quick claim: `EmailCtrl`
- BXH worship: `RankCtrl`
- Daily task and activity claims: `AcvCtrl`

Keep feature-specific game logic in its corresponding module under
[`extension/src/content/features/`](../extension/src/content/features/).
