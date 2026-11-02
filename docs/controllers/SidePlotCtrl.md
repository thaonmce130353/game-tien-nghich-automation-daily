# SidePlotCtrl

Side story content.

- gInst: yes | methods: 63 (own 41) | send: 5
- own methods by kind: getter 5, update 5, redDot 5, other 10, send 5, ui 7, predicate 4

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send12510 | 12510 | none | no | handler not in this controller |
| send12511 | 12511 | type, story_id, chapter_id | no | handler not in this controller |
| send12512 | 12512 | story_id, chapter_id | no | handler not in this controller |
| send12513 | 12513 | story_id, chapter_id | no | handler not in this controller |
| send12514 | 12514 | story_id, chapter_id, loss_list | no | handler not in this controller |

**getter** (5): getCurlModel getStoryStatus getChatperStatus getChapterInfo getAwakeCostHeroArr

**update** (5): initBeforeData clearCtrlState updateActMainBtn updateUnlock clearTime

**redDot** (5): registerRed getWatchRed checkRed getStoryRed getCharpterRed

**other** (10): regNetLit rv12510 rv12511 rv12512 rv12513 rv12514 rv12515 onRedStatusChanged unLockDownTimeFun starFight

**ui** (7): openSidePlotUi openSidePlotContentUi openSidePlotClueUi openSidePlotFightUi openSidePlotAwakeUi openSidePlotHeroSelectUi openSidePlotTransAniUi

**predicate** (4): checkFightRedByChapterCfg checkClueRedByChapterCfg checkAwakeRedByChapterCfg checkMemoryRedByChapterCfg
