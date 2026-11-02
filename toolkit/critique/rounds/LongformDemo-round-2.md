# Critique — LongformDemo — round 2 of 3

- shot list: `longform/demo/shotlist.json` (8 shots, 2089 frames @ 30 fps)
- stills: middle frame of each shot, `floor((start+end)/2)`, scale 0.5 — `critique/rounds/stills/LongformDemo-r2/`
- contact sheet: ![LongformDemo round 2](LongformDemo-round-2-sheet.jpg)
- generated: 2026-11-02 by `node critique/critique.mjs LongformDemo --shotlist longform/demo/shotlist.json --round 2 --fast --gl swangle`
- previous round: 1 — locked (all ≥ 8, don't touch): c01s02; fixed this round: c01s05, c00s01, c00s02

## How to score

Open each still (and the contact sheet) at phone size. Score 1–10 per column; a column is ≥ 8 only if you would ship it.

- **story** — does this frame advance the beat/state in the shot list (the bold end-state)? one idea per frame?
- **composition** — hierarchy, safe zones (top 220 / bottom 340 / right rail 160 px at 1080×1920), balance, negative space.
- **motion** — is the move readable mid-shot, eased, motivated; nothing static that should move or vice-versa.
- **type** — size ≥ 4.5 % of frame height for captions, contrast, 3–5 word chunks, ≤ 2 lines, accent colour only on money words.
- **sync** — does the picture event land on the beat / VO word / sfx peak (± 1 frame)?

<!-- SCORES:BEGIN -->
| # | shot | frames | mid frame | caption | action → end state | story | composition | motion | type | sync | total | notes |
|---|------|--------|-----------|---------|--------------------|---|---|---|---|---|-------|-------|
| 1 | c00s01 | 0–233 | [116](stills/LongformDemo-r2/c00s01-f0116.png) (3.87s) | Tonight, at exactly nine o'clock, | whatif/shore | 7 | 7 | 8 | 6 | 9 | 37 | clock = 21:00:00 on "disappears" ✓, face lit ✓; BUT frames 0–90 (incl. frame 0, the hook): the Moon sits behind "vanished tonight?" (checked f60) |
| 2 | c00s02 | 233–449 | [341](stills/LongformDemo-r2/c00s02-f0341.png) (11.37s) | The sky gets darker, sure. | narrator/street | 8 | 7 | 7 | 8 | 8 | 38 | pulled back: whole upper body + sky read; still cropped at the waist |
| 3 | c00s03 | 449–749 | [599](stills/LongformDemo-r2/c00s03-f0599.png) (19.97s) | So let's follow it, step | timeline | 8 | 6 | 8 | 7 | 8 | 37 | unchanged: first stop label outside the x≥120 safe area; right half empty until stop 3 |
| 4 | c01s01 | 749–908 | [828](stills/LongformDemo-r2/c01s01-f0828.png) (27.60s) | A few hours after the | title | 7 | 8 | 7 | 9 | 8 | 39 | unchanged |
| 5 | c01s02 🔒 | 908–1257 | [1082](stills/LongformDemo-r2/c01s02-f1082.png) (36.07s) | Tides are mostly the Moon's | diagram | 9 | 8 | 8 | 8 | 8 | 41 | |
| 6 | c01s03 | 1257–1428 | [1342](stills/LongformDemo-r2/c01s03-f1342.png) (44.73s) | The Sun pulls on the | bigNumber | 7 | 7 | 8 | 8 | 8 | 38 | unchanged |
| 7 | c01s04 | 1428–1601 | [1514](stills/LongformDemo-r2/c01s04-f1514.png) (50.47s) | Take the Moon away, and | compareBars | 8 | 7 | 8 | 8 | 8 | 39 | unchanged |
| 8 | c01s05 | 1601–2089 | [1845](stills/LongformDemo-r2/c01s05-f1845.png) (61.50s) | And there's a second change | narrator/shore → **re-hook** | 7 | 7 | 8 | 8 | 8 | 38 | now 3 cuts (wide → gauge → close) on words ✓; the gauge drop is real but only 1 mark of change — too subtle to read |
<!-- SCORES:END -->

## Rule

Fix the 3 worst shots (lowest total; ties → lowest sync). Lock everything that scored ≥ 8 (don't touch it). Re-render. Repeat until every shot is ≥ 8 in every column. Max 3 rounds; after round 3 ship the best round and log what's still under 8.

Then run `node critique/score.mjs critique/rounds/LongformDemo-round-2.md` — it totals the table, names the 3 worst shots and says whether to stop.

## Fix log (fill in after scoring)

- c00s03 — first label outside the safe area, half-empty frame → x0 330 (labels start at x 170), dashed "track ahead" across the full span from frame 2.
- c00s01 — Moon behind the premise text in the hook frames → Moon moved into the clear sky between title and character (world [55, 34, −160]); checked f10/f60/f85.
- c00s02 — waist-cropped low angle, one move → `shots`: low, then push on "But" (full figure, he points on "beach").

<!-- VERDICT:BEGIN -->
## Verdict (score.mjs)

- worst 3: c00s03 (37), c00s01 (37), c00s02 (38)
- locked: c01s02
- under 8: c00s01.story=7, c00s01.composition=7, c00s01.type=6, c00s02.composition=7, c00s02.motion=7, c00s03.composition=6, c00s03.type=7, c01s01.story=7, c01s01.motion=7, c01s03.story=7, c01s03.composition=7, c01s04.composition=7, c01s05.story=7, c01s05.composition=7
- **CONTINUE — fix c00s03, c00s01, c00s02; keep locked shots untouched; re-render; then: node critique/critique.mjs LongformDemo --shotlist <file> --round 3**
<!-- VERDICT:END -->
