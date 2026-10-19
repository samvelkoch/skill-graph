"""Split the Hungarian NAT 2020 kerettanterv subjects into topics (Témakör blocks).

Input: kerettanterv-2020-1-8.json ({docs: [{stage, title, url, text}]}) from oktatas.hu.
Output: JSON list of {subject, stage, grade, topic, hours, text}; text = learning outcomes, development tasks /
knowledge and concepts of the topic (whitespace-normalized, capped). The per-band overview tables
("Témakör neve | Javasolt óraszám") sit before the first "Témakör:" line of a band and yield no topics.
"""
import json
import re
import sys
from collections import Counter

BAND = re.compile(r'^(?:A\s+|AZ\s+)?(\d)\s*[–-]?\s*(\d)?\.\s*évfolyam\s*$', re.I)
TITLE_RANGE = re.compile(r'\s*(\d)\s*[–-]\s*(\d)\.\s*évfolyam\s*$|\s*(\d)\.\s*évfolyam\s*$')
TOPIC = re.compile(r'^Témakör:\s*(.+)$', re.I)
HOURS = re.compile(r'^(?:Javasolt (?:minimum )?óraszám|JAVASOLT ÓRASZÁM ÖSSZESEN|JAVASOLT ÖSSZÓRASZÁM):\s*(\d+)', re.I)
BOILER = 'A témakör tanulása hozzájárul ahhoz, hogy a tanuló a nevelési-oktatási szakasz végére:'
CAP = 4000


def rng(a, b=None):
    return str(a) if not b or str(a) == str(b) else f'{a}-{b}'


def split_title(title):
    m = TITLE_RANGE.search(title)
    subj = title[:m.start()].strip()
    g = rng(m.group(1), m.group(2)) if m.group(1) else m.group(3)
    return subj, g


def clean(l):
    l = l.replace('\xa0', ' ').strip()
    if l.startswith('|'):
        l = ' '.join(c.strip() for c in l.strip('| ').split('|') if c.strip())
    return re.sub(r'\s+', ' ', l)


def parse_doc(d):
    subj, tgrade = split_title(d['title'])
    lines = [l.strip() for l in d['text'].split('\n')]
    # band headings; a whole-range heading that contains narrower ones is ignored
    heads = {}
    for i, l in enumerate(lines):
        m = BAND.match(l)
        if m and len(l) < 40:
            heads[i] = (int(m.group(1)), int(m.group(2) or m.group(1)))
    narrow = list(heads.values())
    heads = {i: r for i, r in heads.items()
             if not any(n != r and n[0] >= r[0] and n[1] <= r[1] for n in narrow)}
    out, cur, grade = [], None, tgrade

    def flush():
        nonlocal cur
        if cur:
            text = ' '.join(x for x in (clean(l) for l in cur['lines']) if x and x != BOILER)
            out.append({'subject': subj, 'stage': d['stage'], 'grade': cur['grade'], 'topic': cur['topic'],
                        'hours': cur['hours'], 'text': text[:CAP]})
        cur = None

    for i, l in enumerate(lines):
        if i in heads:
            flush()
            grade = rng(*heads[i])
            continue
        m = TOPIC.match(l)
        if m:
            flush()
            cur = {'topic': re.sub(r'\s+', ' ', m.group(1)).strip(), 'grade': grade, 'hours': None, 'lines': []}
            continue
        if cur is None:
            continue
        if re.match(r'^Modul\s+[„"]', l):
            flush()
            continue
        h = HOURS.match(l)
        if h and cur['hours'] is None and len(cur['lines']) < 3:
            cur['hours'] = int(h.group(1))
            continue
        cur['lines'].append(l)
    flush()
    return out


def main(src, dst):
    docs = json.load(open(src))['docs']
    out = []
    for d in docs:
        out += parse_doc(d)
    json.dump(out, open(dst, 'w'), ensure_ascii=False, indent=0)
    print(len(out), 'topics')
    for (s, g), n in sorted(Counter((r['subject'], r['grade']) for r in out).items()):
        print(f'  {s} | {g}: {n}')
    print('no hours:', sum(r['hours'] is None for r in out), '| empty text:', sum(not r['text'] for r in out),
          '| capped:', sum(len(r['text']) >= CAP for r in out))
    for r in (out[0], out[len(out) // 2]):
        print(json.dumps({**r, 'text': r['text'][:300]}, ensure_ascii=False))


if __name__ == '__main__':
    main(*sys.argv[1:3])
