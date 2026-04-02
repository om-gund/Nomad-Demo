import puppeteer from 'puppeteer-core';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath, URL } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const screenshotsDir = join(__dirname, 'temporary screenshots');
if (!existsSync(screenshotsDir)) mkdirSync(screenshotsDir);

const url   = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

const existing = existsSync(screenshotsDir)
  ? readdirSync(screenshotsDir).filter(f => /^screenshot-\d+/.test(f))
  : [];
let maxN = 0;
for (const f of existing) {
  const m = f.match(/screenshot-(\d+)/);
  if (m) maxN = Math.max(maxN, parseInt(m[1]));
}
const n = maxN + 1;
const filename = label ? `screenshot-${n}-${label}.png` : `screenshot-${n}.png`;
const outputPath = join(screenshotsDir, filename);

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  headless: 'new',
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
await new Promise(r => setTimeout(r, 800));
await page.screenshot({ path: outputPath, fullPage: true });
await browser.close();

console.log(`Saved: temporary screenshots/${filename}`);
