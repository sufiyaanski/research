---
name: make-signal-reel
description: End-to-end recipe for a The Signal reel (price-psychology motion graphics, 1080x1920 @ 60 fps, 45-70 s, "a story told with numbers") — idea → facts.json → script.md + beats.json → vo.gen.ts → Episode.tsx on the shared kit → phone-scale frame QA → draft/final render → review notes → "save to skill". Use when the user says "make a Signal reel", "new episode about X", "turn this fact into a reel", or wants to continue the signal-NNN series. Also the template for a Q-ROSITY episode (swap the brand and add the character slot).
---

# make-signal-reel — the 7 stages

Run from `setup/`. Read `CLAUDE.md` (hard rules), `channels/the-signal/brand.md` (look,
voice, sound) and `/reel-design-rules` (numbers) first. The demo episode
`signal-001-anchoring` is the reference implementation — copy its structure, not its content.

Artifact contract:
```
episodes/signal-NNN-<slug>/
  facts.json       every number + source URL + confidence     (stage 2)
  script.md        hook, beat table (time | on screen | VO), notes (stage 3)
  sfx-plan.json    cue sheet on the global timeline            (stage 6)
  publish.json     title, caption, hashtags, qa scores         (stage 7)
  qa/frames/       ≤ 8 phone-scale stills                      (stage 5)
remotion/src/episodes/signal-NNN-<slug>/
  beats.json       format, vo[] lines, beats[] (global seconds) (stage 3)
  vo.gen.ts        GENERATED word timings (estimate-vo.mjs / TTS) (stage 3)
  Episode.tsx      the composition, registered in Root.tsx      (stage 4)
```

## Stage 1 — Idea (one line, one number)

- A Signal reel is **one mechanism + one surprising number + one everyday sighting**. Write
  the pitch as: "<thing you saw> is really <mechanism>; the proof is <number> (<source>)".
- Hook candidates: 3 lines, ≤ 6 words each, a number or a contradiction in each. Pick one;
  keep the other two in `publish.json → altHooks` (trial-reel variants).
- Check the series: don't repeat a mechanism used in the last 5 episodes.

## Stage 2 — facts.json (before any script)

- Every number that will appear on screen or in VO goes in `facts.json` with `value`,
  `unit`, `source` (URL), `quote` (the sentence it comes from), `confidence`
  (`verified` / `secondary` / `anecdote`) and `display` (exactly how it is shown).
- **Never invent.** If a number can't be sourced, change the story. Anecdotes (the
  Williams-Sonoma bread maker) are allowed when labelled and the on-screen source says so.
- Rounding happens here, once (`display`), not in the scene.

## Stage 3 — script.md + beats.json (+ vo.gen.ts)

- Beat grammar (45–70 s): **HOOK** 0–3.5 s (frame 0 composed, number visible) → **SETUP** →
  **TURN** (the move / the twist) → **WHY** (the mechanism, named) → **PROOF** (the study,
  the number) → **EVERYDAY** (where you'll see it today) → **PAYOFF** (one line, then loop
  to frame 0). No outro CTA.
- VO: 110–160 words, ≈ 2.5–2.8 words/s, line windows with 0.3–0.5 s gaps. Numbers spoken as
  they are displayed ("four twenty-nine" ↔ `$429`). The word that names a number is the cue
  its visual lands on.
- `beats.json`: `vo[]` lines with `beat`, `text`, `start`, `end`; `beats[]` contiguous, with
  `visual` (one sentence) and `sfx` (`"clip@seconds"` hints). `format.durationSec` = last
  beat end.
- `npm run vo:estimate -- signal-NNN-<slug>` → `vo.gen.ts` (placeholder word times; the
  script warns above 3.2 words/s). When a TTS with timestamps exists, write `words[]` into
  `beats.json` and re-run — captions retime, nothing else changes.
- Show the user script.md and wait for "go" before Stage 4 (it's the cheapest place to change
  the story).

## Stage 4 — Episode.tsx on the kit

- Copy `signal-001-anchoring/Episode.tsx`. One scene component per beat; scenes mounted in
  `<Sequence from={b.from} durationInFrames={b.durationInFrames}>` from `beatsToFrames`.
  `Captions` + `ProgressBar` at the root (global time).
- Cues: `const cue = (s) => toLocal(s, b.from)` — every reveal uses a VO second from
  beats.json, never a guessed frame. Check each cue twice (LOCAL frames!).
- Build only from the kit: `BigTitle`, `Kicker`, `PriceTag`, `Counter`, `BarChart`,
  `LineChart`, `Stamp`, `SourceLine`, `Reveal`, `Backdrop`. Add at most **one** new
  episode-specific component (like `Wheel`, `ValueScale`) and put it in the scene file; if a
  second episode needs it, move it to `lib/`.
- Frame 0: hook elements use negative `at`. Payoff: same hero geometry as the hook, dissolve
  the payoff line into the hook line 1 s before the end.
- Register in `Root.tsx` (duration from beats.json). `npm run typecheck`.

## Stage 5 — Frame QA (never skip)

- `/frame-qa`: `npm run frames -- <Comp> beats --scale=0.5`, READ every PNG, fix, repeat ≥ 2×.
  Then specific frames: each number landing, each caption change near a reveal, frame 0 vs last.
- Score the rubric. < 70 → keep fixing. Copy ≤ 8 stills into `episodes/<id>/qa/frames/`.

## Stage 6 — Render + sound

- `npm run render -- <Comp> --scale=0.5` → `out/<Comp>-draft.mp4`; `npm run check -- out/<Comp>-draft.mp4 --draft`.
- Author `sfx-plan.json` (cue list from exact landing frames: `at_s = (local + sequence.from) / 60`), levels per brand §7. The mix itself happens in the user's audio tool / ffmpeg; the plan is the contract.
- When VO exists: mux `ffmpeg -i out/<Comp>.mp4 -i voice.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k out/<Comp>-voiced.mp4`, then `npm run check` (loudness).
- Final: `npm run render -- <Comp>` (scale 1) only after the draft passed review.

## Stage 7 — Review notes → "save to skill"

- `/review-loop`: user notes from `review/index.html` → fixes → stills at those timestamps → re-render.
- On "save to skill": append the generalized rule to `channels/the-signal/brand.md` or
  `/reel-design-rules` → "Learned from reviews", with the episode id.
- Fill `publish.json` (title ≤ 60 chars, caption, 3–5 hashtags, altHooks, qa scores). Done.

## Done =
facts sourced · script approved · composition on the kit · stills read twice and saved ·
draft rendered + checked · sfx plan authored · review round(s) closed · rules saved · publish.json filled.
