# SettingCtrl

Settings and account options.

- gInst: yes | methods: 97 (own 74) | send: 16
- own methods by kind: other 13, update 4, ui 14, getter 3, send 16, response 23, predicate 1
- name-flagged methods: purchase: closeHeadBorderTips, showHeadBorderTips

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send11130 | 11130 | type, title, content | no | scmd11130Handler: shows server error |
| send11131 | - | (1 arg) | yes | - |
| send12076 | 12076 | cid | no | scmd12076Handler: shows server error |
| send12095 | 12095 | id, type, content, evidence | no | scmd12095Handler: shows server error |
| send12211 | 12211 | none | no | scmd12211Handler: updates local state |
| send12212 | 12212 | id | no | scmd12212Handler: shows server error; updates local state |
| send12213 | 12213 | id | no | scmd12213Handler: shows server error; updates local state |
| send12221 | 12221 | none | no | scmd12221Handler: updates local state |
| send12222 | 12222 | id | no | scmd12222Handler: shows server error; updates local state |
| send12223 | 12223 | id | no | scmd12223Handler: shows server error; updates local state |
| send12231 | 12231 | none | no | scmd12231Handler: updates local state |
| send12232 | 12232 | id | no | scmd12232Handler: shows server error; updates local state |
| send12241 | 12241 | none | no | scmd12241Handler: updates local state |
| send12242 | 12242 | id | no | scmd12242Handler: shows server error; updates local state |
| send12251 | 12251 | none | no | scmd12251Handler: updates local state |
| send12253 | 12253 | id | no | on12253: shows server error; updates local state |

**other** (13): reqDataBeforeEnter regNetLit sendChatRecord changeMusic changeSound exitGame switchGame contactService reqGetSysSetInfo recvGetSysSetInfo pauseMusicAndSound resumeMusicAndSound reqSaveSysSetInfo

**update** (4): clearCtrlState updateMusic updateSound setSysSetValue

**ui** (14): showChatRecord openSettingUi openSystemSettingUi openGiftExchangeUi openCommitBugUi openContactUsPopUi closeChangeNameView showHeadBorderTips closeHeadBorderTips openServiceUi openServiceWelfareUi openChangeNameUi openRoleInformUi closeRoleInformUi

**getter** (3): getCurlModel getCardResp getSysSetValue

**predicate** (1): isShowContactUs
