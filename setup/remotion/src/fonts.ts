// Fonts via @remotion/google-fonts: type-safe, bundled at render time, and loadFont() blocks
// the frame (delayRender) until the font is ready — so there is no FOUT in stills or video.
// No runtime fetches anywhere else in the project.
//
// Two-font system per channel. Avoid the "generated look" defaults (Inter, Space Grotesk,
// JetBrains Mono, Geist) on purpose.
import { loadFont as loadArchivo } from '@remotion/google-fonts/Archivo';
import { loadFont as loadManrope } from '@remotion/google-fonts/Manrope';
import { loadFont as loadRubik } from '@remotion/google-fonts/Rubik';
import { loadFont as loadNunito } from '@remotion/google-fonts/Nunito';

// THE SIGNAL — Archivo for display/numbers (wide, confident, has tabular figures),
// Manrope for body/captions (clean, geometric, friendly numerals).
const signalDisplay = loadArchivo('normal', { weights: ['600', '700', '800', '900'], subsets: ['latin'] });
const signalBody = loadManrope('normal', { weights: ['500', '600', '700', '800'], subsets: ['latin'] });

// Q-ROSITY — Rubik Black for chunky titles, Nunito for rounded friendly body.
const qDisplay = loadRubik('normal', { weights: ['700', '800', '900'], subsets: ['latin'] });
const qBody = loadNunito('normal', { weights: ['600', '700', '800'], subsets: ['latin'] });

export const FONTS = {
  'the-signal': { display: signalDisplay.fontFamily, body: signalBody.fontFamily },
  'q-rosity': { display: qDisplay.fontFamily, body: qBody.fontFamily },
} as const;

/** Resolves when every font file has been fetched. Remotion already waits for this per frame
 *  (delayRender); exported for scripts/tests that want an explicit barrier. */
export const fontsReady = Promise.all([
  signalDisplay.waitUntilDone(),
  signalBody.waitUntilDone(),
  qDisplay.waitUntilDone(),
  qBody.waitUntilDone(),
]);
