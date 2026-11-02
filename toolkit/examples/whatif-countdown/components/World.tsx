// The format's signature set: a city park with friends on a picnic blanket and a skyline behind.
// Built from boxes only (seeded lcg layout → identical on every frame and machine), so the same set
// renders in every look (normal / xray / pointcloud via <Look>). Units: metres; +x = east, −z = north
// (the skyline). The GROUND-FIXED part (ground, path, trees, skyline) can translate by `flowX` while
// the picnic (blanket, basket, people) stays with the camera — "the ground stops, you don't".
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { BlockyCharacter, takeLandFrames, type Mood, type MoodKey } from '../../character/BlockyCharacter';
import { lcg } from '../../character/Stage3D';

export type Building = { x: number; z: number; w: number; d: number; h: number; c: string };
export type Tree = { x: number; z: number; h: number; s: number; c: string };
export type WindowQuad = { x: number; y: number; z: number; w: number; h: number };
export type WorldData = { trees: Tree[]; buildings: Building[]; windows: WindowQuad[]; xMin: number; xMax: number };

export const GROUND = { w: 560, d: 260, cx: 80, cz: -70 };
/** front row of the skyline (z of its south faces ≈ SKYLINE_Z) */
export const SKYLINE_Z = -150;
const CONCRETE = ['#7F92A6', '#93A3B5', '#6E8196', '#A3B0BF', '#7A8899', '#8C99A3', '#9E9488'];
const LEAF = ['#5E9A4E', '#4F8A45', '#6FAA55', '#3F7A3E'];

export function buildWorld(seed: number): WorldData {
  const r = lcg(seed * 97 + 13);
  const buildings: Building[] = [];
  // two rows of towers: the skyline seen from the park (north), long enough for the flow to the west
  // two rows of towers: the skyline seen from the park (north), long enough for the flow to the west
  for (const row of [
    { z: SKYLINE_Z, hMin: 16, hMax: 52 },
    { z: SKYLINE_Z - 34, hMin: 26, hMax: 78 },
  ]) {
    let x = -170;
    while (x < 330) {
      const w = 10 + r() * 12;
      const d = 10 + r() * 8;
      const h = row.hMin + Math.pow(r(), 1.5) * (row.hMax - row.hMin);
      buildings.push({ x: x + w / 2, z: row.z - d / 2 - r() * 6, w, d, h, c: CONCRETE[Math.floor(r() * CONCRETE.length)] });
      x += w + 2 + r() * 5;
    }
  }
  const windows: WindowQuad[] = [];
  for (const b of buildings.filter((q) => q.z > SKYLINE_Z - 25)) {
    const cols = Math.max(2, Math.floor((b.w - 2) / 2.6));
    const rows = Math.max(3, Math.floor((b.h - 3) / 3.6));
    const gx = (b.w - 2) / cols;
    for (let i = 0; i < cols; i++)
      for (let j = 0; j < rows; j++) windows.push({ x: b.x - (b.w - 2) / 2 + gx * (i + 0.5), y: 2.6 + j * 3.6, z: b.z + b.d / 2 + 0.05, w: gx * 0.6, h: 2.1 });
  }
  const trees: Tree[] = [];
  let guard = 0;
  while (trees.length < 110 && guard++ < 4000) {
    const x = -60 + r() * 280;
    const z = -110 + r() * 126;
    if (Math.abs(x) < 7 && Math.abs(z) < 6) continue; // the picnic
    if (x > -16 && x < 6 && z > -14) continue; // the opening camera's view lane
    if (Math.abs(z) < 2.6 && x > 0) continue; // a clear lane straight ahead for the POV flight
    trees.push({ x, z, h: 1.8 + r() * 1.6, s: 2.0 + r() * 1.6, c: LEAF[Math.floor(r() * LEAF.length)] });
  }
  return { trees, buildings, windows, xMin: -170, xMax: 330 };
}

const Box: React.FC<{ p: [number, number, number]; s: [number, number, number]; c: string; rough?: number }> = ({ p, s, c, rough = 0.95 }) => (
  <mesh position={p}>
    <boxGeometry args={s} />
    <meshStandardMaterial color={c} roughness={rough} metalness={0} />
  </mesh>
);

/** All window panes in ONE merged geometry (each a thin quad facing +z) — one draw call, and the
 *  x-ray edges / point samples still see every pane. */
const Windows: React.FC<{ windows: WindowQuad[] }> = ({ windows }) => {
  const geo = useMemo(() => {
    const pos = new Float32Array(windows.length * 12);
    const col = new Float32Array(windows.length * 12);
    const idx: number[] = [];
    const r = lcg(5);
    windows.forEach((q, i) => {
      const x0 = q.x - q.w / 2;
      const x1 = q.x + q.w / 2;
      const y0 = q.y - q.h / 2;
      const y1 = q.y + q.h / 2;
      pos.set([x0, y0, q.z, x1, y0, q.z, x1, y1, q.z, x0, y1, q.z], i * 12);
      const k = 0.75 + 0.25 * r();
      // round 2: low-contrast panes (the opening title sits over the skyline)
      const c = new THREE.Color(r() < 0.2 ? '#C4D3E0' : '#8EA2B6').multiplyScalar(k);
      for (let v = 0; v < 4; v++) col.set([c.r, c.g, c.b], i * 12 + v * 3);
      const b = i * 4;
      idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.setIndex(idx);
    g.computeBoundingSphere();
    return g;
  }, [windows]);
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial vertexColors toneMapped={false} fog />
    </mesh>
  );
};

/** ground, path, trees, skyline — everything bolted to the Earth */
/** where a tree's canopy is `windT` seconds after the wind front arrived (null: still on the trunk).
 *  The front sweeps west→east at 60 m/s (illustrative); each canopy tears off with a seeded delay,
 *  then accelerates east and tumbles. */
const canopyFly = (t: Tree, i: number, windT: number | undefined) => {
  if (windT === undefined) return null;
  const delay = (t.x + 60) / 60 + ((i * 37) % 10) / 10;
  const k = windT - delay;
  if (k <= 0) return null;
  return { dx: 9 * k * k + 3 * k, dy: 1.2 * k, rz: -1.6 * k, rx: 0.5 * k * ((i % 3) - 1) };
};

export const GroundFixed: React.FC<{
  world: WorldData;
  flowX?: number;
  skyline?: boolean;
  trees?: boolean;
  windT?: number;
  /** staging: leave out trees within r metres of [x, z] (clears a camera's foreground) */
  clearAround?: [number, number, number];
}> = ({ world, flowX = 0, skyline = true, trees = true, windT, clearAround }) => (
  <group position={[flowX, 0, 0]}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[GROUND.cx, 0, GROUND.cz]} userData={{ look: 'ground' }}>
      <planeGeometry args={[GROUND.w, GROUND.d]} />
      <meshStandardMaterial color="#7FA866" roughness={1} metalness={0} />
    </mesh>
    {/* a gravel path curving behind the picnic + a city road at the park's north edge */}
    <group userData={{ look: 'ground' }}>
      <Box p={[60, 0.015, -7]} s={[300, 0.03, 2.2]} c="#D9CBB0" />
      <Box p={[80, 0.012, SKYLINE_Z + 18]} s={[560, 0.024, 12]} c="#5C6168" />
    </group>
    {trees
      ? world.trees.map((t, i) => {
          if (clearAround && Math.hypot(t.x - clearAround[0], t.z - clearAround[1]) < clearAround[2]) return null;
          const fly = canopyFly(t, i, windT);
          return (
            <group key={i} position={[t.x, 0, t.z]}>
              <Box p={[0, t.h / 2, 0]} s={[0.36, t.h, 0.36]} c="#6B4A33" />
              <group position={[fly ? fly.dx : 0, t.h + t.s * 0.38 + (fly ? fly.dy : 0), 0]} rotation={[fly ? fly.rx : 0, 0, fly ? fly.rz : 0]}>
                <Box p={[0, 0, 0]} s={[t.s, t.s * 0.76, t.s]} c={t.c} />
                <Box p={[0, t.s * 0.52, 0]} s={[t.s * 0.62, t.s * 0.5, t.s * 0.62]} c={t.c} />
              </group>
            </group>
          );
        })
      : null}
    {skyline ? (
      <group>
        {world.buildings.map((b, i) => (
          <Box key={i} p={[b.x, b.h / 2, b.z]} s={[b.w, b.h, b.d]} c={b.c} rough={0.9} />
        ))}
        <Windows windows={world.windows} />
      </group>
    ) : null}
  </group>
);

const PICNIC_PALETTES = [
  { hoodie: '#E4572E', hoodieDark: '#B8411F', accent: '#FFE8C2', pants: '#2B3A55' },
  { hoodie: '#2F7DD1', hoodieDark: '#1F5EA3', accent: '#FFD23F', pants: '#3A3A40' },
  { hoodie: '#F2C14E', hoodieDark: '#C99A2E', accent: '#2B2D42', pants: '#4A5A3A', skin: '#B9835A' },
];

/**
 * The blanket, basket and three seated friends. `mood` changes are takes that land at local frame
 * `takeAt` (anticipation → squash → new face → settle; never a snap).
 */
export const Picnic: React.FC<{ mood?: Mood; prevMood?: Mood; takeAt?: number; fps: number }> = ({ mood = 'happy', prevMood, takeAt = 0, fps }) => {
  const moods = (seedShift: number): MoodKey[] | Mood =>
    prevMood && prevMood !== mood
      ? [
          { at: -1000, mood: prevMood },
          { at: takeAt + seedShift - takeLandFrames(fps), mood },
        ]
      : mood;
  const cells = useMemo(() => {
    const out: { x: number; z: number; c: string }[] = [];
    const nx = 6;
    const nz = 5;
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) out.push({ x: -1.8 + 0.3 + i * 0.6, z: -1.4 + 0.28 + j * 0.56, c: (i + j) % 2 ? '#F4EFE6' : '#D6453D' });
    return out;
  }, []);
  return (
    <group>
      {/* blanket: a 6×5 check (separate cells, so the x-ray shows the weave) */}
      {cells.map((c, i) => (
        <Box key={i} p={[c.x, 0.03, c.z]} s={[0.6, 0.04, 0.56]} c={c.c} />
      ))}
      {/* basket + lid + handle, a bottle, two sandwiches */}
      <Box p={[0.55, 0.3, -0.5]} s={[0.8, 0.5, 0.52]} c="#B07A3F" />
      <Box p={[0.55, 0.58, -0.5]} s={[0.86, 0.07, 0.58]} c="#8E5E2C" />
      <Box p={[0.3, 0.82, -0.5]} s={[0.06, 0.42, 0.06]} c="#8E5E2C" />
      <Box p={[0.8, 0.82, -0.5]} s={[0.06, 0.42, 0.06]} c="#8E5E2C" />
      <Box p={[0.55, 1.0, -0.5]} s={[0.56, 0.06, 0.06]} c="#8E5E2C" />
      <Box p={[-0.2, 0.32, 0.25]} s={[0.16, 0.56, 0.16]} c="#3E7C59" />
      <Box p={[0.15, 0.09, 0.55]} s={[0.4, 0.1, 0.3]} c="#E8C27A" />
      <Box p={[0.6, 0.09, 0.35]} s={[0.36, 0.1, 0.28]} c="#E8C27A" />
      <BlockyCharacter pose="sit" mood={moods(0)} position={[-1.15, 0, -0.75]} rotationY={0.55} scale={0.62} seed={3} palette={PICNIC_PALETTES[0]} lookAt={[1.2, 1.2, 0.2]} />
      <BlockyCharacter pose="sit" mood={moods(2)} position={[1.45, 0, -0.95]} rotationY={-0.75} scale={0.62} seed={17} palette={PICNIC_PALETTES[1]} lookAt={[-1, 1.2, 0.4]} />
      <BlockyCharacter pose="sit" mood={moods(4)} position={[-0.1, 0, 1.25]} rotationY={Math.PI - 0.15} scale={0.62} seed={29} palette={PICNIC_PALETTES[2]} lookAt={[0, 1.2, -1]} />
    </group>
  );
};

/** soft contact shadows under the blanket's edge and the people (no shadow maps on a CPU renderer) */
export const ContactBlobs: React.FC = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
      <planeGeometry args={[4.2, 3.4]} />
      <meshBasicMaterial color="#000000" transparent opacity={0.18} depthWrite={false} />
    </mesh>
  </group>
);
