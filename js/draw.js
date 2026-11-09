import {
  CELL_W, CELL_H, ITEM_H, EAT_T, MACH_CAP, CRATE_CAP,
  BRIGHT, PLUSH, FONT, CHAR_DEFS
} from './config.js';
import { clamp, lerp, fmt } from './helpers.js';
import {
  getCtx, S, player, cells, sprites, state, joy,
  ck, lotByKey, inView, hash,
  playerImg, chefImg, staffImg
} from './state.js';
import { rr, ell, txt, fitText, starPath } from './sprites.js';
import {
  tableTrash, TUT, canAfford, JOY_R, visiblePads,
  hrOpen, hrFor
} from './game.js';

let ctx;

const tallItem = it => it === 'lemon' || it === 'candy' || it === 'popcorn' || it === 'icecream';

export function drawIcon(key, x, y, size) {
  ctx = getCtx();
  const sp = sprites['icon:' + key + ':' + size];
  if (sp) { ctx.drawImage(sp, x - sp._ox, y - sp._oy); return; }
  _drawIconProc(key, x, y, size);
}
export function _drawIconProc(key, x, y, size) {
  ctx = getCtx();
  const s = size / 18, r = 7 * s;
  ctx.save(); ctx.translate(x, y);
  switch (key) {
    case 'donut': drawDonut(0, 0, s * 1.6, false); break;
    case 'lemon': ctx.fillStyle = '#ffd23f'; ell(0, 0, r, r); ctx.fill(); ctx.fillStyle = '#fff7c2'; ell(-1*s, -1*s, r*0.5, r*0.5); ctx.fill(); break;
    case 'corndog': drawCorndog(0, 0, s * 1.4, false); break;
    case 'candy': ctx.fillStyle = '#ff9cd2'; ell(-2*s, 0, r*0.7, r*0.7); ctx.fill(); ctx.fillStyle = '#8fd8ff'; ell(2*s, 0, r*0.7, r*0.7); ctx.fill(); ctx.fillStyle = '#9b5cff'; ctx.fillRect(-1*s, r*0.5, 2*s, 3*s); break;
    case 'popcorn': ctx.fillStyle = '#ffffff'; rr(-r, -r*0.5, r*2, r*1.8, 2*s); ctx.fill(); ctx.fillStyle = '#e63946'; ctx.fillRect(-r*0.7, -r*0.5, r*0.5, r*1.8); ctx.fillRect(r*0.2, -r*0.5, r*0.5, r*1.8); ctx.fillStyle = '#fffaf0'; ell(-2*s, -r, 3*s, 3*s); ctx.fill(); ell(2*s, -r, 3*s, 3*s); ctx.fill(); break;
    case 'pretzel': drawPretzel(0, 0, s * 1.6, false); break;
    case 'icecream': drawCone(0, 0, s * 1.2, false); break;
    case 'funnel': drawFunnel(0, 0, s * 1.4, false); break;
    case 'ferris': ctx.strokeStyle = '#3fa7ff'; ctx.lineWidth = 2*s; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2); ctx.stroke(); ctx.fillStyle = '#ffd23f'; ell(0, 0, 3*s, 3*s); ctx.fill(); break;
    case 'carousel': ctx.fillStyle = '#9b5cff'; ctx.beginPath(); ctx.moveTo(-r, r*0.3); ctx.lineTo(0, -r); ctx.lineTo(r, r*0.3); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#ffd23f'; ell(0, r*0.3, r, r*0.4); ctx.fill(); break;
    case 'bumper': rr(-r, -r*0.5, r*2, r*1.2, 4*s); ctx.fillStyle = '#ff4d6d'; ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.fillRect(-r*0.6, -r*0.3, r*1.2, r*0.4); break;
    case 'tower': ctx.fillStyle = '#e4e8ec'; ctx.fillRect(-2*s, -r, 4*s, r*2); ctx.fillStyle = '#ef4b5b'; rr(-4*s, -r, 8*s, 4*s, 2*s); ctx.fill(); break;
    case 'swings': ctx.fillStyle = '#f29e1f'; ctx.beginPath(); ctx.moveTo(0, -r); for(let k=0;k<5;k++){const a=-Math.PI/2+k*Math.PI*0.8; ctx.lineTo(Math.cos(a)*r*0.7, Math.sin(a)*r*0.7);} ctx.closePath(); ctx.fill(); break;
    case 'coaster': ctx.strokeStyle = '#e63946'; ctx.lineWidth = 2.5*s; ctx.beginPath(); ctx.moveTo(-r, r*0.3); ctx.quadraticCurveTo(-r*0.3, -r, r*0.3, 0); ctx.quadraticCurveTo(r*0.8, r*0.5, r, -r*0.5); ctx.stroke(); break;
    case 'haunted': ctx.fillStyle = '#6a4fa3'; rr(-r, -r*0.3, r*2, r*1.5, 3*s); ctx.fill(); ctx.fillStyle = '#2d2240'; ctx.beginPath(); ctx.moveTo(-r, -r*0.3); ctx.lineTo(0, -r); ctx.lineTo(r, -r*0.3); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#ffe066'; rr(-3*s, r*0.1, 2*s, 3*s, 1*s); ctx.fill(); rr(1*s, r*0.1, 2*s, 3*s, 1*s); ctx.fill(); break;
    case 'ring': ctx.strokeStyle = '#ef4b5b'; ctx.lineWidth = 2.5*s; ctx.beginPath(); ctx.arc(0, 0, r*0.7, 0, Math.PI*2); ctx.stroke(); break;
    case 'balloon': ctx.fillStyle = '#ff4d6d'; ell(0, -2*s, r*0.7, r); ctx.fill(); ctx.strokeStyle = '#8a5a3c'; ctx.lineWidth = 1*s; ctx.beginPath(); ctx.moveTo(0, r*0.5); ctx.lineTo(0, r); ctx.stroke(); break;
    case 'duck': ctx.fillStyle = '#ffd23f'; ell(0, 0, r*0.8, r*0.6); ctx.fill(); ell(r*0.4, -r*0.5, r*0.4, r*0.4); ctx.fill(); ctx.fillStyle = '#ff9a3c'; ctx.fillRect(r*0.7, -r*0.5, 3*s, 1.5*s); ctx.fillStyle = '#2a1a12'; ell(r*0.5, -r*0.6, 1*s, 1*s); ctx.fill(); break;
    case 'bottle': ctx.fillStyle = '#ffffff'; rr(-3*s, -r*0.3, 6*s, r*1.2, 2*s); ctx.fill(); ctx.fillRect(-1*s, -r, 2*s, r*0.5); break;
    case 'hoop': ctx.fillStyle = '#ff7a00'; ell(0, 0, r*0.8, r*0.8); ctx.fill(); ctx.fillStyle = '#3b2416'; ell(0, 0, r*0.3, r*0.3); ctx.fill(); break;
    case 'water': ctx.fillStyle = '#3fa7ff'; ell(0, -2*s, r*0.5, r*0.5); ctx.fill(); ell(-2*s, 2*s, r*0.4, r*0.4); ctx.fill(); ell(3*s, 1*s, r*0.35, r*0.35); ctx.fill(); break;
    case 'bell': ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(0, -2*s, r*0.7, Math.PI, 0); ctx.lineTo(r*0.7, r*0.3); ctx.lineTo(-r*0.7, r*0.3); ctx.closePath(); ctx.fill(); ell(0, r*0.5, r*0.3, r*0.3); ctx.fill(); break;
    case 'hammer': ctx.fillStyle = '#c99a5c'; ctx.fillRect(-1*s, -2*s, 2*s, r*1.5); ctx.fillStyle = '#ef4b5b'; rr(-4*s, -r, 8*s, 5*s, 2*s); ctx.fill(); break;
    case 'bowling': ctx.fillStyle = '#ffffff'; ell(-2*s, r*0.2, 3*s, 3*s); ctx.fill(); ell(2*s, r*0.2, 3*s, 3*s); ctx.fill(); ell(0, -r*0.3, 3*s, 3*s); ctx.fill(); ctx.fillStyle = '#ef4b5b'; ell(0, r*0.8, r*0.6, r*0.6); ctx.fill(); break;
    case 'target': ctx.fillStyle = '#ffffff'; ell(0, 0, r, r); ctx.fill(); ctx.fillStyle = '#ef4b5b'; ell(0, 0, r*0.65, r*0.65); ctx.fill(); ctx.fillStyle = '#ffffff'; ell(0, 0, r*0.35, r*0.35); ctx.fill(); ctx.fillStyle = '#ef4b5b'; ell(0, 0, r*0.12, r*0.12); ctx.fill(); break;
    case 'scale': ctx.strokeStyle = '#5b6573'; ctx.lineWidth = 2*s; ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(0, r*0.5); ctx.moveTo(-r*0.7, -r*0.5); ctx.lineTo(r*0.7, -r*0.5); ctx.stroke(); ctx.fillStyle = '#5b6573'; rr(-r*0.5, r*0.5, r, 2*s, 1*s); ctx.fill(); break;
    case 'plinko': ctx.fillStyle = '#b03cc9'; ell(0, 0, r*0.8, r*0.8); ctx.fill(); ctx.fillStyle = '#ffffff'; ell(-1*s, -1*s, 2*s, 2*s); ctx.fill(); break;
    case 'coin': ctx.fillStyle = '#ffd23f'; ell(0, 0, r*0.8, r*0.8); ctx.fill(); ctx.strokeStyle = '#c99400'; ctx.lineWidth = 1.5*s; ctx.stroke(); txt('$', 0, 1*s, size*0.5, '#c99400'); break;
    case 'frog': ctx.fillStyle = '#43a047'; ell(0, 0, r*0.8, r*0.7); ctx.fill(); ctx.fillStyle = '#ffffff'; ell(-3*s, -3*s, 2*s, 2*s); ctx.fill(); ell(3*s, -3*s, 2*s, 2*s); ctx.fill(); ctx.fillStyle = '#2a1a12'; ell(-3*s, -3*s, 1*s, 1*s); ctx.fill(); ell(3*s, -3*s, 1*s, 1*s); ctx.fill(); break;
    case 'tie': ctx.fillStyle = '#5b6b8a'; ctx.beginPath(); ctx.moveTo(-3*s, -r); ctx.lineTo(3*s, -r); ctx.lineTo(4*s, -r*0.5); ctx.lineTo(1*s, r); ctx.lineTo(-1*s, r); ctx.lineTo(-4*s, -r*0.5); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#ffffff'; rr(-4*s, -r, 8*s, 3*s, 1*s); ctx.fill(); break;
    case 'table': ctx.fillStyle = '#9a5a2c'; rr(-r, -2*s, r*2, 3*s, 1*s); ctx.fill(); ctx.fillRect(-r*0.7, 1*s, 2*s, r*0.8); ctx.fillRect(r*0.5, 1*s, 2*s, r*0.8); break;
    case 'chef': ctx.fillStyle = '#ffffff'; ell(0, -3*s, r*0.7, r*0.7); ctx.fill(); ell(-2*s, -r*0.7, r*0.4, r*0.4); ctx.fill(); ell(2*s, -r*0.7, r*0.4, r*0.4); ctx.fill(); ctx.fillStyle = '#f1c7a1'; ell(0, 3*s, r*0.6, r*0.6); ctx.fill(); break;
    case 'broom': ctx.fillStyle = '#c99a5c'; ctx.fillRect(-1*s, -r, 2*s, r*1.6); ctx.fillStyle = '#8a6240'; for(let k=-2;k<=2;k++) ctx.fillRect(k*2*s, r*0.4, 1.5*s, r*0.5); break;
    case 'cash': ctx.fillStyle = '#5cc46f'; rr(-r*0.7, -r*0.4, r*1.4, r*0.8, 2*s); ctx.fill(); txt('$', 0, 0, size*0.55, '#2f8a47'); break;
    case 'basket': ctx.fillStyle = '#c9884a'; rr(-r*0.7, -r*0.3, r*1.4, r*1, 3*s); ctx.fill(); ctx.strokeStyle = '#9a5a2c'; ctx.lineWidth = 1.5*s; ctx.beginPath(); ctx.arc(0, -r*0.6, r*0.5, Math.PI, 0); ctx.stroke(); break;
    case 'shoe': ctx.fillStyle = '#4aa3ff'; rr(-r*0.8, -r*0.2, r*1.4, r*0.7, 3*s); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.fillRect(-r*0.6, -r*0.2, r*1.6, r*0.25); break;
    case 'briefcase': rr(-r*0.7, -r*0.3, r*1.4, r*1, 2*s); ctx.fillStyle = '#5b6573'; ctx.fill(); ctx.strokeStyle = '#3b2416'; ctx.lineWidth = 1.5*s; ctx.beginPath(); ctx.moveTo(-2*s, -r*0.3); ctx.lineTo(-2*s, -r*0.6); ctx.lineTo(2*s, -r*0.6); ctx.lineTo(2*s, -r*0.3); ctx.stroke(); break;
    case 'wrench': ctx.fillStyle = '#8a95a3'; ctx.fillRect(-1*s, -r*0.8, 2*s, r*1.6); ctx.beginPath(); ctx.arc(0, -r*0.6, 3*s, 0, Math.PI*2); ctx.fill(); ctx.fillStyle = '#5b6573'; ell(0, -r*0.6, 1.5*s, 1.5*s); ctx.fill(); break;
    case 'seat': rr(-r*0.6, -r*0.2, r*1.2, r*0.6, 2*s); ctx.fillStyle = '#3fa7ff'; ctx.fill(); rr(-r*0.5, -r*0.7, r, r*0.6, 2*s); ctx.fill(); break;
    case 'bulb': ctx.fillStyle = '#ffd23f'; ell(0, -2*s, r*0.6, r*0.7); ctx.fill(); ctx.fillStyle = '#ffffff'; ell(-1*s, -4*s, 2*s, 2*s); ctx.fill(); ctx.fillStyle = '#8a95a3'; rr(-2*s, r*0.2, 4*s, 3*s, 1*s); ctx.fill(); break;
    case 'bolt': ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.moveTo(2*s, -r); ctx.lineTo(-1*s, -1*s); ctx.lineTo(2*s, 0); ctx.lineTo(-2*s, r); ctx.lineTo(1*s, 1*s); ctx.lineTo(-2*s, 0); ctx.closePath(); ctx.fill(); break;
    case 'tent': ctx.fillStyle = '#ef4b5b'; ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r, r*0.5); ctx.lineTo(-r, r*0.5); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#fff6e8'; ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r*0.5, r*0.5); ctx.lineTo(0, r*0.5); ctx.closePath(); ctx.fill(); break;
    case 'megaphone': ctx.fillStyle = '#ef4b5b'; ctx.beginPath(); ctx.moveTo(-r*0.4, -2*s); ctx.lineTo(r, -r*0.5); ctx.lineTo(r, r*0.5); ctx.lineTo(-r*0.4, 2*s); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#c9d3dc'; ell(-r*0.4, 0, 3*s, 3*s); ctx.fill(); break;
    case 'plush': drawPlush(0, 2*s, s*1.8, false, 0); break;
    case 'sparkle': ctx.fillStyle = '#ffd23f'; for(let k=0;k<4;k++){const a=k*Math.PI/4; ctx.fillRect(-1*s+Math.cos(a)*r*0.5, -1*s+Math.sin(a)*r*0.5, 2*s, 2*s);} ell(0, 0, 3*s, 3*s); ctx.fill(); break;
    case 'star': ctx.fillStyle = '#ffd23f'; starPath(0, 0, r*0.8); ctx.fill(); break;
    case 'ticket': ctx.fillStyle = '#ffd23f'; rr(-r*0.7, -r*0.4, r*1.4, r*0.8, 2*s); ctx.fill(); ctx.strokeStyle = '#c99400'; ctx.lineWidth = 1*s; ctx.setLineDash([2*s, 2*s]); ctx.beginPath(); ctx.moveTo(-r*0.7, 0); ctx.lineTo(r*0.7, 0); ctx.stroke(); ctx.setLineDash([]); break;
    case 'runner': ctx.fillStyle = '#f1c7a1'; ell(0, -r*0.5, 3*s, 3*s); ctx.fill(); ctx.fillStyle = '#4aa3ff'; rr(-3*s, -r*0.1, 6*s, r*0.8, 2*s); ctx.fill(); ctx.fillStyle = '#3d3a4a'; ctx.fillRect(-3*s, r*0.5, 2.5*s, r*0.4); ctx.fillRect(0.5*s, r*0.5, 2.5*s, r*0.4); break;
    case 'box': rr(-r*0.7, -r*0.5, r*1.4, r*1.2, 2*s); ctx.fillStyle = '#c9884a'; ctx.fill(); ctx.fillStyle = '#9a5a2c'; ctx.fillRect(-r*0.7, -r*0.5, r*1.4, 3*s); ctx.fillRect(-1*s, -r*0.5, 2*s, r*1.2); break;
    case 'lock': ctx.fillStyle = '#8a95a3'; rr(-r*0.5, -r*0.1, r, r*1, 2*s); ctx.fill(); ctx.strokeStyle = '#5b6573'; ctx.lineWidth = 2*s; ctx.beginPath(); ctx.arc(0, -r*0.2, r*0.35, Math.PI, 0); ctx.stroke(); ctx.fillStyle = '#ffd23f'; ell(0, r*0.3, 2*s, 2*s); ctx.fill(); break;
    case 'chair': ctx.fillStyle = '#c9884a'; rr(-r*0.5, -r*0.3, r, r*0.4, 2*s); ctx.fill(); rr(-r*0.4, r*0.1, r*0.8, r*0.6, 2*s); ctx.fill(); break;
    case 'ice': ctx.fillStyle = '#9fd3f2'; rr(-r*0.5, -r*0.5, r, r, 2*s); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.fillRect(-r*0.3, -r*0.3, r*0.35, r*0.35); ctx.fillRect(r*0.05, 0, r*0.35, r*0.35); break;
    case 'dot': ctx.fillStyle = '#ffd23f'; ell(0, 0, r*0.7, r*0.7); ctx.fill(); break;
    case 'swirl': for(let k=0;k<3;k++){ctx.fillStyle=['#ff4d6d','#ffd23f','#3fa7ff'][k]; const a=k*Math.PI*2/3; ell(Math.cos(a)*3*s, Math.sin(a)*3*s, r*0.4, r*0.4); ctx.fill();} break;
    case 'butter': ctx.fillStyle = '#ffd23f'; rr(-r*0.6, -r*0.3, r*1.2, r*0.8, 2*s); ctx.fill(); ctx.fillStyle = '#fff7c2'; rr(-r*0.4, -r*0.1, r*0.5, r*0.4, 1*s); ctx.fill(); break;
    case 'cheese': ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.moveTo(-r*0.7, r*0.4); ctx.lineTo(0, -r*0.5); ctx.lineTo(r*0.7, r*0.4); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#c99400'; ell(-1*s, 0, 2*s, 2*s); ctx.fill(); ell(2*s, r*0.2, 1.5*s, 1.5*s); ctx.fill(); break;
    case 'cherry': ctx.fillStyle = '#e53950'; ell(-2*s, 0, r*0.4, r*0.4); ctx.fill(); ell(2*s, 1*s, r*0.4, r*0.4); ctx.fill(); ctx.strokeStyle = '#43a047'; ctx.lineWidth = 1.5*s; ctx.beginPath(); ctx.moveTo(-2*s, -r*0.2); ctx.quadraticCurveTo(0, -r, 2*s, -r*0.1); ctx.stroke(); break;
    case 'snow': ctx.strokeStyle = '#c9d3dc'; ctx.lineWidth = 1.5*s; for(let k=0;k<3;k++){const a=k*Math.PI/3; ctx.beginPath(); ctx.moveTo(Math.cos(a)*-r*0.6, Math.sin(a)*-r*0.6); ctx.lineTo(Math.cos(a)*r*0.6, Math.sin(a)*r*0.6); ctx.stroke();} break;
    default: txt(key.charAt(0).toUpperCase(), 0, 1*s, size*0.65, '#ffffff', '#3b2416'); break;
  }
  ctx.restore();
}

export function drawDonut(x, y, s, gl) {
  ctx = getCtx();
  ctx.fillStyle = '#b8692b'; ell(x, y + 1.3 * s, 7 * s, 3.6 * s); ctx.fill();
  ctx.fillStyle = '#e9a04f'; ell(x, y, 7 * s, 3.6 * s); ctx.fill();
  ctx.fillStyle = gl ? '#ff7eb3' : '#f7dca6'; ell(x, y - 0.4 * s, 5.6 * s, 2.7 * s); ctx.fill();
  ctx.fillStyle = '#7b4419'; ell(x, y - 0.2 * s, 1.8 * s, 0.9 * s); ctx.fill();
  if (gl) {
    ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 4 * s, y - 1.6 * s, 1.5 * s, 0.8 * s);
    ctx.fillStyle = '#5fd0ff'; ctx.fillRect(x + 2.6 * s, y - 1.1 * s, 1.5 * s, 0.8 * s);
    ctx.fillStyle = '#ffe14d'; ctx.fillRect(x - 1 * s, y + 1.1 * s, 1.5 * s, 0.8 * s);
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillRect(x - 3.6 * s, y - 1.2 * s, 1 * s, 1 * s); ctx.fillRect(x + 3 * s, y + 0.3 * s, 1 * s, 1 * s);
  }
}

export function drawCup(x, y, s, ice) {
  ctx = getCtx();
  rr(x - 4.6 * s, y - 6 * s, 9.2 * s, 9 * s, 2 * s); ctx.fillStyle = '#ffe066'; ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(x - 4.6 * s, y - 0.6 * s, 9.2 * s, 2 * s);
  if (ice) { ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.fillRect(x - 3.2 * s, y - 4.8 * s, 2.4 * s, 2.4 * s); ctx.fillRect(x + 0.6 * s, y - 4.2 * s, 2.4 * s, 2.4 * s); }
  ctx.fillStyle = '#ffffff'; ell(x, y - 6 * s, 5.2 * s, 1.8 * s); ctx.fill();
  ctx.strokeStyle = '#ef4b5b'; ctx.lineWidth = 1.4 * s; ctx.beginPath(); ctx.moveTo(x + 1.2 * s, y - 6 * s); ctx.lineTo(x + 3 * s, y - 11 * s); ctx.stroke();
}

export function drawCorndog(x, y, s, mustard) {
  ctx = getCtx();
  ctx.fillStyle = '#c99a5c'; ctx.fillRect(x + 5 * s, y - 0.8 * s, 6 * s, 1.6 * s);
  rr(x - 8 * s, y - 3 * s, 14 * s, 6 * s, 3 * s); ctx.fillStyle = '#b8692b'; ctx.fill();
  rr(x - 8 * s, y - 3.4 * s, 14 * s, 5 * s, 2.5 * s); ctx.fillStyle = '#e39a45'; ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x - 6 * s, y - 2.6 * s, 9 * s, 1 * s);
  if (mustard) {
    ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 1.2 * s; ctx.beginPath(); ctx.moveTo(x - 6 * s, y - 1 * s);
    for (let i = 1; i <= 5; i++) ctx.lineTo(x - 6 * s + i * 2 * s, y - 1 * s + (i % 2 ? -1.4 : 1.4) * s);
    ctx.stroke();
  }
}

export function drawCandy(x, y, s, swirl) {
  ctx = getCtx();
  rr(x - 5.5 * s, y - 8 * s, 11 * s, 11 * s, 4 * s); ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fill();
  ctx.fillStyle = '#ff9cd2'; ell(x - 2 * s, y - 2.6 * s, 3.4 * s, 3 * s); ctx.fill();
  ctx.fillStyle = swirl ? '#8fd8ff' : '#ffb3de'; ell(x + 2 * s, y - 2 * s, 3.4 * s, 3 * s); ctx.fill();
  ctx.fillStyle = '#ffc4e6'; ell(x, y - 5 * s, 3 * s, 2.4 * s); ctx.fill();
  ctx.fillStyle = '#9b5cff'; ctx.fillRect(x - 1.6 * s, y - 10 * s, 3.2 * s, 2.4 * s);
}

export function drawPopcorn(x, y, s, butter) {
  ctx = getCtx();
  const puff = butter ? '#ffe9a0' : '#fffaf0';
  ctx.fillStyle = puff;
  ell(x - 3 * s, y - 6.5 * s, 2.6 * s, 2.3 * s); ctx.fill(); ell(x + 3 * s, y - 6.5 * s, 2.6 * s, 2.3 * s); ctx.fill(); ell(x, y - 8 * s, 2.8 * s, 2.4 * s); ctx.fill();
  rr(x - 4.6 * s, y - 6 * s, 9.2 * s, 9 * s, 1.5 * s); ctx.fillStyle = '#ffffff'; ctx.fill();
  ctx.fillStyle = '#e63946'; ctx.fillRect(x - 3.6 * s, y - 6 * s, 2.2 * s, 9 * s); ctx.fillRect(x + 1.4 * s, y - 6 * s, 2.2 * s, 9 * s);
}

export function drawPretzel(x, y, s, cheese) {
  ctx = getCtx();
  ctx.strokeStyle = '#a0522d'; ctx.lineWidth = 2.2 * s;
  ctx.beginPath(); ctx.ellipse(x - 2.6 * s, y - 1.5 * s, 3 * s, 2.4 * s, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(x + 2.6 * s, y - 1.5 * s, 3 * s, 2.4 * s, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 3 * s, y - 3.6 * s, 0.9 * s, 0.9 * s); ctx.fillRect(x + 2.4 * s, y - 3.8 * s, 0.9 * s, 0.9 * s); ctx.fillRect(x + 0.2 * s, y + 0.2 * s, 0.9 * s, 0.9 * s);
  if (cheese) { ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 1.1 * s; ctx.beginPath(); ctx.moveTo(x - 5 * s, y - 2 * s); ctx.quadraticCurveTo(x, y + 1 * s, x + 5 * s, y - 2 * s); ctx.stroke(); }
}

export function drawCone(x, y, s, cherry) {
  ctx = getCtx();
  ctx.fillStyle = '#e0a458'; ctx.beginPath(); ctx.moveTo(x - 3.8 * s, y - 3 * s); ctx.lineTo(x + 3.8 * s, y - 3 * s); ctx.lineTo(x, y + 5 * s); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(140,80,30,0.5)'; ctx.lineWidth = 0.6 * s; ctx.beginPath(); ctx.moveTo(x - 2 * s, y - 3 * s); ctx.lineTo(x + 1 * s, y + 2 * s); ctx.moveTo(x + 2 * s, y - 3 * s); ctx.lineTo(x - 1 * s, y + 2 * s); ctx.stroke();
  ctx.fillStyle = '#ff9cc4'; ell(x, y - 5 * s, 4.4 * s, 3.8 * s); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ell(x - 1.5 * s, y - 6.5 * s, 1.4 * s, 1 * s); ctx.fill();
  if (cherry) {
    ctx.fillStyle = '#e53950'; ell(x + 0.5 * s, y - 9 * s, 1.6 * s, 1.6 * s); ctx.fill();
    ctx.fillStyle = '#5fd0ff'; ctx.fillRect(x - 3 * s, y - 5 * s, 1.2 * s, 0.7 * s); ctx.fillStyle = '#ffe14d'; ctx.fillRect(x + 1.6 * s, y - 4 * s, 1.2 * s, 0.7 * s);
  }
}

export function drawFunnel(x, y, s, sugar) {
  ctx = getCtx();
  ctx.fillStyle = '#ffffff'; ell(x, y + 0.8 * s, 7.4 * s, 3.2 * s); ctx.fill();
  ctx.fillStyle = '#e39a45';
  ell(x - 2.5 * s, y - 0.5 * s, 3.5 * s, 2 * s); ctx.fill(); ell(x + 2.5 * s, y - 0.3 * s, 3.5 * s, 2 * s); ctx.fill(); ell(x, y - 1.4 * s, 3.4 * s, 1.8 * s); ctx.fill();
  ctx.strokeStyle = '#b8692b'; ctx.lineWidth = 0.7 * s; ctx.beginPath(); ctx.ellipse(x, y - 0.6 * s, 4.5 * s, 2 * s, 0, 0.3, 5.5); ctx.stroke();
  if (sugar) { ctx.fillStyle = 'rgba(255,255,255,0.95)'; for (let i = 0; i < 6; i++) ctx.fillRect(x - 4 * s + i * 1.5 * s, y - 1.8 * s + (i % 2) * 1.2 * s, 1 * s, 1 * s); }
}

export function drawTrash(x, y, s) {
  ctx = getCtx();
  ctx.fillStyle = '#cfc8bc'; ell(x, y + 0.8 * s, 6.6 * s, 2.9 * s); ctx.fill();
  ctx.fillStyle = '#ffffff'; ell(x, y, 6.6 * s, 2.9 * s); ctx.fill();
  ctx.fillStyle = '#efe8dc'; ell(x, y, 4.4 * s, 1.8 * s); ctx.fill();
  ctx.fillStyle = '#c98c4a'; ell(x - 1.5 * s, y - 0.2 * s, 1 * s, 0.7 * s); ctx.fill(); ell(x + 2 * s, y + 0.4 * s, 0.8 * s, 0.6 * s); ctx.fill();
  ctx.fillStyle = '#b9b2a6'; ell(x + 2.5 * s, y - 1.6 * s, 1.8 * s, 1.2 * s); ctx.fill();
}

function drawItem(it, x, y, s, b, idx) {
  if (it === 'trash') { drawTrashSprite(x, y, s); return; }
  if (it === 'plush') { drawPlushSprite(x, y, s, b, idx || 0); return; }
  const suf = s <= 0.75 ? ':sm' : s >= 1.2 ? ':lg' : '';
  const key = 'food:' + (it === 'icecream' ? 'icecream' : it === 'lemon' ? 'lemon' : it) + (b ? ':b' : '') + suf;
  const sp = sprites[key] || sprites['food:' + it + (b ? ':b' : '')];
  if (sp) {
    const sc = suf === '' && Math.abs(s - 1) > 0.01 ? s : 1;
    if (sc !== 1) { ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.drawImage(sp, -sp._ox, -sp._oy); ctx.restore(); }
    else ctx.drawImage(sp, x - sp._ox, y - sp._oy);
  } else {
    switch (it) {
      case 'donut': drawDonut(x, y, s, b); break;
      case 'lemon': drawCup(x, y, s, b); break;
      case 'corndog': drawCorndog(x, y, s, b); break;
      case 'candy': drawCandy(x, y, s, b); break;
      case 'popcorn': drawPopcorn(x, y, s, b); break;
      case 'pretzel': drawPretzel(x, y, s, b); break;
      case 'icecream': drawCone(x, y, s, b); break;
      default: drawFunnel(x, y, s, b); break;
    }
  }
}

function drawTrashSprite(x, y, s) {
  const key = s <= 0.92 ? 'trash:sm' : 'trash';
  const sp = sprites[key];
  if (sp) {
    const sc = (key === 'trash' && Math.abs(s - 1) > 0.01) || (key === 'trash:sm' && Math.abs(s - 0.9) > 0.01) ? s / (key === 'trash:sm' ? 0.9 : 1) : 1;
    if (sc !== 1) { ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.drawImage(sp, -sp._ox, -sp._oy); ctx.restore(); }
    else ctx.drawImage(sp, x - sp._ox, y - sp._oy);
  } else drawTrash(x, y, s);
}

function drawPlushSprite(x, y, s, fancy, idx) {
  const ci = ((idx % PLUSH.length) + PLUSH.length) % PLUSH.length;
  const key = 'plush:' + ci + (fancy ? ':f' : '');
  const sp = sprites[key];
  if (sp) {
    const sc = Math.abs(s - 1.8) > 0.3 ? s / 1.8 : 1;
    if (sc !== 1) { ctx.save(); ctx.translate(x, y + 2); ctx.scale(sc, sc); ctx.drawImage(sp, -sp._ox, -sp._oy); ctx.restore(); }
    else ctx.drawImage(sp, x - sp._ox, (y + 2) - sp._oy);
  } else drawPlush(x, y, s, fancy, idx);
}

export function drawPlush(x, y, s, fancy, idx) {
  ctx = getCtx();
  const col = PLUSH[((idx % PLUSH.length) + PLUSH.length) % PLUSH.length];
  ctx.fillStyle = col;
  ell(x, y - 2 * s, 4.6 * s, 4 * s); ctx.fill();
  ell(x - 3.4 * s, y - 9 * s, 1.8 * s, 1.8 * s); ctx.fill(); ell(x + 3.4 * s, y - 9 * s, 1.8 * s, 1.8 * s); ctx.fill();
  ell(x, y - 7.2 * s, 3.7 * s, 3.3 * s); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; ell(x, y - 1.6 * s, 2.4 * s, 2 * s); ctx.fill(); ell(x, y - 6.2 * s, 1.6 * s, 1.1 * s); ctx.fill();
  ctx.fillStyle = '#2a1a12'; ell(x - 1.3 * s, y - 7.6 * s, 0.6 * s, 0.6 * s); ctx.fill(); ell(x + 1.3 * s, y - 7.6 * s, 0.6 * s, 0.6 * s); ctx.fill();
  if (fancy) {
    ctx.fillStyle = '#ffd23f';
    ctx.beginPath(); ctx.moveTo(x, y - 4.4 * s); ctx.lineTo(x - 3 * s, y - 5.8 * s); ctx.lineTo(x - 3 * s, y - 3 * s); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x, y - 4.4 * s); ctx.lineTo(x + 3 * s, y - 5.8 * s); ctx.lineTo(x + 3 * s, y - 3 * s); ctx.closePath(); ctx.fill();
  }
}

export function drawBill(x, y) {
  ctx = getCtx();
  const sp = sprites['bill'];
  if (sp) { ctx.drawImage(sp, x - sp._ox, y - sp._oy); return; }
  rr(x - 8, y - 4, 16, 8, 1.5); ctx.fillStyle = '#5cc46f'; ctx.fill();
  ctx.lineWidth = 1; ctx.strokeStyle = '#2f8a47'; ctx.stroke();
  ctx.fillStyle = '#2f8a47'; ell(x, y, 2.2, 2.2); ctx.fill();
}

export function drawStars(cx, y, n) {
  ctx = getCtx();
  rr(cx - 42, y - 9, 84, 18, 9); ctx.fillStyle = 'rgba(59,36,22,0.7)'; ctx.fill();
  for (let k = 0; k < 5; k++) {
    const key = k < n ? 'star:on' : 'star:off';
    const sp = sprites[key];
    if (sp) ctx.drawImage(sp, cx - 30 + k * 15 - sp._ox, y - sp._oy);
    else { starPath(cx - 30 + k * 15, y, 6); ctx.fillStyle = k < n ? '#ffd23f' : 'rgba(255,255,255,0.3)'; ctx.fill(); }
  }
}

function drawPerson(e, o) {
  const x = e.x, y = e.y;
  const bob = e.moving ? Math.abs(Math.sin(e.walk)) * 2 : 0;
  const sit = !!o.sit, by = sit ? y + 6 : y;
  if (!sit) { const shSp = sprites['person-shadow']; if (shSp) ctx.drawImage(shSp, x - shSp._ox, y - shSp._oy); else { const shGrad = ctx.createRadialGradient(x, y, 0, x, y, 12); shGrad.addColorStop(0, 'rgba(0,0,0,0.22)'); shGrad.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = shGrad; ell(x, y, 12, 5); ctx.fill(); } }
  if (o.balloon) {
    const bx = x + 12, byy = by - 70 + Math.sin(state.time * 2 + x) * 2;
    ctx.strokeStyle = 'rgba(60,40,30,0.6)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x + 8, by - 18 - bob); ctx.quadraticCurveTo(x + 14, by - 40, bx, byy + 10); ctx.stroke();
    ctx.fillStyle = o.balloon; ell(bx, byy, 8, 10); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ell(bx - 3, byy - 4, 2, 3); ctx.fill();
  }
  if (!sit) {
    const s = e.moving ? Math.sin(e.walk) * 3 : 0;
    ctx.fillStyle = '#3d3a4a';
    rr(x - 7, y - 10 - Math.max(0, s), 5, 9, 2); ctx.fill();
    rr(x + 2, y - 10 - Math.max(0, -s), 5, 9, 2); ctx.fill();
  }
  rr(x - 9, by - 27 - bob, 18, 19, 7); ctx.fillStyle = o.shirt; ctx.fill();
  if (o.apron) { rr(x - 6, by - 21 - bob, 12, 13, 3); ctx.fillStyle = o.apron; ctx.fill(); }
  if (o.tie) { ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(x - 4, by - 26 - bob); ctx.lineTo(x + 4, by - 26 - bob); ctx.lineTo(x, by - 20 - bob); ctx.fill(); ctx.fillStyle = o.tie; rr(x - 1.5, by - 23 - bob, 3, 10, 1); ctx.fill(); }
  const n = o.stack || 0;
  ctx.fillStyle = o.skin;
  if (n > 0 || o.clip) { ell(x - 7, by - 15 - bob, 3, 3); ctx.fill(); ell(x + 7, by - 15 - bob, 3, 3); ctx.fill(); }
  else { ell(x - 10, by - 15 - bob, 2.8, 3.2); ctx.fill(); ell(x + 10, by - 15 - bob, 2.8, 3.2); ctx.fill(); }
  if (o.clip) { ctx.fillStyle = '#c99a5c'; rr(x - 5, by - 22 - bob, 10, 12, 1.5); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 3.5, by - 19 - bob, 7, 8); }
  const hy = by - 36 - bob;
  ctx.fillStyle = o.skin; ell(x, hy, 9, 9); ctx.fill();
  ctx.fillStyle = o.hair || '#3a2416';
  ctx.beginPath(); ctx.arc(x, hy - 1, 9.4, Math.PI * 1.02, Math.PI * 1.98); ctx.fill();
  const fx = (e.face || 1) * 1.6;
  ctx.fillStyle = '#2a1a12'; ell(x - 3 + fx, hy + 1, 1.4, 1.6); ctx.fill(); ell(x + 3 + fx, hy + 1, 1.4, 1.6); ctx.fill();
  ctx.fillStyle = 'rgba(255,120,120,0.35)'; ell(x - 5 + fx, hy + 4, 2, 1.3); ctx.fill(); ell(x + 5 + fx, hy + 4, 2, 1.3); ctx.fill();
  if (o.hat === 'cap') {
    ctx.fillStyle = o.hatColor;
    ctx.beginPath(); ctx.arc(x, hy - 2, 9.6, Math.PI, 0); ctx.fill();
    rr(x - 3 + (e.face || 1) * 6, hy - 4, 12, 4, 2); ctx.fill();
  } else if (o.hat === 'chef') {
    ctx.fillStyle = '#ffffff';
    rr(x - 8, hy - 12, 16, 8, 2); ctx.fill();
    ell(x - 5, hy - 15, 5, 5); ctx.fill(); ell(x + 5, hy - 15, 5, 5); ctx.fill(); ell(x, hy - 18, 6, 6); ctx.fill();
    ctx.strokeStyle = '#e6e0d8'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - 8, hy - 6); ctx.lineTo(x + 8, hy - 6); ctx.stroke();
  } else if (o.hat === 'bandana') {
    ctx.fillStyle = o.hatColor;
    ctx.beginPath(); ctx.arc(x, hy - 2, 9.6, Math.PI, 0); ctx.fill();
    ell(x - (e.face || 1) * 9, hy - 1, 3, 2); ctx.fill();
  }
  if (n > 0) {
    const ih = ITEM_H[o.item] || 4.2;
    for (let i = 0; i < n; i++) drawItem(o.item, x, by - 17 - bob - i * ih, 1, o.boost, i + (o.idx || 0));
    if (o.max) txt('MAX', x, by - 30 - bob - n * ih, 11, '#ffffff', '#ef4b5b');
  }
}

function drawRider(x, y, c) {
  ctx.fillStyle = c.shirt; ell(x, y + 4, 4.5, 3.5); ctx.fill();
  ctx.fillStyle = c.skin; ell(x, y - 1.5, 3.8, 3.8); ctx.fill();
  ctx.fillStyle = c.hair; ctx.beginPath(); ctx.arc(x, y - 2, 4, Math.PI, 0); ctx.fill();
}

function drawMachine(lot, m) {
  const { time } = state;
  const st = lot.def.style, it = lot.type, x = m.x, y = m.y, p = m.t / lot.fry, body = lot.def.body;
  const spBody = sprites['machine-body:' + it];
  if (spBody) ctx.drawImage(spBody, x - spBody._ox, y - spBody._oy);
  else {
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; ell(x, y + 24, 32, 8); ctx.fill();
    rr(x - 28, y - 4, 56, 26, 5); ctx.fillStyle = body[0]; ctx.fill();
    rr(x - 28, y - 30, 56, 30, 6); ctx.fillStyle = body[1]; ctx.fill();
  }
  if (st === 'fryer') {
    rr(x - 22, y - 25, 44, 18, 5); ctx.fillStyle = it === 'corndog' ? '#de9526' : '#f2b533'; ctx.fill();
    for (let i = 0; i < 2; i++) {
      const q = (p + i * 0.5) % 1, dx = -10 + i * 20;
      if (it === 'donut') { ctx.fillStyle = q > 0.5 ? '#d98a3a' : '#f0c27a'; ell(x + dx, y - 16, 6, 3.2); ctx.fill(); ctx.fillStyle = '#e8a43a'; ell(x + dx, y - 16.3, 2, 1); ctx.fill(); }
      else if (it === 'corndog') { rr(x + dx - 7, y - 19 + Math.sin(time * 4 + i) * 0.8, 14, 6, 3); ctx.fillStyle = q > 0.5 ? '#c27a2e' : '#f0c27a'; ctx.fill(); }
      else { ctx.strokeStyle = q > 0.5 ? '#b8692b' : '#e9b062'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x + dx, y - 16, 6, 3, 0, time * 2, time * 2 + 5); ctx.stroke(); }
    }
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    for (let i = 0; i < 4; i++) { const ph = (time * 1.6 + i * 0.27 + m.ph) % 1; ell(x - 16 + i * 10, y - 12 - ph * 6, 1.4 * (1 - ph) + 0.3, 1.4 * (1 - ph) + 0.3); ctx.fill(); }
  } else if (st === 'press') {
    rr(x - 22, y - 25, 44, 18, 5); ctx.fillStyle = '#fff3a0'; ctx.fill();
    for (let i = 0; i < 2; i++) {
      const lx = x - 10 + i * 20, ly = y - 16;
      ctx.fillStyle = '#ffd23f'; ell(lx, ly, 6.5, 4.4); ctx.fill();
      ctx.fillStyle = '#fff7c2'; ell(lx, ly, 4.8, 3.2); ctx.fill();
      ctx.strokeStyle = '#f5c400'; ctx.lineWidth = 1;
      for (let k = 0; k < 3; k++) { const a = time * 3 * (i ? -1 : 1) + k * Math.PI / 3; ctx.beginPath(); ctx.moveTo(lx + Math.cos(a) * 4.4, ly + Math.sin(a) * 2.9); ctx.lineTo(lx - Math.cos(a) * 4.4, ly - Math.sin(a) * 2.9); ctx.stroke(); }
    }
  } else if (st === 'spinner') {
    ctx.fillStyle = '#ffffff'; ell(x - 2, y - 16, 21, 9.5); ctx.fill();
    ctx.fillStyle = '#c9d3dc'; ell(x - 2, y - 16, 18, 7.5); ctx.fill();
    ctx.fillStyle = '#ff9cd2'; ell(x - 2, y - 17, 5 + p * 10, 2.5 + p * 4); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1.2;
    for (let k = 0; k < 2; k++) { ctx.beginPath(); ctx.ellipse(x - 2, y - 17, 4 + p * 8, 2 + p * 3, 0, time * 6 + k * Math.PI, time * 6 + k * Math.PI + 1.6); ctx.stroke(); }
  } else if (st === 'popper') {
    rr(x - 22, y - 46, 44, 38, 4); ctx.fillStyle = 'rgba(230,248,255,0.6)'; ctx.fill();
    ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#fffaf0';
    for (let k = 0; k < 14; k++) ell(x - 17 + (k * 7) % 34, y - 13 - Math.floor(k / 5) * 4, 2.6, 2.2), ctx.fill();
    for (let k = 0; k < 4; k++) { const ph = (time * 2 + k * 0.25 + m.ph) % 1; ell(x - 12 + k * 8, y - 16 - Math.sin(ph * Math.PI) * 20, 2.2, 2), ctx.fill(); }
    ctx.fillStyle = '#e63946'; rr(x - 24, y - 50, 48, 6, 3); ctx.fill();
  } else if (st === 'oven') {
    rr(x - 22, y - 25, 44, 18, 4); ctx.fillStyle = '#3a2a20'; ctx.fill();
    ctx.fillStyle = 'rgba(255,140,40,' + (0.35 + 0.15 * Math.sin(time * 3)) + ')'; rr(x - 20, y - 23, 40, 14, 3); ctx.fill();
    drawPretzel(x - 9, y - 14, 1.1, false); drawPretzel(x + 9, y - 14, 1.1, false);
    ctx.fillStyle = '#c9d3dc'; rr(x - 22, y - 30, 44, 4, 2); ctx.fill();
  } else {
    rr(x - 22, y - 25, 44, 18, 5); ctx.fillStyle = '#dff4f6'; ctx.fill();
    const tubs = ['#ff9cc4', '#8a5a3c', '#fff1c9'];
    for (let k = 0; k < 3; k++) { ctx.fillStyle = '#c9d3dc'; ell(x - 13 + k * 13, y - 16, 6, 4); ctx.fill(); ctx.fillStyle = tubs[k]; ell(x - 13 + k * 13, y - 16.5, 4.8, 3); ctx.fill(); }
  }
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; rr(x - 20, y + 4, 12, 6, 2); ctx.fill();
  ctx.fillStyle = m.stock >= MACH_CAP ? '#ffd23f' : '#7dff9a'; ell(x + 16, y + 7, 2.4, 2.4); ctx.fill();
  ctx.fillStyle = 'rgba(176,186,196,0.95)'; ell(x, y + 28, 14, 5); ctx.fill();
  const ih = ITEM_H[it];
  for (let i = 0; i < m.stock; i++) drawItem(it, x, y + 26 - i * ih, 1, lot.boosted);
  if (m.stock < MACH_CAP) {
    const by = st === 'popper' ? y - 60 : y - 40;
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; rr(x - 18, by, 36, 5, 2.5); ctx.fill();
    ctx.fillStyle = '#ffd23f'; rr(x - 18, by, 36 * p, 5, 2.5); ctx.fill();
  }
}

function drawBoost(lot) {
  const { time } = state;
  const x = lot.ox + 330, y = 180, it = lot.type, c = lot.def.boostCols;
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; ell(x, y + 24, 30, 8); ctx.fill();
  rr(x - 26, y - 4, 52, 26, 5); ctx.fillStyle = c[0]; ctx.fill();
  rr(x - 26, y - 30, 52, 30, 6); ctx.fillStyle = c[1]; ctx.fill();
  rr(x - 20, y - 25, 40, 18, 5); ctx.fillStyle = c[2]; ctx.fill();
  if (it === 'donut') {
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ell(x - 8 + Math.sin(time * 2) * 6, y - 18, 6, 2); ctx.fill();
    const cols = ['#ffffff', '#5fd0ff', '#ffe14d', '#7dff9a'];
    for (let i = 0; i < 4; i++) { ctx.fillStyle = cols[i]; rr(x - 18 + i * 10, y + 2, 7, 12, 2); ctx.fill(); }
  } else if (it === 'lemon') {
    for (let i = 0; i < 6; i++) { ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#9fd3f2'; ctx.lineWidth = 1; rr(x - 16 + (i % 3) * 11, y - 23 + Math.floor(i / 3) * 7, 8, 6, 1.5); ctx.fill(); ctx.stroke(); }
    ctx.fillStyle = '#4d93c4'; rr(x - 6, y + 4, 12, 10, 2); ctx.fill();
  } else if (it === 'corndog' || it === 'pretzel' || it === 'popcorn') {
    const a = it === 'corndog' ? '#ffd23f' : it === 'pretzel' ? '#ffb43f' : '#ffe066';
    const b = it === 'corndog' ? '#ef4b5b' : it === 'pretzel' ? '#ffd23f' : '#fff7d6';
    ctx.fillStyle = a; rr(x - 14, y - 40, 9, 22, 3); ctx.fill(); ctx.fillRect(x - 11, y - 45, 3, 6);
    ctx.fillStyle = b; rr(x + 5, y - 40, 9, 22, 3); ctx.fill(); ctx.fillRect(x + 8, y - 45, 3, 6);
  } else if (it === 'icecream') {
    for (let i = 0; i < 5; i++) { ctx.fillStyle = '#e53950'; ell(x - 14 + i * 7, y - 16 + (i % 2) * 3, 2.6, 2.6); ctx.fill(); }
  } else if (it === 'funnel') {
    ctx.fillStyle = '#ffffff'; rr(x - 7, y - 44, 14, 22, 4); ctx.fill(); ctx.fillStyle = '#c9d3dc'; rr(x - 7, y - 46, 14, 5, 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; for (let i = 0; i < 5; i++) { const ph = (time + i * 0.2) % 1; ctx.fillRect(x - 4 + i * 2, y - 22 + ph * 8, 1.5, 1.5); }
  } else {
    const cols = ['#ff9cd2', '#8fd8ff', '#ffe14d'];
    for (let i = 0; i < 3; i++) { ctx.fillStyle = cols[i]; ell(x - 10 + i * 10, y - 16 + Math.sin(time * 3 + i) * 1.5, 5, 4); ctx.fill(); }
  }
}

function drawCounter(lot) {
  const { time } = state;
  const ox = lot.ox;
  rr(ox + 26, 338, 278, 22, 4); ctx.fillStyle = '#f3c48d'; ctx.fill();
  ctx.fillStyle = lot.def.theme; ctx.fillRect(ox + 26, 356, 278, 24);
  ctx.fillStyle = '#fff6e8';
  for (let x = 26; x < 304; x += 24) ctx.fillRect(ox + x + 12, 356, Math.min(12, 304 - x - 12), 24);
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(ox + 26, 356, 278, 3);
  rr(ox + 58, 312, 104, 42, 6); ctx.fillStyle = 'rgba(205,240,255,0.55)'; ctx.fill();
  const empty = lot.shelf === 0 && lot.queue[0] && lot.queue[0].atFront;
  ctx.lineWidth = 3; ctx.strokeStyle = empty && Math.sin(time * 8) > 0 ? '#ef4b5b' : '#8a4d24'; ctx.stroke();
  const sc = lot.type === 'corndog' ? 0.72 : 0.8;
  for (let row = 2; row >= 0; row--) {
    for (let col = 0; col < 8; col++) {
      const i = row * 8 + col;
      if (i < lot.shelf) drawItem(lot.type, ox + 67 + col * 12.2, 346 - row * 10, sc, lot.boosted);
    }
  }
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(ox + 62, 315, 4, 34);
  ctx.fillStyle = '#4c5563'; rr(ox + 222, 328, 36, 24, 4); ctx.fill();
  ctx.fillStyle = '#2f3540'; ctx.fillRect(ox + 236, 320, 8, 9);
  ctx.fillStyle = '#9ff0b0'; rr(ox + 226, 310, 28, 12, 2); ctx.fill();
  txt('$' + fmt(lot.price), ox + 240, 316.5, fitText('$' + fmt(lot.price), 24, 8), '#2f3540');
  ctx.fillStyle = '#c9d3dc';
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { rr(ox + 227 + i * 9, 333 + j * 7, 7, 5, 1); ctx.fill(); }
}

function drawTableBack(t) {
  const sp = sprites['table-back'];
  if (sp) { ctx.drawImage(sp, t.x - sp._ox, t.y - 31 - sp._oy); return; }
  ctx.fillStyle = '#9a5a2c'; rr(t.x - 28, t.y - 31, 56, 8, 3); ctx.fill();
}

function drawTable(lot, t) {
  const { time } = state;
  const x = t.x, y = t.y;
  const sp = sprites['table:' + lot.type];
  if (sp) { ctx.drawImage(sp, x - sp._ox, y - sp._oy); }
  else {
    const shGrad = ctx.createRadialGradient(x, y + 22, 4, x, y + 22, 38);
    shGrad.addColorStop(0, 'rgba(0,0,0,0.2)'); shGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = shGrad; ell(x, y + 22, 38, 10); ctx.fill();
    const legGrad = ctx.createLinearGradient(x - 24, 0, x - 19, 0);
    legGrad.addColorStop(0, '#6a3818'); legGrad.addColorStop(0.5, '#8a5228'); legGrad.addColorStop(1, '#6a3818');
    ctx.fillStyle = legGrad; ctx.fillRect(x - 24, y + 8, 5, 14); ctx.fillRect(x + 19, y + 8, 5, 14);
    rr(x - 32, y - 18, 64, 30, 5); ctx.fillStyle = lot.def.cloth; ctx.fill();
    ctx.save(); rr(x - 32, y - 18, 64, 30, 5); ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    for (let i = 0; i < 8; i++) ctx.fillRect(x - 32 + i * 8, y - 18, 4, 30);
    for (let j = 0; j < 4; j++) ctx.fillRect(x - 32, y - 18 + j * 8, 64, 4);
    ctx.fillStyle = 'rgba(0,0,0,0.06)'; ctx.fillRect(x - 32, y + 4, 64, 8);
    ctx.restore();
    ctx.fillStyle = '#b8672f'; ctx.fillRect(x - 32, y + 10, 64, 4);
    ctx.fillStyle = '#9a5a2c'; rr(x - 28, y + 22, 56, 8, 3); ctx.fill();
  }
  for (const st of t.seats) {
    const c = st.occ;
    if (c && c.state === 'eating') {
      ctx.fillStyle = '#ffffff'; ell(st.x, y - 6, 9, 4); ctx.fill();
      const left = Math.max(0, c.want - Math.floor(c.t / EAT_T * c.want));
      const ih = Math.min(ITEM_H[lot.type], 4);
      for (let i = 0; i < Math.min(3, left); i++) drawItem(lot.type, st.x, y - 7 - i * ih, 0.8, lot.boosted);
    }
    if (st.trash > 0) {
      for (let i = 0; i < Math.min(3, st.trash); i++) drawTrashSprite(st.x, y - 3 - i * 3, 0.9);
      if (st.tip > 0) drawBill(st.x + (st.x < x ? -5 : 5), y + 7);
    }
  }
  if (tableTrash(t) > 0) {
    ctx.fillStyle = '#2a1a12';
    for (let k = 0; k < 2; k++) { ell(x - 8 + k * 16 + Math.cos(time * (5 + k)) * 6, y - 24 + Math.sin(time * (9 - k)) * 3, 1.6, 1.6); ctx.fill(); }
  }
}

function drawBin(lot) {
  const { time } = state;
  const b = lot.bin, open = time - lot.binT < 0.25;
  if (player.carryType === 'trash') {
    const pulse = (time * 1.5) % 1;
    ctx.strokeStyle = 'rgba(255,225,77,' + (1 - pulse) + ')'; ctx.lineWidth = 3;
    ell(b.x, b.y, 16 + pulse * 12, 6 + pulse * 5); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ell(b.x + 2, b.y + 3, 15, 6); ctx.fill();
  const binGrad = ctx.createLinearGradient(b.x - 12, 0, b.x + 12, 0);
  binGrad.addColorStop(0, '#2e8a52'); binGrad.addColorStop(0.4, '#4ac87a'); binGrad.addColorStop(1, '#2e8a52');
  rr(b.x - 12, b.y - 24, 24, 26, 4); ctx.fillStyle = binGrad; ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(b.x - 12, b.y - 16, 24, 2); ctx.fillRect(b.x - 12, b.y - 7, 24, 2);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(b.x - 4, b.y - 13, 8, 2); rr(b.x - 3, b.y - 11, 6, 7, 1); ctx.fill();
  ctx.fillStyle = '#2a3640'; ell(b.x, b.y - 24, 12, 4); ctx.fill();
  ctx.save(); ctx.translate(b.x - 13, b.y - 26); if (open) ctx.rotate(-0.7);
  const lidGrad = ctx.createLinearGradient(0, -3, 0, 3);
  lidGrad.addColorStop(0, '#3aae6b'); lidGrad.addColorStop(1, '#2a8a52');
  rr(0, -3, 26, 6, 3); ctx.fillStyle = lidGrad; ctx.fill(); rr(9, -6, 8, 4, 2); ctx.fill();
  ctx.restore();
}

function drawCash(lot) {
  if (lot.cash <= 0) return;
  const c = lot.cashPos, unit = Math.max(1, lot.kind === 'food' ? lot.price : lot.ticket);
  ctx.fillStyle = 'rgba(0,0,0,0.16)'; ell(c.x, c.y + 2, 18, 6); ctx.fill();
  const n = Math.min(24, Math.ceil(lot.cash / unit));
  for (let i = 0; i < n; i++) {
    const col = i % 3, lay = Math.floor(i / 3);
    drawBill(c.x - 12 + col * 12 + (lay % 2) * 2, c.y - 1 - lay * 3);
  }
}

function drawFoodGround(lot) {
  const sp = sprites['food-ground'];
  if (sp) { ctx.drawImage(sp, lot.ox, lot.oy); return; }
  const ox = lot.ox;
  ctx.fillStyle = '#d2b47a'; ell(ox + 130, 548, 112, 118); ctx.fill();
  ctx.fillStyle = '#d2b47a'; rr(ox + 212, 378, 56, 340, 10); ctx.fill();
  for (let y = 158; y < 380; y += 20) {
    for (let x = 30; x < 370; x += 20) {
      const even = (((x - 30) / 20) + ((y - 158) / 20)) % 2 === 0;
      ctx.fillStyle = even ? '#fff3e0' : '#ffe6cc';
      ctx.fillRect(ox + x, y, 20, Math.min(20, 380 - y));
      ctx.fillStyle = even ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.03)';
      ctx.fillRect(ox + x, y, 20, 2);
    }
  }
  ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.fillRect(ox + 30, 158, 340, 4);
  ctx.fillStyle = 'rgba(0,0,0,0.05)'; ctx.fillRect(ox + 30, 162, 340, 6);
}

function drawFoodStand(lot) {
  const sp = sprites['food-stand:' + lot.type];
  if (sp) { ctx.drawImage(sp, lot.ox, lot.oy + 108); }
  else {
    const ox = lot.ox, d = lot.def;
    const woodGrad = ctx.createLinearGradient(ox + 14, 126, ox + 14, 160);
    woodGrad.addColorStop(0, '#c4874b'); woodGrad.addColorStop(1, '#a0632f');
    ctx.fillStyle = woodGrad; ctx.fillRect(ox + 14, 126, 372, 34);
    ctx.strokeStyle = 'rgba(80,40,15,0.25)'; ctx.lineWidth = 1;
    for (let y = 134; y < 160; y += 8) { ctx.beginPath(); ctx.moveTo(ox + 14, y); ctx.lineTo(ox + 386, y); ctx.stroke(); }
    const pillarGrad = ctx.createLinearGradient(ox + 14, 0, ox + 30, 0);
    pillarGrad.addColorStop(0, '#8a5528'); pillarGrad.addColorStop(0.5, '#b5773f'); pillarGrad.addColorStop(1, '#8a5528');
    ctx.fillStyle = pillarGrad; ctx.fillRect(ox + 14, 126, 16, 254);
    const pillarGrad2 = ctx.createLinearGradient(ox + 370, 0, ox + 386, 0);
    pillarGrad2.addColorStop(0, '#8a5528'); pillarGrad2.addColorStop(0.5, '#b5773f'); pillarGrad2.addColorStop(1, '#8a5528');
    ctx.fillStyle = pillarGrad2; ctx.fillRect(ox + 370, 126, 16, 254);
    ctx.fillStyle = '#c4874b'; ctx.fillRect(ox + 14, 126, 16, 6); ctx.fillRect(ox + 370, 126, 16, 6);
    for (let i = 0, x = 10; x < 390; i++, x += 20) {
      const base = i % 2 ? '#fff6e8' : d.theme;
      ctx.fillStyle = base;
      ctx.fillRect(ox + x, 108, 20, 24);
      ell(ox + x + 10, 132, 10, 8); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(ox + x, 108, 20, 3);
    }
    ctx.fillStyle = 'rgba(0,0,0,0.14)'; ctx.fillRect(ox + 10, 108, 380, 3);
    ctx.fillStyle = 'rgba(0,0,0,0.06)'; ctx.fillRect(ox + 10, 111, 380, 3);
  }
  drawSign(lot);
}

function drawSign(lot) {
  const { time } = state;
  const ox = lot.ox, food = lot.kind === 'food';
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; rr(ox + 99, 74, 208, 42, 10); ctx.fill();
  const signGrad = ctx.createLinearGradient(ox + 96, 70, ox + 96, 112);
  signGrad.addColorStop(0, food ? '#7a4528' : '#3a424e'); signGrad.addColorStop(1, food ? '#5a2e14' : '#222830');
  rr(ox + 96, 70, 208, 42, 10); ctx.fillStyle = signGrad; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = '#ffd23f'; ctx.stroke();
  for (let i = 0; i < 10; i++) { ctx.fillStyle = (Math.floor(time * 3) + i) % 2 ? '#fff4b0' : '#ffb43f'; ell(ox + 108 + i * 20.4, 74, 2.5, 2.5); ctx.fill(); ctx.fillStyle = 'rgba(255,244,176,0.3)'; ell(ox + 108 + i * 20.4, 74, 5, 5); ctx.fill(); }
  txt(lot.name, ox + 200, 93, fitText(lot.name, 146, 21), '#fff6e8');
  if (food) {
    const yy = tallItem(lot.type) ? 98 : 94;
    drawItem(lot.type, ox + 112, yy, 1.25, lot.boosted); drawItem(lot.type, ox + 288, yy, 1.25, lot.boosted);
  } else { drawIcon(lot.def.icon, ox + 113, 92, 18); drawIcon(lot.def.icon, ox + 287, 92, 18); }
  drawStars(ox + 200, 60, lot.starsShown || 1);
}

function drawHRBuilding(lot) {
  const { time } = state;
  const ox = lot.ox, oy = lot.oy;
  const cx = ox + 200, cy = oy + 270;
  const sp = sprites['hr-building'];
  if (sp) ctx.drawImage(sp, cx - 150, cy - 120);
  else {
    const sandGrad = ctx.createRadialGradient(cx, oy + 450, 20, cx, oy + 450, 160);
    sandGrad.addColorStop(0, '#eedcaa'); sandGrad.addColorStop(1, '#dcc88e');
    ctx.fillStyle = sandGrad; ell(cx, oy + 450, 160, 100); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.22)'; ell(cx + 4, cy + 74, 112, 22); ctx.fill();
    const wallGrad = ctx.createLinearGradient(cx - 90, cy - 60, cx + 90, cy + 60);
    wallGrad.addColorStop(0, '#e8f0f6'); wallGrad.addColorStop(1, '#d0dce8');
    rr(cx - 90, cy - 60, 180, 120, 6); ctx.fillStyle = wallGrad; ctx.fill();
    const baseGrad = ctx.createLinearGradient(cx - 90, cy + 40, cx - 90, cy + 60);
    baseGrad.addColorStop(0, '#b8c8d8'); baseGrad.addColorStop(1, '#a0b0c2');
    ctx.fillStyle = baseGrad; ctx.fillRect(cx - 90, cy + 40, 180, 20);
    const roofGrad = ctx.createLinearGradient(cx - 100, cy - 110, cx + 100, cy - 58);
    roofGrad.addColorStop(0, '#6b7b9a'); roofGrad.addColorStop(1, '#4a5873');
    ctx.fillStyle = roofGrad; ctx.beginPath(); ctx.moveTo(cx - 100, cy - 58); ctx.lineTo(cx, cy - 110); ctx.lineTo(cx + 100, cy - 58); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#3a4560'; ctx.fillRect(cx - 100, cy - 62, 200, 6);
    const doorGrad = ctx.createLinearGradient(cx - 14, cy - 10, cx + 14, cy + 40);
    doorGrad.addColorStop(0, '#8a5a30'); doorGrad.addColorStop(1, '#6a3a1a');
    rr(cx - 14, cy - 10, 28, 50, 4); ctx.fillStyle = doorGrad; ctx.fill();
    ctx.fillStyle = '#ffd23f'; ell(cx + 9, cy + 16, 2.8, 2.8); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ell(cx + 8.5, cy + 15.5, 1.2, 1.2); ctx.fill();
    for (const dx of [-52, 52]) {
      rr(cx + dx - 16, cy - 44, 32, 26, 3); ctx.fillStyle = '#9fd3f2'; ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillRect(cx + dx - 13, cy - 41, 6, 20);
      ctx.fillStyle = 'rgba(160,200,230,0.3)'; ctx.fillRect(cx + dx - 2, cy - 41, 14, 20);
    }
    for (const dx of [-52, 52]) {
      rr(cx + dx - 16, cy - 6, 32, 26, 3); ctx.fillStyle = '#9fd3f2'; ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillRect(cx + dx - 13, cy - 3, 6, 20);
      ctx.fillStyle = 'rgba(160,200,230,0.3)'; ctx.fillRect(cx + dx - 2, cy - 3, 14, 20);
    }
    rr(cx - 34, cy + 66, 24, 18, 3); ctx.fillStyle = '#5fa845'; ctx.fill();
    ctx.fillStyle = 'rgba(80,160,60,0.4)'; ctx.fillRect(cx - 34, cy + 72, 24, 3);
    rr(cx + 10, cy + 66, 24, 18, 3); ctx.fillStyle = '#5fa845'; ctx.fill();
    ctx.fillStyle = 'rgba(80,160,60,0.4)'; ctx.fillRect(cx + 10, cy + 72, 24, 3);
    ctx.fillStyle = '#4a8c3a'; ctx.beginPath(); ctx.arc(cx - 22, cy + 62, 8, Math.PI, 0); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 22, cy + 62, 8, Math.PI, 0); ctx.fill();
  }
  const flag = Math.sin(time * 3) * 4;
  const poleGrad = ctx.createLinearGradient(cx + 86, 0, cx + 89, 0);
  poleGrad.addColorStop(0, '#4a5873'); poleGrad.addColorStop(1, '#6b7b9a');
  ctx.fillStyle = poleGrad; ctx.fillRect(cx + 86, cy - 100, 3, 60);
  ctx.fillStyle = '#ffd23f'; ell(cx + 87.5, cy - 101, 3, 3); ctx.fill();
  ctx.fillStyle = '#fff6e8'; ctx.beginPath(); ctx.moveTo(cx + 89, cy - 100); ctx.lineTo(cx + 115, cy - 94 + flag); ctx.lineTo(cx + 89, cy - 82); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.moveTo(cx + 89, cy - 98); ctx.lineTo(cx + 105, cy - 94 + flag * 0.6); ctx.lineTo(cx + 89, cy - 86); ctx.closePath(); ctx.fill();
}

function drawHRSign(lot) {
  const { time } = state;
  const ox = lot.ox, oy = lot.oy;
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; rr(ox + 99, oy + 134, 208, 42, 10); ctx.fill();
  const signGrad = ctx.createLinearGradient(ox + 96, oy + 130, ox + 96, oy + 172);
  signGrad.addColorStop(0, '#3a424e'); signGrad.addColorStop(1, '#222830');
  rr(ox + 96, oy + 130, 208, 42, 10); ctx.fillStyle = signGrad; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = '#ffd23f'; ctx.stroke();
  for (let i = 0; i < 10; i++) { ctx.fillStyle = (Math.floor(time * 3) + i) % 2 ? '#fff4b0' : '#ffb43f'; ell(ox + 108 + i * 20.4, oy + 134, 2.5, 2.5); ctx.fill(); ctx.fillStyle = 'rgba(255,244,176,0.3)'; ell(ox + 108 + i * 20.4, oy + 134, 5, 5); ctx.fill(); }
  txt('HR Office', ox + 200, oy + 153, fitText('HR Office', 146, 21), '#fff6e8');
  drawIcon('tie', ox + 113, oy + 152, 18); drawIcon('tie', ox + 287, oy + 152, 18);
  drawStars(ox + 200, oy + 120, 1);
}

function ridingOf(lot) { return lot.ride.riders.filter(c => c.state === 'riding'); }

function drawFerris(lot) {
  const { time } = state;
  const r = lot.ride, cx = lot.ox + 200, cy = 236, R = 96, th = lot.def.theme, riding = ridingOf(lot);
  ctx.lineCap = 'round'; ctx.strokeStyle = '#d7dde3'; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx - 60, 366); ctx.moveTo(cx, cy); ctx.lineTo(cx + 60, 366); ctx.stroke();
  ctx.lineCap = 'butt';
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 1.5;
  for (let k = 0; k < 12; k++) { const a = r.ang + k * Math.PI / 6; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke(); }
  ctx.strokeStyle = th; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, R * 0.55, 0, Math.PI * 2); ctx.stroke();
  for (let k = 0; k < 24; k++) {
    const a = r.ang + k * Math.PI / 12;
    ctx.fillStyle = (k + Math.floor(time * 4)) % 2 && r.spin > 0.2 ? '#fff4b0' : '#ffd23f';
    ell(cx + Math.cos(a) * R, cy + Math.sin(a) * R, 2, 2); ctx.fill();
  }
  for (let k = 0; k < 12; k++) {
    const a = r.ang + k * Math.PI / 6, px = cx + Math.cos(a) * R, py = cy + Math.sin(a) * R;
    ctx.strokeStyle = '#8a95a3'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py + 6); ctx.stroke();
    if (riding[k]) drawRider(px, py + 9, riding[k]);
    rr(px - 9, py + 10, 18, 9, 3); ctx.fillStyle = BRIGHT[k % 8]; ctx.fill();
  }
  ctx.fillStyle = '#ffd23f'; ell(cx, cy, 9, 9); ctx.fill();
  ctx.fillStyle = th; ell(cx, cy, 4, 4); ctx.fill();
}

function drawCarouselRide(lot) {
  const { time } = state;
  const r = lot.ride, cx = lot.ox + 200, py = 302, th = lot.def.theme, riding = ridingOf(lot);
  ctx.fillStyle = '#d99a00'; ell(cx, py + 8, 152, 50); ctx.fill();
  ctx.fillStyle = '#ffd23f'; ell(cx, py, 150, 48); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ell(cx, py, 110, 34); ctx.fill();
  const horses = [];
  for (let k = 0; k < 12; k++) { const a = r.ang + k * Math.PI / 6; horses.push({ k, a, x: cx + Math.cos(a) * 120, y: py + Math.sin(a) * 36, s: Math.sin(a) }); }
  const cols = ['#ffffff', '#ff9cc4', '#9fd8ff', '#ffe14d', '#c8b6ff'];
  const drawHorse = h => {
    const bob = Math.sin(time * 5 + h.k) * 4 * r.spin, hy = h.y - 24 + bob;
    ctx.fillStyle = '#e6c27a'; ctx.fillRect(h.x - 1, 222 + h.s * 20, 2, h.y - 222 - h.s * 20);
    rr(h.x - 11, hy, 22, 10, 5); ctx.fillStyle = cols[h.k % 5]; ctx.fill();
    ctx.fillStyle = cols[h.k % 5]; ell(h.x + (Math.sin(h.a) > 0 ? 10 : -10), hy - 2, 4, 5); ctx.fill();
    ctx.fillStyle = '#3d3a4a'; ctx.fillRect(h.x - 8, hy + 9, 2, 6); ctx.fillRect(h.x + 6, hy + 9, 2, 6);
    if (riding[h.k]) drawRider(h.x, hy - 6, riding[h.k]);
  };
  horses.filter(h => h.s < 0).forEach(drawHorse);
  rr(cx - 18, 214, 36, py - 214, 6); ctx.fillStyle = '#fff6e8'; ctx.fill();
  ctx.fillStyle = th; for (let y = 222; y < py - 6; y += 16) ctx.fillRect(cx - 18, y, 36, 6);
  horses.filter(h => h.s >= 0).forEach(drawHorse);
  const segs = 16, ax = cx, ay = 150, rx = 162, ry = 34, rimY = 214;
  const seg2 = [];
  for (let k = 0; k < segs; k++) { const a0 = r.ang * 0.5 + k * Math.PI * 2 / segs, a1 = a0 + Math.PI * 2 / segs; seg2.push({ k, a0, a1, s: Math.sin((a0 + a1) / 2) }); }
  seg2.sort((a, b) => a.s - b.s);
  for (const g of seg2) {
    ctx.fillStyle = g.k % 2 ? '#fff6e8' : th;
    ctx.beginPath(); ctx.moveTo(ax, ay);
    ctx.lineTo(ax + Math.cos(g.a0) * rx, rimY + Math.sin(g.a0) * ry); ctx.lineTo(ax + Math.cos(g.a1) * rx, rimY + Math.sin(g.a1) * ry); ctx.closePath(); ctx.fill();
  }
  for (let k = 0; k < 18; k++) { const a = k * Math.PI / 17; ctx.fillStyle = k % 2 ? '#fff6e8' : th; ell(ax + Math.cos(a) * rx, rimY + Math.sin(a) * ry + 3, 7, 6); ctx.fill(); }
  ctx.fillStyle = '#ffd23f'; ell(ax, ay - 2, 6, 6); ctx.fill();
}

function drawBumperRide(lot) {
  const { time } = state;
  const r = lot.ride, ox = lot.ox, riding = ridingOf(lot);
  rr(ox + 48, 168, 304, 196, 22); ctx.fillStyle = '#ffd23f'; ctx.fill();
  rr(ox + 56, 176, 288, 180, 18); ctx.fillStyle = '#3e4452'; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1;
  for (let x = ox + 76; x < ox + 344; x += 24) { ctx.beginPath(); ctx.moveTo(x, 176); ctx.lineTo(x, 356); ctx.stroke(); }
  const cars = r.cars.map((c, k) => ({ c, k })).sort((a, b) => a.c.y - b.c.y);
  for (const { c, k } of cars) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ell(c.x, c.y + 6, 14, 5); ctx.fill();
    rr(c.x - 14, c.y - 7, 28, 15, 7); ctx.fillStyle = '#2a2e38'; ctx.fill();
    rr(c.x - 12, c.y - 9, 24, 13, 6); ctx.fillStyle = c.col; ctx.fill();
    ctx.strokeStyle = '#8a95a3'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(c.x + 6, c.y - 6); ctx.lineTo(c.x + 6, c.y - 26); ctx.stroke();
    if (r.spin > 0.5 && Math.random() < 0.3) { ctx.fillStyle = '#fff4b0'; ell(c.x + 6, c.y - 27, 2.5, 2.5); ctx.fill(); }
    if (riding[k]) drawRider(c.x - 2, c.y - 9, riding[k]);
  }
}

function drawTowerRide(lot) {
  const { time } = state;
  const r = lot.ride, cx = lot.ox + 200, th = lot.def.theme, riding = ridingOf(lot), ty = r.ty;
  ctx.fillStyle = '#c9d3dc'; ell(cx, 362, 72, 16); ctx.fill();
  rr(cx - 9, 128, 18, 236, 4); ctx.fillStyle = '#e4e8ec'; ctx.fill();
  ctx.fillStyle = th; for (let y = 136; y < 356; y += 26) ctx.fillRect(cx - 9, y, 18, 8);
  rr(cx - 16, 116, 32, 16, 5); ctx.fillStyle = th; ctx.fill();
  ctx.fillStyle = Math.floor(time * 3) % 2 ? '#ff4d6d' : '#fff4b0'; ell(cx, 114, 3, 3); ctx.fill();
  ctx.fillStyle = '#b8303c'; ell(cx, ty + 6, 48, 13); ctx.fill();
  const back = riding.filter((_, k) => k % 2 === 1), front = riding.filter((_, k) => k % 2 === 0);
  back.forEach((c, k) => drawRider(cx - 36 + (k + 0.5) * (72 / Math.max(1, back.length)), ty - 4, c));
  rr(cx - 46, ty, 92, 13, 6); ctx.fillStyle = '#ffd23f'; ctx.fill();
  front.forEach((c, k) => drawRider(cx - 40 + (k + 0.5) * (80 / Math.max(1, front.length)), ty + 4, c));
  ctx.fillStyle = th; rr(cx - 46, ty + 11, 92, 6, 3); ctx.fill();
}

function drawSwingsRide(lot) {
  const { time } = state;
  const r = lot.ride, cx = lot.ox + 200, topY = 168, th = lot.def.theme, riding = ridingOf(lot);
  const rad = 54 + r.spin * 70, lift = r.spin * 46;
  const seats = [];
  for (let k = 0; k < 12; k++) {
    const a = r.ang + k * Math.PI / 6;
    seats.push({ k, s: Math.sin(a), sx: cx + Math.cos(a) * rad, sy: 318 - lift + Math.sin(a) * rad * 0.3, ax: cx + Math.cos(a) * 54, ay: topY + 16 + Math.sin(a) * 12 });
  }
  const drawSeat = q => {
    ctx.strokeStyle = 'rgba(80,80,90,0.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(q.ax, q.ay); ctx.lineTo(q.sx, q.sy); ctx.stroke();
    if (riding[q.k]) drawRider(q.sx, q.sy - 3, riding[q.k]);
    rr(q.sx - 6, q.sy + 2, 12, 5, 2); ctx.fillStyle = BRIGHT[q.k % 8]; ctx.fill();
  };
  ctx.fillStyle = '#c9d3dc'; ell(cx, 362, 56, 13); ctx.fill();
  seats.filter(q => q.s < 0).forEach(drawSeat);
  rr(cx - 7, topY, 14, 362 - topY, 3); ctx.fillStyle = '#e4e8ec'; ctx.fill();
  ctx.fillStyle = th; ell(cx, topY + 14, 66, 17); ctx.fill();
  for (let k = 0; k < 10; k++) {
    const a0 = r.ang * 0.6 + k * Math.PI / 5, a1 = a0 + Math.PI / 5;
    ctx.fillStyle = k % 2 ? '#fff6e8' : th;
    ctx.beginPath(); ctx.moveTo(cx, topY - 26); ctx.lineTo(cx + Math.cos(a0) * 66, topY + 14 + Math.sin(a0) * 17); ctx.lineTo(cx + Math.cos(a1) * 66, topY + 14 + Math.sin(a1) * 17); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = '#ffd23f'; ctx.beginPath();
  for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + k * Math.PI * 0.8; ctx.lineTo(cx + Math.cos(a) * 8, topY - 30 + Math.sin(a) * 8); }
  ctx.closePath(); ctx.fill();
  seats.filter(q => q.s >= 0).forEach(drawSeat);
}

function trackPt(cx, u) {
  const a = u * Math.PI * 2, yb = 262 + 76 * Math.sin(a);
  return { x: cx + 146 * Math.cos(a), y: yb - 62 * Math.pow(Math.max(0, Math.sin(a * 2 + 0.6)), 2), yb };
}

function drawCoasterRide(lot) {
  const r = lot.ride, cx = lot.ox + 200, th = lot.def.theme, riding = ridingOf(lot);
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 2;
  for (let k = 0; k < 40; k++) { const p = trackPt(cx, k / 40); ctx.beginPath(); ctx.moveTo(p.x, p.y + 3); ctx.lineTo(p.x, p.yb + 24); ctx.stroke(); }
  rr(cx - 46, 340, 92, 16, 4); ctx.fillStyle = '#c9d3dc'; ctx.fill();
  ctx.fillStyle = th; ctx.fillRect(cx - 46, 338, 92, 4);
  ctx.strokeStyle = th; ctx.lineWidth = 5; ctx.beginPath();
  for (let k = 0; k <= 120; k++) { const p = trackPt(cx, k / 120); if (k === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); }
  ctx.stroke();
  ctx.strokeStyle = '#fff6e8'; ctx.lineWidth = 1.5; ctx.stroke();
  const n = Math.ceil(lot.cap / 2);
  for (let k = n - 1; k >= 0; k--) {
    const p = trackPt(cx, r.prog - k * 0.03);
    if (riding[k * 2]) drawRider(p.x - 4, p.y - 9, riding[k * 2]);
    if (riding[k * 2 + 1]) drawRider(p.x + 4, p.y - 9, riding[k * 2 + 1]);
    rr(p.x - 10, p.y - 8, 20, 10, 3); ctx.fillStyle = k === 0 ? '#ffd23f' : BRIGHT[(k + 2) % 8]; ctx.fill();
  }
}

function drawHauntedRide(lot) {
  const { time } = state;
  const r = lot.ride, ox = lot.ox, cx = ox + 200, run = r.phase === 'running';
  for (const [tx, ty] of [[66, 340], [104, 352], [300, 348], [338, 338]]) {
    rr(ox + tx - 8, ty - 16, 16, 20, 8); ctx.fillStyle = '#9aa3ad'; ctx.fill();
    ctx.fillStyle = '#6f7983'; ctx.fillRect(ox + tx - 4, ty - 8, 8, 2);
  }
  ctx.fillStyle = '#2d2240'; ctx.beginPath(); ctx.moveTo(cx - 122, 196); ctx.lineTo(cx, 128); ctx.lineTo(cx + 122, 196); ctx.closePath(); ctx.fill();
  rr(cx - 108, 192, 216, 150, 4); ctx.fillStyle = '#4b3a6b'; ctx.fill();
  ctx.fillStyle = '#3a2c55'; for (let y = 204; y < 340; y += 14) ctx.fillRect(cx - 108, y, 216, 2);
  rr(cx + 52, 150, 38, 50, 3); ctx.fillStyle = '#3a2c55'; ctx.fill();
  ctx.fillStyle = '#2d2240'; ctx.beginPath(); ctx.moveTo(cx + 46, 152); ctx.lineTo(cx + 71, 112); ctx.lineTo(cx + 96, 152); ctx.closePath(); ctx.fill();
  const lit = k => run ? (Math.sin(time * 9 + k * 2.1) > -0.2 ? '#ffe066' : '#5a4a2a') : '#2a2040';
  [[-78, 214], [-30, 214], [30, 214], [78, 214], [-78, 270], [78, 270], [71, 166]].forEach(([wx, wy], k) => {
    rr(cx + wx - 11, wy, 22, 26, 3); ctx.fillStyle = lit(k); ctx.fill();
    ctx.fillStyle = '#2d2240'; ctx.fillRect(cx + wx - 1, wy, 2, 26); ctx.fillRect(cx + wx - 11, wy + 12, 22, 2);
  });
  rr(cx - 22, 284, 44, 58, 20); ctx.fillStyle = r.phase === 'loading' ? '#7a5aa8' : '#1d1530'; ctx.fill();
  if (run) {
    for (let k = 0; k < 3; k++) {
      const a = time * (0.9 + k * 0.2) + k * 2.1, gx = cx + Math.cos(a) * 140, gy = 230 + Math.sin(a * 1.3) * 50;
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(gx, gy, 10, Math.PI, 0); ctx.lineTo(gx + 10, gy + 12);
      for (let w = 0; w < 4; w++) ctx.lineTo(gx + 10 - (w + 0.5) * 5, gy + 12 - (w % 2 ? 0 : 4));
      ctx.lineTo(gx - 10, gy + 12); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#2a1a12'; ell(gx - 3, gy - 1, 1.6, 2.2); ctx.fill(); ell(gx + 3, gy - 1, 1.6, 2.2); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
  const inside = ridingOf(lot).length;
  if (inside) txt(inside + ' inside', cx, 270, 11, '#ffe066', '#1d1530');
}

function drawRide(lot) {
  switch (lot.type) {
    case 'ferris': drawFerris(lot); break;
    case 'carousel': drawCarouselRide(lot); break;
    case 'bumper': drawBumperRide(lot); break;
    case 'tower': drawTowerRide(lot); break;
    case 'swings': drawSwingsRide(lot); break;
    case 'coaster': drawCoasterRide(lot); break;
    default: drawHauntedRide(lot);
  }
}

function drawRideGround(lot) {
  const ox = lot.ox;
  const spPath = sprites['ride-ground-path'];
  if (spPath) ctx.drawImage(spPath, ox, lot.oy + 378);
  else {
    ctx.fillStyle = '#d2b47a'; rr(ox + 212, 378, 56, 340, 10); ctx.fill();
    rr(ox + 122, 378, 36, 340, 10); ctx.fill();
  }
  const isHaunted = lot.type === 'haunted';
  const spArea = sprites['ride-area:' + (isHaunted ? 'haunted' : 'normal')];
  if (spArea) ctx.drawImage(spArea, ox + 22, 122);
  else {
    const areaGrad = ctx.createRadialGradient(ox + 200, 250, 30, ox + 200, 250, 200);
    areaGrad.addColorStop(0, isHaunted ? '#8a9a78' : '#e8f0e0'); areaGrad.addColorStop(1, isHaunted ? '#6a7a58' : '#d0dcc8');
    rr(ox + 22, 122, 356, 256, 12); ctx.fillStyle = areaGrad; ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.04)';
    for (let i = 0; i < 18; i++) { ell(ox + 50 + (i * 61) % 310, 140 + (i * 47) % 220, 5, 2); ctx.fill(); }
  }
  for (let x = ox + 22; x <= ox + 378; x += 32) {
    const fg = ctx.createLinearGradient(x - 2, 0, x + 2, 0);
    fg.addColorStop(0, '#7a4020'); fg.addColorStop(0.5, '#9a5a30'); fg.addColorStop(1, '#7a4020');
    ctx.fillStyle = fg; rr(x - 2, 114, 4, 14, 1); ctx.fill();
  }
  ctx.fillStyle = '#8a4d24';
  ctx.fillRect(ox + 22, 118, 356, 3);
  ctx.fillRect(ox + 20, 118, 3, 260); ctx.fillRect(ox + 377, 118, 3, 260);
  ctx.fillRect(ox + 118, 100, 5, 22); ctx.fillRect(ox + 277, 100, 5, 22);
  drawSign(lot);
}

function drawRideFront(lot) {
  const ox = lot.ox;
  const segs = [[22, 122], [158, 225], [255, 378]];
  for (const [a, b] of segs) {
    ctx.fillStyle = '#a0632f'; ctx.fillRect(ox + a, 364, b - a, 4); ctx.fillRect(ox + a, 372, b - a, 3);
    for (let x = a; x <= b; x += 22) { ctx.fillStyle = '#8a4d24'; rr(ox + x - 2.5, 356, 5, 22, 1.5); ctx.fill(); }
    ctx.fillStyle = '#8a4d24'; rr(ox + b - 2.5, 356, 5, 22, 1.5); ctx.fill();
  }
  ctx.fillStyle = lot.def.theme; rr(ox + 222, 340, 36, 10, 4); ctx.fill();
  txt('In', ox + 240, 345, 8, '#ffffff');
  rr(ox + 121, 340, 38, 10, 4); ctx.fill();
  txt('Exit', ox + 140, 345, 8, '#ffffff');
}

function drawBooth(lot) {
  const { time } = state;
  const ox = lot.ox, x = ox + 300;
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; ell(x, 399, 20, 5); ctx.fill();
  rr(x - 16, 368, 32, 30, 4); ctx.fillStyle = lot.def.theme; ctx.fill();
  rr(x - 11, 373, 22, 12, 2); ctx.fillStyle = '#fff6e8'; ctx.fill();
  txt('$' + fmt(lot.ticket), x, 379, fitText('$' + fmt(lot.ticket), 20, 8), '#3b2416');
  for (let k = 0; k < 4; k++) { ctx.fillStyle = k % 2 ? '#fff6e8' : '#ffd23f'; ctx.beginPath(); ctx.moveTo(x - 20 + k * 10, 368); ctx.lineTo(x - 15 + k * 10, 356); ctx.lineTo(x - 10 + k * 10, 368); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = '#2f3540'; rr(x - 8, 388, 16, 6, 2); ctx.fill();
  ctx.fillStyle = lot.ride.phase === 'running' ? '#7dff9a' : lot.ride.phase === 'loading' ? '#ffd23f' : '#ff6f6f';
  ell(x, 391, 2.2, 2.2); ctx.fill();
}

function drawLockedLot(lot) {
  const ox = lot.ox;
  const spGround = sprites['locked-ground'];
  if (spGround) ctx.drawImage(spGround, ox + 24, 140);
  else {
    const dirtGrad = ctx.createRadialGradient(ox + 200, 260, 30, ox + 200, 260, 200);
    dirtGrad.addColorStop(0, '#e0c898'); dirtGrad.addColorStop(1, '#c8aa76');
    ctx.fillStyle = dirtGrad; rr(ox + 24, 140, 352, 240, 14); ctx.fill();
    ctx.fillStyle = 'rgba(120,85,40,0.12)';
    for (let i = 0; i < 14; i++) { ell(ox + 50 + (i * 53) % 300, 170 + (i * 37) % 190, 4, 2); ctx.fill(); }
  }
  const spFence = sprites['locked-fence'];
  if (spFence) ctx.drawImage(spFence, ox + 24, 352);
  else {
    const posts = [];
    for (let x = ox + 24; x <= ox + 376; x += 44) posts.push(x);
    ctx.strokeStyle = '#d9b77a'; ctx.lineWidth = 3; ctx.beginPath();
    for (let i = 0; i < posts.length - 1; i++) { ctx.moveTo(posts[i], 360); ctx.quadraticCurveTo((posts[i] + posts[i + 1]) / 2, 370, posts[i + 1], 360); }
    ctx.stroke();
    for (const x of posts) {
      const pg = ctx.createLinearGradient(x - 3, 0, x + 3, 0);
      pg.addColorStop(0, '#7a4020'); pg.addColorStop(0.5, '#9a5a30'); pg.addColorStop(1, '#7a4020');
      ctx.fillStyle = pg; rr(x - 3, 352, 6, 26, 2); ctx.fill();
    }
  }
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.fillRect(ox + 150, 240, 6, 60); ctx.fillRect(ox + 244, 240, 6, 60);
  const pg2 = ctx.createLinearGradient(ox + 150, 0, ox + 156, 0);
  pg2.addColorStop(0, '#7a4020'); pg2.addColorStop(0.5, '#9a5a30'); pg2.addColorStop(1, '#7a4020');
  ctx.fillStyle = pg2; ctx.fillRect(ox + 150, 240, 6, 60); ctx.fillRect(ox + 244, 240, 6, 60);
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; rr(ox + 113, 200, 180, 74, 12); ctx.fill();
  rr(ox + 110, 196, 180, 74, 12); ctx.fillStyle = '#fff6e8'; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = lot.def.theme; ctx.stroke();
  drawIcon(lot.def.icon, ox + 200, 218, 24);
  txt(lot.name, ox + 200, 242, fitText(lot.name, 160, 17), '#3b2416');
  txt(lot.kind === 'hr' ? 'Open to hire staff' : lot.kind === 'ride' ? 'Ride coming soon' : 'Stand coming soon', ox + 200, 259, 11, '#7a5a45', null, 600);
}

function drawPad(p) {
  const { time } = state;
  const paid = S.paid[p.id] || 0, f = paid / p.price, h = p.half, big = p.kind === 'open';
  const staffLot = p.kind === 'staff' ? lotByKey(p.key) : null;
  const locked = p.kind === 'staff' && (!hrOpen() || (staffLot && !hrFor(staffLot)));
  const lab = locked ? (!hrOpen() ? 'Open HR Office first' : 'Upgrade HR for this plot') : p.label;
  ctx.save();
  ctx.translate(p.x, p.y);
  const sc = 1 + 0.025 * Math.sin(time * 4);
  ctx.scale(sc, sc);
  const rad = big ? 14 : 10;
  rr(-h, -h, h * 2, h * 2, rad); ctx.fillStyle = big ? 'rgba(255,214,63,0.35)' : locked ? 'rgba(40,40,40,0.35)' : 'rgba(255,255,255,0.32)'; ctx.fill();
  if (f > 0) { ctx.save(); rr(-h, -h, h * 2, h * 2, rad); ctx.clip(); ctx.fillStyle = 'rgba(76,217,100,0.8)'; ctx.fillRect(-h, h - h * 2 * f, h * 2, h * 2 * f); ctx.restore(); }
  ctx.setLineDash([7, 5]); ctx.lineDashOffset = -time * 12; ctx.lineWidth = big ? 4 : 3; ctx.strokeStyle = '#ffffff';
  rr(-h, -h, h * 2, h * 2, rad); ctx.stroke(); ctx.setLineDash([]);
  drawIcon(locked ? 'lock' : p.icon, 0, big ? -10 : -7, big ? 30 : 22);
  const pt = '$' + fmt(p.price - paid);
  txt(pt, 0, big ? 20 : 15, fitText(pt, h * 2 - 4, big ? 17 : 14), '#ffffff', '#3b2416');
  const ls = big ? 13 : 11;
  ctx.font = '600 ' + ls + 'px ' + FONT;
  const w = ctx.measureText(lab).width + 14;
  rr(-w / 2, -h - 18, w, ls + 6, (ls + 6) / 2); ctx.fillStyle = locked ? 'rgba(160,40,40,0.85)' : 'rgba(59,36,22,0.78)'; ctx.fill();
  txt(lab, 0, -h - 18 + (ls + 6) / 2, ls, '#ffffff', null, 600);
  if (player.padStayId === p.id && player.padStayT < 0.5 && !locked) {
    const prog = clamp(player.padStayT / 0.5, 0, 1);
    const cr = h + 6;
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(76,217,100,0.9)'; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, 0, cr, -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2); ctx.stroke();
    ctx.lineCap = 'butt';
  }
  ctx.restore();
}

function drawGuide() {
  const { time } = state;
  if (S.tut >= TUT.length) return;
  const p = TUT[S.tut][1]();
  const pulse = (time * 1.5) % 1;
  ctx.strokeStyle = 'rgba(255,225,77,' + (1 - pulse) + ')'; ctx.lineWidth = 3;
  ell(p.x, p.y, 14 + pulse * 14, 6 + pulse * 6); ctx.stroke();
  const ay = p.y - 70 - Math.abs(Math.sin(time * 4)) * 10;
  ctx.fillStyle = '#ffe14d'; ctx.strokeStyle = '#3b2416'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(p.x - 7, ay - 18); ctx.lineTo(p.x + 7, ay - 18); ctx.lineTo(p.x + 7, ay - 6);
  ctx.lineTo(p.x + 14, ay - 6); ctx.lineTo(p.x, ay + 8); ctx.lineTo(p.x - 14, ay - 6); ctx.lineTo(p.x - 7, ay - 6); ctx.closePath();
  ctx.stroke(); ctx.fill();
}

function drawAlert(x, y) {
  const { time } = state;
  y += Math.sin(time * 6) * 3;
  ell(x, y, 11, 11); ctx.fillStyle = '#ef4b5b'; ctx.fill();
  txt('!', x, y + 1, 16, '#ffffff');
}

function drawFx() {
  const { flyers, confetti, floats, time } = state;
  for (const f of flyers) {
    if (f.t < 0) continue;
    const p = clamp(f.t / f.dur, 0, 1), tx = f.tgt.x, ty = f.tgt.y - f.lift;
    const x = lerp(f.x0, tx, p), y = lerp(f.y0, ty, p) - Math.sin(p * Math.PI) * 30;
    if (f.type === 'item') drawItem(f.item, x, y, 1, f.boost, f.idx); else if (f.type === 'trash') drawTrashSprite(x, y, 1); else drawBill(x, y);
  }
  for (const c of confetti) {
    ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rot);
    ctx.globalAlpha = clamp(1.4 - c.t, 0, 1); ctx.fillStyle = c.c; ctx.fillRect(-3, -1.5, 6, 3);
    ctx.restore();
  }
  for (const f of floats) {
    ctx.globalAlpha = clamp(1 - f.t / f.life, 0, 1) * (f.t < 0.1 ? f.t / 0.1 : 1);
    txt(f.text, f.x, f.y, f.size, f.color, '#3b2416');
    ctx.globalAlpha = 1;
  }
}

function drawPlayer() {
  const lot = lotByKey(player.carryType);
  const item = player.carryType === 'trash' ? 'trash' : player.carryType === 'prize' ? 'plush' : lot ? lot.type : 'donut';
  if (playerImg.ready) {
    const row = dirCol4(player);
    const col = player.moving ? 1 + (Math.floor(player.walk) % 3) : 0;
    drawSpriteSheet(playerImg, player, row, col, 48, 48);
    drawSpriteItems(player, player.carry, item, lot ? lot.boosted : false);
    if (player.carry >= player.cap) {
      const bob = player.moving ? Math.abs(Math.sin(player.walk)) * 2 : 0;
      const ih = ITEM_H[item] || 4.2;
      txt('MAX', player.x, player.y - 30 - bob - player.carry * ih, 11, '#ffffff', '#ef4b5b');
    }
  } else {
    drawPerson(player, { shirt: '#ef4b5b', skin: '#f1c7a1', hair: '#3a2416', apron: '#fff6e8', hat: 'cap', hatColor: '#ef4b5b',
      stack: player.carry, item, boost: lot ? lot.boosted : false, max: player.carry >= player.cap });
  }
}

function drawSpriteShadow(x, y) {
  const shGrad = ctx.createRadialGradient(x, y, 0, x, y, 12);
  shGrad.addColorStop(0, 'rgba(0,0,0,0.22)');
  shGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = shGrad;
  ctx.beginPath(); ctx.ellipse(x, y, 12, 5, 0, 0, Math.PI * 2); ctx.fill();
}

function dirCol4(e) {
  const dir = e.lastDir || 'down';
  if (dir === 'down') return 0;
  if (dir === 'left') return 1;
  if (dir === 'right') return 2;
  return 3;
}

function drawSpriteSheet(img, e, row, col, drawW, drawH) {
  const FW = 1254 / 4, FH = 1254 / 4;
  drawSpriteShadow(e.x, e.y);
  ctx.drawImage(img, col * FW, row * FH, FW, FH, e.x - drawW / 2, e.y - drawH + 6, drawW, drawH);
}

function drawSpriteItems(e, n, item, boosted) {
  if (n <= 0) return;
  const bob = e.moving ? Math.abs(Math.sin(e.walk)) * 2 : 0;
  const ih = ITEM_H[item] || 4.2;
  for (let i = 0; i < n; i++) drawItem(item, e.x, e.y - 17 - bob - i * ih, 1, boosted, i);
}

function drawStaff(w) {
  const lot = w.lot, th = lot.def.theme;
  if (w.role === 'helper' && chefImg.ready) {
    const row = dirCol4(w);
    const col = w.moving ? 1 + (Math.floor(w.walk) % 3) : 0;
    drawSpriteSheet(chefImg, w, row, col, 48, 48);
    drawSpriteItems(w, w.carry, lot.type, lot.boosted);
  } else if (staffImg.ready && (w.role === 'cashier' || w.role === 'operator' || w.role === 'barker' || w.role === 'runner' || w.role === 'manager')) {
    let staffRow;
    if (w.role === 'cashier') staffRow = 0;
    else if (w.role === 'operator') staffRow = 1;
    else if (w.role === 'barker' || w.role === 'runner') staffRow = 2;
    else staffRow = 3;
    const col = dirCol4(w);
    drawSpriteSheet(staffImg, w, staffRow, col, 48, 48);
    if (w.role === 'runner') drawSpriteItems(w, w.carry, 'plush', lot.boosted);
    if (w.role === 'manager' && w.carry > 0) drawSpriteItems(w, w.carry, 'trash', false);
  } else {
    if (w.role === 'helper') drawPerson(w, { shirt: '#fff6e8', skin: '#c98c62', hair: '#1d1d1d', apron: th, hat: 'chef', stack: w.carry, item: lot.type, boost: lot.boosted });
    else if (w.role === 'cashier') drawPerson(w, { shirt: th, skin: '#e8b48e', hair: '#8a3b22', apron: '#fff6e8', hat: 'cap', hatColor: '#ffd23f' });
    else if (w.role === 'operator') drawPerson(w, { shirt: th, skin: '#9a6340', hair: '#1d1d1d', hat: 'cap', hatColor: '#ffd23f' });
    else if (w.role === 'barker') drawPerson(w, { shirt: '#ef4b5b', skin: '#e8b48e', hair: '#1d1d1d', apron: '#fff6e8', hat: 'cap', hatColor: '#2f3540' });
    else if (w.role === 'runner') drawPerson(w, { shirt: th, skin: '#f6d2b5', hair: '#c8902f', hat: 'bandana', hatColor: '#ffd23f', stack: w.carry, item: 'plush', boost: lot.boosted });
    else if (w.role === 'manager') drawPerson(w, { shirt: '#2f3540', skin: '#f1c7a1', hair: '#5a5a5a', tie: '#ef4b5b', clip: true });
    else drawPerson(w, { shirt: '#2ec4a6', skin: '#f6d2b5', hair: '#6b3f1f', apron: '#ffffff', hat: 'bandana', hatColor: '#ffd23f', stack: w.carry, item: 'trash' });
  }
}

function bubble(x, y) {
  const sp = sprites['bubble'];
  if (sp) { ctx.drawImage(sp, x - sp._ox, y - sp._oy); return; }
  rr(x - 22, y - 12, 44, 24, 10); ctx.fillStyle = '#ffffff'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 5, y + 11); ctx.lineTo(x, y + 18); ctx.lineTo(x + 5, y + 11); ctx.fill();
}

function drawBalloon(x, y, color) {
  const { time } = state;
  const bx = x + 12, byy = y - 70 + Math.sin(time * 2 + x) * 2;
  ctx.strokeStyle = 'rgba(60,40,30,0.6)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x + 8, y - 18); ctx.quadraticCurveTo(x + 14, y - 40, bx, byy + 10); ctx.stroke();
  ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(bx, byy, 8, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.ellipse(bx - 3, byy - 4, 2, 3, 0, 0, Math.PI * 2); ctx.fill();
}

function drawCharWalk(e, charIdx, drawW, drawH) {
  const def = CHAR_DEFS[charIdx];
  if (!def || !def.walkImg.ready) return false;
  const FW = 1254 / 4, FH = 1254 / 4;
  const dir = e.lastDir || 'down';
  let row, col, flip = false;
  if (dir === 'down') {
    row = def.wr;
    col = e.moving ? (Math.sin(e.walk * 4) > 0 ? 1 : 0) : 0;
  } else if (dir === 'up') {
    row = def.wr;
    col = e.moving ? (Math.sin(e.walk * 4) > 0 ? 3 : 2) : 2;
  } else {
    row = def.wr + 1;
    col = e.moving ? (Math.floor(e.walk) % 4) : 0;
    if (dir === 'right') flip = true;
  }
  drawSpriteShadow(e.x, e.y);
  if (flip) {
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.scale(-1, 1);
    ctx.drawImage(def.walkImg, col * FW, row * FH, FW, FH, -drawW / 2, -drawH + 6, drawW, drawH);
    ctx.restore();
  } else {
    ctx.drawImage(def.walkImg, col * FW, row * FH, FW, FH, e.x - drawW / 2, e.y - drawH + 6, drawW, drawH);
  }
  return true;
}

function drawCharSit(e, charIdx, drawW, drawH) {
  const def = CHAR_DEFS[charIdx];
  if (!def || !def.sitImg.ready) return false;
  const FW = 1774 / 4, FH = 887 / 2;
  const dir = e.lastDir || 'down';
  let col;
  if (dir === 'down') col = 0;
  else if (dir === 'left') col = 1;
  else if (dir === 'right') col = 2;
  else col = 3;
  const row = def.sr;
  drawSpriteShadow(e.x, e.y);
  ctx.drawImage(def.sitImg, col * FW, row * FH, FW, FH, e.x - drawW / 2, e.y - drawH + 6, drawW, drawH);
  return true;
}

function drawCustomer(c) {
  const { time } = state;
  if (c.state === 'riding' || (c.state === 'leaving' && c.exitDelay > 0)) return;
  const lot = c.lot, food = lot.kind === 'food';
  ctx.globalAlpha = clamp(c.alpha, 0, 1);
  let stack = 0, item = lot.type, idx = 0;
  if (food && (c.state === 'queue' || c.state === 'toTable')) stack = c.got;
  if (lot.kind === 'game' && c.prizeIdx >= 0) { stack = 1; item = 'plush'; idx = c.prizeIdx; }
  const isSitting = c.state === 'eating';
  let drawn = false;
  if (c.spriteIdx != null) {
    if (isSitting) drawn = drawCharSit(c, c.spriteIdx, 44, 44);
    else drawn = drawCharWalk(c, c.spriteIdx, 44, 44);
  }
  if (drawn) {
    if (stack > 0) drawSpriteItems(c, stack, item, lot.boosted);
    if (c.balloon) drawBalloon(c.x, c.y, c.balloon);
  } else {
    drawPerson(c, { shirt: c.shirt, skin: c.skin, hair: c.hair, sit: isSitting, stack, item, idx, boost: lot.boosted, balloon: c.balloon });
  }
  const by = c.y - 70 + Math.sin(time * 4) * 1.5;
  if (food && c.atFront && c.got < c.want) {
    bubble(c.x, by);
    if (c.noSeat && !c.seat) { drawIcon('chair', c.x - 8, by, 14); txt('?', c.x + 10, by + 1, 14, '#ef4b5b'); }
    else { drawItem(lot.type, c.x - 8, by + (tallItem(lot.type) ? 4 : 1), 1, lot.boosted); txt('×' + (c.want - c.got), c.x + 9, by + 1, 13, '#3b2416'); }
  } else if (lot.kind === 'game' && c.atFront && c.noPrize) {
    bubble(c.x, by); drawPlushSprite(c.x - 8, by + 5, 1, false, 1); txt('?', c.x + 10, by + 1, 14, '#ef4b5b');
  }
  ctx.globalAlpha = 1;
}

const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
const arc = (q, x0, y0, x1, y1, h) => ({ x: lerp(x0, x1, q), y: lerp(y0, y1, q) - Math.sin(q * Math.PI) * h });

function bottle(x, y, col, rot) {
  ctx.save(); ctx.translate(x, y); if (rot) ctx.rotate(rot);
  rr(-3.5, -12, 7, 12, 2); ctx.fillStyle = col; ctx.fill();
  ctx.fillRect(-1.3, -16, 2.6, 5);
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(-2.2, -10, 1.2, 7);
  ctx.restore();
}

function drawStation(lot, st) {
  const { time } = state;
  const sx = st.lx, c = st.occ && st.occ.state === 'playing' ? st.occ : null;
  const p = c ? c.t / lot.playT : -1, win = !!(c && c.win), th = lot.def.theme;
  switch (lot.type) {
    case 'ringtoss': {
      for (let r = 0; r < 2; r++) for (let k = 0; k < 3; k++) bottle(sx - 16 + k * 16, 276 + r * 18, '#3fae6b');
      if (c) {
        const q = seg(p, 0.15, 0.55), tx = win ? sx : sx + 22, ty = win ? 262 : 306, a = q < 1 ? arc(q, sx, 360, tx, ty, 50) : { x: tx, y: ty };
        ctx.strokeStyle = '#ff4d6d'; ctx.lineWidth = 2.5; ell(a.x, a.y, 6, 2.5); ctx.stroke();
      }
      break;
    }
    case 'balloon': {
      rr(sx - 30, 232, 60, 84, 4); ctx.fillStyle = '#c99a5c'; ctx.fill();
      for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) {
        const bx = sx - 18 + k * 18, by = 250 + r * 24, i = r * 3 + k;
        if (i === 4 && win && p > 0.5) { ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 2; for (let a = 0; a < 6; a++) { ctx.beginPath(); ctx.moveTo(bx + Math.cos(a) * 4, by + Math.sin(a) * 4); ctx.lineTo(bx + Math.cos(a) * 9, by + Math.sin(a) * 9); ctx.stroke(); } continue; }
        ctx.fillStyle = BRIGHT[(i + st.lx) % 8]; ell(bx, by, 7, 8.5); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; ell(bx - 2.5, by - 3, 1.6, 2.4); ctx.fill();
      }
      if (c) {
        const q = seg(p, 0.2, 0.5), tx = win ? sx : sx + 9, ty = win ? 274 : 286, a = q < 1 ? arc(q, sx, 360, tx, ty, 20) : { x: tx, y: ty };
        ctx.strokeStyle = '#2f3540'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(a.x, a.y + 9); ctx.stroke();
        ctx.fillStyle = '#ef4b5b'; ctx.fillRect(a.x - 2, a.y + 7, 4, 3);
      }
      break;
    }
    case 'duck': {
      rr(sx - 32, 290, 64, 28, 8); ctx.fillStyle = '#5fb8ff'; ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1;
      for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(sx - 26 + k * 18, 312); ctx.lineTo(sx - 18 + k * 18, 312); ctx.stroke(); }
      for (let k = 0; k < 3; k++) {
        const dx = sx - 28 + ((time * 16 + k * 21 + st.lx) % 56);
        ctx.fillStyle = '#ffd23f'; ell(dx, 300, 6, 4); ctx.fill(); ell(dx + 4, 295, 3.2, 3.2); ctx.fill();
        ctx.fillStyle = '#ff9a3c'; ctx.fillRect(dx + 6.5, 294.5, 3, 1.6);
      }
      if (c && p > 0.3) {
        const up = seg(p, 0.3, 0.7) * 44, dy = 300 - up;
        ctx.strokeStyle = '#2f3540'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(sx, 236); ctx.lineTo(sx, dy - 6); ctx.stroke();
        ctx.fillStyle = '#ffd23f'; ell(sx, dy, 6, 4); ctx.fill(); ell(sx + 4, dy - 5, 3.2, 3.2); ctx.fill();
        if (p > 0.7) txt(win ? '★' : '×', sx, dy + 9, 10, win ? '#ffd23f' : '#ef4b5b', '#3b2416');
      }
      break;
    }
    case 'bottles': {
      rr(sx - 16, 300, 32, 8, 2); ctx.fillStyle = '#9a5a2c'; ctx.fill(); ctx.fillRect(sx - 2, 308, 4, 24);
      const fell = c && p > 0.45, q = c ? seg(p, 0.2, 0.45) : 0;
      if (fell) {
        bottle(sx - 12, 306, '#ffffff', -1.4); if (win) { bottle(sx + 12, 306, '#ffffff', 1.4); bottle(sx, 300, '#ffffff', 1.5); } else { bottle(sx + 7, 300, '#ffffff'); }
      } else { bottle(sx - 7, 300, '#ffffff'); bottle(sx + 7, 300, '#ffffff'); bottle(sx, 285, '#ffffff'); }
      ctx.fillStyle = '#ef4b5b';
      if (c && q < 1) { const a = arc(q, sx, 360, sx, 284, 26); ell(a.x, a.y, 3.5, 3.5); ctx.fill(); }
      break;
    }
    case 'hoops': {
      ctx.fillStyle = '#9aa3ad'; ctx.fillRect(sx - 2, 252, 4, 82);
      rr(sx - 20, 228, 40, 26, 3); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.strokeStyle = '#9aa3ad'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.strokeStyle = '#ef4b5b'; ctx.strokeRect(sx - 7, 238, 14, 10);
      ctx.strokeStyle = '#ff7a00'; ctx.lineWidth = 2; ell(sx, 258, 9, 3); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 1; for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(sx + k * 4, 259); ctx.lineTo(sx + k * 2.5, 270); ctx.stroke(); }
      if (c) {
        const q = seg(p, 0.15, 0.6);
        let a = arc(q, sx, 360, win ? sx : sx + 11, 254, 60);
        if (q >= 1) a = win ? { x: sx, y: lerp(258, 300, seg(p, 0.6, 0.75)) } : { x: sx + 11 + seg(p, 0.6, 0.8) * 12, y: lerp(254, 320, seg(p, 0.6, 0.8)) };
        ctx.fillStyle = '#ff7a00'; ell(a.x, a.y, 4.5, 4.5); ctx.fill();
        ctx.strokeStyle = '#7a3a00'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(a.x - 4.5, a.y); ctx.lineTo(a.x + 4.5, a.y); ctx.stroke();
      }
      break;
    }
    case 'water': {
      for (let r = 3; r >= 1; r--) { ctx.fillStyle = r % 2 ? '#ef4b5b' : '#ffffff'; ell(sx - 8, 262, r * 4, r * 4); ctx.fill(); }
      rr(sx + 14, 234, 10, 80, 5); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fill();
      const lvl2 = c ? seg(p, 0.1, 0.85) * (win ? 1 : 0.65) : 0;
      if (lvl2 > 0) { rr(sx + 15, 313 - 78 * lvl2, 8, 78 * lvl2, 4); ctx.fillStyle = '#3fa7ff'; ctx.fill(); }
      ctx.fillStyle = win && p > 0.85 ? '#ffe066' : '#d9a400'; ell(sx + 19, 230, 5, 4); ctx.fill();
      if (c && p < 0.85) { ctx.strokeStyle = 'rgba(63,167,255,0.85)'; ctx.lineWidth = 2; ctx.setLineDash([4, 3]); ctx.lineDashOffset = -time * 40; ctx.beginPath(); ctx.moveTo(sx - 2, 360); ctx.lineTo(sx - 8, 264); ctx.stroke(); ctx.setLineDash([]); }
      break;
    }
    case 'strength': {
      rr(sx - 4, 232, 8, 96, 3); ctx.fillStyle = '#ffffff'; ctx.fill();
      ctx.fillStyle = th; for (let y = 244; y < 324; y += 16) ctx.fillRect(sx - 4, y, 8, 2);
      const ring = win && p > 0.5 && p < 0.8;
      ctx.fillStyle = ring ? '#ffe066' : '#d9a400'; ell(sx, 228, 8, 6); ctx.fill();
      if (ring) { ctx.strokeStyle = '#ffe066'; ctx.lineWidth = 2; for (let a = 0; a < 5; a++) { const an = -Math.PI + a * Math.PI / 4; ctx.beginPath(); ctx.moveTo(sx + Math.cos(an) * 11, 228 + Math.sin(an) * 9); ctx.lineTo(sx + Math.cos(an) * 17, 228 + Math.sin(an) * 14); ctx.stroke(); } }
      let h = 0;
      if (c) { const up = seg(p, 0.2, 0.5) * (win ? 92 : 56); h = p > 0.7 ? up * (1 - seg(p, 0.7, 0.95)) : up; }
      rr(sx - 7, 324 - h, 14, 7, 3); ctx.fillStyle = '#ef4b5b'; ctx.fill();
      rr(sx - 14, 330, 28, 6, 2); ctx.fillStyle = '#5b6573'; ctx.fill();
      break;
    }
    case 'whack': {
      rr(sx - 30, 284, 60, 36, 6); ctx.fillStyle = '#9a6a42'; ctx.fill();
      for (let r = 0; r < 2; r++) for (let k = 0; k < 3; k++) {
        const hx = sx - 18 + k * 18, hy = 294 + r * 14, i = r * 3 + k;
        ctx.fillStyle = '#3a2416'; ell(hx, hy, 6, 3); ctx.fill();
        if (Math.sin(time * 3.2 + i * 1.7 + st.lx) > 0.55) { ctx.fillStyle = '#8a5a3c'; ell(hx, hy - 4, 4.5, 4.5); ctx.fill(); ctx.fillStyle = '#2a1a12'; ell(hx - 1.4, hy - 5, 0.8, 0.8); ctx.fill(); ell(hx + 1.4, hy - 5, 0.8, 0.8); ctx.fill(); ctx.fillStyle = '#ff9cc4'; ell(hx, hy - 3, 1.2, 0.9); ctx.fill(); }
      }
      if (c && p < 0.9) {
        const sw = Math.abs(Math.sin(p * 30));
        ctx.save(); ctx.translate(sx + 14, 300); ctx.rotate(-0.4 - sw * 0.9);
        ctx.fillStyle = '#c99a5c'; ctx.fillRect(-1.5, -22, 3, 22); rr(-6, -28, 12, 8, 3); ctx.fillStyle = '#ef4b5b'; ctx.fill();
        ctx.restore();
      }
      if (c && p > 0.85 && win) txt('★', sx, 278, 12, '#ffd23f', '#3b2416');
      break;
    }
    case 'skee': {
      ctx.fillStyle = '#d9b77a'; ctx.beginPath(); ctx.moveTo(sx - 14, 334); ctx.lineTo(sx + 14, 334); ctx.lineTo(sx + 22, 246); ctx.lineTo(sx - 22, 246); ctx.closePath(); ctx.fill();
      [18, 12, 6].forEach((r, i) => { ctx.fillStyle = i % 2 ? '#ffd23f' : th; ell(sx, 256, r, r * 0.55); ctx.fill(); });
      ctx.fillStyle = '#3a2416'; ell(sx, 256, 3, 1.8); ctx.fill();
      if (c) { const q = seg(p, 0.15, 0.7), y = lerp(330, win ? 256 : 266, q), x = sx + Math.sin(q * 6) * 3 + (win ? 0 : q * 9); ctx.fillStyle = '#8a4d24'; ell(x, y, 3.6, 3.6); ctx.fill(); }
      break;
    }
    case 'shooting': {
      rr(sx - 32, 236, 64, 72, 4); ctx.fillStyle = '#20345a'; ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.25)'; for (let k = 0; k < 5; k++) ell(sx - 24 + k * 12, 248, 1, 1), ctx.fill();
      ctx.fillStyle = '#c9d3dc'; ctx.fillRect(sx - 32, 284, 64, 3);
      for (let k = 0; k < 3; k++) {
        const dx = sx - 28 + ((time * 22 + k * 21 + st.lx) % 56);
        if (k === 0 && win && p > 0.5) { ctx.fillStyle = '#8a95a3'; ctx.fillRect(dx - 6, 282, 12, 2); continue; }
        ctx.fillStyle = '#ffd23f'; ell(dx, 278, 6, 4.5); ctx.fill(); ell(dx + 4, 272, 3, 3); ctx.fill();
      }
      if (c && p < 0.6 && Math.floor(p * 20) % 2) { ctx.fillStyle = '#fff4b0'; ell(sx, 330, 3, 3); ctx.fill(); }
      break;
    }
    case 'weight': {
      rr(sx - 16, 300, 32, 7, 2); ctx.fillStyle = '#5b6573'; ctx.fill();
      ctx.fillStyle = '#ffffff'; ell(sx, 268, 18, 18); ctx.fill(); ctx.strokeStyle = '#2f3540'; ctx.lineWidth = 2; ctx.stroke();
      for (let k = 0; k < 9; k++) { const a = -2.4 + k * 0.6; ctx.beginPath(); ctx.moveTo(sx + Math.cos(a) * 14, 268 + Math.sin(a) * 14); ctx.lineTo(sx + Math.cos(a) * 17, 268 + Math.sin(a) * 17); ctx.stroke(); }
      const na = c ? lerp(-2.4, 0.6 + Math.sin(st.lx) * 0.5, seg(p, 0.1, 0.6)) : -2.4;
      ctx.strokeStyle = '#ef4b5b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx, 268); ctx.lineTo(sx + Math.cos(na) * 13, 268 + Math.sin(na) * 13); ctx.stroke();
      rr(sx - 22, 232, 44, 14, 4); ctx.fillStyle = '#fff6e8'; ctx.fill();
      txt(c && p > 0.6 ? (win ? 'Missed!' : 'Got it!') : 'Guess?', sx, 239.5, 8, c && p > 0.6 ? (win ? '#2e8b45' : '#ef4b5b') : '#3b2416');
      break;
    }
    case 'plinko': {
      rr(sx - 28, 230, 56, 100, 4); ctx.fillStyle = '#f6f0ff'; ctx.fill();
      ctx.fillStyle = '#9aa3ad';
      for (let r = 0; r < 6; r++) for (let k = 0; k < 5; k++) { const px = sx - 20 + k * 10 + (r % 2) * 5; if (px > sx + 24) continue; ell(px, 242 + r * 12, 1.4, 1.4); ctx.fill(); }
      for (let k = 0; k < 5; k++) { rr(sx - 25 + k * 10, 316, 9, 12, 1); ctx.fillStyle = k === 2 ? '#ffd23f' : '#e2d6ff'; ctx.fill(); }
      if (c) { const q = seg(p, 0.05, 0.85), y = 234 + q * 86, x = sx + Math.sin(q * 16) * 8 * (1 - q) + (win ? 0 : 20 * q); ctx.fillStyle = th; ell(x, y, 3.6, 3.6); ctx.fill(); }
      break;
    }
    case 'coin': {
      for (let r = 0; r < 2; r++) for (let k = 0; k < 3; k++) {
        const dx = sx - 18 + k * 18, dy = 272 + r * 22;
        ctx.fillStyle = 'rgba(160,220,255,0.85)'; ell(dx, dy, 8, 4); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.8)'; ell(dx - 2, dy - 1, 3, 1.2); ctx.fill();
      }
      if (c) {
        const q = seg(p, 0.2, 0.5), tx = win ? sx : sx + 26, ty = win ? 272 : 310, a = q < 1 ? arc(q, sx, 360, tx, ty, 40) : { x: tx, y: ty };
        ctx.fillStyle = '#ffd23f'; ell(a.x, a.y, 3.5, 2.2); ctx.fill(); ctx.strokeStyle = '#c99400'; ctx.lineWidth = 0.8; ctx.stroke();
      }
      break;
    }
    default: {
      rr(sx - 30, 262, 60, 46, 12); ctx.fillStyle = '#5fb8ff'; ctx.fill();
      ctx.fillStyle = '#43a047'; [[sx - 15, 276], [sx + 12, 282], [sx - 2, 296]].forEach(([lx, ly]) => { ell(lx, ly, 8, 4); ctx.fill(); });
      ctx.fillStyle = '#8a4d24'; rr(sx - 6, 322, 12, 6, 2); ctx.fill(); ctx.fillRect(sx - 1, 314, 2, 9);
      let fx = sx, fy = 316, splash = false;
      if (c) {
        const q = seg(p, 0.2, 0.6), tx = win ? sx - 15 : sx + 22, ty = win ? 274 : 300;
        const a = q < 1 ? arc(q, sx, 316, tx, ty, 34) : { x: tx, y: ty }; fx = a.x; fy = a.y; splash = !win && q >= 1;
      }
      if (splash) { ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 1.5; ell(fx, fy, 6 + (time * 10 % 4), 2.5); ctx.stroke(); }
      else { ctx.fillStyle = '#66bb6a'; ell(fx, fy, 5, 3.6); ctx.fill(); ctx.fillStyle = '#ffffff'; ell(fx - 2, fy - 3, 1.5, 1.5); ctx.fill(); ell(fx + 2, fy - 3, 1.5, 1.5); ctx.fill(); }
    }
  }
  if (c && p > 0.8 && win && lot.type !== 'whack') txt('WIN', sx, 224, 10, '#ffd23f', '#3b2416');
}

function drawGameBooth(lot) {
  const { time } = state;
  const d = lot.def, th = d.theme;
  const sp = sprites['game-booth:' + lot.type];
  if (sp) {
    ctx.drawImage(sp, 0, 108);
    ctx.fillStyle = '#7a4420'; ctx.fillRect(36, 172, 328, 4); ctx.fillRect(36, 206, 328, 4);
  } else {
    ctx.fillStyle = '#f7efe2'; ctx.fillRect(30, 158, 340, 184);
    ctx.fillStyle = '#b5773f'; ctx.fillRect(14, 126, 372, 100);
    ctx.strokeStyle = 'rgba(80,40,15,0.3)'; ctx.lineWidth = 1;
    for (let y = 134; y < 226; y += 10) { ctx.beginPath(); ctx.moveTo(14, y); ctx.lineTo(386, y); ctx.stroke(); }
    ctx.fillStyle = '#7a4420'; ctx.fillRect(36, 172, 328, 4); ctx.fillRect(36, 206, 328, 4);
    ctx.fillStyle = '#a0632f'; ctx.fillRect(14, 126, 16, 254); ctx.fillRect(370, 126, 16, 254);
    for (let i = 0, x = 10; x < 390; i++, x += 20) { ctx.fillStyle = i % 2 ? '#fff6e8' : th; ctx.fillRect(x, 108, 20, 24); ell(x + 10, 132, 10, 8); ctx.fill(); }
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(10, 108, 380, 4);
    ctx.fillStyle = '#c4874b'; for (const x of [40, 120, 200, 280, 360]) ctx.fillRect(x - 2, 222, 4, 118);
  }
  for (let i = 0; i < lot.prizes; i++) { const row = Math.floor(i / 12), col = i % 12; drawPlushSprite(52 + col * 27, row ? 206 : 172, 1.25, lot.boosted, i); }
  if (lot.prizes === 0) txt('Out of prizes', 200, 190, 12, '#fff6e8', '#7a4420');
  for (const st of lot.stations) {
    if (st.on) drawStation(lot, st);
    else {
      ctx.fillStyle = th; rr(st.lx - 36, 226, 72, 112, 4); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.18)'; for (let k = 0; k < 4; k++) ctx.fillRect(st.lx - 32 + k * 18, 226, 6, 112);
      txt('Closed', st.lx, 282, 11, '#ffffff', 'rgba(0,0,0,0.35)');
    }
  }
}

function drawGameCounter(lot) {
  const th = lot.def.theme;
  rr(26, 338, 348, 18, 4); ctx.fillStyle = '#f3c48d'; ctx.fill();
  ctx.fillStyle = th; ctx.fillRect(26, 354, 348, 26);
  ctx.fillStyle = '#fff6e8'; for (let x = 26; x < 374; x += 24) ctx.fillRect(x + 12, 354, Math.min(12, 374 - x - 12), 26);
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(26, 354, 348, 3);
  rr(150, 360, 100, 16, 8); ctx.fillStyle = '#fff6e8'; ctx.fill();
  txt('$' + fmt(lot.price) + ' a game', 200, 368, fitText('$' + fmt(lot.price) + ' a game', 92, 10), '#3b2416');
}

function drawCrate(lot) {
  const c = lot.crate, x = c.x, y = c.y;
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; ell(x, y + 8, 22, 6); ctx.fill();
  for (let i = 0; i < Math.min(c.stock, 6); i++) drawPlushSprite(x - 12 + (i % 3) * 12, y - 10 - Math.floor(i / 3) * 6, 1, lot.boosted, i + 2);
  rr(x - 20, y - 12, 40, 20, 3); ctx.fillStyle = '#c9884a'; ctx.fill();
  ctx.fillStyle = '#9a5a2c'; ctx.fillRect(x - 20, y - 5, 40, 2); ctx.fillRect(x - 20, y + 2, 40, 2);
  txt('Prizes', x, y - 1, 8, '#fff6e8', null, 700);
  if (c.stock < CRATE_CAP) { ctx.fillStyle = 'rgba(0,0,0,0.25)'; rr(x - 16, y + 11, 32, 4, 2); ctx.fill(); ctx.fillStyle = '#ffd23f'; rr(x - 16, y + 11, 32 * (c.t / 1.8), 4, 2); ctx.fill(); }
  else txt(c.stock + '', x + 24, y - 14, 9, '#ffffff', '#3b2416');
}

function drawGameGround(lot) {
  const { time } = state;
  const sp = sprites['game-ground'];
  if (sp) ctx.drawImage(sp, 0, 378);
  else {
    ctx.fillStyle = '#d2b47a'; rr(172, 378, 56, 340, 10); ctx.fill();
    ctx.fillStyle = '#d2b47a'; rr(40, 380, 320, 84, 18); ctx.fill();
  }
  const d = { x: 362, y: 446 }, carrying = player.carryType === 'prize';
  ctx.setLineDash([5, 4]); ctx.lineDashOffset = -time * 10; ctx.strokeStyle = carrying ? '#ffd23f' : 'rgba(255,255,255,0.8)'; ctx.lineWidth = carrying ? 3 : 2;
  ell(d.x, d.y, 22, 11); ctx.stroke(); ctx.setLineDash([]);
  drawPlushSprite(d.x, d.y + 4, 1, false, 3);
  rr(d.x - 24, d.y - 30, 48, 14, 7); ctx.fillStyle = 'rgba(59,36,22,0.78)'; ctx.fill();
  txt('Prize drop', d.x, d.y - 23, 9, '#ffffff', null, 600);
  rr(184, 452, 32, 10, 3); ctx.fillStyle = '#8a4d24'; ctx.fill();
}

function drawCellBase(lot) {
  const ox = lot.ox, oy = lot.oy;
  ctx.fillStyle = 'rgba(120,85,40,0.12)';
  for (let k = 0; k < 14; k++) { ell(ox + 10 + (hash(lot.cx, lot.cy, k) % 440), oy + 710 + (k % 4) * 11, 2.5 + (k % 3), 1.2); ctx.fill(); }
  for (let k = 0; k < 10; k++) { ell(ox + 406 + (hash(lot.cx, lot.cy, k + 40) % 44), oy + 20 + k * 72, 2.5, 1.2); ctx.fill(); }
  const spLamp = sprites['lamp'];
  for (const lx of [24, 376]) {
    if (spLamp) ctx.drawImage(spLamp, ox + lx - spLamp._ox, oy + 24 - spLamp._oy);
    else {
      ctx.fillStyle = 'rgba(0,0,0,0.2)'; ell(ox + lx, oy + 102, 8, 3); ctx.fill();
      const poleGrad = ctx.createLinearGradient(ox + lx - 2, oy, ox + lx + 2, oy);
      poleGrad.addColorStop(0, '#6b7583'); poleGrad.addColorStop(0.5, '#8a95a3'); poleGrad.addColorStop(1, '#5b6573');
      ctx.fillStyle = poleGrad; ctx.fillRect(ox + lx - 2, oy + 26, 4, 76);
      ctx.fillStyle = '#ffd23f'; ell(ox + lx, oy + 24, 5, 5); ctx.fill();
      ctx.fillStyle = '#fff4b0'; ell(ox + lx - 1.5, oy + 22, 2.5, 2.5); ctx.fill();
    }
  }
  ctx.strokeStyle = 'rgba(80,60,40,0.5)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(ox + 24, oy + 28); ctx.quadraticCurveTo(ox + 200, oy + 56, ox + 376, oy + 28); ctx.stroke();
  for (let k = 0; k < 12; k++) {
    const t = (k + 0.5) / 12, fx = ox + 24 + t * 352, fy = oy + 28 + 4 * 14 * t * (1 - t);
    const c = BRIGHT[(k + lot.cx * 3 + lot.cy) & 7];
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(fx - 5, fy); ctx.lineTo(fx + 5, fy); ctx.lineTo(fx, fy + 9); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(fx - 3, fy + 1, 2, 4);
  }
  ctx.strokeStyle = 'rgba(70,120,40,0.55)'; ctx.lineWidth = 1.5;
  for (const t of lot.tufts) {
    const shade = (hash(Math.round(t.x), Math.round(t.y)) % 30) / 100;
    ctx.strokeStyle = 'rgba(' + (60 + shade * 200) + ',120,40,0.55)';
    ctx.beginPath(); ctx.moveTo(t.x - 3, t.y); ctx.lineTo(t.x - 1, t.y - 5); ctx.moveTo(t.x + 1, t.y); ctx.lineTo(t.x + 3, t.y - 5); ctx.stroke();
  }
  for (let k = 0; k < 6; k++) {
    const fx = ox + 30 + (hash(lot.cx, lot.cy, k + 200) % 380), fy = oy + 410 + (hash(lot.cx, lot.cy, k + 210) % 280);
    ctx.fillStyle = 'rgba(100,80,50,0.08)'; ell(fx, fy, 4, 2); ctx.fill();
  }
}

function drawWoods(cx, cy) {
  const { time } = state;
  const ox = cx * CELL_W, oy = cy * CELL_H;
  const grd = ctx.createRadialGradient(ox + CELL_W/2, oy + CELL_H/2, 0, ox + CELL_W/2, oy + CELL_H/2, CELL_W);
  grd.addColorStop(0, '#6ab850'); grd.addColorStop(1, '#4a8a35');
  ctx.fillStyle = grd; ctx.fillRect(ox, oy, CELL_W, CELL_H);
  for (let k = 0; k < 6; k++) {
    const x = ox + 40 + (hash(cx, cy, k + 300) % 380), y = oy + 60 + (hash(cx, cy, k + 310) % 660);
    ctx.fillStyle = 'rgba(80,140,50,0.3)'; ell(x, y, 12, 6); ctx.fill();
  }
  for (let k = 0; k < 18; k++) {
    const x = ox + 20 + (hash(cx, cy, k) % 420), y = oy + 40 + (hash(cx, cy, k + 50) % 690), r = 20 + (hash(cx, cy, k + 90) % 14);
    const sp = sprites['tree-foliage:' + r];
    if (sp) ctx.drawImage(sp, x - sp._ox, y - sp._oy);
    else {
      ctx.fillStyle = 'rgba(0,0,0,0.18)'; ell(x + 5, y + r * 0.65, r * 1.1, r * 0.45); ctx.fill();
      const trunkGrad = ctx.createLinearGradient(x - 3, y, x + 3, y);
      trunkGrad.addColorStop(0, '#6b3f1f'); trunkGrad.addColorStop(0.5, '#8a5a30'); trunkGrad.addColorStop(1, '#5a3018');
      ctx.fillStyle = trunkGrad; ctx.fillRect(x - 3, y - 2, 6, r * 0.65);
      ctx.fillStyle = '#357a2c'; ell(x, y - 6, r * 1.05, r * 0.9); ctx.fill();
      ctx.fillStyle = '#4a9a40'; ell(x - r * 0.2, y - r * 0.35, r * 0.65, r * 0.55); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.08)'; ell(x - r * 0.3, y - r * 0.5, r * 0.4, r * 0.35); ctx.fill();
    }
  }
}

function edgeMarkers() {
  const { camX, camY, viewW, viewH, lots, time } = state;
  const cx = camX + viewW / 2, cy = camY + viewH / 2, x0 = camX + 34, x1 = camX + viewW - 34, y0 = camY + 90, y1 = camY + viewH - 120;
  for (const l of lots) {
    if (l.open) continue;
    const p = l.openPad;
    if (!canAfford(p) || inView(p.x - 30, p.x + 30, p.y - 30, p.y + 30)) continue;
    const dx = p.x - cx, dy = p.y - cy;
    const t = Math.min(dx ? Math.abs(((dx > 0 ? x1 : x0) - cx) / dx) : Infinity, dy ? Math.abs(((dy > 0 ? y1 : y0) - cy) / dy) : Infinity);
    const mx = cx + dx * t, my = cy + dy * t + Math.sin(time * 5) * 3, a = Math.atan2(dy, dx);
    rr(mx - 24, my - 20, 48, 40, 20); ctx.fillStyle = '#ffd23f'; ctx.fill();
    drawIcon(p.icon, mx - Math.cos(a) * 5, my - Math.sin(a) * 5, 18);
    ctx.save(); ctx.translate(mx + Math.cos(a) * 17, my + Math.sin(a) * 17); ctx.rotate(a);
    ctx.fillStyle = '#3b2416'; ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(-3, -6); ctx.lineTo(-3, 6); ctx.closePath(); ctx.fill();
    ctx.restore();
    txt('$' + fmt(p.price - (S.paid[p.id] || 0)), mx, my + 30, 12, '#ffffff', '#3b2416');
  }
}

function drawAlerts(lot) {
  if (lot.kind === 'hr') return;
  const c = lot.queue[0];
  if (S.tut < TUT.length || !c || !c.atFront) return;
  if (lot.kind === 'food') {
    if (c.noSeat && !c.seat) { const t = lot.tables.find(q => q.on && tableTrash(q) > 0); if (t) drawAlert(t.x, t.y - 48); }
    else if (!lot.regStaffed && lot.shelf > 0) drawAlert(lot.reg.x, lot.oy + 286);
  } else if (lot.kind === 'game') {
    if (c.noPrize) drawAlert(lot.drop.x, lot.drop.y - 46);
    else if (!lot.staffed) drawAlert(lot.barker.x, lot.barker.y - 56);
  } else if (!lot.staffed && lot.ride.phase === 'idle') drawAlert(lot.ctrl.x, lot.oy + 340);
}

function local(lot, fn) { ctx.save(); ctx.translate(0, lot.oy); fn(); ctx.restore(); }
function localXY(lot, fn) { ctx.save(); ctx.translate(lot.ox, lot.oy); fn(); ctx.restore(); }

export function draw() {
  ctx = getCtx();
  const { dpr, scale, cssW, cssH, camX, camY, viewW, viewH, lots, staff, visitors, time } = state;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = '#5fa845'; ctx.fillRect(0, 0, cssW, cssH);
  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, -camX * scale * dpr, -camY * scale * dpr);
  const cx0 = Math.floor(camX / CELL_W) - 1, cx1 = Math.floor((camX + viewW) / CELL_W) + 1;
  const cy0 = Math.floor(camY / CELL_H) - 1, cy1 = Math.floor((camY + viewH) / CELL_H) + 1;
  const vis = [];
  for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) {
    const lot = cells.get(ck(cx, cy));
    if (!lot) { if (inView(cx * CELL_W, (cx + 1) * CELL_W, cy * CELL_H, (cy + 1) * CELL_H)) drawWoods(cx, cy); continue; }
    const cellGrad = ctx.createRadialGradient(lot.ox + CELL_W/2, lot.oy + CELL_H/2, 40, lot.ox + CELL_W/2, lot.oy + CELL_H/2, CELL_W);
    cellGrad.addColorStop(0, '#86d060'); cellGrad.addColorStop(0.6, '#7cc456'); cellGrad.addColorStop(1, '#6aae48');
    ctx.fillStyle = cellGrad; ctx.fillRect(lot.ox, lot.oy, CELL_W, CELL_H);
    vis.push(lot);
  }
  ctx.fillStyle = '#d2b47a';
  for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) {
    const ox = cx * CELL_W, oy = cy * CELL_H;
    ctx.fillRect(ox + 400, oy, 60, CELL_H);
    ctx.fillRect(ox, oy + 706, CELL_W, 54);
  }
  for (const l of vis) drawCellBase(l);
  for (const l of vis) {
    if (!l.open) { local(l, () => drawLockedLot(l)); continue; }
    if (l.kind === 'hr') { drawHRBuilding(l); drawHRSign(l); }
    else if (l.kind === 'food') local(l, () => { drawFoodGround(l); drawFoodStand(l); });
    else if (l.kind === 'ride') local(l, () => drawRideGround(l));
    else { localXY(l, () => { drawGameGround(l); drawGameBooth(l); }); local(l, () => drawSign(l)); }
  }
  for (const p of visiblePads()) if (inView(p.x - 60, p.x + 60, p.y - 60, p.y + 60)) drawPad(p);

  const items = [];
  for (const l of vis) {
    if (!l.open) continue;
    const oy = l.oy;
    if (l.kind === 'food') {
      for (const m of l.machines) if (m.on) items.push({ y: m.y + 30, d: () => drawMachine(l, m) });
      if (l.boosted) items.push({ y: oy + 210, d: () => local(l, () => drawBoost(l)) });
      items.push({ y: oy + 378, d: () => local(l, () => drawCounter(l)) });
      for (const t of l.tables) if (t.on) { items.push({ y: t.y - 31, d: () => drawTableBack(t) }); items.push({ y: t.y + 20, d: () => drawTable(l, t) }); }
      items.push({ y: l.bin.y, d: () => drawBin(l) });
    } else if (l.kind === 'ride') {
      items.push({ y: oy + 300, d: () => local(l, () => drawRide(l)) });
      items.push({ y: oy + 377, d: () => local(l, () => drawRideFront(l)) });
      items.push({ y: oy + 398, d: () => local(l, () => drawBooth(l)) });
    } else if (l.kind === 'game') {
      items.push({ y: oy + 378, d: () => localXY(l, () => drawGameCounter(l)) });
      items.push({ y: l.crate.y + 6, d: () => drawCrate(l) });
    }
    if (l.cash > 0) items.push({ y: l.cashPos.y, d: () => drawCash(l) });
    for (const c of l.customers) items.push({ y: c.y, d: () => drawCustomer(c) });
  }
  for (const w of staff) if (inView(w.x - 30, w.x + 30, w.y - 80, w.y + 20)) items.push({ y: w.y + 0.1, d: () => drawStaff(w) });
  items.push({ y: player.y, d: drawPlayer });
  for (const v of visitors) if (inView(v.x - 30, v.x + 30, v.y - 80, v.y + 20)) items.push({ y: v.y, d: () => {
    let drawn = false;
    if (v.spriteIdx != null) drawn = drawCharWalk(v, v.spriteIdx, 44, 44);
    if (drawn) { if (v.balloon) drawBalloon(v.x, v.y, v.balloon); }
    else drawPerson(v, { shirt: v.shirt, skin: v.skin, hair: v.hair, balloon: v.balloon });
  } });
  items.sort((a, b) => a.y - b.y);
  for (const it of items) it.d();

  for (const l of vis) if (l.open) drawAlerts(l);
  drawFx();
  drawGuide();
  edgeMarkers();

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (joy.on) {
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; ell(joy.ox, joy.oy, JOY_R, JOY_R); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 3; ctx.stroke();
    let dx = joy.x - joy.ox, dy = joy.y - joy.oy; const m = Math.hypot(dx, dy);
    if (m > JOY_R) { dx = dx / m * JOY_R; dy = dy / m * JOY_R; }
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; ell(joy.ox + dx, joy.oy + dy, 20, 20); ctx.fill();
  }
}
