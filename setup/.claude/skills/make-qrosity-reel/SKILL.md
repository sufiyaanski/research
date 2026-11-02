---
name: make-qrosity-reel
description: End-to-end recipe for a Q-ROSITY reel ("what if…" curiosity POV drama, 1080x1920 @ 60 fps, 30-60 s) with "Q", the ORIGINAL procedural blocky 3D character rendered by @remotion/three — premise → facts.json → script with POV escalation ×3 → beats.json → vo.gen.ts → Episode.tsx on Stage3D + BlockyCharacter + the 2D kit → phone-scale frame QA (swangle vs angle) → draft/final render → review notes → "save to skill". Use when the user says "make a Q-ROSITY reel", "what if … reel", "new qrosity episode", "blocky character video", or wants to continue the qrosity-NNN series. Includes the rig API, camera grammar, lighting rules, pose/take timing, what breaks, and a copy-paste prompt.
---

# make-qrosity-reel — the 7 stages

Run from `setup/`. Read `CLAUDE.md` (hard rules), `channels/q-rosity/brand.md` (look, voice,
character spec, sound) and `/reel-design-rules` first. The reference implementation is
`qrosity-001-volcano` (`remotion/src/episodes/qrosity-001-volcano/Episode.tsx`) — copy its
structure, not its content. `qrosity-000-placeholder` is the old 2D stand-in; ignore it.

Artifact contract (same as `/make-signal-reel`):
```
episodes/qrosity-NNN-<slug>/
  facts.json       every number + source URL + confidence     (stage 2)
  script.md        hook, beat table (time | camera | Q | on screen | VO) (stage 3)
  sfx-plan.json    cue sheet on the global timeline            (stage 6)
  publish.json     title, caption, hashtags, qa scores         (stage 7)
  qa/frames/       ≤ 8 phone-scale stills + contact-sheet.png  (stage 5)
remotion/src/episodes/qrosity-NNN-<slug>/
  beats.json       format, vo[] lines, beats[] (global seconds, + `camera` preset) (stage 3)
  vo.gen.ts        GENERATED word timings (estimate-vo.mjs / TTS) (stage 3)
  Episode.tsx      ONE <Stage3D>, one <Sequence layout="none"> per beat, 2D overlays (stage 4)
```
Shared code you build on (never fork per episode):
```
remotion/src/lib/character/BlockyCharacter.tsx   the rig: poses, moods, takes, palette from brand.ts
remotion/src/lib/character/Stage3D.tsx           ThreeCanvas wrapper, Ground, Lights, CameraRig presets
remotion/src/brand.ts → QROSITY (character) · QROSITY_STAGE (2D overlays on the dark stage)
```

## Stage 1 — Premise (one "what if", one body, one consequence)

- A Q-ROSITY reel is **one hypothetical + three escalating physical facts + one consequence**.
  Write the pitch as: "What if <X>? <fact 1> → <fact 2> → <fact 3>, so <consequence>".
- The hook is always a question starting with **WHAT IF** (title 132 px + premise line 60 px).
- Hook candidates: 3, ≤ 6 words each; keep two in `publish.json → altHooks`.
- Check the series: don't repeat a scenario used in the last 5 episodes.

## Stage 2 — facts.json (before any script)

- Every number on screen or in VO: `value`, `unit`, `display`, `source` (URL), `quote`,
  `confidence` (`verified` / `secondary` / `anecdote`), `onScreenSource` (≤ 48 chars — it
  must fit ONE line on the 30 px source plate). One number per escalation beat, three total.
- **Never invent.** Round once, in `display`. Where sources give a range, show the
  conservative end and put the range in `note`.

## Stage 3 — script.md + beats.json (+ vo.gen.ts)

- Beat grammar (30–60 s): **HOOK** 0–3.5 s (title composed on frame 0, Q already in frame,
  push-in) → **01 / 02 / 03** POV escalation (each 2 beats of 3–4 s: a *headline* beat and a
  *number* beat, or one beat of ≤ 5 s with a mid-beat cut) → **CONSEQUENCE** (low angle, the
  shocked snap, a stamp) → **LOOP** (camera glides back to the frame-0 shot, title returns).
  Cuts every 2–4 s. No outro.
- VO: 60–140 words at ≈ 2.4–2.8 words/s, second person, present tense ("First problem: the
  heat."). The word that names a number is the cue its counter lands on.
- `beats.json`: `vo[]` lines; `beats[]` contiguous with `visual`, `sfx` and a `camera` preset
  name (documentation only — Episode.tsx is the truth). `format.durationSec` = last beat end.
- `npm run vo:estimate -- qrosity-NNN-<slug>` → `vo.gen.ts`. Fix any > 3.2 words/s warning by
  widening the window, never by speeding the voice.
- Show the user script.md and wait for "go".

## Stage 4 — Episode.tsx on Stage3D + the kit

Structure (copy from qrosity-001):
```tsx
<AbsoluteFill style={{ backgroundColor: B.ink }}>           // B = QROSITY_STAGE
  <Stage3D theme={THEME} ground={false}>                     // ONE canvas for the whole reel
    {BEATS.map(b => <Sequence from={b.from} durationInFrames={b.durationInFrames} layout="none">
       <CameraRig preset="pushIn" /> <MySet /> <BlockyCharacter pose=… mood=… lookAt={CAMERA_LOOK} />
    </Sequence>)}
  </Stage3D>
  {BEATS.map(b => <Sequence …>{/* 2D: Kicker, BigTitle, Counter, Stamp, SourceLine plate */}</Sequence>)}
  <Captions brand={B} lines={VO} plate /> <ProgressBar brand={B} />
</AbsoluteFill>
```
- Every beat returns `{ three, overlay }` from one function; `cue(s) = toLocal(s, b.from)`.
  **Frames inside a Sequence are local** — both the 3D and the 2D Sequence of a beat share `from`.
- Build the 2D layer only from the kit (`Kicker`, `BigTitle`, `Counter`, `Stamp`,
  `SourceLine plate`, `Captions plate`, `ProgressBar`). One episode-specific 3D set component
  (`VolcanoSet`) and one 2D helper (`HookTitle`) max; move to `lib/` if a second episode needs it.
- Use `QROSITY_STAGE` (light text, yellow accent) for everything drawn over the 3D stage; the
  character itself takes `QROSITY` through `DEFAULT_PALETTE`.
- Register in `Root.tsx` (duration from beats.json). `npm run typecheck`.

### Rig API
```tsx
<BlockyCharacter
  pose="idle" | "walk" | "point" | "shocked"
  poseAt={cue(4.6)} prevPose="idle"   // cut TO a pose on a VO word; ramps start there (local frames)
  mood="worried"                      // constant face, or a timeline:
  mood={[{ at: -99, mood: 'neutral' }, { at: cue(1.9), mood: 'worried' }]}  // each key = a TAKE
  lookAt={CAMERA_LOOK}                // [1.2, 2.3, 8]: eyes toward the lens; yaw ±1.0, pitch ±0.6 rad
  position={[0, 0, 0]}  rotationY={0}  seed={0}  palette={{ hoodie: '#…' }}  outline={0.035}
/>
```
Exports: `Pose`, `Mood` (`neutral | worried | shocked | happy | asleep`), `MoodKey`,
`TAKE_FRAMES` (30), `CHARACTER_EYE_Y` (≈ 2.5), `CHARACTER_HEIGHT` (≈ 3.1), `DEFAULT_PALETTE`.

Pose timing (local frame = frames since the Sequence start, or since `poseAt`):
- `idle`: breathing 0.35 Hz, 1 cm bob, arm sway, slow head drift. Any hold.
- `walk`: 1.6 steps/s, ±0.6 rad hips, arms counter-phase, 4 cm bob. Treadmill — move `position`
  (surface beat: z −1.4 → 0.5) or the camera for travel. Sink it (`position y −0.38`) to read "stuck".
- `point`: right arm up-right-forward over 0.35 s (`[0.6, 0, 2.0]`), brows half up. Put the thing
  pointed at up-right of Q, or just let the gesture read as "that".
- `shocked`: 8-frame snap, 12 cm hop, arms up+out (`z ±0.95` so the hands stay inside the 9:16 frame
  at ≥ 8 m), chin down. Cut TO it on the word; hold ≤ 1.5 s; pair with a `CameraRig shake`.
- Blink every 3.1 s for 4 frames (seed-shifted). Pupils follow `lookAt`.

**Mood changes go through a take, never a snap.** A `MoodKey` at `at` plays, over 30 frames:
anticipation (0–6 f: head dips, body stretches 4 %) → squash (6–12 f: y 0.88, x 1.08; the new
face lands at ~10 f) → settle (12–30 f: decaying overshoot). Start the take **10 frames before**
the body pose cut (`poseAt`) so the new face lands with the hop. Faces: `worried` (inner brows up,
sweat drop), `shocked` (round eyes, O mouth), `happy` (wide mouth, blush), `asleep` (eyes shut).

Adding a pose: add a `case` to `computeRig()` returning a full `Rig`, ramps as
`smooth(clamp(frame / (fps * seconds), 0, 1))`. Adding a mood: add a `Face` to `FACES`. Never
`useFrame`, `Date.now()`, `Math.random()`, CSS animation — frames render in parallel tabs and
anything not derived from `frame` flickers.

Arm sign rule (Euler XYZ, `v' = Rx(Ry(Rz(v)))`, arm hangs along −Y): NEGATIVE z moves the LEFT
arm outward, POSITIVE z the RIGHT. Aiming at the lens (`x ≈ −π/2, z ≈ 0`) foreshortens into a
fist over the face.

### Camera grammar (9:16, vertical fov 36°, horizontal half-angle ≈ 10°)
- Visible height ≈ 0.65 × distance; width = 9/16 of that. **Stack depth, never width.**
- Presets in `Stage3D.tsx` (`<CameraRig preset zoom target shake dur />`, each glides over its beat):
  `pushIn` (hook: 9.2 → 7.6 m, target y 1.7 → 2.0 so the head top stays ≥ 510 px under the title),
  `hero` (9.2 → 8.8 m, creeping hold), `orbit` (7.4 m, 17° across the beat), `bust` (4.6 m, face in
  the upper-middle; `zoom 1.25` leaves y 290–460 for a number above the head), `lowAngle` (6.2 m at
  1.3 m height — never lower, the head cube's underside shows; `zoom 1.42` for the shocked arms),
  `loop` (glides to pushIn's first state so the last frame ≈ frame 0).
- Every hold creeps (push ≥ 0.15 %/frame or orbit ≤ 0.004 rad/frame); orbit 10–20° per beat; cut on
  big jumps, glide only inside a beat. Impact: `shake={{ at, amp: 0.14 }}` = 7 frames, sign-flipping,
  decaying.
- Text layout vs the character: kicker y 236, headline/number y 290–480, head top ≥ 500, source plate
  y 1248, captions y 1380 (plate). Text never covers the face; on bust shots the number goes ABOVE
  the head, the source BELOW the chin.

### Lighting (reads on a phone)
- `StageTheme`: hemisphere sky/ground, warm key `[4, 7, 5]` with 2048 PCF shadows (`normalBias
  0.03` for SwiftShader), cool/coloured fill `[-6, 3, 2]`, strong rim from behind `[-2, 4, -6]` (this
  separates Q from the dark fog — keep it), optional `underGlow` point light (lava, screens, fire).
- `ACESFilmicToneMapping`, exposure 1.05; `sky` = fog colour = `QROSITY_STAGE.ink` family so plates
  and the 3D background agree. Materials `meshStandardMaterial` roughness 0.85–1, metalness 0.
- Outline hull (3.5 cm) only on the character, never on the set. Decals ≥ 6 mm proud of a face.
- Set pieces: nothing with z > 0 near the character's x (it lands between the lens and Q and blacks
  out the frame — qrosity-001 learned this). Background blocks live at z ≤ −2.

## Stage 5 — Frame QA (never skip)

- `npm run frames -- <Comp> beats --scale=0.5 --gl=swangle` on a machine WITHOUT a GPU (CI, cloud
  box, Lambda); `--gl=angle` (the default) on a desktop with one. `swiftshader`/`egl` fail with
  "Error creating WebGL context". READ every PNG, fix, repeat ≥ 2×. Note: `--scale=0.5` still renders
  the 3D at 1080 px wide (R3F clamps dpr ≥ 1), so a still costs ≈ 5–7 s on a 4-vCPU box.
- Look for: camera inside geometry / a set block in front of Q, title or number on the face, arm
  through the torso or clipped at the frame edge, head underside visible, source line wrapping under
  the caption plate, feet outside the frame on the hero shot, loop frame ≠ frame 0.
- Score `/frame-qa`. < 70 → keep fixing. Copy ≤ 8 stills + the contact sheet into
  `episodes/<id>/qa/frames/`.

## Stage 6 — Render + sound

- `npm run render -- <Comp> --scale=0.5 --gl=swangle` → `out/<Comp>-draft.mp4`;
  `npm run check -- out/<Comp>-draft.mp4 --draft`. Measured here (4 vCPU, no GPU, swangle,
  concurrency 4): ≈ 0.4 s/frame → 30 s = 1800 frames ≈ 12 min. A desktop GPU with `angle` is
  several× faster (not measured). `angle` leaks memory on very long renders: split > 60 s reels.
- `sfx-plan.json`: lava/ambience bed, block-step every 19 frames in `walk`, riser → impact on each
  number landing, `boing-soft` on take squashes, `stamp-hit` on stamps, deep impact + shake on the
  shocked snap. CC0 or synthesized only (`tools/gen_sfx.py` when present) — never a game's sounds.
- Final: `npm run render -- <Comp> [--gl=…]` (scale 1) only after the draft passed review.

## Stage 7 — Review notes → "save to skill"

- `/review-loop`: notes from `review/index.html` → fixes → stills at those timestamps → re-render.
- On "save to skill": character/look/sound rules → `channels/q-rosity/brand.md`; motion/type/layout
  → `/reel-design-rules`; rig/camera/3D rules → this file's "What breaks". Episode id as provenance.
- Fill `publish.json`.

## What breaks (seen in the prototype + qrosity-001)

| Symptom | Cause | Fix |
|---|---|---|
| `THREE.WebGLRenderer: Error creating WebGL context` | wrong `gl` for the machine | `--gl=swangle` without GPU, `angle` with |
| Whole frame dark except a sliver | a set block between the lens (z ≈ 9) and Q | set pieces at z ≤ −2 only; check with stills |
| Character fills the frame / title on the head | fov 32 at 5.6 m shows only 3.2 m | ≥ 9 m or fov ≥ 36 for full body; raise `target.y` as you push in |
| Hands cut off at the frame edge | 9:16 width ≈ 0.37 × distance | arms up more than out (`z ±0.95`), `zoom ≥ 1.4` on the low angle |
| Fringe covers the eyes | hair boxes below `0.62·HEAD` | keep hair ≥ 0.62·HEAD, eyes at 0.46·HEAD |
| Arm disappears inside the torso | wrong z sign | left arm z < 0, right arm z > 0 for outward |
| Point reads as a fist over the face | arm aimed at the lens | `[0.6, 0, 2.0]` for the right arm |
| Face unreadable in `shocked` | head pitched back, low camera | chin down (+0.05), camera ≥ 1.3 m |
| Face snaps between moods | constant `mood` strings per beat | one `MoodKey[]` per character instance, take starts 10 f before the pose cut |
| Flicker between frames | time/random-based motion | derive everything from `frame`; LCG seeds for set dressing |
| `<Sequence>` crash inside canvas | default `layout` renders a div | `layout="none"` |
| `PCFSoftShadowMap has been removed` warning | three ≥ 0.187 | `PCFShadowMap` + `shadow.radius 4` (already in Stage3D) |
| Source line wraps under the captions | > ~48 chars at 30 px | shorten `onScreenSource`; `SourceLine plate` |
| Stipple in shadows on swangle | SwiftShader PCF | `normalBias 0.03`; cleaner on a GPU |
| Stills look fine, video flashes | `useLayoutEffect` without `frame` in deps | CameraRig keys on `frame` — copy it, don't rewrite it |

## Copy-paste prompt

```
/make-qrosity-reel — new episode qrosity-002-<slug>: "What if <premise>?"
Use Stage3D + BlockyCharacter (poses idle/walk/point/shocked, moods neutral/worried/shocked/happy/asleep via MoodKey takes, never a snap). Do not fork the rig; add poses to computeRig() as pure functions of the local frame.
1. facts.json first: three numbers (one per escalation beat) with source URLs read this session; onScreenSource ≤ 48 chars.
2. script.md + beats.json: HOOK (title on frame 0, pushIn) → 01/02/03 escalation (headline beat + number beat each, cuts every 2–4 s, orbit 10–20° on one, bust for numbers) → CONSEQUENCE (lowAngle zoom 1.42, shocked snap on the word with a 7-frame shake, stamp) → LOOP (camera glides to the frame-0 shot, title returns). 30–45 s, VO ≈ 2.5 words/s. Stop and show me the script.
3. Episode.tsx copied from qrosity-001-volcano: one Stage3D, one Sequence layout="none" per beat with CameraRig + set + character, 2D overlays from the kit using QROSITY_STAGE, Captions plate + ProgressBar at the root. One episode-specific set component built from boxes only.
4. npm run typecheck; npm run frames -- <Comp> beats --scale=0.5 --gl=<swangle|angle>; READ every PNG; fix; repeat. Keep ≤ 8 stills + contact sheet in episodes/<id>/qa/frames/.
5. npm run render -- <Comp> --scale=0.5 --gl=<…>; npm run check -- out/<Comp>-draft.mp4 --draft. Author sfx-plan.json and publish.json.
Report: files, commands + results, s/frame, what the stills look like, what is unverified.
```

## Done =
facts sourced · script approved · composition on Stage3D + kit · stills read twice and saved ·
draft rendered + checked · sfx plan authored · review round(s) closed · rules saved · publish.json filled.
