import { defineConfig } from 'astro/config';

// GitHub Pages serves this repo at https://jelloshooter848.github.io/SMBCR-site/.
// For a custom domain, set SITE_URL=https://your.domain and BASE_PATH=/ (the deploy workflow
// reads them from the repo's Actions variables) and add public/CNAME. See README.md.
const site = process.env.SITE_URL || 'https://jelloshooter848.github.io';
const base = process.env.BASE_PATH || '/SMBCR-site';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  build: { format: 'directory' },
  // No backend: every page is static HTML.
  output: 'static',
});
