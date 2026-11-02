// Stage3D — the one <ThreeCanvas> a Q-ROSITY episode mounts, plus the pieces that go inside it:
// ground, fog, 3-point + rim lighting and frame-driven camera presets for 9:16.
//
//   <Stage3D theme={VOLCANO_THEME}>
//     <Sequence from={b.from} durationInFrames={b.durationInFrames} layout="none">
//       <CameraRig preset="pushIn" />
//       <BlockyCharacter pose="idle" mood="neutral" lookAt={CAMERA_LOOK} />
//     </Sequence>
//   </Stage3D>
//
// Rules baked in (from the prototype, research/01c): ThreeCanvas has explicit width/height and
// dpr 1; every <Sequence> inside the canvas is layout="none"; nothing animates by itself — the
// camera is written from useCurrentFrame() (the useLayoutEffect below is an imperative write of
// frame-derived values, not animation state); outline hull only on the character, never on the set.
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
  /** fog near/far in meters */
  fog: [number, number];
  ground: string;
  /** colour of the raised ground tiles + background blocks */
  tile: string;
  /** hemisphere sky / ground */
  hemi: [string, string];
  key: { color: string; intensity: number };
  fill: { color: string; intensity: number };
  rim: { color: string; intensity: number };
  /** optional warm up-light from the floor (lava, campfire…) */
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

// =============================================================================
// CAMERA PRESETS (9:16, vertical fov 36°, horizontal half-angle ≈ 10°: stack depth, not width)
// Visible height at distance d ≈ 0.65·d. Full-body hero at 9.2 m → character ≈ 52 % of frame.
// =============================================================================
export type CameraPreset = 'hero' | 'pushIn' | 'orbit' | 'lowAngle' | 'bust' | 'loop';

type CamState = { dist: number; height: number; angle: number; target: [number, number, number] };

/** [start, end] of each preset over its beat. angle = orbit around +Y in radians (0 = front). */
const PRESETS: Record<CameraPreset, [CamState, CamState]> = {
  // full body, feet ~78 %, head top ~23 %; a hold that creeps (0.3 m over the beat)
  hero: [
    { dist: 9.2, height: 1.6, angle: -0.12, target: [0, 1.7, 0] },
    { dist: 8.8, height: 1.65, angle: -0.06, target: [0, 1.7, 0] },
  ],
  // the hook: slow push-in with a 12° orbit. The target rises with the push so the head top
  // stays below y ≈ 510 px and the title block (y 230–430) is never touched.
  pushIn: [
    { dist: 9.2, height: 1.6, angle: -0.3, target: [0, 1.7, 0] },
    { dist: 7.6, height: 1.9, angle: -0.08, target: [0, 2.0, 0] },
  ],
  // the last beat: glide back to pushIn's first frame so the last frame ≈ frame 0
  loop: [
    { dist: 8.2, height: 1.7, angle: -0.22, target: [0, 1.75, 0] },
    { dist: 9.2, height: 1.6, angle: -0.3, target: [0, 1.7, 0] },
  ],
  // 3/4 body, 17° orbit across the beat
  orbit: [
    { dist: 7.4, height: 1.9, angle: -0.15, target: [0, 1.85, 0] },
    { dist: 7.2, height: 1.9, angle: 0.15, target: [0, 1.85, 0] },
  ],
  // consequence: camera at 1.3 m looking up (never lower — the head cube's underside shows)
  lowAngle: [
    { dist: 6.2, height: 1.3, angle: 0.1, target: [0, 2.0, 0] },
    { dist: 5.6, height: 1.3, angle: 0.02, target: [0, 2.05, 0] },
  ],
  // reaction: face fills the upper-middle of the frame
  bust: [
    { dist: 4.6, height: 2.2, angle: -0.08, target: [0, 2.3, 0] },
    { dist: 4.3, height: 2.2, angle: 0.0, target: [0, 2.3, 0] },
  ],
};

export type CameraRigProps = {
  preset: CameraPreset;
  /** local frames over which the move plays (default: the whole Sequence) */
  dur?: number;
  /** override the look-at point (raises/lowers the character in frame) */
  target?: [number, number, number];
  /** scale the camera distance (1 = preset) */
  zoom?: number;
  /** impact shake: starts at local frame `at`, `amp` in meters, 7 frames, flips sign each frame */
  shake?: { at: number; amp: number };
  /** vertical fov (36 default) */
  fov?: number;
};

/**
 * Frame-driven camera. Mount one per beat inside a <Sequence layout="none"> so the move
 * restarts at the cut. Pure function of the local frame.
 */
export const CameraRig: React.FC<CameraRigProps> = ({ preset, dur, target, zoom = 1, shake, fov = 36 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const [a, b] = PRESETS[preset];
  const len = Math.max(1, dur ?? durationInFrames);
  const t = interpolate(frame, [0, len], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.45, 0, 0.55, 1), // sine-ish in/out: a glide, not a snap
  });
  const dist = (a.dist + (b.dist - a.dist) * t) * zoom;
  const height = a.height + (b.height - a.height) * t;
  const angle = a.angle + (b.angle - a.angle) * t;
  const tg = target ?? [a.target[0] + (b.target[0] - a.target[0]) * t, a.target[1] + (b.target[1] - a.target[1]) * t, a.target[2] + (b.target[2] - a.target[2]) * t];
  // impact shake: amp * (-1)^f * exp(-f/3) over 7 frames
  let sx = 0;
  let sy = 0;
  if (shake) {
    const f = frame - shake.at;
    if (f >= 0 && f < 7) {
      const s = shake.amp * (f % 2 === 0 ? 1 : -1) * Math.exp(-f / 3);
      sx = s;
      sy = s * 0.6;
    }
  }

  useLayoutEffect(() => {
    camera.position.set(Math.sin(angle) * dist + sx, height + sy, Math.cos(angle) * dist);
    camera.lookAt(tg[0] + sx, tg[1] + sy, tg[2]);
    camera.fov = fov;
    camera.near = 0.1;
    camera.far = 100;
    camera.updateProjectionMatrix();
  }, [camera, angle, dist, height, tg[0], tg[1], tg[2], sx, sy, fov, frame]);

  return null;
};

/** World point in front of the default camera, for `lookAt` so the character faces the lens. */
export const CAMERA_LOOK: [number, number, number] = [1.2, 2.3, 8];

// =============================================================================
// ENVIRONMENT
// =============================================================================

/** Ground: a plane plus a loose grid of slightly raised tiles for parallax (deterministic). */
export const Ground: React.FC<{ theme: StageTheme; tiles?: boolean; blocks?: boolean }> = ({ theme, tiles = true, blocks = true }) => {
  const tileList = useMemo(() => {
    const out: { x: number; z: number; c: string; h: number }[] = [];
    let s = 1;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647; // deterministic LCG
    const base = new THREE.Color(theme.tile);
    for (let i = -6; i <= 6; i++) {
      for (let j = -6; j <= 6; j++) {
        const r = rnd();
        if (r < 0.22) {
          const shade = 0.78 + rnd() * 0.22;
          out.push({ x: i, z: j, h: 0.02 + rnd() * 0.05, c: base.clone().multiplyScalar(shade).getStyle() });
        }
      }
    }
    return out;
  }, [theme.tile]);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color={theme.ground} roughness={1} metalness={0} />
      </mesh>
      {blocks
        ? [
            { p: [-3.2, 0.5, -2.5] as const, s: 1.0 },
            { p: [3.6, 0.75, -4.5] as const, s: 1.5 },
            { p: [-4.5, 1.0, -6] as const, s: 2.0 },
            { p: [2.4, 0.25, -1.6] as const, s: 0.5 },
          ].map((b, i) => (
            <mesh key={`b${i}`} position={[b.p[0], b.p[1], b.p[2]]} castShadow receiveShadow>
              <boxGeometry args={[b.s, b.s, b.s]} />
              <meshStandardMaterial color={theme.tile} roughness={1} metalness={0} />
            </mesh>
          ))
        : null}
      {tiles
        ? tileList.map((tl, i) => (
            <mesh key={i} position={[tl.x, tl.h / 2, tl.z]} receiveShadow castShadow>
              <boxGeometry args={[0.96, tl.h, 0.96]} />
              <meshStandardMaterial color={tl.c} roughness={1} metalness={0} />
            </mesh>
          ))
        : null}
    </group>
  );
};

/** 3-point lighting that reads on a phone: warm key w/ soft shadows, cool fill, strong rim. */
export const Lights: React.FC<{ theme: StageTheme; underGlow?: number }> = ({ theme, underGlow = 1 }) => {
  const key = useRef<THREE.DirectionalLight>(null);
  // one-time shadow-camera setup (not animation state)
  useLayoutEffect(() => {
    if (key.current) {
      key.current.shadow.mapSize.set(2048, 2048);
      key.current.shadow.camera.left = -6;
      key.current.shadow.camera.right = 6;
      key.current.shadow.camera.top = 6;
      key.current.shadow.camera.bottom = -6;
      key.current.shadow.camera.near = 1;
      key.current.shadow.camera.far = 30;
      key.current.shadow.bias = -0.0008;
      key.current.shadow.normalBias = 0.03; // 0.03 (not 0.02): less stipple on SwiftShader (swangle)
      key.current.shadow.radius = 4;
    }
  }, []);
  return (
    <>
      <hemisphereLight args={[theme.hemi[0], theme.hemi[1], 0.9]} />
      <directionalLight ref={key} position={[4, 7, 5]} intensity={theme.key.intensity} color={theme.key.color} castShadow />
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
  /** mount the default ground (false when the episode builds its own set) */
  ground?: boolean;
  /** 0..1 multiplier for the theme's underGlow (lava beats) */
  underGlow?: number;
}> = ({ theme = DUSK_THEME, children, ground = true, underGlow = 1 }) => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas
      width={width}
      height={height}
      dpr={1}
      shadows={{ type: THREE.PCFShadowMap }} // three ≥ 0.187 removed PCFSoftShadowMap; PCF + shadow.radius 4
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: theme.exposure ?? 1.05 }}
      camera={{ fov: 36, near: 0.1, far: 100, position: [0, 1.6, 9.2] }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <color attach="background" args={[theme.sky]} />
      <fog attach="fog" args={[theme.sky, theme.fog[0], theme.fog[1]]} />
      <Lights theme={theme} underGlow={underGlow} />
      {ground ? <Ground theme={theme} /> : null}
      {children}
    </ThreeCanvas>
  );
};
