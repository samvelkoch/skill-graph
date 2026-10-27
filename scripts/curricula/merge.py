"""Join the model's per-batch mappings into data/school-curricula.json for the viewer.

Usage: python3 scripts/curricula/merge.py <batch dir> <mapped dir> <out json> [<gap out dir>]

US, England and Australia items come from the standards the Marble topics carry (data/curriculum-standards.json).
The optional gap dir holds the links of items no Marble topic covered to the topics in data/extra/; a gap file
may also carry its own `items` (e.g. art and music lessons that never went through the batches).

Output: {version, curricula: {country: {name, url, grades}}, items: [[country, subject, grade, title]],
links: {topicId: [[item index, 1 core | 0 related], ...]}}. Only items with at least one link are kept.
Ids that are not in the batch's candidate list are dropped and counted.
"""
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

CURRICULA = {
    'hu': {'name': 'Kerettanterv (NAT 2020)', 'url': 'https://www.oktatas.hu/kozneveles/kerettantervek/2020_nat', 'grades': list(range(1, 9))},
    'ru': {'name': 'ФРП НОО/ООО (2025)', 'url': 'https://edsoo.ru/rabochie-programmy/', 'grades': list(range(1, 10))},
    'rs': {'name': 'Програм наставе и учења', 'url': 'https://www.pravno-informacioni-sistem.rs/', 'grades': list(range(1, 9))},
    'de': {'name': 'LehrplanPLUS Bayern (Grundschule, Gymnasium)', 'url': 'https://www.lehrplanplus.bayern.de/', 'grades': list(range(1, 10))},
    'us': {'name': 'Common Core, NGSS, C3', 'url': 'https://www.thecorestandards.org/', 'grades': list(range(1, 10))},
    'gb': {'name': 'National curriculum in England (2013)', 'url': 'https://www.gov.uk/government/collections/national-curriculum', 'grades': list(range(1, 10))},
    'sg': {'name': 'MOE syllabuses: Mathematics (2021), Science (2023), Art (2024), Music (2023)', 'url': 'https://www.moe.gov.sg/primary/curriculum/syllabus', 'grades': list(range(1, 9))},
    'se': {'name': 'Lgr22 (grundskolan)', 'url': 'https://www.skolverket.se/undervisning/grundskolan/laroplan-och-kursplaner-for-grundskolan', 'grades': list(range(1, 10))},
    'jp': {'name': '学習指導要領 (2017)', 'url': 'https://www.mext.go.jp/a_menu/shotou/new-cs/index.htm', 'grades': list(range(1, 10))},
    'ee': {'name': 'Põhikooli riiklik õppekava', 'url': 'https://www.riigiteataja.ee/akt/114012011001', 'grades': list(range(1, 10))},
    'au': {'name': 'Australian Curriculum v9 (Foundation–Year 6)', 'url': 'https://v9.australiancurriculum.edu.au/', 'grades': list(range(0, 7))},
}
KS = {'1': '1-2', '2': '3-6', '3': '7-9'}  # England: key stage -> years


def us_grade(g):
    """'K' / '4' / 'Grade 4' / '11-12' / 'K-2' / 'High School' -> '0' / '4' / '11-12' / '0-2' / '9-12'; None if unknown."""
    g = str(g or '').replace('Grade', '').strip()
    if g.lower().startswith('high'):
        return '9-12'
    if g.lower().startswith('kinder'):
        return '0'
    g = re.sub(r'\bK\b', '0', g)
    return g if re.fullmatch(r'\d+(-\d+)?', g) else None


def standard_item(src, code, data):
    """(country, subject, grade, title) of a Marble standard (data/curriculum-standards.json), or None."""
    if src == 'uk-nc-2013':
        m = re.search(r'Years? (\d+(?:-\d+)?)', data.get('yearGroup') or data.get('year') or '')
        ks = re.search(r'(\d)', data.get('keyStage', ''))
        grade = m.group(1) if m else KS.get(ks.group(1)) if ks else None
        return grade and ('gb', data.get('subject') or '', grade, data.get('title') or code)
    if src in ('ccss-ela', 'ccss-math'):
        grade = us_grade(data.get('gradeLevel'))
        subj = 'English Language Arts' if src == 'ccss-ela' else 'Mathematics'
        return grade and ('us', subj, grade, f"{code} · {data.get('title')}" if data.get('title') not in (None, code) else code)
    if src in ('ngss-k5', 'ngss-ms'):
        grade = '6-8' if code.startswith('MS') else us_grade(code.split('-')[0])
        return grade and ('us', 'Science (NGSS)', grade, code)
    if src == 'acara-v9':  # Foundation -> grade 0
        ys = ['0' if y.upper().startswith('F') else y for y in data.get('yearLevels') or []]
        grade = '-'.join(dict.fromkeys(ys[:1] + ys[-1:])) if ys and all(y.isdigit() for y in ys) else None
        return grade and ('au', data.get('learningArea') or data.get('subject') or '', grade, f"{code} · {data.get('title') or ''}".rstrip(' ·'))
    if src == 'c3-social-studies':
        grade = us_grade(code.rsplit('.', 1)[-1])
        return grade and ('us', 'Social Studies (C3)', grade, code)
    return None


def main(batch_dir, mapped_dir, out, gap_dir=None):
    batch_dir, mapped_dir = Path(batch_dir), Path(mapped_dir)
    meta = {it['key']: it for it in json.load(open(batch_dir / 'items.json'))}
    items, idx, links, stats = [], {}, defaultdict(list), Counter()

    def add(key, good, n):
        stats['dropped ids'] += n - len(good)
        if not good:
            stats['items empty'] += 1
            return
        stats['items linked'] += 1
        it = meta[key]
        i = idx.setdefault(key, len(items))
        if i == len(items):
            items.append([it['country'], it['subject'], it['grade'], it['title']])
        for t, kind in dict(good).items():
            links[t].append([i, 1 if kind == 'core' else 0])
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
            add(key, [(t, kind) for t, kind in pairs if t in ok], len(pairs))
        stats['batches merged'] += 1
    if gap_dir:
        data = Path(__file__).resolve().parents[2] / 'data'
        known = {t['id'] for f in ('topics.json', 'extra/topics.json') for t in json.load(open(data / f))['topics']}
        for f in sorted(Path(gap_dir).glob('*.json')):
            g = json.load(open(f))
            meta.update({it['key']: it for it in g.get('items', [])})
            for key, pairs in g['links'].items():
                add(key, [(t, kind) for t, kind in pairs if t in known], len(pairs))
    # US, England and Australia: the standards Marble's own topics already carry
    data = Path(__file__).resolve().parents[2] / 'data'
    std = {t['key']: t.get('data', {}) for c in json.load(open(data / 'curriculum-standards.json'))['curricula'] for t in c['topics']}
    for t in json.load(open(data / 'topics.json'))['topics']:
        for key in t.get('standards', []):
            src, code = key.split(':', 1)
            it = standard_item(src, code, std.get(key, {}))
            if not it:
                stats['standards skipped'] += 1
                continue
            i = idx.setdefault(key, len(items))
            if i == len(items):
                items.append(list(it))
            links[t['id']].append([i, 1])
            stats['standard links'] += 1
    Path(out).write_text(json.dumps({'version': 1, 'curricula': CURRICULA, 'items': items, 'links': links},
                                    ensure_ascii=False, separators=(',', ':')))
    per = Counter(x[0] for x in items)
    print(dict(stats), '| items kept per country', dict(per), '| topics linked', len(links),
          f'| {Path(out).stat().st_size // 1024} KB')


if __name__ == '__main__':
    main(*sys.argv[1:5])
