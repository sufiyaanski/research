# Q-ROSITY — brand contract

> "What if…" curiosity reels with **Q**, an original blocky 3D character, in POV drama.
> 1080×1920 @ 60 fps, 30–60 s. Reference episode: `qrosity-001-volcano` (`QrosityVolcano`).
> The 2D palette below is mirrored in `remotion/src/brand.ts → QROSITY`; the dark-stage
> overlay variant is `QROSITY_STAGE`; the character spec (§6) is code in
> `remotion/src/lib/character/BlockyCharacter.tsx`. `qrosity-000-placeholder` is the retired 2D
> stand-in and stays only as a kit-only example.

## 1. Identity and voice

- **Positioning:** a bright, chunky, slightly absurd thought experiment. Q is the viewer's
  stand-in; the facts are real and sourced.
- **Voice:** second person, present tense, escalation ("First problem… Second problem… So
  you'd…"). Hook is always a question starting with "What if".
- **Energy:** playful. Springs may bounce (position/scale only). Big numbers still count up
  cleanly (shared kit rules). Q reacts to every number — through a take, never a snap.

## 2. Palette

`QROSITY` (the character + any light 2D stage):

| Role | Hex | Use |
|---|---|---|
| ink | `#DDF3FF` | sky-blue backdrop (2D stage only) |
| panel | `#FFFFFF` | cards, Q's sneakers |
| line | `#B8DDF2` | outlines, grid (2D) |
| text | `#15192B` | near-black text; Q's pants, outline hull, pupils |
| muted | `#5B6478` | labels |
| **accent** | `#6A33FF` | electric purple: **Q's hoodie** |
| onAccent | `#FFFFFF` | |
| positive | `#1DB954` | "yes" |
| negative | `#E6334B` | danger stamps |
| glow | `#FFD23F` | sunshine yellow: Q's drawstrings, "?" emblem, shoe soles |

`QROSITY_STAGE` (2D overlays over the 3D stage — the stage is dark and fogged):

| Role | Hex | Use |
|---|---|---|
| ink | `#1A0D0F` | plates (captions, kicker, stamps, source); also the stage sky/fog |
| panel / line | `#2B1B1D` / `#4A2E31` | |
| text | `#FFF6EC` | headlines, captions (18.6:1) |
| muted | `#D9B8B0` | source lines (9.2:1) |
| **accent** | `#FFD23F` | hook word, hero numbers, caption highlight (13.1:1) — yellow so it reads next to the purple hoodie |
| positive / negative | `#5BE08C` / `#FF5A6E` | YOU FLOAT / NOT SURVIVABLE stamps |
| glow | `#FF7A1A` | lava / fire radial |

Captions and source lines always sit on a dark plate (`plate`) because the stage is busy.

## 3. Typography

| Role | Font | Weights |
|---|---|---|
| Display | **Rubik** | 700 / 800 / 900 (chunky, rounded corners match the blocks) |
| Body / captions | **Nunito** | 600 / 700 / 800 |

Hook title "WHAT IF" 132 px (900) + premise line 60 px (Nunito 800, accent); headlines 92–96 px;
hero numbers 124–190 px (yellow, tabular); captions 66 px on a plate; kicker 40 px; sources 30 px
on a plate, ≤ 48 characters (one line).

## 4. Motion

- `SPRING.bouncy` for stamps; `SPRING.snappy` for text. Q's idle bob is in the rig (1 cm at 0.35 Hz).
- **Takes.** Every mood change: anticipation (6 f) → squash (6 f, y 0.88 / x 1.08) → new face →
  settle (18 f, decaying overshoot). Body pose cuts (`poseAt`) land on the VO word; the take
  starts 10 frames earlier so the face and the hop land together.
- **Camera** (per beat, inside its Sequence): push-in on the hook, 10–20° orbit on at least one
  beat, bust for numbers, low angle for the consequence, a glide back to the frame-0 shot on
  the loop. Every hold creeps. 7-frame sign-flipping shake on the shocked snap.
- Everything else follows `/reel-design-rules`.

## 5. Layout (over the 3D stage)

- Kicker y 236; headline / hero number y 290–480; **head top never above y 500** (adjust the
  camera `target.y` / `zoom`, not the text); source plate y 1248; captions y 1380 on a plate;
  bottom 340 px and right 160 px free of anything critical.
- Bust shots: number ABOVE the head, source BELOW the chin. Stamps across the chest (y ≈ 1150–1180).
- Text never covers the face. Hands must be inside the frame on every still.

## 6. The character — "Q" (spec; code is the truth)

Original procedural box-limb humanoid, `<boxGeometry>` only, no assets, no Minecraft/Roblox
names, textures, logos or sounds. Deterministic: every rotation and face state is a function of
`useCurrentFrame()`.

- **Proportions (meters):** head 0.95 cube · torso 0.9 w × 1.1 h × 0.5 d · arms 0.32 w × 1.05 h
  · legs 0.4 w × 0.95 h · height ≈ 3.1 · eye line ≈ 2.5 (4.2 heads tall, chibi, so the face reads on a phone).
- **Colours (from `QROSITY`):** hoodie `accent #6A33FF`, pocket `#4F22C9`, drawstrings + "?"
  emblem + shoe soles `glow #FFD23F`, pants `text #15192B`, sneakers `panel #FFFFFF`, skin
  `#F0C090`, hair `#2A1F2E`, pupils `#15192B`, mouth `#7A2E3A`, blush `#FF8A9A`, sweat `#9FDBFF`,
  outline `#15192B`.
- **Outfit:** hoodie with a darker pocket (0.6 × 0.28 at chest-low), two drawstrings (0.05 × 0.4
  at x ±0.14), a 5-box "?" emblem (height 0.42 at x 0.27, y 0.62) — the brand mark. Navy pants,
  white sneakers with a yellow sole stripe.
- **Face decals:** 12 mm-thin boxes **8 mm proud** of the face (`faceZ = HEAD/2 + 0.008`), pupils
  a further 6 mm. Eyes 0.2 squares at x ±0.22, y 0.46·HEAD; pupils 0.1 × 0.12 following `lookAt`;
  brows 0.24 × 0.05 at y 0.46·HEAD + 0.16 (+ 0.07 × raise, ± 0.45 rad tilt for worry); mouth
  0.18–0.5 × 0.04–0.26 at y 0.2·HEAD. Hair cap 0.26 tall at the crown, fringe 0.16 at
  0.62·HEAD (never lower — it covers the eyes), side locks 0.42 tall. Body decals (pocket,
  strings, emblem, soles) are 6 mm proud. Any new sticker ≥ 6 mm or it z-fights.
- **Outline:** inverted hull, BackSide, **3.5 cm** (`outline={0.035}`) on every character box,
  never on the set. Reads as a 2 px ink line at 1080 px.
- **Expressions (moods):** `neutral`, `worried` (inner brows up, sweat drop at the right temple),
  `shocked` (eyes 1.25×, O mouth), `happy` (wide mouth, blush), `asleep` (eyes shut). Blink every
  3.1 s for 4 frames.
- **Poses:** `idle`, `walk` (treadmill, 1.6 steps/s), `point` (right arm up-right-forward),
  `shocked` (hop + arms up/out, chin down). Camera moves are camera-only; Q stays on his mark.
- **Lighting rule:** warm key with soft shadows + coloured fill + strong rim from behind (that
  rim is what separates Q from the fog — keep it); optional up-light for lava/fire; no bloom
  (bands in H.264); fog colour = sky colour = `QROSITY_STAGE.ink` family.

## 7. Sound taste

- Cartoon-clean: `pop-reveal` on blocks and numbers landing, `boing-soft` on take squashes,
  `block-step` per foot plant (every 19 frames in `walk`), `stamp-hit` for stamps,
  `impact-deep-soft` + camera shake on the shocked snap, a low ambience bed (lava rumble, wind)
  at −24 dB. Same levels as The Signal. CC0 or synthesized only.

## Learned from reviews

<!-- "save to skill" appends here -->
- [qrosity-000] The day number and the character must not share the x-center band unless the character stands below y 690.
- [qrosity-001] Set pieces with z > 0 near the character's x land between the lens and Q and black out the frame; background blocks live at z ≤ −2. Check every beat with a still.
- [qrosity-001] On bust shots the source line must be one line (≤ 48 chars): a second line hides under the caption plate.
- [qrosity-001] `shocked` arms at z ±1.1 clip the hands at the 9:16 edges; ±0.95 and camera zoom ≥ 1.4 keep them inside.
