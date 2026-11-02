# 10 — AI and Tech for Education: "How to Make Insane Motion Animations with Claude!"

- **Channel:** AI and Tech for Education (https://www.youtube.com/@AIandTechforEducation)
- **URL:** https://www.youtube.com/watch?v=9T18XMCTER8
- **Upload date:** 2026-10-09 (yt-dlp metadata).
- **Length:** 8:02. Views about 19k at access.
- **Sources used (all accessed 2026-11-02):**
  - Transcript: **not obtained.**
    - yt-dlp found the English auto-captions but the download returned `HTTP Error 429: Too Many Requests`.
    - youtube-transcript-api returned `IpBlocked`.
  - Metadata, description and chapters: `yt-dlp --dump-json` (worked).
  - oEmbed (worked) and thumbnail https://i.ytimg.com/vi/9T18XMCTER8/maxresdefault.jpg (worked). No frames.
  - **Creator's public Drive folder** "Video resources", linked from the description: https://drive.google.com/drive/folders/17WuOE8Na7GjefTIwuby2HQ0Q5qe6aQVD. Files listed: `CLAUDE_1.md` and the Google Doc "Claude Animation Tutorial: Complete Prompt Pack".
    - `CLAUDE_1.md`: https://drive.google.com/uc?export=download&id=1TAP-ToNz2aMAi46jY_ofQcASoFLjhv2_ (worked, 4 KB).
    - Prompt Pack: https://docs.google.com/document/d/1vhaIJX3peK4BIQNq8lRNzXDxfS7Jy2DOa9ahTi6yvZQ/export?format=txt (worked, 8 KB). It says it "follows the sequence shown in the recording".
  - "Movez article" linked in the description: https://x.com/0xMovez/status/2104216919033192746. **Blocked** (HTTP 402 from X). A web search did not find a copy.
- **Confirmation note:** The CLAUDE.md and the prompt pack are the creator's own files, but they were **not checked against the spoken video**. What was shown on screen at each step is **[U]**.

## Chapters (description)
0:00 Introduction to AI animation · 0:53 Configuring Claude · 1:28 Preparing the rules file · 3:30 Defining the animation brief · 4:42 Character and storyboard review · 5:22 Generating the animation draft · 5:49 Finalizing the video · 7:18 Workflow automation tips.

## Description summary
- "This whole animation was made with Claude, even the music."
- Steps listed: set up Claude, write the first prompt, use a **CLAUDE.md instructions file**, review the **character and storyboard**, **check the animation before adding sound**, then ask Claude for the **soundtrack** and render the final **MP4**.

## Method, step by step (from the creator's CLAUDE.md and Prompt Pack)
1. **Claude product.** The pack says to use the prompts "with CLAUDE.md attached to your Claude chat, or saved in your Claude Code project folder".
   - The CLAUDE.md mentions "Claude app downloads are capped at 30 MB", so the demo is probably the **Claude app with code execution**. **[U]** which product appears on screen.
   - No Remotion and no HyperFrames. It is a **custom canvas engine**.
2. **Rules file (CLAUDE.md "House rules: motion videos")** has six sections.
   - **How we build:**
     - A frame-deterministic `render(ctx, t)` on a 1920×1080 canvas, with no stored state.
     - One file per piece: character module `pip.js` with `drawCharacter(ctx, opts)`, `film.js` for scenes, timeline and transitions, and `sound.py`.
     - **One timing source:** `film.js` exports `events()`, saved to `events.json`, which `sound.py` reads.
     - Rendering: headless Chromium via Playwright, frames piped as JPEG into ffmpeg (H.264, yuv420p, +faststart).
     - Fonts come from `@fontsource/*`, inlined as base64.
     - `render-all.mjs` renders in parallel across CPU cores and then muxes `score.wav`.
     - Maps come from `world-atlas`, `d3-geo` and `topojson-client`.
     - Characters are drawn in code from simple shapes with an ink outline.
   - **Approval gates** (stop and wait at each):
     1. **Character sheet:** a turnaround (front, ¾, side, back), 5 expressions, palette, props and 4–5 rules.
     2. **Storyboard:** 6–9 key frames rendered from the real film code, each with a title, action and timestamp.
     3. **Silent motion draft:** 960×540, 30 fps.
     4. **Final:** 1080p with sound.
   - **Speed and token rules:**
     - 30 fps by default.
     - Every check uses **one contact-sheet image** (ffmpeg `select` + `tile`).
     - **At most one critique pass per gate.** Never loop on full-resolution renders.
     - Render full resolution once, at the end.
     - Compose `sound.py` while the final render runs in the background.
     - Check loudness numerically (RMS per 2-second window).
     - Keep replies short.
   - **Quality bar:**
     - 5–8 named colours and 2 typefaces (a characterful display face plus a mono or text face).
     - Consistent outline weight and light direction.
     - Ease in and out, overshoot on arrivals, anticipation, camera push-ins, parallax.
     - **Designed transitions** (iris, match cut, dive), "not plain crossfades".
     - **Bans generic "AI video" looks by name.**
     - Readable text, on backing cards when the background is busy.
     - **Sound:** a 120 BPM grid with chord pad, bass, a lead that changes per scene, light percussion and SFX for every key action, all synthesised.
   - **Originality and safety:**
     - Characters must be original.
     - Avoid copyrighted designs, for example showing the Eiffel Tower only as an unlit silhouette.
     - Use only public-domain or self-made assets.
   - **Delivery:**
     - MP4 with H.264 + AAC at 1080p, re-encoded with a 2-pass bitrate if a size cap applies.
     - A source zip with a README listing four commands.
3. **Brief** ("Pip Sees the World", 40 s, 16:9, 30 fps): character spec, then a **timestamped story at 120 BPM with major actions on the beat**, then Look, Sound and the review sequence. It starts with the character sheet only.
4. **Gate loop:** revise the character, approve it, get a storyboard from the scene code, approve that, then a silent draft plus a contact sheet. Optionally change the timing, then approve and add sound to get the final MP4. Optionally adjust the sound, then download a source ZIP.
5. **Close of the video:**
   - Turn the finished conversation into a reusable **CLAUDE.md** with Prompt 1, or update an existing one with Prompt 2.
   - Optionally use a "**motion-video-studio**" skill that the creator supplies.
   - The skill file was **not in the public Drive folder** at access, so it is **[U]**.

## Prompts (quoted briefly, then summarised; all from the Prompt Pack)
1. **Write a rules file:** "Based on everything we did in this conversation, write a CLAUDE.md file with instructions for making motion videos."
   - Include what worked, what was slow and the fixes that were actually tested.
   - "Do not turn guesses into rules."
   - Use the six named sections.
   - Include only tested commands, under 150 lines.
2. **Update a rules file:** "Review CLAUDE.md against what we learned in this project."
   - Propose changes the results support, remove duplicates or conflicts, and wait for approval.
3. **Full brief:** "Make a 40-second, 16:9, 30 fps animated short called 'Pip Sees the World'."
   - Pip is a teapot-bodied robot on one wheel. A coral lid serves as his head, with a dark visor, glowing eyes and an antenna light that shows emotion. Steam puffs when he is happy. He has a backpack and a passport.
   - The story runs in timestamped blocks: 0–4 workshop, 4–7 packing, 7–10 a dive into the globe and a route draw, then Japan, France, Egypt and Iceland at 5 s each with a passport stamp, 30–35 map pull-back, 35–40 postcards and the title.
   - **Look:** flat illustration, 4 px dark ink outlines, warm palette, subtle paper grain, numbered country title cards, a corner route map.
   - **Sound:** original music and SFX in code, no samples, no voiceover, using the animation's timing data.
4. **Character revision:** "Make Pip's eyes slightly larger. Keep his body, colours and props unchanged."
5. **Approve and storyboard:** "Approved. Use this character design throughout the film." It asks for a storyboard from the actual scene code, with timestamps and captions.
6. **Silent draft:** "Approved. Render the full 40-second motion draft at 960×540, 30 fps, without sound." It asks for one contact sheet as well.
7. **Timing change:** "Hold the passport shot one second longer and shorten the map dive to keep the overall duration at 40 seconds." Everything else stays unchanged.
8. **Sound pass:** "Generate the soundtrack and sound effects using the animation's timing data." Original, at 120 BPM, with stamps lined up to the action, rendered at 1080p30.
9. **Sound adjustment:** "The music is too busy in the Iceland scene. Keep only the pad and bells there." Other scenes stay unchanged.
10. **Source download:** package the source ZIP with a README, without regenerating anything.
11. **Skill reuse:** "Use the motion-video-studio skill to make a 20-second illustrated animation about a small robot growing its first plant."
12. **Template:** the same brief with angle-bracket fields for length, aspect ratio, character and signal, story blocks at `<tempo>` BPM, look and sound.

## Tools / MCPs / skills / repos named
- Claude (chat app with file creation, or Claude Code) plus a **CLAUDE.md** rules file. No MCPs are named.
- Playwright with headless Chromium, ffmpeg, Python (`sound.py`) and Node (`render-all.mjs`).
- npm packages: `@fontsource/*`, `world-atlas`, `d3-geo`, `topojson-client`.
- Natural Earth map data, via world-atlas.
- "motion-video-studio" skill: creator-supplied, not found publicly. **[U]**
- Movez article on X: https://x.com/0xMovez/status/2104216919033192746. Blocked, contents **[U]**.

## Timing and sound tricks
- **A 120 BPM grid**, with major story actions timed to the beat and the brief written as second-ranges. Scene lengths are 3–5 s: 4, 3, 3, then 5 s blocks.
- **`events.json` as the single timing source.** `film.js` exports events (stamp hits, item pops, transitions, title) and `sound.py` reads them, so every SFX lands on its frame. This is the creator's own version of the "beats.json" idea, except here the events come from the picture and drive the audio.
- **Fully synthesised score in Python:** chord pad, bass, a per-scene lead instrument, light percussion and SFX for every key action. No samples and nothing to license. Loudness is checked numerically as RMS per 2 s.
- **Picture before sound:** the silent draft is approved before any music is written.
- **Text:** readable on backing cards, numbered title cards per country, and an end title.
  - Entry and exit style is not specified beyond "ease in/out, overshoot on arrivals, anticipation". **[U]**
- **Transitions:** iris, match cut and a camera "dive" into the globe. No plain crossfades.

## What the result looks like (thumbnail; the video itself is **[U]**)
- The thumbnail shows **Pip**: a cream teapot robot with an orange-coral lid, a glowing cyan visor with smiling eyes, a brown backpack, a passport stamp book and one wheel.
- He sits in front of tilted **postcards**: Mount Fuji with cherry blossom, the Eiffel Tower at dusk (lit in the thumbnail), and aurora over a lake with a red cabin. A cyan music-note ribbon floats nearby.
- **Palette:** warm cream, coral or orange, teal and sunset gold on dark navy.
- **Type:** a heavy condensed sans in cream and orange ("CLAUDE MADE THIS") and a Claude logo chip.
- The thumbnail is painterly and looks **AI-illustrated**, not the flat 4 px-outline canvas style the brief asks for. **[U]** whether it is a real frame.

## Useful for our Remotion pipeline
- **Copy the gate sequence:** character or style sheet, then storyboard from the real composition (`remotion still` on 6–9 frames), then a low-res silent draft, then the final with sound. Stop for approval at each gate.
- **One timing source:** export an `events.json` (or `beats.json`) from the composition's scene table and drive SFX placement from it, so audio and picture can't drift.
- **Contact sheet, not stills:** review each pass from one ffmpeg `select+tile` image. Allow at most one critique pass per gate, and render full resolution once.
- **Generate CLAUDE.md from a finished project** with "Do not turn guesses into rules" and "only commands we tested". This is a good way to grow our house rules.
- **Ban looks by name in the rules file** ("centred text on a purple-blue gradient, emoji as graphics, everything centred, stock glow on everything"). Ask for designed transitions, not plain crossfades.
- **Lock what works when revising:** each fix prompt names what changes and says "Keep … unchanged".

## Claim checks
- **4-part harness, "90% harness":** PARTLY CONFIRMED. The rules file is central: CLAUDE.md "House rules", plus prompts to generate and update it. But it has **6** different sections (How we build / Approval gates / Speed and token rules / Quality bar / Originality and safety / Delivery), not Render Contract / Look bans / Sound / Feedback Loop. There is no "90/10" quote.
- **References → style-guide .md → shot list on a beat grid → build:** PARTLY CONFIRMED.
  - A timestamped shot list at **120 BPM with major actions on the beat** is in the brief.
  - Look specs (palette, outline, grain, title cards) are in the brief, and the quality bar is in CLAUDE.md.
  - The style is set through a character sheet and a storyboard, not a references → style-guide .md step.
- **Sound in code on the same timeline:** CONFIRMED in substance, different in detail. `film.js` exports `events()` → `events.json` → `sound.py` places SFX on frames. The 120 BPM synthesised pad, bass, lead and percussion plus SFX all come from CLAUDE.md. It uses **Python, not Node**, and events.json, not beats.json.
- **Self-critique loop until every shot ≥ 8:** CONTRADICTED. CLAUDE.md says "At most one critique pass per gate. Never loop on full-resolution renders". Checks use one contact sheet, and a human approves each gate. No scores.
- **"Crew" prompt:** UNCONFIRMED. There is a single role: "You are the motion designer and engineer".
- **Ban default looks by name:** CONFIRMED (CLAUDE.md): "Avoid generic 'AI video' looks: centred text on a purple-blue gradient, emoji as graphics, everything centred, stock glow on everything", and transitions "not plain crossfades".
- **Targeted fixes that lock what works:** CONFIRMED (Prompt Pack): "Make Pip's eyes slightly larger. Keep his body, colours and props unchanged". There are also timing and sound fixes with "Keep … unchanged".
