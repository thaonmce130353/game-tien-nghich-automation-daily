# UpdateCtrl

Version update checks.

- gInst: yes | methods: 60 (own 33) | send: 0
- own methods by kind: predicate 10, other 15, getter 2, update 6
- name-flagged methods: purchase: checkIsMapPay

**predicate** (10): checkUpdate isRdServer checkUpdateResp checkResetLoginRes checkIsShowScsmView checkIsSkipUpdate checkIsShowKf checkIsAllKf checkIsMapPay checkIsAdShow

**other** (15): exeUpdateEvent recvClearResult loadLocalVersionFile enterloadLocalVerFile compareVersion startHotUpdate recvRemotePatchInfo errorUpdateAgain errorDownAgain goOnDownPatch httpReqFail comfireGoOnGame flushGame shutDown analyseTasteServers

**getter** (2): getSwitchType getPatchVerSaveName

**update** (6): resetUpdateStatus updateDownProgress updateCompessProgress resetRemoteInfo resetTasteServers clearPatchInfoCache
