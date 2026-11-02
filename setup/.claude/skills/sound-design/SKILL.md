---
name: sound-design
description: The SFX + music pass for a reel. Use when the user wants to "add sound effects / SFX", "sync sounds to the visual hits", "the whoosh is late / early", "add music / a bed", "music too loud or too quiet", "duck the music", "loudness / LUFS / normalize", "mix the final audio", author or audit an sfx-plan.json, or grow the SFX/music library. Covers function-based cue selection, frame-accurate timing rules at 60 fps, density and gain tables, music ducking numbers, loudness targets, and the tools: mix_sfx.py, mix_music.py, gen_sfx.py, check_audio.py.
---

# sound-design — SFX, music, loudness

House sound: **calm, premium, felt-not-heard, always under the voice.** SFX exist to make the
visual hits land; music exists to make silence feel intentional. Neither competes with the
narration. The voice track (`voice-captions`) is finished BEFORE this pass — every cue is timed
to a real frame or a real word.

```
remotion/src/episodes/<id>/beats.json (vo[].words + beats[].sfx hints)  +  Episode.tsx hit frames
        │
        ▼  author episodes/<id>/sfx-plan.json  (cue sheet; seed it with --from-beats)
python3 -I tools/mix_sfx.py --from-beats remotion/src/episodes/<id>/beats.json --print   # hints -> cue sheet
python3 -I tools/mix_sfx.py episodes/<id>/sfx-plan.json --print                          # AUDIT: frames, gains, missing, density
python3 -I tools/mix_sfx.py episodes/<id>/sfx-plan.json --vo episodes/<id>/voice/voice.wav  # -> out/<Comp>-sfx.mp4 (VO + SFX)
python3 -I tools/mix_music.py --video out/<Comp>-sfx.mp4 --bed <id> --beats remotion/src/episodes/<id>/beats.json --out out/<Comp>-final.mp4
python3 -I tools/check_audio.py out/<Comp>-final.mp4 --beats remotion/src/episodes/<id>/beats.json   # gate
```

The plan file accepts two shapes — the composition-side one
(`master`, `master_fps`, `music: {bed}`, `events: [{at_s, sfx, gain_db, cue, optional}]`) and the
audio-side one (`video`, `vo`, `fps`, `cues: [{id, at_s | at_f, gain_db, note, optional, align}]`,
see `episodes/signal-001-anchoring/sfx-plan.example.json`). `beats[].sfx` hints are
`"id@seconds"` (global seconds; trailing `?` = optional) and are only a seed: the plan is where
frame-accurate times and gains live. Remotion renders are silent, so `--vo` mixes the voice in.

## 1. Pick cues by FUNCTION, not by vibe

Ask what the moment needs. Four jobs, a few sounds each (library ids in `media/library/sfx/catalog.json`):

| Function | Job on screen | Library ids | Typical gain |
|---|---|---|---|
| **Motion** | carry a cut, a slide, a camera move | `whoosh-soft`, `whoosh-wind`, `page-flip` | −3 to −5 dB |
| **Tension** | "something is coming" before a reveal | `riser-soft`, `swell` | −2 to 0 dB |
| **Emphasis** | "this matters" — the number snaps, the twist lands | `pop-reveal`, `impact-soft`, `coin-drop`, `cash-register-soft`, `chime-reward`, `error-buzz-soft` | −2 to +3 dB |
| **Snap** | small, alive, satisfying | `ui-click-soft`, `tick`, `counter-tick`, `block-step` (Q-ROSITY footsteps) | −6 to 0 dB |

Signal money cues (`coin-drop`, `cash-register-soft`) are emphasis sounds with a theme; use
one per reel, on the payoff, not on every price. Q-ROSITY's `block-step` is foley and may be
denser (a 3–4 step walk is ONE gesture, one cue per step is fine).

## 2. Timing rules — in FRAMES at 60 fps (1 frame = 16.7 ms)

`at_s`/`at_f` in the plan is **where the hit lands**. `mix_sfx.py` starts the file `peak_s`
earlier (catalog field) so the perceptual hit, not the file start, sits on your frame. Rules:

| Cue | Rule | Frames @60 |
|---|---|---|
| Whoosh on a cut | file STARTS 6–8 frames before the cut, PEAKS on the cut | `at_f = cut_frame`; `whoosh-soft` peak_s 0.12 s = 7 f, so the file starts at `cut_frame − 7` automatically |
| Pop on a counter snap | lands on the frame the digits stop changing, not when they start | `at_f = snap_frame` (read it from the composition: the frame `interpolate` reaches its end value) |
| Riser into a reveal | riser ENDS on the reveal frame | `at_f = reveal_frame`; `riser-soft` peak_s 1.3 s = 78 f before |
| Impact on a reveal | same frame as the reveal, layered with the riser | `at_f = reveal_frame`, both cues in the plan |
| Click on a toggle / flip | the frame the state changes (mid-flip), ±1 frame | `at_f = flip_frame` |
| Footstep | the frame the foot touches down (spring settles), not the lift | `at_f = contact_frame` |
| Chime on a payoff | 2–4 frames AFTER the visual lands (so it reads as consequence) | `at_f = land_frame + 3` |
| Word-synced cue | use the word's `s` from beats.json, ±2 frames | `at_s = words[i].s` |

Off by 100 ms (6 frames) reads as sloppy; off by 2 frames reads as tight. Never guess a
frame — read the composition (sequence `from` + local frame) or the word time.

Converting: `frame = round(t × 60)`, `t = frame / 60`. A cue inside a `<Sequence from={F}>`
at local frame `f` is at global `F + f`.

## 3. Density

- **Score hero beats only.** A 45–70 s reel has 5–9 hero moments: the hook composition, each
  reveal step's snap, the twist, the payoff, the loop return. Everything else is `"optional": true`
  (`mix_sfx.py --no-optional` drops them for the audit mix).
- **Max ~1 cue per 2 s** outside deliberate layers; `--print` reports the required-cue density
  and flags cues < 0.5 s apart so you can confirm they are a layer.
- **Layer only the 1–2 biggest moments**: riser→impact on the twist; whoosh→pop on the hook
  return. Two cues at the same `at_s` sum.
- **Counters**: one `pop-reveal` on the snap, NOT a tick per digit. If a tick run is wanted,
  ≤ 6 `counter-tick` cues, evenly spaced, `optional: true`, ending 6 frames before the pop.
- **Nothing under the first word of the hook**: the hook's first 0.5 s belongs to the voice.
- **No static/glitch textures under speech**: they read as noise at any gain. Use silence or
  one clean `error-buzz-soft`.

## 4. Gain table (dB relative to the normalized library clip, −20 LUFS / −1.5 dBFS ceiling)

| Situation | Gain | Note |
|---|---|---|
| Transition whoosh under continuous narration | −3 to −5 | masked by voice; −3 is the proven landing zone for shorts |
| Story pop / impact on a reveal | 0 to +3 | must add ≥ +4 dB RMS at the cue vs voice-only in a 0.3 s window, or it is inaudible |
| Snap / click / tick | −6 to 0 | transients hit the peak ceiling before reaching −20 LUFS and catalog quieter; `mix_sfx.py` adds `(ref_lufs − loudness_lufs)` automatically (`comp` column in `--print`) |
| Riser (hero) | −2 to 0 | energy is at its END; judge it there |
| Chime / reward | −3 to −1 | bright content cuts through; keep modest |
| Footstep (Q-ROSITY) | −8 to −4 | foley is texture; a 4-step walk at −6 reads clearly |
| Anything in a speech GAP | 3–4 dB lower than the same cue under speech | gaps expose everything |

`mix_sfx.py` also tucks the SFX bus under loud speech (sidechain, threshold 0.15, ratio 2.5,
attack 5 ms, release 180 ms — about 3–5 dB on consonants) and runs a safety limiter at 0.95.
`--no-duck` disables that for A/B.

## 5. Music

Pick one bed per channel mood (`media/library/music/catalog.json`: `signal-focus-pad`,
`signal-tension-pulse`, `qrosity-playful-blocks`), **no drums under Signal narration** (kick
and hats fight consonants). Then:

```
python3 -I tools/mix_music.py --video out/<Comp>-sfx.mp4 --bed signal-focus-pad \
    --beats remotion/src/episodes/<id>/beats.json --out out/<Comp>-final.mp4
# --plan episodes/<id>/sfx-plan.json reads music.bed instead of --bed; --music <file> for an ad-hoc bed
```

| Parameter | Default | Meaning |
|---|---|---|
| `--under-db` | **−20** | bed loudness during speech relative to VO (both measured with ebur128). −20 LU is "felt not heard"; −16 is "noticeable"; −24 is "is there music?" |
| `--gap-lift` | +8 dB | how far the bed comes up in gaps/intro/outro |
| `--attack` | 0.25 s | the duck starts 0.25 s BEFORE a speech region, so the first consonant is already clear |
| `--release` | 0.8 s | recovery after a region ends — slow enough not to pump |
| `--merge-gap` | 0.6 s | gaps shorter than this stay ducked (breaths, commas) |
| `--fade-in / --fade-out` | 1.5 s / 2.0 s | music fades in over the hook, out over the last 2 s so the loop frame is quiet |
| `--highpass` | 90 Hz | removes bed low end that muddies the voice |
| `--duck` | auto | `envelope` (from word times — deterministic, default when beats.json has words) or `sidechain` (ffmpeg `sidechaincompress threshold=0.02 ratio=8 attack=20 release=400`, adaptive, approximate) |

`--print` shows the speech regions and the exact filter graph. Prefer envelope mode for
finals: the music is at the same level on every render and the numbers are inspectable.

## 6. Loudness targets (and how sure we are)

`mix_music.py` finishes with ffmpeg **two-pass `loudnorm`**: pass 1 measures
(`print_format=json`), pass 2 applies `measured_I/LRA/TP/thresh + offset` with `linear=true`,
per ffmpeg-filters.html#loudnorm. Targets: **I = −14 LUFS, TP = −1 dBTP, LRA = 11**. The
PCM mix is normalized 0.5 dB under the TP target (`--codec-headroom`) because AAC encoding
overshoots peaks by ~0.1–0.3 dB (measured here: −1.0 → −0.9 dBTP after encode).

Certainty:
- **Certain**: the math (EBU R128 / ITU-R BS.1770 as implemented by ffmpeg `ebur128` and
  `loudnorm`), and that a consistent integrated level across episodes is what makes a
  channel feel produced.
- **Common practice, not a spec**: −14 LUFS integrated / −1 dBTP is the widely quoted
  streaming/social delivery level (it matches Spotify/YouTube's long-stated normalization
  reference). Short-form platforms (TikTok, Reels, Shorts) do not publish a hard LUFS
  requirement and **re-normalize on ingest**, so the target is about consistency and
  headroom, not compliance. If a platform plays our reel quieter than others, raise to −13;
  never push past −12 (true-peak limiting starts squashing the voice).
- **House numbers** (gain table, −20 LU under, attack/release): tuned on the reference kit's
  shorts and this repo's test renders; re-tune by ear per voice.

`check_audio.py` enforces: |I − target| ≤ 1 LU (WARN above 0.5), TP ≤ −1 dBTP, audio/video
duration within 50 ms, head silence ≤ 0.3 s, no mock voice (unless `--allow-mock`), and
writes `out/qa/audio-report.json` for the review loop. `npm run check -- out/<Comp>-final.mp4`
(the Remotion side's delivery check, −16..−13 LUFS window) should pass on the same file.

## 7. Growing the library

- `python3 -I tools/gen_sfx.py --dry-run` lists what `media/library/sfx/palette.json` wants
  that is missing. With `ELEVENLABS_API_KEY`, `gen_sfx.py` generates via
  `POST /v1/sound-generation` (`text`, `duration_seconds` 0.5–30, `prompt_influence` 0–1,
  `model_id eleven_text_to_sound_v2`), normalizes to −20 LUFS / −1.5 dBFS and writes the
  catalog with `source` + `license`.
- Prompt ONE sound per entry ("a single soft rounded pop…"); the ElevenLabs SFX FAQ advises
  against multi-sound sequences. Say what it is NOT ("no music, no reverb tail").
- Own a clip already? `gen_sfx.py --import clip.wav --id x --category y --source "..." --license "..."`.
  No `source`/`license`, no catalog entry: music and SFX provenance is what gets reels claimed.
- Name by function (`whoosh-soft`), never by episode (`intro-swipe`). Update `used_in`.

## 8. Audit gate (hard)

Before `mix_sfx.py` renders, `--print` the cue sheet and read every row: frame numbers match
the composition's hit frames, hero cues are not optional, density ≤ 1 per 2 s, no cue under
the first word, missing clips are known. After the final mix, listen once at phone volume with
the screen off: if you notice the music, it is 3 dB too loud; if you notice a cue, it is late.
