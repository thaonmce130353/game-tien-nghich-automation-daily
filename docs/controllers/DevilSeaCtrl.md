# DevilSeaCtrl

Devil Sea (Ma Hải) event.

- gInst: yes | methods: 87 (own 66) | send: 12
- own methods by kind: getter 11, update 5, other 21, redDot 10, send 12, ui 7
- name-flagged methods: purchase: getGiftBuyTimes | reward: clearGridAwardDic, closeDevilSeaTreasureRewardPreviewUI, getChargeAwardStatus, getGiftBuyTimes, getGiftRed, getGridAwardVo, getTreasureRewardRed, getZhanLingAwardRed, openDevilSeaTreasureRewardPreviewUI

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send19370 | 19370 | none | no | handler not in this controller |
| send19371 | 19371 | (1 arg) | no | handler not in this controller |
| send19372 | 19372 | (1 arg) | no | handler not in this controller |
| send19373 | 19373 | none | no | handler not in this controller |
| send19375 | 19375 | none | no | handler not in this controller |
| send19376 | 19376 | none | no | handler not in this controller |
| send19377 | 19377 | none | no | handler not in this controller |
| send19378 | 19378 | none | no | handler not in this controller |
| send19379 | 19379 | (1 arg) | no | handler not in this controller |
| send19380 | 19380 | none | no | handler not in this controller |
| send30040 | 30040 | (1 arg) | no | handler not in this controller |
| send30041 | 30041 | (2 arg) | no | handler not in this controller |

**getter** (11): getCurlModel getIsGridUnlock getGridUnlockItemsVo getGridAwardVo getChallengeUnitId getTrialGoodId getChargeAwardStatus getGiftBuyTimes getTaskInfo getTaskInfoById getTaskRedByType

**update** (5): initBeforeData clearCtrlState clearGridAwardDic clearUnlockGridDic setTaskInfo

**other** (21): beforeReq toRequestServerData reqDataBeforeEnter regNetLit rv19370 rv19371 rv19372 rv19373 rv19374 rv19375 rv19376 rv19377 rv19378 rv19379 rv19380 bSellOutState onRedStatusChanged rv30040 rv30041 rv30042 bInActTime

**redDot** (10): registerRed updateDevilSeaHallRed getTreasureBoxRed getTreasureRewardRed getTreasureExchangeRed getFightRed getGiftRed getSoulRed getZhanLingAwardRed getZhanLingTaskRed

**ui** (7): openDevilSeaHall openDevilRank openDevilSeaTreasureRewardPreviewUI closeDevilSeaTreasureRewardPreviewUI openDevilSeaTreasureExchangeUi closeDevilSeaTreasureExchangeUi openDevilSeaTrialUi
