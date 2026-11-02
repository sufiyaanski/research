---
description: Make (or continue) a 10–15 min long-form episode — premise → script.md approval → chapters JSON → free voice → critique → per-chapter render → mix (−14 LUFS) → thumbnail + description. Stops at every gate.
argument-hint: "<topic / premise, or an existing studio/episodes/<id> to continue>"
---

# /make-long $ARGUMENTS

If `$ARGUMENTS` is an existing `studio/episodes/<id>` folder, read its `status.md` and continue from the next unfinished step. Otherwise start a new episode for the premise.

## 0. Load the rules
`toolkit/HARNESS.md` (§1.2 gates, §2 bans, §3 sound, §4 critique) → `studio/channels/longform/bible.md` → `toolkit/longform/README.md` (templates + their props) → the demo episode `toolkit/longform/demo/` (episode.json, chapters/*.json, facts.md, script.md) as the canonical example → `studio/channels/longform/ideas.md` (domain of the previous episode).

## 1. Gate 1 — premise + outline (STOP)
Create `studio/episodes/<YYYY-MM-DD>-longform-<slug>/` + `status.md` + STATUS row. Write in `brief.md`: logline, the 3 promise stops, the chapter list (5–7 chapters, each one escalation step, 1.5–2.5 min), where each re-hook lands (every 60–90 s), the payoff line, the 2–3 Shorts this episode will yield. Research every claim you plan to make into `facts.md` (URL + quote; derived numbers marked derived). **Ask for approval and stop.**

## 2. Gate 2 — script (STOP)
Write `script.md` in the demo's format (chapters → `### scene [template · notes]` → VO lines at ~2.5 words/s; ≈ 1,700–2,200 words for 12–14 min). Cold open ≤ 30 s, no "in this video". Mark re-hook scenes. **Ask for approval and stop.**

## 3. Chapters JSON + voice (after G2)
Copy `toolkit/longform/demo/episode.json` (new id, title, outName, thumbnail, summary, hashtags; remove `"excerpt": true`) and write `chapters/NN-<slug>.json` from the approved script — every cue word (`on`, `landOn`, `goneOn`, …) must be a word of that scene's VO; add an `end-screen` chapter (`"kind": "end-screen"`, `"seconds": 20`, one `endscreen` scene with `"vo": []`). Then:
```bash
cd toolkit
node longform/render-chapters.mjs ../studio/episodes/<id> --only voice     # Kokoro voice + words + timeline + warnings
```
Fix every `warn:` (cold open > 30 s, chapter length, re-hook gaps, missing cue words) before going on.

## 4. Critique (≤ 3 rounds)
Every plan/voice run also writes `toolkit/longform/preview/timeline.json`, which Studio shows as **`LongformPreview`** (the whole episode). So:
`REMOTION_IGNORE_CERT_ERRORS=1 node critique/critique.mjs LongformPreview --shotlist ../studio/episodes/<id>/shotlist.json --fast --gl swangle`
→ look at every still → score honestly → `node critique/score.mjs … --write` → fix the 3 worst (chapter JSON props first; template code only if the fix generalises) → re-run `--only plan` → next round. Max 3. Log rounds in `review_log.md`; generalisable lessons → HARNESS "Learned from reviews".

## 5. Render + mix + thumbnail + description
```bash
REMOTION_IGNORE_CERT_ERRORS=1 node longform/render-chapters.mjs ../studio/episodes/<id> --name <Comp> --gl swangle --concurrency 4
```
It renders each chapter separately (re-runs skip unchanged chapters), concatenates, mixes voice + ducked music bed + SFX to −14 LUFS / ≤ −1 dBTP, renders `out/<Comp>-thumb.png`, and writes `chapters.txt` + `description.md`. Report per-chapter render times and the loudness line from `out/longform/<id>/report.json`.

## 6. Gate 3 — watch it (STOP)
Ask the user to watch the whole video on a laptop and check the thumbnail at phone size. Stop.

## 7. Publish pack
`/publish-pack <id>`: YouTube title options (≤ 60 chars), description.md, chapters, captions.srt to upload, thumbnail A/B pair, end-screen + Shorts "Related video" plan, and the 2–3 Shorts to cut next (as `/make-short q-rosity …` ideas). The user uploads. Never upload anything.
