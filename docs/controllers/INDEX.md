# Controller index

Generated from `data/tn-exposure-probe.json` (162 controllers, probed 2026-11-02T07:04:14.450Z) plus a static read of the bundle. Open one `<Name>.md` for its sender table and method names.
Purposes marked "(guess)" come from the name only. Flags: P = purchase, R = reward/claim, G = GM (name patterns, so approximate). Request fields are names only; server rules are unknown.
Regenerate: `node scripts/describe-controllers.js`.

| Controller | Purpose | Senders | Flags |
| --- | --- | --- | --- |
| [ActWarOrderCtrl](ActWarOrderCtrl.md) | Activity battle pass ("war order" / Chiến Lệnh): tiered rewards, paid track. | 1 | PR |
| [AcvCtrl](AcvCtrl.md) | Achievements and daily activity tasks, including the activity-point chests. | 13 | GPR |
| [AdCtrl](AdCtrl.md) | Advertisement / video-ad reward flow (guess). | 1 | PR |
| [AdvCtrl](AdvCtrl.md) | Advancement / upgrade screens (guess). | 24 | PR |
| [AlertCtrl](AlertCtrl.md) | Generic alert and confirm dialogs. | 0 | - |
| [AnniversaryCtrl](AnniversaryCtrl.md) | Anniversary event. | 17 | R |
| [ArenaCtrl](ArenaCtrl.md) | PvP arena (Đấu Tiên Đài): opponents, battles, ranking. | 1 | PR |
| [AscendRealmCtrl](AscendRealmCtrl.md) | Realm ascension / breakthrough. | 2 | - |
| [BackRwdCtrl](BackRwdCtrl.md) | Comeback / returning-player rewards. | 0 | R |
| [BackpackCtrl](BackpackCtrl.md) | Inventory: items, usage, selling. | 6 | R |
| [BankBookCtrl](BankBookCtrl.md) | Bank-book style deposit-and-claim recharge reward (guess). | 3 | P |
| [BnqdCtrl](BnqdCtrl.md) | Unknown event system (name not decodable). | 2 | - |
| [CGCtrl](CGCtrl.md) | Cutscenes (CG). | 2 | - |
| [ChangePowerCtrl](ChangePowerCtrl.md) | Combat-power change popup. | 0 | - |
| [ChatCtrl](ChatCtrl.md) | Chat channels and messaging. | 10 | - |
| [ChatHBCtrl](ChatHBCtrl.md) | Chat red envelopes (hongbao). | 6 | - |
| [CityCtrl](CityCtrl.md) | Main city scene and buildings. | 2 | - |
| [ComEmbattleCtrl](ComEmbattleCtrl.md) | Common formation presets. | 2 | - |
| [CombCtrl](CombCtrl.md) | Combination / synergy bonuses (guess). | 0 | R |
| [CommonBuyGroupCtrl](CommonBuyGroupCtrl.md) | Shared purchase-dialog helper used by shops and events. | 6 | PR |
| [DailyDungeonCtrl](DailyDungeonCtrl.md) | Daily dungeons, Thông Thiên Tháp tower and running-man modes. | 10 | GPR |
| [DesenoActivityCtrl](DesenoActivityCtrl.md) | Large hub for timed activities. | 41 | PR |
| [DevilSeaCtrl](DevilSeaCtrl.md) | Devil Sea (Ma Hải) event. | 12 | PR |
| [DgnCtrl](DgnCtrl.md) | Dungeon / stage flow (guess). | 0 | - |
| [DiceCtrl](DiceCtrl.md) | Dice mini-game. | 0 | PR |
| [DivineUnionCtrl](DivineUnionCtrl.md) | Divine union / pairing system (guess). | 0 | - |
| [DoubleTeamDungeonCtrl](DoubleTeamDungeonCtrl.md) | Two-team cooperative dungeon. | 5 | R |
| [DragonBoatCtrl](DragonBoatCtrl.md) | Dragon Boat festival event. | 9 | PR |
| [DragonBoatFestCtrl](DragonBoatFestCtrl.md) | Dragon Boat festival event, second variant. | 8 | R |
| [DzrCtrl](DzrCtrl.md) | Unknown system (name not decodable). | 0 | R |
| [ETCtrl](ETCtrl.md) | Unknown system (name not decodable). | 0 | GR |
| [ElrCtrl](ElrCtrl.md) | Unknown system (name not decodable). | 0 | P |
| [EmailCtrl](EmailCtrl.md) | Mailbox: list, read, claim attachments. | 5 | R |
| [EmbattleCtrl](EmbattleCtrl.md) | Battle formation setup. | 8 | - |
| [EngraveCtrl](EngraveCtrl.md) | Equipment engraving. | 9 | GPR |
| [EpncCtrl](EpncCtrl.md) | Unknown system (name not decodable). | 0 | - |
| [ExMatterCtrl](ExMatterCtrl.md) | Unknown material system (guess). | 3 | P |
| [ExtremeYinCtrl](ExtremeYinCtrl.md) | Cực Âm Địa dungeon. | 10 | P |
| [FaZhenMirageCtrl](FaZhenMirageCtrl.md) | Fa Zhen (array) mirage feature. | 4 | R |
| [FashionCtrl](FashionCtrl.md) | Fashion / skins. | 5 | - |
| [FashionRecCtrl](FashionRecCtrl.md) | Fashion recharge event. | 5 | PR |
| [FestivalActCtrl](FestivalActCtrl.md) | Generic festival activity. | 9 | PR |
| [FightCtrl](FightCtrl.md) | Combat engine: fight frames, playback, skip, finish. | 5 | GR |
| [FireTreeCtrl](FireTreeCtrl.md) | Fire Tree event. | 11 | PR |
| [FriendCtrl](FriendCtrl.md) | Friends (Tiên Hữu): list, requests, gifting. | 15 | - |
| [FullMoonCtrl](FullMoonCtrl.md) | Full-moon event. | 13 | PR |
| [FunOpenCtrl](FunOpenCtrl.md) | Feature unlock gating by level or quest. | 0 | - |
| [FundsCtrl](FundsCtrl.md) | Growth / investment funds with staged rewards. | 2 | PR |
| [GACtrl](GACtrl.md) | Unknown, possibly analytics (guess). | 11 | R |
| [GLHTZhanlingCtrl](GLHTZhanlingCtrl.md) | Season battle pass ("zhanling") (guess). | 0 | R |
| [GameCenterCtrl](GameCenterCtrl.md) | Game-center / platform hub (guess). | 0 | - |
| [GamePreviewCtrl](GamePreviewCtrl.md) | Upcoming-content preview (guess). | 2 | - |
| [GetWayCtrl](GetWayCtrl.md) | "Get way": jumps from an item to where it can be obtained. | 0 | - |
| [GldBsCtrl](GldBsCtrl.md) | Guild boss (guess). | 9 | - |
| [GldWrCtrl](GldWrCtrl.md) | Guild war. | 11 | R |
| [GlobalCtrl](GlobalCtrl.md) | Global helpers: error and tip messages, shared state. | 0 | R |
| [GmCtrl](GmCtrl.md) | GM command sender (send10110Msg). | 1 | G |
| [GnrlCtrl](GnrlCtrl.md) | Generals / heroes (guess). | 5 | - |
| [GodWeaponCtrl](GodWeaponCtrl.md) | Divine weapons. | 12 | - |
| [GuideCtrl](GuideCtrl.md) | Tutorial guide. | 3 | R |
| [GuildCtrl](GuildCtrl.md) | Guild: membership, donation, tasks. | 58 | R |
| [GzlCtrl](GzlCtrl.md) | Unknown system (name not decodable). | 0 | R |
| [HalfYearCtrl](HalfYearCtrl.md) | Half-year anniversary event. | 17 | R |
| [HangupCtrl](HangupCtrl.md) | Idle (hangup) rewards and quick-hang purchase. | 1 | PR |
| [HeavenCtrl](HeavenCtrl.md) | Heaven realm content (guess). | 5 | R |
| [HeavenWarCtrl](HeavenWarCtrl.md) | Heaven war event (guess). | 59 | PR |
| [HeroCtrl](HeroCtrl.md) | Heroes: roster, upgrade, equipment. | 68 | GPR |
| [HeroFuseCtrl](HeroFuseCtrl.md) | Hero fusion. | 0 | - |
| [HorseYearCtrl](HorseYearCtrl.md) | Year-of-the-Horse event. | 22 | R |
| [ItemColorStoneCtrl](ItemColorStoneCtrl.md) | Colour stones / gem items (guess). | 2 | R |
| [JewelDrawCtrl](JewelDrawCtrl.md) | Jewel gacha draw. | 2 | PR |
| [KFRainRuinsCtrl](KFRainRuinsCtrl.md) | Cross-server Rain Ruins event. | 10 | P |
| [KfLolCtrl](KfLolCtrl.md) | Cross-server competitive mode (guess). | 13 | G |
| [LabourDayCtrl](LabourDayCtrl.md) | Labour Day event. | 20 | R |
| [LanguageCtrl](LanguageCtrl.md) | Localization. | 0 | - |
| [LeagueCraftCtrl](LeagueCraftCtrl.md) | League crafting / league content (guess). | 8 | - |
| [LeagueCtrl](LeagueCtrl.md) | League / alliance system (guess). | 24 | R |
| [LoadCtrl](LoadCtrl.md) | Asset loading screen. | 0 | - |
| [LoginCtrl](LoginCtrl.md) | Login, server select and reconnect. | 0 | P |
| [LuckyDrawCtrl](LuckyDrawCtrl.md) | Lottery draw. | 1 | P |
| [MagicEmbattleCtrl](MagicEmbattleCtrl.md) | Magic formation setup. | 7 | R |
| [MainCtrl](MainCtrl.md) | Main UI and scene shell. | 0 | G |
| [MarketCtrl](MarketCtrl.md) | Player market (guess). | 0 | P |
| [MeituanCtrl](MeituanCtrl.md) | Meituan partner promotion (guess). | 0 | GR |
| [MellowAskCtrl](MellowAskCtrl.md) | Unknown system (name not decodable). | 0 | P |
| [MidAutumnActivityCtrl](MidAutumnActivityCtrl.md) | Mid-Autumn festival event. | 14 | PR |
| [MxActCtrl](MxActCtrl.md) | Unknown activity (name not decodable). | 3 | R |
| [MzCtrl](MzCtrl.md) | Unknown system (name not decodable). | 0 | GPR |
| [NationalActCtrl](NationalActCtrl.md) | National Day event. | 21 | PR |
| [NewDevilSeaCtrl](NewDevilSeaCtrl.md) | Revised Devil Sea event. | 10 | PR |
| [NewSpiritBeastCtrl](NewSpiritBeastCtrl.md) | Revised spirit beast system. | 3 | R |
| [NewSuperHeroCtrl](NewSuperHeroCtrl.md) | Revised super hero system. | 8 | PR |
| [NewZhongQiuCtrl](NewZhongQiuCtrl.md) | Revised Mid-Autumn (Zhongqiu) event. | 8 | - |
| [OneYuanRenewalCtrl](OneYuanRenewalCtrl.md) | One-yuan renewal / subscription offer. | 0 | P |
| [OriginCtrl](OriginCtrl.md) | Unknown, possibly origin / source tracking (guess). | 9 | - |
| [PlatCtrl](PlatCtrl.md) | Platform and SDK integration, sharing, platform activities. | 15 | R |
| [PropitiousActivityCtrl](PropitiousActivityCtrl.md) | "Propitious" lucky-themed event. | 7 | PR |
| [PropsCtrl](PropsCtrl.md) | Item / prop definitions and usage. | 0 | R |
| [QQCtrl](QQCtrl.md) | QQ platform features. | 3 | R |
| [QiXiFestivalActCtrl](QiXiFestivalActCtrl.md) | Qixi festival event. | 8 | R |
| [QingmingCtrl](QingmingCtrl.md) | Qingming festival event. | 13 | GR |
| [QuizCtrl](QuizCtrl.md) | Quiz event. | 4 | - |
| [RacingCtrl](RacingCtrl.md) | Racing mini-game. | 9 | R |
| [RainRuinsCtrl](RainRuinsCtrl.md) | Rain Ruins event. | 6 | - |
| [RankCtrl](RankCtrl.md) | Leaderboards and worship (BXH). | 7 | PR |
| [RankRwCtrl](RankRwCtrl.md) | Ranking rewards. | 0 | - |
| [RechargeCtrl](RechargeCtrl.md) | Top-up and VIP packages, purchase checks. | 7 | PR |
| [RecruitCtrl](RecruitCtrl.md) | Hero recruit / gacha. | 0 | PR |
| [RedCtrl](RedCtrl.md) | Red-dot notification state. | 0 | - |
| [RelicsAdvCtrl](RelicsAdvCtrl.md) | Relic advancement. | 0 | - |
| [RiseGoldCtrl](RiseGoldCtrl.md) | Gold-gain boost event (guess). | 8 | R |
| [RoleCtrl](RoleCtrl.md) | Player character info. | 2 | - |
| [SamsaraFundCtrl](SamsaraFundCtrl.md) | Samsara fund (reincarnation-themed fund). | 7 | PR |
| [ScsmCtrl](ScsmCtrl.md) | Unknown system (name not decodable). | 0 | - |
| [SeTgtCtrl](SeTgtCtrl.md) | Unknown target/task system (guess). | 4 | R |
| [ServerMergeActCtrl](ServerMergeActCtrl.md) | Server-merge compensation event. | 15 | PR |
| [SettingCtrl](SettingCtrl.md) | Settings and account options. | 16 | P |
| [SevenLoginCtrl](SevenLoginCtrl.md) | Seven-day login rewards. | 2 | R |
| [ShopCtrl](ShopCtrl.md) | Shops and item purchase. | 5 | P |
| [SidePlotCtrl](SidePlotCtrl.md) | Side story content. | 5 | - |
| [SongliGifCtrl](SongliGifCtrl.md) | Gift event (guess). | 0 | P |
| [SpiritAnimalCtrl](SpiritAnimalCtrl.md) | Spirit animals. | 16 | PR |
| [SpiritBeastCtrl](SpiritBeastCtrl.md) | Spirit beasts. | 4 | PR |
| [StealingHeavenCtrl](StealingHeavenCtrl.md) | Stealing Heaven feature. | 1 | PR |
| [SuperFaBaoCtrl](SuperFaBaoCtrl.md) | Super magic treasure system. | 8 | PR |
| [SuperFaZhenCtrl](SuperFaZhenCtrl.md) | Super array (fa zhen) system. | 3 | R |
| [SuperForeverCtrl](SuperForeverCtrl.md) | Super "forever" lifetime offer (guess). | 4 | PR |
| [SuperHeroCtrl](SuperHeroCtrl.md) | Super heroes. | 9 | PR |
| [SuperHeroEncoreCtrl](SuperHeroEncoreCtrl.md) | Super hero re-run event. | 7 | PR |
| [SuperSptAniCtrl](SuperSptAniCtrl.md) | Super spirit animals. | 1 | PR |
| [SuperVipCtrl](SuperVipCtrl.md) | Super VIP tier. | 0 | P |
| [SurveyCtrl](SurveyCtrl.md) | Questionnaire. | 4 | - |
| [SwdCtrl](SwdCtrl.md) | Sword-themed content (guess). | 11 | - |
| [SwingGiftCtrl](SwingGiftCtrl.md) | Swing gift event (guess). | 45 | PR |
| [SwordDirCtrl](SwordDirCtrl.md) | Sword direction / sword path content (guess). | 0 | P |
| [TaxLyCtrl](TaxLyCtrl.md) | Tax-themed event (guess). | 2 | - |
| [TianGongLuCtrl](TianGongLuCtrl.md) | Tiangong Lu content. | 0 | - |
| [TipsCtrl](TipsCtrl.md) | Tip popups. | 0 | - |
| [TotalSignCtrl](TotalSignCtrl.md) | Cumulative sign-in. | 3 | R |
| [TransGodCtrl](TransGodCtrl.md) | God transformation. | 1 | PR |
| [TravelCtrl](TravelCtrl.md) | Travel / exploration. | 5 | - |
| [UpdateCtrl](UpdateCtrl.md) | Version update checks. | 0 | P |
| [VdoCtrl](VdoCtrl.md) | Video playback. | 7 | - |
| [VipCtrl](VipCtrl.md) | VIP level and privileges. | 6 | PR |
| [VnOffLieCtrl](VnOffLieCtrl.md) | Vietnam offline / lie-themed activity (guess). | 0 | R |
| [VnVideoActCtrl](VnVideoActCtrl.md) | Vietnam video activity. | 0 | R |
| [WHPracticeCtrl](WHPracticeCtrl.md) | Practice mode (guess). | 2 | PR |
| [WanJieDingZunCtrl](WanJieDingZunCtrl.md) | Wanjie Dingzun content. | 21 | - |
| [WarlordsCtrl](WarlordsCtrl.md) | Warlords contest. | 10 | - |
| [WarlordsKfCtrl](WarlordsKfCtrl.md) | Cross-server warlords contest. | 19 | - |
| [WeixinCtrl](WeixinCtrl.md) | WeChat platform features. | 1 | R |
| [WelfareCtrl](WelfareCtrl.md) | Welfare hub: login, sign-in, recurring claims. | 23 | PR |
| [WoodCarveCtrl](WoodCarveCtrl.md) | Wood carving mini-game. | 11 | - |
| [WoodStarCtrl](WoodStarCtrl.md) | Wood star event. | 2 | - |
| [XianYuanCtrl](XianYuanCtrl.md) | Tiên Duyên gifts. | 13 | - |
| [XunBCtrl](XunBCtrl.md) | Treasure hunt (guess). | 4 | R |
| [YD2026Ctrl](YD2026Ctrl.md) | 2026 new-year event. | 14 | R |
| [YMAbyssCtrl](YMAbyssCtrl.md) | Vực U Minh (abyss) dungeon. | 4 | R |
| [YXPracticeCtrl](YXPracticeCtrl.md) | Practice mode (guess). | 2 | P |
| [YsEctCtrl](YsEctCtrl.md) | Unknown system (name not decodable). | 7 | PR |
| [YuWaiTreasureCtrl](YuWaiTreasureCtrl.md) | Outer-realm treasure. | 2 | - |
| [YuanXiaoCtrl](YuanXiaoCtrl.md) | Lantern festival (Yuanxiao) event. | 0 | PR |
