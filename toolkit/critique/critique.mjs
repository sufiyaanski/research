#!/usr/bin/env node
// critique.mjs — self-critique round: render the MIDDLE frame of every shot, tile a labelled contact
// sheet, write a scoring template (story / composition / motion / type / sync, 1–10).
//
//   node critique/critique.mjs ToolkitSmoke --shotlist src/smoke/smoke.shotlist.json
//   node critique/critique.mjs ToolkitSmoke --shotlist ... --round 2 --scale 0.5 --gl swangle
//   node critique/critique.mjs ToolkitSmoke --shotlist ... --fast      # bundle once + renderStill (much faster)
//
// Default renderer: `npx remotion still <Comp> --frame=N --scale=S <png>` (one bundle per shot — slow
// but exactly what the CLI renders). --fast bundles once and calls renderStill() from @remotion/renderer.
// Behind a private-CA proxy: REMOTION_IGNORE_CERT_ERRORS=1 (both modes). 3D without a GPU: --gl swangle.
//
// Output:  critique/rounds/<Comp>-round-N.md        (print + fill in, then: node critique/score.mjs <it>)
//          critique/rounds/<Comp>-round-N-sheet.jpg (contact sheet, labelled with shot ids)
//          critique/rounds/stills/<Comp>-rN/*.png    (git-ignored)
// --round defaults to (last round file for this comp) + 1. Round 4 is refused.
import { mkdirSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { spawnSync, execFileSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadShotList } from '../beat-grid/load-shotlist.mjs';
import { parseRoundFile, MAX_ROUNDS, RULE_TEXT, COLUMNS, isLocked } from './rounds-lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROUNDS = path.join(ROOT, 'critique', 'rounds');
const argv = process.argv.slice(2);
const opt = (name, def) => {
  const i = argv.findIndex((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (i < 0) return def;
  if (argv[i].includes('=')) return argv[i].slice(argv[i].indexOf('=') + 1);
  const v = argv[i + 1];
  return v === undefined || v.startsWith('--') ? true : v;
};
const comp = argv[0];
const shotlistPath = opt('shotlist', undefined);
if (!comp || comp.startsWith('--') || !shotlistPath) {
  console.error('usage: node critique/critique.mjs <CompositionId> --shotlist <file.yaml|json> [--round N] [--scale 0.5] [--gl angle|swangle] [--fast]');
  process.exit(1);
}
const SCALE = Number(opt('scale', '0.5'));
const GL = opt('gl', process.env.REMOTION_GL || undefined);
const FAST = opt('fast', false) === true || opt('fast', false) === 'true';
const IGNORE_CERTS = process.env.REMOTION_IGNORE_CERT_ERRORS === '1';

// ------------------------------------------------------------------ round number + previous round
mkdirSync(ROUNDS, { recursive: true });
const roundFile = (n) => path.join(ROUNDS, `${comp}-round-${n}.md`);
const existing = readdirSync(ROUNDS)
  .map((f) => f.match(new RegExp(`^${comp}-round-(\\d+)\\.md$`)))
  .filter(Boolean)
  .map((m) => Number(m[1]));
const ROUND = Number(opt('round', existing.length ? Math.max(...existing) + 1 : 1));
if (!(ROUND >= 1)) throw new Error('--round must be ≥ 1');
if (ROUND > MAX_ROUNDS) {
  console.error(`critique: refusing round ${ROUND}. Max ${MAX_ROUNDS} rounds — ship the best round and log what's still under 8:`);
  console.error(`  node critique/score.mjs ${path.relative(process.cwd(), roundFile(MAX_ROUNDS))}`);
  process.exit(4);
}
let prev = null;
if (ROUND > 1 && existsSync(roundFile(ROUND - 1))) {
  try {
    prev = parseRoundFile(readFileSync(roundFile(ROUND - 1), 'utf8'));
  } catch (e) {
    console.warn(`  (previous round unreadable, not carrying locks: ${e.message})`);
  }
}

// ------------------------------------------------------------------ shots + middle frames
const { shotList } = loadShotList(shotlistPath);
const shots = shotList.shots.map((s) => ({ ...s, mid: Math.min(s.end - 1, Math.floor((s.start + s.end) / 2)) }));
const stillsDir = path.join(ROUNDS, 'stills', `${comp}-r${ROUND}`);
mkdirSync(stillsDir, { recursive: true });
console.log(`${comp} round ${ROUND}: ${shots.length} shots, middle frames ${shots.map((s) => s.mid).join(', ')} (scale ${SCALE}${GL ? `, gl ${GL}` : ''}, ${FAST ? 'renderStill --fast' : 'npx remotion still'})`);

const files = [];
if (FAST) {
  const { bundle } = await import('@remotion/bundler');
  const { renderStill, selectComposition } = await import('@remotion/renderer');
  const chromiumOptions = { ...(GL ? { gl: GL } : {}), ignoreCertificateErrors: IGNORE_CERTS };
  console.log('  bundling once...');
  const serveUrl = await bundle({ entryPoint: path.join(ROOT, 'src', 'index.ts'), publicDir: path.join(ROOT, 'public'), onProgress: () => {} });
  const composition = await selectComposition({ serveUrl, id: comp, inputProps: {}, chromiumOptions });
  for (const s of shots) {
    const out = path.join(stillsDir, `${s.id}-f${String(s.mid).padStart(4, '0')}.png`);
    await renderStill({ serveUrl, composition, output: out, frame: s.mid, scale: SCALE, overwrite: true, imageFormat: 'png', inputProps: {}, chromiumOptions });
    files.push(out);
    console.log(`  -> ${path.relative(ROOT, out)}`);
  }
} else {
  for (const s of shots) {
    const out = path.join(stillsDir, `${s.id}-f${String(s.mid).padStart(4, '0')}.png`);
    const args = ['remotion', 'still', comp, out, `--frame=${s.mid}`, `--scale=${SCALE}`, '--log=error'];
    if (GL) args.push(`--gl=${GL}`);
    const r = spawnSync('npx', args, { cwd: ROOT, encoding: 'utf8', env: process.env });
    if (r.status !== 0 || !existsSync(out)) {
      console.error(r.stdout?.slice(-2000), r.stderr?.slice(-2000));
      throw new Error(`npx remotion still failed for shot "${s.id}" (frame ${s.mid}). Behind a proxy? set REMOTION_IGNORE_CERT_ERRORS=1. 3D? --gl swangle`);
    }
    files.push(out);
    console.log(`  -> ${path.relative(ROOT, out)}`);
  }
}

// ------------------------------------------------------------------ contact sheet (labelled)
const sheet = path.join(ROUNDS, `${comp}-round-${ROUND}-sheet.jpg`);
const TW = 270;
const TH = Math.round((TW * shotList.height) / shotList.width);
const cols = Math.min(files.length, 4);
const esc = (t) => t.replace(/\\/g, '\\\\').replace(/:/g, '\\:').replace(/'/g, '').replace(/%/g, '\\%');
const buildSheet = (withText) => {
  const inputs = files.flatMap((f) => ['-i', f]);
  const per = files.map((_, i) => {
    const s = shots[i];
    const label = esc(`${i + 1}. ${s.id}  f${s.mid}`);
    const txt = withText ? `,drawtext=text='${label}':x=8:y=8:fontsize=20:fontcolor=white:box=1:boxcolor=black@0.65:boxborderw=6` : '';
    return `[${i}:v]scale=${TW}:${TH}${txt}[v${i}]`;
  });
  let filter;
  if (files.length === 1) filter = `${per[0]};[v0]null[out]`;
  else
    filter = `${per.join(';')};${files.map((_, i) => `[v${i}]`).join('')}xstack=inputs=${files.length}:layout=${files
      .map((_, i) => `${(i % cols) * TW}_${Math.floor(i / cols) * TH}`)
      .join('|')}:fill=black[out]`;
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', filter, '-map', '[out]', '-q:v', '4', '-frames:v', '1', sheet]);
};
try {
  buildSheet(true);
} catch {
  try {
    buildSheet(false);
    console.warn('  (drawtext unavailable: contact sheet without labels — order = shot order)');
  } catch (e) {
    console.warn('  contact sheet skipped:', String(e.message).split('\n')[0]);
  }
}
if (existsSync(sheet)) console.log(`  -> ${path.relative(ROOT, sheet)}`);

// ------------------------------------------------------------------ round file
const fmt = (f) => `${(f / shotList.fps).toFixed(2)}s`;
const cell = (t) => String(t ?? '').replace(/\|/g, '/').replace(/\n/g, ' ');
const lockedIds = new Set();
const rows = shots.map((s, i) => {
  const p = prev?.rows.find((r) => r.id === s.id);
  const locked = p && isLocked(p);
  if (locked) lockedIds.add(s.id);
  const sc = COLUMNS.map((c) => (locked ? p.scores[c] : ''));
  const total = locked ? COLUMNS.reduce((a, c) => a + p.scores[c], 0) : '';
  const still = path.relative(ROUNDS, files[i]);
  return `| ${i + 1} | ${s.id}${locked ? ' 🔒' : ''} | ${s.start}–${s.end} | [${s.mid}](${still}) (${fmt(s.mid)}) | ${cell(s.caption)} | ${cell(s.action)}${s.state ? ` → **${cell(s.state)}**` : ''} | ${sc.join(' | ')} | ${total} | |`;
});
const prevFix = prev ? prev.fix : [];
const md = `# Critique — ${comp} — round ${ROUND} of ${MAX_ROUNDS}

- shot list: \`${path.relative(ROOT, path.resolve(shotlistPath))}\` (${shotList.shots.length} shots, ${shotList.durationInFrames} frames @ ${shotList.fps} fps)
- stills: middle frame of each shot, \`floor((start+end)/2)\`, scale ${SCALE} — \`${path.relative(ROOT, stillsDir)}/\`
- contact sheet: ![${comp} round ${ROUND}](${path.basename(sheet)})
- generated: ${new Date().toISOString().slice(0, 10)} by \`node critique/critique.mjs ${argv.join(' ')}\`
${prev ? `- previous round: ${prev.round} — locked (all ≥ 8, don't touch): ${[...lockedIds].join(', ') || 'none'}; fixed this round: ${prevFix.join(', ') || '(not recorded)'}\n` : ''}
## How to score

Open each still (and the contact sheet) at phone size. Score 1–10 per column; a column is ≥ 8 only if you would ship it.

- **story** — does this frame advance the beat/state in the shot list (the bold end-state)? one idea per frame?
- **composition** — hierarchy, safe zones (top 220 / bottom 340 / right rail 160 px at 1080×1920), balance, negative space.
- **motion** — is the move readable mid-shot, eased, motivated; nothing static that should move or vice-versa.
- **type** — size ≥ 4.5 % of frame height for captions, contrast, 3–5 word chunks, ≤ 2 lines, accent colour only on money words.
- **sync** — does the picture event land on the beat / VO word / sfx peak (± 1 frame)?

<!-- SCORES:BEGIN -->
| # | shot | frames | mid frame | caption | action → end state | ${COLUMNS.join(' | ')} | total | notes |
|---|------|--------|-----------|---------|--------------------|${COLUMNS.map(() => '---').join('|')}|-------|-------|
${rows.join('\n')}
<!-- SCORES:END -->

## Rule

${RULE_TEXT}

Then run \`node critique/score.mjs ${path.relative(ROOT, roundFile(ROUND))}\` — it totals the table, names the 3 worst shots and says whether to stop.

## Fix log (fill in after scoring)

- shot — what was wrong → what you changed
`;
writeFileSync(roundFile(ROUND), md);
console.log(`  -> ${path.relative(ROOT, roundFile(ROUND))}\n`);
console.log(md);
