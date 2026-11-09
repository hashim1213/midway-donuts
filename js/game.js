import {
  CELL_W, CELL_H, W, H, FOODS, FOOD_ORDER, RIDES, RIDE_ORDER, GAMES, GAME_ORDER,
  START, ITEM_H, EAT_T, SHELF_CAP, MACH_CAP, FOOD_Q, RIDE_Q, GAME_Q, PRIZE_CAP, CRATE_CAP,
  L, SHIRTS, SKINS, HAIRS, BALLOONS, BRIGHT, HR_DEF, KIND_MULT, TITLES,
  TOWNS, DAILY, PACKS, SFX as SFX_DEF, KEY, OLD_KEYS, CHAR_COUNT
} from './config.js';
import { rand, randi, pick, dist, clamp, lerp, num, nice, roman, fmt } from './helpers.js';
import {
  cv, S, player, cells, lotMap, state, bounds, joy, keys, sprites,
  ck, lvl, has, hasStaff, lotByKey, cellAt, inView, hash, getCtx
} from './state.js';
import { cloudSave, cloudLoad, ensureAuth, onReady } from './firebase.js';

export function buzz(ms) { if (!S.vibe) return; try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} }

function cellDef(x, y) {
  let ax = x, ay = y;
  for (let i = 0; i < (S.town || 0) % 4; i++) [ax, ay] = [-ay, ax];
  const s = START[ck(ax, ay)];
  if (s) return s;
  const h = hash(x + (S.town || 0) * 7919, y), r = h % 100;
  const kind = r < 36 ? 'food' : r < 70 ? 'game' : 'ride';
  const pool = kind === 'food' ? FOOD_ORDER : kind === 'ride' ? RIDE_ORDER : GAME_ORDER;
  return [kind, pool[(h >>> 7) % pool.length]];
}

export const openPrice = (n, kind) => nice(2000 * Math.pow(1.7, Math.max(0, n - 1)) * KIND_MULT[kind]);

/* ---------- lots ---------- */
function padList(lot, list) {
  const pr = v => nice(v * lot.mult);
  return list.map(([id, kind, arg, price, x, y, icon, label]) => ({
    id: lot.key + ':' + id, key: lot.key, kind, i: typeof arg === 'number' ? arg : 0, role: typeof arg === 'string' ? arg : null,
    price: pr(price), x: lot.ox + x, y: lot.oy + y, icon, label, half: 28
  }));
}

function makePads(lot) {
  const d = lot.def, first = lot.key === 'c0_0';
  if (lot.kind === 'hr') return padList(lot, []);
  if (lot.kind === 'food') {
    const l = [
      ['table1', 'table', 1, 30, 175, 480, 'table', 'Picnic table'],
      ['m1', 'machine', 1, 70, 170, 180, d.icon, 'Second ' + d.machine],
      ['table2', 'table', 2, 110, 85, 600, 'table', 'Picnic table'],
      ['helper', 'staff', 'helper', 180, 322, 262, 'chef', d.helper],
      ['cleaner', 'staff', 'cleaner', 240, first ? 175 : 330, first ? 668 : 520, 'broom', 'Hire a cleaner'],
      ['boost', 'boost', 0, 320, 330, 180, d.boostIcon, d.boostName],
      ['cashier', 'staff', 'cashier', 420, 240, 262, 'cash', 'Hire a cashier']
    ];
    if (first) l.splice(1, 0, ['tray0', 'tray', 4, 40, 85, 668, 'basket', 'Carry 4']);
    if (first) l.push(['tray', 'tray', 6, 300, 85, 668, 'basket', 'Carry 6']);
    l.push(['m2', 'machine', 2, 550, 250, 180, d.icon, 'Third ' + d.machine]);
    l.push(['table3', 'table', 3, 650, 175, 600, 'table', 'Picnic table']);
    if (first) l.push(['shoes', 'shoes', 0, 450, 100, 262, 'shoe', 'Fast shoes']);
    l.push(['manager', 'staff', 'manager', 1000, first ? 175 : 330, first ? 668 : 640, 'briefcase', 'Hire a manager']);
    return padList(lot, l);
  }
  if (lot.kind === 'ride') return padList(lot, [
    ['operator', 'staff', 'operator', 200, 85, 480, 'wrench', 'Hire an operator'],
    ['seats1', 'seats', 0, 280, 85, 600, 'seat', 'More seats'],
    ['lights', 'lights', 0, 380, 330, 510, 'bulb', 'Bright lights'],
    ['speed1', 'speed', 0, 480, 330, 630, 'bolt', 'Faster motor'],
    ['seats2', 'seats', 0, 600, 180, 480, 'seat', 'Even more seats'],
    ['manager', 'staff', 'manager', 1000, 180, 600, 'briefcase', 'Hire a manager']
  ]);
  return padList(lot, [
    ['st2', 'station', 2, 90, 90, 570, 'tent', 'Third play spot'],
    ['barker', 'staff', 'barker', 200, 310, 530, 'megaphone', 'Hire a barker'],
    ['runner', 'staff', 'runner', 260, 90, 660, 'plush', 'Hire a prize runner'],
    ['boost', 'boost', 0, 340, 310, 620, 'sparkle', 'Fancier prizes'],
    ['st3', 'station', 3, 480, 90, 570, 'tent', 'Fourth play spot'],
    ['manager', 'staff', 'manager', 1000, 310, 530, 'briefcase', 'Hire a manager']
  ]);
}

function levelPads(lot) {
  if (lot.kind === 'hr') return [];
  const out = [];
  const add = (stat, base, x, y, icon, label) => {
    const lv = lvl(lot, stat);
    out.push({ id: lot.key + ':' + stat + ':' + (lv + 1), key: lot.key, kind: 'level', stat, price: nice(base * lot.mult * Math.pow(1.75, lv)),
      x: lot.ox + x, y: lot.oy + y, icon, label: label + ' ' + (lv + 2), half: 28 });
  };
  if (lot.kind === 'food') {
    add('recipe', 600, 290, 262, 'star', 'Recipe level');
    if (lot.fry > 0.72) add('speed', 500, 120, 262, 'bolt', 'Machine speed');
  } else if (lot.kind === 'ride') {
    add('tix', 600, 85, 540, 'ticket', 'Ticket price');
    if (lot.cycle > 3.05) add('motor', 500, 180, 540, 'bolt', 'Ride speed');
  } else {
    add('tix', 600, 90, 600, 'ticket', 'Game price');
    if (lot.playT > 1.65) add('speed', 500, 310, 600, 'bolt', 'Game speed');
  }
  return out;
}

/* ---------- HR ---------- */
export const hrOpen = () => state.lots.some(l => l.kind === 'hr' && l.open);
export const hrFor = lot => !!S.unlocked['hr:' + lot.key];
export function hrLotKey() { const l = state.lots.find(l => l.kind === 'hr'); return l ? l.key : 'c1_0'; }
export const staffMult = () => 1 + 0.15 * (S.levels[hrLotKey() + ':hrspeed'] || S.levels['c0_0:hrspeed'] || 0);
export const staffCap = () => Math.min(6, 2 + 2 * (S.levels[hrLotKey() + ':hrcarry'] || S.levels['c0_0:hrcarry'] || 0));

function hrPads(lot) {
  const k = lot.key, out = [];
  const targets = state.lots.filter(l => l.open && l.kind !== 'hr' && !hrFor(l));
  const cols = 3, spacing = 80;
  targets.forEach((tgt, i) => {
    const col = i % cols, row = Math.floor(i / cols);
    const px = lot.ox + 100 + col * spacing, py = lot.oy + 440 + row * 70;
    const hrPrice = nice(100 * tgt.mult + 50);
    out.push({ id: 'hr:' + tgt.key, key: k, kind: 'hrauth', target: tgt.key,
      price: hrPrice, x: px, y: py, icon: tgt.def.icon, label: 'HR for ' + tgt.name, half: 28 });
  });
  const sp = S.levels[k + ':hrspeed'] || 0, ca = S.levels[k + ':hrcarry'] || 0;
  const baseY = lot.oy + 440 + Math.ceil(targets.length / cols) * 70 + (targets.length ? 10 : 0);
  if (sp < 8) out.push({ id: k + ':hrspeed:' + (sp + 1), key: k, kind: 'level', stat: 'hrspeed', price: nice(250 * Math.pow(2.2, sp)),
    x: lot.ox + 150, y: baseY, icon: 'runner', label: 'Staff speed ' + (sp + 2), half: 28 });
  if (staffCap() < 6) out.push({ id: k + ':hrcarry:' + (ca + 1), key: k, kind: 'level', stat: 'hrcarry', price: nice(300 * Math.pow(2.4, ca)),
    x: lot.ox + 280, y: baseY, icon: 'box', label: 'Staff carry ' + Math.min(6, staffCap() + 2), half: 28 });
  return out;
}

export function recompute(lot) {
  if (lot.kind === 'hr') return;
  if (lot.kind === 'food') {
    lot.boosted = has(lot, 'boost');
    lot.price = Math.round(gMult() * lot.basePrice * (lot.boosted ? 1.5 : 1) * Math.pow(1.12, lvl(lot, 'recipe')));
    lot.fry = Math.max(0.7, lot.def.fry * Math.pow(0.88, lvl(lot, 'speed')));
  } else if (lot.kind === 'ride') {
    lot.ticket = Math.round(gMult() * lot.basePrice * (has(lot, 'lights') ? 1.5 : 1) * Math.pow(1.12, lvl(lot, 'tix')));
    lot.cap = 4 + (has(lot, 'seats1') ? 4 : 0) + (has(lot, 'seats2') ? 4 : 0);
    lot.cycle = Math.max(3, lot.def.cycle * (has(lot, 'speed1') ? 0.75 : 1) * Math.pow(0.88, lvl(lot, 'motor')));
  } else {
    lot.boosted = has(lot, 'boost');
    lot.price = Math.round(gMult() * lot.basePrice * (lot.boosted ? 1.5 : 1) * Math.pow(1.12, lvl(lot, 'tix')));
    lot.playT = Math.max(1.6, 3.2 * Math.pow(0.9, lvl(lot, 'speed')));
  }
}

function setRank(lot, rank) {
  lot.rank = rank; lot.mult = Math.pow(1.65, rank);
  const g = Math.pow(1.45, rank);
  lot.basePrice = Math.max(lot.kind === 'game' ? 1 : 2, Math.round((lot.kind === 'ride' ? 3 : 2) * g));
  lot.pads = makePads(lot);
  recompute(lot);
}

function makeLot(cx, cy) {
  const [kind, type] = cellDef(cx, cy);
  const def = kind === 'hr' ? HR_DEF : kind === 'food' ? FOODS[type] : kind === 'ride' ? RIDES[type] : GAMES[type];
  const ox = cx * CELL_W, oy = cy * CELL_H, key = 'c' + cx + '_' + cy;
  const lot = {
    cx, cy, key, kind, type, def, name: def.name, ox, oy, open: false, rank: 0, mult: 1,
    cash: 0, queue: [], customers: [], spawnT: 1.5, qx: ox + (kind === 'game' ? 200 : 240), qy0: oy + (kind === 'game' ? 512 : 402),
    tufts: Array.from({ length: 40 }, (_, k) => ({ x: ox + (hash(cx, cy, k) % 440) + 10, y: oy + 392 + (hash(cx, cy, k + 99) % 300) }))
  };
  if (kind === 'food') {
    Object.assign(lot, {
      machines: L.machines.map(p => ({ x: ox + p.x, y: oy + p.y, stock: 0, t: 0, on: false, ph: Math.random() * 6 })),
      tables: L.tables.map((p, j) => ({ x: ox + p.x, y: oy + p.y, on: j === 0, claimed: false,
        seats: [-14, 14].map(dx => ({ x: ox + p.x + dx, y: oy + p.y - 26, occ: null, trash: 0, tip: 0 })) })),
      bin: { x: ox + 40, y: oy + 424 }, binT: -9, shelf: 0, serveT: 0, regStaffed: false,
      shelfPos: { x: ox + L.shelf.x, y: oy + L.shelf.y }, reg: { x: ox + L.reg.x, y: oy + L.reg.y }, cashPos: { x: ox + L.cash.x, y: oy + L.cash.y }
    });
  } else if (kind === 'ride') {
    Object.assign(lot, {
      ride: { phase: 'idle', t: 0, boardT: 0, riders: [], ang: 0, spin: 0, prog: 0.25, ty: 330, cars: [] },
      ctrl: { x: ox + 300, y: oy + 414 }, cashPos: { x: ox + 346, y: oy + 420 }, staffed: false
    });
    if (type === 'bumper') for (let k = 0; k < 12; k++) lot.ride.cars.push({ x: ox + 90 + (k % 6) * 44, y: 210 + Math.floor(k / 6) * 34, a: rand(0, 6.28), col: BRIGHT[k % 8] });
  } else if (kind === 'hr') {
    Object.assign(lot, { cashPos: { x: ox + 200, y: oy + 500 } });
  } else {
    Object.assign(lot, {
      stations: [80, 160, 240, 320].map((lx, k) => ({ x: ox + lx, y: oy + 400, lx, on: k < 2, occ: null })),
      prizes: 6, crate: { x: ox + 50, y: oy + 480, stock: 4, t: 0 }, drop: { x: ox + 362, y: oy + 446 },
      barker: { x: ox + 200, y: oy + 470 }, cashPos: { x: ox + 262, y: oy + 470 }, staffed: false, payT: 0
    });
  }
  lot.openPad = { id: key + ':open', key, kind: 'open', x: ox + 200, y: oy + 520, icon: def.icon, label: 'Open ' + def.name, half: 38, price: 0 };
  setRank(lot, 0);
  return lot;
}

export function genCell(x, y) {
  const k = ck(x, y);
  if (cells.has(k)) return cells.get(k);
  const lot = makeLot(x, y);
  cells.set(k, lot); lotMap.set(lot.key, lot); state.lots.push(lot);
  return lot;
}

export function refreshMap() {
  for (const l of state.lots.slice()) if (l.open) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) genCell(l.cx + dx, l.cy + dy);
  state.nOpen = state.lots.filter(l => l.open).length;
  state.openRides = state.lots.filter(l => l.open && l.kind === 'ride').length;
  let a = Infinity, b = -Infinity, c = Infinity, d = -Infinity;
  for (const l of state.lots) { a = Math.min(a, l.cx); b = Math.max(b, l.cx); c = Math.min(c, l.cy); d = Math.max(d, l.cy); }
  bounds.x0 = a * CELL_W; bounds.x1 = (b + 1) * CELL_W; bounds.y0 = c * CELL_H; bounds.y1 = (d + 1) * CELL_H;
}

function openLot(lot, rank, fresh) {
  setRank(lot, rank);
  lot.open = true; lot.spawnT = 1.5;
  if (lot.kind === 'food') { lot.machines[0].on = true; if (fresh) lot.machines[0].stock = 2; }
  S.unlocked[lot.openPad.id] = true;
  refreshMap();
}

/* ---------- unlocking ---------- */
export function visiblePads() {
  const out = [];
  for (const lot of state.lots) {
    if (!lot.open) { lot.openPad.price = lot.kind === 'hr' ? 500 : openPrice(state.nOpen, lot.kind); out.push(lot.openPad); continue; }
    if (lot.kind === 'hr') { for (const p of hrPads(lot)) out.push(p); continue; }
    let n = 0;
    for (const p of lot.pads) { if (!S.unlocked[p.id]) { out.push(p); if (++n === 2) break; } }
    if (n === 0) for (const p of levelPads(lot)) out.push(p);
  }
  return out;
}

function spawnStaff(lot, role) {
  if (hasStaff(lot, role)) return;
  const ox = lot.ox, oy = lot.oy;
  let home;
  if (role === 'helper') home = { x: ox + 322, y: oy + 262 };
  else if (role === 'cashier') home = { x: lot.reg.x, y: lot.reg.y };
  else if (role === 'cleaner') home = { x: ox + 68, y: oy + 410 };
  else if (role === 'operator') home = { x: lot.ctrl.x, y: lot.ctrl.y };
  else if (role === 'barker') home = { x: lot.barker.x, y: lot.barker.y };
  else if (role === 'runner') home = { x: ox + 120, y: oy + 470 };
  else home = lot.kind === 'food' ? { x: ox + 326, y: oy + 312 } : lot.kind === 'ride' ? { x: ox + 374, y: oy + 424 } : { x: ox + 290, y: oy + 474 };
  state.staff.push({ lot, role, x: home.x, y: home.y, home, state: 'idle', carry: 0, t: 0, target: null, walk: 0, moving: false, face: 1, lastDir: 'down', base: role === 'cleaner' ? 85 : 92, speed: (role === 'cleaner' ? 85 : 92) * staffMult() });
}

export function applyUnlock(p, fresh) {
  const lot = lotByKey(p.key);
  if (p.kind === 'open') { openLot(lot, state.nOpen, fresh); delete S.paid[p.id]; }
  else if (p.kind === 'level') { S.levels[lot.key + ':' + p.stat] = lvl(lot, p.stat) + 1; delete S.paid[p.id]; }
  else if (p.kind === 'hrauth') { S.unlocked[p.id] = true; delete S.paid[p.id]; }
  else S.unlocked[p.id] = true;
  if (p.kind === 'table') lot.tables[p.i].on = true;
  else if (p.kind === 'machine') { lot.machines[p.i].on = true; if (fresh) lot.machines[p.i].stock = 2; }
  else if (p.kind === 'station') lot.stations[p.i].on = true;
  else if (p.kind === 'staff') spawnStaff(lot, p.role);
  else if (p.kind === 'tray') player.cap = Math.min(6, Math.max(player.cap, p.i));
  else if (p.kind === 'shoes') player.speed = 150;
  recompute(lot);
  afterUnlock(lot, p, fresh);
  if (fresh) {
    ejectPlayer();
    burst(p.x, p.y);
    if (p.kind === 'open') { burst(lot.ox + 200, lot.oy + 230); addFloat(lot.ox + 200, lot.oy + 300, lot.name + ' is open!', '#ffffff', 2.2, 19); buzz(60); }
    else addFloat(p.x, p.y - 34, p.label + '!', '#ffffff', 1.6, 16);
    buzz(30);
    save();
  }
}

/* ---------- collision + camera ---------- */
function obstacles() {
  const o = [];
  const pc = Math.floor(player.x / CELL_W), pr = Math.floor(player.y / CELL_H);
  for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
    const lot = cells.get(ck(pc + dx, pr + dy));
    if (!lot) continue;
    const ox = lot.ox, oy = lot.oy;
    if (!lot.open) { o.push({ x: ox + 18, y: oy + 120, w: 364, h: 260 }); continue; }
    if (lot.kind === 'hr') { o.push({ x: ox + 130, y: oy + 200, w: 140, h: 120 }); continue; }
    if (lot.kind === 'ride') { o.push({ x: ox + 20, y: oy + 120, w: 360, h: 258 }, { x: ox + 284, y: oy + 370, w: 32, h: 28 }); continue; }
    if (lot.kind === 'game') { o.push({ x: ox + 14, y: oy + 120, w: 372, h: 260 }); continue; }
    o.push({ x: ox, y: oy + 130, w: 30, h: 248 }, { x: ox + 370, y: oy + 130, w: 30, h: 248 }, { x: ox + 30, y: oy + 350, w: 270, h: 28 }, { x: ox + 14, y: oy + 118, w: 372, h: 44 });
    for (const m of lot.machines) if (m.on) o.push({ x: m.x - 28, y: m.y - 24, w: 56, h: 46 });
    if (lot.boosted) o.push({ x: ox + 304, y: oy + 156, w: 52, h: 46 });
    for (const t of lot.tables) if (t.on) o.push({ x: t.x - 30, y: t.y - 16, w: 60, h: 32 });
  }
  return o;
}

function walkable(x, y, r) {
  return !!(cellAt(x - r, y - r) && cellAt(x + r, y - r) && cellAt(x - r, y + r) && cellAt(x + r, y + r));
}

function collide(e, r, rects) {
  for (const b of rects) {
    const cx = clamp(e.x, b.x, b.x + b.w), cy = clamp(e.y, b.y, b.y + b.h);
    const dx = e.x - cx, dy = e.y - cy, d2 = dx * dx + dy * dy;
    if (d2 < r * r) {
      if (d2 > 0.0001) { const d = Math.sqrt(d2); e.x += dx / d * (r - d); e.y += dy / d * (r - d); }
      else e.y = b.y + b.h + r + 0.5;
    }
  }
}

export function ejectPlayer() {
  for (const b of obstacles()) {
    if (player.x > b.x - player.r && player.x < b.x + b.w + player.r && player.y > b.y - player.r && player.y < b.y + b.h + player.r) {
      player.y = b.y + b.h + player.r + 1;
    }
  }
}

export function resize() {
  const vv = window.visualViewport;
  const w = vv ? vv.width : cv.clientWidth;
  const h = vv ? vv.height : cv.clientHeight;
  state.cssW = w; state.cssH = h;
  state.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  cv.width = Math.max(1, Math.round(w * state.dpr));
  cv.height = Math.max(1, Math.round(h * state.dpr));
  state.scale = Math.min(w / W, h / H) || 1;
  updateCamera(0, true);
}

function camAxis(p, view, lo, hi) {
  lo -= 80; hi += 80;
  if (hi - lo <= view) return (lo + hi - view) / 2;
  return clamp(p - view / 2, lo, hi - view);
}

export function updateCamera(dt, snap) {
  state.viewW = state.cssW / state.scale || W; state.viewH = state.cssH / state.scale || H;
  const tx = camAxis(player.x, state.viewW, bounds.x0, bounds.x1), ty = camAxis(player.y - 40, state.viewH, bounds.y0, bounds.y1);
  const k = snap ? 1 : Math.min(1, dt * 7);
  state.camX += (tx - state.camX) * k; state.camY += (ty - state.camY) * k;
}

/* ---------- input ---------- */
const JOY_R = 56;
export function inputVec() {
  let x = 0, y = 0;
  if (keys.arrowleft || keys.a) x -= 1;
  if (keys.arrowright || keys.d) x += 1;
  if (keys.arrowup || keys.w) y -= 1;
  if (keys.arrowdown || keys.s) y += 1;
  if (x || y) { const m = Math.hypot(x, y); return { x: x / m, y: y / m }; }
  if (joy.on) {
    let dx = joy.x - joy.ox, dy = joy.y - joy.oy, m = Math.hypot(dx, dy);
    if (m < 6) return { x: 0, y: 0 };
    if (m > JOY_R) { joy.ox = joy.x - dx / m * JOY_R; joy.oy = joy.y - dy / m * JOY_R; dx = joy.x - joy.ox; dy = joy.y - joy.oy; m = JOY_R; }
    const k = Math.min(1, m / (JOY_R * 0.6));
    return { x: dx / m * k, y: dy / m * k };
  }
  return { x: 0, y: 0 };
}
export { JOY_R };

export function setupInput() {
  cv.addEventListener('pointerdown', e => {
    if (joy.on) return;
    const r = cv.getBoundingClientRect();
    joy.on = true; joy.id = e.pointerId;
    joy.ox = joy.x = e.clientX - r.left; joy.oy = joy.y = e.clientY - r.top;
    try { cv.setPointerCapture(e.pointerId); } catch (err) {}
    e.preventDefault();
  });
  cv.addEventListener('pointermove', e => {
    if (!joy.on || e.pointerId !== joy.id) return;
    const r = cv.getBoundingClientRect();
    joy.x = e.clientX - r.left; joy.y = e.clientY - r.top;
  });
  const endJoy = e => { if (e.pointerId === joy.id) { joy.on = false; joy.id = null; } };
  cv.addEventListener('pointerup', endJoy);
  cv.addEventListener('pointercancel', endJoy);
  window.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; if (e.key.startsWith('Arrow')) e.preventDefault(); });
  window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
  window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; joy.on = false; });
  cv.addEventListener('contextmenu', e => e.preventDefault());
  if (window.visualViewport) window.visualViewport.addEventListener('resize', () => resize());
}

/* ---------- effects ---------- */
export function addFloat(x, y, text, color, life, size) { state.floats.push({ x, y, text, color: color || '#fff', t: 0, life: life || 1, size: size || 15 }); }

export function fly(type, x, y, tgt, o) {
  o = o || {};
  for (let i = 0; i < (o.count || 1); i++) {
    state.flyers.push({ type, item: o.item, boost: o.boost, idx: o.idx || 0, x0: x + rand(-3, 3), y0: y + rand(-3, 3), tgt, lift: o.lift == null ? 20 : o.lift, t: -i * 0.05, dur: o.dur || (0.32 + rand(0, 0.08)) });
  }
}

export function burst(x, y) {
  const cols = ['#ff4d6d', '#ffd23f', '#3fa7ff', '#2ed39a', '#ff7eb3', '#ffffff'];
  for (let i = 0; i < 34; i++) {
    const a = rand(0, Math.PI * 2), sp = rand(60, 190);
    state.confetti.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 120, rot: rand(0, 6), vr: rand(-10, 10), c: pick(cols), t: 0 });
  }
}

export function shelfSlot(lot, i) { const row = Math.floor(i / 8), col = i % 8; return { x: lot.ox + 67 + col * 12.2, y: lot.oy + 346 - row * 10 }; }
export function prizeSlot(lot, i) { const row = Math.floor(i / 12), col = i % 12; return { x: lot.ox + 52 + col * 27, y: lot.oy + (row ? 206 : 172) }; }
export const itemFx = lot => ({ item: lot.type, boost: lot.boosted });
export function gain(amt) { S.money += Math.round(amt); bumpMoney(); track('cash', Math.round(amt)); }

/* ---------- movement ---------- */
export function moveTo(e, tx, ty, sp, dt) {
  const dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy), step = sp * dt;
  if (d <= step || d < 0.5) { e.x = tx; e.y = ty; e.moving = false; return true; }
  e.x += dx / d * step; e.y += dy / d * step;
  e.moving = true; e.walk += dt * 9;
  if (Math.abs(dx) > 1) e.face = dx > 0 ? 1 : -1;
  if (Math.abs(dx) >= Math.abs(dy)) e.lastDir = dx > 0 ? 'right' : 'left';
  else e.lastDir = dy > 0 ? 'down' : 'up';
  return false;
}

function followPath(e, dt) {
  if (!e.path.length) { e.moving = false; return true; }
  const p = e.path[0];
  if (moveTo(e, p.x, p.y, e.speed, dt)) e.path.shift();
  return e.path.length === 0;
}

function seatPath(lot, s) {
  const cx = lot.ox + 130;
  if (s.y < lot.oy + 520) return [{ x: cx, y: s.y }, { x: s.x, y: s.y }];
  return [{ x: cx, y: lot.oy + 440 }, { x: cx, y: s.y }, { x: s.x, y: s.y }];
}

function exitPath(lot, x) {
  const py = lot.oy + 735 + rand(-10, 10), dir = x < lot.ox + 230 ? -1 : 1;
  return [{ x, y: py }, { x: x + dir * rand(150, 210), y: py }];
}

export const tableTrash = t => t.seats[0].trash + t.seats[1].trash;
export const hasTrash = lot => lot.tables.some(t => t.on && tableTrash(t) > 0);

function freeSeat(lot) {
  for (const t of lot.tables) if (t.on) for (const s of t.seats) if (!s.occ && s.trash === 0) return s;
  return null;
}

function takeTrash(lot, t, who) {
  const s = t.seats.find(q => q.trash > 0);
  if (!s) return;
  s.trash--; who.carry++;
  if (who === player) player.carryType = 'trash';
  fly('trash', s.x, t.y - 6, who, {});
  if (s.tip > 0) { gain(s.tip); addFloat(t.x, t.y - 34, '+$' + fmt(s.tip) + ' tip', '#ffe14d', 1.1, 15); s.tip = 0; }
}

function handsMsg() {
  if (player.carryType === 'trash') return 'Throw out the trash first';
  if (player.carryType === 'prize') return 'Drop off the prizes first';
  const o = lotByKey(player.carryType);
  return 'Drop off your ' + (o ? o.def.plural : 'food') + ' first';
}

/* ---------- update: player ---------- */
export function wrong(msg) { state.wrongT = state.time; state.wrongMsg = msg; }

function updatePlayer(dt) {
  const v = inputVec();
  player.moving = !!(v.x || v.y);
  const px = player.x, py = player.y;
  const nx = px + v.x * player.speed * dt, ny = py + v.y * player.speed * dt;
  if (walkable(nx, py, player.r)) player.x = nx;
  if (walkable(player.x, ny, player.r)) player.y = ny;
  if (Math.abs(v.x) > 0.2) player.face = v.x > 0 ? 1 : -1;
  if (player.moving) {
    if (Math.abs(v.x) >= Math.abs(v.y)) player.lastDir = v.x > 0 ? 'right' : 'left';
    else player.lastDir = v.y > 0 ? 'down' : 'up';
  }
  if (player.moving) player.walk += dt * 11 * Math.hypot(v.x, v.y);
  collide(player, player.r, obstacles());
  if (!walkable(player.x, player.y, player.r)) { player.x = px; player.y = py; }
  player.pickT += dt; player.dropT += dt; player.payT += dt;

  for (const lot of state.lots) {
    if (!lot.open || Math.abs(player.x - (lot.ox + 200)) > 300 || Math.abs(player.y - (lot.oy + 420)) > 420) continue;
    if (lot.cash > 0 && dist(player.x, player.y, lot.cashPos.x, lot.cashPos.y) < 38) {
      const amt = lot.cash; lot.cash = 0; gain(amt); sfx('cash');
      addFloat(player.x, player.y - 56, '+$' + fmt(amt), '#ffe14d', 1, 17);
      fly('bill', lot.cashPos.x, lot.cashPos.y - 6, player, { count: 6 });
    }
    if (lot.kind === 'game') {
      const cr = lot.crate;
      if (cr.stock > 0 && dist(player.x, player.y, cr.x, cr.y + 12) < 36) {
        if (player.carry > 0 && player.carryType !== 'prize') wrong(handsMsg());
        else if (player.carry < player.cap && player.pickT > 0.09) {
          cr.stock--; player.carry++; player.carryType = 'prize'; player.pickT = 0; sfx('pick'); buzz(6);
          fly('item', cr.x, cr.y - 10, player, { item: 'plush', idx: player.carry - 1 });
        }
      }
      if (player.carryType === 'prize' && player.carry > 0 && player.dropT > 0.07 && lot.prizes < PRIZE_CAP && dist(player.x, player.y, lot.drop.x, lot.drop.y) < 38) {
        player.carry--; lot.prizes++; player.dropT = 0; sfx('drop'); track('stock');
        fly('item', player.x, player.y - 22 - player.carry * ITEM_H.plush, prizeSlot(lot, lot.prizes - 1), { item: 'plush', idx: lot.prizes - 1, lift: 0, boost: lot.boosted });
      }
      continue;
    }
    if (lot.kind !== 'food') continue;
    const k = lot.key;
    for (const m of lot.machines) {
      if (!m.on || m.stock <= 0 || dist(player.x, player.y, m.x, m.y + 36) >= 34) continue;
      if (player.carry > 0 && player.carryType !== k) { wrong(handsMsg()); continue; }
      if (player.carry < player.cap && player.pickT > 0.09) {
        m.stock--; player.carry++; player.carryType = k; player.pickT = 0; sfx('pick'); buzz(6);
        fly('item', m.x, m.y + 24 - m.stock * ITEM_H[lot.type], player, itemFx(lot));
      }
    }
    if (player.carry > 0 && dist(player.x, player.y, lot.shelfPos.x, lot.shelfPos.y) < 40) {
      if (player.carryType !== k) wrong(lotByKey(player.carryType) ? 'This stand only sells ' + lot.def.plural : handsMsg());
      else if (lot.shelf < SHELF_CAP && player.dropT > 0.07) {
        player.carry--; lot.shelf++; player.dropT = 0; sfx('drop'); track('stock');
        fly('item', player.x, player.y - 22 - player.carry * ITEM_H[lot.type], shelfSlot(lot, lot.shelf - 1), Object.assign(itemFx(lot), { lift: 0 }));
      }
    }
    for (const t of lot.tables) {
      if (!t.on || tableTrash(t) === 0 || dist(player.x, player.y, t.x, t.y) >= 50) continue;
      if (player.carry > 0 && player.carryType !== 'trash') { wrong('Hands full. ' + handsMsg()); continue; }
      if (player.carry < player.cap && player.pickT > 0.08) { player.pickT = 0; takeTrash(lot, t, player); sfx('pick'); }
    }
    if (player.carryType === 'trash' && player.carry > 0 && player.dropT > 0.06 && dist(player.x, player.y, lot.bin.x, lot.bin.y) < 38) {
      player.carry--; player.dropT = 0; S.trashed++; lot.binT = state.time; sfx('trash'); track('plate');
      fly('trash', player.x, player.y - 22 - player.carry * ITEM_H.trash, { x: lot.bin.x, y: lot.bin.y - 6 }, { lift: 18 });
    }
  }
  if (player.carry === 0) player.carryType = null;

  let onPad = null;
  for (const p of visiblePads()) { if (Math.abs(player.x - p.x) < p.half && Math.abs(player.y - p.y) < p.half) { onPad = p; break; } }
  state.curPad = onPad;
  if (!onPad || onPad.id !== player.padStayId) { player.padStayT = 0; player.padStayId = onPad ? onPad.id : null; }
  else player.padStayT += dt;
  if (onPad && onPad.kind === 'staff' && !hrOpen()) wrong('Open the HR Office plot first');
  else if (onPad && onPad.kind === 'staff' && hrOpen() && !hrFor(lotByKey(onPad.key))) wrong('Upgrade HR for this plot first');
  else if (onPad && S.money > 0 && player.padStayT >= 0.5 && player.payT > 0.05) {
    player.payT = 0;
    const paid = S.paid[onPad.id] || 0;
    const step = Math.min(onPad.price - paid, S.money, Math.max(1, Math.ceil(onPad.price * 0.035)));
    S.money -= step; S.paid[onPad.id] = paid + step; sfx('pay', 90);
    if (Math.random() < 0.6) state.flyers.push({ type: 'bill', x0: player.x, y0: player.y - 24, tgt: { x: onPad.x, y: onPad.y }, lift: 0, t: 0, dur: 0.25 });
    if (S.paid[onPad.id] >= onPad.price) applyUnlock(onPad, true);
  }
}

/* ---------- update: lots ---------- */
function crowd() { return Math.min(1.6, 1 + 0.06 * state.openRides); }

function spawnCustomer(lot) {
  const side = Math.random() < 0.5 ? -1 : 1;
  const c = {
    lot, x: clamp(lot.qx + side * rand(110, 200), lot.ox + 10, lot.ox + CELL_W - 10), y: lot.oy + rand(722, 748), state: 'enter',
    want: 1, got: 0, seat: null, noSeat: false, noPrize: false, station: null, win: false, prizeIdx: -1,
    shirt: pick(SHIRTS), skin: pick(SKINS), hair: pick(HAIRS), walk: 0, moving: false, face: 1, lastDir: 'down', spriteIdx: Math.floor(Math.random() * CHAR_COUNT), t: 0, age: 0, alpha: 0,
    speed: rand(62, 80), atFront: false, exitDelay: 0, balloon: Math.random() < 0.2 ? pick(BALLOONS) : null
  };
  c.path = [{ x: lot.qx, y: lot.oy + 735 }];
  lot.customers.push(c); lot.queue.push(c);
  return c;
}

function updateSpawn(lot, dt) {
  lot.spawnT -= dt;
  if (lot.spawnT > 0) return;
  if (lot.kind === 'food') {
    const nt = lot.tables.filter(t => t.on).length, nm = lot.machines.filter(m => m.on).length;
    lot.spawnT = Math.max(1.4, (4.4 - nt * 0.4 - (nm - 1) * 0.3) / crowd()) * rand(0.75, 1.25);
    if (lot.queue.length >= FOOD_Q || lot.customers.length >= 16) return;
    spawnCustomer(lot).want = randi(1, nt >= 3 ? 3 : 2);
  } else if (lot.kind === 'game') {
    const ns = lot.stations.filter(s => s.on).length;
    lot.spawnT = Math.max(1.3, (3.8 - ns * 0.35) / crowd()) * rand(0.75, 1.25);
    if (lot.queue.length >= GAME_Q || lot.customers.length >= 14) return;
    spawnCustomer(lot);
  } else {
    lot.spawnT = Math.max(0.9, (2.8 - (lot.cap - 4) * 0.08) / Math.sqrt(crowd())) * rand(0.7, 1.3);
    if (lot.queue.length >= RIDE_Q || lot.customers.length >= 24) return;
    spawnCustomer(lot);
  }
}

function updateCustomers(lot, dt) {
  for (const c of lot.customers) {
    c.age += dt;
    if (c.state === 'enter') {
      c.alpha = Math.min(1, c.age * 2.5);
      if (followPath(c, dt)) c.state = 'queue';
    } else if (c.state === 'queue') {
      c.alpha = 1;
      const k = lot.queue.indexOf(c);
      moveTo(c, lot.qx, lot.qy0 + k * L.qgap, c.speed, dt);
      c.atFront = k === 0 && Math.abs(c.y - lot.qy0) < 1 && Math.abs(c.x - lot.qx) < 1;
    } else if (c.state === 'toTable') {
      if (followPath(c, dt)) { c.state = 'eating'; c.t = 0; c.face = 1; c.lastDir = 'down'; }
    } else if (c.state === 'eating') {
      c.t += dt; c.moving = false;
      if (c.t > EAT_T) {
        const st = c.seat;
        st.trash += c.want; st.tip += Math.max(1, Math.round(lot.price * 0.25)) * c.want; st.occ = null; c.seat = null;
        c.state = 'leaving';
        const cx = lot.ox + 130;
        c.path = [{ x: cx, y: c.y }].concat(exitPath(lot, cx));
      }
    } else if (c.state === 'toStation') {
      if (followPath(c, dt)) { c.state = 'playing'; c.t = 0; c.win = Math.random() < 0.4; c.face = 1; }
    } else if (c.state === 'playing') {
      c.t += dt; c.moving = false;
      if (c.t >= lot.playT) {
        const st = c.station; st.occ = null; c.station = null;
        if (c.win) {
          if (lot.prizes > 0) { lot.prizes--; c.prizeIdx = lot.prizes; track('prize'); if (nearPlayer(c.x, c.y)) sfx('win', 150); addFloat(c.x, c.y - 60, 'Winner!', '#ffe14d', 1.1, 15); }
          else addFloat(c.x, c.y - 60, 'No prizes left!', '#ff9a9a', 1.1, 13);
        }
        c.state = 'leaving';
        c.path = [{ x: st.x, y: lot.oy + 452 }].concat(exitPath(lot, st.x));
      }
    } else if (c.state === 'boarding') {
      if (followPath(c, dt)) c.state = 'riding';
    } else if (c.state === 'leaving') {
      if (c.exitDelay > 0) { c.exitDelay -= dt; continue; }
      if (c.path.length === 1) c.alpha = clamp(dist(c.x, c.y, c.path[0].x, c.path[0].y) / 60, 0, 1);
      if (followPath(c, dt)) c.dead = true;
    }
  }
  lot.customers = lot.customers.filter(c => !c.dead);
}

function updateMachines(lot, dt) {
  for (const m of lot.machines) {
    if (!m.on) continue;
    if (m.stock < MACH_CAP) { m.t += dt; if (m.t >= lot.fry) { m.t = 0; m.stock++; } }
    else m.t = 0;
  }
}

function updateServe(lot, dt) {
  const c = lot.queue[0];
  lot.regStaffed = hasStaff(lot, 'cashier') || dist(player.x, player.y, lot.reg.x, lot.reg.y) < 28;
  if (!c || !c.atFront) { lot.serveT = 0; return; }
  if (!c.seat) {
    const st = freeSeat(lot);
    c.noSeat = !st;
    if (st && lot.regStaffed && lot.shelf > 0) { st.occ = c; c.seat = st; }
  }
  if (!c.seat || !lot.regStaffed || lot.shelf <= 0) { lot.serveT = 0; return; }
  lot.serveT += dt;
  if (lot.serveT < (hasStaff(lot, 'cashier') ? 0.3 / staffMult() : 0.3)) return;
  lot.serveT = 0;
  lot.shelf--; c.got++; track('food');
  const sl = shelfSlot(lot, lot.shelf);
  fly('item', sl.x, sl.y, c, Object.assign(itemFx(lot), { lift: 14 }));
  if (c.got >= c.want) {
    const pay = c.want * lot.price;
    lot.cash += pay; S.sales++; onSale(lot);
    addFloat(lot.reg.x, 300, '+$' + fmt(pay), '#7dff9a', 0.9, 15);
    lot.queue.shift(); c.atFront = false; c.noSeat = false;
    c.state = 'toTable'; c.path = seatPath(lot, c.seat);
  }
}

function updateRide(lot, dt) {
  const r = lot.ride, ox = lot.ox, oy = lot.oy;
  lot.staffed = hasStaff(lot, 'operator') || dist(player.x, player.y, lot.ctrl.x, lot.ctrl.y) < 30;
  const front = lot.queue[0];
  if (r.phase === 'idle') {
    r.t += dt;
    if (r.t > 0.6 && lot.staffed && front && front.atFront) { r.phase = 'loading'; r.t = 0; r.boardT = 1; }
  } else if (r.phase === 'loading') {
    r.t += dt; r.boardT += dt;
    const f = lot.queue[0];
    if (r.riders.length < lot.cap && f && f.atFront && r.boardT > 0.3) {
      r.boardT = 0;
      lot.queue.shift(); f.atFront = false; f.state = 'boarding';
      f.path = [{ x: ox + 240, y: oy + 368 }, { x: ox + 240 + rand(-30, 30), y: oy + 340 }];
      r.riders.push(f);
      lot.cash += lot.ticket; S.sales++; onSale(lot); track('ticket');
      addFloat(lot.ctrl.x, oy + 352, '+$' + fmt(lot.ticket), '#7dff9a', 0.8, 14);
    }
    const allIn = r.riders.every(c => c.state === 'riding');
    const waiting = lot.queue[0] && lot.queue[0].atFront;
    if (r.riders.length > 0 && allIn && (r.riders.length >= lot.cap || (r.t > 2.2 && !waiting) || r.t > 6)) { r.phase = 'running'; r.t = 0; if (nearPlayer(lot.ctrl.x, lot.ctrl.y)) sfx('ride', 300); }
    else if (r.riders.length === 0 && r.t > 3) { r.phase = 'idle'; r.t = 0; }
  } else if (r.phase === 'running') {
    r.t += dt;
    if (lot.type === 'haunted' && Math.random() < dt * 0.8) addFloat(ox + 200 + rand(-80, 80), oy + rand(200, 280), pick(['Boo!', 'Eek!', 'Aaah!']), '#ffffff', 1, 14);
    if (r.t >= lot.cycle) {
      r.riders.forEach((c, k) => {
        c.state = 'leaving'; c.exitDelay = k * 0.22;
        c.x = ox + 140; c.y = oy + 362;
        c.path = exitPath(lot, ox + 140);
      });
      r.riders = []; r.phase = 'idle'; r.t = 0;
    }
  }
  const running = r.phase === 'running';
  r.spin += ((running ? 1 : 0) - r.spin) * Math.min(1, dt * 1.6);
  r.ang += dt * r.spin * lot.def.spd * (7 / lot.cycle);
  if (lot.type === 'coaster') {
    if (running) { const p = r.t / lot.cycle; r.prog = 0.25 + 2 * (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2); }
    else r.prog = 0.25;
  } else if (lot.type === 'tower') {
    let ty = 330;
    if (running) {
      const p = r.t / lot.cycle;
      if (p < 0.55) ty = lerp(330, 146, p / 0.55);
      else if (p < 0.68) ty = 146;
      else if (p < 0.76) ty = lerp(146, 330, (p - 0.68) / 0.08);
      else ty = 330 - Math.sin((p - 0.76) / 0.24 * Math.PI) * 18 * (1 - p);
    }
    r.ty = ty;
  } else if (lot.type === 'bumper') {
    r.cars.forEach((c, k) => {
      if (running) {
        c.a += rand(-2.5, 2.5) * dt;
        c.x += Math.cos(c.a) * 70 * dt; c.y += Math.sin(c.a) * 70 * dt * 0.8;
        if (c.x < ox + 74) { c.x = ox + 74; c.a = Math.PI - c.a; }
        if (c.x > ox + 326) { c.x = ox + 326; c.a = Math.PI - c.a; }
        if (c.y < 196) { c.y = 196; c.a = -c.a; }
        if (c.y > 340) { c.y = 340; c.a = -c.a; }
      } else moveTo(c, ox + 90 + (k % 6) * 44, 210 + Math.floor(k / 6) * 34, 60, dt);
    });
  }
}

function updateGame(lot, dt) {
  const cr = lot.crate;
  if (cr.stock < CRATE_CAP) { cr.t += dt; if (cr.t >= 1.8) { cr.t = 0; cr.stock++; } } else cr.t = 0;
  lot.staffed = hasStaff(lot, 'barker') || dist(player.x, player.y, lot.barker.x, lot.barker.y) < 28;
  lot.payT += dt;
  const c = lot.queue[0];
  if (!c || !c.atFront) return;
  c.noPrize = lot.prizes <= 0;
  const st = lot.stations.find(s => s.on && !s.occ);
  if (st && lot.staffed && !c.noPrize && lot.payT > (hasStaff(lot, 'barker') ? 0.4 / staffMult() : 0.4)) {
    lot.payT = 0;
    lot.queue.shift(); c.atFront = false;
    st.occ = c; c.station = st; c.state = 'toStation';
    c.path = [{ x: c.x, y: lot.oy + 452 }, { x: st.x, y: lot.oy + 452 }, { x: st.x, y: st.y }];
    lot.cash += lot.price; S.sales++; onSale(lot); track('play');
    addFloat(lot.barker.x, lot.barker.y - 48, '+$' + fmt(lot.price), '#7dff9a', 0.9, 15);
  }
}

function updateStaffItem(dt) {
  for (const w of state.staff) {
    if (w.role === 'helper') updateHelper(w, dt);
    else if (w.role === 'cleaner') updateCleaner(w, dt);
    else if (w.role === 'runner') updateRunner(w, dt);
    else if (w.role === 'manager') {
      w.t += dt;
      if (w.lot.cash > 0 && w.t > 2.5) {
        w.t = 0; const amt = w.lot.cash; w.lot.cash = 0; gain(amt);
        addFloat(w.lot.cashPos.x, w.lot.cashPos.y - 30, '+$' + fmt(amt), '#ffe14d', 1, 15);
      }
    } else { w.moving = false; w.face = 1; }
  }
}

function updateHelper(b, dt) {
  const CAP = staffCap(), lot = b.lot;
  if (b.state === 'idle') {
    let best = null;
    for (const m of lot.machines) if (m.on && m.stock > 0 && (!best || m.stock > best.stock)) best = m;
    if (best && lot.shelf < SHELF_CAP) { b.target = best; b.state = 'toMachine'; b.t = 0; }
    else moveTo(b, b.home.x, b.home.y, b.speed, dt);
  } else if (b.state === 'toMachine') {
    if (moveTo(b, b.target.x + 4, b.target.y + 40, b.speed, dt)) {
      b.t += dt;
      if (b.t > 0.12 && b.target.stock > 0 && b.carry < CAP) {
        b.t = 0; b.target.stock--; b.carry++;
        fly('item', b.target.x, b.target.y + 24 - b.target.stock * ITEM_H[lot.type], b, itemFx(lot));
      }
      if (b.carry >= CAP || (b.target.stock === 0 && b.carry > 0)) b.state = 'toShelf';
      else if (b.target.stock === 0 && b.carry === 0) b.state = 'idle';
    }
  } else if (b.state === 'toShelf') {
    if (moveTo(b, lot.shelfPos.x + 22, lot.shelfPos.y, b.speed, dt)) {
      b.t += dt;
      if (b.t > 0.08 && b.carry > 0 && lot.shelf < SHELF_CAP) {
        b.t = 0; b.carry--; lot.shelf++;
        const sl = shelfSlot(lot, lot.shelf - 1);
        fly('item', b.x, b.y - 22 - b.carry * ITEM_H[lot.type], { x: sl.x, y: sl.y }, Object.assign(itemFx(lot), { lift: 0 }));
      }
      if (b.carry === 0) b.state = 'idle';
    }
  }
}

function updateCleaner(c, dt) {
  const lot = c.lot;
  if (c.state === 'idle') {
    const t = lot.tables.find(t => t.on && tableTrash(t) > 0 && !t.claimed);
    if (t && c.carry < staffCap() + 2) { t.claimed = true; c.target = t; c.state = 'toTable'; c.t = 0; }
    else if (c.carry > 0) { c.state = 'toBin'; c.t = 0; }
    else moveTo(c, c.home.x, c.home.y, c.speed, dt);
  } else if (c.state === 'toTable') {
    const t = c.target;
    if (tableTrash(t) === 0 || c.carry >= staffCap() + 2) { t.claimed = false; c.state = 'idle'; return; }
    const tx = t.x - lot.ox < 130 ? t.x - 44 : t.x + 44;
    if (moveTo(c, tx, t.y + 4, c.speed, dt)) {
      c.t += dt;
      if (c.t > 0.14) { c.t = 0; takeTrash(lot, t, c); }
    }
  } else if (c.state === 'toBin') {
    if (moveTo(c, lot.bin.x + 20, lot.bin.y + 4, c.speed, dt)) {
      c.t += dt;
      if (c.t > 0.08 && c.carry > 0) {
        c.t = 0; c.carry--; lot.binT = state.time; track('plate');
        fly('trash', c.x, c.y - 22 - c.carry * ITEM_H.trash, { x: lot.bin.x, y: lot.bin.y - 6 }, { lift: 18 });
      }
      if (c.carry === 0) c.state = 'idle';
    }
  }
}

function updateRunner(b, dt) {
  const lot = b.lot, cr = lot.crate;
  if (b.state === 'idle') {
    if (b.carry > 0 && lot.prizes < PRIZE_CAP) { b.state = 'toDrop'; b.t = 0; }
    else if (cr.stock > 0 && lot.prizes < PRIZE_CAP) { b.state = 'toCrate'; b.t = 0; }
    else moveTo(b, b.home.x, b.home.y, b.speed, dt);
  } else if (b.state === 'toCrate') {
    if (moveTo(b, cr.x + 26, cr.y + 6, b.speed, dt)) {
      b.t += dt;
      if (b.t > 0.12 && cr.stock > 0 && b.carry < staffCap()) { b.t = 0; cr.stock--; b.carry++; fly('item', cr.x, cr.y - 10, b, { item: 'plush', idx: b.carry - 1 }); }
      if (b.carry >= staffCap() || (cr.stock === 0 && b.carry > 0)) b.state = 'toDrop';
      else if (cr.stock === 0 && b.carry === 0) b.state = 'idle';
    }
  } else if (b.state === 'toDrop') {
    if (moveTo(b, lot.drop.x - 6, lot.drop.y + 12, b.speed, dt)) {
      b.t += dt;
      if (b.t > 0.08 && b.carry > 0 && lot.prizes < PRIZE_CAP) {
        b.t = 0; b.carry--; lot.prizes++;
        fly('item', b.x, b.y - 22 - b.carry * ITEM_H.plush, prizeSlot(lot, lot.prizes - 1), { item: 'plush', idx: lot.prizes - 1, lift: 0, boost: lot.boosted });
      }
      if (b.carry === 0 || lot.prizes >= PRIZE_CAP) b.state = 'idle';
    }
  }
}

function newVisitor(init) {
  const near = state.lots.filter(l => inView(l.ox - 150, l.ox + CELL_W + 150, l.oy - 150, l.oy + CELL_H + 150));
  const l = pick(near.length ? near : state.lots), dir = Math.random() < 0.5 ? 1 : -1, sp = rand(22, 42);
  const v = { shirt: pick(SHIRTS), skin: pick(SKINS), hair: pick(HAIRS), walk: rand(0, 6), moving: true, face: dir, lastDir: 'down', spriteIdx: Math.floor(Math.random() * CHAR_COUNT), balloon: Math.random() < 0.45 ? pick(BALLOONS) : null };
  if (Math.random() < 0.35) Object.assign(v, { x: l.ox + rand(412, 448), y: init ? l.oy + rand(0, CELL_H) : (dir > 0 ? state.camY - 30 : state.camY + state.viewH + 30), vx: 0, vy: dir * sp, face: 1, lastDir: dir > 0 ? 'down' : 'up' });
  else Object.assign(v, { x: init ? rand(state.camX, state.camX + state.viewW) : (dir > 0 ? state.camX - 30 : state.camX + state.viewW + 30), y: l.oy + rand(720, 752), vx: dir * sp, vy: 0, lastDir: dir > 0 ? 'right' : 'left' });
  return v;
}

function updateVisitors(dt) {
  const want = Math.min(18, Math.max(6, Math.round(state.viewW * state.viewH / 17000)));
  while (state.visitors.length < want) state.visitors.push(newVisitor(true));
  if (state.visitors.length > want) state.visitors.length = want;
  for (let i = 0; i < state.visitors.length; i++) {
    const v = state.visitors[i];
    v.x += v.vx * dt; v.y += v.vy * dt; v.walk += dt * 7;
    if (v.x < state.camX - 120 || v.x > state.camX + state.viewW + 120 || v.y < state.camY - 120 || v.y > state.camY + state.viewH + 120 || !cellAt(v.x, v.y)) state.visitors[i] = newVisitor(false);
  }
}

function updateFx(dt) {
  for (const f of state.floats) { f.t += dt; f.y -= 28 * dt; }
  state.floats = state.floats.filter(f => f.t < f.life);
  for (const f of state.flyers) f.t += dt;
  state.flyers = state.flyers.filter(f => f.t < f.dur);
  for (const c of state.confetti) { c.t += dt; c.x += c.vx * dt; c.y += c.vy * dt; c.vy += 420 * dt; c.vx *= 0.98; c.rot += c.vr * dt; }
  state.confetti = state.confetti.filter(c => c.t < 1.4);
}

/* ---------- tutorial ---------- */
export let D0;

const TUT_FNS = [
  () => ({ x: D0.machines[0].x, y: D0.machines[0].y + 36 }),
  () => D0.shelfPos,
  () => D0.reg,
  () => D0.cashPos,
  () => ({ x: D0.tables[0].x, y: D0.tables[0].y }),
  () => D0.bin,
  () => ({ x: D0.pads[0].x, y: D0.pads[0].y })
];
export const TUT = [
  ['Drag anywhere to walk to the fryer', TUT_FNS[0]],
  ['Stock the display case', TUT_FNS[1]],
  ['Stand at the register to serve', TUT_FNS[2]],
  ['Walk over the cash to collect it', TUT_FNS[3]],
  ['Clear the table when they finish eating', TUT_FNS[4]],
  ['Throw the trash in the bin', TUT_FNS[5]],
  ['Stand on the pad to buy another table', TUT_FNS[6]]
];

function updateTut() {
  if (S.tut === 0 && player.carry > 0 && player.carryType === D0.key) S.tut = 1;
  if (S.tut === 1 && D0.shelf > 0) S.tut = 2;
  if (S.tut === 2 && S.sales > 0) S.tut = 3;
  if (S.tut === 3 && D0.cash === 0 && S.money > 0) S.tut = 4;
  if (S.tut === 4 && player.carryType === 'trash') S.tut = 5;
  if (S.tut === 5 && S.trashed > 0) S.tut = 6;
  if (S.tut === 6 && S.unlocked[D0.pads[0].id]) S.tut = 7;
}

export const canAfford = p => S.money >= p.price - (S.paid[p.id] || 0);

export function currentHint() {
  if (S.tut === 4 && tableTrash(D0.tables[0]) > 0) return 'Pick up the trash from the table';
  if (S.tut < TUT.length) return TUT[S.tut][0];
  if (state.time - state.wrongT < 1.5) return state.wrongMsg;
  if (player.carry >= player.cap && player.carryType === 'trash') return 'Hands full. Find a trash bin';
  const lot = cellAt(player.x, player.y);
  if (lot && lot.open) {
    const c = lot.queue[0];
    if (lot.kind === 'food') {
      if (c && c.atFront && c.noSeat && !c.seat) {
        if (hasTrash(lot) && !hasStaff(lot, 'cleaner')) return 'No clean seats. Clear the tables';
        if (!hasTrash(lot) && lot.tables.some(t => !t.on)) return 'Every seat is taken. Buy more tables';
      }
      if (c && c.atFront && lot.shelf === 0 && player.carry === 0 && !hasStaff(lot, 'helper')) return 'Restock the ' + lot.def.plural;
      if (c && c.atFront && !c.noSeat && !lot.regStaffed && lot.shelf > 0) return 'Someone is at the register';
    } else if (lot.kind === 'game') {
      if (c && c.atFront && c.noPrize && !hasStaff(lot, 'runner')) return 'Out of prizes. Bring some from the crate';
      if (c && c.atFront && !c.noPrize && !lot.staffed) return 'Players waiting. Stand by the booth';
    } else if (lot.kind === 'ride' && c && c.atFront && !lot.staffed && lot.ride.phase === 'idle') return 'Riders waiting. Stand at the booth';
  }
  const ready = state.lots.some(l => !l.open && canAfford(l.openPad) && !inView(l.openPad.x - 30, l.openPad.x + 30, l.openPad.y - 30, l.openPad.y + 30));
  if (ready) return 'You can open a new plot. Follow the arrow';
  return '';
}

/* ---------- sound ---------- */
let AC = null, master = null;
function audio() {
  if (!S.sound) return null;
  if (!AC) {
    try { AC = new (window.AudioContext || window.webkitAudioContext)(); master = AC.createGain(); master.gain.value = 0.5; master.connect(AC.destination); }
    catch (e) { return null; }
  }
  if (AC.state === 'suspended') AC.resume();
  return AC;
}

export function initAudio() {
  window.addEventListener('pointerdown', () => audio());
  window.addEventListener('keydown', () => audio());
}

const lastSfx = {};
export function sfx(name, gap) {
  const ac = audio();
  if (!ac || !SFX_DEF[name]) return;
  const now = performance.now();
  if (now - (lastSfx[name] || 0) < (gap || 50)) return;
  lastSfx[name] = now;
  const t0 = ac.currentTime;
  for (const [f, d, type, v, slide, delay] of SFX_DEF[name]) {
    const o = ac.createOscillator(), g = ac.createGain(), t = t0 + (delay || 0);
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + d + 0.03);
  }
}

export const nearPlayer = (x, y) => dist(player.x, player.y, x, y) < 420;

function onSale(lot) { addXP(1); if (nearPlayer(lot.ox + 200, lot.oy + 400)) sfx('sale', 180); }

/* ---------- fair level ---------- */
export function fairTitle(l) { const i = Math.floor((l - 1) / 3); return i < TITLES.length ? TITLES[i] : TITLES[TITLES.length - 1] + ' ' + roman(i - TITLES.length + 2); }
export const xpNeed = l => Math.round(40 * Math.pow(1.3, l - 1));
export function gMult() { return (1 + 0.5 * (S.town || 0)) * (1 + 0.03 * ((S.level || 1) - 1)); }
export const multText = () => '×' + gMult().toFixed(2).replace(/\.?0+$/, '');

let questsDirty = true;
export function setQuestsDirty() { questsDirty = true; }
export function getQuestsDirty() { return questsDirty; }
export function clearQuestsDirty() { questsDirty = false; }

function addXP(n) {
  S.xp += n;
  let up = false;
  while (S.xp >= xpNeed(S.level)) { S.xp -= xpNeed(S.level); S.level++; up = true; }
  if (up) {
    for (const l of state.lots) recompute(l);
    sfx('level'); buzz(40);
    addFloat(player.x, player.y - 92, 'Level ' + S.level + ': ' + fairTitle(S.level), '#ffe14d', 2.2, 17);
    addFloat(player.x, player.y - 72, 'Everything earns 3% more', '#ffffff', 2.2, 13);
    questsDirty = true;
  }
}

/* ---------- stars + album ---------- */
export function lotStars(lot) {
  if (lot.kind === 'hr') return hrOpen() ? 5 : 1;
  const bought = lot.pads.filter(p => S.unlocked[p.id]).length;
  return 1 + Math.floor(4 * bought / Math.max(1, lot.pads.length));
}

export const ALL_TYPES = [].concat(
  FOOD_ORDER.map(t => ['food', t, FOODS[t]]), GAME_ORDER.map(t => ['game', t, GAMES[t]]), RIDE_ORDER.map(t => ['ride', t, RIDES[t]]));

export function discover(lot, fresh) {
  if (lot.kind === 'hr') return;
  const k = lot.kind + ':' + lot.type;
  if (S.album[k]) return;
  S.album[k] = true;
  if (fresh) { S.coins += 3; addFloat(lot.ox + 200, lot.oy + 330, 'New in your album! +3 coins', '#ffe14d', 2, 15); sfx('coin'); }
}

function afterUnlock(lot, p, fresh) {
  const st = lotStars(lot);
  if (fresh) {
    sfx(p.kind === 'open' ? 'open' : 'buy');
    if (p.kind === 'open') { track('open'); addXP(25); discover(lot, true); }
    else { track('build'); addXP(5); }
    if (lot.starsShown && st > lot.starsShown) {
      addXP(10 * (st - lot.starsShown));
      addFloat(lot.ox + 200, lot.oy + 40, lot.name + ' is now ' + st + ' stars!', '#ffe14d', 2, 16);
      sfx('level');
    }
  } else if (p.kind === 'open') discover(lot, false);
  if (fresh && p.kind === 'open' && lot.kind === 'hr') addFloat(lot.ox + 200, lot.oy + 350, 'HR office open! Hire and train staff', '#ffe14d', 2.4, 14);
  if (fresh && p.kind === 'hrauth') { const tgt = lotByKey(p.target); if (tgt) addFloat(tgt.ox + 200, tgt.oy + 350, 'Staff hiring unlocked!', '#7ec8e3', 2, 14); }
  if (p.stat === 'hrspeed') for (const w of state.staff) w.speed = (w.base || 90) * staffMult();
  lot.starsShown = st;
}

/* ---------- quests ---------- */
const hasKind = k => state.lots.some(l => l.open && l.kind === k);
export const QDEF = {
  food:   { icon: 'F', text: n => 'Sell ' + fmt(n) + ' food items', n: () => 10 + 4 * state.nOpen },
  ticket: { icon: 'T', text: n => 'Sell ' + fmt(n) + ' ride tickets', n: () => 10 + 3 * state.nOpen, need: () => hasKind('ride') },
  play:   { icon: 'G', text: n => 'Sell ' + fmt(n) + ' games', n: () => 8 + 2 * state.nOpen, need: () => hasKind('game') },
  prize:  { icon: 'P', text: n => 'Give out ' + fmt(n) + ' prizes', n: () => 4 + state.nOpen, need: () => hasKind('game') },
  plate:  { icon: 'X', text: n => 'Throw out ' + fmt(n) + ' plates', n: () => 8 + 2 * state.nOpen },
  stock:  { icon: 'S', text: n => 'Restock ' + fmt(n) + ' items yourself', n: () => 12 + 2 * state.nOpen },
  cash:   { icon: '$', text: n => 'Earn $' + fmt(n), n: () => nice(earnRate() * 150 + 40) },
  build:  { icon: 'B', text: n => 'Buy ' + n + ' upgrade' + (n > 1 ? 's' : ''), n: () => state.nOpen > 3 ? 3 : 2 },
  open:   { icon: 'M', text: () => 'Open a new plot', n: () => 1, need: () => state.lots.some(l => !l.open && l.openPad.price <= S.money + earnRate() * 600) }
};

function newQuest() {
  const active = S.quests.map(q => q.type);
  const pool = Object.keys(QDEF).filter(k => !active.includes(k) && (!QDEF[k].need || QDEF[k].need()));
  const type = pick(pool.length ? pool : ['food']);
  const bonus = (S.qDone + S.quests.length + 1) % 5 === 0;
  return { type, n: QDEF[type].n(), prog: 0, cash: nice(earnRate() * 120 + 20), coins: bonus ? 3 : 1 };
}

export function fillQuests() { while (S.quests.length < 3) S.quests.push(newQuest()); questsDirty = true; }

export function track(type, n) {
  for (const q of S.quests) {
    if (q.type !== type || q.prog >= q.n) continue;
    q.prog = Math.min(q.n, q.prog + (n || 1));
    if (q.prog >= q.n) { sfx('quest'); buzz(20); }
    questsDirty = true;
  }
}

export function claimQuest(i) {
  const q = S.quests[i];
  if (!q || q.prog < q.n) return;
  gain(q.cash); S.coins += q.coins; S.qDone++;
  addFloat(player.x, player.y - 70, '+$' + fmt(q.cash) + '  +' + q.coins + ' coin' + (q.coins > 1 ? 's' : ''), '#ffe14d', 1.6, 16);
  sfx('coin'); addXP(15);
  S.quests.splice(i, 1, newQuest());
  questsDirty = true; save();
}

/* ---------- daily ---------- */
const dayStr = d => d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
export const todayStr = () => dayStr(new Date());
export function yesterdayStr() { const d = new Date(); d.setDate(d.getDate() - 1); return dayStr(d); }
export const dailyReady = () => S.lastDaily !== todayStr();
export const dailyNext = () => S.lastDaily === yesterdayStr() ? (S.streak % 7) + 1 : 1;

/* ---------- coins / economy ---------- */
export function earnRate() {
  let r = 0;
  for (const l of state.lots) {
    if (!l.open || l.kind === 'hr') continue;
    if (l.kind === 'food') r += Math.min(l.machines.filter(m => m.on).length / l.fry, l.tables.filter(t => t.on).length * 4 / 11) * l.price;
    else if (l.kind === 'ride') r += l.cap * l.ticket / (l.cycle + 2.5);
    else r += l.stations.filter(s => s.on).length / (l.playT + 3) * l.price;
  }
  return Math.max(0.4, r * 0.6);
}

export function coinCost(p) {
  const left = Math.max(0, p.price - (S.paid[p.id] || 0));
  return Math.max(1, Math.ceil(left / 100));
}

export function offlineRate() {
  let r = 0;
  for (const l of state.lots) {
    if (!l.open || l.kind === 'hr') continue;
    if (l.kind === 'food') {
      if (hasStaff(l, 'helper') && hasStaff(l, 'cashier') && hasStaff(l, 'cleaner')) {
        const seats = l.tables.filter(t => t.on).length * 2;
        r += Math.min(l.machines.filter(m => m.on).length / l.fry, seats * 2 / 11) * l.price * 0.6;
      }
    } else if (l.kind === 'ride') { if (hasStaff(l, 'operator')) r += l.cap * l.ticket / (l.cycle + 2.5) * 0.7; }
    else if (hasStaff(l, 'barker') && hasStaff(l, 'runner')) r += l.stations.filter(s => s.on).length / (l.playT + 3) * l.price * 0.7;
  }
  return r;
}

export const townName = () => TOWNS[(S.town || 0) % TOWNS.length] + ((S.town || 0) >= TOWNS.length ? ' ' + roman(Math.floor(S.town / TOWNS.length) + 1) : '');
export const townNeed = () => 8 + 2 * (S.town || 0);

/* ---------- save / load ---------- */
let bumpMoney = () => {};
export function setBumpMoney(fn) { bumpMoney = fn; }

function buildSaveData() {
  const open = state.lots.filter(l => l.open);
  return {
    money: S.money, coins: S.coins, town: S.town, level: S.level, xp: S.xp, album: S.album, quests: S.quests, qDone: S.qDone, streak: S.streak, lastDaily: S.lastDaily, sound: S.sound, vibe: S.vibe, qOpen: S.qOpen, paid: S.paid, unlocked: Object.keys(S.unlocked).filter(id => !/:open$/.test(id)), levels: S.levels, tut: S.tut, sales: S.sales, trashed: S.trashed,
    carry: player.carry, carryType: player.carryType, px: Math.round(player.x), py: Math.round(player.y), lastSeen: Date.now(),
    opened: open.map(l => [l.cx, l.cy, l.rank]),
    lots: Object.fromEntries(open.map(l => [l.key, { cash: l.cash, shelf: l.shelf || 0, prizes: l.prizes || 0, stock: l.machines ? l.machines.map(m => m.stock) : [], crate: l.crate ? l.crate.stock : 0 }]))
  };
}

export function save() {
  if (state.noSave) return;
  const data = buildSaveData();
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
  cloudSave(data);
}

function applySaveData(d, offerAwayFn) {
  if (!d) return;
  S.money = num(d.money); S.coins = d.coins == null ? 10 : num(d.coins);
  S.town = num(d.town); S.level = Math.max(1, num(d.level)); S.xp = num(d.xp);
  S.album = d.album && typeof d.album === 'object' ? d.album : {};
  S.quests = Array.isArray(d.quests) ? d.quests.filter(q => q && QDEF[q.type]).slice(0, 3).map(q => ({ type: q.type, n: Math.max(1, num(q.n)), prog: num(q.prog), cash: num(q.cash), coins: Math.max(1, num(q.coins)) })) : [];
  S.qDone = num(d.qDone); S.streak = num(d.streak) % 8; S.lastDaily = typeof d.lastDaily === 'string' ? d.lastDaily : '';
  S.sound = d.sound !== false; S.vibe = d.vibe !== false; S.qOpen = d.qOpen !== false; S.tut = num(d.tut); S.sales = num(d.sales); S.trashed = num(d.trashed);
  S.levels = {}; for (const k in (d.levels || {})) S.levels[k] = num(d.levels[k]);
  S.paid = {}; for (const k in (d.paid || {})) S.paid[k] = num(d.paid[k]);
  const opened = (d.opened || []).filter(o => Array.isArray(o)).sort((a, b) => a[2] - b[2]);
  for (const [x, y, rank] of opened) {
    if (x === 0 && y === 0) continue;
    const lot = genCell(x | 0, y | 0);
    openLot(lot, num(rank), false);
  }
  for (const id of d.unlocked || []) {
    const lot = lotByKey(id.split(':')[0]);
    if (!lot || !lot.open) continue;
    const p = lot.pads.find(q => q.id === id);
    if (p) applyUnlock(p, false);
  }
  for (const l of state.lots) recompute(l);
  for (const k in (d.lots || {})) {
    const l = lotByKey(k), ld = d.lots[k];
    if (!l || !l.open || !ld) continue;
    l.cash = num(ld.cash);
    if (l.kind === 'food') { l.shelf = clamp(num(ld.shelf), 0, SHELF_CAP); (ld.stock || []).forEach((v, j) => { if (l.machines[j]) l.machines[j].stock = clamp(num(v), 0, MACH_CAP); }); }
    if (l.kind === 'game') { l.prizes = clamp(num(ld.prizes), 0, PRIZE_CAP); l.crate.stock = clamp(num(ld.crate), 0, CRATE_CAP); }
  }
  if (d.carryType === 'trash' || d.carryType === 'prize' || (lotByKey(d.carryType) && lotByKey(d.carryType).kind === 'food')) { player.carryType = d.carryType; player.carry = clamp(num(d.carry), 0, player.cap); }
  if (Number.isFinite(d.px) && Number.isFinite(d.py) && walkable(d.px, d.py, player.r)) { player.x = d.px; player.y = d.py; ejectPlayer(); }
  if (d.lastSeen && offerAwayFn) offerAwayFn((Date.now() - Number(d.lastSeen)) / 1000);
}

export function load(offerAwayFn) {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) applySaveData(JSON.parse(raw), offerAwayFn);
  } catch (e) {}
}

export async function loadFromCloud(offerAwayFn) {
  const user = await ensureAuth();
  if (!user) return;
  const cloud = await cloudLoad();
  if (!cloud) return;
  const localRaw = localStorage.getItem(KEY);
  const local = localRaw ? JSON.parse(localRaw) : null;
  if (!local || (cloud.lastSeen && (!local.lastSeen || cloud.lastSeen > local.lastSeen))) {
    applySaveData(cloud, offerAwayFn);
    try { localStorage.setItem(KEY, JSON.stringify(cloud)); } catch (e) {}
  }
}

/* ---------- init ---------- */
export function initGame() {
  try { const pre = JSON.parse(localStorage.getItem(KEY) || 'null'); if (pre) S.town = num(pre.town); } catch (e) {}
  D0 = genCell(0, 0);
  openLot(D0, 0, false);
  D0.machines[0].stock = 3;
}

/* ---------- update ---------- */
export function update(dt, anyOverlayFn, openDailyFn) {
  state.time += dt;
  const paused = anyOverlayFn();
  if (!paused && state.dailyPending && S.tut >= TUT.length) { state.dailyPending = false; if (dailyReady()) openDailyFn(); }
  if (!paused) {
    updatePlayer(dt);
    for (const l of state.lots) {
      if (!l.open || l.kind === 'hr') continue;
      updateSpawn(l, dt);
      updateCustomers(l, dt);
      if (l.kind === 'food') { updateMachines(l, dt); updateServe(l, dt); }
      else if (l.kind === 'ride') updateRide(l, dt);
      else updateGame(l, dt);
    }
    updateStaffItem(dt);
    updateTut();
    state.saveT += dt; if (state.saveT > 4) { state.saveT = 0; save(); }
  }
  updateVisitors(dt);
  updateFx(dt);
  updateCamera(dt, false);
}
