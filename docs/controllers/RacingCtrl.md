# RacingCtrl

Racing mini-game.

- gInst: yes | methods: 75 (own 55) | send: 9
- own methods by kind: getter 7, other 18, update 4, redDot 2, send 9, predicate 8, ui 7
- name-flagged methods: reward: openRacingRankAwardUi

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send32501 | 32501 | none | no | handler not in this controller |
| send32502 | 32502 | none | no | handler not in this controller |
| send32503 | 32503 | none | no | handler not in this controller |
| send32504 | 32504 | none | no | handler not in this controller |
| send32505 | 32505 | none | no | handler not in this controller |
| send32506 | 32506 | (2 arg) | no | handler not in this controller |
| send32507 | 32507 | (2 arg) | no | handler not in this controller |
| send32508 | 32508 | (1 arg) | no | handler not in this controller |
| send32512 | 32512 | none | no | handler not in this controller |

**getter** (7): getCurlModel getSpeedCountNum getTopThreeRankList getMyselfRankItem getUniqueRankList getRacingRankData getNowBossPosNum

**other** (18): reqDataBeforeEnter beforeReq finishAutoConnect regNetLit rv32501 rv32502 rv32503 rv32504 rv32505 rv32506 rv32508 rv32509 rv32510 rv32511 rv32512 rv32513 onRedStatusChanged onLeagueStatusChange

**update** (4): clearCtrlState initBeforeData setBuffProp setCompeInfo

**redDot** (2): registerRed checkSignBtnRed

**predicate** (8): checkCityBtn isCompetClose isCompetSinge isCompetAdvan isActivityOpen checkEnBossPos checkEnEndEvt isRaceCompleted

**ui** (7): openRacingEnrollUi openRacingFieldUi closeRacingFieldUi openRacingRankAwardUi openRacingPrivilegeUi openRacingPlanFightUi openRacingRollCallUiSkin
