# LeagueCtrl

League / alliance system (guess).

- gInst: yes | methods: 112 (own 90) | send: 24
- own methods by kind: getter 4, update 2, other 29, redDot 8, predicate 3, ui 20, send 24
- name-flagged methods: reward: isShowLvlAwardRed, openLvlAwardUi

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send18200 | 18200 | none | no | handler not in this controller |
| send18201 | 18201 | name, board, flag_id, sign_id | no | handler not in this controller |
| send18202 | 18202 | none | no | handler not in this controller |
| send18203 | 18203 | none | no | handler not in this controller |
| send18204 | 18204 | none | no | handler not in this controller |
| send18205 | 18205 | id | no | handler not in this controller |
| send18206 | 18206 | none | yes | handler not in this controller |
| send18207 | 18207 | content | no | handler not in this controller |
| send18208 | 18208 | name | no | handler not in this controller |
| send18209 | 18209 | flag_id, sign_id | no | handler not in this controller |
| send18210 | 18210 | role_id, post, type | no | handler not in this controller |
| send18211 | 18211 | role_id | no | handler not in this controller |
| send18212 | 18212 | guild_id | yes | handler not in this controller |
| send18213 | 18213 | lev, type | no | handler not in this controller |
| send18214 | 18214 | none | no | handler not in this controller |
| send18215 | 18215 | guild_id, type | no | handler not in this controller |
| send18216 | 18216 | none | no | handler not in this controller |
| send18220 | 18220 | id | no | handler not in this controller |
| send18221 | 18221 | none | no | handler not in this controller |
| send18222 | 18222 | league_lv | no | handler not in this controller |
| send18223 | 18223 | none | no | handler not in this controller |
| send18224 | 18224 | type | no | handler not in this controller |
| send18225 | 18225 | none | no | handler not in this controller |
| send18226 | 18226 | role_id, item_id, allot_role_list | no | handler not in this controller |

**getter** (4): getCurlModel getLeagueInfo getApplyInfo getLeagueId

**update** (2): clearCtrlState initBeforeData

**other** (29): regNetLit beforeReq reqLeagueInfo rv18200 rv18201 rv18202 rv18203 rv18204 rv18205 rv18206 rv18207 rv18208 rv18209 rv18210 rv18211 rv18212 rv18213 rv18214 rv18215 rv18216 rv18217 rv18220 rv18221 rv18222 rv18223 rv18224 rv18225 rv18226 rv18299

**redDot** (8): registerRed isShowBagRed isShowBagByTypeRed isShowDonateRed isShowDonateByCfgRed isShowLvlAwardRed isShowAuditRed isShowActRed

**predicate** (3): isHaveLeague isShowAllotBtn isCanBagAllot

**ui** (20): openMainUi openFlagUi openHall openHallTabView openApplyUi openCreateUi openMemberSetUi openSetConfirmUi openJoinSetUi openLeagueSetUi openBoardUi openLeagueNameUi openDonateUi openLvlAwardUi openAuditUi openBagUi openBagTabView openAllotUi openLeagueActUi openAuthorityPreviewUi
