// SignalDemo — The Signal: "$9.99 isn't $10" (the left-digit effect). 15 s, 1080x1920 @ 30 fps.
//
// One timeline: the VO word timings (words.json → beats.json) are the clock; the shot list
// (shotlist.yaml → shotlist.json) holds the shots as states on that grid plus every SFX cue; the
// counters step on the SAME tick cues the <SfxTrack> plays. No frame number is typed in here:
// every moment is `onset('<word>')`, a shot boundary, or a duration in seconds × fps.
//
// Layering (decision): the cream page, floor, tag and bars are 2D; the blocky person is ONE
// full-frame transparent <ThreeCanvas> (fixed, near-orthographic camera registered to page pixels)
// laid over them; headline, source line and captions sit on top. 2D contact shadow under the feet.
import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont as loadArchivo } from '@remotion/google-fonts/Archivo';
import { loadFont as loadManrope } from '@remotion/google-fonts/Manrope';
import { parseShotList, useCaptionChunk, usePop, type BeatsFile } from '../../beat-grid';
import { MusicBed, SFX_IDS, SfxTrack } from '../../sfx/cues';
import { BlockyCharacter, SIGNAL_PALETTE, takeLandFrames, CHARACTER_HEIGHT, type MoodKey, type PoseKey } from '../character/BlockyCharacter';
import { FixedCamera, PRINT_THEME, Stage3D } from '../character/Stage3D';
import shotListJson from './shotlist.json';
import voJson from './beats.json';

const display = loadArchivo('normal', { weights: ['800', '900'], subsets: ['latin'] }).fontFamily;
const body = loadManrope('normal', { weights: ['600', '800'], subsets: ['latin'] }).fontFamily;

// ---------------------------------------------------------------------------------------------
// Brand (HARNESS §5) — red ONLY on money words / money objects
// ---------------------------------------------------------------------------------------------
export const SIG = {
  cream: '#F4EFE6',
  ink: '#1B1B1B',
  red: '#D7263D',
  edge: '#E6DFD2',
  paper: '#FBF8F1',
  mute: 'rgba(27,27,27,0.30)',
  shadow: 'rgba(27,27,27,0.15)',
} as const;

const { shotList } = parseShotList(shotListJson, { sfxIds: SFX_IDS });
const vo = voJson as BeatsFile;
const BED_BPM = 120;
const SFX_MASTER_DB = -6;
const BED_VOLUME = 1.12; // +1 dB: lands the mix at ≈ −15.5 LUFS integrated

// ---------------------------------------------------------------------------------------------
// Timeline lookups (global frames)
// ---------------------------------------------------------------------------------------------
const shot = (id: string) => {
  const s = shotList.shots.find((x) => x.id === id);
  if (!s) throw new Error(`no shot "${id}"`);
  return s;
};
const norm = (w: string) => w.replace(/[.,!?;:]+$/, '');
/** onset frame of the nth (1-based) spoken occurrence of a word */
const onset = (word: string, nth = 1) => {
  const hits = (vo.words ?? []).filter((w) => norm(w.w) === word);
  if (!hits[nth - 1]) throw new Error(`word "${word}" #${nth} not in words.json`);
  return hits[nth - 1].start;
};
const cues = (id: string, sfx: string) => {
  const s = shot(id);
  return s.sfx.filter((c) => c.id === sfx).map((c) => s.start + c.at);
};

const SH = { hook: shot('hook'), flip: shot('flip'), digit: shot('digit'), feels: shot('feels'), reveal: shot('reveal'), effect: shot('effect'), payoff: shot('payoff') };
const T = {
  to10: onset('$10', 1),
  brain: onset('brain'),
  cent: onset('cent'),
  less: onset('less'),
  cheaper: onset('cheaper'),
  stop: onset('stop'),
  nine: onset('9'),
  nineDollars: onset('$9'),
  ten: onset('$10', 2),
  leftDigit: onset('left-digit'),
  whole: onset('whole'),
  price: onset('price'),
};
// counter steps = the tick cues + the landing cue of each count shot (picture can't drift from sound)
const COUNT_A = [...cues('feels', 'tick'), ...cues('feels', 'pop')].sort((a, b) => a - b);
const COUNT_B = [...cues('reveal', 'tick'), ...cues('reveal', 'cash-register')].sort((a, b) => a - b);
const END_THUMP = cues('payoff', 'thump')[0];

// ---------------------------------------------------------------------------------------------
// Layout (page pixels, 1080x1920; text inside x 70–1010, y 220–1280; right rail x>930 below 1100)
// ---------------------------------------------------------------------------------------------
const FLOOR_Y = 1060;
const HERO_X = 250; // the person's feet (centre)
const CHAR_PX = 480; // on-screen height of the person (≥ 320 px, HARNESS §1.4)
const TAG = { w: 540, h: 320, chamfer: 64, holeX: 54, holeY: 160 };
const TAG_HOME = { x: 468, y: 728, scale: 1, rot: -5 }; // hole position on the page
const TAG_DIGIT = { x: 470, y: 660, scale: 1.1, rot: -3 }; // round 3: right of the pointing hand (never cover the hero price)
const TAG_SMALL = { x: 560, y: 690, scale: 0.78, rot: -5 };
const BARS = { aX: 432, bX: 752, w: 250, maxH: 660 }; // round 2: taller (hero ≥ 1/3 of the frame), numbers sit up top

// ---------------------------------------------------------------------------------------------
// Easing helpers (HARNESS §1.1: out for arrivals, inOut for moves, in for exits; always clamped)
// ---------------------------------------------------------------------------------------------
const ease = {
  out: Easing.out(Easing.cubic),
  inOut: Easing.inOut(Easing.cubic),
  in: Easing.in(Easing.cubic),
};
const ramp = (f: number, a: number, b: number, e: (t: number) => number = ease.out) =>
  interpolate(f, [a, b], [0, 1], { easing: e, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** seconds → frames */
const useSec = () => {
  const { fps } = useVideoConfig();
  return (s: number) => Math.round(s * fps);
};

// ---------------------------------------------------------------------------------------------
// Page: cream ground + paper-edge floor
// ---------------------------------------------------------------------------------------------
const Page: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: SIG.cream }}>
    <div style={{ position: 'absolute', left: 0, right: 0, top: FLOOR_Y, bottom: 0, backgroundColor: SIG.edge }} />
    <div style={{ position: 'absolute', left: 0, right: 0, top: FLOOR_Y, height: 4, backgroundColor: 'rgba(27,27,27,0.12)' }} />
  </AbsoluteFill>
);

// ---------------------------------------------------------------------------------------------
// Headline: rises out of a mask line (no fade), exits back down into it
// ---------------------------------------------------------------------------------------------
const Headline: React.FC<{ lines: React.ReactNode[]; at: number; until?: number; y?: number; size?: number }> = ({
  lines,
  at,
  until,
  y = 236,
  size = 112,
}) => {
  const frame = useCurrentFrame();
  const sec = useSec();
  const enter = sec(0.33);
  const exit = sec(0.2);
  const stagger = sec(0.1);
  return (
    <div style={{ position: 'absolute', left: 70, right: 70, top: y, fontFamily: display, fontWeight: 900, fontSize: size, lineHeight: 1.0, letterSpacing: '-0.02em', color: SIG.ink, textTransform: 'uppercase' }}>
      {lines.map((l, i) => {
        const inT = ramp(frame, at + i * stagger, at + i * stagger + enter, ease.out);
        const outT = until === undefined ? 0 : ramp(frame, until, until + exit, ease.in);
        const ty = (1 - inT) * 105 + outT * 105;
        return (
          <div key={i} style={{ overflow: 'hidden', paddingBottom: 6 }}>
            <div style={{ transform: `translateY(${ty}%)` }}>{l}</div>
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// The price tag (paper card with chamfered end, punched hole, string) — a money object
// ---------------------------------------------------------------------------------------------
type Face = 'nine' | 'ten';
const PriceText: React.FC<{ face: Face; size: number; fadeCents: number; centsRed: number; ninePop: number; box: number }> = ({ face, size, fadeCents, centsRed, ninePop, box }) => {
  const centsColor = centsRed > 0 ? SIG.red : fadeCents > 0 ? `rgba(215,38,61,${lerp(1, 0.22, fadeCents)})` : SIG.red;
  const style: React.CSSProperties = { fontFamily: display, fontWeight: 900, fontSize: size, letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: SIG.red, whiteSpace: 'nowrap' };
  if (face === 'ten')
    return (
      <span style={{ ...style, fontSize: size * 0.88 }}>
        $10<span>.00</span>
      </span>
    );
  return (
    <span style={style}>
      $
      <span style={{ display: 'inline-block', position: 'relative', scale: String(ninePop) }}>
        9
        {box > 0 ? (
          // ink box drawn around the left digit (stroke reveal)
          <div style={{ position: 'absolute', left: -14, right: -14, top: -6, bottom: -14, border: `7px solid ${SIG.ink}`, borderRadius: 12, clipPath: `inset(0 ${(1 - box) * 100}% 0 0)` }} />
        ) : null}
      </span>
      <span style={{ color: centsColor }}>.99</span>
    </span>
  );
};

const PriceTag: React.FC<{
  x: number;
  y: number;
  scale: number;
  rot: number;
  /** 0..180 degrees of the current flip (0 = face A, 180 = face B) */
  flipDeg: number;
  faceA: Face;
  faceB: Face;
  pop: number;
  fadeCents: number;
  box: number;
  ninePop: number;
  centsRed: number;
  underline: number;
  sticker: number;
  stickerOut: number;
  nail: [number, number];
}> = ({ x, y, scale, rot, flipDeg, faceA, faceB, pop, fadeCents, box, ninePop, centsRed, underline, sticker, stickerOut, nail }) => {
  const showB = flipDeg > 90;
  const face = showB ? faceB : faceA;
  const deg = showB ? flipDeg - 180 : flipDeg;
  const left = x - TAG.holeX;
  const top = y - TAG.holeY;
  const { w, h, chamfer: c } = TAG;
  const path = `M ${c} 0 L ${w - 14} 0 Q ${w} 0 ${w} 14 L ${w} ${h - 14} Q ${w} ${h} ${w - 14} ${h} L ${c} ${h} L 0 ${h - c} L 0 ${c} Z`;
  // string from the nail to the hole (page space; the hole is the tag's pivot so it never detaches)
  const len = Math.hypot(nail[0] - x, nail[1] - y);
  const ang = (Math.atan2(nail[1] - y, nail[0] - x) * 180) / Math.PI;
  return (
    <>
      <div style={{ position: 'absolute', left: x, top: y - 2, width: len, height: 4, background: SIG.ink, opacity: 0.75, transformOrigin: '0 50%', rotate: `${ang}deg`, borderRadius: 2 }} />
      <div style={{ position: 'absolute', left: nail[0] - 9, top: nail[1] - 9, width: 18, height: 18, borderRadius: 9, background: SIG.ink }} />
      <div
        style={{
          position: 'absolute',
          left,
          top,
          width: w,
          height: h,
          transformOrigin: `${TAG.holeX}px ${TAG.holeY}px`,
          transform: `perspective(1400px) rotate(${rot}deg) scale(${scale}) rotateY(${deg}deg)`,
        }}
      >
        <svg width={w} height={h} style={{ position: 'absolute', inset: 0, overflow: 'visible', filter: `drop-shadow(0px 10px 14px ${SIG.shadow})` }}>
          <path d={path} fill={SIG.paper} stroke={SIG.edge} strokeWidth={4} />
          <circle cx={TAG.holeX} cy={TAG.holeY} r={22} fill={SIG.edge} />
          <circle cx={TAG.holeX} cy={TAG.holeY} r={13} fill={SIG.cream} stroke="rgba(27,27,27,0.25)" strokeWidth={2} />
        </svg>
        <div style={{ position: 'absolute', left: 104, right: 24, top: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', scale: String(pop) }}>
            <PriceText face={face} size={150} fadeCents={fadeCents} centsRed={centsRed} ninePop={ninePop} box={box} />
            {face === 'nine' && underline > 0 ? (
              <div style={{ position: 'absolute', left: 0, bottom: -18, height: 10, width: `${underline * 100}%`, background: SIG.red, borderRadius: 5 }} />
            ) : null}
          </div>
        </div>
        {sticker > 0 && stickerOut < 1 ? (
          <div
            style={{
              position: 'absolute',
              right: -34,
              top: -46,
              width: 132,
              height: 132,
              borderRadius: 66,
              background: SIG.red,
              color: SIG.paper,
              fontFamily: display,
              fontWeight: 900,
              fontSize: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              letterSpacing: '-0.02em',
              rotate: '12deg',
              scale: String(lerp(1.3, 1, sticker) * (1 - stockerOutEase(stickerOut))),
              opacity: sticker > 0.01 ? 1 : 0,
              boxShadow: `0 6px 10px ${SIG.shadow}`,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            −1¢
          </div>
        ) : null}
      </div>
    </>
  );
};
const stockerOutEase = (t: number) => ease.in(Math.max(0, Math.min(1, t)));

/** Drives the tag across all shots from the timeline. */
const TagLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const sec = useSec();
  const move = sec(0.4);
  // position keys: home → digit push-in → exits up (bars) → small (effect) → home (payoff)
  const toDigit = ramp(frame, SH.digit.start, SH.digit.start + move, ease.inOut);
  const exitUp = ramp(frame, SH.feels.start, SH.feels.start + sec(0.2), ease.in);
  const inSmall = ramp(frame, SH.effect.start, SH.effect.start + sec(0.33), ease.out);
  const toHome = ramp(frame, SH.payoff.start, SH.payoff.start + move, ease.inOut);
  const pop = usePop([vo.pops?.[0] ?? -99, T.cheaper, T.price]);
  const ninePop = usePop([T.nine], { peak: 1.12 });
  let p = TAG_HOME;
  let dy = 0;
  if (frame >= SH.payoff.start) p = mixPose(TAG_SMALL, TAG_HOME, toHome);
  else if (frame >= SH.effect.start) {
    p = TAG_SMALL;
    dy = (1 - inSmall) * -900;
  } else if (frame >= SH.feels.start) {
    p = TAG_DIGIT;
    dy = exitUp * -1100;
  } else if (frame >= SH.digit.start) p = mixPose(TAG_HOME, TAG_DIGIT, toDigit);

  // flips: hook "$10" → ten, flip "less" → nine. 3 frames in (to edge-on, cubic in), 2 out (cubic out)
  const flipIn = sec(0.1);
  const flipOut = sec(0.067);
  const flip = (w: number) => (frame < w ? 90 * ramp(frame, w - flipIn, w, ease.in) : 90 + 90 * ramp(frame, w, w + flipOut, ease.out));
  let flipDeg = 0;
  let faceA: Face = 'nine';
  let faceB: Face = 'ten';
  if (frame >= T.to10 - flipIn && frame < T.less - flipIn) {
    flipDeg = frame < T.to10 + flipOut ? flip(T.to10) : 180;
  } else if (frame >= T.less - flipIn && frame < SH.digit.start) {
    faceA = 'ten';
    faceB = 'nine';
    flipDeg = flip(T.less);
  }
  const digitOn = frame >= T.stop && frame < SH.payoff.start;
  const fade = digitOn ? ramp(frame, T.stop, T.stop + sec(0.27), ease.out) : frame >= SH.payoff.start ? 1 - ramp(frame, T.whole, T.whole + sec(0.27), ease.out) : 0;
  const box = frame >= T.stop && frame < SH.payoff.start ? ramp(frame, T.stop, T.stop + sec(0.33), ease.out) : frame >= SH.payoff.start ? 1 - ramp(frame, SH.payoff.start, SH.payoff.start + sec(0.2), ease.in) : 0;
  const underline = frame >= T.price && frame < END_THUMP - sec(0.33) ? ramp(frame, T.price - sec(0.1), T.price + sec(0.2), ease.out) : frame >= END_THUMP - sec(0.33) ? 1 - ramp(frame, END_THUMP - sec(0.33), END_THUMP - sec(0.13), ease.in) : 0;
  const sticker = frame >= T.cent - sec(0.1) && frame < SH.digit.start + sec(0.2) ? ramp(frame, T.cent - sec(0.1), T.cent + sec(0.17), ease.out) : 0;
  const stickerOut = ramp(frame, SH.digit.start, SH.digit.start + sec(0.2), ease.in);
  if (frame >= SH.feels.start + sec(0.2) && frame < SH.effect.start) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translateY(${dy}px)` }}>
      <PriceTag
        x={p.x}
        y={p.y}
        scale={p.scale}
        rot={p.rot}
        flipDeg={flipDeg}
        faceA={faceA}
        faceB={faceB}
        pop={pop}
        fadeCents={fade}
        box={box}
        ninePop={ninePop}
        centsRed={0}
        underline={underline}
        sticker={sticker}
        stickerOut={stickerOut}
        nail={[p.x + 40 * p.scale, p.y - 250 * p.scale]}
      />
    </div>
  );
};
const mixPose = (a: typeof TAG_HOME, b: typeof TAG_HOME, t: number) => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), scale: lerp(a.scale, b.scale, t), rot: lerp(a.rot, b.rot, t) });

// ---------------------------------------------------------------------------------------------
// Two-bar comparison: "FEELS LIKE" $9 vs "YOU PAY" $10 (one number per beat, tabular, count-ups)
// ---------------------------------------------------------------------------------------------
const Bar: React.FC<{ x: number; label: string; steps: number[]; max: number; from: number; dashed?: boolean; exitT: number; popAt: number }> = ({ x, label, steps, max, from, dashed, exitT, popAt }) => {
  const frame = useCurrentFrame();
  const sec = useSec();
  const passed = steps.filter((f) => frame >= f);
  const value = passed.length; // 1 step = $1
  // round 2: the bar height is locked to the DISPLAYED value (each step eases over 0.1 s) — it can
  // never run ahead of its number
  const lastStep = passed[passed.length - 1];
  const partial = value > 0 ? ramp(frame, lastStep, lastStep + sec(0.1), ease.out) : 0;
  const h = value > 0 ? (BARS.maxH * Math.min(max, value - 1 + partial)) / 10 : 0;
  const pop = usePop([popAt]);
  const started = frame >= from;
  const outlineIn = ramp(frame, SH.feels.start, SH.feels.start + sec(0.33), ease.out);
  // round 3: the dashed '?' guide leaves as bar B starts counting (it cut through the numerals)
  const outlineOut = ramp(frame, from, from + sec(0.2), ease.in);
  const drop = exitT * (BARS.maxH + 200);
  return (
    <div style={{ position: 'absolute', left: x, top: FLOOR_Y - BARS.maxH, width: BARS.w, height: BARS.maxH, transform: `translateY(${drop}px)` }}>
      {dashed ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: BARS.maxH * outlineIn,
            opacity: 1 - outlineOut,
            border: `5px dashed rgba(27,27,27,0.28)`,
            borderBottom: 'none',
            borderRadius: '10px 10px 0 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: display,
            fontWeight: 900,
            fontSize: 140,
            color: 'rgba(27,27,27,0.22)',
          }}
        >
          {started ? null : '?'}
        </div>
      ) : null}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: h, background: SIG.ink, borderRadius: '10px 10px 0 0', boxShadow: `0 10px 16px ${SIG.shadow}` }}>
        {h > 90 ? (
          <div style={{ position: 'absolute', top: 22, left: 0, right: 0, textAlign: 'center', fontFamily: body, fontWeight: 800, fontSize: 40, letterSpacing: '0.04em', color: SIG.cream }}>{label}</div>
        ) : null}
      </div>
      {started ? (
        <div
          style={{
            position: 'absolute',
            left: -60,
            right: -60,
            bottom: h + 18,
            textAlign: 'center',
            fontFamily: display,
            fontWeight: 900,
            fontSize: 150,
            lineHeight: 1,
            letterSpacing: '-0.03em',
            color: SIG.red,
            fontVariantNumeric: 'tabular-nums',
            scale: String(pop),
          }}
        >
          ${Math.max(0, value)}
        </div>
      ) : null}
    </div>
  );
};

const BarsLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const sec = useSec();
  if (frame < SH.feels.start || frame >= SH.effect.start + sec(0.3)) return null;
  const exitT = ramp(frame, SH.effect.start, SH.effect.start + sec(0.27), ease.in);
  return (
    <>
      <Bar x={BARS.aX} label="FEELS LIKE" steps={COUNT_A} max={9} from={SH.feels.start} exitT={exitT} popAt={T.nineDollars} />
      <Bar x={BARS.bX} label="YOU PAY" steps={COUNT_B} max={10} from={SH.reveal.start} dashed exitT={exitT} popAt={T.ten} />
    </>
  );
};

// ---------------------------------------------------------------------------------------------
// Source line (wipes in from the left, under the small tag)
// ---------------------------------------------------------------------------------------------
const SourceLine: React.FC = () => {
  const frame = useCurrentFrame();
  const sec = useSec();
  const at = T.leftDigit + sec(0.2);
  if (frame < at || frame >= SH.payoff.start + sec(0.2)) return null;
  const inT = ramp(frame, at, at + sec(0.33), ease.out);
  const outT = ramp(frame, SH.payoff.start, SH.payoff.start + sec(0.2), ease.in);
  return (
    <div
      style={{
        position: 'absolute',
        left: 450,
        width: 560,
        top: 890,
        fontFamily: body,
        fontWeight: 600,
        fontSize: 34,
        lineHeight: 1.3,
        color: 'rgba(27,27,27,0.78)',
        clipPath: `inset(0 ${(1 - inT + outT) * 100}% 0 0)`,
      }}
    >
      <div style={{ fontWeight: 800, color: SIG.ink }}>Thomas &amp; Morwitz (2005)</div>
      <div>Journal of Consumer Research</div>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// Captions: VO chunks, block centred at y ≈ 1180 inside x 70–930 (right rail free)
// ---------------------------------------------------------------------------------------------
const Captions: React.FC = () => {
  const { chunk, words } = useCaptionChunk(vo);
  const pop = usePop(vo.pops ?? []);
  if (!chunk) return null;
  return (
    <div style={{ position: 'absolute', left: 70, width: 860, top: 1080, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', fontFamily: body, fontWeight: 800, fontSize: 68, lineHeight: 1.12, letterSpacing: '-0.01em' }}>
        {words.map((w, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              margin: '0 10px',
              color: w.pop ? SIG.red : w.spoken ? SIG.ink : SIG.mute,
              // money words land when spoken (never spoil the reveal)
              opacity: w.pop && /[$\d]/.test(w.w) && !w.spoken ? 0 : 1,
              scale: w.pop && w.active ? String(pop) : '1',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {w.w}
          </span>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// The person: 3D, registered to page pixels
// ---------------------------------------------------------------------------------------------
const FOV = 20;
const PX_PER_M = CHAR_PX / CHARACTER_HEIGHT;
const useCam = () => {
  const { height } = useVideoConfig();
  const dist = height / PX_PER_M / (2 * Math.tan(((FOV / 2) * Math.PI) / 180));
  return { dist };
};
/** page pixel → world point on the z = 0 plane (camera on the z axis, looking at the page centre) */
const toWorld = (x: number, y: number, w: number, h: number, z = 0): [number, number, number] => [(x - w / 2) / PX_PER_M, (h / 2 - y) / PX_PER_M, z];

type LookKey = { at: number; px: [number, number]; z: number };
const useLook = (keys: LookKey[], w: number, h: number): [number, number, number] => {
  const frame = useCurrentFrame();
  const sec = useSec();
  let i = 0;
  for (let k = 0; k < keys.length; k++) if (keys[k].at <= frame) i = k;
  const cur = toWorld(keys[i].px[0], keys[i].px[1], w, h, keys[i].z);
  if (i === 0) return cur;
  const prev = toWorld(keys[i - 1].px[0], keys[i - 1].px[1], w, h, keys[i - 1].z);
  const t = ramp(frame, keys[i].at, keys[i].at + sec(0.27), ease.inOut);
  return [lerp(prev[0], cur[0], t), lerp(prev[1], cur[1], t), lerp(prev[2], cur[2], t)];
};

const Person: React.FC = () => {
  const { width, height, fps } = useVideoConfig();
  const { dist } = useCam();
  const land = takeLandFrames(fps);
  const tagFace: [number, number] = [TAG_HOME.x + 260, TAG_HOME.y];
  const look = useLook(
    [
      { at: 0, px: tagFace, z: 3 },
      { at: SH.digit.start, px: [TAG_DIGIT.x + 220, TAG_DIGIT.y], z: 3 },
      { at: SH.feels.start, px: [BARS.aX + BARS.w / 2, FLOOR_Y - 420], z: 3 },
      { at: SH.reveal.start, px: [BARS.bX + BARS.w / 2, FLOOR_Y - 460], z: 3 },
      { at: T.ten, px: [HERO_X + 120, FLOOR_Y - 420], z: 30 }, // the take faces the lens
      { at: SH.effect.start, px: [TAG_SMALL.x + 200, TAG_SMALL.y], z: 4 },
      { at: SH.payoff.start, px: tagFace, z: 3 },
    ],
    width,
    height,
  );
  const pose: PoseKey[] = [
    { at: 0, pose: 'idle' },
    { at: T.stop, pose: 'point' },
    { at: SH.feels.start, pose: 'idle' },
    { at: T.ten, pose: 'shocked' },
    { at: SH.effect.start, pose: 'idle' },
  ];
  const mood: MoodKey[] = [
    { at: -1, mood: 'neutral' },
    { at: T.brain - land, mood: 'worried' }, // round 3: hook had 45 f with nothing landing
    { at: T.cheaper - land, mood: 'happy' },
    { at: T.ten - land, mood: 'shocked' },
    { at: T.leftDigit - land, mood: 'worried' },
    { at: T.whole - land, mood: 'neutral' },
  ];
  const feet = toWorld(HERO_X, FLOOR_Y, width, height);
  return (
    <Stage3D theme={PRINT_THEME} transparent toneMapping="none" shadows={false} ground={false}>
      <FixedCamera position={[0, 0, dist]} lookAt={[0, 0, 0]} fov={FOV} />
      <BlockyCharacter pose={pose} mood={mood} lookAt={look} position={feet} rotationY={0.42} palette={SIGNAL_PALETTE} outline={0.04} />
    </Stage3D>
  );
};

/** 2D contact shadow under the feet (shrinks with the shocked hop) */
const ContactShadow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hopT = Math.min(1, Math.max(0, (frame - T.ten) / (0.3 * fps)));
  const hop = Math.sin(hopT * Math.PI);
  const w = 290 * (1 - 0.15 * hop);
  return <div style={{ position: 'absolute', left: HERO_X - w / 2 + 6, top: FLOOR_Y - 20, width: w, height: 40, borderRadius: '50%', background: 'rgba(27,27,27,0.17)', filter: 'blur(5px)' }} />;
};

// ---------------------------------------------------------------------------------------------
// Composition
// ---------------------------------------------------------------------------------------------
export const SignalDemo: React.FC = () => {
  const sec = useSec();
  const hookLines = ['Your brain', 'gets fooled'];
  return (
    <AbsoluteFill style={{ backgroundColor: SIG.cream }}>
      <Page />
      <ContactShadow />
      <TagLayer />
      <BarsLayer />
      <Person />
      {/* frame 0 (and the loop end): the hook headline is already landed */}
      <Headline lines={hookLines} at={-sec(1)} until={SH.digit.start} />
      <Headline lines={['The left-digit', 'effect']} at={T.leftDigit - sec(0.33)} until={SH.payoff.start} size={100} />
      <Headline
        lines={[
          'Read the',
          <>
            whole <span style={{ color: SIG.red }}>price.</span>
          </>,
        ]}
        at={SH.payoff.start + sec(0.2)}
        until={END_THUMP - sec(0.53)}
      />
      <Headline lines={hookLines} at={END_THUMP - sec(0.33)} />
      <SourceLine />
      <Captions />
      {/* sound: bed at the reel BPM ducked under the VO words, then every shot's cues */}
      {/* mix (measured on the render): catalog SFX peak at −3 dBFS, so +3 dB cues clipped on top of the
          bed → master −6 dB on the SFX; the bed file is −13 LUFS and ducks −4 dB (there is no VO audio
          in this demo — the duck keeps the pocket where the VO goes) */}
      <MusicBed src={`music/signal-bed-${BED_BPM}.wav`} bpm={BED_BPM} volume={BED_VOLUME} duckFrames={vo.words ?? []} duckDb={-4} />
      <SfxTrack shotList={shotList} gain={SFX_MASTER_DB} />
    </AbsoluteFill>
  );
};
