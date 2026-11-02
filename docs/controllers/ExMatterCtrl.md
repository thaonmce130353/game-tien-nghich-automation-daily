# ExMatterCtrl

Unknown material system (guess).

- gInst: yes | methods: 57 (own 34) | send: 3
- own methods by kind: getter 5, redDot 4, update 3, other 8, send 3, predicate 7, ui 4
- name-flagged methods: purchase: openBatchBuyUi

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send19643 | 19643 | none | no | handler not in this controller |
| send19644 | 19644 | (2 arg) | no | handler not in this controller |
| send19690 | 19690 | (3 arg) | no | handler not in this controller |

**getter** (5): getCurlModel getActivityId getExchangeNum getRedTipByUid getSeleHeroDataByUid

**redDot** (4): registerRed updateExMatterHallRed checkTabRed isTipAllRed

**update** (3): clearCtrlState setRedTipByUid setSeleHeroDataByUid

**other** (8): regNetLit rv19643 rv19644 rv19690 bInActTime onRedStatusChanged changeAllRedTip changeOneRedTip

**predicate** (7): checkCityBtn isExChangeOpen isCanExchange canExChange isHeroCanExChange isSingleHeroCanExChange isHeroInWoodCarveBattle

**ui** (4): closeTimeEvt openExMatterHall openExMatterSelectUi openBatchBuyUi
