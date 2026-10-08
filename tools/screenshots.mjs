#!/usr/bin/env node
// Full-page screenshots of the built site at desktop and phone widths (for PRs and reviews).
//   node tools/screenshots.mjs [dist] [out=docs/screenshots]
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { serve } from './serve-dist.mjs';

const dir = resolve(process.argv[2] ?? 'dist');
const out = resolve(process.argv[3] ?? 'docs/screenshots');
mkdirSync(out, { recursive: true });
const PAGES = [
  ['home', ''],
  ['play', 'play/'],
  ['heroes', 'heroes/'],
  ['hero-link', 'heroes/link/'],
  ['worlds', 'worlds/'],
  ['news', 'news/'],
  ['community', 'community/'],
  ['about', 'about/'],
];
const SIZES = [
  { name: 'desktop', viewport: { width: 1280, height: 800 } },
  { name: 'phone', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 },
];

const site = await serve(dir);
const launch = { args: ['--no-proxy-server'] };
if (process.env.CHROMIUM_PATH) launch.executablePath = process.env.CHROMIUM_PATH;
const browser = await chromium.launch(launch);
try {
  for (const size of SIZES) {
    const context = await browser.newContext({ ...size, reducedMotion: 'reduce' });
    for (const [name, path] of PAGES) {
      const page = await context.newPage();
      await page.goto(`${site.origin}${site.base}/${path}`, { waitUntil: 'networkidle' }).catch(() => {});
      // Scroll through once so lazy images load, then back to the top.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(800);
      const file = join(out, `${name}-${size.name}.jpg`);
      await page.screenshot({ path: file, fullPage: true, type: 'jpeg', quality: 70 });
      console.log(file);
      await page.close();
    }
    await context.close();
  }
} finally {
  await browser.close();
  site.close();
}
