#!/usr/bin/env node
/**
 * check-scripts.mjs — runs `node --check` on all page JavaScript.
 *
 * Most code lives inline in HTML (the viewer, the lab overview, every lab), so a plain `node --check *.js`
 * would miss it. This pulls every inline <script> out of those pages into a temp dir and syntax-checks it,
 * then checks the standalone files (tour.js, sw.js and the .js files in labs/ and its lab folders). No dependencies:
 *
 *   node scripts/check-scripts.mjs
 */

import { readFileSync, readdirSync, writeFileSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tmp = mkdtempSync(join(tmpdir(), 'sg-check-'));
const rel = (p) => p.slice(ROOT.length + 1);
const dirs = (p) => readdirSync(resolve(ROOT, p), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
const files = (p, ext) => readdirSync(resolve(ROOT, p)).filter((f) => f.endsWith(ext)).map((f) => (p ? `${p}/` : '') + f);

const pages = ['index.html', 'labs/index.html', ...dirs('labs').map((d) => `labs/${d}/index.html`).filter((p) => existsSync(resolve(ROOT, p)))];
// Standalone files are parsed as ESM (package.json "type": "module"); they all pass that way, so one rule is enough.
const standalone = ['tour.js', 'sw.js', ...files('labs', '.js'), ...dirs('labs').flatMap((d) => files(`labs/${d}`, '.js'))].filter((p) => existsSync(resolve(ROOT, p)));

const fails = [];
const check = (file, label) => {
  try { execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' }); }
  catch (e) { fails.push({ label, err: String(e.stderr || e.message).trim() }); }
};

let inline = 0;
for (const page of pages) {
  const html = readFileSync(resolve(ROOT, page), 'utf8');
  let n = 0;
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attrs = m[1];
    if (/\bsrc\s*=/i.test(attrs)) continue;
    const type = attrs.match(/\btype\s*=\s*["']?([^"'\s>]+)/i)?.[1]?.toLowerCase();
    if (type && type !== 'module' && type !== 'text/javascript') continue; // JSON, ld+json, templates
    const f = join(tmp, `${page.replaceAll('/', '__')}.${n++}.${type === 'module' ? 'mjs' : 'cjs'}`); // classic scripts are .cjs
    writeFileSync(f, m[2]);
    inline++;
    check(f, `${page} (inline script #${n})`);
  }
}
for (const f of standalone) check(resolve(ROOT, f), f);
rmSync(tmp, { recursive: true, force: true });

if (fails.length) {
  console.error(`✗ ${fails.length} file(s) failed`);
  for (const f of fails) console.error(`\n${f.label}\n${f.err.replace(/\S*sg-check-\w+/g, '<tmp>')}`);
  process.exit(1);
}
console.log(`✓ node --check: ${inline} inline scripts in ${pages.length} pages, ${standalone.length} files`);
