import sharp from 'sharp';
import { createWorker } from 'tesseract.js';
import type { Locator, Page } from '@playwright/test';

type OcrWorker = Awaited<ReturnType<typeof createWorker>>;
export type GameText = Awaited<ReturnType<OcrWorker['recognize']>>['data'];

export async function createGameOcr(): Promise<OcrWorker> {
  return createWorker('vie+eng');
}

export async function readCanvasText(canvas: Locator, worker: OcrWorker): Promise<GameText> {
  const screenshot = await canvas.screenshot();
  const image = sharp(screenshot);
  const { width = 0, height = 0 } = await image.metadata();
  if (width < 300 || height < 600) {
    throw new Error(`Refusing OCR on undersized canvas screenshot (${width}x${height}).`);
  }
  const enlarged = await image
    .resize({ width: 1060 })
    .png()
    .toBuffer();
  const { data } = await worker.recognize(enlarged);
  return data;
}

export async function readCanvasRegionText(
  canvas: Locator,
  worker: OcrWorker,
  region: { x: number; y: number; width: number; height: number }
): Promise<string> {
  const screenshot = await canvas.screenshot();
  const image = sharp(screenshot);
  const { width = 0, height = 0 } = await image.metadata();
  if (width < 300 || height < 600) {
    throw new Error(`Refusing OCR on undersized canvas screenshot (${width}x${height}).`);
  }

  const left = Math.floor(width * region.x);
  const top = Math.floor(height * region.y);
  const cropWidth = Math.floor(width * region.width);
  const cropHeight = Math.floor(height * region.height);
  const cropped = await image
    .extract({ left, top, width: cropWidth, height: cropHeight })
    .resize({ width: 900 })
    .png()
    .toBuffer();
  const { data } = await worker.recognize(cropped);
  return data.text;
}

export function normalizeGameText(text: string): string {
  return text
    .replace(/[Đđ]/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

async function dialogPixels(screenshot: Buffer): Promise<Buffer> {
  const { width = 0, height = 0 } = await sharp(screenshot).metadata();
  if (width < 300 || height < 600) {
    throw new Error(`Refusing dialog check on undersized canvas screenshot (${width}x${height}).`);
  }

  const left = Math.floor(width * 0.15);
  const top = Math.floor(height * 0.28);
  return sharp(screenshot)
    .extract({ left, top, width: Math.floor(width * 0.70), height: Math.floor(height * 0.45) })
    .resize({ width: 64, height: 64, fit: 'fill' })
    .greyscale()
    .raw()
    .toBuffer();
}

async function readDialogPixels(canvas: Locator): Promise<Buffer> {
  return dialogPixels(await canvas.screenshot());
}

function changedPixelRatio(before: Buffer, after: Buffer): number {
  if (before.length !== after.length) return 0;
  let changed = 0;
  for (let index = 0; index < before.length; index++) {
    if (Math.abs(before[index] - after[index]) > 28) changed++;
  }
  return changed / before.length;
}

export async function waitForConfirmation(
  page: Page,
  canvas: Locator,
  beforeClick: Buffer,
  timeoutMs = 10_000
): Promise<boolean> {
  const endTime = Date.now() + timeoutMs;
  const baseline = await dialogPixels(beforeClick);

  while (Date.now() < endTime) {
    const current = await readDialogPixels(canvas);
    if (changedPixelRatio(baseline, current) >= 0.30) return true;
    await page.waitForTimeout(400);
  }

  return false;
}