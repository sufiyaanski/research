# 04 · Jad M.H | AI Automation: "How to Make Viral Motion Graphics With AI With 0$ (Turned it into a Skill)"

| | |
|---|---|
| Channel | Jad M.H \| AI Automation (`@JadM.H`). The channel page says "giving away skills for free"; contact jad@phaselink.ai. |
| URL | https://www.youtube.com/watch?v=zke3bTtvmLo |
| Published | About 4 weeks before access, so roughly early October 2026 (channel listing shows "4w ago"). Exact date **[U]**. |
| Length | 15:48 (channel video listing) |
| Views at access | about 312K (channel listing) |

## Sources used (accessed 2026-11-02)

| Source | Result |
|---|---|
| `yt-dlp` subtitles and `--dump-json` (route 1) | **Blocked**: "Sign in to confirm you're not a bot". |
| `youtube-transcript-api` (route 2) | **Blocked** (`IpBlocked`). |
| oEmbed (route 3) | Worked: title and author. |
| Watch page by curl (route 3) | **Blocked** (HTTP 429). No description or chapters. |
| Channel videos page `https://www.youtube.com/@JadM.H/videos` | Worked. Gave length, views, age, the channel description and the list of related videos. |
| Thumbnail `maxresdefault.jpg` | Worked. |
| Web search (route 4) for a write-up, skill page, GitHub, Gumroad or social posts | **Nothing found** for this video or its skill. Jad's consulting site, https://jad-ai-consulting.vercel.app/, was read: it describes "motion graphics: the workflow behind my 172K-view video: animated type, charts and scenes, made with Claude". That does not name the video; 172K is not this video's current 312K, so it may be an older count or a different video **[U]**. |
| Video file | Not downloaded. |

**No transcript, description or prompts could be retrieved. Everything about the method is [U].**

## Method (all **[U]**)
- The title promises a **$0** method that is then "turned into a skill", presumably an Agent Skill (SKILL.md) for Claude **[U]**.
- **Thumbnail clue:** the central pill reads "Create Motion Graphics" next to a **four-point gradient sparkle icon that looks like Google Gemini's logo**, plus a green "$0" badge. This suggests the free route may use Gemini, or another free-tier chat model, rather than paid Claude **[U]**. His channel compares models often ("Gemini 4 Carbon VS Opus 5.5 VS GPT-6 Astra", "What Is The Best Model For Motion Graphics").
- Related videos on the same channel that probably extend this method **[U]**:
  - "Claude Opus 5.5 Is INSANE at Motion Graphics 0$ (Turned it into a skill)" (y4GwCCsYwvQ, 24:38)
  - "The New Viral Motion Graphics (Turned it into a skill)" (98KlVeJ9ylg)
  - "The New Claude Motion Is Awesome (Scary Good)" (lUqjRmtN7bE)
  - "I Found A Way To Make These AI Animations For $0 (No Subscription)" (N1eYQDVrVHs)

## Prompts shown
None retrieved.

## Tools, MCPs, skills and repos named
- None confirmed for this video. His consulting site mentions Claude (motion graphics, AI video editing, "skill"), Claude Code, n8n and the Higgsfield APIs (for automation). I found no public skill repo or download page for this video.

## Timing and sound tricks
- None confirmed.

## What the result looks like (thumbnail only)
- Four "glass card" examples around the creator:
  1. **Vox-style explainer collage**: "Look at this **Vox** / Animation" in navy serif with a red ribbon label, a red cable car on a cut-out mountain photo, and a hand-drawn arrow
  2. **"Motion without Limit / Aslani"**: a tall condensed serif title, an astronaut and a moss-covered tree on a green hill, with script "Edition"
  3. **"Nothing"**: green-tinted paper collage with Greek columns, a playing card and star doodles, with the word on a highlighter-green label
  4. **"Fast"**: a huge condensed black type on orange, a yellow sports car breaking through, and the small line "…ENOUGH TO BREAK REALITY"
- Style: **mixed-media collage** (cut-out photos, paper texture, a serif/condensed type contrast, hand-drawn arrows, label stickers), i.e. "Vox-style" motion graphics. This is a different look from the clean UI launch-film grammar in videos 1 and 3.

## Useful for our Remotion pipeline
- The thumbnail suggests a **Vox-style collage template** as a separate preset: cut-out PNG subjects with drop shadows, paper or grain background, a serif headline plus a label sticker, hand-drawn arrow paths animated with `evolvePath`, and a slow parallax push.
- **Condensed-type "breakthrough" shots** (a subject overlapping huge headline type) need layer ordering with a cut-out subject in front of the text. That is easy in Remotion with a pre-cut PNG.
- Do not adopt anything else from this video until a transcript or description is available; the method is unconfirmed.

## Claim checks
All eight claims are **UNCONFIRMED** for this video (harness, style guide and beat grid, sound in code, critique loop, crew prompt, look bans, targeted fixes, paid parts). There is no transcript, description or write-up. The thumbnail's "$0" and Gemini-like icon suggest no paid Claude Motion, Higgsfield or Fish Audio **[U]**.
