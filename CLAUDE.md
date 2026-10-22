# Skill Graph

## What this is
An open map of what children learn, forked from Marble's taxonomy. Viewer: `index.html`; interactive labs: `labs/`; data: `data/`.
Never edit upstream Marble files by hand except for deliberate data fixes; our own extra topics live in `data/extra/`.

## Audience
Parents and children. A parent uses the graph; a child uses the labs. Teachers are not a target.
No accounts, no backend, no points, no class dashboards.

## Labs
Every lab is built with the project skill `.claude/skills/new-lab/` (`SKILL.md`, `shell-api.md`, `pitfalls.md`): topic choice, main idea and picture before code, teaching research, the `lab.js` skeleton, registry and catalog, checks and QA. It is the single source of the lab rules; update it, not this file, when a rule changes.
- When asked for X new labs: run `node scripts/labs-candidates.mjs`, pick X topics by the skill's rule, and for each write the main idea, its supporting ideas and the picture before any code. Build only after that list is agreed or at least stated in the report.
- Facts must be checked; give sources in the report.

## Process
- The lead model designs, writes the spec and does the browser QA.
- Sonnet subagents implement from a short spec with exact strings in all three languages.
- No self-made test harnesses; `node --check` only.
- Builder subagents do not use the browser and do not start or kill servers (no `pkill`): the browser pane and local ports are shared by the whole session. The lead gives each worktree its own local port for QA.
- QA in the browser at phone width, in EN, RU and HU.
- One branch per change, cut from fresh `main`; PR; merge.

## Checks before a PR
- `node scripts/validate.mjs` for any data change.
- `node scripts/layout.mjs` after any change to topics or dependencies (regenerates `data/layout.json`, the map's positions).
- `node scripts/labs-catalog.mjs` after adding a lab (regenerates `labs/catalog.json`).
- The lab's topic links in its footer open the right cards on the map.
- The quiz's unlock writes `learning` for the lab's topics.
