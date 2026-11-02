# NewSpiritBeastCtrl

Revised spirit beast system.

- gInst: yes | methods: 60 (own 37) | send: 3
- own methods by kind: getter 9, other 10, redDot 5, send 3, ui 8, update 1, predicate 1
- name-flagged methods: reward: getZhanLingAwardRed

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send19587 | 19587 | (1 arg) | no | handler not in this controller |
| send19588 | 19588 | unique_id, times | no | handler not in this controller |
| send19589 | 19589 | optional_id | no | handler not in this controller |

**getter** (9): getCurlModel getActInfo getUniqueId getActId getCfg getCloseTime getTrialGoodId getOpBaseDt getOpShowSpirutBestId

**other** (10): toRequestServerData reqDataBeforeEnter regNetLit rv19587 rv19588 rv19589 clsUpGiftUi cHPrevUi onRedStatusChanged bInActTime

**redDot** (5): registerRed getZhanLingAwardRed getZhanLingTaskRed checkRecruitTenRed checkGoodGiftRed

**ui** (8): openHall openUpGift openGoodGift openRank openZLTask openRecSelectUi openPreview closeTimeEvt

**update** (1): updateZGIcon

**predicate** (1): hasNewSpiritBeastAct
