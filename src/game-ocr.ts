import sharp from 'sharp';
import { createWorker } from 'tesseract.js';
import type { Locator, Page } from '@playwright/test';

const OCR_SCALE = 2;
type OcrWord = {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
};

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

export function confirmationPoint(text: GameText): { x: number; y: number } | undefined {
  const blocks = text.blocks as unknown as Array<{
    paragraphs: Array<{ lines: Array<{ words: OcrWord[] }> }>;
  }> | null;
  const words = blocks?.flatMap((block) =>
    block.paragraphs.flatMap((paragraph) =>
      paragraph.lines.flatMap((line) => line.words)
    )
  ) ?? [];
  const confirm = words.find((word) => normalizeGameText(word.text) === 'xac');
  if (!confirm) return undefined;

  const confirmY = (confirm.bbox.y0 + confirm.bbox.y1) / 2;
  const accept = words.find((word) => {
    const centerY = (word.bbox.y0 + word.bbox.y1) / 2;
    return normalizeGameText(word.text) === 'nhan'
      && Math.abs(centerY - confirmY) < 30
      && word.bbox.x0 >= confirm.bbox.x1 - 5
      && word.bbox.x0 - confirm.bbox.x1 < 100;
  });
  if (!accept) return undefined;

  const centerX = (confirm.bbox.x0 + accept.bbox.x1) / 2 / OCR_SCALE;
  const centerY = (confirm.bbox.y0 + confirm.bbox.y1) / 2 / OCR_SCALE;
  return { x: centerX, y: centerY };
}

export async function waitForConfirmation(
  page: Page,
  canvas: Locator,
  worker: OcrWorker,
  timeoutMs = 20_000
): Promise<GameText | undefined> {
  const endTime = Date.now() + timeoutMs;

  while (Date.now() < endTime) {
    const result = await readCanvasText(canvas, worker);
    const recognized = normalizeGameText(result.text);
    if (recognized.includes('xac nhan')) return result;
    if (recognized.includes('da het') || recognized.includes('mai duoc mua')) return undefined;
    await page.waitForTimeout(800);
  }

  return undefined;
}