// The blocky person — an ORIGINAL procedural box-limb humanoid built from <boxGeometry> only (no model
// files, textures or third-party assets). Copied from setup/remotion/src/lib/character/BlockyCharacter.tsx
// (60 fps kit) and adapted for the motion toolkit (HARNESS.md §1.1):
//   • every duration is in SECONDS × fps (works at 30 fps; nothing assumes 60)
//   • no overshoot / wobble: takes settle with Easing.out(cubic); the shocked pose no longer rings;
//     the point pose no longer trembles (HARNESS §1.1 + §2 "bounce/elastic/wobble")
//   • colours come from a `palette` prop (DEFAULT_PALETTE = Q-ROSITY, SIGNAL_PALETTE = cream/ink print)
//   • pose TIMELINES (`pose={[{at, pose}]}`) blend between poses (no snaps), plus a new `phone` pose
//     with a phone prop whose screen brightness is a prop (`phoneGlow`, 0..1)
//
// Every rotation, scale and face state is a pure function of useCurrentFrame() (frames render in
// parallel tabs). Units: meters. Origin = between the feet, facing +Z (toward the default camera).
// Proportions (chibi, 4.2 heads tall): head 0.95 cube · torso 0.9×1.1×0.5 · arms 0.32×1.05 · legs 0.4×0.95.
import React, { useMemo } from 'react';
import { Easing, useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';

// =============================================================================
// PUBLIC API
// =============================================================================

export type Pose = 'idle' | 'walk' | 'point' | 'shocked' | 'phone' | 'sit';
export type Mood = 'neutral' | 'worried' | 'shocked' | 'happy' | 'asleep';
/** `at` = LOCAL frame (of the enclosing <Sequence>) the take toward `mood` begins. */
export type MoodKey = { at: number; mood: Mood };
/** `at` = LOCAL frame the pose starts; the previous pose blends out over POSE_BLEND_SEC. */
export type PoseKey = { at: number; pose: Pose };

export type BlockyCharacterProps = {
  /** a constant pose, or a timeline of pose keys (local frames) */
  pose: Pose | PoseKey[];
  /** world-space point the head looks at (clamped to a natural range) */
  lookAt?: [number, number, number];
  /** constant mood or a timeline of takes (anticipation → squash → new face → settle) */
  mood?: Mood | MoodKey[];
  position?: [number, number, number];
  rotationY?: number;
  /** frame offset so two characters don't breathe in sync */
  seed?: number;
  palette?: Partial<Palette>;
  /** outline thickness in meters (0 disables the inverted-hull outline) */
  outline?: number;
  /** `phone` pose: 0 = dead black screen, 1 = lit */
  phoneGlow?: number;
  /** uniform scale (1 = 3.1 m tall) */
  scale?: number;
  /** 0..1 extra mouth opening for speech (narrator lip-flap from word timings); 0 = mood/pose only */
  talk?: number;
};

/** Q-ROSITY colours (setup/channels/q-rosity/brand.md §6). */
export const DEFAULT_PALETTE = {
  skin: '#F0C090',
  hair: '#2A1F2E',
  hoodie: '#6A33FF',
  hoodieDark: '#4F22C9',
  accent: '#FFD23F',
  pants: '#15192B',
  shoes: '#FFFFFF',
  shoeSole: '#FFD23F',
  eye: '#15192B',
  eyeWhite: '#FFFFFF',
  mouth: '#7A2E3A',
  blush: '#FF8A9A',
  sweat: '#9FDBFF',
  outline: '#15192B',
  phone: '#15192B',
  phoneScreen: '#CFE6FF',
};
export type Palette = typeof DEFAULT_PALETTE;

/** The Signal: same person, recoloured for a cream print ground — ink, paper, one warm skin tone. No red (red = money only). */
export const SIGNAL_PALETTE: Palette = {
  skin: '#E9C6A0',
  hair: '#1B1B1B',
  hoodie: '#1B1B1B',
  hoodieDark: '#343130',
  accent: '#E6DFD2',
  pants: '#5B5650',
  shoes: '#F4EFE6',
  shoeSole: '#E6DFD2',
  eye: '#1B1B1B',
  eyeWhite: '#FFFDF8',
  mouth: '#4A2A26',
  blush: '#E3A98E',
  sweat: '#FFFDF8',
  outline: '#1B1B1B',
  phone: '#1B1B1B',
  phoneScreen: '#FFFDF8',
};

/** A mood take lasts 0.5 s (anticipation 20 % → squash 20 % → settle 60 %). */
export const TAKE_SEC = 0.5;
/** Pose-to-pose blend. */
export const POSE_BLEND_SEC = 0.2;
/** Frames from a take's start to the frame the new face has landed (use: key.at = word − takeLandFrames). */
export const takeLandFrames = (fps: number) => Math.round(TAKE_SEC * fps * 0.42);

// =============================================================================
// DIMENSIONS
// =============================================================================
const HEAD = 0.95;
const TORSO = { w: 0.9, h: 1.1, d: 0.5 };
const ARM = { w: 0.32, h: 1.05, d: 0.32 };
const LEG = { w: 0.4, h: 0.95, d: 0.42 };
const HIP_Y = LEG.h;
const SHOULDER_Y = HIP_Y + TORSO.h - 0.08;
const NECK_Y = HIP_Y + TORSO.h;

export const CHARACTER_EYE_Y = NECK_Y + HEAD * 0.5;
export const CHARACTER_HEIGHT = NECK_Y + HEAD + 0.1;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOut = Easing.out(Easing.cubic);
const easeInOut = Easing.inOut(Easing.cubic);

// =============================================================================
// PRIMITIVES
// =============================================================================
const Box: React.FC<{
  size: [number, number, number];
  position?: [number, number, number];
  color: string;
  outline: number;
  outlineColor: string;
  castShadow?: boolean;
}> = ({ size, position = [0, 0, 0], color, outline, outlineColor, castShadow = true }) => (
  <group position={position}>
    <mesh castShadow={castShadow} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.85} metalness={0} />
    </mesh>
    {outline > 0 ? (
      <mesh scale={[1 + outline / size[0], 1 + outline / size[1], 1 + outline / size[2]]}>
        <boxGeometry args={size} />
        <meshBasicMaterial color={outlineColor} side={THREE.BackSide} />
      </mesh>
    ) : null}
  </group>
);

/** Flat decal: a 12 mm box pushed ≥ 6 mm off a face so it never z-fights. */
const Decal: React.FC<{ size: [number, number]; position: [number, number, number]; color: string; rotationZ?: number }> = ({
  size,
  position,
  color,
  rotationZ = 0,
}) => (
  <mesh position={position} rotation={[0, 0, rotationZ]}>
    <boxGeometry args={[size[0], size[1], 0.012]} />
    <meshStandardMaterial color={color} roughness={1} metalness={0} />
  </mesh>
);

const QuestionMark: React.FC<{ x: number; y: number; z: number; s: number; color: string }> = ({ x, y, z, s, color }) => {
  const t = s * 0.16;
  return (
    <group position={[x, y, z]}>
      <Decal size={[s * 0.6, t]} position={[0, s * 0.42, 0]} color={color} />
      <Decal size={[t, s * 0.34]} position={[s * 0.3 - t / 2, s * 0.22, 0]} color={color} />
      <Decal size={[s * 0.45, t]} position={[s * 0.08, s * 0.05, 0]} color={color} />
      <Decal size={[t, s * 0.22]} position={[0, -s * 0.1, 0]} color={color} />
      <Decal size={[t * 1.1, t * 1.1]} position={[0, -s * 0.42, 0]} color={color} />
    </group>
  );
};

// =============================================================================
// BODY RIG — pure function of (pose, local frame)
// =============================================================================
type V3 = [number, number, number];
type Rig = {
  bob: number;
  lean: number;
  twist: number;
  lArm: V3;
  rArm: V3;
  lLeg: number;
  rLeg: number;
  headPitch: number;
  headYaw: number;
  headRoll: number;
  browRaise: number;
  mouthOpen: number;
  breathe: number;
};

const mixV3 = (a: V3, b: V3, t: number): V3 => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
const mixRig = (a: Rig, b: Rig, t: number): Rig => ({
  bob: mix(a.bob, b.bob, t),
  lean: mix(a.lean, b.lean, t),
  twist: mix(a.twist, b.twist, t),
  lArm: mixV3(a.lArm, b.lArm, t),
  rArm: mixV3(a.rArm, b.rArm, t),
  lLeg: mix(a.lLeg, b.lLeg, t),
  rLeg: mix(a.rLeg, b.rLeg, t),
  headPitch: mix(a.headPitch, b.headPitch, t),
  headYaw: mix(a.headYaw, b.headYaw, t),
  headRoll: mix(a.headRoll, b.headRoll, t),
  browRaise: mix(a.browRaise, b.browRaise, t),
  mouthOpen: mix(a.mouthOpen, b.mouthOpen, t),
  breathe: mix(a.breathe, b.breathe, t),
});

function computeRig(pose: Pose, frame: number, fps: number, seed: number): Rig {
  const t = (frame + seed) / fps;
  const breathe = 1 + 0.015 * Math.sin(t * 2 * Math.PI * 0.35);
  const sway = Math.sin(t * 2 * Math.PI * 0.35);
  const base: Rig = {
    bob: 0,
    lean: 0,
    twist: 0,
    // outward = NEGATIVE z for the left arm (at −x), POSITIVE z for the right arm (at +x)
    lArm: [0.05, 0, -0.08],
    rArm: [0.05, 0, 0.08],
    lLeg: 0,
    rLeg: 0,
    headPitch: 0,
    headYaw: 0,
    headRoll: 0,
    browRaise: 0,
    mouthOpen: 0,
    breathe,
  };
  switch (pose) {
    case 'idle':
      return {
        ...base,
        bob: 0.01 * sway,
        lArm: [0.06 + 0.03 * sway, 0, -0.1],
        rArm: [0.06 - 0.03 * sway, 0, 0.1],
        headYaw: 0.05 * Math.sin(t * 0.7),
        headRoll: 0.02 * Math.sin(t * 0.5 + 1),
      };
    case 'walk': {
      const cycle = t * 2 * Math.PI * 1.6;
      const s = Math.sin(cycle);
      return {
        ...base,
        bob: 0.04 * Math.abs(Math.cos(cycle)),
        lean: 0.08,
        twist: 0.08 * s,
        lLeg: 0.6 * s,
        rLeg: -0.6 * s,
        // arms swing OPPOSITE to each other (never in unison — HARNESS §2 character tells)
        lArm: [-0.48 * s, 0, -0.12],
        rArm: [0.48 * s, 0, 0.12],
        headPitch: 0.03 * Math.sin(cycle * 2),
        headRoll: 0.03 * s,
      };
    }
    case 'point': {
      // right arm raises over 0.35 s (cubic out) and then holds dead still
      const k = easeOut(clamp(frame / (fps * 0.35), 0, 1));
      return {
        ...base,
        bob: 0.01 * sway,
        lean: -0.04 * k,
        twist: -0.18 * k,
        rArm: [0.6 * k, 0, 0.1 * (1 - k) + 2.0 * k],
        lArm: [0.1, 0, -0.14],
        headYaw: -0.1 * k,
        browRaise: 0.5 * k,
        mouthOpen: 0.25 * k,
      };
    }
    case 'shocked': {
      // one hop (a single arc, 0.3 s) + arms thrown up/out in 0.13 s, then a dead-still hold
      const k = easeOut(clamp(frame / (fps * 0.13), 0, 1));
      const jump = Math.sin(clamp(frame / (fps * 0.3), 0, 1) * Math.PI) * 0.12;
      return {
        ...base,
        bob: jump,
        lean: -0.05 * k,
        lArm: [-2.9 * k, 0, -0.95 * k],
        rArm: [-2.9 * k, 0, 0.95 * k],
        lLeg: -0.3 * k * (1 - clamp(frame / (fps * 0.3), 0, 1)),
        rLeg: 0.25 * k * (1 - clamp(frame / (fps * 0.3), 0, 1)),
        headPitch: 0.05 * k,
        browRaise: 1 * k,
        mouthOpen: 1 * k,
      };
    }
    case 'sit':
      // sitting on the ground (picnic): hips lowered to ~0.22 m, legs straight forward, hands
      // planted slightly behind, torso leaning back a touch. Added for the what-if countdown format.
      return {
        ...base,
        bob: -(HIP_Y - LEG.d / 2 - 0.01),
        lean: -0.1,
        lLeg: -1.5,
        rLeg: -1.5,
        lArm: [0.42 + 0.02 * sway, 0, -0.22],
        rArm: [0.42 - 0.02 * sway, 0, 0.22],
        headPitch: 0.04,
        headYaw: 0.05 * Math.sin(t * 0.6),
      };
    case 'phone':
      // right forearm forward + inward: the phone sits in front of the chest; left arm relaxed
      return {
        ...base,
        bob: 0.01 * sway,
        lean: 0.04,
        rArm: [-1.35, 0, -0.45],
        lArm: [0.08 + 0.02 * sway, 0, -0.1],
        headPitch: 0.1,
      };
  }
}

const resolvePose = (pose: Pose | PoseKey[], frame: number, fps: number, seed: number): { rig: Rig; current: Pose } => {
  if (typeof pose === 'string') return { rig: computeRig(pose, frame, fps, seed), current: pose };
  const keys = [...pose].sort((a, b) => a.at - b.at);
  if (!keys.length) return { rig: computeRig('idle', frame, fps, seed), current: 'idle' };
  let idx = 0;
  for (let i = 0; i < keys.length; i++) if (keys[i].at <= frame) idx = i;
  const cur = keys[idx];
  const rig = computeRig(cur.pose, Math.max(0, frame - cur.at), fps, seed);
  const blend = Math.round(POSE_BLEND_SEC * fps);
  const k = frame - cur.at;
  if (idx === 0 || k >= blend || k < 0) return { rig, current: cur.pose };
  const prev = keys[idx - 1];
  const prevRig = computeRig(prev.pose, frame - prev.at, fps, seed);
  return { rig: mixRig(prevRig, rig, easeOut(clamp(k / blend, 0, 1))), current: cur.pose };
};

// =============================================================================
// FACE — mood states + the take
// =============================================================================
type Face = { browRaise: number; browTilt: number; eyeOpen: number; mouthOpen: number; mouthWide: number; mouthY: number; blush: number; sweat: number };

const FACES: Record<Mood, Face> = {
  neutral: { browRaise: 0, browTilt: 0, eyeOpen: 1, mouthOpen: 0, mouthWide: 0.2, mouthY: 0, blush: 0, sweat: 0 },
  worried: { browRaise: 0.35, browTilt: 0.55, eyeOpen: 1, mouthOpen: 0.15, mouthWide: 0, mouthY: -0.02, blush: 0, sweat: 1 },
  shocked: { browRaise: 1, browTilt: 0.2, eyeOpen: 1.25, mouthOpen: 1, mouthWide: 0, mouthY: -0.04, blush: 0, sweat: 0.6 },
  happy: { browRaise: 0.5, browTilt: -0.1, eyeOpen: 0.7, mouthOpen: 0.25, mouthWide: 1, mouthY: 0.01, blush: 1, sweat: 0 },
  asleep: { browRaise: -0.2, browTilt: 0.1, eyeOpen: 0.12, mouthOpen: 0.1, mouthWide: 0, mouthY: 0, blush: 0, sweat: 0 },
};

const mixFace = (a: Face, b: Face, t: number): Face => ({
  browRaise: mix(a.browRaise, b.browRaise, t),
  browTilt: mix(a.browTilt, b.browTilt, t),
  eyeOpen: mix(a.eyeOpen, b.eyeOpen, t),
  mouthOpen: mix(a.mouthOpen, b.mouthOpen, t),
  mouthWide: mix(a.mouthWide, b.mouthWide, t),
  mouthY: mix(a.mouthY, b.mouthY, t),
  blush: mix(a.blush, b.blush, t),
  sweat: mix(a.sweat, b.sweat, t),
});

type Take = { scaleX: number; scaleY: number; headPitch: number };
const NO_TAKE: Take = { scaleX: 1, scaleY: 1, headPitch: 0 };

/**
 * The take, TAKE_SEC long: 0–20 % anticipation (head dips, body stretches, old face on) → 20–40 %
 * squash (y 0.9 / x 1.06, the new face lands at ~42 %) → 40–100 % settle back to 1 with
 * Easing.out(cubic) — no overshoot.
 */
function resolveMood(mood: Mood | MoodKey[] | undefined, frame: number, fps: number): { face: Face; take: Take } {
  if (!mood) return { face: FACES.neutral, take: NO_TAKE };
  if (typeof mood === 'string') return { face: FACES[mood], take: NO_TAKE };
  const keys = [...mood].sort((a, b) => a.at - b.at);
  if (!keys.length) return { face: FACES.neutral, take: NO_TAKE };
  let idx = -1;
  for (let i = 0; i < keys.length; i++) if (keys[i].at <= frame) idx = i;
  if (idx < 0) return { face: FACES[keys[0].mood], take: NO_TAKE };
  const cur = keys[idx];
  const prev = idx > 0 ? keys[idx - 1].mood : null;
  const len = Math.max(6, Math.round(TAKE_SEC * fps));
  const k = frame - cur.at;
  if (prev === null || prev === cur.mood || k >= len) return { face: FACES[cur.mood], take: NO_TAKE };
  const u = k / len;
  const faceT = easeInOut(clamp((u - 0.3) / 0.12, 0, 1));
  const face = mixFace(FACES[prev], FACES[cur.mood], faceT);
  let scaleY = 1;
  let scaleX = 1;
  let headPitch = 0;
  if (u < 0.2) {
    const a = easeInOut(u / 0.2);
    scaleY = 1 + 0.03 * a;
    scaleX = 1 - 0.015 * a;
    headPitch = 0.1 * a;
  } else if (u < 0.4) {
    const a = easeInOut((u - 0.2) / 0.2);
    scaleY = mix(1.03, 0.9, a);
    scaleX = mix(0.985, 1.06, a);
    headPitch = mix(0.1, -0.05, a);
  } else {
    const a = easeOut((u - 0.4) / 0.6);
    scaleY = mix(0.9, 1, a);
    scaleX = mix(1.06, 1, a);
    headPitch = mix(-0.05, 0, a);
  }
  return { face, take: { scaleX, scaleY, headPitch } };
}

// =============================================================================
// COMPONENT
// =============================================================================
export const BlockyCharacter: React.FC<BlockyCharacterProps> = ({
  pose,
  lookAt,
  mood,
  position = [0, 0, 0],
  rotationY = 0,
  seed = 0,
  palette,
  outline = 0.035,
  phoneGlow = 1,
  scale = 1,
  talk = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const P = { ...DEFAULT_PALETTE, ...palette };
  const { rig, current } = resolvePose(pose, frame, fps, seed);
  const { face, take } = resolveMood(mood, frame, fps);

  const lx = lookAt?.[0];
  const ly = lookAt?.[1];
  const lz = lookAt?.[2];
  const look = useMemo(() => {
    if (lx === undefined || ly === undefined || lz === undefined) return { yaw: 0, pitch: 0 };
    const headWorld = new THREE.Vector3(position[0], position[1] + (NECK_Y + HEAD / 2) * scale, position[2]);
    const dir = new THREE.Vector3(lx, ly, lz).sub(headWorld);
    const yaw = Math.atan2(dir.x, dir.z) - rotationY;
    const pitch = -Math.atan2(dir.y, Math.hypot(dir.x, dir.z));
    return { yaw: clamp(yaw, -1.0, 1.0), pitch: clamp(pitch, -0.6, 0.6) };
  }, [lx, ly, lz, position, rotationY, scale]);

  // blink every 3.1 s (seed-shifted), closed for 0.13 s — deterministic in frame
  const blinkPeriod = Math.round(fps * 3.1);
  const bf = (frame + seed * 7 + Math.round(fps * 1.3)) % blinkPeriod;
  const blink = bf < Math.max(2, Math.round(fps * 0.13)) ? 0.12 : 1;
  const eyeOpen = Math.min(blink, face.eyeOpen);
  const eyeScaleY = eyeOpen < 1 ? eyeOpen : 1;
  const eyeScaleXY = Math.max(1, face.eyeOpen);
  const pupilX = clamp(look.yaw * 0.08, -0.04, 0.04);
  const pupilY = clamp(-look.pitch * 0.06, -0.03, 0.03);

  const browRaise = clamp(face.browRaise + rig.browRaise, -0.3, 1.2);
  const mouthOpen = clamp(Math.max(face.mouthOpen, rig.mouthOpen, talk), 0, 1);
  const mouthW = 0.18 + 0.1 * mouthOpen + 0.22 * face.mouthWide;
  const mouthH = 0.04 + 0.22 * mouthOpen;

  const o = outline;
  const oc = P.outline;
  const faceZ = HEAD / 2 + 0.008;
  const browY = HEAD * 0.46 + 0.16 + 0.07 * browRaise;
  const browTilt = 0.45 * face.browTilt;
  const showPhone = current === 'phone' || (Array.isArray(pose) && pose.some((p) => p.pose === 'phone') && rig.rArm[0] < -0.9);
  const glow = clamp(phoneGlow, 0, 1);
  const screen = new THREE.Color(P.phone).lerp(new THREE.Color(P.phoneScreen), glow).getStyle();

  return (
    <group position={[position[0], position[1] + rig.bob * scale, position[2]]} rotation={[0, rotationY, 0]} scale={[scale, scale, scale]}>
      <group scale={[take.scaleX, take.scaleY, take.scaleX]}>
        {/* LEGS (pivot at hip) */}
        {[-1, 1].map((side) => (
          <group key={side} position={[side * (LEG.w / 2 + 0.02), HIP_Y, 0]} rotation={[side < 0 ? rig.lLeg : rig.rLeg, 0, 0]}>
            <Box size={[LEG.w, LEG.h - 0.3, LEG.d]} position={[0, -(LEG.h - 0.3) / 2, 0]} color={P.pants} outline={o} outlineColor={oc} />
            <Box size={[LEG.w + 0.04, 0.3, LEG.d + 0.12]} position={[0, -LEG.h + 0.15, 0.04]} color={P.shoes} outline={o} outlineColor={oc} />
            <Decal size={[LEG.w + 0.05, 0.08]} position={[0, -LEG.h + 0.05, LEG.d / 2 + 0.065]} color={P.shoeSole} />
          </group>
        ))}

        {/* TORSO (pivot at hip) */}
        <group position={[0, HIP_Y, 0]} rotation={[rig.lean, rig.twist, 0]}>
          <group scale={[rig.breathe, 1, rig.breathe]}>
            <Box size={[TORSO.w, TORSO.h, TORSO.d]} position={[0, TORSO.h / 2, 0]} color={P.hoodie} outline={o} outlineColor={oc} />
            <Decal size={[0.6, 0.28]} position={[0, 0.3, TORSO.d / 2 + 0.006]} color={P.hoodieDark} />
            <Decal size={[0.05, 0.4]} position={[-0.14, TORSO.h - 0.3, TORSO.d / 2 + 0.006]} color={P.accent} />
            <Decal size={[0.05, 0.4]} position={[0.14, TORSO.h - 0.3, TORSO.d / 2 + 0.006]} color={P.accent} />
            <QuestionMark x={0.27} y={0.62} z={TORSO.d / 2 + 0.006} s={0.42} color={P.accent} />
          </group>

          {/* ARMS (pivot at shoulder) */}
          <group position={[-(TORSO.w / 2 + ARM.w / 2 + 0.01), SHOULDER_Y - HIP_Y, 0]} rotation={rig.lArm}>
            <Box size={[ARM.w, ARM.h * 0.7, ARM.d]} position={[0, -ARM.h * 0.35, 0]} color={P.hoodie} outline={o} outlineColor={oc} />
            <Box size={[ARM.w - 0.04, ARM.h * 0.3, ARM.d - 0.04]} position={[0, -ARM.h * 0.85, 0]} color={P.skin} outline={o} outlineColor={oc} />
          </group>
          <group position={[TORSO.w / 2 + ARM.w / 2 + 0.01, SHOULDER_Y - HIP_Y, 0]} rotation={rig.rArm}>
            <Box size={[ARM.w, ARM.h * 0.7, ARM.d]} position={[0, -ARM.h * 0.35, 0]} color={P.hoodie} outline={o} outlineColor={oc} />
            <Box size={[ARM.w - 0.04, ARM.h * 0.3, ARM.d - 0.04]} position={[0, -ARM.h * 0.85, 0]} color={P.skin} outline={o} outlineColor={oc} />
            {showPhone ? (
              // phone in the hand; its screen faces up-and-back toward the face
              <group position={[0, -ARM.h * 0.93, 0.16]} rotation={[-0.64, 0, 0]}>
                <Box size={[0.34, 0.58, 0.06]} color={P.phone} outline={o * 0.6} outlineColor={oc} castShadow={false} />
                <mesh position={[0, 0, 0.034]}>
                  <boxGeometry args={[0.29, 0.5, 0.008]} />
                  <meshStandardMaterial color={screen} emissive={P.phoneScreen} emissiveIntensity={1.6 * glow} roughness={0.4} metalness={0} />
                </mesh>
              </group>
            ) : null}
          </group>

          {/* HEAD (pivot at neck) */}
          <group position={[0, NECK_Y - HIP_Y, 0]} rotation={[rig.headPitch + look.pitch + take.headPitch, rig.headYaw + look.yaw, rig.headRoll]}>
            <Box size={[HEAD, HEAD, HEAD]} position={[0, HEAD / 2, 0]} color={P.skin} outline={o} outlineColor={oc} />
            <Box size={[HEAD + 0.06, 0.26, HEAD + 0.06]} position={[0, HEAD - 0.1, 0]} color={P.hair} outline={o} outlineColor={oc} castShadow={false} />
            <Box size={[HEAD + 0.06, 0.16, 0.12]} position={[0, HEAD - 0.31, HEAD / 2 - 0.03]} color={P.hair} outline={o} outlineColor={oc} castShadow={false} />
            <Box size={[0.12, 0.42, HEAD + 0.06]} position={[-(HEAD / 2), HEAD - 0.44, 0]} color={P.hair} outline={o} outlineColor={oc} castShadow={false} />
            <Box size={[0.12, 0.42, HEAD + 0.06]} position={[HEAD / 2, HEAD - 0.44, 0]} color={P.hair} outline={o} outlineColor={oc} castShadow={false} />
            <group scale={[eyeScaleXY, eyeScaleY * eyeScaleXY, 1]} position={[0, HEAD * 0.46, 0]}>
              <Decal size={[0.2, 0.2]} position={[-0.22, 0, faceZ]} color={P.eyeWhite} />
              <Decal size={[0.2, 0.2]} position={[0.22, 0, faceZ]} color={P.eyeWhite} />
              <Decal size={[0.1, 0.12]} position={[-0.22 + pupilX, -0.01 + pupilY, faceZ + 0.006]} color={P.eye} />
              <Decal size={[0.1, 0.12]} position={[0.22 + pupilX, -0.01 + pupilY, faceZ + 0.006]} color={P.eye} />
            </group>
            <Decal size={[0.24, 0.05]} position={[-0.22, browY, faceZ]} color={P.hair} rotationZ={-browTilt} />
            <Decal size={[0.24, 0.05]} position={[0.22, browY, faceZ]} color={P.hair} rotationZ={browTilt} />
            <Decal size={[mouthW, mouthH]} position={[0, HEAD * 0.2 - 0.06 * mouthOpen + face.mouthY, faceZ]} color={P.mouth} />
            {face.blush > 0.05 ? (
              <>
                <Decal size={[0.14 * face.blush, 0.06 * face.blush]} position={[-0.33, HEAD * 0.34, faceZ]} color={P.blush} />
                <Decal size={[0.14 * face.blush, 0.06 * face.blush]} position={[0.33, HEAD * 0.34, faceZ]} color={P.blush} />
              </>
            ) : null}
            {face.sweat > 0.05 ? (
              <Decal size={[0.07 * face.sweat, 0.12 * face.sweat]} position={[0.41, HEAD * 0.6 - 0.06 * face.sweat, faceZ]} color={P.sweat} />
            ) : null}
          </group>
        </group>
      </group>
    </group>
  );
};
