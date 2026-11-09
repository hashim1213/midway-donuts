export const rand = (a, b) => a + Math.random() * (b - a);
export const randi = (a, b) => Math.floor(rand(a, b + 1));
export const pick = a => a[Math.floor(Math.random() * a.length)];
export const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const num = v => Math.max(0, Math.floor(Number(v) || 0));

export function nice(v) {
  if (v < 100) return Math.max(5, Math.round(v / 5) * 5);
  const e = Math.pow(10, Math.floor(Math.log10(v)) - 1);
  return Math.round(v / e) * e;
}

export function roman(n) {
  const t = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let s = ''; for (const [v, r] of t) while (n >= v) { s += r; n -= v; } return s;
}

const SUF = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
export function fmt(n) {
  n = Math.floor(n);
  if (n < 10000) return n.toLocaleString('en-US');
  const e = Math.min(SUF.length - 1, Math.floor(Math.log10(n) / 3));
  const v = n / Math.pow(1000, e);
  return (v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2)) + SUF[e];
}
