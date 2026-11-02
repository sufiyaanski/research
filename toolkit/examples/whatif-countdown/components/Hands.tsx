// POV hands — the viewer's own blocky forearms (the character kit's proportions and palette: hoodie
// sleeve + skin hand + thumb), parked in front of the camera. Mount AFTER the camera component in
// the same act: this copies the camera's world transform in a layout effect (frame-derived, no
// useFrame), so the hands ride with any camera move. In an x-ray <Look> they become wireframes.
import React, { useLayoutEffect, useRef } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { DEFAULT_PALETTE } from '../../character/BlockyCharacter';

const Arm: React.FC<{ side: -1 | 1; sway: number; skin: string; sleeve: string; cuff: string }> = ({ side, sway, skin, sleeve, cuff }) => (
  // camera space: −z forward, +x right, +y up. Forearm reaches forward-in from the lower corner,
  // palm down; four separated fingers curl slightly down, the thumb angles inward (round 3: the
  // first version read as stacked boxes — fewer, cleaner blocks with gaps read as a hand).
  // tilted fingers-up ≈ 50° so the BACKS of the hands face the lens (seen edge-on they read as bars)
  <group position={[side * 0.2, -0.37 + sway * 0.008, -0.95]} rotation={[0.85 + sway * 0.015, side * 0.16, side * -0.12]} scale={0.85}>
    <mesh position={[0, 0, 0.36]}>
      <boxGeometry args={[0.2, 0.18, 0.5]} />
      <meshStandardMaterial color={sleeve} roughness={0.85} />
    </mesh>
    <mesh position={[0, 0, 0.1]}>
      <boxGeometry args={[0.215, 0.195, 0.05]} />
      <meshStandardMaterial color={cuff} roughness={0.85} />
    </mesh>
    {/* back of the hand */}
    <mesh position={[0, -0.01, -0.04]}>
      <boxGeometry args={[0.19, 0.07, 0.2]} />
      <meshStandardMaterial color={skin} roughness={0.85} />
    </mesh>
    {[-0.069, -0.023, 0.023, 0.069].map((fx, i) => (
      <group key={i} position={[fx, -0.012, -0.14]} rotation={[-0.32, 0, fx * -0.8]}>
        <mesh position={[0, 0, -0.075 + (i === 0 || i === 3 ? 0.012 : 0)]}>
          <boxGeometry args={[0.036, 0.05, i === 0 || i === 3 ? 0.125 : 0.15]} />
          <meshStandardMaterial color={skin} roughness={0.85} />
        </mesh>
      </group>
    ))}
    <group position={[-side * 0.1, -0.02, -0.02]} rotation={[-0.15, side * 0.75, 0]}>
      <mesh position={[0, 0, -0.06]}>
        <boxGeometry args={[0.045, 0.05, 0.12]} />
        <meshStandardMaterial color={skin} roughness={0.85} />
      </mesh>
    </group>
  </group>
);

export const PovHands: React.FC<{ palette?: Partial<typeof DEFAULT_PALETTE> }> = ({ palette }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const camera = useThree((s) => s.camera);
  const ref = useRef<THREE.Group>(null);
  const P = { ...DEFAULT_PALETTE, ...palette };
  useLayoutEffect(() => {
    if (!ref.current) return;
    camera.updateMatrixWorld();
    ref.current.position.copy(camera.position);
    ref.current.quaternion.copy(camera.quaternion);
    ref.current.updateMatrixWorld();
  });
  // slow, small, OPPOSED drift of the two hands (never in unison)
  const t = frame / fps;
  const s = Math.sin(t * 2 * Math.PI * 0.4);
  return (
    // hidden-line hands (clean silhouette); the act draws its star ground THROUGH them (<Look groundThrough>)
    <group ref={ref}>
      <Arm side={-1} sway={s} skin={P.skin} sleeve={P.hoodie} cuff={P.hoodieDark} />
      <Arm side={1} sway={-s} skin={P.skin} sleeve={P.hoodie} cuff={P.hoodieDark} />
    </group>
  );
};
