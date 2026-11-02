# Style guide — The Signal (SignalDemo)

Source: HARNESS.md §5 (channel sheet) + §1–2. No reference reel was available in this environment
(no downloads), so the grammar below is the channel sheet made concrete, not measured from a reference.

## Palette (nothing else is coloured)
| role | hex | use |
|---|---|---|
| ground | `#F4EFE6` cream | the page |
| floor / paper edge | `#E6DFD2` | floor band under the person and the bars; tag edge; hole ring |
| tag paper | `#FBF8F1` | price tags (a lighter cream, still a neutral) |
| ink | `#1B1B1B` | headlines, captions, the person's hoodie/hair/outline, bars, the digit box |
| accent red | `#D7263D` | **money only**: prices, `$` amounts, `cent`, `cheaper`, `price`, the −1¢ sticker, the underline |
| shadow | ink at 15–17 % | contact shadows (tag drop shadow, ellipse under the feet, bars) |
| muted | ink at 30 % | unspoken caption words, the dashed "?" guide |

No gradients, no glow, no textures. The person is recoloured (`SIGNAL_PALETTE`): ink hoodie, paper
drawstrings/emblem, warm-grey trousers, cream shoes, one warm skin tone.

## Type
- Display: **Archivo 900** (`@remotion/google-fonts/Archivo`), uppercase headlines 100–112 px, −0.02 em, ≤ 6 words a line, ≤ 2 lines.
- Numbers: Archivo 900, `tabular-nums`, 150 px on the tag and above the bars (the biggest thing on screen in their beat).
- Body / captions: **Manrope 800** 68 px captions; Manrope 600/800 34 px source line; 40 px bar labels.
- Nothing readable < 28 px.

## Layout (1080×1920)
- Headline zone y 236–460 (left-aligned at x 70). Hero object (tag / bars) y 420–1060, right of the person.
- The person stands on the floor line y 1060 at x ≈ 250, 480 px tall (≥ 320 px), every shot, never over the hero number.
- Caption block centred at y 1180 inside x 70–930 (right rail free). Source line under the hero, x 450–1010.

## Shot lengths & pace
- 7 shots in 15 s: 1.8–2.7 s each, every cut on a VO word onset (`beats.json`). A new visual beat ≤ every 2 s.

## Transitions
- Hard cuts on word onsets; continuity is kept by the page (the person, floor and tag stay registered).
- Tag: swings in/out on its string (translate with cubic in/out), flips about its string axis (rotateY, 3 f in + 2 f out, click on the edge-on frame).

## Camera
- Flat, near-orthographic print camera (20° fov, registered so 1 page px = 1 px of the 3D layer). "Camera" moves are 2D: the tag pushes in (0.4 s inOut cubic) for the digit beat.

## Grain / texture
- None. Crisp print: paper colours + soft contact shadows only.

## How text enters / exits (each element its own way — no global fade-up)
- Headlines rise out of a mask line (10 f, out-cubic, 3 f line stagger), exit back down (6 f, in-cubic). Landed text is dead still.
- Prices flip; the −1¢ sticker stamps (scale 1.3 → 1, out-cubic, no overshoot); numbers count on tick cues and pop 1 → 1.12 → 1 over 6 f on the spoken frame.
- The digit box draws as a left-to-right wipe; the source line wipes in from the left.
- Captions cut per 3–5-word chunk (1 f lead); unspoken words at 30 % ink; money words appear on their spoken frame in red with a pop.

## Sound
- Bed: `public/music/signal-bed-120.wav` (120 BPM, 16 s = 8 bars, −13.5 LUFS file), ducked −4 dB under VO word ranges; SFX master −6 dB.
- Cues (from the shot list): click on each flip, pop on number pops, tick per count step, riser → cash-register on "$10", thump on the end card.
