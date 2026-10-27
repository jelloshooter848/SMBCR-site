# Re-capturing the clips and screenshots

The tool walks the story campaign (save files, world map, themed levels), so its output belongs to the campaign and
lives in `campaign/media`, published only with `SHOW_CAMPAIGN=1` (docs/CAMPAIGN.md). Classic-mode media goes in
`public/media`.

Everything in `campaign/media` comes from the game itself (the remake's own original art), recorded by
`tools/capture/capture.mjs` with Playwright and cut with ffmpeg.

| File                                    | What it is                                                      |
| --------------------------------------- | --------------------------------------------------------------- |
| `hero-<id>.webm`, `hero-<id>.mp4`       | A 6-second loop of the hero in their themed level (VP9 / H.264) |
| `hero-<id>.png`                         | A still from the same run: poster, reduced-motion and card image |
| `map-smb-<n>.png`                       | Each world's map page                                           |
| `title.png`, `logo.png`, `hero-select.png` | The title screen, its logo, and the hero select screen       |

## Run it

You need Node 22.18 or newer, `npm ci` done, Chromium for Playwright (`npx playwright install chromium`) and
**ffmpeg** on your PATH (`brew install ffmpeg`, `sudo apt install ffmpeg`, or `winget install ffmpeg`).

```sh
npm run capture                                  # everything, from the live game
npm run capture -- --only link,samus             # just these heroes
npm run capture -- --only smb-2 --skip-clips     # just World 2's map
npm run capture -- --url http://localhost:4173/  # a local build of the game (pnpm build && pnpm preview)
```

Options: `--url` (default `https://jelloshooter848.github.io/SMBC/`), `--out` (default `campaign/media`), `--only` (hero
ids, map page ids such as `smb-3`, and `screens` for the title, logo and hero select), `--skip-clips`, `--skip-maps`.
Set `CHROMIUM_PATH` to use a particular Chromium. Commit the new files afterwards.

## How it works

- It seeds a save file in the browser's localStorage (all eight worlds open, every hero freed, standing on the level
  to record) and turns on the game's dev mode, which those save flags need. Nothing touches your own saves: each run
  uses a fresh browser profile.
- It walks title → file select → world map → hero select like a player, waiting for each screen (the title's bright
  sky, the file select's dark menu, the map replacing it, and the level card the game's screen-reader announcer reads
  out: "World 2-1. 9 lives.").
- In the level it holds right, jumps and attacks for 7 seconds, takes the still at 1.5 s, and keeps 6 seconds of the
  recording, encoded at 512×480 (2× the game's 256×240), each well under 1 MB.

Which level each hero plays is `capture` in `src/data/roster.ts`. A new hero there gets a clip on the next run.

If the game's menus change and the walk gets lost, the error says which screen it was waiting for. The clips are
best captured from a release build, so the title screen shows a release version.

## Classic mode: the Heroes page's sprites and clips

Two more tools make the Classic media in `public/media/classic`, also straight from the game:

| File                                      | What it is                                                         | Made by                  |
| ----------------------------------------- | ------------------------------------------------------------------ | ------------------------ |
| `sprites/<id>.png`                        | Every hero's and look's hero-select art, at the game's own size    | `classic-sprites.mjs`    |
| `hero-<id>.webm`, `.mp4`, `.png`          | A 6-second Classic clip of each hero, and a still from it          | `classic-clips.mjs`      |
| `difficulty-<easy\|normal\|hard>.*`       | The same run through the start of 1-1 at each Map Difficulty        | `classic-difficulty.mjs` |

```sh
# Sprites: they are drawn in code, so this reads them from the game's Vite dev server (pnpm dev in the game repo).
npm run capture:sprites -- --url http://localhost:5173/
# Clips: each hero starts a Classic run from a level link (?level=1-1&char=link) and plays a few seconds.
npm run capture:classic                                   # from the live game
npm run capture:classic -- --only ryu,bill --url http://localhost:5173/
# Difficulty: a level link always plays Normal, so this starts each run as the dev START page does (dev server only).
npm run capture:difficulty -- --url http://localhost:5173/
```

A hero's clip level is `clipLevel` in `src/data/classic.ts` (1-1 if unset), and a look's sprite ids are its
`sprites`. Look at the new clips before committing: the play pattern is the same simple run, jump and attack as above.
The difficulty clips use an autopilot (run right; jump at walls, at enemies ahead and at the Hard pits listed in
`PITS`), so all three runs play alike; the tool warns if the hero loses a life.
