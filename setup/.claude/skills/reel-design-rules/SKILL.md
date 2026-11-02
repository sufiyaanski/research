---
name: reel-design-rules
description: The numeric design contract for The Signal and Q-ROSITY vertical reels (1080x1920 @ 60 fps) — typography sizes, motion durations and spring presets, counters, charts, transitions, color, safe zones, pacing and sound levels. Load before writing or reviewing any scene, when a review note says "too small / too fast / too busy", or when adding a rule from the review loop ("save to skill").
---

# Reel design rules (numbers, not adjectives)

Every adjective in a brief becomes a number here. When a rule's source is a published
reference it is tagged **[src]**; when it is this kit's own calibration it is tagged **[ours]**.
Sources: Remotion `video-layout.md` (official skill), HyperFrames craft references (HeyGen),
LottieFiles motion-design skill, hassancs91 `brand.md` / `shorts.tsx`, Meta safe-zone guidance
via HopperHQ (Sep 2026). Where sources disagree the kit picks one and says so.

Rules added from reviews go at the bottom under **"Learned from reviews"** with the episode id.

## 1. Canvas and safe zones (1080×1920)

| Zone | Value | Why |
|---|---|---|
| Top | 220 px | status bar + Reels/Following tabs. HyperFrames says 168, Meta 14% ≈ 270 → 220 [ours] |
| Bottom (hard) | 340 px | handle/caption/buttons [src hassancs91] |
| Bottom (comfort) | 670 px | Meta's 35% guideline [src]; hero number stays above it |
| Right rail | 160 px | like/share column [src hassancs91]; Meta says 21% ≈ 230 — keep text left of x≈850 below y1250 [ours] |
| Side margin | 64 px (≈ 5%) | [src hassancs91 "≥ 5% from edges"] |
| Hero band | y 270–1250 | every important word and the hero number [src HyperFrames + Meta synthesis] |
| Captions center | y ≈ 1380 | compromise between hassancs91 (1500) and HyperFrames (1220–1320) [ours] — **verify on a real phone** |

Code: `SAFE` in `remotion/src/lib/kit.tsx`. `--guides` overlays them in stills.

## 2. Typography

| Element | Size | Weight | Notes |
|---|---|---|---|
| Hook headline | 96–128 px | 800 | ≤ 6 words, 1–3 lines, one accent word (`*word*`). line-height 1.05, tracking −2% [src haidrrrry/HyperFrames: 80–140 px, −0.03em, 1.05] |
| Big number (Counter) | 180–260 px | 800–900 | tabular-nums, tracking −3%, currency symbol at 70% size top-aligned [ours] |
| Body / question | 52–72 px | 700 | line-height 1.2, ≤ 10 words [src Remotion video-layout: support ≥ 44 px] |
| Captions | 64–72 px | 800 | 2–4 words per chunk (3 on hook/payoff beats), active word in accent, others white/55% [src hassancs91 + Ajené "2–4 words at a time"] |
| Kicker | 40 px | 700 | uppercase, tracking +18%, pill [ours] |
| Source line | 30 px | 600 | muted; mandatory under any number [src HyperFrames data.md] |
| Absolute floor | 28 px | | nothing readable below this [src HyperFrames] |

- Minimum hold: `holdFrames(text)` = max(words/3 + 0.5 s, 0.5 + 0.3 s × words) [src 180 wpm + HyperFrames motion.md]. Last line ≥ 2 s.
- Too many words → cut words, never shrink type [src HyperFrames].
- A landed title is dead still: no drift after landing [src HyperFrames].

## 3. Motion (60 fps)

| Thing | Frames @60 | Seconds | Source |
|---|---|---|---|
| Entrance (fade + rise 24 px) | 12–18 | 0.2–0.3 | hassancs91 7f@30 → 14f@60 [src]; HyperFrames 0.3–0.6 s for big moves [src] |
| Exit | ~60% of entrance (8–11) | 0.13–0.18 | "exits 40–50% shorter" [src HyperFrames], "65–75%" [src LottieFiles] → 60% [ours] |
| Stagger, lines/list items | 4–6 | 0.07–0.1 | words 60–120 ms, items 40–80 ms [src HyperFrames]; total stagger < 500 ms [src LottieFiles] |
| Scale pop on emphasis | max 1.06 | | [src hassancs91 1.03–1.06] |
| Next element starts | when previous is 30–50% done | | [src HyperFrames] |
| Hold before payoff | 18–45 | 0.3–0.75 | [src HyperFrames rhythm] |

Spring presets (`SPRING` in kit):
- `snappy {damping: 200, stiffness: 180, mass: 0.8}` — no overshoot, ~14 frames to settle. Tags, words, UI. [ours; damping 200 = Remotion's "no bounce"]
- `soft {damping: 24, stiffness: 120, mass: 1}` — ~2% overshoot, panels/charts. [ours]
- `bouncy {damping: 12, stiffness: 170, mass: 0.7}` — Q-ROSITY only; never on opacity or color. [src HyperFrames: bounce position/size only]

Easings (`EASE`): `out` = bezier(0.16,1,0.3,1) entrances; `outCubic` = (0.33,1,0.68,1) counters/bars; `inOut` = (0.83,0,0.17,1) camera/color; `in` = (0.7,0,0.84,0) exits only. Never the same ease on everything [src HyperFrames].

## 4. Counters

- Count duration 48–90 frames (0.8–1.5 s), ease-out cubic, **snap to the exact final value** on the last frame, then a 1.04→1 settle over 10 frames. [src HyperFrames 1.2–1.6 s; ours 0.8–1.5]
- `tabular-nums`, `toLocaleString('en-US')`, currency symbol 70% size, superscript-aligned.
- One number counts at a time. Never a grid of KPIs. The number is the biggest thing on screen. [src HyperFrames data.md]
- The count must land on (or within 3 frames after) the spoken word that names it. [src hassancs91 money-math lesson]

## 5. Charts

- Bars grow from a baseline over 36–54 frames (0.6–0.9 s), ease-out cubic, 4-frame stagger (or **land each bar on its spoken number** — pass a bigger `stagger`). [ours]
- Line charts draw with `evolvePath` (`@remotion/paths`) over 60–90 frames, ease in-out; end dot + ring; one annotation at the point that matters. [src HyperFrames: build in reading order, annotate on the mark, no legends]
- Max 4 bars / 1 highlighted series. Grey the rest (`brand.muted`). Reference line dashed. [src HyperFrames]
- Axis labels 34 px uppercase muted; the hero value 72 px in its bar color.

## 6. Transitions

- Default is a **cut** or an 8–12-frame fade/slide. [ours]
- Whip-pan / zoom-through only on a big beat change (setup→proof, proof→payoff); **max 1 flashy transition per 15 s**. [ours]
- Vector law: Scene A's exit axis/direction = Scene B's entrance axis/direction; never mirror. [src HyperFrames motion-doctrine]
- `@remotion/transitions` `TransitionSeries` with `linearTiming({durationInFrames: 10})` when scenes are in a series; hand-rolled exits otherwise.

## 7. Color

- Per channel: **1 accent, 1 positive, 1 negative, neutral ink/paper/muted**. Accent on one element per frame. [src HyperFrames "one accent, rationed"; haidrrrry 60/30/10]
- Text contrast ≥ 4.5:1 (WCAG AA). The Signal: text 17.9:1, accent 10.6:1, negative 6.0:1 on ink. [ours, computed]
- Solid backgrounds + one local radial glow at 15–25% alpha. **No full-screen linear gradients** (they band under H.264); accent below 5% alpha disappears in compression. [src HyperFrames look.md]
- Banned "generated look": navy void with floating elements, purple/blue gradients, glass cards, glow on everything, particles, three cards in a row, logo in a corner, everything fading up. [src HyperFrames banned list]

## 8. Pacing and structure

- 45–70 s total. Scene 3–8 s. New visual element at least every 1.5–3 s (≤ 180 frames of nothing new). [ours; HyperFrames "new beat every 2–4 s", haidrrrry "every 90 f@30"]
- Beat grammar: HOOK (0–3.5 s, frame 0 composed) → SETUP → TURN → WHY → PROOF → EVERYDAY → PAYOFF/LOOP. [adapted from hassancs91 hook/setup/reveal/twist/loop]
- First number ≤ 2 s. Payoff before the swipe; no outro CTA; last frame ≈ frame 0. [src hassancs91]
- VO ≈ 2.5–2.8 words/s; ≥ 3.2 w/s forces a TTS tempo squeeze (`estimate-vo.mjs` warns). [src hassancs91: 2.7 wps peaked at 1.11× squeeze]
- Captions start 0.1–0.3 s in, never at exactly 0 s. [src HyperFrames captions.md]

## 9. Sound

- Every cue has a visible cause; sync the clip's peak to the landing frame (+1 frame). Whoosh starts 4–6 frames **before** the cut; pop on the counter snap; stamp-hit on a Stamp. [src HyperFrames sound.md; hassancs91]
- Function table: motion = whoosh · tension = riser · emphasis = impact/pop · snap = click. Layer only the 2–3 hero moments (riser→impact). [src hassancs91 brand §7]
- Levels: music bed −18 to −25 dB under the VO (Ajené: "25 dB under my voice"); SFX hits 3–6 dB over the bed; no static/glitch textures under narration. [src]
- Mix target ≈ **−14 LUFS integrated, true-peak ≤ −1 dBTP** (common practice; platforms re-normalize, HyperFrames says −16 to −14). `check-media.mjs` reports it. [src, marked common practice]
- Gain starting points for −20 LUFS-normalized clips under continuous narration: whooshes −3, pops/impacts 0..+3, stamps/snaps 0..+7, risers 0..+2. [src hassancs91 shorts calibration]

## 10. Q-ROSITY deltas (placeholder until the 3D character lands)

- Light stage, bouncy springs allowed on position/scale, captions always on a plate.
- Character slot occupies x 300–780, y 600–1240; text never covers the face.

## Learned from reviews

<!-- Append one line per saved note: "- [signal-001] (R6) …". Keep the newest at the bottom. -->
- [signal-001] (kit) A Stamp must never cover the number it comments on — place it below the tag.
- [signal-001] (kit) `text-wrap: balance` on 2-line headlines splits "WHO CHOSE THE" into 3 lines; wrap naturally and size the type to fit.
- [signal-001] (R7) A scene must have its hero element on screen within 0.3 s of the cut (the wheel was 1.4 s late).
