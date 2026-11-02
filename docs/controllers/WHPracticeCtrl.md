# WHPracticeCtrl

Practice mode (guess).

- gInst: yes | methods: 41 (own 17) | send: 2
- own methods by kind: update 2, other 4, redDot 5, send 2, ui 3, getter 1
- name-flagged methods: purchase: getRechargeRed, openRecharge | reward: initRewardData

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send19462 | 19462 | none | no | handler not in this controller |
| send19463 | 19463 | (1 arg) | no | handler not in this controller |

**update** (2): clearCtrlState initRewardData

**other** (4): regNetLit rv19462 rv19463 onRedStatusChanged

**redDot** (5): registerRed updateHallRed getActivityRed getRechargeRed getActivityChargeRed

**ui** (3): openHall openRecharge closeTimeEvt

**getter** (1): getActInfo
