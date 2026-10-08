#!/usr/bin/env node
// Runs axe-core (WCAG 2.2 A and AA rules) on every built page at desktop and phone widths, with
// reduced motion on, and fails on any violation. Also checks that every page has one <h1>.
//   node tools/check-a11y.mjs dist
// Uses Playwright's Chromium (CHROMIUM_PATH overrides the executable).
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import { pages, serve } from './serve-dist.mjs';

const dir = resolve(process.argv[2] ?? 'dist');
const site = await serve(dir);
const launch = { args: ['--no-proxy-server'] };
if (process.env.CHROMIUM_PATH) launch.executablePath = process.env.CHROMIUM_PATH;
const browser = await chromium.launch(launch);
const sizes = [
  { name: 'desktop', viewport: { width: 1280, height: 900 } },
  { name: 'phone', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
];

let failures = 0;
try {
  for (const size of sizes) {
    const context = await browser.newContext({ ...size, reducedMotion: 'reduce' });
    // The checks run offline: answer GitHub and giscus with nothing rather than reach out.
    await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
    for (const path of await pages(dir)) {
      const page = await context.newPage();
      await page.goto(`${site.origin}${path}`, { waitUntil: 'load' });
      await page.waitForTimeout(150);
      const h1s = await page.locator('h1').count();
      if (h1s !== 1) {
        failures++;
        console.error(`✗ ${size.name} ${path}: ${h1s} <h1> elements (want 1)`);
      }
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (overflow > 1) {
        failures++;
        console.error(`✗ ${size.name} ${path}: page scrolls sideways by ${overflow}px`);
      }
      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
        .analyze();
      for (const v of violations) {
        failures++;
        console.error(`✗ ${size.name} ${path}: [${v.impact}] ${v.id}: ${v.help}`);
        for (const n of v.nodes.slice(0, 5)) console.error(`    ${n.target.join(' ')}  ${n.failureSummary?.split('\n')[1]?.trim() ?? ''}`);
      }
      if (!violations.length) console.log(`✓ ${size.name} ${path}`);
      await page.close();
    }
    await context.close();
  }
} finally {
  await browser.close();
  site.close();
}
if (failures) {
  console.error(`${failures} accessibility problem(s).`);
  process.exit(1);
}
console.log('No accessibility problems found.');
