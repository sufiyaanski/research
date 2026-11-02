// Long-form contracts (1920x1080 @ 30). The planner (plan.mjs) turns an episode folder
// (episode.json + chapters/*.json + words.json from voice/tts.py) into timeline.json: every chapter,
// scene, word and SFX cue in FRAMES. Compositions only read timeline data — no typed frame numbers.

export type TemplateId = 'title' | 'narrator' | 'bigNumber' | 'compareBars' | 'diagram' | 'timeline' | 'quote' | 'whatif' | 'endscreen';
export type ChapterKind = 'cold-open' | 'promise' | 'chapter' | 'payoff' | 'end-screen';
export type SetId = 'shore' | 'street' | 'plain';

/** A word on the timeline, frames LOCAL to its scene (f0 = first frame, f1 = end). */
export type SceneWord = {
  w: string;
  f0: number;
  f1: number;
};

export type SfxCueSpec = {
  id: string;
  /** frame LOCAL to the chapter where the sound's peak lands */
  at: number;
  gain?: number;
};

export type TimedScene = {
  id: string;
  template: TemplateId;
  /** template props as written in chapters/*.json (see longform/README.md for each template) */
  props: Record<string, unknown>;
  /** first frame inside the chapter, and length in frames */
  from: number;
  durationInFrames: number;
  words: SceneWord[];
  /** the VO text of the scene (for the critique sheet / description) */
  text: string;
  rehook?: boolean;
};

export type ChapterTimeline = {
  episode: string;
  id: string;
  kind: ChapterKind;
  title: string;
  /** chapter index in the episode (0 = cold open) — chapter cards print "Chapter <n>" from it */
  index: number;
  /** "Chapter one" style label for chapter cards, '' for cold open / end screen */
  label: string;
  fps: number;
  width: number;
  height: number;
  /** first frame of this chapter in the full episode */
  startFrame: number;
  durationInFrames: number;
  scenes: TimedScene[];
  sfx: SfxCueSpec[];
};

export type EpisodeTimeline = {
  id: string;
  title: string;
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  voice: { source: string; aligner: string | null; mock: boolean; totalSec: number };
  chapters: ChapterTimeline[];
};

export type ThumbnailProps = {
  /** 3–5 words, ALL CAPS reads best */
  text: string;
  /** one number or short tag shown as an object (e.g. "9:00 PM", "1/3", "46%") */
  number?: string;
  set?: SetId;
  mood?: 'neutral' | 'worried' | 'shocked' | 'happy';
  /** dashed outline of the missing thing (what-if "gone" object) */
  ghostMoon?: boolean;
};
