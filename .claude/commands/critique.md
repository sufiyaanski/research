---
description: Run one honest critique round on a composition (middle frame of every shot → contact sheet → scores → the 3 worst → targeted fixes). Max 3 rounds per composition.
argument-hint: "<CompositionId> [shotlist path]"
---

# /critique $ARGUMENTS

1. Parse `<Comp>` and an optional shot list path. If none is given, find it: `studio/episodes/*/shotlist.json` whose `id` is `<Comp>`, or the example's `shotlist.json`, or (long-form) the episode's `shotlist.json` with `LongformPreview`/`LongformDemo`.
2. Read `toolkit/HARNESS.md` §2 (bans) and §4 (the loop) and the channel bible.
3. From `toolkit/`:
   `REMOTION_IGNORE_CERT_ERRORS=1 node critique/critique.mjs <Comp> --shotlist <file> --fast --gl swangle`
   (it picks the next round number and refuses round 4).
4. **Look at every still yourself** (Read the PNGs in `critique/rounds/stills/<Comp>-rN/`), at full size AND imagine it 360 px wide (phone). For long-form also check in-between frames where a camera move could push a 3D object into text.
5. Score each unlocked shot 1–10 on story / composition / motion / type / sync with a one-line note naming the defect. Be a strict reviewer comparing against the best channels in the niche — a 9 means "nothing to fix", an 8 is the ship bar. Walk the hunt list (HARNESS §4.2).
6. `node critique/score.mjs critique/rounds/<Comp>-round-N.md --write` → it names the 3 worst and whether to stop.
7. Propose the fix for each of the 3 worst (problem · exact change in numbers · what stays locked) and apply them only if this run is part of `/make-short`, `/make-long` or `/go` with prior approval of the shot list; otherwise show the plan and stop.
8. Append the round (scores, 3 worst, changes) to the episode's `review_log.md`. Any fix that generalises → one line in HARNESS "Learned from reviews" (`- <rule> — <Comp>, <date>`).
9. After round 3: ship the best round (score.mjs names it) and log what is still under 8 — don't start a round 4.
