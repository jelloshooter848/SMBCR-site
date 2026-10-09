# Game baseline: which game version the site describes

The site's content was written against this version of the game:

| | |
| --- | --- |
| **Game version** | **v0.4.32** (tag `v0.4.32` in [jelloshooter848/SMBC](https://github.com/jelloshooter848/SMBC/releases/tag/v0.4.32)) |
| **Commit** | `c87e8694fe612bcda633eab30c76bc16bc15c259` (SMBC `main`, 2026-10-08 14:23 -07:00) |
| **Media in `public/media`** | Captured from a local production build of that same commit (see `public/media/CAPTURED.txt`) |
| **Site written** | 2026-10-08 (PR #1) |

The site launches for **Chapter 1, v0.5.0**, which wasn't released yet. When v0.5.0 (or any later release) comes out,
compare it with v0.4.32 as below and update the site. Then update the table above to the new version, so the next
comparison starts from there.

## 1. See what changed in the game

In a clone of the game repo:

```sh
git fetch --tags
git log --oneline v0.4.32..v0.5.0                  # every commit since the baseline
git diff --stat v0.4.32..v0.5.0 -- docs src/game/characters src/content/worldmap src/game/minigames README.md CHANGELOG.md
git diff v0.4.32..v0.5.0 -- CHANGELOG.md           # the player-facing changes, release by release
```

Or on GitHub: <https://github.com/jelloshooter848/SMBC/compare/v0.4.32...v0.5.0>

The `CHANGELOG.md` sections between `## [0.4.32]` and `## [0.5.0]` are the quickest read. The file diffs below catch
what the changelog doesn't spell out.

## 2. Check each part of the site against its source

| Site content | Site file | Game source to compare |
| --- | --- | --- |
| Hero moves, power-ups, tool belts, tips, taglines | `src/data/roster.ts` (`HEROES`) | `src/game/characters/<id>/guide.ts` (Mario and Luigi: `mario/guide.ts`, with taglines in `mario/index.ts` and `luigi/index.ts`) |
| Hero list and order, new heroes | `src/data/roster.ts` (`HEROES`) | `src/game/characters/registry.ts` |
| Where each hero hides, home world | `src/data/roster.ts` (`hiddenIn`, `world`) | `docs/STORY.md` ("Who is where"), `docs/HEROES.md` |
| Mini game names and descriptions | `src/data/roster.ts` (`miniGame`) | `src/game/minigames/<id>/index.ts` (`title`), `docs/HEROES.md` |
| World titles | `src/data/roster.ts` (`WORLDS.title`) | `src/content/worldmap/world<N>.ts` (`title`) |
| Each level's look | `src/data/roster.ts` (`WORLDS.levels`) | `campaignTheme:` in `src/content/levels/world<N>/<N>-<M>.map` |
| Story text on Worlds, Chapter 2 teaser | `src/pages/worlds.astro`, `src/data/roster.ts` (`CHAPTERS`) | `docs/STORY.md` ("The story in short"), `docs/ROADMAP.md` |
| Default keys | `src/data/roster.ts` (`KEYS`), `src/pages/heroes/index.astro`, `src/pages/play.astro` | `README.md` ("Play"), the game's default key bindings |
| Feature highlights, accessibility options | `src/pages/index.astro` (`features`), `src/pages/play.astro` | `README.md` (world map, options, level editor, bonus games) |
| Bug form fields (hero list, version format) | `docs/for-smbc-repo/bug_report.yml` | `src/game/characters/registry.ts`, the title screen's version text |
| Version shown before the API answers | `src/config.ts` (`GAME.launchVersion`) | `package.json` `version` |
| Launch post | `src/content/news/2026-10-08-chapter-1.md` | `CHANGELOG.md` `## [0.5.0]` (set the post's date to the release date too) |
| Clips and screenshots | `public/media/*` | Everything visible: re-capture (step 3) |

Some things update themselves and need no work: the latest release and its zip download (Home, Play), and the
release notes on the News page. Both are read from GitHub Releases in the visitor's browser.

## 3. Re-capture the media from the release

The current clips and stills come from v0.4.32, so the title screen in `title.png` and `logo.png` reads
**PRE-RELEASE V0.4.32**. Once v0.5.0 is live:

```sh
npm run capture              # records from https://jelloshooter848.github.io/SMBC/
```

Look through the new files (each clip should show its hero playing their own level; see `tools/capture/README.md`),
then update `public/media/CAPTURED.txt` to name the version you captured from.

## 4. Finish

```sh
npm run build && npm run check
```

Commit, open a PR, and update the table at the top of this file to the new baseline.
