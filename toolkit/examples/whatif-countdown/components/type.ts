// Fonts + the format's type/layout spec (px at 1080×1920). Change here, not in components.
import { loadFont as loadSerif } from '@remotion/google-fonts/InstrumentSerif';
import { loadFont as loadSans } from '@remotion/google-fonts/Manrope';

const serifN = loadSerif('normal', { weights: ['400'], subsets: ['latin'] });
loadSerif('italic', { weights: ['400'], subsets: ['latin'] });
const sans = loadSans('normal', { weights: ['200', '600'], subsets: ['latin'] });

export const FONTS = { serif: serifN.fontFamily, sans: sans.fontFamily };

/** Layout spec, measured from the reference format (OCR at 1080×1920) and fitted to HARNESS §1.4. */
export const SPEC = {
  // opening title: 2 lines, centres at y≈498 / 584 (26–30 %), serif 84 px
  title: { size: 84, lineHeight: 86, line1Y: 498, maxWidth: 940, iconSize: 64, iconGap: 34 },
  // HUD: left-aligned at x = 70 (6.5 %), label / timer / sub-label centres ≈ 905 / 955 / 1018
  hud: { x: 70, labelY: 905, timerY: 957, subY: 1020, labelSize: 28, timerSize: 84, subSize: 28, tracking: '0.2em', subTracking: '0.16em' },
  // narration: italic serif 52 px, ≤ 2 lines, max width 86 %, bottom-anchored (last line centre y≈1262)
  narration: { size: 52, lineHeight: 58, lastLineY: 1262, maxWidth: 929 },
  // end card: title centres ≈ 786 / 873, fact lines ≈ 1001 / 1035
  end: { titleY1: 786, factY1: 1001, factSize: 28, factLineHeight: 36, factTracking: '0.2em' },
  fadeFrames: { lineIn: 8, lineOut: 6, hudSwap: 6, title: 8 },
} as const;
