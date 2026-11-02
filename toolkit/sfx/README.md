# sfx — sound made in code, on the picture's timeline

No samples, no downloads, no licences to track: every sound is synthesised by `synth.mjs`
(pure Node, seeded, deterministic) into `public/sfx/*.wav` (16-bit 48 kHz mono, peak −3 dBFS) and
described in `public/sfx/catalog.json` (`{id, file, durationSec, peakSec, category, use, license}`;
`peakSec` = centre of the loudest 10 ms, so a cue can land the **peak** on a frame).

```bash
node sfx/synth.mjs                                   # all 12 sounds + catalog.json, prints RMS / LUFS / true peak
node sfx/synth.mjs --seed 7 --only pop,tick          # variants (catalog not rewritten with --only)
node sfx/music-bed.mjs --bpm 120 --duration 15       # public/music/bed-120.wav, −18 LUFS, loopable, stereo
node sfx/music-bed.mjs --bpm 96 --duration 20 --key A --seed 3 --lufs -20 --out public/music/bed-96-a.wav
node sfx/drone-bed.mjs --config examples/whatif-countdown/whatif.config.ts   # what-if format score, follows the episode's acts
```

Music beds are git-ignored (deterministic, ~2.9 MB per 15 s): `npm run audio` regenerates the
SFX and the 120 BPM bed. Use whole bars for a musically seamless loop (120 BPM → 16 s).

| id | sound | dur | peak | use it for |
|---|---|---|---|---|
| `click` | 6 ms noise transient + 1.85 kHz body | 0.03 s | 5 ms | button press, toggle, tap |
| `whoosh` | band-passed noise sweep, peak at 60 % | 0.45 s | 0.27 s | morph / cut / camera move — peak ON the cut |
| `thump` | sub sine 55→40 Hz + click | 0.35 s | 18 ms | logo / object landing, price-tag slam |
| `pop` | sine blip 1.08 kHz→260 Hz | 0.08 s | 6 ms | number or word pop (pair with `usePop`) |
| `tick` | 3 ms 5.2 kHz click | 0.012 s | 5 ms | counter steps (one per change) |
| `cash-register` | "ka" latch clicks + 2.6/3.3 kHz bell partials + inharmonics | 0.9 s | 0.14 s | money reveal (price, saving, total) |
| `riser` | rising saw 110→880 Hz + noise, ends at its peak | 1.8 s | 1.69 s | tension INTO the reveal — cue `at` = reveal frame |
| `impact` | thump + noise burst + dark tail | 0.8 s | 39 ms | the payoff / punchline |
| `power-down` | 4 sine partials gliding −2 octaves over 1.2 s | 1.6 s | 11 ms | the world switches mode (what-if format) — cue `at` = switch frame |
| `twinkle` | 9 high sine grains (pentatonic 1.6–5 kHz) over ~1.1 s | 1.3 s | 6 ms | stars / glass / sparkles appearing |
| `noise-wall` | band-opening noise swell, ends at its peak | 2.0 s | 1.98 s | INTO a white-out / explosion — cue `at` = hit frame |
| `glitch` | granular stutter (soft-clipped sine / noise grains, repeats) | 0.75 s | 0.50 s | digital rebuild, point cloud, time skip |

Measured (ffmpeg ebur128, clip padded to 1 s): whoosh −17.9, pop −21.9, click −32.9, thump −23.5,
riser −16.9, impact −25.8, cash-register −14.5, tick −31.5, power-down −13.5, twinkle −14.7,
noise-wall −16.9, glitch −13.4 LUFS; true peaks −2.6…−3.0 dBFS.

`drone-bed.mjs --config <episode.ts>` writes one through-composed stereo score as long as the reel
(park ambience → sine pads → twinkles → rising glide → ring → space pad + riser → glitch texture +
swell → silence), sectioned by the episode's `acts[].look`; see `examples/whatif-countdown/README.md` §5.

## In a composition (`cues.tsx`)

```tsx
import { SfxCue, SfxTrack, MusicBed, SFX_IDS, sfxPeakFrames, cuesFromShotList } from '../../sfx/cues';

<MusicBed bpm={120} volume={0.9} duckFrames={vo.words} />   // ducks −8 dB under VO words (4 f attack, 10 f release)
<SfxTrack shotList={shotList} />                            // every shot.sfx[]: peak at shot.start + at
<SfxCue id="cash-register" at={61} gain={-2} />             // one cue, GLOBAL frame of the peak
```

- `<SfxCue id at gain?>` → `<Sequence from={at − round(peakSec·fps)} layout="none">` + `<Audio>` from
  `@remotion/media` with `staticFile(file)`; if that would start before frame 0 the head is trimmed
  (`trimBefore`) so the peak still lands on `at`. `gain` is dB (≤ +3). Accuracy ±½ frame.
- `<SfxTrack shotList? cues? gain?>` — `cues` are extra `{id, at (global), gain?}`; `gain` is a master dB offset.
- `<MusicBed bpm? src? volume? duckFrames? duckDb=-8 attack=4 release=10 mergeGap=8 fadeIn=8 fadeOut=20 loop=true>` —
  `src` is relative to `public/` (default `music/bed-<bpm>.wav`); `duckFrames` = `{start,end}[]` or `[start,end][]`
  in frames; ranges closer than `mergeGap` merge so the bed doesn't pump between words. Uses
  `loopVolumeCurveBehavior="extend"` so ducking stays on the global timeline across loops.
- Put these at composition level — `at` and `duckFrames` are global frames.

Example: `src/smoke/ToolkitSmoke.tsx` (the counter steps are read from the same tick cues the track plays).
