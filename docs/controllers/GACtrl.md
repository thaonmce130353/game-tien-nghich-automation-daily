# GACtrl

Unknown, possibly analytics (guess).

- gInst: yes | methods: 130 (own 106) | send: 11
- own methods by kind: update 9, other 14, send 11, response 9, ui 18, getter 33, predicate 2, redDot 10
- name-flagged methods: reward: closeGetAwardUi, gGAResReward, gPieReward, gReward, showRwd

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send31301 | 31301 | none | no | on31301: updates local state |
| send31302 | 31302 | none | no | on31302: no notable effect |
| send31303 | 31303 | id | no | handler not in this controller |
| send31304 | 31304 | id | no | handler not in this controller |
| send31305 | 31305 | id, list | yes | on31305: shows server error |
| send31306 | 31306 | id | yes | on31306: shows server error |
| send31307 | 31307 | id, pos | yes | on31307: shows server error; re-requests send31301 |
| send31308 | 31308 | id | no | on31308: shows server error; re-requests send31302 |
| send31309 | 31309 | id | no | on31309: shows server error; re-requests send31301 |
| send31401 | 31401 | none | no | on31401: updates local state |
| send31402 | 31402 | type, times | yes | on31402: shows server error |

**update** (9): initBeforeData updateRoleAttr clearCtrlState updateGoods upRsvView updateSel setLottoRedStatus upHrsRsv upDayNums

**other** (14): sendMsg regNetLit resRedUiClick quickARes iResGodSel cleResData iResGodCCho resGaCliItem addResList delResList playSound exeLtUi rsvHrs rsvHrsChips

**ui** (18): openResetUi closeResetUi showHbook closeHbook showGAAdtnUi closeGAAdtnUi clkBtFunc openSkillUi closeSkillUi showGAResUi openGResRewUi closeGResRewUi showRwd closeLtUi showLtShop showLtAwrdUi showLtRslt closeGetAwardUi

**getter** (33): getGAUiDt getPosById getIdByPos getCulDtByBId getCulDt getBaseInfo getHbookInfo getLs getLvUpCfg getStUpCfg getPosCfg getPosLv getSkillCfg getLvAttrLs getLvCost getSkillDt getStUpCost getRsAwrdLsById getRedData getSkillData gPieReward gResData gGAResData gGAPieData gGAResReward gResRewData gReward gGAData getLottoRedStatus getArtifactModelPath getArtifactModelResPath getGodEffIdL getShopData

**predicate** (2): isFightBId isFight

**redDot** (10): setSxRed checkRed chkAposRed checkPosRed setPosRed getPosRed chkLvUpRed chkStUpRed chkComRed chkBtrRed
