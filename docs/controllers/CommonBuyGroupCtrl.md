# CommonBuyGroupCtrl

Shared purchase-dialog helper used by shops and events.

- gInst: yes | methods: 49 (own 25) | send: 6 | flags: purchase
- own methods by kind: getter 2, other 10, redDot 6, send 6, ui 1
- name-flagged methods: reward: backAwardStatusById, checkRebateAwardRed

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send19683 | 19683 | activity_id | no | handler not in this controller |
| send19685 | 19685 | unique_id, channel, buy_gift_rebate_uid | no | handler not in this controller |
| send19686 | 19686 | unique_id, buy_gift_rebate_uid | yes | handler not in this controller |
| send19687 | 19687 | unique_id, buy_gift_rebate_uid | no | handler not in this controller |
| send19688 | 19688 | unique_id, buy_gift_rebate_uid, reward_bid | no | handler not in this controller |
| send19689 | 19689 | unique_id, buy_gift_rebate_uid, kick_role_id | no | handler not in this controller |

**getter** (2): getCurlModel getVo

**other** (10): regNetLit rv19683 rv19684 rv19685 rv19686 rv19687 rv19688 rv19689 backAwardStatusById jumpOtherTeam

**redDot** (6): registerRed checkGLHTRed checkAnniversaryGroupRed checkDragonBoatFestRedGroupRed checkFireTreeRedGroupRed checkRebateAwardRed

**ui** (1): openTeamUi
