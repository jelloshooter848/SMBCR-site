#!/usr/bin/env node
// Builds the archived game versions the site lets people play in the browser (/versions/).
//
//   node tools/archive/build-versions.mjs [--out public/versions] [--cache .versions-cache] [--only v0.2.0]
//
// Which versions: every major and minor release of the game, the tags vX.Y.0 (patch releases are
// left out). For each one it clones the game at that tag, builds it with the game's own tooling for
// its folder on this site (<BASE_PATH>/versions/<tag>/), and adds tools/archive/isolate-storage.js so
// the old version keeps its own saves. Built versions are kept in the cache folder and reused, so
// each is built once (CI caches the folder). Nothing here is committed: public/versions is ignored.
// It also writes public/versions/index.json, which the /versions/ page lists.
//
// Needs git, Node 22 and pnpm (corepack) on PATH, and network access to GitHub and npm.

import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);
const opt = (name, d) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : d;
};
const REPO = process.env.GAME_REPO_URL || 'https://github.com/jelloshooter848/SMBC.git';
const OUT = resolve(opt('out', 'public/versions'));
const CACHE = resolve(opt('cache', '.versions-cache'));
const ONLY = (opt('only', '') ?? '').split(',').filter(Boolean);
const BASE = (process.env.BASE_PATH || '/SMBCR-site').replace(/\/$/, '');
const SHIM = readFileSync(new URL('./isolate-storage.js', import.meta.url), 'utf8');
// Bump when the build steps or the shim change, so cached builds are redone.
const RECIPE = 1;

const run = (cmd, argv, opts = {}) =>
  execFileSync(cmd, argv, { stdio: ['ignore', 'pipe', 'inherit'], encoding: 'utf8', ...opts });

/** The game's vX.Y.0 tags, oldest first. */
function minorTags() {
  const out = run('git', ['ls-remote', '--tags', '--refs', REPO]);
  const tags = out
    .split('\n')
    .map((l) => l.split('refs/tags/')[1])
    .filter((t) => t && /^v\d+\.\d+\.0$/.test(t));
  const n = (t) => t.slice(1).split('.').map(Number);
  return tags.sort((a, b) => {
    const [x, y] = [n(a), n(b)];
    return x[0] - y[0] || x[1] - y[1];
  });
}

/** Adds the storage shim as the first thing in <head> of every HTML file under `dir`. */
function addShim(dir, tag) {
  const script = `<script>${SHIM.replace('__PREFIX__', `smbcr-archive@${tag}:`)}</script>`;
  for (const f of readdirSync(dir, { recursive: true })) {
    if (!String(f).endsWith('.html')) continue;
    const file = join(dir, String(f));
    const html = readFileSync(file, 'utf8');
    if (!/<head[^>]*>/i.test(html)) throw new Error(`${tag}: no <head> in ${f}`);
    writeFileSync(file, html.replace(/<head[^>]*>/i, (m) => `${m}${script}`));
  }
}

function build(tag) {
  const dest = join(CACHE, 'builds', tag);
  const stampFile = join(dest, '.smbcr-archive.json');
  const stamp = { tag, base: `${BASE}/versions/${tag}/`, recipe: RECIPE };
  if (existsSync(stampFile)) {
    const old = JSON.parse(readFileSync(stampFile, 'utf8'));
    if (old.base === stamp.base && old.recipe === RECIPE) {
      console.log(`${tag}: cached`);
      return old;
    }
  }
  console.log(`${tag}: building for ${stamp.base}`);
  const src = join(CACHE, 'src', tag);
  rmSync(src, { recursive: true, force: true });
  mkdirSync(join(CACHE, 'src'), { recursive: true });
  run('git', ['-c', 'advice.detachedHead=false', 'clone', '--quiet', '--depth', '1', '--branch', tag, REPO, src], {
    env: { ...process.env, GIT_LFS_SKIP_SMUDGE: '1' },
  });
  const date = run('git', ['-C', src, 'log', '-1', '--format=%cI']).trim();
  const version = JSON.parse(readFileSync(join(src, 'package.json'), 'utf8')).version;
  const env = { ...process.env, VITE_BASE: stamp.base, RELEASE_TAG: tag, CI: 'true' };
  run('pnpm', ['install', '--frozen-lockfile', '--silent'], { cwd: src, env });
  // The game's own build, minus the type check (the tag was checked when it was released).
  // --base wins over whatever the tag's vite config does with VITE_BASE.
  run('pnpm', ['exec', 'vite', 'build', '--base', stamp.base, '--logLevel', 'warn'], { cwd: src, env });
  rmSync(dest, { recursive: true, force: true });
  cpSync(join(src, 'dist'), dest, { recursive: true });
  addShim(dest, tag);
  const entry = { ...stamp, version, date };
  writeFileSync(stampFile, JSON.stringify(entry, null, 2));
  rmSync(src, { recursive: true, force: true });
  return entry;
}

const tags = minorTags().filter((t) => !ONLY.length || ONLY.includes(t));
const built = [];
const failed = [];
for (const tag of tags) {
  try {
    built.push(build(tag));
  } catch (e) {
    // A version that no longer builds is left out rather than breaking the site.
    failed.push(tag);
    const why = `${tag}: build failed, left out of the site (${e.message.split('\n')[0]})`;
    console.error(process.env.GITHUB_ACTIONS ? `::warning title=Archived version::${why}` : why);
  }
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
for (const v of built) cpSync(join(CACHE, 'builds', v.tag), join(OUT, v.tag), { recursive: true });
writeFileSync(
  join(OUT, 'index.json'),
  JSON.stringify(
    built.map(({ tag, version, date }) => ({ tag, version, date })).reverse(),
    null,
    2,
  ),
);
console.log(`Archived ${built.length} version(s) in ${OUT}${failed.length ? `; failed: ${failed.join(', ')}` : ''}.`);
