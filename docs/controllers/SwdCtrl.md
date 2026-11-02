# SwdCtrl

Sword-themed content (guess).

- gInst: yes | methods: 79 (own 55) | send: 11
- own methods by kind: other 19, redDot 5, send 11, response 14, getter 5, update 1

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send14211 | 14211 | none | no | scmd14211: shows server error; updates local state |
| send14212 | 14212 | index, id | yes | scmd14212: shows server error |
| send14213 | 14213 | none | no | scmd14213: shows server error |
| send14215 | 14215 | none | no | scmd14215: shows server error; updates local state |
| send14216 | 14216 | none | no | scmd14216: shows server error; updates local state |
| send14217 | 14217 | type | yes | scmd14217: shows server error; updates local state |
| send14218 | 14218 | index, rank, id | yes | scmd14218: shows server error |
| send14220 | 14220 | id | no | scmd14220: no notable effect |
| send14221 | 14221 | none | no | scmd14221: shows server error |
| send14222 | 14222 | none | no | scmd14222: shows server error |
| send14224 | 14224 | none | no | handler not in this controller |

**other** (19): reqDataBeforeEnter regNetLit opMain exeMain clsMain opRank opRankRw opInfo exeInfo opDefense opVideo clsVideo opShop aKeySweep addNums chanllenge exeFight replayVdo opHelp

**redDot** (5): registerRed getFightRed getZanRed getFightRecordRed setFightRecordRed

**getter** (5): getSWDIsOpen getMod getOpenState getStartTime getEndTime

**update** (1): resetIsVdo
