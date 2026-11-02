# SpiritAnimalCtrl

Spirit animals.

- gInst: yes | methods: 138 (own 117) | send: 16
- own methods by kind: getter 15, redDot 3, update 10, other 21, send 16, ui 34, predicate 18
- name-flagged methods: purchase: buyAdvZl, isBuyTermById | reward: getCurTermNormalRewardListByTermId, isCanAdvancedIdRewardByTermId, isCanGetHomeTypeProduceReward, isCanGetRewardByLev, isCanNormalIdRewardByTermId, isCheckLevelReward, isGetAdvancedIdRewardByTermId, isGetNormalIdRewardByTermId, isHasGetRewardByLev

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send32010 | 32010 | none | no | handler not in this controller |
| send32011 | 32011 | (1 arg) | no | handler not in this controller |
| send32012 | 32012 | (1 arg) | no | handler not in this controller |
| send32013 | 32013 | (3 arg) | no | handler not in this controller |
| send32014 | 32014 | (1 arg) | no | handler not in this controller |
| send32015 | 32015 | none | no | handler not in this controller |
| send32016 | 32016 | (1 arg) | no | handler not in this controller |
| send32017 | 32017 | none | no | handler not in this controller |
| send32018 | 32018 | (3 arg) | no | handler not in this controller |
| send32019 | 32019 | none | no | handler not in this controller |
| send32020 | 32020 | none | no | handler not in this controller |
| send32021 | 32021 | (1 arg) | no | handler not in this controller |
| send32022 | 32022 | none | no | handler not in this controller |
| send32023 | 32023 | (1 arg) | no | handler not in this controller |
| send32024 | 32024 | none | no | handler not in this controller |
| send32025 | 32025 | (1 arg) | no | handler not in this controller |

**getter** (15): getCurlModel getCurHomeUnitId getCurTermNormalRewardListByTermId getSC_32019 getProduceInfo getReiki_progress getTermNetVo getAnimalDeployBaseId getAnimalStar getAnimalStarLv getAnimalStage getAnimalInfo getAnimalBookStar getAnimalStageMaterialVal getAnimalHasDeployNum

**redDot** (3): registerRed isShowSpiritAnimalTypeRed isCanGetZlRed

**update** (10): initBeforeData clearCtrlState updateAnimalInfoStageMaterialList setChallengeHomeType clearHomeTimer updateSAHomeTimer clearProduceDic updateSAProduceInfo clearAnimalDeployDic clearAnimalInfoDic

**other** (21): reqDataBeforeEnter regNetLit rv32010 rv32011 rv32012 rv32013 rv32014 rv32015 rv32016 rv32017 rv32018 sActiveUi buyAdvZl addHomeTimer rv32019 rv32020 rv32021 rv32022 rv32024 animalIsFight calAnimalHasNum

**ui** (34): openSpiritAnimalZlUi openSpiritAnimalHomeLevUi openSpiritAnimalHomeListUi openSpiritAnimalTypeInfoUi openSpiritAnimalHomeUpSucUi openSpiritAnimalAttTips closeSpiritAnimalAttTips openSpiritAnimalInfoUiBySuiPianId openSpiritAnimalInfoUi closeSpiritAnimalInfoUi openSpiritAnimalMainUi closeSpiritAnimalMainUi openSpiritAnimalSkillTips closeSpiritAnimalSkillTips openSpiritAnimalUpStarMainUi closeSpiritAnimalUpStarMainUi openSpiritAnimalActSuccessUi closeSpiritAnimalActSuccessUi openSpiritAnimalAttPreviewUi closeSpiritAnimalAttPreviewUi openSpiritAnimalBookUpLevelUi closeSpiritAnimalBookUpLevelUi openSpiritAnimalUpSuccessUi closeSpiritAnimalUpSuccessUi openSpiritAnimalAttTalentTips closeSpiritAnimalAttTalentTips openSpiritAnimalSkillTalentTips closeSpiritAnimalSkillTalentTips openSpiritAnimalUpStageSuccessUi closeSpiritAnimalUpStageSuccessUi openSpiritAnimalAwakeSuccessUi closeSpiritAnimalAwakeSuccessUi openSpiritAnimalDeployListUi closeSpiritAnimalDeployListUi

**predicate** (18): isCanUpLevSpirilAnimalHome isCanUpLevSpiritAnimalType isHasGetRewardByLev isCanGetRewardByLev isCheckLevelReward isCanGetHomeTypeProduceReward isBuyTermById isShowTermRedByTermId isGetNormalIdRewardByTermId isCanNormalIdRewardByTermId isGetAdvancedIdRewardByTermId isCanAdvancedIdRewardByTermId canUpStar canUpStage canUpBookStar canDeploy checkPosIsOpen checkCanBattle
