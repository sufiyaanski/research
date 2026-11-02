// React hooks for compositions. Everything is derived from useCurrentFrame() — no state, no effects,
// so every frame renders deterministically in any order (Remotion renders frames in parallel).
//
// FRAME SPACE: beats/chunks/shots are GLOBAL composition frames. useCurrentFrame() is LOCAL inside a
// <Sequence from={X}>. Call these hooks at composition level, or pass `{ sequenceFrom: X }` so the
// hook adds X back to the local frame.
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { beatIndexAt } from './grid';
import type { BeatsFile, CaptionChunk, Shot, ShotList, TimedWord } from './types';

export interface FrameOpts {
  /** the `from` of the enclosing <Sequence>, if the hook is called inside one */
  sequenceFrom?: number;
}

const useGlobalFrame = (o?: FrameOpts) => useCurrentFrame() + (o?.sequenceFrom ?? 0);
const beatsOf = (b: BeatsFile | number[]) => (Array.isArray(b) ? b : b.beats);

// -----------------------------------------------------------------------------
// useBeatGrid
// -----------------------------------------------------------------------------

export interface BeatGrid {
  frame: number;
  /** index of the last beat ≤ frame (−1 before the first beat) */
  beatIndex: number;
  /** 0..1 position inside the current beat interval */
  beatProgress: number;
  framesSinceBeat: number;
  framesToNextBeat: number;
  /** true for `window` frames starting at beat n: 0 ≤ frame − beats[n] < window. n omitted = any beat. */
  onBeat: (n?: number, window?: number) => boolean;
  /** 1 on the beat, eased (cubic out) to 0 over `frames` — for kicks, flashes, bumps */
  pulse: (frames?: number) => number;
}

export function useBeatGrid(beatsIn: BeatsFile | number[], opts?: FrameOpts): BeatGrid {
  const frame = useGlobalFrame(opts);
  const beats = beatsOf(beatsIn);
  const i = beatIndexAt(beats, frame);
  const cur = i >= 0 ? beats[i] : 0;
  // interval: to the next beat, or (after the last beat) the previous interval length
  const nextBeat = i + 1 < beats.length ? beats[i + 1] : i >= 1 ? cur + (beats[i] - beats[i - 1]) : beats[0] ?? frame + 1;
  const len = Math.max(1, nextBeat - cur);
  const since = i >= 0 ? frame - cur : 0;
  return {
    frame,
    beatIndex: i,
    beatProgress: i >= 0 ? Math.min(1, since / len) : 0,
    framesSinceBeat: since,
    framesToNextBeat: Math.max(0, nextBeat - frame),
    onBeat: (n?: number, window = 2) => {
      if (n === undefined) return i >= 0 && since < window;
      const b = beats[n];
      return b !== undefined && frame - b >= 0 && frame - b < window;
    },
    pulse: (frames = 8) =>
      i < 0 ? 0 : interpolate(since, [0, frames], [1, 0], { easing: Easing.out(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
  };
}

// -----------------------------------------------------------------------------
// useCaptionChunk
// -----------------------------------------------------------------------------

export interface ChunkWord extends TimedWord {
  /** 0 before the word starts, 0..1 while spoken, 1 after */
  progress: number;
  active: boolean;
  spoken: boolean;
  /** true if the word matches the pop regex (money/key word) */
  pop: boolean;
}

export interface CaptionState {
  chunk: CaptionChunk | null;
  index: number;
  /** frames since the chunk appeared (for entrances) */
  localFrame: number;
  /** 0..1 through the chunk's on-screen window */
  progress: number;
  words: ChunkWord[];
}

/** The chunk on screen now (start ≤ frame < end), with per-word progress. Needs a `source: 'vo'` beats file. */
export function useCaptionChunk(beats: BeatsFile, opts?: FrameOpts): CaptionState {
  const frame = useGlobalFrame(opts);
  const chunks = beats.chunks ?? [];
  const index = chunks.findIndex((c) => frame >= c.start && frame < c.end);
  if (index < 0) return { chunk: null, index: -1, localFrame: 0, progress: 0, words: [] };
  const chunk = chunks[index];
  const popSet = new Set(chunk.pops);
  const words = (beats.words ?? []).slice(chunk.wordStart, chunk.wordEnd).map((w) => {
    const progress = interpolate(frame, [w.start, Math.max(w.start + 1, w.end)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return { ...w, progress, active: frame >= w.start && frame < w.end, spoken: frame >= w.start, pop: popSet.has(w.start) };
  });
  return {
    chunk,
    index,
    localFrame: frame - chunk.start,
    progress: (frame - chunk.start) / Math.max(1, chunk.end - chunk.start),
    words,
  };
}

// -----------------------------------------------------------------------------
// usePop
// -----------------------------------------------------------------------------

export interface PopOptions extends FrameOpts {
  from?: number;
  peak?: number;
  /** total pop length, centred on the spoken frame (default 6 → 3 before, 3 after) */
  frames?: number;
}

/**
 * Scale for a "pop" on money/key words: from → peak → from over `frames` frames centred on each pop
 * frame, Easing.inOut(Easing.cubic) both ways. Returns `from` away from pops. Overlapping pops: max wins.
 */
export function usePop(popFrames: number[], { from = 1, peak = 1.12, frames = 6, sequenceFrom }: PopOptions = {}): number {
  const frame = useCurrentFrame() + (sequenceFrom ?? 0);
  const half = frames / 2;
  let amount = 0;
  for (const p of popFrames) {
    const d = Math.abs(frame - p);
    if (d >= half) continue;
    amount = Math.max(amount, Easing.inOut(Easing.cubic)(1 - d / half));
  }
  return from + (peak - from) * amount;
}

// -----------------------------------------------------------------------------
// useShot
// -----------------------------------------------------------------------------

export interface ShotState {
  shot: Shot;
  index: number;
  /** frame − shot.start */
  localFrame: number;
  /** 0..1 through the shot */
  progress: number;
  durationInFrames: number;
  prev: Shot | null;
  next: Shot | null;
}

/** The shot containing the current frame (clamped to the first/last shot outside the list). */
export function useShot(shotList: ShotList, opts?: FrameOpts): ShotState {
  const frame = useGlobalFrame(opts);
  const shots = shotList.shots;
  let index = shots.findIndex((s) => frame >= s.start && frame < s.end);
  if (index < 0) index = frame < shots[0].start ? 0 : shots.length - 1;
  const shot = shots[index];
  const durationInFrames = shot.end - shot.start;
  return {
    shot,
    index,
    localFrame: frame - shot.start,
    progress: Math.max(0, Math.min(1, (frame - shot.start) / Math.max(1, durationInFrames - 1))),
    durationInFrames,
    prev: shots[index - 1] ?? null,
    next: shots[index + 1] ?? null,
  };
}
