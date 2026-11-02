# 00 — Summary: the 10 changes to make, ranked

Research date 2026-11-02. Eight research agents, ~600 sources (208 opened and read), three full video transcripts, and a working kit built and test-rendered in this repo. Plain-English version of what matters. Detail and sources are in files 01–05; the ready-made setup is in [`../setup/`](../setup/).

**What you asked for and where it is**

| Want | File |
|---|---|
| Ready-made Claude Code + Remotion setup (CLAUDE.md, skills, brand files, components, QA scripts, review app, voice/sound tools, two rendered demo episodes) | `setup/` — start with `setup/README.md` |
| Copy-paste prompts + step-by-step recipes for one Signal reel and one Q-ROSITY reel, plus pre-render checklist | `04-PROMPTS.md` |
| Ajené Pinnock video, step by step, with every prompt quoted | `01a-ajene-pinnock-editing-system.md` + `transcripts/` |
| How the best creators make motion reels with Claude (methods, numbers, ranked creators) | `01-claude-motion-reels.md` |
| The actual rule files (Remotion official skills, HyperFrames, others) word for word | `01b-remotion-skills-and-frameworks-verbatim.md` (13,590 lines) |
| Blocky character in code, with working source and stills | `01c-qrosity-blocky-character.md` + `qrosity-character/` |
| What grew channels, with numbers | `02-growing-with-claude.md` |
| End-to-end automation: repos, MCP servers, API limits, costs, what breaks | `03-automation-pipelines.md` |
| Every link, verified/unverified | `05-sources.md` |

---

## The 10 changes, ranked by expected effect on your first-draft score

### 1. Put the rules in files Claude reads every session, and make every review note a new rule
Your drafts take many rounds because each round's fixes evaporate. Every strong setup we found (Ajené, hassancs91, paper-reel, HyperFrames, haidrrrry) does the same thing: a `CLAUDE.md` with hard rules, a `brand.md` with the look as numbers, skills with the recipe, and a habit of appending each fix to those files. Ajené says this took one video from **15 prompts to 2** ([01a](01a-ajene-pinnock-editing-system.md) §1, [V3] 21:41). paper-reel: "Every fix became a line in SKILL.md… Without that, you are the QA department" ([01](01-claude-motion-reels.md) §2.4).
**Done for you:** `setup/CLAUDE.md` (R0–R10), `setup/channels/*/brand.md`, `/review-loop` skill with the "save to skill" routine.

### 2. Make Claude look at its own stills before you ever see a render
Render phone-scale PNGs at frame 0, every beat boundary and every number landing; read them; fix; repeat at least twice; only then render video. hassancs91: "QA is not optional… it catches real bugs every time." HyperFrames ships `snapshot --review`; herk-edit-kit makes it a hard gate ("Lint passing ≠ design working… READ every PNG") ([01b](01b-remotion-skills-and-frameworks-verbatim.md) §4–5). The kit builder agent fixed nine layout bugs in the demo this way before any video existed.
**Done for you:** `npm run frames -- <Comp> beats --scale=0.5` + contact sheet, `/frame-qa` skill with a 100-point rubric and fail thresholds.

### 3. Turn every adjective into a number before writing code (SPEC + BANNED list)
"Premium", "clean", "dynamic" are where the generic AI look comes from. HyperFrames' spec rule: "Every adjective you turn into a number is a decision taken back from those defaults." Their BANNED-by-default list is the exact list of things that make a reel look generated: dark-navy void with small floating elements, glow/particles, purple-blue gradients, glass cards, three cards in a row/KPI grids, everything fading up, docked logo, titles that drift after landing ([01](01-claude-motion-reels.md) §3.2).
**Done for you:** SPEC template and BANNED list in [04](04-PROMPTS.md) §1 step 2; `/reel-design-rules` holds the numbers.

### 4. Let the voice be the clock: generate VO with word timestamps first, cue every visual from a real word time
Caption drift and "the number landed before the word" are sync bugs, and sync is 15 of 100 points in the rubric. ElevenLabs `/with-timestamps` gives per-character times; hassancs91's rule is "one animated quantity per spoken number, each landing on its own word," and his money-math short had to be retimed for exactly this ([01](01-claude-motion-reels.md) §0 item 5, §5). Keep VO at ~2.5–2.8 words/s; 3.3 w/s forced an audible 1.3× squeeze.
**Done for you:** `tools/gen_voice.py` (with `--mock` when there is no key) → `vo.gen.ts`; the kit's `Captions` and every cue use `toLocal(wordSecond, sequence.from)`.

### 5. Frame 0 is the thumbnail and the hook; one number per beat, the biggest thing on screen
Never open on black or a logo; the hook text (≤ 6 words) and the hero number are already landed at frame 0. One number at a time, `tabular-nums`, count-up 1.2–1.6 s then hold, with a source line on screen. Charts: axis → reference line → data → one annotation; no legends, no pie charts, never every number counting at once ([01](01-claude-motion-reels.md) §3.2 data.md, §4.5).
**Done for you:** `Counter`, `PriceTag`, `BarChart`, `LineChart`, `SourceLine`, `BigTitle` components; R2/R6/R8 in CLAUDE.md; `facts.json` contract.

### 6. Motion rules with numbers: entrances 0.3–0.6 s, exits 40–60% shorter, no overshoot, landed text dead still
Measured frame-by-frame from HyperFrames' launch films and matched by LottieFiles and haidrrrry: ease by role (arrivals long tail, exits accelerate), stagger words 60–120 ms / items 40–80 ms, total stagger < 500 ms, springs with damping ratio ≥ 0.7 for a premium feel (Remotion `spring()` default bounces: use `damping: 200`), hold a line 0.5 s + 0.3 s per word, last line ≥ 2 s, something new every 2–4 s, one hero move per shot ([01](01-claude-motion-reels.md) §4.4; [01b](01b-remotion-skills-and-frameworks-verbatim.md) motion.md). Remotion's own skill: derive every frame count from `fps` (critical at 60 fps), keep `interpolate` inline and clamped, use `scale/translate/rotate` not `transform`.
**Done for you:** `EASE`/`SPRING` presets, `holdFrames()`, R3/R7; official `remotion-*` skills installed in `setup/.claude/skills/`.

### 7. Sound: every cue has a visible cause, few cues, timed to the frame, music ducked
Whoosh starts 6–8 frames before the cut and peaks on it; pop on the counter snap; one riser→impact per hero reveal, at most 2–3 per reel; music −18 to −25 dB under the voice; mix ≈ −14 to −16 LUFS, true peak ≤ −1 dBTP (common practice; platforms publish no numbers). Ajené's live notes were mostly sound: "I can barely hear those sound effects", "music 25 dB under my voice" ([01a](01a-ajene-pinnock-editing-system.md) §3; [01](01-claude-motion-reels.md) §5).
**Done for you:** `/sound-design` skill, `tools/mix_sfx.py`, `tools/mix_music.py` (sidechain duck + two-pass loudnorm), `tools/check_audio.py`, SFX catalog schema.

### 8. Q-ROSITY: a procedural box-limb rig in `@remotion/three`, driven only by the frame, with "takes" for mood changes
No assets to load, deterministic, re-colourable, ~330 lines; renders at 60 fps (measured 0.36–0.39 s/frame on a 4-vCPU box with no GPU; `--gl=swangle` there, `angle` on a desktop). What made the first render look good: 9:16 camera maths (camera ≥ 9 m back at 36° vertical FOV, look-at y 1.7), warm key + cool fill + orange rim from behind on a dark fogged ground, inverted-hull outline on the character only, decals raised 6–8 mm off faces, explicit arm-rotation sign rules. Character acting rules from HyperFrames `character.md`: a mood change goes through anticipation → squash → new face → settle; head leads, arms follow; never both arms in unison; feet on the ground ([01c](01c-qrosity-blocky-character.md); [01](01-claude-motion-reels.md) §8). Keep the character original (no Minecraft/Roblox names, logos or assets).
**Done for you:** the rig and stage live in `setup/remotion/src/lib/character/` (`BlockyCharacter.tsx`, `Stage3D.tsx` with camera presets hero/pushIn/orbit/lowAngle); a 30 s demo `QrosityVolcano` (`qrosity-001-volcano`) rendered at 60 fps, 0.35 s/frame with no GPU, stills in `setup/episodes/qrosity-001-volcano/qa/frames/`; the `/make-qrosity-reel` skill; and the character spec in `setup/channels/q-rosity/brand.md`. Original prototype: `qrosity-character/`.

### 9. Growth: one public post a day, extra volume into Instagram Trial Reels as hook variants, CTA to a freebie not a sale
Posting more raises your odds of an outlier, not your typical result (Buffer, 11.4M TikToks: 11+ posts/week → p90 views 3.7k → 14.4k, median flat). Trial Reels test on non-followers with metrics at 24 h; Mosseri: different trials per day are fine, identical reposts are not. Ajené's two methods: remake your winners the same day (5–7 variants, reordered openings) and record 3 hooks over one body; always CTA to a lead magnet, never a direct sale (he says selling directly cost him "10,000–20,000" emails). Instagram's top ranking signals for non-followers: watch time, likes per reach, **sends per reach** ([02](02-growing-with-claude.md) §TL;DR, §4, §9; [01a](01a-ajene-pinnock-editing-system.md) §2). Reels 45–60 s had the highest average views in 2026 data; TikTok rewards > 60 s; Shorts data conflicts, so test.
**Protocol:** [02](02-growing-with-claude.md) §9 (weekly plan, 2 hook variants per piece, winner = lower skip rate and ≥ 1.3× views, hook library after 20 tests). The kit's `publish.json → altHooks` and the variants prompt in [04](04-PROMPTS.md) §1 step 6 produce the variants.

### 10. Automate the boring half, keep three human gates, and design around the platform rules
Automate: analytics pull, idea scoring, facts gathering, script draft, build, QA stills, draft render, packaging, scheduling. Keep human: picking ideas/hooks, signing off numbers, a 2-minute phone watch before posting, community replies. Hard facts that shape the pipeline: TikTok will not audit a personal upload tool (unaudited apps post private-only) → post to TikTok through an audited scheduler (Postiz Cloud, Upload-Post, Metricool, Buffer, Ayrshare); YouTube API uploads now have their own 100/day bucket; Instagram's API supports Reels and Trial Reels (`trial_params`); YouTube's July 2025 "inauthentic content" policy demonetizes "characters in the same situation over and over with the same outcome" and "generic or unoriginal templates", so vary Q-ROSITY's scenario, setting, outcome and twist per episode and log them. Costs at 1 video/day per channel: ~$60–70/month lean, ~$160–185/month with Claude Max + ElevenLabs Creator + a scheduler + music ([03](03-automation-pipelines.md) §0, §5–7).
**Reference architecture, folder layout, hooks that block posting without an `APPROVED` file:** [03](03-automation-pipelines.md) §1.

---

## Things we could not pin down (be careful with these)

- **Safe-zone pixels** differ by source (Meta 35% bottom ≈ y 1250; hassancs91 captions y≈1500; HyperFrames text band 168–1330). The kit uses captions at y 1380 as a compromise. Check once against a screenshot of your own account on each app and set `SAFE.captionY`.
- **No audience numbers for any of the "good" creators' prompts.** Rankings in [01](01-claude-motion-reels.md) §9 are by documented craft; YouTube, X and Reddit blocked the agents (bot checks, 402, 403), so no videos were watched and no community threads read. Ajené's on-screen prompt at ~7:06 was unreadable (video download blocked); his free skill is email-gated and was not signed up for.
- **Loudness targets and trial-reel thresholds** are common practice / our protocol, not platform-published.
- **YouTube's "uploads from unverified API projects are private-only"** rule: the current reference says it no longer applies, the revision history still lists it. Test with one upload.
- **Instagram API post limit:** 100/24 h in one section of the official page, 50 in another.
- **Render speed on a GPU desktop** for 60 fps 3D: unmeasured (only the no-GPU cloud box was measured).
- **"Claude Motion"**: third-party blogs describe a Team/Enterprise-only beta; not verified on an Anthropic page. Anthropic's official skills repo has no video/motion skill.
- **IP risk** of a blocky character style near Minecraft/Roblox was not researched; the character here is original, but check before monetizing.
