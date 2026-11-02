# RoleCtrl

Player character info.

- gInst: yes | methods: 47 (own 24) | send: 2
- own methods by kind: getter 4, update 4, other 5, send 2, response 9

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send12066 | 12066 | none | no | handler not in this controller |
| send12072 | 12072 | name | yes | on12072: shows server error |

**getter** (4): getCurlModel getRoleInfo getLookInfoByType getRoleLv

**update** (4): clearCtrlState clearRenameState updateLookInfo updateAttr

**other** (5): reqDataBeforeEnter regNetLit Send12064 reqGzlInfo reqDbgInfo
