#!/usr/bin/env node
// Records a short Classic mode clip of each hero for the Heroes page (the remake's own original
// art). See tools/capture/README.md.
//
//   node tools/capture/classic-clips.mjs [--url <game url>] [--out public/media/classic] [--only link,samus]
//
// Each hero starts a Classic run from a level link (?level=1-1&char=link), plays a few seconds
// with a simple run-jump-attack pattern, and ffmpeg (on PATH) cuts that into a small WebM (VP9)
// and MP4 (H.264) and a PNG still.

import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { CLASSIC_HEROES } from '../../src/data/classic.ts';

const args = process.argv.slice(2);
const opt = (name, d) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : d;
};
const GAME_URL = opt('url', 'https://jelloshooter848.github.io/SMBC/');
const OUT = resolve(opt('out', 'public/media/classic'));
const ONLY = opt('only', '')?.split(',').filter(Boolean) ?? [];
const TMP = resolve('.capture-tmp');
// The game draws 256x240 and scales by whole numbers; 512x480 gives a clean 2x.
const VIEW = { width: 512, height: 480 };
const CLIP_SECONDS = 6;

mkdirSync(OUT, { recursive: true });
rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });

const launchOpts = { args: ['--autoplay-policy=no-user-gesture-required'] };
if (process.env.CHROMIUM_PATH) launchOpts.executablePath = process.env.CHROMIUM_PATH;
if (/localhost|127\.0\.0\.1/.test(GAME_URL)) launchOpts.args.push('--no-proxy-server');
const browser = await chromium.launch(launchOpts);

/** Polls `test` every 250 ms for up to `ms`; true once it passes. */
async function waitFor(p, test, ms) {
  for (const end = Date.now() + ms; Date.now() < end; await p.waitForTimeout(250)) if (await test()) return true;
  return false;
}

/** What the game's screen-reader announcer (an aria-live region) last said. */
const announced = (p) => p.evaluate(() => document.getElementById('announcer')?.textContent ?? '');

/** Plays `seconds` of the level: run right, jump every third beat, attack on the others. */
async function play(p, hero, seconds, still) {
  // Mario and Luigi run with Attack held (and throw fireballs with it once they have a Flower).
  const run = hero === 'mario' || hero === 'luigi';
  await p.keyboard.down('ArrowRight');
  if (run) await p.keyboard.down('KeyX');
  const begin = Date.now();
  let n = 0;
  let stillTaken = false;
  while (Date.now() < begin + seconds * 1000) {
    n++;
    if (!stillTaken && Date.now() - begin > 1500) {
      stillTaken = true;
      await still();
    }
    if (n % 3 === 0) {
      await p.keyboard.down('KeyZ');
      await p.waitForTimeout(380);
      await p.keyboard.up('KeyZ');
    } else if (!run) {
      await p.keyboard.down('KeyX');
      await p.waitForTimeout(90);
      await p.keyboard.up('KeyX');
      await p.waitForTimeout(290);
    } else {
      await p.waitForTimeout(380);
    }
  }
  await p.keyboard.up('ArrowRight');
  if (run) await p.keyboard.up('KeyX');
}

const ffmpeg = (a) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...a], { stdio: 'inherit' });
const kb = (f) => Math.round(statSync(f).size / 1024);

async function captureHero(h) {
  const level = h.clipLevel ?? '1-1';
  console.log(`clip: ${h.id} in ${level}`);
  const dir = join(TMP, h.id);
  const context = await browser.newContext({ viewport: VIEW, recordVideo: { dir, size: VIEW } });
  const p = await context.newPage();
  p.on('pageerror', (e) => console.warn(`  page error: ${e.message}`));
  // A fresh profile: nothing is saved, so the run starts on 1-1's defaults (small, three lives).
  await p.addInitScript(() => {
    if (!sessionStorage.getItem('capture-seeded')) {
      localStorage.clear();
      sessionStorage.setItem('capture-seeded', '1');
    }
  });
  const t0 = Date.now();
  await p.goto(`${GAME_URL}?level=${level}&char=${h.id}`, { waitUntil: 'load' });
  // The level card ("World 1-1. 3 lives.") is announced, then gives way to the level.
  if (!(await waitFor(p, async () => /^World /.test(await announced(p)), 20000)))
    throw new Error('the level card never showed');
  await p.waitForTimeout(2600);
  const start = (Date.now() - t0) / 1000;
  const base = join(OUT, `hero-${h.id}`);
  // The still shown before the clip plays.
  await play(p, h.id, CLIP_SECONDS + 1, () => p.screenshot({ path: `${base}.png` }));
  await context.close();
  const raw = join(dir, readdirSync(dir).find((f) => f.endsWith('.webm')));
  const cut = ['-ss', start.toFixed(2), '-t', String(CLIP_SECONDS), '-i', raw, '-an'];
  ffmpeg([...cut, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '42', '-row-mt', '1', '-pix_fmt', 'yuv420p', `${base}.webm`]);
  ffmpeg([
    ...cut,
    '-c:v', 'libx264', '-preset', 'veryslow', '-crf', '30', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', `${base}.mp4`,
  ]);
  console.log(`  webm ${kb(`${base}.webm`)} KB, mp4 ${kb(`${base}.mp4`)} KB`);
}

try {
  for (const h of CLASSIC_HEROES) if (!ONLY.length || ONLY.includes(h.id)) await captureHero(h);
} finally {
  await browser.close();
  if (!process.env.CAPTURE_DEBUG) rmSync(TMP, { recursive: true, force: true });
}
