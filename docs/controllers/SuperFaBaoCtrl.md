# SuperFaBaoCtrl

Super magic treasure system.

- gInst: yes | methods: 69 (own 47) | send: 8
- own methods by kind: getter 9, other 17, redDot 6, update 1, ui 4, predicate 2, send 8
- name-flagged methods: purchase: checkActivityBuyStatu, getGiftBuyCount, getUpGiftHasBuy, getZgGiftBuyData, isCanBuyGift, lastGiftIsBuy | reward: getGiftBuyCount, getZhanLingAwardRed

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send19397 | 19397 | activity_id | no | handler not in this controller |
| send19415 | 19415 | none | no | handler not in this controller |
| send19416 | 19416 | unique_id, times | yes | handler not in this controller |
| send19417 | 19417 | unique_id | yes | handler not in this controller |
| send19418 | 19418 | unique_id | yes | handler not in this controller |
| send19669 | 19669 | none | yes | handler not in this controller |
| send19670 | 19670 | (2 arg) | yes | handler not in this controller |
| send19671 | 19671 | (1 arg) | yes | handler not in this controller |

**getter** (9): getCurlModel getCloseTime getActivityId getGiftBuyCount getUpGiftHasBuy getIsJumpRecuitEff getZGActId getZgGiftBuyData getZGSysId

**other** (17): sendInfo reqDataBeforeEnter onRedStatusChanged regNetLit rv19415 rv19416 rv19417 rv19418 rv19669 rv19670 rv19671 bInActTime opTreasureRankUi lastGiftIsBuy rv19397 opZGGiftUi clsZGGiftUi

**redDot** (6): updateSuperFaBaoHallRed registerRed checkRecruitTenRed checkGoodGiftRed getZhanLingAwardRed getZhanLingTaskRed

**update** (1): clearCtrlState

**ui** (4): closeTimeEvt openSuperFaBaoHall openSuperFaBaoUpGift openRecSelectUi

**predicate** (2): checkActivityBuyStatu isCanBuyGift
