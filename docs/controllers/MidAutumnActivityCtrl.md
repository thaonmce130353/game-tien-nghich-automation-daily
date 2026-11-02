# MidAutumnActivityCtrl

Mid-Autumn festival event.

- gInst: yes | methods: 65 (own 42) | send: 14
- own methods by kind: getter 1, other 4, update 1, ui 7, send 14, response 15
- name-flagged methods: purchase: openShopBatchBuyView | reward: openAwardPreviewUi, showHeroRecruitAwardInfoUi, showHeroRecruitAwardUi

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send19055 | 19055 | activity_id | no | on19055: updates local state |
| send19056 | 19056 | times | yes | on19056: shows server error; updates local state |
| send19057 | 19057 | stage | no | on19057: shows server error; updates local state |
| send19058 | 19058 | none | no | on19058: updates local state |
| send19059 | 19059 | shop_id, num | no | on19059: shows server error; updates local state |
| send19140 | 19140 | none | no | on19140: updates local state |
| send19141 | 19141 | id | no | on19141: shows server error; updates local state |
| send19145 | 19145 | activity_id | no | on19145: updates local state |
| send19146 | 19146 | day | no | on19146: shows server error; updates local state |
| send19150 | 19150 | none | no | on19150: updates local state |
| send19151 | 19151 | day | no | on19151: shows server error; updates local state |
| send19152 | 19152 | day | no | on19152: shows server error; updates local state |
| send19155 | 19155 | activity_id | no | on19155: updates local state |
| send19156 | 19156 | id | no | on19156: shows server error; updates local state |

**getter** (1): getCurlModel

**other** (4): reqDataBeforeEnter regNetLit selectTab sdDhmbCjEvt

**update** (1): clearCtrlState

**ui** (7): openMidAutumnActivityUi openAwardPreviewUi showHeroRecruitAwardUi showHeroRecruitAwardInfoUi showHeroProbabilityUi openShopBatchBuyView openMidAutumnActivityShopMainUi
