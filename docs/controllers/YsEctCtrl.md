# YsEctCtrl

Unknown system (name not decodable).

- gInst: yes | methods: 71 (own 47) | send: 7
- own methods by kind: update 2, other 19, send 7, response 9, getter 8, redDot 2
- name-flagged methods: purchase: cYsAdvBuy | reward: countCanGetAward

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send20101 | 20101 | none | no | scmd20101: shows server error; updates local state |
| send20102 | 20102 | shovel_id, id | yes | scmd20102: shows server error |
| send20103 | 20103 | id | no | scmd20103: shows server error |
| send20104 | 20104 | id | no | scmd20104: shows server error; updates local state |
| send20106 | 20106 | (1 arg) | yes | scmd20106: shows server error |
| send20110 | 20110 | none | no | scmd20110: shows server error; updates local state |
| send20112 | 20112 | count | no | scmd20112: shows server error |

**update** (2): clearCtrlState upItems

**other** (19): reqDataBeforeEnter regNetLit sActiveUi exeAdvUi cActiveUi cYsAdvBuy opZlUi exeZlUi cZlUi cGAdvRw cNAdvRw cGZlRw countCanGetAward opYsEct exeYsEct clsEct opKcUi selOre jumpPrge

**getter** (8): getAdvUiDtMoney getZlInfo gZlRwLs gNumLs gProgress gZlItemDtLs gZLRwardLs gZlinfo

**redDot** (2): cZlRed cYsZlItemRed
