# 01 · Lukas Margerie: "How to Make Insane Motion Graphics With Opus 5.5"

| | |
|---|---|
| Channel | Lukas Margerie (`@lukas-margerie`, channel UCIZmRlV_wjS8jFQTbRxCV4g) |
| URL | https://www.youtube.com/watch?v=747ZnEtsRbg |
| Uploaded | 2026-09-29 (yt-dlp metadata) |
| Length | 20:16 (1216 s) |
| Views at access | 723,890 |
| Sponsor | Fish Audio (stated in the description) |

## Sources used (accessed 2026-11-02)

| Source | Result |
|---|---|
| `yt-dlp --write-auto-subs` (route 1) | **Blocked.** Subtitle download returned HTTP 429. |
| `yt-dlp --dump-json` (route 1) | **Worked.** Gave title, date, length, tags, chapters, full description and storyboard URLs. |
| `youtube-transcript-api` (route 2) | **Blocked** (`IpBlocked`). |
| oEmbed (route 3) | Worked: title and author only. |
| Watch page by curl (route 3) | Blocked (HTTP 429). |
| Thumbnail `i.ytimg.com/vi/747ZnEtsRbg/maxresdefault.jpg` | Worked. |
| **Storyboard sprites** (YouTube seek-bar previews from `i.ytimg.com/sb/747ZnEtsRbg/storyboard3_L3/M0…M13.jpg`; URLs came from the yt-dlp JSON) | Worked. 123 frames at 320×180, about **one frame every 9.9 s**. I read the key frames after upscaling them. These are **not** a video download: frame text is low-resolution and partly guessed (marked "~"). |
| Video file | Not downloaded. |
| Write-ups (route 4) | Movez's course, which Lukas links in his description and reads on screen. The X post (x.com/0xMovez/status/2104216919033192746) returned HTTP 402. The Substack mirror https://movez.substack.com/p/how-to-build-motion-design-studio was read. The kit page on Lemon Squeezy (store listing) was also read. |

**There is no spoken transcript.** Everything below comes from three things: the description (the creator's own words), text visible in storyboard frames (what he showed on screen), and the Movez course that he shows and credits. Any claim about what he *says* is **[U]**.

## Chapters (creator's own)
0:00 Intro · 1:16 How Opus 5.5 makes videos · 3:59 Motion studio rules · 5:20 Adding a real brand · 7:46 Fish Audio (sponsor) · 10:20 Sound · 10:56 Reference videos · 16:17 Director's brief and critique loop

## Method, step by step (from description + on-screen frames)

1. **The core claim** (description): most people get "a generic AI video with centered text and a gradient". He writes: "The prompt is only 10% of the result. The other 90% is the harness." The frame at 0:59 shows a prompt, "make me a viral launch video, cinematic, 4k", next to a large "10%".
2. **How Opus 5.5 makes video** (frame ~1:19–1:58, a diagram): *Your brief (text + refs) → Opus 5.5 → four routes → MP4.*
   - (1) Code-drawn: Canvas / SVG / ~p5.brush + headless Chrome
   - (2) Frameworks: **Remotion (React) or HyperFrames (HTML)**
   - (3) Mixed pipeline: image and video models, with Opus compositing on top
   - (4) YouTube edit: your clips, cuts, captions, B-roll, PiP

   The tags also name Diffusion Studio. Product used: **Claude Code** (description: "launch videos with Opus 5.5 and Claude Code").
3. **The viral one-liner, taken apart** (frames 4:46–5:16, Movez's X article on screen). The original viral prompt runs on Max effort: "make a dynamic 15-second motion graphics video that shows what an incredible motion designer you are…". The reasons given:
   - "showreel for a résumé" sets a genre with known rules
   - "what an incredible motion designer you are" makes the model the subject, so there is no content to get wrong
   - "15-second" is short enough for one pass and long enough for 6 to 8 shots
   - "go all out" works as an effort multiplier on top of xhigh or max
4. **Motion studio rules file** (frame 4:07, a code block titled "# Motion-studio rules"; the same text is in the Movez course). It has four sections:
   - **Render contract:** "Every film is a pure function of time: `window.seek(t)` paints frame t". No CSS transitions, setTimeout or requestAnimationFrame in render mode. No state carried between frames. Seeded noise only. Render with `node render.mjs` and encode H.264 yuv420p at CRF 16.
   - **Look:** "Banned defaults: centered title on gradient, everything fading in, corner labels and frame borders, glow on UI chrome, generic particle [bursts]". One display face, one UI face, one accent colour unless the brief says otherwise. "Every 2 to 4 seconds something new must happen on screen."
   - **Sound:** "Score and SFX are synthesized in code unless a track is supplied." Place hits on the measured beat grid (beats.json). Loudness −14 LUFS.
   - **Loop before you show me anything:**
     1. Render one frame per beat as a contact sheet and look at it.
     2. Score 1–10 on: hook in first 2 s, readability at phone size, motion quality, variety, brand accuracy, sound sync.
     3. Fix the 3 worst problems. Repeat until every score is ≥ 8.
     4. Only then do the full render.
5. **Adding a real brand** (frames 5:55–7:44). He uses **MagicPath** as the brand; his LinkedIn title reads "Lukas Margerie – MagicPath", so this is likely his own product **[U]**.
   - Brand prompt (frame 6:45), summarised. Opening: "Make a dynamic 20-second motion graphics video for [PRODUCT] ([URL])… Go all out."
     - **Assets:** visit the site, take real screenshots with Playwright, get the real logo, save to `./assets`, and list them before animating. "Never redraw the product UI from imagination."
     - **Story:** one beat each, 2–4 s. (1) Hook: the problem in 5 words of huge kinetic type. (2) The product appears and the UI assembles piece by piece. (3) Three features, each a UI moment with a cursor doing a real action. (4) One proof metric. (5) Logo lockup + CTA.
     - **Sound:** "Original music, 120 BPM, synthesized in code", with UI clicks and whooshes.
     - **Format:** 1080×1920 first, then 1:1 and 16:9 from the same timeline.
     - **Gate:** a contact sheet of one frame per beat before the full render.
   - He also shows a Tony Dinh tweet (frame 6:35). The prompt in it: "Use actual product screenshot/logo/assets" and "Must have music and motion must match the music". It ends "…not like a demo or prototype. Try again, ultracode."
   - Outputs on screen:
     - "MagicPath 'one path': 15 s, 1080p60, a single cursor stroke that ends as the logo"
     - "MagicPath 2.0: 20 s, 60 fps, 16:9, 1:1 and 9:16 from the same timeline" (a "5 designer agents" card on a green field)
     - "MagicPath launch film: 15s, 1920×1080, 60fps, H.264 CRF 16, synthesized score at −14 LUFS… −2.1 dBFS peak"
6. **Voice-over with the Fish Audio MCP** (sponsor, 7:46–10:20). He adds Fish Audio as a custom connector/MCP (frame ~8:53 shows "Add custom connector"). He then asks Claude to generate a 25-second YouTube intro hook in a stock Fish voice (~"Slax"; the frame shows ~414 credits used) and to save an mp3. The description says it can be "your own cloned voice".
7. **Sound on the same timeline** (10:20 chapter; frame 14:39 diagram). The diagram is titled "ONE TIMELINE, THREE LANES · 8 SECONDS AT 120 BPM" and has three lanes:
   - **Music:** beat ticks, with downbeats taller
   - **SFX:** red hit markers labelled ~stomp, click, whoosh, pop, thump, click, whoosh, pop
   - **Picture:** Title slam → UI assembles → Feature 1 → Feature 2

   The caption reads roughly: downbeats carry scene changes, beats carry SFX, and peaks come from beats.json. Frame 13:40: "MagicPath sample: 16 s, 1080p60, 8 bars at 120 BPM. It's a seamless loop."
8. **States on a beat grid** (frame 12:11, cream card). Header ~"(16 seconds) · … 8 bars · 120 BPM… never cut". Sequence: Get started (button) → loader → check → toggle/slider → chart → … Footer ~"each state morphs into the next… seamless loop". This is a UI-morph template **[U: small text]**.
9. **Reference videos** (10:56–16:17). He browses an X gallery ("Discover startup launch videos from X") and examples such as "Say it. Watch it move.", a Steve Jobs story piece ("Fired from his own company" / "1971 Meets Steve Wozniak") and anime-style "full prompt" posts. Per the description: "Stealing the style of a reference video". He also shows "Brand and spec files for consistent results". The method per Movez: extract one frame every 0.5 s → write `docs/style_guide.md` (palette hex, type, shot lengths, transitions, camera moves, texture, how text enters and exits) → write `docs/shotlist.md` on the beat grid → wait for approval. **[U]** that Lukas says exactly this. The skill frame 19:46 confirms "If a reference exists, write docs/style_guide.md from it" and "Write docs/shotlist.md on the beat grid. Show it and wait for OK."
10. **Director's brief** (frames 16:28–17:08; an X post on screen). It has nine sections:
    - **Film in one line:** "the tagline and the joke, so every decision can be checked against it"
    - **References**
    - **Tools & keys**
    - **Character bible**
    - **Beat sheet:** "a visual payoff every 3 to 5 seconds, a hook in the first 3"
    - **Text on screen**
    - **Workflow gates:** plan → rig → stills → animatic → full pass → polish → audio → render; "Don't skip gates."
    - **Critique loop:** render stills, score them, write the 3 worst problems, fix, repeat until every score is 8+
    - **Deliverables:** final MP4, loop check, poster frame, contact sheet, clean source with a README

    An output on screen: "MagicPath 'Design Team': final 45 s film (1080p60, −14 LUFS), poster, one-frame-per-beat contact sheet, seam check" ("Five screens.").
11. **Critique loop diagram** (frame 18:37): Render stills (1 per beat) → Contact sheet → Score 1 to 10 (~"7 axes") → Fix worst 3 → loop back, ~"repeat until every score ≥ 8".
12. **Package as a skill** (frames 19:36–19:46). `name: motion-reel`.
    - Inputs: URL, duration, formats (9:16 / 1:1 / 16:9), brand colours and fonts, a reference, and music (a file or "synthesize").
    - Pipeline:
      1. Playwright assets → `./assets`
      2. style_guide.md from the reference
      3. `beats.py → beats.json`
      4. shotlist.md on the beat grid, then wait for OK
      5. `index.html` with `window.seek(t)` using `lib/motion.js` springs
      6. contact sheet → `prompts/critique.txt` → fix
      7. `node render.mjs → sfx.mjs` → mix to −14 LUFS → `out/final.mp4`, all formats
      8. deliver final.mp4, contact.png, poster.png, and say what you'd improve
    - Hard rules: "Real product UI only. Never invent screens." No `Math.random`, timers or CSS transitions in render mode. Banned: corner labels, centered title on gradient, everything fading.
    - Closing line on screen: "Now the whole course collapses into /motion-reel for [URL], 20s, vertical, reference ./refs/frame.png."

## Prompts shown (brief quotes; rest summarised above)
- "make me a viral launch video, cinematic, 4k" (the bad example, 0:59)
- The viral Opus prompt: "make a dynamic 15-second motion graphics video that shows what an incredible motion designer you are" (4:46)
- Brand prompt: "Make a dynamic 20-second motion graphics video for [PRODUCT] ([URL])… Go all out." (6:45)
- Tony Dinh's re-prompt: "Do it like a real professional production video, not like a demo or prototype." (6:35)
- The rules file, director's brief and skill (quoted in short fragments above)
- Final: "/motion-reel for [URL], 20s, vertical, reference ./refs/frame.png" (19:46)

## Tools, MCPs, skills and repos named
- **Claude Code + Opus 5.5** (Max / xhigh effort)
- **Fish Audio MCP** (S2.1 Pro TTS, voice cloning): https://fish.audio
- **MagicPath:** https://magicpath.ai
- **HyperFrames, Remotion, Diffusion Studio** (description, no links)
- **Playwright** (asset capture), **headless Chrome**, **ffmpeg / H.264 CRF 16** **[U: ffmpeg not named, H.264 is]**
- Movez course: https://x.com/0xMovez/status/2104216919033192746 (mirror: https://movez.substack.com/p/how-to-build-motion-design-studio)
- Lukas's kit, "Motion Reel Kit: beat-synced launch videos, made in code with Claude Code". It is listed at **$0.00+ (pay what you want)** in his Lemon Squeezy store: https://lukas-margerie.lemonsqueezy.com/checkout/buy/e5d01fe1-eb84-4e7b-bc6f-1351ab5d8fb7 (contents not inspected; it needs checkout)
- Follow-up video: "I Found 8 Tools That Make Opus 5.5 Motion Graphics Better" (https://www.youtube.com/watch?v=oA8z3LrEjU0)

## Timing and sound tricks
- **120 BPM grid.** 8 bars = 16 s (one bar = 2 s). Downbeats carry scene changes, beats carry SFX hits.
- **beats.json** (BPM, beats, downbeats, hits), produced by `beats.py` from a supplied track or a synthesized score.
- **SFX synthesized in code** (`sfx.mjs`). Labels seen: stomp/thump, click, whoosh, pop. Movez's course defines click as a short high sine, thump as a low descending sine, and whoosh as noise with a sine envelope, at 48 kHz/16-bit. Mix to **−14 LUFS**, peak about −2.1 dBFS.
- **Shot length:** one story beat per 2–4 s, something new every 2–4 s, a payoff every 3–5 s, a hook in the first 2–3 s. A 15-second film holds 6–8 shots.
- **Text entry and exit:** banned "everything fading in". The hook is "5 words of huge kinetic type", and UI "assembles itself piece by piece". Exact entry curves **[U]**.
- **Seamless loops:** the last frame matches the first, with a "seam check".

## What the results look like (frames and thumbnail)
- **Thumbnail:**
  - A grid of output cards on an off-white dotted background: an orange-red card reading "CLAUDE / motion designer" (heavy black grotesk plus a script subtitle), a blue card with "MORPH CIRCLE = TRIANGLE", and a squash-and-stretch ball diagram with handwritten blue annotations.
  - A "linear = robotic / ease in-out ✓" graph, a checkout UI card ($149 / "$9 / month"), dithered 3D characters, a pixel-art orange mascot, and pastel product cards (Courses / Ebooks / Presets / Apps).
  - Title type: bold black grotesk and glossy 3D red "Full Tutorial".
- **In-video outputs:** warm cream/off-white grounds with a coral accent ("Claude ✳ motion designer" in a serif), clean product-UI cards driven by a cursor, MagicPath green, a "Generate." white-on-dark grotesk, and a deep-blue morph piece.
- Style: UI-centred launch-film grammar (cursor actions, UI assembling, number proof, logo lockup) with springy motion (`lib/motion.js` springs).

## Useful for our Remotion pipeline
- Port the **render contract** straight to Remotion. Every frame is a pure function of `useCurrentFrame()`, with no CSS transitions or timers, seeded randomness (`random(seed)`), and a determinism check (render a frame twice and compare hashes).
- Keep a **beats.json** (BPM, beats, downbeats, hits). Drive `<Sequence>` starts from downbeats and SFX `<Audio>` from hits, with 120 BPM / 8 bars = 16 s as the default grid.
- **Gate the full render** behind a contact sheet: `npx remotion still` at one frame per beat, then a score on six axes (hook ≤ 2 s, phone readability, motion, variety, brand accuracy, sound sync). Fix the worst 3 and loop until all are ≥ 8.
- Add a **ban list** to CLAUDE.md: centred title on gradient, everything fading in, corner labels and frame borders, glow on UI chrome, generic particles. Allow one display face, one UI face and one accent colour.
- Use **real assets only**: grab screenshots and logos with Playwright into `public/assets`. Never redraw the UI.
- Render **one timeline into three aspect ratios** (9:16 first, then 1:1 and 16:9) through composition props.

## Claim checks (from frames, description and the Movez course he shows)
| Claim | Verdict |
|---|---|
| 4-part harness matters more than the prompt ("90% harness, 10% prompt") | **CONFIRMED**. Description: "The prompt is only 10% of the result. The other 90% is the harness". Frame 4:07 shows a "Motion-studio rules" file with 4 sections: Render contract, Look, Sound, Loop before you show me anything. The names differ a little from the claim ("Look", not "Look bans"; "Loop before you show me anything", not "Feedback Loop"). The rules come from Movez's course, which he shows and credits. |
| References → style-guide .md → shot list as states on a beat grid (120 BPM) → build | **CONFIRMED in outline.** Skill frame 19:46: "write docs/style_guide.md from [reference]", `beats.py → beats.json`, "docs/shotlist.md on the beat grid… wait for OK", then build `index.html`. 120 BPM is in the brand prompt and in frames 13:40 and 14:39. The UI-state sequence on a 120 BPM grid is at 12:11 (small text, ~). The style-guide fields (palette, type, shot lengths, transitions, camera, texture/grain, text in/out) come from the Movez course; they are not legible in Lukas's frames. |
| Sound made in code on the same timeline: music bed + beats.json; SFX synthesised in Node (click on press, whoosh on morph, thump on logo) | **Mostly CONFIRMED.** Rules: "Score and SFX are synthesized in code unless a track is supplied", hits on the beat grid (beats.json), −14 LUFS. Frame 14:39: "One timeline, three lanes · 8 s at 120 BPM" (Music / SFX / Picture). SFX labels seen: click, whoosh, pop, thump, stomp. The `sfx.mjs` (Node) step is in the skill. The exact mapping (click on press, whoosh on morph, thump on logo) is **UNCONFIRMED**. |
| Self-critique: screenshot the middle frame of each shot, score story/composition/motion/type/sync 1–10, fix 3 worst, repeat until every shot ≥ 8 | **PARTLY CONTRADICTED.** Frames show "one frame per beat as a contact sheet" (not the middle frame of each shot). The axes are hook in first 2 s, readability at phone size, motion quality, variety, brand accuracy, sound sync (not story/composition/type). "Fix the 3 worst" and "repeat until every score ≥ 8" are **CONFIRMED** (frames 4:07, 16:28, 18:37). |
| "Crew" prompt (director, writer, animator, composer, sound designer, render engineer) plus a story | **UNCONFIRMED** as a six-role crew. The director's brief on screen (16:28) has sections (film in one line, references, tools, character bible, beat sheet, text on screen, workflow gates, critique loop, deliverables) but no crew roles are legible. Movez's course lists only 4 roles (director, animator, sound designer, render engineer); there is no writer or composer. The **story part is CONFIRMED** ("Film in one line… the tagline and the joke"; a 5-beat story in the brand prompt). |
| Ban default looks by name | **CONFIRMED.** "Banned defaults: centered title on gradient, everything fading in, corner labels and frame borders, glow on UI chrome, generic particle…", plus "one display face, one UI face, one accent colour". Default fonts are not banned by name. |
| Targeted fixes that lock what works, not restarts | **PARTLY.** "Fix the 3 worst problems" is targeted. Per the Movez course, it re-renders only the affected seconds. "Lock what works" is **UNCONFIRMED**. |
| Paid/hosted parts | **Fish Audio:** S2.1 Pro API $15 per 1M UTF-8 bytes. "S2.1 Pro Free" is free through 2026-11-30 with no SLA. Lukas's link gives 10,000 free credits; this is the sponsor. **Lukas's kit:** $0+ pay-what-you-want. **MagicPath:** the demo brand, likely his employer **[U]**. **Claude Motion artifacts, Pixels MCP, Higgsfield:** not used or found in this video. |
