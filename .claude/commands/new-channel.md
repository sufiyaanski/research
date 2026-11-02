---
description: Launch the channel-3 slot (or another new channel) — a short interview, then a filled bible, palette, the first 10 scored ideas and a 6-second style-test render.
argument-hint: "[optional seed idea, or one of: scale-shock | map-moments | tiny-history]"
---

# /new-channel $ARGUMENTS

1. Read `studio/channels/channel-3/bible.md` (the candidates and the sections to fill), the two live bibles (so the new one is clearly different in content type AND look), `research/02-growing-with-claude.md` §2 and §6 (formats, policy) and `toolkit/README.md` (what we can already build cheaply).
2. **Interview — one message, max 7 questions, offer defaults for each** (the user can answer "defaults"): which concept (rank the 3 candidates + their seed `$ARGUMENTS`), who it's for, what they should feel/do at the end, 3 channels they love in that space (grammar only), platforms, posts per week they can sustain (default 2), any hard no's. **Stop and wait.**
3. From the answers, write the full bible in `studio/channels/channel-3/bible.md` (all 10 sections, same shape as `the-signal/bible.md`) — or, if the user wants a real name, `git mv studio/channels/channel-3 studio/channels/<slug>` and keep a fresh template at `channel-3/` for the next one. Set `status: style-test`.
   - Look: 1 ground + 1 ink + 1 accent (hexes), a display + body font from Google Fonts that is NOT in the HARNESS banned-default list, the character's palette (new `Palette` object). Check the accent on the ground for contrast.
4. Write 10 ideas into its `ideas.md`, scored with the rubric (be strict; ≥ 3 must score ≥ 22).
5. **Style test:** copy the closest canonical example into `toolkit/episodes/<slug>-style-test/StyleTest.tsx`, cut it to 6 s (180 frames, no VO, 120 BPM grid): the channel's frame 0 (hook text + character + hero object), one reveal, the palette and fonts. Register it in `toolkit/episodes/index.tsx`, `npx tsc --noEmit`, render frame 0 + frame 120 stills and the 6 s mp4 (`--gl=swangle`). Show them.
6. **Ask: "Ship this look?"** Stop. On yes: `status: live`, add the cadence to its `calendar.md` (start week = next Monday), add the slot to `studio/STATUS.md`, and log the decision in `research/DECISIONS.md` (next number, "N. **Decided: …** (because …)").
