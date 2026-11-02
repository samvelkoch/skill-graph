// "Where next" under every lab built on shell(): up to three labs to look at first (on the prerequisites of this lab's
// topics: "too hard?") and up to three to go on to (on the topics that build on it: "too easy?"). The lists come from
// labs/catalog.json (`before` / `after`, made by scripts/labs-catalog.mjs from the graph), so new labs get them for free.
const UI = {
  en: { head: 'Where next', hard: 'Too hard? Look at these first', easy: 'Too easy? Go further' },
  ru: { head: 'Куда дальше', hard: 'Трудно? Сначала загляни сюда', easy: 'Легко? Иди дальше' },
  hu: { head: 'Merre tovább?', hard: 'Nehéz? Előbb nézd meg ezeket', easy: 'Könnyű? Lépj tovább' },
};
const base = new URL('./', import.meta.url); // the labs/ folder
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const cur = () => (UI[document.documentElement.lang] ? document.documentElement.lang : 'en');
const tx = (o) => o?.[cur()] ?? o?.en ?? '';

async function main() {
  const get = (f) => fetch(new URL(f, base)).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  const [reg, cat] = await Promise.all([get('registry.json'), get('catalog.json')]);
  const foot = document.getElementById('foot'); // drawn by shell(), which runs while the JSON loads
  if (!foot) return; // a lab with its own chrome
  const labs = reg?.labs ?? [], info = cat?.labs ?? {};
  const byId = new Map(labs.map((l) => [l.id, l]));
  const me = labs.find((l) => location.pathname.includes(`/${l.path.replace(/\/$/, '')}/`));
  if (!me || !info[me.id]) return;
  // a lab made for one language's speakers is left out in other UI languages, as in the "Other labs" menu
  const pick = (ids) => (ids ?? []).map((id) => byId.get(id)).filter((l) => l && (!l.lang || l.lang === cur() || l.lang === me.lang));
  const href = (l) => `${new URL(l.path.replace(/^labs\//, ''), base).pathname}?lang=${cur()}`;
  const item = (l) => { const a = info[l.id]?.age;
    return `<a class="it" href="${href(l)}"><span class="e">${l.emoji}</span><span class="t">${esc(tx(l.title))}</span>${a ? `<small>${a[0]}–${a[1]}</small>` : ''}</a>`; };
  const box = Object.assign(document.createElement('section'), { id: 'next', className: 'next' });
  foot.before(box);
  const render = () => {
    const u = UI[cur()], before = pick(info[me.id].before), after = pick(info[me.id].after);
    box.hidden = !before.length && !after.length;
    box.innerHTML = `<h2>${esc(u.head)}</h2><div class="cols">`
      + (before.length ? `<div class="col card"><h3>🧗 ${esc(u.hard)}</h3>${before.map(item).join('')}</div>` : '')
      + (after.length ? `<div class="col card"><h3>🚀 ${esc(u.easy)}</h3>${after.map(item).join('')}</div>` : '')
      + '</div>';
  };
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  render();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', main); else main();
