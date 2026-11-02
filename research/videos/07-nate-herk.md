# 07 — Nate Herk | AI Automation, "Claude Just Destroyed Every Video Editing Tool"

| Field | Value |
|---|---|
| Title | Claude Just Destroyed Every Video Editing Tool |
| Channel | Nate Herk \| AI Automation (https://www.youtube.com/@nateherk) |
| URL | https://www.youtube.com/watch?v=ZNbgOhxhzXg |
| Published | **2026-04-18.** Nate's own Skool post announcing the video is dated Apr 18. That is one day after Claude Design launched (Apr 17, 2026). |
| Length | about 32:00 **[U]**. This comes from a search-result snippet of the aggregator vigyata.ai, which I did not open. yt-dlp metadata was blocked for this video. |
| Products used | **Claude Design** (claude.ai/design) and **Claude Code + HyperFrames** (HeyGen's HTML→MP4 framework), per Nate's own Skool post. This predates Claude Motion, which launched Oct 8, 2026. |

## Sources used (all accessed 2026-11-02)

| Source | Type | Result |
|---|---|---|
| `yt-dlp --write-auto-subs` | transcript | **Blocked** (bot check) |
| `yt-dlp --dump-json` | metadata/description | **Blocked** (bot check; this video only) |
| `youtube-transcript-api` | transcript | **Blocked** (`IpBlocked`) |
| oEmbed | title/channel | Worked |
| Thumbnail `https://i.ytimg.com/vi/ZNbgOhxhzXg/maxresdefault.jpg` | thumbnail | Worked (viewed) |
| https://www.skool.com/ai-automation-society/new-video-claude-just-changed-video-editing-forever | **creator's own post** (public) | Worked: date, two methods, short description |
| https://github.com/nateherkai/herk-edit-kit (shallow clone, commit `10511e5`, 2026-10-14) | **creator's own repo** | Worked: README, CLAUDE.md, MOTION_PHILOSOPHY.md, docs/EDITING-PLAYBOOK.md, skills, project folders |
| `/home/user/research/research/01b-remotion-skills-and-frameworks-verbatim.md` §5 | earlier digest of the same repo | Read; consistent with the clone |
| Frames from the repo's own rendered `final.mp4` files (first-agent-promo, hyperframes-sizzle, claude-edit-intro), one every 3 s, tiled | **frames of the creator's outputs, not of the YouTube video** | Worked (viewed) |
| Web search ("Claude Just Destroyed Every Video Editing Tool") | write-ups | Found the Skool post plus aggregator and summary sites. I did **not** open summyt.app, vigyata.ai or the vids-…pages.dev "transcript" page, because they are third-party summary or transcript sites. |

**There was no transcript and no frame from the video itself.** The repo is Nate's, but it was last updated in Oct 2026, six months after the video. Its April-dated projects are very likely the video's examples, but that link is **[U]**.

## Creator's own words (Skool post, Apr 18)

- "Video editing just changed forever."
- Two methods: (1) **Claude Design** "for building custom motion graphics through conversation"; (2) **Claude Code connected with Hyperframes**, a more advanced workflow with deeper customisation so outputs match a brand's tone and style (paraphrased).
- The post lists no repos or prompts.

The search snippet also gave these chapter topics: Claude Design examples, HyperFrames setup, live editing with feedback, and cost and speed **[U]**.

## The method, step by step

### Method A — Claude Design (no code)

The evidence is a Claude Design handoff bundle in Nate's repo: `video-projects/first-agent-promo/_design/first-agent-release-video/`, chat "_Started 2026-04-18 12:42 UTC_", the same day as the video. That it was shown in the video is **[U]**.

1. Open Claude Design and **drop in a source file.** Here it was the standalone HTML of his workshop landing page.
2. **Prompt** (his first message): "Create me an animation for the first AI agent promotion. I dropped in the standalone HTML for this launch." The rest of the message asks for motion graphics and visuals that explain what's going on, and for a "fast-paced and engaging" feel.
3. Claude Design reads the page, pulls out the content and brand (dark, blue/teal gradients, orange accents) and writes a **story-arc plan** of 9 timed beats over 32 s, roughly 2.5–5 s each: logo flash → question → title slam → 3-day agenda → mock Claude Code terminal → stat counters → date and price → CTA.
4. It builds the piece as HTML/JSX scenes and **screenshots key moments to check itself.** It found 3 problems ("300,000+" overflowing its column, a sparse terminal, a card missing at 25.5 s), **fixed only those** with targeted string-replace edits, and re-screenshotted ("All three look much better").
5. **Export:** Claude Design has no MP4 button. When Nate asked how to render it, the answer offered screen recording (QuickTime/OBS), or a "frame-perfect" Puppeteer + FFmpeg capture that steps `time = 0 → 32` at 1/60 s, or online services. The repo's `final.mp4` for this project is 1920×1080, 30 fps, 32 s.

### Method B — Claude Code + HyperFrames (+ his skills)

The evidence is the repo, which describes itself as "Formerly the HyperFrames Student Kit". Its project specs are dated 2026-04-17. Exactly what was shown on screen is **[U]**.

1. **Install:** Node 22+, FFmpeg, Chrome; `git clone https://github.com/nateherkai/herk-edit-kit`; `npm ci && npm run setup`. Skills live in `.claude/skills/`. There are 15: cut-mistakes, cut-silences, edit-video, gsap, hyperframes, hyperframes-cli, hyperframes-registry, hyperframes-video-beats, make-a-video, motion-showreel, short-form-edit, short-form-video, style-library, video-storytelling, website-to-hyperframes.
2. **Reference → philosophy doc.** He deconstructed one reference ad (the "Infinite — Global Payments" 30 s spot) into `MOTION_PHILOSOPHY.md`: 11 Laws, a visual vocabulary, GSAP recipes, a pre-flight checklist and anti-patterns. CLAUDE.md says to read it, and the project's DESIGN.md, "Before a creative session".
3. **Brief → spec → plan.** `docs/superpowers/specs/2026-04-17-linear-promo-design.md`, "Author: Nate + Claude", has a beat-by-beat narrative timeline, visual direction, asset strategy, a risk register and a verification plan. The `make-a-video` skill puts this into gates: an interview (intent, audience, duration, aspect ratio, fps, platform) → `BRIEF.md` → hard approval gate → scaffold → storyboard → build → lint → preview → draft render → visual verification → final render.
4. **Build:** HyperFrames HTML compositions with one paused GSAP timeline per composition (`window.__timelines`), timed `.clip` elements with `data-start` / `data-duration`, and deterministic code (no `Math.random`/`Date.now`, no `repeat:-1`).
5. **Render:** `npx hyperframes lint` → `npx hyperframes preview` → `npx hyperframes render --quality draft` → frame check → `--quality standard`.
6. **Live editing with feedback** (a chapter topic **[U]**). His playbook: "You watch it and say what you don't like, in plain words", and "every note becomes a rule in a skill".

## Prompts shown

- Claude Design (repo chat, Apr 18): "Create me an animation for the first AI agent promotion. I dropped in the standalone HTML for this launch." The rest asks for motion graphics that explain, fast-paced and engaging.
- Follow-up: "This looks great. Now how would I render this into an actual MP4?"
- README prompt for the kit: "Use edit-video to edit my recording at [local path]. Keep my examples and core lessons…" The rest asks it to tighten dead air, propose mistake cuts, and use the dark graph-paper style.
- README showreel prompt: "Use motion-showreel to make a 15-second showreel for [brand]… Pick one motif that transforms through every chapter, cut on the music's beat grid…" The rest asks for a storyboard and beat sheet first, and a confirmation before paid calls.

Whether any of these appear on screen in the video is **[U]**. The README prompts were written after the video.

## Tools, MCPs, skills and repos named

- **Claude Design**: https://www.anthropic.com/news/claude-design-anthropic-labs (launched Apr 17, 2026; Pro, Max, Team, Enterprise)
- **Claude Code**
- **HyperFrames** (HeyGen, Apache-2.0): https://github.com/heygen-com/hyperframes
- **GSAP** (animation timelines)
- **herk-edit-kit**: https://github.com/nateherkai/herk-edit-kit (about 2.5k★; licence NOASSERTION)
- **Superpowers-style spec/plan docs** (`docs/superpowers/`). Whether the Superpowers plugin was used is **[U]**.
- Paid services used by the kit (all optional): **ElevenLabs** (Scribe transcription and sound-effect generation), **Kie.ai** (music generation, Seedream image-to-image, Kling image-to-video). Bring your own keys and credits.

## Timing and sound tricks (from the repo; that they were in the video is **[U]**)

- **Pacing laws** (MOTION_PHILOSOPHY): "One idea per beat. Cut fast. Avg scene ≈ 1.5s". New element every 0.3–0.6 s. No dead air over 1 s. Logo hold 1.5–2 s; CTA 4–6 s. A 1 s rest every 7–8 s.
- **Text in and out:** word-by-word, not letter-by-letter. Word reveal uses `expo.out` over 0.20–0.33 s; exits use `power2.in` over 0.2–0.33 s. In a "carrier" reveal, the first word slides 360 px and later words slide less (360→120→60→25→12 px). On punchlines, the visual leads the audio by 0.2 s. A slam or stamp lands at least 0.10–0.25 s *after* its target text is fully visible.
- **Transitions:** "every cut hides inside a motion-blurred whip". Exit with `y:-150, blur 30px` over 0.33 s; enter from `y:150` over 1.0 s, with velocity matched at the cut. Never two transitions of the same type in a row. "No hard fades".
- **Beat grid (motion-showreel skill):** 120–130 BPM. "Every hard cut, flash, and invert lands within 2 frames of a grid line". Times come from `const B = (n) => n * PERIOD`. 15 s = 32 beats (75% development, 13% flurry, 12% resolve). The README example is "15 seconds, 1920x1080, 60fps, cut to a 129 BPM grid".
- **Music and SFX tooling:** `music-grid.mjs` measures BPM and the kick-band phase, `splice-music.mjs` cuts a bed to the grid, `beatgrid.mjs` prints a frame sheet, cues go in an **`events.json`**, and `mix.mjs` premixes to `master.wav` at −14 LUFS / −1.2 dBTP. SFX come from **ElevenLabs sound generation** (`sfx.mjs`: "PAID calls: confirm with the user first") or your own library. They are **not synthesised in Node.** (One April spec gives "ffmpeg sine synthesis" as a fallback for a drone pad.)
- **Mix levels:** voice 1.0, warm pad 0.15, SFX 0.2 (MOTION_PHILOSOPHY). Per the playbook, the music bed sits about 11 dB under the voice.
- **SFX taste rules:** "Sound effects follow visible actions, not every cut": a soft air whoosh on a spatial move, a damped tap when a logo lands, a dry click for small UI. "Avoid laser zaps, pitch-drop plops, sci-fi chirps, and a whoosh on every cut." Vary the sound files for repeated items.
- **Narrated explainer:** "Put the whole timeline on one clock (a beat grid) so picture, music, and sound effects all move when a line changes."

## What the result looks like

- **Thumbnail:** "It's over." in big white sans on black. A glowing Claude-orange app icon wears a gold crown over cracked ground, with DaVinci Resolve and After Effects icons shattering on either side.
- **Claude Design output** (frames of the repo's `first-agent-promo/final.mp4`): near-black navy background with a faint blue glow; a heavy condensed mono-style display face in white, with keywords in cyan/teal and orange (e.g. "YOUR FIRST **AI AGENT**", "CLAIM YOUR **SEAT**"); numbered cards (01/02/03); a mock terminal; big stat counters; an orange "$20" sticker; a cyan pill CTA; and a persistent corner badge plus a bottom marquee ticker.
- **HyperFrames output** (frames of `hyperframes-sizzle/final.mp4`, 75 s): a dark navy HUD with chapter labels at top left ("01 COLD OPEN", "02 KINETIC TYPE", "AUDIO REACTIVE", "WEBSITE → VIDEO"); one huge bold sans line per beat ("WRITE HTML." / "RENDER VIDEO." / "BUILT FOR AGENTS.") with one blue or orange keyword glowing; a value flip to a cream bar chart ("Hours to ship a 90-second video": Premiere 6.5 h vs HyperFrames ~13 min); tilted phone mockups; and a circular audio-reactive ring with an "80 BPM" readout.
- **Talking-head edit** (`claude-edit-intro`, 60 fps project): face-cam footage with glass cards and on-screen text, then a dark split layout with a face-cam inset and big "Natural language." / "No code required." headlines in white with a peach/orange gradient.

## Useful for our Remotion pipeline

- **Write a project-level motion philosophy file from one reference you love,** with laws, a code dictionary of eases and durations, and a pre-flight checklist. Make Claude read it before every build. Nate's MOTION_PHILOSOPHY §4.1 maps directly onto Remotion `Easing.bezier` and `spring` values.
- **Put everything on one beat clock:** `B(n) = n * 60/BPM`, snapped to frames. Hard cuts land within 2 frames of a grid line; motion happens on the off-beats. Keep SFX cues in an `events.json` keyed to beats and premix to one master WAV at −14 LUFS.
- **Use a frame-check gate** (as in his Claude Design chat and the kit): render stills at key moments (`npx remotion render --frames=…` or `still`), read them, fix only the named problems with targeted edits, re-check, and keep the evidence in `VERIFY.md`. Use 10-frame strips across every transition to catch ghost layers.
- **SFX taste rules worth copying verbatim:** sound only on visible actions; no whoosh on every cut; no laser or zap sounds; vary repeated sounds. Our SFX can be synthesised in Node; his are ElevenLabs-generated (paid).
- **Gated `make-a-video` flow:** interview → BRIEF.md → approval → storyboard → build → verify. Good for avoiding restarts.
