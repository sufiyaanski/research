// Remotion CLI config. Applies to `npx remotion ...` commands only; the programmatic
// scripts in remotion/scripts/ pass the same values explicitly.
import { Config } from '@remotion/cli/config';

// Episodes are 1080x1920 @ 60 fps. Static assets (none required by the demo) live in
// remotion/public and are referenced with staticFile().
Config.setPublicDir('./remotion/public');
Config.setEntryPoint('./remotion/src/index.ts');

// JPEG frames are ~3x faster to encode than PNG at 60 fps and are what the h264 pipeline
// wants anyway. Use PNG only for transparent output.
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(90);
Config.setOverwriteOutput(true);

// 60 fps doubles the frame count. Concurrency `null` = half the CPU cores (Remotion's
// default); raise it on a big machine (`--concurrency=8`) or lower it if Chrome runs out
// of memory. Draft renders use --scale=0.5 to quarter the pixel work.
Config.setConcurrency(null);

// h264 at CRF 18 is visually lossless for motion graphics and well within platform limits.
Config.setCodec('h264');
Config.setCrf(18);
Config.setPixelFormat('yuv420p');

// OpenGL renderer for @remotion/three scenes (Q-ROSITY character). `angle` is right for a desktop
// with a GPU; on a machine WITHOUT a GPU (CI, cloud sandbox, Lambda) use `swangle`:
//   REMOTION_GL=swangle npx remotion still ...      (CLI; this config)
//   node remotion/scripts/frames.mjs <Comp> beats --gl=swangle   (scripts pass chromiumOptions.gl)
// `swiftshader` and `egl` both fail with "THREE.WebGLRenderer: Error creating WebGL context".
// https://www.remotion.dev/docs/gl-options
Config.setChromiumOpenGlRenderer((process.env.REMOTION_GL as 'angle' | 'swangle' | undefined) ?? 'angle');

// Corporate proxy / sandbox with a private CA: `REMOTION_IGNORE_CERT_ERRORS=1 npx remotion ...`
if (process.env.REMOTION_IGNORE_CERT_ERRORS === '1') Config.setChromiumIgnoreCertificateErrors(true);
