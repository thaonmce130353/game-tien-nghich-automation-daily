# XunBCtrl

Treasure hunt (guess).

- gInst: yes | methods: 48 (own 26) | send: 4
- own methods by kind: getter 5, other 8, update 3, redDot 1, ui 4, send 4, predicate 1
- name-flagged methods: reward: showReward

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send30601 | 30601 | none | no | handler not in this controller |
| send30602 | 30602 | type, num_type | no | handler not in this controller |
| send30603 | 30603 | luck_id | no | handler not in this controller |
| send30604 | 30604 | type | no | handler not in this controller |

**getter** (5): getCurlModel getTreCfg getLkCfg getProList getRedState

**other** (8): reqDataBeforeEnter regNetLit exeTsMain startTreasure sd30601Hdr sd30602Hdr sd30603Hdr sd30604Hdr

**update** (3): clearCtrlState uptTreaInfo upDayNums

**redDot** (1): registerRed

**ui** (4): showTreasureView showProUi openShopUi showReward

**predicate** (1): checkCost
