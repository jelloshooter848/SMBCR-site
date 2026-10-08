# SMBC REMIX website

The official website for **Super Mario Bros. Crossover: REMIX**, a free fan remake of Jay Pavlina's
_Super Mario Bros. Crossover_ (Exploding Rabbit, 2010), playable in the browser.

**Live:** <https://jelloshooter848.github.io/SMBCR-site/> · **The game:** <https://jelloshooter848.github.io/SMBC/> ·
**Game source:** [jelloshooter848/SMBC](https://github.com/jelloshooter848/SMBC)

This repo holds only the site. It's a static site built with [Astro](https://astro.build) and deployed to GitHub
Pages by GitHub Actions. There's no backend: the forum is GitHub Discussions (embedded with giscus), bug reports go to
the game repo's issues, and the latest release is read from the GitHub API in the visitor's browser.

## Pages

| Page        | What's there                                                                                   |
| ----------- | ---------------------------------------------------------------------------------------------- |
| `/`         | Banner, PLAY button, pitch, clips, features, heroes, latest release                            |
| `/play/`    | The game embedded in the page (loads on click), full-screen button, tips, download             |
| `/heroes/`  | Every hero, and a page each with their moves, power-ups, tool belt, clip and home world        |
| `/worlds/`  | The story, the eight themed worlds with their maps, and the Chapter 2 teaser                   |
| `/news/`    | News posts (Markdown) and the release notes from GitHub Releases                               |
| `/community/` | The forum, the giscus thread, house rules and how to report a bug                            |
| `/about/`   | The tribute, credits, the fan-project disclaimer and privacy                                   |

## Run it locally

Needs Node 22.12 or newer (22.18+ for the capture tool).

```sh
npm ci
npm run dev       # http://localhost:4321/SMBCR-site/
npm run build     # static site in dist/
npm run preview   # serve dist/
```

Checks (the same ones CI runs, after `npm run build`):

```sh
npm run check:html   # html-validate on every page
npm run check:links  # every internal link, image and #anchor resolves (add -- --external to fetch external links)
npm run check:a11y   # axe-core WCAG 2.2 AA at desktop and phone widths, one <h1>, no sideways scrolling
npm run check        # all three
```

The accessibility check needs Playwright's Chromium once: `npx playwright install chromium`.

## Deploy

Push to `main` (or merge a PR). `.github/workflows/deploy.yml` builds, runs the checks and publishes `dist/` to GitHub
Pages. Pull requests run the build and checks without deploying. One-time setup (Pages, Discussions, giscus, the bug
form) is in [docs/SETUP.md](docs/SETUP.md).

The site lives under `/SMBCR-site/`. Every internal link goes through `url()` in `src/lib.ts`, so the base path is
set in one place: the `SITE_URL` and `BASE_PATH` environment variables (read in `astro.config.mjs`; in CI they come
from the repo's Actions variables). For a custom domain, see [docs/SETUP.md](docs/SETUP.md#5-optional-a-custom-domain).

## Add a news post

1. Create `src/content/news/YYYY-MM-DD-short-name.md`:

   ```md
   ---
   title: 'World 9 is open'
   date: 2026-11-01
   summary: 'One or two sentences for the news list and link previews.'
   image: map-smb-2.png # optional, a file in public/media for link previews
   draft: false # optional; true keeps it out of the build
   ---

   The post, in Markdown. Link to site pages relatively, like [the heroes](../../heroes/).
   ```

2. Commit and push. The file name (without `.md`) becomes the address: `/news/2026-11-01-world-9/`.

Release notes don't need a post: the News page lists the game's GitHub Releases on its own.

## Change hero or world data

Heroes, worlds and chapters are all in [`src/data/roster.ts`](src/data/roster.ts). The moves follow each hero's in-game
guide (`src/game/characters/<id>/guide.ts` in the game repo). To add a Chapter 2 hero: add an entry with `chapter: 2`,
run the capture tool for its clip (below), and the Heroes pages, cards and nav pick it up.

## Settings and placeholders

[`src/config.ts`](src/config.ts) holds the game's URL and repo, the forum and bug-report links, and the giscus ids
(placeholders until the owner fills them in, see [docs/SETUP.md](docs/SETUP.md)).

## Clips and screenshots

`public/media` is captured from the game with Playwright: `npm run capture`. See
[tools/capture/README.md](tools/capture/README.md). `npm run screenshots` (after a build) takes full-page shots of
the site at desktop and phone widths into `docs/screenshots/`.

## Licenses and credits

The site's code and text are MIT licensed (see [LICENSE](LICENSE)). The pixel-art accents in `src/data/sprites.ts` are
drawn for this site. Game captures in `public/media` show the remake's own original art (MIT, from the SMBC project).
Fonts: Press Start 2P and Atkinson Hyperlegible (SIL Open Font License), bundled through Fontsource.

Fan project: not affiliated with or endorsed by Nintendo, Capcom, Konami, Tecmo / Koei Tecmo, Sunsoft or Exploding
Rabbit. All characters belong to their owners.
