# HeroCtrl

Heroes: roster, upgrade, equipment.

- gInst: yes | methods: 655 (own 633) | send: 68
- own methods by kind: getter 183, other 168, redDot 38, update 24, ui 91, send 68, response 34, predicate 27
- name-flagged methods: gm: gMaterials, gMgJhDt, gMgMaxLev | purchase: closeHeroBuyGirdUi, getSealJlDsLevBuyJlLev, getSealStrengDsLevBuyStrengLev, openHeroBuyGirdUi | reward: closeHeroResolveRewardUi, getHeroResolvedReward, getHeroTjzrRewardCount, getQuenchRewardVo, getRelifeRewardByHero, getResolveRewardData, getReward, getRewardByHeroData, isCanRewardHeroTjzrById, isGetAllHeroTjzrReward, openHeroResolveRewardUi, showRwd

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send20000 | 20000 | none | no | on20000: updates local state |
| send20001 | 20001 | id | no | on20001: updates local state; opens UI |
| send20004 | 20004 | id, lev | no | on20004: shows server error; updates local state |
| send20005 | 20005 | id | no | on20005: shows server error |
| send20006 | 20006 | up_list | no | on20006: shows server error; updates local state |
| send20007 | 20007 | none | no | on20007: shows server error; updates local state |
| send20008 | 20008 | id, stage | no | on20008: no notable effect |
| send20009 | 20009 | id, star | no | on20009: no notable effect |
| send20010 | 20010 | hero_id, item_id | yes | on20010: shows server error |
| send20011 | 20011 | hero_id, eqm_id | yes | on20011: shows server error |
| send20012 | 20012 | id, ids | yes | on20012: shows server error; updates local state |
| send20013 | 20013 | none | no | on20013: updates local state |
| send20014 | 20014 | hero_id, status | no | on20014: shows server error; updates local state |
| send20018 | 20018 | none | no | on20018: updates local state |
| send20020 | 20020 | hero_id, item_id | yes | on20020: shows server error |
| send20021 | 20021 | hero_id, pos | yes | on20021: shows server error |
| send20022 | 20022 | hero_id, pos | no | handler not in this controller |
| send20023 | 20023 | list, id, num | no | handler not in this controller |
| send20030 | 20030 | hero_id, pos, item_id | no | on20030: shows server error |
| send20031 | 20031 | hero_id, pos | no | on20031: shows server error |
| send20032 | 20032 | src_hero_id, src_pos, tar_hero_id, tar_pos | no | on20032: shows server error |
| send20033 | 20033 | hero_id | no | on20033: updates local state |
| send20039 | 20039 | id, cfg_id | no | handler not in this controller |
| send20040 | 20040 | hero_id, item_id_list | yes | on20040: shows server error |
| send20041 | 20041 | pos, hero_id | yes | on20041: shows server error |
| send20044 | 20044 | id, num, list | yes | handler not in this controller |
| send20045 | 20045 | hero_base_id | no | handler not in this controller |
| send20046 | 20046 | hero_base_id, skin_id | yes | on20046: shows server error |
| send20050 | 20050 | hero_id, wear_list | no | on20050: shows server error |
| send20051 | 20051 | hero_id, pos | no | on20051: shows server error |
| send20052 | 20052 | src_hero_id, src_pos, tar_hero_id, tar_pos | no | on20052: shows server error |
| send20053 | 20053 | hero_id | no | on20053: updates local state |
| send20054 | 20054 | hero_id, pos, item_list | yes | on20054: shows server error; updates local state |
| send20067 | 20067 | hero_base_id | no | handler not in this controller |
| send20068 | 20068 | hero_base_id | no | handler not in this controller |
| send20069 | 20069 | none | no | handler not in this controller |
| send20070 | 20070 | id | no | handler not in this controller |
| send20071 | 20071 | (2 arg) | yes | handler not in this controller |
| send20072 | 20072 | id, pos_talent_list | no | handler not in this controller |
| send20073 | 20073 | (1 arg) | yes | handler not in this controller |
| send20074 | 20074 | id, link_hero_id | no | handler not in this controller |
| send20075 | 20075 | id | no | handler not in this controller |
| send20076 | 20076 | id, link_hero_id | no | handler not in this controller |
| send20077 | 20077 | here_uid, link_hero_id | no | handler not in this controller |
| send20078 | 20078 | here_uid | no | handler not in this controller |
| send20079 | 20079 | here_uid, link_hero_id | no | handler not in this controller |
| send20080 | 20080 | here_uid, godsoul_uid | no | handler not in this controller |
| send20081 | 20081 | here_uid | no | handler not in this controller |
| send20082 | 20082 | hero_seals | no | handler not in this controller |
| send31901 | 31901 | none | no | handler not in this controller |
| send31902 | 31902 | none | no | handler not in this controller |
| send32000 | 32000 | none | no | handler not in this controller |
| send32001 | 32001 | none | no | handler not in this controller |
| send32002 | 32002 | item_id | no | handler not in this controller |
| send32003 | 32003 | item_id, loss_list | no | handler not in this controller |
| send32004 | 32004 | group_id | no | handler not in this controller |
| send32005 | 32005 | hero_id, type, list | no | handler not in this controller |
| send32006 | 32006 | hero_id, list | no | handler not in this controller |
| send32007 | 32007 | old_hero_id, hero_id, pos, item_id | no | handler not in this controller |
| send32040 | 32040 | none | no | handler not in this controller |
| send32041 | 32041 | id, item_list | no | handler not in this controller |
| send32042 | 32042 | none | no | handler not in this controller |
| send32043 | 32043 | none | no | handler not in this controller |
| send32044 | 32044 | none | no | handler not in this controller |
| send32045 | 32045 | (3 arg) | no | handler not in this controller |
| send32046 | 32046 | (4 arg) | no | handler not in this controller |
| send32047 | 32047 | id | no | handler not in this controller |
| send32048 | 32048 | id | no | handler not in this controller |

**getter** (183): getCurlModel gLock getHeroResolvedReward getChoiceUiType getCurChoiceUiNodeData getEquipRedByHero getLevUpRedByHero get20001Data getHeroDestinyLev getHeroTjzrRewardCount getHasActiveCountById gDtByRlm gHBDtByRlm getHandBookDataByRealm2 getHeroBackDataByRealm getHeroDataByRealm getHeroDataByCareer gHSkill getShowSkill getHeroLevDataByCareerAndLev getHeroStageAttrByCareerAndStage getHeroStarUpDataListByStar getGodHeroXianHunCaiLiao getlossData getHName getHeroListByNodeData getTmpOrSaveArr getIsSelfType getStarUpSaveCtrNum getStarConfigByStar getStageConfigByStage getStageConfigByLevLimit gEqDList getHeroEquipType getHeroPutOnEquip getResolveRewardData getRelifeRewardByHero getRewardByHeroData getHeroBaseByBaseId getHeroListByRealm getHeroListByCareer getHeroListByRealmAndQuality getHeroCfgListByStar getHeroTalentLevDataByStarAndStage getHeroTalentLevDataByStar getHeroTalentLevDataByStage gHTalentLevLs gHTLsByBidALev gHTalentDLs gSealBt gHLevLimit getHeroIsCanStageUp gHAttrSum gHSBBDt getHeroShenBingStrengthenData getHeroShenBingStrengthenTalentData getHeroShenBingTalentInfoData getShenBingStrengCostList getHeroBaseIdByShenBingBaseId getHeroShenBingAttrList getHeroSilkListByHeroData gHCSilkDt getIsSyByHeroBaseIdAnySilkBaseId gSyYsBoo getHeroHasPutSilkByBaseId getSilkDescList getSilkBookList getHeroInfoDataByParam getWeaponeHeroStatusById getMoreLevUpData getMaxHeroFc getHeroPutOnSeal getSealDataList getSealComparison getSealBasePower getSealInfoDataByBaseId getSealLevUpData getSealJlData getHeroSealJlDsDataBySuitId getHeroSealStrengDsDataBySuitId getHeroSealJlDsData getHeroSealStrengDsData getHeroSealMapData getSealStrengAttr getSealJlAttr getSealAttr getMinStrengLev getMinJlLev getHeroSealStrengDsLev getHeroSealJlDsLev getSealStrengDsLevBuyStrengLev getSealJlDsLevBuyJlLev getSealCultivateUiByType getSealCultivateUiData getSealDsUiByType getSealDsUiData getSealRedByHero getResRew getReSealData getSealKSFJ getResReWData getReward getSDataBag getSDBysId getSkinTime gHeroFreeEff gIsEffExist gHModelId gHFreeEftIds getSkinId getHasSkin gHYsQhUiDt gMaterials gQhYsSNum gYsExp gYsExp2 gYsBCfgBy gYsBCfg gYsQhCfg gYsPosCfg gYsQhMaxCfg gFcExp gYsTypeCfg gYsQhMLev getYsUiDt gYsDt gBestYs getStarUpStatus gChangePage gHrsStarCs gHrsHeros gHrsMaxStar gHrsTlCfg gHrsRsvLs gHrsRsvChips gHrsOpAwrds gHrsRsvAwrd gHrsChipRb gHrsAttr gHrsReAwrd gHrsBookCfg gCurHeroDt gMgJhDt getMgJhCfg getMgLevCfg getMgLevDt getAttrLs gMgMaxLev getHeroTjzrByKey getHeroTjzrConfById getHeroDestinyLvConfig getHeroResonanceConfigById getHeroTuJianList getHeroBookInfo getMagicWeaponStar getMagicWeaponResonnanceStar getOpenPosNeedStar getColorArr getChoiceColorItemVoArr getMagicWeaponResonanceAllAttr getMagicWeaponBookTipsNum getMagicWeaponBookUpStarTipsNum getMagicWeaponBookUpStarColorTipsNum getMagicWeaponBookUpLevelTipsNum getMagicWeaponResonanceTipsNum getMagicWeaponResonanceColorTipsNum getAllHeroDic getHeroDataByHeroId getHeroDataByBaseId getHeroDatasByBaseId getMaxSoulLvByBaseId getMagicQuenchInfo getMagicQuenchStepLv getMagicQuenchNumById getMagicQuenchStepArr getMagicPresetList getQuenchRewardVo getHeroDataExceptGodRealm getFrontFiveMinLv getOneKeyLevUpData getPresetLimitNum getNewPresetId getCacheHideHeroIds

**other** (168): reqDataBeforeEnter regNetLit opHeroHBMUi exeHBMUi sPrevLs sPrev opPrevUi exeAHPrevUi cHPrevUi opHSysUi exeHSysUi opHMainFun exeHMainUi opHeroDestinyUi opHeroBlockUi exeHeroDestinyUi opHeroResonanceUi cpHeroResonanceUi opHeroTjzrUi exeHeroTjzrUi opHPUi cHPUi opHCUiFun cHCUiFun reqHeroChoieveData opHCiceEUi exeAfterAttrResultUi exeWakeRtUi sendAutoStar heroUpStarFun csResolve rv20039 rv31901 rv31902 chkHeroDt rv20069 rv32000 rv32001 rv32002 rv32003 rv32004 rv32005 rv32006 rv32007 rv32099 quickAddResolve addStarUpChoiceData addStarUpSaveChoiceData pushStarUpSaveChoiceData pushStarUpChoiceData delStarUpChoiceData saveStarUpDataByType cloneList cTStarUp addResolveById delResolveById resolveClickItem selectHero cliHBLft cliHBRgt puOnEquipByHero puDownEquipByHero choiceHeroItem1 sortHeroList sd20042 sd20043 cHSCitem exeCultivate udSealLs exeAfterDsLevUpUi rv20044 rSealClick gskCfg useSkItem onSellItem onOpenShop sSkHeroId alertGoSk alertSk linktoSkin opHYsQhUi cHYsQhUi addMaterials delMaterials udYsQhUiDt ysCdtion ysPosName autoYsEq putOnYsEq opGhYs cQhIt cQhItDelBt atYsQh atOneLev sd20055 rv20055 sd20056 rv20056 sd20057 rv20057 sd20058 rv20058 sd20059 rv20059 sd20060 rv20060 sd20061 rv20061 sd20062 rv20062 sd20064 rv20064 sd20063 rv20063 opHrsH opHrsTrn sTrnIdx chkHrsLv chkHrsStar selHrsItem chkHrsSy opStarSuc chkHrsRd opHrsShopUi opHrsReUi opHrsBooKUi opRsetUi cResetUi rd20016 csRelife scRelife csRemove scRemove linkTo sd20065 rd20065 rd20066 cActivate opMgJhUi sureAutoResolve tesetAlert tesetAlert1 parseUpStarLoss parseResonanceLoss addLoss rv20071 rv20072 rv20073 rv20074 rv20075 rv20076 rv20077 rv20078 rv20079 rv20080 rv20081 rv20082 rv32040 rv32041 rv32042 rv32043 rv32044 rv32045 rv32046 rv32047 rv32048 bEnoughLvRelation bOpenOneKeyUpgrade

**redDot** (38): registerRed getHeroBagTagRed checkHeroRed checkHeroSysRed updateHeroTabRed gHSOrWRed getHeroSuperStarRed getHeroGodPowerRed getHeroXianHunRed getOneHeroXianHunRed getHeroDestinyRed getShenBingRed getShenBingChangeRed getShenBingStrengRed updateSilkRed getSilkRed checkSealStrengLevUpRed checkSealJlUpRed checkSealGhRed checkMgRed checkHeroMagicWeaponWearRed getSzRed getPageRed cYsRed gYsRed gYsQhRed gHrsBookRed gHrsRed gHrsPosRed gHrsTrnRed gHrsLvRed gHrsRdRed sHrsBookRed checkQuenchRedDot checkQuenchUpgradeRedDot checkQuenchUpgradeStarRedDot getGodSoulRed getSkyHeroLinkRed

**update** (24): clearCtrlState setChoiceUiType setCurChoiceUiNodeData updateGoods updateRoleAttribute updateAllMagicWeaponWearData upDestinyHeroLs clearListDic clearResonanceDic initTempList clearSaveStarUpChoiceData clearAllResolve setViewType clearSReList upMainUi upHrsLs upHrsTrnDt clearAllColorDic clearOneColorDic clearAllColorItemVoDic clearOneColorItemVoDic clearSelectLinkHero updateQuenchInfo setCacheHideHeroIds

**ui** (91): openHeroTJSJTips closeHeroUi closeHeroDestinyUi closeHeroChoiceEquipUiFunc openSealSlTips openHeroResolveRewardUi closeHeroResolveRewardUi openHeroBuyGirdUi closeHeroBuyGirdUi openHeroAttributeResultUi closeHeroAttributeResultUi closeWakeRtUi openHeroAttrbuteShowUi closeHeroAttrbuteShowUi openHeroChoiceSilkUi closeHeroChoiceSilkUi openHeroSilkInfoUi closeHeroSilkInfoUi openHeroSilkBookSystemUi closeHeroSilkBookSystemUi clickChangeHeroBtn showHeroSealCultivate clickSealCultivateWenHao closeHeroSealCultivate showHeroSealDsUi closeHeroSealDsUi showDsLevUpUi closeDsLevUpUi openSeResReUi openSealKSFJUi showRwd clickUseBtn openSellView showYsBkUi clickReset closeMgJh openMagicWeaponUpSuccessUi closeMagicWeaponUpSuccessUi openMagicWeaponActSuccessUi closeMagicWeaponActSuccessUi openMagicWeaponUpStarUi closeMagicWeaponUpStarUi openMagicWeaponTips closeMagicWeaponTips openMagicWeaponRobUi closeMagicWeaponRobUi openMagicWeaponResonanceUi closeMagicWeaponResonanceUi openMagicWeaponResonanceTips closeMagicWeaponResonanceTips openMagicWeaponReplaceUi closeMagicWeaponReplaceUi openMagicWeaponChoiceUi closeMagicWeaponChoiceUi openMagicWeaponBookMainUi closeMagicWeaponBookMainUi openMagicWeaponAttTips closeMagicWeaponAttTips openheroTJAttrTip closeheroTJAttrTip openHeroActStarStageUi closeHeroActStarStageUi openHeroGodPowerSkillTipsUi closeHeroGodPowerSkillTipsUi openheroGodPowerOverviewUi closeheroGodPowerOverviewUi openheroGodPowerChangeUi closeheroGodPowerChangeUi openHeroXianHunTalentTips closeHeroXianHunTalentTips openGodHeroLinkPreUi closeGodHeroLinkPreUi openGodHeroLinkRemoveSuccessUi closegodHeroLinkRemoveSuccessUi openGodHeroLinkSuccessUi closeGodHeroLinkSuccessUi openGodHeroRemoveLinkUi closeGodHeroRemoveLinkUi openGodHeroSelectUi closeGodHeroSelectUi openGodHeroUpSuccessUi closeGodHeroUpSuccessUi openQuenchStepUi openQuenchQualityUi openQuenchActSuccessUi openMagicPresetUi openMagicPresetProjectUi openMagicPresetChangeNameUi openMagicPresetRobUi openGodSoulAttrActUi openSkyHeroGodSoulSkillTips

**predicate** (27): checkInDestinyHero isGetAllHeroTjzrReward isCanRewardHeroTjzrById isShowHeroTjzrReds isShowHeroTuJianReds checkHeroBookShowCond isCanSuperStar isCanGodPower checkCanCostHero checkCanChoice isSaveChoice isTempChoice isResolveSelect isResolveChoice checkStarUpItemRedByNode checkCanPutOnSilk checkDsLevUp isResSealCho isOpYs checkHrsIsOpen checkAutoResolve canMagicWeaponUp canMagicWeaponResonanceUp checkIsInSameLink isNodeInLink checkGodSoulSkillActCond hasLinkSkyHero
