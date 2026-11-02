// Q-ROSITY · 001 · "What if you fell into a volcano?" 1080x1920 @ 60 fps, 30 s.
// REFERENCE episode for the 3D character: one <Stage3D> (ThreeCanvas) for the whole reel, one
// <Sequence layout="none"> per beat inside it (camera preset + character + set), and the kit's 2D
// layers (Kicker, BigTitle, Counter, Stamp, SourceLine, Captions, ProgressBar) stacked on top.
//
// Scene timing comes from beats.json (global seconds). Inside each <Sequence> frames are LOCAL;
// `cue(globalSeconds)` converts a VO word time to the local frame it must land on.
import React, { useMemo } from 'react';
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { QROSITY_STAGE as B, alpha } from '../../brand';
import { FONTS } from '../../fonts';
import { BigTitle, Captions, Counter, EASE, Kicker, ProgressBar, SAFE, SafeAreaGuides, SourceLine, Stamp } from '../../lib/kit';
import { BlockyCharacter, type MoodKey } from '../../lib/character/BlockyCharacter';
import { CAMERA_LOOK, CameraRig, Stage3D, type StageTheme } from '../../lib/character/Stage3D';
import { beat, beatsToFrames, toLocal } from '../../lib/timing';
import beats from './beats.json';
import { VO } from './vo.gen';

const BEATS = beatsToFrames(beats.beats);
const font = FONTS['q-rosity'];

// =============================================================================
// THEME + SET — the volcano. Dark maroon fog, warm key, lava bounce fill, amber rim, lava up-light.
// =============================================================================
const VOLCANO: StageTheme = {
  sky: B.ink,
  fog: [8, 22],
  ground: '#2B1B1D',
  tile: '#3B2426',
  hemi: ['#FFB28A', '#2A0E0A'],
  key: { color: '#FFE2C4', intensity: 2.6 },
  fill: { color: '#FF6A3A', intensity: 0.7 },
  rim: { color: '#FFB347', intensity: 2.6 },
  underGlow: { color: '#FF5A1A', intensity: 7, position: [0, 0.5, 1.6] },
  exposure: 1.05,
};

const LAVA = '#FF6A1A';
const LAVA_EMISSIVE = '#FF4A10';
const CRUST = '#2A1416';
const ROCK = '#3B2426';

/** Deterministic LCG so set dressing never changes between frames or machines. */
const lcg = (seed: number) => {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};

/**
 * The episode's one 3D set piece: a lava field under everything, crust slabs, a ring of dark
 * crater blocks behind, rising embers (frame-driven) and an optional rock island at the origin.
 */
const VolcanoSet: React.FC<{ island: boolean }> = ({ island }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { crust, rim, embers } = useMemo(() => {
    const r = lcg(7);
    const crust: { x: number; z: number; w: number; d: number; rot: number }[] = [];
    for (let i = 0; i < 26; i++) {
      const x = -7 + r() * 14;
      const z = -9 + r() * 15;
      if (Math.hypot(x, z) < 1.6) continue; // keep the island clear
      crust.push({ x, z, w: 0.6 + r() * 1.3, d: 0.5 + r() * 1.1, rot: r() * Math.PI });
    }
    const rim: { x: number; z: number; s: number; h: number; c: string }[] = [];
    for (let i = 0; i < 22; i++) {
      // arc BEHIND the character only (z always <= -2): angles in (1.03π, 1.97π) have sin < 0.
      // Anything at z > 0 lands between the lens (z ≈ 9) and Q and blacks out the frame.
      const a = Math.PI * 1.03 + (i / 21) * Math.PI * 0.94;
      const rad = 6.5 + r() * 2.5;
      rim.push({ x: Math.cos(a) * rad, z: Math.sin(a) * rad - 2, s: 1.0 + r() * 1.6, h: 0.8 + r() * 2.6, c: r() < 0.5 ? ROCK : '#2E1A1C' });
    }
    const embers: { x: number; z: number; phase: number; speed: number; s: number }[] = [];
    for (let i = 0; i < 34; i++) {
      embers.push({ x: -3.5 + r() * 7, z: -5 + r() * 7, phase: r() * 6, speed: 0.6 + r() * 0.7, s: 0.04 + r() * 0.06 });
    }
    return { crust, rim, embers };
  }, []);
  const pulse = 1.1 + 0.25 * Math.sin(t * Math.PI * 2 * 0.45);
  return (
    <group>
      {/* lava field */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -1]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color={LAVA} emissive={LAVA_EMISSIVE} emissiveIntensity={pulse} roughness={1} metalness={0} />
      </mesh>
      {/* crust slabs floating on it */}
      {crust.map((c, i) => (
        <mesh key={`c${i}`} position={[c.x, 0.04, c.z]} rotation={[0, c.rot, 0]} receiveShadow castShadow>
          <boxGeometry args={[c.w, 0.08, c.d]} />
          <meshStandardMaterial color={CRUST} roughness={1} metalness={0} />
        </mesh>
      ))}
      {/* crater wall */}
      {rim.map((b, i) => (
        <mesh key={`r${i}`} position={[b.x, b.h / 2, b.z]} castShadow receiveShadow>
          <boxGeometry args={[b.s, b.h, b.s]} />
          <meshStandardMaterial color={b.c} roughness={1} metalness={0} />
        </mesh>
      ))}
      {/* embers: rise 0 → 6 m on a loop, drift sideways, shrink near the top */}
      {embers.map((e, i) => {
        const y = (t * e.speed + e.phase) % 6;
        const k = 1 - (y / 6) ** 2;
        return (
          <mesh key={`e${i}`} position={[e.x + 0.35 * Math.sin(t * 1.3 + e.phase), y, e.z + 0.2 * Math.cos(t * 0.9 + e.phase)]} scale={[k, k, k]}>
            <boxGeometry args={[e.s, e.s, e.s]} />
            <meshStandardMaterial color="#FFB347" emissive="#FF8A2A" emissiveIntensity={2.5} roughness={1} metalness={0} />
          </mesh>
        );
      })}
      {/* rock island Q stands on before he steps off */}
      {island ? (
        <group>
          <mesh position={[0, -0.2, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.6, 0.6, 2.4]} />
            <meshStandardMaterial color={ROCK} roughness={1} metalness={0} />
          </mesh>
          <mesh position={[1.1, -0.3, -0.6]} castShadow receiveShadow>
            <boxGeometry args={[1.2, 0.5, 1.2]} />
            <meshStandardMaterial color={CRUST} roughness={1} metalness={0} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
};

/** Lava is dark-red at the far edge; a radial in the overlay layer keeps the top of frame moody. */
const Vignette: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse 110% 80% at 50% 60%, transparent 55%, ${alpha('#000000', 0.5)} 100%)`, pointerEvents: 'none' }} />
);

// =============================================================================
// 2D helpers specific to this episode
// =============================================================================

/** The hook title block (frame 0 and the loop): WHAT IF + premise, y 230–430, above the head. */
const HookTitle: React.FC<{ at: number; until?: number }> = ({ at, until }) => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [at, at + 14], [0, 1], { easing: EASE.out, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const b = interpolate(frame, [at + 8, at + 22], [0, 1], { easing: EASE.out, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const exit = until === undefined ? 1 : interpolate(frame, [until, until + 8], [1, 0], { easing: EASE.in, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (exit <= 0.001) return null;
  return (
    <div style={{ position: 'absolute', top: 236, left: SAFE.side, right: SAFE.side, textAlign: 'center', opacity: exit }}>
      <div style={{ fontFamily: font.display, fontWeight: 900, fontSize: 132, lineHeight: 1, letterSpacing: '-0.03em', color: B.text, textShadow: `0 8px 30px ${alpha('#000', 0.6)}`, opacity: a, translate: `0px ${(1 - a) * 30}px` }}>
        WHAT IF
      </div>
      <div style={{ marginTop: 14, fontFamily: font.body, fontWeight: 800, fontSize: 60, lineHeight: 1.1, color: B.accent, textShadow: `0 6px 24px ${alpha('#000', 0.7)}`, opacity: b, translate: `0px ${(1 - b) * 20}px`, whiteSpace: 'nowrap' }}>
        you fell into a volcano?
      </div>
    </div>
  );
};

/** Source credit for a number on screen: the kit's SourceLine on a plate, below the chin, above the captions. */
const Source: React.FC<{ text: string; at: number; until?: number; y?: number }> = ({ text, at, until, y = 1248 }) => (
  <SourceLine brand={B} text={text} y={y} at={at} until={until} plate />
);

// =============================================================================
// BEATS — each returns { three, overlay }. Local frames inside; cue(s) maps a VO second.
// =============================================================================
type BeatParts = { three: React.ReactNode; overlay: React.ReactNode };

const Hook = (): BeatParts => {
  const b = beat(BEATS, 'hook');
  const cue = (s: number) => toLocal(s, b.from);
  const exitAt = b.durationInFrames - 8;
  const mood: MoodKey[] = [
    { at: -99, mood: 'neutral' },
    { at: cue(1.9), mood: 'worried' }, // on "volcano"
  ];
  return {
    three: (
      <>
        <CameraRig preset="pushIn" />
        <VolcanoSet island />
        <BlockyCharacter pose="idle" mood={mood} lookAt={CAMERA_LOOK} />
      </>
    ),
    overlay: <HookTitle at={-30} until={exitAt} />,
  };
};

const Heat = (): BeatParts => {
  const b = beat(BEATS, 'heat');
  const cue = (s: number) => toLocal(s, b.from);
  const exitAt = b.durationInFrames - 8;
  return {
    three: (
      <>
        <CameraRig preset="orbit" zoom={1.08} />
        <VolcanoSet island />
        {/* points up-right at the lava on "heat" (4.6 s) */}
        <BlockyCharacter pose="point" poseAt={cue(4.6)} prevPose="idle" mood="worried" lookAt={CAMERA_LOOK} />
      </>
    ),
    overlay: (
      <>
        <Kicker brand={B} text="01 · the heat" at={0} until={exitAt} />
        <BigTitle brand={B} lines={['First: *the heat.*']} y={310} size={92} at={4} until={exitAt} />
      </>
    ),
  };
};

const HeatNumber = (): BeatParts => {
  const b = beat(BEATS, 'heat-number');
  const cue = (s: number) => toLocal(s, b.from);
  const exitAt = b.durationInFrames - 8;
  const countAt = cue(7.3);
  const countDur = cue(8.1) - countAt; // lands on "1,100"
  const mood: MoodKey[] = [
    { at: -99, mood: 'worried' },
    { at: cue(8.0), mood: 'shocked' },
  ];
  return {
    three: (
      <>
        <CameraRig preset="bust" zoom={1.25} />
        <VolcanoSet island />
        <BlockyCharacter pose="idle" mood={mood} lookAt={CAMERA_LOOK} />
      </>
    ),
    overlay: (
      <>
        <Counter brand={B} to={1100} at={countAt} dur={countDur} suffix=" °C" size={168} y={290} color={B.accent} until={exitAt} />
        <Source text="Oregon State Volcano World · USGS 1961 (Kīlauea)" at={countAt + countDur} until={exitAt} />
      </>
    ),
  };
};

const Surface = (): BeatParts => {
  const b = beat(BEATS, 'surface');
  const exitAt = b.durationInFrames - 8;
  const WalkOn: React.FC = () => {
    const frame = useCurrentFrame();
    // steps off the island toward the lens: z -1.4 → 0.4 over the beat
    const z = interpolate(frame, [0, b.durationInFrames], [-1.4, 0.5], { easing: EASE.inOut, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return <BlockyCharacter pose="walk" mood="worried" position={[0, 0, z]} lookAt={CAMERA_LOOK} />;
  };
  return {
    three: (
      <>
        <CameraRig preset="hero" target={[0, 1.85, 0]} />
        <VolcanoSet island={false} />
        <WalkOn />
      </>
    ),
    overlay: (
      <>
        <Kicker brand={B} text="02 · the surface" at={0} until={exitAt} />
        <BigTitle brand={B} lines={["You don't *sink.*"]} y={310} size={92} at={4} until={exitAt} />
      </>
    ),
  };
};

const Float = (): BeatParts => {
  const b = beat(BEATS, 'float');
  const cue = (s: number) => toLocal(s, b.from);
  const exitAt = b.durationInFrames - 8;
  const countAt = cue(13.75);
  const mood: MoodKey[] = [
    { at: -99, mood: 'worried' },
    { at: cue(15.5), mood: 'happy' }, // "You float." — he thinks that's good news
  ];
  return {
    three: (
      <>
        <CameraRig preset="bust" zoom={1.25} />
        <VolcanoSet island={false} />
        <BlockyCharacter pose="idle" mood={mood} position={[0, -0.12, 0]} lookAt={CAMERA_LOOK} seed={40} />
      </>
    ),
    overlay: (
      <>
        <Counter brand={B} to={3} at={countAt} dur={24} suffix="×" size={190} y={280} color={B.accent} until={exitAt} />
        <Stamp brand={B} text="you float" x={540} y={1150} at={cue(15.6)} color={B.positive} size={72} rotate={-7} until={exitAt} />
        <Source text="Lava ≈3,100 vs you ≈1,000 kg/m³ · Sciencing 2025" at={countAt + 24} until={cue(15.5)} />
      </>
    ),
  };
};

const Physics = (): BeatParts => {
  const b = beat(BEATS, 'physics');
  const cue = (s: number) => toLocal(s, b.from);
  const exitAt = b.durationInFrames - 8;
  const countAt = cue(17.3);
  const countDur = cue(18.4) - countAt; // lands on "thousand"
  const mood: MoodKey[] = [
    { at: -99, mood: 'happy' },
    { at: cue(17.6), mood: 'worried' }, // "thicker"
  ];
  return {
    three: (
      <>
        <CameraRig preset="orbit" zoom={1.1} />
        <VolcanoSet island={false} />
        {/* walking in place, shins under the lava: stuck */}
        <BlockyCharacter pose="walk" mood={mood} position={[0, -0.38, 0]} lookAt={CAMERA_LOOK} seed={12} />
      </>
    ),
    overlay: (
      <>
        <Kicker brand={B} text="03 · the physics" at={0} until={exitAt} />
        <Counter brand={B} to={100000} at={countAt} dur={countDur} suffix="×" size={124} y={310} color={B.accent} until={exitAt} />
        <Source text="Basalt 10²–10³ Pa·s · water 10⁻³ · SFU Earth Sci." at={countAt + countDur} until={exitAt} />
      </>
    ),
  };
};

const Consequence = (): BeatParts => {
  const b = beat(BEATS, 'consequence');
  const cue = (s: number) => toLocal(s, b.from);
  const exitAt = b.durationInFrames - 8;
  const snapAt = cue(21.6); // "lie"
  const mood: MoodKey[] = [
    { at: -99, mood: 'worried' },
    { at: snapAt - 10, mood: 'shocked' }, // take starts 10 f early so the new face lands with the hop
  ];
  return {
    three: (
      <>
        <CameraRig preset="lowAngle" zoom={1.42} shake={{ at: snapAt, amp: 0.14 }} />
        <VolcanoSet island={false} />
        <BlockyCharacter pose="shocked" poseAt={snapAt} prevPose="idle" mood={mood} position={[0, -0.12, 0]} lookAt={CAMERA_LOOK} seed={23} />
      </>
    ),
    overlay: (
      <>
        <Kicker brand={B} text="the consequence" at={0} until={exitAt} color={B.negative} />
        <BigTitle brand={B} lines={['On top.', '*Burning.*']} y={300} size={96} at={snapAt} until={exitAt} />
        <Stamp brand={B} text="not survivable" x={540} y={1180} at={cue(24.4)} size={66} rotate={-6} until={exitAt} />
      </>
    ),
  };
};

const Loop = (): BeatParts => {
  const b = beat(BEATS, 'loop');
  const cue = (s: number) => toLocal(s, b.from);
  const mood: MoodKey[] = [
    { at: -99, mood: 'shocked' },
    { at: cue(26.5), mood: 'neutral' },
  ];
  return {
    three: (
      <>
        <CameraRig preset="loop" />
        <VolcanoSet island />
        <BlockyCharacter pose="idle" mood={mood} lookAt={CAMERA_LOOK} />
      </>
    ),
    overlay: <HookTitle at={cue(27.0)} />,
  };
};

// =============================================================================
// EPISODE
// =============================================================================
export const QrosityVolcano: React.FC<{ guides?: boolean }> = ({ guides = false }) => {
  const scenes: Record<string, () => BeatParts> = {
    hook: Hook,
    heat: Heat,
    'heat-number': HeatNumber,
    surface: Surface,
    float: Float,
    physics: Physics,
    consequence: Consequence,
    loop: Loop,
  };
  const parts = BEATS.map((b) => {
    const make = scenes[b.id];
    if (!make) throw new Error(`no scene for beat "${b.id}"`);
    return { b, ...make() };
  });
  return (
    <AbsoluteFill style={{ backgroundColor: B.ink }}>
      {/* ONE canvas for the whole reel; each beat is a layout="none" Sequence inside it */}
      <Stage3D theme={VOLCANO} ground={false}>
        {parts.map(({ b, three }) => (
          <Sequence key={b.id} name={`3d-${b.id}`} from={b.from} durationInFrames={b.durationInFrames} layout="none">
            {three}
          </Sequence>
        ))}
      </Stage3D>
      <Vignette />
      {parts.map(({ b, overlay }) => (
        <Sequence key={b.id} name={b.id} from={b.from} durationInFrames={b.durationInFrames}>
          {overlay}
        </Sequence>
      ))}
      {/* global layers: captions + progress live on the root timeline (global seconds) */}
      <Captions brand={B} lines={VO} plate />
      <ProgressBar brand={B} />
      {guides ? <SafeAreaGuides /> : null}
    </AbsoluteFill>
  );
};
