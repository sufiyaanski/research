import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";

/**
 * "Q" — the Q-ROSITY mascot. An ORIGINAL procedural box-limb humanoid.
 * No external assets. Every rotation is a pure function of `frame`, so renders are
 * deterministic (Remotion renders frames in parallel tabs; never use clocks/useFrame).
 *
 * Units: meters. Origin = between the feet, facing +Z.
 * Proportions (chibi, 4.2 heads tall so the face reads on a phone):
 *   head 0.95 cube • torso 0.9w×1.1h×0.5d • arms 0.32w×1.05h • legs 0.4w×0.95h
 */

export type Pose = "idle" | "walk" | "point" | "shocked";

export type BlockyCharacterProps = {
  pose: Pose;
  /** World-space point the head looks at (clamped to a natural range). */
  lookAt?: [number, number, number];
  /** Position of the character (feet center). */
  position?: [number, number, number];
  /** Yaw in radians (0 = facing +Z toward the default camera). */
  rotationY?: number;
  /** Frame offset so two characters don't move in sync. */
  seed?: number;
  /** Override palette. */
  palette?: Partial<typeof DEFAULT_PALETTE>;
  /** Outline thickness in meters (0 disables the inverted-hull outline). */
  outline?: number;
};

export const DEFAULT_PALETTE = {
  skin: "#e8b48a",
  hair: "#2a1f1e",
  hoodie: "#1fb6a6", // teal hoodie
  hoodieDark: "#15857a",
  accent: "#ff7a1a", // orange drawstrings / emblem
  pants: "#2b2f4a",
  shoes: "#f4f1ea",
  shoeSole: "#ff7a1a",
  eye: "#1a1a1a",
  eyeWhite: "#ffffff",
  mouth: "#7a2e2e",
  outline: "#101418",
};

// Dimensions
const HEAD = 0.95;
const TORSO = { w: 0.9, h: 1.1, d: 0.5 };
const ARM = { w: 0.32, h: 1.05, d: 0.32 };
const LEG = { w: 0.4, h: 0.95, d: 0.42 };
const HIP_Y = LEG.h; // top of legs
const SHOULDER_Y = HIP_Y + TORSO.h - 0.08;
const NECK_Y = HIP_Y + TORSO.h;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

/** Box with an inverted-hull outline (a slightly larger BackSide black box). */
const Box: React.FC<{
  size: [number, number, number];
  position?: [number, number, number];
  color: string;
  outline: number;
  castShadow?: boolean;
  roughness?: number;
}> = ({ size, position = [0, 0, 0], color, outline, castShadow = true, roughness = 0.85 }) => {
  return (
    <group position={position}>
      <mesh castShadow={castShadow} receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={roughness} metalness={0} />
      </mesh>
      {outline > 0 ? (
        <mesh scale={[1 + outline / size[0], 1 + outline / size[1], 1 + outline / size[2]]}>
          <boxGeometry args={size} />
          <meshBasicMaterial color={DEFAULT_PALETTE.outline} side={THREE.BackSide} />
        </mesh>
      ) : null}
    </group>
  );
};

/** Flat decal: a 12 mm-thin box pushed 6–8 mm off a face so it never z-fights. */
const Decal: React.FC<{
  size: [number, number];
  position: [number, number, number];
  color: string;
}> = ({ size, position, color }) => (
  <mesh position={position}>
    <boxGeometry args={[size[0], size[1], 0.012]} />
    <meshStandardMaterial color={color} roughness={1} metalness={0} />
  </mesh>
);


/** A "?" built from 5 boxes. (x,y) = center; s = glyph height. */
const QuestionMark: React.FC<{ x: number; y: number; z: number; s: number; color: string }> = ({ x, y, z, s, color }) => {
  const t = s * 0.16; // stroke
  return (
    <group position={[x, y, z]}>
      <Decal size={[s * 0.6, t]} position={[0, s * 0.42, 0]} color={color} />          {/* top bar */}
      <Decal size={[t, s * 0.34]} position={[s * 0.3 - t / 2, s * 0.22, 0]} color={color} /> {/* right side */}
      <Decal size={[s * 0.45, t]} position={[s * 0.08, s * 0.05, 0]} color={color} />      {/* middle bar */}
      <Decal size={[t, s * 0.22]} position={[0, -s * 0.1, 0]} color={color} />            {/* stem */}
      <Decal size={[t * 1.1, t * 1.1]} position={[0, -s * 0.42, 0]} color={color} />      {/* dot */}
    </group>
  );
};

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
  browRaise: number; // 0..1
  mouthOpen: number; // 0..1
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
    case "idle": {
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
    case "walk": {
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
    case "point": {
      // Right arm raises over 0.35 s, then holds with a slight tremor.
      const k = smooth(clamp((frame - 0) / (fps * 0.35), 0, 1));
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
    case "shocked": {
      // Jump back + arms up in 8 frames, then settle with a hold.
      const k = smooth(clamp(frame / (fps * 0.13), 0, 1));
      const settle = Math.exp(-frame / (fps * 0.4)) * Math.sin(frame * 0.9);
      const jump = Math.sin(clamp(frame / (fps * 0.3), 0, 1) * Math.PI) * 0.12;
      return {
        ...base,
        bob: jump,
        lean: -0.05 * k + 0.03 * settle,
        // Arms thrown out+up (≈ (0.9, 0.45, 0.1)): reads as "shock" and never covers the face.
        lArm: [-2.9 * k, 0, -1.1 * k],
        rArm: [-2.9 * k, 0, 1.1 * k],
        lLeg: -0.3 * k,
        rLeg: 0.25 * k,
        headPitch: 0.05 * k, // chin slightly down: a low camera must never see the head's underside
        browRaise: 1 * k,
        mouthOpen: 1 * k,
      };
    }
  }
}

export const BlockyCharacter: React.FC<BlockyCharacterProps> = ({
  pose,
  lookAt,
  position = [0, 0, 0],
  rotationY = 0,
  seed = 0,
  palette,
  outline = 0.035,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const P = { ...DEFAULT_PALETTE, ...palette };
  const rig = computeRig(pose, frame, fps, seed);

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
  const pupilX = clamp(look.yaw * 0.08, -0.04, 0.04);
  const pupilY = clamp(-look.pitch * 0.06, -0.03, 0.03);

  const o = outline;
  const faceZ = HEAD / 2 + 0.008; // decals sit 8 mm in front of the face

  return (
    <group position={[position[0], position[1] + rig.bob, position[2]]} rotation={[0, rotationY, 0]}>
      {/* LEGS: pivot at hip */}
      <group position={[-LEG.w / 2 - 0.02, HIP_Y, 0]} rotation={[rig.lLeg, 0, 0]}>
        <Box size={[LEG.w, LEG.h - 0.3, LEG.d]} position={[0, -(LEG.h - 0.3) / 2, 0]} color={P.pants} outline={o} />
        <Box size={[LEG.w + 0.04, 0.3, LEG.d + 0.12]} position={[0, -LEG.h + 0.15, 0.04]} color={P.shoes} outline={o} />
        <Decal size={[LEG.w + 0.05, 0.08]} position={[0, -LEG.h + 0.05, LEG.d / 2 + 0.065]} color={P.shoeSole} />
      </group>
      <group position={[LEG.w / 2 + 0.02, HIP_Y, 0]} rotation={[rig.rLeg, 0, 0]}>
        <Box size={[LEG.w, LEG.h - 0.3, LEG.d]} position={[0, -(LEG.h - 0.3) / 2, 0]} color={P.pants} outline={o} />
        <Box size={[LEG.w + 0.04, 0.3, LEG.d + 0.12]} position={[0, -LEG.h + 0.15, 0.04]} color={P.shoes} outline={o} />
        <Decal size={[LEG.w + 0.05, 0.08]} position={[0, -LEG.h + 0.05, LEG.d / 2 + 0.065]} color={P.shoeSole} />
      </group>

      {/* TORSO: pivot at hip, breathing scale */}
      <group position={[0, HIP_Y, 0]} rotation={[rig.lean, rig.twist, 0]}>
        <group scale={[rig.breathe, 1, rig.breathe]}>
          <Box size={[TORSO.w, TORSO.h, TORSO.d]} position={[0, TORSO.h / 2, 0]} color={P.hoodie} outline={o} />
          {/* hoodie pocket + drawstrings + "?" emblem */}
          <Decal size={[0.6, 0.28]} position={[0, 0.3, TORSO.d / 2 + 0.006]} color={P.hoodieDark} />
          <Decal size={[0.05, 0.4]} position={[-0.14, TORSO.h - 0.3, TORSO.d / 2 + 0.006]} color={P.accent} />
          <Decal size={[0.05, 0.4]} position={[0.14, TORSO.h - 0.3, TORSO.d / 2 + 0.006]} color={P.accent} />
          <QuestionMark x={0.27} y={0.62} z={TORSO.d / 2 + 0.006} s={0.42} color={P.accent} />
        </group>

        {/* ARMS: pivot at shoulder (top of arm) */}
        <group position={[-(TORSO.w / 2 + ARM.w / 2 + 0.01), SHOULDER_Y - HIP_Y, 0]} rotation={rig.lArm}>
          <Box size={[ARM.w, ARM.h * 0.7, ARM.d]} position={[0, -ARM.h * 0.35, 0]} color={P.hoodie} outline={o} />
          <Box size={[ARM.w - 0.04, ARM.h * 0.3, ARM.d - 0.04]} position={[0, -ARM.h * 0.85, 0]} color={P.skin} outline={o} />
        </group>
        <group position={[TORSO.w / 2 + ARM.w / 2 + 0.01, SHOULDER_Y - HIP_Y, 0]} rotation={rig.rArm}>
          <Box size={[ARM.w, ARM.h * 0.7, ARM.d]} position={[0, -ARM.h * 0.35, 0]} color={P.hoodie} outline={o} />
          <Box size={[ARM.w - 0.04, ARM.h * 0.3, ARM.d - 0.04]} position={[0, -ARM.h * 0.85, 0]} color={P.skin} outline={o} />
        </group>

        {/* HEAD: pivot at neck */}
        <group
          position={[0, NECK_Y - HIP_Y, 0]}
          rotation={[rig.headPitch + look.pitch, rig.headYaw + look.yaw, rig.headRoll]}
        >
          <Box size={[HEAD, HEAD, HEAD]} position={[0, HEAD / 2, 0]} color={P.skin} outline={o} />
          {/* hair: cap, front fringe, side locks (all above the eye line) */}
          <Box size={[HEAD + 0.06, 0.26, HEAD + 0.06]} position={[0, HEAD - 0.1, 0]} color={P.hair} outline={o} castShadow={false} />
          <Box size={[HEAD + 0.06, 0.16, 0.12]} position={[0, HEAD - 0.31, HEAD / 2 - 0.03]} color={P.hair} outline={o} castShadow={false} />
          <Box size={[0.12, 0.42, HEAD + 0.06]} position={[-(HEAD / 2), HEAD - 0.44, 0]} color={P.hair} outline={o} castShadow={false} />
          <Box size={[0.12, 0.42, HEAD + 0.06]} position={[HEAD / 2, HEAD - 0.44, 0]} color={P.hair} outline={o} castShadow={false} />

          {/* eyes: white + pupil (pupils offset toward look direction), blink = squash */}
          <group scale={[1, blink, 1]} position={[0, HEAD * 0.46, 0]}>
            <Decal size={[0.2, 0.2]} position={[-0.22, 0, faceZ]} color={P.eyeWhite} />
            <Decal size={[0.2, 0.2]} position={[0.22, 0, faceZ]} color={P.eyeWhite} />
            <Decal size={[0.1, 0.12]} position={[-0.22 + pupilX, -0.01 + pupilY, faceZ + 0.006]} color={P.eye} />
            <Decal size={[0.1, 0.12]} position={[0.22 + pupilX, -0.01 + pupilY, faceZ + 0.006]} color={P.eye} />
          </group>
          {/* brows: raise with emotion */}
          <Decal size={[0.24, 0.05]} position={[-0.22, HEAD * 0.46 + 0.16 + 0.07 * rig.browRaise, faceZ]} color={P.hair} />
          <Decal size={[0.24, 0.05]} position={[0.22, HEAD * 0.46 + 0.16 + 0.07 * rig.browRaise, faceZ]} color={P.hair} />
          {/* mouth */}
          <Decal
            size={[0.18 + 0.1 * rig.mouthOpen, 0.04 + 0.2 * rig.mouthOpen]}
            position={[0, HEAD * 0.2 - 0.06 * rig.mouthOpen, faceZ]}
            color={P.mouth}
          />
        </group>
      </group>
    </group>
  );
};

/** Height of the character's eye line, useful for camera framing. */
export const CHARACTER_EYE_Y = NECK_Y + HEAD * 0.5;
export const CHARACTER_HEIGHT = NECK_Y + HEAD + 0.1;
