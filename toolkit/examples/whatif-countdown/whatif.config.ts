// Episode config — "What if Earth stopped spinning for 5 seconds?" (the WhatIfDemo composition).
// EVERYTHING that changes per episode lives here; the components only read it. Times are seconds.
// Facts and sources for every claim/number: facts.md. Format rules: README.md.
//
// Validate + derived files:
//   node examples/whatif-countdown/make-shotlist.mjs                       # validate, write shotlist.json
//   node sfx/drone-bed.mjs --config examples/whatif-countdown/whatif.config.ts   # the score (public/music/…)
import type { WhatIfConfigInput } from './schema';

// Singapore (1.35° N) turns east at 465.1 m/s × cos 1.35° ≈ 465 m/s ≈ 1,525.6 ft/s (facts.md #1–2).
// The "flown" counter is that speed × virtual seconds elapsed: 1 s → 1,526 ft … 4.333 s → 6,611 ft.
const FT_PER_S = 1525.6;
const SLOW = 6;
const SWITCH = 4;
/** reel time → virtual seconds elapsed since the switch (phase B) */
const v = (t: number) => (t - SWITCH) / SLOW;

const config = {
  id: 'spin-stop',
  durationSec: 45,
  fps: 30,
  title: { pre: 'What if ', keyword: 'Earth', post: ' stopped\nspinning for 5 seconds?' },
  titleOut: 3.6,
  keywordColor: '#8EC5FF',
  icon: 'globe-spin',
  phaseA: { label: 'EARTH STOPS IN', realSeconds: SWITCH, subLabel: 'SINGAPORE · 1.35° NORTH' },
  phaseB: {
    label: 'EARTH SPINS AGAIN IN',
    virtualSeconds: 5,
    slowFactor: SLOW,
    subLabels: [
      { from: 4, to: 10, text: `TIME SLOWED DOWN ${SLOW}×` },
      { from: 10, to: 16, counter: { from: Math.round(FT_PER_S * v(10)), to: Math.round(FT_PER_S * v(16)), prefix: "YOU'VE FLOWN ", suffix: ' FT EAST' } },
      { from: 16, to: 24, text: '4× THE RECORD WIND SPEED' },
      { from: 24, to: 34, counter: { from: Math.round(FT_PER_S * v(24)), to: Math.round(FT_PER_S * v(34)), prefix: "YOU'VE FLOWN ", suffix: ' FT EAST' } },
    ],
  },
  phaseC: {
    label: 'EARTH IS',
    bigText: 'SPINNING',
    subLabels: [
      { from: 34, to: 37.5, text: 'SINGAPORE, 5 SECONDS LATER' },
      { from: 37.5, to: 41, text: 'SUNRISE NOW RUNS 5 SECONDS LATE' },
    ],
  },
  lines: [
    { text: "You're having a picnic in Singapore.", start: 0.6, end: 3.4 },
    { text: "Earth stops spinning. You don't.", start: 4.4, end: 7.1 },
    { text: 'You keep flying east at over 1,000 mph.', start: 8.2, end: 11.2 },
    { text: "The air flies with you, so there's no wind.", start: 12.4, end: 15.2 },
    { text: 'But the trees and buildings stop dead.', start: 16.4, end: 19.1 },
    { text: 'So the air hits them faster than sound.', start: 20.2, end: 23.2 },
    { text: 'Up in orbit, nothing changes at all.', start: 25.8, end: 28.6 },
    { text: 'Satellites were never touching the ground.', start: 29.6, end: 32.6 },
    { text: 'The ground jerks back to 1,000 mph.', start: 34.3, end: 36.9 },
    { text: 'Everything that had stopped gets hit again.', start: 37.7, end: 40.2 },
  ],
  acts: [
    {
      id: 'park',
      start: 0,
      end: 4,
      look: 'normal',
      action: 'calm push-in on three friends picnicking in a city park, skyline behind; title + real-time countdown',
      // round 2: pulled back (fov 40, ≈ 20 m) so the picnic sits x 560–1040, y 840–1090: clear of the HUD and the narration band
      camera: { from: { pos: [-0.9, 4.9, 22], look: [-2.1, 0.7, 0] }, to: { pos: [-0.5, 4.6, 20], look: [-2.0, 0.6, 0] }, fov: 40 },
      people: { mood: 'happy', pose: 'sit' },
    },
    {
      id: 'switch',
      start: 4,
      end: 10,
      look: 'xray',
      action: 'the world turns to white edges on black; trees and skyline stream west while the picnic keeps flying east',
      // round 2: starts on the park's end pose, pushes in; picnic stays right of the HUD, above y 1120
      camera: { from: { pos: [-0.5, 4.6, 20], look: [-2.0, 0.6, 0] }, to: { pos: [-0.3, 4.3, 18.5], look: [-1.7, 0.62, 0] }, fov: 40, shake: 0.12 },
      flow: [-5, 0, 0],
      people: { mood: 'shocked', pose: 'shocked' },
      sfx: [
        { id: 'power-down', at: 0, gain: 0 },
        { id: 'thump', at: 0, gain: 0 },
      ],
    },
    {
      id: 'hands',
      start: 10,
      end: 16,
      look: 'hands',
      action: 'POV: your own wireframe hands; the star-point ground and trees rush toward and under you',
      camera: { from: { pos: [0, 2.3, 0.4], look: [12, 0.2, 0.2] }, to: { pos: [0, 2.3, 0.4], look: [12, 0.5, -0.6] }, fov: 50 },
      flow: [-6, 0, 0],
      sfx: [{ id: 'twinkle', at: 0.3, gain: -2 }],
    },
    {
      id: 'wind',
      start: 16,
      end: 20,
      look: 'glow',
      action: 'the skyline, bolted to the ground, takes the wind: streaks race east and the edges start to glow',
      // round 3: lower and back — trees (bolted down) in front of the towers, canopies ripped off by the wind
      camera: { from: { pos: [-14, 3.2, -68], look: [6, 16, -150] }, to: { pos: [-11, 3, -74], look: [8, 17, -150] }, fov: 50 },
      glow: [0.15, 0.5],
      streakDir: [1, 0, 0],
      sfx: [{ id: 'whoosh', at: 0, gain: 0 }],
    },
    {
      id: 'shock',
      start: 20,
      end: 24,
      look: 'glow',
      action: 'low angle up the towers: the windows burst into sparkles in a wave from west to east, glow to max',
      // round 3: wider — three towers, their window grids flash and shed shards in a west→east wave
      camera: { from: { pos: [-8, 2.5, -96], look: [6, 30, -152] }, to: { pos: [-7, 2.5, -100], look: [7, 31, -152] }, fov: 54 },
      glow: [0.5, 1],
      streakDir: [1, 0, 0],
      burst: [0.3, 3.2],
      sfx: [
        { id: 'twinkle', at: 0.6, gain: -3 },
        { id: 'noise-wall', at: 4, gain: -1 },
      ],
    },
    {
      id: 'flash',
      start: 24,
      end: 25,
      look: 'whiteout',
      action: 'white-out (the shock front)',
      sfx: [{ id: 'impact', at: 0, gain: 3 }],
    },
    {
      id: 'moon',
      start: 25,
      end: 30,
      look: 'space',
      action: 'scale jump: the glowing planet in space; the dark Moon slides across in front',
      camera: { from: { pos: [0, 0, 80], look: [-4.3, -12, 0] }, to: { pos: [0, 0, 74], look: [-4.0, -11.2, 0] }, fov: 36 },
      moon: [0.4, 4.8],
      sfx: [{ id: 'whoosh', at: 2.2, gain: -4 }],
    },
    {
      id: 'orbit',
      start: 30,
      end: 34,
      look: 'space',
      action: 'low orbit: the bright curved horizon fills the frame, a satellite drifts by untouched',
      camera: { from: { pos: [0, 12.8, 0.6], look: [9.03, 8.49, 0.6] }, to: { pos: [0, 12.6, -0.6], look: [9.03, 8.2, -0.9] }, fov: 50 },
      sfx: [{ id: 'riser', at: 4, gain: -3 }],
    },
    {
      id: 'respin',
      start: 34,
      end: 40.2,
      look: 'pointcloud',
      action: 'the park and the friends rebuild as a blue point cloud; streaks shoot up; slow orbit',
      // round 2: the opening framing again ("5 seconds later"), orbiting ≈ 15°; HUD over empty ground
      camera: { from: { pos: [-3.5, 4.6, 19.5], look: [-2.2, 0.6, 0] }, to: { pos: [1.5, 4.6, 19.6], look: [-1.8, 0.6, 0] }, fov: 40, shake: 0.15 },
      glow: [0.6, 0.35],
      streakDir: [0, 1, 0],
      people: { mood: 'worried', pose: 'sit' },
      sfx: [
        { id: 'impact', at: 0, gain: 2 },
        { id: 'glitch', at: 0.6, gain: -3 },
      ],
    },
    { id: 'blank', start: 40.2, end: 41, look: 'blank', action: 'near-black beat before the end card' },
    {
      id: 'end',
      start: 41,
      end: 45,
      look: 'endcard',
      action: 'end card: the question again + one fact line (loops into frame 0)',
      sfx: [{ id: 'thump', at: 0, gain: -2 }],
    },
  ],
  endCard: { factLines: ['THE EQUATOR SPINS AT 1,037 MPH', "AND YOU'RE RIDING IT RIGHT NOW"], factDelay: 1, background: '#121214' },
  world: { seed: 7, place: 'a city park in Singapore' },
  audio: { bed: 'music/whatif-spin-stop.wav', bedVolume: 1, sfxMasterDb: -6 },
} satisfies WhatIfConfigInput;

export default config;
