# DesenoActivityCtrl

Large hub for timed activities.

- gInst: yes | methods: 199 (own 178) | send: 41
- own methods by kind: getter 6, update 7, other 40, ui 24, send 41, response 54, redDot 4, predicate 2
- name-flagged methods: purchase: buySkin, clkBuy, isBuyThemeGiftById, openShopBatchBuyView | reward: openFireRankAwardView, openMaoXianRankAwardView, openQuickRankAwardView, openTaxesRankAwardView, openTravelRankAwardView, sHsRRwDt, sKsRRwDt, sMxRRwDt, sSjRRwDt, sYlRRwDt, showChargerAwardUi, showHeroRecruitAwardInfoUi, showJadeAwardUi, showPjSetsAwardUi

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send19002 | 19002 | none | no | on19002: updates local state |
| send19011 | 19011 | none | no | on19011: updates local state |
| send19012 | 19012 | lev | no | on19012: shows server error; updates local state |
| send19013 | 19013 | none | no | on19013: updates local state |
| send19014 | 19014 | id | no | on19014: updates local state |
| send19021 | 19021 | activity_id | no | on19021: updates local state |
| send19023 | 19023 | activity_id, task_id | no | on19023: shows server error; updates local state |
| send19024 | 19024 | activity_id | no | on19024: updates local state |
| send19025 | 19025 | activity_id, shop_id, num | no | on19025: shows server error; updates local state |
| send19026 | 19026 | activity_id | no | on19026: updates local state |
| send19028 | 19028 | activity_id | no | on19028: updates local state |
| send19030 | 19030 | activity_id, task_id | no | on19030: shows server error; updates local state |
| send19043 | 19043 | activity_id | no | on19043: updates local state |
| send19045 | 19045 | activity_id, times | no | on19045: shows server error; updates local state |
| send19046 | 19046 | activity_id | no | on19046: updates local state |
| send19048 | 19048 | activity_id, times | no | on19048: shows server error; updates local state |
| send19068 | 19068 | activity_id | no | on19068: updates local state |
| send19070 | 19070 | activity_id, times | no | on19070: shows server error; updates local state |
| send19071 | 19071 | activity_id | no | on19071: updates local state |
| send19072 | 19072 | times | no | on19072: shows server error; updates local state |
| send19073 | 19073 | stage | no | on19073: shows server error; updates local state |
| send19101 | 19101 | none | no | on19101: updates local state |
| send19103 | 19103 | id | no | on19103: shows server error; updates local state |
| send19305 | 19305 | none | no | on19305: updates local state |
| send19306 | 19306 | none | no | on19306: updates local state |
| send19307 | 19307 | wish_show_list | no | on19307: shows server error |
| send19308 | 19308 | times | no | on19308: shows server error; updates local state |
| send19309 | 19309 | stage | no | on19309: shows server error; updates local state |
| send19310 | 19310 | none | no | on19310: updates local state |
| send19329 | 19329 | none | no | on19329: updates local state |
| send19331 | 19331 | task_id | no | on19331: shows server error; updates local state |
| send19362 | 19362 | activity_id | no | handler not in this controller |
| send19367 | 19367 | none | no | handler not in this controller |
| send19368 | 19368 | id | no | handler not in this controller |
| send19378 | 19378 | none | no | handler not in this controller |
| send19379 | 19379 | id | no | handler not in this controller |
| send19420 | 19420 | activity_id | no | on19420: updates local state |
| send19421 | 19421 | activity_id | no | on19421: updates local state |
| send19422 | 19422 | activity_id, id | no | on19422: updates local state |
| send31501 | 31501 | none | no | on31501: updates local state |
| send31502 | 31502 | id | no | on31502: shows server error; updates local state |

**getter** (6): getCurlModel getThemeGiftData getThemeGiftUnique_id getCurDayByActivityId getVoucherWheelData getEoughInvest

**update** (7): initBeforeData clearCtrlState updateSingleHandler clearThemeGiftActBtn updateThemeIcon upBackAct updateRoleData

**other** (40): reqDataBeforeEnter finishAutoConnect regNetLit selTab sSjRRwDt selectBest addAssets addAssets2 sKsRRwDt sYlRRwDt sHsRRwDt sMxRRwDt playVdo sdGACjEvt sd30607 sd30608 sd30609 sd30610 sd30611 sd30612 sd30613 sd19336 rv19336 rv19362 sSkinRealm buySkin sd19096 rv19096 sd19097 rv19097 sd19098 onCrossSky sd19363 rv19363 rv19364 sd19365 rv19365 rv19366 rv19367 rv19368

**ui** (24): openDesenoActivityUi openTaxesRankAwardView showJadeAwardUi showJadeProbabilityUi showJadeWishUi openCycleExchangeShopMainUi openShopBatchBuyView showHeroRecruitAwardInfoUi showHeroProbabilityUi showPjSetsAwardUi showPjsSetsProbabilityUi showPjsSetsWishUi showChargerAwardUi showChargerProbabilityUi showZmscView openQuickRankAwardView openTravelRankAwardView openFireRankAwardView openMaoXianRankAwardView clkBuy openNewActivityMainUI closeNewActivityMainUI openDailyUpStar openVoucherWheelUi

**redDot** (4): getJiTianHaoLiRed updateVoucherWheelRed getCommonGiftRed getAccGiftRed

**predicate** (2): isBuyThemeGiftById checkActPlatOpenByActId
