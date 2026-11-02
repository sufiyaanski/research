# 01b — Remotion Agent Skills, HyperFrames and other code-video frameworks: VERBATIM rule files

Research date: 2026-11-02. Compiled for Sufiyaan (The Signal: 60 fps 1080×1920 motion-graphic reels, Claude Code + Remotion; Q-ROSITY: blocky-character "what if" reels). Goal: copy the actual rule files the best Claude+video setups use so first renders come out right.

Method: every repo below was `git clone --depth 1`'d on 2026-11-02; stars/pushed_at come from the GitHub search API the same day; every quoted file was `cat`'d into this document unchanged (outer fences use four backticks so inner ```` ``` ```` fences survive). Remotion docs were fetched as Markdown by appending `.md` to the URL.

Note on your own repo: `/home/user/research/setup/.claude/skills/` already contains the 13 official Remotion skills at **version 4.0.540** (frontmatter `version: 4.0.540`), identical to the `remotion-dev/skills` head quoted here. So Claude Code sessions started in `setup/` already load them.

---

## 0. Repo table

| Repo | Link | Stars | Last push / commit | License | What it is |
|---|---|---|---|---|---|
| remotion-dev/skills | https://github.com/remotion-dev/skills | 6,067 | 2026-11-02 (commit c7cb2fd "Update template", 09:50 +0100) | none stated in repo (mirror of `packages/skills` in remotion-dev/remotion, which is Remotion License / NOASSERTION) | Official Remotion Agent Skills, 13 skills, v4.0.540 |
| remotion-dev/remotion | https://github.com/remotion-dev/remotion | 69,905 | 2026-11-02 | NOASSERTION (Remotion License) | The framework |
| remotion-dev/template-tiktok | https://github.com/remotion-dev/template-tiktok | 301 | 2026-11-02 | none in repo (Remotion terms) | Whisper.cpp → `createTikTokStyleCaptions` word-highlight captions, 1080×1920 |
| remotion-dev/template-prompt-to-motion-graphics-saas | https://github.com/remotion-dev/template-prompt-to-motion-graphics-saas | 292 | 2026-11-02 | none | Prompt → Remotion code SaaS; ships 8 "guidance skill" .md files (spring, typography, social-media, charts…) + system prompt + frame-capture-for-AI |
| remotion-dev/template-audiogram | https://github.com/remotion-dev/template-audiogram | 275 | 2026-11-02 | none | Podcast audiogram: windowed audio viz + word-timed captions |
| remotion-dev/template-code-hike | https://github.com/remotion-dev/template-code-hike | 222 | 2026-11-02 | none | Code snippet token-transition animations |
| remotion-dev/template-prompt-to-video | https://github.com/remotion-dev/template-prompt-to-video | 169 | 2026-11-02 | none | OpenAI+ElevenLabs story → images+voiceover → timeline.json → TikTok video |
| remotion-dev/template-three | https://github.com/remotion-dev/template-three | 117 | 2026-11-02 | MIT | Remotion + React Three Fiber boilerplate |
| remotion-dev/template-music-visualization | https://github.com/remotion-dev/template-music-visualization | 25 | 2026-11-02 | none | Spectrum/waveform music visualizer for social |
| remotion-dev/template-stargazer | — | — | — | — | NOT FOUND under remotion-dev (GitHub search `stargazer user:remotion-dev` returned nothing); the "Stargazed" data-driven composition exists only as a test corpus inside HyperFrames' `remotion-to-hyperframes` skill |
| heygen-com/hyperframes | https://github.com/heygen-com/hyperframes | 77,398 | 2026-11-02 (commit 618c486 10:03 UTC) | Apache-2.0 | "Write HTML. Render video. Built for agents." HTML+GSAP → headless Chrome → FFmpeg |
| heygen-com/hyperframes-launches | https://github.com/heygen-com/hyperframes-launches | 650 | 2026-10-04 | Apache-2.0 | Open-source compositions behind HeyGen launch videos |
| heygen-com/hyperframes-community-skills | https://github.com/heygen-com/hyperframes-community-skills | 246 | 2026-10-27 | Apache-2.0 | Community HyperFrames skills |
| nateherkai/herk-edit-kit | https://github.com/nateherkai/herk-edit-kit | 2,499 | 2026-10-14 | NOASSERTION | 15 Claude Code/Codex skills on HyperFrames for reels/Shorts; MOTION_PHILOSOPHY.md; 60 fps showreel skill |
| latent-spaces/brag | https://github.com/latent-spaces/brag | 19,968 | 2026-10-23 | MIT | One-command launch video of the project you just built (HyperFrames) |
| motion-canvas/motion-canvas | https://github.com/motion-canvas/motion-canvas | 19,642 | 2026-07-02 | MIT | TypeScript generator-based animation; **no AGENTS.md/CLAUDE.md/SKILL.md/.cursorrules in repo** |
| midrender/revideo | https://github.com/midrender/revideo | 4,165 | 2026-07-15 | MIT | Motion-Canvas fork, headless render API; README: "A scene is plain TypeScript, so Claude or Codex can produce one from a prompt." **No agent rule files in repo** |
| ManimCommunity/manim | https://github.com/ManimCommunity/manim | 42,128 | 2026-11-02 | MIT | Python math animation; **no agent rule files in repo** |
| 3b1b/manim | https://github.com/3b1b/manim | 95,995 | 2026-09-09 | MIT | Grant Sanderson's original |
| Yusuke710/manim-skill | https://github.com/Yusuke710/manim-skill | 190 | 2026-10-07 | MIT | Claude Code SKILL.md for ManimCE with Kokoro TTS + subtitles + viewer (quoted below) |
| LottieFiles/motion-design-skill | https://github.com/LottieFiles/motion-design-skill | 2,698 | 2026-05-18 | MIT | Universal motion-design principles skill (timing/easing/choreography tables) (quoted below) |
| greensock/gsap-skills | https://github.com/greensock/gsap-skills | 17,716 | 2026-07-29 | MIT | Official GSAP agent skills (not cloned; listed for completeness) |
| frankxai/awesome-motion-design-agent-skills | https://github.com/frankxai/awesome-motion-design-agent-skills | 91 | 2026-10-24 | CC0-1.0 | Curated list + 5 skills incl. `remotion-video-agent` (quoted below) |
| anthropics/skills | https://github.com/anthropics/skills | 186,563 | 2026-10-28 | Apache-2.0 (most); docx/pdf/pptx/xlsx source-available | Anthropic's example skills: canvas-design, algorithmic-art, frontend-design, slack-gif-creator… **no video/motion/Remotion skill** |
| junmer/mcp-server-lottiefiles | https://github.com/junmer/mcp-server-lottiefiles | 19 | 2025-04-29 | — | Unofficial LottieFiles search MCP (stale) |

---

## 1. Official Remotion Agent Skills (remotion-dev/skills, v4.0.540, commit c7cb2fd 2026-11-02)


Install: `npx skills add remotion-dev/skills` or `gh skill install remotion-dev/skills` or `npx remotion skills add` inside a Remotion project. Skill folders in the repo: `remotion-best-practices` (router; also embeds copies of every other skill as `REFERENCE.md` sub-folders), `remotion-captions`, `remotion-create`, `remotion-docs`, `remotion-interactivity`, `remotion-license`, `remotion-maps`, `remotion-markup`, `remotion-multimedia`, `remotion-render`, `remotion-saas`, `remotion-studio`, `remotion-upgrade`. Each skill folder also has `agents/openai.yaml` (Codex display metadata) and `assets/remotion-icon.svg`.

Full file list of `skills/remotion-markup/` (the one that matters for motion graphics): SKILL.md, 3d.md, arabic-text.md, audio-visualization.md, audio.md, calculate-metadata.md, color-correction.md, compositions.md, connected-compositions.md, cropping.md, effects.md, embedding-videos.md, ffmpeg.md, gifs.md, google-fonts.md, html-in-canvas.md, images.md, light-leaks.md, local-fonts.md, lottie.md, measuring-dom-nodes.md, measuring-text.md, motion-blur.md, multi-scene-video.md, parameters.md, sequencing.md, sfx.md, silence-detection.md, text-highlights.md, timing-props.md, timing.md, transitions.md, video-editing.md, voiceover.md, plus a `remotion-maps/` sub-tree.

**Not present in the official skills (verified by listing every file):** no file about `@remotion/animated-emoji`, no dedicated charts rule, no `evolvePath`/`@remotion/paths` rule beyond the `interpolatePaths`/`strokeDasharray` guidance inside `remotion-interactivity/SKILL.md`, no Lambda setup beyond `remotion-saas/rendering.md`, and no 'render a still and look at it' instruction beyond the "Visual checks" paragraph in `remotion-markup/SKILL.md` and the `--frames` tip in `remotion-render/SKILL.md`.

### 1.1 README.md (repo root)

Source: `remotion-dev/skills/README.md`

````markdown
<!-- This file is generated by packages/skills/scripts/sync-readme.ts. -->

# Remotion Agent Skills

Remotion maintains a list of [Agent Skills](https://agentskills.io/home) that define best practices for working in Remotion projects.

These skills are useful for AI agents like Claude Code, Codex, Kimi Code or Cursor.

You can install them by running:

```bash
npx skills add remotion-dev/skills
```

Or install them with the GitHub CLI:

```bash
gh skill install remotion-dev/skills
```

You are also offered the option to add skills when you create a new Remotion project:

```bash
bun create video
```

For more information, see the [Remotion Agent Skills documentation](https://www.remotion.dev/docs/ai/skills).

## Available skills

### `/remotion-best-practices`

This skill encompasses all other skills.

Use it if you are not sure which specific skill to use.

### `/remotion-create`

Create a new Remotion project or composition.

> Example prompt: `/remotion-create Make a promo video for a record store`

### `/remotion-markup`

Best practices for writing Remotion React markup.

Use this for knowledge about compositions, animations, layout, typography, media elements, effects, audio, fonts, timing.

> Example prompt: `/remotion-markup Create an animated title card using Inter.`

### `/remotion-studio`

Launch the Studio to see a preview of your video.

> Example prompt: `/remotion-studio`

### `/remotion-render`

Invoke a render into a video or a still.

> Example prompt: `/remotion-render`

### `/remotion-maps`

Best practices for creating map animations in Remotion.

Use this for static maps, animated routes and markers, geographic explainers, Mapbox, MapLibre, MapTiler, GeoJSON, and 3D geographic flyovers with CesiumJS.

> Example prompt: `/remotion-maps Animate a route from Los Angeles to New York and make the camera follow it.`

### `/remotion-captions`

Guidance for captions and subtitles.

### `/remotion-saas`

Architecture guidance for Remotion-powered apps and product integrations.

> Example prompt: `/remotion-saas Turn my video into a SaaS.`

### `/remotion-interactivity`

Guidance for making Remotion code [editable](https://www.remotion.dev/docs/studio/interactivity) in Studio.

Use this when elements are not selectable or editable as you would like them to be.

### `/remotion-docs`

Search the Remotion documentation and fetch any page as Markdown.

Use this to look up current API references, component props, and package guides before implementing.

> Example prompt: `/remotion-docs How to set up Remotion Lambda?`

### `/remotion-license`<AvailableFrom v="4.0.540" />

Find Remotion license information, FAQs, terms, and where to buy a license.

### `/remotion-upgrade`

Upgrade Remotion, related packages, compatible Mediabunny packages, and installed Remotion Agent Skills.

> Example prompt: `/remotion-upgrade`

### `/remotion-multimedia`

Guidance for browser-based multimedia handling with Mediabunny.

Use this for advice on how to get video and audio metadata.

````

### 1.2 remotion-best-practices/SKILL.md (the router — load this one)

Source: `skills/remotion-best-practices/SKILL.md`

````markdown
---
name: remotion-best-practices
description: Router for all Remotion skills
version: 4.0.540
---

## Preserve user changes

Users may make edits in the code outside of the conversation.

If you detect a surprising change made in the meanwhile, don't overwrite it, assume it was intentional or ask for confirmation.

## Creating a video

If the user asks to make, create, or build a new video or composition, load [Create a new Remotion video](./remotion-create/REFERENCE.md), whether or not a Remotion project already exists.

## New project setup

If no Remotion project currently exists, load [Create a new Remotion project](./remotion-create/REFERENCE.md)

## React Markup Best Practices

If you are writing Remotion React Markup, load [Remotion Markup Best Practices](./remotion-markup/REFERENCE.md)

## Maps

For static maps, animated routes and markers, geographic explainers, Mapbox, MapLibre, MapTiler, GeoJSON, or 3D geographic flyovers, load [Remotion Maps](./remotion-maps/REFERENCE.md).

## Multimedia

For achieving multimedia tasks in the browser, such as trimming, cropping videos, or getting metadata from them, load [Remotion Multimedia](./remotion-multimedia/REFERENCE.md)

## Improving Interactivity

By structuring the Remotion markup well, we can allow users to interactively change things in the Studio and write back to code. If relevant: [Interactivity Best Practices](./remotion-interactivity/REFERENCE.md)

## Open the preview

If the user asks to "make" a video, "create" a video, etc.
Don't render the video by default unless they are very explicit. They want to instead see an interactive preview.
As soon as the project can run, start Studio and open the preview in the browser before building or editing the composition. Keep it open while you work so the user can watch progress and steer.

### If you are using Cursor

Run Studio without `--no-open` so it opens the browser automatically:

```bash
npx remotion studio
```

### If you are using another agent client with an in-app browser

You can use the command above to let Studio open the browser, or run:

```bash
npx remotion studio --no-open
```

This will start a long-running process and print the server URL for the preview.  
If the server is already started, it will print the URL.
If you use `--no-open`, open the exact printed URL in the in-app browser and verify that Studio loads. Once a composition exists, verify that its video preview loads. If you cannot open it there, run Studio without `--no-open`.
You can visit a specific composition by navigating to `/[composition-id]`, for example `http://localhost:3000/MapAnimation`.

:::note
The Studio supports WebMCP tools.
:::

### If you do not have an in-app browser

This will open the Studio in the browser or refocus it if it is already open.

```bash
npx remotion studio
```

### More options

To launch a project in Remotion Studio, open its exact local URL, or configure Studio CLI flags, load [Remotion Studio](./remotion-studio/REFERENCE.md).

## Render the video

Only render if the user is very explicit in asking for it.  
E.g. "Render the video", "Export", "Give me the MP4".

The preview also has a more intuitive rendering interface, so consider using it instead of the command line for rendering.

```
npx remotion render
```

For more options, see [Rendering](./remotion-render/REFERENCE.md).

For advanced rendering beyond simple `npx remotion render`, see: [Rendering Best Practices](./remotion-render/REFERENCE.md)

## Captions

When working with Captions, load [Remotion Captions](./remotion-captions/REFERENCE.md).

## Creating a SaaS, automation or application

Use the [Remotion SaaS skill](./remotion-saas/REFERENCE.md) for knowledge about Remotion-powered SaaS apps, such as `<Player>`, rendering on Lambda, Vercel, Cloudflare, via Express.js, client-side rendering, or for finding the right SaaS template.

## Looking up Remotion APIs and documentation

To find and read current Remotion documentation, load [Remotion Docs](./remotion-docs/REFERENCE.md).

## Licensing

For Remotion license information, FAQs, terms, or buying a license, load [Remotion License](./remotion-license/REFERENCE.md).

## Upgrading

To upgrade Remotion, related packages, compatible Mediabunny packages, and installed Remotion Agent Skills, load [Remotion Upgrade](./remotion-upgrade/REFERENCE.md).

````

### 1.3 remotion-best-practices/agents/openai.yaml

Source: `skills/remotion-best-practices/agents/openai.yaml`

````yaml
interface:
  display_name: '/remotion-best-practices'
  short_description: 'Route Remotion tasks to the right workflow'
  icon_small: './assets/remotion-icon.svg'
  icon_large: './assets/remotion-icon.svg'
  brand_color: '#0B84F3'
  default_prompt: '$remotion-best-practices: Make a promo video for my product'

````

### 1.4 remotion-markup/SKILL.md (timing/useCurrentFrame/interpolate/Easing, media, effects list, visual checks)

Source: `skills/remotion-markup/SKILL.md`

````markdown
---
name: remotion-markup
description: Content, animation and effects best practices
version: 4.0.540
---

This is guidance for writing Remotion React Markup.
If this is not relevant, load Remotion Best Practices instead.

## Preserve user changes

Users may make edits in the code outside of the conversation.

If you detect a surprising change made in the meanwhile, don't overwrite it, assume it was intentional or ask for confirmation.

## General rules

Keep `useCurrentFrame()` in the smallest component that needs it. Extract
frame-dependent audio volume, titles, and overlays into their own components
instead of subscribing the whole composition or scene; otherwise unrelated
descendants re-render on every frame. Preserve the existing frame coordinates
when extracting across timing boundaries, and keep editable interpolations
inline on the item's props.

Inside a composition or scene component, get `fps` from `useVideoConfig()` for
all seconds-to-frames calculations, including timing props such as `from`,
`trimBefore` and `durationInFrames`. Keeping the expression on
the JSX node, such as `trimBefore={4 * fps}`, lets Studio edit the timing and
keeps it correct if the composition frame rate changes.

Drive animations using `useCurrentFrame()` and `interpolate()`.  
CSS `transition` or `animation` will not render correctly, they need to refactored.  
Tailwind animation class will not render correctly, they need to be refactored.

Use `Easing.bezier()` and `Easing.spring()` to customize timing.

Before choosing the markup hierarchy, read
editable timeline structure.
Choose editing units first, then the tracks or shared timing boundaries they
need. It includes a complete example with interactive components and their
registrations. For source-editable styles, schemas, and keyframes, see
Remotion Interactivity.

```tsx
import { useCurrentFrame, useVideoConfig, Easing, interpolate, Interactive } from "remotion";

export const FadeIn = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <Interactive.Div
      name="Title"
      style={{
        opacity: interpolate(frame, [0, 2 * fps], [0, 1], {
          extrapolateRight: "clamp",
          extrapolateLeft: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
      }}
    >
      Hello World!
    </Interactive.Div>
  );
};
```

Keep the `interpolate()` call inline in the `style` prop.
Use `scale`, `translate`, `rotate` CSS properties over `transform`.

```tsx
// 👍 Inline editable keyframes and transform shorthands
style={{
  scale: interpolate(frame, [0, 100], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.spring({damping: 200}),
    output: 'perceptual-scale' // For `scale` animations, use "output: 'perceptual-scale'"
  }),
  translate: interpolate(frame, [0, 100], ["0px 0px", "100px 100px"], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.spring({damping: 200}),
  }),
  rotate: interpolate(frame, [0, 100], ["20deg", "90deg"], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.spring({damping: 200}),
  }),
}}

// 👎 Non-inline values and transform strings become harder to edit in Studio
const scale = interpolate(frame, [0, 100], [0, 1]);

style={{
  transform: `scale(${scale})`,
}}
```

## Assets

Place assets in the `public/` folder at your project root.
Use `staticFile()` to reference files from the `public/` folder.

## Media components

Add video and audio using `<Video>` and `<Audio>` from `@remotion/media`.  
Add images using the `<CanvasImage>` component.
Add animated GIFs, APNG, WebP or AVIF images using `<AnimatedImage>`, use `@remotion/gif` if not using Chrome.
Use `staticFile()` for files in `public/` or pass a remote URL directly:

```tsx
import { Audio, Video } from "@remotion/media";
import { staticFile, CanvasImage, AnimatedImage } from "remotion";

export const MyComposition = () => {
  return (
    <>
      <Video src={staticFile("video.mp4")} style={{ opacity: 0.5 }} />
      <Audio src={staticFile("audio.mp3")} />
      <CanvasImage
        src={staticFile("logo.png")}
        style={{ width: 100, height: 100 }}
      />
      <Video src="https://remotion.media/video.mp4" />
      <AnimatedImage src={staticFile('nyancat.gif')} />
    </>
  );
};
```

If the composition is primarily a timeline of video or audio clips, read
[video-editing.md](video-editing.md) before choosing its source structure.

## Delaying, trimming

Use [sequencing](sequencing.md) to choose the timing boundary and
[timing props](timing-props.md) for the supported props and order of operations.

## Maps

See [Remotion Maps](./remotion-maps/REFERENCE.md) if wanting to include maps in the video.

## Text highlights and annotations

See [text-highlights.md](text-highlights.md) for text highlights (highlight markers), circles, underlines, strike-throughs, crossed-off text, boxes.

## Multi-scene videos

See [multi-scene-video.md](multi-scene-video.md) if planning to make a video with multiple subsequent scenes.

## Connected compositions

Read [connected compositions](connected-compositions.md) when a scene or group
needs its own editable timeline, or when handling a Studio pre-compose request.
It covers extraction, registration, inherited styles, and verification in both
the parent and standalone views.

## Voiceover

See [voiceover.md](voiceover.md) for adding an AI-generated voiceover to Remotion compositions using ElevenLabs TTS.

## Embedding Videos

See [embedding-videos.md](embedding-videos.md) for advanced knowledge about embedding videos - trimming, volume, speed, looping, pitch.

## Embedding Audio

See [audio.md](audio.md) for advanced audio features like trimming, volume, speed, pitch.

## Cropping

See [cropping.md](cropping.md) if needing to crop the visible rectangle of a component.

## Transitions

See [transitions.md](transitions.md) for scene transition patterns.

## Motion blur

When adding motion blur or a movement trail, read [motion-blur.md](motion-blur.md) for the preferred HTML-in-canvas approach, preview requirements, and alternatives.

## Visual and pixel effects

When adding a visual effect, first identify the element or group it should affect.
If the target component supports `effects` and a built-in effect below matches the
request, prefer that effect over a CSS approximation. For example, apply
`vignette()` directly to a `<Video>`'s `effects` prop when the vignette should
affect that video.

These components accept `effects` directly:

| Import from        | Components                                                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `remotion`         | `<Img>`, `<CanvasImage>`, `<AnimatedImage>`, `<Solid>`, `<HtmlInCanvas>`                                                      |
| `@remotion/media`  | `<Video>`                                                                                                                     |
| `@remotion/gif`    | `<Gif>`                                                                                                                       |
| `@remotion/rive`   | `<RemotionRiveCanvas>`                                                                                                        |
| `@remotion/shapes` | `<Arrow>`, `<Callout>`, `<Circle>`, `<Ellipse>`, `<Heart>`, `<Pie>`, `<Polygon>`, `<Rect>`, `<Spark>`, `<Star>`, `<Triangle>` |

Ordinary HTML elements, `<Interactive.*>` DOM wrappers, `<AbsoluteFill>`, and
`<Sequence>` do not accept `effects` directly. To apply effects to their content,
wrap them in `<HtmlInCanvas>` and put the `effects` prop on the wrapper.

For other elements, prefer regular HTML and CSS where suitable. Consider wrapping
a group in [`<HtmlInCanvas>`](html-in-canvas.md) when post-processing the whole
group is appropriate and the environment supports it.

Read [effects.md](effects.md) before applying an effect for imports, parameters,
and setup. It also covers reusable custom effects with `createEffect()` when no
built-in effect matches.

### Available effects

Built-in effects from `@remotion/effects`:

- Color and tone: `brightness()`, `colorCorrection()`, `colorKey()`, `contrast()`, `curves()`, `duotone()`, `exposure()`, `grayscale()`, `hue()`, `invert()`, `levels()`, `linearGradient()`, `linearGradientTint()`, `lut()`, `saturation()`, `shadowsHighlights()`, `thermalVision()`, `tint()`, `vibrance()`, `whiteBalance()`.
- Blur and trails: `blur()`, `lightTrail()`, `linearProgressiveBlur()`, `radialProgressiveBlur()`, `regionBlur()`, `zoomBlur()`.
- Lighting: `dropShadow()`, `longShadows()`, `glow()`, `lightLeak()`, `shine()`, `starburst()`, `vignette()`.
- Distortion and transforms: `barrelDistortion()`, `chromaticAberration()`, `cornerPin()`, `fisheye()`, `mirror()`, `noiseDisplacement()`, `scale()`, `skew()`, `tile()`, `uvTranslate()`, `wave()`, `xyTranslate()`.
- Textures and patterns: `burlap()`, `checkerboard()`, `contourLines()`, `dotGrid()`, `emboss()`, `flannel()`, `gridlines()`, `halftone()`, `halftoneLinearGradient()`, `lines()`, `liquidContours()`, `noise()`, `paper()`, `pattern()`, `rings()`, `scanlines()`, `speckle()`, `tvSignalOff()`, `waves()`, `whiteNoise()`, `zigzag()`.
- Edges: `outline()`, `roughenEdges()`, `shrinkwrap()`, `tear()`.
- Pixelation and transitions: `evolve()`, `linearProgressivePixelate()`, `pixelate()`, `pixelDissolve()`, `radialProgressivePixelate()`, `venetianBlinds()`.

## Color correction

Read [color-correction.md](color-correction.md) for primary adjustments with
`colorCorrection()`, tonal mapping with `levels()` or `curves()`, their Studio
editors, and 3D `.cube` color grades with `lut()`.

## 3D content

See [./3d.md](./3d.md) for 3D content in Remotion using Three.js and React Three Fiber.

## Sound effects

When needing to use sound effects, load the [./sfx.md](./sfx.md) file for more information.

## Audio visualization

When needing to visualize audio (spectrum bars, waveforms, bass-reactive effects), load the [./audio-visualization.md](./audio-visualization.md) file for more information.

## Maps

For static maps, animated routes and markers, geographic explainers, Mapbox, MapLibre, MapTiler, GeoJSON, or 3D geographic flyovers, load [Remotion Maps](./remotion-maps/REFERENCE.md).

## Captions

When dealing with captions or subtitles, load the Remotion Captions skill for more information.

## Arabic and right-to-left text

For Arabic, Persian, Urdu or Hebrew text, read [arabic-text.md](arabic-text.md): set the base direction, animate by word, and split letters only in a way that keeps them joined.

## Google Fonts

Is the recommended way to load fonts in Remotion. See [google-fonts.md](google-fonts.md) for how to load Google Fonts.

## Local fonts

See [local-fonts.md](local-fonts.md) for how to load local fonts.

## GIFs

See [gifs.md](gifs.md) for how to display GIFs synchronized with Remotion's timeline.

## Advanced Images

See [images.md](images.md) for sizing and positioning images, dynamic image paths, and getting image dimensions.

## Lottie animations

See [lottie.md](lottie.md) for embedding Lottie animations in Remotion.

## Timing

See [timing.md](timing.md) for more timing techniques for `interpolate()`.

## Parameterized videos

See [parameters.md](parameters.md) for making a composition parametrizable by adding a Zod schema.

## Measuring DOM nodes

See [measuring-dom-nodes.md](measuring-dom-nodes.md) for measuring DOM element dimensions in Remotion.

## Measuring text

See [measuring-text.md](measuring-text.md) for measuring text dimensions, fitting text to containers, and checking overflow.

## Using FFmpeg

For some video operations, such as trimming videos or detecting silence, FFmpeg should be used. Load the [./ffmpeg.md](./ffmpeg.md) file for more information.

## Silence detection

When needing to detect and trim silent segments from video or audio files, load the [./silence-detection.md](./silence-detection.md) file.

## Dynamic duration, dimensions and data

See [calculate-metadata.md](calculate-metadata.md) for dynamically set composition duration, dimensions, and props.

## Compositions and stills

Before registering `<Composition>` or `<Still>` elements, read [compositions.md](compositions.md) for source-editable registrations, folders, default props and nesting. For Studio navigation into a scene's own timeline, use [connected compositions](connected-compositions.md).

## Advanced sequencing

See [sequencing.md](sequencing.md) for more sequencing patterns - delay, trim, limit duration of items.

## Install modules

Use `npx remotion add` to add new packages with the right version:

```
npx remotion add @remotion/media
```

This goes for `@remotion/*` packages, `mediabunny`, `@mediabunny/*`, `zod`, and `@huggingface/transformers`.

## Visual checks

Open the Remotion Studio to check visual changes.
When changing timeline structure, inspect the full composition as well as any
connected components; verify the visible layers, cut timing, and synchronized
content.

You can also use Rendering to inspect one or several frames as images.

````

### 1.5 remotion-markup/timing.md (interpolate, Easing.spring/bezier, perceptual-scale, multi-keyframe, posterize)

Source: `skills/remotion-markup/timing.md`

````markdown
Drive motion with `interpolate()` over an explicit frame range. 
To customize timing, use **`Easing.bezier`** or `Easing.spring`.

A simple linear interpolation is done using the `interpolate` function.

```ts title="Going from 0 to 1 over 0.3 seconds"
import { interpolate } from "remotion";

const opacity = interpolate(frame, [0, 0.3 * fps], [0, 1]);
```

By default, the values are not clamped, so the value can go outside the range [0, 1].  
Here is how they can be clamped:

```ts title="Going from 0 to 1 over 0.3 seconds with extrapolation"
const opacity = interpolate(frame, [0, 0.3 * fps], [0, 1], {
  extrapolateRight: "clamp",
  extrapolateLeft: "clamp",
});
```

## Studio-editable animation patterns

When an animation should be editable in Remotion Studio, keep the `interpolate()` call directly in the `style` prop and prefer individual CSS transform properties:

```tsx
// 👍 Inline editable keyframes and transform shorthands
style={{
  scale: interpolate(frame, [0, 100], [0, 1]),
  translate: interpolate(frame, [0, 100], ["0px 0px", "100px 100px"]),
  rotate: interpolate(frame, [0, 100], ["20deg", "90deg"]),
}}

// 👎 Hidden values and transform strings become computed in Studio
const translateY = interpolate(frame, [0, 100], [0, 120]);
const rotation = interpolate(frame, [0, 100], [0, 20]);

style={{
  transform: `translateY(${translateY}px) rotate(${rotation}deg)`,
}}
```

Use `transform` strings only when individual CSS transform properties do not cover the effect, such as `skew()`, `perspective()`, or order-sensitive multi-transform chains.

## Spring easing

A nice push movement with no bounce:

```ts
import { interpolate, Easing } from "remotion";

const opacity = interpolate(frame, [0, 0.3 * fps], [0, 1], {
  easing: Easing.spring({damping: 200}),
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
```

## Bézier easing

Pass values like you would to a CSS cubic-bezier function.

```ts
import { interpolate, Easing } from "remotion";

const opacity = interpolate(frame, [0, 0.3 * fps], [0, 1], {
  easing: Easing.bezier(0.16, 1, 0.3, 1),
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
```

## Animating scale

When animating scale, if the output is linear, the perceived scale would be smaller the larger the scale gets.  
Use this option to compensate:

```ts
const scale = interpolate(frame, [0, 0.3 * fps], [0, 1], {
  easing: Easing.bezier(0.16, 1, 0.3, 1),
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
  output: 'perceptual-scale' // <- Add this to scale animations
});
```

## Multiple keyframes

Add as many keyframes as you want. For multiple easings, pass an array with `n - 1` items:

```ts
const scale = interpolate(frame, [0, 1 * fps, 9 * fps, 10 * fps], [0, 1, 1, 0], {
  easing: [Easing.bezier(0.16, 1, 0.3, 1), Easing.linear, Easing.spring({damping: 200})],
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
  output: 'perceptual-scale' // <- Add this to scale animations
});
```

## Posterization

You can intentionally reduce the frame rate for artistic reason. Use if it makes sense.

```ts
const scale = interpolate(frame, [0, 1 * fps], [0, 1], {
  easing: Easing.bezier(0.16, 1, 0.3, 1),
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
  posterize: 3 // Only every 3rd frame is sampled
});
```

````

### 1.6 remotion-markup/timing-props.md (from / trimBefore / durationInFrames / playbackRate / loop, order of operations)

Source: `skills/remotion-markup/timing-props.md`

````markdown
## Delaying, trimming

In the component that renders these items, get `const {fps} = useVideoConfig()`.
Use this `fps` for seconds-to-frames expressions on the JSX node, rather than
a fixed FPS constant.

The following timing props are supported by built-in components (`<AbsoluteFill>`, `<Interactive.*>`, `<Img>`, `<AnimatedImage>`, `<CanvasImage>`, `<HtmlInCanvas>`, `<Solid>`, `<Sequence>`, `<Track>` from `remotion`, `<Video>` and `<Audio>` from `@remotion/media`, `<Gif>`, and more).
Custom components made with `Interactive.create()` accept them too, see Prefer interactive components with their own timelines.

### `from`

When the item starts appearing in the timeline.
Its children start at frame `0` when it appears.

```tsx
<Img from={1 * fps} {/* ... */}/>
<Video from={1 * fps} {/* ... */}/>
<Interactive.Div from={1 * fps} {/* ... */}/>
<LowerThird from={1 * fps} {/* ... */}/>
```

### `trimBefore`

Sets the first frame of the item's own timeline:

```tsx
// Trim away first 2 seconds of footage
<Video trimBefore={2 * fps} {/* ... */} />

// `useCurrentFrame()` of the children starts at `10 * fps`
<Interactive.Div trimBefore={10 * fps} {/* ... */} />
```

### `durationInFrames`

How many frames of the item's own timeline are shown, starting at `trimBefore`.
Use it to end media early instead of cutting the file:

```tsx
// Play the footage from second 2 to second 5
<Video trimBefore={2 * fps} durationInFrames={3 * fps} {/* ... */} />
<Img durationInFrames={20 * fps} {/* ... */}/>
<LowerThird durationInFrames={5 * fps} {/* ... */}/>
```

### `playbackRate`

Changes the speed of the item.
Children calling `useCurrentFrame()` advance `playbackRate` frames per frame of the parent.
The item occupies `durationInFrames / playbackRate` frames in its parent timeline.

```tsx
// 2x speed
<Video playbackRate={2} {/* ... */} />
<LowerThird playbackRate={0.5} durationInFrames={2 * fps} {/* ... */} />
```

### `loop`

Repeats the range selected by `trimBefore` and `durationInFrames` until the parent ends.
`<Video>`, `<Audio>`, `<Gif>` and `<AnimatedImage>` may omit `durationInFrames`; the media's own duration after `trimBefore` then defines the loop range.
Other items need `durationInFrames` to define the loop range:

```tsx
<Video loop {/* ... */} />
<Interactive.Div durationInFrames={2 * fps} loop {/* ... */} />
```

Put timing and volume directly on `<Audio>`.

`<Img>`, `<CanvasImage>`, `<Solid>` and shapes do not support `loop` because their output does not change over time.

### Order of operations

1. `from` positions the item in its parent timeline.
2. `trimBefore` sets the first frame of the item's own timeline.
3. `durationInFrames` selects the range of the item's own timeline.
4. `playbackRate` stretches or compresses the selected range.
5. `loop` repeats the selected range until the parent ends.

Children calling `useCurrentFrame()` get `trimBefore + (frame - from) * playbackRate`.

See [Timing and trimming](https://www.remotion.dev/docs/timing) for more details.

### Fallback

If a component does not support these props, wrap it in `<Sequence>` from `remotion`, which has them.

- `layout="absolute-fill"` makes the Sequence behave like AbsoluteFill
- `layout="none"` is "headless" mode, no wrapper element is used.

````

### 1.7 remotion-markup/sequencing.md

Source: `skills/remotion-markup/sequencing.md`

````markdown
---
name: sequencing
description: Sequencing patterns for Remotion - delay, trim, limit duration of items
metadata:
  tags: sequence, series, timing, delay, trim
---

# Choose the timing boundary

Put timing props directly on a built-in interactive component or one made with
`Interactive.create()` when that item should be edited independently. Set audio
timing and volume on `Audio` from `@remotion/media`.

Use a shared `Sequence` when several layers must inherit the same trim, speed,
or start time, when overriding dimensions for descendants, or when the child
does not accept timing props. Choose `layout="none"` if the group should not
add a layout element; otherwise its absolute-fill layout also positions the
contents.

Use `Track` for non-overlapping items with independent positions and
`TransitionSeries` for consecutive items that should shift together when a
duration changes. Keep the series' own sequence boundaries, including when a
child already accepts timing props.

Follow editable timeline structure
for grouping and examples. See [timing props](timing-props.md) for how `from`,
`trimBefore`, duration, speed, and looping combine, and
[editable video timelines](video-editing.md) for synchronized footage and captions.

````

### 1.8 remotion-markup/multi-scene-video.md

Source: `skills/remotion-markup/multi-scene-video.md`

````markdown
# Multi-scene videos

Give each substantial scene its own component and connect it when it benefits
from an independent editing timeline. Keep each instance's name, timing, and
props inline in the parent.

Choose the parent structure from the editing behavior:

- For independent scene start times, use a named `Track` with explicit `from`
  and `durationInFrames` on each scene. Its items must not overlap.
- For scenes that should remain adjacent as their durations change, use
  `TransitionSeries`. Keep each scene inside its own
  `TransitionSeries.Sequence`, with duration and source trim on that boundary.
  Add transitions when needed and account for their overlaps in the total
  composition duration.

Follow editable timeline structure
for a complete scene, parent, and registration example. See
[transitions](transitions.md) for transition timing and presentations, and
[connected compositions](connected-compositions.md) for extraction and
verification in the full video.

````

### 1.9 remotion-markup/transitions.md (TransitionSeries, overlays, duration math)

Source: `skills/remotion-markup/transitions.md`

````markdown
---
name: transitions
description: Scene transitions and overlays for Remotion using TransitionSeries.
metadata:
  tags: transitions, overlays, fade, slide, wipe, scenes
---

## TransitionSeries

`<TransitionSeries>` arranges scenes and supports two ways to enhance the cut point between them:

- **Transitions** (`<TransitionSeries.Transition>`) — crossfade, slide, wipe, etc. between two scenes. Shortens the timeline because both scenes play simultaneously during the transition.
- **Overlays** (`<TransitionSeries.Overlay>`) — render an effect (e.g. a light leak) on top of the cut point without shortening the timeline.

For a multi-scene timeline, keep the outer `<TransitionSeries>` visible in the
timeline. Studio favors the active scene sequence when the two have the same
full-frame canvas outline.

Children are absolutely positioned.

## Prerequisites

```bash
bunx remotion add @remotion/transitions
```

## Transition example

Use the connected `Chapter` scene from the
composition example.

```tsx title="TransitionVideo.tsx"
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {Chapter} from './Chapter';

export const TransitionVideo = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence name="Opening" durationInFrames={60}>
      <Chapter title="Introduction" style={{backgroundColor: '#111111'}} />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition
      presentation={fade()}
      timing={linearTiming({durationInFrames: 15})}
    />
    <TransitionSeries.Sequence name="Feature" durationInFrames={60}>
      <Chapter title="New features" style={{backgroundColor: '#243b53'}} />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);
```

## Custom presentation

```tsx title="SlideInPresentation.tsx"
import type {TransitionPresentationComponentProps} from '@remotion/transitions';

export const SlideInPresentation = ({
  children,
  presentationDirection,
  presentationProgress,
}: TransitionPresentationComponentProps<Record<string, never>>) => {
  if (presentationDirection === 'exiting') {
    return <>{children}</>;
  }

  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          translate: `${(1 - presentationProgress) * 100}% 0`,
        }}
      >
        {children}
      </div>
    </div>
  );
};
```

Use it in place of `fade()` in `TransitionVideo.tsx`:

```tsx
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {SlideInPresentation} from './SlideInPresentation';

<TransitionSeries.Transition
  presentation={{component: SlideInPresentation, props: {}}}
  timing={linearTiming({durationInFrames: 15})}
/>;
```

## Overlay example

```tsx title="LightLeakOverlay.tsx"
import {lightLeak} from '@remotion/effects/light-leak';
import type {CSSProperties} from 'react';
import {Interactive, interpolate, Solid, useCurrentFrame, useVideoConfig} from 'remotion';

const LightLeakOverlayInner = ({style}: {readonly style?: CSSProperties}) => {
  const frame = useCurrentFrame();
  const {durationInFrames, height, width} = useVideoConfig();

  return (
    <Solid
      width={width}
      height={height}
      style={style}
      effects={[
        lightLeak({
          progress: interpolate(frame, [0, durationInFrames - 1], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }),
      ]}
    />
  );
};

export const LightLeakOverlay = Interactive.create({
  Component: LightLeakOverlayInner,
  layout: 'none',
});
```

```tsx title="OverlayVideo.tsx"
import {TransitionSeries} from '@remotion/transitions';
import {Chapter} from './Chapter';
import {LightLeakOverlay} from './LightLeakOverlay';

export const OverlayVideo = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence name="Opening" durationInFrames={60}>
      <Chapter title="Introduction" style={{backgroundColor: '#111111'}} />
    </TransitionSeries.Sequence>
    <TransitionSeries.Overlay durationInFrames={20}>
      <LightLeakOverlay name="Light leak" />
    </TransitionSeries.Overlay>
    <TransitionSeries.Sequence name="Feature" durationInFrames={60}>
      <Chapter title="New features" style={{backgroundColor: '#243b53'}} />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);
```

## Mixing transitions and overlays

Separate overlays and transitions with a scene.

```tsx title="MixedVideo.tsx"
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {Chapter} from './Chapter';
import {LightLeakOverlay} from './LightLeakOverlay';

export const MixedVideo = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence name="Opening" durationInFrames={60}>
      <Chapter title="Introduction" style={{backgroundColor: '#111111'}} />
    </TransitionSeries.Sequence>
    <TransitionSeries.Overlay durationInFrames={30}>
      <LightLeakOverlay name="Light leak" />
    </TransitionSeries.Overlay>
    <TransitionSeries.Sequence name="Feature" durationInFrames={60}>
      <Chapter title="New features" style={{backgroundColor: '#243b53'}} />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition
      presentation={fade()}
      timing={linearTiming({durationInFrames: 15})}
    />
    <TransitionSeries.Sequence name="Closing" durationInFrames={60}>
      <Chapter title="Thank you" style={{backgroundColor: '#382345'}} />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);
```

## Transition props

`<TransitionSeries.Transition>` requires:

- `presentation` — the visual effect (e.g. `fade()`, `slide()`, `wipe()`).
- `timing` — controls speed and easing (e.g. `linearTiming()`, `springTiming()`).

## Overlay props

`<TransitionSeries.Overlay>` accepts:

- `durationInFrames` — how long the overlay is visible (positive integer).
- `offset?` — shifts the overlay relative to the cut point center. Positive = later, negative = earlier. Default: `0`.

## Available transition types

Import transitions from their respective modules:

```tsx
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { flip } from "@remotion/transitions/flip";
import { clockWipe } from "@remotion/transitions/clock-wipe";
```

## Slide transition with direction

```tsx
import {TransitionSeries, linearTiming} from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";

<TransitionSeries.Transition
  presentation={slide({ direction: "from-left" })}
  timing={linearTiming({ durationInFrames: 20 })}
/>;
```

Directions: `"from-left"`, `"from-right"`, `"from-top"`, `"from-bottom"`

## Timing options

```tsx
import { linearTiming, springTiming } from "@remotion/transitions";

// Linear timing - constant speed
linearTiming({ durationInFrames: 20 });

// Spring timing - organic motion
springTiming({ config: { damping: 200 }, durationInFrames: 25 });
```

## Duration calculation

Transitions overlap adjacent scenes, so the total composition length is **shorter** than the sum of all sequence durations. Overlays do **not** affect the total duration.

For example, with two 60-frame sequences and a 15-frame transition:

- Without transitions: `60 + 60 = 120` frames
- With transition: `60 + 60 - 15 = 105` frames

Adding an overlay between two other sequences does not change the total.

### Getting the duration of a transition

Use the `getDurationInFrames()` method on the timing object:

```tsx
import { linearTiming, springTiming } from "@remotion/transitions";

const linearDuration = linearTiming({
  durationInFrames: 20,
}).getDurationInFrames({ fps: 30 });
// Returns 20

const springDuration = springTiming({
  config: { damping: 200 },
}).getDurationInFrames({ fps: 30 });
// Returns calculated duration based on spring physics
```

For `springTiming` without an explicit `durationInFrames`, the duration depends on `fps` because it calculates when the spring animation settles.

### Calculating total composition duration

```tsx
import { linearTiming } from "@remotion/transitions";

const scene1Duration = 60;
const scene2Duration = 60;
const scene3Duration = 60;

const timing1 = linearTiming({ durationInFrames: 15 });
const timing2 = linearTiming({ durationInFrames: 20 });

const transition1Duration = timing1.getDurationInFrames({ fps: 30 });
const transition2Duration = timing2.getDurationInFrames({ fps: 30 });

const totalDuration =
  scene1Duration +
  scene2Duration +
  scene3Duration -
  transition1Duration -
  transition2Duration;
// 60 + 60 + 60 - 15 - 20 = 145 frames
```

````

### 1.10 remotion-markup/compositions.md

Source: `skills/remotion-markup/compositions.md`

````markdown
---
name: compositions
description: Defining compositions, stills, folders, default props and dynamic metadata
metadata:
  tags: composition, still, folder, props, metadata
---

A `<Composition>` defines the component, width, height, fps and duration of a renderable video.

## Source-editable registrations

Give each composition or still that should be edited independently in the
Studio its own authored JSX node. Use a JSX string literal for `id`, and keep
its metadata and editable default values directly on that node.

Programmatic registration is suitable when the generated compositions are
intentionally controlled as one source template and do not need to be
reordered, duplicated, deleted or edited individually in the Studio.

```tsx title="src/MyComposition.tsx"
type Props = {
  readonly title: string;
};

export const MyComposition = ({title}: Props) => <h1>{title}</h1>;
```

```tsx title="src/Root.tsx"
import {Composition} from 'remotion';
import {MyComposition} from './MyComposition';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="Launch"
        component={MyComposition}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{title: 'Launch'}}
      />
      <Composition
        id="Recap"
        component={MyComposition}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{title: 'Recap'}}
      />
    </>
  );
};
```

Both registrations can reuse the same component. Keeping them as separate JSX
nodes gives each one its own source-editing target.

## Default Props and scaffold metadata

Pass `defaultProps` to provide initial values for your component.  
Values must be JSON-serializable (`Date`, `Map`, `Set`, and `staticFile()` are supported).
Use `defaultProps` for composition-wide values that should be visible and editable before the video renders.

Keep data owned by a child editor on that child's JSX node. For example,
captions that should remain editable in the Caption editor belong as an inline
array on `<BasicCaptions>`, not in composition `defaultProps` or a component
prop. See Displaying captions.

For Studio editing, keep `defaultProps` as an inline object literal on `<Composition>` or `<Still>`.
Keep values that should be written back directly in the object instead of deriving them from a loop variable.
Do not store it in a variable, import it, spread it, create it with a helper, or wrap it in `satisfies`.
Use `type` declarations for props rather than `interface` to ensure `defaultProps` type safety.

```tsx title="src/Root.tsx"
import {Composition} from 'remotion';
import {MyComposition} from './MyComposition';

const defaultProps = { title: "Hello World" };

export const RemotionRoot = () => {
  return (
    <>
      {/* 👍 Inline metadata and defaults */}
      <Composition
        id="MyComposition"
        component={MyComposition}
        durationInFrames={100}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{ title: "Hello World" }}
      />

      {/* 👎 Hidden defaults cannot be saved back by Studio */}
      <Composition
        id="OtherComposition"
        component={MyComposition}
        durationInFrames={100}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={defaultProps}
      />
    </>
  );
};
```

## Folders

Use `<Folder>` to organize compositions in the sidebar.  
Folder names can only contain letters, numbers, and hyphens.

```tsx title="src/Root.tsx"
import { Composition, Folder } from "remotion";

export const RemotionRoot = () => {
  return (
    <>
      <Folder name="Marketing">
        <Composition id="Promo" /* ... */ />
        <Composition id="Ad" /* ... */ />
      </Folder>
      <Folder name="Social">
        <Folder name="Instagram">
          <Composition id="Story" /* ... */ />
          <Composition id="Reel" /* ... */ />
        </Folder>
      </Folder>
    </>
  );
};
```

## Stills

Use `<Still>` for single-frame images. It does not require `durationInFrames` or `fps`.

```tsx title="src/Root.tsx"
import { Still } from "remotion";
import { Thumbnail } from "./Thumbnail";

export const RemotionRoot = () => {
  return (
    <Still
      id="Thumbnail"
      component={Thumbnail}
      width={1280}
      height={720}
    />
  );
};
```

## Dynamic duration, width, and height

Use [`calculateMetadata`](./calculate-metadata.md) to make dimensions, duration, or props dynamic based on input props, fetched data, or asset metadata.

## Nesting compositions within another

To render a composition's component inside another composition, use `<Sequence>` with `width` and `height` when the nested content needs its own dimensions.

When the nested scene should have its own editable Studio timeline, use the [connected composition structure](connected-compositions.md).

```tsx
<>
  <Video src="https://remotion.media/video.mp4" />
  <Sequence
    width={1920}
    height={1080}
  >
    <OverlayComponent />
  </Sequence>
</>
```

````

### 1.11 remotion-markup/calculate-metadata.md

Source: `skills/remotion-markup/calculate-metadata.md`

````markdown
---
name: calculate-metadata
description: Dynamically set composition duration, dimensions, and props
metadata:
  tags: calculateMetadata, duration, dimensions, props, dynamic
---

# Using calculateMetadata

Use `calculateMetadata` on a `<Composition>` to dynamically set duration, dimensions, and transform props before rendering.
Use it when metadata depends on input props, fetched data, or asset metadata.
For static dimensions, duration, FPS, and initial props, inline the values on `<Composition>` instead.

```tsx
<Composition
  id="MyComp"
  component={MyComponent}
  durationInFrames={300}
  fps={30}
  width={1920}
  height={1080}
  defaultProps={{ videoSrc: "https://remotion.media/video.mp4" }}
  calculateMetadata={calculateMetadata}
/>
```

## Setting duration based on a video

Use the `getVideoDuration` and `getVideoDimensions` skills to get the video duration and dimensions:

```tsx
import { CalculateMetadataFunction } from "remotion";
import { getVideoDuration } from "./get-video-duration";

const calculateMetadata: CalculateMetadataFunction<Props> = async ({
  props,
}) => {
  const durationInSeconds = await getVideoDuration(props.videoSrc);

  return {
    durationInFrames: Math.ceil(durationInSeconds * 30),
  };
};
```

## Matching dimensions of a video

Use the `getVideoDimensions` skill to get the video dimensions:

```tsx
import { CalculateMetadataFunction } from "remotion";
import { getVideoDuration } from "./get-video-duration";
import { getVideoDimensions } from "./get-video-dimensions";

const calculateMetadata: CalculateMetadataFunction<Props> = async ({
  props,
}) => {
  const dimensions = await getVideoDimensions(props.videoSrc);

  return {
    width: dimensions.width,
    height: dimensions.height,
  };
};
```

## Setting duration based on multiple videos

```tsx
const calculateMetadata: CalculateMetadataFunction<Props> = async ({
  props,
}) => {
  const metadataPromises = props.videos.map((video) =>
    getVideoDuration(video.src),
  );
  const allMetadata = await Promise.all(metadataPromises);

  const totalDuration = allMetadata.reduce(
    (sum, durationInSeconds) => sum + durationInSeconds,
    0,
  );

  return {
    durationInFrames: Math.ceil(totalDuration * 30),
  };
};
```

## Setting a default outName

Set the default output filename based on props:

```tsx
const calculateMetadata: CalculateMetadataFunction<Props> = async ({
  props,
}) => {
  return {
    defaultOutName: `video-${props.id}`, // .mp4 is added automatically
  };
};
```

## Transforming props

Fetch data or transform props before rendering:

```tsx
const calculateMetadata: CalculateMetadataFunction<Props> = async ({
  props,
  abortSignal,
}) => {
  const response = await fetch(props.dataUrl, { signal: abortSignal });
  const data = await response.json();

  return {
    props: {
      ...props,
      fetchedData: data,
    },
  };
};
```

The `abortSignal` cancels stale requests when props change in the Studio.

## Return value

All fields are optional. Returned values override the `<Composition>` props:

- `durationInFrames`: Number of frames
- `width`: Composition width in pixels
- `height`: Composition height in pixels
- `fps`: Frames per second
- `props`: Transformed props passed to the component
- `defaultOutName`: Default output filename
- `defaultCodec`: Default codec for rendering

````

### 1.12 remotion-markup/parameters.md (Zod schema props)

Source: `skills/remotion-markup/parameters.md`

````markdown
---
name: parameters
description: Make a video parametrizable by adding a Zod schema
metadata:
  tags: parameters, zod, schema
---

To make a video parametrizable, a Zod schema can be added to a composition.

First, `zod` must be installed .

Search the project for lockfiles and run the correct command depending on the package manager:

If `package-lock.json` is found, use the following command:

```bash
npm i zod
```

If `bun.lockb` is found, use the following command:

```bash
bun i zod
```

If `yarn.lock` is found, use the following command:

```bash
yarn add zod
```

If `pnpm-lock.yaml` is found, use the following command:

```bash
pnpm i zod
```

Then, a Zod schema can be defined alongside the component:

```tsx title="src/MyComposition.tsx"
import { z } from "zod";

export const MyCompositionSchema = z.object({
  title: z.string(),
});

const MyComponent: React.FC<z.infer<typeof MyCompositionSchema>> = () => {
  return (
    <div>
      <h1>
        {props.title}
      </h1>
    </div>
  );
};
```

In the root file, the schema can be passed to the composition:

```tsx title="src/Root.tsx"
import { Composition } from "remotion";
import { MycComponent, MyCompositionSchema } from "./MyComposition";

export const RemotionRoot = () => {
  return (
    <Composition
      id="MyComposition"
      component={MyComponent}
      durationInFrames={100}
      fps={30}
      width={1080}
      height={1080}
      defaultProps={{ title: "Hello World" }}
      schema={MyCompositionSchema}
    />
  );
};
```

Now, the user can edit the parameter visually in the sidebar.

All schemas that are supported by Zod are supported by Remotion.

Remotion requires that the top-level type is a z.object(), because the collection of props of a React component is always an object.

## Color picker

For adding a color picker, use `zColor()` from `@remotion/zod-types`.

If it is not installed, use the following command:

```bash
npx remotion add @remotion/zod-types # If project uses npm
bunx remotion add @remotion/zod-types # If project uses bun
yarn remotion add @remotion/zod-types # If project uses yarn
pnpm exec remotion add @remotion/zod-types # If project uses pnpm
```

Then import `zColor` from `@remotion/zod-types`:

```tsx
import { zColor } from "@remotion/zod-types";
```

Then use it in the schema:

```tsx
export const MyCompositionSchema = z.object({
  color: zColor(),
});
```

````

### 1.13 remotion-markup/google-fonts.md

Source: `skills/remotion-markup/google-fonts.md`

````markdown
---
name: fonts
description: Loading Google Fonts and local fonts in Remotion
metadata:
  tags: fonts, google-fonts, typography, text
---

# Using fonts in Remotion

## Google Fonts with @remotion/google-fonts

The recommended way to use Google Fonts. It's type-safe and automatically blocks rendering until the font is ready.

### Prerequisites

First, the @remotion/google-fonts package needs to be installed.
If it is not installed, use the following command:

```bash
npx remotion add @remotion/google-fonts # If project uses npm
bunx remotion add @remotion/google-fonts # If project uses bun
yarn remotion add @remotion/google-fonts # If project uses yarn
pnpm exec remotion add @remotion/google-fonts # If project uses pnpm
```

```tsx
import { loadFont } from "@remotion/google-fonts/Lobster";

const { fontFamily } = loadFont();

export const MyComposition = () => {
  return (
    <div style={{ fontFamily }}>
      Hello World
    </div>
  );
};
```

Preferrably, specify only needed weights and subsets to reduce file size:

```tsx
import { loadFont } from "@remotion/google-fonts/Roboto";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});
```

## Using in components

Call `loadFont()` at the top level of your component or in a separate file that's imported early:

```tsx
import { loadFont } from "@remotion/google-fonts/Montserrat";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});

export const Title: React.FC<{ text: string }> = ({ text }) => {
  return (
    <h1
      style={{
        fontFamily,
        fontSize: 80,
        fontWeight: "bold",
      }}
    >
      {text}
    </h1>
  );
};
```

````

### 1.14 remotion-markup/local-fonts.md (@remotion/fonts)

Source: `skills/remotion-markup/local-fonts.md`

````markdown
For local font files, use the `@remotion/fonts` package.

### Prerequisites

First, install @remotion/fonts:

```bash
npx remotion add @remotion/fonts # If project uses npm
bunx remotion add @remotion/fonts # If project uses bun
yarn remotion add @remotion/fonts # If project uses yarn
pnpm exec remotion add @remotion/fonts # If project uses pnpm
```

### Loading a local font

Place your font file in the `public/` folder and use `loadFont()`:

```tsx
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

await loadFont({
  family: "MyFont",
  url: staticFile("MyFont-Regular.woff2"),
});

export const MyComposition = () => {
  return (
    <div style={{ fontFamily: "MyFont" }}>
      Hello World
    </div>
  );
};
```

### Loading multiple weights

Load each weight separately with the same family name:

```tsx
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

await Promise.all([
  loadFont({
    family: "Inter",
    url: staticFile("Inter-Regular.woff2"),
    weight: "400",
  }),
  loadFont({
    family: "Inter",
    url: staticFile("Inter-Bold.woff2"),
    weight: "700",
  }),
]);
```

### Available options

```tsx
loadFont({
  family: "MyFont", // Required: name to use in CSS
  url: staticFile("font.woff2"), // Required: font file URL
  format: "woff2", // Optional: auto-detected from extension
  weight: "400", // Optional: font weight
  style: "normal", // Optional: normal or italic
  display: "block", // Optional: font-display behavior
});
```

````

### 1.15 remotion-markup/measuring-text.md (@remotion/layout-utils: measureText, fitText, fillTextBox)

Source: `skills/remotion-markup/measuring-text.md`

````markdown
---
name: measuring-text
description: Measuring text dimensions, fitting text to containers, and checking overflow
metadata:
  tags: measure, text, layout, dimensions, fitText, fillTextBox
---

# Measuring text in Remotion

## Prerequisites

Install @remotion/layout-utils if it is not already installed:

```bash
npx remotion add @remotion/layout-utils
```

## Measuring text dimensions

Use `measureText()` to calculate the width and height of text:

```tsx
import { measureText } from "@remotion/layout-utils";

const { width, height } = measureText({
  text: "Hello World",
  fontFamily: "Arial",
  fontSize: 32,
  fontWeight: "bold",
});
```

Results are cached - duplicate calls return the cached result.

## Fitting text to a width

Use `fitText()` to find the optimal font size for a container:

```tsx
import { fitText } from "@remotion/layout-utils";

const { fontSize } = fitText({
  text: "Hello World",
  withinWidth: 600,
  fontFamily: "Inter",
  fontWeight: "bold",
});

return (
  <div
    style={{
      fontSize: Math.min(fontSize, 80), // Cap at 80px
      fontFamily: "Inter",
      fontWeight: "bold",
    }}
  >
    Hello World
  </div>
);
```

## Checking text overflow

Use `fillTextBox()` to check if text exceeds a box:

```tsx
import { fillTextBox } from "@remotion/layout-utils";

const box = fillTextBox({ maxBoxWidth: 400, maxLines: 3 });

const words = ["Hello", "World", "This", "is", "a", "test"];
for (const word of words) {
  const { exceedsBox } = box.add({
    text: word + " ",
    fontFamily: "Arial",
    fontSize: 24,
  });
  if (exceedsBox) {
    // Text would overflow, handle accordingly
    break;
  }
}
```

## Best practices

**Load fonts first:** Only call measurement functions after fonts are loaded.

```tsx
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily, waitUntilDone } = loadFont("normal", {
  weights: ["400"],
  subsets: ["latin"],
});

waitUntilDone().then(() => {
  // Now safe to measure
  const { width } = measureText({
    text: "Hello",
    fontFamily,
    fontSize: 32,
  });
});
```

**Use validateFontIsLoaded:** Catch font loading issues early:

```tsx
measureText({
  text: "Hello",
  fontFamily: "MyCustomFont",
  fontSize: 32,
  validateFontIsLoaded: true, // Throws if font not loaded
});
```

**Match font properties:** Use the same properties for measurement and rendering:

```tsx
const fontStyle = {
  fontFamily: "Inter",
  fontSize: 32,
  fontWeight: "bold" as const,
  letterSpacing: "0.5px",
};

const { width } = measureText({
  text: "Hello",
  ...fontStyle,
});

return (
  <div style={fontStyle}>
    Hello
  </div>
);
```

**Avoid padding and border:** Use `outline` instead of `border` to prevent layout differences:

```tsx
<div style={{ outline: "2px solid red" }}>
  Text
</div>
```

````

### 1.16 remotion-markup/measuring-dom-nodes.md

Source: `skills/remotion-markup/measuring-dom-nodes.md`

````markdown
---
name: measuring-dom-nodes
description: Measuring DOM element dimensions in Remotion
metadata:
  tags: measure, layout, dimensions, getBoundingClientRect, scale
---

# Measuring DOM nodes in Remotion

Remotion applies a `scale()` transform to the video container, which affects values from `getBoundingClientRect()`. Use `useCurrentScale()` to get correct measurements.

## Measuring element dimensions

```tsx
import { useCurrentScale } from "remotion";
import { useRef, useEffect, useState } from "react";

export const MyComponent = () => {
  const ref = useRef<HTMLDivElement>(null);
  const scale = useCurrentScale();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setDimensions({
      width: rect.width / scale,
      height: rect.height / scale,
    });
  }, [scale]);

  return (
    <div ref={ref}>
      Content to measure
    </div>
  );
};
```

````

### 1.17 remotion-markup/text-highlights.md (@remotion/rough-notation)

Source: `skills/remotion-markup/text-highlights.md`

````markdown
---
name: text-highlights
description: Animated text highlights and hand-drawn annotations using @remotion/rough-notation.
metadata:
  tags: text, highlights, annotations, circles, rough-notation
---

# Text highlights

Use `@remotion/rough-notation` to draw animated annotations around or behind text. It supports highlights, circles, underlines, strike-throughs, crossed-off text, boxes, and brackets.

Docs: https://www.remotion.dev/docs/text-highlights

Install the package using the same Remotion version as the project:

```bash
bunx remotion add @remotion/rough-notation
```

Choose the component that describes the annotation: `<Highlight>`, `<Circle>`, `<Underline>`, `<StrikeThrough>`, `<CrossedOff>`, `<Box>`, or `<Bracket>`. The component determines both the annotation style and whether it renders behind or on top of the text.

Drive `progress` from `useCurrentFrame()` so the annotation is deterministic and synchronized with the video:

```tsx
import {Circle, Highlight} from '@remotion/rough-notation';
import {interpolate, useCurrentFrame} from 'remotion';

export const TextAnnotations: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <div style={{fontSize: 80}}>
      This is{' '}
      <Highlight
        color="rgba(255, 236, 79, 0.62)"
        progress={interpolate(frame, [15, 40], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })}
      >
        important
      </Highlight>
      , and this is{' '}
      <Circle color="#2563eb" progress={interpolate(frame, [15, 40], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })}>
        connected
      </Circle>
      .
    </div>
  );
};
```

Keep `progress` inline, hardcoded and use `interpolate` for maximum Studio interactivity.

````

### 1.18 remotion-markup/audio.md (<Audio>, trim, volume curves, mute, speed, loop, pitch)

Source: `skills/remotion-markup/audio.md`

````markdown
---
name: audio
description: Using audio and sound in Remotion - importing, trimming, volume, speed, pitch
metadata:
  tags: audio, media, trim, volume, speed, loop, pitch, mute, sound, sfx
---

# Using audio in Remotion

## Prerequisites

First, the @remotion/media package needs to be installed.
If it is not installed, use the following command:

```bash
npx remotion add @remotion/media
```

## Importing Audio

Use `<Audio>` from `@remotion/media` to add audio to your composition.

```tsx
import { Audio } from "@remotion/media";
import { staticFile } from "remotion";

export const MyComposition = () => {
  return <Audio src={staticFile("audio.mp3")} />;
};
```

Remote URLs are also supported:

```tsx
import { Audio } from "@remotion/media";

<Audio src="https://remotion.media/audio.mp3" />
```

By default, audio plays from the start, at full volume and full length.
Multiple audio tracks can be layered by adding multiple `<Audio>` components.

## Trimming

Use `trimBefore` to skip the beginning of the audio and `durationInFrames` to end it early. Values are in frames.

```tsx
import { Audio } from "@remotion/media";

const { fps } = useVideoConfig();

return (
  <Audio
    src={staticFile("audio.mp3")}
    trimBefore={2 * fps} // Skip the first 2 seconds
    durationInFrames={8 * fps} // Play 8 seconds, until the 10 second mark
  />
);
```

The audio still starts playing at the beginning of the composition - only the specified portion is played.

## Delaying

Set `from` directly on `<Audio>` to delay when it starts:

```tsx
import { staticFile, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";

const { fps } = useVideoConfig();

return (
  <Audio from={fps} src={staticFile("audio.mp3")} />
);
```

The audio will start playing after 1 second.

## Volume

Set a static volume (0 to 1):

```tsx
import { Audio } from "@remotion/media";

<Audio src={staticFile("audio.mp3")} volume={0.5} />
```

Use `useCurrentFrame()` and `interpolate()` for keyframed volume:

```tsx
import { Audio } from "@remotion/media";
import { interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const frame = useCurrentFrame();
const { fps } = useVideoConfig();

return (
  <Audio
    src={staticFile("audio.mp3")}
    volume={interpolate(frame, [0, 1 * fps], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })}
  />
);
```

With Studio interactivity enabled, these keyframes can be edited and are shown as a volume curve in the timeline.

## Muting

Use `muted` to silence the audio. It can be set dynamically:

```tsx
import { Audio } from "@remotion/media";

const frame = useCurrentFrame();
const { fps } = useVideoConfig();

return (
  <Audio
    src={staticFile("audio.mp3")}
    muted={frame >= 2 * fps && frame <= 4 * fps} // Mute between 2s and 4s
  />
);
```

## Speed

Use `playbackRate` to change the playback speed:

```tsx
import { Audio } from "@remotion/media";

// 2x speed
<Audio src={staticFile("audio.mp3")} playbackRate={2} />
// Half speed
<Audio src={staticFile("audio.mp3")} playbackRate={0.5} />
```

Reverse playback is not supported.

## Looping

Use `loop` to loop the audio indefinitely:

```tsx
import { Audio } from "@remotion/media";

<Audio src={staticFile("audio.mp3")} loop />
```

Put `name`, `from`, `loop`, and `volume` directly on `<Audio>`.

```tsx
import { Audio } from "@remotion/media";
import { interpolate, staticFile, useCurrentFrame } from "remotion";

const frame = useCurrentFrame();

<Audio
  src={staticFile("audio.mp3")}
  loop
  volume={interpolate(frame, [0, 300], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })}
/>
```

## Pitch

Use `toneFrequency` to adjust the pitch without affecting speed. Values range from 0.01 to 2:

```tsx
import { Audio } from "@remotion/media";

<Audio
  src={staticFile("audio.mp3")}
  toneFrequency={1.5} // Higher pitch
/>
<Audio
  src={staticFile("audio.mp3")}
  toneFrequency={0.8} // Lower pitch
/>
```

Pitch shifting only works during server-side rendering, not in the Remotion Studio preview or in the `<Player />`.

````

### 1.19 remotion-markup/sfx.md (hosted sound-effect URLs)

Source: `skills/remotion-markup/sfx.md`

````markdown
---
name: sfx
description: Including sound effects
metadata:
  tags: sfx, sound, effect, audio
---

To include a sound effect, use `<Audio>` from `@remotion/media`:

```tsx
import { Audio } from "@remotion/media";

<Audio src={"https://remotion.media/whoosh.wav"} />;
```

The following sound effects are available:

- `https://remotion.media/whoosh.wav`
- `https://remotion.media/whip.wav`
- `https://remotion.media/page-turn.wav`
- `https://remotion.media/switch.wav`
- `https://remotion.media/mouse-click.wav`
- `https://remotion.media/shutter-modern.wav`
- `https://remotion.media/shutter-old.wav`
- `https://remotion.media/ding.wav`
- `https://remotion.media/bruh.wav`
- `https://remotion.media/vine-boom.wav`
- `https://remotion.media/windows-xp-error.wav`
- `https://remotion.media/fah.wav`
- `https://remotion.media/spongebob-fail.wav`
- `https://remotion.media/omg-hell-nah.wav`
- `https://remotion.media/price-is-right-fail.wav`
- `https://remotion.media/romance-meme.wav`
- `https://remotion.media/bone-crack.wav`
- `https://remotion.media/anime-wow.wav`
- `https://remotion.media/yippee.wav`
- `https://remotion.media/loading-lag.wav`
- `https://remotion.media/wilhelm-scream.wav`
- `https://remotion.media/mac-quack.wav`
- `https://remotion.media/skedaddle.wav`
- `https://remotion.media/snapchat-notification.wav`
- `https://remotion.media/nelly-ahh.wav`
- `https://remotion.media/sanctuary-guardian-what.wav`
- `https://remotion.media/minecraft-hurt.wav`
- `https://remotion.media/oh-my-god-vine.wav`
- `https://remotion.media/illuminati-confirmed.wav`
- `https://remotion.media/dramatic-boomer.wav`
- `https://remotion.media/triggered.wav`
- `https://remotion.media/record-scratch.wav`

For more sound effects, search the internet. A good resource is https://github.com/kapishdima/soundcn/tree/main/assets.

````

### 1.20 remotion-markup/voiceover.md (ElevenLabs TTS + calculateMetadata)

Source: `skills/remotion-markup/voiceover.md`

````markdown
---
name: voiceover
description: Adding AI-generated voiceover to Remotion compositions using TTS
metadata:
  tags: voiceover, audio, elevenlabs, tts, speech, calculateMetadata, dynamic duration
---

# Adding AI voiceover to a Remotion composition

Use ElevenLabs TTS to generate speech audio per scene, then use [`calculateMetadata`](./calculate-metadata.md) to dynamically size the composition to match the audio.

## Prerequisites

By default this guide uses **ElevenLabs** as the TTS provider (`ELEVENLABS_API_KEY` environment variable). Users may substitute any TTS service that can produce an audio file.

If the user has not specified a TTS provider, recommend ElevenLabs and ask for their API key.

Ensure the environment variable is available when running the generation script:

```bash
node --strip-types generate-voiceover.ts
```

## Generating audio with ElevenLabs

Create a script that reads the config, calls the ElevenLabs API for each scene, and writes MP3 files to the `public/` directory so Remotion can access them via `staticFile()`.

The core API call for a single scene:

```ts title="generate-voiceover.ts"
const response = await fetch(
  `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
  {
    method: "POST",
    headers: {
      "xi-api-key": process.env.ELEVENLABS_API_KEY!,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: "Welcome to the show.",
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.3,
      },
    }),
  },
);

const audioBuffer = Buffer.from(await response.arrayBuffer());
writeFileSync(`public/voiceover/${compositionId}/${scene.id}.mp3`, audioBuffer);
```

## Dynamic composition duration with calculateMetadata

Use [`calculateMetadata`](./calculate-metadata.md) to measure the audio durations and set the composition length accordingly.

```tsx
import { CalculateMetadataFunction, staticFile } from "remotion";
import { getAudioDuration } from "./get-audio-duration";

// Match the fps on this composition's <Composition> registration.
const compositionFps = 30;

const SCENE_AUDIO_FILES = [
  "voiceover/my-comp/scene-01-intro.mp3",
  "voiceover/my-comp/scene-02-main.mp3",
  "voiceover/my-comp/scene-03-outro.mp3",
];

export const calculateMetadata: CalculateMetadataFunction<Props> = async ({
  props,
}) => {
  const durations = await Promise.all(
    SCENE_AUDIO_FILES.map((file) => getAudioDuration(staticFile(file))),
  );

  const sceneDurations = durations.map((durationInSeconds) => {
    return durationInSeconds * compositionFps;
  });

  return {
    durationInFrames: Math.ceil(sceneDurations.reduce((sum, d) => sum + d, 0)),
  };
};
```

The computed `sceneDurations` are passed into the component via a `voiceover` prop so the component knows how long each scene should be.
`calculateMetadata` runs outside the composition component, so it cannot call
`useVideoConfig()`. Inside the component, use `const {fps} = useVideoConfig()`
for timing props instead of reusing `compositionFps`.

If the composition uses [`<TransitionSeries>`](./transitions.md), subtract the overlap from total duration: [./transitions.md#calculating-total-composition-duration](./transitions.md#calculating-total-composition-duration)

## Rendering audio in the component

See [audio.md](./audio.md) for more information on how to render audio in the component.

## Delaying audio start

See [audio.md#delaying](./audio.md#delaying) for more information on how to delay the audio start.

````

### 1.21 remotion-markup/audio-visualization.md

Source: `skills/remotion-markup/audio-visualization.md`

````markdown
---
name: audio-visualization
description: Audio visualization patterns - spectrum bars, waveforms, bass-reactive effects
metadata:
  tags: audio, visualization, spectrum, waveform, bass, music, audiogram, frequency
---

# Audio Visualization in Remotion

## Prerequisites

```bash
npx remotion add @remotion/media-utils
```

## Loading Audio Data

Use `useWindowedAudioData()` (https://www.remotion.dev/docs/use-windowed-audio-data) to load audio data:

```tsx
import { useWindowedAudioData } from "@remotion/media-utils";
import { staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const frame = useCurrentFrame();
const { fps } = useVideoConfig();

const { audioData, dataOffsetInSeconds } = useWindowedAudioData({
  src: staticFile("podcast.wav"),
  frame,
  fps,
  windowInSeconds: 30,
});
```

## Spectrum Bar Visualization

Use `visualizeAudio()` (https://www.remotion.dev/docs/visualize-audio) to get frequency data for bar charts:

```tsx
import { useWindowedAudioData, visualizeAudio } from "@remotion/media-utils";
import { staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const frame = useCurrentFrame();
const { fps } = useVideoConfig();

const { audioData, dataOffsetInSeconds } = useWindowedAudioData({
  src: staticFile("music.mp3"),
  frame,
  fps,
  windowInSeconds: 30,
});

if (!audioData) {
  return null;
}

const frequencies = visualizeAudio({
  fps,
  frame,
  audioData,
  numberOfSamples: 256,
  optimizeFor: "speed",
  dataOffsetInSeconds,
});

return (
  <div style={{ display: "flex", alignItems: "flex-end", height: 200 }}>
    {frequencies.map((v, i) => (
      <div
        key={i}
        style={{
          flex: 1,
          height: `${v * 100}%`,
          backgroundColor: "#0b84f3",
          margin: "0 1px",
        }}
      />
    ))}
  </div>
);
```

- `numberOfSamples` must be power of 2 (32, 64, 128, 256, 512, 1024)
- Values range 0-1; left of array = bass, right = highs
- Use `optimizeFor: "speed"` for Lambda or high sample counts

**Important:** When passing `audioData` to child components, also pass the `frame` from the parent. Do not call `useCurrentFrame()` in each child - this causes discontinuous visualization when children are inside `<Sequence>` with offsets.

## Waveform Visualization

Use `visualizeAudioWaveform()` (https://www.remotion.dev/docs/media-utils/visualize-audio-waveform) with `createSmoothSvgPath()` (https://www.remotion.dev/docs/media-utils/create-smooth-svg-path) for oscilloscope-style displays:

```tsx
import {
  createSmoothSvgPath,
  useWindowedAudioData,
  visualizeAudioWaveform,
} from "@remotion/media-utils";
import { staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const frame = useCurrentFrame();
const { width, fps } = useVideoConfig();
const HEIGHT = 200;

const { audioData, dataOffsetInSeconds } = useWindowedAudioData({
  src: staticFile("voice.wav"),
  frame,
  fps,
  windowInSeconds: 30,
});

if (!audioData) {
  return null;
}

const waveform = visualizeAudioWaveform({
  fps,
  frame,
  audioData,
  numberOfSamples: 256,
  windowInSeconds: 0.5,
  dataOffsetInSeconds,
});

const path = createSmoothSvgPath({
  points: waveform.map((y, i) => ({
    x: (i / (waveform.length - 1)) * width,
    y: HEIGHT / 2 + (y * HEIGHT) / 2,
  })),
});

return (
  <svg width={width} height={HEIGHT}>
    <path d={path} fill="none" stroke="#0b84f3" strokeWidth={2} />
  </svg>
);
```

## Bass-Reactive Effects

Extract low frequencies for beat-reactive animations:

```tsx
const frequencies = visualizeAudio({
  fps,
  frame,
  audioData,
  numberOfSamples: 128,
  optimizeFor: "speed",
  dataOffsetInSeconds,
});

const lowFrequencies = frequencies.slice(0, 32);
const bassIntensity =
  lowFrequencies.reduce((sum, v) => sum + v, 0) / lowFrequencies.length;

const scale = 1 + bassIntensity * 0.5;
const opacity = Math.min(0.6, bassIntensity * 0.8);
```

## Volume-Based Waveform

Use `getWaveformPortion()` (https://www.remotion.dev/docs/get-waveform-portion) when you need simplified volume data instead of frequency spectrum:

```tsx
import { getWaveformPortion } from "@remotion/media-utils";
import { useCurrentFrame, useVideoConfig } from "remotion";

const frame = useCurrentFrame();
const { fps } = useVideoConfig();
const currentTimeInSeconds = frame / fps;

const waveform = getWaveformPortion({
  audioData,
  startTimeInSeconds: currentTimeInSeconds,
  durationInSeconds: 5,
  numberOfSamples: 50,
});

// Returns array of { index, amplitude } objects (amplitude: 0-1)
waveform.map((bar) => (
  <div key={bar.index} style={{ height: bar.amplitude * 100 }} />
));
```

## Postprocessing

Low frequencies naturally dominate. Apply logarithmic scaling for visual balance:

```tsx
const minDb = -100;
const maxDb = -30;

const scaled = frequencies.map((value) => {
  const db = 20 * Math.log10(value);
  return (db - minDb) / (maxDb - minDb);
});
```

````

### 1.22 remotion-markup/3d.md (@remotion/three)

Source: `skills/remotion-markup/3d.md`

````markdown
---
name: 3d
description: 3D content in Remotion using Three.js and React Three Fiber.
metadata:
  tags: 3d, three, threejs
---

# Using Three.js and React Three Fiber in Remotion

Follow React Three Fiber and Three.js best practices.  
Only the following Remotion-specific rules need to be followed:

## Prerequisites

First, the `@remotion/three` package needs to be installed.  
If it is not, use the following command:

```bash
npx remotion add @remotion/three # If project uses npm
bunx remotion add @remotion/three # If project uses bun
yarn remotion add @remotion/three # If project uses yarn
pnpm exec remotion add @remotion/three # If project uses pnpm
```

## Using ThreeCanvas

You MUST wrap 3D content in `<ThreeCanvas>` and include proper lighting.  
`<ThreeCanvas>` MUST have a `width` and `height` prop.

```tsx
import { ThreeCanvas } from "@remotion/three";
import { useVideoConfig } from "remotion";

const { width, height } = useVideoConfig();

<ThreeCanvas width={width} height={height}>
  <ambientLight intensity={0.4} />
  <directionalLight position={[5, 5, 5]} intensity={0.8} />
  <mesh>
    <sphereGeometry args={[1, 32, 32]} />
    <meshStandardMaterial color="red" />
  </mesh>
</ThreeCanvas>;
```

## No animations not driven by `useCurrentFrame()`

Shaders, models etc MUST NOT animate by themselves.  
No animations are allowed unless they are driven by `useCurrentFrame()`.  
Otherwise, it will cause flickering during rendering.

Using `useFrame()` from `@react-three/fiber` is forbidden.

## Animate using `useCurrentFrame()`

Use `useCurrentFrame()` to perform animations.

```tsx
const frame = useCurrentFrame();
const rotationY = frame * 0.02;

<mesh rotation={[0, rotationY, 0]}>
  <boxGeometry args={[2, 2, 2]} />
  <meshStandardMaterial color="#4a9eff" />
</mesh>;
```

## Using `<Sequence>` inside `<ThreeCanvas>`

The `layout` prop of any `<Sequence>` inside a `<ThreeCanvas>` must be set to `none`.

```tsx
import { Sequence } from "remotion";
import { ThreeCanvas } from "@remotion/three";

const { width, height } = useVideoConfig();

<ThreeCanvas width={width} height={height}>
  <Sequence layout="none">
    <mesh>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#4a9eff" />
    </mesh>
  </Sequence>
</ThreeCanvas>;
```

````

### 1.23 remotion-markup/lottie.md (@remotion/lottie)

Source: `skills/remotion-markup/lottie.md`

````markdown
---
name: lottie
description: Embedding Lottie animations in Remotion.
metadata:
  category: Animation
---

# Using Lottie Animations in Remotion

## Prerequisites

First, the @remotion/lottie package needs to be installed.  
If it is not, use the following command:

```bash
npx remotion add @remotion/lottie # If project uses npm
bunx remotion add @remotion/lottie # If project uses bun
yarn remotion add @remotion/lottie # If project uses yarn
pnpm exec remotion add @remotion/lottie # If project uses pnpm
```

## Displaying a Lottie file

To import a Lottie animation:

- Fetch the Lottie asset
- Wrap the loading process in `delayRender()` and `continueRender()`
- Save the animation data in a state
- Render the Lottie animation using the `Lottie` component from the `@remotion/lottie` package

```tsx
import { Lottie, LottieAnimationData } from "@remotion/lottie";
import { useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender } from "remotion";

export const MyAnimation = () => {
  const [handle] = useState(() => delayRender("Loading Lottie animation"));

  const [animationData, setAnimationData] =
    useState<LottieAnimationData | null>(null);

  useEffect(() => {
    fetch("https://assets4.lottiefiles.com/packages/lf20_zyquagfl.json")
      .then((data) => data.json())
      .then((json) => {
        setAnimationData(json);
        continueRender(handle);
      })
      .catch((err) => {
        cancelRender(err);
      });
  }, [handle]);

  if (!animationData) {
    return null;
  }

  return <Lottie animationData={animationData} />;
};
```

## Styling and animating

Lottie supports the `style` prop to allow styles and animations:

```tsx
return (
  <Lottie
    animationData={animationData}
    style={{ width: 400, height: 400 }}
  />
);
```

````

### 1.24 remotion-markup/motion-blur.md

Source: `skills/remotion-markup/motion-blur.md`

````markdown
# Motion blur

Use `@remotion/motion-blur` for frame-driven motion blur.  
Install it with `npx remotion add @remotion/motion-blur`.

`<HtmlInCanvasMotionBlur>` is the state of the art in Remotion for blurring animated HTML. It captures the content at fractional frames and averages its pixels in a canvas.

## `<HtmlInCanvasMotionBlur>`

Available from Remotion 4.0.529.  
Supply the canvas `width` and `height`, usually from `useVideoConfig()`.  
`shutterAngle` defaults to `180` and accepts `0` to `360`.
`0` disables blur. `samples` defaults to `8` and must be an integer from `1` to `64`. More samples can smooth the blur but increase preview and render cost.

Call `useCurrentFrame()` inside the child component so each sample receives its own frame.

```tsx
import {
  HtmlInCanvasMotionBlur,
} from '@remotion/motion-blur';
import {useCurrentFrame, useVideoConfig} from 'remotion';

const MovingBox = () => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        left: frame * 10,
        top: 200,
        width: 120,
        height: 120,
        backgroundColor: '#ff6b6b',
      }}
    />
  );
};

export const HtmlInCanvasBlur = () => {
  const {width, height} = useVideoConfig();

  return (
    <HtmlInCanvasMotionBlur
      width={width}
      height={height}
      samples={8}
      shutterAngle={180}
    >
      <MovingBox />
    </HtmlInCanvasMotionBlur>
  );
};
```

For live preview, enable HTML-in-canvas in Chrome 149 or later with `chrome://flags/#canvas-draw-element`.  
No configuration for rendering is necessary.

Nest `<HtmlInCanvas>` or `<HtmlInCanvasMotionBlur>` components only when `HtmlInCanvas.isNestingSupported()` returns `true` (Chrome 157.0.8080.0 or newer with HTML-in-canvas enabled).

If HTML-in-canvas is unavailable, see the [motion blur guide](https://www.remotion.dev/docs/motion-blur) for other options. See the [`<HtmlInCanvasMotionBlur>` reference](https://www.remotion.dev/docs/motion-blur/html-in-canvas-motion-blur) for API details.

````

### 1.25 remotion-markup/effects.md (@remotion/effects + createEffect)

Source: `skills/remotion-markup/effects.md`

````markdown
---
name: effects
description: Canvas/WebGL visual effects for Remotion using effects arrays and createEffect().
metadata:
  tags: effects, visual-effects, webgl, canvas, video, create-effect
---

Read this guidance when adding an effect to a component that supports `effects`,
or when considering canvas post-processing or a reusable custom effect.

Docs: https://www.remotion.dev/docs/effects
Custom effect docs: https://www.remotion.dev/docs/create-effect

For exposure, white balance, Levels, Curves, and LUTs, read
[color-correction.md](color-correction.md).

## Usage

Install the package that provides the chosen effect:

```bash
npx remotion add @remotion/effects
```

Effects are functions passed to the `effects` prop of supported components.

These components accept `effects` directly:

| Import from        | Components                                                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `remotion`         | `<Img>`, `<CanvasImage>`, `<AnimatedImage>`, `<Solid>`, `<HtmlInCanvas>`                                                      |
| `@remotion/media`  | `<Video>`                                                                                                                     |
| `@remotion/gif`    | `<Gif>`                                                                                                                       |
| `@remotion/rive`   | `<RemotionRiveCanvas>`                                                                                                        |
| `@remotion/shapes` | `<Arrow>`, `<Callout>`, `<Circle>`, `<Ellipse>`, `<Heart>`, `<Pie>`, `<Polygon>`, `<Rect>`, `<Spark>`, `<Star>`, `<Triangle>` |

Ordinary HTML elements, `<Interactive.*>` DOM wrappers, `<AbsoluteFill>`, and
`<Sequence>` do not accept `effects` directly. To apply effects to their content,
wrap them in `<HtmlInCanvas>` and put the `effects` prop on the wrapper.

For example, apply an effect directly to a video:

```tsx
import {Video} from '@remotion/media';
import {blur} from '@remotion/effects/blur';

<Video
  src="https://remotion.media/video.mp4"
  effects={[blur({radius: 8})]}
/>;
```

Use the effect docs for exact props and imports. Most `@remotion/effects` imports use `@remotion/effects/<effect-slug>`; `uvTranslate()` and `xyTranslate()` use `@remotion/effects/translate`.

Most effects use WebGL2; `cylinder()`, `sphere()`, and `pageTurn()` use WebGPU. During renders, enable WebGL and WebGPU with:

```ts
import {Config} from '@remotion/cli/config';

Config.setChromiumOpenGlRenderer('angle');
```

## Available effects

Built-in effects from `@remotion/effects`:

- Color and tone: `brightness()`, `colorCorrection()`, `colorKey()`, `contrast()`, `curves()`, `duotone()`, `exposure()`, `grayscale()`, `hue()`, `invert()`, `levels()`, `linearGradient()`, `linearGradientTint()`, `lut()`, `saturation()`, `shadowsHighlights()`, `thermalVision()`, `tint()`, `vibrance()`, `whiteBalance()`.
- Blur and trails: `blur()`, `lightTrail()`, `linearProgressiveBlur()`, `radialProgressiveBlur()`, `regionBlur()`, `zoomBlur()`.
- Lighting: `dropShadow()`, `longShadows()`, `glow()`, `lightLeak()`, `shine()`, `starburst()`, `vignette()`.
- Distortion and transforms: `barrelDistortion()`, `chromaticAberration()`, `cornerPin()`, `fisheye()`, `mirror()`, `noiseDisplacement()`, `scale()`, `skew()`, `tile()`, `uvTranslate()`, `wave()`, `xyTranslate()`.
- Textures and patterns: `burlap()`, `checkerboard()`, `contourLines()`, `dotGrid()`, `emboss()`, `flannel()`, `gridlines()`, `halftone()`, `halftoneLinearGradient()`, `lines()`, `liquidContours()`, `noise()`, `paper()`, `pattern()`, `rings()`, `scanlines()`, `speckle()`, `tvSignalOff()`, `waves()`, `whiteNoise()`, `zigzag()`.
- Edges: `outline()`, `roughenEdges()`, `shrinkwrap()`, `tear()`.
- Pixelation and transitions: `evolve()`, `linearProgressivePixelate()`, `pixelate()`, `pixelDissolve()`, `radialProgressivePixelate()`, `venetianBlinds()`.

Example:

```tsx
import {Video} from '@remotion/media';
import {brightness} from '@remotion/effects/brightness';

<Video
  src="https://remotion.media/video.mp4"
  effects={[brightness({})]}
/>;
```

## Custom effects

Use `createEffect()` from `remotion` when the user wants a reusable effect factory that works in the same `effects` array as `@remotion/effects`.

Prefer a custom effect over `<HtmlInCanvas onPaint>` when the transformation should be reusable, parameterized, editable in Studio, or stackable with other effects.

For quick project-specific effects, keep the effect next to the composition, for example `src/effects/palette-map.ts`. For library effects intended for `@remotion/effects`, follow the repository's `add-effect` skill instead.

`createEffect()` expects:

- `type`: stable reverse-DNS identifier, for example `com.example.paletteMap`.
- `label`: Studio label, commonly `paletteMap()`.
- `documentationLink`: URL or `null`.
- `backend`: `"2d"`, `"webgl2"` or `"webgpu"`.
- `calculateKey(params)`: stable string containing every resolved parameter that changes output.
- `setup(target)`: create reusable backend state, or return `null`.
- `apply({source, target, width, height, params, state, flipSourceY})`: draw the transformed result into `target`.
- `cleanup(state)`: free resources created by `setup()`.
- `schema`: an `InteractivitySchema` for Studio controls. `disabled` is added automatically.
- `validateParams(params)`: throw on missing or invalid values.

Use `backend: "2d"` for simple pixel, filter, drawImage, or image-data effects. Use WebGL2 only when shader math or GPU performance is needed; during renders, enable WebGL as shown above.

```ts
import {createEffect, type InteractivitySchema} from 'remotion';

type MyEffectParams = {
  readonly amount?: number;
};

const myEffectSchema = {
  amount: {
    type: 'number',
    min: 0,
    max: 1,
    step: 0.01,
    default: 1,
    description: 'Amount',
  },
} as const satisfies InteractivitySchema;

const resolve = (params: MyEffectParams) => ({
  amount: params.amount ?? 1,
});

export const myEffect = createEffect<MyEffectParams, null>({
  type: 'com.example.myEffect',
  label: 'myEffect()',
  documentationLink: null,
  backend: '2d',
  calculateKey: (params) => {
    const {amount} = resolve(params);
    return `my-effect-${amount}`;
  },
  setup: () => null,
  apply: ({source, target, width, height, params}) => {
    const ctx = target.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get a 2D context for myEffect().');
    }

    const {amount} = resolve(params);

    ctx.clearRect(0, 0, width, height);
    ctx.filter = `opacity(${amount * 100}%)`;
    ctx.drawImage(source, 0, 0, width, height);
    ctx.filter = 'none';
  },
  cleanup: () => undefined,
  schema: myEffectSchema,
  validateParams: ({amount = 1}) => {
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0 || amount > 1) {
      throw new TypeError('amount must be a number between 0 and 1');
    }
  },
});
```

For a WebGL2 effect, compile/link shaders in `setup()`, keep the program, fullscreen quad, texture, and uniform locations in state, upload `source` in `apply()`, and free GPU resources in `cleanup()`. Minimal shape:

```ts
import {createEffect, type InteractivitySchema} from 'remotion';

type RgbShiftParams = {
  readonly amount?: number;
};

type RgbShiftState = {
  readonly gl: WebGL2RenderingContext;
  readonly program: WebGLProgram;
  readonly vao: WebGLVertexArrayObject;
  readonly vbo: WebGLBuffer;
  readonly texture: WebGLTexture;
  readonly uSource: WebGLUniformLocation | null;
  readonly uOffset: WebGLUniformLocation | null;
};

const rgbShiftSchema = {
  amount: {
    type: 'number',
    min: 0,
    max: 80,
    step: 1,
    default: 12,
    description: 'Amount',
  },
} as const satisfies InteractivitySchema;

export const rgbShift = createEffect<RgbShiftParams, RgbShiftState>({
  type: 'com.example.rgbShift',
  label: 'rgbShift()',
  documentationLink: null,
  backend: 'webgl2',
  calculateKey: ({amount = 12}) => `rgb-shift-${amount}`,
  setup: (target) => {
    const gl = target.getContext('webgl2', {
      premultipliedAlpha: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    if (!gl) {
      throw new Error('Could not get a WebGL2 context for rgbShift().');
    }

    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

    // Compile/link shaders, create a fullscreen quad VAO/VBO, create a
    // CLAMP_TO_EDGE RGBA texture, and get uSource/uOffset uniform locations.
    return createRgbShiftState(gl);
  },
  apply: ({source, width, height, params, state, flipSourceY}) => {
    const amount = params.amount ?? 12;
    const {gl} = state;

    gl.viewport(0, 0, width, height);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipSourceY);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, state.texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      source as TexImageSource,
    );

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(state.program);
    if (state.uSource) gl.uniform1i(state.uSource, 0);
    if (state.uOffset) gl.uniform2f(state.uOffset, amount / width, 0);
    gl.bindVertexArray(state.vao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  },
  cleanup: ({gl, program, vao, vbo, texture}) => {
    gl.deleteTexture(texture);
    gl.deleteBuffer(vbo);
    gl.deleteProgram(program);
    gl.deleteVertexArray(vao);
  },
  schema: rgbShiftSchema,
  validateParams: ({amount = 12}) => {
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0 || amount > 80) {
      throw new TypeError('amount must be a number between 0 and 80');
    }
  },
});
```

For a complete 2D and WebGL2 pair, see `packages/example/src/EffectsTestbed/sample-posterize-2d.ts` and `packages/example/src/EffectsTestbed/sample-rgb-shift-webgl.ts`.

Use the returned factory in an `effects` array:

```tsx
import {CanvasImage, staticFile} from 'remotion';
import {myEffect} from './effects/my-effect';

export const MyComp: React.FC = () => {
  return (
    <CanvasImage
      src={staticFile('image.png')}
      effects={[myEffect({amount: 0.8})]}
    />
  );
};
```

When generating a custom effect, also:

- Include `disabled?: boolean` only through the returned factory; do not add it to the custom params type or schema.
- Validate required parameters at factory-call time with `validateParams`.
- Include all defaults in both `schema` and the `resolve()` helper.
- Reset mutable 2D context state such as `filter`, `globalAlpha`, transforms, and compositing after drawing.
- Preserve alpha unless the requested effect intentionally changes transparency.

````

### 1.26 remotion-markup/light-leaks.md

Source: `skills/remotion-markup/light-leaks.md`

````markdown
---
name: light-leaks
description: Light leak overlay effects for Remotion using lightLeak() from @remotion/effects.
metadata:
  tags: light-leaks, overlays, effects, transitions
---

## Light Leaks

This only works from Remotion 4.0.500 and up. Use `npx remotion versions` to check your Remotion version and `npx remotion upgrade` to upgrade your Remotion version.

Apply `lightLeak()` from `@remotion/effects/light-leak` to a canvas-based component such as `<Solid>`. Animate `progress` from `0` to `1`; the light leak reveals during the first half and retracts during the second half.

Typically use it inside a `<TransitionSeries.Overlay>` to play over the cut point between two scenes. See the **transitions** rule for `<TransitionSeries>` and overlay usage.

## Prerequisites

```bash
npx remotion add @remotion/effects
```

## Light leak overlay component

Keep the `progress` calculation inline so it is editable in Remotion Studio:

```tsx
import {lightLeak} from '@remotion/effects/light-leak';
import {interpolate, Solid, useCurrentFrame, useVideoConfig} from 'remotion';

const LightLeakOverlay: React.FC<{
  seed?: number;
  hueShift?: number;
}> = ({seed = 0, hueShift = 0}) => {
  const frame = useCurrentFrame();
  const {durationInFrames, height, width} = useVideoConfig();

  return (
    <Solid
      width={width}
      height={height}
      effects={[
        lightLeak({
          seed,
          hueShift,
          progress: interpolate(frame, [0, durationInFrames - 1], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }),
      ]}
    />
  );
};
```

## Basic usage with TransitionSeries

```tsx
import {TransitionSeries} from '@remotion/transitions';

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneA />
  </TransitionSeries.Sequence>
  <TransitionSeries.Overlay durationInFrames={30}>
    <LightLeakOverlay />
  </TransitionSeries.Overlay>
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneB />
  </TransitionSeries.Sequence>
</TransitionSeries>;
```

## Options

- `progress?` — controls the evolve/retract phase from `0` to `1`. Effects do not animate on their own, so drive it with `useCurrentFrame()` and `interpolate()`. Default: `0.5`.
- `seed?` — determines the shape of the light leak pattern. Different seeds produce different patterns. Default: `0`.
- `hueShift?` — rotates the hue in degrees (`0`–`360`). Default: `0` (yellow-to-orange). `120` = green, `240` = blue.
- `disabled?` — skips the effect when `true`. Default: `false`.

## Customizing the look

```tsx
// Blue-tinted light leak with a different pattern
<LightLeakOverlay seed={5} hueShift={240} />;

// Green-tinted light leak
<LightLeakOverlay seed={2} hueShift={120} />;
```

## Standalone usage

The overlay component can also be used outside of `<TransitionSeries>` as a decorative layer in any composition:

```tsx
const MyComp: React.FC = () => (
  <>
    <MyContent />
    <LightLeakOverlay seed={3} />
  </>
);
```

`lightLeak()` uses WebGL2. Enable WebGL during rendering with `Config.setChromiumOpenGlRenderer("angle")`.

````

### 1.27 remotion-markup/images.md

Source: `skills/remotion-markup/images.md`

````markdown
## Sizing and positioning

Use the `style` prop to control size and position:

```tsx
<Img
  src={staticFile("photo.png")}
  style={{
    width: 500,
    height: 300,
    position: "absolute",
    top: 100,
    left: 50,
    objectFit: "cover",
  }}
/>
```

## Dynamic image paths

Use template literals for dynamic file references:

```tsx
import { Img, staticFile, useCurrentFrame } from "remotion";

const frame = useCurrentFrame();

// Image sequence
<Img src={staticFile(`frames/frame${frame}.png`)} />

// Selecting based on props
<Img src={staticFile(`avatars/${props.userId}.png`)} />

// Conditional images
<Img
  src={staticFile(`icons/${isActive ? "active" : "inactive"}.svg`)}
/>
```

This pattern is useful for:

- Image sequences (frame-by-frame animations)
- User-specific avatars or profile images
- Theme-based icons
- State-dependent graphics

## Getting image dimensions

Use `getImageDimensions()` from `@remotion/media-utils` to get the dimensions of an image:

```tsx
import { getImageDimensions } from "@remotion/media-utils";
import { staticFile } from "remotion";

const { width, height } = await getImageDimensions(staticFile("photo.png"));
```

This is useful for calculating aspect ratios or sizing compositions:

```tsx
import { getImageDimensions } from "@remotion/media-utils";
import { staticFile, CalculateMetadataFunction } from "remotion";

const calculateMetadata: CalculateMetadataFunction = async () => {
  const { width, height } = await getImageDimensions(staticFile("photo.png"));
  return {
    width,
    height,
  };
};
```

````

### 1.28 remotion-markup/gifs.md

Source: `skills/remotion-markup/gifs.md`

````markdown
---
name: gif
description: Displaying GIFs, APNG, AVIF and WebP in Remotion
metadata:
  tags: gif, animation, images, animated, apng, avif, webp
---

# Using Animated images in Remotion

## Basic usage

Use `<AnimatedImage>` to display a GIF, APNG, AVIF or WebP image synchronized with Remotion's timeline:

```tsx
import { AnimatedImage, staticFile } from "remotion";

export const MyComposition = () => {
  return (
    <AnimatedImage
      src={staticFile("animation.gif")}
      width={500}
      height={500}
    />
  );
};
```

Remote URLs are also supported (must have CORS enabled):

```tsx
<AnimatedImage
  src="https://example.com/animation.gif"
  width={500}
  height={500}
/>
```

## Sizing and fit

Control how the image fills its container with the `fit` prop:

```tsx
// Stretch to fill (default)
<AnimatedImage
  src={staticFile("animation.gif")}
  width={500}
  height={300}
  fit="fill"
/>

// Maintain aspect ratio, fit inside container
<AnimatedImage
  src={staticFile("animation.gif")}
  width={500}
  height={300}
  fit="contain"
/>

// Fill container, crop if needed
<AnimatedImage
  src={staticFile("animation.gif")}
  width={500}
  height={300}
  fit="cover"
/>
```

## Playback speed

Use `playbackRate` to control the animation speed:

```tsx
// 2x speed
<AnimatedImage
  src={staticFile("animation.gif")}
  width={500}
  height={500}
  playbackRate={2}
/>
// Half speed
<AnimatedImage
  src={staticFile("animation.gif")}
  width={500}
  height={500}
  playbackRate={0.5}
/>
```

## Looping behavior

Control what happens when the animation finishes:

```tsx
// Loop indefinitely (default)
<AnimatedImage
  src={staticFile("animation.gif")}
  width={500}
  height={500}
  loopBehavior="loop"
/>

// Play once, show final frame
<AnimatedImage
  src={staticFile("animation.gif")}
  width={500}
  height={500}
  loopBehavior="pause-after-finish"
/>

// Play once, then clear canvas
<AnimatedImage
  src={staticFile("animation.gif")}
  width={500}
  height={500}
  loopBehavior="clear-after-finish"
/>
```

## Styling

Use the `style` prop for additional CSS (use `width` and `height` props for sizing):

```tsx
<AnimatedImage
  src={staticFile("animation.gif")}
  width={500}
  height={500}
  style={{
    borderRadius: 20,
    position: "absolute",
    top: 100,
    left: 50,
  }}
/>
```

## Getting GIF duration

Use `getGifDurationInSeconds()` from `@remotion/gif` to get the duration of a GIF.

```bash
npx remotion add @remotion/gif
```

```tsx
import { getGifDurationInSeconds } from "@remotion/gif";
import { staticFile } from "remotion";

const duration = await getGifDurationInSeconds(staticFile("animation.gif"));
console.log(duration); // e.g. 2.5
```

This is useful for setting the composition duration to match the GIF:

```tsx
import { getGifDurationInSeconds } from "@remotion/gif";
import { staticFile, CalculateMetadataFunction } from "remotion";

const calculateMetadata: CalculateMetadataFunction = async () => {
  const duration = await getGifDurationInSeconds(staticFile("animation.gif"));
  return {
    durationInFrames: Math.ceil(duration * 30),
  };
};
```

## Alternative

If `<AnimatedImage>` does not work (only supported in Chrome and Firefox), you can use `<Gif>` from `@remotion/gif` instead.

```bash
npx remotion add @remotion/gif # If project uses npm
bunx remotion add @remotion/gif # If project uses bun
yarn remotion add @remotion/gif # If project uses yarn
pnpm exec remotion add @remotion/gif # If project uses pnpm
```

```tsx
import { Gif } from "@remotion/gif";
import { staticFile } from "remotion";

export const MyComposition = () => {
  return <Gif src={staticFile("animation.gif")} width={500} height={500} />;
};
```

The `<Gif>` component has the same props as `<AnimatedImage>` but only supports GIF files.

````

### 1.29 remotion-markup/embedding-videos.md

Source: `skills/remotion-markup/embedding-videos.md`

````markdown
---
name: embedding-videos
description: Embedding videos in Remotion - trimming, volume, speed, looping, pitch
metadata:
  tags: video, media, trim, volume, speed, loop, pitch
---

# Using videos in Remotion

## Prerequisites

First, the @remotion/media package needs to be installed.  
If it is not, use the following command:

```bash
npx remotion add @remotion/media # If project uses npm
bunx remotion add @remotion/media # If project uses bun
yarn remotion add @remotion/media # If project uses yarn
pnpm exec remotion add @remotion/media # If project uses pnpm
```

Use `<Video>` from `@remotion/media` to embed videos into your composition.

```tsx
import { Video } from "@remotion/media";
import { staticFile } from "remotion";

export const MyComposition = () => {
  return <Video src={staticFile("video.mp4")} />;
};
```

Remote URLs are also supported:

```tsx
<Video src="https://remotion.media/video.mp4" />
```

## Trimming

Use `trimBefore` to skip the beginning of the video and `durationInFrames` to end it early. Values are in frames.

```tsx
const { fps } = useVideoConfig();

return (
  <Video
    src={staticFile("video.mp4")}
    trimBefore={2 * fps} // Skip the first 2 seconds
    durationInFrames={8 * fps} // Play 8 seconds, until the 10 second mark
  />
);
```

## Delaying

Set `from` directly on `<Video>` to delay when it appears:

```tsx
import { staticFile, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";

const { fps } = useVideoConfig();

return (
  <Video from={fps} src={staticFile("video.mp4")} />
);
```

The video will appear after 1 second.

## Sizing and Position

Use the `style` prop to control size and position:

```tsx
<Video
  src={staticFile("video.mp4")}
  style={{
    width: 500,
    height: 300,
    position: "absolute",
    top: 100,
    left: 50,
  }}
  objectFit="cover"
/>
```

## Volume

Set a static volume (0 to 1):

```tsx
<Video src={staticFile("video.mp4")} volume={0.5} />
```

Use `useCurrentFrame()` and `interpolate()` for keyframed volume:

```tsx
import { Video } from "@remotion/media";
import { interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const frame = useCurrentFrame();
const { fps } = useVideoConfig();

return (
  <Video
    src={staticFile("video.mp4")}
    volume={interpolate(frame, [0, 1 * fps], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })}
  />
);
```

With Studio interactivity enabled, these keyframes can be edited and are shown as a volume curve in the timeline.

Use `muted` to silence the video entirely:

```tsx
<Video src={staticFile("video.mp4")} muted />
```

## Speed

Use `playbackRate` to change the playback speed:

```tsx
// 2x speed
<Video src={staticFile("video.mp4")} playbackRate={2} />
// Half speed
<Video src={staticFile("video.mp4")} playbackRate={0.5} />
```

Reverse playback is not supported.

## Looping

Use `loop` to loop the video indefinitely:

```tsx
<Video src={staticFile("video.mp4")} loop />
```

```tsx
import { Video } from "@remotion/media";
import { interpolate, staticFile, useCurrentFrame } from "remotion";

const frame = useCurrentFrame();

<Video
  src={staticFile("video.mp4")}
  loop
  volume={interpolate(frame, [0, 300], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })}
/>
```

## Pitch

Use `toneFrequency` to adjust the pitch without affecting speed. Values range from 0.01 to 2:

```tsx
<Video
  src={staticFile("video.mp4")}
  toneFrequency={1.5} // Higher pitch
/>
<Video
  src={staticFile("video.mp4")}
  toneFrequency={0.8} // Lower pitch
/>
```

Pitch shifting only works during server-side rendering, not in the Remotion Studio preview or in the `<Player />`.

````

### 1.30 remotion-markup/cropping.md

Source: `skills/remotion-markup/cropping.md`

````markdown
# Cropping

Preferably, the `cropLeft`, `cropRight`, `cropTop` and `cropBottom` props are used to crop content.
It allows for interactively dragging the components and adapting the outlines in the canvas to the crop.

The following components support `crop*` props:

- `<Sequence>` from `remotion`, when `layout="absolute-fill"`
- `<Interactive.*>` HTML and SVG elements from `remotion`
- Custom components made with `Interactive.create()` from `remotion`, using a managed `layout: 'absolute-fill'` root or forwarding `style` to their own visual root
- `<CanvasImage>` from `remotion`
- `<Img>` from `remotion`
- `<AnimatedImage>` from `remotion`
- `<HtmlInCanvas>` from `remotion`
- `<Solid>` from `remotion`
- `<Video>` from `@remotion/media`
- `<Gif>` from `@remotion/gif`
- `<RemotionRiveCanvas>` from `@remotion/rive`

Crop values are ratios between `0` and `1`.
A value of `0` applies no crop on that edge.
A value of `1` is a full crop.
Keep Interactivity Best Practices also for cropping, to keep it editable and keyframable.

```tsx
<CanvasImage
  src={staticFile("photo.png")}
  cropLeft={interpolate(frame, [0, 30], [0, 0.25], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })}
  cropBottom={0.1}
/>
```

Do not use `clipPath` together with crop props.

````

### 1.31 remotion-markup/ffmpeg.md

Source: `skills/remotion-markup/ffmpeg.md`

````markdown
---
name: ffmpeg
description: Using FFmpeg and FFprobe in Remotion
metadata:
  tags: ffmpeg, ffprobe, video, trimming
---

## FFmpeg in Remotion

`ffmpeg` and `ffprobe` do not need to be installed. They are available via the `npx remotion ffmpeg` and `npx remotion ffprobe`:

```bash
npx remotion ffmpeg -i input.mp4 output.mp3
npx remotion ffprobe input.mp4
```

### Trimming videos

You have 2 options for trimming videos:

1. **Preferred**: Use the `trimBefore` and `durationInFrames` props of the `<Video>` component. This is non-destructive, requires no re-encoding, and you can change the trim at any time.

```tsx
import {Video} from '@remotion/media';

<Video
  src={staticFile('video.mp4')}
  trimBefore={5 * fps}
  durationInFrames={5 * fps}
/>;
```

2. Use the FFmpeg command line. You MUST re-encode the video to avoid frozen frames at the start of the video. Only use this if you need a standalone trimmed file (e.g. for upload or external use).

```bash
# Re-encodes from the exact frame
npx remotion ffmpeg -ss 00:00:05 -i public/input.mp4 -to 00:00:10 -c:v libx264 -c:a aac public/output.mp4
```

````

### 1.32 remotion-markup/silence-detection.md

Source: `skills/remotion-markup/silence-detection.md`

````markdown
---
name: silence-detection
description: Adaptive silence detection for video/audio files using FFmpeg loudnorm and silencedetect
metadata:
  tags: silence, detection, trimming, ffmpeg, loudnorm, audio
---

# Adaptive Silence Detection

Detect silent segments in video or audio files.

Requires FFmpeg — see [ffmpeg.md](./ffmpeg.md) for how to invoke it in Remotion projects.

## Step 1: Measure loudness with `loudnorm`

Use the `loudnorm` filter in JSON mode to get the EBU R128 integrated loudness and gating threshold for each file:

```bash
npx remotion ffmpeg -i public/video.mov -map 0:a -af loudnorm=print_format=json -f null /dev/null
```

As output you will get:
- `input_i`: Integrated loudness (dB) — the overall perceived volume
- `input_thresh`: EBU R128 gating threshold (dB) — the level below which audio is considered too quiet to count toward loudness measurement

## Step 2: Detect silences using adaptive threshold

Pass the `input_thresh` value from step 1 as the `noise` parameter to `silencedetect`:

```bash
npx remotion ffmpeg -i public/video.mov -map 0:a -af "silencedetect=noise=${THRESH}dB:d=0.5" -f null /dev/null
```

Parameters:
- `noise`: The threshold below which audio is considered silent. Use `input_thresh` from step 1.
- `d`: Minimum silence duration in seconds. `0.5` is a good default.

## Interpreting the output

The filter outputs pairs of `silence_start` and `silence_end` timestamps:

```
[silencedetect] silence_start: 0
[silencedetect] silence_end: 2.241021 | silence_duration: 2.241021
[silencedetect] silence_start: 38.77425
[silencedetect] silence_end: 39.619604 | silence_duration: 0.845354
```

## Identifying leading and trailing silence

- **Leading silence**: Consecutive silence segments starting at or near 0. If the first `silence_start` is > 0.5s, there is no leading silence.
- **Trailing silence**: The last silence segment that extends to (or near) the end of the file. Compare the last `silence_end` with the file's total duration.

When multiple silences are nearly contiguous at the start or end (gap < 0.2s), treat them as a single leading/trailing silence block.

## Using with Remotion's `<Video>` component

Apply the detected trim points using `trimBefore` and `durationInFrames` (values are in frames):

```tsx
import { Video } from "@remotion/media";
import { staticFile, useVideoConfig } from "remotion";

const { fps } = useVideoConfig();

<Video
  src={staticFile("video.mov")}
  trimBefore={Math.floor(leadingEnd * fps)}
  durationInFrames={Math.ceil(trailingStart * fps) - Math.floor(leadingEnd * fps)}
/>
```

````

### 1.33 remotion-markup/html-in-canvas.md

Source: `skills/remotion-markup/html-in-canvas.md`

````markdown
# Using `<HtmlInCanvas>` in Remotion

Renders children into a `<canvas>` so you can post-process them with the Canvas 2D API or WebGL.

Only works in Chrome 149+ with the `chrome://flags/#canvas-draw-element` flag enabled.  
Give the user a notice.

## Nesting

Nest `<HtmlInCanvas>` components only when `HtmlInCanvas.isNestingSupported()` returns `true` (Chrome 157.0.8080.0 or newer with HTML-in-canvas enabled). Older browsers reject nesting.

## Enabling WebGL during renders

If you make use of WebGL during renders, you need to enable it:

From the CLI:

```bash
npx remotion render --gl=angle
```

Set it as the default for Studio and CLI (advised):

```ts
import { Config } from "@remotion/cli/config";

Config.setChromiumOpenGlRenderer("angle");
```

## Basic usage

By default, draws to canvas with no effect applied:

```tsx
import { HtmlInCanvas } from "remotion";

export const MyComp = () => {
  return (
    <HtmlInCanvas width={1280} height={720}>
      <div style={{ fontSize: 80 }}>
        Hello
      </div>
    </HtmlInCanvas>
  );
};
```

## 2D effect with `onPaint`

`onPaint` runs whenever the content updates. Call `ctx.drawElementImage(elementImage, 0, 0)` to draw the captured DOM.

```tsx
import {
  AbsoluteFill,
  HtmlInCanvas,
  type HtmlInCanvasOnPaint,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useCallback } from "react";

export const Blur = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const onPaint: HtmlInCanvasOnPaint = useCallback(
    ({ canvas, elementImage }) => {
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Failed to acquire 2D context");

      const blurPx = 4 + 18 * (0.5 + 0.5 * Math.sin((frame / fps) * Math.PI));

      ctx.reset();
      ctx.filter = `blur(${blurPx}px)`;
      ctx.drawElementImage(elementImage, 0, 0);
    },
    [frame, fps],
  );

  return (
    <HtmlInCanvas width={width} height={height} onPaint={onPaint}>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          fontSize: 120,
        }}
      >
        <h1>
          Hello
        </h1>
      </AbsoluteFill>
    </HtmlInCanvas>
  );
};
```

## WebGL effects

For WebGL, set up the context, program, and texture in `onInit` and return a cleanup function. Allocate the texture with `gl.texImage2D(..., null)` when `elementImage` changes size. Inside `onPaint`, upload with `gl.texElementSubImage2D(gl.TEXTURE_2D, 0, 0, 0, elementImage)` and draw. Older Chromium versions only expose `gl.texElementImage2D()`; use it when the new method is absent.

For a fully working minimal example, see https://github.com/remotion-dev/remotion/blob/main/packages/docs/components/demos/HtmlInCanvasDocsDemoWebGL.tsx.

## Async `onPaint`

`onPaint` may be `async`. Remotion holds the frame open via `delayRender()` until the promise resolves. Useful for multi-pass effects with `createImageBitmap`.

````

### 1.34 remotion-markup/color-correction.md

Source: `skills/remotion-markup/color-correction.md`

````markdown
---
name: color-correction
description: Correct exposure, white balance, and tone with primary adjustments, Levels, Curves, and 3D Cube LUTs.
metadata:
  tags: color-correction, color-grading, levels, curves, lut, cube, exposure, white-balance
---

# Color correction

Apply color adjustments through the `effects` prop of `<Video>` from `@remotion/media`, or other supported components.  
See [effects.md](effects.md) for more context on effects.

## Primary adjustments

Prefer [`colorCorrection()`](https://www.remotion.dev/docs/effects/color-correction) when combining adjustments.  
It performs them in one WebGL pass and exposes controls in the Studio.

| Control                 | Meaning and range                                                         | Neutral value |
| ----------------------- | ------------------------------------------------------------------------- | ------------- |
| `exposure`              | Stops, from `-5` to `5`; positive values brighten                         | `0`           |
| `temperature`           | From `-1` (cooler) to `1` (warmer)                                        | `0`           |
| `tint`                  | From `-1` (greener) to `1` (more magenta)                                 | `0`           |
| `shadows`, `highlights` | From `-1` to `1`; negative values darken, positive values lift the region | `0`           |
| `blacks`, `whites`      | From `-1` to `1`; target narrower regions near black and white            | `0`           |
| `contrast`              | Non-negative multiplier around `pivot` (`0` to `1`, default `0.5`)        | `1`           |
| `saturation`            | Non-negative multiplier; `0` is grayscale                                 | `1`           |
| `vibrance`              | From `-1` to `1`; positive values emphasize muted colors                  | `0`           |

```tsx
import {colorCorrection} from '@remotion/effects/color-correction';
import {Video} from '@remotion/media';
import {staticFile} from 'remotion';

export const CorrectedVideo = () => {
  return (
    <Video
      src={staticFile('footage.mp4')}
      effects={[
        colorCorrection({
          exposure: 0.25,
          temperature: 0.1,
          tint: -0.03,
          shadows: 0.15,
          highlights: -0.1,
          contrast: 1.1,
          saturation: 1.05,
          vibrance: 0.15,
        }),
      ]}
    />
  );
};
```

Internally, `colorCorrection()` applies exposure, white balance, tonal regions,
contrast, saturation, then vibrance. Omitted controls use their neutral values.
Keep everything inline on the target's `effects` prop.

Standalone effects are also available when a different order or an additional
adjustment is needed: `exposure()`, `whiteBalance()`, `shadowsHighlights()`,
`contrast()`, `saturation()`, and `vibrance()`. See [effects](effects.md)

## Levels and Curves

Use [`levels()`](https://www.remotion.dev/docs/effects/levels) to set input black
and white points, adjust midtones with gamma, or limit the output range.
`blackPoint` and `whitePoint` are normalized from `0` to `1`, default to `0` and
`1`, and require `blackPoint < whitePoint`. `gamma` ranges from `0.01` to `10`,
defaults to `1`, and values above `1` brighten midtones. `outputBlack` and
`outputWhite` range from `0` to `1` and default to `0` and `1`; reversing them
inverts the output.

Use [`curves()`](https://www.remotion.dev/docs/effects/curves) for an S-curve or
other adjustments that need multiple input/output control points. Supply `2` to
`32` `[input, output]` pairs with both coordinates in `0` to `1` and strictly
increasing input values. Outputs may increase or decrease. The default
`[[0, 0], [1, 1]]` leaves the image unchanged. Values outside the first and last
input points use the nearest endpoint's output.

Curves uses `interpolation: 'smooth'` by default, connecting points without
overshooting their output values. Use `'linear'` for straight segments.
`amount` blends with the original image from `0` to `1` (default `1`).

Both effects default to `channel: 'rgb'`. Set `'red'`, `'green'`, or `'blue'` to
adjust one channel, and stack separate effect calls for different channel
adjustments. Both preserve alpha. Curves, the Levels channel/output controls,
and their graphical Studio editors are available from Remotion `4.0.537`.

Keep the effect calls and point arrays inline so Studio can edit them:

```tsx
import {curves} from '@remotion/effects/curves';
import {levels} from '@remotion/effects/levels';
import {Video} from '@remotion/media';
import {staticFile} from 'remotion';

export const ToneAdjustedVideo = () => {
  return (
    <Video
      src={staticFile('footage.mp4')}
      effects={[
        levels({
          blackPoint: 0.03,
          whitePoint: 0.95,
          gamma: 1.1,
          outputBlack: 0.02,
          outputWhite: 0.98,
        }),
        curves({
          channel: 'red',
          points: [[0, 0], [0.5, 0.55], [1, 1]],
          amount: 0.8,
        }),
      ]}
    />
  );
};
```

Effects run in array order: this example adjusts the RGB levels, then lifts
red midtones. Place primary adjustments before `lut()` when the LUT should
receive the corrected footage.

## LUTs and combining effects

A LUT (lookup table) maps input RGB colors to output colors. Use
[`lut()`](https://www.remotion.dev/docs/effects/lut) to apply a 3D `.cube` LUT.  
Its `content` parameter takes the complete file contents as a string.

This example uses a small warm LUT inline:

```tsx
import {colorCorrection} from '@remotion/effects/color-correction';
import {lut} from '@remotion/effects/lut';
import {Video} from '@remotion/media';
import {staticFile} from 'remotion';

export const GradedVideo = () => {
  return (
    <Video
      src={staticFile('footage.mp4')}
      effects={[
        colorCorrection({exposure: 0.25, contrast: 1.1}),
        lut({
          content: `TITLE "Warm"
LUT_3D_SIZE 2
0 0 0
1 0.1 0
0 0.9 0.1
1 0.9 0.1
0 0.1 0.8
1 0.2 0.7
0 0.9 0.8
1 0.9 0.8`,
        }),
      ]}
    />
  );
};
```

### Supported format and limitations

- Only 3D `.cube` LUTs are supported. `LUT_3D_SIZE` must be an integer from `2`
  to `256`, followed by exactly `size ** 3` RGB rows. 1D LUTs are unsupported.
- Optional `TITLE`, `DOMAIN_MIN`, `DOMAIN_MAX`, blank lines, and `#` comments are
  supported. Other LUT formats need conversion before use.
- `lut()` has no `src` or strength/amount parameter. Use `disabled: true` to
  bypass it.

## Studio workflow

Select the layer and open its effect in the inspector. Levels shows an input
histogram with black, gamma, and white input handles plus output endpoints.
Curves shows an input histogram behind the graph: add or drag points, edit
their numeric coordinates, remove points, or reset the curve. The histogram
shows pixels entering that effect, including adjustments earlier in the stack.

Levels numeric controls and Curves `amount` can be keyframed in Studio.
Curves points are not keyframable in Studio. To animate them, derive `points`
from `useCurrentFrame()` in code, keeping input values strictly increasing on
every frame. Computed point arrays display as read-only in the graph.

Put `.cube` files in `public/` to preview them in the Assets panel.  
The user can drag a 3D `.cube` file from the computer or Assets panel onto a
video in the canvas or timeline to apply the LUT effect.

## See also

- [Color correction documentation](https://www.remotion.dev/docs/color-correction)

````

### 1.35 remotion-markup/video-editing.md

Source: `skills/remotion-markup/video-editing.md`

````markdown
# Editable video timelines

Structure the timeline around the things the user edits together: a captioned
shot, a set of cutaways, or an independently timed music segment. Write every
independently editable clip as its own JSX node with inline names and props.
Use the timeline structure guide
for choosing tracks, timing groups, and connected compositions.

## Choose the cut behavior

Use a named `Track` for non-overlapping clips with independent start times. Keep
`from`, `trimBefore`, `durationInFrames`, and `playbackRate` on each clip. Moving
or resizing one clip then leaves the other start times unchanged.

Use `TransitionSeries` when consecutive clips should remain adjacent. Put
`durationInFrames` on each `TransitionSeries.Sequence`; the series calculates
start times and repositions later clips after a duration change. It also handles
overlapping transitions. Preserve these specialized boundaries when refactoring.

Get `fps` from `useVideoConfig()` for seconds-to-frames expressions, and keep
them on the JSX node, such as `trimBefore={4 * fps}`. Literal frame counts are
appropriate when the edit is already specified in frames.

## Keep synchronized layers on one clock

Put a shot's video, captions, and source-synchronized overlays under one timing
boundary. Apply `trimBefore`, `durationInFrames`, and `playbackRate` to that
boundary once. For an independently placed group, also set its `from`.

A `Sequence` is useful here because moving, trimming, retiming, or deleting the
group affects all its layers. For consecutive shots, use the existing
`TransitionSeries.Sequence` for the same purpose:

```tsx
import {Video} from '@remotion/media';
import {TransitionSeries} from '@remotion/transitions';
import {staticFile, useVideoConfig} from 'remotion';
import {BasicCaptions} from './basic-captions';

export const Interview = () => {
  const {fps} = useVideoConfig();
  return (
    <TransitionSeries name="Interview shots">
      <TransitionSeries.Sequence
        name="Opening"
        trimBefore={4 * fps}
        durationInFrames={3 * fps}
      >
        <Video name="Opening footage" src={staticFile('interview.mp4')} />
        <BasicCaptions
          name="Opening captions"
          width={900}
          style={{position: 'absolute', bottom: 80, translate: '510px 0px'}}
          captions={[
            {
              text: 'Hello',
              startMs: 4500,
              endMs: 4900,
              timestampMs: 4700,
              confidence: null,
            },
            {
              text: ' world',
              startMs: 4900,
              endMs: 5400,
              timestampMs: 5150,
              confidence: null,
            },
          ]}
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence
        name="Next shot"
        trimBefore={10 * fps}
        durationInFrames={2 * fps}
      >
        <Video name="Next footage" src={staticFile('interview.mp4')} />
        <BasicCaptions
          name="Next captions"
          width={900}
          style={{position: 'absolute', bottom: 80, translate: '510px 0px'}}
          captions={[
            {
              text: 'Next',
              startMs: 10500,
              endMs: 11000,
              timestampMs: 10750,
              confidence: null,
            },
          ]}
        />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
```

Each caption array stays inline on its own caption node, with timestamps relative
to the original media file. Passing the array through a generic shot prop removes
the source array the Caption editor needs. See
displaying captions
for the caption component and setup.

## Place overlays at the scope they span

Keep a source-synchronized HUD inside its shot. Put a sticker that continues
across several cuts in the enclosing scene, so the end of the first cut does
not unmount it. Use that scene's frame coordinates for its timing.

Within a shot or scene, put successive cutaways on a named `Cutaways` track.
Keep simultaneous visuals on separate tracks. If cutaways cover a speaking
video, retain the underlying speech or deliberately separate its audio; removing
an obscured video can also remove the voice.

Group a sticker or other visual with its accompanying sound when they should
move or be deleted together. Keep their local offsets inside the group. Give
both the visual and sound their intended durations so the group neither cuts
off a sound tail nor extends the visual to cover that tail.

## Put music segments on a shared track

Music clips with gaps or adjacent boundaries can share one named track. They
remain separately editable, including their source trims and volume envelopes:

See the complete timeline example
for a music track alongside scene tracks.

Check natural audio durations as well as explicit bounds before putting sounds
on a track. An item may end exactly where the next begins, but overlapping tails
need separate tracks. Do not shorten sounds just to make them fit.

## Preserve the edit when restructuring

Keep source trims, cut lengths, playback rates, caption arrays, volume envelopes,
and stacking order unchanged unless the user requested an edit. Moving content
under a new timing boundary can change the frame returned by `useCurrentFrame()`;
preserve the source clock or adjust local offsets deliberately.

Verify the full composition and any connected views, rather than judging the
result only from a standalone scene. Check visual output and audio around cuts,
overlay boundaries, and sound tails. Grouping the timeline should preserve the
existing edit while making its controls easier to use.

````

### 1.36 remotion-markup/connected-compositions.md

Source: `skills/remotion-markup/connected-compositions.md`

````markdown
# Connected compositions

A connected composition lets the user open a scene or element in its own
Studio timeline while editing the implementation used by the parent video.
Use it for a substantial scene, a reusable card, or a group that should move
and be edited together, such as a sticker with its sound or a summary graphic.
A layout container or decorative detail usually belongs inside that group as
plain HTML.

## Create the connection

1. Export the component with `Interactive.create()`. Use `layout: 'absolute-fill'`
   for a scene or `layout: 'none'` for a bounded element.
2. Render that exported component in the parent, with its instance props inline.
   Put timing directly on it, or on the shared `Sequence` or
   `TransitionSeries.Sequence` that governs its layers.
3. Register the exact same exported reference in `<Composition component={...}>`.
   Give the registration a unique literal ID, inline metadata, and representative
   inline `defaultProps`. Registering an inner component or an inline wrapper
   does not connect the instance the user sees.

Follow the complete timeline example
for the component definitions, parent, and registrations.

Each independently editable instance still needs its own JSX node. Reuse a
component for repeated units rather than copying its implementation or generating
all instances from one `.map()` call. Keep editor-owned data at its editable
source: caption arrays belong inline on the caption component, not behind a
prop of a generic shot component.

## Make the component independent of its parent

The parent is not mounted when the standalone composition opens. Load fonts
inside the component or a shared imported module, and keep required typography
there. Supply representative content, background, and alignment in the
registration's defaults. Those defaults do not automatically apply to parent
instances or copy their props.

Match the parent's fps and dimensions unless a difference is intentional.
Preserve the source-time offset as well as the duration when the component's
captions or overlays read original-media frames. The instance's placement in
the parent timeline does not usually belong in its standalone defaults.

## Extract an existing group

For a pre-compose request, move the selected markup into a named component and
register it. If the selection already has a meaningful timing wrapper, keep
that wrapper and its props in place and extract its contents. Preserve trim,
speed, stacking order, inherited styles, and the duration needed by sound tails.
A new component file without its registration does not complete the connection.

## Verify both views

Open the full composition and the standalone composition. Check that the group
looks and sounds the same, that its timeline has useful editing units, and that
double-clicking the parent instance opens the intended composition. For a
refactor, compare representative frames and check cut boundaries, captions,
entrance animations, and audio tails.

Connected compositions provide editing boundaries, not a promise to collapse
all their rows. Studio's compact-series view can expose connected children.
Inspect the full-video timeline as well as the standalone view before claiming
that an extraction reduced clutter. Treat row expansion or unused vertical
space as a layout issue when the markup already expresses the correct groups;
avoid extra wrappers or hidden editable layers solely to force a compact view.

````

### 1.37 remotion-markup/arabic-text.md

Source: `skills/remotion-markup/arabic-text.md`

````markdown
---
name: arabic-text
description: Arabic, Persian, Urdu and Hebrew text - base direction, word and letter animation that keeps Arabic letters joined, fonts.
metadata:
  tags: arabic, rtl, persian, urdu, hebrew, typography, text-animation, captions
---

# Arabic and right-to-left text

## Set the base direction

Put `dir="rtl"` and `lang` on the element that holds right-to-left text.

Words or letters wrapped in `display: inline-block` (needed for `translate`, `scale`, `rotate`) are neutral to the bidi algorithm. Without a base direction the line defaults to LTR, so the words are placed left to right and the sentence reads backwards, even though every word looks correct. This is the usual failure of word-by-word captions and karaoke highlights.

When the language comes from props, decide the direction from the words. Count words rather than reading the first letter, because Arabic captions often start with a Latin brand name:

```tsx
const RTL = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;
const isRtl = (words: string[]) =>
  words.filter((w) => RTL.test(w)).length > words.length / 2;

<div dir={isRtl(words) ? 'rtl' : 'ltr'}>{/* word spans */}</div>
```

## Animate words, not letters

Arabic letters change shape depending on their neighbours. `text.split('')`, `[...text]` or `Array.from(text)` put each letter in its own box, and a letter in an `inline-block` is shaped alone, so the word falls apart into isolated letters.

Prefer word-level or line-level animation for Arabic. Split on spaces, give the container `dir="rtl"`, animate each word.

## Per-letter animation, if it is needed

Split into units that the browser can still join:

- keep harakat (vowel marks) in the same unit as their letter
- keep lam + alef (`لا`, `لأ`, `لإ`, `لآ`) as one unit, it is a ligature
- keep runs of digits and Latin as one unit, or an RTL line reverses them
- add a zero-width joiner (`\u200D`) on each side of a unit that connects to its neighbour, so each unit is drawn in its connected form

```tsx
const ZWJ = '\u200D';
const RIGHT_JOINING = /[\u0622-\u0625\u0627\u0629\u062F-\u0632\u0648\u0671-\u0673\u0675-\u0677\u0688-\u0699\u06C0\u06C3-\u06CB\u06CD\u06CF\u06D2\u06D3\u06D5]/;
const LETTER = /[\u0620-\u064A\u066E-\u06D3\u06D5\u06FA-\u06FC\u06FF]/;
const LTR_RUN = /^[0-9\u0660-\u0669\u06F0-\u06F9A-Za-z\u066B\u066C.,:%]+$/;
const MARK = /[\u064B-\u065F\u0670\u06D6-\u06ED]/;
const MARKS = /[\u064B-\u065F\u0670\u06D6-\u06ED\u200D]/g;
const first = (u: string) => u.replace(MARKS, '')[0] ?? '';
const last = (u: string) => u.replace(MARKS, '').slice(-1);
const joinsPrev = (u: string) => LETTER.test(first(u)) && first(u) !== '\u0621';
const joinsNext = (u: string) =>
  LETTER.test(last(u)) && last(u) !== '\u0621' && !RIGHT_JOINING.test(last(u));

export const splitArabicLetters = (text: string): string[] => {
  const g: string[] = [];
  for (const ch of text) {
    if (MARK.test(ch) && g.length > 0) g[g.length - 1] += ch;
    else g.push(ch);
  }
  const units: string[] = [];
  for (let i = 0; i < g.length; i++) {
    if (LTR_RUN.test(g[i])) {
      let run = g[i];
      while (g[i + 1] && LTR_RUN.test(g[i + 1])) run += g[++i];
      units.push(run);
    } else if (first(g[i]) === '\u0644' && /[\u0622\u0623\u0625\u0627]/.test(first(g[i + 1] ?? ''))) {
      units.push(g[i] + g[++i]);
    } else {
      units.push(g[i]);
    }
  }
  return units.map((u, i) => {
    const before = i > 0 && joinsNext(units[i - 1]) && joinsPrev(u) ? ZWJ : '';
    const after = i < units.length - 1 && joinsNext(u) && joinsPrev(units[i + 1]) ? ZWJ : '';
    return before + u + after;
  });
};
```

Render the units in a container with `dir="rtl"`, one `inline-block` span per unit, and animate the spans as usual. In Remotion's Chrome renders the letters join exactly as in the unsplit word.

## Fonts

Load an Arabic font explicitly, for example `@remotion/google-fonts/NotoSansArabic`, `IBMPlexSansArabic`, `Cairo` or `Tajawal`. See [google-fonts.md](google-fonts.md). A Latin-only font falls back to whatever Arabic font the render machine has.

Avoid `letterSpacing` and `textTransform` on Arabic text.

The ZWJ technique needs care outside Chrome: Safari draws a ZWJ-padded letter in a fallback font when the font has no U+200D glyph, so the same composition shown in the `<Player>` on an iPhone can mix two typefaces inside a word. Alexandria (as served by Google Fonts), IBM Plex Sans Arabic, Cairo and Tajawal have no U+200D glyph; Noto Sans Arabic and Noto Naskh Arabic do. Video renders are not affected.

````

### 1.38 remotion-create/SKILL.md

Source: `skills/remotion-create/SKILL.md`

````markdown
---
name: remotion-create
description: Create a new Remotion video
version: 4.0.540
---

These are instructions for making a new Remotion project and composition.  
If this is not the next task, see Remotion Best Practices

## Scaffold a project

If a project already exists, skip this.
Ensure Node.js and Git is installed, and the current folder is appropriate for starting a new project.

Inspect the current folder, including hidden files, before choosing where to scaffold.

### Empty folder

If it is empty, or contains only disposable operating-system metadata such as `.DS_Store`, create the project directly in the current folder.
Remove only those disposable metadata files first, since `create-video` rejects non-empty folders.
Do not treat all hidden files as disposable: files such as `.env` and directories such as `.git` are meaningful contents.

Scaffold in existing folder:

```bash
npx create-video@latest --yes --blank --no-tailwind .
npm i
```

### Non-empty folder

If the current folder contains meaningful contents and no project already exists, scaffold into a new subfolder.
Replace `my-video` with a suitable project name.

```bash
npx create-video@latest --yes --blank --no-tailwind my-video
cd my-video
npm i
```

## Open the preview before building the video

As soon as the project can run, open Remotion Studio in the browser before writing or changing the composition. For a new project, do this immediately after scaffolding and installing dependencies. For an existing project, do it before editing the video. Keep Studio running while you work so the user can see changes as they appear and steer the result.

## Designing a video

Keep the scaffold and add React Markup.
Follow Remotion React Markup Best Practices and [Video Layout Rules](video-layout.md) for video-first layout and text sizing guidance.

Before writing the root that registers `<Composition>` or `<Still>` elements,
follow Compositions and stills.

## Is this a timeline of clips?

If the video arranges multiple video or audio clips on a timeline, follow
Video editing before writing the
timeline. Give every clip that should be edited independently its own authored
JSX node.

## Is this a multi-scene video?

If this is a video with multiple subsequent scenes, follow guidance at Multi-scene videos.

## Interactivity Best Practices

By structuring the React Markup following Remotion Interactivity Best Practices, you allow the user to make edits in the Studio which write back to code.

## TailwindCSS

If Tailwind is requested, see [tailwind.md](tailwind.md) for using TailwindCSS in Remotion.

## Follow-up

The video creation process has finished.
For follow-up prompts, use Remotion Best Practices

````

### 1.39 remotion-create/video-layout.md (safe area + minimum font sizes)

Source: `skills/remotion-create/video-layout.md`

````markdown
You are designing a video, not a webpage.

- Decide what the viewer should notice first in each scene. Build the frame around that one thing.
- Keep important content inside a generous safe area. For 1080px-wide videos, keep key text at least 80px from the sides and 100px from the top and bottom.
- Do not add redundant elements.
- For 1080px-wide compositions, use these rough minimums:
  - Main headline: 84px
  - Important supporting text: 44px
- Scale those values with the composition width.

````

### 1.40 remotion-create/tailwind.md

Source: `skills/remotion-create/tailwind.md`

````markdown
---
name: tailwind
description: Using TailwindCSS in Remotion.
metadata:
---

You can and should use TailwindCSS in Remotion, if TailwindCSS is installed in the project.

Don't use `transition-*` or `animate-*` classes - always animate using the `useCurrentFrame()` hook.

Tailwind must be installed and enabled first in a Remotion project - see https://www.remotion.dev/docs/tailwind.

````

### 1.41 remotion-captions/SKILL.md

Source: `skills/remotion-captions/SKILL.md`

````markdown
---
name: remotion-captions
description: Transcribing, displaying and animating captions
version: 4.0.540
---

All captions must be processed in JSON. The captions must use the [`Caption`](https://www.remotion.dev/docs/captions/caption.md) type which is the following:

```ts
import type { Caption } from "@remotion/captions";
```

This is the definition:

```ts
type Caption = {
  text: string;
  startMs: number;
  endMs: number;
  timestampMs: number | null;
  confidence: number | null;
  pageBreakAfter?: boolean;
};
```

## Generating captions

To transcribe video and audio files to generate captions, load the [transcribe-captions.md](transcribe-captions.md) file for more instructions.

## Displaying captions

To display captions in your video, load the [display-captions.md](display-captions.md) file for more instructions.

## Importing captions

To import captions from a .srt file, load the [import-srt-captions.md](import-srt-captions.md) file for more instructions.

## Post-creation

After you're done, load this skill: Remotion Best Practices

If not alreay done, open the Remotion Studio, unless instructed otherwise.

````

### 1.42 remotion-captions/display-captions.md

Source: `skills/remotion-captions/display-captions.md`

````markdown
---
name: display-captions
description: Displaying captions in Remotion using the Basic Captions element
metadata:
  tags: captions, subtitles, display, element
---

# Displaying captions in Remotion

This guide explains how to display captions in Remotion, assuming you already have captions in the [`Caption`](https://www.remotion.dev/docs/captions/caption.md) format.

## Prerequisites

Read [Transcribing audio](transcribe-captions.md) for how to generate captions.

First, the [`@remotion/captions`](https://www.remotion.dev/docs/captions.md) package needs to be installed.
If it is not installed, use the following command:

```bash
npx remotion add @remotion/captions # If project uses npm
bunx remotion add @remotion/captions # If project uses bun
yarn remotion add @remotion/captions # If project uses yarn
pnpm exec remotion add @remotion/captions # If project uses pnpm
```

## Adding the Basic Captions element

Use the [Basic Captions](https://www.remotion.dev/elements/captions/basic-captions) element to display captions.

Alternatives are available at [Remotion Captions Elements](https://www.remotion.dev/elements/captions), but use Basic Captions unless there are more precise specifications.

Fetch its source code from https://www.remotion.dev/elements/captions/basic-captions.md and copy the `basic-captions.tsx` file into the project unchanged.

## Displaying captions alongside video content

Keep each clip's video and captions inside the same `<Sequence>` or `<TransitionSeries.Sequence>`.
Put the clip's `trimBefore`, `durationInFrames`, and `playbackRate` on that shared parent so trimming or changing the speed affects both.  
For independently positioned clips, put `from` on the shared `<Sequence>` too.

Give every captioned clip its own group and inline caption array; do not combine captions from multiple clips into one overlay outside the scene timeline.  
Moving, reordering, trimming, or deleting the group then affects its video and captions together.

Putting captions inside a scene is insufficient if `trimBefore` or `playbackRate` is still applied only to `<Video>`: its sibling captions do not inherit those props. Apply them to the shared parent instead.

The Caption editor writes back to the array literal on the selected `<BasicCaptions>` source node, so inline the captions directly in its `captions` prop.  
Passing a variable or component prop such as `captions={captions}` leaves no source array for the editor to update.  
If the captions were transcribed to a JSON file, copy its contents into the prop.

Give the caption area a width and position it over the video. In this
1920px-wide composition, the 900px caption area is centered by translating it
`(1920 - 900) / 2 = 510` pixels from the left:

```tsx title="src/MyComposition.tsx"
import { Video } from "@remotion/media";
import { TransitionSeries } from "@remotion/transitions";
import { staticFile, useVideoConfig } from "remotion";
import { BasicCaptions } from "./basic-captions";

export const MyComposition: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <TransitionSeries>
      <TransitionSeries.Sequence
        name="Opening"
        trimBefore={4 * fps}
        durationInFrames={20 * fps}
      >
        <Video
          name="Opening footage"
          src={staticFile("opening.mp4")}
          objectFit="cover"
          style={{ width: "100%", height: "100%" }}
        />
        <BasicCaptions
          name="Opening captions"
          width={900}
          style={{
            position: "absolute",
            bottom: 120,
            translate: "510px 0px",
          }}
          captions={[
            {
              text: "Hello",
              startMs: 5000,
              endMs: 5400,
              timestampMs: 5200,
              confidence: null,
            },
            {
              text: " world",
              startMs: 5400,
              endMs: 5900,
              timestampMs: 5650,
              confidence: null,
            },
          ]}
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence
        name="Next clip"
        trimBefore={1 * fps}
        durationInFrames={5 * fps}
      >
        <Video
          name="Next footage"
          src={staticFile("next.mp4")}
          objectFit="cover"
          style={{ width: "100%", height: "100%" }}
        />
        <BasicCaptions
          name="Next captions"
          width={900}
          style={{
            position: "absolute",
            bottom: 120,
            translate: "510px 0px",
          }}
          captions={[
            {
              text: "Next",
              startMs: 2000,
              endMs: 2400,
              timestampMs: 2200,
              confidence: null,
            },
            {
              text: " clip",
              startMs: 2400,
              endMs: 2900,
              timestampMs: 2650,
              confidence: null,
            },
          ]}
        />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
```

```tsx title="src/Root.tsx"
import { Composition } from "remotion";
import { MyComposition } from "./MyComposition";

export const RemotionRoot = () => {
  return (
    <Composition
      id="MyComposition"
      component={MyComposition}
      durationInFrames={750}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
```

To change a captioned clip's speed, set `playbackRate` on its shared sequence.
`durationInFrames` selects a range of source frames; the group occupies `durationInFrames / playbackRate` frames in its parent timeline.
Update the composition duration when changing the total timeline length.

If a caption has `pageBreakAfter: true`, the current page ends after that caption and the next caption starts a new page.

## White-space preservation

The captions are whitespace sensitive. You should include spaces in the `text` field before each word.

````

### 1.43 remotion-captions/transcribe-captions.md (@remotion/whisper-webgpu)

Source: `skills/remotion-captions/transcribe-captions.md`

````markdown
# Transcribing audio

To transcribe audio to generate captions in Remotion, use the [`transcribe()`](https://www.remotion.dev/docs/whisper-webgpu/transcribe.md) function from the [`@remotion/whisper-webgpu`](https://www.remotion.dev/docs/whisper-webgpu.md) package.
It runs Whisper locally on the GPU and works in both Node.js and the browser.

## Prerequisites

Install the required packages if they are not installed:

```bash
npx remotion add @remotion/whisper-webgpu @huggingface/transformers mediabunny @mediabunny/server # If project uses npm
bunx remotion add @remotion/whisper-webgpu @huggingface/transformers mediabunny @mediabunny/server # If project uses bun
yarn remotion add @remotion/whisper-webgpu @huggingface/transformers mediabunny @mediabunny/server # If project uses yarn
pnpm exec remotion add @remotion/whisper-webgpu @huggingface/transformers mediabunny @mediabunny/server # If project uses pnpm
```

A compatible GPU is required. ONNX Runtime does not work on Linux arm64.

## Transcribing

Make a Node.js script that decodes the audio to a 16kHz mono waveform, downloads a model, and transcribes it.

```ts
import { registerMediabunnyServer } from "@mediabunny/server";
import {
  WHISPER_WEBGPU_SAMPLE_RATE,
  canUseWhisperWebGpu,
  downloadWhisperModel,
  loadWhisperModel,
  toCaptions,
  transcribe,
} from "@remotion/whisper-webgpu";
import {
  ALL_FORMATS,
  Conversion,
  FilePathSource,
  Input,
  NullTarget,
  Output,
  WavOutputFormat,
} from "mediabunny";
import { writeFile } from "node:fs/promises";

registerMediabunnyServer();

const support = await canUseWhisperWebGpu();
if (!support.supported) {
  throw new Error(support.detailedReason);
}

type WaveformChunk = {
  startFrame: number;
  waveform: Float32Array;
};
const chunks: WaveformChunk[] = [];

using input = new Input({
  formats: ALL_FORMATS,
  source: new FilePathSource("public/video123.mp4"),
});
const audioTrack = await input.getPrimaryAudioTrack();
if (audioTrack === null) {
  throw new Error("The media does not contain an audio track.");
}

const conversion = await Conversion.init({
  input,
  output: new Output({
    format: new WavOutputFormat(),
    target: new NullTarget(),
  }),
  video: { discard: true },
  audio: (track) => {
    if (track.id !== audioTrack.id) {
      return { discard: true };
    }

    return {
      codec: "pcm-f32",
      forceTranscode: true,
      numberOfChannels: 1,
      sampleFormat: "f32",
      sampleRate: WHISPER_WEBGPU_SAMPLE_RATE,
      process: (sample) => {
        const waveform = new Float32Array(
          sample.allocationSize({ format: "f32", planeIndex: 0 }) /
            Float32Array.BYTES_PER_ELEMENT,
        );
        sample.copyTo(waveform, { format: "f32", planeIndex: 0 });
        chunks.push({
          startFrame: Math.round(sample.timestamp * WHISPER_WEBGPU_SAMPLE_RATE),
          waveform,
        });
        return sample;
      },
    };
  },
});

if (!conversion.isValid) {
  throw new Error("The audio track cannot be decoded.");
}

await conversion.execute();

const waveformLength = chunks.reduce(
  (max, chunk) => Math.max(max, chunk.startFrame + chunk.waveform.length),
  0,
);
const channelWaveform = new Float32Array(waveformLength);
for (const chunk of chunks) {
  const destinationStart = Math.max(0, chunk.startFrame);
  const sourceStart = Math.max(0, -chunk.startFrame);
  const availableLength = Math.min(
    chunk.waveform.length - sourceStart,
    channelWaveform.length - destinationStart,
  );

  if (availableLength > 0) {
    channelWaveform.set(
      chunk.waveform.subarray(sourceStart, sourceStart + availableLength),
      destinationStart,
    );
  }
}

const model = "small.en";
await downloadWhisperModel({ model });
await using modelHandle = await loadWhisperModel({ model });
const transcription = await transcribe({ channelWaveform, model });
const { captions } = toCaptions({ whisperWebGpuOutput: transcription });

// Write it to a file so the captions can be inlined into the Remotion code
await writeFile("captions123.json", JSON.stringify(captions, null, 2));
```

## Choosing a model

`small.en` is the recommended default for English.  
For other languages, use a multilingual model such as `small` and pass the `language` option to `transcribe()` - automatic language detection is not supported.  
See [`getAvailableModels()`](https://www.remotion.dev/docs/whisper-webgpu/get-available-models.md) for all models.

## Transcribing in the browser

In the browser, use [`resampleTo16Khz()`](https://www.remotion.dev/docs/whisper-webgpu/resample-to-16khz.md) to get the waveform from a `File` instead of using Mediabunny:

```ts
import {
  downloadWhisperModel,
  resampleTo16Khz,
  toCaptions,
  transcribe,
} from "@remotion/whisper-webgpu";

export const transcribeFile = async (file: File) => {
  await downloadWhisperModel({ model: "small.en" });
  const channelWaveform = await resampleTo16Khz({ file });
  const transcription = await transcribe({
    channelWaveform,
    model: "small.en",
  });

  const { captions } = toCaptions({ whisperWebGpuOutput: transcription });
  return captions;
};
```

Transcribe each original source video or audio file individually.  
Keep the resulting caption timestamps relative to the beginning of that source file, including portions currently trimmed out of the edit.  
Do not add composition offsets or flatten multiple transcripts into composition-wide timestamps.

See [Displaying captions](display-captions.md) for how to display the captions in Remotion.

````

### 1.44 remotion-captions/import-srt-captions.md

Source: `skills/remotion-captions/import-srt-captions.md`

````markdown
---
name: import-srt-captions
description: Importing .srt subtitle files into Remotion using @remotion/captions
metadata:
  tags: captions, subtitles, srt, import, parse
---

# Importing .srt subtitles into Remotion

If you have an existing `.srt` subtitle file, you can import it into Remotion using `parseSrt()` from `@remotion/captions`.

If you don't have a .srt file, read [Transcribing audio](transcribe-captions.md) for how to generate captions instead.

## Prerequisites

First, the @remotion/captions package needs to be installed.
If it is not installed, use the following command:

```bash
npx remotion add @remotion/captions # If project uses npm
bunx remotion add @remotion/captions # If project uses bun
yarn remotion add @remotion/captions # If project uses yarn
pnpm exec remotion add @remotion/captions # If project uses pnpm
```

## Reading an .srt file

Use `staticFile()` to reference an `.srt` file in your `public` folder, then fetch and parse it:

```tsx
import { useState, useEffect, useCallback } from "react";
import { staticFile, useDelayRender } from "remotion";
import { parseSrt } from "@remotion/captions";
import type { Caption } from "@remotion/captions";

export const MyComponent: React.FC = () => {
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() => delayRender());

  const fetchCaptions = useCallback(async () => {
    try {
      const response = await fetch(staticFile("subtitles.srt"));
      const text = await response.text();
      const { captions: parsed } = parseSrt({ input: text });
      setCaptions(parsed);
      continueRender(handle);
    } catch (e) {
      cancelRender(e);
    }
  }, [continueRender, cancelRender, handle]);

  useEffect(() => {
    fetchCaptions();
  }, [fetchCaptions]);

  if (!captions) {
    return null;
  }

  return (
    <>
      {/* Use captions here */}
    </>
  );
};
```

Remote URLs are also supported - you can `fetch()` a remote file via URL instead of using `staticFile()`.

## Using imported captions

Once parsed, the captions are in the `Caption` format and can be used with all `@remotion/captions` utilities.

````

### 1.45 remotion-render/SKILL.md (render, still, --frames)

Source: `skills/remotion-render/SKILL.md`

````markdown
---
name: remotion-render
description: Export a Remotion video
version: 4.0.540
---

## General rendering strategy

Use Remotion's bundled browser for rendering, including compositions using
`<HtmlInCanvas>`. It includes the required browser APIs and Remotion's browser
fixes. Let Remotion download or update it as needed. Do not reuse a recording
browser or set `--browser-executable`, `browserExecutable`, or `chromeMode`
unless the user explicitly requests a different browser.

Render a video using:

```
npx remotion render
```

Full list of options: https://www.remotion.dev/docs/cli/render.md

Render a still using:

```
npx remotion still
```

Full list of options: https://www.remotion.dev/docs/cli/still.md

To render several frames as images in one call, use `render --frames`:

```
npx remotion render [composition-id] out/frames --frames=0,30,90 --image-format=png
```

See https://www.remotion.dev/docs/cli/render.md#--frames for more options.

## Transparent videos

See [Transparent videos](./transparent-videos.md) for rendering out a video with transparency.

````

### 1.46 remotion-render/transparent-videos.md

Source: `skills/remotion-render/transparent-videos.md`

````markdown
---
name: transparent-videos
description: Rendering transparent videos in Remotion
metadata:
  tags: transparent, alpha, codec, vp9, prores, webm
---

# Rendering Transparent Videos

Remotion can render transparent videos in two ways: as a ProRes video or as a WebM video.

## Transparent ProRes

Ideal for when importing into video editing software.

**CLI:**

```bash
npx remotion render --image-format=png --pixel-format=yuva444p10le --codec=prores --prores-profile=4444 MyComp out.mov
```

**Default in Studio** (restart Studio after changing):

```ts
// remotion.config.ts
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("png");
Config.setPixelFormat("yuva444p10le");
Config.setCodec("prores");
Config.setProResProfile("4444");
```

**Setting it as the default export settings for a composition** (using `calculateMetadata`):

```tsx
import { CalculateMetadataFunction } from "remotion";

const calculateMetadata: CalculateMetadataFunction<Props> = async ({
  props,
}) => {
  return {
    defaultCodec: "prores",
    defaultVideoImageFormat: "png",
    defaultPixelFormat: "yuva444p10le",
    defaultProResProfile: "4444",
  };
};

<Composition
  id="my-video"
  component={MyVideo}
  durationInFrames={150}
  fps={30}
  width={1920}
  height={1080}
  calculateMetadata={calculateMetadata}
/>;
```

## Transparent WebM (VP9)

Ideal for when playing in a browser.

**CLI:**

```bash
npx remotion render --image-format=png --pixel-format=yuva420p --codec=vp9 MyComp out.webm
```

**Default in Studio** (restart Studio after changing):

```ts
// remotion.config.ts
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("png");
Config.setPixelFormat("yuva420p");
Config.setCodec("vp9");
```

**Setting it as the default export settings for a composition** (using `calculateMetadata`):

```tsx
import { CalculateMetadataFunction } from "remotion";

const calculateMetadata: CalculateMetadataFunction<Props> = async ({
  props,
}) => {
  return {
    defaultCodec: "vp8",
    defaultVideoImageFormat: "png",
    defaultPixelFormat: "yuva420p",
  };
};

<Composition
  id="my-video"
  component={MyVideo}
  durationInFrames={150}
  fps={30}
  width={1920}
  height={1080}
  calculateMetadata={calculateMetadata}
/>;
```

````

### 1.47 remotion-studio/SKILL.md

Source: `skills/remotion-studio/SKILL.md`

````markdown
---
name: remotion-studio
description: Preview a Remotion video
version: 4.0.540
---

When creating or editing a video, start Studio and open its preview as soon as the project can run, before building the composition. Keep it open while you work so the user can see changes and steer.

In Cursor, run Studio without `--no-open` so the browser opens automatically:

```bash
npx remotion studio
```

In other agent clients, you can also let Studio open the browser automatically with the command above. If you have an in-app browser and intend to use it, run:

```bash
npx remotion studio --no-open
```

If the Studio is already opened, the URL will be printed and the command will exit.
Otherwise, a long-running process will start, and the URL will be printed.

When using `--no-open`, open the exact printed URL in the in-app browser and verify that Studio loads. Once a composition exists, verify that its video preview loads. Do not use `--no-open` if you cannot open the URL in the in-app browser.

## Useful flags

| Argument          | Purpose                                                                                       |
| ----------------- | --------------------------------------------------------------------------------------------- |
| `--log=<level>`   | Set `error`, `warn`, `info` (default), or `verbose` logging.                                  |
| `--port=<number>` | Request a Studio server port; otherwise Remotion finds a free port.                           |
| `--force-new`     | Start another Studio instance even when one is already running for the same project and port. |

````

### 1.48 remotion-docs/SKILL.md (Algolia search + .md URLs)

Source: `skills/remotion-docs/SKILL.md`

````markdown
---
name: remotion-docs
description: Search Remotion documentation
version: 4.0.540
---

This skill teaches you how to discover and read current Remotion documentation.
If this is not relevant, load Remotion Best Practices instead.

## Searching the docs

Use the Algolia search API to find relevant documentation pages:

```
POST https://plsduol1ca-dsn.algolia.net/1/indexes/*/queries?x-algolia-api-key=3e42dbd4f895fe93ff5cf40d860c4a85&x-algolia-application-id=PLSDUOL1CA
Content-Type: application/x-www-form-urlencoded

{
  "requests": [
    {
      "query": "<your search query>",
      "indexName": "remotion",
      "params": "attributesToRetrieve=[\"hierarchy.lvl0\",\"hierarchy.lvl1\",\"hierarchy.lvl2\",\"url\"]&hitsPerPage=10"
    }
  ]
}
```

Each hit contains a `url` field pointing to the documentation page.

## Fetching a page as Markdown

Append `.md` to any Remotion docs URL to retrieve its Markdown source (saves tokens):

```
https://www.remotion.dev/docs/use-video-config.md
https://www.remotion.dev/docs/sequence.md
https://www.remotion.dev/docs/lambda/rendermediaonlambda.md
```

## Workflow

1. Search Algolia for the concept or API you need.
2. Pick the most relevant URL(s) from the results.
3. Fetch each URL with the `.md` suffix.
4. Implement using the current documentation rather than memorized API knowledge.

````

### 1.49 remotion-interactivity/SKILL.md (inline interpolate rules, Interactive.*, @remotion/paths interpolatePaths)

Source: `skills/remotion-interactivity/SKILL.md`

````markdown
---
name: remotion-interactivity
description: Structure Remotion markup for interactivity
version: 4.0.540
---

Studio edits the JSX nodes that create timeline items. Structure the code around
what the user should be able to select, move, trim, or style independently.
Keep editable values inline on each instance.

Before writing a scene or refactoring its layers, read
[editable timeline structure](timeline-structure.md). It covers editing units,
tracks, shared timing, plain layout containers, and a complete component-to-root
example. For a timeline built from footage, also read
editable video timelines.

Use connected compositions when
a scene or reusable group needs its own timeline. Validate both its standalone
view and the full parent timeline; a connection alone does not guarantee fewer
visible rows.

## Choose schema fields

Each key in the schema is a prop that Studio can read and edit at the call site.
Props that are not in the schema still work, but are not editable in Studio.
Keys may use dot notation, such as `style.color`.

| Type                                                                         | Use for                                                      | Keyframable   |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------- |
| `string`                                                                     | Strings, such as a title, prompt, or code snippet            | No            |
| `number`                                                                     | Numbers, with optional `min`, `max`, `step`, `integer`       | Yes           |
| `boolean`                                                                    | On/off switches                                              | Yes (hold)    |
| `color`                                                                      | CSS color strings                                            | Yes           |
| `enum`                                                                       | A choice between `variants`, each with its own nested schema | Opt-in (hold) |
| `array`                                                                      | Lists of numbers, colors, enums and more                     | No            |
| `asset`                                                                      | Media sources, with optional `assetType`                     | No            |
| `font-family`                                                                | CSS font family                                              | No            |
| `font-weight`                                                                | Font weight                                                  | Yes           |
| `translate`, `scale`, `rotation-css`, `rotation-degrees`, `transform-origin` | Transforms                                                   | Yes           |
| `uv-coordinate`                                                              | A normalized `[x, y]` point on the element                   | Yes           |
| `svg-path`                                                                   | SVG path data                                                | Yes           |
| `remotion-captions`                                                          | `Caption[]` data                                             | No            |
| `hidden`                                                                     | A value kept out of the controls                             | —             |

Every field needs a `default` and should have a `description`, which Studio shows as the label.
Set `keyframable: false` to show a static control.

Expose content and per-instance appearance, such as the text and an accent color.
Do not add fields for `style.translate`, `style.scale`, `style.rotate`, `style.transformOrigin` and `style.opacity`: `Interactive.create()` adds them automatically.

To make CSS properties of the root editable per instance, spread the built-in schema fragments:

```tsx
const cardSchema = {
  ...Interactive.textSchema, // style.color, style.fontSize, style.fontWeight, ...
  ...Interactive.backgroundSchema, // style.backgroundColor
  ...Interactive.borderRadiusSchema, // style.borderRadius, ...
} as const satisfies InteractivitySchema;
```

Also available: `Interactive.borderSchema`, and `Interactive.captionsSchema` for components that accept captions.
For components that accept `React.ReactNode` children, add `...Interactive.childrenSchema`.
It provides controls for children content and may evolve to support richer content.
Currently, it uses a string field labeled "Text" with a default of `''`.
If a component requires string-only children, declare an explicit `children` field with `type: 'string'` instead.
`Interactive.textSchema` controls typography styles; `childrenSchema` controls content.
The children fragment is not included in `baseSchema` or automatically added to custom components.
Nested markup and computed children are currently read-only.
`text-content` is a deprecated alias for the `string` field type.
See [`InteractivitySchema`](https://www.remotion.dev/docs/interactivity-schema) for all options.

## Make an HTML element interactive using `Interactive`

Every HTML and SVG element (except `<Img>`, it already is interactive) such as `<div>` can be turned interactive using `Interactive`:

```tsx title="Interactive elements"
<Interactive.Div
  name="Greeting card"
  style={{fontSize: 80, padding: 24}}
>
  Hello
</Interactive.Div>
```

Use this for text or graphics that need independent controls. Keep layout-only
containers and decorative internals as plain HTML; an interactive component
already provides controls for its root.

## Prefer inline text

If text is fixed and only used once, write it directly inside the interactive element instead of extracting it into a constant.

```tsx title="Inline text"
// 👍 Fixed copy stays editable
<Interactive.Div name="Title">
  Remotion Best Practices
</Interactive.Div>
```

Use a prop or variable only when the text is dynamic or reused.

## Give interactive elements a descriptive name

Add a `name` prop to elements to make them easily identifyable.
Avoid computed names, hardcode them.

```tsx title="Interactive names"
<>
  <Interactive.Div name="Hero title" style={{fontSize: 80}}>
    Launch day
  </Interactive.Div>
  <Img name="Avatar" src="https://remotion.media/image.jpeg" />
  <Video name="Background" src="https://remotion.media/video.mp4" />
  <Interactive.Div name="Title">
    Launch day
  </Interactive.Div>
</>
```

## Keep all CSS styles inline

The best way is to just pass a plain object to `style` - no referring to constants, no object spreading, no math.

```tsx title="Interactive example"
<Interactive.Div
  style={{
    fontSize: 80,
    color: 'red',
  }}
>
  Hello World!
</Interactive.Div>
```

```tsx title="❌ Bad for interactivity"
const baseStyle = useMemo(() => {
  return {
    fontSize: 12 // ❌ Non-inline styles are not supported
  }
}, []);

<Interactive.Div
  style={{
    ...baseStyle, // ❌ Spreading is not supported
    color: RED, // ❌ Referring to constants is not supported
    scale: frame * 10 // ❌ Math is not supported
  }}
>
  Hello World!
</Interactive.Div>
```

## Animate using `interpolate()`

Write animations as inline `interpolate()` calls on the property that changes.  
The output range, easing, extrapolation and `output` property should use hardcoded values.

The input range may additionally use `durationInFrames`, `fps`, `width` and `height` destructured directly from `useVideoConfig()`. Bare identifiers such as `durationInFrames`, multiplication with a number such as `2 * fps` or `fps * 2`, and subtraction of a number such as `durationInFrames - 1` are supported.

```tsx title="Inline values"
const {fps, durationInFrames} = useVideoConfig();

// 👍 Inline values can be standardized and keyframed
<Interactive.Div
  name="Product card"
  style={{
    color: 'white',
    fontSize: 80,
    scale: interpolate(frame, [0, fps], [0, 1], {
      easing: Easing.spring({damping: 200}),
      output: 'perceptual-scale',
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    }),
    rotate: interpolate(frame, [0, 1 * fps], ['0deg', '20deg'], {
      easing: Easing.spring({damping: 200}),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    }),
    translate: interpolate(
      frame,
      [durationInFrames - 30, durationInFrames],
      ['0px 0px', '0px 120px'],
      {
        easing: Easing.spring({damping: 200}),
        output: 'perceptual-scale',
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
      }
    ),
  }}
/>
```

```tsx title="❌ Bad interactivity"
const translateY = interpolate(frame, [0, 30], [0, 120]); // ❌ Math should be directly in the markup

<Interactive.Div
  name="Product card"
  style={{
    translate: translateY, // ❌ Only inline interpolate() calls are supported,
    rotate: interpolate(frame, [start, start + 10], [0, Math.PI]), // ❌ Cannot use math with arbitrary variables, cannot use constants
    scale: interpolate(anyVariable, [0, 30], [0, 1]) // ❌ Can only interpret the `frame` variable.
  }}
/>
```

## Keep SVG paths editable with `Interactive.Path`

Use `<Interactive.Path>` from `remotion` instead of `<path>` inside an SVG to make the path visually editable.

Install `@remotion/paths` for path interpolation and Studio path keyframes:

```sh
bunx remotion add @remotion/paths
```

If the geometry is meant to be static, put the path string directly in the `d` prop. Do not extract it into a constant.

```tsx title="Editable static path"
import {Interactive} from 'remotion';

<Interactive.Svg width={300} height={300} viewBox="0 0 300 300">
  <Interactive.Path
    name="Triangle"
    d="M 40 40 L 260 40 L 150 260 Z"
    fill="#0b84f3"
  />
</Interactive.Svg>
```

### Morph paths using inline `interpolatePaths()`

Use `interpolatePaths()` from `@remotion/paths` directly in `d`.  
It accepts a frame, an input range, an equally sized array of path strings, and options for easing, extrapolation, and posterization.
Keep the output paths, ranges, and options inline, following the same input-range rules as `interpolate()` above.  
Do not use `interpolatePath()` API or extract the interpolated result into a variable when the path keyframes should remain editable in Studio.

```tsx title="Editable path keyframes"
import {interpolatePaths} from '@remotion/paths';
import {Easing, Interactive, useCurrentFrame} from 'remotion';

export const MorphingPath = () => {
  const frame = useCurrentFrame();

  return (
    <Interactive.Svg width={300} height={300} viewBox="0 0 300 300">
      <Interactive.Path
        name="Morphing triangle"
        d={interpolatePaths(
          frame,
          [0, 30, 60],
          [
            'M 40 40 L 260 40 L 150 260 Z',
            'M 40 150 L 150 40 L 260 150 Z',
            'M 40 260 L 150 40 L 260 260 Z',
          ],
          {
            easing: Easing.bezier(0.42, 0, 0.58, 1),
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          },
        )}
        fill="#0b84f3"
      />
    </Interactive.Svg>
  );
};
```

Studio can edit the path at the current frame, add or move keyframes, and adjust their easing.  
Use `strokeDasharray` and `strokeDashoffset` to evolve paths.

## Use `scale`, `translate`, `rotate` CSS properties

Avoid the `transform` CSS property.  
If possible, use `scale`, `rotate` and `translate` instead because only they are interactively editable.

## Keep composition metadata inline

When scaffolding a composition, use a JSX string literal for `id`, keep `width`, `height`, `fps`, `durationInFrames` and `defaultProps` inline and make no type assertions.

The Props editor can save visual edits back to your code when `defaultProps` is an inline object literal on `<Composition>` or `<Still>`.

```tsx
// 👍 Static values are in <Composition>, dynamic values are in calculateMetadata()
const calculateMetadata = useMemo(async () => {
  const dimensions = await getDimensions(); // just an example
  return {width: dimensions.width, height: dimensions.height};
});

<Composition
  id="my-video"
  component={MyComponent}
  durationInFrames={150}
  fps={30}
  calculateMetadata={calculateMetadata}
  defaultProps={{title: 'Hello', color: '#0b84ff'}}
/>
```

```tsx title="Negative examples"
const defaultProps = {title: 'Hello', color: '#0b84ff'}; // ❌ Don't extract defaultProps, must be inline
const calculateMetadata = useMemo(() => {
  // ❌ Unnecessary because no calculation is being done,
  return {durationInFrames: 150, fps: 30, width: 1920, height: 1080};
});

<Composition
  id="my-video"
  component={MyComponent}
  calculateMetadata={calculateMetadata}
  defaultProps={{
    title: 'Hello',
  } as Props} // ❌ Don't have type assertions, instead type MyComponent correctly
/>
```

Use only `calculateMetadata()` for the part of the metadata that is dynamic.

## Effects should be inline too

Keep effect arrays and parameters inline so their shape and keyframes remain editable. See [Inline effects](./inline-effects.md) for examples.

## Making your own component interactive

To make a custom userland component interactive, use:
[Make a component interactive](https://www.remotion.dev/docs/studio/make-component-interactive.md)

## Video editing

If a Remotion component mainly consists of video and audio clips, see Video editing for best practices on how to structure Remotion markup so the clips are interactively editable in the timeline.

````

### 1.50 remotion-interactivity/timeline-structure.md

Source: `skills/remotion-interactivity/timeline-structure.md`

````markdown
# Editable timeline structure

Choose what the user should be able to move, trim, style, duplicate, or delete
together before adding timeline items. A scene, a captioned shot, a summary
card, or a sticker with its entrance sound can each be one editable unit.
Use plain HTML for the layout and decoration inside that unit. Add an
`Interactive` element when it needs independent selection or controls.

Write each independently editable instance as its own JSX node, with a literal
name and inline timing and appearance props. Reuse the component implementation
for repeated cards or stickers, but keep their instances separate. Use loops for
output intentionally controlled as one template, such as particles or chart
bars, rather than independently editable clips.

## Choose how items share time

| Editing behavior                                                 | Structure                                                           |
| ---------------------------------------------------------------- | ------------------------------------------------------------------- |
| Items have independent start times and do not overlap            | A named `Track`, with timing on each item                           |
| Consecutive clips should stay adjacent when one changes duration | `TransitionSeries`, with timing on each `TransitionSeries.Sequence` |
| Several layers must move, trim, or change speed together         | One timed component or `Sequence` containing those layers           |

A track is useful for scenes, music segments, cutaways, stickers, or sound
effects. Group non-overlapping siblings by role instead of giving every item
its own row. Items that remain visible together need separate tracks or a
component that contains their shared layout. Staggered entrances do not make
overlapping cards suitable for one track.

Put timing directly on components that accept it. Avoid a `Sequence` around a
single timing-capable child just to name or register it. Keep wrappers that
provide shared timing, dimensions, or `TransitionSeries` behavior. Use
`layout="none"` on a `Sequence` when it should not introduce a layout element.

For captioned footage and overlays spanning cuts, read
editable video timelines.

## Give substantial groups their own timelines

Create a connected composition when a scene or reusable element benefits from
being edited on its own. Export it with `Interactive.create()` and register the
same reference with `Composition`.

- Use `layout: 'absolute-fill'` for a scene. Return a fragment and put its
  background and alignment styles on the instance; the managed root applies them.
- Use `layout: 'none'` for a bounded element. Forward `style` to its plain root.
  The component already owns a timeline item, so the root does not need another
  `Interactive.Div` for the same controls.

Connection enables drill-down and shared implementation. It does not guarantee
fewer rows in the parent: Studio can display connected children inside a series.
Choose useful editing boundaries, then inspect the actual parent timeline.
Do not add wrapper components or hide editable content just to alter row counts.

## Complete example

The title is one editable element. Its scene has a connected timeline, while
independently timed scenes and music segments each share a named track.

```tsx title="Title.tsx"
import type React from 'react';
import {Interactive} from 'remotion';

const TitleInner = ({
  children,
  style,
}: {
  readonly children: React.ReactNode;
  readonly style: React.CSSProperties;
}) => <h1 style={{margin: 0, ...style}}>{children}</h1>;

export const Title = Interactive.create({
  Component: TitleInner,
  layout: 'none',
  schema: {
    ...Interactive.textSchema,
    ...Interactive.childrenSchema,
  },
});
```

```tsx title="Chapter.tsx"
import {Interactive} from 'remotion';
import {Title} from './Title';

const ChapterInner = ({title}: {readonly title: string}) => (
  <>
    <Title
      name="Chapter title"
      style={{fontFamily: 'Arial, sans-serif', fontSize: 96, color: 'white'}}
    >
      {title}
    </Title>
  </>
);

export const Chapter = Interactive.create({
  Component: ChapterInner,
  layout: 'absolute-fill',
  schema: {
    ...Interactive.backgroundSchema,
    title: {type: 'string', default: '', description: 'Title'},
  },
});
```

```tsx title="MyVideo.tsx"
import {Audio} from '@remotion/media';
import {staticFile, Track, useVideoConfig} from 'remotion';
import {Chapter} from './Chapter';

export const MyVideo = () => {
  const {fps} = useVideoConfig();
  return (
    <>
      <Track name="Chapters">
        <Chapter
          name="Opening"
          durationInFrames={3 * fps}
          title="Introduction"
          style={{
            backgroundColor: '#111111',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        />
        <Chapter
          name="Feature"
          from={3 * fps}
          durationInFrames={4 * fps}
          title="New features"
          style={{
            backgroundColor: '#243b53',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        />
      </Track>
      <Track name="Music">
        <Audio
          name="Opening music"
          src={staticFile('music.mp3')}
          durationInFrames={2 * fps}
        />
        <Audio
          name="Closing music"
          src={staticFile('music.mp3')}
          from={4 * fps}
          trimBefore={10 * fps}
          durationInFrames={3 * fps}
        />
      </Track>
    </>
  );
};
```

```tsx title="Root.tsx"
import {Composition, Folder} from 'remotion';
import {Chapter} from './Chapter';
import {MyVideo} from './MyVideo';
import {Title} from './Title';

export const RemotionRoot = () => (
  <>
    <Composition
      id="MyVideo"
      component={MyVideo}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={210}
    />
    <Folder name="Scenes">
      <Composition
        id="Chapter"
        component={Chapter}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={90}
        defaultProps={{
          title: 'Introduction',
          style: {
            backgroundColor: '#111111',
            justifyContent: 'center',
            alignItems: 'center',
          },
        }}
      />
    </Folder>
    <Folder name="Elements">
      <Composition
        id="Title"
        component={Title}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={90}
        defaultProps={{
          children: 'Introduction',
          style: {
            fontFamily: 'Arial, sans-serif',
            fontSize: 96,
            color: 'white',
          },
        }}
      />
    </Folder>
  </>
);
```

Keep metadata and defaults inline on each registration. See
connected compositions for
extracting existing groups and checking both the parent and standalone views.

````

### 1.51 remotion-interactivity/inline-effects.md

Source: `skills/remotion-interactivity/inline-effects.md`

````markdown
## Effects should be inline too

The effects array should not be computed.
The same rules for setting keyframes as `interpolate()` apply too here: All values should also be hardcoded: Input range, output range, easing, extrapolation, `output` property.

```tsx title="Effects"
// 👍 Parameters are inline and the array shape is stable
<CanvasImage
  src={src}
  width={1280}
  height={720}
  effects={[
    radialProgressiveBlur({
      center: [0.5, 0.5],
      width: 1.2,
      height: 0.8,
      start: 0.2,
      disabled: true,
      rotation: interpolate(frame, [0, 120], [0, 180]),
    }),
  ]}
/>

const center = [0.5, 0.5] as const;
const rotation = frame * 1.5;

<CanvasImage
  src={src}
  width={1280}
  height={720}
  // ❌ Conditional effect is not animateable
  effects={enabled ? [
    radialProgressiveBlur({
      // ❌ Not inline
      center,
      rotation,
    }),
  ] : []}
/>
```

Render separate elements if one version should have effects and another should not.

````

### 1.52 remotion-saas/SKILL.md

Source: `skills/remotion-saas/SKILL.md`

````markdown
---
name: remotion-saas
description: Build an app with Remotion
version: 4.0.540
---

One can build apps with Remotion.  
It is possible to have a simple form and hook it up to a render, or have a complex video editor.

## Choosing a template or a framework

We have several templates for SaaS which can be cloned or used as a reference.
See [Choosing a framework](framework.md) for help choosing a template or framework.

## The `<Player>`

This component allows embedding a Remotion preview in a React app. See [Player](player.md) for more information about the Player.

## Rendering

There are client-side and server-side rendering options available. See [Rendering](rendering.md) for advice on how to choose, and about the Lambda, Vercel, Node.js and Cloudflare options.

## With Vue

See https://www.remotion.dev/docs/vue.md for how to use Remotion with Vue.

## Angular

See https://www.remotion.dev/docs/angular.md for how to use Remotion with Angular.

## Svelte

See https://www.remotion.dev/docs/svelte.md for how to use Remotion with Svelte.

````

### 1.53 remotion-saas/rendering.md (Lambda setup steps)

Source: `skills/remotion-saas/rendering.md`

````markdown
---
name: rendering
description: Advice on programmatic rendering with Remotion.
metadata:
  tags: remotion, saas, ssr, renderer, node, bun, render-server
---

This is about rendering videos programmatically with Remotion.  
For one-off renders, `npx remotion render` or the Studio is better suited.

## Comparison of SSR methods

See https://www.remotion.dev/docs/compare-ssr.md for the tradeoffs between server-side rendering options.

## Plain Node.js APIs

Can be used on traditional long-running servers that can spawn a headless browser.

- SSR overview: https://www.remotion.dev/docs/ssr.md
- Renderer package: https://www.remotion.dev/docs/renderer.md
- Node SSR: https://www.remotion.dev/docs/ssr-node.md

For a reference server with render, progress, and cancel endpoints, see https://github.com/remotion-dev/template-render-server.

## Remotion Lambda

Render Remotion videos on AWS Lambda. This is the fastest and most scalable way to render Remotion videos.

- Overview: https://www.remotion.dev/docs/lambda.md
- API: https://www.remotion.dev/docs/lambda/api.md

### Steps to set up Lambda


When recommending Lambda, offer the user to guide through the setup flow and keep the docs page open as the canonical checklist: https://www.remotion.dev/docs/lambda/setup.md.

Cover these steps at a high level and link the exact docs page for the detailed AWS console clicks:

1. Confirm the user has an AWS account, a target region, and a Remotion project or SaaS template.
2. Install `@remotion/lambda` using `npx remotion add @remotion/lambda`.
3. Create the Lambda role policy, Lambda role, IAM user, user access key, and user policy from the generated Remotion policy commands.
4. Store credentials in `.env` using `REMOTION_AWS_ACCESS_KEY_ID` and `REMOTION_AWS_SECRET_ACCESS_KEY`; never ask the user to paste secrets into chat.
5. Run the Lambda policy validator if the user wants to verify permissions before deploying; use the user's package manager or the command shown in the docs (`npx remotion lambda policies validate`).
6. Deploy the Lambda function. Mention that functions are bound to the Remotion version and must be redeployed after Remotion upgrades.
7. Deploy the Remotion site with a stable site name. Mention that the site must be redeployed after changing the Remotion source.
8. Check Lambda quotas using the user's package manager or the command shown in the docs (`npx remotion lambda quotas`); new AWS accounts may need a concurrency limit increase.
9. Trigger a first render, then wire render and progress endpoints using the chosen SaaS template or Node APIs.

Before production, remind the user to handle rate limiting, authentication, cost controls, output privacy, render cleanup, and progress/error reporting.

## Vercel

Ideal if planning to deploy the app to Vercel.

See https://www.remotion.dev/docs/vercel-sandbox.md for more info.

## GitHub Actions

See https://www.remotion.dev/docs/ssr.md#render-using-github-actions for how to render on GitHub Actions.
Don't recommend unless asked for.

## Azure Container Apps

See https://www.remotion.dev/docs/azure-container-apps.md if rendering on Azure Container Apps is requested.
Don't recommend unless asked for.

## Cloudflare Containers

See https://www.remotion.dev/docs/cloudflare-containers.md if rendering on Cloudflare Containers is requested.

````

### 1.54 remotion-multimedia/SKILL.md

Source: `skills/remotion-multimedia/SKILL.md`

````markdown
---
name: remotion-multimedia
description: Interacting with Mediabunny
version: 4.0.540
---

Mediabunny is a multimedia library for dealing with audio and video in the browser.
Here is a compact overview of its capabilities: https://mediabunny.dev/llms.txt

## Getting audio duration

See [get-audio-duration.md](get-audio-duration.md) for getting the duration of an audio file in seconds with Mediabunny.

## Getting video dimensions

See [get-video-dimensions.md](get-video-dimensions.md) for getting the width and height of a video file with Mediabunny.

## Getting video duration

See [get-video-duration.md](get-video-duration.md) for getting the duration of a video file in seconds with Mediabunny.

````

### 1.55 remotion-upgrade/SKILL.md

Source: `skills/remotion-upgrade/SKILL.md`

````markdown
---
name: remotion-upgrade
description: Upgrade Remotion, and related packages
version: 4.0.540
---

# Upgrade Remotion

1. Inspect the project manifests and lockfile to identify the package manager and workspaces. Preserve unrelated changes.
2. Determine whether `@remotion/cli` is locally available. If it is, run:

   ```bash
   npx remotion upgrade
   ```

   This also updates project-local Remotion skills. Skip the manual upgrade below.

3. If `@remotion/cli` is not available, upgrade manually:
   - Get the latest stable Remotion version with `npm view remotion version`.
   - Find every installed `remotion` and `@remotion/*` dependency across the project and upgrade them all to that exact version. Preserve their dependency sections and the project's workspace or catalog conventions.
   - Read the `@remotion/studio` dependencies for the target Remotion version using `npm view @remotion/studio@<version> dependencies --json`. Align installed auxiliary packages such as `zod`, `mediabunny`, and `@huggingface/transformers` with the versions listed there. Use the `mediabunny` version for installed `@mediabunny/*` packages.
   - Run the project's package manager to update its lockfile.
4. If `@remotion/cli` is not available, update the installed Remotion skills:

   ```bash
   npx skills update remotion-best-practices remotion-captions remotion-create remotion-docs remotion-interactivity remotion-license remotion-maps remotion-markup remotion-multimedia remotion-render remotion-saas remotion-studio remotion-upgrade --yes
   ```

5. Review the manifest and lockfile diff. Ensure all Remotion packages use one version and installed auxiliary packages use their recommended versions. If the CLI is available, run `npx remotion versions` as an additional check.

The [Remotion releases](https://github.com/remotion-dev/remotion/releases) contain the changelog and may be useful for summarizing relevant changes after the upgrade.

````

### 1.56 remotion-license/SKILL.md

Source: `skills/remotion-license/SKILL.md`

````markdown
---
name: remotion-license
description: Find Remotion license information, FAQs, terms, and where to buy a license.
version: 4.0.540
---

# Remotion License

For questions about Remotion licensing, read the relevant resource:

- [License](https://www.remotion.dev/docs/license.md)
- [License FAQ](https://www.remotion.dev/docs/license/faq.md)
- [Terms and Conditions](https://www.remotion.dev/docs/terms.md)

You can buy a license on [remotion.pro](https://www.remotion.pro/license).

````

**Not quoted (map-specific, not relevant to reels):** `remotion-maps/SKILL.md` and its `techniques/{cesium,mapbox,maplibre,maptiler,static-map}` sub-trees.

---

## 2. Remotion's AI documentation pages (fetched 2026-11-02 as Markdown via `.md` suffix)


Pages that exist (HTTP 200): `/docs/ai`, `/docs/ai/skills`, `/docs/ai/plugins`, `/docs/ai/mcp` (unlisted, 'shut down'), `/docs/ai/coding-agents`, `/docs/ai/claude-code-plugin`, `/docs/ai/cursor-plugin`, `/docs/ai/codex-plugin`, `/docs/ai/webmcp`. Also `https://www.remotion.dev/llms.txt` (200) and `https://www.remotion.dev/prompts` (the 'Prompt Showcase').

Pages that do NOT exist (HTTP 404, verified): `/docs/ai/claude-code`, `/docs/ai/system-prompt`, `/docs/ai/cursor`, `/docs/ai/cursor-rules`, `/docs/ai/reference-frames`, `/docs/ai/visual-feedback`, `/docs/ai/prompts`, `/docs/ai/agents`, `/docs/showcase.md`, `/docs/llms.txt`, `/llms-full.txt`. There is **no Remotion doc about giving the agent reference images/frames**; the only 'look at frames' guidance is the `--frames` tip in `remotion-render/SKILL.md` and 'Visual checks' in `remotion-markup/SKILL.md` (section 1), plus the SaaS template's `capture-frame.ts` (section 3.2) which renders a still with `@remotion/web-renderer` and sends it to the model as a JPEG.

### 2.1 /docs/ai (index)

Source: `https://www.remotion.dev/docs/ai.md`

````markdown
---
image: https://remotion.media/docs/generated/articles-docs-ai-index.png
crumb: 'Artificial Intelligence'
title: Building with Remotion and AI
---

import {TableOfContents} from './TableOfContents';

Here are a few ways you can use AI in your Remotion workflow today:

<TableOfContents />

## AI-Ready Documentation

Remotion docs are optimized for AI agents:

- **Copy as Markdown**: Click the copy button on any doc page to copy raw markdown
- **Markdown URLs**: Add `.md` to any doc URL (e.g., `remotion.dev/docs/player.md`) to view/fetch raw markdown
- **Content negotiation**: Remotion docs respect the `Accept` header - request `text/markdown` to get markdown instead of HTML. Paste any Remotion doc link into Claude Code, opencode, or other AI coding agents and they'll automatically fetch the markdown version

````

### 2.2 /docs/ai/skills

Source: `https://www.remotion.dev/docs/ai/skills.md`

````markdown
---
image: https://remotion.media/docs/generated/articles-docs-ai-skills.png
crumb: 'AI'
title: Agent Skills
sidebar_label: Skills
---

Remotion maintains a list of [Agent Skills](https://agentskills.io/home) that define best practices for working in Remotion projects.

These skills are useful for AI agents like Claude Code, Codex, Kimi Code or Cursor.

You can install them by running:

```bash
npx skills add remotion-dev/skills
```

Or install them with the GitHub CLI:

```bash
gh skill install remotion-dev/skills
```

You are also offered the option to add skills when you create a new Remotion project:

```bash
bun create video
```

The skills are also available on GitHub [here](https://github.com/remotion-dev/remotion/tree/main/packages/skills).

## Available skills

### `/remotion-best-practices`

This skill encompasses all other skills.  
Use it if you are not sure which specific skill to use.

### `/remotion-create`

Create a new Remotion project or composition.

<SuggestedPrompt prompt="/remotion-create Make a promo video for a record store" />

### `/remotion-markup`

Best practices for writing Remotion React markup.

Use this for knowledge about compositions, animations, layout, typography, media elements, effects, audio, fonts, timing.

<SuggestedPrompt prompt="/remotion-markup Create an animated title card using Inter." />

### `/remotion-studio`

Launch the Studio to see a preview of your video.

<SuggestedPrompt prompt="/remotion-studio" />

### `/remotion-render`

Invoke a render into a video or a still.

<SuggestedPrompt prompt="/remotion-render" />

### `/remotion-maps`

Best practices for creating map animations in Remotion.

Use this for static maps, animated routes and markers, geographic explainers, Mapbox, MapLibre, MapTiler, GeoJSON, and 3D geographic flyovers with CesiumJS.

<SuggestedPrompt prompt="/remotion-maps Animate a route from Los Angeles to New York and make the camera follow it." />

### `/remotion-captions`

Guidance for captions and subtitles.

### `/remotion-saas`

Architecture guidance for Remotion-powered apps and product integrations.

<SuggestedPrompt prompt="/remotion-saas Turn my video into a SaaS." />

### `/remotion-interactivity`

Guidance for making Remotion code [editable](https://www.remotion.dev/docs/studio/interactivity) in Studio.

Use this when elements are not selectable or editable as you would like them to be.

### `/remotion-docs`

Search the Remotion documentation and fetch any page as Markdown.

Use this to look up current API references, component props, and package guides before implementing.

<SuggestedPrompt prompt="/remotion-docs How to set up Remotion Lambda?" />

### `/remotion-license`<AvailableFrom v="4.0.540" />

Find Remotion license information, FAQs, terms, and where to buy a license.

### `/remotion-upgrade`

Upgrade Remotion, related packages, compatible Mediabunny packages, and installed Remotion Agent Skills.

<SuggestedPrompt prompt="/remotion-upgrade" />

### `/remotion-multimedia`

Guidance for browser-based multimedia handling with Mediabunny.

Use this for advice on how to get video and audio metadata.

````

### 2.3 /docs/ai/plugins

Source: `https://www.remotion.dev/docs/ai/plugins.md`

````markdown
---
image: https://remotion.media/docs/generated/articles-docs-ai-plugins.png
crumb: 'AI'
title: Plugins
---

import {CreateWithChatGPTButton} from '../../components/CreateWithChatGPTButton';

Remotion maintains plugins for AI coding agents. Each plugin includes [Remotion Agent Skills](/docs/ai/skills) and can help you create and edit Remotion projects.

## Codex plugin

Use the Remotion plugin in Codex in the ChatGPT desktop app.

<div style={{marginBottom: 16}}>
  <CreateWithChatGPTButton />
</div>

[Install and use the Codex plugin](/docs/ai/codex-plugin).

## Claude Code plugin

Use the Remotion plugin in Claude Code.

[Install and use the Claude Code plugin](/docs/ai/claude-code-plugin).

## Cursor plugin

Use the Remotion plugin in Cursor.

[Install the Remotion plugin from the Cursor Marketplace](https://cursor.com/marketplace/remotion).

[Learn how to use the Cursor plugin](/docs/ai/cursor-plugin).

## GitHub Copilot plugin

Use the Remotion plugin in GitHub Copilot CLI.

[Install and use the GitHub Copilot plugin](/docs/ai/github-copilot-plugin).

## Kimi Code plugin

Use the Remotion plugin in Kimi Code.

[Install and use the Kimi Code plugin](/docs/ai/kimi-code-plugin).

````

### 2.4 /docs/ai/claude-code-plugin

Source: `https://www.remotion.dev/docs/ai/claude-code-plugin.md`

````markdown
---
image: https://remotion.media/docs/generated/articles-docs-ai-claude-code-plugin.png
crumb: 'AI'
title: Claude Code plugin
---

Remotion maintains a [plugin for Claude Code](https://github.com/remotion-dev/claude-code-plugin).

It can help you create and edit Remotion projects and includes [Remotion Agent Skills](/docs/ai/skills).

## Installation

### In the Claude desktop app

Find the Remotion listing through the plugin directory in the [Claude desktop app](https://claude.com/download).

<Step>1</Step> Select Code, open Customize in the sidebar, then select Plugins → Discover.

[![Claude desktop with Customize open and Plugins and Discover selected](/img/claude-code-plugin/discover.jpg)](/img/claude-code-plugin/discover.jpg)

<Step>2</Step> Search for `remotion`.<br/>Find the Remotion plugin from `remotion-dev/claude-code-plugin` and click Add next to it.

[![Search results for remotion, with the Remotion plugin and its Add button at the top](/img/claude-code-plugin/search.jpg)](/img/claude-code-plugin/search.jpg)

<Step>3</Step> Claude opens the installed plugin and confirms "Remotion is installed and ready to use."

[![The installed Remotion plugin with its switch enabled and the installation confirmation visible](/img/claude-code-plugin/installed.jpg)](/img/claude-code-plugin/installed.jpg)

<Step>4</Step> [Create your first video](#usage) with the plugin.

### In the terminal

To install from the terminal, add the Remotion marketplace and install the plugin:

```bash title="Terminal"
claude plugin marketplace add remotion-dev/claude-code-plugin
claude plugin install remotion@remotion
```

Restart Claude Code after installing the plugin.

## Usage

Start a new Claude Code session in the folder where you want to create your video.

Invoke the plugin's `remotion-create` skill and append your prompt:

<SuggestedPrompt prompt="/remotion:remotion-create Make a promo video for a record store" />

## See also

- [Codex plugin](/docs/ai/codex-plugin)
- [Cursor plugin](/docs/ai/cursor-plugin)
- [Kimi Code plugin](/docs/ai/kimi-code-plugin)
- [GitHub Copilot plugin](/docs/ai/github-copilot-plugin)
- [Remotion Agent Skills](/docs/ai/skills)
- [Prompting videos with coding agents](/docs/ai/coding-agents)
- [Plugin source code](https://github.com/remotion-dev/claude-code-plugin)

````

### 2.5 /docs/ai/cursor-plugin

Source: `https://www.remotion.dev/docs/ai/cursor-plugin.md`

````markdown
---
image: https://remotion.media/docs/generated/articles-docs-ai-cursor-plugin.png
crumb: 'AI'
title: Cursor plugin
---

Remotion maintains a [plugin for Cursor](https://github.com/remotion-dev/cursor-plugin).

It can help you create and edit Remotion projects and includes [Remotion Agent Skills](/docs/ai/skills).

## Installation

[Install the Remotion plugin from the Cursor Marketplace](https://cursor.com/marketplace/remotion).

Alternatively, clone the plugin into Cursor's local plugin directory:

```bash title="Terminal"
mkdir -p ~/.cursor/plugins/local
git clone https://github.com/remotion-dev/cursor-plugin.git ~/.cursor/plugins/local/remotion
```

Restart Cursor or run **Developer: Reload Window** after installing the plugin.

## Usage

Ask Cursor to create or edit a Remotion video. Cursor automatically loads the relevant skills.

You can also invoke the main skill directly:

<SuggestedPrompt prompt="/remotion-best-practices Make a promo video for a record store" />

## See also

- [Claude Code plugin](/docs/ai/claude-code-plugin)
- [Codex plugin](/docs/ai/codex-plugin)
- [Kimi Code plugin](/docs/ai/kimi-code-plugin)
- [GitHub Copilot plugin](/docs/ai/github-copilot-plugin)
- [Remotion Agent Skills](/docs/ai/skills)
- [Prompting videos with coding agents](/docs/ai/coding-agents)
- [Plugin source code](https://github.com/remotion-dev/cursor-plugin)

````

### 2.6 /docs/ai/codex-plugin

Source: `https://www.remotion.dev/docs/ai/codex-plugin.md`

````markdown
---
image: https://remotion.media/docs/generated/articles-docs-ai-codex-plugin.png
crumb: 'AI'
title: Codex plugin
---

Remotion maintains a plugin for Codex in the ChatGPT desktop app.

It can help you create new Remotion projects and includes [Remotion Agent Skills](/docs/ai/skills).

## Installation

[Open the Remotion plugin in Codex](https://chatgpt.com/plugins/plugins~Plugin_efd07789186881918253a50acfc32762?open_in_codex).

Alternatively, open the ChatGPT desktop app, visit the **Plugins** tab and search for "Remotion".

## Usage

Create a new project and enter `$remotion` into the prompt. Accept the Remotion plugin when it is suggested.

You can now prompt a video or use other [Agent Skills](/docs/ai/skills).

## See also

- [Claude Code plugin](/docs/ai/claude-code-plugin)
- [Cursor plugin](/docs/ai/cursor-plugin)
- [Kimi Code plugin](/docs/ai/kimi-code-plugin)
- [GitHub Copilot plugin](/docs/ai/github-copilot-plugin)
- [Remotion Agent Skills](/docs/ai/skills)
- [Prompting videos with coding agents](/docs/ai/coding-agents)

````

### 2.7 /docs/ai/coding-agents ('Prompting videos with coding agents')

Source: `https://www.remotion.dev/docs/ai/coding-agents.md`

````markdown
---
image: https://remotion.media/docs/generated/articles-docs-ai-coding-agents.png
crumb: 'AI'
title: Prompting videos with coding agents
sidebar_label: Coding Agents
---

<YouTube minutes={5} href="https://www.youtube.com/watch?v=5NRAOnKc3c8" thumb="https://i.ytimg.com/vi/5NRAOnKc3c8/hqdefault.jpg" title="Create motion graphics with AI – Simple tutorial for beginners" />

You can create videos just from prompting.  
This is an easy way to get started with Remotion!

Remotion works well with coding agents such as [Claude Code](https://claude.com/product/claude-code), [Codex](https://developers.openai.com/codex), [Kimi Code](https://www.kimi.com/code) and [OpenCode](https://opencode.ai).

## Prerequisites

You first need to install a coding agent like [Claude Code](https://claude.com/product/claude-code), [Codex](https://developers.openai.com/codex), [Kimi Code](https://www.kimi.com/code) or [OpenCode](https://opencode.ai), as well as [Node.js](https://nodejs.org/en).<br />
Most coding agents require a paid subscription.

## Start a new project

Create a new project using the following command:

```bash
npx create-video --yes --blank my-video
```

This creates a [Blank](https://remotion.dev/templates/blank) project in the `my-video` directory.

## Start the preview

First, go into the directory that was created.  
If you named your project `my-video`, you would run the following command:

```bash
cd my-video
```

Install the [Remotion Agent Skills](/docs/ai/skills):

```bash title="Terminal"
npx remotion skills add
```

Start the project using the following command:

```bash
npm run dev
```

## Start your coding agent

Open a separate terminal window and start your coding agent of choice:

```bash
cd my-video
claude # or: codex / kimi / opencode
```

You can now prompt a video! See our video above for a few ideas on how to start.

````

### 2.8 /docs/ai/mcp (shut down 2026-10-26)

Source: `https://www.remotion.dev/docs/ai/mcp.md`

````markdown
---
image: https://remotion.media/docs/generated/articles-docs-ai-mcp.png
crumb: 'AI'
title: Remotion's Model Context Protocol (shut down)
sidebar_label: MCP (shut down)
unlisted: true
---

:::warning Shut down
The hosted Remotion MCP server was shut down on October 26, 2026 and is no longer available.

Install [Remotion Agent Skills](/docs/ai/skills) and use `/remotion-docs` instead.
:::

## Why was the MCP shut down?

- Its data could be less current than the Remotion documentation.
- Remotion paid the token costs for MCP requests.
- Installing MCP servers was difficult, and agents did not invoke them reliably.
- It duplicated the `/remotion-docs` skill.

## Migrate to `/remotion-docs`

<Step>1</Step> Remove `remotion-documentation` from the MCP configuration in your editor.

<Step>2</Step> Install the Remotion Agent Skills from your Remotion project:

```bash title="Terminal"
npx remotion skills add
```

<Step>3</Step> Ask your coding agent to use `/remotion-docs` when it needs current Remotion documentation.

Restart the coding agent if it does not detect the newly installed skills.

````

### 2.9 /docs/ai/webmcp (Studio exposes WebMCP tools; only Codex supports it today) — capabilities section

Source: `https://www.remotion.dev/docs/ai/webmcp.md` (first 40 lines of 1175; rest omitted)

````markdown
---
image: https://remotion.media/docs/generated/articles-docs-ai-webmcp.png
crumb: 'AI'
title: WebMCP
sidebar_label: WebMCP
---

# WebMCP<AvailableFrom v="4.0.518" />

Remotion Studio exposes WebMCP tools that allow an AI agent to inspect and steer it.

## Capabilities

Agents can:

- See which items you currently have selected
- See selectable items and select them
- Duplicate sequences and inspect pending edits
- See available compositions and navigate to them
- Inspect render jobs, cancel queued or running renders, and reopen saved render settings
- Read the error currently shown in the Studio error overlay
- Get the current HTML of your composition
- See current outlines of elements and their geometry
- Get your current playhead position and playback state
- Play, pause and seek
- Set timeline zoom, playback rate, looping, volume and mute state
- See, add and remove guides
- Install packages into the current project
- Transcribe audio and video assets
- Remove the background from video assets
- Restart or shut down the Studio server

## Requirements

Start the [Remotion Studio](/docs/studio) and open it in a browser with an AI agent that supports [WebMCP](https://webmcp.dev/).

## Compatible agents

Out of the major harnesses, only ChatGPT Codex supports WebMCP. We hope more agents add support soon.


````

The rest of the WebMCP page is the per-tool schema (`install_package`, `transcribe_asset`, `remove_video_background`, `get_render_jobs`, `get_sequences`, `get_canvas_html`, `get_outlines`, `seek_to_frame`, `play`/`pause`, guides…). Key sentence: "Out of the major harnesses, only ChatGPT Codex supports WebMCP. We hope more agents add support soon."

**2.10 https://www.remotion.dev/llms.txt** — AI section lists only two pages: "Building with Remotion and AI" (`/docs/ai/index.md`) and "Prompting videos with coding agents" (`/docs/ai/coding-agents.md`).

**2.11 https://www.remotion.dev/prompts ('Prompt Showcase')** — page text (HTML stripped): "See what the community has built using Remotion Skills and coding agents like Claude Code, Codex, or OpenCode. Create your own video". Entries on page 1 (title, author, vote count): News article headline highlight @Remotion 379 · Travel Route on Map with 3D landmarks @JNYBGR 370 · Product Demo for Presscut @Shpigford 248 · Launch Video on X @ghumare64 208 · Cinematic Tech Intro @tiw_ari_ayu 204 · Transparent Call-To-Action overlay @Remotion 181 · Rocket Launches Timeline @crispynotfound 134 · Real Estate Investing HarisShah2345 110 · Three.js "Top 20 Games Sold" Ranking @DilumSanjaya 96 · Promotion video for VVTerm @wiedymi 83 · Bar + Line Chart (combined) samohovets 69 · Music CD store promo samohovets 67 (3 pages). The individual prompts are rendered client-side and were not captured.

**2.12 https://www.remotion.dev/showcase** — "Products, campaigns, launch videos, tutorials and creative tools made with Remotion"; no AI/agent filter; "Curated by Remotion. We are not taking new showcase submissions right now."

---

## 3. Remotion templates relevant to reels


### 3.1 template-tiktok (301★, pushed 2026-11-02) — Whisper.cpp transcription → `createTikTokStyleCaptions` → word-highlight pages, 1080×1920

Files: `src/CaptionedVideo/{index.tsx,SubtitlePage.tsx,Page.tsx,NoCaptionFile.tsx}`, `src/Root.tsx`, `src/load-font.ts`, `sub.mjs`, `whisper-config.mjs`. No CLAUDE.md/SKILL.md in the template.

### 3.1.a src/CaptionedVideo/index.tsx (createTikTokStyleCaptions usage, SWITCH_CAPTIONS_EVERY_MS)

Source: `template-tiktok/src/CaptionedVideo/index.tsx`

````tsx
import { Caption, createTikTokStyleCaptions } from "@remotion/captions";
import { getVideoMetadata } from "@remotion/media-utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  cancelRender,
  getStaticFiles,
  OffthreadVideo,
  Sequence,
  useDelayRender,
  useVideoConfig,
  watchStaticFile,
} from "remotion";
import { z } from "zod";
import { loadFont } from "../load-font";
import { NoCaptionFile } from "./NoCaptionFile";
import SubtitlePage from "./SubtitlePage";

export type SubtitleProp = {
  startInSeconds: number;
  text: string;
};

export const captionedVideoSchema = z.object({
  src: z.string(),
});

export const calculateCaptionedVideoMetadata: CalculateMetadataFunction<
  z.infer<typeof captionedVideoSchema>
> = async ({ props }) => {
  const fps = 30;
  const metadata = await getVideoMetadata(props.src);

  return {
    fps,
    durationInFrames: Math.floor(metadata.durationInSeconds * fps),
  };
};

const getFileExists = (file: string) => {
  const files = getStaticFiles();
  const fileExists = files.find((f) => {
    return f.src === file;
  });
  return Boolean(fileExists);
};

// How many captions should be displayed at a time?
// Try out:
// - 1500 to display a lot of words at a time
// - 200 to only display 1 word at a time
const SWITCH_CAPTIONS_EVERY_MS = 1200;

export const CaptionedVideo: React.FC<{
  src: string;
}> = ({ src }) => {
  const [subtitles, setSubtitles] = useState<Caption[]>([]);
  const { delayRender, continueRender } = useDelayRender();
  const [handle] = useState(() => delayRender());
  const { fps } = useVideoConfig();

  const subtitlesFile = src
    .replace(/.mp4$/, ".json")
    .replace(/.mkv$/, ".json")
    .replace(/.mov$/, ".json")
    .replace(/.webm$/, ".json");

  const fetchSubtitles = useCallback(async () => {
    try {
      await loadFont();
      if (!getFileExists(subtitlesFile)) {
        setSubtitles([]);
        continueRender(handle);
        return;
      }

      const res = await fetch(subtitlesFile);
      const data = (await res.json()) as Caption[];
      setSubtitles(data);
      continueRender(handle);
    } catch (e) {
      cancelRender(e);
    }
  }, [continueRender, handle, subtitlesFile]);

  useEffect(() => {
    fetchSubtitles();

    const c = watchStaticFile(subtitlesFile, () => {
      fetchSubtitles();
    });

    return () => {
      c.cancel();
    };
  }, [fetchSubtitles, src, subtitlesFile]);

  const { pages } = useMemo(() => {
    return createTikTokStyleCaptions({
      combineTokensWithinMilliseconds: SWITCH_CAPTIONS_EVERY_MS,
      captions: subtitles ?? [],
    });
  }, [subtitles]);

  return (
    <AbsoluteFill style={{ backgroundColor: "white" }}>
      <AbsoluteFill>
        <OffthreadVideo
          style={{
            objectFit: "cover",
          }}
          src={src}
        />
      </AbsoluteFill>
      {pages.map((page, index) => {
        const nextPage = pages[index + 1] ?? null;
        const subtitleStartFrame = (page.startMs / 1000) * fps;
        const subtitleEndFrame = Math.min(
          nextPage ? (nextPage.startMs / 1000) * fps : Infinity,
          subtitleStartFrame + SWITCH_CAPTIONS_EVERY_MS,
        );
        const durationInFrames = subtitleEndFrame - subtitleStartFrame;
        if (durationInFrames <= 0) {
          return null;
        }

        return (
          <Sequence
            key={index}
            from={subtitleStartFrame}
            durationInFrames={durationInFrames}
          >
            <SubtitlePage key={index} page={page} />;
          </Sequence>
        );
      })}
      {getFileExists(subtitlesFile) ? null : <NoCaptionFile />}
    </AbsoluteFill>
  );
};

````

### 3.1.b src/CaptionedVideo/SubtitlePage.tsx (spring enter)

Source: `template-tiktok/src/CaptionedVideo/SubtitlePage.tsx`

````tsx
import { TikTokPage } from "@remotion/captions";
import React from "react";
import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Page } from "./Page";

const SubtitlePage: React.FC<{ readonly page: TikTokPage }> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: {
      damping: 200,
    },
    durationInFrames: 5,
  });

  return (
    <AbsoluteFill>
      <Page enterProgress={enter} page={page} />
    </AbsoluteFill>
  );
};

export default SubtitlePage;

````

### 3.1.c src/CaptionedVideo/Page.tsx (fitText, active-word highlight #39E508, paintOrder stroke)

Source: `template-tiktok/src/CaptionedVideo/Page.tsx`

````tsx
import { makeTransform, scale, translateY } from "@remotion/animation-utils";
import { TikTokPage } from "@remotion/captions";
import { fitText } from "@remotion/layout-utils";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TheBoldFont } from "../load-font";

const fontFamily = TheBoldFont;

const container: React.CSSProperties = {
  justifyContent: "center",
  alignItems: "center",
  top: undefined,
  bottom: 350,
  height: 150,
};

const DESIRED_FONT_SIZE = 120;
const HIGHLIGHT_COLOR = "#39E508";

export const Page: React.FC<{
  readonly enterProgress: number;
  readonly page: TikTokPage;
}> = ({ enterProgress, page }) => {
  const frame = useCurrentFrame();
  const { width, fps } = useVideoConfig();
  const timeInMs = (frame / fps) * 1000;

  const fittedText = fitText({
    fontFamily,
    text: page.text,
    withinWidth: width * 0.9,
    textTransform: "uppercase",
  });

  const fontSize = Math.min(DESIRED_FONT_SIZE, fittedText.fontSize);

  return (
    <AbsoluteFill style={container}>
      <div
        style={{
          fontSize,
          color: "white",
          WebkitTextStroke: "20px black",
          paintOrder: "stroke",
          transform: makeTransform([
            scale(interpolate(enterProgress, [0, 1], [0.8, 1])),
            translateY(interpolate(enterProgress, [0, 1], [50, 0])),
          ]),
          fontFamily,
          textTransform: "uppercase",
        }}
      >
        <span
          style={{
            transform: makeTransform([
              scale(interpolate(enterProgress, [0, 1], [0.8, 1])),
              translateY(interpolate(enterProgress, [0, 1], [50, 0])),
            ]),
          }}
        >
          {page.tokens.map((t, index) => {
            const startRelativeToSequence = t.fromMs - page.startMs;
            const endRelativeToSequence = t.toMs - page.startMs;

            const active =
              startRelativeToSequence <= timeInMs &&
              endRelativeToSequence > timeInMs;

            return (
              <span
                key={`${t.fromMs}-${index}`}
                style={{
                  display: "inline",
                  whiteSpace: "pre",
                  color: active ? HIGHLIGHT_COLOR : "white",
                }}
              >
                {t.text}
              </span>
            );
          })}
        </span>
      </div>
    </AbsoluteFill>
  );
};

````

### 3.1.d src/Root.tsx

Source: `template-tiktok/src/Root.tsx`

````tsx
import { Composition, staticFile } from "remotion";
import {
  CaptionedVideo,
  calculateCaptionedVideoMetadata,
  captionedVideoSchema,
} from "./CaptionedVideo";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="CaptionedVideo"
      component={CaptionedVideo}
      calculateMetadata={calculateCaptionedVideoMetadata}
      schema={captionedVideoSchema}
      width={1080}
      height={1920}
      defaultProps={{
        src: staticFile("sample-video.mp4"),
      }}
    />
  );
};

````

### 3.1.e README.md (captioning section)

Source: `template-tiktok/README.md`

````markdown
# Remotion video

<p align="center">
  <a href="https://github.com/remotion-dev/logo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-dark.apng">
      <img alt="Animated Remotion Logo" src="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-light.gif">
    </picture>
  </a>
</p>

Welcome to your Remotion project!

## Commands

**Install Dependencies**

```console
npm i
```

**Start Preview**

```console
npm run dev
```

**Render video**

```console
npx remotion render
```

**Upgrade Remotion**

```console
npx remotion upgrade
```

## Captioning

Replace the `sample-video.mp4` with your video file.
Caption all the videos in you `public` by running the following command:

```console
node sub.mjs
```

Only caption a specific video:

```console
node sub.mjs <path-to-video-file>
```

Only caption a specific folder:

```console
node sub.mjs <path-to-folder>
```

## Configure Whisper.cpp

Captioning will download Whisper.cpp and the 1.5GB big `medium.en` model. To configure which model is being used, you can configure the variables in `whisper-config.mjs`.

### Non-English languages

To support non-English languages, you need to change the `WHISPER_MODEL` variable in `whisper-config.mjs` to a model that does not have a `.en` sufix.

## Docs

Get started with Remotion by reading the [fundamentals page](https://www.remotion.dev/docs/the-fundamentals).

## Help

We provide help on our [Discord server](https://remotion.dev/discord).

## Issues

Found an issue with Remotion? [File an issue here](https://github.com/remotion-dev/remotion/issues/new).

## License

Note that for some entities a company license is needed. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).

````

### 3.2 template-prompt-to-motion-graphics-saas (292★, pushed 2026-11-02) — the closest thing Remotion ships to 'a system prompt for motion graphics'

What it demonstrates: User Prompt → Validation → Skill Detection → Code Generation → Sanitization → Live Preview (GPT-5.2 via Vercel AI SDK; model is a string you can swap). It ships 8 guidance-skill markdown files in `src/skills/` that are injected into the system prompt only when relevant, 9 example components, a follow-up edit loop with old_string/new_string edits and self-healing compile-error retries, and `capture-frame.ts` which renders a still at 0.5 scale with `@remotion/web-renderer` and attaches it as an image to the model for visual context. No CLAUDE.md/SKILL.md.

### 3.2.a README.md (architecture + skills system)

Source: `template-prompt-to-motion-graphics-saas/README.md`

````markdown
# Remotion Prompt to Motion Graphics

<p align="center">
  <a href="https://github.com/remotion-dev/logo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-dark.apng">
      <img alt="Animated Remotion Logo" src="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-light.gif">
    </picture>
  </a>
</p>

AI-powered motion graphics generator that transforms natural language prompts into Remotion code.

## Architecture

```
User Prompt → Validation → Skill Detection → Code Generation → Sanitization → Live Preview
```

## How It Works

### 1. Validation

Before expensive model calls, a lightweight classifier determines if the prompt describes valid motion graphics content.

**Accepted**: animated text, data visualizations, UI animations, social media content, abstract motion graphics

**Rejected**: questions, conversational requests, non-visual tasks

### 2. Skill Detection

The system analyzes the prompt to identify which **skills** are relevant. Skills are modular knowledge units that provide domain-specific guidance to the code generation model.

There are two types of skills:

- **Guidance Skills** - Pattern libraries with best practices for specific domains (charts, typography, transitions, etc.)
- **Example Skills** - Complete working code references that demonstrate specific animation patterns

This approach keeps the base prompt lightweight while dynamically injecting only the relevant expertise for each request.

### 3. Code Generation

Uses a one-shot prompt with the base Remotion knowledge plus any detected skills. The generated code follows these principles:

- **Constants-first design** - All text, colors, and timing values are declared as editable constants at the top
- **Aesthetic defaults** - Guidance on visual polish, spacing, and animation feel
- **Crossfade patterns** - Smooth state transitions without layout jumps
- **Spring physics** - Natural, organic motion using Remotion's spring() function

### 4. Sanitization & Compilation

The response is cleaned (removing markdown wrappers and trailing commentary), then compiled in-browser using Babel. The compiled component renders directly in the Remotion Preview with all necessary APIs injected.

## Skills System

Skills enable contextual expertise without bloating every prompt. Located in `src/skills/`:

### Guidance Skills

| Skill              | Purpose                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------- |
| **charts**         | Data visualization patterns - bar charts, pie charts, axis labels, staggered animations |
| **typography**     | Kinetic text - typewriter effects, word carousels, text highlights                      |
| **messaging**      | Chat UI - bubble layouts, WhatsApp/iMessage styling, staggered entrances                |
| **transitions**    | Scene changes - TransitionSeries, fade/slide/wipe effects                               |
| **sequencing**     | Timing control - Sequence, TransitionSeries, staggered delays                                     |
| **spring-physics** | Organic motion - spring configs, bounce effects, chained animations                     |
| **social-media**   | Platform-specific formats - aspect ratios, safe zones                                   |
| **3d**             | Three.js integration - 3D scenes, camera setup                                          |

### Example Skills (Code Snippets)

Example skills provide complete working references (histogram, chat messages, typewriter effects, etc.) that demonstrate these patterns in action. We think of them like implementation archetypes that can be used and adjusted for the user prompt.

## Usage Tips

**Prompting best practices:**

- Be specific about colors, timing, and layout ("green sent bubbles on the right, gray received on the left")
- Include data directly in the prompt for charts and visualizations
- Describe the animation feel you want ("bouncy spring entrance", "smooth fade", "staggered timing")

**Images:**

- Direct image uploads are not supported
- Reference images via URL - the generated code will use Remotion's `<Img>` component
- Example: _"Create a DVD screensaver animation of this image https://example.com/logo.png"_

**What works well:**

- Kinetic typography and text animations
- Data visualizations with animated entrances
- Chat/messaging UI mockups
- Social media content (Stories, Reels, TikTok)
- Logo animations and brand intros
- Abstract motion graphics

## Commands

**Install Dependencies**

```console
npm install
```

**Start Preview**

```console
npm run dev
```

**Render video**

```console
npx remotion render
```

**Upgrade Remotion**

```console
npx remotion upgrade
```

## Docs

Get started with Remotion by reading the [fundamentals page](https://www.remotion.dev/docs/the-fundamentals).

## Help

We provide help on our [Discord server](https://discord.gg/6VzzNDwUwV).

## Issues

Found an issue with Remotion? [File an issue here](https://github.com/remotion-dev/remotion/issues/new).

## License

Note that for some entities a company license is needed. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).

````

### 3.2.b src/skills/index.ts (SKILL_DETECTION_PROMPT)

Source: `template-prompt-to-motion-graphics-saas/src/skills/index.ts`

````ts
import { examples } from "@/examples/code";

// Import markdown files at build time
import threeDSkill from "./3d.md";
import chartsSkill from "./charts.md";
import messagingSkill from "./messaging.md";
import sequencingSkill from "./sequencing.md";
import socialMediaSkill from "./social-media.md";
import springPhysicsSkill from "./spring-physics.md";
import transitionsSkill from "./transitions.md";
import typographySkill from "./typography.md";

// Guidance skills (markdown files with patterns/rules)
const GUIDANCE_SKILLS = [
  "charts",
  "typography",
  "social-media",
  "messaging",
  "3d",
  "transitions",
  "sequencing",
  "spring-physics",
] as const;

// Example skills (complete working code references)
const EXAMPLE_SKILLS = [
  "example-histogram",
  "example-progress-bar",
  "example-text-rotation",
  "example-falling-spheres",
  "example-animated-shapes",
  "example-lottie",
  "example-gold-price-chart",
  "example-typewriter-highlight",
  "example-word-carousel",
] as const;

export const SKILL_NAMES = [...GUIDANCE_SKILLS, ...EXAMPLE_SKILLS] as const;

export type SkillName = (typeof SKILL_NAMES)[number];

// Map guidance skill names to imported content
const guidanceSkillContent: Record<(typeof GUIDANCE_SKILLS)[number], string> = {
  charts: chartsSkill,
  typography: typographySkill,
  "social-media": socialMediaSkill,
  messaging: messagingSkill,
  "3d": threeDSkill,
  transitions: transitionsSkill,
  sequencing: sequencingSkill,
  "spring-physics": springPhysicsSkill,
};

// Map example skill names to example IDs
const exampleIdMap: Record<(typeof EXAMPLE_SKILLS)[number], string> = {
  "example-histogram": "histogram",
  "example-progress-bar": "progress-bar",
  "example-text-rotation": "text-rotation",
  "example-falling-spheres": "falling-spheres",
  "example-animated-shapes": "animated-shapes",
  "example-lottie": "lottie-animation",
  "example-gold-price-chart": "gold-price-chart",
  "example-typewriter-highlight": "typewriter-highlight",
  "example-word-carousel": "word-carousel",
};

export function getSkillContent(skillName: SkillName): string {
  // Handle example skills - return the code directly
  if (skillName.startsWith("example-")) {
    const exampleId =
      exampleIdMap[skillName as (typeof EXAMPLE_SKILLS)[number]];
    const example = examples.find((e) => e.id === exampleId);
    if (example) {
      return `## Example: ${example.name}\n${example.description}\n\n\`\`\`tsx\n${example.code}\n\`\`\``;
    }
    return "";
  }

  // Handle guidance skills - return imported markdown content
  return (
    guidanceSkillContent[skillName as (typeof GUIDANCE_SKILLS)[number]] || ""
  );
}

export function getCombinedSkillContent(skills: SkillName[]): string {
  if (skills.length === 0) {
    return "";
  }

  const contents = skills
    .map((skill) => getSkillContent(skill))
    .filter((content) => content.length > 0);

  return contents.join("\n\n---\n\n");
}

export const SKILL_DETECTION_PROMPT = `Classify this motion graphics prompt into ALL applicable categories.
A prompt can match multiple categories. Only include categories that are clearly relevant.

Guidance categories (patterns and rules):
- charts: data visualizations, graphs, histograms, bar charts, pie charts, progress bars, statistics, metrics
- typography: kinetic text, typewriter effects, text animations, word carousels, animated titles, text-heavy content
- social-media: Instagram stories, TikTok content, YouTube shorts, social media posts, reels, vertical video
- messaging: chat interfaces, WhatsApp conversations, iMessage, chat bubbles, text messages, DMs, messenger
- 3d: 3D objects, ThreeJS, spatial animations, rotating cubes, 3D scenes
- transitions: scene changes, fades between clips, slide transitions, wipes, multiple scenes
- sequencing: multiple elements appearing at different times, staggered animations, choreographed entrances
- spring-physics: bouncy animations, organic motion, elastic effects, overshoot animations

Code examples (complete working references):
- example-histogram: animated bar chart with spring animations and @remotion/shapes
- example-progress-bar: loading bar animation from 0 to 100%
- example-text-rotation: rotating words with fade/blur transitions
- example-falling-spheres: 3D bouncing spheres with ThreeJS and physics simulation
- example-animated-shapes: bouncing/rotating SVG shapes (circle, triangle, rect, star)
- example-lottie: loading and displaying Lottie animations from URL
- example-gold-price-chart: bar chart with Y-axis labels, monthly data, staggered animations
- example-typewriter-highlight: typewriter effect with cursor blink, pause, and word highlight
- example-word-carousel: rotating words with crossfade and blur transitions

Return an array of matching category names. Return an empty array if none apply.`;

````

### 3.2.c src/app/api/generate/route.ts — VALIDATION_PROMPT, SYSTEM_PROMPT, FOLLOW_UP_SYSTEM_PROMPT (the prompt text; the rest is request plumbing)

Source: `template-prompt-to-motion-graphics-saas/src/app/api/generate/route.ts` (first 135 lines of 686; rest omitted)

````ts
import {
  getCombinedSkillContent,
  SKILL_DETECTION_PROMPT,
  SKILL_NAMES,
  type SkillName,
} from "@/skills";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject, streamText } from "ai";
import { z } from "zod";

const VALIDATION_PROMPT = `You are a prompt classifier for a motion graphics generation tool.

Determine if the user's prompt is asking for motion graphics/animation content that can be created as a React/Remotion component.

VALID prompts include requests for:
- Animated text, titles, or typography
- Data visualizations (charts, graphs, progress bars)
- UI animations (buttons, cards, transitions)
- Logo animations or brand intros
- Social media content (stories, reels, posts)
- Explainer animations
- Kinetic typography
- Abstract motion graphics
- Animated illustrations
- Product showcases
- Countdown timers
- Loading animations
- Any visual/animated content

INVALID prompts include:
- Questions (e.g., "What is 2+2?", "How do I...")
- Requests for text/written content (poems, essays, stories, code explanations)
- Conversations or chat
- Non-visual tasks (calculations, translations, summaries)
- Requests completely unrelated to visual content

Return true if the prompt is valid for motion graphics generation, false otherwise.`;

const SYSTEM_PROMPT = `
You are an expert in generating React components for Remotion animations.

## COMPONENT STRUCTURE

1. Start with ES6 imports
2. Export as: export const MyAnimation = () => { ... };
3. Component body order:
   - Multi-line comment description (2-3 sentences)
   - Hooks (useCurrentFrame, useVideoConfig, etc.)
   - Constants (COLORS, TEXT, TIMING, LAYOUT) - all UPPER_SNAKE_CASE
   - Calculations and derived values
   - return JSX

## CONSTANTS RULES (CRITICAL)

ALL constants MUST be defined INSIDE the component body, AFTER hooks:
- Colors: const COLOR_TEXT = "#000000";
- Text: const TITLE_TEXT = "Hello World";
- Timing: const FADE_DURATION = 20;
- Layout: const PADDING = 40;

This allows users to easily customize the animation.

## LAYOUT RULES

- Use full width of container with appropriate padding
- Never constrain content to a small centered box
- Use Math.max(minValue, Math.round(width * percentage)) for responsive sizing

## ANIMATION RULES

- Prefer spring() for organic motion (entrances, bounces, scaling)
- Use interpolate() for linear progress (progress bars, opacity fades)
- Always use { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
- Add stagger delays for multiple elements

## AVAILABLE IMPORTS

\`\`\`tsx
import { useCurrentFrame, useVideoConfig, AbsoluteFill, interpolate, spring, Sequence } from "remotion";
import { TransitionSeries, linearTiming, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { Circle, Rect, Triangle, Star, Ellipse, Pie } from "@remotion/shapes";
import { ThreeCanvas } from "@remotion/three";
import { useState, useEffect } from "react";
\`\`\`

## RESERVED NAMES (CRITICAL)

NEVER use these as variable names - they shadow imports:
- spring, interpolate, useCurrentFrame, useVideoConfig, AbsoluteFill, Sequence

## STYLING RULES

- Use inline styles only
- ALWAYS use fontFamily: 'Inter, sans-serif'
- Keep colors minimal (2-4 max)
- ALWAYS set backgroundColor on AbsoluteFill from frame 0 - never fade in backgrounds

## OUTPUT FORMAT (CRITICAL)

- Output ONLY code - no explanations, no questions
- Response must start with "import" and end with "};"
- If prompt is ambiguous, make a reasonable choice - do not ask for clarification

`;

const FOLLOW_UP_SYSTEM_PROMPT = `
You are an expert at making targeted edits to React/Remotion animation components.

Given the current code and a user request, decide whether to:
1. Use targeted edits (for small, specific changes)
2. Provide full replacement code (for major restructuring)

## WHEN TO USE TARGETED EDITS (type: "edit")
- Changing colors, text, numbers, timing values
- Adding or removing a single element
- Modifying styles or properties
- Small additions (new variable, new element)
- Changes affecting <30% of the code

## WHEN TO USE FULL REPLACEMENT (type: "full")
- Completely different animation style
- Major structural reorganization
- User asks to "start fresh" or "rewrite"
- Changes affect >50% of the code

## EDIT FORMAT
For targeted edits, each edit needs:
- old_string: The EXACT string to find (including whitespace/indentation)
- new_string: The replacement string

CRITICAL:
- old_string must match the code EXACTLY character-for-character
- Include enough surrounding context to make old_string unique

````

### 3.2.d src/skills/spring-physics.md

Source: `template-prompt-to-motion-graphics-saas/src/skills/spring-physics.md`

````markdown
---
title: Spring Physics Animation
impact: HIGH
impactDescription: creates natural, organic motion instead of mechanical animations
tags: spring, physics, bounce, easing, organic
---

## Prefer spring() Over interpolate()

Use spring() for natural motion, interpolate() only for linear progress.

**Incorrect (mechanical motion):**

```tsx
const scale = interpolate(frame, [0, 30], [0, 1], {
  extrapolateRight: "clamp",
});
```

**Correct (organic spring motion):**

```tsx
const scale = spring({
  frame,
  fps,
  config: { damping: 12, stiffness: 100 },
  durationInFrames: 30,
});
```

## Spring Config Parameters

```tsx
spring({
  frame,
  fps,
  config: {
    damping: 10, // Higher = less bounce (10-200)
    stiffness: 100, // Higher = faster snap (50-200)
    mass: 1, // Higher = more inertia (0.5-3)
  },
});
```

## Common Spring Presets

```tsx
// Snappy, minimal bounce (UI elements)
const snappy = { damping: 20, stiffness: 200 };

// Bouncy entrance (playful animations)
const bouncy = { damping: 8, stiffness: 100 };

// Smooth, no bounce (subtle reveals)
const smooth = { damping: 200, stiffness: 100 };

// Heavy, slow (large objects)
const heavy = { damping: 15, stiffness: 80, mass: 2 };
```

## Delayed Spring Start

Offset the frame for delayed spring animations:

**Incorrect (spring starts immediately):**

```tsx
const entrance = spring({ frame, fps, config: { damping: 12 } });
```

**Correct (spring starts after delay):**

```tsx
const ENTRANCE_DELAY = 20;
const entrance = spring({
  frame: frame - ENTRANCE_DELAY,
  fps,
  config: { damping: 12, stiffness: 100 },
});
// Returns 0 until frame 20, then animates to 1
```

## Spring for Scale with Overshoot

For bouncy scale animations that overshoot:

```tsx
const bounce = spring({
  frame,
  fps,
  config: { damping: 8, stiffness: 150 },
});
// Will overshoot past 1.0 before settling

<div style={{ transform: `scale(${bounce})` }}>{content}</div>;
```

## Combining Spring with Interpolate

Map spring output (0-1) to custom ranges:

```tsx
const springProgress = spring({ frame, fps, config: { damping: 15 } });

// Map to rotation
const rotation = interpolate(springProgress, [0, 1], [0, 360]);

// Map to position
const translateY = interpolate(springProgress, [0, 1], [50, 0]);

<div style={{ transform: `translateY(${translateY}px) rotate(${rotation}deg)` }}>
```

## Chained Springs for Sequential Motion

```tsx
const PHASE_1_END = 30;
const PHASE_2_START = 25; // Slight overlap

const phase1 = spring({ frame, fps, config: { damping: 15 } });
const phase2 = spring({
  frame: frame - PHASE_2_START,
  fps,
  config: { damping: 12 },
});

// phase1 controls entrance, phase2 controls secondary motion
```

````

### 3.2.e src/skills/sequencing.md

Source: `template-prompt-to-motion-graphics-saas/src/skills/sequencing.md`

````markdown
---
title: Timing & Sequencing
impact: HIGH
impactDescription: controls when elements appear and enables complex choreography
tags: sequence, series, timing, delay, choreography
---

## Sequence for Delayed Elements

Use Sequence to delay when an element appears in the timeline.

**Incorrect (manual frame checks):**

```tsx
{
  frame >= 30 && <Title />;
}
{
  frame >= 60 && <Subtitle />;
}
```

**Correct (Sequence component):**

```tsx
import { Sequence } from "remotion";

<Sequence from={30} durationInFrames={90}>
  <Title />
</Sequence>
<Sequence from={60} durationInFrames={60}>
  <Subtitle />
</Sequence>
```

## TransitionSeries for Sequential Playback

Use TransitionSeries when elements should play one after another without overlap.

```tsx
import { TransitionSeries } from "@remotion/transitions";

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={45}>
    <Intro />
  </TransitionSeries.Sequence>
  <TransitionSeries.Sequence durationInFrames={60}>
    <MainContent />
  </TransitionSeries.Sequence>
  <TransitionSeries.Sequence durationInFrames={30}>
    <Outro />
  </TransitionSeries.Sequence>
</TransitionSeries>;
```

## TransitionSeries with Offset for Overlap

Use negative offset for overlapping sequences:

```tsx
<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneA />
  </TransitionSeries.Sequence>
  <TransitionSeries.Sequence offset={-15} durationInFrames={60}>
    {/* Starts 15 frames before SceneA ends */}
    <SceneB />
  </TransitionSeries.Sequence>
</TransitionSeries>
```

## Staggered Element Entrances

For staggered animations of multiple items, calculate delays:

**Incorrect (hardcoded delays):**

```tsx
const items = data.map((item, i) => {
  const delay = i === 0 ? 0 : i === 1 ? 10 : i === 2 ? 20 : 30;
  // ...
});
```

**Correct (calculated stagger):**

```tsx
const STAGGER_DELAY = 8;
const BASE_DELAY = 15;

const items = data.map((item, i) => {
  const delay = BASE_DELAY + i * STAGGER_DELAY;
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 120 },
  });
  return (
    <Item
      key={i}
      style={{
        opacity: progress,
        transform: `translateY(${(1 - progress) * 20}px)`,
      }}
    />
  );
});
```

## Nested Sequences

Sequences can be nested for complex timing:

```tsx
<Sequence from={0} durationInFrames={120}>
  <Background />
  <Sequence from={15} durationInFrames={90}>
    <Title />
  </Sequence>
  <Sequence from={45} durationInFrames={60}>
    <Subtitle />
  </Sequence>
</Sequence>
```

## Frame References Inside Sequences

Inside a Sequence, useCurrentFrame() returns the local frame (starting from 0):

```tsx
<Sequence from={60} durationInFrames={30}>
  <MyComponent />
  {/* Inside MyComponent, useCurrentFrame() returns 0-29, not 60-89 */}
</Sequence>
```

````

### 3.2.f src/skills/typography.md

Source: `template-prompt-to-motion-graphics-saas/src/skills/typography.md`

````markdown
---
title: Typography & Text Animation
impact: HIGH
impactDescription: fixes common text animation bugs and improves readability
tags: typography, text, typewriter, kinetic, animation
---

## Typewriter Effect - Use String Slicing

Always use string slicing for typewriter effects. Never use per-character opacity.

**Incorrect (per-character opacity - breaks cursor positioning):**

```tsx
{
  text
    .split("")
    .map((char, i) => (
      <span style={{ opacity: i < typedCount ? 1 : 0 }}>{char}</span>
    ));
}
<span>|</span>;
```

**Correct (string slicing - cursor follows text):**

```tsx
const typedText = FULL_TEXT.slice(0, typedChars);

<span>{typedText}</span>
<span style={{ opacity: caretOpacity }}>▌</span>
```

## Cursor Blink - Use Smooth Interpolation

Blinking cursors should fade smoothly, not flash on/off abruptly.

**Incorrect (abrupt blink):**

```tsx
const caretVisible = Math.floor(frame / 15) % 2 === 0;
<span style={{ opacity: caretVisible ? 1 : 0 }}>|</span>;
```

**Correct (smooth blink):**

```tsx
const CURSOR_BLINK_FRAMES = 16;
const caretOpacity = interpolate(
  frame % CURSOR_BLINK_FRAMES,
  [0, CURSOR_BLINK_FRAMES / 2, CURSOR_BLINK_FRAMES],
  [1, 0, 1],
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
);

<span style={{ opacity: caretOpacity }}>▌</span>;
```

## Word Carousel - Stable Width Container

Prevent layout shifts by using the longest word to set container width.

**Incorrect (width jumps between words):**

```tsx
<div style={{ position: "relative" }}>
  <span>{WORDS[currentIndex]}</span>
</div>
```

**Correct (stable width from longest word):**

```tsx
const longestWord = WORDS.reduce(
  (a, b) => (a.length >= b.length ? a : b),
  WORDS[0],
);

<div style={{ position: "relative" }}>
  <div style={{ visibility: "hidden" }}>{longestWord}</div>
  <div style={{ position: "absolute", left: 0, top: 0 }}>
    {WORDS[currentIndex]}
  </div>
</div>;
```

## Text Highlight - Two Layer Crossfade

Use overlapping layers for smooth highlight transitions.

```tsx
const typedOpacity = interpolate(
  frame,
  [highlightStart - 8, highlightStart + 8],
  [1, 0],
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
);
const finalOpacity = interpolate(
  frame,
  [highlightStart, highlightStart + 8],
  [0, 1],
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
);

{
  /* Typing layer */
}
<div style={{ opacity: typedOpacity }}>{typedText}</div>;

{
  /* Final layer with highlight */
}
<div style={{ position: "absolute", inset: 0, opacity: finalOpacity }}>
  <span>{preText}</span>
  <span style={{ backgroundColor: COLOR_HIGHLIGHT }}>{HIGHLIGHT_WORD}</span>
  <span>{postText}</span>
</div>;
```

````

### 3.2.g src/skills/social-media.md (safe zones, min font sizes, hook in first frames)

Source: `template-prompt-to-motion-graphics-saas/src/skills/social-media.md`

````markdown
---
title: Social Media Content
impact: MEDIUM
impactDescription: optimizes content for mobile viewing and engagement
tags: social, instagram, tiktok, reels, stories, mobile
---

## Safe Zone for UI Overlays

Keep key content in the center 80% to avoid platform UI elements.

**Incorrect (content at edges - gets covered by UI):**

```tsx
<AbsoluteFill style={{ padding: 10 }}>
  <div style={{ position: "absolute", top: 0 }}>Title</div>
  <div style={{ position: "absolute", bottom: 0 }}>CTA</div>
</AbsoluteFill>
```

**Correct (content in safe zone):**

```tsx
const SAFE_MARGIN_TOP = height * 0.12;
const SAFE_MARGIN_BOTTOM = height * 0.15;
const SAFE_MARGIN_SIDES = width * 0.05;

<AbsoluteFill
  style={{
    paddingTop: SAFE_MARGIN_TOP,
    paddingBottom: SAFE_MARGIN_BOTTOM,
    paddingLeft: SAFE_MARGIN_SIDES,
    paddingRight: SAFE_MARGIN_SIDES,
  }}
>
  {content}
</AbsoluteFill>;
```

## Mobile-First Text Sizing

Text must be readable on small screens. Minimum 48px for headlines.

**Incorrect (text too small for mobile):**

```tsx
const TITLE_SIZE = 24;
const BODY_SIZE = 14;
```

**Correct (mobile-readable sizes):**

```tsx
const TITLE_SIZE = Math.max(48, Math.round(width * 0.08));
const BODY_SIZE = Math.max(28, Math.round(width * 0.045));
```

## Hook in First Frames

Social content needs immediate visual interest. Add movement from frame 0.

**Incorrect (static start):**

```tsx
const entrance = spring({ frame: frame - 30, fps }); // Starts after 1 second
```

**Correct (immediate hook):**

```tsx
const entrance = spring({
  frame,
  fps,
  config: { damping: 12, stiffness: 200 },
});
const pulse = Math.sin(frame * 0.15) * 0.03 + 1; // Subtle constant motion

<div style={{ transform: `scale(${entrance * pulse})` }}>{content}</div>;
```

## High Contrast Colors

Use bold, saturated colors that pop on mobile screens.

```tsx
// Good for social
const COLOR_PRIMARY = "#FF3366";
const COLOR_ACCENT = "#00D4FF";
const COLOR_BG = "#0A0A0A";

// Avoid muted/pastel colors that look washed out
// const COLOR_PRIMARY = "#C4A4A4"; // Too muted
```

## Loop-Friendly Endings

Design animations that can seamlessly loop.

```tsx
const TOTAL_DURATION = durationInFrames;
const loopProgress = (frame % TOTAL_DURATION) / TOTAL_DURATION;

// Or fade to start state at the end
const fadeOut = interpolate(
  frame,
  [TOTAL_DURATION - 15, TOTAL_DURATION],
  [1, 0],
);
```

````

### 3.2.h src/skills/charts.md

Source: `template-prompt-to-motion-graphics-saas/src/skills/charts.md`

````markdown
---
title: Chart & Data Visualization
impact: HIGH
impactDescription: improves data viz quality and animation polish
tags: charts, data, visualization, bar-chart, pie-chart, graphs
---

## Bar Chart Animations

Stagger bar entrances with 3-5 frame delays and use spring() for organic motion.

**Incorrect (all bars animate together):**

```tsx
const bars = data.map((item, i) => {
  const height = spring({ frame, fps, config: { damping: 18 } });
  return <div style={{ height: height * item.value }} />;
});
```

**Correct (staggered entrances):**

```tsx
const STAGGER_DELAY = 5;

const bars = data.map((item, i) => {
  const delay = i * STAGGER_DELAY;
  const height = spring({
    frame: frame - delay,
    fps,
    config: { damping: 18, stiffness: 80 },
  });
  return <div style={{ height: height * item.value }} />;
});
```

## Always Include Y-Axis Labels

Charts without axis labels are hard to read. Always add labeled tick marks.

**Incorrect (no axis):**

```tsx
<div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>{bars}</div>
```

**Correct (with Y-axis):**

```tsx
const yAxisSteps = [0, 25, 50, 75, 100];

<div style={{ display: "flex" }}>
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    }}
  >
    {yAxisSteps.reverse().map((step) => (
      <span style={{ fontSize: 12, color: "#888" }}>{step}</span>
    ))}
  </div>
  <div
    style={{
      display: "flex",
      alignItems: "flex-end",
      gap: 8,
      borderLeft: "1px solid #333",
    }}
  >
    {bars}
  </div>
</div>;
```

## Value Labels Inside Bars

Position value labels inside bars when height is sufficient, fade in after bar animates.

```tsx
const barHeight = normalizedHeight * progress;

<div style={{ height: barHeight, backgroundColor: COLOR_BAR }}>
  {barHeight > 30 && (
    <span style={{ opacity: progress, fontSize: 11 }}>
      {item.value.toLocaleString()}
    </span>
  )}
</div>;
```

## Pie Chart Animation

Animate segments using stroke-dashoffset, starting from 12 o'clock.

```tsx
const circumference = 2 * Math.PI * radius;
const segmentLength = (value / total) * circumference;
const offset = interpolate(progress, [0, 1], [segmentLength, 0]);

<circle
  r={radius}
  cx={center}
  cy={center}
  fill="none"
  stroke={color}
  strokeWidth={strokeWidth}
  strokeDasharray={`${segmentLength} ${circumference}`}
  strokeDashoffset={offset}
  transform={`rotate(-90 ${center} ${center})`}
/>;
```

````

### 3.2.i src/skills/transitions.md

Source: `template-prompt-to-motion-graphics-saas/src/skills/transitions.md`

````markdown
---
title: Scene Transitions
impact: HIGH
impactDescription: enables smooth scene changes and professional video flow
tags: transitions, fade, slide, wipe, scenes
---

## TransitionSeries for Scene Changes

Use TransitionSeries to animate between multiple scenes or clips.

**Incorrect (abrupt scene cuts):**

```tsx
<Sequence from={0} durationInFrames={60}>
  <SceneA />
</Sequence>
<Sequence from={60} durationInFrames={60}>
  <SceneB />
</Sequence>
```

**Correct (smooth transitions):**

```tsx
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneA />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: 15 })}
  />
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneB />
  </TransitionSeries.Sequence>
</TransitionSeries>;
```

## Available Transition Types

Import transitions from their respective modules:

```tsx
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { flip } from "@remotion/transitions/flip";
import { clockWipe } from "@remotion/transitions/clock-wipe";
```

## Slide Transition with Direction

Specify slide direction for enter/exit animations.

```tsx
import { slide } from "@remotion/transitions/slide";

<TransitionSeries.Transition
  presentation={slide({ direction: "from-left" })}
  timing={linearTiming({ durationInFrames: 20 })}
/>;
```

Directions: `"from-left"`, `"from-right"`, `"from-top"`, `"from-bottom"`

## Custom Crossfade Without TransitionSeries

For simple opacity crossfades within a single component:

```tsx
const TRANSITION_START = 60;
const TRANSITION_DURATION = 15;

const scene1Opacity = interpolate(
  frame,
  [TRANSITION_START, TRANSITION_START + TRANSITION_DURATION],
  [1, 0],
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
);

const scene2Opacity = interpolate(
  frame,
  [TRANSITION_START, TRANSITION_START + TRANSITION_DURATION],
  [0, 1],
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
);

<AbsoluteFill style={{ opacity: scene1Opacity }}><SceneA /></AbsoluteFill>
<AbsoluteFill style={{ opacity: scene2Opacity }}><SceneB /></AbsoluteFill>
```

## Timing Options

```tsx
import { linearTiming, springTiming } from "@remotion/transitions";

// Linear timing - constant speed
linearTiming({ durationInFrames: 20 });

// Spring timing - organic motion
springTiming({ config: { damping: 200 }, durationInFrames: 25 });
```

````

### 3.2.j src/skills/messaging.md

Source: `template-prompt-to-motion-graphics-saas/src/skills/messaging.md`

````markdown
---
title: Chat & Messaging UI
impact: HIGH
impactDescription: creates realistic chat interfaces with proper bubble styling and animations
tags: chat, messaging, whatsapp, imessage, bubbles, conversation
---

## Chat Bubble Layout

Use flexbox to align sent messages right, received messages left.

**Incorrect (all bubbles centered):**

```tsx
<div style={{ textAlign: "center" }}>
  {messages.map((msg) => (
    <div>{msg.text}</div>
  ))}
</div>
```

**Correct (proper chat alignment):**

```tsx
<div
  style={{
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    padding: 40,
  }}
>
  {messages.map((msg, i) => (
    <div
      style={{
        display: "flex",
        justifyContent: msg.sent ? "flex-end" : "flex-start",
        marginTop: 12,
      }}
    >
      <div
        style={{
          maxWidth: "70%",
          padding: "12px 16px",
          borderRadius: 16,
          backgroundColor: msg.sent ? "#1f8a70" : "#202c33",
          color: "#e9edef",
        }}
      >
        {msg.text}
      </div>
    </div>
  ))}
</div>
```

## Staggered Message Entrances

Messages should appear one by one with slide + fade animations.

**Incorrect (all messages appear at once):**

```tsx
{
  messages.map((msg) => <Bubble text={msg.text} />);
}
```

**Correct (staggered with delays):**

```tsx
const STAGGER_DELAY = 38;
const FADE_DURATION = 18;

{
  messages.map((msg, i) => {
    const startFrame = i * STAGGER_DELAY;
    const opacity = interpolate(
      frame - startFrame,
      [0, FADE_DURATION],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    const slideX = interpolate(opacity, [0, 1], [msg.sent ? 40 : -40, 0]);

    return (
      <div style={{ opacity, transform: `translateX(${slideX}px)` }}>
        {msg.text}
      </div>
    );
  });
}
```

## Spring Bounce on Bubble Entrance

Add spring physics for organic bubble pop-in effect.

```tsx
const bounce = spring({
  frame: frame - startFrame,
  fps,
  config: { damping: 12, stiffness: 170 }
});
const scaleValue = interpolate(bounce, [0, 1], [0.98, 1]);

<div style={{
  transform: `translateX(${slideX}px) scale(${scaleValue})`,
  transformOrigin: msg.sent ? "100% 100%" : "0% 100%"
}}>
```

## Dark Theme Colors (WhatsApp style)

```tsx
const COLOR_BACKGROUND = "#0b141a";
const COLOR_SENT = "#1f8a70"; // Green for sent
const COLOR_RECEIVED = "#202c33"; // Dark gray for received
const COLOR_TEXT = "#e9edef"; // Light text
```

## Light Theme Colors (iMessage style)

```tsx
const COLOR_BACKGROUND = "#ffffff";
const COLOR_SENT = "#007AFF"; // Blue for sent
const COLOR_RECEIVED = "#E9E9EB"; // Light gray for received
const COLOR_TEXT_SENT = "#ffffff";
const COLOR_TEXT_RECEIVED = "#000000";
```

````

### 3.2.k src/skills/3d.md

Source: `template-prompt-to-motion-graphics-saas/src/skills/3d.md`

````markdown
---
title: 3D Animation with ThreeCanvas
impact: MEDIUM
impactDescription: enables proper 3D scene setup and smooth animations
tags: 3d, three, threejs, webgl, spatial
---

## ThreeCanvas Setup

Always wrap 3D content in ThreeCanvas and include proper lighting.

**Incorrect (missing ThreeCanvas wrapper):**

```tsx
<mesh rotation={[0, frame * 0.02, 0]}>
  <boxGeometry args={[2, 2, 2]} />
  <meshStandardMaterial color="#4a9eff" />
</mesh>
```

**Correct (proper ThreeCanvas setup):**

```tsx
import { ThreeCanvas } from "@remotion/three";

<ThreeCanvas>
  <ambientLight intensity={0.5} />
  <pointLight position={[10, 10, 10]} />
  <mesh rotation={[0, frame * 0.02, 0]}>
    <boxGeometry args={[2, 2, 2]} />
    <meshStandardMaterial color="#4a9eff" />
  </mesh>
</ThreeCanvas>;
```

## Lighting Setup

Every 3D scene needs ambient + directional light for depth.

**Incorrect (no lighting - objects appear flat/black):**

```tsx
<ThreeCanvas>
  <mesh>
    <sphereGeometry args={[1, 32, 32]} />
    <meshStandardMaterial color="red" />
  </mesh>
</ThreeCanvas>
```

**Correct (proper lighting):**

```tsx
<ThreeCanvas>
  <ambientLight intensity={0.4} />
  <directionalLight position={[5, 5, 5]} intensity={0.8} />
  <mesh>
    <sphereGeometry args={[1, 32, 32]} />
    <meshStandardMaterial color="red" />
  </mesh>
</ThreeCanvas>
```

## Frame-Based Rotation

Use frame directly for smooth continuous rotation.

```tsx
const frame = useCurrentFrame();
const rotationY = frame * 0.02; // Adjust speed with multiplier

<mesh rotation={[0, rotationY, 0]}>
  <boxGeometry args={[2, 2, 2]} />
  <meshStandardMaterial color="#4a9eff" />
</mesh>;
```

## Floating/Hovering Animation

Use sine wave on Y position for organic floating effect.

```tsx
const frame = useCurrentFrame();
const floatY = Math.sin(frame * 0.1) * 0.3; // Amplitude 0.3, speed 0.1

<mesh position={[0, floatY, 0]}>{/* geometry and material */}</mesh>;
```

## Spring-Based Scale Entrance

Use spring() for bouncy 3D object entrances.

```tsx
const scaleProgress = spring({
  frame,
  fps,
  config: { damping: 12, stiffness: 100 },
});

<mesh scale={[scaleProgress, scaleProgress, scaleProgress]}>
  {/* geometry and material */}
</mesh>;
```

## Camera Positioning

Position camera at reasonable distance for scene visibility.

```tsx
<ThreeCanvas camera={{ position: [0, 0, 5], fov: 75 }}>
  {/* scene content */}
</ThreeCanvas>
```

````

### 3.2.l src/helpers/capture-frame.ts (render a still → send to the model)

Source: `template-prompt-to-motion-graphics-saas/src/helpers/capture-frame.ts`

````ts
import { renderStillOnWeb } from "@remotion/web-renderer";
import type { ComponentType } from "react";

interface CaptureConfig {
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
}

/**
 * Captures a frame from a Remotion composition and returns it as a base64 data URL.
 */
export async function captureFrame(
  Component: ComponentType,
  frame: number,
  config: CaptureConfig,
): Promise<string> {
  const blob = await (
    await renderStillOnWeb({
      composition: {
        component: Component,
        id: "frame-capture",
        width: config.width,
        height: config.height,
        fps: config.fps,
        durationInFrames: config.durationInFrames,
      },
      frame,
      scale: 0.5, // 960x540 - good enough for AI context
      inputProps: {},
    })
  ).blob({ format: "jpeg" });

  // Convert blob to base64 data URL
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return `data:image/jpeg;base64,${base64}`;
}

/**
 * Converts a File to a base64 data URL.
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

````

### 3.2.m src/examples/code/gold-price-chart.ts (the 'numbers' archetype: constants-first, staggered springs, y-axis)

Source: `template-prompt-to-motion-graphics-saas/src/examples/code/gold-price-chart.ts`

````ts
import { RemotionExample } from "./index";

export const goldPriceChartCode = `import { useCurrentFrame, useVideoConfig, AbsoluteFill, spring } from "remotion";

export const MyAnimation = () => {
  /*
   * Elegant animated bar chart showing gold prices with Y-axis, staggered spring animations, and full-width layout.
   */
  const frame = useCurrentFrame();
  const { fps, height: videoHeight } = useVideoConfig();

  const TITLE = "Gold Price 2024";
  const UNIT = "USD per troy ounce";
  const COLOR_BAR = "#D4AF37";
  const COLOR_TEXT = "#ffffff";
  const COLOR_MUTED = "#888888";
  const COLOR_BG = "#0a0a0a";
  const COLOR_AXIS = "#333333";

  const PADDING = 50;
  const HEADER_HEIGHT = 70;
  const LABEL_HEIGHT = 32;
  const BAR_GAP = 8;
  const BAR_RADIUS = 4;
  const TITLE_FONT_SIZE = 24;
  const LABEL_FONT_SIZE = 11;
  const VALUE_FONT_SIZE = 11;
  const AXIS_FONT_SIZE = 12;
  const STAGGER_DELAY = 5;
  const HEADER_START_FRAME = 0;
  const BARS_START_FRAME = 10;
  const SPRING_DAMPING = 18;
  const SPRING_STIFFNESS = 80;

  const data = [
    { month: "Jan", price: 2039 },
    { month: "Feb", price: 2024 },
    { month: "Mar", price: 2160 },
    { month: "Apr", price: 2330 },
    { month: "May", price: 2327 },
    { month: "Jun", price: 2339 },
    { month: "Jul", price: 2426 },
    { month: "Aug", price: 2503 },
    { month: "Sep", price: 2634 },
    { month: "Oct", price: 2735 },
    { month: "Nov", price: 2672 },
    { month: "Dec", price: 2650 },
  ];

  const minPrice = 1900;
  const maxPrice = 2800;
  const priceRange = maxPrice - minPrice;
  const chartHeight = videoHeight - (PADDING * 2) - HEADER_HEIGHT - LABEL_HEIGHT;
  const yAxisSteps = [1900, 2100, 2300, 2500, 2700];

  const headerOpacity = spring({
    frame: frame - HEADER_START_FRAME,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLOR_BG,
        padding: PADDING,
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ height: HEADER_HEIGHT, opacity: headerOpacity, marginBottom: 10 }}>
        <div style={{ color: COLOR_TEXT, fontSize: TITLE_FONT_SIZE, fontWeight: 600 }}>{TITLE}</div>
        <div style={{ color: COLOR_MUTED, fontSize: 14, marginTop: 4 }}>{UNIT}</div>
      </div>

      {/* Chart container */}
      <div style={{ display: "flex", alignItems: "flex-end", width: "100%", flex: 1 }}>
        {/* Y-Axis */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: chartHeight,
            paddingRight: 12,
            marginBottom: LABEL_HEIGHT,
          }}
        >
          {yAxisSteps.slice().reverse().map((step) => (
            <div
              key={step}
              style={{
                color: COLOR_MUTED,
                fontSize: AXIS_FONT_SIZE,
                textAlign: "right",
                minWidth: 40,
              }}
            >
              {step.toLocaleString()}
            </div>
          ))}
        </div>

        {/* Chart area */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: BAR_GAP,
            height: chartHeight,
            flex: 1,
            borderLeft: \`1px solid \${COLOR_AXIS}\`,
            borderBottom: \`1px solid \${COLOR_AXIS}\`,
            paddingLeft: 8,
          }}
        >
          {data.map((item, i) => {
            const delay = i * STAGGER_DELAY;
            const progress = spring({
              frame: frame - delay - BARS_START_FRAME,
              fps,
              config: { damping: SPRING_DAMPING, stiffness: SPRING_STIFFNESS },
            });

            const normalizedHeight = ((item.price - minPrice) / priceRange) * chartHeight;
            const height = normalizedHeight * progress;

            return (
              <div
                key={i}
                style={{
                  textAlign: "center",
                  flex: 1,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height,
                    backgroundColor: COLOR_BAR,
                    borderRadius: \`\${BAR_RADIUS}px \${BAR_RADIUS}px 0 0\`,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    paddingTop: 6,
                    minHeight: height > 0 ? 4 : 0,
                  }}
                >
                  {height > 30 && (
                    <span
                      style={{
                        color: COLOR_BG,
                        fontSize: VALUE_FONT_SIZE,
                        fontWeight: 600,
                        opacity: progress,
                      }}
                    >
                      {item.price.toLocaleString()}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    color: COLOR_MUTED,
                    fontSize: LABEL_FONT_SIZE,
                    marginTop: 8,
                    height: LABEL_HEIGHT - 8,
                  }}
                >
                  {item.month}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};`;

export const goldPriceChartExample: RemotionExample = {
  id: "gold-price-chart",
  name: "Gold Price Chart",
  description:
    "Animated bar chart with Y-axis labels and staggered spring animations",
  category: "Charts",
  durationInFrames: 150,
  fps: 30,
  code: goldPriceChartCode,
};

````

### 3.3 template-prompt-to-video (169★) — story script + images + ElevenLabs voiceover → timeline.json → 9:16 video

### 3.3.a README.md

Source: `template-prompt-to-video/README.md`

````markdown
# Remotion AI Video template

<p align="center">
  <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://cdn.webmonch.dev/img/remotion-template-promo.png">
      <img alt="Animated Remotion Logo" src="https://cdn.webmonch.dev/img/remotion-template-promo.png">
    </picture>
</p>

Using this template you can create high quality **AI videos for TikTok or Instagram**.

It includes a CLI that will generate a story script, images and voiceover using OpenAI and ElevenLabs.

## Getting started

Set up the demo story:

**Install Dependencies**

```console
npm install
```

**Start Preview**

```console
npm run dev
```

**Render video**

```console
npx remotion render
```

Or check out the [Remotion docs](/docs/render/). There are lots of ways to render.

## Creating a new story

You can easily create your own videos using provided CLI.

It will generate a script, images, voiceover and timeline based on your story title and topic. Topics that work well: history, ELI5, fun facts, science.

**Configure environment variables**

Create .env file with following env vars (you can also find them in .env.example):

```
OPENAI_API_KEY=
ELEVENLABS_API_KEY=
```

If you don't create an env file, you will be prompted for these variables when using CLI.

**Select voice**

In [`generateVoice()`](cli/service.ts) replace the voice id from ElevenLabs with the one you like. You can use their API for this. Alternatively, you can open any voice on their website and extract the Voice ID from the url (id comes after `voiceId=`).

```console
https://elevenlabs.io/app/voice-library?voiceId=aTxZrSrp47xsP6Ot4Kgd
```

**Generate story timeline**

```console
npm run gen
```

You will be prompted to enter story title and topic.

Title can be a vague one or long and detailed. Short title on the first slide will be generated based on it.

Topic can be e.g. History, Interesting facts, ELI5 etc.

After you enter title and topic, CLI will generate text, images and audio with timestamps, and combine all those into a timeline that van be used by this template to render a video.

## Technical overview

Remotion is rendering videos based on Timeline (timeline.json in project folder). The timeline is generated by CLI.

It consists of three blocks - Elements, Text and Audio.

Elements define slide backgrounds and include enter/exit transitions (e.g. blur) and animations that are applied while slide is active (e.g. scale, rotate).

Text and audio are self explanatory. The only special thing about them is that they are synced.

You can customize the generation of the timeline in [`createTimeLineFromStoryWithDetails()`](cli/timeline.ts) function.

## Deploying on a remote server

Current project needs light modification if you want to deploy it as a remote service.

Remotion renderer with template bundle should be deployed as per usual.

Then you have to update [`Root.tsx`](src/Root.tsx) to use timeline url that you will pass as a prop (instead of project name).

The last thing - you have to upload generated resources (images and audio) to server and use urls to them instead of file names when generating a timeline.

## Issues

Found an issue with Remotion? Upgrade Remotion to receive fixes:

```
npx remotion upgrade
```

Didn't help? [File an issue here](https://github.com/remotion-dev/remotion/issues/new).

## Contributing

The source of this template is in the [Remotion Monorepo](https://github.com/remotion-dev/remotion/tree/main/packages/template-ai-video).  
Don't send pull requests here, this is only a mirror.

## License

Note that for some entities a company license is needed. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).

## Credits

Thanks to [@webmonch](https://github.com/webmonch) for contributing this template!

````

### 3.3.b src/components/Word.tsx (fitText + BreeSerif + stroke layer)

Source: `template-prompt-to-video/src/components/Word.tsx`

````tsx
import { makeTransform, scale, translateY } from "@remotion/animation-utils";
import { loadFont } from "@remotion/google-fonts/BreeSerif";
import { fitText } from "@remotion/layout-utils";
import type React from "react";
import { AbsoluteFill, interpolate, useVideoConfig } from "remotion";

export const Word: React.FC<{
  enterProgress: number;
  text: string;
  stroke: boolean;
}> = ({ enterProgress, text, stroke }) => {
  const { fontFamily } = loadFont();
  const { width } = useVideoConfig();
  const desiredFontSize = 120;

  const fittedText = fitText({
    fontFamily,
    text,
    withinWidth: width * 0.8,
  });

  const fontSize = Math.min(desiredFontSize, fittedText.fontSize);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        top: undefined,
        bottom: 350,
        height: 150,
      }}
    >
      <div
        style={{
          fontSize,
          color: "white",
          WebkitTextStroke: stroke ? "20px black" : undefined,
          transform: makeTransform([
            scale(interpolate(enterProgress, [0, 1], [0.8, 1])),
            translateY(interpolate(enterProgress, [0, 1], [50, 0])),
          ]),
          fontFamily,
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

````

### 3.3.c src/components/Subtitle.tsx

Source: `template-prompt-to-video/src/components/Subtitle.tsx`

````tsx
import React from "react";
import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Word } from "./Word";

const Subtitle: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: {
      damping: 200,
    },
    durationInFrames: 5,
  });

  return (
    <AbsoluteFill>
      <AbsoluteFill>
        <Word stroke enterProgress={enter} text={text} />
      </AbsoluteFill>
      <AbsoluteFill>
        <Word enterProgress={enter} text={text} stroke={false} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default Subtitle;

````

### 3.4 template-audiogram (275★) — windowed audio data + paginated word-timed captions

### 3.4.a README.md

Source: `template-audiogram/README.md`

````markdown
# Remotion Audiogram Template

This template is for creating "audiograms". In other words, video clips from podcast episodes, or any other audio. It's a popular way of sharing audio snippets on social media.

[Example video](https://twitter.com/marcusstenbeck/status/1460641903326732300)

<p align="center">
  <img src="https://github.com/marcusstenbeck/remotion-template-audiogram/raw/main/Promo.png">
</p>

## Getting started

```
npm i
```

```
npx remotion studio
```

Start changing things like this:

- Adjust parameters in `src/Root.tsx` or in the Studio sidebar
- Replacing audio, cover and subtitles in the `public` folder

## How do I render my video?

Run this:

```console
npx remotion render
```

Or check out the [Remotion docs](/docs/render/). There are lots of ways to render.

## Where to get a transcript?

You can generate the captions or supply a .srt file or a .json file that follows the [`@remotion/captions`](https://remotion.dev/docs/captions/caption) format.

### Generate captions

- With the built-in transcription script using [`@remotion/install-whisper-cpp`](https://www.remotion.dev/docs/install-whisper-cpp/):

  ```console
  bun transcribe.ts
  # With Node.js: `npx tsx transcribe.ts`
  ```

  This will:

  - Ask for your audio file path (supports any ffmpeg format)
  - Ask for the speech start time (to avoid false triggers from background music, intro jingles or noise)
  - Generate captions.json in the public folder

- Alternatively, use [`@remotion/openai-whisper`](https://www.remotion.dev/docs/openai-whisper/openai-whisper-api-to-captions) to get captions from OpenAI Whisper into the right shape.

**Get it from a provider:**

- Your podcasting host might provide them for you.
- Descript makes transcription really easy.
- There are tons of other, paid solutions, like [Otter.ai](https://otter.ai), [Scriptme.io](https://scriptme.io) and [ListenRobo.com](https://listenrobo.com).

If you supply a .srt, make sure to export subtitles that are segmented by word rather than by sentence.

## Optimizing for long audio files

If your audio is long, make sure to pass a `.wav` file as audio.  
The template will use [`useWindowedAudioData()`](/docs/use-windowed-audio-data) to only fetch the data around the current time.

Otherwise, the waveform of the whole audio needs to be fetched, which may be slow.

## Docs

Get started with Remotion by reading the [fundamentals page](https://www.remotion.dev/docs/the-fundamentals).

## Help

We provide help [on our Discord server](https://discord.gg/6VzzNDwUwV).

## Issues

Found an issue with Remotion? Upgrade Remotion to receive fixes:

```
npx remotion upgrade
```

Didn't help? [File an issue here](https://github.com/remotion-dev/remotion/issues/new).

## Contributing

The source of this template is in the [Remotion Monorepo](https://github.com/remotion-dev/remotion/tree/main/packages/template-audiogram).  
Don't send pull requests here, this is only a mirror.

## License

Note that for some entities a company license is needed. Read [the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).

````

### 3.4.b src/Audiogram/Word.tsx (per-word fade + 0.25em rise)

Source: `template-audiogram/src/Audiogram/Word.tsx`

````tsx
import { Caption } from "@remotion/captions";
import React, { useMemo } from "react";
import { Easing, interpolate } from "remotion";
import { msToFrame } from "../helpers/ms-to-frame";

export const Word: React.FC<{
  readonly item: Caption;
  readonly frame: number;
  readonly transcriptionColor: string;
}> = ({ item, frame, transcriptionColor }) => {
  const opacity = interpolate(
    frame,
    [msToFrame(item.startMs), msToFrame(item.startMs) + 15],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const translateY = interpolate(
    frame,
    [msToFrame(item.startMs), msToFrame(item.startMs) + 10],
    [0.25, 0],
    {
      easing: Easing.out(Easing.quad),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const style: React.CSSProperties = useMemo(() => {
    return {
      display: "inline-block",
      whiteSpace: "pre",
      opacity,
      translate: `0 ${translateY}em`,
      color: transcriptionColor,
    };
  }, [opacity, transcriptionColor, translateY]);

  return <span style={style}>{item.text}</span>;
};

````

### 3.4.c src/Audiogram/Captions.tsx

Source: `template-audiogram/src/Audiogram/Captions.tsx`

````tsx
import { Caption } from "@remotion/captions";
import React, { useMemo, useRef } from "react";
import { useCurrentFrame } from "remotion";
import { msToFrame } from "../helpers/ms-to-frame";
import { CAPTIONS_FONT_SIZE } from "./constants";
import { FONT_FAMILY } from "./font";
import {
  filterCurrentlyDisplayedLines,
  layoutText,
} from "./get-number-of-lines-for-text";
import { getSentenceToDisplay } from "./sentence-to-display";
import { Word } from "./Word";

const useWindowedFrameCaptions = ({
  captions,
  windowStart,
  windowEnd,
}: {
  captions: Caption[];
  windowStart: number;
  windowEnd: number;
}) => {
  return useMemo(() => {
    return captions.filter(({ startMs, endMs }) => {
      return msToFrame(startMs) >= windowStart && msToFrame(endMs) <= windowEnd;
    });
  }, [captions, windowEnd, windowStart]);
};

export const PaginatedCaptions: React.FC<{
  readonly captions: Caption[];
  readonly startFrame: number;
  readonly endFrame: number;
  readonly linesPerPage: number;
  readonly subtitlesTextColor: string;
  readonly onlyDisplayCurrentSentence: boolean;
  readonly textBoxWidth: number;
}> = ({
  startFrame,
  endFrame,
  captions,
  subtitlesTextColor: transcriptionColor,
  onlyDisplayCurrentSentence,
  textBoxWidth,
}) => {
  const frame = useCurrentFrame();
  const windowRef = useRef<HTMLDivElement>(null);
  const windowedFrameSubs = useWindowedFrameCaptions({
    captions,
    windowStart: startFrame,
    windowEnd: endFrame,
  });

  const currentSentence = useMemo(() => {
    return getSentenceToDisplay({
      frame,
      onlyDisplayCurrentSentence,
      windowedFrameSubs,
    });
  }, [frame, onlyDisplayCurrentSentence, windowedFrameSubs]);

  const lines = useMemo(() => {
    return layoutText({
      captions: currentSentence,
      textBoxWidth,
      fontFamily: FONT_FAMILY,
      fontSize: CAPTIONS_FONT_SIZE,
    });
  }, [currentSentence, textBoxWidth]);

  const currentlyShownLines = filterCurrentlyDisplayedLines({
    lines,
    frame,
  });

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        paddingBottom: "20px",
      }}
    >
      <div ref={windowRef}>
        {currentlyShownLines.map((line) => (
          <div key={line.map((item) => item.text).join(" ")}>
            {line.map((item) => (
              <span
                key={item.startMs + item.endMs}
                id={String(item.startMs + item.endMs)}
              >
                <Word
                  frame={frame}
                  item={item}
                  transcriptionColor={transcriptionColor}
                />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

````

### 3.5 template-music-visualization (25★) — spectrum/waveform

### 3.5.a src/Visualizer/Spectrum.tsx

Source: `template-music-visualization/src/Visualizer/Spectrum.tsx`

````tsx
import { useWindowedAudioData, visualizeAudio } from "@remotion/media-utils";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { processFrequencyData } from "../helpers/process-frequency-data";

const spectrumContainer: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
  height: "30rem",
  alignItems: "center",
  justifyContent: "center",
  gap: "0px",
  overflow: "hidden",
  width: "100%",
};

export const Spectrum: React.FC<{
  readonly barColor: string;
  readonly numberOfSamples: number;
  readonly waveLinesToDisplay: number;
  readonly mirrorWave: boolean;
  readonly audioSrc: string;
}> = ({
  barColor,
  numberOfSamples,
  waveLinesToDisplay,
  mirrorWave,
  audioSrc,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const { audioData, dataOffsetInSeconds } = useWindowedAudioData({
    src: audioSrc,
    frame,
    fps,
    windowInSeconds: 30,
  });

  if (!audioData) {
    return <div style={spectrumContainer} />;
  }

  const frequencyData = visualizeAudio({
    fps,
    frame,
    audioData,
    numberOfSamples,
    optimizeFor: "speed",
    dataOffsetInSeconds,
  });

  const normalizedData = processFrequencyData(
    frequencyData,
    waveLinesToDisplay,
  );

  const frequenciesToDisplay = mirrorWave
    ? [...normalizedData.slice(1).reverse(), ...normalizedData]
    : normalizedData;

  return (
    <div style={spectrumContainer}>
      {frequenciesToDisplay.map((v, i) => {
        return (
          <div
            key={i}
            style={{
              flex: 1,
              backgroundColor: barColor,
              height: `${Math.min(100, 80 * v)}%`,
              borderRadius: "8px",
              margin: "0 0.3%",
              minWidth: "1px",
            }}
          />
        );
      })}
    </div>
  );
};

````

### 3.6 template-code-hike (222★) — Code Hike token transitions driven by useCurrentFrame

### 3.6.a src/CodeTransition.tsx

Source: `template-code-hike/src/CodeTransition.tsx`

````tsx
import { AnnotationHandler, HighlightedCode, Pre } from "codehike/code";
import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Easing, interpolate, useCurrentFrame, useDelayRender } from "remotion";

import {
  calculateTransitions,
  getStartingSnapshot,
  TokenTransitionsSnapshot,
} from "codehike/utils/token-transitions";
import { callout } from "./annotations/Callout";
import { applyStyle } from "./utils";

import { errorInline, errorMessage } from "./annotations/Error";
import { tokenTransitions } from "./annotations/InlineToken";
import { fontFamily, fontSize, tabSize } from "./font";

export function CodeTransition({
  oldCode,
  newCode,
  durationInFrames = 30,
}: {
  readonly oldCode: HighlightedCode | null;
  readonly newCode: HighlightedCode;
  readonly durationInFrames?: number;
}) {
  const frame = useCurrentFrame();

  const ref = React.useRef<HTMLPreElement>(null);
  const [oldSnapshot, setOldSnapshot] =
    useState<TokenTransitionsSnapshot | null>(null);
  const { delayRender, continueRender } = useDelayRender();
  const [handle] = React.useState(() => delayRender());

  const prevCode: HighlightedCode = useMemo(() => {
    return oldCode || { ...newCode, tokens: [], annotations: [] };
  }, [newCode, oldCode]);

  const code = useMemo(() => {
    return oldSnapshot ? newCode : prevCode;
  }, [newCode, prevCode, oldSnapshot]);

  useEffect(() => {
    if (!oldSnapshot) {
      setOldSnapshot(getStartingSnapshot(ref.current!));
    }
  }, [oldSnapshot]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    if (!oldSnapshot) {
      setOldSnapshot(getStartingSnapshot(ref.current!));
      return;
    }
    const transitions = calculateTransitions(ref.current!, oldSnapshot);
    transitions.forEach(({ element, keyframes, options }) => {
      const delay = durationInFrames * options.delay;
      const duration = durationInFrames * options.duration;
      const linearProgress = interpolate(
        frame,
        [delay, delay + duration],
        [0, 1],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        },
      );
      const progress = interpolate(linearProgress, [0, 1], [0, 1], {
        easing: Easing.bezier(0.17, 0.67, 0.76, 0.91),
      });

      applyStyle({
        element,
        keyframes,
        progress,
        linearProgress,
      });
    });
    continueRender(handle);
  });

  const handlers: AnnotationHandler[] = useMemo(() => {
    return [tokenTransitions, callout, errorInline, errorMessage];
  }, []);

  const style: React.CSSProperties = useMemo(() => {
    return {
      position: "relative",
      fontSize,
      lineHeight: 1.5,
      fontFamily,
      tabSize,
    };
  }, []);

  return <Pre ref={ref} code={code} handlers={handlers} style={style} />;
}

````

### 3.7 template-stargazer — not found under remotion-dev on 2026-11-02 (see repo table). Other remotion-dev templates present: template-helloworld (75★), template-next-app-dir (126★), template-react-router (40★), template-still (48★), template-overlay (19★), template-skia (25★), template-render-server (14★), template-vercel (12★), template-electron, template-element-library, template-empty, template-tailwind (obsolete).

---

## 4. HyperFrames (HeyGen) — heygen-com/hyperframes, 77,398★, Apache-2.0, commit 618c486 2026-11-02


**What it is, exactly.** An HTML-native video renderer. A composition is an `index.html` whose timed elements carry `class="clip" data-start data-duration` (seconds) and whose animation is one *paused* GSAP root timeline registered on `window.__timelines["<data-composition-id>"]` (other runtimes — CSS animations, Lottie, Three.js, Anime.js, WAAPI, canvas via a `render(t)` proxy tween — plug in through 'frame adapters'). The renderer (`@hyperframes/engine`, Puppeteer) opens the page in headless Chrome (`chrome-headless-shell`), seeks the timeline to each frame using Chrome's `HeadlessExperimental.beginFrame` CDP API, screenshots it, and pipes frames to FFmpeg (`@hyperframes/producer` also mixes `<audio>` tracks with FFmpeg). Determinism rules: no `Date.now()`, no unseeded `Math.random()`, no network fetches, no `repeat: -1`. Default output 1920×1080 @ 30 fps; `data-fps` on the root sets the frame rate and the CLI render `--fps` accepts 1–240 (so 60 fps is supported: herk-edit-kit's showreel skill renders 1920×1080 60fps). Sub-scenes live in `compositions/*.html` inside `<template>` and are mounted with `data-composition-src`. Requirements: Node 22+, FFmpeg.

**How an agent uses it.** Install the skills (`npx hyperframes skills update` — core set `/hyperframes`, `/hyperframes-cli`, `/hyperframes-registry`, `/media-use`; or Claude Code plugin `claude plugin marketplace add heygen-com/hyperframes && claude plugin install hyperframes@hyperframes`), then the loop is: `npx hyperframes init <dir>` → write HTML → `npx hyperframes lint` → `npx hyperframes check --json` (headless-Chrome gate: runtime errors, layout, motion, WCAG contrast) → `npx hyperframes snapshot --at 1,3,5` and READ the PNGs → `npx hyperframes preview --background` (Studio) → `npx hyperframes render --quality looks -o out.mp4` (`draft`/`delivery`; `cloud render`, `lambda render`, `cloudrun render`). ~450 registry blocks/components via `npx hyperframes catalog --query ...` / `npx hyperframes add <name>`. The scaffolded project gets a CLAUDE.md/AGENTS.md (quoted below) telling the agent to always run `npm run check` and snapshot before replying.

**Repo-internal skills** (`.claude/skills/` and `.agents/skills/`, marked `metadata.internal: true`, used by HeyGen's own team): `motion-doctrine`, `cut-the-curve` (18 KB transition catalog), `seam-craft`, `oversized-cursor`, `captions-overlay`, `changelog-video`. `motion-doctrine` and `captions-overlay` are quoted in full below; `cut-the-curve` is too long and is summarized by its route-map entries.

**Comparison to Remotion for a 60 fps motion-graphics reel (from the HyperFrames README and the hyperframes-vs-remotion guide, verified):** README table — Authoring: HTML+CSS+seekable animation vs React components · Build step: none vs bundler · Agent handoff: plain HTML vs JSX project · Library-clock animations: 'Seekable, frame-accurate via adapters' vs 'Wall-clock animation patterns need care' · Distributed rendering: local + AWS Lambda vs Remotion Lambda · License: Apache 2.0 vs source-available Remotion License. The guide's own benchmark (same launch video by an agent): Remotion 12 min 30 s, 10 TS files / 1,037 lines; HyperFrames 11 min 50 s, 4 HTML files / 822 lines; both at 30 fps. The guide says: Remotion's 'pure function of the frame number' model is 'simpler to hold in your head'; HyperFrames 'breaks quietly if you don't' follow paused-timeline/no-wall-clock rules; pick Remotion 'if your team already writes React' (components, charting libs carry over), HyperFrames if you start from a website/HTML/exported design or want an agent to author compositions, and for Apache-2.0 with no seat count.

**Pros for The Signal/Q-ROSITY:** GSAP timeline authoring is natural for kinetic type and blocky-character rigs; the `check`/`snapshot`/`keyframes --shot` toolchain gives the agent much better eyes than Remotion's CLI (motion assertions in `<name>.motion.json`, contrast audit, phone-width sheets); a 450-item registry; Apache-2.0. **Cons:** you lose React composition and `@remotion/*` packages (captions utilities, layout-utils fitText, transitions, Lambda maturity); GSAP eases/springs are not frame-pure so determinism depends on discipline; the ecosystem is 2026-new; HyperFrames' own skills push a 'house look' (and the cloud/HeyGen media integrations are paid). **Verdict for a React dev at 60 fps:** stay on Remotion for the render pipeline, but copy HyperFrames' *rules* — the contract list, the motion.md numbers, the spec.md 'BANNED by default' list, the vertical.md safe-band numbers, and the snapshot-then-look work loop — into your own CLAUDE.md/skills.

### 4.1 AGENTS.md (repo root)

Source: `heygen-com/hyperframes/AGENTS.md`

````markdown
# Hyperframes

Open-source video rendering framework: write HTML, render video.

## Skills

This repo ships AI agent skills via [vercel-labs/skills](https://github.com/vercel-labs/skills). Install them before writing compositions — they encode framework-specific patterns that generic docs don't cover. **Default to the core set** (`/hyperframes`, `/hyperframes-cli`, `/hyperframes-registry`, `/media-use`); install everything only when the user explicitly asks for the full set.

```bash
npx hyperframes skills update           # default: installs/refreshes the core set plus anything already installed
npx hyperframes skills                  # all 7 published skills at once
npx skills add heygen-com/hyperframes   # interactive picker (terminal only; repo-internal skills are excluded by default)
```

Make any video by asking for it; the `/hyperframes` skill carries the contract and the references (film, captions, overlays, motion, look). Read it first.

- `/hyperframes` — read first for any request to make, edit, animate or render a video, motion graphic, captions or overlays with HyperFrames (HTML rendered to video). Holds the render contract and the work loop, and points to the references for format, motion, look, captions, whole films and storyboards.
- `/hyperframes-cli` — the HyperFrames CLI by job: scaffold, check, look at frames, edit the timeline, preview, render locally or in the cloud, publish, project history; plus reading its JSON and recovering from build or render failures.
- `/hyperframes-registry` — about 450 ready-made blocks and components installed as editable source. Use before hand-building any named visual; also for `hyperframes add` and `catalog`.
- `/media-use` — get or make any media for a video (music, sound effects, images, voiceover, avatar and generated video, transcripts, cutouts, colour grades) with HeyGen or free local tools, and mix placed audio.
- `/figma` — bring Figma into a video: rendered assets, brand tokens, components, storyboard frames as reconstructed motion.
- `/slideshow` — a presentation, pitch deck or interactive deck. Output is a navigable deck, not a rendered MP4.
- `/remotion-to-hyperframes` — bring existing video code or footage into HyperFrames (Remotion first; also Motion Canvas, Lottie, Three.js, canvas, or renders from other tools) and verify it frame by frame against the original.

## Issue and PR triage

Read [TRIAGE.md](TRIAGE.md) before classifying issues, advertising contribution work, or triaging PRs. Check current source and overlapping PRs; keep difficulty, readiness, and ownership separate. Apply changes only within the task's authorization and verify the resulting GitHub state.

## Build & Test

```bash
bun install     # Install dependencies (NOT pnpm — do not create pnpm-lock.yaml)
bun run build   # Build all packages
bun run test    # Run all tests
```

Packages load each other through their `exports`. Under Node, core, parsers,
lint and studio-server resolve to `dist/`, and player always loads its built
bundle. Run `bun run build` once in a fresh worktree, before any package's
tests or typecheck. After editing a package that another package imports, run
that package's `build` again before the dependent package's tests. Core's
`src/generated/` is git-ignored build output: if you see
`Cannot find module '../generated/runtime-inline'`, run
`bun run build:hyperframes-runtime`.

One file: `bun run --cwd packages/<pkg> test <path>`. Each package's `test`
script picks its runner (vitest in most, `bun test` in aws-lambda and
gcp-cloud-run). Producer is the exception: a file that imports `bun:test` runs
with `bun test <file>`, any other with `bunx vitest run <file>`. Root `scripts/*.test.mjs` run through `bun run test:scripts`,
which is an explicit list in `package.json`. CI's test-reachability check fails
any test file that no runner reaches.

### Linting & Formatting

Uses **oxlint** and **oxfmt** (not eslint, not prettier, not biome).

```bash
node_modules/.bin/oxlint <files>        # Lint
node_modules/.bin/oxfmt <files>         # Format
node_modules/.bin/oxfmt --check <files> # Check formatting (CI / pre-commit)
```

Always lint and format changed files before committing. Lefthook pre-commit hooks enforce this automatically.

### Composition Validation

After creating or editing any `.html` composition:

```bash
npx hyperframes lint       # Static HTML structure check
npx hyperframes check      # Browser gate (headless Chrome — runtime errors, layout, motion, WCAG contrast)
```

Both must pass before previewing or considering work complete.

## Project Structure

```
packages/
  cli/                  → hyperframes CLI (create, preview, lint, render)
  core/                 → Types, parsers, generators, linter, runtime, frame adapters
  engine/               → Seekable page-to-video capture engine (Puppeteer + FFmpeg)
  player/               → Embeddable <hyperframes-player> web component
  producer/             → Full rendering pipeline (capture + encode + audio mix)
  shader-transitions/   → WebGL shader transitions for compositions
  studio/               → Browser-based composition editor UI (read packages/studio/AGENTS.md first)
registry/
  blocks/               → Installable sub-composition scenes (50+)
  components/           → Installable effects and snippets
  examples/             → Starter project templates
docs/                   → Mintlify documentation site (hyperframes.heygen.com)
skills/                 → AI agent skill definitions
```

## Key Conventions

- **Package manager**: bun (not pnpm, not npm for workspace operations)
- **Commit format**: Conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`)
- **TypeScript**: Avoid `any` and `as T` assertions. Prefer type guards and narrowing.
- **Compositions**: HTML files with `data-*` attributes. Clips need `class="clip"`. Register one paused GSAP root timeline per composition on `window.__timelines`. Scene timelines manually added to that root must not be paused, or they will not advance when the root is seeked.
- **Frame Adapters**: Animation runtimes plug in via the seek-by-frame adapter pattern. GSAP is the primary adapter.
- **Deterministic rendering**: No `Date.now()`, no unseeded `Math.random()`, no render-time network fetches.
- **Docs ship with the change**: a PR that adds or changes a CLI command, flag, or user-visible behavior updates `docs/` in the same PR. A new command also goes in "Find your command" in `docs/packages/cli.mdx` (CI checks it).

## Documentation

- Docs: https://hyperframes.heygen.com/introduction
- Catalog (50+ blocks): https://hyperframes.heygen.com/catalog/blocks/data-chart

````

### 4.2 CLAUDE.md (repo root)

Source: `heygen-com/hyperframes/CLAUDE.md`

````markdown
# Hyperframes

Open-source video rendering framework: write HTML, render video.

## Skills

This repo ships 7 AI agent skills via [vercel-labs/skills](https://github.com/vercel-labs/skills). Install them before writing compositions — they encode framework-specific patterns that generic docs don't cover. **Default to the core set** (`/hyperframes`, `/hyperframes-cli`, `/hyperframes-registry`, `/media-use`); `/slideshow`, `/remotion-to-hyperframes` and `/figma` install on demand. Install all 7 only when the user explicitly asks for the full set.

```bash
npx hyperframes skills update                         # default: installs/refreshes the core set plus anything already installed
npx hyperframes skills                                # all 7 published skills at once — only on explicit request
npx skills add heygen-com/hyperframes                 # interactive picker; internal skills require INSTALL_INTERNAL_SKILLS=1 for discovery
npx skills add heygen-com/hyperframes --all           # excludes internal skills unless INSTALL_INTERNAL_SKILLS=1
npx skills add heygen-com/hyperframes --skill <name>  # a named match installs regardless of metadata.internal (bare name, no leading slash)
```

> **Warning:** Never run `npx skills add ... --all` from inside a HyperFrames checkout: it selects the OpenClaw target, whose `skills/` directory is the repo's own `skills/`, and removes each existing `skills/<name>` destination before linking. A fresh clone restores tracked source, but uncommitted work under `skills/` does not recover. Run it from an empty directory or from your own project root. This happens regardless of `metadata.internal`.

`skills add` resolves the skills.sh registry blob, which can lag `main` by hours, so a freshly added skill may be a little behind. `npx hyperframes skills update` installs from the current `main`; prefer it when freshness matters.

Make any video by asking for it; the `/hyperframes` skill carries the render contract and the references (format, runtimes, motion, look, captions, film, overlays, storyboards). The skills carry knowledge, not process. The README skills section mirrors this list; keep them in sync (see "Skill catalog maintenance" below).

- `/hyperframes` — read first for any request to make, edit, animate or render a video, motion graphic, captions or overlays with HyperFrames (HTML rendered to video). Holds the render contract and the work loop, and points to the references for format, motion, look, captions, whole films and storyboards.
- `/hyperframes-cli` — the HyperFrames CLI by job: scaffold, check, look at frames, edit the timeline, preview, render locally or in the cloud, publish, project history; plus reading its JSON and recovering from build or render failures.
- `/hyperframes-registry` — about 450 ready-made blocks and components installed as editable source: transitions, overlays, titles, kinetic type, captions, charts, maps, 3D, camera moves. Use before hand-building any named visual; also for `hyperframes add` and `catalog`.
- `/media-use` — get or make any media for a video (music, sound effects, images, icons, logos, voiceover, avatar and generated video, transcripts, cutouts, colour grades and looks) with HeyGen or free local tools, and mix placed audio. Also for footage that looks dark, flat or dull, or should be stylized or hidden.
- `/figma` — bring Figma into a video: rendered assets, brand tokens, components, storyboard frames as reconstructed motion, shaders and connector-assisted motion. Use when the person pastes a figma.com link or asks to use a Figma design, frame, logo or brand.
- `/slideshow` — a presentation, pitch deck or interactive deck with discrete slides, fragment reveals, branching, hotspot navigation and presenter mode with speaker notes; also converts an existing page into a deck. Output is a navigable deck, not a rendered MP4.
- `/remotion-to-hyperframes` — bring existing video code or footage into HyperFrames (Remotion first; also Motion Canvas, Lottie, Three.js, canvas, or renders from other tools) and verify it frame by frame against the original.

## Skill catalog maintenance

When adding a new skill, or substantially renaming / repurposing an existing one, update all agent-facing discoverability surfaces in lockstep:

1. The skill list above (CLAUDE.md) AND the skill list in the root `AGENTS.md` AND the `## Skills` section in `README.md` AND `docs/guides/skills.mdx` (rendered at [hyperframes.heygen.com/guides/skills](https://hyperframes.heygen.com/guides/skills)) AND the two setup pages that compress the same descriptions — `docs/prompting/overview.mdx` ("One-time setup") and `docs/quickstart.mdx`. Out-of-date entries silently kill discovery. This list is also the sync set for a **changed contract**, not just an added or renamed skill: a reworded `description:` has to be pushed to every surface or the compressed copies start asserting the opposite of the skill.
2. The scaffolded project template `packages/cli/src/templates/_shared/CLAUDE.md` + `AGENTS.md` — written into every `hyperframes init` project, so a stale entry there ships to users. The two template files must stay byte-identical.
3. The routing surface for "make a video" requests is the References table and closing line of `skills/hyperframes/SKILL.md`. A new reference or skill that a request should reach gets a row or a mention there.
4. Keep the same grouping on every surface: the core set (`/hyperframes`, `/hyperframes-cli`, `/hyperframes-registry`, `/media-use`) first, then the on-demand skills (`/figma`, `/slideshow`, `/remotion-to-hyperframes`).
5. Skill count appears in the README and CLAUDE.md intro lines ("7 AI agent skills…") — update on add/remove. The `docs/guides/skills.mdx` page and the CLI templates deliberately omit a count to avoid drift; keep them count-free.

The skill's own `SKILL.md` frontmatter `description:` is the source of truth for the one-line "use when" blurb; copy from there into the catalog rather than paraphrasing.

## Build & Test

```bash
bun install     # Install dependencies (NOT pnpm — do not create pnpm-lock.yaml)
bun run build   # Build all packages
bun run test    # Run all tests
```

### Linting & Formatting

Uses **oxlint** and **oxfmt** (not eslint, not prettier, not biome).

```bash
node_modules/.bin/oxlint <files>        # Lint
node_modules/.bin/oxfmt <files>         # Format
node_modules/.bin/oxfmt --check <files> # Check formatting (CI / pre-commit)
```

Always lint and format changed files before committing. Lefthook pre-commit hooks enforce this automatically.

### Composition Validation

After creating or editing any `.html` composition:

```bash
npx hyperframes lint       # Static HTML structure check
npx hyperframes check      # Browser gate (headless Chrome — runtime errors, layout, motion, WCAG contrast)
```

Both must pass before previewing or considering work complete.

## Project Structure

```
packages/
  cli/                  → hyperframes CLI (create, preview, lint, render)
  core/                 → Types, parsers, generators, linter, runtime, frame adapters
  engine/               → Seekable page-to-video capture engine (Puppeteer + FFmpeg)
  player/               → Embeddable <hyperframes-player> web component
  producer/             → Full rendering pipeline (capture + encode + audio mix)
  shader-transitions/   → WebGL shader transitions for compositions
  studio/               → Browser-based composition editor UI (read packages/studio/AGENTS.md first)
registry/
  blocks/               → Installable sub-composition scenes (50+)
  components/           → Installable effects and snippets
  examples/             → Starter project templates
docs/                   → Mintlify documentation site (hyperframes.heygen.com)
skills/                 → AI agent skill definitions
```

## Key Conventions

- **Package manager**: bun (not pnpm, not npm for workspace operations)
- **Commit format**: Conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`)
- **TypeScript**: Avoid `any` and `as T` assertions. Prefer type guards and narrowing.
- **Compositions**: HTML files with `data-*` attributes. Clips need `class="clip"`. Register one paused GSAP root timeline per composition on `window.__timelines`. Scene timelines manually added to that root must not be paused, or they will not advance when the root is seeked.
- **Frame Adapters**: Animation runtimes plug in via the seek-by-frame adapter pattern. GSAP is the primary adapter.
- **Deterministic rendering**: No `Date.now()`, no unseeded `Math.random()`, no render-time network fetches.
- **Docs ship with the change**: a PR that adds or changes a CLI command, flag, or user-visible behavior updates `docs/` in the same PR. A new command also goes in "Find your command" in `docs/packages/cli.mdx` (CI checks it).

## Documentation

- Docs: https://hyperframes.heygen.com/introduction
- Catalog (50+ blocks): https://hyperframes.heygen.com/catalog/blocks/data-chart

````

### 4.3 skills/hyperframes/SKILL.md (the render contract + work loop)

Source: `heygen-com/hyperframes/skills/hyperframes/SKILL.md`

````markdown
---
name: hyperframes
description: Read first to make, edit, animate or render any video with HyperFrames (HTML rendered to video), including launch films, explainers, music videos, charts, maps, vertical clips, title cards, captions and overlays. Holds the render contract, the work loop and what each kind of video needs.
---

**Plugin installs:** Before setup or freshness commands, follow [plugin execution rules](references/plugin-installation.md) when this skill is inside a HyperFrames plugin.

# HyperFrames

HyperFrames renders HTML to video by seeking a paused timeline frame by frame, so every render is identical; the person edits the same files in the Studio preview. Use it unless another framework or a plain browser recording is asked for. Run the CLI as `npx hyperframes <command>` (`/hyperframes-cli`); at the start of a new video, `npx hyperframes usage --json` reports the person's remaining plan usage (say "unknown" when it is).

`index.html` is the root composition: it declares the video's variables and mounts one scene per sub-composition from `compositions/`. Media and fonts live in `assets/`. A new project: `npx hyperframes init <dir>`. A website as the subject: `npx hyperframes capture <url> --json`.

Build what was asked: no voiceover or captions and no new aspect ratio unless the request or the source calls for them; a film over ~15 s that tells something gets music and sound on its visible actions unless the person asked for silence (`references/sound.md`). A new video is 1920×1080 at 30 fps. A question, a hold or a loose idea gets an answer or a proposal, not an edit. Before hand-writing a named effect, transition, caption style, chart or card, search the registry (`/hyperframes-registry`). Any media (a presenter or avatar, footage, voice, music): `/media-use`, which says when HeyGen is needed and what is free. Show real things from their source (the product's screens, the brand's logo, a real place's imagery); draw only what has none.

## Contract

`npx hyperframes check --json` reports most violations with a `Fix:` line.

1. Every timed element has `class="clip"`, `data-start` and `data-duration` in seconds, and shows over `[start, start + duration)`: land an end state just before its end. `data-track-index` is only a Studio lane; paint order is `z-index`.
2. The video's length is the root's `data-duration`: overrun is cut, an early end holds the last frame.
3. Each composition builds one paused timeline and registers it after its tweens: `window.__timelines["<data-composition-id>"] = tl`.
4. No `Date.now()`, unseeded `Math.random()`, network fetches, timers or `repeat: -1`. Everything visible is a function of timeline time.
5. Never tween `display`, `visibility` or `autoAlpha` on a `.clip`; animate a child.
6. No CSS `transform` on an element GSAP transforms; animate transforms, not `left`/`top`/`width`/`height`.
7. Never `play()`, `pause()` or seek media. A `<video>` keeps its sound with `data-has-audio="true"`, else it is `muted`; music, voice, replacement sound and J/L cuts are a separate `<audio>`.
8. Every `<audio>` has an `id` or it is left out of the mix. No `crossorigin` on media. Time a `<video>` or its wrapper, never both.
9. Only the bundled fonts (`references/format.md`) resolve by name; any other family needs `@font-face` to a file in `assets/fonts/`.
10. Asset paths: `assets/...` (no leading `/`), in sub-compositions too.
11. Grades, grain, blur and vignettes on footage go through `npx hyperframes media-treatment` (`/media-use`), never CSS filters.
12. A scene file puts its styles, markup and scripts inside `<template>` and styles its root as `#root`. Intended overflow or overlap: `data-layout-allow-overflow`, `data-layout-allow-overlap`.

## Keep it editable

Studio edits the tags you write.

- One scene per sub-composition, short readable ids; the root holds only scene hosts, media and audio.
- Timed elements are written in the HTML, not made by script, each with a stable `id`.
- Copy, brand colours and swappable media are variables (`data-var-text`, `data-var-src`, `var(--id)`).
- One kind per track: `data-track-kind="graphics"` on scene and overlay hosts, `captions` on the one host that holds every caption group.
- Content stays inside the 90% action-safe box, captions and key text inside 80% title-safe; Studio draws the guides, never add them.

## Work loop

- An existing project: `npx hyperframes timeline --json` shows what plays when; before any change, `npx hyperframes history --since mine --who <you>` shows what the person changed since your last turn: build on it (`/hyperframes-cli`).
- A new film over ~15 s that tells something: its type's file (below), then `references/story.md`: three storylines that are three different films, in words only; the person picks unless they asked for the file or no stops. Then `SPEC.md` (`references/spec.md`): every adjective as a number, the defaults banned by name, the shots by frame.
- After your last edit: `npx hyperframes check --json`; fix every error, weigh every warning. A film: `npx hyperframes snapshot --review` and `references/review.md`, ending in `REVIEW.md`. A small edit: snapshot what you changed (`--at`, `--range`, `--composition`) and look before you reply.
- Render when the person approves the Studio preview, asks for the file or asks for no stops, after your check and review pass; otherwise stop at the preview and wait.

## The HyperFrames desktop app

Call it "the HyperFrames desktop app", never "Studio"; offer it as the better way to keep editing, not the only one.

- Before the delivery render of a new video, open the Studio preview, even in no-questions mode, and say they can edit there. If `preview` printed "Keep editing by chatting with Framey", add that the **Edit with Framey** button opens the app.
- After the delivery render, pass on its Framey line in your own words: offer to run the `hyperframes open` it names or give its download link; else say nothing (autonomous: the delivery note).
- When any command says to run `catch-up`, run `npx hyperframes catch-up [dir]` before your next change; what it lists is their work, not a new request.

## What to read

| The request | Read |
| --- | --- |
| Launch, promo, feature | `references/types/launch.md` |
| Explainer, tutorial | `references/types/explainer.md` |
| Music video | `references/types/music.md` |
| Chart, numbers | `references/types/data.md` |
| Vertical or social clip | `references/types/vertical.md` |
| 3D, simulation, generative | `references/types/3d.md` |
| Character, mascot, story short | `references/types/character.md` |
| A real place or map; a website, PR or script; kinetic type | `references/film.md` |
| Captions; cards over a talking head | `references/captions.md`; `references/overlays.md` |
| Motion: eases, titles, cuts, punch-ins, speed, holds | `references/motion.md` |
| Scenes, attributes, media, lint; GSAP, Lottie, 3D, canvas | `references/format.md`; `references/runtimes.md` |

Decks: `/slideshow`. Remotion source: `/remotion-to-hyperframes`. Figma: `/figma`. Installing, refreshing or upgrading skills and the pinned CLI: `references/skill-lifecycle.md`.

````

### 4.4 skills/hyperframes-cli/SKILL.md

Source: `heygen-com/hyperframes/skills/hyperframes-cli/SKILL.md`

````markdown
---
name: hyperframes-cli
description: The HyperFrames CLI by job - scaffold, check, look at frames, edit the timeline, preview, render locally or in the cloud, publish, project history - plus reading its JSON and recovering from build or render failures.
---

**Plugin installs:** Before setup or freshness commands, follow [plugin execution rules](../hyperframes/references/plugin-installation.md) when this skill is inside a HyperFrames plugin.

# HyperFrames CLI

Run `npx hyperframes <command>` unless the project gives a wrapper; then use the wrapper. It needs Node.js 22+ and FFmpeg. Every command has `--help`; most take `--json`, and a failure prints `✗ …`, a `Fix:` line and exits non-zero.

## Commands by job

| Job | Commands |
| --- | --- |
| Start | `init <dir>` (blank; `--example <name>` only when asked), `capture <url>` |
| Read a project | `info`, `compositions`, `timeline --json`, `docs <topic>` |
| Check it | `lint` while writing; `check --json` as the gate (lint, runtime, layout, contrast) |
| Look at it | `snapshot` (`--at <t,…>`, `--range START,END`, `--composition <id>`, `--zoom`, `--angle`, `--against <video>`), `keyframes`, `compare`, `audio` |
| Edit the timeline | `timeline` with `move`, `trim`, `split`, `set`, `duplicate`, `delete`, `apply`, `undo`, `ids` |
| Reuse | `catalog`, `add` (`/hyperframes-registry`) |
| Media and sound | `media-treatment`, `grade-compare`, `remove-background`, `tts`, `transcribe`, `beats`, `normalize-audio` (`/media-use`) |
| Show and ship | `preview`, `present` (`/slideshow`), `render`, `publish`, `cloud`, `lambda`, `cloudrun` |
| Desktop app | `open`, `catch-up` |
| Upkeep | `doctor`, `browser`, `upgrade`, `skills`, `usage`, `clean`, `feedback` |

`validate`, `inspect` and `layout` are deprecated aliases of `check`; `events` is telemetry for skills' own scripts. Don't run them.

## The loop

1. Write, then `npx hyperframes lint` after the first pass and after structural changes.
2. `npx hyperframes check --json` and fix every error. While a lint error remains the layout and contrast audits don't run; "0 samples" means nothing was checked. Contrast failures carry a `suggestedColor`. A finding at a single sample (an entrance in flight) is info; a 3 s+ video with no visible change fails `sweep_static`.
3. `npx hyperframes snapshot` and read the PNGs (under `.hyperframes/artifacts/snapshots/`): that is how you see the video. With sub-compositions, snapshot a midpoint of every scene; tiny unstyled content or a missing hero is a mount defect (`../hyperframes/references/format.md`).
4. `npx hyperframes preview --background`, check the URL answers 200, give the person the project URL and wait, unless they asked for the file or for no stops. Passing checks alone is not a reason to render.
5. Time to render (step 4): `npx hyperframes render --quality looks -o out.mp4` (`draft` while iterating, `delivery` for the final; paid plan: `cloud render --fps <data-fps> --quality high -o out.mp4`). Confirm the file is non-empty and its `ffprobe` duration matches the root `data-duration`, then look at decoded frames.

"This element" or the current selection: `npx hyperframes preview --context --json --context-fields selection`; `no-selection` means ask them to click it.

## Edit the timeline

These are the edits Studio itself makes, so the result stays in Studio's shape.

- `timeline --json` lists clips with absolute `absStart`/`absEnd`, owning `file` and the `#id` ref the edit commands take (`timeline ids` stamps missing ids).
- `timeline move|trim|split|set|duplicate|delete <ref> … --plan --json` previews one edit; run it again without `--plan`. `--start`, `--end`, `--duration` set one edge or the length.
- An edit is refused when the clip would overlap a neighbour (`--overwrite`, or move the neighbour first) or end past its composition: raise the root's `data-duration` first. No command changes `data-duration`.
- Several edits at once: a JSON file such as `[{"verb": "move", "ref": "#outro", "time": "9"}]`, then `timeline apply plan.json --json`. Each run prints a `receipt`; save it and `timeline undo receipt.json` reverts it.

<!-- history (trial): remove this block together with the command -->

## Project history

Every write is kept and can be undone. At the start of a turn, `npx hyperframes history begin --who <you> --label "<plan>"`, then `history --since mine --who <you>` to see what the person changed; build on their edits. A check failed or they say it got worse: `history undo --who <you>`, never hand-edit back. End the turn with `history end`.

<!-- /history (trial) -->

## Render where

| Need | Command |
| --- | --- |
| Local | `render --quality looks -o out.mp4` (`draft`, `delivery`) |
| Reproducible container | `render --docker --strict -o out.mp4` |
| Batch from variables | `render --batch rows.json -o "renders/{name}.mp4"` |
| Hosted, no local Chrome or FFmpeg | `cloud render` (`references/cloud.md`) |
| Your own AWS or GCP | `lambda render`, `cloudrun render` (`references/lambda.md`, `references/cloudrun.md`) |

A 30 s film renders in a minute or two: run it in the foreground. Detach only a render longer than your tool's timeout (`HYPERFRAMES_RENDER_DETACHED=1`, its own group, output to a log) and wait with `until grep -qE 'Render (complete|failed)' render.log; do sleep 5; done`, never `pgrep -f`, which matches its own loop and waits until the tool times out.

After a verified render, send one `feedback --rating`, plus a report for anything the person asked for that HyperFrames can't do, unless telemetry is off: `references/feedback.md`.

## When a command fails

| Symptom | Fix |
| --- | --- |
| Chrome missing or won't start | `npx hyperframes browser ensure`; `doctor --json` always exits 0, gate on `.ok` |
| A heavy page isn't ready in time | Raise `--timeout` on `check` or `snapshot` |
| Unusual codec looks blank | Keep `--proxy` on (the default) |
| Render slow on Linux | The summary's second line says `screenshot` + `software gpu`: the slow path |
| `capture` fails or writes `BLOCKED.md` | Take nothing from its partial files; retry into a new `-o` folder |
| Disk tight | `clean --dry-run`, then `clean`; never delete `.hyperframes` (it holds history) |

## References

Read the row before running its command.

| Commands | Read |
| --- | --- |
| `init`, `capture`, `skills` | `references/init-and-scaffold.md` |
| `lint`, `check`, motion sidecars, `snapshot` | `references/lint-validate-inspect.md` |
| `compare`, `grade-compare`, `render --batch` | `references/compare-and-batch.md` |
| `beats` | `references/beats.md` |
| `preview`, `play`, `render`, `publish`, Studio context | `references/preview-render.md` |
| `doctor`, `browser` | `references/doctor-browser.md` |
| `auth`, `cloud`, template variables | `references/cloud.md` |
| `lambda`, `cloudrun` | `references/lambda.md`, `references/cloudrun.md` |
| `info`, `upgrade`, `compositions`, `timeline`, `docs`, `usage`, telemetry | `references/upgrade-info-misc.md` |
| `--strict` flags, run ids, `clean`, shader lint, JSON paths | `references/conventions.md` |
| `keyframes` | `../hyperframes/references/motion.md` (Seeing motion) |

````

### 4.5 skills/hyperframes-registry/SKILL.md

Source: `heygen-com/hyperframes/skills/hyperframes-registry/SKILL.md`

````markdown
---
name: hyperframes-registry
description: About 450 ready-made HyperFrames blocks and components installed as editable source - transitions, overlays, titles, kinetic type, captions, charts, map overlays, 3D, camera moves. Use it before hand-building any named visual (CRT scanlines, glitch, film grain, a chart); also for hyperframes add and catalog.
---

**Plugin installs:** Before setup or freshness commands, follow [plugin execution rules](../hyperframes/references/plugin-installation.md) when this skill is inside a HyperFrames plugin.

# HyperFrames registry

Starting from an item is faster and usually better than writing the effect yourself, and an installed item is ordinary source in your project: change it, cut it down, restyle it.

## Find and install

There is no `hyperframes registry` command; searching is `catalog`, installing is `add`.

```bash
npx hyperframes catalog --query "<what the beat should do, in English>" --json
npx hyperframes add <name> --json        # prints the written files and the mount snippet
```

- Query in English even when the video is not: the catalog is indexed in English, and another script returns `No searchable words in query`, which is not a gap.
- Search is local and sends nothing. The default `words` tier only finds items that reuse your words; `--on-device` ranks by meaning after a one-time ~33 MB download. Offer that download and let the person decide; never enable it silently. The `--json` envelope names the tier that answered.
- Narrow with `--type block|component` and `--tag <tag>`. `add <tag>` installs every block with that tag; dependencies install first. `add` needs the network even for an item installed before; search works offline from the cached manifest.
- Nothing fits: report it before you hand-build, on either tier. `catalog --query` prints the line pre-filled (`report_gap` in `--json`): `npx hyperframes feedback --search-miss "<query>" --wanted "<the move you needed>" --tier <tier>`. Describe the effect, not an item name you imagined.

Tiers, `dropped` and `unindexed`, stale indexes, offline behaviour: `references/search.md`.

## What's in it

| Blocks: a scene with its own timeline | Examples |
| --- | --- |
| Transitions | `beat-freeze-cut`, `chromatic-radial-split`, `cinematic-zoom` |
| Overlays and lower thirds | `camcorder-hud`, `editorial-flash-overlay`, `lt-clean-bar` |
| Title cards and kinetic type | `canopy-part-title`, `code-slice-hero` |
| Social, chat and UI cards | `ai-chat-reveal`, `chatgpt-exchange` |
| Code, charts, data and maps | `code-diff`, `bar-chart-race`, `data-chart` |
| 3D, shader and backgrounds | `app-showcase`, `aurora`, `blob` |

| Components: a snippet merged into your scene | Examples |
| --- | --- |
| Motion primitives and text effects | `agent-cursor`, `blur-in`, `bottom-up-letters` |
| Caption styles | `caption-clip-wipe`, `caption-editorial-emphasis` |
| Camera moves | `camera-shake`, `camera-scan-gate` |
| Product demo and UI props | `before-after-wipe`, `browser-device-stage` |
| Textures, particles and effects | `ascii-render-pass`, `grain-overlay` |

## Wiring

- **Block**: installs to `compositions/<name>.html`. Mount it with `data-composition-src`, `data-composition-id` matching the block's own id, `data-start` and the `data-duration` you need; the snippet `add` prints is the starting point. `references/wiring-blocks.md`.
- **Component**: installs to `compositions/components/<name>.html`. Copy its markup, `<style>` and script into your scene, and follow its comment block if it hooks into your timeline. `references/wiring-components.md`.
- Take the largest unit that fits, then edit it. Keep an installed item's ids prefixed as they are, so two items can't collide.
- An item keeps its own variables; set them for one mount with `data-variable-values` on its host (`add --vars '{"title":"…"}'` writes that), and point its colour and font variables at your brand's.
- Beat-synced blocks take hit times from `npx hyperframes beats --json`: the beat times minus the mount's `data-start`.
- Install paths come from `hyperframes.json` (`references/install-locations.md`).

## Contributing

Authoring a new block or component for an upstream PR: `references/contributing.md`, starter templates in `references/templates.md`, quality bar in `references/component-quality-bar.md`.

````

### 4.6 skills/media-use/SKILL.md

Source: `heygen-com/hyperframes/skills/media-use/SKILL.md`

````markdown
---
name: media-use
description: Get or make any media for a HyperFrames video - music, sound effects, images, icons, logos, voiceover, avatar and generated video, transcripts, cutouts, colour grades and looks - with HeyGen or free local tools, and mix placed audio. Also for footage that looks dark, flat or dull, or should be stylized or hidden.
---

**Plugin installs:** Before setup or freshness commands, follow [plugin execution rules](../hyperframes/references/plugin-installation.md) when this skill is inside a HyperFrames plugin.

# Media in HyperFrames

Media lands as a local file in the project's `assets/` with a ledger record; renders never fetch. One verb finds or makes it:

```bash
npx hyperframes media-use resolve --type <type> --intent "<what you need>" --project <dir>
```

It prints one line, `resolved <id> → <path> (<type>, <metadata>)`. List reusable assets first with `--candidates` and judge the fit yourself; reuse, ingest (`--from`) and adopt are in `references/resolve.md`.

## Where it comes from

| Need | Free | HyperFrames credits | Local or the person's own key (only when they ask) |
| --- | --- | --- | --- |
| Music (`bgm`) | HeyGen catalog of 10k+ tracks (signed in) | Generated track | Local MusicGen |
| Sound effects (`sfx`) | Openverse (credit CC BY sounds); 21 bundled offline | | |
| Images, icons | HeyGen asset search, 75k+ (signed in) | Generated images | Local FLUX (mflux), if installed |
| Logos (`logo`) | theSVG, GitHub avatar, favicon; never redrawn | | |
| Voiceover (`voice`) | HeyGen Voice Turbo (signed in) | Other HeyGen voices, voice cloning | `npx hyperframes tts` (Kokoro on device) |
| A presenter speaking | | Avatar video (`--type video`) | Local LTX for generic clips, if installed |
| Transcripts | `npx hyperframes transcribe` (Parakeet or whisper) | | |
| Cutouts | | `heygen background-removal` | `npx hyperframes remove-background` |
| Grades, LUTs, looks | `npx hyperframes media-treatment` | | |

**Sign in.** Every time a request needs a HeyGen model or the catalog, run `npx hyperframes auth status` first. Not signed in: tell the person in one line that sign-in is free and gives Voice Turbo, the music catalog and asset search, ask them to type an exclamation mark and `npx hyperframes auth login` in the prompt, and wait until they say it is done. Use local tools only when the person asks, not as a fallback.

**Host apps.** Inside an app with its own media tools, use those first. When `HEYGEN_API_BASE` is set, the host pays: don't ask for a sign-in; relay a refused call's message as written and stop.

**HeyGen.** `npx hyperframes media-use generate` makes images, shots, talking photos, voices and music on the sign-in alone. Helpers and direct recipes need the [`heygen` CLI](https://developers.heygen.com/cli); if it is missing, give the link and wait until they say it is installed. Direct `heygen` recipes bill that CLI's own login, not HyperFrames: use them only when that separate payer is selected.

**Credits.** Plan for the best result: don't swap in cheaper or free options, or drop items, unless the person asks to save cost. Never tell the person prices, estimates or what a run used; `--plan` is for you. A credit limit the person sets: pass what is left of it as `--max-credits` on every `generate`, minus each call's `credits`, and never go past it. When a step won't fit (a `--plan` over what is left, or a refused call), say what doesn't fit and ask before dropping or shrinking it. A refused call names a `billing` command: tell the person why, ask them to run it the same way, then retry the step.

## Looks on real footage

Feedback that footage is dark, flat or dull, should feel retro or printed, needs a face hidden, or needs a reveal is media intent. Inspect the real `<img>`/`<video>`, pick one intent, and follow `references/media-treatments.md`; persist with `npx hyperframes media-treatment`, never a CSS, SVG or `.cube` stand-in.

## Offer once, never add silently

When you build or review a piece, scan once for concrete gaps (on-screen text with no voiceover, emoji standing in for icons, placeholder images, silent cuts, 10 s+ with no music, a colour cast) and offer the specific fixes in one ask. No signal, no suggestion; respect "leave it".

## Where to look

| Task | Read |
| --- | --- |
| Resolve, reuse, adopt, ingest, flags | `references/resolve.md` |
| Grading, LUTs, `grade-compare` | `references/grading.md` |
| Voiceover, music, sound effects, captions, transcription | `references/audio.md` |
| Cut, reframe or transform media; direct `heygen` recipes | `references/operations.md` |
| Treatments, realtime effects, overlays, reveals | `references/media-treatments.md` |
| Install, sign-in, credentials, `--provider`, `--local-only`, RAM ladders | `references/setup-providers.md` |
| `media-use generate`, HeyGen transcription, prices | `references/heygen.md` |
| Fades, gain, ducking, automation, effects, buses on placed tracks | `references/mixing.md` |
| Local commands: grade, cutout, loudness, beats | `references/local.md` |
| Remembered preferences | `references/memory.md` |

````

### 4.7 packages/cli/src/templates/_shared/CLAUDE.md (written into every `hyperframes init` project; AGENTS.md is byte-identical)

Source: `heygen-com/hyperframes/packages/cli/src/templates/_shared/CLAUDE.md`

````markdown
# HyperFrames Composition Project

This folder is a [HyperFrames](https://hyperframes.heygen.com) video: HTML, CSS and seekable
animations (GSAP by default) that the `hyperframes` CLI previews in the browser and renders to
MP4.

## Skills — read these first

**Invoke the relevant skill before writing or modifying compositions.** Skills encode framework-specific patterns (e.g., `window.__timelines` registration, `data-*` attribute semantics, shader-compatible CSS rules) that generic web docs don't cover, so compositions written without them break.

**Doing anything with HyperFrames?** Start at `/hyperframes`. Make any video by asking for it; the `/hyperframes` skill carries the contract and the references (each kind of film, story, motion, look, sound, review, captions, overlays). Read it first, especially when there's no project context to orient you.

- `/hyperframes` — read first for any request to make, edit, animate or render a video, motion graphic, captions or overlays. Holds the render contract and the work loop.
- `/hyperframes-cli` — the CLI by job: scaffold, check, look at frames, edit the timeline, preview, render, publish, project history.
- `/hyperframes-registry` — ready-made blocks and components installed as editable source. Search it before hand-building any named visual.
- `/media-use` — get or make any media (music, sound effects, images, voiceover, avatar and generated video, transcripts, cutouts, colour grades) and mix placed audio.
- `/figma` — bring a Figma design, frame, logo or brand into a video.
- `/slideshow` — a presentation or pitch deck. Output is a navigable deck, not a rendered MP4.
- `/remotion-to-hyperframes` — bring existing video code or footage into HyperFrames (Remotion first; also Motion Canvas, Lottie, Three.js, canvas, or renders from other tools) and verify it frame by frame against the original.

**Changing how real footage or images look or reveal?** Load `/media-use` and read its `references/media-treatments.md` before editing, even when the request only says dark, flat, boring, retro, private, or “make the reveal cooler.” It governs how footage is treated, never whether media may be used. Use canonical media treatments and seek-safe motion; do not improvise equivalent CSS/SVG filters or overlays.

> **Tailwind v4 projects** (`hyperframes init --tailwind`): see `hyperframes-cli/references/init-and-scaffold.md` (Tailwind).

> **Using a HyperFrames plugin?** Load skills from that installed bundle and follow
> its `hyperframes/references/plugin-installation.md` execution rules. Update via
> the plugin manager, not the standalone commands below.
>
> **Standalone skill missing or stale?** Run `npx hyperframes skills update <name>` to install/refresh
> the specific skill you need, or bare `npx hyperframes skills update` to refresh the core set plus
> everything already installed — neither pulls the full set. Restart the agent session so
> newly installed skills load.

## Commands

```bash
npm run dev          # human-operated foreground preview (blocks until stopped)
npx hyperframes preview --background  # agent-safe persistent Studio preview
npx hyperframes preview --status      # verify the persistent preview is listening
npx hyperframes preview --stop        # stop it when review is finished
npm run check        # lint + runtime + layout + motion + contrast (one command)
npx hyperframes snapshot --at 1,3,5  # PNG frames at those seconds, to look at before rendering
npm run render       # render to MP4
npm run publish      # publish and get a shareable link
npx hyperframes lint --verbose  # include info-level findings
npx hyperframes lint --json     # machine-readable output for CI
npx hyperframes docs <topic> # reference docs in terminal
```

> **Agents must use `npx hyperframes preview --background` for Studio handoff.** Do not rely
> on a shell/tool `run_in_background` wrapper around `npm run dev`: that foreground process
> remains owned by the invoking session and can disappear while the browser stays open,
> leaving refreshes at `ERR_CONNECTION_TIMED_OUT`. Verify with `preview --status`, keep it
> alive through review, and stop it explicitly with `preview --stop` afterward.

> **Back from the desktop app.** Once this project was opened in the HyperFrames desktop app, run `npx hyperframes catch-up` before your next change here: it lists what the person asked Framey in the app and which files changed since.

> **Pinned CLI version.** These scripts pin an exact `hyperframes@X.Y.Z` so this project re-renders identically over time. Weeks later that pin lags fixes shipped since. To move up: `npx hyperframes@latest upgrade --project . --check` (shows the delta), then `npx hyperframes@latest upgrade --project .` to rewrite the pins. Always unpinned — the pinned script re-runs the old version against itself.

## Documentation

**For quick reference**, use the local CLI docs command (no network required):

```bash
npx hyperframes docs <topic>
```

Topics: `data-attributes`, `gsap`, `compositions`, `rendering`, `examples`, `troubleshooting`

**For full documentation**, discover pages via the machine-readable index — do NOT guess URLs:

```
https://hyperframes.heygen.com/llms.txt
```

## Project Structure

- `index.html` — main composition (root timeline)
- `compositions/` — sub-compositions referenced via `data-composition-src`
- `meta.json` — project metadata (id, name)
- `transcript.json` — whisper word-level transcript (if generated)

## Linting — ALWAYS RUN AFTER CHANGES

After creating or editing any `.html` composition, **always** run the full check before considering the task complete:

```bash
npm run check
```

Fix all errors before presenting the result. Warnings should be reviewed before rendering.

Then look at what you changed: `npx hyperframes snapshot --at <seconds>` (or `--range START,END`, `--composition <id>`) at the moments you edited, and read the frames before you reply. A passing check does not show how it looks.

## Key Rules

1. Every timed element needs `data-start` and a duration. `data-start` is what marks it as timed; `data-track-index` is an optional Studio display lane the render never reads
2. Give timed visual elements `class="clip"`. The framework keys visibility off `data-start`, not the class, but the shared `.clip` CSS is what gives a scene its full-frame box, and `lint` warns without it
3. Register one paused root timeline per composition on `window.__timelines`:
   ```js
   window.__timelines = window.__timelines || {};
   window.__timelines["composition-id"] = gsap.timeline({ paused: true });
   ```
   Scene timelines manually added to this root must not be paused. A paused
   child does not advance when the root is seeked. The runtime activates
   registered composition siblings, not arbitrary nested scene timelines.
4. A video with sound keeps it on the `<video>` (`data-has-audio="true"`, no `muted`). Use a separate `<audio>` for music, voiceover, replacement audio, J/L cuts, or audio detached in Studio. Silent footage and b-roll: `muted`.
5. Sub-compositions use `data-composition-src="compositions/file.html"` to reference other HTML files
6. Only deterministic logic — no `Date.now()`, no `Math.random()`, no network fetches

````

### 4.8 skills/hyperframes/references/motion.md (measured eases, durations, titles, holds, cuts, 'defaults that look generated')

Source: `heygen-com/hyperframes/skills/hyperframes/references/motion.md`

````markdown
# Motion

## Motion craft

Measured frame by frame from the official HyperFrames launch films. These are defaults: a reference the person gave, or a Moment that does otherwise on purpose, wins for its own beat.

- **Moves**: a fast move takes 0.3–0.6 s and carries motion blur on its own ease, peaking at its fastest frame: 6–12 px on text-sized elements, 15–20 px full-frame, horizontal-only on a horizontal move. One move is one tween.
- **Render-time blur**: for fast 2D movers, `data-motion-blur="on"` on the composition root smears them along their real path in preview and render (opt-in; also `data-motion-blur-shutter` for a longer smear, 360 is strong; `-events="on"` when the motion is set from a timeline callback such as a `render(t)` function). Suggest it when the person asks for blur or a filmic look and the piece moves fast. It picks how to draw on its own: a cheap per-element filter for translation, the truer capture for spins and zooms; it works over WebGL and in any Chrome, and is off only for HDR and distributed renders. Opt a subtree out with `data-motion-blur="off"`, e.g. a seam that already carries its own blur. After adding it run `hyperframes check`. Guide: /guides/motion-blur.
- **Arrive slow, leave clean**: long-tailed ease-outs on arrivals; landing takes longer than leaving. An exit is one smooth motion, never slide, stop, then leave. Entrances that are too snappy read as glitches; slowing the whole video by about a second often fixes it.
- **Ease by role**: an arrival lands on a long tail (`expo.out`, `power4.out`), a camera move or a colour flood eases both ways (`power2.inOut`), a zoom through or an exit accelerates (`power3.in`). The same `power2.out` at 0.5 s on everything is the flat default that makes a film feel generated. Linear only for rotation, progress and constant speed that is the point.
- **Springs** are named by damping ratio: 1.0 never bounces, 0.7-0.85 reads premium, 0.4-0.6 playful, under 0.3 a cartoon. Position and size may bounce; opacity and colour never do. GSAP's `elastic.out(1, 0.5)` and `back.out(1.4)` are the nearest built-ins; a closed-form spring of `t` keeps any frame renderable on its own.
- **Exits** are 40-50% shorter than their entrances. **Overlap**: the next element starts when the previous is 30-50% done; fully sequential looks robotic, all at once looks cheap. **Stagger**: letters a frame apart, words 60-120 ms, list items 40-80 ms.
- **Beat grid**: frames per beat = fps × 60 / BPM; compute each beat from its index and round it, never add a rounded beat repeatedly (at 128 BPM and 30 fps that drifts 2 frames in 32 beats). Cut on the beat, change the layout on the bar.
- **Cuts**: cut at the fastest frame of a move, with matching direction and speed on both sides. A click into a new screen is a match cut on the click's rebound; the new screen comes in slightly large and settles.
- **Titles**: a landed title is dead still; the motion moves to the next element, the camera or the world behind. Vary the entrance within a film, never a fade and slide-up for each:
  - per word: `blur(6px)` → 0 and opacity 0 → 1 in 0.13 s, 0.067 s apart, no translate;
  - per word from light grey to ink, 0.07–0.1 s apart, no position change;
  - the whole line blurring in, 8 px → 0 in 0.13–0.2 s;
  - per letter for a name, 0.1 s apart, opacity 0.3 → 1 with a slight blur;
  - behind the subject: the title between the plate and a matte of the person;
  - one word of the sentence rolling through options like a slot machine, about 0.1 s a roll.
- **Holds**: a line the viewer must read holds about 0.5 s plus 0.3 s a word, the film's last line at least 2 s; a one- or two-word chapter line may hold 0.4 s. Then exit with a blur-out and fade of 0.13–0.25 s, word by word, or with the scene's move.
- **Title size**: 4–9% of the frame height, one or two lines; quiet lines at 2.5–4% against hero words that fill 60–90% of the width. One highlighted word in the accent colour, which carries meaning.
- **Rhythm**: contrast speeds. Montages cut every 0.13–0.8 s; a demo holds one framing for 7–10 s while the UI acts; shots average 1.8–3 s with motion inside them. Hold 0.3–0.75 s before the payoff, which plays at normal speed.
- **Continuous motion that works**: the product's UI working, footage playing, a character acting, a 3D world turning, a slow orbit of a background stage (3–5° a second).
- **Defaults that look generated**: breathing, floating or pulsing loops standing in for motion on titles and UI; titles that keep sliding or scaling after they land; a slow creeping scale on a title or a slow push late in a scene; bounce on UI; click rings; every scene entering the same way; every element fading and sliding up. A character's idle and overshoot are acting, not these (`types/character.md`).

## Transitions with a cause

Use 3–5 kinds in a film, each caused by something on screen. Hard cuts belong inside a scene (punch-ins); at most a third of the seams between beats are hard cuts, and worlds never crossfade into each other. Measured on the official films:

| Transition               | How it is built                                                                                                                                                                     |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Zoom through a button    | the camera tracks to the button with blur (0.6 s), then the button scales from ~8% to ~250% of the frame in 0.35 s, strong ease-in; its fill becomes the next frame                 |
| Object becomes the world | a pill or card grows past the frame in 0.65 s, ease-in-out, its radius shrinking; what was around it blurs ~15 px and fades in 0.3 s; the new content fades in while it still grows |
| Morph                    | one container widens into the next (icon card → prompt box, ~110 → ~880 px in 0.2 s `power3.out`) with a horizontal blur 12 → 0                                                     |
| Carry across             | the result shrinks 1 → 0.6 with blur peaking at 6 px mid-move and lands inside the next app as it builds around it                                                                  |
| Colour flood             | the hero object stays while the whole ground changes colour in ~0.4 s `power2.inOut`                                                                                                |
| Whip                     | a horizontal or vertical smear of 0.13–0.3 s; the arriving element lands blurred and sharpens in ~0.13 s                                                                            |
| Iris from the click      | `clip-path: circle()` opens from the clicked point onto the next world in 0.15 s                                                                                                    |
| Dip cut                  | the outgoing frame darkens ~40% for 3 frames before a hard cut, so the cut reads as meant                                                                                           |
| Blur swap on one stage   | out: opacity → 0 with ~8 px blur in 0.13–0.2 s; in: blur → 0 in 0.13 s; the ground never cuts                                                                                       |

Registry versions: `npx hyperframes catalog --tag transition --json`.

| The person says        | Change                                                                         |
| ---------------------- | ------------------------------------------------------------------------------ |
| "too fast"             | Slow every zoom and pan to 0.7× of its speed, nothing else                     |
| "speed this up"        | Speed the content and shorten the beat by the same amount; later beats move up |
| "the titles move"      | Land them, then hold them dead still until they leave                          |
| "it feels like slides" | Enter the next scene through an object on screen; cut a move mid-flight        |

## The right mechanism

| Request                                 | Mechanism                                                                                                                  |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Punch-in, zoom, pan, Ken Burns, reframe | Tween `scale` and `x`/`y` on a wrapper inside the clip, never on the timed media element; chain the states on one timeline |
| Crop or mask reveal                     | Tween `clip-path` or a mask on an inner wrapper; source time is untouched                                                  |
| Constant speed change                   | `data-playback-rate` on the media, 0.1–10 (picture and pitch-preserved sound)                                              |
| Speed ramp                              | A `rate` lane in `data-automation` on the media (`t` in clip seconds, `v` 0.1–10); it overrides the constant rate          |
| Hold or freeze                          | Hold a final frame or a finished scene; a freeze mid-source needs a still exported first and placed as its own clip        |

Ready-made moves: `npx hyperframes catalog --tag camera --json`, or `catalog --query "<the move>" --tag motion-primitive --json`.

## Seeing motion

The whole-film pass (beat sheet, cuts, phone width, the craft warnings) is `review.md`. For one move:

- `npx hyperframes keyframes --json [--selector '#id'] [--runtime all]` lists keyframes and motion paths (GSAP, CSS, anime.js): property, time, value, ease.
- `npx hyperframes keyframes --shot motion.png --selector '#id'` draws the real element's samples over time with its path (9 samples; `--samples N`). `--layout strip` for motion in place, `--from`/`--to` for one stretch, `--angle iso|top|side|'yaw,pitch'` for 3D, `--ghost` for a `<canvas>`.
- `npx hyperframes snapshot --range 2,4 --frames 8` samples one stretch; `--composition <id>` samples one scene; `--at <t,…>` exact instants; `--zoom '#id'` a sharp crop; `--angle iso` depth and overlap.
- Against a reference video: `snapshot --at <t,…> --against ref.mp4` writes a side-by-side sheet.
- Assert intent instead of eyeballing it: a `<name>.motion.json` next to the composition makes `check` verify it on the seeked timeline, as errors (`motion_appears_late`, `motion_out_of_order`, `motion_off_frame`, `motion_frozen`):

```json
{
  "assertions": [
    { "kind": "appearsBy", "selector": "#headline", "bySec": 0.5 },
    { "kind": "before", "a": "#headline", "b": "#cta" },
    { "kind": "staysInFrame", "selector": ".card" },
    { "kind": "keepsMoving", "withinSelector": ".scene" }
  ]
}
```

## Common faults

| Symptom                          | Usual cause                                                                                                                                    |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Blank or frozen scene            | Timeline registered before an async build finished, `visibility` tweened on a `.clip`, or a host id that differs from its scene's timeline key |
| Stutter or drift between renders | Layout measured in `onUpdate`, `requestAnimationFrame` or clock time; two timelines on one property                                            |
| Jump at a cut                    | Outgoing and incoming states differ at the seam: snapshot just before and after it                                                             |
| Ease looks off at a handoff      | Speeds don't match across the seam: mirror the ease (`power3.in` out, `power3.out` in)                                                         |

Studio's keyframe diamonds and motion-path handles rewrite the GSAP script in the composition file, so the person may have changed motion since you wrote it.

````

### 4.9 skills/hyperframes/references/types/vertical.md (9:16 safe band 168–1330 px, first second, pacing)

Source: `heygen-com/hyperframes/skills/hyperframes/references/types/vertical.md`

````markdown
# Vertical and social clips (9:16)

Made at 1080×1920 when the request or the platform says vertical; a landscape film is not squeezed into it but recomposed.

## The platform's own UI

The app draws over the frame. On 1080×1920: nothing in the top 168 px (status and search bar); every word and the product inside the band from 168 to 1330 px; below 1330 px (caption, handle, buttons) only texture or decoration; no text under the right-hand action rail. Ads and some apps reserve more at the bottom; check the platform the clip is for. Burned-in captions sit at the bottom of the band (`../captions.md`).

## The first second

- Frame 0 is the thumbnail and the hook: a face, the result, or one bold line already on screen. Never black, never a logo.
- The viewer decides in about a second whether to stay: the change or the question arrives in the first beat.
- Many viewers watch muted: speech is captioned, and the picture carries the hook without sound.

## Layout

- One subject, centred, stacked vertically; landscape layouts (side-by-side panels, wide charts) are rebuilt as a vertical sequence.
- Type is larger than in landscape (titles about ×1.35, `../overlays.md`); nothing meant to be read under 28 px, and a fixed word limit per line (about 8 Chinese characters or 5 English words for a claim): cut words, never shrink.
- Talking heads: punch-ins on emphasis, B-roll cut on the sentence, the face never under a card (`../overlays.md`).

## Pacing

Faster than landscape: shots of 1–2 s, a new beat every 2–4 s, the payoff before the swipe. A loop that cuts from the last frame back to the first is a choice, not a default.

````

### 4.10 skills/hyperframes/references/types/data.md (numbers, charts)

Source: `heygen-com/hyperframes/skills/hyperframes/references/types/data.md`

````markdown
# Numbers, charts and data stories

## One number at a time

- A number is earned by the scene before it, then made physical: a count that becomes a skyline, a share that becomes a crowd.
- The number is the biggest thing on screen. Tabular figures (`font-variant-numeric: tabular-nums`) so a count-up does not jitter; a count-up runs 1.2–1.6 s, then holds.
- Real data only, from the source, rounded the same way everywhere, with a small source line on screen. One data module drives every figure in the film.

## Charts as pictures

- Build a chart in reading order: the frame and axis, a reference line, then the data drawing in, then one annotation on the point that matters. Annotate on the mark; no legends.
- Highlight one series, grey the rest. A chart with one thing to say says it in its title.
- The same object carries across beats: a bar becomes the ground of the next scene, a line becomes the road the camera follows.
- The camera can dive into the one value that matters, then the rest falls away.
- Registry charts first (`npx hyperframes catalog --query chart --json`); drive any chart library from a GSAP tween's `onUpdate`, never its own transitions (`../runtimes.md`).

## Tells for this type

A grid of KPI cards; a dashboard; a pie chart; every number counting up at once; numbers with no source.

````

### 4.11 skills/hyperframes/references/types/character.md (mascots, rigs, boiling lines)

Source: `heygen-com/hyperframes/skills/hyperframes/references/types/character.md`

````markdown
# Characters, mascots and story shorts

A character gives every transition a cause and gives the film its jokes: it carries the result into the player, rejects its own first try, reads the manual. After Effects characters come in through Lottie (`../runtimes.md`).

## Acting

- Mood changes go through a take: anticipation, a squash, the new face, a settle. A face never snaps from one state to the next.
- Squash and stretch, anticipation, overshoot and follow-through belong to the character. Here an idle breath or blink is life, not a tell; the tells about breathing and bounce in `../motion.md` are about titles and UI.
- Code moves every part at once, on one curve, by the same amount. Offset the parts (head leads, arms follow), vary the amounts, and never move both arms, both eyes or a crowd in unison.
- Contact sells it: feet on the ground, props held by the hand, eyes on what they look at.

## Reads

Each action is one read. Lead the eye to where it will happen, play the action fast, and let its meaning land slowly: hold the reaction. A sign or caption that repeats what the action already shows is the classic failure.

## Build

- A rig is a set of parameters over time: position, squash, arm angles, an eye state and a mouth state per moment. Write mood changes as keyed states (`[[t0,"normal"],[t1,"scared"]]`) the rig eases between.
- Hand-drawn life: redraw the outlines about 12 times a second with a jitter seeded by `Math.floor(t * 12)`, so the line boils while the character holds still, and every render matches.
- A long piece is one chapter per sub-composition, all drawing from the same rig and helpers.

````

### 4.12 skills/hyperframes/references/spec.md (SPEC.md template, adjectives→numbers, BANNED by default)

Source: `heygen-com/hyperframes/skills/hyperframes/references/spec.md`

````markdown
# The spec

Adjectives are where the default look lives. Given "premium, modern, clean", the model fills every gap with its own defaults, and they look the same in every run: a dark void, a glow, small type floating in the middle, everything fading in. Every adjective you turn into a number is a decision taken back from those defaults.

So before any scene, write `SPEC.md` at the project root: the film as a director's brief to yourself, with a number wherever you would have written an adjective. Build from it, check against it, and change it when a review changes the film.

The spec serves the story, never the other way round (`story.md`). A look that turns the story's things into abstract shapes has failed, however striking the frame.

## The template

```text
GOAL:    what the viewer feels or does at the end, one sentence
OUTPUT:  HyperFrames, W x H, fps
TIME:    seconds x fps = frames; BPM and frames per beat when there is music
LOOK:    ground (hex, texture and its amount), ink, one accent and where it may appear;
         display face + weight + size in px + tracking, body face the same;
         the medium (paper and ink, photographs, product UI, glass, clay, 3D studio) with its numbers;
         light and depth: shadow offset, blur and opacity, grain %, vignette %
OBJECTS: every thing the story needs the viewer to recognise (a mirror, a clock, a phone, a person),
         drawn with the material and details that make it read without a label: a mirror is
         silvered glass with a bright edge and a mount, not a bar
MOTION:  eases by role as named curves (enter, move, exit, camera); springs as damping ratio;
         durations and staggers in frames
SHOTS:   one line per shot: frame range, the one hero move, what the viewer reads (with its window),
         the sound, and how it hands off to the next shot
BANNED:  the defaults below, plus anything this film must not become
QA:      the frames to check, and what each must show
```

## Turning words into numbers

| The word  | Becomes                                                                                                                                |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| premium   | a material with numbers: satin paper with 2% grain, a product on a seamless sweep with a 0.55 contact shadow, chrome at roughness 0.05 |
| modern    | a camera and a type system: a 30-frame push on one ease, a display face at 9% of the frame height with -2% tracking                    |
| clean     | a grid and a ration: 12 columns, 96 px margins, the accent on one word per shot                                                        |
| dynamic   | cuts on the beat, a layout change on the bar (every 4 beats), one hero move per shot                                                   |
| playful   | springs at damping 0.45-0.6 on position and scale (never on opacity or colour), 10-30% exaggerated poses                               |
| cinematic | a lens and a light: a 35 mm framing, a key from upper left, a rim from behind, 6% vignette                                             |

## Composition numbers

- The hero of a shot fills at least 40% of the frame's height or width. A small object in the middle of an empty frame is never a shot; push in, crop, or give it a world.
- One hero move per shot. Secondary moves travel 50-70% as far, start 100-200 ms after it, and everything else holds still.
- In a story film every shot moves the story: something happens that causes the next shot. Lines read as cause and effect ("so…", "which means…"), not slogans.
- An information card (B-roll over a talking head, a data beat, a vertical explainer card) is different: its information is on screen within about 2.5 s, then it holds, so any paused frame reads as a finished poster.
- Something new every 2-4 s across the film; a new layout every bar when there is music.
- Text meant to be read: at least 28 px at 1080 (2.6% of the short side), held 0.5 s + 0.3 s a word. Too many words: cut words, never shrink type.

## BANNED by default

These are where generated video lands when nothing else is decided. Each is banned unless the brand's own material or the person's reference uses it, and then only as they use it:

- a black or dark navy void as the ground, with small elements floating in its middle;
- glow, bloom, neon, lens flares, glowing orbs and rings; floating particles as decoration;
- purple or blue gradients, mesh gradients, glass cards;
- a cream or off-white paper ground with a serif display, italic accent words, numbered "01 / 02" labels, small monospace caps labels, pill-shaped chips and buttons;
- everything centred; everything fading in at once; every element fading and sliding up;
- text that moves while it is read; titles that keep drifting after they land;
- corner labels, frame borders, corner brackets, HUD readouts as decoration;
- three cards in a row, KPI grids, a title over a dimmed screenshot;
- the logo docked in a corner.

After the first render, name every default it used anyway, from this list or not, add each to the film's BANNED line, and fix them. The list grows with every film.

## A look built from a medium

A look holds together when it is the rules of one medium, not a palette. A risograph look, for example, is five parts and nothing else:

- **paper**: one flat colour with a fibre noise, no gradients;
- **ink A**: every word that must be read and every structural line;
- **ink B**: one fluorescent accent, one focus per frame (the number, the bar, the stamp);
- **overprint**: where the inks overlap a third colour appears, and the B plate sits 3 px off register;
- **halftone**: every gradient is dots.

Motion comes from the same medium: the frame is printed, plate by plate, not faded in. Write any look this way: its parts, what each may carry, and how the medium itself moves (paper is cut and lifted, ink is printed, glass refracts, clay is pressed).

````

### 4.13 skills/hyperframes/references/story.md (three storylines, hook, beats, tells of a generated film)

Source: `heygen-com/hyperframes/skills/hyperframes/references/story.md`

````markdown
# Story

Read before building any video that tells something over about 15 s: a launch or promo, an explainer, a pull-request or changelog video, a recap, a music video with a narrative. Most weak films are good motion around no story: a list of features, three cards in a row, a logo, a URL.

Skip it for an edit to an existing project, captions or overlays on footage, and a short single-idea piece (one kinetic line, a map move, a highlight on an image), where the request is the story. When the person gave a script, a storyboard or a reference film, follow theirs. The shape of each kind of film (launch, explainer, music, data, vertical, 3D, character) is in `types/`.

## 1. The one thing

- **What it is**, in one line: "You can now …" for a launch, the one idea the viewer must understand for an explainer, what changed and why it matters for a pull request. A whole release ("2.0", "what's new") is not one thing: take its headline.
- **The one thing to remember** after the film ends, in the viewer's words, not the brand slogan.
- **One viewer doing one real task**, from the moment they need it to the result. That task is the spine, and one real piece of data (a query, a file, a prompt, a number) travels through it from the hook to the payoff. An explainer's spine is one concrete example worked through.
- Keep facts (what it does, real numbers, real labels) apart from creative choices (angle, tone, look). Every claim on screen traces to the source: the site, the PR, the docs or the person's words. Use the person's own copy verbatim.
- What the source does not say stays unsaid: never derive a claim it did not make ("40 min to 2 min" is not "20× faster"), mark an example number as illustrative, and show a screen you cannot get as a labelled placeholder, not a drawn one.

## 2. Three storylines, then one

Write three. They are three different films, not three titles on one film: each has its own **world** (where it happens and what it looks like), its own **device** (what the story is) and its own **form** (how the camera and the cuts carry it). Sketch five or more ideas first, a line each pairing a device with a form (tables below); drop those the subject cannot carry well, and of the rest keep the three that differ most. Make one of the three the bold one you would not have picked first. Each says:

- its name, its device and form in a few words, and in two sentences what the viewer sees and feels;
- the first two seconds, exactly;
- its beats in one line (`hook → … → end card`);
- its look in one line: ground, type, the one material or treatment, taken from the subject or the brand (`look.md`);
- its sound in one line (`sound.md` §1).

The storylines are words: build nothing for any of them before one is picked. Pick a storyline for its story: the one a stranger would follow and remember, with people or a situation they know, ahead of the most striking picture. Picking a storyline picks its look and its sound. Then write the picked one as `SPEC.md`.

Put your recommendation first, with the reason in one clause, and save all three in the project as `STORYLINES.md` so a later turn can switch.

- **The person is there to answer:** show the three and stop once until they pick. A mix ("A's opening with C's middle") is one storyline. Ask nothing else unless only they can answer it (real screens you cannot capture, narrated or music only). State everything else in one assumption line: the length as a range, the aspect, music or voice, and every paid item (a HeyGen voice, an avatar, catalog music) with the free option beside it.
- **They asked for the file or for no stops:** take your recommendation, build it, and name the other two in one line each in your reply.
- With a storyboard (`storyboard.md`), the picked storyline becomes the board's frames.

| Device                        | What the viewer sees                                                                    |
| ----------------------------- | --------------------------------------------------------------------------------------- |
| A moment in someone's day     | a person, a time stamp, the message that creates the need ("launch is tomorrow")        |
| A character does the work     | a mascot or a cursor carries, drags, draws and reacts; every cut has a cause            |
| The feature as the hook       | the feature happening to a recognisable image in the first half second                  |
| The result first              | the finished output plays, then the camera pulls back to show where it came from        |
| One object across apps        | the thing being made travels from one app into the product, which keeps working on it   |
| Life before and after         | the old way as a scene (one person drowning in tabs), then the new way                  |
| Type carries the argument     | giant kinetic type, colour fields and grids that cut on the beat                        |
| A number lands                | one real number earned by a scene, then made physical                                   |
| A question with the input     | "What if you could make a video from your ⟨website⟩?", the blank filled by a real input |
| The object is the explanation | a machine or model whose working is the idea; the camera tours through it               |

| Form                       | What the viewer sees                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| One continuous take        | the camera never cuts; it pushes, pulls and travels from one world into the next             |
| Object-to-object chain     | every shot ends on the thing that opens the next: a button becomes a card becomes a phone    |
| An endless zoom            | the camera dives into a detail that turns out to be the next world, again and again          |
| A flight through one world | a 3D set, a map or a desk the camera travels across; each idea is a stop on the route        |
| Cut on the beat            | hard cuts on the music, type and colour fields changing every half beat                      |
| Match cuts                 | one shape holds while everything around it changes: a circle becomes a lens, a wheel, a logo |
| Split screen to one        | several panes play at once, then collapse into the one that matters                          |
| One frame that rebuilds    | a single composition keeps rearranging itself and never leaves the frame                     |

A pitch where all three are plain cuts between scenes has not tried the forms. Before and after: the new side moves calmly while the old side churns; never mock a named competitor. A recap asks one question first so each piece answers it.

## 3. The hook

The first two seconds are the densest of the film, and frame 0 is the thumbnail: never black, never a logo alone. Open on the feature working on something recognisable, a real moment that creates the need, a question with the input inside it, a sentence whose last word becomes the picture, or the bug itself. Then let the old way fail on screen (the wait, the wall of text, the wrong result) before the product brings relief; the proof is often the same shot improved in front of the viewer. Typing into a prompt box as the opener, with nothing else on screen, is the tell of a generated film; as a story step a few seconds in, it is fine.

## 4. Beats

A common shape for a launch of about 35 s; scale it, let the device bend it, and take another type's shape from its file in `types/`:

| Beat     | Share | Job                                                                                       |
| -------- | ----- | ----------------------------------------------------------------------------------------- |
| Hook     | ~8%   | the world and the need, or the feature already working                                    |
| Tension  | ~12%  | the old way failing on screen, or a gag                                                   |
| Reveal   | ~8%   | the product or idea named as a title, about 20–30% in                                     |
| Proof    | ~40%  | the real task in the real UI as 3–6 verbs (_paste, pick, watch it build, ship_), one each |
| Payoff   | ~20%  | the output arrives, already moving: the biggest visual moment, once, 60–80% in            |
| Claim    | ~8%   | the one thing, in one line                                                                |
| End card | ~8%   | the mark carried in, the name and the call to action land and hold 2–3 s                  |

In each verb beat keep only what the cursor touches and what proves the line; delete the rest of the screen. The process runs fast; the payoff plays at normal speed. Length follows the story (a feature launch is usually 20–45 s); a length in the request is a range, never padded.

## 5. Worlds

A film visits several worlds, each with its own background, light and scale (a desktop, the product on a brand gradient, a white void with a character, live action), never one dark canvas with small UI floating in it. Enter each world through an object already on screen: the thing clicked becomes the next shot. Keep one home stage to return to, one carrier the eye follows, and the palette and type constant across worlds.

## 6. Copy and voice

- Titles take at most 6 words a line, one line on screen at a time, no trailing periods; an explainer's lines may run to about 10. A line holds about 0.3 s a word plus 0.5 s, and the last line at least 2 s.
- Show, don't list: no bullet slides or three-card rows. When similar things repeat, each gets its own idea and layout.
- Real numbers only, from the source. The first line is never "Introducing", "Meet" or the logo; after the pain, "Introducing X" is fine. Never "unlock", "seamless", "supercharge", "game-changer", "revolutionize", "effortless", or "in seconds" unless measured.
- Read the lines alone: a stranger gets the pitch. Watch the pictures alone: they tell the same story.
- No voiceover unless the request or the source calls for one; then the screen never repeats the spoken sentence word for word. Without a voice, large titles and the product's own text carry the words, over music and effects (`sound.md`).

## 7. The brand

The mark lands once, with weight, usually on the end card; before it the brand shows only inside the product and the story, never docked small in a corner. The end card is built, not a still: the mark is carried in, typed or wiped in. The accent colour is rationed: one highlighted word, the payoff, the end card.

## 8. Tells of a generated film

The defaults a film falls into when nothing is decided are banned by name in `spec.md` ("BANNED by default"): a dark void with small things floating in it, glow and particles, the cream-paper-serif-mono-label look, everything fading and sliding up, three cards in a row, the docked logo. Beyond those, for a story:

- every scene entering the same way, or the same move beat after beat;
- side-by-side panels and floating cards standing in for a scene;
- titles that keep sliding or shrinking after they land; breathing or floating loops standing in for motion on titles and UI (a character's idle breath is acting, `types/character.md`).

When a first render shows any of them, name which, take the replacement from the subject, the brand or the medium, and add it to the BANNED line of `SPEC.md`.

````

### 4.14 skills/hyperframes/references/review.md (measure, then look; P0/P1/P2; REVIEW.md)

Source: `heygen-com/hyperframes/skills/hyperframes/references/review.md`

````markdown
# Review

You wrote the timeline, so you know what happens; the viewer sees it once, at full speed, often on a phone. Review is how you see the film as they will: as a harsh motion director, not a proud author. `check` catches what is broken; this pass catches what is weak. Run it after `check` passes, on every new film and on any edit that changes timing or layout, before you reply or render.

## 1. Measure, then look

1. `npx hyperframes check --json`. Besides errors it warns on craft it can measure: a line on screen too briefly to read (`line_unread`), more than 3 s with nothing changing (`dead_stretch`), text under 2.6% of the frame's short side (`text_below_floor`), an empty first frame (`first_frame_empty`, the thumbnail on social players), a film over 15 s with no sound (`film_silent`). A warning is a question, not a rule: fix it, or keep it on purpose and say why in the note (a deliberate hold carries `data-hold`).
2. `npx hyperframes snapshot --review` writes three sheets: each scene just after it starts and at its middle, plus each `data-beat`, a strip across every cut (−0.2 s to +0.2 s), and the beat frames at phone width (360 px). Open all three.
3. Motion between the beats: `snapshot --range START,END --frames 8` around the hero move and the payoff; `keyframes --shot` for a path that must arc or land.
4. The rendered file: `npx hyperframes audio <video> --json` shows whether sound is there, where it hits and how loud it is. You cannot hear it; say so.

Trust the numbers over your eye where they disagree: a clipped label or a 0.6 s line looks fine on a contact sheet.

## 2. What to look for

First, describe each beat frame in one sentence as a stranger would, naming every object; an object you would have to explain ("those bars are mirrors") is a P0. Then read the beat frames in order: do they tell a story a stranger follows, each one causing the next? Compare each with its shot in `SPEC.md`; what does not match is a note. Then name every default the frames show (`spec.md` "BANNED by default", or one not on the list yet), add each to the BANNED line, and fix them before anything else.

Then go through the sheets once per question:

| Question                      | What it catches                                                                                                                                    |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Does it read as what it is?   | A shape that reads as another object, a material that reads as plastic, a product screen that reads as a mockup, a face or mascot that reads wrong |
| Does the subject separate?    | Subject and ground too close in value, two focal points in one frame, the eye with nowhere to go                                                   |
| Framing and contact           | Crops, text at the edge or under platform UI, collisions at a seam, things floating that should touch                                              |
| Timing as a first-time viewer | A read shorter than its words (`story.md` §6), something that pops on with no move, a jump at a cut, everything moving at once on one curve        |
| Tells                         | Which items of `story.md` §8 and `motion.md` "Defaults that look generated" are on screen                                                          |
| The pictures alone            | With the words covered, do the beat frames still tell the storyline?                                                                               |
| The phone sheet               | Can every line meant to be read be read at 360 px?                                                                                                 |

## 3. Notes and fixes

Write each problem as one line: `t=4.2s · where · problem → exact change · what stays`. Rank them:

- **P0** breaks the read or the contract: unreadable, wrong, broken, a tell in the hero shot.
- **P1** weakens the film: a dead stretch, a soft payoff, a seam that jumps.
- **P2** polish.

Fix every P0 and the P1s worth their time: text first, then timing, then detail. Then snapshot only what you changed, once. A second pass only when a P0 is still open. Never score the film out of 10: a score finds nothing to fix. When a fix does not hold, snapshot the frames on either side of the problem, list every difference, and change only the line that causes it. A film that feels busy: remove a third of the motion and keep the moves that lead the eye.

A fresh pair of eyes, when your host can start a sub-agent: give it only `STORYBOARD.md` and the three sheets, ask for P0 and P1 lines in the format above, and keep editing to yourself. Commit or copy the project before you fix, so a fix that makes things worse can be rolled back.

## 4. The delivery note

Write `REVIEW.md` at the project root and put its short form in your reply:

- the creative calls you made, and the storylines you did not build;
- what you measured and what you only looked at; what nobody checked (the sound was measured, not heard);
- the weakest shot, and what you would change with more time;
- warnings you kept on purpose, and why.

The next turn reads it before changing anything.

````

### 4.15 skills/hyperframes/references/captions.md

Source: `heygen-com/hyperframes/skills/hyperframes/references/captions.md`

````markdown
# Captions

## Words and timings

- `npx hyperframes transcribe <file> --json` and a HeyGen voiceover (`/media-use`) give every word's start and end. Work from those as `[{ "id": "w0", "text": "Hello", "start": 0.0, "end": 0.5 }, …]`.
- `npx hyperframes transcribe` defaults to the `small.en` whisper model, which **translates** non-English speech into English. Pass the model: `npx hyperframes transcribe <file> --model small.en` for English, `--model small --language <code>` otherwise, `--model medium.en` for speech over music. It writes `assets/transcript.json` (its JSON names the path) and overwrites it on the next run; `--to srt` or `--to vtt` writes a sidecar.
- For Chinese, Japanese and other unspaced scripts, local transcription returns a whole sentence as one "word", sometimes in the other script (Traditional for Simplified speech). Split each segment's text into short phrases and spread its time across them by character count; check the characters against what is said.
- Whisper invents "Thank you." over silence and repeats lines over a silent tail: drop words that start inside a final silence (`silencedetect=noise=-35dB:d=0.6`; real speech sits around −16 to −26 dB).
- Never put two words in one timed entry, and match transcript words to caption words by position, not text, or a repeated word takes the wrong time.
- Read the transcript before using it. More than 20% `♪` or `�` tokens, or nonsense words, means it failed: retry with a larger model, or take lyrics from the person. Drop non-word tokens before building groups.

## Structure

- One sub-composition host with `data-track-kind="captions"` holds every caption group, so Studio shows them on one captions track.
- Ready-made styles: `npx hyperframes catalog --tag caption-style --json`. An installed one is source you can restyle.

## Groups

- 2–3 words for high energy, 3–5 conversational, 4–6 calm. Break at a sentence end, a pause of 150 ms or more, or the word limit.
- One group visible at a time. A group opens at or before its first word's start and closes at or after its last word's end. A caption at exactly 0 s looks pre-existing: start 0.1–0.3 s in.
- Every group ends with a hard kill after its exit, or a stale group can stay on screen:

```js
tl.to(group, { opacity: 0, duration: 0.12, ease: "power2.in" }, end - 0.12);
tl.set(group, { opacity: 0, visibility: "hidden" }, end);
```

`tl.set` is an instant flip, so setting `visibility` on the group is fine; never tween it on a `.clip`.

## Fit and place

- Size each group to fit: `window.__hyperframes.fitTextFontSize(text, { fontFamily, fontWeight, maxWidth })` returns `{ fontSize }`. Defaults: `maxWidth` 1600 landscape, 900 portrait; base 78, minimum 42, step 2. When a word scales up for emphasis, divide `maxWidth` by that scale.
- A full-width absolute container, centred with text alignment. Never `left: 50%; transform: translateX(-50%)`, which clips at the frame edges.
- `overflow: visible`, not `hidden`, which cuts off scaled words and glows.
- Landscape: 80–120 px from the bottom. Portrait: about 600–700 px from the bottom. Never over the speaker's face; inside the 80% title-safe box.
- Position each group absolutely. In a flex column a group hidden with `visibility: hidden` still takes space, so the next one lands lower. In a stack that accumulates, groups in one block share one exit time, or the stack reflows.
- Fade the group or its words, not both: the opacities multiply and read as a pop. A gradient or `background-clip: text` fill goes on the inner text span, not the transformed container.
- Over footage, choose the blend by the brightness (0–255) behind the text: under 60 `screen`, 60–180 `overlay`, over 180 `normal` with opaque colour. Plain subtitles above brightness 60 get a scrim sized to the text (30–40%), never a full-width bar.
- Footage may already carry burned-in subtitles only mid-clip: scan a 1 fps contact sheet before placing captions.

## Text behind the speaker

- Stack the video, then the captions, then a cutout of the person from `npx hyperframes remove-background` (`/media-use`), ordered by `z-index`. Shake or punch in the video and the cutout together in one wrapper.
- `check` treats a `<video>` as opaque across its whole box, so a WebM cutout fails every caption behind it with `text_occluded`: put `data-layout-allow-occlusion` on the cutout and judge from `snapshot`.
- A big word behind the head reads best 30–55% covered: under about 15% it floats, over about 65% it is eaten. Re-lay out when a content word is 80% covered, or two adjacent words 50% each. Measure the rendered word boxes against the matte over each caption's own time window (heads move: one clip went from y=224 to y=96 in 8 s); estimates from character widths were wrong both ways.
- The matte model drops mic arms, lets large rigs near the body leak in, and flickers on held objects. Its first run downloads 168 MB, and it runs at about 2 fps at 1080p on CPU.

````

### 4.16 skills/hyperframes/references/format.md (composition format, attributes, fonts, lint errors)

Source: `heygen-com/hyperframes/skills/hyperframes/references/format.md`

````markdown
# Composition format

The detail behind the contract in `SKILL.md`. Full references: `npx hyperframes docs compositions`, `docs data-attributes`, `docs troubleshooting`.

## Shape of a project

```html
<!-- index.html: a normal document; declares variables, mounts scenes -->
<html
  data-composition-variables='[{"id":"headline","type":"string","label":"Headline","default":"…"}]'
>
  <body>
    <div
      id="root"
      data-composition-id="main"
      data-start="0"
      data-duration="12"
      data-width="1920"
      data-height="1080"
    >
      <div
        id="intro"
        data-composition-id="intro"
        data-composition-src="compositions/intro.html"
        data-start="0"
        data-duration="4"
        data-track-index="1"
        data-width="1920"
        data-height="1080"
      ></div>
    </div>
    <script>
      window.__timelines["main"] = gsap.timeline({ paused: true });
    </script>
  </body>
</html>
```

```html
<!-- compositions/intro.html: everything inside <template> -->
<template>
  <style>
    #root {
      position: absolute;
      inset: 0;
    }
  </style>
  <div id="root" data-composition-id="intro" data-width="1920" data-height="1080">
    <h1 id="headline" class="clip" data-start="0.4" data-duration="3" data-var-text="headline">
      …
    </h1>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(
      "#headline",
      { opacity: 0, filter: "blur(8px)" },
      { opacity: 1, filter: "blur(0px)", duration: 0.18, ease: "power4.out" },
      0.4,
    );
    window.__timelines["intro"] = tl;
  </script>
</template>
```

- Give the host, the scene root and the timeline key the same id. A host id that differs from its scene's makes each render wait 45 s per scene, then show static frames. Styles and scripts outside `<template>` are dropped.
- Size the scene root with `inset: 0`, never hard-coded pixels; the canvas is `data-width` × `data-height`.
- Keep ids unique across the assembled page (prefix them: `#intro-title`). A scene's timeline can't reach elements outside its file.
- Use `fromTo`, not `from`, inside a scene: the host re-seeks the scene each time it shows, and `from` records its start state once, so it drifts on seek-back.
- Never `add()` a scene's timeline to the root's; the runtime drives each scene itself, and nesting seeks it twice.

## Attributes you'll use most

| Attribute                                      | Meaning                                                                                             |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `data-start`, `data-duration`                  | Seconds, local to the file that declares the element                                                |
| `data-track-index`                             | Studio lane only; paint order is CSS `z-index`                                                      |
| `data-track-kind`                              | `graphics` or `captions` on scene hosts (video and audio come from the tag)                         |
| `data-composition-src`, `data-variable-values` | Mount a scene file; per-mount variable values (a JSON object)                                       |
| `data-media-start`                             | Offset into the source media (a trim)                                                               |
| `data-playback-rate`                           | Constant speed, 0.1–10                                                                              |
| `data-has-audio="true"`                        | A `<video>` keeps its own sound; a timed `<video>` with neither this nor `muted` fails lint         |
| `data-volume`, `data-fade-in`, `data-fade-out` | Gain (1 = 0 dB, up to 3.98 = +12 dB) and edge fades; envelopes use `data-automation` (`/media-use`) |
| `data-link`, `data-sync-origin`                | A video and audio edited as one (see Linked clips)                                                  |
| `data-hidden`                                  | Hidden in preview and render; reversible                                                            |
| `data-no-timeline`                             | On the root of a still composition: no timeline to wait for                                         |

## Variables

- Declare an array of `{id, type, label, default}`: the video's own on `index.html`'s `<html>`, a scene or block file's on that file's `<html>` (or root element), where they stay inside each mount. Types: `string` (`placeholder`, `maxLength`), `number` (`min`, `max`, `step`, `unit`), `color`, `boolean`, `enum` (`options: [{value, label}]`).
- Bind without script: `data-var-text="id"`, `data-var-src="id"` (keep a real fallback `src` on media with audio), `var(--id)` in CSS; for logic, `window.__hyperframes.getVariables()` once at init.
- Values are an object keyed by id. A host's `data-variable-values` sets one mount; Studio's Variables panel and batch renders set only the root's variables, so to vary a block, change its host's values. Variables can't change the root's `data-duration`.

## Fonts

- Bundled, so they resolve by name: Inter, Montserrat, Outfit, Nunito, Oswald, League Gothic, Archivo Black, Space Mono, IBM Plex Mono, JetBrains Mono, EB Garamond, Playfair Display, Source Code Pro, Noto Sans JP, Roboto, Open Sans, Lato, Poppins. Common system fonts (Helvetica, Arial, Times, Menlo and the like) are swapped for the nearest of these.
- The bundle only has Latin text at a few weights per family (Inter: 400, 700, 900). The compiler still fetches each of these families from Google Fonts for the other weights and scripts, and caches the result in `~/.cache/hyperframes/fonts`.
- Any other family needs `@font-face` in the file that uses it, or lint fails `font_family_without_font_face`: `src: url('assets/fonts/x.woff2')` for a file in the project (a capture's own fonts, or one you download there), or `local('Exact Name')` for a font installed on this machine.

## Timing and the timeline

- A clip shows over `[start, start + duration)`: an end state landing exactly on its end is never rendered.
- Only a composition's root timeline is paused; timelines nested inside it are not. Never `tl.play()`.
- A scene's clock starts at 0 at its host's `data-start`; media `data-start` is local to its composition. `<video>` / `<audio>` without `data-duration` play their full length; an `<img>` without one lasts 3 s.
- A host's `data-duration` is the scene's slot: a shorter scene timeline holds its last frame, and a slot shorter than the video goes blank when it ends.
- Root children with `data-start` are laid out full-frame by the runtime; an untimed full-bleed background needs `position: absolute; inset: 0` or it collapses to nothing.
- A fill on the composition root is dropped when the video has shader transitions or HDR media; put it on a full-bleed child.
- `data-start="intro + 0.5"` starts after `intro` ends (spaces required). A typo, a missing id or a cycle silently resolves to 0, so snapshot what you time this way.
- A clip nested inside another timed element counts its `data-start` from the composition, not from that element, and shows only while that element shows. `timeline` lists it under its parent and warns `never visible` when the windows miss (`lint`: `nested_clip_never_visible`).
- `npx hyperframes timeline --json` lists every clip by kind with `absStart`, `absEnd`, `file`, `src`, `playbackRate`, `nested`, `host` and `durationSource`: read it instead of opening every file. It reads one level of nesting (a deeper scene shows `children=unread`); `laneError` means a `data-automation` or `data-fx-chain` that doesn't parse.

## Adding media

Write what a Studio drop writes, so the clip behaves like one the person dropped:

- `id`, `class="clip"`, `data-start` (the playhead or the requested time, never a silent 0) and `data-track-index`. Video with sound: `playsinline data-has-audio="true"`; silent footage: `muted playsinline`. Audio: `data-volume="1"`.
- Images and video fill the frame: `position: absolute; left: 0; top: 0`, width and height equal to the canvas, `object-fit: contain`.
- `z-index` is the number of top-level clips already in that file plus one.
- Raise the root's `data-duration` to cover the new clip's end, or it never plays.

## Linked clips

Studio's Detach audio writes a muted `<video>` and an `<audio>` of the same file sharing `data-link` and `data-sync-origin`; Studio moves, trims, splits and deletes them as one.

- Prefer one `<video data-has-audio="true">`; link only when the sound needs its own track, volume or effects.
- Every member keeps the same `data-start`, `data-duration`, `data-media-start` and `data-playback-rate`; retime them all together.
- Unlink by removing `data-link` from every member. Leave `data-sync-origin` alone while they are still one source.

## Layout audit opt-outs

`check` measures boxes at sampled times; `overflow: hidden` does not silence a finding. Use the narrowest opt-out:

| Attribute                        | Silences                                                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `data-layout-allow-overflow`     | Overflow on the element and every descendant, including text-clipping checks: keep it on the smallest decorative wrapper |
| `data-layout-bleed="true"`       | One intentional crop of primary text                                                                                     |
| `data-layout-allow-overlap`      | Deliberate text layering, on that block only (not inherited)                                                             |
| `data-layout-allow-occlusion`    | An element meant to cover text                                                                                           |
| `data-layout-allow-caption-zone` | Intentional copy in the caption band                                                                                     |
| `data-layout-ignore`             | A decorative element never audited                                                                                       |

## Lint errors you'll meet first

| Rule                                                   | Fix                                                                                                    |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `video_missing_muted`                                  | A timed `<video>` gets `data-has-audio="true"` or `muted`                                              |
| `gsap_css_transform_conflict`                          | Set the start inside the tween (`gsap.fromTo`) instead of a CSS `transform`                            |
| `gsap_animates_clip_element`                           | Animate a child of the `.clip`, or its `opacity`                                                       |
| `video_nested_in_timed_element`                        | Time the `<video>` or its wrapper, not both                                                            |
| `media_missing_id`, `media_crossorigin_breaks_preview` | Give every `<audio>` an `id`; drop `crossorigin`                                                       |
| `gsap_timeline_registered_before_async_build`          | Register the timeline at the end of the async callback                                                 |
| `standalone_composition_wrapped_in_template`           | Only scene files use `<template>`                                                                      |
| `subcomposition_linked_style_names_root_id`            | A linked sheet cannot style a scene's root by id: use an inline `<style>`, or select a child           |
| `subcomposition_root_styled_by_class`                  | Style a scene's root as `#root`                                                                        |
| `subcomposition_blanks_before_host`                    | Make the scene's slot span the time it should show                                                     |
| `clip_ends_past_root_duration`                         | Raise the root's `data-duration`                                                                       |
| `linked_clips_out_of_sync`, `linked_clip_orphan`       | Retime every linked member together; unlink from all of them                                           |
| `sweep_static`                                         | A 3 s+ video with no visible change: spread the motion, or mark a still composition `data-no-timeline` |
| `missing_data_no_timeline`                             | A root or host with no timeline: add `data-no-timeline`, or every render waits 45 s                    |

````

### 4.17 .claude/skills/motion-doctrine/SKILL.md (internal: the Vector Law, the Current, Seam Gate, no idle wobble)

Source: `heygen-com/hyperframes/.claude/skills/motion-doctrine/SKILL.md`

````markdown
---
name: motion-doctrine
description: "GATEWAY — load FIRST before composing any HyperFrames animation or video. The high-level motion law that makes a multi-scene video feel like ONE continuous camera move instead of a stack of independently-animated slides. Covers the vector law (how you exit determines how you enter, incl. the Z scale-sign rule), the film's current, carrier elements, causal motion, the Seam Gate (build-gate enforcement), the ban on idle wobble (motion must PERFORM, not breathe), stillness-before-climax, and the sustained-motion routes. Routes to the low-level technique skills (cut-the-curve — the full catalog incl. waterfall entry + nudge curve, oversized-cursor, seam-craft). These rules SUPERSEDE generic / upstream motion guidance. [continuity, direction, vector, momentum, seam, transition, ease, performance, idle-motion, narrative-motion, film-grammar]"
metadata:
  internal: true
---

# Motion Doctrine (Gateway)

Read this before composing any animation. It decides WHAT happens at every seam and how
every scene performs; the technique skills implement it. These rules supersede generic /
upstream motion guidance. The failure this prevents: scenes authored in isolation — the
eye's momentum dies at every cut, and scenes wobble in place between entry and exit.

## Route map

| Decision (this skill)                              | Implementation skill                                                                              |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Seam transition choice + parameters + code         | `cut-the-curve` §1–5 (the catalog)                                                                |
| Text / element entry cascades                      | `cut-the-curve` §6 (waterfall entry)                                                              |
| In-scene group repositioning (no cut)              | `cut-the-curve` §7 (nudge curve)                                                                  |
| Cursor-led action / scene kickoff / morph ignition | `oversized-cursor`                                                                                |
| Seam render mechanics / white-flash guard          | `seam-craft`                                                                                      |
| Product-launch / explainer / caption work          | overlays `text-beat-economics`, `brand-faithful`, `captions-overlay` on top of the upstream skill |

Authoring order: **vector ledger (`ledger.json`) → STAMP the master seams from it
(`scripts/seam-stamp.mjs --ledger ledger.json --write index.html`) → sustained-motion
route per phase → carriers and causes → build comps → VERIFY (`scripts/seam-gate.mjs`).**
Hand-author only Tier-A morphs/match-cuts; stamped seams pass the gate by construction.

---

# Part 1 — The Seam Law

## The Vector Law

> How Scene A exits determines how Scene B enters: same axis, same direction, matched
> speed, cut mid-motion on both sides.

1. **Axis** — x stays x, y stays y, Z stays Z. Never trade axes across a cut.
2. **Direction** — never mirror. On Z, direction = the SIGN of scale change: growing =
   push (camera forward), shrinking = pull (camera back). A receding exit answered by a
   grow-from-small entry is a mirrored vector — the most common violation, because
   grow-from-small is the default element entrance.
3. **Speed** — entry initial velocity ≈ exit final velocity, via mirrored eases (exit
   `power4.in` + entry `power4.out`, same distance and duration; the incoming side picks
   up ≥50% through the notional path). Mechanics in `cut-the-curve`.
4. **Phase** — the cut lands mid-motion on BOTH sides. Settling to rest before the cut,
   or starting from rest after it, is a dead beat.

## The Current

Every film picks ONE dominant direction (house default: LEFT). Every ordinary seam uses
it. Other vectors are RESERVED — spending one means something:

| Vector                    | Meaning                                                         |
| ------------------------- | --------------------------------------------------------------- |
| The current (LEFT)        | "next beat" — neutral forward progress                          |
| Upward                    | elevation — a conclusion or reveal rises above what came before |
| Z forward (zoom-through)  | pushing deeper into the same thought                            |
| Z backward (inverse zoom) | ARRIVAL — something bigger lands                                |
| Scale-burst (explode out) | leaving a world — a surface blasts past camera                  |

- Never run consecutive seams in opposing directions — ping-pong reads as an error.
- A direction change needs a visible cause (click / bounce / impact) or a chapter boundary.

## The Vector Ledger

Write it before authoring any master timeline — as **`ledger.json` at the project root**
(schema: `references/seam-gate.md`). One row per seam: cut time, exit and entry vectors
(axis + signed direction; Z rows carry the scale sign), selectors, technique. Exit and
entry must match; if a row mismatches, fix the plan, not the easing. The verifier checks
row consistency statically before any runtime sampling.

## Carriers

The eye follows objects, not abstractions. The strongest seams hand a concrete carrier
across the cut at matched position AND velocity: a cursor mid-path, a container that
shrinks/docks into the next layout, a mark that flies into its exact slot, the word group
of a waterfall cut. With no natural carrier, the scene heroes carry it (partial travel +
early fade, entry mid-flight). Never a crossfade — it has no carrier at all.

## Causal Motion

Chain motion so each move is visibly launched by the last: click → squash → release
spring → flight → impact → recoil → reveal.

- Effects start ON the causing frame — same timeline position, never "shortly after."
- Reactions scale with implied mass: big elements rebound slower, small ones snap.
- A force is a license to change direction; an uncaused flip is a ping-pong.

## The Seam Gate (build gate — run the verifier, exit 0 or the seam is not done)

```bash
node <SKILL_DIR>/scripts/seam-stamp.mjs --ledger ledger.json --write index.html  # generate
node <SKILL_DIR>/scripts/seam-gate.mjs  verify --ledger ledger.json --project .  # verify
```

The script (usage + ledger schema: `references/seam-gate.md`) numerically enforces, per
seam: ledger-row consistency, exit still moving at the cut, entry mid-flight (never from
rest), measured direction = ledger direction, entry/exit speed match (WARN), **zero
overlap** (one side visible per frame — the cut is not a dissolve), the **Z sign** rule
(d(scale)/dt same sign both sides; the incoming scene's own entrances are scanned for
sign-fighting), and carrier rect continuity with ancestor scale included. Use
`seam-gate.mjs probe --t <cut>` to find each seam's true carrier selectors when authoring
the ledger.

Rules the script cannot check — still yours:

1. **Edits re-open the seam.** Any change to a scene's first/last ~1s (including
   re-timing to new VO) invalidates that boundary's audit — re-run the verifier.
2. **Audio is the clock.** Re-time scenes to the VO's real word timestamps; never rush a
   read to fit a slot. A VO regen re-opens its seams.
3. **Clip-gating gotcha** (the usual cause of a zero-overlap FAIL): a clip whose
   `data-start` precedes its entry tween is un-hidden at its initial opacity — set
   initial `autoAlpha: 0` AND `data-start` = the cut time, never earlier.

---

# Part 2 — Performance (the scene keeps performing)

## No idle wobble

Idle sine loops (breathe, float, drift, glow pulse) are BANNED as sustained motion — they
read as "the video is waiting." A scene that finishes entering with seconds left is a
planning bug: add story, not wobble. Every phase between entry and exit is owned by one
of these routes (name the route in the plan):

| Route                  | What it is                                                                                                             |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Staged reveals**     | Hold content back; pay it off on narration beats — the frame keeps gaining information (default for ≥2 content groups) |
| **Camera with intent** | A mapped scale+pan path: establish wide → travel → arrive on the subject                                               |
| **Sequenced UI life**  | The product behaves over time: progress advances, highlights step, counts tick                                         |
| **Animated sequences** | Elements act out a beat: a card files into a stack, an item gets dragged, a result assembles                           |
| **Cursor-led action**  | An oversized cursor walks the eye to a trigger; its CLICK ignites the next beat (`oversized-cursor`)                   |

Test: pause at any second — something meaningful must be mid-flight (a reveal landing,
the camera traveling, the UI doing what the narration says).

## Stillness before climax

Schedule a **0.3–0.75s pause** between the major action and its result — the dramatic
comma. A scene that jumps straight from action to result loses it.

## Timing intents

- Single entry ≤ ~800ms; longer buildup = multi-element stagger, not one slow element.
- Exit ≈ 75% of entry. Exception: cut-the-curve inverts this (entry ~127% of exit).
- Total stagger ≤ 500ms; with 8+ elements, tighten per-item delay or stagger the first few.
- Forbidden eases: `bounce.out` / `elastic.out`. Entry overshoot `back.out(1.4–1.7)` is fine.
- Similar elements share one ease+duration intent — never a unique pair per element.

## Transition vocabulary

Use only 2–3 inter-scene transitions per film and repeat them; the default boundary is
**cut-the-curve in the current's direction**. Hand-written shared-element morphs
(`intent: morph`) don't count against the budget.

---

## Anti-Patterns

| Don't                                                                      | Instead                                            |
| -------------------------------------------------------------------------- | -------------------------------------------------- |
| Author each scene's entrance in isolation                                  | Write the vector ledger first                      |
| Crossfade between scenes                                                   | Cut-the-curve in the current's direction           |
| Exit completes, THEN the scene changes                                     | Cut mid-motion on both sides                       |
| Entry starts from rest after a cut                                         | Enter ≥50% through the notional path               |
| Inverse-zoom exit → grow-from-small entry (or push → oversized retraction) | Match the scale-velocity sign (Seam Gate 7)        |
| Incoming scene's own pop-in intro under a Z-seam handoff                   | Hold its opening frame composed, or match the sign |
| Idle wobble / breathe / float to fill time                                 | Assign a sustained-motion route; or add story      |
| Direction flip without a cause                                             | Spend a force, or keep the current                 |
| Reserved vectors used as variety                                           | Default to the current; spend them on meaning      |
| Reaction a few frames after its cause                                      | Same-frame ignition                                |
| Action jumps straight to result                                            | Schedule stillness-before-climax (0.3–0.75s)       |

````

### 4.18 .claude/skills/captions-overlay/SKILL.md (internal: drop / rail / embed)

Source: `heygen-com/hyperframes/.claude/skills/captions-overlay/SKILL.md`

````markdown
---
name: captions-overlay
description: Overlay doctrine for captions in HyperFrames videos — the caption MODEL (drop / rail / embed) and the rule that captions are an OVERLAY composited on top of the film, never a reserved bottom band you shift content up to avoid. Load when adding captions/subtitles to a talking-head or launch video, when deciding whether a phrase should be dropped, ride the verbatim rail, or be promoted to a scarce embedded climax, when laying out a composition that will carry captions (do NOT reserve a keep-out band), or when centering a composition on the true frame center under captions. Applies ON TOP of the `/hyperframes` skill's references/captions.md.
metadata:
  internal: true
---

# Captions Overlay Doctrine

> **Overlay doctrine — supplements the upstream `/hyperframes` skill's `references/captions.md`. Applies ON TOP of it; do not expect it folded into the upstream skill.**

Two ideas combine here. First, the **caption model** — every spoken phrase is `drop`,
`rail`, or `embed`, and embed is the scarce earned peak, not the default. Second, the
**overlay law** — a caption line is composited ON TOP of the film as an overlay; it is
NOT a reserved zone, so you never shift content up or leave a dead band to "make room"
for it. The two reinforce each other: because captions ride as an overlay (the verbatim
rail in front, the occasional embed behind the subject), the composition keeps its full
frame and centers on the true vertical center.

## The caption model — drop / rail / embed

Every spoken phrase is one of three things:

|           | What                                             | How it's shown                                                                                                                                                    |
| --------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **drop**  | filler — um/uh, stutters, self-corrections       | not shown                                                                                                                                                         |
| **rail**  | the default — ordinary spoken content (verbatim) | clean lower-third subtitle, **in front**, readable. A punch word can get an inline `emphasis` highlight (accent colour / active-word pop) — it stays on the rail. |
| **embed** | a promoted peak — the headline beat              | one big word composited **behind the subject** (matte occlusion), designed entrance + exit                                                                        |

**The rail carries most of the text; embed is the scarce, earned peak** — ≤1 per beat,
never two adjacent/co-visible, spaced ≥ a beat apart. A short clip → usually one embed;
a long explainer → ~one per section. Embedding every word is the common mistake.

This is the default shape (rail = the verbatim lower-third; embed = the climax
composited behind the subject). A pure-cinematic treatment drops the rail and makes
everything embed-style — use it only for pure-cinematic asks, never for explainer /
voiceover where the words must read.

### Rail-first, embed-scarce (the load-bearing rules)

- **Rail-first for talking-head / explainer.** Don't embed the whole transcript — most
  text is the rail; embed only peaks. Embedding everything is the default mistake.
- **Embed is scarce + spaced.** ≤1 embed per sentence/beat, never two adjacent or
  co-visible, ≥ a beat apart, at most one `apex`. climax = per-beat peak, **not** "the
  single payoff of the entire clip."

## The overlay law — captions are NOT a reserved band

In a composed video with captions enabled, the caption line is a **small, minimal
word-by-word line** composited as an overlay layer ON TOP of the whole film (a single
text line, bottom-centered, roughly the bottom ~5-8% of canvas height). It is an
overlay, not a reserved zone:

- **Center the composition on the TRUE vertical center — y = H / 2** (landscape 540,
  portrait 960). Do not shift content up to "make room" for captions; a composition
  centered at 0.42 × H with a dead lower band is the bug, not the fix.
- Content may extend to the canvas bottom. Full-bleed subjects, rails, and backgrounds
  all welcome.
- **One soft courtesy rule:** avoid parking _critical small readable text_ (a URL line,
  a legal line, a sub-caption) exactly in the bottom ~80px center span where the caption
  line sits — the overlay would fight it. Large imagery / cards / ambient content under
  the captions is fine; the caption skin is designed to read over content.
- There is no machine keep-out gate (the old `captions.mjs keepout` check is retired).
  Snapshot review judges caption-over-content legibility visually.

**When captions are disabled:** identical positioning freedom — the overlay simply
doesn't exist.

## Why these two rules are one doctrine

The model says the rail rides **in front** and an embed is a rare word composited
**behind the subject** — both are layers added to footage that ships untouched. The
overlay law says the caption line is a layer composited **on top** of the whole film,
not a band carved out of the layout. So whether captions go over footage or over a
composed film, they are an overlay you add, not a zone you reserve:

- Keep the full frame; center on true center; let content run to the edges.
- Make the rail (or the small overlay caption line) carry the verbatim words.
- Promote a word to an embed only at a genuine peak — scarce, spaced, never two at once.
- Reserve nothing; judge legibility of captions-over-content visually, not by a keep-out gate.

````

### 4.19 .claude-plugin/marketplace.json

Source: `heygen-com/hyperframes/.claude-plugin/marketplace.json`

````json
{
  "name": "hyperframes",
  "owner": {
    "name": "HeyGen",
    "email": "hyperframes@heygen.com",
    "url": "https://hyperframes.heygen.com"
  },
  "plugins": [
    {
      "name": "hyperframes",
      "source": "./",
      "description": "Recommended: all published HyperFrames skills in one versioned bundle. Create and render videos from HTML: the contract, film, captions, overlays, motion and look references, the CLI, the registry, media, Figma, slideshows and Remotion ports.",
      "homepage": "https://hyperframes.heygen.com",
      "license": "Apache-2.0"
    },
    {
      "name": "core-skills",
      "source": "./",
      "description": "Legacy core-only installation. For the release-managed bundle of every skill, install hyperframes@hyperframes and then uninstall core-skills@hyperframes.",
      "homepage": "https://hyperframes.heygen.com",
      "license": "Apache-2.0",
      "skills": [
        "./skills/hyperframes",
        "./skills/hyperframes-cli",
        "./skills/hyperframes-registry",
        "./skills/media-use"
      ]
    }
  ],
  "description": "HyperFrames video creation skills, versioned and updated as one plugin."
}

````

### 4.20 README.md (top: quick start, skills, How It Works, HyperFrames vs Remotion)

Source: `heygen-com/hyperframes/README.md` (first 120 lines of 360; rest omitted)

````markdown
<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/logo/dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="docs/logo/light.svg">
    <img alt="HyperFrames" src="docs/logo/light.svg" width="300">
  </picture>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/hyperframes"><img src="https://img.shields.io/npm/v/hyperframes.svg?style=flat" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/hyperframes"><img src="https://img.shields.io/npm/dm/hyperframes.svg?style=flat" alt="npm downloads"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache%202.0-blue.svg" alt="License"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D22-brightgreen" alt="Node.js"></a>
  <a href="https://discord.gg/EbK98HBPdk"><img src="https://img.shields.io/badge/Discord-Join-5865F2?logo=discord&logoColor=white" alt="Discord"></a>
</p>

<p align="center"><b>Write HTML. Render video. Built for agents.</b></p>

<p align="center">
  <a href="https://hyperframes.studio/studio">Studio</a> |
  <a href="https://hyperframes.heygen.com/quickstart">Quickstart</a> |
  <a href="https://hyperframes.heygen.com/showcase">Showcase</a> |
  <a href="https://hyperframes.studio/">Playground</a> |
  <a href="https://hyperframes.heygen.com/catalog/blocks/data-chart">Catalog</a> |
  <a href="https://hyperframes.heygen.com/introduction">Docs</a> |
  <a href="https://discord.gg/EbK98HBPdk">Discord</a>
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/f6ff9fae-f33d-4f68-bd54-f3ed4ba6473b" alt="HyperFrames app opening from the Dock: native Mac and Linux app now available" width="800">
</p>

<p align="center">
  <b>Download the desktop app:</b>
  <a href="https://hyperframes.studio/studio/download?os=mac&src=github-readme&utm_source=github&utm_medium=readme">macOS</a> ·
  <a href="https://hyperframes.studio/studio/download?os=windows&src=github-readme&utm_source=github&utm_medium=readme">Windows</a> ·
  <a href="https://hyperframes.studio/studio/download?os=deb&src=github-readme&utm_source=github&utm_medium=readme">Linux (.deb)</a>
</p>

HyperFrames is an open-source framework for turning HTML, CSS, media, and seekable animations into deterministic MP4 videos. Use it locally with the CLI, from AI coding agents with skills, or as the rendering core behind hosted authoring workflows.

Using Claude Code, Codex, Cursor, or another coding agent? Run `npx hyperframes skills update` once, then ask your agent to make a video.

## Quick Start

### With an AI coding agent

For Claude Code, install the versioned plugin:

```bash
claude plugin marketplace add heygen-com/hyperframes
claude plugin install hyperframes@hyperframes
```

To enable auto-update for the **hyperframes** marketplace, run `claude` in a
terminal in your project. In Claude Code's terminal UI, run `/plugin`, then select
**Marketplaces** → **hyperframes** → **Enable auto-update**. Afterward, use
`/hyperframes:hyperframes`. See the [plugin guide](docs/guides/plugins.mdx)
for Copilot, VS Code, Cursor, Gemini CLI, updates, and migration.

For standalone skills (including OpenCode), use:

```bash
npx skills add heygen-com/hyperframes
```

> The picker opens with nothing pre-selected — the **Core Skills** group is all you need; `/slideshow`, `/remotion-to-hyperframes` and `/figma` install on demand. Agents and non-interactive runs should use `npx hyperframes skills update` instead — it installs exactly the core set, whereas `skills add --all` installs all 7 published skills. The six repo-internal skills under `.claude/skills` / `.agents/skills` are excluded by default. For the full published set use `npx hyperframes skills`.
>
> `skills add` resolves the skills.sh registry blob, which can lag `main` by hours. `npx hyperframes skills update` installs from the current `main`, so reach for it when you need the newest copy of a skill.

Run project-local installs from your video project's directory. From a HyperFrames
checkout, use `npx hyperframes skills update` for a global install instead: a
project-local installer target can overlap the tracked `skills/` source and
overwrite uncommitted edits. See [contributor setup](CONTRIBUTING.md#getting-started).

Try a prompt like:

> Using `/hyperframes`, create a 10-second product intro with a fade-in title, a background video, and subtle background music.

The skills teach agents the HyperFrames production loop: plan the video, write valid HTML, wire seekable animations, add media, lint, preview, and render. They work with Claude Code, Codex, Cursor, Gemini CLI, IBM Bob, and other coding agents that support skills.

## Skills

HyperFrames ships 7 skills. Make any video by asking for it; the `/hyperframes` skill carries the contract and the references (film, captions, overlays, motion, look). Read it first.

For standalone installation, default to the **core set** (`/hyperframes`, `/hyperframes-cli`, `/hyperframes-registry`, `/media-use`). `npx hyperframes skills update` installs exactly that from anywhere; the interactive picker (`npx skills add heygen-com/hyperframes`) lists it as the "Core Skills" group, nothing pre-selected. The picker is interactive-only — a non-interactive or agent run without `--skill` installs all 7. Use `npx skills add heygen-com/hyperframes --all` to install the complete published set deliberately (skips the picker), or `npx skills add heygen-com/hyperframes --skill <name>` for just one (bare name, no leading `/`).

Standalone installs stay lean after that: `npx hyperframes init` installs the **core set** only when it is missing and never touches a skill you already have (`npx hyperframes skills update` refreshes them, and never removes one); `/figma`, `/slideshow` and `/remotion-to-hyperframes` install **on demand** with `npx hyperframes skills update <name>`. Nothing re-pulls the full set behind your back.

### Plugin packages

Plugins bundle the full skill catalog and use their agent's update manager.
`bun run package:agent-plugin` builds the committed portable ZIP, source metadata,
and SHA-256 checksum. See the [maintainer checklist](docs/contributing/agent-plugins.mdx).

### Upload to Codex

Build the upload-ready Codex plugin archive from the committed `HEAD` version of the manifest, brand assets, and skills:

```bash
bun run package:codex-plugin
```

This writes `dist/hyperframes-plugin.zip` with a `hyperframes/` root folder and fails if the archive exceeds Codex's 100 MB upload limit.

### Core set

| Skill                   | Use when                                                                                                                                                                                                                                                                                            |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/hyperframes`          | **Read first** for any request to make, edit, animate or render a video, motion graphic, captions or overlays with HyperFrames (HTML rendered to video). Holds the render contract and the work loop, and points to the references for format, motion, look, captions, whole films and storyboards. |
| `/hyperframes-cli`      | The HyperFrames CLI by job — scaffold, check, look at frames, edit the timeline, preview, render locally or in the cloud, publish, project history — plus reading its JSON and recovering from build or render failures.                                                                            |
| `/hyperframes-registry` | About 450 ready-made blocks and components installed as editable source — transitions, overlays, titles, kinetic type, captions, charts, maps, 3D, camera moves. Use before hand-building any named visual; also for `hyperframes add` and `catalog`.                                               |
| `/media-use`            | Get or make any media for a video — music, sound effects, images, icons, logos, voiceover, avatar and generated video, transcripts, cutouts, colour grades and looks — with HeyGen or free local tools, and mix placed audio. Also for footage that looks dark, flat or dull.                       |

### On demand

| Skill                      | Use when                                                                                                                                                                                              |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/figma`                   | Bring Figma into a video — rendered assets, brand tokens, components, storyboard frames as reconstructed motion, shaders and connector-assisted motion. Use when you paste a figma.com link.          |
| `/slideshow`               | A presentation, pitch deck or interactive deck — discrete slides, fragment reveals, branching, hotspot navigation, presenter mode with speaker notes. Output is a navigable deck, not a rendered MP4. |

````

Also in the README (beyond line 120): the HTML example (`<div id="stage" data-composition-id="launch" ... >` with a `<video class="clip" data-start="0" data-duration="6">`, an `<h1 class="clip" data-start="1" data-duration="4">`, an `<audio data-volume="0.5">`, and `const tl = gsap.timeline({ paused: true }); tl.from("#title", { opacity: 0, y: 40, duration: 0.8 }, 1); window.__timelines.launch = tl;`), the sentence "The renderer seeks each frame in headless Chrome and encodes the result with FFmpeg, so the same input produces the same video.", the package table (cli, core, engine 'Seekable page-to-video capture engine using Puppeteer and FFmpeg', producer, studio, player, shader-transitions, aws-lambda), and the HyperFrames vs Remotion table quoted in the intro above.

---

## 5. Nate Herk's herk-edit-kit (2,499★, 2026-10-14) — HyperFrames skills tuned for reels/Shorts, incl. a 60 fps showreel


15 skills mirrored in `.claude/skills/` and `.agents/skills/`: cut-mistakes, cut-silences, edit-video, gsap, hyperframes, hyperframes-cli, hyperframes-registry, hyperframes-video-beats, make-a-video, motion-showreel, short-form-edit, short-form-video, style-library, video-storytelling, website-to-hyperframes. The README's showreel example is "15 seconds, 1920x1080, 60fps, cut to a 129 BPM grid". Two files are quoted in full because they are the most concrete 'rules that fix first renders' found anywhere:

### 5.1 MOTION_PHILOSOPHY.md (the 11 Laws, GSAP code dictionary, pre-flight checklist)

Source: `nateherkai/herk-edit-kit/MOTION_PHILOSOPHY.md`

````markdown
# MOTION PHILOSOPHY — The Gold Standard

> Deconstruction of the **Infinite — Global Payments** 30s spot. The reference every Hyperframes motion build aspires to. Re-read §0 and §4 before and during any creative session.

---

## 0 · The 11 Laws (memorize)

1. **One idea per beat. Cut fast.** Avg scene ≈ **1.5s**. Each visual lands ONE concept. If a scene says two things, split it.
2. **Black is the canvas.** ~90% of every frame is black or near-black. Negative space is the design.
3. **Light is the brand, not color.** Chrome gradients, halos, vignettes, light beams. The piece is *lit*, not *colored*.
4. **Camera never sleeps.** Grid recedes, coin rotates, particles drift, vignette breathes. Static = death.
5. **Motion blur is a feature.** Every transition rides a streak/blur trail — masks the cut AND conveys energy.
6. **Object metaphors carry meaning.** Red card = broken. Teal coin = working. Same coin returns 3×.
7. **Palette is symbolic, not decorative.** Each color owns one concept. If you can't name its meaning, it hasn't earned its place.
8. **Type is a character.** Words SCALE 8×, MORPH, GLOW. Typography drives ~60% of storytelling.
9. **Hold the hero shot.** Logo reveal ~2s. Outro card 5+s. Kinetic chaos → calm = catharsis.
10. **One unifying texture.** Perspective grid + crosshair (+) markers are the spine of the whole piece.
11. **Timelines must fill their slots.** HF hides a sub-composition the moment `timeline.duration()` < `data-duration` → black-frame flash. Every timeline ends with `tl.to({}, { duration: SLOT_DURATION }, 0)`. Non-negotiable. (Recipe §3.5; diagnostic §4.)

**Three-act structure / rule of threes:** problem→brand · benefits→surfaces→products · foundation→CTA→silence. 3 benefits, 3 surfaces, 3 product names, 3 coins.

---

## 2 · Visual Vocabulary

### 2.1 Core Backgrounds

- **Perspective grid floor** — always. `<div>` with `transform: perspective(900px) rotateX(60deg)` + two `repeating-linear-gradient` axes at `rgba(255,255,255,.05) 0 1px, transparent 1px 80px`. GSAP animates `background-position-y` for parallax.
- **Vignette** — always on top. `radial-gradient(ellipse at center, transparent 30%, #000 95%)`, `pointer-events: none`.
- **Grain overlay** — always. `npx hyperframes add grain-overlay`.
- **Sparkle particles** (grid scenes) — 20–40 absolute `+` shapes at random intersections, GSAP `stagger.from('random')` opacity, `repeat: -1, yoyo: true`.
- **Iridescent gradient stage** (wheel scenes) — soft conic-gradient or pre-rendered `<video muted loop>` for true chromatic shimmer.
- **Conical light beam** (finales) — `conic-gradient(from 180deg at 50% 0%, transparent, rgba(0,255,200,.15) 50%, transparent)`, blurred.
- **Liquid-glass card** — 4-stop diagonal gradient `rgba(255,255,255,.075/.025/.010/.055)` + `backdrop-filter: blur(14px) saturate(1.12)` + inner highlight `inset 0 1px 0 rgba(255,255,255,.22)` + 1px border. Inner highlight is the iOS-26 tell.

### 2.2 Type System

- **Single sans-serif.** Geometric, generous tracking (Inter, Suisse Int'l, SF Pro).
- **Chrome gradient on all headlines:** `background: linear-gradient(180deg, #fff 0%, #999 60%, #ccc 100%); -webkit-background-clip: text; color: transparent;`
- **Halo glow on emphasis:** `text-shadow: 0 0 20px rgba(255,255,255,0.6), 0 0 40px rgba(255,255,255,0.3)`
- **Word-by-word reveal** (not character-by-character):
  ```html
  <span class="clip word" data-start="0.0">Global</span>
  <span class="clip word" data-start="0.4">payments</span>
  ```
  `tl.from('.word', { y: 30, opacity: 0, scale: 0.85, duration: 0.6, ease: 'power3.out', stagger: 0.35 })`
- **Type SCALES dramatically.** Labels 48px. Hero kinetic-type 480px+. Animate via `scale`.
- **Title Case for emphasis**, not sentence-case.
- **Chrome-gradient sweep.** 8-stop gradient with DARK BOOKENDS (prevents edge tear):
  ```css
  background: linear-gradient(90deg,
    #14110a 0%, #14110a 15%,
    #5a3215 25%, #c84f1c 40%, #e2b53f 55%, #2a8a7c 70%,
    #14110a 85%, #14110a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 300% 100%;
  background-position: 100% 0;
  ```
  Tween `backgroundPosition` `100% 0` → `0% 0` over `0.6s` `power2.out`, `stagger: 0.04`.
- **Word-reveal carrier.** First word carries momentum with a 360px slide; tail words decay: `360 → 120 → 60 → 25 → 12px`. Carrier `expo.out 0.33s`; tail `power2.out 0.20s`. Anchor to Whisper onsets. On punchlines, lead the VISUAL 0.2s ahead of audio — reads as inevitable.
- **Per-beat font discipline.** Every beat uses a DIFFERENT Google Fonts family; the contrast sells "different universes." Roster: Instrument Serif · Space Grotesk · Bebas Neue · Inter · EB Garamond italic · Cormorant Garamond italic · Azeret Mono · Geist · JetBrains Mono / SF Mono.

### 2.3 Color Discipline

For every new scene, name the one color carrying the beat. If you can't, you haven't earned it.

Reference palette (Infinite-spot specific — AIS or other briefs override): Chrome white→gray `#fff → #999` (premium/brand voice) · Red `#e10b1f` (problem/broken) · Teal `#33d4c8`/`#5ee2d9` (solution/core) · Magenta/purple `#a155ff`/`#7e42d8` (speed/energy/API) · Blue `#3b82f6`/`#5db4ff` (connection/global) · Neon orange/yellow `#ff9430`/`#ffd84a` (value/affordability).

**Palette cap: 5 active hues, each with a meaning.** Over that, you're decorating.

### 2.4 Motion Vocabulary

| Move | GSAP recipe |
|------|-------------|
| **Camera dolly through type** | `tl.fromTo(text, { scale: 1, opacity: 1 }, { scale: 8, opacity: 0, duration: 1.5, ease: 'power2.in' })` |
| **Light-streak whip** | `gsap.fromTo(streak, { xPercent: -150 }, { xPercent: 250, duration: 0.4, ease: 'power3.in' })` — fire AT the cut |
| **Word ghost reveal** | `stagger: 0.35` with exits at `+= 0.5` → 0.15s overlap |
| **Object morph drift** | `to A: { x: 200, scale: 0.5, opacity: 0 }`, `from B: { x: -200, scale: 0.5, opacity: 0 }`, both 0.5s. Light streak hides swap. |
| **Coin spin reveal** | `tl.from(coin, { rotateY: 90, duration: 0.8, ease: 'back.out(1.4)' })` — needs `transform-style: preserve-3d` |
| **Crystallize → wordmark** | Two aligned timelines: coin scales 1→0.3 + moves to logo pos, wordmark fades 0→1, both end at same X/Y |
| **Energy pulse along path** | SVG `stroke-dasharray + stroke-dashoffset` 1→0; node `boxShadow` tween at path end |
| **Color recolor (no cut)** | `tl.to(':root', { '--accent': '#ff9430', duration: 0.6 })` — CSS vars |
| **Slide-up phone reveal** | `tl.from(phone, { y: '100%', duration: 1, ease: 'power3.out' }).from(headline, { y: 30, opacity: 0, duration: 0.6 }, 0.3)` |
| **Wheel + side-panel** | `tl.to(wheel, { rotation: 120, duration: 1.5 }).from(panel, { x: -100, opacity: 0, duration: 0.6 }, '<0.3')` |
| **Floating cluster drift** | `gsap.to(coins, { y: '-=15', duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut', stagger: { each: 0.4, from: 'random' } })` |
| **Vignette breath** | `gsap.to(vignette, { opacity: 0.9, duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut' })` |
| **Cut-the-curve vertical whip** (default adjacent-beat transition) | **Exit:** `tl.to(wrap, { y: -150, filter: "blur(30px)", duration: 0.33, ease: "power2.in" })` · **Entry:** `gsap.set(wrap, { y: 150, filter: "blur(30px)" })` then `tl.to(wrap, { y: 0, filter: "blur(0px)", duration: 1.0, ease: "power2.out" }, 0)` — same direction both sides, velocity matched at the cut |

**Transitions menu:** light-streak whip (default) · cross-warp morph (object→object) · color recolor (related ideas same comp) · slide-up (product mockups) · flash-through-white (act break) · swirl-vortex (product-family rotations). Registry blocks for most: `whip-pan`, `cross-warp-morph`, `flash-through-white`, `swirl-vortex`, `cinematic-zoom`, `chromatic-radial-split`.

### 2.5 Pacing

- **Scene length:** 1.0–2.0s. Longer only for hero moments or outro.
- **Reveal cadence:** new element every 0.3–0.6s within a scene. No dead air > 1s mid-piece.
- **Word stagger:** 0.3–0.4s narrative, 0.5–0.6s dramatic.
- **Whip transition:** 0.3–0.4s.
- **Holds:** logo crystallize 1.5–2s · CTA card 4–6s · section headlines 1–1.5s after full reveal.
- **Breathing rule:** every ~7–8s of kinetic density, give a 1s rest beat.

### 2.6 Audio Mix

Every audio scene sets `data-volume` explicitly. Default to a 0.15 warm pad, not a music track.

| Layer | `data-volume` | Role |
|------|---------------|------|
| Voiceover | `1.0` | Primary, drives timing |
| Underscore (warm pad) | `0.15` | Barely there |
| SFX (clicks, whooshes) | `0.2` | Tails bleed into next beat |

Wire as sibling `<audio>` elements in root, never inside `<video>`.

---

## 3 · HyperFrames Recipes

### 3.1 Grid background (re-use everywhere)

```html
<div class="stage" data-composition-id="...">
  <div class="grid-floor clip" data-start="0" data-duration="30" data-track-index="0"></div>
  <svg class="crosshairs clip" data-start="0" data-duration="30" data-track-index="1">
    <!-- 16 + marks at grid intersections -->
  </svg>
  <div class="vignette clip" data-start="0" data-duration="30" data-track-index="9"></div>
  <div class="grain    clip" data-start="0" data-duration="30" data-track-index="10"></div>
  <!-- Content in tracks 2–8 -->
</div>

<style>
.grid-floor {
  position: absolute; inset: 0;
  transform: perspective(900px) rotateX(60deg) translateY(20%);
  background:
    repeating-linear-gradient(0deg,  rgba(255,255,255,.05) 0 1px, transparent 1px 80px),
    repeating-linear-gradient(90deg, rgba(255,255,255,.05) 0 1px, transparent 1px 80px);
  background-color: #000;
}
.vignette {
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(ellipse at center, transparent 30%, #000 95%);
}
</style>
```

### 3.2 Whip-streak transition

```html
<div class="whip-streak clip" data-start="3.6" data-duration="0.4" data-track-index="8"></div>

<style>
.whip-streak {
  position: absolute; top: 50%; left: 0;
  width: 40%; height: 8px;
  background: linear-gradient(90deg, transparent, #fff, transparent);
  filter: blur(6px); transform: translateY(-50%);
}
</style>

<script>
gsap.fromTo('.whip-streak',
  { xPercent: -100, scaleX: 0.5 },
  { xPercent: 250, scaleX: 1.5, duration: 0.4, ease: 'power3.in' }
);
</script>
```

Next scene's `data-start` lands at the streak's peak (~halfway through) so the cut hides in the brightness.

### 3.3 Color Recolor Trick (no cut)

```html
<div class="flowchart" style="--edge: #5db4ff; --node-glow: rgba(91,180,255,.6);">
  <!-- nodes use var(--edge) for borders, var(--node-glow) for shadow -->
</div>

<script>
tl.to('.flowchart', {
  '--edge': '#ffd84a',
  '--node-glow': 'rgba(255,148,48,0.7)',
  duration: 0.6, ease: 'power2.inOut'
}, 2.5);
</script>
```

Same DOM, meaning shifts (Global → Affordable). Cheap to build, expensive to look at.

### 3.4 3D objects — pre-render or CSS?

- Iridescent chrome / chromatic refraction → **pre-render MP4** (alpha or loop). WebGL overkill.
- Planar motion, spinning flat textures → **CSS 3D + GSAP**.
- Card with motion blur → PNG + `filter: blur()` keyframe at peak.

### 3.5 Timeline-padding rule (framework-critical)

Every sub-composition ends its timeline with a no-op anchor:

```js
const tl = gsap.timeline({ paused: true });
// … tweens …
tl.to({}, { duration: SLOT_DURATION }, 0);  // forces timeline.duration() >= SLOT_DURATION
window.__timelines['my-comp'] = tl;
```

HF sets `visibility: hidden` when `timeline.duration() < data-duration` — black-frame flash at the beat tail. The anchor has zero animation cost but keeps the composition alive for its full slot.

### 3.6 GSAP proxy pattern (Canvas 2D / shaders in a timeline)

Drive procedural rendering from a single tween advancing a proxy time value:

```js
const proxy = { time: 0 };
tl.to(proxy, {
  time: DURATION, duration: DURATION, ease: "none",
  onUpdate: () => renderAtTime(proxy.time)
}, 0);
```

Rules:
1. **Canvas 2D is headless-safe; live WebGL can stall the render.** Ship a Canvas 2D fallback keyed off `renderOptions.headless`.
2. **No `Math.random()` / `Date.now()`.** Use seeded PRNGs or harmonic-sin hashes — renders must be deterministic.

### 3.7 `<video>` poster + lastframe bracketing

`<video>` tags flicker on startup and black-frame after source ends. Bracket with static JPG stills:

```html
<img id="beat-poster"    src="assets/beat4-poster.jpg">
<video id="beat-video"   src="assets/beat4-clip.mp4"
       data-start="7.1" data-duration="8.94" data-track-index="5" muted></video>
<img id="beat-lastframe" src="assets/beat4-lastframe.jpg">
```

```js
tl.set("#beat-poster",    { display: "none" }, 7.1);   // hand off at video-start
tl.set("#beat-lastframe", { opacity: 1 },      16.04); // cover video-end → beat-end
```

```bash
ffmpeg -y -ss 0        -i clip.mp4 -frames:v 1 -q:v 2 poster.jpg
ffmpeg -y -sseof -0.04 -i clip.mp4 -frames:v 1 -q:v 2 lastframe.jpg
```

### 3.8 Captions as body-level siblings

Keep captions OUT of sub-composition timelines. Place in `index.html` outside the master composition `<div>`, each with unique `data-track-index ≥ 20`:

```html
<div class="cap clip" data-start="7.29"  data-duration="1.86" data-track-index="30">HyperFrames by HeyGen.</div>
<div class="cap clip" data-start="9.10"  data-duration="3.44" data-track-index="31">Agents write HTML and render MP4s.</div>

<style>
.cap {
  position: absolute; bottom: 72px; left: 50%; transform: translateX(-50%);
  padding: 12px 22px; border-radius: 14px;
  background: rgba(10, 8, 5, 0.55);
  backdrop-filter: blur(8px);
  font: 500 28px/1.3 Inter, sans-serif; color: #fff;
}
</style>
```

### 3.9 Tween-comment convention

Every entry/exit tween's comment names the matching tween in the adjacent beat:

```js
// ENTRY — blur de-ramps from 22px to match outgoing "circle" beat's 22px exit.
gsap.set(wrap, { filter: "blur(22px)" });
tl.to(wrap, { filter: "blur(0px)", duration: 0.33, ease: "power2.out" }, 0);

// EXIT — matches incoming "engine" beat's 150px y + 30px blur entry.
tl.to(wrap, { y: -150, filter: "blur(30px)", duration: 0.33, ease: "power2.in" }, 1.89);
```

If you can't name the matching tween, you haven't designed the seam.

---

## 4 · Pre-flight Checklist (before claiming "done")

- [ ] **Avg scene length ≤ 2s** in mid-section
- [ ] **No dead air > 1s** outside deliberate holds
- [ ] **Every transition uses motion** (no hard fades)
- [ ] **Palette ≤ 5 active hues**, each with a meaning
- [ ] **Every text block uses chrome gradient + halo** — no flat white
- [ ] **Grid + crosshairs in ≥ 60% of scenes**
- [ ] **Vignette + grain on every scene**
- [ ] **One callback minimum** — a visual that returns later
- [ ] **Outro holds 4+ seconds**
- [ ] **Visual verification done** — frames extracted, Read, confirmed: no cropped faces, no text overflow, no beat on wrong word, no broken transitions
- [ ] **Every timeline ends with `tl.to({}, { duration: SLOT_DURATION }, 0)`** (Law #11)
- [ ] **All tween end-times snap to multiples of `1/fps`** — steep-tail easings (`expo.in`, `power4.in`) alias at sub-frame boundaries
- [ ] **Ran the timeline-duration diagnostic:**
  ```js
  const p = document.querySelector('hyperframes-player');
  const iw = p.shadowRoot.querySelector('iframe').contentWindow;
  Object.fromEntries(Object.entries(iw.__timelines).map(([k, v]) =>
    [k, +v.duration().toFixed(4)]));
  ```
  Any gap where `timeline.duration() < data-duration` is a black-frame risk.

### 4.1 GSAP Code Dictionary

| Purpose | Ease | Duration |
|---|---|---|
| Word reveal (slide-in) | `expo.out` | 0.20–0.33s |
| Generic enter | `power2.out` | 0.2–0.5s |
| Generic exit | `power2.in` | 0.2–0.33s |
| Beat whip EXIT | `expo.in` / `power2.in` | 0.2–0.33s |
| Beat whip ENTRY | `expo.out` / `power2.out` | 0.5–1.0s |
| Camera pan between stops | `power2.inOut` | 1.2–2.3s |
| Linear hold (after entry) | `"none"` | 0.4–0.65s |
| Bouncy card settle | `back.out(1.2–1.5)` | 0.3–0.5s |
| UI overshoot | `elastic.out(1, 0.3–0.4)` | 0.20s |
| Breathe / drift | `sine.inOut` yoyo | 2–4s, `repeat: -1` |

**Staggers:** chrome sweep across words `0.04` · dot-grid ripple per-column `0.019`, within-column `0.004` · code-stream lines `0.06`.

**No `gsap.defaults()`** — declare ease/duration per tween. Inheritance bugs are harder to diagnose than verbose tweens.

**Timeline skeleton:**
```js
(() => {
  const tl = gsap.timeline({ paused: true });
  // … tweens …
  tl.to({}, { duration: SLOT_DURATION }, 0);  // Law #11 anchor
  window.__timelines['<data-composition-id>'] = tl;
})();
```
Key must match `data-composition-id` exactly.

---

## 5 · Anti-patterns (beyond Law inversions)

- ❌ **`Math.random()` / `Date.now()` / unseeded PRNGs in a render loop.** Use harmonic hashes: `80 + 220 * Math.abs(Math.sin(i*0.7 + 0.3) * Math.cos(i*1.3 + 0.7))`.
- ❌ **Leaning on `npx hyperframes add <block>` for benchmark pieces.** The HF launch video installs ZERO registry blocks. Registry = velocity; hand-built = reference quality.
- ❌ **Shipping without viewing frames.** Lint passing ≠ design working. **VIEW THE FRAMES.**
- ❌ **Decorative grain or vignette.** Not decoration — unifying *texture*. Every scene, every time.

---

## 6 · TL;DR

> **One idea per beat, lit not colored, kinetic not still, callbacks not novelty, hold the hero, breathe the outro — the grid is always under everything, every timeline fills its slot, every exit snaps to a frame boundary, and every cut hides inside a motion-blurred whip.**

````

### 5.2 .claude/skills/short-form-video/SKILL.md (9:16 scaffold, karaoke captions, the 10 rules, word-exact frame verification gate)

Source: `nateherkai/herk-edit-kit/.claude/skills/short-form-video/SKILL.md`

````markdown
---
name: short-form-video
description: Maintain the existing May Shorts teaching compositions using their legacy face-mode, scene-overlay, and karaoke-caption patterns. Use only when working on those examples or explicitly requesting this legacy scaffold. For new reels, Shorts, or short advertisements, use short-form-edit.
---

# Short-Form Vertical Video (Hyperframes)

Short-form = 1080x1920 vertical, 10–30s, talking-head face + motion-graphic scene overlays + karaoke captions. Everything in this skill is distilled from the May Shorts 19 iteration autopsy (v1 → v4) and is preserved for maintenance of those examples. Use `short-form-edit` for new recordings.

**Always invoke `/hyperframes` first.** This skill sits on top of it — it does not replace the framework rules (`data-*` attributes, `window.__timelines`, composition structure). Those are non-negotiable regardless of the format.

## When this skill fires

- Maintaining the existing May Shorts examples.
- Explicitly requesting their legacy four-layer scaffold.

## The playbook (high-level)

1. **Audio is source of truth.** Edit audio FIRST (cut retakes, pauses). Save as `<name>-edit.mp4`. Measure exact duration with `ffprobe` — this is the composition's `data-duration`.
2. **Transcribe the edited audio** with the root `scripts/transcribe-elevenlabs.mjs` helper (ElevenLabs Scribe), a student-selected alternative normalized per `docs/TOOLS-AND-API-KEYS.md`, or if retiming an existing build with a `shift()` function in captions, keep the existing captions and just shift scene starts.
3. **Author scene boundaries in edited-time** — NEVER mix original-time and edited-time anchors in the same file. See "Audio-sync protocol" below.
4. **Build the composition scaffold** (4 layers: ambient-bg, seam-treatment, captions, face) — see "Composition scaffold" below.
5. **Author scenes with LOCAL offsets** relative to each scene's `data-start`. Each scene is its own sub-composition under `compositions/scene<N>-<label>.html`.
6. **Lint → draft render → word-exact frame verification → final render.** This is the verification gate. Never skip step 3 (frame verification).

## Composition scaffold (the 4 always-on layers)

Every short-form vertical has these four sub-compositions under `compositions/`, loaded on shared tracks:

```
index.html (root, 1080x1920, data-composition-id="main")
├── ambient-bg.html        track-index="3" — radial gradient + drift grid + particles + vignette
├── face-wrapper + <video> track-index="0" — talking head (see face-mode choreography)
├── seam-treatment.html    track-index="5" — feathers y=960 edge (bottom-half scenes only)
├── scene1-<label>.html    track-index="1" — scene overlays (back-to-back, no gaps)
├── scene2-<label>.html    track-index="1"
├── …
└── captions.html          track-index="2" — karaoke captions, word-synced
```

- `data-duration` is identical across root, ambient-bg, seam-treatment, face-video, face-audio, captions. Only scene overlays change over time.
- `<audio>` for the face is a SEPARATE element (mixer needs it), never use the video's own audio track.
- `class="clip"` goes on timed divs — NEVER on `<video>` or `<audio>`.

## Face-mode choreography (the signature move of short-form)

The face lives in a wrapper div sized at the source's native landscape (1920x1080). GSAP animates the WRAPPER (never the video element — animating `<video>` dimensions freezes frames).

Two modes:

```js
const BOTTOM     = { x: 0,       y: 1136, scale: 0.5625 }; // bottom-half, full landscape visible
const FULLSCREEN = { x: -1166.5, y: 0,    scale: 1.7778 }; // cropped-cover, fills 1080x1920
const MODE_DUR = 0.32;
```

`BOTTOM` renders the 1920x1080 source at 1080x607.5 centered in the bottom 960px. `FULLSCREEN` crops horizontally to fill the portrait frame.

**Transition 0.15s BEFORE the new scene's content lands**, using `ease: "expo.inOut"`:

```js
[
  { t: <scene-4-start>, mode: FULLSCREEN },
  { t: <scene-5-start>, mode: BOTTOM },
  …
].forEach(({ t, mode }) => {
  mainTl.to("#face-wrapper", { ...mode, duration: MODE_DUR, ease: "expo.inOut" }, t - 0.15);
});
```

A face that snaps modes instantly is the single most jarring frame in a vertical video. Always interpolate.

### Face grading (every short, no exceptions)

```css
#face-video {
  filter: contrast(1.08) saturate(1.08) brightness(0.97);
}
```

Plus a subtle 1.00 → 1.025 Ken Burns zoom over the full duration (`ease: "none"`) and a side-vignette `::after` pseudo-element so the face sinks into the surrounding navy instead of butting against a razor edge.

### Seam treatment (required for bottom-half scenes)

A navy→transparent gradient band (60–100px) at y=960 plus a 2px accent scan line with soft glow. Draw it AFTER the face so it sits on top; full-screen scenes will cover it when they take over. Razor-sharp y=960 cuts are the #2 tell for AI-edited content (after background flatness).

## Audio-sync protocol (DO NOT skip)

**Problem:** if audio is edited (retakes/pauses removed), timestamps in the source transcript no longer match the edited video. Scene starts authored in original-time will fire late.

**The rule:** ALL timing lives in edited-time. Never mix.

**Verification procedure for any short-form retime:**

1. Measure both audio files:
   ```bash
   ffprobe -v error -show_entries format=duration -of csv=p=0 assets/original.mp4
   ffprobe -v error -show_entries format=duration -of csv=p=0 assets/<name>-edit.mp4
   ```
   Difference = total cut time.
2. If using a `shift()` function in `captions.html` to map transcript words, treat that as the source of truth. The map `shift(originalTime) = editedTime` applies to EVERY scene `data-start` too.
3. Scene internal offsets (inside `compositions/sceneN.html`) are LOCAL relative to the scene's `data-start`. If a scene's parent `data-start` is correct in edited-time, internal offsets stay correct WITHOUT modification — UNLESS a scene straddles a cut, in which case both the parent duration AND internal offsets shift.
4. Face-mode transition array times MUST use edited-time. They are NOT automatically shifted.

**Plan format for retimes** (use this table structure every time):

| Scene | Current start | Current dur | New start | New dur | Rationale |
|-------|---------------|-------------|-----------|---------|-----------|
| ...   | ...           | ...         | ...       | ...     | ...       |

Then the face-mode array, then any internal-offset changes, then frame-verification list.

## Scene authoring

One scene = one sub-composition file. Scenes sit on the same `data-track-index` back-to-back (no gaps). Inside each scene:

- `data-duration` matches the parent's slot exactly
- All GSAP anchors are LOCAL (0-based from scene start)
- Use `tl.set({}, {}, <data-duration>)` to pad the timeline so GSAP `tl.duration()` matches `data-duration`

### Scene pacing rules (from the 10 principles)

- **No dead frames.** Every 100ms has ≥1 animating element. Offset first entrance 0.1–0.3s, not t=0.
- **Payoff ≥ 1s hold.** The "big reveal" of the scene (stamp, number lock, punchline) must have ≥1s on screen, ideally 1.5s. Budget scenes by reveal time, not total time.
- **Motion through full duration.** If entrance anims all land by local 2s on a 4s scene, add secondary motion: underline sweeps, checkmark pops, ambient drift on cards, small oscillating glows on pills. Dead pacing = swipe-away.
- **Vary eases.** At least 3 different eases per scene across entrances.
- **One jaw-dropper per 5s of runtime.** Typography slam, glitch/chromatic reveal, whip-pan, audio-sync slam. Without these, the video reads as "labeled talking head" — correct but forgettable.

## Captions (karaoke style)

- Montserrat 900, 46–58px (for 1080 width), 100% white base
- Active word: scale-1.08 pop + color change to accent (`#37bdf8` for AIS, adapt to brand)
- Stroke via layered `text-shadow`, NEVER `-webkit-text-stroke` (renders inconsistently in Chromium render)
- Drop the rgba background pill — let the stroke hold readability. Captions should feel like graffiti on the frame, not a subtitle track.
- For retimes, use a `shift()` function inside `captions.html` to map transcript word timestamps → edited-time. This keeps the transcript JSON untouched and makes retimes mechanical.

See `references/captions.md` under `/hyperframes` for the full karaoke implementation. TL;DR: per-word `<span>` elements with `data-word-start`, GSAP tweens scoped to each span, tight 0.08–0.12s pop durations.

## Ambient background (never ship flat navy)

Minimum viable background stack:

1. **Radial gradient base** (center lighter than edges by 15–20%)
2. **Animated noise/grain overlay** at 8–12% opacity
3. **4–8 drifting particle dots** or grid traces
4. **Subtle vignette**

`background: #07121c` alone is a placeholder, not a design. For techy/control-room aesthetic, use the 6-layer stack from `feedback_techy_background_layers.md` (HUD grid masked to vignette + circuit traces + pulse nodes + scan beam + telemetry ticker + corner mono labels).

## Audio reactivity

- Headlines pulse 3–6% on beat. Backgrounds can go 10–30% on bass.
- Text reactivity kept subtle (3–6%) so captions stay readable; backgrounds can push harder.
- Use a SEEDED offline analyser (pre-compute the audio feature track) so renders are deterministic. Do NOT use `AnalyserNode` in the render path — `Math.random()` and real-time audio nodes break determinism.

## Transitions

- **Rotate flavors.** No two consecutive transitions the same type. Six hard cuts in a row is the #1 tell for AI editing.
- Face-mode transitions (`BOTTOM ↔ FULLSCREEN`) double as scene transitions when the mode changes between scenes.
- For pure overlay scene-to-scene, install from registry: `push-up`, `flash-through-white`, `sdf-iris`, or the full shader-transitions pack. `npx hyperframes catalog --type block` to browse.

## The verification gate (mandatory — DO NOT ship without)

Lint passing ≠ design working. Never report a short-form render done until you have extracted frames at word-exact timestamps and READ every PNG.

### Step 1 — draft render

```bash
cd video-projects/<slug>
npx hyperframes lint
npx hyperframes render --quality draft --output renders/<slug>-vN-draft.mp4
```

### Step 2 — word-exact frame extraction

Pick 8–15 timestamps that each correspond to a SPOKEN WORD where a specific visual should be on-screen. Not round numbers. Not mid-scene. The exact word.

```bash
mkdir -p renders/frames-vN
for pair in "<t>:<label>" "<t>:<label>" ...; do
  t="${pair%%:*}"; label="${pair##*:}"
  ffmpeg -y -ss "$t" -i renders/<slug>-vN-draft.mp4 \
    -frames:v 1 -q:v 2 "renders/frames-vN/t${t}-${label}.png"
done
```

### Step 3 — Read every PNG

Call `Read` on every PNG so the image loads into context. Do NOT just list filenames. For each frame confirm:

- The expected visual is on-screen at the expected moment (not 1s late, not early)
- Speaker's face is not cropped in any bottom-half scene
- Full-screen vs bottom-half face mode is correct for that scene
- Captions are on-brand, readable, not overflowing
- No blank frames, no unintentional overlap, no text-off-canvas

### Step 4 — if anything fails, fix + re-verify. Never ship broken.

### Step 5 — final render

```bash
npx hyperframes render --quality standard --output renders/<slug>-vN.mp4
```

Spot-check 3–4 frames from the final render (same timestamps, different folder `frames-vN-final/`) to confirm the standard-quality encode didn't change anything.

## The 10 rules (quality checklist — run BEFORE first draft)

Every short-form build. Run this list during authoring, not after.

1. **No dead frames.** Every 100ms has an animating element.
2. **Scene payoff ≥ 1s hold.** Budget by reveal time, not total time.
3. **Face is a character.** Grade + Ken Burns + side vignette.
4. **No hard seams.** Feather y=960 with gradient + scan line.
5. **One jaw-dropper per 5s.** Typography slam, glitch, whip-pan, audio slam.
6. **Audio reactivity non-negotiable.** 3–6% text, 10–30% background.
7. **Rotate transition flavors.** No two consecutive the same.
8. **Captions pop, don't politely label.** Stroke not pill. Scale + color on active word.
9. **Motion through full scene duration.** Secondary motion if entrances land early.
10. **Background is a layer, not a color.** Radial + noise + particles + vignette minimum.
11. **Slam/stamp overlays land AFTER target text is fully visible.** Reveal logic > word-sync. Stamp `t` ≥ target-visible `t` + 0.10–0.25s. Otherwise the punchline lands before the setup.

## Project structure (every short-form project)

```
video-projects/<slug>/
├── hyperframes.json
├── meta.json                    (id, name, dimensions 1080x1920, fps 30)
├── index.html                   (root composition, the 4-layer scaffold)
├── compositions/
│   ├── ambient-bg.html
│   ├── seam-treatment.html
│   ├── captions.html            (with shift() function if retiming)
│   ├── scene1-<label>.html
│   ├── scene2-<label>.html
│   └── ...
├── assets/
│   ├── <name>.mp4               (original recording)
│   ├── <name>-edit.mp4          (edited — cuts removed — this is what the comp uses)
│   ├── transcript.json          (whisper output)
│   └── brand assets (logo, brand-tokens.css, background music)
└── renders/
    ├── <slug>-v1-draft.mp4
    ├── frames-v1/
    ├── <slug>-v1.mp4
    └── ...
```

## Retime protocol (when audio is re-edited or timestamps drift)

1. Measure old and new edited audio durations with `ffprobe`. Delta = total cut time.
2. Identify cut window(s): which seconds were removed, from where.
3. Write the Plan table: every scene `data-start`, `data-duration`, every face-mode transition `t`, any scene whose internal offsets straddle a cut.
4. For each scene that straddles a cut, both its parent duration AND its internal offsets change. Scenes entirely on one side of the cut just need parent `data-start` shifted.
5. Lint → draft render → word-exact frame verify → final render. No shortcuts.

## What NOT to do in short-form

- Don't animate `<video>` element dimensions — freezes frames. Animate wrapper div.
- Don't use `repeat: -1` on any timeline — breaks the capture engine. Finite counts only.
- Don't use `Math.random()` or `Date.now()` — breaks determinism. Seeded PRNG if pseudo-random needed.
- Don't use `<br>` inside captions — natural wrapping + `<br>` produces extra unwanted breaks.
- Don't skip the frame verification gate. Lint exit code is not visual truth.
- Don't author in original-time if the audio is edited. Edited-time or nothing.
- Don't leave `background: #07121c` flat. Layer it.
- Don't hard-cut between scenes. Rotate transition flavors.
- Don't polite-caption. Pop them.
- Don't let the face sit still. Grade + Ken Burns always.

## Lessons from may-shorts-18 (v1 → v2)

Distilled from the 4 concrete problems the v1 render had and what fixed them in v2. Apply these on every new short.

### 1. Slam/stamp timing — reveal logic beats word-sync

A SLAM/STAMP overlay (KILLED, DEAD, STOP, etc.) lands AFTER its target text is fully visible, **not** during the spoken word. In may-shorts-18 v1 scene 1, CLAUDE and CHATGPT were pitched as opponents — KILLED fired at local 0.46s while CHATGPT didn't appear until 0.66s, so viewers saw "Claude … KILLED" with no visible target. The joke collapsed.

**Rule:** `stamp_t ≥ target-text-visible_t + 0.10–0.25s`. The "visible" timestamp is the END of the target's entrance animation, not its start. Word-sync is a guideline; visual reveal order is the constraint.

### 2. BOTTOM face-mode scale — don't ship the default

Default `BOTTOM = { x: 0, y: 1136, scale: 0.5625 }` (exact horizontal fit for a 1920×1080 source) leaves empty studio background flanking the speaker if they occupy <70% of the source frame. This is the default in may-shorts-19 and was copied into may-shorts-18 v1 — both videos had visible dead space left and right of the speaker in every BOTTOM scene.

**Rule:** prefer `BOTTOM = { x: -180, y: 1110, scale: 0.75 }` — crops 180px each side, bottom-anchors to y=1920. Preview ONE frame of BOTTOM mode against the actual source video before committing the constant. If the source speaker is tight-framed already, scale 0.65 may be enough; if the source is wide studio framing, push to scale 0.80 and re-tune x.

Always keep HIDDEN's `x`, `y`, `scale` identical to BOTTOM — they only differ in `opacity` — so the opacity-fade scenes don't drift geometrically mid-fade.

### 3. Face-mode transitions — three things at once, not one

When the face changes mode between adjacent scenes, a bare 0.15s pre-roll + 0.32s duration `expo.inOut` on just the face wrapper reads as rigid — the outgoing scene's panels are still fully opaque behind the morphing face, so the eye sees two things fighting instead of a crossfade.

**Rule:** for any "hero" scene-to-scene face-mode change (especially BOTTOM ↔ FULLSCREEN), do all three:
1. Extend that specific transition's duration to 0.45–0.55s (not the default 0.32s)
2. Start it 0.25–0.30s before the new scene's `data-start` (not the default 0.15s)
3. Fade + blur the outgoing scene's panel wrapper to `opacity: 0, filter: blur(6px)` over 0.20–0.25s, starting 0.25s before scene end

Implementation-wise, promote the face-mode transition array to per-entry `dur` so one transition can be longer than the others:
```js
[ { t: 2.06, mode: FULLSCREEN, dur: 0.50 }, { t: 3.71, mode: HIDDEN, dur: 0.32 }, ... ]
  .forEach(({ t, mode, dur }) => mainTl.to("#face-wrapper", { ...mode, duration: dur, ease: "expo.inOut" }, t));
```

Three simultaneous changes = "a real editor edited this." Any one alone = rigid.

### 4. Data-feel scenes beat decoration scenes mid-video

For scenes 3–5 of a 15–20s short (the "middle grind" where attention drops the hardest), lean on visuals that read as information — bar races, stat grids with counting numbers, heatmaps, sparklines, flowcharts, dashboard chrome with telemetry ticking, pain-point grids that flash red in sequence. may-shorts-18 v1 scene 4 was a radar-rings + terminal-chip + sparks combo — functional but decorative, and Nate called it "bland." v2 replaced it with a 3×3 pain-point grid lighting up red-orange in sequence + a sparkline stroke-drawing with a YOU-ARE-HERE marker + the payoff slam — same time budget, much higher engagement.

**Rule:** pure typography-plus-icon scenes feel like slides. Data-feel scenes feel like evidence. When a middle scene feels bland, replace the decoration with something that reads as *information*: a small number ticking up, a bar filling, a chart stroking in, a grid flashing in sequence.

## Reference compositions

- `video-projects/may-shorts-19/` — the canonical short-form example (18.84s, 1080x1920, 7 scenes, face-mode choreography, karaoke captions with shift(), ambient bg + seam treatment). Read `index.html` and any `compositions/scene*.html` before authoring a new short.
- `video-projects/may-shorts-18/` — secondary reference with the 4 lessons above baked in: BOTTOM scale=0.75, KILLED stamp timed after CHATGPT reveal, scene-1→2 fluid fade, scene 4 data-dashboard "THE PATTERN" grid.

## Related skills (invoke in addition)

- `/hyperframes` — framework rules (always first)
- `/hyperframes-cli` — CLI commands (init, lint, preview, render)
- `/gsap` — animation library reference
- `/hyperframes-registry` — installing transition blocks
- `/seedance-loop-prompt` — if the short needs an AI-generated looping background video

## Memory pointers (relevant feedback entries)

- `feedback_short_form_principles.md` — the 10 rules, full rationale
- `feedback_contrast_technique.md` — glow localization + text-shadow halos + brightening dim text
- `feedback_techy_background_layers.md` — 6-layer control-room background stack
- `feedback_visual_verification.md` — the verification gate
- `project_ais_brand_specs.md` — if the short is AIS-branded (hex codes, fonts, logo glow)

````

### 5.3 .claude/skills/motion-showreel/SKILL.md ('The grammar' — 60P, BPM grid, one motif)

Source: `nateherkai/herk-edit-kit/.claude/skills/motion-showreel/SKILL.md` (first 60 lines of 190; rest omitted)

````markdown
---
name: motion-showreel
description: Design and build a 10-30 second motion-design showreel or brand reel in the style of Nate's Opus 5.5 "CLAUDE / MOTION REEL": one brand motif transformed through labeled craft chapters, a persistent HUD, cuts locked to a 120-130 BPM grid, a sub-second flurry, and a held logo lockup that answers the opening. Use when asked for a showreel, sizzle reel, brand reel, motion reel, "a reel like the Opus one", "show off motion design for <brand>", a 15-second brand film cut to music, or to study why a reference reel works and rebuild that energy for another brand.
---

# Motion Showreel

A showreel promises that every frame was a decision. This skill turns that into a
repeatable build: pick one motif, push it through six or seven craft chapters that
each look nothing alike, cut on the beat, and end on the motif.

The style source is [the reference breakdown](references/reference-breakdown.md), a
measured second-by-second analysis of the reel this skill was built from. Read it first.
Techniques per chapter live in [the chapter library](references/chapter-library.md).

## The grammar

1. **One motif, transformed.** Pick the brand's most reduced element (a dot, a play
   triangle, a letter, a logo corner). It opens the reel, turns into each chapter's
   material, and closes the reel as punctuation in the lockup. Nearly every
   transition turns the current object into the next one. Hard cuts are reserved
   for the flurry.
2. **Labeled craft chapters.** Six or seven, each named in the HUD by the discipline
   it demonstrates (`01 · SQUASH & STRETCH`). Use the brand's own words when it has
   them (YouTube has "chapters" and an "end screen").
3. **Show the work.** Every chapter gets one tool overlay: a physics readout, a
   selection box with a cursor, a parameter panel, a bezier graph, or a brand-native
   equivalent (a search bar, a counter, a settings menu).
4. **Persistent HUD.** Corner crop marks, a title line top left, a spec line top
   right (`1920×1080 · 60P · 129 BPM`, blinking dot), timecode bottom left, a
   progress ruler with chapter gaps bottom center, and the chapter label bottom
   right. Mono caps, tracking 0.2em, about 16px. It flips ink/paper with the
   background. Start from [the HUD template](templates/hud.html).
5. **Ink, paper, one accent, and one held-back color.** The held-back color only
   appears in the climax flurry. Every chapter change flips value (dark/light) or
   saturation (neutral/full-bleed accent).
6. **Cut on the beat, animate on the off-beats.** 120-130 BPM. Every hard cut,
   flash, and invert lands within 2 frames of a grid line. One pre-drop gap (music
   ducked for half a beat) comes before the midpoint hit.
7. **Accelerate, then hold.** For 15s at about 129 BPM (32 beats): physics intro 4
   beats, type chapter 8 beats with an internal invert, three 4-beat chapters (drop
   in the middle), a flurry of about 6 cuts in 4 beats (one beat each, then half
   beats), then about 4 beats of lockup. Roughly 75% development, 13% flurry, and
   12% resolve.
8. **Density breathes.** One object, then a wall of type, a grid of 100, thousands
   of particles, one hero object, the flurry, and one word again.
9. **Three type voices.** A heavy display face for statements, a contrasting accent
   voice (an italic serif, or the brand's UI face), and wide-tracked mono for the
   machine layer. Type also works as texture: repeated into wallpaper, banded, and
   inverted.
10. **Physical finish.** Squash and stretch, motion blur on fast moves, bloom on
    light-on-dark, slight chromatic fringe, grain, vignette, and a dot grid on dark
    frames. It should look photographed, not exported.
11. **Bookend.** The lockup resolves from noise, a rule draws, the subtitles type on
    with a block cursor, the motif lands as the final punctuation with a squash, and
    a quiet tagline arrives last.

## Workflow

Run the scripts from the kit root. They need Node 22+ and FFmpeg with ffprobe.

````

---

## 6. Other code-video frameworks' agent rules


**Motion Canvas** (motion-canvas/motion-canvas, 19,642★, MIT, last push 2026-07-02): cloned and searched; no AGENTS.md, CLAUDE.md, SKILL.md, .cursorrules, llms.txt or copilot-instructions anywhere (only `.github/{CODEOWNERS,ISSUE_TEMPLATE,workflows}`). No official agent guidance exists.

**Revideo** (midrender/revideo, 4,165★, MIT, last push 2026-07-15; the GitHub redirect from redotvideo/revideo): no agent rule files. README line: "A scene is plain TypeScript, so Claude or Codex can produce one from a prompt." and "Revideo borrows concepts from Remotion and Rive, but is, in its core, zero dep." It is the engine behind Midrender.

**Manim** (ManimCommunity/manim 42,128★ MIT, last push 2026-11-02; 3b1b/manim 95,995★): no agent rule files in either repo. Community Claude skills found via GitHub search: Yusuke710/manim-skill (190★, MIT, quoted below), wilwaldon/Claude-Code-Video-Toolkit (104★, 'Skills, MCP servers, and tools for producing video with Claude Code. Covers programmatic video (Remotion, Manim), screen recording, YouTube clipping, and FFmpeg post-processing'), AmitSubhash/3brown1blue (42★, '21 rule files'), awesome-skills/manim-skill (10★), vumichien/manim-skill (9★), AIPMAndy/Andy-Video-Skill (14★, '12 video-generation Skills for Claude Code — Manim, React Video…').

### 6.1 Yusuke710/manim-skill — skills/manim-skill/SKILL.md (note the 'inspect representative frames' + viewer feedback loop)

Source: `Yusuke710/manim-skill/skills/manim-skill/SKILL.md`

````markdown
---
name: manim-skill
description: Create mathematical animations with Manim Community Edition(manimce), with optional TTS voiceover and synced subtitles. Generates distinctive, production-grade animations that avoid generic "AI slop" aesthetics. Use when user wants to animate concepts, equations, illustrate proofs, visualize algorithms, create math explainers, or produce 3Blue1Brown-style videos.
---

You are a Manim animation expert. Create production-grade animations with Manim Community Edition (manimce).

## Contract

- For animation requests, continue until `video.mp4` exists; if blocked, return the exact blocker plainly.
- Deliver `script.py` and `video.mp4`. Do not create `plan.md` or a separate written scene plan unless the user explicitly requests one. Choose the visual design and scene structure directly in the animation code.

## Session Storage

**NEVER write artifacts into the user's working directory.** Every video is a flat session folder:

```
SESSION_DIR = ${MANIM_SKILL_HOME:-~/.manim-skill}/<project-slug>/
├── narration.txt    # spoken lines only (when narrated)
├── voiceover.mp3    # concatenated TTS audio
├── timestamps.json  # per-subtitle timing
├── script.py        # Manim code
├── concat.txt       # ffmpeg scene list
├── video.mp4        # final deliverable
└── media/           # manim output
```

`<project-slug>` is a short kebab-case topic name (append `-2`, `-3`, ... on collision). `TOOLS_DIR` is the `tools/` directory next to this SKILL.md. When the video is about the user's code or files, read those from their original location — only outputs go in `SESSION_DIR`.

**Setup — run once at the very start**, then stay in `SESSION_DIR` for every phase so outputs land there; substitute `<TOOLS_DIR>` in the commands below with its absolute path (the tools are invoked in place, never copied):

```bash
SESSION_DIR="${MANIM_SKILL_HOME:-$HOME/.manim-skill}/<project-slug>"
mkdir -p "$SESSION_DIR"
cd "$SESSION_DIR"
```

**Voiceover is on by default.** Skip narration, TTS, subtitle linting, muxing, and `add_subcaption()` only if the user asks for no TTS/narration/voiceover/captions, or the local `kokoro` package is not installed (then tell the user voiceover was skipped and that `uv add "kokoro>=0.9.4" soundfile` enables it).

## Workflow: Narration → TTS → Code → Render → Mux → View

### Phase 1: Narration

When voiceover is enabled, write only the spoken lines in `narration.txt`, using the exact format below. Each entry becomes one TTS clip. Kokoro speaks ≈2.5 words/second — size the lines to the target video length. For silent videos, start with Code.

```
subtitles:
- First voiceover line.
- Second voiceover line.
- Each entry becomes one TTS clip.
```

### Phase 2: TTS

```
python "<TOOLS_DIR>/tts-generate.py" --narration narration.txt
```

Local Kokoro voice `af_heart` by default; `--voice <name>` (e.g. `am_adam`, `bf_emma`) for another. Unchanged lines are served from `.tts-cache/`.

Produces `voiceover.mp3` and `timestamps.json`. The run prints how many clips it found — confirm it matches your narration line count (a mismatch means the block didn't parse; fix the format in `narration.txt`). **Read `timestamps.json` before writing code** — each `duration_s` is the exact time budget for that subtitle's segment.

### Phase 3: Code

Write `script.py`:

1. **One class per scene**, named descriptively (`Scene1_Introduction`, `Scene2_DerivePDE`) — this is what enables selective re-render during feedback and chapter navigation in the viewer.
2. **Render config lives in `script.py`** — set `config.pixel_width`, `config.pixel_height`, `config.frame_width`, `config.frame_height`, `config.frame_rate` there (it determines output paths). Iteration defaults unless the user asks otherwise:
   - `16:9` → 854×480, frame 16×9, 15 fps
   - `9:16` → 480×854, frame 9×16, 15 fps
   - `1:1` → 480×480, frame 8×8, 15 fps
   Keep the pixel and frame aspect ratios matched.
3. **Each narration line becomes exactly one `self.add_subcaption(text, duration=duration_s)` call — same text, same order** (a scene may hold several consecutive segments). Never burn subtitles in as text mobjects: `add_subcaption()` emits the per-scene `.srt` files the viewer uses; the linter simulates the calls in `script.py`. Inline each `duration_s` from `timestamps.json` as a literal, set explicit `run_time=` on every `play()`, keep total scheduled time (including `wait()` and `move_camera()`) within the budget, and end each segment with `self.wait(max(0, dur - used))`.
4. **`MathTex(...)` for formulas; prefer `Tex(...)` over `Text(...)` for prose** (Pango can produce odd letter spacing).

```python
from manim import *

class Scene1_Introduction(Scene):
    def construct(self):
        title = Tex("My Topic", font_size=48, color=BLUE)

        dur = 2.8        # duration_s from timestamps.json
        anim_rt = 1.5
        self.add_subcaption("Introduction to My Topic", duration=dur)
        self.play(Write(title), run_time=anim_rt)
        self.wait(max(0, dur - anim_rt))
```

### Phase 4: Render

For narrated videos, lint first — render only when it passes. Exit code 1 means timing issues; 2 means the simulation was incomplete or invalid. Fix the cause before rendering. Skip this check for silent videos:

```
python "<TOOLS_DIR>/lint-subtitles.py" script.py
```

```
manim script.py Scene1_Introduction Scene2_Main ...
```

Scenes land in `media/videos/script/<pixel_height>p<frame_rate:g>/SceneName.mp4`. Write `concat.txt` listing them in order (the viewer needs it for chapters):

```
file 'media/videos/script/480p15/Scene1_Introduction.mp4'
file 'media/videos/script/480p15/Scene2_Main.mp4'
```

```
ffmpeg -y -f concat -safe 0 -i concat.txt -c copy -movflags +faststart video_silent.mp4
```

**Without voiceover**, write `video.mp4` here instead and skip Phase 5.

### Phase 5: Mux

```
ffmpeg -y -i video_silent.mp4 -i voiceover.mp3 \
  -map 0:v:0 -map 1:a:0 \
  -c:v copy -c:a aac \
  -movflags +faststart video.mp4
```

Verify `video.mp4` with `ffprobe`, inspect representative frames for readability and layout, and check rendered audio/video sync when narrated. The linter is a simulation, not a substitute for these checks.

### Phase 6: View & Feedback

Launch the viewer from `SESSION_DIR`, in the background:

```
python3 <TOOLS_DIR>/video_viewer.py video.mp4 --order concat.txt --script script.py
```

It prints `VIDEO_READY http://localhost:<port>` and opens the browser. Tell the user the URL and the `SESSION_DIR` path.

The viewer's Capture button (`T`) drops timestamped lines into the feedback panel, e.g. `[0:07] Scene3_Identity: the c² label overlaps the triangle`. When feedback references a moment like that, extract that exact frame (`ffmpeg -y -ss 7 -i video.mp4 -vframes 1 f.png`) and Read it before touching code — seeing what the user saw beats guessing.

Then iterate:

1. If voiceover lines changed: edit `narration.txt`, re-run Phase 2 (unchanged lines are cache hits; `python "<TOOLS_DIR>/tts-generate.py" --bust <index or text fragment>` force-regenerates one clip), and update `script.py` to the new `timestamps.json`.
2. Fix the named scenes, lint when narrated, re-render **only the affected scenes**, re-mux.
3. The viewer serves the new `video.mp4` on reload; restart it only if it was stopped.

````

**Lottie.** `@remotion/lottie` guidance is section 1.23 above. LottieFiles ships two official MCP servers (docs.lottiefiles.com/en/platform/mcp, verified): (1) **LottieFiles MCP** — hosted, OAuth, account/workspace data + full GraphQL schema; endpoint `https://mcp.lottiefiles.com/mcp`; Claude Code install: `claude mcp add --transport http lottiefiles https://mcp.lottiefiles.com/mcp`; (2) **Lottie Creator MCP** — a separate *local* npm MCP that bridges to a Lottie Creator browser tab so an agent can build/edit animations (LottieFiles blog 'Lottie Creator Now Speaks MCP'). Unofficial: junmer/mcp-server-lottiefiles (19★, 2025-04, API-key search). LottieFiles also publishes an agent skill, LottieFiles/motion-design-skill (2,698★, MIT), quoted next — it is tool-agnostic motion-design doctrine (durations, eases, stagger budgets) and is directly reusable for Remotion.

### 6.2 LottieFiles/motion-design-skill — skills/motion-design/SKILL.md

Source: `LottieFiles/motion-design-skill/skills/motion-design/SKILL.md`

````markdown
---
name: motion-design
description: >
  Applies motion design principles to create emotionally-driven, technically sound animations and transitions.
  Provides timing, easing, choreography, and Disney animation principles adapted for UI.
  Use when creating animations, transitions, micro-interactions, loading states, page transitions,
  scroll-triggered effects, or any motion work. Works with CSS, Framer Motion, GSAP, Lottie, Spring,
  or any animation system.
license: MIT
metadata:
  author: LottieFiles
  version: "1.0.0"
---

# Motion Design Skill

## When to Apply

Use this skill when:
- Creating UI animations (buttons, cards, modals, page transitions)
- Designing micro-interactions and feedback animations
- Building loading, success, or error states
- Animating illustrations or decorative elements
- Planning scroll-triggered or progress-based animations
- Establishing brand motion identity
- Choreographing multi-element sequences

**Decision tree:**
1. Does it serve a functional purpose (feedback, guidance)? → Timing rules for responsiveness
2. Does it express brand personality? → Motion Personality archetypes
3. Does it tell a story or guide attention? → Disney principles + choreography
4. Is this a complex multi-element scene? → 1/3 Rule + stagger patterns

---

## Quick Reference: 8-Step Checklist

Before creating any animation:

1. **Emotional target?** — joy, calm, urgency, elegance
2. **Motion Personality?** — Playful, Premium, Corporate, Energetic
3. **Primary property?** — position, scale, rotation, opacity
4. **Duration?** — see duration table below
5. **Easing family?** — entrance=decelerate, exit=accelerate
6. **Hero element?** — apply staging principles
7. **Secondary + ambient layers?** — add richness
8. **1/3 rules?** — motion distance, simultaneous elements

---

## Three Pillars (CRITICAL)

Every animation must satisfy three pillars before any technical decisions:

| Pillar | Question | Drives |
|--------|----------|--------|
| **Emotional Intent** | What should the viewer FEEL? | Easing, timing, amplitude |
| **Visual Narrative** | What's the micro-story? | Setup → Action → Resolution |
| **Motion Craft** | How do we make it believable? | Physics, secondary motion, paths |

**Three motion layers** (flat animation = missing layers):
- **Primary**: Main action the viewer follows
- **Secondary**: Supporting richness (shadows, icons shifting)
- **Ambient**: Background life (gradients, subtle pulses)

> Deep dive: [director/core-philosophy.md](director/core-philosophy.md)

---

## Motion Personality

Select ONE archetype per project. Apply consistently.

| Archetype | Duration | Easing | Overshoot | Keywords |
|-----------|----------|--------|-----------|----------|
| **Playful** | 150-300ms | ease-out-back | 10-20% | fun, whimsical, bouncy, cute |
| **Premium** | 350-600ms | cubic-bezier(0.4,0,0.2,1) | 0% | elegant, minimal, luxury, sophisticated |
| **Corporate** | 200-400ms | cubic-bezier(0.2,0,0,1) | 0-3% | clean, professional, business, dashboard |
| **Energetic** | 100-250ms | ease-out-expo | 15-30% | dynamic, energetic, bold, exciting |

**Default**: Corporate for UI, Playful for illustrations.

**Brand Motion Identity** — define three constants:
1. **Signature easing**: One curve for 80% of animations
2. **Duration palette**: 3 durations (quick / standard / slow)
3. **Entrance pattern**: One consistent entry style

> Deep dive: [director/motion-personality.md](director/motion-personality.md)

---

## Property Selection

| Effect Goal | Primary Property | Secondary Properties |
|-------------|------------------|---------------------|
| Entrance/Exit | position | opacity, scale |
| Emphasis/Attention | scale | rotation (subtle), opacity pulse |
| State Change | opacity, color | scale (press feedback) |
| Direction/Flow | position | rotation (follow path) |
| Depth/3D Feel | scale + shadow | position (parallax) |
| Loading/Progress | rotation (spinner) | scale, opacity pulse |
| Success | scale (pop) | color, rotation (checkmark draw) |
| Error/Alert | position (shake) | color, rotation (wobble) |

**Simplicity threshold**: Use the minimum properties needed. One = direct. Two = polished. Three+ = potentially overwhelming.

> Deep dive: [reference/property-selection.md](reference/property-selection.md)

---

## Duration Table

| Element Type | Duration | Rationale |
|-------------|----------|-----------|
| Tooltip / micro-feedback | 80-120ms | Must feel instant |
| Button press / toggle | 120-180ms | Responsive feedback |
| Icon transition | 150-250ms | Clear state change |
| Card enter / exit | 200-350ms | Spatial awareness |
| Modal / dialog | 300-400ms | Focus shift |
| Page transition | 400-600ms | Context switch |
| Dramatic reveal | 600-1200ms | Theatrical build |

**Distance scales duration**: 100px = base. 200px = 1.3x. 400px = 1.6x.

**Enter > Exit**: Entrances 30-50% longer than exits. Users care about what appears.

**Interactive feedback**:
- Hover: <100ms
- Press: <150ms
- Release/settle: 200-300ms
- Error shake: 300-400ms (2-3 oscillations)

> Deep dive: [reference/timing-easing-tables.md](reference/timing-easing-tables.md)

---

## Easing Selection

**Directional rules**:
- **Entrance** → decelerate (fast start, gentle landing): ease-out family
- **Exit** → accelerate (gentle start, fast departure): ease-in family
- **On-screen** → smooth both ends: ease-in-out family
- **Looping ambient** → seamless: sine-based ease-in-out

**Industry standards**:

| Standard | Cubic Bezier | Use For |
|----------|-------------|---------|
| Material Design 3 | (0.2, 0, 0, 1) | Default on-screen |
| MD3 Emphasized | (0.05, 0.7, 0.1, 1) | Entrances, attention |
| MD3 Accelerate | (0.3, 0, 1, 1) | Exits, dismissals |
| Apple HIG | (0.25, 0.1, 0.25, 1) | Standard iOS |
| Snappy UI | (0.2, 0, 0, 1) | Fast, decisive |
| Gentle float | (0.4, 0, 0.2, 1) | Ambient, background |
| Bounce settle | (0.175, 0.885, 0.32, 1.275) | Overshoot, playful |

**Material-based easing**:

| Material | Duration Scale | Overshoot |
|----------|---------------|-----------|
| Rigid (metal, stone) | 1.2x | 0% |
| Elastic (rubber, gel) | 0.8x | 15-25% |
| Fluid (water, paint) | 1.5x | 5% |
| Paper (cards, sheets) | 1.0x | 3-5% |
| Gas (smoke, fog) | 2.0x | 0% |
| Glass (brittle) | 0.9x | 0% |

> Deep dive: [reference/timing-easing-tables.md](reference/timing-easing-tables.md)

---

## Common Patterns

### Button Press (Playful)
1. **Anticipation**: Scale to 0.97 (50ms, ease-out)
2. **Squash**: Scale to [1.04, 0.96] (100ms, ease-in)
3. **Follow through**: Overshoots to 1.02, settles to 1.0 (spring, 200ms)
4. **Secondary**: Shadow shrinks during press, icon shifts down 2px
5. **Total**: ~150ms press + 200ms settle

### Card Entrance (Premium)
1. **Start**: 20px below target, opacity 0
2. **Path**: Slight curve (10px X offset at midpoint)
3. **Easing**: ease-out-cubic deceleration
4. **Follow through**: Shadow arrives 50ms after card
5. **Secondary**: Content fades in 100ms after card lands
6. **Staging**: Other cards dim to 80%

### Success State (Playful)
1. **Primary**: Scale pop with ease-out-back
2. **Secondary**: Checkmark draws in
3. **Ambient**: Subtle particle burst
4. **Color**: Green fill
5. **Total**: 300-400ms

### Error Shake (Corporate)
1. **Primary**: Position oscillates 2-3 times, ±10-15px horizontal
2. **Easing**: ease-in-out for sharp stops
3. **Color**: Red tint
4. **Total**: 300-400ms
5. **No overshoot**: Errors feel firm

> More patterns: [patterns/entrance-exit.md](patterns/entrance-exit.md) | [patterns/state-feedback.md](patterns/state-feedback.md)

---

## Choreography Essentials

**Coordinated entry**:
- Lead with the hero — primary element enters first or most prominently
- Spatial consistency — all elements enter from same direction
- Counter-motion — hero moves right → ambient moves left at 20-30% speed

**1/3 Rule (distance)**: No motion travels more than 1/3 of screen without a keyframe change.

**1/3 Rule (elements)**: With 3+ elements, no more than 1/3 in active motion simultaneously.

**Stagger budgets**:

| Pattern | Delay | Total Budget | Use Case |
|---------|-------|-------------|----------|
| Micro cascade | 20-40ms | <200ms | List items, grid cells |
| Standard | 50-100ms | <400ms | Cards, panels, nav |
| Dramatic | 100-200ms | <600ms | Hero sections |
| Wave | 30-60ms | <500ms | Data visualizations |

**Critical**: Total stagger must stay under 500ms.

> Deep dive: [director/choreography.md](director/choreography.md)

---

## Emotion-to-Motion Map

| Emotion | Character | Path | Easing | Duration |
|---------|-----------|------|--------|----------|
| Joy | Bouncy, arcs | Curved, upward | ease-out-back | 200-400ms |
| Calm | Smooth, flowing | Gentle curves | sine ease-in-out | 500-1000ms |
| Urgency | Sharp, fast | Straight lines | ease-out | 100-200ms |
| Sadness | Slow, downward | Drooping curves | cubic ease-in-out | 600-1200ms |
| Surprise | Sudden, expanding | Radial outward | ease-out-expo | 150-300ms |
| Elegance | Slow, controlled | Long arcs | (0.4,0,0.2,1) | 400-700ms |
| Playfulness | Bouncy, irregular | Arcs, squiggly | ease-out-back | 200-350ms |

**Path as language**: Angular = tense. Curved = friendly. Spiral = whimsical. Diagonal = purposeful. Vertical = growth/weight. Horizontal = progress.

> Deep dive: [director/emotion-mapping.md](director/emotion-mapping.md)

---

## Weight Classification

| Weight | Examples | Duration | Overshoot | Easing |
|--------|----------|----------|-----------|--------|
| Heavy | Modals, overlays | 300-500ms | 0% | Gentle, high damping |
| Medium | Cards, panels | 200-350ms | 3-5% | Moderate |
| Light | Tooltips, badges, icons | 80-200ms | 5-15% | Responsive |

---

## Quality Rules

### CRITICAL — never break
1. **Never linear for spatial movement** — always use easing curves (linear only for spinners, progress bars)
2. **Never opacity-only** for important state changes — combine with position or scale
3. **Never exceed 1/3 screen** without intermediate keyframe
4. **Always three motion layers** — primary + secondary + ambient

### HIGH — strongly follow
1. Match duration to element type (see tables)
2. Use directional easing (ease-out entrance, ease-in exit)
3. Apply Disney principles (especially anticipation, follow-through)
4. Maintain consistent personality across scene

> Full checklist: [reference/quality-checklist.md](reference/quality-checklist.md)

---

## Troubleshooting Quick Reference

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| Looks robotic | Linear easing or no arcs | Add easing curves + arc paths |
| Feels too slow | Duration too long for element type | Check duration table, use ease-out |
| Feels cheap/flat | Missing secondary + ambient | Add shadow motion + background life |
| Too distracting | Too many elements moving | Apply 1/3 rule, reduce amplitude |
| No personality | Generic easing everywhere | Apply personality archetype consistently |

> Deep dive: [reference/troubleshooting.md](reference/troubleshooting.md)

---

## File Reference

**Philosophy** (director/):
- [core-philosophy.md](director/core-philosophy.md) — Three Pillars deep dive
- [decision-framework.md](director/decision-framework.md) — Full decision pipeline
- [disney-principles.md](director/disney-principles.md) — 12 principles, UI-adapted
- [motion-personality.md](director/motion-personality.md) — 4 archetypes + brand identity
- [emotion-mapping.md](director/emotion-mapping.md) — Emotion → motion + color psychology
- [choreography.md](director/choreography.md) — Multi-element coordination
- [narrative-structure.md](director/narrative-structure.md) — Micro-story framework
- [context-adaptation.md](director/context-adaptation.md) — Platform, a11y, performance

**Reference** (reference/):
- [timing-easing-tables.md](reference/timing-easing-tables.md) — Duration + easing lookups
- [property-selection.md](reference/property-selection.md) — Property communication guide
- [troubleshooting.md](reference/troubleshooting.md) — Animation smells + fixes
- [quality-checklist.md](reference/quality-checklist.md) — Evaluation criteria

**Patterns** (patterns/):
- [entrance-exit.md](patterns/entrance-exit.md) — Entrance/exit recipes
- [state-feedback.md](patterns/state-feedback.md) — Success, error, loading, hover
- [ambient-continuous.md](patterns/ambient-continuous.md) — Looping, breathing, parallax
- [multi-element.md](patterns/multi-element.md) — Stagger + choreography recipes

````

Supporting files in that skill (not quoted): director/{choreography,context-adaptation,core-philosophy,decision-framework,disney-principles,emotion-mapping,motion-personality,narrative-structure}.md, patterns/{ambient-continuous,entrance-exit,multi-element,state-feedback}.md, reference/{property-selection,quality-checklist,timing-easing-tables,troubleshooting}.md.

### 6.3 frankxai/awesome-motion-design-agent-skills — skills/remotion-video-agent/SKILL.md (small; shows the '60 FPS only when motion quality requires it' default)

Source: `frankxai/awesome-motion-design-agent-skills/skills/remotion-video-agent/SKILL.md`

````markdown
---
name: remotion-video-agent
description: Use when creating or editing Remotion videos, programmatic explainers, motion graphics, MP4 renders, GIF renders, social cutdowns, or React-authored video templates.
---

# Remotion Video Agent

## Workflow

1. Confirm the composition format: aspect ratio, duration, FPS, destination, and voice/music requirements.
2. Break the video into scenes with frame ranges.
3. Build scenes as React components with deterministic timing.
4. Use Remotion helpers for interpolation, sequencing, audio, static files, and rendering.
5. Prefer MP4 for delivery. Use GIF only for previews or documentation.
6. Render and inspect before final delivery.

## Useful Defaults

- 30 FPS for general video.
- 60 FPS only when motion quality requires it.
- 1080x1920 for vertical social.
- 1920x1080 for YouTube/demo.
- 1200x630 or 1600x900 for launch preview loops.

## QA

- No text cut off.
- No scene timing dead air.
- Motion supports the script.
- Assets are licensed or owned.
- Audio levels are not clipped.
- GIF exports are size-conscious.


````

That list's README also catalogs (with its own star counts as of 2026-09-28): greensock/gsap-skills (official GSAP skills, 'MIT · 15.8k★'; our 2026-11-02 check: 17,716★), remotion-dev/skills, LottieFiles/motion-design-skill, Orkas-AI/Orkas-VideoStudio ('14-skill video pack driven by plan.json'), garrytan/gstack, nexu-io/open-design, NVIDIA/SkillSpector.

---

## 7. Anthropic / Claude official video, motion, design things


**anthropics/skills** (186,563★, cloned; HEAD 2026-10-28 'Update mcp-builder skill'). Skills present: academy-guide, algorithmic-art, brand-guidelines, canvas-design, claude-api, discernment-nudge, doc-coauthoring, docx, frontend-design, internal-comms, mcp-builder, pdf, pptx, skill-creator, slack-gif-creator, theme-factory, web-artifacts-builder, webapp-testing, xlsx, plus `template/SKILL.md`. **There is no video, motion, Remotion, animation-timeline or 'Claude Motion' skill.** The animation-adjacent ones are `slack-gif-creator` (PIL frame-by-frame GIFs with an easing module), `algorithmic-art` (p5.js, seeded randomness) and `frontend-design` (has one paragraph on motion restraint). `canvas-design` is static posters.

**Claude Design** (verified at https://www.anthropic.com/news/claude-design-anthropic-labs, published Apr 17 2026): "Today, we're launching Claude Design, a new Anthropic Labs product that lets you collaborate with Claude to create polished visual work like designs, prototypes, slides, one-pagers, and more." … "Anyone can build code-powered prototypes with voice, video, shaders, 3D and built-in AI." … "Claude packages everything into a handoff bundle that you can pass to Claude Code with a single instruction." … "Claude Design is available for Claude Pro, Max, Team, and Enterprise subscribers." The page does **not** mention 'Claude Motion' or 'Imagine with Claude'. HyperFrames has a 'Claude Design guide' (https://hyperframes.heygen.com/guides/claude-design) for handing Claude Design output into video.

**'Claude Motion'**: UNVERIFIED. Only third-party blogs (eesel.ai, Oct 2026) claim an Anthropic 'Claude Motion' animation tool exporting MP4; no anthropic.com page found via search. **'Imagine with Claude'**: not found anywhere.

### 7.1 anthropics/skills — skills/frontend-design/SKILL.md (the motion paragraph: 'A single orchestrated moment … lands better than scattered effects; fade-and-slide-up entrances on each section … read as AI-generated')

Source: `anthropics/skills/skills/frontend-design/SKILL.md`

````markdown
---
name: frontend-design
description: Guidance for distinctive, intentional visual design when building new UI or reshaping an existing one. Helps with aesthetic direction, typography, and making choices that don't read as templated defaults.
license: Complete terms in LICENSE.txt
---

# Frontend Design

Approach this as the design lead at a design studio known for giving every client a distinct visual identity that is not mistaken for anyone else's. This client has already rejected proposals that felt cliché or templated, and is paying for a distinctive point of view: make deliberate, opinionated choices about palette, typography, and layout that are specific to this brief, and take aesthetic risk if justified.

## Ground your designs in the subject matter

If the brief does not identify what the product or subject matter is, identify it yourself before designing, and confirm with the client. You can come up with one concrete subject, the design's audience, and the design's primary job, as a proposal. If there's any information in your memory about the client's preferences or context about what they're building, use that as a hint. The subject's industry, subject matter, materials, and vernacular are where distinctive visual choices come from — a design for a toy for girls aged 8–11 will be very aesthetically different from a dashboard for financial analysts. Build with the brief's real content and subject matter throughout.

## Design principles

For web designs, the hero is the first thing viewers will see. Open with the most characteristic thing in the subject's world, in the form that is most appropriate: a headline, an image, an animation, a live demo, an interactive moment, or other treatments. Be deliberate with your choice: a big number with a small label, supporting stats, and a gradient accent is the default treatment, so only use it if that's truly the best option.

Typography carries the personality of the page. You don't need a different typeface for display or headline text and body content: use one family or two, and if two, make them clearly distinct.

Choose your typefaces deliberately, not the default families you would reach for on any other project, and set a clear type scale following the default guidance of The Elements of Typographic Style with intentional weights, widths, and spacing. When type is used as a headline or visual element, use the type treatment itself as an active part of the design, not a neutral delivery vehicle for the content.

Default to line lengths of less than 80 characters. Serif typefaces can have slightly longer line lengths; give serif body text slightly more line-height than a sans-serif.

Avoid these default typographic treatments; they are the commonest tells of a generated page:
- Accenting just a single word or phrase in a headline, like putting one word in italic/bold or a different color.
- Using all caps for labels.
- Adding unnecessary typographic labels above content.

Visual structure is information. Structural devices like outlines, borders, numbering, eyebrows, dividers, labels, etc., encode useful information about the content rather than decorate it. Many generic designs use numbered markers (01 / 02 / 03), but that's only appropriate if the content actually is a sequence — like a stepped process or a timeline. Before adding numbered markers, check the content really is a sequence.

Use non-user-triggered motion sparingly and deliberately, only to draw attention. A single orchestrated moment — one page-load sequence or one reveal — lands better than scattered effects; fade-and-slide-up entrances on each section and hover transitions on every card are the generic default and read as AI-generated. Motion that answers a person's action (opening, expanding, confirming) is welcome when it shows what changed.

Consider written content carefully. Often a design brief may not contain real content, and it's up to you to come up with copy and placeholder content. Copy can make a design feel as templated as the design itself. See the below section on writing for more guidance.

## Process: plan, review against the brief, build, critique

For calibration, AI-generated design right now clusters around some traits:
1. a warm cream background (near #F4F1EA) with a high-contrast serif display and a terracotta or warm-clay accent (often near #D97757 — Anthropic's own Claude-interaction accent, so on a user's brief it reads as a tell);
2. a near-black background with a single bright acid-green or vermilion accent;
3. a broadsheet-style layout with hairline rules, zero border-radius, and dense newspaper-like columns;
4. the SaaS-card kit: content chopped into identical rounded cards, one border-radius on everything regardless of hierarchy, the same soft grey shadow (rgba(0,0,0,.1)) under each, and gradient washes as decoration;
5. template chrome that appears whatever the subject: a tracked-out ALL-CAPS eyebrow label above every heading; meta strings joined with middle dots ('A · B · C'); labels built as 'WORD — fragment' with a spaced em dash; tinted near-black (#0B0B0B, #111) standing in for black; a monospace face for small data labels; a '→' appended to link and button text.

All traits are legitimate for some briefs, but they are defaults rather than choices, and they appear regardless of subject. Where the brief pins down a visual direction, follow it exactly — the brief's own words always win, including when it asks for one of these looks. Where it leaves an axis free, don't spend that freedom on one of these defaults. As with a hired human designer, there's often a careful balance between doing what you're good at and taking each project as a chance to experiment and learn.

Work in two passes. First, brainstorm a short design plan based on the client's design brief: create a compact token system with color, type, layout, and principles.
- Color: describe the core base palette as 4–6 named hex values.
- Type: the typefaces and their roles.
- Layout: a layout concept, using one-sentence prose descriptions and ASCII wireframes to ideate and compare. Include alignment guidance; should the content be left aligned, center aligned, justified?
- Principles: the high-level guidance for what makes this page unique.

Then review that plan against the brief before building: if any part of it reads like the generic default you would produce for any similar page (work through a similar prompt to see if you arrive somewhere similar) rather than a choice made for this specific brief — revise that part, say what you changed and why. Only after you've confirmed the relative uniqueness of your design plan should you start to write the code, following the revised plan.

When writing the code, be careful of structuring your CSS selector specificities. It's easy to generate CSS classes that cancel each other out (especially with a type-based selector like .section and an element-based selector like .cta). This can happen often with padding/margin between sections.

## Restraint and self-critique

Spend your boldness in one place. Let one element be the memorable thing, keep everything around it quiet and disciplined, and cut any decoration that does not serve the brief. Build to a quality floor without announcing it: responsive down to mobile, visible keyboard focus, reduced motion respected, visually accessible, harmonious color palettes. Critique your own work as you build, taking screenshots to review if your environment supports it — a picture is worth 1000 tokens. Consider Chanel's advice: before leaving the house, take a look in the mirror and remove one accessory. Human creatives have memory and always try to do something new, so if you have a space to quickly jot down notes about what you've tried, it can help you in future passes.

## More on writing in design

Words appear in a design for one reason: to make it easier to understand and use. They are design content, not decoration. Bring the same intentionality and minimalism to copywriting that you would bring to spacing and color. Before writing anything, ask what the design needs to say, and how it can best be said to help the person navigate the experience.

Write from the end user's perspective. Name things by what users will understand in simple language, not by how the system is built. A user manages notifications, not webhook config. Describe what something is or does in plain terms rather than selling it. Being specific and legible to new users is always better than being clever.

Use active voice as default. A CTA says exactly what happens when it is used: "Save changes," not "Submit." An action keeps the same name through the whole flow, so the button that says "Publish" produces a toast that says "Published." The vocabulary of an interface is the signposting for someone navigating the product. Cohesion and consistency are how people learn their way around.

Treat failure and emptiness as moments for direction, not mood. Explain what went wrong and how to fix it, in the interface's voice rather than a person's. Errors don't apologize, and they are never vague about what happened. An empty screen is an invitation to act.

Keep the tone conversational: plain verbs, sentence case, no filler, with tone matched to the brand and the audience. Let each written element do exactly one job.

````

### 7.2 anthropics/skills — skills/canvas-design/SKILL.md

Source: `anthropics/skills/skills/canvas-design/SKILL.md`

````markdown
---
name: canvas-design
description: Create beautiful visual art in .png and .pdf documents using design philosophy. You should use this skill when the user asks to create a poster, piece of art, design, or other static piece. Create original visual designs, never copying existing artists' work to avoid copyright violations.
license: Complete terms in LICENSE.txt
---

These are instructions for creating design philosophies - aesthetic movements that are then EXPRESSED VISUALLY. Output only .md files, .pdf files, and .png files.

Complete this in two steps:
1. Design Philosophy Creation (.md file)
2. Express by creating it on a canvas (.pdf file or .png file)

First, undertake this task:

## DESIGN PHILOSOPHY CREATION

To begin, create a VISUAL PHILOSOPHY (not layouts or templates) that will be interpreted through:
- Form, space, color, composition
- Images, graphics, shapes, patterns
- Minimal text as visual accent

### THE CRITICAL UNDERSTANDING
- What is received: Some subtle input or instructions by the user that should be taken into account, but used as a foundation; it should not constrain creative freedom.
- What is created: A design philosophy/aesthetic movement.
- What happens next: Then, the same version receives the philosophy and EXPRESSES IT VISUALLY - creating artifacts that are 90% visual design, 10% essential text.

Consider this approach:
- Write a manifesto for an art movement
- The next phase involves making the artwork

The philosophy must emphasize: Visual expression. Spatial communication. Artistic interpretation. Minimal words.

### HOW TO GENERATE A VISUAL PHILOSOPHY

**Name the movement** (1-2 words): "Brutalist Joy" / "Chromatic Silence" / "Metabolist Dreams"

**Articulate the philosophy** (4-6 paragraphs - concise but complete):

To capture the VISUAL essence, express how the philosophy manifests through:
- Space and form
- Color and material
- Scale and rhythm
- Composition and balance
- Visual hierarchy

**CRITICAL GUIDELINES:**
- **Avoid redundancy**: Each design aspect should be mentioned once. Avoid repeating points about color theory, spatial relationships, or typographic principles unless adding new depth.
- **Emphasize craftsmanship REPEATEDLY**: The philosophy MUST stress multiple times that the final work should appear as though it took countless hours to create, was labored over with care, and comes from someone at the absolute top of their field. This framing is essential - repeat phrases like "meticulously crafted," "the product of deep expertise," "painstaking attention," "master-level execution."
- **Leave creative space**: Remain specific about the aesthetic direction, but concise enough that the next Claude has room to make interpretive choices also at a extremely high level of craftmanship.

The philosophy must guide the next version to express ideas VISUALLY, not through text. Information lives in design, not paragraphs.

### PHILOSOPHY EXAMPLES

**"Concrete Poetry"**
Philosophy: Communication through monumental form and bold geometry.
Visual expression: Massive color blocks, sculptural typography (huge single words, tiny labels), Brutalist spatial divisions, Polish poster energy meets Le Corbusier. Ideas expressed through visual weight and spatial tension, not explanation. Text as rare, powerful gesture - never paragraphs, only essential words integrated into the visual architecture. Every element placed with the precision of a master craftsman.

**"Chromatic Language"**
Philosophy: Color as the primary information system.
Visual expression: Geometric precision where color zones create meaning. Typography minimal - small sans-serif labels letting chromatic fields communicate. Think Josef Albers' interaction meets data visualization. Information encoded spatially and chromatically. Words only to anchor what color already shows. The result of painstaking chromatic calibration.

**"Analog Meditation"**
Philosophy: Quiet visual contemplation through texture and breathing room.
Visual expression: Paper grain, ink bleeds, vast negative space. Photography and illustration dominate. Typography whispered (small, restrained, serving the visual). Japanese photobook aesthetic. Images breathe across pages. Text appears sparingly - short phrases, never explanatory blocks. Each composition balanced with the care of a meditation practice.

**"Organic Systems"**
Philosophy: Natural clustering and modular growth patterns.
Visual expression: Rounded forms, organic arrangements, color from nature through architecture. Information shown through visual diagrams, spatial relationships, iconography. Text only for key labels floating in space. The composition tells the story through expert spatial orchestration.

**"Geometric Silence"**
Philosophy: Pure order and restraint.
Visual expression: Grid-based precision, bold photography or stark graphics, dramatic negative space. Typography precise but minimal - small essential text, large quiet zones. Swiss formalism meets Brutalist material honesty. Structure communicates, not words. Every alignment the work of countless refinements.

*These are condensed examples. The actual design philosophy should be 4-6 substantial paragraphs.*

### ESSENTIAL PRINCIPLES
- **VISUAL PHILOSOPHY**: Create an aesthetic worldview to be expressed through design
- **MINIMAL TEXT**: Always emphasize that text is sparse, essential-only, integrated as visual element - never lengthy
- **SPATIAL EXPRESSION**: Ideas communicate through space, form, color, composition - not paragraphs
- **ARTISTIC FREEDOM**: The next Claude interprets the philosophy visually - provide creative room
- **PURE DESIGN**: This is about making ART OBJECTS, not documents with decoration
- **EXPERT CRAFTSMANSHIP**: Repeatedly emphasize the final work must look meticulously crafted, labored over with care, the product of countless hours by someone at the top of their field

**The design philosophy should be 4-6 paragraphs long.** Fill it with poetic design philosophy that brings together the core vision. Avoid repeating the same points. Keep the design philosophy generic without mentioning the intention of the art, as if it can be used wherever. Output the design philosophy as a .md file.

---

## DEDUCING THE SUBTLE REFERENCE

**CRITICAL STEP**: Before creating the canvas, identify the subtle conceptual thread from the original request.

**THE ESSENTIAL PRINCIPLE**:
The topic is a **subtle, niche reference embedded within the art itself** - not always literal, always sophisticated. Someone familiar with the subject should feel it intuitively, while others simply experience a masterful abstract composition. The design philosophy provides the aesthetic language. The deduced topic provides the soul - the quiet conceptual DNA woven invisibly into form, color, and composition.

This is **VERY IMPORTANT**: The reference must be refined so it enhances the work's depth without announcing itself. Think like a jazz musician quoting another song - only those who know will catch it, but everyone appreciates the music.

---

## CANVAS CREATION

With both the philosophy and the conceptual framework established, express it on a canvas. Take a moment to gather thoughts and clear the mind. Use the design philosophy created and the instructions below to craft a masterpiece, embodying all aspects of the philosophy with expert craftsmanship.

**IMPORTANT**: For any type of content, even if the user requests something for a movie/game/book, the approach should still be sophisticated. Never lose sight of the idea that this should be art, not something that's cartoony or amateur.

To create museum or magazine quality work, use the design philosophy as the foundation. Create one single page, highly visual, design-forward PDF or PNG output (unless asked for more pages). Generally use repeating patterns and perfect shapes. Treat the abstract philosophical design as if it were a scientific bible, borrowing the visual language of systematic observation—dense accumulation of marks, repeated elements, or layered patterns that build meaning through patient repetition and reward sustained viewing. Add sparse, clinical typography and systematic reference markers that suggest this could be a diagram from an imaginary discipline, treating the invisible subject with the same reverence typically reserved for documenting observable phenomena. Anchor the piece with simple phrase(s) or details positioned subtly, using a limited color palette that feels intentional and cohesive. Embrace the paradox of using analytical visual language to express ideas about human experience: the result should feel like an artifact that proves something ephemeral can be studied, mapped, and understood through careful attention. This is true art. 

**Text as a contextual element**: Text is always minimal and visual-first, but let context guide whether that means whisper-quiet labels or bold typographic gestures. A punk venue poster might have larger, more aggressive type than a minimalist ceramics studio identity. Most of the time, font should be thin. All use of fonts must be design-forward and prioritize visual communication. Regardless of text scale, nothing falls off the page and nothing overlaps. Every element must be contained within the canvas boundaries with proper margins. Check carefully that all text, graphics, and visual elements have breathing room and clear separation. This is non-negotiable for professional execution. **IMPORTANT: Use different fonts if writing text. Search the `./canvas-fonts` directory. Regardless of approach, sophistication is non-negotiable.**

Download and use whatever fonts are needed to make this a reality. Get creative by making the typography actually part of the art itself -- if the art is abstract, bring the font onto the canvas, not typeset digitally.

To push boundaries, follow design instinct/intuition while using the philosophy as a guiding principle. Embrace ultimate design freedom and choice. Push aesthetics and design to the frontier. 

**CRITICAL**: To achieve human-crafted quality (not AI-generated), create work that looks like it took countless hours. Make it appear as though someone at the absolute top of their field labored over every detail with painstaking care. Ensure the composition, spacing, color choices, typography - everything screams expert-level craftsmanship. Double-check that nothing overlaps, formatting is flawless, every detail perfect. Create something that could be shown to people to prove expertise and rank as undeniably impressive.

Output the final result as a single, downloadable .pdf or .png file, alongside the design philosophy used as a .md file.

---

## FINAL STEP

**IMPORTANT**: The user ALREADY said "It isn't perfect enough. It must be pristine, a masterpiece if craftsmanship, as if it were about to be displayed in a museum."

**CRITICAL**: To refine the work, avoid adding more graphics; instead refine what has been created and make it extremely crisp, respecting the design philosophy and the principles of minimalism entirely. Rather than adding a fun filter or refactoring a font, consider how to make the existing composition more cohesive with the art. If the instinct is to call a new function or draw a new shape, STOP and instead ask: "How can I make what's already here more of a piece of art?"

Take a second pass. Go back to the code and refine/polish further to make this a philosophically designed masterpiece.

## MULTI-PAGE OPTION

To create additional pages when requested, create more creative pages along the same lines as the design philosophy but distinctly different as well. Bundle those pages in the same .pdf or many .pngs. Treat the first page as just a single page in a whole coffee table book waiting to be filled. Make the next pages unique twists and memories of the original. Have them almost tell a story in a very tasteful way. Exercise full creative freedom.
````

### 7.3 anthropics/skills — skills/algorithmic-art/SKILL.md (frontmatter + seeded-randomness rule; full file is 400 lines of p5.js viewer instructions)

Source: `anthropics/skills/skills/algorithmic-art/SKILL.md` (first 60 lines of 404; rest omitted)

````markdown
---
name: algorithmic-art
description: Creating algorithmic art using p5.js with seeded randomness and interactive parameter exploration. Use this when users request creating art using code, generative art, algorithmic art, flow fields, or particle systems. Create original algorithmic art rather than copying existing artists' work to avoid copyright violations.
license: Complete terms in LICENSE.txt
---

Algorithmic philosophies are computational aesthetic movements that are then expressed through code. Output .md files (philosophy), .html files (interactive viewer), and .js files (generative algorithms).

This happens in two steps:
1. Algorithmic Philosophy Creation (.md file)
2. Express by creating p5.js generative art (.html + .js files)

First, undertake this task:

## ALGORITHMIC PHILOSOPHY CREATION

To begin, create an ALGORITHMIC PHILOSOPHY (not static images or templates) that will be interpreted through:
- Computational processes, emergent behavior, mathematical beauty
- Seeded randomness, noise fields, organic systems
- Particles, flows, fields, forces
- Parametric variation and controlled chaos

### THE CRITICAL UNDERSTANDING
- What is received: Some subtle input or instructions by the user to take into account, but use as a foundation; it should not constrain creative freedom.
- What is created: An algorithmic philosophy/generative aesthetic movement.
- What happens next: The same version receives the philosophy and EXPRESSES IT IN CODE - creating p5.js sketches that are 90% algorithmic generation, 10% essential parameters.

Consider this approach:
- Write a manifesto for a generative art movement
- The next phase involves writing the algorithm that brings it to life

The philosophy must emphasize: Algorithmic expression. Emergent behavior. Computational beauty. Seeded variation.

### HOW TO GENERATE AN ALGORITHMIC PHILOSOPHY

**Name the movement** (1-2 words): "Organic Turbulence" / "Quantum Harmonics" / "Emergent Stillness"

**Articulate the philosophy** (4-6 paragraphs - concise but complete):

To capture the ALGORITHMIC essence, express how this philosophy manifests through:
- Computational processes and mathematical relationships?
- Noise functions and randomness patterns?
- Particle behaviors and field dynamics?
- Temporal evolution and system states?
- Parametric variation and emergent complexity?

**CRITICAL GUIDELINES:**
- **Avoid redundancy**: Each algorithmic aspect should be mentioned once. Avoid repeating concepts about noise theory, particle dynamics, or mathematical principles unless adding new depth.
- **Emphasize craftsmanship REPEATEDLY**: The philosophy MUST stress multiple times that the final algorithm should appear as though it took countless hours to develop, was refined with care, and comes from someone at the absolute top of their field. This framing is essential - repeat phrases like "meticulously crafted algorithm," "the product of deep computational expertise," "painstaking optimization," "master-level implementation."
- **Leave creative space**: Be specific about the algorithmic direction, but concise enough that the next Claude has room to make interpretive implementation choices at an extremely high level of craftsmanship.

The philosophy must guide the next version to express ideas ALGORITHMICALLY, not through static images. Beauty lives in the process, not the final frame.

### PHILOSOPHY EXAMPLES

**"Organic Turbulence"**
Philosophy: Chaos constrained by natural law, order emerging from disorder.
Algorithmic expression: Flow fields driven by layered Perlin noise. Thousands of particles following vector forces, their trails accumulating into organic density maps. Multiple noise octaves create turbulent regions and calm zones. Color emerges from velocity and density - fast particles burn bright, slow ones fade to shadow. The algorithm runs until equilibrium - a meticulously tuned balance where every parameter was refined through countless iterations by a master of computational aesthetics.

**"Quantum Harmonics"**

````

### 7.4 anthropics/skills — skills/slack-gif-creator/SKILL.md (frame-by-frame animation concepts + easing names)

Source: `anthropics/skills/skills/slack-gif-creator/SKILL.md`

````markdown
---
name: slack-gif-creator
description: Knowledge and utilities for creating animated GIFs optimized for Slack. Provides constraints, validation tools, and animation concepts. Use when users request animated GIFs for Slack like "make me a GIF of X doing Y for Slack."
license: Complete terms in LICENSE.txt
---

# Slack GIF Creator

A toolkit providing utilities and knowledge for creating animated GIFs optimized for Slack.

## Slack Requirements

**Dimensions:**
- Emoji GIFs: 128x128 (recommended)
- Message GIFs: 480x480

**Parameters:**
- FPS: 10-30 (lower is smaller file size)
- Colors: 48-128 (fewer = smaller file size)
- Duration: Keep under 3 seconds for emoji GIFs

## Core Workflow

```python
from core.gif_builder import GIFBuilder
from PIL import Image, ImageDraw

# 1. Create builder
builder = GIFBuilder(width=128, height=128, fps=10)

# 2. Generate frames
for i in range(12):
    frame = Image.new('RGB', (128, 128), (240, 248, 255))
    draw = ImageDraw.Draw(frame)

    # Draw your animation using PIL primitives
    # (circles, polygons, lines, etc.)

    builder.add_frame(frame)

# 3. Save with optimization
builder.save('output.gif', num_colors=48, optimize_for_emoji=True)
```

## Drawing Graphics

### Working with User-Uploaded Images
If a user uploads an image, consider whether they want to:
- **Use it directly** (e.g., "animate this", "split this into frames")
- **Use it as inspiration** (e.g., "make something like this")

Load and work with images using PIL:
```python
from PIL import Image

uploaded = Image.open('file.png')
# Use directly, or just as reference for colors/style
```

### Drawing from Scratch
When drawing graphics from scratch, use PIL ImageDraw primitives:

```python
from PIL import ImageDraw

draw = ImageDraw.Draw(frame)

# Circles/ovals
draw.ellipse([x1, y1, x2, y2], fill=(r, g, b), outline=(r, g, b), width=3)

# Stars, triangles, any polygon
points = [(x1, y1), (x2, y2), (x3, y3), ...]
draw.polygon(points, fill=(r, g, b), outline=(r, g, b), width=3)

# Lines
draw.line([(x1, y1), (x2, y2)], fill=(r, g, b), width=5)

# Rectangles
draw.rectangle([x1, y1, x2, y2], fill=(r, g, b), outline=(r, g, b), width=3)
```

**Don't use:** Emoji fonts (unreliable across platforms) or assume pre-packaged graphics exist in this skill.

### Making Graphics Look Good

Graphics should look polished and creative, not basic. Here's how:

**Use thicker lines** - Always set `width=2` or higher for outlines and lines. Thin lines (width=1) look choppy and amateurish.

**Add visual depth**:
- Use gradients for backgrounds (`create_gradient_background`)
- Layer multiple shapes for complexity (e.g., a star with a smaller star inside)

**Make shapes more interesting**:
- Don't just draw a plain circle - add highlights, rings, or patterns
- Stars can have glows (draw larger, semi-transparent versions behind)
- Combine multiple shapes (stars + sparkles, circles + rings)

**Pay attention to colors**:
- Use vibrant, complementary colors
- Add contrast (dark outlines on light shapes, light outlines on dark shapes)
- Consider the overall composition

**For complex shapes** (hearts, snowflakes, etc.):
- Use combinations of polygons and ellipses
- Calculate points carefully for symmetry
- Add details (a heart can have a highlight curve, snowflakes have intricate branches)

Be creative and detailed! A good Slack GIF should look polished, not like placeholder graphics.

## Available Utilities

### GIFBuilder (`core.gif_builder`)
Assembles frames and optimizes for Slack:
```python
builder = GIFBuilder(width=128, height=128, fps=10)
builder.add_frame(frame)  # Add PIL Image
builder.add_frames(frames)  # Add list of frames
builder.save('out.gif', num_colors=48, optimize_for_emoji=True, remove_duplicates=True)
```

### Validators (`core.validators`)
Check if GIF meets Slack requirements:
```python
from core.validators import validate_gif, is_slack_ready

# Detailed validation
passes, info = validate_gif('my.gif', is_emoji=True, verbose=True)

# Quick check
if is_slack_ready('my.gif'):
    print("Ready!")
```

### Easing Functions (`core.easing`)
Smooth motion instead of linear:
```python
from core.easing import interpolate

# Progress from 0.0 to 1.0
t = i / (num_frames - 1)

# Apply easing
y = interpolate(start=0, end=400, t=t, easing='ease_out')

# Available: linear, ease_in, ease_out, ease_in_out,
#           bounce_out, elastic_out, back_out
```

### Frame Helpers (`core.frame_composer`)
Convenience functions for common needs:
```python
from core.frame_composer import (
    create_blank_frame,         # Solid color background
    create_gradient_background,  # Vertical gradient
    draw_circle,                # Helper for circles
    draw_text,                  # Simple text rendering
    draw_star                   # 5-pointed star
)
```

## Animation Concepts

### Shake/Vibrate
Offset object position with oscillation:
- Use `math.sin()` or `math.cos()` with frame index
- Add small random variations for natural feel
- Apply to x and/or y position

### Pulse/Heartbeat
Scale object size rhythmically:
- Use `math.sin(t * frequency * 2 * math.pi)` for smooth pulse
- For heartbeat: two quick pulses then pause (adjust sine wave)
- Scale between 0.8 and 1.2 of base size

### Bounce
Object falls and bounces:
- Use `interpolate()` with `easing='bounce_out'` for landing
- Use `easing='ease_in'` for falling (accelerating)
- Apply gravity by increasing y velocity each frame

### Spin/Rotate
Rotate object around center:
- PIL: `image.rotate(angle, resample=Image.BICUBIC)`
- For wobble: use sine wave for angle instead of linear

### Fade In/Out
Gradually appear or disappear:
- Create RGBA image, adjust alpha channel
- Or use `Image.blend(image1, image2, alpha)`
- Fade in: alpha from 0 to 1
- Fade out: alpha from 1 to 0

### Slide
Move object from off-screen to position:
- Start position: outside frame bounds
- End position: target location
- Use `interpolate()` with `easing='ease_out'` for smooth stop
- For overshoot: use `easing='back_out'`

### Zoom
Scale and position for zoom effect:
- Zoom in: scale from 0.1 to 2.0, crop center
- Zoom out: scale from 2.0 to 1.0
- Can add motion blur for drama (PIL filter)

### Explode/Particle Burst
Create particles radiating outward:
- Generate particles with random angles and velocities
- Update each particle: `x += vx`, `y += vy`
- Add gravity: `vy += gravity_constant`
- Fade out particles over time (reduce alpha)

## Optimization Strategies

Only when asked to make the file size smaller, implement a few of the following methods:

1. **Fewer frames** - Lower FPS (10 instead of 20) or shorter duration
2. **Fewer colors** - `num_colors=48` instead of 128
3. **Smaller dimensions** - 128x128 instead of 480x480
4. **Remove duplicates** - `remove_duplicates=True` in save()
5. **Emoji mode** - `optimize_for_emoji=True` auto-optimizes

```python
# Maximum optimization for emoji
builder.save(
    'emoji.gif',
    num_colors=48,
    optimize_for_emoji=True,
    remove_duplicates=True
)
```

## Philosophy

This skill provides:
- **Knowledge**: Slack's requirements and animation concepts
- **Utilities**: GIFBuilder, validators, easing functions
- **Flexibility**: Create the animation logic using PIL primitives

It does NOT provide:
- Rigid animation templates or pre-made functions
- Emoji font rendering (unreliable across platforms)
- A library of pre-packaged graphics built into the skill

**Note on user uploads**: This skill doesn't include pre-built graphics, but if a user uploads an image, use PIL to load and work with it - interpret based on their request whether they want it used directly or just as inspiration.

Be creative! Combine concepts (bouncing + rotating, pulsing + sliding, etc.) and use PIL's full capabilities.

## Dependencies

```bash
pip install pillow imageio numpy
```

````

### 7.5 anthropics/skills — template/SKILL.md

Source: `anthropics/skills/template/SKILL.md`

````markdown
---
name: template-skill
description: Replace with description of the skill and when Claude should use it.
---

# Insert instructions below

````

### 7.6 anthropics/skills — README.md

Source: `anthropics/skills/README.md`

````markdown
> **Note:** This repository contains Anthropic's implementation of skills for Claude. For information about the Agent Skills standard, see [agentskills.io](http://agentskills.io).

[![skills.sh](https://skills.sh/b/anthropics/skills)](https://skills.sh/anthropics/skills)

# Skills
Skills are folders of instructions, scripts, and resources that Claude loads dynamically to improve performance on specialized tasks. Skills teach Claude how to complete specific tasks in a repeatable way, whether that's creating documents with your company's brand guidelines, analyzing data using your organization's specific workflows, or automating personal tasks.

For more information, check out:
- [What are skills?](https://support.claude.com/en/articles/12512176-what-are-skills)
- [Using skills in Claude](https://support.claude.com/en/articles/12512180-using-skills-in-claude)
- [How to create custom skills](https://support.claude.com/en/articles/12512198-creating-custom-skills)
- [Equipping agents for the real world with Agent Skills](https://anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)

# About This Repository

This repository contains skills that demonstrate what's possible with Claude's skills system. These skills range from creative applications (art, music, design) to technical tasks (testing web apps, MCP server generation) to enterprise workflows (communications, branding, etc.).

Each skill is self-contained in its own folder with a `SKILL.md` file containing the instructions and metadata that Claude uses. Browse through these skills to get inspiration for your own skills or to understand different patterns and approaches.

Many skills in this repo are open source (Apache 2.0). We've also included the document creation & editing skills that power [Claude's document capabilities](https://www.anthropic.com/news/create-files) under the hood in the [`skills/docx`](./skills/docx), [`skills/pdf`](./skills/pdf), [`skills/pptx`](./skills/pptx), and [`skills/xlsx`](./skills/xlsx) subfolders. These are source-available, not open source, but we wanted to share these with developers as a reference for more complex skills that are actively used in a production AI application.

## Disclaimer

**These skills are provided for demonstration and educational purposes only.** While some of these capabilities may be available in Claude, the implementations and behaviors you receive from Claude may differ from what is shown in these skills. These skills are meant to illustrate patterns and possibilities. Always test skills thoroughly in your own environment before relying on them for critical tasks.

# Skill Sets
- [./skills](./skills): Skill examples for Creative & Design, Development & Technical, Enterprise & Communication, and Document Skills
- [./spec](./spec): The Agent Skills specification
- [./template](./template): Skill template

# Try in Claude Code, Claude.ai, and the API

## Claude Code
You can register this repository as a Claude Code Plugin marketplace by running the following command in Claude Code:
```
/plugin marketplace add anthropics/skills
```

Then, to install a specific set of skills:
1. Select `Browse and install plugins`
2. Select `anthropic-agent-skills`
3. Select `document-skills` or `example-skills`
4. Select `Install now`

Alternatively, directly install either Plugin via:
```
/plugin install document-skills@anthropic-agent-skills
/plugin install example-skills@anthropic-agent-skills
```

After installing the plugin, you can use the skill by just mentioning it. For instance, if you install the `document-skills` plugin from the marketplace, you can ask Claude Code to do something like: "Use the PDF skill to extract the form fields from `path/to/some-file.pdf`"

## Claude.ai

These example skills are all already available to paid plans in Claude.ai. 

To use any skill from this repository or upload custom skills, follow the instructions in [Using skills in Claude](https://support.claude.com/en/articles/12512180-using-skills-in-claude#h_a4222fa77b).

## Claude API

You can use Anthropic's pre-built skills, and upload custom skills, via the Claude API. See the [Skills API Quickstart](https://docs.claude.com/en/api/skills-guide#creating-a-skill) for more.

# Creating a Basic Skill

Skills are simple to create - just a folder with a `SKILL.md` file containing YAML frontmatter and instructions. You can use the **template-skill** in this repository as a starting point:

```markdown
---
name: my-skill-name
description: A clear description of what this skill does and when to use it
---

# My Skill Name

[Add your instructions here that Claude will follow when this skill is active]

## Examples
- Example usage 1
- Example usage 2

## Guidelines
- Guideline 1
- Guideline 2
```

The frontmatter requires only two fields:
- `name` - A unique identifier for your skill (lowercase, hyphens for spaces)
- `description` - A complete description of what the skill does and when to use it

The markdown content below contains the instructions, examples, and guidelines that Claude will follow. For more details, see [How to create custom skills](https://support.claude.com/en/articles/12512198-creating-custom-skills).

# Partner Skills

Skills are a great way to teach Claude how to get better at using specific pieces of software. As we see awesome example skills from partners, we may highlight some of them here:

- **Notion** - [Notion Skills for Claude](https://www.notion.so/notiondevs/Notion-Skills-for-Claude-28da4445d27180c7af1df7d8615723d0)

````

---

## 8. Claude Code skills format (https://code.claude.com/docs/en/skills.md, fetched 2026-11-02; 118,818 chars — excerpts: intro, getting started, supporting files, frontmatter reference)

````markdown
> ## Documentation Index
> Fetch the complete documentation index at: https://code.claude.com/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Extend Claude with skills

> Create, manage, and share skills to extend Claude's capabilities in Claude Code. Includes custom commands and bundled skills.

Skills extend what Claude can do. Create a `SKILL.md` file with instructions, and Claude adds it to its toolkit. Claude uses skills when relevant, or you can invoke one directly with `/skill-name`.

Create a skill when you keep pasting the same instructions, checklist, or multi-step procedure into chat, or when a section of CLAUDE.md has grown into a procedure rather than a fact. Unlike CLAUDE.md content, a skill's body loads only when it's used, so long reference material costs almost nothing until you need it.

> [!NOTE]
>
> For built-in commands like `/help` and `/compact`, and bundled skills like `/debug` and `/code-review`, see the [commands reference](https://code.claude.com/docs/en/commands.md).
>
> **Custom commands have been merged into skills.** A file at `.claude/commands/deploy.md` and a skill at `.claude/skills/deploy/SKILL.md` both create `/deploy` and work the same way. Your existing `.claude/commands/` files keep working. Skills add optional features: a directory for supporting files, frontmatter to [control whether you or Claude invokes them](#control-who-invokes-a-skill), and the ability for Claude to load them automatically when relevant.

Claude Code skills follow the [Agent Skills](https://agentskills.io) open standard, which works across multiple AI tools. Claude Code extends the standard with additional features like [invocation control](#control-who-invokes-a-skill), [subagent execution](#run-skills-in-a-subagen

[...]

## Getting started

### Create your first skill

This example creates a skill that summarizes the uncommitted changes in your git repository and flags anything risky. It pulls the live diff into the prompt before Claude reads it, so the response is grounded in your actual working tree rather than what Claude can guess from open files. Claude loads the skill automatically when you ask about your changes, or you can invoke it directly with `/summarize-changes`.

**1. Create the skill directory**

Create a directory for the skill in your personal skills folder. Personal skills are available across all your projects.

```bash theme={null}
mkdir -p ~/.claude/skills/summarize-changes
```

**2. Write SKILL.md**

Every skill needs a `SKILL.md` file with two parts: YAML frontmatter between `---` markers that tells Claude when to use the skill, and markdown content with the instructions Claude follows when the skill runs. The directory name, or the frontmatter `name` when you set one, becomes the command you type, and the `description` helps Claude decide when to load the skill automatically.

Save this to `~/.claude/skills/summarize-changes/SKILL.md`:

```yaml theme={null}
---
description: Summarizes uncommitted changes and flags anything risky. Use when the user asks what changed, wants a commit message, or asks to review their diff.
---

## Current changes

!`git diff HEAD`

## Instructions

Summarize the changes above in two or three bullet points, then list any risks you notice such as missing error handling, hardcoded values, or tests that need updating. If the diff is empty, say there are no uncommitted changes.
```

The `` !`git diff HEAD` `` line uses [dynamic context injection](#inject-dynamic-context): Claude Code runs the command and replaces the line with its output before Claude sees the skill content, so the instructions arrive with the current diff already inlined.

**3. Test the skill**

Open a git project, make a small edit to any file, and start Claude Code by running `claude`. You can test the skill two ways.

**Let Claude invoke it automatically** by asking something that matches the description:

```text theme={null}
What did I change?
```

**Or invoke it directly** with the skill name:

```text theme={null}
/summarize-changes
```

Either way, Claude should respond with a short summary of your edit and a list of risks.



[...]

### Add supporting files

Skills can include multiple files in their directory. This keeps `SKILL.md` focused on the essentials while letting Claude access detailed reference material only when needed. Large reference docs, API specifications, or example collections don't need to load into context every time the skill runs.

```text theme={null}
my-skill/
├── SKILL.md (required - overview and navigation)
├── reference.md (detailed API docs - loaded when needed)
├── examples.md (usage examples - loaded when needed)
└── scripts/
    └── helper.py (utility script - executed, not loaded)
```

Reference supporting files from `SKILL.md` so Claude knows what each file contains and when to load it:

```markdown theme={null}
## Additional resources

- For complete API details, see [reference.md](reference.md)
- For usage examples, see [examples.md](examples.md)
```

> [!TIP]
>
> Keep `SKILL.md` under 500 lines. Move detailed reference material to separate files.



[...]

## Frontmatter reference

Configure a skill with YAML [frontmatter](https://code.claude.com/docs/en/glossary.md#frontmatter) between `---` markers at the top of `SKILL.md`, and write the skill's instructions as Markdown after the closing `---`. Field names use lowercase words separated by hyphens, except `when_to_use`. A [command file](#where-skills-live) in `.claude/commands/` accepts the same fields except `name` and `paths`. This example sets four fields:

```yaml theme={null}
---
name: my-skill
description: What this skill does
disable-model-invocation: true
allowed-tools: Read Grep
---

Your skill instructions here...
```

All fields are optional. Only `description` is recommended so Claude knows when to use the skill. A field name must match the table exactly, hyphens included: Claude Code ignores a field it doesn't recognize without reporting an error. Boolean fields accept `yes`, `no`, `on`, `off`, `1`, and `0` in any letter case, in addition to `true` and `false`.

Claude Code reads the frontmatter only when the opening `---` is the file's first line. Otherwise it treats the whole file, `---` markers included, as skill content. If the YAML between the markers doesn't parse, the skill still loads with no fields set; see [Skill not triggering](#skill-not-triggering) to find and fix the error.

| Field | Required | Description |
| :- | :- | :- |
| `name` | No | Command name shown in the `/` menu. Defaults to the directory name. See [How a skill gets its command name](#how-a-skill-gets-its-command-name) for how the field interacts with the name you type to invoke the skill. |
| `description` | Recommended | What the skill does and when to use it. Claude uses this to decide when to apply the skill. If omitted, uses the first non-empty line of the markdown content. Put the key use case first: the combined `description` and `when_to_use` text is truncated at 1,536 characters in the skill listing to reduce context usage. Angle brackets in the text [show as `&lt;` and `&gt;`](#angle-brackets-in-a-skill-description). |
| `when_to_use` | No | Additional context for when Claude should invoke the skill, such as trigger phrases or example requests. Appended to `description` in the skill listing and counts toward the 1,536-character cap. |
| `argument-hint` | No | Hint shown during autocomplete to indicate expected arguments. Example: `[issue-number]` or `[filename] [format]`. |
| `arguments` | No | Named positional arguments for [`$name` substitution](#available-string-substitutions) in the skill content. Accepts a space-separated string or a YAML list. Names map to argument positions in order. |
| `disable-model-invocation` | No | Set to `true` to prevent Claude from automatically loading this skill. Use for workflows you want to trigger manually with `/name`. Also prevents the skill from being [preloaded into subagents](https://code.claude.com/docs/en/sub-agents.md#preload-skills-into-subagents) and from running when a [session-scoped scheduled task](https://code.claude.com/docs/en/scheduled-tasks.md) fires with the skill as its prompt. Default: `false`. |
| `user-invocable` | No | Set to `false` when only Claude should invoke the skill: Claude Code hides it from the `/` menu and doesn't run it when you type `/name`. Use for background knowledge users shouldn't invoke directly. Default: `true`. |
| `allowed-tools` | No | Tools Claude can use without asking permission during the turn that invokes this skill. The grant clears when you send your next message. Accepts a space- or comma-separated string, or a YAML list. See [Pre-approve tools for a skill](#pre-approve-tools-for-a-skill). |
| `disallowed-tools` | No | Tools removed from Claude's available pool while this skill is active. Use for autonomous skills that should never call certain tools, such as `AskUserQuestion` for a background loop. Accepts a space- or comma-separated string, or a YAML list. The restriction clears when you send your next message. Like deny rules, the field can't remove [`EndConversation`](https://code.claude.com/docs/en/tools-reference#endconversation-tool-behavior) while any other tool remains. |
| `model` | No | Model to use when this skill is active. The override applies for the rest of the current turn and isn't saved to settings. The session model resumes when you send your next prompt. Accepts the same values as [`/model`](https://code.claude.com/docs/en/model-config), or `inherit` to keep the active model. A value excluded by your organization's [`availableModels`](https://code.claude.com/docs/en/model-config#restrict-model-selection) allowlist isn't used, and the session keeps its current model. In [auto mode](https://code.claude.com/docs/en/permission-modes.md#eliminate-prompts-with-auto-mode), and in [plan mode while the classifier reviews commands](https://code.claude.com/docs/en/permission-modes.md#analyze-before-you-edit-with-plan-mode), a model that auto mode doesn't support also isn't used, and the session keeps its current model. With `context: fork`, the value sets the [forked subagent's model](#run-skills-in-a-subagent) instead, and an excluded value follows the [same rules as a subagent model override](https://code.claude.com/docs/en/model-config.md#restrict-model-selection). |
| `effort` | No | [Effort level](https://code.claude.com/docs/en/model-config.md#adjust-effort-level) for the rest of the current turn. Overrides the session effort level, but not the [`CLAUDE_CODE_EFFORT_LEVEL`](https://code.claude.com/docs/en/env-vars#variables) environment variable. With `context: fork`, the value sets the forked subagent's effort level instead. When you omit it, the level comes from the [effort resolution order](https://code.claude.com/docs/en/model-config.md#adjust-effort-level). Options: `low`, `medium`, `high`, `xhigh`, `max`; available levels depend on the model. |
| `context` | No | Set to `fork` to run in a forked subagent context. See [Run skills in a subagent](#run-skills-in-a-subagent). |
| `agent` | No | Which subagent type to use when `context: fork` is set. |
| `background` | No | Only applies with `context: fork`. Set to `false` to wait for the forked subagent's result in the turn that invoked the skill, instead of [running it in the background](#run-skills-in-a-subagent). Default: `true`. |
| `hooks` | No | Hooks that Claude Code registers when the skill is invoked and keeps running for the rest of the session. See [Hooks in skills and agents](https://code.claude.com/docs/en/hooks.md#hooks-in-skills-and-agents) for the configuration format, the `once` option, and the [limits on skill hooks](https://code.claude.com/docs/en/hooks.md#limits-on-skill-hooks). |
| `paths` | No | Glob patterns that limit when this skill is activated. Accepts a comma-separated string or a YAML list. When set, Claude loads the skill automatically only when working with files matching the patterns. Patterns are relative to Claude's current working directory, and files outside that directory don't match. Uses the same glob format as [path-specific rules](https://code.claude.com/docs/en/memory.md#path-specific-rules). |
| `shell` | No | Shell to use for `` !`command` `` and ` ```! ` blocks in this skill. Accepts `bash` (default) or `powershell`. Setting `powershell` runs inline shell commands via PowerShell when the [PowerShell tool](https://code.claude.com/docs/en/tools-reference.md#powershell-tool) is enabled: it's on by default on Windows without Git Bash, on by default with Git Bash for claude.ai and Console accounts, and needs `CLAUDE_CODE_USE_POWERSHELL_TOOL=1` in Amazon Bedrock, Google Cloud's Agent Platform, and Microsoft Foundry sessions and on macOS, Linux, and WSL. Set it to `0` to turn the tool off. |
| `metadata` | No | Free-form YAML map for your own key-value data, such as entitlement or catalog fields, read by your own tooling from `SKILL.md`. Claude Code doesn't act on its contents, and drops a value that isn't a map. Don't reuse frontmatter field names such as `paths` as keys. |
| `license` | No | License covering the skill. Part of the [Agent Skills](https://agentskills.io) spec; see [Using skill frontmatter outside Claude Code](#using-skill-frontmatter-outside-claude-code). Claude Code accepts the field but doesn't act on it. |
| `compatibility` | No | Environment requirements for the skill, such as intended products or system prerequisites, as defined by the [Agent Skills](https://agentskills.io) spec; see [Using skill frontmatter outside Claude Code](#using-skill-frontmatter-outside-claude-code). Accepts a string of up to 500 characters. Claude Code accepts the field but doesn't act on it. |



````

---

## 9. What to copy for The Signal / Q-ROSITY (per section)

**From the official Remotion skills (section 1)**
- Install them in the project (`npx remotion skills add` — already present in `setup/.claude/skills`, v4.0.540) and keep them updated with `npx remotion upgrade`, which "also updates project-local Remotion skills" (1.55).
- Put these lines in your own `CLAUDE.md` (they are the rules first drafts break most): "Drive animations using `useCurrentFrame()` and `interpolate()`. CSS `transition` or `animation` will not render correctly" (1.4); "Keep `useCurrentFrame()` in the smallest component that needs it" (1.4); "get `fps` from `useVideoConfig()` for all seconds-to-frames calculations … `trimBefore={4 * fps}`" (1.4) — at 60 fps this is what keeps your timings from being 2× too fast; "Use `scale`, `translate`, `rotate` CSS properties over `transform`" and `output: 'perceptual-scale'` on every scale animation (1.4/1.5); `Easing.spring({damping: 200})` for "a nice push movement with no bounce" (1.5); clamp both extrapolations always (1.5).
- Compositions: `<Composition id="…" fps={60} width={1080} height={1920} …>` with inline `defaultProps`, `type` not `interface` (1.10). Put each reel in a `<Folder>`.
- Layout numbers for 1080-wide: "keep key text at least 80px from the sides and 100px from the top and bottom … Main headline: 84px, Important supporting text: 44px" (1.39). Combine with HyperFrames' stricter 9:16 band (below).
- Fonts: `@remotion/google-fonts/<Family>` with `weights`/`subsets`, and `waitUntilDone()` before `measureText`/`fitText` (1.13, 1.15). For The Signal's price numbers add `fontVariantNumeric: 'tabular-nums'` (from HyperFrames data.md) so count-ups don't jitter.
- Transitions: `TransitionSeries` + `fade/slide/wipe/flip/clockWipe`, `springTiming({config:{damping:200}})`, and the duration math `60 + 60 - 15 = 105` (1.9) — compute `durationInFrames` from it instead of guessing.
- Audio: `<Audio from={…} trimBefore={…} volume={interpolate(...)} />` with everything inline (1.18); hosted SFX list at `remotion.media/*.wav` (1.19) for whooshes/dings on number reveals.
- Captions: `Caption[]` type, `createTikTokStyleCaptions` (template 3.1), `@remotion/whisper-webgpu` transcription script (1.43), BasicCaptions element and the rule to inline the caption array (1.42).
- Charts/paths: `interpolatePaths()` from `@remotion/paths` kept inline in `d`, and "Use `strokeDasharray` and `strokeDashoffset` to evolve paths" (1.49) — this is the price-line draw-on for The Signal.
- 3D (Q-ROSITY blocky characters): `<ThreeCanvas width height>` with lights, "Using `useFrame()` from `@react-three/fiber` is forbidden", `<Sequence layout="none">` inside the canvas (1.22). Lottie via `delayRender/continueRender` (1.23).
- Rendering & checking: "To render several frames as images in one call, use `render --frames`: `npx remotion render [composition-id] out/frames --frames=0,30,90 --image-format=png`" (1.45) and "You can also use Rendering to inspect one or several frames as images" (1.4) — make this a mandatory step in your CLAUDE.md: render frames at the hook, each reveal, and the last frame, then Read the PNGs before declaring done (HyperFrames and herk-edit-kit both make this a hard gate).
- Studio-first: the skills tell the agent to start `npx remotion studio` immediately and not render unless asked (1.2). Studio WebMCP is Codex-only today (2.9).

**From the Remotion AI docs (section 2)**
- Workflow: `npx create-video --yes --blank my-video` → `npx remotion skills add` → `npm run dev` → `claude` in a second terminal (2.7). Claude Code plugin: `claude plugin marketplace add remotion-dev/claude-code-plugin && claude plugin install remotion@remotion`, invoke `/remotion:remotion-create <prompt>` (2.4).
- Fetch any docs page as Markdown by appending `.md`; the hosted MCP is dead — use `/remotion-docs` (2.8).

**From the motion-graphics SaaS template (3.2) — the best 'system prompt' for your reels**
- Copy `SYSTEM_PROMPT`'s rules into CLAUDE.md: constants-first (`COLOR_*`, `*_TEXT`, `*_DURATION` in UPPER_SNAKE_CASE inside the component), "Prefer spring() for organic motion … interpolate() for linear progress", "ALWAYS set backgroundColor on AbsoluteFill from frame 0 - never fade in backgrounds", reserved names, `fontFamily: 'Inter, sans-serif'`, "Keep colors minimal (2-4 max)".
- Copy `spring-physics.md` presets (`snappy {damping:20,stiffness:200}`, `smooth {damping:200,stiffness:100}`, delayed springs via `frame - DELAY`), `sequencing.md` staggers (`BASE_DELAY + i * STAGGER_DELAY`), `charts.md` (stagger bars 3–5 frames, always Y-axis labels, value labels inside bars fading with progress), `typography.md` (string-slicing typewriter, stable-width word carousel, two-layer highlight crossfade) and `social-media.md` (`SAFE_MARGIN_TOP = height*0.12`, `BOTTOM = height*0.15`, `TITLE_SIZE = Math.max(48, width*0.08)`, hook motion from frame 0). Note these frame counts assume 30 fps — multiply by 2 for 60 fps or express them as `seconds * fps`.
- Copy the `capture-frame.ts` idea: render a still and feed it back to the model as an image. In Claude Code this is `npx remotion still <id> out.png --frame=N` then Read.

**From HyperFrames (section 4) — rules, not the renderer**
- Vertical numbers (4.9): "On 1080×1920: nothing in the top 168 px (status and search bar); every word and the product inside the band from 168 to 1330 px; below 1330 px … only texture or decoration; no text under the right-hand action rail … nothing meant to be read under 28 px … about 5 English words for a claim: cut words, never shrink … Frame 0 is the thumbnail and the hook … Never black, never a logo … shots of 1–2 s, a new beat every 2–4 s".
- Motion numbers (4.8): fast move 0.3–0.6 s; "Exits are 40-50% shorter than their entrances"; next element starts when previous is 30-50% done; "letters a frame apart, words 60-120 ms, list items 40-80 ms"; springs by damping ratio ("0.7-0.85 reads premium"; "opacity and colour never" bounce); "a landed title is dead still"; holds "0.5 s plus 0.3 s a word, the film's last line at least 2 s"; title size "4–9% of the frame height"; beat grid `frames per beat = fps × 60 / BPM`, compute each beat from its index; the whole "Defaults that look generated" list.
- Data reels (4.10): "The number is the biggest thing on screen. Tabular figures … a count-up runs 1.2–1.6 s, then holds … Highlight one series, grey the rest … Annotate on the mark; no legends" and the tells: "A grid of KPI cards; a dashboard; a pie chart; every number counting up at once; numbers with no source."
- Characters (4.11, Q-ROSITY): "Mood changes go through a take: anticipation, a squash, the new face, a settle"; "Offset the parts (head leads, arms follow) … never move both arms, both eyes or a crowd in unison"; "Contact sells it"; rig = keyed states `[[t0,"normal"],[t1,"scared"]]` eased between; boiling lines re-drawn 12×/s with a seed `Math.floor(t*12)`.
- Process (4.12/4.13/4.14): write a `SPEC.md` with every adjective as a number and a BANNED line; three storylines before building; `REVIEW.md` with P0/P1/P2 and "Never score the film out of 10: a score finds nothing to fix" — a direct remedy for your 40–65/100 first drafts.
- Contract items that port to Remotion as CLAUDE.md rules: deterministic (no `Date.now()`, seeded random), "Content stays inside the 90% action-safe box, captions and key text inside 80% title-safe", one scene per component, copy/brand colours as props.

**From herk-edit-kit (section 5)**
- `MOTION_PHILOSOPHY.md` §4 pre-flight checklist and §4.1 GSAP code dictionary translate 1:1 to Remotion `Easing.bezier`/`spring` choices (word reveal `expo.out` 0.20–0.33 s; exit ≈ `power2.in` 0.2–0.33 s; camera `power2.inOut` 1.2–2.3 s; no bounce on UI).
- `short-form-video/SKILL.md` "10 rules" (no dead frames every 100 ms; payoff ≥ 1 s hold; one jaw-dropper per 5 s; rotate transition flavors; captions "pop, don't politely label"; "Slam/stamp overlays land AFTER target text is fully visible") and the **word-exact frame verification gate** ("Lint passing ≠ design working … extract frames at word-exact timestamps and READ every PNG").
- 60 fps precedent: motion-showreel renders 1920×1080 60P on a 129 BPM grid; its rule "All tween end-times snap to multiples of 1/fps" matters at 60 fps.

**From LottieFiles motion-design-skill (6.2)** — duration table (card 200–350 ms, dramatic reveal 600–1200 ms), "Enter > Exit: Entrances 30-50% longer than exits", stagger budgets (<500 ms total), "Never linear for spatial movement", the four Motion Personality archetypes — pick one per channel (The Signal: Premium/Corporate; Q-ROSITY: Playful).

**From Anthropic (section 7)** — nothing video-specific to copy; use `frontend-design`'s "a single orchestrated moment … lands better than scattered effects" and its list of AI-design tells (cream background + serif + terracotta; near-black + acid green; identical rounded cards) as a BANNED list for your title cards. Author your own skill with the Claude Code skills format (section 8): `.claude/skills/<name>/SKILL.md` with `description`, `paths`, supporting `references/*.md`, "Keep SKILL.md under 500 lines", and `` !`command` `` dynamic context injection (e.g. inject `npx remotion compositions` output).

---

## 10. Sources (VERIFIED = cloned/fetched and read on 2026-11-02; UNVERIFIED = reported by others only)

- VERIFIED https://github.com/remotion-dev/skills (clone, commit c7cb2fd; stars via GitHub search API)
- VERIFIED https://github.com/remotion-dev/remotion (stars only)
- VERIFIED https://github.com/remotion-dev/template-tiktok, template-prompt-to-motion-graphics-saas, template-prompt-to-video, template-audiogram, template-music-visualization, template-code-hike (all cloned)
- VERIFIED https://www.remotion.dev/docs/ai.md, /docs/ai/skills.md, /docs/ai/plugins.md, /docs/ai/mcp.md, /docs/ai/coding-agents.md, /docs/ai/claude-code-plugin.md, /docs/ai/cursor-plugin.md, /docs/ai/codex-plugin.md, /docs/ai/webmcp.md, https://www.remotion.dev/llms.txt, https://www.remotion.dev/prompts, https://www.remotion.dev/showcase
- VERIFIED 404: /docs/ai/claude-code, /docs/ai/system-prompt, /docs/ai/cursor, /docs/ai/reference-frames, /docs/ai/visual-feedback, /docs/ai/prompts, /docs/showcase.md, /docs/llms.txt, /llms-full.txt
- VERIFIED https://github.com/heygen-com/hyperframes (clone, commit 618c486), https://github.com/heygen-com/hyperframes-launches and hyperframes-community-skills (metadata only), https://hyperframes.heygen.com/guides/hyperframes-vs-remotion (fetched)
- VERIFIED https://github.com/nateherkai/herk-edit-kit (clone), https://github.com/latent-spaces/brag (metadata only)
- VERIFIED https://github.com/motion-canvas/motion-canvas, https://github.com/midrender/revideo, https://github.com/ManimCommunity/manim (cloned; no agent files), https://github.com/3b1b/manim (metadata)
- VERIFIED https://github.com/Yusuke710/manim-skill, https://github.com/LottieFiles/motion-design-skill, https://github.com/frankxai/awesome-motion-design-agent-skills (cloned); https://github.com/greensock/gsap-skills (metadata only)
- VERIFIED https://docs.lottiefiles.com/en/platform/mcp (fetched); https://lottiefiles.com/blog/working-with-lottie-animations/your-ai-can-now-control-lottie-creator-heres-what-that-actually-means (search result only — Lottie Creator MCP details UNVERIFIED beyond the docs page mention)
- VERIFIED https://github.com/anthropics/skills (clone, HEAD 2026-10-28), https://code.claude.com/docs/en/skills.md (fetched), https://www.anthropic.com/news/claude-design-anthropic-labs (fetched)
- UNVERIFIED "Claude Motion" (eesel.ai blog claims; no anthropic.com source found); "Imagine with Claude" (not found); Remotion Algolia docs search for "reference image" (request blocked by the sandbox policy; not run); individual Remotion Prompt Showcase prompt texts (client-rendered, not captured); remotion-dev/template-stargazer (not found).
