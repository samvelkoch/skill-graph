// Quick access to the labs from the viewer (../index.html), driven by labs/registry.json:
// a "Labs" button with a menu in the top bar, an "Open the explorer" card in a topic's panel and a 🧪 mark in the list.
// It only reads the viewer's globals (lang, focus) and decorates what the viewer renders, so the viewer needs no other change.
(() => {
  const UI = {
    en: { labs: 'Labs', title: 'Interactive explainers', sub: 'Learn a topic by playing with it.', open: 'Open the explorer',
          topics: (n) => `${n} ${n === 1 ? 'topic' : 'topics'}`, all: 'All labs', more: 'More explainers are on the way.', has: 'Has an interactive explainer' },
    ru: { labs: 'Лаборатории', title: 'Интерактивные объяснения', sub: 'Разберись в теме, играя с ней.', open: 'Открыть лабораторию',
          topics: (n) => `${n} ${n % 10 === 1 && n % 100 !== 11 ? 'тема' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'темы' : 'тем'}`,
          all: 'Все лаборатории', more: 'Скоро будут и другие.', has: 'Есть интерактивное объяснение' },
    hu: { labs: 'Laborok', title: 'Interaktív magyarázók', sub: 'Értsd meg a témát játék közben.', open: 'A labor megnyitása',
          topics: (n) => `${n} téma`, all: 'Minden labor', more: 'Hamarosan jönnek az újak.', has: 'Interaktív magyarázó tartozik hozzá' },
  };
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // the viewer's own top-level `let lang` / `let focus` are visible to this classic script
  const cur = () => { try { return UI[lang] ? lang : 'en'; } catch { return 'en'; } };
  const topic = () => { try { return focus; } catch { return null; } };
  const href = (l) => l.path + (cur() !== 'en' ? `?lang=${cur()}` : '');
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
    .labcard { display: flex; gap: 12px; align-items: flex-start; padding: 11px 12px; border-radius: 14px; border: 1px solid var(--stroke);
      text-decoration: none; color: var(--ink); margin-bottom: 8px; transition: background .15s, border-color .15s; }
    .labcard:hover { background: var(--hover); border-color: var(--stroke2); }
    .labcard .e { font-size: 26px; line-height: 1.1; }
    .labcard b { display: block; font-size: 14px; }
    .labcard small { display: block; color: var(--mut); font-size: 12px; line-height: 1.45; margin-top: 2px; }
    .labcard .m { display: flex; gap: 8px; align-items: center; margin-top: 6px; font-size: 11px; color: var(--faint); font-weight: 700; }
    #labsMenu .foot { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; font-size: 12px; color: var(--faint); }
    #labsMenu .foot a { color: var(--soft); font-weight: 700; text-decoration: none; }
    #labsMenu .foot a:hover { color: #fff; }
    .labcta { display: flex; align-items: center; gap: 12px; margin: 2px 0 14px; padding: 12px 14px; border-radius: 14px; text-decoration: none;
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
    $('labsMenu').innerHTML = `<h3>${esc(u.title)}<span style="color:var(--red)">.</span></h3><p class="s">${esc(u.sub)}</p>
      ${labs.map((l) => `<a class="labcard" href="${href(l)}"><span class="e">${l.emoji}</span><span><b>${esc(tx(l.title))}</b>
        <small>${esc(tx(l.blurb))}</small><span class="m">${esc(u.topics(l.topics.length))}</span></span></a>`).join('')}
      <div class="foot"><span>${esc(u.more)}</span><a href="labs/${cur() !== 'en' ? `?lang=${cur()}` : ''}">${esc(u.all)} →</a></div>`;
  }
  function decoratePanel() {
    const body = $('panelBody'), l = byTopic.get(topic());
    if (!l || !body || body.querySelector('.labcta')) return;
    const h2 = body.querySelector('h2');
    if (!h2) return;
    h2.insertAdjacentHTML('afterend', `<a class="labcta" href="${href(l)}"><span class="e">${l.emoji}</span>
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
    document.body.append(Object.assign(document.createElement('div'), { id: 'labsMenu', className: 'card' }));
    btn.onclick = (ev) => { ev.stopPropagation(); $('labsMenu').classList.toggle('open'); };
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
    if (labs.length) init();
  }).catch(() => { /* no labs: the viewer works as before */ });
})();
