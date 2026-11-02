# GuildCtrl

Guild: membership, donation, tasks.

- gInst: yes | methods: 254 (own 232) | send: 58
- own methods by kind: getter 8, redDot 18, update 5, other 81, predicate 15, ui 47, send 58
- name-flagged methods: reward: checkDungeonPassRewardRed, closeGuildActiveAwardUi, closeGuildFeteAwardUi, openGuildActiveAwardUi, openGuildFeteAwardUi

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send18000Msg | 18000 | none | no | handler not in this controller |
| send18001Msg | 18001 | none | no | handler not in this controller |
| send18002Msg | 18002 | name | no | handler not in this controller |
| send18003Msg | 18003 | name, board, join_type, need_lev, flag_id, banner | no | handler not in this controller |
| send18004Msg | 18004 | id | yes | handler not in this controller |
| send18005Msg | 18005 | none | yes | handler not in this controller |
| send18006Msg | 18006 | none | no | handler not in this controller |
| send18008Msg | 18008 | role_id, post | no | handler not in this controller |
| send18009Msg | 18009 | role_id | yes | handler not in this controller |
| send18012Msg | 18012 | content | no | handler not in this controller |
| send18013Msg | 18013 | type, lev | no | handler not in this controller |
| send18014Msg | 18014 | none | no | handler not in this controller |
| send18015Msg | 18015 | role_id, type | no | handler not in this controller |
| send18019Msg | 18019 | name | no | handler not in this controller |
| send18020Msg | 18020 | none | no | handler not in this controller |
| send18021Msg | 18021 | role_id | no | handler not in this controller |
| send18025Msg | 18025 | none | no | handler not in this controller |
| send18026Msg | 18026 | none | no | handler not in this controller |
| send18030Msg | 18030 | none | no | handler not in this controller |
| send18031Msg | 18031 | career | no | handler not in this controller |
| send18032Msg | 18032 | career | no | handler not in this controller |
| send18035Msg | 18035 | none | no | handler not in this controller |
| send18036Msg | 18036 | type | no | handler not in this controller |
| send18037Msg | 18037 | num | no | handler not in this controller |
| send18040Msg | 18040 | none | no | handler not in this controller |
| send18041Msg | 18041 | pos, base_id | no | handler not in this controller |
| send18042Msg | 18042 | id, pos | no | handler not in this controller |
| send18043Msg | 18043 | pos | no | handler not in this controller |
| send18044Msg | 18044 | none | no | handler not in this controller |
| send18046 | 18046 | none | no | handler not in this controller |
| send18047 | 18047 | none | no | handler not in this controller |
| send18050Msg | 18050 | none | no | handler not in this controller |
| send18051Msg | 18051 | id | no | handler not in this controller |
| send18052Msg | 18052 | none | no | handler not in this controller |
| send18053Msg | 18053 | id | no | handler not in this controller |
| send18054Msg | 18054 | id | no | handler not in this controller |
| send18055Msg | 18055 | none | no | handler not in this controller |
| send18056Msg | 18056 | none | no | handler not in this controller |
| send18057Msg | 18057 | type | no | handler not in this controller |
| send18060 | 18060 | none | no | handler not in this controller |
| send18061 | 18061 | none | no | handler not in this controller |
| send18062 | 18062 | realm, star | no | handler not in this controller |
| send18064 | 18064 | (3 arg) | yes | handler not in this controller |
| send18065 | 18065 | realm, mibao_id | no | handler not in this controller |
| send18066 | 18066 | (4 arg) | no | handler not in this controller |
| send18067 | 18067 | realm, grow_time | no | handler not in this controller |
| send18068 | 18068 | realm | no | handler not in this controller |
| send18069 | 18069 | dun_id | no | handler not in this controller |
| send18070 | 18070 | none | no | handler not in this controller |
| send18071 | 18071 | none | no | handler not in this controller |
| send18072 | 18072 | none | no | handler not in this controller |
| send18140 | 18140 | flag | no | handler not in this controller |
| send18141 | 18141 | none | no | handler not in this controller |
| send18142 | 18142 | none | no | handler not in this controller |
| send18143 | 18143 | none | no | handler not in this controller |
| send18144 | 18144 | none | no | handler not in this controller |
| send18145 | 18145 | none | no | handler not in this controller |
| send18147 | 18147 | none | no | handler not in this controller |

**getter** (8): getCurlModel getGuildDungeonUnitId getGuildPostRes getCanForgeMaxStar getbestCount getNextOpenTime getAskedChallengeUnitId getBargainInfo

**redDot** (18): registerRed isShowTreasureGrowthRed isShowTreasureBagRed isShowTreasureForgeStarsRed isShowTreasureForgeStarRed setGuildAskedCondRed checkFateRed checkDungeonFightCountRed checkDungeonPassRewardRed checkActiveRed checkMyHelpRed checkMemberHelpRed checkAllSkillRed checkGuildSkillRed checkGuildWarRed checkGuildAskedRed checkGuildAskedCondRed checkGuildBargainRed

**update** (5): initBeforeData clearCtrlState updateBackpackProp updateAttr setBagPropIds

**other** (81): sendEvt regNetLit onCrossSky sd18048 rv18048 rv18023 rv18000 rv18001 rv18002 rv18003 rv18004 rv18005 rv18006 rv18008 rv18009 rv18010 rv18012 rv18013 rv18014 rv18015 rv18016 rv18017 rv18018 rv18019 rv18020 rv18021 rv18022 rv18024 rv18025 rv18026 rv18027 rv18030 rv18031 rv18032 rv18035 rv18036 rv18037 rv18040 rv18041 rv18042 rv18043 rv18044 rv18045 rv18046 rv18047 rv18050 rv18051 rv18052 saveGuildDungeonFightData rv18053 rv18054 rv18055 rv18056 rv18057 rv18058 rv18059 rv18099 rv18060 rv18061 rv18062 rv18063 rv18064 rv18065 rv18066 rv18067 rv18068 rv18069 rv18140 rv18141 rv18142 rv18143 rv18144 rv18145 rv18146 rv18147 askedIsRealOpen askedIsOpneToTips crossDayCheckAskedState rv18070 rv18071 rv18072

**predicate** (15): checkJoinGuild checkIsHaveGuild isPlatShowPromotion isShowTreasureGrowthRedByRealm checkChangeTreasure isShowTreasureBagRedByRealm isShowTreasureForgeRedByStartAndRealm isHasForgeCnt checkCanForgeByStartAndRealm canJoinAskedUi checkSkillRedByTabIdx checkGuildInfo isLeader isScoutLeaderLeader isHasGuild

**ui** (47): openGuildMainFunc openGuildCreateUi openGuildDungeonUiWithOut openGuildDungeonUi openGuildTreasureUi openGuildJoinSettingUi closeGuildJoinSettingUi openGuildManagerSettingUi closeGuildManagerSettingUi openGuildChangeNoticeUi closeGuildChangeNoticeUi openGuildChangeNameUi closeGuildChangeNameUi openGuildActiveUi openWanFaHallUi closeGuildActiveUi openGuildActiveAwardUi closeGuildActiveAwardUi openGuildSkillUi closeGuildSkillUi openGuildSkillResetUi openGuildFeteUiWithOut openGuildFeteUi closeGuildFeteUi openGuildFeteAwardUi closeGuildFeteAwardUi openGuildHelpUi closeGuildHelpUi openGuildHelpSelectUi closeGuildHelpSelectUi openGdMailUi closeGdMailUi openGuildDunPassRwUi openActivityHallUi showTreasureConfirmationUi showTreasurePropTipsUi showTreasurePropCompareTipsUi showTreasureWashUi showTreasureDisassembleUi openGuildAskedUi openGuildHallUi openGuildAskedRecordUi openGuildAskedRankUi openGuildAskedFightResultUi closeAllAskedUI showGuildBargainView showGuildNotBargainView
