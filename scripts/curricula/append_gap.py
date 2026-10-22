"""Append a hand-written gap file to the generated curriculum data (additive and idempotent).

build_extra.py / merge.py cannot be rerun (their intermediate inputs are gone), so a gap file patches the
generated files in place: new topics and prerequisite edges go to data/extra/ (EN, RU, HU), domain labels to
data/extra/i18n/*/labels.json, and links from curriculum items to topics to data/school-curricula.json.
Existing ids, edges and links are skipped, so a second run changes nothing. Core topics are never modified.

Gap file: {domainLabels: {domain: {ru, hu}}, topics: [EN fields + i18n.{ru,hu}], dependencies: [...],
links: [{index, title, topics: [[topicId, 'core'|'related']]}]}.

Usage: python3 scripts/curricula/append_gap.py <gap json> [<country>]   (country defaults to hu)
"""
import json
import statistics
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / 'data'
LANGS = ('ru', 'hu')
FIELDS = ('id', 'type', 'subject', 'domain', 'name', 'description', 'ageRangeStart', 'ageRangeEnd',
          'centrality', 'evidence', 'assessmentPrompt', 'standards', 'curricula')
TR_FIELDS = ('name', 'description', 'evidence', 'assessmentPrompt')


def dump(path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=1) + '\n')


def load(path):
    return json.loads(path.read_text())


def main(gap_path, country='hu'):
    gap = load(Path(gap_path))
    core = load(DATA / 'topics.json')['topics']
    core_ids = {t['id'] for t in core}
    mid = statistics.median(t.get('centrality') or 0 for t in core)

    # 1. topics
    extra = load(DATA / 'extra/topics.json')
    tr = {l: load(DATA / f'extra/i18n/{l}/topics.json') for l in LANGS}
    have = {t['id'] for t in extra['topics']}
    added_topics = 0
    for t in gap['topics']:
        if t['id'] in have or t['id'] in core_ids:
            continue
        en = {**t, 'centrality': mid, 'standards': [], 'curricula': [country]}
        row = {k: en[k] for k in FIELDS}
        extra['topics'].append(row)
        for l in LANGS:
            tr[l]['topics'].append({**row, **{k: t['i18n'][l][k] for k in TR_FIELDS}})
        have.add(t['id'])
        added_topics += 1
    known = core_ids | have

    # 2. dependencies
    deps = load(DATA / 'extra/dependencies.json')
    trdeps = {l: load(DATA / f'extra/i18n/{l}/dependencies.json') for l in LANGS}
    pairs = {(e['topicId'], e['prerequisiteId']) for e in deps['dependencies']}
    added_edges = 0
    for e in gap['dependencies']:
        for end in (e['topicId'], e['prerequisiteId']):
            if end not in known:
                sys.exit(f"dependency {e['topicId']} <- {e['prerequisiteId']}: unknown topic id {end}")
        if (e['topicId'], e['prerequisiteId']) in pairs:
            continue
        edge = {k: e[k] for k in ('topicId', 'prerequisiteId', 'strength', 'reason')}
        deps['dependencies'].append(edge)
        for l in LANGS:
            trdeps[l]['dependencies'].append({**edge, 'reason': e['i18n'][l]['reason']})
        pairs.add((e['topicId'], e['prerequisiteId']))
        added_edges += 1

    # 3. domain labels (kept in memory, written below)
    labels = {l: load(DATA / f'extra/i18n/{l}/labels.json') for l in LANGS}
    for name, lab in gap.get('domainLabels', {}).items():
        for l in LANGS:
            labels[l]['domains'].setdefault(name, lab[l])

    # 4. links
    sc_path = DATA / 'school-curricula.json'
    raw = sc_path.read_text()
    sc = json.loads(raw)
    items, links = sc['items'], sc['links']
    added_links = 0
    for ln in gap['links']:
        i, title = ln['index'], ln['title']
        if not (0 <= i < len(items)) or items[i][0] != country or not items[i][3].startswith(title):
            sys.exit(f"link entry {i} {title!r}: item is {items[i] if 0 <= i < len(items) else None}, expected country {country}")
        for tid, kind in ln['topics']:
            if tid not in known:
                sys.exit(f"link entry {i} {title!r}: unknown topic id {tid}")
            lst = links.setdefault(tid, [])
            if any(p[0] == i for p in lst):
                continue
            lst.append([i, 1 if kind == 'core' else 0])
            added_links += 1

    # 5. tag extra topics that now link to an item of `country`
    tagged = []
    linked = {tid for tid, lst in links.items() if any(items[p[0]][0] == country for p in lst)}
    for doc in [extra, *tr.values()]:
        for t in doc['topics']:
            if t['id'] in linked and country not in t['curricula']:
                t['curricula'] = sorted([*t['curricula'], country])
                if t['id'] not in tagged:
                    tagged.append(t['id'])

    # write everything
    extra['topicCount'] = len(extra['topics'])
    deps['edgeCount'] = len(deps['dependencies'])
    dump(DATA / 'extra/topics.json', extra)
    dump(DATA / 'extra/dependencies.json', deps)
    for l in LANGS:
        tr[l]['topicCount'] = len(tr[l]['topics'])
        trdeps[l]['edgeCount'] = len(trdeps[l]['dependencies'])
        dump(DATA / f'extra/i18n/{l}/topics.json', tr[l])
        dump(DATA / f'extra/i18n/{l}/dependencies.json', trdeps[l])
        dump(DATA / f'extra/i18n/{l}/labels.json', labels[l])
    out = json.dumps(sc, ensure_ascii=False, separators=(',', ':'))
    if raw.endswith('\n'):
        out += '\n'
    sc_path.write_text(out)
    print(f'{added_topics} topics, {added_edges} edges, {added_links} links added; '
          f'{len(tagged)} extra topics newly tagged {country}: {", ".join(tagged) or "-"}')


if __name__ == '__main__':
    main(*sys.argv[1:3])
