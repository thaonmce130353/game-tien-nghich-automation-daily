# BackpackCtrl

Inventory: items, usage, selling.

- gInst: yes | methods: 141 (own 119) | send: 6
- own methods by kind: other 35, update 5, redDot 3, getter 20, ui 37, response 13, send 6
- name-flagged methods: reward: clearFightReward, closeGetAwardUi, getRealFightReward, openRewardUi, openRewardUi2, showAdventureReward, showArrowEndReward, showCombEndReward, showFightEndReward, showGenerEffectEndReward, showHeroResolveReward, showMidAutumnEndReward, showSdgcEndReward, showTreasureEndReward

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send17000Msg | 17000 | storagetype | no | scmd17000: updates local state |
| send17037 | 17037 | id, select_id, num | no | scmd17037: no notable effect |
| send17051 | 17051 | list | no | scmd17051: no notable effect |
| send17055 | 17055 | pieces_bid, num | no | scmd17055: shows server error |
| send17057 | 17057 | pieces_bid | no | scmd17057: shows server error |
| send17059 | 17059 | wood_carving_id, num | no | scmd17059: shows server error |

**other** (35): reqDataBeforeEnter regNetLit exeGiftSelectUi delayUpdateRedTiShi GetItemById GetGodAnimalById udBGoods useGoods exeGiftSJUi sellItemFun sendSellGoods exeBagSysUi sBagDbTips cBagDbTips sDbCompUi cDbCompUi udBagIView selectBagType compare opYsBkUi cYsBkUi sortFun opSellSilk cSilkColor sChange cSSelect onQxBtn onAllBtn udSSilkDt sd17056 rv17056 opHrsTips opHrsRsv opHrsBk bLink

**update** (5): clearCtrlState updateRedTiShi clearFightReward clearEndFRw setAttrList

**redDot** (3): registerRed updateWoodCarveRed getBagRed

**getter** (20): getIGiftData getGodWeaponById getGodWeaponDic getSellGoodsByType getRealFightReward gEndFightRw gHeroComb getCurlModel getGoodsByType gBagData gGodData gEqDList gItemData gSbStrengLev getSealStrengLev getSealRefineLev getExattrVByK gListByEqSort gListByDbSort gYsBkDt

**ui** (37): openGSUi closeGiftSelectUi openSSUi closeSSUi openSAlertUi closeSAlertUi clickSEquipOk openItemTipsUi showItemTips showAllTips closeNormalTips openBagGetWayTips closeBagGetWayTips showBatchUseUi closeBatchUseUi openGiftSJSUi closeGiftSJUi openSellGoodsUi closeSellGoodsUi showAdventureReward showFightEndReward showCombEndReward showTreasureEndReward showArrowEndReward showSdgcEndReward showMidAutumnEndReward showDiceRw showHeroResolveReward showGenerEffectEndReward showAwGUi closeGetAwardUi openBagSys showFtips closeSellSilk clickSSilkOk openRewardUi openRewardUi2
