# Review log — SignalDemo

Critique files: `critique/rounds/SignalDemo-round-{1,2,3}.md` + `-sheet.jpg` (stills git-ignored).
Command each round: `REMOTION_IGNORE_CERT_ERRORS=1 node critique/critique.mjs SignalDemo --shotlist examples/signal-demo/shotlist.json --round N --fast --gl swangle`, then `node critique/score.mjs … --write`.

## Round 1 — mean 38.0 · 14 cells under 8 · locked: payoff
| shot | s/c/m/t/y | total |
|---|---|---|
| hook | 8/8/7/8/8 | 39 |
| flip | 8/7/8/8/8 | 39 |
| digit | 8/6/8/7/8 | 37 |
| feels | 7/6/8/7/8 | 36 |
| reveal | 6/6/8/7/8 | 35 |
| effect | 8/7/7/7/7 | 36 |
| payoff | 8/8/8/8/8 | 40 🔒 |

3 worst → fixes:
1. **reveal (f255–316)** — mid-count bar B ($8) was taller than bar A ($9): the height eased on its own clock. → height locked to the displayed value (each $1 step eases 0.1 s); bars 500 → 660 px tall, 220 → 250 wide, numbers 132 → 150 px, labels 34 → 40 px.
2. **effect (f316–370)** — headline landed 4 f after "left-digit"; head pitched up at the headline looked distorted; source line 30 px. → headline `at` = word − 0.33 s (lands on the word), gaze to the small tag, source 34 px.
3. **feels (f193–255)** — hero too small (bars 26 % of frame), top 45 % empty. → same Bar change (shared only by feels + reveal).

## Round 2 — mean 38.6 · 8 cells under 8 · locked: payoff
feels 39, reveal 38, effect 39; hook 39, flip 39, digit 37 unchanged.

3 worst → fixes:
1. **digit (f140–193)** — the pointing hand covered the "$" of the hero price. → `TAG_DIGIT` hole (396,708)@1.22 → (470,660)@1.10: the hand now meets the tag's punched end.
2. **reveal** — the dashed "?" guide cut through the counting numerals. → the guide exits (0.2 s, in-cubic) as bar B starts.
3. **hook (f0–79)** — 45 f with nothing landing after the flip. → worried take keyed to "brain" (f61); `$10.00` face at 0.88× so it clears the tag edge.

## Round 3 (final) — mean 39.4 · 4 cells under 8 · locked: hook, reveal, payoff
| shot | s/c/m/t/y | total |
|---|---|---|
| hook | 8/8/8/8/8 | 40 🔒 |
| flip | 8/7/8/8/8 | 39 |
| digit | 8/7/8/8/8 | 39 |
| feels | 8/7/8/8/8 | 39 |
| reveal | 8/8/8/8/8 | 40 🔒 |
| effect | 8/8/7/8/8 | 39 |
| payoff | 8/8/8/8/8 | 40 🔒 |

Still under 8 (shipped as round 3, `score.mjs` exit 4): flip.composition (−1¢ sticker crowds the tag corner), digit.composition (top ~470 px empty), feels.composition (empty space top-left above the person), effect.motion (~1 s hold after the headline lands).

## Final checks
- Render: `npx remotion render SignalDemo out/SignalDemo.mp4 --gl=swangle --concurrency=4` — 41–43 s for 450 frames.
- ffprobe: h264 1080×1920 yuv420p 30/1, 450 frames, AAC 48 kHz stereo, 15.02 s.
- Loudness (ebur128): first render −16.2 LUFS / **+0.8 dBTP** (the +3 dB clicks/pops/cash-register clipped over the bed) → SFX master −6 dB, bed regenerated at −13.5 LUFS, duck −6 → −4 dB, bed volume 1.12 → **−15.6 LUFS integrated, −1.0 dBTP**, LRA 1.9 LU.
- Loop seam: frame 0 vs 449 SSIM 0.997 (same headline, tag, pose, mood). Determinism: frame 291 rendered twice → identical md5.

## Whole-reel score (HARNESS §4.5) — 77 / 100
| axis | score | why |
|---|---|---|
| hook (15) | 12 | frame 0 has the number, a ≤ 6-word headline and the person; the flip lands at 1.1 s. The headline is generic. |
| readability (15) | 12 | big type, money red only, captions 68 px; source line 34 px is the smallest readable thing; lots of empty floor band. |
| one idea per shot (10) | 9 | |
| motion (10) | 7 | eased, staggered, no wobble; but the person mostly stands, and the page has little camera life. |
| sync (15) | 12 | every hit is a cue frame or a word onset by construction — but against hand-timed words, not a real voice. |
| pacing (10) | 7 | cut every 1.8–2.7 s; 1.5 s tail after the last word. |
| sound (10) | 5 | no VO audio (no TTS here); placeholder synth bed; SFX on cue but 17 counter ticks push density over 1 cue / 2 s. |
| ending / loop (5) | 5 | last frame = frame 0. |
| safe zones (5) | 4 | all text inside x 70–1010 / y 220–1280, right rail free; floor band is dead space. |
| brand + facts (5) | 4 | palette/type exact; study named, but no `facts.json` with a URL. |

What keeps it under 80: no real voice, a static performance from the person, and empty space in three shots.
