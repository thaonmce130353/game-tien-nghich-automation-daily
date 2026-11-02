# ChatCtrl

Chat channels and messaging.

- gInst: yes | methods: 60 (own 36) | send: 10
- own methods by kind: getter 1, ui 5, other 3, update 3, send 10, response 13, predicate 1

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send10400 | 10400 | channel, msg | no | on10400: updates local state |
| send10402 | 10402 | id, platform, zone_id, msg | no | on10402: updates local state |
| send10411 | 10411 | hero_id, sign | no | on10411: shows server error; re-requests send10400 |
| send10413 | 10413 | none | yes | on10413: updates local state |
| send10414 | 10414 | rid, channel | no | handler not in this controller |
| send10415 | 10415 | none | no | on10415: no notable effect |
| send10416 | 10416 | hero_id, group, id | no | on10416: no notable effect |
| send10417 | 10417 | platform, zone_id, query_id | no | on10417: no notable effect |
| send10418 | 10418 | id | no | on10418: no notable effect |
| send12091 | 12091 | platform, zone_id, query_id | no | on12091: shows server error |

**getter** (1): getCurlModel

**ui** (5): showChatUi closeChatUi openChatMainUi closeChatMainUi openHandler

**other** (3): displayChatView regNetLit lookRecord

**update** (3): clearCtrlState updateRoleHandler upPriCList

**predicate** (1): isOpenQuizPanel
