"""Parse Finland's national core curriculum for basic education (POPS 2014, grades 1-9) into curriculum items.

Input: the peruste JSON of 'Perusopetuksen opetussuunnitelman perusteet 2014' from the ePerusteet API
(eperusteet.opintopolku.fi/eperusteet-service/api/external/peruste/419550/perusopetus, Finnish National Agency
for Education). The core curriculum is a regulation of the agency, so it carries no copyright (Copyright Act 404/1961, 9 §).
Its `perusopetus` part lists the grade bands (vuosiluokkakokonaisuudet: 1-2, 3-6, 7-9) and the subjects
(oppiaineet, some split into syllabi: oppimäärät). Every subject has, per grade band, its objectives (tavoitteet)
and its content areas (sisältöalueet, 'S1 …', with a description).

The Finnish objectives (tavoitteet) are broad competences shared by all content areas of a band and fit graph
topics badly, so items are the content areas: one item per subject + grade band + content area, its description as
text, and the objectives are left out.
Subjects without counterparts in the graph (languages other than the mother tongue, religion, arts, crafts,
PE, guidance) are left out; of mother tongue only the Finnish syllabus is kept.

Usage: python3 scripts/curricula/parse_fi.py <raw json> <out json>
Output: [{subject, stage, grade, topic, text}], the same shape as the other parsers.
"""
import html
import json
import re
import sys

# subject name (fi) -> kept; for subjects with syllabi, the syllabus names to keep
KEEP = {
    'Äidinkieli ja kirjallisuus': ['Suomen kieli ja kirjallisuus'],
    'Matematiikka': None, 'Ympäristöoppi': None, 'Biologia': None, 'Maantieto': None, 'Fysiikka': None,
    'Kemia': None, 'Terveystieto': None, 'Historia': None, 'Yhteiskuntaoppi': None, 'Elämänkatsomustieto': None,
    'Kotitalous': None,
}


def text(x, lang='fi'):
    """Localised HTML field -> plain text."""
    s = (x or {}).get(lang) if isinstance(x, dict) else x
    s = re.sub(r'<(br|/p|/li|/h\d)\s*/?>', '. ', s or '')
    s = html.unescape(re.sub(r'<[^>]+>', ' ', s))
    s = re.sub(r'\s+', ' ', s)
    return re.sub(r'(\s*\.\s*){2,}', '. ', s).strip(' .')


def band(vlk):
    nums = [int(v.rsplit('_', 1)[-1]) for v in vlk.get('vuosiluokat') or []]
    return f'{min(nums)}-{max(nums)}' if nums else None


def items(name, subject, bands):
    out = []
    for v in subject.get('vuosiluokkakokonaisuudet') or []:
        grade = bands.get(str(v.get('_vuosiluokkaKokonaisuus')))
        if not grade:
            continue
        for s in v.get('sisaltoalueet') or []:
            topic, desc = text(s.get('nimi')), text(s.get('kuvaus'))
            if not topic or not desc:
                continue
            out.append({'subject': name, 'stage': '1-9', 'grade': grade, 'topic': re.sub(r'^S\d+:?\s+', '', topic),
                        'text': desc})
    return out


def main(src, dst):
    po = json.load(open(src))
    po = po.get('perusopetus', po)  # the whole peruste or its perusopetus part
    bands = {str(v['id']): band(v) for v in po['vuosiluokkakokonaisuudet']}
    out, seen = [], set()
    for o in po['oppiaineet']:
        name = text(o.get('nimi'))
        if name not in KEEP:
            continue
        seen.add(name)
        if KEEP[name] is None:
            out += items(name, o, bands)
        for m in o.get('oppimaarat') or []:
            if KEEP[name] and text(m.get('nimi')) in KEEP[name]:
                out += items(name, m, bands)
    json.dump(out, open(dst, 'w'), ensure_ascii=False, indent=0)
    per = {}
    for x in out:
        per[(x['subject'], x['grade'])] = per.get((x['subject'], x['grade']), 0) + 1
    print(len(out), 'content areas;', sum(len(x['text']) for x in out) // 1000, 'k chars; missing:', sorted(set(KEEP) - seen))
    print(per)


if __name__ == '__main__':
    main(*sys.argv[1:3])
