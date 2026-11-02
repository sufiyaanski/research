#!/usr/bin/env node
// Phone-scale QA stills. Bundles once, renders the requested frames of ONE composition as PNGs,
// then tiles them into a contact sheet with ffmpeg. READ the PNGs before any video render.
//
//   node remotion/scripts/frames.mjs SignalAnchoring 0,2s,10s,25s,last --scale=0.5
//   node remotion/scripts/frames.mjs SignalAnchoring beats --scale=0.5      # every beat boundary + midpoints
//   node remotion/scripts/frames.mjs SignalAnchoring 0,2s --guides           # overlay safe-area guides
//   node remotion/scripts/frames.mjs QrosityVolcano beats --gl=swangle       # 3D scene on a no-GPU box
//
// Frame spec: plain integers are frames, "2s"/"2.5s" are seconds, "last" is the final frame,
// "beats" expands to frame 0, each beat start (+12 frames, so entrances have landed), each beat
// midpoint, and the last frame — read from the episode's beats.json.
//
// Output: qa/frames/<Comp>-f<frame>.png + qa/frames/<Comp>-sheet.png
// Equivalent CLI: `npx remotion still <Comp> --frame=N --scale=0.5 out.png` (one bundle per call;
// this script is faster for many frames).
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { mkdirSync, readFileSync, existsSync, readdirSync } from 'fs';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const id = args[0];
const spec = args[1] && !args[1].startsWith('--') ? args[1] : '0,last';
const opt = (name, def) => {
  const a = args.find((x) => x.startsWith(`--${name}=`));
  return a ? a.split('=')[1] : def;
};
const SCALE = Number(opt('scale', '0.5'));
const GUIDES = args.includes('--guides');
const BROWSER = process.env.REMOTION_BROWSER_EXECUTABLE || opt('browser', undefined);
// Behind a corporate proxy / sandbox with a private CA, Google Fonts fail with
// ERR_CERT_AUTHORITY_INVALID inside headless Chrome. Opt in with REMOTION_IGNORE_CERT_ERRORS=1.
// OpenGL renderer for <ThreeCanvas> scenes (Q-ROSITY): `angle` on a desktop with a GPU (default),
// `swangle` (SwiftShader-ANGLE, CPU) on a machine without one — CI, cloud boxes, Lambda. `swiftshader`
// and `egl` fail with "Error creating WebGL context" there. Pass --gl=swangle or REMOTION_GL=swangle.
// The remotion.config.ts setting does NOT apply to these Node-API scripts, so it is passed here.
const GL = opt('gl', process.env.REMOTION_GL || 'angle');
const CHROMIUM = { gl: GL, ignoreCertificateErrors: process.env.REMOTION_IGNORE_CERT_ERRORS === '1' };

if (!id) {
  console.error('usage: node remotion/scripts/frames.mjs <CompId> <frames|beats> [--scale=0.5] [--guides] [--gl=angle|swangle]');
  process.exit(1);
}

const outDir = path.join(root, 'qa', 'frames');
mkdirSync(outDir, { recursive: true });

console.log('bundling...');
const serveUrl = await bundle({
  entryPoint: path.join(root, 'remotion', 'src', 'index.ts'),
  publicDir: path.join(root, 'remotion', 'public'),
  onProgress: () => {},
});
const composition = await selectComposition({
  serveUrl,
  id,
  inputProps: { guides: GUIDES },
  browserExecutable: BROWSER,
  chromiumOptions: CHROMIUM,
});
const { fps, durationInFrames } = composition;
const last = durationInFrames - 1;

const findBeats = () => {
  const epDir = path.join(root, 'remotion', 'src', 'episodes');
  if (!existsSync(epDir)) return null;
  for (const d of readdirSync(epDir)) {
    const p = path.join(epDir, d, 'beats.json');
    if (!existsSync(p)) continue;
    const j = JSON.parse(readFileSync(p, 'utf8'));
    if (j.composition === id) return j;
  }
  return null;
};

const parseSpec = (s) => {
  if (s === 'beats') {
    const j = findBeats();
    if (!j) throw new Error(`no beats.json with composition "${id}" under remotion/src/episodes`);
    const set = new Set([0, last]);
    for (const b of j.beats) {
      const from = Math.round(b.start * fps);
      const to = Math.round(b.end * fps);
      set.add(Math.min(last, from + 12));
      set.add(Math.min(last, Math.round((from + to) / 2)));
    }
    return [...set].sort((a, b) => a - b);
  }
  return s.split(',').map((t) => {
    t = t.trim();
    if (t === 'last') return last;
    if (/^[\d.]+s$/.test(t)) return Math.round(parseFloat(t) * fps);
    return Number(t);
  });
};

const frames = parseSpec(spec).map((f) => Math.max(0, Math.min(last, f)));
console.log(`${id}: ${durationInFrames} frames @ ${fps} fps (${(durationInFrames / fps).toFixed(1)} s). Rendering ${frames.length} stills at scale ${SCALE}${GUIDES ? ' with guides' : ''} (gl=${GL}).`);

const files = [];
for (const frame of frames) {
  const out = path.join(outDir, `${id}-f${String(frame).padStart(4, '0')}.png`);
  await renderStill({
    serveUrl,
    composition,
    output: out,
    frame,
    scale: SCALE,
    overwrite: true,
    imageFormat: 'png',
    inputProps: { guides: GUIDES },
    browserExecutable: BROWSER,
    chromiumOptions: CHROMIUM,
  });
  files.push(out);
  console.log(`  -> ${path.relative(root, out)}   (t=${(frame / fps).toFixed(2)}s)`);
}

// Contact sheet: tile up to 4 per row, each thumbnail 270px wide (= phone at arm's length).
// (xstack needs >= 2 inputs; a single still is its own sheet.)
if (files.length < 2) {
  console.log('  (single still: no contact sheet)');
} else try {
  const cols = Math.min(files.length, 4);
  const rows = Math.ceil(files.length / cols);
  const sheet = path.join(outDir, `${id}-sheet.png`);
  const inputs = files.flatMap((f) => ['-i', f]);
  const filter = `${files.map((_, i) => `[${i}:v]scale=270:-1,drawtext=text='f${frames[i]} ${(frames[i] / fps).toFixed(1)}s':x=8:y=8:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.6[v${i}]`).join(';')};${files.map((_, i) => `[v${i}]`).join('')}xstack=inputs=${files.length}:layout=${files
    .map((_, i) => `${(i % cols) * 270}_${Math.floor(i / cols) * 480}`)
    .join('|')}:fill=black[out]`;
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', filter, '-map', '[out]', sheet]);
  console.log(`  -> ${path.relative(root, sheet)}   (contact sheet ${cols}x${rows})`);
} catch (e) {
  console.warn('contact sheet skipped (ffmpeg with drawtext/xstack needed):', e.message.split('\n')[0]);
}
console.log('done. Now READ every PNG at phone scale before rendering video.');
