# 08 — Christian Peverelli, "Claude Can Now Make Videos - EVERYTHING You Need to Know"

| Field | Value |
|---|---|
| Title | Claude Can Now Make Videos - EVERYTHING You Need to Know |
| Channel | Christian Peverelli, WeAreNoCode (https://www.youtube.com/@wearenocode) |
| URL | https://www.youtube.com/watch?v=rkfyo1waWYY |
| Published | 2026-10-09 (yt-dlp metadata), one day after Claude Motion launched |
| Length | 8:30 (yt-dlp metadata) |
| Views at access | 89,192 (2026-11-02) |
| Product used | **Claude Motion** (chapters "Introduction to Claude Motion", "How Claude Motion works") plus "New Claude platform features", probably Claude Dashboards **[U]** |

## Sources used (all accessed 2026-11-02)

| Source | Type | Result |
|---|---|---|
| `yt-dlp --write-auto-subs` | transcript | **Blocked** (bot check) |
| `yt-dlp --dump-json` (one plain run) | description + chapters + metadata | **Worked** |
| `youtube-transcript-api` | transcript | **Blocked** (`RequestBlocked`) |
| oEmbed | title/channel | Worked |
| Thumbnail `https://i.ytimg.com/vi/rkfyo1waWYY/maxresdefault.jpg` | thumbnail | Worked (viewed) |
| https://support.claude.com/en/articles/17454997-get-started-with-claude-motion | Anthropic support | Worked |
| https://claude.com/resources/articles/dashboards-and-motion | Anthropic announcement | Worked |
| https://claude.com/pricing | Anthropic pricing | Worked |
| `https://www.skool.com/wearenocode` ("Free Cheat Sheet") | gated community | **Not opened** (needs sign-up) |
| Web search (creator + Claude Motion; title) | write-ups | No post by the creator about this video found. The only title matches were transcript or summary sites (e.g. sozai.app/transcript), which I **did not open**. |

**No transcript and no video frames were available.** Everything below comes from the chapters and Anthropic's docs. Specifics are **[U]**.

## Chapters (creator's own, from metadata)

| Time | Chapter |
|---|---|
| 0:00 | Introduction to Claude Motion |
| 0:21 | How Claude Motion works |
| 1:37 | New Claude platform features |
| 2:24 | Business use cases |
| 2:49 | Real estate demo (about 2:50 long, the main demo) |
| 5:40 | Bookkeeping demo |
| 6:36 | Insurance broker demo |
| 7:39 | Tips and final thoughts |

The description has no information on the method. It contains a Skool "Free Cheat Sheet" link and unrelated affiliate links (Bond, HeyReach, Emergent, Base44, Lovable, Hostinger, OpenClaw).

## The method, step by step (from the chapters and Anthropic's docs)

1. **How it works (0:21).** Per Anthropic, Claude writes **code** that animates text, charts, shapes and images. It is not a video model, so there is no real footage or people. You start from **Output → Motion** or `/motion` in a chat, or from a Motion template in the Artifacts tab. What he actually says is **[U]**.
2. **New platform features (1:37).** These are probably Claude Dashboards and the artifact changes announced alongside Motion on Oct 8 **[U]**.
3. **Business demos (2:49–7:39).** He runs three industry demos, likely by prompting Motion with each business's content:
   - **Real estate:** probably a property or listing explainer or a market-stats animation **[U]**.
   - **Bookkeeping:** probably animated financial charts or a client-report explainer **[U]**. This fits Anthropic's own example of "a 30-second explainer of a quarterly report".
   - **Insurance broker:** probably a policy or coverage explainer **[U]**.
4. **Tips (7:39).** These are **[U]**. Anthropic's official tips are to state the audience, where it will play and the rough length, and to attach your own reports, data or images.
5. **Edit and export (Anthropic):** change details in chat or in the editor ("change any word, number, or timing"), then **Export → MP4**.

## Prompts shown

None confirmed. There was no transcript or frames.

## Tools, MCPs, skills and repos named

- **Claude Motion** (Anthropic beta; Team and Enterprise only; not on Free, Pro or Max). Docs: https://support.claude.com/en/articles/17454997-get-started-with-claude-motion
- Probably **Claude Dashboards** **[U]**. Beta; Pro and above per https://claude.com/pricing.
- No MCPs, repos, Remotion or HyperFrames are named. The affiliate tools in the description are unrelated to video.

## Claude Motion: availability, cost and limits (Anthropic, accessed 2026-11-02)

- "Claude Motion is in beta on Team and Enterprise." It is on by default on Team; on Enterprise an owner must enable it.
- It uses plan usage ("Longer or more complex animations use more of your limit than a typical message"). Team Standard is $20/seat/month annual ($25 monthly); Team Premium is $100 ($125); Enterprise is $20/seat plus API-rate usage, with a 20-seat minimum.
- It exports MP4. Anthropic names Adobe, Descript, HeyGen, Higgsfield, invideo, Luma AI and Runway as downstream tools.
- **Undocumented:** length cap, aspect ratios, fps, audio.

## Timing and sound tricks

Nothing is documented. Anthropic's pages do not mention audio, so these clips are probably silent MP4s **[U]**. The thumbnail's timeline does show an audio waveform track, but it is a mock-up (see below), not evidence of an audio feature.

## What the result looks like

From the **thumbnail only**: the creator points at a laptop showing a mock "Claude — Video editor" UI. It has a cream/white background with Claude-orange accents, a video player containing his own face, a chat panel on the right, and an NLE-style timeline with three tracks: orange video clips, a purple text track and a green audio waveform. The headline reads "Game Changer" in heavy white sans. **This UI does not match anything Anthropic documents.** Motion is described as an animation artifact with an editor, not a multitrack editor that imports real footage, so treat the thumbnail as illustrative **[U]**. The real output style is **[U]**.

## Useful for our Remotion pipeline

- **Industry-template framing:** one style system re-skinned per vertical (real estate, bookkeeping, insurance). For us, keep one Remotion composition with Zod props per niche (copy, numbers, palette) rather than a new build each time.
- **Data-first explainers** (charts, report numbers) are what Motion is built for. Our numbers should come from props/JSON so a figure changes without touching the animation code.
- **Brief checklist** from Anthropic's tips: audience, playback venue, approximate length, attached source material. Put it in our skill's intake step.
- Treat any "Claude edits your real footage on a timeline" claim with caution. Claude Motion does not import or generate footage, according to Anthropic.
