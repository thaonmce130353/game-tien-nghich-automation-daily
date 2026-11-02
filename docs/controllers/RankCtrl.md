# RankCtrl

Leaderboards and worship (BXH).

- gInst: yes | methods: 63 (own 42) | send: 7
- own methods by kind: update 4, redDot 3, getter 6, other 9, ui 7, send 7, response 5, predicate 1
- name-flagged methods: purchase: showRankRechargeUi | reward: checkRankRewardIdIsGet, getOneRankRewardRed, getRankRewardHasGetIdArr, getRankRewardRoleInfo, showRankRewardUi

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send15001 | 15001 | type, page, num | no | scmd15001Handler: updates local state |
| send15005 | 15005 | none | no | scmd15005Handler: updates local state |
| send15006 | 15006 | type, rank | no | scmd15006Handler: shows server error; updates local state |
| send15008 | 15008 | type | no | scmd15008Handler: updates local state |
| send15009 | 15009 | type | no | handler not in this controller |
| send15010 | 15010 | type | no | handler not in this controller |
| send15011 | 15011 | type, ids | no | handler not in this controller |

**update** (4): initBeforeData clearCtrlState updateVipLv updateHiddenInfo

**redDot** (3): registerRed getOneRankMoBaiRed getOneRankRewardRed

**getter** (6): getCurlModel getEndlessTriaRankDataList getFairylandRankDataList getRankRewardRoleInfo getRankRewardHasGetIdArr getRankDesc

**other** (9): reqDataBeforeEnter sendMsg sendMsg2 regNetLit onCrossSky changeCheck rv15009 rv15010 rv15011

**ui** (7): showRankMainView showRankView showRankListUi showRankListPopUi showRankListPopUi2 showRankRewardUi showRankRechargeUi

**predicate** (1): checkRankRewardIdIsGet
