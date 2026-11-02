# NewSuperHeroCtrl

Revised super hero system.

- gInst: yes | methods: 78 (own 56) | send: 8
- own methods by kind: getter 10, other 24, redDot 8, update 1, send 8, ui 4, predicate 1
- name-flagged methods: purchase: getGiftBuyCount, getZsGiftBuyData, openZhanLingScoreBuyUi | reward: getGiftBuyCount, getZhanLingAwardRed, isGetFightReward

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send19398 | 19398 | none | no | handler not in this controller |
| send19455 | 19455 | (1 arg) | no | handler not in this controller |
| send19456 | 19456 | unique_id, times | no | handler not in this controller |
| send19457 | 19457 | unique_id | no | handler not in this controller |
| send19458 | 19458 | unique_id | no | handler not in this controller |
| send19459 | 19459 | unique_id | no | handler not in this controller |
| send19460 | 19460 | unique_id | no | handler not in this controller |
| send19461 | 19461 | unique_id | no | handler not in this controller |

**getter** (10): getCurlModel getZsGiftBuyData getCloseTime getActivityId getCfg getUpRecruitRankCond getGiftBuyCount getTrialGoodId getStrictTopThree getOhterRank

**other** (24): toRequestServerData reqDataBeforeEnter regNetLit rv19455 rv19456 rv19457 rv19458 rv19459 rv19460 rv19461 onRedStatusChanged bInActTime opRecruitRankUi opHarmRankUi opFightRecordUi opChallengGainUi opTryUi opGoodGiftUi opGotoGetUi opUpGiftUi clsUpGiftUi calculateMaxDamages preViewHero lookFightVd

**redDot** (8): registerRed updateSuperHeroHallRed getZhanLingAwardRed getZhanLingTaskRed checkGoodGiftRed checkFightRed checkRecruitTenRed checkSoulLvRed

**update** (1): clearCtrlState

**ui** (4): openSuperHeroHall closeTimeEvt openZhanLingTask openZhanLingScoreBuyUi

**predicate** (1): isGetFightReward
