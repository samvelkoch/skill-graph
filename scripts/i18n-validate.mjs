#!/usr/bin/env node
/**
 * i18n-validate.mjs — check data/i18n/<lang>/strings.json against the source:
 * no unknown keys, no empty values, placeholders ({{name}}) preserved.
 * Missing keys are an error unless --partial is given.
 *
 *   node scripts/i18n-validate.mjs ru [--partial]
 */

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { I18N, load, placeholders } from './i18n-lib.mjs';

const lang = process.argv[2];
const partial = process.argv.includes('--partial');
if (!lang || lang.startsWith('-')) {
  console.error('usage: node scripts/i18n-validate.mjs <lang> [--partial]');
  process.exit(2);
}

const srcPath = resolve(I18N, 'source.en.json');
const trPath = resolve(I18N, lang, 'strings.json');
for (const p of [srcPath, trPath]) {
  if (!existsSync(p)) {
    console.error(`✗ missing ${p}${p === srcPath ? ' — run scripts/i18n-extract.mjs first' : ''}`);
    process.exit(1);
  }
}
const src = load(srcPath);
const tr = load(trPath);

const errors = [];
let missing = 0;
for (const [key, text] of Object.entries(tr)) {
  if (!(key in src)) errors.push(`unknown key ${key}`);
  else if (typeof text !== 'string' || !text.trim()) errors.push(`empty translation for ${key}`);
  else if (placeholders(text) !== placeholders(src[key])) errors.push(`placeholders changed in ${key}`);
}
for (const key of Object.keys(src)) if (!(key in tr)) missing++;
if (missing && !partial) errors.push(`${missing} key(s) not translated (use --partial to allow)`);

const done = Object.keys(src).length - missing;
const pct = ((100 * done) / Object.keys(src).length).toFixed(1);
if (errors.length) {
  console.error(`✗ ${lang}: ${errors.length} problem(s), ${done}/${Object.keys(src).length} translated (${pct}%)`);
  for (const e of errors.slice(0, 20)) console.error(`  - ${e}`);
  if (errors.length > 20) console.error(`  …and ${errors.length - 20} more`);
  process.exit(1);
}
console.log(`✓ ${lang}: ${done}/${Object.keys(src).length} translated (${pct}%), placeholders OK`);
