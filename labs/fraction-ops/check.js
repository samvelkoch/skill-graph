// The before/after check of the Fraction Moves lab: ten school-format problems, no hints, results kept
// with dates in this browser. No points, no streaks, no rewards: the parent just sees "before -> after".
// mountCheck(el, { onGoto }) -> { setLang(l), show() }

import { store, esc, sfx, ruPlural, lang as initialLang } from '../lab.js';

const KEY = 'fraction-ops:checks';
const STATIONS = { simplify: '✂️', add: '➕', mul: '✖️', div: '➗', eq: '🟰' };
const ORDER = ['simplify', 'add', 'mul', 'div', 'eq'];
const OPS = { en: { mul: '×', div: '÷' }, ru: { mul: '·', div: ':' }, hu: { mul: '·', div: ':' } };
const LOCALE = { en: 'en-GB', ru: 'ru-RU', hu: 'hu-HU' };
const RIGHT = new Set(['ok', 'notLowest', 'improper']); // the value is right
const LAP_CAP = 600000; // a problem never counts more than 10 minutes per visit (the child may walk away)
// aria-labels of the three boxes (not visible)
const LBL = { en: ['Whole part', 'Numerator', 'Denominator'], ru: ['Целая часть', 'Числитель', 'Знаменатель'], hu: ['Egész rész', 'Számláló', 'Nevező'] };

const POOLS = {
  simpA:  [[18,24],[15,35],[28,42],[45,60],[24,56],[21,35]],                 // simplify a/b
  simpB:  [[48,72],[54,90],[42,98],[84,126],[60,144],[75,105]],              // simplify a/b
  add:    [[1,4,5,6],[2,3,3,4],[5,8,5,12],[5,6,3,10],[2,9,5,6],[3,4,5,6]],  // a/b + c/d
  sub:    [[2,1,3,0,3,4],[3,1,6,1,3,4],[2,1,5,0,1,2],[4,1,4,2,5,6],[3,1,3,1,5,8],[2,2,5,0,5,6]], // w a/b − v c/d (v=0: just c/d)
  mul:    [[4,9,3,8],[5,12,9,10],[6,7,14,15],[8,15,5,12],[3,10,5,9],[7,12,4,21]],   // a/b · c/d
  fracOf: [[120,3,8],[96,5,12],[150,2,5],[84,3,7],[72,5,9],[140,3,4]],       // book of N pages, p/q read
  div:    [[5,6,10,9],[3,8,9,16],[7,10,14,15],[4,9,2,3],[5,8,15,16],[9,14,6,7]],    // a/b : c/d
  ribbon: [[6,3,4],[4,2,5],[5,5,8],[9,3,4],[6,2,7],[8,4,5]],                  // L m ribbon, pieces p/q m
  numFrom:[[3,5,24],[2,7,18],[5,8,35],[3,4,27],[4,9,32],[5,6,45]],           // p/q of a book is M pages
  eqn:    [[3,4,9,16],[2,3,4,9],[5,6,10,21],[4,5,12,25],[3,8,9,40],[7,9,14,45]],    // p/q · x = r/s
};

const TX = {
en: {
  name: 'Fraction Moves', st: { simplify: 'Simplifying', add: 'Adding and subtracting', mul: 'Multiplying', div: 'Dividing', eq: 'Number from its fraction' },
  title: 'Check yourself',
  intro: 'Ten problems like the ones at school: two for each station. No hints and no time limit. Work on paper, then type the answer here.',
  parent: 'For the parent: do the first check before practising, then the next one after a few days with the stations. The problems change, the difficulty stays the same. Results are kept only in this browser.',
  start: (n) => n === 1 ? 'Start the first check' : `Start check No. ${n}`,
  of: (i) => `Problem ${i} of 10`,
  simplify: 'Simplify the fraction', calc: 'Work out', solve: 'Solve the equation',
  fracOf: (N, p, q) => `A book has ${N} pages. ${p}/${q} of the book has been read. How many pages is that?`,
  ribbon: (L, p, q) => `How many pieces of ${p}/${q} m can be cut from a ${L} m ribbon?`,
  numFrom: (p, q, M) => `${p}/${q} of a book is ${M} pages. How many pages are in the whole book?`,
  hint: 'Whole number: type it in the first box. Mixed number: whole part, then the fraction.',
  answer: 'Answer', skip: 'I don’t know',
  needDen: 'Type the denominator', needNum: 'Type the numerator', zeroDen: 'The denominator can’t be 0',
  result: (n, k) => `Check No. ${n}: ${k} of 10 correct`,
  notFinal: (u) => `${u} of them not in final form (not simplified, or the whole part not taken out).`,
  status: { ok: 'correct', notLowest: 'correct, but simplify it', improper: 'correct, but take out the whole part', wrong: 'not right', skip: 'skipped' },
  cols: ['Problem', 'Your answer', 'Answer', ''],
  goto: 'Open the station',
  next: 'Next time, practise on the stations for a few days first: then the change will show.',
  history: 'Before → after', hcols: ['No.', 'Date', 'Correct'], min: (m) => `${m} min`,
  compare: (a, b) => `First check ${a.date}: ${a.k} of 10 → latest ${b.date}: ${b.k} of 10`,
  copy: 'Copy results', copied: 'Copied', back: 'Back to the start',
},
ru: {
  name: 'Действия с дробями', st: { simplify: 'Сокращение', add: 'Сложение и вычитание', mul: 'Умножение', div: 'Деление', eq: 'Число по его дроби' },
  title: 'Проверь себя',
  intro: 'Десять задач, как в школе: по две на каждую станцию. Без подсказок и без ограничения времени. Решай на черновике, а ответ впиши сюда.',
  parent: 'Для родителя: первую проверку пройдите до занятий, следующую — через несколько дней работы со станциями. Задачи меняются, а сложность остаётся той же. Результаты хранятся только в этом браузере.',
  start: (n) => n === 1 ? 'Начать первую проверку' : `Начать проверку № ${n}`,
  of: (i) => `Задача ${i} из 10`,
  simplify: 'Сократи дробь', calc: 'Вычисли', solve: 'Реши уравнение',
  fracOf: (N, p, q) => `В книге ${N} ${ruPlural(N, 'страница', 'страницы', 'страниц')}. Прочитали ${p}/${q} книги. Сколько страниц прочитали?`,
  ribbon: (L, p, q) => `Сколько кусков по ${p}/${q} м можно отрезать от ленты длиной ${L} м?`,
  numFrom: (p, q, M) => `${p}/${q} книги — это ${M} ${ruPlural(M, 'страница', 'страницы', 'страниц')}. Сколько страниц во всей книге?`,
  hint: 'Целое число — в первое окошко. Смешанное число — целая часть, потом дробь.',
  answer: 'Ответить', skip: 'Не знаю',
  needDen: 'Впиши знаменатель', needNum: 'Впиши числитель', zeroDen: 'Знаменатель не может быть 0',
  result: (n, k) => `Проверка № ${n}: верно ${k} из 10`,
  notFinal: (u) => `Из них ${u} — не в окончательном виде (не сокращено или не выделена целая часть).`,
  status: { ok: 'верно', notLowest: 'верно, но не сокращено', improper: 'верно, но не выделена целая часть', wrong: 'неверно', skip: 'пропущено' },
  cols: ['Задача', 'Твой ответ', 'Ответ', ''],
  goto: 'Открыть станцию',
  next: 'Следующую проверку лучше пройти через несколько дней занятий на станциях — так будет видно, что изменилось.',
  history: 'Было → стало', hcols: ['№', 'Дата', 'Верно'], min: (m) => `${m} мин`,
  compare: (a, b) => `Первая проверка ${a.date}: ${a.k} из 10 → последняя ${b.date}: ${b.k} из 10`,
  copy: 'Скопировать результаты', copied: 'Скопировано', back: 'К началу',
},
hu: {
  name: 'Törtműveletek', st: { simplify: 'Egyszerűsítés', add: 'Összeadás és kivonás', mul: 'Szorzás', div: 'Osztás', eq: 'Szám a törtrészéből' },
  title: 'Felmérő',
  intro: 'Tíz feladat, mint az iskolában: mindegyik állomásról kettő. Nincs súgás és nincs időkorlát. Papíron számolj, aztán írd be ide az eredményt.',
  parent: 'A szülőnek: az első felmérőt gyakorlás előtt végezzétek el, a következőt néhány nap állomásos gyakorlás után. A feladatok változnak, a nehézségük ugyanaz marad. Az eredmények csak ebben a böngészőben maradnak meg.',
  start: (n) => n === 1 ? 'Az első felmérő indítása' : `${n}. felmérő indítása`,
  of: (i) => `${i}. feladat / 10`,
  simplify: 'Egyszerűsítsd a törtet', calc: 'Számítsd ki', solve: 'Oldd meg az egyenletet',
  fracOf: (N, p, q) => `Egy könyv ${N} oldalas. Elolvasták a könyv ${p}/${q} részét. Hány oldalt olvastak el?`,
  ribbon: (L, p, q) => `Hány ${p}/${q} m-es darabot lehet levágni egy ${L} m-es szalagból?`,
  numFrom: (p, q, M) => `A könyv ${p}/${q} része ${M} oldal. Hány oldalas az egész könyv?`,
  hint: 'Egész szám: az első mezőbe. Vegyes szám: az egész rész, aztán a tört.',
  answer: 'Válasz', skip: 'Nem tudom',
  needDen: 'Írd be a nevezőt', needNum: 'Írd be a számlálót', zeroDen: 'A nevező nem lehet 0',
  result: (n, k) => `${n}. felmérő: ${k} / 10 helyes`,
  notFinal: (u) => `Ebből ${u} nincs végső alakban (nincs egyszerűsítve, vagy nincsenek kiemelve az egészek).`,
  status: { ok: 'helyes', notLowest: 'helyes, de egyszerűsíthető', improper: 'helyes, de az egészeket ki kell emelni', wrong: 'nem jó', skip: 'kihagyva' },
  cols: ['Feladat', 'A te válaszod', 'Megoldás', ''],
  goto: 'Állomás megnyitása',
  next: 'A következő felmérő előtt gyakorolj néhány napig az állomásokon: így látszik majd a változás.',
  history: 'Előtte → utána', hcols: ['Sz.', 'Dátum', 'Helyes'], min: (m) => `${m} perc`,
  compare: (a, b) => `Első felmérő (${a.date}): ${a.k}/10 → legutóbbi (${b.date}): ${b.k}/10`,
  copy: 'Eredmények másolása', copied: 'Kimásolva', back: 'Vissza az elejére',
},
};

// --- exact integer fractions ---------------------------------------------------------------------------------
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
const fr = (n, d = 1) => { const g = gcd(n, d) || 1; return { n: n / g, d: d / g }; };
const fadd = (x, y) => fr(x.n * y.d + y.n * x.d, x.d * y.d);
const fsub = (x, y) => fr(x.n * y.d - y.n * x.d, x.d * y.d);
const fmul = (x, y) => fr(x.n * y.n, x.d * y.d);
const fdiv = (x, y) => fr(x.n * y.d, x.d * y.n);
const mx = (w, n, d) => fr(w * d + n, d); // w n/d
const toMixed = (f) => ({ w: Math.floor(f.n / f.d), n: f.n % f.d, d: f.d });

// slot (1..10) + parameter set -> { slot, st, type, a, exp }
function build(slot, set) {
  const P = POOLS;
  switch (slot) {
    case 1: { const a = P.simpA[set]; return { slot, st: 'simplify', type: 'simp', a, exp: fr(a[0], a[1]) }; }
    case 2: { const a = P.simpB[set]; return { slot, st: 'simplify', type: 'simp', a, exp: fr(a[0], a[1]) }; }
    case 3: { const a = P.add[set]; return { slot, st: 'add', type: 'add', a, exp: fadd(fr(a[0], a[1]), fr(a[2], a[3])) }; }
    case 4: { const a = P.sub[set]; return { slot, st: 'add', type: 'sub', a, exp: fsub(mx(a[0], a[1], a[2]), mx(a[3], a[4], a[5])) }; }
    case 5: { const a = P.mul[set]; return { slot, st: 'mul', type: 'mul', a, exp: fmul(fr(a[0], a[1]), fr(a[2], a[3])) }; }
    case 6: { const a = P.fracOf[set]; return { slot, st: 'mul', type: 'fracOf', a, exp: fr(a[0] * a[1], a[2]) }; }
    case 7: { const a = P.div[set]; return { slot, st: 'div', type: 'div', a, exp: fdiv(fr(a[0], a[1]), fr(a[2], a[3])) }; }
    case 8: { const a = P.ribbon[set]; return { slot, st: 'div', type: 'ribbon', a, exp: fr(a[0] * a[2], a[1]) }; }
    case 9: { const a = P.numFrom[set]; return { slot, st: 'eq', type: 'numFrom', a, exp: fr(a[2] * a[1], a[0]) }; }
    default: { const a = P.eqn[set]; return { slot: 10, st: 'eq', type: 'eqn', a, exp: fr(a[2] * a[1], a[3] * a[0]) }; }
  }
}

// given {w,n,d} (numbers, 0 when empty) vs expected fraction -> status
function classify(g, exp) {
  const vn = g.d > 0 ? g.w * g.d + g.n : g.w, vd = g.d > 0 ? g.d : 1;
  if (vn * exp.d !== exp.n * vd) return 'wrong';
  if (g.n > 0 && g.d > 0 && gcd(g.n, g.d) > 1) return 'notLowest';
  if (g.n > 0 && g.d > 0 && g.n >= g.d) return 'improper';
  return 'ok';
}

// --- html bits -----------------------------------------------------------------------------------------------
const F = (n, d) => `<span class="ck-frac"><span>${n}</span><span>${d}</span></span>`;
const W = (w) => `<span class="ck-w">${w}</span>`;
const MX = (w, n, d) => (w > 0 ? W(w) : '') + F(n, d);
const OP = (s) => `<span class="ck-op">${s}</span>`;
const stack = (s) => esc(s).replace(/(\d+)\/(\d+)/g, (_, a, b) => F(a, b)); // plain "a/b" in a sentence -> stacked
const ansHtml = ({ w, n, d }) => {
  const showFrac = n > 0 && d > 0;
  return (w > 0 || !showFrac ? W(w) : '') + (showFrac ? F(n, d) : '');
};
const expHtml = (f) => ansHtml(toMixed(f));

// the expression of a problem (compact form for the word problems: used in the table)
function exprHtml(p, S) {
  const a = p.a;
  switch (p.type) {
    case 'simp': return F(a[0], a[1]);
    case 'add': return F(a[0], a[1]) + OP('+') + F(a[2], a[3]);
    case 'sub': return MX(a[0], a[1], a[2]) + OP('−') + MX(a[3], a[4], a[5]);
    case 'mul': return F(a[0], a[1]) + OP(S.mul) + F(a[2], a[3]);
    case 'div': return F(a[0], a[1]) + OP(S.div) + F(a[2], a[3]);
    case 'eqn': return F(a[0], a[1]) + OP(S.mul) + '<span class="ck-x">x</span>' + OP('=') + F(a[2], a[3]);
    case 'fracOf': return F(a[1], a[2]) + OP(S.mul) + W(a[0]);
    case 'ribbon': return W(a[0]) + OP(S.div) + F(a[1], a[2]);
    default: return F(a[0], a[1]) + OP(S.mul) + '<span class="ck-x">x</span>' + OP('=') + W(a[2]); // numFrom
  }
}
const WORD = { fracOf: 1, ribbon: 1, numFrom: 1 };
const label = (p) => (p.type === 'simp' ? 'simplify' : p.type === 'eqn' ? 'solve' : 'calc');
const wordText = (T, p) => T[p.type](...p.a);

const kOf = (c) => c.items.filter((it) => RIGHT.has(it.st)).length;
const scores = (c) => ORDER.map((_, i) => c.items.filter((it) => it.slot === 2 * i + 1 || it.slot === 2 * i + 2).filter((it) => RIGHT.has(it.st)).length);
const minOf = (c) => Math.max(1, Math.round((c.sec || 0) / 60));
const loadChecks = () => { const c = store.get(KEY, []); return Array.isArray(c) ? c.filter((x) => x && Array.isArray(x.items)) : []; };

const CSS = `
.ck { padding: 22px 20px 24px; color: var(--ink); }
.ck-col { max-width: 780px; margin: 0 auto; }
.ck-kick { font-size: 10.5px; letter-spacing: .16em; text-transform: uppercase; color: var(--mut); font-weight: 800; }
.ck h2 { font: 500 30px/1.1 var(--serif); color: #fff; margin: 6px 0 12px; text-wrap: balance; }
.ck h3 { font: 500 24px/1.15 var(--serif); color: #fff; margin: 22px 0 10px; text-wrap: balance; }
.ck p { color: var(--body); font-size: 13.5px; line-height: 1.6; margin: 0 0 10px; }
.ck p.ck-parent { color: var(--mut); border-left: 3px solid var(--stroke2); padding-left: 12px; }
.ck p.ck-warn { color: var(--wip); font-weight: 700; }
.ck-top { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 4px 12px; }
.ck-stl { font-weight: 800; font-size: 13px; color: var(--soft); }
.ck-dots { display: flex; gap: 7px; margin: 10px 0 4px; }
.ck-dots i { width: 9px; height: 9px; border-radius: 50%; background: var(--faint); opacity: .5; }
.ck-dots i.done { background: var(--soft); opacity: 1; }
.ck-dots i.cur { background: var(--red); opacity: 1; }
.ck p.ck-q { font-size: 16px; line-height: 1.9; font-weight: 700; color: var(--ink); margin: 14px 0 6px; }
.ck-q .ck-frac { font-size: 15px; margin: 0 3px; }
.ck-expr { font-size: 28px; font-weight: 900; color: #fff; margin: 10px 0 12px; }
.ck-ex { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 4px 9px; }
.ck-frac { display: inline-flex; flex-direction: column; align-items: center; line-height: 1; vertical-align: middle; font-weight: 900; }
.ck-frac span:first-child { border-bottom: 3px solid currentColor; padding: 0 4px 3px; }
.ck-frac span:last-child { padding-top: 3px; }
.ck-w { font-weight: 900; }
.ck-op { color: var(--mut); font-weight: 800; padding: 0 2px; }
.ck-x { font-style: italic; font-weight: 800; }
.ck-ans { display: flex; align-items: center; gap: 10px; margin: 8px 0 6px; flex-wrap: wrap; }
.ck-pre { font-size: 26px; font-weight: 900; color: #fff; }
.ck-i { width: 72px; height: 48px; padding: 0; text-align: center; font: 900 24px/1 var(--sans); color: #fff; background: rgba(20, 24, 38, .85);
  border: 1px solid var(--stroke2); border-radius: 12px; -webkit-appearance: none; appearance: none; }
.ck-i.w { width: 68px; height: 62px; }
.ck-stack { display: flex; flex-direction: column; align-items: center; gap: 5px; }
.ck-line { display: block; width: 100%; height: 3px; border-radius: 2px; background: #fff; }
.ck-err { min-height: 20px; font-size: 13px; font-weight: 700; color: var(--wip); margin: 2px 0 0; }
.ck-hint { font-size: 12px; color: var(--mut); margin: 4px 0 0; }
.ck-btns { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 14px; }
.ck .btn { min-height: 46px; justify-content: center; }
.ck .btn:disabled { opacity: .35; cursor: default; }
.ck .btn.ck-go { min-height: 38px; padding: 7px 16px; font-size: 12.5px; }
.ck-rows { display: grid; gap: 8px; margin: 8px 0 4px; }
.ck-row { display: flex; align-items: center; flex-wrap: wrap; gap: 6px 12px; padding: 8px 12px; border: 1px solid var(--stroke); border-radius: 14px; }
.ck-row > span:first-child { flex: 1 1 150px; font-weight: 800; color: var(--soft); }
.ck-row b { font-size: 16px; color: #fff; }
.ck-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; max-width: 100%; margin: 6px 0 10px; }
.ck-tbl { border-collapse: collapse; width: 100%; font-size: 13px; }
.ck-tbl.t1 { min-width: 430px; }
.ck-tbl.t2 { min-width: 540px; }
.ck-tbl th { text-align: left; font-size: 10.5px; letter-spacing: .1em; text-transform: uppercase; color: var(--faint); font-weight: 700; padding: 6px 8px; white-space: nowrap; }
.ck-tbl td { padding: 8px; border-top: 1px solid var(--stroke); color: var(--soft); vertical-align: middle; white-space: nowrap; }
.ck-tbl td.ck-st { white-space: normal; min-width: 120px; font-size: 12px; font-weight: 700; }
.ck-tbl .ck-frac span:first-child { border-bottom-width: 2px; }
.ck-tbl .ck-ex { gap: 3px 6px; font-weight: 800; }
.ck-s-ok { color: var(--ok); } .ck-s-notLowest, .ck-s-improper { color: var(--wip); } .ck-s-wrong, .ck-s-skip { color: var(--red); }
.ck-ta { width: 100%; min-height: 96px; margin-top: 8px; padding: 10px; border-radius: 12px; border: 1px solid var(--stroke2); background: rgba(20, 24, 38, .85); color: var(--ink); font: 12px/1.5 ui-monospace, monospace; }
@media (max-width: 760px) {
  .ck { padding: 16px 14px 20px; }
  .ck h2 { font-size: 26px; }
  .ck-expr { font-size: 24px; }
  .ck-tbl { font-size: 12px; }
}
@media (max-width: 560px) {
  /* results: each problem is a card (line 1 problem, line 2 your answer / answer, line 3 status) instead of a 4-column table */
  .ck-tbl.t1 { min-width: 0; }
  .ck-tbl.t1, .ck-tbl.t1 tbody { display: block; }
  .ck-tbl.t1 thead { display: none; }
  .ck-tbl.t1 tr { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 6px 12px; padding: 10px 12px; margin-bottom: 8px; border: 1px solid var(--stroke); border-radius: 14px; }
  .ck-tbl.t1 td { display: block; padding: 0; border-top: 0; min-width: 0; }
  .ck-tbl.t1 td:first-child, .ck-tbl.t1 td.ck-st { grid-column: 1 / -1; }
  .ck-tbl.t1 td:first-child { font-size: 15px; font-weight: 800; color: #fff; }
  .ck-tbl.t1 td[data-l]::before { content: attr(data-l); display: block; margin-bottom: 3px; font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: var(--faint); font-weight: 700; }
  .ck-tbl.t1 td:nth-child(3)::before { content: '→ ' attr(data-l); }
  .ck-tbl.t1 td.ck-st { font-size: 13px; min-width: 0; }
  /* history: as compact as it gets, still in its own scroll wrapper if it must */
  .ck-tbl.t2 { min-width: 0; font-size: 11px; }
  .ck-tbl.t2 th { padding: 5px 3px; font-size: 9.5px; letter-spacing: 0; }
  .ck-tbl.t2 td { padding: 6px 3px; }
}
`;

export function mountCheck(el, { onGoto }) {
  if (!document.getElementById('ck-style')) {
    const st = document.createElement('style'); st.id = 'ck-style'; st.textContent = CSS; document.head.appendChild(st);
  }
  const root = document.createElement('div');
  root.className = 'ck';
  el.appendChild(root);

  let L = initialLang;
  let screen = 'start';   // start | problem | result
  let run = null;         // the unfinished check: { n, set, i, items, acc, t0, draft }
  let last = null;        // the check just finished (result screen)

  const lap = () => { // time of the current problem so far
    if (!run) return;
    const now = Date.now();
    run.acc += Math.min(now - run.t0, LAP_CAP); run.t0 = now;
  };
  const dateOf = (c) => { const d = new Date(c.date); return isNaN(d) ? '' : d.toLocaleDateString(LOCALE[L]); };
  const intoView = () => { const r = el.getBoundingClientRect(); if (r.top < 0) window.scrollTo({ top: window.scrollY + r.top - 70 }); };

  // --- history (start and result screens) ---
  function historyHtml(T, checks) {
    if (!checks.length) return '';
    const rows = checks.map((c) => {
      const sc = scores(c);
      return `<tr><td>${esc(c.n)}</td><td>${esc(dateOf(c))}</td><td><b>${kOf(c)}/10</b></td>${sc.map((x) => `<td>${x}/2</td>`).join('')}<td>${esc(T.min(minOf(c)))}</td></tr>`;
    }).join('');
    const cmp = checks.length >= 2
      ? `<p><b>${esc(T.compare({ date: dateOf(checks[0]), k: kOf(checks[0]) }, { date: dateOf(checks.at(-1)), k: kOf(checks.at(-1)) }))}</b></p>` : '';
    return `<h3>${esc(T.history)}</h3>${cmp}
      <div class="ck-scroll"><table class="ck-tbl t2"><thead><tr>${T.hcols.map((h) => `<th>${esc(h)}</th>`).join('')}${ORDER.map((s) => `<th>${STATIONS[s]}</th>`).join('')}<th>⏱</th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="ck-btns"><button class="btn ghost" data-act="copy">${esc(T.copy)}</button></div><div id="ck-ta"></div>`;
  }
  function summary(T, checks) {
    return [T.name, ...checks.map((c) => `#${c.n} ${dateOf(c)} — ${kOf(c)}/10 (${scores(c).map((x, i) => `${STATIONS[ORDER[i]]} ${x}/2`).join(', ')}), ${T.min(minOf(c))}`)].join('\n');
  }

  // --- screens ---
  function startHtml(T) {
    const checks = loadChecks();
    return `<div class="ck-kick">${esc(T.name)}</div><h2>${esc(T.title)}</h2>
      <p>${esc(T.intro)}</p><p class="ck-parent">${esc(T.parent)}</p>
      <div class="ck-btns"><button class="btn" data-act="start">${esc(T.start(checks.length + 1))}</button></div>${historyHtml(T, checks)}`;
  }

  function problemHtml(T) {
    const p = build(run.i + 1, run.set), S = OPS[L], lb = LBL[L];
    const prompt = WORD[p.type]
      ? `<p class="ck-q">${stack(wordText(T, p))}</p>`
      : `<p class="ck-q">${esc(T[label(p)])}</p><div class="ck-expr"><span class="ck-ex">${exprHtml(p, S)}</span></div>`;
    const inp = (f, cls, i) => `<input class="ck-i ${cls}" data-f="${f}" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" aria-label="${esc(lb[i])}" value="${esc(run.draft[f])}">`;
    const pre = p.type === 'eqn' ? '<span class="ck-pre">x =</span>' : WORD[p.type] ? '' : '<span class="ck-pre">=</span>';
    const empty = !run.draft.w && !run.draft.n && !run.draft.d;
    return `<div class="ck-top"><span class="ck-kick">${esc(T.of(run.i + 1))}</span><span class="ck-stl">${STATIONS[p.st]} ${esc(T.st[p.st])}</span></div>
      <div class="ck-dots">${Array.from({ length: 10 }, (_, j) => `<i class="${j < run.i ? 'done' : j === run.i ? 'cur' : ''}"></i>`).join('')}</div>
      ${prompt}
      <div class="ck-ans">${pre}${inp('w', 'w', 0)}<span class="ck-stack">${inp('n', '', 1)}<i class="ck-line"></i>${inp('d', '', 2)}</span></div>
      <div class="ck-err" id="ck-err" role="alert"></div>
      <p class="ck-hint">${esc(T.hint)}</p>
      <div class="ck-btns"><button class="btn" data-act="answer" id="ck-ok"${empty ? ' disabled' : ''}>${esc(T.answer)}</button><button class="btn ghost" data-act="skip">${esc(T.skip)}</button></div>`;
  }

  function resultHtml(T) {
    const c = last, S = OPS[L], k = kOf(c), u = c.items.filter((it) => it.st === 'notLowest' || it.st === 'improper').length, sc = scores(c);
    const rows = ORDER.map((s, i) => `<div class="ck-row"><span>${STATIONS[s]} ${esc(T.st[s])}</span><b>${sc[i]}/2</b>${sc[i] < 2 ? `<button class="btn ghost ck-go" data-act="goto" data-st="${s}">${esc(T.goto)}</button>` : ''}</div>`).join('');
    const trs = c.items.map((it) => {
      const p = build(it.slot, it.set);
      return `<tr><td>${it.slot}.&nbsp;<span class="ck-ex">${exprHtml(p, S)}</span></td><td data-l="${esc(T.cols[1])}">${it.given ? `<span class="ck-ex">${ansHtml(it.given)}</span>` : '—'}</td><td data-l="${esc(T.cols[2])}"><span class="ck-ex">${expHtml(p.exp)}</span></td><td class="ck-st ck-s-${it.st}">${esc(T.status[it.st] ?? '')}</td></tr>`;
    }).join('');
    return `<div class="ck-kick">${esc(T.name)}</div><h2>${esc(T.result(c.n, k))}</h2>
      ${u > 0 ? `<p class="ck-warn">${esc(T.notFinal(u))}</p>` : ''}
      <div class="ck-rows">${rows}</div>
      <div class="ck-scroll"><table class="ck-tbl t1"><thead><tr>${T.cols.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${trs}</tbody></table></div>
      <p>${esc(T.next)}</p>${historyHtml(T, loadChecks())}
      <div class="ck-btns"><button class="btn" data-act="back">${esc(T.back)}</button></div>`;
  }

  function render(focus = false) {
    const T = TX[L];
    if (screen === 'problem' && !run) screen = 'start';
    if (screen === 'result' && !last) screen = 'start';
    root.innerHTML = `<div class="ck-col">${screen === 'problem' ? problemHtml(T) : screen === 'result' ? resultHtml(T) : startHtml(T)}</div>`;
    if (focus && screen === 'problem') root.querySelector('.ck-i')?.focus({ preventScroll: true });
  }
  const go = (s, focus) => { screen = s; render(focus); intoView(); };

  // --- actions ---
  function record(given) { // given: {w,n,d} or null (skipped)
    lap();
    const p = build(run.i + 1, run.set);
    const st = given ? classify(given, p.exp) : 'skip';
    run.items.push({ slot: run.i + 1, set: run.set, given, st, sec: Math.round(run.acc / 1000) });
    run.acc = 0; run.draft = { w: '', n: '', d: '' };
    run.i++;
    sfx.click();
    if (run.i < 10) return go('problem', true);
    const checks = loadChecks();
    last = { n: run.n, date: new Date().toISOString(), sec: run.items.reduce((s, it) => s + it.sec, 0), items: run.items };
    store.set(KEY, [...checks, last]);
    run = null;
    go('result');
  }
  function answer() {
    const T = TX[L], { w, n, d } = run.draft;
    if (!w && !n && !d) return;
    const err = d !== '' && +d === 0 ? T.zeroDen : n !== '' && d === '' ? T.needDen : d !== '' && n === '' ? T.needNum : '';
    if (err) { root.querySelector('#ck-err').textContent = err; sfx.bad(); return; }
    record({ w: +w || 0, n: +n || 0, d: +d || 0 });
  }
  async function copy(btn) {
    const T = TX[L], text = summary(T, loadChecks());
    const flash = () => { btn.textContent = T.copied; setTimeout(() => { if (btn.isConnected) btn.textContent = T.copy; }, 2000); };
    try { await navigator.clipboard.writeText(text); flash(); return; } catch { /* fall back below */ }
    const holder = root.querySelector('#ck-ta');
    if (!holder) return;
    holder.innerHTML = '<textarea class="ck-ta" readonly></textarea>';
    const ta = holder.firstChild; ta.value = text; ta.focus(); ta.select();
    try { if (document.execCommand('copy')) flash(); } catch { /* the text stays selected */ }
  }

  root.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-act]'); if (!b || b.disabled) return;
    const a = b.dataset.act;
    if (a === 'start') {
      const n = loadChecks().length + 1;
      run = { n, set: (n - 1) % 6, i: 0, items: [], acc: 0, t0: Date.now(), draft: { w: '', n: '', d: '' } };
      sfx.click(); go('problem', true);
    } else if (a === 'answer' && run) answer();
    else if (a === 'skip' && run) record(null);
    else if (a === 'back') { sfx.click(); go('start'); }
    else if (a === 'goto') { sfx.click(); onGoto(b.dataset.st); }
    else if (a === 'copy') copy(b);
  });
  root.addEventListener('input', (ev) => {
    const t = ev.target; if (!run || !t.matches?.('.ck-i')) return;
    const v = t.value.replace(/\D/g, '').slice(0, 4);
    if (v !== t.value) t.value = v;
    run.draft[t.dataset.f] = v;
    root.querySelector('#ck-err').textContent = '';
    root.querySelector('#ck-ok').disabled = !run.draft.w && !run.draft.n && !run.draft.d;
  });
  root.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' && run && ev.target.matches?.('.ck-i')) { ev.preventDefault(); answer(); }
  });

  render();
  return {
    setLang(l) { if (!TX[l]) return; L = l; lap(); render(); },
    show() { lap(); render(); },
  };
}
