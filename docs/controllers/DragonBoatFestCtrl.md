# DragonBoatFestCtrl

Dragon Boat festival event, second variant.

- gInst: yes | methods: 66 (own 44) | send: 8
- own methods by kind: getter 5, redDot 8, other 10, update 1, send 8, response 4, ui 8
- name-flagged methods: reward: checkTranGodRewardRed

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send19718 | 19718 | none | no | scmd19718Handler: updates local state |
| send19719 | 19719 | (1 arg) | no | scmd19719Handler: no notable effect |
| send19720 | 19720 | none | no | handler not in this controller |
| send19721 | 19721 | none | no | handler not in this controller |
| send19722 | 19722 | now_question_id, answer_content | no | handler not in this controller |
| send19723 | 19723 | digit | no | handler not in this controller |
| send19724 | 19724 | none | no | scmd19724Handler: updates local state |
| send19725 | 19725 | none | no | scmd19725Handler: no notable effect |

**getter** (5): getCurlModel getAnswerData getBlessingData getDailyLoginDayState getCurDayNum

**redDot** (8): registerRed checkGoodGiftRed checkAccGiftRed checkTranGodRewardRed checkTranGodTaskRed checkDiscOneNumRed checkDiscTenNumRed checkDailySignRed

**other** (10): reqDataBeforeEnter regNetLit sendInfo rv19720 rv19721 rv19722 rv19723 bInActTime bInSubActTime onRedStatusChanged

**update** (1): clearCtrlState

**ui** (8): openDragonBoatFestMainUI openDragonBoatFestShareView openDragonBoatFestQuestionUi openDragonBoatFestAnswerRwPreviewUi openDragonBoatFestAnswerUi openActSubView closeTimeEvt closeAllDragonBoatFestUi
