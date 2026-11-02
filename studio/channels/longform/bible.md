# Q-ROSITY Long — long-form channel bible (YouTube, 10–15 min)

> Read this, `toolkit/HARNESS.md` §1.2/§2/§3/§4 (story-first gates, look bans, sound, critique) and
> `toolkit/longform/README.md` before any long-form work. HARNESS §1.3–1.4 (vertical layout/captions)
> do NOT apply: long-form is 1920×1080 and uses uploaded closed captions, not burned-in ones.

## 1. What it is
**What-if deep dives, 10–15 min**, told by the blocky character on detailed 3D night sets, with
paper "field-notebook" explainer scenes for the numbers. Same world as Q-ROSITY, more patience:
each episode follows ONE premise step by step (hour → day → year → generation), every step sourced.
- **Where:** the **Q-ROSITY YouTube channel** (long-form tab) — one subscriber base; each episode's
  2–3 Shorts link to it as their "Related video". Instagram/TikTok get only the Shorts.
- **Promise:** "We take one impossible question and follow it all the way — with real science."
- **Not:** a science lecture, a list video, a compilation, or reused footage.

## 2. Structure (enforced by `longform/plan.mjs` warnings)
| Part | Length | Job |
|---|---|---|
| Cold open | ≤ 30 s | the premise happening, on screen; the stakes; no logo, no "in this video" |
| Promise | 8–15 s (end of the cold open) | the 3 stops we'll reach (timeline template) |
| Chapters ×5–7 | 1.5–2.5 min each | one step of the escalation each; **re-hook every 60–90 s** (a new open loop: "but that's the gentle part…") |
| Payoff | 30–60 s | the answer to the cold open's question + one line that reframes it |
| End screen | 20 s | two next-video slots (YouTube end-screen elements) |

## 3. Scenes (template library — `toolkit/longform/README.md`)
`whatif` (title + story clock, the world changes on a word) · `narrator` (character talking on a 3D set; `shots` cut on words) · `title` (chapter card) · `bigNumber` · `compareBars` · `diagram` (orbit / pins-map placeholder / flow) · `timeline` · `quote` · `endscreen`.
Rhythm: alternate NIGHT (3D) and PAPER (2D) scenes; a new scene at least every ~20 s, a reveal every 3–5 s inside it.

## 4. Look
NIGHT sets per Q-ROSITY (fog, practical lights). PAPER: cream #F3EBDD, ink #120A10, ONE accent per shot = highlighter #FFD23F. Rubik 900 / Nunito 800. Character = Q (`DEFAULT_PALETTE`). Thumbnails: Q big + 3–5 words + one number/object (`LongformThumb`, 1280×720) — readable at 160 px wide.

## 5. Voice
Default **Kokoro `am_michael` at speed 0.85** (free, local, ≈ 2.6–2.7 words/s), one narrator for every episode. Upgrade path: ElevenLabs (paid) — set `ELEVENLABS_API_KEY` and `"voice": {"engine": "elevenlabs", "voice": "<id>"}` in episode.json; nothing else changes. Write numbers as words in the line's `tts` field when the engine misreads them (e.g. "9:00 p.m." → "nine p m").

## 6. Facts & policy
- Every claim → `facts.md` row with URL + quote; derived numbers shown as derived ("our arithmetic from …"). The description lists every URL.
- The premise is fiction and is labelled as hypothetical in the description; the consequences are sourced.
- Vary premise type, outcome, and set per episode (log in `ideas.md` → Used). No two consecutive episodes in the same domain (space/ocean/body/society…).
- Synthetic voice credited in the description. No "altered or synthetic" label needed (animated, non-realistic) — re-check if a realistic element ever appears.

## 7. Cadence
- **Start: 1 episode every 2 weeks** (render ≈ 1.5–2.5 h of machine time + ~3 h of your review time per episode). Move to weekly only after 3 episodes ship on time.
- Every episode yields **2–3 Shorts** (cut from the cold open and the biggest re-hook, rebuilt vertical with the Q-ROSITY short templates — never a cropped 16:9).

## 8. YouTube notes
- Title ≤ 60 chars, the premise as a question; thumbnail text ≠ title text.
- Description from `description.md` (summary, chapters, sources). Chapters need ≥ 3 timestamps, first 0:00, each ≥ 10 s.
- Upload `captions.srt` (generated from the voice timings) as English subtitles.
- Use YouTube's own A/B test for thumbnails/titles (long-form only).
- Never delete and re-upload; fix with a new version only if broken.
