import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--no-sandbox'],
  headless: 'new',
});

const page = await browser.newPage();
await page.setViewport({ width: 800, height: 600 });

// Test 1: plain img
await page.setContent(`<html><body style="background:#0f0b0a"><img src="http://localhost:3000/brand_assets/ILLUSTRATION.png" style="width:400px"></body></html>`);
await page.waitForNetworkIdle();
await page.screenshot({ path: 'temporary screenshots/diag-plain.png' });
console.log('plain');

// Test 2: with filter
await page.setContent(`<html><body style="background:#0f0b0a"><img src="http://localhost:3000/brand_assets/ILLUSTRATION.png" style="width:400px; filter: drop-shadow(0 32px 64px rgba(233,0,0,0.12))"></body></html>`);
await page.waitForNetworkIdle();
await page.screenshot({ path: 'temporary screenshots/diag-filter.png' });
console.log('filter');

// Test 3: with animation
await page.setContent(`<html><body style="background:#0f0b0a"><style>@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} } .f{animation:float 7s infinite}</style><img class="f" src="http://localhost:3000/brand_assets/ILLUSTRATION.png" style="width:400px"></body></html>`);
await page.waitForNetworkIdle();
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: 'temporary screenshots/diag-anim.png' });
console.log('animation');

await browser.close();
