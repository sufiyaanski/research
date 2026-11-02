// Look — re-renders ANY subtree of meshes in another look, without touching the components that built
// it (the park set, the blocky people, the POV hands):
//   • 'xray'       every mesh → depth-only black fill + white edge lines (fat lines, px width);
//                  meshes tagged userData.look = 'ground' → a field of tiny star points instead
//   • 'pointcloud' every mesh → hidden, its surface sampled into points (area-weighted, seeded);
//                  optional "assemble": points fly in from scattered offsets
//   • 'normal'     untouched
// plus `glow` 0..1: a wide additive halo pass on the lines and bigger additive points (bloom-like
// glow without a post pass — swangle-safe).
//
// How: after React commits the subtree, a layout effect walks it and ADDS look children to each mesh
// (cached per geometry, rebuilt only when R3F swaps a geometry, e.g. the character's mouth decal).
// The children follow the mesh's animated transform for free. Every value written per frame is a pure
// function of useCurrentFrame() (glow opacity, point assembly) — no useFrame, no state.
// Tags: userData.look = 'ground' | 'seethrough' (edges, no occluding fill) | 'skip' (left untouched).
import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { Easing, useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { dotTexture, mulberry32 } from './textures';

export type LookMode = 'normal' | 'xray' | 'pointcloud';

export type LookProps = {
  mode: LookMode;
  /** 0..1 — halo lines + additive point boost (may change every frame) */
  glow?: number;
  lineColor?: string;
  /** line width in px at 1080×1920 */
  lineWidth?: number;
  haloColor?: string;
  /** xray: ground star points per m² */
  groundDensity?: number;
  /** draw the ground stars through every occluder (POV hands: "you can see the stars through your hands") */
  groundThrough?: boolean;
  groundColor?: string;
  /** pointcloud: points per m² of mesh surface (ground uses groundDensity) */
  density?: number;
  pointColor?: string;
  /** world-space point size (pointcloud) */
  pointSize?: number;
  /** pointcloud: points fly in from scattered offsets; local frames */
  assemble?: { at: number; dur: number; spread?: number };
  seed?: number;
  children: React.ReactNode;
};

type Built = { kind: 'edges'; geo: LineSegmentsGeometry } | { kind: 'points'; base: Float32Array; offs: Float32Array; delay: Float32Array; colors: Float32Array };
const edgeCache = new WeakMap<THREE.BufferGeometry, LineSegmentsGeometry>();

/** area-weighted surface samples of a geometry (local space), seeded */
export function sampleSurface(geo: THREE.BufferGeometry, perM2: number, rnd: () => number, minN = 6, maxN = 60000, scale = new THREE.Vector3(1, 1, 1)): Float32Array {
  const pos = geo.getAttribute('position') as THREE.BufferAttribute;
  const idx = geo.getIndex();
  const triCount = idx ? idx.count / 3 : pos.count / 3;
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const vi = (t: number, k: number) => (idx ? idx.getX(t * 3 + k) : t * 3 + k);
  const cum = new Float64Array(triCount);
  let total = 0;
  for (let t = 0; t < triCount; t++) {
    a.fromBufferAttribute(pos, vi(t, 0)).multiply(scale);
    b.fromBufferAttribute(pos, vi(t, 1)).multiply(scale);
    c.fromBufferAttribute(pos, vi(t, 2)).multiply(scale);
    total += b.clone().sub(a).cross(c.clone().sub(a)).length() / 2;
    cum[t] = total;
  }
  const n = Math.max(minN, Math.min(maxN, Math.round(total * perM2)));
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = rnd() * total;
    let lo = 0;
    let hi = triCount - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cum[mid] < r) lo = mid + 1;
      else hi = mid;
    }
    a.fromBufferAttribute(pos, vi(lo, 0));
    b.fromBufferAttribute(pos, vi(lo, 1));
    c.fromBufferAttribute(pos, vi(lo, 2));
    let u = rnd();
    let v = rnd();
    if (u + v > 1) {
      u = 1 - u;
      v = 1 - v;
    }
    out[i * 3] = a.x + (b.x - a.x) * u + (c.x - a.x) * v;
    out[i * 3 + 1] = a.y + (b.y - a.y) * u + (c.y - a.y) * v;
    out[i * 3 + 2] = a.z + (b.z - a.z) * u + (c.z - a.z) * v;
  }
  return out;
}

const roleOf = (o: THREE.Object3D): string | undefined => {
  for (let p: THREE.Object3D | null = o; p; p = p.parent) if (p.userData && p.userData.look) return p.userData.look as string;
  return undefined;
};

const easeOut = Easing.out(Easing.cubic);

export const Look: React.FC<LookProps> = ({
  mode,
  glow = 0,
  lineColor = '#F4F7FF',
  lineWidth = 2.2,
  haloColor = '#9FC2FF',
  groundDensity = 0.9,
  groundThrough = false,
  groundColor = '#FFFFFF',
  density = 380,
  pointColor = '#5B8CFF',
  pointSize = 0.05,
  assemble,
  seed = 1,
  children,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const ref = useRef<THREE.Group>(null);

  const mats = useMemo(() => {
    const res = new THREE.Vector2(width, height);
    const line = new LineMaterial({ color: new THREE.Color(lineColor).getHex(), linewidth: lineWidth, worldUnits: false, resolution: res });
    const halo = new LineMaterial({ color: new THREE.Color(haloColor).getHex(), linewidth: lineWidth * 6, worldUnits: false, resolution: res, transparent: true, opacity: 0, depthWrite: false });
    halo.blending = THREE.AdditiveBlending;
    const dot = dotTexture();
    const ground = new THREE.PointsMaterial({ size: 0.16, sizeAttenuation: true, map: dot ?? undefined, vertexColors: true, transparent: true, depthWrite: false, depthTest: !groundThrough, blending: THREE.AdditiveBlending, color: groundColor });
    const cloud = new THREE.PointsMaterial({ size: pointSize, sizeAttenuation: true, map: dot ?? undefined, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: pointColor });
    return { line, halo, ground, cloud };
  }, [width, height, lineColor, lineWidth, haloColor, groundColor, pointColor, pointSize, groundThrough]);

  useLayoutEffect(() => {
    const g = ref.current;
    if (!g || mode === 'normal') return;
    // per-frame material values (pure functions of the frame)
    const gl = Math.max(0, Math.min(1, glow));
    mats.halo.opacity = 0.5 * gl;
    mats.halo.visible = gl > 0.01;
    mats.cloud.size = pointSize * (1 + 1.4 * gl);
    mats.ground.size = (mode === 'pointcloud' ? 0.1 : 0.16) * (1 + gl);

    const meshes: THREE.Mesh[] = [];
    g.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && !m.userData.__lookChild && roleOf(m) !== 'skip') meshes.push(m);
    });
    meshes.forEach((mesh, i) => {
      const mat = mesh.material as THREE.Material;
      const role = roleOf(mesh);
      if (mat.side === THREE.BackSide) {
        // inverted-hull outlines of the character: the edges already outline him
        mat.visible = false;
        return;
      }
      const asPoints = role === 'ground' || mode === 'pointcloud';
      if (asPoints || role === 'seethrough') mat.visible = false;
      else {
        mat.colorWrite = false; // depth-only: hides lines behind it (hidden-line x-ray)
        mat.polygonOffset = true;
        mat.polygonOffsetFactor = 1;
        mat.polygonOffsetUnits = 1;
        mesh.renderOrder = -1;
      }
      const key = `${mode}:${mesh.geometry.uuid}`;
      if (mesh.userData.__lookKey !== key) {
        for (const ch of [...mesh.children]) if (ch.userData.__lookChild) mesh.remove(ch);
        mesh.userData.__lookKey = key;
        if (!asPoints) {
          let eg = edgeCache.get(mesh.geometry);
          if (!eg) {
            eg = new LineSegmentsGeometry().fromEdgesGeometry(new THREE.EdgesGeometry(mesh.geometry, 20));
            edgeCache.set(mesh.geometry, eg);
          }
          const l = new LineSegments2(eg, mats.line);
          l.userData.__lookChild = true;
          const h = new LineSegments2(eg, mats.halo);
          h.userData.__lookChild = true;
          h.renderOrder = 2;
          mesh.add(l, h);
        } else {
          const rnd = mulberry32(seed * 7919 + i * 131 + 17);
          const ws = new THREE.Vector3();
          mesh.getWorldScale(ws);
          const ground = role === 'ground';
          const base = sampleSurface(mesh.geometry, ground ? groundDensity : density, rnd, 6, ground ? 90000 : 40000, ws);
          const n = base.length / 3;
          const offs = new Float32Array(n * 3);
          const delay = new Float32Array(n);
          const colors = new Float32Array(n * 3);
          const spread = assemble?.spread ?? 3;
          for (let k = 0; k < n; k++) {
            const th = rnd() * Math.PI * 2;
            const ph = Math.acos(2 * rnd() - 1);
            const d = spread * (0.4 + rnd());
            offs[k * 3] = Math.sin(ph) * Math.cos(th) * d;
            offs[k * 3 + 1] = Math.abs(Math.cos(ph)) * d;
            offs[k * 3 + 2] = Math.sin(ph) * Math.sin(th) * d;
            delay[k] = rnd();
            const b = ground ? 0.25 + 0.75 * Math.pow(rnd(), 2.2) : 0.55 + 0.45 * rnd();
            colors[k * 3] = colors[k * 3 + 1] = colors[k * 3 + 2] = b;
          }
          const geo = new THREE.BufferGeometry();
          geo.setAttribute('position', new THREE.BufferAttribute(base.slice(), 3));
          geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
          // positions are mesh-LOCAL (the parent transform places them); only the point COUNT used
          // the world scale, so a scaled-down character isn't over-dense
          const pts = new THREE.Points(geo, ground ? mats.ground : mats.cloud);
          pts.userData.__lookChild = true;
          pts.userData.__built = { kind: 'points', base, offs, delay, colors } satisfies Built;
          pts.frustumCulled = false;
          mesh.add(pts);
        }
      }
      // per-frame point assembly (pointcloud)
      if (asPoints && assemble && mode === 'pointcloud') {
        for (const ch of mesh.children) {
          const b = ch.userData.__built as Built | undefined;
          if (!b || b.kind !== 'points') continue;
          const attr = (ch as THREE.Points).geometry.getAttribute('position') as THREE.BufferAttribute;
          const arr = attr.array as Float32Array;
          const n = b.base.length / 3;
          const stag = assemble.dur * 0.6;
          for (let k = 0; k < n; k++) {
            const p = Math.min(1, Math.max(0, (frame - assemble.at - b.delay[k] * stag) / Math.max(1, assemble.dur - stag)));
            const r = 1 - easeOut(p);
            arr[k * 3] = b.base[k * 3] + b.offs[k * 3] * r;
            arr[k * 3 + 1] = b.base[k * 3 + 1] + b.offs[k * 3 + 1] * r;
            arr[k * 3 + 2] = b.base[k * 3 + 2] + b.offs[k * 3 + 2] * r;
          }
          attr.needsUpdate = true;
        }
      }
    });
  });

  return <group ref={ref}>{children}</group>;
};

/** The x-ray world: white edge lines on black, the ground as a field of star points. */
export const XRayWorld: React.FC<Omit<LookProps, 'mode'>> = (p) => <Look mode="xray" {...p} />;
