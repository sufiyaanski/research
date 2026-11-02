// Long-form compositions (1920x1080 @ 30):
//   LongformChapter — ONE chapter from props { chapter: ChapterTimeline } (render-chapters.mjs renders
//                     each chapter separately with --props, so a 12-minute video is 7–9 resumable renders)
//   LongformEpisode — every chapter back to back (Studio preview + critique of a whole episode)
//   LongformThumb   — 1280x720 still: character + 3–5 words + one number/object
// Audio: chapters carry ONLY the SFX cues. Voice and music are mixed in by render-chapters.mjs with
// ffmpeg (sidechain ducking + loudness to −14 LUFS / −1 dBTP) so a VO re-take never needs a re-render.
import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { SfxTrack } from '../sfx/cues';
import { BlockyCharacter } from '../examples/character/BlockyCharacter';
import { FixedCamera, Stage3D } from '../examples/character/Stage3D';
import { BODY, DISPLAY, LF } from './kit';
import { NIGHT_THEME, ShoreSet, StreetSet } from './sets';
import { BigNumberScene, CompareBarsScene, DiagramScene, EndScreenScene, QuoteScene, TimelineScene, TitleScene, type TemplateProps } from './templates/paper';
import { NarratorScene, WhatIfScene } from './templates/night';
import type { ChapterTimeline, EpisodeTimeline, TemplateId, ThumbnailProps } from './types';

export const TEMPLATES: Record<TemplateId, React.FC<TemplateProps>> = {
  title: TitleScene,
  narrator: NarratorScene,
  bigNumber: BigNumberScene,
  compareBars: CompareBarsScene,
  diagram: DiagramScene,
  timeline: TimelineScene,
  quote: QuoteScene,
  whatif: WhatIfScene,
  endscreen: EndScreenScene,
};

/** SFX master: catalog files peak at −3 dBFS; −6 dB keeps riser+impact under 0 dBFS (HARNESS lesson). */
const SFX_MASTER_DB = -6;

const Missing: React.FC<{ id: string }> = ({ id }) => (
  <AbsoluteFill style={{ background: LF.paper, color: LF.ink, fontFamily: BODY, fontSize: 48, padding: 120 }}>unknown template “{id}”</AbsoluteFill>
);

export const ChapterBody: React.FC<{ chapter: ChapterTimeline; withSfx?: boolean }> = ({ chapter, withSfx = true }) => (
  <AbsoluteFill style={{ background: LF.night }}>
    {chapter.scenes.map((s) => {
      const T = TEMPLATES[s.template];
      return (
        <Sequence key={s.id} from={s.from} durationInFrames={s.durationInFrames} name={`${s.id} · ${s.template}`}>
          <AbsoluteFill>{T ? <T scene={s} chapter={chapter} /> : <Missing id={s.template} />}</AbsoluteFill>
        </Sequence>
      );
    })}
    {withSfx ? <SfxTrack cues={chapter.sfx} gain={SFX_MASTER_DB} /> : null}
  </AbsoluteFill>
);

export const LongformChapter: React.FC<{ chapter: ChapterTimeline }> = ({ chapter }) => <ChapterBody chapter={chapter} />;

export const LongformEpisode: React.FC<{ episode: EpisodeTimeline }> = ({ episode }) => (
  <AbsoluteFill style={{ background: LF.night }}>
    {episode.chapters.map((c) => (
      <Sequence key={c.id} from={c.startFrame} durationInFrames={c.durationInFrames} name={`${c.id} ${c.title}`}>
        <ChapterBody chapter={c} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

// ------------------------------------------------------------------------------------------ thumbnail
/**
 * 1280x720 thumbnail: the character big (≥ 60 % of the height), 3–5 words on the right, ONE object or
 * number. Thumbnail rules: readable at 160 px wide, ≤ 5 words, faces read, no small text.
 */
export const LongformThumb: React.FC<ThumbnailProps> = ({ text, number, set = 'shore', mood = 'shocked', ghostMoon = false }) => {
  useCurrentFrame();
  const words = text.split(' ');
  const mid = Math.ceil(words.length / 2);
  const lines = [words.slice(0, mid).join(' '), words.slice(mid).join(' ')].filter(Boolean);
  return (
    <AbsoluteFill style={{ background: LF.night }}>
      <Stage3D theme={NIGHT_THEME} ground={false} shadows={false}>
        <FixedCamera position={[-1.4, 2.3, 8.8]} lookAt={[-2.0, 3.0, 0]} fov={40} />
        {set === 'street' ? <StreetSet moon={ghostMoon ? 0 : 1} /> : <ShoreSet moon={ghostMoon ? 0 : 1} />}
        {/* a Still renders frame 0: shift the character 1 s into its own timeline so the shocked pose/take has landed */}
        <Sequence from={-30} layout="none">
          <BlockyCharacter pose="shocked" mood={mood} position={[-2.7, 0, 3.4]} rotationY={0.22} lookAt={[-1.4, 2.6, 8.8]} />
        </Sequence>
      </Stage3D>
      {ghostMoon ? (
        <svg width={1280} height={720} style={{ position: 'absolute', inset: 0 }}>
          <circle cx={430} cy={130} r={88} fill="none" stroke={LF.accent} strokeWidth={12} strokeDasharray="30 22" />
        </svg>
      ) : null}
      <div style={{ position: 'absolute', right: 56, top: 70, width: 640, textAlign: 'right' }}>
        {lines.map((l, i) => (
          <div key={i} style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 112, lineHeight: 0.98, color: LF.text, textShadow: '0 8px 0 rgba(0,0,0,0.6)' }}>
            {l}
          </div>
        ))}
        {number ? (
          <div style={{ display: 'inline-block', marginTop: 26, background: LF.accent, color: LF.ink, fontFamily: DISPLAY, fontWeight: 900, fontSize: 92, padding: '6px 26px', fontVariantNumeric: 'tabular-nums' }}>{number}</div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
