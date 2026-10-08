#!/usr/bin/env node
// Captures the clips and screenshots the site uses, straight from the game (the remake's own
// original art). See tools/capture/README.md.
//
//   node tools/capture/capture.mjs [--url <game url>] [--out public/media] [--only link,samus]
//                                  [--skip-clips] [--skip-maps]
//
// For each hero it seeds a save file in the browser (every world open, every hero freed), walks
// from the title screen through the file select and the world map into the hero's own themed
// level, and records a few seconds of play with Playwright. ffmpeg (on PATH) then cuts that into
// a small WebM (VP9) and MP4 (H.264) and a PNG still. It also saves the title screen, the hero
// select screen and a screenshot of each world's map page.

import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { CAPTURES, HEROES, MAPS } from './targets.mjs';

const args = process.argv.slice(2);
const opt = (name, d) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : d;
};
const flag = (name) => args.includes(`--${name}`);

const GAME_URL = opt('url', 'https://jelloshooter848.github.io/SMBC/');
const OUT = resolve(opt('out', 'public/media'));
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
// Local servers must not go through a configured proxy.
if (/localhost|127\.0\.0\.1/.test(GAME_URL)) launchOpts.args.push('--no-proxy-server');
const browser = await chromium.launch(launchOpts);

/** A save file with all eight SMB worlds open and every hero freed, standing on `node`. */
function seedSave(hero, page, node) {
  const now = Date.now();
  return {
    v: 3,
    slot: 1,
    created: now,
    updated: now,
    character: hero,
    character2: null,
    lives: 9,
    score: 0,
    coins: 0,
    powerState: 'small',
    hp: 0,
    kit: {},
    powerState2: 'small',
    hp2: 0,
    kit2: {},
    cleared: ['1-0'],
    pages: ['smb-1', 'smb-2', 'smb-3', 'smb-4', 'smb-5', 'smb-6', 'smb-7', 'smb-8'],
    secrets: [],
    position: { page, node },
    gameCleared: false,
    lastNode: { [page]: node },
    pendingReveal: [],
    devUnlockAll: true,
    devAllHeroes: true,
    devGateOpen: false,
    freed: HEROES,
    tutorials: HEROES,
    met: HEROES,
    inventoryUnlocked: false,
    bonusOpen: true,
    bonusGuard: false,
  };
}

async function openPage(context, hero, page, node, dev = true) {
  const p = await context.newPage();
  const save = JSON.stringify(seedSave(hero, page, node));
  // Seed only on the first load of this context, so the game's own writes stick afterwards.
  // Dev mode makes the seeded file's "unlock all" and "all heroes" flags count.
  await p.addInitScript(
    ([s, dev]) => {
      if (!sessionStorage.getItem('capture-seeded')) {
        localStorage.clear();
        localStorage.setItem('smbc.save.1', s);
        localStorage.setItem('smbc.settings', JSON.stringify({ dev }));
        sessionStorage.setItem('capture-seeded', '1');
      }
    },
    [save, dev],
  );
  p.on('pageerror', (e) => console.warn(`  page error: ${e.message}`));
  await p.goto(GAME_URL, { waitUntil: 'load' });
  await p.waitForTimeout(1800);
  return p;
}

// Held for a few frames: the game reads keys once per frame and can miss a tap.
const press = async (p, key, wait = 450) => {
  await p.keyboard.down(key);
  await p.waitForTimeout(90);
  await p.keyboard.up(key);
  await p.waitForTimeout(wait);
};

/** Polls `test` every 250 ms for up to `ms`; true once it passes. */
async function waitFor(p, test, ms) {
  for (const end = Date.now() + ms; Date.now() < end; await p.waitForTimeout(250)) if (await test()) return true;
  return false;
}

/** Title → Start game → file 1 → the world map, standing on the seeded node. */
async function toMap(p) {
  // The title (bright sky) follows the rift intro; then Start game opens the (dark) file select.
  await waitFor(p, async () => (await litShare(p)) > 0.3, 8000);
  for (let i = 0; i < 4 && (await litShare(p)) > 0.15; i++) {
    await press(p, 'KeyZ', 300);
    await waitFor(p, async () => (await litShare(p)) < 0.15, 3000);
  }
  await p.waitForTimeout(400);
  await pressUntilChanged(p, 'KeyZ'); // file select: file 1, then the map
}

/** Plays `seconds` of the level with a simple run-and-jump pattern; `still` runs once, early on. */
async function play(p, hero, seconds, still) {
  const run = hero === 'mario' || hero === 'luigi';
  await p.keyboard.down('ArrowRight');
  if (run) await p.keyboard.down('KeyX');
  const begin = Date.now();
  const end = begin + seconds * 1000;
  let n = 0;
  let stillTaken = false;
  while (Date.now() < end) {
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

/**
 * Hero select and the level card are almost all black; a level is not. Samples the game's
 * canvas at low resolution and counts the pixels that are not near black.
 */
/** The game's canvas at 64x60, as one brightness value (0-765) per pixel. */
async function sample(p) {
  return p.evaluate(() => {
    const canvases = [...document.querySelectorAll('canvas')];
    const game = canvases.sort((x, y) => y.width * y.height - x.width * x.height)[0];
    if (!game) return [];
    const t = document.createElement('canvas');
    t.width = 64;
    t.height = 60;
    const ctx = t.getContext('2d');
    ctx.drawImage(game, 0, 0, 64, 60);
    const d = ctx.getImageData(0, 0, 64, 60).data;
    const out = [];
    for (let i = 0; i < d.length; i += 4) out.push(d[i] + d[i + 1] + d[i + 2]);
    return out;
  });
}

/** Share of pixels brighter than the menus' navy panels. */
async function litShare(p) {
  const px = await sample(p);
  return px.filter((v) => v > 200).length / Math.max(1, px.length);
}

/** Share of pixels that changed clearly between two samples. */
const changed = (a, b) => a.filter((v, i) => Math.abs(v - (b[i] ?? 0)) > 90).length / Math.max(1, a.length);

/** Presses `key` until the screen has mostly changed and settled (a menu gave way to the map). */
async function pressUntilChanged(p, key) {
  const before = await sample(p);
  for (let attempt = 0; attempt < 4; attempt++) {
    await press(p, key, 300);
    for (let i = 0; i < 16; i++) {
      await p.waitForTimeout(250);
      const now = await sample(p);
      if (changed(before, now) > 0.3) {
        await p.waitForTimeout(700); // let the fade finish
        return;
      }
    }
  }
  throw new Error('the screen never changed');
}

/** What the game's screen-reader announcer (an aria-live region) last said. */
const announced = (p) => p.evaluate(() => document.getElementById('announcer')?.textContent ?? '');

/**
 * From the map: enter the level, confirm the (preselected) hero until the level card is
 * announced ("World 2-1. 9 lives."), then wait for the card to give way to the level.
 */
async function enterLevel(p) {
  await press(p, 'KeyZ', 1500); // the map: enter the level
  let card = false;
  for (let attempt = 0; attempt < 4 && !card; attempt++) {
    await press(p, 'KeyZ', 200); // hero select: OK
    card = await waitFor(p, async () => /^World \d+-\d+\./.test(await announced(p)), 3000);
  }
  if (!card) throw new Error('the level card never showed');
  await p.waitForTimeout(300);
  const cardShot = await sample(p);
  const ready = await waitFor(
    p,
    async () => (await sample(p)).filter((v, i) => Math.abs(v - (cardShot[i] ?? 0)) > 40).length > cardShot.length * 0.08,
    8000,
  );
  if (!ready) throw new Error('the level never showed');
}

const ffmpeg = (a) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...a], { stdio: 'inherit' });
const kb = (f) => Math.round(statSync(f).size / 1024);

async function captureHero(t) {
  console.log(`clip: ${t.hero} in ${t.level} (${t.page})`);
  const dir = join(TMP, t.hero);
  const context = await browser.newContext({ viewport: VIEW, recordVideo: { dir, size: VIEW } });
  const p = await openPage(context, t.hero, t.page, t.level);
  // The recording starts with the page; time is measured from its first navigation.
  const t0 = await p.evaluate(() => performance.timeOrigin);
  await toMap(p);
  await enterLevel(p);
  const start = (Date.now() - t0) / 1000 + 0.3; // past the level card's last frame
  const base = join(OUT, `hero-${t.hero}`);
  // The still shown before the clip plays, under prefers-reduced-motion and on the Heroes page.
  await play(p, t.hero, CLIP_SECONDS + 1, () => p.screenshot({ path: `${base}.png` }));
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

async function captureMap(m) {
  console.log(`map: ${m.page}`);
  const context = await browser.newContext({ viewport: VIEW });
  const p = await openPage(context, m.hero, m.page, m.node);
  await toMap(p);
  await p.waitForTimeout(800);
  await p.screenshot({ path: join(OUT, `map-${m.page}.png`) });
  await context.close();
}

async function captureScreens() {
  console.log('title, logo and hero select');
  // The title without dev mode, so its menu reads as a player sees it (heroes freed by the save).
  let context = await browser.newContext({ viewport: VIEW });
  let p = await openPage(context, 'mario', 'smb-1', '1-1', false);
  await waitFor(p, async () => (await litShare(p)) > 0.3, 8000);
  await p.waitForTimeout(1500); // let the logo settle
  await p.screenshot({ path: join(OUT, 'title.png') });
  // The logo alone (the game's own art), for the home page banner.
  ffmpeg(['-i', join(OUT, 'title.png'), '-vf', 'crop=470:180:30:12', join(OUT, 'logo.png')]);
  await context.close();
  context = await browser.newContext({ viewport: VIEW });
  p = await openPage(context, 'mario', 'smb-1', '1-1');
  await toMap(p);
  await press(p, 'KeyZ', 1500);
  await p.screenshot({ path: join(OUT, 'hero-select.png') });
  await context.close();
}

const want = (id) => !ONLY.length || ONLY.includes(id);
try {
  if (want('screens')) await captureScreens();
  if (!flag('skip-clips')) for (const t of CAPTURES) if (want(t.hero)) await captureHero(t);
  if (!flag('skip-maps')) for (const m of MAPS) if (want(m.page)) await captureMap(m);
  writeFileSync(
    join(OUT, 'CAPTURED.txt'),
    `Captured from ${GAME_URL} on ${new Date().toISOString()} by tools/capture/capture.mjs\n`,
  );
} finally {
  await browser.close();
  if (!process.env.CAPTURE_DEBUG) rmSync(TMP, { recursive: true, force: true });
}
