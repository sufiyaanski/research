// WhatIfDemo — the demo episode of the what-if countdown format:
// "What if Earth stopped spinning for 5 seconds?" 45 s, 1080×1920 @ 30 fps. All content is in
// whatif.config.ts (facts + sources: facts.md); this file only validates it and mounts the reel.
import React from 'react';
import { WhatIfReel } from './WhatIfReel';
import { parseWhatIfConfig } from './schema';
import raw from './whatif.config';

export const { config: demoConfig } = parseWhatIfConfig(raw);
export const WHATIF_DEMO_FRAMES = Math.round(demoConfig.durationSec * demoConfig.fps);

export const WhatIfDemo: React.FC = () => <WhatIfReel config={demoConfig} />;
