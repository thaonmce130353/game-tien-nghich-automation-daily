# Tiên Nghịch daily Playwright

This project automates the first defined task: buy one **Tầm Tiên Lệnh** from **Đạo Thành → Phường → Đạo Cụ Phường**, then return to Đạo Thành.

## First run

Install dependencies and the Playwright browser:

```powershell
npm.cmd install
npx.cmd playwright install chromium
```

The setup reads `ACCOUNT_EMAIL` and `ACCOUNT_PASSWORD` from `src/.env`, switches from the default registration panel to **Đăng nhập**, enters through **Vào Game**, and closes visible banners before the mission starts. The authenticated browser profile is stored in `.playwright-profile/` and ignored by Git.

Run the daily task:

```powershell
npm.cmd run daily
```

The mission test performs this setup in its own browser context, reusing the saved session when available. To run only the setup without starting the mission:

```powershell
npm.cmd run login
```

The test uses a fixed 976×1280 viewport because the game UI is canvas-rendered. Banner dismissal uses canvas clicks and image-change checks; OCR is reserved for shop and purchase confirmation checks. The test skips if the item is sold out and refuses to confirm unless the dialog identifies **Tầm Tiên Lệnh** at price **25**. Screenshots and traces are saved under `test-results/` when needed.

The OCR and click positions are based on the observed game layout. If the game UI changes or OCR cannot read a screen, the test stops without confirming a purchase. Do not share or commit `.playwright-profile/`; it contains your authenticated game session.