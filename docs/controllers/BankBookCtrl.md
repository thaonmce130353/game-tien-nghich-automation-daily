# BankBookCtrl

Bank-book style deposit-and-claim recharge reward (guess).

- gInst: yes | methods: 46 (own 22) | send: 3 | flags: purchase
- own methods by kind: redDot 5, other 7, send 3, predicate 1, ui 2, getter 4

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send19680 | 19680 | none | no | handler not in this controller |
| send19681 | 19681 | buy_consume_gold | no | handler not in this controller |
| send19682 | 19682 | none | no | handler not in this controller |

**redDot** (5): registerRed updateHallRed checkRed checkLongDailyRed setLongDailyRed

**other** (7): regNetLit sendInfo rv19680 rv19681 rv19682 bInActTime onRedStatusChanged

**predicate** (1): checkAddCityBtn

**ui** (2): closeTimeEvt openBankBookUi

**getter** (4): getCurDay getinterestRate getVo getCurlModel
