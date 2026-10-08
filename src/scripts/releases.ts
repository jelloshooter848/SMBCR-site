/**
 * Reads the game's GitHub Releases in the browser (no server, no token). The API allows 60
 * unauthenticated requests an hour per visitor, so answers are kept in sessionStorage for 10
 * minutes. Every caller keeps a plain link to the releases page as the fallback.
 */

export interface ReleaseAsset {
  name: string;
  size: number;
  browser_download_url: string;
}

export interface Release {
  tag_name: string;
  name: string | null;
  body: string | null;
  html_url: string;
  published_at: string;
  prerelease: boolean;
  draft: boolean;
  assets: ReleaseAsset[];
}

const TTL = 10 * 60 * 1000;

async function cachedJson<T>(apiUrl: string): Promise<T> {
  const key = `smbcr:${apiUrl}`;
  try {
    const hit = sessionStorage.getItem(key);
    if (hit) {
      const { at, data } = JSON.parse(hit) as { at: number; data: T };
      if (Date.now() - at < TTL) return data;
    }
  } catch {
    /* storage blocked: fetch instead */
  }
  const res = await fetch(apiUrl, { headers: { Accept: 'application/vnd.github+json' } });
  if (!res.ok) throw new Error(`GitHub answered ${res.status}`);
  const data = (await res.json()) as T;
  try {
    sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), data }));
  } catch {
    /* fine */
  }
  return data;
}

export const latestRelease = (api: string) => cachedJson<Release>(`${api}/latest`);
export const releases = (api: string, count = 10) => cachedJson<Release[]>(`${api}?per_page=${count}`);

/** The offline zip (smbc-vX.Y.Z.zip), or any zip the release has. */
export function zipAsset(r: Release): ReleaseAsset | undefined {
  return r.assets.find((a) => /^smbc-v[\d.]+.*\.zip$/i.test(a.name)) ?? r.assets.find((a) => a.name.endsWith('.zip'));
}

export const formatSize = (bytes: number): string =>
  bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' });

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Inline Markdown on already-escaped text: code, bold, italics and http(s) links only. */
function inline(s: string): string {
  return s
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])_([^_]+)_(?=[\s).,;:!?]|$)/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>');
}

/**
 * A small, safe Markdown renderer for release notes: headings, lists (nested by indent),
 * paragraphs and inline code/bold/links. All text is escaped first, so notes can't inject HTML.
 * The notes' biggest heading becomes `<h{headingBase}>`, and the rest follow below it.
 */
export function renderNotes(md: string, headingBase = 3): string {
  const out: string[] = [];
  const depths = [...md.matchAll(/^(#{1,6})\s/gm)].map((m) => (m[1] as string).length);
  const top = depths.length ? Math.min(...depths) : 1;
  const stack: number[] = []; // indents of open <ul>s
  let para: string[] = [];
  const flushPara = () => {
    if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`);
    para = [];
  };
  const closeLists = (toIndent = -1) => {
    while (stack.length && (stack[stack.length - 1] as number) > toIndent) {
      out.push('</li></ul>');
      stack.pop();
    }
  };
  for (const raw of escapeHtml(md.replace(/\r/g, '')).split('\n')) {
    const line = raw.replace(/\s+$/, '');
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    const item = /^(\s*)[-*]\s+(.*)$/.exec(line);
    if (!line.trim()) {
      flushPara();
      continue;
    }
    if (heading) {
      flushPara();
      closeLists();
      const level = Math.min(6, headingBase + (heading[1] as string).length - top);
      out.push(`<h${level}>${inline(heading[2] as string)}</h${level}>`);
    } else if (item) {
      flushPara();
      const indent = (item[1] as string).length;
      const top = stack[stack.length - 1];
      if (top === undefined || indent > top) {
        out.push('<ul><li>');
        stack.push(indent);
      } else {
        closeLists(indent);
        if (stack.length && stack[stack.length - 1] === indent) out.push('</li><li>');
        else {
          out.push('<ul><li>');
          stack.push(indent);
        }
      }
      out.push(inline(item[2] as string));
    } else if (stack.length && /^\s+/.test(line)) {
      out.push(` ${inline(line.trim())}`); // a wrapped list item
    } else {
      closeLists();
      para.push(line.trim());
    }
  }
  flushPara();
  closeLists();
  return out.join('');
}
