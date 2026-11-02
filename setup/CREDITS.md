# Credits

## hassancs91/claude-faceless-shorts-creator (MIT)

Patterns in this kit are adapted from **claude-faceless-shorts-creator** by Hasan Aboul Hasan
(https://github.com/hassancs91/claude-faceless-shorts-creator), MIT License, Copyright (c) 2026
Hasan Aboul Hasan:

- the `beats.json` contract (global-seconds VO lines + beats, estimated timings replaced by
  real word alignment written to `vo.gen.ts`);
- the frame-0 / thumbnail rule, the "frames inside `<Sequence>` are LOCAL" rule, the loop
  (last frame ≈ frame 0) and the "no CTA outro" rule;
- phone-scale frame QA before any video render (`frames.mjs` → read the PNGs);
- the shape of `Captions` (word-pop chunks driven by VO timings), `Kicker`, `BigTitle`,
  `Stamp`, `ProgressBar`, `SafeAreaGuides`, and the `SAFE` zone constants (bottom 340 / right
  160 / 5% edges);
- the SFX-by-function taste table and the "sync to the exact landing frame" rule.

The palette, fonts, motion numbers, chart/counter/price-tag components, the review app and
the skills are new work for this kit. Nothing from the original repo's media library is
included.

MIT License text (original): https://github.com/hassancs91/claude-faceless-shorts-creator/blob/main/LICENSE

## remotion-dev/skills

`.claude/skills/remotion-*` are the official Remotion Agent Skills (v4.0.540), installed with
`npx skills add remotion-dev/skills`. Remotion is free for individuals and companies of ≤ 3
people; larger companies need a company license (https://remotion.dev/license).

## Research notes

Design numbers were cross-checked against HyperFrames' craft references (HeyGen, Apache-2.0),
the LottieFiles motion-design skill and Remotion's `video-layout.md`; see
`.claude/skills/reel-design-rules/SKILL.md` for which numbers come from which source and which
are this kit's own judgement.
