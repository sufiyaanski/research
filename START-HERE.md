# START HERE — your content studio, in plain English

You have ideas; this repo turns them into finished videos with Claude doing the work. You approve
four things per video (the story, the plan, the final cut on your phone, and the post itself) and
you do the posting. Everything else is one word: **`/go`**.

**What you're running**

| Channel | What | Where | Starting pace |
|---|---|---|---|
| **The Signal** | price-psychology stories with numbers (cream paper, red money words, the blocky guy) | Instagram Reels, TikTok, YouTube Shorts | 3 a week |
| **Q-ROSITY** | "what if" POV drama with the blocky guy in 3D worlds | Instagram Reels, TikTok, YouTube Shorts | 3 a week |
| **Q-ROSITY Long** | 10–15 min what-if deep dives, same character and worlds | YouTube (Q-ROSITY channel, long-form) | 1 every 2 weeks |
| **channel-3** | an empty slot for your next idea — say `/new-channel` when you're ready | — | after month 1 |

---

## 1. Install the tools (once, ~30 minutes)

1. **Claude desktop app.** Download it from claude.ai/download, open it, sign in with your Claude Max account. You'll use the **Code** tab (that's Claude Code, which can read and write the files in this project and run the video tools on your computer).
2. **Git, Node.js 22 (or newer), ffmpeg and Python 3** — the tools that build the videos.
   - **Mac:** install Homebrew from brew.sh (copy the one line from their homepage into the Terminal app), then paste:
     `brew install git node ffmpeg python@3.12`
   - **Windows:** open PowerShell and paste:
     `winget install Git.Git OpenJS.NodeJS.LTS Gyan.FFmpeg Python.Python.3.12`
   - Check: in a new Terminal window, `node -v` should print v22.18 or higher; `ffmpeg -version` and `git --version` should print something.
3. **Get the project** (Terminal):
   ```
   cd ~/Documents
   git clone https://github.com/sufiyaanski/research
   cd research
   git checkout motion-toolkit-2026-11-02
   ```
4. **Install the video toolkit** (~2–5 minutes):
   ```
   cd toolkit
   npm install
   npm run audio
   ```
5. **Install the free voice** (~3 minutes + a one-time ~350 MB model download on first use):
   ```
   pip3 install kokoro-onnx soundfile faster-whisper piper-tts
   python3 voice/tts.py --check
   ```
   You should see `kokoro-onnx: installed`. (No ElevenLabs key needed. If you ever want a paid voice, see §8.)
6. **Open the project in Claude.** In the Claude app → **Code** tab → choose the `research` folder you just cloned. Claude reads `CLAUDE.md` automatically — those are its studio rules.

## 2. First-run check (paste this into the Code tab)

> Run the first-run checks from START-HERE.md §2: `cd toolkit && npx tsc --noEmit`, `python3 voice/tts.py --text "What if the Moon vanished tonight?" --out out/voice-test`, then render one still of the long-form demo (`npx remotion still LongformDemo out/check.png --frame=120`). Tell me in plain English whether everything works, and fix anything that doesn't.

Then open `toolkit/out/LongformDemo.mp4` (the demo long-form excerpt) and `toolkit/out/LongformDemo-thumb.png` so you know what "finished" looks like.

## 3. Accounts you set up yourself (Claude never logs in for you)

- **Instagram:** a Professional (Creator) account per channel (The Signal, Q-ROSITY). Trial Reels unlock at 1,000 followers.
- **TikTok:** one account per channel.
- **YouTube:** one channel for The Signal (Shorts), one for Q-ROSITY (Shorts + the long-form videos). Verify the channel (phone) so you can upload custom thumbnails and long videos.
- Optional: **Metricool** (free plan = 1 brand) for analytics and scheduling, or **Postiz** / **Upload-Post** for scheduling (see §6).
- Bios: use the "promise" line from each channel's `bible.md`.

## 4. Your routine

### Every day (≈ 1–1.5 hours of your time on build days)
Paste: **`/go`**

Claude reads the board and calendars, tells you today's jobs, and starts. It stops and asks you at each gate:
- **Gate 1 — story, facts, script:** read the 2–6 line story and the facts table. Ask yourself "would I stop scrolling for this?" and "do I trust every number?". Answer `go`, or say what to change.
- **Gate 2 — shot list:** a table of shots on the voice timing. Check the first 2 seconds hook and that every shot has one clear idea. `go` or changes.
- **Gate 3 — the final video:** watch it **on your phone** (AirDrop/send it to yourself), sound on and off. If something bugs you, say exactly what and when ("at 0:12 the caption covers his face").
- **Gate 4 — posting:** Claude writes `publish.md` (titles, captions, hashtags, hook variants). **You post** (§6).

Useful one-liners any time:
- `/go status` — just tell me where everything stands.
- `/idea a video about why concert tickets cost so much` — saves and scores an idea in the right channel.
- `/make-short q-rosity What if gravity doubled for 10 seconds?` — make one specific short now.
- `/make-long What if Earth stopped spinning for one second?` — start a long-form episode.
- `/critique SignalDemo` — an honest scored review of any video.

### Every Sunday (≈ 45 minutes)
1. Export last week's numbers (Metricool → Analytics → export, or copy from YouTube Studio / Instagram Insights / TikTok analytics) and paste: **`/weekly-review <paste numbers here>`**
2. Then: **`/plan-week`** — approve next week's calendar.

### When you have a new channel idea
**`/new-channel`** — a short interview, then a full channel plan, 10 scored ideas and a 6-second style test to approve. Three ready-made concepts are waiting in `studio/channels/channel-3/bible.md` (Scale Shock is the cheapest to start).

## 5. How to review a draft like a pro (2 minutes)

- **Critique sheet:** Claude makes a contact sheet (one still per shot) in `toolkit/critique/rounds/`. Look at it small, like on a phone: can you read every word? Is there one obvious "hero" in each frame? Is the blocky guy's face clear of text?
- **Scores:** each shot is scored 1–10 on story, composition, motion, type and sync; 8 is the bar. Max 3 rounds of fixes — then it ships with the remaining notes logged. You can overrule any score.
- **Phone check (Gate 3):** first 2 seconds — would *you* stop? Any text too small? Does the sound clip or fight the voice? Does the end loop/land?
- **Facts:** open `studio/episodes/<episode>/facts.md` — every number has a link. Click one or two.

## 6. How to post (you do this; Claude never does)

- **By hand (recommended to start):** upload the file named in `publish.md` for each platform, paste the caption, set the cover frame. Upload the clean file to each app — never a video downloaded from TikTok (watermarks lose reach on Instagram).
- **With a scheduler (when you're posting 6+ a week):** Metricool (free for 1 brand; paid from ~$20/month for more), **Postiz** (~$29–39/month) or **Upload-Post** (from ~$16–24/month) can schedule to all three platforms. TikTok only allows posting through audited schedulers like these, so don't build your own uploader. Schedule them yourself from `publish.md`. If you ever want Claude to schedule for you, you must ask it explicitly in that chat, name the tool, and approve the exact pack — the studio rules block it otherwise.
- **Trial Reels** (Instagram, once you have 1,000 followers): post the two hook variants from `publish.md` as Trial Reels, read them after 24 h, share the winner.
- **Long-form:** upload the mp4, the thumbnail PNG, paste `description.md` (it already has the chapters and sources), upload `captions.srt` as English subtitles, add the end screen, and set each related Short's "Related video" to it.

## 7. Making the most of Claude Max

- **Big thinking on the strongest model, small fixes on a cheaper one.** Use the strongest model (Opus) for planning, scripts, building new videos and critique. For "make the caption bigger" or "move the number 3 frames later", switch to Sonnet in the model picker — it uses much less of your plan.
- **Keep shorts ≤ 60 s while iterating**, and fix single shots, not whole videos. For long-form, re-render one chapter (`--chapters c03`), never the full 12 minutes, to check a fix.
- **Batch.** Do two shorts in one sitting (same channel) — Claude has the rules loaded already.
- **Start a fresh chat per episode** (or after `/go` finishes a job) so old context doesn't eat your usage.
- **Rendering is free** (your computer does it). Rough times on a laptop without a gaming GPU: a 45 s 2D short ≈ 3–5 min; a 45 s 3D short ≈ 8–15 min; a 12 min long-form ≈ 1.5–2.5 hours (leave it running; chapters resume if interrupted).
- You can see how much of your plan you've used in the Claude app's settings (Usage).

## 8. Optional paid voice
The free Kokoro voice is good. If you later want ElevenLabs: create an API key on elevenlabs.io, then in a Terminal `export ELEVENLABS_API_KEY=...` (or put `ELEVENLABS_API_KEY=...` in a file named `.env` in the `research` folder — it's ignored by git, never commit it). `tts.py` will use it automatically. Remove it to go back to free.

## 9. When something breaks

| You see | What it means | Fix (paste to Claude or run yourself) |
|---|---|---|
| `ERR_CERT_AUTHORITY_INVALID` or fonts look wrong (Times New Roman) | a work/school network or proxy blocks Google Fonts | run renders with `REMOTION_IGNORE_CERT_ERRORS=1` in front, e.g. `REMOTION_IGNORE_CERT_ERRORS=1 npx remotion render …`; or switch networks |
| `Error creating WebGL context` / black 3D scenes | no graphics card the renderer can use | add `--gl=swangle` to the render command (slower, always works) |
| Render dies with `SIGKILL`, "out of memory", or the laptop freezes | too many frames rendering at once | add `--concurrency=2` (or 1); close Chrome; for long-form render one chapter at a time with `--chapters c02` |
| Sound crackles/clips at a hit | sound effects stacked over the music | ask Claude: "check the mix of <video> — true peak must be ≤ −1 dBTP" (the long-form pipeline already normalises to −14 LUFS) |
| Captions/words out of sync with the voice | the voice was re-generated but the timings weren't | re-run `tts.py` and `make-beats` (or `render-chapters --only voice` for long-form) — never hand-type timings |
| The voice mispronounces a number or name | TTS read it literally | give that line a `tts` spelling ("9:00 p.m." → "nine p m") — Claude knows how |
| `tts.py`: "no TTS engine available" | the voice packages aren't installed | `pip3 install kokoro-onnx soundfile faster-whisper` |
| `npx tsc` errors after an edit | a code mistake | paste the error to Claude: "fix the typecheck" |
| "Round 4 refused" | the 3-round critique limit | ship the best round; note what's under 8 |
| Anything else | — | paste the full error to Claude and say "fix this, explain in one line what it was" |
