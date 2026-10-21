"""Parse Estonia's basic-school national curriculum (Põhikooli riiklik õppekava, 2011, current version) into items.

Input: the JSON saved from the subject-field annexes on riigiteataja.ee,
{source, fetched, annexes: {n: {file, pages: [page text, one line per text row]}}}, annexes 1 (language and
literature), 4 (natural sciences), 5 (mathematics), 6 (social studies), 7 (technology) and 10 (informatics).
In each subject's 'Õpitulemused' (learning outcomes) the outcomes are numbered per school stage
(I kooliaste = grades 1-3, II = 4-6, III = 7-9) and, in most subjects, grouped under a domain heading
('Arvutamine', 'Valgusõpetus'); each domain of a stage becomes one item. Stages without domains are cut
into items of a few outcomes. Informatics is organised by study themes ('Õppeteema „Kood“') with their
outcomes and content; each theme becomes one item.
The PDF text layer splits some words ('näi teid'); fragments are rejoined when the joined word occurs
elsewhere in the annexes. Russian-medium and Estonian-as-second-language syllabuses are left out.

Usage: python3 scripts/curricula/parse_ee.py <raw json> <out json>
Output: [{subject, stage, grade, topic, text}], the same shape as the other parsers.
"""
import json
import re
import sys
import unicodedata
from collections import Counter

SKIP = {'Vene keel vene õppekeelega klassis', 'Eesti keel teise keelena'}
STAGES = {'I': '1-3', 'II': '4-6', 'III': '7-9'}
FIRST_STAGE = {'Kirjandus': 'II', 'Ajalugu': 'II', 'Ühiskonnaõpetus': 'II', 'Bioloogia': 'III', 'Füüsika': 'III',
               'Geograafia': 'III', 'Keemia': 'III'}
SUBJECT = re.compile(r'^2\.\s*(\d)\.\s+(\D.+)$')
STAGE = re.compile(r'^(I{1,3})kooliast(?:e|me)|^([369])\.klassilõpetaja')
POINT = re.compile(r'^(\d+)\)\s*(.*)$')
LEAD = re.compile(r'(lõpetaja|Õpilane)\s*:$')
CHUNK = 900


def fix_spacing(text):
    """Undo the PDF text layer's stray spaces: '1 )', 'kõne - ja', 'n äiteid' -> '1)', 'kõne- ja', 'näiteid'."""
    text = re.sub(r'[^\S\n]+', ' ', unicodedata.normalize('NFC', text))
    text = re.sub(r'(?<=\w) ([üõöäÜÕÖÄ]) (?=\w)', r'\1', text)
    text = re.sub(r'^(\d+) (\d+)?\s*\)', lambda m: m.group(1) + (m.group(2) or '') + ')', text, flags=re.M)
    text = re.sub(r'(\w) - (ja|või|ning|ega|kui)\b', r'\1- \2', text)
    text = re.sub(r'\b(ja|või|ning) - (\w)', r'\1 -\2', text)
    text = re.sub(r'(\w) - (\w)', r'\1-\2', text)
    text = re.sub(r' +([,;:.)])', r'\1', text)
    words = Counter(re.findall(r'\w+', text.lower()))

    def join(m):
        a, b = m.group(1), m.group(2)
        return a + b if words[(a + b).lower()] and min(words[a.lower()], words[b.lower()]) <= 2 else f'{a} {b}'

    def letter(m):  # a lone letter belongs to the word before or after it
        a, x, b = m.groups()
        if words[(x + b).lower()] or (not words[(a + x).lower()] and words[b.lower()] <= 1):
            return f'{a} {x}{b}'
        return f'{a}{x} {b}'
    text = re.sub(r'(?<!\w)(\w+) ([a-zõäöü]) (\w+)(?!\w)', letter, text)
    for _ in range(2):
        text = re.sub(r'(?<!\w)(\w+) (\w+)(?!\w)', join, text)
        text = re.sub(r'(?<=\w) (\w+) (\w+)(?!\w)', lambda m: ' ' + join(m), text)
    return text


def lines_of(annex):
    text = fix_spacing('\n'.join(annex['pages']))
    return [l.strip() for l in text.split('\n') if l.strip() and not re.fullmatch(r'[\d\s]+|.{0,3}|[^a-zA-ZõäöüÕÄÖÜ]*', l.strip())]


def is_heading(line, prev):
    return (re.search(r'[.;:]$', prev) and not POINT.match(line) and not re.search(r'[.;:,]$', line)
            and len(line) < 80 and line[0].isupper() and not STAGE.match(line.replace(' ', '')))


def item(subject, grade, topic, text, out):
    """One item; a topic repeated in the same grade (a long list cut in two) gets a number."""
    n = sum(x['grade'] == grade and re.sub(r' \(\d+\)$', '', x['topic']) == topic for x in out)
    return {'subject': subject, 'stage': '1-9', 'grade': grade, 'topic': f'{topic} ({n + 1})' if n else topic, 'text': text}


def outcomes(subject, lines):
    """Items for one subject's learning outcomes: one per (stage, domain), long lists cut into chunks."""
    stage, domain, groups, prev = FIRST_STAGE.get(subject, 'I'), '', [], '.'
    for line in lines:
        if m := STAGE.match(line.replace(' ', '')):
            stage = m.group(1) or {'3': 'I', '6': 'II', '9': 'III'}[m.group(2)]
            domain, prev = '', '.'
            if not LEAD.search(line):
                continue
        if LEAD.search(line):
            groups.append([stage, domain, []])
        elif m := POINT.match(line):
            if not groups or groups[-1][:2] != [stage, domain]:
                groups.append([stage, domain, []])
            groups[-1][2].append(m.group(2))
        elif is_heading(line, prev):
            domain = line
        elif groups and groups[-1][2] and not re.search(r'[.;]$', prev):
            groups[-1][2][-1] += ' ' + line
        prev = line
    out = []
    for stage, domain, points in groups:
        chunk = []
        for p in points + [None]:
            if p is None or (chunk and len(' '.join(chunk)) + len(p) > CHUNK):
                if chunk:
                    head = domain or ' '.join(re.split(r'[;(]', chunk[0])[0].split()[:8]).rstrip(',.:')
                    out.append(item(subject, STAGES[stage], f'{subject}: {head}', ' '.join(chunk), out))
                chunk = []
            if p is not None:
                chunk.append(p)
    return out


def informatics(lines):
    """One item per study theme, its outcomes and content; a long theme is cut at sentence ends."""
    themes, stage = [], None
    for line in lines:
        if m := re.match(r'^2\.(\d)\.\s+Õpitulemused', line):
            stage = ['I', 'II', 'III'][int(m.group(1)) - 1]
            themes.append(None)
        elif m := re.match(r'^2\.\d\.\d\.\s+(?:Õppe)?[Tt]eema\s*„\s*(.+?)\s*“', line):
            themes.append([STAGES[stage], m.group(1), ''])
        elif themes and themes[-1] and not re.fullmatch(r'Õppesisu|Õpilane:', line):
            themes[-1][2] += ' ' + line
    out = []
    for grade, topic, text in filter(None, themes):
        chunk = ''
        for sentence in re.split(r'(?<=[.;])\s+', re.sub(r'\s+', ' ', text).strip()) + [None]:
            if sentence is None and len(chunk) < 300 and out and out[-1]['grade'] == grade \
                    and re.sub(r' \(\d+\)$', '', out[-1]['topic']) == topic:
                out[-1]['text'] += chunk  # a short tail stays with the part before it
            elif sentence is None or (chunk and len(chunk) + len(sentence) > CHUNK + 200):
                out.append(item('Informaatika', grade, topic, chunk.strip(), out))
                chunk = ''
            if sentence is not None:
                chunk += ' ' + sentence
    return out


def main(src, dst):
    out = []
    for n, annex in json.load(open(src))['annexes'].items():
        lines = lines_of(annex)
        if n == '10':
            out += informatics(lines)
            continue
        subjects, cur = [], None
        for line in lines:
            if m := SUBJECT.match(line):
                cur = [m.group(2).strip(), False, []]
                subjects.append(cur)
            elif cur and re.match(r'^2\.\s*\d\.\s*\d\.\s*Õpitulemused', line):
                cur[1] = True
            elif cur and cur[1]:
                cur[2].append(line)
        for name, _, body in subjects:
            name = 'Tööõpetus ja tehnoloogia' if name.startswith('Tööõpetus') else name
            if name not in SKIP:
                out += outcomes(name, body)
    for x in out:
        x['text'] = re.sub(r'\s+', ' ', x['text']).strip()
    out = [x for x in out if x['text']]
    json.dump(out, open(dst, 'w'), ensure_ascii=False, indent=0)
    print(len(out), 'sections;', sum(len(x['text']) for x in out) // 1000, 'k chars')


if __name__ == '__main__':
    main(*sys.argv[1:3])
