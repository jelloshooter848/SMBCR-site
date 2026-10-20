# The story campaign: hidden until 1.0

The game's release plan (owner decision, 2026-10-20): **0.5.0 is Classic mode**, a true remake of Super Mario Bros.
Crossover 3.1.21. The story campaign, **Chapter 1**, is not in 0.5.0 and arrives in **1.0**. In the game it shows as
"Chapter 1 — Coming soon!".

The site's campaign content is kept for 1.0 but not published. One build switch controls it:

```sh
npm run dev                    # the public site: Classic only
SHOW_CAMPAIGN=1 npm run dev    # preview with the campaign content back in
SHOW_CAMPAIGN=1 npm run build  # a build with it (CI never sets it)
```

The switch is `SHOW_CAMPAIGN` in `src/config.ts` (and `astro.config.mjs`, for the media).

## What is hidden

| Content | Where it is kept | Without the switch |
| --- | --- | --- |
| The Worlds page (story, eight themed worlds, maps, Chapter 2 teaser) | `src/pages/worlds/[...page].astro` | No page is generated; no nav link |
| The Chapter 1 home page | `src/campaign/HomeChapter1.astro` | `/` shows the Classic home instead |
| The campaign's heroes (nine, with home worlds, hiding places, mini games, clips and maps) | `src/pages/chapter-1/heroes/`, `src/components/HeroCard.astro`, `src/data/roster.ts` | No pages; `/heroes/` shows the Classic heroes (`src/data/classic.ts`) |
| The "Chapter 1 is here" news post | `src/content/news/2026-10-08-chapter-1.md` (`campaign: true`) | Not built |
| Clips and screenshots of the campaign (hero clips, world maps, title, hero select) | `campaign/media/` | Not copied into the site: no URLs |

Nothing hidden gets a URL, a link, a file in the build, or a search-engine listing (the site has no sitemap). The repo
itself is public, so the hidden text can still be read on GitHub; for content that must stay secret, keep it on a branch
instead.

New campaign material follows the same rules: a news post gets `campaign: true`, a campaign-only section checks
`SHOW_CAMPAIGN`, and campaign media goes in `campaign/media` (where the capture tool already writes).

## Bringing it back for 1.0

1. Make the switch default to on in `src/config.ts` and `astro.config.mjs` (or set `SHOW_CAMPAIGN: '1'` in the deploy
   workflow's `env`).
2. Re-capture the campaign media from the 1.0 build (`npm run capture`, see `tools/capture/README.md`).
3. Review the hidden pages against the game at 1.0 (`docs/GAME_BASELINE.md`), and decide how the Classic home and the
   campaign home share the front page.
4. Re-date or rewrite the Chapter 1 post, and remove `campaign: true`.
