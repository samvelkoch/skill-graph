# Contributing to Skill Graph

Thank you for helping. Skill Graph is a map of what children learn, used by **parents**, and a set of labs, used by **children**. Teachers and schools are not the target, and the project stays simple on purpose: no accounts, no backend, no points, no class dashboards.

This page has one path for each kind of contribution:

- [Add or improve a lab](#add-or-improve-a-lab)
- [Add a country’s school curriculum](#add-a-countrys-school-curriculum)
- [Fix an error in the data](#fix-an-error-in-the-data)
- [Add or fix a translation](#add-or-fix-a-translation)

Not sure where something belongs? Open an issue and describe it in plain words; that is a contribution too.

## Before you start

1. **Run the site locally.** It is static, so any web server works:

   ```bash
   python3 -m http.server 8000
   ```

   Open <http://localhost:8000/> (the map) and <http://localhost:8000/labs/> (the labs). Add `?lang=ru` or `?lang=hu` to switch the language.

2. **Run the checks** (Node 22, nothing to install). CI runs the same ones on every pull request:

   ```bash
   npm run check
   ```

   | Command | What it checks |
   |---|---|
   | `node scripts/validate.mjs` | The upstream data in `data/`: structure, references between topics, edges and standards, counts and checksums. |
   | `node scripts/i18n-validate.mjs ru` (and `hu`) | Every topic string is translated and keeps its placeholders. |
   | `node scripts/labs-catalog.mjs` | Regenerates `labs/catalog.json` from `labs/registry.json`; fails on a topic id that does not exist. CI fails if the committed catalog is out of date. |
   | `node scripts/check-scripts.mjs` | Every page script (inline in the HTML or in a `.js` file) parses (`node --check`). |
   | `node scripts/test-robot-lab.mjs` | Every Robot Lab level can be solved. |

3. **One change per pull request**, on its own branch. Say in the description what you changed, why, and how you checked it (which pages, languages and screen width).

4. **Licensing.** Data and text you add become part of the dataset, so they are released under its licenses: ODbL 1.0 for the data and CC BY-SA 4.0 for the text (see the [README](README.md#license)). Only add material you have the right to share under those terms, and give sources for facts.

## Add or improve a lab

A lab is one page that makes **one main idea** obvious to a child with **one picture** they can play with. The mechanic comes second.

The full procedure, with the shared skeleton and the lessons from reviewing 100+ labs, is the project skill **[`.claude/skills/new-lab/`](.claude/skills/new-lab/SKILL.md)**. If you use Claude Code, it loads the skill by itself when you ask it to build a lab; other agents are pointed to it by [AGENTS.md](AGENTS.md); people can read it as plain Markdown. In short:

1. **Choose the topic** with `node scripts/labs-candidates.mjs`: it unlocks many others, has no lab yet, fits the target ages (6–10 to start with), and its main idea can be made obvious with a picture. The picture test decides.
2. **Write the idea first** and open an issue (template “New lab”): the main idea in one sentence, the supporting ideas, the picture, and what the child predicts before the reveal. Agreeing on the idea first saves everyone a rebuild.
3. **Build** `labs/<id>/index.html` on the shared skeleton in [`labs/lab.js`](labs/lab.js), with all text in EN/RU/HU and the phone as the main screen. Facts need sources.
4. **Register** it in [`labs/registry.json`](labs/registry.json), run `node scripts/labs-catalog.mjs`, and commit both files.
5. **Check** with `npm run check`, then in a browser at phone width in all three languages: the topic links in the footer open the right topics on the map, and after the quiz the lab’s topics show as “Learning”.

Improving an existing lab follows the same rules: say which idea is unclear today and what the better picture is.

## Add a country’s school curriculum

Ten national curricula are mapped onto the topics today (Hungary, Russia, Serbia, Germany/Bavaria, USA, England, Singapore, Sweden, Japan, Estonia). A parent picks a country and grade on the map and sees the topics that grade covers. Estonia is the most recent example: see [pull request #32](https://github.com/samvelkoch/skill-graph/pull/32).

**Start with an issue** (template “New school curriculum”): the country, the official source (URL, version, year), the grades and subjects, and the terms under which the document is published. Official documents are often under their own license, and we need to know we may store item titles.

How a curriculum gets in, step by step:

1. **Parse** the official document into items with a parser `scripts/curricula/parse_<cc>.py` (see [`parse_ee.py`](scripts/curricula/parse_ee.py)). Output: a JSON list of `{subject, stage, grade, topic, text}`, one row per unit of the curriculum (for example, one domain of learning outcomes per grade or stage). The raw source files are not committed; the parser’s docstring says where they come from and how they were saved.
2. **Match school subjects to graph subjects** in `SUBJECTS` and add the country code to `COUNTRIES` in [`build_batches.py`](scripts/curricula/build_batches.py). Subjects with no counterpart in the graph are left out.
3. **Build mapping batches:** `python3 scripts/curricula/build_batches.py <parsed dir> <batch dir>`. Each batch is one country + subject + grade, with the candidate topics an item may map to.
4. **Map items to topics.** For each batch, write `<batch>.out.json` = `{"<item key>": [["<topic id>", "core" | "related"], …]}`. In this project the mapping is done by a language model, batch by batch, and checked by a person; you can do it the same way or by hand.
5. **Merge:** add the country to `CURRICULA` in [`merge.py`](scripts/curricula/merge.py) (name, source URL, grades) and run `python3 scripts/curricula/merge.py <batch dir> <mapped dir> data/school-curricula.json`.
6. **Show it in the viewer:** add the country’s name to the `cn` labels of all three languages in `index.html` (search for `Estonia`, `Эстония`, `Észtország`) and the code to `SOURCES_ALL`.
7. **Check** the map at phone width with `?school=<cc>-<grade>` in EN, RU and HU: the country selector, the chip and the topic list work and the console shows no errors. Existing countries must stay unchanged.

> **Honest caveat about step 5.** The parsed files, batches and model outputs of the existing countries are not in the repository, so `merge.py` cannot rebuild `data/school-curricula.json` from scratch on your machine. Send your parser, the parsed JSON and your `.out.json` files in the pull request, and the maintainer runs the merge; or ask in the issue how to add your country’s items without touching the others.

Items no topic covers can become new topics in `data/extra/` ([`build_extra.py`](scripts/curricula/build_extra.py)). That is a larger change; discuss it in the issue first.

## Fix an error in the data

Wrong age, a missing or wrong prerequisite, a mistake in a description, a bad translation? The quickest path is an issue (template “Data error”) with the topic’s link from the map (it contains `?topic=<id>`), what is wrong and a source.

To fix it yourself, find where the data lives:

| What | Where | After editing |
|---|---|---|
| Upstream topic or prerequisite (id starts with `mt_`) | `data/topics.json`, `data/dependencies.json` | Update that file’s `sha256` (and `bytes`) in `data/manifest.json` (`shasum -a 256 data/topics.json`), then `node scripts/validate.mjs`. If you changed English text, see [Translations](#add-or-fix-a-translation): the RU/HU text must follow. |
| An added topic (any other id) | `data/extra/topics.json`, `data/extra/dependencies.json`, and their RU/HU copies in `data/extra/i18n/<lang>/` | Keep the three languages in step. `validate.mjs` does not cover `data/extra/` yet, so open the topic on the map in all three languages. |
| A curriculum item or its links | `data/school-curricula.json` | Check with `?school=<cc>-<grade>` on the map. |
| Russian or Hungarian text of an upstream topic | `data/i18n/<lang>/strings.json` | See [Translations](#add-or-fix-a-translation). |

Edit upstream Marble files only for deliberate data fixes, and say in the pull request what was wrong and why the fix is right. Errors in the taxonomy itself are also worth reporting to [Marble](https://withmarble.com).

## Add or fix a translation

The site is in English, Russian and Hungarian. Text lives in these places:

| Text | Where |
|---|---|
| Topics, prerequisites’ reasons, domain summaries, subject and domain names (upstream) | `data/i18n/<lang>/strings.json`, the source of truth. The datasets next to it are generated: run `node scripts/i18n-build.mjs <lang>` and `node scripts/i18n-validate.mjs <lang>`. Rules and workflow: [`data/i18n/README.md`](data/i18n/README.md). |
| Added topics | `data/extra/i18n/<lang>/topics.json`, `dependencies.json`, `labels.json`, edited directly. |
| The map’s interface | the `UI` object (`en`, `ru`, `hu`) near the top of the script in [`index.html`](index.html); the tour in [`tour.js`](tour.js); the labs menu in [`labs/viewer.js`](labs/viewer.js). |
| The labs’ shared interface | `UI` in [`labs/lab.js`](labs/lab.js), [`labs/index.html`](labs/index.html) and [`labs/switcher.js`](labs/switcher.js). |
| One lab’s text | the `T` object in `labs/<id>/index.html`. |
| Lab titles and blurbs on the overview | `title` and `blurb` in [`labs/registry.json`](labs/registry.json). |

Register: the map speaks to parents (RU «вы», HU polite form); the labs speak to children (RU «ты», HU tegező). Keep `{{name}}` and other placeholders exactly as they are.

**A new language** touches every place above plus the language switches (`LANGS` in `labs/lab.js` and in `index.html`). It is very welcome, but open an issue first so we can plan it together.

## Reviews and merging

The maintainer reviews every pull request. CI runs on each one and must pass. Merged changes are live on [samvelkoch.github.io/skill-graph](https://samvelkoch.github.io/skill-graph/) within a few minutes.
