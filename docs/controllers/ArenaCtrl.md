# ArenaCtrl

PvP arena (Đấu Tiên Đài): opponents, battles, ranking.

- gInst: yes | methods: 96 (own 74) | send: 1
- own methods by kind: update 15, redDot 4, ui 20, other 30, getter 2, predicate 2, send 1
- name-flagged methods: purchase: getEmbattleOrder | reward: processAwards, reqGainAward, updateAward

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send14201 | 14201 | none | no | handler not in this controller |

**update** (15): initBeforeData setChnlgeEmyStart resetRcrdSt resetIsReplay setSkipArenaFightMsg clearCtrlState setChanllInfo updateList updateFreshBtn updateBaseInfo updateSeasonTime updateAward upFreeChnlgeNums upRcrdRedSt clearInfo

**redDot** (4): registerRed isShowRed checkRed isShowRecordRed

**ui** (20): openArenaMainUi closeAnUi closeAnAwrdUi clkAwrdBox showEnemyDetail closeEnemyDetail showChnlgeSuc showChnlgeFail showFightCountUi showDZRFightCountUi showRecordUi showFightRcrd showDefendTeam showShop showRank showEnemyInfo showDes closeDes clkCount clkRply

**other** (30): exeDxtMainUi opAnUi opAnAwrdUi selAwrdPage frsEmyLs chnlgeEmy dealArenaResultData replayFight enterHangup backToArena chnlgeEmyInDt addCurreny reqDataBeforeEnter onRedStatusChanged regNetLit reqFrsEmyLs reqGainAward reqChnlgeEmy reqEmyDt reqRsRcrdSt recvBaseInfo processAwards recvEmyLs recvGainAwrdRst recvChnlgeRslt recvChnlgeInfo recvRcrdRedSt recvEmyDetail freshWaitTick remainTimeTick

**getter** (2): getEmbattleOrder getArenaBaseCofVo

**predicate** (2): isShowRcrd isClearInfo
