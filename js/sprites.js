import { getCtx, setCtx, sprites } from './state.js';
import { FONT } from './config.js';

export function makeSprite(w, h, drawFn, pad) {
  pad = pad || 0;
  const c = document.createElement('canvas');
  c.width = Math.ceil(w + pad * 2);
  c.height = Math.ceil(h + pad * 2);
  const prev = getCtx();
  const sctx = c.getContext('2d');
  setCtx(sctx);
  sctx.translate(pad, pad);
  drawFn(sctx, w, h);
  setCtx(prev);
  return c;
}

export function spr(key, x, y) {
  const s = sprites[key];
  if (!s) return;
  getCtx().drawImage(s, x - (s._ox || 0), y - (s._oy || 0));
}

export function sprAt(key, x, y) {
  const s = sprites[key];
  if (!s) return;
  getCtx().drawImage(s, x - s.width / 2, y - s.height / 2);
}

export function makeCenteredSprite(key, w, h, drawFn) {
  const pad = 4;
  const c = makeSprite(w, h, drawFn, pad);
  c._ox = Math.floor(w / 2) + pad;
  c._oy = Math.floor(h / 2) + pad;
  sprites[key] = c;
}

export function rr(x, y, w, h, r) {
  const ctx = getCtx();
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function ell(x, y, rx, ry) {
  const ctx = getCtx();
  ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, Math.PI * 2);
}

export function txt(s, x, y, size, color, stroke, weight) {
  const ctx = getCtx();
  ctx.font = (weight || 700) + ' ' + size + 'px ' + FONT;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (stroke) { ctx.lineWidth = Math.max(3, size / 4); ctx.strokeStyle = stroke; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); }
  ctx.fillStyle = color; ctx.fillText(s, x, y);
}

export function fitText(s, max, size, weight) {
  const ctx = getCtx();
  ctx.font = (weight || 700) + ' ' + size + 'px ' + FONT;
  const w = ctx.measureText(s).width;
  return w > max ? Math.floor(size * max / w) : size;
}

export function starPath(x, y, r) {
  const ctx = getCtx();
  ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); }
  ctx.closePath();
}
