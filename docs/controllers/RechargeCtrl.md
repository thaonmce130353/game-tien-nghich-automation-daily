# RechargeCtrl

Top-up and VIP packages, purchase checks.

- gInst: yes | methods: 114 (own 92) | send: 7 | flags: purchase
- own methods by kind: getter 16, update 5, other 37, ui 14, predicate 10, send 7, response 2, redDot 1
- name-flagged methods: purchase: bBuyTermById, buyAdvZl, checkRechargetTime, closeDailyRechargeView, closeRechargeSuperView, closeSpecialGiftBuyUi, getIsRechargeGift, getRechargeRankRewardList, getZlBuyVal, isBuyTermById, isBuyTermLuxuryById, openSpecialGiftBuyUi, realRechargeMoney, rechargeMoney, rechargeMoneyReal, rechargeMoneyYuanJing, recvRechargeGiftStatus, reqRechargeGiftStatus, sRecharge, showDailyRechargeView, showRechargeSuperView, showRechargeView, updateRechargeGift, updateRechargeTime | reward: countCanGetAward, getCurShowRewardVo, getCurTermNormalRewardListByTermId, getRechargeRankRewardList, isCanAdvancedIdRewardByTermId, isCanLuxuryIdRewardByTermId, isCanNormalIdRewardByTermId, isGetAdvancedIdRewardByTermId, isGetLuxuryIdRewardByTermId, isGetNormalIdRewardByTermId

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send12301 | 12301 | none | no | on12301: no notable effect |
| send12302 | 12302 | type, reward_id | no | on12302: shows server error; re-requests send12301 |
| send12321 | 12321 | type | no | handler not in this controller |
| send12322 | 12322 | type, term_id | no | handler not in this controller |
| send12323 | 12323 | (1 arg) | no | handler not in this controller |
| send12325 | 12325 | none | no | handler not in this controller |
| send12326 | 12326 | type, term_id, num | no | handler not in this controller |

**getter** (16): getCurlModel getXfzgIsOpen getXfzgEndTime getIsRechargeGift getCjInfo getZlNetVoByType getZlVal getZlBuyVal getReiki_progress getCruTermId getTermNetVo getCurTermNormalRewardListByTermId getCurShowRewardVo getXianYuanReturnNum getNewFCOpenLev getRechargeRankRewardList

**update** (5): initBeforeData clearCtrlState updateRechargeGift updateRechargeTime upCjDt

**other** (37): reqDataBeforeEnter regNetLit exeRcgUi sRecharge rechargeMoney rechargeMoneyYuanJing rechargeMoneyReal realRechargeMoney reqRechargeGiftStatus recvRechargeGiftStatus sd12390 rv12390 rv12391 cjSdEvt sn19328 rv19328 exeDbgUi sd12310 rv12310 sd12311 rv12311 sd12312 rv12312 sd12313 rv12313 rv12321 rv12322 rv12326 rv12323 rv12324 rv12325 filterTermList bExistTerm bBuyTermById sActiveUi buyAdvZl countCanGetAward

**ui** (14): showRechargeView showDailyRechargeView closeDailyRechargeView showRechargeSuperView closeRechargeSuperView showFirstChargeView closeFirstChargeView showDbgUi closeDbgUi openAutoFight openZhanLingUi openThemeGiftUi openSpecialGiftBuyUi closeSpecialGiftBuyUi

**predicate** (10): checkRechargetTime isBuyTermById isBuyTermLuxuryById isShowTermRedByTermId isGetNormalIdRewardByTermId isCanNormalIdRewardByTermId isGetAdvancedIdRewardByTermId isGetLuxuryIdRewardByTermId isCanAdvancedIdRewardByTermId isCanLuxuryIdRewardByTermId

**redDot** (1): isCanGetZlRed
