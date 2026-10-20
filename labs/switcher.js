// "Other labs" menu for every lab page, driven by labs/registry.json: a 🧪 button in the top bar opens the list of all labs
// (the current one marked), with previous / next links. lab.js imports it, so labs built on shell() get it for free;
// a lab with its own chrome adds <script type="module" src="../switcher.js"></script>.
const UI = {
  en: { btn: 'Other labs', title: 'All labs', prev: 'Previous', next: 'Next', all: 'Labs overview',
        subj: { Science: 'Science', Mathematics: 'Mathematics', Computing: 'Computing', Other: 'Other' } },
  ru: { btn: 'Другие лаборатории', title: 'Все лаборатории', prev: 'Предыдущая', next: 'Следующая', all: 'Обзор лабораторий',
        subj: { Science: 'Естествознание', Mathematics: 'Математика', Computing: 'Информатика', Other: 'Другое' } },
  hu: { btn: 'További laborok', title: 'Minden labor', prev: 'Előző', next: 'Következő', all: 'Laborok áttekintése',
        subj: { Science: 'Természettudomány', Mathematics: 'Matematika', Computing: 'Informatika', Other: 'Egyéb' } },
};
const SUBJ_ORDER = ['Science', 'Mathematics', 'Computing', 'Other'];
const base = new URL('./', import.meta.url); // the labs/ folder
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const cur = () => (UI[document.documentElement.lang] ? document.documentElement.lang : 'en');
const tx = (o) => o?.[cur()] ?? o?.en ?? '';

const css = `
  #labSw { position: relative; display: inline-flex; align-items: center; gap: 7px; height: 40px; padding: 0 14px; border-radius: 999px;
    border: 1px solid var(--stroke2, rgba(130,145,190,.35)); background: var(--panel, rgba(14,17,28,.78)); color: var(--ink, #EDEFF7);
    font: 800 13px/1 var(--sans, sans-serif); cursor: pointer; white-space: nowrap; }
  #labSw:hover { background: rgba(130, 145, 190, .18); }
  #labSwMenu { position: fixed; top: 70px; right: 20px; width: min(380px, calc(100vw - 28px)); max-height: calc(100vh - 90px); overflow: auto;
    padding: 14px; z-index: 50; display: none; border-radius: 20px; border: 1px solid var(--stroke, rgba(130,145,190,.16));
    background: rgba(12, 15, 25, .97); box-shadow: 0 18px 50px rgba(0, 0, 0, .55); font-family: var(--sans, sans-serif); }
  #labSwMenu.open { display: block; }
  #labSwMenu h3 { font: 500 24px/1.1 var(--serif, Georgia, serif); margin: 2px 4px 8px; color: #fff; }
  #labSwMenu h3 i { font-style: normal; color: var(--red, #FF3B30); }
  #labSwMenu .grp { font-size: 10px; letter-spacing: .16em; text-transform: uppercase; color: var(--faint, #646C84); font-weight: 800; margin: 10px 4px 4px; }
  #labSwMenu a.it { display: flex; gap: 10px; align-items: center; padding: 7px 10px; border-radius: 12px; text-decoration: none;
    color: var(--ink, #EDEFF7); font-size: 14px; font-weight: 700; border: 1px solid transparent; }
  #labSwMenu a.it:hover { background: rgba(130, 145, 190, .10); border-color: var(--stroke, rgba(130,145,190,.16)); }
  #labSwMenu a.it.on { border-color: var(--red, #FF3B30); background: rgba(255, 59, 48, .12); }
  #labSwMenu a.it .e { font-size: 22px; width: 28px; text-align: center; }
  #labSwMenu .nav { display: flex; gap: 8px; margin-top: 12px; }
  #labSwMenu .nav a { flex: 1; text-align: center; padding: 8px; border-radius: 999px; border: 1px solid var(--stroke2, rgba(130,145,190,.35));
    color: var(--ink, #EDEFF7); text-decoration: none; font-size: 12.5px; font-weight: 800; }
  #labSwMenu .nav a:hover { background: rgba(130, 145, 190, .18); }
  #labSwMenu .all { display: block; text-align: center; margin-top: 10px; font-size: 12px; font-weight: 700; color: var(--mut, #98A0B8); }
  @media (max-width: 760px) { #labSw .t { display: none; } #labSw { padding: 0 12px; } #labSwMenu { top: 64px; right: 14px; } }`;

async function main() {
  const reg = await fetch(new URL('registry.json', base)).then((r) => r.json()).catch(() => null);
  const labs = reg?.labs ?? [];
  const brand = document.getElementById('brand');
  if (labs.length < 2 || !brand) return;
  // labs in menu order (grouped by subject), so previous / next walk the same list the menu shows
  const order = SUBJ_ORDER.flatMap((sj) => labs.filter((l) => (SUBJ_ORDER.includes(l.subject) ? l.subject : 'Other') === sj));
  const here = order.findIndex((l) => location.pathname.includes(`/${l.path.replace(/\/$/, '')}/`));
  const href = (l) => `${new URL(l.path.replace(/^labs\//, ''), base).pathname}?lang=${cur()}`;

  document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);
  const btn = Object.assign(document.createElement('button'), { id: 'labSw', type: 'button' });
  brand.after(btn);
  const menu = Object.assign(document.createElement('div'), { id: 'labSwMenu', role: 'menu' });
  document.body.append(menu);

  const render = () => {
    const u = UI[cur()];
    btn.innerHTML = `🧪 <span class="t">${esc(u.btn)}</span> ▾`;
    btn.title = u.btn;
    const prev = here >= 0 ? order[(here - 1 + order.length) % order.length] : null;
    const next = here >= 0 ? order[(here + 1) % order.length] : null;
    menu.innerHTML = `<h3>${esc(u.title)}<i>.</i></h3>${SUBJ_ORDER.filter((sj) => order.some((l) => (l.subject ?? 'Other') === sj)).map((sj) =>
      `<div class="grp">${esc(u.subj[sj])}</div>${order.filter((l) => (l.subject ?? 'Other') === sj).map((l) =>
        `<a class="it${l === order[here] ? ' on' : ''}" href="${href(l)}"><span class="e">${l.emoji}</span>${esc(tx(l.title))}</a>`).join('')}`).join('')}
      ${prev ? `<div class="nav"><a href="${href(prev)}">← ${esc(u.prev)}</a><a href="${href(next)}">${esc(u.next)} →</a></div>` : ''}
      <a class="all" href="${base.pathname}?lang=${cur()}">${esc(u.all)} →</a>`;
  };
  btn.onclick = (ev) => { ev.stopPropagation(); menu.classList.toggle('open'); if (menu.classList.contains('open')) menu.querySelector('a.on')?.scrollIntoView({ block: 'nearest' }); };
  document.addEventListener('click', (ev) => { if (!ev.target.closest('#labSwMenu')) menu.classList.remove('open'); });
  addEventListener('keydown', (ev) => { if (ev.key === 'Escape') menu.classList.remove('open'); });
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  render();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', main); else main();
