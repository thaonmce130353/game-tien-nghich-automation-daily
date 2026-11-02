# TransGodCtrl

God transformation.

- gInst: yes | methods: 55 (own 33) | send: 1
- own methods by kind: getter 6, other 9, redDot 4, update 2, send 1, predicate 10, ui 1
- name-flagged methods: purchase: getZlBuyVal, isBuyTermById, isBuyTermLuxuryById, setZlBuyVal | reward: checkTranGodRewardRed, countCanGetAward, getCurTermNormalRewardListByTermId, isCanAdvancedIdRewardByTermId, isCanLuxuryIdRewardByTermId, isCanNormalIdRewardByTermId, isGetAdvancedIdRewardByTermId, isGetLuxuryIdRewardByTermId, isGetNormalIdRewardByTermId

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send12328 | 12328 | (2 arg) | no | handler not in this controller |

**getter** (6): getCurlModel getZlNetVoByType getZlVal getZlBuyVal getReiki_progress getCurTermNormalRewardListByTermId

**other** (9): toRequestServerData regNetLit reqDataBeforeEnter onRedStatusChanged rv12328 rv12329 bInActTime countCanGetAward sActiveUi

**redDot** (4): registerRed updateTranGodZlRed checkTranGodRewardRed checkTranGodTaskRed

**update** (2): clearCtrlState setZlBuyVal

**predicate** (10): checkCityTransGodBtn isBuyTermById isBuyTermLuxuryById isShowTermRedByTermId isCanNormalIdRewardByTermId isCanAdvancedIdRewardByTermId isGetNormalIdRewardByTermId isCanLuxuryIdRewardByTermId isGetAdvancedIdRewardByTermId isGetLuxuryIdRewardByTermId

**ui** (1): openTransGodZhanlingUi
