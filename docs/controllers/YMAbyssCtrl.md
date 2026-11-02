# YMAbyssCtrl

Vực U Minh (abyss) dungeon.

- gInst: yes | methods: 47 (own 24) | send: 4
- own methods by kind: update 1, other 8, redDot 3, send 4, getter 3, ui 5
- name-flagged methods: reward: getPassRewardRed, openYMAbyssPassReward

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send32070 | 32070 | none | no | handler not in this controller |
| send32071 | - | (1 arg) | no | - |
| send32072 | 32072 | none | no | handler not in this controller |
| send32073 | 32073 | chapter | no | handler not in this controller |

**update** (1): clearCtrlState

**other** (8): reqDataBeforeEnter regNetLit recive32070 recive32072 recive32073 curZLTermId onRedStatusChanged startFight

**redDot** (3): registerRed getZhanlingRed getPassRewardRed

**getter** (3): getWanFaStr getUnitId getZLMinimumCfg

**ui** (5): openYMAbyss openYMAbyssRank openYMAbyssZhanling openYMAbyssPassReward openYMAbyssChallange
