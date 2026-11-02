# GnrlCtrl

Generals / heroes (guess).

- gInst: yes | methods: 59 (own 34) | send: 5
- own methods by kind: update 2, other 3, ui 12, predicate 1, getter 6, send 5, response 5

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send30301 | 30301 | realm_id, count | no | handler not in this controller |
| send30302 | 30302 | none | no | handler not in this controller |
| send30303 | 30303 | id | no | handler not in this controller |
| send30304 | 30304 | id | no | handler not in this controller |
| send30305 | 30305 | id | no | handler not in this controller |

**update** (2): clearCtrlState upDayNums

**other** (3): regNetLit exeMainUi exeHeroTips

**ui** (12): openProUi closeProUi openMainUi closeMainUi openShopUi openShopTip closeShopTip clickAgain openHeroTips clkShopItem clkHelp clickHeroItem

**predicate** (1): isEnoughRealmRecruit

**getter** (6): getIHeroTipsDt getTipsNetDt getHDt getHeroDataByRealm getShopData getShopDtByRlm
