# HalfYearCtrl

Half-year anniversary event.

- gInst: yes | methods: 109 (own 89) | send: 17 | flags: reward
- own methods by kind: getter 11, other 24, update 6, redDot 10, send 17, predicate 6, ui 15
- name-flagged methods: reward: checkTurntableRewardRed, getZhanLingAwardRed, open2048AwardUi

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send19555 | 19555 | none | no | handler not in this controller |
| send19556 | 19556 | none | no | handler not in this controller |
| send19557 | 19557 | now_question_id, answer_content | no | handler not in this controller |
| send19558 | 19558 | digit | no | handler not in this controller |
| send19559 | 19559 | none | no | handler not in this controller |
| send19560 | 19560 | none | no | handler not in this controller |
| send19561 | 19561 | direction | no | handler not in this controller |
| send19562 | 19562 | none | no | handler not in this controller |
| send19563 | 19563 | page, num | no | handler not in this controller |
| send19564 | 19564 | none | no | handler not in this controller |
| send19565 | 19565 | role_id | no | handler not in this controller |
| send19566 | 19566 | none | no | handler not in this controller |
| send19567 | 19567 | none | no | handler not in this controller |
| send19568 | 19568 | none | no | handler not in this controller |
| send19570 | 19570 | none | no | handler not in this controller |
| send19571 | 19571 | count | no | handler not in this controller |
| send19572 | 19572 | none | no | handler not in this controller |

**getter** (11): getCurlModel getAnswerData getBlessingData getGame2048InfoVo getTurntableProgressConfig getNowDarwLayer getLastDarwItems getCompassCostVo getActInfo getGroupAndIndex getIdByLayerIndex

**other** (24): toRequestServerData reqDataBeforeEnter finishAutoConnect beforeReq regNetLit rv19555 rv19556 rv19557 rv19558 rv19563 rv19559 rv19560 rv19561 rv19562 rv19564 rv19565 rv19566 rv19569 rv19567 rv19568 rv19570 rv19571 rv19572 bInActTime

**update** (6): clearCtrlState initBeforeData setGame2048RollStatus set2048ReqStatus setGame2048OperateStatus setGame2048StartStatus

**redDot** (10): registerRed isShow2048Red checkTurntableNumRed checkTurntableRewardRed getProcureFreeRed checkAccGiftRed checkLottreyStatRed getZhanLingAwardRed getZhanLingTaskRed isBlessingRed

**predicate** (6): isGame2048Rolling isGame2048Reqing isGame2048HadOperate isGame2048Start checkCityBtn checkOpen

**ui** (15): closeTimeEvt openMainUi open2048Ui open2048Rank open2048AwardUi openHalfYearAnswerUi openHalfYearAnswerRwPreviewUi openHalfYearQuestionUi openBlessingUi openHalfYearProcureUi openHalfYearAccUi openHalfYearTurntableUi openHalfYearExShopUi openHalfYearLotteryStatUi openHalfYearZhanlingUi
