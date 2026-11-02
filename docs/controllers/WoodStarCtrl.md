# WoodStarCtrl

Wood star event.

- gInst: yes | methods: 44 (own 22) | send: 2
- own methods by kind: getter 6, redDot 3, other 7, update 1, send 2, predicate 1, ui 2

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send32617 | 32617 | none | no | handler not in this controller |
| send32619 | 32619 | unique_id, cfg_uid | no | handler not in this controller |

**getter** (6): getCurlModel getSoulLvGiftStatus getStarValueByWoodId getCloseTime getCfg getActivityId

**redDot** (3): registerRed updateWoodStarHallRed checkSoulLvRed

**other** (7): reqDataBeforeEnter regNetLit rv32617 rv32618 rv32619 onRedStatusChanged bInActTime

**update** (1): clearCtrlState

**predicate** (1): checkCityBtn

**ui** (2): closeTimeEvt openWoodStarHall
