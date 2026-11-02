# ExtremeYinCtrl

Cực Âm Địa dungeon.

- gInst: yes | methods: 77 (own 56) | send: 10
- own methods by kind: getter 12, update 3, other 28, redDot 1, send 10, ui 2
- name-flagged methods: purchase: getBuyCount, getPlayerBuyNum, toBuyHandler

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send32200 | 32200 | none | no | handler not in this controller |
| send32201 | 32201 | none | no | handler not in this controller |
| send32202 | 32202 | (1 arg) | no | handler not in this controller |
| send32203 | 32203 | (2 arg) | no | handler not in this controller |
| send32204 | 32204 | (1 arg) | no | handler not in this controller |
| send32205 | 32205 | (2 arg) | no | handler not in this controller |
| send32206 | 32206 | (2 arg) | no | handler not in this controller |
| send32207 | 32207 | none | no | handler not in this controller |
| send32208 | 32208 | (1 arg) | no | handler not in this controller |
| send32209 | 32209 | (2 arg) | no | handler not in this controller |

**getter** (12): getCurlModel getLandInfo getLandId getPlayerData getPlunderRecord getPlayerRobNum getPlayerBuyNum getAutoOpenRecordState getChallengeUnitId getWanFaStr getFreeCount getBuyCount

**update** (3): initBeforeData clearCtrlState clearLimitTime

**other** (28): beforeReq toRequestServerData reqDataBeforeEnter regNetLit rv32200 rv32201 rv32202 rv32203 rv32204 rv32205 rv32206 rv32207 rv32208 rv32209 rv32299 bEnterLand bHaveSeat opJYZDUi opJYZDRecordUi opJYZDBuildUi chanllenge saveAutoOpenRecord plunder lookExercise dealFightLogic toRefreshMainInfo toBuyHandler timerLimitFunc

**redDot** (1): registerRed

**ui** (2): openEmBattle clickAddHanlder
