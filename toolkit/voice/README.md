# voice — free local voice-over with word timings

`tts.py` makes `voice.wav` + `words.json` (+ `voice.srt`) from a script. `words.json` is the shape
`node beat-grid/make-beats.mjs --vo words.json` reads, so captions, number pops, mood takes and SFX
all sit on the real voice.

```bash
pip3 install kokoro-onnx soundfile faster-whisper      # free engine + aligner (piper-tts optional)
python3 voice/tts.py --check                           # what's installed
python3 voice/tts.py --text "What if the Moon vanished tonight?" --out out/voice-test
python3 voice/tts.py --lines ../studio/episodes/<id>/script.md --out out/vo/<id>
node beat-grid/make-beats.mjs --vo out/vo/<id>/words.json --out ../studio/episodes/<id>/beats.json
```

## Engines (`--engine auto` = first that works)
| engine | cost | install | notes (measured 2026-11-02, 4 CPU cores, no GPU) |
|---|---|---|---|
| `elevenlabs` | paid | `ELEVENLABS_API_KEY` in env or git-ignored `.env` | only used when a key exists; word times come from the API's `/with-timestamps` (no whisper) |
| **`kokoro`** (default) | free, Apache-2.0 | `pip install kokoro-onnx soundfile` (+ ~350 MB weights auto-downloaded to `voice/models/` on first use) | **RTF 0.29–0.37** (synthesis), natural narration; `am_michael` (US male, default), `af_heart`, `bm_george` (UK)… ~3 words/s at speed 1.0 → use `--speed 0.85–0.9` for long-form |
| `piper` | free, MIT | `pip install piper-tts soundfile` (voices auto-download from Hugging Face `rhasspy/piper-voices`) | **RTF 0.07–0.48** depending on voice; flatter, more "assistant" prosody; good fallback |
| `mock` | free | nothing | silent wav + estimated timings at 2.7 words/s — for layout only, never ship |

Local engines get word timestamps from **faster-whisper** (`base.en`, CPU int8; alignment RTF ≈ 0.2–0.4). The audio is passed as a
float32 numpy array (the installed `av` build breaks whisper's own file decoding). Whisper's words
are mapped back onto **your script's words** (difflib), so captions show "$4.99" / "46%" exactly as
written while the timing comes from the audio. A line where < 80 % of words matched prints a `WARN` —
usually a number or name the voice read oddly: give that line a `tts` spelling.

Why not the `kokoro` (torch) package? It pins `numpy==1.26.4`, which has no wheel for Python 3.13, so
it fails to install here; `kokoro-onnx` runs the same Kokoro-82M v1.0 model on onnxruntime. Where the
torch package installs, `tts.py` uses it as a fallback.

## Input
- `--lines script.md` — one VO line per line; headings `#`, `**meta**` lines, tables, `<!-- comments -->` ignored.
- `--lines vo.json` — `{"vo": [{"id", "text", "tts"?, "pauseBefore"?}]}` (the long-form planner writes this; also the old `setup/tools/gen_voice.py` beats.json contract).
- `--text "..."` — sentences become lines.

## Output (`--out DIR`)
- `voice.wav` — 48 kHz stereo, two-pass loudnorm to −16 LUFS / −1.5 dBTP (the final mix goes to −14).
- `words.json` — `{id, fps, source, aligner, mock, totalSec, pace, vo:[{id, text, start, end, wps, words:[{w,start,end}]}]}`.
- `voice.srt` — closed captions from the same timings (upload to YouTube).
- `cache/` — per-line audio + words keyed by engine/voice/speed/text: editing one line re-voices one line.

Timeline: `--lead 0.3` s before the first line, `--gap 0.2` s between lines (a line's `pauseBefore` overrides), `--tail 0.6` s after.
Quality notes: Kokoro reads "9:00 p.m." as "nine, zero zero p m" — write `"tts": "nine p m"`; it runs fast (~3 w/s) at speed 1.0.
`models/` is git-ignored.
