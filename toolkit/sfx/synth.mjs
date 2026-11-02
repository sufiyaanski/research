#!/usr/bin/env node
// synth.mjs — code-synthesised SFX library. Pure Node, no deps, deterministic (seeded PRNG).
//
//   node sfx/synth.mjs                 # writes public/sfx/*.wav (12 sounds) + public/sfx/catalog.json, prints loudness
//   node sfx/synth.mjs --seed 7        # different (still deterministic) noise
//   node sfx/synth.mjs --only pop,tick
//
// Every sound: 16-bit, 48 kHz, mono, sample peak normalised to −3 dBFS. catalog.json records the time
// of the loudest 10 ms (peakSec) so <SfxCue> can land the PEAK, not the file start, on a frame.
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  SR, TAU, rng, hashSeed, buf, biquad, mixInto, edgeFade, normalizePeak, loudestWindowSec, writeWav, measure, rmsDb,
} from './dsp.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'sfx');
const argv = process.argv.slice(2);
const arg = (n, d) => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 ? argv[i + 1] : d;
};
const SEED = Number(arg('seed', 1));
const ONLY = arg('only', '')?.split(',').filter(Boolean);
const PEAK_DB = -3;

const t = (i) => i / SR;
const expDecay = (x, tau) => Math.exp(-x / tau);

// ----------------------------------------------------------------------------- sounds

/** Filtered noise sweep. Band-pass centre rides the envelope (dark → bright → dark); peak at ~60 %. */
function whoosh(r) {
  const dur = 0.45, b = buf(dur), bp = biquad('bp', 500, 1.4), lp = biquad('lp', 6000);
  const peakAt = 0.6;
  for (let i = 0; i < b.length; i++) {
    const x = t(i) / dur;
    const env = x < peakAt ? Math.pow(x / peakAt, 2.2) : Math.pow(1 - (x - peakAt) / (1 - peakAt), 1.6);
    bp.set(350 + 3200 * env, 1.1 + 0.6 * env);
    const n = r() * 2 - 1;
    b[i] = lp(bp(n)) * env;
  }
  return edgeFade(b, 2, 10);
}

/** Short sine blip with a pitch drop (~80 ms). */
function pop(r) {
  const dur = 0.08, b = buf(dur);
  let ph = 0;
  for (let i = 0; i < b.length; i++) {
    const s = t(i);
    const f = 260 + 820 * Math.exp(-s / 0.018);
    ph += (TAU * f) / SR;
    const env = Math.min(1, s / 0.0015) * expDecay(s, 0.022);
    b[i] = Math.sin(ph) * env + (s < 0.002 ? (r() * 2 - 1) * 0.15 * (1 - s / 0.002) : 0);
  }
  return edgeFade(b, 0.2, 6);
}

/** 5–10 ms transient + tiny tonal body. */
function click(r) {
  const dur = 0.03, b = buf(dur), hp = biquad('hp', 2500, 0.8);
  for (let i = 0; i < b.length; i++) {
    const s = t(i);
    const tr = s < 0.006 ? (r() * 2 - 1) * Math.pow(1 - s / 0.006, 2) : 0;
    const body = Math.sin(TAU * 1850 * s) * expDecay(s, 0.0045) * 0.55;
    b[i] = hp(tr) * 0.9 + body;
  }
  return edgeFade(b, 0.1, 8);
}

/** Sub sine 55 → 40 Hz, fast decay, plus a click on top (~0.35 s). */
function thump(r) {
  const dur = 0.35, b = buf(dur), lp = biquad('lp', 1800);
  let ph = 0;
  for (let i = 0; i < b.length; i++) {
    const s = t(i);
    const f = 40 + 15 * Math.exp(-s / 0.07);
    ph += (TAU * f) / SR;
    const env = Math.min(1, s / 0.003) * expDecay(s, 0.085);
    const clk = s < 0.008 ? lp(r() * 2 - 1) * Math.pow(1 - s / 0.008, 2) * 0.5 : 0;
    // a touch of 2nd harmonic so the thump survives phone speakers
    b[i] = (Math.sin(ph) + 0.18 * Math.sin(2 * ph)) * env + clk;
  }
  return edgeFade(b, 0.2, 20);
}

/** Noise + rising saw (1.8 s), crescendo that ENDS at its peak (no tail — cut to the reveal). */
function riser(r) {
  const dur = 1.8, b = buf(dur), hp = biquad('hp', 300, 0.7), lp = biquad('lp', 800, 0.9), bp = biquad('bp', 800, 2);
  let ph = 0, ph2 = 0;
  for (let i = 0; i < b.length; i++) {
    const x = t(i) / dur;
    const f = 110 * Math.pow(8, x); // 110 → 880 Hz
    ph = (ph + f / SR) % 1;
    ph2 = (ph2 + (f * 1.007) / SR) % 1;
    const saw = (2 * ph - 1) * 0.5 + (2 * ph2 - 1) * 0.5;
    lp.set(600 + 5000 * x * x, 1.2);
    hp.set(300 + 3000 * x, 0.7);
    bp.set(f * 4, 3);
    const n = r() * 2 - 1;
    const env = Math.pow(x, 2.4);
    b[i] = (lp(saw) * 0.55 + hp(n) * 0.35 + bp(n) * 0.4) * env;
  }
  return edgeFade(b, 5, 3);
}

/** Layered: thump + noise burst + short dark tail (~0.8 s). */
function impact(r) {
  const dur = 0.8, b = buf(dur);
  const th = thump(rng(hashSeed('impact-thump', SEED)));
  mixInto(b, th, 0, 1.0);
  const lp = biquad('lp', 2500, 0.8), tailLp = biquad('lp', 900, 0.6), hp = biquad('hp', 60);
  let ph = 0;
  for (let i = 0; i < b.length; i++) {
    const s = t(i);
    const n = r() * 2 - 1;
    const burst = lp(n) * expDecay(s, 0.035) * 0.9;
    const tail = tailLp(n) * expDecay(s, 0.22) * 0.35 * Math.min(1, s / 0.02);
    ph += (TAU * 72) / SR;
    const body = Math.sin(ph) * expDecay(s, 0.16) * 0.3;
    b[i] += hp(burst + tail + body);
  }
  return edgeFade(b, 0.2, 60);
}

/** "Ka-ching": metallic click (ka) then bright bell partials 2.6/3.3 kHz + inharmonic overtones. */
function cashRegister(r) {
  const dur = 0.9, b = buf(dur);
  // ka: two metallic clicks (drawer latch)
  for (const [at, g] of [[0, 0.9], [0.045, 0.6]]) {
    const bp = biquad('bp', 4200, 3);
    const n = Math.round(0.012 * SR);
    const c = new Float32Array(n);
    for (let i = 0; i < n; i++) c[i] = bp(r() * 2 - 1) * Math.pow(1 - i / n, 3) * 2.2 + Math.sin(TAU * 1900 * t(i)) * expDecay(t(i), 0.003) * 0.4;
    mixInto(b, c, Math.round(at * SR), g);
  }
  // ching: bell partials (freq, amp, decay) — two "strikes" a hair apart for the double-ring
  const partials = [
    [2600, 1.0, 0.32], [2606, 0.6, 0.3], [3300, 0.85, 0.26], [3309, 0.4, 0.22],
    [5410, 0.35, 0.12], [6930, 0.22, 0.08], [8650, 0.12, 0.05], [1310, 0.18, 0.18],
  ];
  for (const [at, g] of [[0.085, 1], [0.13, 0.55]]) {
    const start = Math.round(at * SR);
    for (let i = start; i < b.length; i++) {
      const s = t(i - start);
      let v = 0;
      for (const [f, a, d] of partials) v += Math.sin(TAU * f * s + f) * a * expDecay(s, d);
      b[i] += v * g * 0.28 * Math.min(1, s / 0.0008);
    }
  }
  return edgeFade(b, 0.1, 40);
}

/** ~3 ms high click for counters. */
function tick(r) {
  const dur = 0.012, b = buf(dur), hp = biquad('hp', 4000, 0.7);
  for (let i = 0; i < b.length; i++) {
    const s = t(i);
    const env = s < 0.003 ? Math.pow(1 - s / 0.003, 1.5) : 0;
    b[i] = (hp(r() * 2 - 1) * 0.6 + Math.sin(TAU * 5200 * s) * 0.8) * env;
  }
  return edgeFade(b, 0.05, 2);
}

// ---- what-if countdown format (examples/whatif-countdown) --------------------------------------

/** "Power-down": 4 pure sine partials gliding down ~2 octaves over 1.2 s (exp glide), slow decay.
 *  The world switching mode. Loudest at the start (peakSec ≈ 0) — cue `at` = the switch frame. */
function powerDown(r) {
  const dur = 1.6, b = buf(dur);
  const parts = [[440, 1.0], [660, 0.55], [880, 0.4], [1320, 0.22]];
  const ph = parts.map(() => r() * TAU);
  for (let i = 0; i < b.length; i++) {
    const s = t(i);
    const glide = Math.pow(0.25, Math.min(1, s / 1.2)); // ×0.25 = −2 octaves over 1.2 s
    const env = Math.min(1, s / 0.004) * (s < 1.2 ? 1 - 0.55 * (s / 1.2) : 0.45 * expDecay(s - 1.2, 0.12));
    let v = 0;
    parts.forEach(([f, a], k) => {
      ph[k] += (TAU * f * glide * (1 + 0.002 * k)) / SR;
      v += Math.sin(ph[k]) * a;
    });
    b[i] = v * env;
  }
  return edgeFade(b, 0.5, 30);
}

/** "Twinkle": 9 short high sine grains (pentatonic, 1.6–5 kHz) scattered over 1.1 s, each with a fast
 *  attack and 60–160 ms decay. Stars / glass / sparkle appearing. */
function twinkle(r) {
  const dur = 1.3, b = buf(dur);
  const scale = [0, 2, 4, 7, 9];
  for (let g = 0; g < 9; g++) {
    const at = g === 0 ? 0 : 0.04 + r() * 1.0;
    const semi = scale[Math.floor(r() * scale.length)] + 12 * Math.floor(r() * 2);
    const f = 1568 * Math.pow(2, semi / 12) * (1 + (r() - 0.5) * 0.004);
    const dec = 0.06 + r() * 0.1;
    const amp = g === 0 ? 1 : 0.35 + r() * 0.5;
    const s0 = Math.round(at * SR);
    const n = Math.round((dec * 5) * SR);
    for (let i = 0; i < n && s0 + i < b.length; i++) {
      const s = t(i);
      b[s0 + i] += (Math.sin(TAU * f * s) + 0.25 * Math.sin(TAU * f * 2.01 * s)) * Math.min(1, s / 0.0015) * expDecay(s, dec) * amp;
    }
  }
  return edgeFade(b, 0.1, 40);
}

/** "Noise wall": 2 s band-limited noise swell (band opens 300 Hz → 7 kHz, exp crescendo) that ENDS at
 *  its peak — cue `at` = the hit / white-out frame. */
function noiseWall(r) {
  const dur = 2.0, b = buf(dur), bp = biquad('bp', 400, 0.7), lp = biquad('lp', 1200, 0.7), hp = biquad('hp', 80, 0.7);
  let ph = 0;
  for (let i = 0; i < b.length; i++) {
    const x = t(i) / dur;
    bp.set(300 + 6700 * x * x, 0.6 + 0.4 * x);
    lp.set(1200 + 9000 * x, 0.7);
    const n = r() * 2 - 1;
    ph += (TAU * (60 + 180 * x * x)) / SR;
    const env = Math.pow(x, 2.6);
    b[i] = hp(lp(bp(n) * 1.4 + n * 0.25 * x) + Math.sin(ph) * 0.18 * x) * env;
  }
  return edgeFade(b, 5, 2);
}

/** "Glitch": granular stutter — 14 grains (12–45 ms) of sine / noise / square at jumping pitches,
 *  some repeated 2–4× like a skipping buffer, over ~0.7 s (soft-clipped sine, not a raw square, so the
 *  true peak stays near the −3 dBFS sample peak). Digital rebuild / point cloud. */
function glitch(r) {
  const dur = 0.75, b = buf(dur);
  let at = 0;
  for (let g = 0; g < 14 && at < 0.68; g++) {
    const len = 0.012 + r() * 0.033;
    const kind = Math.floor(r() * 3);
    const f = 180 * Math.pow(2, Math.floor(r() * 30) / 6);
    const reps = r() < 0.4 ? 2 + Math.floor(r() * 3) : 1;
    const amp = 0.45 + r() * 0.55;
    const grain = new Float32Array(Math.round(len * SR));
    const hp = biquad('hp', 900, 0.7);
    for (let i = 0; i < grain.length; i++) {
      const s = t(i);
      const env = Math.min(1, i / 48) * Math.min(1, (grain.length - i) / 96);
      const v = kind === 0 ? Math.sin(TAU * f * s) : kind === 1 ? hp(r() * 2 - 1) * 1.3 : Math.tanh(2.5 * Math.sin(TAU * f * s)) * 0.5;
      grain[i] = v * env * amp;
    }
    for (let k = 0; k < reps; k++) mixInto(b, grain, Math.round((at + k * len) * SR), 1 - k * 0.18);
    at += len * reps + r() * 0.03;
  }
  // tame the grain edges (inter-sample peaks): gentle 6 kHz low-pass over the whole stutter
  const lp = biquad('lp', 6000, 0.6);
  for (let i = 0; i < b.length; i++) b[i] = lp(b[i]);
  return edgeFade(b, 0.1, 10);
}

const SOUNDS = [
  { id: 'whoosh', fn: whoosh, category: 'transition', use: 'morph / cut / camera move — peak lands ON the cut' },
  { id: 'pop', fn: pop, category: 'ui', use: 'number or word pop (pair with usePop on money words)' },
  { id: 'click', fn: click, category: 'ui', use: 'button press, toggle, cursor tap' },
  { id: 'thump', fn: thump, category: 'hit', use: 'logo / object landing, price tag slam' },
  { id: 'riser', fn: riser, category: 'build', use: 'tension INTO the reveal (ends at its peak; cue at = reveal frame)' },
  { id: 'impact', fn: impact, category: 'hit', use: 'the payoff / punchline hit' },
  { id: 'cash-register', fn: cashRegister, category: 'money', use: 'money reveal (price, savings, total)' },
  { id: 'tick', fn: tick, category: 'ui', use: 'counter steps (one per digit change), clock ticks' },
  { id: 'power-down', fn: powerDown, category: 'whatif', use: 'the world switches mode (sine partials gliding down 2 octaves, peak at the start; cue at = switch frame)' },
  { id: 'twinkle', fn: twinkle, category: 'whatif', use: 'stars / glass / sparkles appearing (high sine grains over ~1.1 s)' },
  { id: 'noise-wall', fn: noiseWall, category: 'whatif', use: 'build INTO a white-out / explosion (2 s noise swell ending at its peak; cue at = hit frame)' },
  { id: 'glitch', fn: glitch, category: 'whatif', use: 'digital rebuild / point cloud / time skip (granular stutter, ~0.7 s)' },
];

// ----------------------------------------------------------------------------- main
mkdirSync(OUT, { recursive: true });
const catalog = {
  generatedBy: 'sfx/synth.mjs',
  seed: SEED,
  sampleRate: SR,
  channels: 1,
  bitDepth: 16,
  peakDbfs: PEAK_DB,
  note: 'file is relative to public/ (use staticFile(file)). peakSec = centre of the loudest 10 ms window.',
  sounds: [],
};
console.log('id              dur     peakSec  rms(dBFS)  LUFS(int)  TP(dBFS)');
for (const s of SOUNDS) {
  if (ONLY.length && !ONLY.includes(s.id)) continue;
  const b = normalizePeak(s.fn(rng(hashSeed(s.id, SEED))), PEAK_DB);
  const file = path.join(OUT, `${s.id}.wav`);
  writeWav(file, [b]);
  const durationSec = +(b.length / SR).toFixed(4);
  const peakSec = +loudestWindowSec(b, 10).toFixed(4);
  const m = measure(file);
  catalog.sounds.push({
    id: s.id,
    file: `sfx/${s.id}.wav`,
    durationSec,
    peakSec,
    category: s.category,
    use: s.use,
    license: 'own (code-synthesised)',
  });
  console.log(
    `${s.id.padEnd(15)} ${durationSec.toFixed(3).padStart(6)}s  ${peakSec.toFixed(3).padStart(6)}s  ${rmsDb(b).toFixed(1).padStart(8)}  ${m ? String(m.I).padStart(9) : '   n/a   '}  ${m ? String(m.TP).padStart(7) : 'n/a'}`,
  );
}
if (!ONLY.length) {
  writeFileSync(path.join(OUT, 'catalog.json'), JSON.stringify(catalog, null, 2) + '\n');
  console.log(`-> ${path.relative(ROOT, path.join(OUT, 'catalog.json'))} (${catalog.sounds.length} sounds)`);
} else console.log('(--only: catalog.json not rewritten)');
