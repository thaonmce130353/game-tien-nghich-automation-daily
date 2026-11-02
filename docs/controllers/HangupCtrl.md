# HangupCtrl

Idle (hangup) rewards and quick-hang purchase.

- gInst: yes | methods: 173 (own 153) | send: 1
- own methods by kind: getter 21, update 22, other 63, redDot 7, predicate 5, ui 34, send 1
- name-flagged methods: purchase: openRechargeTqUI | reward: checkCanRewardByStageId, closeBossAwardView, closeXianYuanAwardPreviewUI, exeAfterBossAwardView, getHangUpReward, getIsBossAwardRed, isGetAllRewardHaoLi, openBossAwardView, openXianYuanAwardPreviewUI, recvGainAwardResult, recvGetStageAwards, recvHangupAwards, recvStageAwardList, recvWipeoutAwards, reqGetHangupAwards, reqGetStageAwards, reqGetWipeoutAwards, updateBossAwardRedpoint, updateStageAward

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send14110 | 14110 | none | no | handler not in this controller |

**getter** (21): getCurlModel getCurStage getCurStageUnitId getGgTime getIsNoneMoveCount getExtAdw getMajorYeild getEnemyYeild getStageBossMonster getMapEffect getCurHasGetHaoLiId getCurShowHaoLiList getCurCanGetHaoLiIdList getCurExtAdw getHangUpReward getHangUpRoleExp getIsActivityOpen getCurOgDt getStageData getHanupInfoList getQianChouHaoLiIconIsShow

**update** (22): resetMgr updateCurStage updateMajorBornPos resetCurMoveCount updateHgInfoView updateHgTimeView updateChallengeView initChapterView setFightSuccessInfoExp updateQuickRedPoint setHgRedVisible clearCtrlState updateQuickBaseView updateQuickChalllageView updateGainView updateBossView updateHgChapterInfo updateBossAwardRedpoint updateStageShowView updateStageAward resetTvlDt updatehgRevenueUi

**other** (63): regNetLit reEnterScene idlePreloadMapRes finishHangupFight recvEnterSceneResult prepareMoveMonsPoint executeMoveToMonsPoint exeAfterHangupUi enterChallengeBoss executeFinishFight exeAfterChapterView exeAfterQuickView oepnRecommend exeAfterBossAwardView activeNextChapter executeEnterChapterShow quickDescribeShow challageStageBoss popCityAtkPoint quickProcess finishQuickProcess achieveActShow rankShow comfirmUpdateChallengeView reqDataBeforeEnter startAutoConnect finishAutoConnect reqHangupBaseInfo reqChanllgeStage reqGetHangupAwards reqGetStageAwards reqGetWipeoutAwards reqActiveChapter executeEnterStageResult createNewMonster calculateHgTime challengeTick cameraFinishMove comfirmChallenge goToHangupUi startShowBubble executeShowBubble recvHangupBaseInfo recvHangupAwards recvChangllageResult recvGetStageAwards recvWipeoutAwards recvGainAwardResult recvStageAwardList recvActiveChapterResult rv14109 sd14109 rv14110 opTvlEnd sd14120 rv14120 rv14121 sd14122 rv14122 exeOpG exeOpenHangupHaoLiView exeOpenHangupNextChapterView exeHgUi

**redDot** (7): registerRed setAchieveActRed getChallengeRed setTravelRed getHangupQuickRed getIsBossAwardRed checkHgRed

**predicate** (5): checkStartPrepar isGetAllRewardHaoLi checkIsHasGetById checkCanRewardByStageId checkGuideHookCanOutFight

**ui** (34): openHangupUi openChapterView closeChapterView closeChapterViewByShow openQuickViewOutside openQuickView closeQuickView closeGainView closeRecommend openBossAwardView closeBossAwardView openTravelView showEnterActorMove openStageShowUi closeStageShowUi showAchieveActRed showTravelRed showHangupTimeTips showTvlEft openOpGift openHangupHaoLiUi openHangupNextChapterUi openXYHaoLiUi openRechargeTqUI openhgRevenueUi closehgRevenueUi showRevenueTips openHgRevenueInfoUi closeHgRevenueInfoUi openHgRevenueJiaChengInfoUi closeHgRevenueJiaChengInfoUi openXianYuanAwardPreviewUI closeXianYuanAwardPreviewUI openChapterEffUi
