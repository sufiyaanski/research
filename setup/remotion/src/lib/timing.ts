// Timing helpers. Everything is frame-based; seconds exist only at the edges (beats.json, VO).
// Compositions are 60 fps — never hard-code 60, always derive from `fps`.

export const FPS = 60;
export const W = 1080;
export const H = 1920;

/** Seconds -> whole frames (round, never floor: a 1.5 s beat at 60 fps is frame 90, not 89). */
export const sec = (s: number, fps = FPS) => Math.round(s * fps);

/** 0..1 progress of t through [a,b], clamped. Safe when a === b. */
export const prog = (t: number, a: number, b: number) =>
  Math.max(0, Math.min(1, (t - a) / Math.max(1e-6, b - a)));

/**
 * THE recurring bug: frames inside a <Sequence from={X}> are LOCAL (start at 0).
 * A global beat at second s lands on local frame `toLocal(s, sequenceFromFrame)`.
 */
export const toLocal = (globalSeconds: number, sequenceFrom: number, fps = FPS) =>
  sec(globalSeconds, fps) - sequenceFrom;

/** Inverse: a local frame inside <Sequence from={X}> is global second (local + X) / fps. */
export const toGlobalSeconds = (localFrame: number, sequenceFrom: number, fps = FPS) =>
  (localFrame + sequenceFrom) / fps;

export type Beat = {
  id: string;
  /** global seconds */
  start: number;
  /** global seconds (exclusive) */
  end: number;
  visual?: string;
  sfx?: string[];
};

export type BeatFrames = Beat & {
  from: number;
  durationInFrames: number;
};

/** beats.json -> <Sequence from/durationInFrames> values. Validates that beats are contiguous. */
export const beatsToFrames = (beats: Beat[], fps = FPS): BeatFrames[] => {
  const out: BeatFrames[] = [];
  for (let i = 0; i < beats.length; i++) {
    const b = beats[i];
    if (b.end <= b.start) throw new Error(`beat "${b.id}" ends before it starts`);
    if (i > 0 && Math.abs(beats[i - 1].end - b.start) > 1e-6) {
      throw new Error(`beat "${b.id}" starts at ${b.start} but previous ends at ${beats[i - 1].end}`);
    }
    const from = sec(b.start, fps);
    const durationInFrames = sec(b.end, fps) - from;
    out.push({ ...b, from, durationInFrames });
  }
  return out;
};

/** Find a beat by id (throws so a typo fails at bundle time, not silently). */
export const beat = (beats: BeatFrames[], id: string): BeatFrames => {
  const b = beats.find((x) => x.id === id);
  if (!b) throw new Error(`unknown beat "${id}"`);
  return b;
};

/**
 * Minimum on-screen hold for a piece of text, in frames.
 * Rule: reading time at ~3 words/s (180 wpm) + 0.5 s settle. Numbers count as 2 words.
 * Sources: 180 wpm is a conservative silent-reading speed; +0.5 s and 0.3 s/word are the
 * HyperFrames motion rules (see reel-design-rules). Use the larger of the two formulas.
 */
export const holdFrames = (text: string, fps = FPS, wordsPerSecond = 3, padSeconds = 0.5) => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const weighted = words.reduce((n, w) => n + (/\d/.test(w) ? 2 : 1), 0);
  const a = weighted / wordsPerSecond + padSeconds;
  const b = 0.5 + 0.3 * weighted;
  return Math.ceil(Math.max(a, b) * fps);
};

/** Words per caption chunk from VO energy: high-energy beats use 2-3, conversational 3-4. */
export const chunkSizeFor = (beatId: string) => (/hook|payoff|reveal|twist/i.test(beatId) ? 3 : 4);

/** Format a frame count as mm:ss.s for notes / cue sheets. */
export const fmtTime = (frame: number, fps = FPS) => {
  const s = frame / fps;
  const m = Math.floor(s / 60);
  const r = s - m * 60;
  return `${String(m).padStart(2, '0')}:${r.toFixed(1).padStart(4, '0')}`;
};
