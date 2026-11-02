# SwingGiftCtrl

Swing gift event (guess).

- gInst: yes | methods: 191 (own 168) | send: 45
- own methods by kind: getter 3, other 24, update 6, ui 30, send 45, response 60
- name-flagged methods: purchase: btnBuy, closeYbShopBuyUi, openSdgcBuyUi, openShopBatchBuyView, openYbShopBuyUi, rechargeMoney | reward: TjhyGetReward, showHeroRecruitAwardInfoNewUi, showHeroRecruitAwardInfoUi, showHeroRecruitAwardNewUi, showHeroRecruitAwardUi, showXjAwardUi

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send19031 | 19031 | activity_id | no | on19031: updates local state |
| send19033 | 19033 | activity_id | no | on19033: updates local state |
| send19034 | 19034 | day | no | on19034: shows server error; updates local state |
| send19035 | 19035 | activity_id | no | on19035: updates local state |
| send19036 | 19036 | activity_id | no | on19036: updates local state |
| send19037 | 19037 | times | yes | on19037: shows server error; updates local state |
| send19039 | 19039 | stage | no | on19039: shows server error; updates local state |
| send19040 | 19040 | activity_id | no | on19040: updates local state |
| send19042 | 19042 | activity_id, money | no | on19042: shows server error; updates local state |
| send19074 | 19074 | none | no | on19074: updates local state |
| send19076 | 19076 | activity_id | no | on19076: updates local state |
| send19078 | 19078 | (1 arg) | no | on19078: updates local state |
| send19079 | 19079 | times | yes | on19079: shows server error; updates local state |
| send19080 | 19080 | stage | no | on19080: shows server error; updates local state |
| send19081 | 19081 | none | no | on19081: updates local state |
| send19082 | 19082 | id | no | on19082: shows server error; updates local state |
| send19083 | 19083 | activity_id | no | on19083: updates local state |
| send19085 | 19085 | activity_id | no | on19085: updates local state |
| send19086 | 19086 | none | no | on19086: shows server error; updates local state |
| send19087 | 19087 | buy_num | no | on19087: shows server error; updates local state |
| send19091 | 19091 | activity_id | no | on19091: updates local state |
| send19170 | 19170 | activity_id | no | on19170: updates local state |
| send19171 | 19171 | loop, id | no | on19171: no notable effect |
| send19172 | 19172 | none | no | on19172: shows server error |
| send19221 | 19221 | activity_id | no | on19221: updates local state |
| send19222 | 19222 | none | no | on19222: updates local state |
| send19223 | 19223 | id | no | on19223: shows server error; updates local state; opens UI |
| send19224 | 19224 | index | yes | on19224: shows server error; updates local state |
| send19225 | 19225 | none | no | on19225: shows server error; updates local state; re-requests send19222 |
| send19226 | 19226 | layer_lower, layer_upper | no | on19226: updates local state |
| send19227 | 19227 | num | no | on19227: shows server error |
| send19228 | 19228 | none | no | on19228: updates local state |
| send19232 | 19232 | none | no | on19232: no notable effect |
| send19301 | 19301 | activity_id | no | on19301: updates local state |
| send19313 | 19313 | none | no | on19313: updates local state |
| send19314 | 19314 | none | no | on19314: updates local state |
| send19315 | 19315 | none | no | on19315: shows server error; updates local state |
| send19316 | 19316 | none | no | on19316: updates local state |
| send19317 | 19317 | shop_id, num | no | on19317: shows server error; updates local state |
| send19325 | 19325 | activity_id | no | on19325: updates local state |
| send19327 | 19327 | activity_id, cost | no | on19327: shows server error; updates local state |
| send19340 | 19340 | (1 arg) | no | on19340: updates local state |
| send19341 | 19341 | times | yes | on19341: shows server error; updates local state |
| send19342 | 19342 | base_id | no | on19342: shows server error; updates local state |
| send19343 | 19343 | stage | no | on19343: shows server error; updates local state |

**getter** (3): getCurlModel gListDt getTZScore

**other** (24): reqDataBeforeEnter regNetLit selectTab btnBuy addCurreny seBestSdgc selectBest rechargeMoney sd19074 sd19088 rv19088 sd19089 rv19089 sd19090 rv19090 TjhyGetReward addAsset sdTgysCjEvt sdXjzmCjEvt sdXbXjzmCjEvt sdCjEvt exeXjzm exeXbXjzm exeXszm

**update** (6): clearCtrlState uptBossJd resetRecruitStatus upBackAct clearJdDat upDayNums

**ui** (30): showSwingGiftMainUi showHeroRecruitAwardUi showHeroRecruitAwardInfoUi showHeroProbabilityUi showHeroRecruitAwardNewUi showHeroRecruitAwardInfoNewUi showHeroProbabilityNewUi showXjAwardUi showXjInfoUi showXjProbUi showXjSelUi closeXjSelUi openLimitDtUi openXrscActUi closeXrscActUi openYbShopBuyUi closeYbShopBuyUi openSdgcSeUi openSdgcRewUi openSdgcTipUi openSdgcSeSureUi openSdgcBuyUi closeRecruitEffectView closeRecruitEffectNewView openShopBatchBuyView openHyBossShopMainUi openHyBsProgressUi openHyBsUi showTip showHelp
