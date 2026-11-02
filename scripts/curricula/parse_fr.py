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

Usage: python3 scripts/curricula/parse_fr.py <raw json>... <out json>  (the primary-school file first)
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
    'fr-c4': ('Français', ['Lecture', 'Culture littéraire et artistique', 'Écriture', 'Oral',
                           'Vocabulaire et orthographe lexicale', 'Grammaire et orthographe grammaticale']),
    'ma-c4': ('Mathématiques', ['Nombres et calculs', 'Espace et géométrie', 'Organisation et gestion de données et probabilités',
                                'Proportionnalité, fonctions', 'La pensée informatique']),
    'st-c3': ('Sciences et technologie', ['La matière, les mouvements et les signaux', 'Les êtres vivants dans leur environnement',
                                          'Le corps humain et la santé', 'Les objets techniques au cœur de la société']),
}
YEARS = {'Cours préparatoire': '1', 'Cours élémentaire première année': '2', 'Cours élémentaire deuxième année': '3',
         'Cours moyen première année': '4', 'Cours moyen deuxième année': '5', 'Cours moyen première et deuxième années': '4-5',
         'Sixième': '6', 'Cinquième': '7', 'Quatrième': '8', 'Troisième': '9'}
YEAR = re.compile(r'^(%s)\b' % '|'.join(sorted(YEARS, key=len, reverse=True)))
THEME = re.compile(r'^Thème (\d+|introductif) ?: ?(.+)$')
SKIP = {'principes', 'points de vigilance pour les professeurs', 'point de vigilance pour les professeurs', 'repères',
        'fréquence des temps d’apprentissage'}
SKIP_C4 = {'conditions favorables aux apprentissages des élèves'}  # in cycle 4 français, a heading between sections
BODY = {'fr-c3': 5, 'fr-c4': 7}  # the Sommaire repeats 'Principes' under each domain; the body opens at the next one
SUP = {'e', 'er', 're'}
ROMAN_SUP = re.compile(r'\b[IVXL]+(e|er|re)$')
DEFAULT_GRADE = {'fr-c3': '4-5'}  # its sections list CM1 and CM2 side by side


def stage(grade):
    return '1-5' if grade[0] in '12345' else '6-9'


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
        if (m := YEAR.match(line)) and len(line) < 130 and (YEARS[m.group(1)][0] in '123456' or line == m.group(1)):
            grade, cur = YEARS[m.group(1)], None
            if grade and domain:  # a year without sections ('La proportionnalité') is one item
                cur = {'subject': subject, 'stage': stage(grade), 'grade': grade, 'topic': domain, 'text': ''}
                out.append(cur)
        elif n in doms:
            domain, grade, cur = doms[n], DEFAULT_GRADE.get(key), None
        elif n in SKIP or key == 'fr-c4' and (n in SKIP_C4 or n.startswith('perspective annuelle')):
            cur = None
        elif grade and domain and ((m := THEME.match(line)) or (n in heads and len(line) < 120)):
            section = theme_topic(m.group(2)) if m else re.sub(r'\s*_{3,}.*$', '', line)
            cur = {'subject': subject, 'stage': stage(grade), 'grade': grade, 'topic': f'{domain}: {section}', 'text': ''}
            out.append(cur)
        elif cur is not None:
            cur['text'] += ' ' + line
    return out


def technology(pages):
    """Technologie cycle 4 (2024): its themes are split into parts ('L’évolution des OST'), each with a table of
    yearly benchmarks (5e, 4e, 3e side by side) and its knowledge; each part is one item for the whole cycle."""
    lines = [l.strip() for l in '\n'.join(pages).split('\n') if l.strip()]
    out, cur = [], None
    for i, line in enumerate(lines):
        if i + 1 < len(lines) and lines[i + 1] == 'Repères de progressivité':
            cur = {'subject': 'Technologie', 'stage': '6-9', 'grade': '7-9', 'topic': line, 'text': ''}
            out.append(cur)
        elif line.startswith(('©', 'Bulletin officiel')) or re.fullmatch(r'[\de ]+|Repères de progressivité', line):
            continue
        elif re.match(r'^(Compétences de fin de cycle|Progressivité pour atteindre)', line) or len(line) < 100 and re.match(
                r'^(Les objets et les systèmes techniques|Concevoir|Réaliser|Le projet)', line) and not line.endswith('.'):
            cur = None  # a theme's introduction, not a part
        elif cur is not None:
            cur['text'] += ' ' + line
    return out


# Cycle 4 programmes of 2020 (BO n°31, 30 July 2020), still in force for history-geography and the sciences.
# History-geography is a two-column table per year (theme title | teaching notes) whose columns the text layer
# interleaves, so the theme titles are given here; the sciences are organised by theme for the whole cycle.
HG4 = {
    'Histoire': {
        '7': ['Chrétientés et islam (VIe-XIIIe siècles), des mondes en contact',
              'Société, Église et pouvoir politique dans l’Occident féodal (XIe-XVe siècles)',
              'Transformations de l’Europe et ouverture sur le monde aux XVIe et XVIIe siècles'],
        '8': ['Le XVIIIe siècle. Expansions, Lumières et révolutions', 'L’Europe et le monde au XIXe siècle',
              'Société, culture et politique dans la France du XIXe siècle'],
        '9': ['L’Europe, un théâtre majeur des guerres totales (1914-1945)', 'Le monde depuis 1945',
              'Françaises et Français dans une République repensée']},
    'Géographie': {
        '7': ['La question démographique et l’inégal développement', 'Des ressources limitées, à gérer et à renouveler',
              'Prévenir les risques, s’adapter au changement global'],
        '8': ['L’urbanisation du monde', 'Les mobilités humaines transnationales', 'Des espaces transformés par la mondialisation'],
        '9': ['Dynamiques territoriales de la France contemporaine', 'Pourquoi et comment aménager le territoire ?',
              'La France et l’Union européenne']},
}
SCIENCES4 = {
    'Physique-chimie': ['Organisation et transformations de la matière', 'Mouvement et interactions',
                        'L’énergie, ses transferts et ses conversions', 'Des signaux pour observer et communiquer'],
    'Sciences de la vie et de la Terre': ['La planète Terre, l’environnement et l’action humaine', 'Le vivant et son évolution',
                                          'Le corps humain et la santé'],
}
NOISE = re.compile(r'^(©|e$|e e$|e e e$|Repères annuels de$|programmation$|Démarches et contenus d’enseignement$)')


def chunks(subject, grade, topic, text, size=1100):
    """A long theme is cut at line ends into parts of about `size` characters: 'Theme (1)', 'Theme (2)'."""
    parts, cur = [], ''
    for line in text:
        if cur and len(cur) + len(line) > size:
            parts.append(cur)
            cur = ''
        cur += ' ' + line
    if cur:
        if parts and len(cur) < 300:
            parts[-1] += cur
        else:
            parts.append(cur)
    return [{'subject': subject, 'stage': '6-9', 'grade': grade, 'topic': f'{topic} ({i + 1})' if len(parts) > 1 else topic,
             'text': t} for i, t in enumerate(parts)]


def cycle4_2020(pages):
    lines = [l.strip() for l in '\n'.join(pages).split('\n') if l.strip()]
    starts = [i for i, l in enumerate(lines) if l in ('Histoire et géographie', 'Physique-Chimie', 'Sciences de la vie et de la Terre',
                                                      'Technologie', 'Mathématiques', 'Éducation aux médias et à l’information')]
    sections = {lines[i]: lines[i + 1:j] for i, j in zip(starts, starts[1:])}  # the last match of each name is its body
    out = []
    hg, part, grade, theme = sections['Histoire et géographie'], None, None, None
    for line in hg:
        if line in ('Histoire', 'Géographie'):
            if part == 'Géographie':
                break  # a second 'Histoire' opens the notes that follow the programme
            part, grade, theme = line, None, None
        elif m := re.match(r'^Classe de ([543])$', line):
            grade, theme = {'5': '7', '4': '8', '3': '9'}[m.group(1)], None
        elif grade and (m := re.match(r'^Thème ([123]) ', line)):
            theme = {'subject': 'Histoire-géographie', 'stage': '6-9', 'grade': grade,
                     'topic': f'{part}: {HG4[part][grade][int(m.group(1)) - 1]}', 'text': line[8:]}
            out.append(theme)
        elif theme and not NOISE.match(line):
            theme['text'] += ' ' + line
    for subject, themes in SCIENCES4.items():
        body = sections['Physique-Chimie' if subject == 'Physique-chimie' else subject]
        heads = [next(i for i, l in enumerate(body) if l.rstrip('.') == t) for t in themes]
        ends = heads[1:] + [next(i for i, l in enumerate(body) if l == 'Croisements entre enseignements')]
        for t, a, b in zip(themes, heads, ends):
            out += chunks(subject, '7-9', t, [l for l in body[a + 1:b] if not NOISE.match(l)])
    return out


def main(srcs, dst):
    out = []
    for src in srcs:
        for key, doc in json.load(open(src))['docs'].items():
            out += technology(doc['pages']) if key == 'te-c4' else cycle4_2020(doc['pages']) if key == 'c4-2020' \
                else parse(key, doc['pages']) if key in DOCS else []
    for x in out:
        x['text'] = re.sub(r'\s+', ' ', x['text']).strip()
    out = [x for x in out if x['text']]
    out.sort(key=lambda x: x['stage'])  # keep the primary items first: their keys (country:index) are already mapped
    json.dump(out, open(dst, 'w'), ensure_ascii=False, indent=0)
    print(len(out), 'sections;', sum(len(x['text']) for x in out) // 1000, 'k chars')


if __name__ == '__main__':
    main(sys.argv[1:-1], sys.argv[-1])
