# Skill Graph

An open map of **what children learn** from about age 4 to 16, and a set of interactive **labs** that explain one idea each. A parent uses the map to see where a child is and what comes next; a child uses the labs to play with an idea until it makes sense. Everything is in English, Russian and Hungarian.

**Open it:** [samvelkoch.github.io/skill-graph](https://samvelkoch.github.io/skill-graph/) · **Labs:** [samvelkoch.github.io/skill-graph/labs/](https://samvelkoch.github.io/skill-graph/labs/) · **Help build it:** [CONTRIBUTING.md](CONTRIBUTING.md)

Skill Graph started as a fork of the [Marble Skill Taxonomy](https://withmarble.com/curriculum) and keeps its data and licenses (see [License](#license)). On top of it, this project adds the viewer, the labs, translations, ten national school curricula and about 500 topics the taxonomy lacked.

![The graph as a rotating 3D map: every dot a topic, colored by subject, wired by prerequisites](media/curriculum-viz.gif)

## What it does

**For parents: the map** ([`index.html`](index.html))

- About **2,080 topics** in 13 subjects, each with a plain description, an age range and the signs that a child has got it.
- About **4,000 prerequisite links**: open any topic to see what it builds on and what it unlocks.
- Browse as a list or as a 3D map; filter by age, school grade, subject, or by a **national school curriculum** (10 countries, grades 1–8 or 1–9).
- Mark what a child already knows (“Known”, “Learning”); **Ready to learn** then shows the topics whose prerequisites are all known.
- Progress stays in the browser. A file or a link moves it to another device. The site can be installed as a home-screen app.

**For children: the labs** ([`labs/`](labs/))

- 70+ small interactive pages, each built around **one idea and one picture** that makes it obvious: magnets, seasons, fractions, the heart, food webs and more.
- Each lab links back to its topics on the map. A three-question quiz unlocks two “secret” experiments and marks the lab’s topics as “Learning” on the map.
- Phone first; no sign-up, no points, no ads.

## How it works

It is a **static site**: plain HTML, CSS and JavaScript plus JSON data. There is no backend, no build step, no accounts and no package to install. GitHub Pages serves the `main` branch as it is, so whatever is merged into `main` is live within a few minutes.

| Path | What it is |
|---|---|
| [`index.html`](index.html) | The map (viewer). One file: styles, UI strings in EN/RU/HU, list view and the 3D graph. |
| [`tour.js`](tour.js) | The short guided tour of the map (first visit and the **?** button). |
| [`labs/`](labs/) | The labs: one folder per lab (`labs/<id>/index.html`), the overview [`labs/index.html`](labs/index.html), the shared skeleton [`labs/lab.js`](labs/lab.js) + [`labs/lab.css`](labs/lab.css), the list of labs [`labs/registry.json`](labs/registry.json) and the generated [`labs/catalog.json`](labs/catalog.json). |
| [`data/`](data/) | The Marble taxonomy as published upstream: topics, prerequisites, curriculum standards, domain summaries, teaching research. |
| [`data/extra/`](data/extra/) | Topics and prerequisites added by this project to cover school-curriculum content the taxonomy lacks (arts, music, geography, history, literature and more). |
| [`data/school-curricula.json`](data/school-curricula.json) | Ten national curricula, item by item, linked to topics. |
| [`data/i18n/`](data/i18n/), [`data/extra/i18n/`](data/extra/i18n/) | Russian and Hungarian translations of all topic text. |
| [`scripts/`](scripts/) | Checks and generators (Node, no dependencies) and the curriculum pipeline ([`scripts/curricula/`](scripts/curricula/), Python). |
| [`manifest.webmanifest`](manifest.webmanifest), [`sw.js`](sw.js) | The home-screen app and offline cache. |

## Run it locally

You need any static web server (the pages load JSON with `fetch`, which does not work from `file://`), for example:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/> for the map and <http://localhost:8000/labs/> for the labs. Add `?lang=ru` or `?lang=hu` for the other languages.

To run the same checks as CI (Node 22, nothing to install):

```bash
npm run check
```

## Contributing

Help is welcome, especially:

- **a new lab** or a better version of an existing one;
- **your country’s school curriculum**, mapped onto the topics;
- **fixes** to topics, prerequisites, ages or translations;
- **translations** of the interface and the labs.

[CONTRIBUTING.md](CONTRIBUTING.md) has the path for each of these.

## The data

All data is UTF-8 JSON. JSON Schemas for the upstream files are in [`schema/`](schema/); counts and SHA-256 checksums are in [`data/manifest.json`](data/manifest.json).

| File | What it holds |
|---|---|
| [`data/topics.json`](data/topics.json) | 1,590 Marble micro-topics (graph **nodes**). |
| [`data/dependencies.json`](data/dependencies.json) | 3,221 prerequisite **edges** (`topicId` depends on `prerequisiteId`). |
| [`data/curriculum-standards.json`](data/curriculum-standards.json) | The source curriculum standards the Marble topics were distilled from (NGSS, Common Core, the UK National Curriculum and more), grouped by curriculum. |
| [`data/clusters.json`](data/clusters.json) | 183 parent-friendly domain summaries. |
| [`data/teaching-research.json`](data/teaching-research.json) | Marble’s teaching research for 1,049 Mathematics and Science topics: pedagogy, misconceptions, activities, assessment and sources. Copied unchanged from upstream; one record (`mt_HlNSurPVDp`) has no topic in this fork. Agent-authored guidance, not empirically validated. |
| [`data/extra/topics.json`](data/extra/topics.json), [`dependencies.json`](data/extra/dependencies.json) | 490 added topics and 791 edges, same shape as the upstream files. Each added topic lists the `curricula` (countries) it covers. |
| [`data/school-curricula.json`](data/school-curricula.json) | `curricula` (country → name, source URL, grades), `items` (`[country, subject, grade, title]`, 5,401 items) and `links` (topic → items it covers). |
| [`data/i18n/<lang>/`](data/i18n/) | `strings.json` holds the translation; the localized datasets next to it are generated. See [`data/i18n/README.md`](data/i18n/README.md). |

### A topic

```json
{
  "id": "mt_N8CpN1EJrP",
  "type": "CONCEPTUAL",
  "subject": "English",
  "domain": "Grammar & Punctuation",
  "name": "Building sentences",
  "description": "Understand that words combine to make sentences — a sentence expresses a complete thought…",
  "ageRangeStart": 4,
  "ageRangeEnd": 6,
  "centrality": 0.257,
  "evidence": [
    "Distinguish between complete sentences and fragments",
    "Compose a complete sentence with a subject and verb"
  ],
  "assessmentPrompt": "If {{name}} says something like \"The dog\", can they tell you that's not a complete sentence…?",
  "standards": ["ccss-ela:L.K.1f", "uk-nc-2013:Eng.App2.Y1.Sent.1"]
}
```

- `id`: stable identifier (`mt_…` upstream; added topics use their own prefixes), referenced by dependencies, curricula and labs.
- `standards`: keys into `curriculum-standards.json` (`"<curriculum-slug>:<code>"`).
- `assessmentPrompt`: a natural-language check. `{{name}}` is the child’s name; substitute or strip it before display.

### A dependency

```json
{ "topicId": "mt__00ZSLnB7p", "prerequisiteId": "mt_VBl1T1sFCM", "strength": "hard",
  "reason": "Must understand vibrations make sound before finding volume patterns" }
```

`topicId` **depends on** `prerequisiteId`. Reverse the edge to get “unlocks”.

### Using the data elsewhere

Load the JSON and go:

```js
import topics from './data/topics.json' with { type: 'json' };
import deps from './data/dependencies.json' with { type: 'json' };

const byId = new Map(topics.topics.map(t => [t.id, t]));
const prereqs = deps.dependencies
  .filter(d => d.topicId === 'mt_N8CpN1EJrP')
  .map(d => byId.get(d.prerequisiteId).name);
```

## License

The data is **multi-licensed**. Read this before you use or redistribute it.

| Layer | License |
|---|---|
| **The database**: the collection, structure, IDs, topic↔topic and topic↔standard relationships | [**ODbL 1.0**](LICENSE): free for research **and** commercial use, **attribution** required, **share-alike** (derivative *databases* must stay open under ODbL). |
| **The text Marble authored**: topic `description`/`name`/`evidence`/`assessmentPrompt`, dependency `reason`s, cluster `summary`s, teaching-research prose | [**CC BY-SA 4.0**](LICENSE-CONTENT): attribution + share-alike. |
| **Translations and added topics** ([`data/i18n/`](data/i18n/), [`data/extra/`](data/extra/)) | Derivative work: the text is under **CC BY-SA 4.0** with attribution to Marble (as stated in [`data/i18n/README.md`](data/i18n/README.md) and `data/extra/topics.json`); as part of the database it falls under the **ODbL 1.0** share-alike above. |
| **`curriculum-standards.json`**: extracted from third-party frameworks | **Not** Marble’s to relicense. Each source keeps **its own upstream license**; see [**PROVENANCE.md**](PROVENANCE.md). |

**Share-alike and still commercial-friendly:** ODbL separates a *derivative database* (extend or modify the taxonomy → it must stay open) from a *produced work* (use it inside a product, model or app → that stays yours). You can build a commercial product on the data without open-sourcing the product; you owe back only improvements to the data itself.

### Attribution

Any use of the data must credit:

> Marble Skill Taxonomy (v1) · © Generative Spark, Inc. (Marble) · https://withmarble.com · licensed under ODbL 1.0 (database) and CC BY-SA 4.0 (content).

Plus the upstream notices in [PROVENANCE.md](PROVENANCE.md) for any curriculum standards you use. See [CITATION.cff](CITATION.cff) for a formal citation and [CHANGELOG.md](CHANGELOG.md) for the upstream release notes.
