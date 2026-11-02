---
name: voice-captions
description: Generate the ElevenLabs voice track for a reel and the word-exact caption timings the Remotion composition consumes (vo.gen.ts). Use when the user wants to "generate the voice / VO", "record narration", "fix caption timing / drift", "captions out of sync", "VO too fast", "re-roll one line", "pick a voice / voice settings", or needs a silent mock voice to render without an API key. Covers tools/gen_voice.py, the beats.json VO contract, recommended ElevenLabs settings for The Signal (calm explainer) and Q-ROSITY (dramatic what-if POV), caption chunking rules, pace checks and mock mode.
---

# voice-captions — the VO + caption-timing pass

The voice is the clock. Everything else (captions, counters, cuts, SFX) is timed to the REAL
spoken word times, never to estimates. One tool does the pass: `tools/gen_voice.py`.

```
beats.json (vo[] text + planned starts)
    │  python3 -I tools/gen_voice.py --beats episodes/<ep>/beats.json --emit-ts <remotion>/vo.gen.ts
    ▼
episodes/<ep>/voice/voice.wav          # the timed voice track (48 kHz stereo, -16 LUFS)
episodes/<ep>/voice/cache/<id>-<hash>.mp3 (+ .words.json)   # per-line cache, keyed by sha1(text+voice+model+settings)
beats.json                             # vo[].start/end/words written back (planned_start preserved)
vo.gen.ts                              # export const VO: {id,text,start,end,words:{w,s,e}[]}[] (seconds)
```

## Step by step

1. **Read the contract.** `beats.json` needs `fps` and `vo[]` with `id`, `text`, `start` (planned
   start, seconds). Optional per line: `tts` (alternate text sent to TTS — phonetic spellings,
   v3 audio tags) while `text` stays the caption. Optional `durationSec`.
2. **Pace-check before spending credits.**
   `python3 -I tools/gen_voice.py --beats <beats> --dry-run`
   prints, per line, the words, the mock duration at 2.7 w/s, and `need` = the wpm the line would
   have to hit to finish before the NEXT planned start. Fix every WARN in the script (cut words
   or move the planned start) — do not fix pace with `--speed`.
3. **Generate.** Needs `ELEVENLABS_API_KEY` in the env or `.env` at the repo root.
   ```
   python3 -I tools/gen_voice.py --beats episodes/<ep>/beats.json \
       --voice <voice_id> --model eleven_multilingual_v2 --stability 0.6 --style 0 --speed 0.97 \
       --emit-ts remotion/src/episodes/<ep>/vo.gen.ts --wpm-check
   ```
   Per line the tool calls `POST /v1/text-to-speech/{voice_id}/with-timestamps` and converts
   the character alignment into word times. Lines are laid on the timeline with
   `start = max(planned_start, previous_end + 0.25 s)`; a pushed line prints `DRIFT +x.xx s`.
4. **Read the DRIFT and WARN lines.** DRIFT > 0.3 s means the script is longer than the planned
   window: either move the planned starts (and the visuals) or shorten the line. The Remotion
   side already reads the REAL starts from `vo.gen.ts`, so a small drift is not a sync bug, it
   is a pacing bug.
5. **Re-roll one line** by editing its text (or `tts`) and re-running: only that line's hash
   changes, only that line is re-billed. `--force` regenerates everything.
6. **Render the composition** (it imports `vo.gen.ts`), then mux or hand `voice.wav` to the
   Remotion `<Audio>`; `--mux renders/<ep>.mp4` writes `<ep>-voiced.mp4` for a quick listen.
7. **Hand off** to `sound-design` (SFX + music) — both read `beats.json` word times.

## Mock mode (no key, offline)

`--mock` fabricates timings at **2.7 words/s** (plus 0.25 s after sentence punctuation, 0.12 s
after commas), distributes words by character length, writes a SILENT `voice.wav` and
`vo.gen.ts` with `VO_MOCK = true`. `--mock-ticks` adds a soft 880 Hz tick at every word start
so a mock render can be sync-checked by ear. `check_audio.py --beats` FAILS a mock voice unless
`--allow-mock` is passed, so a silent track can never ship by accident.

## Recommended ElevenLabs settings

Field names/defaults verified against the API reference (voice_settings: `stability` 0.5,
`similarity_boost` 0.75, `style` 0, `use_speaker_boost` true, `speed` 1.0; documented speed
range 0.7–1.2). Model guidance from elevenlabs.io/docs/models. The exact numbers below are
house starting points, not vendor recommendations — the docs give field semantics, not presets.

### The Signal — calm, precise explainer (numbers-driven)

| Flag | Value | Why |
|---|---|---|
| `--model` | `eleven_multilingual_v2` | Docs: "most stable on long-form generations" and better number normalization than Flash — Signal scripts are full of `$9.99`, `24 percent`, `60 percent`. Flash v2.5 has text normalization off by default (docs), so numbers can be read oddly. |
| `--stability` | 0.55–0.65 | Docs: lower widens the emotional range, higher can sound flatter. An explainer wants consistency across 9 lines generated separately; 0.6 keeps the voice identical line to line. |
| `--similarity` | 0.75 (default) | Default is fine; raise only for a cloned voice that drifts. |
| `--style` | 0 | Docs: values above 0 use more compute / add latency; in practice style exaggeration adds variance you do not want on a calm narrator. |
| `--speed` | 0.95–1.0 | Stay inside the documented 0.7–1.2. A touch under 1.0 lets numbers land; never use speed to cram a long line into a short window (fix the script). |
| speaker boost | on (default) | Default on; adds similarity, small latency cost. |
| voice | a warm, low-energy male/female "documentary" voice | The reference kit used premade "Liam" (`TX3LPaxmHKxFdv7VOQHJ`); audition 3–4 premade voices on the hook line before committing. |

Target delivered pace: **2.4–2.7 words/s (≈145–160 wpm)**. `--wpm-check` warns at >170 wpm per
line and >2.9 w/s total — above that, 3-word caption chunks flash faster than people read.

### Q-ROSITY — dramatic "what if" POV voice

Two viable routes; pick per episode:

- **Route A (default): `eleven_multilingual_v2`, `--stability 0.35–0.45`, `--style 0.25–0.4`,
  `--speed 1.0`.** Lower stability widens the emotional range (docs), style adds exaggeration.
  Word timestamps stay reliable, which Q-ROSITY needs as much as Signal does (the blocky
  character's steps and props sync to words).
- **Route B: `eleven_v3` (expressive model).** Docs describe v3 as "emotionally rich,
  expressive", with audio tags in square brackets (`[whispers]`, `[excited]`, `[sighs]`) and
  pacing by punctuation (ellipses add pauses; v3 does NOT support SSML `<break>` tags). Put
  the tagged version in the line's `tts` field so tags never reach captions. Caveats (mark as
  unverified until you have run it on your account): the reference implementation found that
  v3 rejects the classic `voice_settings` block and `previous_text`/`next_text`, so
  `gen_voice.py` omits them for v3 unless `--v3-settings` is passed; whether
  `/with-timestamps` works for v3 is not stated in the docs — if the endpoint refuses, the tool
  falls back to plain TTS with estimated word times (captions then are approximate). Docs also
  say professional voice clones are "not fully optimized for Eleven v3".

Draft with Route A for exact captions; switch to Route B only for the hero lines if the
timestamps work.

### What the tool sends

```json
POST /v1/text-to-speech/{voice_id}/with-timestamps?output_format=mp3_44100_128
{ "text": "...", "model_id": "eleven_multilingual_v2",
  "voice_settings": { "stability": 0.6, "similarity_boost": 0.75, "style": 0, "use_speaker_boost": true, "speed": 0.97 },
  "previous_text": "<previous line>", "next_text": "<next line>" }
```
`previous_text`/`next_text` give the model the surrounding lines so prosody is continuous
across per-line generations. The response's `alignment.characters` +
`character_start_times_seconds` / `character_end_times_seconds` are collapsed to words on
whitespace. The tool reads `alignment` (input text) and falls back to `normalized_alignment`;
if captions ever come out as spelled-out numbers, the response only carried the normalized one.

## Caption chunking rules (what the Remotion captions should do with vo.gen.ts)

1. **2–4 words per chunk**, split preferentially at punctuation; a chunk never splits a
   number from its unit or sign (`$9.99`, `24 percent`, `11 days` stay together).
2. **Hold ≥ reading time.** A chunk stays on screen from its first word's `s` until the next
   chunk's `s`, but at least `max(0.9 s, 0.07 s × characters)`. If the speech is faster than
   that, merge chunks rather than flashing them. (Broadcast subtitle practice caps reading
   speed around 160–180 wpm; our pace check enforces 170.)
3. **Highlight the current word**: the word whose `s ≤ t < e` gets the accent color/scale;
   the rest of the chunk stays neutral. Between words (gaps) keep the last word highlighted.
4. **Never over full-screen graphics.** A beat that owns the caption zone (a hero number, a
   chart that fills the frame) sets `captions: false` in its beat entry and the captions
   component returns null for that span. The visual IS the caption there.
5. **Safe zone**: caption block centered around y ≈ 1280–1500 of 1920, 40 px side margins,
   nothing in the bottom 340 px (platform UI) or right 160 px (action rail). Max 2 lines.
6. **Enter/exit**: 6–8 frame fade/slide in at 60 fps, no exit animation (the next chunk
   replaces it). Chunks never animate during a word — only on chunk boundaries.
7. **Mock renders** show captions at the mock timings; mark the render as MOCK in the
   review loop and never judge sync on it.

### Consuming vo.gen.ts

```ts
import { VO, VO_FPS, VO_MOCK } from './vo.gen';
const t = frame / fps;                                      // seconds
const line = VO.find(l => t >= l.start && t < l.end + 0.4);  // +0.4 s hold at line end
const word = line?.words.find(w => t >= w.s && t < w.e)
          ?? [...(line?.words ?? [])].reverse().find(w => t >= w.s);   // keep last word lit in gaps
// chunk: slice line.words into groups of <=4 at punctuation; active chunk = the one containing `word`
```
`frame = Math.round(t * VO_FPS)` converts any word time to a frame for counters/cuts
(e.g. a counter that snaps on the word "60" uses `Math.round(words[i].s * 60)`).

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Captions lead/lag the voice by a constant offset | composition starts audio at a Sequence offset, or voice.wav was re-trimmed | VO times are global; mount `<Audio src="voice.wav">` at frame 0 of the root, never inside a Sequence |
| Captions drift later and later | composition uses estimated starts (planned_start) not vo.gen.ts | import `VO` from vo.gen.ts; re-run gen_voice after every script edit |
| Line pushed (DRIFT) | words do not fit the planned window at natural pace | cut words or move the next beat; never `--speed > 1.05` |
| Numbers read wrong ("nine point nine nine") | Flash model or normalization off | use `eleven_multilingual_v2`; write the `tts` field as you want it spoken ("nine ninety-nine") while `text` keeps "$9.99" |
| Voice changes timbre between lines | low stability or missing previous/next context | stability ≥ 0.55, keep `previous_text`/`next_text` on (default), same `--voice` |
| `with-timestamps refused (4xx)` | model/plan does not support timestamps | tool falls back to plain TTS + estimated words; switch model to `eleven_multilingual_v2` |
| First word clipped on platforms | VO starts at 0.0 | plan the hook at 0.15–0.25 s; `check_audio.py --beats` warns under 0.1 s |
