---
description: Make one vertical short for a channel through all the gates — brief + facts → shot list → build → critique (≤ 3 rounds) → render + platform cuts → publish pack. Stops at every approval gate.
argument-hint: "<channel: the-signal | q-rosity | channel-3> <idea id or one-line idea>"
---

# /make-short $ARGUMENTS

Parse `$ARGUMENTS` as `<channel> <idea>`. If the channel is missing or its bible says `status: template`, stop and say so (suggest `/new-channel`).

## 0. Load the rules (always, in this order)
`toolkit/HARNESS.md` (all of it) → `studio/channels/<channel>/bible.md` → the channel's `ideas.md` (Used table) → the channel's canonical example's `README.md` + `brief.md` + `style-guide.md` (`toolkit/examples/signal-demo` for The Signal; `toolkit/examples/qrosity-demo` or `toolkit/examples/whatif-countdown` for Q-ROSITY).

## 1. Episode folder
Create `studio/episodes/<YYYY-MM-DD>-<channel>-<slug>/` (date = the calendar post date, else today) with `status.md`. Add a row to `studio/STATUS.md`. Set the idea to `in production` in `ideas.md`.

## 2. Gate 1 — story, facts, script (STOP)
- Story in 2–6 lines; the director's brief (HARNESS §1.2 block) in `brief.md`, including the §2 bans by name.
- `facts.md`: every number → claim · value · source URL · exact quote. Open each source (WebFetch / search); if you cannot confirm a number, drop it or mark the idea blocked. **Never invent a number, a study or a quote.**
- `script.md`: VO lines at 2.5–2.8 words/s for the channel's master length; numbers spoken exactly as displayed.
- Variety check (Q-ROSITY: scenario/setting/outcome/twist vs the last 10 Used).
Show story + facts table + script. **Ask: "Approve the story, facts and script?" and stop.**

## 3. Voice + beat grid (after G1 approval)
```bash
cd toolkit
python3 voice/tts.py --lines ../studio/episodes/<id>/script.md --out out/vo/<id>          # free Kokoro voice + word timings
mkdir -p public/vo/<id> && cp out/vo/<id>/voice.wav public/vo/<id>/voice.wav
cp out/vo/<id>/words.json ../studio/episodes/<id>/words.json
node beat-grid/make-beats.mjs --vo ../studio/episodes/<id>/words.json --fps 30 --out ../studio/episodes/<id>/beats.json
```
Report the engine, pace (w/s) and any `WARN` lines (a misread number → add a `tts` spelling and re-run).

## 4. Gate 2 — shot list (STOP)
Write `shotlist.yaml` as states on the beat grid (HARNESS §1.2 step 6: each shot = start/end on a beat, one action, the end state, caption chunk, SFX cues), snap it (`make-beats --from-shotlist … --out shotlist.json`, drift ≤ 1). Show the table. **Ask: "Approve the shot list?" and stop.**

## 5. Build (after G2 approval)
Copy the canonical example into `toolkit/episodes/<id>/<Comp>.tsx` and adapt it (never edit the example). Import JSON from `../../../studio/episodes/<id>/`. Add `<Audio src={staticFile('vo/<id>/voice.wav')} />` (from `@remotion/media`). Register it in `toolkit/episodes/index.tsx` between the EPISODES markers. `npx tsc --noEmit` must pass.

## 6. Critique (≤ 3 rounds — HARNESS §4)
`REMOTION_IGNORE_CERT_ERRORS=1 node critique/critique.mjs <Comp> --shotlist ../studio/episodes/<id>/shotlist.json --fast --gl swangle` → look at every still at phone size → score honestly (compare with the best reels in the niche, not our last draft) → `node critique/score.mjs … --write` → fix only the 3 worst, lock ≥ 8 → repeat. Log every round in `review_log.md`. New generalisable lesson → one line in HARNESS "Learned from reviews".

## 7. Render + Gate 3 — phone check (STOP)
```bash
REMOTION_IGNORE_CERT_ERRORS=1 npx remotion render <Comp> out/<Comp>.mp4 --gl=swangle
ffmpeg -i out/<Comp>.mp4 -af ebur128=peak=true -f null - 2>&1 | tail -12      # ≈ −14 LUFS, true peak ≤ −1 dBTP
```
Platform cuts per the bible (e.g. TikTok extended) as extra compositions or `--frames`. Report render time. **Ask the user to watch `toolkit/out/<Comp>.mp4` on their phone (send it to themselves) and approve. Stop.**

## 8. Publish pack
Run `/publish-pack <id>` behaviour. Then stop: **the user posts** (G4). Update status everywhere.
