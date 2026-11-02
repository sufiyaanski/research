# 01 — Making high-quality motion-graphic reels with Claude

*Research date: 2026-11-02. Written for "The Signal" (Remotion, 1080×1920, 60 fps, 45–70 s, price psychology told with numbers) and "Q-ROSITY" (blocky-character "what if" POV reels made in code).*

**How to read this.** I opened every source marked [V] myself. I did not open anything marked [U]; those come from search snippets or second-hand summaries. Repo stats come from GitHub pages opened with WebFetch. Last-commit dates come from shallow `git clone`s, because `gh api` was blocked for unattached repos in this session.

**Limits of this research:**
- **No YouTube transcripts.** YouTube blocked both the transcript API and yt-dlp with a sign-in/bot check, so I could not pull any.
- **No X posts.** x.com returned HTTP 402.
- **Effect on the creator section.** I describe creators' prompts and workflows from pages that quote them. I could not watch the videos myself, so the ranking is based on documented craft and engagement, not on my own viewing.

---

## 0. TL;DR: the changes that most improve a first draft

These come up again and again across the strongest sources. Do them before the first render.

1. **Write a SPEC before any code, with every adjective turned into a number.** HyperFrames' skill says: "Adjectives are where the default look lives… Every adjective you turn into a number is a decision taken back from those defaults." It provides a GOAL / OUTPUT / TIME / LOOK / OBJECTS / MOTION / SHOTS / BANNED / QA template (§3.2). [V]
2. **Ban the "generated look" by name.** List the defaults in a BANNED line in the spec:
   - a dark navy void with small elements floating in it;
   - glow, particles, purple/blue gradients, glass cards;
   - everything fading and sliding up;
   - three cards in a row or KPI grids;
   - titles that drift after they land;
   - the logo docked in a corner.

   After each render, add any new default you spot to the list. [V HyperFrames spec.md / story.md]
3. **Keep one style contract file that every skill reads**, holding palette hex values, fonts, motion rules, safe areas and SFX taste. Hasan's `brand.md` (§3.5) and HyperFrames' `frame.md`/`DESIGN.md` both work this way. [V]
4. **Frame 0 is both the thumbnail and the hook.** It is fully composed, with the payoff already visible. Never open on black or on a logo. [V Hasan make-short; HyperFrames vertical.md]
5. **Let the voice be the clock.** Generate the voiceover first with word timestamps (ElevenLabs `/with-timestamps` or Whisper). Then cue every reveal from real word times, never from estimates. Hasan's money-math short had to be retimed because the curves showed the wrong values under the words that named them. His rule: "one animated quantity per spoken number, each landing on its own word." [V]
6. **Show one number at a time, and make it the biggest thing on screen.**
   - Use `tabular-nums`.
   - Count up for 1.2–1.6 s, then hold.
   - Never run every number counting at once, and always show a source line.

   [V HyperFrames data.md]
7. **Make holds part of the design.** A line the viewer must read holds for 0.5 s + 0.3 s per word, and the last line for at least 2 s. A landed title stays dead still. [V HyperFrames motion.md]
8. **Exits are shorter than entrances.** HyperFrames says 40–50% shorter; LottieFiles says exits take 65–75% of the entrance. Start the next element when the previous one is 30–50% done. [V]
9. **Give every sound effect a cause on screen, and keep them few.** Place each clip so its peak lands about 1 frame after the visual hit. Hits sit 3–6 dB over the music bed. Rotate 2–3 takes of any repeated sound. Mix to −16 to −14 LUFS with true peak ≤ −1 dBTP. [V HyperFrames sound.md]
10. **Make the agent look at its own output before you do.**
    - Render stills at beat boundaries at phone scale.
    - Make contact sheets.
    - Run automated checks for text overflow, safe zones, determinism and loudness.
    - Turn every fix into a new line in the skill file.

    [V Hasan, paper-reel, HyperFrames review.md, vidtsx]
11. **Match a reference rather than describing a vibe.** Sample frames from a reference reel with ffmpeg, measure its palette, grid, type and rhythm, and encode that as a kit. paper-reel's `style.md` says "Matched from a reference reel by sampling its frames." HyperFrames supports `snapshot --against ref.mp4`. [V]
12. **For 3D in Remotion, drive everything from `useCurrentFrame()`.** `useFrame()` is forbidden, and so are self-animating shaders or models (they flicker on render). [V remotion-dev/skills 3d.md]

---

## 1. Tools overview

| Tool | What it actually is (verified) | Status / stars / last commit | Relevance |
|---|---|---|---|
| **Remotion** (`remotion-dev/remotion`) | React framework for making videos programmatically. Free for individuals and for-profit orgs with ≤3 employees; a company license is needed above that ([LICENSE.md](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md)) [V] | 69.9k★ / 5.8k forks; last commit 2026-11-02 ("v4.0.540") [V] | Your current stack for The Signal |
| **Remotion Agent Skills** (`remotion-dev/skills`) | Official Agent Skills: 13 skill folders, version 4.0.540. Install with `npx skills add remotion-dev/skills`, `gh skill install remotion-dev/skills`, or `npx remotion skills add` from inside a project [V] | 6.1k★ / 674 forks; last commit 2026-11-02 ("Update template") [V] | Must-have |
| **Remotion hosted MCP** | **Shut down Oct 26, 2026.** Remotion says to use the `/remotion-docs` skill instead ([docs/ai/mcp.md](https://www.remotion.dev/docs/ai/mcp.md)) [V] | Dead | Remove it from your config |
| **HyperFrames** (`heygen-com/hyperframes`) | **Verified as HeyGen's.** An Apache-2.0 framework: "Write HTML. Render video. Built for agents." It renders HTML, CSS, GSAP and other seekable animation to deterministic MP4 by seeking a paused timeline frame by frame. Node ≥22, FFmpeg. Ships 7 published skills; the core four are `/hyperframes`, `/hyperframes-cli`, `/hyperframes-registry` (~450 blocks) and `/media-use`. Has a desktop app ("Framey") [V] | 77.4k★ / 7.1k forks (as fetched); last commit 2026-11-02 [V] | Has the best-written craft rules found (§3.2). Worth installing even if you stay on Remotion: the rules transfer, and there is a `/remotion-to-hyperframes` skill |
| **Claude Motion** (Anthropic) | Beta, launched Oct 8, 2026. "Claude Motion turns your content into short animations." It builds animations as code with no video model, so no realistic footage or people. Export to MP4. **Team and Enterprise plans only**; uses plan usage ([support article](https://support.claude.com/en/articles/17454997-get-started-with-claude-motion), [the-decoder](https://the-decoder.com/claude-can-now-generate-animated-explainer-videos-and-live-data-dashboards-from-text-prompts/)) [V] | Beta | Only if you're on Team. Aspect ratio, fps and audio support are not documented |
| **Claude Design** | Anthropic's design tool, out of beta Oct 8, 2026; "will be merged into the main app by December 14" [V the-decoder]. Has a built-in "Animated video" skill; HyperFrames' Claude Design guide says "do NOT invoke the built-in 'Animated video' skill" and use HyperFrames HTML+GSAP instead [V repo doc]. No native MP4 export: third-party tools such as `claude-video-export` (13★) render its Stage-based (`useTime()`/`<Sprite>`) animations to MP4 [V] | GA | Optional for layout and brand exploration, then hand off to Claude Code |
| **"Imagine with Claude"** | Temporary research preview (Sept 2025) that generated software UIs on the fly. Not a video tool [U datacamp/producthunt snippets] | Ended | Not relevant |
| **Lottie Creator MCP** (LottieFiles) | Official MCP that lets Claude create and edit animations in Lottie Creator through a browser tab. Install: `claude mcp add lottiefiles-creator -- npx -y @lottiefiles/creator-mcp@latest`, then enable it in Creator under Settings → MCP Settings → Enable local MCP ([docs](https://docs.lottiefiles.com/en/creator/13_ai-tools/lottie-creator-mcp)) [V] | Launched ~Apr 15, 2026 [V blog] | Good for icon and price-tag micro-animations, which you can embed in Remotion with `@remotion/lottie` |
| **LottieFiles motion-design-skill** | "Universal motion design principles for AI agents": timing tables, easing, choreography, Disney principles. Install: `npx skills add LottieFiles/motion-design-skill` [V] | 2.7k★; last commit 2026-05-18 [V] | Good reference tables (§3.4) |
| **dotlottie-web / lottie-web** | Players. dotlottie-web (Rust+WASM) 936★, last commit 2026-10-30; airbnb/lottie-web 32.3k★, last commit 2024-11-19 (stale) [V] | — | Use dotLottie for new work |
| **Manim** | Python math-animation engine. ManimCommunity 42.1k★, last commit 2026-10-27 (v0.22.1); 3b1b/manim 96.0k★, last commit 2026-09-09 [V]. Community skill: `npx skills add https://github.com/davila7/claude-code-templates --skill manim` (generic; I read its SKILL.md) [V] | Active | Strong for equations and graphs; weaker than Remotion for UI-style price tags |
| **Motion Canvas** | TypeScript generator-based animation tool. 19.6k★; last commit 2026-07-02 [V] | Slowing | Not recommended over Remotion for agent work |
| **Revideo** | Fork of Motion Canvas aimed at programmatic rendering. 4.2k★; last commit 2026-07-15 [V] | Slowing | Not recommended |
| **Anthropic official skills** (`anthropics/skills`) | No video skill. Relevant ones: `frontend-design`, `algorithmic-art`, `slack-gif-creator`, `theme-factory`. Last commit 2026-10-28 [V cloned] | — | — |
| **@remotion/three + R3F** | `<ThreeCanvas>` makes Remotion hooks work inside R3F; `useVideoTexture()`. Template `remotion-dev/template-three` (117★, last commit 2026-11-02). Set `Config.setChromiumOpenGlRenderer('angle')` ([docs/three.md](https://www.remotion.dev/docs/three.md)) [V] | Active | Q-ROSITY |
| **Community Remotion skills** | `haidrrrry/claude-remotion-skill` (770★, last commit 2026-08-12) [V]; `hassancs91/claude-faceless-shorts-creator` (294★, last commit 2026-08-18) [V]; `Maartenlouis/remotion-ads` (65★, last commit 2026-05-06) [V]; `haiderfarooq3/paper-reel` (78★, last commit 2026-10-27; canvas + Playwright, not Remotion) [V] | — | Copy their rules (§3) |

---

## 2. Exact workflows, step by step

### 2.1 Official Remotion + Claude Code loop ([docs/ai/coding-agents.md](https://www.remotion.dev/docs/ai/coding-agents.md)) [V]

```bash
npx create-video --yes --blank my-video
cd my-video
npx remotion skills add          # installs the Agent Skills
npm run dev                      # Studio preview
# second terminal:
cd my-video && claude
```

The `remotion-best-practices` skill also tells the agent to:
- "start Studio and open the preview in the browser before building or editing the composition";
- not render by default ("Don't render the video by default unless they are very explicit");
- verify visually: "You can also use Rendering to inspect one or several frames as images." [V]

Render specific frames as PNGs for review [V remotion-render SKILL.md]:

```bash
npx remotion render [composition-id] out/frames --frames=0,30,90 --image-format=png
npx remotion still [composition-id]
```

### 2.2 Hasan's "faceless-shorts factory": the closest open pipeline to The Signal

Sources: [repo](https://github.com/hassancs91/claude-faceless-shorts-creator) and [guide](https://learnwithhasan.com/guide/how-to-make-faceless-youtube-shorts-with-claude-code/) [V]. It has 12 example shorts, including a money-math short ("The 1% Fee That Eats 24% Of Your Retirement").

**Artifact contract per short** (verbatim from `make-short/SKILL.md`):

```
shorts/short-N-<niche>/
  script.md        — hook, beat sheet table (time | on screen | VO), production notes
  beats.json       — machine contract: format, vo[] (text+start/end+words), beats[], niche timeline
  voice/           — per-line TTS clips + voice.wav        (gen_voice.py)   [gitignored]
  sfx-plan.json    — cue sheet on the global timeline       (mix_sfx.py)
  output/          — short-N-sfx.mp4 (+ music auditions)                    [gitignored]
remotion/src/shots/short-N/
  ShortN<Name>.tsx — THE composition (registered by npm run gen)
  vo.gen.ts        — AUTO-GENERATED VO with exact word times (never hand-edit)
```

**Stages** (verbatim summaries from the skill):

1. **Script + beats.** "~100 words total, estimate line windows at ~2.7 words/sec… (3.3wps needed a 1.3× squeeze; 2.7wps peaked at 1.11×). Facts must be verified before scripting." Claude writes a plan and waits for "go" before building.
2. **Composition.** One `.tsx`, 1080×1920 @30, about 42 s. "Beats = `<Sequence>` scenes over ONE persistent canvas (the board/equation/array is the continuity…)". "THE recurring bug: frames inside a `<Sequence>` are LOCAL… `local_f = global_s*fps − sequence_from`. Check every cue twice."
3. **QA.** "do not skip, it catches real bugs every time": `node scripts/frames.mjs ShortNName 0,<beat-boundaries+hero-frames>,<last> --scale=0.5`, then "READ every PNG (phone scale)". Checklist: frame 0 composed and thumbnail-grade · every reveal synced to its beat · nothing covering the payoff element · captions clear of UI zones · loop frame ≈ frame 0.
4. **Voice.** `python tools/gen_voice.py --beats … --voice TX3LPaxmHKxFdv7VOQHJ --emit-ts …/vo.gen.ts` uses per-line TTS with `/with-timestamps`, giving real per-word times. Then mux with `ffmpeg -i …mp4 -i voice.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k`.
5. **SFX.** Library first. Cue times come from exact landing frames: `at_s = (move.at + move.dur + sequence_from) / fps`.
6. **Music bed** (optional), hard-ducked under the voice. Target: "~−15.5 LUFS, awaiting the user's ear."

### 2.3 HyperFrames work loop ([skills/hyperframes/SKILL.md](https://github.com/heygen-com/hyperframes/blob/main/skills/hyperframes/SKILL.md)) [V]

Install:

```bash
claude plugin marketplace add heygen-com/hyperframes
claude plugin install hyperframes@hyperframes
# or: npx skills add heygen-com/hyperframes   (pick "Core Skills")
```

Example prompt: "Using `/hyperframes`, create a 10-second product intro with a fade-in title, a background video, and subtle background music."

Loop, for a film over about 15 s:
1. Read the type file (`types/data.md`, `types/vertical.md`, `types/character.md`…).
2. Read `story.md` and write **three storylines** in words only; the person picks one.
3. Write `SPEC.md`, then build.
4. Run `npx hyperframes check --json`.
5. Run `npx hyperframes snapshot --review`, work through `review.md`, and write `REVIEW.md`.
6. Render only after the person approves.

Two measured facts from `film.md` [V]:
- "Up to about six short scenes, build them yourself in one context (about 9 min for five, against about 21 min split across sub-agents)."
- "TTS reads about 2.2 words a second. Keep a scene to about 19 words (9 s)…"

### 2.4 Reference-matching workflow: Haider Farooq's paper-reel ([write-up](https://haiderfarooq.dev/blog/paper-reel-explainer-reels-in-code), Oct 27 2026) [V]

1. Pull stills from a reference reel with ffmpeg. Measure palette, layout grid, grain, shadows and the absence of outlines: "the look as code."
2. Claude writes one JS kit of primitives, then story props (sign, terminal, stamp, counter, mascot).
3. The first render had captions over the mascot, a stamp hitting the wrong word, and a counter finishing before its sentence. Each was fixed by reviewing stills.
4. "Every fix became a line in `SKILL.md`."
5. Claude runs the fix loop "three or four times" before the human sees anything. "Without that, you are the QA department."

### 2.5 Wireflow's measured single-prompt test ([blog](https://www.wireflow.ai/blog/claude-motion-graphics), Oct 14 2026) [V]

- **Setup and result.** Claude Code on Opus 5.5 with Remotion 4.0.535 and the 12 official skills produced a 12 s 1080p clip in 8 min 56 s over 22 turns, for $1.00 at API prices.
- **Failures:**
  - Inter was not installed, so Windows substituted Segoe UI.
  - A two-line card name squashed a number badge; Claude caught this in preview stills.
  - Claude removed the title without being asked.
- **Their lessons:** "Give frame counts, seconds, and sizes. Name the font and explain how to load it. Request preview stills before the full render… Specify what should stay on screen."

### 2.6 Claude Design → HyperFrames → Claude Code ([docs/guides/claude-design-hyperframes.md](https://github.com/heygen-com/hyperframes/blob/main/docs/guides/claude-design-hyperframes.md)) [V]

Claude Design produces the "valid first draft" (brand, layout, content, first-pass animation). Claude Code does "edit bay refinement": "Ease curve tweaks (swapping `power3.out` for `expo.out` after seeing it play) · Stagger timing adjustments (0.12 → 0.08…) · Scene duration micro-adjustments (scene 4 drags at 4.5s, trim to 3.8s)…"

---

## 3. Verbatim rules, prompts and file excerpts

### 3.1 Remotion official skill rules (remotion-dev/skills v4.0.540) [V]

All quotes are from files under [github.com/remotion-dev/skills/tree/main/skills](https://github.com/remotion-dev/skills).

**`remotion-markup/SKILL.md`:**
- "Keep `useCurrentFrame()` in the smallest component that needs it… otherwise unrelated descendants re-render on every frame."
- "get `fps` from `useVideoConfig()` for all seconds-to-frames calculations, including timing props such as `from`, `trimBefore` and `durationInFrames`." This matters for 60 fps: write `2 * fps`, never `60`.
- "Drive animations using `useCurrentFrame()` and `interpolate()`. CSS `transition` or `animation` will not render correctly… Tailwind animation class will not render correctly."
- "Use `Easing.bezier()` and `Easing.spring()` to customize timing." "Use `scale`, `translate`, `rotate` CSS properties over `transform`." "Keep the `interpolate()` call inline in the `style` prop."
- Canonical example: `opacity: interpolate(frame, [0, 2 * fps], [0, 1], {extrapolateRight: "clamp", extrapolateLeft: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1)})`.
- Scale: `easing: Easing.spring({damping: 200}), output: 'perceptual-scale' // For scale animations`.
- "Google Fonts… Is the recommended way to load fonts in Remotion." `loadFont("normal", {weights: ["400","700"], subsets: ["latin"]})` via `@remotion/google-fonts/<Font>`; "automatically blocks rendering until the font is ready."
- "Use `npx remotion add` to add new packages with the right version."

**`timing.md`:**
- "A nice push movement with no bounce: `Easing.spring({damping: 200})`."
- Multiple keyframes: `interpolate(frame, [0, 1*fps, 9*fps, 10*fps], [0,1,1,0], {easing: [Easing.bezier(0.16,1,0.3,1), Easing.linear, Easing.spring({damping:200})], …})`.
- "Posterization… `posterize: 3 // Only every 3rd frame is sampled`". Useful for a stepped, stop-motion feel.

**`transitions.md`:**
- `<TransitionSeries>` with `fade()`, `slide({direction:"from-left"})`, `wipe()`, `flip()`, `clockWipe()`; `linearTiming({durationInFrames: 15|20})`; `springTiming({config:{damping:200}, durationInFrames: 25})`.
- "Transitions overlap adjacent scenes, so the total composition length is **shorter** than the sum… 60 + 60 - 15 = 105."
- Overlays (for example `lightLeak()`) "do **not** affect the total duration."

**`multi-scene-video.md`:** "For independent scene start times, use a named `Track`… For scenes that should remain adjacent as their durations change, use `TransitionSeries`."

**`remotion-create/video-layout.md`** (entire file):

> "You are designing a video, not a webpage.
> - Decide what the viewer should notice first in each scene. Build the frame around that one thing.
> - Keep important content inside a generous safe area. For 1080px-wide videos, keep key text at least 80px from the sides and 100px from the top and bottom.
> - Do not add redundant elements.
> - For 1080px-wide compositions, use these rough minimums: Main headline: 84px · Important supporting text: 44px"

**`3d.md`:**
- "You MUST wrap 3D content in `<ThreeCanvas>` and include proper lighting. `<ThreeCanvas>` MUST have a `width` and `height` prop."
- "Shaders, models etc MUST NOT animate by themselves… Otherwise, it will cause flickering during rendering. Using `useFrame()` from `@react-three/fiber` is forbidden."
- "The `layout` prop of any `<Sequence>` inside a `<ThreeCanvas>` must be set to `none`."

**`voiceover.md`:**
- ElevenLabs `model_id: "eleven_multilingual_v2"`, `voice_settings: {stability: 0.5, similarity_boost: 0.75, style: 0.3}`.
- Use `calculateMetadata` to size the composition to the summed audio durations, and subtract `TransitionSeries` overlaps.

**`sfx.md`:**
- Built-in SFX URLs, for example `https://remotion.media/whoosh.wav`, `whip.wav`, `switch.wav`, `mouse-click.wav`, `ding.wav`, `page-turn.wav`, `shutter-modern.wav`, `record-scratch.wav`, `minecraft-hurt.wav`, `vine-boom.wav`…
- "For more sound effects… A good resource is https://github.com/kapishdima/soundcn/tree/main/assets."

**`measuring-text.md`:**
- `fitText({text, withinWidth: 600, fontFamily, fontWeight})` → `fontSize`.
- `fillTextBox({maxBoxWidth: 400, maxLines: 3}).add({...}).exceedsBox`, an overflow check you can run automatically.

**`remotion-captions/transcribe-captions.md`:** `@remotion/whisper-webgpu` runs Whisper locally on the GPU. `display-captions.md` says to use the Basic Captions element and include a leading space in each word's `text`.

**Remotion's own LLM system prompt** (template-prompt-to-motion-graphics, `src/app/api/generate/route.ts`) [V], excerpts:

> "## LAYOUT RULES – Use full width of container with appropriate padding – Never constrain content to a small centered box – Use Math.max(minValue, Math.round(width * percentage)) for responsive sizing
> ## ANIMATION RULES – Prefer spring() for organic motion (entrances, bounces, scaling) – Use interpolate() for linear progress (progress bars, opacity fades) – Always use { extrapolateLeft: "clamp", extrapolateRight: "clamp" } – Add stagger delays for multiple elements
> ## STYLING RULES – … Keep colors minimal (2-4 max) – ALWAYS set backgroundColor on AbsoluteFill from frame 0 - never fade in backgrounds"

Its follow-up edit prompt: targeted edits for "Changes affecting <30% of the code"; full replacement for ">50%"; "If the user has made manual edits, preserve them unless explicitly asked to change."

**Remotion elements worth copying** ([remotion.dev/elements.md](https://www.remotion.dev/elements.md)) [V]:
- **Number Counter.** `interpolate(frame, [0, durationInFrames * 0.75], [0, 1], {easing: Easing.out(Easing.exp)})`, `fontVariantNumeric: 'tabular-nums'`, `toLocaleString('en-US')`. So it counts over the first 75% of its window, then holds.
- **Charts:** Horizontal/Vertical Bar, Line, Pie.
- **Captions:** Basic, Rounded, Moving Pill, Popping Word, Word Highlight.
- **Social Safe Zones:** overlays real TikTok and Instagram Reels interface PNGs on 1080×1920. Use it as a dev-only QA layer.

### 3.2 HyperFrames skill rules, the most detailed craft spec found [V]

From [skills/hyperframes/references/](https://github.com/heygen-com/hyperframes/tree/main/skills/hyperframes/references). The motion numbers are "Measured frame by frame from the official HyperFrames launch films."

**SPEC template** (`spec.md`, verbatim):

```text
GOAL:    what the viewer feels or does at the end, one sentence
OUTPUT:  HyperFrames, W x H, fps
TIME:    seconds x fps = frames; BPM and frames per beat when there is music
LOOK:    ground (hex, texture and its amount), ink, one accent and where it may appear;
         display face + weight + size in px + tracking, body face the same;
         the medium (paper and ink, photographs, product UI, glass, clay, 3D studio) with its numbers;
         light and depth: shadow offset, blur and opacity, grain %, vignette %
OBJECTS: every thing the story needs the viewer to recognise … drawn with the material and details
         that make it read without a label
MOTION:  eases by role as named curves (enter, move, exit, camera); springs as damping ratio;
         durations and staggers in frames
SHOTS:   one line per shot: frame range, the one hero move, what the viewer reads (with its window),
         the sound, and how it hands off to the next shot
BANNED:  the defaults below, plus anything this film must not become
QA:      the frames to check, and what each must show
```

**Turning words into numbers** (`spec.md`):
- "premium → a material with numbers: satin paper with 2% grain… chrome at roughness 0.05"
- "modern → a 30-frame push on one ease, a display face at 9% of the frame height with -2% tracking"
- "clean → 12 columns, 96 px margins, the accent on one word per shot"
- "dynamic → cuts on the beat, a layout change on the bar (every 4 beats), one hero move per shot"
- "playful → springs at damping 0.45-0.6 on position and scale (never on opacity or colour)"

**Composition numbers:**
- "The hero of a shot fills at least 40% of the frame's height or width."
- "One hero move per shot. Secondary moves travel 50-70% as far, start 100-200 ms after it."
- "An information card… its information is on screen within about 2.5 s, then it holds, so any paused frame reads as a finished poster."
- "Something new every 2-4 s."
- "Text meant to be read: at least 28 px at 1080 (2.6% of the short side), held 0.5 s + 0.3 s a word. Too many words: cut words, never shrink type."

**BANNED by default** (verbatim list):

> "a black or dark navy void as the ground, with small elements floating in its middle; glow, bloom, neon, lens flares, glowing orbs and rings; floating particles as decoration; purple or blue gradients, mesh gradients, glass cards; a cream or off-white paper ground with a serif display, italic accent words, numbered "01 / 02" labels, small monospace caps labels, pill-shaped chips and buttons; everything centred; everything fading in at once; every element fading and sliding up; text that moves while it is read; titles that keep drifting after they land; corner labels, frame borders, corner brackets, HUD readouts as decoration; three cards in a row, KPI grids, a title over a dimmed screenshot; the logo docked in a corner."

`look.md` adds: "Inter, Space Grotesk, Instrument Serif, Geist and JetBrains Mono are where generated design lands; use them when the brand does, not by default."

**Motion craft** (`motion.md`, verbatim fragments):
- "**Moves**: a fast move takes 0.3–0.6 s and carries motion blur… 6–12 px on text-sized elements, 15–20 px full-frame."
- "**Arrive slow, leave clean**… Entrances that are too snappy read as glitches; slowing the whole video by about a second often fixes it."
- "**Ease by role**: an arrival lands on a long tail (`expo.out`, `power4.out`), a camera move or a colour flood eases both ways (`power2.inOut`), a zoom through or an exit accelerates (`power3.in`). The same `power2.out` at 0.5 s on everything is the flat default that makes a film feel generated."
- "**Springs** are named by damping ratio: 1.0 never bounces, 0.7-0.85 reads premium, 0.4-0.6 playful, under 0.3 a cartoon. Position and size may bounce; opacity and colour never do."
- "**Exits** are 40-50% shorter than their entrances. **Overlap**: the next element starts when the previous is 30-50% done… **Stagger**: letters a frame apart, words 60-120 ms, list items 40-80 ms."
- "**Beat grid**: frames per beat = fps × 60 / BPM; compute each beat from its index and round it, never add a rounded beat repeatedly."
- "**Cuts**: cut at the fastest frame of a move, with matching direction and speed on both sides."
- "**Titles**: a landed title is dead still… per word: `blur(6px)` → 0 and opacity 0 → 1 in 0.13 s, 0.067 s apart, no translate; … one word of the sentence rolling through options like a slot machine, about 0.1 s a roll." The slot machine is a natural fit for price reveals.
- "**Holds**: a line the viewer must read holds about 0.5 s plus 0.3 s a word, the film's last line at least 2 s… Then exit with a blur-out and fade of 0.13–0.25 s."
- "**Title size**: 4–9% of the frame height… quiet lines at 2.5–4% against hero words that fill 60–90% of the width. One highlighted word in the accent colour."
- "**Rhythm**… shots average 1.8–3 s with motion inside them. Hold 0.3–0.75 s before the payoff, which plays at normal speed."
- "**Defaults that look generated**: breathing, floating or pulsing loops standing in for motion on titles and UI; … a slow creeping scale on a title… bounce on UI; click rings; every scene entering the same way."

**Transitions table** (`motion.md`): "Use 3–5 kinds in a film, each caused by something on screen… at most a third of the seams between beats are hard cuts."

| Transition | How it is built |
|---|---|
| Zoom through a button | camera tracks to the button with blur (0.6 s), then it scales ~8% → ~250% of the frame in 0.35 s, strong ease-in |
| Object becomes the world | a card grows past the frame in 0.65 s, ease-in-out; its surroundings blur ~15 px and fade in 0.3 s |
| Morph | one container widens into the next (~110 → ~880 px in 0.2 s, `power3.out`) with a horizontal blur 12 → 0 |
| Colour flood | the hero object stays while the ground changes colour in ~0.4 s `power2.inOut` |
| Whip | a 0.13–0.3 s smear; the arriving element lands blurred and sharpens in ~0.13 s |
| Dip cut | the outgoing frame darkens ~40% for 3 frames, then a hard cut |
| Blur swap | out: opacity → 0 with ~8 px blur in 0.13–0.2 s; in: blur → 0 in 0.13 s |

**Fixes for common notes** (`motion.md`):
- "too fast" → "Slow every zoom and pan to 0.7× of its speed, nothing else"
- "it feels like slides" → "Enter the next scene through an object on screen; cut a move mid-flight"

**Vertical clips** (`types/vertical.md`), verbatim:

> "On 1080×1920: nothing in the top 168 px (status and search bar); every word and the product inside the band from 168 to 1330 px; below 1330 px (caption, handle, buttons) only texture or decoration; no text under the right-hand action rail… Frame 0 is the thumbnail and the hook… Never black, never a logo… nothing meant to be read under 28 px, and a fixed word limit per line (about … 5 English words for a claim): cut words, never shrink… Pacing: Faster than landscape: shots of 1–2 s, a new beat every 2–4 s, the payoff before the swipe."

**Numbers and charts** (`types/data.md`), verbatim:

> "A number is earned by the scene before it, then made physical: a count that becomes a skyline, a share that becomes a crowd. The number is the biggest thing on screen. Tabular figures… a count-up runs 1.2–1.6 s, then holds. Real data only… with a small source line on screen. One data module drives every figure in the film… Build a chart in reading order: the frame and axis, a reference line, then the data drawing in, then one annotation on the point that matters. Annotate on the mark; no legends. Highlight one series, grey the rest… Tells for this type: A grid of KPI cards; a dashboard; a pie chart; every number counting up at once; numbers with no source."

**Story and beats** (`story.md`):
- **Hook:** "frame 0 is the thumbnail: never black, never a logo alone."
- **Copy:** "Titles take at most 6 words a line, one line on screen at a time, no trailing periods."
- **Banned words:** "Never "unlock", "seamless", "supercharge", "game-changer", "revolutionize", "effortless"".
- **Claims:** "never derive a claim it did not make ("40 min to 2 min" is not "20× faster")". This matters for price-psychology stats.
- **Device table:** includes "A number lands: one real number earned by a scene, then made physical" and "A question with the input: "What if you could…""; the latter suits Q-ROSITY.

### 3.3 HyperFrames `motion-doctrine` (internal skill), the vector law [V]

> "How Scene A exits determines how Scene B enters: same axis, same direction, matched speed, cut mid-motion on both sides. 1. Axis — x stays x… 2. Direction — never mirror. On Z… growing = push… A receding exit answered by a grow-from-small entry is a mirrored vector — the most common violation… 3. Speed — … mirrored eases (exit `power4.in` + entry `power4.out`…). 4. Phase — the cut lands mid-motion on BOTH sides."

### 3.4 LottieFiles motion-design-skill tables ([timing-easing-tables.md](https://github.com/LottieFiles/motion-design-skill)) [V]

- **Duration by element:** card enter/exit 200–350 ms · page transition 400–600 ms · dramatic reveal 600–1200 ms.
- **Distance scaling:** 100 px = 1.0×, 300 px = 1.5×, full screen = 1.8–2.0×.
- **Entrance vs exit:** "Exit = 65-75% of entrance."
- **By personality:** "Premium 350 / 500 / 800 ms" (quick/standard/slow); "Energetic 100/180/300".
- **Easing curves:** MD3 Emphasized `(0.05, 0.7, 0.1, 1)` for entrances; MD3 Accelerate `(0.3, 0, 1, 1)` for exits; Apple `(0.25,0.1,0.25,1)`; Bounce settle `(0.175, 0.885, 0.32, 1.275)`.
- **Springs (stiffness/damping):** Standard 250–350 / 18–24; Bouncy 150–250 / 10–15; Gentle 100–150 / 20–25.
- **Stagger:** "Total stagger MUST stay <500ms."
- **Overshoot budget:** "Premium 0%", "Celebration 15-25%".
- **Quality checklist:** "No linear easing on spatial movement · … · 1/3 rule (density): max 1/3 elements active simultaneously · <20 animated elements per viewport · Follow-through: child elements offset 50-150ms."

### 3.5 Hasan's `brand.md` (an excellent template for The Signal's style contract) [V]

Excerpts:
- "**Entrances:** fade + rise. `opacity 0→1` and `translateY 24px→0` over ~7 frames at the shorts' 30fps, ease-out (or spring: damping 200, mass 0.8, stiffness 120). No overshoot, no bounce."
- "**Exits:** fade + fall, a bit faster than entrances. **Emphasis:** indigo highlight/underline wipe behind a key word; scale pop max 1.03–1.06. **Stagger:** 3–4 frames between list items / lines."
- "**Canvas:** 1080×1920 (vertical), **30 fps**, ~38–42s. **Safe areas:** captions block centered ~y1500; nothing critical in the bottom 340px (YouTube UI) or the right 160px (like/share rail). Keep text ≥ 5% from edges. **Frame 0 is the thumbnail**."
- "Typography (3-font system): Space Grotesk 500/600/700 headlines · Inter 400/500/600 body · JetBrains Mono for code/numbers." These are exactly the fonts HyperFrames calls "where generated design lands", so choose your own.
- **SFX by function** (verbatim table): "Motion | whoosh | carry one beat into the next · Tension | riser | hold before a reveal · Emphasis | impact / pop | lands on the reveal · Snap | click". Plus: "Layer the big moments (build-and-drop): riser → impact on a scripted reveal, whoosh → pop on a cut… Reserve for the 2–3 hero beats." "Sync to the VISUAL beat and often the exact word. Off-by-100ms reads as sloppy." "No static/glitch textures under narration."
- **Gain table:** "Library clips are normalized to ~−20 LUFS with a −1.5 dBFS peak ceiling… start at transitions/whooshes −3, story pops/impacts 0..+3, stamps/snaps 0..+7, layered-hero risers 0..+2."

Hasan's `lib/shorts.tsx` safe-area constant: `export const SAFE = { top: 150, bottom: 500, right: 160, left: 60 }`, with the comment "buttons occupy the lower ~500px — captions must sit ABOVE ~y1420". `EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1)`. There is also a dev-only `<SafeAreaGuides>` with the note "never mount in a final render." [V]

**The 1% fee short** (`shorts/short-10-fees/script.md`): the closest real example to a Signal reel [V].
- **Math first:** "The math (recomputed — do NOT trust the numbers in the brief)."
- **Frame-0 hook:** "both curves already drawn to year 40, gap… shaded red, chips at $1.31M / $996K… ticker… already reading $316,661."
- **Setup:** "The chart **rewinds**… the chart is never an empty box."
- **Quiz card:** "PauseCard… entering exactly on the word 'Pause.' (13.70)."
- **Twist:** "The ticker crossfades into a ShareBar… The scary number becomes a *proportion*."
- **Loop:** "last frame == frame 0. No CTA."
- **SFX note:** "Two build-and-drops carry it… riser -> impact on the curves LANDING, and riser -> deep impact on the counter landing on $316,661… impacts land ON the word that names the number… Gains keep the SFX under the ~-17 LUFS voice: payoffs -5/-6, transitions -7/-8, texture -9/-13."

### 3.6 `vidtsx-2d-generator` hard rules (Hasan repo) [V]

- "Never use `useState`, `useEffect`, `setTimeout`, `setInterval`, or CSS animations/transitions."
- "use `seededRandom`… Pre-generate particle/random arrays **at module level**… recomputing per frame causes flicker."
- "`interpolate`'s input range has to be strictly monotonically increasing… To **reverse** a mapping, flip the *output* range."
- "**Always** pass `extrapolateLeft: 'clamp'` and `extrapolateRight: 'clamp'`."
- Named easings: `easeOut: Easing.bezier(0.33, 1, 0.68, 1)`, `easeIn: (0.32, 0, 0.67, 0)`, `easeInOut: (0.37, 0, 0.63, 1)`, `overshoot: (0.34, 1.56, 0.64, 1)`. Its note that "`Easing.out(Easing.cubic)` crashes" is specific to VidTSX; Remotion's own Number Counter element uses `Easing.out(Easing.exp)`.
- "@remotion/paths — only the real functions exist… `evolvePath, getLength, getPointAtLength, getTangentAtLength`". It warns that `makeCircle()` and similar helpers "do not exist". Hallucinated helpers are a common agent error.
- **Verify the render:** "A shot you have only reasoned about is not finished… a single 60%-of-duration still is not enough… pull frames at each key moment (`ffmpeg -ss <t> -i out/<id>.mp4 -frames:v 1 f.jpg`)."

### 3.7 haidrrrry `claude-remotion-skill` (770★) [V]

- **Rules:** "NEVER use linear interpolation." "Entrances animate 2–3 properties together (opacity + translateY + scale)." "Exits exist and are faster than entrances (~10 frames vs ~20)." "Render, extract frames, LOOK at them, fix, re-render."
- **Theme** (`assets/theme.ts`): `ease.out: Easing.bezier(0.16, 1, 0.3, 1)` (easeOutExpo, entrances); `inOut: (0.83, 0, 0.17, 1)`; `in: (0.7, 0, 0.84, 0)` (exits only).
- **Springs:** `snappy {damping:14, stiffness:160, mass:0.6}` for UI pops and words; `smooth {damping:20, stiffness:90, mass:1}` for big elements; `bouncy {damping:11, stiffness:170, mass:0.7}`.
- **Counter:** `interpolate(spring({frame: frame - delay, fps, config:{damping:30, stiffness:60}}), [0,1], [0,target])` with `tabular-nums`.
- **Stagger:** "3–6 frame offsets. Words: 3. Cards/list items: 4–5. Big blocks: 6" (at 30 fps).
- **Transitions:** "Hand-rolled, 8–14 frames each: Whip pan: bg translates 1500px in 6 frames with `filter: blur(8px)`… Scale-through: A scales to 1.3 + fades, B scales 0.8→1." Motion blur via `@remotion/motion-blur` `<Trail layers={4} lagInFrames={0.4}>` for anything moving >30 px/frame.
- **Design rules:**
  - "Reels hero size: 80–140px at 1080 wide… letterSpacing -0.03em, lineHeight 1.05. Highlight ONE word per headline."
  - "60/30/10… The hero color appears on AT MOST one element per frame."
  - "Each beat: HIT -> hold (15–20 still frames) -> build… New visual element at least every 90 frames… Constant motion reads amateur; contrast reads expensive."
- **Render:** "`--codec h264 --crf 16` (platforms re-compress; give headroom)… Preview suspicious motion at 0.25x in Remotion Studio."

### 3.8 Verbatim prompts from creators [V unless marked]

- **Remotion gallery, @JNYBGR (Jonny Burger, Remotion), Claude Code / Opus 4.5:** "use remotion best practices. make a new composition and add a map and zoom out of LA while staying focused on it. once done, animate a line from LA to NY and make the camera follow it. add another stop to the trip, this time we go to paris. animate the eiffel tower and show it in 3D!"
- **@Remotion "News article headline highlight" (Claude Code):** "…use tesseract CLI to do OCR and find the positions of the text… slowly, very subtly, zoom into it and slightly rotate the article in 3d… around 15deg for each axis. at the beginning, blur the whole composition and unblur it over 1 second… evolve a highlighter from left to right using rough.js over the words… make sure the marker appears behind the text. when installing new dependencies, check for existing lockfiles and use the right package manager."
- **samohovets "Bar + Line Chart" (OpenCode, Opus 4.5):** "Create a 1920x1080 dark-themed (#1A1A2E) composition… bars for revenue ($8K, $12K, $15K, $11K, $18K, $22K for Jan-Jun) that grow upward from the baseline, overlaid with a blue (#0B84F3) line tracking conversion rate (2.1%…4.2%) that draws progressively with a glowing effect, bars animate sequentially with slight overlap while the line follows behind, include axis labels and a pulsing dot marker at the line tip, smooth spring-based timing over 120 frames at 30fps — use remotion-best-practices skill."
- **@DilumSanjaya "Top 20 Games Sold" (Claude Code, R3F):** "…visualize the top 20 best-selling video games as a vertical "tower", use boxes as towers with height representing the amount of copies… FPS:60 animate the camera from the bottom of the last rank to the top of the first rank. stop the camera on the top of each rank for a few miliseconds."
- **@Shpigford "Product Demo for Presscut":** "…Really grill me with questions to nail down exactly how the final video should look/feel and what content should be there."
- **@crispynotfound "Rocket Launches":** "…Use an abstract, minimalist aesthetic. Give me three versions first, then I'll pick one and refine it via feedback." This is the same idea as HyperFrames' three storylines.
- **@ghumare64 "Launch Video on X" (Claude Code, Opus 4.6):** a scene-by-scene shot list with frame counts per scene ("Scene 1 — Terminal Install (120 frames / 4s)… Types `npx openclawd-cli` character by character (1 frame/char)… Background music… 1s fade-in and 2s fade-out at 40% volume").
- **Sabrina Ramonov (Mar 20, 2026), [sabrina.dev](https://www.sabrina.dev/p/claude-just-changed-content-creation-remotion-video):** "use remotion skill to create a 9:16 15-second video on this topic: … viral hook … motion graphics, animated text … short-form video safe zones". Follow-up: "update the video: fact check that every single github repo is public … one scene per github repo … take a web screenshot".
- **Viral Opus 5.5 showreel prompt** (via [motion-graphics.org](https://motion-graphics.org/); @stephanlivera, 2.3M views): "make a dynamic 15-second motion graphics video that shows what an incredible motion designer you are, like it's your showreel for a résumé. go all out." Several other creators reused the same prompt. The lesson is that model effort matters (it was run at "max"/"xhigh" effort) and that an open brief plus high effort gives impressive but generic results.
- **@finnardley's prompts** (summarized by motion-graphics.org; the X originals returned 402, so these are [V via aggregator, U at source]). See §8 for the Roblox horror Short. All are exhaustive specs: hex colors for every surface, a named font at a pixel size, caption position as a % of height, voice model and voice name, LUFS target, a banned list, and process rules ("show the script before spending voice credits, and check stills before a full render").

### 3.9 Synthesized CLAUDE.md for The Signal

**Label: this is my synthesis of the sources above, not copied from one source.** Numbers are converted to your 60 fps.

```markdown
# CLAUDE.md — The Signal (Remotion, 1080x1920, 60 fps)

## Always
- Load /remotion-best-practices (remotion-dev/skills). Read brand.md + SPEC.md before any scene.
- Plan before code: write SPEC.md (GOAL/OUTPUT/TIME/LOOK/OBJECTS/MOTION/SHOTS/BANNED/QA) and
  beats.json; show me the beat sheet + VO word count and WAIT for "go".
- All timing = seconds * fps from useVideoConfig(). Never hard-code 30-fps frame counts.
- Every interpolate(): clamp both sides; named easing (no linear on movement).
- No CSS transitions/animations, no useState/useEffect for motion, no Math.random() (seeded only).
- Frames inside <Sequence> are LOCAL: local_f = global_s*fps − sequence_from. Check every cue twice.

## Story
- Frame 0 = thumbnail = hook: fully composed, the payoff number already visible. Never black/logo.
- One number per beat; it is the biggest thing on screen; tabular-nums; count-up 1.2–1.6 s then HOLD.
- One animated quantity per spoken number, landing on its word (use vo.gen.ts word times).
- Every on-screen stat has a source line. Recompute every number; never trust the brief's math.
- End on the payoff; last frame == frame 0 (loop). No "comment below" CTA.

## Motion (60 fps)
- Entrances 0.3–0.6 s (18–36 f), expo/power4-out tail; exits 40–50% shorter; next starts when previous 30–50% done.
- Stagger: words 60–120 ms (4–7 f), list items 40–80 ms (2–5 f); total stagger < 500 ms.
- Springs: premium = no overshoot (damping ratio ≥0.7; Remotion Easing.spring({damping:200}) for "no bounce").
- Landed titles are dead still. No breathing/pulsing loops on text/UI. Max one hero move per shot.
- Read holds: 0.5 s + 0.3 s/word; last line ≥ 2 s. Hold 0.3–0.75 s before the payoff.
- 3–5 transition types per film, each caused by an on-screen object; ≤1/3 hard cuts between beats.

## Layout
- Readable text band y 270–1250, x 65–1015 (right rail: keep text left of x≈850 below y≈1250).
- Captions centred ≈ y1250, 2–3 words/group (high energy). Headline ≥ 84 px (target 100–140), support ≥ 44 px, nothing < 28 px.
- Max ~5 words per claim line; cut words, never shrink type.

## BANNED
- dark-navy void + floating small elements; glow/particles/lens flares; purple-blue gradients; glass cards;
  KPI grids / 3 cards in a row / pie charts; everything centred + fade-slide-up; docked logo;
  Inter/Space Grotesk/Geist as the default display face (pick the brand face in brand.md).

## QA (do before showing me anything)
1. npx remotion render <Comp> out/frames --frames=<0, every beat boundary, every hero land, last> --image-format=png --scale=0.5
2. Read every PNG; check against SPEC QA lines; check SocialSafeZones overlay frames.
3. Run text-fit checks (fitText/fillTextBox) for every dynamic string.
4. After the full render: ffmpeg ebur128 → integrated −14 to −16 LUFS, true peak ≤ −1 dBTP.
5. Write REVIEW.md: P0/P1/P2 notes as "t=4.2s · where · problem → exact change · what stays".
6. Every fix I request becomes a new line in this file.
```

---

## 4. Design rules with concrete numbers

### 4.1 Safe zones for 1080×1920 (the sources disagree, so here is the comparison)

| Source | Top | Bottom | Right | Sides | Caption position |
|---|---|---|---|---|---|
| Meta via [HopperHQ](https://www.hopperhq.com/blog/instagram-reel-size/) (Sep 18 2026) [V] | 14% ≈ 270 px | 35% ≈ 670 px (40% ≈ 770 px bottom-right; ads with disclaimers 40%) | Engagement rail = rightmost 21% ≈ 230 px | 6% ≈ 65 px | — |
| HyperFrames `vertical.md` [V] | 168 px | words only inside 168–1330; below 1330 decoration only | no text under the right rail | — | portrait captions "about 600–700 px from the bottom" → y≈1220–1320 |
| Hasan `brand.md` / `shorts.tsx` [V] | 150 | 340–500 px | 160 px | 60 px | centred ~y1500 (conflicts with Meta's 35%) |
| Remotion `video-layout.md` [V] | 100 | 100 | 80 | 80 | generic, not platform-specific |
| Maartenlouis `formats.md` [V] | 0–285 UI | 1520–1920 UI | 120 | 80 | Feed 4:5 preview crops about 285 px top and bottom, so key content goes in y 285–1635 |
| finnardley Roblox prompt [V via aggregator] | — | — | — | — | captions centred at 64% height ≈ y1229 |
| TikTok | Conflicting third-party figures (top ~240, bottom 250–480, right 100–150) [U] | | | | Use TikTok's in-feed template |

**Recommendation (synthesis):**
- Put every important word in **y 270–1250, x 65–1015**, and keep it left of about x 850 below y 1250.
- Centre captions near **y ≈ 1230–1300**.
- Remotion's "Social Safe Zones" element overlays the real TikTok and Reels UI PNGs. Drop it into a dev-only layer and check stills against it.

### 4.2 Typography (1080 wide)

| Rule | Value | Source |
|---|---|---|
| Main headline minimum | 84 px (support text ≥ 44 px) | Remotion video-layout [V] |
| Reels hero | 80–140 px, weight 600–800, tracking −0.03em, line-height 1.05 | haidrrrry design-rules [V] |
| Title size | 4–9% of frame height (77–173 px at 1920); hero words fill 60–90% of width | HyperFrames motion.md [V] |
| Absolute floor | 28 px (2.6% of short side) | HyperFrames spec/review [V] |
| Portrait vs landscape | titles ×1.35, stats ×1.4 | HyperFrames overlays.md [V] |
| Words per line | ≤ 5 English words per claim; ≤ 6 words per title line; kinetic type 3–7 words per scene | HyperFrames [V] |
| Numbers | `font-variant-numeric: tabular-nums`; `toLocaleString` | HyperFrames data.md; Remotion Number Counter [V] |
| Captions | groups of 2–3 words for high energy, 3–5 conversational; never show a caption at exactly 0 s (start 0.1–0.3 s in); portrait fit `maxWidth` 900, base 78 px, min 42 px | HyperFrames captions.md [V] |
| Caption style example | finnardley: Montserrat ExtraBold 104 px, Title Case, one word at a time, white with black outline and offset shadow, key nouns red #EC1C24, centred at 64% height | [V via motion-graphics.org] |
| Avoid as defaults | Inter, Space Grotesk, Instrument Serif, Geist, JetBrains Mono | HyperFrames look.md [V] |

### 4.3 Color

- **One accent, rationed.** Use it on one word per shot, the payoff and the end card [V HyperFrames]. 60/30/10 split, with the hero colour on at most one element per frame [V haidrrrry].
- **Video-specific facts** (HyperFrames look.md [V]):
  - "Full-screen linear gradients on dark grounds band under H.264; use a radial gradient, a solid fill or a solid plus a local glow."
  - "An accent at 5% opacity disappears in compression: 15–25% for atmosphere, full saturation for the focal element."
- **Build the look from a medium, not a palette.** HyperFrames' risograph example uses paper, ink A, ink B as the single focus per frame, a 3 px off-register overprint, and halftone instead of gradients [V]. For The Signal, "price tags, receipts and shelf labels" could be your medium. That is my suggestion, not a source's.

### 4.4 Motion numbers converted to 60 fps

| Element | Seconds | Frames @60 | Source |
|---|---|---|---|
| Fast move / entrance | 0.3–0.6 s | 18–36 | HyperFrames [V] |
| Premium "standard" duration | 0.5 s (quick 0.35, slow 0.8) | 30 (21/48) | Lottie MDS [V] |
| Exit | 50–60% of the entrance (HyperFrames) / 65–75% (Lottie) | — | [V] |
| Word stagger | 60–120 ms | 4–7 | HyperFrames [V] |
| List stagger | 40–80 ms | 2–5 | HyperFrames [V] |
| Per-word blur-in | blur 6 px → 0 over 0.13 s, words 0.067 s apart | 8 f, 4 f apart | HyperFrames [V] |
| Count-up | 1.2–1.6 s, then hold | 72–96 | HyperFrames [V] |
| Read hold | 0.5 s + 0.3 s/word | e.g. 5 words = 2.0 s = 120 f | HyperFrames [V] |
| Pre-payoff hold | 0.3–0.75 s | 18–45 | HyperFrames [V] |
| Transition (Remotion examples) | 15–25 frames at 30 fps | 30–50 | remotion-dev/skills [V] |
| Whip | 0.13–0.3 s | 8–18 | HyperFrames [V] |
| Motion blur on fast moves | 6–12 px on text, 15–20 px full-frame | — | HyperFrames [V] |
| Background orbit | 3–5° per second | — | HyperFrames [V] |

**Springs.** In Remotion, `spring()` defaults are mass 1 / damping 10 / stiffness 100 ([docs/spring.md](https://www.remotion.dev/docs/spring.md) [V]), which bounces. "To disable the default bounce, increase the damping." The official skill uses `damping: 200` for "push movement with no bounce." Hasan's premium entrance is damping 200, mass 0.8, stiffness 120 [V]. haidrrrry's smooth spring is 20/90/1 [V].

### 4.5 Counters and charts for price psychology

- **Number Counter (Remotion element):** count over the first 75% of the window with `Easing.out(Easing.exp)`, then hold [V].
- **Chart build order:** axis → reference line → data → one annotation; highlight one series and grey the rest; no legends, no pie charts [V HyperFrames].
- **Rewind as setup** (Hasan): show the finished chart at frame 0, rewind it to empty during the setup, then redraw it in the reveal. This earns the loop for free [V].
- **Turn a scary number into a proportion** with a share bar [V Hasan short-10].
- **Slot-machine roll** on one word or number: about 0.1 s per roll [V HyperFrames]. Good for "$9.99 → $10".
- **Highlighter across lines:** "tween a custom property on a `background-size` band with `box-decoration-break: clone`" [V HyperFrames film.md]. Remotion's `text-highlights.md` covers underlines, circles and strike-throughs (file listed; not opened in detail).

---

## 5. Sound and voice (concrete numbers)

| Item | Value | Source |
|---|---|---|
| Integrated loudness | −16 to −14 LUFS for social; true peak ≤ −1 dBTP | HyperFrames sound.md [V] |
| Other mixes seen | Hasan voice `loudnorm=I=-16:TP=-1.5:LRA=11`, final ≈ −15.5 LUFS; paper-reel ≈ −14; finnardley −13 (Roblox) and −14 (explainer) | [V] |
| Platform targets | YouTube ≈ −14; TikTok and IG unpublished, ≈ −14 to −16 recommended by blogs | [U openclip/opus.pro snippets] |
| Music under voice | "around 0.14 volume" (HyperFrames); bed −7 dB plus a 9 dB sidechain duck (Hasan `mix_music.py`: `sidechaincompress=threshold=0.03:ratio=3:attack=15:release=450`, highpass 90 Hz, 1.5 s fades); "Background music -18dB under SFX/VO" (haidrrrry); music 0.2–0.3 volume (haidrrrry) | [V] |
| SFX over the bed | each hit 3–6 dB over the bed; "a bed with most of its energy under 150 Hz plays as nothing on a phone speaker" | HyperFrames [V] |
| SFX timing | place the clip so its **peak** lands 1 frame after the picture ("light arrives before sound"); most files peak after their start, so the clip start precedes the hit | HyperFrames [V] |
| SFX timing (alternative) | "SFX 2–3 frames BEFORE the visual lands" | haidrrrry [V] |
| Music hits | "A move that must land on a hit starts 40–190 ms early; a reaction starts 0–45 ms after. The hit itself is a 0 ms `tl.set`: easing a hit kills it." | HyperFrames film.md [V] |
| SFX palette | click = real cursor click; whoosh = scene cut or fast large card; soft key tick = letter-by-letter text; pop = badge, chip or number landing; riser into impact = payoff, **once**. "No synthesised tones, chimes or dings." Rotate 2–3 takes | HyperFrames [V] |
| SFX sources | Remotion's built-in `remotion.media/*.wav`; soundcn assets; ElevenLabs Sound Effects API (Hasan's primary); Pixabay, Mixkit, freesound (haidrrrry) | [V] |
| Music bed handling | enter at the track's strongest bar; 0.4 s fade-in, 1.5 s fade-out; frames per beat = fps × 60 / BPM | HyperFrames [V] |
| Words per second | 2.2 (HyperFrames TTS) · 2.7 (Hasan; ~100 words per 40 s; 3.3 wps needed a 1.3× atempo squeeze, which is audible) · ~3.5 (paper-reel). For a 45–70 s Signal: about 100–170 words | [V] |
| Words per scene | ~19 words (9 s) max; two scenes may reach 26 words | HyperFrames [V] |
| ElevenLabs defaults | `stability 0.5, similarity_boost 0.75, style 0 (default), speed 1, use_speaker_boost true`; default model `eleven_multilingual_v2` | [ElevenLabs API docs](https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps) [V] |
| ElevenLabs settings in practice | Remotion skill and Hasan: 0.5 / 0.75 / style 0.3 (+speaker boost); Hasan sends `previous_text`/`next_text` for prosody, not used with v3 | [V] |
| ElevenLabs presets (remotion-ads) | dramatic 0.3/0.8/0.7 · narrator 0.5/0.75/0.4 · expert 0.6/0.85/0.3 · calm 0.7/0.8/0.2 · conversational 0.45/0.7/0.5 (stability/similarity/style) | [V] |
| Word timing | `POST /v1/text-to-speech/{voice_id}/with-timestamps` returns `alignment.characters`, `character_start_times_seconds`, `character_end_times_seconds`. Build word times from characters (Hasan's `gen_voice.py` does this). Alternatives: faster-whisper (finnardley), whisper.cpp (paper-reel), `@remotion/whisper-webgpu` (Remotion) | [V] |
| Whisper gotchas | "Whisper invents "Thank you." over silence… drop words that start inside a final silence (`silencedetect=noise=-35dB:d=0.6`)"; never put two words in one timed entry | HyperFrames captions.md [V] |
| Voices used | Hasan: premade "Liam" `TX3LPaxmHKxFdv7VOQHJ`; finnardley Roblox: premade "Adam", `eleven_multilingual_v2`, a deep firm third-person narrator who "never says sound words; sound effects carry those" | [V] |
| Models | Eleven v4, v4 Turbo, v3, Multilingual v2 ("most stable on long-form"), Flash v2.5 | ElevenLabs TTS docs [V] |

---

## 6. Pacing and structure templates

**Hasan's beat grammar (~38–42 s)** [V]:
HOOK (0–3.4 s, frame 0 fully composed) → SETUP (3.4–11 s) → QUIZ (PauseCard, ~2.5 s, "drives comments") → REVEAL (2–4 steps, each on a VO word) → TWIST → LOOP (last frame == frame 0). The water-cycle example runs HOOK 0–3.8, SETUP 3.8–11.6, QUIZ 11.6–14.8, REVEAL 14.8–32.8, TWIST 32.8–38.6, LOOP 38.6–42.0 s.

**haidrrrry's 30 s Reel** [V]:
- 0–1.5 s: hook, with "Movement within the FIRST 15 frames".
- 1.5–3 s: context.
- 3–22 s: body, 3–4 beats of HIT → hold 15–20 frames → build.
- 22–27 s: payoff.
- 27–30 s: CTA.
- A new visual at least every 90 frames (30 fps).

**HyperFrames** [V]:
- Vertical: shots of 1–2 s, a new beat every 2–4 s, payoff before the swipe.
- Launch beats: Hook ~8% · Tension ~12% · Reveal ~8% · Proof ~40% · Payoff ~20% (lands 60–80% in) · Claim ~8% · End card ~8%.
- Explainer: "One idea… one concrete example worked through"; "Reveal each part when the voice names it, across the back half of the scene."

**Other formats:**
- **finnardley Roblox horror:** 40–50 s, ~36 shots, a cut every 0.5–2.5 s [V via aggregator].
- **@rick.theengineer formula** (animated-character explainers, 108K followers): Hook 0–3 s names a mystery → Setup 3–15 s → Mechanism 15–60 s → Payoff in the final 5–10 s as one sentence in big type ([brainrotshorts](https://www.brainrotshorts.com/blog/how-to-make-animated-explainer-reels), Aug 17 2026) [V].
- **Explain It in 60** (3D explainer kit): 35–45 s, "Something new on screen at least every 1.5 seconds" [V].

**Loop endings:**
- Hasan: "Loop scene reverses the hook's punch-in (settle 1.06→1 vs grow 1→1.06)."
- HyperFrames: "A loop that cuts from the last frame back to the first is a choice, not a default."

---

## 7. Quality checks

### 7.1 Visual review

- **Remotion frames at beat boundaries:**
  ```bash
  npx remotion render Signal out/frames --frames=0,<beats>,<last> --image-format=png
  ```
  Use `--scale=0.5` to view at phone scale (Hasan's `frames.mjs` uses `--scale=0.5`) [V].
- **Contact sheet with ffmpeg** (standard ffmpeg; I did not open the filter docs [U]):
  ```bash
  ffmpeg -i out.mp4 -vf "fps=2,scale=270:-1,tile=6x6" -frames:v 1 sheet.png
  ```
- **paper-reel `tile.mjs`:** "render chosen frames into a grid (each 270x480) with the phone-UI safe zones drawn in red; … determinism (every frame rendered twice, the second pass in reverse order; any difference is listed)" [V].
- **HyperFrames `snapshot --review`:** three sheets: scene start and middle, "a strip across every cut (−0.2 s to +0.2 s)", and beat frames "at phone width (360 px)" [V].
- **View at quarter speed:** "Preview suspicious motion at 0.25x… easing flaws invisible at 1x are obvious at quarter speed" [V haidrrrry].
- **A second reviewer:** "give it only `STORYBOARD.md` and the three sheets, ask for P0 and P1 lines" [V HyperFrames review.md].

### 7.2 Automated checks

| Check | How | Source |
|---|---|---|
| Text overflow and overlap | paper-reel `textcheck.mjs` patches `fillText`/`strokeText` to trace every string's screen-space box, then "Flags text that is cut off by the frame edge, text that overlaps other text, and text under the phone UI. A model reviewing contact sheets by eye misses these." In Remotion, use `fillTextBox().exceedsBox` / `fitText` | [V] |
| Craft lint | HyperFrames `check` warnings: `line_unread`, `dead_stretch` (>3 s with nothing changing), `text_below_floor` (<2.6%), `first_frame_empty`, `film_silent` (>15 s, no sound) | [V] |
| Motion assertions | HyperFrames `<name>.motion.json`: `appearsBy`, `before`, `staysInFrame`, `keepsMoving` | [V] |
| Determinism | Render twice, compare | paper-reel `reel check` [V] |
| Loudness | `ffmpeg -i out.mp4 -af ebur128=peak=true -f null -` (read I, LRA, True peak); normalise with `loudnorm=I=-14:TP=-1:LRA=11` (Hasan used −16/−1.5/11) | Hasan `gen_voice.py` [V]; ebur128 [U] |
| Dead stretches and black frames | `freezedetect=n=-60dB:d=3`, `blackdetect=d=0.1` | [U] (my suggestion, mirroring HyperFrames' `dead_stretch`) |
| Silence and Whisper tail | `silencedetect=noise=-35dB:d=0.6` | HyperFrames [V] |

### 7.3 Scoring

HyperFrames explicitly rejects numeric scores: "Never score the film out of 10: a score finds nothing to fix." Instead it ranks notes:
- **P0** "breaks the read or the contract";
- **P1** "weakens the film";
- **P2** "polish".

Format: `t=4.2s · where · problem → exact change · what stays`. "A film that feels busy: remove a third of the motion and keep the moves that lead the eye." [V]

Since your internal audit gives 40–65/100, consider converting it to P0/P1 lines plus the checklists in §3.4 (Lottie) and §3.7 (haidrrrry), so each point lost maps to one concrete fix.

The review questions table (HyperFrames [V]) can serve as your rubric:

| Question | What it catches |
|---|---|
| Does it read as what it is? | a shape or material that reads as something else |
| Does the subject separate? | subject too close to the ground in value; two focal points |
| Framing and contact | crops, text at an edge or under platform UI |
| Timing as a first-time viewer | a read shorter than its words; pops with no move; jumps at cuts |
| Tells | generated-film defaults on screen |
| The pictures alone | with the words covered, do the frames still tell the story? |
| The phone sheet | can every line be read at 360 px? |

---

## 8. Q-ROSITY: blocky characters and "what if" POV in code

### 8.1 Proven approaches

1. **Remotion + R3F with a hand-built R6/Minecraft rig** (recommended if you stay in one stack).
   - **Rig:** `<group>` hierarchy made of `boxGeometry` parts: torso, head, two arms and two legs, each pivoted at the shoulder or hip by offsetting the mesh inside its group.
   - **Rules:** wrap the scene in `<ThreeCanvas width height>`, add lights, never use `useFrame`, and set `<Sequence layout="none">` inside the canvas [V remotion skill 3d.md]. Set `Config.setChromiumOpenGlRenderer('angle')` [V docs/three.md].
   - **Walk-cycle math** to drive from `t = frame / fps`, copied from skinview3d's `WalkingAnimation` [V source]:
     ```ts
     const t = (frame / fps) * 8;            // skinview3d: progress * 8
     leftLeg.rotation.x  = Math.sin(t) * 0.5;
     rightLeg.rotation.x = Math.sin(t + Math.PI) * 0.5;
     leftArm.rotation.x  = Math.sin(t + Math.PI) * 0.5;
     rightArm.rotation.x = Math.sin(t) * 0.5;
     leftArm.rotation.z  =  Math.cos(t) * 0.03 + Math.PI * 0.02;
     rightArm.rotation.z =  Math.cos(t + Math.PI) * 0.03 - Math.PI * 0.02;
     head.rotation.y = Math.sin(t / 4) * 0.2; head.rotation.x = Math.sin(t / 5) * 0.1;
     ```
     skinview3d (740★, Three.js, last commit 2026-05-02) also has Idle, Running, Flying, Wave, Crouch, Hit and Swim animations [V]. Its `update()` advances `progress` by wall-clock delta, so for Remotion copy the formulas, or set `progress` from the frame. That second option is my inference [U].
2. **Blockbench model → glTF → R3F.** Export via File > Export > glTF model with animations; a group-based rig is simpler than armatures [U Defold forum]. Blockbench before 4.7.0 flipped texture Y on glTF export [U Luanti docs]. Blockbench itself is active (last commit 2026-10-18) [V]. To play glTF clips deterministically in Remotion, call `mixer.setTime(frame / fps)` each frame instead of `mixer.update(delta)`. That is my inference from Remotion's "driven by useCurrentFrame()" rule and from FrameVideo's `mixer.setTime(time)` pattern [U].
3. **Headless Blender from a Python build script** (finnardley's Roblox-style horror Short, Oct 31 2026; 17K views, 433 saves) [V via motion-graphics.org]:
   - **Output:** 1080×1920, 30 fps, 40–50 s, about 36 shots with a cut every 0.5–2.5 s.
   - **Characters:** "R6 block characters with flat cartoon face decals that you draw" (no Roblox assets).
   - **Palette:** sky #212B54 → #060917; moon #9EB8FF at strength 0.55; grass #336B24 → #42802B; road #212126 → #2E2E33 with a #FAC726 centre line; window light #FCC773; threat #0D0D0F.
   - **Lighting:** "Warm practicals do the work".
   - **Technique:** "constant-interpolation keyframes so everything snaps" (the Roblox feel); Eevee render.
   - **Audio and captions:** ElevenLabs `eleven_multilingual_v2` "Adam"; faster-whisper word timing; monster line pitched down with echo; mix to −13 LUFS; captions Montserrat ExtraBold 104 px, Title Case, white with black outline, key nouns #EC1C24, at 64% height.
   - **Process:** "Ask for the user's story first, show the script before spending voice credits, and check stills before a full render."
   - Caveat: headless Eevee support has varied by Blender version, and the engine identifier changed between 4.2 and 5.0 [U].
4. **Three.js + physics + Playwright capture** (finnardley's stickman survival series; 50K views, 1K saves) [V via aggregator]:
   - Three.js with cannon-es physics, Playwright frame capture, ffmpeg, faster-whisper and Mixkit SFX.
   - "Real 3D low-poly sets with practical lighting" with flat 2D-looking stickmen.
   - Shot library: POV phone, macro, fisheye peephole, low door angle.
   - Format: "Imagine you…" hook, day-count HUD, 3–4 rules that pay off, a twist, and a two-choice ending.
   - This is structurally close to Q-ROSITY's "what if" POV.
5. **HyperFrames** with Three.js drawn from `e.detail.time` in an `hf-seek` listener. Also supports Lottie/dotLottie characters exported from After Effects [V runtimes.md].
6. **2D puppet style:** Hasan's TSX shorts and paper-reel's box mascot ("a box mascot wearing a different hat in each scene") [V].

### 8.2 Character acting rules (HyperFrames `types/character.md`, verbatim) [V]

- "Mood changes go through a take: anticipation, a squash, the new face, a settle. A face never snaps from one state to the next."
- "Code moves every part at once, on one curve, by the same amount. Offset the parts (head leads, arms follow), vary the amounts, and never move both arms, both eyes or a crowd in unison."
- "Contact sells it: feet on the ground, props held by the hand, eyes on what they look at."
- "Each action is one read… play the action fast, and let its meaning land slowly: hold the reaction. A sign or caption that repeats what the action already shows is the classic failure."
- "A rig is a set of parameters over time… Write mood changes as keyed states (`[[t0,"normal"],[t1,"scared"]]`) the rig eases between."
- "Hand-drawn life: redraw the outlines about 12 times a second with a jitter seeded by `Math.floor(t * 12)`."

From `types/3d.md` [V]:
- "One hero object beats a crowd. Fly through or into it rather than orbiting it."
- "Simulate once at load… then look up the state at `t`."
- "warm key, a cool rim… contact shadow."
- "Bloom eats detail… One NaN pixel turns a whole frame black through bloom: clamp values."
- "Seed every random choice."

### 8.3 Examples of "what if" / blocky channels

- **finnardley** (X @finnardley): Roblox-style horror Short and stickman survival series, both code-built [V via aggregator].
- **Krash_animates:** "Roblox-style animation from Opus 5.5", a 6 s YouTube Short with 51K views ([youtube.com/shorts/8zxeaaI436k](https://www.youtube.com/shorts/8zxeaaI436k)) [U; listed on motion-graphics.org, not watched].
- **"What If Animations"** ([@WhatIfAnimations2](https://www.youtube.com/@WhatIfAnimations2/shorts)): POV shorts about impossible things; the channel reportedly says "every episode is a 3D scene built from code" [U snippet]. Not blocky style.
- **SyphoDev `roblox-ai-skills`:** Claude Code skills that author R15/R6 animations headlessly in Blender from a pose spec [U snippet].

---

## 9. Ranked creators: best-looking Claude- or code-made motion reels

**Method caveat.** I could not watch videos (YouTube was bot-blocked and X returned 402). The ranking weighs: (a) how detailed and craft-specific the documented method is; (b) saves and engagement where shown on motion-graphics.org; (c) relevance to your two formats. Treat the visual-quality judgement as **unverified**.

| # | Creator | Links | Why they rank here | Tools / method |
|---|---|---|---|---|
| 1 | **HeyGen HyperFrames team** (official launch films) | [github.com/heygen-com/hyperframes](https://github.com/heygen-com/hyperframes), [showcase](https://hyperframes.heygen.com/showcase) [U] | Their motion rules are "Measured frame by frame from the official HyperFrames launch films": the most rigorous published craft spec found | HTML + GSAP, skills, check/snapshot/review loop |
| 2 | **Finn (@finnardley)** | X posts 2114305886420086817 (explainer), 2116504270199554078 (Roblox), 2115786060231770351 (stickman) via [motion-graphics.org](https://motion-graphics.org/) | Kurzgesagt-style explainer: 255K views, **5K saves**. Prompts are exhaustive specs (hex values, px, LUFS, banned lists, still checks). Covers both explainer and blocky-character formats | Canvas/WebGL + Playwright; headless Blender; Three.js + cannon-es; ElevenLabs + faster-whisper |
| 3 | **Hasan (LearnWithHasan)** | [repo](https://github.com/hassancs91/claude-faceless-shorts-creator), [guide](https://learnwithhasan.com/guide/how-to-make-faceless-youtube-shorts-with-claude-code/) | 12 complete open shorts, including a money-math short structurally identical to The Signal; the best documented sync and SFX discipline | Remotion + ElevenLabs timestamps + ffmpeg mix, `brand.md`, phone-scale QA |
| 4 | **Haider Farooq (paper-reel)** | [repo](https://github.com/haiderfarooq3/paper-reel), [write-up](https://haiderfarooq.dev/blog/paper-reel-explainer-reels-in-code) | Look matched to a reference reel with measured numbers; automated text and determinism checks | Canvas + Playwright, Kokoro, whisper.cpp |
| 5 | **@stephanlivera / @donaldjewkes / @shneural** | via motion-graphics.org | Most viral Opus 5.5 pieces (2.3M, 4M and 1.9M views). Visually ambitious but one-off and generic in brief | Opus 5.5 at max effort, JS animation |
| 6 | **Remotion team / @JNYBGR (Jonny Burger)** | [remotion.dev/prompts](https://www.remotion.dev/prompts) | Short prompts that work because the skill carries the craft; maps, 3D landmarks, rough.js highlight | Claude Code + Remotion skills |
| 7 | **@DilumSanjaya** | [prompt](https://www.remotion.dev/prompts/threejs-top-20-games-sold-ranking-1) | 3D data "tower" ranking with a 60 fps camera climb in R3F; directly applicable to price rankings | Remotion + R3F |
| 8 | **haidrrrry** (claude-remotion-skill) | [repo](https://github.com/haidrrrry/claude-remotion-skill) | Strong pre-delivery checklist and theme tokens (770★) | Remotion skill |
| 9 | **@kloss_xyz** | via motion-graphics.org | Liquid-chrome 3D showreel with a "detailed style brief" (HDR HEVC export) | Opus 5.5 |
| 10 | **Krash_animates** | [Short](https://www.youtube.com/shorts/8zxeaaI436k) [U] | Roblox-style animation from Opus 5.5 (51K views) | unknown |
| 11 | **Sabrina Ramonov** | [sabrina.dev](https://www.sabrina.dev/p/claude-just-changed-content-creation-remotion-video) | Clear beginner workflow (9:16, safe zones, fact-check pass); less polished output by her own account | Remotion skill + Claude in Chrome |
| 12 | **@rick.theengineer** | via [brainrotshorts](https://www.brainrotshorts.com/blog/how-to-make-animated-explainer-reels) | Animated-character tech explainers (108K followers, top reels 607K–954K views); consistent presenter. Tool is not Claude-specific | "AI Motion Graphics Generator" [U] |

**Non-AI reference channels worth studying for the price-psychology and data style.** I did not open these in this session, so all are [U]:
- Kurzgesagt: the look finnardley explicitly imitated.
- Vox explainers and Polymatter: data storytelling, annotated charts.
- Wendover Productions; Johnny Harris: map and data explainers.
- Bloomberg Quicktake, WSJ and The Economist video explainers: number-led motion graphics.
- Visual Capitalist and Chartr/Sherwood: chart-first social posts.
- 3Blue1Brown: Manim; one diagram that grows.
- For price psychology content, not style: Phill Agnew's Nudge and Rory Sutherland talks.

Use them through the reference-matching workflow (§2.4): sample frames and write the grammar down as numbers. Do not copy their content.

---

## 10. Where the sources disagree

1. **Idle motion.** haidrrrry: "Idle elements breathe: anything on screen >2s gets sin-wave micro-motion." HyperFrames: "breathing, floating or pulsing loops standing in for motion on titles and UI" is a generated-film tell; "a landed title is dead still". Recommendation: follow HyperFrames for text and UI; slow drift is acceptable only for background layers (Hasan: "slow drifting… gradient blobs… 8–20s loops").
2. **SFX offset.** "2–3 frames BEFORE" (haidrrrry) versus "peak lands one frame after its picture" (HyperFrames). These are compatible if the clip *starts* early and its *peak* lands about 1 frame after the visual. Measure each file's peak.
3. **Caption height.** Hasan ~y1500, HyperFrames y≈1220–1320, Meta's bottom 35% (y>1248) is UI. For cross-posting, y≈1230–1300 is the safest compromise.
4. **Default fonts.** Hasan, haidrrrry and Remotion's system prompt default to Inter, Space Grotesk and JetBrains Mono. HyperFrames lists these as where "generated design lands." Pick a distinctive brand face for The Signal.
5. **Spring bounce.** The Remotion `spring()` default (damping 10) bounces. Premium sources say there should be no overshoot (Lottie "Premium 0%", Hasan "No overshoot", Remotion skill `damping: 200`).
6. **"Three versions first" versus "just build it."** HyperFrames and @crispynotfound pitch three storylines first; Hasan writes one plan and waits for "go". Both put a human gate before the expensive steps (voice credits, renders).
7. **Exit length.** 40–50% shorter (HyperFrames) versus 65–75% of the entrance (Lottie) versus about half (haidrrrry, 10 vs 20 frames). Any of these works as long as exits are shorter than entrances.

---

## 11. Open questions and unverified items

- **YouTube tutorials (no transcripts; YouTube bot-blocked).** Titles and dates come from search snippets [U]:
  - kXmY6yQa5q4 "Claude Code + Remotion = FREE Motion Graphics Tutorial"
  - N1cMt-SYgAo "How to Customize & Animate Motion Graphics with Claude Code and Remotion" (charts from a Dribbble reference)
  - PFHVxq1S6F0 "Remotion Masterclass"
  - 6_rCyryA6hg "Claude Code Can Now Automate Your Videos (Remotion + Opus 5.5)"
  - WvnRHbB_G3Y stop-motion trailer (Mike Murphy)
  - y4YupFxhAog "Animated reels with HyperFrames and Claude Code"
  - WaOkvUNisN4 "Claude + HyperFrames motion design"
  - fvvRCpCFJYk "Remotion vs HyperFrames, same script"
  - t9MFvSJHLsI "3D motion graphics with Claude, free" (136K views)
  - Remotion's own 5NRAOnKc3c8 "Create motion graphics with AI – Simple tutorial for beginners"

  Run `yt-dlp` with cookies or the transcript API from an unblocked machine to pull these.
- **Claude Motion details.** Aspect ratios (does it support 9:16?), fps, maximum length and audio support are undocumented. It is Team/Enterprise only.
- **HyperFrames star count (77.4k).** This was read from the GitHub page; it is high, so re-check it.
- **TikTok's official safe-zone template.** Third-party pixel values conflict.
- **Platform loudness.** No official LUFS figures from TikTok or Instagram were found.
- **Deterministic glTF playback in Remotion via `mixer.setTime(frame/fps)`.** This is inferred and not confirmed in Remotion docs; test it.
- **Headless Blender Eevee.** Support varies by version; test on your build.
- **Ranking visual quality.** The ranking is not based on my own viewing.
- **Reddit.** No relevant threads from r/ClaudeAI, r/ClaudeCode or r/Remotion appeared in searches; there may be gaps.
- **`haidrrrry` and Hasan safe-zone values.** These are creator choices, not platform specs.

---

## 12. Sources

### VERIFIED (opened and read)

**Remotion**
- https://github.com/remotion-dev/skills (cloned; README + SKILL files: remotion-markup/SKILL.md, timing.md, sequencing.md, transitions.md, multi-scene-video.md, voiceover.md, sfx.md, 3d.md, google-fonts.md, measuring-text.md, audio.md, lottie.md; remotion-create/SKILL.md, video-layout.md; remotion-best-practices/SKILL.md; remotion-render/SKILL.md; remotion-captions/display-captions.md, transcribe-captions.md) — GitHub page for stars
- https://github.com/remotion-dev/remotion (stars; blobless clone for last commit; LICENSE.md; packages/template-prompt-to-motion-graphics/src/app/api/generate/route.ts)
- https://github.com/remotion-dev/template-three
- https://www.remotion.dev/llms.txt
- https://www.remotion.dev/docs/ai/ (WebFetch)
- https://www.remotion.dev/docs/ai/coding-agents.md
- https://www.remotion.dev/docs/ai/skills.md
- https://www.remotion.dev/docs/ai/mcp.md
- https://www.remotion.dev/docs/ai/generate.md
- https://www.remotion.dev/docs/ai/chatbot.md
- https://www.remotion.dev/docs/three.md
- https://www.remotion.dev/docs/spring.md
- https://www.remotion.dev/docs/license.md
- https://www.remotion.dev/elements.md
- https://www.remotion.dev/elements/overlays/social-safe-zones.md
- https://www.remotion.dev/elements/data/number-counter.md
- https://www.remotion.dev/prompts (and ?page=2)
- Remotion prompt pages: /prompts/bar-line-chart-combined, /news-article-headline-highlight, /threejs-top-20-games-sold-ranking-1, /real-estate-investing, /launch-video-on-x, /cinematic-tech-intro, /rocket-launches-timeline, /travel-route-on-map-with-3d-landmarks, /product-demo-for-presscut

**HyperFrames**
- https://github.com/heygen-com/hyperframes (stars; cloned: README.md; skills/hyperframes/SKILL.md; references/spec.md, story.md, motion.md, sound.md, review.md, look.md, captions.md, film.md, overlays.md, format.md, runtimes.md, types/vertical.md, data.md, character.md, 3d.md, explainer.md; .claude/skills/motion-doctrine/SKILL.md; docs/guides/claude-design-hyperframes.md; docs/guides/with-claude-code.mdx)

**Anthropic / Claude**
- https://support.claude.com/en/articles/17454997-get-started-with-claude-motion
- https://the-decoder.com/claude-can-now-generate-animated-explainer-videos-and-live-data-dashboards-from-text-prompts/
- https://www.eesel.ai/blog/claude-motion
- https://github.com/dawoodtrumboo/claude-video-export
- https://github.com/anthropics/skills (cloned, directory list)

**Lottie**
- https://docs.lottiefiles.com/en/creator/13_ai-tools/lottie-creator-mcp
- https://lottiefiles.com/blog/working-with-lottie-animations/your-ai-can-now-control-lottie-creator-heres-what-that-actually-means
- https://github.com/LottieFiles/motion-design-skill (cloned: reference/timing-easing-tables.md, quality-checklist.md)
- https://github.com/LottieFiles/dotlottie-web
- https://github.com/airbnb/lottie-web

**Other tools**
- https://github.com/ManimCommunity/manim
- https://github.com/3b1b/manim
- https://github.com/motion-canvas/motion-canvas
- https://github.com/redotvideo/revideo
- https://github.com/davila7/claude-code-templates (cloned: cli-tool/components/skills/video/manim/SKILL.md)

**Creator pipelines and write-ups**
- https://github.com/hassancs91/claude-faceless-shorts-creator (cloned: brand.md, CLAUDE.md, .claude/skills/make-short/SKILL.md, vidtsx-2d-generator/SKILL.md, remotion/src/lib/shorts.tsx, shorts/short-10-fees/script.md + sfx-plan.json, tools/gen_voice.py, mix_music.py, mix_sfx.py)
- https://learnwithhasan.com/guide/how-to-make-faceless-youtube-shorts-with-claude-code/
- https://github.com/haidrrrry/claude-remotion-skill (cloned: SKILL.md, references/design-rules.md, motion-patterns.md, assets/theme.ts)
- https://github.com/Maartenlouis/remotion-ads (cloned: references/formats.md, captions.md)
- https://github.com/haiderfarooq3/paper-reel (cloned: tools/textcheck.mjs, tile.mjs, references/style.md)
- https://haiderfarooq.dev/blog/paper-reel-explainer-reels-in-code
- https://github.com/ThamJiaHe/claude-code-handbook/blob/main/docs/motion-graphics-claude-remotion-guide.md
- https://www.sabrina.dev/p/claude-just-changed-content-creation-remotion-video
- https://motion-graphics.org/ (all three offsets)
- https://roo.beehiiv.com/p/claude-motion-graphics-prompts
- https://www.wireflow.ai/blog/claude-motion-graphics
- https://www.brainrotshorts.com/blog/how-to-make-animated-explainer-reels
- https://get99skills.com/explain-it-in-60

**3D / blocky**
- https://github.com/bs-community/skinview3d (page + cloned src/animation.ts)
- https://github.com/JannisX11/blockbench (clone for last-commit date only)

**Platform specs and voice**
- https://www.hopperhq.com/blog/instagram-reel-size/
- https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps
- https://elevenlabs.io/docs/capabilities/text-to-speech

### UNVERIFIED (search snippets or second-hand only)

- **YouTube videos** (bot-blocked): https://www.youtube.com/watch?v=kXmY6yQa5q4 · https://m.youtube.com/watch?v=N1cMt-SYgAo · https://www.youtube.com/watch?v=qcV1W3uGHXE · https://www.youtube.com/watch?v=PFHVxq1S6F0 · https://www.youtube.com/watch?v=OmM2iUVHR60 · https://www.youtube.com/watch?v=WvnRHbB_G3Y · https://www.youtube.com/watch?v=6_rCyryA6hg · https://www.youtube.com/watch?v=ctNCOCFa3AE · https://www.youtube.com/watch?v=vii97F4Slkw · https://www.youtube.com/watch?v=5NRAOnKc3c8 · https://www.youtube.com/watch?v=fvvRCpCFJYk · https://www.youtube.com/watch?v=WaOkvUNisN4 · https://www.youtube.com/watch?v=y4YupFxhAog · https://www.youtube.com/watch?v=t9MFvSJHLsI · https://www.youtube.com/shorts/8zxeaaI436k · https://www.youtube.com/@WhatIfAnimations2/shorts · https://www.youtube.com/watch?v=54mnfwJJdnE
- **X posts** (402; content seen only via motion-graphics.org): https://x.com/finnardley/status/2116504270199554078 · https://x.com/finnardley/status/2114305886420086817 · https://x.com/finnardley/status/2115786060231770351 · https://x.com/finnardley/status/2112859329825009856 · https://x.com/kloss_xyz/status/2116612471880610054 · https://x.com/DilumSanjaya/status/2018367621381620142
- **HyperFrames showcase and coverage:** https://hyperframes.heygen.com/showcase · https://themenonlab.blog/blog/heygen-hyperframes-video-as-code · https://www.noqta.tn/en/blog/heygen-hyperframes-html-to-mp4-ai-agent-video-2026
- **Remotion tutorials:** https://www.tella.com/blog/how-to-use-remotion-agent-skills-with-claude-code · https://mer.vin/2026/05/remotion-agent-skills-install-remotion-dev-skills-for-claude-code-and-cursor/
- **Imagine with Claude:** https://www.datacamp.com/zh/tutorial/imagine-with-claude · https://www.producthunt.com/products/imagine-with-claude/makers
- **Claude Design export tools:** https://chromewebstore.google.com/detail/claude-design-animations/jfembemahhchnlmbllkcdechmnlhbekd · https://claude2video.com/
- **Manim skill listings:** https://claudskills.com/skills/manim/ · https://skills.browseract.com/skills/davila7_claude-code-templates_manim
- **Blockbench / glTF:** https://forum.defold.com/t/blockbench-animation-guide/82193 · https://docs.luanti.org/for-creators/models/using-blockbench/ · https://sbcode.net/threejs/gltf-custom-animations/
- **Roblox skills:** https://mcp.so/skills/three · https://github.com/SyphoDev-yt/roblox-ai-skills/wiki
- **Blender:** https://developer.blender.org/T64316 · https://unpkg.com/major-ai-skills@2.3.0/skills/blender/SKILL.md
- **Safe-zone tools:** https://admanage.ai/instagram-reels-safe-zone · https://www.socialync.io/tools/safe-zones/tiktok · https://www.revid.ai/tiktok-safe-zone · https://houseofmarketers.com/guide-to-safe-zones-tiktok-facebook-instagram-stories-reels/
- **Loudness:** https://openclip.app/learn/audio-normalization · https://opus.pro/blog/best-loudness-normalizers · https://dev.to/arthurvalle1_a2586dd2b4bc/mastering-for-reels-tiktok-and-youtube-shorts-the-lufs-14-standard-2ck5
- **clean-cut-mcp:** https://glama.ai/mcp/servers/@endlessblink/clean-cut-mcp/blob/13ec46d11f1e6e5f4987cd7f637c23abda34564d/docs/main-docs/MY-ANIMATION-PROBLEMS.md
- **Other Remotion repos:** https://github.com/xzmaheshmahi8088-beep/claude-instagram-autopilot · https://github.com/balarabetahir/-Build-AI-Motion-Graphics-with-Claude-and-Remotion
- **Other:** https://www.mindstudio.ai/blog/remotion-claude-code-animated-logo-reveals-motion-graphics · https://motionbox.io/blog/remotion-for-coding-agents (404) · https://fliki.ai/blog/best-faceless-youtube-niches · https://contentworks.agency/6-instagram-finance-reels-ideas-to-try-this-year/
- **ffmpeg filter documentation** (ebur128, loudnorm, tile, freezedetect, blackdetect): command forms given from general knowledge; docs not opened this session.
- **Reference channels in §9** (Kurzgesagt, Vox, Polymatter, Wendover, Johnny Harris, Bloomberg Quicktake, WSJ, The Economist, Visual Capitalist, Chartr, 3Blue1Brown, Nudge/Phill Agnew): named from general knowledge, not opened.