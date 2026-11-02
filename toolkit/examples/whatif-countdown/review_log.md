# Review log — WhatIfDemo ("What if Earth stopped spinning for 5 seconds?")

Critique files: `critique/rounds/WhatIfDemo-round-{1,2,3}.md` + `-sheet.jpg`. One shot per act (11).
Command each round: `REMOTION_IGNORE_CERT_ERRORS=1 node critique/critique.mjs WhatIfDemo --shotlist examples/whatif-countdown/shotlist.json --round N --fast --gl swangle`, then `node critique/score.mjs … --write`.

Before round 1 (draft stills, not scored): skyline too close (towers filled the top half behind the
title); POV hands placed outside the 50° frustum (invisible); planet centred under the HUD and too big;
moon path out of frame; low-orbit view looked straight at the texture's pole; window sparkles died
before the mid frame. Fixed: skyline pushed to z −150/−184 and lowered, hands moved into view,
planet up-right at 80 m, moon on the camera→planet line, orbit view with the equator turned up.

## Round 1 — mean 37.7 · 17 cells under 8 · locked: flash, moon, blank, end
| shot | s/c/m/t/y | total |
|---|---|---|
| park | 8/6/7/7/8 | 36 |
| switch | 8/6/8/6/8 | 36 |
| hands | 7/7/8/8/8 | 38 |
| wind | 7/7/8/7/8 | 37 |
| shock | 6/7/7/8/8 | 36 |
| flash | 8/8/8/8/8 | 40 🔒 |
| moon | 8/8/8/8/8 | 40 🔒 |
| orbit | 8/7/7/8/8 | 38 |
| respin | 8/5/8/5/8 | 34 |
| blank | 8/8/8/8/8 | 40 🔒 |
| end | 8/8/8/8/8 | 40 🔒 |

3 worst → fixes (all framing — the HUD and the narration band were sitting on the subject):
1. **respin (f1020–1206)** — "SPINNING" + sub-label on the point-cloud friends. → camera = the opening framing, orbiting ≈ 15°; picnic right of x 480, y 820–1100.
2. **park (f0–120)** — narration on the blanket, picnic crowding the HUD, title over bright windows. → pulled back (fov 46 → 40, ≈ 20 m): picnic x 560–1040, y 840–1090 (checked by projecting its corners through the camera); window panes lower contrast.
3. **switch (f120–300)** — timer over a friend, narration over blanket lines. → starts on the park's end pose, pushes in to a projection-checked pose.

## Round 2 — mean 38.8 · 12 cells under 8 · locked: + park, switch
park 40, switch 40, respin 38 (7/7 composition/type: sub-label end touches the cloud); others unchanged.

3 worst → fixes:
1. **shock (f600–720)** — sparse sparkles didn't sell "windows burst". → every pane flashes (stationary 0.25–0.45 s white point) as the west→east front passes, then sheds 5 shards downwind; wider camera (three towers).
2. **wind (f480–600)** — nothing showed the air hitting anything. → tree canopies tear off their trunks and fly east (seeded delays along the front); camera lowered so the trees sit in front of the towers; foreground trees within 34 m cleared (staging); sub-label shortened to "4× THE RECORD WIND SPEED".
3. **hands (f300–480)** — read as stacked boxes. → cleaner hand (back of hand + 4 separated curled fingers + angled thumb), tilted fingers-up 50° so the backs face the lens, hidden-line edges, the star ground drawn *through* the hands (`groundThrough`), fingertips kept under the narration band.

## Round 3 (final) — mean 39.3 · 8 cells under 8 · locked: park, switch, hands, flash, moon, blank, end
| shot | s/c/m/t/y | total |
|---|---|---|
| park | 8/8/8/8/8 | 40 🔒 |
| switch | 8/8/8/8/8 | 40 🔒 |
| hands | 8/8/8/8/8 | 40 🔒 |
| wind | 8/7/8/7/8 | 38 |
| shock | 8/7/8/7/8 | 38 |
| flash | 8/8/8/8/8 | 40 🔒 |
| moon | 8/8/8/8/8 | 40 🔒 |
| orbit | 8/7/7/8/8 | 38 |
| respin | 8/7/8/7/8 | 38 |
| blank | 8/8/8/8/8 | 40 🔒 |
| end | 8/8/8/8/8 | 40 🔒 |

Still under 8 (shipped as round 3, `score.mjs` MAX ROUNDS): **wind** + **shock** composition/type — the
HUD timer and the narration sit on facade lines / flashing panes (legible thanks to the shadow, but not
clean); **orbit** composition/motion — the satellite is small in the top-right corner and little moves
in 4 s; **respin** composition/type — the sub-label's last letters touch the point cloud.
Next fix (not done, round limit): a darker band behind the HUD/narration only in glow acts (or push
the towers right of x 540), a bigger satellite crossing the horizon, respin look x −1.8 → −2.2.

## Final checks
- Render: `REMOTION_IGNORE_CERT_ERRORS=1 npx remotion render WhatIfDemo out/WhatIfDemo.mp4 --gl=swangle --concurrency=4` — 1350 frames in ≈ 20 min (point-cloud frames ≈ 4× slower than the rest).
- ffprobe: h264 1080×1920 yuv420p 30/1, 1350 frames, AAC 48 kHz stereo, 45.01 s.
- Loudness: first render −16.7 LUFS / **+0.4 dBTP** (the bed's glow riser peaked at −2 dBFS under the
  noise-wall + impact). → bed risers −6 dB, bed target −17 → −16 LUFS: −15.7 / +0.2 (now the hit
  itself) → noise-wall −1 → −3 dB, white-out impact +3 → 0 dB: −15.7 / −0.9 → bed ducks −6 dB around
  every `impact` cue (MusicBed duckFrames, 0.2 s attack / 0.5 s release) → **final mix −15.9 LUFS integrated,
  −3.3 dBTP, LRA 10.2 LU** (after AAC). Audio re-rendered alone (`--codec=wav`) and muxed onto the
  unchanged video stream (`-c:v copy`, AAC 192k).
- Frames: 6 frames extracted at 0 / 7 / 13 / 22.5 / 28 / 37 s and inspected (park + title + HUD; x-ray
  friends; POV hands; window wave; eclipse; point cloud + "SPINNING").
- Loop: the last frame is the end card (the question on #121214), frame 0 is the question over the park —
  a semantic loop (same words, same keyword colour), not a pixel match; that's the format.
- Determinism: frames 660 and 1113 (point cloud, the heaviest) rendered twice → identical md5.
- Sync spot-check: the `power-down` + `thump` peak lands at 4.00–4.01 s = frame 120, the switch frame;
  the HUD label/timer cross-fade starts on the same frame.

## Whole-reel score (HARNESS §4.5) — 79 / 100
| axis | score | why |
|---|---|---|
| hook (15) | 12 | frame 0 = the question + a running clock over a lit scene; the look change lands at 4 s. Small people, no face close-up. |
| readability (15) | 12 | title/HUD/narration at measured sizes; in the two glow acts the HUD and narration sit on bright lines; 28 px HUD labels are small at 360 px wide. |
| one idea per shot (10) | 9 | stop → you keep going → air with you → city hit → windows burst → orbit untouched → return → twist. |
| motion (10) | 8 | every act moves (flow, hand drift, canopies, wave, moon, assembly), eased; orbit act is static-ish. |
| sync (15) | 13 | clock, cues, look changes and lines all derived from one config; no VO to sync to (format). |
| pacing (10) | 7 | 10 lines / 45 s with picture-only gaps; the 9 s in space with two quiet lines sags. |
| sound (10) | 7 | full code-synthesised arc (ambience → pads → twinkles → rise → hit → riser → glitch → silence), −15.9 LUFS / −3.3 dBTP; synthetic, no real foley. |
| ending / loop (5) | 4 | end card repeats the question (semantic loop), fact line; not a visual match to frame 0. |
| safe zones (5) | 4 | all readable text in x 70–1010, y 400–1290 (narration's last line centre at 1262; a 2-line sentence's bottom reaches ≈ 1290). |
| brand + facts (5) | 3 | every claim sourced in facts.md; the format's own look (serif, black, blue) is not the Q-ROSITY palette/type. |
