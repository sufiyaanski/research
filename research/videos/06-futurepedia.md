# 06 — Futurepedia, "Claude Makes a New Kind of Video - Full Tutorial"

| Field | Value |
|---|---|
| Title | Claude Makes a New Kind of Video - Full Tutorial |
| Channel | Futurepedia (https://www.youtube.com/@futurepedia_io), "HubSpot Media" shown on thumbnail |
| URL | https://www.youtube.com/watch?v=Ge1B-Ok1Pfk |
| Published | 2026-10-19 (yt-dlp metadata) |
| Length | 11:19 (yt-dlp metadata) |
| Views at access | 419,665 (2026-11-02) |
| Product used | **Claude** in a chat. The prompts make Claude return "a single HTML file". Whether he used Claude Motion, Claude Design or a plain chat artifact is **[U]**. The "What's New" chapter (0:37) probably covers the Oct 8 Motion launch **[U]**. |

## Sources used (all accessed 2026-11-02)

| Source | Type | Result |
|---|---|---|
| `yt-dlp --write-auto-subs` | transcript | **Blocked** (bot check) |
| `yt-dlp --dump-json` (one plain run) | description + chapters + metadata | **Worked** |
| `youtube-transcript-api` | transcript | **Blocked** (`IpBlocked`) |
| oEmbed | title/channel | Worked |
| Thumbnail `https://i.ytimg.com/vi/Ge1B-Ok1Pfk/maxresdefault.jpg` | thumbnail | Worked (viewed) |
| https://www.futurepedia.io/resources/ai-style-atlas | creator's own resource page (landing + FAQ) | Worked |
| https://www.futurepedia.io/resources/ai-style-atlas/view | creator's own resource page (the atlas) | Worked: style names, families and UI option labels, but **not** the prompt bodies (they are behind a sign-up/"Copy prompt" button) |
| 8 public poster stills on `cdn.futurepedia.io` (linked from the atlas page) | creator's own preview frames | Worked (viewed as a contact sheet) |
| `https://clickhubspot.com/jpok` ("Free: 86 prompts") | gated lead magnet | **Not opened.** It is a HubSpot form link and the brief says no emails. |
| Web search for write-ups | write-ups | Nothing by Futurepedia about this video beyond the atlas pages |

**No transcript and no video frames were available.** The method comes from the creator's description, the chapters and the creator's own Style Atlas pages. Anything else is marked **[U]**.

## Creator's own words (description, verbatim fragments)

- "Claude doesn't have a video generator but it doesn't need one. It does it all through code."
- "a huge free database of 86 styles you can explore and use just by copying the prompt"
- "Even how to sync them up to a voiceover and time them perfectly to the words."

Chapters: 0:00 Intro · 0:37 What's New · 2:06 The Style Atlas · 3:46 Generate with no voiceover · 6:28 Inside the Prompt · 7:35 With a Voiceover.

## The method, step by step

1. **Pick a style in the AI Style Atlas (2:06).** The atlas has 86 styles in 14 families: Hand-Drawn, Painterly, Print, Paper & Craft, Illustration, Art & Design Movements, Retro Digital, Retro UI & Neon, Dimensional, Light & Imaging, Data & Information, Generative & Type, Popular Explainer Looks, and Cosmic & Psychedelic. Every style tells the same 15-second story, "How does AI learn?", so you can compare them. Each also has a "Style clip" that shows how the original frame is built (draw-ons, transitions, textures, timing).
2. **Set the options in the atlas UI** (labels taken from the page source):
   - Topic box: "Your topic or script (optional)."
   - **No voiceover**: "A standalone explainer with a fuller sound mix: effects, ambience and optional music."
   - **With voiceover**: "Timed to your narration: paste its SRT, keep text to key words, and use sparse sound effects that sit under your voice."
   - Voiceover timing field: "paste your SRT or word timestamps (optional, Claude will ask for them otherwise)."
   - **Storyboard first**: "Claude plans the beats and waits for your OK before building (recommended)."
3. **Copy the prompt and paste it into a new Claude chat.** "The prompt includes this style's full source code and a sound kit." In other words, the reference *is* working code, so Claude adapts an existing animation rather than inventing a look from a description.
4. **Claude returns one HTML file.** FAQ: "Claude builds an animated explainer in that style as a single HTML file." "Prompts ask for a 1280x720 canvas you can render frame by frame to MP4."
5. **Generate with no voiceover (3:46–6:28).** This is a demo run. Specifics are **[U]**.
6. **Inside the Prompt (6:28–7:35).** He walks through what the prompt contains. We could not read the prompt text (gated), so its sections are **[U]**. From the public page, it holds the style's full source code, a sound kit, the 1280×720 canvas spec, the frame-by-frame render requirement, and MP4-with-sound export instructions.
7. **With a voiceover (7:35–end, the longest section at about 3.7 min).** He pastes the narration's SRT or word timestamps so the visuals land on the words ("time them perfectly to the words"). On-screen text is cut down to key words and SFX are kept sparse under the voice (page labels). Where the voiceover comes from (his own recording or TTS) is **[U]**.
8. **Export.** "Each prompt asks Claude to make the animation renderable frame by frame, and includes instructions for exporting an MP4 with sound." The export route (an in-browser recorder, or Puppeteer + FFmpeg) is **[U]**.

## Prompts shown

The prompt bodies were not accessible. Public fragments:

- The style blurb inside one card: "Flat-vector science-explainer illustration: deep navy-to-violet space gradients…"
- Another: "Transparent pigment glazed in dozens of ragged low-opacity layers on cold-press paper" (Watercolor Wash).
- Another: "pure black, crisp anti-aliased vector lines" (Manim-Style Math).

Summary of the prompt (from the public page): it gives the style's source code plus a sound kit, your topic, an optional SRT, and storyboard-first mode. It asks for a 1280×720, frame-renderable single HTML file with export-to-MP4-with-sound instructions.

## Tools, MCPs, skills and repos named

- **Claude** (chat). The exact surface is **[U]**.
- **Futurepedia AI Style Atlas:** https://www.futurepedia.io/resources/ai-style-atlas (free sign-up) and https://www.futurepedia.io/resources/ai-style-atlas/view
- **"86 prompts" lead magnet:** https://clickhubspot.com/jpok (HubSpot form; not opened)
- No MCPs, GitHub repos, Remotion or HyperFrames are named in the description.

## Timing and sound tricks

- **SRT / word timestamps → visual beats.** Visuals are timed to the narration's words. The text keeps only key words.
- **Two sound mixes by mode:** without a voiceover, a "fuller sound mix: effects, ambience and optional music"; with a voiceover, "sparse sound effects that sit under your voice". Each style ships a **sound kit** inside the prompt. Whether those sounds are synthesised in code (e.g. WebAudio) or are samples is **[U]**. "Full source code and a sound kit" pasted as text suggests code-generated sound, but this is unconfirmed.
- **Storyboard-first beat approval** happens before any build.
- Preview length: 15 s for one idea. BPM grids and beats.json: nothing found.

## What the result looks like

From the **thumbnail** and **8 atlas poster stills** (the creator's own frames): each style is a fully committed, illustrated world rather than a template. Examples:

- Flat-Vector Science: navy-to-violet space, a cute robot, planets, chunky rounded sans.
- Watercolor Wash: paper texture, a lightbulb with a sprout, a handwritten serif.
- Shadow Puppet Theatre: an amber backlit silhouette owl and cat, with a framed title card.
- Whiteboard: marker strokes; data → neural net → prediction, with a red "fix the error" loop.
- Psychedelic Poster: 70s wavy stripes and a flower eye.
- Tech Glow: a dark-blue node graph with glowing cards and a "97.4%" stat.
- Papercraft Models: a cardboard robot on a cutting mat.
- 1940s Film Noir: black and white, venetian-blind shadows, a CRT.

The thumbnail montages four of these around a shocked face, with the text "INSANE MOTION GRAPHICS" and the Claude logo. How the shots actually move is **[U]**. The "Style clip" labels describe draw-ons, transitions and texture builds.

## Useful for our Remotion pipeline

- **Give Claude working source code as the style reference,** not just adjectives. Futurepedia's whole method is "paste the style's full source code plus a sound kit, then add the topic". For us, that means keeping one finished Remotion scene per look and putting it in the prompt or skill as the canonical example.
- **Make storyboard-first a hard gate.** Claude lists the beats and waits for approval before writing code.
- **Two sound profiles:** with a voiceover, keep SFX sparse and under the voice and cut on-screen text to key words; without a voiceover, use a fuller bed with ambience and effects.
- **Accept SRT or word timestamps as input** and time every text reveal from them. Never hand-type seconds.
- **Use a fixed comparison story** (they use "How does AI learn?" in 15 s) as a regression test whenever we change a style or a skill.
