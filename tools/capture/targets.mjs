// What the capture tool records, read from the site's data file (src/data/roster.ts).
// Node 22.18+ imports TypeScript files directly (type stripping).
import { HEROES as ROSTER, WORLDS } from '../../src/data/roster.ts';

/** Every hero id: the seeded save frees them all. */
export const HEROES = ROSTER.map((h) => h.id);

/** One clip per hero, in their own themed level. */
export const CAPTURES = ROSTER.map((h) => ({ hero: h.id, ...h.capture }));

/** One screenshot per world map page, standing on its first level with its own hero. */
export const MAPS = WORLDS.map((w) => ({
  page: w.page,
  node: `${w.number}-1`,
  hero: ROSTER.find((h) => h.world === w.number)?.id ?? 'mario',
}));
