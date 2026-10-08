# Owner setup

A few things only the repo owner can do in GitHub's settings. The site works without them, with fallbacks: the
Community page links to Discussions instead of embedding them, and the bug button opens a blank issue until the form
is in place. Allow about 15 minutes.

## Checklist

- [ ] 1. Turn on GitHub Pages for this repo (Source: GitHub Actions)
- [ ] 2. Turn on Discussions in the SMBC game repo
- [ ] 3. Install giscus and fill in its ids in `src/config.ts`
- [ ] 4. Copy the bug report form into the SMBC game repo
- [ ] 5. (Optional) Add a custom domain

## 1. Turn on GitHub Pages

1. Open **jelloshooter848/SMBCR-site → Settings → Pages**.
2. Under **Build and deployment → Source**, pick **GitHub Actions**.
3. Merge the PR (or re-run the latest **Deploy** workflow from the **Actions** tab). The site goes live at
   <https://jelloshooter848.github.io/SMBCR-site/>.

Every push to `main` then rebuilds and deploys the site. Pull requests get the build and checks, without deploying.

## 2. Turn on Discussions (the forum)

The forum lives in the **game** repo, so players find it next to the code, the releases and the issues.

1. Open **jelloshooter848/SMBC → Settings → General**.
2. Under **Features**, tick **Discussions**. GitHub creates the default categories (Announcements, General, Ideas,
   Polls, Q&A, Show and tell).
3. Optional but nice: in the **Discussions** tab, pin a welcome post, and edit the categories (pencil icon) so
   **Show and tell** says "share your levels (paste a share link)".

The giscus threads (step 3) are created in the **General** category. To keep them separate, make a category called
**Site comments** (type: Announcement, so only giscus and maintainers start threads) and use it in step 3 instead.

## 3. Install giscus and get the ids

giscus shows a Discussions thread on the Community page and under every news post.

1. Install the giscus app on the game repo: <https://github.com/apps/giscus> → **Install** → **Only select
   repositories** → **jelloshooter848/SMBC**.
2. Open <https://giscus.app>. In **Repository**, type `jelloshooter848/SMBC`; it should say the repo meets all the
   criteria (public, giscus installed, Discussions on).
3. **Page ↔ Discussions mapping:** pick **Discussion title contains page pathname**.
4. **Discussion category:** pick the category from step 2 (General, or Site comments). Tick
   **Only search for discussions in this category**.
5. Scroll to **Enable giscus**. The snippet shows `data-repo-id="R_..."` and `data-category-id="DIC_..."`.
6. Put them in `src/config.ts`:

   ```ts
   export const GISCUS = {
     repo: COMMUNITY.discussionsRepo,
     repoId: 'R_kgDO...', // ← data-repo-id
     category: 'General', // ← the category name you picked
     categoryId: 'DIC_kwDO...', // ← data-category-id
     ...
   ```

7. Commit to `main` (or a PR). The placeholders `OWNER_FILL_IN_...` are what keeps the embed switched off; once both
   are replaced, it switches on.

## 4. Copy the bug report form

The **Report a bug** button opens `https://github.com/jelloshooter848/SMBC/issues/new?template=bug_report.yml`.

1. In the game repo, create `.github/ISSUE_TEMPLATE/bug_report.yml` with the contents of
   [`docs/for-smbc-repo/bug_report.yml`](for-smbc-repo/bug_report.yml) from this repo. (GitHub's web editor: **Add
   file → Create new file**, type the path, paste, commit.)
2. Optional: also copy [`docs/for-smbc-repo/config.yml`](for-smbc-repo/config.yml) to
   `.github/ISSUE_TEMPLATE/config.yml`. It adds a "Questions, ideas and chat" link to Discussions on the
   new-issue page.
3. The form adds the `bug` label. GitHub repos have it by default; if it was deleted, create it (**Issues → Labels →
   New label**).
4. Test it: open the link above. You should see the form with Build / version, Hero, Level, Steps, Expected, Actual
   and Device / browser.

## 5. (Optional) A custom domain

1. Buy the domain and point it at GitHub Pages (GitHub docs: "Managing a custom domain for your GitHub Pages site").
2. In **SMBCR-site → Settings → Pages → Custom domain**, enter it and tick **Enforce HTTPS** once it's offered.
3. In **Settings → Secrets and variables → Actions → Variables**, add:
   - `SITE_URL` = `https://your.domain`
   - `BASE_PATH` = `/`
4. Add a file `public/CNAME` containing just the domain (`your.domain`), commit, and the next deploy uses it.

Note: on a custom domain the site and the game are on different origins, so the embedded game on /play keeps its own
save files, separate from the full-screen game's. On `jelloshooter848.github.io` they share them.

## If the game repo is renamed

The game's address, repo and API URLs are all in `src/config.ts` (`GAME_REPO` and `GAME.playUrl`). Change them there
and in `docs/for-smbc-repo/bug_report.yml`.
