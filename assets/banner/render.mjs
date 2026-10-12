/**
 * Gera assets/img/banner.png a partir de assets/banner/banner.html.
 *
 *   node assets/banner/render.mjs
 *
 * Precisa do Playwright com Chromium disponível. A fonte vem do Google Fonts,
 * então o render exige rede na primeira execução.
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(here, 'banner.html');
const output = resolve(here, '../img/banner.png');

const WIDTH = 1600;
const HEIGHT = 400;
const SCALE = 1.5;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: SCALE,
});

await page.goto(`file://${source}`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

await page.locator('#banner').screenshot({ path: output });
await browser.close();

console.log(`banner gerado: ${output} (${WIDTH * SCALE}x${HEIGHT * SCALE})`);
