# EmbattleCtrl

Battle formation setup.

- gInst: yes | methods: 102 (own 79) | send: 8
- own methods by kind: getter 11, update 8, other 24, ui 13, predicate 14, send 8, redDot 1

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send14010 | 14010 | type, list, sign | no | handler not in this controller |
| send14012 | 14012 | type, sign | no | handler not in this controller |
| send14016 | 14016 | type, list | no | handler not in this controller |
| send14017 | 14017 | type | no | handler not in this controller |
| send14025 | 14025 | type, origin_soul_list | no | handler not in this controller |
| send14026 | 14026 | combat_type | no | handler not in this controller |
| send14027 | 14027 | combat_type, list | no | handler not in this controller |
| send14028 | 14028 | type | no | handler not in this controller |

**getter** (11): getCurlModel getHeroDataByRealm getHeroHp getHelpStatus getIsHasHelp getMatrixHaloType getFairylandCopyType getOriginEmbattleCompData getEmbattleZdl getHangupHeroData getEmbattleNameByType

**update** (8): clearCtrlState clearEmbattleData clearDataSelect setScHelper initEMBInfo upDtDTypeSzInfo updateBoneCache resetClientOriginEmbattleData

**other** (24): regNetLit exeAfterEmbattleUi exeAfterEmbattleCollectUi addEmbattleById onCheckResonanceTips delEmbattleById autoEmbattle changeHangupHero reqDataBeforeEnter rv14010 rv14012 rv14016 rv14017 rv14018 otherPvpSaveInfo changeDtdPage rv14025 rv14027 sendOriginBattleInfo rv14028 rv14026 onekeyBattleOrigin oneKeyOriginEmbattle originBattleSave

**ui** (13): openEmbattle openEmbattleCollect openEmbattleDTDCollectUi openEmbattleKFRRCollectUi openEmbattleHeavenWarUi closeEmbattle openEmbattleResonanceUi closeEmbattleResonanceUi clickEmbattleHeroItem showMatrixUiFromEmbattle showMatrixUi closeMatrixUi clickEmbattleOriginItem

**predicate** (14): checkIsMoreEmb checkMoreEmbEqualHero isEmbattleCanChoice isEmbattleChoice isDtdEmbattleChoice hasSz isEmbattleBaseIdChoice hasHelpHero isInHpList isDeadH isAassistDeadH isInEmabttleOriginList isInWhereOriginTeam isInWhereOriginTeamByIdAndEmbattleType

**redDot** (1): getOriginBattleRed
