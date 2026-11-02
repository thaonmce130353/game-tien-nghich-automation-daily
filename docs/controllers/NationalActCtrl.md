# NationalActCtrl

National Day event.

- gInst: yes | methods: 137 (own 116) | send: 21 | flags: reward
- own methods by kind: getter 16, update 3, redDot 18, other 35, predicate 8, ui 15, send 21
- name-flagged methods: purchase: getGiftBuyTimes, openZhanLingScoreBuyUi | reward: checkTurntableRewardRed, getChargeAwardStatus, getGiftBuyTimes, getGiftRed, getGiftVo, getZhanLingAwardRed, isShowFightRewardRed

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send19501 | 19501 | none | no | handler not in this controller |
| send19502 | 19502 | none | no | handler not in this controller |
| send19503 | 19503 | none | no | handler not in this controller |
| send19504 | 19504 | none | no | handler not in this controller |
| send19505 | 19505 | none | no | handler not in this controller |
| send19506 | 19506 | (1 arg) | no | handler not in this controller |
| send19507 | 19507 | none | no | handler not in this controller |
| send19508 | 19508 | none | no | handler not in this controller |
| send19509 | 19509 | none | no | handler not in this controller |
| send19510 | 19510 | none | no | handler not in this controller |
| send19511 | 19511 | none | no | handler not in this controller |
| send19515 | 19515 | (1 arg) | no | handler not in this controller |
| send19516 | 19516 | (1 arg) | no | handler not in this controller |
| send19517 | 19517 | none | no | handler not in this controller |
| send19518 | 19518 | none | no | handler not in this controller |
| send19519 | 19519 | none | no | handler not in this controller |
| send19522 | 19522 | none | no | handler not in this controller |
| send19524 | 19524 | gift_id, sub_gift_id | no | handler not in this controller |
| send19525 | 19525 | none | no | handler not in this controller |
| send19526 | 19526 | (1 arg) | no | handler not in this controller |
| send19527 | 19527 | none | no | handler not in this controller |

**getter** (16): getCurlModel getAccumulateBlessingInfoVo getFightInfoVo getGiftBuyTimes getDailyLoginDayState getChargeAwardStatus getGiftVo getTaskVo getFinishNum getTooWinGearStatus getCompassCostVo getChallengeUnitId getTurntableConfig getGroupAndIndex getLastDarwItems getNowDarwLayer

**update** (3): clearCtrlState initBeforeData updateTaskInfo

**redDot** (18): registerRed checkTurntableNumRed checkTurntableRewardRed updateNationalCityBtnRed getZhanLingAwardRed getZhanLingTaskRed checkDailyRed getOneBoxRed isShowSignRed isShowOnlineRed isShowFightRed isShowFightChallengeRed fightBtnRed isShowFightRewardRed getDayRed getTaskRed getGiftRed getSeveDayTopListRed

**other** (35): beforeReq reqDataBeforeEnter onRedStatusChanged toRequestServerData regNetLit onCrossSky onGuildCreate bInActTime rv19501 rv19502 rv19503 rv19505 rv19506 rv19507 rv19511 rv19512 rv19515 rv19516 rv19517 rv19518 rv19519 rv19522 rv19523 rv19524 rv19525 rv19526 rv19527 rv19508 rv19509 rv19510 bSellOutState taskIsGet taskCanGet taskNoneGet reqFight

**predicate** (8): checkOpen checkCityBtn checkFunRed1 checkFunRed6 checkFunRed7 checkFunRed8 checkFunRed9 isBoxHadGet

**ui** (15): openNationalMainUI openNationalTurntableUI openNationalZhanlinUI openNationalDailyLogUI openNationalExchangeUI openNationalProcureUI openNationalSoulUI openNationalSevenDayUI openNationalTooWinUI openZhanLingScoreBuyUi openAccumulateBlessingUI openAccumulateBlessingSigninUi openAccumulateBlessingOnlineUi openFightRank openFightUi
