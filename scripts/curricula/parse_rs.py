"""Split the Serbian "Програм наставе и учења" acts (Просветни гласник, text of the legal acts) into topics.

Input: rs-program-nastave-1-8.json ({docs: [{grade, kind: base|amendment, actId, ref, url, text}]}).
Output: JSON list of {subject, stage, grade, topic, hours, text}.

Structure of every subject (base and 2026 amendments alike): an upper-case subject name line directly followed by
the "Циљ ..." paragraph (base acts put "Назив предмета" before it), a "Разред <ordinal>" cell (the "5-6" act
holds one programme per разред, so the grade is read from there, not from the act), "Годишњи фонд часова",
"ИСХОДИ" with the dash-bullet learning outcomes of the whole subject+grade, then upper-case topic headings
("ОБЛАСТ/ТЕМА" in base acts, "ТЕМА и кључни појмови садржаја" in amendments), each followed by its content,
up to "УПУТСТВО ЗА ДИДАКТИЧКО-МЕТОДИЧКО ОСТВАРИВАЊЕ ПРОГРАМА".
Outcomes are not split per topic in the source, so they come out as one record per subject+grade with
topic "ИСХОДИ" (hours = annual hours of the subject). Amendment programmes replace base ones for the same subject+grade.
"""
import json
import re
import sys
from collections import Counter, defaultdict

KEEP = {'СРПСКИ ЈЕЗИК', 'СРПСКИ ЈЕЗИК И КЊИЖЕВНОСТ', 'МАТЕМАТИКА', 'СВЕТ ОКО НАС', 'ПРИРОДА И ДРУШТВО', 'ИСТОРИЈА',
        'ГЕОГРАФИЈА', 'БИОЛОГИЈА', 'ФИЗИКА', 'ХЕМИЈА', 'ТЕХНИКА И ТЕХНОЛОГИЈА', 'ИНФОРМАТИКА И РАЧУНАРСТВО',
        'ДИГИТАЛНИ СВЕТ'}
ORD = {'први': '1', 'други': '2', 'трећи': '3', 'четврти': '4', 'пети': '5', 'шести': '6', 'седми': '7', 'осми': '8'}
LATIN = str.maketrans('ABCEHKMOPTXaceopxy', 'АВСЕНКМОРТХасеорху')
STOP = re.compile(r'^(УПУТСТВО ЗА ДИДАКТИЧКО|ДОДАТНИ САДРЖАЈИ|\d\. (ИЗБОРНИ|ПРЕПОРУКЕ|НАЧИН|ХОР))')
SKIP_HEAD = re.compile(r'^(ОБЛАСТ ?/? ?(ТЕМА)?|САДРЖАЈИ|ТЕМА( И)?|КЉУЧНИ ПОЈМОВИ.*|КЉУЧНИ ПОЈМОВИ САДРЖАЈА.*|ИСХОДИ|ПО ЗАВРШЕТКУ.*)$', re.I)
BULLET = ('–', '−', '-', '—', '•')
CAP = 4000


def norm(s):
    return re.sub(r'\s+', ' ', s.replace('\xa0', ' ')).strip()


def is_head(l):
    return (l.isupper() and 3 < len(l) <= 120 and not l.startswith(BULLET) and not l.endswith((';', ','))
            and not re.match(r'^(СПК \d|I+V?\.|IV\.|V\.)', l))


def lines_of(text):
    out = [norm(l) for l in text.split('\n')]
    return [l for l in out if l and l != '|']


def subject_starts(L):
    """Indices of subject name lines: upper-case line followed by the "Циљ" paragraph (all subjects, kept or not)."""
    return [i for i in range(len(L) - 1)
            if L[i].isupper() and len(L[i]) < 70 and L[i + 1].startswith('Циљ')
            and not L[i + 1].startswith('Циљ обраде') and not L[i].startswith(BULLET) and not STOP.match(L[i])]


def parse_block(name, B, doc_grade):
    """B = lines of one subject block; yields records of one subject+grade."""
    try:
        r = next(i for i, l in enumerate(B) if l == 'Разред')
    except StopIteration:
        return []
    m = re.match(r'\w+', B[r + 1])
    grade = ORD.get(m.group(0).translate(LATIN).lower()) if m else None
    if not grade:
        return []
    hours = None
    for l in B[r:r + 8]:
        if 'Годишњи фонд' in l:
            continue
        h = re.match(r'^(\d+)\s*(час|$)', l)
        if h and hours is None and B[B.index(l) - 1].startswith('Годишњи'):
            hours = int(h.group(1))
    try:
        s = next(i for i in range(r, len(B)) if B[i] == 'ИСХОДИ')
    except StopIteration:
        return []
    outcomes, topics, cur = [], [], None
    for l in B[s + 1:]:
        if STOP.match(l):
            break
        if SKIP_HEAD.match(l) or l.startswith('кључни појмови'):
            continue
        if is_head(l):
            l = l.translate(LATIN)
            if cur is not None and not cur[1]:  # heading directly after heading: a sub-heading of the same topic
                cur[1].append(l)
            else:
                cur = [l, []]
                topics.append(cur)
        elif cur is None:
            if l.startswith(BULLET):
                outcomes.append(l)
        else:
            cur[1].append(l)
    recs = [{'subject': name, 'grade': grade, 'topic': t, 'hours': None, 'text': ' '.join(c)[:CAP]} for t, c in topics]
    if outcomes:
        recs.insert(0, {'subject': name, 'grade': grade, 'topic': 'ИСХОДИ', 'hours': hours,
                        'text': ' '.join(outcomes)[:CAP]})
    return recs


def parse_doc(d):
    L = lines_of(d['text'])
    starts = subject_starts(L)
    out = []
    for a, b in zip(starts, starts[1:] + [len(L)]):
        name = L[a].translate(LATIN)
        if name not in KEEP:
            continue
        out += parse_block(name.capitalize(), L[a:b], d['grade'])
    return out


def main(src, dst):
    docs = json.load(open(src))['docs']
    base, amend = defaultdict(list), defaultdict(list)
    for d in docs:
        stage = '1-4' if d['grade'] in ('1', '2', '3', '4') else '5-8'
        for r in parse_doc(d):
            r['stage'] = stage
            (amend if d['kind'] == 'amendment' else base)[(r['subject'], r['grade'])].append(r)
    replaced = sorted(set(base) & set(amend))
    kept = {**base, **amend}
    order = ['stage', 'subject', 'grade', 'topic', 'hours', 'text']
    out = [{k: r[k] for k in order} for key in sorted(kept, key=lambda k: (int(k[1]), k[0])) for r in kept[key]]
    json.dump(out, open(dst, 'w'), ensure_ascii=False, indent=0)
    print(len(out), 'records (topics + one ИСХОДИ record per subject+grade)')
    cnt = Counter((r['grade'], r['subject']) for r in out if r['topic'] != 'ИСХОДИ')
    for (g, s), n in sorted(cnt.items(), key=lambda x: (int(x[0][0]), x[0][1])):
        print(f'  grade {g} | {s}: {n} topics{"  [from amendment]" if (s, g) in amend else ""}')
    print('amendment replaced base for:', ', '.join(f'{s} {g}' for s, g in replaced) or '-')
    print('amendment-only (no base):', ', '.join(f'{s} {g}' for s, g in sorted(set(amend) - set(base))) or '-')
    print('capped:', sum(len(r['text']) >= CAP for r in out), '| empty text:', sum(not r['text'] for r in out))
    for r in (out[1], out[len(out) // 2]):
        print(json.dumps({**r, 'text': r['text'][:300]}, ensure_ascii=False))


if __name__ == '__main__':
    main(*sys.argv[1:3])
