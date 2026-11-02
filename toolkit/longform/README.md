# longform — 10–15 min YouTube videos (1920×1080 @ 30)

A data-driven pipeline: you (Claude) write **chapters as JSON** (scenes = a template + VO lines +
props); the free voice is generated; the planner turns word timings into **frames**; each chapter is
rendered separately (resumable) and stitched with ffmpeg; voice + ducked music + SFX are mixed to
**−14 LUFS / ≤ −1 dBTP**; thumbnail, YouTube chapters, captions and description come out at the end.
Example episode: [`demo/`](demo/) → `out/LongformDemo.mp4` + `out/LongformDemo-thumb.png`.

```bash
cd toolkit
REMOTION_IGNORE_CERT_ERRORS=1 node longform/render-chapters.mjs longform/demo --name LongformDemo --gl swangle --concurrency 4
#   --only plan | voice | render | mix | thumb | desc     one step
#   --chapters c03                                        re-render one chapter (others are reused)
#   --force                                               ignore the per-chapter hash
#   --engine kokoro|piper|elevenlabs|mock                 override episode.json voice engine
```
Real episodes live in `studio/episodes/<id>/` (same layout as `demo/`): `node longform/render-chapters.mjs ../studio/episodes/<id> --name <Comp> …`.

## Episode folder
| file | who | what |
|---|---|---|
| `episode.json` | you | `id, title, outName, fps/width/height, voice {engine, voice, speed, tail}, music {bpm, bars, seed, key, db}, hook, summary, hashtags, thumbnail {text, number, set, mood, ghostMoon}`; `"excerpt": true` silences the full-length structure warnings |
| `script.md` | you | the human-readable script (approved at Gate 2); chapters → `### scene [template · notes]` → VO lines |
| `chapters/NN-<slug>.json` | you | `{ id, kind: cold-open\|promise\|chapter\|payoff\|end-screen, title, label?, seconds? (silent end screen), scenes: [{ id, template, vo: [string \| {text, tts?, pauseBefore?}], props, sfx?: [{id, on\|at, gain?}], rehook?, noDefaultSfx? }] }` |
| `facts.md` | you | claims + URLs + quotes → the description's Sources |
| `vo-lines.json` | plan | every VO line with its id (`<scene>-l<k>`) and the pause before it (line 0.2 s · scene 0.35 s · chapter 0.8 s) |
| `words.json`, `captions.srt` | voice | from `voice/tts.py` (Kokoro + faster-whisper by default) |
| `timeline.json` | frames | every chapter / scene / word / SFX cue in frames — the compositions' only input |
| `shotlist.json` | frames | one shot per scene, for `critique/critique.mjs` (1920×1080) |
| `chapters.txt`, `description.md` | desc | YouTube timestamps (first 0:00, ≥ 3 chapters, each ≥ 10 s) + summary, chapters, sources, credits |

Build products go to `out/longform/<id>/` (voice, props, `chapters/<id>.mp4` + `.hash`, mix, `report.json` with render seconds and loudness).

## Timing model (no typed frame numbers)
- A scene starts **0.12 s before its first word** (cut on the voice) and ends where the next scene starts; a chapter = its scenes; the last chapter ends at the voice's end (+ tail). A silent `end-screen` chapter lasts `seconds` (default 20).
- Every reveal is cued by a **word of that scene's VO**: props named `on`, `…On` or `…Until` (any depth). The planner warns when a cue word isn't in the scene; templates fall back to a default frame.
- The planner also warns: cold open > 30 s · chapter outside 90–150 s · > 90 s without a re-hook (chapter start or `"rehook": true` scene) · a scene > 22 s · > 1 SFX per 2 s · no end screen.

## Templates (`templates/paper.tsx`, `templates/night.tsx`)
Two grounds alternate: **NIGHT** 3D sets (Q-ROSITY look) and **PAPER** 2D field-notebook explainers (cream #F3EBDD, ink, one highlighter #FFD23F accent per shot). The blocky character is on every scene (talking — lip flap from word timings — on paper scenes he stands on the floor line at the right).

| template | props | default SFX |
|---|---|---|
| `whatif` | `set` (shore\|street), `premise`, `goneOn` (the world changes + 6-frame shake), `clock {at: "21:00:00", on}` (reads `at` exactly on the word), `clockLabel`, `titleUntil`, `character[]` | thump (title), riser → impact on `goneOn` |
| `narrator` | `set`, `moon` / `tide` (number or `{from, to, on, dur}`), `camera` (push\|close\|wide\|low\|orbit\|gauge) **or** `shots: [{camera}, {camera, on}]` (hard cuts on words), `charX`, `pose`, `mood`, `lookUp`, `character: [{pose?, mood?, on}]`, `headline`, `headlineOn`, `talking` | — |
| `title` | `title`, `label` (default "Chapter one"…) | whoosh |
| `bigNumber` | `value`, `prefix`, `suffix`, `decimals`, `landOn` (count-up 1.4 s lands ON this word), `countSec`, `kicker`, `label`, `note`, `noteOn`, `source` | pop on land |
| `compareBars` | `title`, `unit`, `bars: [{label, value, on, display?, focus?}]`, `max`, `source`, `focusMood` | pop per bar |
| `diagram` | `kind: orbit` (`moonOn`, `pullOn`, `bulgesOn`, `spinOn`, labels) · `kind: pins` (`pins: [{x, y, label, on}]` on an abstract dotted map — **placeholder**: swap for a real map with the remotion-maps skill) · `kind: flow` (`nodes: [{label, on}]`); `title`, `source`, `cues` | whoosh (orbit) / click per node |
| `timeline` | `title`, `stops: [{label, sub?, on}]` (line draws to each stop; newest highlighted) | click per stop |
| `quote` | `text` (≤ 18 words), `highlight: [words]` (highlighted when spoken), `by`, `source` | — |
| `endscreen` | `line`, `next` (two clear slots for YouTube end-screen elements) | thump |

Adding a template: write it in `templates/`, add it to `TEMPLATES` in `Longform.tsx` and `TemplateId` in `types.ts`, default SFX in `plan.mjs`, document its props here.

## Compositions (registered via `studio.tsx` in the `src/Root.tsx` STUDIO block)
- `LongformChapter` — one chapter from `--props={"chapter": …}` (what `render-chapters.mjs` renders).
- `LongformDemo` — the demo excerpt as one timeline (Studio + critique).
- `LongformPreview` — whichever episode was planned last (`render-chapters` writes `preview/timeline.json`): critique any episode with `node critique/critique.mjs LongformPreview --shotlist <episode>/shotlist.json --fast --gl swangle`.
- `LongformThumb` — 1280×720 still: character + 3–5 words + one number/object (`episode.json` → `thumbnail`).

## Audio
Chapters carry only the SFX (−6 dB master). `render-chapters` mixes: voice (−16 LUFS file) + music bed (`sfx/music-bed.mjs`, generated once per bpm/seed/key, looped, `music.db` gain, **sidechain-ducked under the voice**) + SFX → two-pass `loudnorm` I=−14, TP=−1.5 → AAC 192k. Re-voicing never needs a picture re-render unless the timing changed.

## Render cost (measured 2026-11-02 on the demo: 4 CPU cores, no GPU, `--gl=swangle`, `--concurrency 4`)
| step | work | wall time |
|---|---|---|
| voice (Kokoro + whisper, 12 lines, 64 s of speech) | first run / cached re-run | 38 s / 4 s |
| render c00 (cold open, 749 frames, 60 % NIGHT 3D) | uncontended | 200 s = **0.27 s/frame** |
| render c01 (chapter, 1,340 frames, 64 % PAPER) | sharing the CPU with another render | 336 s = **0.25 s/frame** |
| concat + mix + loudnorm + mux, thumbnail, description | — | < 30 s, thumbnail ≈ 10–16 s |
| **total for 69.6 s of video** | | **≈ 9.5 min** |

A 12-minute episode = 21,600 frames ≈ **1.5–1.7 h** of rendering at these rates, plus critique stills (~1.5 s each) and one or two chapter re-renders → plan **2–2.5 h** of unattended machine time per episode (a desktop GPU with `--gl=angle` is several times faster). Re-runs only re-render chapters whose props or template code changed.
