# FestivalActCtrl

Generic festival activity.

- gInst: yes | methods: 79 (own 58) | send: 9 | flags: reward
- own methods by kind: getter 9, update 3, other 19, redDot 8, send 9, ui 9, predicate 1
- name-flagged methods: purchase: getGiftBuyTimes, openZhanLingScoreBuyUi | reward: closeDevilSeaTreasureRewardPreviewUI, getChargeAwardStatus, getGiftBuyTimes, getGiftRed, getZhanLingAwardRed, openDevilSeaTreasureRewardPreviewUI

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send19480 | 19480 | (1 arg) | no | handler not in this controller |
| send19481 | 19481 | (1 arg) | no | handler not in this controller |
| send19482 | 19482 | (1 arg) | no | handler not in this controller |
| send19483 | 19483 | (1 arg) | no | handler not in this controller |
| send19484 | 19484 | (2 arg) | no | handler not in this controller |
| send19485 | 19485 | (1 arg) | no | handler not in this controller |
| send19486 | 19486 | (1 arg) | no | handler not in this controller |
| send19487 | 19487 | (2 arg) | no | handler not in this controller |
| send19488 | 19488 | (2 arg) | no | handler not in this controller |

**getter** (9): getCurlModel getHurt getChargeAwardStatus getGiftBuyTimes getCrtTmpSelectId getChallengeUnitId getAssetsArrByActId getFestivalActConfig getUnitId

**update** (3): initBeforeData clearCtrlState setCrtTmpSelectId

**other** (19): beforeReq toRequestServerData reqDataBeforeEnter regNetLit rv19486 rv19487 rv19488 rv19480 rv19481 rv19482 rv19483 rv19484 rv19485 bSellOutState onRedStatusChanged bInActTime actTypeToActId actIdToActType starFight

**redDot** (8): registerRed updateFestivalActHallRed getTreasureTimes10Red getFightRed getGiftRed getSoulRed getZhanLingAwardRed getZhanLingTaskRed

**ui** (9): openFestivalActHall openDevilRank openDevilSeaTreasureRewardPreviewUI closeDevilSeaTreasureRewardPreviewUI openFestivalActSelectUi closeFestivalActSelectUi openFestivalActExchangeUi closeFestivalActExchangeUi openZhanLingScoreBuyUi

**predicate** (1): checkFestivalActBtn
