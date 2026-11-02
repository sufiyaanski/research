// THE SIGNAL · 001 · "Nobody bought this" (price anchoring). 1080x1920 @ 60 fps, 51 s.
// DEMO episode: every pattern a Signal reel needs — frame-0 hook, price tags, counters, bar
// chart, a "scale" diagram, word-highlight captions from vo.gen.ts, and a loop back to frame 0.
//
// Scene timing comes from beats.json (global seconds). Inside each <Sequence> frames are LOCAL;
// `cue(globalSeconds)` converts a VO word time to the local frame it must land on.
import React from 'react';
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from 'remotion';
import { SIGNAL as B, alpha } from '../../brand';
import { FONTS } from '../../fonts';
import {
  Backdrop,
  BarChart,
  BigTitle,
  Captions,
  EASE,
  Kicker,
  PriceTag,
  ProgressBar,
  Reveal,
  SAFE,
  SafeAreaGuides,
  SourceLine,
  Stamp,
  useSpring,
} from '../../lib/kit';
import { beat, beatsToFrames, toLocal } from '../../lib/timing';
import beats from './beats.json';
import { VO } from './vo.gen';

const BEATS = beatsToFrames(beats.beats);
const font = FONTS['the-signal'];

// Hero tag geometry — identical in HOOK and PAYOFF so the loop lands on the same pixels.
const HERO = { x: 320, y: 760, w: 440 } as const;

// =============================================================================
// HOOK — fully composed on frame 0 (negative `at` = pre-rolled)
// =============================================================================
const Hook: React.FC = () => {
  const b = beat(BEATS, 'hook');
  const exitAt = b.durationInFrames - 10;
  return (
    <>
      <Kicker brand={B} text="Price psychology · 001" at={-20} until={exitAt} />
      <BigTitle brand={B} lines={['Nobody', 'bought *this.*']} y={330} size={128} at={-30} until={exitAt} />
      <PriceTag brand={B} price="$429" label="bread maker" x={HERO.x} y={HERO.y} w={HERO.w} at={-40} fill={B.accent} rotate={-3} until={exitAt} />
    </>
  );
};

// =============================================================================
// SETUP — the lone $275 tag on an empty shelf
// =============================================================================
const Shelf: React.FC<{ y: number; at: number }> = ({ y, at }) => {
  const s = useSpring(at, 'soft');
  return (
    <div style={{ position: 'absolute', left: SAFE.side, right: SAFE.side, top: y, height: 26, opacity: Math.min(1, s * 2), scale: `${s} 1` }}>
      <div style={{ height: 26, borderRadius: 8, background: B.panel, border: `2px solid ${B.line}`, boxShadow: `0 30px 60px ${alpha('#000', 0.5)}` }} />
    </div>
  );
};

const Setup: React.FC = () => {
  const b = beat(BEATS, 'setup');
  const cue = (s: number) => toLocal(s, b.from);
  const exitAt = b.durationInFrames - 10;
  return (
    <>
      <Kicker brand={B} text="The setup" at={0} until={exitAt} />
      <BigTitle brand={B} lines={['One maker,', 'one *price.*']} y={330} size={112} at={6} until={exitAt} />
      <Shelf y={966} at={10} />
      <PriceTag brand={B} price="$275" label="bread maker" x={330} y={700} w={420} at={cue(6.2)} until={exitAt} />
      {/* lands on the word "Nobody" (9.2 s) — below the tag so it never covers the price */}
      <Stamp brand={B} text="not selling" x={540} y={1085} at={cue(9.2)} until={exitAt} size={68} rotate={-5} />
      <SourceLine brand={B} text="Simonson & Tversky (1992) · Williams-Sonoma, as reported" at={cue(6.2)} until={exitAt} />
    </>
  );
};

// =============================================================================
// TURN — the decoy arrives; sales of the cheap one ~double
// =============================================================================
const Turn: React.FC = () => {
  const b = beat(BEATS, 'turn');
  const cue = (s: number) => toLocal(s, b.from);
  const exitAt = b.durationInFrames - 10;
  const barsAt = cue(15.6);
  return (
    <>
      <Kicker brand={B} text="The move" at={0} until={exitAt} />
      <PriceTag brand={B} price="$275" label="original" x={90} y={400} w={420} at={-10} until={exitAt} />
      {/* second tag lands on "second one" (~13.1 s) */}
      <PriceTag brand={B} price="$429" label="deluxe" x={570} y={400} w={420} at={cue(13.1)} fill={B.accent} rotate={2} until={exitAt} />
      <BarChart
        brand={B}
        x={140}
        y={820}
        w={800}
        h={400}
        max={2.3}
        at={barsAt}
        dur={48}
        stagger={54}
        annotate={1}
        bars={[
          { label: 'before', value: 1, display: '1×', color: B.muted },
          { label: 'after', value: 1.95, display: '≈2×', color: B.positive },
        ]}
        until={exitAt}
      />
      <SourceLine brand={B} text="Sales of the $275 model, before vs after the $429 model appeared" at={barsAt} until={exitAt} />
    </>
  );
};

// =============================================================================
// WHY — the value scale: no idea what it's worth → anchor drops → $275 reads as fair
// =============================================================================
const ValueScale: React.FC<{ y: number; at: number; anchorAt: number; fairAt: number }> = ({ y, at, anchorAt, fairAt }) => {
  const frame = useCurrentFrame();
  const line = interpolate(frame, [at, at + 24], [0, 1], { easing: EASE.out, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const anchor = useSpring(anchorAt, 'snappy');
  const fair = interpolate(frame, [fairAt, fairAt + 36], [0, 1], { easing: EASE.outCubic, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const x0 = 120;
  const x1 = 900;
  const anchorX = x0 + (x1 - x0) * 0.82;
  const fairX = x0 + (x1 - x0) * (0.82 - 0.3 * fair);
  return (
    <div style={{ position: 'absolute', left: 0, top: y, width: 1080, height: 420 }}>
      {/* the scale */}
      <div style={{ position: 'absolute', left: x0, top: 230, height: 6, width: (x1 - x0) * line, background: B.line, borderRadius: 3 }} />
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
        <div key={i} style={{ position: 'absolute', left: x0 + (x1 - x0) * t - 2, top: 214, width: 4, height: 38, background: B.line, opacity: line > t ? 1 : 0 }} />
      ))}
      <div style={{ position: 'absolute', left: x0, top: 270, fontFamily: font.body, fontWeight: 700, fontSize: 32, color: B.muted, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: line }}>cheap</div>
      <div style={{ position: 'absolute', right: 1080 - x1, top: 270, fontFamily: font.body, fontWeight: 700, fontSize: 32, color: B.muted, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: line }}>expensive</div>

      {/* question marks drift along the scale until the anchor lands */}
      <div style={{ position: 'absolute', left: x0, width: x1 - x0, top: 110, textAlign: 'center', fontFamily: font.display, fontWeight: 900, fontSize: 96, color: alpha(B.text, 0.35), opacity: line * (1 - Math.min(1, anchor * 1.5)), letterSpacing: '0.3em' }}>
        ? ? ?
      </div>

      {/* the anchor: drops from above onto the scale */}
      <div style={{ position: 'absolute', left: anchorX, top: 0, translate: `-50% ${(1 - anchor) * -260}px`, opacity: Math.min(1, anchor * 2) }}>
        <div style={{ width: 8, height: 222, background: B.accent, margin: '0 auto', borderRadius: 4 }} />
        <div style={{ position: 'absolute', top: -2, left: '50%', translate: '-50% -100%', whiteSpace: 'nowrap', fontFamily: font.display, fontWeight: 900, fontSize: 88, color: B.accent, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em' }}>
          $429
        </div>
      </div>
      <Stamp brand={B} text="anchor" x={anchorX} y={330 + 40} at={anchorAt + 8} color={B.accent} size={44} rotate={0} />

      {/* $275 slides left of the anchor and turns positive: "looks fair" */}
      <div style={{ position: 'absolute', left: fairX, top: 150, translate: '-50% 0px', opacity: fair, textAlign: 'center' }}>
        <div style={{ fontFamily: font.display, fontWeight: 900, fontSize: 72, color: B.positive, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em' }}>$275</div>
        <div style={{ width: 8, height: 60, background: B.positive, margin: '0 auto', borderRadius: 4 }} />
      </div>
      <div style={{ position: 'absolute', left: fairX, top: 330, translate: '-50% 0px', opacity: interpolate(fair, [0.6, 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), whiteSpace: 'nowrap', fontFamily: font.body, fontWeight: 800, fontSize: 40, color: B.positive, letterSpacing: '0.04em' }}>
        looks fair
      </div>
    </div>
  );
};

const Why: React.FC = () => {
  const b = beat(BEATS, 'why');
  const cue = (s: number) => toLocal(s, b.from);
  const exitAt = b.durationInFrames - 10;
  return (
    <>
      <Kicker brand={B} text="Why it works" at={0} until={exitAt} />
      <BigTitle brand={B} lines={['What is it', '*worth?*']} y={330} size={120} at={4} until={cue(25.3)} />
      <BigTitle brand={B} lines={['*Anchoring*']} y={330} size={128} at={cue(25.5)} until={exitAt} />
      <ValueScale y={720} at={cue(20.0)} anchorAt={cue(23.6)} fairAt={cue(25.0)} />
    </>
  );
};

// =============================================================================
// PROOF — the 1974 wheel; 25% vs 45%
// =============================================================================
const Wheel: React.FC<{ cx: number; cy: number; r: number; at: number; spinAt: number; landAt: number; result: number }> = ({ cx, cy, r, at, spinAt, landAt, result }) => {
  const frame = useCurrentFrame();
  // 3 full turns + land so that `result` sits under the pointer (top). Wheel reads 0..100.
  const landAngle = 360 * 3 + (360 - (result / 100) * 360);
  const rot = interpolate(frame, [spinAt, landAt], [0, landAngle], { easing: EASE.inOut, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const show = interpolate(frame, [at - 12, at], [0, 1], { easing: EASE.out, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const landed = interpolate(frame, [landAt, landAt + 10], [0, 1], { easing: EASE.out, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const ticks = Array.from({ length: 20 }, (_, i) => i);
  return (
    <div style={{ position: 'absolute', left: cx - r, top: cy - r, width: r * 2, height: r * 2, opacity: show, scale: String(0.9 + 0.1 * show) }}>
      <svg width={r * 2} height={r * 2} viewBox={`0 0 ${r * 2} ${r * 2}`} style={{ rotate: `${rot}deg` }}>
        <circle cx={r} cy={r} r={r - 6} fill={B.panel} stroke={B.line} strokeWidth={6} />
        {ticks.map((i) => {
          const a = (i / 20) * Math.PI * 2 - Math.PI / 2;
          const inner = r - 50;
          const outer = r - 16;
          const label = i * 5;
          const lx = r + Math.cos(a) * (r - 86);
          const ly = r + Math.sin(a) * (r - 86);
          return (
            <g key={i}>
              <line x1={r + Math.cos(a) * inner} y1={r + Math.sin(a) * inner} x2={r + Math.cos(a) * outer} y2={r + Math.sin(a) * outer} stroke={i % 2 === 0 ? B.text : B.muted} strokeWidth={i % 2 === 0 ? 5 : 3} />
              {i % 2 === 0 ? (
                <text x={lx} y={ly} fill={B.muted} fontFamily={font.body} fontWeight={700} fontSize={30} textAnchor="middle" dominantBaseline="middle" transform={`rotate(${(i / 20) * 360} ${lx} ${ly})`}>
                  {label}
                </text>
              ) : null}
            </g>
          );
        })}
        <circle cx={r} cy={r} r={28} fill={B.ink} stroke={B.line} strokeWidth={4} />
      </svg>
      {/* pointer */}
      <div style={{ position: 'absolute', left: r - 22, top: -26, width: 0, height: 0, borderLeft: '22px solid transparent', borderRight: '22px solid transparent', borderTop: `44px solid ${B.accent}` }} />
      {/* result readout */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: r - 60, textAlign: 'center', fontFamily: font.display, fontWeight: 900, fontSize: 120, color: B.accent, opacity: landed, scale: String(0.8 + 0.2 * landed), fontVariantNumeric: 'tabular-nums', textShadow: `0 6px 40px ${alpha('#000', 0.7)}` }}>
        {result}
      </div>
    </div>
  );
};

const Proof: React.FC = () => {
  const b = beat(BEATS, 'proof');
  const cue = (s: number) => toLocal(s, b.from);
  const exitAt = b.durationInFrames - 10;
  const chartAt = cue(35.0);
  // second bar must land on "45%" (~39.0 s) → stagger from first bar start
  const stagger = cue(37.8) - chartAt;
  return (
    <>
      <Kicker brand={B} text="The experiment · 1974" at={0} until={exitAt} />
      {/* wheel is on screen from the cut; spins on "spun" (28.6) and lands before "rigged wheel" ends */}
      <Wheel cx={540} cy={540} r={180} at={cue(27.1)} spinAt={cue(28.6)} landAt={cue(30.5)} result={10} />
      <Reveal at={cue(31.4)} until={exitAt} style={{ position: 'absolute', left: SAFE.side, right: SAFE.side, top: 730, textAlign: 'center' }}>
        <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 52, lineHeight: 1.2, color: B.text, textWrap: 'balance' }}>
          What share of UN countries are <span style={{ color: B.accent }}>African?</span>
        </div>
      </Reveal>
      <BarChart
        brand={B}
        x={140}
        y={920}
        w={800}
        h={320}
        max={60}
        at={chartAt}
        dur={54}
        stagger={stagger}
        annotate={1}
        bars={[
          { label: 'wheel said 10', value: 25, display: '25%', color: B.muted },
          { label: 'wheel said 65', value: 45, display: '45%', color: B.accent },
        ]}
        until={exitAt}
      />
      <SourceLine brand={B} text="Tversky & Kahneman, Science (1974), median estimates" y={1252} at={chartAt} until={exitAt} />
    </>
  );
};

// =============================================================================
// EVERYDAY — three anchors you saw this week
// =============================================================================
const Everyday: React.FC = () => {
  const b = beat(BEATS, 'everyday');
  const cue = (s: number) => toLocal(s, b.from);
  const exitAt = b.durationInFrames - 10;
  return (
    <>
      <Kicker brand={B} text="You saw this today" at={0} until={exitAt} />
      <PriceTag brand={B} price="$90" label="the steak" x={90} y={420} w={420} at={cue(40.7)} rotate={-4} until={exitAt} />
      <PriceTag brand={B} price="$129" was="was $199" label="the deal" x={570} y={400} w={420} at={cue(43.6)} fill={B.accent} rotate={3} until={exitAt} />
      <BigTitle brand={B} lines={['The anchor isn’t', 'the *product.*']} y={940} size={96} at={cue(45.0)} until={exitAt} uppercase={false} />
    </>
  );
};

// =============================================================================
// PAYOFF — back to the hook composition (loop: last frame ≈ frame 0)
// =============================================================================
const Payoff: React.FC = () => {
  const b = beat(BEATS, 'payoff');
  const cue = (s: number) => toLocal(s, b.from);
  const swapAt = b.durationInFrames - 60; // 1 s before the end, dissolve to the hook headline
  return (
    <>
      <Kicker brand={B} text="Price psychology · 001" at={0} />
      <BigTitle brand={B} lines={['Who chose the', '*first number?*']} y={330} size={100} at={cue(47.6)} until={swapAt} />
      <BigTitle brand={B} lines={['Nobody', 'bought *this.*']} y={330} size={128} at={swapAt + 6} />
      <PriceTag brand={B} price="$429" label="bread maker" x={HERO.x} y={HERO.y} w={HERO.w} at={0} fill={B.accent} rotate={-3} />
    </>
  );
};

// =============================================================================
// EPISODE
// =============================================================================
export const SignalAnchoring: React.FC<{ guides?: boolean }> = ({ guides = false }) => {
  const scenes: Record<string, React.FC> = { hook: Hook, setup: Setup, turn: Turn, why: Why, proof: Proof, everyday: Everyday, payoff: Payoff };
  return (
    <AbsoluteFill style={{ backgroundColor: B.ink }}>
      <Backdrop brand={B} glowY={40} />
      {BEATS.map((b) => {
        const Scene = scenes[b.id];
        if (!Scene) throw new Error(`no scene for beat "${b.id}"`);
        return (
          <Sequence key={b.id} name={b.id} from={b.from} durationInFrames={b.durationInFrames}>
            <Scene />
          </Sequence>
        );
      })}
      {/* global layers: captions + progress live on the root timeline (global seconds) */}
      <Captions brand={B} lines={VO} />
      <ProgressBar brand={B} />
      {guides ? <SafeAreaGuides /> : null}
    </AbsoluteFill>
  );
};
