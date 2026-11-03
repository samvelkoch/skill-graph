// Parses the poem collection (poems.js) into objects. Shared by the lab and scripts/sound-poems-check.mjs.
// Format: a header line "# <target> | <season> | <hero> | <title> [| <emoji>]", then the lines of the poem, then a blank line.
// emoji (optional 5th field): the poem's own picture on its card; without it the hero's emoji is used.
// target: a sound key from phonetics.js ORDER (s1, z, sh…) or a pair "s+sh"; season: autumn | winter | spring | summer | any.
export function parsePoems(text) {
  const out = [];
  let cur = null;
  for (const raw of text.split('\n')) {
    const line = raw.trimEnd();
    const h = line.match(/^#\s*([a-z0-9+]+)\s*\|\s*([a-z]+)\s*\|\s*([a-z]+)\s*\|\s*([^|]+?)\s*(?:\|\s*(\S+)\s*)?$/);
    if (h) {
      cur = { target: h[1], season: h[2], hero: h[3], title: h[4].trim(), emoji: h[5]?.trim() || undefined, lines: [] };
      out.push(cur);
    } else if (cur && line.trim()) cur.lines.push(line.trim());
  }
  const seen = {};
  for (const p of out) {
    p.text = p.lines.join('\n');
    seen[p.target] = (seen[p.target] ?? 0) + 1;
    p.id = `${p.target}-${seen[p.target]}`;
  }
  return out;
}
