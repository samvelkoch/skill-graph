# The shared skeleton: `labs/lab.js`

Read `labs/lab.js` in full before coding; it is short. `labs/cubes/index.html` shows the whole idiom (views, a predict-before-reveal question, `showStage()`, secrets). Copy the wiring, not the scene.

```js
import { shell, canvasLoop, secretLab, sfx, store, $, esc, clamp, lerp, ruPlural, lang } from '../lab.js';
```

## Page structure

```js
const T = { en: { … }, ru: { … }, hu: { … } };     // all text
const TOPICS = [                                    // the lab's topics, as in labs/registry.json
  { id: 'mt_9NvuqZKNiV', en: 'Magnetic Materials', ru: 'Магнитные материалы', hu: 'Mágneses anyagok' },
];
const lab = shell({ key: 'magnets', T, topics: TOPICS, views: ['table', 'inside'], onLang: render, onView: render });
const secret = secretLab('magnets', () => ({
  secrets: [{ emo: '🧲', title: T[lang].secrets.a[0], desc: T[lang].secrets.a[1] }, { … }],
  questions: T[lang].quiz,
}), () => render());
```

## `shell(cfg)`

`cfg = { key, T, topics, views, onLang, onView }`. Draws the top bar (brand back to the map, view tabs, language switch, sound), the hero, the footer with links to the lab's topics on the map, and the "other labs" menu. It creates these elements for you:

| Element | Use |
|---|---|
| `#stage` with `<canvas id="cv">` and `#overlay` | the main picture; HTML on top goes in `#overlay` |
| `#ctrl`: `#val`, `#valSub`, `#pill`, `#ctrlBody` | the readout and your controls (put sliders and chips in `#ctrlBody`) |
| `#state` card | `lab.setState({ emo, title, lead, body, extra })` |
| `#gauge` | `lab.setGauge(frac, ticks, cap)`; hide it with `#gauge { display: none }` if unused |

`lab.setFacts([{ emo, text, src }])` fills the "Did you know?" box under the state card (see "Fun facts" in [SKILL.md](SKILL.md)); `[]` hides it. Call it from `render()` with `T[lang]` text, so it follows the language and the view; a list with more than one fact gets an "Another fact" button.

`lab.setReadout(val, sub, pill, color)` fills the readout; `lab.view` is the current view; `lab.renderChrome()` redraws the chrome.

`T[lang]` must contain `name` (page title), `title` (hero heading), `lines` (hero lines, `[[bold, rest], …]`) and `views` (`{ key: tab label }`). Everything else in `T` is yours.

`lang` is a live binding: read `T[lang]` inside `render()`, never cache it.

## `secretLab(key, getContent, onUnlock)`

Runs the intro, the quiz and the unlock. `getContent()` returns `{ secrets: [two × {emo, title, desc}], questions }` with `questions = [three × { q, opts: [...], ok: index, hint }]`. `hint` is one sentence pointing at what to look at in the lab, never the answer. A wrong tap crosses the option out; the first one says "Not quite…", the second shows `💡 hint` (a generic nudge if there is none). On unlock it stores the flag, records the date and the number of wrong taps (`sg-lab:done:<key>`, shown on the map as "easily" / "with hints"), and marks the lab's topics as "learning" in the map's progress (`localStorage['skillgraph.progress']`); do not reimplement that.

A week later the map's lab card turns into "Time for a second look" and opens the lab with `?revisit=1`: the shell asks the same questions again; all right on the first try turns the lab's "learning" topics into "known". This needs nothing from the lab.

It returns `{ unlocked(), open() }`. The two secret experiments are always-visible buttons that show 🔒 until unlocked; pressing a locked one calls `secret.open()`.

## Helpers

- `canvasLoop(canvas, draw)`: a DPR-aware animation loop, `draw(ctx, w, h, dt, t)`, resizes with its box. Inline SVG or HTML in `#overlay` is fine instead when it suits the picture.
- `sfx.tick / click / snap / push / good / bad`: tiny synthesized sounds, off until the child turns sound on.
- `store.get(k, default)` / `store.set(k, v)`: small per-lab memory that survives a missing `localStorage`.
- `$(id)`, `esc(s)` (escape before putting text into HTML), `clamp(x, lo, hi)` (all three arguments), `lerp(a, b, t)`, `ruPlural(n, one, few, many)` for Russian plurals.
