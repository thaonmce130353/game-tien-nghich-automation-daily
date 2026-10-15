import { chromium } from '@playwright/test';
import dotenv from 'dotenv';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { runLoginSetup } from '../src/game-setup.mjs';

await runLoginSetup();