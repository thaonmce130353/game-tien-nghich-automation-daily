# FriendCtrl

Friends (Tiên Hữu): list, requests, gifting.

- gInst: yes | methods: 82 (own 60) | send: 15
- own methods by kind: other 7, update 2, redDot 4, ui 8, response 17, send 15, getter 7

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send11800Msg | 11800 | none | no | scmd11800Handler: no notable effect |
| send11801Msg | 11801 | none | no | scmd11801Handler: updates local state; re-requests send10413 |
| send11802Msg | 11802 | none | no | scmd11802Handler: updates local state; re-requests send10414 |
| send11803Msg | 11802 | signature | no | scmd11802Handler: updates local state; re-requests send10414 |
| send11804Msg | 11804 | id, platform, zone_id | no | scmd11804Handler: shows server error; updates local state |
| send11805Msg | 11805 | flag, name, id, platform, zone_id | no | scmd11805Handler: no notable effect |
| send11806Msg | 11806 | id, platform, zone_id | no | scmd11806Handler: no notable effect |
| send11807Msg | 11807 | id, platform, zone_id | no | scmd11807Handler: no notable effect |
| send11808Msg | 11808 | name | no | scmd11808Handler: no notable effect |
| send11809Msg | 11809 | none | no | scmd11809Handler: no notable effect |
| send11810Msg | 11810 | type | no | scmd11810Handler: no notable effect |
| send11811Msg | 11811 | none | no | scmd11811Handler: updates local state |
| send11812Msg | 11812 | id, ids | yes | scmd11812Handler: updates local state |
| send11813Msg | 11813 | id, ids | yes | scmd11813Handler: updates local state |
| send14030Msg | 14030 | id | no | scmd14030Handler: shows server error; updates local state |

**other** (7): reqDataBeforeEnter regNetLit compare deleteApplyFriendData addApplyFriendData qieCuoEndHandler markLasetPKOpenMainUi

**update** (2): clearCtrlState initTJFriAppState

**redDot** (4): registerRed checkSQLBRed updateRed checkHYRed

**ui** (8): clickHeroItem openFriendFunc openFriendAdd closeFriendAdd closeFriendSystem openRoleInfoUi closeRoleInfoUi openLastPkUi

**getter** (7): getCurlModel getFriendType getAndSendLove getFriendDataByRoleId getFriendLeaveTime getFriendListByType getTjFriAppState
