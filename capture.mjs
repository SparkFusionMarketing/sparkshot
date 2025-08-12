import { chromium, devices } from 'playwright';
import fs from 'fs';
import path from 'path';

const TRACKER_HOSTS = [
  'googletagmanager.com','www.googletagmanager.com','google-analytics.com','analytics.google.com',
  'doubleclick.net','facebook.net','facebook.com','connect.facebook.net',
  'hotjar.com','fullstory.com','segment.com','clarity.ms','cdn.segment.com',
  'tiktok.com','snapchat.com','mouseflow.com','cookiebot.com','g2insights.com'
];

const DESKTOP_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit(537.36) Chrome/126.0.0.0 Safari/537.36';

export async function capture(url, outDir = 'screens') {
  if (!url) throw new Error('Missing URL');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const NAME = buildName(url);
  const desktopFile = path.join(outDir, `${NAME('desktop')}`);
  const mobileFile  = path.join(outDir, `${NAME('mobile')}`);

  const browser = await chromium.launch({
    // channel: 'chrome', // uncomment if site is bot-shy and you've installed Chrome with: npx playwright install chrome
    args: ['--disable-blink-features=AutomationControlled']
  });

  try {
    await shootDesktop(browser, url, desktopFile);
    await shootMobile(browser, url, mobileFile);
  } finally {
    await browser.close();
  }
  return { desktopFile, mobileFile };
}

function buildName(rawUrl){
  const pad = (n) => String(n).padStart(2, '0');
  const ts = () => {
    const d = new Date();
    return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  };
  const domain = (() => {
    try {
      const host = new URL(rawUrl).hostname.replace(/^www\./, '');
      return host.toLowerCase();
    } catch {
      return String(rawUrl).toLowerCase().replace(/^https?:\/\//, '');
    }
  })();
  const safe = (s) => s.replace(/[^a-z0-9.-]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const base = safe(domain);
  return (device) => `${base}-${device}-${ts()}.png`;
}

async function shootDesktop(browser, url, outPath) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    userAgent: DESKTOP_UA,
    javaScriptEnabled: true,
    locale: 'en-US',
    serviceWorkers: 'block'
  });
  await hardenContext(ctx);
  const page = await ctx.newPage();
  await resilientGoto(page, url);
  await page.waitForTimeout(1200);
  await autoScroll(page);
  await page.screenshot({ path: outPath, fullPage: true });
  await ctx.close();
}

async function shootMobile(browser, url, outPath) {
  const iPhone = devices['iPhone 14 Pro'];
  const ctx = await browser.newContext({ ...iPhone, serviceWorkers: 'block' });
  await hardenContext(ctx);
  const page = await ctx.newPage();
  await resilientGoto(page, url);
  await page.waitForTimeout(1200);
  await autoScroll(page);
  await page.screenshot({ path: outPath, fullPage: true });
  await ctx.close();
}

// Minimal hardening
async function hardenContext(ctx) {
  try {
    await ctx.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });
  } catch {}
}

/**
 * Resilient navigation to handle sites that never reach 'networkidle'.
 */
async function resilientGoto(page, url) {
  page.setDefaultNavigationTimeout(90000);
  await page.route('**/*', (route) => {
    const u = route.request().url();
    const isTracker = TRACKER_HOSTS.some(h => u.includes(h));
    if (isTracker) return route.abort('aborted');
    return route.continue();
  });
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  try { await page.waitForLoadState('load', { timeout: 10000 }); } catch {}
  try { await page.waitForLoadState('networkidle', { timeout: 3000 }); } catch {}
  await page.waitForSelector('body', { timeout: 15000 });
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let total = 0;
      const step = 800;
      const max = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      const timer = setInterval(() => {
        window.scrollBy(0, step);
        total += step;
        if (total + window.innerHeight >= max) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}
