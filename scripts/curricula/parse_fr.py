"""Parse France's primary-school programmes (CP to CM2, grades 1-5) into curriculum items.

Input: the JSON saved from the programme annexes published in the Bulletin officiel (education.gouv.fr, licence
etalab-2.0), {source, fetched, docs: {key: {file, pages: [page text, one line per text row]}}}:
français and mathématiques for cycle 2 (2024) and cycle 3 (2025), histoire-géographie and sciences et
technologie for cycles 2 and 3 (2026). The sciences annexes are published as images; their pages are the OCR
text (tesseract, fra).
Each programme opens with a 'Sommaire' that lists its domains, school years and sections in order. The body is
read with those headings: a year heading ('Cours préparatoire' … 'Cours moyen deuxième année') sets the grade,
a domain heading the domain, and every section of a year ('Les nombres entiers', 'Thème 1 : …') becomes one
item. Sixième (lower secondary) and the general principles are left out. The cycle 3 français sections cover
CM1 and CM2 together.

Usage: python3 scripts/curricula/parse_fr.py <raw json> <out json>
Output: [{subject, stage, grade, topic, text}], the same shape as the other parsers.
"""
import json
import re
import sys

DOCS = {
    'fr-c2': ('Français', ['Lecture', 'Écriture', 'Oral', 'Vocabulaire', 'Grammaire et orthographe']),
    'fr-c3': ('Français', ['Lecture', 'Culture littéraire et artistique', 'Écriture', 'Oral', 'Vocabulaire',
                           'Grammaire et orthographe grammaticale']),
    'ma-c2': ('Mathématiques', ['Nombres, calcul et résolution de problèmes', 'Grandeurs et mesures',
                                'Espace et géométrie', 'Organisation et gestion de données']),
    'ma-c3': ('Mathématiques', ['Nombres, calcul et résolution de problèmes', 'Grandeurs et mesures',
                                'Espace et géométrie', 'Organisation et gestion de données et probabilités',
                                'La proportionnalité', 'Initiation à la pensée informatique']),
    'hg-c2': ('Histoire-géographie', ['Histoire', 'Géographie']),
    'hg-c3': ('Histoire-géographie', ['Histoire', 'Géographie']),
    'st-c2': ('Sciences et technologie', ['La matière, les mesures, l’électricité', 'Les êtres vivants dans leur environnement',
                                          'Le corps humain et la santé', 'Les objets techniques au cœur de la société']),
    'st-c3': ('Sciences et technologie', ['La matière, les mouvements et les signaux', 'Les êtres vivants dans leur environnement',
                                          'Le corps humain et la santé', 'Les objets techniques au cœur de la société']),
}
YEARS = {'Cours préparatoire': '1', 'Cours élémentaire première année': '2', 'Cours élémentaire deuxième année': '3',
         'Cours moyen première année': '4', 'Cours moyen deuxième année': '5', 'Cours moyen première et deuxième années': '4-5',
         'Sixième': None}
YEAR = re.compile(r'^(%s)\b' % '|'.join(sorted(YEARS, key=len, reverse=True)))
THEME = re.compile(r'^Thème (\d+|introductif) ?: ?(.+)$')
SKIP = {'principes', 'points de vigilance pour les professeurs', 'point de vigilance pour les professeurs', 'repères',
        'fréquence des temps d’apprentissage'}
BODY = {'fr-c3': 5}  # the Sommaire repeats 'Principes' under each domain; the body opens at the next one
SUP = {'e', 'er', 're'}
ROMAN_SUP = re.compile(r'\b[IVXL]+(e|er|re)$')
DEFAULT_GRADE = {'fr-c3': '4-5'}  # its sections list CM1 and CM2 side by side


def norm(s):
    s = re.sub(r'_{3,}.*$', '', s.replace("'", '’'))
    return re.sub(r'\s+', ' ', s).strip(' .').lower()


def theme_topic(s):
    s = re.sub(r'\s*\((?:[^()]*périodes?[^()]*|[^()]*heures?[^()]*)\)', '', s)
    return re.sub(r'\s*\([^)]*$', '', s).strip(' :')


def parse(key, pages):
    subject, domains = DOCS[key]
    lines = []
    for l in (l.strip() for l in '\n'.join(pages).split('\n')):
        if lines and (l in SUP or ROMAN_SUP.search(lines[-1])):
            lines[-1] += l if l in SUP else ' ' + l  # superscripts ('XI' 'e' '- XIII') sit on lines of their own
        elif l:
            lines.append(l)
    start = lines.index('Sommaire') + 1
    principes = [i for i, l in enumerate(lines) if l == 'Principes']
    body = principes[BODY.get(key, 1)]
    heads = {norm(l) for l in lines[start:body] if len(l) > 3} - SKIP
    doms = {norm(d): d for d in domains}
    out, cur, domain, grade = [], None, None, None
    for line in lines[body:]:
        n = norm(line)
        if (m := YEAR.match(line)) and len(line) < 130:
            grade, cur = YEARS[m.group(1)], None
            if grade and domain:  # a year without sections ('La proportionnalité') is one item
                cur = {'subject': subject, 'stage': '1-5', 'grade': grade, 'topic': domain, 'text': ''}
                out.append(cur)
        elif n in doms:
            domain, grade, cur = doms[n], DEFAULT_GRADE.get(key), None
        elif n in SKIP:
            cur = None
        elif grade and domain and ((m := THEME.match(line)) or (n in heads and len(line) < 120)):
            section = theme_topic(m.group(2)) if m else re.sub(r'\s*_{3,}.*$', '', line)
            cur = {'subject': subject, 'stage': '1-5', 'grade': grade, 'topic': f'{domain}: {section}', 'text': ''}
            out.append(cur)
        elif cur is not None:
            cur['text'] += ' ' + line
    return out


def main(src, dst):
    out = []
    for key, doc in json.load(open(src))['docs'].items():
        out += parse(key, doc['pages'])
    for x in out:
        x['text'] = re.sub(r'\s+', ' ', x['text']).strip()
    out = [x for x in out if x['text']]
    json.dump(out, open(dst, 'w'), ensure_ascii=False, indent=0)
    print(len(out), 'sections;', sum(len(x['text']) for x in out) // 1000, 'k chars')


if __name__ == '__main__':
    main(*sys.argv[1:3])
