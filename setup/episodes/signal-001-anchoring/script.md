# signal-001 · "Nobody bought this" (price anchoring)

**Pitch.** The $429 bread maker nobody bought is really an anchor; the proof is Tversky &
Kahneman's rigged wheel moving a median estimate from 25% to 45% (Science, 1974).

**Format.** 1080×1920 @ 60 fps · 51 s · composition `SignalAnchoring` · VO ≈ 128 words (2.6 w/s).
**Hook (frame 0).** Headline "NOBODY BOUGHT *THIS.*" + amber $429 tag.
**Alt hooks (trial reels).** "This price exists to lose." · "The $429 nobody buys." (see publish.json)

## Beat sheet

| Beat | Time | On screen | VO |
|---|---|---|---|
| HOOK | 0.0–3.6 | Kicker "Price psychology · 001"; headline NOBODY BOUGHT **THIS.**; amber tag $429 "bread maker" — all on frame 0 | This $429 bread maker was never meant to sell. |
| SETUP | 3.6–11.0 | Kicker "The setup"; headline ONE MAKER, ONE **PRICE.**; shelf; panel tag $275 lands on "$275" (6.2 s); stamp NOT SELLING lands on "Nobody" (9.2 s); source line | Williams-Sonoma had one bread maker. $275. / It sat on the shelf. Nobody bought it. |
| TURN | 11.0–18.5 | Kicker "The move"; $275 tag at left from the cut; amber $429 "deluxe" tag lands on "second one" (13.1 s); bar chart BEFORE 1× → AFTER ≈2× (bars land 15.6 / 16.5 s); source line | So they added a second one, almost twice the price. / Sales of the cheap one nearly doubled. |
| WHY | 18.5–27.0 | Kicker "Why it works"; headline WHAT IS IT **WORTH?**; value scale cheap↔expensive with "? ? ?" (20.0 s); $429 anchor drops on "first number" (23.6 s) + ANCHOR stamp; $275 slides left and turns green "looks fair" (25.0 s); headline swaps to **ANCHORING** on "anchoring" (25.5 s) | Your brain has no idea what a bread maker is worth. / It grabs the first number it sees. That's anchoring. |
| PROOF | 27.0–39.5 | Kicker "The experiment · 1974"; wheel on screen from the cut, spins on "spun" (28.6 s), lands on 10 (30.5 s); question "What share of UN countries are African?" (31.4 s); bars 25% (35.0 s) and 45% in amber (37.8 s); source line | In 1974, Kahneman and Tversky spun a rigged wheel. / Then asked: what share of UN countries are African? / Wheel said 10: people guessed 25%. Wheel said 65: they guessed 45%. |
| EVERYDAY | 39.5–46.5 | Kicker "You saw this today"; $90 "the steak" tag (40.7 s); amber "was $199 / $129" tag (43.6 s); headline "The anchor isn't the **product.**" (44.8 s) | That's why menus have a $90 steak, and tags say was $199. / The anchor isn't the product. |
| PAYOFF / LOOP | 46.5–51.0 | $429 hero tag back at the hook position from the cut; headline WHO CHOSE THE **FIRST NUMBER?** (47.6 s); at 50.0 s dissolves to NOBODY BOUGHT **THIS.** so the last frame ≈ frame 0 | It's the first number. So ask: who chose it? |

## Production notes

- Every number: `facts.json`. The bread-maker story is an anecdote and the source line says so.
- Voice: placeholder timings (`vo.gen.ts` estimated). After TTS with word timestamps, write
  `words[]` into `beats.json` and run `npm run vo:estimate -- signal-001-anchoring`.
- Sound: `sfx-plan.json`. Two hero layers only: riser→impact on the ≈2× bar (16.9 s) and
  the 45% bar (38.6 s).
- No outro. The loop is the ending.
