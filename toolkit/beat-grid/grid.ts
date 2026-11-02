// Pure beat-grid math shared by make-beats.mjs (Node, native type stripping) and the React hooks.
// No fs, no React. Value imports from sibling .ts files must carry the `.ts` extension (Node).
import type { BeatsFile, CaptionChunk, Phrase, Shot, ShotList, TimedWord } from './types';

export const DEFAULT_POP_REGEX = String.raw`\$|%|price|cost|free|cheap|expensive|save|sale|\d`;

/** fps * 60 / bpm — a float. Never round this and accumulate it. */
export const framesPerBeat = (fps: number, bpm: number) => (fps * 60) / bpm;

/** Frame of (sub)beat `i`: computed from the index and rounded ONCE (no accumulated rounding drift). */
export const beatFrame = (i: number, fps: number, bpm: number, offset = 0, subdivide = 1) =>
  Math.round(offset + (i * framesPerBeat(fps, bpm)) / subdivide);

export interface BpmGridOptions {
  bpm: number;
  fps?: number;
  durationInFrames: number;
  /** frame of beat 0 (default 0) */
  offset?: number;
  /** 2 = 8th notes, 4 = 16ths (beats[] then holds every subdivision) */
  subdivide?: number;
  beatsPerBar?: number;
}

export function bpmGrid({ bpm, fps = 30, durationInFrames, offset = 0, subdivide = 1, beatsPerBar = 4 }: BpmGridOptions): BeatsFile {
  if (!(bpm > 0)) throw new Error('bpm must be > 0');
  const beats: number[] = [];
  const downbeats: number[] = [];
  for (let i = 0; ; i++) {
    const f = beatFrame(i, fps, bpm, offset, subdivide);
    if (f >= durationInFrames) break;
    beats.push(f);
    if (i % (beatsPerBar * subdivide) === 0) downbeats.push(f);
  }
  return {
    fps,
    source: 'bpm',
    bpm,
    framesPerBeat: framesPerBeat(fps, bpm),
    offset,
    subdivide,
    beatsPerBar,
    durationInFrames,
    beats,
    downbeats,
  };
}

// -----------------------------------------------------------------------------
// VO word timings
// -----------------------------------------------------------------------------

export interface SecondsWord {
  w: string;
  start: number;
  end: number;
}

/**
 * Accepts: setup/tools/gen_voice.py beats.json (`{ vo: [{ words: [{w,start,end}] }] }`, seconds,
 * global timeline), a plain `[{w,start,end}]` list, or `{ words: [...] }`. Returns seconds, sorted.
 */
export function normalizeWordsInput(json: unknown): SecondsWord[] {
  let list: unknown[] = [];
  if (Array.isArray(json)) list = json;
  else if (json && typeof json === 'object') {
    const o = json as Record<string, unknown>;
    if (Array.isArray(o.vo)) list = (o.vo as { words?: unknown[] }[]).flatMap((l) => l.words ?? []);
    else if (Array.isArray(o.words)) list = o.words;
  }
  const out = list
    .map((x) => x as Partial<SecondsWord> & { word?: string; text?: string })
    .map((x) => ({ w: String(x.w ?? x.word ?? x.text ?? ''), start: Number(x.start), end: Number(x.end) }))
    .filter((x) => x.w && Number.isFinite(x.start) && Number.isFinite(x.end));
  if (!out.length) throw new Error('no words found (expected vo[].words[{w,start,end}] or [{w,start,end}] in seconds)');
  return out.sort((a, b) => a.start - b.start);
}

export interface VoGridOptions {
  fps?: number;
  /** frames a caption chunk appears BEFORE its first word (0–2, default 1) */
  lead?: number;
  /** minimum on-screen time of a chunk in seconds (default 0.6) */
  minOnScreenSec?: number;
  /** silence (s) that ends a phrase (default 0.25) */
  pauseSec?: number;
  minWords?: number;
  maxWords?: number;
  /** characters per caption line at your caption size (default 16 ≈ 84 px bold on 1080 wide) */
  maxCharsPerLine?: number;
  maxLines?: number;
  popRegex?: string;
  durationInFrames?: number;
}

const PUNCT_END = /[.!?;:,—–…]["')\]]*$/;
const SENTENCE_END = /[.!?…]["')\]]*$/;

/** Greedy word-wrap line count. */
export const lineCount = (ws: string[], maxChars: number) => {
  let lines = 1;
  let len = 0;
  for (const w of ws) {
    if (len === 0) len = w.length;
    else if (len + 1 + w.length <= maxChars) len += 1 + w.length;
    else {
      lines++;
      len = w.length;
    }
  }
  return lines;
};

export function voGrid(input: SecondsWord[], opts: VoGridOptions = {}): BeatsFile {
  const {
    fps = 30,
    lead = 1,
    minOnScreenSec = 0.6,
    pauseSec = 0.25,
    minWords = 3,
    maxWords = 5,
    maxCharsPerLine = 16,
    maxLines = 2,
    popRegex = DEFAULT_POP_REGEX,
  } = opts;
  const pop = new RegExp(popRegex, 'i');
  const warnings: string[] = [];
  const f = (s: number) => Math.round(s * fps);
  const words: TimedWord[] = input.map((x) => ({ w: x.w, start: f(x.start), end: Math.max(f(x.start) + 1, f(x.end)) }));
  const durationInFrames = opts.durationInFrames ?? (words.length ? words[words.length - 1].end + Math.round(0.5 * fps) : 0);

  // phrase boundary AFTER word i: pause ≥ pauseSec, or punctuation, or last word
  const gapAfter = (i: number) => (i + 1 < input.length ? input[i + 1].start - input[i].end : Infinity);
  const phraseEndAt = (i: number) => i === input.length - 1 || gapAfter(i) >= pauseSec || PUNCT_END.test(input[i].w);
  const hardEndAt = (i: number) => i === input.length - 1 || gapAfter(i) >= Math.max(0.5, pauseSec * 2) || SENTENCE_END.test(input[i].w);

  const phrases: Phrase[] = [];
  let ps = 0;
  for (let i = 0; i < words.length; i++) {
    if (phraseEndAt(i)) {
      phrases.push({ start: words[ps].start, end: words[i].end, text: words.slice(ps, i + 1).map((x) => x.w).join(' ') });
      ps = i + 1;
    }
  }

  // caption chunks: close at maxWords, at a phrase end once ≥ minWords, at a hard (sentence/long
  // pause) end regardless, or when the next word would wrap past maxLines.
  const groups: [number, number][] = [];
  let cs = 0;
  for (let i = 0; i < words.length; i++) {
    const n = i - cs + 1;
    const next = words[i + 1];
    const wouldOverflow = next ? lineCount(words.slice(cs, i + 2).map((x) => x.w), maxCharsPerLine) > maxLines : false;
    if (n >= maxWords || hardEndAt(i) || (phraseEndAt(i) && n >= minWords) || wouldOverflow) {
      groups.push([cs, i + 1]);
      cs = i + 1;
    }
  }
  const chunks: CaptionChunk[] = groups.map(([a, b]) => {
    const ws = words.slice(a, b);
    const text = ws.map((x) => x.w).join(' ');
    if (ws.length < minWords) warnings.push(`chunk "${text}" has ${ws.length} word(s) (< ${minWords}) — short phrase in the VO`);
    if (lineCount(ws.map((x) => x.w), maxCharsPerLine) > maxLines) warnings.push(`chunk "${text}" needs > ${maxLines} lines at ${maxCharsPerLine} chars/line`);
    return {
      text,
      start: Math.max(0, ws[0].start - lead),
      end: ws[ws.length - 1].end,
      pops: ws.filter((x) => pop.test(x.w)).map((x) => x.start),
      wordStart: a,
      wordEnd: b,
    };
  });
  const minFrames = Math.round(minOnScreenSec * fps);
  chunks.forEach((c, i) => {
    const cap = i + 1 < chunks.length ? chunks[i + 1].start : durationInFrames;
    c.end = Math.min(Math.max(c.end, c.start + minFrames), cap);
    if (c.end - c.start < minFrames) warnings.push(`chunk "${c.text}" is on screen ${c.end - c.start} frames (< ${minFrames}) — the next chunk starts too soon`);
  });

  const beats = [...new Set(words.map((x) => x.start))];
  return {
    fps,
    source: 'vo',
    durationInFrames,
    beats,
    downbeats: phrases.map((p) => p.start),
    words,
    phrases,
    chunks,
    pops: chunks.flatMap((c) => c.pops),
    popRegex,
    warnings,
  };
}

// -----------------------------------------------------------------------------
// Lookups (used by the hooks; cheap binary search)
// -----------------------------------------------------------------------------

/** Index of the last beat ≤ frame, or −1 before the first beat. */
export function beatIndexAt(beats: number[], frame: number) {
  let lo = 0;
  let hi = beats.length - 1;
  let ans = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (beats[mid] <= frame) {
      ans = mid;
      lo = mid + 1;
    } else hi = mid - 1;
  }
  return ans;
}

/** Index of the beat nearest to `frame` (ties → earlier). */
export function nearestBeatIndex(beats: number[], frame: number) {
  const i = beatIndexAt(beats, frame);
  if (i < 0) return 0;
  if (i + 1 < beats.length && beats[i + 1] - frame < frame - beats[i]) return i + 1;
  return i;
}

// -----------------------------------------------------------------------------
// Shot list ↔ beats
// -----------------------------------------------------------------------------

export interface SnapRow {
  id: string;
  from: number;
  to: number;
  drift: number;
  beat: number;
  /** true when snapping would have collapsed/reordered shots, so the original start was kept */
  unsnapped?: boolean;
}

/**
 * Snap every shot start (except the first, pinned to its own start) to the nearest beat; the previous
 * shot's end follows so shots stay contiguous. Returns the new shot list + a drift report. A shot that
 * would collapse to ≤ 0 frames is left unsnapped (`unsnapped: true`).
 */
export function snapShotsToBeats(sl: ShotList, beats: number[]): { shotList: ShotList; rows: SnapRow[] } {
  const shots: Shot[] = sl.shots.map((s) => ({ ...s, sfx: s.sfx.map((c) => ({ ...c })) }));
  const rows: SnapRow[] = [];
  shots.forEach((s, i) => {
    const bi = nearestBeatIndex(beats, s.start);
    let to = i === 0 ? s.start : beats[bi] ?? s.start;
    let unsnapped = false;
    if (i > 0 && (to <= shots[i - 1].start || to >= s.end)) {
      to = s.start;
      unsnapped = true;
    }
    rows.push({ id: s.id, from: s.start, to, drift: to - s.start, beat: beatIndexAt(beats, to), ...(unsnapped ? { unsnapped } : {}) });
    if (i > 0) shots[i - 1].end = to;
    s.start = to;
    const exact = beats.indexOf(to);
    if (exact >= 0) s.beat = exact;
  });
  return { shotList: { ...sl, shots }, rows };
}
