#!/usr/bin/env node
// Delivery check for a rendered mp4: duration, fps, resolution, codec, and (if an audio stream
// exists) EBU R128 loudness. Writes qa/report.json and exits 1 on a hard failure.
//
//   node remotion/scripts/check-media.mjs out/SignalAnchoring.mp4
//   node remotion/scripts/check-media.mjs out/SignalAnchoring-draft.mp4 --draft   # allows 540x960
//
// Pass criteria (final): 1080x1920, 60 fps, h264 yuv420p, 45-70 s, if audio: integrated
// -16..-13 LUFS and true peak <= -1 dBTP (common practice; platforms re-normalize anyway).
import { execFileSync } from 'child_process';
import { mkdirSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
const DRAFT = args.includes('--draft');
if (!file) {
  console.error('usage: node remotion/scripts/check-media.mjs <file.mp4> [--draft]');
  process.exit(1);
}
const abs = path.resolve(root, file);

const probe = JSON.parse(
  execFileSync('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', abs], { encoding: 'utf8' }),
);
const v = probe.streams.find((s) => s.codec_type === 'video');
const a = probe.streams.find((s) => s.codec_type === 'audio');
const [num, den] = v.r_frame_rate.split('/').map(Number);
const fps = num / den;
const duration = Number(probe.format.duration);

const report = {
  file: path.relative(root, abs),
  checkedAt: new Date().toISOString(),
  video: { codec: v.codec_name, width: v.width, height: v.height, fps, pixFmt: v.pix_fmt, frames: Number(v.nb_frames) || null },
  durationSec: +duration.toFixed(3),
  audio: null,
  checks: [],
  pass: true,
};
const check = (name, ok, detail, hard = true) => {
  report.checks.push({ name, ok, detail, hard });
  if (!ok && hard) report.pass = false;
};

const expectW = DRAFT ? 540 : 1080;
const expectH = DRAFT ? 960 : 1920;
check('resolution', v.width === expectW && v.height === expectH, `${v.width}x${v.height} (expected ${expectW}x${expectH})`);
check('fps', Math.abs(fps - 60) < 0.01, `${fps} (expected 60)`);
check('codec', v.codec_name === 'h264' && v.pix_fmt === 'yuv420p', `${v.codec_name} ${v.pix_fmt}`);
check('duration', duration >= 45 && duration <= 70, `${duration.toFixed(2)} s (target 45-70 s)`, false);

if (a) {
  // EBU R128: parse the summary block printed by ffmpeg's ebur128 filter.
  let log = '';
  try {
    execFileSync('ffmpeg', ['-nostats', '-i', abs, '-filter_complex', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    log = String(e.stderr || '');
  }
  if (!log) {
    // ffmpeg prints the summary on stderr even on success; re-run capturing stderr
    const r = execFileSync('sh', ['-c', `ffmpeg -nostats -i "${abs}" -filter_complex ebur128=peak=true -f null - 2>&1`], { encoding: 'utf8' });
    log = r;
  }
  // ebur128 logs running values every 100 ms; the final summary block is printed last,
  // so always take the LAST match.
  const grab = (re) => {
    const all = [...log.matchAll(new RegExp(re.source, 'g'))];
    return all.length ? Number(all[all.length - 1][1]) : null;
  };
  const integrated = grab(/I:\s+(-?[\d.]+) LUFS/);
  const range = grab(/LRA:\s+(-?[\d.]+) LU/);
  const truePeak = grab(/Peak:\s+(-?[\d.]+) dBFS/);
  report.audio = { codec: a.codec_name, sampleRate: Number(a.sample_rate), channels: a.channels, integratedLUFS: integrated, loudnessRange: range, truePeakDbtp: truePeak };
  check('loudness', integrated !== null && integrated >= -16 && integrated <= -13, `${integrated} LUFS integrated (target -16..-13)`, false);
  check('true-peak', truePeak !== null && truePeak <= -1, `${truePeak} dBTP (max -1)`, false);
} else {
  check('audio', true, 'no audio stream (silent render — mux VO/music before publishing)', false);
}

mkdirSync(path.join(root, 'qa'), { recursive: true });
writeFileSync(path.join(root, 'qa', 'report.json'), JSON.stringify(report, null, 2));

for (const c of report.checks) console.log(`${c.ok ? 'PASS' : c.hard ? 'FAIL' : 'WARN'}  ${c.name.padEnd(11)} ${c.detail}`);
console.log(`\n${report.pass ? 'OK' : 'FAILED'} — report written to qa/report.json`);
process.exit(report.pass ? 0 : 1);
