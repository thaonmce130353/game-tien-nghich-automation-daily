# EmailCtrl

Mailbox: list, read, claim attachments.

- gInst: yes | methods: 50 (own 27) | send: 5 | flags: reward
- own methods by kind: other 5, update 2, ui 3, getter 3, redDot 2, send 5, response 6, predicate 1
- name-flagged methods: reward: isCanReward

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send16000 | 16000 | none | no | scmd16000: updates local state |
| send16001 | 16001 | ids | no | handler not in this controller |
| send16002 | 16002 | ids | no | handler not in this controller |
| send16004 | 16004 | id | no | handler not in this controller |
| send16007 | 16007 | type | no | scmd16007: shows server error; re-requests send16000 |

**other** (5): reqDataBeforeEnter regNetLit delMail delAllMail paraseInfo

**update** (2): clearCtrlState setRedStatus

**ui** (3): openElUi openElInfoUi openUrl

**getter** (3): getCurlModel getDelListByType getMailList

**redDot** (2): redMail isShowTabRed

**predicate** (1): isCanReward
