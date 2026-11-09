import { PACKS, DAILY, KEY, OLD_KEYS, FONT } from './config.js';
import { fmt, roman } from './helpers.js';
import { S, player, state, cellAt, lotByKey, joy } from './state.js';
import {
  currentHint, visiblePads, hrOpen, hrFor, coinCost, earnRate, offlineRate,
  applyUnlock, save, sfx, buzz, gain, addFloat, burst, wrong,
  fairTitle, xpNeed, multText, townName, townNeed,
  claimQuest, fillQuests, QDEF, ALL_TYPES,
  dailyReady, dailyNext, todayStr, yesterdayStr, setBumpMoney,
  lotStars, discover, setQuestsDirty, getQuestsDirty, clearQuestsDirty
} from './game.js';
import { rand } from './helpers.js';
import { signInWithGoogle, signInWithApple, isSignedIn, getUser, cloudSave } from './firebase.js';

const moneyEl = document.getElementById('money');
const moneyBox = document.getElementById('moneyBox');
const priceEl = document.getElementById('price');
const hintEl = document.getElementById('hint');
let shownMoney = -1, shownPrice = null, shownHint = null, popT = 0;

function bumpMoney() { moneyBox.classList.add('pop'); popT = 0.12; }
setBumpMoney(bumpMoney);

const coinsEl = document.getElementById('coins'), coinsBtn = document.getElementById('coinsBtn');
const finishBtn = document.getElementById('finishBtn'), finishCostEl = document.getElementById('finishCost');
const trashBtn = document.getElementById('trashBtn'), trashCostEl = document.getElementById('trashCost');
const shopEl = document.getElementById('shop'), shopMsg = document.getElementById('shopMsg'), shopLead = document.getElementById('shopLead');
let shownCoins = -1, shownFinish = null, shownTrash = null, coinPopT = 0;

function showOverlay(el) {
  el.hidden = false; joy.on = false;
  const b = el.querySelector('button'); if (b) b.focus();
}

function updateCoinsHud(dt) {
  if (S.coins !== shownCoins) {
    if (shownCoins >= 0) { coinsBtn.classList.add('pop'); coinPopT = 0.15; }
    shownCoins = S.coins; coinsEl.textContent = fmt(S.coins);
  }
  if (coinPopT > 0) { coinPopT -= dt; if (coinPopT <= 0) coinsBtn.classList.remove('pop'); }
  let f = '';
  const curPad = state.curPad;
  const staffBlocked = curPad && curPad.kind === 'staff' && (!hrOpen() || !hrFor(lotByKey(curPad.key)));
  if (curPad && !staffBlocked && player.padStayT >= 0.5 && S.money < curPad.price - (S.paid[curPad.id] || 0)) f = curPad.id + '|' + coinCost(curPad);
  if (f !== shownFinish) { shownFinish = f; finishBtn.hidden = !f; if (f) finishCostEl.textContent = fmt(+f.split('|')[1]); }
  const tc = player.carry > 0 ? player.carry : 0;
  if (tc !== shownTrash) { shownTrash = tc; trashBtn.hidden = tc === 0; trashCostEl.textContent = tc; }
}

finishBtn.addEventListener('click', () => {
  const p = state.curPad;
  if (!p || (p.kind === 'staff' && (!hrOpen() || !hrFor(lotByKey(p.key))))) return;
  const cost = coinCost(p);
  if (S.coins < cost) { openShop('You need ' + fmt(cost) + ' coins to finish this. Get more below.'); return; }
  S.coins -= cost; S.paid[p.id] = p.price; sfx('coin');
  state.curPad = null; shownFinish = null; finishBtn.hidden = true;
  applyUnlock(p, true);
  addFloat(player.x, player.y - 64, '-' + fmt(cost) + ' coins', '#ffe14d', 1.3, 15);
  save();
});

trashBtn.addEventListener('click', () => {
  if (player.carry <= 0) return;
  const cost = player.carry;
  if (S.money < cost) { wrong("Not enough money to trash (costs $1 each)"); return; }
  S.money -= cost;
  addFloat(player.x, player.y - 56, '-$' + cost, '#ff6f6f', 1.2, 16);
  sfx('trash'); buzz(20);
  for (let i = 0; i < player.carry; i++) {
    state.confetti.push({ x: player.x + rand(-10, 10), y: player.y - 30 + rand(-10, 10), vx: rand(-60, 60), vy: rand(-80, -20), rot: rand(0, 6), vr: rand(-8, 8), c: '#8a95a3', t: 0 });
  }
  player.carry = 0; player.carryType = null;
  shownTrash = 0; trashBtn.hidden = true;
  save();
});

function renderPacks() {
  const base = PACKS[0].coins / parseFloat(PACKS[0].price.slice(1));
  document.getElementById('packs').innerHTML = PACKS.map((p, i) => {
    const bonus = Math.round((p.coins / parseFloat(p.price.slice(1)) / base - 1) * 100);
    const tag = [p.tag, bonus > 0 ? '+' + bonus + '% bonus' : ''].filter(Boolean).join(' · ');
    return '<button class="pack" data-i="' + i + '"><span><span class="amt">' + p.coins.toLocaleString('en-US') + ' coins</span>' +
      (tag ? '<span class="tag">' + tag + '</span>' : '') + '</span><span class="cost">' + p.price + '</span></button>';
  }).join('');
}
renderPacks();

document.getElementById('packs').addEventListener('click', e => {
  const b = e.target.closest('.pack');
  if (b) buyPack(PACKS[+b.dataset.i]);
});

function buyPack(pack) {
  S.coins += pack.coins; save(); sfx('coin');
  shopMsg.textContent = 'Added ' + pack.coins.toLocaleString('en-US') + ' coins.';
}

function openShop(lead) {
  shopLead.textContent = lead || 'Use coins to finish any upgrade or new plot instantly.';
  shopMsg.textContent = '';
  showOverlay(shopEl);
}
coinsBtn.addEventListener('click', () => openShop());
document.getElementById('closeShop').addEventListener('click', () => { shopEl.hidden = true; });

/* ---------- offline earnings ---------- */
const awayEl = document.getElementById('away');
let pendingAway = 0;

export function offerAway(seconds) {
  if (seconds < 60) return;
  const amt = Math.floor(offlineRate() * Math.min(seconds, 7200) * 0.25);
  if (amt < 1) return;
  pendingAway += amt;
  const mins = Math.round(Math.min(seconds, 7200) / 60);
  document.getElementById('awayText').textContent = 'Your staff kept the midway running for ' + (mins >= 120 ? '2 hours (the most they will cover)' : mins + (mins === 1 ? ' minute' : ' minutes')) + '.';
  document.getElementById('awayAmt').textContent = '$' + fmt(pendingAway);
  showOverlay(awayEl);
}

document.getElementById('collectAway').addEventListener('click', () => {
  if (pendingAway > 0) { gain(pendingAway); addFloat(player.x, player.y - 60, '+$' + fmt(pendingAway), '#ffe14d', 1.6, 18); pendingAway = 0; }
  awayEl.hidden = true; save();
});

/* ---------- menus ---------- */
const menuEl = document.getElementById('menu');
const resetBtn = document.getElementById('resetBtn');
let resetArmed = false;

document.getElementById('menuBtn').addEventListener('click', () => {
  resetArmed = false; resetBtn.textContent = 'Reset progress';
  const open = state.lots.filter(l => l.open && l.kind !== 'hr'), n = k => open.filter(l => l.kind === k).length;
  const plural = (v, w) => v + ' ' + w + (v === 1 ? '' : 's');
  refreshMenu();
  document.getElementById('stats').textContent = townName() + ' · earnings ' + multText() + '. ' + plural(n('food'), 'stand') + ', ' + plural(n('game'), 'game') + ' and ' + plural(n('ride'), 'ride') + ' open. ' + fmt(S.sales) + ' sales so far.';
  showOverlay(menuEl);
});
document.getElementById('closeMenu').addEventListener('click', () => { menuEl.hidden = true; });

resetBtn.addEventListener('click', () => {
  if (!resetArmed) { resetArmed = true; resetBtn.textContent = 'Tap again to erase everything'; return; }
  try { [KEY].concat(OLD_KEYS).forEach(k => localStorage.removeItem(k)); } catch (e) {}
  state.noSave = true;
  location.reload();
});

window.addEventListener('keydown', e => { if (e.key === 'Escape') { menuEl.hidden = true; shopEl.hidden = true; albumEl.hidden = true; townEl.hidden = true; dailyEl.hidden = true; } });

/* ---------- quests HUD ---------- */
const questListEl = document.getElementById('questList'), lvlBtn = document.getElementById('lvlBtn');
let shownLvl = '', qT = 0;

function updateQuestsHud(dt) {
  const lv = fairTitle(S.level) + ' · Lv ' + S.level + '|' + Math.floor(S.xp / xpNeed(S.level) * 100);
  if (lv !== shownLvl) {
    shownLvl = lv;
    document.getElementById('lvlName').textContent = fairTitle(S.level) + ' · Lv ' + S.level;
    document.getElementById('xpFill').style.width = Math.min(100, S.xp / xpNeed(S.level) * 100) + '%';
  }
  qT -= dt;
  if (!getQuestsDirty() || qT > 0) return;
  clearQuestsDirty(); qT = 0.25;
  questListEl.hidden = !S.qOpen;
  lvlBtn.setAttribute('aria-expanded', S.qOpen ? 'true' : 'false');
  questListEl.innerHTML = S.quests.map((q, i) => {
    const d = QDEF[q.type] || QDEF.food, done = q.prog >= q.n;
    if (done) return '<button class="q done" data-i="' + i + '"><span class="qi">' + d.icon + '</span><span class="qt">Claim $' + fmt(q.cash) + ' + ' + q.coins + 'c</span><span class="qp">✓</span></button>';
    return '<button class="q" data-i="' + i + '" tabindex="-1"><span class="qi">' + d.icon + '</span><span class="qt">' + d.text(q.n) + '</span><span class="qp">' + fmt(q.prog) + '/' + fmt(q.n) +
      '</span><span class="qb"><i style="width:' + Math.floor(q.prog / q.n * 100) + '%"></i></span></button>';
  }).join('');
}

questListEl.addEventListener('click', e => { const b = e.target.closest('.q.done'); if (b) claimQuest(+b.dataset.i); });
lvlBtn.addEventListener('click', () => { S.qOpen = !S.qOpen; setQuestsDirty(); qT = 0; });

/* ---------- daily streak ---------- */
const dailyEl = document.getElementById('daily'), claimDailyBtn = document.getElementById('claimDaily');

function renderDaily() {
  const ready = dailyReady(), next = ready ? dailyNext() : 0;
  document.getElementById('days').innerHTML = DAILY.map((c, i) => {
    const day = i + 1, got = ready ? day < next : day <= S.streak, today = ready && day === next;
    return '<div class="day' + (got ? ' got' : '') + (today ? ' today' : '') + (day === 7 ? ' wide' : '') + '"><span>Day ' + day + '</span><b>' + (got ? '✓' : c + 'c') + '</b></div>';
  }).join('');
  claimDailyBtn.disabled = !ready;
  claimDailyBtn.textContent = ready ? 'Claim ' + DAILY[next - 1] + ' coins' : 'Come back tomorrow';
}

export function openDaily() { renderDaily(); showOverlay(dailyEl); }

claimDailyBtn.addEventListener('click', () => {
  if (!dailyReady()) return;
  const day = dailyNext();
  S.streak = day; S.lastDaily = todayStr(); S.coins += DAILY[day - 1];
  sfx('coin'); buzz(30); save(); renderDaily();
});
document.getElementById('closeDaily').addEventListener('click', () => { dailyEl.hidden = true; });

/* ---------- album ---------- */
const albumEl = document.getElementById('album');

function openAlbum() {
  const n = ALL_TYPES.filter(([k, t]) => S.album[k + ':' + t]).length;
  document.getElementById('albumText').textContent = n + ' of ' + ALL_TYPES.length + ' found. Each new one gives 3 coins.';
  document.getElementById('albumGrid').innerHTML = ALL_TYPES.map(([k, t, d]) => {
    const got = S.album[k + ':' + t];
    return '<div class="tile' + (got ? '' : ' locked') + '"><span class="ic">' + (got ? d.name.charAt(0) : '?') + '</span>' + (got ? d.name : '???') + '</div>';
  }).join('');
  showOverlay(albumEl);
}
document.getElementById('closeAlbum').addEventListener('click', () => { albumEl.hidden = true; });

/* ---------- new town ---------- */
const townEl = document.getElementById('town'), townGo = document.getElementById('townGo');
let townArmed = false;

function openTown() {
  const left = townNeed() - state.nOpen, nextMult = ((1 + 0.5 * (S.town + 1)) * (1 + 0.03 * (S.level - 1))).toFixed(2).replace(/\.?0+$/, '');
  townArmed = false;
  if (left > 0) {
    document.getElementById('townText').textContent = 'Open ' + left + ' more plot' + (left > 1 ? 's' : '') + ' in ' + townName() + ' first. Moving starts your midway over in a new town, and everything earns ×' + nextMult + ' forever.';
    townGo.disabled = true; townGo.textContent = 'Not ready yet';
  } else {
    const nt = TOWNS_UI[(S.town + 1) % TOWNS_UI.length];
    document.getElementById('townText').textContent = 'Your midway starts over in ' + nt + ' with a new map. You keep your coins, album, fair level and daily streak, and everything earns ×' + nextMult + ' forever.';
    townGo.disabled = false; townGo.textContent = 'Pack up the fair';
  }
  showOverlay(townEl);
}

import { TOWNS } from './config.js';
const TOWNS_UI = TOWNS;

townGo.addEventListener('click', () => {
  if (townNeed() > state.nOpen) return;
  if (!townArmed) { townArmed = true; townGo.textContent = 'Tap again to move'; return; }
  const keep = { coins: S.coins, town: S.town + 1, level: S.level, xp: S.xp, album: S.album, streak: S.streak, lastDaily: S.lastDaily,
    sound: S.sound, vibe: S.vibe, qOpen: S.qOpen, qDone: S.qDone, tut: 7, sales: S.sales, trashed: S.trashed, lastSeen: Date.now() };
  try { localStorage.setItem(KEY, JSON.stringify(keep)); } catch (e) {}
  cloudSave(keep);
  state.noSave = true;
  location.reload();
});
document.getElementById('townCancel').addEventListener('click', () => { townEl.hidden = true; });

/* ---------- menu extras ---------- */
function refreshMenu() {
  const n = ALL_TYPES.filter(([k, t]) => S.album[k + ':' + t]).length;
  document.getElementById('albumBtn').textContent = 'Album ' + n + '/' + ALL_TYPES.length;
  document.getElementById('dailyBtn').textContent = dailyReady() ? 'Daily reward ●' : 'Daily reward';
  document.getElementById('townBtn').textContent = state.nOpen >= townNeed() ? 'Move to a new town' : 'New town (' + state.nOpen + '/' + townNeed() + ' plots)';
  document.getElementById('soundBtn').textContent = 'Sound: ' + (S.sound ? 'On' : 'Off');
  document.getElementById('vibeBtn').textContent = 'Vibration: ' + (S.vibe ? 'On' : 'Off');
  const signGoogle = document.getElementById('signInBtn');
  const signApple = document.getElementById('signInApple');
  const accountEl = document.getElementById('accountStatus');
  if (isSignedIn()) {
    const u = getUser();
    accountEl.textContent = u.displayName || u.email || 'Signed in';
    accountEl.hidden = false;
    signGoogle.hidden = true;
    signApple.hidden = true;
  } else {
    accountEl.hidden = true;
    signGoogle.hidden = false;
    signApple.hidden = false;
  }
}

document.getElementById('signInBtn').addEventListener('click', async () => {
  const user = await signInWithGoogle();
  if (user) { save(); refreshMenu(); }
});

document.getElementById('signInApple').addEventListener('click', async () => {
  const user = await signInWithApple();
  if (user) { save(); refreshMenu(); }
});

document.getElementById('albumBtn').addEventListener('click', () => { menuEl.hidden = true; openAlbum(); });
document.getElementById('dailyBtn').addEventListener('click', () => { menuEl.hidden = true; openDaily(); });
document.getElementById('townBtn').addEventListener('click', () => { menuEl.hidden = true; openTown(); });
document.getElementById('soundBtn').addEventListener('click', () => { S.sound = !S.sound; refreshMenu(); save(); });
document.getElementById('vibeBtn').addEventListener('click', () => { S.vibe = !S.vibe; refreshMenu(); save(); });

const OVERLAYS = [...document.querySelectorAll('.overlay')];
export const anyOverlay = () => OVERLAYS.some(el => !el.hidden);

/* ---------- visibility ---------- */
let hiddenAt = 0;
export function setupVisibility(lastRef) {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { save(); hiddenAt = Date.now(); }
    else { if (hiddenAt) offerAway((Date.now() - hiddenAt) / 1000); hiddenAt = 0; lastRef.v = performance.now(); state.dailyPending = dailyReady(); }
  });
  window.addEventListener('pagehide', save);
}

/* ---------- updateHud ---------- */
export function updateHud(dt) {
  if (S.money !== shownMoney) { shownMoney = S.money; moneyEl.textContent = fmt(S.money); }
  const lot = cellAt(player.x, player.y);
  let pt = '';
  if (lot && lot.open) {
    if (lot.kind === 'hr') pt = 'HR Office';
    else if (lot.kind === 'food') pt = '$' + fmt(lot.price) + (/^[aeiou]/.test(lot.def.unit) ? ' an ' : ' a ') + lot.def.unit;
    else if (lot.kind === 'ride') pt = '$' + fmt(lot.ticket) + ' a ticket';
    else pt = '$' + fmt(lot.price) + ' a game';
  } else if (lot) pt = lot.name + ': $' + fmt(lot.openPad.price);
  if (pt !== shownPrice) { shownPrice = pt; priceEl.textContent = pt; priceEl.hidden = !pt; }
  const h = currentHint();
  if (h !== shownHint) { shownHint = h; hintEl.textContent = h; hintEl.hidden = !h; }
  if (popT > 0) { popT -= dt; if (popT <= 0) moneyBox.classList.remove('pop'); }
  updateCoinsHud(dt);
  updateQuestsHud(dt);
}
