import React from 'react';
import { Composition, Folder } from 'remotion';
import { ToolkitSmoke } from './smoke/ToolkitSmoke';
import smokeShots from './smoke/smoke.shotlist.json';

// Pipeline standard: 1080x1920 @ 30 fps. Duration comes from the shot list so the shot list,
// beat grid and composition can never disagree.
export const FPS = 30;
export const W = 1080;
export const H = 1920;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Toolkit">
        <Composition
          id="ToolkitSmoke"
          component={ToolkitSmoke}
          durationInFrames={smokeShots.durationInFrames}
          fps={FPS}
          width={W}
          height={H}
        />
      </Folder>

      {/* ===================================================================================
          EXAMPLES — registered here by the examples agent. Put each composition under
          toolkit/examples/<name>/ and add it below, e.g.:

          import { SignalExample } from '../examples/signal/SignalExample';
          import signalShots from '../examples/signal/shotlist.json';
          <Folder name="Examples">
            <Composition id="SignalExample" component={SignalExample}
              durationInFrames={signalShots.durationInFrames} fps={FPS} width={W} height={H} />
          </Folder>
          =================================================================================== */}
      {/* EXAMPLES:BEGIN */}
      {/* EXAMPLES:END */}
    </>
  );
};
