# WarlordsKfCtrl

Cross-server warlords contest.

- gInst: yes | methods: 82 (own 60) | send: 19
- own methods by kind: getter 1, other 12, update 1, redDot 2, ui 2, response 23, send 19

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send14271 | 14271 | none | no | on14271: updates local state; re-requests send14285,send14286,send14287 |
| send14272 | 14272 | none | no | on14272: updates local state |
| send14273 | 14273 | none | no | on14273: updates local state |
| send14274 | 14274 | none | no | on14274: updates local state |
| send14275 | 14275 | id, num | no | on14275: shows server error; updates local state; opens UI |
| send14276 | 14276 | none | no | on14276: updates local state |
| send14277 | 14277 | pos | no | on14277: shows server error; updates local state |
| send14278 | 14278 | stage, role_id | no | on14278: updates local state |
| send14279 | 14279 | none | no | on14279: updates local state |
| send14283 | 14279 | list | no | on14279: updates local state |
| send14285 | 14285 | none | no | on14285: updates local state |
| send14286 | 14286 | none | no | on14286: updates local state |
| send14287 | 14287 | none | no | on14287: updates local state |
| send14288 | 14288 | none | no | on14288: updates local state |
| send14289 | 14289 | role_id | no | on14289: shows server error; updates local state |
| send14290 | 14290 | zone_aid | no | on14290: shows server error; updates local state |
| send14291 | 14291 | zone_aid | no | on14291: shows server error; updates local state |
| send14292 | 14292 | record_id | no | on14292: shows server error |
| send14293 | 14293 | none | no | on14293: updates local state |

**getter** (1): getCurlModel

**other** (12): reqDataBeforeEnter regNetLit oWarCtSelUi oWarARankUi oWarLInfoUi oWarCtVUi oWarETipsUi oWarSTipsUi oWarKfRView sRwView sd14294 rv14294

**update** (1): clearCtrlState

**redDot** (2): registerRed checkTopZanRed

**ui** (2): openWarMainUi showJcUi
