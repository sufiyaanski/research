import { Config } from "@remotion/cli/config";

// Three.js needs ANGLE (or swangle without GPU). See https://www.remotion.dev/docs/gl-options
// "angle" on a desktop with a GPU; "swangle" (SwiftShader-ANGLE) on a machine with no GPU (this box, CI, Lambda).
Config.setChromiumOpenGlRenderer(process.env.REMOTION_GL === "angle" ? "angle" : "swangle");
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setConcurrency(2);
