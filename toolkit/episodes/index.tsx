// Short-form episode compositions made by /make-short. Code lives here (toolkit/episodes/<id>/<Comp>.tsx)
// because Remotion bundles from toolkit/; the episode's JSON (words/beats/shotlist) lives in
// studio/episodes/<id>/ and is imported from there. Register each new episode below — one line each:
//
//   import { SignalMediumPopcorn } from './2026-11-04-signal-medium-popcorn/SignalMediumPopcorn';
//   import popcornShots from '../../studio/episodes/2026-11-04-signal-medium-popcorn/shotlist.json';
//   <Composition id="SignalMediumPopcorn" component={SignalMediumPopcorn}
//     durationInFrames={popcornShots.durationInFrames} fps={30} width={1080} height={1920} />
//
// Start a new episode by COPYING the channel's canonical example (examples/signal-demo,
// examples/qrosity-demo, examples/whatif-countdown) into episodes/<id>/ — never by editing the example.
import React from 'react';
import { Folder } from 'remotion';

export const EpisodeCompositions: React.FC = () => (
  <Folder name="Episodes">
    {/* EPISODES:BEGIN — /make-short adds one <Composition> per episode here */}
    {/* EPISODES:END */}
  </Folder>
);
