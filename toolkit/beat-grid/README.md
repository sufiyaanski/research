# beat-grid

Shot list as **states on a beat grid**. Everything is in **frames** (30 fps); seconds exist only in VO
word-timing inputs and are converted once by `make-beats.mjs`.

| file | what |
|---|---|
| `types.ts` | `ShotList` / `Shot` / `SfxRef` zod schemas, `parseShotList()`, `BeatsFile` / `CaptionChunk` / `TimedWord` types. Pure — used by compositions and Node. |
| `shotlist.schema.json` | JSON Schema of the shot list (editor validation for YAML/JSON). |
| `grid.ts` | pure math: `bpmGrid()`, `voGrid()`, `normalizeWordsInput()`, `snapShotsToBeats()`, `beatIndexAt()`, `nearestBeatIndex()`. |
| `useBeats.ts` | hooks: `useBeatGrid`, `useCaptionChunk`, `usePop`, `useShot` (all from `useCurrentFrame()` only). |
| `index.ts` | barrel for compositions: `import { useShot, parseShotList } from '../../beat-grid'`. |
| `load-shotlist.mjs` | Node: `loadShotList(file)` — YAML or JSON → validated, warns on unknown sfx ids. |
| `make-beats.mjs` | CLI: BPM grid, VO grid, or snap a shot list to a grid. |
| `example/` | 15 s / 120 BPM shot list (YAML), VO word timings, and every generated file. |

## Shot list

```yaml
id: ExampleAnchoring        # = composition id
fps: 30
width: 1080
height: 1920
durationInFrames: 450
bpm: 120                    # optional; or beatsFile: beats.bpm.json (relative to this file)
shots:
  - id: hook
    start: 0                # global frame, inclusive
    end: 90                 # exclusive = next shot's start (shots must be contiguous)
    beat: 0                 # beat index it starts on (filled by --from-shotlist)
    action: $429 tag slams onto the machine
    caption: Never meant to sell      # 3–5 words (warned)
    sfx:
      - { id: thump, at: 20 }         # at = frames RELATIVE TO SHOT START where the PEAK lands
      - { id: pop, at: 20, gain: -6 } # gain in dB
    state: $429 tag on the machine    # what the shot's LAST frame shows
```

Errors (throw): schema, `end ≤ start`, gaps/overlaps, end past duration, duplicate ids.
Warnings: caption not 3–5 words, sfx id not in `public/sfx/catalog.json`, cue outside its shot, not 30 fps / 1080×1920.

## make-beats.mjs

```bash
# BPM — frames/beat = fps*60/BPM (float); beat i = round(offset + i*fpb/subdivide), never accumulated
node beat-grid/make-beats.mjs --bpm 120 --duration 15 --fps 30 [--offset 0] [--subdivide 2] [--bars 4] --out beats.json

# VO — gen_voice.py beats.json (vo[].words[{w,start,end}] s) or a plain [{w,start,end}] list
node beat-grid/make-beats.mjs --vo words.json [--lead 1] [--min-on 0.6] [--pause 0.25] [--chars 16] [--bridge 0.2] \
     [--pop-regex '\$|%|price|cost|free|cheap|expensive|save|sale|\d'] [--duration 15] --out vo-beats.json

# SNAP — shot starts → nearest beat, prints drift, writes the JSON a composition imports
node beat-grid/make-beats.mjs --from-shotlist shots.yaml [--beats beats.json] --out shots.json [--max-drift 3]
```

Output `beats.json`: `{ fps, source: 'bpm'|'vo', bpm?, framesPerBeat?, beats: number[], downbeats?,
words?: [{w,start,end}], phrases?: [{start,end,text}], chunks?: [{text,start,end,pops,wordStart,wordEnd}], pops?, warnings? }`.
BPM `downbeats` = bar starts; VO `downbeats` = phrase starts, `beats` = word onsets.

VO chunking: phrases split on a pause ≥ 0.25 s or punctuation → short phrases merge across soft
boundaries → long phrases split evenly into 3–5-word chunks that fit 2 lines and never end on a weak
word ("was", "the", "to" …). Chunk start = first word − lead (1 f); end ≥ start + 0.6 s, extended into
the gap but never past the next chunk; gaps ≤ 0.2 s are bridged so captions don't blink.

## Hooks (compositions)

```tsx
import { parseShotList, useBeatGrid, useCaptionChunk, usePop, useShot, type BeatsFile } from '../../beat-grid';
import shots from './shotlist.json';          // JSON — webpack can't import YAML; use --from-shotlist --out
import beats from './beats.bpm.json';
import vo from './beats.vo.json';
const { shotList } = parseShotList(shots);

const g = useBeatGrid(beats as BeatsFile);    // { beatIndex, beatProgress, framesSinceBeat, framesToNextBeat, onBeat(n?, window=2), pulse(frames=8) }
const c = useCaptionChunk(vo as BeatsFile);   // { chunk, index, localFrame, progress, words: [{w,start,end,progress,active,spoken,pop}] }
const s = usePop((vo as BeatsFile).pops ?? [], { from: 1, peak: 1.12, frames: 6 }); // scale, centred on the spoken frame, inOut(cubic)
const { shot, localFrame, progress, next } = useShot(shotList);
```

All take global frames. Inside `<Sequence from={X}>` pass `{ sequenceFrom: X }`.

## Example

`example/` was produced by:

```bash
python3 -I ../setup/tools/gen_voice.py --beats <tmp>/beats.json --mock --out-dir <tmp>/voice --public-dir '' --no-ts
cp <tmp>/beats.json beat-grid/example/words.example.json                         # gen_voice shape, mock 2.7 w/s
node beat-grid/make-beats.mjs --bpm 120 --duration 15 --out beat-grid/example/beats.bpm.json
node beat-grid/make-beats.mjs --bpm 128 --duration 15 --subdivide 2 --out beat-grid/example/beats.bpm128-8ths.json
node beat-grid/make-beats.mjs --vo beat-grid/example/words.example.json --duration 15 --out beat-grid/example/beats.vo.json
node beat-grid/make-beats.mjs --from-shotlist beat-grid/example/shotlist.yaml --out beat-grid/example/shotlist.snapped.json --max-drift 8
```
