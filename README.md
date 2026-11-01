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
| `extension/src/content/features/auto-forge.js` | Rèn Tiên Khí & Nâng Khí Đỉnh |
| `extension/src/content/features/extreme-yin.js` | Cực Âm Địa |
| `extension/src/content/features/main-stage.js` | Main-stage progression |
| `extension/src/content/features/xian-yuan.js` | Quà Tiên Duyên |
| `extension/src/content/features/tower-and-tu-linh.js` | Tower and Tu Linh activities |
| `extension/src/content/features/daily-and-bi-canh.js` | Daily dungeons and Bí Cảnh Tứ Quốc |
| `extension/src/content/features/sect-defense.js` | Thủ Vệ Tứ Phái |
| `extension/src/content/features/other-trials.js` | Related trial activities |
| `extension/src/content/features/immortal-relic.js` | Di Tích Tiên Giới |
| `extension/src/content/features/memory-minigame.js` | Ảo Cảnh Pháp Trận |
| `extension/src/content/features/dragon-minigame.js` | Điêu Long Khắc Tinh |
| `extension/src/content/features/daily-routines.js` | Mail quick claims, leaderboard worship, daily task/chest claims, Tiên Hữu quick gifting, and guild routines |
| `extension/src/content/features/scheduler.js` | Existing feature dispatch and automation cycle |
| `extension/src/content/features/auto-reconnect-joyplay.js` | Joyplay game disconnect detection and reconnect |

Some existing handlers intentionally cover multiple related options, such as hangup rewards/quick hang and the shared daily routines. They remain together to avoid changing behavior.

These are ordered source files, not independently loaded scripts. Do not add them individually to the manifest or wrap them in separate scopes; doing so would change shared-state and initialization behavior.
