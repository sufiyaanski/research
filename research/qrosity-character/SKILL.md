---
name: qrosity-character
description: Build Q-ROSITY "what if…" curiosity reels (1080×1920, 60 fps, 30–60 s) in Remotion + @remotion/three with "Q", an ORIGINAL procedural box-limb character (no assets, no Minecraft/Roblox trademarks). Use whenever someone asks for a Q-ROSITY reel, a blocky/voxel character scene, a "what if" POV short in code, or to revise/re-render one. Covers the rig API, camera grammar for 9:16, lighting, pose timing, still-check loop, render flags and the things that break.
---

# Q-ROSITY character skill

Q is a 3.3 m-tall (in scene units) chibi box humanoid: teal hoodie with orange drawstrings and a boxy "?" emblem, navy pants, white sneakers with orange soles, tan skin, dark hair cap. He is built from `<boxGeometry>` only, with an inverted-hull outline, so he renders identically on every machine and needs no model files. Everything moves as a pure function of `useCurrentFrame()`.

Source of truth: `src/BlockyCharacter.tsx` (rig) and `src/Scene.tsx` (camera, lights, ground, title card). Never fork the rig per video; add poses to `computeRig()` instead.

## Workflow (every video)

1. **Beat sheet first.** 8–16 beats of 2–4 s each, one visual idea per beat, one caption per beat, a hook in beat 1 ("WHAT IF" title + one-line premise) and a payoff in the last beat. Write it as a `BEATS` array (`{id, pose, from, dur, caption, camera}`) in `src/beats.ts`. Picture, captions and SFX all read from it.
2. **One `<Sequence layout="none">` per beat inside `<ThreeCanvas>`.** `layout="none"` is mandatory (a Sequence renders a `<div>` otherwise and crashes inside the canvas). Each beat gets a local frame 0, which is what the pose ramps (`point`, `shocked`) need.
3. **Stills before anything.** `npx remotion still src/index.ts <Comp> out/f<N>.png --frame <N>` for the middle frame of EVERY beat, tile them into a contact sheet, and look at the sheet yourself. Almost every bug (camera inside the character, arm through the face, title on the eyes, head underside visible) is invisible in code and obvious in a still.
4. **Render a 3 s slice at 60 fps** (`--frames=0-179`) to check motion before the full render.
5. **Full render**: `npx remotion render src/index.ts <Comp> out/video.mp4 --codec=h264 --crf=18`. Verify with `ffprobe` (1080×1920, 60/1, frame count = duration×60).
6. Deliver with a list of what was checked (frames) and what was not (sound on a phone speaker).

## Rig API

```tsx
<BlockyCharacter
  pose="idle" | "walk" | "point" | "shocked"
  lookAt={[x, y, z]}          // world point; yaw clamped ±1.0 rad, pitch ±0.6 rad
  position={[0, 0, 0]}        // feet center
  rotationY={0}               // 0 faces +Z (toward the default camera)
  seed={0}                    // offsets idle/blink timing so two Qs don't sync
  palette={{ hoodie: "#..." }} // optional recolor; keep the orange accent
  outline={0.035}             // inverted-hull thickness in meters; 0 disables
/>
```

Exports: `CHARACTER_EYE_Y` (≈2.5), `CHARACTER_HEIGHT` (≈3.1), `DEFAULT_PALETTE`, `Pose`.

Pose semantics (local frame = frames since the enclosing Sequence started):
- `idle`: breathing (0.35 Hz torso scale), 1 cm bob, tiny arm sway, slow head drift. Safe for any hold.
- `walk`: 1.6 steps/s, ±0.6 rad hip swing, arms counter-phase ×0.8, 4 cm bob, 0.08 rad torso lean, head roll. Treadmill in place; move the `position` or the camera for travel.
- `point`: right arm rises over 0.35 s (smoothstep) to up-right-forward, brows half up, mouth slightly open, torso twists −0.18. Use for "look at THIS" beats; put the thing he points at up-right of him in frame.
- `shocked`: 8-frame snap (0.13 s): arms thrown out+up, 12 cm hop, knees split, brows fully up, mouth wide; then a decaying settle. Use for reveals; cut TO this pose, never hold it longer than 1.5 s.
- Blink: every 3.1 s for 4 frames, automatically. Pupils follow `lookAt`.

Adding a pose: add a `case` to `computeRig()` returning a full `Rig`. Ramp everything with `smooth(clamp(frame / (fps * seconds), 0, 1))`. Never read `Date.now()`, `performance.now()`, `Math.random()`, or R3F's `useFrame`/clock: frames render in parallel tabs and anything not derived from `frame` flickers.

Arm rotation sign rule (Euler XYZ, `v' = Rx(Ry(Rz(v)))`, arm hangs along −Y from the shoulder): a NEGATIVE z rotation moves the LEFT arm outward, a POSITIVE z moves the RIGHT arm outward. Apply z (outward) first in your head, then x (forward/back). Pointing straight at the lens (`x≈-π/2, z≈0`) foreshortens into a fist over the face in 9:16; use `[0.6, 0, ±2.0]` (up-right-forward) instead.

## Camera grammar for 9:16

- Vertical fov 36°. Horizontal half-angle is only ~10°, so the frame is a narrow slot: stack depth, don't spread width. Visible height at distance d is `2·d·tan(18°)` ≈ 0.65·d.
- Full-body hero shot: distance 9.2 → 7.0 m, camera height 1.6 → 1.9 m (just under the eye line = heroic), lookAt `[0, 1.7, 0]`. That puts feet at ~78 % and head top at ~23 % of the frame with the title clear above.
- Bust shot (reaction): distance 4.5 m, height 2.2, lookAt `[0, 2.3, 0]`.
- Every hold creeps: push-in 0.15–0.35 %/frame or orbit ≤ 0.004 rad/frame. No static hold ≥ 0.5 s.
- Orbit 10–20° over a 2–4 s beat; cut on big jumps; glide only within a beat (smoothstep over 18–40 frames).
- Impact beats: 7-frame shake that flips sign each frame and decays (`amp * (-1)**f * exp(-f/3)`).
- Never put the camera below ~1.3 m with the head pitched back: a low camera sees the underside of the head cube and the face stops reading. `shocked` keeps the chin slightly down for this reason.
- Keep the top 22 % (title) and bottom 12 % (platform UI) free of the face.

## Lighting (reads on a phone)

- `hemisphereLight` sky `#bcd3ff` / ground `#2a2420` at 0.9 (cheap ambient with color separation).
- Key: warm `directionalLight` `#fff1dc` at `[4, 7, 5]` intensity 3.2, `castShadow`, 2048 map, ortho bounds ±6, `bias -0.0008`, `normalBias 0.02`, PCFSoft.
- Fill: cool `#7fb0ff` from `[-6, 3, 2]` at 0.8.
- Rim: orange `#ff9a5c` from behind `[-2, 4, -6]` at 2.4; this is what separates Q from the dark background. Keep it.
- `ACESFilmicToneMapping`, exposure 1.05; background `#16222f` and `fog` of the same color from 9 → 24 m.
- Materials: `meshStandardMaterial` roughness 0.85–1, metalness 0. The `Box` component adds a BackSide outline hull of 3.5 cm; keep it on the character, off the environment.
- Decals (eyes, pocket, emblem) are 12 mm boxes offset 6–8 mm from the face. Any new sticker goes ≥ 6 mm proud of its surface or it z-fights.

## Title / caption style

- Title "WHAT IF" 140 px weight 900, white, `textShadow 0 8px 30px rgba(0,0,0,.6)`; subtitle 64 px weight 700, `#ffb15c`. Both in HTML `<AbsoluteFill>` over the canvas (stays sharp at any `--scale`).
- Title in at 0.2 s, subtitle at 0.6 s, both gone by 3.7 s. Captions elsewhere: one line, ≤ 6 words, 64–72 px, 160 px above the bottom.

## Sound cues (lock the beat sheet before placing)

- Block-step: one short wood/stone tick per foot plant, i.e. every `fps/1.6/2` ≈ 19 frames in `walk`.
- Impact/reveal: a low thud + short riser ending exactly on the `shocked` snap frame.
- Point: a light "pop" at the 0.35 s arm-ramp end.
- Use CC0 libraries (Kenney Impact Sounds, OpenGameArt CC0 footsteps) or synthesize; never a game's actual sounds.

## Render settings

- `remotion.config.ts`: `setChromiumOpenGlRenderer("angle")` on a desktop with a GPU; `"swangle"` on any machine without a GPU (CI, cloud box, Lambda). `"swiftshader"` and `"egl"` both fail with "Error creating WebGL context".
- 60 fps, 1080×1920, `dpr={1}`, `--crf=18`, `--concurrency` = physical cores/2 on SwiftShader (it is CPU-bound; 4 vs 2 gave ~7 %).
- Measured on a 4-vCPU no-GPU Linux box: ≈0.36–0.39 s per frame → a 45 s reel (2700 frames) ≈ 17 min. Expect several× faster on a desktop GPU with `angle` (unverified here).
- Stills: ≈5 s each including bundle. Render stills at full size; `--scale 0.5` still renders the 3D at 1080 wide because R3F clamps dpr ≥ 1.

## What breaks (seen in this project)

| Symptom | Cause | Fix |
|---|---|---|
| `THREE.WebGLRenderer: Error creating WebGL context` | wrong `gl` for the machine | `swangle` without GPU, `angle` with |
| Character fills the frame / title on the head | fov 32 at 5.6 m shows only 3.2 m of height | distance ≥ 9 m or fov ≥ 36 for a full-body hero |
| Fringe covers the eyes | hair boxes below `HEAD*0.62` | keep hair ≥ 0.62·HEAD, eyes at 0.46·HEAD |
| Arm disappears inside the torso | wrong z sign (inward) | left arm z < 0, right arm z > 0 for outward |
| Point reads as a fist in front of the face | arm aimed at the lens | `[0.6, 0, 2.0]` for the right arm |
| Face unreadable in `shocked` | head pitched back, low camera | chin down (+0.05), lean ≤ −0.05 |
| Flicker between frames | time/random based motion | derive everything from `frame` |
| `<Sequence>` crash inside canvas | default `layout` renders a div | `layout="none"` |
| Stipple in soft shadows | PCFSoft on SwiftShader | raise `normalBias` to 0.03 or use PCFShadowMap with `radius` |
