import { CELL_W, CELL_H, FOOD_ORDER, FOODS, GAME_ORDER, GAMES, PLUSH, SHIRTS } from './config.js';
import { getCtx, setCtx, sprites } from './state.js';
import { makeSprite, rr, ell, txt, starPath } from './sprites.js';
import {
  initGame, resize, update, save, load, loadFromCloud, fillQuests, initAudio, setupInput,
  updateCamera, discover, lotStars, dailyReady, D0
} from './game.js';
import {
  drawDonut, drawCup, drawCorndog, drawCandy, drawPopcorn, drawPretzel, drawCone, drawFunnel,
  drawTrash, drawBill, drawPlush, drawIcon, draw
} from './draw.js';
import { updateHud, anyOverlay, openDaily, offerAway, setupVisibility } from './ui.js';
import { state, S } from './state.js';

(function generateSprites() {
  const PAD = 6;

  function foodSprite(type, boosted, sc) {
    sc = sc || 1;
    const W = 40 * sc, H = 40 * sc;
    const c = makeSprite(W, H, () => {
      const ctx = getCtx();
      ctx.translate(W / 2, H / 2);
      switch (type) {
        case 'donut': drawDonut(0, 0, 1 * sc, boosted); break;
        case 'lemon': drawCup(0, 0, 1 * sc, boosted); break;
        case 'corndog': drawCorndog(0, 0, 1 * sc, boosted); break;
        case 'candy': drawCandy(0, 0, 1 * sc, boosted); break;
        case 'popcorn': drawPopcorn(0, 0, 1 * sc, boosted); break;
        case 'pretzel': drawPretzel(0, 0, 1 * sc, boosted); break;
        case 'icecream': drawCone(0, 0, 1 * sc, boosted); break;
        default: drawFunnel(0, 0, 1 * sc, boosted); break;
      }
    }, PAD);
    c._ox = Math.floor(W / 2) + PAD;
    c._oy = Math.floor(W / 2) + PAD;
    return c;
  }

  for (const type of FOOD_ORDER) {
    sprites['food:' + type] = foodSprite(type, false);
    sprites['food:' + type + ':b'] = foodSprite(type, true);
    sprites['food:' + type + ':sm'] = foodSprite(type, false, 0.8);
    sprites['food:' + type + ':b:sm'] = foodSprite(type, true, 0.8);
    sprites['food:' + type + ':lg'] = foodSprite(type, false, 1.25);
    sprites['food:' + type + ':b:lg'] = foodSprite(type, true, 1.25);
  }

  sprites['trash'] = (() => {
    const W = 40, H = 30;
    const c = makeSprite(W, H, () => { const ctx = getCtx(); ctx.translate(W / 2, H / 2); drawTrash(0, 0, 1); }, PAD);
    c._ox = W / 2 + PAD; c._oy = H / 2 + PAD; return c;
  })();
  sprites['trash:sm'] = (() => {
    const W = 36, H = 28;
    const c = makeSprite(W, H, () => { const ctx = getCtx(); ctx.translate(W / 2, H / 2); drawTrash(0, 0, 0.9); }, PAD);
    c._ox = W / 2 + PAD; c._oy = H / 2 + PAD; return c;
  })();

  sprites['bill'] = (() => {
    const W = 24, H = 16;
    const c = makeSprite(W, H, () => { const ctx = getCtx(); ctx.translate(W / 2, H / 2); drawBill(0, 0); }, PAD);
    c._ox = W / 2 + PAD; c._oy = H / 2 + PAD; return c;
  })();

  for (let i = 0; i < PLUSH.length; i++) {
    for (const fancy of [false, true]) {
      const key = 'plush:' + i + (fancy ? ':f' : '');
      const W = 34, H = 40;
      const c = makeSprite(W, H, () => { const ctx = getCtx(); ctx.translate(W / 2, H / 2 + 4); drawPlush(0, 2, 1.8, fancy, i); }, PAD);
      c._ox = W / 2 + PAD; c._oy = H / 2 + 4 + PAD; sprites[key] = c;
    }
  }

  const ICON_KEYS = [
    'donut','lemon','corndog','candy','popcorn','pretzel','icecream','funnel',
    'ferris','carousel','bumper','tower','swings','coaster','haunted',
    'ring','balloon','duck','bottle','hoop','water','bell','hammer','bowling','target','scale','plinko','coin','frog',
    'tie','table','chef','broom','cash','basket','shoe','briefcase','wrench','seat','bulb','bolt',
    'tent','megaphone','plush','sparkle','star','ticket','runner','box','lock','chair','ice','dot','swirl','butter','cheese','cherry','snow'
  ];
  for (const sz of [18, 22, 24, 30]) {
    for (const key of ICON_KEYS) {
      const W = sz + 8, H = sz + 8;
      const c = makeSprite(W, H, () => { const ctx = getCtx(); ctx.translate(W / 2, H / 2); drawIcon(key, 0, 0, sz); }, PAD);
      c._ox = W / 2 + PAD; c._oy = H / 2 + PAD; sprites['icon:' + key + ':' + sz] = c;
    }
  }

  sprites['alert'] = (() => {
    const W = 28, H = 28;
    const c = makeSprite(W, H, () => {
      const ctx = getCtx();
      ctx.translate(W / 2, H / 2);
      ell(0, 0, 11, 11); ctx.fillStyle = '#ef4b5b'; ctx.fill();
      txt('!', 0, 1, 16, '#ffffff');
    }, PAD);
    c._ox = W / 2 + PAD; c._oy = H / 2 + PAD; return c;
  })();

  const starR = 6;
  for (const filled of [true, false]) {
    const key = 'star:' + (filled ? 'on' : 'off');
    const W = 18, H = 18;
    const c = makeSprite(W, H, () => {
      const ctx = getCtx();
      ctx.translate(W / 2, H / 2);
      starPath(0, 0, starR); ctx.fillStyle = filled ? '#ffd23f' : 'rgba(255,255,255,0.3)'; ctx.fill();
    }, PAD);
    c._ox = W / 2 + PAD; c._oy = H / 2 + PAD; sprites[key] = c;
  }

  sprites['bin'] = (() => {
    const W = 40, H = 50;
    const c = makeSprite(W, H, () => {
      const ctx = getCtx();
      const bx = W / 2, by = 32;
      ctx.fillStyle = 'rgba(0,0,0,0.2)'; ell(bx + 2, by + 3, 15, 6); ctx.fill();
      const binGrad = ctx.createLinearGradient(bx - 12, 0, bx + 12, 0);
      binGrad.addColorStop(0, '#2e8a52'); binGrad.addColorStop(0.4, '#4ac87a'); binGrad.addColorStop(1, '#2e8a52');
      rr(bx - 12, by - 24, 24, 26, 4); ctx.fillStyle = binGrad; ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(bx - 12, by - 16, 24, 2); ctx.fillRect(bx - 12, by - 7, 24, 2);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(bx - 4, by - 13, 8, 2); rr(bx - 3, by - 11, 6, 7, 1); ctx.fill();
      ctx.fillStyle = '#2a3640'; ell(bx, by - 24, 12, 4); ctx.fill();
      const lidGrad = ctx.createLinearGradient(bx - 13, -3, bx - 13, 3);
      lidGrad.addColorStop(0, '#3aae6b'); lidGrad.addColorStop(1, '#2a8a52');
      ctx.translate(bx - 13, by - 26);
      rr(0, -3, 26, 6, 3); ctx.fillStyle = lidGrad; ctx.fill(); rr(9, -6, 8, 4, 2); ctx.fill();
    }, PAD);
    c._ox = W / 2 + PAD; c._oy = 32 + PAD; sprites['bin'] = c;
  })();

  sprites['bubble'] = (() => {
    const W = 52, H = 44;
    const c = makeSprite(W, H, () => {
      const ctx = getCtx();
      const bx = W / 2, by = 12;
      rr(bx - 22, by - 12, 44, 24, 10); ctx.fillStyle = '#ffffff'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(bx - 5, by + 11); ctx.lineTo(bx, by + 18); ctx.lineTo(bx + 5, by + 11); ctx.fill();
    }, PAD);
    c._ox = W / 2 + PAD; c._oy = 12 + PAD; sprites['bubble'] = c;
  })();

  sprites['food-ground'] = (() => {
    const W = CELL_W, H = CELL_H;
    const c = makeSprite(W, H, () => {
      const ctx = getCtx();
      ctx.fillStyle = '#d2b47a'; ell(130, 548, 112, 118); ctx.fill();
      ctx.fillStyle = '#d2b47a'; rr(212, 378, 56, 340, 10); ctx.fill();
      for (let y = 158; y < 380; y += 20) {
        for (let x = 30; x < 370; x += 20) {
          const even = (((x - 30) / 20) + ((y - 158) / 20)) % 2 === 0;
          ctx.fillStyle = even ? '#fff3e0' : '#ffe6cc';
          ctx.fillRect(x, y, 20, Math.min(20, 380 - y));
          ctx.fillStyle = even ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.03)';
          ctx.fillRect(x, y, 20, 2);
        }
      }
      ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.fillRect(30, 158, 340, 4);
      ctx.fillStyle = 'rgba(0,0,0,0.05)'; ctx.fillRect(30, 162, 340, 6);
    }, 0);
    return c;
  })();

  for (const type of FOOD_ORDER) {
    const d = FOODS[type], th = d.theme;
    sprites['food-stand:' + type] = (() => {
      const W = CELL_W, H = 280;
      const c = makeSprite(W, H, () => {
        const ctx = getCtx();
        const woodGrad = ctx.createLinearGradient(14, 18, 14, 52);
        woodGrad.addColorStop(0, '#c4874b'); woodGrad.addColorStop(1, '#a0632f');
        ctx.fillStyle = woodGrad; ctx.fillRect(14, 18, 372, 34);
        ctx.strokeStyle = 'rgba(80,40,15,0.25)'; ctx.lineWidth = 1;
        for (let y = 26; y < 52; y += 8) { ctx.beginPath(); ctx.moveTo(14, y); ctx.lineTo(386, y); ctx.stroke(); }
        const pillarGrad = ctx.createLinearGradient(14, 0, 30, 0);
        pillarGrad.addColorStop(0, '#8a5528'); pillarGrad.addColorStop(0.5, '#b5773f'); pillarGrad.addColorStop(1, '#8a5528');
        ctx.fillStyle = pillarGrad; ctx.fillRect(14, 18, 16, 254);
        const pillarGrad2 = ctx.createLinearGradient(370, 0, 386, 0);
        pillarGrad2.addColorStop(0, '#8a5528'); pillarGrad2.addColorStop(0.5, '#b5773f'); pillarGrad2.addColorStop(1, '#8a5528');
        ctx.fillStyle = pillarGrad2; ctx.fillRect(370, 18, 16, 254);
        ctx.fillStyle = '#c4874b'; ctx.fillRect(14, 18, 16, 6); ctx.fillRect(370, 18, 16, 6);
        for (let i = 0, x = 10; x < 390; i++, x += 20) {
          const base = i % 2 ? '#fff6e8' : th;
          ctx.fillStyle = base;
          ctx.fillRect(x, 0, 20, 24);
          ell(x + 10, 24, 10, 8); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(x, 0, 20, 3);
        }
        ctx.fillStyle = 'rgba(0,0,0,0.14)'; ctx.fillRect(10, 0, 380, 3);
        ctx.fillStyle = 'rgba(0,0,0,0.06)'; ctx.fillRect(10, 3, 380, 3);
      }, 0);
      return c;
    })();
  }

  sprites['game-ground'] = (() => {
    const W = CELL_W, H = 130;
    const c = makeSprite(W, H, () => {
      const ctx = getCtx();
      ctx.fillStyle = '#d2b47a'; rr(172, 0, 56, 130, 10); ctx.fill();
      ctx.fillStyle = '#d2b47a'; rr(40, 2, 320, 84, 18); ctx.fill();
    }, 0);
    return c;
  })();

  sprites['ride-ground-path'] = (() => {
    const W = CELL_W, H = 380;
    const c = makeSprite(W, H, () => {
      const ctx = getCtx();
      ctx.fillStyle = '#d2b47a'; rr(212, 0, 56, 340, 10); ctx.fill();
      rr(122, 0, 36, 340, 10); ctx.fill();
    }, 0);
    return c;
  })();

  for (const type of ['normal', 'haunted']) {
    sprites['ride-area:' + type] = (() => {
      const W = 360, H = 260;
      const isHaunted = type === 'haunted';
      const c = makeSprite(W, H, () => {
        const ctx = getCtx();
        const areaGrad = ctx.createRadialGradient(178, 128, 30, 178, 128, 200);
        areaGrad.addColorStop(0, isHaunted ? '#8a9a78' : '#e8f0e0'); areaGrad.addColorStop(1, isHaunted ? '#6a7a58' : '#d0dcc8');
        rr(0, 0, 356, 256, 12); ctx.fillStyle = areaGrad; ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,0.04)';
        for (let i = 0; i < 18; i++) { ell(28 + (i * 61) % 310, 18 + (i * 47) % 220, 5, 2); ctx.fill(); }
      }, 0);
      return c;
    })();
  }

  for (const gType of GAME_ORDER) {
    const th = GAMES[gType].theme;
    sprites['game-booth:' + gType] = (() => {
      const W = CELL_W, H = 260;
      const c = makeSprite(W, H, () => {
        const ctx = getCtx();
        ctx.fillStyle = '#f7efe2'; ctx.fillRect(30, 50, 340, 184);
        ctx.fillStyle = '#b5773f'; ctx.fillRect(14, 18, 372, 100);
        ctx.strokeStyle = 'rgba(80,40,15,0.3)'; ctx.lineWidth = 1;
        for (let y = 26; y < 118; y += 10) { ctx.beginPath(); ctx.moveTo(14, y); ctx.lineTo(386, y); ctx.stroke(); }
        ctx.fillStyle = '#7a4420'; ctx.fillRect(36, 64, 328, 4); ctx.fillRect(36, 98, 328, 4);
        ctx.fillStyle = '#a0632f'; ctx.fillRect(14, 18, 16, 254); ctx.fillRect(370, 18, 16, 254);
        for (let i = 0, x = 10; x < 390; i++, x += 20) { ctx.fillStyle = i % 2 ? '#fff6e8' : th; ctx.fillRect(x, 0, 20, 24); ell(x + 10, 24, 10, 8); ctx.fill(); }
        ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(10, 0, 380, 4);
        ctx.fillStyle = '#c4874b'; for (const x of [40, 120, 200, 280, 360]) ctx.fillRect(x - 2, 114, 4, 118);
      }, 0);
      return c;
    })();
  }

  sprites['locked-fence'] = (() => {
    const W = 400, H = 40;
    const c = makeSprite(W, H, () => {
      const ctx = getCtx();
      const posts = [];
      for (let x = 0; x <= 352; x += 44) posts.push(x);
      ctx.strokeStyle = '#d9b77a'; ctx.lineWidth = 3; ctx.beginPath();
      for (let i = 0; i < posts.length - 1; i++) { ctx.moveTo(posts[i], 8); ctx.quadraticCurveTo((posts[i] + posts[i + 1]) / 2, 18, posts[i + 1], 8); }
      ctx.stroke();
      for (const x of posts) {
        const pg = ctx.createLinearGradient(x - 3, 0, x + 3, 0);
        pg.addColorStop(0, '#7a4020'); pg.addColorStop(0.5, '#9a5a30'); pg.addColorStop(1, '#7a4020');
        ctx.fillStyle = pg; rr(x - 3, 0, 6, 26, 2); ctx.fill();
      }
    }, PAD);
    return c;
  })();

  sprites['locked-ground'] = (() => {
    const W = 360, H = 250;
    const c = makeSprite(W, H, () => {
      const ctx = getCtx();
      const dirtGrad = ctx.createRadialGradient(176, 120, 30, 176, 120, 200);
      dirtGrad.addColorStop(0, '#e0c898'); dirtGrad.addColorStop(1, '#c8aa76');
      ctx.fillStyle = dirtGrad; rr(0, 0, 352, 240, 14); ctx.fill();
      ctx.fillStyle = 'rgba(120,85,40,0.12)';
      for (let i = 0; i < 14; i++) { ell(26 + (i * 53) % 300, 30 + (i * 37) % 190, 4, 2); ctx.fill(); }
    }, 0);
    return c;
  })();

  for (const type of FOOD_ORDER) {
    const cloth = FOODS[type].cloth;
    sprites['table:' + type] = (() => {
      const W = 80, H = 60;
      const c = makeSprite(W, H, () => {
        const ctx = getCtx();
        const x = 40, y = 22;
        const shGrad = ctx.createRadialGradient(x, y + 22, 4, x, y + 22, 38);
        shGrad.addColorStop(0, 'rgba(0,0,0,0.2)'); shGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = shGrad; ell(x, y + 22, 38, 10); ctx.fill();
        const legGrad = ctx.createLinearGradient(x - 24, 0, x - 19, 0);
        legGrad.addColorStop(0, '#6a3818'); legGrad.addColorStop(0.5, '#8a5228'); legGrad.addColorStop(1, '#6a3818');
        ctx.fillStyle = legGrad; ctx.fillRect(x - 24, y + 8, 5, 14); ctx.fillRect(x + 19, y + 8, 5, 14);
        rr(x - 32, y - 18, 64, 30, 5); ctx.fillStyle = cloth; ctx.fill();
        ctx.save(); rr(x - 32, y - 18, 64, 30, 5); ctx.clip();
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        for (let i = 0; i < 8; i++) ctx.fillRect(x - 32 + i * 8, y - 18, 4, 30);
        for (let j = 0; j < 4; j++) ctx.fillRect(x - 32, y - 18 + j * 8, 64, 4);
        ctx.fillStyle = 'rgba(0,0,0,0.06)'; ctx.fillRect(x - 32, y + 4, 64, 8);
        ctx.restore();
        ctx.fillStyle = '#b8672f'; ctx.fillRect(x - 32, y + 10, 64, 4);
        ctx.fillStyle = '#9a5a2c'; rr(x - 28, y + 22, 56, 8, 3); ctx.fill();
      }, PAD);
      c._ox = 40 + PAD; c._oy = 22 + PAD;
      return c;
    })();
  }

  for (const type of FOOD_ORDER) {
    const d = FOODS[type];
    sprites['machine-body:' + type] = (() => {
      const W = 66, H = 60;
      const c = makeSprite(W, H, () => {
        const ctx = getCtx();
        const x = 33, y = 30;
        ctx.fillStyle = 'rgba(0,0,0,0.18)'; ell(x, y + 24, 32, 8); ctx.fill();
        rr(x - 28, y - 4, 56, 26, 5); ctx.fillStyle = d.body[0]; ctx.fill();
        rr(x - 28, y - 30, 56, 30, 6); ctx.fillStyle = d.body[1]; ctx.fill();
      }, PAD);
      c._ox = 33 + PAD; c._oy = 30 + PAD;
      return c;
    })();
  }

  sprites['hr-building'] = (() => {
    const W = 300, H = 260;
    const c = makeSprite(W, H, () => {
      const ctx = getCtx();
      const cx = 150, cy = 120;
      const sandGrad = ctx.createRadialGradient(cx, 200, 20, cx, 200, 160);
      sandGrad.addColorStop(0, '#eedcaa'); sandGrad.addColorStop(1, '#dcc88e');
      ctx.fillStyle = sandGrad; ell(cx, 200, 160, 100); ctx.fill();
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
    }, 0);
    return c;
  })();

  for (let sz = 20; sz <= 33; sz++) {
    const r = sz;
    sprites['tree-foliage:' + sz] = (() => {
      const W = r * 2.4, H = r * 2.2;
      const c = makeSprite(W, H, () => {
        const ctx = getCtx();
        const x = W / 2, y = H / 2 + 4;
        ctx.fillStyle = 'rgba(0,0,0,0.18)'; ell(x + 5, y + r * 0.65, r * 1.1, r * 0.45); ctx.fill();
        const trunkGrad = ctx.createLinearGradient(x - 3, y, x + 3, y);
        trunkGrad.addColorStop(0, '#6b3f1f'); trunkGrad.addColorStop(0.5, '#8a5a30'); trunkGrad.addColorStop(1, '#5a3018');
        ctx.fillStyle = trunkGrad; ctx.fillRect(x - 3, y - 2, 6, r * 0.65);
        ctx.fillStyle = '#357a2c'; ell(x, y - 6, r * 1.05, r * 0.9); ctx.fill();
        ctx.fillStyle = '#4a9a40'; ell(x - r * 0.2, y - r * 0.35, r * 0.65, r * 0.55); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.08)'; ell(x - r * 0.3, y - r * 0.5, r * 0.4, r * 0.35); ctx.fill();
      }, PAD);
      c._ox = Math.floor(W / 2) + PAD; c._oy = Math.floor(H / 2) + 4 + PAD;
      return c;
    })();
  }

  sprites['person-shadow'] = (() => {
    const W = 30, H = 14;
    const c = makeSprite(W, H, () => {
      const ctx = getCtx();
      const shGrad = ctx.createRadialGradient(15, 7, 0, 15, 7, 12);
      shGrad.addColorStop(0, 'rgba(0,0,0,0.22)'); shGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = shGrad; ell(15, 7, 12, 5); ctx.fill();
    }, 0);
    c._ox = 15; c._oy = 7;
    return c;
  })();

  for (const col of SHIRTS.concat(['#ef4b5b', '#2ec4a6', '#fff6e8', '#2f3540'])) {
    const key = 'shirt:' + col;
    sprites[key] = (() => {
      const W = 22, H = 23;
      const c = makeSprite(W, H, () => {
        const ctx = getCtx();
        rr(2, 2, 18, 19, 7); ctx.fillStyle = col; ctx.fill();
      }, PAD);
      c._ox = 11 + PAD; c._oy = 2 + PAD;
      return c;
    })();
  }

  sprites['lamp'] = (() => {
    const W = 16, H = 82;
    const c = makeSprite(W, H, () => {
      const ctx = getCtx();
      ctx.fillStyle = 'rgba(0,0,0,0.2)'; ell(8, 78, 8, 3); ctx.fill();
      const poleGrad = ctx.createLinearGradient(6, 0, 10, 0);
      poleGrad.addColorStop(0, '#6b7583'); poleGrad.addColorStop(0.5, '#8a95a3'); poleGrad.addColorStop(1, '#5b6573');
      ctx.fillStyle = poleGrad; ctx.fillRect(6, 2, 4, 76);
      ctx.fillStyle = '#ffd23f'; ell(8, 0, 5, 5); ctx.fill();
      ctx.fillStyle = '#fff4b0'; ell(6.5, -2, 2.5, 2.5); ctx.fill();
    }, PAD);
    c._ox = 8 + PAD; c._oy = PAD;
    return c;
  })();
})();

/* ---------- init + loop ---------- */
initGame();
resize();
load(offerAway);
for (const l of state.lots) if (l.open) { discover(l, false); l.starsShown = lotStars(l); }
fillQuests();
state.dailyPending = dailyReady();
updateCamera(0, true);
setupInput();
initAudio();

loadFromCloud(offerAway).catch(() => {});

const lastRef = { v: performance.now() };
setupVisibility(lastRef);

if (document.fonts && document.fonts.load) document.fonts.load('700 16px Fredoka').catch(() => {});

window.addEventListener('resize', resize);

function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - lastRef.v) / 1000));
  lastRef.v = now;
  update(dt, anyOverlay, openDaily);
  updateHud(dt);
  draw();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
