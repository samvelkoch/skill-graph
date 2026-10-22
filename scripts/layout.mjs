#!/usr/bin/env node
/**
 * layout.mjs — precomputes the map's 3D positions so the viewer draws them on a plain 2D canvas (graph2d.js).
 *
 * Height is age; the horizontal plane comes from a short force layout (springs along prerequisites, short-range
 * repulsion, a soft cone that widens with age). Seeded, so a rerun on the same data gives the same file.
 * Rerun after any change to topics or dependencies:
 *
 *   node scripts/layout.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DATA = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'data');
const load = (name) => JSON.parse(readFileSync(resolve(DATA, name), 'utf8'));
const opt = (name) => (existsSync(resolve(DATA, name)) ? load(name) : null);

// same order as COLORS in index.html: each subject starts in its own sector around the vertical axis
const SUBJECTS = ['Mathematics', 'Science', 'English', 'History', 'Personal & Social Development', 'Life Skills', 'Computing',
  'Learning to Learn', 'Geography', 'Language & Literature', 'Civics & Society', 'Visual Arts', 'Music'];
const AGE_SCALE = 45; // world units per year of age
const SPREAD = 5, ITERS = 300, SPRING = 0.012, REST = 28, REPEL = 2.2, CELL = 26, TEMP = 9;

const topics = [...load('topics.json').topics, ...(opt('extra/topics.json')?.topics ?? [])];
const deps = [...load('dependencies.json').dependencies, ...(opt('extra/dependencies.json')?.dependencies ?? [])];
const ageMin = Math.min(...topics.map((t) => t.ageRangeStart)), ageMax = Math.max(...topics.map((t) => t.ageRangeEnd));

// mulberry32: a tiny seeded PRNG
let seed = 0x5eed2d;
const rand = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
  return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
};

// height = age: the middle of the topic's age range, spread over that range by a stable hash so ages don't form flat layers
const ageOf = (t) => {
  let h = 0; for (const ch of t.id) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return (t.ageRangeStart + t.ageRangeEnd) / 2 + ((h >>> 0) % 1000 / 1000 - 0.5) * Math.max(1, t.ageRangeEnd - t.ageRangeStart) * 0.9;
};
const coneR = (age) => 20 + Math.max(0, age - ageMin) * 19; // a narrow cone: young topics at the bottom tip, older ones fanning out

const n = topics.length, idx = new Map(topics.map((t, i) => [t.id, i]));
const X = new Float64Array(n), Y = new Float64Array(n), Z = new Float64Array(n), R = new Float64Array(n);
const sector = (2 * Math.PI) / SUBJECTS.length;
topics.forEach((t, i) => {
  const age = ageOf(t), s = Math.max(0, SUBJECTS.indexOf(t.subject));
  const a = (s + 0.5 + (rand() - 0.5) * SPREAD) * sector, r = coneR(age) * Math.sqrt(rand()) * 0.9;
  X[i] = Math.cos(a) * r; Z[i] = Math.sin(a) * r; Y[i] = (age - (ageMin + ageMax) / 2) * AGE_SCALE; R[i] = coneR(age);
});
const edges = deps.map((d) => [idx.get(d.prerequisiteId), idx.get(d.topicId)]).filter(([a, b]) => a !== undefined && b !== undefined && a !== b);
const deg = new Float64Array(n);
for (const [a, b] of edges) { deg[a]++; deg[b]++; }

const DX = new Float64Array(n), DZ = new Float64Array(n);
for (let it = 0; it < ITERS; it++) {
  DX.fill(0); DZ.fill(0);
  // repulsion inside a uniform 3D grid: each node only meets the nodes in its own and the 26 neighbouring cells
  const grid = new Map(), key = (a, b, c) => ((a + 512) * 1024 + b + 512) * 1024 + c + 512;
  for (let i = 0; i < n; i++) {
    const k = key(Math.floor(X[i] / CELL), Math.floor(Y[i] / CELL), Math.floor(Z[i] / CELL));
    (grid.get(k) ?? grid.set(k, []).get(k)).push(i);
  }
  for (let i = 0; i < n; i++) {
    const gx = Math.floor(X[i] / CELL), gy = Math.floor(Y[i] / CELL), gz = Math.floor(Z[i] / CELL);
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let c = -1; c <= 1; c++) {
      for (const j of grid.get(key(gx + a, gy + b, gz + c)) ?? []) {
        if (j === i) continue;
        let dx = X[i] - X[j], dz = Z[i] - Z[j];
        const dy = Y[i] - Y[j], d = Math.hypot(dx, dy, dz);
        if (d >= CELL) continue;
        let h = Math.hypot(dx, dz);
        if (h < 1e-6) { dx = rand() - 0.5; dz = rand() - 0.5; h = Math.hypot(dx, dz); } // same x,z: nudge apart
        const push = REPEL * (1 - d / CELL);
        DX[i] += (dx / h) * push; DZ[i] += (dz / h) * push;
      }
    }
  }
  // springs along prerequisites, on x,z only (height stays the age); hubs are damped so they don't swallow their neighbours
  for (const [a, b] of edges) {
    const dx = X[b] - X[a], dz = Z[b] - Z[a], d = Math.hypot(dx, Y[b] - Y[a], dz) || 1;
    const k = (SPRING * (d - REST)) / d;
    DX[a] += (dx * k) / Math.sqrt(deg[a]); DZ[a] += (dz * k) / Math.sqrt(deg[a]);
    DX[b] -= (dx * k) / Math.sqrt(deg[b]); DZ[b] -= (dz * k) / Math.sqrt(deg[b]);
  }
  // decaying step, then the soft cone pulls back whatever crossed its wall
  const temp = TEMP * (1 - it / ITERS) + 0.3;
  for (let i = 0; i < n; i++) {
    const m = Math.hypot(DX[i], DZ[i]), s = m > temp ? temp / m : 1;
    X[i] += DX[i] * s; Z[i] += DZ[i] * s;
    const r = Math.hypot(X[i], Z[i]);
    if (r > R[i]) { const k = (R[i] + (r - R[i]) * 0.3) / r; X[i] *= k; Z[i] *= k; }
  }
}

const r1 = (v) => Math.round(v * 10) / 10;
const lines = topics.map((t, i) => `    ${JSON.stringify(t.id)}: [${r1(X[i])}, ${r1(Y[i])}, ${r1(Z[i])}]`);
const out = `{\n  "note": "3D positions for the map (x, y = age, z), generated by scripts/layout.mjs; rerun after topics or dependencies change",\n` +
  `  "ageMin": ${ageMin},\n  "ageMax": ${ageMax},\n  "nodes": {\n${lines.join(',\n')}\n  }\n}\n`;
writeFileSync(resolve(DATA, 'layout.json'), out);
console.log(`layout: ${n} nodes, ${edges.length} edges → data/layout.json (${(Buffer.byteLength(out) / 1024).toFixed(1)} KB)`);
