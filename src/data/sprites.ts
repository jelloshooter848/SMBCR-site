/**
 * The site's own pixel-art accents, drawn for this site. Each sprite is a list of rows; each
 * character is a palette key ('.' is transparent). <PixelArt> turns them into crisp SVG.
 */

export interface Sprite {
  rows: string[];
  palette: Record<string, string>;
}

const K = '#000000';
const W = '#fcfcfc';
const GOLD = '#fcbc3c';
const ORANGE = '#c84c0c';
const RED = '#d82800';

export const SPRITES = {
  qblock: {
    palette: { k: K, g: GOLD, o: ORANGE, w: W },
    rows: [
      'oooooooooooooooo',
      'oggggggggggggggk',
      'ogkggggggggggkgk',
      'ogggggwwwwgggggk',
      'oggggwwkkwwggggk',
      'oggggwwkgwwkgggk',
      'oggggggkgwwkgggk',
      'oggggggwwwkkgggk',
      'ogggggwwkkkggggk',
      'ogggggwwkggggggk',
      'oggggggkkggggggk',
      'ogggggwwgggggggk',
      'ogggggwwkggggggk',
      'ogkggggkkgggggkk',
      'oggggggggggggggk',
      'okkkkkkkkkkkkkkk',
    ],
  },
  coin: {
    palette: { k: K, g: GOLD, o: ORANGE, w: W },
    rows: [
      '..kkkk..',
      '.kggggk.',
      'kgwgggok',
      'kgwgggok',
      'kgwgggok',
      'kgwgggok',
      'kgwgggok',
      'kgwgggok',
      'kgggggok',
      '.kooook.',
      '..kkkk..',
    ],
  },
  heart: {
    palette: { k: K, r: RED, w: W },
    rows: [
      '.kk.kk.',
      'kwrkrrk',
      'krrrrrk',
      'krrrrrk',
      '.krrrk.',
      '..krk..',
      '...k...',
    ],
  },
  star: {
    palette: { k: K, g: GOLD, w: W },
    rows: [
      '.....k.....',
      '....kgk....',
      '....kgk....',
      'kkkkgwgkkkk',
      'kggggwggggk',
      '.kggggggkk.',
      '..kggggk...',
      '..kgggggk..',
      '.kggkkkggk.',
      '.kgk...kgk.',
      '.kk.....kk.',
    ],
  },
  cloud: {
    palette: { k: K, w: W, b: '#3cbcfc' },
    rows: [
      '.......kkkk.......',
      '.....kkwwwwkk.....',
      '....kwwwwwwwwk....',
      '..kkwwwwwwwwwwkk..',
      '.kwwwwwwwwwwwwwwk.',
      'kwwwwwwwwwwwwwwwwk',
      'kwwwwwwwwwwwwwwbwk',
      '.kwwbwwwwwwwwbbwk.',
      '..kkbbwwwwwbbbkk..',
      '....kkkkkkkkkk....',
    ],
  },
  /** A rift crack, for the Chapter 2 teaser. */
  rift: {
    palette: { k: K, p: '#b53ef7', w: W },
    rows: [
      '....kk....',
      '...kpk....',
      '..kpwk....',
      '..kpwpk...',
      '...kpwpk..',
      '....kwpk..',
      '...kpwk...',
      '..kpwk....',
      '..kpk.....',
      '...kk.....',
    ],
  },
} satisfies Record<string, Sprite>;

export type SpriteName = keyof typeof SPRITES;
