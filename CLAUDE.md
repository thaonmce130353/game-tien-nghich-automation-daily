# Project notes

Browser extension that automates the mobile game Tiên Nghịch (`tiennghich.joyplay.vn/play`, game frame on `tiennghich.acejoygame.com`). The user plays in a real, logged-in account, so every action is real.

## Language

Always reply to the user in English; the user writes prompts in English. Keep the extension's own UI text and in-game log lines (`sendLog`, HUD labels) in Vietnamese, matching the existing code and the game. Code comments in new modules may follow the surrounding file. When quoting a log line in a reply, give a short English gloss.

## Where things are

- Game-controller research lives under `docs/`. Start at `docs/README.md`; it says which single file to read. Do not read `docs/game-client/` or `docs/data/*.json` in full (proprietary bundle; grep a targeted identifier at most, never copy it).
- To see one method's source use `node scripts/bundle-method.js <Ctrl> <method>`.
- `extension/content.js` is generated. Edit `extension/src/content/`, then run `node scripts/build-content.js`. New source files must also be added to `allSourceFiles` in `scripts/build-content.js`, and after building check the new functions really are in `content.js` (`grep -c "function <name>" extension/content.js`).
- `scripts/watch-content.js` may be running on the user's PC with an in-memory file list. If it overwrites a build and drops new files, stop it and restart it.
- `extension/src/content/` layout: `game-bridge.js` (shared helpers and message bridge), `game-hooks.js` (fight skip, battle handling), `features/scheduler.js` (dispatch by `CONFIG.activeFeature`), one module per feature in `features/`, UI in `ui-*.js`. All files share one scope; function declarations hoist.
- Development phase: every build includes all files, the Probe (`features/exposure-probe*.js`) too; there is no `--no-local` option and a missing source file fails the build. The Probe is tracked in git like any other source; remove it from `allSourceFiles` and from `content.js` before any public release.

## Conventions for a feature module

- Feature rows in `ui-markup.js` use the plain game name as title (`.tn-feat-name`, emoji + name, no [Mx] prefix); details go in the description. Sub-settings never sit under the row: add the key to `FEATURE_SETTINGS` in `ui-settings.js` (fields, `summary()` shown as the "⚙ ..." line under the description) plus a `<button class="tn-gear-btn" data-gear="<key>">` next to the title; the gear opens a popup inside the HUD.
- Game logic stays in its feature module; touch UI/config/scheduler only when needed (a mutex checkbox is `class="tn-mutex-feature" data-key="<configKey>"` in `ui-markup.js`, and the scheduler needs a branch for that key).
- One action per scheduler tick; return true when it acted. Ticks that only wait for the server or move between sub-steps should not be paced like a real action: Nhận Cuối Ngày and Tâm Tiên Đài return `'wait'` for them (set `cuoiNgayDidSend` / `tamTienDidSend` at each real open/send/click) so the scheduler re-checks within ~40ms; the scheduler also ticks faster and skips the random long pause for `FAST_ROUTINE_FEATURES`. A feature that gives up on its target (Vực U Minh: `abyssGaveUp`) should say so in `runFinishProbe` (optionally with a `reason`) instead of waiting for the 90s idle finish. Multi-step flows are small state machines (`state.phase`).
- Reuse the shared helpers in `game-bridge.js` / `features/`: `sendLog`, `humanDelay` (randomized pacing), `tryAttemptTarget` / `clearTargetAttempts` (3 tries per target per run), `logUnsupportedOnce`, `runResetHooks`, `pollTowerDailyRefresh` (send a refresh, wait until a data token changes), `warOrderClaimStep` (Chiến Lệnh claim), `parseLongVal` / `parseUidVal`.
- Success is logged only when game state confirms it (a refreshed server value changed). "Đã gửi/Đã bấm" lines mean sent only. On a missing reply log an error and do not resend.
- Never buy, spend Tiên Ngọc or paid items unless the feature is explicitly about it. Counters that guard spending (e.g. special-item uses) must be counted at send time and survive page reloads via `sessionStorage`.
- Pause all actions while the game shows the disconnect dialog; auto-reconnect (`features/auto-reconnect.js`) reloads the page and resumes Auto. Anything counted per run must be restart-safe, and one-shot flows (Banner) must not re-run after a reconnect.
- Run lifecycle (`game-bridge.js`, `scheduler.js`): ONE feature runs at a time (`CONFIG.activeFeature`; Banner is `autoBanner`). A feature ends the run itself: add its `done` state to `runFinishProbe` (scheduler.js), or it finishes after 90s with nothing to do; `runFinish(reason)` logs one "Hoàn tất" line and stops the Auto button. When a `done` state is detected the scheduler first runs the handler one more tick, so put screen-closing and the summary line in the handler's `done` branch (Tiên Minh `finishTienMinh` does; it also closes every open `guild*` view to return to the main screen). Only Thông Thiên Tháp (`autoTongTian`) runs until the user stops it. Stop calls `runAbort()` -> `resetUnfinishedRunStates()`: reset every new module state there unless its phase is `done` (keep today's `done` records so work and purchases are not repeated). Async flows must be cancellable (Banner rejects in `bannerSleep`).
- QUÉT NHANH button = sequencer in `features/quick-run.js` (`QUICK_RUN_QUEUE`, Nhận Cuối Ngày last): each step is a normal single-feature run (`runBegin` ... `runFinish`; `runFinish` calls `quickRunAfterStep` to continue instead of stopping), a failed/stuck step (10 min cap) logs a warning and the queue continues. Between steps it closes views that were not open when it started. While it runs, HUD `UPDATE_CONFIG`/`TOGGLE_AUTO` cannot overwrite `activeFeature`/`running`/`towerSweepOnly`/`towerDailyRoutine` (`quickRunFilterConfig`). Stopping saves progress in sessionStorage `tn-quick-run-saved` (next step index + results, same day only); the game frame reports it to the HUD (`QUICK_RUN_SAVED`), which turns the button into TIẾP TỤC QUÉT NHANH plus a CHẠY LẠI TỪ ĐẦU button (`quickMode` resume|fresh). Thông Thiên uses `CONFIG.towerSweepOnly` (daily routine only, no climbing, finishes when `towerDailyState.phase==='done'`).
- Logging: the HUD shows only levels `result` (purchases, confirmed claims/rewards, summaries), `run` (start/finish/stop/reconnect), `warn`, `err`/`error`. `info`/`action` step lines are hidden unless the "Log chi tiết" checkbox (`CONFIG.verboseLog`) is on. Use `result` only for something gained or spent that the server confirmed.
- Formation screen (`embattleUi`): never call `saveEmbattleLogic` right after the quick arrange (the slots may not have refreshed and an empty team gets saved). Use `embattleStep` / `embattleMarkStarted` (game-bridge.js): press "Lên trận nhanh" (`oneKeyEmbattleLogic`), verify the slots are filled (`embattleTeamReady`, which also runs the board's own condition check for Bí Cảnh), and only then press "Bắt đầu" (`cBtnH2`, which saves the team itself). After 3 failed arranges do not start the fight: log an error and close the board.
- Game-call contracts (check the real UI caller in the bundle before calling a controller method): Bí Cảnh `cliFaSelItem(button, baseConfigVo, listEntry)` needs the dungeon base config (`model.getDungeonBaseConfigVo(id)`, has `.id`) as 2nd argument, otherwise the formation arrange throws; PB Ngày sweep is free only: `send11002(0)` guarded by `getAllMianFeiNum(true) > 0`; `send11002(1)` is the Tiên Ngọc sweep and must never be sent. Ma Đạo Ủy Phái: the only work is spending travel points (2000 each) to dispatch NEW Sử Thi+ jobs; `TravelCtrl.send30203` (tăng tốc/early finish, paid by remaining time) must never be sent, `send30205` only claims jobs whose timer already ended, and the only Tiên Ngọc use is the list refresh (expected 30 each; the code measures the real cost and stops if it exceeds that).
- Battles: add the fight type to the skip list in `game-hooks.js` (`n.<type>`) so fights are skipped. Features that drive their own `embattleUi` must be listed in the exemption in `handleBattle`.

## Investigating a feature (do this before coding)

1. `docs/controllers/INDEX.md` and `bundle-method.js` for senders, response handlers and view classes. Do not call unknown controller methods against the live game.
2. To find the right controller/view, use the Probe in the live game: open the screen, then Probe → "Màn hình mở" (lists open view names and method names, read-only). Exports are named `docs/data/tn-open-views-<screen>.json`. Read them before guessing a controller.
3. Class names of views are in the bundle as `window.<Name>=`; click handlers and `send1xxxx` calls show the real flow. Config tables are exposed by model getters (for example `ExtremeYinCtrl.getCurlModel().getBuildConfig()`).

## Validation

- `node scripts/build-content.js` then `node scripts/validate-content.js` (syntax only). There is no unit-test suite; validate with a Node VM simulation: load `extension/content.js` in `vm` with a mocked window (fake clock, fake `ViewMgr`/controller objects modelled on the game source), post `TIEN_NGHICH_AUTO_HUD` `TOGGLE_AUTO`, advance time and read the logs. Cover happy path, server-not-confirming and low-resource cases.
- Then validate on the live game (below) when the user allows it. Do not report a feature as working until its confirmation line appeared live.

## Live game validation (Claude in Chrome)

Tools are deferred: load them with one ToolSearch (`select:mcp__claude-in-chrome__tabs_context_mcp,...navigate,computer,browser_batch,get_page_text,read_console_messages,tabs_create_mcp,tabs_close_mcp`). The browser may be Edge or Chrome; check `list_connected_browsers`.

- Create your own tab group (`tabs_context_mcp` with `createIfEmpty: true`) and open `https://tiennghich.joyplay.vn/play` there. Ask the user to close their own game tab first (a second login can kick the first). Do not rely on tabs the user drags into the group; the group tends to disappear.
- EVERY time the game page is loaded or refreshed (navigate, F5), it stops on the login screen: click "Vào game" (about (785, 590) in the ~1568x775 frame; screenshot first, the frame size varies) and wait 10-20s until the main city shows before doing anything else. If it does not enter after 2-3 clicks the account is probably logged in elsewhere: stop and tell the user instead of hammering. The HUD is visible on the login screen, so HUD-only checks need no login.
- I cannot open `chrome://extensions`. The dev worker (`extension/background.js`) reloads only the extension after a build; I must refresh the game page myself (and if the page loaded before the extension finished reloading, refresh once more). If the worker is not installed or inactive, ask the user to reload the extension and say "reloaded".
- HUD (extension panel, top-left): tab buttons at y≈101 (Lịch Luyện x≈390, "Sự kiện đang mở" x≈510; there is no Tu Sĩ tab), feature checkboxes at x≈537, START/TẠM DỪNG at x≈188 (y moves with the list height, about 455-620; screenshot first). The game canvas is the narrow column around x 605-963. The Probe button is at the top-right of the page (draggable; its panel no longer covers START).
- Read results from the HUD log: `get_page_text` returns the full log text; screenshots/zooms for visuals. `read_console_messages` only sees the top frame, the game frame is cross-origin.
- `wait` accepts at most 10s per action and a batch of many waits can time out; use ≤6 waits per batch.
- A stalled run with an empty log usually means the loaded build is stale or broken, not the game: compare the HUD feature texts with the source, and grep `content.js`.
- Pressing START on a real account needed an explicit approval from the user in chat the first time. Authorization is recorded in the memory notes `live-validation-scope` and `live-validation-vao-game`. Stay inside what is authorized, pause Auto (TẠM DỪNG) before anything not authorized, and never enter passwords or buy anything.
- Network drops happen (screen lock throttles the tab). Check the screen for the "Nhắc nhở / Đăng nhập lại" dialog before judging a stall; auto-reconnect should recover it.

## Feature status (update when it changes)

Live-validated: Cổ Thần Địa (incl. item use: the server refuses the seal on the floor Leader, so the step ends cleanly), Chiến Lệnh claim step, auto-reconnect page-reload path, Cực Âm Địa sync/wait and Chiến Lệnh check, M6 Ảo Cảnh (one claim after the last round claims every milestone), Banner run (only the "nothing to do" path seen).
Simulated only (Node), never seen live: M3 Thủ Vệ Tứ Phái, Cửu Uyển Nhi sweep (event was closed), Cực Âm Địa land pick/seat grab/Đoạt/claim, M5 Di Tích Tiên Giới (`immortal-relic.js`, `RainRuinsCtrl`; open 10:00-22:00), M2 Bí Cảnh Tứ Quốc (`bi-canh-tu-quoc.js`; fight skip assumes fight type `n.dungeon`), M7 Kiếm Hành/Điêu Long, Ma Đạo incl. Ủy Phái, Banner Quà gold-row purchase and Chiến Lệnh score buy (game only allows it in the banner's last 24h), the sign-refresh hook before reconnect, and the run lifecycle (self-finish, stop/reset, filtered log; HUD part checked in the browser). M2's PB Ngày part is still a stub (`daily-and-bi-canh.js`); find its controller with the Probe (`dailyDungeonSysUi`).
Dev hot-reload: `extension/background.js` reloads only the extension when a build rewrites the git-ignored `extension/dev-reload.json` (needs one manual extension reload to install it). The worker shows "(Inactive)" when idle; normal for MV3, but then hot-reload is not armed.

| Feature | Controller / views | Flow in one line |
| --- | --- | --- |
| Thủ Vệ Tứ Phái (M3) | `ETCtrl`; `eTMainUi`, `embattleUi`, `eTBfUi`, `zhanLingUi` | status (11030) → Khiêu Chiến + auto team → pick middle buff after each battle (`choiceBuffId`) → run over → milestone reward (`sd11032`, `gNextSTRwId`) → Chiến Lệnh type 2 |
| Cửu Uyển Nhi (M4a) | `MzCtrl`; `mzUi` | open maze, if `saoDangBtn.visible` send `sd20221`, confirm by `isCAwrd` |
| Cổ Thần Địa (M4b) | `AdvCtrl`; `adventureMainUi/FightUi/UseSpecialUi/TarAwardUi` | pick heroes if none, fight grids 17,19,9,7 then 13, door grid (`eType` 99999, `send11063`) to next floor, loop until heroes exhausted (cap 200 floors), item `send11079` up to 5, rewards `send11084` |
| Cực Âm Địa | `ExtremeYinCtrl`; `extremeYinExerciseUi`, `embattleUi` (jyzd) | six lands from config; claim `send32204`; pick land ≥ Huyền Âm with power above the weakest third; guard fight `send32202`; full → beat weaker player `send32205`; Đoạt `send32206` with free attempts only; then Chiến Lệnh type 6 |
| Chiến Lệnh | `RechargeCtrl`; `zhanLingUi` | free claimable rewards only (`isCanNormalIdRewardByTermId`), claim `send12322(type, term)`, confirm by recount |
| Ảo Cảnh (M6) | `FaZhenMirageCtrl`; `faZhenMirageMainUi`, `fmDazzlingResultUi` | `send32061` start → `send32062` pairs → repeat until reward rounds are used → one `send32064` claims all milestones |
| Banner (Tướng Thần Lâm / Đạp Thiên) | `SuperHeroEncoreCtrl`; `superHeroEncoreHallUi`, `superHeroEncoreGoodGiftUi` | all open banners: gift rows (free + 300 Tiên Ngọc, never `price` rows; `send12323`) → Chiêu Mộ → Thí Luyện → task points → Chiến Lệnh Nhận nhanh; last 24h only: buy score `send12326`; details in `docs/banner-heroes.md` |

Server pacing: the game also kicks sessions ("Xác minh đăng ký thất bại"); do not hammer requests.

## Request template (short prompts are enough)

`Feature: <name> (<screen>)` / `Expected: <ordered steps, what to pick, when to stop>` / `Live test: allowed or not (which actions; never real-money purchases)`. I read this file, `docs/` and the live screens myself.
