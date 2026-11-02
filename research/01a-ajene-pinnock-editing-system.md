# Ajené Pinnock: "My Claude Code Editing System + Trial Reels = Cheat Code"

Video: https://youtu.be/pWJL4oGZZfw. Full transcripts are in [`transcripts/`](transcripts/).
Researched 2026-11-02. All numbers below are self-reported by Ajené unless marked otherwise.

## TL;DR

- **The video is mostly about trial reels, not about how the editor is built.** Of its 10 minutes, only about 30 seconds describe the editing system (≈4:13–4:30 and 7:00–7:31).
  - The system itself is explained in two earlier Ajené videos, used here as context:
    - **[V2]** "Unfortunately, Claude Changed Social Media Forever." https://www.youtube.com/watch?v=KD71g4TK6Sg (2026-10-25)
    - **[V3]** "I Let Claude Edit My Entire Week's Content (Live & Full Setup)" https://www.youtube.com/watch?v=F_oC13Lx2Xk (2026-10-18)
- **The editor does not use Remotion.** The stack is the Claude desktop app (Code tab) + Opus + ElevenLabs transcription + HyperFrames (HeyGen's HTML-to-video renderer) + ffmpeg + Node/Python.
- **The idea worth copying is the loop:**
  1. Write a style **skill**.
  2. Claude makes a 720p preview.
  3. You leave timestamped notes in a small review app.
  4. Claude fixes them.
  5. You say **"save this to the skill"**, so each note becomes a permanent rule.

  Ajené says this cut revisions from about 15 prompts per video to 2 ([V3] 21:41).
- **Trial reels, with two methods:**
  1. **Remake your winners.** Post 5–7 variants as trial reels the same day a main-feed video takes off.
  2. **Multiple hooks, one body.** Record 3 hooks, keep the body, and have Claude render 3 versions.

  Every variant carries a CTA to a free lead magnet, not a direct sale. **No metric thresholds are given:** a winner is simply a reel that "took off."
- **Missing evidence.** None of the prompts were readable on screen: the video stream was blocked, and only 160×90 storyboard frames could be read. So every prompt below comes from the **spoken audio** (YouTube auto-captions).

## Video metadata
Source: `yt-dlp --dump-json`, fetched 2026-11-02 (VERIFIED).

- **Channel:** Ajené Pinnock (@AjenePinnock), https://www.youtube.com/channel/UC6f6ttpBax9bOgg3nACtgwA
- **Published:** 2026-11-01. **Length:** 10:00.
- **Stats on 2026-11-02:** 2,021 views, 31 likes, 6 comments.
- **Chapters:**
  - 0:00 Why Trial Reels Are Your New Growth Engine
  - 2:29 Method One: Remaking Your Winning Content
  - 6:11 Method Two: Multiple Hooks, One Body
  - 7:38 Essential Best Practices for Your Reels
- **Thumbnail:** "3,000,000 views in 7 days." It shows an Instagram "All content · 7 days" screen (Oct 20–26): Views **3,013,888**, Net followers **+8,194**, Interactions **158,090**.
- **Description, verbatim:**
  > Doors open soon for my AI Editor: https://editing.ajenepinnock.com/
  > Free AI Editing Skill: https://ajenepinnock.kit.com/774f42dbd9
  > Use my Claude editing system to produce high-performing content. I reached three million views in seven days using this method.
  > I have built an automated workflow that uses AI editing to handle the heavy lifting of post-production. By recording raw footage and letting the model manage cuts, I maintain consistency across Instagram, YouTube, TikTok, and LinkedIn while significantly reducing my costs.
  > This system works for any creator looking to scale their output without spending hours in a timeline. You will learn how to prompt the model for specific visual styles and apply trial reels to your own projects for better reach.

**How the transcript was obtained**
- `youtube-transcript-api` was IP-blocked.
- The `en-orig` auto-caption track was fetched directly from the signed timedtext URL in the yt-dlp metadata.
- The video stream returned 403, so there was no frame extraction. Only storyboard sprites (160×90, one every ≈4.96 s) were read.

**Caption errors to read past:** "trial rules" = trial reels. "Sonix" = Sonnet. "Whisper flow" = Wispr Flow (a dictation app). "foul take" = flubbed take. "real style" = reel style.

---

## 1. The editing system, step by step

### From this video (audio)
- **4:13–4:30:** "I didn't actually edit any of those videos. Like I just gave it to my AI AI editor, gave it a template, explained what I wanted, and I just I spoke to it in plain language. Of course, I then had my edit review section where I can leave timestamped notes for things that I didn't want. But that's how I was able to create five different versions. I told it I wanted to create trial rules, five different versions, seven different versions. Told it what to do so it avoids duplicate detection, like change around the order of the videos."
- **7:00–7:31:** the three-hooks instruction (see §3).

### From [V2] KD71g4TK6Sg (Ajené says Claude edited this whole video)
1. **Stack and costs (2:41–3:22)**
   - Claude Max at $100/mo, later moved to the $200 plan (10:40). A client manages on the $20 plan.
   - Transcription with ElevenLabs at "$0.22 per hour", or a free local Whisper.
   - "HyperFrames, which does like the animations, the text, the graphics, the captions, everything. Then FFmpeg."
   - Node.js and Python are also installed.
   - "roughly it's going to be like three dollars per like video."
   - "I did 16 short form videos with Claude on a $100 plan. It took up 22% of my weekly usage."
2. **Pipeline (5:16–5:58):** "I have the raw recording. I'm going to give it to Claude. Claude already has my skills, my templates, etc., and it's basically going to run every tool. I'm going to give it a simple prompt. It's going to transcribe. It's going to cut. It's going to do the captions and the text, any B-roll if, like, necessary, depending on my templates, any animations, etc., sound effects, music, and then it will render a 720p version so I can leave notes inside a editing review app, so then it can then make those changes and then do the final export at 1080p for me because it's just a lot faster than 4K."
3. **Setup (6:01–6:41)**
   - Use the Claude **desktop app → Code tab**. The web app, or the chat/cowork tab, "is not going to work for editing videos."
   - Install Homebrew on Mac.
4. **Style becomes a skill (6:41–7:46).** See the rule examples in §3. The loop is: "Claude does the edit following the skill. You will leave notes … at that exact second. Claude will fix it. It renders the new version. And then you can say save this to the skill."
5. **Live run (10:21–11:41)**
   - Start a new Code session, drag in the video, and paste the prompt (dictated with Wispr Flow).
   - "I use Opus high." The skill can also be called directly as a slash command.
   - The edit took about 30 minutes.
6. **Review app (12:01):** "my editing review app, almost like frame.io."
   - The notes panel has two buttons: "send notes to Claude" (Claude is "listening") and "approve and render the final" (16:40–19:02).
   - One note round used "2% of my session usage … 1% of my weekly usage" (17:00).
7. **Batches (19:02–19:40):** "it will do agent sub agents to cut all seven videos… sub agent for the captions… It might be like two and a half or three hours for seven videos."

### From [V3] F_oC13Lx2Xk
1. **Ingest (0:38–2:41)**
   - Batch-record (16 videos that day) and copy the camera card to an external drive.
   - Ajené says what each video is about while recording, so Claude can auto-select a template (1:01–1:22).
2. **Rename and sort prompt (2:59–3:35)**, quoted in §3. The output was two folders, transcribed locally and named by record date.
3. **Edit prompt: plan, then one sample, then batch (5:21–6:41)**, quoted in §3.
4. **Model choice (7:01–7:20):** "use Opus to do the overall planning, and then you can use sub agents to do other sections of the video. Always make sure that you're using Eleven Labs to transcribe these videos for accuracy reasons."
5. **Remote monitoring (7:51–9:00):** progress is checked from the Claude phone app. Claude always renders a full copy that can be watched on the phone.
6. **Review app (9:21–13:40)**
   - The app shows graphics timing, inserts, B-roll and the audio track.
   - Press **N** to add a note at the playhead, then "copy all the notes for Claude." ("request changes … never seems to work for me").
7. **Ajené's own recap of the workflow (10:01–12:40)**
   1. Record, sometimes speaking notes for Claude inside a clip.
   2. AI renames and sorts the files.
   3. "tell Claude to come up with a plan and then edit one video. Just so I can confirm we're on the right track before wasting my credits on all the other ones."
   4. Leave timestamped feedback in the review app.
   5. Once the sample is approved, Claude edits the rest and uploads them to Google Drive.
8. **Usage on the 5x plan**
   - One video took weekly usage from about 9% to 10%; a batch of 8 took it to 20%.
   - Ajené plans to compact the session at about 400–500k tokens.
   - "the first time I did this … it was 15 different prompts for one version. I only did two prompts" (21:41).
9. **Deliverables (26:01–26:41)**
   - Outputs land on Google Drive, named by date and account.
   - Claude writes a **caption doc** that checks each video ends with the right CTA and adds starter hashtags.
10. **Saving usage (26:41–27:22):** Opus plans, Sonnet does the main edit, "and maybe even Haiku … do the subtitles."
11. **Minimum version (23:40–24:20):** "at least let AI do the captions…"

### Product page
Source: https://editing.ajenepinnock.com/ (VERIFIED via a summarising fetch, so treat quotes as near-verbatim).

- **What it is:** the "AI Editor Package", with the waitlist launching 2 November.
- **Four steps:** Drop in (transcribe; cut silences, mistakes and repeats) → Pick a style → Steer ("Check the rough cut and the look, then leave notes at the exact second") → Export ("The finished reel, a carousel and trial reels, all from that one video").
- **Components:**
  - Edit Studio, which approves each stage: style, rough cut, look, review, saving, carousels and trial reels.
  - Edit Review.
  - Saved styles (colours, fonts, pacing).
  - B-roll Library ("Index your own footage once, then search it in plain English").
  - Video to Written Content.
  - A "Watch" skill that uses Groq so Claude can watch a video from a link.
- **Requirements:** Claude Code on a paid plan, "Node, HyperFrames and ffmpeg." **Remotion is not mentioned.**
- **48 named styles.** The 9:16 styles include Business Reels, Personal Reels, Explainer Panel, Glass Explainer, Split Reel, B-roll and Stacked Text, Fitted Captions, Depth UI, Ranking Format, Cinematic Type, Top 5 Ranking, If/Then Grid, This vs That, Rapid List, Big Type Stack, Line by Line, Flip Cards, Word Morph, Word Swap and Monoline, among others.
- **Trial-reel claim:** "One tier-list video becomes 10 trial reels from two prompts."

**Not stated anywhere:** frame rate, codec or bitrate, folder or CLAUDE.md layout, or the text of any skill file.

### On-screen style (from 160×90 storyboards; large text only)
- **Format:** talking head with orange accent lighting on a dark background, kinetic words beside the head, lower-third stat cards, and full-screen dark-and-orange motion graphics.
- **Legible beats:**
  - ~5 s "3 million views *from trial reels*"
  - ~75–84 s counter "0x" → "50x"
  - ~89–94 s flow diagram ending in "Is your hook good?"
  - ~99–114 s phone mockups "Main feed" vs "Trial reels" with a "100 views" pill
  - ~179–184 s "I remade ▷0" → "▷100K"
  - ~288–308 s "Trial reel 1 / 2 / 3" cards with platform icons re-ordered
  - ~387–397 s 3×3 "Hook 1–3 × Body 1–3" grid
  - ~426–431 s a chat/prompt box being typed into (unreadable)
- **What this tells us:** big numbers, counters, simple diagrams and phone mockups carry the story. This is directly relevant to The Signal's style.

---

## 2. The trial-reels method

**Why trial reels (0:46–1:46).**
- "it literally gives you more opportunities to get views from videos that are already working, or videos that you think deserved more views but didn't get them."
- Trial reels go to non-followers first, so they test whether the hook works on strangers. They "will humble you … only 100 views."
- A client reposted a flopped video, unchanged, as a trial reel and got "like 50x more views than the one on her main page."
- Ajené cites a creator, "Jamie Bridle", gaining "100,000 followers in like the space of a month" (hearsay, unverified).

**Method 1: remake your winners (2:29–5:45).**
1. When a video takes off on the main feed (Ajené: about 100k in 24 h), make variants **the same day**. "uploaded five to trial reels before I went to bed."
2. By morning: "200,000 views, 50,000 views, 30,000 views". All had CTAs. "I instantly just got another 700,000 towards a million."
3. Keep going: "I've probably made like 30 different versions at this point."
4. A small format tweak later brought "an extra 2 million views" (one video at 1M, another past 700k).
5. **To make variants:** tell the editor "five different versions, seven different versions … avoids duplicate detection, like change around the order of the videos."
6. **Listicle reorder trick (4:30–5:31):** each variant opens with a different list item (Instagram first, then YouTube first, then LinkedIn first). Then work out why the winner won ("Oh, it's cuz I made a joke about LinkedIn … It was super controversial. So that sparked the … comments").

**Method 2: multiple hooks, one body (6:11–7:38).**
1. This borrows from ads (10 hooks × 3 bodies). For trial reels: "I would have three hooks that you say in your video. You would just say them back-to-back."
2. Tell Claude: *"Hey, there's three hooks here. Create three different versions with the three different hooks and keep the body the same."* Also: "Tell it to make sure it edits each hook differently."
3. Post one to the main feed and the rest as trial reels, or put them all on trial reels.
4. Extra variants: "tell Claude to create extra versions by cutting out some things … the video's shorter, more people would probably get towards the end."

**Best practices (7:38–9:45).**
1. **Always include a CTA** (email list, leads, the long YouTube video).
2. **Don't sell straight from the Instagram CTA.** Push a free lead magnet and capture the email. Ajené's mistake was sending traffic straight to a low-ticket product: "I potentially would have had 10,000 people plus 20,000 people plus on my email list."
3. **Don't reinvent the wheel.** Copy formats that work in other niches.

**Missing from the video:** retention, skip-rate or share thresholds; any rule for promoting a trial reel to the main feed; posting times beyond "before bed, same day." Ajené judges winners on raw views only.

---

## 3. Prompts, rules and notes (word for word, from audio captions)

### This video
- [7:00–7:16] "Hey, there's three hooks here. Create three different versions with the three different hooks and keep the body the same."
- [4:30] "Told it what to do so it avoids duplicate detection, like change around the order of the videos."

### [V3] F_oC13Lx2Xk
- **Rename and sort [2:59–3:35]:** "on the folder that I have attached, I want you to go through all the files, and see what the files are, and just rename them. Rename them from one to whatever. Name them what the file actually is. So, transcribe the video if you need to. Use a local model for this one. And then, categorize them based on what the videos are. So, if if it is a personal reel that goes on my personal account or my tech AI account, do that. If it's more on my business account, put it into a different folder. So, create two folders, the business folder or the personal tech AI account folder."
- **Edit, one sample first [5:21–6:20]:** "I want you to edit every video inside of here using my personal short-form reels editing style. I would also like you to experiment by using the stacked captions um style, too, on top of it. Make sure you use my B-roll. In certain circumstances, you can borrow elements from other editing skills like the depth UI, putting things behind me, or making it split screen, or adding animations in. I really like that. … So, what I'd like you to do is take one video from the batch first, edit it, so then I can review it and see what you're actually doing. Don't do an edit that is a tier list, because a tier list is the easiest to do. You just use the tier list skill, and you go from there. So, pick any other video."
- **Build the review app [6:20]:** "you can just tell it to create you an app to review the edits, that allow you to have timestamps and see the graphics that's being like that's being created and where it is being created."
- **Note [10:41–11:01]:** "the headline that stays on screen after I'd mention each point … should only stay on screen for the time that I mention it. So, as soon as I mention that point, it stays on screen for around 3 seconds, 5 seconds max, and then it can come off screen. It doesn't need to be on screen all the time, especially when, you know, there's B-roll overlays or there's a full-screen animation"
- **Note [11:40]:** "When you go split screen, I can see that you don't use the space at the top. When we're split screen like this, you can feel free to just use the full frame at the top of the split screen."
- **Note [12:00–12:20]:** "the captions are perfect … but they only need to pop up and fade up one at a time when you're going to use the big orange font to place the text around. Otherwise, the text should just come in with two four words at a time, keeping the same structure … popping up time consistently throughout the whole video is slightly distracting."
- **Note [12:40–13:01]:** "Increase the volume on the instrument tool by 7 decibels." Ajené explains: "minus 47, minus 43 … plus seven will make it at minus 35 … Anywhere between like minus 28 or minus 35 was good on my end when I'm doing Premiere Pro."
- **Note [15:40–16:01]:** "If anything, just stop the animation, keep the text behind me, have the Google Drive pop up… maybe you could have made full screen animations as well… the sound effects, I can barely hear those. So, maybe turn those sound effects up, too."
- **Note [16:40–17:00]:** "move the text hook a bit lower, just above my head … for the text hook where it has a white background for the second line, can we make that white background orange and keep the text black? And make sure that orange is my brand color orange."
- **Batch [17:20–18:02]:** "Go and create the rest of the videos and give me previews for all of them. Also, while you're implementing these, you have permission to go ahead and edit the remaining videos in this folder. Make sure that you give me previews for every single one so I can also create notes for them if I have any. The only thing is for the tier list ranking stuff, you can just use the normal captions like we always use. They can just be SF Pro like They can be SF Pro medium with the spacing minus 45. … Also, use sub agents whenever you can."
- **[19:41]:** "you can use Opus to, you know, plan to make the adjustments, and then potentially use some sub-agents to actually perform the adjustments."

### [V2] KD71g4TK6Sg
- **Skill rules shown as examples [6:41–7:23]:** "when you come up with an editing style, it will create you should tell it to create a skill. And when it creates a skill, it basically has a list of rules and guidelines that it's going to follow every single time. So, you can see cut every pause, every foul take, caption one line just under my chin. … Music 25 decibels under my voice. … Text never covers my face." Then: "it's not as easy as just saying edit my video."
- **[7:40]:** "I always say save it to the skill just to make sure that it saved it to the skill and it never messes up again."
- **Prompt [11:20]:** "Edit this video using my personal real style."
- **Note [12:38–13:00]:** "for each B-roll video that you've put on to showcase my templates that you've edited, each one should go where my finger is. So they need to be smaller and where my finger is pointing they should go where the finger is. You can keep how they're slightly rotated … It's fine if they're slightly touching the top of my head, just don't make them directly cover my face like eyes for example."
- **Note [13:00–13:21]:** "when you've done full screen animations like this, don't add any captions to it."
- **Note [14:01–14:20]:** "the text doesn't stay on screen for long enough. So when you're stacking the captions, the big font that is Ivy Presto doesn't stay on screen for long enough. So make sure that there's a little hang. So even if the word has to come a little bit earlier … so the viewer can actually read it … Make sure you do that for the rest of the captions too."
- **Note [15:00]:** "Change the graphic that you used here for my editing templates. You can make this a full screen animation showcasing the 20 original and then the 30 new templates which are coming soon." Then: "use the highlighted testimonials that we've got."
- **Note [15:47–16:00]:** "put a Claude interface behind me. So, cut me out from the background, put a Claude interface behind me, make it animate in, just like the depth UI editing template would."
- **Note [16:21]:** "Increase the music instrumental by two decibels."

---

## 4. What transfers to The Signal and Q-ROSITY

**Copy directly**
1. **The feedback-to-skill loop**, the biggest fix for "too many rounds."
   - Render a cheap draft (Remotion: lower `--scale`, or stills at key frames).
   - Leave notes at exact timestamps.
   - Claude fixes them, then "save this to the skill."
   - Turn every failed audit item into a written rule, so the next first draft starts higher.
2. **Plan → one sample → batch.** Opus plans; one reel is fully approved before more are made. Ajené tells Claude *not* to pick the easiest format for the sample, so the sample is a real test.
3. **Ask Claude to build a tiny review app.** Video player + press N to add a note at the playhead + "copy all notes" button.
4. **Rule types to copy into skills:**
   - Text hang time: words stay readable after they're spoken.
   - Headline cards stay on 3–5 s max.
   - No captions over full-screen animation.
   - Captions in 2–4 word chunks; word-by-word pops only for emphasis.
   - Text never covers the face (for Q-ROSITY, the character's face).
   - Music about 25 dB under the voice, or −35 to −28 dB in Ajené's Premiere readings.
   - SFX must be audible.
   - Brand colour named as a token.
   - Exact font specs (e.g. SF Pro Medium, tracking −45; a display serif for big type).
   - Use the whole frame in split screens.
5. **Trial-reel variant factory.** In Remotion a variant is just different input props.
   - **The Signal:** reorder list items so each variant opens with a different tactic or number; 3 alternative hook lines over one body; plus a shorter cut.
   - **Q-ROSITY:** 3 alternative "what if…" opening scenes or voice lines over one POV body.
   - Post 5–7 variants as trial reels the same day a main-feed post pops off.
6. **CTA to a freebie on every variant.** A caption doc per video checks that the CTA is there.

**Does not transfer, or is unproven**
- **Rendering tool:** HyperFrames, not Remotion. The process transfers, Ajené's templates do not.
- **Talking-head tricks** (cutting flubbed takes, depth-UI cut-outs, B-roll at a pointing finger). The Signal and Q-ROSITY generate hooks as scenes or voiceover instead.
- **Platforms:** trial reels are Instagram-only. No TikTok or Shorts equivalent is given.
- **Duplicate detection:** "avoid duplicate detection by reordering" is an unsupported claim.
- **Selection bias:** the account already had momentum, and all figures are self-reported.

---

## 5. Gaps and uncertainties
- **The on-screen prompt (~7:06–7:11) and the review-app UI (~4:23) are unreadable.** The video stream download was blocked (403 / bot check).
- **Free AI Editing Skill** (https://ajenepinnock.kit.com/774f42dbd9) is email-gated and blocked to bots. It was not signed up for (research-only rule), so its contents are unknown.
- **Older paid product:** the Stan product "Claude Editing Skills: 20 Proven Edit Styles" returns 404. A search snippet says $59 (unverified).
- **Not reached:** the related video https://www.youtube.com/watch?v=vpAWIF6OZkU ("How I Edit My Videos Using Claude Code (Fully Automated)", bot-blocked) and Instagram @iamajene (429).
- **Transcripts are YouTube ASR**, not human-checked, so names (Jamie Bridle, Ivy Presto) may be misspelled.

## Sources
- https://youtu.be/pWJL4oGZZfw: VERIFIED (metadata, description, full auto-captions; video stream blocked)
- https://i.ytimg.com/vi/pWJL4oGZZfw/maxresdefault.jpg: VERIFIED (thumbnail)
- https://i.ytimg.com/sb/pWJL4oGZZfw/storyboard3_L2/M0.jpg … M4.jpg: VERIFIED (storyboards)
- https://www.youtube.com/watch?v=KD71g4TK6Sg [V2]: VERIFIED (metadata + full captions)
- https://www.youtube.com/watch?v=F_oC13Lx2Xk [V3]: VERIFIED (metadata + full captions)
- https://www.youtube.com/@AjenePinnock/videos: VERIFIED
- https://editing.ajenepinnock.com/: VERIFIED (summarising fetch)
- https://stan.store/AjenePinnock: VERIFIED
- https://ajenepinnock.kit.com/774f42dbd9: UNVERIFIED (403, email-gated)
- https://stan.store/AjenePinnock/p/claude-editing-skills-20-proven-edit-styles: UNVERIFIED (404)
- https://www.youtube.com/watch?v=vpAWIF6OZkU: UNVERIFIED (title only)
- https://www.instagram.com/iamajene/: UNVERIFIED (429)
