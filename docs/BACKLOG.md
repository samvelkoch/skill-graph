# Work backlog

Open work on the viewer, the routes, the labs and the data, beyond "build more labs". Any session or
contributor can pick an item. This file is the single source of truth for these items.

The first batch (F01–F17) comes from a whole-project review on 2026-11-10 at commit `89da342`. The scenarios
were walked through at phone width (390 px) and on desktop, in Russian and partly in Hungarian. Line numbers
move, so the items name identifiers in the code to search for.

## How to use it

- Pick one item. Before starting, set its status to `in progress` with the date, in the table and in the
  item. After the merge, set it to `done · #N` (the pull request number).
- One item is one branch and one pull request, under the usual rules in `CLAUDE.md` and `CONTRIBUTING.md`
  (checks, `CHANGELOG.md`, browser QA at phone width in EN, RU and HU).
- Reproduce the problem on fresh `main` first: it may already be fixed.
- New items get the next free ID and the same fields.
- Statuses: `open`, `in progress`, `done · #N`, `won't do`, `needs a decision` (the owner decides before
  any work starts).

## Summary

| ID | Priority | Item | Status |
|---|---|---|---|
| F01 | P0 | "My child" does not work without a school programme | done · #437 |
| F02 | P0 | The first tap on "Show the picture" is lost | done · #437 |
| F03 | P0 | The viewer ignores the browser language | done · #437 |
| F04 | — | Analytics | won't do |
| F05 | P1 | The quick check does not ask about the grade's core | done · #438 |
| F06 | P1 | Meta topics as route steps | done · #439 |
| F07 | P1 | Ontario standards are not visible in the viewer | done · #438 (the chip only, no school choice: owner's decision) |
| F08 | P1 | The site says ages 4–16, the data ends at 14 | done · #437 |
| F09 | — | Lab coverage by subject and age | won't do |
| F10 | P1 | Very long lists on a phone | done · #440 |
| F11 | P2 | The phone header takes a quarter of the screen | open |
| F12 | P2 | Different navigation on the viewer and the labs pages | open |
| F13 | P2 | 152 older labs have no "Did you know?" facts | open |
| F14 | P2 | Radar axis labels are untranslated and cut off | open |
| F15 | P2 | Prerequisites that start at a later age than the topic | open |
| F16 | P2 | Curricula differ a lot in detail | open |
| F17 | P2 | Small interface fixes | in progress (2026-11-10) |

---

## F01. "My child" does not work without a school programme

- **Priority:** P0
- **Status:** done · #437
- **Problem:** the "My child" view needs a country and a grade. A parent whose country is not among the
  mapped curricula stays on the setup card forever.
- **Reproduce:** open `?view=child` in a clean profile, leave "Any curriculum (all topics)", type a name.
  There is no "Show the picture" button.
- **In the code:** `index.html`, `renderChild()`: `const setup = !f.school || kidSetup;`, and `#kidDone` is
  rendered only when `f.school` is set. The radar axes (`kidAxes()`) and `placePlan()` also depend on the
  programme.
- **Suggested fix:** a "no programme, by age" mode: ask the child's age, take the axes from the graph's
  subjects (`SUBJECTS`) and the topics from `ageRangeStart`/`ageRangeEnd`. The quick check, the by-subject
  check, "This week" and "Gaps" should all work in it.
- **Done when:** the check can be taken and the picture seen without a programme; with a programme chosen
  nothing changes.

## F02. The first tap on "Show the picture" is lost

- **Priority:** P0
- **Status:** done · #437
- **Problem:** after typing the name, the first tap on the button does nothing; only the second works.
- **Reproduce:** `?view=child`, choose "Hungary · grade 4", type a name and, with the field still focused,
  tap "Show the picture". It reproduces in Playwright with `tap`.
- **In the code:** `index.html`, the `change` handler: `if (el.id === 'kidName') { …; renderChild(); }`.
  Losing focus re-renders the card, so the button is replaced before the `click` arrives.
- **Suggested fix:** do not re-render the card when the name changes (save the name and update the heading
  only), or read the field's value in the `#kidDone` handler.
- **Done when:** one tap after typing the name opens the picture, and the name is saved.

## F03. The viewer ignores the browser language

- **Priority:** P0
- **Status:** done · #437
- **Problem:** a first visit to the viewer is always in English, even in a Russian or Hungarian browser.
  The labs do detect the language.
- **Reproduce:** a clean profile with the locale `ru-RU` or `hu-HU`, open the site root without `?lang=`.
- **In the code:** `index.html`: `let lang = params.get('lang'); if (!LANGS[lang]) lang = store.get('lang', 'en');`.
  Compare `labs/lab.js`, which reads `navigator.language`.
- **Suggested fix:** the order `?lang=`, then the saved language, then `navigator.languages`, then `en`.
  Check `labs/index.html`, `curricula/` and `changelog/` for the same.
- **Done when:** a first visit opens in the browser's language when it is EN, RU or HU, and an explicit
  choice is still remembered.

## F04. Analytics

- **Priority:** —
- **Status:** won't do (owner's decision, 2026-11-10)
- **Note:** the analytics setup in `index.html` and `labs/index.html` stays as it is.

## F05. The quick check does not ask about the grade's core

- **Priority:** P1
- **Status:** done · #438
- **Problem:** for "Hungary · grade 4" all 8 questions were about taking turns in a conversation, caring
  for a plant, drawing a scene from a story, listening to music, computers at home. None was about
  arithmetic or reading. After the check the radar shows 0–14% and "1 of 68" for mathematics, which reads
  as empty and alarming.
- **Reproduce:** `?view=child`, "Hungary · grade 4", "Start", answer the 8 questions.
- **In the code:** `index.html`, the question choice for the quick check (`kidQ`, `KQ = 8`) and
  `radarSvg()`.
- **Suggested fix:** (a) a quota per axis: most questions from the grade's main subjects (mathematics, the
  school language), one each from the others; (b) inside an axis prefer the grade's key topics (`core` in
  `school.links`, then `centrality`) over early ones; (c) after the check, show the outcome for the
  questions asked, and do not present "known out of all the grade's topics" as a score while there are few
  answers.
- **Done when:** for 3 different programmes and grades at least half of the questions are on mathematics
  and language, and the result screen after 8 answers is useful to a parent.

## F06. Meta topics as route steps

- **Priority:** P1
- **Status:** done · #439
- **Problem:** the path to "Working with Money" has two steps, "Model real problems" and "Connect maths
  with life" (names approximate). These are abstract `META` topics; the steps a parent expects (addition,
  coins) are missing.
- **Reproduce:** `?view=path&topic=mt_iQYPw8bMfN` in a clean profile.
- **In the code:** `index.html`, `routeModel` and `renderPath()`; the topic type is `type` in
  `data/topics.json` (160 `META` topics).
- **Suggested fix:** first find the cause on 5–10 ready-made routes from `data/extra/routes.json`: is it
  the edges of particular topics or a general effect of route compression. Then either leave `META` topics
  out of the steps (a separate "habits that help" block) or fix the edges of those topics. Upstream edges
  change only as deliberate data fixes.
- **Done when:** the steps of the ready-made routes are subject content; `node scripts/validate.mjs` and
  `node scripts/layout.mjs` pass if data changed.

## F07. Ontario standards are not visible in the viewer

- **Priority:** P1
- **Status:** done · #438 (the chip only, no school choice: owner's decision)
- **Problem:** after the upstream sync `data/topics.json` holds about 3,400 references to Ontario standards
  (`the-ontario-curriculum-*`), but the viewer has no such source. Topics that have only these show as
  "Marble only".
- **Reproduce:** the source filter on the map has no Canada; `STD_SRC` and `SOURCES_ALL` have no Ontario
  entry.
- **In the code:** `index.html`: `SOURCES_ALL`, `STD_SRC`, the labels `UI[lang].cn` and `UI[lang].src` in
  three languages.
- **Suggested fix:** add a source `ca` (Ontario) to the filter and the labels. Whether Canada should also
  be a choice of school in "My child" is a separate, larger job (it needs entries in
  `data/school-curricula.json`) and needs the owner's decision first.
- **Done when:** a "Canada (Ontario)" chip is in the source filter in EN, RU and HU, and the "Marble only"
  count went down.

## F08. The site says ages 4–16, the data ends at 14

- **Priority:** P1
- **Status:** done · #437
- **Problem:** the interface and the descriptions say ages 4–16, but one topic has `ageRangeStart` 15 and
  none 16. There are 180 topics for ages 13–14.
- **Reproduce:** count `ageRangeStart` over `data/topics.json` and `data/extra/topics.json`.
- **Options:** say "4–14" (or "up to grade 9"), or plan topics for 15–16 through `data/extra/`. Change
  nothing until the owner decides.
- **Done when:** the stated range matches the data.

## F09. Lab coverage by subject and age

- **Priority:** —
- **Status:** won't do (owner's decision, 2026-11-10)
- **Note:** lab topics are chosen by the project's own rule (`scripts/labs-candidates.mjs` and the
  `new-lab` skill), which stays as it is.

## F10. Very long lists on a phone

- **Priority:** P1
- **Status:** done · #440
- **Problem:** the labs overview renders every card at once: the page is about 107,000 px tall at 390 px
  (roughly 160 screens), almost one card per screen. The Routes view is about 11,000 px in one list with
  no age filter.
- **Reproduce:** `labs/` and `?view=routes` at 390 px, read `document.documentElement.scrollHeight`.
- **In the code:** `labs/index.html` (card rendering), `index.html` `renderRoutes()`.
- **Suggested fix:** overview: a compact card on phones (emoji, title and age in one or two lines, the
  blurb on tap) and rendering in portions ("Show more" or on scroll). Routes: a filter by age or grade,
  subjects collapsed by default.
- **Done when:** the first 20 labs fit in 5–6 screens; the routes of one subject open without long
  scrolling; search and "Newest first" work as before.

## F11. The phone header takes a quarter of the screen

- **Priority:** P2
- **Status:** open
- **Problem:** at 390 px the header is 4 rows (brand and buttons, views, languages, search), about 175 px
  of 664.
- **Reproduce:** any view of the viewer on a phone.
- **Suggested fix:** move the language into the "?" menu or one compact button, open search from an icon.
  Aim for 2 rows at most.
- **Done when:** the header is about 100 px tall or less, and language and search are one tap away.

## F12. Different navigation on the viewer and the labs pages

- **Priority:** P2
- **Status:** open
- **Problem:** the viewer has "Graph, Topic list, Routes, My child"; the labs overview has "Graph, Topic
  list, Labs, Curricula". Routes and My child cannot be reached from the labs, and Curricula is not
  visible from the viewer.
- **In the code:** `index.html` (`$('views')`), `labs/index.html`, `labs/switcher.js`, `curricula/`.
- **Suggested fix:** one set of sections in one order on every page.
- **Done when:** the menu is the same on the viewer, the labs overview, the curricula page and "What's
  new".

## F13. 152 older labs have no "Did you know?" facts

- **Priority:** P2
- **Status:** open
- **Problem:** the project rule is that every lab has checked facts (`lab.setFacts`). 152 labs, mostly
  built before 2026-10-25, do not call it.
- **Reproduce:** search `labs/*/index.html` for `setFacts`; the list without it starts with `magnets`,
  `seasons`, `fractions`, `moon`, `solar-scale`, `circuits`, `sound`, `falling`, `levers`.
- **Suggested fix:** batches of 10–15 labs, following the `new-lab` skill: 2–3 facts per lab, checked, with
  sources in the report, in EN, RU and HU. `robot-lab` does not use `lab.js`; count it separately.
- **Done when:** no lab is without `setFacts`, apart from deliberate exceptions. Keep the progress in the
  status: "N of 152 done".

## F14. Radar axis labels are untranslated and cut off

- **Priority:** P2
- **Status:** open
- **Problem:** with the Russian interface and a Hungarian programme, the radar axes and the bars are
  labelled in Hungarian and cut off ("Magyar nyelv é…", "Környezetismer…").
- **Reproduce:** `?lang=ru&view=child`, "Hungary · grade 4", open the picture.
- **In the code:** `index.html`, `kidAxes()` and `radarSvg()`; the subject names come from
  `data/school-curricula.json`.
- **Suggested fix:** show the subject in the interface language, with the original as a hint or a second
  line; wrap long labels onto two lines.
- **Done when:** at 390 px the labels read in full in EN, RU and HU for the hu, ru, de and fr programmes.

## F15. Prerequisites that start at a later age than the topic

- **Priority:** P2
- **Status:** open
- **Problem:** 184 edges where the prerequisite's `ageRangeStart` is greater than the topic's; 21 of them
  are `hard`, and 44 differ by 2 years or more. Example: "Animal Classification Vocabulary" (7) before
  "Grouping Living Things" (4). This spoils the order of route steps.
- **Reproduce:** compare `ageRangeStart` at both ends of every edge in `data/dependencies.json` and
  `data/extra/dependencies.json`.
- **Suggested fix:** go through the 21 hard edges by hand first: reverse, soften to `soft`, or correct the
  age. Add a warning for new ones to `scripts/validate.mjs`. Upstream edges change only as deliberate data
  fixes.
- **Done when:** there are no hard inversions, and the rest are fixed or kept on purpose; `validate.mjs`
  and `layout.mjs` pass.

## F16. Curricula differ a lot in detail

- **Priority:** P2
- **Status:** open
- **Problem:** the number of items in `data/school-curricula.json` varies widely: Sweden 93, Finland 97,
  Singapore 114, Estonia 145 against Russia 1,428 and the US 1,452. For the thin ones the radar and "this
  grade's curriculum" are coarse.
- **Suggested fix:** the cheap part: in "My child", say so for programmes with little detail ("an outline,
  not broken down by topic"). The expensive part, deepening the programmes one by one, starts only when the
  owner asks for it.
- **Done when:** the note is shown in EN, RU and HU for programmes under the chosen threshold.

## F17. Small interface fixes

- **Priority:** P2
- **Status:** in progress (2026-11-10)
- **To do (one pull request is fine):**
  1. The labs button shows 503, while 499 are available in Russian (4 labs are Hungarian only). Count with
     the `lang` field of `labs/registry.json`.
  2. The notice "Quick check done: 8 answers" covers the page heading and stays when the next screen opens.
     Move it, and remove it on a screen change.
  3. In the Graph view on a phone, the subtitle under the heading overlaps the dots of the graph.
- **Done when:** all three are checked at 390 px in EN, RU and HU.
