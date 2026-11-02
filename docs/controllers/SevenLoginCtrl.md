# SevenLoginCtrl

Seven-day login rewards.

- gInst: yes | methods: 36 (own 13) | send: 2 | flags: reward
- own methods by kind: getter 3, other 2, update 1, ui 1, send 2, predicate 1, response 2, redDot 1
- name-flagged methods: reward: getRewardStr, isAllGetDayReward

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send30801 | 30801 | none | no | on30801: updates local state |
| send30802 | 30802 | day | no | scmd30802Handler: shows server error; re-requests send30801 |

**getter** (3): getCurlModel getRewardStr getGetStatus

**other** (2): reqDataBeforeEnter regNetLit

**update** (1): clearCtrlState

**ui** (1): openSevenLoginUi

**predicate** (1): isAllGetDayReward

**redDot** (1): checkRed
