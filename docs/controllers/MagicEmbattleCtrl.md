# MagicEmbattleCtrl

Magic formation setup.

- gInst: yes | methods: 75 (own 52) | send: 7
- own methods by kind: getter 8, other 11, redDot 6, update 3, predicate 9, ui 8, send 7
- name-flagged methods: reward: openRewardBoxPreviewUi

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send17058 | 17058 | magic_array_bid | no | handler not in this controller |
| send32050 | 32050 | none | no | handler not in this controller |
| send32053 | 32053 | base_id | no | handler not in this controller |
| send32054 | 32054 | base_id, grow_times, material_id | no | handler not in this controller |
| send32055 | 32055 | base_id, action | no | handler not in this controller |
| send32056 | 32056 | base_id, pos, action | no | handler not in this controller |
| send32057 | 32057 | base_id | no | handler not in this controller |

**getter** (8): getCurlModel getInfoVo getFieldVo getFieldBaseIds getStarCfgVo getStarCostItemData getDeployListData getTalentDic

**other** (11): regNetLit rv32050 rv32051 rv32052 rv32053 rv32054 rv32055 rv32056 rv32057 rv17058 reqSynthesis

**redDot** (6): registerRed isUpgradeRed isCurrUpgradeRed isShowStarsRed isCurrGrowthStarRed isShowStarRed

**update** (3): initBeforeData setStarNumDic setTalentDic

**predicate** (9): isCanOpen isUpgradeRedById isShowStarRedByQuality isHasFieldBaseId isEmbattleUnlock checkEmbattleUnlock checkChipsEnough checkCanBattle checkPosCanBattle

**ui** (8): openMagicEmbattleMainUi openMagicEmbattleGrowthUi openBattleListUi closeBattleListUi openTalentInfoUi openStageTipUi openTalentLvlTipUi openRewardBoxPreviewUi
