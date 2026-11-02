// Night 3D sets for long-form narrator / what-if scenes (16:9). Built from boxes in code, original,
// deterministic (seeded). Q-ROSITY grammar: layered depth (foreground props, character mid, set
// behind), practical lights (lighthouse, windows, lamps, the Moon), fog for depth. No bloom/particles.
//
// Each set takes `moon` 0..1 (1 = the Moon in the sky, 0 = gone) so what-if episodes can change the
// world state on a spoken word; `tide` (shore) moves the water line in metres.
import React, { useMemo } from 'react';
import { lcg, type StageTheme } from '../examples/character/Stage3D';

type V3 = [number, number, number];

export const NIGHT_THEME: StageTheme = {
  sky: '#0A0D16',
  fog: [28, 170],
  ground: '#141826',
  tile: '#1C2133',
  hemi: ['#5A6A9A', '#141018'],
  hemiIntensity: 1.25,
  // moonlight-blue key from front-left (faces read), cool fill, a low warm rim for the silhouette
  key: { color: '#D2DCFF', intensity: 1.7, position: [-7, 9, 12] },
  fill: { color: '#6A7AB8', intensity: 0.55 },
  rim: { color: '#FFB347', intensity: 0.7 },
  exposure: 1.2,
};

const Box: React.FC<{ p: V3; s: V3; c: string; rough?: number; rotY?: number; emissive?: string; ei?: number }> = ({ p, s, c, rough = 0.95, rotY = 0, emissive, ei = 0 }) => (
  <mesh position={p} rotation={[0, rotY, 0]}>
    <boxGeometry args={s} />
    <meshStandardMaterial color={c} roughness={rough} metalness={0} emissive={emissive ?? '#000000'} emissiveIntensity={ei} />
  </mesh>
);
const Glow: React.FC<{ p: V3; s: V3; c: string; on?: number; fog?: boolean }> = ({ p, s, c, on = 1, fog = true }) => (
  <mesh position={p}>
    <boxGeometry args={s} />
    <meshBasicMaterial color={c} transparent opacity={on} fog={fog} />
  </mesh>
);

/** Static sky: stars (tiny boxes) + the Moon (fades/shrinks with `moon`). */
export const Sky: React.FC<{ moon: number; moonPos?: V3; seed?: number }> = ({ moon, moonPos = [-26, 34, -160], seed = 7 }) => {
  const stars = useMemo(() => {
    const r = lcg(seed);
    return Array.from({ length: 140 }, () => ({ p: [(r() - 0.5) * 420, 14 + r() * 120, -190 - r() * 20] as V3, s: 0.35 + r() * 0.5 }));
  }, [seed]);
  const k = Math.max(0, Math.min(1, moon));
  return (
    <group>
      {stars.map((st, i) => (
        <Glow key={i} p={st.p} s={[st.s, st.s, 0.1]} c="#DDE6FF" on={0.75} fog={false} />
      ))}
      {k > 0.001 ? (
        <group position={moonPos} scale={[0.25 + 0.75 * k, 0.25 + 0.75 * k, 0.25 + 0.75 * k]}>
          <mesh>
            <sphereGeometry args={[9, 32, 24]} />
            <meshBasicMaterial color="#E8EEFF" transparent opacity={k} fog={false} />
          </mesh>
          {/* maria: flat darker discs on the face (no textures, no glow) */}
          {([[-2.5, 2, 8.4, 2.6], [3, -1.5, 8.5, 2.1], [0.5, 3.8, 8.0, 1.5]] as [number, number, number, number][]).map(([x, y, z, r], i) => (
            <mesh key={i} position={[x, y, z]}>
              <circleGeometry args={[r, 20]} />
              <meshBasicMaterial color="#C3CBE0" transparent opacity={k} fog={false} />
            </mesh>
          ))}
        </group>
      ) : null}
    </group>
  );
};

/** world position of the shore set's tide-gauge post (the `gauge` camera frames it) */
export const GAUGE: V3 = [4.9, 1.3, -7.5];

/** SHORE: beach, wet-sand band, water at `tide` m, a pier with a tide-gauge post, rocks, a lighthouse. */
export const ShoreSet: React.FC<{ moon?: number; tide?: number; seed?: number }> = ({ moon = 1, tide = 0, seed = 3 }) => {
  const rocks = useMemo(() => {
    const r = lcg(seed);
    return Array.from({ length: 9 }, (_, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const s = 0.5 + r() * 1.3;
      return { p: [side * (3.5 + r() * 9), s * 0.4, 2 - r() * 7] as V3, s: [s * 1.3, s * 0.8, s] as V3, rot: r() * 1.5, c: r() < 0.5 ? '#2A2F3D' : '#323848' };
    });
  }, [seed]);
  const waterY = -0.25 + tide;
  return (
    <group>
      <Sky moon={moon} moonPos={[55, 34, -160]} />
      {/* sand + wet band */}
      <Box p={[0, -0.1, 4]} s={[220, 0.2, 16]} c="#3B3A45" />
      <Box p={[0, -0.16, -6]} s={[220, 0.2, 6]} c="#262734" rough={0.6} />
      {/* sea */}
      <mesh position={[0, waterY, -110]}>
        <boxGeometry args={[600, 0.1, 210]} />
        <meshStandardMaterial color="#1D4A5A" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* moonlight path on the water (only while the Moon is up) */}
      {moon > 0.01 ? (
        <mesh position={[-12, waterY + 0.07, -80]} rotation={[-Math.PI / 2, 0, -0.16]}>
          <planeGeometry args={[5, 150]} />
          <meshBasicMaterial color="#9FB4E8" transparent opacity={0.28 * moon} />
        </mesh>
      ) : null}
      {/* headland on the horizon */}
      <Box p={[60, 6, -170]} s={[90, 14, 10]} c="#151A26" />
      <Box p={[95, 11, -172]} s={[30, 24, 10]} c="#131824" />
      {/* lighthouse (practical light) */}
      <group position={[-34, 0, -60]}>
        <Box p={[0, 7, 0]} s={[3, 14, 3]} c="#D9D2C6" />
        <Box p={[0, 4, 1.55]} s={[3.02, 1.2, 0.05]} c="#B0383C" />
        <Box p={[0, 10, 1.55]} s={[3.02, 1.2, 0.05]} c="#B0383C" />
        <Glow p={[0, 14.8, 0]} s={[2.2, 1.6, 2.2]} c="#FFD98A" />
        <Box p={[0, 15.9, 0]} s={[2.8, 0.6, 2.8]} c="#2A2F3D" />
        <pointLight position={[0, 14.8, 3]} intensity={30} distance={60} decay={1.6} color="#FFC774" />
      </group>
      {/* pier: deck + posts walking out to sea, one post painted as a tide gauge */}
      <group position={[7.5, 0, 0]}>
        <Box p={[0, 1.6, -26]} s={[3.2, 0.25, 52]} c="#4A3A33" />
        {Array.from({ length: 10 }, (_, i) => (
          <React.Fragment key={i}>
            <Box p={[-1.4, 0.4, -2 - i * 5.4]} s={[0.35, 2.6, 0.35]} c="#3A2E29" />
            <Box p={[1.4, 0.4, -2 - i * 5.4]} s={[0.35, 2.6, 0.35]} c="#3A2E29" />
          </React.Fragment>
        ))}
        {/* tide gauge: white post, yellow marks every 0.5 m */}
        <Box p={[GAUGE[0] - 7.5, 1.3, GAUGE[2]]} s={[0.4, 3.6, 0.4]} c="#E9E2D6" />
        {[0, 1, 2, 3, 4].map((i) => (
          <Box key={i} p={[GAUGE[0] - 7.5, -0.2 + i * 0.6, GAUGE[2] + 0.21]} s={[0.42, 0.08, 0.05]} c="#FFD23F" />
        ))}
        <Glow p={[0, 2.5, -50]} s={[0.4, 0.4, 0.4]} c="#FFC774" />
      </group>
      {rocks.map((rk, i) => (
        <Box key={i} p={rk.p} s={rk.s} c={rk.c} rotY={rk.rot} />
      ))}
    </group>
  );
};

/** STREET: road, pavements, two rows of houses with warm lit windows, lamps, a parked car. */
export const StreetSet: React.FC<{ moon?: number; seed?: number }> = ({ moon = 1, seed = 11 }) => {
  const houses = useMemo(() => {
    const r = lcg(seed);
    const out: { x: number; z: number; w: number; h: number; d: number; c: string; lit: boolean[] }[] = [];
    for (const side of [-1, 1]) {
      let z = 4;
      while (z > -90) {
        const w = 5 + r() * 3;
        const h = 4.5 + r() * 4.5;
        out.push({ x: side * (8.5 + r() * 0.8), z: z - w / 2, w, h, d: 6, c: ['#2A2433', '#2F2A3A', '#26283A', '#332A30'][Math.floor(r() * 4)], lit: Array.from({ length: 6 }, () => r() < 0.55) });
        z -= w + 0.6;
      }
    }
    return out;
  }, [seed]);
  return (
    <group>
      <Sky moon={moon} moonPos={[-18, 40, -170]} />
      <Box p={[0, -0.1, -40]} s={[11, 0.2, 140]} c="#1E2230" />
      <Box p={[-6.8, 0.05, -40]} s={[3, 0.3, 140]} c="#2C3040" />
      <Box p={[6.8, 0.05, -40]} s={[3, 0.3, 140]} c="#2C3040" />
      {Array.from({ length: 14 }, (_, i) => (
        <Box key={i} p={[0, 0.01, 4 - i * 9]} s={[0.25, 0.02, 3.2]} c="#8C8A7A" />
      ))}
      {houses.map((h, i) => {
        const side = Math.sign(h.x);
        const face = h.x - side * (h.d / 2 + 0.03);
        return (
          <group key={i}>
            <Box p={[h.x, h.h / 2, h.z]} s={[h.d, h.h, h.w]} c={h.c} />
            <Box p={[h.x, h.h + 0.25, h.z]} s={[h.d + 0.4, 0.5, h.w + 0.3]} c="#1A1722" />
            {h.lit.map((on, j) => {
              const row = Math.floor(j / 3);
              const col = j % 3;
              const y = 1.8 + row * 2.4;
              if (y > h.h - 0.8) return null;
              return <Glow key={j} p={[face, y, h.z - h.w / 2 + 1.1 + col * ((h.w - 2.2) / 2)]} s={[0.05, 1.1, 0.9]} c={on ? '#FFC774' : '#141725'} />;
            })}
          </group>
        );
      })}
      {[-1, 1].map((side) =>
        [0, 1, 2].map((i) => (
          <group key={`${side}-${i}`} position={[side * 5.6, 0, -4 - i * 22]}>
            <Box p={[0, 2.4, 0]} s={[0.18, 4.8, 0.18]} c="#2A2F3D" />
            <Glow p={[-side * 0.5, 4.7, 0]} s={[0.6, 0.25, 0.4]} c="#FFD9A0" />
            {i === 0 ? <pointLight position={[-side * 0.5, 4.4, 0]} intensity={18} distance={14} decay={1.5} color="#FFC98A" /> : null}
          </group>
        )),
      )}
      {/* parked car (blocks) */}
      <group position={[-3.6, 0, -9]}>
        <Box p={[0, 0.65, 0]} s={[1.9, 0.9, 4.2]} c="#5B2A3A" />
        <Box p={[0, 1.4, -0.2]} s={[1.7, 0.7, 2.2]} c="#4A2230" />
        <Glow p={[0, 1.42, 0.92]} s={[1.5, 0.5, 0.04]} c="#2B3550" />
      </group>
    </group>
  );
};
