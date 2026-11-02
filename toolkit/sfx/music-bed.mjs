#!/usr/bin/env node
// music-bed.mjs — a quiet, loopable PLACEHOLDER bed synthesised in code (seeded, deterministic).
//
//   node sfx/music-bed.mjs --bpm 120 --duration 15            # -> public/music/bed-120.wav
//   node sfx/music-bed.mjs --bpm 96 --duration 20 --seed 3 --lufs -18 --key A --out public/music/bed-96-a.wav
//
// Soft sine kick on every beat, closed hats on 8ths (off-beats a touch louder), a warm detuned pad
// playing Imaj7 – vi7 – IVmaj7 – V(sus) one chord per bar, and a round sine bass on the root.
// Loopable: anything that rings past the end is wrapped onto the start, so the file loops without a
// click (musically seamless when duration is a whole number of bars).
// Loudness: normalised to --lufs (default −18) — first by RMS, then corrected with ffmpeg ebur128.
// 48 kHz 16-bit stereo. Mix it UNDER voice: <MusicBed> ducks it further under VO words.
import path from 'path';
import { fileURLToPath } from 'url';
import { SR, TAU, rng, hashSeed, biquad, dbToGain, rmsDb, peakAbs, writeWav, measure, clamp } from './dsp.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const arg = (n, d) => {
  const i = argv.findIndex((a) => a === `--${n}` || a.startsWith(`--${n}=`));
  if (i < 0) return d;
  return argv[i].includes('=') ? argv[i].split('=')[1] : argv[i + 1];
};
const BPM = Number(arg('bpm', 120));
const DUR = Number(arg('duration', 15));
const SEED = Number(arg('seed', 1));
const LUFS = Number(arg('lufs', -18));
const KEY = String(arg('key', 'C'));
const OUT = path.resolve(ROOT, arg('out', `public/music/bed-${BPM}.wav`));
if (!(BPM > 0) || !(DUR > 0)) {
  console.error('usage: node sfx/music-bed.mjs --bpm 120 --duration 15 [--seed 1] [--lufs -18] [--key C] [--out file.wav]');
  process.exit(1);
}

const N = Math.round(DUR * SR);
const TAIL = Math.round(2 * SR);
const L = new Float32Array(N + TAIL);
const R = new Float32Array(N + TAIL);
const spb = 60 / BPM; // seconds per beat
const bar = 4 * spb;
const r = rng(hashSeed('music-bed', SEED));

const NOTE = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
const root = NOTE[KEY] ?? 0;
const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
// chords as semitone offsets from the key root (pad voicing around middle C) + bass root
const PROG = [
  { pad: [0, 4, 7, 11], bass: 0 }, // Imaj7
  { pad: [-3, 0, 4, 7], bass: -3 }, // vi7
  { pad: [-7, -3, 0, 4], bass: -7 }, // IVmaj7
  { pad: [-5, 0, 2, 7], bass: -5 }, // V sus2/4-ish (soft, unresolved -> loops back to I)
];

const add = (i, l, rr = l) => {
  if (i >= 0 && i < L.length) {
    L[i] += l;
    R[i] += rr;
  }
};

// --- pad: per chord, 4 voices x 2 detuned oscillators (soft "saw" from 6 harmonics), slow attack/release
const padLp = [biquad('lp', 1400, 0.6), biquad('lp', 1400, 0.6)];
const padBuf = [new Float32Array(L.length), new Float32Array(L.length)];
const nBars = Math.ceil(DUR / bar);
for (let b = 0; b < nBars; b++) {
  const ch = PROG[b % PROG.length];
  const t0 = b * bar;
  const len = bar + 1.2; // overlap into the next bar (release)
  const s0 = Math.round(t0 * SR);
  const n = Math.round(len * SR);
  ch.pad.forEach((semi, v) => {
    const f = hz(60 + root + semi);
    for (const [side, det] of [[0, -0.07], [1, 0.07]]) {
      const ff = f * Math.pow(2, det / 12);
      const ph0 = r() * TAU;
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        const att = clamp(t / 0.45, 0, 1);
        const rel = t > bar ? clamp(1 - (t - bar) / 1.2, 0, 1) : 1;
        const env = att * att * (3 - 2 * att) * rel;
        let s = 0;
        for (let h = 1; h <= 6; h++) s += Math.sin(ph0 + TAU * ff * h * t) / (h * h * 0.7 + 0.3);
        padBuf[side][s0 + i] += s * env * (0.09 - v * 0.008);
      }
    }
  });
  // bass: round sine on the root, an octave+ below, each half-bar
  const bf = hz(36 + root + ((ch.bass + 12) % 12));
  for (const half of [0, 0.5]) {
    const hs = Math.round((t0 + half * bar) * SR);
    const hn = Math.round(bar * 0.5 * SR);
    for (let i = 0; i < hn; i++) {
      const t = i / SR;
      const env = clamp(t / 0.02, 0, 1) * Math.exp(-t / 0.9) * clamp((hn - i) / (0.05 * SR), 0, 1);
      const v = Math.sin(TAU * bf * t) * 0.16 * env;
      add(hs + i, v, v);
    }
  }
}
for (let i = 0; i < L.length; i++) {
  L[i] += padLp[0](padBuf[0][i]);
  R[i] += padLp[1](padBuf[1][i]);
}

// --- kick: soft sine 70 -> 45 Hz on every beat
const nBeats = Math.ceil(DUR / spb);
for (let k = 0; k < nBeats; k++) {
  const s0 = Math.round(k * spb * SR);
  const g = k % 4 === 0 ? 0.42 : 0.32;
  let ph = 0;
  for (let i = 0; i < 0.3 * SR; i++) {
    const t = i / SR;
    ph += (TAU * (45 + 25 * Math.exp(-t / 0.04))) / SR;
    const v = Math.sin(ph) * Math.min(1, t / 0.004) * Math.exp(-t / 0.075) * g;
    add(s0 + i, v, v);
  }
}

// --- hats: high-passed noise on 8ths, short decay, slight stereo offset
const hatHp = [biquad('hp', 7000, 0.7), biquad('hp', 7000, 0.7)];
const hat = [new Float32Array(L.length), new Float32Array(L.length)];
for (let k = 0; k < nBeats * 2; k++) {
  const s0 = Math.round(((k * spb) / 2) * SR);
  const g = (k % 2 ? 0.07 : 0.045) * (0.85 + 0.3 * r());
  const pan = k % 4 === 1 ? 0.75 : k % 4 === 3 ? 1.25 : 1;
  for (let i = 0; i < 0.05 * SR; i++) {
    const t = i / SR;
    const env = Math.exp(-t / 0.012) * g;
    const nz = r() * 2 - 1;
    hat[0][s0 + i] += nz * env * (2 - pan);
    hat[1][s0 + i] += nz * env * pan;
  }
}
for (let i = 0; i < L.length; i++) {
  L[i] += hatHp[0](hat[0][i]);
  R[i] += hatHp[1](hat[1][i]);
}

// --- wrap the tail onto the start (loopable), trim to N
const outL = L.slice(0, N);
const outR = R.slice(0, N);
for (let i = 0; i < TAIL; i++) {
  outL[i % N] += L[N + i];
  outR[i % N] += R[N + i];
}

// --- loudness: RMS first (≈ LUFS for broadband material), then one ebur128 correction pass
const scaleAll = (g) => {
  for (let i = 0; i < N; i++) {
    outL[i] *= g;
    outR[i] *= g;
  }
};
const both = new Float32Array(N * 2);
const rmsStereo = () => {
  for (let i = 0; i < N; i++) {
    both[2 * i] = outL[i];
    both[2 * i + 1] = outR[i];
  }
  return rmsDb(both);
};
scaleAll(dbToGain(LUFS - rmsStereo() + 0.5));
const safePeak = () => {
  const p = Math.max(peakAbs(outL), peakAbs(outR));
  if (p > dbToGain(-1.5)) scaleAll(dbToGain(-1.5) / p);
};
safePeak();
writeWav(OUT, [outL, outR]);
let m = measure(OUT);
if (m && Number.isFinite(m.I) && Math.abs(m.I - LUFS) > 0.3) {
  scaleAll(dbToGain(LUFS - m.I));
  safePeak();
  writeWav(OUT, [outL, outR]);
  m = measure(OUT);
}
const barsExact = DUR / bar;
console.log(`bed: ${BPM} BPM, ${DUR}s (${barsExact.toFixed(2)} bars of 4/4, key ${KEY}, seed ${SEED}) -> ${path.relative(ROOT, OUT)}`);
if (m) console.log(`loudness: ${m.I} LUFS integrated (target ${LUFS}), LRA ${m.LRA} LU, true peak ${m.TP} dBFS`);
if (Math.abs(barsExact - Math.round(barsExact)) > 1e-6)
  console.log(`note: ${DUR}s is not a whole number of bars — the file loops click-free, but the chord loop restarts mid-progression. For a musically seamless loop use ${(Math.round(barsExact) * bar).toFixed(3)}s.`);
