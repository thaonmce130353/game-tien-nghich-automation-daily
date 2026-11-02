# VdoCtrl

Video playback.

- gInst: yes | methods: 54 (own 31) | send: 7
- own methods by kind: getter 3, other 16, send 7, ui 4, update 1

| Send method | Proto | Request fields | Client check | Response handler |
| --- | --- | --- | --- | --- |
| send14040 | 14040 | id | no | handler not in this controller |
| send14041 | 14041 | id, record_id | yes | handler not in this controller |
| send14042 | 14042 | id, record_id, type | no | handler not in this controller |
| send14043 | 14043 | id, record_id | no | handler not in this controller |
| send14044 | 14044 | id, record_id | yes | handler not in this controller |
| send14045 | 14045 | record_id | yes | handler not in this controller |
| send14046 | 14046 | none | no | handler not in this controller |

**getter** (3): getCurlModel getBOpenPos getGradCfg

**other** (16): reqDataBeforeEnter regNetLit rv14040 sendComEvt rv14041 rv14042 rv14043 rv14044 rv14046 pageSelect shareFunc replayGame shareGame opRslt replay opCount

**ui** (4): showVideoUi showSortLs showRecordUi showCollectUi

**update** (1): resetMainIdx
