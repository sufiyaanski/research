# Pre-render checklist

Tick every line before `npm run render`. Cite the rule (R-number from CLAUDE.md) in review notes.

## Story and facts
- [ ] One mechanism, one surprising number, one everyday sighting (`/make-signal-reel` §1).
- [ ] Every on-screen / spoken number is in `episodes/<id>/facts.json` with a source URL and `confidence` (R8).
- [ ] `script.md` approved by the user; VO 110–160 words at ≈ 2.5–2.8 words/s; `estimate-vo.mjs` printed no "words/s" warning.
- [ ] `beats.json` beats are contiguous and `format.durationSec` = last beat end; 45–70 s total (R7).

## Composition
- [ ] 1080×1920 @ 60 fps; frames derived from `fps`; composition id matches `beats.json → composition` (R0).
- [ ] Frame 0 fully composed: hook ≤ 6 words + hero number; first number ≤ 2 s (R2).
- [ ] No `useState` / `useEffect` / timers / CSS animation / `Math.random()`; every `interpolate` clamped with increasing ranges (R3).
- [ ] Every cue is `toLocal(voSecond, sequence.from)` — checked twice (R3).
- [ ] Kit components only (+ ≤ 1 episode-specific component); springs from `SPRING`, eases from `EASE`.
- [ ] Fonts via `fonts.ts` only; assets via `staticFile()` (R4).
- [ ] `Captions` + `ProgressBar` at the root; `SafeAreaGuides` not mounted (R5).
- [ ] `SourceLine` on screen whenever a number is (R8).
- [ ] Last frame ≈ frame 0, or a clean end on the payoff; no CTA outro (R7).
- [ ] `npm run typecheck` passes.

## Frame QA (`/frame-qa`)
- [ ] `npm run frames -- <Comp> beats --scale=0.5` run and **every PNG read**, twice (after fixes).
- [ ] Extra stills at: each counter/bar landing, each caption change near a reveal, frame 0, last.
- [ ] No clipped/overlapping text; headlines ≤ 2 lines; labels and source lines single-line.
- [ ] Nothing readable in bottom 340 / right 160 / top 220; hero in y 270–1250; captions at y ≈ 1380.
- [ ] Hero element on screen within 0.3 s of every cut; no stretch > 3 s without a change.
- [ ] Rubric scored ≥ 70 (draft) / ≥ 85 (final); no zero in Hook, Readability, Sync, Safe zones.
- [ ] ≤ 8 stills copied into `episodes/<id>/qa/frames/`.

## Render and delivery
- [ ] Draft: `npm run render -- <Comp> --scale=0.5` → `npm run check -- out/<Comp>-draft.mp4 --draft` PASS.
- [ ] Review round(s) done via `review/index.html`; notes fixed; rules saved on request (R9).
- [ ] Final: `npm run render -- <Comp>` → `npm run check -- out/<Comp>.mp4` PASS (1080×1920, 60 fps, h264).
- [ ] VO/music muxed; loudness ≈ −14 LUFS integrated, ≤ −1 dBTP (WARN-level check).
- [ ] `sfx-plan.json` cues at exact landing frames; levels per brand §7.
- [ ] `publish.json` filled: title, caption, hashtags, altHooks, qa scores.
