// Shared pieces for the 16:9 long-form scene templates: palette, fonts, eases, word cues, the
// paper ground, highlighter, rising text, source line and the talking blocky character inset.
//
// LOOK (Q-ROSITY Long): two grounds that alternate so a 12-minute video keeps changing —
//   • NIGHT 3D sets (narrator / what-if): Q-ROSITY channel sheet (lit sets, fog, practical lights).
//   • PAPER 2D explainers (numbers, bars, diagrams, timelines, quotes, chapter cards): warm field-notebook
//     cream, ink type, ONE accent per shot = the yellow highlighter. The character stands on the page.
// Display Rubik 900, body Nunito 800 (Q-ROSITY faces). No glow, no gradients, no centred-title-on-void.
import React from 'react';
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { loadFont as loadRubik } from '@remotion/google-fonts/Rubik';
import { loadFont as loadNunito } from '@remotion/google-fonts/Nunito';
import { BlockyCharacter, takeLandFrames, type Mood, type MoodKey, type Pose, type PoseKey } from '../examples/character/BlockyCharacter';
import type { SceneWord } from './types';

export const DISPLAY = loadRubik('normal', { weights: ['800', '900'], subsets: ['latin'] }).fontFamily;
export const BODY = loadNunito('normal', { weights: ['700', '800'], subsets: ['latin'] }).fontFamily;

export const LF = {
  paper: '#F3EBDD',
  paperEdge: '#E4D8C4',
  ink: '#120A10',
  inkSoft: 'rgba(18,10,16,0.62)',
  accent: '#FFD23F', // highlighter / key number — one use per shot
  night: '#0A0D16',
  text: '#FFF6EC', // type over 3D sets
  plate: 'rgba(18,10,16,0.82)',
  hoodie: '#6A33FF',
} as const;

/** 16:9 safe area for readable text (YouTube player chrome: title bar top, progress bar + end-screen cards bottom). */
export const SAFE = { x0: 120, x1: 1800, y0: 96, y1: 940 } as const;

export const ease = { out: Easing.out(Easing.cubic), inOut: Easing.inOut(Easing.cubic), in: Easing.in(Easing.cubic) };
export const ramp = (f: number, a: number, b: number, e: (t: number) => number = ease.out) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e });
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const useSec = () => {
  const { fps } = useVideoConfig();
  return (s: number) => Math.round(s * fps);
};

// ------------------------------------------------------------------------------------------ words
const norm = (w: string) => w.toLowerCase().replace(/[^0-9a-z%$.]/g, '').replace(/\.$/, '');
/** The nth spoken occurrence of `token` in the scene (case/punctuation-insensitive). */
export const wordAt = (words: SceneWord[], token: string | undefined, nth = 1): SceneWord | undefined => {
  if (!token) return undefined;
  const t = norm(token);
  return words.filter((w) => norm(w.w) === t)[nth - 1];
};
/** Frame (scene-local) a cue word starts; `fallback` when the word is absent (the planner warns). */
export const cue = (words: SceneWord[], token: string | undefined, fallback: number) => wordAt(words, token)?.f0 ?? fallback;

/** Lip flap from word timings: one open-close per ~3 letters, closed between words. Deterministic. */
export const talkAt = (words: SceneWord[], f: number) => {
  const w = words.find((x) => f >= x.f0 && f < x.f1);
  if (!w) return 0;
  const flaps = Math.max(1, Math.round(w.w.replace(/[^A-Za-z0-9]/g, '').length / 3));
  const p = ((f - w.f0) / Math.max(1, w.f1 - w.f0)) * flaps;
  return 0.18 + 0.5 * Math.abs(Math.sin(Math.PI * p));
};

// ------------------------------------------------------------------------------------------ 2D bits
/** The paper ground: cream with a printed-dot texture (static, deterministic) and a soft page edge at the floor line. */
export const Paper: React.FC<{ floorY?: number; children?: React.ReactNode }> = ({ floorY = 930, children }) => (
  <div style={{ position: 'absolute', inset: 0, background: LF.paper, overflow: 'hidden' }}>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(rgba(18,10,16,0.07) 1.2px, transparent 1.4px)',
        backgroundSize: '22px 22px',
      }}
    />
    <div style={{ position: 'absolute', left: 0, right: 0, top: floorY, bottom: 0, background: LF.paperEdge }} />
    <div style={{ position: 'absolute', left: 0, right: 0, top: floorY, height: 6, background: LF.ink }} />
    {children}
  </div>
);

/** Yellow highlighter block that wipes in left→right on `at` (8 frames), behind its children. */
export const Highlight: React.FC<{ at: number; children: React.ReactNode; pad?: number; style?: React.CSSProperties }> = ({ at, children, pad = 14, style }) => {
  const f = useCurrentFrame();
  const k = ramp(f, at, at + 8);
  return (
    <span style={{ position: 'relative', display: 'inline-block', ...style }}>
      <span
        style={{
          position: 'absolute',
          left: -pad,
          right: -pad,
          top: '18%',
          bottom: '6%',
          background: LF.accent,
          transformOrigin: 'left center',
          transform: `scaleX(${k})`,
        }}
      />
      <span style={{ position: 'relative' }}>{children}</span>
    </span>
  );
};

/** Words rise out of a mask line (10 frames, out-cubic, 2-frame stagger); exit up over `exitDur`. */
export const RiseText: React.FC<{
  text: string;
  at: number;
  size: number;
  color?: string;
  font?: string;
  weight?: number;
  exitAt?: number;
  stagger?: number;
  lineHeight?: number;
  shadow?: boolean;
  style?: React.CSSProperties;
}> = ({ text, at, size, color = LF.ink, font = DISPLAY, weight = 900, exitAt, stagger = 2, lineHeight = 1.02, shadow = false, style }) => {
  const f = useCurrentFrame();
  const words = text.split(' ');
  const exit = exitAt === undefined ? 0 : ramp(f, exitAt, exitAt + 5, ease.in);
  return (
    <div style={{ fontFamily: font, fontWeight: weight, fontSize: size, lineHeight, color, ...style }}>
      {words.map((w, i) => {
        const k = ramp(f, at + i * stagger, at + i * stagger + 10);
        return (
          <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: size * 0.08, marginRight: size * 0.24 }}>
            <span
              style={{
                display: 'inline-block',
                transform: `translateY(${(1 - k) * 105 - exit * 105}%)`,
                textShadow: shadow ? '0 6px 0 rgba(0,0,0,0.55)' : undefined,
              }}
            >
              {w}
            </span>
          </span>
        );
      })}
    </div>
  );
};

/** Source line (every number on screen carries one). ≥ 28 px, ink 62 %. */
export const SourceLine: React.FC<{ text?: string; at: number; light?: boolean }> = ({ text, at, light = false }) => {
  const f = useCurrentFrame();
  if (!text) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE.x0,
        top: 968,
        fontFamily: BODY,
        fontWeight: 700,
        fontSize: 30,
        color: light ? 'rgba(255,246,236,0.75)' : LF.inkSoft,
        opacity: ramp(f, at, at + 10),
      }}
    >
      Source: {text}
    </div>
  );
};

/** Small tracked label ("CHAPTER ONE", "RELATIVE TIDE HEIGHT"). */
export const Label: React.FC<{ text: string; at: number; color?: string; style?: React.CSSProperties }> = ({ text, at, color = LF.inkSoft, style }) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        fontFamily: BODY,
        fontWeight: 800,
        fontSize: 40,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color,
        opacity: ramp(f, at, at + 8),
        transform: `translateY(${(1 - ramp(f, at, at + 10)) * 16}px)`,
        ...style,
      }}
    >
      {text}
    </div>
  );
};

// ------------------------------------------------------------------------------------------ character inset
const InsetCamera: React.FC<{ dist: number; targetY: number; fov: number; yaw?: number }> = ({ dist, targetY, fov, yaw = -0.18 }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  React.useLayoutEffect(() => {
    camera.fov = fov;
    camera.position.set(Math.sin(yaw) * dist, targetY + 0.35, Math.cos(yaw) * dist);
    camera.lookAt(0, targetY, 0);
    camera.updateProjectionMatrix();
  }, [camera, dist, targetY, fov, yaw]);
  return null;
};

// inset framing: 3.1 m figure ≈ 74 % of the region height, camera target y 1.62 m
const INSET_FOV = 30;
const INSET_VISIBLE_H = 3.1 / 0.74;
const INSET_TARGET_Y = 1.62;
/** fraction of the region height between the feet and the region's bottom edge */
export const INSET_FOOT_FRAC = (INSET_VISIBLE_H / 2 - INSET_TARGET_Y) / INSET_VISIBLE_H;
/** `top` that puts the character's feet on the paper floor line at `floorY`. */
export const insetTopForFloor = (height: number, floorY = 930) => Math.round(floorY + 8 - height * (1 - INSET_FOOT_FRAC));

export type CharacterCue = { pose?: Pose; mood?: Mood; on?: string; atFrame?: number };

/**
 * The blocky person standing on the paper page, in a transparent canvas region (the 2D page shows
 * through). `cues` key poses/moods to spoken words; mood takes land ON the word (key = word − takeLand).
 * He talks (lip flap) on the scene's words when `talking`.
 */
export const CharacterInset: React.FC<{
  words: SceneWord[];
  left: number;
  top: number;
  width: number;
  height: number;
  pose?: Pose;
  mood?: Mood;
  cues?: CharacterCue[];
  talking?: boolean;
  lookAt?: [number, number, number];
  rotationY?: number;
}> = ({ words, left, top, width, height, pose = 'idle', mood = 'neutral', cues = [], talking = true, lookAt, rotationY = -0.35 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const poseKeys: PoseKey[] = [{ at: 0, pose }];
  const moodKeys: MoodKey[] = [{ at: 0, mood }];
  for (const c of cues) {
    const at = c.atFrame ?? cue(words, c.on, -1);
    if (at < 0) continue;
    if (c.pose) poseKeys.push({ at, pose: c.pose });
    if (c.mood) moodKeys.push({ at: Math.max(0, at - takeLandFrames(fps)), mood: c.mood });
  }
  const fov = INSET_FOV;
  const dist = INSET_VISIBLE_H / (2 * Math.tan((fov * Math.PI) / 360));
  return (
    <div style={{ position: 'absolute', left, top, width, height }}>
      <ThreeCanvas width={width} height={height} dpr={1} gl={{ antialias: true, alpha: true, premultipliedAlpha: true, toneMapping: THREE.NoToneMapping }} camera={{ fov, near: 0.1, far: 100 }}>
        <InsetCamera dist={dist} targetY={INSET_TARGET_Y} fov={fov} />
        <hemisphereLight args={['#FFFFFF', '#E4D8C4', 2.0]} />
        <directionalLight position={[-4, 8, 7]} intensity={1.5} color="#FFFFFF" />
        <directionalLight position={[5, 3, 2]} intensity={0.5} color="#FFF3E0" />
        <BlockyCharacter pose={poseKeys} mood={moodKeys} talk={talking ? talkAt(words, f) : 0} lookAt={lookAt ?? [-6, 2.2, 6]} rotationY={rotationY} />
      </ThreeCanvas>
      {/* 2D contact shadow under the feet (no shadow maps on CPU renders) */}
      <div
        style={{
          position: 'absolute',
          left: '28%',
          width: '44%',
          bottom: `calc(${INSET_FOOT_FRAC * 100}% - 11px)`,
          height: 22,
          borderRadius: '50%',
          background: 'rgba(18,10,16,0.16)',
        }}
      />
    </div>
  );
};
