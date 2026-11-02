# MxActCtrl

Unknown activity (name not decodable).

- gInst: yes | methods: 38 (own 15) | send: 3 | flags: reward
- own methods by kind: getter 2, other 2, update 2, ui 1, send 3, response 5

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send31101 | 31101 | none | no | on31101: updates local state |
| send31104 | 31104 | id | no | on31104: shows server error; re-requests send31101 |
| send31105 | 31105 | (1 arg) | no | on31105: shows server error; re-requests send31101 |

**getter** (2): getCurlModel getMxTaskCfg

**other** (2): reqDataBeforeEnter regNetLit

**update** (2): clearCtrlState uptTaskDat

**ui** (1): openMxActUi
