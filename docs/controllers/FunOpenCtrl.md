# FunOpenCtrl

Feature unlock gating by level or quest.

- gInst: yes | methods: 36 (own 79) | send: 0
- own methods by kind: getter 13, update 4, other 23, redDot 11, send 13, ui 13, predicate 2

**getter** (13): getCurlModel getActInfo getCompassCostVo getGiftBuyTimes getDailyLoginDayState getIsFullMoonAct getIsAllClose getTrialGoodId getChallengeUnitId getIsJumpCompassEff getWayFunOpenTips getFunOpenLev getFunOpenDay

**update** (4): initBeforeData clearCtrlState setOpenChallengeUi initFun

**other** (23): beforeReq toRequestServerData reqDataBeforeEnter regNetLit rv19401 rv19402 rv19403 rv19404 rv19405 rv19407 rv19408 rv19410 rv19411 rv19412 rv19413 rv19414 onRedStatusChanged opFMDazzlingResultUi bSellOutState bInZhanLinActTime bInFightActTime udpateRoleLevel judgeJumpIsOpenById

**redDot** (11): registerRed checkCompassRed checkTwigRed checkDailyRed checkGiftPackRed checkExchangeRed getZhanLingAwardRed getZhanLingTaskRed getFightRed getUnFightRed refreshExchangeRed

**ui** (13): openFullMoonHall openFullMoonUi openCompassUi openDazzlingUi openTwigUi openDailyLoginUi openGiftPackUi openFMDazzlingRankUi openExchangeShopUi openFullMoonZhanLin openFullMoonFight openDevilRank closeAllFunOpen

**predicate** (2): isDataComplete check
