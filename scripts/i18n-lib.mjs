/**
 * i18n-lib.mjs — shared helpers for the translation scripts.
 *
 * Every translatable string in the dataset gets a stable flat key, so a
 * translation is just a `{ key: text }` map that can be split into batches,
 * checked, and merged back without touching ids, enums or graph structure.
 *
 *   topic:<id>:name | description | assessmentPrompt | evidence:<i>
 *   dep:<topicId>><prerequisiteId>:reason
 *   cluster:<subject>|<domain>|<ageRangeStart>:summary
 *   label:subject:<subject> | label:domain:<domain>
 *
 * Subjects and domains are identifiers (topics and clusters are filtered by
 * them), so they are translated as labels and never rewritten in place.
 * curriculum-standards.json is out of scope: verbatim third-party text under
 * its own upstream license (see PROVENANCE.md).
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const DATA = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'data');
export const I18N = resolve(DATA, 'i18n');

export const load = (path) => JSON.parse(readFileSync(path, 'utf8'));
export const save = (path, obj) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(obj, null, 2) + '\n');
};

export const loadSource = () => ({
  topics: load(resolve(DATA, 'topics.json')),
  deps: load(resolve(DATA, 'dependencies.json')),
  clusters: load(resolve(DATA, 'clusters.json')),
});

/**
 * Walk every translatable string. `visit(key, text, set)` receives a setter
 * that writes a replacement into the (caller-owned) source objects.
 */
export function walk({ topics, deps, clusters }, visit) {
  const subjects = new Set();
  const domains = new Set();

  for (const t of topics.topics) {
    subjects.add(t.subject);
    domains.add(t.domain);
    for (const f of ['name', 'description', 'assessmentPrompt']) {
      if (typeof t[f] === 'string' && t[f]) visit(`topic:${t.id}:${f}`, t[f], (v) => (t[f] = v));
    }
    (t.evidence ?? []).forEach((e, i) => visit(`topic:${t.id}:evidence:${i}`, e, (v) => (t.evidence[i] = v)));
  }

  for (const d of deps.dependencies) {
    if (d.reason) visit(`dep:${d.topicId}>${d.prerequisiteId}:reason`, d.reason, (v) => (d.reason = v));
  }

  for (const c of clusters.clusters) {
    subjects.add(c.subject);
    domains.add(c.domain);
    visit(`cluster:${c.subject}|${c.domain}|${c.ageRangeStart}:summary`, c.summary, (v) => (c.summary = v));
  }

  // labels have no home in the source objects; the setter is a no-op
  for (const s of [...subjects].sort()) visit(`label:subject:${s}`, s, () => {});
  for (const d of [...domains].sort()) visit(`label:domain:${d}`, d, () => {});
}

/** `{{name}}`-style placeholders, as a sorted multiset for comparison. */
export const placeholders = (s) => (s.match(/\{\{[^}]+\}\}/g) ?? []).sort().join(' ');
