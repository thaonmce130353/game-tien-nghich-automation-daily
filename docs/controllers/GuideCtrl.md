# GuideCtrl

Tutorial guide.

- gInst: yes | methods: 71 (own 49) | send: 3
- own methods by kind: getter 6, other 21, update 3, response 4, ui 10, predicate 2, send 3
- name-flagged methods: reward: getLevUpRewardData, guideGetAwardUiHandler

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send11201 | 11201 | none | yes | scmd11201Handler: no notable effect |
| send11202 | 11202 | id | no | scmd11202Handler: no notable effect |
| send12071 | 12071 | name, sex | no | scmd12071Handler: shows server error |

**getter** (6): getCurlModel getLevUpRewardData getRoleLevUpData getTarget getCrtGuideStepData getCacheLevObj

**other** (21): reqDataBeforeEnter finishAutoConnect regNetLit finishOpenRoleLevUi handleAfterCreateRole register fightEndHandler starGuide specialHandling nextStep skipGuide markFinish onStepFinish onGuideFinish uninstall pause resume guideGetAwardUiHandler guideRecruitEffectUiHandler testFun testSkipCrtGuide

**update** (3): clearCtrlState clearGuide setUp

**ui** (10): openGuideRoleLevUi closeGuideRoleLevUi openGuideStoryUi closeGuideStoryUi openGuideNameUi closeGuideNameUi openGuideUi closeGuideUi clickGuideStep closeCampHd

**predicate** (2): checkName checkCrtGuideRuKouUiName
