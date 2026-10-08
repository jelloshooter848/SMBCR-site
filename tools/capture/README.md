# Re-capturing the clips and screenshots

Everything in `public/media` comes from the game itself (the remake's own original art), recorded by
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

Options: `--url` (default `https://jelloshooter848.github.io/SMBC/`), `--out` (default `public/media`), `--only` (hero
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
