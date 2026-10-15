import type { Locator, Page } from '@playwright/test';

export const GAME_URL = 'https://tiennghich.joyplay.vn/play';
export const GAME_VIEWPORT = { width: 976, height: 1280 };

export const gamePoints = {
  daoThanhTab: { x: 54, y: 1182 },
  phuong: { x: 167, y: 511 },
  tamTienLanBuy: { x: 421, y: 420 },
  tamTienLanInfo: { x: 414, y: 349 },
  backFromShop: { x: 49, y: 1207 }
};

export async function clickCanvas(
  page: Page,
  canvas: Locator,
  point: { x: number; y: number }
): Promise<void> {
  const box = await canvas.boundingBox();
  const width = Number(await canvas.getAttribute('width'));
  const height = Number(await canvas.getAttribute('height'));

  if (!box || !width || !height) {
    throw new Error('Game canvas is not measurable.');
  }

  await page.mouse.click(
    box.x + point.x * (box.width / width),
    box.y + point.y * (box.height / height)
  );
}