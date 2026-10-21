"""Parse Singapore MOE primary syllabuses (Mathematics 2021 P1-P6, Science 2023 P3-P6) into curriculum items.

Input: the JSON saved from the syllabus PDF, {source, subject, pages: [page text, one line per text row]}.
Science: each learning-outcome page starts with a heading such as 'Diversity of Materials (P3)' or
'Cycles in Matter and Water (Water) (P5 Standard)'; consecutive pages with the same heading are one item.
Mathematics: 'Content by Level' lists, per level and sub-strand, numbered topics ('2. Four Operations')
with their points ('2.1 adding and subtracting mixed numbers'); each numbered topic is one item.
Foundation variants repeat the Standard content in smaller form and are skipped.

Usage: python3 scripts/curricula/parse_sg.py <raw json>... <out json>
Output: [{subject, stage, grade, topic, text}], the same shape as the other parsers.
"""
import json
import re
import sys

SUBJECTS = {'science': 'Science', 'mathematics': 'Mathematics'}
HEAD = re.compile(r'^(.+?) \(P(\d)(?: (Standard|Foundation))?\)$')
NOISE = re.compile(r'^(Learning Outcomes|Core Ideas Practices Values, Ethics and Attitudes|\d+|OFFICIAL \(OPEN\))$')


LEVELS = {'ONE': '1', 'TWO': '2', 'THREE': '3', 'FOUR': '4', 'FIVE': '5', 'SIX': '6'}
MATH_NOISE = re.compile(r'^(Updated: |Content by Level|\d+$|In 2025, the 2021|Students in Primary 6|syllabus will be|will be applicable)')


def maths(pages):
    out, grade, strand, cur = [], None, None, None
    for line in '\n'.join(pages).split('\n'):
        l = line.strip()
        if not l or MATH_NOISE.match(l):
            continue
        if m := re.match(r'^PRIMARY (ONE|TWO|THREE|FOUR|FIVE|SIX)( \(FOUNDATION\))?$', l):
            grade = None if m.group(2) else LEVELS[m.group(1)]
            cur = None
        elif grade is None:
            continue
        elif m := re.match(r'^SUB-STRAND:\s*(.+)$', l):
            strand, cur = m.group(1).strip().title().replace(' And ', ' and '), None
        elif l in ('NUMBER AND ALGEBRA', 'MEASUREMENT AND GEOMETRY', 'STATISTICS'):
            cur = None
        elif m := re.match(r'^\d+\. (.+)$', l):
            topic = strand if m.group(1) == strand else f'{strand}: {m.group(1)}'
            cur = next((x for x in out if x['grade'] == grade and x['topic'] == topic), None)
            if cur is None:  # a topic split by a page break repeats its heading
                cur = {'subject': 'Mathematics', 'stage': '1-6', 'grade': grade, 'topic': topic, 'text': ''}
                out.append(cur)
        elif cur is not None:
            cur['text'] += ' ' + l
    return out


def science(pages):
    out, cur = [], None
    for page in pages:
        lines = page.split('\n')
        m = HEAD.match(lines[0].strip())
        if not m or m.group(3) == 'Foundation':
            continue
        topic, grade = re.sub(r'\(\s+', '(', re.sub(r'\s+-\s+', '-', m.group(1))), m.group(2)
        body = [l for l in lines[1:] if not NOISE.match(l.strip())]
        if cur and cur['topic'] == topic and cur['grade'] == grade:
            cur['text'] += ' ' + ' '.join(body)
        else:
            cur = {'subject': 'Science', 'stage': '1-6', 'grade': grade, 'topic': topic, 'text': ' '.join(body)}
            out.append(cur)
    return out


def main(*paths):
    *srcs, dst = paths
    out = []
    for src in srcs:
        raw = json.load(open(src))
        out += science(raw['pages']) if SUBJECTS[raw['subject']] == 'Science' else maths(raw['pages'])
    for x in out:
        x['text'] = re.sub(r'\s+', ' ', x['text']).strip()
    json.dump(out, open(dst, 'w'), ensure_ascii=False, indent=0)
    print(len(out), 'sections;', sum(len(x['text']) for x in out) // 1000, 'k chars')


if __name__ == '__main__':
    main(*sys.argv[1:])
