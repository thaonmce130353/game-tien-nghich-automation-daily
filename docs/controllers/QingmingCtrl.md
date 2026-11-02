# QingmingCtrl

Qingming festival event.

- gInst: yes | methods: 80 (own 58) | send: 13
- own methods by kind: getter 6, redDot 10, other 16, update 1, send 13, response 4, ui 8
- name-flagged methods: gm: closeAllQingmingUi, openQingmingAnswerRwPreviewUi, openQingmingAnswerUi, openQingmingMainUI, openQingmingQuestionUi, openQingmingShareView | reward: checkTranGodRewardRed

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send19629 | 19629 | (1 arg) | no | handler not in this controller |
| send19630 | 19630 | channel, buy_gift_rebate_uid | no | handler not in this controller |
| send19631 | 19631 | buy_gift_rebate_uid | yes | handler not in this controller |
| send19632 | 19632 | buy_gift_rebate_uid | yes | handler not in this controller |
| send19633 | 19633 | buy_gift_rebate_uid, reward_bid | no | handler not in this controller |
| send19635 | 19635 | none | no | scmd19635Handler: updates local state |
| send19636 | 19636 | (1 arg) | no | scmd19636Handler: no notable effect |
| send19637 | 19637 | none | no | handler not in this controller |
| send19638 | 19638 | none | no | handler not in this controller |
| send19639 | 19639 | now_question_id, answer_content | no | handler not in this controller |
| send19640 | 19640 | digit | no | handler not in this controller |
| send19641 | 19641 | none | no | scmd19641Handler: updates local state |
| send19642 | 19642 | none | no | scmd19642Handler: no notable effect |

**getter** (6): getCurlModel getShareData getAnswerData getBlessingData getDailyLoginDayState getCurDayNum

**redDot** (10): registerRed checkGoodGiftRed checkAccGiftRed checkTranGodRewardRed checkTranGodTaskRed checkDiscOneNumRed checkDiscTenNumRed checkDailySignRed checkShareRed checkShareFirstRed

**other** (16): reqDataBeforeEnter regNetLit sendInfo rv19629 rv19630 rv19631 rv19632 rv19634 rv19633 rv19637 rv19638 rv19639 rv19640 bInActTime bInSubActTime onRedStatusChanged

**update** (1): clearCtrlState

**ui** (8): openQingmingMainUI openQingmingShareView openQingmingQuestionUi openQingmingAnswerRwPreviewUi openQingmingAnswerUi openActSubView closeTimeEvt closeAllQingmingUi
