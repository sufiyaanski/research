import React from 'react';
import { Composition, Folder } from 'remotion';
import { SignalAnchoring } from './episodes/signal-001-anchoring/Episode';
import anchoringBeats from './episodes/signal-001-anchoring/beats.json';
import { QrosityPlaceholder } from './episodes/qrosity-000-placeholder/Episode';
import { FPS, H, W } from './lib/timing';

// One <Composition> per episode. Ids are PascalCase and match beats.json "composition".
// Duration comes from beats.json so script, captions and composition can never disagree.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="TheSignal">
        <Composition
          id="SignalAnchoring"
          component={SignalAnchoring}
          durationInFrames={Math.round(anchoringBeats.format.durationSec * FPS)}
          fps={FPS}
          width={W}
          height={H}
          defaultProps={{ guides: false }}
        />
      </Folder>
      <Folder name="QRosity">
        <Composition
          id="QrosityPlaceholder"
          component={QrosityPlaceholder}
          durationInFrames={10 * FPS}
          fps={FPS}
          width={W}
          height={H}
          defaultProps={{ guides: false }}
        />
      </Folder>
    </>
  );
};
