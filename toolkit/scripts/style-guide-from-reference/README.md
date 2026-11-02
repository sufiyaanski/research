# style-guide-from-reference

Reference video → timestamped contact sheet + **measured** palette, shot lengths, change rhythm and
loudness → `style-guide.md` template that Claude fills by reading the sheet. Only needs ffmpeg/ffprobe.

```bash
node scripts/style-guide-from-reference/index.mjs <reference.mp4> [--out dir] [--every 0.5] [--scene 0.3] \
     [--width 360] [--sheet-width 120] [--cols 10] [--colors 8]
```

Writes to `--out` (default `out/style-guide/<name>/`):

- `frames/f_0001.png…` — `fps=1/every`, 360 px wide (don't commit)
- `contact-sheet.jpg` — tiles with timestamps (`drawtext`; plain tiles if fonts are missing)
- `measurements.json` — raw numbers
- `style-guide.md` — Palette (measured dominant colours with coverage, accent candidates, mean luma),
  Type, Shot lengths (measured: `select='gt(scene,T)'` cuts with automatic fallback 0.3 → 0.2 → 0.1, plus
  **visual change events** from frame differences, which catch builds and crossfades the scene detector
  misses), Transitions, Camera, Grain/texture, How text enters/exits, Sound notes (measured LUFS / LRA /
  true peak), Rules to copy, Banned in our version.

Palette method: every sampled frame scaled to 64 px → RGB histogram (4 bits/channel) → bins merged
within RGB distance 30 → top N by pixel share. Zero npm deps.

Example (`example/`): run on `../setup/out/SignalAnchoring-draft.mp4` (51 s, dark ground, amber accent):

```bash
node scripts/style-guide-from-reference/index.mjs ../setup/out/SignalAnchoring-draft.mp4 --out scripts/style-guide-from-reference/example
```

That reference has no hard cuts (it builds in place), so the scene detector finds 1 shot. The
change-event measure finds 10 section changes, mean interval 4.6 s. Run on `out/ToolkitSmoke.mp4`, it
recovers the brand palette: `#F3EEE5` (cream) 93 %, `#D4233B` (red) 1.6 %, `#141414` (ink) 1.5 %.
