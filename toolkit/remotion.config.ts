// Remotion CLI config for the toolkit. Applies to `npx remotion ...` (studio/render/still).
// The programmatic scripts (critique --fast) pass the same values explicitly, because this file
// does NOT apply to the Node renderer API.
import { Config } from '@remotion/cli/config';

Config.setEntryPoint('./src/index.ts');
Config.setPublicDir('./public');

// FPS: every toolkit composition is 1080x1920 @ 30 fps (set on <Composition>, see src/Root.tsx).
// Never hard-code 30 in components — read `fps` from useVideoConfig(); beat grids carry their own
// `fps` and loadShotList()/parseShotList() refuse a shot list whose fps disagrees.

// JPEG frames: ~3x faster than PNG and what the h264 pipeline wants. PNG only for alpha.
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(90);
Config.setOverwriteOutput(true);

// h264 CRF 18 = visually lossless for motion graphics, within platform limits.
Config.setCodec('h264');
Config.setCrf(18);
Config.setPixelFormat('yuv420p');
Config.setConcurrency(null);

// OpenGL for @remotion/three scenes (the blocky character). `angle` on a desktop with a GPU;
// `swangle` (CPU) on a box without one — CI, cloud sandbox:  REMOTION_GL=swangle npx remotion ...
// (`swiftshader` / `egl` fail with "Error creating WebGL context".)
Config.setChromiumOpenGlRenderer((process.env.REMOTION_GL as 'angle' | 'swangle' | undefined) ?? 'angle');

// Proxy / sandbox with a private CA: Google Fonts fail with ERR_CERT_AUTHORITY_INVALID in
// headless Chrome. Opt in with REMOTION_IGNORE_CERT_ERRORS=1.
if (process.env.REMOTION_IGNORE_CERT_ERRORS === '1') Config.setChromiumIgnoreCertificateErrors(true);
