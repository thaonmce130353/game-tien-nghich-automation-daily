import { chromium, expect, test as base, type Locator, type Page } from '@playwright/test';
import { resolve } from 'node:path';
import { clickCanvas, clickCanvasRatio, GAME_VIEWPORT, gamePoints } from '../src/canvas.js';
import { prepareGame } from '../src/game-setup.mjs';
import {
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

    if (!shopText.includes('tam tien lenh') || !shopText.includes('25')) {
      throw new Error(`Could not verify shop item/price; no purchase was attempted. Full OCR: ${shopText}. Card OCR: ${itemCardText}.`);
    }

    if (itemCardText.includes('da het') || itemCardText.includes('mai duoc mua')) {
      console.log('Tầm Tiên Lệnh is already unavailable for today; treating the daily task as complete.');
      await returnToDaoThanh(page, canvas);
      return;
    }

    const beforePurchaseClick = await canvas.screenshot();
    await clickCanvas(page, canvas, gamePoints.tamTienLanBuy);
    const confirmationVisible = await waitForConfirmation(page, canvas, beforePurchaseClick);
    if (!confirmationVisible) {
      await page.screenshot({ path: test.info().outputPath('purchase-confirmation-missing.png') });
      throw new Error('No verified purchase confirmation appeared; no confirm click was sent.');
    }

    await clickCanvasRatio(page, canvas, { x: 0.68, y: 0.653 });
    await page.waitForTimeout(2_000);
    const afterPurchase = normalizeGameText(await readCanvasRegionText(canvas, worker, tamTienLanRegion));
    expect(
      afterPurchase.includes('da het')
      || afterPurchase.includes('mai duoc mua')
      || afterPurchase.includes('han mua ngay 1 1')
    ).toBeTruthy();

    await returnToDaoThanh(page, canvas);
  } finally {
    await worker.terminate();
  }
});