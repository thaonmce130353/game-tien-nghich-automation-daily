# GldWrCtrl

Guild war.

- gInst: yes | methods: 75 (own 51) | send: 11
- own methods by kind: other 7, update 7, send 11, response 11, predicate 1, ui 11, getter 3
- name-flagged methods: reward: clearAward, showAward

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send18125 | 18125 | none | no | handler not in this controller |
| send18126 | 18126 | none | no | handler not in this controller |
| send18127 | 18127 | city_id | yes | handler not in this controller |
| send18128 | 18128 | city_id | yes | handler not in this controller |
| send18129 | 18129 | none | yes | handler not in this controller |
| send18130 | 18130 | none | yes | handler not in this controller |
| send18131 | 18131 | none | no | handler not in this controller |
| send18132 | 18132 | pos | no | handler not in this controller |
| send18133 | 18133 | city_id | no | handler not in this controller |
| send18134 | 18134 | none | no | handler not in this controller |
| send18135 | 18135 | none | no | handler not in this controller |

**other** (7): reqDataBeforeEnter regNetLit exeGldWrUi jumpKfMain exeCtInfo chanllenge chanllegeHdr

**update** (7): clearCtrlState setGldwrIcon resetStatus setKfAwrd setIsCity clearRankDt clearAward

**predicate** (1): isKf

**ui** (11): showMainUi closeMainUi showCtInfo closeCtInfo showFightUi showARank showAward showAwKf showHelp0 showHelp1 showHelp2

**getter** (3): getChallengeUnitId getWrBaseDt getCityDt
