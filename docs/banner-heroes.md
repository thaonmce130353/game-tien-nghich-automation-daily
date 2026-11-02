# Banner heroes (super hero events)

Static reading of the game bundle `main.min_eef72ae3.js` (observed 2026-11-02), plus the read-only status view in the extension's probe panel. Controller names and methods can change with any game update.

## Controller map

| Controller | Role | Schedule source |
| --- | --- | --- |
| `SuperHeroEncoreCtrl` | Current re-run banner system. Several banners can exist at once, keyed by `unique_id` (`currentUniqueId`). | `getCloseTime(id)` / `getEndTime(id)` read the banner config, then `DesenoActivityCtrl` model `getActCloseTime/getActEndTime(cfg.activity)`. |
| `SuperHeroCtrl` | Older single-banner version. | `getCloseTime()` uses the fixed activity `activity_id5601`. |
| `NewSuperHeroCtrl` | Revised single-banner version. | `getCloseTime()` uses the fixed activity `activity_id7701`. |
| `DesenoActivityCtrl` | Activity hub. Holds `activity_status_dic`: per activity `status`, `close_time`, `end_time`. | Server-driven; `getActDat(activityId)` reads one entry. |

The 7-day length is not stated in the client. Open, close and end times arrive from the server through the Deseno data.

## How an Encore banner opens and closes

- `isActivityOpen(id)` is `getCloseTime(id) > NetMgr.getTime()` (server clock).
- `onActivityUpdate` re-evaluates every config under the updated activity and refreshes its banner and gift buttons.
- `checkActivity(activityId)` runs for an open activity: it requests that banner's data (`send19737`), the task data (`DevilSeaCtrl.send30040`) and the war-order term (`TransGodCtrl.send12328`), and opens the "goto get" popup if the system has not been shown.
- `onActivityClose` sets the buttons to closed, drops queued popups, closes that banner's views and resets `currentUniqueId` if it pointed at it.
- `selectActivity(id)` sets which banner the UI shows.

## Sender protocols (all take `unique_id`)

| Controller | Protocol ids |
| --- | --- |
| `SuperHeroCtrl` | 19390–19396, 19398, 19399 |
| `NewSuperHeroCtrl` | 19455–19461, 19398 |
| `SuperHeroEncoreCtrl` | 19737–19743 |

Full tables: [controllers/INDEX.md](controllers/INDEX.md).

## Read-only status view

In the HUD, open **🔍 Probe** and press **Banner hero**. It lists each banner with its `unique_id`, Deseno activity id, state (`open`, `upcoming`, `not-open`, `ended`, `no-data`), start, close and end time, and time left. **Xuất JSON** saves `tn-banner-status.json` with the raw time fields.

It calls only getters (`gInst`, `getCurlModel`, `getBaseConfig`, `getActDat`, `getActivityId`). It never calls a `send*` method and never opens a UI.

`no-data` means the server has not sent that activity yet, so its start time is unknown. Use the exported JSON to see which time fields the server actually provides.

## Implementation

- Game frame: `probeRunBanners` in [exposure-probe.js](../extension/src/content/features/exposure-probe.js).
- Panel: [exposure-probe-ui.js](../extension/src/content/features/exposure-probe-ui.js).

## Banner roster (confirmed)

Config table `super_hero_encore_data_json`, confirmed by the user on 2026-11-02. Each banner is a `unique_id` (`activity_id`) with a hero id. The two series step through `common_war_order_term_id` in order.

| Series | Banner `unique_id` | Hero id |
| --- | --- | --- |
| Thần Lâm | 1320101 | 504010 |
| Thần Lâm | 1320102 | 504030 |
| Thần Lâm | 1320103 | 504020 |
| Thần Lâm | 1320104 | 504040 |
| Thần Lâm | 1320105 | 504050 |
| Thần Lâm | 1320106 | 504060 |
| Thần Lâm | 1320107 | 504070 |
| Thần Lâm | 1320108 | 504080 |
| Đạp Thiên | 1320201 | 604010 |
| Đạp Thiên | 1320202 | 604020 |
| Đạp Thiên | 1320203 | 604030 |
| Đạp Thiên | 1320204 | 604040 |
| Đạp Thiên | 1320205 | 604050 |

Hero ids are not names; the names live in the hero config.

## Observed schedule (probe export, 2026-11-02 14:45 UTC+7)

- 1320103 (Thần Lâm, hero 504020): 2026-10-30 00:00 to 2026-11-05 23:59:59.
- 1320202 (Đạp Thiên, hero 604020): 2026-10-28 00:00 to 2026-11-03 23:59:59.
- Each window is exactly 7 days; the two series start 2 days apart. Times are in seconds.
- All other banners had no activity data (`no-data`). Dates for them are not known to the client; projecting them assumes back-to-back 7-day windows and is unconfirmed.
