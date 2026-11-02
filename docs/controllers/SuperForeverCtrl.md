# SuperForeverCtrl

Super "forever" lifetime offer (guess).

- gInst: yes | methods: 48 (own 27) | send: 4
- own methods by kind: getter 5, update 2, other 8, redDot 3, send 4, ui 5
- name-flagged methods: purchase: getGiftBuyCount | reward: getGiftBuyCount

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send19625 | 19625 | type | no | handler not in this controller |
| send19626 | 19626 | type, times | no | handler not in this controller |
| send19627 | 19627 | type, optional_id | no | handler not in this controller |
| send19628 | 19628 | type | no | handler not in this controller |

**getter** (5): getCurlModel getRecruitRspData getHeroConfigByPoolId getPoolConfigPoolId getGiftBuyCount

**update** (2): clearCtrlState initBeforeData

**other** (8): reqDataBeforeEnter toRequestServerData regNetLit rv19625 rv19626 rv19627 rv19628 onRedStatusChanged

**redDot** (3): registerRed checkRecruitTenRed checkGoodGiftRed

**ui** (5): openSuperForeverHall openSuperForeverGoodGift openSuperForeverRecSelectUi openPreViewHero openDetailsHero
