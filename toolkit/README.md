# motion-toolkit

A reusable Remotion toolkit (Remotion **4.0.540**) for **The Signal** and **Q-ROSITY** vertical reels:
**1080×1920, 30 fps**, h264 CRF 18. It covers the method from reference to shipped cut:

1. harness rules → 2. reference frames → 3. `style-guide.md` → 4. shot list as **states on a beat grid**
(BPM or VO word timings) → 5. build → 6. **sound made in code on the same timeline** (music bed +
synthesised SFX) → 7. **self-critique loop** (middle frame per shot, score 1–10 on story / composition /
motion / type / sync, fix the 3 worst, ≤ 3 rounds).

| folder | what |
|---|---|
| `scripts/style-guide-from-reference/` | reference mp4 → contact sheet + measured palette, shot lengths and loudness → `style-guide.md` |
| `beat-grid/` | shot-list schema (zod, YAML/JSON), `make-beats.mjs` (BPM / VO / snap), hooks `useBeatGrid`, `useCaptionChunk`, `usePop`, `useShot` |
| `sfx/` | `synth.mjs` (8 code-synthesised SFX), `music-bed.mjs` (loopable placeholder bed), `cues.tsx` (`<SfxCue>`, `<SfxTrack>`, `<MusicBed>`) |
| `critique/` | `critique.mjs` (middle-frame stills + labelled contact sheet + scoring template), `score.mjs` (totals, 3 worst, stop rule) |
| `src/` | `index.ts`, `Root.tsx` (the examples get registered here), `smoke/ToolkitSmoke.tsx`, a 4 s composition that uses every piece |
| `examples/` | reserved for the two example compositions |
| `public/sfx/` | generated WAVs + `catalog.json` (committed) · `public/music/` beds (git-ignored, `npm run audio`) |
| `out/` | renders (only `out/*.mp4` is tracked) |

## Install

Node ≥ 22.18 is required: the Node CLIs import the shared `.ts` modules with Node's built-in type
stripping. You also need ffmpeg/ffprobe on PATH.

```bash
cd toolkit
npm install
npm run audio          # SFX + public/music/bed-120.wav (15 s)
npx tsc --noEmit
```

## Commands

```bash
npm run studio                                                   # Remotion Studio
node scripts/style-guide-from-reference/index.mjs ref.mp4 --out out/style-guide/ref
node beat-grid/make-beats.mjs --bpm 120 --duration 15 --out beats.json
node beat-grid/make-beats.mjs --vo words.json --out vo-beats.json
node beat-grid/make-beats.mjs --from-shotlist shots.yaml --out shots.json
node sfx/synth.mjs && node sfx/music-bed.mjs --bpm 120 --duration 15
REMOTION_IGNORE_CERT_ERRORS=1 node critique/critique.mjs ToolkitSmoke --shotlist src/smoke/smoke.shotlist.json [--fast]
node critique/score.mjs critique/rounds/ToolkitSmoke-round-1.md
REMOTION_IGNORE_CERT_ERRORS=1 npx remotion render ToolkitSmoke out/ToolkitSmoke.mp4
```

Environment:

- `REMOTION_IGNORE_CERT_ERRORS=1`: set this behind a proxy with a private CA. Without it, Google Fonts fail in headless Chrome.
- `REMOTION_GL=swangle` (CLI) or `--gl swangle` (critique): needed for three.js on a machine with no GPU. The default is `angle`.

## Conventions

- **Frames everywhere.** Shot `start`/`end`, beats, caption chunks and cue `at` are global composition frames.
  Inside `<Sequence from={X}>`, pass `{ sequenceFrom: X }` to the hooks.
- Shot `sfx[].at` is **relative to the shot start** and marks where the sound's **peak** lands.
- Compositions import **JSON**. Author in YAML, then run `make-beats --from-shotlist x.yaml --out x.json`.
- Audio uses `<Audio>` from `@remotion/media` with `staticFile()` (the 4.0.540 skill rules).
- zod is pinned to 4.6.7, the version Remotion 4.0.540 requires (`npx remotion versions` is clean).
