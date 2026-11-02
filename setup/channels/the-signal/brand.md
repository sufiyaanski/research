# THE SIGNAL — brand contract

> Motion-graphics reels about price psychology: a story told with numbers. 45–70 s,
> 1080×1920 @ 60 fps. Every skill reads this file; `remotion/src/brand.ts` holds the same
> palette as code — change both together.

## 1. Identity and voice

- **Positioning:** a trading terminal that learned typography. Dark, premium, numbers-forward.
  Calm confidence, never hype. The number is the star; everything else is a frame for it.
- **Voice (VO + on-screen):** short declaratives. Second person ("your brain"). One claim per
  sentence. No em-dashes on screen. Say the number the way it is written.
- **Energy:** precise, not loud. Motion is crisp (snappy springs, no bounce). No particles,
  no glass cards, no glow-on-everything.
- **Medium:** price tags, shelf labels, receipts, scales, charts — things that carry numbers
  in real life. Build the look from those objects, not from a "palette".

## 2. Palette (exact hex — mirrors `brand.ts` → `SIGNAL`)

| Role | Hex | Use |
|---|---|---|
| ink (background) | `#0A0C10` | full-bleed stage, solid |
| panel | `#141820` | tags, cards, wheel face |
| line | `#262C36` | hairlines, axes, grid, borders |
| text | `#F2EEE6` | headlines, numbers, captions (warm off-white) |
| muted | `#9AA0AA` | labels, source lines, the "grey" bar |
| **accent — signal amber** | `#FFB020` | THE accent: hero tag, active caption word, kicker, anchor. One element per frame |
| onAccent | `#1A1200` | text on an amber fill |
| positive | `#2EE6A6` | gains, "looks fair", the bar that doubled |
| negative | `#FF4F6E` | losses, "not selling", strikes |
| glow | `#FFB020` @ 15–25% | one radial glow behind the hero, nothing else |

Contrast on ink: text 17.9:1 · muted 7.1:1 · accent 10.6:1 · positive 11.6:1 · negative 6.0:1.
No linear gradients (H.264 banding). Accent never below 15% alpha (it vanishes in compression).

## 3. Typography (2-font system, `@remotion/google-fonts`)

| Role | Font | Weights | Sizes |
|---|---|---|---|
| Display / numbers | **Archivo** | 700 / 800 / 900 | hook 96–128 px, counters 180–260 px, tag price 112 px |
| Body / captions | **Manrope** | 600 / 700 / 800 | body 52–72 px, captions 66 px, kicker 40 px, source 30 px |

Display: uppercase for hooks and kickers, tracking −2% (−3% on big numbers), line-height 1.05,
`tabular-nums` on every number. Body: sentence case, line-height 1.2. Accent word in a
headline via `*word*`.

## 4. Shape and depth

- Tags/cards radius 26 px, 2 px `line` border on panel fills, hero fills in amber with no border.
- Shadows: one soft drop (`0 24px 60px rgba(0,0,0,.45)`) on tags only. No hard offsets, no
  inner glows, no blur on text.
- Faint 120 px grid in `line` at ~55%, masked to the center. Vignette 45% at the corners.

## 5. Motion language

- Entrances: fade + 24 px rise, 14 frames, `EASE.out`. Tags land with `SPRING.snappy`
  (damping 200). Charts with `SPRING.soft`. Nothing bounces.
- Exits ~60% of the entrance, `EASE.in`. Staggers 5 frames.
- Emphasis: amber `HighlightBar` wipe behind a word, or a 1.04 → 1 settle on a counter snap.
- Counters 0.8–1.5 s ease-out cubic; bars 0.6–0.9 s; line draws 1–1.5 s.
- One hero element per beat; the rest of the frame stays still once landed.
- Transitions: cuts. One whip/zoom allowed per 15 s on a big beat change.

## 6. Layout

- Kicker at y 240 (pill), headline at y 330, hero object y 700–1000, chart y 820–1240,
  source line at y 1190–1250, captions centered y 1380.
- Nothing readable in bottom 340 / right 160 / top 220. See `SAFE` in `lib/kit.tsx`.
- Frame 0 = thumbnail: headline + hero tag. Last frame = frame 0 (loop).

## 7. Sound taste

- Felt, not heard. Under the voice always. Silence between cues is part of the mix.
- Palette by function: `whoosh-soft` (cuts, 4–6 f before), `pop-reveal` (tag lands),
  `impact-soft` (counter/bar lands), `stamp-hit` (Stamp), `riser-soft` → `impact-deep-soft`
  (the one hero reveal), `ui-click-soft` (ticks, scale marks), `clock-tick-soft` (wheel spin).
- Levels (clips normalized to −20 LUFS): whooshes −3 dB, pops/impacts 0..+3, stamps 0..+7,
  risers 0..+2. Music bed (if any) −18 to −25 dB under VO, ducked. Mix ≈ −14 LUFS, ≤ −1 dBTP.
- No static/glitch textures under narration. Max 2 layered hero moments per reel.

## 8. Voice (VO)

- One narrator voice for the series (set the TTS voice id in `publish.json → voice` once
  chosen). Pace ≈ 2.6 words/s. Pause 0.3–0.5 s between lines; 0.6 s before the payoff.

## Learned from reviews

<!-- "save to skill" appends here: "- [signal-NNN] rule with a number" -->
- [signal-001] Source lines must fit one line at 30 px (≤ 55 characters); shorten the citation rather than wrap.
- [signal-001] The kicker is centered on the full width (not offset by the right rail) so it aligns with the headline.
