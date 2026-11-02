// "Q" — the Q-ROSITY mascot. An ORIGINAL procedural box-limb humanoid built from <boxGeometry>
// only: no model files, no textures, no third-party assets, no game trademarks. Ported from the
// proven prototype (research/qrosity-character) with the palette taken from brand.ts → QROSITY.
//
// Every rotation, scale and face state is a pure function of useCurrentFrame() (Remotion renders
// frames in parallel tabs; useFrame / clocks / Math.random would flicker). The only hooks are
// useCurrentFrame, useVideoConfig and useMemo.
//
// Units: meters. Origin = between the feet, facing +Z (toward the default camera).
// Proportions (chibi, 4.2 heads tall so the face reads on a phone):
//   head 0.95 cube • torso 0.9w×1.1h×0.5d • arms 0.32w×1.05h • legs 0.4w×0.95h
// Height ≈ 3.1 m, eye line ≈ 2.5 m (see CHARACTER_HEIGHT / CHARACTER_EYE_Y).
import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';
import { QROSITY } from '../../brand';

// =============================================================================
// PUBLIC API
// =============================================================================

/** Body pose. Ramps (point, shocked) start at LOCAL frame 0 of the enclosing <Sequence>. */
export type Pose = 'idle' | 'walk' | 'point' | 'shocked';

/** Facial mood. Changes between keyed moods always go through a "take" (never a snap). */
export type Mood = 'neutral' | 'worried' | 'shocked' | 'happy' | 'asleep';

/** A mood key: `at` is the LOCAL frame the take toward `mood` begins. */
export type MoodKey = { at: number; mood: Mood };

export type BlockyCharacterProps = {
  pose: Pose;
  /**
   * LOCAL frame at which `pose` starts (its ramp runs from there). Before it, `prevPose` plays.
   * Lets a beat cut TO `point`/`shocked` on a VO word instead of at the Sequence start.
   */
  poseAt?: number;
  prevPose?: Pose;
  /** World-space point the head looks at (clamped to a natural range). */
  lookAt?: [number, number, number];
  /**
   * Mood timeline (local frames). A single Mood is a constant face; an array of keys plays a take
   * (anticipation → squash → new face → settle, TAKE_FRAMES long) at each key's `at`. Keys with
   * `at <= 0` are already landed on local frame 0.
   */
  mood?: Mood | MoodKey[];
  /** Position of the character (feet center). */
  position?: [number, number, number];
  /** Yaw in radians (0 = facing +Z toward the default camera). */
  rotationY?: number;
  /** Frame offset so two characters don't move in sync. */
  seed?: number;
  /** Override palette. */
  palette?: Partial<Palette>;
  /** Outline thickness in meters (0 disables the inverted-hull outline). */
  outline?: number;
};

/** Character colours, derived from the Q-ROSITY brand palette (brand.md §6 mirrors these). */
export const DEFAULT_PALETTE = {
  skin: '#F0C090',
  hair: '#2A1F2E',
  hoodie: QROSITY.accent, // electric purple
  hoodieDark: '#4F22C9', // pocket, one step darker than accent
  accent: QROSITY.glow, // sunshine yellow: drawstrings, "?" emblem, shoe soles
  pants: QROSITY.text, // near-black navy
  shoes: QROSITY.panel, // white sneakers
  shoeSole: QROSITY.glow,
  eye: '#15192B',
  eyeWhite: '#FFFFFF',
  mouth: '#7A2E3A',
  blush: '#FF8A9A',
  sweat: '#9FDBFF',
  outline: '#15192B',
};
export type Palette = typeof DEFAULT_PALETTE;

/** Length of a mood take in frames at 60 fps (anticipation 6 → squash 6 → new face → settle 18). */
export const TAKE_FRAMES = 30;

// =============================================================================
// DIMENSIONS
// =============================================================================
const HEAD = 0.95;
const TORSO = { w: 0.9, h: 1.1, d: 0.5 };
const ARM = { w: 0.32, h: 1.05, d: 0.32 };
const LEG = { w: 0.4, h: 0.95, d: 0.42 };
const HIP_Y = LEG.h; // top of legs
const SHOULDER_Y = HIP_Y + TORSO.h - 0.08;
const NECK_Y = HIP_Y + TORSO.h;

/** Height of the character's eye line, useful for camera framing. */
export const CHARACTER_EYE_Y = NECK_Y + HEAD * 0.5;
export const CHARACTER_HEIGHT = NECK_Y + HEAD + 0.1;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => t * t * (3 - 2 * t);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// =============================================================================
// PRIMITIVES
// =============================================================================

/** Box with an inverted-hull outline (a slightly larger BackSide box in the outline colour). */
const Box: React.FC<{
  size: [number, number, number];
  position?: [number, number, number];
  color: string;
  outline: number;
  outlineColor: string;
  castShadow?: boolean;
  roughness?: number;
}> = ({ size, position = [0, 0, 0], color, outline, outlineColor, castShadow = true, roughness = 0.85 }) => (
  <group position={position}>
    <mesh castShadow={castShadow} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={0} />
    </mesh>
    {outline > 0 ? (
      <mesh scale={[1 + outline / size[0], 1 + outline / size[1], 1 + outline / size[2]]}>
        <boxGeometry args={size} />
        <meshBasicMaterial color={outlineColor} side={THREE.BackSide} />
      </mesh>
    ) : null}
  </group>
);

/** Flat decal: a 12 mm-thin box pushed 6–8 mm off a face so it never z-fights. */
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

/** A "?" built from 5 boxes. (x,y) = center; s = glyph height. */
const QuestionMark: React.FC<{ x: number; y: number; z: number; s: number; color: string }> = ({ x, y, z, s, color }) => {
  const t = s * 0.16; // stroke
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
type Rig = {
  bob: number; // body vertical offset
  lean: number; // torso pitch
  twist: number; // torso yaw
  lArm: [number, number, number]; // rotation xyz at shoulder
  rArm: [number, number, number];
  lLeg: number; // rotation x at hip
  rLeg: number;
  headPitch: number;
  headYaw: number;
  headRoll: number;
  browRaise: number; // 0..1 (pose contribution, added to the mood face)
  mouthOpen: number; // 0..1 (pose contribution)
  breathe: number; // torso scale pulse
};

function computeRig(pose: Pose, frame: number, fps: number, seed: number): Rig {
  const t = (frame + seed) / fps; // seconds
  const breathe = 1 + 0.015 * Math.sin(t * 2 * Math.PI * 0.35);
  const base: Rig = {
    bob: 0,
    lean: 0,
    twist: 0,
    // Sign rule: outward = NEGATIVE z for the left arm (at -x), POSITIVE z for the right arm.
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
    case 'idle': {
      const sway = Math.sin(t * 2 * Math.PI * 0.35);
      return {
        ...base,
        bob: 0.01 * sway,
        lArm: [0.06 + 0.03 * sway, 0, -0.1],
        rArm: [0.06 - 0.03 * sway, 0, 0.1],
        headYaw: 0.05 * Math.sin(t * 0.7),
        headRoll: 0.02 * Math.sin(t * 0.5 + 1),
      };
    }
    case 'walk': {
      const cycle = t * 2 * Math.PI * 1.6; // 1.6 steps/sec
      const s = Math.sin(cycle);
      const swing = 0.6;
      return {
        ...base,
        bob: 0.04 * Math.abs(Math.cos(cycle)),
        lean: 0.08,
        twist: 0.08 * s,
        lLeg: swing * s,
        rLeg: -swing * s,
        lArm: [-swing * 0.8 * s, 0, -0.12],
        rArm: [swing * 0.8 * s, 0, 0.12],
        headPitch: 0.03 * Math.sin(cycle * 2),
        headRoll: 0.03 * s,
      };
    }
    case 'point': {
      // Right arm raises over 0.35 s, then holds with a slight tremor.
      const k = smooth(clamp(frame / (fps * 0.35), 0, 1));
      const hold = 0.02 * Math.sin(t * 9);
      return {
        ...base,
        lean: -0.04 * k,
        twist: -0.18 * k,
        // Euler XYZ = Rx(Ry(Rz(v))): z swings the arm outward+up first, then +x tilts it forward.
        // Result ≈ (0.9, 0.35, 0.25): up-right-forward, never foreshortened into a fist at the lens.
        rArm: [0.6 * k + hold, 0, -0.1 * (1 - k) + 2.0 * k],
        lArm: [0.1, 0, -0.14],
        headYaw: -0.1 * k,
        browRaise: 0.5 * k,
        mouthOpen: 0.25 * k,
      };
    }
    case 'shocked': {
      // Jump back + arms up in 8 frames, then settle with a hold.
      const k = smooth(clamp(frame / (fps * 0.13), 0, 1));
      const settle = Math.exp(-frame / (fps * 0.4)) * Math.sin(frame * 0.9);
      const jump = Math.sin(clamp(frame / (fps * 0.3), 0, 1) * Math.PI) * 0.12;
      return {
        ...base,
        bob: jump,
        lean: -0.05 * k + 0.03 * settle,
        // Arms thrown up+out: reads as "shock", never covers the face, and the span (≈ 2.9 m)
        // stays inside the 9:16 frame at ≥ 8 m camera distance (z ±1.1 clipped the hands).
        lArm: [-2.9 * k, 0, -0.95 * k],
        rArm: [-2.9 * k, 0, 0.95 * k],
        lLeg: -0.3 * k,
        rLeg: 0.25 * k,
        headPitch: 0.05 * k, // chin slightly down: a low camera must never see the head's underside
        browRaise: 1 * k,
        mouthOpen: 1 * k,
      };
    }
  }
}

// =============================================================================
// FACE — mood states + the "take"
// =============================================================================
type Face = {
  browRaise: number; // 0..1 brows up
  browTilt: number; // + = inner ends up (worried), - = inner ends down (angry)
  eyeOpen: number; // 0..1 (1 = round, 0.12 = closed)
  mouthOpen: number; // 0..1 tall "O"
  mouthWide: number; // 0..1 wide bar (smile)
  mouthY: number; // vertical offset (m)
  blush: number; // 0..1
  sweat: number; // 0..1 a drop on the temple
};

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

/** Body deformation during a take: squash/stretch about the feet + a head dip. */
type Take = { scaleX: number; scaleY: number; headPitch: number; bob: number };
const NO_TAKE: Take = { scaleX: 1, scaleY: 1, headPitch: 0, bob: 0 };

/**
 * Resolve the face + body deformation for a mood timeline at a local frame.
 * The take (30 frames @ 60 fps, scaled by fps):
 *   0–20 %  anticipation: head dips, body stretches up a touch, old face still on
 *   20–40 % squash: body squashes (y 0.88, x 1.08), the new face lands mid-squash
 *   40–100 % settle: decaying overshoot back to 1, new face holds
 */
function resolveMood(mood: Mood | MoodKey[] | undefined, frame: number, fps: number): { face: Face; take: Take } {
  if (!mood) return { face: FACES.neutral, take: NO_TAKE };
  if (typeof mood === 'string') return { face: FACES[mood], take: NO_TAKE };
  const keys = [...mood].sort((a, b) => a.at - b.at);
  if (keys.length === 0) return { face: FACES.neutral, take: NO_TAKE };
  let idx = -1;
  for (let i = 0; i < keys.length; i++) if (keys[i].at <= frame) idx = i;
  if (idx < 0) return { face: FACES[keys[0].mood], take: NO_TAKE };
  const cur = keys[idx];
  const prev = idx > 0 ? keys[idx - 1].mood : null;
  const len = Math.round((TAKE_FRAMES * fps) / 60);
  const k = frame - cur.at;
  if (prev === null || prev === cur.mood || k >= len) return { face: FACES[cur.mood], take: NO_TAKE };
  const u = k / len; // 0..1 through the take
  // face: old until 30 %, blends to new over 30–42 % (lands mid-squash)
  const faceT = smooth(clamp((u - 0.3) / 0.12, 0, 1));
  const face = mixFace(FACES[prev], FACES[cur.mood], faceT);
  // body
  let scaleY = 1;
  let scaleX = 1;
  let headPitch = 0;
  let bob = 0;
  if (u < 0.2) {
    const a = smooth(u / 0.2);
    scaleY = 1 + 0.04 * a; // anticipation: stretch up
    scaleX = 1 - 0.02 * a;
    headPitch = 0.12 * a; // dip
  } else if (u < 0.4) {
    const a = smooth((u - 0.2) / 0.2);
    scaleY = mix(1.04, 0.88, a); // squash
    scaleX = mix(0.98, 1.08, a);
    headPitch = mix(0.12, -0.06, a);
  } else {
    const a = (u - 0.4) / 0.6;
    const wob = Math.exp(-a * 4) * Math.sin(a * Math.PI * 2.5); // decaying overshoot
    scaleY = 1 + 0.12 * wob;
    scaleX = 1 - 0.06 * wob;
    headPitch = -0.06 * Math.exp(-a * 5);
    bob = 0.03 * Math.max(0, wob);
  }
  return { face, take: { scaleX, scaleY, headPitch, bob } };
}

// =============================================================================
// COMPONENT
// =============================================================================
export const BlockyCharacter: React.FC<BlockyCharacterProps> = ({
  pose,
  poseAt = 0,
  prevPose = 'idle',
  lookAt,
  mood,
  position = [0, 0, 0],
  rotationY = 0,
  seed = 0,
  palette,
  outline = 0.035,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const P = { ...DEFAULT_PALETTE, ...palette };
  const rig = frame < poseAt ? computeRig(prevPose, frame, fps, seed) : computeRig(pose, frame - poseAt, fps, seed);
  const { face, take } = resolveMood(mood, frame, fps);

  // Head look-at: convert world target to local yaw/pitch, clamp to natural range.
  const look = useMemo(() => {
    if (!lookAt) return { yaw: 0, pitch: 0 };
    const headWorld = new THREE.Vector3(position[0], position[1] + NECK_Y + HEAD / 2, position[2]);
    const dir = new THREE.Vector3(...lookAt).sub(headWorld);
    const yaw = Math.atan2(dir.x, dir.z) - rotationY;
    const pitch = -Math.atan2(dir.y, Math.hypot(dir.x, dir.z));
    return { yaw: clamp(yaw, -1.0, 1.0), pitch: clamp(pitch, -0.6, 0.6) };
  }, [lookAt, position, rotationY]);

  // Blink: every ~3.1 s (seed-shifted), closed for 4 frames. Deterministic in frame.
  const blinkPeriod = Math.round(fps * 3.1);
  const bf = (frame + seed * 7 + Math.round(fps * 1.3)) % blinkPeriod;
  const blink = bf < 4 ? 0.12 : 1;
  const eyeOpen = Math.min(blink, face.eyeOpen);
  const eyeScaleY = eyeOpen < 1 ? eyeOpen : 1;
  const eyeScaleXY = Math.max(1, face.eyeOpen); // shocked: eyes grow round
  const pupilX = clamp(look.yaw * 0.08, -0.04, 0.04);
  const pupilY = clamp(-look.pitch * 0.06, -0.03, 0.03);

  const browRaise = clamp(face.browRaise + rig.browRaise, -0.3, 1.2);
  const mouthOpen = clamp(Math.max(face.mouthOpen, rig.mouthOpen), 0, 1);
  const mouthW = 0.18 + 0.1 * mouthOpen + 0.22 * face.mouthWide;
  const mouthH = 0.04 + 0.22 * mouthOpen;

  const o = outline;
  const oc = P.outline;
  const faceZ = HEAD / 2 + 0.008; // decals sit 8 mm in front of the face
  const browY = HEAD * 0.46 + 0.16 + 0.07 * browRaise;
  const browTilt = 0.45 * face.browTilt; // radians, inner ends up when positive

  return (
    <group position={[position[0], position[1] + rig.bob + take.bob, position[2]]} rotation={[0, rotationY, 0]}>
      {/* take squash/stretch is about the feet */}
      <group scale={[take.scaleX, take.scaleY, take.scaleX]}>
        {/* LEGS: pivot at hip */}
        <group position={[-LEG.w / 2 - 0.02, HIP_Y, 0]} rotation={[rig.lLeg, 0, 0]}>
          <Box size={[LEG.w, LEG.h - 0.3, LEG.d]} position={[0, -(LEG.h - 0.3) / 2, 0]} color={P.pants} outline={o} outlineColor={oc} />
          <Box size={[LEG.w + 0.04, 0.3, LEG.d + 0.12]} position={[0, -LEG.h + 0.15, 0.04]} color={P.shoes} outline={o} outlineColor={oc} />
          <Decal size={[LEG.w + 0.05, 0.08]} position={[0, -LEG.h + 0.05, LEG.d / 2 + 0.065]} color={P.shoeSole} />
        </group>
        <group position={[LEG.w / 2 + 0.02, HIP_Y, 0]} rotation={[rig.rLeg, 0, 0]}>
          <Box size={[LEG.w, LEG.h - 0.3, LEG.d]} position={[0, -(LEG.h - 0.3) / 2, 0]} color={P.pants} outline={o} outlineColor={oc} />
          <Box size={[LEG.w + 0.04, 0.3, LEG.d + 0.12]} position={[0, -LEG.h + 0.15, 0.04]} color={P.shoes} outline={o} outlineColor={oc} />
          <Decal size={[LEG.w + 0.05, 0.08]} position={[0, -LEG.h + 0.05, LEG.d / 2 + 0.065]} color={P.shoeSole} />
        </group>

        {/* TORSO: pivot at hip, breathing scale */}
        <group position={[0, HIP_Y, 0]} rotation={[rig.lean, rig.twist, 0]}>
          <group scale={[rig.breathe, 1, rig.breathe]}>
            <Box size={[TORSO.w, TORSO.h, TORSO.d]} position={[0, TORSO.h / 2, 0]} color={P.hoodie} outline={o} outlineColor={oc} />
            {/* hoodie pocket + drawstrings + "?" emblem */}
            <Decal size={[0.6, 0.28]} position={[0, 0.3, TORSO.d / 2 + 0.006]} color={P.hoodieDark} />
            <Decal size={[0.05, 0.4]} position={[-0.14, TORSO.h - 0.3, TORSO.d / 2 + 0.006]} color={P.accent} />
            <Decal size={[0.05, 0.4]} position={[0.14, TORSO.h - 0.3, TORSO.d / 2 + 0.006]} color={P.accent} />
            <QuestionMark x={0.27} y={0.62} z={TORSO.d / 2 + 0.006} s={0.42} color={P.accent} />
          </group>

          {/* ARMS: pivot at shoulder (top of arm) */}
          <group position={[-(TORSO.w / 2 + ARM.w / 2 + 0.01), SHOULDER_Y - HIP_Y, 0]} rotation={rig.lArm}>
            <Box size={[ARM.w, ARM.h * 0.7, ARM.d]} position={[0, -ARM.h * 0.35, 0]} color={P.hoodie} outline={o} outlineColor={oc} />
            <Box size={[ARM.w - 0.04, ARM.h * 0.3, ARM.d - 0.04]} position={[0, -ARM.h * 0.85, 0]} color={P.skin} outline={o} outlineColor={oc} />
          </group>
          <group position={[TORSO.w / 2 + ARM.w / 2 + 0.01, SHOULDER_Y - HIP_Y, 0]} rotation={rig.rArm}>
            <Box size={[ARM.w, ARM.h * 0.7, ARM.d]} position={[0, -ARM.h * 0.35, 0]} color={P.hoodie} outline={o} outlineColor={oc} />
            <Box size={[ARM.w - 0.04, ARM.h * 0.3, ARM.d - 0.04]} position={[0, -ARM.h * 0.85, 0]} color={P.skin} outline={o} outlineColor={oc} />
          </group>

          {/* HEAD: pivot at neck */}
          <group position={[0, NECK_Y - HIP_Y, 0]} rotation={[rig.headPitch + look.pitch + take.headPitch, rig.headYaw + look.yaw, rig.headRoll]}>
            <Box size={[HEAD, HEAD, HEAD]} position={[0, HEAD / 2, 0]} color={P.skin} outline={o} outlineColor={oc} />
            {/* hair: cap, front fringe, side locks (all above the eye line: >= 0.62·HEAD) */}
            <Box size={[HEAD + 0.06, 0.26, HEAD + 0.06]} position={[0, HEAD - 0.1, 0]} color={P.hair} outline={o} outlineColor={oc} castShadow={false} />
            <Box size={[HEAD + 0.06, 0.16, 0.12]} position={[0, HEAD - 0.31, HEAD / 2 - 0.03]} color={P.hair} outline={o} outlineColor={oc} castShadow={false} />
            <Box size={[0.12, 0.42, HEAD + 0.06]} position={[-(HEAD / 2), HEAD - 0.44, 0]} color={P.hair} outline={o} outlineColor={oc} castShadow={false} />
            <Box size={[0.12, 0.42, HEAD + 0.06]} position={[HEAD / 2, HEAD - 0.44, 0]} color={P.hair} outline={o} outlineColor={oc} castShadow={false} />

            {/* eyes: white + pupil (pupils offset toward look direction), blink = squash */}
            <group scale={[eyeScaleXY, eyeScaleY * eyeScaleXY, 1]} position={[0, HEAD * 0.46, 0]}>
              <Decal size={[0.2, 0.2]} position={[-0.22, 0, faceZ]} color={P.eyeWhite} />
              <Decal size={[0.2, 0.2]} position={[0.22, 0, faceZ]} color={P.eyeWhite} />
              <Decal size={[0.1, 0.12]} position={[-0.22 + pupilX, -0.01 + pupilY, faceZ + 0.006]} color={P.eye} />
              <Decal size={[0.1, 0.12]} position={[0.22 + pupilX, -0.01 + pupilY, faceZ + 0.006]} color={P.eye} />
            </group>
            {/* brows: raise with emotion, tilt for worry */}
            <Decal size={[0.24, 0.05]} position={[-0.22, browY, faceZ]} color={P.hair} rotationZ={-browTilt} />
            <Decal size={[0.24, 0.05]} position={[0.22, browY, faceZ]} color={P.hair} rotationZ={browTilt} />
            {/* mouth */}
            <Decal size={[mouthW, mouthH]} position={[0, HEAD * 0.2 - 0.06 * mouthOpen + face.mouthY, faceZ]} color={P.mouth} />
            {/* blush */}
            {face.blush > 0.05 ? (
              <>
                <Decal size={[0.14 * face.blush, 0.06 * face.blush]} position={[-0.33, HEAD * 0.34, faceZ]} color={P.blush} />
                <Decal size={[0.14 * face.blush, 0.06 * face.blush]} position={[0.33, HEAD * 0.34, faceZ]} color={P.blush} />
              </>
            ) : null}
            {/* sweat drop at the right temple, on the face plane (slides down a little as it grows) */}
            {face.sweat > 0.05 ? (
              <Decal size={[0.07 * face.sweat, 0.12 * face.sweat]} position={[0.41, HEAD * 0.6 - 0.06 * face.sweat, faceZ]} color={P.sweat} />
            ) : null}
          </group>
        </group>
      </group>
    </group>
  );
};
