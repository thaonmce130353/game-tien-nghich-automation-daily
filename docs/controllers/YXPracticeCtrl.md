# YXPracticeCtrl

Practice mode (guess).

- gInst: yes | methods: 46 (own 23) | send: 2
- own methods by kind: getter 4, update 1, other 4, redDot 4, send 2, ui 7, predicate 1
- name-flagged methods: purchase: openRecharge, openWHPracticeNewRechargeU

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send19520 | 19520 | activity_type | no | handler not in this controller |
| send19521 | 19521 | activity_type, type | no | handler not in this controller |

**getter** (4): getCurlModel getBaseCfgByActType getDataByType getHasGet

**update** (1): clearCtrlState

**other** (4): regNetLit rv19520 rv19521 onRedStatusChanged

**redDot** (4): registerRed getActivityChargeRed getDailyActiveRed getDailyAccRed

**ui** (7): openHall openRecharge closeAllViews closeTimeEvt openWHPracticeNewUi openWHPracticeNewRechargeU closeAllWHPracticeNewUi

**predicate** (1): checkActBtn
