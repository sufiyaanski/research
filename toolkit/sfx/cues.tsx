// Sound on the same timeline as the picture.
//
//   <SfxCue id="cash-register" at={62} gain={-2} />     // the clip's PEAK lands on global frame 62
//   <SfxTrack shotList={shotList} />                     // every shot's sfx[] (at = relative to shot start)
//   <MusicBed bpm={120} volume={0.9} duckFrames={vo.words} />
//
// Uses <Audio> from @remotion/media + staticFile() (Remotion 4.0.540 skill rules). Put these at
// composition level (not inside a <Sequence from>), because `at` is a GLOBAL frame.
import React from 'react';
import { Audio } from '@remotion/media';
import { Sequence, staticFile, useVideoConfig } from 'remotion';
import catalog from '../public/sfx/catalog.json';
import type { ShotList } from '../beat-grid/types';

export type SfxId = 'whoosh' | 'pop' | 'click' | 'thump' | 'riser' | 'impact' | 'cash-register' | 'tick' | 'power-down' | 'twinkle' | 'noise-wall' | 'glitch';

export interface SfxSound {
  id: string;
  /** relative to public/ */
  file: string;
  durationSec: number;
  /** centre of the loudest 10 ms */
  peakSec: number;
  category: string;
  use: string;
  license: string;
}

export const SFX_CATALOG: SfxSound[] = catalog.sounds;
export const SFX_IDS = SFX_CATALOG.map((s) => s.id);

export const sfxSound = (id: string): SfxSound => {
  const s = SFX_CATALOG.find((x) => x.id === id);
  if (!s) throw new Error(`unknown sfx "${id}" (have: ${SFX_IDS.join(', ')}) — run node sfx/synth.mjs`);
  return s;
};

/** Frames from the file start to its peak (what <SfxCue> pre-rolls). */
export const sfxPeakFrames = (id: string, fps: number) => Math.round(sfxSound(id).peakSec * fps);

export const dbToGain = (db: number) => Math.pow(10, db / 20);

export interface SfxCueProps {
  id: SfxId | (string & {});
  /** GLOBAL frame where the sound's peak should land */
  at: number;
  /** dB (default 0; clamped to ≤ +3 — catalog files peak at −3 dBFS) */
  gain?: number;
}

/**
 * Places one sound so its PEAK lands on `at`: <Sequence from={at − peakFrames}>. If that would start
 * before frame 0, the head of the file is trimmed instead (trimBefore) so the peak still lands on `at`.
 */
export const SfxCue: React.FC<SfxCueProps> = ({ id, at, gain = 0 }) => {
  const { fps } = useVideoConfig();
  const s = sfxSound(id);
  const from = at - Math.round(s.peakSec * fps);
  const trim = from < 0 ? -from : 0;
  const len = Math.ceil(s.durationSec * fps) + 1 - trim;
  if (len <= 0) return null;
  return (
    <Sequence from={Math.max(0, from)} durationInFrames={len} layout="none" name={`sfx ${id} @${at}`}>
      <Audio src={staticFile(s.file)} volume={dbToGain(Math.min(3, gain))} trimBefore={trim > 0 ? trim : undefined} />
    </Sequence>
  );
};

export interface CueSpec {
  id: string;
  /** GLOBAL frame */
  at: number;
  gain?: number;
}

/** Global cue list of a shot list (shot.start + sfx.at). */
export const cuesFromShotList = (sl: ShotList, masterDb = 0): CueSpec[] =>
  sl.shots.flatMap((s) => s.sfx.map((c) => ({ id: c.id, at: s.start + c.at, gain: (c.gain ?? 0) + masterDb })));

/** Every sfx cue of every shot (and/or an extra global `cues` list). `gain` = master offset in dB. */
export const SfxTrack: React.FC<{ shotList?: ShotList; cues?: CueSpec[]; gain?: number }> = ({ shotList, cues = [], gain = 0 }) => {
  const all = [...(shotList ? cuesFromShotList(shotList, gain) : []), ...cues.map((c) => ({ ...c, gain: (c.gain ?? 0) + gain }))];
  return (
    <>
      {all.map((c, i) => (
        <SfxCue key={`${c.id}-${c.at}-${i}`} id={c.id} at={c.at} gain={c.gain} />
      ))}
    </>
  );
};

// -----------------------------------------------------------------------------
// Music bed with ducking
// -----------------------------------------------------------------------------

export type DuckRange = [number, number] | { start: number; end: number };

export interface MusicBedProps {
  /** used for the default src `music/bed-<bpm>.wav` (generate: node sfx/music-bed.mjs --bpm N --duration S) */
  bpm?: number;
  /** path relative to public/ (wins over bpm) */
  src?: string;
  /** linear 0..1 (Remotion convention). The bed file itself is at −18 LUFS. */
  volume?: number;
  /** frame ranges to duck under — pass VO words ({start,end} in frames) or [start,end] pairs */
  duckFrames?: DuckRange[];
  /** dB of reduction while ducked (default −8) */
  duckDb?: number;
  /** frames to ramp down before a range / back up after it (defaults 4 / 10) */
  attack?: number;
  release?: number;
  /** ranges closer than this many frames are merged so the bed doesn't pump between words (default 8) */
  mergeGap?: number;
  /** fade in/out at composition start/end, frames (defaults 8 / 20) */
  fadeIn?: number;
  fadeOut?: number;
  loop?: boolean;
}

const toRange = (r: DuckRange): [number, number] => (Array.isArray(r) ? r : [r.start, r.end]);

export function mergeRanges(ranges: DuckRange[], gap: number): [number, number][] {
  const rs = ranges.map(toRange).sort((a, b) => a[0] - b[0]);
  const out: [number, number][] = [];
  for (const [a, b] of rs) {
    const last = out[out.length - 1];
    if (last && a - last[1] <= gap) last[1] = Math.max(last[1], b);
    else out.push([a, b]);
  }
  return out;
}

/** 0..1 duck amount at frame f for merged ranges with linear attack/release ramps. */
export function duckAmount(f: number, merged: [number, number][], attack: number, release: number) {
  let amt = 0;
  for (const [a, b] of merged) {
    if (f >= a && f < b) return 1;
    if (f < a && f >= a - attack) amt = Math.max(amt, 1 - (a - f) / Math.max(1, attack));
    if (f >= b && f < b + release) amt = Math.max(amt, 1 - (f - b) / Math.max(1, release));
  }
  return amt;
}

export const MusicBed: React.FC<MusicBedProps> = ({
  bpm = 120,
  src,
  volume = 1,
  duckFrames = [],
  duckDb = -8,
  attack = 4,
  release = 10,
  mergeGap = 8,
  fadeIn = 8,
  fadeOut = 20,
  loop = true,
}) => {
  const { durationInFrames } = useVideoConfig();
  const merged = mergeRanges(duckFrames, mergeGap);
  return (
    <Audio
      src={staticFile(src ?? `music/bed-${bpm}.wav`)}
      loop={loop}
      // 'extend' keeps the volume callback's frame counting across loops (default 'repeat' resets it)
      loopVolumeCurveBehavior="extend"
      volume={(f) => {
        const fade = Math.min(1, (f + 1) / Math.max(1, fadeIn), (durationInFrames - f) / Math.max(1, fadeOut));
        return Math.max(0, volume * fade * dbToGain(duckDb * duckAmount(f, merged, attack, release)));
      }}
    />
  );
};
