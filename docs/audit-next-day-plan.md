# Fresh-day audit plan

The 2026-11-05 audit ran after that day's work was already done, so most steps only saw "already done today" paths. Repeat it on a fresh day, after the daily reset and **before anything is run by hand**, so every feature does its real work.

## Run order

1. Reload the game (click "Vào game" about 3 s after load), Probe → **Xóa audit**, turn on "Log chi tiết".
2. Note Tiên Ngọc (top bar) before starting.
3. **Quick Run from the start** (CHẠY LẠI TỪ ĐẦU if a saved run shows), all 20 steps. Do not touch the game while it runs.
4. Probe → **Audit**, save the report text; HUD log text too.
5. Single runs for modes that differ from Quick Run, each after a reload:
   - Cửu Uyển Nhi & Cổ Thần Địa (single mode fights Cổ Thần floors until heroes are used up).
   - Đấu Tiên Đài (up to the ⚙ battle limit).
   - Vực U Minh (3 tries instead of 1).
   - Tự Động Leo Thông Thiên Tháp, 2 minutes, then Stop.
6. Probe → **Audit** again; write the results into a new `docs/audit-<date>.md` (same tables as `audit-2026-11-05.md`) and update the feature status in `CLAUDE.md`.

## What to check per step

| Step | Must see | Watch for |
| --- | --- | --- |
| Nhận Thưởng Ngày | check-in, month cards, free gifts, VIP sign confirmed | any paid gift |
| Tâm Tiên Đài | free gifts + daily recruit; Tiên Ngọc gift buys are by design | spend matches the gifts bought |
| Tiên Hữu | friendship points sent (`FriendCtrl`) | 0 requests again = feature not working |
| Thái Cổ Thu Hà | 2 free sweeps, 3 likes | |
| Trợ Chiến | claim confirmed, reward popup closed | |
| Tiên Minh | bargain, Bí Cảnh 3 fights (+1 bought, 20 Tiên Ngọc), Tỉ Thí, Vấn Đạo, help, offering | **no** `damage` game error in Vấn Đạo (skip waits for 18144) |
| Thông Thiên & Tứ Linh (sweep) | 2 free + 1 bought sweep, Tứ Linh 10 new stages | the sweep must not depend on `openRunManAutoFight` (flag no longer set globally) |
| PB Ngày & Bí Cảnh | free sweep `send11002(0)` only, Bí Cảnh fights | **never** `send11002(1)` (audit flags it) |
| Thủ Vệ Tứ Phái | run starts at status 1, one buff pick per 11033 list, all accepted, milestone + Chiến Lệnh claims | `164006` "Buff chọn bị lỗi" must not appear; no `sd11030` loop |
| Cửu Uyển Nhi & Cổ Thần | sweep confirmed (`isCAwrd`), or info "đã vượt hết tầng" | |
| Cực Âm Địa | land pick / seat / Đoạt with free attempts only, Chiến Lệnh type 6 | |
| Di Tích | team dispatched, popup closed | |
| Ảo Cảnh | rounds played, milestones + tasks claimed | |
| Kiếm Hành & Điêu Long | dice round (Tiên Ngọc buys up to 12/day by design), Điêu Long perfect hits, Chiến Lệnh | spend per buy |
| Vực U Minh | 1 try in Quick Run | |
| Đấu Tiên Đài | battles up to the limit | 16 list refreshes for 5 fights (still open item) |
| Ma Đạo | idle reward, Ủy Phái new Sử Thi+ jobs, refresh cost 30 each | **never** `TravelCtrl.send30203` |
| Banner hero / skin | gifts (free + 300 rows), recruit, trial, tasks, Chiến Lệnh | never `price` rows |
| Nhận Cuối Ngày | mail, 3 likes, activity chests | |

Across all steps: total Tiên Ngọc spent stays well under the 5000 test cap, no `LỆNH CẤM`, no `lỗi JS`, no `VẪN CÒN MỞ`, and per-step time and request counts compared with the 2026-11-05 table.
