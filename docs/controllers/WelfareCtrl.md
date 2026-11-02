# WelfareCtrl

Welfare hub: login, sign-in, recurring claims.

- gInst: yes | methods: 117 (own 97) | send: 23 | flags: reward
- own methods by kind: getter 6, other 20, update 6, redDot 8, ui 4, send 23, response 25, predicate 5
- name-flagged methods: purchase: clearLimitGiftBuyIdDicByType, getLimitGiftBuyNetVo, hasBuyXJTQ | reward: getGiftRedByType

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send30101 | 30101 | none | no | on30101: updates local state |
| send30102 | 30102 | none | no | on30102: shows server error; updates local state |
| send30103 | 30103 | none | no | on30103: shows server error; updates local state |
| send30104 | 30104 | none | no | on30104: shows server error; updates local state |
| send30105 | 30105 | none | no | on30105: updates local state |
| send30107 | 30107 | card_id | no | on30107: shows server error; updates local state |
| send30108 | 30108 | none | no | on30108: updates local state |
| send30112 | 30112 | none | no | on30112: updates local state |
| send30114 | 30114 | fund_id | no | on30114: shows server error; re-requests send30112 |
| send30115 | 30115 | none | no | on30115: shows server error; updates local state |
| send30116 | 30116 | none | no | on30116: updates local state |
| send30117 | 30117 | gift_id | no | on30117: shows server error; updates local state |
| send30118 | 30118 | none | no | on30118: updates local state |
| send30119 | 30119 | gift_id | no | on30119: shows server error; updates local state |
| send30120 | 30120 | type | no | handler not in this controller |
| send30121 | 30121 | gift_id | no | handler not in this controller |
| send30122 | 30122 | none | no | on30122: updates local state |
| send30123 | 30123 | (1 arg) | no | on30123: shows server error |
| send30124 | 30124 | none | no | on30124: updates local state |
| send31001 | 31001 | none | no | on31001: updates local state |
| send31002 | 31002 | gift_id | no | on31002: shows server error; updates local state |
| send31006 | 31006 | type | no | handler not in this controller |
| send31008 | 31008 | none | no | on31008: updates local state |

**getter** (6): getCurlModel getPrivilegeShopCfgVoById getLimitGiftBuyNetVo getLogin10IsGet getLogin10IsCanGet getGiftRedByType

**other** (20): reqDataBeforeEnter sendRecruitFreeGiftInfo finishAutoConnect regNetLit exeWelfareUi growUpGiftFlag copyAdUrl shareGame adShareShow exeState autoRemInfoIdx clsAdInfo clsAdShare seeAdGain recv31006 reqShareAwd GetPriviegeLimitName onRedStatusChanged onNet30120 onNet30121

**update** (6): initBeforeData initSend clearCtrlState updateRoleHandler updShareUrl clearLimitGiftBuyIdDicByType

**redDot** (8): registerRed dailyGiftRed privilegeRed getSignInRed getMonthCardRed getGrowUpFundRed getWelLimitGiftRed checkExtraGiftRed

**ui** (4): openWelfareUi openSignAwaUi showAdInfo openLimitGift

**predicate** (5): checkLogin10IsAllGet isHasRedLimitGift hasBuyXJTQ checkPopFeiShengTeQuanUi checkExtraGiftFunc
