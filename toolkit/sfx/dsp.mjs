// Tiny zero-dependency DSP helpers shared by synth.mjs and music-bed.mjs.
// Float32 buffers in [-1, 1]; WAV out is 16-bit PCM little-endian.
import { writeFileSync, mkdirSync } from 'fs';
import { spawnSync } from 'child_process';
import path from 'path';

export const SR = 48000;
export const TAU = Math.PI * 2;

/** mulberry32 — small, fast, deterministic PRNG. */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Seeded string -> uint32 (so each sound has its own reproducible noise). */
export const hashSeed = (s, base = 1) => {
  let h = 2166136261 ^ base;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
};

export const buf = (sec) => new Float32Array(Math.max(1, Math.round(sec * SR)));
export const dbToGain = (db) => Math.pow(10, db / 20);
export const gainToDb = (g) => 20 * Math.log10(Math.max(1e-12, g));
export const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
export const smooth = (x) => x * x * (3 - 2 * x);

/** RBJ biquad (state kept in closure). type: lp | hp | bp. Call .set(fc, q) any time (per-sample sweeps ok). */
export function biquad(type, fc = 1000, q = 0.707) {
  let b0, b1, b2, a1, a2;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  const set = (f, Q = q) => {
    const w = (TAU * clamp(f, 10, SR * 0.49)) / SR;
    const cs = Math.cos(w);
    const al = Math.sin(w) / (2 * Q);
    const a0 = 1 + al;
    if (type === 'lp') { b0 = (1 - cs) / 2; b1 = 1 - cs; b2 = (1 - cs) / 2; }
    else if (type === 'hp') { b0 = (1 + cs) / 2; b1 = -(1 + cs); b2 = (1 + cs) / 2; }
    else { b0 = al; b1 = 0; b2 = -al; } // band-pass, 0 dB peak
    a1 = (-2 * cs) / a0; a2 = (1 - al) / a0;
    b0 /= a0; b1 /= a0; b2 /= a0;
  };
  set(fc, q);
  const f = (x) => {
    const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    return y;
  };
  f.set = set;
  return f;
}

/** Mix `src` into `dst` starting at sample `at`, times gain. */
export function mixInto(dst, src, at = 0, gain = 1) {
  for (let i = 0; i < src.length; i++) {
    const j = at + i;
    if (j >= 0 && j < dst.length) dst[j] += src[i] * gain;
  }
  return dst;
}

/** Short linear fades in/out (ms) to kill clicks at the buffer edges. */
export function edgeFade(b, inMs = 1, outMs = 4) {
  const ni = Math.round((inMs / 1000) * SR);
  const no = Math.round((outMs / 1000) * SR);
  for (let i = 0; i < ni && i < b.length; i++) b[i] *= i / ni;
  for (let i = 0; i < no && i < b.length; i++) b[b.length - 1 - i] *= i / no;
  return b;
}

export const peakAbs = (b) => b.reduce((m, x) => Math.max(m, Math.abs(x)), 0);

/** Scale so the sample peak sits at `db` dBFS. */
export function normalizePeak(b, db = -3) {
  const p = peakAbs(b) || 1;
  const g = dbToGain(db) / p;
  for (let i = 0; i < b.length; i++) b[i] *= g;
  return b;
}

/** Centre time (s) of the loudest `winMs` window (RMS), 1 ms hop. */
export function loudestWindowSec(b, winMs = 10) {
  const w = Math.max(1, Math.round((winMs / 1000) * SR));
  const hop = Math.max(1, Math.round(SR / 1000));
  let best = -1, bestAt = 0;
  for (let s = 0; s + w <= Math.max(w, b.length); s += hop) {
    let e = 0;
    for (let i = s; i < s + w && i < b.length; i++) e += b[i] * b[i];
    if (e > best) { best = e; bestAt = s; }
  }
  return Math.min(b.length, bestAt + w / 2) / SR;
}

export const rmsDb = (b) => {
  let e = 0;
  for (const x of b) e += x * x;
  return gainToDb(Math.sqrt(e / Math.max(1, b.length)));
};

/** Write 16-bit PCM WAV. `channels` = array of Float32Array (1 = mono, 2 = stereo). */
export function writeWav(file, channels) {
  const ch = channels.length;
  const n = channels[0].length;
  const data = Buffer.alloc(n * ch * 2);
  for (let i = 0; i < n; i++)
    for (let c = 0; c < ch; c++) data.writeInt16LE(Math.round(clamp(channels[c][i], -1, 1) * 32767), (i * ch + c) * 2);
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8);
  h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(ch, 22);
  h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * ch * 2, 28); h.writeUInt16LE(ch * 2, 32); h.writeUInt16LE(16, 34);
  h.write('data', 36); h.writeUInt32LE(data.length, 40);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, Buffer.concat([h, data]));
}

/**
 * ffmpeg ebur128 measurement → { I (LUFS), LRA, TP (dBFS true peak) }. Short clips are padded with
 * silence to 1 s (silence is gated out of integrated loudness), so an 80 ms pop still reports a
 * meaningful LUFS. Returns null without ffmpeg.
 */
export function measure(file) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-af', 'apad=whole_dur=1,ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8' });
  if (r.error || typeof r.stderr !== 'string') return null;
  return parseEbur(r.stderr);
}
function parseEbur(txt) {
  const sum = txt.slice(txt.lastIndexOf('Summary:'));
  const I = sum.match(/I:\s+(-?[\d.]+|-inf) LUFS/);
  const LRA = sum.match(/LRA:\s+(-?[\d.]+) LU/);
  const TP = sum.match(/Peak:\s+(-?[\d.]+|-inf) dBFS/);
  return { I: I ? Number(I[1]) : NaN, LRA: LRA ? Number(LRA[1]) : NaN, TP: TP ? Number(TP[1]) : NaN };
}
