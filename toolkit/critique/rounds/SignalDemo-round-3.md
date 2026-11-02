# Critique — SignalDemo — round 3 of 3

- shot list: `examples/signal-demo/shotlist.json` (7 shots, 450 frames @ 30 fps)
- stills: middle frame of each shot, `floor((start+end)/2)`, scale 0.5 — `critique/rounds/stills/SignalDemo-r3/`
- contact sheet: ![SignalDemo round 3](SignalDemo-round-3-sheet.jpg)
- generated: 2026-11-02 by `node critique/critique.mjs SignalDemo --shotlist examples/signal-demo/shotlist.json --round 3 --fast --gl swangle`
- previous round: 2 — locked (all ≥ 8, don't touch): payoff; fixed this round: digit, reveal, hook

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
| 1 | hook | 0–79 | [39](stills/SignalDemo-r3/hook-f0039.png) (1.30s) | $9.99 isn't $10 | $9.99 tag hangs on its string, the person looks at it; on "$10" the tag flips to $10.00 → **tag shows $10.00, headline YOUR BRAIN GETS FOOLED, person looking at the tag** | 8 | 8 | 8 | 8 | 8 | 40 | worried take lands on 'brain' (f61), so a new beat lands between the flip and the cut; $10.00 clears the edge |
| 2 | flip | 79–140 | [109](stills/SignalDemo-r3/flip-f0109.png) (3.63s) | One cent less | a red −1¢ sticker lands on "cent"; the tag flips back to $9.99 on "less"; price pops on "cheaper" → **tag shows $9.99 with the −1¢ sticker, person happy** | 8 | 7 | 8 | 8 | 8 | 39 | unchanged — sticker crowds the tag corner |
| 3 | digit | 140–193 | [166](stills/SignalDemo-r3/digit-f0166.png) (5.53s) | Your eyes stop | tag pushes in; ".99" greys out, an ink box draws around the left 9; person points; the 9 pops on "9" → **big tag, "$9" boxed in ink, ".99" faded, person pointing at it** | 8 | 7 | 8 | 8 | 8 | 39 | hand now points AT the tag end, the $9 is clear; top ~470 px still empty |
| 4 | feels | 193–255 | [224](stills/SignalDemo-r3/feels-f0224.png) (7.47s) | it under $9, | bar A grows and counts $1→$9, landing on "$9"; bar B waits as a dashed "?" outline → **bar A "FEELS LIKE" $9 landed, bar B empty dashed outline, person looking at the bars** | 8 | 7 | 8 | 8 | 8 | 39 | unchanged — some empty space top-left above the person |
| 5 | reveal | 255–316 | [285](stills/SignalDemo-r3/reveal-f0285.png) (9.50s) | but you pay $10 | bar B counts $1→$10 through the pause and lands on "$10."; riser → cash-register; person's shocked take → **bar B "YOU PAY" $10 taller than bar A, person in the shocked pose** | 8 | 8 | 8 | 8 | 8 | 40 | guide exits as bar B counts; numerals clean |
| 6 | effect | 316–370 | [343](stills/SignalDemo-r3/effect-f0343.png) (11.43s) | That's the left-digit effect | LEFT-DIGIT EFFECT headline rises out of its mask on "left-digit"; the study line wipes in under the tag → **headline THE LEFT-DIGIT EFFECT, small $9.99 tag with the 9 boxed, source line, person worried** | 8 | 8 | 7 | 8 | 8 | 39 | unchanged — ~1 s hold after the headline lands |
| 7 | payoff 🔒 | 370–450 | [410](stills/SignalDemo-r3/payoff-f0410.png) (13.67s) | Read the whole price | READ THE WHOLE PRICE lands; ".99" turns red and underlines on "price"; frame-0 headline returns (thump) → **identical to frame 0 — $9.99 tag, YOUR BRAIN GETS FOOLED, person looking at the tag (loop seam)** | 8 | 8 | 8 | 8 | 8 | 40 | |
<!-- SCORES:END -->

## Rule

Fix the 3 worst shots (lowest total; ties → lowest sync). Lock everything that scored ≥ 8 (don't touch it). Re-render. Repeat until every shot is ≥ 8 in every column. Max 3 rounds; after round 3 ship the best round and log what's still under 8.

Then run `node critique/score.mjs critique/rounds/SignalDemo-round-3.md` — it totals the table, names the 3 worst shots and says whether to stop.

## Fix log (fill in after scoring)

- (round 3 is the last round: no further fixes; see examples/signal-demo/review_log.md)

<!-- VERDICT:BEGIN -->
## Verdict (score.mjs)

- worst 3: flip (39), digit (39), feels (39)
- locked: hook, reveal, payoff
- under 8: flip.composition=7, digit.composition=7, feels.composition=7, effect.motion=7
- **MAX ROUNDS — round 3 of 3 still has 4 cell(s) under 8. No round 4: ship round 3 (fewest sub-8 cells: 4, mean total 39.4) and log what's still under 8.**
<!-- VERDICT:END -->
