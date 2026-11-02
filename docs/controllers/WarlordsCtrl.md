# WarlordsCtrl

Warlords contest.

- gInst: yes | methods: 64 (own 42) | send: 10
- own methods by kind: getter 1, other 12, update 1, redDot 2, ui 2, response 14, send 10

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send14241 | 14241 | none | no | on14241: updates local state |
| send14242 | 14242 | none | no | on14242: updates local state |
| send14243 | 14243 | none | no | on14243: updates local state |
| send14244 | 14244 | none | no | on14244: updates local state |
| send14245 | 14245 | id, num | no | on14245: shows server error; updates local state; opens UI |
| send14246 | 14246 | none | no | on14246: updates local state |
| send14247 | 14247 | pos | no | on14247: shows server error; updates local state |
| send14248 | 14248 | stage, role_id | no | on14248: updates local state; opens UI |
| send14249 | 14249 | none | no | on14249: updates local state |
| send14253 | 14253 | list | no | on14253: shows server error |

**getter** (1): getCurlModel

**other** (12): reqDataBeforeEnter regNetLit oWarCtSelUi oWarARankUi oWarLInfoUi oWarCtVUi oWarETipsUi oWarSTipsUi sRwView sd14254 rv14254 parseJc

**update** (1): clearCtrlState

**redDot** (2): registerRed checkTopZanRed

**ui** (2): openWarMainUi showJcUi
