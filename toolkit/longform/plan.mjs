// plan.mjs — episode folder → VO lines → timeline (frames) → critique shot list. Pure functions,
// used by render-chapters.mjs. Episode folder layout (see longform/README.md):
//   episode.json            id, title, fps/size, voice {engine, voice, speed}, music {...}, thumbnail {...}, summary, hashtags
//   chapters/NN-<slug>.json { id, kind, title, label?, scenes: [{ id, template, vo: [..], props, sfx?, rehook? }] }
//   facts.md                every claim + URL (description.mjs lists the URLs as sources)
// Generated: vo-lines.json, words.json (+ captions.srt), timeline.json, shotlist.json, chapters.txt, description.md
import { readFileSync, readdirSync, existsSync } from 'fs';
import path from 'path';

export const LEAD_SEC = 0.12; // a scene cuts in this long before its first word
export const PAUSE = { line: 0.2, scene: 0.35, chapter: 0.8 }; // silence before a line (HARNESS: ≤ 0.25 inside a beat)
const NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

export function loadEpisode(dir) {
  const ep = JSON.parse(readFileSync(path.join(dir, 'episode.json'), 'utf8'));
  const cdir = path.join(dir, 'chapters');
  const files = readdirSync(cdir).filter((f) => f.endsWith('.json')).sort();
  if (!files.length) throw new Error(`${cdir}: no chapter files`);
  const chapters = files.map((f) => ({ ...JSON.parse(readFileSync(path.join(cdir, f), 'utf8')), _file: f }));
  ep.fps ??= 30;
  ep.width ??= 1920;
  ep.height ??= 1080;
  return { ep, chapters };
}

const lineOf = (v) => (typeof v === 'string' ? { text: v } : v);

/** Every VO line in order, with ids `<scene>-l<k>` and the silence before it. */
export function voLines(ep, chapters) {
  const out = [];
  chapters.forEach((c, ci) => {
    (c.scenes ?? []).forEach((s, si) => {
      (s.vo ?? []).map(lineOf).forEach((l, li) => {
        const pauseBefore = l.pauseBefore ?? (li > 0 ? PAUSE.line : si > 0 ? PAUSE.scene : ci > 0 ? PAUSE.chapter : PAUSE.line);
        out.push({ id: `${s.id}-l${li + 1}`, text: l.text, ...(l.tts ? { tts: l.tts } : {}), chapter: c.id, scene: s.id, pauseBefore });
      });
    });
  });
  return { id: ep.id, fps: ep.fps, vo: out };
}

const normTok = (w) => String(w).toLowerCase().replace(/[^0-9a-z%$.]/g, '').replace(/\.$/, '');

/** collect every word-cue string in a props object: keys `on`, `*On`, `*Until` at any depth */
function cueWords(obj, acc = []) {
  if (Array.isArray(obj)) obj.forEach((x) => cueWords(x, acc));
  else if (obj && typeof obj === 'object')
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === 'string' && (k === 'on' || /On$/.test(k) || /Until$/.test(k))) acc.push([k, v]);
      else cueWords(v, acc);
    }
  return acc;
}

/** default SFX per template, in scene-local frames (peak lands on the visual hit) */
function defaultSfx(s, words, fps) {
  const at = (tok, d) => {
    const w = words.find((x) => normTok(x.w) === normTok(tok ?? ''));
    return w ? w.f0 : d;
  };
  const p = s.props ?? {};
  switch (s.template) {
    case 'title':
      return [{ id: 'whoosh', at: 0 }];
    case 'bigNumber':
      return [{ id: 'pop', at: at(p.landOn, 20), gain: 3 }];
    case 'compareBars':
      return (p.bars ?? []).map((b, i) => ({ id: 'pop', at: at(b.on, 8 + i * 20) + 6 }));
    case 'timeline':
      return (p.stops ?? []).map((st, i) => ({ id: 'click', at: at(st.on, 10 + i * 30) }));
    case 'diagram':
      return p.kind === 'orbit' ? [{ id: 'whoosh', at: at(p.bulgesOn, 20) + 9 }] : [...(p.nodes ?? []), ...(p.pins ?? [])].map((n, i) => ({ id: 'click', at: at(n.on, 8 + i * 24) }));
    case 'whatif': {
      const g = at(p.goneOn, -1);
      return [{ id: 'thump', at: 9 }, ...(g > 0 ? [{ id: 'riser', at: g }, { id: 'impact', at: g, gain: 2 }] : [])];
    }
    case 'endscreen':
      return [{ id: 'thump', at: 6 }];
    default:
      return [];
  }
}

/**
 * words.json (voice/tts.py) + chapters → EpisodeTimeline (see types.ts). Returns { timeline, warnings }.
 */
export function buildTimeline(ep, chapters, words, { endScreenSec = 20 } = {}) {
  const fps = ep.fps;
  const F = (sec) => Math.round(sec * fps);
  const warnings = [];
  const lines = new Map(words.vo.map((l) => [l.id, l]));
  const total = F(words.totalSec);
  // scene global starts
  const flat = [];
  chapters.forEach((c, ci) =>
    (c.scenes ?? []).forEach((s, si) => {
      const ls = (s.vo ?? []).map((_, li) => lines.get(`${s.id}-l${li + 1}`));
      if (ls.some((l) => !l)) throw new Error(`scene ${s.id}: words.json is missing its lines — re-run the voice step`);
      flat.push({ c, ci, s, si, ls, start: ls.length ? (flat.length === 0 ? 0 : F(ls[0].start - LEAD_SEC)) : null });
    }),
  );
  const voiced = flat.filter((x) => x.start !== null);
  const out = [];
  let globalEnd = 0;
  chapters.forEach((c, ci) => {
    const scenes = flat.filter((x) => x.ci === ci);
    const isSilent = scenes.every((x) => x.start === null);
    let cStart;
    let cEnd;
    if (isSilent) {
      cStart = globalEnd;
      cEnd = cStart + F(c.seconds ?? endScreenSec);
    } else {
      cStart = scenes.find((x) => x.start !== null).start;
      const nextVoiced = voiced.find((x) => x.ci > ci);
      cEnd = nextVoiced ? nextVoiced.start : total;
    }
    const tScenes = [];
    scenes.forEach((x, k) => {
      const sStart = isSilent ? cStart + Math.round(((cEnd - cStart) * k) / scenes.length) : x.start;
      const nextS = scenes[k + 1];
      const sEnd = isSilent ? cStart + Math.round(((cEnd - cStart) * (k + 1)) / scenes.length) : nextS ? nextS.start : cEnd;
      const sw = x.ls.flatMap((l) => l.words).map((w) => ({ w: w.w, f0: F(w.start) - sStart, f1: Math.max(F(w.start) + 1, F(w.end)) - sStart }));
      const text = x.ls.map((l) => l.text).join(' ');
      const known = new Set(sw.map((w) => normTok(w.w)));
      for (const [k2, v] of cueWords(x.s.props ?? {})) if (!known.has(normTok(v))) warnings.push(`${x.s.id}: cue ${k2}="${v}" is not a word of this scene's VO (falls back to a default frame)`);
      const sfxDefault = x.s.noDefaultSfx ? [] : defaultSfx(x.s, sw, fps);
      const sfxExtra = (x.s.sfx ?? []).map((q) => ({ id: q.id, at: q.on ? (sw.find((w) => normTok(w.w) === normTok(q.on))?.f0 ?? 0) : F(q.at ?? 0), gain: q.gain }));
      tScenes.push({
        id: x.s.id,
        template: x.s.template,
        props: x.s.props ?? {},
        from: sStart - cStart,
        durationInFrames: sEnd - sStart,
        words: sw,
        text,
        ...(x.s.rehook ? { rehook: true } : {}),
        _sfx: [...sfxDefault, ...sfxExtra].map((q) => ({ ...q, at: q.at + sStart - cStart })),
      });
      if ((sEnd - sStart) / fps > 22) warnings.push(`${x.s.id}: ${((sEnd - sStart) / fps).toFixed(1)} s in one scene — split it (a new scene at least every ~20 s, a reveal every 3–5 s inside it)`);
    });
    const chapterIdx = chapters.slice(0, ci + 1).filter((q) => q.kind === 'chapter').length;
    out.push({
      episode: ep.id,
      id: c.id,
      kind: c.kind,
      title: c.title,
      index: ci,
      label: c.label ?? (c.kind === 'chapter' ? `Chapter ${NUM[chapterIdx] ?? chapterIdx}` : ''),
      fps,
      width: ep.width,
      height: ep.height,
      startFrame: cStart,
      durationInFrames: cEnd - cStart,
      scenes: tScenes.map(({ _sfx, ...s }) => s),
      sfx: tScenes.flatMap((s) => s._sfx).filter((q) => q.at >= 0 && q.at < cEnd - cStart).sort((a, b) => a.at - b.at),
    });
    globalEnd = cEnd;
  });
  // structure checks (long-form grammar)
  const sec = (fr) => fr / fps;
  const cold = out.find((c) => c.kind === 'cold-open');
  if (cold && sec(cold.durationInFrames) > 30) warnings.push(`cold open is ${sec(cold.durationInFrames).toFixed(1)} s (> 30 s)`);
  for (const c of out.filter((q) => q.kind === 'chapter')) {
    const d = sec(c.durationInFrames);
    if (d > 150) warnings.push(`${c.id}: ${d.toFixed(0)} s — chapters are 90–150 s; split it`);
    if (d < 90 && !ep.excerpt) warnings.push(`${c.id}: ${d.toFixed(0)} s — chapters are 90–150 s (set "excerpt": true in episode.json for demos)`);
  }
  // re-hook spacing: chapter starts + rehook scenes must come every ≤ 90 s
  const hooks = out.flatMap((c) => [c.startFrame, ...c.scenes.filter((s) => s.rehook).map((s) => c.startFrame + s.from)]).sort((a, b) => a - b);
  for (let i = 1; i < hooks.length; i++) if (sec(hooks[i] - hooks[i - 1]) > 90) warnings.push(`no re-hook between ${fmtTime(sec(hooks[i - 1]))} and ${fmtTime(sec(hooks[i]))} (> 90 s) — add "rehook": true to a scene with a new open loop`);
  const last = out[out.length - 1];
  const endsWithScreen = last && last.kind === 'end-screen';
  if (!endsWithScreen && !ep.excerpt) warnings.push('no end-screen chapter (20 s) at the end');
  for (const c of out) {
    const perSec = c.sfx.length / Math.max(1, sec(c.durationInFrames));
    if (perSec > 0.5) warnings.push(`${c.id}: ${c.sfx.length} SFX in ${sec(c.durationInFrames).toFixed(0)} s (> 1 per 2 s)`);
  }
  const durationInFrames = out.reduce((m, c) => Math.max(m, c.startFrame + c.durationInFrames), 0);
  return {
    timeline: {
      id: ep.id,
      title: ep.title,
      fps,
      width: ep.width,
      height: ep.height,
      durationInFrames,
      voice: { source: words.source, aligner: words.aligner ?? null, mock: !!words.mock, totalSec: words.totalSec },
      chapters: out,
    },
    warnings,
  };
}

export function fmtTime(s) {
  const t = Math.floor(s);
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const ss = String(t % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}

/** YouTube chapter list: first at 0:00, ≥ 3 chapters, each ≥ 10 s (YouTube's rules). */
export function youtubeChapters(timeline) {
  const rows = timeline.chapters.map((c) => `${fmtTime(c.startFrame / timeline.fps)} ${c.kind === 'cold-open' ? 'Intro' : c.title}`);
  const warn = [];
  if (timeline.chapters.length < 3) warn.push(`YouTube needs ≥ 3 chapters for timestamps to show as chapters (this has ${timeline.chapters.length})`);
  for (const c of timeline.chapters) if (c.durationInFrames / timeline.fps < 10) warn.push(`${c.id} < 10 s: YouTube ignores chapters shorter than 10 s`);
  return { text: rows.join('\n'), warn };
}

/** critique shot list: one shot per scene (global frames), 1920x1080. */
export function shotListFor(timeline, compId) {
  const shots = timeline.chapters.flatMap((c) =>
    c.scenes.map((s) => ({
      id: s.id,
      start: c.startFrame + s.from,
      end: c.startFrame + s.from + s.durationInFrames,
      action: `${s.template}${s.props.set ? `/${s.props.set}` : ''}`,
      caption: s.text.split(' ').slice(0, 5).join(' '),
      state: s.rehook ? 're-hook' : '',
      sfx: [],
    })),
  );
  return { id: compId, fps: timeline.fps, width: timeline.width, height: timeline.height, durationInFrames: timeline.durationInFrames, shots };
}

export const exists = existsSync;
