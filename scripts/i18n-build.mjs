#!/usr/bin/env node
/**
 * i18n-build.mjs — merge data/i18n/<lang>/strings.json into localized copies
 * of topics.json, dependencies.json and clusters.json under data/i18n/<lang>/,
 * plus labels.json for subject/domain names. Ids, enums, ages and edges are
 * untouched; untranslated strings stay in English.
 *
 *   node scripts/i18n-build.mjs ru
 */

import { resolve } from 'node:path';
import { I18N, load, loadSource, save, walk } from './i18n-lib.mjs';

const lang = process.argv[2];
if (!lang || lang.startsWith('-')) {
  console.error('usage: node scripts/i18n-build.mjs <lang>');
  process.exit(2);
}

const tr = load(resolve(I18N, lang, 'strings.json'));
const data = loadSource();
const labels = { subjects: {}, domains: {} };
let applied = 0;
let fallback = 0;

walk(data, (key, text, set) => {
  const value = tr[key];
  if (key.startsWith('label:')) {
    const [, kind, name] = key.match(/^label:(subject|domain):(.*)$/);
    labels[kind === 'subject' ? 'subjects' : 'domains'][name] = value ?? text;
  } else if (value) set(value);
  value ? applied++ : fallback++;
});

const dir = resolve(I18N, lang);
const meta = { language: lang, source: 'en' };
save(resolve(dir, 'topics.json'), { ...meta, ...data.topics });
save(resolve(dir, 'dependencies.json'), { ...meta, ...data.deps });
save(resolve(dir, 'clusters.json'), { ...meta, ...data.clusters });
save(resolve(dir, 'labels.json'), { ...meta, ...labels });
console.log(`✓ ${lang}: ${applied} strings applied, ${fallback} left in English → data/i18n/${lang}/`);
