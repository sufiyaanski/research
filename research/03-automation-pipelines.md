# 03 — Automating The Signal and Q-ROSITY end to end with Claude

*Research date: 2026-11-02. Prepared for Sufiyaan (The Signal: price-psychology motion graphics in Remotion, 45–70 s, 60 fps. Q-ROSITY: "what if" reels with a blocky character animated in code).*

**How to read this.** Every fact carries a source link. Facts I only saw in search-engine summaries, without opening the page, are marked **(unverified)**. Star counts come from the ungh.cc GitHub mirror API, and last-commit dates come from shallow `git clone` + `git log -1`, both on 2026-11-02. `gh api` was blocked for these repos in this sandbox. Reddit (403) and YouTube transcripts (IP-blocked) could not be reached, so community anecdotes come from blogs and dev.to.

---

## 0. TL;DR

1. **Owning the whole stack only works on YouTube and Instagram.** TikTok will not audit a personal tool: its guidelines list *"A utility tool to help upload contents to the account(s) you or your team manages"* as **not acceptable**. Unaudited clients can only post `SELF_ONLY` (private), to private accounts, for at most 5 users per 24 h ([TikTok guidelines](https://developers.tiktok.com/doc/content-sharing-guidelines)). **For TikTok, use a scheduler that already passed the audit:** Postiz Cloud, Upload-Post, Zernio (formerly Late), Metricool, Buffer or Ayrshare. Do not self-host Postiz for TikTok, because you would need your own TikTok app, which stays unaudited ([Postiz TikTok doc](https://docs.postiz.com/self-host/providers/tiktok.md)).
2. **YouTube API uploads changed in 2026.**
   - Since 2026-06-01, `videos.insert` has its own quota bucket: **100 calls/day by default, 1 unit per call**. Every other endpoint shares the separate 10,000 units/day ([revision history](https://developers.google.com/youtube/v3/revision_history), [getting started](https://developers.google.com/youtube/v3/getting-started)).
   - The current `videos.insert` reference (updated 2026-10-15) says *"Videos uploaded from unverified API projects are not restricted to private viewing mode."* That contradicts the 2020 rule, which is still in the revision history.
   - **Test it:** upload one video as `public` and read `status.privacyStatus` back.
3. **Instagram fully supports Reels via API, including Trial Reels.**
   - Trial Reels use `trial_params.graduation_strategy` = `MANUAL` or `SS_PERFORMANCE` ([IG User Media ref](https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/media)).
   - You need a professional (Business or Creator) account.
   - The posting limit is **100 API posts per rolling 24 h** in the "Rate Limit" section, but the same page says 50 in its carousel section ([Content Publishing](https://developers.facebook.com/docs/instagram-platform/content-publishing/)).
4. **Monetization risk is the biggest non-technical threat.** YouTube's "inauthentic content" policy explicitly demonetizes *"Videos where characters are put in the same situation over and over again with the same outcome"* and *"AI-generated content made with generic or unoriginal templates"* ([YPP policy](https://support.google.com/youtube/answer/1311392?hl=en)). That sentence is a direct warning for Q-ROSITY's recurring blocky character. Vary the scenarios and outcomes on purpose, and keep a human perspective in each video.
5. **Best reference implementation found:** [hassancs91/claude-faceless-shorts-creator](https://github.com/hassancs91/claude-faceless-shorts-creator) (294★, last commit 2026-08-18, MIT).
   - Stack: Claude Code skills + Remotion TSX + ElevenLabs `/with-timestamps` word-exact captions + phone-scale frame QA + SFX library.
   - It is almost exactly The Signal's stack. Copy its contract pattern: `brand.md`, `beats.json`, `vo.gen.ts`, and a required frame QA before every render.
6. **Remotion is free** for individuals and companies of up to 3 people, including automation ([Remotion license FAQ](https://www.remotion.dev/docs/license/faq)). The hosted Remotion MCP was **shut down on 2026-10-26**; use the `remotion-dev/skills` Agent Skills and `/remotion-docs` instead ([Remotion MCP page](https://www.remotion.dev/docs/ai/mcp)).
7. **Rough cost at 1 video/day per channel (60/month):**
   - Lean: ~$60–70/month, about $1 per video.
   - Recommended (Claude Max + ElevenLabs Creator + scheduler + music): ~$160–185/month, about $2.70–3.10 per video.
   - Details in §6.

---

## 1. Recommended reference architecture

### 1.1 Principles
- **One repo, two channel packages, one shared animation kit.** Claude Code is the builder. Skills hold the procedures, `CLAUDE.md` and `brand.md` hold the rules, and JSON files hold the contracts between stages. This is the hassancs91 pattern, verified in its [CLAUDE.md](https://github.com/hassancs91/claude-faceless-shorts-creator).
- **Batch weekly, publish daily.** Humans approve ideas and hooks in batches and review finished videos. Scheduling, analytics pulls and reports run unattended.
- **Every unattended loop reads back from the platform, which is the source of truth.** One builder's Claude Code scheduler published the same article five times because nothing wrote results back ([dev.to/clawlabs](https://dev.to/clawlabs/i-automated-my-content-pipeline-with-claude-code-it-published-the-same-article-five-times-mlc)).
- **Hard human gates are enforced by hooks, not by prompts.** A `PreToolUse` hook blocks any posting tool unless `episodes/<id>/APPROVED` exists. Ayrshare's official Claude plugin ships the same `PreToolUse` safety pattern for live-side-effect tools ([ayrshare plugin README](https://github.com/ayrshare/ayrshare-social-media-api-claude-plugin)).

### 1.2 Flow diagram

```mermaid
flowchart TD
  subgraph WEEKLY["Weekly (Sun) — Claude Code scheduled task or claude -p cron"]
    A1[analytics-pull: YouTube Analytics API, IG Insights,<br/>TikTok video.list / scheduler analytics → data/metrics.sqlite]
    A2[weekly-review skill: Claude summarises winners/losers,<br/>hook & retention patterns → reports/YYYY-WW.md]
    A3[idea-scout skill: 10 ideas per channel scored vs past data<br/>+ novelty check vs ideas/used.jsonl]
    A1 --> A2 --> A3
  end
  A3 --> H1{{HUMAN GATE 1: pick 7/channel,<br/>edit hooks (~15 min)}}
  H1 --> B1
  subgraph BUILD["Per episode — interactive Claude Code or claude -p"]
    B1[research skill + researcher subagent:<br/>facts.json with source URLs (The Signal)]
    B2[script skill + script-critic subagent:<br/>script.md + beats.json (hook ≤3s, ~2.7 words/s)]
    B3[voice: ElevenLabs /with-timestamps → voice.wav + vo.gen.ts]
    B4[build: Remotion TSX from shared kit<br/>(@remotion/three for Q-ROSITY character)]
    B5[QA: render key frames at phone scale; qa-reviewer subagent reads PNGs;<br/>ffprobe checks (duration, fps, loudness, A/V offset)]
    B6[render: local or Remotion Lambda → output/final.mp4]
    B7[package: titles/captions/hashtags per platform → publish.json]
    B1 --> B2 --> B3 --> B4 --> B5 --> B6 --> B7
  end
  B5 -->|fail| B4
  B7 --> H2{{HUMAN GATE 2: fact sign-off (Signal)<br/>+ watch final on phone → touch APPROVED}}
  H2 --> C1[schedule skill: Postiz / Upload-Post / Zernio MCP or CLI<br/>(PreToolUse hook requires APPROVED)]
  C1 --> C2[platforms: YT Shorts, IG Reels (optionally Trial Reels), TikTok]
  C2 --> D1[daily: publish verification — read platform post list,<br/>write ids back to publish.json / metrics DB]
  D1 --> A1
  C2 --> H3{{HUMAN: comment replies, community, DMs}}
```

### 1.3 Folder layout (proposed)

```
signal-curiosity-studio/
  CLAUDE.md                     # global rules: run from root, gates, never post without APPROVED, cost caps
  .mcp.json                     # postiz | upload-post, fal (optional), elevenlabs (optional)
  .claude/
    settings.json               # hooks (see below), permissions allowlist
    skills/
      idea-scout/SKILL.md       # reads data/metrics.sqlite + ideas/used.jsonl
      research-facts/SKILL.md   # The Signal: every number → facts.json {claim, value, source_url, quote}
      write-script/SKILL.md     # hook grammar, 45–70 s, word-rate limits, banned CTA outros
      build-episode/SKILL.md    # Remotion composition from shared kit; frame-0 rule; safe areas
      voice/SKILL.md            # ElevenLabs with-timestamps → vo.gen.ts (cached by text hash)
      qa-frames/SKILL.md        # stills at beat boundaries, ffprobe/loudnorm checks
      package-post/SKILL.md     # per-platform title/caption/hashtags/is_aigc flags
      schedule/SKILL.md         # wraps postiz CLI/MCP or upload-post MCP
      analytics-pull/SKILL.md   # YouTube Analytics (creatorContentType==SHORTS), IG insights, TikTok
      weekly-review/SKILL.md
    agents/
      researcher.md             # web search + citation discipline, refuses unsourced numbers
      script-critic.md          # scores hook/retention/novelty vs last 30 episodes
      qa-reviewer.md            # reads PNG frames, checks captions/safe zones/loop
      policy-checker.md         # YPP "inauthentic content" variation check, AI-label flags
  packages/kit/                 # shared Remotion components: Captions, ProgressBar, SafeArea, SFX helpers
  channels/
    the-signal/
      brand.md  CLAUDE.md  IDEAS.md
      remotion/src/episodes/<id>/Episode.tsx  vo.gen.ts
      episodes/<YYYY-MM-DD-slug>/
        idea.json  facts.json  script.md  beats.json  voice/  sfx-plan.json
        qa/frames/*.png  qa/report.md  output/final.mp4  publish.json  APPROVED
    q-rosity/
      brand.md  CLAUDE.md  character/      # LOCKED voxel character rig (code), pose library
      ... same episode structure ...
  media/library/{sfx,music}/catalog.json   # reuse before generate
  data/metrics.sqlite                       # or a Google Sheet via Drive connector
  reports/2026-W45.md
  scripts/  (render-all.mjs, frames.mjs, upload-media-to-r2.sh, verify-published.ts)
```

**Hooks.** Hook event names (`PreToolUse`, `PostToolUse`, `Stop`, `SubagentStop`, `SessionStart`) are confirmed in the [Claude Code hooks guide](https://code.claude.com/docs/en/hooks-guide.md).
- `PostToolUse` on Write/Edit to `beats.json` or `publish.json` → validate against the JSON schema; fail loudly.
- `PostToolUse` on Edit of `*.tsx` → `tsc --noEmit` + eslint (Remotion lint rules).
- `PreToolUse` matcher on the scheduler MCP/CLI tools → exit 2 unless `APPROVED` exists and `publish.json.status != "scheduled"`. This gives idempotency and blocks double posts.
- `Stop` → append a run summary and cost to `reports/runs.jsonl` (`claude -p --output-format json` returns `total_cost_usd`; [headless docs](https://code.claude.com/docs/en/headless.md)).

### 1.4 What is automated and what stays human

| Stage | Automated by Claude | Human |
|---|---|---|
| Idea generation | Mines metrics + trends, proposes and scores ideas, dedupes against the used list | **Picks ideas, rewrites hooks** (taste) |
| Research | Finds sources, extracts numbers, writes `facts.json` | **Signs off facts** for The Signal (price-psychology studies are often misquoted) |
| Script | Drafts and self-critiques with a subagent | Optional quick edit |
| Visuals | Remotion code from the shared kit; Q-ROSITY character from a locked rig | Occasional style direction; new kit components |
| Voice | ElevenLabs with timestamps | Picks the voice once; spot-listens |
| Edit/assemble, captions | Fully code-driven; captions from word timings | — |
| Render | Local or Lambda | — |
| QA | Frame stills + ffprobe checks + subagent review | **Watches the final on a phone (~2–3 min)** |
| Schedule/post | Scheduler MCP/CLI, gated by the hook | Touches `APPROVED` |
| Analytics | Pull + summary + proposals | Reads the weekly report |
| Community | Can draft replies | **Replies themselves** (Postiz itself doesn't auto-reply to IG comments; [Postiz IG doc](https://docs.postiz.com/self-host/providers/instagram.md)) |

### 1.5 Where to run the automation
- **Interactive Claude Code** for episode builds. That is where quality comes from: preview in Remotion Studio and iterate.
- **`claude -p` from cron/launchd on your own machine** for unattended batch steps. Without `--bare`, `-p` loads the project's skills, hooks and `.mcp.json`. `--bare` skips them and needs `ANTHROPIC_API_KEY` ([headless docs](https://code.claude.com/docs/en/headless.md)). Use `--output-format json --json-schema` for structured outputs and `--max-budget-usd` as a spend cap (same page).
- **Claude Code cloud scheduled tasks** (formerly routines) run on Anthropic cloud on schedule, API or GitHub triggers.
  - Available on Pro, Max, Ultra, Team and Enterprise. Runs count against subscription usage; limits are 100 scheduled runs/hour per account and 30 run-now/API fires per hour per task.
  - They work on a **fresh clone with no local files**, so they suit analytics pulls and weekly reports, not Remotion renders that need your media ([scheduled tasks docs](https://code.claude.com/docs/en/routines.md)).
  - Desktop scheduled tasks run locally but only while the app is open and the machine is awake ([Desktop scheduled tasks](https://code.claude.com/docs/en/desktop-scheduled-tasks.md)).
- **GitHub Actions + `anthropics/claude-code-action`** (9,739★, last commit 2026-10-31, MIT). It authenticates with `ANTHROPIC_API_KEY` or a subscription `CLAUDE_CODE_OAUTH_TOKEN` ([GitHub Actions docs](https://code.claude.com/docs/en/github-actions.md)). It suits nightly analytics jobs, or render jobs that call Remotion Lambda.
- **Agent SDK (Python/TS)** for when you want the pipeline as a program with Claude Code's tools, hooks and sessions ([Agent SDK overview](https://code.claude.com/docs/en/agent-sdk/overview.md)).

### 1.6 Channel-specific notes
- **The Signal (60 fps motion graphics).**
  - Keep a `facts.json` with source URL + quote per number; the researcher subagent refuses unsourced claims.
  - hassancs91's skill keeps narration near **~2.7 words/s**: 3.3 words/s forced a 1.3× speed-up that you can hear ([make-short SKILL.md](https://github.com/hassancs91/claude-faceless-shorts-creator)).
  - 60 fps doubles the frames to render versus 30 fps. That roughly doubles render time and Lambda cost (my inference, not measured).
- **Q-ROSITY (blocky character).** Build the character as a code rig with `@remotion/three` (React Three Fiber inside Remotion; [docs](https://www.remotion.dev/docs/three.md)) or as 2D TSX. Code keeps the character consistent with no gen-AI drift and no per-clip cost. To stay clear of YPP "same situation, same outcome" templating:
  - Track `scenario_type`, `setting`, `outcome` and `twist` per episode in `ideas/used.jsonl`.
  - Have the policy-checker subagent reject ideas too similar to the last N.

---

## 2. Stage-by-stage tool table

| Stage | Primary (recommended) | Alternatives | Notes / source |
|---|---|---|---|
| Idea | Claude Code skill over own metrics DB + `ideas/used.jsonl` | YouTube MCP for competitor research: [ZubeidHendricks/youtube-mcp-server](https://github.com/ZubeidHendricks/youtube-mcp-server) (search, channels, transcripts) | Read-only research tools |
| Research | Claude web search + researcher subagent writing `facts.json` | `anaisbetts/mcp-youtube` (yt-dlp subtitles) | Facts must be human-checked (hassancs91's guide flags a false line the user had to decide on; [LearnWithHasan](https://learnwithhasan.com/guide/how-to-make-faceless-youtube-shorts-with-claude-code/)) |
| Script | Skill + script-critic subagent | Community skills: [AgriciDaniel/claude-youtube](https://github.com/AgriciDaniel/claude-youtube), [sergebulaev/youtube-skills](https://github.com/sergebulaev/youtube-skills), [Melvynx/video-agent-skills](https://github.com/Melvynx/video-agent-skills) | Use them as prompt references; write your own voice |
| Visuals | Remotion + [remotion-dev/skills](https://github.com/remotion-dev/skills) (`/remotion-best-practices`, `/remotion-markup`, `/remotion-render`, `/remotion-captions`, `/remotion-docs`) | `@remotion/three` for 3D voxel; fal MCP for images/clips (`https://mcp.fal.ai/mcp-relay`, OAuth; [fal docs](https://fal.ai/docs/documentation/setting-up/mcp.md)) | Install skills: `npx skills add remotion-dev/skills` ([Remotion skills](https://www.remotion.dev/docs/ai/skills)) |
| Voice | ElevenLabs API `/v1/text-to-speech/{voice_id}/with-timestamps` (character-level timing; [doc](https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps)) | Official [elevenlabs-mcp](https://github.com/elevenlabs/elevenlabs-mcp); Kokoro (free, used by short-video-maker) | Cache clips by text hash so you don't re-bill |
| Captions | `@remotion/captions` + `@remotion/elevenlabs` `elevenLabsTranscriptToCaptions()` or `@remotion/install-whisper-cpp` ([docs](https://www.remotion.dev/docs/captions/api.md)) | [template-tiktok](https://github.com/remotion-dev/template-tiktok) (Whisper.cpp; downloads the 1.5 GB `medium.en` model) | Prefer TTS timestamps to re-transcription |
| SFX / music | Own library + ElevenLabs SFX/Music (music has commercial use on Starter+; [ElevenLabs API pricing](https://elevenlabs.io/pricing/api)) | Epidemic Sound / Artlist / YouTube Audio Library | See costs |
| Render | Local `npx remotion render` | Remotion Lambda (max 15 min per function, 10 GB RAM/disk; [limits](https://www.remotion.dev/docs/lambda/limits)) | Free license if ≤3 people |
| QA | Frame stills at beat boundaries read by Claude + ffprobe | — | hassancs91: "QA is not optional" |
| Schedule/post | **Postiz Cloud** (MCP `https://mcp.postiz.com/mcp`, CLI `postiz`, Claude Code plugin `gitroomhq/postiz-agent`) or **Upload-Post** (official MCP, Claude directory connector) | Zernio (Late), Metricool MCP (`https://ai.metricool.com/mcp`), Ayrshare plugin, Buffer (community MCPs only) | TikTok must go through an audited app |
| Analytics | YouTube Analytics API (`creatorContentType=SHORTS`; [dimensions](https://developers.google.com/youtube/analytics/dimensions)), IG Media Insights (`reels_skip_rate`, `ig_reels_avg_watch_time`; [insights](https://developers.facebook.com/docs/instagram-platform/reference/instagram-media/insights)), TikTok `video.list` counts ([video object](https://developers.tiktok.com/doc/tiktok-api-v2-video-object)) | Postiz `analytics:platform` / `analytics:post` CLI ([Postiz CLI](https://docs.postiz.com/cli/introduction.md)); Metricool `get_instagram_reels` / `get_tiktok_videos` ([Metricool MCP page](https://metricool.com/metricool-mcp-claude/)) | Store in SQLite or Sheets |
| Feedback → ideas | weekly-review skill writes `reports/` + updates `IDEAS.md` scoring | — | Always read back from the platform |

**Already in your account (observed in this session's tool list, 2026-11-02):**
- A **Metricool** connector (createScheduledPost, getAnalyticsDataByMetrics, getBestTimeToPostByNetwork, …).
- A **Postiz** skill.

Neither needs new setup to try.

---

## 3. Repos table

| Repo | What it is | Stack | ★ | Last commit | License | Verdict |
|---|---|---|---|---|---|---|
| [hassancs91/claude-faceless-shorts-creator](https://github.com/hassancs91/claude-faceless-shorts-creator) | Claude Code "faceless shorts factory": 5 skills (make-short, make-vox, make-ai-short, suggest-sfx, vidtsx-2d-generator), brand.md contract, beats.json, word-exact captions, frame QA | Claude Code, Remotion TSX, ElevenLabs, ffmpeg, Python stdlib, optional fal/Gemini | 294 | 2026-08-18 | MIT | **Best template for The Signal.** Quality. Copy its contracts and QA discipline |
| [remotion-dev/skills](https://github.com/remotion-dev/skills) | Official Remotion Agent Skills | Markdown skills | 6,060 | 2026-11-02 | (none detected) | **Install. Essential** |
| [remotion-dev/remotion](https://github.com/remotion-dev/remotion) | The framework | React, Chromium, FFmpeg | 69,771 | pushed 2026-11-01 | Remotion License (free ≤3 people) | Core |
| [remotion-dev/template-tiktok](https://github.com/remotion-dev/template-tiktok) | TikTok-style captions with Whisper.cpp | Remotion, whisper.cpp | 300 | 2026-11-02 | n/a | Good caption reference |
| [remotion-dev/template-prompt-to-video](https://github.com/remotion-dev/template-prompt-to-video) | Prompt → story with images + voiceover | Remotion | 169 | 2026-11-02 | n/a | Reference only |
| [digitalsamba/claude-code-video-toolkit](https://github.com/digitalsamba/claude-code-video-toolkit) | "AI-native video production toolkit for Claude Code": `/setup`, `/video`, templates. Claims voiceover ~$0.01 and clips ~$0.23 on open models via Modal/RunPod | Claude Code, Remotion, Qwen3-TTS, FLUX.2, ACE-Step, R2 | 2,402 | 2026-11-02 | MIT | Quality, explainer-oriented; good for skills and commands ideas |
| [calesthio/OpenMontage](https://github.com/calesthio/OpenMontage) | "Agentic video production system", 12 pipelines; turns your coding agent into a studio | Agent-driven, Remotion, stock/Veo etc. | 74,388 | 2026-10-28 | AGPL-3.0 | Very popular. AGPL; heavy. Mine for ideas rather than adopt |
| [gyoridavid/short-video-maker](https://github.com/gyoridavid/short-video-maker) | MCP + REST server: text → Kokoro TTS → Whisper captions → Pexels b-roll → Remotion render | Node, Remotion, Kokoro, whisper.cpp, Docker | 1,453 | 2025-06-21 | MIT | **Stale (>16 months)**; stock-footage style doesn't fit either channel; good MCP+Remotion example. n8n workflows in [gyoridavid/ai_agents_az](https://github.com/gyoridavid/ai_agents_az) (3,946★) |
| [harry0703/MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo) | Topic → script → stock footage → TTS → subtitles → music; WebUI/API/CLI; many LLMs incl. Claude | Python, MoviePy, Edge TTS/ElevenLabs etc., Pexels/Pixabay | 137,230 | 2026-11-02 | MIT | Active and huge, but generic stock-footage slop is exactly the YPP risk profile. Not for these channels |
| [FujiwaraChoki/MoneyPrinterV2](https://github.com/FujiwaraChoki/MoneyPrinterV2) | Shorts automator + Twitter bot + affiliate; **uploads to YouTube by driving Firefox with Selenium using your logged-in profile** | Python 3.12, Selenium | 32,260 | 2026-09-16 | AGPL-3.0 | **Avoid**: browser-automation posting is a ToS/ban risk |
| [FujiwaraChoki/MoneyPrinter](https://github.com/FujiwaraChoki/MoneyPrinter) | V1, MoviePy shorts | Python | 14,129 | 2026-03-26 | MIT | Toy/legacy |
| [RayVentura/ShortGPT](https://github.com/RayVentura/ShortGPT) | "Experimental AI framework" for shorts automation | Python | 8,092 | 2025-02-10 | MIT | **Abandoned** |
| [SamurAIGPT/AI-Youtube-Shorts-Generator](https://github.com/SamurAIGPT/AI-Youtube-Shorts-Generator) | Long video → shorts clipper (Opus Clip alternative) | Python | 5,701 | 2026-10-24 | MIT | Wrong use case (you make original animation) |
| [mutonby/openshorts](https://github.com/mutonby/openshorts) | Long video → viral 9:16 clips | — | 7,391 | 2026-11-01 | MIT | Wrong use case |
| [gitroomhq/postiz-app](https://github.com/gitroomhq/postiz-app) | "Agentic social media scheduling tool", 34 platforms (per docs) | NestJS/Next, Temporal | 40,634 | 2026-11-02 | AGPL-3.0 | **Quality.** Use Cloud for TikTok (audit), self-host only for YT/IG |
| [gitroomhq/postiz-agent](https://github.com/gitroomhq/postiz-agent) | Postiz skill + Claude Code plugin (`/plugin marketplace add gitroomhq/postiz-agent`); CLI-driven; the Claude Code plugin does **not** register an MCP server | Markdown skill + `postiz` CLI | 562 | 2026-10-30 | n/a | Recommended way to drive Postiz from Claude Code |
| [anthropics/claude-code-action](https://github.com/anthropics/claude-code-action) | Run Claude Code in GitHub Actions | GH Actions | 9,739 | 2026-10-31 | MIT | Official; use for nightly jobs |
| [anthropics/claude-agent-sdk-python](https://github.com/anthropics/claude-agent-sdk-python) / [‑typescript](https://github.com/anthropics/claude-agent-sdk-typescript) | Agent SDK | — | 8,402 / 1,856 | 2026-10-31 | MIT | Official |
| [AgriciDaniel/claude-youtube](https://github.com/AgriciDaniel/claude-youtube) | YouTube creator skills (hooks, scripts, Shorts, SEO) | Skills | 630 | pushed 2026-04-10 | — | Prompt reference (unverified quality) |
| [sergebulaev/youtube-skills](https://github.com/sergebulaev/youtube-skills) | Titles/hooks/thumbnails skills | Skills | 82 | pushed 2026-10-28 | MIT (per description) | Prompt reference |
| [Melvynx/video-agent-skills](https://github.com/Melvynx/video-agent-skills) | Script/research/edit short-form skills, Markdown only | Skills | 77 | pushed 2026-10-22 | — | Prompt reference |
| [wilwaldon/Claude-Code-Video-Toolkit](https://github.com/wilwaldon/Claude-Code-Video-Toolkit) | List of skills/MCPs/tools for video with Claude Code | — | 103 | pushed 2026-02-26 | — | Link list |

The last five rows: README not read; only description, stars and date verified.

**n8n templates (low code).**
- [n8n template 19628](https://n8n.io/workflows/19628): "Create faceless YouTube shorts with Zvid, ElevenLabs and OpenRouter". Daily 9am trigger; YouTube upload optional and off by default; default privacy private; needs Zvid render credits.
- [n8n template 6014](https://n8n.io/workflows/6014) **(unverified)**.
- These are stock/AI-image pipelines, a poor fit for code-animated channels.

---

## 4. MCP servers / connectors table

| Server | Type | Endpoint / install | Capabilities | ★ / last commit | Verdict |
|---|---|---|---|---|---|
| **Postiz MCP** | Official, hosted | `https://mcp.postiz.com/mcp` (Bearer API key) or `/mcp/:apiKey` | 13 tools: integrationList, integrationSchema, schedulePostTool, postsListTool, postSettingsTool, generateImage/VideoTool, clippingTool… ([docs](https://docs.postiz.com/mcp/introduction.md)) | app repo 40.6k★ | Good. Analytics via CLI, not MCP |
| Postiz CLI + skill | Official | `npm i -g postiz`; `npx skills add gitroomhq/postiz-agent` | posts:create/list/delete, upload, analytics:platform/post, all JSON output ([CLI docs](https://docs.postiz.com/cli/introduction.md)) | 562★ / 2026-10-30 | Best for Claude Code (handles media upload) |
| antoniolg/postiz-mcp | Community | npm | Postiz API wrapper | 3★ / pushed 2026-02-10 | Unneeded now (official exists) |
| **Upload-Post MCP** | Official; also in Claude connector directory | `claude mcp add --transport http upload-post https://mcp.upload-post.com/mcp` ([README](https://github.com/Upload-Post/upload-post-mcp)) | Publish/schedule/analyze TikTok, IG, YT, etc. | 13★ / 2026-11-01 | Good, cheap, audited TikTok |
| **Metricool MCP** | Official; Claude connector | `https://ai.metricool.com/mcp`; OAuth or `METRICOOL_USER_TOKEN`/`USER_ID` ([page](https://metricool.com/metricool-mcp-claude/)) | Schedule/update posts, best time, analytics incl. `get_instagram_reels`, `get_tiktok_videos`. Video/Reel publishing via MCP **not stated** | PyPI `mcp-metricool` 1.1.9 | Works on all plans incl. Free (Free: 20 scheduled posts/month, 30-day analytics; [help](https://help.metricool.com/mcp-limits-and-plan-requirements-h72jg)). Strong for analytics |
| **Ayrshare plugin/MCP** | Official Claude Code plugin | `claude plugin marketplace add ayrshare/ayrshare-social-media-api-claude-plugin` | Publish, validate_post, history, analytics; PreToolUse confirm hook | 21★ / 2026-10-12 | Quality but $149+/month |
| Zernio (formerly Late / getlate.dev) | Commercial API | getlate.dev now redirects to zernio.com | Unified posting + analytics | Community MCP [htekdev/late-social-mcp](https://github.com/htekdev/late-social-mcp) 1★ (unverified quality) | Cheap per-account pricing |
| Buffer | **No official MCP found** | Community: [ahernan2/buffer-mcp](https://github.com/ahernan2/buffer-mcp) 4★; GraphQL API public beta Feb 2026, create-only **(unverified)** | — | — | Skip for automation |
| **YouTube (read/research)** | Community | [ZubeidHendricks/youtube-mcp-server](https://github.com/ZubeidHendricks/youtube-mcp-server) | 10 read tools (search, transcripts, channels) | 592★ / 2026-08-09 | Good for research |
| YouTube transcripts | Community | [anaisbetts/mcp-youtube](https://github.com/anaisbetts/mcp-youtube) | yt-dlp subtitles | 552★ / 2026-08-16 | Simple, works |
| YouTube upload + analytics | Community | [pauling-ai/youtube-mcp-server](https://github.com/pauling-ai/youtube-mcp-server) (40 tools: Data/Analytics/Reporting APIs; own OAuth) 30★; [brentwpeterson/mcp-youtube](https://github.com/brentwpeterson/mcp-youtube) (guards against the Brand Account OAuth wrong-channel trap) 2★; [adamanz/youtube-mcp-server](https://github.com/adamanz/youtube-mcp-server) 0★ stale | — | Tiny repos. Write your own ~150-line uploader, or post via the scheduler (READMEs not read; **unverified** beyond descriptions) |
| **ElevenLabs MCP** | Official | `uvx elevenlabs-mcp`; `ELEVENLABS_MCP_BASE_PATH` limits file access ([README](https://github.com/elevenlabs/elevenlabs-mcp)) | TTS, voice clone, STT, SFX, music | 1,544★ / 2026-08-20 | Handy interactively. Use the direct API for timestamps in the pipeline |
| **fal MCP** | Official, hosted | `claude mcp add --transport http --scope user fal https://mcp.fal.ai/mcp-relay` (OAuth) ([docs](https://fal.ai/docs/documentation/setting-up/mcp.md)) | Search models, check pricing, run image/video/audio generation | — | Optional (thumbnails, Q-ROSITY backgrounds) |
| Replicate MCP | Official remote (reported) | `mcp.replicate.com` **(unverified)**; community [deepfates/mcp-replicate](https://github.com/deepfates/mcp-replicate) 94★ (pushed 2025-09-24) | Run models | — | Optional |
| Remotion MCP | Official, **shut down 2026-10-26** | Replaced by the `/remotion-docs` skill ([page](https://www.remotion.dev/docs/ai/mcp)) | — | — | Don't use |
| gyoridavid/short-video-maker | Community MCP + REST | Docker | Text → finished short | 1,453★ / 2025-06-21 | Stale |

---

## 5. Platform API limits

| Platform | Item | Limit / rule | Official source |
|---|---|---|---|
| YouTube | Default quota | 100 `search.list` + **100 `videos.insert`** calls/day + 10,000 units/day for all other endpoints | [Getting started](https://developers.google.com/youtube/v3/getting-started), [Quota & audits](https://developers.google.com/youtube/v3/guides/quota_and_compliance_audits) |
| YouTube | Upload cost | **1 unit in the "Video Uploads" bucket**. Granular buckets since 2026-06-01. Before that: ~1,600 → ~100 units (2025-12-04) | [videos.insert](https://developers.google.com/youtube/v3/docs/videos/insert), [revision history](https://developers.google.com/youtube/v3/revision_history) |
| YouTube | Unverified projects | Reference now says uploads from unverified projects are **not** restricted to private. The 2020 rule (projects created after 2020-07-28 → private until audited) still sits in the revision history | [videos.insert](https://developers.google.com/youtube/v3/docs/videos/insert), [videos resource](https://developers.google.com/youtube/v3/docs/videos) |
| YouTube | More quota | Needs the audit / Quota Extension form | [Quota & audits](https://developers.google.com/youtube/v3/guides/quota_and_compliance_audits) |
| YouTube | OAuth "Testing" apps | **Refresh tokens expire in 7 days** (External + Testing). Publish the consent screen for a cron uploader | [Google OAuth2](https://developers.google.com/identity/protocols/oauth2) |
| YouTube | Scheduling | `status.publishAt` requires `privacyStatus=private`; `status.containsSyntheticMedia` flag exists (for realistic altered content) | [videos resource](https://developers.google.com/youtube/v3/docs/videos), [revision history 2024-10-30](https://developers.google.com/youtube/v3/revision_history) |
| YouTube | Analytics | `creatorContentType` dimension (SHORTS); `engagedViews`, `averageViewPercentage`, `audienceWatchRatio` | [Dimensions](https://developers.google.com/youtube/analytics/dimensions), [Metrics](https://developers.google.com/youtube/analytics/metrics) |
| Instagram | Account | Professional account (Business or Creator); media at a public URL (Meta cURLs it) or resumable upload via `rupload.facebook.com` | [Content Publishing](https://developers.facebook.com/docs/instagram-platform/content-publishing/) |
| Instagram | Posting limit | "Instagram accounts are limited to **100** API-published posts within a 24-hour moving period". The same page's carousel section says **50**. Check `GET /<IG_ID>/content_publishing_limit` | [Content Publishing](https://developers.facebook.com/docs/instagram-platform/content-publishing/) |
| Instagram | Reels / **Trial Reels** | `media_type=REELS`, `share_to_feed`, `thumb_offset`, `cover_url`, `audio_name`, **`trial_params` {graduation_strategy: MANUAL \| SS_PERFORMANCE}** | [IG User Media](https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/media) |
| Instagram | App review | Standard Access works without App Review for users **with a role on your app**, so your own accounts can use your own app. Advanced Access needs App Review + Business Verification | [Access levels](https://developers.facebook.com/docs/graph-api/overview/access-levels/) |
| Instagram | Insights | `reels_skip_rate` (skips in first 3 s), `ig_reels_avg_watch_time`, `reach`, `views`, `shares`, `saved`; `impressions` deprecated for media after 2024-07-02 | [Media Insights](https://developers.facebook.com/docs/instagram-platform/reference/instagram-media/insights) |
| TikTok | Unaudited client | Private-only (`SELF_ONLY`); **≤5 users/24 h; accounts must be private**; error `unaudited_client_can_only_post_to_private_accounts` | [Guidelines](https://developers.tiktok.com/doc/content-sharing-guidelines), [Direct Post ref](https://developers.tiktok.com/doc/content-posting-api-reference-direct-post) |
| TikTok | Audit eligibility | **Personal/internal upload tools are "Not acceptable"**; must serve a wide audience; mandatory UX (creator nickname, manual privacy selection with no default, music usage consent) | [Guidelines](https://developers.tiktok.com/doc/content-sharing-guidelines) |
| TikTok | Caps | ~**15 posts/day per creator** across all API clients; **6 req/min per user token** on `/post/publish/video/init/` | [Guidelines](https://developers.tiktok.com/doc/content-sharing-guidelines), [Direct Post ref](https://developers.tiktok.com/doc/content-posting-api-reference-direct-post) |
| TikTok | PULL_FROM_URL | Needs a verified URL prefix/domain | [Direct Post ref](https://developers.tiktok.com/doc/content-posting-api-reference-direct-post), [Postiz TikTok](https://docs.postiz.com/self-host/providers/tiktok.md) |
| TikTok | Analytics | `video.list` has `view_count`, `like_count`, `comment_count`, `share_count`, `is_aigc` (no retention) | [Video object](https://developers.tiktok.com/doc/tiktok-api-v2-video-object) |
| Postiz | API rate | **90 requests/hour on create-post** (fixed, all plans); batch many posts per request; uploads ≤1 GB video | [Postiz limits](https://docs.postiz.com/cloud/limits.md) |
| Upload-Post | Per-account caps | IG 50, TikTok 15, YouTube 30, FB 25 posts per 24 h | [Upload-Post pricing & limits](https://docs.upload-post.com/resources/pricing-and-limits) |

---

## 6. Costs (2 channels × 1 video/day = 60 videos/month; 6 social accounts = 2 brands × YT/IG/TikTok)

### 6.1 Unit prices (verified unless marked)
- **Claude plans** ([pricing](https://claude.com/pricing)):
  - Pro $20/month ($17/month annual).
  - **Max $100/month** (5× Pro usage, includes $100/month API credits).
  - Ultra $200/month (no 5-hour limit, 10× Pro weekly, $200 API credits).
- **Claude API per MTok** ([pricing docs](https://docs.claude.com/en/docs/about-claude/pricing)): Opus 5.5 $4 in / $20 out; Sonnet 5.5 $2 / $10; Haiku 5.5 $0.10 / $0.50 (≤100k-token prompts).
- **ElevenLabs** ([pricing](https://elevenlabs.io/pricing), [API pricing](https://elevenlabs.io/pricing/api)):
  - Plans: Free 10k credits; Starter $6 (30k); **Creator $22 (121k)**; Pro $99 (600k).
  - API TTS: v4/v3/v2 **$0.08 per 1k characters**; Flash/Turbo $0.04.
  - Music: commercial use on Starter+.
- **Remotion**:
  - **Free** for individuals and organisations of up to 3 people, including automation ([FAQ](https://www.remotion.dev/docs/license/faq), [LICENSE.md](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md)).
  - Company license (4+ people): "Automators" $0.01/render with a $100/month minimum, or "Creators" $25/seat/month ([pricing](https://www.remotion.dev/docs/license/pricing)).
  - Lambda official examples: Hello World ≈ $0.001; a 1-minute video-in-video ≈ $0.017–0.021 at 2048 MB in us-east-1 ([cost example](https://www.remotion.dev/docs/lambda/cost-example)).
- **Schedulers**:

  | Service | Price | Source |
  |---|---|---|
  | Postiz Cloud | Standard $29 (5 channels), **Team $39 (10 channels)**, Pro $49; no free plan; 7-day trial | [plans](https://docs.postiz.com/cloud/plans.md) |
  | Upload-Post | Free 10 uploads/month, no TikTok; **Basic $24/month or $16 annual** (5 profiles, unlimited uploads) | [pricing](https://docs.upload-post.com/resources/pricing-and-limits) |
  | Zernio | 2 accounts free, then $6/account for accounts 3–10 | [pricing](https://zernio.com/pricing) |
  | Metricool | Free (1 brand); Starter from $20 annual / $25 monthly (up to 5 brands) | [pricing](https://metricool.com/pricing/) |
  | Buffer | Essentials $5/channel/month (annual) | [pricing](https://buffer.com/pricing) |
  | Ayrshare | Premium $149/month | [pricing](https://www.ayrshare.com/pricing/) |
- **Music**:
  - Artlist AI Starter $11.99/month annual ([pricing](https://artlist.io/pricing)).
  - Epidemic Sound Creator ~$9.99/month annual to ~$17.99–19.99/month monthly; "one channel per platform" **(unverified; aggregator sites)**. Two brands may exceed Creator.
  - YouTube Audio Library free **(unverified, not opened)**.

### 6.2 Per-video and per-month estimate

| Line item | Assumption | Per video | Per month (60) |
|---|---|---|---|
| Claude (subscription) | Max $100 covers interactive builds + unattended runs (Pro $20 likely hits limits building 60 Remotion episodes; **estimate**) | $1.67 (Max) / $0.33 (Pro) | $100 / $20 |
| Claude (if pure API instead) | Opus 5.5, ~0.3M fresh input + ~2M cached + ~80k output per build (**my estimate**) | ~$1–4 | ~$60–240 |
| ElevenLabs voice | ~1,000 chars/script × ~2 takes ≈ 2k chars | ~$0.16 at API rate; Creator plan $22 covers ~120k | **$22** |
| Remotion license | Individual | $0 | $0 |
| Render | Local: $0. Lambda: 60 s @ 60 fps motion graphics ≈ $0.02–0.10 (**extrapolated** from the official 1-min example) | $0–0.10 | $0–6 |
| Music/SFX | ElevenLabs SFX/Music within credits, or Epidemic/Artlist | $0–0.30 | $0–18 |
| Scheduler | Upload-Post Basic (5 profiles is enough; each profile = 1 account per platform) or Postiz Team (6 channels > Standard's 5) | $0.27–0.65 | $16–39 |
| Media hosting for IG/TikTok pull URLs | R2/S3 public bucket (cents; R2 10 GB free per the toolkit README, **unverified** officially) | ~$0 | ~$0–1 |
| **Lean total** | Pro + EL Creator + Upload-Post annual + local render + free music | **~$1.00** | **~$58–66** |
| **Recommended total** | Max + EL Creator + Postiz Team or Upload-Post + Epidemic/Artlist + Lambda | **~$2.70–3.10** | **~$160–185** |

Human time is the real cost: about 15 min/week for idea triage, plus about 5 min/video for fact check and phone review, plus community replies.

---

## 7. What breaks, and what still needs a human

| Failure point | Evidence | Mitigation |
|---|---|---|
| **Demonetization for templated/repetitive AI content** | YPP "inauthentic content" (renamed 2025-07-15). Examples include "characters … in the same situation over and over again with the same outcome", "templated storylines", and "AI-generated content made with generic or unoriginal templates". Reviewers look at main theme, most viewed, newest videos and metadata ([YPP policy](https://support.google.com/youtube/answer/1311392?hl=en)) | Policy-checker subagent with a novelty score. Vary format/outcome. Bring a real perspective (The Signal: an original take per study). Avoid stock slideshows |
| **Enforcement waves against AI channels** | Dec 2025: YouTube terminated two fake AI-trailer channels with 2M+ subscribers ([Futurism](https://futurism.com/artificial-intelligence/youtube-shutting-down-ai-slop-channels)). Jan 2026: 16 channels / 4.7B views; "130,000 channels" figure **(unverified)** | Stay original. No copyrighted footage, no deceptive realism |
| **TikTok private-only posting** | Unaudited clients → SELF_ONLY; personal tools not auditable ([TikTok guidelines](https://developers.tiktok.com/doc/content-sharing-guidelines)) | Post via an audited scheduler, or use "upload to inbox" and publish in-app (Postiz: inbox drafts must be finished within 24 h; [Postiz TikTok](https://docs.postiz.com/self-host/providers/tiktok.md)) |
| **YouTube OAuth tokens die weekly** | Testing-mode refresh tokens expire after 7 days ([Google OAuth](https://developers.google.com/identity/protocols/oauth2)) | Publish the OAuth consent screen, or use a scheduler |
| **Brand Account wrong-channel uploads** | Postiz requires extra Workspace trust steps for Brand accounts ([Postiz YouTube](https://docs.postiz.com/self-host/providers/youtube.md)); brentwpeterson/mcp-youtube exists to guard the "Brand Account OAuth trap" (description) | Verify `channelId` after auth; store per-channel tokens |
| **Duplicate or missed posts in unattended loops** | Claude Code scheduler republished the same article five times; no read-back ([dev.to](https://dev.to/clawlabs/i-automated-my-content-pipeline-with-claude-code-it-published-the-same-article-five-times-mlc)) | Idempotency key per episode; `status` state machine in `publish.json`; verify against the platform list (Postiz `posts:list`) |
| **Scheduler rate limits** | Postiz 90 req/h on create-post ([limits](https://docs.postiz.com/cloud/limits.md)); TikTok 6 req/min/token, ~15 posts/day | Batch weekly in one request; backoff on 429 |
| **Remotion render timeouts (fonts/assets)** | `delayRender()` 30 s timeout. Cloud renders fail when fonts/assets are blocked or unreachable ([timeouts](https://www.remotion.dev/docs/timeout)) | Bundle fonts locally with `@remotion/fonts` + `staticFile()` ([fonts](https://www.remotion.dev/docs/fonts.md)); no runtime network fetches |
| **OOM / SIGKILL on render** | Chrome/FFmpeg memory pressure ([SIGKILL](https://www.remotion.dev/docs/troubleshooting/sigkill.md)); short-video-maker forces `CONCURRENCY=1` and a 2 GB cache to avoid OOM ([README](https://github.com/gyoridavid/short-video-maker)) | Lower concurrency; `disallowParallelEncoding`; or Lambda |
| **Media errors** | Plain `/file.mp4` paths fail; must use `staticFile()`; HEVC unsupported on Linux Chrome ([media errors](https://www.remotion.dev/docs/media-playback-error.md)) | Lint rule + QA |
| **Caption timing drift / local-vs-global frame bugs** | "THE recurring bug: frames inside a `<Sequence>` are LOCAL" ([make-short skill](https://github.com/hassancs91/claude-faceless-shorts-creator)) | Generate captions from TTS timestamps (`vo.gen.ts`); never hand-estimate after voice exists |
| **Audio squeeze / desync** | >~2.7 words/s forced audible speed-up (same skill) | Word budget in the script skill; mux check with ffprobe duration equality |
| **Hallucinated facts and numbers** | LearnWithHasan's run flagged a false line for the user ([guide](https://learnwithhasan.com/guide/how-to-make-faceless-youtube-shorts-with-claude-code/)) | `facts.json` with quote + URL; human sign-off gate |
| **Storage blow-up** | 500 GB filled in week 1 in an RSS→Shorts pipeline ([dev.to](https://dev.to/trollz1004/building-a-youtube-automation-system-with-claude-ai-from-news-to-shorts-in-minutes-d71)) | Gitignore voice/output; prune renders after publish verification |
| **Browser-automation posting bans** | MoneyPrinterV2 uploads via Selenium + logged-in Firefox profile (repo docs) | Only official APIs or audited schedulers |
| **Reach penalty for scheduler posts?** | Vendor blogs report Mosseri saying scheduling doesn't hurt reach **(unverified)**; Instagram ranks reposted/non-original content down **(unverified; PetaPixel 2026, Engadget 2024)** | Original content; no watermarks from other apps |
| **Remotion MCP gone** | Shut down 2026-10-26 ([page](https://www.remotion.dev/docs/ai/mcp)) | `/remotion-docs` skill |
| **Agent loops in hooks** | A writer/checker hook loop kept flagging phrases **(unverified, search snippet)** | Add guard conditions / max retries in hooks |

**Humans remain essential for:**
- hook and idea choice (taste);
- fact verification for numeric claims;
- the final watch on a phone;
- community replies and DMs;
- deciding when to graduate Trial Reels;
- monthly strategy review.

---

## 8. Analytics loop: concrete implementation

1. **Daily (cloud scheduled task or cron `claude -p`):**
   - YouTube Analytics API `reports.query` for the channel, filtered to `creatorContentType==SHORTS`, by video: `views`, `engagedViews`, `averageViewPercentage`, `averageViewDuration`, `subscribersGained`. `audienceWatchRatio` × `elapsedVideoTimeRatio` for retention curves ([metrics](https://developers.google.com/youtube/analytics/metrics)).
   - IG `/<media_id>/insights?metric=reach,views,reels_skip_rate,ig_reels_avg_watch_time,shares,saved` ([insights](https://developers.facebook.com/docs/instagram-platform/reference/instagram-media/insights)).
   - TikTok counts via `video.list`, or scheduler analytics (Postiz `analytics:post`, Metricool `get_tiktok_videos`).
   - Upsert into `data/metrics.sqlite` keyed by episode id (from `publish.json`).
   - Google's official Apps Script sample can push channel analytics into a Sheet if you prefer Sheets ([Apps Script sample](https://developers.google.com/youtube/analytics/v1/code_samples/apps-script), unverified page content).
2. **Weekly:** the weekly-review skill compares hooks, first-3-second skip rate, average % viewed, shares/saves per 1k views and topic tags. It writes `reports/YYYY-WW.md` with 3 keep / 3 stop / 3 test, then re-scores `IDEAS.md`.
3. **Trial Reels A/B (Instagram):** post two hook variants as Trial Reels (`trial_params`, MANUAL). Graduate the winner by hand in-app, or use `SS_PERFORMANCE` to auto-graduate.
4. **Guardrail:** the report must cite metric rows (no free-form claims). Ideas go through the novelty and policy check before the human gate.

No public end-to-end "Claude reads Shorts analytics → proposes next ideas" implementation was found beyond vendor blogs ([Metricool + Claude reports](https://metricool.com/how-to-automate-social-media-reports-ai/) **unverified**; [Blotato pipeline](https://www.blotato.com/blog/ai-content-pipeline-claude-code) **unverified**).

---

## 9. Uncertain / needs checking

- **YouTube unverified-project privacy.** The current reference says no private-only restriction; the 2020 revision entry says the opposite, and no new revision entry announces the lift. Test with one upload. Also unclear whether the `youtube.upload` scope triggers Google's "unverified app" screen when you publish your OAuth app for personal use (unverified).
- **Instagram 100 vs 50 posts/24 h.** Both appear on the same official page.
- **Whether Postiz / Upload-Post / Metricool expose IG `trial_params`** (Trial Reels) in their APIs/MCPs. Not documented in the pages I read. Metricool's MCP page doesn't say whether it can publish video/Reels.
- **ElevenLabs credits vs characters.** The pricing page FAQ lists Creator = 121k credits, while the API page shows "275k characters of TTS (v4)" for Creator. Unit conversion is unclear.
- **Claude Pro vs Max sufficiency** for ~60 Remotion builds/month: no data; my estimate. The "Fable", "Mythos" and "Ultra" names are as shown on claude.com/pricing today.
- **Remotion Lambda cost at 1080×1920 @ 60 fps** for 45–70 s motion graphics: extrapolated, not measured. Measure with `npx remotion lambda render` on one episode.
- **Epidemic Sound current price and multi-channel coverage:** aggregator data only.
- **Scheduler reach parity** (API/scheduler vs native upload) on IG/TikTok/YT Shorts: only vendor claims.
- **"130,000 AI channels terminated"** and the Jan 2026 "16 channels" figures: secondary sources.
- **Community sentiment from Reddit and YouTube tutorials** was not collected (blocked from this sandbox); re-run from a normal browser if needed.
- **License fields** for remotion-dev/skills and template repos were not detectable via shields.io.

---

## 10. Sources

VERIFIED = I opened/read it (WebFetch, curl, or git clone of the repo README/files). UNVERIFIED = seen only in search results.

**Platform docs**
- https://developers.google.com/youtube/v3/docs/videos/insert — VERIFIED
- https://developers.google.com/youtube/v3/docs/videos — VERIFIED
- https://developers.google.com/youtube/v3/getting-started — VERIFIED
- https://developers.google.com/youtube/v3/revision_history — VERIFIED
- https://developers.google.com/youtube/v3/guides/quota_and_compliance_audits — VERIFIED
- https://developers.google.com/youtube/analytics/dimensions — VERIFIED
- https://developers.google.com/youtube/analytics/metrics — VERIFIED
- https://developers.google.com/identity/protocols/oauth2 — VERIFIED
- https://support.google.com/youtube/answer/1311392?hl=en — VERIFIED
- https://developers.facebook.com/docs/instagram-platform/content-publishing/ — VERIFIED
- https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/media — VERIFIED
- https://developers.facebook.com/docs/instagram-platform/reference/instagram-media/insights — VERIFIED
- https://developers.facebook.com/docs/graph-api/overview/access-levels/ — VERIFIED
- https://developers.tiktok.com/doc/content-sharing-guidelines — VERIFIED
- https://developers.tiktok.com/doc/content-posting-api-get-started — VERIFIED
- https://developers.tiktok.com/doc/content-posting-api-reference-direct-post — VERIFIED
- https://developers.tiktok.com/doc/tiktok-api-v2-video-object — VERIFIED
- https://developers.google.com/youtube/analytics/v1/code_samples/apps-script — UNVERIFIED

**Claude / Anthropic**
- https://code.claude.com/docs/en/headless.md — VERIFIED
- https://code.claude.com/docs/en/github-actions.md — VERIFIED
- https://code.claude.com/docs/en/routines.md — VERIFIED
- https://code.claude.com/docs/en/desktop-scheduled-tasks.md — VERIFIED
- https://code.claude.com/docs/en/hooks-guide.md — VERIFIED (event names)
- https://code.claude.com/docs/en/agent-sdk/overview.md — VERIFIED
- https://code.claude.com/docs/llms.txt — VERIFIED
- https://claude.com/pricing — VERIFIED
- https://docs.claude.com/en/docs/about-claude/pricing — VERIFIED

**Remotion**
- https://www.remotion.dev/docs/license — VERIFIED
- https://www.remotion.dev/docs/license/pricing — VERIFIED
- https://www.remotion.dev/docs/license/faq — VERIFIED
- https://raw.githubusercontent.com/remotion-dev/remotion/main/LICENSE.md — VERIFIED
- https://www.remotion.pro/license — VERIFIED
- https://www.remotion.dev/docs/lambda/cost-example — VERIFIED
- https://www.remotion.dev/docs/lambda/limits — VERIFIED
- https://www.remotion.dev/docs/ai/skills — VERIFIED
- https://www.remotion.dev/docs/ai/claude-code — VERIFIED
- https://www.remotion.dev/docs/ai/mcp — VERIFIED
- https://www.remotion.dev/docs/ai — VERIFIED
- https://www.remotion.dev/docs/ai/plugins.md — VERIFIED
- https://www.remotion.dev/docs/fonts.md — VERIFIED
- https://www.remotion.dev/docs/timeout.md — VERIFIED
- https://www.remotion.dev/docs/troubleshooting/sigkill.md — VERIFIED
- https://www.remotion.dev/docs/media-playback-error.md — VERIFIED
- https://www.remotion.dev/docs/captions/api.md — VERIFIED
- https://www.remotion.dev/docs/three.md — VERIFIED

**Schedulers / MCP vendors**
- https://docs.postiz.com/llms.txt — VERIFIED
- https://docs.postiz.com/mcp/introduction.md — VERIFIED
- https://docs.postiz.com/cli/introduction.md — VERIFIED
- https://docs.postiz.com/general/settings/developers.md — VERIFIED
- https://docs.postiz.com/cloud/plans.md — VERIFIED
- https://docs.postiz.com/cloud/limits.md — VERIFIED
- https://docs.postiz.com/self-host/providers/tiktok.md — VERIFIED
- https://docs.postiz.com/self-host/providers/youtube.md — VERIFIED
- https://docs.postiz.com/self-host/providers/instagram.md — VERIFIED
- https://docs.upload-post.com/resources/pricing-and-limits — VERIFIED
- https://zernio.com/pricing — VERIFIED
- https://getlate.dev/ (redirects to zernio.com) — VERIFIED
- https://help.metricool.com/mcp-limits-and-plan-requirements-h72jg — VERIFIED
- https://metricool.com/metricool-mcp-claude/ — VERIFIED
- https://metricool.com/pricing/ — VERIFIED
- https://buffer.com/pricing — VERIFIED
- https://www.ayrshare.com/pricing/ — VERIFIED
- https://fal.ai/docs/documentation/setting-up/mcp.md — VERIFIED
- https://fal.ai/docs/documentation/setting-up/mcp/claude-code.md — VERIFIED
- https://elevenlabs.io/pricing — VERIFIED
- https://elevenlabs.io/pricing/api — VERIFIED
- https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps — VERIFIED
- https://artlist.io/pricing — VERIFIED
- https://metricool.com/how-to-automate-social-media-reports-ai/ — UNVERIFIED
- https://www.blotato.com/blog/ai-content-pipeline-claude-code — UNVERIFIED
- https://www.developersdigest.tech/mcp-servers/replicate — UNVERIFIED
- https://github.com/ahernan2/buffer-mcp — UNVERIFIED (stars only)
- https://github.com/htekdev/late-social-mcp — UNVERIFIED (stars only)
- https://github.com/antoniolg/postiz-mcp — UNVERIFIED (stars only)
- https://www.epidemicsound.com/pricing/ — opened, prices not rendered (UNVERIFIED)
- https://lesfm.net/blog/epidemic-sound-pricing — UNVERIFIED
- https://www.creatorstackclub.com/software/epidemic-sound — UNVERIFIED
- https://www.epidemicsound.com/our-plans/personal-subscription/ — UNVERIFIED

**GitHub repos** (VERIFIED: README/files read via git clone; stars via ungh.cc)
- https://github.com/hassancs91/claude-faceless-shorts-creator — VERIFIED (CLAUDE.md, make-short SKILL.md)
- https://github.com/remotion-dev/skills — VERIFIED
- https://github.com/remotion-dev/template-tiktok — VERIFIED
- https://github.com/remotion-dev/template-prompt-to-video — VERIFIED (metadata)
- https://github.com/digitalsamba/claude-code-video-toolkit — VERIFIED
- https://github.com/calesthio/OpenMontage — VERIFIED
- https://github.com/gyoridavid/short-video-maker — VERIFIED
- https://github.com/gyoridavid/ai_agents_az — VERIFIED (metadata)
- https://github.com/harry0703/MoneyPrinterTurbo — VERIFIED
- https://github.com/FujiwaraChoki/MoneyPrinterV2 — VERIFIED (docs/YouTube.md, YouTube.py imports)
- https://github.com/FujiwaraChoki/MoneyPrinter — VERIFIED (metadata)
- https://github.com/RayVentura/ShortGPT — VERIFIED (metadata)
- https://github.com/SamurAIGPT/AI-Youtube-Shorts-Generator — VERIFIED (metadata)
- https://github.com/mutonby/openshorts — VERIFIED (metadata)
- https://github.com/gitroomhq/postiz-app — VERIFIED (metadata)
- https://github.com/gitroomhq/postiz-agent — VERIFIED
- https://github.com/elevenlabs/elevenlabs-mcp — VERIFIED
- https://github.com/ZubeidHendricks/youtube-mcp-server — VERIFIED
- https://github.com/anaisbetts/mcp-youtube — VERIFIED
- https://github.com/ayrshare/ayrshare-social-media-api-claude-plugin — VERIFIED
- https://github.com/Upload-Post/upload-post-mcp — VERIFIED
- https://github.com/anthropics/claude-code-action — VERIFIED (metadata)
- https://github.com/anthropics/claude-agent-sdk-python — VERIFIED (metadata)
- https://github.com/anthropics/claude-agent-sdk-typescript — VERIFIED (metadata)
- https://github.com/raveenb/fal-mcp-server — VERIFIED (metadata only)
- https://github.com/deepfates/mcp-replicate — VERIFIED (metadata only)

Metadata only; READMEs not read:
- https://github.com/pauling-ai/youtube-mcp-server — UNVERIFIED
- https://github.com/brentwpeterson/mcp-youtube — UNVERIFIED
- https://github.com/adamanz/youtube-mcp-server — UNVERIFIED
- https://github.com/miller-joe/youtube-mcp — UNVERIFIED
- https://github.com/AI-Shopping-Feeds/youtube-studio-mcp — UNVERIFIED
- https://github.com/AgriciDaniel/claude-youtube — UNVERIFIED
- https://github.com/sergebulaev/youtube-skills — UNVERIFIED
- https://github.com/ravsau/youtuber-skills — UNVERIFIED
- https://github.com/Melvynx/video-agent-skills — UNVERIFIED
- https://github.com/social-media-skills/video-to-shorts-skill — UNVERIFIED
- https://github.com/wilwaldon/Claude-Code-Video-Toolkit — UNVERIFIED
- https://github.com/endlessblink/clean-cut-mcp — UNVERIFIED
- https://github.com/cmcau/claude-shorts-maker — UNVERIFIED

**Write-ups / news**
- https://learnwithhasan.com/guide/how-to-make-faceless-youtube-shorts-with-claude-code/ — VERIFIED
- https://dev.to/ayyazzafar/i-built-a-youtube-shorts-generator-with-ai-heres-how-36dn — VERIFIED
- https://dev.to/trollz1004/building-a-youtube-automation-system-with-claude-ai-from-news-to-shorts-in-minutes-d71 — VERIFIED
- https://dev.to/clawlabs/i-automated-my-content-pipeline-with-claude-code-it-published-the-same-article-five-times-mlc — VERIFIED
- https://futurism.com/artificial-intelligence/youtube-shutting-down-ai-slop-channels — VERIFIED
- https://n8n.io/workflows/19628 — VERIFIED
- https://n8n.io/workflows/6014 — UNVERIFIED
- https://outlierkit.com/resources/youtube-ai-slop-crackdown-2026/ — UNVERIFIED
- https://www.techtimes.com/articles/320629/20260715/youtube-wiped-35m-subscribers-over-ai-slop-now-its-judging-your-taste.htm — UNVERIFIED
- https://www.kontentino.com/q-and-a/does-scheduling-instagram-posts-affect-reach/ — UNVERIFIED
- https://api.planoly.com/blog/does-scheduling-your-posts-affect-your-post-reach — UNVERIFIED
- https://www.beta.agorapulse.com/social-media-lab/instagram-3rd-party-tools/ — UNVERIFIED
- https://petapixel.com/2026/04/30/new-instagram-policies-target-reposted-content/ — UNVERIFIED
- https://www.engadget.com/instagram-ranking-algorithm-original-content-200028046.html — UNVERIFIED
- https://www.nihardaily.com/posts/claude-code-and-remotion-install-the-skill-render-a-video — UNVERIFIED
- https://genaiunplugged.substack.com/p/claude-code-content-system-full-ai-pipeline — UNVERIFIED
- https://www.upload-post.com/youtube-api/ — UNVERIFIED
- https://timetopost.co/blog/how-to-upload-videos-youtube-api/ — UNVERIFIED
- https://income-reality-check.pages.dev/a/how-i-make-24937mo-posting-youtube-shorts-using-claude-ai/ — UNVERIFIED

*Not reachable from this sandbox: reddit.com (403), YouTube transcripts (IP-blocked), `gh api` for these repos (session-blocked; ungh.cc and git clone used instead).*
