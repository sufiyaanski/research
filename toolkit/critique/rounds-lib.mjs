// Shared by critique.mjs and score.mjs: the round-file format, the stop rule, the ranking.
export const MAX_ROUNDS = 3;
export const COLUMNS = ['story', 'composition', 'motion', 'type', 'sync'];
export const PASS = 8;

export const RULE_TEXT =
  "Fix the 3 worst shots (lowest total; ties → lowest sync). Lock everything that scored ≥ 8 (don't touch it). Re-render. Repeat until every shot is ≥ 8 in every column. Max 3 rounds; after round 3 ship the best round and log what's still under 8.";

/** A shot is locked when every column is ≥ 8. */
export const isLocked = (row) => COLUMNS.every((c) => Number.isFinite(row.scores[c]) && row.scores[c] >= PASS);

/**
 * Parse a round markdown file. Rows live between <!-- SCORES:BEGIN --> and <!-- SCORES:END -->:
 * | # | shot | frames | mid | caption | action | story | composition | motion | type | sync | total | notes |
 * Blank score cells → null.
 */
export function parseRoundFile(md) {
  const round = Number((md.match(/round (\d+) of \d+/) || [])[1]);
  const comp = ((md.match(/^# Critique — (.+?) — round/m) || [])[1] || '').trim();
  const a = md.indexOf('<!-- SCORES:BEGIN -->');
  const b = md.indexOf('<!-- SCORES:END -->');
  if (a < 0 || b < 0) throw new Error('no <!-- SCORES:BEGIN/END --> block');
  const lines = md
    .slice(a, b)
    .split('\n')
    .filter((l) => l.trim().startsWith('|'))
    .slice(2); // header + separator
  const rows = lines.map((l) => {
    const cells = l.split('|').slice(1, -1).map((c) => c.trim());
    const id = cells[1].replace(/🔒/g, '').trim();
    const scores = {};
    COLUMNS.forEach((c, i) => {
      const raw = cells[6 + i];
      if (raw === '' || raw === undefined) scores[c] = null;
      else {
        const n = Number(raw);
        if (!Number.isInteger(n) || n < 1 || n > 10) throw new Error(`shot "${id}": ${c} = "${raw}" is not an integer 1–10`);
        scores[c] = n;
      }
    });
    return { id, frames: cells[2], scores, notes: cells.slice(12).join(' | ').trim() };
  });
  const scored = rows.map((r) => ({ ...r, total: COLUMNS.every((c) => r.scores[c] !== null) ? COLUMNS.reduce((s, c) => s + r.scores[c], 0) : null }));
  return { round, comp, rows: scored, fix: worstShots(scored).map((r) => r.id) };
}

/** Rank: lowest total, ties → lowest sync, then lowest single column. Only shots not yet locked. */
export function worstShots(rows, n = 3) {
  return rows
    .filter((r) => r.total !== null && !isLocked(r))
    .sort(
      (x, y) =>
        x.total - y.total ||
        x.scores.sync - y.scores.sync ||
        Math.min(...COLUMNS.map((c) => x.scores[c])) - Math.min(...COLUMNS.map((c) => y.scores[c])),
    )
    .slice(0, n);
}

/** Quality of a whole round, for "ship the best round": fewest sub-8 cells, then highest mean total. */
export function roundQuality(parsed) {
  const cells = parsed.rows.flatMap((r) => COLUMNS.map((c) => r.scores[c] ?? 0));
  const under = cells.filter((v) => v < PASS).length;
  const mean = parsed.rows.reduce((s, r) => s + (r.total ?? 0), 0) / Math.max(1, parsed.rows.length);
  return { under, mean };
}
