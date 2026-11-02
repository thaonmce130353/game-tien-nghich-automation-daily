# ItemColorStoneCtrl

Colour stones / gem items (guess).

- gInst: yes | methods: 38 (own 15) | send: 2
- own methods by kind: getter 2, redDot 1, update 1, other 6, send 2, predicate 1, ui 2
- name-flagged methods: reward: getRewardList, openItemColorStoneRewardUi

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send17064 | 17064 | item_id | no | handler not in this controller |
| send17066 | 17066 | init_item_bid | no | handler not in this controller |

**getter** (2): getCurlModel getRewardList

**redDot** (1): registerRed

**update** (1): initBeforeData

**other** (6): beforeReq regNetLit rv17063 rv17064 rv17065 rv17066

**predicate** (1): isItemSlotStone

**ui** (2): openItemColoStoneUi openItemColorStoneRewardUi
