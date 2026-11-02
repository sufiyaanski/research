#!/usr/bin/env python3
"""
gen_voice.py — ElevenLabs voice track + exact word times for a reel, driven by beats.json.

Reads an episode's beats.json (remotion/src/episodes/<id>/beats.json — the VO contract),
generates each line with ElevenLabs text-to-speech WITH character timestamps (one call per
line so one rewrite re-bills one line), converts the character alignment to per-word times,
lays the lines on the global timeline, concatenates them into voice.wav, writes the REAL
timings back into beats.json and emits vo.gen.ts for the Remotion captions.

beats.json contract (what the Remotion side writes; everything else is optional):
  {
    "id": "signal-001-anchoring", "composition": "SignalAnchoring",
    "format": { "fps": 60, "durationSec": 51 },          # or top-level "fps"/"durationSec"
    "vo": [
      { "beat": "hook", "text": "This $429 bread maker was never meant to sell.", "start": 0.3, "end": 3.4,
        "tts": "optional alternate text sent to TTS (phonetics, [v3 audio tags])" }
    ]
  }
After a run every vo[] line has: id, planned_start, planned_end, start, end, wpm and
words: [{ "w", "start", "end" }]  (the lib/kit TimedWord shape; estimate-vo.mjs copies it verbatim).

Timeline rule: line.start = max(planned_start, previous line end + GAP). Lines never overlap;
a line pushed later than planned is reported as DRIFT (fix the script or the planned starts —
the composition reads the REAL starts from vo.gen.ts, so drift is a pacing bug, not a sync bug).

Outputs (defaults follow the kit layout; all overridable):
  episodes/<id>/voice/voice.wav              timed voice track, 48 kHz stereo, -16 LUFS / -1.5 dBTP
  episodes/<id>/voice/cache/<lineid>-<sha1>.mp3 + .words.json   per-line cache (text+voice+model+settings)
  remotion/public/voice/<id>/voice.wav       copy for <Audio src={staticFile('voice/<id>/voice.wav')} />
  remotion/src/episodes/<id>/vo.gen.ts       export const VO: VoLine[] (import type from '../../lib/kit')
  beats.json                                 updated in place

Usage:
  python3 -I tools/gen_voice.py --beats remotion/src/episodes/<id>/beats.json
  python3 -I tools/gen_voice.py --beats ... --mock            # no API key: silent wav + plausible timings (2.7 w/s)
  python3 -I tools/gen_voice.py --beats ... --dry-run         # plan + pace check only, writes nothing
  python3 -I tools/gen_voice.py --beats ... --voice <id> --model eleven_multilingual_v2 --stability 0.6 --speed 0.97
  python3 -I tools/gen_voice.py --beats ... --mux out/SignalAnchoring.mp4   # also writes out/SignalAnchoring-voiced.mp4

Env: ELEVENLABS_API_KEY (or .env at repo root). ffmpeg/ffprobe on PATH for real mode; mock
mode needs only the stdlib.

API (verified 2026-11 against elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps):
  POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/with-timestamps?output_format=mp3_44100_128
  headers: xi-api-key, Content-Type: application/json
  body: { text, model_id (default eleven_multilingual_v2),
          voice_settings: { stability 0.5, similarity_boost 0.75, style 0, use_speaker_boost true, speed 1.0 },
          previous_text, next_text, apply_text_normalization: "auto"|"on"|"off", seed }
  200: { audio_base64, alignment: { characters[], character_start_times_seconds[], character_end_times_seconds[] },
         normalized_alignment: same shape }
  speed documented range: 0.7 .. 1.2 (1.0 = unchanged).
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import json
import math
import os
import re
import shutil
import struct
import subprocess
import sys
import urllib.error
import urllib.request
import wave

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DEFAULT_VOICE = "TX3LPaxmHKxFdv7VOQHJ"   # ElevenLabs premade "Liam" — swap with --voice
DEFAULT_MODEL = "eleven_multilingual_v2"  # "most stable on long-form generations" (ElevenLabs models page)
OUTPUT_FORMAT = "mp3_44100_128"
GAP_S = 0.25            # minimum silence between consecutive lines
TAIL_S = 0.6            # silence after the last line when durationSec is not given
MOCK_WPS = 2.7          # fabricated pace in mock mode (words per second)
WPM_LINE_MAX = 170      # --wpm-check: warn above this per line
WPS_TOTAL_MAX = 2.9     # --wpm-check: warn above this overall
SR = 48000              # voice.wav sample rate (matches the 48 kHz render/mux chain)
VOICE_LUFS = -16.0      # voice.wav integrated loudness target (final mix is re-normalized to -14)
VOICE_TP = -1.5

AUDIO_TAG_RE = re.compile(r"\[[^\]]{1,40}\]")  # eleven_v3 delivery tags like [whispers]


# ----------------------------------------------------------------------------- helpers
def log(msg: str) -> None:
    print(msg, file=sys.stderr)


def load_env() -> dict:
    env = {}
    p = os.path.join(ROOT, ".env")
    if os.path.exists(p):
        with open(p, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip('"').strip("'")
    return {**env, **os.environ}


def run(cmd: list[str]) -> str:
    r = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    if r.returncode != 0:
        sys.exit(f"command failed ({r.returncode}): {' '.join(cmd)}\n{r.stdout[-3000:]}")
    return r.stdout


def probe_duration(path: str) -> float:
    out = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
               "-of", "default=noprint_wrappers=1:nokey=1", path])
    return float(out.strip())


def speech_words(text: str) -> list[str]:
    """Words as they will be captioned: audio tags stripped, whitespace-split."""
    return [w for w in AUDIO_TAG_RE.sub(" ", text).split() if w]


def settings_hash(voice: str, model: str, text: str, vs: dict | None) -> str:
    key = json.dumps({"v": voice, "m": model, "t": text, "s": vs}, sort_keys=True, ensure_ascii=False)
    return hashlib.sha1(key.encode("utf-8")).hexdigest()[:12]


def episode_paths(beats_path: str, beats: dict) -> tuple[str, str | None]:
    """(episode id, remotion episode dir if beats.json lives in remotion/src/episodes/<id>/)."""
    d = os.path.dirname(beats_path)
    ep_id = beats.get("id") or os.path.basename(d)
    parent = os.path.basename(os.path.dirname(d))
    return ep_id, d if parent == "episodes" and os.path.basename(os.path.dirname(os.path.dirname(d))) == "src" else None


# ----------------------------------------------------------------------------- alignment
def chars_to_words(chars: list[str], starts: list[float], ends: list[float]) -> list[dict]:
    """Collapse ElevenLabs character alignment into whitespace-delimited words (raw clip seconds)."""
    words, cur, w_s, w_e = [], "", None, None
    for ch, s, e in zip(chars, starts, ends):
        if ch.isspace():
            if cur:
                words.append({"w": cur, "start": round(w_s, 3), "end": round(w_e, 3)})
                cur, w_s = "", None
            continue
        if not cur:
            w_s = s
        cur += ch
        w_e = e
    if cur:
        words.append({"w": cur, "start": round(w_s, 3), "end": round(w_e, 3)})
    return [w for w in words if not AUDIO_TAG_RE.fullmatch(w["w"])]  # tags are directions, never captions


def estimate_words(text: str, duration: float | None = None, wps: float = MOCK_WPS) -> tuple[list[dict], float]:
    """Fabricate word times: duration from word count at `wps`, distributed by word length,
    with small pauses after punctuation. Returns (words in clip seconds, line_duration)."""
    ws = speech_words(text)
    if not ws:
        return [], 0.0
    pauses = [0.0] * len(ws)
    for i, w in enumerate(ws[:-1]):
        if w[-1] in ".!?":
            pauses[i] = 0.25
        elif w[-1] in ",;:—–":
            pauses[i] = 0.12
    extra = sum(pauses)
    total = duration if duration else len(ws) / wps + extra
    speech_total = max(0.1, total - extra)
    weights = [max(2, len(re.sub(r"[^0-9A-Za-z$%€£.]", "", w))) + 1.5 for w in ws]
    wsum = sum(weights)
    out, t = [], 0.0
    for w, wt, p in zip(ws, weights, pauses):
        d = speech_total * wt / wsum
        out.append({"w": w, "start": round(t, 3), "end": round(t + d * 0.88, 3)})  # a hair of air between words
        t += d + p
    return out, round(total, 3)


# ----------------------------------------------------------------------------- ElevenLabs
def tts_with_timestamps(key: str, voice: str, model: str, text: str, vs: dict | None,
                        prev_text: str | None, next_text: str | None, out_mp3: str) -> list[dict]:
    body: dict = {"text": text, "model_id": model}
    if vs is not None:
        body["voice_settings"] = vs
    if prev_text:
        body["previous_text"] = prev_text
    if next_text:
        body["next_text"] = next_text

    def call(url: str):
        req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"),
                                     headers={"xi-api-key": key, "Content-Type": "application/json"}, method="POST")
        with urllib.request.urlopen(req, timeout=180) as r:
            ctype = r.headers.get("Content-Type", "")
            raw = r.read()
        return json.loads(raw) if "json" in ctype else raw

    base = f"https://api.elevenlabs.io/v1/text-to-speech/{voice}"
    try:
        resp = call(f"{base}/with-timestamps?output_format={OUTPUT_FORMAT}")
        audio = base64.b64decode(resp["audio_base64"])
        al = resp.get("alignment") or resp.get("normalized_alignment") or {}
        words = chars_to_words(al.get("characters", []), al.get("character_start_times_seconds", []),
                               al.get("character_end_times_seconds", []))
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "ignore")[:600]
        if e.code in (400, 404, 422):
            log(f"    with-timestamps refused ({e.code}): {detail}\n    falling back to plain TTS + estimated words")
            try:
                audio = call(f"{base}?output_format={OUTPUT_FORMAT}")
            except urllib.error.HTTPError as e2:
                sys.exit(f"ElevenLabs TTS failed ({e2.code}) for {text!r}\n{e2.read().decode('utf-8', 'ignore')[:600]}")
            words = []
        elif e.code == 401:
            sys.exit("ElevenLabs 401: bad/missing ELEVENLABS_API_KEY")
        else:
            sys.exit(f"ElevenLabs TTS failed ({e.code}) for {text!r}\n{detail}")
    with open(out_mp3, "wb") as f:
        f.write(audio)
    return words


# ----------------------------------------------------------------------------- wav writing
def write_silent_wav(path: str, seconds: float, tone_marks: list[float] | None = None) -> None:
    """Stdlib-only 48 kHz stereo 16-bit wav: silent, or with soft 60 ms ticks at `tone_marks`
    (word starts) so a mock render can be sync-checked by ear."""
    n = int(round(seconds * SR))
    frames = bytearray(n * 4)
    if tone_marks:
        amp, tick = 0.18 * 32767, int(0.06 * SR)
        for t in tone_marks:
            i0 = int(t * SR)
            for i in range(tick):
                j = i0 + i
                if j >= n:
                    break
                v = int(amp * math.sin(math.pi * i / tick) * math.sin(2 * math.pi * 880 * i / SR))
                struct.pack_into("<hh", frames, j * 4, v, v)
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(bytes(frames))


def loudnorm_two_pass(src: str, dst: str, I: float, TP: float, LRA: float = 11.0) -> None:
    """EBU R128 two-pass loudnorm: measure (print_format=json), then apply linearly with measured_*."""
    first = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", src, "-af",
                            f"loudnorm=I={I}:TP={TP}:LRA={LRA}:print_format=json", "-f", "null", os.devnull],
                           stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True).stdout
    m = re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", first, re.S)
    if not m:
        sys.exit("loudnorm first pass produced no stats:\n" + first[-2000:])
    st = json.loads(m.group(0))
    if st["input_i"] in ("-inf", "nan") or float(st["input_i"]) < -60:
        log("    voice is (near) silent — skipping loudnorm")
        run(["ffmpeg", "-y", "-v", "error", "-i", src, "-ar", str(SR), "-ac", "2", dst])
        return
    af = (f"loudnorm=I={I}:TP={TP}:LRA={LRA}:measured_I={st['input_i']}:measured_LRA={st['input_lra']}:"
          f"measured_TP={st['input_tp']}:measured_thresh={st['input_thresh']}:offset={st['target_offset']}:"
          f"linear=true:print_format=summary")
    run(["ffmpeg", "-y", "-v", "error", "-i", src, "-af", af, "-ar", str(SR), "-ac", "2", dst])


# ----------------------------------------------------------------------------- outputs
def emit_ts(vo: list[dict], fps: int, total: float, path: str, source: str, fmt: str) -> None:
    def js(o):  # JSON is valid TS object-literal syntax
        return json.dumps(o, ensure_ascii=False)
    mock = "true" if source.startswith("mock") else "false"
    lines = ["// AUTO-GENERATED by tools/gen_voice.py from beats.json — do not edit by hand; re-run gen_voice.py.",
             f"// Mode: {'MOCK timings (2.7 w/s, silent wav) — regenerate with a real voice before shipping' if mock == 'true' else 'REAL word alignment (' + source + ')'}",
             "// Times are SECONDS on the global timeline; frame = Math.round(t * fps)."]
    if fmt == "kit":
        lines += ["import type { VoLine } from '../../lib/kit';", "",
                  f"export const VO_FPS = {fps};", f"export const VO_TOTAL_SEC = {total};", f"export const VO_MOCK = {mock};", "",
                  "export const VO: VoLine[] = ["]
        for ln in vo:
            obj = {"beat": ln.get("beat", ln["id"]), "text": ln["text"], "start": ln["start"], "end": ln["end"],
                   "words": [{"w": w["w"], "start": w["start"], "end": w["end"]} for w in ln.get("words", [])]}
            lines.append("  " + js(obj) + ",")
    else:  # compact, self-contained
        lines += ["export type VoWord = { w: string; s: number; e: number };",
                  "export type VoLine = { id: string; beat?: string; text: string; start: number; end: number; words: VoWord[] };", "",
                  f"export const VO_FPS = {fps};", f"export const VO_TOTAL_SEC = {total};", f"export const VO_MOCK = {mock};", "",
                  "export const VO: VoLine[] = ["]
        for ln in vo:
            obj = {"id": ln["id"], "beat": ln.get("beat"), "text": ln["text"], "start": ln["start"], "end": ln["end"],
                   "words": [{"w": w["w"], "s": w["start"], "e": w["end"]} for w in ln.get("words", [])]}
            lines.append("  " + js(obj) + ",")
    lines += ["];", ""]
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


def wpm_report(vo: list[dict], gap: float) -> int:
    """Print pace warnings. Returns the number of warnings."""
    warns, total_words, speech_time = 0, 0, 0.0
    print(f"  {'id':8} {'words':>5} {'dur':>6} {'wpm':>5} {'need':>5}  note")
    for i, ln in enumerate(vo):
        n = len(ln.get("words") or speech_words(ln["text"]))
        dur = max(0.01, float(ln["end"]) - float(ln["start"]))
        wpm = n / dur * 60
        total_words += n
        speech_time += dur
        notes, need = [], ""
        if i + 1 < len(vo):  # pace needed to finish before the NEXT planned start
            window = float(vo[i + 1].get("planned_start", vo[i + 1]["start"])) - float(ln.get("planned_start", ln["start"])) - gap
            if window > 0:
                need_wpm = n / window * 60
                need = f"{need_wpm:5.0f}"
                if need_wpm > WPM_LINE_MAX:
                    notes.append(f"WARN planned window {window:.2f}s needs {need_wpm:.0f} wpm — add time or cut words")
        if wpm > WPM_LINE_MAX:
            notes.append(f"WARN > {WPM_LINE_MAX} wpm — too fast to caption")
        drift = float(ln["start"]) - float(ln.get("planned_start", ln["start"]))
        if drift > 0.3:
            notes.append(f"WARN DRIFT +{drift:.2f}s vs planned start")
        warns += len(notes)
        print(f"  {ln['id']:8} {n:5d} {dur:6.2f} {wpm:5.0f} {need:>5}  {'; '.join(notes)}")
    if speech_time > 0:
        wps = total_words / speech_time
        if wps > WPS_TOTAL_MAX:
            warns += 1
        print(f"  total: {total_words} words over {speech_time:.1f}s of speech = {wps:.2f} w/s ({wps*60:.0f} wpm) "
              f"{'WARN' if wps > WPS_TOTAL_MAX else 'ok'} (limit {WPS_TOTAL_MAX} w/s)")
    return warns


# ----------------------------------------------------------------------------- main
def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--beats", required=True, help="remotion/src/episodes/<id>/beats.json (updated in place)")
    ap.add_argument("--voice", default=DEFAULT_VOICE, help="ElevenLabs voice_id")
    ap.add_argument("--model", default=DEFAULT_MODEL,
                    help="eleven_multilingual_v2 (default, stable narration) | eleven_v3 (expressive) | eleven_flash_v2_5 (cheap/fast)")
    ap.add_argument("--stability", type=float, default=0.5)
    ap.add_argument("--similarity", type=float, default=0.75)
    ap.add_argument("--style", type=float, default=0.0)
    ap.add_argument("--speed", type=float, default=1.0, help="0.7 .. 1.2 per ElevenLabs docs")
    ap.add_argument("--no-speaker-boost", action="store_true")
    ap.add_argument("--v3-settings", action="store_true",
                    help="send voice_settings/previous_text to eleven_v3 too (omitted for v3 by default: the reference "
                         "implementation reports v3 rejects them; unverified against current docs)")
    ap.add_argument("--gap", type=float, default=GAP_S, help="min silence between lines (s)")
    ap.add_argument("--out-dir", help="voice.wav + cache/ dir (default: episodes/<id>/voice when beats is in remotion/src/episodes/<id>)")
    ap.add_argument("--public-dir", help="copy voice.wav here for staticFile() (default remotion/public/voice/<id>; '' to skip)")
    ap.add_argument("--emit-ts", help="vo.gen.ts path (default: next to beats.json)")
    ap.add_argument("--ts-format", choices=["kit", "compact"], default="kit",
                    help="kit = VoLine from lib/kit with words {w,start,end} (default); compact = self-contained {id,text,words:{w,s,e}}")
    ap.add_argument("--no-ts", action="store_true")
    ap.add_argument("--emit-json", help="also write the VO as JSON")
    ap.add_argument("--mux", help="mux voice.wav onto this mp4 -> <name>-voiced.mp4")
    ap.add_argument("--mock", action="store_true", help="no API: fabricate timings at 2.7 w/s + silent wav")
    ap.add_argument("--mock-ticks", action="store_true", help="mock wav gets a soft tick at every word start")
    ap.add_argument("--wpm-check", action="store_true", help="print pace warnings (>170 wpm/line, >2.9 w/s total)")
    ap.add_argument("--dry-run", action="store_true", help="plan + checks only, no audio, no writes")
    ap.add_argument("--force", action="store_true", help="ignore cache")
    args = ap.parse_args()

    if not 0.7 <= args.speed <= 1.2:
        sys.exit("--speed must be within 0.7..1.2 (ElevenLabs documented range)")

    beats_path = os.path.abspath(args.beats)
    with open(beats_path, encoding="utf-8") as f:
        beats = json.load(f)
    vo = beats.get("vo")
    if not vo:
        sys.exit("beats.json has no vo[] lines")
    fmt_block = beats.get("format") if isinstance(beats.get("format"), dict) else None
    fps = int(beats.get("fps") or (fmt_block or {}).get("fps") or 60)
    planned_total = beats.get("durationSec") or (fmt_block or {}).get("durationSec")
    ep_id, remotion_ep_dir = episode_paths(beats_path, beats)

    out_dir = (os.path.abspath(args.out_dir) if args.out_dir
               else os.path.join(ROOT, "episodes", ep_id, "voice") if remotion_ep_dir
               else os.path.join(os.path.dirname(beats_path), "voice"))
    public_dir = (None if args.public_dir == "" else os.path.abspath(args.public_dir) if args.public_dir
                  else os.path.join(ROOT, "remotion", "public", "voice", ep_id))
    ts_path = None if args.no_ts else os.path.abspath(args.emit_ts) if args.emit_ts else os.path.join(os.path.dirname(beats_path), "vo.gen.ts")
    cache_dir = os.path.join(out_dir, "cache")
    if not args.dry_run:
        os.makedirs(cache_dir, exist_ok=True)

    is_v3 = args.model.startswith("eleven_v3")
    vs: dict | None = {"stability": args.stability, "similarity_boost": args.similarity, "style": args.style,
                       "use_speaker_boost": not args.no_speaker_boost, "speed": args.speed}
    if is_v3 and not args.v3_settings:
        vs = None

    key = None
    if not args.mock and not args.dry_run:
        key = load_env().get("ELEVENLABS_API_KEY", "").strip()
        if not key:
            sys.exit("ELEVENLABS_API_KEY not set (env or .env). Use --mock to work without it.")

    # stable ids + remember the PLANNED window (idempotent across re-runs)
    for i, ln in enumerate(vo):
        ln.setdefault("id", f"l{i+1:02d}")
        ln.setdefault("planned_start", float(ln["start"]))
        if "end" in ln:
            ln.setdefault("planned_end", float(ln["end"]))

    mode = "mock" if args.mock else ("dry-run" if args.dry_run else f"elevenlabs:{args.model}")
    log(f"gen_voice: {ep_id} — {len(vo)} lines, fps={fps}, mode={mode}, voice={args.voice}, gap={args.gap}s")
    log(f"  {'id':8} {'plan':>6} {'start':>6} {'end':>6} {'dur':>5}  text")

    clips: list[tuple[str, float]] = []
    prev_end = 0.0
    for i, ln in enumerate(vo):
        tts_text = ln.get("tts", ln["text"])
        planned = float(ln["planned_start"])
        start = max(planned, prev_end + args.gap) if i > 0 else planned
        h = settings_hash(args.voice, args.model, tts_text, vs)
        mp3 = os.path.join(cache_dir, f"{ln['id']}-{h}.mp3")
        wav = os.path.join(cache_dir, f"{ln['id']}-{h}.wav")
        wjson = os.path.join(cache_dir, f"{ln['id']}-{h}.words.json")

        if args.mock or args.dry_run:
            words, dur = estimate_words(tts_text)
        else:
            if args.force or not (os.path.exists(mp3) and os.path.exists(wjson)):
                prev_t = vo[i - 1].get("tts", vo[i - 1]["text"]) if (i > 0 and vs is not None) else None
                next_t = vo[i + 1].get("tts", vo[i + 1]["text"]) if (i + 1 < len(vo) and vs is not None) else None
                words = tts_with_timestamps(key, args.voice, args.model, tts_text, vs, prev_t, next_t, mp3)
                with open(wjson, "w", encoding="utf-8") as f:
                    json.dump(words, f, ensure_ascii=False)
                if os.path.exists(wav):
                    os.remove(wav)
            else:
                with open(wjson, encoding="utf-8") as f:
                    words = json.load(f)
            if not os.path.exists(wav):
                run(["ffmpeg", "-y", "-v", "error", "-i", mp3, "-ar", str(SR), "-ac", "2", wav])
            dur = probe_duration(wav)
            if not words:  # plain-TTS fallback: estimate inside the real duration
                words, _ = estimate_words(tts_text, duration=dur)
            if words and words[-1]["end"] + 0.05 < dur:  # ignore trailing silence for the timeline
                dur = round(words[-1]["end"] + 0.08, 3)
            clips.append((wav, start))

        ln["start"] = round(start, 3)
        ln["end"] = round(start + dur, 3)
        ln["words"] = [{"w": w["w"], "start": round(start + w["start"], 3), "end": round(start + w["end"], 3)} for w in words]
        ln["wpm"] = round(len(words) / dur * 60) if dur > 0 else 0
        drift = start - planned
        log(f"  {ln['id']:8} {planned:6.2f} {start:6.2f} {ln['end']:6.2f} {dur:5.2f}  {ln['text'][:58]}"
            + (f"  DRIFT +{drift:.2f}s" if drift > 0.05 else ""))
        prev_end = ln["end"]

    total = float(planned_total) if planned_total else round(prev_end + TAIL_S, 3)
    if prev_end > total - 0.3:
        log(f"  WARN: speech ends at {prev_end:.2f}s, composition is {total}s — the loop/last frame needs >= 0.3 s of air")
        if prev_end > total:
            total = round(prev_end + TAIL_S, 3)
    if fmt_block is not None:
        fmt_block["durationSec"] = total
        fmt_block["fps"] = fps
    else:
        beats["durationSec"], beats["fps"] = total, fps

    if args.wpm_check or args.dry_run:
        print("pace check:")
        print(f"  {wpm_report(vo, args.gap)} warning(s)")
    if args.dry_run:
        return

    # ---- assemble voice.wav
    voice_wav = os.path.join(out_dir, "voice.wav")
    if args.mock:
        marks = [w["start"] for ln in vo for w in ln["words"]] if args.mock_ticks else None
        write_silent_wav(voice_wav, total, marks)
        beats["voiceStatus"] = "mock (silent, 2.7 w/s timings) — run gen_voice.py without --mock before shipping"
        source = "mock"
    else:
        raw = os.path.join(out_dir, "voice.raw.wav")
        inputs, parts = [], []
        for j, (path, start) in enumerate(clips):
            inputs += ["-i", path]
            ms = int(round(start * 1000))
            parts.append(f"[{j}:a]adelay={ms}:all=1[a{j}]")
        chain = "".join(f"[a{j}]" for j in range(len(clips)))
        fc = ";".join(parts) + f";{chain}amix=inputs={len(clips)}:normalize=0:dropout_transition=0,apad,atrim=0:{total}[out]"
        run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", fc, "-map", "[out]", "-ar", str(SR), "-ac", "2", raw])
        loudnorm_two_pass(raw, voice_wav, VOICE_LUFS, VOICE_TP)
        os.remove(raw)
        source = f"elevenlabs:{args.model}:{args.voice}"
        beats["voiceStatus"] = source
    log(f"voice track -> {voice_wav}  ({total}s)")
    if public_dir:
        os.makedirs(public_dir, exist_ok=True)
        shutil.copyfile(voice_wav, os.path.join(public_dir, "voice.wav"))
        log(f"copied for staticFile() -> {os.path.join(public_dir, 'voice.wav')}")

    with open(beats_path, "w", encoding="utf-8") as f:
        json.dump(beats, f, indent=2, ensure_ascii=False)
        f.write("\n")
    log(f"timings written back -> {beats_path}")

    if ts_path:
        emit_ts(vo, fps, total, ts_path, source, args.ts_format)
        log(f"vo.gen.ts ({args.ts_format}) -> {ts_path}")
    if args.emit_json:
        with open(os.path.abspath(args.emit_json), "w", encoding="utf-8") as f:
            json.dump({"id": ep_id, "fps": fps, "totalSec": total, "source": source, "vo": vo}, f, indent=2, ensure_ascii=False)
        log(f"vo json -> {os.path.abspath(args.emit_json)}")

    if args.mux:
        out = os.path.splitext(args.mux)[0] + "-voiced.mp4"
        run(["ffmpeg", "-y", "-v", "error", "-i", args.mux, "-i", voice_wav, "-map", "0:v:0", "-map", "1:a:0",
             "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out])
        log(f"voiced preview -> {out}")


if __name__ == "__main__":
    main()
