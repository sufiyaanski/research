// PAPER templates (2D field-notebook explainers, 1920x1080) — title, bigNumber, compareBars,
// diagram, timeline, quote, endscreen. The blocky person stands on the page's floor line at the right
// (transparent 3D inset) and talks on the scene's words. Every reveal lands on a spoken word
// (`on` / `landOn` props = a word from that scene's VO); see longform/README.md for each prop.
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import type { Pose } from '../../examples/character/BlockyCharacter';
import { BODY, CharacterInset, DISPLAY, Highlight, LF, Label, Paper, RiseText, SAFE, SourceLine, cue, ease, insetTopForFloor, lerp, ramp, type CharacterCue } from '../kit';
import type { ChapterTimeline, TimedScene } from '../types';

export type TemplateProps = { scene: TimedScene; chapter: ChapterTimeline };
type P = Record<string, unknown>;
const str = (p: P, k: string, d = '') => (typeof p[k] === 'string' ? (p[k] as string) : d);
const num = (p: P, k: string, d = 0) => (typeof p[k] === 'number' ? (p[k] as number) : d);
const arr = <T,>(p: P, k: string): T[] => (Array.isArray(p[k]) ? (p[k] as T[]) : []);

const FLOOR = 930;
/** the standard right-hand character slot on paper scenes */
const Presenter: React.FC<{ scene: TimedScene; pose?: Pose; cues?: CharacterCue[]; width?: number; left?: number; mood?: CharacterCue['mood'] }> = ({ scene, pose = 'idle', cues = [], width = 520, left = 1400, mood = 'neutral' }) => {
  const height = 900;
  const extra = arr<CharacterCue>(scene.props, 'character');
  return (
    <CharacterInset
      words={scene.words}
      left={left}
      top={insetTopForFloor(height, FLOOR)}
      width={width}
      height={height}
      pose={(scene.props.pose as Pose) ?? pose}
      mood={(scene.props.mood as CharacterCue['mood']) ?? mood}
      cues={[...cues, ...extra]}
      talking={scene.props.talking !== false}
    />
  );
};

// ------------------------------------------------------------------------------------------ title
/** Chapter card: "CHAPTER ONE" label, huge title rising out of a mask line, highlighter rule. */
export const TitleScene: React.FC<TemplateProps> = ({ scene, chapter }) => {
  const f = useCurrentFrame();
  const label = str(scene.props, 'label', chapter.label);
  const title = str(scene.props, 'title', chapter.title);
  return (
    <Paper floorY={FLOOR}>
      <div style={{ position: 'absolute', left: SAFE.x0, top: 250, width: 1180 }}>
        {label ? <Label text={label} at={2} /> : null}
        <RiseText text={title} at={6} size={168} style={{ marginTop: 26 }} />
        <div style={{ marginTop: 34, height: 22, width: 560, background: LF.accent, transformOrigin: 'left', transform: `scaleX(${ramp(f, 14, 26)})` }} />
      </div>
      <Presenter scene={scene} pose="point" cues={[{ pose: 'idle', atFrame: Math.min(scene.durationInFrames - 1, 50) }]} />
    </Paper>
  );
};

// ------------------------------------------------------------------------------------------ bigNumber
const fmt = (v: number, decimals: number) => v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
/** One number, the biggest thing on screen, counting up 1.2–1.6 s and landing ON its spoken word. */
export const BigNumberScene: React.FC<TemplateProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = scene.props;
  const value = num(p, 'value');
  const decimals = num(p, 'decimals', 0);
  const land = cue(scene.words, str(p, 'landOn'), Math.round(scene.durationInFrames * 0.4));
  const countStart = Math.max(4, land - Math.round(num(p, 'countSec', 1.4) * fps));
  // step-eased count (whole steps), number locked to the frame it is spoken
  const t = ramp(f, countStart, land, ease.out);
  const steps = Math.max(1, Math.min(24, Math.round(value)));
  const shown = f >= land ? value : Math.round(t * steps) / steps * value;
  const visible = f >= countStart;
  const labelAt = Math.min(6, land);
  return (
    <Paper floorY={FLOOR}>
      <div style={{ position: 'absolute', left: SAFE.x0, top: 150, width: 1240 }}>
        <Label text={str(p, 'kicker')} at={labelAt} />
        <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 340, lineHeight: 1, color: LF.ink, fontVariantNumeric: 'tabular-nums', marginTop: 10, opacity: visible ? 1 : 0, whiteSpace: 'nowrap' }}>
          <Highlight at={land} pad={22}>
            {str(p, 'prefix')}
            {fmt(shown, decimals)}
            {str(p, 'suffix')}
          </Highlight>
        </div>
        <RiseText text={str(p, 'label')} at={land + 4} size={64} font={BODY} weight={800} style={{ marginTop: 24, maxWidth: 1180 }} />
        {str(p, 'note') ? <RiseText text={str(p, 'note')} at={cue(scene.words, str(p, 'noteOn'), land + 30)} size={46} font={BODY} weight={700} color={LF.inkSoft} style={{ marginTop: 18, maxWidth: 1180 }} /> : null}
      </div>
      <SourceLine text={str(p, 'source')} at={land} />
      <Presenter scene={scene} cues={[{ pose: 'point', atFrame: Math.max(0, land - 6) }]} />
    </Paper>
  );
};

// ------------------------------------------------------------------------------------------ compareBars
type Bar = { label: string; value: number; on?: string; display?: string; focus?: boolean };
/** 2–4 horizontal bars; each grows ON its word and its number is locked to its length (HARNESS lesson). */
export const CompareBarsScene: React.FC<TemplateProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const p = scene.props;
  const bars = arr<Bar>(p, 'bars');
  const max = num(p, 'max', Math.max(1, ...bars.map((b) => b.value)));
  const W = 1000;
  const rowH = bars.length > 3 ? 150 : 190;
  const focusIdx = Math.max(0, bars.findIndex((b) => b.focus));
  const lands = bars.map((b, i) => cue(scene.words, b.on, 8 + i * 20));
  return (
    <Paper floorY={FLOOR}>
      <div style={{ position: 'absolute', left: SAFE.x0, top: 130, width: 1240 }}>
        <RiseText text={str(p, 'title')} at={2} size={84} />
        {str(p, 'unit') ? <Label text={str(p, 'unit')} at={8} style={{ marginTop: 12 }} /> : null}
        <div style={{ marginTop: 50 }}>
          {bars.map((b, i) => {
            const k = ramp(f, lands[i], lands[i] + 12);
            const len = W * (b.value / max) * k;
            const shown = Math.round(b.value * k);
            const focus = i === focusIdx && bars.some((x) => x.focus);
            return (
              <div key={i} style={{ height: rowH, opacity: f >= lands[i] - 2 ? 1 : 0 }}>
                <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 46, color: LF.ink }}>{b.label}</div>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: 12 }}>
                  <div style={{ height: 78, width: Math.max(6, len), background: focus ? LF.accent : LF.ink, boxShadow: focus ? `inset 0 0 0 6px ${LF.ink}` : undefined }} />
                  <div style={{ marginLeft: 26, fontFamily: DISPLAY, fontWeight: 900, fontSize: 72, color: LF.ink, fontVariantNumeric: 'tabular-nums' }}>
                    {k >= 1 && b.display ? b.display : shown}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <SourceLine text={str(p, 'source')} at={lands[0]} />
      <Presenter scene={scene} cues={[{ pose: 'point', atFrame: Math.max(0, lands[focusIdx] - 4) }, { mood: str(p, 'focusMood', 'worried') as CharacterCue['mood'], atFrame: lands[focusIdx] }]} />
    </Paper>
  );
};

// ------------------------------------------------------------------------------------------ diagram
type Pin = { x: number; y: number; label: string; on?: string };
type Node = { label: string; on?: string };
/**
 * Diagram slot. kinds: `orbit` (Earth + Moon + tidal bulges, built for what-if space topics),
 * `pins` (labelled pins on an abstract dotted map — a PLACEHOLDER: swap for a real map, see the
 * remotion-maps skill), `flow` (3–5 boxes joined by arrows, cause → effect).
 */
export const DiagramScene: React.FC<TemplateProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const p = scene.props;
  const kind = str(p, 'kind', 'flow');
  return (
    <Paper floorY={FLOOR}>
      {str(p, 'title') ? (
        <div style={{ position: 'absolute', left: SAFE.x0, top: 110 }}>
          <RiseText text={str(p, 'title')} at={2} size={76} />
        </div>
      ) : null}
      {kind === 'orbit' ? <Orbit scene={scene} f={f} /> : kind === 'pins' ? <Pins scene={scene} f={f} /> : <Flow scene={scene} f={f} />}
      <SourceLine text={str(p, 'source')} at={8} />
      <Presenter scene={scene} cues={arr<CharacterCue>(p, 'cues')} />
    </Paper>
  );
};

const Orbit: React.FC<{ scene: TimedScene; f: number }> = ({ scene, f }) => {
  const p = scene.props;
  const bulge = ramp(f, cue(scene.words, str(p, 'bulgesOn'), 20), cue(scene.words, str(p, 'bulgesOn'), 20) + 18, ease.inOut);
  const spinAt = cue(scene.words, str(p, 'spinOn'), scene.durationInFrames);
  const spin = Math.max(0, f - spinAt) * 0.9; // degrees/frame once the spin is named
  const moonIn = ramp(f, cue(scene.words, str(p, 'moonOn'), 4), cue(scene.words, str(p, 'moonOn'), 4) + 10);
  const pullOn = cue(scene.words, str(p, 'pullOn'), cue(scene.words, str(p, 'bulgesOn'), 20) - 6);
  const cx = 600;
  const cy = 560;
  const R = 200;
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      {/* ocean envelope stretched along the Earth–Moon axis */}
      <ellipse cx={cx} cy={cy} rx={R + 18 + 80 * bulge} ry={R + 18 - 14 * bulge} fill="#BFD3D8" stroke={LF.ink} strokeWidth={6} />
      <circle cx={cx} cy={cy} r={R} fill={LF.paper} stroke={LF.ink} strokeWidth={8} />
      <g transform={`rotate(${spin} ${cx} ${cy})`}>
        {/* landmasses: irregular blocky shapes, deliberately asymmetric (no accidental face) */}
        <path d={`M ${cx - 150} ${cy - 90} h 90 v 40 h 50 v 70 h -60 v 50 h -50 v -60 h -30 z`} fill={LF.ink} opacity={0.82} />
        <path d={`M ${cx + 20} ${cy - 160} h 70 v 30 h 40 v 110 h -40 v 60 h -40 v -90 h -30 z`} fill={LF.ink} opacity={0.82} />
        <path d={`M ${cx - 40} ${cy + 80} h 120 v 34 h -40 v 40 h -80 z`} fill={LF.ink} opacity={0.82} />
      </g>
      {f >= spinAt ? <path d={`M ${cx - 70} ${cy - R - 40} A 120 60 0 0 1 ${cx + 70} ${cy - R - 40}`} fill="none" stroke={LF.ink} strokeWidth={7} markerEnd="url(#ah)" /> : null}
      <defs>
        <marker id="ah" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
          <path d="M0,0 L8,4 L0,8 z" fill={LF.ink} />
        </marker>
      </defs>
      <g opacity={moonIn} transform={`translate(${(1 - moonIn) * 40} 0)`}>
        <circle cx={1220} cy={cy} r={70} fill="#E8EEFF" stroke={LF.ink} strokeWidth={7} />
        <text x={1220} y={cy + 140} textAnchor="middle" fontFamily={BODY} fontWeight={800} fontSize={44} fill={LF.ink}>
          {str(p, 'moonLabel', 'Moon')}
        </text>
      </g>
      {f >= pullOn ? (
        <line x1={1140} y1={cy} x2={lerp(1140, cx + R + 120, ramp(f, pullOn, pullOn + 12))} y2={cy} stroke={LF.ink} strokeWidth={7} strokeDasharray="22 16" markerEnd="url(#ah)" />
      ) : null}
      <text x={cx} y={cy + R + 110} textAnchor="middle" fontFamily={BODY} fontWeight={800} fontSize={44} fill={LF.ink}>
        {str(p, 'earthLabel', 'Earth')}
      </text>
      {bulge > 0.5 ? (
        <g opacity={ramp(f, cue(scene.words, str(p, 'bulgesOn'), 20) + 8, cue(scene.words, str(p, 'bulgesOn'), 20) + 16)}>
          <rect x={cx + R + 70} y={cy - 150} width={260} height={64} fill={LF.accent} />
          <text x={cx + R + 86} y={cy - 104} fontFamily={DISPLAY} fontWeight={900} fontSize={44} fill={LF.ink}>
            {str(p, 'bulgeLabel', 'BULGE')}
          </text>
        </g>
      ) : null}
    </svg>
  );
};

const Pins: React.FC<{ scene: TimedScene; f: number }> = ({ scene, f }) => {
  const pins = arr<Pin>(scene.props, 'pins');
  return (
    <div style={{ position: 'absolute', left: SAFE.x0, top: 230, width: 1180, height: 640 }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(${LF.ink} 2.4px, transparent 2.8px)`, backgroundSize: '30px 30px', opacity: 0.35 }} />
      {pins.map((pin, i) => {
        const at = cue(scene.words, pin.on, 10 + i * 18);
        const k = ramp(f, at, at + 10);
        return (
          <div key={i} style={{ position: 'absolute', left: `${pin.x * 100}%`, top: `${pin.y * 100}%`, opacity: k, transform: `translate(-50%, ${-100 - (1 - k) * 30}%)` }}>
            <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 40, background: LF.ink, color: LF.paper, padding: '8px 18px', whiteSpace: 'nowrap' }}>{pin.label}</div>
            <div style={{ width: 0, height: 0, margin: '0 auto', borderLeft: '16px solid transparent', borderRight: '16px solid transparent', borderTop: `22px solid ${LF.ink}` }} />
          </div>
        );
      })}
    </div>
  );
};

const Flow: React.FC<{ scene: TimedScene; f: number }> = ({ scene, f }) => {
  const nodes = arr<Node>(scene.props, 'nodes');
  const w = Math.min(340, 1180 / Math.max(1, nodes.length) - 50);
  return (
    <div style={{ position: 'absolute', left: SAFE.x0, top: 430, display: 'flex', alignItems: 'center' }}>
      {nodes.map((n, i) => {
        const at = cue(scene.words, n.on, 8 + i * 24);
        const k = ramp(f, at, at + 10);
        const last = i === nodes.length - 1;
        return (
          <React.Fragment key={i}>
            {i > 0 ? <div style={{ width: 50 * k, height: 8, background: LF.ink, opacity: k }} /> : null}
            <div style={{ width: w, minHeight: 170, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 18, fontFamily: DISPLAY, fontWeight: 800, fontSize: 52, lineHeight: 1.05, color: LF.ink, background: last ? LF.accent : LF.paper, border: `7px solid ${LF.ink}`, opacity: k, transform: `translateY(${(1 - k) * 24}px)` }}>
              {n.label}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ------------------------------------------------------------------------------------------ timeline
type Stop = { label: string; sub?: string; on?: string };
/** A line that draws itself to each stop as it is named; the newest stop carries the highlighter. */
export const TimelineScene: React.FC<TemplateProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const p = scene.props;
  const stops = arr<Stop>(p, 'stops');
  const x0 = 330; // first label (320 wide, centred) starts at x 170 — inside the safe area
  const x1 = 1290;
  const y = 600;
  const xs = stops.map((_, i) => (stops.length === 1 ? x0 : lerp(x0, x1, i / (stops.length - 1))));
  const lands = stops.map((s, i) => cue(scene.words, s.on, 10 + i * 30));
  let head = x0;
  lands.forEach((at, i) => {
    if (i === 0) return;
    head = Math.max(head, lerp(xs[i - 1], xs[i], ramp(f, at - 10, at, ease.inOut)));
  });
  const current = lands.reduce((c, at, i) => (f >= at ? i : c), -1);
  return (
    <Paper floorY={FLOOR}>
      {str(p, 'title') ? (
        <div style={{ position: 'absolute', left: SAFE.x0, top: 130 }}>
          <RiseText text={str(p, 'title')} at={2} size={84} />
        </div>
      ) : null}
      {/* the track ahead (dashed, soft) so the whole journey reads from the first frame; solid ink = travelled */}
      <div style={{ position: 'absolute', left: x0, top: y - 2, height: 4, width: x1 - x0, backgroundImage: `repeating-linear-gradient(90deg, ${LF.inkSoft} 0 18px, transparent 18px 34px)`, opacity: ramp(f, 2, 12) }} />
      <div style={{ position: 'absolute', left: x0, top: y - 5, height: 10, width: head - x0, background: LF.ink }} />
      {stops.map((s, i) => {
        const k = ramp(f, lands[i], lands[i] + 10);
        const up = i % 2 === 0;
        return (
          <div key={i} style={{ position: 'absolute', left: xs[i], top: y, opacity: k }}>
            <div style={{ position: 'absolute', left: -26, top: -26, width: 52, height: 52, borderRadius: 26, background: i === current ? LF.accent : LF.ink, border: `8px solid ${LF.ink}` }} />
            <div style={{ position: 'absolute', left: -160, width: 320, textAlign: 'center', top: up ? -210 : 60, transform: `translateY(${(1 - k) * (up ? 20 : -20)}px)` }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 62, lineHeight: 1, color: LF.ink }}>
                {i === current ? <Highlight at={lands[i]}>{s.label}</Highlight> : s.label}
              </div>
              {s.sub ? <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 38, color: LF.inkSoft, marginTop: 10 }}>{s.sub}</div> : null}
            </div>
          </div>
        );
      })}
      <Presenter scene={scene} cues={arr<CharacterCue>(p, 'cues')} />
    </Paper>
  );
};

// ------------------------------------------------------------------------------------------ quote
/** A short quote (≤ 18 words) set big; listed words get the highlighter ON the frame they are spoken. */
export const QuoteScene: React.FC<TemplateProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const p = scene.props;
  const hl = arr<string>(p, 'highlight').map((w) => w.toLowerCase());
  const words = str(p, 'text').split(' ');
  const at0 = 4;
  return (
    <Paper floorY={FLOOR}>
      <div style={{ position: 'absolute', left: SAFE.x0 - 10, top: 70, fontFamily: DISPLAY, fontWeight: 900, fontSize: 300, lineHeight: 1, color: LF.ink, opacity: ramp(f, 0, 8) }}>“</div>
      <div style={{ position: 'absolute', left: SAFE.x0 + 40, top: 300, width: 1180, fontFamily: DISPLAY, fontWeight: 800, fontSize: 78, lineHeight: 1.12, color: LF.ink }}>
        {words.map((w, i) => {
          const clean = w.toLowerCase().replace(/[^a-z0-9%$]/g, '');
          const k = ramp(f, at0 + i * 2, at0 + i * 2 + 10);
          const hlAt = cue(scene.words, clean, at0 + 20 + i * 2);
          return (
            <span key={i} style={{ display: 'inline-block', marginRight: 22, opacity: k, transform: `translateY(${(1 - k) * 18}px)` }}>
              {hl.includes(clean) ? <Highlight at={hlAt} pad={8}>{w}</Highlight> : w}
            </span>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: SAFE.x0 + 40, top: 820 - 40, fontFamily: BODY, fontWeight: 800, fontSize: 44, color: LF.inkSoft, opacity: ramp(f, at0 + words.length * 2, at0 + words.length * 2 + 10) }}>
        — {str(p, 'by')}
      </div>
      <SourceLine text={str(p, 'source')} at={at0 + 10} />
      <Presenter scene={scene} mood="neutral" />
    </Paper>
  );
};

// ------------------------------------------------------------------------------------------ endscreen
/**
 * End screen (YouTube end-screen elements need the last 5–20 s): two clear 16:9 slots where YouTube
 * draws "next video" cards, a short line, the character pointing at the first slot. No "subscribe"
 * button drawn — YouTube's own element goes there.
 */
export const EndScreenScene: React.FC<TemplateProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const p = scene.props;
  const slot = (x: number, at: number) => (
    <div style={{ position: 'absolute', left: x, top: 330, width: 560, height: 315, background: LF.paperEdge, opacity: ramp(f, at, at + 10), transform: `translateY(${(1 - ramp(f, at, at + 10)) * 24}px)` }} />
  );
  return (
    <Paper floorY={FLOOR}>
      <div style={{ position: 'absolute', left: SAFE.x0, top: 130 }}>
        <RiseText text={str(p, 'line', 'Where this goes next')} at={2} size={84} />
      </div>
      {slot(SAFE.x0, 10)}
      {slot(SAFE.x0 + 620, 14)}
      {str(p, 'next') ? (
        <div style={{ position: 'absolute', left: SAFE.x0, top: 680, fontFamily: BODY, fontWeight: 800, fontSize: 46, color: LF.ink, opacity: ramp(f, 18, 28) }}>
          Next: <Highlight at={24}>{str(p, 'next')}</Highlight>
        </div>
      ) : null}
      <Presenter scene={scene} pose="point" mood="happy" />
    </Paper>
  );
};
