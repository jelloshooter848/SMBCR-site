import { SHOW_CAMPAIGN } from './config';

/** A site-relative link that works under the GitHub Pages base path or a custom domain's root. */
export function url(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const p = path.replace(/^\//, '');
  return `${base}/${p}`;
}

/** A file served at media/: public/media, plus campaign/media with SHOW_CAMPAIGN=1. */
export const media = (file: string): string => url(`media/${file}`);

/** Whether a news post is built: not a draft, and campaign posts only with SHOW_CAMPAIGN=1. */
export const isPublished = (post: { data: { draft: boolean; campaign: boolean } }): boolean =>
  !post.data.draft && (SHOW_CAMPAIGN || !post.data.campaign);
