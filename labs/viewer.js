// Quick access to the labs from the viewer (../index.html), driven by labs/registry.json:
// a "Labs" button with a menu in the top bar, an "Open the explorer" card in a topic's panel, a 🧪 mark in the list
// and the topic set behind the viewer's "only topics with a lab" filter.
// It reads the viewer's globals (lang, focus), fills labTopics and decorates what the viewer renders.
(() => {
  const UI = {
    en: { labs: 'Labs', title: 'Interactive explainers', sub: 'Learn a topic by playing with it.', open: 'Open the explorer',
          topics: (n) => `${n} ${n === 1 ? 'topic' : 'topics'}`, all: 'All labs', show: (n) => `Show all ${n} topics with a lab`, subj: { Science: 'Science', Mathematics: 'Mathematics', Computing: 'Computing', Other: 'Other' }, more: 'More explainers are on the way.', has: 'Has an interactive explainer', find: 'Find a lab…', none: 'No labs found.', moreIn: (n) => `${n} more →` },
    ru: { labs: 'Лаборатории', title: 'Интерактивные объяснения', sub: 'Разберись в теме, играя с ней.', open: 'Открыть лабораторию',
          topics: (n) => `${n} ${n % 10 === 1 && n % 100 !== 11 ? 'тема' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'темы' : 'тем'}`,
          all: 'Все лаборатории', show: (n) => `Показать все темы с лабораториями (${n})`, subj: { Science: 'Естествознание', Mathematics: 'Математика', Computing: 'Информатика', Other: 'Другое' }, more: 'Скоро будут и другие.', has: 'Есть интерактивное объяснение', find: 'Найти лабораторию…', none: 'Ничего не нашлось.', moreIn: (n) => `ещё ${n} →` },
    hu: { labs: 'Laborok', title: 'Interaktív magyarázók', sub: 'Értsd meg a témát játék közben.', open: 'A labor megnyitása',
          topics: (n) => `${n} téma`, all: 'Minden labor', show: (n) => `Mind a ${n} laboros téma mutatása`, subj: { Science: 'Természettudomány', Mathematics: 'Matematika', Computing: 'Informatika', Other: 'Egyéb' }, more: 'Hamarosan jönnek az újak.', has: 'Interaktív magyarázó tartozik hozzá', find: 'Labor keresése…', none: 'Nincs találat.', moreIn: (n) => `még ${n} →` },
  };
  const SUBJ_ORDER = ['Science', 'Mathematics', 'Computing', 'Other'];
  const ALL_UP_TO = 16, PER_SUBJ = 5, HITS = 12;
  const fold = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // the viewer's own top-level `let lang` / `let focus` are visible to this classic script
  const cur = () => { try { return UI[lang] ? lang : 'en'; } catch { return 'en'; } };
  const topic = () => { try { return focus; } catch { return null; } };
  const href = (l) => `${l.path}?lang=${cur()}`; // always explicit: a lab otherwise falls back to the browser language
  const tx = (o) => o?.[cur()] ?? o?.en ?? '';
  let labs = [];
  const byTopic = new Map();

  const css = `
    #labsBtn { position: relative; }
    #labsBtn .n { font: 800 11px/1 var(--sans); background: var(--red); color: #fff; border-radius: 999px; padding: 3px 6px; }
    #labsMenu { position: fixed; top: 70px; right: 26px; width: min(400px, calc(100vw - 28px)); max-height: calc(100vh - 90px); overflow: auto;
      padding: 16px; z-index: 20; display: none; background: rgba(12, 15, 25, .97); box-shadow: 0 18px 50px rgba(0, 0, 0, .55); }
    #labsMenu.open { display: block; }
    #labsMenu h3 { font: 500 24px/1.1 var(--serif); margin: 0 0 4px; color: #fff; }
    #labsMenu .s { color: var(--mut); font-size: 12.5px; margin: 0 0 12px; }
    .labcard { display: flex; gap: 12px; align-items: flex-start; padding: 9px 12px; border-radius: 14px; border: 1px solid var(--stroke);
      text-decoration: none; color: var(--ink); margin-bottom: 8px; transition: background .15s, border-color .15s; }
    .labcard:hover { background: var(--hover); border-color: var(--stroke2); }
    .labcard .e { font-size: 26px; line-height: 1.1; }
    .labcard b { display: block; font-size: 14px; }
    .labcard small { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; color: var(--mut); font-size: 12px; line-height: 1.45; margin-top: 2px; }
    #labsQ { width: 100%; margin: 8px 0 2px; padding: 8px 14px; border-radius: 999px; border: 1px solid var(--stroke2); background: rgba(20, 24, 38, .8);
      outline: none; font-size: 13.5px; }
    #labsQ:focus { border-color: var(--red); }
    #labsMenu .moreln { display: block; margin: -2px 2px 6px; font-size: 12px; font-weight: 800; color: var(--soft); text-decoration: none; text-align: right; }
    #labsMenu .moreln:hover { color: #fff; }
    #labsShow { width: 100%; justify-content: center; margin-bottom: 4px; white-space: normal; }
    #labsMenu .grp { font-size: 10px; letter-spacing: .16em; text-transform: uppercase; color: var(--faint); font-weight: 700; margin: 12px 2px 6px; }
    .labcard .m { display: flex; gap: 8px; align-items: center; margin-top: 6px; font-size: 11px; color: var(--faint); font-weight: 700; }
    #labsMenu .foot { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; font-size: 12px; color: var(--faint); }
    #labsMenu .foot a { color: var(--soft); font-weight: 700; text-decoration: none; }
    #labsMenu .foot a:hover { color: #fff; }
    .labcta { display: flex; align-items: center; gap: 12px; margin: 10px 0 14px; padding: 12px 14px; border-radius: 14px; text-decoration: none;
      color: #fff; background: linear-gradient(120deg, rgba(255, 59, 48, .22), rgba(130, 145, 190, .1)); border: 1px solid rgba(255, 59, 48, .45); }
    .labcta:hover { background: linear-gradient(120deg, rgba(255, 59, 48, .34), rgba(130, 145, 190, .16)); }
    .labcta .e { font-size: 26px; }
    .labcta b { display: block; font-size: 13.5px; }
    .labcta small { display: block; color: var(--soft); font-size: 12px; }
    .labcta .go { margin-left: auto; font-size: 18px; color: var(--red); }
    .labmark { margin-left: 4px; font-size: 12px; }
    @media (max-width: 720px) { #labsBtn .t { display: none; } #labsMenu { top: 60px; right: 14px; } }`;

  function renderBtn() {
    const u = UI[cur()];
    $('labsBtn').innerHTML = `🧪 <span class="t">${esc(u.labs)}</span> <span class="n">${labs.length}</span>`;
    $('labsBtn').title = u.title;
    $('labsHead').innerHTML = `<h3>${esc(u.title)}<span style="color:var(--red)">.</span></h3><p class="s">${esc(u.sub)}</p>
      <button class="btn" id="labsShow">🗺 ${esc(u.show(byTopic.size))}</button>`;
    $('labsQ').placeholder = u.find;
    renderLabs();
  }
  // a few labs per subject (all of them while the collection is small) and a search over every lab;
  // the full, filterable collection is the gallery (labs/index.html)
  function renderLabs() {
    const u = UI[cur()], s = fold($('labsQ').value.trim()), cap = labs.length <= ALL_UP_TO ? Infinity : PER_SUBJ;
    const card = (l) => `<a class="labcard" href="${href(l)}"><span class="e">${l.emoji}</span><span><b>${esc(tx(l.title))}</b>
        <small>${esc(tx(l.blurb))}</small></span></a>`;
    const subjOf = (l) => (SUBJ_ORDER.includes(l.subject) ? l.subject : 'Other');
    let html;
    if (s) {
      const hits = labs.filter((l) => fold([...Object.values(l.title), tx(l.blurb)].join(' ')).includes(s));
      html = hits.length ? hits.slice(0, HITS).map(card).join('') : `<p class="s">${esc(u.none)}</p>`;
      if (hits.length > HITS) html += `<a class="moreln" href="labs/?lang=${cur()}&q=${encodeURIComponent($('labsQ').value.trim())}">${esc(u.moreIn(hits.length - HITS))}</a>`;
    } else {
      html = SUBJ_ORDER.map((sj) => [sj, labs.filter((l) => subjOf(l) === sj)]).filter(([, ls]) => ls.length).map(([sj, ls]) =>
        `<div class="grp">${esc(u.subj[sj] ?? sj)} · ${ls.length}</div>${ls.slice(0, cap).map(card).join('')}${
          ls.length > cap ? `<a class="moreln" href="labs/?lang=${cur()}&subject=${sj}">${esc(u.moreIn(ls.length - cap))}</a>` : ''}`).join('');
    }
    $('labsList').innerHTML = html + `<div class="foot"><span>${esc(u.more)}</span><a href="labs/?lang=${cur()}">${esc(u.all)} →</a></div>`;
  }
  function decoratePanel() {
    const body = $('panelBody'), l = byTopic.get(topic());
    if (!l || !body || body.querySelector('.labcta')) return;
    const anchor = body.querySelector('#markAll') || body.querySelector('.status') || body.querySelector('h2');
    if (!anchor) return;
    anchor.insertAdjacentHTML('afterend', `<a class="labcta" href="${href(l)}"><span class="e">${l.emoji}</span>
      <span><b>${esc(UI[cur()].open)}</b><small>${esc(tx(l.title))}</small></span><span class="go">→</span></a>`);
  }
  function decorateList() {
    const title = UI[cur()].has;
    document.querySelectorAll('#list li[data-id]').forEach((li) => {
      const l = byTopic.get(li.dataset.id);
      if (!l || li.querySelector('.labmark')) return;
      li.querySelector('.txt')?.firstChild?.after(Object.assign(document.createElement('span'), { className: 'labmark', textContent: '🧪', title }));
    });
  }

  function init() {
    document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);
    const btn = Object.assign(document.createElement('button'), { id: 'labsBtn', className: 'btn' });
    const bar = document.querySelector('.bar');
    bar.insertBefore(btn, $('views'));
    document.body.append(Object.assign(document.createElement('div'), { id: 'labsMenu', className: 'card',
      innerHTML: '<div id="labsHead"></div><input id="labsQ" type="search" autocomplete="off"><div id="labsList"></div>' }));
    $('labsQ').addEventListener('input', renderLabs);
    btn.onclick = (ev) => { ev.stopPropagation(); $('labsMenu').classList.toggle('open'); };
    $('labsMenu').addEventListener('click', (ev) => {
      if (!ev.target.closest('#labsShow')) return;
      $('labsMenu').classList.remove('open');
      try { f.labs = true; select(null); applyFilters(); } catch { /* viewer not ready yet */ }
    });
    document.addEventListener('click', (ev) => { if (!ev.target.closest('#labsMenu')) $('labsMenu').classList.remove('open'); });
    addEventListener('keydown', (ev) => { if (ev.key === 'Escape') $('labsMenu').classList.remove('open'); });
    new MutationObserver(decoratePanel).observe($('panelBody'), { childList: true });
    new MutationObserver(decorateList).observe($('list'), { childList: true });
    new MutationObserver(() => { renderBtn(); decorateList(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    renderBtn(); decoratePanel(); decorateList();
  }

  fetch('labs/registry.json').then((r) => r.json()).then((j) => {
    labs = j.labs ?? [];
    for (const l of labs) for (const t of l.topics) byTopic.set(t, l);
    if (!labs.length) return;
    // the viewer's "only topics with a lab" filter reads this set
    try { labTopics = new Set(byTopic.keys()); if (byId) applyFilters(); } catch { /* data not loaded yet: setLang() applies it */ }
    init();
  }).catch(() => { /* no labs: the viewer works as before */ });
})();
