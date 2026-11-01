---
name: new-lab
description: Build a new interactive lab for Skill Graph (labs/<id>/), or rework an existing one. Covers choosing the topic, writing the main idea and the picture before any code, researching misconceptions, building on labs/lab.js with EN/RU/HU text, registering it, and checking it at phone width. Use whenever someone asks to add, build, design or improve a lab.
---

# New lab

A lab is one phone-first page that makes **one main idea** obvious to a child with **one picture** they can play with. A parent uses the map; a child uses the labs. No accounts, no points, no ads.

Work in this order and do not skip ahead to code: most bad labs come from a mechanic chosen before the idea.

Two companion files in this folder:
- [shell-api.md](shell-api.md): the shared skeleton in `labs/lab.js`. Read it, and `labs/lab.js` itself, before you write code.
- [pitfalls.md](pitfalls.md): lessons from QA of 100+ labs and the visual-quality bar. Read it before you build and again before you finish.

## 1. Choose the topic

```bash
node scripts/labs-candidates.mjs                 # top candidates (default ages 6-10)
node scripts/labs-candidates.mjs --n 40 --age 8-12
node scripts/labs-candidates.mjs --subject Science --json
```

Pick from the top ~20 by this rule: **the topic unlocks many others, has no lab yet, sits in the target ages, and its main idea can be made obvious with a picture.**

- **The picture test decides.** A high-ranking topic without an obvious picture is skipped.
- Ages 6–10 are the starting focus, not a limit. Other ages are fine when asked for or when good 6–10 candidates run thin.
- Prefer topics next to existing labs (the `near labs` column), so the nearby-labs menu stays connected.
- Out of scope: vocabulary topics (type `LANGUAGE`, "Vocabulary" in the name), meta-cognitive topics (type `META`, the "Learning to Learn" subject), English phonics/spelling/handwriting/grammar (native-English literacy does not transfer to RU/HU children), native-language grammar in "Language & Literature". Reading comprehension, story structure, cause and effect, folklore and genres are fine. The script applies these filters already.
- Exception, low priority: labs for one language's own school curriculum (e.g. Hungarian). Mark them in the registry with `"lang": "<code>"` and that language as `subject`; explanations stay in EN/RU/HU, the material is in that language. The overview, the map panel and the lab menu show them normally in that UI language and in a collapsed section in the others.
- Stages of one series ("… (age 8+)") are one row (`stages` column); one lab can cover the series.

## 2. Write the idea before any code

For each lab write down, and get it agreed (an issue with the "New lab" template, or the person who asked):

1. **Main idea**: one sentence the child should walk away with.
2. **Supporting ideas**: as many as the topic needs; they live in further views and the two secret experiments.
3. **The picture**: what the child sees and does that makes the main idea obvious. Then the interaction. Do not clone another lab's mechanic for a different idea.
4. **The prediction**: what the child answers or builds while the answer is hidden (a curtain over the sky, a fence shown as `? m`, closed layers), before the picture reveals it. When the main idea is a **rule** (a pattern, a function, a sorting rule, a cause and its effect), prefer **find the rule**: the child tries inputs and watches the outputs while the rule stays hidden, predicts the next output, and the rule is named only after a right prediction or a "Show the rule" tap. Discovering a rule teaches more than being told it; the Formula Machine (`labs/formulas`) works this way.
5. **Views** (tabs), the **two secret experiments**, and the **three quiz questions**.
6. **Fun facts**: 1–3 per view (see "Fun facts" below), with a source each.
7. **Depth**: the age band from the table below and how the lab meets it.
8. **Sources** for every fact.

Pitch language, numbers and difficulty to the age range of the lab's topics; the curriculum decides the age. Topics of different ages can be split across views.

### Depth grows with the age and the concept

The lab grows with the idea. A 6-year-old gets one object and one action; a 14-year-old gets a small model to run. Choose the depth by the youngest age of the lab's topics:

| Ages | Variables the child controls | Views | The picture | Numbers |
|---|---|---|---|---|
| 5–8 | 1 | 2–3 | one object that changes; tap or drag | counts, "more / less", no units or simple ones |
| 9–11 | 1–2 | 3 | the object plus one readout or simple chart that moves with it | real units, simple measurements |
| 12–16 | 2–4 | 3–4 | a running model or simulation with **two linked representations** (e.g. the scene and its graph, the map and its cross-section, the particles and the formula) | real data and formulas; the child changes a parameter and predicts the curve, not only a single value |

For 12+ labs:
- At least one view is a **simulation** the child can run with several settings, and the readouts show the quantities the curriculum names (pH, net force in N, gradient, density per km²…).
- Predictions ask for the shape or the trend ("where will the line cross?", "which way will it accelerate?"), not only a single number.
- One view puts the idea in a **real-world setting** with real numbers (a city, a country, a price list), with the source in the state card or a fun fact.
- Text can be denser and use the subject's real terms, introduced once in the state card. Still one main idea per lab.

Do not go the other way: a 7-year-old's lab is not made "better" by more sliders.

### Fun facts

Every lab has a few "Did you know?" facts (`lab.setFacts`, see [shell-api.md](shell-api.md)): 1–3 per view, shown under the state card.
- A fact is **true, checked and sourced** (the source goes in `src` and in the PR). No "experts say", no invented records.
- Good facts surprise or widen the view: a record, a real place, the history of the idea, a link to everyday life.
- **Where countries teach the same thing differently, say so in a fact instead of choosing one version silently**: climate belts (5 belts of the ancient Greeks, 7 main + 6 transitional belts after Alisov in Russian schools, 3 zones split into belts in Hungarian schools, Köppen’s 5 groups), the decimal comma or point, the letters in y = kx + b / y = mx + c. The lab keeps one simple model; the fact names the others and why both are right.
- Facts never answer a question of the lab or its quiz.

## 3. Research

Mathematics and Science topics have Marble's teaching research in `data/teaching-research.json` (23 MB: never open it whole; query it):

```bash
node -e "const id=process.argv[1];const r=require('./data/teaching-research.json').records.find(x=>x.topicId===id);console.log(JSON.stringify(r&&{misconceptions:r.pedagogy.commonMisconceptions,errors:r.assess.errorPatterns,activities:r.learn.activities,sources:r.sources},null,1))" mt_XXXXXXXXXX
```

- Use `commonMisconceptions` and `errorPatterns` for the prediction task and the quiz options; `activities` are ideas, not a script.
- The research is agent-authored and not empirically validated: check the facts against real sources.
- Topic names, descriptions and evidence are in `data/topics.json` (and `data/extra/topics.json` for added topics); read them with a small query, not the whole file.

## 4. Build

One folder, one page: `labs/<id>/index.html`. Copy the `<head>` pattern of `labs/cubes/index.html` (the Google tag snippet right after `<head>`, viewport meta, the Google Fonts link, `../lab.css`), add the lab's own `<style>`, and one `<script type="module">` that imports from `../lab.js`.

- `shell({ key, T, topics, views, onLang, onView })` draws the chrome; `secretLab(key, getContent, onUnlock)` runs the quiz that unlocks the secrets and marks the lab's topics "Learning" on the map. Details: [shell-api.md](shell-api.md).
- **All text in one `T` object** with `en`, `ru` and `hu`, chosen by `?lang=`. Children are addressed informally (RU «ты», HU tegező). A right answer's verdict is `Right!` / `Верно!` / `Így van!`.
- **Predict, then reveal.** While the child predicts, the answer is fully hidden: covered by an opaque element or not drawn. Feedback is visual first: the scene shows what really happens, then a short verdict.
- **Quiz questions target typical misconceptions**, not recall of numbers shown on the page. Give each one a `hint`: one short sentence that points at what to look at in the lab, never the answer. The shell shows it after the second wrong tap (the first wrong tap only crosses the option out).
- **Phone first:** 375 px wide, no horizontal scroll, tap targets ≥ 36 px, canvas text ≥ 12 px.
- **The main picture must look crafted**: gradients, light and shadow, a small palette, eased motion. See "Visual quality" in [pitfalls.md](pitfalls.md).
- No new dependencies, no build step, no test harnesses.

## 5. Register

Append one entry to `labs/registry.json`:

```json
{ "id": "magnets", "path": "labs/magnets/", "emoji": "🧲", "subject": "Science", "added": "2026-11-01",
  "title": { "en": "Magnet Lab", "ru": "Магнитная лаборатория", "hu": "Mágneslabor" },
  "blurb": { "en": "One sentence for the overview card.", "ru": "…", "hu": "…" },
  "topics": ["mt_9NvuqZKNiV", "mt_jgNB2752b9"] }
```

`added` is the day the lab is added (YYYY-MM-DD): the overview's "Newest first" order groups labs by it, and the latest day's labs get a "New" badge. Add `"lang": "<code>"` only for a lab made for one language's speakers. Then regenerate the catalog (never edit it by hand) and commit both files:

```bash
node scripts/labs-catalog.mjs
```

The title and blurb must not answer any question in the lab or its quiz.

## 6. Check

```bash
npm run check        # dataset, translations, lab catalog up to date, every page script parses, Robot Lab
```

Then, in a browser, serve the repo (`python3 -m http.server 8000`) and open `http://localhost:8000/labs/<id>/?lang=en`, then `ru` and `hu`, at phone width (≈375 px):

- the picture makes the main idea obvious; nothing overlaps or overflows; text fits in all three languages;
- the prediction hides the answer completely, and the reveal shows the right answer even after a wrong guess;
- each view works; the readouts update in every view;
- the "Did you know?" box shows facts in every view and language, and its "Another fact" button cycles them;
- the footer's topic links open the right topics on the map (`/?topic=…`);
- after the quiz, the secrets open and the lab's topics show as "Learning" on the map;
- a wrong quiz answer is crossed out, and the second wrong tap shows the question's `hint`;
- the browser console shows no errors.

## 7. Pull request

One lab per branch and pull request. In the description: the main idea and the picture, what each view does, the sources for the facts, and what you checked (languages, width). CI runs the same checks as `npm run check`.

More context for contributors: [CONTRIBUTING.md](../../../CONTRIBUTING.md).
