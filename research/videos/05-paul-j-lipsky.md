# 05 — Paul J Lipsky, "The New Claude Motion Is Awesome"

| Field | Value |
|---|---|
| Title | The New Claude Motion Is Awesome |
| Channel | Paul J Lipsky (https://www.youtube.com/@PaulJLipsky) |
| URL | https://www.youtube.com/watch?v=hbPvZvpu9KU |
| Published | 2026-10-11 (yt-dlp metadata `upload_date`) |
| Length | 9:04 (yt-dlp metadata) |
| Views at access | 198,079 (yt-dlp metadata, 2026-11-02) |
| Product used | **Claude Motion** (Anthropic, beta, Team/Enterprise) plus **Claude Dashboards** (named in description and chapters) |

## Sources used (all accessed 2026-11-02)

| Source | Type | Result |
|---|---|---|
| `yt-dlp --skip-download --write-auto-subs --sub-langs en` | transcript | **Blocked**: "Sign in to confirm you're not a bot" |
| `yt-dlp --dump-json` (one plain run) | description + chapters + metadata | **Worked** |
| `youtube-transcript-api` `.fetch("hbPvZvpu9KU")` | transcript | **Blocked**: `IpBlocked` |
| oEmbed `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=hbPvZvpu9KU&format=json` | title/channel | Worked |
| Thumbnail `https://i.ytimg.com/vi/hbPvZvpu9KU/maxresdefault.jpg` | thumbnail | Worked (viewed) |
| https://support.claude.com/en/articles/17454997-get-started-with-claude-motion | Anthropic support page | Worked |
| https://claude.com/resources/articles/dashboards-and-motion | Anthropic announcement (2026-10-08) | Worked |
| https://claude.com/pricing | Anthropic pricing | Worked |
| Web search for creator write-ups ("Paul J Lipsky Claude Motion", title search) | write-ups | No post, newsletter or site by the creator found. The results were only auto-generated summary or transcript sites, which I did **not** open because they are third-party transcript sites. |

**No transcript and no video frames were available.** Everything about *how* he works below comes from his own description and chapter titles. Details beyond those are marked **[U]**.

## What the creator says the video covers (description, verbatim fragments)

- "how to use Claude Motion to turn data into animated charts, create explainer videos, and match motion graphics to your video's timestamps"
- "We'll also try screenshot style references, targeted edits, and the new Claude Dashboards."

Chapters (from the metadata):

| Time | Chapter |
|---|---|
| 0:00 | Intro |
| 0:20 | Access Claude Motion |
| 0:47 | Animate Your Data |
| 2:33 | Edit Your Animation |
| 3:09 | Create Explainer Videos |
| 3:50 | Match a Style |
| 4:41 | Sync With Your Video |
| 7:12 | Animate Travel Memories |
| 7:46 | Create Animated Dashboards |

## The method, step by step (reconstructed from the chapters, the description and Anthropic's docs)

1. **Open Claude Motion (0:20).** Anthropic gives two entry points: in any chat, pick **Output → Motion** in the message box (the announcement also says type `/motion`), or open the **Artifacts** tab and choose a Motion template. Each animation is saved as an artifact. Which entry point he uses is **[U]**.
2. **Animate data (0:47–2:33).** He feeds in data and gets an animated chart. Whether he pasted a table, uploaded a CSV or used a screenshot is **[U]**. Anthropic's tip: "Attach your own reports, data, or images so the animation uses your content."
3. **Targeted edit (2:33–3:09).** The description says "targeted edits". Anthropic: "Since each animation is code, you can change one detail and the rest stays the same", and you can either ask in chat (e.g. slow a scene or change a number) or edit directly in the editor.
4. **Explainer video (3:09–3:50).** Prompt contents are **[U]**.
5. **Match a style (3:50–4:41).** He gives a **screenshot as a style reference** (description: "screenshot style references"). Anthropic's Motion pages do not document style references, so the exact behaviour is **[U]**.
6. **Sync with your own video (4:41–7:12, the longest chapter).** He matches motion graphics "to your video's timestamps". The most likely method is giving Claude a list of timestamps or a transcript from his talking-head video, so each overlay lands on a spoken moment, then compositing the exported MP4 over his footage in an editor. All of that detail is **[U]**. Anthropic documents no timestamp or video-sync feature, and Motion cannot import or render real footage ("doesn't produce realistic footage or people").
7. **Travel memories (7:12).** He animates his own photos (images are a supported input). **[U]** beyond that.
8. **Animated dashboards (7:46).** This chapter uses **Claude Dashboards**, a separate beta artifact type that launched the same day as Motion and is available on Pro and above.
9. **Export.** Anthropic: click **Export → MP4**. Animations start private and are shared with **Share**.

## Prompts shown

None confirmed: there was no transcript and no frames. From the chapters, he likely prompted for a data chart, an explainer, a style match from a screenshot, and timestamped overlays, but the wording is **[U]**.

## Tools, MCPs, skills and repos named

- **Claude Motion** (Anthropic; beta; Team and Enterprise). Support: https://support.claude.com/en/articles/17454997-get-started-with-claude-motion. Announcement: https://claude.com/resources/articles/dashboards-and-motion
- **Claude Dashboards** (beta; the pricing page lists it on Pro, Max, Team and Enterprise): https://claude.com/pricing
- He names no MCPs, GitHub repos or third-party tools in the description. A video editor for compositing the overlays is likely but **[U]**.

## Claude Motion: what it is, availability and limits (Anthropic's own pages, accessed 2026-11-02)

- **What it is:** "Claude Motion turns your content into short animations", such as explainers, animated charts and product walkthroughs. "Claude writes code that animates your text, charts, shapes, and images, so you can change any word, number, or timing." It "doesn't use a video generation model, so there's no generated footage and no AI-generated people."
- **Plans:** "Claude Motion is in beta on Team and Enterprise." It is on by default on Team. On Enterprise it is off until an owner enables it under Organization settings → Artifacts, and owners can limit it to groups with custom roles. The pricing page shows Motion as **not included** on Free, Pro, Max or Ultra.
- **Cost:** there is no separate fee; Motion "counts toward your plan's usage limits", and "Longer or more complex animations use more of your limit than a typical message". Team Standard costs $20/seat/month billed annually ($25 monthly); Team Premium costs $100/seat/month annually ($125 monthly); Enterprise costs $20/seat/month annually with a 20-seat minimum, plus usage at API rates.
- **Export:** MP4. The announcement lists Adobe, Descript, HeyGen, Higgsfield, invideo, Luma AI and Runway as places to take the file, with Canva and Captions "coming soon".
- **Not documented:** maximum length, aspect ratios, frame rate, **audio/sound**, style references and video sync.

## Timing and sound tricks

- **Timestamp sync** is the one timing technique named ("match motion graphics to your video's timestamps"). The mechanics are **[U]**.
- **Sound:** nothing in the description or in Anthropic's docs mentions audio. Whether Motion exports any sound is **[U]**. Assume a silent MP4 that gets a sound mix in a separate editor **[U]**.
- BPM grids, beats.json and SFX: nothing found.

## What the result looks like

From the **thumbnail only**: a big white "Claude Motion" wordmark beside the orange Claude asterisk logo, and a laptop showing the Motion player. The player has a cream/off-white canvas, a terracotta-orange card titled "Introducing Claude Motion" in a serif display face, small chart tiles (bars, line, circle) at the right, and play/scrub controls underneath. This suggests the default Motion look is Anthropic-brand: cream background, terracotta accent, serif headline, flat chart cards. The motion style itself is **[U]**: there were no frames.

## Useful for our Remotion pipeline

- **Timestamp-driven overlays** are the feature he spends the most time on (2.5 min). Our equivalent: drive Remotion `<Sequence from>` values from a word-timestamp JSON, not from hand-typed seconds.
- **Screenshot style reference → matching look** is a cheap way to set the look. We can attach reference stills and have Claude write a style `.md` (palette, type) before building.
- **"Change one detail, the rest stays the same"** is Anthropic's core promise for Motion. Mirror it by keeping all copy, numbers and timings in a props/Zod schema, so a fix is a data edit, not a rebuild.
- Motion's default look (cream, terracotta, serif) is the house style that Anthropic's own `frontend-design` skill calls a generated-look tell. Do not copy it for our brand.
- Motion is Team/Enterprise only, its audio support is undocumented, and it caps out at "short" pieces. For us it is at most a source of ideas, not a pipeline stage.
