# SuperHeroCtrl

Super heroes.

- gInst: yes | methods: 82 (own 59) | send: 9
- own methods by kind: getter 11, other 25, redDot 8, update 1, send 9, ui 4, predicate 1
- name-flagged methods: purchase: getGiftBuyCount, getZsGiftBuyData, openZhanLingScoreBuyUi | reward: getGiftBuyCount, getZhanLingAwardRed, isGetFightReward

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send19390 | 19390 | (1 arg) | no | handler not in this controller |
| send19391 | 19391 | unique_id, times | no | handler not in this controller |
| send19392 | 19392 | unique_id | no | handler not in this controller |
| send19393 | 19393 | unique_id | no | handler not in this controller |
| send19394 | 19394 | unique_id | no | handler not in this controller |
| send19395 | 19395 | unique_id | no | handler not in this controller |
| send19396 | 19396 | unique_id | no | handler not in this controller |
| send19398 | 19398 | none | no | handler not in this controller |
| send19399 | 19399 | reward_id | no | handler not in this controller |

**getter** (11): getCurlModel getZsGiftBuyData getCloseTime getActivityId getCfg getUpRecruitRankCond getGiftBuyCount getTrialGoodId getStrictTopThree getOhterRank getSoulLvGiftStatus

**other** (25): toRequestServerData regNetLit rv19390 rv19391 rv19392 rv19393 rv19394 rv19395 rv19396 onRedStatusChanged bInActTime opRecruitRankUi opHarmRankUi opFightRecordUi opChallengGainUi opTryUi opGoodGiftUi opGotoGetUi opUpGiftUi clsUpGiftUi calculateMaxDamages preViewHero lookFightVd rv19398 rv19399

**redDot** (8): registerRed updateSuperHeroHallRed getZhanLingAwardRed getZhanLingTaskRed checkGoodGiftRed checkFightRed checkRecruitTenRed checkSoulLvRed

**update** (1): clearCtrlState

**ui** (4): openSuperHeroHall closeTimeEvt openZhanLingTask openZhanLingScoreBuyUi

**predicate** (1): isGetFightReward
