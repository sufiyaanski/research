# 03 · Higgsfield AI: "Claude Opus 5.5 + Higgsfield Make Insane Motion Graphics! (Claude Motion)"

| | |
|---|---|
| Channel | Higgsfield AI (`@HiggsfieldAI`, 508K subscribers). This is the **vendor's own channel**, so it is promotional. |
| URL | https://www.youtube.com/watch?v=5HYYXYYCrL4 |
| Uploaded | 2026-10-13 |
| Length | 10:46 (646 s). The description lists a chapter at 11:23 ("From a Short Clip to a 10-Minute Film") that is past the end of the video. YouTube dropped it, so that section was probably cut **[U]**. |
| Views at access | 345,192 |

## Sources used (accessed 2026-11-02)

| Source | Result |
|---|---|
| `yt-dlp` subtitles (route 1) | **Blocked** (HTTP 429). |
| `yt-dlp --dump-json` (route 1) | **Worked.** Gave metadata, chapters, description and storyboard URLs. |
| `youtube-transcript-api` (route 2) | **Blocked** (`IpBlocked`). |
| oEmbed and watch page (route 3) | Worked. |
| Thumbnail `maxresdefault.jpg` | Worked. |
| Storyboard sprites (`i.ytimg.com/sb/5HYYXYYCrL4/storyboard3_L2/M0…M5.jpg`, from the yt-dlp JSON) | Worked. 131 frames at **160×90**, about one every 4.9 s. They are very low resolution, so on-screen text is mostly unreadable (marked ~). |
| Chapter thumbnails | All of them are just the video thumbnail, so they are no use. |
| "All Prompts and Skills" link, https://higgsfield.ai/s/claudemotion-higgsfieldai-skVQgf | It redirects to `higgsfield.ai/@adilinthewildtempo/blogs/i-tested-claude-motion-at-3-difficulty-levels-can-it-make-a-higgsfield-style-launch-video`. The **body renders client-side and could not be read**; only the title and header image loaded. |
| "Connect Higgsfield MCP to Claude Code" link, https://higgsfield.ai/s/claudemotion-higgsfieldai-HrEFvp | Readable (WebFetch). It is the Higgsfield MCP/CLI setup page. |
| Write-ups (route 4) | completeaitraining.com (2026-09-27) and hermes-ai.net (2026-09-26, via AlphaSignal) on Higgsfield MCP → editable After Effects projects. Third-party pricing pages for Higgsfield. |
| Video file | Not downloaded. |

The presenter's on-screen handle appears to be **@adilinthewildtempo**, the blog author **[U]**. There is no transcript, so the spoken method is **[U]**.

## Chapters (creator's own)
0:00 Can Claude Handle These 3 Challenges? · 0:18 Set Up Claude Motion + Higgsfield · 0:42 Level 1: Recreating a Viral Launch Video · 2:39 Can You Edit It in After Effects? · 3:07 Turning Instagram References into an Original Launch · 4:10 Editing Text, Colors & Timing · 5:19 Level 2: Building a 3D Product Ad · 6:24 Swapping Products & Exporting to Blender · 7:04 Particle Animation & ASCII Art · 7:52 An Original 3D Launch from Six References · 8:23 Creating SaaS Motion Graphics · 9:04 Level 3: Creating an Animated Short · 10:27 Fixing Animation with Simple Comments · (11:23 From a Short Clip to a 10-Minute Film, not in the published cut)

## Method, step by step
1. **Setup (0:18).** Frame ~0:29 shows the page "GENERATE IMAGES & VIDEOS IN CLAUDE CODE WITH [Higgsfield] CLI". The setup page (read) gives a prompt to paste into Claude Code:
   - `npm i -g @higgsfield/cli`
   - `higgsfield auth login` (browser sign-in)
   - `npx skills add higgsfield-ai/skills`

   Third-party pages also give an HTTP MCP route: `claude mcp add --transport http --scope user higgsfield https://mcp.higgsfield.ai/mcp` plus OAuth **[U for this video]**. The work happens in **Claude Code with Opus 5.5** (frames show a Claude Code-style prompt box with "Opus 5.x · xhigh"-like labels **[U]**).
2. **What "Claude Motion" means here.** Frames 3:46 and 4:16 show a **launch film** reading "Claude · Higgsfield / **Claude Motion** / ~Every frame is code. Change anything." The UI at 3:32 asks "What should we animate?" with a "# 20 second launch…" prompt card. Frame 2:57 shows a "Claude Motion" panel with a "Higgsfield" chip next to After Effects. So in this video "Claude Motion" is used as the **name of the workflow or skill and is also the subject of the demo launch film**. Whether it is Anthropic's Claude Motion artifact feature (beta from 2026-10-08) or Higgsfield-branded skills is **[U]**.
3. **Level 1: recreate a viral launch video (0:42–2:39).**
   - A reference video goes in, along with a detailed description. On-screen caption ~1:18: "DETAILED DESCRIPTION → BETTER RESULTS".
   - Claude builds it, with Higgsfield generating images and video clips (photoreal lifestyle shots of a woman with a laptop, a car).
   - A follow-up prompt: "Edit the commercial. Fix it if needed" (~1:53). Claude self-reports "Found a continuity error. Let's patch" (~2:03).
   - Frame 2:27 shows a side-by-side "REFERENCE vs CLAUDE MOTION".
4. **Editable in After Effects (2:39).** Caption "FULL CONTROL". The frame shows an AE project with layers and a timeline. Higgsfield's MCP can "return an editable After Effects project file" (completeaitraining, citing higgsfield.ai/mcp).
5. **Instagram references → original launch (3:07–4:10)**, then **editing text, colours and timing** (4:10–5:19). Frame 4:21 shows a code/graph-editor view (`~ease.y = …`, keyframe lanes). Edits are made as follow-up prompts (description: "revision prompts… timing changes").
6. **Level 2: 3D product ad (5:19).** Caption "CAN CLAUDE DO 3D?". It shows a red 3D pickup truck on a pink set, then a product swap to a bike or RC car (~6:09–6:49), then **export to Blender** (Blender UI at ~6:29). Captions compare "1 WEEK" against "3 HOURS" (~5:05–5:10).
7. **Particle animation and ASCII art (7:04)**, then **an original 3D launch from six references (7:52)**: caption "REFERENCES + CUSTOM SKILL" (~7:18).
8. **SaaS motion graphics (8:23):** "HIGH DEMAND SAAS VIDEO MOTION STYLE" (~6:59). The outputs include "DESIGN TOGETHER", isometric phone UI on deep purple, and a white "Stra…" logo reveal.
9. **Level 3: animated short (9:04).** A 2D cartoon ("EU PET PASS" storybook, a cat, a girl with a backpack, a passport officer, a Europe map) with **AI-generated voices** (description). The caption claims "2 HOURS".
10. **Fixing with comments (10:27).** Frames ~9:02–9:12 show comment pop-ups pinned on frames, "@Claude …" with a **"Send to Claude"** button, i.e. per-frame review comments routed back to Claude. The outro asks "WHERE CAN YOU TAKE THIS?" (faceless channel, client work, your product).

## Prompts shown
The text is too small to read in 160×90 frames. The legible fragments are:
- "Edit the commercial. Fix it if needed"
- "What should we animate?" / "# 20 second launch…"
- Comment-style fixes beginning "@Claude …"

The full prompts are said to be at the client-rendered blog link (unread).

## Tools, MCPs, skills and repos named
- **Claude Opus 5.5** in **Claude Code**
- **Higgsfield MCP / CLI** (`@higgsfield/cli`) and **Higgsfield skills** (`npx skills add higgsfield-ai/skills`): https://higgsfield.ai/mcp. The setup page says "no API key required" (OAuth) and "30+ models". It also lists AE, Blender, Premiere, Photoshop, Illustrator, DaVinci Resolve and TouchDesigner workflows, plus "Genjutsu" (remake a reference with your own characters while keeping motion and timing).
- **After Effects** (editable project export) and **Blender** (3D export)
- Remotion is in the tags only; whether it is used is **[U]**.

## Timing and sound tricks
- Nothing confirmed about BPM grids, beats.json or synthesized SFX.
- Sound in Level 3 comes from **AI-generated voices** (description). The voice tool is **[U]** (probably Higgsfield audio).
- Timing changes are made by revision prompt or comment, not by a rule file.

## What the results look like (storyboard and thumbnail)
- **Thumbnail:** off-white grid paper; "CLAUDE" in a coral/terracotta condensed grotesk; "/MOTION" in white mono-ish type on a dark pill with a cyan glow; the Claude asterisk app icon and the lime Higgsfield logo; small UI cards (BOUNCE / EASE IN-EASE OUT graphs, "TYPE IN MOTION", a phone reading "Create.", an AE-style "MAIN COMP" timeline with coloured bars, a Layers panel).
- **Outputs:**
  - A soft peach-to-lime gradient launch film with a black serif "Claude *Motion*" (italic second word) and lime glowing pills/buttons
  - Pink-framed product-UI cards
  - Photoreal lifestyle clips from Higgsfield video models
  - Claymation-style 3D vehicles on pastel sets
  - Deep purple isometric SaaS UI
  - Warm illustrated 2D cartoon (storybook paper, map, cat)
- **Channel graphics:** dark green/black with lime highlight captions.

## Useful for our Remotion pipeline
- **Per-frame comments → targeted fixes.** Pinning a note to a timestamp/frame and sending only that to Claude is a good review UX. Our version: a `notes.json` with `{frame, comment}` that Claude applies without touching other scenes.
- The **reference vs output side-by-side** is a cheap QA step: render ours next to the reference at matching timestamps.
- **Hybrid assets:** generated stills and video clips (any image/video model) used as `<Img>`/`<OffthreadVideo>` layers inside a code-driven composition. Code handles type, UI and timing; models handle photoreal plates.
- **Editable handoff**, as they do with AE and Blender exports, is out of scope for Remotion. The equivalent is clean, prop-driven compositions where text, colours and timing are all props.
- Caveat: this is a vendor demo. Time claims ("1 week vs 3 hours", "2 hours") and the quality of one-shot results are unverified.

## Claim checks
| Claim | Verdict |
|---|---|
| 4-part harness / "90% harness" | **UNCONFIRMED.** Nothing like it is visible. The demo leans on detailed descriptions plus references ("DETAILED DESCRIPTION → BETTER RESULTS"). |
| References → style guide .md → beat-grid shot list → build | **Partly.** Using references is **CONFIRMED** (chapters "Turning Instagram References into an Original Launch" and "An Original 3D Launch from Six References"; caption "REFERENCES + CUSTOM SKILL"). A style-guide .md, a beat grid and BPM are **UNCONFIRMED**. |
| Sound in code (music bed, beats.json, Node SFX) | **UNCONFIRMED.** The only sound mentioned is AI-generated voices for the cartoon (description). |
| Self-critique scoring loop (≥ 8) | **UNCONFIRMED.** Review is human, by comments ("Fixing Animation with Simple Comments"). Claude self-reports "Found a continuity error. Let's patch" (~2:03). |
| Crew prompt + story | **UNCONFIRMED.** |
| Ban default looks by name | **UNCONFIRMED.** |
| Targeted fixes, not restarts | **CONFIRMED in spirit.** The description mentions "revision prompts", "product swaps, timing changes". Frames show per-frame "@Claude… Send to Claude" comments. "Lock what works" as an explicit rule is **UNCONFIRMED**. |
| Paid/hosted parts | **Higgsfield MCP/CLI:** OAuth, no API key. MCP, CLI and Canvas use **credits**, and "Unlimited" plans apply only on the higgsfield.ai web app. Plan prices vary by source and country: Krea lists Starter $19 / Plus $47 / Ultra $99 per month on annual billing; others quote $9–$129. There is a possible MCP 3-day trial with 100 MCP credits, but the sources conflict. These are third-party figures **[U]**. **Claude Motion:** Anthropic beta on Team/Enterprise; whether it is used here is **[U]**. Fish Audio and Pixels MCP are not mentioned. |
