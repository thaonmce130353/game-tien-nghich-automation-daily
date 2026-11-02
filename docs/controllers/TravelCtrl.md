# TravelCtrl

Travel / exploration.

- gInst: yes | methods: 53 (own 30) | send: 5
- own methods by kind: other 2, update 3, getter 10, ui 2, predicate 2, send 5, response 6

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send30201 | 30201 | none | no | scmd30201Handler: updates local state |
| send30202 | 30202 | id, hero_id_list | no | on30202: shows server error; updates local state; re-requests send30201; opens UI |
| send30203 | 30203 | id | no | on30203: shows server error; updates local state; re-requests send30201 |
| send30204 | 30204 | none | no | on30204: shows server error; re-requests send30201 |
| send30205 | 30205 | none | no | on30205: shows server error; re-requests send30201 |

**other** (2): reqDataBeforeEnter regNetLit

**update** (3): clearCtrlState updateRoleHandler updateAttr

**getter** (10): getIsActivityOpen getCostByTime getRareConfigById getEventConfigByBaseId getConditionConfigById getCurMaxTravelVal getCurlModel getIsHeroCarryOut getHeroList getMinTraveValue

**ui** (2): openTravelViewWithOut clickHeroItem

**predicate** (2): cancelSelectHeroItem isShiShiUp
