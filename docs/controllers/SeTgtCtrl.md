# SeTgtCtrl

Unknown target/task system (guess).

- gInst: yes | methods: 57 (own 35) | send: 4
- own methods by kind: getter 5, update 4, other 7, ui 2, send 4, response 6, predicate 1, redDot 6
- name-flagged methods: reward: getGiftRed, getGiftVo

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send30901 | 30901 | type | no | scmd30901Handler: no notable effect |
| send30904 | 30904 | task_id | no | scmd30904Handler: shows server error |
| send30905 | 30905 | treasure_id | no | scmd30905Handler: shows server error |
| send30906 | 30906 | gift_id | no | scmd30906Handler: shows server error |

**getter** (5): getCurlModel getGiftVo getTaskVo getFinishNum getEndTime

**update** (4): initBeforeData clearCtrlState clearTypeTaskDic updateSevenTargetOpen

**other** (7): reqDataBeforeEnter reqActData regNetLit onCrossSky taskIsGet taskCanGet taskNoneGet

**ui** (2): openSevenTargetUi openTarAwaPreUi

**predicate** (1): isBoxHadGet

**redDot** (6): getSevenTargetRed getTypeRed getDayRed getOneBoxRed getTaskRed getGiftRed
