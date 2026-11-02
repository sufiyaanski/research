# 01c — Q-ROSITY blocky character: research + working Remotion/three prototype

Note: the harness refused to let me write `01c-qrosity-blocky-character.md` as a file ("return findings as text"), so this message IS the markdown; save it as `research/01c-qrosity-blocky-character.md`. The working project (source, config, SKILL.md, 4 final stills, contact sheet, 3 s 60 fps MP4) IS on disk at `/home/user/research/research/qrosity-character/` (2.4 MB, no node_modules, not committed). Scratch original with node_modules and all iteration stills: `/tmp/claude-0/-home-user-research/3a9254c9-8774-5a90-afe6-ceccf053189d/scratchpad/qrosity/`.

Date: 2026-11-02. Machine: 4 vCPU, no GPU, Linux, Node 22.23.4, Remotion 4.0.540. VERIFIED = page/raw file read in this session; UNVERIFIED = snippet, gig listing, vendor blog, or inference.

## TL;DR

- **It works.** `@remotion/three` + a procedural box rig renders clean 1080×1920 stills and a 60 fps MP4 here with `--gl=swangle` (no GPU). On a GPU desktop use `angle`. `angle`, `swiftshader` and `egl` all failed here with `THREE.WebGLRenderer: Error creating WebGL context`.
- **Render cost measured:** 0.39 s/frame at concurrency 2, 0.36 s/frame at concurrency 4 (60 fps, 1080×1920, PCFSoft 2048² shadows, AA on). 30 s reel ≈ 11–12 min, 60 s ≈ 22 min on this box. Stills ≈ 5–7 s each including bundle. GPU desktop should be several× faster (Remotion's claim, UNVERIFIED here).
- **Procedural box rig beats assets** for Q-ROSITY: no loading/`delayRender` risk, deterministic, re-colorable, ~330 lines. Use Blockbench glTF or MagicaVoxel .vox only for silhouettes boxes can't give.
- **What fixed the "40–65/100 first draft" problem in practice:** (1) 9:16 camera math (full-body hero needs ≥ 9 m at vertical fov 36°, lookAt y 1.7), (2) orange rim light from behind on a dark fogged background, (3) inverted-hull outline on the character only, (4) decals raised 6–8 mm off faces (zero z-fighting), (5) explicit arm-rotation sign rules so poses never fold into the torso or foreshorten into a fist, (6) a stills contact sheet after every change. All baked into the SKILL.md draft.
- Two public Claude skills already do "what if" reels in Remotion + R3F (`BinhL3/what-if-video-skill`, `mromidev/claude-animated-shorts`); their rules were read and folded in. Their characters are PS2 low-poly / 2D cards, not blocky, so this rig is new.

---

## 1. Research findings

### 1.1 Animating blocky characters in code (three.js / R3F)

**Rig structure (VERIFIED, several sources agree).** A `Group` per body part with the pivot at the joint (hip, shoulder, neck), geometry offset downward inside the group, `rotation.x` = sine of time, legs anti-phase, arms opposite the same-side leg.
- `bs-community/skinview3d` (740★, pushed 2026-05-03, VERIFIED via GitHub search API). Its `WalkingAnimation`: `leftLeg.rotation.x = Math.sin(time) * 0.5; rightLeg.rotation.x = Math.sin(time + Math.PI) * 0.5;` arms counter-phase, small head sway; `RunningAnimation` scales time and amplitude. Source excerpt: https://socket.dev/npm/package/skinview3d/diff/1.1.0-alpha.2 (constants may differ in current code).
- TinySkinViewer: "arms & legs swing via sin(time × 4) × 0.6, pivoted at shoulder/hip joint" https://jsr.io/@feniota/tiny-skin-viewer (VERIFIED quote).
- Hobby procedural box character: "Legs rotate around top-pivots for a perfect walk cycle" https://shinobirpg.pages.dev/models.html (VERIFIED quote).
- Other GitHub hits (metadata VERIFIED, contents not read; `gh api` on arbitrary repos returned 403 in this session): `lovelyscientist/minecraft-style-couple` (2★, "minecraft-like characters with Three.js using Box Geometry"), `haimadrian/claude-village` (1★, R3F "Minecraft-style voxel village" of Claude Code sessions), `DryanFTH/Minevo3D` (1★, "bendable arms and legs"), `earthiverse/3D-Minecraft-Skin-Viewer` (82★), `payamrajabi/voxel-creator` (R3F voxel character builder).

**What the prototype adds (my design, tested):** breathing (torso scale 1 ± 0.015 at 0.35 Hz), 4-frame blink every 3.1 s seed-shifted, pupils follow `lookAt`, brow-raise and mouth-open channels, smoothstep ramps for `point`/`shocked`, decaying settle after the shock snap.

**Remotion-specific rules (VERIFIED: Remotion docs + the bundled rule file `setup/.claude/skills/remotion-markup/3d.md` already in this repo):**
- `<ThreeCanvas width height>` required (browser bug with Remotion's scale transform in Studio). https://www.remotion.dev/docs/three-canvas
- "Animations are now not inside a `useFrame()` hook, but directly rendered into the markup." `useFrame` forbidden; during render `frameloop` is forced to `never`, scene re-renders only on `advance()`. https://www.remotion.dev/docs/three
- `<Sequence>` inside the canvas must be `layout="none"`.
- GL: `Config.setChromiumOpenGlRenderer('angle')`; config does NOT apply to Node APIs/Lambda — pass `chromiumOptions: {gl: 'angle'}`. Recommendations: desktop `angle`, cloud GPU `angle-egl`, Lambda/no-GPU `swangle` ("may be slow"); `angle` has memory leaks → split long renders; `angle` fails on GitHub Actions. Remotion 5.0 makes `angle` default with SwiftShader fallback. https://www.remotion.dev/docs/gl-options
- Flicker = anything not derived from frame (parallel tabs). https://v3.remotion.dev/docs/flickering
- `<ThreeWebGPUCanvas>` since 4.0.503 (`@remotion/three/webgpu`, three ≥ 0.167, R3F ≥ 9, React 19); experimental, headless Linux needs Chrome for Testing + maybe `--gl=vulkan`. Skip. https://www.remotion.dev/docs/three-webgpu-canvas
- Official `remotion-dev/template-three` (117★, pushed 2026-11-02): config sets `setRspack(true)`, `setChromiumOpenGlRenderer("angle")`, `setVideoImageFormat("jpeg")`; pins `@react-three/fiber 9.2.0`, `three 0.178.0`, `react 19.3.1`, `zod 4.6.7`; Root is 1280×720 @ 30 fps (no vertical/60 fps example). VERIFIED (raw files read).

**Lighting / shading / camera:** tested rather than sourced — hemisphere + warm key (2048 soft shadows) + cool fill + strong orange rim from behind, ACES tone mapping, fog = background color. Toon: `meshToonMaterial` exists in R3F; drei `<Outlines thickness color screenspace angle>` draws inverted-hull outlines for mesh/skinnedMesh/instancedMesh (https://drei.docs.pmnd.rs/abstractions/outlines, VERIFIED). The prototype uses its own 8-line hull (scaled `BackSide` box), so drei is not a dependency. Post-process outline alt: `r3f-peridot` (UNVERIFIED). Perspective kept over orthographic because push-ins need parallax; both "what if" skill repos use perspective, fov 38–50, low camera.

**Claude-generated 3D Remotion showcases.** No X/YouTube post with a quoted prompt for a 3D character was found. What exists:
- `BinhL3/what-if-video-skill` (3★, pushed 2026-10-15): "vertical 'What if…' videos in code with Remotion + React Three Fiber + three.js, PS2-style". README prompt (VERIFIED quote): *"Make a 60-second vertical "what if" video: what if every barista disappeared? PS2 style, captions, no narration."* Stack: Remotion 4.0.535, R3F 9, three 0.186, `ThreeCanvas dpr={0.5}` + `imageRendering: pixelated`, flat Lambert, 30 fps, 1080×1920, `--scale=2` for 4K, Python-synth SFX. Best 9:16 framing rule found anywhere (VERIFIED quote from its `references/scenes.md`): *"A portrait frame is narrow: with a vertical fov of 50°, the horizontal half-angle is only about 15°."* / *"To fit an object of width w at distance d, you need w ≤ 2·d·tan(fov/2)·9/16."* https://github.com/BinhL3/what-if-video-skill
- `mromidev/claude-animated-shorts` (322★, pushed 2026-11-01, MIT): "viral animated story shorts (2D characters in a 3D world) with three.js + Remotion". Its 15 KB SKILL.md: cuts on big jumps, "smootherstep glides 18-40 f, every hold creeps (no static hold ≥4 f)", "flip kicks decaying over 7 f on impacts, 4-4.6° rolls", DOF on ~1/3 of shots, "blinks every 0.5-2.3 s, lasting 4 f", every Remotion bundle copies `public/` to temp (60 GB+ after many renders), 1080×1920 @ 30 fps, final `--scale 1.3333`, "2K renders run ~4 fps". https://github.com/mromidev/claude-animated-shorts
- `Kianzzz/xilo-opus-video` (351★): Opus 5.5 skill — 3 plans + previews, then frame-by-frame render (Canvas/WebGL/Three/Remotion/HyperFrames); rule "画面只由时间决定" (picture is a function of time only). https://github.com/Kianzzz/xilo-opus-video
- Reddit r/ClaudeAI "Remotion turned Claude Code into a video…" https://www.reddit.com/r/ClaudeAI/comments/1qkbbyv/remotion_turned_claude_code_into_a_video/ — an evaluation doc says a commenter alleged some X showcases were After Effects; UNVERIFIED, no prompts. https://raw.githubusercontent.com/FlorianBruniaux/claude-code-ultimate-guide/693d97d284ea342c8c8fb13894df0cee26d3a3d3/docs/resource-evaluations/remotion-claude-code-video.md
- Remotion's agent rules install with `npx skills add remotion-dev/skills`; this repo already has them under `setup/.claude/skills/` (VERIFIED locally).

### 1.2 2D alternative: SVG/CSS puppet

- Technique (VERIFIED: https://jvinhit.github.io/blog/svg-23-character-rigging/ + CSS penguin tutorial https://learnhowto.vercel.app/blog/css/mastering-css-transforms-a-step-by-step-guide-to-building-an-animated-penguin): nested `<g>` per joint, `transform-origin` at the joint (`transform-box: fill-box` or absolute px origins; browsers are inconsistent on SVG origins), legs half a period apart, arms counter-swing, body bob. In Remotion write transform strings from `useCurrentFrame()`; no CSS keyframes.
- Cost: front-view blocky puppet ≈ 80 lines SVG + 30 lines math; ~0.05 s/frame; no WebGL, no `--gl`, works on Lambda/GH Actions. Quality: flat, no lighting/parallax; 3/4 views need separate drawings, cannot orbit.
- Prefer 2D when the character is a reacting mascot in a corner of a caption-heavy explainer, or there is no GPU budget. Prefer 3D (this prototype) when shots need push-ins/orbits, shadows, rim light, or turning.

### 1.3 Model pipelines compared

| Pipeline | Effort | Quality ceiling | Risk in Remotion |
|---|---|---|---|
| Procedural box rig (this prototype) | 1 file, no tools | Clean stylized boxes only | None: no loading, deterministic |
| MagicaVoxel → .vox → `VOXLoader` (`three/addons/loaders/VOXLoader.js`, `loader.loadAsync(url)` → `result.scene.children[0]`; VERIFIED https://threejs.org/docs/pages/VOXLoader.html) | Model in MagicaVoxel | Rich voxel detail; vertex colors only, no UVs, emissive voxels ignored (three forum, VERIFIED) | Wrap in `delayRender`/`continueRender` + `staticFile()` (VERIFIED pattern https://www.remotion.dev/docs/delay-render); no skeleton → split per limb and group |
| Blockbench → GLB → drei `useGLTF`+`useAnimations` ("Export Animations" checkbox, single root bone, groups = pivots; VERIFIED https://forum.defold.com/t/blockbench-animation-guide/82193; `gltfjsx` converts to JSX https://github.com/pmndrs/gltfjsx) | Model + keyframes in Blockbench | Best silhouette/texture control | Clips are time-based: `mixer.setTime(frame/fps)` each frame, never `action.play()` (standard three practice, UNVERIFIED in Remotion); needs `delayRender`; GLB in `public/` |

Alt vox loaders `threejs-vox-loader` (GPL-3), `@divnotes/dn-voxel-loader` (R3F example) — UNVERIFIED.

### 1.4 Visual references

"What if"/curiosity short-form:
- **What If (Underknown)** — Webby 2020 Best Science & Education; TV adaptation by Thunderbird; one hypothetical per video, narrator. VERIFIED https://shortyawards.com/13th/the-what-if-show, https://cartt.ca/thunderbird-turning-web-hit-what-if-into-a-tv-series/
- **Zack D. Films** — "20-45 second 3D clips", in-house 3D generalist; "realistic setup with crazy, unexpected endings"; curiosity gap to the last second. Format VERIFIED from hiring pages https://quickdrawanimation.ca/opportunities/job-postings/zack-d-films-animator-wanted, https://zackdfilms.recruitee.com/o/3d-generalist/c/new; 25M-sub figures are freelancer claims (UNVERIFIED).
- **HisStory** (first-person 3D story shorts; style reference in multiple gigs) — UNVERIFIED. https://fiverr.com/tevonedits/create-hisstory-style-3d-shorts
- **Baseplate / Studby** (Roblox-style faceless story shorts) — UNVERIFIED. https://fiverr.com/vhiejay/make-you-simple-roblox-animation
- **Kurzgesagt** — long-form gold standard for "what if" framing (existence VERIFIED only).
- **what.if.lab** (named as style reference by BinhL3's skill) — UNVERIFIED, account not found.
- Retention (vendor blogs, loose): hook in first 1–3 s, new visual beat every 5–7 s, 20–35 s for story shorts, 80 % retention at 3 s. https://opus.pro/blog/ideal-youtube-shorts-length-format-retention, https://subscribr.ai/p/perfect-youtube-short-length-structure-hooks, https://www.gofaceless.ai/en/blog/high-retention-youtube-shorts-attributes

Blocky-character channels:
- **Black Plasma Studios** — biggest Minecraft animation channel; "Animation Life: Full Movie" 205M views (VERIFIED https://podcastle.ai/blog/best-minecraft-youtubers). Look: Blender, long shadows, rim light, low heroic camera, cuts on impacts.
- **Alan Becker — Animation vs. Minecraft** (since 2014, VERIFIED https://www.pcgamesn.com/minecraft/youtubers-best). Look: 2D stick figures in a block world, snappy 8–12 frame poses, impact smears.
- **Element Animation (Villager News)** — UNVERIFIED (no source found). **BigSchool** (6.4M subs claim, UNVERIFIED), **TrueMU**.
- Common denominators to copy: rim light + dark background so the silhouette pops; camera just under eye line; one pose change per cut (no mid-shot blending); faces = 2–3 flat shapes readable at 400 px; holds with creeping push-in.

### 1.5 Scene grammar for POV drama (synthesized from mromidev SKILL.md + BinhL3 scenes.md, both VERIFIED)

- Shots 2–4 s; hard cut on location/time jumps; one smootherstep glide (18–40 f) per shot.
- Every hold creeps: push 0.15–0.35 %/frame (0.6 %/frame on the punch word); orbit 10–20°/shot; 4–5° roll on tension.
- Impact: shake flipping sign every frame, decaying over 7 frames; 2-frame white flash after the hook.
- Title: "WHAT IF" 900-weight white with heavy shadow + one-line orange premise; in 0.2/0.6 s, out by 3.7 s. Captions ≤ 6 words, never describing what is visible.
- Sound: block-step tick per foot plant (every ~19 frames at 1.6 steps/s @60 fps), low thud + riser ending on the reveal snap, soft pop on the point. CC0: Kenney Impact Sounds (claim via https://gtstu.com/?p=5011, verify on kenney.nl), OpenGameArt CC0 footsteps https://opengameart.org/content/footstep-sounds, https://opengameart.org/content/100-cc0-sfx-2. Both skill repos synthesize SFX in Python to dodge licensing.

---

## 2. Prototype — what was built and what happened

Composition `QrosityScene`: 1080×1920, 60 fps, 360 frames. Default props play 4 beats via `<Sequence layout="none">`: idle (0–1.5 s) → walk (1.5–3) → point (3–4.5) → shocked (4.5–6), title "WHAT IF / you fell into a volcano?", camera 9.2 → 7.0 m push-in with 12.6° orbit, height 1.6 → 1.9.

### Commands run and results

```bash
npm i remotion@4.0.540 @remotion/cli@4.0.540 @remotion/three@4.0.540 three@0.187.0 @react-three/fiber@9.8.2 react@19.1.0 react-dom@19.1.0 zod@4
npm i -D typescript @types/react @types/react-dom @types/three
npx tsc --noEmit                                   # clean
export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers   # harmless; Remotion used its own headless shell

# config had setChromiumOpenGlRenderer("angle"):
npx remotion still src/index.ts QrosityScene out/idle_f90.png --frame 90
#  -> THREE.WebGLRenderer: Error creating WebGL context.   (no GPU)
npx remotion still ... --gl=swangle      # OK, 6.4 s wall incl. bundle
npx remotion still ... --gl=swiftshader  # same WebGL error
npx remotion still ... --gl=egl          # same WebGL error
# fix: setChromiumOpenGlRenderer(process.env.REMOTION_GL === "angle" ? "angle" : "swangle")

for f in 40 130 220 300; do npx remotion still src/index.ts QrosityScene out/v5_f$f.png --frame $f; done
#  -> 7.4 / 5.1 / 5.4 / 6.8 s wall each (5 iteration rounds v1..v5; sheets via Pillow)

npx remotion render src/index.ts QrosityScene out/qrosity_1s.mp4    --frames=0-59  --codec=h264 --crf=18 --concurrency=2  # 22.6 s
npx remotion render src/index.ts QrosityScene out/qrosity_3s.mp4    --frames=0-179 --codec=h264 --crf=18 --concurrency=2  # 69.1 s, 1.1 MB
npx remotion render src/index.ts QrosityScene out/qrosity_3s_c4.mp4 --frames=0-179 --codec=h264 --crf=18 --concurrency=4  # 64.2 s
ffprobe out/qrosity_3s.mp4   # h264, 1080x1920, r_frame_rate=60/1, nb_frames=180, duration=3.000000
```

**Per-frame render time:** (69.1 − 22.6) s / 120 = **0.39 s/frame @ concurrency 2**, **0.36 s/frame @ concurrency 4** (SwiftShader is CPU-bound; more tabs barely help). Bundle + browser start ≈ 3–5 s.

### Errors hit and fixes (in order)
1. WebGL context error with `angle`/`swiftshader`/`egl` → `swangle`.
2. Camera too close (fov 32 @ 5.6 m shows exactly 3.2 m = the character): title on the head → 9.2 m, fov 36, lookAt y 1.7 → feet at 78 %, head top at 23 %.
3. Hair fringe overlapped eye tops → hair ≥ 0.62·HEAD, eyes at 0.46·HEAD.
4. "?" emblem from 3 boxes read as "h" → 5-box `QuestionMark`.
5. `point` arm aimed at the lens foreshortened into a fist over the face → Euler `[0.6, 0, 2.0]` (up-right-forward).
6. `shocked` pitched head back; low camera saw the head's underside → chin down +0.05, lean −0.05, arms out+up.
7. Arms vanished inside the torso → sign rule: outward = negative z for the LEFT arm, positive z for the RIGHT (Euler XYZ, `v' = Rx(Ry(Rz(v)))`). Applied to idle/walk too.
8. `--log=verbose` floods a React layout-effect stack when WebGL fails; grep `Error` for the real message.

### What the final stills look like (v5; copied as `research/qrosity-character/stills/*.png`)
- **idle_f40:** full-body Q centered, feet ~78 %, title crisp above with clear space; warm key from upper-right throws a soft diagonal head shadow on the hoodie; orange rim on right arm and shoe; cool fill left; dark blue fog; outline reads as a 2 px ink line; slabs + 3 cubes give depth; eyes/brows/mouth read at phone size.
- **walk_f130:** right leg forward, arms counter-swung, torso leaned; sole flash on the front shoe; title still up.
- **point_f220:** right arm up-right-forward, brows raised, head turned to lens; title at 40 % on its way out; face uncovered.
- **shocked_f300:** arms thrown out+up to the frame edges, mouth wide, brows high, small hop, head level; push-in has him at ~70 % frame height.
- **qrosity_3s_60fps.mp4:** smooth push-in + orbit, breathing and blink visible, no flicker.

### Still weak
- Hair is a thick helmet cap (needs a second tone / notches); no neck, no hands/fingers.
- Faint stipple in PCFSoft shadows on SwiftShader (cleaner on GPU, or use `PCFShadowMap` + `shadow.radius`).
- Eye-white decal's 12 mm edge shows as a thin light strip when the head yaws (use 6 mm decals or a canvas-texture face).
- Environment is placeholder slabs/cubes; walk is a treadmill; no sound, captions or beat-sheet file yet.
- `angle` on a real GPU untested this session.

---

## 3. Full source (type-checked, rendered)

### `package.json`
```json
{
  "name": "qrosity-blocky",
  "version": "0.1.0",
  "private": true,
  "scripts": { "studio": "remotion studio", "render": "remotion render", "still": "remotion still" },
  "dependencies": {
    "@react-three/fiber": "^9.8.2",
    "@remotion/cli": "^4.0.540",
    "@remotion/three": "^4.0.540",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "remotion": "^4.0.540",
    "three": "^0.187.0",
    "zod": "^4.6.7"
  },
  "devDependencies": {
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "@types/three": "^0.187.0",
    "typescript": "^7.0.2"
  }
}
```

### `remotion.config.ts`
```ts
import { Config } from "@remotion/cli/config";

// Three.js needs ANGLE (or swangle without GPU). See https://www.remotion.dev/docs/gl-options
// "angle" on a desktop with a GPU; "swangle" (SwiftShader-ANGLE) on a machine with no GPU (this box, CI, Lambda).
Config.setChromiumOpenGlRenderer(process.env.REMOTION_GL === "angle" ? "angle" : "swangle");
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setConcurrency(2);
```

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022", "module": "ESNext", "moduleResolution": "Bundler", "jsx": "react-jsx",
    "strict": true, "esModuleInterop": true, "skipLibCheck": true, "noEmit": true, "lib": ["DOM", "ES2022"]
  },
  "include": ["src"]
}
```

### `src/index.ts`
```ts
import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
```

### `src/Root.tsx`
```tsx
import React from "react";
import { Composition } from "remotion";
import { Scene, sceneSchema } from "./Scene";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="QrosityScene"
        component={Scene}
        schema={sceneSchema}
        defaultProps={{
          title: "WHAT IF",
          subtitle: "you fell into a volcano?",
          pose: "auto",
        }}
        width={1080}
        height={1920}
        fps={60}
        durationInFrames={6 * 60}
      />
    </>
  );
};
```

### `src/BlockyCharacter.tsx`
```tsx
import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";

/**
 * "Q" — the Q-ROSITY mascot. An ORIGINAL procedural box-limb humanoid.
 * No external assets. Every rotation is a pure function of `frame`, so renders are
 * deterministic (Remotion renders frames in parallel tabs; never use clocks/useFrame).
 *
 * Units: meters. Origin = between the feet, facing +Z.
 * Proportions (chibi, 4.2 heads tall so the face reads on a phone):
 *   head 0.95 cube • torso 0.9w×1.1h×0.5d • arms 0.32w×1.05h • legs 0.4w×0.95h
 */

export type Pose = "idle" | "walk" | "point" | "shocked";

export type BlockyCharacterProps = {
  pose: Pose;
  /** World-space point the head looks at (clamped to a natural range). */
  lookAt?: [number, number, number];
  /** Position of the character (feet center). */
  position?: [number, number, number];
  /** Yaw in radians (0 = facing +Z toward the default camera). */
  rotationY?: number;
  /** Frame offset so two characters don't move in sync. */
  seed?: number;
  /** Override palette. */
  palette?: Partial<typeof DEFAULT_PALETTE>;
  /** Outline thickness in meters (0 disables the inverted-hull outline). */
  outline?: number;
};

export const DEFAULT_PALETTE = {
  skin: "#e8b48a",
  hair: "#2a1f1e",
  hoodie: "#1fb6a6", // teal hoodie
  hoodieDark: "#15857a",
  accent: "#ff7a1a", // orange drawstrings / emblem
  pants: "#2b2f4a",
  shoes: "#f4f1ea",
  shoeSole: "#ff7a1a",
  eye: "#1a1a1a",
  eyeWhite: "#ffffff",
  mouth: "#7a2e2e",
  outline: "#101418",
};

// Dimensions
const HEAD = 0.95;
const TORSO = { w: 0.9, h: 1.1, d: 0.5 };
const ARM = { w: 0.32, h: 1.05, d: 0.32 };
const LEG = { w: 0.4, h: 0.95, d: 0.42 };
const HIP_Y = LEG.h; // top of legs
const SHOULDER_Y = HIP_Y + TORSO.h - 0.08;
const NECK_Y = HIP_Y + TORSO.h;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

/** Box with an inverted-hull outline (a slightly larger BackSide black box). */
const Box: React.FC<{
  size: [number, number, number];
  position?: [number, number, number];
  color: string;
  outline: number;
  castShadow?: boolean;
  roughness?: number;
}> = ({ size, position = [0, 0, 0], color, outline, castShadow = true, roughness = 0.85 }) => {
  return (
    <group position={position}>
      <mesh castShadow={castShadow} receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={roughness} metalness={0} />
      </mesh>
      {outline > 0 ? (
        <mesh scale={[1 + outline / size[0], 1 + outline / size[1], 1 + outline / size[2]]}>
          <boxGeometry args={size} />
          <meshBasicMaterial color={DEFAULT_PALETTE.outline} side={THREE.BackSide} />
        </mesh>
      ) : null}
    </group>
  );
};

/** Flat decal: a 12 mm-thin box pushed 6–8 mm off a face so it never z-fights. */
const Decal: React.FC<{
  size: [number, number];
  position: [number, number, number];
  color: string;
}> = ({ size, position, color }) => (
  <mesh position={position}>
    <boxGeometry args={[size[0], size[1], 0.012]} />
    <meshStandardMaterial color={color} roughness={1} metalness={0} />
  </mesh>
);

/** A "?" built from 5 boxes. (x,y) = center; s = glyph height. */
const QuestionMark: React.FC<{ x: number; y: number; z: number; s: number; color: string }> = ({ x, y, z, s, color }) => {
  const t = s * 0.16; // stroke
  return (
    <group position={[x, y, z]}>
      <Decal size={[s * 0.6, t]} position={[0, s * 0.42, 0]} color={color} />          {/* top bar */}
      <Decal size={[t, s * 0.34]} position={[s * 0.3 - t / 2, s * 0.22, 0]} color={color} /> {/* right side */}
      <Decal size={[s * 0.45, t]} position={[s * 0.08, s * 0.05, 0]} color={color} />      {/* middle bar */}
      <Decal size={[t, s * 0.22]} position={[0, -s * 0.1, 0]} color={color} />            {/* stem */}
      <Decal size={[t * 1.1, t * 1.1]} position={[0, -s * 0.42, 0]} color={color} />      {/* dot */}
    </group>
  );
};

type Rig = {
  bob: number; // body vertical offset
  lean: number; // torso pitch
  twist: number; // torso yaw
  lArm: [number, number, number]; // rotation xyz at shoulder
  rArm: [number, number, number];
  lLeg: number; // rotation x at hip
  rLeg: number;
  headPitch: number;
  headYaw: number;
  headRoll: number;
  browRaise: number; // 0..1
  mouthOpen: number; // 0..1
  breathe: number; // torso scale pulse
};

function computeRig(pose: Pose, frame: number, fps: number, seed: number): Rig {
  const t = (frame + seed) / fps; // seconds
  const breathe = 1 + 0.015 * Math.sin(t * 2 * Math.PI * 0.35);
  const base: Rig = {
    bob: 0,
    lean: 0,
    twist: 0,
    // Sign rule: outward = NEGATIVE z for the left arm (at -x), POSITIVE z for the right arm.
    lArm: [0.05, 0, -0.08],
    rArm: [0.05, 0, 0.08],
    lLeg: 0,
    rLeg: 0,
    headPitch: 0,
    headYaw: 0,
    headRoll: 0,
    browRaise: 0,
    mouthOpen: 0,
    breathe,
  };

  switch (pose) {
    case "idle": {
      const sway = Math.sin(t * 2 * Math.PI * 0.35);
      return {
        ...base,
        bob: 0.01 * sway,
        lArm: [0.06 + 0.03 * sway, 0, -0.1],
        rArm: [0.06 - 0.03 * sway, 0, 0.1],
        headYaw: 0.05 * Math.sin(t * 0.7),
        headRoll: 0.02 * Math.sin(t * 0.5 + 1),
      };
    }
    case "walk": {
      const cycle = t * 2 * Math.PI * 1.6; // 1.6 steps/sec
      const s = Math.sin(cycle);
      const swing = 0.6;
      return {
        ...base,
        bob: 0.04 * Math.abs(Math.cos(cycle)),
        lean: 0.08,
        twist: 0.08 * s,
        lLeg: swing * s,
        rLeg: -swing * s,
        lArm: [-swing * 0.8 * s, 0, -0.12],
        rArm: [swing * 0.8 * s, 0, 0.12],
        headPitch: 0.03 * Math.sin(cycle * 2),
        headRoll: 0.03 * s,
      };
    }
    case "point": {
      // Right arm raises over 0.35 s, then holds with a slight tremor.
      const k = smooth(clamp((frame - 0) / (fps * 0.35), 0, 1));
      const hold = 0.02 * Math.sin(t * 9);
      return {
        ...base,
        lean: -0.04 * k,
        twist: -0.18 * k,
        // Euler XYZ = Rx(Ry(Rz(v))): z swings the arm outward+up first, then +x tilts it forward.
        // Result ≈ (0.9, 0.35, 0.25): up-right-forward, never foreshortened into a fist at the lens.
        rArm: [0.6 * k + hold, 0, -0.1 * (1 - k) + 2.0 * k],
        lArm: [0.1, 0, -0.14],
        headYaw: -0.1 * k,
        browRaise: 0.5 * k,
        mouthOpen: 0.25 * k,
      };
    }
    case "shocked": {
      // Jump back + arms up in 8 frames, then settle with a hold.
      const k = smooth(clamp(frame / (fps * 0.13), 0, 1));
      const settle = Math.exp(-frame / (fps * 0.4)) * Math.sin(frame * 0.9);
      const jump = Math.sin(clamp(frame / (fps * 0.3), 0, 1) * Math.PI) * 0.12;
      return {
        ...base,
        bob: jump,
        lean: -0.05 * k + 0.03 * settle,
        // Arms thrown out+up (≈ (0.9, 0.45, 0.1)): reads as "shock" and never covers the face.
        lArm: [-2.9 * k, 0, -1.1 * k],
        rArm: [-2.9 * k, 0, 1.1 * k],
        lLeg: -0.3 * k,
        rLeg: 0.25 * k,
        headPitch: 0.05 * k, // chin slightly down: a low camera must never see the head's underside
        browRaise: 1 * k,
        mouthOpen: 1 * k,
      };
    }
  }
}

export const BlockyCharacter: React.FC<BlockyCharacterProps> = ({
  pose,
  lookAt,
  position = [0, 0, 0],
  rotationY = 0,
  seed = 0,
  palette,
  outline = 0.035,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const P = { ...DEFAULT_PALETTE, ...palette };
  const rig = computeRig(pose, frame, fps, seed);

  // Head look-at: convert world target to local yaw/pitch, clamp to natural range.
  const look = useMemo(() => {
    if (!lookAt) return { yaw: 0, pitch: 0 };
    const headWorld = new THREE.Vector3(position[0], position[1] + NECK_Y + HEAD / 2, position[2]);
    const dir = new THREE.Vector3(...lookAt).sub(headWorld);
    const yaw = Math.atan2(dir.x, dir.z) - rotationY;
    const pitch = -Math.atan2(dir.y, Math.hypot(dir.x, dir.z));
    return { yaw: clamp(yaw, -1.0, 1.0), pitch: clamp(pitch, -0.6, 0.6) };
  }, [lookAt, position, rotationY]);

  // Blink: every ~3.1 s (seed-shifted), closed for 4 frames. Deterministic in frame.
  const blinkPeriod = Math.round(fps * 3.1);
  const bf = (frame + seed * 7 + Math.round(fps * 1.3)) % blinkPeriod;
  const blink = bf < 4 ? 0.12 : 1;
  const pupilX = clamp(look.yaw * 0.08, -0.04, 0.04);
  const pupilY = clamp(-look.pitch * 0.06, -0.03, 0.03);

  const o = outline;
  const faceZ = HEAD / 2 + 0.008; // decals sit 8 mm in front of the face

  return (
    <group position={[position[0], position[1] + rig.bob, position[2]]} rotation={[0, rotationY, 0]}>
      {/* LEGS: pivot at hip */}
      <group position={[-LEG.w / 2 - 0.02, HIP_Y, 0]} rotation={[rig.lLeg, 0, 0]}>
        <Box size={[LEG.w, LEG.h - 0.3, LEG.d]} position={[0, -(LEG.h - 0.3) / 2, 0]} color={P.pants} outline={o} />
        <Box size={[LEG.w + 0.04, 0.3, LEG.d + 0.12]} position={[0, -LEG.h + 0.15, 0.04]} color={P.shoes} outline={o} />
        <Decal size={[LEG.w + 0.05, 0.08]} position={[0, -LEG.h + 0.05, LEG.d / 2 + 0.065]} color={P.shoeSole} />
      </group>
      <group position={[LEG.w / 2 + 0.02, HIP_Y, 0]} rotation={[rig.rLeg, 0, 0]}>
        <Box size={[LEG.w, LEG.h - 0.3, LEG.d]} position={[0, -(LEG.h - 0.3) / 2, 0]} color={P.pants} outline={o} />
        <Box size={[LEG.w + 0.04, 0.3, LEG.d + 0.12]} position={[0, -LEG.h + 0.15, 0.04]} color={P.shoes} outline={o} />
        <Decal size={[LEG.w + 0.05, 0.08]} position={[0, -LEG.h + 0.05, LEG.d / 2 + 0.065]} color={P.shoeSole} />
      </group>

      {/* TORSO: pivot at hip, breathing scale */}
      <group position={[0, HIP_Y, 0]} rotation={[rig.lean, rig.twist, 0]}>
        <group scale={[rig.breathe, 1, rig.breathe]}>
          <Box size={[TORSO.w, TORSO.h, TORSO.d]} position={[0, TORSO.h / 2, 0]} color={P.hoodie} outline={o} />
          {/* hoodie pocket + drawstrings + "?" emblem */}
          <Decal size={[0.6, 0.28]} position={[0, 0.3, TORSO.d / 2 + 0.006]} color={P.hoodieDark} />
          <Decal size={[0.05, 0.4]} position={[-0.14, TORSO.h - 0.3, TORSO.d / 2 + 0.006]} color={P.accent} />
          <Decal size={[0.05, 0.4]} position={[0.14, TORSO.h - 0.3, TORSO.d / 2 + 0.006]} color={P.accent} />
          <QuestionMark x={0.27} y={0.62} z={TORSO.d / 2 + 0.006} s={0.42} color={P.accent} />
        </group>

        {/* ARMS: pivot at shoulder (top of arm) */}
        <group position={[-(TORSO.w / 2 + ARM.w / 2 + 0.01), SHOULDER_Y - HIP_Y, 0]} rotation={rig.lArm}>
          <Box size={[ARM.w, ARM.h * 0.7, ARM.d]} position={[0, -ARM.h * 0.35, 0]} color={P.hoodie} outline={o} />
          <Box size={[ARM.w - 0.04, ARM.h * 0.3, ARM.d - 0.04]} position={[0, -ARM.h * 0.85, 0]} color={P.skin} outline={o} />
        </group>
        <group position={[TORSO.w / 2 + ARM.w / 2 + 0.01, SHOULDER_Y - HIP_Y, 0]} rotation={rig.rArm}>
          <Box size={[ARM.w, ARM.h * 0.7, ARM.d]} position={[0, -ARM.h * 0.35, 0]} color={P.hoodie} outline={o} />
          <Box size={[ARM.w - 0.04, ARM.h * 0.3, ARM.d - 0.04]} position={[0, -ARM.h * 0.85, 0]} color={P.skin} outline={o} />
        </group>

        {/* HEAD: pivot at neck */}
        <group
          position={[0, NECK_Y - HIP_Y, 0]}
          rotation={[rig.headPitch + look.pitch, rig.headYaw + look.yaw, rig.headRoll]}
        >
          <Box size={[HEAD, HEAD, HEAD]} position={[0, HEAD / 2, 0]} color={P.skin} outline={o} />
          {/* hair: cap, front fringe, side locks (all above the eye line) */}
          <Box size={[HEAD + 0.06, 0.26, HEAD + 0.06]} position={[0, HEAD - 0.1, 0]} color={P.hair} outline={o} castShadow={false} />
          <Box size={[HEAD + 0.06, 0.16, 0.12]} position={[0, HEAD - 0.31, HEAD / 2 - 0.03]} color={P.hair} outline={o} castShadow={false} />
          <Box size={[0.12, 0.42, HEAD + 0.06]} position={[-(HEAD / 2), HEAD - 0.44, 0]} color={P.hair} outline={o} castShadow={false} />
          <Box size={[0.12, 0.42, HEAD + 0.06]} position={[HEAD / 2, HEAD - 0.44, 0]} color={P.hair} outline={o} castShadow={false} />

          {/* eyes: white + pupil (pupils offset toward look direction), blink = squash */}
          <group scale={[1, blink, 1]} position={[0, HEAD * 0.46, 0]}>
            <Decal size={[0.2, 0.2]} position={[-0.22, 0, faceZ]} color={P.eyeWhite} />
            <Decal size={[0.2, 0.2]} position={[0.22, 0, faceZ]} color={P.eyeWhite} />
            <Decal size={[0.1, 0.12]} position={[-0.22 + pupilX, -0.01 + pupilY, faceZ + 0.006]} color={P.eye} />
            <Decal size={[0.1, 0.12]} position={[0.22 + pupilX, -0.01 + pupilY, faceZ + 0.006]} color={P.eye} />
          </group>
          {/* brows: raise with emotion */}
          <Decal size={[0.24, 0.05]} position={[-0.22, HEAD * 0.46 + 0.16 + 0.07 * rig.browRaise, faceZ]} color={P.hair} />
          <Decal size={[0.24, 0.05]} position={[0.22, HEAD * 0.46 + 0.16 + 0.07 * rig.browRaise, faceZ]} color={P.hair} />
          {/* mouth */}
          <Decal
            size={[0.18 + 0.1 * rig.mouthOpen, 0.04 + 0.2 * rig.mouthOpen]}
            position={[0, HEAD * 0.2 - 0.06 * rig.mouthOpen, faceZ]}
            color={P.mouth}
          />
        </group>
      </group>
    </group>
  );
};

/** Height of the character's eye line, useful for camera framing. */
export const CHARACTER_EYE_Y = NECK_Y + HEAD * 0.5;
export const CHARACTER_HEIGHT = NECK_Y + HEAD + 0.1;
```

### `src/Scene.tsx`
```tsx
import React, { useLayoutEffect, useMemo, useRef } from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { z } from "zod";
import { BlockyCharacter, type Pose } from "./BlockyCharacter";

export const sceneSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  /** "auto" plays the 4-beat demo timeline: idle → walk → point → shocked. */
  pose: z.enum(["auto", "idle", "walk", "point", "shocked"]),
});
export type SceneProps = z.infer<typeof sceneSchema>;

/**
 * Camera driven purely by frame: slow push-in + 12° orbit, low angle for drama.
 * Setting the camera inside useLayoutEffect (keyed on frame) is deterministic:
 * ThreeCanvas re-renders the scene once per Remotion frame.
 */
const CameraRig: React.FC<{ target: [number, number, number] }> = ({ target }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;

  const t = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  // 9:16 framing: vertical fov 36° at 9.5 m shows ~6.2 m of height, so the 3.3 m character
  // takes ~55% of the frame at the start and ~70% after the push-in.
  const radius = interpolate(t, [0, 1], [9.2, 7.0]); // slow push-in
  const angle = interpolate(t, [0, 1], [-0.3, -0.08]); // orbit ~12.6°
  const height = interpolate(t, [0, 1], [1.6, 1.9]); // just below the eye line = slight hero angle

  useLayoutEffect(() => {
    camera.position.set(Math.sin(angle) * radius, height, Math.cos(angle) * radius);
    camera.lookAt(target[0], target[1], target[2]);
    camera.fov = 36; // vertical fov; in 9:16 the horizontal half-angle is only ~10°
    camera.near = 0.1;
    camera.far = 100;
    camera.updateProjectionMatrix();
  }, [camera, angle, radius, height, target, frame]);

  return null;
};

/** Ground: a dark plane plus a loose grid of slightly raised tiles for parallax. */
const Ground: React.FC = () => {
  const tiles = useMemo(() => {
    const out: { x: number; z: number; c: string; h: number }[] = [];
    let s = 1;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647); // deterministic
    for (let i = -6; i <= 6; i++) {
      for (let j = -6; j <= 6; j++) {
        const r = rnd();
        if (r < 0.22) {
          const shade = 0.78 + rnd() * 0.22;
          out.push({ x: i * 1.0, z: j * 1.0, h: 0.02 + rnd() * 0.05, c: new THREE.Color(0x3a4a5a).multiplyScalar(shade).getStyle() });
        }
      }
    }
    return out;
  }, []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#2f3d4c" roughness={1} metalness={0} />
      </mesh>
      {/* a few big blocks for depth/parallax; never between camera and character */}
      {[
        { p: [-3.2, 0.5, -2.5] as const, s: 1.0, c: "#3d5166" },
        { p: [3.6, 0.75, -4.5] as const, s: 1.5, c: "#46586b" },
        { p: [-4.5, 1.0, -6] as const, s: 2.0, c: "#34434f" },
        { p: [2.4, 0.25, -1.6] as const, s: 0.5, c: "#4b5f73" },
      ].map((b, i) => (
        <mesh key={`b${i}`} position={[b.p[0], b.p[1], b.p[2]]} castShadow receiveShadow>
          <boxGeometry args={[b.s, b.s, b.s]} />
          <meshStandardMaterial color={b.c} roughness={1} metalness={0} />
        </mesh>
      ))}
      {tiles.map((tl, i) => (
        <mesh key={i} position={[tl.x, tl.h / 2, tl.z]} receiveShadow castShadow>
          <boxGeometry args={[0.96, tl.h, 0.96]} />
          <meshStandardMaterial color={tl.c} roughness={1} metalness={0} />
        </mesh>
      ))}
    </group>
  );
};

/** 3-point lighting that reads on a phone: warm key w/ soft shadows, cool fill, strong rim. */
const Lights: React.FC = () => {
  const key = useRef<THREE.DirectionalLight>(null);
  useLayoutEffect(() => {
    if (key.current) {
      key.current.shadow.mapSize.set(2048, 2048);
      key.current.shadow.camera.left = -6;
      key.current.shadow.camera.right = 6;
      key.current.shadow.camera.top = 6;
      key.current.shadow.camera.bottom = -6;
      key.current.shadow.camera.near = 1;
      key.current.shadow.camera.far = 30;
      key.current.shadow.bias = -0.0008;
      key.current.shadow.normalBias = 0.02;
      key.current.shadow.radius = 4;
    }
  }, []);
  return (
    <>
      <hemisphereLight args={["#bcd3ff", "#2a2420", 0.9]} />
      <directionalLight ref={key} position={[4, 7, 5]} intensity={3.2} color="#fff1dc" castShadow />
      <directionalLight position={[-6, 3, 2]} intensity={0.8} color="#7fb0ff" />
      <directionalLight position={[-2, 4, -6]} intensity={2.4} color="#ff9a5c" />
    </>
  );
};

export const Scene: React.FC<SceneProps> = ({ title, subtitle, pose }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  // Title card timing: title in at 0.2 s, subtitle at 0.6 s.
  const titleIn = interpolate(frame, [fps * 0.2, fps * 0.55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const subIn = interpolate(frame, [fps * 0.6, fps * 0.95], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  // Title card leaves at 3.5 s so the push-in can bring the face up into the top third.
  const titleOut = interpolate(frame, [fps * 3.3, fps * 3.7], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const BEATS: { pose: Pose; from: number; dur: number }[] = [
    { pose: "idle", from: 0, dur: fps * 1.5 },
    { pose: "walk", from: fps * 1.5, dur: fps * 1.5 },
    { pose: "point", from: fps * 3, dur: fps * 1.5 },
    { pose: "shocked", from: fps * 4.5, dur: fps * 1.5 },
  ];

  // Look slightly above chest height: puts the feet at ~78% and the head top at ~23% of frame height.
  const target: [number, number, number] = [0, 1.7, 0];

  return (
    <AbsoluteFill style={{ background: "linear-gradient(#0d1420 0%, #1b2a3b 60%, #2f3d4c 100%)" }}>
      <ThreeCanvas
        width={width}
        height={height}
        dpr={1}
        shadows={{ type: THREE.PCFSoftShadowMap }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
        camera={{ fov: 36, near: 0.1, far: 100, position: [0, 1.4, 9.5] }}
        style={{ position: "absolute", inset: 0 }}
      >
        <color attach="background" args={["#16222f"]} />
        <fog attach="fog" args={["#16222f", 9, 24]} />
        <CameraRig target={target} />
        <Lights />
        <Ground />
        {pose === "auto" ? (
          BEATS.map((b) => (
            // layout="none": a <Sequence> inside ThreeCanvas must not render a <div>.
            // Each beat gets a local frame (0 at beat start) so pose ramps start cleanly.
            <Sequence key={b.pose} from={b.from} durationInFrames={b.dur} layout="none">
              <BlockyCharacter pose={b.pose} lookAt={[1.5, 2.2, 8]} />
            </Sequence>
          ))
        ) : (
          <BlockyCharacter pose={pose} lookAt={[1.5, 2.2, 8]} />
        )}
      </ThreeCanvas>

      {/* Title card (HTML stays razor sharp over the 3D) */}
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 150, opacity: titleOut }}>
        <div
          style={{
            fontFamily: "Inter, 'Helvetica Neue', Arial, sans-serif",
            fontWeight: 900,
            fontSize: 140,
            letterSpacing: -4,
            color: "#fff",
            textShadow: "0 8px 30px rgba(0,0,0,.6), 0 0 2px #000",
            opacity: titleIn,
            transform: `translateY(${(1 - titleIn) * 40}px)`,
            lineHeight: 1,
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 20,
            fontFamily: "Inter, 'Helvetica Neue', Arial, sans-serif",
            fontWeight: 700,
            fontSize: 64,
            color: "#ffb15c",
            textShadow: "0 6px 24px rgba(0,0,0,.7)",
            opacity: subIn,
            transform: `translateY(${(1 - subIn) * 30}px)`,
            textAlign: "center",
            maxWidth: 900,
            lineHeight: 1.15,
          }}
        >
          {subtitle}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```

---

## 4. `qrosity-character/SKILL.md` (draft for Claude Code; also at `research/qrosity-character/SKILL.md`)

Install at `.claude/skills/qrosity-character/SKILL.md` in the video repo (or `~/.claude/skills/`).

````markdown
---
name: qrosity-character
description: Build Q-ROSITY "what if…" curiosity reels (1080×1920, 60 fps, 30–60 s) in Remotion + @remotion/three with "Q", an ORIGINAL procedural box-limb character (no assets, no Minecraft/Roblox trademarks). Use whenever someone asks for a Q-ROSITY reel, a blocky/voxel character scene, a "what if" POV short in code, or to revise/re-render one. Covers the rig API, camera grammar for 9:16, lighting, pose timing, still-check loop, render flags and the things that break.
---

# Q-ROSITY character skill

Q is a 3.3 m-tall (scene units) chibi box humanoid: teal hoodie with orange drawstrings and a boxy "?" emblem, navy pants, white sneakers with orange soles, tan skin, dark hair cap. Built from `<boxGeometry>` only with an inverted-hull outline, so it renders identically everywhere and needs no model files. Everything moves as a pure function of `useCurrentFrame()`.

Source of truth: `src/BlockyCharacter.tsx` (rig) and `src/Scene.tsx` (camera, lights, ground, title card). Never fork the rig per video; add poses to `computeRig()`.

## Workflow (every video)
1. **Beat sheet first.** 8–16 beats of 2–4 s, one visual idea + one caption per beat, hook in beat 1 ("WHAT IF" title + one-line premise), payoff in the last beat. Write it as a `BEATS` array (`{id, pose, from, dur, caption, camera}`) in `src/beats.ts`; picture, captions and SFX all read it.
2. **One `<Sequence layout="none">` per beat inside `<ThreeCanvas>`.** `layout="none"` is mandatory. Each beat gets local frame 0, which the pose ramps need.
3. **Stills before anything.** `npx remotion still src/index.ts <Comp> out/f<N>.png --frame <N>` for the middle frame of EVERY beat, tile into a contact sheet, look at it. Camera inside geometry, arm through the face, title on the eyes, head underside visible — all invisible in code, obvious in a still.
4. **Render a 3 s slice** (`--frames=0-179`) at 60 fps to check motion.
5. **Full render**: `npx remotion render src/index.ts <Comp> out/video.mp4 --codec=h264 --crf=18`; verify with `ffprobe` (1080×1920, 60/1, frames = seconds×60).
6. Deliver with what was checked (frames) and what was not (phone-speaker sound).

## Rig API
```tsx
<BlockyCharacter
  pose="idle" | "walk" | "point" | "shocked"
  lookAt={[x, y, z]}           // world point; yaw clamped ±1.0 rad, pitch ±0.6 rad
  position={[0, 0, 0]}         // feet center
  rotationY={0}                // 0 faces +Z (toward the default camera)
  seed={0}                     // offsets idle/blink timing so two Qs don't sync
  palette={{ hoodie: "#..." }} // optional recolor; keep the orange accent
  outline={0.035}              // hull thickness in meters; 0 disables
/>
```
Exports: `CHARACTER_EYE_Y` (≈2.5), `CHARACTER_HEIGHT` (≈3.1), `DEFAULT_PALETTE`, `Pose`.

Pose semantics (local frame = frames since the Sequence started):
- `idle`: breathing (0.35 Hz torso scale), 1 cm bob, tiny arm sway, slow head drift. Safe for any hold.
- `walk`: 1.6 steps/s, ±0.6 rad hip swing, arms counter-phase ×0.8, 4 cm bob, 0.08 rad lean, head roll. Treadmill; move `position` or the camera for travel.
- `point`: right arm rises over 0.35 s (smoothstep) to up-right-forward, brows half up, mouth slightly open, torso twist −0.18. Put what he points at up-right of him.
- `shocked`: 8-frame snap (0.13 s): arms out+up, 12 cm hop, knees split, brows full, mouth wide, decaying settle. Cut TO it; hold ≤ 1.5 s.
- Blink every 3.1 s for 4 frames, automatic. Pupils follow `lookAt`.

Adding a pose: add a `case` to `computeRig()` returning a full `Rig`; ramp with `smooth(clamp(frame / (fps * seconds), 0, 1))`. Never `Date.now()`, `performance.now()`, `Math.random()`, `useFrame` or clocks: frames render in parallel tabs and anything not derived from `frame` flickers.

Arm sign rule (Euler XYZ, `v' = Rx(Ry(Rz(v)))`, arm hangs along −Y): NEGATIVE z moves the LEFT arm outward, POSITIVE z moves the RIGHT arm outward. Think z (outward) first, then x (forward/back). Pointing at the lens (`x≈-π/2, z≈0`) foreshortens into a fist over the face in 9:16; use `[0.6, 0, ±2.0]`.

## Camera grammar for 9:16
- Vertical fov 36°; horizontal half-angle ≈ 10°: stack depth, never spread width. Visible height ≈ 0.65·distance.
- Full-body hero: distance 9.2 → 7.0 m, height 1.6 → 1.9 m, lookAt `[0, 1.7, 0]` → feet ~78 %, head top ~23 %, title clear.
- Bust (reaction): distance 4.5 m, height 2.2, lookAt `[0, 2.3, 0]`.
- Every hold creeps: push 0.15–0.35 %/frame or orbit ≤ 0.004 rad/frame; no static hold ≥ 0.5 s.
- Orbit 10–20° per 2–4 s beat; cut on big jumps; glide only within a beat (smoothstep 18–40 frames).
- Impact: 7-frame shake flipping sign each frame, `amp * (-1)**f * exp(-f/3)`.
- Never camera below ~1.3 m with the head pitched back (you see the head cube's underside). `shocked` keeps the chin down for this.
- Keep top 22 % (title) and bottom 12 % (platform UI) free of the face.

## Lighting (reads on a phone)
- `hemisphereLight` sky `#bcd3ff` / ground `#2a2420` 0.9.
- Key: warm `#fff1dc` at `[4, 7, 5]` 3.2, `castShadow`, 2048 map, ortho ±6, `bias -0.0008`, `normalBias 0.02`, PCFSoft.
- Fill: `#7fb0ff` at `[-6, 3, 2]` 0.8. Rim: `#ff9a5c` at `[-2, 4, -6]` 2.4 — this separates Q from the dark background; keep it.
- `ACESFilmicToneMapping` exposure 1.05; background `#16222f`, fog same color 9 → 24 m.
- `meshStandardMaterial` roughness 0.85–1, metalness 0; outline hull 3.5 cm on the character only.
- Decals are 12 mm boxes 6–8 mm proud of the face. Any new sticker ≥ 6 mm off its surface or it z-fights.

## Title / caption style
- "WHAT IF" 140 px weight 900 white, `textShadow 0 8px 30px rgba(0,0,0,.6)`; subtitle 64 px 700 `#ffb15c`; HTML `<AbsoluteFill>` over the canvas. In 0.2 s / 0.6 s, out by 3.7 s. Captions one line ≤ 6 words, 64–72 px, 160 px above the bottom.

## Sound cues (lock beats first)
- Block-step tick per foot plant = every `fps/1.6/2` ≈ 19 frames in `walk`; low thud + riser ending on the `shocked` snap frame; light pop at the 0.35 s end of the point ramp. CC0 (Kenney Impact Sounds, OpenGameArt CC0 footsteps) or synthesize; never a game's real sounds.

## Render settings
- `remotion.config.ts`: `setChromiumOpenGlRenderer("angle")` with a GPU; `"swangle"` without (CI, cloud box, Lambda). `swiftshader`/`egl` fail with "Error creating WebGL context".
- 60 fps, 1080×1920, `dpr={1}`, `--crf=18`; concurrency ≈ cores/2 on SwiftShader (4 vs 2 gave ~7 %).
- Measured (4 vCPU, no GPU): 0.36–0.39 s/frame → 45 s reel ≈ 17 min. GPU desktop with `angle` several× faster (unverified).
- Stills ≈ 5 s each incl. bundle. `--scale 0.5` still renders the 3D at 1080 wide (R3F clamps dpr ≥ 1).

## What breaks (seen in this project)
| Symptom | Cause | Fix |
|---|---|---|
| `Error creating WebGL context` | wrong `gl` | `swangle` without GPU, `angle` with |
| Character fills frame / title on head | fov 32 @ 5.6 m shows 3.2 m | ≥ 9 m or fov ≥ 36 for full body |
| Fringe covers eyes | hair below 0.62·HEAD | hair ≥ 0.62·HEAD, eyes at 0.46·HEAD |
| Arm inside torso | wrong z sign | left z < 0, right z > 0 for outward |
| Point reads as a fist | arm aimed at lens | right arm `[0.6, 0, 2.0]` |
| Face unreadable in shocked | head back, low camera | chin +0.05, lean ≤ −0.05 |
| Flicker | time/random motion | derive from `frame` |
| `<Sequence>` crash in canvas | default layout div | `layout="none"` |
| Shadow stipple | PCFSoft on SwiftShader | `normalBias` 0.03 or PCFShadowMap + `radius` |
````

---

## 5. Copy-paste prompt for Claude Code

```text
Use the qrosity-character skill. Make a Q-ROSITY reel: "WHAT IF you fell into a volcano?" — 1080x1920, 60 fps, 40 seconds, no narration, captions only.

Rules:
- Use the existing rig in src/BlockyCharacter.tsx (poses idle/walk/point/shocked, lookAt, seed) and the camera/lights/ground pattern in src/Scene.tsx. Do not fork the rig; if you need a new pose (e.g. "fall", "sweat"), add a case to computeRig() that is a pure function of the local frame with smoothstep ramps.
- Write src/beats.ts first: 10–14 beats of 2–4 s, each {id, from, dur, pose, caption (<=6 words), camera: {distance, height, orbitDeg, pushPct}}. Beat 1 = title card "WHAT IF" + premise (in at 0.2 s/0.6 s, out by 3.7 s). Last beat = payoff, cut TO the `shocked` pose, not blended.
- Build the set from the same Box primitive: a volcano rim (dark red/black stepped blocks), orange emissive lava blocks (meshStandardMaterial emissive, intensity 2) lighting Q from below, rising ember cubes driven by frame only.
- Every beat is a <Sequence layout="none"> inside ONE <ThreeCanvas width height dpr={1}>. Captions are HTML in an AbsoluteFill over the canvas, 64–72 px, 160 px above the bottom, never over the face.
- Camera: vertical fov 36; full-body = 9.2 m, height 1.6–1.9, lookAt [0,1.7,0]; bust = 4.5 m, height 2.2, lookAt [0,2.3,0]; every hold creeps (push 0.2 %/frame or orbit <= 0.004 rad/frame); 7-frame sign-flipping shake on the reveal beat.
- Lighting: keep hemisphere + warm key (shadows) + cool fill + orange rim; add a lava point light only in lava beats.
- Everything is a function of useCurrentFrame(). No useFrame, Date.now, Math.random, or CSS animations.
- After writing the scenes: render the middle frame of every beat with `npx remotion still`, tile them into out/sheet.png, look at the sheet, fix anything where the face is covered, the camera is inside geometry, text overlaps the face, or an arm folds into the torso. Then render a 3 s slice (--frames=0-179) and finally the full MP4 with --codec=h264 --crf=18. Use --gl=swangle on a machine without a GPU, angle with one.
- Report: frames checked, render time per frame, what you could not verify.
```

---

## 6. Sources

VERIFIED (read this session):
- https://www.remotion.dev/docs/three · https://www.remotion.dev/docs/three-canvas · https://www.remotion.dev/docs/three-webgpu-canvas · https://www.remotion.dev/docs/gl-options · https://v3.remotion.dev/docs/flickering · https://www.remotion.dev/docs/delay-render · https://remotion-7mn9h6sxs-remotion.vercel.app/docs/gpu
- https://github.com/remotion-dev/template-three (package.json, src/Root.tsx, remotion.config.ts raw)
- Local: `setup/.claude/skills/remotion-markup/3d.md` (Remotion's 3D agent rule)
- https://github.com/BinhL3/what-if-video-skill (README, SKILL.md, references/scenes.md raw)
- https://github.com/mromidev/claude-animated-shorts (README, SKILL.md raw)
- https://github.com/Kianzzz/xilo-opus-video (README)
- https://threejs.org/docs/pages/VOXLoader.html · https://drei.docs.pmnd.rs/abstractions/outlines
- https://socket.dev/npm/package/skinview3d/diff/1.1.0-alpha.2 · https://github.com/bs-community/skinview3d · https://jsr.io/@feniota/tiny-skin-viewer · https://shinobirpg.pages.dev/models.html
- https://jvinhit.github.io/blog/svg-23-character-rigging/ · https://forum.defold.com/t/blockbench-animation-guide/82193 · https://github.com/pmndrs/gltfjsx
- https://shortyawards.com/13th/the-what-if-show · https://cartt.ca/thunderbird-turning-web-hit-what-if-into-a-tv-series/
- https://quickdrawanimation.ca/opportunities/job-postings/zack-d-films-animator-wanted · https://zackdfilms.recruitee.com/o/3d-generalist/c/new
- https://podcastle.ai/blog/best-minecraft-youtubers · https://www.pcgamesn.com/minecraft/youtubers-best
- https://raw.githubusercontent.com/FlorianBruniaux/claude-code-ultimate-guide/693d97d284ea342c8c8fb13894df0cee26d3a3d3/docs/resource-evaluations/remotion-claude-code-video.md
- GitHub search API (stars/pushed) for: remotion three; remotion react-three-fiber; react-three-fiber voxel character; minecraft style character three.js; minecraft skin viewer three.js.

UNVERIFIED:
- HisStory, Baseplate, Studby, Element Animation, BigSchool, TrueMU details; what.if.lab account; Zack D. Films subscriber numbers (freelancer claims).
- Retention benchmarks: https://opus.pro/blog/ideal-youtube-shorts-length-format-retention · https://subscribr.ai/p/perfect-youtube-short-length-structure-hooks · https://www.gofaceless.ai/en/blog/high-retention-youtube-shorts-attributes
- `threejs-vox-loader`, `@divnotes/dn-voxel-loader`, `r3f-peridot` quality.
- Kenney CC0 claim via https://gtstu.com/?p=5011 (verify on kenney.nl); OpenGameArt packs https://opengameart.org/content/footstep-sounds · https://opengameart.org/content/100-cc0-sfx-2
- GPU `angle` speed-up ("many times faster" per Remotion; not measured here).
- `mixer.setTime(frame/fps)` for glTF clips in Remotion (standard three practice, untested here).
- Reddit allegations about After Effects fakes.
