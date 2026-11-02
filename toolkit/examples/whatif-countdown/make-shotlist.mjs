#!/usr/bin/env node
// make-shotlist.mjs — validate a what-if episode config and write the shot list the critique loop reads
// (one shot per act; caption = the narration line on screen at the act's middle frame; sfx cues in
// frames relative to the shot start, peak-aligned — the same cues <SfxTrack> plays).
//
//   node examples/whatif-countdown/make-shotlist.mjs [--config examples/whatif-countdown/whatif.config.ts] [--out …/shotlist.json] [--comp WhatIfDemo]
//
// Exit 1 on an invalid config (timeline errors); warnings (format drift) are printed.
import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { parseWhatIfConfig, lineAt, switchTime, returnTime, endCardTime } from './schema.ts';
import { parseShotList } from '../../beat-grid/types.ts';
import { sfxIds } from '../../beat-grid/load-shotlist.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const opt = (n, d) => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 ? argv[i + 1] : d;
};
const cfgPath = path.resolve(opt('config', path.join(HERE, 'whatif.config.ts')));
const out = path.resolve(opt('out', path.join(path.dirname(cfgPath), 'shotlist.json')));

let config, warnings;
try {
  ({ config, warnings } = parseWhatIfConfig((await import(pathToFileURL(cfgPath).href)).default));
} catch (e) {
  console.error(`make-shotlist: ${e.message}`);
  process.exit(1);
}
const fps = config.fps;
const F = (s) => Math.round(s * fps);
const shots = config.acts.map((a) => {
  const start = F(a.start);
  const end = F(a.end);
  const mid = Math.min(end - 1, Math.floor((start + end) / 2));
  const line = lineAt(config, mid / fps);
  return {
    id: a.id,
    start,
    end,
    action: `[${a.look}] ${a.action}`.trim(),
    caption: line ? line.text : '',
    sfx: a.sfx.map((s) => ({ id: s.id, at: F(a.start + s.at) - start, ...(s.gain !== undefined ? { gain: s.gain } : {}) })),
  };
});
const shotList = { id: opt('comp', 'WhatIfDemo'), fps, width: 1080, height: 1920, durationInFrames: F(config.durationSec), shots };
// the toolkit validator (contiguity etc.); caption-length warnings are expected: this format's
// subtitles are full one-line sentences, not 3–5-word chunks (README "format variant").
const res = parseShotList(shotList, { sfxIds: sfxIds(), strict: false });
const hard = res.errors;
const soft = res.warnings.filter((w) => !/caption has \d+ words|no caption/.test(w));
for (const w of [...warnings, ...soft]) console.warn(`  warn: ${w}`);
if (hard.length) {
  console.error(`make-shotlist: shot list invalid:\n  - ${hard.join('\n  - ')}`);
  process.exit(1);
}
writeFileSync(out, JSON.stringify(res.shotList, null, 2) + '\n');
console.log(
  `${config.id}: ${config.durationSec}s = ${F(config.durationSec)} f · switch ${switchTime(config)} s (f${F(switchTime(config))}) · return ${returnTime(config)} s (f${F(returnTime(config))}) · end card ${endCardTime(config)} s · ${shots.length} acts, ${config.lines.length} lines, ${shots.reduce((n, s) => n + s.sfx.length, 0)} cues`,
);
console.log(`-> ${path.relative(process.cwd(), out)}`);
