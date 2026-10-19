"""Split the Russian federal work programmes (ФРП, edsoo.ru PDFs as text) into content paragraphs.

Input: ru-frp-1-9.json ({docs: [{title, stage, url, text}]}) as downloaded from edsoo.ru.
Output: JSON list of {subject, stage, grade, section, text} taken from the "СОДЕРЖАНИЕ ОБУЧЕНИЯ"
part only; personal/meta results ("ЛИЧНОСТНЫЕ/МЕТАПРЕДМЕТНЫЕ РЕЗУЛЬТАТЫ") are left out on purpose.
Optional third argument: a JSON list of [subject prefix, regex, replacement] applied to every paragraph.
"""
import json
import re
import sys

GRADE = re.compile(r'^(\d+) КЛАСС$')

def clean(edits, subject, text, hits):
    for i, (subj, pat, repl) in enumerate(edits):
        if subject.startswith(subj):
            text, n = re.subn(pat, repl, text)
            hits[i] += n
    return text.strip()


def content_lines(text):
    """Every "СОДЕРЖАНИЕ ОБУЧЕНИЯ" block (maths 5-9 has one per course), up to the next results/planning heading."""
    lines = [l.strip() for l in text.split('\n')]
    lines = [l for l in lines if l and l != '\f' and not re.fullmatch(r'\d{1,3}', l)
             and not l.startswith('Федеральная рабочая программа |')]
    out, on = [], False
    for l in lines:
        if l == 'СОДЕРЖАНИЕ ОБУЧЕНИЯ':
            on = True
            continue
        if re.match(r'^(ПЛАНИРУЕМЫЕ РЕЗУЛЬТАТЫ|ТЕМАТИЧЕСКОЕ ПЛАНИРОВАНИЕ)', l):
            on = False
        if on:
            out.append(l)
    return out


def paragraphs(lines):
    """PDF lines are justified: a paragraph ends on a line that is short and closes a sentence."""
    grade, section, buf = None, '', []
    width = max(len(l) for l in lines) if lines else 80
    for l in lines:
        m = GRADE.match(l)
        if m:
            if buf: yield grade, section, ' '.join(buf); buf = []
            grade, section = int(m.group(1)), ''
            continue
        is_head = (l.isupper() and len(l) > 3) or (not buf and len(l) < 70 and not re.search(r'[.;:,]$', l))
        if is_head and not buf:
            section = (section + ' ' + l).strip() if l.isupper() and section.isupper() and len(section) < 60 else l
            continue
        buf.append(l)
        if re.search(r'[.!?:;»)]$', l) and len(l) < width * 0.8:
            yield grade, section, ' '.join(buf); buf = []
    if buf: yield grade, section, ' '.join(buf)


def main(src, dst, edits=None):
    docs = json.load(open(src))['docs']
    edits = json.load(open(edits)) if edits else []
    out, hits = [], [0] * len(edits)
    for d in docs:
        for g, sec, p in paragraphs(content_lines(d['text'])):
            p = clean(edits, d['title'], re.sub(r'(\w)- (\w)', r'\1\2', p), hits)
            sec = clean(edits, d['title'], sec, hits)
            if p:
                out.append({'subject': d['title'], 'stage': d['stage'], 'grade': g, 'section': sec, 'text': p})
    if hits and not all(hits):
        raise SystemExit(f'{hits.count(0)} replacement(s) matched nothing')
    json.dump(out, open(dst, 'w'), ensure_ascii=False, indent=0)
    print(len(out), 'paragraphs')


if __name__ == '__main__':
    main(*sys.argv[1:4])
