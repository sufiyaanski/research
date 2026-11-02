# Review log — QrosityDemo

Critique files: `critique/rounds/QrosityDemo-round-{1,2,3}.md` + `-sheet.jpg`.
Command each round: `REMOTION_IGNORE_CERT_ERRORS=1 node critique/critique.mjs QrosityDemo --shotlist examples/qrosity-demo/shotlist.json --round N --fast --gl swangle`, then `node critique/score.mjs … --write`.

Before round 1 (draft stills, not scored): every camera was too close — the countdown sat on Q's
head in four shots and the city/ATM shots cropped him; faces went near-black after the blackout.
Reframed with `target.y ≥ 3.1 − 0.142·dist` and a front fill that rises when the screens die.

## Round 1 — mean 37.0 · 18 cells under 8 · locked: loop
| shot | s/c/m/t/y | total |
|---|---|---|
| hook | 8/7/8/8/8 | 39 |
| blackout | 8/6/8/8/8 | 38 |
| street | 8/8/7/8/8 | 39 |
| city | 7/5/7/7/8 | 34 |
| world | 7/6/8/8/7 | 36 |
| dark | 6/6/7/7/7 | 33 |
| alone | 8/7/7/7/8 | 37 |
| loop | 8/8/8/8/8 | 40 🔒 |

3 worst → fixes:
1. **dark (f276–352)** — the ATM didn't read as an ATM ("no money" lost); caption over Q's chin. → ATM rebuilt (lit green "$" header made of boxes, dead screen, keypad, card + cash slots); camera target.y 2.5 → 1.8.
2. **city (f178–224)** — the caption plate sat on Q's face. → target.y 3.0 → 1.6, camera height 0.9 → 0.6 (still low angle).
3. **world (f224–276)** — no plane visible mid-shot although the VO says "every plane"; globe muddy; Q dark. → planes circle above Q (r 3.4–5 m, alt 3.2–5 m, 1.5×) and tip/drop when they go dark; ocean #173A6A → #215296; front fill 0.55 → 1.3.

## Round 2 — mean 38.9 · 8 cells under 8 · locked: dark, loop
city 39, world 39, dark 40; others unchanged.

3 worst → fixes:
1. **alone (f352–397)** — caption crossed his mouth; red poster behind the countdown. → target.y 2.45 → 2.25, orbit 0.06 → −0.32…−0.26.
2. **blackout (f73–130)** — framing too tight (arms out of frame), poster behind the countdown. → dist 7.6 → 9.0…8.4, angle 0.12 → −0.34…−0.28.
3. **hook (f0–73)** — the push-in orbited onto the red poster beside the title. → `HOOK_END` angle −0.12 → −0.42; `HOOK_START` untouched because the locked loop shot glides back to it.

## Round 3 (final) — mean 39.1 · 7 cells under 8 · locked: hook, dark, loop
| shot | s/c/m/t/y | total |
|---|---|---|
| hook | 8/8/8/8/8 | 40 🔒 |
| blackout | 8/7/8/8/8 | 39 |
| street | 8/8/7/8/8 | 39 |
| city | 8/7/8/8/8 | 39 |
| world | 8/7/8/8/8 | 39 |
| dark | 8/8/8/8/8 | 40 🔒 |
| alone | 8/7/7/7/8 | 37 |
| loop | 8/8/8/8/8 | 40 🔒 |

Still under 8 (shipped as round 3, `score.mjs` exit 4): alone composition/motion/type (the caption plate still crosses his chin — needs target.y ≈ 2.1; little happens in 1.5 s), blackout.composition (poster still left of the countdown), street.motion (Q only idles), city.composition (dark roof fills the lower third), world.composition (globe dark-heavy).

## Final checks
- Render: `npx remotion render QrosityDemo out/QrosityDemo.mp4 --gl=swangle --concurrency=4` — 201–211 s for 450 frames (~0.45 s/frame wall at concurrency 4).
- ffprobe: h264 1080×1920 yuv420p 30/1, 450 frames, AAC 48 kHz stereo, 15.02 s.
- Loudness: first render −19.0 LUFS / **+0.8 dBTP**; then SFX master −6 dB and a new bed → −18.1 / −0.7 (peak = riser + impact + un-ducked bed in the pre-reveal pause); then riser −4 dB, impact +3 → +1 dB, bed also ducked through the pause + hit, bed volume 1.4 (+2.9 dB) → **−15.5 LUFS integrated, −1.5 dBTP**, LRA 1.9 LU.
- Loop seam: frame 0 vs 449 SSIM 0.990 (same camera, phone lit, WHAT IF). Determinism: frame 201 rendered twice → identical md5.

## Whole-reel score (HARNESS §4.5) — 78 / 100
| axis | score | why |
|---|---|---|
| hook (15) | 12 | WHAT IF + premise over a lit, composed scene on frame 0 with a push-in; the drop comes at 2.4 s. |
| readability (15) | 12 | countdown 230 px, captions on plates; dark sets make Q's face low-contrast in two shots. |
| one idea per shot (10) | 9 | room → street → city → world → ATM → alone → loop, one consequence each. |
| motion (10) | 7 | every shot has a camera move and a dying-light wave; Q's acting is limited to takes and two point poses. |
| sync (15) | 12 | countdown and blackout run on the cue frames; against hand-timed words, not a voice. |
| pacing (10) | 8 | cuts every 1.5–2.5 s, escalating scale. |
| sound (10) | 5 | no VO audio; placeholder bed; 9 ticks + 3 whooshes push density over 1 cue / 2 s. |
| ending / loop (5) | 5 | twist line + last frame = frame 0. |
| safe zones (5) | 4 | the caption crosses Q's chin in "alone". |
| brand + facts (5) | 4 | palette, type and character on brand; the scenario is fiction, so there are no facts to source. |

What keeps it under 80: no real voice, Q's limited acting (no walk/turn in the street), and the dark-heavy world and roof frames.
