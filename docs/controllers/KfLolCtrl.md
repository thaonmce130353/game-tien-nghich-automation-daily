# KfLolCtrl

Cross-server competitive mode (guess).

- gInst: yes | methods: 100 (own 77) | send: 13
- own methods by kind: redDot 4, update 4, other 34, send 13, ui 9, getter 10, predicate 3
- name-flagged methods: gm: gMatRoleInfo

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send14301 | 14301 | none | no | handler not in this controller |
| send14302 | 14302 | type, is_skip | yes | handler not in this controller |
| send14303 | 14303 | none | no | handler not in this controller |
| send14304 | 14304 | is_skip | no | handler not in this controller |
| send14307 | 14307 | type | no | handler not in this controller |
| send14308 | 14308 | type, id | no | handler not in this controller |
| send14312 | 14312 | level | no | handler not in this controller |
| send14313 | 14313 | none | no | handler not in this controller |
| send14314 | 14314 | none | no | handler not in this controller |
| send14315 | 14315 | season_id | no | handler not in this controller |
| send14316 | 14316 | season_id | no | handler not in this controller |
| send14317 | 14317 | season_id, area_id | no | handler not in this controller |
| send14319 | 14319 | none | no | handler not in this controller |

**redDot** (4): registerRed checkRed getKfLolRed updateZlRed

**update** (4): clearCtrlState upRoleAtt upRoleData updateZlType

**other** (34): reqDataBeforeEnter regNetLit rv14301 rv14302 rv14303 rv14304 rv14306 rv14307 rv14308 rv14309 rv14312 rv14313 rv14314 rv14315 rv14316 rv14317 rv14319 cliBattleHdr exeAfterKfLolUi clKfLolUi opMatchUi exeAfterMatchingUi clMatchUi exeAfterSeasonUi clSeaUi opSeaListUi clSeaListUi exeAfterSucceedUi remainStage sendCVideo rv14318 finishFight cliSucUiBackBtn lookVdEnd

**ui** (9): clickPpBtn clickAddBtn clickBtn openKfLolUi openSucUi closeSucUi openKfZJUi openKfReRankUi openCbVideoUi

**getter** (10): gMatRoleInfo getDanInfo getHeroList getKfLolTabData gKfCbLogData gKfZJData gRankReData getLolMainInfo getMaxLev getOpenTime

**predicate** (3): isCanJoinKing isOpenKinging isStageEmpty
