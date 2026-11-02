// 3D pieces of the format: the act camera, streak lines (wind / rebuild), window sparkles, starfield,
// the planet (procedural noise texture + dark fresnel rim + halo), the moon and a satellite.
// Everything is a pure function of useCurrentFrame() (LOCAL to the act's <Sequence>).
import React, { useLayoutEffect, useMemo } from 'react';
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { dotTexture, mulberry32, planetTexture } from './textures';
import type { CamPose } from '../schema';

type V3 = [number, number, number];
const inOut = Easing.inOut(Easing.cubic);
const lerp3 = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** Camera for one act: from → to over the act (Easing.inOut(cubic)); optional ≤ 7-frame shake at frame 0. */
export const ActCamera: React.FC<{ from: CamPose; to?: CamPose; fov?: number; dur: number; shake?: number }> = ({ from, to, fov = 36, dur, shake }) => {
  const frame = useCurrentFrame();
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const t = interpolate(frame, [0, Math.max(1, dur)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: inOut });
  const b = to ?? from;
  const pos = lerp3(from.pos, b.pos, t);
  const look = lerp3(from.look, b.look, t);
  let sx = 0;
  let sy = 0;
  if (shake && frame < 7) {
    const s = shake * (frame % 2 === 0 ? 1 : -1) * (1 - frame / 7);
    sx = s;
    sy = s * 0.6;
  }
  useLayoutEffect(() => {
    camera.position.set(pos[0] + sx, pos[1] + sy, pos[2]);
    camera.up.set(0, 1, 0);
    camera.lookAt(look[0] + sx, look[1] + sy, look[2]);
    camera.fov = fov;
    camera.near = 0.05;
    camera.far = 900;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  });
  return null;
};

/**
 * Streaks: N fat line segments travelling along `dir` through a box, head bright → tail dark
 * (vertex colours on additive blending = a fading trail). Wind (dir +x) or rebuild (dir +y).
 */
export const Streaks: React.FC<{
  count: number;
  box: { min: V3; max: V3 };
  dir: V3;
  speed: number;
  len: [number, number];
  color?: string;
  width?: number;
  seed?: number;
  /** 0..1 overall brightness (may change per frame) */
  amount?: number;
}> = ({ count, box, dir, speed, len, color = '#CFE0FF', width = 2.4, seed = 3, amount = 1 }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  const items = useMemo(() => {
    const r = mulberry32(seed);
    return Array.from({ length: count }, () => ({
      p: [box.min[0] + r() * (box.max[0] - box.min[0]), box.min[1] + r() * (box.max[1] - box.min[1]), box.min[2] + r() * (box.max[2] - box.min[2])] as V3,
      l: len[0] + r() * (len[1] - len[0]),
      v: speed * (0.6 + 0.8 * r()),
      b: 0.35 + 0.65 * r(),
    }));
  }, [count, box.min[0], box.min[1], box.min[2], box.max[0], box.max[1], box.max[2], len[0], len[1], speed, seed]);
  const { obj, geo } = useMemo(() => {
    const g = new LineSegmentsGeometry();
    const m = new LineMaterial({ linewidth: width, worldUnits: false, resolution: new THREE.Vector2(W, H), vertexColors: true, transparent: true, depthWrite: false });
    m.blending = THREE.AdditiveBlending;
    const o = new LineSegments2(g, m);
    o.frustumCulled = false;
    return { obj: o, geo: g };
  }, [width, W, H]);
  useLayoutEffect(() => {
    const d = new THREE.Vector3(...dir).normalize();
    const t = frame / fps;
    const pos = new Float32Array(items.length * 6);
    const col = new Float32Array(items.length * 6);
    const c = new THREE.Color(color);
    // the extent along dir that streaks wrap through
    const ext = Math.abs(d.x) * (box.max[0] - box.min[0]) + Math.abs(d.y) * (box.max[1] - box.min[1]) + Math.abs(d.z) * (box.max[2] - box.min[2]);
    items.forEach((s, i) => {
      const travel = (((s.v * t) % ext) + ext) % ext;
      const hx = s.p[0] + d.x * travel;
      const hy = s.p[1] + d.y * travel;
      const hz = s.p[2] + d.z * travel;
      // wrap back into the box along dir
      const wrap = (v: number, lo: number, hi: number) => (hi > lo ? lo + ((((v - lo) % (hi - lo)) + (hi - lo)) % (hi - lo)) : v);
      const H0: V3 = [wrap(hx, box.min[0], box.max[0]), wrap(hy, box.min[1], box.max[1]), wrap(hz, box.min[2], box.max[2])];
      pos.set([H0[0] - d.x * s.l, H0[1] - d.y * s.l, H0[2] - d.z * s.l, H0[0], H0[1], H0[2]], i * 6);
      const k = s.b * amount;
      col.set([0, 0, 0, c.r * k, c.g * k, c.b * k], i * 6);
    });
    geo.setPositions(pos);
    geo.setColors(col);
  });
  return <primitive object={obj} />;
};

/** Window panes bursting into sparkles: a wave crossing x from xFrom→xTo over local frames [f0, f1]. */
export const Sparkles: React.FC<{
  sources: { x: number; y: number; z: number }[];
  wave: [number, number];
  xRange: [number, number];
  perSource?: number;
  dir?: V3;
  color?: string;
  size?: number;
  seed?: number;
  /** shard speed range (m/s) and life range (s); speed [0, 0] = a stationary flash */
  speed?: [number, number];
  life?: [number, number];
}> = ({ sources, wave, xRange, perSource = 3, dir = [1, 0, 0], color = '#EAF3FF', size = 0.35, seed = 9, speed = [6, 20], life = [1.2, 2.8] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const parts = useMemo(() => {
    const r = mulberry32(seed);
    const out: { o: V3; v: V3; t0: number; life: number }[] = [];
    for (const s of sources)
      for (let k = 0; k < perSource; k++) {
        const u = (s.x - xRange[0]) / Math.max(1e-6, xRange[1] - xRange[0]);
        const t0 = wave[0] + Math.min(1, Math.max(0, u)) * (wave[1] - wave[0]) + r() * 6;
        const sp = speed[0] + r() * (speed[1] - speed[0]);
        const still = speed[1] <= 0;
        out.push({
          o: [s.x + (r() - 0.5) * 0.6, s.y + (r() - 0.5) * 0.8, s.z + 0.1],
          v: still ? [0, 0, 0] : [dir[0] * sp + (r() - 0.5) * 4, dir[1] * sp + (r() - 0.5) * 4 - 1, dir[2] * sp + 2 + r() * 5],
          t0,
          life: life[0] + r() * (life[1] - life[0]),
        });
      }
    return out;
  }, [sources, wave[0], wave[1], xRange[0], xRange[1], perSource, dir[0], dir[1], dir[2], seed]);
  const { pts, geo } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(parts.length * 3), 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(parts.length * 3), 3));
    const m = new THREE.PointsMaterial({ size, sizeAttenuation: true, map: dotTexture() ?? undefined, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const p = new THREE.Points(g, m);
    p.frustumCulled = false;
    return { pts: p, geo: g };
  }, [parts, size]);
  useLayoutEffect(() => {
    const pa = geo.getAttribute('position') as THREE.BufferAttribute;
    const ca = geo.getAttribute('color') as THREE.BufferAttribute;
    const c = new THREE.Color(color);
    parts.forEach((p, i) => {
      const age = (frame - p.t0) / fps;
      const alive = age >= 0 && age < p.life;
      const k = alive ? Math.pow(1 - age / p.life, 1.5) : 0;
      const a = Math.max(0, age);
      const fall = p.v[0] === 0 && p.v[1] === 0 ? 0 : 2 * a * a;
      pa.setXYZ(i, p.o[0] + p.v[0] * a, p.o[1] + p.v[1] * a - fall, p.o[2] + p.v[2] * a);
      ca.setXYZ(i, c.r * k, c.g * k, c.b * k);
    });
    pa.needsUpdate = true;
    ca.needsUpdate = true;
  });
  return <primitive object={pts} />;
};

/** Static starfield on a big sphere around the origin (seeded). */
export const Starfield: React.FC<{ count?: number; radius?: number; seed?: number; size?: number }> = ({ count = 2400, radius = 400, seed = 21, size = 1.6 }) => {
  const obj = useMemo(() => {
    const r = mulberry32(seed);
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const th = r() * Math.PI * 2;
      const ph = Math.acos(2 * r() - 1);
      const rr = radius * (0.8 + 0.2 * r());
      pos.set([Math.sin(ph) * Math.cos(th) * rr, Math.cos(ph) * rr, Math.sin(ph) * Math.sin(th) * rr], i * 3);
      const b = 0.25 + 0.75 * Math.pow(r(), 3);
      col.set([b * 0.92, b * 0.96, b], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const m = new THREE.PointsMaterial({ size, sizeAttenuation: true, map: dotTexture() ?? undefined, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const p = new THREE.Points(g, m);
    p.frustumCulled = false;
    return p;
  }, [count, radius, seed, size]);
  return <primitive object={obj} />;
};

const PLANET_VERT = /* glsl */ `
varying vec2 vUv;
varying vec3 vN;
varying vec3 vV;
void main() {
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;
const PLANET_FRAG = /* glsl */ `
uniform sampler2D map;
uniform vec3 rim;
uniform float glow;
varying vec2 vUv;
varying vec3 vN;
varying vec3 vV;
void main() {
  vec3 alb = texture2D(map, vUv).rgb;
  float f = 1.0 - max(dot(normalize(vN), normalize(vV)), 0.0);
  // emissive white-blue body; a dark rim eats the limb (fresnel)
  vec3 col = alb * glow;
  float rimK = smoothstep(0.45, 0.97, f);
  col = mix(col, rim, rimK * 0.92);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;
const HALO_FRAG = /* glsl */ `
uniform vec3 color;
uniform float strength;
varying vec3 vN;
varying vec3 vV;
void main() {
  float f = 1.0 - abs(dot(normalize(vN), normalize(vV)));
  float a = pow(f, 3.0) * strength;
  gl_FragColor = vec4(color * a, a);
}`;

/** The planet: radius r, procedural albedo (module-level seeded canvas), emissive, dark fresnel rim, faint outer halo. */
export const Planet: React.FC<{ radius?: number; spin?: number; tilt?: number; seed?: number; rimColor?: string; haloColor?: string; brightness?: number }> = ({
  radius = 10,
  spin = 0,
  tilt = 0.35,
  seed = 11,
  rimColor = '#0A1226',
  haloColor = '#7FA8FF',
  brightness = 1.06,
}) => {
  const mats = useMemo(() => {
    const body = new THREE.ShaderMaterial({
      uniforms: { map: { value: planetTexture(seed, 2048) }, rim: { value: new THREE.Color(rimColor) }, glow: { value: brightness } },
      vertexShader: PLANET_VERT,
      fragmentShader: PLANET_FRAG,
    });
    const halo = new THREE.ShaderMaterial({
      uniforms: { color: { value: new THREE.Color(haloColor) }, strength: { value: 0.55 } },
      vertexShader: PLANET_VERT,
      fragmentShader: HALO_FRAG,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { body, halo };
  }, [seed, rimColor, haloColor, brightness]);
  return (
    <group rotation={[tilt, spin, 0.12]}>
      <mesh material={mats.body}>
        <sphereGeometry args={[radius, 128, 96]} />
      </mesh>
      <mesh material={mats.halo} scale={1.06}>
        <sphereGeometry args={[radius, 96, 64]} />
      </mesh>
    </group>
  );
};

/** A small dark moon (lit faintly from the side so its edge reads against black). */
export const Moon: React.FC<{ position: V3; radius?: number }> = ({ position, radius = 2.2 }) => (
  <mesh position={position}>
    <sphereGeometry args={[radius, 64, 48]} />
    <meshStandardMaterial color="#2A2C33" roughness={1} metalness={0} />
  </mesh>
);

/** A boxy satellite: body + two solar panels + a dish. */
export const Satellite: React.FC<{ position: V3; rotation?: V3; scale?: number }> = ({ position, rotation = [0, 0, 0], scale = 1 }) => (
  <group position={position} rotation={rotation} scale={scale}>
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.8]} />
      <meshStandardMaterial color="#C9A24A" roughness={0.5} metalness={0.4} />
    </mesh>
    {[-1, 1].map((s) => (
      <mesh key={s} position={[s * 1.05, 0, 0]}>
        <boxGeometry args={[1.5, 0.03, 0.55]} />
        <meshStandardMaterial color="#29407A" roughness={0.4} metalness={0.3} />
      </mesh>
    ))}
    <mesh position={[0, 0.38, 0.2]}>
      <boxGeometry args={[0.32, 0.06, 0.32]} />
      <meshStandardMaterial color="#E8E8EA" roughness={0.6} />
    </mesh>
  </group>
);
