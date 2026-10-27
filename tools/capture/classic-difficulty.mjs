#!/usr/bin/env node
// Records the same few seconds of a level at each Map Difficulty (Easy, Normal, Hard) for the
// Maps & modes page, so the three can be compared side by side. See tools/capture/README.md.
//
//   node tools/capture/classic-difficulty.mjs --url http://localhost:5173/ [--out public/media/classic]
//                                             [--level 1-1] [--hero mario]
//
// A level link always plays Normal, so this starts each run the way the game's dev START page
// does (Game.devStart, with a difficulty), which needs the game's Vite dev server (`pnpm dev` in
// the game repo; only there is the game exposed as window.__game). A small autopilot plays the
// same way each time: run right, and jump at walls, at enemies ahead and at the pits of `PITS`.

import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const opt = (name, d) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : d;
};
const GAME_URL = opt('url', 'http://localhost:5173/');
const OUT = resolve(opt('out', 'public/media/classic'));
const LEVEL = opt('level', '1-1');
const HERO = opt('hero', 'mario');
const TMP = resolve('.capture-tmp');
const VIEW = { width: 512, height: 480 };
const CLIP_SECONDS = 5;
// The pits of 1-1 on Hard (its hard layer's missing ground, in tiles): jump from just before each.
const PITS = { '1-1': [7, 32] };

mkdirSync(OUT, { recursive: true });
rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });

const launchOpts = { args: ['--autoplay-policy=no-user-gesture-required'] };
if (process.env.CHROMIUM_PATH) launchOpts.executablePath = process.env.CHROMIUM_PATH;
if (/localhost|127\.0\.0\.1/.test(GAME_URL)) launchOpts.args.push('--no-proxy-server');
const browser = await chromium.launch(launchOpts);

const announced = (p) => p.evaluate(() => document.getElementById('announcer')?.textContent ?? '');

/** The hero's position (px) and whether to jump now: a pit edge, a wall, or an enemy ahead. */
const look = (p, pits) =>
  p.evaluate((pits) => {
    const w = window.__game.scenes.stack.at(-1)?.world;
    const b = w?.players?.[0]?.body;
    if (!b) return null;
    // Bodies are in 1/256 px.
    const x = b.x / 256;
    const y = b.y / 256;
    const pit = pits.some((t) => x > t * 16 - 34 && x < t * 16 - 6);
    const enemy = [...w.entities].some((e) => {
      if (!e.alive || !e.body || !/Goomba|Koopa|Spiny|Beetle|Hammer|Enemy/i.test(e.constructor.name)) return false;
      const dx = e.body.x / 256 - x;
      return dx > 8 && dx < 48 && Math.abs(e.body.y / 256 - y) < 24;
    });
    return { x, ground: b.onGround, jump: b.onGround && (pit || b.hitWall !== 0 || enemy) };
  }, pits);

async function autopilot(p, seconds, still) {
  const pits = PITS[LEVEL] ?? [];
  await p.keyboard.down('ArrowRight');
  await p.keyboard.down('KeyX'); // run
  const begin = Date.now();
  let jumpUntil = 0;
  let stillTaken = false;
  while (Date.now() < begin + seconds * 1000) {
    if (!stillTaken && Date.now() - begin > 1500) {
      stillTaken = true;
      await still();
    }
    const s = await look(p, pits);
    const now = Date.now();
    if (jumpUntil && now > jumpUntil) {
      await p.keyboard.up('KeyZ');
      jumpUntil = 0;
    } else if (!jumpUntil && s?.jump) {
      await p.keyboard.down('KeyZ');
      jumpUntil = now + 420; // a long press: a full jump
    }
    await p.waitForTimeout(16);
  }
  await p.keyboard.up('ArrowRight');
  await p.keyboard.up('KeyX');
  await p.keyboard.up('KeyZ');
}

const ffmpeg = (a) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...a], { stdio: 'inherit' });
const kb = (f) => Math.round(statSync(f).size / 1024);

async function capture(difficulty) {
  console.log(`clip: ${HERO} in ${LEVEL} on ${difficulty}`);
  const dir = join(TMP, difficulty);
  const context = await browser.newContext({ viewport: VIEW, recordVideo: { dir, size: VIEW } });
  const p = await context.newPage();
  p.on('pageerror', (e) => console.warn(`  page error: ${e.message}`));
  const t0 = Date.now();
  await p.goto(GAME_URL, { waitUntil: 'load' });
  await p.waitForFunction(() => window.__game, null, { timeout: 120000 });
  await p.waitForTimeout(1500);
  // The same world seed every time, so the three runs differ only by difficulty.
  await p.evaluate(
    async ([level, hero, difficulty]) => {
      const reg = await import('/src/game/characters/registry.ts');
      window.__game.devStart(level, reg.characterById(hero), 'small', false, 1, {
        rules: 'classic',
        classic: true,
        difficulty,
      });
    },
    [LEVEL, HERO, difficulty],
  );
  for (let i = 0; i < 80 && !/^World /.test(await announced(p)); i++) await p.waitForTimeout(250);
  await p.waitForTimeout(2600); // the level card gives way to the level
  const lives = await announced(p);
  const start = (Date.now() - t0) / 1000;
  const base = join(OUT, `difficulty-${difficulty}`);
  await autopilot(p, CLIP_SECONDS + 0.5, () => p.screenshot({ path: `${base}.png` }));
  // A lost life shows a new level card ("World 1-1. 2 lives.").
  if ((await announced(p)) !== lives) console.warn(`  ${difficulty}: the hero lost a life; check the clip`);
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
  for (const d of ['easy', 'normal', 'hard']) await capture(d);
} finally {
  await browser.close();
  if (!process.env.CAPTURE_DEBUG) rmSync(TMP, { recursive: true, force: true });
}
