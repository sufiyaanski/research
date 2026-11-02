# SignalDemo — The Signal: "$9.99 isn't $10"

15 s, 1080×1920 @ 30 fps. The left-digit effect told with one price tag, one person, two bars and a
study line. Registered in `src/Root.tsx` as `SignalDemo`; output `out/SignalDemo.mp4`.

| file | what |
|---|---|
| `SignalDemo.tsx` | the composition (2D page + one transparent full-frame `<ThreeCanvas>` for the person) |
| `words.json` | VO word timings (s), hand-timed — no TTS in this environment (see the `note` field) |
| `beats.json` | `node beat-grid/make-beats.mjs --vo examples/signal-demo/words.json --duration 15 --chars 18 --pause 0.5 --pop-regex '\$\|%\|cent\|price\|cheap\|\d' --out examples/signal-demo/beats.json` |
| `shotlist.yaml` → `shotlist.json` | shots as states on the VO grid + every SFX cue · `node beat-grid/make-beats.mjs --from-shotlist examples/signal-demo/shotlist.yaml --out examples/signal-demo/shotlist.json --max-drift 1` (drift 0 on every shot) |
| `style-guide.md`, `brief.md` | the channel look made concrete; the director's brief (HARNESS §1.2) |
| `review_log.md` | critique rounds, fixes, final scores |

The person is `../character/` (shared with QrosityDemo), recoloured with `SIGNAL_PALETTE`.

## Build / render

```bash
cd toolkit
node sfx/music-bed.mjs --bpm 120 --duration 16 --lufs -13 --out public/music/signal-bed-120.wav   # git-ignored bed
REMOTION_IGNORE_CERT_ERRORS=1 node critique/critique.mjs SignalDemo --shotlist examples/signal-demo/shotlist.json --fast --gl swangle
REMOTION_IGNORE_CERT_ERRORS=1 npx remotion render SignalDemo out/SignalDemo.mp4 --gl=swangle --concurrency=4
```

## How it is timed (no typed frame numbers)

- `onset('<word>', nth)` looks a word up in `beats.json`; shots come from `shotlist.json`.
- The counters step on the shot list's own `tick` cues (+ the landing `pop` / `cash-register`), the
  same cues `<SfxTrack>` plays — picture and sound cannot drift.
- Mood takes are keyed `word − takeLandFrames(fps)` so the new face lands on the word.
- Durations are seconds × fps (`sec(0.33)`).

## Decisions

- **3D layering:** one full-frame transparent `<ThreeCanvas>` over the 2D page with a fixed 20°
  camera registered to page pixels (`toWorld()`), not a small canvas region — a region clipped the
  shocked pose's arms, and full-frame rendered at ~0.1 s/frame on swangle because the character
  covers few pixels. Shadow maps off; a 2D contact-shadow ellipse sits under the feet.
- **No VO audio:** captions + timing come from hand-timed words; the bed still ducks under the word
  ranges so a real VO drops straight in (add `<Audio src={staticFile('vo/...')}/>`).
- **Money words in captions** (with a `$`/digit) stay invisible until spoken so "$10" never spoils the reveal.
