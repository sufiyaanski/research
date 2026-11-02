// What-if countdown format — episode config schema (zod) + the pure timeline maths.
// PURE (no React, no fs): imported by the composition (webpack) AND by the Node CLIs
// (make-shotlist.mjs, sfx/drone-bed.mjs) through Node's built-in type stripping.
//
// Units: every time in a config is in SECONDS of the reel (global). The composition converts to
// frames once (× fps). Act-relative values (sfx `at`) say so in their name.
import { z } from 'zod';

const Vec3 = z.tuple([z.number(), z.number(), z.number()]);

/** A camera pose: world position + the point it looks at. */
export const CamPoseSchema = z.object({ pos: Vec3, look: Vec3 });
export const CameraSchema = z.object({
  from: CamPoseSchema,
  /** eased Easing.inOut(cubic) across the act; omitted = static */
  to: CamPoseSchema.optional(),
  /** vertical fov in degrees (default 36) */
  fov: z.number().default(36),
  /** impact shake at the act start: amplitude in metres, ≤ 7 frames */
  shake: z.number().optional(),
});

export const LOOKS = ['normal', 'xray', 'hands', 'glow', 'whiteout', 'space', 'pointcloud', 'blank', 'endcard'] as const;
export const LookSchema = z.enum(LOOKS);

export const SfxCueSchema = z.object({
  /** id in public/sfx/catalog.json */
  id: z.string(),
  /** seconds RELATIVE TO THE ACT START where the sound's PEAK lands */
  at: z.number(),
  /** dB (catalog files peak at −3 dBFS) */
  gain: z.number().optional(),
});

export const ActSchema = z.object({
  id: z.string(),
  start: z.number().nonnegative(),
  end: z.number().positive(),
  look: LookSchema,
  /** one line for the shot list / critique sheet: what happens, verb first */
  action: z.string().default(''),
  camera: CameraSchema.optional(),
  /** the ground-fixed world (ground, trees, skyline) translates by `flow` m/s (look-dependent use) */
  flow: Vec3.optional(),
  /** glow amount at the act's start/end (0..1): halo lines + additive points (glow look; also xray/pointcloud) */
  glow: z.tuple([z.number(), z.number()]).optional(),
  /** direction of the streaks (glow: wind; pointcloud: rebuild) — unit-ish vector */
  streakDir: Vec3.optional(),
  /** glow look: windows burst into sparkles in a wave crossing x over [start, end] seconds (act-relative) */
  burst: z.tuple([z.number(), z.number()]).optional(),
  /** space look: the moon crosses in front of the planet over [start, end] seconds (act-relative) */
  moon: z.tuple([z.number(), z.number()]).optional(),
  /** people on the blanket: pose / mood for this act */
  people: z.object({ mood: z.enum(['neutral', 'worried', 'shocked', 'happy']).default('neutral'), pose: z.enum(['sit', 'shocked']).default('sit') }).optional(),
  sfx: z.array(SfxCueSchema).default([]),
});

export const CounterSchema = z.object({
  /** value at the sub-label's `from` and `to` (linear in time between them) */
  from: z.number(),
  to: z.number(),
  /** 'thousands' = 373,646 · 'fixed1' = 12.3 */
  format: z.enum(['thousands', 'fixed1']).default('thousands'),
  prefix: z.string().default(''),
  suffix: z.string().default(''),
});

export const SubLabelSchema = z
  .object({ from: z.number(), to: z.number(), text: z.string().optional(), counter: CounterSchema.optional() })
  .refine((s) => !!s.text !== !!s.counter, { message: 'a sub-label has exactly one of `text` or `counter`' });

export const LineSchema = z.object({ text: z.string().min(1), start: z.number(), end: z.number() });

/** Title text: `\n` in any part breaks the line; `keyword` is drawn in `keywordColor`. */
export const TitleSchema = z.object({ pre: z.string(), keyword: z.string(), post: z.string() });

export const WhatIfConfigSchema = z.object({
  id: z.string(),
  /** total length in seconds (the reel's durationInFrames = round(durationSec × fps)) */
  durationSec: z.number().positive(),
  fps: z.number().int().positive().default(30),
  title: TitleSchema,
  /** seconds: the opening title fades out here (8 frames, Easing.in(cubic)) */
  titleOut: z.number().positive(),
  keywordColor: z.string().default('#8EC5FF'),
  /** small subject icon above the opening title (components/Icon.tsx) */
  icon: z.enum(['globe-spin', 'atom', 'apple', 'sun', 'moon', 'bolt', 'drop']),
  phaseA: z.object({
    label: z.string(),
    /** the real-time countdown: realSeconds → 0 at t = realSeconds (= the switch) */
    realSeconds: z.number().positive(),
    subLabel: z.string(),
  }),
  phaseB: z.object({
    label: z.string(),
    /** the slowed countdown: virtualSeconds → 0 across virtualSeconds × slowFactor real seconds */
    virtualSeconds: z.number().positive(),
    slowFactor: z.number().positive(),
    subLabels: z.array(SubLabelSchema).min(1),
  }),
  phaseC: z.object({
    /** small label above the big word (e.g. "EARTH IS") */
    label: z.string(),
    /** replaces the timer (e.g. "SPINNING") */
    bigText: z.string(),
    subLabels: z.array(SubLabelSchema).min(1),
  }),
  lines: z.array(LineSchema).min(1),
  acts: z.array(ActSchema).min(3),
  endCard: z.object({
    /** default: the opening title */
    title: TitleSchema.optional(),
    factLines: z.array(z.string()).min(1).max(3),
    /** seconds after the end card starts that the fact lines fade in */
    factDelay: z.number().default(1),
    background: z.string().default('#121214'),
  }),
  world: z
    .object({
      seed: z.number().int().default(7),
      /** label for the place (only used by the shot list / docs) */
      place: z.string().default(''),
    })
    .default({ seed: 7, place: '' }),
  audio: z.object({
    /** relative to public/ — generate: node sfx/drone-bed.mjs --config <this file> */
    bed: z.string(),
    /** linear gain on the bed file */
    bedVolume: z.number().default(1),
    /** master dB offset on every sfx cue (catalog peaks at −3 dBFS: keep ≤ −4) */
    sfxMasterDb: z.number().default(-6),
  }),
});

export type WhatIfConfigInput = z.input<typeof WhatIfConfigSchema>;
export type WhatIfConfig = z.output<typeof WhatIfConfigSchema>;
export type Act = z.output<typeof ActSchema>;
export type Look = z.output<typeof LookSchema>;
export type SubLabel = z.output<typeof SubLabelSchema>;
export type Line = z.output<typeof LineSchema>;
export type CamPose = z.output<typeof CamPoseSchema>;
export type Title = z.output<typeof TitleSchema>;

// =============================================================================
// Timeline maths — every value is a pure function of t (seconds)
// =============================================================================

export const switchTime = (c: WhatIfConfig) => c.phaseA.realSeconds;
export const returnTime = (c: WhatIfConfig) => c.phaseA.realSeconds + c.phaseB.virtualSeconds * c.phaseB.slowFactor;
export const endCardTime = (c: WhatIfConfig) => {
  const a = c.acts.find((x) => x.look === 'endcard');
  return a ? a.start : c.durationSec;
};

export type Phase = 'A' | 'B' | 'C' | 'end';
export const phaseAt = (c: WhatIfConfig, t: number): Phase =>
  t >= endCardTime(c) ? 'end' : t < switchTime(c) ? 'A' : t < returnTime(c) ? 'B' : 'C';

/** Seconds shown on the timer at reel time t (A: real time; B: slowed; C/end: 0). */
export function timerSeconds(c: WhatIfConfig, t: number): number {
  const ts = switchTime(c);
  if (t < ts) return Math.max(0, c.phaseA.realSeconds - t);
  const v = c.phaseB.virtualSeconds - (t - ts) / c.phaseB.slowFactor;
  return Math.min(c.phaseB.virtualSeconds, Math.max(0, v));
}

/** m:ss.mmm (milliseconds rounded once, so float noise never shows) */
export function formatTimer(sec: number): string {
  const ms = Math.max(0, Math.round(sec * 1000));
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const r = ms % 1000;
  return `${m}:${String(s).padStart(2, '0')}.${String(r).padStart(3, '0')}`;
}

export const formatCounter = (v: number, f: 'thousands' | 'fixed1') =>
  f === 'fixed1' ? v.toFixed(1) : Math.round(v).toLocaleString('en-US');

/** text of a sub-label at time t (counters interpolate linearly from→to over [from, to]) */
export function subLabelText(s: SubLabel, t: number): string {
  if (s.text !== undefined) return s.text;
  const k = Math.min(1, Math.max(0, (t - s.from) / Math.max(1e-6, s.to - s.from)));
  const c = s.counter!;
  return `${c.prefix}${formatCounter(c.from + (c.to - c.from) * k, c.format)}${c.suffix}`;
}

export const actAt = (c: WhatIfConfig, t: number) => c.acts.find((a) => t >= a.start && t < a.end) ?? c.acts[c.acts.length - 1];
export const lineAt = (c: WhatIfConfig, t: number) => c.lines.find((l) => t >= l.start && t < l.end) ?? null;

/** Every sfx cue as a GLOBAL peak time in seconds. */
export const allCues = (c: WhatIfConfig) =>
  c.acts.flatMap((a) => a.sfx.map((s) => ({ act: a.id, id: s.id, t: a.start + s.at, gain: s.gain ?? 0 })));

/**
 * Validate an episode: hard errors (thrown) for broken timelines; warnings for format-rule drift.
 * The format rules (README): lines held 2.5–3.75 s with ≥ 0.8 s gaps, acts contiguous over
 * [0, durationSec], the slowed countdown ending exactly on an act boundary, an end card act.
 */
export function parseWhatIfConfig(raw: unknown): { config: WhatIfConfig; warnings: string[] } {
  const config = WhatIfConfigSchema.parse(raw);
  const errors: string[] = [];
  const warnings: string[] = [];
  const eps = 1e-6;
  config.acts.forEach((a, i) => {
    if (a.end <= a.start) errors.push(`act "${a.id}": end ≤ start`);
    if (i === 0 && Math.abs(a.start) > eps) errors.push(`first act starts at ${a.start}, not 0`);
    if (i > 0 && Math.abs(a.start - config.acts[i - 1].end) > eps) errors.push(`act "${a.id}" starts at ${a.start} but "${config.acts[i - 1].id}" ends at ${config.acts[i - 1].end}`);
    for (const s of a.sfx) if (a.start + s.at < 0 || a.start + s.at > config.durationSec) errors.push(`act "${a.id}": sfx "${s.id}" lands outside the reel`);
  });
  const last = config.acts[config.acts.length - 1];
  if (Math.abs(last.end - config.durationSec) > eps) errors.push(`last act ends at ${last.end}, durationSec is ${config.durationSec}`);
  if (!config.acts.some((a) => a.look === 'endcard')) errors.push('no act with look "endcard"');
  const tr = returnTime(config);
  if (!config.acts.some((a) => Math.abs(a.start - tr) < 1e-3)) warnings.push(`the slowed countdown ends at ${tr.toFixed(3)} s, which is not an act boundary`);
  if (!config.acts.some((a) => Math.abs(a.start - switchTime(config)) < 1e-3)) warnings.push(`the switch (${switchTime(config)} s) is not an act boundary`);
  if (tr > endCardTime(config)) errors.push(`the slowed countdown ends (${tr} s) after the end card starts`);
  config.lines.forEach((l, i) => {
    const hold = l.end - l.start;
    if (hold <= 0) errors.push(`line ${i + 1}: end ≤ start`);
    if (hold < 2.5 - eps || hold > 3.75 + eps) warnings.push(`line ${i + 1} held ${hold.toFixed(2)} s (format: 2.5–3.75 s): "${l.text}"`);
    if (i > 0) {
      const gap = l.start - config.lines[i - 1].end;
      if (gap < 0) errors.push(`line ${i + 1} overlaps line ${i}`);
      else if (gap < 0.8 - eps) warnings.push(`gap before line ${i + 1} is ${gap.toFixed(2)} s (format: ≥ 0.8 s)`);
    }
    if (l.end > endCardTime(config) + eps) warnings.push(`line ${i + 1} runs into the end card`);
  });
  for (const [name, list] of [['phaseB', config.phaseB.subLabels], ['phaseC', config.phaseC.subLabels]] as const)
    list.forEach((s, i) => {
      if (s.to <= s.from) errors.push(`${name}.subLabels[${i}]: to ≤ from`);
      if (i > 0 && s.from < list[i - 1].to - eps) errors.push(`${name}.subLabels[${i}] overlaps the previous one`);
    });
  if (errors.length) throw new Error(`what-if config "${config.id}" invalid:\n  - ${errors.join('\n  - ')}`);
  return { config, warnings };
}
