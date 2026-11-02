// Studio registrations for the content studio (long-form). Mounted once in src/Root.tsx between
// {/* STUDIO:BEGIN */} and {/* STUDIO:END */}. Add new studio compositions HERE (long-form) or in
// toolkit/episodes/index.tsx (shorts made by /make-short) — never in Root.tsx.
import React from 'react';
import { Composition, Folder } from 'remotion';
import { LongformChapter, LongformEpisode, LongformThumb } from './Longform';
import { EpisodeCompositions } from '../episodes';
import type { ChapterTimeline, EpisodeTimeline, ThumbnailProps } from './types';
import demoTimeline from './demo/timeline.json';
import demoEpisode from './demo/episode.json';
import previewTimeline from './preview/timeline.json';

const demo = demoTimeline as unknown as EpisodeTimeline;
// written by render-chapters.mjs for whichever episode was planned last (critique: LongformPreview)
const preview = previewTimeline as unknown as EpisodeTimeline;
const demoThumb = (demoEpisode as { thumbnail: ThumbnailProps }).thumbnail;

export const StudioCompositions: React.FC = () => (
  <>
  <EpisodeCompositions />
  <Folder name="Longform">
    {/* one chapter from --props (render-chapters.mjs); default = the demo's first chapter */}
    <Composition
      id="LongformChapter"
      component={LongformChapter}
      defaultProps={{ chapter: demo.chapters[0] as ChapterTimeline }}
      calculateMetadata={({ props }) => ({
        durationInFrames: props.chapter.durationInFrames,
        fps: props.chapter.fps,
        width: props.chapter.width,
        height: props.chapter.height,
      })}
      durationInFrames={demo.chapters[0].durationInFrames}
      fps={demo.fps}
      width={demo.width}
      height={demo.height}
    />
    {/* the whole demo excerpt in one timeline (Studio preview + critique stills) */}
    <Composition id="LongformDemo" component={LongformEpisode} defaultProps={{ episode: demo }} durationInFrames={demo.durationInFrames} fps={demo.fps} width={demo.width} height={demo.height} />
    <Composition id="LongformPreview" component={LongformEpisode} defaultProps={{ episode: preview }} durationInFrames={preview.durationInFrames} fps={preview.fps} width={preview.width} height={preview.height} />
    {/* a 1-frame Composition at 30 fps, not a <Still> (fps 1): the character's blink/take timing is in seconds × fps */}
    <Composition id="LongformThumb" component={LongformThumb} defaultProps={demoThumb} durationInFrames={1} fps={30} width={1280} height={720} />
  </Folder>
  </>
);
