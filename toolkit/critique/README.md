# critique — the self-critique loop

Render the **middle frame of every shot**, look at them at phone size, score each shot 1–10 on
**story / composition / motion / type / sync**, fix the 3 worst, repeat. Max 3 rounds.

> Fix the 3 worst shots (lowest total; ties → lowest sync). Lock everything that scored ≥ 8 (don't
> touch it). Re-render. Repeat until every shot is ≥ 8 in every column. Max 3 rounds; after round 3
> ship the best round and log what's still under 8.

```bash
# round 1 (default renderer: `npx remotion still` per shot; --fast = bundle once + renderStill)
REMOTION_IGNORE_CERT_ERRORS=1 node critique/critique.mjs ToolkitSmoke --shotlist src/smoke/smoke.shotlist.json [--fast] [--scale 0.5] [--gl swangle]
#   -> critique/rounds/ToolkitSmoke-round-1.md          scoring template (also printed)
#   -> critique/rounds/ToolkitSmoke-round-1-sheet.jpg   contact sheet labelled "N. shot fFRAME"
#   -> critique/rounds/stills/ToolkitSmoke-r1/*.png     stills (git-ignored)

# fill the story..sync cells (integers 1–10), then:
node critique/score.mjs critique/rounds/ToolkitSmoke-round-1.md [--write] [--json]
```

- `--round` defaults to the last round file + 1; `--round 4` is refused (exit 4).
- Round N > 1 reads round N−1: shots that were ≥ 8 everywhere come pre-filled and marked 🔒 (locked).
- Middle frame = `min(end − 1, floor((start + end) / 2))`.
- `REMOTION_IGNORE_CERT_ERRORS=1` behind a private-CA proxy (Google Fonts); `--gl swangle` for three.js on a box with no GPU.

`score.mjs` exit codes: **0** stop rule met → ship · **3** continue (prints the 3 shots to fix) ·
**4** round 3 still under 8 → ship the best round (fewest sub-8 cells, then highest mean total; it
names it) and log the cells under 8 · **1** unreadable/unscored/round > 3. `--write` puts totals and a
verdict block into the round file.

Round file format (parsed by `rounds-lib.mjs`): rows between `<!-- SCORES:BEGIN -->` and
`<!-- SCORES:END -->`, columns `# | shot | frames | mid frame | caption | action → end state | story |
composition | motion | type | sync | total | notes`.

Example: `rounds/ToolkitSmoke-round-1.md` + `rounds/ToolkitSmoke-round-1-sheet.jpg` (blank template, round 1).
