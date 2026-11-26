// Skill Graph — shared picture-book people for labs. Pure canvas 2D, no dependencies.
//
// drawPerson(c, x, footY, h, o)   x: centre, footY: ground line, h: full height (canvas units)
//
// Options that older labs already pass (all still work):
//   adult, skin, hair, hairStyle, top, bottom, skirt, dress, shoe | shoes, arms:{l,r}, mood, look, noShadow, lashes
// New options (all optional):
//   style     'soft' | 'line' | 'sticker'        (default: setPeopleStyle(), 'soft' at start)
//   age       'toddler' | 'child' | 'teen' | 'adult' | 'older'   (default from `adult`)
//   build     'slim' | 'average'                  frame 'narrow' | 'broad'
//   outfit    'tee' | 'hoodie' | 'sweater' | 'jacket' | 'cardigan' | 'uniform' | 'dress'
//   lower     'trousers' | 'shorts' | 'skirt'     inner (shirt colour under a jacket), tie, tights
//   pattern   'stripes' | 'dots'                  sleeves 'short' | 'long' | 'puff' | 'none'
//   shoe      { kind: sneaker|hightop|boot|rain|loafer|flat|sandal, col }
//   hairStyle short|buzz|side|spiky|bob|long|wavy|pony|pigtails|braids|bun|curly|afro|bald
//   mood      smile|calm|open|laugh|sad|angry|surprised|worried|thinking|flat
//   glasses   true | 'round' | 'square'           eyes (iris colour), freckles, lashes
//   rim       true | '#colour'  — a light outline for dark scenes (use an opaque colour)
//   pose      'straight' turns off the weight shift; lean -1 | 1 picks the weight leg; tilt (radians)
//   look, lookY  -1…1 eye direction                seed: fixes the person's random details
//
// Detail follows the size on screen: the head radius is measured in CSS pixels, so a 60 px
// figure skips folds, fingers and laces, and a 300 px one gets all of them.

const P = Math.PI, TAU = P * 2;
const SHD = [46, 34, 92], INK = [30, 20, 40], WARM = [130, 50, 45];

// ---------- colour
const CC = new Map();
function rgb(h) {
  if (h[0] === '#') {
    let s = h.slice(1); if (s.length === 3) s = s.replace(/./g, '$&$&');
    const n = parseInt(s.slice(0, 6), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255];
  }
  const m = h.match(/[\d.]+/g); return m ? [+m[0], +m[1], +m[2]] : [128, 128, 128];
}
function toward(h, t, a) {
  const key = h + '|' + t + '|' + a; let v = CC.get(key); if (v) return v;
  const [r, g, b] = rgb(h);
  v = `rgb(${Math.round(r + (t[0] - r) * a)},${Math.round(g + (t[1] - g) * a)},${Math.round(b + (t[2] - b) * a)})`;
  if (CC.size > 5000) CC.clear(); CC.set(key, v); return v;
}
const WHITE = [255, 255, 255];
export const mix = (h, k) => toward(h, k > 0 ? WHITE : [0, 0, 0], Math.abs(k));
const ink = (h) => toward(h, INK, 0.62);

// ---------- styles
export const STYLES = {
  soft:    { name: 'soft',    line: 0, shade: 0.13, light: 0.10, rim: 0, rimCol: '#fff8ec' },
  line:    { name: 'line',    line: 1, shade: 0.12, light: 0,    rim: 0, rimCol: '#fff8ec' },
  sticker: { name: 'sticker', line: 0, shade: 0.22, light: 0.14, rim: 1, rimCol: '#ffffff' },
};
let defStyle = 'soft';
export function setPeopleStyle(s) { if (STYLES[s]) defStyle = s; return defStyle; }

// ---------- poses: [upper arm, forearm relative to it]; 0 = hanging down, + = outwards
export const ARMS = {
  down: [0.16, -0.08], relax: [0.2, -0.34], rest: [0.8, -1.35], hold: [0.14, -1.7], wave: [2.5, 0.4],
  open: [0.8, 0.25], up: [2.9, 0.15], back: [0.05, 0.0], hips: [0.85, -1.75], chin: [0.15, -2.9],
  point: [1.5, 0.05], pocket: [0.1, -0.3],
};
export const MOODS = ['smile', 'calm', 'open', 'laugh', 'sad', 'angry', 'surprised', 'worried', 'thinking', 'flat'];

const AGES = {
  toddler: { heads: 3.7, leg: 0.32, sw: 0.15,  neck: 0.04, arm: 0.33, face: 0.97, eye: 0.19, ey: 0.2,  my: 0.6,  lw: 0.74, aw: 0.5,  hip: 0.95, hand: 0.72 },
  child:   { heads: 5.3, leg: 0.41, sw: 0.125, neck: 0.14, arm: 0.37, face: 0.93, eye: 0.17, ey: 0.16, my: 0.6,  lw: 0.72, aw: 0.47, hip: 0.86, hand: 0.82 },
  teen:    { heads: 6.0, leg: 0.46, sw: 0.124, neck: 0.24, arm: 0.39, face: 0.88, eye: 0.155, ey: 0.1, my: 0.62, lw: 0.74, aw: 0.47, hip: 0.84, hand: 0.92 },
  adult:   { heads: 6.3, leg: 0.47, sw: 0.13,  neck: 0.3,  arm: 0.4,  face: 0.86, eye: 0.145, ey: 0.07, my: 0.62, lw: 0.8,  aw: 0.5,  hip: 0.84, hand: 1.0 },
  older:   { heads: 6.0, leg: 0.45, sw: 0.124, neck: 0.18, arm: 0.39, face: 0.87, eye: 0.135, ey: 0.08, my: 0.62, lw: 0.78, aw: 0.49, hip: 0.88, hand: 0.98, stoop: 1 },
};
const BUILDS = {
  slim:    { limb: 0.87, sh: 0.95, waist: 0.86, hip: 0.92 },
  average: { limb: 1,    sh: 1,    waist: 1,    hip: 1 },
};
const OUTFITS = new Set(['tee', 'hoodie', 'sweater', 'jacket', 'cardigan', 'uniform', 'dress']);
const SHOE_COL = ['#e9564f', '#2f6fd6', '#3a3a46', '#7a4a2c', '#f2f0ea', '#e7a33a', '#4c9a6a', '#c0466f'];

// ---------- path helpers
function capsule(x0, y0, x1, y1, w0, w1) {
  const p = new Path2D(), dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1e-6, a = Math.atan2(dy, dx), nx = -dy / L, ny = dx / L;
  // clockwise, like ellipse() and roundRect(): shapes merged into one path must wind the same way,
  // or the overlaps cancel out and leave holes
  p.moveTo(x0 - nx * w0 / 2, y0 - ny * w0 / 2); p.lineTo(x1 - nx * w1 / 2, y1 - ny * w1 / 2);
  p.arc(x1, y1, w1 / 2, a - P / 2, a + P / 2, false); p.lineTo(x0 + nx * w0 / 2, y0 + ny * w0 / 2);
  p.arc(x0, y0, w0 / 2, a + P / 2, a + P * 1.5, false); p.closePath(); return p;
}
// a limb with its shaded side: the lit part is the same capsule, narrower and moved to the light
function capItem(x0, y0, x1, y1, w0, w1, f, k, extra) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1e-6;
  let nx = -dy / L, ny = dx / L; if (nx < -1e-6 || (Math.abs(nx) <= 1e-6 && ny < 0)) { nx = -nx; ny = -ny; }
  const dl = (k || 0.3) * Math.min(w0, w1);
  return Object.assign({ p: capsule(x0, y0, x1, y1, w0, w1), p2: capsule(x0 - nx * dl / 2, y0 - ny * dl / 2, x1 - nx * dl / 2, y1 - ny * dl / 2, w0 - dl, w1 - dl), f }, extra);
}
// a piece of clothing on a limb: round at the joint, cut straight at the hem
function seg(x0, y0, x1, y1, w0, w1, sh = 0) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1e-6, a = Math.atan2(dy, dx), nx = -dy / L, ny = dx / L;
  const p = new Path2D();
  p.moveTo(x0 - nx * (w0 / 2 - sh), y0 - ny * (w0 / 2 - sh)); p.lineTo(x1 - nx * (w1 / 2 - sh), y1 - ny * (w1 / 2 - sh));
  p.lineTo(x1 + nx * (w1 / 2 + sh), y1 + ny * (w1 / 2 + sh)); p.lineTo(x0 + nx * (w0 / 2 + sh), y0 + ny * (w0 / 2 + sh));
  p.arc(x0 + nx * sh, y0 + ny * sh, w0 / 2, a + P / 2, a + P * 1.5, false); p.closePath(); return p;
}
function segItem(x0, y0, x1, y1, w0, w1, f, k, extra) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1e-6;
  let nx = -dy / L, ny = dx / L, sg = 1; if (nx < -1e-6 || (Math.abs(nx) <= 1e-6 && ny < 0)) sg = -1;
  const dl = (k || 0.3) * Math.min(w0, w1);
  // the lit part: the same piece, narrower on the shadow side
  return Object.assign({ p: seg(x0, y0, x1, y1, w0, w1), p2: seg(x0, y0, x1, y1, w0 - dl, w1 - dl, -sg * dl / 2), f }, extra);
}
function ell(x, y, rx, ry, rot = 0) { const p = new Path2D(); p.ellipse(x, y, Math.max(rx, 0.01), Math.max(ry, 0.01), rot, 0, TAU); return p; }
function rr(x, y, w, h, rad) { const p = new Path2D(); p.roundRect(x, y, w, h, rad); return p; }
const lerp = (a, b, t) => a + (b - a) * t;
function hashStr(s) { let k = 2166136261; for (let i = 0; i < s.length; i++) { k ^= s.charCodeAt(i); k = Math.imul(k, 16777619); } return k >>> 0; }
function pxScale(c) {
  let k = 1;
  if (c.getTransform) { const t = c.getTransform(); k = Math.hypot(t.a, t.b) || 1; }
  const cv = c.canvas; if (cv && cv.clientWidth && cv.width) k *= cv.clientWidth / cv.width;
  return k;
}

// ---------- renderer: groups of shapes; a group gets one outline (line style) and one rim
function paint(c, it, S) {
  if (it.p2) { // a capsule: shadow colour, then a narrower lit capsule — no clip needed
    c.fillStyle = it.sc || toward(it.f, it.warm ? WARM : SHD, S.shade * (it.ks || 1)); c.fill(it.p);
    c.fillStyle = it.f; c.fill(it.p2); return;
  }
  if (!it.d) { c.fillStyle = it.f; c.fill(it.p); return; }
  c.fillStyle = it.sc || toward(it.f, it.warm ? WARM : SHD, S.shade * (it.ks || 1)); c.fill(it.p);
  c.save(); c.clip(it.p);
  const d = it.d; c.translate(-d, -d * 0.15);
  if (S.light && it.kl !== 0) { c.fillStyle = mix(it.f, S.light * (it.kl || 1)); c.fill(it.p); c.translate(d * 0.42, d * 0.38); }
  c.fillStyle = it.f; c.fill(it.p);
  c.restore();
}
function withTf(c, g, fn) {
  if (!g.tf) { fn(); return; }
  const [px, py, a] = g.tf; c.save(); c.translate(px, py); c.rotate(a); c.translate(-px, -py); fn(); c.restore();
}
// consecutive shapes of one colour become one path: one clip and three fills instead of many
function merge(items, lod) {
  const out = [];
  for (const it of items) {
    const d = lod === 0 ? 0 : it.d || 0, last = out[out.length - 1];
    const p2 = lod === 0 ? null : it.p2 || null;
    if (last && last.f === it.f && !!last.d === !!d && !!last.p2 === !!p2 && last.warm === it.warm && !last.ol && !it.ol) { last.p.addPath(it.p); if (p2) last.p2.addPath(p2); continue; }
    const p = new Path2D(); p.addPath(it.p); let q = null; if (p2) { q = new Path2D(); q.addPath(p2); }
    out.push(Object.assign({}, it, { p, p2: q, d }));
  }
  return out;
}
function render(c, G, S, ow, rimW, rimCol, lod) {
  c.lineJoin = 'round'; c.lineCap = 'round';
  for (const g of G) g.items = merge(g.items, lod);
  if (rimW > 0) {
    c.strokeStyle = rimCol; c.lineWidth = 2 * (rimW + (S.line ? ow : 0));
    for (const g of G) if (!g.noRim) withTf(c, g, () => { for (const it of g.items) c.stroke(it.p); });
  }
  for (const g of G) withTf(c, g, () => {
    if (g.before) { c.save(); g.before(g.items); c.restore(); }
    if (S.line && ow > 0 && !g.noLine) { c.lineWidth = 2 * ow; for (const it of g.items) { c.strokeStyle = it.ol || ink(it.f); c.stroke(it.p); } }
    for (const it of g.items) paint(c, it, S);
    if (g.after) { c.save(); g.after(); c.restore(); }
  });
}

// ---------- cache: a figure drawn twice with the same options is kept as a bitmap.
// Labs redraw every frame, and most people in a scene do not change between frames.
const CACHE = new Map(), SEEN = new Map(), PX_BUDGET = 8e6;
let cacheOn = true, cachePx = 0;
export function setPeopleCache(on) { cacheOn = !!on; if (!on) { CACHE.clear(); SEEN.clear(); cachePx = 0; } }

export function drawPerson(c, x, y, h, o = {}) {
  if (!(h > 6)) return;
  if (!cacheOn || o.cache === false || typeof document === 'undefined' || !c.getTransform) return drawRaw(c, x, y, h, o);
  const t = c.getTransform();
  if (t.b || t.c || t.a !== t.d || t.a <= 0) return drawRaw(c, x, y, h, o);
  const k = pxScale(c);
  const key = (o.style || defStyle) + '|' + h.toFixed(2) + '|' + t.a.toFixed(3) + '|' + k.toFixed(3) + '|' + JSON.stringify(o);
  let e = CACHE.get(key);
  if (!e) {
    const n = (SEEN.get(key) || 0) + 1;
    if (n < 2) { if (SEEN.size > 600) SEEN.clear(); SEEN.set(key, n); return drawRaw(c, x, y, h, o); }
    SEEN.delete(key);
    const sc = t.a, hw = h * 0.72, top = h * 1.42, bot = h * 0.06;
    const cv = document.createElement('canvas');
    cv.width = Math.ceil(hw * 2 * sc); cv.height = Math.ceil((top + bot) * sc);
    const cc = cv.getContext('2d'); cc.setTransform(sc, 0, 0, sc, 0, 0);
    drawRaw(cc, hw, top, h, Object.assign({}, o, { _k: k }));
    e = { cv, hw, top, px: cv.width * cv.height };
    CACHE.set(key, e); cachePx += e.px;
    for (const [k2, v] of CACHE) { if (cachePx <= PX_BUDGET) break; CACHE.delete(k2); cachePx -= v.px; }
  } else { CACHE.delete(key); CACHE.set(key, e); } // most recently used goes last
  const X = Math.round(t.a * (x - e.hw) + t.e), Y = Math.round(t.a * (y - e.top) + t.f);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(e.cv, X, Y); c.restore();
}

function drawRaw(c, x, y, h, o) {
  const S = STYLES[o.style] || STYLES[defStyle];
  const ageK = AGES[o.age] ? o.age : (o.adult ? 'adult' : 'child'), A = AGES[ageK];
  const grown = ageK === 'adult' || ageK === 'older';
  const B = BUILDS[o.build] || BUILDS.average;
  const frame = o.frame === 'broad' ? 1.1 : o.frame === 'narrow' ? 0.92 : 1;
  const sk = o.skin || '#f2c6a0', hc = o.hair || '#5a3a24', top = o.top || '#4f8fd0', bot = o.bottom || '#34406b';
  const outfit = OUTFITS.has(o.outfit) ? o.outfit : (o.dress ? 'dress' : 'tee');
  const lower = outfit === 'dress' ? 'none' : (o.lower || (o.skirt ? 'skirt' : 'trousers'));
  const hs = o.hairStyle || 'short', mood = o.mood || 'smile';
  const seed = o.seed != null ? o.seed >>> 0 : hashStr([o.skin, o.hair, o.top, o.bottom, hs, ageK, o.outfit, o.build].join('|'));
  const k = o._k || pxScale(c), u = 1 / k;

  // ---- proportions
  const r = h / A.heads / 2, rw = r * A.face, rC = r * k;
  const lod = rC < 5.5 ? 0 : rC < 14 ? 1 : 2;
  const stoop = A.stoop ? r * 0.16 : 0;
  const cy = y - h + r + stoop, chin = cy + r;
  const sh = chin + r * A.neck;
  const legL = h * A.leg, hipY = y - legL, torso = hipY - sh;
  const straight = o.pose === 'straight';
  const L = straight ? 0 : (o.lean ? Math.sign(o.lean) : (seed & 1 ? 1 : -1));
  const pcx = x + L * h * 0.013, scx = x + L * h * 0.003, hcx = x + L * h * 0.002;
  const wcx = (pcx + scx) / 2;
  const tilt = o.tilt != null ? o.tilt : -L * 0.045 + (mood === 'thinking' ? L * 0.08 : 0);
  const shY = (s) => sh + s * L * h * 0.005 + (A.stoop ? r * 0.04 : 0);
  const hipYs = (s) => hipY - s * L * h * 0.006;
  const swh = h * A.sw * B.sh * frame, wwh = swh * ({ toddler: 0.96, child: 0.92, teen: 0.86 }[ageK] || 0.82) * B.waist * (outfit === 'dress' ? 0.92 : 1); // children have no waist
  const hwh = swh * A.hip * B.hip * (o.frame === 'narrow' ? 1.08 : 1);
  const lw = r * A.lw * B.limb, aw = r * A.aw * B.limb;
  const ua = h * A.arm * 0.53, fa = h * A.arm * 0.47;
  const ow = S.line ? Math.max(0.75 * u, Math.min(h * 0.0055, 2.6 * u)) * (lod === 0 ? 0.8 : 1) : 0;
  const rimOn = S.rim || o.rim;
  const rimW = rimOn ? Math.max(1.4 * u, h * (S.rim ? 0.011 : 0.008)) : 0;
  const rimCol = typeof o.rim === 'string' ? o.rim : S.rimCol;
  const mw = (w) => Math.max(u, w); // minimum visible line width
  const det = (col, a = 0.3) => S.line ? ink(col) : toward(col, SHD, a);

  const G = [];
  const grp = (items, extra) => { const g = Object.assign({ items }, extra); G.push(g); return g; };
  const headTf = [hcx, chin, tilt];

  // ---- ground shadow
  if (!o.noShadow) {
    c.save(); c.fillStyle = 'rgba(20,20,40,.18)'; c.beginPath();
    c.ellipse(x + L * h * 0.004, y + h * 0.004, Math.max(hwh * 1.7, swh * 1.25), h * 0.022, 0, 0, TAU); c.fill(); c.restore();
  }

  // ---- hair behind the head and body
  const H = hair(c, hs, hcx, cy, r, rw, hc, lod, u, S, seed, ageK);
  if (H.back.length) grp(H.back, { tf: headTf, after: H.backAfter });

  // ---- legs, shoes, lower clothes
  const shoe = pickShoe(o, grown, lower, outfit, seed);
  const tall = shoe.kind === 'boot' || shoe.kind === 'rain', shoeW = lw * 1.12;
  const legCol = lower === 'trousers' ? bot : (o.tights || sk);
  const legs = [];
  for (const s of [-1, 1]) {
    const free = L !== 0 && s === -L;
    const hx = pcx + s * hwh * 0.5, hy = hipYs(s);
    const ax = L === 0 ? x + s * hwh * 0.55 : free ? hx + s * lw * 0.5 : hx - s * lw * 0.12;
    const ay = y - lw * 0.42 - (free ? lw * 0.06 : 0);
    const kx = lerp(hx, ax, 0.5) + (free ? -s * lw * (grown || ageK === 'teen' ? 0.3 : 0.12) : s * lw * 0.04), ky = lerp(hy, ay, 0.5) - (free ? lw * 0.06 : 0);
    legs.push({ s, free, hx, hy, ax, ay, kx, ky });
  }
  // bare / tights legs
  const skinLegs = [];
  for (const g of legs) {
    skinLegs.push(capItem(g.hx, g.hy, g.kx, g.ky, lw, lw * 0.86, legCol, 0.3, {warm: legCol === sk, kl: 0.5}));
    // the knee is a little narrower than the calf below it; the calf swells on the outer side
    const cx2 = lerp(g.kx, g.ax, 0.32) + g.s * lw * 0.03, cy2 = lerp(g.ky, g.ay, 0.32);
    skinLegs.push(capItem(g.kx, g.ky, cx2, cy2, lw * 0.8, lw * 0.86, legCol, 0.3, {warm: legCol === sk, kl: 0.5}));
    skinLegs.push(capItem(cx2, cy2, g.ax, g.ay, lw * 0.86, lw * (ageK === 'toddler' ? 0.68 : 0.56), legCol, 0.3, {warm: legCol === sk, kl: 0.5}));
  }
  if (lower !== 'trousers') grp(skinLegs);
  for (const g of legs) G.push(shoeGroup(c, shoe, g.ax + g.s * lw * 0.02, y, lw, g.s, g.free, sk, lod, u, S, det, lower === 'trousers'));

  if (lower === 'trousers' || lower === 'shorts') {
    const items = [];
    const wy = (s) => hipYs(s) - torso * 0.16;
    const pel = new Path2D();
    pel.moveTo(pcx - Math.min(hwh, wwh) * 0.94, wy(-1)); pel.lineTo(pcx + Math.min(hwh, wwh) * 0.94, wy(1));
    pel.lineTo(pcx + hwh * 1.04, hipYs(1) + lw * 0.45); pel.lineTo(pcx + lw * 0.12, hipY + lw * 0.5);
    pel.lineTo(pcx - lw * 0.12, hipY + lw * 0.5); pel.lineTo(pcx - hwh * 1.04, hipYs(-1) + lw * 0.45); pel.closePath();
    items.push({ p: pel, f: bot, d: hwh * 0.3 });
    for (const g of legs) {
      if (lower === 'trousers') {
        items.push(capItem(g.hx, g.hy, g.kx, g.ky, lw * 1.2, lw * 1.02, bot, 0.3, null));
        // straight hem resting on the shoe: higher over boots, so they read as boots under trousers
        const hy = y - shoeW * (tall ? 0.78 : shoe.kind === 'hightop' ? 0.66 : shoe.kind === 'sandal' || shoe.kind === 'flat' ? 0.3 : 0.4);
        const t = (hy - g.ky) / (g.ay - g.ky || 1), hx = lerp(g.kx, g.ax, t);
        items.push(segItem(g.kx, g.ky, hx, hy, lw * 1.02, lw * 0.98, bot, 0.3, null));
      } else {
        const ex = lerp(g.hx, g.kx, 0.62), ey = lerp(g.hy, g.ky, 0.62);
        items.push(segItem(g.hx, g.hy, ex + g.s * lw * 0.06, ey, lw * 1.22, lw * 1.3, bot, 0.3, null));
      }
    }
    grp(items, {
      after: () => {
        c.strokeStyle = det(bot, 0.32); c.lineWidth = mw(lw * 0.07);
        // waistband, fly; folds at the knee for long trousers
        if (lod >= 1) { c.beginPath(); c.moveTo(pcx - hwh * 0.98, wy(-1) + lw * 0.32); c.lineTo(pcx + hwh * 0.98, wy(1) + lw * 0.32); c.stroke(); }
        if (lod >= 2) {
          c.beginPath(); c.moveTo(pcx + lw * 0.08, hipY - torso * 0.06); c.quadraticCurveTo(pcx + lw * 0.1, hipY + lw * 0.2, pcx, hipY + lw * 0.36); c.stroke(); // fly, ends above the crotch
          for (const g of legs) {
            if (lower === 'trousers') {
              // a soft crease from the knee towards the inner ankle
              c.beginPath(); c.moveTo(g.kx + g.s * lw * 0.2, g.ky - lw * 0.15); c.quadraticCurveTo(g.kx - g.s * lw * 0.05, g.ky + lw * 0.35, g.kx - g.s * lw * 0.12, g.ky + lw * 0.8); c.stroke();
              c.beginPath(); c.moveTo(g.hx + g.s * lw * 0.42, g.hy - lw * 0.2); c.quadraticCurveTo(g.hx + g.s * lw * 0.2, g.hy + lw * 0.1, g.hx + g.s * lw * 0.05, g.hy - lw * 0.05); c.stroke(); // pocket
            } else {
              const ex = lerp(g.hx, g.kx, 0.62), ey = lerp(g.hy, g.ky, 0.62);
              c.beginPath(); c.moveTo(ex - lw * 0.6 + g.s * lw * 0.06, ey - lw * 0.16); c.lineTo(ex + lw * 0.6 + g.s * lw * 0.06, ey - lw * 0.16); c.stroke(); // turn-up
            }
          }
        }
      },
    });
  }

  // ---- neck
  const nk = r * (grown ? 0.28 : 0.25);
  const neckP = rr(hcx - nk, chin - r * 0.5, nk * 2, sh - chin + r * 0.75, nk * 0.6);
  grp([{ p: neckP, f: sk, d: nk * 0.5, warm: 1, kl: 0 }], {
    after: () => { c.clip(neckP); c.fillStyle = toward(sk, WARM, 0.16); c.beginPath(); c.ellipse(hcx, chin - r * 0.04, nk * 1.1, r * 0.17, tilt, 0, P); c.fill(); },
  });

  // ---- torso: top, skirt, dress
  const T = torsoParts();
  grp(T.items, { after: T.after });
  if (T.hood) grp(T.hood.items, { after: T.hood.after });

  // ---- front hair locks and braids, then head, face, hair cap, glasses
  if (H.locks.length) grp(H.locks, { tf: headTf, after: H.locksAfter });
  const earsOn = !H.hideEars;
  const head = new Path2D();
  const jaw = grown ? 0.5 : 0.6;
  head.moveTo(hcx, cy - r);
  head.bezierCurveTo(hcx + rw * 0.56, cy - r, hcx + rw, cy - r * 0.58, hcx + rw, cy - r * 0.02);
  head.bezierCurveTo(hcx + rw, cy + r * 0.55, hcx + rw * jaw, cy + r, hcx, cy + r);
  head.bezierCurveTo(hcx - rw * jaw, cy + r, hcx - rw, cy + r * 0.55, hcx - rw, cy - r * 0.02);
  head.bezierCurveTo(hcx - rw, cy - r * 0.58, hcx - rw * 0.56, cy - r, hcx, cy - r); head.closePath();
  const headItems = [];
  if (earsOn) for (const s of [-1, 1]) headItems.push({ p: ell(hcx + s * rw * 0.97, cy + r * 0.14, r * 0.17, r * 0.24), f: sk, d: r * 0.05, warm: 1, kl: 0 });
  headItems.push({ p: head, f: sk, d: r * 0.2, warm: 1, ks: 0.8, kl: 0.6 });
  grp(headItems, {
    tf: headTf,
    after: () => {
      if (earsOn && lod >= 1) { c.fillStyle = toward(sk, WARM, 0.25); for (const s of [-1, 1]) { c.beginPath(); c.ellipse(hcx + s * rw * 1.0, cy + r * 0.15, r * 0.07, r * 0.13, 0, 0, TAU); c.fill(); } }
      face(c, { hcx, cy, r, rw, A, mood, sk, hc, lod, u, o, S, L, grown, ageK, mw });
    },
  });
  if (H.front.length) grp(H.front, { tf: headTf, after: H.frontAfter });
  if (o.glasses) grp([], { tf: headTf, noRim: 1, after: () => glasses(c, o, hcx, cy, r, rw, A, lod, u, mw) });

  // ---- arms (after the head so a hand can reach the chin)
  const arms = o.arms || (L === 0 ? { l: ARMS.down, r: ARMS.down } : L < 0 ? { l: ARMS.down, r: ARMS.relax } : { l: ARMS.relax, r: ARMS.down });
  const sleeve = o.sleeves || ({ tee: 'short', dress: 'puff', hoodie: 'long', sweater: 'long', jacket: 'long', cardigan: 'long', uniform: 'long' })[outfit];
  const slCol = T.sleeveCol;
  for (const s of [-1, 1]) {
    const a = (s < 0 ? arms.l : arms.r) || ARMS.down, t1 = a[0], t2 = t1 + a[1];
    const jx = scx + s * (swh - aw * 0.6), jy = shY(s) + r * 0.16 + aw * 0.5;
    let ex = jx + s * Math.sin(t1) * ua, ey = jy + Math.cos(t1) * ua;
    let wx = ex + s * Math.sin(t2) * fa, wy = ey + Math.cos(t2) * fa;
    // poses that touch the body reach a point on it (two-bone IK), so they fit every age and build
    const is = (pose) => a === pose || (a[0] === pose[0] && a[1] === pose[1]); // a copied array counts too
    const goal = is(ARMS.chin) ? [hcx + s * rw * 0.5, chin + r * 1.0]
      : is(ARMS.hips) ? [wcx + s * (wwh + aw * 0.15), sh + torso * 0.66]
      : is(ARMS.pocket) ? [pcx + s * hwh * 1.0, hipY - torso * 0.02] : null;
    if (goal) {
      const dx = goal[0] - jx, dy = goal[1] - jy, d = Math.min(Math.max(Math.hypot(dx, dy), Math.abs(ua - fa) + 1e-3), (ua + fa) * 0.995);
      const base = Math.atan2(dy, dx), al = Math.acos(Math.max(-1, Math.min(1, (ua * ua + d * d - fa * fa) / (2 * ua * d))));
      const e1 = [jx + Math.cos(base + al) * ua, jy + Math.sin(base + al) * ua], e2 = [jx + Math.cos(base - al) * ua, jy + Math.sin(base - al) * ua];
      [ex, ey] = (e1[0] - jx) * s > (e2[0] - jx) * s ? e1 : e2; // the elbow bends away from the body
      const fl = Math.hypot(goal[0] - ex, goal[1] - ey) || 1;
      wx = ex + (goal[0] - ex) / fl * fa; wy = ey + (goal[1] - ey) / fl * fa;
    }
    const items = [capItem(ex, ey, wx, wy, aw * 0.88, aw * 0.7, sk, 0.3, {warm: 1, kl: 0.5})];
    if (sleeve !== 'long') items.unshift(capItem(jx, jy, ex, ey, aw, aw * 0.88, sk, 0.3, {warm: 1, kl: 0.5})); // hidden under a long sleeve
    let cuff = null;
    if (sleeve === 'long') {
      const cx2 = lerp(ex, wx, 0.9), cy2 = lerp(ey, wy, 0.9);
      items.push(capItem(jx, jy, ex, ey, aw * 1.32, aw * 1.2, slCol, 0.3, null));
      items.push(segItem(ex, ey, cx2, cy2, aw * 1.2, aw * 1.12, slCol, 0.3, null));
      cuff = [lerp(ex, wx, 0.78), lerp(ey, wy, 0.78), cx2, cy2];
    } else if (sleeve === 'short' || sleeve === 'puff') {
      const m = sleeve === 'puff' ? 0.42 : 0.56, mx = lerp(jx, ex, m), my = lerp(jy, ey, m);
      const w0 = sleeve === 'puff' ? aw * 1.75 : aw * 1.5, w1 = sleeve === 'puff' ? aw * 1.45 : aw * 1.38;
      items.push(segItem(jx, jy, mx, my, w0, w1, slCol, 0.3, null));
      cuff = [lerp(jx, ex, m - 0.08), lerp(jy, ey, m - 0.08), mx, my, w1];
    }
    const ang = Math.atan2(wy - ey, wx - ex);
    const type = o.hands || (goal ? 'mitt' : t1 > 1.2 ? 'open' : a[1] < -1.0 ? 'fist' : wy < ey - fa * 0.25 ? 'open' : 'mitt');
    const hand = handPaths(type, wx, wy, ang, s, aw, r * A.hand, lod);
    for (const p of hand.paths) items.push({ p, f: sk, warm: 1 });
    grp(items, {
      before: lod >= 1 ? (its) => {
        c.clip(T.path); c.fillStyle = 'rgba(40,28,80,.16)'; c.translate(aw * 0.16, aw * 0.12);
        for (const it of its) c.fill(it.p);
      } : null,
      after: () => {
        if (cuff && lod >= 1) {
          c.strokeStyle = det(slCol, 0.3); c.lineWidth = mw(aw * 0.08);
          const ca = Math.atan2(cuff[3] - cuff[1], cuff[2] - cuff[0]), w = (cuff[4] || aw * 1.1) * 0.5;
          const nx = -Math.sin(ca) * w, ny = Math.cos(ca) * w;
          c.beginPath(); c.moveTo(cuff[0] + nx, cuff[1] + ny); c.lineTo(cuff[0] - nx, cuff[1] - ny); c.stroke();
          if (sleeve === 'puff' && lod >= 2) { c.beginPath(); c.moveTo(jx - nx * 0.4, jy - ny * 0.4 + aw * 0.2); c.lineTo(lerp(jx, cuff[0], 0.7) - nx * 0.3, lerp(jy, cuff[1], 0.7) - ny * 0.3); c.stroke(); }
        }
        if (lod >= 1) { c.strokeStyle = toward(sk, WARM, 0.35); c.lineWidth = mw(aw * 0.06); for (const ln of hand.lines) { c.beginPath(); c.moveTo(ln[0], ln[1]); c.lineTo(ln[2], ln[3]); c.stroke(); } }
      },
    });
  }

  c.save();
  render(c, G, S, ow, rimW, rimCol, lod);
  c.restore();

  // ======================================================== torso (closure: shares the geometry)
  function torsoParts() {
    const items = []; const afters = [];
    const inner = o.inner || '#f3efe6';
    const jacketLike = outfit === 'jacket' || outfit === 'cardigan' || outfit === 'uniform';
    let hemY = hipY + torso * (outfit === 'tee' ? 0.0 : outfit === 'hoodie' ? 0.13 : jacketLike ? 0.17 : 0.1);
    const hemW = hwh * (jacketLike ? 1.12 : 1.06);
    const waistY = sh + torso * 0.6;
    const nW = r * 0.42;
    // skirt goes under the top
    if (lower === 'skirt') {
      const wy0 = hipY - torso * 0.14, hem = hipY + legL * (grown ? 0.4 : 0.34);
      const p = new Path2D();
      p.moveTo(pcx - hwh * 1.02, hipYs(-1) - torso * 0.14);
      p.bezierCurveTo(pcx - hwh * 1.15, wy0 + (hem - wy0) * 0.4, pcx - hwh * 1.45, hem - (hem - wy0) * 0.2, pcx - hwh * 1.62, hem - L * r * 0.06);
      p.quadraticCurveTo(pcx, hem + lw * 0.45, pcx + hwh * 1.62, hem + L * r * 0.06);
      p.bezierCurveTo(pcx + hwh * 1.45, hem - (hem - wy0) * 0.2, pcx + hwh * 1.15, wy0 + (hem - wy0) * 0.4, pcx + hwh * 1.02, hipYs(1) - torso * 0.14);
      p.closePath();
      items.push({ p, f: bot, d: hwh * 0.35 });
      afters.push(() => {
        c.strokeStyle = det(bot, 0.3); c.lineWidth = mw(r * 0.045);
        if (lod >= 1) for (const f of [-0.55, 0, 0.55]) { c.beginPath(); c.moveTo(pcx + f * hwh * 0.7, wy0 + (hem - wy0) * 0.3); c.lineTo(pcx + f * hwh * 1.12, hem + lw * 0.1); c.stroke(); }
      });
    }
    // the top garment (or the whole dress)
    const isDress = outfit === 'dress';
    if (isDress) hemY = hipY + legL * (grown ? 0.42 : 0.36);
    const p = new Path2D();
    const SL = { x: scx - swh, y: shY(-1) + r * 0.2 }, SR = { x: scx + swh, y: shY(1) + r * 0.2 };
    const AL = { x: scx - swh * 0.96, y: sh + torso * 0.3 }, AR = { x: scx + swh * 0.96, y: sh + torso * 0.3 };
    const WL = { x: wcx - wwh, y: waistY }, WR = { x: wcx + wwh, y: waistY };
    const dHem = isDress ? hwh * 1.65 : hemW;
    const HL = { x: pcx - dHem, y: (isDress ? hemY : hipYs(-1) + (hemY - hipY)) - (isDress ? L * r * 0.06 : 0) };
    const HR = { x: pcx + dHem, y: (isDress ? hemY : hipYs(1) + (hemY - hipY)) + (isDress ? L * r * 0.06 : 0) };
    p.moveTo(hcx - nW, shY(-1) - r * 0.08);
    p.quadraticCurveTo(scx - swh * 0.78, shY(-1) - r * 0.02, SL.x, SL.y);
    p.bezierCurveTo(SL.x - r * 0.07, SL.y + torso * 0.1, AL.x, AL.y - torso * 0.08, AL.x, AL.y);
    if (isDress) {
      p.bezierCurveTo(AL.x, AL.y + torso * 0.14, WL.x, WL.y - torso * 0.12, WL.x, WL.y);
      p.bezierCurveTo(WL.x - hwh * 0.2, WL.y + (hemY - WL.y) * 0.35, HL.x + hwh * 0.15, HL.y - (hemY - WL.y) * 0.3, HL.x, HL.y);
      p.quadraticCurveTo(pcx, hemY + lw * 0.5, HR.x, HR.y);
      p.bezierCurveTo(HR.x - hwh * 0.15, HR.y - (hemY - WR.y) * 0.3, WR.x + hwh * 0.2, WR.y + (hemY - WR.y) * 0.35, WR.x, WR.y);
    } else {
      p.bezierCurveTo(AL.x, AL.y + torso * 0.15, WL.x, WL.y - torso * 0.12, WL.x, WL.y);
      p.bezierCurveTo(WL.x, WL.y + torso * 0.14, HL.x, HL.y - torso * 0.14, HL.x, HL.y);
      p.quadraticCurveTo(pcx, hemY + r * 0.1, HR.x, HR.y);
      p.bezierCurveTo(HR.x, HR.y - torso * 0.14, WR.x, WR.y + torso * 0.14, WR.x, WR.y);
    }
    p.bezierCurveTo(WR.x, WR.y - torso * 0.12, AR.x, AR.y + torso * 0.15, AR.x, AR.y);
    p.bezierCurveTo(AR.x, AR.y - torso * 0.08, SR.x + r * 0.07, SR.y + torso * 0.1, SR.x, SR.y);
    p.quadraticCurveTo(scx + swh * 0.78, shY(1) - r * 0.02, hcx + nW, shY(1) - r * 0.08);
    const neckDip = outfit === 'uniform' || outfit === 'cardigan' ? r * 1.4 : outfit === 'jacket' ? r * 0.6 : r * 0.32;
    p.quadraticCurveTo(hcx, sh + neckDip, hcx - nW, shY(-1) - r * 0.08);
    p.closePath();
    const mainCol = top;
    items.push({ p, f: mainCol, d: swh * 0.32 });
    const clipTop = p;

    afters.push(() => {
      const ln = mw(r * 0.05); c.lineWidth = ln; c.strokeStyle = det(mainCol, 0.3);
      // patterns
      if (o.pattern && lod >= 1 && !jacketLike) {
        c.save(); c.clip(clipTop); c.fillStyle = mix(mainCol, 0.38); c.globalAlpha = 0.85;
        if (o.pattern === 'stripes') { const st = r * 0.36; for (let yy = sh + st * 0.6; yy < hemY + st; yy += st * 2) c.fillRect(pcx - swh * 3, yy, swh * 6, st * 0.85); }
        else if (o.pattern === 'dots') { const st = r * 0.42; let row = 0; for (let yy = sh + st * 0.8; yy < hemY; yy += st, row++) for (let xx = pcx - swh * 2 + (row % 2) * st * 0.5; xx < pcx + swh * 2; xx += st) { c.beginPath(); c.arc(xx, yy, st * 0.14, 0, TAU); c.fill(); } }
        c.restore();
      }
      if (outfit === 'tee' || outfit === 'sweater' || outfit === 'hoodie' || isDress) {
        // collar band
        c.lineWidth = mw(r * (outfit === 'sweater' ? 0.13 : 0.08)); c.strokeStyle = outfit === 'sweater' ? toward(mainCol, SHD, 0.18) : det(mainCol, 0.25);
        if (!(outfit === 'hoodie')) { c.beginPath(); c.moveTo(hcx - nW * 0.96, shY(-1) - r * 0.04); c.quadraticCurveTo(hcx, sh + neckDip * 0.95, hcx + nW * 0.96, shY(1) - r * 0.04); c.stroke(); }
        if (isDress && o.collar !== false && lod >= 1) { // a round collar
          c.fillStyle = o.collarCol || '#fbf7ef';
          for (const s of [-1, 1]) { c.beginPath(); c.ellipse(hcx + s * nW * 0.42, sh + r * 0.1, nW * 0.46, r * 0.15, s * 0.3, 0, TAU); c.fill(); }
          if (S.line) { c.strokeStyle = ink('#fbf7ef'); c.lineWidth = mw(ow); for (const s of [-1, 1]) { c.beginPath(); c.ellipse(hcx + s * nW * 0.42, sh + r * 0.1, nW * 0.46, r * 0.15, s * 0.3, 0, TAU); c.stroke(); } }
        }
      }
      c.lineWidth = ln; c.strokeStyle = det(mainCol, 0.3);
      if (isDress) { // waist seam + bow/belt, skirt folds
        c.fillStyle = o.belt || toward(mainCol, SHD, 0.22);
        c.beginPath(); c.moveTo(WL.x + r * 0.02, waistY - r * 0.08); c.lineTo(WR.x - r * 0.02, waistY - r * 0.08); c.lineTo(WR.x + r * 0.02, waistY + r * 0.1); c.lineTo(WL.x - r * 0.02, waistY + r * 0.1); c.closePath(); c.fill();
        if (lod >= 1) for (const f of [-0.6, -0.15, 0.35, 0.8]) { c.beginPath(); c.moveTo(wcx + f * wwh * 0.8, waistY + r * 0.25); c.quadraticCurveTo(pcx + f * hwh * 1.1, lerp(waistY, hemY, 0.6), pcx + f * hwh * 1.35, hemY + lw * 0.2); c.stroke(); }
      } else if (outfit === 'tee') {
        // no drawn folds on a tee: the shading gives it form, and short curves read as smiles
      } else if (outfit === 'sweater' || outfit === 'hoodie') {
        // ribbed hem band
        c.fillStyle = toward(mainCol, SHD, 0.16);
        c.beginPath(); c.moveTo(HL.x + r * 0.02, HL.y - r * 0.28); c.lineTo(HR.x - r * 0.02, HR.y - r * 0.28); c.lineTo(HR.x, HR.y); c.quadraticCurveTo(pcx, hemY + r * 0.1, HL.x, HL.y); c.closePath(); c.fill();
        if (lod >= 2 && outfit === 'sweater') { c.strokeStyle = toward(mainCol, SHD, 0.26); c.lineWidth = mw(r * 0.025); for (let i = -4; i <= 4; i++) { const xx = pcx + i * hemW * 0.22; c.beginPath(); c.moveTo(xx, hemY - r * 0.26); c.lineTo(xx, hemY - r * 0.02); c.stroke(); } }
        if (outfit === 'hoodie' && lod >= 1) { // kangaroo pocket
          c.strokeStyle = det(mainCol, 0.32); c.lineWidth = ln;
          const py0 = lerp(waistY, hemY, 0.25), py1 = hemY - r * 0.32, pw0 = hwh * 0.55, pw1 = hwh * 0.82;
          c.beginPath(); c.moveTo(pcx - pw1, py1); c.lineTo(pcx - pw0, py0); c.lineTo(pcx + pw0, py0); c.lineTo(pcx + pw1, py1); c.stroke();
        }
      }
      if (jacketLike) {
        // the shirt in the open front
        const half = r * (outfit === 'uniform' ? 0.42 : 0.3), bottomY = outfit === 'uniform' ? lerp(sh, hemY, 0.62) : hemY;
        const ip = new Path2D();
        ip.moveTo(hcx - nW * 0.92, shY(-1) - r * 0.04); ip.quadraticCurveTo(hcx, sh + r * 0.3, hcx + nW * 0.92, shY(1) - r * 0.04);
        if (outfit === 'uniform') { ip.lineTo(hcx + half, sh + r * 0.6); ip.lineTo(lerp(hcx, pcx, 0.6), bottomY); ip.lineTo(hcx - half, sh + r * 0.6); }
        else if (outfit === 'cardigan') { ip.lineTo(hcx + half * 0.7, lerp(sh, hemY, 0.45)); ip.lineTo(hcx - half * 0.7, lerp(sh, hemY, 0.45)); }
        else { ip.lineTo(pcx + half, bottomY + r * 0.02); ip.lineTo(pcx - half, bottomY + r * 0.02); }
        ip.closePath();
        c.save(); c.clip(clipTop); c.fillStyle = inner; c.fill(ip);
        if (o.pattern === 'stripes' && lod >= 1) { c.clip(ip); c.fillStyle = mix(inner, -0.12); const st = r * 0.3; for (let yy = sh; yy < hemY; yy += st * 2) c.fillRect(pcx - swh, yy, swh * 2, st * 0.8); }
        c.restore();
        if (outfit === 'uniform') {
          // shirt collar points, tie, crest
          c.fillStyle = inner; c.strokeStyle = det(inner, 0.25); c.lineWidth = mw(r * 0.035);
          for (const s of [-1, 1]) { c.beginPath(); c.moveTo(hcx + s * nk * 0.9, sh - r * 0.12); c.lineTo(hcx + s * nW * 1.05, sh + r * 0.18); c.lineTo(hcx + s * r * 0.08, sh + r * 0.22); c.closePath(); c.fill(); if (lod >= 1) c.stroke(); }
          const tie = o.tie || '#c0392b';
          c.fillStyle = tie; c.beginPath(); c.moveTo(hcx - r * 0.1, sh + r * 0.16); c.lineTo(hcx + r * 0.1, sh + r * 0.16); c.lineTo(hcx + r * 0.13, sh + r * 0.95); c.lineTo(hcx, sh + r * 1.12); c.lineTo(hcx - r * 0.13, sh + r * 0.95); c.closePath(); c.fill();
          if (lod >= 2) { c.strokeStyle = mix(tie, 0.35); c.lineWidth = mw(r * 0.05); for (const t of [0.4, 0.75]) { c.beginPath(); c.moveTo(hcx - r * 0.11, sh + r * t); c.lineTo(hcx + r * 0.11, sh + r * (t - 0.12)); c.stroke(); } }
          if (lod >= 1) { const bx = scx - L * 0 - swh * 0.5, by = sh + torso * 0.3; c.fillStyle = o.crest || '#f2c14e'; c.beginPath(); c.moveTo(bx - r * 0.16, by - r * 0.16); c.lineTo(bx + r * 0.16, by - r * 0.16); c.lineTo(bx + r * 0.16, by + r * 0.04); c.quadraticCurveTo(bx, by + r * 0.24, bx - r * 0.16, by + r * 0.04); c.closePath(); c.fill(); }
        }
        // lapels / zip / buttons
        c.strokeStyle = det(mainCol, 0.35); c.lineWidth = ln;
        if (outfit !== 'cardigan' && lod >= 1) for (const s of [-1, 1]) { c.beginPath(); c.moveTo(hcx + s * nW * 0.95, shY(s) - r * 0.04); c.lineTo(hcx + s * nW * 1.25, sh + r * 0.55); c.lineTo(hcx + s * (outfit === 'uniform' ? r * 0.42 : r * 0.3), sh + r * (outfit === 'uniform' ? 0.62 : 0.75)); c.stroke(); }
        if (outfit === 'cardigan' || outfit === 'uniform') {
          c.fillStyle = det(mainCol, 0.4); const bx = outfit === 'cardigan' ? hcx + r * 0.12 : lerp(hcx, pcx, 0.7) + r * 0.08;
          const ys = outfit === 'cardigan' ? [0.52, 0.66, 0.8, 0.93] : [0.72, 0.88];
          if (lod >= 1) for (const t of ys) { c.beginPath(); c.arc(lerp(bx, pcx + r * 0.12, t), lerp(sh, hemY, t), mw(r * 0.055), 0, TAU); c.fill(); }
        }
        if (outfit === 'jacket' && lod >= 2) { c.strokeStyle = mix(mainCol, 0.35); c.lineWidth = mw(r * 0.03); for (const s of [-1, 1]) { c.beginPath(); c.moveTo(pcx + s * r * 0.34, sh + r * 0.8); c.lineTo(pcx + s * half * 1.05, hemY - r * 0.05); c.stroke(); } }
        if (lod >= 1) { // pockets
          c.strokeStyle = det(mainCol, 0.35); c.lineWidth = ln;
          for (const s of [-1, 1]) { const px = pcx + s * hwh * 0.58, py = hemY - torso * 0.2; c.beginPath(); c.moveTo(px - hwh * 0.26, py); c.lineTo(px + hwh * 0.26, py); c.stroke(); }
        }
        // ribbed hem for the cardigan
        if (outfit === 'cardigan') { // one ribbed band along the hem, split by the opening
          c.fillStyle = toward(mainCol, SHD, 0.14); c.beginPath(); c.moveTo(HL.x + r * 0.02, HL.y - r * 0.26); c.lineTo(HR.x - r * 0.02, HR.y - r * 0.26); c.lineTo(HR.x, HR.y); c.quadraticCurveTo(pcx, hemY + r * 0.1, HL.x, HL.y); c.closePath(); c.fill();
          c.strokeStyle = det(mainCol, 0.35); c.lineWidth = ln; c.beginPath(); c.moveTo(lerp(hcx, pcx, 0.45) + r * 0.04, lerp(sh, hemY, 0.45)); c.lineTo(pcx + r * 0.04, hemY + r * 0.06); c.stroke();
        }
      }
    });

    // hoodie: the hood lies around the neck, strings hang from it
    let hood = null;
    if (outfit === 'hoodie') {
      const hp = new Path2D();
      hp.moveTo(hcx - nW * 1.35, shY(-1) - r * 0.12);
      hp.bezierCurveTo(hcx - nW * 1.5, sh + r * 0.45, hcx - nW * 0.4, sh + r * 0.62, hcx, sh + r * 0.6);
      hp.bezierCurveTo(hcx + nW * 0.4, sh + r * 0.62, hcx + nW * 1.5, sh + r * 0.45, hcx + nW * 1.35, shY(1) - r * 0.12);
      hp.quadraticCurveTo(hcx + nW * 0.9, shY(1) - r * 0.32, hcx + nW * 0.62, sh - r * 0.2);
      hp.quadraticCurveTo(hcx, sh + r * 0.22, hcx - nW * 0.62, sh - r * 0.2);
      hp.quadraticCurveTo(hcx - nW * 0.9, shY(-1) - r * 0.32, hcx - nW * 1.35, shY(-1) - r * 0.12);
      hp.closePath();
      hood = {
        items: [{ p: hp, f: toward(mainCol, SHD, 0.06), d: r * 0.12 }],
        after: () => {
          if (lod < 1) return;
          c.strokeStyle = o.strings || '#f4f1ea'; c.lineWidth = mw(r * 0.06);
          for (const s of [-1, 1]) { c.beginPath(); c.moveTo(hcx + s * r * 0.18, sh + r * 0.45); c.quadraticCurveTo(hcx + s * r * 0.24, sh + r * 0.85, hcx + s * r * 0.2 - L * r * 0.05, sh + r * 1.2); c.stroke(); }
        },
      };
    }
    return { items, after: () => { for (const f of afters) f(); }, hood, sleeveCol: mainCol, path: clipTop };
  }
}

// =====================================================================================
function pickShoe(o, grown, lower, outfit, seed) {
  const sh = o.shoe || o.shoes;
  if (sh && sh.kind) return { kind: sh.kind, col: sh.col || SHOE_COL[(seed >>> 3) % SHOE_COL.length] };
  const k = seed >>> 0;
  const girly = lower === 'skirt' || outfit === 'dress';
  const kinds = grown ? ['loafer', 'boot', 'sneaker', girly ? 'flat' : 'loafer'] : ['sneaker', 'hightop', girly ? 'flat' : 'sneaker', 'sandal', 'rain'];
  return { kind: kinds[k % kinds.length], col: SHOE_COL[(k >>> 3) % SHOE_COL.length] };
}

// Shoes in a three-quarter front view: the toe turns out a little, the ankle opening sits on the leg.
function shoeGroup(c, sh, fx, y, lw, s, free, sk, lod, u, S, det, underTrousers) {
  const col = sh.col, kind = sh.kind, w = lw * 1.12, to = s * w * (free ? 0.12 : 0.07);
  const mw = (v) => Math.max(u, v);
  const x0 = fx - w * 0.54 + to, x1 = fx + w * 0.54 + to, ax = lw * 0.36;
  const H = { sneaker: 0.6, hightop: 1.05, boot: 1.5, rain: 1.6, loafer: 0.5, flat: 0.42, sandal: 0.42 }[kind] || 0.55;
  const tall = kind === 'boot' || kind === 'rain' || kind === 'hightop';
  const ty = y - w * H;
  const solH = w * ({ sneaker: 0.17, hightop: 0.17, boot: 0.15, rain: 0.13, loafer: 0.09, flat: 0.08, sandal: 0.13 }[kind] || 0.12);
  // the upper
  const up = new Path2D();
  if (tall) {
    const sw = kind === 'hightop' ? ax * 1.05 : ax * 1.12, fy = y - w * 0.5;
    up.moveTo(x0, y - solH * 0.5);
    up.bezierCurveTo(x0 - w * 0.02, y - w * 0.36, fx - sw, fy + w * 0.08, fx - sw, fy);
    up.lineTo(fx - sw * 1.02, ty + w * 0.04);
    up.quadraticCurveTo(fx, ty - w * (kind === 'rain' ? 0.08 : 0.03), fx + sw * 1.02, ty + w * 0.04);
    up.lineTo(fx + sw, fy);
    up.bezierCurveTo(fx + sw, fy + w * 0.08, x1 + w * 0.02, y - w * 0.36, x1, y - solH * 0.5);
  } else {
    const oa = ax * (kind === 'sandal' ? 0.95 : 1.05);
    up.moveTo(x0, y - solH * 0.5);
    up.bezierCurveTo(x0 - w * 0.03, y - w * 0.34, fx - oa - w * 0.04, ty + w * 0.05, fx - oa, ty);
    up.quadraticCurveTo(fx, ty + w * 0.08, fx + oa, ty); // the opening dips a little at the front
    up.bezierCurveTo(fx + oa + w * 0.04, ty + w * 0.05, x1 + w * 0.03, y - w * 0.34, x1, y - solH * 0.5);
  }
  up.closePath();
  const sole = rr(x0 - w * 0.03, y - solH, x1 - x0 + w * 0.06, solH, [solH * 0.35, solH * 0.35, solH * 0.6, solH * 0.6]);
  const solCol = kind === 'sneaker' || kind === 'hightop' ? '#f6f3ec' : kind === 'sandal' ? toward(col, SHD, 0.25) : toward(col, SHD, 0.5);
  const items = [];
  if (kind === 'sandal') items.push({ p: up, f: sk, d: w * 0.12, warm: 1, kl: 0 });
  else items.push({ p: up, f: col, d: w * 0.16 });
  items.push({ p: sole, f: solCol });
  const after = () => {
    if (lod < 1) return;
    const cx = fx + to * 0.55;
    if (kind === 'sneaker' || kind === 'hightop') {
      // rubber toe cap, tongue, laces
      c.fillStyle = '#f6f3ec'; c.beginPath(); c.ellipse(fx + to * 1.05, y - solH, w * 0.3, w * 0.15, 0, P, TAU); c.fill();
      if (lod >= 2) {
        c.strokeStyle = col === '#f2f0ea' || col === '#f6f3ec' ? '#9aa0ae' : 'rgba(255,255,255,.9)'; c.lineWidth = mw(w * 0.045);
        const n = kind === 'hightop' ? 4 : 2, top = kind === 'hightop' ? ty + w * 0.16 : ty + w * 0.12, bot = y - w * 0.3;
        for (let i = 0; i < n; i++) { const yy = lerp(top, bot, n === 1 ? 0 : i / (n - 1)), hw = w * (0.1 + 0.03 * i / Math.max(1, n - 1)); c.beginPath(); c.moveTo(cx - hw, yy); c.lineTo(cx + hw, yy - w * 0.03); c.stroke(); }
      }
      if (kind === 'hightop') { c.fillStyle = '#f6f3ec'; c.beginPath(); c.arc(fx - s * ax * 0.55, y - w * 0.72, w * 0.085, 0, TAU); c.fill(); }
      if (lod >= 2) { c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = mw(w * 0.025); c.beginPath(); c.moveTo(x0 + w * 0.02, y - solH * 0.45); c.lineTo(x1 - w * 0.02, y - solH * 0.45); c.stroke(); }
    } else if (kind === 'boot') {
      if (!underTrousers) { c.fillStyle = mix(col, 0.12); c.beginPath(); c.moveTo(fx - ax * 1.14, ty + w * 0.04); c.quadraticCurveTo(fx, ty - w * 0.03, fx + ax * 1.14, ty + w * 0.04); c.lineTo(fx + ax * 1.13, ty + w * 0.2); c.quadraticCurveTo(fx, ty + w * 0.14, fx - ax * 1.13, ty + w * 0.2); c.closePath(); c.fill(); }
      if (lod >= 2) { c.strokeStyle = toward(col, SHD, 0.3); c.lineWidth = mw(w * 0.03); c.beginPath(); c.moveTo(x0 + w * 0.1, y - w * 0.3); c.quadraticCurveTo(fx + to, y - w * 0.52, x1 - w * 0.1, y - w * 0.3); c.stroke(); }
    } else if (kind === 'rain') {
      if (!underTrousers) {
        c.fillStyle = mix(col, 0.2); c.beginPath(); c.moveTo(fx - ax * 1.14, ty + w * 0.04); c.quadraticCurveTo(fx, ty - w * 0.1, fx + ax * 1.14, ty + w * 0.04); c.lineTo(fx + ax * 1.14, ty + w * 0.11); c.quadraticCurveTo(fx, ty - w * 0.02, fx - ax * 1.14, ty + w * 0.11); c.closePath(); c.fill();
        c.fillStyle = 'rgba(255,255,255,.38)'; c.beginPath(); c.roundRect(fx - ax * 0.75, ty + w * 0.22, w * 0.08, (y - w * 0.62) - (ty + w * 0.22), w * 0.04); c.fill();
      }
      c.fillStyle = 'rgba(255,255,255,.3)'; c.beginPath(); c.ellipse(fx + to * 0.8 - w * 0.18, y - w * 0.3, w * 0.09, w * 0.05, -0.4, 0, TAU); c.fill();
    } else if (kind === 'loafer') {
      c.strokeStyle = toward(col, SHD, 0.35); c.lineWidth = mw(w * 0.035);
      c.beginPath(); c.moveTo(fx - ax * 0.75 + to * 0.3, ty + w * 0.1); c.quadraticCurveTo(cx, y - solH - w * 0.02, fx + ax * 0.75 + to * 0.3, ty + w * 0.1); c.stroke();
      c.fillStyle = toward(col, SHD, 0.3); c.beginPath(); c.roundRect(cx - w * 0.17, ty + w * 0.08, w * 0.34, w * 0.07, w * 0.03); c.fill();
      c.fillStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.ellipse(cx - w * 0.15, y - w * 0.27, w * 0.11, w * 0.04, -0.3, 0, TAU); c.fill();
    } else if (kind === 'flat') {
      // a strap over the instep, fastened with a button on the outer side
      c.strokeStyle = col; c.lineWidth = mw(w * 0.09); c.lineCap = 'round';
      c.beginPath(); c.moveTo(fx - ax * 1.05, ty + w * 0.02); c.quadraticCurveTo(fx, ty - w * 0.16, fx + ax * 1.05, ty + w * 0.02); c.stroke();
      c.fillStyle = mix(col, 0.55); c.beginPath(); c.arc(fx + s * ax * 0.95, ty, mw(w * 0.05), 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.ellipse(cx - w * 0.14, y - w * 0.22, w * 0.1, w * 0.04, -0.3, 0, TAU); c.fill();
    } else if (kind === 'sandal') {
      c.fillStyle = col;
      c.beginPath(); c.moveTo(x0 + w * 0.06, y - solH - w * 0.04); c.quadraticCurveTo(cx, y - w * 0.36, x1 - w * 0.06, y - solH - w * 0.04); c.lineTo(x1 - w * 0.08, y - solH + w * 0.02); c.quadraticCurveTo(cx, y - w * 0.26, x0 + w * 0.08, y - solH + w * 0.02); c.closePath(); c.fill();
      c.strokeStyle = col; c.lineWidth = mw(w * 0.08); c.beginPath(); c.moveTo(fx - ax * 0.98, ty + w * 0.05); c.quadraticCurveTo(fx, ty + w * 0.16, fx + ax * 0.98, ty + w * 0.05); c.stroke();
      if (lod >= 2) { c.strokeStyle = toward(sk, WARM, 0.3); c.lineWidth = mw(w * 0.025); for (const f of [-0.2, 0, 0.2]) { c.beginPath(); c.moveTo(cx + f * w, y - solH - w * 0.02); c.lineTo(cx + f * w * 1.1, y - solH - w * 0.1); c.stroke(); } }
    }
  };
  return { items, after };
}

// =====================================================================================
function handPaths(type, X, Y, ang, s, aw, hl, lod) {
  const rot = ang - P / 2;
  const cs = Math.cos(rot), sn = Math.sin(rot);
  const th = Math.sign(-s * cs) || -s; // the thumb points to the body
  const pw = aw * 1.0;
  const T = (lx, ly) => [X + lx * cs - ly * sn, Y + lx * sn + ly * cs];
  const tEll = (lx, ly, rx, ry, rr2 = 0) => { const [a, b] = T(lx, ly); return ell(a, b, rx, ry, rr2 + rot); };
  const tCap = (ax, ay, bx, by, w0, w1) => { const [a, b] = T(ax, ay), [c2, d] = T(bx, by); return capsule(a, b, c2, d, w0, w1); };
  const paths = [], lines = [];
  const L2 = (ax, ay, bx, by) => { const [a, b] = T(ax, ay), [c2, d] = T(bx, by); lines.push([a, b, c2, d]); };
  if (type === 'open') {
    // a friendly open hand: a round palm, fingers held together (they touch, no gaps or grooves),
    // fingertips forming one soft arc, the thumb apart; spread fingers read as gills or a fork
    paths.push(tEll(0, hl * 0.3, pw * 0.56, hl * 0.33));
    if (lod === 0) { paths.push(tEll(0, hl * 0.6, pw * 0.5, hl * 0.3)); return { paths, lines }; }
    const fx = [-0.3, -0.1, 0.1, 0.3].map((f) => f * pw * th);
    const len = [0.84, 0.93, 0.9, 0.78];
    for (let i = 0; i < 4; i++) paths.push(tCap(fx[i], hl * 0.36, fx[i] * 1.06, hl * len[i], pw * 0.31, pw * 0.29));
    paths.push(tCap(th * pw * 0.38, hl * 0.26, th * pw * 0.74, hl * 0.46, pw * 0.32, pw * 0.28));
  } else if (type === 'fist') {
    paths.push(rrT(T, rot, -pw * 0.55, hl * 0.06, pw * 1.1, hl * 0.66, pw * 0.4));
    paths.push(tCap(th * pw * 0.5, hl * 0.2, -th * pw * 0.05, hl * 0.4, pw * 0.3, pw * 0.27));
    if (lod >= 1) for (const f of [-0.2, 0.08, 0.34]) L2(-th * pw * f, hl * 0.5, -th * pw * f, hl * 0.7);
  } else { // relaxed: fingers together, thumb apart
    paths.push(tEll(0, hl * 0.32, pw * 0.5, hl * 0.34));
    if (lod === 0) paths.push(rrT(T, rot, -pw * 0.43, hl * 0.3, pw * 0.86, hl * 0.6, pw * 0.42));
    else { // four fingers side by side, the middle one longest, curled a little towards the palm
      const fx = [-0.31, -0.1, 0.11, 0.31], len = [0.84, 0.97, 0.93, 0.8];
      for (let i = 0; i < 4; i++) { const f = fx[i] * th * pw; paths.push(tCap(f, hl * 0.4, f * 1.04, hl * len[i], pw * 0.27, pw * 0.24)); }
    }
    paths.push(tCap(th * pw * 0.36, hl * 0.2, th * pw * 0.52, hl * 0.56, pw * 0.27, pw * 0.22));
  }
  return { paths, lines };
}
function rrT(T, rot, x, y, w, h, rad) { const p = new Path2D(), m = new DOMMatrix(); const [a, b] = T(0, 0); m.translateSelf(a, b); m.rotateSelf(rot * 180 / P); p.addPath(rr(x, y, w, h, rad), m); return p; }

// =====================================================================================
function face(c, F) {
  const { hcx: x, cy, r, rw, A, mood: m, sk, hc, lod, u, o, S, L, grown, mw } = F;
  const es = r * A.eye, ex = rw * 0.38, ey = cy + r * A.ey;
  const dark = '#2a1e22';
  let lk = Math.max(-1, Math.min(1, o.look || 0)) * es * 0.35, lkY = (o.lookY || 0) * es * 0.3;
  if (m === 'thinking') { lk = (L || 1) * es * 0.38; lkY = -es * 0.4; }
  if (m === 'worried') lk = -(L || 1) * es * 0.25;
  const brow = toward(hc, [40, 25, 20], 0.45);
  // cheeks
  if (lod >= 1 && m !== 'angry') { c.fillStyle = 'rgba(240,105,95,.22)'; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(x + s * rw * 0.6, cy + r * 0.45, r * 0.17, r * 0.11, 0, 0, TAU); c.fill(); } }
  if (o.freckles && lod >= 1) { c.fillStyle = toward(sk, WARM, 0.45); for (const s of [-1, 1]) for (const [dx, dy] of [[0.5, 0.3], [0.62, 0.36], [0.55, 0.42], [0.42, 0.37]]) { c.beginPath(); c.arc(x + s * rw * dx, cy + r * dy, mw(r * 0.025), 0, TAU); c.fill(); } }
  const wide = m === 'surprised' ? 1.22 : 1;
  for (const s of [-1, 1]) {
    const px = x + s * ex;
    if (m === 'laugh') {
      c.strokeStyle = dark; c.lineWidth = mw(es * 0.34);
      c.beginPath(); c.arc(px, ey + es * 0.45, es * 0.72, P * 1.15, P * 1.85); c.stroke();
    } else if (lod < 2) {
      const ed = Math.max(es, 1.35 * u); // never smaller than about a pixel and a half
      c.fillStyle = dark; c.beginPath(); c.ellipse(px + lk * 0.6, ey + lkY * 0.6, ed * 0.62 * wide, ed * 0.8 * wide, 0, 0, TAU); c.fill();
      if (lod >= 1) { c.fillStyle = '#fff'; c.beginPath(); c.arc(px + lk * 0.6 + ed * 0.22, ey + lkY * 0.6 - ed * 0.25, Math.max(ed * 0.24, 0.6 * u), 0, TAU); c.fill(); }
    } else {
      const sw2 = es * 0.95 * wide, sh2 = es * 1.12 * wide;
      c.fillStyle = '#fff'; c.beginPath(); c.ellipse(px, ey, sw2, sh2, 0, 0, TAU); c.fill();
      c.save(); c.beginPath(); c.ellipse(px, ey, sw2, sh2, 0, 0, TAU); c.clip();
      const ir = es * (m === 'surprised' ? 0.55 : 0.72);
      c.fillStyle = o.eyes || '#5a3a26'; c.beginPath(); c.ellipse(px + lk, ey + es * 0.1 + lkY, ir * 0.92, ir * 1.05, 0, 0, TAU); c.fill();
      c.fillStyle = '#120c0c'; c.beginPath(); c.arc(px + lk, ey + es * 0.12 + lkY, ir * 0.55, 0, TAU); c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(px + lk + ir * 0.35, ey - es * 0.18 + lkY, ir * 0.3, 0, TAU); c.fill();
      c.beginPath(); c.arc(px + lk - ir * 0.3, ey + es * 0.38 + lkY, ir * 0.13, 0, TAU); c.fill();
      c.restore();
      c.strokeStyle = dark; c.lineWidth = mw(es * 0.2);
      c.beginPath(); c.ellipse(px, ey, sw2, sh2, 0, P * 1.05, P * 1.95); c.stroke();
      if (o.lashes) { c.lineWidth = mw(es * 0.14); for (const t of [0, 1]) { const a0 = s > 0 ? -0.35 - t * 0.35 : P + 0.35 + t * 0.35; c.beginPath(); c.moveTo(px + Math.cos(a0) * sw2, ey + Math.sin(a0) * sh2); c.lineTo(px + Math.cos(a0) * sw2 * 1.38, ey + Math.sin(a0) * sh2 * 1.3 - es * 0.08); c.stroke(); } }
      if (m === 'smile' || m === 'open') { c.fillStyle = sk; c.beginPath(); c.ellipse(px, ey + sh2 * 1.32, sw2 * 1.3, sh2 * 0.55, 0, 0, TAU); c.fill(); }
    }
    // lids for angry / sad / worried: a skin-coloured cut, inner or outer corner down
    if (m === 'angry' || m === 'sad' || m === 'worried') {
      const inner = px - s * es * 1.3, outer = px + s * es * 1.3;
      const yi = m === 'angry' ? ey - es * 0.25 : ey - es * 1.15, yo = m === 'angry' ? ey - es * 1.15 : ey - es * (m === 'sad' ? 0.35 : 0.6);
      c.fillStyle = sk; c.beginPath(); c.moveTo(inner, yi); c.lineTo(outer, yo); c.lineTo(outer, ey - es * 2.2); c.lineTo(inner, ey - es * 2.2); c.closePath(); c.fill();
      c.strokeStyle = dark; c.lineWidth = mw(es * 0.2); c.beginPath(); c.moveTo(lerp(inner, outer, 0.12), lerp(yi, yo, 0.12)); c.lineTo(lerp(inner, outer, 0.88), lerp(yi, yo, 0.88)); c.stroke();
    }
    // brows: always drawn, thick enough to read when small
    const by = ey - es * 1.85 - (m === 'surprised' ? es * 0.5 : m === 'laugh' ? es * 0.25 : 0);
    let yi = by, yo = by, arch = es * 0.3;
    if (m === 'sad' || m === 'worried') { yi = by - es * 0.45; yo = by + es * 0.2; arch = 0; }
    else if (m === 'angry') { yi = by + es * 0.55; yo = by - es * 0.2; arch = 0; }
    else if (m === 'thinking' && s === (L || 1)) { yi = yo = by - es * 0.4; }
    else if (m === 'thinking') { yi = yo = by + es * 0.15; arch = 0.1 * es; }
    c.strokeStyle = brow; c.lineWidth = Math.max(1.15 * u, r * (grown ? 0.07 : 0.075));
    c.beginPath(); c.moveTo(px - s * es * 0.9, yi); c.quadraticCurveTo(px, Math.min(yi, yo) - arch, px + s * es * 1.05, yo); c.stroke();
    if (F.ageK === 'older' && lod >= 2 && m !== 'laugh') { c.strokeStyle = toward(sk, WARM, 0.3); c.lineWidth = mw(r * 0.022); for (const d of [-0.25, 0.25]) { c.beginPath(); c.moveTo(px + s * es * 1.3, ey + d * es); c.lineTo(px + s * es * 1.75, ey + d * es * 1.8); c.stroke(); } }
  }
  // nose
  if (lod >= 1) {
    c.fillStyle = toward(sk, WARM, 0.25); c.beginPath(); c.ellipse(x, cy + r * 0.36, r * (grown ? 0.1 : 0.085), r * 0.06, 0, 0, TAU); c.fill();
    if (grown && lod >= 2) { c.strokeStyle = toward(sk, WARM, 0.3); c.lineWidth = mw(r * 0.03); c.beginPath(); c.moveTo(x + r * 0.03, cy + r * 0.12); c.quadraticCurveTo(x + r * 0.1, cy + r * 0.28, x + r * 0.06, cy + r * 0.34); c.stroke(); }
  }
  // mouth
  const my = cy + r * A.my, mwd = r * (grown ? 0.22 : 0.2), lineCol = '#7a2e36', inside = '#6e2230';
  const lw2 = Math.max(1.1 * u, r * 0.065);
  c.strokeStyle = lineCol; c.lineWidth = lw2;
  const openMouth = (wd, top, depth) => {
    c.fillStyle = inside; c.beginPath(); c.moveTo(x - wd, my + top); c.quadraticCurveTo(x, my + top + r * 0.04, x + wd, my + top);
    c.quadraticCurveTo(x + wd * 0.85, my + depth, x, my + depth); c.quadraticCurveTo(x - wd * 0.85, my + depth, x - wd, my + top); c.fill();
    if (lod >= 1) {
      c.save(); c.clip();
      c.fillStyle = '#fff'; c.fillRect(x - wd, my + top - r * 0.02, wd * 2, r * 0.09);
      c.fillStyle = '#e46f7e'; c.beginPath(); c.ellipse(x, my + depth, wd * 0.6, (depth - top) * 0.38, 0, 0, TAU); c.fill();
      c.restore();
    }
  };
  if (m === 'smile') { c.beginPath(); c.moveTo(x - mwd, my - r * 0.03); c.quadraticCurveTo(x, my + r * 0.17, x + mwd, my - r * 0.03); c.stroke(); }
  else if (m === 'calm') { c.beginPath(); c.moveTo(x - mwd * 0.7, my); c.quadraticCurveTo(x, my + r * 0.08, x + mwd * 0.7, my); c.stroke(); }
  else if (m === 'open') openMouth(mwd * 1.1, -r * 0.05, r * 0.28);
  else if (m === 'laugh') openMouth(mwd * 1.3, -r * 0.07, r * 0.38);
  else if (m === 'sad') { c.beginPath(); c.moveTo(x - mwd * 0.8, my + r * 0.1); c.quadraticCurveTo(x, my - r * 0.07, x + mwd * 0.8, my + r * 0.1); c.stroke(); }
  else if (m === 'angry') { c.beginPath(); c.moveTo(x - mwd * 0.85, my + r * 0.08); c.quadraticCurveTo(x, my - r * 0.02, x + mwd * 0.85, my + r * 0.08); c.stroke(); }
  else if (m === 'surprised') { c.fillStyle = inside; c.beginPath(); c.ellipse(x, my + r * 0.06, r * 0.1, r * 0.14, 0, 0, TAU); c.fill(); }
  else if (m === 'worried') { c.beginPath(); c.moveTo(x - mwd * 0.8, my + r * 0.06); c.quadraticCurveTo(x - mwd * 0.4, my - r * 0.03, x, my + r * 0.04); c.quadraticCurveTo(x + mwd * 0.4, my + r * 0.11, x + mwd * 0.8, my + r * 0.02); c.stroke(); }
  else if (m === 'thinking') { const ox = (L || 1) * r * 0.08; c.beginPath(); c.moveTo(x - mwd * 0.5 + ox, my + r * 0.05); c.lineTo(x + mwd * 0.55 + ox, my - r * 0.02); c.stroke(); }
  else { c.beginPath(); c.moveTo(x - mwd * 0.6, my + r * 0.03); c.lineTo(x + mwd * 0.6, my + r * 0.03); c.stroke(); }
  if (F.ageK === 'older' && lod >= 2) { c.strokeStyle = toward(sk, WARM, 0.28); c.lineWidth = mw(r * 0.025); for (const s of [-1, 1]) { c.beginPath(); c.arc(x + s * r * 0.08, my - r * 0.1, r * 0.33, s > 0 ? -0.25 : P + 0.25, s > 0 ? 0.45 : P - 0.45, s < 0); c.stroke(); } }
}

function glasses(c, o, x, cy, r, rw, A, lod, u, mw) {
  const ey = cy + r * A.ey, ex = rw * 0.38, gr = r * A.eye * 1.55;
  const col = o.glassesCol || '#2d2a36';
  // small on screen: a thin frame, or the lenses close up into dark masks
  c.lineWidth = lod === 0 ? Math.max(0.55 * u, r * 0.05) : Math.max(1.1 * u, r * 0.055); c.strokeStyle = col; c.fillStyle = 'rgba(255,255,255,.16)';
  if (lod === 0) c.globalAlpha = 0.8;
  for (const s of [-1, 1]) {
    c.beginPath();
    if (o.glasses === 'square') c.roundRect(x + s * ex - gr * 1.05, ey - gr * 0.85, gr * 2.1, gr * 1.7, gr * 0.35);
    else c.ellipse(x + s * ex, ey, gr, gr * 0.95, 0, 0, TAU);
    c.fill(); c.stroke();
    if (lod >= 1) { c.beginPath(); c.moveTo(x + s * (ex + gr), ey - gr * 0.2); c.lineTo(x + s * rw * 0.98, ey - gr * 0.35); c.stroke(); }
  }
  c.beginPath(); c.moveTo(x - ex + gr * 0.98, ey - gr * 0.1); c.quadraticCurveTo(x, ey - gr * 0.45, x + ex - gr * 0.98, ey - gr * 0.1); c.stroke();
  if (lod >= 2) { c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = mw(r * 0.03); for (const s of [-1, 1]) { c.beginPath(); c.arc(x + s * ex, ey, gr * 0.72, P * 1.15, P * 1.4); c.stroke(); } }
}

// =====================================================================================
// Hair: back (behind the head and body), locks (in front of the body), front (over the head).
function hair(c, st, x, cy, r, rw, hc, lod, u, S, seed, ageK) {
  const hcD = toward(hc, SHD, 0.3), hcL = mix(hc, 0.3);
  const back = [], front = [], locks = [];
  let hideEars = false, frontAfter = null, backAfter = null, locksAfter = null;
  const mw = (v) => Math.max(u, v);
  const it = (p, f = hc, d = r * 0.22) => ({ p, f, d });
  const grown = ageK === 'adult' || ageK === 'older';

  // a cap over the crown: sides at (±sx, sd), volume above the skull, then the hairline back
  const cap = (vol, sx, sd, hairline, spikes) => {
    const p = new Path2D();
    p.moveTo(x - rw * sx, cy + r * sd);
    if (spikes) {
      const n = 11;
      for (let i = 0; i <= n; i++) {
        const t = i / n, a = P + t * P, rad = i % 2 ? 1.0 : (i === 0 || i === n ? 1 : 1.2);
        const ry = r * (1.06 + vol) * rad;
        p.lineTo(x + Math.cos(a) * rw * 1.1 * (i % 2 ? 1 : 1.08), cy - r * 0.06 + Math.sin(a) * ry);
      }
      p.lineTo(x + rw * sx, cy + r * sd);
    } else {
      p.bezierCurveTo(x - rw * (sx + 0.1), cy - r * 0.55, x - rw * 0.72, cy - r * (1.1 + vol), x, cy - r * (1.12 + vol));
      p.bezierCurveTo(x + rw * 0.72, cy - r * (1.1 + vol), x + rw * (sx + 0.1), cy - r * 0.55, x + rw * sx, cy + r * sd);
    }
    hairline(p); p.closePath(); return p;
  };
  // scallops between hairline points (x, y as fractions), tips bend `sweep` to one side
  const scallops = (p, pts, depth, sweep) => {
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      p.quadraticCurveTo(x + rw * ((x0 + x1) / 2 + sweep), cy + r * (Math.max(y0, y1) + depth), x + rw * x1, cy + r * y1);
    }
  };
  const shine = (p, a0 = 1.18, a1 = 1.45, cx = -0.1) => () => {
    if (lod < 1) return;
    c.save(); c.clip(p);
    c.strokeStyle = hcL; c.globalAlpha = S.name === 'sticker' ? 0.9 : 0.6; c.lineWidth = r * 0.1;
    c.beginPath(); c.arc(x + rw * cx, cy + r * 0.05, r * 0.88, P * a0, P * a1); c.stroke();
    c.restore();
  };
  // a few strands that follow the way the hair is combed: [start, bend, end] as fractions of the head
  const strands = (p0, list) => () => {
    if (lod < 2) return;
    c.save(); c.clip(p0); c.strokeStyle = toward(hc, SHD, 0.22); c.lineWidth = mw(r * 0.03); c.globalAlpha = 0.7;
    for (const [sx, sy, cx1, cy1, ex1, ey1] of list) { c.beginPath(); c.moveTo(x + rw * sx, cy + r * sy); c.quadraticCurveTo(x + rw * cx1, cy + r * cy1, x + rw * ex1, cy + r * ey1); c.stroke(); }
    c.restore();
  };
  const both = (...fs) => () => { for (const f of fs) if (f) f(); };
  // a soft back volume so the head never reads as bald from the side
  const baseBack = (sx = 1.08, sy = 1.0) => back.push(it(ell(x, cy - r * 0.12, rw * sx, r * sy), hcD, r * 0.1));

  // side part with a sweeping fringe; `lockY` > 0 brings hair down past the ears
  const sidePart = (lockY) => (p) => {
    if (lockY) p.lineTo(x + rw * 0.9, cy + r * (lockY - 0.05)), p.quadraticCurveTo(x + rw * 0.98, cy - r * 0.15, x + rw * 0.72, cy - r * 0.55);
    else p.quadraticCurveTo(x + rw * 1.0, cy - r * 0.25, x + rw * 0.72, cy - r * 0.55);
    p.quadraticCurveTo(x + rw * 0.55, cy - r * 0.74, x + rw * 0.28, cy - r * 0.8);
    p.bezierCurveTo(x + rw * 0.05, cy - r * 0.45, x - rw * 0.55, cy - r * 0.55, x - rw * 0.84, cy - r * 0.05);
    if (lockY) p.quadraticCurveTo(x - rw * 0.92, cy + r * 0.3, x - rw * 0.9, cy + r * (lockY - 0.05));
    else p.lineTo(x - rw * 1.0, cy + r * 0.02);
  };
  const centrePart = (p) => {
    p.lineTo(x + rw * 0.96, cy - r * 0.05);
    p.quadraticCurveTo(x + rw * 0.78, cy - r * 0.66, x, cy - r * 0.84);
    p.quadraticCurveTo(x - rw * 0.78, cy - r * 0.66, x - rw * 0.96, cy - r * 0.05);
  };
  const bangs = (lockY) => (p) => {
    if (lockY) { p.lineTo(x + rw * 0.86, cy + r * lockY); p.quadraticCurveTo(x + rw * 0.95, cy - r * 0.1, x + rw * 0.84, cy - r * 0.3); }
    else p.lineTo(x + rw * 0.94, cy - r * 0.12), p.quadraticCurveTo(x + rw * 0.92, cy - r * 0.28, x + rw * 0.84, cy - r * 0.32);
    scallops(p, [[0.84, -0.32], [0.42, -0.3], [0, -0.33], [-0.42, -0.3], [-0.84, -0.32]], 0.1, 0.06);
    if (lockY) { p.quadraticCurveTo(x - rw * 0.95, cy - r * 0.1, x - rw * 0.86, cy + r * lockY); }
    else p.quadraticCurveTo(x - rw * 0.92, cy - r * 0.28, x - rw * 0.94, cy - r * 0.12);
  };

  let capP = null;
  switch (st) {
    case 'bald': {
      back.push(it(ell(x, cy + r * 0.02, rw * 1.08, r * 0.52), hcD, r * 0.1));
      for (const s of [-1, 1]) { // crescents of hair hugging the sides of the head, above and behind the ears
        const q = new Path2D();
        q.moveTo(x + s * rw * 0.9, cy - r * 0.5);
        q.quadraticCurveTo(x + s * rw * 1.16, cy - r * 0.3, x + s * rw * 1.1, cy + r * 0.32);
        q.quadraticCurveTo(x + s * rw * 1.02, cy + r * 0.05, x + s * rw * 0.97, cy - r * 0.05);
        q.quadraticCurveTo(x + s * rw * 0.98, cy - r * 0.32, x + s * rw * 0.9, cy - r * 0.5); q.closePath();
        front.push(it(q, hc, r * 0.06));
      }
      break;
    }
    case 'buzz': {
      baseBack(1.03, 0.98);
      capP = cap(0.03, 1.02, -0.02, (p) => { p.lineTo(x + rw * 0.95, cy - r * 0.3); p.quadraticCurveTo(x + rw * 0.6, cy - r * 0.64, x, cy - r * 0.6); p.quadraticCurveTo(x - rw * 0.6, cy - r * 0.64, x - rw * 0.95, cy - r * 0.3); });
      front.push(it(capP, hc, r * 0.12));
      break;
    }
    case 'spiky': {
      baseBack();
      capP = cap(0.14, 1.06, 0.02, (p) => { p.lineTo(x + rw * 0.95, cy - r * 0.2); scallops(p, [[0.95, -0.2], [0.6, -0.42], [0.2, -0.38], [-0.2, -0.42], [-0.6, -0.36], [-0.97, -0.15]], 0.2, -0.1); p.lineTo(x - rw * 1.0, cy + r * 0.02); }, true);
      front.push(it(capP));
      break;
    }
    case 'side': {
      baseBack();
      capP = cap(0.24, 1.07, 0.02, (p) => {
        p.lineTo(x + rw * 0.97, cy - r * 0.2); p.quadraticCurveTo(x + rw * 0.85, cy - r * 0.62, x + rw * 0.2, cy - r * 0.64);
        p.quadraticCurveTo(x - rw * 0.3, cy - r * 0.62, x - rw * 0.5, cy - r * 0.8); p.quadraticCurveTo(x - rw * 0.85, cy - r * 0.55, x - rw * 0.97, cy - r * 0.15); p.lineTo(x - rw * 1.0, cy + r * 0.02);
      });
      front.push(it(capP));
      frontAfter = both(shine(capP, 1.25, 1.5, 0.05), strands(capP, [[-0.45, -0.84, 0.05, -1.08, 0.6, -0.92], [-0.38, -0.74, 0.15, -0.86, 0.78, -0.6]]));
      break;
    }
    case 'curly': case 'afro': {
      const big = st === 'afro';
      const R = big ? 1.5 : 1.12, bump = big ? 0.3 : 0.34, ccy = cy - r * (big ? 0.28 : 0.08);
      const p = new Path2D(); const n = big ? 18 : 15;
      for (let i = 0; i < n; i++) {
        const a = (big ? P * 0.72 : P * 0.82) + i * ((big ? P * 1.56 : P * 1.36) / (n - 1));
        p.moveTo(x + Math.cos(a) * rw * R + r * bump, ccy + Math.sin(a) * r * R);
        p.arc(x + Math.cos(a) * rw * R, ccy + Math.sin(a) * r * R, r * bump, 0, TAU);
      }
      p.moveTo(x + rw * R, ccy); p.ellipse(x, ccy, rw * R, r * R, 0, 0, TAU);
      back.push(it(p, hc, r * 0.3));
      backAfter = () => {
        if (lod < 1) return;
        c.fillStyle = hcL; c.globalAlpha = 0.55;
        const m = lod >= 2 ? 16 : 7;
        for (let i = 0; i < m; i++) { const a = P * (1.05 + (i / m) * 0.9), rr2 = (0.75 + ((seed >> i) & 3) * 0.08) * R; c.beginPath(); c.arc(x + Math.cos(a) * rw * rr2 - rw * 0.1, ccy + Math.sin(a) * r * rr2, r * (lod >= 2 ? 0.06 : 0.08), 0, TAU); c.fill(); }
        c.globalAlpha = 1;
      };
      capP = cap(big ? 0.0 : 0.1, 1.0, 0.05, (p2) => {
        if (big) { p2.lineTo(x + rw * 0.95, cy - r * 0.15); p2.quadraticCurveTo(x + rw * 0.8, cy - r * 0.62, x, cy - r * 0.62); p2.quadraticCurveTo(x - rw * 0.8, cy - r * 0.62, x - rw * 0.95, cy - r * 0.15); }
        else { p2.lineTo(x + rw * 0.95, cy - r * 0.12); scallops(p2, [[0.95, -0.12], [0.55, -0.38], [0.1, -0.42], [-0.35, -0.38], [-0.75, -0.3], [-0.98, -0.05]], 0.14, 0); }
      });
      front.push(it(capP, hc, r * 0.15));
      break;
    }
    case 'bob': {
      hideEars = true;
      const p = new Path2D();
      p.moveTo(x - rw * 1.1, cy - r * 0.2);
      p.bezierCurveTo(x - rw * 1.32, cy + r * 0.3, x - rw * 1.36, cy + r * 0.82, x - rw * 1.08, cy + r * 0.92);
      p.quadraticCurveTo(x, cy + r * 1.08, x + rw * 1.08, cy + r * 0.92);
      p.bezierCurveTo(x + rw * 1.36, cy + r * 0.82, x + rw * 1.32, cy + r * 0.3, x + rw * 1.1, cy - r * 0.2);
      p.ellipse(x, cy - r * 0.2, rw * 1.1, r * 1.0, 0, 0, P, true); p.closePath();
      back.push(it(p, hcD, r * 0.15));
      capP = cap(0.12, 1.16, 0.84, bangs(0.78));
      front.push(it(capP));
      frontAfter = shine(capP);
      break;
    }
    case 'long': case 'wavy': {
      hideEars = true;
      const wav = st === 'wavy', end = wav ? 2.15 : 2.75;
      const p = new Path2D();
      p.moveTo(x - rw * 1.1, cy - r * 0.2);
      if (wav) { p.quadraticCurveTo(x - rw * 1.45, cy + r * 0.35, x - rw * 1.25, cy + r * 0.9); p.quadraticCurveTo(x - rw * 1.1, cy + r * 1.4, x - rw * 1.35, cy + r * end); }
      else p.bezierCurveTo(x - rw * 1.3, cy + r * 0.7, x - rw * 1.32, cy + r * 1.9, x - rw * 1.18, cy + r * end);
      p.lineTo(x + rw * 1.18, cy + r * end);
      if (wav) { p.quadraticCurveTo(x + rw * 1.1, cy + r * 1.4, x + rw * 1.25, cy + r * 0.9); p.quadraticCurveTo(x + rw * 1.45, cy + r * 0.35, x + rw * 1.1, cy - r * 0.2); }
      else p.bezierCurveTo(x + rw * 1.32, cy + r * 1.9, x + rw * 1.3, cy + r * 0.7, x + rw * 1.1, cy - r * 0.2);
      p.ellipse(x, cy - r * 0.2, rw * 1.1, r * 1.0, 0, 0, P, true); p.closePath();
      back.push(it(p, hcD, r * 0.15));
      for (const s of [-1, 1]) { // locks over the shoulders
        const q = new Path2D(), e = end - (wav ? 0.15 : 0.1);
        q.moveTo(x + s * rw * 1.14, cy + r * 0.35);
        if (wav) { q.quadraticCurveTo(x + s * rw * 1.4, cy + r * 1.0, x + s * rw * 1.2, cy + r * 1.45); q.quadraticCurveTo(x + s * rw * 1.05, cy + r * 1.8, x + s * rw * 1.2, cy + r * e); }
        else q.bezierCurveTo(x + s * rw * 1.26, cy + r * 1.2, x + s * rw * 1.3, cy + r * 1.9, x + s * rw * 1.08, cy + r * e);
        q.quadraticCurveTo(x + s * rw * 0.95, cy + r * (e - 0.35), x + s * rw * 0.9, cy + r * (e - 0.6));
        q.bezierCurveTo(x + s * rw * 0.88, cy + r * 1.4, x + s * rw * 0.86, cy + r * 0.9, x + s * rw * 0.86, cy + r * 0.5); q.closePath();
        locks.push(it(q, hc, r * 0.18));
      }
      locksAfter = () => { if (lod < 2) return; c.strokeStyle = hcD; c.lineWidth = mw(r * 0.035); for (const s of [-1, 1]) { c.beginPath(); c.moveTo(x + s * rw * 1.02, cy + r * 0.9); c.quadraticCurveTo(x + s * rw * 1.12, cy + r * 1.6, x + s * rw * 1.05, cy + r * (end - 0.4)); c.stroke(); } };
      capP = cap(0.14, 1.14, 0.62, sidePart(0.62));
      front.push(it(capP));
      frontAfter = both(shine(capP), strands(capP, [[0.28, -0.8, -0.2, -0.75, -0.7, -0.35], [0.28, -0.8, 0.6, -0.85, 0.92, -0.3]]));
      break;
    }
    case 'pony': {
      baseBack(1.06);
      const p = new Path2D();
      p.moveTo(x + rw * 0.55, cy - r * 0.92);
      p.bezierCurveTo(x + rw * 1.85, cy - r * 1.1, x + rw * 1.85, cy + r * 0.7, x + rw * 1.4, cy + r * 1.55);
      p.bezierCurveTo(x + rw * 1.48, cy + r * 0.75, x + rw * 1.3, cy - r * 0.15, x + rw * 0.9, cy - r * 0.3); p.closePath();
      back.push(it(p, hc, r * 0.2));
      capP = cap(0.1, 1.06, 0.04, sidePart(0));
      front.push(it(capP));
      frontAfter = both(shine(capP), () => { c.fillStyle = '#e4577a'; c.beginPath(); c.ellipse(x + rw * 0.86, cy - r * 0.7, r * 0.1, r * 0.15, 0.6, 0, TAU); c.fill(); });
      break;
    }
    case 'pigtails': {
      baseBack(1.06);
      for (const s of [-1, 1]) back.push(it(ell(x + s * rw * 1.36, cy + r * 0.42, r * 0.33, r * 0.52, s * -0.45), hc, r * 0.15));
      capP = cap(0.1, 1.06, 0.04, bangs(0));
      front.push(it(capP));
      frontAfter = both(shine(capP), () => { c.fillStyle = '#e4577a'; for (const s of [-1, 1]) { c.beginPath(); c.arc(x + s * rw * 1.1, cy - r * 0.02, r * 0.11, 0, TAU); c.fill(); } });
      break;
    }
    case 'braids': {
      baseBack(1.06);
      const end = grown ? 2.9 : 2.5;
      for (const s of [-1, 1]) {
        const n = 6;
        for (let i = 0; i < n; i++) {
          const t = i / (n - 1), bx = x + s * rw * (0.98 + t * 0.12), by = cy + r * (0.55 + t * (end - 0.9));
          locks.push(it(ell(bx + (i % 2 ? s : -s) * r * 0.03, by, r * (0.22 - t * 0.05), r * 0.24, (i % 2 ? 0.35 : -0.35)), hc, r * 0.08));
        }
        locks.push(it(ell(x + s * rw * 1.1, cy + r * (end - 0.2), r * 0.15, r * 0.22), hc, r * 0.06));
      }
      locksAfter = () => { c.fillStyle = '#f0a83c'; for (const s of [-1, 1]) { c.beginPath(); c.roundRect(x + s * rw * 1.1 - r * 0.13, cy + r * (end - 0.42), r * 0.26, r * 0.1, r * 0.04); c.fill(); } };
      capP = cap(0.08, 1.04, 0.1, centrePart);
      front.push(it(capP));
      frontAfter = shine(capP);
      break;
    }
    case 'bun': {
      baseBack(1.05);
      back.push(it(ell(x, cy - r * 1.2, r * 0.44, r * 0.4), hc, r * 0.14));
      capP = cap(0.08, 1.04, 0.04, grown ? centrePart : sidePart(0));
      front.push(it(capP));
      frontAfter = both(shine(capP), () => { c.fillStyle = o_bunTie(hc); c.beginPath(); c.ellipse(x, cy - r * 1.02, r * 0.22, r * 0.07, 0, 0, TAU); c.fill(); });
      break;
    }
    default: { // short
      baseBack();
      capP = cap(0.17, 1.07, 0.02, (p) => {
        p.lineTo(x + rw * 0.97, cy - r * 0.18);
        scallops(p, [[0.97, -0.18], [0.62, -0.45], [0.18, -0.42], [-0.28, -0.46], [-0.7, -0.36], [-0.98, -0.12]], 0.13, -0.12);
        p.lineTo(x - rw * 1.0, cy + r * 0.02);
      });
      front.push(it(capP));
      frontAfter = both(shine(capP), strands(capP, [[0.4, -1.15, 0.0, -1.0, -0.38, -0.56], [0.78, -0.98, 0.5, -0.8, 0.18, -0.52]]));
    }
  }
  return { back, front, locks, hideEars, frontAfter, backAfter, locksAfter };
}
function o_bunTie(hc) { return mix(hc, 0.45); }
