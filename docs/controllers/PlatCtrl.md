# PlatCtrl

Platform and SDK integration, sharing, platform activities.

- gInst: yes | methods: 194 (own 173) | send: 15
- own methods by kind: getter 9, redDot 9, update 12, other 30, predicate 53, send 15, ui 45
- name-flagged methods: reward: canGetAward, canGetBlDesktopAward, canGetBlEdgeAward, canGetMeituanDesktopAward, canGetMeituanFtenuseAward, canGetMeituanSubscribeAward, canGetTiktokBindAward, canGetTiktokDesktopAward, canGetTiktokEdgeAward, canGetTiktokSubScribeAward, canGetWxRyjlAddDesktopAward, canGetWxRyjlLaunchGiftAward, canGetZhifubaoFuFangAward, canGetZhifubaoShouFangAward, isGotAward, rvGetAward, sendGetAward

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send30133 | 30133 | none | no | handler not in this controller |
| send30135 | 30135 | none | yes | handler not in this controller |
| send30136 | 30136 | none | no | handler not in this controller |
| send30137 | 30137 | (1 arg) | no | handler not in this controller |
| send30138 | 30138 | none | no | handler not in this controller |
| send30139 | 30139 | none | yes | handler not in this controller |
| send30140 | 30140 | (1 arg) | no | handler not in this controller |
| send30145 | 30145 | none | no | handler not in this controller |
| send30146 | 30146 | (1 arg) | no | handler not in this controller |
| send30147 | 30147 | none | no | handler not in this controller |
| send30148 | 30148 | none | no | handler not in this controller |
| send30149 | 30149 | none | no | handler not in this controller |
| send30150 | 30150 | none | no | handler not in this controller |
| send30151 | 30151 | (1 arg) | no | handler not in this controller |
| send30152 | 30152 | none | no | handler not in this controller |

**getter** (9): getCurlModel getBenefitGift getTaskById getShouFangStatus getShouFangStatusSuccess getShouFangStatusFail getIsTtEdgeLoginGet getIsZFBLoginGet getIsHWCollectGiftGet

**redDot** (9): registerRed updateWxRyjlLaunchGiftRed ttEdgeLoginRed zfbLoginRed zfbGoToPcRed zfbRebateRed hwCollectGiftRed isShowHkFacebookRed isShowVnFacebookRed

**update** (12): initBeforeData clearCtrlState updateRoleInfo updateRAttr updateTaskInfo updateEdgeData updateDesktopData updateLaunchGiftData updateSubscribeData updateOnShowData setZFBGotoPcViewTime setTestShareId

**other** (30): reqDataBeforeEnter regNetLit onCrossSky syncUpLvl onChangeLev rvBaseInfo rvGetAward rv30135Res rv30136Res rv30137Res rv30138Res rv30139Res rv30140Res onRedStatusChanged reqBenefitInfo reqWxFriendShare reqTkFriendShare sendGetAward addTxDesktopIcon reportEnterScene rv30145 rv30146 rv30147 rv30149 rv30150 rv30151 sendSlapFaceHttp rspHttpCallFunc reqTapJumpUrl rspTapJumUrl

**predicate** (53): checkHKEvaluate checkHKSuperVip checkHKBindEmail checkVnEvaluate checkVnSuperVip checkVnBindEmail checkAddBenefitCityBtn checkAddMeituanFtenuseIcon checkAddMeituanSubsribeIcon checkAddMeituanDesktopIcon checkAddWxRyjlDesktopIcon checkAddWxRyjlLaunchGiftIcon checkVnTiktokAddDesktopIcon checkVnTiktokSidebarIcon checkAddTiktokDesktopIcon checkAddTiktokEdgeIcon checkAddTiktokEdgeLoginIcon checkAddTktokSubScribe checkAddBlDesktopIcon checkAddBlEdgeIcon checkZhiFuBaoShouFuFangIcon checkWxFriendShareIcon checkTkFriendShareIcon canGetBenefitGift canGetTaskStatu isGotAward canGetAward canGetMeituanDesktopAward canGetMeituanSubscribeAward canGetMeituanFtenuseAward canGetTiktokEdgeAward canGetTiktokDesktopAward canGetWxRyjlAddDesktopAward canGetWxRyjlLaunchGiftAward canGetTiktokSubScribeAward canGetBlEdgeAward canGetBlDesktopAward canGetZhifubaoShouFangAward canGetZhifubaoFuFangAward canGetTiktokBindAward checkTiktokFeedGameScene checkAddZFBGotoPcCityBtn checkAddZFBRebateCityBtn checkAddZFBOneGiftCityBtn checkAddWxOneGiftCityBtn checkAddZFBLoginIcon checkAddQQHallCityBtn checkAddQQDaWanKaCityBtn checkVnVipUi checkAddHWCollectGiftIcon checkTapJumpIcon checkHkFacebookCityBtn checkVnFacebookCityBtn

**ui** (45): openTiktokEdge openTiktokDesptop openWxRyjlAddDesktopUi openWxRyjlLaunchGiftUi openTiktokSubscribeUi openVnTiktokDesktop openTiktokSidebar openMeituanDesktop openMeituanSubscribe openMeituanFtenuse openHKEvaluateUi openHkBindEmailUi openHKSuperVIPUi openVnEvaluateUi openVnBindEmailUi openVnSuperVIPUi openZhifubaoShouFangUI closeZhifubaoShouFangUI openZhifubaoFuFangUI closeZhifubaoFuFangUI openBlAddDesktopUi closeBlAddDesktopUi openBlEdgeUi closeBlEdgeUi openBBenefitGiftUi closeBenefitGiftUiUi openTiktokItationCodeUi closeTiktokItationCodeUi openTiktokEdgeLoginUi openZFBGotoUi openZFBRebateUi openZFBOneGiftUi openWeixinOneGiftUi openZFBLoginUi closeTiktokEdgeLoginUi openWxFriendShareUi closeWxFriendShareUi openTkFriendShareUi closeTkFriendShareUi openTxMediumUi openRecruitScene openHangScene openHWCollectGiftUi openHkFacebookTabView openVnFacebookTabView
