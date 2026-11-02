// ToolkitSmoke — 4 s proof that the toolkit pieces agree on ONE timeline:
//   beat grid (120 BPM, 15 f/beat) · shot list as states · VO caption chunks + money-word pops ·
//   SFX cues whose peaks land on shot events · music bed ducked under the VO words.
// The counter steps are driven by the SAME tick cues the SfxTrack plays, so picture and sound
// cannot drift apart.
import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { loadFont as loadArchivo } from '@remotion/google-fonts/Archivo';
import { loadFont as loadManrope } from '@remotion/google-fonts/Manrope';
import { parseShotList, useBeatGrid, useCaptionChunk, usePop, useShot, type BeatsFile } from '../../beat-grid';
import { MusicBed, SFX_IDS, SfxTrack } from '../../sfx/cues';
import shotListJson from './smoke.shotlist.json';
import bpmBeatsJson from './smoke.bpm-beats.json';
import voBeatsJson from './smoke.vo-beats.json';

const display = loadArchivo('normal', { weights: ['800', '900'], subsets: ['latin'] }).fontFamily;
const body = loadManrope('normal', { weights: ['600', '800'], subsets: ['latin'] }).fontFamily;

export const SIGNAL = { cream: '#F4EFE6', ink: '#1B1B1B', red: '#D7263D', mute: 'rgba(27,27,27,0.38)' } as const;

const { shotList } = parseShotList(shotListJson, { sfxIds: SFX_IDS });
const bpmBeats = bpmBeatsJson as BeatsFile;
const voBeats = voBeatsJson as BeatsFile;

// counter steps = the tick cues of the "count" shot (global frames)
const countShot = shotList.shots.find((s) => s.id === 'count')!;
const tickFrames = countShot.sfx.filter((c) => c.id === 'tick').map((c) => countShot.start + c.at);
const COUNT_VALUES = [40, 32, 24, 16, 8, 4];

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const BeatHud: React.FC = () => {
  const g = useBeatGrid(bpmBeats);
  const { shot } = useShot(shotList);
  return (
    <div style={{ position: 'absolute', top: 240, left: 64, right: 160, display: 'flex', alignItems: 'center', gap: 18, fontFamily: body }}>
      {bpmBeats.beats.map((b, i) => (
        <div
          key={b}
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            background: i === g.beatIndex ? SIGNAL.ink : 'transparent',
            border: `3px solid ${SIGNAL.ink}`,
            scale: i === g.beatIndex ? 1 + 0.5 * g.pulse(8) : 1,
            opacity: i <= g.beatIndex ? 1 : 0.35,
          }}
        />
      ))}
      <div style={{ marginLeft: 'auto', fontSize: 30, fontWeight: 800, letterSpacing: 2, color: SIGNAL.ink, textTransform: 'uppercase' }}>{shot.id}</div>
    </div>
  );
};

const PriceStage: React.FC = () => {
  const frame = useCurrentFrame();
  const { shot, localFrame } = useShot(shotList);
  const pop = usePop(voBeats.pops ?? [], { peak: 1.12, frames: 6 });

  // value: 40 until the first tick, then one step per tick cue
  const step = tickFrames.filter((f) => frame >= f).length;
  const value = COUNT_VALUES[Math.min(step, COUNT_VALUES.length - 1)];
  const isReveal = frame >= 61; // VO "$4." onset (voBeats.pops[1])
  const isPayoff = shot.id === 'payoff';

  // hook: drop in, land on frame 8 (thump)
  const drop = interpolate(frame, [0, 8], [-420, 0], { ...clamp, easing: Easing.in(Easing.cubic) });
  const squash = interpolate(frame, [8, 11, 16], [0.9, 1.04, 1], clamp);
  const lift = isPayoff ? interpolate(localFrame, [0, 10], [0, -60], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) }) : 0;

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          fontFamily: display,
          fontWeight: 900,
          fontSize: isReveal ? 420 : 360,
          lineHeight: 1,
          letterSpacing: -12,
          color: isReveal ? SIGNAL.red : SIGNAL.ink,
          translate: `0px ${drop + lift - 120}px`,
          scale: (frame < 30 ? squash : 1) * pop,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        ${value}
      </div>
      {isPayoff ? (
        <>
          <div
            style={{
              position: 'absolute',
              top: 330,
              fontFamily: display,
              fontWeight: 800,
              fontSize: 120,
              color: SIGNAL.mute,
              textDecoration: 'line-through',
              textDecorationThickness: 10,
              opacity: interpolate(localFrame, [0, 8], [0, 1], clamp),
            }}
          >
            $40
          </div>
          <div
            style={{
              position: 'absolute',
              top: 1010,
              left: 64,
              right: 160,
              textAlign: 'center',
              fontFamily: display,
              fontWeight: 900,
              fontSize: 96,
              lineHeight: 1.02,
              textTransform: 'uppercase',
              color: SIGNAL.ink,
              translate: `0px ${interpolate(localFrame, [0, 6], [80, 0], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) })}px`,
              opacity: interpolate(localFrame, [0, 4], [0, 1], clamp),
            }}
          >
            10× markup
          </div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};

const Captions: React.FC = () => {
  const { chunk, words, localFrame } = useCaptionChunk(voBeats);
  const pop = usePop(voBeats.pops ?? []);
  if (!chunk) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top: 1330,
        left: 64,
        right: 160,
        textAlign: 'center',
        fontFamily: body,
        fontWeight: 800,
        fontSize: 72,
        lineHeight: 1.1,
        opacity: interpolate(localFrame, [0, 3], [0, 1], clamp),
        translate: `0px ${interpolate(localFrame, [0, 5], [16, 0], { ...clamp, easing: Easing.out(Easing.cubic) })}px`,
      }}
    >
      {words.map((w, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            margin: '0 12px',
            color: w.pop ? SIGNAL.red : w.spoken ? SIGNAL.ink : SIGNAL.mute,
            scale: w.pop && w.active ? pop : 1,
          }}
        >
          {w.w}
        </span>
      ))}
    </div>
  );
};

export const ToolkitSmoke: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: SIGNAL.cream }}>
    <PriceStage />
    <BeatHud />
    <Captions />
    {/* sound: bed ducked under VO words, then every shot's cues (peaks on their frames) */}
    <MusicBed bpm={120} volume={0.9} duckFrames={voBeats.words ?? []} />
    <SfxTrack shotList={shotList} />
  </AbsoluteFill>
);
