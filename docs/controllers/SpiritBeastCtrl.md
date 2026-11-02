# SpiritBeastCtrl

Spirit beasts.

- gInst: yes | methods: 59 (own 36) | send: 4
- own methods by kind: other 11, redDot 6, send 4, getter 7, ui 7, update 1
- name-flagged methods: purchase: getGiftBuyCount, getZsGiftBuyData | reward: getGiftBuyCount, getZhanLingAwardRed

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send19528 | 19528 | (1 arg) | no | handler not in this controller |
| send19529 | 19529 | unique_id, times | no | handler not in this controller |
| send19530 | 19530 | unique_id | no | handler not in this controller |
| send19531 | 19531 | unique_id | no | handler not in this controller |

**other** (11): toRequestServerData reqDataBeforeEnter regNetLit rv19528 rv19529 rv19530 rv19531 cHPrevUi clsUpGiftUi onRedStatusChanged bInActTime

**redDot** (6): registerRed updateHallRed getZhanLingAwardRed getZhanLingTaskRed checkGoodGiftRed checkRecruitTenRed

**getter** (7): getZsGiftBuyData getGiftBuyCount getActInfo getActivityId getCfg getCloseTime getTrialGoodId

**ui** (7): openHall openPreview openUpGift openGoodGift openRank openZLTask closeTimeEvt

**update** (1): clearCtrlState
