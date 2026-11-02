# TotalSignCtrl

Cumulative sign-in.

- gInst: yes | methods: 34 (own 10) | send: 3 | flags: reward
- own methods by kind: getter 1, other 2, response 3, send 3, ui 1

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send30191 | 30191 | none | no | on30191: updates local state |
| send30192 | 30192 | none | no | on30192: shows server error; updates local state |
| send30193 | 30193 | (1 arg) | no | on30193: shows server error; updates local state |

**getter** (1): getCurlModel

**other** (2): reqDataBeforeEnter regNetLit

**ui** (1): openTotalSignUi
