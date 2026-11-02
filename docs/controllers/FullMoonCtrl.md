# FullMoonCtrl

Full-moon event.

- gInst: yes | methods: 91 (own 70) | send: 13
- own methods by kind: getter 10, update 3, other 21, redDot 11, send 13, ui 12
- name-flagged methods: purchase: getGiftBuyTimes | reward: getGiftBuyTimes, getZhanLingAwardRed

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send19401 | 19401 | none | no | handler not in this controller |
| send19402 | 19402 | count | no | handler not in this controller |
| send19403 | 19403 | none | no | handler not in this controller |
| send19404 | 19404 | none | no | handler not in this controller |
| send19405 | 19405 | none | no | handler not in this controller |
| send19406 | 19406 | type | no | handler not in this controller |
| send19407 | 19407 | list | no | handler not in this controller |
| send19408 | 19408 | none | no | handler not in this controller |
| send19409 | 19409 | none | no | handler not in this controller |
| send19410 | 19410 | none | no | handler not in this controller |
| send19411 | 19411 | none | no | handler not in this controller |
| send19412 | 19412 | none | no | handler not in this controller |
| send19413 | 19413 | none | no | handler not in this controller |

**getter** (10): getCurlModel getActInfo getCompassCostVo getGiftBuyTimes getDailyLoginDayState getIsFullMoonAct getIsAllClose getTrialGoodId getChallengeUnitId getIsJumpCompassEff

**update** (3): initBeforeData clearCtrlState setOpenChallengeUi

**other** (21): beforeReq toRequestServerData reqDataBeforeEnter regNetLit rv19401 rv19402 rv19403 rv19404 rv19405 rv19407 rv19408 rv19410 rv19411 rv19412 rv19413 rv19414 onRedStatusChanged opFMDazzlingResultUi bSellOutState bInZhanLinActTime bInFightActTime

**redDot** (11): registerRed checkCompassRed checkTwigRed checkDailyRed checkGiftPackRed checkExchangeRed getZhanLingAwardRed getZhanLingTaskRed getFightRed getUnFightRed refreshExchangeRed

**ui** (12): openFullMoonHall openFullMoonUi openCompassUi openDazzlingUi openTwigUi openDailyLoginUi openGiftPackUi openFMDazzlingRankUi openExchangeShopUi openFullMoonZhanLin openFullMoonFight openDevilRank
