import React, { useLayoutEffect, useMemo, useRef } from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { z } from "zod";
import { BlockyCharacter, type Pose } from "./BlockyCharacter";

export const sceneSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  /** "auto" plays the 4-beat demo timeline: idle → walk → point → shocked. */
  pose: z.enum(["auto", "idle", "walk", "point", "shocked"]),
});
export type SceneProps = z.infer<typeof sceneSchema>;

/**
 * Camera driven purely by frame: slow push-in + 12° orbit, low angle for drama.
 * Setting the camera inside useLayoutEffect (keyed on frame) is deterministic:
 * ThreeCanvas re-renders the scene once per Remotion frame.
 */
const CameraRig: React.FC<{ target: [number, number, number] }> = ({ target }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;

  const t = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  // 9:16 framing: vertical fov 36° at 9.5 m shows ~6.2 m of height, so the 3.3 m character
  // takes ~55% of the frame at the start and ~70% after the push-in.
  const radius = interpolate(t, [0, 1], [9.2, 7.0]); // slow push-in
  const angle = interpolate(t, [0, 1], [-0.3, -0.08]); // orbit ~12.6°
  const height = interpolate(t, [0, 1], [1.6, 1.9]); // just below the eye line = slight hero angle

  useLayoutEffect(() => {
    camera.position.set(Math.sin(angle) * radius, height, Math.cos(angle) * radius);
    camera.lookAt(target[0], target[1], target[2]);
    camera.fov = 36; // vertical fov; in 9:16 the horizontal half-angle is only ~10°
    camera.near = 0.1;
    camera.far = 100;
    camera.updateProjectionMatrix();
  }, [camera, angle, radius, height, target, frame]);

  return null;
};

/** Ground: a dark plane plus a loose grid of slightly raised tiles for parallax. */
const Ground: React.FC = () => {
  const tiles = useMemo(() => {
    const out: { x: number; z: number; c: string; h: number }[] = [];
    let s = 1;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647); // deterministic
    for (let i = -6; i <= 6; i++) {
      for (let j = -6; j <= 6; j++) {
        const r = rnd();
        if (r < 0.22) {
          const shade = 0.78 + rnd() * 0.22;
          out.push({ x: i * 1.0, z: j * 1.0, h: 0.02 + rnd() * 0.05, c: new THREE.Color(0x3a4a5a).multiplyScalar(shade).getStyle() });
        }
      }
    }
    return out;
  }, []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#2f3d4c" roughness={1} metalness={0} />
      </mesh>
      {/* a few big blocks for depth/parallax; never between camera and character */}
      {[
        { p: [-3.2, 0.5, -2.5] as const, s: 1.0, c: "#3d5166" },
        { p: [3.6, 0.75, -4.5] as const, s: 1.5, c: "#46586b" },
        { p: [-4.5, 1.0, -6] as const, s: 2.0, c: "#34434f" },
        { p: [2.4, 0.25, -1.6] as const, s: 0.5, c: "#4b5f73" },
      ].map((b, i) => (
        <mesh key={`b${i}`} position={[b.p[0], b.p[1], b.p[2]]} castShadow receiveShadow>
          <boxGeometry args={[b.s, b.s, b.s]} />
          <meshStandardMaterial color={b.c} roughness={1} metalness={0} />
        </mesh>
      ))}
      {tiles.map((tl, i) => (
        <mesh key={i} position={[tl.x, tl.h / 2, tl.z]} receiveShadow castShadow>
          <boxGeometry args={[0.96, tl.h, 0.96]} />
          <meshStandardMaterial color={tl.c} roughness={1} metalness={0} />
        </mesh>
      ))}
    </group>
  );
};

/** 3-point lighting that reads on a phone: warm key w/ soft shadows, cool fill, strong rim. */
const Lights: React.FC = () => {
  const key = useRef<THREE.DirectionalLight>(null);
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
      key.current.shadow.normalBias = 0.02;
      key.current.shadow.radius = 4;
    }
  }, []);
  return (
    <>
      <hemisphereLight args={["#bcd3ff", "#2a2420", 0.9]} />
      <directionalLight ref={key} position={[4, 7, 5]} intensity={3.2} color="#fff1dc" castShadow />
      <directionalLight position={[-6, 3, 2]} intensity={0.8} color="#7fb0ff" />
      <directionalLight position={[-2, 4, -6]} intensity={2.4} color="#ff9a5c" />
    </>
  );
};

export const Scene: React.FC<SceneProps> = ({ title, subtitle, pose }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  // Title card timing: title in at 0.2 s, subtitle at 0.6 s.
  const titleIn = interpolate(frame, [fps * 0.2, fps * 0.55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const subIn = interpolate(frame, [fps * 0.6, fps * 0.95], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  // Title card leaves at 3.5 s so the push-in can bring the face up into the top third.
  const titleOut = interpolate(frame, [fps * 3.3, fps * 3.7], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const BEATS: { pose: Pose; from: number; dur: number }[] = [
    { pose: "idle", from: 0, dur: fps * 1.5 },
    { pose: "walk", from: fps * 1.5, dur: fps * 1.5 },
    { pose: "point", from: fps * 3, dur: fps * 1.5 },
    { pose: "shocked", from: fps * 4.5, dur: fps * 1.5 },
  ];

  // Look slightly above chest height: puts the feet at ~78% and the head top at ~23% of frame height.
  const target: [number, number, number] = [0, 1.7, 0];

  return (
    <AbsoluteFill style={{ background: "linear-gradient(#0d1420 0%, #1b2a3b 60%, #2f3d4c 100%)" }}>
      <ThreeCanvas
        width={width}
        height={height}
        dpr={1}
        shadows={{ type: THREE.PCFSoftShadowMap }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
        camera={{ fov: 36, near: 0.1, far: 100, position: [0, 1.4, 9.5] }}
        style={{ position: "absolute", inset: 0 }}
      >
        <color attach="background" args={["#16222f"]} />
        <fog attach="fog" args={["#16222f", 9, 24]} />
        <CameraRig target={target} />
        <Lights />
        <Ground />
        {pose === "auto" ? (
          BEATS.map((b) => (
            // layout="none": a <Sequence> inside ThreeCanvas must not render a <div>.
            // Each beat gets a local frame (0 at beat start) so pose ramps start cleanly.
            <Sequence key={b.pose} from={b.from} durationInFrames={b.dur} layout="none">
              <BlockyCharacter pose={b.pose} lookAt={[1.5, 2.2, 8]} />
            </Sequence>
          ))
        ) : (
          <BlockyCharacter pose={pose} lookAt={[1.5, 2.2, 8]} />
        )}
      </ThreeCanvas>

      {/* Title card (HTML stays razor sharp over the 3D) */}
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 150, opacity: titleOut }}>
        <div
          style={{
            fontFamily: "Inter, 'Helvetica Neue', Arial, sans-serif",
            fontWeight: 900,
            fontSize: 140,
            letterSpacing: -4,
            color: "#fff",
            textShadow: "0 8px 30px rgba(0,0,0,.6), 0 0 2px #000",
            opacity: titleIn,
            transform: `translateY(${(1 - titleIn) * 40}px)`,
            lineHeight: 1,
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 20,
            fontFamily: "Inter, 'Helvetica Neue', Arial, sans-serif",
            fontWeight: 700,
            fontSize: 64,
            color: "#ffb15c",
            textShadow: "0 6px 24px rgba(0,0,0,.7)",
            opacity: subIn,
            transform: `translateY(${(1 - subIn) * 30}px)`,
            textAlign: "center",
            maxWidth: 900,
            lineHeight: 1.15,
          }}
        >
          {subtitle}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
