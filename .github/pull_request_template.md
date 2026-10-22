<!-- Thank you! See CONTRIBUTING.md for the path for each kind of change. One change per pull request. -->

## What and why

<!-- What changed, and why. Link the issue if there is one: "Closes #…". -->

## Kind of change

- [ ] Lab (new or improved)
- [ ] School curriculum
- [ ] Data fix
- [ ] Translation
- [ ] Site or scripts
- [ ] Docs

## Checks

- [ ] `npm run check` passes (validate, translations, lab catalog, page scripts)
- [ ] Checked in the browser at phone width (about 390 px) in EN, RU and HU
- [ ] Sources for facts are listed below (labs, data fixes, curricula)

For a lab:

- [ ] Registered in `labs/registry.json`, and `labs/catalog.json` regenerated with `node scripts/labs-catalog.mjs`
- [ ] The topic links in the lab's footer open the right topics on the map
- [ ] After the quiz, the lab's topics show as "Learning" on the map

## Sources

<!-- Where the facts come from. -->
