# Critique — QrosityDemo — round 3 of 3

- shot list: `examples/qrosity-demo/shotlist.json` (8 shots, 450 frames @ 30 fps)
- stills: middle frame of each shot, `floor((start+end)/2)`, scale 0.5 — `critique/rounds/stills/QrosityDemo-r3/`
- contact sheet: ![QrosityDemo round 3](QrosityDemo-round-3-sheet.jpg)
- generated: 2026-11-02 by `node critique/critique.mjs QrosityDemo --shotlist examples/qrosity-demo/shotlist.json --round 3 --fast --gl swangle`
- previous round: 2 — locked (all ≥ 8, don't touch): dark, loop; fixed this round: alone, blackout, hook

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
| 1 | hook | 0–73 | [36](stills/QrosityDemo-r3/hook-f0036.png) (1.20s) | What if every screen | push-in on Q in his bedroom, face lit only by his phone and the monitor; WHAT IF title over the scene → **Q mid-scroll, phone + monitor glowing, WHAT IF title on screen** | 8 | 8 | 8 | 8 | 8 | 40 | push-in no longer drifts onto the poster; title clear |
| 2 | blackout | 73–130 | [101](stills/QrosityDemo-r3/blackout-f0101.png) (3.37s) | For 10 seconds | on "black?" every screen dies — room drops to moonlight, 7-frame shake, Q's shocked take; "10" countdown lands on "10" → **dark bedroom lit by the window only, Q shocked, countdown 9** | 8 | 7 | 8 | 8 | 8 | 39 | wider: arms in frame, face readable; poster still sits left of the countdown |
| 3 | street | 130–178 | [154](stills/QrosityDemo-r3/street-f0154.png) (5.13s) | Your street goes dark | Q in the middle of his street; billboards and TV-lit windows die in a wave rolling from the far end toward him → **street dark except the warm lamps, Q worried, countdown 8** | 8 | 8 | 7 | 8 | 8 | 39 | unchanged — Q only idles |
| 4 | city | 178–224 | [201](stills/QrosityDemo-r3/city-f0201.png) (6.70s) | Then the entire city | low angle on Q on a rooftop; the skyline's screens and billboards go dark left to right behind him → **skyline black, Q pointing at it, countdown 6** | 8 | 7 | 8 | 8 | 8 | 39 | unchanged — lower third is dark roof |
| 5 | world | 224–276 | [250](stills/QrosityDemo-r3/world-f0250.png) (8.33s) | Every plane in the sky | orbit around a blocky night-side Earth with Q standing on top; city lights and planes' lights go out in a sweep → **dark globe, planes drifting dark, Q tiny on top, countdown 5** | 8 | 7 | 8 | 8 | 8 | 39 | unchanged — globe dark-heavy |
| 6 | dark 🔒 | 276–352 | [314](stills/QrosityDemo-r3/dark-f0314.png) (10.47s) | No maps, no money | back on the dark street, low angle — Q jabs a dead ATM screen; nothing answers → **Q pointing at a black ATM screen, countdown 2** | 8 | 8 | 8 | 8 | 8 | 40 | |
| 7 | alone | 352–397 | [374](stills/QrosityDemo-r3/alone-f0374.png) (12.47s) | Just you, in the dark | bust of Q alone in the dark bedroom, moon rim only; the countdown hits 1 → **Q worried in the dark, countdown 1** | 8 | 7 | 7 | 7 | 8 | 37 | poster off the countdown, but the caption plate still crosses his chin (target.y needs ~2.1) |
| 8 | loop 🔒 | 397–450 | [423](stills/QrosityDemo-r3/loop-f0423.png) (14.10s) | And you keep scrolling | screens snap back on (click) — light floods Q's face, he goes straight back to scrolling; camera glides to the frame-0 shot, WHAT IF lands (thump) → **identical to frame 0 — Q scrolling, phone lit, WHAT IF title (loop seam)** | 8 | 8 | 8 | 8 | 8 | 40 | |
<!-- SCORES:END -->

## Rule

Fix the 3 worst shots (lowest total; ties → lowest sync). Lock everything that scored ≥ 8 (don't touch it). Re-render. Repeat until every shot is ≥ 8 in every column. Max 3 rounds; after round 3 ship the best round and log what's still under 8.

Then run `node critique/score.mjs critique/rounds/QrosityDemo-round-3.md` — it totals the table, names the 3 worst shots and says whether to stop.

## Fix log (fill in after scoring)

- (round 3 is the last round: no further fixes; see examples/qrosity-demo/review_log.md)

<!-- VERDICT:BEGIN -->
## Verdict (score.mjs)

- worst 3: alone (37), blackout (39), street (39)
- locked: hook, dark, loop
- under 8: blackout.composition=7, street.motion=7, city.composition=7, world.composition=7, alone.composition=7, alone.motion=7, alone.type=7
- **MAX ROUNDS — round 3 of 3 still has 7 cell(s) under 8. No round 4: ship round 3 (fewest sub-8 cells: 7, mean total 39.1) and log what's still under 8.**
<!-- VERDICT:END -->
