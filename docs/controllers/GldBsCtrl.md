# GldBsCtrl

Guild boss (guess).

- gInst: yes | methods: 66 (own 43) | send: 9
- own methods by kind: getter 5, other 6, update 4, ui 4, send 9, response 13, redDot 2

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send31201 | 31201 | none | no | scmd31201Handler: updates local state |
| send31204 | 31204 | none | no | scmd31204Handler: shows server error; updates local state |
| send31205 | 31205 | none | no | scmd31205Handler: no notable effect |
| send31206 | 31206 | id | no | scmd31206Handler: shows server error; updates local state |
| send31207 | 31207 | none | no | scmd31207Handler: no notable effect |
| send31208 | 31208 | none | no | scmd31208Handler: no notable effect |
| send31210 | 31210 | none | no | scmd31210Handler: no notable effect |
| send31211 | 31211 | none | no | scmd31211Handler: no notable effect |
| send31213 | 31213 | none | no | scmd31213Handler: no notable effect |

**getter** (5): getCurlModel getQdId get31206Data get31204Data getIsCross

**other** (6): reqDataBeforeEnter regNetLit sendRankInfo formateDanMuStr jgHandler qdHandler

**update** (4): clearCtrlState setQdId clear31206Data clear31204Data

**ui** (4): openGldBsUi openScUi openRwrdUi openRcrdUi

**redDot** (2): updateRed getRed
