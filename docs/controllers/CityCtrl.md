# CityCtrl

Main city scene and buildings.

- gInst: yes | methods: 89 (own 64) | send: 2
- own methods by kind: update 11, other 14, predicate 16, ui 10, redDot 5, getter 3, send 2, response 3

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send19230 | 19230 | none | no | on19230: shows server error; opens UI |
| send31005 | 31005 | type | no | scmd31005Handler: shows server error; updates local state |

**update** (11): clearCtrlState updateRoleLv updateShowBtn initShowBtnList updateScmdAcivityBtnTimeData updateScmdAcivityBtnDesc setAcivityBtnTime setActivyBtnDesc initHBData setGldwrIcon setNewSceneStatus

**other** (14): regNetLit selectFunc selectAction addScmdAcivityBtnData addAcivityBtn delAcivityBtn yybOperate exeHBUi sd11203 rv11203 sd11204 changeNewScene changeOldScene cTsBtn

**predicate** (16): checkBtn checkMoreAct checkOpenSuperHero checkOpenNewSuperHero checkOpenSuperHeroEncore checkOpenSuperFaBao checkOpenFestivalAct checkOpenTransGodAct checkOpenSpiritBeast checkOpenNewSpiritBeast checkOpenFashionRec checkOpenWoodStar checkOpenExMatter checkOpenSidePlot checkOpenSwordDir isHasShow

**ui** (10): showSurveyBtn showScsmBtn showCityView showCloudDoorUi clickActivityBtn showAchieveActRed showBtn showHBUi showHBIcon showHBRed

**redDot** (5): setAchieveActRed setActBtnRed updateScmdAcivityBtnRed updateScmdRed setAcivityBtnRed

**getter** (3): getActivityBtnList getYYBState gHasTsDt
