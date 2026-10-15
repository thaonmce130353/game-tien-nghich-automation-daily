import { chromium, expect, test as base, type Locator, type Page } from '@playwright/test';
import { resolve } from 'node:path';
import { clickCanvas, GAME_VIEWPORT, gamePoints } from '../src/canvas.js';
import { prepareGame } from '../src/game-setup.mjs';
import {
  confirmationPoint,
  createGameOcr,
  normalizeGameText,
  readCanvasRegionText,
  readCanvasText,
  waitForConfirmation
} from '../src/game-ocr.js';

const profilePath = resolve('.playwright-profile');
const tamTienLanRegion = { x: 0.68, y: 0.20, width: 0.32, height: 0.20 };

async function returnToDaoThanh(page: Page, canvas: Locator): Promise<void> {
  await clickCanvas(page, canvas, gamePoints.backFromShop);
  await page.waitForTimeout(1_000);
  await clickCanvas(page, canvas, gamePoints.daoThanhTab);
}

const test = base.extend({
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext(profilePath, {
      headless: false,
      viewport: GAME_VIEWPORT
    });
    await use(context);
    await context.close();
  }
});

test('daily task: buy one Tầm Tiên Lệnh when available', async ({ page }) => {
  const { canvas } = await prepareGame(page);
  await expect(canvas).toBeVisible();

  const worker = await createGameOcr();
  try {
    await page.waitForTimeout(2_000);
    await clickCanvas(page, canvas, gamePoints.daoThanhTab);
    await page.waitForTimeout(1_500);
    await clickCanvas(page, canvas, gamePoints.phuong);
    await page.waitForTimeout(1_500);

    const shop = await readCanvasText(canvas, worker);
    const shopText = normalizeGameText(shop.text);
    const itemCardText = normalizeGameText(await readCanvasRegionText(canvas, worker, tamTienLanRegion));
    await page.screenshot({ path: test.info().outputPath('phuong-shop.png') });

    if (!shopText.includes('tam tien lenh') && !itemCardText.includes('tam tien lenh')) {
      throw new Error('Could not verify the Tầm Tiên Lệnh shop screen; no purchase was attempted.');
    }

    if (itemCardText.includes('da het') || itemCardText.includes('mai duoc mua')) {
      console.log('Tầm Tiên Lệnh is already unavailable for today; treating the daily task as complete.');
      await returnToDaoThanh(page, canvas);
      return;
    }

    await clickCanvas(page, canvas, gamePoints.tamTienLanBuy);
    await page.waitForTimeout(1_000);
    const confirmation = await waitForConfirmation(page, canvas, worker);
    if (!confirmation) {
      await page.screenshot({ path: test.info().outputPath('purchase-confirmation-missing.png') });
      throw new Error('No verified purchase confirmation appeared; no confirm click was sent.');
    }

    const confirmationText = normalizeGameText(confirmation.text);
    if (!confirmationText.includes('tam tien lenh') || !confirmationText.includes('25')) {
      await page.screenshot({ path: test.info().outputPath('unexpected-confirmation.png') });
      throw new Error('Confirmation did not match Tầm Tiên Lệnh at the expected price of 25; purchase stopped.');
    }

    const point = confirmationPoint(confirmation);
    if (!point) {
      await page.screenshot({ path: test.info().outputPath('confirm-button-unreadable.png') });
      throw new Error('Could not locate the Xác nhận text; purchase stopped.');
    }

    await clickCanvas(page, canvas, point);
    await page.waitForTimeout(2_000);
    const afterPurchase = normalizeGameText((await readCanvasText(canvas, worker)).text);
    expect(afterPurchase.includes('da het') || afterPurchase.includes('mai duoc mua')).toBeTruthy();

    await returnToDaoThanh(page, canvas);
  } finally {
    await worker.terminate();
  }
});