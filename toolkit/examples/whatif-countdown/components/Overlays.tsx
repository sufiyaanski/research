// 2D layer of the what-if countdown format: TitleCard, Hud, NarrationLine, WhiteOut, EndCard, Icon.
// All of it reads the episode config and the GLOBAL frame (mount at composition level, not inside a
// <Sequence from>). Every value is frame-derived; text never moves while it is held.
import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { FONTS, SPEC } from './type';
import { endCardTime, formatTimer, lineAt, phaseAt, returnTime, subLabelText, switchTime, timerSeconds, type SubLabel, type Title, type WhatIfConfig } from '../schema';

const ease = { out: Easing.out(Easing.cubic), in: Easing.in(Easing.cubic), inOut: Easing.inOut(Easing.cubic) };
const ramp = (f: number, a: number, b: number, e: (t: number) => number) => interpolate(f, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e });
const mixHex = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(',')})`;
};

// -----------------------------------------------------------------------------------------------
// Icon (small subject glyph above the opening title) — stroke SVGs, original drawings
// -----------------------------------------------------------------------------------------------
export const Icon: React.FC<{ id: WhatIfConfig['icon']; size: number; color: string }> = ({ id, size, color }) => {
  const sw = 2.2;
  const common = { fill: 'none', stroke: color, strokeWidth: sw, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const body: Record<WhatIfConfig['icon'], React.ReactNode> = {
    'globe-spin': (
      <>
        <circle cx="24" cy="24" r="13" {...common} />
        <ellipse cx="24" cy="24" rx="5.5" ry="13" {...common} />
        <path d="M11 24h26" {...common} />
        <path d="M6 15c-2 3-2.6 6-2 9" {...common} />
        <path d="M42 33c2-3 2.6-6 2-9" {...common} />
        <path d="M3.4 21.5l.6 3 2.6-1.6M44.6 26.5l-.6-3-2.6 1.6" {...common} />
      </>
    ),
    atom: (
      <>
        <circle cx="24" cy="24" r="2.6" fill={color} />
        <ellipse cx="24" cy="24" rx="18" ry="7" {...common} />
        <ellipse cx="24" cy="24" rx="18" ry="7" transform="rotate(60 24 24)" {...common} />
        <ellipse cx="24" cy="24" rx="18" ry="7" transform="rotate(-60 24 24)" {...common} />
      </>
    ),
    apple: (
      <>
        <path d="M24 15c-4-3-12-2-12 8 0 8 6 15 9 15 1.5 0 2-1 3-1s1.5 1 3 1c3 0 9-7 9-15 0-10-8-11-12-8z" {...common} />
        <path d="M24 15c0-4 2-6 5-7" {...common} />
      </>
    ),
    sun: (
      <>
        <circle cx="24" cy="24" r="8" {...common} />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return <path key={i} d={`M${24 + Math.cos(a) * 12} ${24 + Math.sin(a) * 12}L${24 + Math.cos(a) * 17} ${24 + Math.sin(a) * 17}`} {...common} />;
        })}
      </>
    ),
    moon: <path d="M31 9a15 15 0 1 0 8 25A12 12 0 0 1 31 9z" {...common} />,
    bolt: <path d="M27 5L13 27h10l-3 16 15-23H25z" {...common} />,
    drop: <path d="M24 6c6 9 12 15 12 22a12 12 0 0 1-24 0c0-7 6-13 12-22z" {...common} />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      {body[id]}
    </svg>
  );
};

// -----------------------------------------------------------------------------------------------
// Title text with a coloured keyword; `\n` in any part breaks the line
// -----------------------------------------------------------------------------------------------
type Run = { text: string; key: boolean };
const titleLines = (t: Title): Run[][] => {
  const lines: Run[][] = [[]];
  const push = (s: string, key: boolean) =>
    s.split('\n').forEach((part, i) => {
      if (i > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ text: part, key });
    });
  push(t.pre, false);
  push(t.keyword, true);
  push(t.post, false);
  return lines;
};

const TitleText: React.FC<{ title: Title; keywordColor: string; top: number; color?: string }> = ({ title, keywordColor, top, color = '#FFFFFF' }) => (
  <div style={{ position: 'absolute', left: (1080 - SPEC.title.maxWidth) / 2, width: SPEC.title.maxWidth, top: top - SPEC.title.lineHeight / 2, textAlign: 'center' }}>
    {titleLines(title).map((runs, i) => (
      <div key={i} style={{ fontFamily: FONTS.serif, fontSize: SPEC.title.size, lineHeight: `${SPEC.title.lineHeight}px`, color, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
        {runs.map((r, j) => (
          <span key={j} style={{ color: r.key ? keywordColor : color }}>
            {r.text}
          </span>
        ))}
      </div>
    ))}
  </div>
);

/** Opening title over the calm scene; landed on frame 0 (thumbnail), fades out at config.titleOut. */
export const TitleCard: React.FC<{ config: WhatIfConfig }> = ({ config }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = Math.round(config.titleOut * fps);
  const o = 1 - ramp(frame, out, out + SPEC.fadeFrames.title, ease.in);
  if (o <= 0) return null;
  const shadow = '0 2px 18px rgba(10,20,40,0.45), 0 1px 3px rgba(10,20,40,0.35)';
  return (
    <AbsoluteFill style={{ opacity: o, textShadow: shadow, filter: 'drop-shadow(0 1px 8px rgba(10,20,40,0.25))' }}>
      <div style={{ position: 'absolute', left: 540 - SPEC.title.iconSize / 2, top: SPEC.title.line1Y - SPEC.title.lineHeight / 2 - SPEC.title.iconGap - SPEC.title.iconSize }}>
        <Icon id={config.icon} size={SPEC.title.iconSize} color="#FFFFFF" />
      </div>
      <TitleText title={config.title} keywordColor={config.keywordColor} top={SPEC.title.line1Y} />
    </AbsoluteFill>
  );
};

// -----------------------------------------------------------------------------------------------
// HUD — label / timer / sub-label, 6-frame cross-fade (Easing.inOut(cubic)) when a slot's text changes
// -----------------------------------------------------------------------------------------------
type Seg = { from: number; key: string; text: string };
/** the segment showing at frame f, and the previous one while the cross-fade runs */
const slotAt = (segs: Seg[], f: number, fade: number) => {
  let i = -1;
  for (let k = 0; k < segs.length; k++) if (segs[k].from <= f) i = k;
  if (i < 0) return { cur: null, prev: null, k: 1 };
  const k = i > 0 ? ramp(f, segs[i].from, segs[i].from + fade, ease.inOut) : 1;
  return { cur: segs[i], prev: i > 0 && k < 1 ? segs[i - 1] : null, k };
};

const Slot: React.FC<{ segs: Seg[]; frame: number; fade: number; style: React.CSSProperties }> = ({ segs, frame, fade, style }) => {
  const { cur, prev, k } = slotAt(segs, frame, fade);
  if (!cur) return null;
  return (
    <div style={{ position: 'relative', ...style }}>
      {prev ? <div style={{ position: 'absolute', left: 0, top: 0, opacity: 1 - k, whiteSpace: 'nowrap' }}>{prev.text}</div> : null}
      <div style={{ opacity: k, whiteSpace: 'nowrap' }}>{cur.text}</div>
    </div>
  );
};

/** `white` 0..1 = how white the frame behind the HUD is (white-out): the HUD turns ink to stay legible. */
export const Hud: React.FC<{ config: WhatIfConfig; white?: number }> = ({ config, white = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const F = (s: number) => Math.round(s * fps);
  const end = F(endCardTime(config));
  if (frame >= end) return null;
  const sw = F(switchTime(config));
  const rt = F(returnTime(config));
  const phase = phaseAt(config, t);
  const labels: Seg[] = [
    { from: 0, key: 'A', text: config.phaseA.label },
    { from: sw, key: 'B', text: config.phaseB.label },
    { from: rt, key: 'C', text: config.phaseC.label },
  ];
  // the big slot: the timer's digits change every frame inside a segment; segments swap A→B→C
  const timerText = phase === 'C' ? config.phaseC.bigText : formatTimer(timerSeconds(config, t));
  const bigs: Seg[] = [
    { from: 0, key: 'A', text: phase === 'A' ? timerText : formatTimer(0) },
    { from: sw, key: 'B', text: phase === 'B' ? timerText : phase === 'C' ? formatTimer(0) : formatTimer(config.phaseB.virtualSeconds) },
    { from: rt, key: 'C', text: config.phaseC.bigText },
  ];
  const subOf = (list: SubLabel[], phaseKey: string): Seg[] => list.map((s, i) => ({ from: F(s.from), key: `${phaseKey}${i}`, text: subLabelText(s, Math.max(s.from, Math.min(s.to, t))) }));
  const subs: Seg[] = [{ from: 0, key: 'A', text: config.phaseA.subLabel }, ...subOf(config.phaseB.subLabels, 'B'), ...subOf(config.phaseC.subLabels, 'C')].sort((a, b) => a.from - b.from);
  const fade = SPEC.fadeFrames.hudSwap;
  const ink = mixHex('#FFFFFF', '#121214', Math.min(1, Math.max(0, (white - 0.35) / 0.4)));
  const shadow = white > 0.3 ? 'none' : '0 1px 10px rgba(0,0,0,0.45), 0 0 2px rgba(0,0,0,0.35)';
  const H = SPEC.hud;
  return (
    <AbsoluteFill style={{ color: ink, textShadow: shadow }}>
      <Slot
        segs={labels}
        frame={frame}
        fade={fade}
        style={{ position: 'absolute', left: H.x, top: H.labelY - H.labelSize * 0.65, fontFamily: FONTS.sans, fontWeight: 600, fontSize: H.labelSize, lineHeight: 1.3, letterSpacing: H.tracking, opacity: 0.9 }}
      />
      <Slot
        segs={bigs}
        frame={frame}
        fade={fade}
        style={{ position: 'absolute', left: H.x - 4, top: H.timerY - H.timerSize * 0.6, fontFamily: FONTS.sans, fontWeight: 200, fontSize: H.timerSize, lineHeight: 1.2, letterSpacing: '0.01em', fontVariantNumeric: 'tabular-nums' }}
      />
      <Slot
        segs={subs}
        frame={frame}
        fade={fade}
        style={{ position: 'absolute', left: H.x, top: H.subY - H.subSize * 0.65, fontFamily: FONTS.sans, fontWeight: 600, fontSize: H.subSize, lineHeight: 1.3, letterSpacing: H.subTracking, opacity: 0.78, fontVariantNumeric: 'tabular-nums' }}
      />
    </AbsoluteFill>
  );
};

// -----------------------------------------------------------------------------------------------
// Narration — one italic serif sentence (1–2 lines), fade 8 f in / 6 f out, dead still while held
// -----------------------------------------------------------------------------------------------
export const NarrationLine: React.FC<{ config: WhatIfConfig }> = ({ config }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const line = lineAt(config, frame / fps);
  if (!line) return null;
  const a = Math.round(line.start * fps);
  const b = Math.round(line.end * fps);
  const o = Math.min(ramp(frame, a, a + SPEC.fadeFrames.lineIn, ease.out), 1 - ramp(frame, b - SPEC.fadeFrames.lineOut, b, ease.in));
  const N = SPEC.narration;
  return (
    <div
      style={{
        position: 'absolute',
        left: (1080 - N.maxWidth) / 2,
        width: N.maxWidth,
        // bottom-anchored: the LAST line's centre sits on N.lastLineY, a 2nd line grows upward
        bottom: 1920 - (N.lastLineY + N.lineHeight / 2),
        textAlign: 'center',
        fontFamily: FONTS.serif,
        fontStyle: 'italic',
        fontSize: N.size,
        lineHeight: `${N.lineHeight}px`,
        color: '#FFFFFF',
        opacity: o,
        textShadow: '0 2px 14px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.5)',
        textWrap: 'balance',
      }}
    >
      {line.text}
    </div>
  );
};

// -----------------------------------------------------------------------------------------------
// White-out flash: in (Easing.out(cubic)) → hold → out (Easing.out(cubic)), global frames
// -----------------------------------------------------------------------------------------------
export const whiteAmount = (f: number, w: { inStart: number; peak: number; holdEnd: number; outEnd: number }) =>
  f < w.peak ? ramp(f, w.inStart, w.peak, ease.out) : f < w.holdEnd ? 1 : 1 - ramp(f, w.holdEnd, w.outEnd, ease.out);

export const WhiteOut: React.FC<{ amount: number; color?: string }> = ({ amount, color = '#F7F9FF' }) =>
  amount > 0 ? <AbsoluteFill style={{ backgroundColor: color, opacity: amount }} /> : null;

// -----------------------------------------------------------------------------------------------
// End card — the question again on #121214 + tiny tracked fact lines (loops into frame 0)
// -----------------------------------------------------------------------------------------------
export const EndCard: React.FC<{ config: WhatIfConfig }> = ({ config }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = Math.round(endCardTime(config) * fps);
  if (frame < start) return null;
  const tIn = ramp(frame, start, start + SPEC.fadeFrames.lineIn, ease.out);
  const fAt = start + Math.round(config.endCard.factDelay * fps);
  const fIn = ramp(frame, fAt, fAt + SPEC.fadeFrames.lineIn, ease.out);
  const E = SPEC.end;
  return (
    <AbsoluteFill style={{ backgroundColor: config.endCard.background }}>
      <div style={{ opacity: tIn }}>
        <TitleText title={config.endCard.title ?? config.title} keywordColor={config.keywordColor} top={E.titleY1} />
      </div>
      <div style={{ position: 'absolute', left: 70, right: 70, top: E.factY1 - E.factLineHeight / 2, textAlign: 'center', opacity: fIn * 0.82, color: '#FFFFFF' }}>
        {config.endCard.factLines.map((l, i) => (
          <div key={i} style={{ fontFamily: FONTS.sans, fontWeight: 600, fontSize: E.factSize, lineHeight: `${E.factLineHeight}px`, letterSpacing: E.factTracking, whiteSpace: 'nowrap' }}>
            {l}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
