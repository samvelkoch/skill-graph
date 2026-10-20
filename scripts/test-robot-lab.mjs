// Checks that every Robot Lab level is solvable: runs each level's reference solution through the lab's own engine.
// Usage: node scripts/test-robot-lab.mjs
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../labs/robot-lab/index.html', import.meta.url), 'utf8');
const src = html.match(/\/\/ ENGINE START[^\n]*\n([\s\S]*?)\/\/ ENGINE END/)?.[1];
if (!src) throw new Error('engine markers not found in labs/robot-lab/index.html');
const E = new Function(`${src}; return { LEVELS, parseMap, runAll, prog, countBlocks };`)();

let bad = 0;
for (const lv of E.LEVELS) {
  const L = E.parseMap(lv.map), body = E.prog(lv.solution), n = E.countBlocks(body), S = E.runAll(L, body);
  const errs = [];
  if (new Set(lv.map.map((r) => r.length)).size !== 1) errs.push('ragged map');
  if (!L.start || !L.goal) errs.push('map needs a robot and a goal');
  if (!S.win) errs.push(`solution fails (${S.fail ?? 'did not reach the goal'} at ${S.x},${S.y})`);
  if (n !== lv.par) errs.push(`solution has ${n} blocks, par is ${lv.par}`);
  if (lv.max && n > lv.max) errs.push(`solution exceeds max ${lv.max}`);
  const used = new Set(JSON.stringify(body).match(/"t":"\w+"/g).map((m) => m.slice(5, -1)));
  for (const t of used) if (!lv.blocks.includes(t)) errs.push(`solution uses ${t}, not in the palette`);
  console.log(`${errs.length ? '✗' : '✓'} ${lv.id.padEnd(10)} ${n} blocks${errs.length ? ' — ' + errs.join('; ') : ''}`);
  bad += errs.length > 0;
}
process.exit(bad ? 1 : 0);
