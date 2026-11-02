// Q-ROSITY · 000 · placeholder. 10 s, 2D only, built from the shared kit with the Q-ROSITY brand.
// RETIRED as the reference: the real 3D character lives in lib/character/ and the reference
// episode is qrosity-001-volcano (see /make-qrosity-reel). Kept as a kit-only 2D example.
import React from 'react';
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { QROSITY as B, alpha } from '../../brand';
import { FONTS } from '../../fonts';
import { Backdrop, BigTitle, Captions, Kicker, ProgressBar, SafeAreaGuides, Stamp, useSpring, type VoLine, EASE } from '../../lib/kit';
import { sec } from '../../lib/timing';

const font = FONTS['q-rosity'];

// Placeholder VO (estimated). Replace with vo.gen.ts once the episode has a script.
const VO: VoLine[] = [
  { beat: 'hook', text: 'What if you never slept again?', start: 0.3, end: 2.2 },
  { beat: 'setup', text: 'Day one feels fine. Day three... does not.', start: 2.8, end: 5.6 },
  { beat: 'payoff', text: 'By day eleven, your brain starts dreaming while awake.', start: 6.2, end: 9.4 },
];

/** 2D stand-in for the 3D character: a blocky figure built from divs. Swap for the R3F scene. */
const CharacterSlot: React.FC<{ x: number; y: number; at: number }> = ({ x, y, at }) => {
  const frame = useCurrentFrame();
  const s = useSpring(at, 'bouncy');
  const bob = Math.sin((frame / 60) * Math.PI * 2 * 0.8) * 8;
  const block = (w: number, h: number, c: string, extra?: React.CSSProperties): React.CSSProperties => ({ width: w, height: h, background: c, borderRadius: 10, boxShadow: `inset -8px -8px 0 ${alpha('#000', 0.12)}`, ...extra });
  return (
    <div style={{ position: 'absolute', left: x, top: y, translate: `-50% ${bob}px`, scale: String(s), opacity: Math.min(1, s * 2), transformOrigin: '50% 100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{ ...block(170, 170, '#F6C77A'), position: 'relative' }}>
          <div style={{ position: 'absolute', left: 36, top: 60, width: 26, height: 40, background: B.text, borderRadius: 4 }} />
          <div style={{ position: 'absolute', right: 36, top: 60, width: 26, height: 40, background: B.text, borderRadius: 4 }} />
          <div style={{ position: 'absolute', left: 60, bottom: 30, width: 50, height: 12, background: B.text, borderRadius: 6 }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={block(60, 200, '#F6C77A')} />
          <div style={block(170, 200, B.accent)} />
          <div style={block(60, 200, '#F6C77A')} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={block(80, 170, '#2B2F6B')} />
          <div style={block(80, 170, '#2B2F6B')} />
        </div>
      </div>
    </div>
  );
};

const Floor: React.FC = () => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: 1240, height: 400, background: `repeating-linear-gradient(90deg, ${B.positive} 0 120px, ${alpha(B.positive, 0.75)} 120px 240px)`, borderTop: `6px solid ${alpha('#000', 0.15)}` }} />
);

export const QrosityPlaceholder: React.FC<{ guides?: boolean }> = ({ guides = false }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const dayP = interpolate(frame, [sec(6.2, fps), sec(8.6, fps)], [0, 1], { easing: EASE.outCubic, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const day = Math.round(1 + 10 * dayP);
  return (
    <AbsoluteFill style={{ backgroundColor: B.ink }}>
      <Backdrop brand={B} glowY={30} glowStrength={0.6} grid={false} />
      <Floor />
      <Kicker brand={B} text="what if…" at={-10} color={B.accent} />
      <Sequence name="hook" from={0} durationInFrames={sec(2.8, fps)}>
        <BigTitle brand={B} lines={['You never', '*slept* again?']} y={300} size={118} at={-20} until={sec(2.8, fps) - 10} />
      </Sequence>
      <Sequence name="days" from={sec(2.8, fps)} durationInFrames={durationInFrames - sec(2.8, fps)}>
        <BigTitle brand={B} lines={['Day']} y={300} size={110} at={0} />
        <div style={{ position: 'absolute', top: 400, left: 0, right: 160, textAlign: 'center', fontFamily: font.display, fontWeight: 900, fontSize: 260, lineHeight: 1, color: B.accent, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.04em' }}>{day}</div>
        <Stamp brand={B} text="hallucinating" x={540} y={1160} at={sec(8.9, fps) - sec(2.8, fps)} color={B.negative} size={64} rotate={-6} />
      </Sequence>
      <CharacterSlot x={540} y={690} at={10} />
      <Captions brand={B} lines={VO} plate />
      <ProgressBar brand={B} />
      {guides ? <SafeAreaGuides /> : null}
    </AbsoluteFill>
  );
};
