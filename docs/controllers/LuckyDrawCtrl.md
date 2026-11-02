# LuckyDrawCtrl

Lottery draw.

- gInst: yes | methods: 36 (own 12) | send: 1 | flags: purchase
- own methods by kind: getter 1, redDot 3, other 5, send 1, predicate 1, ui 1

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send19645 | 19645 | none | no | handler not in this controller |

**getter** (1): getCurlModel

**redDot** (3): registerRed checkBagCostRed checkTaskRed

**other** (5): regNetLit sendInfo rv19645 bInActTime onRedStatusChanged

**predicate** (1): checkRedUpdata

**ui** (1): openLuckyTaskUi
