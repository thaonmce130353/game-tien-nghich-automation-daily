# AdvCtrl

Advancement / upgrade screens (guess).

- gInst: yes | methods: 169 (own 145) | send: 24
- own methods by kind: other 25, update 4, ui 47, send 24, getter 10, redDot 3, response 32
- name-flagged methods: purchase: closeBchBuyUi, closeShopBuyUi, exeShopBuyUi, mySHopBuy, openBchBuyUi, openShopBuyUi | reward: closeAwardUi, exeAwardUi, openAwardUi, sendGridAward, triggerGridAward

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send11060 | 11060 | sign | no | scmd11060Handler: updates local state; re-requests send11075,send11063; opens UI |
| send11061 | 11061 | none | no | scmd11061Handler: updates local state |
| send11062 | 11062 | aid | no | scmd11062Handler: shows server error |
| send11063 | 11063 | grid_id | no | scmd11063Handler: shows server error |
| send11065 | 11065 | id, list | yes | scmd11065Handler: shows server error |
| send11066 | 11066 | (2 arg) | yes | scmd11066Handler: shows server error |
| send11067 | 11067 | grid_id | no | scmd11067Handler: updates local state |
| send11068 | 11068 | grid_id, id | no | scmd11068Handler: shows server error |
| send11069 | 11069 | grid_id | no | scmd11069Handler: updates local state |
| send11070 | 11070 | grid_id, answer | no | scmd11070Handler: shows server error |
| send11072 | 11072 | grid_id | no | scmd11072Handler: updates local state |
| send11073 | 11073 | grid_id, index | no | scmd11073Handler: shows server error |
| send11074 | 11074 | grid_id, bet, guess | no | scmd11074Handler: shows server error |
| send11075 | 11075 | hero_id | no | scmd11075Handler: shows server error |
| send11077 | 11077 | grid_id | yes | scmd11077Handler: re-requests send11075 |
| send11078 | 11078 | hero_id | no | scmd11078Handler: shows server error |
| send11079 | 11079 | grid_id | no | scmd11079Handler: shows server error |
| send11080 | 11080 | num | no | scmd11080Handler: shows server error |
| send11082 | 11082 | none | no | scmd11082Handler: shows server error; updates local state |
| send11083 | 11083 | id | no | scmd11083Handler: shows server error |
| send11084 | 11084 | num | no | scmd11084Handler: no notable effect |
| send11089 | 11089 | is_skip | no | scmd11089Handler: no notable effect |
| send11091 | 11091 | grid_id | no | scmd11091Handler: shows server error |
| send11092 | 11092 | grid_id | no | scmd11092Handler: shows server error |

**other** (25): regNetLit reqDataBeforeEnter exeLtryUi againHandler exeMainUi exeMorraUi useSpclUiHdlr exeAnsrUi exeEnterUi eventHandler chkIsSameChs chkIsInSameLink chkIsChsFgtLs exeShopBuyUi exeMyShopUi mySHopBuy exeShopUi exeRankUi exeEventUi boxOpen exeBoxUi exeTalkUi exeAwardUi triggerGridAward sendGridAward

**update** (4): updateAttr updateRoleDt clearCtrlState resetFightLs

**ui** (47): openLtryUi openAdvStateLevUi closeLtryUi clkAdv openMainUi closeMainUi openBuffUi closeBuffUi openResultUi closeResultUi openHeroMainUi closeHeroMainUi openMorraUi closeMorraUi openUseSpclUi closeUseSpclUi openAnsrUi closeAnsrUi openEnterUi closeEnterUi openBchBuyUi closeBchBuyUi openFightUi closeFightUi clkNmlGrid clkBossGrid clkMainUiBtn clkWenHao clkAtBattle clkFightItem clkUseItem clkUseSpclBs clkCzItem openShopBuyUi closeShopBuyUi openMyShopUi openShopUi openRankUi closeRankUi openEventUi closeEventUi openBoxUi closeBoxUi openTalkUi closeTalkUi openAwardUi closeAwardUi

**getter** (10): getTrgtKlNum getTrgtOver getDtByRlm getDtByCareer getBsBIdByUId getGridDtById getAnsrAwdLs getMainUiData getAdvDt getKillNum

**redDot** (3): getTrgtRed getRed checkRed
