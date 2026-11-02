# PropitiousActivityCtrl

"Propitious" lucky-themed event.

- gInst: yes | methods: 50 (own 27) | send: 7 | flags: reward
- own methods by kind: getter 1, other 3, update 1, ui 7, send 7, response 8
- name-flagged methods: purchase: openShopBatchBuyView | reward: openPropitiousActivityLevelAwardUi, openPropitiousActivityRankAwardUi

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send19060 | 19060 | none | no | on19060: updates local state |
| send19062 | 19062 | type, num | no | on19062: shows server error; updates local state |
| send19063 | 19063 | none | no | on19063: updates local state |
| send19064 | 19064 | none | no | on19064: shows server error; updates local state |
| send19065 | 19065 | lev | no | on19065: shows server error; updates local state |
| send19066 | 19066 | activity_id | no | on19066: updates local state |
| send19067 | 19067 | shop_id, num | no | on19067: shows server error; updates local state |

**getter** (1): getCurlModel

**other** (3): reqDataBeforeEnter regNetLit selectTab

**update** (1): clearCtrlState

**ui** (7): openPropitiousActivityUi openPropitiousActivityLevelAwardUi openPropitiousActivityShopMainUi openPropitiousActivityLuckyBagUi closePropitiousActivityLuckyBagUi openShopBatchBuyView openPropitiousActivityRankAwardUi
