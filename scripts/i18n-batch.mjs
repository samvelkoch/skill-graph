#!/usr/bin/env node
/**
 * i18n-batch.mjs — split the source strings into batches for (LLM) translators
 * and merge the results back into data/i18n/<lang>/strings.json.
 *
 * Batches live in data/i18n/<lang>/work/ (gitignored): NNN.src.json is the
 * English input, NNN.json the translator's output with exactly the same keys.
 * Labels (subjects/domains) form batch 000 so they can serve as a glossary.
 *
 *   node scripts/i18n-batch.mjs split <lang> [size=250]   only untranslated keys
 *   node scripts/i18n-batch.mjs check <lang> <NNN>
 *   node scripts/i18n-batch.mjs merge <lang>
 */

import { existsSync, readdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { I18N, load, placeholders, save } from './i18n-lib.mjs';

const [cmd, lang, arg] = process.argv.slice(2);
if (!['split', 'check', 'merge'].includes(cmd) || !lang) {
  console.error('usage: node scripts/i18n-batch.mjs split|check|merge <lang> [size|NNN]');
  process.exit(2);
}

const src = load(resolve(I18N, 'source.en.json'));
const work = resolve(I18N, lang, 'work');
const stringsPath = resolve(I18N, lang, 'strings.json');
const done = existsSync(stringsPath) ? load(stringsPath) : {};
const pad = (n) => String(n).padStart(3, '0');

function problems(id) {
  const inPath = resolve(work, `${id}.src.json`);
  const outPath = resolve(work, `${id}.json`);
  if (!existsSync(outPath)) return [`${id}.json missing`];
  let out;
  try {
    out = load(outPath);
  } catch (e) {
    return [`${id}.json is not valid JSON: ${e.message}`];
  }
  const input = load(inPath);
  const errs = [];
  for (const key of Object.keys(input)) {
    if (typeof out[key] !== 'string' || !out[key].trim()) errs.push(`missing/empty ${key}`);
    else if (placeholders(out[key]) !== placeholders(input[key])) errs.push(`placeholders changed in ${key}`);
  }
  for (const key of Object.keys(out)) if (!(key in input)) errs.push(`unknown key ${key}`);
  return errs;
}

if (cmd === 'split') {
  const size = Number(arg ?? 250);
  rmSync(work, { recursive: true, force: true });
  const todo = Object.keys(src).filter((k) => !(k in done));
  const labels = todo.filter((k) => k.startsWith('label:'));
  const rest = todo.filter((k) => !k.startsWith('label:'));
  const pick = (keys) => Object.fromEntries(keys.map((k) => [k, src[k]]));
  if (labels.length) save(resolve(work, '000.src.json'), pick(labels));
  let n = 0;
  for (let i = 0; i < rest.length; i += size) save(resolve(work, `${pad(++n)}.src.json`), pick(rest.slice(i, i + size)));
  console.log(`✓ ${lang}: ${todo.length} untranslated strings → ${n + (labels.length ? 1 : 0)} batches in ${work}`);
} else if (cmd === 'check') {
  const errs = problems(pad(Number(arg)));
  if (errs.length) {
    console.error(`✗ batch ${pad(Number(arg))}: ${errs.length} problem(s)`);
    for (const e of errs.slice(0, 20)) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log(`✓ batch ${pad(Number(arg))} OK`);
} else {
  const ids = existsSync(work)
    ? readdirSync(work).filter((f) => f.endsWith('.src.json')).map((f) => f.slice(0, 3)).sort()
    : [];
  const merged = { ...done };
  const bad = [];
  for (const id of ids) {
    if (problems(id).length) bad.push(id);
    else Object.assign(merged, load(resolve(work, `${id}.json`)));
  }
  // keep source order so diffs stay readable
  const ordered = Object.fromEntries(Object.keys(src).filter((k) => k in merged).map((k) => [k, merged[k]]));
  save(stringsPath, ordered);
  console.log(`✓ ${lang}: merged ${ids.length - bad.length}/${ids.length} batches, ${Object.keys(ordered).length}/${Object.keys(src).length} strings`);
  if (bad.length) console.error(`  not merged (run check): ${bad.join(', ')}`);
}
