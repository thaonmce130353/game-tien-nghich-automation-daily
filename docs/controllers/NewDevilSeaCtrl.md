# NewDevilSeaCtrl

Revised Devil Sea event.

- gInst: yes | methods: 78 (own 57) | send: 10
- own methods by kind: getter 8, update 4, other 18, redDot 9, send 10, ui 7, predicate 1
- name-flagged methods: purchase: getGiftBuyTimes | reward: closeDevilSeaTreasureRewardPreviewUI, getChargeAwardStatus, getGiftBuyTimes, getGiftRed, getZhanLingAwardRed, openDevilSeaAwardPreviewUi, openDevilSeaTreasureRewardPreviewUI

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send19425 | 19425 | none | no | handler not in this controller |
| send19426 | 19426 | (1 arg) | no | handler not in this controller |
| send19427 | 19427 | none | no | handler not in this controller |
| send19428 | 19428 | none | no | handler not in this controller |
| send19429 | 19429 | none | no | handler not in this controller |
| send19430 | 19430 | none | no | handler not in this controller |
| send19431 | 19431 | none | no | handler not in this controller |
| send19432 | 19432 | (1 arg) | no | handler not in this controller |
| send19433 | 19433 | none | no | handler not in this controller |
| send19434 | 19434 | none | no | handler not in this controller |

**getter** (8): getCurlModel getIsGridUnlock getGridUnlockItemsVo getChallengeUnitId getTrialGoodId getChargeAwardStatus getGiftBuyTimes getLockGridNum

**update** (4): initBeforeData clearCtrlState clearUnlockGridDic setRoundCost

**other** (18): beforeReq toRequestServerData reqDataBeforeEnter regNetLit rv19425 rv19426 rv19427 rv19428 rv19429 rv19430 rv19431 rv19432 rv19433 rv19434 bSellOutState onRedStatusChanged bInActTime reqTreasure

**redDot** (9): registerRed updateDevilSeaHallRed getTreasureBoxRed getTreasureExchangeRed getFightRed getGiftRed getSoulRed getZhanLingAwardRed getZhanLingTaskRed

**ui** (7): openDevilSeaHall openDevilRank openDevilSeaTreasureRewardPreviewUI closeDevilSeaTreasureRewardPreviewUI openDevilSeaTreasureExchangeUi closeDevilSeaTreasureExchangeUi openDevilSeaAwardPreviewUi

**predicate** (1): isAllUnlockGrid
