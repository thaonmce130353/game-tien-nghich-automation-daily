# DragonBoatCtrl

Dragon Boat festival event.

- gInst: yes | methods: 70 (own 49) | send: 9
- own methods by kind: getter 6, update 2, other 16, redDot 8, send 9, ui 8
- name-flagged methods: purchase: getGiftBuyTimes | reward: closeDevilSeaTreasureRewardPreviewUI, getChargeAwardStatus, getExchangeGiftAward, getGiftBuyTimes, getGiftRed, getZhanLingAwardRed, openDevilSeaTreasureRewardPreviewUI

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send19381 | 19381 | none | no | handler not in this controller |
| send19382 | 19382 | none | no | handler not in this controller |
| send19383 | 19383 | none | no | handler not in this controller |
| send19384 | 19384 | none | no | handler not in this controller |
| send19385 | 19385 | (1 arg) | no | handler not in this controller |
| send19386 | 19386 | none | no | handler not in this controller |
| send19387 | 19387 | none | no | handler not in this controller |
| send19388 | 19388 | (1 arg) | no | handler not in this controller |
| send19389 | 19389 | (1 arg) | no | handler not in this controller |

**getter** (6): getCurlModel getChallengeUnitId getTrialGoodId getExchangeGiftAward getChargeAwardStatus getGiftBuyTimes

**update** (2): initBeforeData clearCtrlState

**other** (16): beforeReq toRequestServerData reqDataBeforeEnter regNetLit rv19387 rv19388 rv19389 rv19381 rv19382 rv19383 rv19384 rv19385 rv19386 bSellOutState onRedStatusChanged bInActTime

**redDot** (8): registerRed updateDragonBoatHallRed getTreasureTimes10Red getFightRed getGiftRed getSoulRed getZhanLingAwardRed getZhanLingTaskRed

**ui** (8): openDragonBoatHall openDevilRank openDevilSeaTreasureRewardPreviewUI closeDevilSeaTreasureRewardPreviewUI openDragonboatSelectUi closeDragonboatSelectUi openDragonboatExchangeUi closeDragonboatExchangeUi
