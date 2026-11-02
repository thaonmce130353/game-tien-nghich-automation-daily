# KFRainRuinsCtrl

Cross-server Rain Ruins event.

- gInst: yes | methods: 81 (own 58) | send: 10
- own methods by kind: getter 11, update 4, redDot 5, other 19, send 10, ui 6, predicate 3
- name-flagged methods: purchase: openKFRRCountBuyUi

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send32710 | 32710 | flag | no | handler not in this controller |
| send32711 | 32711 | layer | no | handler not in this controller |
| send32712 | 32712 | layer, index | no | handler not in this controller |
| send32713 | 32713 | layer, index, team_id | no | handler not in this controller |
| send32714 | 32714 | layer, index, team_id | no | handler not in this controller |
| send32715 | 32715 | type | no | handler not in this controller |
| send32716 | 32716 | type, id | no | handler not in this controller |
| send32717 | 32717 | type | no | handler not in this controller |
| send32722 | 32722 | times | no | handler not in this controller |
| send32724 | 32724 | none | no | handler not in this controller |

**getter** (11): getCurlModel getDeclareNumByType getKFRRStartShowTime getKFRREndShowTime getKFRRIsOpen getIdleTeamIdArr getUnlockTeamIdArr getIsDeclareById getSteanceByFieldInfo getProtTime getProtEndTime

**update** (4): clearCtrlState clearProtoctedTime clearCDTime clearOccTime

**redDot** (5): registerRed checkZBRed checkKFRRIdleTeamRed setZBRed checkRed

**other** (19): regNetLit rv32710 rv32711 rv32712 rv32713 rv32714 rv32715 rv32716 rv32717 rv32718 rv32719 rv32720 rv32721 rv32722 rv32723 rv32724 protectedTimeFun cdTimeFun occTimeFun

**ui** (6): openKFRainRuinsUi openKFRRFeildInfoUi closeKFRRFeildInfoUi openKFRRGldListInfoUi openKFRRRRecordUi openKFRRCountBuyUi

**predicate** (3): checkOnTeamIdx checkTeamIsCollect checkFieldCanFight
