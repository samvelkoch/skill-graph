"""Join the model's per-batch mappings into data/school-curricula.json for the viewer.

Usage: python3 scripts/curricula/merge.py <batch dir> <mapped dir> <out json>

Output: {version, curricula: {country: {name, url, grades}}, items: [[country, subject, grade, title]],
links: {topicId: [[item index, 1 core | 0 related], ...]}}. Only items with at least one link are kept.
Ids that are not in the batch's candidate list are dropped and counted.
"""
import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

CURRICULA = {
    'hu': {'name': 'Kerettanterv (NAT 2020)', 'url': 'https://www.oktatas.hu/kozneveles/kerettantervek/2020_nat', 'grades': list(range(1, 9))},
    'ru': {'name': 'ФРП НОО/ООО (2025)', 'url': 'https://edsoo.ru/rabochie-programmy/', 'grades': list(range(1, 10))},
    'rs': {'name': 'Програм наставе и учења', 'url': 'https://www.pravno-informacioni-sistem.rs/', 'grades': list(range(1, 9))},
}


def main(batch_dir, mapped_dir, out):
    batch_dir, mapped_dir = Path(batch_dir), Path(mapped_dir)
    meta = {it['key']: it for it in json.load(open(batch_dir / 'items.json'))}
    items, idx, links, stats = [], {}, defaultdict(list), Counter()
    for m in json.load(open(batch_dir / 'manifest.json')):
        res = mapped_dir / f"{m['batch']}.out.json"
        if not res.exists():
            stats['batches missing'] += 1
            continue
        b = json.load(open(batch_dir / f"{m['batch']}.json"))
        ok = {line.split(' | ')[0] for v in b['candidates'].values() for line in v}
        for key, pairs in json.load(open(res)).items():
            if key not in meta:
                stats['unknown item keys'] += 1
                continue
            good = [(t, kind) for t, kind in pairs if t in ok]
            stats['dropped ids'] += len(pairs) - len(good)
            stats['items mapped' if good else 'items empty'] += 1
            if not good:
                continue
            it = meta[key]
            i = idx.setdefault(key, len(items))
            if i == len(items):
                items.append([it['country'], it['subject'], it['grade'], it['title']])
            for t, kind in dict(good).items():
                links[t].append([i, 1 if kind == 'core' else 0])
        stats['batches merged'] += 1
    Path(out).write_text(json.dumps({'version': 1, 'curricula': CURRICULA, 'items': items, 'links': links},
                                    ensure_ascii=False, separators=(',', ':')))
    per = Counter(x[0] for x in items)
    print(dict(stats), '| items kept per country', dict(per), '| topics linked', len(links),
          f'| {Path(out).stat().st_size // 1024} KB')


if __name__ == '__main__':
    main(*sys.argv[1:4])
