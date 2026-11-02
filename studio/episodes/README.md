# studio/episodes — one folder per episode

Folder name: `YYYY-MM-DD-<channel>-<slug>` (date = planned post date), e.g. `2026-11-04-signal-medium-popcorn`,
`2026-11-14-longform-moon-vanished`. `/make-short` and `/make-long` create it; `studio/STATUS.md` lists it.

## Short (The Signal / Q-ROSITY / channel-3)
| File | Written by | Gate |
|---|---|---|
| `status.md` | every command (one line per gate: date, gate, result) | — |
| `brief.md` | `/make-short` — story (2–6 lines), references, the director's brief (HARNESS §1.2) | **Gate 1: you approve the story** |
| `facts.md` | `/make-short` — every number: claim · value · URL · quote | checked at Gate 1 |
| `script.md` | VO lines (2.5–2.8 words/s) | Gate 1 |
| `words.json` | `python3 toolkit/voice/tts.py --lines script.md --out …` (free Kokoro voice + whisper timings) | — |
| `beats.json` | `node toolkit/beat-grid/make-beats.mjs --vo words.json --out beats.json` | — |
| `shotlist.yaml` (+ `.json`) | states on the beat grid (HARNESS §1.2 step 6) | **Gate 2: you approve the shot list** |
| code | `toolkit/episodes/<id>/<Comp>.tsx` (Remotion needs code inside `toolkit/`); it imports this folder's JSON; registered in `toolkit/episodes/index.tsx` | — |
| `review_log.md` | critique rounds: links to `toolkit/critique/rounds/<Comp>-round-N.md`, the 3 worst, what changed | ≤ 3 rounds |
| render | `toolkit/out/<Comp>.mp4` (+ platform cuts `<Comp>-tiktok.mp4` …) | **Gate 3: you watch it on your phone** |
| `publish.md` | `/publish-pack` — per-platform title / caption / hashtags / trial-reel hook variants / cover frame | **Gate 4: you post it yourself** |

## Long-form
Same `status.md`, `brief.md`, `facts.md`, `publish.md`, plus the `toolkit/longform` episode layout:
`episode.json`, `script.md`, `chapters/NN-*.json` → generated `vo-lines.json`, `words.json`, `captions.srt`,
`timeline.json`, `shotlist.json`, `chapters.txt`, `description.md`. Render with
`node toolkit/longform/render-chapters.mjs studio/episodes/<id> --name <Comp> --gl swangle` (run from `toolkit/`:
`cd toolkit && node longform/render-chapters.mjs ../studio/episodes/<id> --name <Comp>`).
Example: `toolkit/longform/demo/`.

## Status values (also used in STATUS.md)
`idea → brief ok → shotlist ok → built → critiqued (score) → rendered → pack ready → posted (you) → reviewed (7-day numbers)`
