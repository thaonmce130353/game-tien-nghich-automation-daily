# FaZhenMirageCtrl

Fa Zhen (array) mirage feature.

- gInst: yes | methods: 45 (own 23) | send: 4
- own methods by kind: update 2, other 10, redDot 4, send 4, ui 2, getter 1
- name-flagged methods: reward: checkRewardRed

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send32060 | 32060 | none | no | handler not in this controller |
| send32061 | 32061 | action | no | handler not in this controller |
| send32062 | 32062 | list | no | handler not in this controller |
| send32064 | 32064 | none | no | handler not in this controller |

**update** (2): clearCtrlState initBeforeData

**other** (10): sendEvt reqDataBeforeEnter onRedStatusChanged regNetLit rv32060 rv32062 rv32063 rv32064 opFaZhenMirageUi allFinish

**redDot** (4): registerRed checkRewardRed checkChallengeRed checkTaskRed

**ui** (2): closeFZMMainui closeFZMFUiFun

**getter** (1): getStatusByScore
