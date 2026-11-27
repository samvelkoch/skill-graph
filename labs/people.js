// Skill Graph — the shared picture-book people for labs. Pure canvas 2D, no dependencies.
//
// Two entry points:
//   drawPerson(c, x, footY, h, o)  a standing person seen from the front: line-ups, scenes, close-ups
//   drawRig(c, rig, o)             a person in ANY pose and turn, drawn from joint positions: dance, sport, walking
//
// ---- drawRig -------------------------------------------------------------------------------------------
// The lab owns the pose (its own skeleton, 2D or 3D) and gives the joints already projected to the canvas.
// Every point is [x, y, z]: canvas x and y, and z = depth, larger is nearer to the viewer.
//   rig.k        canvas units per centimetre of the body (all thicknesses follow it)
//   rig.hipL kneeL ankL heelL ballL toeL   and the same with R      a leg and its foot
//   rig.shL elbL wristL handL              and the same with R      an arm
//   rig.pelvis, rig.chest  the middle of the hips and the base of the neck
//   rig.head     the centre of the head;  rig.headR its radius;  rig.headUp [x, y] unit vector to the crown
//   rig.yaw      the turn of the head, radians: 0 faces the viewer, +PI/2 is a profile looking right, PI is the back
//   rig.skirt    optional { rings: [[points…], …], z, r, alpha, col: [light, mid, dark] }  a tutu or a gown:
//                rings of projected points from the waist down; the module paints them behind and in front of the body
//   rig.layers   optional [{ z, draw(c) }]  props of a costume (wings, a crown) sorted in with the body
// Options o:
//   skin, hair, top, legs (tights or trousers), shoe: colours
//   outfit   'leotard' (the top colour also covers the hips) | 'fitted' (a fitted top, the hips in the legs colour)
//   sleeves  'none' | 'short' | 'long'          hairStyle 'bun' | 'short'
//   ribbons  0…1 pointe-shoe ribbons            heel 0…1 a heeled court shoe       mood 'smile' | 'calm'
// The foot is drawn from heel, ball and toe, so a flat foot, a demi-pointe (relevé) and a full pointe are
// just different joint positions. The head is drawn front, three-quarter, profile or from the back by rig.yaw.
//
// ---- drawPerson ----------------------------------------------------------------------------------------
//
// drawPerson(c, x, footY, h, o)   x: centre, footY: ground line, h: full height (canvas units)
//
// Options (all optional):
//   adult, skin, hair, hairStyle, top, bottom, skirt, dress, shoe | shoes: { kind, col }
//   arms: { l, r }   arrays [upper angle, forearm relative]; 0 hangs down, + goes outwards; l is the arm on the left of the screen
//   mood     smile | calm | open | laugh | sad | angry | surprised | worried | thinking | flat
//   look     -1…1 eye direction        noShadow, lashes, freckles
//   age      toddler | child | teen | adult | older        build   slim | average | round (wider torso, waist, hips; thicker arms and legs)
//   outfit   tee | hoodie | sweater | jacket | cardigan | uniform | dress      inner, tie: colours
//   lower    trousers | shorts | skirt       tights: true | colour      sleeves: short | long | none
//   shoe     { kind: sneaker | hightop | boot | rain | loafer | flat | ballet | sandal, col }
//   bald: true, or hairStyle 'bald'; an unknown hairStyle is drawn as short
//   hairStyle short | side | spiky | buzz | bob | long | wavy | pony | pigtails | braids | bun | curly | afro | bald
//   glasses  true | 'round' | 'square'      rim: true | colour — a light outline for dark scenes
//   pose: 'straight' (no weight shift)      lean: -1 | 1 (the weight leg)      tilt: head tilt, radians
//
// Light comes from the top left. Every part is a flat shape in its shadow colour with a slightly
// smaller lit copy on top, so there are no outlines, no gradients and no fold lines.
// Detail follows the size on screen: the head radius is measured in CSS pixels.

const PI = Math.PI, TAU = PI * 2;
const COOL = [58, 44, 104], WARM = [168, 66, 58], WHITE = [255, 255, 255], DARK = [28, 20, 38];

// ---------- colour
const CC = new Map();
function rgb(col) {
  if (typeof col !== 'string') return [128, 128, 128];
  if (col[0] === '#') {
    let s = col.slice(1); if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
    const n = parseInt(s.slice(0, 6), 16);
    return n === n ? [n >> 16 & 255, n >> 8 & 255, n & 255] : [128, 128, 128];
  }
  const m = col.match(/[\d.]+/g); return m && m.length >= 3 ? [+m[0], +m[1], +m[2]] : [128, 128, 128];
}
// a colour moved towards the rgb triple `t` by `a`; always returns hex
function tow(col, t, a) {
  const key = col + '|' + t[0] + ',' + t[1] + ',' + t[2] + '|' + a; let v = CC.get(key); if (v) return v;
  const q = rgb(col), f = (i) => Math.max(0, Math.min(255, Math.round(q[i] + (t[i] - q[i]) * a)));
  v = '#' + ((1 << 24) | (f(0) << 16) | (f(1) << 8) | f(2)).toString(16).slice(1);
  if (CC.size > 4000) CC.clear(); CC.set(key, v); return v;
}

// ---------- tables
export const ARMS = {
  down: [0.16, -0.08], rest: [0.8, -1.35], hold: [0.14, -1.7], wave: [2.5, 0.4], open: [0.8, 0.25], up: [2.9, 0.15], back: [0.05, 0],
  relax: [0.2, -0.34], hips: [0.85, -1.75], chin: [0.15, -2.9], point: [1.5, 0.05],
};
export const MOODS = ['smile', 'calm', 'open', 'laugh', 'sad', 'angry', 'surprised', 'worried', 'thinking', 'flat'];
export const HAIR_STYLES = ['short', 'side', 'spiky', 'buzz', 'bob', 'long', 'wavy', 'pony', 'pigtails', 'braids', 'bun', 'curly', 'afro', 'bald'];
// how tall each age is next to an adult; with these a child's head is 92% of an adult's
export const HEIGHTS = { toddler: 0.55, child: 0.76, teen: 0.92, adult: 1, older: 0.95 };

// heads: height in heads; leg, shw (half shoulders), hipw (half hips), arm, aw (arm width), lw (leg width), slope, foot: parts of h;
// neck: in head radii; rw: head width / height; eyeY: eye line below the head centre, in radii; eye: eye size factor
const AGES = {
  toddler: { heads: 3.6,  leg: 0.33,  shw: 0.146, hipw: 0.122, neck: 0.10, arm: 0.33, aw: 0.066, lw: 0.096, slope: 0.012, foot: 0.054, rw: 0.96, eyeY: 0.20, eye: 1.12, mouthY: 0.56 },
  child:   { heads: 4.6,  leg: 0.42,  shw: 0.126, hipw: 0.104, neck: 0.22, arm: 0.37, aw: 0.055, lw: 0.082, slope: 0.015, foot: 0.052, rw: 0.94, eyeY: 0.16, eye: 1.05, mouthY: 0.56 },
  teen:    { heads: 5.3,  leg: 0.46,  shw: 0.122, hipw: 0.098, neck: 0.32, arm: 0.39, aw: 0.050, lw: 0.075, slope: 0.018, foot: 0.050, rw: 0.90, eyeY: 0.11, eye: 1.0,  mouthY: 0.58 },
  adult:   { heads: 5.6,  leg: 0.475, shw: 0.128, hipw: 0.100, neck: 0.36, arm: 0.40, aw: 0.050, lw: 0.076, slope: 0.020, foot: 0.050, rw: 0.88, eyeY: 0.08, eye: 0.95, mouthY: 0.60 },
  older:   { heads: 5.35, leg: 0.455, shw: 0.120, hipw: 0.102, neck: 0.24, arm: 0.39, aw: 0.048, lw: 0.074, slope: 0.028, foot: 0.050, rw: 0.89, eyeY: 0.09, eye: 0.90, mouthY: 0.60 },
};
const OUTFITS = { tee: 1, hoodie: 1, sweater: 1, jacket: 1, cardigan: 1, uniform: 1, dress: 1 };
// fh: height at the ankle, th: toe height, sole, shaft: parts of h
const SHOES = {
  sneaker: { fh: 0.054, th: 0.044, sole: 0.012 },
  hightop: { fh: 0.054, th: 0.044, sole: 0.012, shaft: 0.098 },
  boot:    { fh: 0.052, th: 0.040, sole: 0.013, shaft: 0.125 },
  rain:    { fh: 0.052, th: 0.042, sole: 0.010, shaft: 0.165 },
  loafer:  { fh: 0.044, th: 0.033, sole: 0.009 },
  flat:    { fh: 0.034, th: 0.026, sole: 0.005 },
  sandal:  { fh: 0.034, th: 0.022, sole: 0.011 },
  ballet:  { fh: 0.030, th: 0.022, sole: 0.003 },
};
const SHOE_COL = ['#e9564f', '#2f6fd6', '#f2f0ea', '#e7a33a', '#4c9a6a', '#c0466f'];
// brows: [inner end down, outer end down, lift, arch] in head radii; eye; mouth
const FACES = {
  smile:     { b: [0, 0, 0, 0.06],          e: 'dot',  m: 'smile' },
  calm:      { b: [0, 0, 0, 0.04],          e: 'dot',  m: 'calm' },
  open:      { b: [-0.02, 0, 0.08, 0.08],   e: 'dot',  m: 'open' },
  laugh:     { b: [-0.02, 0, 0.10, 0.08],   e: 'arc',  m: 'laugh' },
  sad:       { b: [-0.17, 0.10, 0, 0],      e: 'low',  m: 'frown' },
  angry:     { b: [0.21, -0.12, -0.10, 0],  e: 'dot',  m: 'tight' },
  surprised: { b: [-0.02, 0, 0.13, 0.12],   e: 'wide', m: 'o' },
  worried:   { b: [-0.20, 0.07, 0.03, 0.02], e: 'wide', m: 'wobble' },
  thinking:  { b: [0, 0, 0, 0.04],          e: 'side', m: 'side', asym: 1 },
  flat:      { b: [0, 0, 0, 0],             e: 'dot',  m: 'flat' },
};
// hairlines, from the right temple to the left one, in (head half-width, head radius) units from the head centre.
// [x, y] is a straight line, [cx, cy, x, y] a curve.
const FR_ROUND  = [[1.02, -0.3, 0.6, -0.48], [0, -0.6, -0.6, -0.48], [-1.02, -0.3, -1.09, 0.2]];
const FR_SIDE   = [[1.0, -0.15, 0.7, -0.3], [0.2, -0.36, -0.3, -0.8], [-0.5, -0.3, -0.82, -0.05]];
const FR_SPIKY  = [[0.85, -0.45], [0.55, -0.25], [0.3, -0.5], [0, -0.28], [-0.3, -0.5], [-0.55, -0.25], [-0.85, -0.45]];
const FR_HIGH   = [[0.94, -0.5, 0.5, -0.7], [0, -0.84, -0.5, -0.7], [-0.94, -0.5, -1.02, 0]];
const FR_BANGS  = [[0.82, -0.05, 0.72, -0.3], [0, -0.42, -0.72, -0.3], [-0.82, -0.05, -1.14, 0]];
const FR_PART   = [[0.84, 0.3], [0.9, -0.1, 0.5, -0.56], [0.2, -0.82, 0, -0.9], [-0.2, -0.82, -0.5, -0.56], [-0.9, -0.1, -0.84, 0.3]];
const FR_PART_S = [[0.98, -0.3, 0.5, -0.58], [0.2, -0.82, 0, -0.9], [-0.2, -0.82, -0.5, -0.58], [-0.98, -0.3, -1.05, 0.1]];
const SHINE_L = [-0.46, -0.88, 0.24, 0.07, -0.45], SHINE_R = [0.4, -0.9, 0.24, 0.07, 0.4];
// g: [cap width factor, cap height factor, how far the sides come down]
const HAIR = {
  short:    { g: [1.09, 1.15, 0.2],  line: FR_ROUND, shine: SHINE_L },
  side:     { g: [1.09, 1.15, 0.2],  line: FR_SIDE, shine: SHINE_R },
  spiky:    { g: [1.07, 1.1, 0.12],  line: FR_SPIKY, shine: null },
  buzz:     { g: [1.02, 1.04, 0],    line: FR_HIGH, shine: null },
  bob:      { g: [1.14, 1.16, 0],    line: FR_BANGS, shine: SHINE_L },
  long:     { g: [1.1, 1.15, 0.3],   line: FR_PART, shine: SHINE_L },
  wavy:     { g: [1.1, 1.15, 0.2],   line: FR_SIDE, shine: SHINE_R },
  pony:     { g: [1.06, 1.12, 0],    line: FR_HIGH, shine: SHINE_L },
  pigtails: { g: [1.07, 1.13, 0.1],  line: FR_PART_S, shine: SHINE_L },
  braids:   { g: [1.07, 1.13, 0.1],  line: FR_PART_S, shine: SHINE_L },
  bun:      { g: [1.06, 1.12, 0],    line: FR_HIGH, shine: SHINE_L },
  curly:    { g: [1.08, 1.12, 0.2],  line: FR_ROUND, shine: null },
  afro:     { g: [1.08, 1.12, 0],    line: FR_HIGH, shine: null },
};

// ---------- paths. Capsules and ellipses all wind clockwise, so they can share one path without holes.
function addCap(p, x0, y0, x1, y1, w0, w1) {
  const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1e-6, a = Math.atan2(dy, dx);
  const nx = -dy / len, ny = dx / len, r0 = Math.max(0.001, w0 / 2), r1 = Math.max(0.001, w1 / 2);
  p.moveTo(x0 - nx * r0, y0 - ny * r0); p.lineTo(x1 - nx * r1, y1 - ny * r1);
  p.arc(x1, y1, r1, a - PI / 2, a + PI / 2);
  p.lineTo(x0 + nx * r0, y0 + ny * r0);
  p.arc(x0, y0, r0, a + PI / 2, a + PI * 1.5);
  p.closePath(); return p;
}
const cap = (x0, y0, x1, y1, w0, w1) => addCap(new Path2D(), x0, y0, x1, y1, w0, w1);
// round at the start, cut straight at the end: sleeves and cuffs
function seg(x0, y0, x1, y1, w0, w1) {
  const p = new Path2D(), dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1e-6, a = Math.atan2(dy, dx);
  const nx = -dy / len, ny = dx / len, r0 = Math.max(0.001, w0 / 2), r1 = Math.max(0.001, w1 / 2);
  p.moveTo(x0 - nx * r0, y0 - ny * r0); p.lineTo(x1 - nx * r1, y1 - ny * r1);
  p.lineTo(x1 + nx * r1, y1 + ny * r1); p.lineTo(x0 + nx * r0, y0 + ny * r0);
  p.arc(x0, y0, r0, a + PI / 2, a + PI * 1.5);
  p.closePath(); return p;
}
// cut straight at both ends: bands
function quad(x0, y0, x1, y1, w0, w1) {
  const p = new Path2D(), dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1e-6;
  const nx = -dy / len, ny = dx / len, r0 = w0 / 2, r1 = w1 / 2;
  p.moveTo(x0 - nx * r0, y0 - ny * r0); p.lineTo(x1 - nx * r1, y1 - ny * r1);
  p.lineTo(x1 + nx * r1, y1 + ny * r1); p.lineTo(x0 + nx * r0, y0 + ny * r0);
  p.closePath(); return p;
}
function addEll(p, x, y, rx, ry, rot) {
  p.moveTo(x + Math.max(0.001, rx) * Math.cos(rot || 0), y + Math.max(0.001, rx) * Math.sin(rot || 0));
  p.ellipse(x, y, Math.max(0.001, rx), Math.max(0.001, ry), rot || 0, 0, TAU); p.closePath(); return p;
}
const ell = (x, y, rx, ry, rot) => addEll(new Path2D(), x, y, rx, ry, rot);
function rbox(x, y, w, hh, rad) {
  if (w < 0) { x += w; w = -w; }
  if (hh < 0) { y += hh; hh = -hh; }
  const r = Math.max(0, Math.min(rad || 0, w / 2, hh / 2)), p = new Path2D();
  p.moveTo(x + r, y);
  p.arcTo(x + w, y, x + w, y + hh, r); p.arcTo(x + w, y + hh, x, y + hh, r);
  p.arcTo(x, y + hh, x, y, r); p.arcTo(x, y, x + w, y, r);
  p.closePath(); return p;
}
// a trapezoid with a straight bottom edge and softened bottom corners
function trap(xl0, xr0, y0, xl1, xr1, y1, rad) {
  const p = new Path2D(), r = Math.max(0, rad || 0);
  p.moveTo(xl0, y0); p.lineTo(xr0, y0);
  p.arcTo(xr1, y1, xl1, y1, r); p.arcTo(xl1, y1, xl0, y0, r);
  p.closePath(); return p;
}
function poly(pts) {
  const p = new Path2D(); p.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) p.lineTo(pts[i], pts[i + 1]);
  p.closePath(); return p;
}
function strokeLine(x0, y0, x1, y1) { const p = new Path2D(); p.moveTo(x0, y0); p.lineTo(x1, y1); return p; }
const lerp = (a, b, t) => a + (b - a) * t;
function hashStr(s) { let k = 2166136261; for (let i = 0; i < s.length; i++) { k ^= s.charCodeAt(i); k = Math.imul(k, 16777619); } return k >>> 0; }
function pxScale(c) {
  let k = 1;
  if (c.getTransform) { const t = c.getTransform(); k = Math.hypot(t.a, t.b) || 1; }
  const cv = c.canvas;
  if (cv && cv.clientWidth > 0 && cv.width > 0) k *= cv.clientWidth / cv.width;
  return k > 0 ? k : 1;
}
const lum = (col) => { const q = rgb(col); return q[0] * 0.3 + q[1] * 0.59 + q[2] * 0.11; };
const same = (a, b) => a === b || (a && b && a[0] === b[0] && a[1] === b[1]);

// a limb: the shape in its colour, then a shadow stripe along the side away from the light.
// A stripe, not a smaller lit copy: at a joint two stripes meet and leave no ring.
// Stripes go to the list S, which the caller adds after all the shapes of a chain (thigh and shin, upper arm and forearm).
function limb(L, S, fn, x0, y0, x1, y1, w0, w1, f, sf, lod, tin, side) {
  L.push({ p: fn(x0, y0, x1, y1, w0, w1), f });
  if (!lod) return 0;
  const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1e-6;
  let nx = -dy / len, ny = dx / len;
  // away from the light: right, or down; the next part of a chain keeps the side of the first
  if (!side) side = (nx < -1e-6 || (Math.abs(nx) <= 1e-6 && ny < 0)) ? -1 : 1;
  nx *= side; ny *= side;
  // the stripe is cut straight at both ends and lies on the edge; `tin` lets it start from nothing
  const d0 = (tin ? 0.03 : 0.24) * w0, d1 = 0.24 * w1, o0 = (w0 - d0) / 2, o1 = (w1 - d1) / 2;
  S.push({ p: quad(x0 + nx * o0, y0 + ny * o0, x1 + nx * o1, y1 + ny * o1, d0, d1), f: sf, noRim: 1 });
  return side;
}

// the torso: a scooped neckline, soft shoulders, straight sides, a straight hem. `d` moves the right side in (the lit copy).
function torsoPath(T, d) {
  const p = new Path2D();
  p.moveTo(T.cx - T.nw, T.ny);
  p.quadraticCurveTo(T.cx, T.ny + T.dip * 2, T.cx + T.nw, T.ny);
  p.arcTo(T.xr - d, T.yr, T.br - d, T.by, T.rs);
  p.arcTo(T.br - d, T.by, T.bl, T.by, T.rh);
  p.arcTo(T.bl, T.by, T.xl, T.yl, T.rh);
  p.arcTo(T.xl, T.yl, T.cx - T.nw, T.ny, T.rs);
  p.closePath(); return p;
}
// a trouser leg: hip, knee, hem; the hem is cut straight across the shin. `d` moves the right side in.
function legPath(hx, hy, wt, kx, ky, wk, ax, ay, wh, d) {
  const dx = ax - kx, dy = ay - ky, len = Math.hypot(dx, dy) || 1e-6, nx = dy / len, ny = -dx / len, p = new Path2D();
  p.moveTo(hx - wt / 2, hy); p.lineTo(hx + wt / 2 - d, hy);
  p.quadraticCurveTo(kx + wk / 2 - d, ky, ax + nx * (wh / 2 - d), ay + ny * (wh / 2 - d));
  p.lineTo(ax - nx * wh / 2, ay - ny * wh / 2);
  p.quadraticCurveTo(kx - wk / 2, ky, hx - wt / 2, hy);
  p.closePath(); return p;
}
// two bones from the joint to a target; the elbow goes out and down
function ik(jx, jy, tx, ty, a, b, s) {
  const dx = tx - jx, dy = ty - jy, d0 = Math.hypot(dx, dy) || 1e-6;
  const d = Math.min(a + b - 1e-4, Math.max(Math.abs(a - b) + 1e-4, d0));
  const base = Math.atan2(dy, dx), A = Math.acos(Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d))));
  const e1x = jx + a * Math.cos(base + A), e1y = jy + a * Math.sin(base + A);
  const e2x = jx + a * Math.cos(base - A), e2y = jy + a * Math.sin(base - A);
  const first = s * e1x + e1y > s * e2x + e2y;
  return [first ? e1x : e2x, first ? e1y : e2y, jx + dx / d0 * d, jy + dy / d0 * d];
}

// ---------- the display list. Items: { p, f } fill, { p, s, w } stroke, { p, f, clip } fill inside a clip,
// { tf: [px, py, angle] } start of a rotated group, { pop } its end.
function run(c, L, rimCol, rimW) {
  if (rimCol) { // the rim: every solid shape stroked first, so only the outer silhouette shows
    c.strokeStyle = rimCol; c.lineWidth = rimW * 2;
    for (const it of L) {
      if (it.tf) { c.save(); c.translate(it.tf[0], it.tf[1]); c.rotate(it.tf[2]); c.translate(-it.tf[0], -it.tf[1]); }
      else if (it.pop) c.restore();
      else if (it.f && !it.noRim && !it.clip) c.stroke(it.p);
    }
  }
  for (const it of L) {
    if (it.tf) { c.save(); c.translate(it.tf[0], it.tf[1]); c.rotate(it.tf[2]); c.translate(-it.tf[0], -it.tf[1]); }
    else if (it.pop) c.restore();
    else if (it.clip) { c.save(); c.clip(it.clip); c.fillStyle = it.f; c.fill(it.p); c.restore(); }
    else if (it.f) { c.fillStyle = it.f; c.fill(it.p); }
    else if (it.s) { c.strokeStyle = it.s; c.lineWidth = it.w; c.stroke(it.p); }
  }
}

// ---------- hands: a palm, four fingers and a thumb. The fingers touch and only their round tips show:
// no gaps and no lines between them (spread fingers with grooves frightened a child). (dx, dy) is the forearm direction, s the body side.
function hand(L, wx, wy, dx, dy, s, hl, hw, skin, skinS, lod, spread) {
  // the thumb points up when the arm is level and towards the body otherwise
  let nx = -dy, ny = dx;
  if (-s * nx * Math.abs(dy) - ny * Math.abs(dx) * 1.2 < 0) { nx = -nx; ny = -ny; }
  const p = new Path2D();
  const px = wx + dx * hl * 0.56, py = wy + dy * hl * 0.56;
  addCap(p, wx, wy, px, py, hw * 0.84, hw);
  if (!lod) { // small: a rounded hand with a clear thumb
    addCap(p, px, py, wx + dx * hl * 0.82, wy + dy * hl * 0.82, hw, hw * 0.78);
    addCap(p, wx + dx * hl * 0.25 + nx * hw * 0.3, wy + dy * hl * 0.25 + ny * hw * 0.3, wx + dx * hl * 0.6 + nx * hw * 0.82, wy + dy * hl * 0.6 + ny * hw * 0.82, hw * 0.42, hw * 0.36);
    L.push({ p, f: skin }); return;
  }
  const off = [-0.375, -0.125, 0.125, 0.375], lens = [0.3, 0.4, 0.43, 0.37], fw = hw * 0.26;
  for (let i = 0; i < 4; i++) {
    const a = off[i] * spread, ca = Math.cos(a), sa = Math.sin(a);
    // the finger direction: the forearm direction fanned a little towards its own side
    const fx = dx * ca + nx * sa, fy = dy * ca + ny * sa;
    const bx = px + nx * off[i] * hw - dx * hl * 0.06, by = py + ny * off[i] * hw - dy * hl * 0.06;
    addCap(p, bx, by, bx + fx * hl * lens[i], by + fy * hl * lens[i], fw, fw * 0.86);
  }
  const ta = 0.55 + spread * 0.5, tcx = dx * Math.cos(ta) + nx * Math.sin(ta), tcy = dy * Math.cos(ta) + ny * Math.sin(ta);
  const tx = wx + dx * hl * 0.2 + nx * hw * 0.34, ty = wy + dy * hl * 0.2 + ny * hw * 0.34;
  addCap(p, tx, ty, tx + tcx * hl * 0.42, ty + tcy * hl * 0.42, fw * 1.3, fw * 1.1);
  L.push({ p, f: skin });
}

// ---------- shoes. ax: ankle centre, gy: ground, dir: which way the toe points, lw: leg width.
function shoe(L, kind, col, ax, gy, dir, lw, h, fl, legH, legCol, lod) {
  const K = SHOES[kind] || SHOES.sneaker;
  const hw = lw * 0.4, fh = K.fh * h, th = K.th * h, sole = K.sole * h;
  const top = K.shaft ? Math.max(fh * 1.5, Math.min(K.shaft * h, legH * 0.4)) : fh;
  // xb: the back of the opening, xi: the heel (a little wider), xo: the front of the opening, xt: the toe
  const xb = ax - dir * hw, xi = ax - dir * hw * 1.16, xo = ax + dir * hw, xt = xo + dir * fl;
  const b0x = xo, b0y = gy - (K.shaft ? fh * 1.3 : fh);
  const b1x = xo + dir * fl * (K.shaft ? 0.2 : 0.6), b1y = gy - fh;
  const b2x = xt, b2y = gy - Math.min(th * 1.2, fh * 0.98), b3x = xt, b3y = gy - th * 0.5;
  const p = new Path2D();
  p.moveTo(xb, gy - top);
  p.quadraticCurveTo(ax, gy - top - hw * 0.3, xo, gy - top); // a rounded top, never a flat cut
  p.lineTo(b0x, b0y);
  p.bezierCurveTo(b1x, b1y, b2x, b2y, b3x, b3y);                 // the instep and the plump toe
  p.quadraticCurveTo(xt, gy, xt - dir * th * 0.45, gy);
  p.lineTo(xi + dir * fh * 0.35, gy);
  p.quadraticCurveTo(xi, gy, xi, gy - fh * 0.35);                // the heel
  if (K.shaft) p.bezierCurveTo(xi, gy - fh * 1.1, xb, gy - fh * 0.9, xb, gy - fh * 1.5);
  else p.quadraticCurveTo(xi, gy - fh, xb, gy - fh);
  p.closePath();
  L.push({ p, f: kind === 'sandal' ? legCol : col });
  // a point on the instep curve, and the rest of the curve from there to the toe
  const tail = (t) => {
    const ax1 = lerp(b0x, b1x, t), ay1 = lerp(b0y, b1y, t), bx1 = lerp(b1x, b2x, t), by1 = lerp(b1y, b2y, t), cx1 = lerp(b2x, b3x, t), cy1 = lerp(b2y, b3y, t);
    const dx1 = lerp(ax1, bx1, t), dy1 = lerp(ay1, by1, t), ex1 = lerp(bx1, cx1, t), ey1 = lerp(by1, cy1, t);
    return [lerp(dx1, ex1, t), lerp(dy1, ey1, t), ex1, ey1, cx1, cy1];
  };
  const pale = tow(col, WHITE, 0.3), deep = tow(col, DARK, 0.45);
  let soleCol = deep;
  if (kind === 'sneaker' || kind === 'hightop') {
    soleCol = '#f4f1ea';
    if (lod) { // the toe cap follows the toe exactly
      const q = tail(0.52), tc = new Path2D();
      tc.moveTo(q[0], q[1]); tc.bezierCurveTo(q[2], q[3], q[4], q[5], b3x, b3y);
      tc.quadraticCurveTo(xt, gy, xt - dir * th * 0.5, gy); tc.lineTo(q[0], gy); tc.closePath();
      L.push({ p: tc, f: soleCol, noRim: 1 });
      // the laces: a pale strip along the instep
      const a = tail(0.06), b = tail(0.36), lc = new Path2D();
      lc.moveTo(a[0], a[1]); lc.bezierCurveTo(lerp(a[0], b[0], 0.4), a[1], lerp(a[0], b[0], 0.7), lerp(a[1], b[1], 0.4), b[0], b[1]);
      lc.lineTo(b[0] - dir * fl * 0.06, b[1] + fh * 0.26); lc.lineTo(a[0] - dir * hw * 0.5, a[1] + fh * 0.2); lc.closePath();
      L.push({ p: lc, f: tow(col, WHITE, 0.55), noRim: 1 });
    }
  } else if (kind === 'rain') {
    soleCol = tow(col, DARK, 0.28);
    L.push({ p: rbox(Math.min(xi, xo) - hw * 0.08, gy - top - h * 0.008, hw * 2.16, h * 0.024, h * 0.012), f: pale });
    if (lod) L.push({ p: ell(ax - hw * 0.38, gy - (top + fh) * 0.5, hw * 0.15, (top - fh) * 0.3), f: pale, noRim: 1 });
  } else if (kind === 'boot') {
    L.push({ p: rbox(Math.min(xi, xo) - hw * 0.14, gy - top - h * 0.01, hw * 2.28, h * 0.026, h * 0.013), f: pale });
  } else if (kind === 'flat' || kind === 'loafer' || kind === 'ballet') {
    // the opening: the foot shows in a scoop at the top of the shoe
    L.push({ p: ell(ax, gy - fh, hw * 0.8, fh * (kind === 'loafer' ? 0.26 : 0.42)), f: legCol, noRim: 1 });
    if (kind === 'loafer' && lod > 1) {
      const a = tail(0.3), b = tail(0.5);
      L.push({ p: poly([a[0], a[1], b[0], b[1], b[0], b[1] + fh * 0.3, a[0], a[1] + fh * 0.34]), f: tow(col, WHITE, 0.16), noRim: 1 });
    }
    if (kind !== 'loafer') soleCol = tow(col, DARK, kind === 'ballet' ? 0.12 : 0.35);
  } else if (kind === 'sandal') {
    soleCol = col;
    const a = tail(0.4), b = tail(0.72);
    L.push({ p: poly([a[0], a[1], b[0], b[1], b[0], gy, a[0], gy]), f: col, noRim: 1 });
    L.push({ p: rbox(Math.min(xi, xo) - hw * 0.08, gy - fh * 1.05, hw * 2.16, fh * 0.42, fh * 0.2), f: col });
  }
  const e = h * 0.003;
  L.push({ p: rbox(Math.min(xi - dir * e, xt + dir * e), gy - sole, fl + hw * 2 + e * 2, sole, sole * 0.5), f: soleCol });
}

// ---------- hair. Returns nothing; fills `back` (behind the body) and `front` (on the head).
function hairCap(hx, cy, r, rw, g, line) {
  const p = new Path2D();
  p.ellipse(hx, cy, rw * g[0], r * g[1], 0, PI, TAU);
  p.lineTo(hx + rw * g[0], cy + r * g[2]);
  for (const q of line) {
    if (q.length === 2) p.lineTo(hx + q[0] * rw, cy + q[1] * r);
    else p.quadraticCurveTo(hx + q[0] * rw, cy + q[1] * r, hx + q[2] * rw, cy + q[3] * r);
  }
  p.lineTo(hx - rw * g[0], cy + r * g[2]);
  p.closePath(); return p;
}
function hair(back, front, st, hx, cy, r, rw, hc, skin, tie, lod) {
  const H = HAIR[st]; if (!H) return; // bald
  const deep = tow(hc, DARK, 0.22), light = tow(hc, WHITE, 0.17);
  const X = (k) => hx + k * rw, Y = (k) => cy + k * r;
  let capCol = hc;
  if (st === 'buzz') capCol = tow(hc, rgb(skin), 0.2);
  // behind the head
  if (st === 'bob') back.push({ p: ell(hx, Y(0.1), rw * 1.26, r * 0.88), f: hc });
  else if (st === 'long') back.push({ p: trap(X(-1.12), X(1.12), Y(-0.2), X(-1.3), X(1.3), Y(2.15), r * 0.45), f: deep });
  else if (st === 'wavy') {
    back.push({ p: trap(X(-1.1), X(1.1), Y(-0.2), X(-1.2), X(1.2), Y(1.9), r * 0.4), f: deep });
    const p = new Path2D();
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) addEll(p, X(s * (1.08 + (i % 2 ? 0.14 : 0.04))), Y(0.05 + i * 0.52), r * 0.42, r * 0.44);
    back.push({ p, f: hc });
  } else if (st === 'pony') {
    const p = new Path2D();
    addCap(p, X(0.6), Y(-0.4), X(1.5), Y(0.3), r * 0.5, r * 0.6);
    addCap(p, X(1.5), Y(0.3), X(1.4), Y(1.55), r * 0.6, r * 0.14);
    back.push({ p, f: deep });
    if (lod) back.push({ p: ell(X(1.16), Y(0.04), r * 0.13, r * 0.28, -0.9), f: tie, noRim: 1 });
  } else if (st === 'bun') back.push({ p: ell(hx, Y(-1.26), r * 0.46, r * 0.4), f: hc });
  else if (st === 'afro') {
    const p = new Path2D(); addEll(p, hx, Y(-0.26), rw * 1.5, r * 1.3);
    if (lod) for (let i = 0; i < 15; i++) { const a = PI * 0.82 + i * (PI * 1.36 / 14); addEll(p, hx + Math.cos(a) * rw * 1.48, Y(-0.26) + Math.sin(a) * r * 1.28, r * 0.22, r * 0.22); }
    back.push({ p, f: hc });
    if (lod) back.push({ p: ell(X(-0.78), Y(-1.08), r * 0.3, r * 0.1, -0.6), f: light, noRim: 1 });
  }
  // the cap covers the crown in every style
  front.push({ p: hairCap(hx, cy, r, rw, H.g, H.line), f: capCol });
  if (st === 'spiky') {
    for (let i = 0; i < 6; i++) { // short tufts, all swept the same way
      const a = PI * (1.16 + i * 0.125), t = a + 0.2, w = 0.27, k = 1.24 + (i % 2) * 0.08;
      front.push({ p: poly([hx + Math.cos(a - w) * rw, cy + Math.sin(a - w) * r, hx + Math.cos(t) * rw * k, cy + Math.sin(t) * r * k, hx + Math.cos(a + w) * rw, cy + Math.sin(a + w) * r]), f: hc });
    }
  } else if (st === 'curly') {
    const p = new Path2D();
    for (let i = 0; i < 9; i++) { const a = PI * (1 + i / 8); addEll(p, hx + Math.cos(a) * rw * 1.06, cy + r * 0.1 + Math.sin(a) * r * 1.14, r * 0.33, r * 0.33); }
    for (const k of [-0.62, -0.21, 0.21, 0.62]) addEll(p, X(k), Y(-0.7 + Math.abs(k) * 0.14), r * 0.27, r * 0.24);
    front.push({ p, f: hc });
    if (lod) front.push({ p: ell(X(-0.5), Y(-1.02), r * 0.15, r * 0.09, -0.5), f: light, noRim: 1 });
  } else if (st === 'bob') {
    front.push({ p: cap(X(0.98), Y(-0.2), X(0.98), Y(0.58), r * 0.46, r * 0.42), f: hc }, { p: cap(X(-0.98), Y(-0.2), X(-0.98), Y(0.58), r * 0.46, r * 0.42), f: hc });
  } else if (st === 'long') {
    front.push({ p: cap(X(0.9), Y(-0.1), X(1.06), Y(1.95), r * 0.62, r * 0.32), f: hc }, { p: cap(X(-0.9), Y(-0.1), X(-1.06), Y(1.95), r * 0.62, r * 0.32), f: hc });
  } else if (st === 'pigtails') {
    front.push({ p: cap(X(1.12), Y(0.1), X(1.42), Y(1.0), r * 0.56, r * 0.2), f: hc }, { p: cap(X(-1.12), Y(0.1), X(-1.42), Y(1.0), r * 0.56, r * 0.2), f: hc });
    if (lod) front.push({ p: ell(X(1.08), Y(0.02), r * 0.14, r * 0.14), f: tie, noRim: 1 }, { p: ell(X(-1.08), Y(0.02), r * 0.14, r * 0.14), f: tie, noRim: 1 });
  } else if (st === 'braids') {
    const p = new Path2D();
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) addEll(p, X(s * 1.02), Y(0.3 + i * 0.4), r * (0.25 - i * 0.02), r * 0.27, s * (i % 2 ? 0.4 : -0.4));
    for (const s of [-1, 1]) addEll(p, X(s * 1.02), Y(2.06), r * 0.12, r * 0.17);
    front.push({ p, f: hc });
    if (lod) front.push({ p: ell(X(1.02), Y(1.84), r * 0.16, r * 0.09), f: tie, noRim: 1 }, { p: ell(X(-1.02), Y(1.84), r * 0.16, r * 0.09), f: tie, noRim: 1 });
  }
  if (lod && H.shine) front.push({ p: ell(X(H.shine[0]), Y(H.shine[1]), r * H.shine[2], r * H.shine[3], H.shine[4]), f: light, noRim: 1 });
}

const hairOf = (o) => (o.bald || o.hairStyle === 'bald' ? 'bald' : HAIR[o.hairStyle] ? o.hairStyle : 'short');

// ---------- the head: ears, face, hair, features, glasses
function head(back, L, o, A, hx, cy, r, lod, u, skin, skinS, hc, tie) {
  const rw = r * A.rw, mood = FACES[o.mood] ? o.mood : 'smile', F = FACES[mood];
  const st = hairOf(o);
  const ink = '#2b2230', hot = [226, 96, 104];
  // ears
  const ear = new Path2D(); addEll(ear, hx - rw * 0.98, cy + r * 0.14, r * 0.16, r * 0.22); addEll(ear, hx + rw * 0.98, cy + r * 0.14, r * 0.16, r * 0.22);
  L.push({ p: ear, f: lod ? skinS : skin });
  if (lod > 1) { const q = new Path2D(); addEll(q, hx - rw * 1.0, cy + r * 0.14, r * 0.07, r * 0.12); addEll(q, hx + rw * 1.0, cy + r * 0.14, r * 0.07, r * 0.12); L.push({ p: q, f: tow(skin, WARM, 0.3), noRim: 1 }); }
  // face: shadow colour, then the lit copy up and to the left
  if (lod) { L.push({ p: ell(hx, cy, rw, r), f: skinS }); L.push({ p: ell(hx - rw * 0.05, cy - r * 0.04, rw * 0.94, r * 0.95), f: skin, noRim: 1 }); }
  else L.push({ p: ell(hx, cy, rw, r), f: skin });
  const look = Math.max(-1, Math.min(1, o.look || 0));
  const ey = cy + A.eyeY * r + (F.e === 'low' ? r * 0.03 : 0), es = rw * 0.42;
  const my = cy + A.mouthY * r, mx = hx + look * r * 0.04;
  if (lod) { // cheeks and nose
    const ch = new Path2D(); addEll(ch, hx - rw * 0.6, my - r * 0.14, r * 0.17, r * 0.11); addEll(ch, hx + rw * 0.6, my - r * 0.14, r * 0.17, r * 0.11);
    L.push({ p: ch, f: tow(skin, hot, 0.26), noRim: 1 });
    L.push({ p: ell(mx + r * 0.02, (ey + my) / 2 + r * 0.03, r * 0.075, r * 0.05), f: tow(skin, WARM, 0.24), noRim: 1 });
    if (o.freckles && lod > 1) {
      const fr = new Path2D();
      for (const s of [-1, 1]) for (let i = 0; i < 3; i++) addEll(fr, hx + s * rw * (0.36 + i * 0.13), my - r * (0.3 + (i % 2) * 0.07), r * 0.022, r * 0.022);
      L.push({ p: fr, f: tow(skin, WARM, 0.45), noRim: 1 });
    }
  }
  hair(back, L, st, hx, cy, r, rw, hc, skin, tie, lod);
  // eyes
  const er = Math.max(r * 0.105 * A.eye, 0.95 * u), ery = er * 1.25, lineW = Math.max(r * 0.07, 0.95 * u);
  const lx = look * er * 0.6;
  const eyes = new Path2D(), whites = new Path2D(), glint = new Path2D();
  for (const s of [-1, 1]) {
    const ex = hx + s * es;
    if (F.e === 'arc') {
      const p = new Path2D(); p.moveTo(ex - er * 1.25, ey + er * 0.35); p.quadraticCurveTo(ex, ey - er * 1.5, ex + er * 1.25, ey + er * 0.35);
      L.push({ p, s: ink, w: lineW });
    } else if (F.e === 'wide' || F.e === 'side') {
      const k = F.e === 'wide' ? 1.6 : 1.38, wr = Math.max(er * k, 1.7 * u), pr = Math.max(er * 0.82, 0.9 * u);
      const px = ex + (F.e === 'side' ? er * 0.42 : lx), py = ey + (F.e === 'side' ? -er * 0.5 : 0);
      addEll(whites, ex, ey, wr, wr * 1.12); addEll(eyes, px, py, pr, pr * 1.1);
      if (lod) addEll(glint, px - pr * 0.3, py - pr * 0.4, pr * 0.32, pr * 0.32);
    } else {
      addEll(eyes, ex + lx * 0.5, ey, er, ery);
      if (lod) addEll(glint, ex + lx * 0.5 - er * 0.3, ey - ery * 0.38, er * 0.36, er * 0.36);
    }
    if (o.lashes && lod) L.push({ p: strokeLine(ex + s * er * 0.8, ey - ery * 0.6, ex + s * er * 1.7, ey - ery * 1.05), s: ink, w: Math.max(r * 0.05, 0.75 * u) });
  }
  if (F.e === 'wide' || F.e === 'side') L.push({ p: whites, f: '#ffffff', noRim: 1 });
  if (F.e !== 'arc') { L.push({ p: eyes, f: ink, noRim: 1 }); if (lod) L.push({ p: glint, f: '#ffffff', noRim: 1 }); }
  // brows: thick and short, so their angle reads at 60 px
  const brow0 = tow(hc, DARK, 0.5), browCol = Math.abs(lum(brow0) - lum(skin)) < 60 ? tow(skin, DARK, 0.66) : brow0, bw = Math.max(r * 0.078, 0.95 * u), bl = Math.max(r * 0.36, 2.6 * u), bk = bl / (r * 0.36);
  const eyeTop = F.e === 'wide' ? Math.max(er * 1.6, 1.7 * u) * 1.12 : ery;
  for (const s of [-1, 1]) {
    // small heads: keep a gap between the two brows
    const ex = hx + s * Math.max(es, bl / 2 + bw / 2 + 0.45 * u), lift = F.b[2] + (F.asym && s > 0 ? 0.16 : 0);
    const by = ey - eyeTop - r * (0.2 + lift), xi = ex - s * bl / 2, xo = ex + s * bl / 2;
    const yi = by + F.b[0] * r * bk, yo = by + F.b[1] * r * bk;
    const p = new Path2D(); p.moveTo(xi, yi); p.quadraticCurveTo((xi + xo) / 2, (yi + yo) / 2 - r * F.b[3] * 2, xo, yo);
    L.push({ p, s: browCol, w: bw });
  }
  // mouth
  const mw = Math.max(r * 0.3, 1.7 * u), mouthInk = lum(skin) < 120 ? tow(skin, DARK, 0.7) : tow(skin, [92, 30, 40], 0.74), mouthIn = '#7c2b38';
  const m = new Path2D(); let filled = false;
  if (F.m === 'smile') { m.moveTo(mx - mw, my - r * 0.04); m.quadraticCurveTo(mx, my + r * 0.28, mx + mw, my - r * 0.04); }
  else if (F.m === 'calm') { m.moveTo(mx - mw * 0.62, my); m.quadraticCurveTo(mx, my + r * 0.15, mx + mw * 0.62, my); }
  else if (F.m === 'open' || F.m === 'laugh') {
    const w2 = mw * (F.m === 'laugh' ? 1.18 : 0.95), dp = r * (F.m === 'laugh' ? 0.6 : 0.46), ty = my - r * 0.07;
    m.moveTo(mx - w2, ty); m.lineTo(mx + w2, ty); m.bezierCurveTo(mx + w2, ty + dp, mx - w2, ty + dp, mx - w2, ty); m.closePath(); filled = true;
    L.push({ p: m, f: mouthIn, noRim: 1 });
    if (lod) {
      L.push({ p: ell(mx, ty + dp * 0.56, w2 * 0.46, dp * 0.17), f: '#ec7f86', noRim: 1 });
      if (F.m === 'laugh') L.push({ p: poly([mx - w2 * 0.86, ty, mx + w2 * 0.86, ty, mx + w2 * 0.8, ty + dp * 0.15, mx - w2 * 0.8, ty + dp * 0.15]), f: '#ffffff', noRim: 1 });
    }
  } else if (F.m === 'frown') { m.moveTo(mx - mw * 0.8, my + r * 0.15); m.quadraticCurveTo(mx, my - r * 0.12, mx + mw * 0.8, my + r * 0.15); }
  else if (F.m === 'tight') { m.moveTo(mx - mw * 0.72, my + r * 0.11); m.quadraticCurveTo(mx, my - r * 0.05, mx + mw * 0.72, my + r * 0.11); }
  else if (F.m === 'o') { filled = true; L.push({ p: ell(mx, my + r * 0.06, Math.max(r * 0.13, 1.1 * u), Math.max(r * 0.17, 1.3 * u)), f: mouthIn, noRim: 1 }); }
  else if (F.m === 'wobble') { m.moveTo(mx - mw * 0.72, my + r * 0.06); m.quadraticCurveTo(mx - mw * 0.36, my - r * 0.09, mx, my + r * 0.04); m.quadraticCurveTo(mx + mw * 0.36, my + r * 0.17, mx + mw * 0.72, my + r * 0.02); }
  else if (F.m === 'side') { m.moveTo(mx - mw * 0.1, my + r * 0.05); m.lineTo(mx + mw * 0.9, my - r * 0.02); }
  else { m.moveTo(mx - mw * 0.66, my + r * 0.03); m.lineTo(mx + mw * 0.66, my + r * 0.03); }
  if (!filled) L.push({ p: m, s: mouthInk, w: F.m === 'tight' ? lineW * 1.2 : lineW });
  // glasses
  if (o.glasses) {
    const gr = Math.max(er * 2.3, r * 0.27, 2.2 * u), gcol = o.glassesCol || '#2e2a36', gw = Math.max(r * 0.06, 0.9 * u);
    const lens = new Path2D(), frame = new Path2D();
    for (const s of [-1, 1]) {
      const ex = hx + s * es;
      if (o.glasses === 'square') {
        const x0 = ex - gr, y0 = ey - gr * 0.82, w = gr * 2, hh = gr * 1.64, q = gr * 0.36;
        for (const p of [lens, frame]) { p.moveTo(x0 + q, y0); p.arcTo(x0 + w, y0, x0 + w, y0 + hh, q); p.arcTo(x0 + w, y0 + hh, x0, y0 + hh, q); p.arcTo(x0, y0 + hh, x0, y0, q); p.arcTo(x0, y0, x0 + w, y0, q); p.closePath(); }
      } else { addEll(lens, ex, ey, gr, gr); addEll(frame, ex, ey, gr, gr); }
      if (lod) { frame.moveTo(ex + s * gr, ey - gr * 0.15); frame.lineTo(hx + s * rw * 0.99, ey - gr * 0.3); }
    }
    frame.moveTo(hx - es + gr, ey - gr * 0.1); frame.lineTo(hx + es - gr, ey - gr * 0.1);
    L.push({ p: lens, f: 'rgba(255,255,255,0.2)', noRim: 1 });
    L.push({ p: frame, s: gcol, w: gw });
  }
}

// ---------- the person
export function drawPerson(c, x, footY, h, o) {
  o = o || {};
  if (!c || !(h > 0)) return;
  const ageK = AGES[o.age] ? o.age : (o.adult ? 'adult' : 'child'), A = AGES[ageK];
  const slim = o.build === 'slim', round = o.build === 'round';
  const k = pxScale(c), u = 1 / k;
  const r = h / A.heads / 2, rpx = r * k, lod = rpx < 6.5 ? 0 : rpx < 15 ? 1 : 2;

  const skin = o.skin || '#f2c6a0', hc = o.hair || '#5a3a24', top = o.top || '#4f8fd0', bot = o.bottom || '#34406b';
  const outfit = OUTFITS[o.outfit] ? o.outfit : (o.dress ? 'dress' : 'tee');
  const lower = outfit === 'dress' ? 'none' : (o.lower === 'shorts' || o.lower === 'skirt' || o.lower === 'trousers' ? o.lower : (o.skirt ? 'skirt' : 'trousers'));
  const st = hairOf(o);
  const seed = o.seed != null ? o.seed >>> 0 : hashStr([skin, hc, top, bot, st, ageK, outfit, lower].join('|'));
  const skinS = tow(skin, WARM, 0.17);
  const topS = tow(top, COOL, 0.17), topD = tow(top, COOL, 0.3), botS = tow(bot, COOL, 0.17);
  const inner = o.inner || '#f6f1e7';
  const tightsCol = o.tights ? (typeof o.tights === 'string' ? o.tights : '#3a3a4a') : null;
  const legCol = tightsCol || skin, legS = tightsCol ? tow(tightsCol, COOL, 0.17) : skinS;

  // ---- skeleton
  const lean = o.pose === 'straight' ? 0 : (o.lean ? (o.lean > 0 ? 1 : -1) : (seed & 1 ? 1 : -1));
  const limbK = slim ? 0.88 : round ? 1.14 : 1;
  const shw = A.shw * h * (slim ? 0.95 : round ? 1.1 : 1), hipw = A.hipw * h * (slim ? 0.93 : round ? 1.22 : 1);
  const aw = A.aw * h * limbK, lw = A.lw * h * limbK;
  const legLen = A.leg * h, slope = A.slope * h;
  const cy = footY - h + r * 1.14, chin = cy + r;
  const sh = chin + A.neck * r, crotch = footY - legLen, torsoLen = crotch - sh;
  const hipC = x + lean * 0.012 * h, scx = x + lean * 0.004 * h, hx = x + lean * 0.002 * h;
  const drop = lean * 0.008 * h;                       // the shoulder on the weight side sits lower
  const shY = (s) => sh + slope + s * drop;
  const waistY = sh + torsoLen * 0.66, kneeY = footY - legLen * 0.5;
  const tilt = o.tilt != null ? o.tilt : lean * 0.045;

  const L = [], back = [];

  // ---- torso shape, needed early for the arms
  const loose = { tee: 1.05, hoodie: 1.13, sweater: 1.09, jacket: 1.1, cardigan: 1.09, uniform: 1.07, dress: 0.9 }[outfit];
  const hemY = outfit === 'dress' ? waistY + h * 0.008 : crotch - torsoLen * (outfit === 'tee' ? 0.09 : 0.03);
  const bulky = outfit === 'hoodie' ? 1.04 : 1;
  const nw = r * (ageK === 'toddler' ? 0.5 : 0.46);
  const T = {
    cx: scx, nw, ny: sh - h * 0.004, dip: h * (outfit === 'dress' ? 0.022 : 0.016),
    xl: scx - shw * bulky, yl: shY(-1), xr: scx + shw * bulky, yr: shY(1),
    bl: hipC - hipw * loose, br: hipC + hipw * loose, by: hemY, rs: h * 0.03, rh: h * 0.012,
  };
  const sideX = (s, y) => {
    const y0 = s < 0 ? T.yl : T.yr, t = Math.max(0, Math.min(1, (y - y0) / ((T.by - y0) || 1)));
    return s < 0 ? lerp(T.xl, T.bl, t) : lerp(T.xr, T.br, t);
  };
  const torsoP = torsoPath(T, 0);

  // ---- arms: geometry first
  const armsO = o.arms || (lean === 0 ? { l: ARMS.down, r: ARMS.down } : lean < 0 ? { l: ARMS.down, r: ARMS.relax } : { l: ARMS.relax, r: ARMS.down });
  const ua = A.arm * h * 0.46, fa = A.arm * h * 0.4, hl = A.arm * h * 0.15, hwid = aw * 0.94;
  const sleeve = o.sleeves === 'short' || o.sleeves === 'long' || o.sleeves === 'none' ? o.sleeves : (outfit === 'tee' || outfit === 'dress' ? 'short' : 'long');
  const armG = (s) => {
    const a = (s < 0 ? armsO.l : armsO.r) || ARMS.down, t1 = +a[0] || 0, t2 = t1 + (+a[1] || 0);
    const jx = scx + s * (shw * bulky - aw * 0.52), jy = shY(s) + aw * 0.5;
    let ex = jx + s * Math.sin(t1) * ua, ey = jy + Math.cos(t1) * ua;
    let wx = ex + s * Math.sin(t2) * fa, wy = ey + Math.cos(t2) * fa;
    const isChin = same(a, ARMS.chin), isHips = same(a, ARMS.hips);
    if (isChin || isHips) {
      const g = isChin ? ik(jx, jy, hx + s * r * A.rw * 0.36, chin + hl * 0.3, ua, fa, s) : ik(jx, jy, sideX(s, waistY + h * 0.02) + s * aw * 0.25, waistY + h * 0.02, ua, fa, s);
      ex = g[0]; ey = g[1]; wx = g[2]; wy = g[3];
    }
    return { s, jx, jy, ex, ey, wx, wy, late: isChin, behind: same(a, ARMS.back) };
  };
  const drawArm = (D, G) => {
    const s = G.s, fl = Math.hypot(G.wx - G.ex, G.wy - G.ey) || 1e-6, dx = (G.wx - G.ex) / fl, dy = (G.wy - G.ey) / fl;
    const raised = G.wy < G.ey - fa * 0.3, S = [];
    if (sleeve === 'long') {
      const sd = limb(D, S, cap, G.jx, G.jy, G.ex, G.ey, aw * 1.14, aw * 1.02, top, topS, lod, 1);
      limb(D, S, seg, G.ex, G.ey, G.wx, G.wy, aw * 1.02, aw * 0.9, top, topS, lod, 0, sd);
      for (const it of S) D.push(it);
      if (lod && (outfit === 'sweater' || outfit === 'hoodie' || outfit === 'cardigan')) D.push({ p: quad(lerp(G.ex, G.wx, 0.86), lerp(G.ey, G.wy, 0.86), G.wx, G.wy, aw * 0.94, aw * 0.94), f: topD, noRim: 1 });
      if (lod && (outfit === 'jacket' || outfit === 'uniform')) D.push({ p: quad(G.wx - dx * aw * 0.02, G.wy - dy * aw * 0.02, G.wx + dx * aw * 0.16, G.wy + dy * aw * 0.16, aw * 0.74, aw * 0.74), f: inner });
    } else {
      const sd = limb(D, S, cap, G.jx, G.jy, G.ex, G.ey, aw * 0.96, aw * 0.86, skin, skinS, lod, sleeve === 'none');
      limb(D, S, cap, G.ex, G.ey, G.wx, G.wy, aw * 0.86, aw * 0.72, skin, skinS, lod, 0, sd);
      for (const it of S) D.push(it);
      if (sleeve === 'short') { const t = outfit === 'dress' ? 0.4 : 0.56; limb(D, D, seg, G.jx, G.jy, lerp(G.jx, G.ex, t), lerp(G.jy, G.ey, t), aw * 1.16, aw * 1.12, top, topS, lod, 1); }
    }
    hand(D, G.wx, G.wy, dx, dy, s, hl, hwid, skin, skinS, lod, raised ? 0.3 : 0.12);
  };
  const GA = [armG(-1), armG(1)];
  for (const G of GA) if (G.behind) drawArm(back, G);

  // ---- hood (behind the neck)
  if (outfit === 'hoodie') back.push({ p: ell(scx, sh + h * 0.004, shw * 0.7, r * 0.42), f: topD });

  // ---- legs and shoes
  const shoeO = o.shoe || o.shoes || {};
  const kind = SHOES[shoeO.kind] ? shoeO.kind : (ageK === 'adult' || ageK === 'older' ? 'loafer' : 'sneaker');
  const shoeCol = shoeO.col || (kind === 'loafer' ? '#5a3b28' : SHOE_COL[(seed >>> 3) % SHOE_COL.length]);
  const SK = SHOES[kind], tucked = lower === 'trousers' && (kind === 'boot' || kind === 'rain');
  const legs = [-1, 1].map((s) => {
    const free = lean !== 0 && s !== lean;
    const hxj = hipC + s * hipw * 0.52, ax = lean === 0 ? x + s * hipw * 0.58 : (free ? x + s * hipw * 0.8 : x + s * hipw * 0.5);
    return { s, hx: hxj, hy: crotch - h * 0.03, kx: (hxj + ax) / 2 + (free ? s * h * 0.004 : 0), ky: kneeY, ax, fl: A.foot * h * (free ? 1.12 : lean === 0 ? 1 : 0.9) };
  });
  const bare = lower !== 'trousers';
  const drawShoes = () => { for (const g of legs) shoe(L, kind, shoeCol, g.ax, footY, g.s, lw, h, g.fl, legLen, legCol, lod); };
  if (bare) {
    const ankY = footY - Math.max(SK.fh * h * 0.6, lw * 0.3 + h * 0.004);
    for (const g of legs) {
      const S = [];
      const sd = limb(L, S, cap, g.hx, g.hy, g.kx, g.ky, hipw * 0.94, lw * 0.86, legCol, legS, lod);
      limb(L, S, cap, g.kx, g.ky, g.ax, ankY, lw * 0.86, lw * 0.6, legCol, legS, lod, 0, sd);
      for (const it of S) L.push(it);
      if (!tightsCol && (kind === 'sneaker' || kind === 'hightop' || kind === 'loafer')) { // a short sock, along the shin
        const topY = footY - (SK.shaft ? Math.min(SK.shaft * h, legLen * 0.4) : SK.fh * h);
        const at = (y) => { const t = (y - g.ky) / ((ankY - g.ky) || 1); return [lerp(g.kx, g.ax, t), y, lerp(lw * 0.86, lw * 0.6, t)]; };
        const a = at(topY - h * 0.03), b = at(topY + h * 0.012);
        L.push({ p: quad(a[0], a[1], b[0], b[1], a[2] * 1.06, b[2] * 1.06), f: '#f6f3ec' });
      }
    }
    drawShoes();
  } else {
    if (!tucked) drawShoes();
    const hemY2 = tucked ? footY - Math.min(SK.shaft * h, legLen * 0.4) * 0.85 : footY - SK.fh * h - h * 0.004;
    L.push({ p: trap(hipC - hipw * 0.98, hipC + hipw * 0.98, waistY - h * 0.01, hipC - hipw * 1.03, hipC + hipw * 1.03, crotch + h * 0.012, 0), f: bot });
    for (const g of legs) {
      const wh = tucked ? lw * 0.72 : lw * 0.94;
      if (lod) { L.push({ p: legPath(g.hx, g.hy, hipw * 1.03, g.kx, g.ky, lw * 1.0, g.ax, hemY2, wh, 0), f: botS }); L.push({ p: legPath(g.hx, g.hy, hipw * 1.03, g.kx, g.ky, lw * 1.0, g.ax, hemY2, wh, lw * 0.2), f: bot, noRim: 1 }); }
      else L.push({ p: legPath(g.hx, g.hy, hipw * 1.03, g.kx, g.ky, lw * 1.0, g.ax, hemY2, wh, 0), f: bot });
    }
    if (tucked) drawShoes();
  }
  if (lower === 'shorts') {
    L.push({ p: trap(hipC - hipw * 0.98, hipC + hipw * 0.98, waistY - h * 0.01, hipC - hipw * 1.03, hipC + hipw * 1.03, crotch + h * 0.012, 0), f: bot });
    for (const g of legs) {
      const t = 0.56, ex = lerp(g.hx, g.kx, t), ey = lerp(g.hy, g.ky, t), mx = lerp(g.hx, g.kx, t * 0.5), my = lerp(g.hy, g.ky, t * 0.5), wh = lerp(hipw * 0.94, lw * 0.86, t) * 1.24;
      if (lod) { L.push({ p: legPath(g.hx, g.hy, hipw * 1.04, mx, my, hipw * 1.04, ex, ey, wh, 0), f: botS }); L.push({ p: legPath(g.hx, g.hy, hipw * 1.04, mx, my, hipw * 1.04, ex, ey, wh, lw * 0.2), f: bot, noRim: 1 }); }
      else L.push({ p: legPath(g.hx, g.hy, hipw * 1.04, mx, my, hipw * 1.04, ex, ey, wh, 0), f: bot });
    }
  }
  const skirtCol = outfit === 'dress' ? top : bot, skirtS = outfit === 'dress' ? topS : botS;
  if (lower === 'skirt' || outfit === 'dress') {
    const y0 = waistY - h * 0.006, y1 = kneeY - legLen * (ageK === 'adult' || ageK === 'older' ? 0.02 : 0.1);
    const w0 = hipw * (outfit === 'dress' ? 0.9 : 0.96), w1 = hipw * (outfit === 'dress' ? 1.62 : 1.46), d = hipw * 0.24;
    if (lod) { L.push({ p: trap(hipC - w0, hipC + w0, y0, hipC - w1, hipC + w1, y1, h * 0.008), f: skirtS }); L.push({ p: trap(hipC - w0, hipC + w0 - d * 0.5, y0, hipC - w1, hipC + w1 - d, y1, h * 0.008), f: skirtCol, noRim: 1 }); }
    else L.push({ p: trap(hipC - w0, hipC + w0, y0, hipC - w1, hipC + w1, y1, h * 0.008), f: skirtCol });
  }

  // ---- neck: always in the shadow of the chin
  L.push({ p: cap(hx, chin - r * 0.4, scx, sh + h * 0.02, nw * 1.36, nw * 1.44), f: skinS });

  // ---- torso
  if (lod) { L.push({ p: torsoP, f: topS }); L.push({ p: torsoPath(T, shw * 0.2), f: top, noRim: 1 }); }
  else L.push({ p: torsoP, f: top });
  const neckY = T.ny + T.dip; // the lowest point of the neckline
  const nk = (deeper, wider) => { // a crescent along the neckline: collars and the top of an inner shirt
    const p = new Path2D();
    p.moveTo(T.cx - T.nw, T.ny); p.quadraticCurveTo(T.cx, T.ny + T.dip * 2, T.cx + T.nw, T.ny);
    p.lineTo(T.cx + T.nw + wider, T.ny + wider * 0.25); p.quadraticCurveTo(T.cx, T.ny + (T.dip + deeper) * 2, T.cx - T.nw - wider, T.ny + wider * 0.25);
    p.closePath(); return p;
  };
  const band = (y0, y1, col) => L.push({ p: trap(sideX(-1, y0), sideX(1, y0), y0, T.bl, T.br, y1, T.rh), f: col, noRim: 1 });
  if (outfit === 'sweater') {
    if (lod) { L.push({ p: nk(h * 0.012, h * 0.008), f: topD, noRim: 1 }); band(hemY - h * 0.022, hemY, topD); }
  } else if (outfit === 'hoodie') {
    if (lod) {
      L.push({ p: nk(h * 0.016, h * 0.012), f: topD, noRim: 1 });
      const py0 = hemY - torsoLen * 0.34, py1 = hemY - torsoLen * 0.08, pw = hipw * loose;
      L.push({ p: trap(hipC - pw * 0.46, hipC + pw * 0.46, py0, hipC - pw * 0.66, hipC + pw * 0.66, py1, h * 0.01), f: topS, noRim: 1 });
      band(hemY - h * 0.02, hemY, topD);
    }
    if (lod > 1) {
      const cw = Math.max(h * 0.005, 0.9 * u), cc = tow(top, WHITE, 0.55);
      for (const s of [-1, 1]) { L.push({ p: strokeLine(scx + s * nw * 0.42, neckY + h * 0.014, scx + s * nw * 0.46, neckY + h * 0.075), s: cc, w: cw }); }
    }
  } else if (outfit === 'jacket' || outfit === 'uniform' || outfit === 'cardigan') {
    const vY = outfit === 'jacket' ? hemY : sh + torsoLen * (outfit === 'uniform' ? 0.46 : 0.52);
    const iw = outfit === 'jacket' ? hipw * 0.2 : 0, n2 = T.nw * 0.96;
    const p = new Path2D();
    p.moveTo(T.cx - n2, T.ny); p.quadraticCurveTo(T.cx, T.ny + T.dip * 2, T.cx + n2, T.ny);
    p.lineTo(hipC + iw, vY); p.lineTo(hipC - iw, vY); p.closePath();
    L.push({ p, f: inner, noRim: 1 });
    const edge = (s, y) => lerp(T.cx + s * n2, hipC + s * iw, Math.max(0, Math.min(1, (y - T.ny) / ((vY - T.ny) || 1))));
    if (outfit === 'uniform') {
      const tieCol = o.tie || '#b8323a', kY = neckY + h * 0.002, tw = h * 0.011;
      L.push({ p: poly([scx - tw, kY, scx + tw, kY, scx + tw * 1.5, vY - h * 0.03, scx, vY - h * 0.006, scx - tw * 1.5, vY - h * 0.03]), f: tieCol, noRim: 1 });
      if (lod) { // a small shirt collar: two short points
        const cs = tow(inner, COOL, 0.12);
        for (const s of [-1, 1]) L.push({ p: poly([scx + s * n2, T.ny, scx + s * tw * 0.6, kY + h * 0.003, scx + s * n2 * 0.92, kY + h * 0.024]), f: cs, noRim: 1 });
      }
    }
    if (lod && outfit !== 'cardigan') { // lapels
      const y1 = T.ny + h * 0.055, y2 = T.ny + h * (outfit === 'uniform' ? 0.13 : 0.15);
      for (const s of [-1, 1]) L.push({ p: poly([scx + s * n2, T.ny, edge(s, y1) + s * h * 0.046, y1, edge(s, y2), y2]), f: topD, noRim: 1 });
    }
    if (outfit === 'cardigan' && lod) {
      L.push({ p: strokeLine(hipC, vY, hipC, hemY - h * 0.004), s: topD, w: Math.max(h * 0.006, 0.9 * u) });
      const bt = new Path2D(); for (let i = 0; i < 3; i++) addEll(bt, hipC + h * 0.014, lerp(vY, hemY, 0.2 + i * 0.3), h * 0.007, h * 0.007);
      L.push({ p: bt, f: tow(top, WHITE, 0.6), noRim: 1 });
      band(hemY - h * 0.02, hemY, topD);
    }
    if (outfit === 'uniform' && lod > 1) L.push({ p: ell(hipC + h * 0.012, lerp(vY, hemY, 0.45), h * 0.006, h * 0.006), f: tow(top, WHITE, 0.6), noRim: 1 });
  } else if (outfit === 'dress') {
    if (lod) L.push({ p: quad(sideX(-1, hemY - h * 0.012), hemY - h * 0.012, sideX(1, hemY - h * 0.012), hemY - h * 0.012, h * 0.02, h * 0.02), f: tow(top, WHITE, 0.4), noRim: 1 });
  }

  // ---- arms in front: first the shadow they cast on the torso, so an arm never melts into a top of its colour
  const front = GA.filter((G) => !G.behind);
  if (front.length) {
    const p = new Path2D(), ox = h * 0.003, oy = h * 0.008, gw = aw * 1.14 + h * 0.011;
    // it starts as narrow as the arm at the shoulder, so no ring shows there
    for (const G of front) { addCap(p, G.jx, G.jy, G.ex + ox, G.ey + oy, aw * 0.9, gw); addCap(p, G.ex + ox, G.ey + oy, G.wx + ox, G.wy + oy, gw, gw * 0.9); }
    L.push({ p, f: tow(top, COOL, 0.24), clip: torsoP });
  }
  for (const G of front) if (!G.late) drawArm(L, G);

  // ---- head
  const tie = o.accent || (tow(top, WHITE, 0) === tow(hc, WHITE, 0) ? '#e9564f' : top);
  const tf = { tf: [hx, chin, tilt] };
  const headL = [], hairBack = [];
  head(hairBack, headL, o, A, hx, cy, r, lod, u, skin, skinS, hc, tie);
  L.push(tf); for (const it of headL) L.push(it); L.push({ pop: 1 });
  for (const G of front) if (G.late) drawArm(L, G);

  // ---- paint: ground shadow, hair and arms behind the body, then everything else
  const all = [tf];
  for (const it of hairBack) all.push(it);
  all.push({ pop: 1 });
  for (const it of back) all.push(it);
  for (const it of L) all.push(it);

  c.save();
  c.lineCap = 'round'; c.lineJoin = 'round'; c.globalAlpha = 1;
  if (!o.noShadow) {
    c.fillStyle = 'rgba(24,18,48,0.16)';
    c.beginPath(); c.ellipse(x, footY + h * 0.004, Math.max(0, hipw * 2.1), Math.max(0, h * 0.018), 0, 0, TAU); c.fill();
  }
  const rimCol = o.rim === true ? '#fff6e6' : (typeof o.rim === 'string' ? o.rim : null);
  run(c, all, rimCol, Math.max(h * 0.007, 1.2 * u));
  c.restore();
}

// ---------- drawRig: a person from joints, in any pose and turn
const SHADE = 'rgba(44,16,52,0.2)';
function rigHead(c, R, o, skin, skinS, hc) {
  const r = R.headR, rw = r * 0.94, up = R.headUp || [0, -1], yaw = R.yaw || 0;
  const s = Math.sin(yaw), cs = Math.cos(yaw), f = 1 - Math.max(0, cs), cf = Math.max(0, cs);
  const bun = o.hairStyle !== 'short', deep = tow(hc, DARK, 0.2), light = tow(hc, WHITE, 0.17);
  const disc = (x, y, rx, ry, col, rot) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot || 0, 0, TAU); c.fill(); };
  c.save(); c.translate(R.head[0], R.head[1]); c.rotate(Math.atan2(up[0], -up[1]));
  c.lineCap = 'round'; c.lineJoin = 'round';
  if (cs <= -0.3) { // from the back: the ears, the hair, the bun
    for (const e of [-1, 1]) disc(e * rw * 0.98 * -cs, r * 0.14, r * 0.15, r * 0.2, skinS);
    disc(0, -r * 0.06, rw * 1.08, r * 1.1, hc);
    if (bun) { disc(-s * rw * 0.5, -r * 0.5, r * 0.42, r * 0.4, deep); disc(-s * rw * 0.5 - r * 0.04, -r * 0.53, r * 0.36, r * 0.34, hc); }
    c.restore(); return;
  }
  // behind the face: the bun, the hair at the back of the skull, the nose of a profile
  if (bun) disc(-s * rw * (0.95 - 0.2 * cf), -r * (0.5 + 0.72 * cf), r * 0.4, r * 0.38, hc);
  if (f > 0.05) disc(-s * rw * 0.3 * f, -r * 0.08, rw * (0.9 + 0.12 * f), r * 1.04, hc);
  for (const e of [-1, 1]) disc(e * rw * 0.98 * cf - s * rw * 0.22 * f, r * 0.14, r * 0.15, r * 0.21, skinS);
  if (f > 0.35) disc(s * rw * 0.97, r * 0.3, r * 0.17 * f, r * 0.12, skin, s * 0.35);
  disc(0, 0, rw, r, skinS); disc(-rw * 0.05, -r * 0.04, rw * 0.94, r * 0.95, skin);
  const fx = s * rw * 0.5, ey = r * 0.16, my = r * 0.56;
  // cheeks
  for (const e of [-1, 1]) { const x = fx * 0.84 + e * rw * 0.6 * cf; if (Math.abs(x) < rw * 0.74) disc(x, my - r * 0.14, r * 0.17 * (0.55 + 0.45 * cf), r * 0.11, tow(skin, [226, 96, 104], 0.26)); }
  // hair: the cap over the crown; as the head turns, the hairline slides to the face side and the back comes down
  const g = bun ? [1.07, 1.12] : [1.09, 1.15], line = bun ? FR_HIGH : FR_ROUND, mapX = (x) => (x * (1 - 0.55 * f) + s * 0.5 * f) * rw;
  const dropR = (s > 0 ? 0.12 : 0.12 + 0.8 * f) * r, dropL = (s < 0 ? 0.12 : 0.12 + 0.8 * f) * r;
  c.fillStyle = hc; c.beginPath(); c.ellipse(0, 0, rw * g[0], r * g[1], 0, PI, TAU); c.lineTo(rw * g[0], dropR);
  for (const q of line) {
    if (q.length === 2) c.lineTo(mapX(q[0]), q[1] * r); else c.quadraticCurveTo(mapX(q[0]), q[1] * r, mapX(q[2]), q[3] * r);
  }
  c.lineTo(-rw * g[0], dropL); c.closePath(); c.fill();
  disc(-rw * 0.46 * (1 - f) - s * rw * 0.3 * f, -r * 0.9, r * 0.24, r * 0.07, light, -0.45);
  // eyes and brows: both from the front, the near one alone in a profile
  const ink = '#2b2230', er = Math.max(r * 0.11, 0.9), es = rw * 0.42, lw = Math.max(r * 0.07, 0.9), brow = tow(hc, DARK, 0.5);
  for (const e of [-1, 1]) {
    if (cf < 0.45 && e * s < 0) continue;
    const x = cf < 0.45 ? s * rw * 0.56 : fx + e * es * cf, w = 0.62 + 0.38 * cf;
    if (Math.abs(x) > rw * 0.86) continue;
    disc(x, ey, er * w, er * 1.25, ink); disc(x - er * 0.3 * w, ey - er * 0.45, er * 0.36 * w, er * 0.36, '#ffffff');
    c.strokeStyle = brow; c.lineWidth = lw; c.beginPath(); c.moveTo(x - r * 0.17 * w, ey - er * 1.25 - r * 0.2); c.quadraticCurveTo(x, ey - er * 1.25 - r * 0.3, x + r * 0.17 * w, ey - er * 1.25 - r * 0.2); c.stroke();
  }
  if (cf > 0.4) disc(fx * 1.1 + r * 0.02, (ey + my) / 2 + r * 0.03, r * 0.07, r * 0.05, tow(skin, WARM, 0.24));
  // mouth
  const mw = r * 0.3 * (0.5 + 0.5 * cf), mx = fx * (1 + 0.25 * f), dip = o.mood === 'calm' ? 0.14 : 0.27;
  c.strokeStyle = tow(skin, [92, 30, 40], 0.74); c.lineWidth = lw; c.beginPath(); c.moveTo(mx - mw, my - r * 0.04); c.quadraticCurveTo(mx, my + r * dip, mx + mw, my - r * 0.04); c.stroke();
  c.restore();
}
export function drawRig(c, R, o) {
  o = o || {};
  if (!c || !R || !(R.k > 0)) return;
  const k = R.k, items = [], push = (z, f) => items.push({ z, f });
  const skin = o.skin || '#f2c6a0', skinS = tow(skin, WARM, 0.17), hc = o.hair || '#523428', top = o.top || '#d8658f';
  const legsC = o.legs || '#f6d2cd', shoeC = o.shoe || '#f3a9b6', fitted = o.outfit === 'fitted', sleeves = o.sleeves || 'none';
  const cp = (p, A, B, ra, rb) => addCap(p, A[0], A[1], B[0], B[1], ra * 2 * k, rb * 2 * k);
  const mid = (A, B, t) => [lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t)];
  // one flat shape; a soft shadow under it keeps it apart from what it lies on
  const part = (p, col, shadow) => {
    if (shadow !== false) { c.save(); c.translate(0.55 * k + 0.6, 0.75 * k + 0.8); c.fillStyle = SHADE; c.fill(p); c.restore(); }
    c.fillStyle = col; c.fill(p);
  };
  for (const s of ['L', 'R']) {
    const hip = R['hip' + s], kn = R['knee' + s], an = R['ank' + s], he = R['heel' + s], ba = R['ball' + s], to = R['toe' + s];
    push((hip[2] + kn[2] + an[2]) / 3, () => { // thigh, knee, calf and ankle in one shape
      const p = new Path2D(), calf = mid(kn, an, 0.36);
      cp(p, hip, kn, 5.6, 4.0); cp(p, kn, calf, 4.0, 3.75); cp(p, calf, an, 3.75, 2.2);
      part(p, legsC);
    });
    push((an[2] + to[2]) / 2 + 0.02, () => { // the shoe wraps the heel and the instep and tapers to the toe
      const p = new Path2D(); cp(p, an, ba, 2.3, 1.8); cp(p, he, ba, 2.05, 1.8); cp(p, ba, to, 1.8, 0.9);
      if (o.heel > 0.05) { c.save(); c.globalAlpha *= o.heel; c.fillStyle = tow(shoeC, DARK, 0.4); c.beginPath(); c.ellipse(he[0], he[1] + 2.4 * k, 1.6 * k, 2.2 * k, 0, 0, TAU); c.fill(); c.restore(); }
      part(p, shoeC);
      if (o.ribbons > 0.05) { // ribbons crossed on the ankle
        const dx = an[0] - kn[0], dy = an[1] - kn[1], len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
        const a = [an[0] - ux * 5.4 * k, an[1] - uy * 5.4 * k], b = [an[0] - ux * 1.2 * k, an[1] - uy * 1.2 * k], w = 2.3 * k;
        c.save(); c.globalAlpha *= o.ribbons; c.strokeStyle = shoeC; c.lineWidth = Math.max(1, 0.85 * k); c.lineCap = 'round';
        c.beginPath(); c.moveTo(b[0] - nx * w, b[1] - ny * w); c.lineTo(a[0] + nx * w, a[1] + ny * w); c.moveTo(b[0] + nx * w, b[1] + ny * w); c.lineTo(a[0] - nx * w, a[1] - ny * w); c.stroke(); c.restore();
      }
    });
  }
  const chest = R.chest, pel = R.pelvis, waist = mid(chest, pel, 0.68), cs = Math.cos(R.yaw || 0);
  push(mid(chest, pel, 0.45)[2], () => {
    const yokeCol = sleeves === 'none' ? skin : top, nk = [chest[0], chest[1] - 2.2 * k];
    // shoulders: they slope from the neck and belong to the body
    const yoke = new Path2D(); for (const s of ['L', 'R']) { const q = R['sh' + s]; cp(yoke, nk, [q[0], q[1] + 1.2 * k], 2.7, 3.3); }
    part(yoke, yokeCol, false);
    // the trunk: one shape from the shoulders to the hips. A capsule along the spine gives it depth in a
    // profile; a four-cornered shape gives it shoulders and hips from the front.
    const four = (a, b, d, e, col) => {
      c.fillStyle = col; c.strokeStyle = col; c.lineWidth = 2.6 * k; c.lineJoin = 'round';
      c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(d[0], d[1]); c.lineTo(e[0], e[1]); c.closePath(); c.fill(); c.stroke();
    };
    const spine = (A, Bq, w0, w1, col) => { const p = new Path2D(); cp(p, A, Bq, w0, w1); part(p, col, false); };
    const off = (P, Q, m) => [P[0] + (Q[0] - pel[0]) * m, P[1] + (Q[1] - pel[1]) * m];
    const sa = mid(chest, R.shL, 0.93), sb = mid(chest, R.shR, 0.93); sa[1] += 0.9 * k; sb[1] += 0.9 * k;
    const chest3 = [chest[0], chest[1] + 3 * k], wl = off(waist, R.hipL, 0.86), wr = off(waist, R.hipR, 0.86);
    const hl = off(pel, R.hipL, 1.02), hr = off(pel, R.hipR, 1.02); hl[1] += 1.2 * k; hr[1] += 1.2 * k;
    if (fitted) { // a fitted top down to the waist, the hips in the colour of the tights
      spine(waist, [pel[0], pel[1] + 1 * k], 4.8, 4.4, legsC); four(wl, wr, hr, hl, legsC);
      spine(chest3, mid(chest, pel, 0.56), 6.0, 5.0, top); four(sa, sb, wr, wl, top);
    } else { spine(chest3, [pel[0], pel[1] + 1 * k], 6.0, 4.4, top); four(sa, sb, hr, hl, top); }
    if (sleeves === 'none' && cs > 0.2) { // the scooped neckline, seen from the front
      c.fillStyle = skin; c.beginPath(); c.ellipse(chest[0] + Math.sin(R.yaw || 0) * 2 * k, chest[1] + 0.6 * k, 4.3 * k * (0.5 + 0.5 * cs), 3.6 * k, 0, 0, TAU); c.fill();
    }
  });
  push(chest[2] + 0.2, () => { // the neck, in the shadow of the chin
    const up = R.headUp || [0, -1], p = new Path2D();
    cp(p, [chest[0], chest[1] + 1 * k], [R.head[0] - up[0] * R.headR * 0.7, R.head[1] - up[1] * R.headR * 0.7], 3.1, 2.9); part(p, skinS, false);
  });
  for (const s of ['L', 'R']) {
    const sh = R['sh' + s], el = R['elb' + s], wr = R['wrist' + s], hd = R['hand' + s];
    push((sh[2] + el[2] + hd[2]) / 3 + 4, () => { // one shape from the shoulder through the elbow to the fingertips
      const arm = new Path2D(), hand = new Path2D(), long = sleeves === 'long';
      cp(arm, sh, el, 3.0, 2.25); cp(arm, el, wr, 2.25, 1.5);
      // a small hand: the fingers together in one soft curve, the thumb a little apart
      const dx = hd[0] - wr[0], dy = hd[1] - wr[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, len = Math.max(L * 1.35, 5.4 * k);
      let nx = -uy, ny = ux; if (ny > 0) { nx = -nx; ny = -ny; }
      const at = (t, off) => [wr[0] + ux * len * t + nx * off * k, wr[1] + uy * len * t + ny * off * k], hp = long ? hand : arm;
      cp(hp, wr, at(0.45, 0), 1.5, 1.7); cp(hp, at(0.45, 0), at(1, -0.35), 1.65, 0.75); cp(hp, at(0.2, 0.9), at(0.56, 1.7), 0.8, 0.6);
      if (long) part(hand, skin, false);
      part(arm, long ? top : skin);
      // the round of the shoulder covers the top of the arm in the same colour: no seam
      const down = Math.max(0, (el[1] - sh[1]) / (Math.hypot(el[0] - sh[0], el[1] - sh[1]) || 1)), capP = new Path2D();
      addEll(capP, sh[0], sh[1] + (0.3 + 0.9 * down) * k, (3.2 + 0.2 * down) * k, (3.2 + 0.2 * down) * k);
      if (sleeves === 'short') cp(capP, sh, mid(sh, el, 0.42), 3.7, 3.2);
      part(capP, sleeves === 'none' ? skin : top, false);
    });
  }
  const sk = R.skirt;
  if (sk && sk.alpha > 0.02) { // a tutu or a gown: quads between the rings, the far half behind the body and the near half in front
    const rings = sk.rings, n = rings[0].length - 1, quads = { front: [], back: [] }, col = sk.col;
    for (let j = 0; j < rings.length - 1; j++) for (let i = 0; i < n; i++) {
      const q = [rings[j][i], rings[j][i + 1], rings[j + 1][i + 1], rings[j + 1][i]];
      quads[(q[0][2] + q[1][2] + q[2][2] + q[3][2]) / 4 > sk.z ? 'front' : 'back'].push(q);
    }
    for (const side of ['back', 'front']) {
      const qs = quads[side]; if (!qs.length) continue;
      push(side === 'front' ? sk.z + sk.r * 0.45 : sk.z - sk.r * 0.6, () => {
        let x0 = 1e9, x1 = -1e9; const inner = side === 'back';
        c.beginPath();
        for (const q of qs) { c.moveTo(q[0][0], q[0][1]); for (let m = 1; m < 4; m++) c.lineTo(q[m][0], q[m][1]); c.closePath(); for (const p of q) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); } }
        const g = c.createLinearGradient(x0, 0, x1, 0);
        g.addColorStop(0, inner ? col[1] : col[0]); g.addColorStop(0.5, inner ? tow(col[1], rgb(col[2]), 0.5) : col[1]); g.addColorStop(1, col[2]);
        c.save(); c.globalAlpha *= sk.alpha; c.fillStyle = g; c.fill('nonzero');
        if (sk.alpha > 0.95) { c.lineWidth = 0.6; c.strokeStyle = g; c.stroke(); }
        if (!inner) { // the light hem
          c.lineWidth = 1.6; c.strokeStyle = col[0]; c.globalAlpha *= 0.9; c.beginPath(); let on = false; const hem = rings[rings.length - 2];
          for (let i = 0; i <= n; i++) { const p = hem[i]; if (p[2] < sk.z - 2) { on = false; continue; } if (!on) { c.moveTo(p[0], p[1]); on = true; } else c.lineTo(p[0], p[1]); }
          c.stroke();
        }
        c.restore();
      });
    }
  }
  if (R.layers) for (const l of R.layers) push(l.z, () => l.draw(c));
  push(R.head[2] + 0.5, () => rigHead(c, R, o, skin, skinS, hc));
  items.sort((a, b) => a.z - b.z);
  c.save();
  for (const it of items) it.f();
  c.restore();
}
