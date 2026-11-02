# LabourDayCtrl

Labour Day event.

- gInst: yes | methods: 95 (own 73) | send: 20
- own methods by kind: getter 3, redDot 11, other 26, update 1, send 20, ui 12
- name-flagged methods: reward: checkTranGodRewardRed, openKlotskiAwardUi

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send19646 | 19646 | none | no | handler not in this controller |
| send19647 | 19647 | id, is_default | no | handler not in this controller |
| send19648 | 19648 | grid_id | no | handler not in this controller |
| send19649 | 19649 | none | no | handler not in this controller |
| send19650 | 19650 | none | no | handler not in this controller |
| send19651 | 19651 | none | no | handler not in this controller |
| send19652 | 19652 | none | no | handler not in this controller |
| send19653 | 19653 | is_finish | no | handler not in this controller |
| send19654 | 19654 | none | no | handler not in this controller |
| send19655 | 19655 | unlock_link_grid_id | no | handler not in this controller |
| send19656 | 19656 | none | no | handler not in this controller |
| send19657 | 19657 | none | no | handler not in this controller |
| send19658 | 19658 | type | no | handler not in this controller |
| send19659 | 19659 | none | no | handler not in this controller |
| send19660 | 19660 | (1 arg) | no | handler not in this controller |
| send19661 | 19661 | channel, buy_gift_rebate_uid | no | handler not in this controller |
| send19662 | 19662 | buy_gift_rebate_uid | yes | handler not in this controller |
| send19663 | 19663 | buy_gift_rebate_uid | yes | handler not in this controller |
| send19664 | 19664 | buy_gift_rebate_uid, reward_bid | no | handler not in this controller |
| send19666 | 19666 | (2 arg) | no | handler not in this controller |

**getter** (3): getCurlModel getShareData getKlotskiInfo

**redDot** (11): registerRed checkGoodGiftRed checkAccGiftRed checkTranGodRewardRed checkTranGodTaskRed isShowKlotskiRed checkXunBaoRed checkTimeTaskRed checkRiseTaskRed checkShareRed checkShareFirstRed

**other** (26): reqDataBeforeEnter regNetLit sendInfo rv19646 rv19647 rv19648 rv19649 rv19650 rv19651 rv19652 rv19653 rv19654 rv19655 rv19656 rv19657 rv19658 rv19659 rv19660 rv19661 rv19662 rv19663 rv19664 rv19665 rv19666 bInActTime onRedStatusChanged

**update** (1): clearCtrlState

**ui** (12): openActMainUi openActSubView openXunBaoSelectUi openKlotskiUi openKlotskiAwardUi openKlotskiRank openKlotskiPreviewUi openPreviewUi openTaskUi openShareListUi closeTimeEvt closeActAllUi
