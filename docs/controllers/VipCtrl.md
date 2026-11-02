# VipCtrl

VIP level and privileges.

- gInst: yes | methods: 63 (own 41) | send: 6 | flags: purchase
- own methods by kind: getter 11, redDot 3, update 5, other 3, ui 4, send 6, response 7, predicate 2
- name-flagged methods: purchase: isHasBuyVipGiftByLev | reward: getGift0Red

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send12401 | 12401 | none | no | scmd12401Handler: no notable effect |
| send12403 | 12403 | task_id | no | scmd12403Handler: shows server error; re-requests send12401 |
| send12404 | 12404 | vip_lev | no | scmd12404Handler: shows server error |
| send12405 | 12405 | vip_lev | no | scmd12405Handler: shows server error; re-requests send12401,send12321 |
| send12407 | 12407 | none | no | scmd12407Handler: shows server error; updates local state |
| send12408 | 12408 | none | no | scmd12408Handler: shows server error |

**getter** (11): getCurlModel getCurShowTaskVo getTaskDataByTaskId getTaskCompleteStatus getVipShowList getTaskConfigById getTeQuanListByLev getLevelConfigByLev getJingJieName getMyJingJieName getVipValueByType

**redDot** (3): registerRed signRed getGift0Red

**update** (5): initBeforeData updateRoleAttribute clearCtrlState updateRoleData updateScmd12401

**other** (3): jingJieOpenReq regNetLit exeAfterVipUi

**ui** (4): openVipUi openJingJieCheckUi openVipSignUi openJingJieUpSuccess

**predicate** (2): isHasBuyVipGiftByLev isSignVip
