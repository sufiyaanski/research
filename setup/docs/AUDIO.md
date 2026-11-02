# AUDIO.md — voice, captions, SFX, music, loudness

How the audio half of the kit fits the Remotion half. Tools are Python 3.13 **stdlib only**
(`urllib`, `json`, `wave`, `subprocess`) plus `ffmpeg`/`ffprobe` on PATH. Run everything from
`setup/`, with `python3 -I tools/<tool>.py` (`-I` = isolated: no cwd/site imports).

## Architecture

```
script-writing skill ──► remotion/src/episodes/<id>/beats.json        (vo[] text + planned start/end, beats[] + sfx hints)
                                   │
         voice-captions skill      ▼
   tools/gen_voice.py  ──► episodes/<id>/voice/voice.wav             timed VO, 48 kHz stereo, -16 LUFS (two-pass loudnorm)
                       ──► remotion/public/voice/<id>/voice.wav      copy for <Audio src={staticFile(...)}> (optional)
                       ──► beats.json (in place): vo[].start/end/words[{w,start,end}], planned_* kept
                       ──► remotion/src/episodes/<id>/vo.gen.ts      export const VO: VoLine[]  (lib/kit shape)
                                   │
   Remotion: npm run frames / render  ──► out/<Comp>.mp4   (silent unless the composition mounts <Audio>)
                                   │
         sound-design skill        ▼
   tools/mix_sfx.py   <plan> --vo episodes/<id>/voice/voice.wav  ──► out/<Comp>-sfx.mp4   (VO + SFX bus, light duck, limiter)
   tools/mix_music.py --video out/<Comp>-sfx.mp4 --bed <id> --beats beats.json ──► out/<Comp>-final.mp4
                       (bed -20 LU under VO, envelope duck from word times, fades, TWO-PASS loudnorm -14 LUFS / -1 dBTP)
   tools/check_audio.py out/<Comp>-final.mp4 --beats beats.json  ──► out/qa/audio-report.json  (exit 1 on FAIL)
   tools/gen_sfx.py    grows media/library/sfx/ from palette.json (ElevenLabs sound-generation) or --import your clips
```

Two clocks, one truth: every time in the system is **global seconds on the beats.json clock**.
`frame = round(t × fps)`; inside a `<Sequence from={F}>` the local frame is `round(t × fps) − F`.

## Files

| Path | Owner | Purpose |
|---|---|---|
| `remotion/src/episodes/<id>/beats.json` | script → gen_voice | VO contract. `vo[]` lines (`beat`, `text`, `start`, `end`, optional `tts`), `beats[]` with `visual` and `sfx: ["id@seconds", "id@seconds?"]` hints. |
| `remotion/src/episodes/<id>/vo.gen.ts` | gen_voice (or `npm run vo:estimate` as placeholder) | `VO: VoLine[]` with `words: {w,start,end}[]`; captions highlight the current word. Never hand-edit. |
| `episodes/<id>/voice/` | gen_voice | `voice.wav` + `cache/` (gitignored). |
| `episodes/<id>/sfx-plan.json` | sound-design | Cue sheet. Two shapes accepted: `{master, master_fps, events[{at_s, sfx, gain_db, cue, optional}]}` or `{video, vo, fps, cues[{id, at_s|at_f, gain_db, note, optional, align}]}` (see `sfx-plan.example.json`). |
| `media/library/sfx/palette.json` | you / gen_sfx | Generation recipes: 20 generic cues by function (whoosh, pop, impact, click, riser, coin, cash-register, tick, chime, error-buzz, page-flip, swell, counter-tick, block-step, impact-deep, stamp, clock-tick, toggle, whoosh-reverse). |
| `media/library/sfx/catalog.json` | gen_sfx | What exists: `id, file, category, function, tags, duration_s, peak_s, peak_dbfs, loudness_lufs, source, model, license, prompt, used_in`. Clips (`clips/*.mp3`) are not committed. |
| `media/library/music/catalog.json` | you | Beds: `id, file, mood, bpm, key, duration_s, loop_safe, has_drums, channels, source, license`. |
| `out/qa/audio-report.json` | check_audio | Pass/warn/fail per check with measured values. |

## Commands (happy path)

```bash
# 0. pace-check the script (no key, writes nothing)
python3 -I tools/gen_voice.py --beats remotion/src/episodes/<id>/beats.json --dry-run

# 1a. real voice (ELEVENLABS_API_KEY in env or .env)
python3 -I tools/gen_voice.py --beats remotion/src/episodes/<id>/beats.json \
    --voice <voice_id> --model eleven_multilingual_v2 --stability 0.6 --style 0 --speed 0.97 --wpm-check
# 1b. or a mock voice to keep building without a key (silent wav, 2.7 w/s timings, VO_MOCK=true)
python3 -I tools/gen_voice.py --beats remotion/src/episodes/<id>/beats.json --mock --mock-ticks

# 2. render in Remotion (frames QA first — see CLAUDE.md R1), then:
python3 -I tools/mix_sfx.py --from-beats remotion/src/episodes/<id>/beats.json --print   # seed a cue sheet from hints
python3 -I tools/mix_sfx.py episodes/<id>/sfx-plan.json --print                          # AUDIT: frames, gains, missing
python3 -I tools/mix_sfx.py episodes/<id>/sfx-plan.json --vo episodes/<id>/voice/voice.wav --out out/<Comp>-sfx.mp4

# 3. music + loudness
python3 -I tools/mix_music.py --video out/<Comp>-sfx.mp4 --bed signal-focus-pad \
    --beats remotion/src/episodes/<id>/beats.json --out out/<Comp>-final.mp4
#    (--plan episodes/<id>/sfx-plan.json reads music.bed; --music file.mp3 for an ad-hoc bed; --print for the graph)

# 4. gate
python3 -I tools/check_audio.py out/<Comp>-final.mp4 --beats remotion/src/episodes/<id>/beats.json
npm run check -- out/<Comp>-final.mp4        # the Remotion side's delivery check (video + loudness window)

# library
python3 -I tools/gen_sfx.py --dry-run                     # what palette.json wants that is missing
python3 -I tools/gen_sfx.py                               # generate (ElevenLabs), normalize, catalog
python3 -I tools/gen_sfx.py --import x.wav --id paper-rustle --category foley --source "file:..." --license "CC0"
```

## Key numbers

| Thing | Value | Where |
|---|---|---|
| Composition | 1080×1920 @ 60 fps, 45–70 s | CLAUDE.md R0/R7 |
| VO pace | 2.4–2.7 w/s; warn > 170 wpm/line, > 2.9 w/s total | gen_voice `--wpm-check` |
| Line gap | ≥ 0.25 s; hook starts at 0.2–0.3 s | gen_voice `--gap` |
| voice.wav | 48 kHz stereo, −16 LUFS, −1.5 dBTP (two-pass loudnorm) | gen_voice |
| SFX library | clips normalized to −20 LUFS, −1.5 dBFS ceiling; `peak_s` = time to the hit | gen_sfx / catalog |
| Whoosh | starts 6–8 frames before the cut, peaks on it (automatic via `peak_s`) | sound-design §2 |
| Density | hero beats only, ≤ 1 cue / 2 s, layers only on 1–2 hero moments | sound-design §3 |
| SFX duck under VO | sidechain threshold 0.15, ratio 2.5, attack 5 ms, release 180 ms (~3–5 dB) | mix_sfx |
| Music under VO | −20 LU during speech, +8 dB in gaps, duck 0.25 s before speech, 0.8 s release, HPF 90 Hz | mix_music |
| Fades | 1.5 s in, 2.0 s out | mix_music |
| Final loudness | I = −14 LUFS, TP = −1 dBTP (PCM normalized to −1.5 so AAC overshoot stays under −1), LRA 11 | mix_music |
| Gate | \|I − (−14)\| ≤ 1 LU, TP ≤ −1, A/V duration within 50 ms, head silence ≤ 0.3 s, no mock VO | check_audio |

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| **Captions constantly offset** from the voice (same amount everywhere) | `<Audio>` mounted inside a `<Sequence>` with `from > 0`, or voice.wav trimmed/padded after generation | Mount the voice at the root (frame 0) or mux with `mix_sfx.py --vo`; re-run `gen_voice.py` so `voice.wav` and `vo.gen.ts` come from the same run |
| **Captions drift** later and later through the reel | composition uses planned/estimated times (`npm run vo:estimate` placeholder) instead of the real ones | run `gen_voice.py` (writes `words` into beats.json and `vo.gen.ts`); `vo.gen.ts` header says `Mode: REAL` when correct |
| gen_voice prints `DRIFT +x s` | the line does not fit before the next planned start at natural pace | cut words or move the next beat's start (and its visuals); never `--speed > 1.05` |
| **SFX late by ~100 ms** | cue placed at the file start, not the hit, or wrong frame math inside a Sequence | let `peak_s` do the offset (default); compute `at_s = (sequence_from + local_frame) / fps`; check `--print` frame column against the composition |
| **SFX inaudible** under speech | gain too low for a transient (catalog LUFS below −20) or masked by VO | `--print` shows `comp` (auto lift); set story pops 0..+3 dB; cues fully inside continuous speech never measure — move to a gap or cut |
| **Clipping / distortion** in the final | summed peaks before the limiter, or AAC overshoot | mix_sfx and mix_music run `alimiter`; mix_music normalizes PCM to TP −1.5 so AAC lands ≤ −1; lower hero cue gains, never raise the limiter |
| check_audio FAIL `true_peak_dbtp` | encoded with another tool, or `--codec-headroom 0` | re-run mix_music with default headroom; keep `-c:a aac -b:a 192k` |
| check_audio FAIL `integrated_lufs` | skipped mix_music (raw mix measures −25 LUFS) or `--no-loudnorm` | run mix_music; use `--music none`? — no: use `--bed` or `--music` with `--under-db -40` for a "no music" normalized pass |
| **Music too loud / too quiet** | `--under-db` wrong for the voice, or bed has drums fighting consonants | −20 is the default; try −18/−24; choose `has_drums: false` beds for Signal; the `--print` output shows the measured VO and bed LUFS |
| Music "pumps" | sidechain mode on a dynamic voice | use envelope mode (`--beats` with words; default when available), raise `--release` |
| **VO too fast** | script over budget (> 190 words) or planned windows too short | script-writing budgets: 115–190 words; `--dry-run` `need` column must stay ≤ 170 wpm; `--speed 0.95` is the floor of what helps |
| Head silence warning | hook planned at 0.0 but TTS adds pre-roll, or the composition fades from black with silence | plan the hook at 0.2–0.3 s and compose frame 0 fully (R2) |
| A/V duration mismatch > 50 ms | `-shortest` / `apad` mismatch or a different `durationSec` than the render | `mix_sfx` / `mix_music` trim to the video's probed duration; re-run after any composition length change |
| `with-timestamps refused (4xx)` | model/plan does not return alignment (e.g. v3 on some plans) | the tool falls back to plain TTS + estimated words; use `eleven_multilingual_v2` for word-exact captions |
| Numbers spoken oddly ("nine point nine nine") | Flash model (normalization off) or ambiguous text | use `eleven_multilingual_v2`; put the spoken form in `tts` and keep `text` for captions |
| `MISSING (skipped)` in `--print` | clip not generated or not imported | `gen_sfx.py` (key) or `gen_sfx.py --import`; `--strict` makes missing cues fatal for the final |

## Sources and credits

- **Patterns adapted from [hassancs91/claude-faceless-shorts-creator](https://github.com/hassancs91/claude-faceless-shorts-creator) (MIT)**:
  per-line ElevenLabs `/with-timestamps` with text-hash cache, character→word alignment written
  to `vo.gen.ts`, library-first SFX with a generated catalog + palette, function-based cue
  selection (motion/tension/emphasis/snap), the gain-table calibration notes for shorts, and
  the hard-ducked music bed. Re-implemented here for 60 fps, the kit's `lib/kit` caption
  types, two-pass loudness and a QA gate. Nothing from that repo's media library is included.
- ElevenLabs API: [text-to-speech convert-with-timestamps](https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps)
  (request/response fields, `voice_settings` defaults), [models](https://elevenlabs.io/docs/models)
  (multilingual_v2 "most stable on long-form", Flash normalization off, Turbo deprecated),
  [text-to-speech capability](https://elevenlabs.io/docs/capabilities/text-to-speech) and prompting
  controls (speed 0.7–1.2; v3 audio tags, no SSML breaks on v3),
  [sound-generation](https://elevenlabs.io/docs/api-reference/text-to-sound-effects/convert)
  (`duration_seconds` 0.5–30, `prompt_influence` 0–1, `eleven_text_to_sound_v2`).
- ffmpeg: `loudnorm` (two-pass with `print_format=json` → `measured_*`, `linear=true`),
  `ebur128=peak=true`, `sidechaincompress`, `adelay`, `amix`, `alimiter` — option ranges taken
  from `ffmpeg -h filter=<name>` on the installed 6.1.
- Loudness target −14 LUFS / −1 dBTP: common streaming/social practice (matches the
  long-standing YouTube/Spotify normalization reference); short-form platforms re-normalize
  on ingest and publish no hard LUFS spec, so the point is consistency and headroom.

## Unverified / to confirm on your account

- Whether `eleven_v3` returns `alignment` from `/with-timestamps`, and whether it accepts the
  classic `voice_settings` / `previous_text` (the tool omits them for v3 by default;
  `--v3-settings` sends them). Field semantics are documented; the v3 behaviour is from the
  reference implementation, not from the docs.
- Which of `alignment` vs `normalized_alignment` carries the input-text characters for
  texts like `$429` (the tool reads `alignment` first).
- The exact AAC true-peak overshoot (measured 0.1 dB here on a tone mix; 0.5 dB headroom chosen).
- Every number in the gain table and the −20 LU under-VO level is a tuned starting point, to
  be re-tuned by ear per voice and bed.
