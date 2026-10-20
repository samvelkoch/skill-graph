"""Turn the US and England standards that no Marble topic carries into curriculum items for mapping.

Marble links only part of its own standards (data/curriculum-standards.json) to topics; the rest get mapped
like the other national curricula. Only sources that ship their text, grades up to 9-10.

Usage: python3 scripts/curricula/parse_std.py <parsed dir>   -> <parsed dir>/us.json, gb.json
Output rows: {subject, stage, grade, topic, text}, the same shape as the other parsers.
"""
import json
import sys
from pathlib import Path

from merge import standard_item

DATA = Path(__file__).resolve().parents[2] / 'data'


def main(out):
    used = {s for t in json.load(open(DATA / 'topics.json'))['topics'] for s in t.get('standards', [])}
    rows = {'us': [], 'gb': []}
    for c in json.load(open(DATA / 'curriculum-standards.json'))['curricula']:
        if not c['textIncluded']:
            continue
        for t in c['topics']:
            it = t['key'] not in used and standard_item(c['slug'], t['code'], t.get('data', {}))
            if not it or int(it[2].split('-')[0]) > 9 or it[2] == '9-12':
                continue
            d = t.get('data', {})
            rows[it[0]].append({'subject': it[1], 'stage': '', 'grade': it[2], 'topic': d.get('title') or t['code'],
                                'text': ' · '.join(x for x in (d.get('domain'), d.get('cluster'), d.get('description')) if x)})
    for country, r in rows.items():
        json.dump(r, open(Path(out) / f'{country}.json', 'w'), ensure_ascii=False, indent=0)
        print(country, len(r))


if __name__ == '__main__':
    main(sys.argv[1])
