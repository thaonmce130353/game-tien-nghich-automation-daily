# BnqdCtrl

Unknown event system (name not decodable).

- gInst: yes | methods: 32 (own 8) | send: 2
- own methods by kind: other 2, update 1, ui 1, send 2, response 2

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send19360 | 19360 | none | no | on19360: updates local state |
| send19361 | 19361 | none | no | on19361: shows server error; updates local state |

**other** (2): reqDataBeforeEnter regNetLit

**update** (1): clearCtrlState

**ui** (1): showBnqdUi
