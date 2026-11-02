// Stage3D — the one <ThreeCanvas> a reel mounts, plus lights, ground, fog and frame-driven camera
// presets for 9:16. Copied from setup/remotion/src/lib/character/Stage3D.tsx and adapted for the
// motion toolkit (HARNESS.md §1.1 / §6):
//   • camera moves use Easing.inOut(Easing.cubic) (was a custom bezier); shake ≤ 7 frames
//   • durations from fps; `CameraRig` also takes explicit `from`/`to` states for bespoke sets
//   • `transparent` stage (no sky/fog clear colour) so a character can sit over a 2D scene (The Signal)
//   • `toneMapping: 'none'` for exact brand colours on a print-like look; shadows optional
//     (swangle on a CPU renders PCF shadows slowly and stippled — The Signal draws 2D contact shadows)
//
// Rules: explicit width/height, dpr 1; every <Sequence> inside the canvas is layout="none"; nothing
// animates by itself — the camera is written from useCurrentFrame() (useLayoutEffect is an
// imperative write of frame-derived values, not animation state). Never useFrame().
import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

// =============================================================================
// THEME
// =============================================================================
export type StageTheme = {
  /** canvas clear colour and fog colour (keep equal so the horizon dissolves) */
  sky: string;
  fog: [number, number];
  ground: string;
  tile: string;
  hemi: [string, string];
  hemiIntensity?: number;
  key: { color: string; intensity: number; position?: [number, number, number] };
  fill: { color: string; intensity: number };
  rim: { color: string; intensity: number };
  underGlow?: { color: string; intensity: number; position: [number, number, number] };
  exposure?: number;
};

/** The prototype's dusk look: dark blue fog, warm key, cool fill, orange rim. */
export const DUSK_THEME: StageTheme = {
  sky: '#16222f',
  fog: [9, 24],
  ground: '#2f3d4c',
  tile: '#3a4a5a',
  hemi: ['#bcd3ff', '#2a2420'],
  key: { color: '#fff1dc', intensity: 3.2 },
  fill: { color: '#7fb0ff', intensity: 0.8 },
  rim: { color: '#ff9a5c', intensity: 2.4 },
  exposure: 1.05,
};

/** The Signal: flat, print-like light on a cream page — high even ambient, one soft key, no rim colour. */
export const PRINT_THEME: StageTheme = {
  sky: '#F4EFE6',
  fog: [80, 120],
  ground: '#F4EFE6',
  tile: '#E6DFD2',
  hemi: ['#FFFFFF', '#E6DFD2'],
  hemiIntensity: 2.2,
  key: { color: '#FFFFFF', intensity: 1.6, position: [-4, 8, 7] },
  fill: { color: '#FFF8EE', intensity: 0.6 },
  rim: { color: '#FFFFFF', intensity: 0.3 },
  exposure: 1,
};

// =============================================================================
// CAMERA PRESETS (9:16, vertical fov 36°: visible height at distance d ≈ 0.65·d)
// =============================================================================
export type CameraPreset = 'hero' | 'pushIn' | 'orbit' | 'lowAngle' | 'bust' | 'loop';
export type CamState = { dist: number; height: number; angle: number; target: [number, number, number] };

export const PRESETS: Record<CameraPreset, [CamState, CamState]> = {
  hero: [
    { dist: 9.2, height: 1.6, angle: -0.12, target: [0, 1.7, 0] },
    { dist: 8.8, height: 1.65, angle: -0.06, target: [0, 1.7, 0] },
  ],
  pushIn: [
    { dist: 9.2, height: 1.6, angle: -0.3, target: [0, 1.7, 0] },
    { dist: 7.6, height: 1.9, angle: -0.08, target: [0, 2.0, 0] },
  ],
  loop: [
    { dist: 8.2, height: 1.7, angle: -0.22, target: [0, 1.75, 0] },
    { dist: 9.2, height: 1.6, angle: -0.3, target: [0, 1.7, 0] },
  ],
  // ≈ 17° orbit across the beat (HARNESS §6: 10–20° on a reveal)
  orbit: [
    { dist: 7.4, height: 1.9, angle: -0.15, target: [0, 1.85, 0] },
    { dist: 7.2, height: 1.9, angle: 0.15, target: [0, 1.85, 0] },
  ],
  // consequence: camera at 1.3 m looking up (lower shows the head cube's underside)
  lowAngle: [
    { dist: 6.2, height: 1.3, angle: 0.1, target: [0, 2.0, 0] },
    { dist: 5.6, height: 1.3, angle: 0.02, target: [0, 2.05, 0] },
  ],
  bust: [
    { dist: 4.6, height: 2.2, angle: -0.08, target: [0, 2.3, 0] },
    { dist: 4.3, height: 2.2, angle: 0.0, target: [0, 2.3, 0] },
  ],
};

export type CameraRigProps = {
  preset?: CameraPreset;
  /** explicit start/end states (win over `preset`) */
  from?: CamState;
  to?: CamState;
  /** local frames over which the move plays (default: the whole Sequence) */
  dur?: number;
  /** world-space centre the orbit angle/distance are measured from (default origin) */
  center?: [number, number, number];
  zoom?: number;
  /** impact shake: starts at local frame `at`, `amp` meters, 7 frames max, sign flips each frame */
  shake?: { at: number; amp: number; frames?: number };
  fov?: number;
};

/** Frame-driven camera; mount one per beat inside a <Sequence layout="none">. */
export const CameraRig: React.FC<CameraRigProps> = ({ preset = 'hero', from, to, dur, center = [0, 0, 0], zoom = 1, shake, fov = 36 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const a = from ?? PRESETS[preset][0];
  const b = to ?? (from ? from : PRESETS[preset][1]);
  const len = Math.max(1, dur ?? durationInFrames);
  const t = interpolate(frame, [0, len], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  const m = (x: number, y: number) => x + (y - x) * t;
  const dist = m(a.dist, b.dist) * zoom;
  const height = m(a.height, b.height);
  const angle = m(a.angle, b.angle);
  const tg: [number, number, number] = [m(a.target[0], b.target[0]), m(a.target[1], b.target[1]), m(a.target[2], b.target[2])];
  let sx = 0;
  let sy = 0;
  if (shake) {
    const f = frame - shake.at;
    const n = Math.min(7, shake.frames ?? 7);
    if (f >= 0 && f < n) {
      const s = shake.amp * (f % 2 === 0 ? 1 : -1) * (1 - f / n);
      sx = s;
      sy = s * 0.6;
    }
  }
  useLayoutEffect(() => {
    camera.position.set(center[0] + Math.sin(angle) * dist + sx, center[1] + height + sy, center[2] + Math.cos(angle) * dist);
    camera.lookAt(tg[0] + sx, tg[1] + sy, tg[2]);
    camera.fov = fov;
    camera.near = 0.1;
    camera.far = 400;
    camera.updateProjectionMatrix();
  }, [camera, angle, dist, height, tg[0], tg[1], tg[2], sx, sy, fov, center[0], center[1], center[2], frame]);
  return null;
};

/** A fixed camera (position + look-at), for flat 2D-registered shots (The Signal). */
export const FixedCamera: React.FC<{ position: [number, number, number]; lookAt: [number, number, number]; fov: number }> = ({ position, lookAt, fov }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    camera.position.set(...position);
    camera.lookAt(...lookAt);
    camera.fov = fov;
    camera.near = 0.1;
    camera.far = 400;
    camera.updateProjectionMatrix();
  }, [camera, position[0], position[1], position[2], lookAt[0], lookAt[1], lookAt[2], fov]);
  return null;
};

/** World point in front of the default camera, for `lookAt` so the character faces the lens. */
export const CAMERA_LOOK: [number, number, number] = [1.2, 2.3, 8];

// =============================================================================
// ENVIRONMENT
// =============================================================================
/** Deterministic LCG so set dressing never changes between frames or machines. */
export const lcg = (seed: number) => {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};

export const Ground: React.FC<{ theme: StageTheme; tiles?: boolean; blocks?: boolean }> = ({ theme, tiles = true, blocks = true }) => {
  const tileList = useMemo(() => {
    const out: { x: number; z: number; c: string; h: number }[] = [];
    const rnd = lcg(1);
    const base = new THREE.Color(theme.tile);
    for (let i = -6; i <= 6; i++)
      for (let j = -6; j <= 6; j++)
        if (rnd() < 0.22) out.push({ x: i, z: j, h: 0.02 + rnd() * 0.05, c: base.clone().multiplyScalar(0.78 + rnd() * 0.22).getStyle() });
    return out;
  }, [theme.tile]);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color={theme.ground} roughness={1} metalness={0} />
      </mesh>
      {blocks
        ? [
            { p: [-3.2, 0.5, -2.5] as const, s: 1.0 },
            { p: [3.6, 0.75, -4.5] as const, s: 1.5 },
            { p: [-4.5, 1.0, -6] as const, s: 2.0 },
          ].map((b, i) => (
            <mesh key={`b${i}`} position={[b.p[0], b.p[1], b.p[2]]} castShadow receiveShadow>
              <boxGeometry args={[b.s, b.s, b.s]} />
              <meshStandardMaterial color={theme.tile} roughness={1} metalness={0} />
            </mesh>
          ))
        : null}
      {tiles
        ? tileList.map((tl, i) => (
            <mesh key={i} position={[tl.x, tl.h / 2, tl.z]} receiveShadow>
              <boxGeometry args={[0.96, tl.h, 0.96]} />
              <meshStandardMaterial color={tl.c} roughness={1} metalness={0} />
            </mesh>
          ))
        : null}
    </group>
  );
};

/** 3-point lighting: key (optionally with shadows), fill, rim, hemisphere; optional up-light. */
export const Lights: React.FC<{ theme: StageTheme; underGlow?: number; shadows?: boolean; scale?: number }> = ({ theme, underGlow = 1, shadows = true, scale = 1 }) => {
  const key = useRef<THREE.DirectionalLight>(null);
  useLayoutEffect(() => {
    if (key.current && shadows) {
      key.current.shadow.mapSize.set(2048, 2048);
      const s = 8 * scale;
      key.current.shadow.camera.left = -s;
      key.current.shadow.camera.right = s;
      key.current.shadow.camera.top = s;
      key.current.shadow.camera.bottom = -s;
      key.current.shadow.camera.near = 1;
      key.current.shadow.camera.far = 40 * scale;
      key.current.shadow.bias = -0.0008;
      key.current.shadow.normalBias = 0.03;
      key.current.shadow.radius = 4;
      key.current.shadow.camera.updateProjectionMatrix();
    }
  }, [shadows, scale]);
  const kp = theme.key.position ?? [4, 7, 5];
  return (
    <>
      <hemisphereLight args={[theme.hemi[0], theme.hemi[1], theme.hemiIntensity ?? 0.9]} />
      <directionalLight ref={key} position={[kp[0] * scale, kp[1] * scale, kp[2] * scale]} intensity={theme.key.intensity} color={theme.key.color} castShadow={shadows} />
      <directionalLight position={[-6, 3, 2]} intensity={theme.fill.intensity} color={theme.fill.color} />
      <directionalLight position={[-2, 4, -6]} intensity={theme.rim.intensity} color={theme.rim.color} />
      {theme.underGlow && underGlow > 0 ? (
        <pointLight position={theme.underGlow.position} intensity={theme.underGlow.intensity * underGlow} color={theme.underGlow.color} distance={12} decay={1.6} />
      ) : null}
    </>
  );
};

// =============================================================================
// STAGE
// =============================================================================
export const Stage3D: React.FC<{
  theme?: StageTheme;
  children: React.ReactNode;
  /** mount the default ground (false when the reel builds its own set) */
  ground?: boolean;
  underGlow?: number;
  /** no clear colour, no fog: the canvas composites over the 2D layer under it */
  transparent?: boolean;
  /** 'none' keeps brand hexes exact (print look); 'aces' for lit sets */
  toneMapping?: 'none' | 'aces';
  shadows?: boolean;
  /** mount the theme's default lights (false when every beat lights its own set) */
  lights?: boolean;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
}> = ({ theme = DUSK_THEME, children, ground = true, underGlow = 1, transparent = false, toneMapping = 'aces', shadows = true, lights = true, width, height, style }) => {
  const cfg = useVideoConfig();
  const w = width ?? cfg.width;
  const h = height ?? cfg.height;
  return (
    <ThreeCanvas
      width={w}
      height={h}
      dpr={1}
      shadows={shadows ? { type: THREE.PCFShadowMap } : false}
      gl={{
        antialias: true,
        alpha: transparent,
        premultipliedAlpha: true,
        toneMapping: toneMapping === 'none' ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping,
        toneMappingExposure: theme.exposure ?? 1.05,
      }}
      camera={{ fov: 36, near: 0.1, far: 400, position: [0, 1.6, 9.2] }}
      style={{ position: 'absolute', left: 0, top: 0, ...style }}
    >
      {transparent ? null : <color attach="background" args={[theme.sky]} />}
      {transparent ? null : <fog attach="fog" args={[theme.sky, theme.fog[0], theme.fog[1]]} />}
      {lights ? <Lights theme={theme} underGlow={underGlow} shadows={shadows} /> : null}
      {ground ? <Ground theme={theme} /> : null}
      {children}
    </ThreeCanvas>
  );
};
