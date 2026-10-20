// Shared shell for the Skill Graph labs: page chrome, languages, sound, the gauge, the canvas loop
// and the "secret lab" challenge. Each lab (labs/<name>/index.html) builds its own scene on top of it.

export const LANGS = { en: 'EN', ru: 'RU', hu: 'HU' };
const params = new URLSearchParams(location.search);
export let lang = LANGS[params.get('lang')] ? params.get('lang') : (navigator.language || '').slice(0, 2);
if (!LANGS[lang]) lang = 'en';

export const $ = (id) => document.getElementById(id);
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ruPlural = (n, one, few, many) => {
  const m10 = n % 10, m100 = n % 100;
  return m10 === 1 && m100 !== 11 ? one : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? few : many;
};

// browser storage can be missing (private windows, blocked site data): everything still works without it
export const store = {
  get(k, d) { try { const v = localStorage.getItem('sg-lab:' + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('sg-lab:' + k, JSON.stringify(v)); } catch { /* not persisted */ } },
};

const UI = {
  en: { brand: 'Labs', back: 'Back to the map', topics: 'In the skill graph', sound: 'Sound', views: 'View',
        secretKick: 'Secret lab', secretTitle: 'Two extreme experiments are locked.',
        secretAsk: (n) => `Answer <b>${n} quick questions</b> to unlock both.`, start: 'Start the challenge', later: 'Not now',
        qn: (i, n) => `Secret lab · question ${i} of ${n}`, wrong: 'Not quite. Look at the lab and try again!',
        doneTitle: 'Unlocked!', doneText: 'Both secret experiments are open. Find them at the ends of the row.', go: 'Let’s go',
        lic: 'Topics from the Marble Skill Taxonomy (ODbL 1.0 / CC BY-SA 4.0), translated. The lab is a simplified model, not a measuring tool.' },
  ru: { brand: 'Лаборатории', back: 'Назад к карте', topics: 'В графе навыков', sound: 'Звук', views: 'Вид',
        secretKick: 'Секретная лаборатория', secretTitle: 'Два экстремальных опыта под замком.',
        secretAsk: (n) => `Ответь на <b>${n} ${ruPlural(n, 'короткий вопрос', 'коротких вопроса', 'коротких вопросов')}</b>, чтобы открыть оба.`, start: 'Принять вызов', later: 'Не сейчас',
        qn: (i, n) => `Секретная лаборатория · вопрос ${i} из ${n}`, wrong: 'Не совсем. Посмотри на опыт и попробуй ещё раз!',
        doneTitle: 'Открыто!', doneText: 'Оба секретных опыта открыты. Они по краям ряда кнопок.', go: 'Вперёд',
        lic: 'Темы из Marble Skill Taxonomy (ODbL 1.0 / CC BY-SA 4.0), перевод. Лаборатория — упрощённая модель, а не измерительный прибор.' },
  hu: { brand: 'Laborok', back: 'Vissza a térképhez', topics: 'A készségtérképen', sound: 'Hang', views: 'Nézet',
        secretKick: 'Titkos labor', secretTitle: 'Két extrém kísérlet le van zárva.',
        secretAsk: (n) => `Válaszolj <b>${n} rövid kérdésre</b>, és mindkettő kinyílik.`, start: 'Jöhet a kihívás', later: 'Most nem',
        qn: (i, n) => `Titkos labor · ${i}. kérdés / ${n}`, wrong: 'Nem egészen. Nézd meg a kísérletet, és próbáld újra!',
        doneTitle: 'Kinyílt!', doneText: 'Mindkét titkos kísérlet elérhető. A gombsor két végén találod őket.', go: 'Gyerünk',
        lic: 'A témák a Marble Skill Taxonomyból származnak (ODbL 1.0 / CC BY-SA 4.0), fordítás. A labor egyszerűsített modell, nem mérőeszköz.' },
};

// --- sound: tiny synthesized blips, off until the visitor turns it on -------------------------------------
let audio = null, soundOn = store.get('sound', false);
function tone(freq, dur = 0.08, type = 'sine', vol = 0.08, slide = 0) {
  if (!soundOn) return;
  try {
    audio ??= new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator(), g = audio.createGain(), t = audio.currentTime;
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(audio.destination); o.start(t); o.stop(t + dur + 0.02);
  } catch { /* no audio: stay silent */ }
}
export const sfx = {
  tick: () => tone(1400, 0.03, 'square', 0.025),
  click: () => tone(660, 0.06, 'triangle', 0.06),
  snap: () => { tone(320, 0.05, 'square', 0.07); setTimeout(() => tone(900, 0.07, 'triangle', 0.05), 40); },
  push: () => tone(180, 0.18, 'sawtooth', 0.04, -80),
  good: () => { tone(660, 0.09); setTimeout(() => tone(880, 0.09), 90); setTimeout(() => tone(1320, 0.16), 180); },
  bad: () => tone(200, 0.2, 'triangle', 0.07, -60),
};

// --- shell ------------------------------------------------------------------------------------------------
// cfg: { key, T (per-language strings of the lab), topics: [{id, en, ru, hu}], views: [keys], onLang, onView }
export function shell(cfg) {
  document.body.insertAdjacentHTML('afterbegin', `
  <nav class="bar">
    <a id="brand" href="../../"></a>
    <div id="views" class="card seg" role="tablist"></div>
    <div id="langs" class="card seg"></div>
    <button id="sound" class="card iconbtn"></button>
  </nav>
  <main class="lab">
    <header id="hero"></header>
    <section id="stage"><canvas id="cv"></canvas><div id="overlay"></div></section>
    <section id="ctrl" class="card">
      <div class="readout"><span class="val" id="val"></span><span class="sub" id="valSub"></span><span class="pill" id="pill"></span></div>
      <div id="ctrlBody"></div>
    </section>
    <section id="state" class="card">
      <div class="head"><span class="emo" id="stEmo"></span><h2 id="stTitle"></h2></div>
      <p class="lead" id="stLead"></p><p class="body" id="stBody"></p><div class="extra" id="stExtra"></div>
    </section>
    <aside id="gauge"><div class="cap" id="gaugeCap"></div><div class="tube"><div class="fill" id="gFill"></div></div><div class="knob" id="gKnob"></div></aside>
  </main>
  <footer class="foot" id="foot"></footer>
  <div id="secret"><div class="card box" id="secretBox" role="dialog" aria-modal="true"></div></div>`);

  const lab = { view: cfg.views?.[0], cfg };
  lab.u = () => UI[lang];
  lab.t = () => cfg.T[lang];

  const renderChrome = () => {
    const u = UI[lang], T = cfg.T[lang];
    document.documentElement.lang = lang;
    document.title = `${T.name} · Skill Graph`;
    const back = new URLSearchParams();
    if (lang !== 'en') back.set('lang', lang);
    if (cfg.topics?.[0]) back.set('topic', cfg.topics[0].id);
    $('brand').href = `../../?${back}`;
    $('brand').innerHTML = `Skill Graph<i>.</i><small>${esc(u.brand)}</small>`;
    $('brand').title = u.back;
    $('langs').innerHTML = Object.entries(LANGS).map(([k, v]) => `<button data-lang="${k}" class="${k === lang ? 'on' : ''}">${v}</button>`).join('');
    $('views').innerHTML = (cfg.views ?? []).map((v) => `<button role="tab" data-view="${v}" class="${v === lab.view ? 'on' : ''}">${T.views[v]}</button>`).join('');
    $('views').style.display = cfg.views?.length > 1 ? '' : 'none';
    $('sound').textContent = soundOn ? '🔊' : '🔈';
    $('sound').title = `${u.sound}: ${soundOn ? 'on' : 'off'}`;
    $('hero').innerHTML = `<h1>${T.title}${/[?!.…]$/.test(T.title) ? '' : '<i>.</i>'}</h1>${T.lines.map(([b, r]) => `<p><b>${esc(b)}</b> ${esc(r)}</p>`).join('')}`;
    $('foot').innerHTML = `<b>${esc(u.topics)}</b>${(cfg.topics ?? []).map((t) => {
      const p = new URLSearchParams({ topic: t.id }); if (lang !== 'en') p.set('lang', lang);
      return `<a href="../../?${p}">${esc(t[lang])}</a>`;
    }).join('')}<span class="lic">${esc(u.lic)}</span>`;
  };

  $('langs').addEventListener('click', (ev) => {
    const k = ev.target.closest('button')?.dataset.lang;
    if (!k || k === lang) return;
    lang = k;
    const p = new URLSearchParams(location.search); p.set('lang', k); history.replaceState(null, '', `?${p}`);
    renderChrome(); cfg.onLang?.();
  });
  $('views').addEventListener('click', (ev) => {
    const v = ev.target.closest('button')?.dataset.view;
    if (!v || v === lab.view) return;
    lab.view = v; sfx.click(); renderChrome(); cfg.onView?.(v);
  });
  $('sound').onclick = () => { soundOn = !soundOn; store.set('sound', soundOn); renderChrome(); sfx.click(); };

  lab.renderChrome = renderChrome;
  lab.setState = ({ emo, title, lead, body, extra = '' }) => {
    $('stEmo').textContent = emo; $('stTitle').textContent = title; $('stLead').textContent = lead;
    $('stBody').textContent = body; $('stExtra').innerHTML = extra;
  };
  lab.setReadout = (val, sub, pill, color) => {
    $('val').innerHTML = val; $('valSub').textContent = sub ?? ''; $('pill').textContent = pill ?? '';
    $('pill').style.display = pill ? '' : 'none';
    if (color) document.documentElement.style.setProperty('--accent', color);
  };
  lab.setGlow = (rgba) => document.documentElement.style.setProperty('--glow', rgba);
  // gauge: frac in [0, 1]; ticks [{f, label}]
  lab.setGauge = (frac, ticks, cap) => {
    const g = $('gauge'), f = clamp(frac, 0, 1);
    $('gFill').style.height = `${f * 100}%`;
    $('gKnob').style.top = `${(1 - f) * 100}%`;
    if (ticks) {
      g.querySelectorAll('.tick').forEach((x) => x.remove());
      g.insertAdjacentHTML('beforeend', ticks.map((t) => `<div class="tick" style="top:${(1 - t.f) * 100}%">${esc(t.label)}</div>`).join(''));
    }
    if (cap !== undefined) $('gaugeCap').textContent = cap;
  };
  renderChrome();
  return lab;
}

// --- canvas loop: DPR-aware, resizes with its box, calls draw(ctx, w, h, dt, time) every frame -------------
export function canvasLoop(canvas, draw) {
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, last = performance.now();
  const fit = () => {
    const r = canvas.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    canvas.width = Math.round(w * d); canvas.height = Math.round(h * d);
    ctx.setTransform(d, 0, 0, d, 0, 0);
  };
  new ResizeObserver(fit).observe(canvas);
  fit();
  const frame = (now) => {
    const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now; // the first frame can be stamped before `last`
    if (w > 0 && h > 0) { ctx.clearRect(0, 0, w, h); draw(ctx, w, h, dt, now / 1000); }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  return { ctx, size: () => ({ w, h }) };
}

// --- secret lab: intro with the two locked experiments, then N questions, then unlocked -------------------
// secrets: [{emo, title, desc}], questions: [{q, opts: [...], ok: index}]
export function secretLab(key, getContent, onUnlock) {
  const box = $('secretBox'), wrap = $('secret');
  const close = () => wrap.classList.remove('open');
  wrap.addEventListener('click', (ev) => { if (ev.target === wrap) close(); });
  addEventListener('keydown', (ev) => { if (ev.key === 'Escape') close(); });
  const intro = () => {
    const u = UI[lang], { secrets, questions } = getContent();
    box.innerHTML = `<div class="kick">🔬 ${esc(u.secretKick)}</div><h3>${esc(u.secretTitle)}</h3>
      <div class="locks">${secrets.map((s) => `<div class="lock"><div class="e">${s.emo}</div><div class="t">${esc(s.title)}</div><div class="d">${esc(s.desc)}</div></div>`).join('')}</div>
      <p>${u.secretAsk(questions.length)}</p>
      <button class="btn" id="qStart">${esc(u.start)}</button> <button class="btn ghost" id="qLater">${esc(u.later)}</button>`;
    $('qStart').onclick = () => ask(0); $('qLater').onclick = close;
  };
  const ask = (i) => {
    const u = UI[lang], { questions } = getContent(), q = questions[i];
    if (!q) return done();
    box.innerHTML = `<div class="kick">🔬 ${esc(u.qn(i + 1, questions.length))}</div><h3>${esc(q.q)}</h3>
      <div class="opts">${q.opts.map((o, j) => `<button class="opt" data-j="${j}">${esc(o)}</button>`).join('')}</div>
      <div class="hint" id="qHint"></div>
      <div class="dots">${questions.map((_, j) => `<i class="${j <= i ? 'on' : ''}"></i>`).join('')}</div>`;
    box.querySelector('.opts').onclick = (ev) => {
      const b = ev.target.closest('.opt'); if (!b) return;
      if (+b.dataset.j === q.ok) { b.classList.add('good'); sfx.good(); setTimeout(() => ask(i + 1), 550); }
      else { b.classList.remove('bad'); void b.offsetWidth; b.classList.add('bad'); sfx.bad(); $('qHint').textContent = u.wrong; }
    };
  };
  const done = () => {
    const u = UI[lang];
    store.set('unlocked:' + key, true);
    box.innerHTML = `<div class="kick">🔓 ${esc(u.secretKick)}</div><h3>${esc(u.doneTitle)}</h3><p>${esc(u.doneText)}</p>
      <button class="btn" id="qGo">${esc(u.go)}</button>`;
    $('qGo').onclick = () => { close(); onUnlock(); };
    onUnlock();
  };
  return {
    unlocked: () => store.get('unlocked:' + key, false),
    open: () => { intro(); wrap.classList.add('open'); sfx.click(); },
  };
}
