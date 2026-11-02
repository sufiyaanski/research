#!/usr/bin/env node
// render-chapters.mjs — the long-form pipeline, resumable, one command:
//
//   node longform/render-chapters.mjs <episodeDir> --name <OutName> [--gl swangle] [--concurrency 4]
//        [--only plan|voice|render|mix|thumb|desc] [--chapters c00,c01] [--force] [--engine auto|kokoro|piper|elevenlabs|mock]
//
// Steps (each skips work that is already done and unchanged):
//   1 plan    chapters/*.json → vo-lines.json (every VO line + the pause before it)
//   2 voice   python3 voice/tts.py → out/longform/<id>/voice/voice.wav + words.json → copied to the episode
//             (words.json, captions.srt). Lines are cached by text, so editing one line re-voices one line.
//   3 frames  words.json → timeline.json (chapters/scenes/words/SFX in frames) + shotlist.json (critique)
//   4 render  each chapter separately: npx remotion render LongformChapter --props=<chapter> → chapters/<id>.mp4
//             (skipped when its props + template code hash is unchanged → a crash or a fix re-renders 1 chapter)
//   5 mix     ffmpeg concat (video stream copy) + SFX from the chapters + voice + music bed (looped, sidechain-
//             ducked under the voice) → loudness −14 LUFS / ≤ −1 dBTP → out/<Name>.mp4
//   6 thumb   npx remotion still LongformThumb (episode.json "thumbnail" props) → out/<Name>-thumb.png
//   7 desc    chapters.txt (YouTube timestamps) + description.md (summary, chapters, sources from facts.md)
// Env: REMOTION_IGNORE_CERT_ERRORS=1 behind a private-CA proxy (Google Fonts). No GPU: --gl swangle.
import { spawnSync } from 'child_process';
import { createHash } from 'crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildTimeline, loadEpisode, shotListFor, voLines, youtubeChapters, fmtTime } from './plan.mjs';
import { writeDescription } from './description.mjs';

const TOOLKIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const opt = (n, d) => {
  const i = argv.findIndex((a) => a === `--${n}` || a.startsWith(`--${n}=`));
  if (i < 0) return d;
  if (argv[i].includes('=')) return argv[i].slice(argv[i].indexOf('=') + 1);
  const v = argv[i + 1];
  return v === undefined || v.startsWith('--') ? true : v;
};
const epDir = path.resolve(argv[0] && !argv[0].startsWith('--') ? argv[0] : '');
if (!argv[0] || !existsSync(path.join(epDir, 'episode.json'))) {
  console.error('usage: node longform/render-chapters.mjs <episodeDir> --name <OutName> [--gl swangle] [--only plan|voice|render|mix|thumb|desc] [--chapters c01] [--force]');
  process.exit(1);
}
const ONLY = opt('only', 'all');
const FORCE = opt('force', false) === true;
const GL = opt('gl', process.env.REMOTION_GL || undefined);
const CONC = opt('concurrency', undefined);
const want = (step) => ONLY === 'all' || ONLY === step;
const t0 = Date.now();
const log = (m) => console.log(`[${((Date.now() - t0) / 1000).toFixed(0).padStart(4)}s] ${m}`);
const write = (f, o) => {
  mkdirSync(path.dirname(f), { recursive: true });
  writeFileSync(f, typeof o === 'string' ? o : JSON.stringify(o, null, 1) + '\n');
};
const run = (cmd, args, opts = {}) => {
  const r = spawnSync(cmd, args, { cwd: TOOLKIT, stdio: opts.capture ? 'pipe' : 'inherit', encoding: 'utf8', env: process.env, maxBuffer: 1 << 26 });
  if (r.status !== 0) {
    if (opts.capture) console.error((r.stderr || '').slice(-3000));
    throw new Error(`${cmd} ${args.slice(0, 4).join(' ')} … exited ${r.status}`);
  }
  return r.stdout ?? '';
};

const { ep, chapters } = loadEpisode(epDir);
const NAME = opt('name', ep.outName ?? ep.id);
const OUT = path.join(TOOLKIT, 'out', 'longform', ep.id);
mkdirSync(OUT, { recursive: true });
const report = existsSync(path.join(OUT, 'report.json')) ? JSON.parse(readFileSync(path.join(OUT, 'report.json'), 'utf8')) : {};
const saveReport = () => write(path.join(OUT, 'report.json'), report);

// ------------------------------------------------------------------------------------------ 1 plan
const lines = voLines(ep, chapters);
write(path.join(epDir, 'vo-lines.json'), lines);
log(`plan: ${chapters.length} chapters, ${chapters.reduce((n, c) => n + (c.scenes?.length ?? 0), 0)} scenes, ${lines.vo.length} VO lines, ${lines.vo.reduce((n, l) => n + l.text.split(/\s+/).length, 0)} words`);

// ------------------------------------------------------------------------------------------ 2 voice
const voiceDir = path.join(OUT, 'voice');
if (want('voice') || !existsSync(path.join(epDir, 'words.json'))) {
  const v = ep.voice ?? {};
  const args = ['-I', 'voice/tts.py', '--lines', path.join(epDir, 'vo-lines.json'), '--out', voiceDir, '--engine', String(opt('engine', v.engine ?? 'auto')), '--speed', String(v.speed ?? 1), '--tail', String(v.tail ?? 1.0), '--fps', String(ep.fps)];
  if (v.voice && (opt('engine', v.engine ?? 'auto') !== 'auto' || v.engine)) args.push('--voice', v.voice);
  const ts = Date.now();
  run('python3', args);
  report.voiceSec = (Date.now() - ts) / 1000;
  copyFileSync(path.join(voiceDir, 'words.json'), path.join(epDir, 'words.json'));
  copyFileSync(path.join(voiceDir, 'voice.srt'), path.join(epDir, 'captions.srt'));
  log(`voice → ${path.relative(TOOLKIT, voiceDir)}/voice.wav, words.json + captions.srt copied to the episode`);
}
const words = JSON.parse(readFileSync(path.join(epDir, 'words.json'), 'utf8'));
if (words.mock) log('WARNING: words.json comes from the MOCK voice (silent) — fine for layout, never ship it');

// ------------------------------------------------------------------------------------------ 3 frames
const { timeline, warnings } = buildTimeline(ep, chapters, words, { endScreenSec: ep.endScreenSec ?? 20 });
write(path.join(epDir, 'timeline.json'), timeline);
write(path.join(epDir, 'shotlist.json'), shotListFor(timeline, ep.studioComposition ?? 'LongformPreview'));
// the episode being worked on is also the Studio's `LongformPreview` (critique.mjs renders its stills)
write(path.join(TOOLKIT, 'longform', 'preview', 'timeline.json'), timeline);
const yt = youtubeChapters(timeline);
write(path.join(epDir, 'chapters.txt'), yt.text + '\n');
log(`frames: ${timeline.durationInFrames} frames (${fmtTime(timeline.durationInFrames / timeline.fps)}) · ${timeline.chapters.map((c) => `${c.id} ${(c.durationInFrames / c.fps).toFixed(1)}s`).join(' · ')}`);
for (const w of [...warnings, ...yt.warn]) log(`  warn: ${w}`);
if (ONLY === 'plan' || ONLY === 'voice') process.exit(0);

// ------------------------------------------------------------------------------------------ 4 render
const codeHash = (() => {
  const h = createHash('sha1');
  const walk = (d) => {
    for (const f of readdirSync(d).sort()) {
      const p = path.join(d, f);
      if (statSync(p).isDirectory()) {
        if (f !== 'demo') walk(p);
      } else if (/\.(tsx?|json)$/.test(f) && !p.includes(`${path.sep}demo${path.sep}`)) h.update(readFileSync(p));
    }
  };
  walk(path.join(TOOLKIT, 'longform'));
  walk(path.join(TOOLKIT, 'examples', 'character'));
  return h.digest('hex');
})();
const only = opt('chapters', undefined);
report.chapters ??= {};
if (want('render')) {
  for (const c of timeline.chapters) {
    if (only && !String(only).split(',').includes(c.id)) continue;
    const propsFile = path.join(OUT, 'props', `${c.id}.json`);
    write(propsFile, { chapter: c });
    const hash = createHash('sha1').update(JSON.stringify(c)).update(codeHash).digest('hex');
    const mp4 = path.join(OUT, 'chapters', `${c.id}.mp4`);
    const hashFile = mp4 + '.hash';
    if (!FORCE && existsSync(mp4) && existsSync(hashFile) && readFileSync(hashFile, 'utf8') === hash) {
      log(`render ${c.id}: up to date, skipped`);
      continue;
    }
    mkdirSync(path.dirname(mp4), { recursive: true });
    const args = ['remotion', 'render', 'LongformChapter', mp4, `--props=${propsFile}`, '--enforce-audio-track', '--log=error', ...(GL ? [`--gl=${GL}`] : []), ...(CONC ? [`--concurrency=${CONC}`] : [])];
    const ts = Date.now();
    log(`render ${c.id} "${c.title}": ${c.durationInFrames} frames …`);
    run('npx', args);
    const secs = (Date.now() - ts) / 1000;
    writeFileSync(hashFile, hash);
    report.chapters[c.id] = { frames: c.durationInFrames, renderSec: Math.round(secs), secPerFrame: +(secs / c.durationInFrames).toFixed(3), at: new Date().toISOString() };
    saveReport();
    log(`render ${c.id}: ${secs.toFixed(0)} s (${(secs / c.durationInFrames).toFixed(3)} s/frame)`);
  }
}

// ------------------------------------------------------------------------------------------ 5 mix
const ff = (args) => run('ffmpeg', ['-hide_banner', '-nostats', '-y', '-v', 'error', ...args]);
function loudness(file) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8' });
  const s = r.stderr.slice(r.stderr.lastIndexOf('Summary:'));
  const I = Number((s.match(/I:\s+(-?[\d.]+) LUFS/) || [])[1]);
  const TP = Number((s.match(/Peak:\s+(-?[\d.]+) dBFS/) || [])[1]);
  const LRA = Number((s.match(/LRA:\s+(-?[\d.]+) LU/) || [])[1]);
  return { I, TP, LRA };
}
if (want('mix')) {
  const T = timeline.durationInFrames / timeline.fps;
  const work = path.join(OUT, 'mix');
  mkdirSync(work, { recursive: true });
  const chs = timeline.chapters.map((c) => ({ c, mp4: path.join(OUT, 'chapters', `${c.id}.mp4`) }));
  const missing = chs.filter((x) => !existsSync(x.mp4)).map((x) => x.c.id);
  if (missing.length) throw new Error(`mix: chapters not rendered yet: ${missing.join(', ')}`);
  // video: stream-copy concat
  write(path.join(work, 'list.txt'), chs.map((x) => `file '${x.mp4}'`).join('\n') + '\n');
  ff(['-f', 'concat', '-safe', '0', '-i', path.join(work, 'list.txt'), '-map', '0:v', '-c', 'copy', path.join(work, 'video.mp4')]);
  // SFX: each chapter's audio padded/trimmed to its exact frame length, then joined (no AAC-priming drift)
  const sfxParts = chs.map((x) => {
    const w = path.join(work, `sfx-${x.c.id}.wav`);
    ff(['-i', x.mp4, '-vn', '-af', `apad,atrim=0:${(x.c.durationInFrames / x.c.fps).toFixed(4)}`, '-ar', '48000', '-ac', '2', w]);
    return w;
  });
  write(path.join(work, 'sfx-list.txt'), sfxParts.map((w) => `file '${w}'`).join('\n') + '\n');
  ff(['-f', 'concat', '-safe', '0', '-i', path.join(work, 'sfx-list.txt'), '-c', 'pcm_s16le', path.join(work, 'sfx.wav')]);
  // music bed: generated once per (bpm, seed, key), looped under the whole video
  const m = ep.music ?? {};
  const bpm = m.bpm ?? 84;
  const bars = m.bars ?? 8;
  const bed = path.join(TOOLKIT, 'public', 'music', `longform-bed-${bpm}-${m.seed ?? 4}${m.key ?? 'D'}.wav`);
  if (!existsSync(bed)) run('node', ['sfx/music-bed.mjs', '--bpm', String(bpm), '--duration', ((bars * 4 * 60) / bpm).toFixed(4), '--seed', String(m.seed ?? 4), '--key', String(m.key ?? 'D'), '--lufs', '-18', '--out', path.relative(TOOLKIT, bed)]);
  const voice = path.join(voiceDir, 'voice.wav');
  const bedDb = m.db ?? -16; // bed relative to its −18 LUFS file → ≈ −34 LUFS, ~18 LU under the −16 LUFS voice
  const fc = [
    `[0:a]apad,atrim=0:${T.toFixed(4)},asplit=2[v][key]`,
    `[2:a]atrim=0:${T.toFixed(4)},volume=${bedDb}dB[bedraw]`,
    `[bedraw][key]sidechaincompress=threshold=0.02:ratio=6:attack=20:release=450[bed]`,
    `[1:a]apad,atrim=0:${T.toFixed(4)}[sfx]`,
    `[v][bed][sfx]amix=inputs=3:normalize=0:duration=first[mix]`,
  ].join(';');
  const mix = path.join(work, 'mix.wav');
  ff(['-i', voice, '-i', path.join(work, 'sfx.wav'), '-stream_loop', '-1', '-i', bed, '-filter_complex', fc, '-map', '[mix]', '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s24le', mix]);
  // loudness: two-pass EBU R128 to −14 LUFS, true peak −1.5 dBTP (≤ −1 with margin for AAC)
  const p1 = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', mix, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const st = JSON.parse(p1.match(/\{[^{}]*"input_i"[^{}]*\}/s)[0]);
  const final = path.join(work, 'final.wav');
  ff(['-i', mix, '-af', `loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${st.input_i}:measured_LRA=${st.input_lra}:measured_TP=${st.input_tp}:measured_thresh=${st.input_thresh}:offset=${st.target_offset}:linear=true`, '-ar', '48000', '-ac', '2', final]);
  const outMp4 = path.join(TOOLKIT, 'out', `${NAME}.mp4`);
  ff(['-i', path.join(work, 'video.mp4'), '-i', final, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', outMp4]);
  report.loudness = loudness(outMp4);
  report.output = path.relative(TOOLKIT, outMp4);
  report.durationSec = +T.toFixed(2);
  report.mixedAt = new Date().toISOString();
  saveReport();
  log(`mix → ${path.relative(TOOLKIT, outMp4)} · ${report.loudness.I} LUFS integrated · true peak ${report.loudness.TP} dBTP · LRA ${report.loudness.LRA} LU`);
}

// ------------------------------------------------------------------------------------------ 6 thumb
if (want('thumb') && ep.thumbnail) {
  const thumbProps = path.join(OUT, 'props', 'thumbnail.json');
  write(thumbProps, ep.thumbnail);
  const png = path.join(TOOLKIT, 'out', `${NAME}-thumb.png`);
  const ts = Date.now();
  run('npx', ['remotion', 'still', 'LongformThumb', png, `--props=${thumbProps}`, '--log=error', ...(GL ? [`--gl=${GL}`] : [])]);
  report.thumbSec = Math.round((Date.now() - ts) / 1000);
  saveReport();
  log(`thumb → ${path.relative(TOOLKIT, png)}`);
}

// ------------------------------------------------------------------------------------------ 7 desc
if (want('desc') || want('mix')) {
  const f = writeDescription(epDir, ep, timeline, yt.text);
  log(`description → ${path.relative(TOOLKIT, f)}`);
}
log('done');
