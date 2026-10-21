#!/usr/bin/env node
/**
 * labs-candidates.mjs — ranks topics that have no lab yet, as candidates for the next labs.
 *
 *   node scripts/labs-candidates.mjs [--n 30] [--age 6-10] [--subject Science] [--json] [--all]
 *
 * Filters (skipped with --all): no lab yet; age range overlaps the window (default 6-10);
 * not vocabulary (type LANGUAGE, or "vocabulary"/"словар" in the name), not meta-cognitive (type META,
 * the whole "Learning to Learn" subject), not English-only literacy (phonics, spelling, handwriting,
 * grammar, vocabulary), not native-language grammar in "Language & Literature" (morphology, syntax,
 * orthography, ...): none of it transfers to Russian/Hungarian children; --subject keeps one subject.
 * Each topic is counted under the first exclusion that matches (order: vocabulary, meta, English, L&L).
 * Score: unlocks (direct dependents) desc, centrality desc, reach (transitive dependents) desc.
 * Age stages of one series ("Counting (ages 5+)", "Counting (ages 8+)") collapse to the best member.
 * "near labs" are the labs of the candidate's direct prerequisites and dependents.
 */

import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const load = (p) => JSON.parse(readFileSync(resolve(ROOT, p), 'utf8'));
const opt = (p) => (existsSync(resolve(ROOT, p)) ? load(p) : null);

// ---- arguments
const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const val = (name, dflt) => { const i = argv.indexOf(`--${name}`); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : dflt; };
const N = Number(val('n', 30));
const [LO, HI] = val('age', '6-10').split('-').map(Number);
const SUBJECT = val('subject', null)?.toLowerCase() ?? null;
const JSON_OUT = flag('json'), ALL = flag('all');
if (!Number.isFinite(N) || !Number.isFinite(LO) || !Number.isFinite(HI)) {
  console.error('usage: node scripts/labs-candidates.mjs [--n 30] [--age 6-10] [--subject Science] [--json] [--all]');
  process.exit(1);
}

// ---- data
const { labs } = load('labs/registry.json');
const topics = [...load('data/topics.json').topics, ...(opt('data/extra/topics.json')?.topics ?? [])];
const deps = [...load('data/dependencies.json').dependencies, ...(opt('data/extra/dependencies.json')?.dependencies ?? [])];
const byId = new Map(topics.map((t) => [t.id, t]));

const names = (lang) => {
  const m = new Map();
  for (const p of [`data/i18n/${lang}/topics.json`, `data/extra/i18n/${lang}/topics.json`]) {
    const j = opt(p);
    for (const t of j?.topics ?? (Array.isArray(j) ? j : [])) if (t.name) m.set(t.id, t.name);
  }
  return m;
};
const ru = names('ru');

// ---- graph: topicId depends on prerequisiteId
const dependents = new Map(), prereqs = new Map();
const push = (m, k, v) => { if (!m.has(k)) m.set(k, []); m.get(k).push(v); };
for (const { topicId, prerequisiteId } of deps) { push(dependents, prerequisiteId, topicId); push(prereqs, topicId, prerequisiteId); }

const reachOf = (id) => {
  const seen = new Set([id]);
  let frontier = [id];
  while (frontier.length) {
    const next = [];
    for (const t of frontier) for (const d of dependents.get(t) ?? []) if (!seen.has(d)) { seen.add(d); next.push(d); }
    frontier = next;
  }
  return seen.size - 1;
};

// ---- labs coverage
const labsOf = new Map();
for (const l of labs) for (const t of l.topics) push(labsOf, t, l);
const covered = new Set(labsOf.keys());
const bySubject = {};
for (const l of labs) bySubject[l.subject] = (bySubject[l.subject] ?? 0) + 1;

// ---- filters
const LITERACY = /phonics|spelling|handwriting|grammar|vocabulary/i;
const LL_GRAMMAR = /morphology|syntax|grammar|orthograph|phonetic|lexis|lexic|vocabulary|spelling/i;
const VOCAB_NAME = /vocabulary|словар/i;
const overlaps = (t) => t.ageRangeStart <= HI && t.ageRangeEnd >= LO;
const base = (t) => !covered.has(t.id) && overlaps(t) && (!SUBJECT || t.subject.toLowerCase() === SUBJECT);
// reason a topic is out of scope for labs, or null; first match wins
const excludedBy = (t) =>
  t.type === 'LANGUAGE' || VOCAB_NAME.test(t.name) || VOCAB_NAME.test(ru.get(t.id) ?? '') ? 'vocabulary'
  : t.type === 'META' || t.subject === 'Learning to Learn' ? 'meta'
  : t.subject === 'English' && LITERACY.test(t.domain ?? '') ? 'English literacy'
  : t.subject === 'Language & Literature' && LL_GRAMMAR.test(t.domain ?? '') ? 'L&L grammar'
  : null;
const excluded = { vocabulary: 0, meta: 0, 'English literacy': 0, 'L&L grammar': 0 };
const pool = [];
for (const t of topics) {
  if (!base(t)) continue;
  const why = ALL ? null : excludedBy(t);
  if (why) excluded[why]++; else pool.push(t);
}

// ---- score
const sorted = [...topics.map((t) => t.centrality)].sort((a, b) => a - b);
const keyCut = sorted[Math.floor(sorted.length * 0.9)];
const scored = pool.map((t) => ({
  t, unlocks: (dependents.get(t.id) ?? []).length, reach: reachOf(t.id), centrality: t.centrality ?? 0,
}));
const cmp = (a, b) => b.unlocks - a.unlocks || b.centrality - a.centrality || b.reach - a.reach || a.t.id.localeCompare(b.t.id);
scored.sort(cmp);

// ---- collapse age stages of one series
const STAGE = /\s*\([^()]*\d+\+[^()]*\)\s*$/;
const seriesKey = (t) => STAGE.test(t.name) ? `${t.subject}|${t.domain}|${t.name.replace(STAGE, '').trim().toLowerCase()}` : null;
const seriesAges = new Map();
for (const t of topics) { const k = seriesKey(t); if (k) push(seriesAges, k, `${t.ageRangeStart}-${t.ageRangeEnd}`); }
const seen = new Set();
const ranked = [];
for (const s of scored) {   // already best-first, so the first member of a series seen is its best
  const k = seriesKey(s.t);
  if (k) { if (seen.has(k)) continue; seen.add(k); s.stages = [...new Set(seriesAges.get(k))].sort((a, b) => parseFloat(a) - parseFloat(b)); }
  ranked.push(s);
}

// ---- neighbour labs
const nearLabs = (id) => {
  const titles = new Set();
  for (const n of [...(prereqs.get(id) ?? []), ...(dependents.get(id) ?? [])]) for (const l of labsOf.get(n) ?? []) titles.add(l.title.en);
  return [...titles];
};

const cut = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
const rows = ranked.slice(0, N).map((s, i) => ({
  rank: i + 1,
  subject: s.t.subject,
  domain: s.t.domain,
  name: s.t.name,
  ru: ru.get(s.t.id) ?? '',
  age: `${s.t.ageRangeStart}-${s.t.ageRangeEnd}`,
  unlocks: s.unlocks,
  reach: s.reach,
  centrality: s.centrality,
  key: s.centrality >= keyCut,
  stages: s.stages ?? [],
  nearLabs: nearLabs(s.t.id),
  id: s.t.id,
}));

if (JSON_OUT) { console.log(JSON.stringify(rows, null, 1)); process.exit(0); }

// ---- report
const inWindow = topics.filter((t) => overlaps(t));
const noLab = inWindow.filter((t) => !covered.has(t.id));
console.log(`labs: ${labs.length} | topics covered: ${covered.size}/${topics.length}`);
console.log(`labs per subject: ${Object.entries(bySubject).sort(([, a], [, b]) => b - a).map(([s, n]) => `${s} ${n}`).join(', ')}`);
console.log(`ages ${LO}-${HI}: ${inWindow.length} topics, ${noLab.length} without a lab`);
console.log(`candidates after filters${ALL ? ' (--all: none applied)' : ''}: ${pool.length} topics, ${ranked.length} after collapsing age stages; showing ${rows.length}`);
console.log(ALL ? 'excluded: none (--all)' : `excluded: ${Object.entries(excluded).map(([k, n]) => `${k} ${n}`).join(', ')}`);
console.log(`key (★): centrality >= ${keyCut} (top 10% of all topics)\n`);

const cell = (s) => String(s).replace(/\|/g, '\\|');
console.log('| # | subject | domain | name (en) | ru | age | unlocks | reach | key | stages | near labs | id |');
console.log('|---|---|---|---|---|---|---|---|---|---|---|---|');
for (const r of rows) {
  console.log('| ' + [
    r.rank, r.subject, cut(r.domain ?? '', 28), cut(r.name, 48), cut(r.ru, 48), r.age, r.unlocks, r.reach,
    r.key ? '★' : '', r.stages.join(' '), cut(r.nearLabs.join('; '), 60), r.id,
  ].map(cell).join(' | ') + ' |');
}
