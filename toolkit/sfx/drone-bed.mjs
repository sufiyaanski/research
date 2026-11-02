#!/usr/bin/env node
// drone-bed.mjs — the SCORE for a what-if countdown episode, synthesised in code from the episode's
// act timeline (pure Node, seeded, deterministic). Unlike music-bed.mjs (a loopable BPM groove), this
// is one through-composed stereo file, exactly as long as the reel, whose sections follow the acts:
//
//   normal      park ambience: leaf/wind noise, bird chirps (FM sine sweeps), a distant city hum
//   xray        sustained sine pad in open fifths (A: 55/82.5/110/165/220 Hz), slow beating
//   hands       + twinkling granular high sine notes (pentatonic, 1.5–5 kHz)
//   glow        + a rising sine glide (220 → 1760 Hz) and a broadband noise swell into the white-out
//   whiteout    hard cut; a high "ringing" sine + sub rumble decaying (the cue `impact` carries the hit)
//   space       deep pad + airy noise; the LAST space act before the return carries a long riser
//   pointcloud  glitchy granular texture + a big pad swell, decaying into the blank
//   blank       silence
//   endcard     near-silence: a very soft pad
//
//   node sfx/drone-bed.mjs --config examples/whatif-countdown/whatif.config.ts            # -> public/<config.audio.bed>
//   node sfx/drone-bed.mjs --config <cfg.ts> [--seed 1] [--lufs -17] [--out public/music/x.wav]
//
// The one-shot hits (power-down, twinkle, noise-wall, impact, glitch, riser) are NOT in the bed: they
// are catalog cues placed by <SfxTrack> on the picture's frames. Loudness: normalised to --lufs
// (integrated, ebur128) with a −2 dBFS sample-peak cap; quiet sections stay quiet (the arc matters more
// than the average). 48 kHz 16-bit stereo.
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { SR, TAU, rng, hashSeed, biquad, dbToGain, peakAbs, writeWav, measure, clamp } from './dsp.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const arg = (n, d) => {
  const i = argv.findIndex((a) => a === `--${n}` || a.startsWith(`--${n}=`));
  if (i < 0) return d;
  return argv[i].includes('=') ? argv[i].split('=')[1] : argv[i + 1];
};
const cfgPath = arg('config', undefined);
if (!cfgPath) {
  console.error('usage: node sfx/drone-bed.mjs --config <episode config .ts|.json> [--seed 1] [--lufs -17] [--out public/music/x.wav]');
  process.exit(1);
}
const cfgMod = await import(pathToFileURL(path.resolve(cfgPath)).href, cfgPath.endsWith('.json') ? { with: { type: 'json' } } : undefined);
const cfg = cfgMod.default;
const SEED = Number(arg('seed', 1));
const LUFS = Number(arg('lufs', -17));
const OUT = path.resolve(ROOT, arg('out', path.join('public', cfg.audio?.bed ?? `music/whatif-${cfg.id}.wav`)));
const DUR = cfg.durationSec;
const acts = cfg.acts;
const N = Math.round(DUR * SR);
const L = new Float32Array(N);
const R = new Float32Array(N);
const S = (sec) => clamp(Math.round(sec * SR), 0, N);
const add = (i, l, r = l) => {
  if (i >= 0 && i < N) {
    L[i] += l;
    R[i] += r;
  }
};
const pan = (v, p) => [v * Math.cos((p + 1) * Math.PI / 4), v * Math.sin((p + 1) * Math.PI / 4)];
/** linear fade multiplier for sample i inside [a, b) with fade lengths (s) */
const win = (i, a, b, fin, fout) => clamp((i - a) / Math.max(1, fin * SR), 0, 1) * clamp((b - i) / Math.max(1, fout * SR), 0, 1);

const r = rng(hashSeed('drone-bed', SEED));
const switchT = cfg.phaseA.realSeconds;
const returnT = cfg.phaseA.realSeconds + cfg.phaseB.virtualSeconds * cfg.phaseB.slowFactor;

// ----------------------------------------------------------------------------- voices
function parkAmbience(a, b) {
  const s0 = S(a), s1 = S(b);
  const lpL = biquad('lp', 900, 0.6), lpR = biquad('lp', 950, 0.6), hpL = biquad('hp', 140), hpR = biquad('hp', 140);
  const hum = biquad('lp', 180, 0.7);
  let pinkL = 0, pinkR = 0;
  for (let i = s0; i < s1; i++) {
    const t = i / SR;
    const gust = 0.55 + 0.45 * Math.sin(t * 0.7 + 1.3) * Math.sin(t * 0.23);
    pinkL = 0.97 * pinkL + 0.03 * (r() * 2 - 1);
    pinkR = 0.97 * pinkR + 0.03 * (r() * 2 - 1);
    const w = win(i, s0, s1, 0.4, 0.12);
    const h = hum(r() * 2 - 1) * 0.05 + Math.sin(TAU * 55 * t) * 0.004;
    add(i, (hpL(lpL(pinkL * 6)) * 0.08 * gust + h) * w, (hpR(lpR(pinkR * 6)) * 0.08 * gust + h) * w);
  }
  // birds: little FM chirp phrases
  let t = a + 0.15;
  while (t < b - 0.3) {
    const notes = 2 + Math.floor(r() * 4);
    const base = 2600 + r() * 1600;
    const p = r() * 1.4 - 0.7;
    const amp = 0.08 + r() * 0.07;
    let tt = t;
    for (let k = 0; k < notes; k++) {
      const len = 0.04 + r() * 0.05;
      const sweep = (r() < 0.5 ? 1 : -1) * (600 + r() * 900);
      const st = S(tt);
      let ph = 0;
      for (let j = 0; j < len * SR; j++) {
        const x = j / (len * SR);
        const f = base + sweep * x + 180 * Math.sin(TAU * 38 * j / SR);
        ph += (TAU * f) / SR;
        const env = Math.sin(Math.PI * x) ** 2;
        const [l, rr] = pan(Math.sin(ph) * env * amp * win(st + j, S(a), S(b), 0.3, 0.15), p);
        add(st + j, l, rr);
      }
      tt += len + 0.02 + r() * 0.05;
    }
    t = tt + 0.35 + r() * 1.0;
  }
}

/** open-fifth sine pad; `amp(tSec)` shapes it (0..1) */
function pad(a, b, level, amp, freqs = [55, 82.5, 110, 165, 220], bright = 0) {
  const s0 = S(a), s1 = S(b);
  const ph = freqs.map(() => [r() * TAU, r() * TAU]);
  for (let i = s0; i < s1; i++) {
    const t = i / SR;
    const e = amp(t) * level;
    if (e <= 0) continue;
    let l = 0, rr = 0;
    freqs.forEach((f, k) => {
      const g = 1 / (1 + k * 0.55) * (1 + bright * k * 0.3);
      const lfo = 0.75 + 0.25 * Math.sin(t * (0.21 + k * 0.07) + k);
      ph[k][0] += (TAU * f * 0.998) / SR;
      ph[k][1] += (TAU * f * 1.002) / SR;
      l += Math.sin(ph[k][0]) * g * lfo;
      rr += Math.sin(ph[k][1]) * g * lfo;
    });
    add(i, l * e, rr * e);
  }
}

function twinkles(a, b, perSec, level) {
  const scale = [0, 2, 4, 7, 9];
  let t = a + 0.2;
  while (t < b - 0.2) {
    const semi = scale[Math.floor(r() * 5)] + 12 * Math.floor(r() * 2);
    const f = 1480 * Math.pow(2, semi / 12);
    const dec = 0.08 + r() * 0.18;
    const p = r() * 1.6 - 0.8;
    const amp = level * (0.4 + 0.6 * r());
    const st = S(t);
    for (let j = 0; j < dec * 5 * SR; j++) {
      const s = j / SR;
      const v = (Math.sin(TAU * f * s) + 0.2 * Math.sin(TAU * f * 3.01 * s)) * Math.min(1, s / 0.002) * Math.exp(-s / dec) * amp * win(st + j, S(a), S(b), 0.4, 0.3);
      const [l, rr] = pan(v, p);
      add(st + j, l, rr);
    }
    t += (0.4 + r() * 1.2) / perSec;
  }
}

/** rising sine glide f0→f1 + noise swell, crescendo ending at b (into the white-out / return) */
function riseInto(a, b, f0, f1, level, noise = 1) {
  const s0 = S(a), s1 = S(b);
  const bp = [biquad('bp', 400, 0.8), biquad('bp', 400, 0.8)];
  let ph = 0, ph2 = 0;
  for (let i = s0; i < s1; i++) {
    const x = (i - s0) / Math.max(1, s1 - s0);
    const f = f0 * Math.pow(f1 / f0, x);
    ph += (TAU * f) / SR;
    ph2 += (TAU * f * 1.5) / SR;
    const env = Math.pow(x, 2.2) * level;
    bp[0].set(300 + 5000 * x * x, 0.7);
    bp[1].set(320 + 5200 * x * x, 0.7);
    const tone = (Math.sin(ph) + 0.35 * Math.sin(ph2)) * 0.6;
    add(i, (tone + bp[0](r() * 2 - 1) * 1.6 * noise) * env, (tone + bp[1](r() * 2 - 1) * 1.6 * noise) * env);
  }
}

function ring(a, len, level) {
  const s0 = S(a);
  let ph = 0, sub = 0;
  for (let j = 0; j < len * SR; j++) {
    const s = j / SR;
    ph += (TAU * 2093) / SR;
    sub += (TAU * (38 + 10 * Math.exp(-s / 0.4))) / SR;
    const v = Math.sin(ph) * 0.35 * Math.exp(-s / (len * 0.35)) + Math.sin(sub) * Math.exp(-s / (len * 0.3));
    add(s0 + j, v * level * Math.min(1, s / 0.01), v * level * Math.min(1, s / 0.01));
  }
}

function air(a, b, level) {
  const s0 = S(a), s1 = S(b);
  const f = [biquad('bp', 2400, 0.5), biquad('bp', 2600, 0.5)];
  for (let i = s0; i < s1; i++) {
    const w = win(i, s0, s1, 0.8, 0.5) * level;
    add(i, f[0](r() * 2 - 1) * w, f[1](r() * 2 - 1) * w);
  }
}

function glitchTexture(a, b, level) {
  let t = a + 0.05;
  const scale = [0, 3, 5, 7, 10];
  while (t < b - 0.05) {
    const len = 0.012 + r() * 0.03;
    const kind = r();
    const f = 220 * Math.pow(2, (scale[Math.floor(r() * 5)] + 12 * Math.floor(r() * 3)) / 12);
    const reps = r() < 0.35 ? 2 + Math.floor(r() * 3) : 1;
    const p = r() * 1.6 - 0.8;
    const st = S(t);
    const fade = 1 - clamp((t - a) / Math.max(0.1, b - a), 0, 1) * 0.6;
    for (let k = 0; k < reps; k++)
      for (let j = 0; j < len * SR; j++) {
        const x = j / (len * SR);
        const env = Math.min(1, x * 20) * Math.min(1, (1 - x) * 10);
        const v = (kind < 0.6 ? Math.sin(TAU * f * j / SR) : (r() * 2 - 1) * 0.7) * env * level * fade * (1 - k * 0.2);
        const [l, rr] = pan(v, p);
        add(st + Math.round(k * len * SR) + j, l, rr);
      }
    t += len * reps + 0.02 + r() * 0.07;
  }
}

// ----------------------------------------------------------------------------- arrange by act
const glowActs = acts.filter((a) => a.look === 'glow');
const spaceActs = acts.filter((a) => a.look === 'space');
const lastSpace = spaceActs.filter((a) => a.end <= returnT + 1e-6).pop();
for (const a of acts) {
  const { start: s, end: e, look } = a;
  if (look === 'normal') parkAmbience(s, e);
  if (['xray', 'hands', 'glow'].includes(look)) {
    // pad enters slowly after the switch (the power-down cue owns the first second)
    pad(s, e, 0.055, (t) => clamp((t - switchT - 0.6) / 1.8, 0, 1) * Math.min(1, (e - t) / 0.05 + (look === 'glow' ? 1 : 0)));
    if (look === 'xray') pad(s, e, 0.012, (t) => 0.5 + 0.5 * Math.sin((t - s) * 0.9), [880, 1320]);
  }
  if (look === 'hands') twinkles(s, e, 5, 0.06);
  if (look === 'whiteout') ring(s, Math.max(0.6, e - s + 0.8), 0.05);
  if (look === 'space') {
    pad(s, e, 0.05, (t) => clamp((t - s) / 0.8, 0, 1) * clamp((e - t) / 0.3, 0, 1), [41.2, 55, 82.5, 110]);
    air(s, e, 0.012);
    if (a === lastSpace) riseInto(s + 0.4, e, 110, 880, 0.1, 0.7);
  }
  if (look === 'pointcloud') {
    glitchTexture(s, e, 0.05);
    const peak = s + (e - s) * 0.45;
    pad(s, e, 0.07, (t) => (t < peak ? Math.pow((t - s) / (peak - s), 1.5) : Math.exp(-(t - peak) / 1.4)) * clamp((e - t) / 0.4, 0, 1), [55, 82.5, 110, 165, 247.5], 0.5);
  }
  if (look === 'endcard') pad(s, e, 0.008, (t) => clamp((t - s) / 1.2, 0, 1) * clamp((e - t) / 1, 0, 1), [110, 165]);
}
if (glowActs.length) {
  const a = glowActs[0].start;
  const b = glowActs[glowActs.length - 1].end;
  riseInto(a, b, 220, 1760, 0.09, 1);
}

// ----------------------------------------------------------------------------- loudness
const scaleAll = (g) => {
  for (let i = 0; i < N; i++) {
    L[i] *= g;
    R[i] *= g;
  }
};
const capPeak = () => {
  const p = Math.max(peakAbs(L), peakAbs(R));
  if (p > dbToGain(-2)) scaleAll(dbToGain(-2) / p);
};
capPeak();
writeWav(OUT, [L, R]);
let m = measure(OUT);
for (let k = 0; k < 2 && m && Number.isFinite(m.I) && Math.abs(m.I - LUFS) > 0.3; k++) {
  scaleAll(dbToGain(LUFS - m.I));
  capPeak();
  writeWav(OUT, [L, R]);
  m = measure(OUT);
}
console.log(`drone bed: ${cfg.id}, ${DUR}s, ${acts.length} acts (switch ${switchT}s, return ${returnT}s), seed ${SEED} -> ${path.relative(ROOT, OUT)}`);
if (m) console.log(`loudness: ${m.I} LUFS integrated (target ${LUFS}), LRA ${m.LRA} LU, true peak ${m.TP} dBFS`);
