# GodWeaponCtrl

Divine weapons.

- gInst: yes | methods: 79 (own 56) | send: 12
- own methods by kind: getter 11, other 17, redDot 3, update 2, predicate 3, ui 8, send 12

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send32300 | 32300 | none | no | handler not in this controller |
| send32301 | 32301 | none | no | handler not in this controller |
| send32302 | 32302 | none | no | handler not in this controller |
| send32303 | 32303 | star, is_up_score, affix_group_list | no | handler not in this controller |
| send32304 | 32304 | item_uid | no | handler not in this controller |
| send32305 | 32305 | none | no | handler not in this controller |
| send32306 | 32306 | item_count | no | handler not in this controller |
| send32307 | 32307 | item_uid, wear_resolve | no | handler not in this controller |
| send32308 | 32308 | none | no | handler not in this controller |
| send32310 | 32310 | part | no | handler not in this controller |
| send32311 | 32311 | part, lock_wash_attr | no | handler not in this controller |
| send32312 | 32312 | part, action | no | handler not in this controller |

**getter** (11): getCurlModel getSpeedCostId getInfoVo getSettingVo getAttrs getNewAttrs getAttrName getStrengthentotalAttrDic getPartVo getPartVoByPart getStrengthRedByPart

**other** (17): regNetLit beforeReq godWeaponSettingUi rv32300 rv32301 rv32302 rv32303 rv32304 rv32305 rv32306 rv32307 rv32308 rv32399 rv32310 rv32311 rv32312 rv32313

**redDot** (3): registerRed isShowStarRed checkStrengthRed

**update** (2): initBeforeData initPartVo

**predicate** (3): isCanOpen checkShowWearUi checkShowLvlUpUi

**ui** (8): openGodWeaponUi openAttrUi openWeaponTipUi openUseTipUi openWearUi openLvlUpUi openEntryPreviewUi openStrengthenTotalAttrUi
