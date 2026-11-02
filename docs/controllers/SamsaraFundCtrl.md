# SamsaraFundCtrl

Samsara fund (reincarnation-themed fund).

- gInst: yes | methods: 57 (own 35) | send: 7 | flags: purchase
- own methods by kind: getter 2, other 16, update 1, redDot 3, predicate 4, send 7, ui 2
- name-flagged methods: reward: backAwardStatusById, checkRebateAwardRed, checkSignAwardRed, getAwardStatusByDay, isAwardAllDone, isCanAward, isCanAwardByDay

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send19672 | 19672 | none | no | handler not in this controller |
| send19673 | 19673 | (2 arg) | no | handler not in this controller |
| send19674 | 19674 | (1 arg) | yes | handler not in this controller |
| send19675 | 19675 | (1 arg) | no | handler not in this controller |
| send19676 | 19676 | (2 arg) | no | handler not in this controller |
| send19678 | 19678 | (2 arg) | no | handler not in this controller |
| send19679 | 19679 | none | no | handler not in this controller |

**getter** (2): getCurlModel getAwardStatusByDay

**other** (16): reqDataBeforeEnter regNetLit sendInfo onCrossSky rv19672 rv19673 rv19674 rv19675 rv19676 rv19677 rv19678 rv19679 bInActTime onRedStatusChanged backAwardStatusById jumpOtherTeam

**update** (1): clearCtrlState

**redDot** (3): registerRed checkSignAwardRed checkRebateAwardRed

**predicate** (4): checkAddCityBtn isCanAward isCanAwardByDay isAwardAllDone

**ui** (2): openFundsMainView openFundsTeamView
