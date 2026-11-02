# DailyDungeonCtrl

Daily dungeons, Thông Thiên Tháp tower and running-man modes.

- gInst: yes | methods: 148 (own 126) | send: 10
- own methods by kind: getter 39, redDot 9, other 28, update 9, ui 17, send 10, response 11, predicate 3
- name-flagged methods: gm: openRunningManZhanLin | purchase: getAllTotalBuyCount, getBuyCountTypeObj | reward: gFaAward, getDgnPassRewardCfgByTypeAndId, getFourCostAwardCfgCrtArr, sFaAwardData

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send11001 | 11001 | dungeon_id, is_auto_fight | no | on11001: shows server error; updates local state; opens UI |
| send11002 | 11002 | type | no | on11002: shows server error |
| send11004 | 11004 | type | no | on11004: no notable effect |
| send11005 | 11005 | dungeon_id | no | on11005: shows server error |
| send11006 | 11006 | dungeon_id | no | on11006: shows server error; updates local state; re-requests send11004 |
| send11007 | 11007 | dungeon_id, dungeon_type, type | no | on11007: shows server error; re-requests send11020,send11001,send11005,send11004 |
| send11008 | 11008 | none | no | on11008: updates local state |
| send11009 | 11009 | dungeon_id | no | on11009: re-requests send11004 |
| send11015 | 11015 | dungeon_id | no | on11015: no notable effect |
| send11020 | 11020 | id, assist_role_id, assist_pos | yes | handler not in this controller |

**getter** (39): getCurlModel getSaoDanCopyId gSealAttData gScDes gScId getBuyCountTypeObj getDungeonDataList getdungeonHisMap getChallengeId getMopUp gRedSta gRedSta2 gBaseCfg gDgnData gDgnBaseTypeArr gTJDgnBaseId getCurUnitId getUnitByEmbtype gCurDgnId gLastDgnId getFairyLandUnitId gDgnPassAwaCfg getDgnPassRewardCfgByTypeAndId gDgnPassNext gDgnTypeCfg gDgnCostCfg2 gFaId gFaRP gFaAward gFaData getRedDic getRedDic2 getFourCostAwardCfgCrtArr getMianFeiNum getAllMianFeiNum getAllTotalBuyCount getFaEmbattleData getDailyDungeonFunIdByDungeonType getDungeonData

**redDot** (9): registerRed sScHelpRed runningDungeonRed dailyDungeonRed fairyRed checkLiLianRed getSingCampRed getScHelpRed getFaMainRed

**other** (28): reqDataBeforeEnter regNetLit exeRunMan exeAfterDailyDungeon sRMFightData inRManFight inSingCampFight inSaoDangCopy opSCpCyUi exeSCpCy opSCpCyTip opEThelpSysUi saveScId intoScFight shareVideo sd11021 sd11022 rv11022 rv11021 iGPassAwa exeFaMainUi cliFaSelItem saodang tiaozhan exeFaSelUi saveFaId intoFaFight sFaAwardData

**update** (9): upRoleData clearCtrlState upRoleAtt setSaoDanCopyId updateDungeonFightIdData clearDungeonFightId upScmd11004 setRedDic setRedDic2

**ui** (17): openRunManUi openDDgn closeDDgn showHelp clickFight openFaMainUi openRuleUi closeFaUi openFightBack openFaSelUi closeFaiSelUi openFaAwaUi openFaRaUi closeFaRaUi opendailyCopySDTips closedailyCopySDTips openRunningManZhanLin

**predicate** (3): isTJDgn isPassDgn isPassMaxDgnTJ
