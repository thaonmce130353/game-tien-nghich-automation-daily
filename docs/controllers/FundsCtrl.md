# FundsCtrl

Growth / investment funds with staged rewards.

- gInst: yes | methods: 38 (own 15) | send: 2 | flags: purchase
- own methods by kind: getter 4, other 3, update 1, ui 2, send 2, response 2, predicate 1
- name-flagged methods: reward: getAwardCfg, getAwardList, getRewardHis, openFundsAwardView

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send12303 | 12303 | none | no | on12303: no notable effect |
| send12304 | 12304 | reward_id | no | on12304: shows server error; re-requests send12303 |

**getter** (4): getCurlModel getAwardCfg getAwardList getRewardHis

**other** (3): reqDataBeforeEnter regNetLit sd12303Hdr

**update** (1): clearCtrlState

**ui** (2): openFundsMainView openFundsAwardView

**predicate** (1): checkCanGet
