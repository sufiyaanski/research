# The Signal / Q-ROSITY — Claude Code + Remotion reel kit

A ready-made setup so Claude's **first** render of a vertical reel is good: hard rules
(`CLAUDE.md`), a shared component kit, numeric design rules, phone-scale frame QA before every
render, and a review loop that turns your notes into rules.

- **The Signal** — price-psychology motion graphics, "a story told with numbers". 1080×1920 @ 60 fps, 45–70 s.
- **Q-ROSITY** — "what if" curiosity reels with a blocky character. Placeholder 2D composition + a slot for the 3D character.

Demo episode: `SignalAnchoring` (51 s, price anchoring) — stills in `episodes/signal-001-anchoring/qa/frames/`.

## Install

```bash
cd setup
npm install            # Remotion 4.0.540, React 19, Google Fonts, transitions, captions, paths, zod
npm run typecheck      # tsc --noEmit
npm run studio         # optional: Remotion Studio preview at http://localhost:3000
```
Needs Node ≥ 20, `ffmpeg`/`ffprobe` on PATH. Remotion downloads its own headless Chrome on
first render. Behind a corporate proxy with a private CA, prefix commands with
`REMOTION_IGNORE_CERT_ERRORS=1` (Google Fonts are fetched inside Chrome).

## Make a reel in 6 steps

Ask Claude Code: **"/make-signal-reel — new episode about <topic>"**. It will:

1. **Facts first** — write `episodes/<id>/facts.json`: every number with a source URL and confidence. No source, no number.
2. **Script + beats** — `episodes/<id>/script.md` (beat table) and `remotion/src/episodes/<id>/beats.json` (VO lines + beats in global seconds). `npm run vo:estimate -- <id>` writes `vo.gen.ts` with word timings (estimated now; real ones later from your TTS). You approve the script here.
3. **Composition** — `Episode.tsx` built only from `remotion/src/lib/kit.tsx` (PriceTag, Counter, BarChart, LineChart, BigTitle, Captions, Stamp…), one `<Sequence>` per beat, every cue derived from a VO word time with `toLocal()`. Registered in `Root.tsx`.
4. **Frame QA** — `npm run frames -- <Comp> beats --scale=0.5` renders phone-scale stills at every beat boundary and a contact sheet into `qa/frames/`; Claude reads every PNG, fixes, repeats, and scores the 100-point rubric (`/frame-qa`).
5. **Render + check** — `npm run render -- <Comp> --scale=0.5` (draft) or `npm run render -- <Comp>` (final) → `out/<Comp>.mp4`, then `npm run check -- out/<Comp>.mp4` (fps/size/duration/loudness → `qa/report.json`).
6. **Review loop** — open `review/index.html`, load the mp4, press **N** to note problems at the current time, score the rubric, click **Copy notes for Claude**, paste. Claude fixes, re-renders, and on **"save to skill"** appends the generalized rule to `channels/<channel>/brand.md` or `.claude/skills/reel-design-rules/SKILL.md`.

Sound: `episodes/<id>/sfx-plan.json` is the cue sheet (global seconds, clip ids, gains); mux VO/music with ffmpeg and re-run `npm run check` for loudness.

## How the review loop works

```
render draft ─▶ review/index.html ─▶ "[00:07.3] stamp covers the price" ─▶ Claude fixes
      ▲                                                                       │
      └──── re-render ◀── stills at 7.3 s re-read ◀── fix in Episode.tsx ◀────┘
                                   │
            "save to skill" ──────▶ rule appended to brand.md / reel-design-rules
                                   (next episode's first render already obeys it)
```
Notes carry timestamps (`[mm:ss.s] note`) so Claude can convert them to frames and local
sequence frames exactly. Rules carry the episode id as provenance. See `/review-loop`.

## Layout

```
CLAUDE.md                        hard rules R0–R10 (Claude reads this every session)
PRE-RENDER-CHECKLIST.md          tick before every render
CREDITS.md                       MIT credit for hassancs91/claude-faceless-shorts-creator + Remotion skills
.claude/skills/
  make-signal-reel/              the 7-stage recipe
  reel-design-rules/             numbers: type, motion, counters, charts, color, safe zones, sound
  frame-qa/                      how to QA stills + the 100-pt rubric + thresholds
  review-loop/                   notes → fixes → "save to skill"
  remotion-*/                    official Remotion Agent Skills (npx skills add remotion-dev/skills)
channels/the-signal/brand.md     palette, 2 fonts, motion, layout, sound taste, learned rules
channels/q-rosity/brand.md       placeholder brand + TODO for the 3D character slot
remotion/
  src/Root.tsx                   registers compositions (1080×1920 @ 60 fps)
  src/brand.ts                   palettes as code (mirror of brand.md)
  src/fonts.ts                   @remotion/google-fonts (Archivo + Manrope; Rubik + Nunito)
  src/lib/kit.tsx                shared components, SAFE zones, SPRING/EASE presets, Captions
  src/lib/timing.ts              beatsToFrames, toLocal, holdFrames, sec, prog
  src/episodes/signal-001-anchoring/   Episode.tsx · beats.json · vo.gen.ts (demo)
  src/episodes/qrosity-000-placeholder/Episode.tsx
  scripts/frames.mjs             QA stills + contact sheet
  scripts/render.mjs             mp4 render (h264, --scale for drafts)
  scripts/check-media.mjs        ffprobe/ebur128 delivery check → qa/report.json
  scripts/estimate-vo.mjs        beats.json → vo.gen.ts
episodes/signal-001-anchoring/   script.md · facts.json · sfx-plan.json · publish.json · qa/frames/
review/index.html                local review app (file://, no build)
```

## Commands

| Command | What |
|---|---|
| `npm run frames -- <Comp> beats --scale=0.5` | stills at every beat boundary + midpoint (also `0,2s,10s,last`, `--guides`) |
| `npm run render -- <Comp> [--scale=0.5] [--crf=18] [--concurrency=N]` | mp4 to `out/` |
| `npm run check -- out/<Comp>.mp4 [--draft]` | delivery check, `qa/report.json` |
| `npm run vo:estimate -- <episode-id>` | regenerate `vo.gen.ts` from `beats.json` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run studio` | Remotion Studio |

## Adding real voice

Generate the VO per line with a TTS that returns word timestamps (ElevenLabs
`/with-timestamps`, or WhisperX on any recording), write `words: [{w, start, end}]` on each
`vo[]` line in `beats.json` (global seconds), run `npm run vo:estimate -- <id>` — captions
retime, nothing else changes. Mux: `ffmpeg -i out/<Comp>.mp4 -i voice.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k out/<Comp>-voiced.mp4`.

## Updating the Remotion skills

`npx skills add remotion-dev/skills --yes` (re-run from `setup/`; it installs into
`.agents/skills` with symlinks under `.claude/skills` — copy the folders if you prefer plain
directories, as this repo does). Upgrade Remotion itself with `npx remotion upgrade`.
