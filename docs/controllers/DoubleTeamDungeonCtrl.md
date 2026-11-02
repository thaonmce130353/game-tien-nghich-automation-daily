# DoubleTeamDungeonCtrl

Two-team cooperative dungeon.

- gInst: yes | methods: 45 (own 23) | send: 5
- own methods by kind: getter 1, update 2, other 7, redDot 4, send 5, ui 4
- name-flagged methods: reward: getZhanLingAwardRed

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send32080 | 32080 | none | no | handler not in this controller |
| send32081 | 32081 | none | no | handler not in this controller |
| send32082 | 32082 | chapter | no | handler not in this controller |
| send32083 | 32083 | none | no | handler not in this controller |
| send32084 | 32084 | id | no | handler not in this controller |

**getter** (1): getCurlModel

**update** (2): clearCtrlState initBeforeData

**other** (7): regNetLit sendEvt rv32080 rv32081 rv32082 rv32083 rv32084

**redDot** (4): registerRed checkRed getZhanLingAwardRed checkSweepRed

**ui** (4): openDoubleTeamDungeonUi openDTDBossInfoUi openDTDZhanLingUi openDTDPassRwUi
