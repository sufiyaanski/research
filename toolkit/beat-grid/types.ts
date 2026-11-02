// Beat-grid + shot-list types and validation. PURE (no fs, no React): imported by compositions
// (webpack) AND by the Node CLIs (Node >= 22.18 strips types natively: `import ... from './types.ts'`).
//
// Units: EVERYTHING is in frames of the composition (30 fps by default). Seconds exist only in
// the VO word-timing input files, and make-beats.mjs converts them once.
import { z } from 'zod';

// =============================================================================
// beats.json (output of make-beats.mjs)
// =============================================================================

/** A word with frame times (global composition frames). `end` is exclusive-ish (last spoken frame + 1). */
export interface TimedWord {
  w: string;
  start: number;
  end: number;
}

export interface Phrase {
  start: number;
  end: number;
  text?: string;
}

export interface CaptionChunk {
  /** 3–5 words, wraps to ≤ 2 lines at `maxCharsPerLine`. */
  text: string;
  /** first word start − lead (0–2 frames, default 1) */
  start: number;
  /** ≥ start + minOnScreen (0.6 s), extended into the following gap, never past the next chunk's start */
  end: number;
  /** frames (global) where a money/key word is spoken — feed to usePop() */
  pops: number[];
  /** index range into BeatsFile.words: [wordStart, wordEnd) */
  wordStart: number;
  wordEnd: number;
}

export interface BeatsFile {
  fps: number;
  source: 'bpm' | 'vo';
  bpm?: number;
  /** fps * 60 / bpm (float, NOT rounded) */
  framesPerBeat?: number;
  offset?: number;
  subdivide?: number;
  beatsPerBar?: number;
  durationInFrames?: number;
  /** BPM: every (sub)beat frame, each computed from its index and rounded once. VO: word onsets. */
  beats: number[];
  /** BPM: bar starts. VO: phrase starts. */
  downbeats?: number[];
  words?: TimedWord[];
  phrases?: Phrase[];
  chunks?: CaptionChunk[];
  /** every pop frame (union of chunks[].pops) */
  pops?: number[];
  popRegex?: string;
  warnings?: string[];
}

// =============================================================================
// Shot list ("shot list as states")
// =============================================================================

export const SfxRefSchema = z.object({
  /** id in public/sfx/catalog.json (whoosh, pop, click, thump, riser, impact, cash-register, tick) */
  id: z.string().min(1),
  /** frame offset RELATIVE TO THE SHOT START where the sound's PEAK lands (0 = on the cut; may be negative) */
  at: z.number().int(),
  /** dB, default 0 (catalog sounds are normalised to −3 dBFS peak) */
  gain: z.number().optional(),
});

export const ShotSchema = z.object({
  id: z.string().min(1),
  /** global frame, inclusive */
  start: z.number().int().nonnegative(),
  /** global frame, exclusive (= next shot's start) */
  end: z.number().int().positive(),
  /** beat index (into beats[]) the shot starts on; filled in by `make-beats --from-shotlist` */
  beat: z.number().int().nonnegative().optional(),
  /** what happens (verb first): "Price tag slams down, character recoils" */
  action: z.string().default(''),
  /** on-screen caption, 3–5 words (warned, not enforced) */
  caption: z.string().default(''),
  sfx: z.array(SfxRefSchema).default([]),
  /** the on-screen STATE at the shot's last frame (what a still of the end frame must show) */
  state: z.string().optional(),
});

export const ShotListSchema = z.object({
  id: z.string().min(1),
  fps: z.number().int().positive().default(30),
  width: z.number().int().positive().default(1080),
  height: z.number().int().positive().default(1920),
  durationInFrames: z.number().int().positive(),
  bpm: z.number().positive().optional(),
  /** path to a beats.json, relative to the shot-list file */
  beatsFile: z.string().optional(),
  shots: z.array(ShotSchema).min(1),
});

export type SfxRef = z.infer<typeof SfxRefSchema>;
export type Shot = z.infer<typeof ShotSchema>;
export type ShotList = z.infer<typeof ShotListSchema>;
export type ShotListInput = z.input<typeof ShotListSchema>;

export interface ParseOptions {
  /** known sfx ids (from public/sfx/catalog.json) — unknown ids are warned */
  sfxIds?: string[];
  /** throw on errors (default true). With false, errors are returned. */
  strict?: boolean;
}

export interface ParseResult {
  shotList: ShotList;
  warnings: string[];
  errors: string[];
}

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean);

/**
 * Validate a raw (YAML/JSON-parsed) shot list. Errors (throw unless strict:false): schema, end ≤ start,
 * gaps/overlaps between consecutive shots, shot outside [0, durationInFrames], duplicate ids.
 * Warnings: caption not 3–5 words, unknown sfx id, cue outside its shot, timeline not covering
 * [0, duration], non-30fps / non-1080x1920 format.
 */
export function parseShotList(raw: unknown, opts: ParseOptions = {}): ParseResult {
  const strict = opts.strict ?? true;
  const parsed = ShotListSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ');
    throw new Error(`shot list schema: ${msg}`);
  }
  const sl = parsed.data;
  const errors: string[] = [];
  const warnings: string[] = [];
  const seen = new Set<string>();

  if (sl.fps !== 30) warnings.push(`fps is ${sl.fps}; the pipeline standard is 30`);
  if (sl.width !== 1080 || sl.height !== 1920) warnings.push(`format ${sl.width}x${sl.height}; the pipeline standard is 1080x1920`);

  sl.shots.forEach((s, i) => {
    const tag = `shot "${s.id}"`;
    if (seen.has(s.id)) errors.push(`${tag}: duplicate id`);
    seen.add(s.id);
    if (s.end <= s.start) errors.push(`${tag}: end (${s.end}) must be > start (${s.start})`);
    if (s.end > sl.durationInFrames) errors.push(`${tag}: end ${s.end} is past durationInFrames ${sl.durationInFrames}`);
    if (i > 0) {
      const prev = sl.shots[i - 1];
      if (s.start > prev.end) errors.push(`${tag}: gap of ${s.start - prev.end} frames after "${prev.id}" (shots must be contiguous)`);
      if (s.start < prev.end) errors.push(`${tag}: overlaps "${prev.id}" by ${prev.end - s.start} frames`);
    }
    const n = words(s.caption).length;
    if (n > 0 && (n < 3 || n > 5)) warnings.push(`${tag}: caption has ${n} words (aim for 3–5): "${s.caption}"`);
    if (n === 0) warnings.push(`${tag}: no caption`);
    for (const c of s.sfx) {
      if (opts.sfxIds && !opts.sfxIds.includes(c.id)) warnings.push(`${tag}: sfx "${c.id}" is not in the sfx library (${opts.sfxIds.join(', ')})`);
      const abs = s.start + c.at;
      if (abs < 0 || abs >= sl.durationInFrames) warnings.push(`${tag}: sfx "${c.id}" at ${c.at} lands at global frame ${abs}, outside the video`);
      else if (c.at < -15 || c.at > s.end - s.start) warnings.push(`${tag}: sfx "${c.id}" at=${c.at} is outside the shot (at is RELATIVE to shot start — did you use a global frame?)`);
    }
  });
  if (sl.shots[0].start !== 0) warnings.push(`first shot starts at ${sl.shots[0].start}, not 0`);
  const last = sl.shots[sl.shots.length - 1];
  if (last.end !== sl.durationInFrames) warnings.push(`last shot ends at ${last.end}, durationInFrames is ${sl.durationInFrames}`);

  if (strict && errors.length) throw new Error(`shot list "${sl.id}" invalid:\n  - ${errors.join('\n  - ')}`);
  return { shotList: sl, warnings, errors };
}

/** Global frame of every sfx cue in a shot list (peak frame). */
export const shotListCues = (sl: ShotList) =>
  sl.shots.flatMap((s) => s.sfx.map((c) => ({ shot: s.id, id: c.id, at: s.start + c.at, gain: c.gain ?? 0 })));
