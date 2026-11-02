#!/usr/bin/env node
// style-guide-from-reference — reference video → frames, timestamped contact sheet, MEASURED palette,
// MEASURED shot lengths, loudness, and a style-guide.md template for Claude/you to fill in.
//
//   node scripts/style-guide-from-reference/index.mjs <reference.mp4> [--out dir] [--every 0.5]
//        [--scene 0.3] [--width 360] [--sheet-width 120] [--cols 10] [--colors 8]
//
// Output (default --out out/style-guide/<name>/):
//   frames/f_0001.png …   every --every s (fps=1/every), scaled to --width px wide (not for git)
//   contact-sheet.jpg     tiles with timestamps (drawtext; plain tiles if drawtext/fonts are missing)
//   style-guide.md        measured facts + sections to fill
//   measurements.json     the raw numbers
// Needs only ffmpeg/ffprobe on PATH. Zero npm deps.
import { mkdirSync, readdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { spawnSync } from 'child_process';
import path from 'path';

const argv = process.argv.slice(2);
const opt = (n, d) => {
  const i = argv.findIndex((a) => a === `--${n}` || a.startsWith(`--${n}=`));
  if (i < 0) return d;
  return argv[i].includes('=') ? argv[i].slice(argv[i].indexOf('=') + 1) : argv[i + 1];
};
const input = argv.find((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--') && !argv[i - 1].includes('=')));
if (!input || !existsSync(input)) {
  console.error('usage: node scripts/style-guide-from-reference/index.mjs <reference.mp4> [--out dir] [--every 0.5] [--scene 0.3]');
  process.exit(1);
}
const name = path.basename(input).replace(/\.[^.]+$/, '');
const OUT = path.resolve(opt('out', path.join('out', 'style-guide', name)));
const EVERY = Number(opt('every', 0.5));
const SCENE = Number(opt('scene', 0.3));
const WIDTH = Number(opt('width', 360));
const SHEET_W = Number(opt('sheet-width', 120));
const COLS = Number(opt('cols', 10));
const NCOLORS = Number(opt('colors', 8));
const framesDir = path.join(OUT, 'frames');

const run = (cmd, args, opts = {}) => {
  const r = spawnSync(cmd, args, { encoding: opts.binary ? 'buffer' : 'utf8', maxBuffer: 1 << 30 });
  if (r.error) throw r.error;
  if (r.status !== 0 && !opts.allowFail) throw new Error(`${cmd} failed: ${String(r.stderr).slice(-1500)}`);
  return r;
};

// ------------------------------------------------------------------ probe
const probe = JSON.parse(run('ffprobe', ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', input]).stdout);
const v = probe.streams.find((s) => s.codec_type === 'video');
const a = probe.streams.find((s) => s.codec_type === 'audio');
if (!v) throw new Error('no video stream');
const duration = Number(probe.format.duration || v.duration);
const [fn, fd] = String(v.r_frame_rate || v.avg_frame_rate).split('/').map(Number);
const srcFps = fd ? fn / fd : fn;
console.log(`${name}: ${v.width}x${v.height} @ ${srcFps.toFixed(2)} fps, ${duration.toFixed(2)} s, audio: ${a ? `${a.codec_name} ${a.sample_rate} Hz` : 'none'}`);

// ------------------------------------------------------------------ frames
if (existsSync(framesDir)) rmSync(framesDir, { recursive: true });
mkdirSync(framesDir, { recursive: true });
run('ffmpeg', ['-y', '-loglevel', 'error', '-i', input, '-vf', `fps=1/${EVERY},scale=${WIDTH}:-2`, path.join(framesDir, 'f_%04d.png')]);
const frames = readdirSync(framesDir).filter((f) => f.endsWith('.png')).sort();
console.log(`  frames: ${frames.length} (every ${EVERY} s, ${WIDTH} px wide) -> ${path.relative(process.cwd(), framesDir)}/`);

// ------------------------------------------------------------------ contact sheet
const sheet = path.join(OUT, 'contact-sheet.jpg');
const rows = Math.ceil(frames.length / COLS);
const tile = `tile=${COLS}x${rows}:padding=4:margin=4:color=0x202020`;
const stamp = `drawtext=text='%{eif\\:floor(t)\\:d}.%{eif\\:mod(floor(t*10)\\,10)\\:d}s':x=4:y=4:fontsize=14:fontcolor=white:box=1:boxcolor=black@0.6:boxborderw=3`;
const sheetArgs = (vf) => ['-y', '-loglevel', 'error', '-framerate', String(1 / EVERY), '-i', path.join(framesDir, 'f_%04d.png'), '-vf', vf, '-frames:v', '1', '-q:v', '4', sheet];
let stamped = true;
if (run('ffmpeg', sheetArgs(`scale=${SHEET_W}:-2,${stamp},${tile}`), { allowFail: true }).status !== 0) {
  stamped = false;
  run('ffmpeg', sheetArgs(`scale=${SHEET_W}:-2,${tile}`));
}
console.log(`  contact sheet: ${COLS}x${rows}${stamped ? ' with timestamps' : ' (no drawtext: tile i = i*every s)'} -> ${path.relative(process.cwd(), sheet)}`);

// ------------------------------------------------------------------ palette (pixel histogram)
// all frames downscaled to 64 px wide → raw RGB → 4-bit/channel bins → greedy merge of near bins
const raw = run('ffmpeg', ['-loglevel', 'error', '-framerate', '1', '-i', path.join(framesDir, 'f_%04d.png'), '-vf', 'scale=64:-2', '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1'], { binary: true }).stdout;
const bins = new Map();
for (let i = 0; i + 2 < raw.length; i += 3) {
  const r = raw[i], g = raw[i + 1], b = raw[i + 2];
  const k = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
  const e = bins.get(k) || { n: 0, r: 0, g: 0, b: 0 };
  e.n++; e.r += r; e.g += g; e.b += b;
  bins.set(k, e);
}
const totalPx = raw.length / 3;
const sorted = [...bins.values()].map((e) => ({ n: e.n, r: e.r / e.n, g: e.g / e.n, b: e.b / e.n })).sort((x, y) => y.n - x.n);
const clusters = [];
for (const c of sorted) {
  const hit = clusters.find((k) => Math.hypot(k.r - c.r, k.g - c.g, k.b - c.b) < 30);
  if (hit) {
    const n = hit.n + c.n;
    hit.r = (hit.r * hit.n + c.r * c.n) / n; hit.g = (hit.g * hit.n + c.g * c.n) / n; hit.b = (hit.b * hit.n + c.b * c.n) / n;
    hit.n = n;
  } else clusters.push({ ...c });
}
clusters.sort((x, y) => y.n - x.n);
const hex = (c) => '#' + [c.r, c.g, c.b].map((x) => Math.round(x).toString(16).padStart(2, '0')).join('').toUpperCase();
const sat = (c) => { const mx = Math.max(c.r, c.g, c.b), mn = Math.min(c.r, c.g, c.b); return mx === 0 ? 0 : (mx - mn) / mx; };
const luma = (c) => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
const dominant = clusters.slice(0, NCOLORS).map((c) => ({ hex: hex(c), pct: +((100 * c.n) / totalPx).toFixed(2), saturation: +sat(c).toFixed(2), luma: Math.round(luma(c)) }));
const accents = clusters
  .filter((c) => sat(c) > 0.45 && luma(c) > 40 && c.n / totalPx >= 0.002)
  .slice(0, 4)
  .map((c) => ({ hex: hex(c), pct: +((100 * c.n) / totalPx).toFixed(2), saturation: +sat(c).toFixed(2) }));
let meanLuma = 0;
for (let i = 0; i + 2 < raw.length; i += 3) meanLuma += 0.2126 * raw[i] + 0.7152 * raw[i + 1] + 0.0722 * raw[i + 2];
meanLuma /= totalPx;
console.log(`  palette: ${dominant.map((d) => `${d.hex} ${d.pct}%`).join(', ')}`);

// ------------------------------------------------------------------ shot lengths (scene changes)
const sc = run('ffmpeg', ['-hide_banner', '-nostats', '-i', input, '-vf', `select='gt(scene,${SCENE})',showinfo`, '-an', '-f', 'null', '-'], { allowFail: true });
const cuts = [...String(sc.stderr).matchAll(/pts_time:([\d.]+)/g)].map((m) => Number(m[1])).filter((t) => t > 0.05 && t < duration - 0.05);
const bounds = [0, ...cuts, duration];
const shots = bounds.slice(1).map((t, i) => t - bounds[i]);
const stat = (xs) => {
  const s = [...xs].sort((p, q) => p - q);
  return { count: s.length, mean: s.reduce((p, q) => p + q, 0) / s.length, median: s[Math.floor(s.length / 2)], min: s[0], max: s[s.length - 1] };
};
const shotStats = stat(shots);
console.log(`  shots (scene > ${SCENE}): ${shotStats.count}, mean ${shotStats.mean.toFixed(2)} s, min ${shotStats.min.toFixed(2)} s, max ${shotStats.max.toFixed(2)} s`);

// ------------------------------------------------------------------ loudness
let loud = null;
if (a) {
  const r = run('ffmpeg', ['-hide_banner', '-nostats', '-i', input, '-vn', '-af', 'ebur128=peak=true', '-f', 'null', '-'], { allowFail: true });
  const s = String(r.stderr);
  const sum = s.slice(s.lastIndexOf('Summary:'));
  const g = (re) => { const m = sum.match(re); return m ? Number(m[1]) : null; };
  loud = { I: g(/I:\s+(-?[\d.]+) LUFS/), LRA: g(/LRA:\s+(-?[\d.]+) LU/), TP: g(/Peak:\s+(-?[\d.]+) dBFS/) };
  console.log(`  loudness: ${loud.I} LUFS, LRA ${loud.LRA} LU, true peak ${loud.TP} dBFS`);
}

// ------------------------------------------------------------------ write
const f30 = (s) => Math.round(s * 30);
const measurements = {
  reference: path.basename(input),
  width: v.width, height: v.height, fps: +srcFps.toFixed(3), durationSec: +duration.toFixed(3),
  every: EVERY, frames: frames.length,
  palette: { dominant, accents, meanLuma: Math.round(meanLuma), method: '4-bit/channel histogram of all sampled frames at 64 px, bins merged within RGB distance 30' },
  shots: { threshold: SCENE, cuts: cuts.map((t) => +t.toFixed(3)), lengthsSec: shots.map((x) => +x.toFixed(3)), ...Object.fromEntries(Object.entries(shotStats).map(([k, x]) => [k, +x.toFixed(3)])) },
  loudness: loud,
};
writeFileSync(path.join(OUT, 'measurements.json'), JSON.stringify(measurements, null, 2) + '\n');

const swatchRow = (d) => `| \`${d.hex}\` | ${d.pct}% | ${d.saturation} | ${d.luma ?? ''} | _role?_ |`;
const md = `# Style guide — from \`${path.basename(input)}\`

> Generated by \`scripts/style-guide-from-reference/index.mjs\`. Numbers marked **measured** come from the
> video; everything in _italics_ is for Claude/you to fill by READING \`contact-sheet.jpg\` (and the
> frames). Then turn it into rules: "Rules to copy" and "Banned in our version" are what the build obeys.

![contact sheet](contact-sheet.jpg)

| | measured |
|---|---|
| format | ${v.width}×${v.height} @ ${srcFps.toFixed(2)} fps, ${duration.toFixed(2)} s |
| sampled | ${frames.length} frames, one every ${EVERY} s |
| audio | ${a ? `${a.codec_name}, ${a.sample_rate} Hz, ${a.channels} ch` : 'none'} |

## Palette

**Measured dominant colours** (share of all sampled pixels):

| hex | coverage | saturation | luma | role |
|---|---|---|---|---|
${dominant.map(swatchRow).join('\n')}

**Measured accent candidates** (saturated, ≥ 0.2 % coverage): ${accents.length ? accents.map((x) => `\`${x.hex}\` (${x.pct}%)`).join(', ') : 'none found'}
Mean luma: **${Math.round(meanLuma)}/255** (${meanLuma < 80 ? 'dark ground' : meanLuma > 170 ? 'light ground' : 'mid-tone'}).

- Ground: _…_  · Ink/text: _…_  · Accent(s) and WHEN they appear: _…_
- Our mapping (The Signal: cream \`#F4EFE6\`, ink \`#1B1B1B\`, red \`#D7263D\` for money words only): _…_

## Type

| element | face (guess) | size (% of frame height) | weight | case | tracking | colour |
|---|---|---|---|---|---|---|
| headline | _…_ | _…_ | _…_ | _…_ | _…_ | _…_ |
| hero number | _…_ | _…_ | _…_ | _…_ | _…_ | _…_ |
| caption | _…_ | _…_ | _…_ | _…_ | _…_ | _…_ |
| label/kicker | _…_ | _…_ | _…_ | _…_ | _…_ | _…_ |

(At 1920 px tall: 1 % ≈ 19 px. Captions on phones read at ≥ 4.5 % ≈ 86 px.)

## Shot lengths

**Measured** with \`select='gt(scene,${SCENE})'\` (hard cuts / big changes only — morphs and in-place
builds are NOT counted, so real "beats" are usually shorter):

| shots | mean | median | min | max |
|---|---|---|---|---|
| ${shotStats.count} | ${shotStats.mean.toFixed(2)} s (${f30(shotStats.mean)} f@30) | ${shotStats.median.toFixed(2)} s | ${shotStats.min.toFixed(2)} s (${f30(shotStats.min)} f) | ${shotStats.max.toFixed(2)} s (${f30(shotStats.max)} f) |

Cuts at: ${cuts.length ? cuts.map((t) => `${t.toFixed(2)}s`).join(', ') : '(none detected — try --scene 0.2)'}

- Rhythm notes (what changes every beat inside a shot?): _…_

## Transitions

- _hard cut / whip / morph / match cut / push … which, how often, how long (frames)_

## Camera

- _static / slow push / truck / zoom punch-ins; easing; how much movement per shot_

## Grain / texture

- _flat / grain / vignette / glow / paper texture; gradients (watch h264 banding)_

## How text enters / exits

- _per-word / per-line / whole block; rise px; fade; duration in frames; exit faster than entry?_
- _caption chunk size (words), lines, position (y % of height), highlight of the spoken word_

## Sound notes

${loud ? `**Measured** integrated loudness **${loud.I} LUFS**, LRA ${loud.LRA} LU, true peak ${loud.TP} dBFS (platform target ≈ −14 LUFS).` : 'No audio stream in the reference.'}

- Music: _tempo / genre / energy curve_ · SFX: _which events get a sound; whoosh on cuts? pops on numbers?_
- VO pace: _words/s_ · Ducking: _…_

## Rules to copy

1. _…_
2. _…_
3. _…_

## Banned in our version

1. _… (anything that would read as a copy: their exact layout, their colours, their characters, their fonts if distinctive)_
2. _…_
`;
writeFileSync(path.join(OUT, 'style-guide.md'), md);
console.log(`  -> ${path.relative(process.cwd(), path.join(OUT, 'style-guide.md'))} (+ measurements.json)`);
