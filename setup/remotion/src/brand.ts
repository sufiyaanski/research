// Palettes as code. Mirror of channels/<channel>/brand.md — if you change a hex here, change
// it there too (and vice-versa). Components take a `Brand` so a scene can never mix channels.

export type Brand = {
  id: 'the-signal' | 'q-rosity';
  /** Full-bleed background. Solid (gradients band under H.264). */
  ink: string;
  /** Panel / card surface, one step lighter than ink. */
  panel: string;
  /** Hairlines, grid, axis. */
  line: string;
  /** Primary text. */
  text: string;
  /** Secondary text, labels, sources. */
  muted: string;
  /** THE accent. One per channel. Ration it: one element per frame. */
  accent: string;
  /** Text color that sits ON the accent (buttons, filled tags). */
  onAccent: string;
  /** Positive / gain / "cheap". */
  positive: string;
  /** Negative / loss / "expensive". */
  negative: string;
  /** Local glow color behind hero elements (used at 15-25% alpha). */
  glow: string;
};

/**
 * THE SIGNAL — dark, premium, numbers-forward. "A trading terminal that learned typography."
 * Accent is signal amber: price-tag yellow pushed warm so it reads as money, not warning.
 * Contrast (WCAG) on ink #0A0C10: text 17.9:1, muted 7.1:1, accent 10.6:1, positive 11.6:1,
 * negative 6.0:1 (all >= 4.5:1).
 */
export const SIGNAL: Brand = {
  id: 'the-signal',
  ink: '#0A0C10',
  panel: '#141820',
  line: '#262C36',
  text: '#F2EEE6',
  muted: '#9AA0AA',
  accent: '#FFB020',
  onAccent: '#1A1200',
  positive: '#2EE6A6',
  negative: '#FF4F6E',
  glow: '#FFB020',
};

/**
 * Q-ROSITY — playful, blocky, bright. Placeholder palette until the 3D character lands:
 * sky blue stage, electric purple accent, sunshine yellow highlights. Text stays near-black on
 * light surfaces for legibility at phone scale.
 * Contrast on sky #DDF3FF: ink text 15.5:1, accent #6A33FF 6.4:1, negative #E6334B 4.9:1.
 */
export const QROSITY: Brand = {
  id: 'q-rosity',
  ink: '#DDF3FF',
  panel: '#FFFFFF',
  line: '#B8DDF2',
  text: '#15192B',
  muted: '#5B6478',
  accent: '#6A33FF',
  onAccent: '#FFFFFF',
  positive: '#1DB954',
  negative: '#E6334B',
  glow: '#FFD23F',
};

/**
 * Q-ROSITY over the 3D stage (qrosity-001+). The character keeps the QROSITY colours (purple
 * hoodie, yellow drawstrings), but the Stage3D background is dark and fogged, so the 2D overlay
 * layer needs light text and a yellow accent that reads on near-black: text 18.6:1, accent
 * #FFD23F 13.1:1, muted 9.2:1, negative #FF5A6E 5.6:1 on ink #1A0D0F. Plates (captions, kicker,
 * stamps) use `ink`, which equals the volcano stage's sky/fog colour.
 */
export const QROSITY_STAGE: Brand = {
  ...QROSITY,
  ink: '#1A0D0F',
  panel: '#2B1B1D',
  line: '#4A2E31',
  text: '#FFF6EC',
  muted: '#D9B8B0',
  accent: '#FFD23F',
  onAccent: '#1A0D0F',
  positive: '#5BE08C',
  negative: '#FF5A6E',
  glow: '#FF7A1A',
};

export const BRANDS = { 'the-signal': SIGNAL, 'q-rosity': QROSITY } as const;

/** rgba() helper for glows and plates: alpha('#FFB020', 0.2). */
export const alpha = (hex: string, a: number) => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
};
