#!/usr/bin/env node
// make-beats — write a beats.json (frames) from a BPM, from VO word timings, or snap a shot list.
//
//   BPM:   node beat-grid/make-beats.mjs --bpm 120 --duration 15 [--fps 30] [--offset 0] [--subdivide 2] [--bars 4] [--out beats.json]
//   VO:    node beat-grid/make-beats.mjs --vo words.json [--fps 30] [--lead 1] [--min-on 0.6] [--pause 0.25]
//                [--chars 16] [--bridge 0.2] [--pop-regex '\$|%|price|...'] [--duration 15] [--out vo-beats.json]
//   SNAP:  node beat-grid/make-beats.mjs --from-shotlist shots.yaml [--beats beats.json] [--out shots.json] [--max-drift 3]
//
// BPM:   frames per beat = fps*60/BPM (float). Beat i = round(offset + i*fpb/subdivide) — each beat is
//        computed from its index and rounded once, never by adding rounded intervals.
// VO:    accepts setup/tools/gen_voice.py beats.json (vo[].words[{w,start,end}], seconds) or a plain
//        [{w,start,end}] list. beats = word onsets; downbeats = phrase starts; phrases split on a pause
//        ≥ 0.25 s or punctuation; caption chunks of 3–5 words / ≤ 2 lines, start = first word − lead,
//        on screen ≥ 0.6 s (extended into the gap, never over the next chunk; gaps ≤ --bridge s are
//        bridged so captions never blink); pops = money/key words.
// SNAP:  beats from --beats, else the shot list's beatsFile, else its bpm. Each shot start → nearest
//        beat; prints drift per shot; --out writes the snapped, validated shot list as JSON (the form
//        compositions import). Exit 2 if any |drift| > --max-drift.
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { bpmGrid, voGrid, normalizeWordsInput, snapShotsToBeats, DEFAULT_POP_REGEX } from './grid.ts';
import { parseShotList } from './types.ts';
import { loadShotList, sfxIds } from './load-shotlist.mjs';

process.on('uncaughtException', (e) => {
  console.error(`make-beats: ${e.message}`);
  process.exit(1);
});
const argv = process.argv.slice(2);
const opt = (name, def) => {
  const i = argv.findIndex((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (i < 0) return def;
  const a = argv[i];
  if (a.includes('=')) return a.slice(a.indexOf('=') + 1);
  const v = argv[i + 1];
  return v === undefined || v.startsWith('--') ? true : v;
};
const num = (name, def) => {
  const v = opt(name, undefined);
  if (v === undefined) return def;
  const n = Number(v);
  if (!Number.isFinite(n)) die(`--${name} must be a number (got ${v})`);
  return n;
};
function die(msg) {
  console.error(`make-beats: ${msg}`);
  process.exit(1);
}
const write = (file, obj) => {
  mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  writeFileSync(file, JSON.stringify(obj, null, 2) + '\n');
  console.log(`-> ${file}`);
};

const fps = num('fps', 30);
const out = opt('out', undefined);

if (opt('help', false) || argv.length === 0) {
  console.log(readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(1, 20).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
  process.exit(0);
}

if (opt('from-shotlist', undefined)) {
  // ---------------------------------------------------------------- SNAP mode
  const file = opt('from-shotlist');
  const { shotList, beatsPath } = loadShotList(file);
  let beats;
  const beatsArg = opt('beats', undefined);
  if (beatsArg) beats = JSON.parse(readFileSync(beatsArg, 'utf8'));
  else if (beatsPath) beats = JSON.parse(readFileSync(beatsPath, 'utf8'));
  else if (shotList.bpm) beats = bpmGrid({ bpm: shotList.bpm, fps: shotList.fps, durationInFrames: shotList.durationInFrames });
  else die('no beats: pass --beats, or set beatsFile or bpm in the shot list');
  if (beats.fps !== shotList.fps) die(`beats fps ${beats.fps} ≠ shot list fps ${shotList.fps}`);
  const { shotList: snapped, rows } = snapShotsToBeats(shotList, beats.beats);
  const maxDrift = num('max-drift', 3);
  console.log(`${shotList.id}: ${rows.length} shots vs ${beats.beats.length} beats (${beats.source}${beats.bpm ? ` ${beats.bpm} BPM, ${beats.framesPerBeat} f/beat` : ''})`);
  console.log('  shot                 start  -> beat#  snapped  drift');
  let bad = 0;
  for (const r of rows) {
    const flag = r.unsnapped ? '  UNSNAPPED (would collapse a shot)' : Math.abs(r.drift) > maxDrift ? `  > ${maxDrift}` : '';
    if (Math.abs(r.drift) > maxDrift) bad++;
    console.log(`  ${r.id.padEnd(20)} ${String(r.from).padStart(5)}  -> ${String(r.beat < 0 ? "-" : r.beat).padStart(5)}  ${String(r.to).padStart(7)}  ${(r.drift >= 0 ? '+' : '') + r.drift}${flag}`);
  }
  const mean = rows.reduce((s, r) => s + Math.abs(r.drift), 0) / rows.length;
  console.log(`  mean |drift| ${mean.toFixed(2)} f, max |drift| ${Math.max(...rows.map((r) => Math.abs(r.drift)))} f`);
  // re-validate the snapped list (contiguity etc.)
  const res = parseShotList(snapped, { sfxIds: sfxIds() });
  if (out) write(out, res.shotList);
  process.exit(bad ? 2 : 0);
}

if (opt('bpm', undefined)) {
  // ---------------------------------------------------------------- BPM mode
  const bpm = num('bpm');
  const duration = num('duration', undefined);
  if (duration === undefined) die('--duration <seconds> is required with --bpm');
  const grid = bpmGrid({
    bpm,
    fps,
    durationInFrames: Math.round(duration * fps),
    offset: num('offset', 0),
    subdivide: num('subdivide', 1),
    beatsPerBar: num('bars', 4),
  });
  console.log(`${bpm} BPM @ ${fps} fps: ${grid.framesPerBeat} frames/beat, ${grid.beats.length} ${grid.subdivide > 1 ? `1/${grid.subdivide}-beat ticks` : 'beats'}, ${grid.downbeats.length} bars`);
  console.log(`  first: ${grid.beats.slice(0, 12).join(', ')}${grid.beats.length > 12 ? ', …' : ''}`);
  if (out) write(out, grid);
  else console.log(JSON.stringify(grid));
  process.exit(0);
}

if (opt('vo', undefined)) {
  // ---------------------------------------------------------------- VO mode
  const src = opt('vo');
  const words = normalizeWordsInput(JSON.parse(readFileSync(src, 'utf8')));
  const duration = num('duration', undefined);
  const grid = voGrid(words, {
    fps,
    lead: num('lead', 1),
    minOnScreenSec: num('min-on', 0.6),
    pauseSec: num('pause', 0.25),
    minWords: num('min-words', 3),
    maxWords: num('max-words', 5),
    maxCharsPerLine: num('chars', 16),
    maxLines: num('lines', 2),
    popRegex: opt('pop-regex', DEFAULT_POP_REGEX),
    bridgeSec: num('bridge', 0.2),
    durationInFrames: duration === undefined ? undefined : Math.round(duration * fps),
  });
  grid.sourceFile = path.basename(src);
  console.log(`VO ${src}: ${grid.words.length} words, ${grid.phrases.length} phrases, ${grid.chunks.length} caption chunks, ${grid.pops.length} pops @ ${fps} fps`);
  for (const c of grid.chunks) console.log(`  [${String(c.start).padStart(4)}–${String(c.end).padEnd(4)}] ${c.text}${c.pops.length ? `   pops@${c.pops.join(',')}` : ''}`);
  for (const w of grid.warnings) console.warn(`  warn: ${w}`);
  if (out) write(out, grid);
  process.exit(0);
}

die('pass --bpm, --vo or --from-shotlist (see --help)');
