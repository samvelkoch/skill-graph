# Skill Graph

## What this is
An open map of what children learn, forked from Marble's taxonomy. Viewer: `index.html`; interactive labs: `labs/`; data: `data/`.
Never edit upstream Marble files by hand except for deliberate data fixes; our own extra topics live in `data/extra/`.

## Audience
Parents and children. A parent uses the graph; a child uses the labs. Teachers are not a target.
No accounts, no backend, no points, no class dashboards.

## Labs: how to choose topics
- When asked for X new labs: run the script, pick X topics by the rule below, and for each write the main idea, its supporting ideas and the picture that makes the main idea obvious before any code. Build only after that list is agreed or at least stated in the report.
Run `node scripts/labs-candidates.mjs` (options: `--n`, `--age 6-10`, `--subject`, `--json`, `--all`) and pick from the top ~20 by this rule:
**the topic unlocks many others, has no lab yet, sits in ages 6-10, and its main idea can be made obvious with a picture.**
- Ages 6-10 are the starting focus, not a fixed limit. When good 6-10 candidates run thin, propose moving to other ages; a request for another age (`--age`) is fine at any time.
- The picture test decides. A high-ranking topic without an obvious picture is skipped.
- Prefer topics next to existing labs (the `near labs` column) so the nearby-labs navigation stays connected.
- Out of scope for labs: vocabulary topics (type LANGUAGE or "Vocabulary" in the name), meta-cognitive topics (type META, the whole "Learning to Learn" subject), English phonics / spelling / handwriting / grammar / vocabulary (native-English literacy, does not transfer to RU/HU children), and native-language grammar in "Language & Literature" (morphology, syntax, orthography). Reading comprehension, story structure, cause and effect, folklore and genres are fine; the script already applies these filters.
- Age stages of one series ("... (age 8+)") are collapsed to one row; the `stages` column lists them. One lab can cover the series.

## Labs: how to build one
Idea first. Start from: "what main idea should the child walk away with, which supporting ideas go with it, and what picture makes the main idea obvious?" Then pick the interaction; the mechanic is secondary. Do not clone one lab's skeleton for every topic.
- One main idea anchors the lab and its main picture; supporting ideas (as many as the topic needs) live in further views and the secret experiments.
- Pitch language, numbers and difficulty to the age range of the lab's topics in the curricula; the curriculum authors decide the age, not a fixed "9-year-old". Topics of different ages can be split across views.

Research before the spec: look up each topic's record in `data/teaching-research.json` (Marble's teaching research, `records[]` joined by `topicId`; Mathematics and Science only). Query it with a small script; do not load the 23 MB file into context. Use `pedagogy.commonMisconceptions` and `assess.errorPatterns` for the prediction tasks and quiz options, and `learn.activities` as ideas, not a script. It is agent-authored and not empirically validated: check facts against the sources.

Check understanding by predicting before the reveal: the child answers or builds while the answer is hidden (a curtain over the sky, a fence shown as `? m`, closed layers), then the picture shows the result. Feedback is visual first. Quiz questions target typical misconceptions, not recall of numbers from the page.

Shared skeleton, `labs/<id>/index.html`, importing `shell`, `secretLab`, `canvasLoop`, `sfx`, `$`, `esc`, `lang` from `../lab.js`:
- `shell({ key, T, topics, views, onLang, onView })` draws the chrome (header, language switch, views, footer topic links, nearby labs).
- `secretLab(key, getContent, onUnlock)` runs the 3-question quiz that unlocks two "secret" experiments and marks the lab's topics as "learning" on the map.
- All text in EN/RU/HU, chosen with `?lang=`.
- Register it: one entry in `labs/registry.json` (`id`, `path`, `emoji`, `subject`, `title`, `blurb`, `topics`), then run `node scripts/labs-catalog.mjs`.

Facts must be checked; give sources in the report. Keep the page phone-first.

## Process
- The lead model designs, writes the spec and does the browser QA.
- Sonnet subagents implement from a short spec with exact strings in all three languages.
- No self-made test harnesses; `node --check` only.
- Builder subagents do not use the browser and do not start or kill servers (no `pkill`): the browser pane and local ports are shared by the whole session. The lead gives each worktree its own local port for QA.
- QA in the browser at phone width, in EN, RU and HU.
- One branch per change, cut from fresh `main`; PR; merge.

## Checks before a PR
- `node scripts/validate.mjs` for any data change.
- `node scripts/labs-catalog.mjs` after adding a lab (regenerates `labs/catalog.json`).
- The lab's topic links in its footer open the right cards on the map.
- The quiz's unlock writes `learning` for the lab's topics.
