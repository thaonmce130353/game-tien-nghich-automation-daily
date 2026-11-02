# RainRuinsCtrl

Rain Ruins event.

- gInst: yes | methods: 55 (own 33) | send: 6
- own methods by kind: getter 5, redDot 4, update 2, other 10, send 6, ui 5, predicate 1

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send32700 | 32700 | flag | no | handler not in this controller |
| send32701 | 32701 | team_id | no | handler not in this controller |
| send32702 | 32702 | none | no | handler not in this controller |
| send32703 | 32703 | index, team_id | no | handler not in this controller |
| send32704 | 32704 | none | no | handler not in this controller |
| send32707 | 32707 | none | no | handler not in this controller |

**getter** (5): getCurlModel getIdleTeamIdArr getAllTeamId getTeamField getCurEssenceStatus

**redDot** (4): registerRed checkRed checkCollectUpLvRed checkRRTeamIdleRed

**update** (2): initBeforeData clearCtrlState

**other** (10): sendEvt regNetLit rv32700 rv32701 rv32702 rv32703 rv32704 rv32705 rv32706 rv32707

**ui** (5): openRainRuinsUi openRRFeildInfoUi closeRRFeildInfoUi openRRCollectLevelInfoUi openRRCollectUpLevSucUi

**predicate** (1): checkTeamUnLock
