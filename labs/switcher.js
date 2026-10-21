// "Other labs" menu for every lab page, built to stay usable with hundreds of labs: a 🧪 button in the top bar opens
// a search box, the labs closest to this one in the skill graph (labs/catalog.json) and a few more from the same subject;
// the whole collection lives in the overview (labs/index.html). lab.js imports this file, so labs built on shell()
// get it for free; a lab with its own chrome adds <script type="module" src="../switcher.js"></script>.
const UI = {
  en: { btn: 'Other labs', find: 'Find a lab…', near: 'Nearby in the graph', same: (s) => `More in ${s}`, none: 'No labs found.',
        all: (n) => `All ${n} labs →`, more: (n) => `${n} more in the overview →`,
        subj: { Science: 'Science', Mathematics: 'Mathematics', Computing: 'Computing', 'Life Skills': 'Life skills', Other: 'Other' } },
  ru: { btn: 'Другие лаборатории', find: 'Найти лабораторию…', near: 'Рядом в графе', same: (s) => `Ещё: ${s.toLowerCase()}`, none: 'Ничего не нашлось.',
        all: (n) => `Все лаборатории (${n}) →`, more: (n) => `Ещё ${n} в обзоре →`,
        subj: { Science: 'Естествознание', Mathematics: 'Математика', Computing: 'Информатика', 'Life Skills': 'Жизненные навыки', Other: 'Другое' } },
  hu: { btn: 'További laborok', find: 'Labor keresése…', near: 'A közelben a térképen', same: (s) => `További: ${s.toLowerCase()}`, none: 'Nincs találat.',
        all: (n) => `Mind a ${n} labor →`, more: (n) => `Még ${n} az áttekintésben →`,
        subj: { Science: 'Természettudomány', Mathematics: 'Matematika', Computing: 'Informatika', 'Life Skills': 'Életvitel', Other: 'Egyéb' } },
};
const SAME = 5, HITS = 12;
const base = new URL('./', import.meta.url); // the labs/ folder
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const cur = () => (UI[document.documentElement.lang] ? document.documentElement.lang : 'en');
const tx = (o) => o?.[cur()] ?? o?.en ?? '';
const fold = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const css = `
  #labSw { position: relative; display: inline-flex; align-items: center; gap: 7px; height: 40px; padding: 0 14px; border-radius: 999px;
    border: 1px solid var(--stroke2, rgba(130,145,190,.35)); background: var(--panel, rgba(14,17,28,.78)); color: var(--ink, #EDEFF7);
    font: 800 13px/1 var(--sans, sans-serif); cursor: pointer; white-space: nowrap; }
  #labSw:hover { background: rgba(130, 145, 190, .18); }
  #labSwMenu { position: fixed; top: 70px; right: 20px; width: min(380px, calc(100vw - 28px)); max-height: calc(100vh - 90px); overflow: auto;
    padding: 12px; z-index: 50; display: none; border-radius: 20px; border: 1px solid var(--stroke, rgba(130,145,190,.16));
    background: rgba(12, 15, 25, .97); box-shadow: 0 18px 50px rgba(0, 0, 0, .55); font-family: var(--sans, sans-serif); }
  #labSwMenu.open { display: block; }
  #labSwQ { width: 100%; padding: 9px 14px; border-radius: 999px; border: 1px solid var(--stroke2, rgba(130,145,190,.35)); outline: none;
    background: rgba(20, 24, 38, .8); color: var(--ink, #EDEFF7); font: 600 14px var(--sans, sans-serif); }
  #labSwQ:focus { border-color: var(--red, #FF3B30); }
  #labSwMenu .grp { font-size: 10px; letter-spacing: .16em; text-transform: uppercase; color: var(--faint, #646C84); font-weight: 800; margin: 12px 4px 4px; }
  #labSwMenu a.it { display: flex; gap: 10px; align-items: center; padding: 7px 10px; border-radius: 12px; text-decoration: none;
    color: var(--ink, #EDEFF7); font-size: 14px; font-weight: 700; border: 1px solid transparent; }
  #labSwMenu a.it:hover { background: rgba(130, 145, 190, .10); border-color: var(--stroke, rgba(130,145,190,.16)); }
  #labSwMenu a.it .e { font-size: 22px; width: 28px; text-align: center; flex: none; }
  #labSwMenu a.it small { margin-left: auto; color: var(--faint, #646C84); font: 700 11px var(--sans, sans-serif); white-space: nowrap; }
  #labSwMenu .none { color: var(--mut, #98A0B8); padding: 14px 6px 4px; font-size: 13px; }
  #labSwMenu .all { display: block; text-align: center; margin-top: 12px; padding: 8px; border-radius: 999px; font-size: 12.5px; font-weight: 800;
    color: var(--ink, #EDEFF7); text-decoration: none; border: 1px solid var(--stroke2, rgba(130,145,190,.35)); }
  #labSwMenu .all:hover { background: rgba(130, 145, 190, .18); }
  @media (max-width: 760px) { #labSw .t { display: none; } #labSw { padding: 0 12px; } #labSwMenu { top: 64px; right: 14px; } }`;

async function main() {
  const get = (f) => fetch(new URL(f, base)).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  const [reg, cat] = await Promise.all([get('registry.json'), get('catalog.json')]);
  const labs = reg?.labs ?? [];
  const brand = document.getElementById('brand');
  if (labs.length < 2 || !brand) return;
  const info = cat?.labs ?? {}; // optional: without it there is no "nearby", only the same subject and search
  const byId = new Map(labs.map((l) => [l.id, l]));
  const me = labs.find((l) => location.pathname.includes(`/${l.path.replace(/\/$/, '')}/`));
  const href = (l) => `${new URL(l.path.replace(/^labs\//, ''), base).pathname}?lang=${cur()}`;
  const ages = (l) => info[l.id]?.age;
  const overview = (q) => `${base.pathname}?lang=${cur()}${q ? `&q=${encodeURIComponent(q)}` : ''}`;

  document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);
  const btn = Object.assign(document.createElement('button'), { id: 'labSw', type: 'button' });
  brand.after(btn);
  const menu = Object.assign(document.createElement('div'), { id: 'labSwMenu' });
  menu.innerHTML = '<input id="labSwQ" type="search" autocomplete="off"><div id="labSwList"></div>';
  document.body.append(menu);
  const q = menu.querySelector('#labSwQ'), list = menu.querySelector('#labSwList');

  const item = (l) => { const a = ages(l); return `<a class="it" href="${href(l)}"><span class="e">${l.emoji}</span>${esc(tx(l.title))}${a ? `<small>${a[0]}–${a[1]}</small>` : ''}</a>`; };
  const render = () => {
    const u = UI[cur()], s = fold(q.value.trim());
    btn.innerHTML = `🧪 <span class="t">${esc(u.btn)}</span> ▾`;
    btn.title = u.btn; q.placeholder = u.find;
    let html;
    if (s) {
      // every language's title, plus this language's blurb
      const hits = labs.filter((l) => l !== me && fold([...Object.values(l.title), tx(l.blurb)].join(' ')).includes(s));
      html = hits.length ? hits.slice(0, HITS).map(item).join('') + (hits.length > HITS ? `<a class="all" href="${overview(q.value.trim())}">${esc(u.more(hits.length - HITS))}</a>` : '')
        : `<div class="none">${esc(u.none)}</div>`;
    } else {
      const near = (me ? info[me.id]?.near ?? [] : []).map((id) => byId.get(id)).filter(Boolean);
      const taken = new Set([me, ...near]);
      const mid = me && ages(me) ? (ages(me)[0] + ages(me)[1]) / 2 : 0;
      const same = labs.filter((l) => !taken.has(l) && l.subject === me?.subject)
        .sort((a, b) => Math.abs((ages(a)?.[0] ?? 0) - mid) - Math.abs((ages(b)?.[0] ?? 0) - mid)).slice(0, SAME);
      html = (near.length ? `<div class="grp">${esc(u.near)}</div>${near.map(item).join('')}` : '')
        + (same.length ? `<div class="grp">${esc(u.same(u.subj[me.subject] ?? me.subject))}</div>${same.map(item).join('')}` : '');
    }
    list.innerHTML = html + `<a class="all" href="${overview()}">${esc(u.all(labs.length))}</a>`;
  };
  btn.onclick = (ev) => {
    ev.stopPropagation();
    if (menu.classList.toggle('open') && matchMedia('(hover: hover)').matches) q.focus();
  };
  q.addEventListener('input', render);
  q.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') { const a = list.querySelector('a.it') ?? list.querySelector('a.all'); if (a) location.href = a.href; }
  });
  document.addEventListener('click', (ev) => { if (!ev.target.closest('#labSwMenu')) menu.classList.remove('open'); });
  addEventListener('keydown', (ev) => { if (ev.key === 'Escape') menu.classList.remove('open'); });
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  render();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', main); else main();
