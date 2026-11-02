// Shared component kit for both channels. Every component is frame-based (useCurrentFrame),
// takes an `at` frame (LOCAL to the enclosing <Sequence>) and, where it makes sense, an `until`
// frame for its exit. Negative `at` values pre-roll an animation so it is fully composed on
// frame 0 of its Sequence (the "warm" / frame-0 rule).
import React from 'react';
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { evolvePath } from '@remotion/paths';
import { alpha, type Brand } from '../brand';
import { FONTS } from '../fonts';
import { chunkSizeFor, prog } from './timing';

// =============================================================================
// CONSTANTS — safe zones, easing, spring presets
// =============================================================================

/**
 * Safe zones on 1080x1920. `bottom`/`right` are the hard platform-UI zones (TikTok/Reels/Shorts
 * caption, handle, action rail). `top` covers the status bar + "Reels/Following" tabs.
 * `comfortBottom` is where Meta's published 35% guideline would put the limit; keep the hero
 * number above it, captions may sit between comfortBottom and bottom.
 * Sources: hassancs91 brand.md (bottom 340 / right 160 / 5% edges), HyperFrames vertical.md
 * (top 168, words inside 168-1330), Meta via HopperHQ (14% top, 35% bottom, 21% right rail).
 * TO VERIFY against a current screenshot of your own account; platforms move these.
 */
export const SAFE = {
  top: 220,
  bottom: 340,
  comfortBottom: 670,
  right: 160,
  side: 64,
  /** Vertical center of the captions block. */
  captionY: 1380,
} as const;

export const EASE = {
  /** Entrances: expo-out tail. */
  out: Easing.bezier(0.16, 1, 0.3, 1),
  /** Counters, bars: cubic-out (lands softer than expo, reads as "settling"). */
  outCubic: Easing.bezier(0.33, 1, 0.68, 1),
  /** Camera moves, color floods. */
  inOut: Easing.bezier(0.83, 0, 0.17, 1),
  /** Exits only. */
  in: Easing.bezier(0.7, 0, 0.84, 0),
} as const;

/** spring() configs. damping 200 = no overshoot (premium). */
export const SPRING = {
  /** UI pops, words, tags landing. Fast, no bounce. ~14 frames to settle at 60 fps. */
  snappy: { damping: 200, stiffness: 180, mass: 0.8 },
  /** Big elements, panels, charts. Slight overshoot (~2%). */
  soft: { damping: 24, stiffness: 120, mass: 1 },
  /** Playful (Q-ROSITY only): visible bounce. Never on opacity or color. */
  bouncy: { damping: 12, stiffness: 170, mass: 0.7 },
} as const;

type SpringName = keyof typeof SPRING;

// =============================================================================
// HOOKS — presence / reveal helpers
// =============================================================================

export type RevealProps = {
  /** local frame the entrance starts (negative = already in on frame 0) */
  at?: number;
  /** entrance length in frames (12-18 at 60 fps) */
  dur?: number;
  /** local frame the exit starts; omit for "stays" */
  until?: number;
  /** exit length (default 60% of dur — exits are faster than entrances) */
  exitDur?: number;
};

/**
 * 0..1 presence of an element: eases in over [at, at+dur], holds, eases out over
 * [until, until+exitDur]. Ease-out in, ease-in out.
 */
export const useReveal = ({ at = 0, dur = 14, until, exitDur }: RevealProps) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [at, at + Math.max(1, dur)], [0, 1], {
    easing: EASE.out,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const xd = Math.max(1, exitDur ?? Math.round(dur * 0.6));
  const exit =
    until === undefined
      ? 1
      : interpolate(frame, [until, until + xd], [1, 0], {
          easing: EASE.in,
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
  return { frame, enter, exit, presence: enter * exit };
};

/** spring() with a kit preset, local frame offset, optional duration cap. 0..1. */
export const useSpring = (at: number, preset: SpringName = 'snappy', durationInFrames?: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - at, fps, config: SPRING[preset], durationInFrames });
};

/** Scene-level helpers: local frame + "secondsIn" for cue math inside a <Sequence>. */
export const useBeat = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  return {
    frame,
    fps,
    durationInFrames,
    /** local frame for a time offset within this scene */
    f: (seconds: number) => Math.round(seconds * fps),
    /** 0..1 progress between two local frames */
    p: (a: number, b: number) => prog(frame, a, b),
  };
};

// =============================================================================
// REVEAL — fade + rise wrapper (the default entrance for anything)
// =============================================================================
export const Reveal: React.FC<
  RevealProps & {
    children: React.ReactNode;
    /** px of rise (24 default). 0 for pure fade. */
    rise?: number;
    style?: React.CSSProperties;
  }
> = ({ children, rise = 24, style, ...r }) => {
  const { enter, exit, presence } = useReveal(r);
  if (presence <= 0.001) return null;
  return (
    <div
      style={{
        opacity: presence,
        translate: `0px ${(1 - enter) * rise + (1 - exit) * -rise * 0.5}px`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// =============================================================================
// BACKDROP — solid ink + one local glow + faint grid. No linear gradients (they band in h264).
// =============================================================================
export const Backdrop: React.FC<{ brand: Brand; glowY?: number; glowStrength?: number; grid?: boolean }> = ({
  brand,
  glowY = 42,
  glowStrength = 0.18,
  grid = true,
}) => (
  <AbsoluteFill style={{ backgroundColor: brand.ink }}>
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 80% 45% at 50% ${glowY}%, ${alpha(brand.glow, glowStrength)} 0%, transparent 70%)`,
      }}
    />
    {grid ? (
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${alpha(brand.line, 0.55)} 1px, transparent 1px), linear-gradient(90deg, ${alpha(brand.line, 0.55)} 1px, transparent 1px)`,
          backgroundSize: '120px 120px',
          backgroundPosition: '60px 60px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, black 20%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, black 20%, transparent 100%)',
        }}
      />
    ) : null}
    <AbsoluteFill
      style={{ background: 'radial-gradient(ellipse 120% 90% at 50% 50%, transparent 60%, rgba(0,0,0,0.45) 100%)' }}
    />
  </AbsoluteFill>
);

// =============================================================================
// SAFE AREA GUIDES — dev only. Never mount in a final render.
// =============================================================================
export const SafeAreaGuides: React.FC<{ labels?: boolean }> = ({ labels = true }) => {
  const z: React.CSSProperties = { position: 'absolute', background: 'rgba(255,0,80,0.18)', pointerEvents: 'none' };
  const lab: React.CSSProperties = { position: 'absolute', fontFamily: 'monospace', fontSize: 26, color: '#ff4f6e', padding: 8 };
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ ...z, top: 0, left: 0, right: 0, height: SAFE.top }} />
      <div style={{ ...z, bottom: 0, left: 0, right: 0, height: SAFE.bottom }} />
      <div style={{ ...z, bottom: SAFE.bottom, left: 0, right: 0, height: SAFE.comfortBottom - SAFE.bottom, background: 'rgba(255,176,32,0.10)' }} />
      <div style={{ ...z, top: 0, bottom: 0, right: 0, width: SAFE.right }} />
      <div style={{ ...z, top: 0, bottom: 0, left: 0, width: SAFE.side, background: 'rgba(255,0,80,0.10)' }} />
      <div style={{ position: 'absolute', top: SAFE.captionY, left: 0, right: 0, height: 2, background: '#2ee6a6' }} />
      {labels ? (
        <>
          <div style={{ ...lab, top: 0, left: SAFE.side }}>top {SAFE.top}</div>
          <div style={{ ...lab, bottom: 0, left: SAFE.side }}>bottom {SAFE.bottom} (hard) / {SAFE.comfortBottom} (Meta 35%)</div>
          <div style={{ ...lab, top: SAFE.captionY - 40, left: SAFE.side, color: '#2ee6a6' }}>captionY {SAFE.captionY}</div>
          <div style={{ ...lab, top: SAFE.top + 10, right: 0 }}>rail {SAFE.right}</div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};

// =============================================================================
// TEXT — BigTitle, Kicker, SourceLine
// =============================================================================

/** Inline markup: *word* renders in the accent color. */
const renderAccent = (text: string, accent: string) =>
  text.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith('*') && part.endsWith('*') ? (
      <span key={i} style={{ color: accent }}>
        {part.slice(1, -1)}
      </span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  );

export const BigTitle: React.FC<{
  brand: Brand;
  /** up to 3 lines, max ~6 words total. Use *word* for the accent word. */
  lines: string[];
  y?: number;
  size?: number;
  align?: 'left' | 'center';
  at?: number;
  until?: number;
  /** per-line stagger in frames (4-6 at 60 fps) */
  stagger?: number;
  uppercase?: boolean;
}> = ({ brand, lines, y = 300, size = 108, align = 'center', at = 0, until, stagger = 5, uppercase = true }) => {
  const frame = useCurrentFrame();
  const font = FONTS[brand.id];
  const exit =
    until === undefined
      ? 1
      : interpolate(frame, [until, until + 8], [1, 0], { easing: EASE.in, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (exit <= 0.001) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top: y,
        left: SAFE.side,
        right: SAFE.side,
        textAlign: align,
        opacity: exit,
      }}
    >
      {lines.map((l, i) => {
        const p = interpolate(frame, [at + i * stagger, at + i * stagger + 14], [0, 1], {
          easing: EASE.out,
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <div
            key={i}
            style={{
              fontFamily: font.display,
              fontWeight: 800,
              fontSize: size,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              textTransform: uppercase ? 'uppercase' : 'none',
              color: brand.text,
              opacity: p,
              translate: `0px ${(1 - p) * 28}px`,
              margin: 0,
            }}
          >
            {renderAccent(l, brand.accent)}
          </div>
        );
      })}
    </div>
  );
};

export const Kicker: React.FC<{ brand: Brand; text: string; y?: number; at?: number; until?: number; color?: string }> = ({
  brand,
  text,
  y = SAFE.top + 20,
  at = 0,
  until,
  color,
}) => {
  const { enter, presence } = useReveal({ at, dur: 12, until, exitDur: 8 });
  const font = FONTS[brand.id];
  if (presence <= 0.001) return null;
  const c = color ?? brand.accent;
  return (
    <div style={{ position: 'absolute', top: y, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: presence, translate: `0px ${(1 - enter) * 12}px` }}>
      <div
        style={{
          fontFamily: font.body,
          fontWeight: 700,
          fontSize: 40,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: c,
          border: `2px solid ${alpha(c, 0.4)}`,
          borderRadius: 999,
          padding: '12px 30px',
          background: alpha(brand.ink, 0.5),
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** Small source credit. Mandatory whenever a number is on screen. Sits above the caption block. */
export const SourceLine: React.FC<{
  brand: Brand;
  text: string;
  y?: number;
  at?: number;
  until?: number;
  /** dark plate behind the text (3D stages, photos — anywhere the background is busy) */
  plate?: boolean;
}> = ({ brand, text, y = SAFE.captionY - 190, at = 0, until, plate = false }) => {
  const { presence } = useReveal({ at, dur: 12, until });
  const font = FONTS[brand.id];
  if (presence <= 0.001) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top: y,
        left: SAFE.side,
        right: SAFE.right,
        textAlign: 'center',
        fontFamily: font.body,
        fontWeight: 600,
        fontSize: 30,
        letterSpacing: '0.02em',
        color: brand.muted,
        opacity: presence,
      }}
    >
      <span style={plate ? { display: 'inline-block', background: alpha(brand.ink, 0.78), borderRadius: 12, padding: '6px 18px' } : undefined}>{text}</span>
    </div>
  );
};

// =============================================================================
// COUNTER — animated number. Tabular nums, cubic-out, snaps to the exact final value.
// =============================================================================
export const formatNumber = (n: number, decimals = 0) =>
  n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export const Counter: React.FC<{
  brand: Brand;
  from?: number;
  to: number;
  /** local frame the count starts */
  at?: number;
  /** count duration in frames (48-90 at 60 fps = 0.8-1.5 s) */
  dur?: number;
  until?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  size?: number;
  color?: string;
  x?: number;
  y?: number;
  width?: number;
  align?: 'left' | 'center' | 'right';
  weight?: number;
}> = ({
  brand,
  from = 0,
  to,
  at = 0,
  dur = 72,
  until,
  decimals = 0,
  prefix = '',
  suffix = '',
  size = 220,
  color,
  x = 0,
  y = 700,
  width = 1080,
  align = 'center',
  weight = 800,
}) => {
  const frame = useCurrentFrame();
  const font = FONTS[brand.id];
  const p = interpolate(frame, [at, at + Math.max(1, dur)], [0, 1], {
    easing: EASE.outCubic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const value = p >= 1 ? to : from + (to - from) * p;
  const { presence } = useReveal({ at: at - 6, dur: 10, until });
  // pop on snap: 1.06 -> 1 over 10 frames after landing
  const snap = interpolate(frame, [at + dur, at + dur + 10], [1.04, 1], {
    easing: EASE.out,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (presence <= 0.001) return null;
  const c = color ?? brand.text;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        textAlign: align,
        opacity: presence,
        scale: String(snap),
        fontFamily: font.display,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: '-0.03em',
        fontVariantNumeric: 'tabular-nums',
        color: c,
        whiteSpace: 'nowrap',
      }}
    >
      {prefix ? (
        <span style={{ fontSize: size * 0.7, verticalAlign: 'top', position: 'relative', top: size * 0.02, marginRight: size * 0.02 }}>{prefix}</span>
      ) : null}
      {formatNumber(value, decimals)}
      {suffix ? <span style={{ fontSize: size * 0.7 }}>{suffix}</span> : null}
    </div>
  );
};

// =============================================================================
// PRICE TAG — a physical shelf tag. Optional strike-through "was" price.
// =============================================================================
export const PriceTag: React.FC<{
  brand: Brand;
  price: string;
  label?: string;
  /** "was" price, rendered struck-through above */
  was?: string;
  x: number;
  y: number;
  w?: number;
  at?: number;
  until?: number;
  /** fill color (default panel). Use brand.accent for the hero tag. */
  fill?: string;
  rotate?: number;
  preset?: SpringName;
  /** draw a strike through the main price (the "nobody bought this" state) */
  struck?: boolean;
  strikeAt?: number;
  size?: number;
}> = ({ brand, price, label, was, x, y, w = 420, at = 0, until, fill, rotate = 0, preset = 'snappy', struck = false, strikeAt, size = 112 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const font = FONTS[brand.id];
  const s = spring({ frame: frame - at, fps, config: SPRING[preset] });
  const exit =
    until === undefined
      ? 1
      : interpolate(frame, [until, until + 8], [1, 0], { easing: EASE.in, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (frame < at - 1 || exit <= 0.001) return null;
  const bg = fill ?? brand.panel;
  const onFill = fill === brand.accent ? brand.onAccent : brand.text;
  const strike = interpolate(frame, [strikeAt ?? at + 30, (strikeAt ?? at + 30) + 12], [0, 1], {
    easing: EASE.out,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const h = size * 1.9 + (label ? 48 : 0) + (was ? 44 : 0);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        opacity: Math.min(1, s * 1.5) * exit,
        scale: String(0.85 + 0.15 * s),
        rotate: `${rotate}deg`,
        transformOrigin: '50% 0%',
      }}
    >
      {/* hole + string */}
      <div style={{ position: 'absolute', left: w / 2 - 2, top: -60, width: 4, height: 60, background: alpha(brand.muted, 0.7) }} />
      <div
        style={{
          width: w,
          height: h,
          background: bg,
          borderRadius: 26,
          boxShadow: `0 24px 60px ${alpha('#000000', 0.45)}`,
          border: fill ? 'none' : `2px solid ${brand.line}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: 18, left: w / 2 - 14, width: 28, height: 28, borderRadius: 14, background: brand.ink, boxShadow: `inset 0 2px 6px ${alpha('#000', 0.6)}` }} />
        {was ? (
          <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 40, color: alpha(onFill, 0.6), textDecoration: 'line-through', fontVariantNumeric: 'tabular-nums', marginTop: 28 }}>
            {was}
          </div>
        ) : null}
        <div style={{ position: 'relative', marginTop: was ? 0 : 24 }}>
          <div style={{ fontFamily: font.display, fontWeight: 900, fontSize: size, lineHeight: 1.05, letterSpacing: '-0.03em', color: onFill, fontVariantNumeric: 'tabular-nums' }}>{price}</div>
          {struck ? (
            <div
              style={{
                position: 'absolute',
                left: '-6%',
                top: '50%',
                height: Math.max(8, size * 0.09),
                width: `${112 * strike}%`,
                background: brand.negative,
                rotate: '-8deg',
                borderRadius: 6,
                translate: '0px -50%',
              }}
            />
          ) : null}
        </div>
        {label ? (
          <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 34, letterSpacing: '0.06em', textTransform: 'uppercase', color: alpha(onFill, 0.75), marginTop: 10 }}>{label}</div>
        ) : null}
      </div>
    </div>
  );
};

// =============================================================================
// STAMP — rotated impact label (SOLD OUT / NEVER / ANCHOR)
// =============================================================================
export const Stamp: React.FC<{ brand: Brand; text: string; x: number; y: number; at?: number; until?: number; color?: string; size?: number; rotate?: number }> = ({
  brand,
  text,
  x,
  y,
  at = 0,
  until,
  color,
  size = 84,
  rotate = -8,
}) => {
  const frame = useCurrentFrame();
  const font = FONTS[brand.id];
  const p = interpolate(frame, [at, at + 9], [0, 1], { easing: EASE.out, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const exit =
    until === undefined ? 1 : interpolate(frame, [until, until + 8], [1, 0], { easing: EASE.in, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (frame < at || exit <= 0.001) return null;
  const c = color ?? brand.negative;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        translate: '-50% -50%',
        rotate: `${rotate}deg`,
        scale: String(1.6 - 0.6 * p),
        opacity: p * exit,
        fontFamily: font.display,
        fontWeight: 900,
        fontSize: size,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: c,
        border: `7px solid ${c}`,
        borderRadius: 18,
        padding: '8px 30px',
        background: alpha(brand.ink, 0.75),
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );
};

// =============================================================================
// PROGRESS BAR — thin top bar across the whole composition (mount at root).
// =============================================================================
export const ProgressBar: React.FC<{ brand: Brand }> = ({ brand }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, background: alpha(brand.text, 0.1) }}>
      <div style={{ width: `${(frame / Math.max(1, durationInFrames - 1)) * 100}%`, height: '100%', background: brand.accent }} />
    </div>
  );
};

// =============================================================================
// BAR CHART — bars grow from baseline, staggered; one annotated value.
// =============================================================================
export type Bar = { label: string; value: number; color?: string; /** shown above the bar */ display?: string };

export const BarChart: React.FC<{
  brand: Brand;
  bars: Bar[];
  x: number;
  y: number;
  w: number;
  h: number;
  max?: number;
  at?: number;
  /** grow duration per bar (36-54 frames = 0.6-0.9 s) */
  dur?: number;
  /** frames between bars (4) */
  stagger?: number;
  until?: number;
  /** index of the bar whose value gets the big annotation (-1 = none) */
  annotate?: number;
  gap?: number;
}> = ({ brand, bars, x, y, w, h, max, at = 0, dur = 48, stagger = 4, until, annotate = bars.length - 1, gap = 40 }) => {
  const frame = useCurrentFrame();
  const font = FONTS[brand.id];
  const exit =
    until === undefined ? 1 : interpolate(frame, [until, until + 8], [1, 0], { easing: EASE.in, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (exit <= 0.001) return null;
  const m = max ?? Math.max(...bars.map((b) => b.value)) * 1.1;
  const n = bars.length;
  const bw = (w - gap * (n - 1)) / n;
  const axis = interpolate(frame, [at - 10, at], [0, 1], { easing: EASE.out, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, opacity: exit }}>
      {/* baseline */}
      <div style={{ position: 'absolute', left: 0, bottom: 0, height: 3, width: `${axis * 100}%`, background: brand.line }} />
      {bars.map((b, i) => {
        const p = interpolate(frame, [at + i * stagger, at + i * stagger + dur], [0, 1], {
          easing: EASE.outCubic,
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const bh = (b.value / m) * (h - 120) * p;
        const c = b.color ?? brand.muted;
        const isHero = i === annotate;
        const labelP = interpolate(frame, [at + i * stagger + dur - 10, at + i * stagger + dur + 4], [0, 1], {
          easing: EASE.out,
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <div key={i} style={{ position: 'absolute', left: i * (bw + gap), bottom: 0, width: bw }}>
            <div
              style={{
                position: 'absolute',
                bottom: 60,
                left: 0,
                width: bw,
                height: bh,
                background: c,
                borderRadius: '14px 14px 4px 4px',
                boxShadow: isHero ? `0 0 60px ${alpha(c, 0.35)}` : 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 60 + bh + 18,
                left: -40,
                width: bw + 80,
                textAlign: 'center',
                fontFamily: font.display,
                fontWeight: 800,
                fontSize: isHero ? 72 : 52,
                color: isHero ? c : brand.text,
                fontVariantNumeric: 'tabular-nums',
                opacity: labelP,
                translate: `0px ${(1 - labelP) * 10}px`,
                whiteSpace: 'nowrap',
              }}
            >
              {b.display ?? formatNumber(b.value)}
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: -20, width: bw + 40, textAlign: 'center', fontFamily: font.body, fontWeight: 700, fontSize: 34, letterSpacing: '0.04em', color: brand.muted, textTransform: 'uppercase', opacity: axis }}>
              {b.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// =============================================================================
// LINE CHART — path draws left to right (evolvePath); end dot + one annotation.
// =============================================================================
export const LineChart: React.FC<{
  brand: Brand;
  points: { x: number; y: number }[];
  x: number;
  y: number;
  w: number;
  h: number;
  at?: number;
  /** draw duration (60-90 frames) */
  dur?: number;
  until?: number;
  color?: string;
  /** annotation at the last point */
  annotation?: string;
  strokeWidth?: number;
  /** reference line value (same units as points.y) */
  reference?: number;
}> = ({ brand, points, x, y, w, h, at = 0, dur = 72, until, color, annotation, strokeWidth = 10, reference }) => {
  const frame = useCurrentFrame();
  const font = FONTS[brand.id];
  const c = color ?? brand.accent;
  const exit =
    until === undefined ? 1 : interpolate(frame, [until, until + 8], [1, 0], { easing: EASE.in, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (exit <= 0.001 || points.length < 2) return null;
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys, reference ?? Infinity);
  const maxY = Math.max(...ys, reference ?? -Infinity);
  const pad = 40;
  const sx = (v: number) => pad + ((v - minX) / Math.max(1e-6, maxX - minX)) * (w - pad * 2);
  const sy = (v: number) => h - pad - ((v - minY) / Math.max(1e-6, maxY - minY)) * (h - pad * 2);
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(p.x).toFixed(1)} ${sy(p.y).toFixed(1)}`).join(' ');
  const progress = interpolate(frame, [at, at + dur], [0, 1], { easing: EASE.inOut, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const { strokeDasharray, strokeDashoffset } = evolvePath(progress, d);
  const last = points[points.length - 1];
  const dot = interpolate(frame, [at + dur - 6, at + dur + 8], [0, 1], { easing: EASE.out, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const axis = interpolate(frame, [at - 12, at], [0, 1], { easing: EASE.out, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, opacity: exit }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
        <line x1={pad} y1={h - pad} x2={pad + (w - pad * 2) * axis} y2={h - pad} stroke={brand.line} strokeWidth={3} />
        <line x1={pad} y1={h - pad} x2={pad} y2={h - pad - (h - pad * 2) * axis} stroke={brand.line} strokeWidth={3} />
        {reference !== undefined ? (
          <line x1={pad} y1={sy(reference)} x2={pad + (w - pad * 2) * axis} y2={sy(reference)} stroke={alpha(brand.muted, 0.6)} strokeWidth={3} strokeDasharray="14 14" />
        ) : null}
        <path d={d} fill="none" stroke={c} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} />
        <circle cx={sx(last.x)} cy={sy(last.y)} r={18 * dot} fill={c} />
        <circle cx={sx(last.x)} cy={sy(last.y)} r={34 * dot} fill="none" stroke={alpha(c, 0.4)} strokeWidth={4} />
      </svg>
      {annotation ? (
        <div
          style={{
            position: 'absolute',
            left: Math.min(w - 300, Math.max(0, sx(last.x) - 150)),
            top: sy(last.y) - 110,
            width: 300,
            textAlign: 'center',
            fontFamily: font.display,
            fontWeight: 800,
            fontSize: 64,
            color: c,
            fontVariantNumeric: 'tabular-nums',
            opacity: dot,
            translate: `0px ${(1 - dot) * 12}px`,
            whiteSpace: 'nowrap',
          }}
        >
          {annotation}
        </div>
      ) : null}
    </div>
  );
};

// =============================================================================
// CAPTIONS — word-highlight captions driven by VO timings (vo.gen.ts).
// =============================================================================
export type TimedWord = { w: string; start: number; end: number };
export type VoLine = { beat?: string; text: string; start: number; end: number; words?: TimedWord[] };

/** Word timing: real alignment when present; otherwise distribute the window by word length. */
export const timeWords = (line: VoLine): TimedWord[] => {
  if (line.words && line.words.length > 0) return line.words;
  const words = line.text.split(/\s+/).filter(Boolean);
  const weights = words.map((w) => Math.max(2, w.replace(/[^a-zA-Z0-9]/g, '').length) + 1.6);
  const total = weights.reduce((a, b) => a + b, 0);
  const span = line.end - line.start;
  let t = line.start;
  return words.map((w, i) => {
    const d = (weights[i] / total) * span;
    const out = { w, start: t, end: t + d };
    t += d;
    return out;
  });
};

type Chunk = { words: TimedWord[]; start: number; end: number; hold: number };

/** VO lines -> caption chunks of <= maxWords (per beat), each holding until the next chunk. */
export const chunkLines = (lines: VoLine[], maxWords?: number): Chunk[] => {
  const chunks: Chunk[] = [];
  lines.forEach((line) => {
    const words = timeWords(line);
    const n = maxWords ?? chunkSizeFor(line.beat ?? '');
    // balance: avoid a 1-word orphan at the end of a line
    const groups = Math.ceil(words.length / n);
    const per = Math.ceil(words.length / groups);
    for (let i = 0; i < words.length; i += per) {
      const ws = words.slice(i, i + per);
      chunks.push({ words: ws, start: ws[0].start, end: ws[ws.length - 1].end, hold: 0 });
    }
  });
  chunks.forEach((c, i) => {
    const next = chunks[i + 1];
    // hold at least 0.35 s after the last word, never past the next chunk's start
    c.hold = next ? Math.min(next.start, Math.max(c.end + 0.35, c.start + 0.8)) : c.end + 1.0;
  });
  return chunks;
};

export const Captions: React.FC<{
  brand: Brand;
  lines: VoLine[];
  y?: number;
  size?: number;
  maxWords?: number;
  /** dark plate behind the words (use on busy scenes) */
  plate?: boolean;
  /** hide captions in this global-second window (e.g. full-screen hero number) */
  hideBetween?: [number, number][];
}> = ({ brand, lines, y = SAFE.captionY, size = 66, maxWords, plate = false, hideBetween = [] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const font = FONTS[brand.id];
  if (hideBetween.some(([a, b]) => t >= a && t < b)) return null;
  const chunks = chunkLines(lines, maxWords);
  const active = chunks.find((c) => t >= c.start && t < c.hold);
  if (!active) return null;
  const enter = EASE.out(prog(t, active.start, active.start + 0.12));
  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE.side,
        right: SAFE.right,
        top: y,
        translate: `0px ${(1 - enter) * 10 - 50}%`,
        opacity: 0.3 + 0.7 * enter,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          columnGap: size * 0.3,
          rowGap: size * 0.12,
          maxWidth: '100%',
          padding: plate ? `${size * 0.25}px ${size * 0.45}px` : 0,
          background: plate ? alpha(brand.ink, 0.82) : 'transparent',
          borderRadius: 22,
        }}
      >
        {active.words.map((word, i) => {
          const started = EASE.out(prog(t, word.start, word.start + 0.1));
          const isActive = t >= word.start && t < word.end + 0.05;
          const spoken = t >= word.start;
          return (
            <span
              key={i}
              style={{
                fontFamily: font.body,
                fontWeight: 800,
                fontSize: size,
                lineHeight: 1.15,
                letterSpacing: '-0.01em',
                color: isActive ? brand.accent : spoken ? brand.text : alpha(brand.text, 0.55),
                scale: String(0.94 + 0.06 * started + (isActive ? 0.04 : 0)),
                textShadow: `0 3px 24px ${alpha('#000000', 0.7)}, 0 1px 3px ${alpha('#000000', 0.6)}`,
                display: 'inline-block',
              }}
            >
              {word.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// =============================================================================
// HIGHLIGHT BAR — accent wipe behind a word/phrase (emphasis without motion).
// =============================================================================
export const HighlightBar: React.FC<{ brand: Brand; at?: number; dur?: number; children: React.ReactNode; color?: string }> = ({
  brand,
  at = 0,
  dur = 14,
  children,
  color,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + dur], [0, 1], { easing: EASE.out, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <span style={{ position: 'relative', display: 'inline-block', padding: '0 0.12em' }}>
      <span style={{ position: 'absolute', left: 0, top: '8%', bottom: '4%', width: `${p * 100}%`, background: color ?? brand.accent, borderRadius: 10, zIndex: 0 }} />
      <span style={{ position: 'relative', zIndex: 1, color: p > 0.5 ? brand.onAccent : undefined }}>{children}</span>
    </span>
  );
};
