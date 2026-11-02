# AdCtrl

Advertisement / video-ad reward flow (guess).

- gInst: yes | methods: 43 (own 20) | send: 1
- own methods by kind: getter 4, other 6, update 3, send 1, predicate 4, ui 2
- name-flagged methods: purchase: isBuyWelfare, isCanBuyGift | reward: getAdAwardByType, getAdAwardMaxCountByType

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send19453 | 19453 | iaa_type | no | handler not in this controller |

**getter** (4): getCurlModel getAdAwardByType getAdAwardMaxCountByType getWatchAdsMaxNum

**other** (6): regNetLit syncCrossDay rv19451 rv19452 rv19453 rv19454

**update** (3): initBeforeData clearCtrlState updateRoleData

**predicate** (4): checkFuncOpen isCanBuyGift isBuyWelfare isHaveInfo

**ui** (2): openRandomGiftUi closeRandomGiftUi
