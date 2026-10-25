// Builds labs/poles/geo.js: the outlines the Poles lab draws, from Natural Earth (public domain).
// Download the GeoJSON files from https://github.com/nvkelso/natural-earth-vector/tree/master/geojson
// into one folder, then: node scripts/poles-geo.mjs <folder>
//   ne_50m_admin_0_countries, ne_50m_antarctic_ice_shelves_polys, ne_110m_land
// Polar maps: azimuthal equidistant, unit disc = the map's edge, North with 0° down, South with 0° up.
// Globe: lon/lat in tenths of a degree, the lab projects it itself.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2];
if (!dir) { console.error('usage: node scripts/poles-geo.mjs <folder with Natural Earth GeoJSON>'); process.exit(1); }
const load = (f) => JSON.parse(readFileSync(join(dir, `${f}.geojson`), 'utf8')).features;
const rad = (d) => d * Math.PI / 180;

const N_EDGE = 42, S_EDGE = 40;          // colatitude of the map's edge: 48°N, 50°S
const Q = 500, TOL = 1.2 / Q;            // quantisation of the unit disc, simplification tolerance

// Google polyline encoding of integer pairs, deltas from the previous point
function enc(pts) {
  let out = '', px = 0, py = 0;
  const one = (v) => { v = v < 0 ? ~(v << 1) : v << 1; while (v >= 0x20) { out += String.fromCharCode((0x20 | (v & 0x1f)) + 63); v >>= 5; } out += String.fromCharCode(v + 63); };
  for (const [x, y] of pts) { one(x - px); one(y - py); px = x; py = y; }
  return out;
}
// Douglas-Peucker on a closed ring (first point = last point): split at the point farthest from the start
function simplify(pts, tol) {
  let far = 0, fd = -1;
  pts.forEach(([x, y], i) => { const d = Math.hypot(x - pts[0][0], y - pts[0][1]); if (d > fd) { fd = d; far = i; } });
  return far ? dp(pts.slice(0, far + 1), tol).concat(dp(pts.slice(far), tol).slice(1)) : pts;
}
function dp(pts, tol) {
  if (pts.length < 5) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const st = [[0, pts.length - 1]];
  while (st.length) {
    const [a, b] = st.pop(); const [ax, ay] = pts[a], [bx, by] = pts[b], dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1e-12;
    let md = 0, mi = -1;
    for (let i = a + 1; i < b; i++) { const d = Math.abs((pts[i][0] - ax) * dy - (pts[i][1] - ay) * dx) / L; if (d > md) { md = d; mi = i; } }
    if (md > tol) { keep[mi] = 1; st.push([a, mi], [mi, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}
// Sutherland-Hodgman against a convex polygon slightly bigger than the unit disc
const CLIP = Array.from({ length: 96 }, (_, i) => [1.03 * Math.cos(i / 96 * 2 * Math.PI), 1.03 * Math.sin(i / 96 * 2 * Math.PI)]);
function clip(ring) {
  let out = ring;
  for (let i = 0; i < CLIP.length && out.length; i++) {
    const [ax, ay] = CLIP[i], [bx, by] = CLIP[(i + 1) % CLIP.length], inside = ([x, y]) => (bx - ax) * (y - ay) - (by - ay) * (x - ax) >= 0;
    const src = out; out = [];
    for (let j = 0; j < src.length; j++) {
      const p = src[j], q = src[(j + 1) % src.length], pi = inside(p), qi = inside(q);
      if (pi) out.push(p);
      if (pi !== qi) {
        const [px, py] = p, [qx, qy] = q, d = (bx - ax) * (qy - py) - (by - ay) * (qx - px);
        const t = ((bx - ax) * (ay - py) - (by - ay) * (ax - px)) / d; out.push([px + t * (qx - px), py + t * (qy - py)]);
      }
    }
  }
  return out;
}
const north = ([lon, lat]) => { const r = (90 - lat) / N_EDGE; return [r * Math.sin(rad(lon)), r * Math.cos(rad(lon))]; };
const south = ([lon, lat]) => { const r = (90 + lat) / S_EDGE; return [r * Math.sin(rad(lon)), -r * Math.cos(rad(lon))]; };
const rings = (g) => (g.type === 'Polygon' ? [g.coordinates[0]] : g.coordinates.map((p) => p[0]));
// densify long edges first so that straight lon/lat segments bend like they should
function densify(ring) {
  const out = [];
  for (let i = 0; i < ring.length - 1; i++) {
    const [a, b] = [ring[i], ring[i + 1]], n = Math.max(1, Math.ceil(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])) / 1));
    for (let k = 0; k < n; k++) out.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
  }
  return out;
}
function polar(features, proj, keepLat, group) {
  const out = [];
  for (const f of features) {
    const g = group(f); if (g === null) continue;
    for (const ring of rings(f.geometry)) {
      if (!ring.some(keepLat)) continue;
      let pts = clip(densify(ring).map(proj)); if (pts.length < 3) continue;
      pts = simplify([...pts, pts[0]], TOL).slice(0, -1).map(([x, y]) => [Math.round(x * Q), Math.round(y * Q)]);
      pts = pts.filter((p, i) => i === 0 || p[0] !== pts[i - 1][0] || p[1] !== pts[i - 1][1]);
      if (pts.length >= 3) out.push([g, enc(pts)]);
    }
  }
  return out;
}

const countries = load('ne_50m_admin_0_countries');
const NG = { RUS: 'ru', CAN: 'ca', USA: 'us', GRL: 'gl', NOR: 'sc', SWE: 'sc', FIN: 'sc', ISL: 'is' };
const N = polar(countries, north, ([, lat]) => lat > 90 - N_EDGE, (f) => NG[f.properties.ADM0_A3] ?? 'x');
const S = polar(countries, south, ([, lat]) => lat < -90 + S_EDGE, (f) => (f.properties.ADM0_A3 === 'ATA' ? 'aq' : 'x'));
const SH = polar(load('ne_50m_antarctic_ice_shelves_polys'), south, () => true, () => 'sh');

const G = [];
for (const f of load('ne_110m_land')) for (const ring of rings(f.geometry)) {
  let pts = simplify(ring.slice(0, -1).concat([ring[0]]), .35).slice(0, -1).map(([lon, lat]) => [Math.round(lon * 10), Math.round(lat * 10)]);
  if (pts.length >= 3) G.push(enc(pts));
}

const js = `// Generated by scripts/poles-geo.mjs from Natural Earth (public domain, naturalearthdata.com). Do not edit by hand.
// Polar rings: [group, polyline] in a unit disc ×${Q}; north edge ${90 - N_EDGE}°N with 0° down, south edge ${S_EDGE - 90}°S with 0° up.
// Globe rings: polylines of lon/lat ×10.
export const Q = ${Q}, N_EDGE = ${N_EDGE}, S_EDGE = ${S_EDGE};
export const NORTH = ${JSON.stringify(N)};
export const SOUTH = ${JSON.stringify(S)};
export const SHELVES = ${JSON.stringify(SH.map(([, p]) => p))};
export const GLOBE = ${JSON.stringify(G)};
`;
writeFileSync(new URL('../labs/poles/geo.js', import.meta.url), js);
console.log(`geo.js: ${(js.length / 1024).toFixed(1)} KB; north ${N.length}, south ${S.length}, shelves ${SH.length}, globe ${G.length} rings`);
