#!/usr/bin/env node
/**
 * labs-catalog.mjs — derives labs/catalog.json from labs/registry.json and the graph.
 *
 * For every lab: the age range and domains of its topics, and up to NEAR other labs
 * closest to it in the prerequisite graph (fewest steps between their topics, either direction).
 * The lab pages and the viewer use it to show "nearby labs" instead of one long list.
 * Also up to STEP labs in each direction of the prerequisite arrows: `before` (labs on the prerequisites of
 * the lab's topics: "too hard? look at these first") and `after` (labs on topics that build on it: "too easy? go on").
 * Every lab page shows them under the lab as "Where next".
 * Run after adding a lab:
 *
 *   node scripts/labs-catalog.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const load = (p) => JSON.parse(readFileSync(resolve(ROOT, p), 'utf8'));
const opt = (p) => (existsSync(resolve(ROOT, p)) ? load(p) : null);
const NEAR = 8, DEPTH = 6, STEP = 3;

const { labs } = load('labs/registry.json');
const topics = [...load('data/topics.json').topics, ...(opt('data/extra/topics.json')?.topics ?? [])];
const deps = [...load('data/dependencies.json').dependencies, ...(opt('data/extra/dependencies.json')?.dependencies ?? [])];

const byId = new Map(topics.map((t) => [t.id, t]));
const adj = new Map();
for (const { topicId: a, prerequisiteId: b } of deps) {
  if (!adj.has(a)) adj.set(a, []);
  if (!adj.has(b)) adj.set(b, []);
  adj.get(a).push(b); adj.get(b).push(a);
}
// directed: topic -> its prerequisites (down) and topic -> the topics that need it (up)
const down = new Map(), up = new Map();
for (const { topicId: a, prerequisiteId: b } of deps) {
  if (!down.has(a)) down.set(a, []); down.get(a).push(b);
  if (!up.has(b)) up.set(b, []); up.get(b).push(a);
}

// every lab says when it was added (YYYY-MM-DD): the overview's "newest first" order and its "New" badge use it
for (const l of labs) if (!/^\d{4}-\d{2}-\d{2}$/.test(l.added ?? '')) throw new Error(`${l.id}: "added" must be a date like 2026-11-01`);

// topic -> labs that explain it
const labsOf = new Map();
for (const l of labs) for (const t of l.topics) {
  if (!byId.has(t)) throw new Error(`${l.id}: unknown topic ${t}`);
  if (!labsOf.has(t)) labsOf.set(t, []);
  labsOf.get(t).push(l.id);
}

const subjectOf = new Map(labs.map((l) => [l.id, l.subject]));
const minAge = (l) => Math.min(...l.topics.map((t) => byId.get(t).ageRangeStart));
const ageOf = new Map(labs.map((l) => [l.id, minAge(l)]));
const own = new Map(labs.map((l) => [l.id, new Set(l.topics)]));
// labs reached by following the arrows one way from the lab's topics; a lab sharing a topic with this one is a sibling, not a step
const walk = (l, edges) => {
  const seen = new Set(l.topics), found = new Map();
  let frontier = [...l.topics];
  for (let d = 1; d <= DEPTH && frontier.length && found.size < STEP * 3; d++) {
    const next = [];
    for (const t of frontier) for (const n of edges.get(t) ?? []) if (!seen.has(n)) { seen.add(n); next.push(n); }
    for (const t of next) for (const id of labsOf.get(t) ?? [])
      if (id !== l.id && !found.has(id) && ![...own.get(id)].some((x) => own.get(l.id).has(x))) found.set(id, d);
    frontier = next;
  }
  return found;
};
const out = {};
for (const l of labs) {
  // breadth-first from all of the lab's topics at once; the first time another lab's topic is reached is its distance
  const dist = new Map(l.topics.map((t) => [t, 0]));
  const found = new Map();
  let frontier = [...l.topics];
  for (let d = 0; d <= DEPTH && frontier.length && found.size < NEAR * 2; d++) {
    for (const t of frontier) for (const id of labsOf.get(t) ?? []) if (id !== l.id && !found.has(id)) found.set(id, d);
    const next = [];
    for (const t of frontier) for (const n of adj.get(t) ?? []) if (!dist.has(n)) { dist.set(n, d + 1); next.push(n); }
    frontier = next;
  }
  const near = [...found].sort(([a, da], [b, db]) => da - db || (subjectOf.get(b) === l.subject) - (subjectOf.get(a) === l.subject) || a.localeCompare(b))
    .slice(0, NEAR).map(([id]) => id);
  // a lab reached both ways (a lab spanning several stages of a series) is a neighbour, not a step: kept out of both.
  // Order: labs on the right side of this lab's age first (younger before it, older after it), then closest, then the same subject
  const dn = walk(l, down), upw = walk(l, up), me = ageOf.get(l.id);
  const rank = (m, wrong) => [...m].filter(([id]) => !(dn.has(id) && upw.has(id)))
    .sort(([a, da], [b, db]) => wrong(ageOf.get(a)) - wrong(ageOf.get(b)) || da - db
      || (subjectOf.get(b) === l.subject) - (subjectOf.get(a) === l.subject) || a.localeCompare(b))
    .slice(0, STEP).map(([id]) => id);
  const before = rank(dn, (a) => a > me), after = rank(upw, (a) => a < me);
  const ts = l.topics.map((t) => byId.get(t));
  out[l.id] = {
    age: [Math.min(...ts.map((t) => t.ageRangeStart)), Math.max(...ts.map((t) => t.ageRangeEnd))],
    domains: [...new Set(ts.map((t) => t.domain))],
    near,
    before,
    after,
  };
}

writeFileSync(resolve(ROOT, 'labs/catalog.json'), JSON.stringify({
  about: 'Generated by scripts/labs-catalog.mjs from labs/registry.json and the graph: age range, domains, nearby labs (closest in the prerequisite graph) and the labs before/after it along the prerequisite arrows for every lab. Do not edit by hand.',
  labs: out,
}, null, 1) + '\n');
const n = (f) => Object.values(out).filter(f).length;
console.log(`labs/catalog.json: ${labs.length} labs, ${n((x) => x.near.length)} with nearby labs, ${n((x) => x.before.length)} with labs before, ${n((x) => x.after.length)} with labs after, ${n((x) => !x.before.length && !x.after.length)} with neither`);
