# Style guide — Q-ROSITY (QrosityDemo)

Source: HARNESS.md §6 (channel sheet) + `setup/channels/q-rosity/brand.md` (QROSITY_STAGE overlay
palette, Rubik/Nunito, character spec). No reference reel was available offline; grammar below is
the channel sheet made concrete.

## Palette
| role | hex | use |
|---|---|---|
| night / fog | `#0A0D16` | canvas clear colour = fog colour (horizon dissolves) |
| overlay text | `#FFF6EC` | WHAT IF, captions, "SECONDS OF DARK" |
| accent | `#FFD23F` | the countdown number, premise line, key caption words (10 / black / dark) |
| caption plate | `#120A10` at 82 % | under every caption (the sets are busy) |
| screens (lit) | `#7FB2FF` / `#9C8CFF` / `#6FB4FF` TV-blue, billboards `#FF4FA3 #3FE0FF #FFD23F #7CFF6B` | everything that dies |
| non-screens (stay lit) | warm windows `#FFC774`, lamps `#FFD9A0`, moon `#E8EEFF`, ATM sign `#1DB954` | everything that stays |
| Q | hoodie `#6A33FF`, yellow `#FFD23F` details, navy trousers, white shoes | `DEFAULT_PALETTE` |

## Type
- Display: **Rubik 900** — WHAT IF 150 px, countdown 230 px `tabular-nums`.
- Body: **Nunito 800** — premise 56 px (yellow), captions 64 px on a plate, label 40 px tracked +0.18 em.
- Hard drop shadow (0 6–8 px, black 55–60 %), never a glow.

## Layout
- Title / countdown block y 228–500, centred. Q's head top stays below y ≈ 540 and his face above
  the caption block (y 1080–1280): framing rule `target.y ≥ 3.1 − 0.142·dist` (fov 36°).
- Caption plate centred at y 1180 inside x 70–930.

## Shot lengths & pace
- 8 shots / 15 s, 1.5–2.5 s each, cut on VO word onsets. Escalation: room → street → city → world → (street) → room.

## Transitions
- Hard cuts on words, whoosh on the three scale jumps (street, city, world). The blackout itself is
  the transition (screens die on the cut frame, impact + 7-frame shake).

## Camera (HARNESS §6)
- Push-in on the hook (9.6 → 6.6 m); 7-frame shake on the blackout; low angle (0.6–1.1 m) on the
  consequences (city, ATM); ≈ 17° orbit on the world reveal; bust-ish push on "alone"; the loop
  glides back to frame 0's camera. Every move `Easing.inOut(cubic)`; every hold creeps.

## Light / texture
- Practical lights only: phone + monitor (die), moon through the window (rim), street lamps (stay),
  the city's glow on Q's face (dies with the skyline), sun rim on the globe. Fog for depth. No bloom,
  no particles-as-decoration (stars are static set dressing). No shadow maps on CPU renders —
  contact blobs under the feet instead.

## Text in / out
- WHAT IF + premise rise out of a mask line (10 f, out-cubic, 3 f stagger), exit up on the blackout frame (5 f, in-cubic).
- Countdown stamps in on the spoken "10" (scale 1.3 → 1, out-cubic), pops 1 → 1.12 → 1 on each tick, exits up 0.2 s after the screens return.
- Captions cut per chunk on a plate; unspoken words at 42 %; key words yellow + pop.

## Sound
- Bed: `public/music/qrosity-bed-100.wav` (100 BPM, key E, seed 5, 7 bars = 16.8 s, −15.6 LUFS), ducked −3 dB under VO words; SFX master −6 dB.
- Riser → impact on the blackout (the one build-and-drop), pop as "10" lands, tick per second of the countdown, whoosh on the scale jumps, click when the screens come back, thump as WHAT IF lands at the end.
