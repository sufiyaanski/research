# HARNESS.md — motion-studio rules (load this first in every reel chat)

> "The harness does most of the work; the prompt only picks the story." Every reel chat starts with:
> **"Read toolkit/HARNESS.md and follow it. Today's reel: <channel>, <story in 2 lines>."**
>
> Four parts: **1 Render Contract** (what a valid render is) · **2 Look Bans** (what we never ship) ·
> **3 Sound** (made in code, on the same timeline) · **4 Feedback Loop** (how a draft becomes 80+).
> Then the two channel sheets. Numbers are rules, not suggestions. Where this file conflicts with
> `setup/CLAUDE.md` (older 60 fps kit), this file wins.

---

## 1. Render Contract

### 1.1 Format
- Remotion, **1080×1920, 30 fps**, H.264 CRF 18, yuv420p, AAC 192k. 45–60 s for The Signal, 30–60 s for Q-ROSITY.
- All timing from `fps` (`useVideoConfig()`): write `1.5 * fps`, never `45`.
- Frame-driven only: `useCurrentFrame()` + `interpolate()` with `extrapolateLeft/Right: 'clamp'`. No `useState`/`useEffect`/timers/CSS animations/`Math.random()` at render (seeded random only). 3D: never `useFrame()`; `<Sequence layout="none">` inside `<ThreeCanvas>`.
- **Easing: `Easing.out(Easing.cubic)` for arrivals, `Easing.inOut(Easing.cubic)` for moves/camera, `Easing.in(Easing.cubic)` for exits. No springs with overshoot, no wobble, no bounce unless the brief asks.**
- Frames inside a `<Sequence>` are LOCAL. Global → local = `global − sequence.from`. Check every cue twice.
- Fonts via `@remotion/google-fonts` only; assets via `staticFile()`; no network at render.

### 1.2 Build order (never skip a step)
1. **Story** (2–6 lines) → 2. **References** (1–3 reels we admire; run `scripts/style-guide-from-reference` on each) → 3. **style-guide.md** filled (palette, type, shot lengths, transitions, camera, grain, how text enters/exits) → 4. **Voice-over first**, with word timings → 5. **beats.json** from the VO (`beat-grid/make-beats.mjs --vo`) or from a BPM grid when there's no VO → 6. **Shot list as states on the beat grid** (`beat-grid/shotlist.schema.json`: each shot = start/end frame on a beat, one on-screen action, the state at its end, caption chunk, SFX cues) → 7. **Build** the composition from the shot list → 8. **Sound** (§3) → 9. **Critique loop** (§4) → 10. Final render.
- Show the user steps 1, 3 and 6 and wait for "go" before step 7. That is where changes are cheap.
- Take a reference's **grammar** (pace, type behaviour, transitions, camera), never its content, logos or characters.
- **Director's brief** (fill before step 6; adapted from the Movez course that Lukas Margerie teaches from, see `research/videos/01-lukas-margerie.md`):
  ```text
  CREW: you are the director, writer, animator, composer, sound designer and render engineer.
        Treat this as a multi-session production; don't rush to a final render.
  FILM IN ONE LINE: <logline> — what the viewer should feel at the end.
  REFERENCES: refs/<name>/style-guide.md (+ contact sheet). Grammar only.
  LOOK: 3–5 lines (palette from the channel sheet, faces, texture, camera language) + the §2 bans.
  CHARACTER BIBLE: blocky person — proportions, outfit colours, moods used in this reel.
  BEAT SHEET: timestamped beats; hook in the first 2 s; a visual payoff every 3–5 s; last frame sets up the first.
  TEXT ON SCREEN: which words go big (headline/number), which stay as captions; leave room for both.
  GATES: plan → shot list → stills → draft → critique ×≤3 → audio → final. Don't skip gates.
  DELIVERABLES: out/<Comp>.mp4, poster frame (frame 0 PNG), critique contact sheet + round file, loop/seam check.
  ```

### 1.3 Timing (the voice is the clock)
- Captions: **3–5-word chunks, max 2 lines, lower-middle of the frame** (block centred at **y ≈ 1180**, inside y 1080–1280), lead the voice by **0–2 frames**, each on screen **≥ 0.6 s** (18 frames).
- **Money/key word pop**: scale 1.0 → 1.12 → 1.0 over **6 frames**, peaking on the frame the word is spoken (`usePop`). Money words in accent red on The Signal.
- **Pauses in the VO ≤ 0.25 s**, except **one pause ≤ 0.5 s right before the reveal**.
- **A new visual beat at least every 3 s** (90 frames). **No empty shot longer than 1.5 s** (45 frames): an "empty" shot is one where nothing new lands and nothing meaningful moves.
- Frame 0 is the thumbnail: fully composed, hook text + character + the hero object on screen. Never black, never a logo card.
- Every number lands on the frame its word is spoken (0..+2 f). One number per beat, the biggest thing on screen, `tabular-nums`, count-ups 1.2–1.6 s then hold.
- Holds: a line the viewer must read stays ≥ 0.5 s + 0.3 s per word. Landed text is dead still.
- Entrances 8–12 frames (0.27–0.4 s); exits 40–60% of their entrance; staggers 2–3 frames per word, 2 frames per list item, total stagger ≤ 15 frames.
- **Borrowed clips (stock/footage) ≤ 5 s each**, credited in the episode's `sources`.

### 1.4 Layout (1080×1920)
- Readable text only inside **x 70–1010, y 220–1280**. Nothing readable in the bottom 640 px except the caption block's top edge (platform UI), nothing under the right action rail (x > 930 below y 1100).
- **The blocky character is in every Signal beat and ≥ 1/6 of the frame height (≥ 320 px tall on screen)**; in Q-ROSITY he is the POV anchor of every shot (on screen, or his hands/view when POV).
- Headlines 84–120 px, ≤ 6 words a line, ≤ 2 lines. Body ≥ 44 px. Nothing readable < 28 px. Too many words → cut words, never shrink type.
- One hero per shot (≥ 40% of frame height or width). One accent use per shot.

### 1.5 Commands
```bash
cd toolkit
node scripts/style-guide-from-reference/index.mjs ref.mp4 --out refs/<name>
node beat-grid/make-beats.mjs --vo episodes/<id>/words.json --fps 30 --out episodes/<id>/beats.json
node beat-grid/make-beats.mjs --bpm 120 --duration 15 --fps 30 --out beats.json
node sfx/synth.mjs && node sfx/music-bed.mjs --bpm 120 --duration 60
node critique/critique.mjs <Comp> --shotlist <file> --round 1 [--fast] [--gl swangle]
node critique/score.mjs critique/rounds/<Comp>-round-1.md
npx remotion render <Comp> out/<Comp>.mp4 [--gl=swangle]
```
No GPU (cloud): add `--gl=swangle` for anything with the 3D character. Behind a proxy with a private CA: `REMOTION_IGNORE_CERT_ERRORS=1`.

---

## 2. Look Bans (never ship these; name them in every brief)
- **Generic entrances:** everything fading in; every element fade-and-slide-up; all elements entering the same way; titles that keep drifting/breathing after they land; pulsing loops standing in for motion.
- **Template layouts:** everything centred; a title over a dimmed screenshot; three cards in a row; KPI grids/dashboards; pie charts; numbered "01 / 02" chips as decoration; corner brackets, HUD readouts, frame borders as decoration; the logo docked in a corner.
- **Default looks:** dark-navy void with small elements floating in it; glow, bloom, lens flares, floating particles as decoration; purple/blue gradients, mesh gradients, glass cards; default fonts as the display face (Inter, Roboto, Arial, Space Grotesk, Geist, Montserrat) — use the channel faces below; default colours (pure #000/#FFF grounds, Tailwind blue).
- **Motion tells:** linear easing on movement; bounce/elastic/wobble; uniform `power2.out`-style 0.5 s on everything; text moving while it is read; a slow creeping zoom on a title; click rings.
- **Content tells:** numbers with no source line; every number counting at once; captions repeating what the picture already says word for word; "comment below / follow for part 2" outros; hype words ("unlock", "game-changer", "seamless", "insane").
- **Character tells:** both arms moving in unison; mood that snaps from one face to another (always a take: anticipation → squash → new face → settle); feet not touching the ground; text over the face.
- After every critique round, add any new default you spotted to this list.

---

## 3. Sound (made in code, on the same timeline)
- **Order:** VO first (it is the clock) → `beats.json` → music bed at the reel's BPM (`sfx/music-bed.mjs`) → SFX cues from the shot list (`<SfxTrack shotList>`). Everything is placed in frames on the same timeline as the picture.
- **Every cue has a visible cause** and its **peak lands on the visual hit** (`<SfxCue>` offsets the clip by its measured `peakSec`):

  | Sound | Use | Gain vs bed |
  |---|---|---|
  | `click` | a press, a tag flip, a UI tap | +3 dB |
  | `whoosh` | a morph, a fast move, a cut between beats | 0 dB |
  | `pop` | a word/number pop, a badge landing | +3 dB |
  | `tick` | each step of a counter (≤ 12 per second) | −3 dB |
  | `thump` | the character landing, a logo/end card | +3 dB |
  | `riser` | into a reveal (ends on the reveal frame) | 0 dB |
  | `impact` | the payoff / the consequence | +4 dB |
  | `cash-register` | a money reveal (The Signal), max once per reel | +2 dB |

- **Density:** ≤ 1 cue per 2 s on average; build-and-drop (riser → impact) on at most 2 hero moments per reel.
- **Mix:** music bed −20 dB under the VO and ducked during speech; SFX 3–6 dB over the bed; final ≈ −14 LUFS integrated, true peak ≤ −1 dBTP (common practice; platforms re-normalise). No glitch/static textures under speech.
- **VO:** 2.5–2.8 words/s; numbers spoken exactly as displayed; pauses per §1.3.

---

## 4. Feedback Loop (how a draft becomes 80+ in ≤ 3 rounds)
1. **Critique render:** `node critique/critique.mjs <Comp> --shotlist <file> --round N` renders the **middle frame of every shot** and a contact sheet.
2. **Score every shot 1–10** on **story** (does this frame advance the story? for shot 1: is the hook clear within 2 s?), **composition** (one hero, depth, layout rules, safe zones, brand accuracy), **motion** (eases/holds/staggers per §1.3, no dead frames, something new every 2–4 s; check by scrubbing that shot), **type** (sizes, chunking, ≤ 2 lines, readable at **360 px wide**), **sync** (caption/number/SFX on the spoken frame or beat). These five fold in the seven axes of the Movez/Lukas loop (hook, phone readability, motion, variety, composition and depth, brand accuracy, sound sync). Be a strict reviewer comparing against the best reels in the niche, not against our last draft.
   - **Hunt list** (check every round): text overlapping during swaps · anything sliding instead of easing · corner labels / frame borders · centred-on-gradient shots · blurry scaled text · dead beats · a stutter at the loop seam · the character's feet off the ground · captions over the face.
   - **Extra checks before the final:** a 12-frame strip around the fastest action; a phone sheet (`fps=1,scale=360:-1`); render frame 0 and the last frame and compare (loop seam); render one frame twice and compare hashes (determinism).
3. **Fix the 3 worst shots** (lowest total; ties → lowest sync). **Targeted fixes only: lock every shot and every element that scored ≥ 8** — don't touch, restyle or "improve" it. No restarts.
4. Re-render the critique stills; re-score. **Repeat until every shot is ≥ 8 in every column. Max 3 rounds.** After round 3, ship the best round and log what is still under 8.
5. Whole-reel score (out of 100, the quality bar is **80**): hook 15 · readability 15 · one idea per shot 10 · motion 10 · sync 15 · pacing 10 · sound 10 · ending/loop 5 · safe zones 5 · brand + facts 5.
6. **Save the lesson:** every fix that generalises becomes one line in this file (§2 bans or the channel sheet), with the episode id. The next reel's first draft starts from the improved harness.
7. **Log every round** in `episodes/<id>/review_log.md`: scores, the 3 worst problems with timestamps, what changed. Re-render only the affected shots' stills between rounds.

**Fix prompt template** (paste with the round file):
```text
Round N scores attached. Fix ONLY shots <a>, <b>, <c>. For each: the problem, the exact change
(numbers), and what stays. Do not modify shots scoring ≥ 8 or shared components they use
(copy a component before changing it). Re-run critique for round N+1 and show the sheet.
```

---

## 5. Channel sheet — The Signal
- **What it is:** price-psychology Shorts told as stories with numbers, **45–60 s**. One mechanism, one surprising number, one everyday sighting. A story, not a lecture: our blocky person lives through it.
- **Palette:** cream ground **#F4EFE6**, ink **#1B1B1B**, accent red **#D7263D for money words and money objects only** (prices, $, %, "free", "sale"). Supporting neutrals: shadow ink at 12–18% opacity, paper edge #E6DFD2. Nothing else coloured.
- **Type:** display = a heavy grotesk that isn't a default (Archivo Black / Archivo 800); body = Manrope 600; numbers `tabular-nums`.
- **Medium:** price tags, shelf labels, receipts, a till, a phone checkout, on cream paper with soft contact shadows. Flat, crisp, print-like; no gradients.
- **Character:** our original blocky person in **every beat, ≥ 1/6 of frame height**; reacts to the numbers (looks at the tag, points, shocked take at the reveal). Never covers the hero number or captions.
- **Structure (beat grammar):** HOOK (0–3 s, frame 0 composed, number visible) → SETUP → TURN → WHY (name the mechanism) → PROOF (the study, one number, source line) → EVERYDAY → PAYOFF (one line; last frame ≈ frame 0 for a loop).
- **Facts:** every number in `facts.json` with a URL; a source line on screen whenever a number is.

## 6. Channel sheet — Q-ROSITY
- **What it is:** "what if" POV drama reels for doom-scrollers, **30–60 s**. Drama and world consequences, **not science lessons**: escalate stakes (me → my street → my city → the world), each beat a bigger consequence, then a twist/loop line.
- **Character:** the same original blocky person (same proportions/outfit as The Signal for brand continuity). POV shots: his hands/view; reaction shots: his face (mood takes, never snaps).
- **Environments:** detailed, lit sets (street, room, city, crowd, landscape) built in code: layered depth (foreground props, mid character, background set), practical lights (windows, signs, lava, screens), fog for depth. Each beat changes the set or the scale.
- **Camera grammar:** push-in on the hook; orbit 10–20° on a reveal; low angle on the consequence; whip/shake (≤ 7 frames) on impacts; cut every 1.5–3 s.
- **Type:** "WHAT IF" title card on frame 0 over the scene (not a black card); captions as in §1.3; one stat/number at most per beat, only when it raises the stakes.
- **Policy:** vary scenario, setting, outcome and twist per episode and log them (YouTube demonetises "the same situation with the same outcome" repeated).

---

## Learned from reviews
(append: `- <rule> — <episode id>, <date>`)
- A bar's height is locked to the number it displays (step-eased per counter step), never eased on its own clock — at mid-count it showed $8 taller than $9 — SignalDemo, 2026-11-02
- Money words with a `$`/digit stay hidden in the caption until spoken, so the chunk never spoils the reveal — SignalDemo, 2026-11-02
- 3D over overlays (fov 36°): head below the title/countdown when `target.y ≥ 3.1 − 0.142·dist`, AND the face above the caption block (chin above y ≈ 1050); check both on every still — QrosityDemo, 2026-11-02
- Mix: catalog SFX peak at −3 dBFS, so cues at +3 dB clip over a bed — run the SfxTrack at −6 dB master, and duck the bed through the pre-reveal pause so riser + impact don't sum to 0 dBFS — QrosityDemo, 2026-11-02
