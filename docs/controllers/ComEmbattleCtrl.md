# ComEmbattleCtrl

Common formation presets.

- gInst: yes | methods: 57 (own 32) | send: 2
- own methods by kind: update 4, other 12, send 2, response 2, getter 5, ui 4, predicate 3

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send14310 | 14310 | none | no | scmd14310Handler: no notable effect |
| send14311 | 14311 | list | no | scmd14311Handler: shows server error; re-requests send14310 |

**update** (4): clearCtrlState clearTempData initTempList clearEmbattleData

**other** (12): regNetLit saveEmb saveDzrEmb embattleBackList copyToTempList changeTeam addEmbattleById delEmbattleById saveTempHeroByTeamType cAllElb autoEmbattle autoEmbattleWJDZ

**getter** (5): getSendList getEmbattleListByTeamType getEmbattleTroopId getCanPushPosByHeroList getHeroDataByRealmAndTeam

**ui** (4): openComEmbattleUi openComEmbattleWJDZUi closeComEmbattleUi clickEmbattleHeroItem

**predicate** (3): isEmbattleCanChoice isEmbattleChoice isEmbattleBaseIdChoice
