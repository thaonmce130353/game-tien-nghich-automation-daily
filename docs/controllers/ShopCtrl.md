# ShopCtrl

Shops and item purchase.

- gInst: yes | methods: 62 (own 39) | send: 5 | flags: purchase
- own methods by kind: other 5, update 5, getter 10, ui 8, send 5, response 6
- name-flagged methods: purchase: clearAutoBuyingPos, clearAutoBuyingShopType, closeBchBuyUi, getAutoBuyState, getIsAutoBuyingShopType, openBchBuyUi, openQuickBuyView, openShopAutoBuyUi, quickBuy, setAutoBuyState, setAutoBuyingPos

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send12100 | 12100 | type | no | on12100: no notable effect |
| send12101 | 12101 | id, type, num, use_type | no | on12101: no notable effect |
| send12110 | 12110 | type | no | on12110: updates local state |
| send12111 | 12111 | type, pos, id | no | on12111: updates local state |
| send12112 | 12112 | type | no | on12112: no notable effect |

**other** (5): reqDataBeforeEnter regNetLit quickBuy automatedProcurementGoods onCrossSky

**update** (5): clearCtrlState setAutoBuyingPos clearAutoBuyingPos clearAutoBuyingShopType setAutoBuyState

**getter** (10): getCurlModel getShopIdByItemBid getCfgShopList getCfgShopListByTypeAndPage getCfgShopPageList getCfgShopPageList2 getGoodsDataById getLossConfig getIsAutoBuyingShopType getAutoBuyState

**ui** (8): openMarketUi openShopUi openShopExchangeTypeUi openShopAutoBuyUi openShopKfUi openBchBuyUi openQuickBuyView closeBchBuyUi
