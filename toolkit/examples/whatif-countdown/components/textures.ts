// Procedural textures, generated ONCE per page at module level from a seeded PRNG (deterministic:
// every render tab builds byte-identical canvases). No image files.
import * as THREE from 'three';

/** mulberry32 — same PRNG as sfx/dsp.mjs */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hasDom = () => typeof document !== 'undefined';
const cache = new Map<string, THREE.Texture>();

/** Soft round sprite for Points (radial falloff) — points read as stars / glowing dust, not squares. */
export function dotTexture(): THREE.Texture | null {
  if (!hasDom()) return null;
  const hit = cache.get('dot');
  if (hit) return hit;
  const s = 64;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.28, 'rgba(255,255,255,0.85)');
  grd.addColorStop(0.6, 'rgba(255,255,255,0.18)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  cache.set('dot', tex);
  return tex;
}

// --- value noise (seeded lattice) -------------------------------------------------------------
function makeNoise(seed: number, size = 256) {
  const r = mulberry32(seed);
  const lat = new Float32Array(size * size);
  for (let i = 0; i < lat.length; i++) lat[i] = r();
  const sm = (t: number) => t * t * (3 - 2 * t);
  // tileable in x (u wraps around the sphere), clamped in y
  return (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = sm(x - xi);
    const yf = sm(y - yi);
    const at = (i: number, j: number) => lat[(((j % size) + size) % size) * size + (((i % size) + size) % size)];
    const a = at(xi, yi);
    const b = at(xi + 1, yi);
    const c = at(xi, yi + 1);
    const d = at(xi + 1, yi + 1);
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
  };
}

/**
 * Planet albedo (equirectangular, w × w/2): glowing white with blue-ish fBm "weather" bands and
 * a few deeper blue basins. Generated once; ~20 ms at 1024 px.
 */
export function planetTexture(seed = 11, w = 1024): THREE.Texture | null {
  if (!hasDom()) return null;
  const key = `planet-${seed}-${w}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const h = w / 2;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  const img = g.createImageData(w, h);
  const n1 = makeNoise(seed);
  const n2 = makeNoise(seed + 101);
  const period = 16; // lattice cells around the equator at octave 0 (wraps: multiples of the lattice)
  const fbm = (n: ReturnType<typeof makeNoise>, x: number, y: number, oct: number) => {
    let s = 0;
    let amp = 0.5;
    let f = 1;
    for (let o = 0; o < oct; o++) {
      s += amp * n(x * f, y * f);
      amp *= 0.5;
      f *= 2;
    }
    return s;
  };
  for (let j = 0; j < h; j++) {
    const lat = (j / h - 0.5) * Math.PI;
    for (let i = 0; i < w; i++) {
      const u = (i / w) * period;
      const v = (j / h) * period * 0.5;
      // domain warp → swirly cloud bands
      const wx = fbm(n2, u * 0.7, v * 0.7, 3) * 3.2;
      const cloud = fbm(n1, u + wx, v * 1.8 + wx * 0.4, 5);
      const basin = fbm(n2, u * 0.5 + 7, v * 0.5 + 3, 4);
      const band = 0.5 + 0.5 * Math.cos(lat * 6 + cloud * 4);
      let k = Math.min(1, Math.max(0, (cloud - 0.38) * 2.6)) * 0.75 + band * 0.12;
      const deep = Math.min(1, Math.max(0, (basin - 0.56) * 6));
      k = Math.min(1, k);
      // white (k=1) ← → blue (k=0); deep basins push to a saturated blue
      const R = 120 + 132 * k - 40 * deep;
      const G = 160 + 94 * k - 30 * deep;
      const B = 235 + 20 * k;
      const o = (j * w + i) * 4;
      img.data[o] = Math.max(0, Math.min(255, R));
      img.data[o + 1] = Math.max(0, Math.min(255, G));
      img.data[o + 2] = Math.max(0, Math.min(255, B));
      img.data[o + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  cache.set(key, tex);
  return tex;
}
