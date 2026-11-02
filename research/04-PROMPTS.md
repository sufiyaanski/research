# 04 — Copy-paste prompts and recipes (Signal reel + Q-ROSITY reel)

Everything here runs against the ready-made kit in [`../setup/`](../setup/). The kit is real code: it type-checks, renders at 1080×1920 @ 60 fps, and ships two demo episodes with their QA stills (`setup/episodes/*/qa/frames/`). The prompts below are the exact text to paste into Claude Code. Where a number comes from a source, the source is in `01-claude-motion-reels.md` §3–5 and `01b-…verbatim.md`; where it is our own choice it is marked **[ours]**.

**Why this works when your current drafts don't** (the three findings that matter most, from the research):
1. **Rules live in files Claude reads every session, not in the prompt.** `CLAUDE.md` (hard rules R0–R10), `channels/<channel>/brand.md` (look), `.claude/skills/*` (numbers, recipe, QA). HyperFrames, hassancs91, paper-reel, haidrrrry and Ajené all converge on this: every fix becomes a line in a rule file.
2. **Claude looks at its own stills before you do.** Phone-scale PNGs at every beat boundary, read and fixed at least twice, before any video. ("Without that, you are the QA department." — paper-reel write-up.)
3. **Every adjective becomes a number before code.** "Premium" → entrance 18 frames, no overshoot, one accent on one word. The SPEC block in §2 forces this.

---

## 0. One-time setup (5 minutes)

```bash
git clone <this repo> && cd research/setup
npm install
npm run typecheck
# optional live preview:
npm run studio          # http://localhost:3000
# then, in setup/:
claude
```
- Needs Node ≥ 20 and `ffmpeg`/`ffprobe` on PATH. Remotion downloads its own headless Chrome on first render.
- No GPU (cloud box, CI)? Add `--gl=swangle` to `frames`/`render` for the 3D Q-ROSITY episodes. On a desktop with a GPU, the default `angle` is faster.
- Behind a corporate proxy: `REMOTION_IGNORE_CERT_ERRORS=1` (Google Fonts are fetched inside Chrome).
- Voice: put `ELEVENLABS_API_KEY=...` in `setup/.env` when you have it. Until then `tools/gen_voice.py --mock` fabricates timings so everything still renders.

**Session kick-off prompt** (paste first in every new Claude Code session in `setup/`):

```text
Read CLAUDE.md, channels/the-signal/brand.md and channels/q-rosity/brand.md, then the skills
/make-signal-reel, /make-qrosity-reel, /reel-design-rules, /frame-qa, /review-loop,
/script-writing, /voice-captions, /sound-design. Also load /remotion-best-practices.
Confirm in ≤ 10 lines: the hard rules you will follow (cite R-numbers), the safe band for text,
the min hold time formula, and the QA gate before any render. Then wait for my episode brief.
```

---

## 1. The Signal — recipe for one reel that scores 80+ first time

Target: 1080×1920 @ 60 fps, 45–70 s, one mechanism + one number + one everyday sighting, loop ending, no CTA outro. Reference implementation: `setup/remotion/src/episodes/signal-001-anchoring/` + `setup/episodes/signal-001-anchoring/`.

### Step 1 — Brief (you write this; 2 minutes)

```text
/make-signal-reel — new episode signal-002-charm-pricing.

Topic: why $9.99 works (left-digit effect).
What I saw: a supermarket shelf where everything ends in .99.
Mechanism to name: left-digit effect / charm pricing.
Numbers I think exist (verify, replace if wrong): Thomas & Morwitz 2005 "Penny wise and
pound foolish" (JCR); Anderson & Simester 2003 field experiments on $9-endings (+~8% to +~24%
sales lift in catalogs, verify exact figures); Schindler & Kibarian 1996.
Hook direction: a contradiction with a number ("$9.99 is not $10. To your brain it's $9.").
Tone: calm, certain, no hype words (no "unlock", "game-changer", "seamless").
Length: 50–60 s. Loop ending. No outro CTA.

Do Stage 1 and Stage 2 only (idea + facts.json). Stop and show me facts.json before any script.
```

Claude returns 3 hook candidates + `episodes/signal-002-charm-pricing/facts.json`. **You check the numbers** (the one place a human must stay in the loop: hassancs91's own guide hit a false line; see `03-automation-pipelines.md` §7).

### Step 2 — Script + beats (Claude; you approve)

```text
Facts approved (or: replace fact #3 with …). Now Stage 3: write script.md (beat table
time | on screen | VO) and remotion/src/episodes/signal-002-charm-pricing/beats.json.
Constraints: VO 110–160 words at 2.5–2.8 words/s; beat grammar HOOK → SETUP → TURN → WHY →
PROOF → EVERYDAY → PAYOFF; the word that names each number is the cue its visual lands on;
frame 0 fully composed with the hook headline (≤ 6 words) and the hero number.
Then run `npm run vo:estimate -- signal-002-charm-pricing` and show me the words/s warning
line, the beat table and the SPEC block below filled in. Wait for "go".
```

**SPEC block** (adapted from HyperFrames `spec.md`; fill every line with numbers, never adjectives):

```text
GOAL:    one sentence: what the viewer believes at the end
OUTPUT:  Remotion, 1080x1920, 60 fps, <N> s = <N*60> frames
LOOK:    ground #0A0C10 (brand), ink #F2EEE6, ONE accent #FFB020 on ONE word/number per beat;
         display Archivo 800 at 112 px / -2% tracking; body Manrope 500 at 64 px;
         medium = price tags, shelf labels, receipts (paper edge, hole + string), soft shadow 0 8 32 rgba(0,0,0,.35)
OBJECTS: <every thing the viewer must recognise without a label: the tag, the shelf, the bar, the wheel…>
MOTION:  enter = EASE.out over 18 f (0.3 s), exit = 11 f, stagger words 5 f / items 3 f;
         springs = SPRING.snappy (no overshoot); counters 1.2–1.6 s then HOLD; landed titles dead still
SHOTS:   one line per beat: frames <from–to>, the ONE hero move, what is read (hold = 0.5 s + 0.3 s/word), SFX, hand-off
BANNED:  dark-navy void + floating small elements; glow/particles/lens flares; purple-blue gradients;
         glass cards; KPI grids / 3 cards in a row / pie charts; everything centred + fade-slide-up;
         logo docked in a corner; titles that drift after landing; breathing/pulsing loops on text;
         Inter/Space Grotesk/Geist as display face; "comment below" outro
QA:      frames to check: 0, every beat start+12, every number landing, every caption change near a reveal, last
```

### Step 3 — Build (Claude, no human needed)

```text
go. Stage 4: build Episode.tsx on the kit only (BigTitle, Kicker, PriceTag, Counter,
BarChart, LineChart, Stamp, SourceLine, Reveal, Backdrop, Captions, ProgressBar). One scene
component per beat in <Sequence> from beatsToFrames; every cue = toLocal(voSecond, from);
at most ONE new episode-specific component. Register in Root.tsx. Run npm run typecheck.
Then Stage 5 without asking: npm run frames -- SignalCharmPricing beats --scale=0.5, READ every
PNG, fix, re-run, read again (≥ 2 rounds). Then pull stills at frame 0, each number landing and
the last frame. Score the /frame-qa rubric. Do not render video until the rubric is ≥ 70 and
Hook, Readability, Sync and Safe zones are all non-zero. Show me the contact sheet and the
rubric with one line per criterion.
```

### Step 4 — Draft render, voice, sound (Claude)

```text
Stage 6: npm run render -- SignalCharmPricing --scale=0.5, then
npm run check -- out/SignalCharmPricing-draft.mp4 --draft.
Voice: python3 tools/gen_voice.py --beats remotion/src/episodes/signal-002-charm-pricing/beats.json \
  --emit-ts remotion/src/episodes/signal-002-charm-pricing/vo.gen.ts [--mock if no key]
(settings per /voice-captions: calm explainer preset). Re-render stills at every number landing
to confirm the visuals still land on the real word times; fix cues if they moved.
Sound: write episodes/signal-002-charm-pricing/sfx-plan.json per /sound-design (cues at exact
landing frames, ≤ 1 cue / 2 s, 2 hero build-and-drops max), then
python3 tools/mix_sfx.py <plan> --print, mix, python3 tools/mix_music.py …, python3 tools/check_audio.py.
Report: duration, fps, integrated LUFS, true peak, A/V offset.
```

### Step 5 — Your review (2–3 minutes on a phone)

Open `setup/review/index.html`, load the draft mp4, press **N** at each problem, score the rubric, click **Copy notes for Claude**, paste:

```text
Review notes (fix all, then re-still at these timestamps, then re-render draft):
[00:07.3] stamp covers the price → move stamp below the tag, keep the rotation
[00:25.5] "ANCHORING" headline arrives 10 frames after the word → land on the word, +3 f max
[00:39.0] wheel labels unreadable at phone scale → ≥ 32 px or drop the labels
[00:48.8] captions duplicate the headline → hideBetween on the hook and payoff beats
Rubric: hook 13, readability 10, oneIdea 9, motion 8, sync 10, pacing 8, sound 7, loop 5, safe 5, brand 4 = 79
```

Then the sentence that makes the next episode better:

```text
save to skill: generalize each of these notes into a rule and append it to
channels/the-signal/brand.md (look/sound) or .claude/skills/reel-design-rules/SKILL.md
(type/motion/layout) under "Learned from reviews", with "signal-002" as provenance.
Show me the diff.
```

### Step 6 — Final + variants for trial reels

```text
Final: npm run render -- SignalCharmPricing (scale 1) → npm run check. Fill publish.json
(title ≤ 60 chars, caption, 3–5 hashtags, qa scores).
Trial-reel variants: render 3 versions with the same body and the altHooks from publish.json
(hook text + first VO line only change; frame 0 re-composed for each), named
SignalCharmPricing-HA/HB/HC. Also one 40 s cut-down that drops the EVERYDAY beat.
```
Post the main one publicly; the variants go to Instagram Trial Reels within the same 2-hour window, read at 24 h, winner = lower skip rate and ≥ 1.3× views (`02-growing-with-claude.md` §9.4). Ajené's method: post 5–7 variants the same day a main-feed post takes off; reorder list items so each variant opens differently (`01a-…` §2).

---

## 2. Q-ROSITY — recipe for a "what if" reel with the blocky character

Target: 30–45 s (IG/YT) or 61–70 s (TikTok), 60 fps, original box-limb character on a 3D stage (`setup/remotion/src/lib/character/`), POV escalation ×3, one real number per escalation with a source, consequence, loop line. Reference: `setup/remotion/src/episodes/qrosity-001-volcano/`.

### Step 1 — Brief

```text
/make-qrosity-reel — new episode qrosity-002-ocean-floor.

Premise: What if you walked to the bottom of the ocean?
POV escalation (3 beats, each ends on one real number): 1) 10 m down: pressure doubles →
2) 1,000 m: no light, ~100× pressure → 3) 10,900 m (Challenger Deep): ~1,100 atm, verify.
Consequence: what actually happens to a body (keep it PG; comedic beat allowed).
Loop line: back to the shore, "so… what if?" → frame 0.
Character: the rig in lib/character (pose idle → walk → point → shocked; moods through a
take, never a snap). Camera: push-in on hook, 15° orbit on beat 2, low angle on consequence.
Length 35 s. Facts to facts.json with sources before the script. Stop after Stage 2.
```

### Step 2 — Script + beats

```text
Facts approved. Stage 3: script.md + beats.json. VO 80–100 words, 2.5 w/s, dramatic POV
narrator (second person). Title card on frame 0: "WHAT IF" + the premise line, character
already in frame. A cut every 2–4 s; a new visual every 1.5–3 s. SPEC block filled
(LOOK: brand.md q-rosity palette; MOTION: character takes = anticipation 6 f → squash 4 f →
new face → settle 12 f; camera moves power2.inOut 1.2–2 s; BANNED: both arms moving in unison,
text over the face, captions over the title card). Wait for "go".
```

### Step 3 — Build + QA

```text
go. Stage 4–5: Episode.tsx = <ThreeCanvas width height> with Stage3D + BlockyCharacter
driven only by useCurrentFrame (no useFrame; <Sequence layout="none"> inside the canvas),
2D kit overlays (Kicker, Stamp, SourceLine, Captions, ProgressBar) above it.
npm run typecheck. npm run frames -- QrosityOceanFloor beats --scale=0.5 --gl=swangle
(use --gl=angle on my desktop). READ every PNG: character fully in frame, feet on the ground,
no text over the face, captions in the safe band, one number readable per beat. Iterate ≥ 2×.
Rubric ≥ 70 before any video. Show the contact sheet.
```

### Step 4 — Render, voice, sound, review, save to skill
Same as Signal §1 steps 4–5, with `--gl=…` on renders. Voice preset: "dramatic POV" from `/voice-captions`. Sound: `block-step` on footsteps, `impact-soft` on each number, one `riser-soft → impact-deep-soft` on the consequence.

**Series rule (policy):** rotate `scenario_type`, `setting`, `outcome` and `twist` per episode and log them; YouTube's inauthentic-content policy explicitly demonetizes "characters put in the same situation over and over again with the same outcome", while "a series following a set of characters across episodes" is allowed (`02-…` §6, `03-…` §7).

---

## 3. Prompts for things that go wrong

| Symptom | Paste |
|---|---|
| Looks "AI-generated" (void, glow, cards, everything fading up) | `Apply the BANNED list from the SPEC. Replace: the void → the medium (tags/shelf/receipt texture); glow → a solid plate; cards → one hero object at ≥ 40% of frame height. Re-still frame 0 and the first 3 beats.` |
| Everything moves the same way | `Ease by role: arrivals EASE.out 18 f; camera/colour power2.inOut; exits EASE.in 11 f. Max one hero move per shot; secondary moves 50–70% as far, 6–12 f later. Landed titles dead still.` |
| Numbers don't land on the words | `Regenerate vo.gen.ts from the real TTS timestamps; every reveal cue = toLocal(word.start, sequence.from); land 0..+3 f after the word. Re-still each landing.` |
| Too fast / can't read | `Hold = 0.5 s + 0.3 s per word, last line ≥ 2 s. Cut words, never shrink type (min 28 px, body ≥ 44 px, captions 64–72 px).` |
| Feels like slides | `Enter the next beat through an object already on screen (the tag grows past the frame, the bar becomes the next ground). ≤ 1/3 of seams as hard cuts.` |
| Sound is wallpaper | `Every cue needs a visible cause; ≤ 1 cue per 2 s; whoosh starts 6–8 f before the cut and peaks on it; pop on the counter snap; music −20 dB under VO; mix −14 LUFS / −1 dBTP.` |
| It rendered but you never saw stills | `Stop. R1: stills first. npm run frames -- <Comp> beats --scale=0.5 and read every PNG before touching the render.` |

---

## 4. Pre-render checklist (condensed; full list in `setup/PRE-RENDER-CHECKLIST.md`)

- [ ] `facts.json`: every on-screen/spoken number has a URL, a quote and a confidence. You checked them.
- [ ] `script.md` approved; VO 2.5–2.8 w/s; `vo:estimate` printed no warning; beats contiguous; 45–70 s (Signal) / 30–45 s (Q-ROSITY).
- [ ] Frame 0 fully composed (hook ≤ 6 words + hero number / title + character). No black, no logo.
- [ ] Frame-based only; every `interpolate` clamped; every cue via `toLocal()`; fonts via `fonts.ts`; kit components only (+ ≤ 1 new).
- [ ] Safe band: text in y 270–1250, captions at `SAFE.captionY`, nothing in bottom 340 / right 160 / top 220. Verify once against a screenshot of your own account's Reels UI.
- [ ] Stills: `frames … beats --scale=0.5` read twice; extra stills at every number landing; no clipped/overlapping text; nothing dead > 3 s.
- [ ] Rubric ≥ 70 draft / ≥ 85 final; no zero in Hook, Readability, Sync, Safe zones.
- [ ] Draft mp4 → `npm run check` PASS; review notes fixed; rules saved ("save to skill").
- [ ] Final: 1080×1920, 60 fps, h264; audio ≈ −14 LUFS, ≤ −1 dBTP, A/V offset < 50 ms; loop frame ≈ frame 0; no CTA outro.
- [ ] `publish.json` filled; altHooks rendered for trial reels; nothing in the file that would look like "same video, different numbers" next to the last 10 uploads.

---

## 5. What score to expect, and what is still uncertain

- The demo `SignalAnchoring` self-scored ≈ 75–80 on this rubric after three still-reading rounds, with known gaps (sparse lower band on tag-only frames; captions duplicating the headline on the hook; placeholder VO timings). With real TTS timestamps and one review round it should clear 85. This is our estimate, not a measured audience result.
- Safe-zone pixel values differ between sources (Meta 35% bottom vs hassancs91 y≈1500 vs HyperFrames 1330). The kit uses a compromise (`SAFE.captionY = 1380`); check it on your phone once and set it.
- Loudness targets (−14 LUFS / −1 dBTP) are common practice; TikTok and Instagram publish no numbers.
- Trial-reel "winner" thresholds (skip rate, ≥ 1.3× views) are our protocol; no platform publishes a benchmark, and Ajené gives none.
- 60 fps doubles render time vs 30 fps (3D episode measured at ≈ 0.36–0.39 s/frame on a 4-vCPU box without GPU → ~20 min for 60 s). A GPU desktop should be several times faster (unmeasured).
