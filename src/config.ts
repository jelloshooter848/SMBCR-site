/**
 * The site's settings in one place. Everything marked OWNER is filled in by the repo owner
 * (see docs/SETUP.md); until then the site shows a friendly fallback instead.
 */

/** The GitHub repo the game lives in (releases, issues, discussions). */
const GAME_REPO = 'jelloshooter848/SMBC';

export const SITE = {
  name: 'Super Mario Bros. Crossover: REMIX',
  shortName: 'SMBC REMIX',
  description:
    'A free fan remake of Super Mario Bros. Crossover. Play Super Mario Bros. as Link, Mega Man, Samus, Simon, Ryu, Bill and Sophia III, right in your browser.',
  /** The repo this site is built from. */
  siteRepo: 'jelloshooter848/SMBCR-site',
};

export const GAME = {
  repo: GAME_REPO,
  /** The live game (GitHub Pages of the game repo). Embedded on /play and opened full screen. */
  playUrl: 'https://jelloshooter848.github.io/SMBC/',
  repoUrl: `https://github.com/${GAME_REPO}`,
  releasesUrl: `https://github.com/${GAME_REPO}/releases`,
  latestReleaseUrl: `https://github.com/${GAME_REPO}/releases/latest`,
  /** Read in the browser for the download button and the news page. */
  releasesApi: `https://api.github.com/repos/${GAME_REPO}/releases`,
  /** Shown until the GitHub API answers (and if it never does). */
  launchVersion: '0.5.0',
  chapter: 'Chapter 1',
};

export const COMMUNITY = {
  /** The repo whose GitHub Discussions are the forum. */
  discussionsRepo: GAME_REPO,
  discussionsUrl: `https://github.com/${GAME_REPO}/discussions`,
  /** The bug report form (docs/for-smbc-repo/bug_report.yml, copied into the game repo). */
  bugReportUrl: `https://github.com/${GAME_REPO}/issues/new?template=bug_report.yml`,
  issuesUrl: `https://github.com/${GAME_REPO}/issues`,
};

/**
 * giscus (https://giscus.app) embeds a GitHub Discussions thread on the Community page and under
 * news posts. OWNER: fill in repoId and categoryId from giscus.app (docs/SETUP.md, step 3).
 */
export const GISCUS = {
  repo: COMMUNITY.discussionsRepo,
  repoId: 'OWNER_FILL_IN_REPO_ID',
  category: 'General',
  categoryId: 'OWNER_FILL_IN_CATEGORY_ID',
  /** One thread per page, matched by the page's path. */
  mapping: 'pathname',
  reactionsEnabled: '1',
  emitMetadata: '0',
  inputPosition: 'top',
  theme: 'dark_high_contrast',
  lang: 'en',
  loading: 'lazy',
};

/** True once the owner has replaced the giscus placeholders. */
export const giscusReady = !GISCUS.repoId.startsWith('OWNER_') && !GISCUS.categoryId.startsWith('OWNER_');
