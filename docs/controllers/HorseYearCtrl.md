# HorseYearCtrl

Year-of-the-Horse event.

- gInst: yes | methods: 102 (own 80) | send: 22 | flags: reward
- own methods by kind: getter 3, update 1, redDot 11, other 29, send 22, ui 14
- name-flagged methods: reward: checkTranGodRewardRed, openKlotskiAwardUi

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send19601 | 19601 | none | no | handler not in this controller |
| send19602 | 19602 | id, is_default | no | handler not in this controller |
| send19603 | 19603 | grid_id | no | handler not in this controller |
| send19604 | 19604 | none | no | handler not in this controller |
| send19605 | 19605 | none | no | handler not in this controller |
| send19606 | 19606 | none | no | handler not in this controller |
| send19607 | 19607 | none | no | handler not in this controller |
| send19608 | 19608 | none | no | handler not in this controller |
| send19609 | 19609 | none | no | handler not in this controller |
| send19610 | 19610 | none | no | handler not in this controller |
| send19611 | 19611 | is_finish | no | handler not in this controller |
| send19612 | 19612 | none | no | handler not in this controller |
| send19613 | 19613 | unlock_link_grid_id | no | handler not in this controller |
| send19614 | 19614 | none | no | handler not in this controller |
| send19615 | 19615 | none | no | handler not in this controller |
| send19617 | 19617 | task_id | no | handler not in this controller |
| send19618 | 19618 | redpacket_item_bid | no | handler not in this controller |
| send19619 | 19619 | redpacket_id | no | handler not in this controller |
| send19621 | 19621 | none | no | handler not in this controller |
| send19622 | 19622 | none | no | handler not in this controller |
| send19623 | 19623 | type | no | handler not in this controller |
| send19624 | 19624 | none | no | handler not in this controller |

**getter** (3): getCurlModel getCloseTime getKlotskiInfo

**update** (1): clearCtrlState

**redDot** (11): registerRed checkXunBaoRed checkAct3Red checkAct4Red checkGoodGiftRed checkAccGiftRed checkTranGodRewardRed checkTranGodTaskRed isShowKlotskiRed checkYJSongFuRed checkRiseTaskRed

**other** (29): reqDataBeforeEnter sendInfo onRedStatusChanged regNetLit rv19601 rv19602 rv19603 rv19604 rv19605 rv19606 rv19607 rv19608 rv19609 rv19610 rv19611 rv19612 rv19613 rv19614 rv19615 rv19617 rv19618 rv19619 rv19620 rv19621 rv19622 rv19623 rv19624 bInActTime opHarmRankUi

**ui** (14): closeTimeEvt openHorseYearMainUi openKlotskiUi openKlotskiAwardUi openKlotskiRank openKlotskiPreviewUi openYDAct openHorseYearXunBaoUi closeYDAllUi openHorseYearXunBaoSelectUi openPreviewUi openTaskUi openHorseYearRedBagUi openHorseYearRedBagInfoUi
