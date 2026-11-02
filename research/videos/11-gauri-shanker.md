# 11 — Gauri Shanker | Video Automation: "How to Create Animated Videos using Claude (No AI video generator needed)"

- **Channel:** Gauri Shanker | Video Automation (https://www.youtube.com/@Shankertech10)
- **URL:** https://www.youtube.com/watch?v=as6qAlnM8UE
- **Upload date:** 2026-10-05 (yt-dlp metadata).
- **Length:** 13:39. Views about 10.7k at access.
- **Sources used (all accessed 2026-11-02):**
  - Transcript: **not obtained.**
    - yt-dlp found the English auto-captions, but the download returned `HTTP Error 429`.
    - youtube-transcript-api returned `RequestBlocked`.
  - Metadata, description, chapters and tags: `yt-dlp --dump-json` (worked).
  - oEmbed (worked). Thumbnail https://i.ytimg.com/vi/as6qAlnM8UE/maxresdefault.jpg (worked). No frames.
  - Output video linked in the description, "hare and tortoise v2": https://youtu.be/4fMcU6iiDCE. Its oEmbed and thumbnail https://i.ytimg.com/vi/4fMcU6iiDCE/maxresdefault.jpg both worked.
  - "Link to the prompts in Google docs": https://docs.google.com/document/d/13bFmR5ey9TnuqkENLoaAQnEA1rWCdkxmvWskgDsF_uA. It was fetched and is public, but at access it holds a **different workflow**: "How to create 2-sleeps video in under $10". That doc has a script-writing prompt, a sentence-splitting prompt, an image-prompt generator and a "minimalist hand-drawn doodle" style modifier. It holds **no Claude Code, HyperFrames or Kokoro animation prompt**, so the prompt from this video is **not available**.
  - Web search for write-ups on Gauri Shanker, Runware and HyperFrames found nothing by the creator.
  - Not opened: the newsletter (bit.ly) and the Calendly booking link (out of scope).
- **Confirmation note:** Everything below comes from the **description, chapter titles, tags and thumbnails**, plus HyperFrames docs for tool behaviour. Details of the prompt, the fix and the on-screen steps are **[U]**.

## Chapters (description)
0:00 Every Animation Here Was Made by Claude · 2:16 Free Voiceover With Kokoro · 4:40 AI Visuals via Runware API · 6:11 Topic and 1960s Cartoon Style · 8:00 Version 1: Disappointing Result · 10:41 How Much Quota Did It Use? · 13:17 Wrap-Up.

## Method (from the creator's description)
1. **Claude Code is used as an "animation studio".** He builds "the full prompt that turns Claude Code into an animation studio".
2. **The HyperFrames skill** writes HTML/CSS/JS animations and renders them with FFmpeg.
3. **Voiceover:** the "free local **Kokoro** model".
   - HyperFrames exposes this as `npx hyperframes tts`, Kokoro on device (from the skill digest).
   - **[U]** whether he used that command or a separate install.
4. **Word-level transcription:** **NVIDIA Parakeet**, used to time captions and visuals to the voice.
   - HyperFrames offers `npx hyperframes transcribe` with Parakeet or whisper. **[U]** which route he used.
5. **AI-generated visuals:** the **Runware API**, for images.
6. **Topic and style:** the hare and the tortoise, in a "1960s cartoon style" (chapter title).
7. **Version 1 was disappointing:** "came out as static slides with out-of-sync audio".
8. **A follow-up prompt fixed it.** Claude "quietly used extra API keys on its own to add sound effects and music". Which keys and services is **[U]**.
9. **Cost:** he shows how much of the **$20 plan's quota** one 40-second video uses. The figure is **[U]**.
10. He gives a first look at his automated pipeline for producing videos at scale.

## Prompts shown
- **None recoverable.** The linked Google Doc does not hold this video's prompts at access (see Sources). The thumbnail has a mock prompt box: "A fun animated story about a hare and a tortoise racing in a sunny forest…". That is thumbnail art, **[U]** whether it was the real prompt.

## Tools / MCPs / skills / repos named
- Claude Code. The thumbnail says "**Opus 5.5** built this" and the tags mention the "claude 20 dollar plan".
- HyperFrames: https://github.com/heygen-com/hyperframes
- Kokoro TTS (local).
- NVIDIA Parakeet (ASR, word timestamps).
- Runware API (image generation, paid API): https://runware.ai
- FFmpeg.
- His own "custom video editor" (he says the tutorial was edited in it).

## Timing and sound tricks
- **Voice first, then word-level timestamps.** Kokoro voiceover is transcribed with Parakeet to get word timings, which drive the captions and scene changes. This is inferred from the description and the word-by-word caption in the output thumbnail. **[U]** for the exact mechanism.
- **The V1 failure mode to avoid:** "static slides with out-of-sync audio". Without explicit timing data, the scenes didn't move and didn't match the voice.
- **SFX and music** were added by Claude through **external API keys it found in the environment**. This is not synthesis in code. Which providers it used is **[U]**.
- He gives no BPM or beat grid. **[U]**

## What the result looks like (thumbnails; the video itself is **[U]**)
- **Output video thumbnail ("hare and tortoise v2"):**
  - A painterly, **AI-generated storybook background**: forest path, blue sky, a pennant-flag bunting and a red-and-white finish tape.
  - **Cut-out cartoon animal characters** on top: tortoise with a gold medal and straw hat, hare in a scarf, owl, squirrel, fox with a chequered flag, bear and raccoon.
  - A dust cloud, and **word-by-word burned-in captions** at bottom centre ("he raced for the") in a rounded heavy font, **orange with a dark outline**.
  - It looks like modern children's-book illustration rather than a literal 1960s cartoon. **[U]**
- **Tutorial thumbnail:**
  - A four-panel storyboard: "1 Race Start", "2 Hare Runs Ahead", "3 Tortoise Keeps Going", "4 Tortoise Wins!", in 3D-render cartoon style.
  - A timeline mock with tracks for Animation, Voiceover and Background Music, 0–24 s.
  - "Opus 5.5 built this" in orange and black.

## Useful for our Remotion pipeline
- **Free local voice and timing stack:** Kokoro TTS, then Parakeet (or whisper) word timestamps, then captions and scene cuts keyed to the words. This maps onto Remotion's `@remotion/captions` and whisper tooling.
- **Expect V1 to come out as "static slides with out-of-sync audio"** unless the brief demands motion within each scene and gives a timing source. Put both in the first prompt.
- **Watch for agents spending API keys on their own.** He reports Claude used extra keys on its own for SFX and music. Scope environment secrets, and say in the rules whether paid APIs are allowed.
- **Measure quota per finished second** (he reports one 40 s video against the $20 plan). That makes a budgeting rule possible.

## Claim checks
All of these rest on the description only, because there is no transcript.
- **4-part harness:** UNCONFIRMED. A "full prompt that turns Claude Code into an animation studio" is mentioned, but its contents are unknown.
- **References → style guide → beat-grid shot list → build:** UNCONFIRMED. The only style cue is "1960s cartoon style".
- **Sound in code (music bed + beats.json, Node SFX):** UNCONFIRMED, and probably not. The description says Claude "used extra API keys on its own to add sound effects and music", which points to API-sourced audio, not code synthesis. Voice comes from Kokoro and timing from Parakeet word timestamps.
- **Self-critique loop:** UNCONFIRMED.
- **"Crew" prompt:** UNCONFIRMED.
- **Ban default looks:** UNCONFIRMED.
- **Targeted fixes, not restarts:** PARTLY CONFIRMED (description). V1 was "static slides with out-of-sync audio", and a "follow-up prompt … fixed it" instead of a restart. Whether it locked what worked is **[U]**.
