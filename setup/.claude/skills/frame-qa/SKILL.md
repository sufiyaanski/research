---
name: frame-qa
description: Phone-scale still QA before any video render — how to run frames.mjs, which frames to pull, what to look for in each PNG, the 100-point reel rubric (hook, readability, motion, sync, sound, loop, safe zones, brand) and the fail thresholds. Use before every render, after every fix, and when the user asks "score this" or "is this ready".
---

# frame-qa — look before you render

A composition you have only reasoned about is not finished. Stills at phone scale catch
overflow, overlap, unreadable text and off-sync reveals that the code never shows.

## 1. Run

```bash
# every beat boundary (+12 f so entrances have landed), every beat midpoint, frame 0, last
npm run frames -- SignalAnchoring beats --scale=0.5

# specific moments: frames, seconds, "last"
npm run frames -- SignalAnchoring 0,2s,10s,25s,last --scale=0.5

# safe-zone overlay (never ship with it on)
npm run frames -- SignalAnchoring 0,30s --guides
```
Output: `qa/frames/<Comp>-f<frame>.png` and `qa/frames/<Comp>-sheet.png` (contact sheet).
Behind a proxy with a private CA: `REMOTION_IGNORE_CERT_ERRORS=1`.

Always pull, in addition to `beats`: frame 0, the frame each **number lands** (count end),
the frame each **caption chunk changes** near a hero reveal, and the last frame.

## 2. Read every PNG (do not skim the sheet only)

For each still, in this order:
1. **Frame 0**: hook text + hero number visible, nothing mid-animation, no black, no logo.
2. **Overflow / clipping**: text cut at an edge, a headline wrapped to 3 lines, a number wider than its tag, a label wrapped to 2 lines.
3. **Overlap**: anything covering a number, a stamp over a price, captions over the chart, kicker under a pointer.
4. **Safe zones**: nothing readable in the bottom 340 px / right 160 px / top 220 px; hero in y 270–1250.
5. **Readability at phone scale**: at 0.5 scale a 28 px source line is 14 px — if you can't read it in the PNG, the viewer can't either. Contrast of muted text on the glow.
6. **Sync**: the still at the word's time shows the element that word names (e.g. "45%" bar landed when "45%" is the active caption word).
7. **Emptiness**: a frame with only a kicker = dead air. Hero element must be on screen within 0.3 s of a cut.
8. **Loop**: last frame vs frame 0 — same layout, same hero element, only the progress bar differs.

Fix, re-run frames at the same timestamps, re-read. Iterate at least twice before video.

## 3. The 100-point rubric

Score after the stills pass and once from the draft mp4. Each line is 0–max; write the
total into `episodes/<id>/publish.json → qa.score` and the per-item scores into the review app.

| # | Criterion (max) | 0 | half | full |
|---|---|---|---|---|
| 1 | **Hook** (15) | frame 0 empty/black or hook text appears after 1 s | hook text at f0 but number arrives after 2 s | hook ≤ 6 words + hero number both on f0, a reason to keep watching |
| 2 | **Readability** (15) | any clipped/overlapping text, body < 44 px, caption < 60 px | one line wraps badly or one label under 28 px | every still reads at 0.5 scale; holds ≥ `holdFrames` |
| 3 | **One idea per frame** (10) | > 2 competing focal points, KPI grids | a second element competes briefly | one hero element per beat, accent on one thing |
| 4 | **Motion quality** (10) | linear/snapping, elements drift after landing, bounce on opacity | some uniform eases, exits same speed as entrances | entrances 12–18 f, exits faster, staggers 4–6 f, landed = still |
| 5 | **Sync** (15) | reveals off by > 10 frames from the word; counter lands on the wrong word | within 10 frames | every number lands on (0..+3 f after) its word; captions chunk on phrase boundaries |
| 6 | **Pacing** (10) | > 3 s with nothing new; scene > 8 s; total outside 45–70 s | one dead stretch | change every 1.5–3 s, payoff before the swipe |
| 7 | **Sound** (10) | cues without a visible cause; music over VO; glitch under speech | levels off by > 3 dB | cues on landing frames, bed −18..−25 dB under VO, mix ≈ −14 LUFS / ≤ −1 dBTP |
| 8 | **Loop / ending** (5) | CTA outro ("comment below") or dead tail | ends on payoff but last frame ≠ f0 | last frame ≈ frame 0 or clean end on the payoff |
| 9 | **Safe zones** (5) | text in the bottom 340 / right 160 | one caption chunk grazes a zone | all clear; captions at `SAFE.captionY` |
| 10 | **Brand + facts** (5) | wrong palette/fonts; a number without a source | source present but not on screen | brand.md palette/fonts/motion; every number has a `SourceLine` and `facts.json` entry |

**Thresholds**
- **< 70**: do not render video; fix the stills.
- **70–84**: render a draft (`--scale=0.5`) for the review app; expect notes.
- **≥ 85**: render final at scale 1, run `npm run check`.
- Any single 0 in Hook, Readability, Sync or Safe zones = automatic fail regardless of total.

## 4. After the video exists

```bash
npm run render -- SignalAnchoring --scale=0.5     # draft
npm run check  -- out/SignalAnchoring-draft.mp4 --draft
```
`check-media.mjs` writes `qa/report.json` (fps, size, duration, loudness). A wrong fps/size
is a hard FAIL. Then open `review/index.html`, load the mp4, and score the rubric panel.

## 5. Save QA evidence

Copy ≤ 8 stills (scale 0.5) into `episodes/<id>/qa/frames/` so the review is reproducible.
