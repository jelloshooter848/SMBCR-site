import { defineConfig } from 'astro/config';
import { cpSync, createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

// GitHub Pages serves this repo at https://jelloshooter848.github.io/SMBCR-site/.
// For a custom domain, set SITE_URL=https://your.domain and BASE_PATH=/ (the deploy workflow
// reads them from the repo's Actions variables) and add public/CNAME. See README.md.
const site = process.env.SITE_URL || 'https://jelloshooter848.github.io';
const base = process.env.BASE_PATH || '/SMBCR-site';

// The story campaign's media (clips and screenshots of Chapter 1) lives in campaign/media, outside
// public/, so it is published only with SHOW_CAMPAIGN=1: then it is served at media/ next to the
// rest (docs/CAMPAIGN.md). Without the flag none of it gets a URL.
const SHOW_CAMPAIGN = process.env.SHOW_CAMPAIGN === '1';
const CAMPAIGN_MEDIA = resolve('campaign/media');
const TYPES = { '.png': 'image/png', '.webm': 'video/webm', '.mp4': 'video/mp4', '.txt': 'text/plain' };

/** @type {import('astro').AstroIntegration} */
const campaignMedia = {
  name: 'campaign-media',
  hooks: {
    'astro:server:setup': ({ server }) => {
      if (!SHOW_CAMPAIGN) return;
      const prefix = `${base.replace(/\/$/, '')}/media/`;
      server.middlewares.use((req, res, next) => {
        const path = (req.url ?? '').split('?')[0];
        if (!path.startsWith(prefix)) return next();
        const file = join(CAMPAIGN_MEDIA, normalize(decodeURIComponent(path.slice(prefix.length))).replace(/^(\.\.[/\\])+/, ''));
        if (!existsSync(file) || !statSync(file).isFile()) return next();
        res.setHeader('content-type', TYPES[extname(file)] ?? 'application/octet-stream');
        createReadStream(file).pipe(res);
      });
    },
    'astro:build:done': ({ dir }) => {
      if (SHOW_CAMPAIGN) cpSync(CAMPAIGN_MEDIA, join(dir.pathname, 'media'), { recursive: true });
    },
  },
};

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  build: { format: 'directory' },
  // No backend: every page is static HTML.
  output: 'static',
  integrations: [campaignMedia],
});
