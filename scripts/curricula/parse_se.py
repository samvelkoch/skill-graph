"""Parse Sweden's Lgr22 (grundskolan, years 1-9) from Skolverket's Syllabus API into curriculum items.

Input: the JSON saved from api.skolverket.se/syllabus/v1/subjects/<code> for every compulsory-school subject,
{source, fetched, subjects: [subject]}. Each subject's central content is HTML: <h3>I årskurs 1–3</h3> per
year band, <h4> per content area, <ul><li> for the points. Each content area becomes one item.
In years 1-3 the science subjects (and the social-studies ones) share one central content; it is kept once,
under 'NO-ämnen' or 'SO-ämnen'. Subjects with no counterpart in the graph are left out.

Usage: python3 scripts/curricula/parse_se.py <raw json> <out json>
Output: [{subject, stage, grade, topic, text}], the same shape as the other parsers.
"""
import html
import json
import re
import sys

KEEP = {'Matematik', 'Svenska', 'Biologi', 'Fysik', 'Kemi', 'Teknik', 'Geografi', 'Historia', 'Samhällskunskap',
        'Hem- och konsumentkunskap'}
SHARED = {'Biologi': 'NO-ämnen', 'Fysik': 'NO-ämnen', 'Kemi': 'NO-ämnen',
          'Geografi': 'SO-ämnen', 'Historia': 'SO-ämnen', 'Samhällskunskap': 'SO-ämnen', 'Religionskunskap': 'SO-ämnen'}


def clean(s):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s)).replace('­', '')).strip()


def areas(content):
    """(year band, area, [points]) for every <h4> area with points."""
    band = None
    for part in re.split(r'(?=<h[34]>)', content):
        if m := re.match(r'<h3>(.*?)</h3>', part):
            band = re.search(r'(\d)\s*[–-]\s*(\d)', clean(m.group(1)))
            band = band and f'{band.group(1)}-{band.group(2)}'
        elif (m := re.match(r'<h4>(.*?)</h4>', part)) and band:
            points = [clean(li) for li in re.findall(r'<li>(.*?)</li>', part, re.S)]
            if points:
                yield band, clean(m.group(1)), points


def main(src, dst):
    out, seen = [], {}
    for s in json.load(open(src))['subjects']:
        if s['name'] not in KEEP:
            continue
        content = ' '.join(c['text'] for c in s['centralContents'])
        for band, area, points in areas(content):
            text = ' '.join(points)
            if (band, text) in seen:  # shared years 1-3 content of the NO / SO subjects
                seen[(band, text)]['subject'] = SHARED.get(s['name'], s['name'])
                continue
            it = {'subject': s['name'], 'stage': '1-9', 'grade': band, 'topic': area, 'text': text}
            seen[(band, text)] = it
            out.append(it)
    json.dump(out, open(dst, 'w'), ensure_ascii=False, indent=0)
    print(len(out), 'sections;', sum(len(x['text']) for x in out) // 1000, 'k chars')


if __name__ == '__main__':
    main(*sys.argv[1:3])
