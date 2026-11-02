# HeavenWarCtrl

Heaven war event (guess).

- gInst: yes | methods: 275 (own 254) | send: 59
- own methods by kind: getter 24, other 86, redDot 18, update 6, predicate 13, ui 48, send 59
- name-flagged methods: purchase: getTqBuyStatue, getWarOrderRed, openActWarOrderHall | reward: canGetCwReward, getBoxRewardRed, getCwRewardCfgArr, getCwRewardOnlineTime, getPrevCwRewardNeedOnlineTime, hasGetCwReward

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send18300 | 18300 | none | no | handler not in this controller |
| send18301 | 18301 | team_cfg_id | no | handler not in this controller |
| send18302 | 18302 | team_id | no | handler not in this controller |
| send18303 | 18303 | team_id, type | no | handler not in this controller |
| send18304 | 18304 | city_id, city_ids | yes | handler not in this controller |
| send18305 | 18305 | id | no | handler not in this controller |
| send18306 | 18306 | team_id, team_ids, id, opt_type | yes | handler not in this controller |
| send18308 | 18308 | march_id, type | no | handler not in this controller |
| send18311 | 18311 | none | no | handler not in this controller |
| send18312 | 18312 | type | no | handler not in this controller |
| send18313 | 18313 | id | no | handler not in this controller |
| send18314 | 18314 | id | no | handler not in this controller |
| send18315 | 18315 | none | no | handler not in this controller |
| send18316 | 18316 | none | no | handler not in this controller |
| send18317 | 18317 | tar_id | no | handler not in this controller |
| send18319 | 18319 | content | no | handler not in this controller |
| send18320 | 18320 | none | no | handler not in this controller |
| send18322 | 18322 | none | no | handler not in this controller |
| send18324 | 18324 | none | no | handler not in this controller |
| send18325 | 18325 | none | no | handler not in this controller |
| send18326 | 18326 | type, sub_type, lv | no | handler not in this controller |
| send18328 | 18328 | none | no | handler not in this controller |
| send18330 | 18330 | type, id | no | handler not in this controller |
| send18331 | 18331 | none | no | handler not in this controller |
| send18332 | 18332 | combat_id | no | handler not in this controller |
| send18334 | 18334 | record_id | no | handler not in this controller |
| send18335 | 18335 | event_pos_list | no | handler not in this controller |
| send18336 | 18336 | none | no | handler not in this controller |
| send18337 | 18337 | event_id | no | handler not in this controller |
| send18338 | 18338 | event_id | no | handler not in this controller |
| send18340 | 18340 | none | no | handler not in this controller |
| send18342 | 18342 | type, id | no | handler not in this controller |
| send18343 | 18343 | id | no | handler not in this controller |
| send18345 | 18345 | none | no | handler not in this controller |
| send18346 | 18346 | none | no | handler not in this controller |
| send18350 | 18350 | none | no | handler not in this controller |
| send18351 | 18351 | level | no | handler not in this controller |
| send18352 | 18352 | season_id | no | handler not in this controller |
| send18353 | 18353 | rank | no | handler not in this controller |
| send18354 | 18354 | none | no | handler not in this controller |
| send18355 | 18355 | (1 arg) | no | handler not in this controller |
| send18357 | 18357 | none | no | handler not in this controller |
| send18358 | 18358 | none | no | handler not in this controller |
| send18361 | 18361 | none | no | handler not in this controller |
| send18362 | 18362 | hangup_list | no | handler not in this controller |
| send18363 | 18363 | is_hangup | no | handler not in this controller |
| send18370 | 18370 | none | no | handler not in this controller |
| send18371 | 18371 | num_id | no | handler not in this controller |
| send18372 | 18372 | num_id, mark | no | handler not in this controller |
| send18374 | 18374 | none | no | handler not in this controller |
| send18375 | 18375 | none | no | handler not in this controller |
| send18376 | 18376 | none | no | handler not in this controller |
| send18377 | 18377 | (1 arg) | no | handler not in this controller |
| send18380 | 18380 | none | no | handler not in this controller |
| send18381 | 18381 | none | no | handler not in this controller |
| send18384 | 18384 | heaven_war_scene_avatar_id | no | handler not in this controller |
| send18385 | 18385 | refresh_type | no | handler not in this controller |
| send18386 | 18386 | heaven_war_scene_avatar_id | no | handler not in this controller |
| send18387 | 18387 | heaven_war_scene_avatar_id, guard_recruit_recommend | no | handler not in this controller |

**getter** (24): getCurlModel getHeavenWarVo getSeasonId getSceneVo getCampInfo getExploreEventDic getExploreEventById getExploreEventByEntityId getRouteShowCnt getHWRankInfoBySeasonId getLevelTaskComplteteNumById getProtEndTime getProtTime getCampTSskillVoByNumId getTimeGhostVo getItemIdByDay getCfg getSeaonDay getTqBuyStatue getMemberItemVo getCwRewardOnlineTime getPrevCwRewardNeedOnlineTime getCwRewardCfgArr getTodayRecommendCityList

**other** (86): regNetLit beforeReq sendTaskInfo finishAutoConnect enterMap exitMap rv18300 rv18301 rv18302 rv18303 rv18304 seasonEndClearEntitys rv18305 rv18306 syncRouteVo rv18307 rv18308 rv18310 rv18313 rv18314 rv18315 rv18373 rv18316 rv18317 rv18318 rv18319 rv18320 rv18321 rv18322 rv18323 rv18324 rv18326 rv18327 rv18328 rv18330 rv18331 rv18332 rv18333 reqFightVideo rv18334 rv18336 rv18337 rv18338 rv18339 rv18340 rv18341 rv18342 rv18343 rv18344 rv18345 rv18346 rv18350 rv18351 rv18352 rv18353 rv18354 rv18355 rv18356 rv18357 rv18358 rv18359 rv18361 rv18362 rv18363 rv18370 rv18371 rv18372 rv18399 rv18376 rv18377 rv18378 rv18311 rv18312 rv18380 rv18381 rv18382 rv18383 rv18384 rv18385 rv18386 rv18387 rv18374 rv18375 randomPositions onCrossSky scheduleCityBattleBtnRefresh

**redDot** (18): registerRed isShowReportRed isShowTeamRed checkLevelRed checkExploreRed checkTianShuBigTypeRed checkTianShuBuffRed getWarOrderRed getDailyGiftRed getTaskRed getBoxRewardRed checkZanRed getSeasonGoalsRed checkCampHongzeRed checkCwRed checkProfitRed checkWarDayTaskRed checkShopFreeRefreshRed

**update** (6): initBeforeData clearCtrlState setCampId clearData initIdDay clearCityBattleBtnRefresh

**predicate** (13): isLeagueEntryBlocked isInCampCityFightTime checkSaveExploreEventPos hasGetCwReward canGetCwReward isCityAxisNeighborSelfCamp isTodayRecommendCity checkCityBattleBtn checkWarDayTaskRedByCityId checkSeasonCityWarStatue isMinCwOpenDay isInCwDay isMaxCwDay

**ui** (48): openMainUi openMap openCampHallTabView closeCampHallTabView openCampBoardUi openCampFlagUi openTeamInfoUi openEssenceUi openMarchSpeedUi openReportTabView openPersonReportInfoUi openCampReportInfoUi openJumpPrgeUi openShopTabView openCityInfoUi closeCityInfoUi openTeamUi openReportInfoUi openTeamRepairTipUi openHangupUi openSwordSelectUi openUnitInfoUi openSiegeTask closeSiegeTask openRankUi openLevelTaskUi openCampTianShuUi openFieldInfoUi closeFieldInfoUi openMonsterInfoUi closeMonsterInfoUi openSearchUi closeSearchUi openExploreUi openTreasureMapUi closeTreasureMapUi openRescueUi closeRescueUi openTimeGhostMain openTimeGhostList openActWarOrderHall openRankView openSeasonGoalsUi openCampHongzeUi openHeavenWarProfitUi openCityListUi closeCityListUi openHeavenWarRecruitSoldierUi
