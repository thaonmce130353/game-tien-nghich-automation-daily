# AcvCtrl

Achievements and daily activity tasks, including the activity-point chests.

- gInst: yes | methods: 113 (own 89) | send: 13 | flags: reward
- own methods by kind: update 8, other 9, ui 12, redDot 8, getter 20, send 13, response 19
- name-flagged methods: gm: gMthCfgByIdNTId, gMthSLItem | purchase: clkZLAdvBuy, openZLBuyLv | reward: getTaskPrvAwardList, openRwdPrv, openTabRwdPrvUi

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send12501 | 12501 | none | no | scmd12501: updates local state |
| send12503 | 12503 | id | no | scmd12503: shows server error |
| send19121 | 19121 | none | no | scmd19121: updates local state |
| send19122 | 19122 | none | no | scmd19122: updates local state |
| send19126 | 19126 | num | no | scmd19126: shows server error |
| send19127 | 19127 | none | no | scmd19127: shows server error |
| send19128 | 19128 | none | no | scmd19128: shows server error |
| send19129 | 19129 | lev | no | scmd19129: shows server error |
| send19130 | 19130 | id | no | scmd19130: shows server error |
| send19131 | 19131 | id | no | scmd19131: shows server error |
| send30501 | 30501 | none | no | scmd30501: updates local state; opens UI |
| send30503 | 30503 | task_id | no | scmd30503: shows server error |
| send30504 | 30504 | index | no | scmd30504: shows server error |

**update** (8): upAcvPage upTskPage upTskPrgs upTskAwrdSt upTskLs clearCtrlState upRoleAttr upRoleDt

**other** (9): jumpToFunc exeAcvAct taskGoFunc tipsJumpAct reqDataBeforeEnter sendMsg regNetLit exeZlAdv chkHelpHdr

**ui** (12): openHeroMain openAcvAct showActTips closeActTips openTaskPrv openRwdPrv openTabRwdPrvUi openTaskPrv2 clkTaskBox openZLBuyLv openZLAdv clkZLAdvBuy

**redDot** (8): updateTaskViewRed upTskPageRed upTaskMainRed upPageRed upActIcRed chkZLRed chkZLLaRed chkZLTskRed

**getter** (20): gHvGainTsk gHvTskAwrd gHvGain gHvGainAct getTaskPrvAwardList gSLTskByBType gLvCfgByIdNLv gWeekCfgByIdNTId gMthCfgByIdNTId gLvAwrdLs gZLLvCfgById gGotLvAwrd gLvAwrdItem gWeekSLItem gMthSLItem gGoodLsByClvNLv gZLInfoDt gActInfoDt gPreview gZlRes
