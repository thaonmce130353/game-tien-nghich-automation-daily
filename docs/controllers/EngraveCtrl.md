# EngraveCtrl

Equipment engraving.

- gInst: yes | methods: 71 (own 50) | send: 9
- own methods by kind: getter 6, other 14, update 3, redDot 6, predicate 3, send 9, ui 9
- name-flagged methods: gm: closeEngraveLongMainUi, openEngraveLongMainUi | purchase: openEngraveBuyTipsUi | reward: checkLongRewardStatRed, getBigDrawData, getZhanLingAwardRed

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send30427 | 30427 | none | no | handler not in this controller |
| send30428 | 30428 | (1 arg) | no | handler not in this controller |
| send30429 | 30429 | (1 arg) | no | handler not in this controller |
| send30430 | 30430 | none | no | handler not in this controller |
| send32611 | 32611 | none | no | handler not in this controller |
| send32613 | 32613 | none | no | handler not in this controller |
| send32614 | 32614 | none | no | handler not in this controller |
| send32615 | 32615 | (2 arg) | no | handler not in this controller |
| send32616 | 32616 | none | no | handler not in this controller |

**getter** (6): getCurlModel getNextCostNum getBigDrawData getGameStepData getImageRandomId getPosRandomOffset

**other** (14): reqDataBeforeEnter beforeReq regNetLit onRedStatusChanged rv30427 rv30428 rv30429 rv30430 rv32611 rv32612 rv32613 rv32614 rv32615 rv32616

**update** (3): clearCtrlState initBeforeData setPerfectNum

**redDot** (6): registerRed checkLongRewardStatRed getZhanLingAwardRed getZhanLingTaskRed checkLongDailyRed setLongDailyRed

**predicate** (3): checkCityBtn checkIsEnoughByRecruit isAllProGiftGet

**ui** (9): openEngraveSelecUi openEngraveGiftUi openEngraveZhanlingUi openEngraveTaskUi openEngraveBuyTipsUi openEngraveResultUi openEngraveLongMainUi closeEngraveLongMainUi openEngraveLongAPUi
