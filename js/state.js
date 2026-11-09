import { CELL_W, CELL_H, W, H, CHAR_DEFS } from './config.js';

const cv = document.getElementById('game');
let ctx = cv.getContext('2d');

export { cv };
export function getCtx() { return ctx; }
export function setCtx(c) { ctx = c; }

function loadImg(src) { const img = new Image(); img.src = src; img.ready = false; img.onload = () => { img.ready = true; }; return img; }
const imgCache = {};
export function cachedImg(src) { if (!imgCache[src]) imgCache[src] = loadImg(src); return imgCache[src]; }
export const playerImg = loadImg('player-sprite.png');
export const chefImg = loadImg('chef-sprite.png');
export const staffImg = loadImg('employee-manager-sprites.png');

for (const d of CHAR_DEFS) { d.walkImg = cachedImg(d.walk); d.sitImg = cachedImg(d.sit); }

export const S = { money: 0, coins: 10, paid: {}, unlocked: {}, levels: {}, tut: 0, sales: 0, trashed: 0,
  town: 0, level: 1, xp: 0, album: {}, quests: [], qDone: 0, streak: 0, lastDaily: '', sound: true, vibe: true, qOpen: true };

export const player = { x: 200, y: 280, r: 11, speed: 118, carry: 0, carryType: null, cap: 2, face: 1, lastDir: 'down', walk: 0, moving: false, pickT: 0, dropT: 0, payT: 0, padStayT: 0, padStayId: null };

export const cells = new Map(), lotMap = new Map();

export const state = {
  lots: [],
  staff: [],
  floats: [],
  flyers: [],
  confetti: [],
  visitors: [],
  time: 0,
  saveT: 0,
  wrongT: -9,
  wrongMsg: '',
  openRides: 0,
  nOpen: 0,
  dpr: 1,
  scale: 1,
  cssW: 0,
  cssH: 0,
  camX: 0,
  camY: 0,
  viewW: W,
  viewH: H,
  curPad: null,
  noSave: false,
  dailyPending: false,
};

export const bounds = { x0: 0, x1: CELL_W, y0: 0, y1: CELL_H };

export const joy = { on: false, id: null, ox: 0, oy: 0, x: 0, y: 0 };
export const keys = {};

export const sprites = {};

export const ck = (x, y) => x + ',' + y;
export const lvl = (lot, stat) => S.levels[lot.key + ':' + stat] || 0;
export const has = (lot, sub) => !!S.unlocked[lot.key + ':' + sub];
export const hasStaff = (lot, role) => state.staff.some(w => w.lot === lot && w.role === role);
export const lotByKey = k => lotMap.get(k);
export const cellAt = (x, y) => cells.get(ck(Math.floor(x / CELL_W), Math.floor(y / CELL_H)));
export const inView = (x0, x1, y0, y1) => x1 > state.camX - 10 && x0 < state.camX + state.viewW + 10 && (y0 == null || (y1 > state.camY - 10 && y0 < state.camY + state.viewH + 10));

export function hash(x, y, k) {
  let h = (x * 374761393 + y * 668265263 + (k || 0) * 2246822519) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}
