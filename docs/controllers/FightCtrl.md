# FightCtrl

Combat engine: fight frames, playback, skip, finish.

- gInst: yes | methods: 117 (own 93) | send: 5
- own methods by kind: getter 25, other 22, update 2, ui 28, predicate 10, send 5, response 1
- name-flagged methods: gm: closeGmFightReportUi, isRunningManFight, openGmFightReportUi | reward: getAwardsInfoGroup, getComAwardsInfoGroup

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send14009 | 14009 | record_id | no | scmd14009Handler: shows server error |
| send14015 | 14015 | unit_id, type | no | handler not in this controller |
| send14031 | 14031 | id | no | handler not in this controller |
| send14032 | 14032 | unit_id, type | no | handler not in this controller |
| send14047 | 14047 | record_id, type | no | handler not in this controller |

**getter** (25): getSkillActInfo getSkillEffectInfo getRdSkiEftInfo getSkillAction getSkillType getIsESkill getSkillFrameInfo getSkillSoundDelay getEffectData getBuffEffectDatas getBuffName getBuffActType getBuffRes getEffectTweenInfos getFightSceneEftDataGroup getFightActorData getIsFightSuccess getIsRecord getIsJump getFightType getFightSuccessInfo getAwardsInfoGroup gCanFight getCurlModel getComAwardsInfoGroup

**other** (22): scFightBack executeFinishFight preViewFightResult replayCurRoundFight selectCountStatus regNetLit rd14002 recvFightFrame transRoundFightList executeShowRoundFight executeEndlessFight opSwdRsl opMzRsl opQmRsl lookRecord sd14013 rd14013 rd14014 rd14015 rd14032 rd14031 rd14048

**update** (2): resetFightType clearCtrlState

**ui** (28): closeFightResultView closeGuildDungeonFightResultView showFightSuccessUi closeFightSuccessUi showFightFailUi showFailUiData closeFightFailui showRecruitView showHeroView showQuickView showDTDFightCountUi showFightCountUi closeFightCountUi showFightSuccess showDungeonFightSuccess showHyBsFightSuccess showExpeditionFightSuccess showGldWrScsUi showSpiritAnimalHomeFight showDevilSeaFightSuccess showJyzdFightSuccess showYMAbyssFightSuccess showHeavenFightSuccess openGmFightReportUi closeGmFightReportUi openDTDFightResultUi closeDTDFightResultUi openWJDZysResultUi

**predicate** (10): isStillEndlessFight isStillKflolFight isStillDzrVdFight isExpeditionFight isRunningManFight isArenaFight isGuildBossFight isGuildBossSnatchFight isMazeFight isJudgeFightType
