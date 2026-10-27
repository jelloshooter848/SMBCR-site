#!/usr/bin/env node
// Saves the Classic hero select's art for every hero and look (the remake's own original pixel
// art), one PNG each at the game's own size, for the Heroes pages. See tools/capture/README.md.
//
//   node tools/capture/classic-sprites.mjs --url http://localhost:5173/ [--out public/media/classic/sprites]
//
// The game must run on its Vite dev server (`pnpm dev` in the game repo): only there does it
// expose itself (window.__game) and serve its source modules, which this reads the looks from.

import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const opt = (name, d) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : d;
};
const GAME_URL = opt('url', 'http://localhost:5173/');
const OUT = resolve(opt('out', 'public/media/classic/sprites'));
mkdirSync(OUT, { recursive: true });

const launchOpts = { args: [] };
if (process.env.CHROMIUM_PATH) launchOpts.executablePath = process.env.CHROMIUM_PATH;
if (/localhost|127\.0\.0\.1/.test(GAME_URL)) launchOpts.args.push('--no-proxy-server');
const browser = await chromium.launch(launchOpts);
try {
  const p = await browser.newPage();
  await p.goto(GAME_URL);
  await p.waitForFunction(() => window.__game, null, { timeout: 120000 });
  // Each select slot's looks, in the skin menu's order, drawn as the select draws them.
  const art = await p.evaluate(async () => {
    const reg = await import('/src/game/characters/registry.ts');
    const { shownPortrait } = await import('/src/game/characters/character.ts');
    const assets = window.__game.ctx.assets;
    const out = [];
    for (const slot of reg.CLASSIC_SLOTS) {
      const looks = reg.CLASSIC_SKINS[slot] ?? [reg.CLASSIC_CHARACTERS[slot] ?? reg.characterById(slot)];
      for (const look of looks) {
        const def = reg.heroFor(look, 'classic');
        const pt = shownPortrait(def);
        const sheet = assets.sheet(pt.sheet, pt.palette);
        const f = sheet.frames.get(pt.frame);
        const c = document.createElement('canvas');
        c.width = f.w;
        c.height = f.h;
        c.getContext('2d').drawImage(sheet.image, f.x, f.y, f.w, f.h, 0, 0, f.w, f.h);
        out.push({ slot, id: def.id, name: def.name, png: c.toDataURL() });
      }
    }
    return out;
  });
  for (const a of art) {
    writeFileSync(join(OUT, `${a.id}.png`), Buffer.from(a.png.split(',')[1], 'base64'));
    console.log(`${a.slot}: ${a.id} (${a.name})`);
  }
} finally {
  await browser.close();
}
