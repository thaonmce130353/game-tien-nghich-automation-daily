# ChatHBCtrl

Chat red envelopes (hongbao).

- gInst: yes | methods: 49 (own 25) | send: 6
- own methods by kind: other 6, update 3, ui 2, send 6, response 6, predicate 2

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send31700 | 31700 | id | no | on31700: updates local state |
| send31701 | 31701 | none | no | on31701: updates local state; opens UI |
| send31702 | 31702 | id, type | no | on31702: shows server error |
| send31703 | 31703 | none | no | on31703: no notable effect |
| send31704 | 31704 | item_id, mark | no | on31704: shows server error |
| send31705 | 31705 | none | no | on31705: no notable effect |

**other** (6): reqDataBeforeEnter regNetLit reqList exeMainUi exeInfoUi sortFun

**update** (3): clearCtrlState updateRAttr updateRData

**ui** (2): showMain showInfo

**predicate** (2): checkShow isShowEnter
