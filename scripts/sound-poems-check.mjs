#!/usr/bin/env node
/**
 * sound-poems-check.mjs — checks every poem of the speech-therapy lab (labs/sound-poems/poems.js) by sound, not by spelling:
 *  - no sound later in the order than the poem's target (с' з' с з ш ж ц ч щ л' л р р'); earlier sounds are allowed;
 *  - the target sound (each sound of a pair) comes often enough;
 *  - no words whose pronunciation norm is unsettled (дождь, вожжи…);
 *  - 4 or 8 lines; warns when the syllable count of rhyming lines differs a lot or the line ends do not look like AABB / ABAB.
 * Also reports which poems pass the stricter rule (whistling and hushing sounds apart, Л and Р apart).
 *
 *   node scripts/sound-poems-check.mjs            # the collection
 *   node scripts/sound-poems-check.mjs draft.txt  # a draft file in the same format
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { checkPoem, syllables, words, LABEL, ORDER } = await import(pathToFileURL(resolve(ROOT, 'labs/sound-poems/phonetics.js')));
const { parsePoems } = await import(pathToFileURL(resolve(ROOT, 'labs/sound-poems/poems-parse.js')));

const arg = process.argv[2];
const text = arg ? readFileSync(resolve(arg), 'utf8') : (await import(pathToFileURL(resolve(ROOT, 'labs/sound-poems/poems.js')))).POEMS;
const poems = parsePoems(text);
const SEASONS = new Set(['autumn', 'winter', 'spring', 'summer', 'any']);
const MIN = 4; // the target sound at least this many times per quatrain (each sound of a pair: 3)

const DEV = { б: 'п', в: 'ф', г: 'к', д: 'т', ж: 'ш', з: 'с' };
const norm = (w) => w.toLowerCase().replace(/ё/g, 'о').replace(/ы/g, 'и').replace(/я/g, 'а').replace(/ю/g, 'у').replace(/е/g, 'э').replace(/[ьъ]/g, '')
  .replace(/[бвгджз]$/, (c) => DEV[c]);
const last = (line) => norm(words(line).at(-1)?.w ?? '');
// rhyme: the same last vowel and what follows it; for words ending in a vowel also the consonant before it (Вася / Аси)
const tail = (line) => { const w = last(line), m = w.match(/([^аэиоу]?)([аэиоу])([^аэиоу]*)$/); return m ? m : [w, '', w, '']; };
const rhymes = (a, b) => { const x = tail(a), y = tail(b); return x[2] === y[2] && x[3] === y[3] || !x[3] && !y[3] && x[1] && x[1] === y[1]; };

let errors = 0, warns = 0;
const table = {};
for (const p of poems) {
  const msgs = [], warn = [];
  const keys = p.target.split('+');
  if (!keys.every((k) => ORDER.includes(k))) msgs.push(`unknown target ${p.target}`);
  if (!SEASONS.has(p.season)) msgs.push(`unknown season ${p.season}`);
  if (![4, 6, 8].includes(p.lines.length)) msgs.push(`${p.lines.length} lines`);
  const r = checkPoem(p.text, p.target);
  for (const b of r.bad) msgs.push(`«${b.w}» has ${LABEL[b.k]}`);
  for (const a of r.ambiguous) msgs.push(`«${a.w}»: ${a.why === 'soft' ? 'soft or hard, the norm allows both' : 'pronunciation not fixed'}`);
  const q = p.lines.length / 4;
  for (const k of keys) { const need = (keys.length > 1 ? 3 : MIN) * q; if (r.n[k] < need) msgs.push(`${LABEL[k]} only ${r.n[k]}× (need ${need})`); }
  // rhythm and rhyme: per quatrain
  for (let s = 0; s + 3 < p.lines.length; s += 4) {
    const L = p.lines.slice(s, s + 4), syl = L.map(syllables);
    const aabb = rhymes(L[0], L[1]) && rhymes(L[2], L[3]), abab = rhymes(L[0], L[2]) && rhymes(L[1], L[3]);
    if (!aabb && !abab) warn.push(`rhyme? ${L.map(last).join(' / ')}`);
    const pairs = aabb ? [[0, 1], [2, 3]] : [[0, 2], [1, 3]];
    for (const [a, b] of pairs) if (Math.abs(syl[a] - syl[b]) > 1) warn.push(`syllables ${syl.join('-')}`);
  }
  const key = `${p.target}|${p.season}`;
  table[key] = (table[key] ?? 0) + 1;
  if (msgs.length || warn.length) console.log(`${p.id} «${p.title}» [${p.season}, ${p.hero}]${r.strict ? ' strict' : ''}\n${[...msgs.map((m) => '  ✗ ' + m), ...warn.map((m) => '  ? ' + m)].join('\n')}`);
  errors += msgs.length; warns += warn.length;
  p.strict = r.strict;
}
const targets = [...new Set(poems.map((p) => p.target))];
console.log('\ntarget  autumn winter spring summer any | total strict heroes');
for (const t of targets) {
  const ps = poems.filter((p) => p.target === t);
  const c = (s) => String(table[`${t}|${s}`] ?? 0).padStart(6);
  console.log(`${t.split('+').map((k) => LABEL[k]).join('–').padEnd(7)} ${c('autumn')}${c('winter')}${c('spring')}${c('summer')}${c('any')} | ${String(ps.length).padStart(5)} ${String(ps.filter((p) => p.strict).length).padStart(6)} ${new Set(ps.map((p) => p.hero)).size}`);
}
console.log(`\n${poems.length} poems, ${errors} errors, ${warns} warnings`);
process.exit(errors ? 1 : 0);
