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
- Local-only, git-ignored: the Probe (`features/exposure-probe*.js`). Build with `--no-local` before committing `content.js`.

## Conventions for a feature module

- Game logic stays in its feature module; touch UI/config/scheduler only when needed (a mutex checkbox is `class="tn-mutex-feature" data-key="<configKey>"` in `ui-markup.js`, and the scheduler needs a branch for that key).
- One action per scheduler tick; return true when it acted. Multi-step flows are small state machines (`state.phase`).
- Reuse the shared helpers in `game-bridge.js` / `features/`: `sendLog`, `humanDelay` (randomized pacing), `tryAttemptTarget` / `clearTargetAttempts` (3 tries per target per run), `logUnsupportedOnce`, `runResetHooks`, `pollTowerDailyRefresh` (send a refresh, wait until a data token changes), `warOrderClaimStep` (Chiến Lệnh claim), `parseLongVal` / `parseUidVal`.
- Success is logged only when game state confirms it (a refreshed server value changed). "Đã gửi/Đã bấm" lines mean sent only. On a missing reply log an error and do not resend.
- Never buy, spend Tiên Ngọc or paid items unless the feature is explicitly about it. Counters that guard spending (e.g. special-item uses) must be counted at send time and survive page reloads via `sessionStorage`.
- Pause all actions while the game shows the disconnect dialog; auto-reconnect (`features/auto-reconnect.js`) reloads the page and resumes Auto. Anything counted per run must be restart-safe, and one-shot flows (Banner) must not re-run after a reconnect.
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
- I cannot open or click `chrome://extensions` / `edge://extensions` (blocked). After any rebuild the user must reload the extension themselves and say "reloaded". Then: navigate to the game URL, wait ~10s, click "Vào game" at about (785, 580) in the 1568x775 frame, wait ~10s. The user asked for this every time.
- HUD (extension panel, top-left): tab buttons at y≈93 (Lịch Luyện at x≈395), feature checkboxes at x≈491, START/TẠM DỪNG button at x≈172 and y≈484-524 (it moves with the list height; screenshot first). The game canvas is the narrow column around x 605-963.
- Read results from the HUD log: `get_page_text` returns the full log text; screenshots/zooms for visuals. `read_console_messages` only sees the top frame, the game frame is cross-origin.
- `wait` accepts at most 10s per action and a batch of many waits can time out; use ≤6 waits per batch.
- A stalled run with an empty log usually means the loaded build is stale or broken, not the game: compare the HUD feature texts with the source, and grep `content.js`.
- Pressing START on a real account needed an explicit approval from the user in chat the first time. Authorization is recorded in the memory notes `live-validation-scope` and `live-validation-vao-game`. Stay inside what is authorized, pause Auto (TẠM DỪNG) before anything not authorized, and never enter passwords or buy anything.
- Network drops happen (screen lock throttles the tab). Check the screen for the "Nhắc nhở / Đăng nhập lại" dialog before judging a stall; auto-reconnect should recover it.

## Feature status (update when it changes)

Live-validated: Cổ Thần Địa (M4b), Chiến Lệnh claim step, auto-reconnect, Cực Âm Địa sync/wait and Chiến Lệnh check.
Simulated only: Thủ Vệ Tứ Phái (M3), Cửu Uyển Nhi sweep (event was closed on the account), Cực Âm Địa land pick, seat grab, Đoạt and claim.
Implemented in source but not validated by me (check `git log` / the file header before assuming): M6 Ảo Cảnh (`FaZhenMirageCtrl`, `memory-minigame.js`).
Not implemented (they log an "unsupported" line and send nothing): M5 Di Tích, M7 Kiếm Hành/Điêu Long, Ủy Phái Ma Đạo. Their old code called controllers that do not exist in this game build; find the real controller with the Probe before implementing.

| Feature | Controller / views | Flow in one line |
| --- | --- | --- |
| Thủ Vệ Tứ Phái (M3) | `ETCtrl`; `eTMainUi`, `embattleUi`, `eTBfUi`, `zhanLingUi` | status (11030) → Khiêu Chiến + auto team → pick middle buff after each battle (`choiceBuffId`) → run over → milestone reward (`sd11032`, `gNextSTRwId`) → Chiến Lệnh type 2 |
| Cửu Uyển Nhi (M4a) | `MzCtrl`; `mzUi` | open maze, if `saoDangBtn.visible` send `sd20221`, confirm by `isCAwrd` |
| Cổ Thần Địa (M4b) | `AdvCtrl`; `adventureMainUi/FightUi/UseSpecialUi/TarAwardUi` | pick heroes if none, fight grids 17,19,9,7 then 13, door grid (`eType` 99999, `send11063`) to next floor, loop until heroes exhausted (cap 200 floors), item `send11079` up to 5, rewards `send11084` |
| Cực Âm Địa | `ExtremeYinCtrl`; `extremeYinExerciseUi`, `embattleUi` (jyzd) | six lands from config; claim `send32204`; pick land ≥ Huyền Âm with power above the weakest third; guard fight `send32202`; full → beat weaker player `send32205`; Đoạt `send32206` with free attempts only; then Chiến Lệnh type 6 |
| Chiến Lệnh | `RechargeCtrl`; `zhanLingUi` | free claimable rewards only (`isCanNormalIdRewardByTermId`), claim `send12322(type, term)`, confirm by recount |

Server pacing: the game also kicks sessions ("Xác minh đăng ký thất bại"); do not hammer requests.

## Writing a good request (what to tell me)

A short prompt is enough: name the feature and the screen, the expected behaviour in steps, and what is authorized on the live account. I will read this file, the docs, the Probe exports in `docs/data/`, and capture the live screens through the browser myself. Template:

```
Feature: <name> (<where in the game>)
Expected: <ordered steps, what to pick, when to stop>
Live test: allowed / not allowed (which actions: fights, claims, items; never purchases)
```
