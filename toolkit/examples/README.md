# examples

Reserved for the two example compositions (The Signal + Q-ROSITY). Each one goes in its own folder
and gets registered in `src/Root.tsx` between `{/* EXAMPLES:BEGIN */}` and `{/* EXAMPLES:END */}`.

Suggested layout per example (the same files `src/smoke/` uses):

```
examples/<name>/
  shotlist.yaml            # authoring (states on the beat grid; sfx at = relative to the shot start)
  shotlist.json            # node beat-grid/make-beats.mjs --from-shotlist shotlist.yaml --out shotlist.json
  beats.bpm.json           # node beat-grid/make-beats.mjs --bpm 120 --duration 15 --out ...
  words.json / beats.vo.json   # VO word timings → node beat-grid/make-beats.mjs --vo words.json --out beats.vo.json
  <Name>.tsx               # useShot / useBeatGrid / useCaptionChunk / usePop + <SfxTrack> + <MusicBed>
```

Then: `node critique/critique.mjs <Comp> --shotlist examples/<name>/shotlist.json --fast` and
`npx remotion render <Comp> out/<Comp>.mp4` (add `--gl=swangle` for three.js scenes on a box with no GPU).

## What's here

| folder | composition | what |
|---|---|---|
| `signal-demo/` | `SignalDemo` | The Signal, 15 s: "$9.99 isn't $10" — the left-digit effect (2D print page + 3D person on a transparent canvas) |
| `qrosity-demo/` | `QrosityDemo` | Q-ROSITY, 15 s: "What if every screen on Earth went black for 10 seconds?" (four code-built 3D sets) |
| `whatif-countdown/` | `WhatIfDemo` | reusable "What if X for N seconds?" countdown format (config-driven; HUD clock, slowed time, x-ray / hands / glow / space / point-cloud looks), 45 s demo: "What if Earth stopped spinning for 5 seconds?" |
| `character/` | — | the shared blocky person + Stage3D kit (copied from `setup/`, adapted to 30 fps / no overshoot / recolourable) |

Each demo folder has `words.json → beats.json`, `shotlist.yaml → shotlist.json`, `style-guide.md`,
`brief.md`, `review_log.md` and a `README.md` with the exact commands. Music beds are git-ignored:
regenerate them with the `node sfx/music-bed.mjs …` line in each README.
