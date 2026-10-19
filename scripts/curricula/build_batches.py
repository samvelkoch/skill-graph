"""Turn parsed national curricula into mapping batches: one batch per country + subject + grade.

Each batch carries the curriculum items (key, title, text) and the candidate graph topics an item may
map to (graph subjects that fit the school subject, ages around the grade). A model reads one batch and
writes <batch>.out.json = {"<item key>": [[topic id, "core" | "related"], ...]}; merge.py joins them.

Usage: python3 scripts/curricula/build_batches.py <parsed dir> <batch dir>
"""
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

ENGLISH, MATHS, SCIENCE, HISTORY = ['English'], ['Mathematics'], ['Science'], ['History']
SOCIAL = ['Personal & Social Development', 'Life Skills', 'Learning to Learn']
COMPUTING = ['Computing', 'Mathematics']
WORLD = SCIENCE + HISTORY + SOCIAL  # primary "world around us" subjects mix all three

# School subject (prefix) -> graph subjects. Subjects with no counterpart in the graph
# (crafts/technology, religious culture) are left out.
SUBJECTS = {
    'ru': {'Русский язык': ENGLISH, 'Литературное чтение': ENGLISH, 'Литература': ENGLISH, 'Математика': MATHS,
           'Окружающий мир': WORLD, 'Информатика': COMPUTING, 'Физика': SCIENCE, 'Химия': SCIENCE,
           'Биология': SCIENCE, 'География': SCIENCE, 'История': HISTORY, 'Обществознание': SOCIAL},
    'hu': {'Magyar nyelv': ENGLISH, 'Matematika': MATHS, 'Etika': SOCIAL, 'Környezetismeret': WORLD,
           'Digitális kultúra': COMPUTING, 'Történelem': HISTORY, 'Állampolgári': SOCIAL, 'Hon- és népismeret': HISTORY + SOCIAL,
           'Természettudomány': SCIENCE, 'Kémia': SCIENCE, 'Fizika': SCIENCE, 'Biológia': SCIENCE, 'Földrajz': SCIENCE},
    'rs': {'Српски језик': ENGLISH, 'Математика': MATHS, 'Свет око нас': WORLD, 'Природа и друштво': WORLD,
           'Дигитални свет': COMPUTING, 'Информатика': COMPUTING, 'Историја': HISTORY, 'Географија': SCIENCE,
           'Биологија': SCIENCE, 'Физика': SCIENCE, 'Хемија': SCIENCE},
}
TEXT_CAP = 1200
RU_MERGE = 700  # RU paragraphs are short; merge neighbours of the same section up to this size


def graph_subjects(country, subject):
    for prefix, subj in SUBJECTS[country].items():
        if subject.startswith(prefix):
            return subj
    return None


def grade_range(grade, fallback=None):
    """'3-4' / '3–4' / 3 / None -> (lo, hi); RU subjects without a grade use the stage range."""
    g = str(grade if grade is not None else fallback or '')
    nums = [int(x) for x in re.findall(r'\d+', g)]
    return (nums[0], nums[-1]) if nums else (1, 9)


def ru_items(rows):
    """Merge consecutive RU paragraphs of the same subject/grade/section into items of ~RU_MERGE chars."""
    cur = None
    for r in rows:
        key = (r['subject'], r['stage'], r['grade'], r['section'])
        if cur and cur['k'] == key and len(cur['text']) + len(r['text']) < RU_MERGE:
            cur['text'] += ' ' + r['text']
            continue
        if cur:
            yield cur
        cur = {'k': key, 'subject': r['subject'], 'grade': r['grade'], 'stage': r['stage'],
               'topic': r['section'] if 3 < len(r['section']) < 90 else '', 'text': r['text']}
    if cur:
        yield cur


def title_of(item):
    if item.get('topic') and item['topic'] != 'ИСХОДИ':
        return item['topic'].strip().capitalize() if item['topic'].isupper() else item['topic'].strip()
    first = re.split(r'(?<=[.;:])\s', item['text'], maxsplit=1)[0]
    return first[:90].rstrip(' .;:')


def main(parsed, out):
    parsed, out = Path(parsed), Path(out)
    out.mkdir(parents=True, exist_ok=True)
    topics = json.load(open(Path(__file__).resolve().parents[2] / 'data/topics.json'))['topics']
    groups, items = defaultdict(list), []
    for country in ('ru', 'hu', 'rs'):
        rows = json.load(open(parsed / f'{country}.json'))
        src = ru_items(rows) if country == 'ru' else rows
        for i, r in enumerate(src):
            if country == 'rs' and r.get('topic') == 'ИСХОДИ':
                continue  # per-grade outcome lists duplicate the topics' content
            subj = graph_subjects(country, r['subject'])
            if not subj:
                continue
            lo, hi = grade_range(r['grade'], r.get('stage'))
            it = {'key': f'{country}:{i}', 'country': country, 'subject': r['subject'].strip(),
                  'grade': f'{lo}' if lo == hi else f'{lo}-{hi}', 'title': title_of(r),
                  'text': re.sub(r'\s+', ' ', r['text'])[:TEXT_CAP]}
            items.append(it)
            groups[(country, it['subject'], it['grade'])].append(it)

    manifest = []
    for n, ((country, subject, grade), its) in enumerate(sorted(groups.items())):
        subj = graph_subjects(country, subject)
        lo, hi = grade_range(grade)
        age_lo, age_hi = lo + 5, hi + 7  # grade 1 is age 6-7 in all three systems; leave room both ways
        cands = defaultdict(list)  # "subject / domain" -> ["id | name | ages"], compact for the model
        for t in topics:
            if t['subject'] in subj and t['ageRangeStart'] <= age_hi and t['ageRangeEnd'] >= age_lo - 1:
                cands[f"{t['subject']} / {t['domain']}"].append(f"{t['id']} | {t['name']} | {t['ageRangeStart']}-{t['ageRangeEnd']}")
        name = f'{n:03d}-{country}-g{grade}'
        json.dump({'batch': name, 'country': country, 'subject': subject, 'grade': grade,
                   'items': [{k: it[k] for k in ('key', 'title', 'text')} for it in its],
                   'candidates': cands}, open(out / f'{name}.json', 'w'), ensure_ascii=False)
        manifest.append({'batch': name, 'items': len(its), 'candidates': sum(map(len, cands.values()))})
    json.dump([{k: it[k] for k in ('key', 'country', 'subject', 'grade', 'title')} for it in items],
              open(out / 'items.json', 'w'), ensure_ascii=False)
    json.dump(manifest, open(out / 'manifest.json', 'w'), ensure_ascii=False, indent=0)
    print(len(items), 'items in', len(manifest), 'batches;',
          sum(m['items'] for m in manifest if m['batch'].split('-')[1] == 'ru'), 'ru,',
          sum(m['items'] for m in manifest if m['batch'].split('-')[1] == 'hu'), 'hu,',
          sum(m['items'] for m in manifest if m['batch'].split('-')[1] == 'rs'), 'rs;',
          'max candidates', max(m['candidates'] for m in manifest))


if __name__ == '__main__':
    main(*sys.argv[1:3])
