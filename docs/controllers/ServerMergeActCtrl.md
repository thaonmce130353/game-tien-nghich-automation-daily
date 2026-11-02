# ServerMergeActCtrl

Server-merge compensation event.

- gInst: yes | methods: 111 (own 91) | send: 15 | flags: reward
- own methods by kind: getter 8, update 6, other 26, redDot 15, send 15, predicate 7, ui 14
- name-flagged methods: purchase: getGiftBuyTimes | reward: checkLottreyStatRewardRed, getGiftBuyTimes, getZhanLingAwardRed, isShowFightRewardRed, open2048AwardUi

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send19540 | 19540 | none | no | handler not in this controller |
| send19541 | 19541 | none | no | handler not in this controller |
| send19542 | 19542 | none | no | handler not in this controller |
| send19543 | 19543 | (1 arg) | no | handler not in this controller |
| send19544 | 19544 | none | no | handler not in this controller |
| send19545 | 19545 | none | no | handler not in this controller |
| send19546 | 19546 | none | no | handler not in this controller |
| send19547 | 19547 | none | no | handler not in this controller |
| send19548 | 19548 | none | no | handler not in this controller |
| send19549 | 19549 | none | no | handler not in this controller |
| send19550 | 19550 | none | no | handler not in this controller |
| send19551 | 19551 | direction | no | handler not in this controller |
| send19552 | 19552 | none | no | handler not in this controller |
| send30050 | 30050 | (1 arg) | no | handler not in this controller |
| send30052 | 30052 | (2 arg) | no | handler not in this controller |

**getter** (8): getCurlModel getGame2048InfoVo getFightInfoVo getDailyLoginDayState getGiftBuyTimes getChallengeUnitId getGroupTaskCfg getGroupTaskInfo

**update** (6): clearCtrlState initBeforeData setGame2048RollStatus set2048ReqStatus setGame2048OperateStatus setGame2048StartStatus

**other** (26): finishAutoConnect beforeReq reqDataBeforeEnter onRedStatusChanged toRequestServerData regNetLit rv19540 rv19541 rv19542 rv19543 rv19544 rv19545 onCrossSky bInActTime rv19546 rv19547 rv19548 rv19549 rv19550 rv19551 rv19552 rv30050 rv30051 rv30052 bSellOutState selectFromGroups

**redDot** (15): registerRed getZhanLingTaskRed getZhanLingAwardRed isShowFightRewardRed isShow2048Red updateNationalCityBtnRed checkDailyRed checkLottreyStatRewardRed checkProcureRed checkDiscountRed checkLotteryRed checkChallengeTaskRed checkCultivationTaskRed checkGroupTaskRed checkAccGiftRed

**predicate** (7): checkOpen checkCityBtn isGame2048Rolling isGame2048Reqing isGame2048HadOperate isGame2048Start checkCelebrationGiftPack

**ui** (14): openMainUI openFightRank open2048Rank openFightUi openZhanlingUi openDailyLogUI open2048Ui open2048AwardUi openProcureUi openAccGiftUi openSmaTaskUi openSmaRankUi openLotteryHallUi closeLotteryHallUi
