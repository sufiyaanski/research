# QrosityDemo — Q-ROSITY: "What if every screen on Earth went black for 10 seconds?"

15 s, 1080×1920 @ 30 fps. Drama, escalating me → street → city → world → nothing → back to scrolling
(loop). Registered in `src/Root.tsx` as `QrosityDemo`; output `out/QrosityDemo.mp4`.

| file | what |
|---|---|
| `QrosityDemo.tsx` | one `<Stage3D>` for the reel, one `<Sequence layout="none">` per shot (set + lights + camera + Q), 2D title/countdown/captions on top |
| `words.json` | VO word timings (s), hand-timed — no TTS here |
| `beats.json` | `node beat-grid/make-beats.mjs --vo examples/qrosity-demo/words.json --duration 15 --chars 20 --pause 0.5 --pop-regex '\d\|black\|dark' --out examples/qrosity-demo/beats.json` |
| `shotlist.yaml` → `shotlist.json` | `node beat-grid/make-beats.mjs --from-shotlist examples/qrosity-demo/shotlist.yaml --out examples/qrosity-demo/shotlist.json --max-drift 1` (drift 0) |
| `style-guide.md`, `brief.md`, `review_log.md` | look, director's brief, critique log |

## Sets (all code, `<boxGeometry>` + instancing, seeded `lcg()` layouts)

- **Bedroom** — walls, bed, desk + monitor (a screen), window with moon and a lit city outside, poster, shelf, rug. Lit by the phone + monitor (die), the moon (rim), a cool fill.
- **Street** — ~20 buildings, ~500 windows in ONE instanced mesh (68 % TV-blue screens die in a wave rolling toward Q; warm windows stay), billboards, lamps (stay), parked cars, lane dashes; ATM with a lit "$" sign for the "no money" shot.
- **Rooftop + skyline** — roof, parapets, AC unit, water tank, blinking aviation light; 46 towers, ~1,500 instanced windows + billboards dying left → right; the city's glow on Q's face dies with it.
- **World** — faceted icosphere Earth, ~200 land blocks, instanced city lights sweeping out by longitude, 3 planes circling over Q that go dark and tip, static stars.

## Timing

The countdown lands "10" on the `pop` cue in `blackout` (the spoken "10"), steps on every `tick`
cue (1 s apart) and ends on the `click` in `loop` — exactly 300 frames later; the screens come back on
that click. Everything else is `onset('<word>')` or a shot boundary.

## Build / render

```bash
cd toolkit
node sfx/music-bed.mjs --bpm 100 --duration 16.8 --key E --seed 5 --lufs -13 --out public/music/qrosity-bed-100.wav  # git-ignored
REMOTION_IGNORE_CERT_ERRORS=1 node critique/critique.mjs QrosityDemo --shotlist examples/qrosity-demo/shotlist.json --fast --gl swangle
REMOTION_IGNORE_CERT_ERRORS=1 npx remotion render QrosityDemo out/QrosityDemo.mp4 --gl=swangle --concurrency=4
```

## Decisions

- Shadow maps off (swangle/CPU): contact blobs under Q's feet instead.
- Window grids/city lights are `THREE.InstancedMesh` built once in `useMemo`; per-instance colours are rewritten from the frame in `useLayoutEffect` (frame-derived, deterministic).
- Framing rule for every shot: `target.y ≥ 3.1 − 0.142·dist` keeps Q's head under the title/countdown; the face must also sit above the caption block (learned in round 1).
