// NIGHT templates (3D sets, 1920x1080): `narrator` (the blocky person talking on a set, optional
// headline) and `whatif` (the Q-ROSITY "WHAT IF" title + premise + story clock over a set where the
// world changes on a spoken word). One <ThreeCanvas> per scene, mounted only while the scene plays.
import React from 'react';
import { Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { BlockyCharacter, takeLandFrames, type Mood, type MoodKey, type Pose, type PoseKey } from '../../examples/character/BlockyCharacter';
import { CameraRig, Stage3D, type CamState } from '../../examples/character/Stage3D';
import { BODY, DISPLAY, LF, RiseText, SAFE, cue, ease, lerp, ramp, talkAt, type CharacterCue } from '../kit';
import { GAUGE, NIGHT_THEME, ShoreSet, StreetSet } from '../sets';
import type { SceneWord, SetId } from '../types';
import type { TemplateProps } from './paper';

type P = Record<string, unknown>;
const str = (p: P, k: string, d = '') => (typeof p[k] === 'string' ? (p[k] as string) : d);

/** A value that is constant, or changes from → to starting on a spoken word (dur seconds, inOut). */
export type Anim = number | { from: number; to: number; on?: string; dur?: number };
const useAnim = (v: unknown, words: SceneWord[], d: number): number => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (typeof v === 'number') return v;
  if (!v || typeof v !== 'object') return d;
  const a = v as { from: number; to: number; on?: string; dur?: number };
  const at = cue(words, a.on, 0);
  return lerp(a.from, a.to, ramp(f, at, at + Math.max(1, Math.round((a.dur ?? 0.3) * fps)), ease.inOut));
};

type Cam = { from: CamState; to: CamState; center?: [number, number, number] };
/** camera presets; `cx` = the character's x (he sits in the right third). `gauge` frames the shore's tide post. */
const CAMS: Record<string, (cx: number) => Cam> = {
  push: (cx) => ({
    from: { dist: 10.5, height: 2.7, angle: -0.16, target: [cx - 2.2, 2.2, 2] },
    to: { dist: 8.4, height: 2.5, angle: -0.08, target: [cx - 1.9, 2.2, 2] },
  }),
  close: (cx) => ({
    from: { dist: 7.2, height: 2.6, angle: -0.1, target: [cx - 1.3, 2.5, 2] },
    to: { dist: 6.4, height: 2.6, angle: -0.06, target: [cx - 1.2, 2.55, 2] },
  }),
  wide: (cx) => ({
    from: { dist: 15, height: 3.4, angle: -0.22, target: [cx - 3.2, 2.6, 0] },
    to: { dist: 14, height: 3.3, angle: -0.12, target: [cx - 3.0, 2.6, 0] },
  }),
  low: (cx) => ({
    from: { dist: 11.5, height: 1.0, angle: -0.3, target: [cx - 2.4, 3.4, 2] },
    to: { dist: 10.8, height: 1.1, angle: -0.18, target: [cx - 2.4, 3.5, 2] },
  }),
  orbit: (cx) => ({
    from: { dist: 9.5, height: 2.6, angle: -0.42, target: [cx - 1.9, 2.2, 2] },
    to: { dist: 9.3, height: 2.6, angle: -0.08, target: [cx - 1.9, 2.2, 2] },
  }),
  gauge: () => ({
    center: [GAUGE[0], 0, GAUGE[2]],
    from: { dist: 7.4, height: 1.9, angle: -0.62, target: [GAUGE[0] - 0.9, 0.9, GAUGE[2]] },
    to: { dist: 6.6, height: 1.7, angle: -0.5, target: [GAUGE[0] - 0.8, 0.8, GAUGE[2]] },
  }),
};
const camOf = (name: string, cx: number) => (CAMS[name] ?? CAMS.push)(cx);

const SetFor: React.FC<{ set: SetId; moon: number; tide: number }> = ({ set, moon, tide }) =>
  set === 'street' ? <StreetSet moon={moon} /> : set === 'shore' ? <ShoreSet moon={moon} tide={tide} /> : null;

const useCharacterKeys = (words: SceneWord[], pose: Pose, mood: Mood, cues: CharacterCue[]) => {
  const { fps } = useVideoConfig();
  const poses: PoseKey[] = [{ at: 0, pose }];
  const moods: MoodKey[] = [{ at: 0, mood }];
  for (const c of cues) {
    const at = c.atFrame ?? cue(words, c.on, -1);
    if (at < 0) continue;
    if (c.pose) poses.push({ at, pose: c.pose });
    if (c.mood) moods.push({ at: Math.max(0, at - takeLandFrames(fps)), mood: c.mood });
  }
  return { poses, moods };
};

/** Headline over a 3D set: top-left, ≤ 2 lines, hard drop shadow (never a glow). */
const Headline: React.FC<{ text: string; at: number; exitAt?: number; size?: number; color?: string }> = ({ text, at, exitAt, size = 96, color = LF.text }) =>
  text ? (
    <div style={{ position: 'absolute', left: SAFE.x0, top: SAFE.y0 + 24, width: 1000 }}>
      <RiseText text={text} at={at} exitAt={exitAt} size={size} color={color} shadow lineHeight={1.04} />
    </div>
  ) : null;

// ------------------------------------------------------------------------------------------ narrator
export const NarratorScene: React.FC<TemplateProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const p = scene.props;
  const set = (str(p, 'set', 'street') as SetId) || 'street';
  const moon = useAnim(p.moon, scene.words, 1);
  const tide = useAnim(p.tide, scene.words, 0);
  const cx = typeof p.charX === 'number' ? (p.charX as number) : 1.6;
  // `shots`: hard cuts inside the scene on spoken words, each with its own camera (a new picture every few seconds)
  const shotSpec = Array.isArray(p.shots) ? (p.shots as { on?: string; camera: string }[]) : [{ camera: str(p, 'camera', 'push') }];
  const cuts = shotSpec.map((sh, i) => ({ camera: sh.camera, at: i === 0 ? 0 : cue(scene.words, sh.on, Math.round((scene.durationInFrames * i) / shotSpec.length)) }));
  const { poses, moods } = useCharacterKeys(scene.words, (p.pose as Pose) ?? 'idle', (p.mood as Mood) ?? 'neutral', (p.character as CharacterCue[]) ?? []);
  const lookUp = p.lookUp === true;
  return (
    <>
      <Stage3D theme={NIGHT_THEME} ground={false} shadows={false}>
        {cuts.map((c, i) => {
          const len = (cuts[i + 1]?.at ?? scene.durationInFrames) - c.at;
          const cam = camOf(c.camera, cx);
          return len > 0 ? (
            <Sequence key={i} layout="none" from={c.at} durationInFrames={len}>
              <CameraRig from={cam.from} to={cam.to} center={cam.center} dur={len} />
            </Sequence>
          ) : null;
        })}
        <SetFor set={set} moon={moon} tide={tide} />
        <BlockyCharacter
          pose={poses}
          mood={moods}
          talk={p.talking === false ? 0 : talkAt(scene.words, f)}
          position={[cx, 0, 2]}
          rotationY={-0.38}
          lookAt={lookUp ? [cx - 14, 30, -60] : [cx - 3.5, 2.6, 12]}
        />
        {/* contact blob */}
        <mesh position={[cx, 0.02, 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.95, 24]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.35} />
        </mesh>
      </Stage3D>
      <Headline text={str(p, 'headline')} at={cue(scene.words, str(p, 'headlineOn'), 6)} />
    </>
  );
};

// ------------------------------------------------------------------------------------------ whatif
/** "WHAT IF" + premise (Q-ROSITY title grammar) over a set; the world changes on `goneOn` with a 6-frame shake. */
export const WhatIfScene: React.FC<TemplateProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = scene.props;
  const set = (str(p, 'set', 'shore') as SetId) || 'shore';
  const goneAt = cue(scene.words, str(p, 'goneOn'), scene.durationInFrames);
  const moonV = f < goneAt ? 1 : 1 - ramp(f, goneAt, goneAt + Math.round(0.2 * fps), ease.in);
  const cx = 1.4;
  const { poses, moods } = useCharacterKeys(scene.words, 'idle', 'neutral', [{ mood: 'worried', atFrame: Math.max(0, goneAt - 40) }, { pose: 'shocked', atFrame: goneAt + 2 }, { mood: 'shocked', atFrame: goneAt + 2 }, ...(((p.character as CharacterCue[]) ?? []))]);
  const from: CamState = { dist: 12.5, height: 2.2, angle: -0.34, target: [cx - 2.6, 3.4, 0] };
  const to: CamState = { dist: 9.6, height: 1.6, angle: -0.22, target: [cx - 2.2, 3.6, 0] };
  // story clock: starts at clock.start (hh:mm:ss) and runs in real time from its word
  // story clock: reads exactly `at` (hh:mm:ss) on the spoken word `on` and runs in real time around it
  const clock = p.clock as { at?: string; on?: string } | undefined;
  const clockAt = cue(scene.words, clock?.on, 0);
  const [hh, mm, ss] = (clock?.at ?? '21:00:00').split(':').map(Number);
  const secs = 86400 + hh * 3600 + mm * 60 + ss + Math.floor((f - clockAt) / fps);
  const t = `${String(Math.floor(secs / 3600) % 24).padStart(2, '0')}:${String(Math.floor(secs / 60) % 60).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;
  const titleExit = typeof p.titleUntil === 'string' ? cue(scene.words, p.titleUntil as string, scene.durationInFrames) : undefined;
  return (
    <>
      <Stage3D theme={NIGHT_THEME} ground={false} shadows={false}>
        <CameraRig from={from} to={to} dur={scene.durationInFrames} shake={{ at: goneAt, amp: 0.12, frames: 6 }} />
        <SetFor set={set} moon={moonV} tide={0} />
        <BlockyCharacter pose={poses} mood={moods} talk={0} position={[cx, 0, 2]} rotationY={-0.5} lookAt={[cx - 14, 30, -60]} />
        <mesh position={[cx, 0.02, 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.95, 24]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.35} />
        </mesh>
      </Stage3D>
      <div style={{ position: 'absolute', left: SAFE.x0, top: SAFE.y0 + 10 }}>
        <RiseText text="WHAT IF" at={0} size={170} color={LF.text} shadow exitAt={titleExit} />
        <RiseText text={str(p, 'premise')} at={4} size={62} font={BODY} weight={800} color={LF.accent} shadow exitAt={titleExit} style={{ maxWidth: 1040, marginTop: 6 }} />
      </div>
      {clock ? (
        <div style={{ position: 'absolute', right: 1920 - SAFE.x1, top: SAFE.y0 + 26, textAlign: 'right', opacity: ramp(f, 2, 10) }}>
          <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 34, letterSpacing: '0.18em', color: 'rgba(255,246,236,0.8)' }}>{str(p, 'clockLabel', 'TONIGHT')}</div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 112, color: f >= goneAt ? LF.accent : LF.text, fontVariantNumeric: 'tabular-nums', textShadow: '0 6px 0 rgba(0,0,0,0.55)' }}>{t}</div>
        </div>
      ) : null}
    </>
  );
};
