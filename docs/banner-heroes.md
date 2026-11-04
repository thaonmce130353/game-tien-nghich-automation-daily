# Banner heroes (super hero events)

Static reading of the game bundle `main.min_eef72ae3.js` (observed 2026-11-02). Controller names and methods can change with any game update.

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

## Observed schedule (2026-11-02 14:45 UTC+7)

- 1320103 (Thần Lâm, hero 504020): 2026-10-30 00:00 to 2026-11-05 23:59:59.
- 1320202 (Đạp Thiên, hero 604020): 2026-10-28 00:00 to 2026-11-03 23:59:59.
- Each window is exactly 7 days; the two series start 2 days apart. Times are in seconds.
- All other banners had no activity data (`no-data`). Dates for them are not known to the client; projecting them assumes back-to-back 7-day windows and is unconfirmed.

## Banner workflow (tab "🎴 Banner")

Files: [banner-gifts-ui.js](../extension/src/content/features/banner-gifts-ui.js) (tab), [banner-gifts.js](../extension/src/content/features/banner-gifts.js) (list, gift step, one-pass runner), [banner-workflow.js](../extension/src/content/features/banner-workflow.js) (recruit / challenge / war order steps).

- The tab lists the banners open right now (read passively from the game's own banner and activity data). Ticking a banner only *selects* it in memory; nothing is sent. The workflow runs as one pass when **▶ BẮT ĐẦU TREO LEO ẢI AUTO** is pressed, with no repeat and no automatic retry. If no main feature is selected, Auto stops itself after the pass (`AUTO_FINISHED`). The main loop pauses (`bannerGiftBusy`) while it runs.
- Same steps for every hero (only names differ), in order. A failed gift step stops the rest for that banner; later steps log their failure and continue.
  1. **Quà** (view `superHeroEncoreGoodGiftUi`, requests `send19739`): each gift row's own `onBuy()`. `price > 0` (real money) is never touched; `gold == 0` is claimed; `gold == bannerGoldPrice` (300, the Tiên Ngọc gift) is bought by default; other prices are skipped. The row's button must be visible. A press is confirmed by `getGiftBuyCount` increasing after a refresh.
  2. **Chiêu Mộ**: Sảnh tab Recruit -> `reqTreasure(1)` (the "Chiêu mộ 1 lần" button). Skipped if the Chiêu Mộ trial mission (`superHeroEncore_recruit`) is already done (so a second START does not recruit again) or if the recruit item (`cfg.recruit_item`) count is below 1 (so the Get-Way popup never opens). Reward popups (`backpackGetAwardTipsUi`, `heroPreviewUi`) are closed afterwards.
  3. **Thí Luyện**: reads the DevilSea trial task list first; if the fight-count/harm mission (`AcvConst.EType.superHeroEncore_fight_count` / `_harm`) is already done, it does not fight. Otherwise Sảnh tab Fight -> `onClickFight()` (Khiêu Chiến) -> `embattleUi` auto-formation + `cBtnH2` (same as Tiên Minh) -> waits for `EntityMgr.getIsFighting()` to end (90 s cap), closing result views.
  4. **Thưởng Thí Luyện (Lệnh Chiêu Mộ)**: reopens Sảnh tab Fight so the game refreshes the fight info, waits until `checkFightRed(uid)` is true (a damage-threshold reward is reached and unclaimed), then `onClickItemSlot(slot)` on a reached slot, which claims all reached rewards at once (`send19742`). Runs even when the fight was skipped, so rewards left from an earlier fight are collected. Confirmed when `checkFightRed` turns false; reward popups are closed.
  5. **Chiến Lệnh**: Sảnh tab Zhanling -> `onClickTrial()` opens `devilSeaTrialUi`; for both task tabs it calls each claimable item's `ckickGetBtn()` (status 1, once per task), closes the view, then `onClick({target: onekeyBtn})` ("Nhận nhanh") when that button is enabled. Then, only in the banner's last 24 hours (game rule), it buys score with Tiên Ngọc (`RechargeCtrl.send12326(type, term_id, qty)`, same as the "+" button `onAddMoney`): qty is capped by points still needed, the per-term limit and `CONFIG.bannerZlBuyGold` (default 300 Tiên Ngọc per banner, tracked in sessionStorage; 0 disables), confirmed by `TransGodCtrl.getZlBuyVal` rising, then "Nhận nhanh" runs again. The premium-pass button (`onBuyBtnClick`, real money) is never touched.
- Safety: only while `isActivityOpen(uid)`; refused if a battle result, formation view or fight is active at the start; each hall tab must be unlocked (`getTabIsOpen`); the previous banner selection is restored and all opened views are closed at the end.
- CONFIG keys: `bannerAll` (true = run the daily work for every open banner; set by the "Tướng Thần Lâm / Đạp Thiên" checkbox in the "Sự kiện đang mở" tab, no per-banner selection), `bannerGoldPrice` (300) and `bannerZlBuyGold` (300).
- Passive reads only: the tab polls from page load, so it must not call `gInst()` or `getBaseConfig()`. `SuperHeroEncoreModel.getBaseConfig()` caches its result in `baseConfigDic` on first call; calling it before the game has loaded the config caches an empty table and the game then never builds the banner buttons. The code reads the existing instance (`bannerPeekInstance`) and `model.baseConfigDic` only after the game has filled them.
