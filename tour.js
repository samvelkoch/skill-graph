// Guided tour of the viewer (index.html): opens by itself on the first visit and from the "?" button in the top bar.
// Like labs/viewer.js it only reads the viewer's globals (lang, f, focus, byId, select) and its DOM, so the viewer stays as it is.
(() => {
  const SAMPLE = 'mt_ndGqFPWyen'; // "Fractions of a whole": has prerequisites, a quick check and a lab
  const KEY = 'skillgraph.tour';
  const T = {
    en: {
      help: 'How it works', next: 'Next', back: 'Back', skip: 'Skip', start: 'Show me around', later: 'Not now', done: 'Got it',
      of: (i, n) => `${i} / ${n}`,
      steps: {
        welcome: ['What is this site?', (n) => `<p>An open <b>map of what children learn at school</b>: ${n} concepts, from first words to algebra, wired together by <b>what must come first</b>.</p><p>For parents and children: see what a child already knows, where the gap is, and what is ready to learn next. Free, no sign-up, in English, Russian and Hungarian.</p>`],
        map: ['The graph', '<p>Every dot is a topic. <b>Colour</b> is the subject, <b>height</b> is the age: small children at the bottom, middle school at the top.</p><p><b>Drag</b> to spin, <b>scroll</b> to zoom, <b>tap a dot</b> to light up the chain of topics that lead to it.</p>'],
        legend: ['Subjects and age', '<p>Tap a subject to hide or show it. Below, set the age range. When a school curriculum is picked, it can be changed here too.</p>'],
        panel: ['Topic card', '<p>What the topic is about, how many topics come before it and a quick check question for the child. The tabs below: what it <b>builds on</b> and <b>unlocks next</b>, signs of mastery, the school grades where it is taught and the full path.</p>'],
        status: ['Mark what the child knows', '<p><b>Knows it</b> or <b>Learning</b>. One tap marks the topic and the whole path to it as known.</p><p>Progress is kept only in this browser, nothing is sent anywhere.</p>'],
        lab: ['Interactive explainer', '<p>Some topics have a <b>lab</b>: a small interactive page where the child can play with the idea (fractions, magnets, the Moon, circuits…).</p>'],
        labs: ['All labs', '<p>The full list of interactive explainers lives here.</p>'],
        school: ['School curriculum', '<p>Pick a country and a grade, e.g. <b>Hungary · grade 4</b>: only the topics taught in that grade by the official curriculum stay on the graph and in the topic list.</p><p>Above it: filter by age or grade.</p>'],
        next: ['What to learn next', '<p><b>Ready to learn</b> shows topics whose required prerequisites are all marked as known. That is the answer to “what next?”.</p>'],
        search: ['Search', '<p>Find a topic by name or description, e.g. “fractions” or “photosynthesis”.</p>'],
        views: ['Graph or topic list', '<p>The <b>list</b> groups topics by subject and section, with a short summary of each section for parents.</p>'],
        langs: ['Language', '<p>Switch between English, Russian and Hungarian. Topics, cards and labs are all translated.</p>'],
        end: ['That’s it', '<p>A good start: pick your child’s school and grade in the filters, then press the button that assumes the lower grades are known. “Ready to learn” then answers “what next?”.</p><p>This tour is always behind the <b>?</b> button.</p>'],
      },
    },
    ru: {
      help: 'Как пользоваться', next: 'Дальше', back: 'Назад', skip: 'Пропустить', start: 'Показать, как пользоваться', later: 'Не сейчас', done: 'Понятно',
      of: (i, n) => `${i} из ${n}`,
      steps: {
        welcome: ['Что это за сайт?', (n) => `<p>Открытая <b>карта того, что дети изучают в школе</b>: ${n} ${g(() => ruPlural(n, 'понятие', 'понятия', 'понятий'), 'понятий')}, от первых слов до алгебры, связанных стрелками <b>«что нужно знать раньше»</b>.</p><p>Для родителей и детей: видно, что ребёнок уже знает, где пробел и что можно изучать дальше. Бесплатно, без регистрации, на русском, венгерском и английском.</p>`],
        map: ['Граф', '<p>Каждая точка — тема. <b>Цвет</b> — предмет, <b>высота</b> — возраст: внизу то, что учат малыши, наверху — старшие классы.</p><p><b>Тяните</b>, чтобы вращать, <b>колёсико</b> приближает, <b>нажмите на точку</b>, чтобы подсветить цепочку тем, которые ведут к ней.</p>'],
        legend: ['Предметы и возраст', '<p>Нажмите на предмет, чтобы скрыть или показать его. Ниже — диапазон возраста. Если выбрана школьная программа, её можно сменить и здесь.</p>'],
        panel: ['Карточка темы', '<p>О чём тема, сколько тем нужно освоить до неё и вопрос для быстрой проверки ребёнка. Во вкладках ниже: на что тема <b>опирается</b> и что <b>открывает дальше</b>, признаки освоения, в каком классе её проходят и весь путь к ней.</p>'],
        status: ['Отмечайте, что ребёнок знает', '<p><b>Знает</b> или <b>Изучаем</b>. Одной кнопкой можно отметить тему и весь путь к ней как освоенные.</p><p>Прогресс хранится только в этом браузере, никуда не отправляется.</p>'],
        lab: ['Лаборатория', '<p>У некоторых тем есть <b>лаборатория</b>: интерактивная страница, где идею можно потрогать руками (дроби, магниты, Луна, электрические цепи…).</p>'],
        labs: ['Все лаборатории', '<p>Полный список интерактивных объяснений — здесь.</p>'],
        school: ['Школьная программа', '<p>Выберите страну и класс, например <b>Венгрия · 4 класс</b>: на графе и в списке тем останутся только темы, которые проходят в этом классе по официальной программе.</p><p>Выше — фильтр по возрасту или классу.</p>'],
        next: ['Что изучать дальше', '<p><b>Можно изучать</b> показывает темы, у которых все обязательные предыдущие темы отмечены как освоенные. Это и есть ответ на вопрос «что дальше?».</p>'],
        search: ['Поиск', '<p>Найдите тему по названию или описанию, например «дроби» или «фотосинтез».</p>'],
        views: ['Граф или список тем', '<p>В <b>списке</b> темы сгруппированы по предметам и разделам, у каждого раздела есть короткое описание для родителей.</p>'],
        langs: ['Язык', '<p>Русский, венгерский или английский. Переведены темы, карточки и лаборатории.</p>'],
        end: ['Готово', '<p>Хорошее начало: выберите в фильтрах школу и класс ребёнка и одной кнопкой отметьте младшие классы как пройденные. «Можно изучать» сразу ответит, что дальше.</p><p>Эта справка всегда под кнопкой <b>?</b>.</p>'],
      },
    },
    hu: {
      help: 'Hogyan működik', next: 'Tovább', back: 'Vissza', skip: 'Kihagyom', start: 'Mutasd meg', later: 'Most nem', done: 'Értem',
      of: (i, n) => `${i} / ${n}`,
      steps: {
        welcome: ['Mi ez az oldal?', (n) => `<p>Nyílt <b>térkép arról, mit tanulnak a gyerekek az iskolában</b>: ${n} fogalom az első szavaktól az algebráig, összekötve aszerint, hogy <b>mit kell előbb tudni</b>.</p><p>Szülőknek és gyerekeknek: látszik, mit tud már a gyerek, hol van hiány, és mi tanulható ezután. Ingyenes, regisztráció nélkül, magyarul, oroszul és angolul.</p>`],
        map: ['A gráf', '<p>Minden pont egy téma. A <b>szín</b> a tantárgy, a <b>magasság</b> az életkor: lent a kicsik témái, fent a felső tagozat.</p><p><b>Húzd</b> a forgatáshoz, <b>görgess</b> a nagyításhoz, <b>koppints egy pontra</b>, és kigyullad az odavezető témák lánca.</p>'],
        legend: ['Tantárgyak és életkor', '<p>Koppints egy tantárgyra az elrejtéséhez vagy megjelenítéséhez. Alatta az életkor. Ha van kiválasztott iskolai tanterv, itt is módosítható.</p>'],
        panel: ['Témakártya', '<p>Miről szól a téma, hány téma van előtte, és egy gyors ellenőrző kérdés a gyereknek. Lent a füleken: mire <b>épül</b>, mit <b>nyit meg</b>, az elsajátítás jelei, melyik osztályban tanulják, és a teljes út.</p>'],
        status: ['Jelöld, mit tud a gyerek', '<p><b>Tudja</b> vagy <b>Tanulja</b>. Egy gombbal a téma és a hozzá vezető teljes út is tudottnak jelölhető.</p><p>A haladás csak ebben a böngészőben marad, sehová sem küldjük.</p>'],
        lab: ['Labor', '<p>Néhány témához <b>labor</b> tartozik: interaktív oldal, ahol a gyerek kipróbálhatja az ötletet (törtek, mágnesek, a Hold, áramkörök…).</p>'],
        labs: ['Minden labor', '<p>Az interaktív magyarázók teljes listája itt található.</p>'],
        school: ['Iskolai tanterv', '<p>Válassz országot és osztályt, például <b>Magyarország · 4. osztály</b>: a gráfon és a témalistában csak az abban az osztályban, a hivatalos tanterv szerint tanult témák maradnak.</p><p>Fölötte: szűrés életkorra vagy osztályra.</p>'],
        next: ['Mi jöhet ezután', '<p>A <b>Tanulható</b> azokat a témákat mutatja, amelyeknek minden kötelező előfeltétele tudottnak van jelölve. Ez a válasz arra, hogy „mi a következő?”.</p>'],
        search: ['Keresés', '<p>Keress témát név vagy leírás szerint, például „törtek” vagy „fotoszintézis”.</p>'],
        views: ['Gráf vagy témalista', '<p>A <b>listában</b> a témák tantárgyak és fejezetek szerint csoportosítva, minden fejezethez rövid összefoglaló szülőknek.</p>'],
        langs: ['Nyelv', '<p>Magyar, orosz vagy angol. A témák, kártyák és laborok is le vannak fordítva.</p>'],
        end: ['Kész', '<p>Jó kezdés: válaszd ki a szűrőkben a gyerek iskoláját és osztályát, majd egy gombbal jelöld tudottnak az alsóbb osztályokat. A „Tanulható” rögtön megmondja, mi jön.</p><p>Ez a bemutató mindig elérhető a <b>?</b> gombbal.</p>'],
      },
    },
  };

  const $ = (id) => document.getElementById(id);
  const g = (fn, d) => { try { return fn(); } catch { return d; } }; // the viewer's top-level let/const, read safely
  const L = () => T[g(() => lang, 'en')] ?? T.en;
  const graphView = () => g(() => f.view, 'graph') === 'graph';
  const shown = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };

  // Each step: target() -> element(s) to highlight (none = centred card), when() -> include the step,
  // panel: needs a topic card open, side: needs the filters drawer open.
  const STEPS = [
    { id: 'welcome' },
    { id: 'map', when: graphView },
    { id: 'legend', target: () => $('legend'), when: graphView },
    { id: 'panel', panel: true, target: () => $('panel') },
    { id: 'status', panel: true, target: () => [document.querySelector('#panelBody .status'), $('markAll')] },
    { id: 'lab', panel: true, target: () => document.querySelector('#panelBody .labcta') },
    { id: 'labs', target: () => $('labsBtn') },
    { id: 'school', side: true, target: () => { const s = $('sideSchool'); return s && [s.previousElementSibling, s, s.nextElementSibling]; } },
    { id: 'next', side: true, target: () => [$('status'), $('status')?.previousElementSibling] },
    { id: 'search', target: () => $('search') },
    { id: 'views', target: () => $('views') },
    { id: 'langs', target: () => $('langs') },
    { id: 'end', target: () => $('tourBtn') },
  ];

  const css = `
    #tourBtn { width: 36px; height: 36px; padding: 0; justify-content: center; font-size: 16px; font-weight: 900; }
    #tourShade { position: fixed; inset: 0; z-index: 40; background: transparent; }
    #tourHole { position: fixed; z-index: 41; border-radius: 16px; pointer-events: none; border: 2px solid var(--red);
      box-shadow: 0 0 0 9999px rgba(4, 6, 12, .66); transition: all .25s ease; }
    #tourHole.none { left: 50% !important; top: 50% !important; width: 0 !important; height: 0 !important; border: 0; }
    #tourCard { position: fixed; z-index: 42; width: min(370px, calc(100vw - 32px)); padding: 18px 20px 16px;
      background: rgba(12, 15, 25, .98); box-shadow: 0 18px 50px rgba(0, 0, 0, .6); transition: left .25s ease, top .25s ease; }
    #tourCard h3 { font: 500 26px/1.1 var(--serif); color: #fff; margin: 0 0 8px; }
    #tourCard h3 i { font-style: normal; color: var(--red); }
    #tourCard p { margin: 0 0 8px; font-size: 13.5px; line-height: 1.55; color: var(--body); }
    #tourCard p b { color: #fff; }
    #tourCard .nav { display: flex; align-items: center; gap: 8px; margin-top: 14px; }
    #tourCard .nav .c { font: 11.5px var(--mono); color: var(--faint); margin-right: auto; }
    #tourCard .nav .linkbtn { margin-right: auto; }
    #tourCard .x { position: absolute; top: 10px; right: 12px; background: none; border: 0; color: var(--mut); font-size: 20px; cursor: pointer; }
    #tourCard .x:hover { color: #fff; }
    @media (max-width: 720px) { #tourBtn { width: 30px; height: 30px; font-size: 14px; } #tourCard h3 { font-size: 22px; } }
    @media (prefers-reduced-motion: reduce) { #tourHole, #tourCard { transition: none; } }`;

  let steps = [], i = 0, timer = null;
  let opened = null; // what the tour changed and must undo: { topic, back, side }

  function needs(step) {
    // open or close the sample topic card and the filters drawer for this step
    if (step.panel && !g(() => focus, null) && g(() => byId.has(SAMPLE), false)) {
      opened.topic = true;
      select(SAMPLE, false); // no fly-to: the camera would stay zoomed in after the tour
    } else if (!step.panel && opened.topic) {
      opened.topic = false;
      select(null);
    }
    const body = document.body.classList;
    if (step.side && !body.contains('side-open')) { opened.side = true; body.add('side-open'); }
    else if (!step.side && opened.side) { opened.side = false; body.remove('side-open'); }
  }

  function targets(step) {
    const t = step.target?.();
    return (Array.isArray(t) ? t : [t]).filter(shown);
  }

  function place() {
    const step = steps[i], els = targets(step), hole = $('tourHole'), card = $('tourCard');
    const vw = innerWidth, vh = innerHeight, cw = card.offsetWidth, ch = card.offsetHeight, m = 16;
    if (!els.length) {
      hole.className = 'none';
      card.style.left = `${(vw - cw) / 2}px`; card.style.top = `${Math.max(m, (vh - ch) / 2)}px`;
      return;
    }
    const rs = els.map((el) => el.getBoundingClientRect()), pad = 6;
    const r = { l: Math.min(...rs.map((x) => x.left)) - pad, t: Math.min(...rs.map((x) => x.top)) - pad,
      r: Math.max(...rs.map((x) => x.right)) + pad, b: Math.max(...rs.map((x) => x.bottom)) + pad };
    r.t = Math.max(r.t, 2); r.b = Math.min(r.b, vh - 2); r.l = Math.max(r.l, 2); r.r = Math.min(r.r, vw - 2);
    hole.className = '';
    Object.assign(hole.style, { left: `${r.l}px`, top: `${r.t}px`, width: `${r.r - r.l}px`, height: `${r.b - r.t}px` });
    // card: below, above, to the right, to the left of the target, else wherever it covers the target least
    const clampX = (x) => Math.min(Math.max(m, x), vw - cw - m), clampY = (y) => Math.min(Math.max(m, y), vh - ch - m);
    let x, y;
    if (vh - r.b >= ch + 2 * m) { x = clampX(r.l); y = r.b + m; }
    else if (r.t >= ch + 2 * m) { x = clampX(r.l); y = r.t - ch - m; }
    else if (vw - r.r >= cw + 2 * m) { x = r.r + m; y = clampY(r.t); }
    else if (r.l >= cw + 2 * m) { x = r.l - cw - m; y = clampY(r.t); }
    else { x = clampX((vw - cw) / 2); y = r.t > vh - r.b ? m : vh - ch - m; }
    card.style.left = `${x}px`; card.style.top = `${y}px`;
  }

  function render() {
    const u = L(), step = steps[i], [title, text] = u.steps[step.id];
    const html = typeof text === 'function' ? text(g(() => data.topics.length, 2000)) : text;
    const first = i === 0, last = i === steps.length - 1;
    $('tourCard').innerHTML = `<button class="x" data-t="close" aria-label="${u.skip}">×</button>
      <h3>${title}<i>.</i></h3>${html}
      <div class="nav">${first
        ? `<button class="linkbtn" data-t="close">${u.later}</button><button class="btn primary" data-t="next">${u.start} →</button>`
        : `<span class="c">${u.of(i, steps.length - 1)}</span><button class="btn" data-t="back">${u.back}</button>
           <button class="btn primary" data-t="next">${last ? u.done : u.next + ' →'}</button>`}</div>`;
    $('tourCard').querySelector('.btn.primary').focus({ preventScroll: true });
  }

  function go(n) {
    i = n;
    const step = steps[i];
    needs(step);
    // let the viewer render the card or drawer, then scroll the target into view and point at it
    requestAnimationFrame(() => {
      const el = targets(step)[0];
      if (el && step.side) el.scrollIntoView({ block: 'center' });
      if (el && step.panel) el.scrollIntoView({ block: 'nearest' });
      render(); place();
    });
  }

  function open() {
    if ($('tourCard')) return;
    try { localStorage.setItem(KEY, '1'); } catch { /* private mode */ }
    document.querySelector('#labsMenu.open')?.classList.remove('open');
    $('results') && ($('results').style.display = 'none');
    opened = { topic: false, side: false };
    steps = STEPS.filter((s) => !s.when || s.when());
    document.body.append(
      Object.assign(document.createElement('div'), { id: 'tourShade' }),
      Object.assign(document.createElement('div'), { id: 'tourHole', className: 'none' }),
      Object.assign(document.createElement('div'), { id: 'tourCard', className: 'card', role: 'dialog' }));
    $('tourCard').onclick = (ev) => {
      const a = ev.target.closest('[data-t]')?.dataset.t;
      if (a === 'close') close();
      else if (a === 'back') move(-1);
      else if (a === 'next') move(1);
    };
    addEventListener('keydown', key, true);
    addEventListener('resize', place);
    addEventListener('scroll', place, { passive: true });
    timer = setInterval(place, 400); // the map, the panel and the drawer move on their own
    go(0);
  }
  // skip a step whose target is missing (e.g. no lab on the open topic); steps without a target only explain
  let moving = false;
  async function move(d) {
    if (moving || !opened) return;
    if (d > 0 && i === steps.length - 1) return close();
    moving = true;
    let k = i + d;
    for (; k > 0 && k < steps.length - 1; k += d) {
      if (!steps[k].target) break;
      needs(steps[k]);
      await null; // labs/viewer.js decorates the topic card from a MutationObserver
      if (targets(steps[k]).length) break;
    }
    moving = false;
    if (opened) go(Math.max(0, k));
  }

  function key(ev) {
    if (ev.key === 'Escape') { ev.stopPropagation(); close(); }
    else if (ev.key === 'ArrowRight') { ev.preventDefault(); move(1); }
    else if (ev.key === 'ArrowLeft' && i) { ev.preventDefault(); move(-1); }
  }

  function close() {
    clearInterval(timer);
    removeEventListener('keydown', key, true);
    removeEventListener('resize', place);
    removeEventListener('scroll', place);
    ['tourShade', 'tourHole', 'tourCard'].forEach((id) => $(id)?.remove());
    if (opened?.topic) select(null);
    if (opened?.side) document.body.classList.remove('side-open');
    opened = null;
    $('tourBtn')?.focus({ preventScroll: true });
  }

  function renderBtn() {
    const b = $('tourBtn');
    b.title = L().help; b.setAttribute('aria-label', L().help);
  }

  function init() {
    document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);
    const btn = Object.assign(document.createElement('button'), { id: 'tourBtn', className: 'btn', textContent: '?' });
    document.querySelector('.bar').insertBefore(btn, $('langs'));
    btn.onclick = (ev) => { ev.stopPropagation(); open(); };
    renderBtn();
    new MutationObserver(() => { renderBtn(); if ($('tourCard')) render(); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    let seen = null;
    try { seen = localStorage.getItem(KEY); } catch { seen = '1'; } // no storage: don't pop up on every visit
    if (seen) return;
    // first visit: wait until the data is in and the loading screen is gone
    const t0 = Date.now();
    const wait = setInterval(() => {
      const loaded = g(() => byId?.size > 0, false) && $('loading').style.display === 'none';
      if (loaded || Date.now() - t0 > 20000) { clearInterval(wait); if (loaded) setTimeout(open, 600); }
    }, 250);
  }

  init();
})();
