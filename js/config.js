export const W = 400, H = 760, CELL_W = 460, CELL_H = 760;

export const FOODS = {
  donut:    { name: 'Midway Donuts', unit: 'donut', plural: 'donuts', machine: 'fryer', style: 'fryer', theme: '#ef4b5b', cloth: '#ef4b5b', icon: 'donut', helper: 'Hire a baker', boostName: 'Glaze station', boostIcon: 'sparkle', fry: 4.0, body: ['#8e9aa6', '#c9d3dc'], boostCols: ['#e58fb4', '#ffd1e3', '#ff7eb3'] },
  lemon:    { name: 'Lemon Shake-Up', unit: 'lemonade', plural: 'lemonades', machine: 'lemon press', style: 'press', theme: '#eaa400', cloth: '#f2c200', icon: 'lemon', helper: 'Hire a juicer', boostName: 'Ice machine', boostIcon: 'ice', fry: 3.6, body: ['#e0b62e', '#ffe98a'], boostCols: ['#7fb6d9', '#d8f0ff', '#f4fbff'] },
  corndog:  { name: 'Corn Dog Corral', unit: 'corn dog', plural: 'corn dogs', machine: 'corn dog fryer', style: 'fryer', theme: '#3d7bd9', cloth: '#3d7bd9', icon: 'corndog', helper: 'Hire a cook', boostName: 'Mustard bar', boostIcon: 'dot', fry: 4.4, body: ['#8e9aa6', '#c9d3dc'], boostCols: ['#b8483a', '#f3c48d', '#fff0d6'] },
  candy:    { name: 'Cotton Candy Cloud', unit: 'cotton candy', plural: 'cotton candy', machine: 'spinner', style: 'spinner', theme: '#9b5cff', cloth: '#b07cff', icon: 'candy', helper: 'Hire a spinner', boostName: 'Color swirl', boostIcon: 'swirl', fry: 4.8, body: ['#d98ab0', '#ffd6e8'], boostCols: ['#8f6cd9', '#e2d6ff', '#f6f0ff'] },
  popcorn:  { name: 'Pop Shop', unit: 'bag of popcorn', plural: 'popcorn', machine: 'popper', style: 'popper', theme: '#e63946', cloth: '#e63946', icon: 'popcorn', helper: 'Hire a popper', boostName: 'Butter pump', boostIcon: 'butter', fry: 3.8, body: ['#b8303c', '#ef5a66'], boostCols: ['#d9a400', '#fff0b3', '#ffe066'] },
  pretzel:  { name: 'Twisty Pretzels', unit: 'pretzel', plural: 'pretzels', machine: 'oven', style: 'oven', theme: '#a0522d', cloth: '#c9783a', icon: 'pretzel', helper: 'Hire a baker', boostName: 'Cheese dip', boostIcon: 'cheese', fry: 4.2, body: ['#5b6573', '#8a95a3'], boostCols: ['#d9a400', '#fff3c4', '#ffd23f'] },
  icecream: { name: 'Scoop Dreams', unit: 'ice cream', plural: 'ice cream', machine: 'freezer', style: 'freezer', theme: '#36b3ba', cloth: '#5fd0d6', icon: 'icecream', helper: 'Hire a scooper', boostName: 'Sprinkle bar', boostIcon: 'cherry', fry: 3.6, body: ['#8fd3d8', '#f2fbfc'], boostCols: ['#e05a7a', '#ffe0ea', '#fff6f9'] },
  funnel:   { name: 'Funnel Cake Co.', unit: 'funnel cake', plural: 'funnel cakes', machine: 'fryer', style: 'fryer', theme: '#ff8c42', cloth: '#ff9f5a', icon: 'funnel', helper: 'Hire a cook', boostName: 'Powdered sugar', boostIcon: 'snow', fry: 4.6, body: ['#8e9aa6', '#c9d3dc'], boostCols: ['#aab4be', '#ffffff', '#f4f4f4'] }
};

export const FOOD_ORDER = ['donut', 'lemon', 'corndog', 'candy', 'popcorn', 'pretzel', 'icecream', 'funnel'];

export const RIDES = {
  ferris:   { name: 'Big Wheel', icon: 'ferris', theme: '#3fa7ff', cycle: 7, spd: 0.7 },
  carousel: { name: 'Carousel', icon: 'carousel', theme: '#9b5cff', cycle: 6, spd: 1.1 },
  bumper:   { name: 'Bumper Cars', icon: 'bumper', theme: '#ff4d6d', cycle: 6, spd: 1 },
  tower:    { name: 'Drop Tower', icon: 'tower', theme: '#ef4b5b', cycle: 5, spd: 1 },
  swings:   { name: 'Star Swings', icon: 'swings', theme: '#f29e1f', cycle: 6, spd: 1.5 },
  coaster:  { name: 'Thunder Coaster', icon: 'coaster', theme: '#e63946', cycle: 8, spd: 1 },
  haunted:  { name: 'Haunted House', icon: 'haunted', theme: '#6a4fa3', cycle: 7, spd: 1 }
};

export const RIDE_ORDER = ['ferris', 'carousel', 'bumper', 'tower', 'swings', 'coaster', 'haunted'];

export const GAMES = {
  ringtoss: { name: 'Ring Toss', icon: 'ring', theme: '#ef4b5b' },
  balloon:  { name: 'Balloon Darts', icon: 'balloon', theme: '#3fa7ff' },
  duck:     { name: 'Duck Pond', icon: 'duck', theme: '#25a88f' },
  bottles:  { name: 'Milk Bottles', icon: 'bottle', theme: '#f29e1f' },
  hoops:    { name: 'Hoop Shot', icon: 'hoop', theme: '#e8702a' },
  water:    { name: 'Water Gun Race', icon: 'water', theme: '#2b9ea6' },
  strength: { name: 'High Striker', icon: 'bell', theme: '#d6336c' },
  whack:    { name: 'Whack-a-Mole', icon: 'hammer', theme: '#8a6240' },
  skee:     { name: 'Skee-Ball', icon: 'bowling', theme: '#9b5cff' },
  shooting: { name: 'Shooting Gallery', icon: 'target', theme: '#3d7bd9' },
  weight:   { name: 'Guess Your Weight', icon: 'scale', theme: '#5b6573' },
  plinko:   { name: 'Plinko Drop', icon: 'plinko', theme: '#b03cc9' },
  coin:     { name: 'Coin Toss', icon: 'coin', theme: '#c99400' },
  frog:     { name: 'Frog Bounce', icon: 'frog', theme: '#43a047' }
};

export const GAME_ORDER = Object.keys(GAMES);

export const START = {
  '0,0': ['food', 'donut'], '1,0': ['hr', 'hr'], '-1,0': ['food', 'lemon'], '0,-1': ['ride', 'ferris'], '0,1': ['game', 'balloon'],
  '1,-1': ['food', 'corndog'], '-1,-1': ['game', 'duck'], '1,1': ['ride', 'carousel'], '-1,1': ['game', 'ringtoss'],
  '2,0': ['game', 'hoops'], '-2,0': ['ride', 'bumper'], '0,-2': ['game', 'bottles'], '0,2': ['food', 'candy'],
  '2,-1': ['game', 'whack'], '-2,1': ['food', 'popcorn'], '2,1': ['game', 'skee'], '-2,-1': ['game', 'water'],
  '1,-2': ['ride', 'tower'], '-1,2': ['game', 'shooting'], '1,2': ['food', 'pretzel'], '-1,-2': ['game', 'strength'],
  '3,0': ['ride', 'coaster'], '-3,0': ['food', 'icecream'], '0,3': ['game', 'frog'], '0,-3': ['ride', 'swings'],
  '2,2': ['game', 'plinko'], '-2,-2': ['ride', 'haunted'], '2,-2': ['food', 'funnel'], '-2,2': ['game', 'coin'],
  '3,1': ['game', 'weight']
};

export const ITEM_H = { donut: 4.2, lemon: 6.5, corndog: 4.4, candy: 6.5, popcorn: 6.5, pretzel: 4.5, icecream: 7, funnel: 4, trash: 3.4, plush: 7 };
export const EAT_T = 5, SHELF_CAP = 24, MACH_CAP = 8, FOOD_Q = 6, RIDE_Q = 8, GAME_Q = 6, PRIZE_CAP = 24, CRATE_CAP = 10;

export const L = {
  shelf: { x: 110, y: 334 }, reg: { x: 240, y: 328 }, cash: { x: 290, y: 318 }, qgap: 34,
  machines: [{ x: 90, y: 180 }, { x: 170, y: 180 }, { x: 250, y: 180 }],
  tables: [{ x: 85, y: 480 }, { x: 175, y: 480 }, { x: 85, y: 600 }, { x: 175, y: 600 }]
};

export const SHIRTS = ['#4aa3ff', '#ffb43f', '#8e6cff', '#2ec4a6', '#ff6f91', '#5bc85b', '#f2654a', '#3d7bd9'];
export const SKINS = ['#f6d2b5', '#e8b48e', '#c98c62', '#9a6340', '#6e4429', '#f1c7a1'];
export const HAIRS = ['#3a2416', '#6b3f1f', '#1d1d1d', '#c8902f', '#8a3b22', '#5a5a5a'];
export const BALLOONS = ['#ff4d6d', '#ffd23f', '#3fa7ff', '#9b5cff', '#2ed39a'];
export const BRIGHT = ['#ff4d6d', '#ffd23f', '#3fa7ff', '#2ed39a', '#9b5cff', '#ff9a3c', '#ff7eb3', '#5fd0ff'];
export const PLUSH = ['#c98c62', '#ff9cc4', '#8fd8ff', '#ffe066', '#b9a7ff', '#7dd87d'];

export const HR_DEF = { name: 'HR Office', icon: 'tie', theme: '#5b6b8a' };
export const KIND_MULT = { food: 1, game: 0.9, ride: 1.3, hr: 1 };

export const TITLES = ['Backyard Fair', 'Village Fair', 'Town Fair', 'County Fair', 'District Fair', 'Regional Fair', 'State Fair', 'Grand Fair', 'National Fair', 'World\'s Fair'];
export const TOWNS = ['Maple Creek', 'Cedar Falls', 'Pine Hollow', 'Silver Lake', 'Red River', 'Oak Ridge', 'Willow Bend', 'Golden Valley'];

export const DAILY = [2, 3, 4, 5, 6, 8, 15];

export const PACKS = [
  { id: 'coins_80', coins: 80, price: '$0.99' },
  { id: 'coins_500', coins: 500, price: '$4.99', tag: 'Most popular' },
  { id: 'coins_1200', coins: 1200, price: '$9.99' },
  { id: 'coins_2800', coins: 2800, price: '$19.99' },
  { id: 'coins_8000', coins: 8000, price: '$49.99', tag: 'Best value' }
];
export const COINS_PER_MINUTE = 2;

export const SFX = {
  pick: [[660, 0.06, 'triangle', 0.12, 880]],
  drop: [[540, 0.06, 'triangle', 0.1, 400]],
  pay: [[880, 0.04, 'square', 0.025]],
  cash: [[988, 0.08, 'square', 0.05], [1319, 0.18, 'square', 0.05, 0, 0.07]],
  sale: [[1800, 0.035, 'square', 0.05, 350], [2093, 0.45, 'sine', 0.11, 0, 0.06], [3136, 0.32, 'sine', 0.06, 0, 0.06], [4186, 0.22, 'sine', 0.04, 0, 0.065], [2637, 0.5, 'triangle', 0.07, 0, 0.12], [5274, 0.25, 'sine', 0.025, 0, 0.12]],
  buy: [[523, 0.08, 'triangle', 0.12], [659, 0.08, 'triangle', 0.12, 0, 0.07], [784, 0.16, 'triangle', 0.12, 0, 0.14]],
  open: [[523, 0.1, 'square', 0.07], [659, 0.1, 'square', 0.07, 0, 0.1], [784, 0.1, 'square', 0.07, 0, 0.2], [1047, 0.35, 'square', 0.07, 0, 0.3]],
  trash: [[150, 0.1, 'sawtooth', 0.06, 70]],
  win: [[1047, 0.06, 'triangle', 0.05], [1319, 0.06, 'triangle', 0.05, 0, 0.06], [1568, 0.12, 'triangle', 0.05, 0, 0.12]],
  quest: [[784, 0.1, 'sine', 0.14], [1175, 0.25, 'sine', 0.14, 0, 0.1]],
  level: [[523, 0.12, 'sine', 0.14], [784, 0.12, 'sine', 0.14, 0, 0.12], [1047, 0.12, 'sine', 0.14, 0, 0.24], [1568, 0.4, 'sine', 0.12, 0, 0.36]],
  coin: [[1568, 0.06, 'square', 0.05], [2093, 0.16, 'square', 0.05, 0, 0.06]],
  ride: [[220, 0.6, 'sawtooth', 0.03, 520]]
};

export const FONT = "'Fredoka', ui-rounded, 'Arial Rounded MT Bold', system-ui, sans-serif";

export const KEY = 'midway-donuts-v5';
export const OLD_KEYS = ['midway-donuts-v4', 'midway-donuts-v3', 'midway-donuts-v2', 'midway-donuts-v1'];

export const CHAR_COUNT = 10;
export const CHAR_DEFS = [
  { walk: 'Girl-boy-sprite.png', wr: 0, sit: 'sitting-3-sprite.png', sr: 0 },
  { walk: 'Girl-boy-sprite.png', wr: 2, sit: 'sitting-3-sprite.png', sr: 1 },
  { walk: 'Grandma-grandpa-sprite.png', wr: 0, sit: 'sitting-4-sprite.png', sr: 0 },
  { walk: 'Grandma-grandpa-sprite.png', wr: 2, sit: 'sitting-4-sprite.png', sr: 1 },
  { walk: 'girl-boy-2-sprite.png', wr: 0, sit: 'sitting-2-sprite.png', sr: 0 },
  { walk: 'girl-boy-2-sprite.png', wr: 2, sit: 'sitting-2-sprite.png', sr: 1 },
  { walk: 'villagers-2-sprite.png', wr: 0, sit: 'sitting-sprite-4.png', sr: 0 },
  { walk: 'villagers-2-sprite.png', wr: 2, sit: 'sitting-sprite-4.png', sr: 1 },
  { walk: 'villagers-3-sprite.png', wr: 0, sit: 'sitting-sprite.png', sr: 0 },
  { walk: 'villagers-3-sprite.png', wr: 2, sit: 'sitting-sprite.png', sr: 1 },
];
