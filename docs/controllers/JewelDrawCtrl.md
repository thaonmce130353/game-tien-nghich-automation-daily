# JewelDrawCtrl

Jewel gacha draw.

- gInst: yes | methods: 39 (own 15) | send: 2 | flags: purchase
- own methods by kind: getter 1, redDot 3, other 6, send 2, ui 3
- name-flagged methods: reward: openJewelDrawExShopUi, openJewelDrawUi

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send19667 | 19667 | none | no | handler not in this controller |
| send19668 | 19668 | (1 arg) | no | handler not in this controller |

**getter** (1): getCurlModel

**redDot** (3): registerRed checkInsCostRed checkOutCostRed

**other** (6): regNetLit sendInfo rv19667 rv19668 bInActTime onRedStatusChanged

**ui** (3): openJewelDrawUi openJewelDrawExShopUi closeTimeEvt
