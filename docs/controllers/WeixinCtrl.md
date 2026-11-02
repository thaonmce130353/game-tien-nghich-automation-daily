# WeixinCtrl

WeChat platform features.

- gInst: yes | methods: 45 (own 24) | send: 1
- own methods by kind: getter 2, update 7, redDot 3, other 8, predicate 2, send 1, ui 1
- name-flagged methods: reward: isGotAward, rvGetAward, sendGetAward

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send30130 | 30130 | none | no | handler not in this controller |

**getter** (2): getCurlModel getGameHubCount

**update** (7): initBeforeData initWx initBl initTT clearCtrlState updateGameHubCount updateGongYiIcon

**redDot** (3): registerRed getGameHubFirstRed getGameHubRed

**other** (8): onRedStatusChanged reqDataBeforeEnter regNetLit sendGetAward sendShareCount rvBaseInfo rvGetAward rvShareCount

**predicate** (2): canGet isGotAward

**ui** (1): openWeixinShareUi
