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
