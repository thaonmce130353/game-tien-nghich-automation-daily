# FashionRecCtrl

Fashion recharge event.

- gInst: yes | methods: 68 (own 46) | send: 5
- own methods by kind: getter 12, update 2, other 12, redDot 7, send 5, ui 7, predicate 1
- name-flagged methods: purchase: getGiftBuyCount, getZsGiftBuyData | reward: checkRecruitRewardRed, getGiftBuyCount, getZhanLingAwardRed

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send19532 | 19532 | (1 arg) | no | handler not in this controller |
| send19533 | 19533 | grand_id | no | handler not in this controller |
| send19534 | 19534 | times | no | handler not in this controller |
| send19535 | 19535 | none | no | handler not in this controller |
| send19536 | 19536 | award_id | no | handler not in this controller |

**getter** (12): getCurlModel getZsGiftBuyData getGiftBuyCount getIsopen getActInfo getUniqueId getCfg getCloseTime getTrialGoodId getProRwIsGetById getActId getSerOpId

**update** (2): clearCtrlState setProGetDt

**other** (12): toRequestServerData reqDataBeforeEnter regNetLit rv19532 rv19533 rv19534 rv19535 rv19536 cHPrevUi clsUpGiftUi onRedStatusChanged bInActTime

**redDot** (7): registerRed updateHallRed getZhanLingAwardRed getZhanLingTaskRed checkGoodGiftRed checkRecruitTenRed checkRecruitRewardRed

**ui** (7): openHall openFashionRecSelectUi openPreview openGoodGift openGoto openZLTask closeTimeEvt

**predicate** (1): hasFashionRecAct
