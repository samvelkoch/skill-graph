#!/usr/bin/env node
/**
 * i18n-extract.mjs — dump every translatable string to data/i18n/source.en.json
 * as a flat `{ key: text }` map (key scheme in i18n-lib.mjs). Re-run after
 * pulling upstream changes; the diff of source.en.json shows what to retranslate.
 *
 *   node scripts/i18n-extract.mjs
 */

import { resolve } from 'node:path';
import { I18N, loadSource, save, walk } from './i18n-lib.mjs';

const out = {};
let words = 0;
walk(loadSource(), (key, text) => {
  if (key in out) throw new Error(`duplicate i18n key: ${key}`);
  out[key] = text;
  words += text.split(/\s+/).filter(Boolean).length;
});

save(resolve(I18N, 'source.en.json'), out);
console.log(`✓ ${Object.keys(out).length} strings, ${words} words → data/i18n/source.en.json`);
