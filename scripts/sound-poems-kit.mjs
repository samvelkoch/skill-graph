#!/usr/bin/env node
/**
 * sound-poems-kit.mjs — builds the speech therapist's kit for the sound-poems lab into labs/sound-poems/kit/,
 * which the site serves as a download page (index.html) and a GitHub release can carry:
 *  - sound-poems.html: the whole lab in one file (scripts and styles inlined), so it opens offline from a disk,
 *    without the site; the links to the map (brand, footer topics) point to the live site;
 *  - poems.html: every poem on one printable page, by sound in the lab's order, then the pairs;
 *  - cards.html: the picture cards of the drawing step (labs/sound-poems/cards.js) as a printable sheet to cut out,
 *    by category, for working at the table without a screen;
 *  - poems.pdf, cards.pdf: those two pages printed by headless Chrome (skipped with a warning if there is no Chrome);
 *  - sound-poems-kit.zip: the lab and the two PDFs in one file to send (needs `zip`);
 *  - index.html: the download page.
 *
 *   node scripts/sound-poems-kit.mjs
 *
 * The kit is committed, so rebuild it and commit the result whenever poems.js, cards.js or the lab change.
 *
 * Modules are inlined through an import map with data: URLs, so the lab's own code runs unchanged; lab.js loses its
 * imports of switcher.js and next.js (the lab menu and "Where next" read the site's JSON, which a file on a disk has not).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LAB = resolve(ROOT, 'labs/sound-poems');
const OUT = resolve(ROOT, 'labs/sound-poems/kit');
const SITE = 'https://samvelkoch.github.io/skill-graph/';
const read = (p) => readFileSync(p, 'utf8');
const dataUrl = (js) => 'data:text/javascript;base64,' + Buffer.from(js, 'utf8').toString('base64');

// --- the lab in one file ---
const MODULES = {
  // the map is two folders up from a lab; a file on a disk has no such folders, so those links go to the site
  'sg-lab': read(resolve(ROOT, 'labs/lab.js')).replace(/^import '\.\/(switcher|next)\.js';.*\n/gm, '').replaceAll('"../../', `"${SITE}`).replaceAll('`../../', `\`${SITE}`),
  'sg-phonetics': read(resolve(LAB, 'phonetics.js')),
  'sg-poems-parse': read(resolve(LAB, 'poems-parse.js')),
  'sg-poems': read(resolve(LAB, 'poems.js')),
  'sg-cards': read(resolve(LAB, 'cards.js')),
};
const SPEC = { '../lab.js': 'sg-lab', './phonetics.js': 'sg-phonetics', './poems-parse.js': 'sg-poems-parse', './poems.js': 'sg-poems', './cards.js': 'sg-cards' };
for (const [k, js] of Object.entries(MODULES)) if (/^\s*import\s|\.\.\//m.test(js)) throw new Error(`${k} still imports or links something relative`);

let html = read(resolve(LAB, 'index.html'));
const cut = (re, what) => { if (!re.test(html)) throw new Error(`index.html: ${what} not found`); html = html.replace(re, ''); };
cut(/<!-- Google tag \(gtag\.js\) -->\n<script async[^>]*><\/script>\n<script>[\s\S]*?<\/script>\n/, 'the Google tag');
html = html.replace('<link rel="stylesheet" href="../lab.css">', () => `<style>\n${read(resolve(ROOT, 'labs/lab.css'))}</style>`);
for (const [from, to] of Object.entries(SPEC)) {
  const before = html;
  html = html.replace(`from '${from}';`, `from '${to}';`);
  if (html === before) throw new Error(`index.html: import from ${from} not found`);
}
const importMap = JSON.stringify({ imports: Object.fromEntries(Object.entries(MODULES).map(([k, js]) => [k, dataUrl(js)])) });
html = html.replace('<meta charset="utf-8">', () => `<meta charset="utf-8">\n<script type="importmap">${importMap}</script>`);
if (/(src|href)="\.\.?\//.test(html)) throw new Error('index.html: a relative src/href is left');

// --- every poem on one page ---
const { ORDER, LABEL } = await import(pathToFileURL(resolve(LAB, 'phonetics.js')));
const { parsePoems } = await import(pathToFileURL(resolve(LAB, 'poems-parse.js')));
const { POEMS } = await import(pathToFileURL(resolve(LAB, 'poems.js')));
const poems = parsePoems(POEMS);
const SEASON = { autumn: 'осень', winter: 'зима', spring: 'весна', summer: 'лето', any: 'круглый год' };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const name = (t) => t.split('+').map((k) => LABEL[k]).join('–');
const targets = [...new Set(poems.map((p) => p.target))]
  .sort((a, b) => (a.includes('+') - b.includes('+')) || ORDER.indexOf(a.split('+')[0]) - ORDER.indexOf(b.split('+')[0]));
const section = (t) => {
  const ps = poems.filter((p) => p.target === t);
  return `<section><h2 id="${t}">${t.includes('+') ? 'Пара' : 'Звук'} ${name(t)} <small>${ps.length}</small></h2>
${ps.map((p) => `<article><h3>${esc(p.emoji ?? '')} ${esc(p.title)} <small>${SEASON[p.season]}</small></h3>
${[0, 4].filter((i) => p.lines.length > i).map((i) => `<p>${p.lines.slice(i, i + 4).map(esc).join('<br>\n')}</p>`).join('\n')}</article>`).join('\n')}
</section>`;
};
const list = `<!doctype html>
<html lang="ru">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Стихи на звук — все стихи</title>
<style>
  body { font: 16px/1.45 Georgia, 'Times New Roman', serif; color: #1a1a1a; background: #fff; max-width: 860px; margin: 0 auto; padding: 24px 16px; }
  h1 { font-size: 28px; margin: 0 0 4px; } .lead { color: #555; margin: 0 0 24px; }
  h2 { font: 700 22px/1.2 system-ui, sans-serif; border-bottom: 2px solid #1a1a1a; padding-bottom: 4px; margin: 32px 0 12px; break-after: avoid; }
  h2 small, h3 small { font: 400 13px system-ui, sans-serif; color: #777; margin-left: 6px; }
  section > div, section { } .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 8px 24px; }
  article { break-inside: avoid; margin: 0 0 12px; } h3 { font: 700 16px system-ui, sans-serif; margin: 0 0 4px; }
  p { margin: 0 0 6px; }
  nav { font: 600 15px system-ui, sans-serif; } nav a { color: inherit; }
  @media print { body { padding: 0; font-size: 12.5pt; } h2 { margin-top: 18px; } }
</style>
<h1>Стихи на звук</h1>
<p class="lead">${poems.length} стихов для автоматизации звуков, 4–7 лет. В каждом стихе нет звуков сложнее того, который учим
(порядок: ${ORDER.filter((k) => k !== 'shch').map((k) => LABEL[k]).join(', ')}). Онлайн: ${SITE}labs/sound-poems/</p>
<nav>${targets.map((t) => `<a href="#${t}">${name(t)}</a>`).join(' · ')}</nav>
${targets.map(section).join('\n').replace(/<\/h2>\n/g, '</h2>\n<div class="grid">\n').replace(/<\/section>/g, '</div></section>')}
</html>
`;

// --- the picture cards on a printable sheet ---
const { CATS, CARDS, glyph } = await import(pathToFileURL(resolve(LAB, 'cards.js')));
const cards = `<!doctype html>
<html lang="ru">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Стихи на звук — карточки</title>
<style>
  body { font: 15px/1.4 system-ui, sans-serif; color: #1a1a1a; background: #fff; max-width: 860px; margin: 0 auto; padding: 24px 16px; }
  h1 { font: 700 26px Georgia, serif; margin: 0 0 4px; } .lead { color: #555; margin: 0 0 16px; }
  h2 { font-size: 18px; margin: 20px 0 8px; break-after: avoid; }
  .grid { display: grid; grid-template-columns: repeat(5, 1fr); }
  .c { aspect-ratio: 1; border: 1px dashed #aaa; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; break-inside: avoid; }
  .c .e { font-size: 52px; line-height: 1; } .c svg { width: 64%; height: auto; } .c .n { font-size: 12px; color: #444; }
  @page { margin: 10mm; } @media print { body { padding: 0; } h2 { margin-top: 10px; } }
</style>
<h1>Карточки к стихам на звук</h1>
<p class="lead">Карточек: ${CARDS.length}. Распечатать, разрезать по пунктиру и выкладывать стих по словам. Маленькие слова (предлоги) — по схемам, принятым у логопедов: кубик — предмет, красный кружок — то, о чём говорим.</p>
${Object.entries(CATS).map(([k, c]) => `<h2>${c.e} ${esc(c.ru)}</h2>
<div class="grid">${CARDS.filter((x) => x.cat === k).map((x) => `<div class="c">${x.e ? `<span class="e">${x.e}</span>` : glyph(x.g)}<span class="n">${esc(x.ru)}</span></div>`).join('')}</div>`).join('\n')}
</html>
`;

mkdirSync(OUT, { recursive: true });
writeFileSync(resolve(OUT, 'sound-poems.html'), html);
writeFileSync(resolve(OUT, 'poems.html'), list);
writeFileSync(resolve(OUT, 'cards.html'), cards);
console.log(`${OUT}/sound-poems.html  ${(html.length / 1024).toFixed(0)} KB`);
console.log(`${OUT}/poems.html  ${poems.length} poems, ${targets.length} sounds and pairs`);
console.log(`${OUT}/cards.html  ${CARDS.length} cards`);

// --- PDFs and the zip ---
const CHROME = [process.env.CHROME, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium']
  .find((p) => p && existsSync(p));
const run = (cmd, args) => { try { execFileSync(cmd, args, { stdio: 'pipe' }); return true; } catch { return false; } };
for (const f of ['poems', 'cards']) {
  if (CHROME && run(CHROME, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${resolve(OUT, f + '.pdf')}`, pathToFileURL(resolve(OUT, f + '.html')).href]))
    console.log(`${OUT}/${f}.pdf`);
  else console.warn(`warning: ${f}.pdf not printed (no Chrome; set CHROME=/path/to/chrome)`);
}
const ZIP = 'sound-poems-kit.zip';
rmSync(resolve(OUT, ZIP), { force: true });
if (run('zip', ['-j', '-q', '-X', resolve(OUT, ZIP), ...['sound-poems.html', 'poems.pdf', 'cards.pdf'].map((f) => resolve(OUT, f)).filter(existsSync)])) console.log(`${OUT}/${ZIP}`);
else console.warn(`warning: ${ZIP} not made (no zip)`);

// --- the download page ---
const size = (f) => existsSync(resolve(OUT, f)) ? `${(statSync(resolve(OUT, f)).size / 1048576).toFixed(1).replace('.', ',')} МБ` : null;
const item = (f, title, text, also = '') => size(f) ? `<li><a href="${f}" download>${title}</a> <small>${f}, ${size(f)}</small><br>${text}${also}</li>` : '';
const page = `<!doctype html>
<html lang="ru">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Стихи на звук — комплект для логопеда</title>
<style>
  body { font: 16px/1.5 system-ui, sans-serif; color: #1a1a1a; background: #fff; max-width: 640px; margin: 0 auto; padding: 24px 16px; }
  h1 { font: 700 26px/1.2 Georgia, serif; margin: 0 0 8px; } .lead { color: #555; margin: 0 0 20px; }
  ul { list-style: none; padding: 0; margin: 0; } li { border: 1px solid #ddd; border-radius: 10px; padding: 12px 14px; margin: 0 0 10px; }
  li a { font-weight: 700; color: #0b57d0; } li small { color: #777; } li.all { border-color: #0b57d0; background: #f3f7ff; }
  .foot { color: #777; font-size: 14px; margin-top: 20px; } .foot a { color: inherit; }
</style>
<h1>Стихи на звук: комплект для логопеда</h1>
<p class="lead">Стихов: ${poems.length}, карточек: ${CARDS.length}. Всё работает без интернета и без сайта.</p>
<ul>
${item(ZIP, 'Скачать всё одним архивом', 'Тренажёр, все стихи и карточки — три файла ниже в одном архиве.').replace('<li>', '<li class="all">')}
${item('sound-poems.html', 'Тренажёр одним файлом', 'Сохранить на компьютер и открыть двойным щелчком — откроется в браузере, интернет не нужен.')}
${item('poems.pdf', 'Все стихи', 'По звукам, для печати.', ' <a href="poems.html">Открыть страницей</a>')}
${item('cards.pdf', 'Карточки', 'Распечатать, разрезать по пунктиру и выкладывать стих по словам.', ' <a href="cards.html">Открыть страницей</a>')}
</ul>
<p class="foot">Онлайн-версия: <a href="../">${SITE}labs/sound-poems/</a></p>
</html>
`;
writeFileSync(resolve(OUT, 'index.html'), page);
console.log(`${OUT}/index.html`);
