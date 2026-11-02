# Reel breakdown — "What if electrons disappeared for 5 seconds?" (@analyst_dnb)

- **Reel:** https://www.instagram.com/reel/DeKPkX2xyyh/ · @analyst_dnb ("The Analyst") · posted 2026-10-06 · 1.4M likes, 9.5K comments (page metadata, 2026-11-02). Instagram's alt text guessed "a cartoon of golf", but it's a science what-if reel set on a park lawn.
- **How it was analysed:** the user supplied the file (576×1024, 30 fps, 80.15 s, AAC 44.1 kHz). We measured it rather than guessed:
  - a frame every 0.5 s with a contact sheet;
  - OCR of all on-screen text every 0.25 s, which gives the exact timings below;
  - Whisper speech-to-text: no voice-over at all;
  - loudness per 2 s, a spectrogram, and colour sampling.
- **Copyright:** the video and its frames are **not** committed. This file holds only our measurements and analysis. Copy the *format*, not the content.

---

## 1. The formula in one paragraph
A **"What if X for N seconds?"** question, held on screen over a calm, ordinary scene. A **HUD countdown clock with milliseconds** creates suspense: it counts down in real time to the event, then **restarts slowed 11×**, so 5 "story seconds" stretch over 56 real seconds. There is **no voice-over**. **One italic sentence at a time** narrates, each one a bigger consequence, with gaps where the picture alone carries the story. The visuals **change their whole rendering style** at each stage of escalation (normal → x-ray wireframe → glowing → white-out → planet from space → point cloud) and **jump in scale** (a person in a park → your hands → the city → Earth → the Moon). A live **stat counter** ("EARTH IS NOW 373,646 MILES WIDE") makes the numbers physical. All of it rides on **code-synthesised sound design**. It **ends on the same question** plus one fact line, so the reel loops and invites comments.

## 2. Exact timeline (from OCR, at 1080×1920 coordinates)

| Time (s) | % of runtime | Picture | HUD (left, y ≈ 47–53%) | Narration (italic, y ≈ 67%) |
|---|---|---|---|---|
| 0.0–4.6 | 0–6% | Lit 3D park, low-poly people on a picnic blanket, skyline; atom icon above the title | `ELECTRONS DISAPPEAR IN` · **0:07.900** counting down in real time · `EVERY ATOM ON EARTH HAS THEM` | Title, 2 lines, y ≈ 26–30%: "What if **electrons** disappeared / for 5 seconds?" (keyword in light blue) |
| 5.0–7.5 | 6–9% | Same scene | Clock → 0:00.133 | "You're in Central Park, New York." |
| **8.0** | 10% | **Switch:** the world becomes a white-edge wireframe on black; the ground turns into star points | `ELECTRONS RETURN IN` · **0:04.991**, now 11.2× slower · `TIME SLOWED DOWN 11×` | — |
| 8.75–11.75 | 11–15% | Wireframe city; a bright light streak | | "Light now passes straight through everything." |
| 12–16.5 | 15–21% | Camera moves; POV hands appear | | (gap: picture only) |
| 16.5–19.75 | 21–25% | POV wireframe hands, stars through them | | "You can see the stars through your hands." |
| 20.75–24.0 | 26–30% | People and city in wireframe | | "Every atom is now pure positive charge." |
| 25.0–27.75 | 31–35% | Wide wireframe park | | "And positive charges repel." |
| 28–31.5 | 35–39% | Ground sparkles (sand) | | (gap) |
| 31.75–35.0 | 40–44% | Glowing sparkles, hands glowing white | | "Each grain of sand becomes a nuclear bomb." |
| 36.75–40.0 | 46–50% | People glow white; flash streaks | | "Each person outshines the Sun." |
| 40.25–43 | 50–54% | **White-out** | Sub-label becomes a **live counter**: `EARTH IS NOW 7,9xx → 430,000 MILES WIDE` (41.75–55.75) | — |
| 43–48 | 54–60% | **Scale jump:** a glowing white planet, dark rim, small dark moon crossing | | "Earth comes apart at nearly light speed." (44.0–47.75) |
| 49.75–53.25 | 62–66% | The planet's surface from orbit, stars | | "More than the Milky Way will ever shine." |
| 56.0–63.75 | 70–80% | The surface glowing, a slow push | `THE MOON IS GONE` · clock → 0:00.011 | — |
| **64.0** | 80% | **Return:** the city and people rebuilt as a **blue point cloud** | `ELECTRONS / BACK` | — |
| 65.5–68.25 | 82–85% | Point-cloud park | `CENTRAL PARK 5 SECONDS LATER` (66–69.5) | "Every electron returns to where it was." |
| 69.0–71.5 | 86–89% | Streaks shooting up, blue sky flash | `SAME ENERGY AS THE FIRST BLAST` | "With nothing to hold them, they explode too." |
| 71.75–73.5 | 90–92% | Blank (dark) | — | — |
| 73.5–80.1 | 92–100% | **End card** on #101010: the same title centred at y ≈ 41–45% | — | Fact line from 74.5 s, y ≈ 52–54%: `ELECTRONS ARE 0.03% OF YOUR MASS / AND EVERY CHEMICAL BOND IN YOUR BODY` |

**Rhythm numbers:**
- **11 narration lines** over 80 s.
- Each line holds **2.5–3.75 s**.
- Gaps between lines run **1–4.75 s**.
- Something visual changes every **3.6 s** on average (21 measured change events).
- There are only **4 hard cuts**: almost everything morphs inside a continuous scene.

## 3. Visual spec (measured; font identities are estimates [U])
- **Title:** a book-weight transitional serif (it looks like Source Serif or Newsreader [U]), about 64–72 px, white with a soft shadow. Only the keyword is coloured, a light sky blue ≈ **#8FC4FF** (sampled #99D6FF on the anti-aliased highlight). Two lines, centred.
- **HUD**, left-aligned at x ≈ 6% (≈ 65 px):
  - label: tiny uppercase tracked sans, ≈ 18–20 px, letter-spacing ≈ 0.15em, at y ≈ 912;
  - timer: light-weight sans with tabular figures, ≈ 44–48 px, `m:ss.mmm`, at y ≈ 949;
  - sub-label: tiny uppercase, ≈ 14–16 px, at y ≈ 1015.

  It stays visible from frame 0 to the end card, so it reads as the reel's spine.
- **Narration:** italic serif, ≈ 38–42 px, white, centred, max ≈ 86% width, at y ≈ 1290 (line 2 ≈ 1347). It fades in and holds dead still.
- **Looks:**
  1. lit low-poly 3D (green lawn, grey skyline, blocky people);
  2. **x-ray**: background #000000, white edge lines, ground of star points;
  3. **glow**: additive white bloom and sparkle points;
  4. **white-out**;
  5. **planet**: #E6E4EB core, blue-grey noise, dark rim, black space;
  6. **point cloud**: blue points on #000002, vertical streaks;
  7. **end card**: #101010, serif title, tracked mono-ish fact line.
- **Characters:** low-poly blocky people, very close to our blocky character. Q-ROSITY can own this look.

## 4. Sound arc (spectrogram + loudness; there is no voice)
| Time | Sound | Loudness (momentary) |
|---|---|---|
| 0–8 | Park ambience: broadband noise plus chirp-like tonal blips | ≈ −17 LUFS |
| 8 | **Power-down**: several pure sine tones gliding down at once | spike −13.8 |
| 9–21 | Sparse sustained sine pads (≈ 1–3 kHz); **twinkling granular** high notes at 15–20 s (the stars in your hands) | ≈ −22 |
| 21–28 | Near-silent tonal bed; a slow sine glide up at 25–29 | −22 to −25 |
| 29–42 | **Noise wall**: broadband swell under the "nuclear bomb / outshines the Sun" lines | −19 → −9 at the white-out |
| 43–58 | Discrete **noise-burst impacts** at ≈ 44, 51, 56 s on the scale jumps | −15 to −12 |
| 59–64 | A big riser into the return | −10 → −8.6 |
| 64–71 | **Glitchy granular** texture during the point-cloud rebuild, then a swell | −14 → −10 |
| 72–80 | Near silence under the end card | ≈ −30 |

- Integrated loudness is **−14.2 LUFS**, but the true peak reaches **+1.4 dBTP**, so it clips. Ours should stay ≤ −1 dBTP.
- The clean sine lines in the spectrogram say "synthesised in code or a synth", not stock SFX [U].

## 5. How it was most likely made
**Code-rendered 3D**, almost certainly WebGL/Three.js-style rendering driven frame by frame (headless Chrome + ffmpeg), the same "code-drawn" route the tutorials show for Opus 5.5 / Claude Code. The account doesn't say which tool, so this is inferred [U]. Evidence:
1. **The clocks are pure functions of time**, with millisecond-accurate values that are consistent across the whole reel (11.2× slow-down measured exactly). A hand-keyed After Effects timer rarely looks this exact; a script does.
2. **Perfectly stable geometry across style switches.** The same park and people re-render as wireframe and then as a point cloud. That is one scene with different render passes (edges, points, bloom), not AI video, which would drift.
3. **Synthetic sound:** pure sine glides and noise swells.
4. **Low-poly procedural assets:** boxy people and extruded-box skyscrapers.
5. **The text is set the same way throughout:** one serif, one HUD sans, consistent positions. That's typical of a templated code build.

**The account** is otherwise a drum & bass music project ("Layer One EP"). The sound design may be the creator's own [U].

## 6. Why it works (what to copy)
1. **Question + clock = suspense from frame 0.** The viewer knows exactly when "the thing" happens (7.9 s), so they stay to see it.
2. **Slowed time** turns 5 seconds into 56: one tiny event, explored in many beats.
3. **Escalation ladder:** you → your hands → people → the city → Earth → the Moon. Every line is a bigger consequence (drama, not a lecture). This is exactly Q-ROSITY's brief.
4. **No voice:** it reads with the sound off and travels across languages; the subtitles *are* the script.
5. **A look change per act** gives a new visual hook every 3–5 s without cutting.
6. **A live stat counter** makes the scale physical ("EARTH IS NOW 373,646 MILES WIDE").
7. **Loop ending:** the same question returns with one surprising fact, which drives rewatches and comments.

## 7. Recreate it with our toolkit
- **Template (being built):** `toolkit/examples/whatif-countdown/`. A config-driven Remotion version of this format (title, HUD phases, slowed clock, narration lines, act looks, end card), using our blocky character, with an original demo episode. Its README holds the scalable timeline (in % of runtime) and the copy-paste prompt.
- **Copy-paste prompt** (Claude Code, in the repo):

```text
Read toolkit/HARNESS.md and toolkit/examples/whatif-countdown/README.md.
New Q-ROSITY episode in the what-if countdown format: "What if <X> for <N> seconds?"
1) Research: write episodes/<id>/facts.md — every consequence line with a source URL; mark anything speculative.
2) Write the config: title (keyword coloured), phase A real-time countdown (~8 s), phase B slowed-time clock
   (slow factor so N story-seconds span ~70% of the runtime), 8–11 narration lines (one sentence each, 2.5–3.75 s holds,
   1–4 s picture-only gaps, each line a bigger consequence: me → my hands → people → city → planet → beyond),
   2–3 live HUD stat counters, act looks (normal → xray/glow → whiteout → space/scale jump → return → end card),
   end card = same question + one surprising fact line.
3) Show me facts.md + the config table and WAIT for "go".
4) Build, run the critique loop (max 3 rounds), render 1080x1920 @30 with --gl=swangle if no GPU, mix ≈ −14 LUFS ≤ −1 dBTP.
Rules: our blocky character (original), no voice-over, sound synthesised in code, no copied content from other creators.
```

- **The from-scratch route** (what the original creator probably did): ask Claude Code (Opus, high effort) for a Three.js scene with `window.seek(t)` rendering, an edge-detection pass and a points pass, a HUD in HTML/CSS overlaid, frame capture with Playwright/Puppeteer → ffmpeg, and `sfx.mjs` synthesis. Our Remotion template gives you the same result with the critique loop and our house rules built in.

## 8. Ideas in this format for our channels (original premises)
- **Q-ROSITY:** "What if gravity switched off for 5 seconds?" · "What if Earth stopped spinning for 1 second?" · "What if every screen went black for 10 seconds?" (already prototyped as QrosityDemo) · "What if the Sun vanished for 8 minutes?" · "What if all ice melted overnight?"
- **The Signal variant:** "What if every price ended in .00 for one day?" Keep the clock and stat-counter mechanics, with a cream/ink/red look and no explosions. The stakes are money: a counter like "SHOPPERS WHO NOTICED: 0.0%".
