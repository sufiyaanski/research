# Q-ROSITY — brand contract (placeholder)

> "What if…" curiosity reels with a blocky (Roblox/Minecraft-style) character in POV drama.
> 1080×1920 @ 60 fps, 30–60 s. This file is a **placeholder**: the 2D stage, type and palette
> are real and used by `remotion/src/episodes/qrosity-000-placeholder`; the character is a
> slot (see §6) that another workstream fills with the 3D rig. `remotion/src/brand.ts` →
> `QROSITY` mirrors the palette.

## 1. Identity and voice

- **Positioning:** a bright, chunky, slightly absurd thought experiment. The character is
  the viewer's stand-in; the facts are real.
- **Voice:** second person, present tense, escalation ("Day one… Day three… Day eleven").
  Hook is always a question starting with "What if".
- **Energy:** playful. Springs may bounce (position/scale only). Big numbers still count up
  cleanly (shared kit rules).

## 2. Palette (mirrors `brand.ts` → `QROSITY`)

| Role | Hex | Use |
|---|---|---|
| ink (stage) | `#DDF3FF` | sky-blue backdrop |
| panel | `#FFFFFF` | cards, speech plates |
| line | `#B8DDF2` | outlines, grid |
| text | `#15192B` | near-black text |
| muted | `#5B6478` | labels |
| **accent** | `#6A33FF` | electric purple: hook word, big number, character shirt |
| onAccent | `#FFFFFF` | |
| positive | `#1DB954` | grass floor, "yes" |
| negative | `#E6334B` | danger stamps |
| glow | `#FFD23F` | sunshine radial behind the character (60% strength) |

Contrast on stage: text 15.5:1 · accent 6.4:1 · negative 4.9:1. Captions always on a dark
plate (`Captions plate`) because the floor is busy.

## 3. Typography

| Role | Font | Weights |
|---|---|---|
| Display | **Rubik** | 700 / 800 / 900 (chunky, rounded corners match the blocks) |
| Body / captions | **Nunito** | 600 / 700 / 800 |

Hook 118 px, day counter 260 px, captions 66 px on a plate.

## 4. Motion

- `SPRING.bouncy` for the character and stamps; `SPRING.snappy` for text. Idle bob ±8 px at
  0.8 Hz on the character. Everything else follows `/reel-design-rules`.

## 5. Layout

- Kicker "what if…" at y 240; headline y 300; big number y 400–660; character slot x 300–780,
  y 600–1240 standing on the floor (floor top y 1240); stamps across the body at y ≈ 1160;
  captions y 1380 on a plate.
- Text never covers the face (y 690–860 when the character stands on the floor).

## 6. TODO — 3D character slot

- Replace `<CharacterSlot/>` in `qrosity-000-placeholder/Episode.tsx` with the rigged
  blocky character (expected: `@remotion/three` scene, driven only by `useCurrentFrame()` —
  no `useFrame`, no self-animating materials). Keep the same anchor (feet at x 540, y 1240)
  and the props `{x, y, at}` so scenes don't change.
- Expressions needed by the format: neutral, worried, shocked, asleep. POV camera moves
  are camera-only; the character stays on the floor.
- Lighting: single warm key from the glow direction, no bloom (bloom bands in H.264).

## 7. Sound taste

- Cartoon-clean: `pop-reveal` on blocks landing, `boing-soft` for bouncy entrances, a
  `clock-tick` for day counters, `stamp-hit` for danger stamps. Same levels as The Signal.

## Learned from reviews

<!-- "save to skill" appends here -->
- [qrosity-000] The day number and the character must not share the x-center band unless the character stands below y 690.
