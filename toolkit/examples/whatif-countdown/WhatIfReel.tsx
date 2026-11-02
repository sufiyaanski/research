// WhatIfReel — the reusable "What if X for N seconds?" countdown reel. ONE component, driven entirely
// by an episode config (schema.ts): title → real-time countdown → switch to slowed time with a look
// change → escalating acts (x-ray, POV hands, glow, white-out, scale jump to space) → return (point
// cloud) → blank → end card. No voice-over: the story is the HUD clock + one-line narration + the
// looks + code-synthesised sound (drone bed from sfx/drone-bed.mjs + catalog cues via <SfxTrack>).
//
// Structure: one <Stage3D> (transparent ThreeCanvas) with one <Sequence layout="none"> per 3D act
// (its own camera, set, look), the 2D layer on top (sky, white-out, title, HUD, narration, end card),
// audio at composition level (global frames). Frame-driven only; never useFrame().
import React, { useMemo } from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { MusicBed, SfxTrack } from '../../sfx/cues';
import { Stage3D } from '../character/Stage3D';
import type { Mood } from '../character/BlockyCharacter';
import { actAt, allCues, type Act, type WhatIfConfig } from './schema';
import { Look } from './components/Look';
import { ContactBlobs, GroundFixed, Picnic, buildWorld, type WorldData } from './components/World';
import { PovHands } from './components/Hands';
import { ActCamera, Moon, Planet, Satellite, Sparkles, Starfield, Streaks } from './components/Fx3D';
import { EndCard, Hud, NarrationLine, TitleCard, WhiteOut, whiteAmount } from './components/Overlays';

const VOID = '#050507';
const SKY_TOP = '#4F86C2';
const SKY_HORIZON = '#AFC6D8';

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Lights + haze for the calm, lit 'normal' look (no shadow maps: CPU renderer). */
const DayLights: React.FC = () => (
  <>
    <hemisphereLight args={['#E4F0FF', '#59683F', 1.5]} />
    <directionalLight position={[8, 14, 10]} intensity={2.1} color="#FFF0D8" />
    <directionalLight position={[-8, 5, 6]} intensity={0.55} color="#C8DAFF" />
    <fog attach="fog" args={[SKY_HORIZON, 40, 420]} />
  </>
);

const prevPeopleMood = (config: WhatIfConfig, act: Act): Mood | undefined => {
  const i = config.acts.indexOf(act);
  for (let k = i - 1; k >= 0; k--) if (config.acts[k].people) return config.acts[k].people!.mood;
  return undefined;
};

/** One act's 3D content. Frames are LOCAL to the act's Sequence. */
const ActScene: React.FC<{ config: WhatIfConfig; act: Act; world: WorldData }> = ({ config, act, world }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = Math.round((act.end - act.start) * fps);
  const k = Math.min(1, frame / Math.max(1, dur));
  const sec = frame / fps;
  const glow = act.glow ? lerp(act.glow[0], act.glow[1], k) : 0;
  const flowX = act.flow ? act.flow[0] * sec : 0;
  const cam = act.camera ? <ActCamera from={act.camera.from} to={act.camera.to} fov={act.camera.fov} dur={dur} shake={act.camera.shake} /> : null;
  const mood = act.people?.mood ?? 'neutral';
  const picnic = <Picnic fps={fps} mood={mood} prevMood={prevPeopleMood(config, act)} takeAt={Math.round(0.15 * fps)} />;
  const bg = <color attach="background" args={[VOID]} />;

  switch (act.look) {
    case 'normal':
      return (
        <>
          {cam}
          <DayLights />
          <GroundFixed world={world} flowX={flowX} />
          <ContactBlobs />
          {picnic}
        </>
      );
    case 'xray':
      return (
        <>
          {bg}
          {cam}
          <Look mode="xray" glow={glow} seed={config.world.seed}>
            <GroundFixed world={world} flowX={flowX} />
            {picnic}
          </Look>
        </>
      );
    case 'hands':
      return (
        <>
          {bg}
          {cam}
          <Look mode="xray" glow={glow} seed={config.world.seed} groundDensity={1.4} groundThrough>
            <GroundFixed world={world} flowX={flowX} />
            <PovHands />
          </Look>
        </>
      );
    case 'glow': {
      const burst = act.burst ? ([Math.round(act.burst[0] * fps), Math.round(act.burst[1] * fps)] as [number, number]) : null;
      const sources = burst ? world.windows.filter((w) => w.x > -60 && w.x < 60) : [];
      const d = act.streakDir ?? [1, 0, 0];
      return (
        <>
          {bg}
          {cam}
          <Look mode="xray" glow={glow} seed={config.world.seed}>
            {/* the wind front rips the canopies off the (ground-fixed) trees; windT counts from the first glow act */}
            <GroundFixed
              world={world}
              trees
              windT={act.start - (config.acts.find((x) => x.look === 'glow')?.start ?? act.start) + sec}
              clearAround={act.camera ? [act.camera.from.pos[0], act.camera.from.pos[2], 34] : undefined}
            />
          </Look>
          <Streaks count={160} box={{ min: [-90, 1, -149], max: [90, 95, -100] }} dir={d} speed={90} len={[8, 26]} amount={0.35 + 0.65 * glow} width={2.2} seed={5} />
          {/* round 3: each pane FLASHES as the front passes (stationary, short), then sheds shards downwind */}
          {burst ? <Sparkles sources={sources} wave={burst} xRange={[-60, 60]} perSource={1} dir={d} size={4.5} speed={[0, 0]} life={[0.25, 0.45]} color="#FFFFFF" seed={4} /> : null}
          {burst ? <Sparkles sources={sources} wave={burst} xRange={[-60, 60]} perSource={5} dir={d} size={2.6} /> : null}
        </>
      );
    }
    case 'space': {
      const moonPos = act.moon
        ? (() => {
            const a = act.moon![0] * fps;
            const b = act.moon![1] * fps;
            const u = Math.min(1, Math.max(0, (frame - a) / Math.max(1, b - a)));
            return [lerp(-15, 12, u), lerp(-1.5, 1.5, u), 30] as [number, number, number];
          })()
        : null;
      return (
        <>
          {bg}
          {cam}
          <directionalLight position={[-30, 10, 20]} intensity={1.6} color="#DDE8FF" />
          <ambientLight intensity={0.12} />
          <Starfield />
          {/* orbit view (no moon): equator turned up to the camera, so the texture's pole never shows */}
          <Planet radius={10} spin={-0.6 + 0.02 * (act.start + sec)} tilt={act.moon ? 0.35 : Math.PI / 2 + 0.2} />
          {moonPos ? <Moon position={moonPos} /> : null}
          {!act.moon ? <Satellite position={[lerp(4.4, 6.6, k), lerp(12.2, 12.0, k), lerp(1.6, -1.2, k)]} rotation={[0.3, 0.6 + 0.35 * k, 0.2]} scale={0.3} /> : null}
        </>
      );
    }
    case 'pointcloud': {
      const d = act.streakDir ?? [0, 1, 0];
      return (
        <>
          {bg}
          {cam}
          <Look mode="pointcloud" glow={glow} seed={config.world.seed} assemble={{ at: 0, dur: Math.round(1.5 * fps), spread: 3.5 }} groundDensity={0.5} density={520} pointSize={0.055}>
            <GroundFixed world={world} />
            {picnic}
          </Look>
          <Streaks count={110} box={{ min: [-14, 0, -18], max: [14, 26, 8] }} dir={d} speed={22} len={[1.5, 5]} color="#7FA6FF" amount={0.5 + 0.5 * glow} width={2} seed={8} />
        </>
      );
    }
    default:
      return null;
  }
};

export const WhatIfReel: React.FC<{ config: WhatIfConfig }> = ({ config }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const F = (s: number) => Math.round(s * fps);
  const world = useMemo(() => buildWorld(config.world.seed), [config.world.seed]);
  const act = actAt(config, frame / fps);
  const wo = config.acts.find((a) => a.look === 'whiteout');
  const white = wo ? whiteAmount(frame, { inStart: F(wo.start) - F(0.35), peak: F(wo.start), holdEnd: F(wo.end), outEnd: F(wo.end) + F(0.6) }) : 0;
  const cues = useMemo(() => allCues(config).map((c) => ({ id: c.id, at: Math.round(c.t * fps), gain: c.gain })), [config, fps]);
  return (
    <AbsoluteFill style={{ backgroundColor: VOID }}>
      {act.look === 'normal' ? <AbsoluteFill style={{ background: `linear-gradient(180deg, ${SKY_TOP} 0%, #86AEDA 30%, ${SKY_HORIZON} 50%, ${SKY_HORIZON} 100%)` }} /> : null}
      <Stage3D transparent ground={false} lights={false} shadows={false} toneMapping="none">
        {config.acts
          .filter((a) => !['whiteout', 'blank', 'endcard'].includes(a.look))
          .map((a) => (
            <Sequence key={a.id} name={`act ${a.id} (${a.look})`} from={F(a.start)} durationInFrames={F(a.end) - F(a.start)} layout="none">
              <ActScene config={config} act={a} world={world} />
            </Sequence>
          ))}
      </Stage3D>
      {act.look === 'blank' ? <AbsoluteFill style={{ backgroundColor: config.endCard.background }} /> : null}
      <WhiteOut amount={white} />
      <TitleCard config={config} />
      <Hud config={config} white={white} />
      <NarrationLine config={config} />
      <EndCard config={config} />
      <MusicBed src={config.audio.bed} volume={config.audio.bedVolume} loop={false} fadeIn={1} fadeOut={Math.round(0.8 * fps)} />
      <SfxTrack cues={cues} gain={config.audio.sfxMasterDb} />
    </AbsoluteFill>
  );
};
