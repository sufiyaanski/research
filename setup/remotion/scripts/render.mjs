#!/usr/bin/env node
// Render ONE composition to h264 mp4.
//
//   node remotion/scripts/render.mjs SignalAnchoring                 # final: scale 1, 1080x1920 @ 60 fps
//   node remotion/scripts/render.mjs SignalAnchoring --scale=0.5     # draft: 540x960, ~4x faster
//   node remotion/scripts/render.mjs SignalAnchoring --out=out/custom.mp4 --crf=18 --concurrency=8
//
// Output: out/<Comp>.mp4 (or out/<Comp>-draft.mp4 when scale < 1). Then run:
//   node remotion/scripts/check-media.mjs out/<Comp>.mp4
// Equivalent CLI: `npx remotion render SignalAnchoring out/SignalAnchoring.mp4 --scale=0.5`.
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const id = args[0];
const opt = (name, def) => {
  const a = args.find((x) => x.startsWith(`--${name}=`));
  return a ? a.split('=')[1] : def;
};
const SCALE = Number(opt('scale', '1'));
const CRF = Number(opt('crf', '18'));
const CONCURRENCY = opt('concurrency', null);
const BROWSER = process.env.REMOTION_BROWSER_EXECUTABLE || opt('browser', undefined);
// Behind a corporate proxy / sandbox with a private CA, Google Fonts fail with
// ERR_CERT_AUTHORITY_INVALID inside headless Chrome. Opt in with REMOTION_IGNORE_CERT_ERRORS=1.
const CHROMIUM = { gl: 'angle', ignoreCertificateErrors: process.env.REMOTION_IGNORE_CERT_ERRORS === '1' };

if (!id || id.startsWith('--')) {
  console.error('usage: node remotion/scripts/render.mjs <CompId> [--scale=1] [--crf=18] [--concurrency=N] [--out=path.mp4]');
  process.exit(1);
}

const outDir = path.join(root, 'out');
mkdirSync(outDir, { recursive: true });
const out = path.resolve(root, opt('out', path.join('out', `${id}${SCALE < 1 ? '-draft' : ''}.mp4`)));

console.log('bundling...');
const serveUrl = await bundle({
  entryPoint: path.join(root, 'remotion', 'src', 'index.ts'),
  publicDir: path.join(root, 'remotion', 'public'),
  onProgress: () => {},
});
const composition = await selectComposition({ serveUrl, id, inputProps: {}, browserExecutable: BROWSER, chromiumOptions: CHROMIUM });
const { fps, durationInFrames, width, height } = composition;
console.log(`${id}: ${width * SCALE}x${height * SCALE} @ ${fps} fps, ${durationInFrames} frames (${(durationInFrames / fps).toFixed(1)} s), crf ${CRF}`);

const t0 = Date.now();
await renderMedia({
  serveUrl,
  composition,
  outputLocation: out,
  codec: 'h264',
  crf: CRF,
  pixelFormat: 'yuv420p',
  imageFormat: 'jpeg',
  jpegQuality: 90,
  scale: SCALE,
  overwrite: true,
  concurrency: CONCURRENCY ? Number(CONCURRENCY) : null,
  browserExecutable: BROWSER,
  chromiumOptions: CHROMIUM,
  onProgress: ({ progress, renderedFrames }) => {
    process.stdout.write(`\r  ${Math.round(progress * 100)}%  (${renderedFrames}/${durationInFrames} frames)   `);
  },
});
process.stdout.write('\n');
console.log(`-> ${path.relative(root, out)}  in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
console.log(`next: node remotion/scripts/check-media.mjs ${path.relative(root, out)}`);
