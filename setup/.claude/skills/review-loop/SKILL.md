---
name: review-loop
description: How to take timestamped notes from the local review app (review/index.html), turn each into a concrete fix, verify the fix with stills at the same timestamps, re-render, and when the user says "save to skill" append the generalized rule to brand.md or reel-design-rules so the next episode's first render is better. Use after any render when the user pastes "[mm:ss.s] note" lines.
---

# review-loop — notes → fixes → rules

The goal is fewer rounds. Every round should (a) fix the specific frame and (b) leave a rule
behind so the mistake can't happen on episode N+1.

## 1. Get the notes

The user opens `review/index.html` (file://, no build), loads `out/<Comp>-draft.mp4`,
presses **N** at each problem, types the note, and clicks **Copy notes for Claude**. The
clipboard holds lines like:

```
[00:07.3] stamp covers the price
[00:27.4] nothing on screen after the cut
[00:48.8] title wraps to 3 lines
rubric: hook 15, readability 9, one-idea 8, motion 8, sync 10, pacing 6, sound 0, loop 5, safe 5, brand 4 = 70
```

Rubric scores are optional; if present record them in `episodes/<id>/publish.json → qa`.

## 2. Triage every note

For each `[mm:ss.s] note`:
1. Convert to frame: `f = round(s × 60)`. Find the beat in `beats.json` and the local frame: `local = f − beat.from`.
2. Classify: **layout** (overlap/overflow/zone) · **timing** (early/late/sync) · **copy** (words) · **look** (color/type/motion feel) · **sound** · **fact**.
3. Decide the smallest change in the right file: scene code in `Episode.tsx`, a kit default in `lib/kit.tsx` (only if it's wrong for every episode), words in `beats.json` → re-run `npm run vo:estimate -- <id>` (or regenerate the voice), a cue in `sfx-plan.json`, a number in `facts.json`.
4. Write the fix list back to the user **before** editing, one line per note, with the file and the change. Don't ask for approval on obvious fixes; do ask when a note contradicts a rule in CLAUDE.md or brand.md (then the rule wins unless the user overrides).

## 3. Fix and verify

- Apply all fixes. `npm run typecheck`.
- `npm run frames -- <Comp> <every noted second as "Ns">,0,last --scale=0.5` and READ them. The noted frame must now be right **and** its neighbours (±0.5 s) must not have regressed.
- Re-render the draft; tell the user which timestamps changed so they can jump to them.

## 4. "Save to skill" (the feedback-to-skill loop)

When the user says "save this to the skill" / "make this a rule" / "always do this":

1. **Generalize** the note from an instance to a rule with a number: "stamp covers the price" → "A Stamp never covers the number it comments on; place it below the tag (≥ 24 px gap)."
2. **Choose the file**:
   - look, sound, voice, channel-specific taste → `channels/<channel>/brand.md` → section **"Learned from reviews"**;
   - motion, typography, layout, pacing, charts that apply to both channels → `.claude/skills/reel-design-rules/SKILL.md` → **"Learned from reviews"**;
   - process rules ("always pull a still at the counter landing") → `.claude/skills/frame-qa/SKILL.md` §2 or `PRE-RENDER-CHECKLIST.md`;
   - a hard, non-negotiable rule → also one line in `CLAUDE.md` under the matching R-number.
3. **Format**: `- [<episode-id>] (<R-number if any>) <rule with a number>` appended at the bottom (newest last).
4. If the rule changes a kit default (e.g. caption size), change `lib/kit.tsx` too and say so.
5. Confirm back: the rule text, the file, and what it will change on the next episode.

Never silently add rules the user did not ask to save; a one-off preference stays a one-off.

## 5. Close the round

- Update `episodes/<id>/publish.json`: `qa.score`, `qa.rounds += 1`, `qa.notes` (resolved list).
- Copy the fresh stills for the noted timestamps into `episodes/<id>/qa/frames/` (≤ 8 total; replace older ones).
- Summarize: notes received / fixed / rules saved / what's still open.
