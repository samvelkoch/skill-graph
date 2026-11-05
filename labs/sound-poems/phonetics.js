// Russian consonant phonetics for speech-therapy poems: which of the "late" sounds a word really has when said aloud.
// Works on spelling, without stress: the consonants a speech therapist cares about do not depend on stress.
// Used by the lab (highlighting, the word and poem checker) and by scripts/sound-poems-check.mjs (checks every poem).

// The order sounds are automated in (from easy to hard). Щ is not in the speech therapist's list; we put it right after Ч.
export const ORDER = ['s1', 'z1', 's', 'z', 'sh', 'zh', 'c', 'ch', 'shch', 'l1', 'l', 'r', 'r1'];
export const RANK = Object.fromEntries(ORDER.map((k, i) => [k, i]));
export const LABEL = { s1: 'С’', z1: 'З’', s: 'С', z: 'З', sh: 'Ш', zh: 'Ж', c: 'Ц', ch: 'Ч', shch: 'Щ', l1: 'Л’', l: 'Л', r: 'Р', r1: 'Р’' };
export const GROUP = { s1: 'wh', z1: 'wh', s: 'wh', z: 'wh', c: 'wh', sh: 'hi', zh: 'hi', ch: 'hi', shch: 'hi', l1: 'L', l: 'L', r: 'R', r1: 'R' };
// strict mode (the presentation's rule): whistling and hushing sounds keep apart, and so do Л and Р
export const OPPOSITE = { wh: 'hi', hi: 'wh', L: 'R', R: 'L' };

const VOWELS = 'аеёиоуыэюя';
const SOFTENERS = 'еёиюяь';
const PAIRS = { б: 'п', в: 'ф', г: 'к', д: 'т', ж: 'ш', з: 'с' };
const UNPAIR = Object.fromEntries(Object.entries(PAIRS).map(([a, b]) => [b, a]));
const OBSTRUENT = new Set('бпвфгкдтжшзсхцчщ');
const VOICED_TRIGGER = new Set('бгджз'); // в does not voice what stands before it (свет, твой)

// Words said differently from how they are spelled (the ones that matter for these sounds).
// Each maps to a respelling that the rules below then read normally.
const RESPELL = [
  [/^(ч)(то|тоб|тобы|то-то|то-нибудь|то-либо)$/, 'ш$2'],
  [/^(ни|не|кое-)ч(то)$/, '$1ш$2'],
  [/^(конеч|скуч|нароч|яич|скворечн|пустяч|прачеч|горчич|подсвеч|сливоч)/, (m) => m.replace(/ч(?=н|$)/, 'ш')],
  [/^(лего|морзе|рэп|кафе|пюре|шоссе|отель|модель|тест|кашне|пенсне|сэр|мэр|рекс)/, (m) => m.replace(/е/g, 'э')],
];
// Silent letters and merged clusters, applied inside a word before the sound rules.
const CLUSTERS = [
  [/стн/g, 'сн'], [/здн/g, 'зн'], [/стл/g, 'сл'], [/вств/g, 'ств'], [/лнц/g, 'нц'], [/рдц/g, 'рц'], [/ндск/g, 'нск'], [/нтск/g, 'нск'],
  [/гк/g, 'хк'], [/гч/g, 'хч'], [/чш/g, 'тш'],
];

// Ambiguous spots: the norm allows either variant, so a careful poem avoids them. Matched against the (lowercased) word.
const AMBIG_WORDS = [/^дожд/, /^вожж/, /^дрожж/, /^жжё/, /^езж/, /^брызж/, /^визж/];

const clean = (w) => w.toLowerCase().replace(/[^а-яё-]/g, '').replace(/^-+|-+$/g, '');

// One word (or a preposition glued to its word) → letter units with the source index of each letter.
function units(word) {
  let w = clean(word);
  for (const [re, to] of RESPELL) if (re.test(w)) { w = w.replace(re, to); break; }
  for (const [re, to] of CLUSTERS) w = w.replace(re, to);
  return w;
}

// Turn a spelled chunk (a word, or "с шапкой" glued into one) into phones.
// Returns [{ k, i, amb? }] for the tracked sounds only: k = key from ORDER, i = index of the consonant among the chunk's letters
// (after respelling), amb = the other possible reading when the norm is not fixed.
function phones(w) {
  const L = [...w];
  const out = [];
  // pass 1: consonant letters with softness, merges and voicing, right to left
  const seq = []; // { c: base letter, soft, i }
  for (let i = 0; i < L.length; i++) {
    const ch = L[i];
    if (VOWELS.includes(ch) || ch === 'ь' || ch === 'ъ' || ch === '-' || ch === 'й') { if (ch === 'й') seq.push({ c: 'й', soft: true, i }); continue; }
    let j = i + 1; while (L[j] === '-') j++;
    const next = L[j];
    let soft = !!next && SOFTENERS.includes(next);
    if ('жшц'.includes(ch)) soft = false;
    if ('чщй'.includes(ch)) soft = true;
    if (next === 'ъ') soft = false;
    seq.push({ c: ch, soft, i, endOfWord: false });
  }
  // merges: с/з + ш → ш, с/з + ж → ж, с/з/ж + ч → щ, т/д (+ь) + с → ц, т/д + ц → ц
  for (let n = 0; n < seq.length - 1; n++) {
    const a = seq[n], b = seq[n + 1];
    if (b.i - a.i > 2 || (b.i - a.i === 2 && L[a.i + 1] !== 'ь')) continue; // only neighbours (a soft sign may stand between)
    if ('сз'.includes(a.c) && b.c === 'ш') { a.c = 'ш'; a.soft = false; a.merged = true; }
    else if ('сз'.includes(a.c) && b.c === 'ж') { a.c = 'ж'; a.soft = false; a.merged = true; }
    else if ('сзж'.includes(a.c) && (b.c === 'ч' || b.c === 'щ')) { a.c = 'щ'; a.soft = true; b.c = 'щ'; b.drop = true; }
    else if ('тд'.includes(a.c) && (b.c === 'с' || b.c === 'ц')) { a.c = 'ц'; a.soft = false; b.drop = true; }
  }
  const s = seq.filter((u) => !u.drop);
  // voicing: right to left; the last consonant of the chunk (before the end or a vowel-less end) goes voiceless
  for (let n = s.length - 1; n >= 0; n--) {
    const u = s[n];
    if (!OBSTRUENT.has(u.c)) continue;
    const after = L.slice(u.i + 1).join('').replace(/[ьъ-]/g, '');
    const nxt = s[n + 1];
    const adjacent = nxt && !/[аеёиоуыэюя]/.test(L.slice(u.i + 1, nxt.i).join(''));
    if (!after.length) { if (PAIRS[u.c]) u.c = PAIRS[u.c]; continue; } // final devoicing
    if (adjacent && OBSTRUENT.has(nxt.c)) {
      if (VOICED_TRIGGER.has(nxt.c)) { if (UNPAIR[u.c]) u.c = UNPAIR[u.c]; } // сделать → [з]
      else if (nxt.c !== 'в' && PAIRS[u.c]) u.c = PAIRS[u.c]; // ложка → [ш], сказка → [с]
    }
  }
  // positional softness of с/з before a soft т/д/н (кость, здесь, снег): fixed at the very end of a word (-сть), otherwise either
  for (let n = 0; n < s.length; n++) {
    const u = s[n], nxt = s[n + 1];
    if (!'сз'.includes(u.c) || u.soft || u.merged || !nxt) continue;
    if (nxt.i - u.i !== 1) continue;
    if ('тдн'.includes(nxt.c) && nxt.soft) {
      const rest = L.slice(nxt.i + 1).join('');
      if (rest === 'ь') u.soft = true; else u.amb = true;
    }
  }
  for (const u of s) {
    const k = { с: 's', з: 'z', ш: 'sh', ж: 'zh', ц: 'c', ч: 'ch', щ: 'shch', л: 'l', р: 'r' }[u.c];
    if (!k) continue;
    let key = k;
    if ((k === 's' || k === 'z' || k === 'l' || k === 'r') && u.soft) key = k + '1';
    const p = { k: key, i: u.i };
    if (u.amb) p.amb = key + '1'; // с → с or с’
    out.push(p);
  }
  return out;
}

// Prepositions are read on their own, as speech therapists say them to a child: no merging with the next word
// («с жуком» keeps its С, «без завода» ends in [с]). In quick speech they would merge («с шапкой» → [ш:]); set GLUE to
// true to analyse that way again.
const GLUE = false;
const PROCLITIC = new Set(GLUE ? ['с', 'из', 'без', 'в', 'к', 'от', 'под', 'над', 'об', 'перед', 'через', 'раз'] : []);

// Split a line into words, keeping punctuation out. Returns [{ w, start, end }] (indices in the line).
export function words(line) {
  const out = [];
  for (const m of line.matchAll(/[А-Яа-яЁё]+(?:-[А-Яа-яЁё]+)*/g)) out.push({ w: m[0], start: m.index, end: m.index + m[0].length });
  return out;
}

// Analyse one word on its own (the checker's "type a word" tool). → { sounds: [{k, amb, pos}], respelled, ambiguous }
export function analyseWord(word, nextWord = '') {
  const w = units(word);
  const lower = clean(word);
  let chunk = w, glue = 0;
  if (PROCLITIC.has(lower) && nextWord) { chunk = w + units(nextWord); glue = w.length; }
  const ps = phones(chunk).filter((p) => !glue || p.i < glue);
  const nCons = [...w].filter((c) => !VOWELS.includes(c) && c !== 'ь' && c !== 'ъ' && c !== '-').length;
  const consIdx = [...w].map((c, i) => (!VOWELS.includes(c) && c !== 'ь' && c !== 'ъ' && c !== '-' ? i : -1)).filter((i) => i >= 0);
  const sounds = ps.map((p) => {
    const first = p.i === firstLetter(w), last = p.i === lastPhoneLetter(w);
    const ci = consIdx.indexOf(p.i);
    const cluster = (ci > 0 && consIdx[ci - 1] === prevLetter(w, p.i)) || (ci >= 0 && ci < consIdx.length - 1 && consIdx[ci + 1] === nextLetter(w, p.i));
    return { k: p.k, amb: p.amb, pos: first ? 'start' : last ? 'end' : 'mid', cluster: !!cluster && nCons > 1 };
  });
  const ambiguous = AMBIG_WORDS.some((re) => re.test(lower));
  return { sounds, respelled: w !== lower ? w : null, ambiguous };
}
const firstLetter = (w) => [...w].findIndex((c) => c !== '-');
const lastPhoneLetter = (w) => { const a = [...w]; for (let i = a.length - 1; i >= 0; i--) if (!'ьъ-'.includes(a[i])) return i; return -1; };
const prevLetter = (w, i) => { const a = [...w]; for (let j = i - 1; j >= 0; j--) if (!'ьъ'.includes(a[j])) return j; return -1; };
const nextLetter = (w, i) => { const a = [...w]; for (let j = i + 1; j < a.length; j++) if (!'ьъ'.includes(a[j])) return j; return -1; };

// Letter indices in the ORIGINAL word that carry a sound, for highlighting: the respelling keeps word length in every rule
// except the silent-letter clusters, so we map by consonant order and give up (no highlight) when the counts differ.
export function highlight(word, key, nextWord = '') {
  const a = analyseWord(word, nextWord);
  const orig = [...clean(word)];
  const resp = [...units(word)];
  const hits = new Set();
  const ps = (PROCLITIC.has(clean(word)) && nextWord) ? phones(units(word) + units(nextWord)).filter((p) => p.i < resp.length) : phones(units(word));
  if (resp.length !== orig.length) return { hits, a };
  // map lowercase letters back to positions in the word as written (punctuation is outside `word`)
  const pos = []; [...word].forEach((c, i) => { if (/[А-Яа-яЁё-]/.test(c)) pos.push(i); });
  for (const p of ps) if (p.k === key || p.amb === key) hits.add(pos[p.i]);
  return { hits, a };
}

// Analyse a whole poem: every word with its sounds (prepositions see the next word).
export function analysePoem(text) {
  const lines = text.split('\n');
  const flat = [];
  lines.forEach((line, li) => words(line).forEach((w) => flat.push({ ...w, li })));
  flat.forEach((w, n) => { w.info = analyseWord(w.w, flat[n + 1]?.w ?? ''); });
  const count = {}; // key → count (an ambiguous spot counts for both readings in `maybe`)
  const maybe = {};
  const pos = {}; // key → { start, mid, end, cluster }
  for (const w of flat) for (const s of w.info.sounds) {
    count[s.k] = (count[s.k] ?? 0) + 1;
    if (s.amb) maybe[s.amb] = (maybe[s.amb] ?? 0) + 1;
    const p = (pos[s.k] ??= { start: 0, mid: 0, end: 0, cluster: 0 });
    p[s.pos]++; if (s.cluster) p.cluster++;
  }
  return { lines, words: flat, count, maybe, pos };
}

// Check a poem against a target: one sound key or a pair 'a+b'. → { ok, strict, bad: [{w, k}], ambiguous: [...], near: [{w, k, li}], n }
export function checkPoem(text, target) {
  const keys = target.split('+');
  const top = Math.max(...keys.map((k) => RANK[k]));
  const groups = new Set(keys.map((k) => GROUP[k]));
  const forbidStrict = new Set([...groups].map((g) => OPPOSITE[g]).filter((g) => !groups.has(g)));
  const A = analysePoem(text);
  // whistling targets (the speech therapist's rule): no hushing sounds at all, but a few later sounds (Л, Р…)
  // may stand in words that do not carry the target sound — they come back in `near`, one entry per word
  const whistling = keys.every((k) => GROUP[k] === 'wh');
  // the same allowance for pairs with a whistling sound (С–Ш, З–Ж, С–Ц): later Л, Р… outside the target words, never Ч or Щ
  const relaxed = whistling || (keys.length > 1 && keys.some((k) => GROUP[k] === 'wh') && keys.every((k) => GROUP[k] === 'wh' || GROUP[k] === 'hi'));
  const bad = [], strictBad = [], ambiguous = [], near = [];
  for (const w of A.words) {
    if (w.info.ambiguous) ambiguous.push({ w: w.w, why: 'norm' });
    const hasTarget = w.info.sounds.some((s) => keys.includes(s.k) || keys.includes(s.amb));
    for (const s of w.info.sounds) {
      const opts = [s.k, s.amb].filter(Boolean);
      const hush = whistling && opts.find((k) => GROUP[k] === 'hi');
      const later = hush || opts.find((k) => RANK[k] > top);
      if (later && relaxed && !hush && GROUP[later] !== 'hi' && !hasTarget) { if (near.at(-1)?.w !== w.w) near.push({ w: w.w, k: later, li: w.li }); }
      else if (later) bad.push({ w: w.w, k: later });
      if (s.amb && keys.some((k) => opts.includes(k))) ambiguous.push({ w: w.w, why: 'soft' });
      if (opts.some((k) => forbidStrict.has(GROUP[k]) && !keys.includes(k))) strictBad.push({ w: w.w, k: opts.find((k) => forbidStrict.has(GROUP[k])) });
    }
  }
  const n = Object.fromEntries(keys.map((k) => [k, A.count[k] ?? 0]));
  return { ok: bad.length === 0, strict: bad.length === 0 && strictBad.length === 0, bad, strictBad, ambiguous, near, n, analysis: A };
}

export const syllables = (line) => [...line.toLowerCase()].filter((c) => VOWELS.includes(c)).length;
