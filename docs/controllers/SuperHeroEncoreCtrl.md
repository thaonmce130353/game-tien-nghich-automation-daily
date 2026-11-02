# SuperHeroEncoreCtrl

Super hero re-run event.

- gInst: yes | methods: 96 (own 74) | send: 7
- own methods by kind: getter 14, update 6, redDot 9, other 30, predicate 3, send 7, ui 5
- name-flagged methods: purchase: getGiftBuyCount, getZsGiftBuyData, openZhanLingScoreBuyUi | reward: checkZhanlingAwardRed, getGiftBuyCount, getGiftUniqueId, isGetFightReward

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send19737 | - | (1 arg) | no | - |
| send19738 | - | (2 arg) | no | - |
| send19739 | - | (1 arg) | no | - |
| send19740 | - | (1 arg) | no | - |
| send19741 | - | (1 arg) | no | - |
| send19742 | - | (1 arg) | no | - |
| send19743 | - | (1 arg) | no | - |

**getter** (14): getCurlModel getActivityId getCfg getCloseTime getEndTime getGiftBuyCount getZsGiftBuyData getUpRecruitRankCond getFightUniqueId getFightCfg getGiftUniqueId getStrictTopThree getOhterRank getChallengeUnitId

**update** (6): clearCtrlState updateActivityBtn updateGiftActivityBtn clearFightUniqueId clearGotoGetQueue clearPreview

**redDot** (9): registerRed registerActivityRed unregisterAllRed checkGiftRed checkRecruitTenRed checkFightRed checkZhanlingAwardRed checkZhanlingTaskRed checkSoulRed

**other** (30): regNetLit reqDataBeforeEnter send resolveUniqueId rv19737 rv19738 rv19739 rv19740 rv19741 rv19742 rv19743 onActivityClose onActivityUpdate onRedStatusChanged selectActivity lookFightVd jumpByType jumpByGetWay opGoodGiftUi opTryUi opRecruitRankUi opHarmRankUi opFightRecordUi opChallengGainUi opGotoGetUi onGotoGetUiClosed opUpGiftUi preViewHero restorePreviewView goToChallenge

**predicate** (3): checkActivity isActivityOpen isGetFightReward

**ui** (5): openFightEmbattle openHall showNextGotoGetUi openCurrentActivityView openZhanLingScoreBuyUi
