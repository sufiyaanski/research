#!/usr/bin/env node
// score.mjs — read a filled-in round file, total it, name the 3 worst shots, apply the stop rule.
//
//   node critique/score.mjs critique/rounds/ToolkitSmoke-round-1.md            # report
//   node critique/score.mjs critique/rounds/ToolkitSmoke-round-1.md --write    # also write totals + verdict into the file
//   node critique/score.mjs ... --json
//
// Exit codes: 0 = stop rule met (every shot ≥ 8 in every column) → ship
//             3 = keep going: fix the listed shots, then `critique.mjs --round N+1`
//             4 = round 3 done and still under 8 → ship the best round (named) and log what's under 8
//             1 = unreadable / unscored cells / round > 3 (refused)
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import path from 'path';
import { parseRoundFile, worstShots, isLocked, roundQuality, COLUMNS, PASS, MAX_ROUNDS } from './rounds-lib.mjs';

const argv = process.argv.slice(2);
const file = argv.find((a) => !a.startsWith('--'));
if (!file) {
  console.error('usage: node critique/score.mjs <Comp-round-N.md> [--write] [--json]');
  process.exit(1);
}
const md = readFileSync(file, 'utf8');
let p;
try {
  p = parseRoundFile(md);
} catch (e) {
  console.error(`score: ${e.message}`);
  process.exit(1);
}
if (!(p.round >= 1)) {
  console.error('score: could not read the round number ("round N of 3") from the file header');
  process.exit(1);
}
if (p.round > MAX_ROUNDS) {
  console.error(`score: refusing round ${p.round}. Max ${MAX_ROUNDS} rounds — there is no round 4. Ship the best of rounds 1–${MAX_ROUNDS}.`);
  process.exit(1);
}
const blank = p.rows.flatMap((r) => COLUMNS.filter((c) => r.scores[c] === null).map((c) => `${r.id}.${c}`));
if (blank.length) {
  console.error(`score: ${blank.length} unscored cell(s): ${blank.slice(0, 12).join(', ')}${blank.length > 12 ? ', …' : ''}`);
  console.error('Fill every story/composition/motion/type/sync cell with an integer 1–10, then re-run.');
  process.exit(1);
}

const worst = worstShots(p.rows);
const under = p.rows.flatMap((r) => COLUMNS.filter((c) => r.scores[c] < PASS).map((c) => ({ id: r.id, col: c, v: r.scores[c] })));
const met = under.length === 0;
const locked = p.rows.filter(isLocked).map((r) => r.id);

// best round (for the round-3 verdict): compare sibling round files of the same comp
let best = { round: p.round, ...roundQuality(p) };
if (!met && p.round === MAX_ROUNDS) {
  const dir = path.dirname(file);
  for (const f of readdirSync(dir)) {
    const m = f.match(/^(.+)-round-(\d+)\.md$/);
    if (!m || m[1] !== p.comp || Number(m[2]) === p.round || Number(m[2]) > MAX_ROUNDS) continue;
    try {
      const q = parseRoundFile(readFileSync(path.join(dir, f), 'utf8'));
      if (q.rows.some((r) => r.total === null)) continue;
      const qq = roundQuality(q);
      if (qq.under < best.under || (qq.under === best.under && qq.mean > best.mean)) best = { round: q.round, ...qq };
    } catch {
      /* unscored sibling — ignore */
    }
  }
}

let verdict;
let code;
if (met) {
  verdict = `STOP — every shot is ≥ ${PASS} in every column. Ship round ${p.round}.`;
  code = 0;
} else if (p.round >= MAX_ROUNDS) {
  verdict = `MAX ROUNDS — round ${p.round} of ${MAX_ROUNDS} still has ${under.length} cell(s) under ${PASS}. No round 4: ship round ${best.round} (fewest sub-${PASS} cells: ${best.under}, mean total ${best.mean.toFixed(1)}) and log what's still under ${PASS}.`;
  code = 4;
} else {
  verdict = `CONTINUE — fix ${worst.map((r) => r.id).join(', ')}; keep locked shots untouched; re-render; then: node critique/critique.mjs ${p.comp} --shotlist <file> --round ${p.round + 1}`;
  code = 3;
}

if (argv.includes('--json')) {
  console.log(JSON.stringify({ comp: p.comp, round: p.round, rows: p.rows, worst: worst.map((r) => r.id), locked, under, met, verdict, bestRound: best.round }, null, 2));
} else {
  console.log(`${p.comp} — round ${p.round} of ${MAX_ROUNDS}`);
  console.log(`  ${'shot'.padEnd(18)} ${COLUMNS.map((c) => c.slice(0, 5).padStart(5)).join(' ')}  total`);
  for (const r of p.rows) {
    const flag = isLocked(r) ? '  locked' : worst.some((w) => w.id === r.id) ? '  << FIX' : '';
    console.log(`  ${r.id.padEnd(18)} ${COLUMNS.map((c) => String(r.scores[c]).padStart(5)).join(' ')}  ${String(r.total).padStart(5)}${flag}`);
  }
  console.log(`  worst 3 (lowest total, ties → lowest sync): ${worst.map((r) => `${r.id} (${r.total}, sync ${r.scores.sync})`).join(', ') || 'none'}`);
  console.log(`  locked (all ≥ ${PASS}): ${locked.join(', ') || 'none'}`);
  if (under.length) console.log(`  under ${PASS}: ${under.map((u) => `${u.id}.${u.col}=${u.v}`).join(', ')}`);
  console.log(`\n${verdict}`);
}

if (argv.includes('--write')) {
  // write totals into the table and a verdict block at the end
  let out = md;
  const a = out.indexOf('<!-- SCORES:BEGIN -->');
  const b = out.indexOf('<!-- SCORES:END -->');
  const block = out.slice(a, b).split('\n');
  let k = 0;
  const lines = block.map((l) => {
    if (!l.trim().startsWith('|')) return l;
    if (k++ < 2) return l;
    const cells = l.split('|');
    const id = cells[2].replace(/🔒/g, '').trim();
    const r = p.rows.find((x) => x.id === id);
    if (r) cells[12] = ` ${r.total} `;
    return cells.join('|');
  });
  out = out.slice(0, a) + lines.join('\n') + out.slice(b);
  out = out.replace(/\n<!-- VERDICT:BEGIN -->[\s\S]*<!-- VERDICT:END -->\n?/, '\n');
  out =
    out.trimEnd() +
    `\n\n<!-- VERDICT:BEGIN -->\n## Verdict (score.mjs)\n\n- worst 3: ${worst.map((r) => `${r.id} (${r.total})`).join(', ') || 'none'}\n- locked: ${locked.join(', ') || 'none'}\n- under ${PASS}: ${under.map((u) => `${u.id}.${u.col}=${u.v}`).join(', ') || 'none'}\n- **${verdict}**\n<!-- VERDICT:END -->\n`;
  writeFileSync(file, out);
  console.log(`  -> wrote totals + verdict into ${file}`);
}
process.exit(code);
