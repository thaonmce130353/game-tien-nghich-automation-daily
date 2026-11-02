# CGCtrl

Cutscenes (CG).

- gInst: yes | methods: 32 (own 10) | send: 2
- own methods by kind: getter 1, other 3, update 1, ui 1, send 2, response 2

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send30110 | 30110 | none | no | scmd30110: updates local state |
| send30111 | 30111 | ol_gift_id | no | scmd30111: shows server error; updates local state |

**getter** (1): getCurlModel

**other** (3): reqDataBeforeEnter finishAutoConnect regNetLit

**update** (1): clearCtrlState

**ui** (1): openCGUi
