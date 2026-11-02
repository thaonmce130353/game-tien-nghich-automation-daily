# FashionCtrl

Fashion / skins.

- gInst: yes | methods: 64 (own 42) | send: 5
- own methods by kind: other 8, redDot 5, update 2, send 5, getter 9, ui 13

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send12260 | 12260 | none | no | handler not in this controller |
| send12262 | 12262 | (1 arg) | no | handler not in this controller |
| send12263 | 12263 | (1 arg) | no | handler not in this controller |
| send12264 | 12264 | (2 arg) | no | handler not in this controller |
| send12265 | 12265 | (2 arg) | no | handler not in this controller |

**other** (8): regNetLit reqDataBeforeEnter rv12260 rv12261 rv12262 rv12263 rv12264 rv12265

**redDot** (5): registerRed getFashionActivityStarRed getSingleUpStarRed getFashionWearRed checkRed

**update** (2): clearCtrlState initList

**getter** (9): getHaveFashionCount getFashionDataById getFashionTotalAtt getCanWearFashionHeroList getFashionDataByHeroId getHaveFashionList getCanWearFashionList getShowFashionList getCurlModel

**ui** (13): openMainUi openFashionTotalAttrTipsUi openFashionDevelopUi openFashionTalentTipsUi openFashionPreviewUi openFashionActivityUi openUpStarSuccessUi openWearSuccessUi openSelectHeroUi openSelectFashionUi openSkillTips openFashionSkillTipsByItemId openFahionInfoByBaseId
