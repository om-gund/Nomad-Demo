import puppeteer from 'puppeteer-core';
import { mkdirSync, existsSync } from 'fs';

const dir = 'temporary screenshots';
if (!existsSync(dir)) mkdirSync(dir);

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--force-color-profile=srgb',
    '--run-all-compositor-stages-before-draw',
  ],
  headless: 'new',
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });

// Freeze all animations so compositor doesn't hold elements at mid-state
await page.addStyleTag({
  content: `*, *::before, *::after {
    animation-play-state: paused !important;
    animation-delay: -9999s !important;
    transition: none !important;
  }`,
});

// Trigger all IntersectionObserver reveals by force-showing them
await page.evaluate(() => {
  document.querySelectorAll('.reveal').forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
    el.style.transition = 'none';
  });
  // Force hero-visual visible too
  const hv = document.querySelector('.hero-visual');
  if (hv) { hv.style.opacity = '1'; hv.style.transform = 'none'; }
});

await new Promise(r => setTimeout(r, 600));

// Get section positions
const positions = await page.evaluate(() => {
  const ids = ['home', 'about', 'services', 'process', 'book'];
  return ids.map(id => {
    const el = document.getElementById(id);
    return { id, y: el ? Math.round(el.getBoundingClientRect().top + window.scrollY) : 0 };
  });
});

for (const { id, y } of positions) {
  await page.evaluate(yPos => window.scrollTo(0, yPos), y);
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({
    path: `${dir}/section-${id}.png`,
    clip: { x: 0, y, width: 1440, height: 900 },
  });
  console.log(`Saved: section-${id}.png`);
}

// Footer
const footerY = await page.evaluate(() => {
  const el = document.querySelector('footer');
  return el ? Math.round(el.getBoundingClientRect().top + window.scrollY) : 0;
});
await page.evaluate(y => window.scrollTo(0, y), footerY);
await new Promise(r => setTimeout(r, 300));
await page.screenshot({
  path: `${dir}/section-footer.png`,
  clip: { x: 0, y: footerY, width: 1440, height: 600 },
});
console.log('Saved: section-footer.png');

await browser.close();
console.log('Done.');
