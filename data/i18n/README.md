# Translations (i18n)

Localized copies of the Marble-authored text: topic `name`, `description`,
`evidence`, `assessmentPrompt`, dependency `reason`, cluster `summary`, and
subject/domain labels. Ids, enums, ages, edges and standard keys are never
translated. `curriculum-standards.json` is out of scope (verbatim third-party
text under its own license, see [PROVENANCE.md](../../PROVENANCE.md)).

Translations are derivative content and stay under **CC BY-SA 4.0** with
attribution to Marble, like the source.

## Layout

| Path | What |
|---|---|
| `source.en.json` | Every translatable string as a flat `{ key: text }` map (generated). |
| `<lang>/strings.json` | The translation: same keys, translated values. Source of truth. |
| `<lang>/topics.json`, `dependencies.json`, `clusters.json` | Localized datasets, same shape as `data/` (generated). |
| `<lang>/labels.json` | Subject and domain names → localized label (generated). |
| `<lang>/work/` | Translation batches in progress (gitignored). |

Key scheme (see `scripts/i18n-lib.mjs`):

```
topic:<id>:name | description | assessmentPrompt | evidence:<i>
dep:<topicId>><prerequisiteId>:reason
cluster:<subject>|<domain>|<ageRangeStart>:summary
label:subject:<subject> | label:domain:<domain>
```

## Workflow

```bash
npm run i18n:extract                    # refresh source.en.json from data/
node scripts/i18n-batch.mjs split ru    # untranslated keys → ru/work/NNN.src.json (000 = labels)
# translate each NNN.src.json → NNN.json (same keys), then:
node scripts/i18n-batch.mjs check ru 7  # per-batch check
node scripts/i18n-batch.mjs merge ru    # valid batches → ru/strings.json
node scripts/i18n-validate.mjs ru       # full check (--partial while in progress)
node scripts/i18n-build.mjs ru          # strings.json → localized datasets
```

After pulling upstream changes, re-run `extract`; `split` only picks up keys
missing from `strings.json`. Changed English text keeps its key, so review the
`source.en.json` diff and delete the affected keys from `strings.json` to
retranslate them.

## Translation rules

- Translate meaning, not word by word; the audience is parents and teachers of
  children aged roughly 3–12. Keep the register plain and warm, like the source.
- Keep `{{name}}` exactly as written (it is the child's name). In Russian and
  Hungarian, phrase the sentence so the name needs no case ending, or so the
  ending can attach naturally (e.g. HU: `{{name}} tudja…`; RU: `Может ли {{name}}…`).
- Address the parent the way the source does (RU: «вы»; HU: magázó/semleges
  forma, consistent across the dataset).
- Use the batch-000 labels as the glossary for subject and domain terms, and
  the standard school terminology of the target country (RU: школьная
  программа РФ; HU: NAT terminology).
- Do not translate or alter ids, numbers, units, formulas or quoted example
  words that the topic is *about* (e.g. phonics examples like "cat", "ship")
  unless the topic only makes sense with a localized example; in that case
  keep the original in parentheses.
