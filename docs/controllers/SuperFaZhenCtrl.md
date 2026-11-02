# SuperFaZhenCtrl

Super array (fa zhen) system.

- gInst: yes | methods: 51 (own 28) | send: 3
- own methods by kind: other 11, redDot 5, update 2, send 3, ui 3, getter 4
- name-flagged methods: reward: getZhanLingAwardRed

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send19473 | 19473 | (1 arg) | no | handler not in this controller |
| send19474 | 19474 | unique_id, times | no | handler not in this controller |
| send19475 | 19475 | optional_id | no | handler not in this controller |

**other** (11): toRequestServerData reqDataBeforeEnter regNetLit rv19473 rv19474 rv19475 opSuperFaZhenHallUi opSuperFaZhenUpGiftUi opRecruitRankUi onRedStatusChanged bInActTime

**redDot** (5): registerRed checkGoodGiftRed checkRecruitTenRed getZhanLingAwardRed getZhanLingTaskRed

**update** (2): clearCtrlState updateZGIcon

**ui** (3): openZhanLingTask openSsuperFaZhenSelectUi closeTimeEvt

**getter** (4): getCloseTime getActivityId getUpRecruitRankCond getIsJumpRecuitEff
