# WoodCarveCtrl

Wood carving mini-game.

- gInst: yes | methods: 73 (own 51) | send: 11
- own methods by kind: getter 6, update 3, redDot 6, other 14, send 11, predicate 1, ui 10

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send17061 | 17061 | wood_soul_id, num | no | handler not in this controller |
| send17062 | 17062 | type | no | handler not in this controller |
| send32600 | 32600 | none | no | handler not in this controller |
| send32601 | 32601 | wood_carving_id | no | handler not in this controller |
| send32602 | 32602 | wood_carving_id | no | handler not in this controller |
| send32603 | 32603 | wood_carving_id | no | handler not in this controller |
| send32604 | 32604 | wood_carving_id | no | handler not in this controller |
| send32605 | 32605 | hero_id, wood_carving_id, hero_id_list | no | handler not in this controller |
| send32606 | 32606 | wood_carving_id, wood_soul_id | no | handler not in this controller |
| send32607 | 32607 | wood_carving_id, wood_soul_id | no | handler not in this controller |
| send32608 | 32608 | wood_carving_id | no | handler not in this controller |

**getter** (6): getCurlModel getActivityWoodCarveList getInfoList getInfoByBaseId getCanBattleHeroList getAlreadyActivityAndTotal

**update** (3): clearCtrlState initBeforeData initData

**redDot** (6): registerRed woodCarveInfoRed woodCarveBattleRed woodCarveInlayRed woodCarveBookRed woodSpiritCompbRed

**other** (14): sendEvt regNetLit rv32600 rv32601 rv32602 rv32603 rv32604 rv32605 rv32606 rv32607 rv32608 rv17061 rv17062 haveCanSynthesisWoodSpiritByType

**predicate** (1): isCanOneKeyBattleWoodSpirit

**ui** (10): openMainHallUi openDevelopUi openAttrTipsUi openSelectHeroUi openSkillTipsUi openSynthesisUi openUpStarSuccessUi openWoodCarveInlaySpiritTipsUi openAwakeSuccessUi openAwakeAttTalentsUi
