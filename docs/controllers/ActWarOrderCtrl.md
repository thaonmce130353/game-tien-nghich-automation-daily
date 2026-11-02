# ActWarOrderCtrl

Activity battle pass ("war order" / Chiến Lệnh): tiered rewards, paid track.

- gInst: yes | methods: 46 (own 24) | send: 1 | flags: reward
- own methods by kind: getter 3, update 2, other 9, redDot 6, send 1, ui 3
- name-flagged methods: purchase: getWarOrderRed, openActWarOrderHall | reward: getBoxRewardRed, receive19446, receive19447, receive19448

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send19447 | 19447 | none | no | handler not in this controller |

**getter** (3): getCurlModel getItemIdByDay getCfg

**update** (2): clearCtrlState initIdDay

**other** (9): reqDataBeforeEnter toRequestServerData regNetLit req19446 receive19446 receive19447 receive19448 recevie19449 onRedStatusChanged

**redDot** (6): updateHallRed registerRed getWarOrderRed getDailyGiftRed getTaskRed getBoxRewardRed

**ui** (3): openActWarOrderHall openRankView closeTimeEvt
