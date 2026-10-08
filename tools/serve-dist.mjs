// A tiny static server for the built site, mounted at the same base path as on GitHub Pages
// (BASE_PATH, default /SMBCR-site), for the link and accessibility checks and the screenshots.
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.json': 'application/json',
  '.txt': 'text/plain',
};

export const basePath = () => (process.env.BASE_PATH || '/SMBCR-site').replace(/\/$/, '');

/** Maps a site path (with the base) to a file in `dir`, or null. */
export function fileFor(dir, pathname) {
  const base = basePath();
  if (base && !pathname.startsWith(`${base}/`) && pathname !== base) return null;
  let rel = decodeURIComponent(pathname.slice(base.length)) || '/';
  rel = normalize(rel).replace(/^(\.\.[/\\])+/, '');
  let file = join(dir, rel);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  return existsSync(file) ? file : null;
}

export function serve(dir, port = 0) {
  const root = resolve(dir);
  const server = createServer((req, res) => {
    const { pathname } = new URL(req.url, 'http://x');
    const file = fileFor(root, pathname);
    if (!file) {
      res.writeHead(404, { 'content-type': TYPES['.html'] });
      const notFound = join(root, '404.html');
      return existsSync(notFound) ? createReadStream(notFound).pipe(res) : res.end('not found');
    }
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    createReadStream(file).pipe(res);
  });
  return new Promise((ok) =>
    server.listen(port, '127.0.0.1', () => {
      const { port: p } = server.address();
      ok({ origin: `http://127.0.0.1:${p}`, base: basePath(), close: () => server.close() });
    }),
  );
}

/** Every page in `dir`, as site paths with the base. */
export async function pages(dir) {
  const { readdir } = await import('node:fs/promises');
  const out = [];
  for (const f of await readdir(dir, { recursive: true })) {
    if (!f.endsWith('.html')) continue;
    const p = `/${f.replace(/\\/g, '/')}`.replace(/index\.html$/, '');
    out.push(`${basePath()}${p}`);
  }
  return out.sort();
}
