"""Build data/extra/: topics added on top of the Marble taxonomy to cover school-curriculum content it lacks.

The upstream files in data/ stay untouched (their validator and checksums keep passing); the viewer loads
data/extra/*.json next to them. Each input file (one per subject group) holds English topics with RU/HU
translations, prerequisite edges and the curriculum items they cover.

Every added topic carries `curricula`: the countries whose curriculum items it covers (item keys are
'<country>:<n>'), so the viewer can switch a country's additions off.

Usage: python3 scripts/curricula/build_extra.py <gap out dir>
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


def dump(path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=1) + '\n')


def main(src):
    groups = [json.load(open(f)) for f in sorted(Path(src).glob('*.json'))]
    base = json.load(open(DATA / 'topics.json'))['topics']
    # new topics have no centrality score of their own; give them the median so they render as ordinary nodes
    mid = statistics.median(t.get('centrality') or 0 for t in base)
    topics, deps, labels = [], [], {l: {'subjects': {}, 'domains': {}} for l in LANGS}
    tr = {l: [] for l in LANGS}
    trdeps = {l: [] for l in LANGS}
    origin = {}
    for g in groups:
        for key, pairs in g['links'].items():
            for t, _ in pairs:
                origin.setdefault(t, set()).add(key.split(':')[0])
    for g in groups:
        for kind in ('subjects', 'domains'):
            for name, lab in g.get('subjectLabels' if kind == 'subjects' else 'domainLabels', {}).items():
                for l in LANGS:
                    labels[l][kind][name] = lab[l]
        for t in g['topics']:
            en = {**t, 'centrality': mid, 'standards': [], 'curricula': sorted(origin.get(t['id'], ()))}
            topics.append({k: en[k] for k in FIELDS})
            for l in LANGS:
                tr[l].append({**topics[-1], **{k: t['i18n'][l][k] for k in ('name', 'description', 'evidence', 'assessmentPrompt')}})
        for e in g['dependencies']:
            edge = {k: e[k] for k in ('topicId', 'prerequisiteId', 'strength', 'reason')}
            deps.append(edge)
            for l in LANGS:
                trdeps[l].append({**edge, 'reason': e['i18n'][l]['reason']})
    dump(DATA / 'extra/topics.json', {'note': 'Topics added to cover national school curricula (HU, RU, RS). CC BY-SA 4.0.',
                                      'topicCount': len(topics), 'topics': topics})
    dump(DATA / 'extra/dependencies.json', {'edgeCount': len(deps), 'dependencies': deps})
    for l in LANGS:
        dump(DATA / f'extra/i18n/{l}/topics.json', {'language': l, 'topicCount': len(tr[l]), 'topics': tr[l]})
        dump(DATA / f'extra/i18n/{l}/dependencies.json', {'language': l, 'edgeCount': len(trdeps[l]), 'dependencies': trdeps[l]})
        dump(DATA / f'extra/i18n/{l}/labels.json', {'language': l, **labels[l]})
    print(len(topics), 'topics,', len(deps), 'edges from', len(groups), 'groups')


if __name__ == '__main__':
    main(sys.argv[1])
