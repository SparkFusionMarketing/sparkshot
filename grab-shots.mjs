import { chromium, devices } from 'playwright';
import fs from 'fs';
import path from 'path';

const url = process.argv[2];
if (!url) {
  console.error('Usage: node grab-shots.mjs <url> [outdir]');
  process.exit(1);
}
const outDir = process.argv[3] || 'screens';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const slug = (s) => s.replace(/^https?:\/\//, '')
  .replace(/[^a-z0-9]/gi, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '')
  .toLowerCase();

const desktopFile = path.join(outDir, `${slug(url)}-desktop.png`);
const mobileFile  = path.join(outDir, `${slug(url)}-mobile.png`);

const timeout = 60000;

async function shootDesktop(browser) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle', timeout });
  await page.waitForTimeout(1500);
  await autoScroll(page);
  await page.screenshot({ path: desktopFile, fullPage: true });
  await ctx.close();
}

async function shootMobile(browser) {
  const iPhone = devices['iPhone 14 Pro'];
  const ctx = await browser.newContext({ ...iPhone });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle', timeout });
  await page.waitForTimeout(1500);
  await autoScroll(page);
  await page.screenshot({ path: mobileFile, fullPage: true });
  await ctx.close();
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let total = 0;
      const step = 800;
      const timer = setInterval(() => {
        window.scrollBy(0, step);
        total += step;
        if (total >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

(async () => {
  const browser = await chromium.launch();
  await shootDesktop(browser);
  await shootMobile(browser);
  await browser.close();
  console.log('Saved:');
  console.log(' ', desktopFile);
  console.log(' ', mobileFile);
})();
