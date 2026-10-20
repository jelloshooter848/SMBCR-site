/**
 * Classic mode (game 0.5.0): the heroes, looks, Expansion heroes, maps, modes and options the
 * Classic pages show. Compiled from the game's own code (its Classic guides and options) for 0.5.0;
 * the campaign's heroes are in roster.ts.
 *
 * Anything marked `later: true` is built in the game but ships in a later 0.5.0 batch: it stays off
 * the site until SHOW_UPCOMING is true. When a batch ships, remove its `later` flags (or flip the
 * switch once everything has shipped).
 *
 * Text rules: name abilities (Jump, Attack, Special, Tools, Up, Down), never keys or buttons.
 */

export const SHOW_UPCOMING = false;

/** A line of text that may belong to a later 0.5.0 batch. */
export interface Note {
  text: string;
  later?: boolean;
}

export interface Look {
  name: string;
  /** What changes, if it plays differently. */
  note?: string;
  later?: boolean;
}

export interface ClassicHero {
  id: string;
  name: string;
  tagline: string;
  color: string;
  /** Rows of the hero's guide, in order: label ("Moves", "Special", "Mushroom"...) and text. */
  rows: { label: string; text: string; later?: boolean }[];
  looks: Look[];
  /** Notes under the looks. */
  notes?: Note[];
}

export const shown = <T extends { later?: boolean }>(items: readonly T[]): T[] =>
  items.filter((i) => SHOW_UPCOMING || !i.later);

const STAR_12 = 'Twelve seconds of invincibility.';

export const CLASSIC_HEROES: ClassicHero[] = [
  {
    id: 'mario',
    name: 'Mario',
    tagline: 'The original plumber, with a sharp rocket jump',
    color: '#d82800',
    rows: [
      {
        label: 'Moves',
        text: 'Walk, and hold Attack to run. Speed builds up and runs down slowly, turning skids, and you can’t turn in mid-air. Hold Jump to rise higher, up to a set height. Crouch when big; jumping while crouched keeps you crouched. Stomp enemies; stomps in a row without landing score more. Under water every jump is a swim stroke and stomping doesn’t work.',
      },
      { label: 'Mushroom', text: 'Grow big and break bricks with your head. If you’re already big, it gives fire power.' },
      { label: 'Fire Flower', text: 'One step up (small to big, big to fire). With fire, Attack throws fireballs, two at a time.' },
      { label: 'Star', text: `${STAR_12} Touching enemies defeats them.` },
      { label: 'Unique', text: 'In water areas, pits pull Mario and Luigi in, as in the original.' },
    ],
    looks: [
      { name: 'Mario' },
      {
        name: 'SMB3 Mario',
        note: 'Our own Super Mario Bros. 3-style palette. Plays as Mario, except that small Mario can duck and crouch-jump.',
        later: true,
      },
    ],
  },
  {
    id: 'luigi',
    name: 'Luigi',
    tagline: 'Slippery, and floats high',
    color: '#00a800',
    rows: [
      {
        label: 'Moves',
        text: 'As Mario, but slower to start, with a longer slide and a floaty jump. Letting go of Jump only ends his rise.',
      },
      { label: 'Power-ups', text: 'As Mario.' },
    ],
    looks: [
      { name: 'Luigi' },
      { name: 'Princess Peach', note: 'A look for Luigi, as in the original.' },
      {
        name: 'SMB3 Luigi',
        note: 'Plays as Luigi, except that small Luigi can duck and crouch-jump.',
        later: true,
      },
    ],
    notes: [
      {
        text: 'Princess Peach plays exactly as Luigi, with his moves and fireballs, and 8-4 ends as in the original: “THANK YOU TOADSTOOL! YOUR QUEST IS OVER.”',
        later: true,
      },
    ],
  },
  {
    id: 'link',
    name: 'Link',
    tagline: 'Stab, thrust and boomerang',
    color: '#00a800',
    rows: [
      {
        label: 'Moves',
        text: 'Walk; he starts and stops at once. Attack stabs, breaking bricks and opening blocks from any side; add Up or Down to stab up or down. In the air, Down is a bouncing down-thrust and Up an up-thrust. Link can’t stomp: land on enemies with the down-thrust.',
      },
      { label: 'Special: Boomerang', text: 'Aim it eight ways. It stops enemies and fetches items.' },
      { label: 'Tools: Bomb', text: 'Bombs never hurt Link. Up to three at a time.' },
      {
        label: 'Mushroom',
        text: 'The Blue Ring, a stronger sword, plus his Mushroom weapon the first time: three bombs by default, or the bow and arrows if Weapons is set to Bow and Arrow.',
      },
      {
        label: 'Fire Flower',
        text: 'The Red Ring sword beam (in the air with Up or Down held, the beam fires up or down), plus the Magic Boomerang, Magic Sword, Bomb Bag and Quiver. Any hit takes the rings and swords.',
      },
      { label: 'Star', text: `${STAR_12} Bombs cost nothing.` },
      { label: 'Ammo', text: 'Bombs (or arrows) drop from enemies and broken bricks once he owns them.' },
    ],
    looks: [
      { name: 'Link' },
      {
        name: 'Princess Zelda (NES, SNES and Game Boy looks)',
        note: 'Her sword is weaker, and her arrows are stronger and go on through what they defeat.',
        later: true,
      },
    ],
  },
  {
    id: 'samus',
    name: 'Samus',
    tagline: 'Beams, missiles and bombs',
    color: '#e45c10',
    rows: [
      {
        label: 'Moves',
        text: 'Walk at one steady speed. Jump high; a running jump is a somersault. Up aims up (you can walk while aiming). Down crouches; press it again, or in the air, for the morph ball. Attack fires the beam, three at a time, or lays a bomb in the ball. Crouch to hit small enemies.',
      },
      { label: 'Special: Missile', text: 'Once she has them. Missiles break armour.' },
      { label: 'Mushroom', text: 'The Long Beam, plus four missiles the first time.' },
      {
        label: 'Fire Flower',
        text: 'Her Flower beam (the Wave Beam through walls by default, or the Ice Beam to freeze enemies, under Weapons), more missile room and the Screw Attack: with the Flower, a somersault defeats what it touches. Any hit makes her small again.',
      },
      { label: 'Star', text: `${STAR_12} Missiles cost nothing.` },
      { label: 'Ammo', text: 'Missile packs, once she has missiles.' },
    ],
    looks: [
      { name: 'Samus' },
      {
        name: 'Pit (Kid Icarus)',
        note: 'Samus’s rules, but walks and jumps while crouched (fitting one-tile gaps), can’t walk while aiming up, fires no beam while crouched (missiles still fire), shoots lower, and has no morph ball or bombs. Shots fly as arrows.',
      },
      { name: 'Dark Pit (Kid Icarus: Uprising)', note: 'Plays as Pit.' },
    ],
    notes: [{ text: 'The Classic Samus cheat (see Maps & modes).', later: true }],
  },
  {
    id: 'simon',
    name: 'Simon',
    tagline: 'Whip, axe and a double jump',
    color: '#ac7c00',
    rows: [
      {
        label: 'Moves',
        text: 'Walk; a fixed jump, plus one more in mid-air. Attack cracks the whip: it hits a little late, roots him, breaks bricks and freezes what it hits. Crouch to whip low. A hit knocks him into a hop.',
      },
      { label: 'Special: start sub-weapon', text: 'The Axe by default: a high arc through walls, for 1 heart.' },
      {
        label: 'Tools: extra sub-weapon',
        text: 'With fire power. The Cross by default: it flies out and back, and you catch it. It costs 2 hearts.',
      },
      { label: 'Mushroom', text: 'The morning star whip, and two throws at a time. If you already have it, you get fire power.' },
      {
        label: 'Fire Flower',
        text: 'One step up. Fire power gives the long Flame Whip, three throws and the Cross. A repeat Flower gives 5 hearts.',
      },
      { label: 'Star', text: `${STAR_12} Throws cost no hearts.` },
      { label: 'Ammo', text: 'Hearts, small and large.' },
    ],
    looks: [{ name: 'Simon' }],
    notes: [{ text: 'The Classic Simon cheat (see Maps & modes).', later: true }],
  },
  {
    id: 'megaman',
    name: 'Mega Man',
    tagline: 'Mega Buster, slide and Rush',
    color: '#0070ec',
    rows: [
      {
        label: 'Moves',
        text: 'Walk; he starts and stops at once, after a small first step. Jump (let go early and the rise eases off). Slide with Down and Jump: low and fast, under low gaps and over one-tile holes. Attack fires the buster, three shots at a time; shots fly through walls and pipes and break bricks.',
      },
      { label: 'Tools', text: 'Tap to call Rush (free; fall onto him for a high bounce). Hold to swap the shoot and weapon abilities.' },
      {
        label: 'Mushroom',
        text: 'The Charge Shot: hold Attack, then let go; a full charge goes on through what it defeats. Any hit takes it away, along with the Flower.',
      },
      {
        label: 'Fire Flower',
        text: 'His Flower weapon on Special, with its own energy bar. Metal Blade is the default, aimed with Up, Down or a diagonal; Weapons offers eight others. More Flowers refill it.',
      },
      { label: 'Star', text: `${STAR_12} Weapons cost no energy.` },
      { label: 'Ammo', text: 'Weapon energy drops. The game stops while the bar fills.' },
    ],
    looks: [
      { name: 'Mega Man' },
      { name: 'Rock', note: 'Can’t charge or slide.' },
      {
        name: 'Proto Man (Mega Man 3)',
        note: 'Charges from the start (even small), fires two shots at a time until the Mushroom, is knocked back twice as far, and shoots a little lower. He whistles when picked.',
      },
      { name: 'Break Man (Mega Man 3)', note: 'Plays exactly as Proto Man, without the whistle.' },
      { name: 'Cut Man', note: 'Shots pass through enemies, walls and bricks; his head breaks bricks even when small; two shots at a time.' },
      { name: 'Fire Man', note: 'Stronger shots, two at a time; firebars pass through him; double knockback.' },
      { name: 'Ice Man', note: 'A full charge freezes enemies; normal shots are weaker.' },
      { name: 'Francesca (The Krion Conquest)', note: 'Can’t slide.' },
      { name: 'Doropie (The Krion Conquest)', note: 'Francesca’s other look, with the same rules.' },
      { name: 'Rokko Chan (Rokko Chan)', note: 'An upright dash in place of the slide, and a dash jump that keeps its speed; can’t charge.' },
    ],
    notes: [{ text: 'Mega Man and his looks die in a burst of energy orbs, with his own sound, as in the original.', later: true }],
  },
  {
    id: 'bass',
    name: 'Bass',
    tagline: 'Rapid fire, dash and a double jump',
    color: '#7c7c7c',
    rows: [
      {
        label: 'Moves',
        text: 'Walk; he stands still while shooting on the ground. Jump again in the air for a double jump. Dash with Down and Jump, and jump out of it for a fast dash jump. Hold Attack for rapid fire, three shots at a time, aimed up, up at an angle or down at an angle. He can’t charge and has no Rush.',
      },
      { label: 'Mushroom', text: 'Survive one hit, and four shots at a time.' },
      {
        label: 'Fire Flower',
        text: 'His Flower weapon on Special, with its energy bar. The Water Shield is the default: use Special again to send it out. Weapons offers the same nine choices as Mega Man. Tools swaps the shot and weapon abilities.',
      },
      { label: 'Star', text: 'Invincibility.' },
      { label: 'Ammo', text: 'Weapon energy for the Flower weapon.' },
      { label: 'Unique', text: 'His castle line names Dr. Wily.' },
    ],
    looks: [
      { name: 'Bass' },
      { name: 'Dr. Wily (Mega Man 2)', note: 'Plays as Bass.', later: true },
      { name: 'Mr. X (Mega Man 6)', note: 'Plays as Bass.', later: true },
      { name: 'Quick Man (Mega Man 2)', note: 'Faster, with the higher jump, but no double jump or dash.', later: true },
      { name: 'Dr. Cossack (Mega Man 4)', note: 'Plays as Bass.', later: true },
      { name: 'Gemini Man (Mega Man 3)', note: 'Plays as Bass.', later: true },
      { name: 'Skull Man (Mega Man 4)', note: 'Plays as Bass.', later: true },
    ],
    notes: [{ text: 'Bass dies in a burst of energy orbs, as in the original.', later: true }],
  },
  {
    id: 'bill',
    name: 'Bill',
    tagline: 'Two guns and slow shots',
    color: '#3cbcfc',
    rows: [
      {
        label: 'Moves',
        text: 'Walk; a fixed somersault jump. Attack fires the gun in hand; shots fly through the ground and open blocks. Up aims up (diagonally while walking); Down lies flat, or aims down while walking or jumping. Bill can’t stomp. Buzzy Beetles and Bullet Bills shrug off bullets.',
      },
      { label: 'Mushroom', text: 'His first gun: the Machine Gun by default (hold to keep firing). Weapons can make it the Flare or Laser instead.' },
      { label: 'Fire Flower', text: 'His second gun, on Special: the Spread by default (five shots in a fan). Tools swaps the two guns.' },
      { label: 'Star', text: 'Invincibility.' },
      { label: 'Hits', text: 'Any hit takes both guns and leaves the rifle. A hit with only the rifle costs a life.' },
    ],
    looks: [{ name: 'Bill' }],
  },
  {
    id: 'ryu',
    name: 'Ryu',
    tagline: 'Climbs walls and throws ninpo arts',
    color: '#4040ff',
    rows: [
      {
        label: 'Moves',
        text: 'Walk at one steady speed; the jump is always the same height. Attack slashes (he stops on the ground) and breaks bricks. In the air, push into a wall to cling; Up and Down climb, Jump away leaps off, Down with Jump lets go.',
      },
      {
        label: 'Special: start art',
        text: 'The Shuriken by default (3 ninpo, one on screen). Thrown arts fly through walls and break bricks.',
      },
      {
        label: 'Tools: extra art',
        text: 'With the Flower. The Windmill Shuriken by default (5 ninpo; it swings back). Weapons offers Shuriken, Windmill, Jump Slash, Fire Wheel and Dragon Ball for either slot.',
      },
      { label: 'Mushroom', text: 'A longer sword. Ryu doesn’t grow.' },
      { label: 'Fire Flower', text: 'The Scroll (up to 200 ninpo) and the extra art. A repeat Flower gives 15 ninpo.' },
      { label: 'Star', text: `${STAR_12} Ninpo costs nothing.` },
      { label: 'Ammo', text: 'Ninpo flames. A hit takes the sword and the Flower, but he keeps the Scroll and his ninpo.' },
    ],
    looks: [{ name: 'Ryu' }, { name: 'Haggle Man (Haggle Man)', note: 'His sword hits sooner.', later: true }],
  },
  {
    id: 'sophia',
    name: 'Sophia III',
    tagline: 'A tank that climbs walls and ceilings',
    color: '#fc7460',
    rows: [
      {
        label: 'Moves',
        text: 'Drive (no run). Jump is a short squat, then a jump; hold for higher. Attack fires the cannon, three shots at a time (two shots break a brick); Up with Attack fires straight up. She can’t stomp.',
      },
      {
        label: 'Special: Missiles',
        text: 'The Triple Missile by default (three at once, through walls, piercing armour). Weapons can make it the Homing Missile instead.',
      },
      { label: 'Mushroom', text: 'The Hyper cannon and the hover (hold Jump in the air).' },
      {
        label: 'Fire Flower',
        text: 'The Crusher cannon, wall and ceiling climbing (drive into a wall to climb it; Down with Jump lets go) and missiles. Another Flower gives more missiles.',
      },
      { label: 'Star', text: 'Invincibility, free missiles and a full hover bar.' },
      { label: 'Hits', text: 'A hit takes her upgrades back but keeps her missiles. Losing a life loses them.' },
    ],
    looks: [{ name: 'Sophia III' }],
  },
];

export const RANDOM: Note[] = [
  { text: 'The game picks one of the heroes you can pick, in that hero’s chosen look.' },
  { text: 'Disable heroes also takes heroes out of Random.', later: true },
];

/** How the select and every hero work. */
export const HERO_RULES: Note[] = [
  {
    text: 'Choosing a hero: pick a hero with OK. A hero with other looks opens the skin menu first; Special changes the look straight from the select. Each hero remembers its look.',
  },
  {
    text: 'Every level is built for the hero playing it, as in the original: extra lifts, blocks and steps for shorter reaches, stepping stones for poor swimmers, extra blocks before Bowser for Simon and Ryu, wider shafts for Sophia III.',
  },
  { text: 'Each hero has their own castle rescue line, and their own music and sounds (all original).' },
  {
    text: 'Power-ups work as in the original, with no health bars: a hero is small, big (Mushroom) or fully powered (Fire Flower). By default any hit while powered up makes the hero small, and a hit while small costs a life.',
  },
  {
    text: 'A picked hero acts out a short move in their cell before the game goes on (Mario hops, Mega Man teleports away, Bill flashes). OK or Back skips it.',
    later: true,
  },
];

export interface ExpansionHero {
  name: string;
  tagline: string;
  points: string[];
}

export const EXPANSION_HEROES: ExpansionHero[] = [
  {
    name: 'Vic Viper',
    tagline: 'A starfighter in a walking world',
    points: [
      'The screen scrolls by itself; the ship flies in eight directions, shoots through walls, enters pipes in mid-air, and can’t stomp or bump blocks.',
      'Flowers and defeated enemies give power capsules that light the power bar: Speed Up, Missile, Double, Laser, Option (up to four) and a Shield. Jump or Special takes the lit power-up.',
      'The Mushroom adds one hit and turns the trim blue.',
    ],
  },
  {
    name: 'Warriors of Light',
    tagline: 'Four classes, one party',
    points: [
      'Special with a direction changes class: Up for the Fighter (strong sword), Right for the Black Mage (Fire; Ice with Down; a full-height Bolt with Up, through walls), Down for the Thief (weak dagger), Left for the White Mage (staff; when small, Cure with Down brings back the Mushroom once a level).',
      'A fixed jump; they stand still to attack, can’t stomp, and blocks do nothing from below.',
      'The Flower gives every class a new outfit.',
    ],
  },
  {
    name: 'Sir Arthur',
    tagline: 'Armour, lances, no going back',
    points: [
      'He starts in his boxers. The Mushroom is steel armour and the Flower gold armour, and one hit knocks all of it off.',
      'His jump keeps its take-off direction, plus one more jump in the air.',
      'Attack throws his weapon: the lance, or whatever a weapon pot gives (dagger, torch, axe). Down with Attack in the air throws straight down.',
      'Gold armour makes weapons stronger and armour-piercing, and adds Magic on Special: lightning on both sides.',
    ],
  },
  {
    name: 'Yoshi',
    tagline: 'Flutter, lick and throw eggs',
    points: [
      'Walk (no run). Hold Jump while falling to flutter. Down in the air is a ground pound that breaks bricks below.',
      'Attack shoots the tongue to catch an enemy; Attack again spits it, or Down swallows it into an egg.',
      'Hold Special to aim an egg, and let go to throw it.',
      'He carries 3 eggs, or 6 with the Mushroom. The Flower makes red eggs that pierce armour.',
    ],
  },
];

export const MAP_SETS: { name: string; text: string; later?: boolean }[] = [
  { name: 'Super Mario Bros.', text: 'Worlds 1-1 to 8-4. 8-4 ends with the credits.' },
  {
    name: 'The Lost Levels',
    text: 'Thirteen worlds, played straight through from 1-1 to D-4 as in the original: 8-4 goes on to World 9 whatever warps you used, 9-4 to World A, and D-4 rolls the credits. Start it from the Classic menu.',
  },
  {
    name: 'SMB Special',
    text: '32 new levels (Worlds 1-1 to 8-4), built for each hero and each difficulty, with new enemies that can’t be stomped (Icicles, Crabs, Flies, Barrels and living Flames), new items (the Atom, the Hammer and the Wing), a full power-up, and numbered vines to bonus rooms.',
    later: true,
  },
];

export const DIFFICULTY: Note[] = [
  { text: 'Each difficulty plays the original’s own version of every level, with other enemies and blocks.' },
  { text: 'Easy and Hard give the castles their checkpoints.' },
  {
    text: 'On Hard, Lakitu comes back sooner and keeps more Spinies out at once, more flying Cheep Cheeps leap at a time, and a hidden Hudson Bee can be found. Easy is the reverse.',
  },
  { text: 'A beaten map set remembers the difficulty it was beaten on.' },
];

export const GAME_MODES: { name: string; text: string }[] = [
  { name: 'All heroes (default)', text: 'Choose a hero before every level and after every lost life.' },
  {
    name: 'Survival',
    text: 'Every hero has one life. At the start, after each castle and after a warp pipe, spend a life to revive a fallen hero or power up a standing one. The run ends when all have fallen.',
  },
  { name: 'Single hero', text: 'Choose once for the whole run.' },
  { name: 'Single random', text: 'No select: the game picks your hero for every level and life.' },
];

export const WEAPONS: { row: string; choices: string }[] = [
  {
    row: 'Bass (Flower)',
    choices: 'Water Shield; Super Arm, Metal Blade, Hard Knuckle, Pharaoh Shot, Charge Kick, Flame Blast, Magma Bazooka, Screw Crusher',
  },
  { row: 'Bill gun 1 (Mushroom)', choices: 'Machine Gun; Flare, Laser' },
  { row: 'Bill gun 2 (Flower)', choices: 'Spread; Flare, Laser, Machine Gun (never the same as gun 1)' },
  { row: 'Link (Mushroom)', choices: 'Bomb; Bow and Arrow' },
  { row: 'Mega Man (Flower)', choices: 'Metal Blade; the other eight of the Bass list, Water Shield included' },
  { row: 'Ryu start / extra', choices: 'Shuriken / Windmill; also Jump Slash, Fire Wheel, Dragon Ball (never the same twice)' },
  { row: 'Samus (Flower beam)', choices: 'Wave Beam; Ice Beam' },
  { row: 'Simon start / extra', choices: 'Axe / Cross; also Dagger, Holy Water, Stopwatch (never the same twice)' },
  { row: 'Sophia III (missile)', choices: 'Triple Missile; Homing Missile' },
];

export const MORE_SETTINGS: { name: string; text: string }[] = [
  { name: 'Lives', text: 'How many lives you start with and get after each continue: 1, 3, 5, 7 or 10 (default 3).' },
  { name: 'Attack', text: 'Every hero’s attack strength, from Very weak to Very strong.' },
  { name: 'When hit', text: 'Lose everything (default; any hit leaves you small), Previous state (a hit takes one power-up) or Instant death.' },
  { name: 'Item drops', text: 'How often enemies and blocks drop ammo, from Very low to Very high.' },
  { name: 'Piranhas', text: 'Which pipes have Piranha Plants, and their colour.' },
  { name: 'Goombas', text: 'Every Goomba becomes this enemy: Off, Buzzy Beetle, Spiny or Spike Top (our own spiked crawler, which can’t be stomped).' },
  { name: 'Enemy speed', text: 'Normal, or Fast for walking enemies.' },
];

export const CHEATS: { name: string; does: string; unlock: string; later?: boolean }[] = [
  { name: 'All Ground Is Bricks', does: 'Ground and blocks before the goal become bricks', unlock: 'Beat Super Mario Bros.' },
  { name: 'All Hammer Bros', does: 'Every enemy but Bowser is a Hammer Bro', unlock: 'Beat The Lost Levels' },
  { name: 'All Weapons Pierce', does: 'Every attack gets through armour', unlock: 'Beat a game and defeat 200 armoured enemies' },
  { name: 'Always Break Bricks', does: 'Any bump breaks a plain brick', unlock: 'Beat a game and break 1000 bricks' },
  { name: 'Bouncy Pits', does: 'Pits bounce heroes and enemies back up', unlock: 'Beat a game and stomp 200 enemies' },
  { name: 'Classic Scroll', does: 'The screen never scrolls back left', unlock: 'Open from the start' },
  { name: 'Everyone Can Stomp', does: 'Every hero can stomp', unlock: 'Open from the start' },
  { name: 'Evil Hammer Bros', does: 'Hammer Bros chase you', unlock: 'Defeat 50 Hammer Bros' },
  { name: 'Extra Checkpoints', does: 'Castles and World 8 get checkpoints', unlock: 'Beat a castle' },
  { name: 'Infinite Ammo', does: 'Weapons never run out', unlock: 'Beat a game and collect 200 ammo pickups' },
  { name: 'Infinite Lives', does: 'A lost life is never counted', unlock: 'Beat a game without using a continue' },
  { name: 'Infinite Time', does: 'The clock never runs out', unlock: 'Beat any level' },
  { name: 'Invincible', does: 'Nothing hurts you (pits still do)', unlock: 'Beat a game and defeat 1000 enemies' },
  { name: 'Water Mode', does: 'Every area is under water', unlock: 'Beat a game and defeat 300 Cheep Cheeps' },
  {
    name: 'Classic Samus',
    does: 'Special or Tools switches her between beam and missiles, and Down rolls her straight into the morph ball',
    unlock: 'Open from the start',
    later: true,
  },
  {
    name: 'Classic Simon',
    does: 'His jump keeps its take-off direction, and he drops straight down off ledges',
    unlock: 'Open from the start',
    later: true,
  },
];

export const ACCESSIBILITY: { name: string; text: string }[] = [
  {
    name: 'Reduce flash',
    text: 'Steady colours instead of flashing: the Star, hurt and Bowser flashes, the select cursor and lightning.',
  },
  {
    name: 'Announce',
    text: 'Screen-reader announcements: menus, cards, the hero select (look, hero and game) and unlocks are all read out.',
  },
  { name: 'Palette', text: 'Default, Deuteranopia, Protanopia, Tritanopia or High contrast.' },
  { name: 'Integer scale', text: 'Crisp pixel scaling.' },
  {
    name: 'Remapping',
    text: 'Every ability can be remapped on the keyboard and on a gamepad, and Reset keys restores the defaults.',
  },
  { name: 'Key hints', text: 'Shows each ability with its key beside the game.' },
  { name: 'Audio', text: 'Mute, plus Master, Music and Sound volumes.' },
  {
    name: 'Cards wait for you',
    text: 'Every text card waits for a press, and ignores presses for its first half second. The one exception is the short WORLD card before each level, which moves on by itself after about two seconds, as in the original; it is announced, and shows nothing that isn’t also on screen during play.',
  },
];
