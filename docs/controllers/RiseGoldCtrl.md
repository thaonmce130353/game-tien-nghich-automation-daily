# RiseGoldCtrl

Gold-gain boost event (guess).

- gInst: yes | methods: 95 (own 74) | send: 8
- own methods by kind: getter 13, update 3, other 21, redDot 12, send 8, ui 15, predicate 2
- name-flagged methods: reward: getZhanLingAwardRed

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send19435 | 19435 | none | yes | handler not in this controller |
| send19436 | 19436 | (2 arg) | yes | handler not in this controller |
| send19437 | 19437 | (1 arg) | yes | handler not in this controller |
| send19438 | 19438 | none | yes | handler not in this controller |
| send19439 | 19439 | (2 arg) | yes | handler not in this controller |
| send19440 | 19440 | (2 arg) | yes | handler not in this controller |
| send19441 | 19441 | (1 arg) | yes | handler not in this controller |
| send19442 | 19442 | (4 arg) | yes | handler not in this controller |

**getter** (13): getCurlModel getActInfo getRiteGiftStatus getRiteGiftChrGoods getRiteGiftChrDataById getTaskStatus getNowLayerGirdList getRspGridData getCurRandomResult getGirdDataBylayerIndex getCollectBoxArr getLotteryNumArr getLotteryEventIndex

**update** (3): initBeforeData clearCtrlState clearRemainTimer

**other** (21): beforeReq toRequestServerData reqDataBeforeEnter regNetLit rv19420 rv19421 rv19422 rv19435 rv19436 rv19437 rv19438 rv19439 rv19440 rv19441 rv19442 rv19443 rv17023 rv19444 onRedStatusChanged bInActTime addRemainTimer

**redDot** (12): registerRed updateRiseGoldHallRed getDicePackageRed getZhanLingAwardRed getRiseGoldTaskRed getRiteGiftRed getAccGiftRed getBoardTabRed getBoardDiceNumRed getBoardUniversalDiceRed getUpGoldBoxRed getSprShopRed

**ui** (15): openRiseGoldMainUi openRGDiceChsUI openRGSprBonusUI openRGSprBoxUI openRGSprLotteryUI openRGSprShopUI openRGUpGoldBoxUI openRGRiteGiftSelectUi openRiseGoldToolsGetUi closeRiseGoldMainUi closeRGRiteGiftSelectUi closeRGUpGoldBoxUi closeRGSprShopUi closeRGSprLotteryUi closeTimeEvt

**predicate** (2): checkGirdListExpired checkRewarNeedOpen
