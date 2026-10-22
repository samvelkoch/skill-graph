# Notes for coding agents

Skill Graph is an open map of what children learn (`index.html`, data in `data/`) and a set of interactive labs (`labs/`). A parent uses the map; a child uses the labs. Static site on GitHub Pages: no backend, no build step, no dependencies. Everything user-facing is in English, Russian and Hungarian.

Start with [README.md](README.md) (what is where) and [CONTRIBUTING.md](CONTRIBUTING.md) (the path for each kind of change).

## Building or improving a lab

Follow the skill in [`.claude/skills/new-lab/SKILL.md`](.claude/skills/new-lab/SKILL.md), with its companions [`shell-api.md`](.claude/skills/new-lab/shell-api.md) and [`pitfalls.md`](.claude/skills/new-lab/pitfalls.md). Claude Code loads it automatically; other agents should read it before writing any lab code. In short: main idea and picture first, predict before reveal, all text in EN/RU/HU, phone first, register in `labs/registry.json`, regenerate `labs/catalog.json`.

## Rules

- Do not load big data files whole: `data/teaching-research.json` is 23 MB, `data/topics.json` and others are megabytes. Query them with small `node -e` scripts.
- Upstream Marble files in `data/` change only for deliberate data fixes; added topics live in `data/extra/`.
- Audience is parents and children, not teachers: no accounts, no backend, no points, no class dashboards.
- No new dependencies and no test harnesses; checks are the scripts below.
- One change per branch and pull request.

## Checks

```bash
npm run check                    # what CI runs: dataset, translations, lab catalog, page scripts, Robot Lab
node scripts/labs-catalog.mjs    # after changing labs/registry.json (commit the result)
node scripts/layout.mjs          # after changing topics or dependencies (regenerates data/layout.json)
python3 -m http.server 8000      # then check pages at phone width with ?lang=en|ru|hu
```
