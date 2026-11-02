# character — the blocky person (shared by both examples)

Copied from `setup/remotion/src/lib/character/` (60 fps kit) so the toolkit has no cross-project
imports, then adapted to HARNESS.md:

| file | what changed vs the setup/ original |
|---|---|
| `BlockyCharacter.tsx` | durations in seconds × `fps` (take 0.5 s, pose blend 0.2 s, blink 0.13 s); **no overshoot/wobble** (take settles with `Easing.out(cubic)`, shocked pose no longer rings, point no longer trembles); `palette` prop with `DEFAULT_PALETTE` (Q-ROSITY) and `SIGNAL_PALETTE` (ink/paper print — no red, red is money-only); pose **timelines** `pose={[{at, pose}]}` that blend; new `phone` pose + `phoneGlow` (0 = dead screen); `scale`; `takeLandFrames(fps)` = frames from a take's start to the new face (key a take at `word − takeLandFrames`). |
| `Stage3D.tsx` | camera moves use `Easing.inOut(Easing.cubic)`; `CameraRig` takes explicit `from`/`to` `CamState`s and a `center`; shake ≤ 7 frames, linear decay; `FixedCamera`; `Stage3D` options `transparent` (no clear colour/fog — composite over 2D), `toneMapping: 'none'` (exact brand hexes), `shadows`, `lights`; `PRINT_THEME` (The Signal); `lcg()` seeded random exported. |

Character spec (from `setup/channels/q-rosity/brand.md` §6; code is the truth): box-limb humanoid,
4.2 heads tall (head 0.95 m cube, torso 0.9×1.1×0.5, arms 0.32×1.05, legs 0.4×0.95, height ≈ 3.1 m,
eye line ≈ 2.5 m), hoodie with a darker pocket, two drawstrings and a 5-box "?" emblem, 3.5 cm
inverted-hull outline on every body box (never on sets), moods `neutral / worried / shocked / happy /
asleep` (every mood change is a take: anticipation → squash → new face → settle), poses `idle / walk /
point / shocked / phone`. Original design: `<boxGeometry>` only, no assets, no game trademarks.

Rules when using it: never `useFrame()`; every `<Sequence>` inside a `<ThreeCanvas>` is
`layout="none"`; on a CPU box render with `--gl=swangle`.
