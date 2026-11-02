---
name: script-writing
description: Write the narration script and beats.json for a reel on The Signal (price-psychology, numbers-driven explainers) or Q-ROSITY ("what if" curiosity reels with a blocky character). Use when the user wants to "write a script", "script this topic", "turn this idea into a reel", "the hook is weak", "VO is too long / too fast", "make a beats.json", or needs word budgets and beat structure. Produces script text + the beats.json VO contract that gen_voice.py and the Remotion composition consume.
---

# script-writing — from idea to beats.json

A reel script is a timing document, not prose. Every line is a beat with a planned start,
every number is a visual, and the whole thing fits **45–70 s at 2.5–2.7 words/s**:

| Length | Word budget @2.5–2.7 w/s | Lines |
|---|---|---|
| 45 s | 110–120 words | 7–8 |
| 55 s | 135–150 words | 8–9 |
| 70 s | 170–190 words | 10–12 |

Hard rules: **115–190 words total**, ≤ 24 words per line (longer lines force > 170 wpm or a
pushed timeline), one idea per reel, hook ≤ 8 words, **no CTA outro** ("comment below", "follow
for more" read as dated — end on the payoff and loop into the hook). Verify every number before
it goes in a line; a wrong number in a numbers channel is fatal.

Pace-check the draft before anyone animates it:
`python3 -I tools/gen_voice.py --beats <beats.json> --dry-run` — fix every WARN in the script.

## The Signal template (price psychology, numbers-driven)

| Beat | Length | Rule |
|---|---|---|
| **Hook** | ≤ 8 words, 0.2–3.2 s | Contains a NUMBER or a CONTRADICTION ("$9.99 is a lie your brain believes"). Frame 0 is fully composed — the payoff image already on screen. |
| **Idea** | 1 line, 15–18 words | Name the ONE mechanism in plain words. No second idea anywhere in the reel. |
| **Reveal ×3** | 3 steps, each 10–22 words, each with a NUMBER | "Step one/two/three" or a visible counter. Each step's number is the thing that animates: a bar, a counter, a grid. The number is said and shown within ±3 frames. |
| **Twist** | 1 line, 12–16 words | Reframe what the viewer thought the mechanism was ("It was never about the 9"). This is the hero SFX moment (riser→impact). |
| **Payoff** | 1–2 lines, 14–18 words | The one-sentence takeaway that makes the hook literally true. |
| **Loop line** | ≤ 10 words | Echo the hook with one word changed; the final frame matches frame 0. No CTA. |

Word budget by beat for a 54 s reel: hook 7 · idea 17 · reveals 12+11+14+22 · twist 16 ·
payoff 17 · loop 10 = **126 words** (2.54 w/s over 49.5 s of speech).

### Example — "Why the $9.99 trick still works on you" (54 s, 126 words)

```
HOOK     $9.99 is a lie your brain believes.
IDEA     Your brain reads prices left to right — and stops early. The first digit sets the anchor.
STEP 1   Step one. Shoppers were shown a shirt at $34, then at $39.
         The $39 shirt sold 24 percent more. Higher price. More sales.
STEP 2   Step two. Prices ending in nine beat round prices in 60 percent of tests.
STEP 3   Step three. Drop the 9 to a 7 — $9.97 — and the effect barely moves. It was never about the 9.
TWIST    It's the left digit. Your brain banks the 9 dollars and rounds the rest to zero.
PAYOFF   So the trick isn't 99 cents. It's one cent — the one that moves the first number.
LOOP     Which is why $9.99 is a lie your brain believes.
```
(The $34→$39 result is the Anderson & Simester 2003 catalog field test; the 60 % and
"9.97 barely moves" claims are illustrative placeholders — replace with sourced figures before
production. A Signal script ships with a `sources` list in beats.json.)

beats.json: `examples/signal-anchoring.beats.json` (fps 60, durationSec 54, 9 vo lines,
8 beats with visuals + sfx hints). Planned windows leave ≥ 0.4 s between a line's mock end and
the next start so the real VO never drifts. (The kit's shipped episode `signal-001-anchoring`
— the $429 bread-maker anchoring story — follows the same template at 51 s / 118 words.)

## The Q-ROSITY template ("what if", blocky character POV)

| Beat | Length | Rule |
|---|---|---|
| **Premise** | ≤ 12 words, 0.2–4.6 s | "What if you never slept again?" + one twist of the knife ("Not tired. Just… never."). Character is on screen at frame 0. |
| **POV escalation ×3** | 3 lines, 14–18 words each | Time-stamped ("Night one… Night three… Night eleven"). Each one is a scene the character lives in, bigger than the last. Second person: YOU feel, YOUR hands. |
| **Turn** | 1 line, ≤ 12 words | "But here's the thing." The real mechanism, stated as a metaphor the character can act out ("Sleep isn't rest. It's a wash cycle."). |
| **Consequence** | 1–2 lines, 17–23 words | The factual payoff with ONE number ("your brain shrinks by a fifth"). The metaphor becomes literal on screen. |
| **Loop line** | ≤ 14 words | Repeat the premise question, answer it with the lesson, land on frame 0. No CTA. |

Word budget for a 58 s reel: premise 10 · POV 14+17+18 · turn 11 · consequence 23+17 ·
loop 13 = **123 words** (2.45 w/s).

### Example — "What if you never slept again?" (58 s, 123 words)

```
PREMISE  What if you never slept again? Not tired. Just... never.
POV 1    Night one. You feel incredible. Eight free hours. You learn guitar. You clean everything.
POV 2    Night three. Your brain is a browser with 400 tabs open. Your hands don't feel like yours.
POV 3    Night eleven. The record is 11 days. After that, nobody knows — because nobody has made it further.
TURN     But here's the thing. Sleep isn't rest. It's a wash cycle.
CONSEQ   Every night, your brain shrinks by a fifth and flushes out the waste it made all day. Skip it, and the waste stays.
         Which means the version of you that never sleeps isn't a superhero. It's a room nobody cleans.
LOOP     So... what if you never slept again? You'd finally understand why you do.
```
(The 11-day record is Randy Gardner, 1964; the "shrinks by a fifth" line paraphrases the
~60 % increase in interstitial space during sleep reported by Xie et al. 2013 — check and cite
before production.)

beats.json: `examples/qrosity-no-sleep.beats.json`. For the dramatic voice (see
`voice-captions`), put the tagged version in `tts`, e.g.
`"tts": "[whispers] Night eleven. The record is 11 days..."`, while `text` stays clean for captions.

## beats.json — the contract

Lives at `remotion/src/episodes/<id>/beats.json` (CLAUDE.md R0). Minimal shape:

```jsonc
{
  "id": "signal-002-left-digit", "channel": "the-signal", "title": "...", "composition": "SignalLeftDigit",
  "format": { "width": 1080, "height": 1920, "fps": 60, "durationSec": 54 },
  "vo": [
    { "beat": "hook", "text": "$9.99 is a lie your brain believes.", "start": 0.2, "end": 2.9 },
    { "beat": "idea", "text": "...", "start": 3.2, "end": 10.0, "tts": "optional: how to SAY it ([v3 tags], phonetics)" }
  ],
  "beats": [
    { "id": "hook", "start": 0.0, "end": 3.2, "visual": "what is on screen", "sfx": ["impact-soft@0.05", "whoosh-soft@3.2?"] }
  ],
  "sources": [ { "claim": "...", "ref": "..." } ]
}
```
- `vo[].start/end` is the PLANNED window (plan `end − start ≥ words / 2.7 + 0.3`); after
  `gen_voice.py` runs they become the REAL times, `words: [{w,start,end}]` is added and
  `planned_start/planned_end` keep your plan. Captions, counters and SFX use the real values.
- `beat` links a line to its visual (several lines may share a beat). The tool adds a stable
  `id` per line for caching.
- `beats[].visual` is the brief for the Remotion side; `beats[].sfx` are seed hints for the
  cue sheet (`"id@seconds"`, `?` = optional) — the sound-design pass turns them into
  `episodes/<id>/sfx-plan.json`. Captions over a full-screen graphic are hidden with the
  `Captions` component's `hideBetween`.
- Keep the hook at `start: 0.2–0.3` (not 0.0) so the first phoneme is never clipped by players.
- Every number also goes in `episodes/<id>/facts.json` with a source and confidence (CLAUDE.md R8).

## Writing checks (run before handing off)

1. Count words: 115–190. Count lines: 7–12. Longest line ≤ 24 words.
2. Hook ≤ 8 words AND (has a number OR a contradiction).
3. Exactly one idea; three reveal steps each carrying a number (Signal) / three POV
   escalations each with a time stamp (Q-ROSITY).
4. Twist/turn reframes; payoff makes the hook literally true; loop line echoes the hook.
5. No CTA. No "in this video". No "let's dive in".
6. `gen_voice.py --dry-run`: 0 WARN. Then `--mock --emit-ts` so the Remotion side can start.
