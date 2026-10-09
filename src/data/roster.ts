/**
 * The site's one data file for heroes, worlds and chapters. Pages, the hero and world cards and
 * the capture tool (tools/capture/capture.mjs) all read it.
 *
 * Adding a Chapter 2 hero or world: add an entry to HEROES / WORLDS with `chapter: 2`, put its
 * clip and stills in public/media (run the capture tool), and the pages pick it up.
 *
 * Moves, power-ups and tool belts follow each hero's in-game "How to play" guide
 * (src/game/characters/<id>/guide.ts in the SMBC repo). Default keys: arrows move, Z jump,
 * X attack / run, C special, Right Shift tools, Enter pause.
 *
 * Written against game v0.4.32; see docs/GAME_BASELINE.md before updating for a new release.
 *
 * Plain TypeScript with no enums or other non-erasable syntax, so Node can import it directly.
 */

export type Action =
  | 'left/right'
  | 'up'
  | 'down'
  | 'jump'
  | 'attack'
  | 'attack (hold)'
  | 'special'
  | 'select'
  | 'down+jump'
  | 'up+attack'
  | 'down+special';

export interface Move {
  /** The ability, as the game names it. */
  action: Action;
  /** What it does. */
  does: string;
}

export interface Item {
  item: 'mushroom' | 'flower' | 'star' | 'drops';
  does: string;
}

export interface Tool {
  name: string;
  cost?: string;
  does: string;
}

export interface Hero {
  /** The game's character id (also the media file names: hero-<id>.webm and so on). */
  id: string;
  name: string;
  /** The NES game the hero's moves come from. */
  from: string;
  /** The in-game guide's one-liner. */
  tagline: string;
  /** A short pitch, in the site's own words. */
  blurb: string;
  chapter: number;
  /** The world themed after the hero (World 1 is the plumbers' home). */
  world: number;
  /** Where the brainwashed hero waits in the campaign. */
  hiddenIn: string;
  /** The mini game that frees the hero (none for Mario, who starts free). */
  miniGame?: { name: string; blurb: string };
  /** CSS colour for the hero's accents (from their sprite). */
  color: string;
  /** Can the hero stomp enemies? */
  stomps: boolean;
  moves: Move[];
  powerups: Item[];
  belt: Tool[];
  tips: string[];
  /** What the capture tool records: the map page and level to play. */
  capture: { page: string; level: string };
}

export interface World {
  number: number;
  /** The map page's id in the game ('smb-1'..'smb-8'): the media file is map-<page>.png. */
  page: string;
  /** The map page's title, as the game shows it. */
  title: string;
  chapter: number;
  /** The hero whose homeland the world is. */
  hero: string;
  /** The game the world's look comes from. */
  style: string;
  blurb: string;
  /** What each level looks like in the campaign. */
  levels: { id: string; look: string }[];
}

export interface Chapter {
  number: number;
  name: string;
  version: string;
  status: 'released' | 'coming later';
  blurb: string;
}

export const CHAPTERS: Chapter[] = [
  {
    number: 1,
    name: 'The Mushroom Kingdom',
    version: '0.5.0',
    status: 'released',
    blurb:
      'All eight worlds of Super Mario Bros., each one themed after a captured hero, from the 1-0 warm-up to Bowser at 8-4.',
  },
  {
    number: 2,
    name: 'The Lost Kingdom',
    version: 'TBA',
    status: 'coming later',
    blurb:
      'The wand broke at 8-4 and its pieces fell through a rift into the Lost Kingdom, where Peach has been hiding all along. The Lost Levels are already playable in classic mode; their story comes in Chapter 2.',
  },
];

const PLUMBER_MOVES: Move[] = [
  { action: 'left/right', does: 'Walk. Speed builds up, turning skids.' },
  { action: 'attack (hold)', does: 'Run. Running jumps go higher and further.' },
  { action: 'jump', does: 'Jump. Hold for higher, let go to drop sooner.' },
  { action: 'down', does: 'Crouch when big. Enter a pipe that leads somewhere.' },
  { action: 'attack', does: 'With the flower: throw a fireball, two at a time.' },
];

const PLUMBER_ITEMS: Item[] = [
  { item: 'mushroom', does: 'Grow big: take one hit without dying and break bricks with your head.' },
  { item: 'flower', does: 'Fire power: bouncing fireballs that kill most enemies.' },
  { item: 'star', does: 'Invincible for a few seconds. Touching enemies kills them.' },
  { item: 'drops', does: 'None. Stomp enemies in a row without landing for bigger scores.' },
];

const STAR: Item = { item: 'star', does: 'Invincible for a few seconds.' };

export const HEROES: Hero[] = [
  {
    id: 'mario',
    name: 'Mario',
    from: 'Super Mario Bros.',
    tagline: 'The all-rounder',
    blurb:
      'The hero you start with. Classic momentum, stomps, mushrooms and fire flowers, and the only one Bowser forgot to brainwash.',
    chapter: 1,
    world: 1,
    hiddenIn: 'Free from the start. His tutorial stage, 1-0, opens every new file.',
    color: '#d82800',
    stomps: true,
    moves: PLUMBER_MOVES,
    powerups: PLUMBER_ITEMS,
    belt: [],
    tips: [
      'Stomping a koopa leaves a shell. Kick it into a line of enemies.',
      'Hidden blocks hold 1-ups. Jump under suspicious gaps.',
    ],
    capture: { page: 'smb-1', level: '1-1' },
  },
  {
    id: 'luigi',
    name: 'Luigi',
    from: 'Super Mario Bros.: The Lost Levels',
    tagline: 'Higher, floatier jumps',
    blurb:
      'The same kit as his brother with a higher jump, slower acceleration and a longer slide. He runs off in 1-1, so the first rescue is a family one.',
    chapter: 1,
    world: 1,
    hiddenIn: "1-1's bonus room, on a ledge at the top right.",
    miniGame: {
      name: 'Mirror Race',
      blurb: 'Race the brainwashed Luigi along a short course as Mario. Touch the flagpole first and he joins your file.',
    },
    color: '#00a800',
    stomps: true,
    moves: PLUMBER_MOVES,
    powerups: PLUMBER_ITEMS,
    belt: [],
    tips: [
      'Stomping a koopa leaves a shell. Kick it into a line of enemies.',
      'Hidden blocks hold 1-ups. Jump under suspicious gaps.',
    ],
    capture: { page: 'smb-1', level: '1-3' },
  },
  {
    id: 'link',
    name: 'Link',
    from: 'Zelda II: The Adventure of Link',
    tagline: 'Sword, shield and a tool belt',
    blurb:
      'A fixed-height jump, hearts, a shield that blocks shots and a sword with down- and up-thrusts. Spells and bombs fill out his tool belt.',
    chapter: 1,
    world: 2,
    hiddenIn: "2-1's sky palace, past the end of the coin heaven.",
    miniGame: {
      name: 'The Shadow Keep',
      blurb: "A small top-down dungeon, the spell's prison in Link's mind, in the style of the first Zelda.",
    },
    color: '#00a800',
    stomps: false,
    moves: [
      { action: 'left/right', does: 'Walk. No running.' },
      { action: 'jump', does: 'A fixed-height jump. Steer in the air.' },
      {
        action: 'attack',
        does: 'Slash. Breaks bricks and opens blocks. Full hearts and the red tunic fire a beam.',
      },
      { action: 'down', does: 'Crouch. In the air: down-thrust, bouncing off enemies and blocks it opens.' },
      { action: 'up', does: 'In the air: up-thrust. Hits enemies above and opens blocks.' },
      { action: 'select', does: 'Pick the next tool.' },
      { action: 'special', does: 'Use the selected tool.' },
    ],
    powerups: [
      { item: 'mushroom', does: 'A heart container, full heal, and the white tunic: every other hit glances off.' },
      { item: 'flower', does: 'The red tunic: the sword fires a beam while your hearts are full.' },
      STAR,
      { item: 'drops', does: 'Enemies drop bombs, magic jars and half hearts.' },
    ],
    belt: [
      {
        name: 'Boomerang',
        does: 'Flies out and back. Stuns what it hits and brings back coins, items and drops it touches.',
      },
      { name: 'Bomb', cost: 'ammo', does: 'Set it down and step back. Kills enemies, breaks bricks, and hurts you too.' },
      { name: 'Jump spell', cost: '8 magic', does: 'Higher jumps for ten seconds.' },
      { name: 'Shield spell', cost: '8 magic', does: 'Half damage for ten seconds.' },
      { name: 'Fire spell', cost: '4 magic', does: 'Your next swing fires a beam, whatever your hearts.' },
    ],
    tips: ['Stand still facing a shot and the shield blocks it.', 'Magic jars refill the blue meter under your hearts.'],
    capture: { page: 'smb-2', level: '2-1' },
  },
  {
    id: 'megaman',
    name: 'Mega Man',
    from: 'Mega Man',
    tagline: 'Arm cannon and a full arsenal',
    blurb:
      'Instant starts and stops, a slide, and a buster with three shots on screen. Every flower unlocks the next special weapon.',
    chapter: 1,
    world: 3,
    hiddenIn: "3-1's space station, through a hidden teleporter.",
    miniGame: {
      name: 'Station Escape',
      blurb: 'A Mega Man stage on the space station above 3-1, ending in a fight with Dark Mega Man.',
    },
    color: '#0070ec',
    stomps: false,
    moves: [
      { action: 'left/right', does: 'Run. Starts and stops at once.' },
      { action: 'jump', does: 'A tall jump. Let go early to cut it short.' },
      { action: 'down+jump', does: 'Slide: low and fast, under one-tile gaps.' },
      { action: 'attack', does: 'Fire the buster, three shots at a time.' },
      { action: 'attack (hold)', does: 'With the helmet: charge, let go for a piercing shot.' },
      { action: 'select', does: 'Pick the next weapon.' },
      { action: 'special', does: 'Fire the selected weapon.' },
    ],
    powerups: [
      { item: 'mushroom', does: 'The helmet: charge shot, brick breaking and the Rush Coil. Full heal.' },
      { item: 'flower', does: 'Unlocks the next special weapon. With all five, refills them.' },
      STAR,
      { item: 'drops', does: 'Health and weapon pellets, and the rare E-tank for a full heal from the pause menu.' },
    ],
    belt: [
      { name: 'Saw Disc', cost: '2', does: 'Aim with the d-pad in eight directions. Cuts through bricks.' },
      { name: 'Leaf Guard', cost: '4', does: 'Circles you and swats enemy shots. Press again to throw it.' },
      { name: 'Flame Wave', cost: '3', does: 'Runs along the floor. Burns shells.' },
      { name: 'Homing Knuckle', cost: '4', does: 'Slow fist that turns toward the nearest enemy. Three damage.' },
      { name: 'Bolt', cost: '5', does: 'A beam across the whole screen.' },
      { name: 'Rush Coil', cost: '3', does: 'Drops a spring ahead of you. Land on it for a huge jump.' },
    ],
    tips: ["The second bar beside your health is the selected weapon's energy."],
    capture: { page: 'smb-3', level: '3-1' },
  },
  {
    id: 'samus',
    name: 'Samus',
    from: 'Metroid',
    tagline: 'Beams, missiles and morph ball',
    blurb:
      'A floaty somersault jump, an arm cannon that aims up, and the morph ball with its bombs. Flowers upgrade the beam from Long to Ice to Wave.',
    chapter: 1,
    world: 4,
    hiddenIn: "A cavern under 4-2, down the vine area's warp pipe.",
    miniGame: {
      name: 'Zebes Escape',
      blurb: 'Fight through Tourian to the brain, destroy it, and climb to the surface before the time bomb goes off.',
    },
    color: '#e45c10',
    stomps: false,
    moves: [
      { action: 'left/right', does: 'Walk. Jump while moving to somersault.' },
      { action: 'jump', does: 'A floaty jump. Let go early to cut it short.' },
      { action: 'attack', does: 'Fire the beam, or a missile when missiles are picked.' },
      { action: 'up', does: 'Hold to aim straight up.' },
      { action: 'down', does: 'Morph ball: fits one-tile gaps, no jumping. Attack drops a bomb; up stands.' },
      { action: 'select', does: 'Switch the cannon between beam and missiles.' },
      { action: 'special', does: 'Fire a missile.' },
    ],
    powerups: [
      { item: 'mushroom', does: 'First the Varia suit (half damage), then energy tanks: +30 energy, up to 90.' },
      {
        item: 'flower',
        does: 'Beam upgrades in order: Long, Ice (freezes, a second shot shatters), Wave (goes through walls). Then +10 missiles.',
      },
      STAR,
      { item: 'drops', does: 'Energy orbs and missile packs.' },
    ],
    belt: [
      { name: 'Beam', does: 'Your current beam. Unlimited.' },
      { name: 'Missile', cost: 'ammo', does: 'Three damage and opens bricks. Up to thirty.' },
    ],
    tips: ['EN in the corner is your energy. It starts at 30.'],
    capture: { page: 'smb-4', level: '4-1' },
  },
  {
    id: 'simon',
    name: 'Simon Belmont',
    from: 'Castlevania',
    tagline: 'Whip and holy sub-weapons',
    blurb:
      'A stiff, committed jump, heavy knockback and a whip that winds up before it strikes. Hearts pay for the dagger, axe, holy water, cross and stopwatch.',
    chapter: 1,
    world: 5,
    hiddenIn: "5-4's crypt, riding the lift down past its end.",
    miniGame: {
      name: "Dracula's Castle",
      blurb: 'A Castlevania-style castle stage and the throne room, against a 300-second clock.',
    },
    color: '#ac7c00',
    stomps: false,
    moves: [
      { action: 'left/right', does: 'Walk, slowly.' },
      { action: 'jump', does: 'A committed jump: no steering in the air.' },
      { action: 'attack', does: 'Crack the whip. It winds up, so swing early.' },
      { action: 'down', does: 'Crouch, and whip low.' },
      { action: 'select', does: 'Pick the next sub-weapon.' },
      { action: 'special', does: 'Throw the selected sub-weapon. Costs hearts.' },
      { action: 'up+attack', does: 'Also throws the sub-weapon.' },
    ],
    powerups: [
      { item: 'mushroom', does: 'Unlocks the next sub-weapon. Full heal.' },
      { item: 'flower', does: 'A longer whip: leather, chain, morning star. Then double and triple shot.' },
      STAR,
      { item: 'drops', does: 'Hearts, small and large. Hearts are your sub-weapon ammo.' },
    ],
    belt: [
      { name: 'Dagger', cost: '1 heart', does: 'Fast and straight.' },
      { name: 'Axe', cost: '1 heart', does: 'Lobbed high. Arcs over walls and hits things above.' },
      { name: 'Holy water', cost: '1 heart', does: 'Shatters into a flame that burns on the floor.' },
      { name: 'Cross', cost: '1 heart', does: 'Spins out and comes back.' },
      { name: 'Stopwatch', cost: '5 hearts', does: 'Freezes everything on screen.' },
    ],
    tips: ['Getting hit knocks you back hard. Mind the pits.'],
    capture: { page: 'smb-5', level: '5-1' },
  },
  {
    id: 'ryu',
    name: 'Ryu Hayabusa',
    from: 'Ninja Gaiden',
    tagline: 'Ninja: wall climbing and ninpo',
    blurb:
      'A fast run, a quick sword and wall climbing: cling to any wall and kick off it. Mushrooms unlock the ninpo arts, cast from the spirit meter.',
    chapter: 1,
    world: 6,
    hiddenIn: "6-2's dojo, through a trick wall in a pipe room.",
    miniGame: {
      name: 'Shadow Duel',
      blurb: 'A cutscene, a Ninja Gaiden-style stage and a duel with the Masked Ninja on a moonlit rooftop.',
    },
    color: '#4040ff',
    stomps: false,
    moves: [
      { action: 'left/right', does: 'Run fast. In the air, hold toward a wall to cling.' },
      { action: 'jump', does: 'Jump. Let go early to cut it short. On a wall: kick off.' },
      { action: 'attack', does: 'A quick sword slash.' },
      { action: 'down', does: 'Crouch, and slash low.' },
      { action: 'select', does: 'Pick the next ninpo art.' },
      { action: 'special', does: 'Cast the selected art. Costs ninpo (blue bar).' },
    ],
    powerups: [
      { item: 'mushroom', does: 'Unlocks the next ninpo art. Full heal.' },
      { item: 'flower', does: 'A bigger ninpo meter, refilled.' },
      STAR,
      { item: 'drops', does: 'Ninpo flames and health.' },
    ],
    belt: [
      { name: 'Throwing star', cost: '3', does: 'Straight and fast. Two on screen.' },
      { name: 'Windmill', cost: '5', does: 'A big blade that cuts through everything and returns.' },
      { name: 'Fire wheel', cost: '5', does: 'Three flames circle you and block shots.' },
      { name: 'Jump and slash', cost: '5', does: 'A somersault that cuts anything you touch.' },
    ],
    tips: ['Walls stop you only until you learn to climb them.'],
    capture: { page: 'smb-6', level: '6-1' },
  },
  {
    id: 'bill',
    name: 'Bill Rizer',
    from: 'Contra',
    tagline: 'Rifle with eight-way aim',
    blurb:
      'A somersault jump, a prone crouch and a rifle that aims in eight directions. Flowers and capsules bring the machine gun, spread, laser and flame thrower.',
    chapter: 1,
    world: 7,
    hiddenIn: "7-3's camp, falling through the exploding bridge.",
    miniGame: {
      name: 'Jungle Assault',
      blurb: 'A Contra stage 1-style run-and-gun through the jungle, with Bill in his Contra form.',
    },
    color: '#3cbcfc',
    stomps: false,
    moves: [
      { action: 'left/right', does: 'Run.' },
      { action: 'jump', does: 'A fixed somersault jump.' },
      { action: 'attack', does: 'Fire. Unlimited bullets. Hold with the machine gun.' },
      { action: 'up', does: 'Aim up, diagonally while moving.' },
      { action: 'down', does: 'Go prone on the ground. In the air: aim down.' },
      { action: 'select', does: 'Switch guns.' },
      { action: 'special', does: 'Also fires.' },
    ],
    powerups: [
      { item: 'mushroom', does: 'One more hit, up to five.' },
      { item: 'flower', does: 'The next gun in order, and it becomes selected.' },
      STAR,
      { item: 'drops', does: 'Health and weapon capsules.' },
    ],
    belt: [
      { name: 'Rifle', does: 'Tap to fire. Four shots on screen.' },
      { name: 'Machine gun', does: 'Hold to keep firing.' },
      { name: 'Spread', does: 'Five shots in a fan.' },
      { name: 'Laser', does: 'One beam that pierces everything in a line.' },
      { name: 'Flame thrower', does: 'A slow heavy fireball.' },
    ],
    tips: ['You start with three hits. Every touch costs one.'],
    capture: { page: 'smb-7', level: '7-1' },
  },
  {
    id: 'sophia',
    name: 'Sophia III',
    from: 'Blaster Master',
    tagline: 'Tank that climbs walls',
    blurb:
      'A tank with a cannon, homing and triple missiles, a hover and, with a flower, wall and ceiling climbing. Her pilot Jason can hop out on foot to squeeze through small gaps.',
    chapter: 1,
    world: 8,
    hiddenIn: "8-4's garage, after Fred the frog, down the trap pipe.",
    miniGame: {
      name: 'Underworld',
      blurb: "Blaster Master in brief: the tank's cavern, Jason's dungeon and its guardian, and the Plutonium Boss.",
    },
    color: '#fc7460',
    stomps: false,
    moves: [
      { action: 'left/right', does: 'Drive. No run. She keeps her speed in the air.' },
      { action: 'jump', does: 'A short squat, then a fixed jump. Hold for higher. With the hover: hover.' },
      { action: 'attack', does: 'Fire the cannon, three shots at a time. Two shots break a brick.' },
      { action: 'up+attack', does: 'Raise the cannon and fire straight up.' },
      { action: 'special', does: 'Fire three missiles. They fly through walls and pierce armour.' },
      { action: 'down+special', does: 'With both missiles: switch between them.' },
      { action: 'up', does: 'With the wall climb, drive into a wall to climb it.' },
      { action: 'down+jump', does: 'On a wall or ceiling: let go.' },
      { action: 'select', does: 'On solid ground: Jason hops out on foot. Up at the tank: back in.' },
    ],
    powerups: [
      { item: 'mushroom', does: 'Hyper cannon and the hover. A hit takes everything back.' },
      { item: 'flower', does: 'Crusher cannon, wall and ceiling climbing, and missiles. Another flower gives more missiles.' },
      { item: 'star', does: 'Invincible, free missiles and a full hover bar.' },
      { item: 'drops', does: 'Missile ammo, once you have missiles.' },
    ],
    belt: [
      { name: 'Triple missile', cost: '3 ammo', does: 'Three missiles that fly through walls and break bricks.' },
      { name: 'Homing missile', cost: '1 ammo', does: 'Seeks the nearest enemy that is not armoured or on fire.' },
    ],
    tips: [
      'She cannot stomp. Shoot enemies instead.',
      'Jump into a ceiling to grab it. Hold down to bump blocks instead.',
      'Jason is fragile: a fall of more than five blocks hurts him.',
    ],
    capture: { page: 'smb-8', level: '8-1' },
  },
];

export const WORLDS: World[] = [
  {
    number: 1,
    page: 'smb-1',
    title: 'Grass Land',
    chapter: 1,
    hero: 'luigi',
    style: 'Super Mario Bros.',
    blurb:
      "Home turf. Toad tells the story at 1-0, Bowser casts his spell, and Luigi runs off down a pipe in 1-1. Find him in the bonus room and win him back.",
    levels: [
      { id: '1-0', look: "Mario's tutorial stage" },
      { id: '1-1', look: 'The classic opener, with Luigi hiding in its bonus room' },
      { id: '1-2', look: 'Underground, with the warp zone and its pipe keeper' },
      { id: '1-3', look: 'Treetops' },
      { id: '1-4', look: 'The first castle and the first fake Bowser' },
    ],
  },
  {
    number: 2,
    page: 'smb-2',
    title: 'Hyrule',
    chapter: 1,
    hero: 'link',
    style: 'Zelda II',
    blurb:
      'Brown mountains, a lake, forests, a graveyard and a palace set into the cliffs. A healer welcomes you and the old man by the vine block points the way to the sky palace.',
    levels: [
      { id: '2-1', look: 'Hyrule fields, with a sky palace above the coin heaven' },
      { id: '2-2', look: 'Underwater, in a Zelda II lake' },
      { id: '2-3', look: 'Bridges and leaping fish over Hyrule' },
      { id: '2-4', look: 'The great palace' },
    ],
  },
  {
    number: 3,
    page: 'smb-3',
    title: 'Mega City',
    chapter: 1,
    hero: 'megaman',
    style: 'Mega Man',
    blurb:
      "The year 20XX. Dr. Light waits by 3-1's vine block, a lab robot welcomes you on the map, and a space station hangs above the first level.",
    levels: [
      { id: '3-1', look: 'A robot master stage, with the space station overhead' },
      { id: '3-2', look: 'A forest stage' },
      { id: '3-3', look: 'A sky stage' },
      { id: '3-4', look: 'The fortress' },
    ],
  },
  {
    number: 4,
    page: 'smb-4',
    title: 'Planet Zebes',
    chapter: 1,
    hero: 'samus',
    style: 'Metroid',
    blurb:
      "Crateria's rock, Brinstar's caverns and Norfair's heat. A scientist welcomes you, a Chozo statue keeps the hint, and Larry Koopa's airship turns up in 4-2.",
    levels: [
      { id: '4-1', look: 'Crateria' },
      { id: '4-2', look: "Brinstar's caverns, and Larry Koopa's airship" },
      { id: '4-3', look: 'Norfair' },
      { id: '4-4', look: "Tourian, the Mother Brain's lair" },
    ],
  },
  {
    number: 5,
    page: 'smb-5',
    title: 'Transylvania',
    chapter: 1,
    hero: 'simon',
    style: 'Castlevania',
    blurb:
      'The castle gate, a town, a stormy lake and a clock tower. A merchant welcomes you, and the crypt under 5-4 hides the hero.',
    levels: [
      { id: '5-1', look: 'The castle gate' },
      { id: '5-2', look: 'The town, a lake below it and a storm above' },
      { id: '5-3', look: 'The clock tower' },
      { id: '5-4', look: 'The castle and its catacombs' },
    ],
  },
  {
    number: 6,
    page: 'smb-6',
    title: 'Dragon Valley',
    chapter: 1,
    hero: 'ryu',
    style: 'Ninja Gaiden',
    blurb:
      "A night valley under a full moon: the Hayabusa village and dojo, a bamboo forest, the city's rooftops and neon, snowy passes and the demon temple.",
    levels: [
      { id: '6-1', look: 'A moonlit bamboo field' },
      { id: '6-2', look: 'The night city, its sewers and harbour, and the dojo' },
      { id: '6-3', look: 'A snowy mountain pass' },
      { id: '6-4', look: "The demon temple, Jaquio's lair" },
    ],
  },
  {
    number: 7,
    page: 'smb-7',
    title: 'Galuga Island',
    chapter: 1,
    hero: 'bill',
    style: 'Contra',
    blurb:
      "A snowfield, the enemy base and its defense wall, jungle, a waterfall and river, and Red Falcon's lair. Weapon capsules, soldiers and a helicopter are about.",
    levels: [
      { id: '7-1', look: 'The snowfield before the enemy base' },
      { id: '7-2', look: 'The jungle river' },
      { id: '7-3', look: "The jungle, Bill's camp and the exploding bridge" },
      { id: '7-4', look: "Red Falcon's alien lair" },
    ],
  },
  {
    number: 8,
    page: 'smb-8',
    title: "Bowser's Underworld",
    chapter: 1,
    hero: 'sophia',
    style: 'Blaster Master',
    blurb:
      "Blaster Master's Underworld has broken into Bowser's land: a radioactive pit, cavern mouths, stone ruins, a gnarled forest and Sophia's garage. Bowser waits in his castle at 8-4.",
    levels: [
      { id: '8-1', look: 'The forest and stone ruins' },
      { id: '8-2', look: 'The techno castle' },
      { id: '8-3', look: 'The frozen ruins' },
      { id: '8-4', look: "Bowser's own castle, and the ending" },
    ],
  },
];

export const heroById = (id: string): Hero | undefined => HEROES.find((h) => h.id === id);
export const worldByNumber = (n: number): World | undefined => WORLDS.find((w) => w.number === n);
export const heroesOfWorld = (n: number): Hero[] => HEROES.filter((h) => h.world === n);

/** The default keyboard keys for each ability (Options > Controls can remap them). */
export const KEYS: Record<string, string> = {
  'left/right': '← →',
  up: '↑',
  down: '↓',
  jump: 'Z',
  attack: 'X',
  'attack (hold)': 'hold X',
  special: 'C',
  select: 'R.Shift',
  'down+jump': '↓ + Z',
  'up+attack': '↑ + X',
  'down+special': '↓ + C',
};

/** The ability names the game uses on buttons and in its guides. */
export const ABILITY: Record<string, string> = {
  'left/right': 'Move',
  up: 'Up',
  down: 'Down',
  jump: 'Jump',
  attack: 'Attack',
  'attack (hold)': 'Hold attack',
  special: 'Special',
  select: 'Tools',
  'down+jump': 'Down + jump',
  'up+attack': 'Up + attack',
  'down+special': 'Down + special',
};
