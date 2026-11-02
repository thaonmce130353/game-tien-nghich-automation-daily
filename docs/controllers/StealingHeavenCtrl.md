# StealingHeavenCtrl

Stealing Heaven feature.

- gInst: yes | methods: 50 (own 28) | send: 1
- own methods by kind: getter 4, other 6, redDot 5, update 2, predicate 6, send 1, ui 4
- name-flagged methods: purchase: getGiftBuyTimes, isGiftCanBuy | reward: getGiftBuyTimes

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send12327 | 12327 | none | no | handler not in this controller |

**getter** (4): getCurlModel getShowEffectCb getGiftBuyTimes getDirectionByIndex

**other** (6): toRequestServerData regNetLit rv12327 onRedStatusChanged bSellOutState swapPairsByIndex

**redDot** (5): registerRed updateStealingHeavenRed checkCityBtnRed checkDailyRed setDailyRed

**update** (2): initBeforeData clearCtrlState

**predicate** (6): checkFunOpen checkCityBtn checkIsSellAll isGiftCanBuy checkFirstPopWin checkClosePopWin

**ui** (4): openStealingHeavenUi closeStealingHeavenUi openStealingHeavenUi2 closeStealingHeavenUi2
