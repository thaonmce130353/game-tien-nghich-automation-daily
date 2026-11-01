# Content script source

The extension loads the generated `content.js` as a classic script in the game page's main world. Keep that runtime arrangement: the source files are concatenated in order so their existing shared scope, state, and execution sequence stay unchanged.

Edit the relevant source file, then regenerate the extension entry point from the project root:

```powershell
node scripts/build-content.js
```

Check the combined source for JavaScript syntax errors without generating or changing `content.js`:

```powershell
node scripts/validate-content.js
```

The build command and watcher run this same syntax validation before writing `content.js`. If validation fails, the existing generated file is left unchanged.

For development, start the watcher once instead. It rebuilds `content.js` automatically after source changes:

```powershell
node scripts/watch-content.js
```

Leave the watcher running while editing, then reload the extension and refresh the game tab to load the updated script. Stop the watcher with `Ctrl+C`.

## Shared runtime

| File | Responsibility |
| --- | --- |
| `bootstrap.js` | Initialization guard, shared configuration, and persistence |
| `ui-init.js` | Top-frame UI initialization |
| `ui-styles.js` | HUD styles |
| `ui-markup.js` | HUD and feature-tab markup |
| `ui-events.js` | UI controls, resize handles, and event handlers |
| `game-bridge.js` | Game context, role information, and message bridge |
| `game-hooks.js` | Game hooks and battle handling |

## Feature modules

Each feature module contains its handler and feature-specific state in one file.

| File | Feature |
| --- | --- |
| `features/tong-tian-tower.js` | Thông Thiên Tháp |
| `features/daily-dungeons.js` | Daily dungeon climb |
| `features/underworld-abyss.js` | Vực U Minh |
| `features/arena.js` | Đấu Tiên Đài |
| `features/four-spirit-camp.js` | Tứ Linh Trận |
| `features/sweep-dungeons.js` | Dungeon sweep |
| `features/hangup-rewards.js` | Hangup rewards and quick hang |
| `features/daily-tasks.js` | Daily tasks |
| `features/auto-forge.js` | Rèn Tiên Khí & Nâng Khí Đỉnh |
| `features/extreme-yin.js` | Cực Âm Địa |
| `features/main-stage.js` | Main-stage progression |
| `features/xian-yuan.js` | Quà Tiên Duyên |
| `features/tower-and-tu-linh.js` | Tower and Tu Linh activities |
| `features/daily-and-bi-canh.js` | Daily dungeons and Bí Cảnh Tứ Quốc |
| `features/sect-defense.js` | Thủ Vệ Tứ Phái |
| `features/other-trials.js` | Related trial activities |
| `features/immortal-relic.js` | Di Tích Tiên Giới |
| `features/memory-minigame.js` | Ảo Cảnh Pháp Trận |
| `features/dragon-minigame.js` | Điêu Long Khắc Tinh |
| `features/daily-routines.js` | Shared daily claims and guild routines |
| `features/scheduler.js` | Existing feature dispatch and automation cycle |

Some existing handlers intentionally cover multiple related options, such as hangup rewards/quick hang and the shared daily routines. They remain together to avoid changing behavior.

These are ordered source files, not independently loaded scripts. Do not add them individually to the manifest or wrap them in separate scopes; doing so would change shared-state and initialization behavior.
