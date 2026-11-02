# LeagueCraftCtrl

League crafting / league content (guess).

- gInst: yes | methods: 64 (own 43) | send: 8
- own methods by kind: getter 2, other 16, redDot 8, update 2, send 8, predicate 2, ui 5

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send32801 | 32801 | none | no | handler not in this controller |
| send32803 | 32803 | action, formation_list | no | handler not in this controller |
| send32804 | 32804 | none | no | handler not in this controller |
| send32805 | 32805 | none | no | handler not in this controller |
| send32806 | 32806 | condition | no | handler not in this controller |
| send32807 | 32807 | channel, combat_record_id | no | handler not in this controller |
| send32808 | 32808 | record_id | no | handler not in this controller |
| send32809 | 32809 | lookup_type | no | handler not in this controller |

**getter** (2): getCurlModel getInfo

**other** (16): regNetLit finishAutoConnect sendEvt reqDataBeforeEnter rv32801 rv32802 rv32803 rv32804 rv32805 rv32806 rv32807 rv32810 rv32812 threeTeamIsHaveNotBattleHero filterArgsList onRedStatusChanged

**redDot** (8): registerRed updateHallRed summaryRed getTaskRed getSignupRed getReportRed getPointMatchRed getEmliminateMatchRed

**update** (2): initBeforeData updateCityBtn

**predicate** (2): checkOnTeamIdx isHaveNotBattleHero

**ui** (5): closeAllView openHallUi openEmbattleUi openSignUpUi openFightWinUi
