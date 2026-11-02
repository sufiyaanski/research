# 12 — Exploring AI | James B: "Create INSANE Motion Graphics With Claude Code & Remotion | Easy Guide"

- **Channel:** Exploring AI | James B (https://www.youtube.com/@ExploringAIWithJames)
- **URL:** https://www.youtube.com/watch?v=OmM2iUVHR60
- **Upload date:** unknown. Metadata was blocked. He says he has used it "for about a month" and recommends "Opus 4.6", which suggests an earlier upload than videos 9–11. **[U]**
- **Length:** about 10:10, from the last caption cue at 10:08.
- **Sources used (all accessed 2026-11-02):**
  - **Transcript: obtained.** `yt-dlp --skip-download --write-auto-subs --sub-langs en --sub-format vtt` worked (auto-captions, 115 KB VTT, about 326 cleaned lines).
  - Metadata and description: **blocked.** `--dump-json` hit "Sign in to confirm you're not a bot". The watch page redirected to google.com/sorry. So there is no description, no date and no links.
  - oEmbed: worked, giving the title and channel.
  - Thumbnail https://i.ytimg.com/vi/OmM2iUVHR60/maxresdefault.jpg: worked. No frames.
  - Web search for a write-up or style-guide resource by the creator found nothing.
- Everything below is from the **transcript** unless marked **[U]**.

## Method, step by step (transcript)
1. **Claude Cowork** (Cowork tab, then select a folder, e.g. "Remotion example"), or **Claude Code inside an IDE** (he uses Cursor plus Claude Code).
2. **Install Remotion:** copy `npx create-video@latest` from remotion.dev and paste it into Claude. "Claude Code will then walk you through the process of installing it."
   - This creates `my-video/` and `node_modules/`.
   - "This is the package and skill for Remotion." **[U]** whether the Remotion agent skills were installed separately.
3. **Folders that matter:**
   - `public/` for assets: brand images, logos, product PNGs.
   - `out/` for renders.
4. **Prompt for a plan first, using Opus 4.6.**
   - Claude browses nike.com to pull "design styles, fonts, color palette".
   - It returns a **plan of 5 scenes with durations and contents**, which you can edit before the build.
   - He advises putting your own visual ideas into the first prompt.
5. **Build, then preview in Remotion Studio on localhost.** "Just ask Claude to open Remotion for you." The new build overwrote the previous composition file.
6. **Targeted revision prompt** (below).
   - Claude removed the "spring bounce, float, and rotation" and replaced them with "a smooth static interpolate with easing".
   - It added connector lines from the labels to points on the shoe.
   - The lines landed in the wrong places. His fix: tell it exactly where, or send an image with the parts highlighted.
7. **Render from Remotion Studio** as **ProRes**, which works better in Premiere Pro than H.264, which he found laggy on the timeline. The file goes to `out/`. He finishes the edit in Premiere Pro.
8. **His YouTube workflow (Cursor plus Claude Code):**
   - A `Remotion` folder in his YouTube workspace.
   - A **style guide built with Claude Code**: he gave it example styles he likes, asked for **three style guides**, and picked **"option B"**, a "professional black and white style".
   - The guide is an **HTML page** (viewable in a browser, exportable as PDF) with **colours, typography, and how charts and data should look**.
   - Then: "using Remotion and my style guide, build out XYZ graphic".
   - He feeds data as Excel files or pasted figures to get P&L charts and statistics.
9. **Sound effects:** he "added the **ElevenLabs API** to my Claude Code workspace", so Remotion compositions can get SFX generated through it.

## Prompts shown (quoted briefly, then summarised)
1. **Nike ad:** "Using Remotion, create an ad using the style from nike.com. Create a high production quality ad for the Nike Alphafly 3…"
   - Says five shoe PNGs in `public/` are named by colour, plus some images of runners.
   - "Come up with a plan for the ad to make it around 10 seconds long."
2. **Revision:** "I don't like the wobble on the shoe carousel as it comes in. Please make the shoe more static as it zooms in. Add lines on the tech callout to specific parts of the shoe."
3. **Branded graphics template:** "using Remotion and my style guide, build out XYZ graphic".
4. **Style guide:** asked Claude Code for three style-guide options from example styles he likes. The exact wording is **[U]**.

## Tools / MCPs / skills / repos named
- **Remotion:** https://www.remotion.dev, via `npx create-video@latest`. Uses Remotion Studio on localhost.
- **Claude Cowork** and **Claude Code** (in **Cursor**). Model: **Opus 4.6** ("the best model for doing it").
- **ElevenLabs API**, for sound effects.
- Premiere Pro and DaVinci Resolve, for finishing. ProRes export.
- No MCPs or GitHub repos are named.

## Timing and sound tricks
- Timing works through a **plan with per-scene durations** (5 scenes for a 10 s ad) that he reviews before the build. There is no BPM grid or beat file.
- **Motion fix that worked:** replace spring bounce, float and rotation with an eased `interpolate` for a calmer, "static" zoom-in. That is Claude's wording of its change.
- **Sound:** SFX come from the ElevenLabs API, for example on a "data set reveal" with a **ticking counter**. There is no synthesis in code and no music bed described.
- **Text and graphics behaviours he shows:**
  - Ad: "faster than ever before", colourway carousel, tech callouts with connector lines, "Just do it" end card.
  - YouTube graphics: an email-inbox mock with a new-email animation, a ticking counter, an article page with a "scan effect" that boxes the ads, and a year-by-year "market shift" graph.

## What the result looks like
- **Nike ad (transcript):**
  - A headline line, then a colourway carousel of the shoes zooming in.
  - Tech callouts (ZoomX, Flyplate, Atomknit) with connector lines, ending on "Just do it".
  - Palette and type pulled from nike.com. The specifics are **[U]**.
- **His channel graphics (transcript):** a professional **black and white** style with a defined palette, typography and chart style.
- **Thumbnail:** the Remotion logo (blue and white) "+" the Claude logo (coral), "EDIT 10X FASTER" in heavy white sans with "10X" in yellow, on a dark red-brown glow, with a presenter.

## Useful for our Remotion pipeline
- **Plan before build:** ask for a scene list with durations and contents first, edit it, then build. It is cheap and catches problems early.
- **Style guide as a reusable artifact:**
  - Have Claude generate 3 style-guide options (HTML) from reference styles and pick one.
  - Make it the standing reference: "using Remotion and my style guide, build X".
  - Include chart and data styling, not just colours and type.
- **Calmer motion by default:** Claude's spring, float and rotation defaults read as "wobble". Prefer eased `interpolate` for product moves unless overshoot is wanted.
- **Give positional ground truth for annotations,** such as a marked-up image of the callout points. Otherwise connector lines land in the wrong place.
- **Render ProRes for an NLE handoff.** H.264 can lag on a Premiere timeline.
- **Assets go in `public/`** with descriptive file names (colour names), so the prompt can refer to them.

## Claim checks
- **4-part harness, "90% harness":** UNCONFIRMED. He uses no rules file. His reusable piece is a style guide, and his prompts are short.
- **References → style guide → shot list on a beat grid → build:** PARTLY CONFIRMED (transcript).
  - He gives example styles, gets 3 style guides as HTML (colours, typography, charts), and picks option B.
  - Then "using Remotion and my style guide, build out XYZ".
  - For the ad, a plan comes first: "five different scenes… how long each of these is". There is no BPM or beat grid.
- **Sound in code:** CONTRADICTED (transcript). SFX come from the **ElevenLabs API** added to the workspace, not from Node synthesis. No music bed or beats file is mentioned.
- **Self-critique loop:** UNCONFIRMED. He reviews by eye in Remotion Studio.
- **"Crew" prompt:** UNCONFIRMED.
- **Ban default looks by name:** UNCONFIRMED. He only removed the "wobble" (spring bounce, float, rotation) after seeing it.
- **Targeted fixes that lock what works:** CONFIRMED (transcript). His revision named two specific changes, and he expected "those exact changes that we asked for but keep everything else intact".
