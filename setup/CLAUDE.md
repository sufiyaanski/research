# CLAUDE.md — The Signal / Q-ROSITY reel kit

Hard rules. Short, imperative, numbered so review notes can cite them ("R7"). Longer
reasoning and the numbers behind these live in `.claude/skills/reel-design-rules/SKILL.md`.

## R0. Where and how
- Run everything from `setup/`. Node 22, npm, ffmpeg/ffprobe on PATH.
- Compositions are **1080×1920 @ 60 fps**. Derive frames from `fps` (`2 * fps`), never write `60`.
- Episode = `remotion/src/episodes/<id>/{Episode.tsx, beats.json, vo.gen.ts}` + `episodes/<id>/{script.md, facts.json, sfx-plan.json, publish.json, qa/}`.
- Skills: `/make-signal-reel` (the recipe), `/make-qrosity-reel` (3D character reels), `/reel-design-rules`, `/frame-qa`, `/review-loop`, plus the official `remotion-*` skills; voice/sound passes live in `/voice-captions`, `/sound-design`, `/script-writing` (tools/*.py) when present. Read `channels/<channel>/brand.md` before touching a scene.

## R1. Always QA before video
- `npm run frames -- <Comp> beats --scale=0.5`, then **READ every PNG** (phone scale) and fix. Only then `npm run render`.
- Draft video = `--scale=0.5`. Final = scale 1. Then `npm run check -- out/<Comp>.mp4`.
- Behind a proxy with a private CA set `REMOTION_IGNORE_CERT_ERRORS=1` (Google Fonts fetch inside Chrome).
- 3D compositions (Q-ROSITY, `<Stage3D>`): add `--gl=swangle` to frames/render on a machine without a GPU; `angle` (default) on a desktop GPU. The 3D renders at full 1080 px even at `--scale=0.5`.

## R2. Frame 0 is the thumbnail
- Frame 0 fully composed: hook text + hero number visible, no fade from black, no logo card.
- First number reveal ≤ 2 s. Use negative `at` values (pre-roll) so hook elements are already landed.

## R3. Frame-based only
- No `useState`, `useEffect`, `setTimeout`, CSS transitions/animations, `Math.random()` at render.
- `interpolate` input ranges strictly increasing; always `extrapolateLeft/Right: 'clamp'`.
- Use `spring()` presets from `lib/kit` (`SPRING.snappy` / `soft`; `bouncy` only on Q-ROSITY). Use `Easing.bezier` via `EASE.*`; never `Easing.out(Easing.cubic)`.
- **Frames inside `<Sequence>` are LOCAL.** Global second → local frame is `toLocal(s, sequence.from)`. Check every cue twice.
- Prefer `scale` / `translate` / `rotate` CSS properties over `transform` strings; keep `interpolate` inline in `style`.

## R4. Fonts and assets
- Fonts only via `@remotion/google-fonts` in `remotion/src/fonts.ts` (`loadFont` blocks the frame until ready; `fontsReady` = `waitUntilDone()`). No runtime fetches, no `<link>` tags, no CDN images.
- Assets go in `remotion/public/` and are referenced with `staticFile()`.

## R5. Safe zones (1080×1920)
- Nothing critical in the **bottom 340 px** or the **right 160 px** (TikTok/Reels/Shorts UI). Keep text ≥ 5% (≈ 64 px) from every edge; top 220 px is status bar + tabs.
- Hero number and headline live in **y 270–1250**. Captions centered at **y ≈ 1380** (`SAFE.captionY`; hassancs91's kit uses ≈ 1500, Meta's published 35% bottom zone would say ≤ 1250 — **to verify against a current screenshot of your own account**).
- `npm run frames -- <Comp> 0 --guides` overlays the zones. Never ship with guides on.

## R6. Typography
- Hook headline ≤ 6 words, 96–128 px. Body 56–72 px. Captions 64–72 px bold, **2–4 words per chunk**, word-highlight in the accent. Kicker 40 px. Sources 30 px.
- Numbers always `fontVariantNumeric: 'tabular-nums'`; thousands separators; currency symbol at 70% size. One number per beat, the biggest thing on screen.
- Min on-screen hold = `holdFrames(text)` (reading at ~3 words/s + 0.5 s). Last line ≥ 2 s. Too many words → cut words, never shrink type.

## R7. Pacing
- A visual change every 1.5–3 s. Scene length 3–8 s. Total 45–70 s. Entrances 12–18 frames, exits ~60% of that.
- End on the payoff. Last frame ≈ frame 0 (loop) or a clean end. **No "comment below" / "follow for more" outro.**
- Max one flashy transition per 15 s; cuts and 8–12-frame fades otherwise.

## R8. Facts
- Every number on screen exists in `episodes/<id>/facts.json` with a source URL and a `confidence`. Never invent, round only as `facts.json` says, show a `SourceLine` whenever a number is on screen.

## R9. Review loop
- After a render the user gives timestamped notes (`[mm:ss.s] note` from `review/index.html`). Fix every note, re-run frames at those timestamps, re-render.
- When the user says **"save to skill"**: generalize the note into a rule and append it to `channels/<channel>/brand.md` (look/sound) or `.claude/skills/reel-design-rules/SKILL.md` (motion/type/layout), with the episode id as provenance.

## R10. Cost / time
- Draft at `--scale=0.5` (≈ 4× faster). Final at 1. Stills before video, always. Don't render video to "see if it works".
