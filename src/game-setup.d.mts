import type { Locator, Page } from '@playwright/test';

export function prepareGame(page: Page): Promise<{ canvas: Locator }>;
export function runLoginSetup(): Promise<void>;