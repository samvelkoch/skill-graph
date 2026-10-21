"""Parse Japan's Course of Study (学習指導要領, 2017) from MEXT's code tables into curriculum items.

Input: the CSV code tables published by MEXT (学習指導要領コード): elementary 82V12 and lower secondary 83V11,
columns 教科等, No, 学習指導要領テキスト, 学習指導要領コード, one row per line of the Course of Study.
Within each subject's '第２' part, a grade heading ('〔第３学年〕', '〔第１学年及び第２学年〕') opens a grade
and '２　内　容' its content; every numbered entry '(1) …' of that content, with its points (ア, (ｱ) …),
becomes one item. Example-activity entries ('(1)に示す事項については…') are skipped. Lower-secondary
subjects organised by field rather than by grade (社会, 理科, 技術・家庭) get grades 7-9.

Usage: python3 scripts/curricula/parse_jp.py <elementary csv> <lower secondary csv> <out json>
Output: [{subject, stage, grade, topic, text}], the same shape as the other parsers.
"""
import csv
import json
import re
import sys

KEEP = {'国語', '算数', '数学', '社会', '理科', '生活', '家庭', '技術・家庭'}
DIGITS = str.maketrans('０１２３４５６７８９', '0123456789')
GRADE = re.compile(r'^〔第(\d)学年(?:及び第(\d)学年)?〕')
CONTENT_ON = re.compile(r'^2\s*内\s*容')
CONTENT_OFF = re.compile(r'^(3\s*内容の取扱い|第[2-9]\s|1\s*目\s*標)')
DOMAIN = re.compile(r'^(?:[Ａ-Ｚ]\s+(.+)|〔(.+)〕)$')
ITEM = re.compile(r'^\((\d+)\)\s*(.+)$', re.S)


def topic_of(head):
    """'物と重さ\n物の性質について…' -> '物と重さ'; '概数に関わる数学的活動を通して…' -> '概数'."""
    first = re.sub(r'（[^）]*）', '', head.split('\n')[0]).strip()
    if first.startswith('内容の'):
        return ''
    return first if len(first) <= 30 else re.split(r'に関わる|に関する|について|を通して|，|、|。', first)[0].strip()


def parse(path, offset, stage):
    rows = list(csv.reader(open(path, encoding='utf-8-sig')))[2:]
    out, cur = [], None
    state = {}
    for subj, _, text, _ in rows:
        if subj not in KEEP:
            continue
        line = text.translate(DIGITS).strip()
        st = state.setdefault(subj, {'grade': None, 'on': False, 'domain': ''})
        first = line.split('\n')[0]
        if m := GRADE.match(first):
            lo, hi = int(m.group(1)) + offset, int(m.group(2) or m.group(1)) + offset
            st.update(grade=f'{lo}' if lo == hi else f'{lo}-{hi}', on=False, domain='')
            cur = None
        elif CONTENT_ON.match(first):
            st['on'], cur = True, None
            st['grade'] = st['grade'] or ('7-9' if offset else None)
        elif CONTENT_OFF.match(first):
            st['on'], cur = False, None
        elif not st['on'] or not st['grade']:
            continue
        elif m := DOMAIN.match(first):
            st['domain'], cur = (m.group(1) or m.group(2)).strip(), None
        elif m := ITEM.match(line):
            if 'に示す事項については' in m.group(2):
                cur = None
                continue
            head = topic_of(m.group(2))
            topic = f"{st['domain']}: {head}" if st['domain'] and head and head != st['domain'] else head or st['domain']
            cur = {'subject': subj, 'stage': stage, 'grade': st['grade'], 'topic': topic, 'text': m.group(2)}
            out.append(cur)
        elif cur is not None:
            cur['text'] += ' ' + line
    for x in out:
        x['text'] = re.sub(r'\s+', ' ', x['text']).strip()
    return out


def main(elem, junior, dst):
    out = parse(elem, 0, '1-6') + parse(junior, 6, '7-9')
    json.dump(out, open(dst, 'w'), ensure_ascii=False, indent=0)
    print(len(out), 'sections;', sum(len(x['text']) for x in out) // 1000, 'k chars')


if __name__ == '__main__':
    main(*sys.argv[1:4])
