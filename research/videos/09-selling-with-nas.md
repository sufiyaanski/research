# 09 — Selling With Nas: "How to make FREE AI Videos with Claude (and Hyperframes) - Full Beginner Tutorial"

- **Channel:** Selling With Nas (https://www.youtube.com/@sellingwithnas)
- **URL:** https://www.youtube.com/watch?v=3sEuuAk-lYc
- **Upload date:** 2026-10-12 (yt-dlp metadata). Companion blog post dated Oct 9, 2026.
- **Length:** 12:29. Views about 51k at access.
- **Sources used (all accessed 2026-11-02):**
  - Transcript: **not obtained.** yt-dlp subtitles failed with YouTube's "Sign in to confirm you're not a bot" check. youtube-transcript-api failed with `RequestBlocked`.
  - Metadata, description and chapters: from `yt-dlp --dump-json`. This worked, with a warning that there was no JS runtime.
  - oEmbed: https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=3sEuuAk-lYc&format=json (worked).
  - Thumbnail: https://i.ytimg.com/vi/3sEuuAk-lYc/maxresdefault.jpg (worked). No frames, because the video file was not downloaded.
  - Creator's own write-up: https://www.sellingwithnas.com/how-to-build-free-ai-videos-with-claude-hyperframes. The post shows an email gate, but the full text is in the public HTML. No email was entered. The post embeds this video and covers the same steps, so it is the main source below.
  - HyperFrames skill text: local digest `/home/user/research/research/01b-remotion-skills-and-frameworks-verbatim.md` §4, taken from `heygen-com/hyperframes`.
- **Confirmation note:** None of this comes from the spoken transcript. Statements from the creator's blog post are his own words but were **not checked against the audio**. Anything from neither the blog nor the description is marked **[U]**.

## Chapters (from the description)
00:00 Intro · 00:41 Claude Video Plugin · 01:09 Mistake 1 · 01:29 Mistake 2 · 02:21 How to install Hyperframes · 03:31 Creating a simple video with Claude and Hyperframes · 05:21 First AI video result · 06:32 Creating better AI videos · 08:24 Second video result · 09:31 Build a product Demo Video · 10:54 Final video result.

## Method, step by step (from the blog post)
1. **Use Claude Code**, in the terminal or the Code tab of the Claude desktop app, not Claude chat.
   - *Mistake 1:* asking a normal Claude chat to install HyperFrames does not work. It has to run commands and render locally.
2. **Do not add HyperFrames from "Customize → connector/plugin"** (*Mistake 2*). That route sends you to sign up for HeyGen and may lead to usage-based payment. Use the open-source route instead.
3. Install the plugin inside Claude Code:
   - `claude plugin marketplace add heygen-com/hyperframes`
   - `claude plugin install hyperframes@hyperframes`
   - Open a **new tab** so the plugin loads.
4. **Make one project folder per video.** Put assets in it (logos, a "Product Shots" screenshots folder, a mascot PNG) and refer to them by name in prompts. Claude saves the rendered MP4s there.
5. **Prompt** with length, format, assets and the exact CTA. HyperFrames writes HTML/GSAP compositions, and Claude renders them to MP4 locally.
   - The CLI loop (`init → lint → check → snapshot → preview → render`) comes from the HyperFrames skill, not from Nas. **[U] whether shown on screen.**
6. **Iterate with targeted edit requests** such as "slow down the transitions" or "make the headline bigger". He expects one or two rounds.
7. **Model and cost:**
   - He builds with **Claude Opus 5.5**, then switches to **Sonnet 5.5** (`/model`) for small follow-up tweaks to save usage.
   - Fable 5.1 suits long or complex videos. Haiku 4.5 is only for tiny edits.
   - A 10–15 s video on Opus 5.5 used about **9% of a session** on the $20 Pro plan.
   - He recommends keeping videos **≤ 30 s**.

## Prompts shown (from the blog; quoted briefly, then summarised)
1. **Product demo (10 s):** "I want you to build me a 10-second product demo video to promote my startup - https://talktomedata.com/…"
   - Showcases the Social Media AI Agent: what it extracts, finds and proposes.
   - Points to the product page and to the "Product Shots" folder of screenshots.
2. **Video inspired by another video, with a mascot:** "Figure out what makes the video in this link so good: [Threads post]"
   - Then asks for a Talk to Me Data promo "along the lines of that video".
   - "Use the ambassador (TTMD_agent_v3) in the folder and animate it as the personification of the Agent."
3. **Feature-packed explainer (15–20 s):** "I now want you to draw inspiration from this video: [x.com/code_kartik post]"
   - Shorter, and highlights many tasks: pulling data, analysing, finding winners, tracking competitors.
   - Uses many website screenshots, with the exact CTA "Sign up for Free at Talk to me Data".
- **Blog tips:**
  - Give Claude a reference ("Figure out what makes this video good" beats describing a style).
  - Add real assets.
  - Be specific about length, format and CTA.
  - Expect a round or two of edits.
  - Keep videos under 30 s.

## Tools / MCPs / skills / repos named
- **HyperFrames** (HeyGen, open source, Apache-2.0): https://github.com/heygen-com/hyperframes. Installed as the Claude Code plugin `hyperframes@hyperframes`.
- **Claude Code** in the terminal or desktop Code tab. Models: Opus 5.5, Sonnet 5.5, Fable 5.1, Haiku 4.5.
- **HeyGen sign-up route** via Claude "Customize" connectors: he warns against it.
- His own product, used as the demo subject: https://talktomedata.com/
- Reference videos he used: a Threads post by @ahmedshawki_ai and an X post by @code_kartik (links in the blog). Not opened.
- Related post on his site: "How to Edit Videos in Claude Code: 45 Editing Styles with HyperFrames and /effects". It mentions a free GitHub skill. Not opened; **[U]**.

## Timing and sound tricks
- **Nothing on BPM grids, beats.json, SFX synthesis or music beds** is in the description or the blog. **[U]** whether the rendered videos have sound.
- His only timing guidance is overall length: 10 s, 15–20 s, ≤ 30 s. Asking for a 15–20 s cut with "many tasks" implies short, fast shots. **[U]**
- **Defaults in the HyperFrames skill (tool behaviour, not the creator's words):**
  - Films over ~15 s that tell something get music and sound on their visible actions unless silence is asked for.
  - Media and music go through `/media-use`, which defaults to HeyGen when the user is signed in. Kokoro TTS and Parakeet/whisper transcription are local options.
  - This matters for "free": the paid HeyGen media paths are what Nas is steering people away from.

## What the result looks like (thumbnail only, so all **[U]** for the video itself)
- The thumbnail shows a laptop with a **white card UI**: bold black sans headline "Less work." and a **magenta/pink** "Better results.", a small avatar line "Talk to Me Data · Social Media AI Agent", and a pink pill CTA "talktomedata.com →".
- It has a **3D cartoon mascot** (a boy with glasses holding a laptop) inside concentric circles and a frosted "✦ no editor" chip.
- Under the card is a **timeline with coloured clip bars** (pink, blue, yellow-green) and a yellow playhead.
- Overall style: a clean SaaS promo with a light background, heavy geometric sans and a pink accent.

## Useful for our Remotion pipeline
- **"Figure out what makes this reference good" as step 1.** Have Claude write down what a reference video does before building. It is cheap and gives a better brief than adjectives.
- **Write length, format, asset folder names and exact CTA text into every brief.** Keep assets in named folders that Claude can be pointed at.
- **Build with the strongest model, then switch to a cheaper one for small follow-up edits.** This is his budget pattern.
- **Keep pieces ≤ 30 s.** About 9% of a Pro session per 10–15 s video is a usable budget figure.
- **Plugin or connector routes may bill through a third party.** Prefer local, open-source installs. This is relevant if we ever borrow HyperFrames skills: copy the rules, not the paid media paths.

## Claim checks
- **4-part "motion studio rules" harness, "90% harness":** UNCONFIRMED. The blog has no rules file. The HyperFrames skill does have a render contract, but that is the tool, not Nas.
- **References → style-guide .md → shot list on a beat grid → build:** UNCONFIRMED. Only the reference step matches ("Figure out what makes the video in this link so good"). There is no style-guide file and no BPM grid.
- **Sound in code (music bed + beats.json, Node SFX):** UNCONFIRMED. Sound is not mentioned.
- **Self-critique loop (mid-frame screenshots, scores 1–10):** UNCONFIRMED for the creator. HyperFrames' own work loop (`snapshot --review` → REVIEW.md) is similar, but that is tool behaviour.
- **"Crew" prompt plus story:** UNCONFIRMED.
- **Ban default looks by name:** UNCONFIRMED for the creator. HyperFrames' spec.md has a "BANNED by default" list, but that is the tool.
- **Targeted fixes, not restarts:** PARTLY CONFIRMED (blog). He says "Expect a round or two of edits… 'slow down the transitions' or 'make the headline bigger'" and uses Sonnet for small follow-up changes. He doesn't say anything explicit about locking what works.
