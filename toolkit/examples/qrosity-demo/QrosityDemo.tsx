// QrosityDemo — Q-ROSITY: "What if every screen on Earth went black for 10 seconds?" 15 s, 1080x1920 @ 30 fps.
//
// Drama, not a science lesson: me (bedroom) → my street → my city → the world → nothing → loop.
// ONE <Stage3D> (ThreeCanvas) for the whole reel; one <Sequence layout="none"> per shot inside it
// (its own set, lights, camera move and Q); 2D overlays (WHAT IF title, the 10-second countdown,
// captions) on top. Every moment comes from the shot list (shotlist.json: shots + sfx cues) or the VO
// grid (beats.json): the countdown lands on the spoken "10", steps on the tick cues and ends on the
// click that switches the screens back on — the same cues <SfxTrack> plays.
import React, { useLayoutEffect, useMemo } from 'react';
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';
import { loadFont as loadRubik } from '@remotion/google-fonts/Rubik';
import { loadFont as loadNunito } from '@remotion/google-fonts/Nunito';
import { parseShotList, useCaptionChunk, usePop, type BeatsFile } from '../../beat-grid';
import { MusicBed, SFX_IDS, SfxTrack } from '../../sfx/cues';
import { BlockyCharacter, takeLandFrames, type MoodKey, type PoseKey } from '../character/BlockyCharacter';
import { CameraRig, Stage3D, lcg, type CamState, type StageTheme } from '../character/Stage3D';
import shotListJson from './shotlist.json';
import voJson from './beats.json';

const display = loadRubik('normal', { weights: ['800', '900'], subsets: ['latin'] }).fontFamily;
const body = loadNunito('normal', { weights: ['700', '800'], subsets: ['latin'] }).fontFamily;

// QROSITY_STAGE overlay palette (setup/channels/q-rosity/brand.md §2)
export const QS = { ink: '#120A10', plate: 'rgba(18,10,16,0.82)', text: '#FFF6EC', muted: '#D9B8B0', accent: '#FFD23F', night: '#0A0D16' } as const;
const NIGHT: StageTheme = {
  sky: QS.night,
  fog: [16, 95],
  ground: '#141826',
  tile: '#1C2133',
  hemi: ['#3A4A7A', '#0A0A12'],
  key: { color: '#9FB0E8', intensity: 1 },
  fill: { color: '#5A6AA8', intensity: 0.4 },
  rim: { color: '#FFB347', intensity: 1 },
  exposure: 1.1,
};

const { shotList } = parseShotList(shotListJson, { sfxIds: SFX_IDS });
const vo = voJson as BeatsFile;
const BED_BPM = 100;
const SFX_MASTER_DB = -6;
// the 100 BPM bed tops out at −15.6 LUFS (generator true-peak cap) → +2.9 dB here (Remotion volume > 1 is a gain)
const BED_VOLUME = 1.4;

// ---------------------------------------------------------------------------------------------
// Timeline lookups (global frames) — no typed frame numbers
// ---------------------------------------------------------------------------------------------
const shot = (id: string) => {
  const s = shotList.shots.find((x) => x.id === id);
  if (!s) throw new Error(`no shot "${id}"`);
  return s;
};
const norm = (w: string) => w.replace(/[.,!?;:]+$/, '');
const onset = (word: string, nth = 1) => {
  const hits = (vo.words ?? []).filter((w) => norm(w.w) === word);
  if (!hits[nth - 1]) throw new Error(`word "${word}" #${nth} not in words.json`);
  return hits[nth - 1].start;
};
const allCues = (sfx: string) => shotList.shots.flatMap((s) => s.sfx.filter((c) => c.id === sfx).map((c) => s.start + c.at)).sort((a, b) => a - b);
const SH = Object.fromEntries(shotList.shots.map((s) => [s.id, s])) as Record<'hook' | 'blackout' | 'street' | 'city' | 'world' | 'dark' | 'alone' | 'loop', ReturnType<typeof shot>>;
const T = {
  black: onset('black'),
  ten: onset('10'),
  streetDark: onset('dark', 1),
  city: onset('city'),
  plane: onset('plane'),
  money: onset('money'),
  nothing: onset('nothing'),
  aloneDark: onset('dark', 2),
  keep: onset('keep'),
};
const COUNT_LAND = SH.blackout.start + SH.blackout.sfx.find((c) => c.id === 'pop')!.at; // the spoken "10"
const TICKS = allCues('tick');
const SCREENS_ON = SH.loop.start + SH.loop.sfx.find((c) => c.id === 'click')!.at;
const END_THUMP = SH.loop.start + SH.loop.sfx.find((c) => c.id === 'thump')!.at;
/** are the world's screens on at global frame f? */
const screensOn = (f: number) => f < T.black || f >= SCREENS_ON;

const ease = { out: Easing.out(Easing.cubic), inOut: Easing.inOut(Easing.cubic), in: Easing.in(Easing.cubic) };
const ramp = (f: number, a: number, b: number, e: (t: number) => number = ease.out) =>
  interpolate(f, [a, b], [0, 1], { easing: e, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const useSec = () => {
  const { fps } = useVideoConfig();
  return (s: number) => Math.round(s * fps);
};

// ---------------------------------------------------------------------------------------------
// 3D helpers
// ---------------------------------------------------------------------------------------------
type V3 = [number, number, number];
const Block: React.FC<{ p: V3; s: V3; c: string; rough?: number; rotY?: number }> = ({ p, s, c, rough = 0.95, rotY = 0 }) => (
  <mesh position={p} rotation={[0, rotY, 0]}>
    <boxGeometry args={s} />
    <meshStandardMaterial color={c} roughness={rough} metalness={0} />
  </mesh>
);
/** an unlit "screen"/light panel; `on` 0..1 mixes its lit colour with dead glass */
const Panel: React.FC<{ p: V3; s: V3; c: string; on: number; off?: string; rotY?: number; fog?: boolean }> = ({ p, s, c, on, off = '#07080D', rotY = 0, fog = true }) => {
  const col = useMemo(() => new THREE.Color(off).lerp(new THREE.Color(c), on), [c, off, on]);
  return (
    <mesh position={p} rotation={[0, rotY, 0]}>
      <boxGeometry args={s} />
      <meshBasicMaterial color={col} toneMapped={false} fog={fog} />
    </mesh>
  );
};
/** "$" built from boxes (same construction as the hoodie's "?") */
const DollarSign: React.FC<{ x: number; y: number; z: number; s: number; color: string }> = ({ x, y, z, s, color }) => {
  const t = s * 0.16;
  const bar = (p: V3, w: number, h: number) => (
    <mesh position={p}>
      <boxGeometry args={[w, h, 0.02]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
  return (
    <group position={[x, y, z]}>
      {bar([0, s * 0.42, 0], s * 0.55, t)}
      {bar([-s * 0.22, s * 0.21, 0], t, s * 0.42)}
      {bar([0, 0, 0], s * 0.55, t)}
      {bar([s * 0.22, -s * 0.21, 0], t, s * 0.42)}
      {bar([0, -s * 0.42, 0], s * 0.55, t)}
      {bar([0, 0, 0.001], t * 0.8, s * 1.15)}
    </group>
  );
};

/** soft dark contact blob under Q's feet (no shadow maps on a CPU renderer) */
const FeetBlob: React.FC<{ p?: V3; r?: number }> = ({ p = [0, 0.02, 0], r = 0.95 }) => (
  <mesh position={p} rotation={[-Math.PI / 2, 0, 0]}>
    <circleGeometry args={[r, 32]} />
    <meshBasicMaterial color="#000000" transparent opacity={0.45} depthWrite={false} />
  </mesh>
);

type Win = { p: V3; s: V3; on: string; offAt: number; stays?: boolean };
/**
 * Hundreds of windows / city lights in ONE instanced draw call. Colours are rewritten from the frame
 * every render (imperative write of frame-derived values, like CameraRig — not animation state).
 * `offAt` = local frame the light dies (≤ 0: dead from the start); `stays` = not a screen, never dies.
 */
const Lights: React.FC<{ items: Win[]; dead?: boolean; dark?: string }> = ({ items, dead = false, dark = '#0B0D14' }) => {
  const frame = useCurrentFrame();
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }), items.length);
    const o = new THREE.Object3D();
    items.forEach((w, i) => {
      o.position.set(...w.p);
      o.scale.set(...w.s);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, new THREE.Color(w.on));
    });
    m.frustumCulled = false;
    return m;
  }, [items]);
  useLayoutEffect(() => {
    const c = new THREE.Color();
    const off = new THREE.Color(dark);
    items.forEach((w, i) => {
      const k = w.stays ? 1 : dead ? 0 : 1 - Math.min(1, Math.max(0, (frame - w.offAt) / 2));
      c.set(w.on).lerp(off, 1 - k);
      mesh.setColorAt(i, c);
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [frame, items, mesh, dead, dark]);
  return <primitive object={mesh} />;
};

// ---------------------------------------------------------------------------------------------
// SET 1 — the bedroom (hook, blackout, alone, loop). `glow` 0..1 = his phone + monitor.
// ---------------------------------------------------------------------------------------------
const Bedroom: React.FC<{ glow: number }> = ({ glow }) => {
  const outside = useMemo<Win[]>(() => {
    const r = lcg(11);
    const out: Win[] = [];
    for (let i = 0; i < 26; i++) out.push({ p: [1.55 + r() * 1.7, 2.2 + r() * 1.5, -2.86], s: [0.08, 0.1, 0.01], on: r() < 0.6 ? '#7FB2FF' : '#FFC774', offAt: 0, stays: r() < 0.3 });
    return out;
  }, []);
  return (
    <group>
      {/* shell */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#2E2433" roughness={1} />
      </mesh>
      <Block p={[0, 3, -3]} s={[14, 6, 0.2]} c="#2A3050" />
      <Block p={[-4.3, 3, 0]} s={[0.2, 6, 10]} c="#242A44" />
      <Block p={[0, 0.06, -2.88]} s={[14, 0.12, 0.06]} c="#1A1C2A" />
      {/* window: night sky, the moon, the city outside (some of it screens) */}
      <Block p={[2.4, 3.0, -2.92]} s={[2.3, 2.1, 0.12]} c="#15182A" />
      <Panel p={[2.4, 3.0, -2.88]} s={[2.0, 1.8, 0.02]} c="#22355E" on={1} />
      <Panel p={[3.05, 3.55, -2.86]} s={[0.32, 0.32, 0.01]} c="#E8EEFF" on={1} />
      <Lights items={outside} dead={glow < 0.5} dark="#151C33" />
      <Block p={[2.4, 3.0, -2.85]} s={[0.07, 1.8, 0.03]} c="#15182A" />
      <Block p={[2.4, 3.0, -2.85]} s={[2.0, 0.07, 0.03]} c="#15182A" />
      {/* bed */}
      <Block p={[-2.7, 0.25, -1.1]} s={[2.4, 0.5, 3.4]} c="#4A3328" />
      <Block p={[-2.7, 0.65, -1.1]} s={[2.3, 0.3, 3.3]} c="#CFCBE0" />
      <Block p={[-2.7, 0.84, -0.6]} s={[2.36, 0.12, 2.2]} c="#3D4FA0" />
      <Block p={[-2.7, 0.92, -2.4]} s={[1.3, 0.25, 0.6]} c="#ECE8F5" />
      <Block p={[-2.7, 1.2, -2.85]} s={[2.4, 1.6, 0.15]} c="#4A3328" />
      {/* desk + monitor (a screen: it dies too) + lamp (off — it's night, he's on his phone) */}
      <Block p={[2.6, 1.45, -2.2]} s={[2.0, 0.1, 1.0]} c="#5A3D2E" />
      <Block p={[1.75, 0.72, -2.2]} s={[0.1, 1.45, 0.9]} c="#4A3328" />
      <Block p={[3.45, 0.72, -2.2]} s={[0.1, 1.45, 0.9]} c="#4A3328" />
      <Block p={[2.6, 1.75, -2.5]} s={[0.12, 0.5, 0.12]} c="#15151C" />
      <Block p={[2.6, 2.3, -2.55]} s={[1.35, 0.85, 0.08]} c="#101016" />
      <Panel p={[2.6, 2.3, -2.5]} s={[1.22, 0.74, 0.02]} c="#6FB4FF" on={glow} />
      <Block p={[3.2, 1.55, -2.0]} s={[0.5, 0.1, 0.3]} c="#22222A" />
      {/* poster + shelf with books on the side wall */}
      <Panel p={[-0.7, 3.6, -2.88]} s={[1.0, 1.4, 0.02]} c="#E6334B" on={0.55} off="#000000" />
      <Panel p={[-0.7, 3.35, -2.865]} s={[0.7, 0.18, 0.01]} c="#FFD23F" on={0.5} off="#000000" />
      <Block p={[-4.1, 2.6, -0.5]} s={[0.4, 0.08, 1.8]} c="#4A3328" />
      {[0, 1, 2, 3, 4].map((i) => (
        <Block key={i} p={[-4.05, 2.85, -1.2 + i * 0.3]} s={[0.3, 0.42 + (i % 2) * 0.08, 0.2]} c={['#6A33FF', '#FFD23F', '#1DB954', '#E6334B', '#DDF3FF'][i]} />
      ))}
      {/* rug */}
      <Block p={[0, 0.01, 0.6]} s={[3.2, 0.02, 2.2]} c="#5B2F4A" />
      {/* light: moon through the window (rim), a cool fill, the phone on his face, the monitor */}
      <hemisphereLight args={['#3B4A7A', '#120C14', 0.55]} />
      <directionalLight position={[5, 6, -7]} intensity={1.6} color="#8FA6E8" />
      <directionalLight position={[-3, 3, 6]} intensity={0.5 + 1.1 * (1 - glow)} color="#5A6AB0" />
      <pointLight position={[0.15, 2.1, 1.25]} intensity={9 * glow} distance={4.5} decay={1.4} color="#BFD8FF" />
      <pointLight position={[2.6, 2.3, -1.9]} intensity={7 * glow} distance={6} decay={1.5} color="#6FB4FF" />
    </group>
  );
};

// ---------------------------------------------------------------------------------------------
// SET 2 — the street (street, dark). Screens = TV-blue windows + billboards; warm windows + lamps stay.
// ---------------------------------------------------------------------------------------------
const STREET_NEAR = 6;
const STREET_FAR = -80;
const useStreetLayout = () =>
  useMemo(() => {
    const r = lcg(23);
    const blocks: { p: V3; s: V3; c: string }[] = [];
    const wins: Omit<Win, 'offAt'>[] = [];
    const boards: { p: V3; s: V3; c: string; rotY: number }[] = [];
    for (const side of [-1, 1]) {
      let z = STREET_NEAR;
      let n = 0;
      while (z > STREET_FAR) {
        const d = 5 + r() * 4;
        const h = 7 + r() * 14;
        const face = side * 6.2;
        blocks.push({ p: [side * (6.2 + 4), h / 2, z - d / 2], s: [8, h, d - 0.3], c: ['#1C2030', '#23273A', '#191C29'][Math.floor(r() * 3)] });
        for (let y = 1.4; y < h - 0.8; y += 1.9)
          for (let zz = z - 0.9; zz > z - d + 0.6; zz -= 1.4) {
            if (r() < 0.25) continue;
            const tv = r() < 0.68;
            wins.push({ p: [face - side * 0.03, y + 0.55, zz], s: [0.06, 1.0, 0.8], on: tv ? (r() < 0.5 ? '#7FB2FF' : '#9C8CFF') : '#FFC774', stays: !tv });
          }
        if (n % 2 === 1 && h > 10) boards.push({ p: [face - side * 0.12, 7.5 + r() * 2, z - d / 2], s: [0.12, 3.2, Math.min(4.2, d - 1)], c: ['#FF4FA3', '#3FE0FF', '#FFD23F', '#7CFF6B'][n % 4], rotY: 0 });
        z -= d;
        n++;
      }
    }
    return { blocks, wins, boards };
  }, []);

const Street: React.FC<{ waveFrom: number; waveTo: number; dead?: boolean; atm?: boolean }> = ({ waveFrom, waveTo, dead = false, atm = false }) => {
  const frame = useCurrentFrame();
  const { blocks, wins, boards } = useStreetLayout();
  // the dark wave rolls from the far end TOWARD Q (the lens): far screens die first
  const offAt = (z: number) => lerp(waveFrom, waveTo, (z - STREET_FAR) / (STREET_NEAR - STREET_FAR));
  const items = useMemo<Win[]>(() => wins.map((w) => ({ ...w, offAt: offAt(w.p[2]) })), [wins, waveFrom, waveTo]);
  const boardOn = (z: number) => (dead ? 0 : 1 - Math.min(1, Math.max(0, (frame - offAt(z)) / 2)));
  const lit = dead ? 0 : items.filter((w) => !w.stays && frame < w.offAt).length / Math.max(1, items.filter((w) => !w.stays).length);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -30]}>
        <planeGeometry args={[60, 140]} />
        <meshStandardMaterial color="#1A1D27" roughness={1} />
      </mesh>
      {/* sidewalks + kerbs */}
      <Block p={[-5.1, 0.1, -30]} s={[2.2, 0.2, 140]} c="#2B2E39" />
      <Block p={[5.1, 0.1, -30]} s={[2.2, 0.2, 140]} c="#2B2E39" />
      {/* lane dashes */}
      {Array.from({ length: 16 }, (_, i) => (
        <Panel key={i} p={[0, 0.012, 4 - i * 5.5]} s={[0.16, 0.01, 2.4]} c="#6E6A55" on={1} />
      ))}
      {blocks.map((b, i) => (
        <Block key={i} p={b.p} s={b.s} c={b.c} />
      ))}
      <Lights items={items} dead={dead} />
      {boards.map((b, i) => (
        <group key={i}>
          <Block p={[b.p[0] + Math.sign(b.p[0]) * 0.08, b.p[1], b.p[2]]} s={[0.1, b.s[1] + 0.3, b.s[2] + 0.3]} c="#0E0F16" />
          <Panel p={b.p} s={b.s} c={b.c} on={boardOn(b.p[2])} />
        </group>
      ))}
      {/* street lamps stay on (not screens) */}
      {[-1, 1].flatMap((side) =>
        [2, -10, -22, -34, -46].map((z) => (
          <group key={`${side}${z}`}>
            <Block p={[side * 4.4, 2.6, z]} s={[0.14, 5.2, 0.14]} c="#2C2F3A" />
            <Block p={[side * 3.9, 5.15, z]} s={[1.0, 0.12, 0.14]} c="#2C2F3A" />
            <Panel p={[side * 3.55, 5.05, z]} s={[0.45, 0.1, 0.3]} c="#FFD9A0" on={1} />
          </group>
        )),
      )}
      {/* parked cars, headlights off-ish (it's the screens that die) */}
      {[
        { p: [-2.6, 0, -9] as V3, c: '#7A2E3A' },
        { p: [2.6, 0, -18] as V3, c: '#2E5A7A' },
        { p: [-2.6, 0, -27] as V3, c: '#C9C3B5' },
      ].map((car, i) => (
        <group key={i} position={car.p}>
          <Block p={[0, 0.55, 0]} s={[1.9, 0.7, 4.2]} c={car.c} rough={0.6} />
          <Block p={[0, 1.15, -0.2]} s={[1.7, 0.55, 2.2]} c="#14161E" rough={0.4} />
          <Panel p={[-0.6, 0.6, 2.11]} s={[0.4, 0.18, 0.02]} c="#FFF1C4" on={1} />
          <Panel p={[0.6, 0.6, 2.11]} s={[0.4, 0.18, 0.02]} c="#FFF1C4" on={1} />
        </group>
      ))}
      {atm ? (
        // round 2: the ATM has to READ as money — lit green "$" header (a sign, not a screen: it stays
        // on), dead black screen, keypad, card slot, cash slot
        <group position={[2.0, 0, -0.3]} rotation={[0, -0.45, 0]}>
          <Block p={[0, 1.3, 0]} s={[1.5, 2.6, 1.0]} c="#4A5068" rough={0.5} />
          <Panel p={[0, 2.38, 0.51]} s={[1.3, 0.42, 0.02]} c="#1DB954" on={1} />
          <DollarSign x={0} y={2.38} z={0.53} s={0.34} color="#FFFFFF" />
          <Block p={[0, 1.78, 0.52]} s={[1.1, 0.72, 0.03]} c="#1A1C24" />
          <Panel p={[0, 1.78, 0.54]} s={[0.96, 0.6, 0.01]} c="#3FE0FF" on={0} off="#030306" />
          {[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => <Block key={`${r}${c}`} p={[-0.25 + c * 0.17, 1.22 - r * 0.13, 0.53]} s={[0.13, 0.1, 0.03]} c="#C9CDD8" />))}
          <Block p={[0.4, 1.12, 0.53]} s={[0.26, 0.05, 0.04]} c="#0C0D12" />
          <Block p={[0, 0.72, 0.53]} s={[0.8, 0.08, 0.04]} c="#0C0D12" />
        </group>
      ) : null}
      <hemisphereLight args={['#3A4A7A', '#0A0A12', 0.55]} />
      <directionalLight position={[-4, 9, -10]} intensity={1.4} color="#8FA6E8" />
      <directionalLight position={[3, 4, 8]} intensity={1.0} color="#5A6AA8" />
      <pointLight position={[-3.6, 4.8, 2]} intensity={14} distance={11} decay={1.3} color="#FFD9A0" />
      <pointLight position={[0, 6, -6]} intensity={22 * lit} distance={22} decay={1.2} color="#7F9BFF" />
    </group>
  );
};

// ---------------------------------------------------------------------------------------------
// SET 3 — the rooftop over the skyline (city). Wave sweeps left → right across the towers.
// ---------------------------------------------------------------------------------------------
const City: React.FC<{ waveFrom: number; waveTo: number }> = ({ waveFrom, waveTo }) => {
  const frame = useCurrentFrame();
  const layout = useMemo(() => {
    const r = lcg(41);
    const towers: { p: V3; s: V3; c: string }[] = [];
    const wins: Omit<Win, 'offAt'>[] = [];
    const boards: { p: V3; s: V3; c: string }[] = [];
    for (let i = 0; i < 46; i++) {
      const x = -70 + r() * 140;
      const z = -28 - r() * 90;
      const w = 5 + r() * 7;
      const top = -4 + r() * 34 + Math.max(0, 14 - Math.abs(x) * 0.25);
      const base = -60;
      const h = top - base;
      towers.push({ p: [x, base + h / 2, z], s: [w, h, w], c: ['#151827', '#1B1F31', '#121522'][i % 3] });
      for (let y = top - 1.2; y > top - 26; y -= 1.6)
        for (let xx = x - w / 2 + 0.7; xx < x + w / 2 - 0.5; xx += 1.2) {
          if (r() < 0.3) continue;
          const tv = r() < 0.72;
          wins.push({ p: [xx, y, z + w / 2 + 0.05], s: [0.8, 0.9, 0.08], on: tv ? (r() < 0.6 ? '#7FB2FF' : '#B59CFF') : '#FFC774', stays: !tv });
        }
      if (i % 5 === 0) boards.push({ p: [x, top - 4, z + w / 2 + 0.15], s: [w * 0.85, 4.5, 0.1], c: ['#FF4FA3', '#3FE0FF', '#FFD23F', '#7CFF6B'][i % 4] });
    }
    return { towers, wins, boards };
  }, []);
  const offAt = (x: number) => lerp(waveFrom, waveTo, (x + 70) / 140);
  const items = useMemo<Win[]>(() => layout.wins.map((w) => ({ ...w, offAt: offAt(w.p[0]) })), [layout, waveFrom, waveTo]);
  const litFrac = 1 - ramp(frame, waveFrom, waveTo, (t) => t);
  // the antenna's red aviation light blinks (not a screen: it keeps blinking)
  const blink = Math.floor(frame / 15) % 2 === 0 ? 1 : 0.15;
  return (
    <group>
      {/* roof */}
      <Block p={[0, -0.5, -1]} s={[12, 1, 10]} c="#2A2C38" />
      <Block p={[0, 0.4, -5.9]} s={[12, 0.8, 0.3]} c="#34374A" />
      <Block p={[-5.9, 0.4, -1]} s={[0.3, 0.8, 10]} c="#34374A" />
      <Block p={[5.9, 0.4, -1]} s={[0.3, 0.8, 10]} c="#34374A" />
      <Block p={[-3.4, 0.6, -3.6]} s={[1.8, 1.2, 1.4]} c="#3B3F52" />
      <Block p={[-3.4, 1.3, -3.6]} s={[1.2, 0.2, 1.0]} c="#2A2D3A" />
      <Block p={[3.6, 1.6, -4.2]} s={[1.6, 3.2, 1.6]} c="#3A2C2A" />
      <Block p={[4.6, 3.2, -4.6]} s={[0.12, 6.4, 0.12]} c="#454A5E" />
      <Panel p={[4.6, 6.45, -4.6]} s={[0.22, 0.22, 0.22]} c="#FF3B3B" on={blink} />
      {/* skyline */}
      {layout.towers.map((t, i) => (
        <Block key={i} p={t.p} s={t.s} c={t.c} />
      ))}
      <Lights items={items} />
      {layout.boards.map((b, i) => (
        <Panel key={i} p={b.p} s={b.s} c={b.c} on={1 - Math.min(1, Math.max(0, (frame - offAt(b.p[0])) / 2))} />
      ))}
      <hemisphereLight args={['#33406A', '#0A0A12', 0.6]} />
      <directionalLight position={[-6, 10, -12]} intensity={1.6} color="#9FB0E8" />
      <directionalLight position={[2, 3, 8]} intensity={1.0} color="#5A6AA8" />
      {/* the city's own glow on his face — it dies with the city */}
      <pointLight position={[0, 1.5, -9]} intensity={30 * litFrac} distance={16} decay={1.2} color="#9C8CFF" />
    </group>
  );
};

// ---------------------------------------------------------------------------------------------
// SET 4 — the world: a blocky night-side Earth, Q standing on top, planes circling.
// ---------------------------------------------------------------------------------------------
const R = 5.2;
const World: React.FC<{ sweepFrom: number; sweepTo: number; planesDarkAt: number }> = ({ sweepFrom, sweepTo, planesDarkAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const layout = useMemo(() => {
    const r = lcg(77);
    const land: { p: V3; s: number; q: THREE.Quaternion }[] = [];
    const cities: Omit<Win, 'offAt'>[] = [];
    const stars: Win[] = [];
    const centres: V3[] = [];
    for (let i = 0; i < 9; i++) {
      const th = -1.4 + r() * 2.8;
      const ph = 0.2 + r() * 1.2;
      centres.push([Math.sin(ph) * Math.sin(th), Math.cos(ph), Math.sin(ph) * Math.cos(th)]);
    }
    const up = new THREE.Vector3(0, 1, 0);
    for (const c of centres)
      for (let k = 0; k < 26; k++) {
        const v = new THREE.Vector3(c[0] + (r() - 0.5) * 0.5, c[1] + (r() - 0.5) * 0.5, c[2] + (r() - 0.5) * 0.5).normalize();
        if (v.y > 0.93) continue; // keep Q's spot on top clear
        land.push({ p: [v.x * R, v.y * R - R, v.z * R], s: 0.5 + r() * 0.5, q: new THREE.Quaternion().setFromUnitVectors(up, v) });
        if (r() < 0.75) cities.push({ p: [v.x * (R + 0.28), v.y * (R + 0.28) - R, v.z * (R + 0.28)], s: [0.16, 0.16, 0.16], on: r() < 0.7 ? '#FFD27A' : '#BFD8FF' });
      }
    for (let i = 0; i < 260; i++) {
      const v = new THREE.Vector3(r() - 0.5, r() * 0.9 - 0.2, -r()).normalize().multiplyScalar(70);
      stars.push({ p: [v.x, v.y, v.z], s: [0.18, 0.18, 0.18], on: '#C9D4FF', offAt: 0, stays: true });
    }
    return { land, cities, stars };
  }, []);
  // the dark sweeps around the globe by longitude, left to right
  const items = useMemo<Win[]>(() => layout.cities.map((c) => ({ ...c, offAt: lerp(sweepFrom, sweepTo, (Math.atan2(c.p[0], c.p[2]) + 1.6) / 3.2) })), [layout, sweepFrom, sweepTo]);
  const t = frame / fps;
  return (
    <group>
      <mesh position={[0, -R, 0]}>
        <icosahedronGeometry args={[R, 3]} />
        <meshStandardMaterial color="#215296" roughness={1} flatShading />
      </mesh>
      {layout.land.map((l, i) => (
        <mesh key={i} position={l.p} quaternion={l.q}>
          <boxGeometry args={[l.s, 0.36, l.s]} />
          <meshStandardMaterial color="#2C4A3A" roughness={1} />
        </mesh>
      ))}
      <Lights items={items} />
      <Lights items={layout.stars} />
      {/* planes: frame-driven orbits; after "plane" their lights (and cockpit screens) die and they tip */}
      {[0, 1, 2].map((i) => {
        const dark = frame >= planesDarkAt + i * 3;
        // round 2: planes circle ABOVE Q (they were orbiting out of frame) — r 3.4–5, y 3.2–5
        const ang = t * (0.55 + i * 0.1) + i * 2.1;
        const rad = 3.4 + i * 0.8;
        const alt = 3.2 + i * 0.9;
        const tip = dark ? ramp(frame, planesDarkAt + i * 3, planesDarkAt + i * 3 + 20, ease.inOut) * 0.5 : 0;
        const nav = dark ? 0 : Math.floor((frame + i * 7) / 12) % 2 === 0 ? 1 : 0.2;
        return (
          <group key={i} position={[0, alt - tip * 1.2, 0]}>
            <group rotation={[0, ang, 0]}>
              <group position={[rad, 0, 0]} rotation={[tip, 0, tip * 0.6]} scale={[1.5, 1.5, 1.5]}>
                <Block p={[0, 0, 0]} s={[0.22, 0.22, 1.1]} c="#E8E8F0" />
                <Block p={[0, 0, 0.05]} s={[1.3, 0.05, 0.3]} c="#C9C9D6" />
                <Block p={[0, 0.16, -0.48]} s={[0.05, 0.3, 0.2]} c="#C9C9D6" />
                <Panel p={[0, 0.08, 0.5]} s={[0.16, 0.08, 0.06]} c="#7FB2FF" on={dark ? 0 : 1} />
                <Panel p={[-0.66, 0, 0.05]} s={[0.08, 0.08, 0.08]} c="#FF3B3B" on={nav} />
                <Panel p={[0.66, 0, 0.05]} s={[0.08, 0.08, 0.08]} c="#3BFF6B" on={nav} />
              </group>
            </group>
          </group>
        );
      })}
      <hemisphereLight args={['#3A4A7A', '#0A0A12', 0.5]} />
      <directionalLight position={[-8, 6, -14]} intensity={2.4} color="#FFE7C4" />
      <directionalLight position={[3, 5, 10]} intensity={1.3} color="#6A7AC0" />
    </group>
  );
};

// ---------------------------------------------------------------------------------------------
// Cameras (frame 0 = HOOK_START; the loop glides back to it)
// ---------------------------------------------------------------------------------------------
const HOOK_START: CamState = { dist: 9.6, height: 2.5, angle: -0.38, target: [0, 2.05, 0] };
// round 3: the push-in no longer orbits toward the red poster (it crowded the title); HOOK_START
// is untouched because the locked loop shot glides back to it
const HOOK_END: CamState = { dist: 6.6, height: 2.7, angle: -0.42, target: [0, 2.3, 0] };

// ---------------------------------------------------------------------------------------------
// SHOTS — each returns the 3D (inside the canvas, local frames) for its Sequence
// ---------------------------------------------------------------------------------------------
const Q_LOOK_CAM: V3 = [1.0, 2.4, 9];
/** looking down at the phone, but not so far that the hair cap hides the face */
const PHONE_LOOK: V3 = [0.2, 2.0, 2.6];
// Framing rule used below (fov 36°, visible height ≈ 0.65·d): Q's head top (3.1 m) stays below
// y ≈ 540 px — clear of the WHAT IF title / countdown — when target.y ≥ 3.1 − 0.142·d.

const HookShot: React.FC = () => {
  const from = SH.hook.start;
  const len = SH.hook.end - from;
  return (
    <>
      <CameraRig from={HOOK_START} to={HOOK_END} dur={len} />
      <Bedroom glow={1} />
      <FeetBlob />
      <BlockyCharacter pose="phone" mood="neutral" lookAt={PHONE_LOOK} phoneGlow={1} />
    </>
  );
};

const BlackoutShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const from = SH.blackout.start;
  const sec = useSec();
  // screens die ON the reveal frame (the shot's first frame = "black?")
  const glow = screensOn(from + frame) ? 1 : 0;
  const land = takeLandFrames(fps);
  const pose: PoseKey[] = [
    { at: -1, pose: 'phone' },
    { at: sec(0.1), pose: 'shocked' },
  ];
  const mood: MoodKey[] = [
    { at: -land - 1, mood: 'neutral' },
    { at: -land, mood: 'shocked' },
    { at: T.ten - from + sec(0.3), mood: 'worried' },
  ];
  return (
    <>
      {/* round 3: wider (arms stay in frame), orbit off the poster */}
      <CameraRig from={{ dist: 9.0, height: 2.5, angle: -0.34, target: [0, 2.3, 0] }} to={{ dist: 8.4, height: 2.5, angle: -0.28, target: [0, 2.3, 0] }} shake={{ at: 0, amp: 0.2 }} />
      <Bedroom glow={glow} />
      <FeetBlob />
      <BlockyCharacter pose={pose} mood={mood} lookAt={Q_LOOK_CAM} phoneGlow={glow} seed={9} />
    </>
  );
};

const StreetShot: React.FC = () => {
  const frame = useCurrentFrame();
  const sec = useSec();
  const from = SH.street.start;
  const waveTo = T.streetDark - from; // the dark reaches Q on "dark"
  const look: V3 = [lerp(-5, 5, ramp(frame, 0, SH.street.end - from, ease.inOut)), 3.2, 6];
  return (
    <>
      <CameraRig from={{ dist: 13.5, height: 1.4, angle: 0.2, target: [0, 2.7, 0] }} to={{ dist: 12.5, height: 1.4, angle: 0.1, target: [0, 2.75, 0] }} />
      <Street waveFrom={sec(0.07)} waveTo={waveTo} />
      <FeetBlob />
      <BlockyCharacter pose="idle" mood="worried" lookAt={look} seed={21} />
    </>
  );
};

const CityShot: React.FC = () => {
  const { fps } = useVideoConfig();
  const sec = useSec();
  const from = SH.city.start;
  const len = SH.city.end - from;
  const cityAt = T.city - from;
  const pose: PoseKey[] = [
    { at: -1, pose: 'idle' },
    { at: cityAt - sec(0.2), pose: 'point' },
  ];
  const mood: MoodKey[] = [
    { at: -1, mood: 'worried' },
    { at: cityAt - takeLandFrames(fps), mood: 'shocked' },
  ];
  return (
    <>
      {/* low angle on the consequence */}
      {/* round 2: target.y 3.0 → 1.6 so the face sits above the caption block (was under the plate) */}
      <CameraRig from={{ dist: 11.5, height: 0.6, angle: 0.3, target: [0.4, 1.6, 0] }} to={{ dist: 10.8, height: 0.6, angle: 0.16, target: [0.4, 1.65, 0] }} />
      <City waveFrom={sec(0.1)} waveTo={len - sec(0.2)} />
      <FeetBlob />
      <BlockyCharacter pose={pose} mood={mood} rotationY={-0.15} lookAt={[3, 4.5, 5]} seed={33} />
    </>
  );
};

const WorldShot: React.FC = () => {
  const sec = useSec();
  const from = SH.world.start;
  const len = SH.world.end - from;
  return (
    <>
      {/* orbit ≈ 17° on the reveal of the scale */}
      <CameraRig from={{ dist: 22, height: 4.6, angle: -0.15, target: [0, 0.5, 0] }} to={{ dist: 21, height: 4.6, angle: 0.15, target: [0, 0.5, 0] }} />
      <World sweepFrom={sec(0.1)} sweepTo={len - sec(0.3)} planesDarkAt={T.plane - from} />
      <FeetBlob r={0.8} />
      <BlockyCharacter pose="idle" mood="worried" lookAt={[3, 6, 6]} seed={44} />
    </>
  );
};

const DarkShot: React.FC = () => {
  const { fps } = useVideoConfig();
  const sec = useSec();
  const from = SH.dark.start;
  const moneyAt = T.money - from;
  const pose: PoseKey[] = [
    { at: -1, pose: 'idle' },
    { at: moneyAt - sec(0.3), pose: 'point' },
    { at: T.nothing - from, pose: 'idle' },
  ];
  const mood: MoodKey[] = [
    { at: -1, mood: 'worried' },
    { at: T.nothing - from - takeLandFrames(fps), mood: 'shocked' },
  ];
  return (
    <>
      {/* round 2: target.y 2.5 → 1.8 (face above the caption block) */}
      <CameraRig from={{ dist: 9.4, height: 1.1, angle: 0.34, target: [0.9, 1.8, 0] }} to={{ dist: 8.8, height: 1.1, angle: 0.2, target: [0.9, 1.85, 0] }} />
      <Street waveFrom={0} waveTo={0} dead atm />
      <FeetBlob />
      <BlockyCharacter pose={pose} mood={mood} rotationY={0.3} lookAt={[2.4, 1.8, 0.6]} seed={55} />
    </>
  );
};

const AloneShot: React.FC = () => {
  const { fps } = useVideoConfig();
  const from = SH.alone.start;
  const mood: MoodKey[] = [
    { at: -1, mood: 'shocked' },
    { at: T.aloneDark - from - takeLandFrames(fps), mood: 'worried' },
  ];
  return (
    <>
      {/* round 3: target.y 2.45 → 2.25 (chin above the caption block), orbit off the poster */}
      <CameraRig from={{ dist: 6.2, height: 2.4, angle: -0.32, target: [0, 2.25, 0] }} to={{ dist: 5.8, height: 2.4, angle: -0.26, target: [0, 2.25, 0] }} />
      <Bedroom glow={0} />
      <FeetBlob />
      <BlockyCharacter pose="idle" mood={mood} lookAt={Q_LOOK_CAM} seed={66} />
    </>
  );
};

const LoopShot: React.FC = () => {
  const frame = useCurrentFrame();
  const sec = useSec();
  const from = SH.loop.start;
  const on = SCREENS_ON - from;
  const glow = screensOn(from + frame) ? 1 : 0;
  const pose: PoseKey[] = [
    { at: -1, pose: 'idle' },
    { at: T.keep - from, pose: 'phone' },
  ];
  const mood: MoodKey[] = [
    { at: -1, mood: 'worried' },
    { at: on, mood: 'happy' },
    { at: T.keep - from, mood: 'neutral' },
  ];
  // glide back to frame 0's camera, landing with the title so the last frame ≈ frame 0
  return (
    <>
      <CameraRig from={{ dist: 5.4, height: 2.5, angle: 0.0, target: [0, 2.5, 0] }} to={HOOK_START} dur={END_THUMP - from - sec(0.1)} />
      <Bedroom glow={glow} />
      <FeetBlob />
      <BlockyCharacter pose={pose} mood={mood} lookAt={frame < T.keep - from ? Q_LOOK_CAM : PHONE_LOOK} phoneGlow={glow} />
    </>
  );
};

const SHOTS: Record<string, React.FC> = { hook: HookShot, blackout: BlackoutShot, street: StreetShot, city: CityShot, world: WorldShot, dark: DarkShot, alone: AloneShot, loop: LoopShot };

// ---------------------------------------------------------------------------------------------
// 2D overlays
// ---------------------------------------------------------------------------------------------
/** WHAT IF + premise, rising out of a mask line (frame 0: already landed). */
const Title: React.FC<{ at: number; until?: number }> = ({ at, until }) => {
  const frame = useCurrentFrame();
  const sec = useSec();
  const enter = sec(0.33);
  const exit = sec(0.17);
  const line = (i: number) => {
    const a = at + i * sec(0.1);
    const inT = ramp(frame, a, a + enter, ease.out);
    const outT = until === undefined ? 0 : ramp(frame, until, until + exit, ease.in);
    return `translateY(${(1 - inT) * 110 - outT * 110}%)`;
  };
  const shadow = '0 6px 0 rgba(0,0,0,0.55)';
  return (
    <div style={{ position: 'absolute', top: 228, left: 70, right: 70, textAlign: 'center' }}>
      <div style={{ overflow: 'hidden' }}>
        <div style={{ transform: line(0), fontFamily: display, fontWeight: 900, fontSize: 150, lineHeight: 1.0, letterSpacing: '-0.02em', color: QS.text, textShadow: shadow }}>WHAT IF</div>
      </div>
      <div style={{ overflow: 'hidden', marginTop: 6 }}>
        <div style={{ transform: line(1), fontFamily: body, fontWeight: 800, fontSize: 56, lineHeight: 1.12, color: QS.accent, textShadow: shadow }}>
          every screen on Earth went
          <br />
          black for 10 seconds?
        </div>
      </div>
    </div>
  );
};

/** The 10-second countdown: lands on the spoken "10", one step per tick cue, 0 on the click. */
const Countdown: React.FC = () => {
  const frame = useCurrentFrame();
  const sec = useSec();
  const pop = usePop([COUNT_LAND, ...TICKS], { peak: 1.12 });
  if (frame < COUNT_LAND - sec(0.1) || frame >= SCREENS_ON + sec(0.45)) return null;
  const value = frame >= SCREENS_ON ? 0 : 10 - TICKS.filter((t) => frame >= t).length;
  const stamp = ramp(frame, COUNT_LAND - sec(0.1), COUNT_LAND + sec(0.1), ease.out);
  const exitT = ramp(frame, SCREENS_ON + sec(0.2), SCREENS_ON + sec(0.4), ease.in);
  const shadow = '0 8px 0 rgba(0,0,0,0.6)';
  return (
    <div style={{ position: 'absolute', top: 236, left: 70, right: 70, textAlign: 'center', transform: `translateY(${-exitT * 140}%)`, opacity: frame < COUNT_LAND - sec(0.1) ? 0 : 1 }}>
      <div
        style={{
          fontFamily: display,
          fontWeight: 900,
          fontSize: 230,
          lineHeight: 0.9,
          color: QS.accent,
          fontVariantNumeric: 'tabular-nums',
          textShadow: shadow,
          scale: String(lerp(1.3, 1, stamp) * pop),
        }}
      >
        {value}
      </div>
      <div style={{ marginTop: 8, fontFamily: body, fontWeight: 800, fontSize: 40, letterSpacing: '0.18em', color: QS.text, textShadow: shadow }}>SECONDS OF DARK</div>
    </div>
  );
};

const Captions: React.FC = () => {
  const { chunk, words } = useCaptionChunk(vo);
  const pop = usePop(vo.pops ?? []);
  if (!chunk) return null;
  return (
    <div style={{ position: 'absolute', left: 70, width: 860, top: 1080, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: QS.plate, borderRadius: 22, padding: '14px 30px 18px', textAlign: 'center', fontFamily: body, fontWeight: 800, fontSize: 64, lineHeight: 1.12 }}>
        {words.map((w, i) => (
          <span key={i} style={{ display: 'inline-block', margin: '0 9px', color: w.pop ? QS.accent : w.spoken ? QS.text : 'rgba(255,246,236,0.42)', scale: w.pop && w.active ? String(pop) : '1', fontVariantNumeric: 'tabular-nums' }}>
            {w.w}
          </span>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// Composition
// ---------------------------------------------------------------------------------------------
export const QrosityDemo: React.FC = () => {
  const sec = useSec();
  return (
    <AbsoluteFill style={{ backgroundColor: QS.night }}>
      <Stage3D theme={NIGHT} ground={false} lights={false} shadows={false}>
        {shotList.shots.map((s) => {
          const C = SHOTS[s.id];
          if (!C) throw new Error(`no 3D shot for "${s.id}"`);
          return (
            <Sequence key={s.id} name={`3d-${s.id}`} from={s.start} durationInFrames={s.end - s.start} layout="none">
              <C />
            </Sequence>
          );
        })}
      </Stage3D>
      <Title at={-sec(1)} until={T.black} />
      <Title at={END_THUMP - sec(0.33)} />
      <Countdown />
      <Captions />
      {/* mix: catalog SFX peak at −3 dBFS, so +3 dB cues clip on top of the bed → SFX master −6 dB;
          bed (−15.6 LUFS file, the generator's true-peak cap, +2.9 dB here) ducks −3 dB under the VO word ranges (no VO audio in this demo)
          AND through the pre-reveal pause + blackout hit — it summed with the impact to 0 dBFS */}
      <MusicBed src={`music/qrosity-bed-${BED_BPM}.wav`} bpm={BED_BPM} volume={BED_VOLUME} duckFrames={[...(vo.words ?? []), { start: T.black - sec(0.5), end: T.black + sec(0.4) }]} duckDb={-3} />
      <SfxTrack shotList={shotList} gain={SFX_MASTER_DB} />
    </AbsoluteFill>
  );
};
