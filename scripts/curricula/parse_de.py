"""Parse Bavaria's LehrplanPLUS (Grundschule 1-4, Gymnasium 5-9) into curriculum items.

Input: the JSON saved from lehrplanplus.bayern.de, {pages: [{schulart, grade, subject, title, text}]}, where
text is the subject plan with one block element per line. Every plan section starts with a line such as
'D3/4 1.1 Verstehend zuhören', 'G7 Lernbereich 1: König und Reich' or 'D1/2Grammatisches Prinzip nutzen';
each section with content of its own becomes one item.

Usage: python3 scripts/curricula/parse_de.py <raw json> <out json>
Output: [{subject, stage, grade, topic, text}], the same shape as the other parsers.
"""
import json
import re
import sys

SUBJECTS = {'deutsch': 'Deutsch', 'mathematik': 'Mathematik', 'hsu': 'Heimat- und Sachunterricht',
            'nt_gym': 'Natur und Technik', 'biologie': 'Biologie', 'physik': 'Physik', 'chemie': 'Chemie',
            'geographie': 'Geographie', 'geschichte': 'Geschichte', 'informatik': 'Informatik',
            'wirtschaft-und-recht': 'Wirtschaft und Recht', 'pug': 'Politik und Gesellschaft'}
# lines that only label the layout of a section
NOISE = re.compile(r'^(Inklusion|Digital|Kompetenzerwartungen( und Inhalte)?|Die Schülerinnen und Schüler \.\.\.'
                   r'|Inhalte zu den Kompetenzen:?|ca\. \d+ Std\.|Weitere Informationen)$')


def sections(text):
    lines = text.split('\n')
    first = next((l for l in lines if re.match(r'^[A-Z][A-Za-z]{0,4}\d+(/\d+)? ', l)), None)
    if not first:
        return
    code = re.escape(first.split(' ')[0])
    head = re.compile(rf'^{code}\s*(?:Lernbereich \d+:\s*|\d+(?:\.\d+)*\s+)?(.+)$')
    cur = None
    for l in lines:
        m = head.match(l)
        if m and len(l) < 200:
            if cur and cur['text']:
                yield cur
            cur = {'topic': m.group(1).strip(), 'text': []}
        elif cur is not None and not NOISE.match(l):
            cur['text'].append(l)
    if cur and cur['text']:
        yield cur


def main(src, dst):
    out = []
    for p in json.load(open(src))['pages']:
        g = p['grade']
        grade = f'{g}-{g + 1}' if p['schulart'] == 'grundschule' else str(g)
        for s in sections(p['text']):
            out.append({'subject': SUBJECTS[p['subject']], 'stage': '1-4' if g < 5 else '5-9', 'grade': grade,
                        'topic': s['topic'], 'text': ' '.join(s['text'])})
    json.dump(out, open(dst, 'w'), ensure_ascii=False, indent=0)
    print(len(out), 'sections;', sum(len(x['text']) for x in out) // 1000, 'k chars')


if __name__ == '__main__':
    main(*sys.argv[1:3])
