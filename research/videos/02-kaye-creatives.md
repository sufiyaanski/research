# 02 · kaye.creatives: "How To Make Insane Motion Graphics With Opus 5.5 (Claude Motion)"

| | |
|---|---|
| Channel | kaye.creatives (`@Kaye.creates`, 84.1K subscribers) |
| URL | https://www.youtube.com/watch?v=AsvN_feasyY |
| Published | Oct 14, 2026 (watch page `dateText`) |
| Length | Unknown. The last chapter starts at 9:50, so it runs over 10 min **[U]** |
| Views at access | 570,924 |
| Sponsor | The description says it is "not sponsored by Claude or Higgsfield". However, its prompts link is a Higgsfield affiliate/UTM link (`fpr=kaye.creatives`, `utm_campaign=Seedance 2.5`). |

## Sources used (accessed 2026-11-02)

| Source | Result |
|---|---|
| `yt-dlp` subtitles and `--dump-json` (route 1) | **Blocked**: "Sign in to confirm you're not a bot". |
| `youtube-transcript-api` (route 2) | **Blocked** (`IpBlocked`). |
| oEmbed (route 3) | Worked: title and author. |
| Watch page by curl (route 3) | Worked (HTTP 200). The player response said `LOGIN_REQUIRED`, so there were no captions or storyboards. `ytInitialData` gave the description, chapters, date and views. |
| Chapter thumbnails, i.e. frames YouTube picked at 0:00, 2:00, 6:40, 7:15 and 9:50 (`i.ytimg.com/vi/AsvN_feasyY/hqdefault_<ms>.jpg`, URLs from the watch page) | Worked. 5 small frames at 336×188. |
| Thumbnail `maxresdefault.jpg` | Worked. |
| The description's link to "Prompts + My Custom Motion Skills", https://higgsfield.ai/s/seedance-2-5-kaye.creatives-uUkcPi | It redirects to `higgsfield.ai/@kaye_creatives/blogs/claude-motion-tutorial`. The page shell loads (title "Claude motion tutorial" and a header image), but the **body is rendered client-side and could not be read** with WebFetch or curl. |
| Web search for write-ups (route 4) | I found none that cover this video. |
| Video file | Not downloaded. |

**There is no transcript and no readable prompts.** Nearly everything about the method is **[U]**.

## Chapters (creator's own)
0:00 Intro: No After Effects? I Challenged Claude Motion · 2:00 Test 1: Editing Motion Graphics on Top of Raw Footage · 6:40 Claude vs My Designer: 34 Minutes vs 5 Hours · 7:15 Test 2: 5-Sec Launch Intro From Scratch in 20 Minutes · 9:50 Verdict: Can Claude Replace a Pro Designer?

## Method, step by step (from the description and chapters; details **[U]**)
1. **Product:** "Claude Motion (Opus 5.5)". The description reads: "I challenged Claude Motion (Opus 5.5) to beat a pro motion designer."
   - Claude Motion is Anthropic's beta feature, launched 2026-10-08. Claude builds each animation as code from a Motion template, saves it as an Artifact, and exports MP4. It is on Team and Enterprise plans and counts against usage limits (support.claude.com, see Sources).
   - Whether kaye used that product or Claude Code with skills is **[U]**: she also offers "My Custom Motion Skills".
2. **Test 1: motion graphics on top of raw talking-head footage.** Chapter frames show her own talking-head footage with kinetic captions laid over it:
   - "I want to / **breakdown** / how Claude wo[rks]" (2:00): a small white sans plus a large coral/salmon italic serif keyword
   - "This is a **MASSIVE**" (6:40): the clip is shrunk to a rounded card on an off-white grain/dust background, with a huge white bold sans word overlapping the card
   - "**Footage** / That was the first test." (7:15): a coral italic serif keyword plus a small sans line
3. **Timing comparison:** Claude took 34 minutes against 5 hours for her human designer (chapter title).
4. **Test 2:** a 5-second launch intro from scratch, built in 20 minutes (chapter title). Prompts and steps **[U]**.
5. **Verdict:** can Claude replace a pro designer? Conclusion **[U]**.

## Prompts shown
None could be read. They sit behind the Higgsfield blog link, which renders client-side.

## Tools, MCPs, skills and repos named
- **Claude Motion / Opus 5.5** (description). Anthropic's help page: https://support.claude.com/en/articles/17454997-get-started-with-claude-motion
- **Higgsfield**: the prompts and "custom motion skills" page sits on Higgsfield, at https://higgsfield.ai/s/seedance-2-5-kaye.creatives-uUkcPi
- No After Effects, per the chapter title.

## Timing and sound tricks
- None confirmed. From the frames: captions pop one keyword per phrase, and the bold keyword is a different face from the support line. Exact entry and exit motion **[U]**.

## What the result looks like (chapter frames, thumbnail and blog header)
- **Caption look:** a two-face pairing of coral/salmon *italic serif* for the key word and small white or black sans for the rest. In one frame a huge white geometric/grotesk word ("MASSIVE", "OPUS" in the blog header) sits *behind or around the speaker's head* as depth-layered text, which needs a person cutout **[U]**. One frame frames the clip as a rounded card on off-white paper with grain specks.
- **Thumbnail:** a photoreal collage of the creator stepping out of a Windows-95-style window. It has orange 3D Claude-asterisk "sparkle" shapes, floating NLE timeline blocks ("fx" clips) and the black serif title "Claude Motion" on white.
- Palette: warm interior footage, a coral/terracotta accent (Claude-like), off-white and black.

## Useful for our Remotion pipeline
- A **two-face keyword caption** (italic serif accent word plus small sans line) is cheap to build in Remotion and reads well over talking heads. It is worth one template component.
- **"Text behind the head"** needs a person matte per frame (for example a segmentation pass rendered to a PNG sequence or an alpha video). That is a separate pre-processing step, not just code.
- A **"shrink the footage into a card on paper"** transition (scale down plus rounded corners plus a grain background) is an easy emphasis beat.
- Treat her claim of "34 min vs 5 h" as a creator anecdote. Nothing about the method (rules, loop, sound) is confirmed for this video.

## Claim checks
Every method claim is **UNCONFIRMED** for this video: the 4-part harness, the style guide and beat-grid shot list, sound in code / beats.json / SFX, the self-critique scoring loop, the crew prompt, the default-look bans, and targeted fixes. None of them can be seen in the 5 frames or the description. Paid/hosted parts: **Claude Motion** (Anthropic, beta from 2026-10-08, Team/Enterprise plans, uses the plan's usage allowance, no separate price) is named in the title and description. **Higgsfield** hosts her prompts and skills page via an affiliate link. Pixels MCP and Fish Audio are not mentioned.
