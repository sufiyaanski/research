# SOURCES — 12-tutorial study and motion toolkit

Every URL used for `research/videos/`, `research/SUMMARY.md` and `toolkit/HARNESS.md`. All accessed **2026-11-02**. Type: **transcript**, **frames** (YouTube storyboard previews, thumbnails, or a creator's own output renders), **description** (YouTube metadata/description/chapters), or **write-up** (creator posts, files, vendor/news pages). Result: WORKED, BLOCKED, or NOT OPENED (gated/third-party transcript sites skipped on purpose).

**Access summary.** From this cloud IP, YouTube returned "Sign in to confirm you're not a bot", HTTP 429 or `IpBlocked` for transcripts on 11 of 12 videos; only #12 (OmM2iUVHR60) gave a plain auto-caption transcript. We did not use cookies, alternate player clients, proxies or third-party transcript sites (see DECISIONS.md #3). No video files were downloaded, so no 0.5 s frame extraction was possible from the tutorials themselves.

### Videos 1–4 (accessed 2026-11-02)
| URL | Type | Result |
|---|---|---|
| https://www.youtube.com/watch?v=747ZnEtsRbg (yt-dlp auto-subs / youtube-transcript-api) | transcript | BLOCKED (429 / IpBlocked) |
| yt-dlp `--dump-json` 747ZnEtsRbg | description + metadata | WORKED |
| https://i.ytimg.com/sb/747ZnEtsRbg/storyboard3_L3/M0–M13.jpg | frames (YouTube storyboard previews, URLs from the plain metadata fetch) | WORKED |
| https://i.ytimg.com/vi/747ZnEtsRbg/maxresdefault.jpg | thumbnail | WORKED |
| https://x.com/0xMovez/status/2104216919033192746 | write-up (Movez course on X) | BLOCKED (402) |
| https://movez.substack.com/p/how-to-build-motion-design-studio | write-up (Movez course, source of Lukas's rules) | WORKED |
| https://lukas-margerie.lemonsqueezy.com/?page=3 | write-up (kit listing, $0+) | WORKED |
| https://fish.audio/en/developers/ | write-up (Fish Audio pricing) | WORKED |
| https://www.youtube.com/watch?v=AsvN_feasyY (yt-dlp / youtube-transcript-api) | transcript + metadata | BLOCKED |
| https://www.youtube.com/watch?v=AsvN_feasyY (watch page) | description + chapters | WORKED |
| i.ytimg.com `hqdefault_<ms>.jpg` chapter frames, maxresdefault.jpg (AsvN_feasyY) | frames + thumbnail | WORKED |
| https://higgsfield.ai/s/seedance-2-5-kaye.creatives-uUkcPi | write-up (prompts page) | SHELL ONLY (client-rendered) |
| https://www.youtube.com/watch?v=5HYYXYYCrL4 (yt-dlp subs / youtube-transcript-api) | transcript | BLOCKED |
| yt-dlp `--dump-json` 5HYYXYYCrL4; watch page | description + metadata | WORKED |
| https://i.ytimg.com/sb/5HYYXYYCrL4/storyboard3_L2/M0–M5.jpg; maxresdefault.jpg | frames (160×90) + thumbnail | WORKED |
| https://higgsfield.ai/s/claudemotion-higgsfieldai-HrEFvp | write-up (vendor setup page) | WORKED |
| https://higgsfield.ai/s/claudemotion-higgsfieldai-skVQgf; https://higgsfield.ai/blog/MCP-for-motion-designers | write-up | SHELL / INDEX ONLY |
| https://completeaitraining.com/news/higgsfield-integrates-claude-opus-55-for-editable-motion/ | write-up (news) | WORKED |
| https://hermes-ai.net/news/higgsfield-lets-claude-build-fully-editable-after-effects-projects/ | write-up (news) | WORKED |
| https://www.youtube.com/watch?v=zke3bTtvmLo (yt-dlp / youtube-transcript-api / watch page) | transcript + description | BLOCKED |
| https://www.youtube.com/@JadM.H/videos | channel listing metadata | WORKED |
| https://i.ytimg.com/vi/zke3bTtvmLo/maxresdefault.jpg | thumbnail | WORKED |
| https://jad-ai-consulting.vercel.app/ | write-up (creator site) | WORKED (no method found) |
| oEmbed for all 4 | metadata | WORKED |

### Videos 5–8 (accessed 2026-11-02)
| URL | Type | Result |
|---|---|---|
| https://www.youtube.com/watch?v=hbPvZvpu9KU, …Ge1B-Ok1Pfk, …ZNbgOhxhzXg, …rkfyo1waWYY (yt-dlp auto-subs) | transcript | BLOCKED (bot check), all 4 |
| yt-dlp `--dump-json` for hbPvZvpu9KU, Ge1B-Ok1Pfk, rkfyo1waWYY | description + chapters + metadata | WORKED |
| yt-dlp `--dump-json` for ZNbgOhxhzXg | description | BLOCKED (bot check) |
| youtube-transcript-api for all 4 | transcript | BLOCKED (IpBlocked / RequestBlocked) |
| Caption URLs from yt-dlp metadata | transcript | NOT FETCHED (refused as bot-check circumvention) |
| https://www.youtube.com/oembed?url=…&format=json (all 4) | oEmbed metadata | WORKED |
| https://i.ytimg.com/vi/{hbPvZvpu9KU,Ge1B-Ok1Pfk,ZNbgOhxhzXg,rkfyo1waWYY}/maxresdefault.jpg | thumbnail (frames) | WORKED |
| https://support.claude.com/en/articles/17454997-get-started-with-claude-motion | write-up (Anthropic) | WORKED |
| https://claude.com/resources/articles/dashboards-and-motion | write-up (Anthropic) | WORKED |
| https://claude.com/pricing | write-up (Anthropic) | WORKED |
| https://aiwiki.ai/wiki/claude_motion/raw | write-up (third party) | WORKED |
| https://eesel.ai/blog/claude-motion | write-up (third party) | WORKED |
| https://www.futurepedia.io/resources/ai-style-atlas and /view | write-up (creator resource page) | WORKED (prompt bodies not visible) |
| cdn.futurepedia.io poster stills (8, linked from the atlas page) | frames (creator's preview stills) | WORKED |
| https://clickhubspot.com/jpok | creator resource (email form) | NOT OPENED (gated) |
| https://www.skool.com/ai-automation-society/new-video-claude-just-changed-video-editing-forever | write-up (creator post) | WORKED |
| https://github.com/nateherkai/herk-edit-kit (git clone, commit 10511e5) | write-up (creator repo) | WORKED |
| herk-edit-kit `video-projects/*/final.mp4` | frames (creator's output renders, not the YouTube video) | WORKED |
| https://www.skool.com/wearenocode | creator community | NOT OPENED (gated) |

### Videos 9–12 (accessed 2026-11-02)
| URL | Type | Result |
|---|---|---|
| https://www.youtube.com/watch?v=3sEuuAk-lYc (yt-dlp auto-subs) | transcript | BLOCKED (bot check) |
| https://www.youtube.com/watch?v=9T18XMCTER8 (yt-dlp auto-subs) | transcript | BLOCKED (HTTP 429) |
| https://www.youtube.com/watch?v=as6qAlnM8UE (yt-dlp auto-subs) | transcript | BLOCKED (HTTP 429) |
| https://www.youtube.com/watch?v=OmM2iUVHR60 (yt-dlp auto-subs) | transcript | WORKED (en auto VTT) |
| yt-dlp `--dump-json` for 3sEuuAk-lYc, 9T18XMCTER8, as6qAlnM8UE | description + metadata | WORKED |
| yt-dlp `--dump-json` for OmM2iUVHR60; plain watch page | description | BLOCKED (bot check / redirect to google.com/sorry) |
| youtube-transcript-api for 3sEuuAk-lYc, 9T18XMCTER8, as6qAlnM8UE | transcript | BLOCKED (RequestBlocked / IpBlocked) |
| https://www.youtube.com/oembed?url=…&format=json (all four + 4fMcU6iiDCE) | oEmbed metadata | WORKED |
| https://i.ytimg.com/vi/{3sEuuAk-lYc,9T18XMCTER8,as6qAlnM8UE,OmM2iUVHR60,4fMcU6iiDCE}/maxresdefault.jpg | thumbnail (frames) | WORKED |
| https://www.sellingwithnas.com/how-to-build-free-ai-videos-with-claude-hyperframes | write-up (creator blog) | WORKED |
| https://drive.google.com/drive/folders/17WuOE8Na7GjefTIwuby2HQ0Q5qe6aQVD | write-up (creator Drive folder, from description) | WORKED |
| https://drive.google.com/uc?export=download&id=1TAP-ToNz2aMAi46jY_ofQcASoFLjhv2_ (CLAUDE_1.md) | write-up (creator file) | WORKED |
| https://docs.google.com/document/d/1vhaIJX3peK4BIQNq8lRNzXDxfS7Jy2DOa9ahTi6yvZQ (Prompt Pack, txt export) | write-up (creator file) | WORKED |
| https://x.com/0xMovez/status/2104216919033192746 | write-up linked by #10 | BLOCKED (HTTP 402) |
| https://docs.google.com/document/d/13bFmR5ey9TnuqkENLoaAQnEA1rWCdkxmvWskgDsF_uA | write-up linked by #11 | WORKED, but holds a different workflow ("2-sleeps video") |
| https://youtu.be/4fMcU6iiDCE (Gauri's output video) | oEmbed + thumbnail | WORKED |

### Used directly for HARNESS.md and SUMMARY.md
| URL | Type | Result |
|---|---|---|
| https://movez.substack.com/p/how-to-build-motion-design-studio | write-up (the course Lukas Margerie reads on screen: rules file, director's brief, beat grid, sfx.mjs voices, critique axes, hunt list, /motion-reel skill) | WORKED (read again by the lead agent) |
| https://github.com/nateherkai/herk-edit-kit | write-up (creator repo; MOTION_PHILOSOPHY.md, SFX taste rules) | WORKED (via video 7 research and earlier digest `research/01b-…`) |
| https://github.com/heygen-com/hyperframes | write-up (HyperFrames skills; vertical/motion/data rules) | WORKED (earlier digest `research/01b-…` §4) |
| https://github.com/remotion-dev/skills | write-up (official Remotion agent skills v4.0.540; `@remotion/media` `<Audio>`) | WORKED (installed copy in `setup/.claude/skills/`) |

### Instagram reel asked about later (not part of the 12)
| URL | Type | Result |
|---|---|---|
| https://www.instagram.com/reel/DeKPkX2xyyh/ | description (page alt text: @analyst_dnb, 2026-10-06, 1.4M likes, "a cartoon of golf and text") | WORKED (metadata only; video not viewed) |
| https://www.instagram.com/analyst_dnb/ | profile | BLOCKED (HTTP 429); profile summary from a search snippet only |
