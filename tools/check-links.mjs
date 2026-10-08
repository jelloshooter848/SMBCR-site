#!/usr/bin/env node
// Checks every internal link, image, video and script in the built site: the target file must
// exist and a #fragment must name an element on the target page. External links are listed,
// not fetched (run with --external to check them too).
//   node tools/check-links.mjs dist [--external]
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { basePath, fileFor, pages } from './serve-dist.mjs';

const dir = resolve(process.argv[2] ?? 'dist');
const external = process.argv.includes('--external');
const SITE = 'http://site.invalid';
const attr = /\s(href|src|poster|srcset|action)="([^"]*)"/g;
const idRe = /\sid="([^"]+)"/g;

const ids = new Map();
const idsOf = (file) => {
  if (!ids.has(file)) ids.set(file, new Set([...readFileSync(file, 'utf8').matchAll(idRe)].map((m) => m[1])));
  return ids.get(file);
};

const problems = [];
const externals = new Set();
const list = await pages(dir);
for (const page of list) {
  const file = fileFor(dir, page);
  // Inline scripts can hold HTML in strings; keep only external scripts' opening tags.
  const html = readFileSync(file, 'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, (m) =>
    m.includes(' src=') ? m.slice(0, m.indexOf('>') + 1) : '',
  );
  for (const [, name, value] of html.matchAll(attr)) {
    const refs = name === 'srcset' ? value.split(',').map((s) => s.trim().split(/\s+/)[0]) : [value];
    for (const ref of refs) {
      if (!ref || ref.startsWith('data:') || ref.startsWith('mailto:') || ref.startsWith('javascript:')) continue;
      const u = new URL(ref.replace(/&amp;/g, '&'), `${SITE}${page}`);
      if (u.origin !== SITE) {
        externals.add(u.href);
        continue;
      }
      const target = fileFor(dir, u.pathname);
      if (!target) {
        problems.push(`${page}: ${name}="${ref}" → missing ${u.pathname}`);
        continue;
      }
      if (u.hash && u.hash !== '#' && target.endsWith('.html') && !idsOf(target).has(decodeURIComponent(u.hash.slice(1))))
        problems.push(`${page}: ${name}="${ref}" → no id "${u.hash.slice(1)}" on ${u.pathname}`);
    }
  }
}

if (external) {
  for (const href of externals) {
    try {
      const res = await fetch(href, { method: 'HEAD', redirect: 'follow' });
      if (res.status >= 400 && res.status !== 405 && res.status !== 403) problems.push(`external ${href} → ${res.status}`);
    } catch (e) {
      problems.push(`external ${href} → ${e.message}`);
    }
  }
}

console.log(`Checked ${list.length} pages under ${basePath() || '/'}; ${externals.size} external links${external ? ' checked' : ' not fetched'}.`);
if (problems.length) {
  console.error(problems.join('\n'));
  console.error(`${problems.length} broken link(s).`);
  process.exit(1);
}
console.log('No broken links.');
