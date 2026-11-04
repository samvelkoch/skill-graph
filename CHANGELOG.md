# Changelog

All notable changes to Skill Graph are documented here, newest first. Skill Graph is a fork of the
[Marble Skill Taxonomy](https://github.com/withmarbleapp/os-taxonomy): the first part of this file covers
the fork (the viewer, labs, school curricula, extra topics and translations); the second part keeps the
upstream Marble dataset history as it was synced.

The fork has no version numbers: `main` is deployed to GitHub Pages on every merge, so entries are grouped
by merge date and point to their pull requests. A shorter, parent-facing summary in English, Russian and
Hungarian is on the site: [What's new](https://samvelkoch.github.io/skill-graph/changelog/)
(`changelog/index.html`; its lab lists are read from the `added` dates in `labs/registry.json`).

Counts in brackets are totals after that day.

## 2026-11-04

### Labs
- `sound-poems`: seventh part, 3 poems on Ц under the speech therapist's rule for whistling sounds, each approved one by one; 45 poems in all. (#PR)

## 2026-11-03

### Labs
- `sound-poems`: each poem gets its own picture on its card (a 5th header field), so cards in one deal no longer repeat the same hero emoji. (#307)
- `sound-poems`: third З–Ж poem; the speech therapist's allowance for whistling sounds now also covers pairs with a whistling sound (З–Ж, С–Ш, С–Ц): up to 3 words per quatrain with Л or Р outside the target words, never Ч or Щ; 42 poems in all. (#306)
- `sound-poems`: first pair poems, З–Ж (2 poems, approved one by one; a third will follow); 41 poems in all. (#305)
- `sound-poems`: sixth part, 3 poems on Ж, each approved one by one; 39 poems in all. (#304)
- The "Why" button moves from under the picture to the right end of the tabs row (pinned on phones), freeing a row on small screens; single-view labs keep it under the picture. (#303)
- `sound-poems`: fifth part, 3 poems on С’ and 3 on З’ under the speech therapist's rule for whistling sounds, each approved one by one, all strict; 36 poems in all. (#302)
- `sound-poems`: the poem list becomes face-down hero cards — the child opens a card to meet the poem's hero (up to 3 cards per deal, a surprise card, reshuffle); the hero filter chips are gone. (#301)
- `sound-poems`: fourth part, 3 poems on З, each approved one by one, all strict; 30 poems in all. (#300)
- Phones: the top bar shrinks to one row of tabs while scrolling, the picture is capped so it fits on screen together with the first control, and a swipe on the picture scrolls the page (labs that drag on the picture keep it). (#299)
- `sound-poems`: third part, 3 poems on С, each approved one by one, all strict; 27 poems in all. New rule for whistling sounds (С’ З’ С З Ц) from the speech therapist: no hushing sounds at all, and a few later sounds such as Л and Р (at most 3 words per quatrain) only in words without the target sound; the checker and the adult view follow it. (#298)

## 2026-11-02

### Labs
- `sound-poems`: second part, 3 poems on Л’ and 3 on Р’, each approved one by one, all strict; 24 poems in all. (#280)
- New lab `unification` “Many States, One Nation”: toll gates from Hamburg to Munich, 39 German states become one empire, Garibaldi’s Thousand (369). (#297)
- New lab `ottoman` “The Empire on Three Continents”: 400 years of the Ottoman Empire on a map, Hungary in three parts after 1541, many peoples in one empire (368). (#296)
- New lab `moscow` “Gathering the Lands”: Moscow gathers its neighbours from 1300 to 1533, tribute to the Horde from Kulikovo to the Ugra, why Moscow (367). (#295)
- New lab `what-a-state` “Build a State”: four jigsaw pieces of a state, six real places judged from Vatican City to Antarctica, monarchy or republic, unitary or federal (366). (#294)
- New lab `taxes` “The Town Purse”: a street light paid by chipping in vs a small tax, a town budget with deficit and debt, flat vs progressive tax for three families (365). (#293)
- New lab `ice-core` “The Ice Archive”: drill into Antarctic ice and count yearly layers, crush a sample to measure ancient air, count down to Tambora’s ash (364). (#285)
- New lab `lines-test` “Which Line Is Longer?”: Asch’s line test in a classroom, what one honest friend changes, five ways to say no (363). (#286)
- New lab `metro` “Stations and Lines”: a city map turns into a graph, fewest stops vs fewest minutes, an adjacency table and a search tree (362). (#292)
- New lab `spreadsheet` “The Living Table”: a camping budget that recalculates in a wave, copying formulas with relative and absolute references, the right chart for the question (361). (#291)
- New lab `steepness` “The Steepness Number”: a ramp whose ratio stays fixed, sin and cos on a ladder, the sun’s angle from a tree’s shadow (360). (#290)
- New lab `lahar` “Living Under a Volcano”: evacuate towns before ash and mudflows, “once in 100 years” odds, an observatory’s warning signs and the Armero case (359). (#289)
- New lab `silver-prices` “More Coins, Same Bread”: coins vs bread in a market town, American silver and the price revolution, how a few per cent a year adds up (358). (#288)
- New lab `black-death` “The Year the Ships Came”: the plague of 1347 along the trade routes month by month, fewer hands and higher wages in a village, a chain of 14th-century crises (357). (#287)
- New lab `pin-factory` “The Toy Car Workshop”: all-rounders vs a line in a model workshop, find the bottleneck, core and supporting processes (356). (#284)
- New lab `two-islands` “Two Islands”: split working days between fish and coconuts and trade by boat, comparative advantage, a toy from Japan in your own money (355). (#283)
- New lab `like-terms` “Sort the Tiles”: sort algebra tiles into trays, test simplifications for every x, zero pairs of plus and minus tiles (354). (#282)
- New lab `chocolate-chain` “The Journey of a Chocolate Bar”: follow a cocoa bean from Ghana to a shop and break a link, cut a bar into everyone’s share of its price, a Fairtrade price floor (353). (#281)
- New lab `new-stuff` “New Stuff or Same Stuff?”: six kitchen changes under a particle magnifier, three experiments on a scale, and signs of change that are not proofs (352). (#279)
- New lab `variations` “Same Tune, New Clothes”: five disguises of one tune on a piano roll with gold skeleton notes, five dials, and how far you can go before it becomes a new tune (351). (#278)
- New lab `heads-tall` “How Many Heads Tall?”: a wooden mannequin grows beside a stack of its own heads, where the eyes really are, poses with limbs that keep their length (350). (#277)
- `sound-poems` (349): poems for speech therapy, in Russian only, for ages 4–7, asked for by a speech therapist (a second try after #264, rolled back for weak poems). The adult picks the sound being automated (С’ З’ С З Ш Ж Ц Ч Л’ Л Р Р’); no poem has a sound later in that order, and every poem also keeps the strict rule (whistling and hushing sounds apart, Л and Р apart). The target sound is highlighted where it is heard, not where it is written. The child draws the poem word by word (mnemonic table), then "I show" and "Tell it yourself" modes; the adult view breaks the poem down by sound position and checks any text or word. The list goes by sound and season, with heroes as an optional filter. First part: 18 poems, each read and approved one by one (Р 12, Ш 3, Л 3); the other sounds follow in later pull requests. `labs/sound-poems/phonetics.js` reads consonants by pronunciation; `scripts/sound-poems-check.mjs` checks every poem and runs in CI. New subject "Speech"; the overview shows Russian-only labs in a collapsed section in other languages. (#276)
- New lab `forest-garden` “Let the Field Rest”: run thirty years of a rainforest village’s farming, one field from garden back to forest, what four forest plants were used for (348). (#275)
- New lab `fact-opinion` “The Checking Machine”: a machine with a ruler, a thermometer and a map stamps facts true or false and jams on opinions, an advert to pull apart, a class poll (347). (#274)
- New lab `ways-to-pay` “Where Did the Money Go?”: cash, card and phone move coins between two glass jars, a month of pocket money one tap at a time, keep your PIN safe (346). (#273)
- New lab `look-ahead` “The Last Match”: a matches game against a robot that searches the game tree, colour a tree from the bottom up, watch game trees explode (345). (#272)
- New lab `twenty-questions` “Twenty Questions”: find a robot’s number with yes/no questions and count bits, grow a decision tree for eight animals, switches, bytes and file sizes (344). (#271)
- New lab `symbiosis` “Who Gains?”: separate six odd couples and watch two health meters, sort nine pairs into four baskets, look inside a lichen (343). (#270)
- New lab `passwords` “Guess My Password”: a robot tries every code on a brass lock, passwords from letters and three random words, who may know your password (342). (#269)
- New lab `boxes` “Three Boxes”: equal vs fair with three friends behind a fence, five everyday cases, staggered starts on a running track (341). (#268)
- New lab `part-of` “Part of a Pile”: deal sweets into bags to find 3/4 of 24, work backwards from a part, cut an hour, a metre and a class on a strip (340). (#267)
- New lab `peter-wolf` “A Voice for Every Hero”: six heroes on an evening meadow, each with its own instrument and tune; guess who plays, swap voices, give a voice to a new hero (original tunes; Prokofiev’s instrument assignments) (339). (#266)
- "Where next" under every lab: up to three easier labs to look at first ("Too hard?", labs on the prerequisites of the lab's topics) and up to three to go on to ("Too easy?", labs on the topics that build on it). `scripts/labs-catalog.mjs` derives them from the prerequisite graph as `before` / `after` in `labs/catalog.json`, keeping out labs reached both ways and preferring younger labs before and older ones after; new file `labs/next.js`, precached by the service worker (`sg-v4`). 288 of 331 labs get labs before, 255 get labs after. The new-lab skill makes it a rule for future labs. (#261)
- 7 labs after Tamás Varga's Hungarian maths method (338): `logic-blocks` (the 48-piece logic set, one difference at a time), `every-some` (true and false statements, and / or / not, two hoops), `all-ways` (listing every tower and outfit, tree diagrams), `rods` (Cuisenaire rods and missing numbers), `packs` (packing in threes, other bases, binary lamps), `pairs` (odd and even), `dice-race` (sums of two dice, certain / possible / impossible). They cover 21 topics that had no lab. (#262)

### Curricula
- France extended to collège (6e–3e, grades 6–9): sixième from the cycle 3 programmes already used (français and mathématiques 2025, histoire-géographie and sciences et technologie 2026), cycle 4 français and mathématiques (2026), technologie (2024) and histoire-géographie, physique-chimie and SVT (2020, still in force). 248 new items with 961 topic links (509 French items). Cycle 4 sciences and technology are set for the whole cycle and carry grade `7-9`. `parse_fr.py` takes several raw files and keeps the primary items first, so their mapped keys do not move. (#263)
- Finland: core curriculum for basic education POPS 2014 (Perusopetuksen opetussuunnitelman perusteet), from the ePerusteet API: content areas of 12 subjects for grade bands 1–2, 3–6 and 7–9, 97 items with 659 topic links; grade filter `fi-1`…`fi-9` shows the content of the grade's band. (#259)
- AI4K12 "Five Big Ideas in AI" as a curriculum layer, code `ai`: 122 items for grade bands K–2, 3–5 and 6–8, each keeping its AI4K12 concept code; objectives are paraphrased, not quoted (the AI4K12 charts are CC BY-NC-SA). Selectable in the viewer's school filter and shown as its own card on the curricula page, not counted as a country. (#258)

### Topics
- 8 extra topics `ai_01`–`ai_08` in `data/extra/` (machine perception, game trees, decision trees, training and test data, reinforcement learning, neural networks, language processing, working with an AI helper), with RU/HU translations and prerequisites (503 extra topics). (#258)

## 2026-11-01

### Labs
- 46 labs (331): 16 in one batch (#227), then one PR per lab (#228–#257), among them the periodic table, logic gates, latitude and longitude, linear perspective, Magna Carta, the Treaty of Verdun, the outbreak of World War I and the Cuban missile crisis.
- Labs overview: "Newest first" order (`?sort=new`, grouped by day) and a "New" badge. Every registry entry now needs `"added": "YYYY-MM-DD"`; `scripts/labs-catalog.mjs` fails without it. (#227)

## 2026-10-31

### Viewer
- App page (`?view=app`), linked from the home view and the sidebar: install steps for iPhone/iPad, Android and computers, the install button when the browser offers one, and a privacy panel (progress, the child's name and quick-check results stay in the browser; visits are counted with Google Analytics, which never sees the progress hash). (#225)
- Fix a green line across the top bar when the topic card is pulled up on phones. (#226)

### Labs
- 30 labs in three batches (285). (#218, #219, #220)
- Sound plays on iPhone and iPad in silent mode, in every lab (#221) and in the Robot Lab (#222).
- Beat and Rhythm: syncopation, more rhythms, a softer sound (#223) and a choice of instrument (#224).

## 2026-10-30

### Labs
- 14 labs (255), among them five "find the rule" labs where the child guesses a hidden rule from examples. (#215, #217)
- Lab quiz: wrong answers are crossed out and a hint ladder leads to the answer; the map records whether a topic went "easily" or "with hints" and asks for a second look after a week. The new-lab skill requires a hint per quiz question. (#216)

## 2026-10-29

### Labs
- 25 labs in five batches of five (241). (#210–#214)

## 2026-10-28

### Viewer
- Routes: plain wording ("How to get here · N steps", "Goals") (#203, #205); the path screen shows the route as a trail, then as a night sky of stars, with a list of steps (#204, #207).
- Check by subject: the check starts from the grade level and finds where knowledge ends in each section; topics the child probably knows are hatched. (#206)
- Ready-made routes grow to 61 (#208) and then 107 goals, now also for ages 5–6 and 12+ (#209). Only goal IDs are stored in `data/extra/routes.json`.

## 2026-10-27

### Data
- Sync with upstream Marble: Australian Curriculum v9 Foundation–Year 6 and Ontario mathematics mappings; 1,845 Marble topics, 3,941 dependencies. 2,589 new or changed strings per language translated to RU and HU (256 new topics, 85 changed topics, 809 prerequisite reasons, 13 labels). (#192) Upstream details are below.

### Curricula
- France: primary-school programmes CP–CM2 (grades 1–5) from the Bulletin officiel (etalab-2.0): French, mathematics, history-geography, science and technology; one item per school year and section. (#193)

### Labs
- 21 labs (216): Ballet Studio (#190, a piano plays a waltz or polka under the steps #191) and four batches of five (#198–#201).
- Redrawn graphics: Plates on the Move (#188), Volcano and Four Hunters (#189).
- Lab layout: the state card's title under the picture (#194), the explanation card under the headline on desktop (#195), a compact scene deck in Story Mountain (#196), the switch label in the Circuit Lab (#197); Notes on a Ladder plays on the first tap (#187); Read It Right gets a half-centimetre stepper (#202).

## 2026-10-26

### Labs
- 30 labs in two PRs (195). (#185, #186)

### Project
- Positioning as a map of knowledge and the paths through it: new titles, descriptions and social metadata on all pages; README names Marble as the foundation (#183); site description names children aged 4–16 (#184).

## 2026-10-25

### Labs
- 10 labs (165) and "Did you know?" facts (`lab.setFacts` in `labs/lab.js`), checked and sourced; labs gain depth with the age of the topic (rules in `.claude/skills/new-lab/`). (#181)
- Two Poles: real Natural Earth outlines on both polar maps and the globe (#180), without road-like lines on the ice (#182).

### Viewer
- Route: clickable section bars instead of the Sankey; on phones the topic card drags by its whole header and snaps to peek, half or full. (#179)

## 2026-10-24

### Viewer
- Home view (`?view=home`) with three doors: where the child is now, how to reach a topic, labs; the same doors on the map. The tour no longer opens by itself. (#178)
- Route to a topic from the topic card: known topics folded away, age stages merged, optional topics behind a toggle, stations with a lab marked; `?route=1`. (#173, #174)
- "My child" view: pick a country and grade, a quick check of 8 questions, a radar and bars by the school's own subjects, saved snapshots. (#175)
- "Routes" view with 18 ready-made goals. (#176)
- Marble's English subject is labelled "Reading & writing". (#177)

## 2026-10-22

### Viewer
- Own 2D-canvas graph (`graph2d.js`) from precomputed positions (`scripts/layout.mjs` → `data/layout.json`) instead of 3d-force-graph: no WebGL, no CDN, works offline. (#108)
- Topic card as a working tool: sticky head, quick check, lab, path with a progress bar, tabs (Links / About / At school / Full path); a bottom sheet on phones. (#106)
- Curricula page `curricula/`: every curriculum with issuer, grades, item and topic counts computed from the data, PISA/TIMSS context with sources. (#107)
- UI clean-up: "Curricula" naming, units on counts, removable filter pills, labs navigation (#105); collapsible subject legend on phones (#109); tapping a subject in the legend picks it (#116); the list view scrolls the page (#42); subject filters for Geography, History, Music and Reading in the labs overview (#44).
- Home-screen app manifest fixes. (#36, #40, #41)

### Data
- Marble's teaching research (`data/teaching-research.json`, 1,049 records) and its schema; 1,048 records match topics in this fork. (#35)
- Hungarian grammar topics (495 extra topics) and HU links to Language & Literature. (#110)

### Labs
- 114 labs (155), mostly one PR per lab (#37–#104, #112–#170, #172); visual redesigns of Food's Journey, Bones and Muscles, The Heart's Loop and Teeth Tell.
- Labs for speakers of one language (`lang` in the registry), with four Hungarian labs: short and long sounds, the ABC, runes, stems and suffixes. (#111–#115)

### Project
- Open to contributors: README, CONTRIBUTING, issue and PR templates, CI. (#75)
- The new-lab procedure as a project skill (`.claude/skills/new-lab/`) and `AGENTS.md`. (#43, #146)
- Google Analytics tag on every HTML page. (#171)

## 2026-10-21

### Curricula
- Singapore primary Mathematics and Science (#28), Sweden Lgr22 years 1–9 (#29), Japan Course of Study grades 1–9 (#30), Estonia basic school grades 1–9 (#32).

### Topics
- Visual Arts and Music branch from six school programmes (490 extra topics). (#31)

### Viewer
- Phones open the list first; "Next step" shows five ranked topics per subject. (#20)
- "Stuck on this?": walks back the prerequisite chain with quick questions to find the gap. (#21)
- Save and load progress as a JSON file, or share it as a link with the marks in the hash. (#22)
- Logo mark and favicon. (#25)
- Home-screen app (PWA): manifest, icons, service worker, offline labs, install hint. (#34)

### Labs
- 16 labs (41), among them a secret two-bulb mode in the Circuit Lab (#24) and Fraction Moves for 6th-grade fraction operations (#33). (#23, #27)
- `scripts/labs-candidates.mjs`: a ranked list of topics for new labs; project `CLAUDE.md`. (#26)

## 2026-10-20

### Curricula
- Germany (Bavaria, LehrplanPLUS: Grundschule 1–4, Gymnasium 5–9), USA and England from Marble's standards, a per-source filter, and an alphabetical curriculum list. (#9, #10)

### Topics
- 412 extra topics in `data/extra/` for curriculum content the Marble graph does not cover (geography, history, civics, computing, literature and more). (#9)

### Viewer
- Guided tour on the first visit and a `?` button. (#12)
- Labs navigation for hundreds of labs: an in-lab menu with search, nearby labs in the graph and the same subject; a filterable gallery; a "topics with a lab" filter. (#13)
- Layout fixes for the filters drawer, headline and legend. (#14, #15)
- Cold start by school grade: one button marks the lower grades as known; the quick-check question leads the topic card. (#17)
- A finished lab quiz marks its topics as "learning"; prerequisite reasons are printed in the topic card. (#18)
- List fallback when the graph cannot start; age stages of a topic in one row. (#19)

### Labs
- 22 labs (25), including the Robot Lab (#8) and two batches of ten and eleven. (#11, #16)

## 2026-10-19

### Viewer
- Redesign after withmarble.com/curriculum. (#5)

### Curricula
- School curricula of Hungary (NAT 2020 kerettanterv 1–8), Russia (federal work programmes 1–9) and Serbia (grades 1–8) linked to topics; viewer filter `?school=<country>-<grade>`. (#6)

### Labs
- First labs: magnets, seasons, fractions, in EN, RU and HU. (#7)

## 2026-10-18

### Added
- Russian and Hungarian translations of the Marble text and the i18n pipeline (`scripts/i18n-*.mjs`, `data/i18n/`). (#1)
- Viewer on GitHub Pages: an interactive graph (#2), then a list view with age, grade and subject filters and progress marks kept in the browser (#3).

---

# Upstream: Marble Skill Taxonomy dataset

Dataset releases are versioned independently of the taxonomy `version` field (the underlying taxonomy is `v1`).
The entries below come from upstream and were synced into this fork on 2026-10-27 (#192).

## [Unreleased]

### Upstream (Marble)
- Map Ontario Grade 5 Mathematics after auditing 51 specific and 12 overall expectations: 190 pairs on 145 existing topics and three additions (stacked bars, tax categories/collectors, focused orthographic views). Preserve every old mastery body, curriculum pair, learner record and research record; repair unnecessary prerequisites. Refresh the verified staging export (1,845 topics / 3,941 edges); publish the [code-by-code report](reports/ontario-grade5-mathematics-2026-10-24.md).

- Map Ontario Grade 4 Mathematics after auditing 48 specific and 12 overall expectations: 186 pairs on 126 existing topics and four new claims (two gaps, two focused extractions). Repair unnecessary prerequisites and add eight source-backed foundation components. Preserve old topic bodies, all old pairs, learner records and research. Refresh the verified staging export (1,842 topics / 3,919 edges); publish the [code-by-code report](reports/ontario-grade4-mathematics-2026-10-24.md).

- Map Ontario Grade 3 Mathematics onto 114 existing topics with 155 topic-code pairs after auditing 46 specific and 12 overall expectations. Add no topics; extend the existing congruence concept to 3D matching, repair unnecessary prerequisite gates and add two source-backed foundation alignments. Preserve all old pairs, learner records and research. Refresh the verified staging export (1,838 topics / 3,887 edges); publish the [code-by-code report](reports/ontario-grade3-mathematics-2026-10-23.md).

- Map Ontario Grade 2 Mathematics after a reuse-first audit of 39 specific and 12 overall expectations. Add four focused elementary claims extracted from broader topics and one concurrent-code skill; clarify three existing evidence items and repair unnecessary prerequisite gates. Preserve all existing curriculum pairs, learner records and research. Refresh the verified staging export (1,838 topics / 3,878 edges); publish the [code-by-code report](reports/ontario-grade2-mathematics-2026-10-23.md).

- Complete the Australian retrospective cleanup: retire 106 of 314 additions, retain 208 with focused claims, and add seven missing focused skills/procedures (net 99 fewer topics than the audited 1,932-topic staging baseline). Redistribute clauses before retiring IDs; publish flattened destinations, all 314 + 14 decisions and nine source-issue closures. Correct weak associations and replace blanket Full claims with current mappings and explicit review limits. Preserve observed learner data and history; reconcile only the 52 explicitly approved inherited estimates. Refresh the verified staging projection (1,833 topics / 3,846 edges), derived centrality, research binding and checksums.
- Include the previously ingested Ontario elementary catalogue: nine official documents / 3,862 expectations, bringing the catalogue to 17 sources / 7,743 expectations. Ontario exports codes and official links only. Grade 1 Mathematics authoring remains a focused pass; catalogue availability is not a whole-curriculum coverage claim.

Earlier entries below are historical authoring snapshots. Their Australian Full labels are superseded by the current mapping reports and the explicit review limits above.


- Correct three existing nutrition teaching-research records to distinguish food groups from nutrients across teaching text, activities, representations and assessment; align balanced-plate activities with healthy-eating guides and keep citation links consistent. Update canonical source records and the public projection together, retaining identities and coverage counts.

- Complete Australian Foundation–Year 6 Design and Technologies coverage: all 29 standards Full, with 111 alignments across 78 topics. Add 30 topics and 89 prerequisites within existing Science, Life Skills and Geography subjects, including shared Design & Technology and Food & Cooking domains. Correct food-group versus nutrient terminology in three existing nutrition topics, and qualify two overstated claims. All 593 content descriptions in the agreed seven-area scope are now Full; publish a verified scope summary. PE, Arts, Languages, elaborations and achievement standards remain excluded. Preserve existing IDs, curriculum links, prerequisites and teaching-research records; refresh centrality, coverage and checksums.

- Complete Australian Foundation–Year 6 Digital Technologies coverage: all 38 standards Full, with 93 alignments across 74 topics. Add 38 Computing topics and 98 prerequisites; introduce six shared domains and move three existing general Computing topics out of Artificial Intelligence without changing their IDs or content. Reuse Mathematics algorithms, English digital creation and research, and existing design, privacy and citizenship topics. Preserve existing curriculum links, prerequisites and teaching-research records; refresh centrality, coverage and checksums.

- Complete the selected Australian Foundation–Year 6 Health strand: all 32 Personal, social and community health standards Full, with 117 alignments across 79 topics. Add 25 topics and 62 prerequisites within existing subjects, reuse two HASS-authored topics, and extend an existing discrimination topic with an implemented inclusion action. Review body-safety and online-reporting wording. Preserve all existing IDs, curriculum links, prerequisite edges and teaching-research records; refresh centrality, coverage and dataset checksums. PE remains excluded.

- Complete Australian Foundation–Year 6 HASS coverage: all 89 standards Full, with 210 alignments across 124 topics. Add 54 topics across shared subjects, introduce Geography with reusable domains, extend two existing Historical Thinking topics instead of duplicating them, and move three map topics from Mathematics to Geography while preserving their curriculum links. Separate bundled timeline/map and day/symbol/festival requirements. Publish the cross-country authoring policy and decision review. Preserve existing topic IDs, curriculum links, prerequisite edges and teaching-research records; refresh centrality, research coverage and dataset checksums.

- Fill the Australian Foundation–Year 6 Science gaps with 24 new topics and 63 prerequisite links, including safe investigations, comparisons of predictions and findings, observations and models, properties of materials, heat, changing landforms, habitat conditions, planetary patterns and seasons. The reviewed Science report now marks all 77 standards Full, with 245 alignments across 131 topics. Add a digital-observation link from the existing Mathematics data topic; preserve existing topic content, curriculum links and prerequisite edges. Refresh derived centrality, research coverage and dataset checksums; teaching-research records are unchanged.

- Fill the Australian Foundation–Year 6 English gaps with 82 new topics and 193 prerequisite links, including Australian and First Nations literature, phoneme manipulation, digital navigation, multimodal creation, comprehension, handwriting and presentations. The reviewed English report now marks all 189 standards Full, with 630 links across 267 topics. Shared learning brings Science to 46 Full / 30 Partial / 1 Missing and Digital Technologies to 6 / 20 / 12. Preserve existing topic content, curriculum links and prerequisite edges; refresh derived centrality, research coverage and dataset checksums. Teaching-research records are unchanged.

- Add explicit eighths-of-events learning to the Year 2 fractions-of-time topic, with a 16-minute activity split into eight equal 2-minute parts and a prerequisite on eighths. Clarify the $7 virtual-payment task as a $5 note plus a $2 coin. Mathematics coverage remains 139 Full; refresh graph centrality and dataset checksums.

- Fill the documented Australian Foundation–Year 6 Mathematics gaps with 61 new topics and 149 prerequisite links, including virtual manipulatives, Australian currency, algorithms, digital tools, geometry and statistical investigations. The reviewed Mathematics report now marks all 139 standards Full, with 442 links across 325 topics. Shared learning also closes three Digital Technologies and two Science standards and adds HASS map coverage. Replace five pounds-based Australian maths links with Australian-currency coverage; preserve all non-Australian links and existing topic content. Refresh derived centrality, research coverage for the new topics and dataset checksums; teaching-research records are unchanged.

- Align Australian Foundation–Year 6 Design and Technologies with 79 links across 48 existing topics. Publish a code-by-code audit of all 29 standards: 3 fully covered, 26 partly covered and 0 missing. Preserve existing curriculum links, topic content and prerequisite edges; refresh approximate age spans and the teaching-research topic-file binding.

- Align Australian Foundation–Year 6 Digital Technologies with 47 links across 30 existing topics. Publish a code-by-code audit of all 38 standards: 2 fully covered, 23 partly covered and 13 missing. Preserve existing curriculum links and topic content; correct two prerequisite directions around Foundation pictograms, refresh derived centrality and approximate age spans, and update the teaching-research topic-file binding.

- Align selected Australian Foundation–Year 6 Health content with 84 links across 52 existing topics. Review all 32 Personal, social and community health standards: 11 fully covered, 19 partly covered and 2 missing. Exclude the 27 PE standards. Preserve existing curriculum links, topic content and prerequisite edges; refresh approximate age spans and the teaching-research topic-file binding.

- Align Australian Foundation–Year 6 HASS with 144 links across 66 existing topics. Publish a code-by-code audit of all 89 standards: 39 fully covered, 23 partly covered and 27 missing. Preserve existing curriculum links, topic content and prerequisite edges; refresh approximate age spans and the teaching-research topic-file binding.

- Align Australian Foundation–Year 6 Science with 208 links across 103 existing topics. Publish a code-by-code audit of all 77 standards: 43 fully covered, 33 partly covered and 1 missing. Preserve existing curriculum links, topic content and prerequisite edges; refresh approximate age spans and the teaching-research topic-file binding.

- Align Australian Foundation–Year 6 English with 540 links across 185 existing topics. Publish a code-by-code audit of all 189 standards: 110 fully covered, 76 partly covered and 3 missing, with explicit gaps for partial matches. Preserve existing curricula, topic content and prerequisite edges; refresh approximate age spans and the teaching-research topic-file binding.

- Align Australian Foundation–Year 6 Mathematics with 370 links across 266 existing topics, preserving existing curricula and prerequisite edges. Publish a code-by-code audit: 95 standards fully covered, 37 partly covered and 7 missing. Refresh approximate topic age spans and the teaching-research topic-file binding.

- Add 620 Australian Curriculum v9 Foundation–Year 6 content descriptions (`acara-v9`) from Marble's canonical standards catalogue, bringing the total to 8 curricula and 3,881 standards. Correct five Foundation Science inquiry strand assignments and restore six standards missed by the contributor's parser. Retain the existing graph and topic alignments; candidate Australian mappings are not included.
- Correct five later-age prerequisites and two adjacent dependency relationships, replacing later reinforcement with earlier foundational skills.
- Adjust the approximate starting age for Drawing Force Diagrams from 7 to 8 and regenerate graph centrality; retain teaching-research content while refreshing its topic-file checksum binding.
- Remove seven stale Science cluster summaries whose domains contain no topics, leaving 176 clusters.
- Validate that every cluster subject/domain pair exists among topics, with regression coverage for orphaned domains and subject mismatches.
- Add 1,051 teaching-research records for Science (547) and Mathematics (504), joined by stable topic ID, with explicit coverage for the other 540 topics.
- Align research after the chart split: pie-only teaching/assessment, restored earlier line-graph scope, a new construction-and-interpretation record, and corrected downstream assessment recovery routes.
- Publish portable learning guidance with activities, learner actions, feedback and evidence links; retain original pedagogy, assessment and historical source-verification metadata.
- Add teaching-research JSON Schema, cross-file/evidence-link validation, regression checks and a topic-file checksum binding.
- Mark curriculum-text publication omissions inline and by field path; exclude private database IDs, learner data and migration audit artifacts.
- Separate pie-chart and line-graph coverage: retain `mt_bESTSBB0wK` for pie charts and add `mt_HlNSurPVDp` for line graphs.
- Correct the earlier line-graph problem-solving topic's title and description; revise prerequisites and downstream links for the split.
- Restore 330 previously authored curriculum links by normalizing legacy alignment identifiers, including the UK Year 6 chart standard on both chart topics.
- Use discrete/continuous-data presentation as the prerequisite for later grouped-data charts; clarify their pie-chart prerequisite reason.
- Regenerate the canonical export and centrality scores: 1,591 topics and 3,225 dependencies.

## [1.0.0] — 2026-07-08

Initial public release.

### Included
- **1,590 micro-topics** across 8 subjects (`data/topics.json`).
- **3,221 prerequisite dependencies** with `hard`/`soft` strength + reasons (`data/dependencies.json`).
- **7 curricula / 3,261 standards** with 1,859 topic↔standard links (`data/curriculum-standards.json`).
- **183 domain clusters** (`data/clusters.json`).
- JSON Schemas + a dependency-free validator.

### Curriculum text shipped
- **Full text:** UK National Curriculum (OGL v3.0), Common Core ELA + Math (CCSS Public License).
- **Codes only** (verbatim text omitted pending rights clearance): NGSS K-5 + Middle School, C3 Framework, IB PYP PSPE. See [PROVENANCE.md](PROVENANCE.md).

### Excluded
- Semantic embeddings (derived / recomputable).
- All per-child and user data (never published).
