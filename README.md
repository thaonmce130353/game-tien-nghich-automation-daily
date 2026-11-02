# Extension content scripts

The extension loads the generated `extension/content.js` as a classic script in the game page's main world. Keep that runtime arrangement: the source files under `extension/src/content/` are concatenated in order so their existing shared scope, state, and execution sequence stay unchanged.

Edit the relevant source file under `extension/src/content/`, then run these commands from the repository root. The scripts live in the top-level `scripts/` folder and build the extension entry point under `extension/`:

```powershell
node scripts/build-content.js
```

Check the combined source for JavaScript syntax errors without generating or changing `extension/content.js`:

```powershell
node scripts/validate-content.js
```

The build command and watcher run this same syntax validation before writing `content.js`. If validation fails, the existing generated file is left unchanged.

For development, start the watcher once instead. It rebuilds `extension/content.js` automatically after source changes:

```powershell
node scripts/watch-content.js
```

Leave the watcher running while editing, then reload the extension and refresh the game tab to load the updated script. Stop the watcher with `Ctrl+C`.

## Main files

| File | Role |
| --- | --- |
| `extension/manifest.json` | Extension manifest; loads `content.js` into the game page |
| `extension/content.js` | **Generated** main script, built from `extension/src/content/`. Do not edit it directly; rebuild with `node scripts/build-content.js` |
| `extension/popup.html`, `extension/popup.js` | Extension popup |
| `scripts/build-content.js` | Validates and concatenates the ordered source files into `content.js` |
| `scripts/validate-content.js` | Syntax check only; does not write `content.js` |
| `scripts/watch-content.js` | Rebuilds `content.js` when a source file changes |
| `memory/game-controllers.md` | Snapshot of game controller names and safe inspection guidance |
| `memory/game-js-files/main.min_eef72ae3.js` | Local-only copy of the game client's `main.min` bundle (see below). Not part of the extension |

## Game client bundle (`main.min_eef72ae3.js`)

`memory/game-js-files/main.min_eef72ae3.js` is the game's own minified bundle, loaded by the game frame from `https://tiennghich.acejoygame.com/vnmaster/js/` (see `memory/game-controllers.md`). It is proprietary game code kept locally only as a read-only reference for finding controller, method and network-call names.

- Search it for names only (for example with grep); do not call methods found there against the live game without checking what they send or spend.
- Do not commit, copy into `src/`, or redistribute it. Add `memory/game-js-files/` to `.gitignore` if it is not already ignored.
- It is a snapshot: the game can publish a new hashed file at any time, so names may change. Re-verify against the current client before relying on them.
- The extension never loads this file. It only uses the live game's globals at runtime.

## Shared runtime

| File | Responsibility |
| --- | --- |
| `extension/src/content/bootstrap.js` | Initialization guard, shared configuration, and persistence |
| `extension/src/content/ui-init.js` | Top-frame UI initialization |
| `extension/src/content/ui-styles.js` | HUD styles |
| `extension/src/content/ui-markup.js` | HUD and feature-tab markup |
| `extension/src/content/ui-events.js` | UI controls, resize handles, and event handlers |
| `extension/src/content/game-bridge.js` | Game context, role information, and message bridge |
| `extension/src/content/game-hooks.js` | Game hooks and battle handling |

## Feature modules

Each feature module contains its handler and feature-specific state in one file.

| File | Feature |
| --- | --- |
| `extension/src/content/features/tong-tian-tower.js` | Thông Thiên Tháp |
| `extension/src/content/features/daily-dungeons.js` | Daily dungeon climb |
| `extension/src/content/features/underworld-abyss.js` | Vực U Minh |
| `extension/src/content/features/arena.js` | Đấu Tiên Đài |
| `extension/src/content/features/four-spirit-camp.js` | Tứ Linh Trận |
| `extension/src/content/features/sweep-dungeons.js` | Dungeon sweep |
| `extension/src/content/features/hangup-rewards.js` | Hangup rewards and quick hang |
| `extension/src/content/features/daily-tasks.js` | Daily tasks |
| `extension/src/content/features/extreme-yin.js` | Cực Âm Địa |
| `extension/src/content/features/main-stage.js` | Main-stage progression |
| `extension/src/content/features/xian-yuan.js` | Quà Tiên Duyên |
| `extension/src/content/features/tower-and-tu-linh.js` | [M1] Thông Thiên Tháp & Tứ Linh Tháp, including the daily claim and sweep routine (see below) |
| `extension/src/content/features/daily-and-bi-canh.js` | Daily dungeons and Bí Cảnh Tứ Quốc |
| `extension/src/content/features/sect-defense.js` | Thủ Vệ Tứ Phái |
| `extension/src/content/features/other-trials.js` | Related trial activities |
| `extension/src/content/features/immortal-relic.js` | Di Tích Tiên Giới |
| `extension/src/content/features/memory-minigame.js` | Ảo Cảnh Pháp Trận |
| `extension/src/content/features/dragon-minigame.js` | Điêu Long Khắc Tinh |
| `extension/src/content/features/daily-routines.js` | Mail quick claims, leaderboard worship, daily task/chest claims, Tiên Hữu quick gifting, and guild routines |
| `extension/src/content/features/scheduler.js` | Existing feature dispatch and automation cycle |

Some existing handlers intentionally cover multiple related options, such as hangup rewards/quick hang and the shared daily routines. They remain together to avoid changing behavior.

These are ordered source files, not independently loaded scripts. Do not add them individually to the manifest or wrap them in separate scopes; doing so would change shared-state and initialization behavior.

## [M1] Thông Thiên Tháp & Tứ Linh Tháp daily routine

The sub-option "Nhận thưởng và Quét ải mỗi ngày" (`CONFIG.towerDailyRoutine`, default on) appears under the M1 checkbox. It is on whenever M1 is the active feature and is cleared when another feature is selected. When it is off, only the existing Thông Thiên Tháp auto-skip runs.

When on, each day the routine runs before the existing auto-skip:

1. Thông Thiên Tháp: sweep the highest cleared floor with the free turns, then buy and sweep one extra turn (costs Tiên Ngọc).
2. Tứ Linh Tháp: if the feature is unlocked, then for each tower open today, fight new floors up to the daily limit (10), then sweep with the free turns. It never buys extra turns.

Every step is logged as done only after the server's counts confirm it. Steps that are already done are logged as skipped. A step that times out is logged as an error and not retried. After an Auto restart, the routine re-reads the server counts before acting.
