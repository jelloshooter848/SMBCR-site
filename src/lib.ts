/** A site-relative link that works under the GitHub Pages base path or a custom domain's root. */
export function url(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const p = path.replace(/^\//, '');
  return `${base}/${p}`;
}

/** A file in public/media. */
export const media = (file: string): string => url(`media/${file}`);
