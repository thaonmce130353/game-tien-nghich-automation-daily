# XianYuanCtrl

Tiên Duyên gifts.

- gInst: yes | methods: 79 (own 58) | send: 13
- own methods by kind: getter 6, redDot 6, update 2, other 21, send 13, predicate 3, ui 7

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send32100 | 32100 | page, num | no | handler not in this controller |
| send32101 | 32101 | none | no | handler not in this controller |
| send32102 | 32102 | name | no | handler not in this controller |
| send32103 | 32103 | type | no | handler not in this controller |
| send32104 | 32104 | type | yes | handler not in this controller |
| send32105 | 32105 | none | no | handler not in this controller |
| send32106 | 32106 | none | no | handler not in this controller |
| send32107 | 32107 | type, id | no | handler not in this controller |
| send32108 | 32108 | type, list | no | handler not in this controller |
| send32109 | 32109 | type, server_id, role_id | no | handler not in this controller |
| send32120 | 32120 | none | no | handler not in this controller |
| send32121 | 32121 | id | no | handler not in this controller |
| send32122 | 32122 | none | no | handler not in this controller |

**getter** (6): getCurlModel getTaskInfo getIsHasInvite getIsReqApplyTeam getTeamListData getMaxMemberCount

**redDot** (6): registerRed checkXianYuanHaoLiTaskRed checkXianYuanHaoLiBoxRed checkXianYuanHasTeamHaoLiBoxRed checkInviteNoTeamRed checkApplyRed

**update** (2): initBeforeData clearCtrlState

**other** (21): sendEvt reqDataBeforeEnter regNetLit rv32100 rv32101 rv32103 rv32105 rv32106 rv32107 rv32108 rv32109 rv32110 rv32111 rv32112 rv32120 rv32121 rv32122 rv32123 rv32124 rv32199 xianYuanIsOpen

**predicate** (3): isHasMyTeam isCapt checkRoleIsMyMember

**ui** (7): openXYApplyUi openXYCreateUi openXYInviteUi openXYChangeNameUi openXYListAlertUi openXYHasTeamApplyUi openXYLevelUi
