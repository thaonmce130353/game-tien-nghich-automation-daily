# Run audit (temporary dev tool)

`extension/src/content/features/run-audit.js` records, for every run (a single feature started with START, or each Quick Run step), what the feature really did in the live game. It only observes: it never blocks or sends anything. It ships in every development build like the Probe and must be removed before a public release (drop it from `allSourceFiles` in `scripts/build-content.js`; the hooks in other files are `typeof audit... === 'function'` guarded and need no change).

## Using it

- It is on by default once the game has loaded (`[TN audit] đã bật` in the game frame console).
- After each run the HUD shows one purple line: `🔎 [Audit] <feature>: duration · actions · requests (avg/max reply) · Tiên Ngọc change · findings`.
- Full report: Probe (top right) → **Audit**. Read it with `get_page_text`. **Xuất JSON** saves the raw data, **Xóa audit** clears it, **Audit bật/tắt** turns it off for the next page load.
- The report is kept in the game frame's `sessionStorage` (`tn-run-audit`, last 80 runs), so it survives auto-reconnect reloads. A run cut by a reload is marked `interrupted`.

## What a run records

| Field | Source | Meaning |
| --- | --- | --- |
| `Ctrl đã gọi` | every `send*/sd*` method on every `*Ctrl` prototype is wrapped | `Ctrl.method×calls [cmd×sent] [args]`; `[không gửi]` = called but nothing was sent (the game's own guard stopped it) |
| `?name` | stack of `NetMgr.sendMsg` | requests sent by a non-`send*` game function (for example `?send18050Msg`, `?sendCVideo`) |
| `game tự gửi` | stack without our script | requests the game sent by itself while the run was active |
| `phản hồi TB/max` | `NetMgr.dispatchEvent` | reply time for requests we sent (same cmd number) |
| `phản hồi <cmd>` | same | last 2 replies per cmd (220 chars): the real server answer, use it before guessing |
| `✖ từ chối` | reply with `res`/`code` = 0 | server refusal with the decoded message and code |
| `báo lỗi`, `tips` | `GlobalCtrl.showErrorMsg`, `MainCtrl.showStringTips` | toasts. The game also uses `showErrorMsg` for success ("Lưu thành công"), those are not findings |
| `lỗi game` | `CommonUtils.printER` | exceptions inside the game, including inside reply handlers |
| `lỗi JS` | `window` error events + scheduler tick | exceptions in our own code (the tick used to swallow them silently) |
| `bảng đã mở`, `bị dọn hộ`, `VẪN CÒN MỞ`, `popup mở trễ` | ViewMgr polled every 400 ms | screens opened in the run; screens the shared clean-up closed for the feature; screens still open 1.5 s after the clean-up; popups that appeared up to 4 s after the run ended |
| `LỆNH CẤM` | args check | `TravelCtrl.send30203`, `DailyDungeonCtrl.send11002(1)` from our code |
| `Ctrl ngoài dự kiến` | `AUDIT_EXPECTED_CTRLS` + shared list | a controller the feature is not known to use (update the map when the call is legitimate) |
| performance | scheduler, `PerformanceObserver('longtask')`, `CommonUtils.getRoleAsset('gold')` | ticks (avg/max/>16 ms), long tasks, tail wait after the last request, Tiên Ngọc before → after |

Known expected refusals are listed in `AUDIT_BENIGN_CODES` (for example `218015` Cửu Uyển Nhi "all floors cleared").

## Lessons the audit produced (apply them to new features)

- Wrapping a reply handler `rvXXXXX` on the prototype does nothing: the game registers the handler once at start-up. Read replies with `netLastReply(cmd)` (game-hooks.js; call `netTapInstall()` first) and only trust `at >= sentAt`.
- Every run now closes the screens it opened (`runFinish` → `runCloseOpenedViews`, plus a stray-popup sweep 2.5 s later for single runs). A feature should still close its own reward popups; the audit lists the ones it left as `tính năng không tự đóng (đã dọn hộ)`.
- The battle skip must follow the game's order: `transRoundFightList` → `executeShowRoundFight(t, true)` → `executeFinishFight(true)`. Vấn Đạo (`guildAsked`) needs the 18144 reply first (it reads `scmd18144Data.damage`).
