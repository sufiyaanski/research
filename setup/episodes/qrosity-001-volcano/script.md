# qrosity-001 · "What if you fell into a volcano?"

**Pitch.** Falling into a volcano is not the cartoon plunge: lava is ~1,100 °C, three times
denser than you (you float), and a hundred thousand times thicker than water (you can't swim).
So you lie on top of it and burn. Not survivable.

**Format.** 1080×1920 @ 60 fps · 30 s · composition `QrosityVolcano` · VO ≈ 62 words (2.4 w/s)
· 3D stage (`Stage3D` + `BlockyCharacter`), 2D kit overlays.
**Hook (frame 0).** "WHAT IF / you fell into a volcano?" with Q already on a rock island in the lava.
**Alt hooks (trial reels).** "Would you sink in lava?" · "Lava: 1,100 °C. You: on top of it." (see publish.json)

## Beat sheet (POV escalation ×3 → consequence → loop)

| Beat | Time | Camera | Q (pose · mood) | On screen | VO |
|---|---|---|---|---|---|
| HOOK | 0.0–3.4 | pushIn (9.2→7.6 m, 12° orbit) | idle · neutral → **worried** take on "volcano" (1.9 s) | Title WHAT IF + premise, composed on frame 0; rock island, lava field, embers | What if you fell into a volcano? |
| 01 HEAT | 3.4–6.6 | orbit 17° | idle → **point** up-right on "heat" (4.6 s) · worried | Kicker "01 · the heat"; headline FIRST: **THE HEAT.** | First problem: the heat. |
| 01 NUMBER | 6.6–10.0 | bust (×1.25) | idle · worried → **shocked** take (8.0 s) | Counter 0 → **1,100 °C** lands on "1,100" (8.1 s); source plate | Basalt lava runs around 1,100 degrees Celsius. |
| 02 SURFACE | 10.0–13.0 | hero, creeping in | **walk** off the island toward the lens · worried | Kicker "02 · the surface"; headline YOU DON'T **SINK.** | Second problem: you don't sink. |
| 02 NUMBER | 13.0–16.6 | bust (×1.25) | idle · worried → **happy** take on "You float" (15.5 s) | Counter **3×** lands on "three" (13.9 s); source plate; stamp YOU FLOAT (15.6 s) | Lava is three times denser than you. You float. |
| 03 PHYSICS | 16.6–21.0 | orbit 17° (×1.1) | **walk** in place, shins under the lava · happy → **worried** take on "thicker" (17.6 s) | Kicker "03 · the physics"; counter 0 → **100,000×** lands on "thousand" (18.4 s); source plate | A hundred thousand times thicker than water. No swimming out. |
| CONSEQUENCE | 21.0–26.2 | lowAngle (×1.42), 7-frame shake on the snap | idle → **shocked** pose on "lie" (21.6 s) · worried → **shocked** take landing with the hop | Kicker "the consequence" (red); headline ON TOP. **BURNING.**; stamp NOT SURVIVABLE on "Not" (24.4 s) | So you'd lie on top. And burn. / Not survivable. |
| LOOP | 26.2–30.0 | loop (glides to the frame-0 camera) | idle · shocked → **neutral** take (26.5 s) | Title returns on "what if" (27.0 s); last frame ≈ frame 0 | So… what if you fell into a volcano? |

## Production notes

- Every number: `facts.json` (all three are `secondary` — university/USGS/Sciencing pages read this
  session; see the notes there for the ranges behind the rounded display values).
- Mood changes never snap: each goes through a `take` (anticipation → squash → new face → settle,
  30 frames). Body poses cut (`poseAt`) on the VO word; the take starts 10 frames earlier so the
  new face lands with the hop.
- Voice: placeholder timings (`vo.gen.ts` estimated). After TTS with word timestamps, write
  `words[]` into `beats.json` and run `npm run vo:estimate -- qrosity-001-volcano`.
- Sound: `sfx-plan.json`. Lava rumble bed throughout; hero layers on the 1,100 °C landing and the
  shocked hop.
- No outro. The loop is the ending.
- Render: `--gl=swangle` on a box without a GPU (this one: ≈ 0.4 s/frame at scale 0.5 — the 3D
  still renders at 1080 px wide because R3F clamps dpr ≥ 1). `angle` on a desktop GPU.
