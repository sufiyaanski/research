# SUMMARY — 12 "motion graphics with Claude" tutorials, distilled (2026-11-02)

**Evidence quality.** YouTube blocked transcripts for 11 of the 12 videos from this cloud IP; we did not work around the block. Only #12 (James B) has a full transcript. #1 (Lukas Margerie) is the best-documented method anyway: his description, ~120 storyboard frames, and the Movez course he reads on screen and credits ([movez.substack.com](https://movez.substack.com/p/how-to-build-motion-design-studio)). #10's creator published their full `CLAUDE.md` and prompt pack; #7's creator (Nate Herk) publishes his kit on GitHub. The rest rest on descriptions, chapters and thumbnails, so their method claims are mostly [U]. Per-video notes: `research/videos/01–12`. Sources: `research/SOURCES.md`. Decisions: `research/DECISIONS.md`.

## What Gemini reported, checked

| Claim (about videos 1–5) | Verdict | Where it really comes from |
|---|---|---|
| 4-part "motion studio rules" harness; "90% harness, 10% prompt" | **Confirmed for #1.** Lukas's description: "The prompt is only 10% of the result. The other 90% is the harness." Sections on screen: Render contract · Look · Sound · "Loop before you show me anything" (not "Look bans"/"Feedback Loop"). Not seen in #2–#5. | Movez course (#1 reads it); #10 has a different 6-section rules file |
| References → style-guide .md → shot list as states on a 120 BPM beat grid → build | **Confirmed for #1** (skill frame: style_guide.md from reference, `beats.py → beats.json`, shotlist.md on the beat grid, wait for OK). Partly in #7 (repo), #10 (120 BPM shot list), #12 (style guide + scene plan). | Movez course; Nate Herk's repo |
| Sound in code: bed + beats.json + SFX synthesised in Node (click/whoosh/thump) | **Mostly confirmed for #1** ("Score and SFX are synthesized in code", `sfx.mjs`, −14 LUFS, three lanes on one timeline). The exact click-on-press / whoosh-on-morph / thump-on-logo mapping is **not** confirmed. **Contradicted** for #7 (ElevenLabs, paid) and #12 (ElevenLabs API); #10 synthesises in Python. | Movez `sfx.mjs`: click 1800 Hz 0.05 s, pop rising sine 0.15 s, thump falling sine 0.5 s, whoosh filtered noise 0.35 s |
| Self-critique: middle frame of each shot, score story/composition/motion/type/sync 1–10, fix 3 worst, until all ≥ 8 | **Partly wrong.** #1 renders **one frame per beat** and scores **7 axes** (hook ≤ 2 s, phone readability, motion, variety, composition & depth, brand accuracy, sound sync); "fix the 3 worst" and "until every score ≥ 8" are right; the course asks for **at least** 3 rounds. #7's playbook says a persona panel beats a 1–10 score; #10 allows at most one critique pass per gate. | Movez course |
| "Crew" prompt (6 roles) + story | **Not confirmed as 6 roles.** The course has 4 (director, animator, sound designer, render engineer). The story part is real ("Film in one line"). | Movez course |
| Ban default looks by name | **Confirmed** for #1, #7 (repo), #10 (CLAUDE.md). | |
| Targeted fixes that lock what works | **Confirmed** for #3 (frame comments), #5 (Anthropic: "change one detail and the rest stays the same"), #10 ("Keep … unchanged"), #12 ("keep everything else intact"). | |
| Paid/hosted parts | Claude Motion = Anthropic beta (2026-10-08), **Team/Enterprise only**, uses plan usage. Higgsfield MCP/CLI charges credits. Fish Audio TTS ≈ $15 per 1M UTF-8 bytes (sponsor of #1). **Pixels MCP: not found anywhere.** None used here. | support.claude.com; vendor pages |

---

## The 10 most useful techniques (copyable), ranked by impact

### 1. Put 90% of the work in a rules file, not the prompt (#1, #7, #10)
Steps: create one rules file with four parts — **Render contract** (pure function of the frame, no timers/CSS transitions, seeded random, encode settings), **Look** (banned defaults by name, one display face + one UI face + one accent, something new every 2–4 s), **Sound** (made in code, on the beat grid, −14 LUFS), **Loop before you show me anything** (contact sheet → score → fix 3 worst → repeat). Start every chat with "Read the rules file and follow it."
→ **Built:** `toolkit/HARNESS.md`.

### 2. Gate the full render behind stills + a scored critique loop (#1, #7, #10, #3)
Steps: render one still per shot/beat → contact sheet → score each 1–10 → fix only the 3 worst → re-render those stills → repeat until all ≥ 8, max 3 rounds → only then render video. Add a hunt list (overlapping text in swaps, sliding instead of easing, dead beats, loop-seam stutter) and a determinism check (render a frame twice, compare hashes).
→ **Built:** `toolkit/critique/critique.mjs` + `score.mjs` (refuses round 4, names the 3 worst, locks ≥ 8 shots with 🔒).

### 3. Make one clock: voice (or BPM) → beats.json → everything (#1, #5, #6, #7, #10, #11)
Steps: VO with word timestamps first (or a BPM grid when there's no VO: frames per beat = fps×60/BPM, computed per index, never accumulated). Write `beats.json` (beats, downbeats/phrases, caption chunks, pops). Drive `<Sequence>` starts, caption chunks, number landings and SFX from it — never hand-typed seconds. Downbeats carry scene changes; beats carry SFX.
→ **Built:** `toolkit/beat-grid/make-beats.mjs` (BPM and VO modes, snap mode with drift report) + hooks `useBeatGrid`, `useCaptionChunk`, `usePop`, `useShot`.

### 4. Write the shot list as *states on the beat grid* and get approval before code (#1, #6, #7, #10, #12)
Steps: one row per shot: start/end frame on a beat, the one on-screen action, the state at the end, the caption chunk, SFX cues. Show it, wait for "go". Futurepedia's "storyboard-first" mode and James B's "plan a 5-scene ad with durations" are the same gate.
→ **Built:** `toolkit/beat-grid/shotlist.schema.json` + zod validation (contiguous, no overlaps, 3–5-word captions, known SFX ids).

### 5. Steal the grammar of a reference, measured, not described (#1, #3, #5, #9, #12)
Steps: frames every 0.5 s → contact sheet → write `style-guide.md` (palette hex, type, shot lengths, transitions, camera, grain, how text enters/exits) → "Figure out what makes this video good" (Nas) → take the grammar, never the content. James B generates 3 style-guide options and picks one, then reuses it: "using Remotion and my style guide, build X".
→ **Built:** `toolkit/scripts/style-guide-from-reference/` (measured palette, scene-cut shot lengths with fallback, visual-change events, template).

### 6. Ban the generated look by name (#1, #7, #10)
Steps: list the defaults in the rules: centred title on a gradient, everything fading in, corner labels/frame borders, glow on UI chrome, generic particle bursts, purple-blue gradients, emoji as graphics, plain crossfades, bouncy easing, dead time, logo-only endings. After each round, add new tells you spot.
→ **Built:** HARNESS §2 (+ the channel sheets).

### 7. Synthesise sound in code on the same timeline (#1; #10 in Python)
Steps: render/synthesise a music bed at the reel's BPM; place SFX so their **peak** lands on the visual hit; one cue per visible cause, ≤ 1 per 2 s; bed ducked under VO; mix to −14 LUFS. Nate's taste rules: sound only on visible actions, no whoosh on every cut, no laser/zap sounds, vary repeated sounds.
→ **Built:** `toolkit/sfx/synth.mjs` (8 sounds, deterministic, own licence), `music-bed.mjs`, `<SfxCue>`/`<SfxTrack>`/`<MusicBed>` with ducking.

### 8. Targeted fixes that lock what works (#3, #5, #10, #12)
Steps: every fix prompt names the shot/frame, the problem, the exact change, and "keep everything else unchanged". Keep copy, numbers, colours and timings in props/JSON so a fix is a data edit. Higgsfield's per-frame comments and Ajené's review app are the UI for this.
→ **Built:** the fix-prompt template in HARNESS §4; critique carries locked shots forward.

### 9. Give Claude working code as the style reference, not adjectives (#6, #12, #7)
Steps: keep one finished scene per look and put it in the skill/prompt as the canonical example (Futurepedia pastes the style's full source + sound kit). Nate writes a MOTION_PHILOSOPHY.md from one loved reference with a dictionary of eases and durations.
→ **Built:** the two example compositions (`toolkit/examples/`) are the canonical scenes for each channel.

### 10. Budget and model routing (#9, #11, #1)
Steps: build with the strongest model at high effort, switch to a cheaper one for small edits (Nas); keep pieces ≤ 30 s while iterating (~9% of a Pro session per 10–15 s, Nas); say in the rules whether paid APIs are allowed — Gauri reports Claude spent API keys on its own for SFX/music.
→ **Built:** HARNESS bans paid APIs by default; sounds are local.

---

## What to change in a Remotion reel pipeline (ranked, biggest first)
1. **Load `toolkit/HARNESS.md` first in every reel chat**, and grow it after every critique round. (Technique 1)
2. **No video render until the critique loop passes** (all shots ≥ 8, ≤ 3 rounds), and log every round. (2)
3. **Generate `beats.json` from the VO (or BPM) before building**, and time every caption, number and SFX from it with the hooks — delete hand-typed frame numbers. (3)
4. **Approve the shot list (states on the beat grid) before code.** (4)
5. **Run `style-guide-from-reference` on 1–3 references per series** and keep the filled style guide next to the episode. (5)
6. **Enforce the look bans + one display face, one body face, one accent** per channel. (6)
7. **Use the synthesised SFX/bed with peak-aligned cues and ducking**; −14 LUFS. (7)
8. **Fix prompts name shots and lock the rest; keep content in props/JSON.** (8)
9. **Treat each example composition as the channel's canonical scene** and point new episodes at it. (9)
10. **Cap iteration length at ≤ 30 s and route small edits to a cheaper model.** (10)
