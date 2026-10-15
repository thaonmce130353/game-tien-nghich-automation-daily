import { chromium } from '@playwright/test';
import dotenv from 'dotenv';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const gameUrl = 'https://tiennghich.joyplay.vn/play';
dotenv.config({ path: resolve('src/.env') });

async function findGameCanvas(canvasCandidates, timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const count = await canvasCandidates.count();
    for (let index = 0; index < count; index++) {
      const canvas = canvasCandidates.nth(index);
      if (!(await canvas.isVisible().catch(() => false))) continue;

      const box = await canvas.boundingBox().catch(() => null);
      const width = Number(await canvas.getAttribute('width'));
      const height = Number(await canvas.getAttribute('height'));
      if (box && box.width >= 300 && box.height >= 600 && width >= 300 && height >= 600) {
        return canvas;
      }
    }
    await new Promise((done) => setTimeout(done, 250));
  }

  throw new Error('Could not find the full-size game canvas (minimum 300x600).');
}

async function clickCanvasRatio(page, canvas, ratio) {
  const box = await canvas.boundingBox();
  const width = Number(await canvas.getAttribute('width'));
  const height = Number(await canvas.getAttribute('height'));
  if (!box || !width || !height) throw new Error('Game canvas is not measurable.');

  await page.mouse.click(
    box.x + ratio.x * box.width,
    box.y + ratio.y * box.height
  );
}

async function readCanvasRegion(canvas, region) {
  const screenshot = await canvas.screenshot();
  const image = sharp(screenshot);
  const { width = 0, height = 0 } = await image.metadata();
  if (width < 300 || height < 600) {
    throw new Error(`Refusing screen check on undersized game canvas (${width}x${height}).`);
  }
  const left = Math.floor(width * region.x);
  const top = Math.floor(height * region.y);
  return image
    .extract({
      left,
      top,
      width: Math.floor(width * region.width),
      height: Math.floor(height * region.height)
    })
    .resize({ width: 64, height: 64, fit: 'fill' })
    .greyscale()
    .raw()
    .toBuffer();
}

function changedPixelRatio(before, after) {
  let changed = 0;
  for (let index = 0; index < before.length; index++) {
    if (Math.abs(before[index] - after[index]) > 24) changed++;
  }
  return changed / before.length;
}

async function enterGame(page, canvas) {
  const titleButtonRegion = { x: 0.35, y: 0.68, width: 0.3, height: 0.1 };
  for (let attempt = 1; attempt <= 3; attempt++) {
    const before = await readCanvasRegion(canvas, titleButtonRegion);
    await clickCanvasRatio(page, canvas, { x: 0.507, y: 0.727 });
    console.log(`Clicked Vào Game at the verified button position (${attempt}/3).`);
    await page.waitForTimeout(8_000);
    const after = await readCanvasRegion(canvas, titleButtonRegion);
    if (changedPixelRatio(before, after) >= 0.12) return;
  }

  await mkdir('test-results', { recursive: true });
  await page.screenshot({ path: resolve('test-results/vao-game-timeout.png') });
  throw new Error('The Vào Game screen did not change after three clicks.');
}

async function dismissCanvasBanners(page, canvas) {
  for (let dismissed = 1; dismissed <= 2; dismissed++) {
    await clickCanvasRatio(page, canvas, { x: 0.89, y: 0.242 });
    await page.waitForTimeout(900);
    console.log(`Dismissed canvas banner ${dismissed}.`);
  }
  return 2;
}

async function closeVisibleXButtons(page) {
  for (let attempt = 0; attempt < 12; attempt++) {
    let closedOne = false;
    for (const frame of page.frames()) {
      const buttons = frame.locator('button');
      for (let index = 0; index < await buttons.count(); index++) {
        const button = buttons.nth(index);
        if (!(await button.isVisible().catch(() => false))) continue;

        const text = (await button.innerText().catch(() => '')).trim();
        const label = (await button.getAttribute('aria-label'))?.trim() ?? '';
        const title = (await button.getAttribute('title'))?.trim() ?? '';
        if (![text, label, title].some((value) => /^(×|✕|x|close|đóng)$/i.test(value))) continue;

        await button.click();
        await page.waitForTimeout(300);
        closedOne = true;
        break;
      }
      if (closedOne) break;
    }
    if (!closedOne) return;
  }
  throw new Error('Too many close buttons appeared; stopping for manual inspection.');
}

async function signInIfNeeded(gameFrame) {
  const accountLogin = gameFrame.getByRole('button', { name: 'Đã có tài khoản? Đăng nhập' });
  const loginButton = gameFrame.getByRole('button', { name: 'Đăng nhập', exact: true });

  if (!(await loginButton.isVisible().catch(() => false))
    && await accountLogin.isVisible().catch(() => false)) {
    await accountLogin.click();
    await loginButton.waitFor({ state: 'visible', timeout: 10_000 });
  }

  if (!(await loginButton.isVisible().catch(() => false))) {
    const hasCredentialFields = await gameFrame
      .locator('input[type="email"]:visible, input[type="password"]:visible')
      .count();
    if (hasCredentialFields > 0) {
      throw new Error('An unrecognized credential form is visible; stopping without submitting it.');
    }
    return;
  }

  const accountEmail = process.env.ACCOUNT_EMAIL;
  const accountPassword = process.env.ACCOUNT_PASSWORD;
  if (!accountEmail || !accountPassword) {
    throw new Error('Set ACCOUNT_EMAIL and ACCOUNT_PASSWORD in src/.env.');
  }

  await gameFrame.locator('input[type="email"]:visible').last().fill(accountEmail);
  await gameFrame.locator('input[type="password"]:visible').last().fill(accountPassword);
  await loginButton.click();
  await loginButton.waitFor({ state: 'hidden', timeout: 45_000 });
}

export async function prepareGame(page) {
  await page.goto(gameUrl);
  const gameFrame = page.frameLocator('iframe[src*="acejoygame.com"]');
  const canvas = await findGameCanvas(gameFrame.locator('canvas'));
  await page.waitForTimeout(3_000);
  await signInIfNeeded(gameFrame);
  await page.waitForTimeout(4_000);
  await closeVisibleXButtons(page);

  console.log(`Using game canvas ${await canvas.getAttribute('width')}x${await canvas.getAttribute('height')}.`);
  await enterGame(page, canvas);
  const dismissed = await dismissCanvasBanners(page, canvas);
  await closeVisibleXButtons(page);
  await mkdir('test-results', { recursive: true });
  await page.screenshot({ path: resolve('test-results/login-ready.png') });
  console.log(`Game setup complete; dismissed ${dismissed} canvas banner(s).`);
  return { canvas };
}

export async function runLoginSetup() {
  const context = await chromium.launchPersistentContext(resolve('.playwright-profile'), {
    headless: false,
    viewport: { width: 976, height: 1280 }
  });

  try {
    const page = context.pages()[0] ?? await context.newPage();
    await prepareGame(page);
  } finally {
    await context.close();
  }
}