# whatif-countdown — the "What if X for N seconds?" countdown reel format

A reusable Remotion template for the viral countdown format: a calm 3D scene and a question, a HUD
clock that counts down in real time, a switch into **slowed time** with a change of look, escalating
acts (x-ray world → your own hands → everything glowing → white-out → scale jump to space), the
return (point cloud), a blank beat and an end card that loops into the question. **No voice-over** —
the story is told by the HUD, one-line italic narration, the looks and code-synthesised sound.

Demo episode: **`WhatIfDemo`** — "What if Earth stopped spinning for 5 seconds?" (45 s, 1080×1920 @
30 fps, `out/WhatIfDemo.mp4`). Facts and sources: `facts.md`. Critique log: `review_log.md`.

**A new episode = a new config.** Nothing in `components/` or `WhatIfReel.tsx` is episode-specific.

| file | what |
|---|---|
| `schema.ts` | zod schema of an episode + the pure timeline maths (timer, phases, sub-labels, validation). Imported by the reel AND the Node CLIs |
| `whatif.config.ts` | the demo episode (everything that varies per episode) |
| `WhatIfReel.tsx` | the format: one `<Stage3D>`, one `<Sequence layout="none">` per 3D act, 2D layer, audio |
| `WhatIfDemo.tsx` | validates the config and mounts the reel (registered in `src/Root.tsx`) |
| `components/Overlays.tsx` | `TitleCard`, `Hud`, `NarrationLine`, `WhiteOut`, `EndCard`, `Icon` |
| `components/Look.tsx` | `Look` / `XRayWorld`: re-renders any mesh subtree as x-ray edges or a point cloud (+ glow) |
| `components/World.tsx` | the park set: ground, path, trees, two-row skyline with ~2k window panes, blanket, 3 seated friends |
| `components/Fx3D.tsx` | `ActCamera`, `Streaks`, `Sparkles`, `Starfield`, `Planet` (procedural texture + dark rim), `Moon`, `Satellite` |
| `components/Hands.tsx` | POV blocky hands (camera-attached) |
| `components/textures.ts` | seeded canvas textures (soft dot sprite, planet albedo) built once at module level |
| `components/type.ts` | fonts + the layout/type spec in px (below) |
| `make-shotlist.mjs` | config → validated `shotlist.json` (one shot per act, cues in frames) for the critique loop |
| `../../sfx/drone-bed.mjs` | config → the through-composed score (`public/music/whatif-<id>.wav`) |

## 1. The formula (timeline as % of runtime)

Measured from the reference (80 s) by OCR at 0.25 s; act boundaries inside phase B marked ≈ are
visual estimates. Seconds for other lengths = % × T. Keep **title ≥ 3 s** and **end card ≥ 4 s**
whatever T is (they're read, not watched).

| segment | look | ref 80 s | % of T | 30 s | 45 s (demo) | 60 s |
|---|---|---|---|---|---|---|
| title over the calm scene | normal | 0–4.6 | 0–6 % | 0–3.0* | 0–3.6 | 0–3.6 |
| **phase A**: real-time countdown | normal | 0–7.9 | 0–10 % | 0–3 | 0–4 | 0–6 |
| switch → **phase B** (slowed ×k) | xray | 8.0 | 10 % | 3 | 4 | 6 |
| the world turns x-ray | xray | 8–≈16 | 10–20 % | 3–6 | 4–10 | 6–12 |
| POV: your hands | hands | ≈16–24 | 20–30 % | 6–9 | 10–16 | 12–18 |
| escalation: glow / streaks / sparkles | glow | ≈24–41 | 30–51 % | 9–15 | 16–24 | 18–31 |
| white-out | whiteout | 41–43 | 51–54 % | 15–16 | 24–25 | 31–32 |
| scale jump: space (planet, moon) | space | 43–63.75 | 54–80 % | 16–24 | 25–34 | 32–48 |
| **phase C**: the return | pointcloud | 64–71.75 | 80–90 % | 24–27 | 34–40.2 | 48–54 |
| blank | blank | 71.75–73.5 | 90–92 % | 27–27.5 | 40.2–41 | 54–55 |
| end card (fact line at +1 s) | endcard | 73.5–80 | 92–100 % | 27.5–30* | 41–45 | 55–60 |

\* at 30 s the minimums win: title 3 s, end card ≥ 3.5 s — shorten space/glow instead.

**Phase B length** = `slowFactor × virtualSeconds` ≈ 0.70 T → `slowFactor ≈ 0.70 T / N`
(N = the "for N seconds"). Reference: 5 s × 11.2 = 55.75 s, labelled "11×". Demo: 5 s × 6 = 30 s.
Use a round factor and label it honestly (the HUD sub-label should say the configured number).

**Rhythm:** a narration line every ~4 s (≈ 10 lines in 45–80 s), each held **2.5–3.75 s**, with
**0.8–4.75 s** of picture-only between lines. The switch, the white-out and the return each land on
an act boundary with a hit cue. `make-shotlist.mjs` warns on any drift from these numbers.

## 2. HUD spec (px at 1080×1920)

| element | font | size | position (centre y) | style |
|---|---|---|---|---|
| label ("EARTH STOPS IN") | Manrope 600 | 28 px | x 70, y ≈ 905 (47 %) | uppercase, tracking 0.2em, 90 % white |
| timer `0:04.000` | Manrope 200 (light) | 84 px | x 66, y ≈ 957 (50 %) | `m:ss.mmm`, tabular-nums, white |
| sub-label | Manrope 600 | 28 px | x 70, y ≈ 1020 (53 %) | uppercase, tracking 0.16em, 78 % white, tabular-nums |

- Left-aligned at x 70 (6.5 %; the reference sits at 6 %, HARNESS keeps readable text ≥ x 70).
- **Timer is a pure function of the frame:** phase A `realSeconds − t`; phase B
  `virtualSeconds − (t − tSwitch) / slowFactor`, clamped to [0, virtualSeconds]; ms rounded once.
- Phase C replaces the timer with `bigText` ("SPINNING") in the same slot; the label becomes the
  small line above it ("EARTH IS").
- Any slot whose text changes (label, timer↔bigText, sub-label) cross-fades over **6 frames,
  `Easing.inOut(cubic)`**; counters update every frame inside a segment without fading.
- Counters (`counter {from, to, prefix, suffix, format}`) interpolate linearly across their window
  with thousands separators — linear in real time = linear in virtual time inside phase B.
- During the white-out the HUD ink flips from white to #121214 (driven by the flash amount).
- Visible from frame 0 until the end card starts (it holds through the blank).

## 3. Narration spec (format variant)

- **Full one-line sentences, not 3–5-word chunks** (HARNESS §1.3 exception for this format; there is no VO
  to chunk against). Max 2 lines (balanced wrap), max width 86 % (929 px).
- Instrument Serif *italic* 52 px / 58 px line, white, text-shadow only (no plate).
- Bottom-anchored: the **last line's centre at y ≈ 1262** (65.7 %); a 2nd line grows upward. The
  reference sits at 1290 (67 %); we moved it 28 px up to keep readable text above y 1280 (HARNESS §1.4).
- Fade **8 frames in (`Easing.out(cubic)`) / 6 frames out (`Easing.in(cubic)`)**; never moves while held.
- Numbers in narration only if sourced in `facts.md`; the HUD carries the stats.

Title (opening + end card): Instrument Serif 84 px / 86 px lines, centred, keyword in `keywordColor`
(light blue #8EC5FF), `\n` in the config breaks the line. Opening: line centres y ≈ 498 / 584 (26–30 %),
a 64 px stroke icon above, landed on frame 0 (it's the thumbnail), fades out at `titleOut`
(8 f, `Easing.in(cubic)`). End card on #121214: title centres ≈ 786 / 873, fact lines Manrope 600
28 px, tracking 0.2em, centres ≈ 1001 / 1037, fading in `factDelay` (1 s) after the title.

## 4. Act / look library

| look | what renders | config knobs |
|---|---|---|
| `normal` | the park lit by day (hemisphere + sun + fill, haze fog), 2D sky gradient behind the canvas | `camera`, `people.mood` |
| `xray` | every mesh → depth-only fill + white fat-line edges (2.2 px); ground → star points | `flow` (ground-fixed world translates, picnic stays with you), `glow` |
| `hands` | x-ray world + camera-attached POV hands; ground stars drawn *through* the hands | `flow`, `camera` (pos = eye) |
| `glow` | x-ray skyline + additive halo pass on every edge + wind `Streaks`; tree canopies rip off and fly downwind; optional window `burst` (pane flash wave + shards) | `glow [from,to]`, `streakDir`, `burst [s0,s1]` |
| `whiteout` | full-frame #F7F9FF: 0.35 s in (`out(cubic)`) → hold → 0.6 s out into the next act | act timing |
| `space` | starfield + `Planet` (seeded fBm texture, emissive, dark fresnel rim, halo); `moon` crossing, or (no moon) low orbit with a satellite | `moon [s0,s1]`, `camera` |
| `pointcloud` | every mesh sampled into blue points (#5B8CFF, area-weighted, seeded) that assemble over 1.5 s; rising streaks | `glow`, `streakDir` |
| `blank` | the end-card grey; HUD holds | — |
| `endcard` | title + fact lines on #121214 | `endCard` |

Mechanism: `<Look>` walks the mesh subtree after commit and adds edge/point children to each mesh
(cached per geometry), so the *same* set and characters render in every look; per-frame values (glow,
assembly) are written from `useCurrentFrame()` — no `useFrame`. Tags: `userData.look = 'ground'`
(points instead of edges), `'seethrough'` (edges, no occluding fill), `'skip'`.

## 5. Sound arc (all code; no samples)

| act | bed (`sfx/drone-bed.mjs`, follows the acts) | cues (`acts[].sfx`, peak on the frame) |
|---|---|---|
| normal | park ambience: leaf/wind noise, FM bird chirps, low city hum | — |
| switch | silence under the cue, then a slow open-fifth sine pad (55/82.5/110/165/220 Hz) + high sines | `power-down` (4 sine partials gliding −2 octaves) + `thump` |
| hands | pad + twinkling granular high sines (pentatonic) | `twinkle` |
| glow | pad + rising sine glide 220→1760 Hz + noise swell | `whoosh` (wind), `twinkle` (glass), `noise-wall` ending on the white-out |
| whiteout | hard cut → high ring + sub rumble decaying | `impact` |
| space | deep pad + air; last space act: a long riser into the return | `whoosh` (moon), `riser` ending on the return |
| pointcloud | glitch granular texture + a big pad swell | `impact` + `glitch` |
| blank / end | silence → a −40 dB pad | `thump` (soft) on the end card |

Mix: bed normalised to −17 LUFS; cues at −6 dB master (catalog peaks at −3 dBFS). Target the final at
−14…−16 LUFS integrated, ≤ −1 dBTP (the reference hit +1.4 dBTP; we don't).

## 6. Make a new episode (edit config only)

```bash
cd toolkit
mkdir -p examples/whatif-countdown/episodes && cp examples/whatif-countdown/whatif.config.ts examples/whatif-countdown/episodes/<id>.config.ts
#   edit it; fix its type import to `from '../schema'`
# register a composition (src/Root.tsx, EXAMPLES block):
#   const { config } = parseWhatIfConfig(raw);  <Composition id="WhatIf<Id>" component={() => <WhatIfReel config={config} />} durationInFrames={Math.round(config.durationSec * 30)} .../>
node examples/whatif-countdown/make-shotlist.mjs --config examples/whatif-countdown/episodes/<id>.config.ts --out examples/whatif-countdown/episodes/<id>.shotlist.json --comp WhatIf<Id>
node sfx/drone-bed.mjs --config examples/whatif-countdown/episodes/<id>.config.ts          # -> public/<audio.bed> (git-ignored)
npx tsc --noEmit
REMOTION_IGNORE_CERT_ERRORS=1 node critique/critique.mjs WhatIf<Id> --shotlist examples/whatif-countdown/episodes/<id>.shotlist.json --fast --gl swangle
node critique/score.mjs critique/rounds/WhatIf<Id>-round-1.md --write
REMOTION_IGNORE_CERT_ERRORS=1 npx remotion render WhatIf<Id> out/WhatIf<Id>.mp4 --gl=swangle --concurrency=4
ffmpeg -i out/WhatIf<Id>.mp4 -af ebur128=peak=true -f null - 2>&1 | tail -12                 # −14…−16 LUFS, ≤ −1 dBTP
```

Config checklist: `title {pre, keyword, post}` (keyword = the subject) · `icon` · `phaseA {label,
realSeconds, subLabel}` · `phaseB {label, virtualSeconds, slowFactor, subLabels[]}` (text or counter)
· `phaseC {label, bigText, subLabels[]}` · `lines[]` · `acts[]` (contiguous, one look each, cameras as
`{pos, look}` pairs, cues) · `endCard.factLines` · `audio.bed`. Frame people/subjects clear of the HUD
(x < 540, y 880–1040) and the narration band (y 1180–1290): use a projection check, not guesses.

## 7. Copy-paste prompt

```text
Read toolkit/HARNESS.md and toolkit/examples/whatif-countdown/README.md and follow them.
New episode of the what-if countdown format: "What if <X> for <N> seconds?" (<T> s, 1080×1920 @ 30).

1. Research: find the 6–12 facts the story needs with WebSearch/WebFetch. Write
   toolkit/examples/whatif-countdown/episodes/<id>/facts.md (claim · where on screen · sourced/derived/
   speculative · URL or arithmetic). No invented numbers in narration; stats go in the HUD.
2. Story: 10 one-line narration sentences that escalate me → my city → the planet → the return →
   a twist, mapped onto the format's acts (README §1, timings scaled to <T> s). Show me the lines,
   the act table and the HUD labels/sub-labels/counters, and wait for "go".
3. Config: episodes/<id>/whatif.config.ts (copy the demo; edit ONLY the config). slowFactor =
   round(0.70·T / N); label it with the same number. Cameras as {pos, look}; keep the subject clear
   of the HUD and narration bands (projection check).
4. Register WhatIf<Id> in toolkit/src/Root.tsx (EXAMPLES block). Run make-shotlist.mjs (no warnings),
   sfx/drone-bed.mjs, npx tsc --noEmit.
5. Critique loop (HARNESS §4): critique.mjs --fast --gl swangle, score every act strictly, fix the 3
   worst, lock ≥ 8, max 3 rounds; log each round in episodes/<id>/review_log.md.
6. Render out/WhatIf<Id>.mp4 (--gl=swangle --concurrency=4); ffprobe; ebur128 −14…−16 LUFS, ≤ −1 dBTP;
   extract 6 frames and look at them; loop check (last frame → frame 0). Report the §4.5 score.
```

## Decisions

- **Config is the single source**: shot list, cues, bed sections and HUD all derive from it, so they
  can't drift. Times in seconds (the format is described in seconds); frames computed once.
- **Hidden-line x-ray** (depth-only fills under fat-line edges) instead of see-through wireframe:
  readable at phone size; see-through is a per-subtree tag.
- **Glow without post-processing**: an additive wide-line halo pass + additive points; bloom passes
  (EffectComposer) are slow and fragile under swangle.
- **Narration 28 px higher than the reference** (HARNESS safe zone). HUD at x 70 (not 65) for the same reason.
- **The picnic's people are small (~250 px tall)**: the format's scene is a wide establishing shot;
  HARNESS's "character ≥ 1/6 frame" rule is waived for this format (the POV hands carry the "you").
