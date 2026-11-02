#!/usr/bin/env python3
"""
tts.py — voice-over + exact word timings for reels and long-form, FREE by default.

Engines (``--engine auto`` picks the first one that works, in this order):
  1. elevenlabs  — only if ELEVENLABS_API_KEY is set (env or repo-root .env). Paid. Uses
                   /v1/text-to-speech/{voice}/with-timestamps, so word times come from the API.
  2. kokoro      — free, local, best quality. `pip install kokoro-onnx soundfile` (onnxruntime; works
                   on Python 3.13). Weights (Kokoro-82M v1.0, Apache-2.0, ~340 MB) download once into
                   toolkit/voice/models/. The torch `kokoro` package also works where it installs.
  3. piper       — free, local, fast, smaller. `pip install piper-tts soundfile`; voices download
                   once from Hugging Face (rhasspy/piper-voices) into toolkit/voice/models/.
  4. mock        — no audio engine: silent wav + estimated timings (2.7 words/s). Never ship it.
Local engines get word timestamps from faster-whisper (`pip install faster-whisper`, model
base.en, CPU int8). Whisper's words are mapped back onto YOUR script words (difflib), so captions
always show the script's spelling ("$4.99", "46%"), with whisper's timing.

Input (one of):
  --lines file.json   {"vo": [{"id": "l01", "text": "...", "tts": "optional spoken form", "pauseBefore": 0.4}]}
                      (the setup/tools/gen_voice.py beats.json contract; "lines" also accepted)
  --lines file.txt    one VO line per paragraph (blank-line separated)
  --lines script.md   one VO line per line; headings (#), **meta** lines, tables and <!-- comments --> ignored
  --text "..."        a single line (sentences become separate lines)

Output (in --out DIR):
  voice.wav     48 kHz stereo, loudness-normalised (default −16 LUFS, −1.5 dBTP; the final mix goes to −14)
  words.json    {"id","fps","source","aligner","totalSec","vo":[{"id","text","start","end","words":[{"w","start","end"}]}]}
                — the shape `node beat-grid/make-beats.mjs --vo words.json` accepts
  voice.srt     closed captions from the same timings (upload to YouTube as subtitles)
  cache/        one wav + words file per line, keyed by engine+voice+speed+text → re-runs only redo changed lines

Usage:
  python3 voice/tts.py --text "What if the Moon vanished tonight?" --out out/voice-test
  python3 voice/tts.py --lines ../studio/episodes/<id>/vo-lines.json --out out/longform/<id>/voice
  python3 voice/tts.py --lines script.txt --engine piper --voice en_US-ryan-high --speed 1.05 --out ...
  python3 voice/tts.py --lines ... --engine kokoro --voice am_michael
  python3 voice/tts.py --lines ... --engine mock          # no engine installed
  python3 voice/tts.py --check                            # which engines work here

Pace: HARNESS §3 wants 2.5–2.8 words/s for reels; long-form narration sits at 2.4–2.7 words/s.
The script prints the measured pace per line and overall.
"""
from __future__ import annotations

import argparse
import base64
import difflib
import hashlib
import json
import math
import os
import re
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.request
import wave

HERE = os.path.dirname(os.path.abspath(__file__))
TOOLKIT = os.path.dirname(HERE)
REPO = os.path.dirname(TOOLKIT)
MODELS = os.path.join(HERE, "models")

SR_OUT = 48000
WHISPER_SR = 16000
MOCK_WPS = 2.7
DEFAULT_GAP = 0.2          # silence between consecutive lines (HARNESS: pauses ≤ 0.25 s)
DEFAULT_PIPER_VOICE = "en_US-ryan-high"
DEFAULT_KOKORO_VOICE = "am_michael"
DEFAULT_EL_VOICE = "TX3LPaxmHKxFdv7VOQHJ"   # ElevenLabs premade "Liam"
DEFAULT_EL_MODEL = "eleven_multilingual_v2"
AUDIO_TAG_RE = re.compile(r"\[[^\]]{1,40}\]")  # eleven_v3 delivery tags like [whispers]


def log(msg: str) -> None:
    print(msg, file=sys.stderr, flush=True)


def run(cmd: list[str], data: bytes | None = None) -> bytes:
    r = subprocess.run(cmd, input=data, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if r.returncode != 0:
        sys.exit(f"command failed ({r.returncode}): {' '.join(cmd[:6])} …\n{r.stderr.decode('utf-8', 'ignore')[-2000:]}")
    return r.stdout


def load_env() -> dict:
    env: dict = {}
    for p in (os.path.join(REPO, ".env"), os.path.join(TOOLKIT, ".env")):
        if os.path.exists(p):
            with open(p, encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        env[k.strip()] = v.strip().strip('"').strip("'")
    return {**env, **os.environ}


def speech_words(text: str) -> list[str]:
    return [w for w in AUDIO_TAG_RE.sub(" ", text).split() if w]


# ----------------------------------------------------------------------------- input
def load_lines(args) -> tuple[str, int, list[dict]]:
    if args.text:
        parts = [p.strip() for p in re.split(r"(?<=[.!?])\s+", args.text.strip()) if p.strip()]
        return "tts", args.fps, [{"id": f"l{i+1:02d}", "text": p} for i, p in enumerate(parts)]
    path = args.lines
    with open(path, encoding="utf-8") as f:
        raw = f.read()
    if path.endswith(".json"):
        obj = json.loads(raw)
        lines = obj.get("vo") or obj.get("lines") or (obj if isinstance(obj, list) else None)
        if not lines:
            sys.exit(f"{path}: expected {{'vo': [...]}} or {{'lines': [...]}}")
        out = []
        for i, ln in enumerate(lines):
            ln = {"text": ln} if isinstance(ln, str) else dict(ln)
            ln.setdefault("id", f"l{i+1:02d}")
            out.append(ln)
        fmt = obj.get("format") if isinstance(obj, dict) and isinstance(obj.get("format"), dict) else {}
        fps = int((obj.get("fps") if isinstance(obj, dict) else None) or fmt.get("fps") or args.fps)
        return (obj.get("id") if isinstance(obj, dict) else None) or os.path.splitext(os.path.basename(path))[0], fps, out
    raw = re.sub(r"<!--.*?-->", "", raw, flags=re.S)
    if path.endswith(".md"):
        # script.md: every non-empty line that is not a heading/meta/table/quote line is one VO line
        paras = [l.strip() for l in raw.splitlines()]
        paras = [l for l in paras if l and not re.match(r"^(#|\*\*|\||>|---|- \[)", l)]
    else:
        paras = [re.sub(r"\s+", " ", p).strip() for p in re.split(r"\n\s*\n", raw)]
        paras = [p for p in paras if p and not p.startswith("#")]
    return os.path.splitext(os.path.basename(path))[0], args.fps, [{"id": f"l{i+1:02d}", "text": p} for i, p in enumerate(paras)]


# ----------------------------------------------------------------------------- audio utils
def to_mono_f32(samples, np):
    a = np.asarray(samples, dtype=np.float32)
    return a.mean(axis=1) if a.ndim > 1 else a


def resample(np, a, sr_in: int, sr_out: int):
    if sr_in == sr_out:
        return a
    out = run(["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(sr_in), "-ac", "1", "-i", "pipe:0",
               "-ar", str(sr_out), "-f", "f32le", "pipe:1"], a.astype(np.float32).tobytes())
    return np.frombuffer(out, dtype=np.float32).copy()


def trim_silence(np, a, sr: int, thresh_db: float = -45.0, pad: float = 0.03):
    """Trim leading/trailing silence (10 ms windows below thresh_db). Returns (trimmed, offset_seconds)."""
    win = max(1, int(sr * 0.01))
    n = len(a) // win
    if n == 0:
        return a, 0.0
    rms = np.sqrt(np.mean(a[: n * win].reshape(n, win) ** 2, axis=1) + 1e-12)
    loud = np.where(20 * np.log10(rms) > thresh_db)[0]
    if not len(loud):
        return a, 0.0
    s = max(0, loud[0] * win - int(pad * sr))
    e = min(len(a), (loud[-1] + 1) * win + int(pad * sr))
    return a[s:e], s / sr


def write_wav_f32_as_pcm16(path: str, np, a, sr: int) -> None:
    pcm = (np.clip(a, -1, 1) * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(pcm.tobytes())


def read_wav_mono(path: str, np):
    import soundfile as sf
    a, sr = sf.read(path, dtype="float32")
    return to_mono_f32(a, np), sr


def loudnorm_two_pass(src: str, dst: str, I: float, TP: float, LRA: float = 11.0) -> dict:
    first = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", src, "-af",
                            f"loudnorm=I={I}:TP={TP}:LRA={LRA}:print_format=json", "-f", "null", os.devnull],
                           stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True).stdout
    m = re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", first, re.S)
    if not m:
        sys.exit("loudnorm first pass produced no stats:\n" + first[-2000:])
    st = json.loads(m.group(0))
    if st["input_i"] in ("-inf", "nan") or float(st["input_i"]) < -60:
        run(["ffmpeg", "-y", "-v", "error", "-i", src, "-ar", str(SR_OUT), "-ac", "2", dst])
        return st
    af = (f"loudnorm=I={I}:TP={TP}:LRA={LRA}:measured_I={st['input_i']}:measured_LRA={st['input_lra']}:"
          f"measured_TP={st['input_tp']}:measured_thresh={st['input_thresh']}:offset={st['target_offset']}:linear=true")
    run(["ffmpeg", "-y", "-v", "error", "-i", src, "-af", af, "-ar", str(SR_OUT), "-ac", "2", dst])
    return st


# ----------------------------------------------------------------------------- engines
class Engine:
    name = "?"
    sr = 24000
    native_words = False  # True → synth() returns word times, no whisper needed

    def label(self) -> str:
        return self.name

    def synth(self, text: str, np):  # -> (float32 mono array, sr, words | None)
        raise NotImplementedError


class PiperEngine(Engine):
    name = "piper"

    def __init__(self, voice: str, speed: float):
        from piper import PiperVoice, SynthesisConfig  # noqa: F401  (import check)
        self.voice_name = voice or DEFAULT_PIPER_VOICE
        model = self.voice_name if self.voice_name.endswith(".onnx") else os.path.join(MODELS, f"{self.voice_name}.onnx")
        if not os.path.exists(model):
            os.makedirs(MODELS, exist_ok=True)
            log(f"  piper: downloading public voice {self.voice_name} from Hugging Face (rhasspy/piper-voices) → {MODELS}")
            r = subprocess.run([sys.executable, "-m", "piper.download_voices", "--download-dir", MODELS, self.voice_name],
                               stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
            if r.returncode != 0 or not os.path.exists(model):
                raise RuntimeError(f"piper voice download failed: {r.stdout[-800:]}")
        from piper import PiperVoice
        self.v = PiperVoice.load(model)
        self.sr = self.v.config.sample_rate
        self.speed = speed

    def label(self) -> str:
        return f"piper:{self.voice_name}"

    def synth(self, text, np):
        from piper import SynthesisConfig
        cfg = SynthesisConfig(length_scale=1.0 / self.speed)
        chunks = [c.audio_float_array for c in self.v.synthesize(text, syn_config=cfg)]
        return (np.concatenate(chunks) if chunks else np.zeros(1, np.float32)), self.sr, None


KOKORO_FILES = {  # public Apache-2.0 weights (Kokoro-82M v1.0, ONNX export by thewh1teagle/kokoro-onnx)
    "kokoro-v1.0.onnx": "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx",
    "voices-v1.0.bin": "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin",
}


class KokoroEngine(Engine):
    """Kokoro-82M. Preferred: `pip install kokoro-onnx soundfile` (onnxruntime, works on Python 3.13,
    RTF ≈ 0.3 on 4 CPU cores). Fallback: the torch `kokoro` package (pins numpy 1.26 → no Python 3.13 wheel)."""
    name = "kokoro"
    sr = 24000

    def __init__(self, voice: str, speed: float):
        self.voice_name = voice or DEFAULT_KOKORO_VOICE
        self.speed = speed
        self.lang = "en-gb" if self.voice_name.startswith("b") else "en-us"  # am_/af_ = US, bm_/bf_ = UK
        try:
            from kokoro_onnx import Kokoro
            os.makedirs(MODELS, exist_ok=True)
            for fname, url in KOKORO_FILES.items():
                p = os.path.join(MODELS, fname)
                if not os.path.exists(p):
                    log(f"  kokoro: downloading public weights {fname} → {MODELS} (once, {'~310 MB' if fname.endswith('onnx') else '~27 MB'})")
                    tmp = p + ".part"
                    with urllib.request.urlopen(url, timeout=600) as r, open(tmp, "wb") as f:
                        shutil.copyfileobj(r, f, 1 << 20)
                    os.replace(tmp, p)
            self.k = Kokoro(os.path.join(MODELS, "kokoro-v1.0.onnx"), os.path.join(MODELS, "voices-v1.0.bin"))
            self.backend = "onnx"
        except ImportError:
            from kokoro import KPipeline
            self.pipe = KPipeline(lang_code=self.voice_name[0], repo_id="hexgrad/Kokoro-82M")
            self.backend = "torch"

    def label(self) -> str:
        return f"kokoro:{self.voice_name}"

    def synth(self, text, np):
        if self.backend == "onnx":
            a, sr = self.k.create(text, voice=self.voice_name, speed=self.speed, lang=self.lang)
            return np.asarray(a, dtype=np.float32), sr, None
        parts = []
        for r in self.pipe(text, voice=self.voice_name, speed=self.speed):
            audio = r.audio if hasattr(r, "audio") else r[2]
            if audio is not None:
                parts.append(np.asarray(audio.detach().cpu().numpy() if hasattr(audio, "detach") else audio, dtype=np.float32))
        return (np.concatenate(parts) if parts else np.zeros(1, np.float32)), self.sr, None


class ElevenLabsEngine(Engine):
    name = "elevenlabs"
    sr = 44100
    native_words = True

    def __init__(self, key: str, voice: str, model: str, speed: float):
        self.key, self.voice_name, self.model, self.speed = key, voice or DEFAULT_EL_VOICE, model, speed

    def label(self) -> str:
        return f"elevenlabs:{self.model}:{self.voice_name}"

    def synth(self, text, np):
        body = {"text": text, "model_id": self.model,
                "voice_settings": {"stability": 0.5, "similarity_boost": 0.75, "style": 0, "use_speaker_boost": True,
                                   "speed": max(0.7, min(1.2, self.speed))}}
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{self.voice_name}/with-timestamps?output_format=mp3_44100_128"
        req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"), method="POST",
                                     headers={"xi-api-key": self.key, "Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                resp = json.loads(r.read())
        except urllib.error.HTTPError as e:
            sys.exit(f"ElevenLabs failed ({e.code}): {e.read().decode('utf-8', 'ignore')[:500]}")
        mp3 = base64.b64decode(resp["audio_base64"])
        pcm = run(["ffmpeg", "-v", "error", "-i", "pipe:0", "-ac", "1", "-ar", str(self.sr), "-f", "f32le", "pipe:1"], mp3)
        a = np.frombuffer(pcm, dtype=np.float32).copy()
        al = resp.get("alignment") or resp.get("normalized_alignment") or {}
        words = chars_to_words(al.get("characters", []), al.get("character_start_times_seconds", []),
                               al.get("character_end_times_seconds", []))
        return a, self.sr, words


class MockEngine(Engine):
    name = "mock"
    sr = SR_OUT
    native_words = True

    def synth(self, text, np):
        words, dur = estimate_words(text)
        return np.zeros(int(dur * self.sr) + 1, np.float32), self.sr, words


def chars_to_words(chars, starts, ends) -> list[dict]:
    words, cur, w_s, w_e = [], "", None, None
    for ch, s, e in zip(chars, starts, ends):
        if ch.isspace():
            if cur:
                words.append({"w": cur, "start": w_s, "end": w_e})
                cur = ""
            continue
        if not cur:
            w_s = s
        cur += ch
        w_e = e
    if cur:
        words.append({"w": cur, "start": w_s, "end": w_e})
    return [w for w in words if not AUDIO_TAG_RE.fullmatch(w["w"])]


def estimate_words(text: str, wps: float = MOCK_WPS) -> tuple[list[dict], float]:
    ws = speech_words(text)
    pauses = [0.25 if w[-1] in ".!?" else 0.12 if w[-1] in ",;:—–" else 0.0 for w in ws[:-1]] + [0.0]
    total = len(ws) / wps + sum(pauses)
    speech = max(0.1, total - sum(pauses))
    weights = [max(2, len(re.sub(r"[^0-9A-Za-z$%]", "", w))) + 1.5 for w in ws]
    out, t = [], 0.0
    for w, wt, p in zip(ws, weights, pauses):
        d = speech * wt / sum(weights)
        out.append({"w": w, "start": round(t, 3), "end": round(t + d * 0.88, 3)})
        t += d + p
    return out, round(total, 3)


def make_engine(args, env):
    want = args.engine
    errors = []
    order = ["elevenlabs", "kokoro", "piper", "mock"] if want == "auto" else [want]
    for name in order:
        try:
            if name == "elevenlabs":
                key = env.get("ELEVENLABS_API_KEY", "").strip()
                if not key:
                    raise RuntimeError("ELEVENLABS_API_KEY not set")
                return ElevenLabsEngine(key, args.voice if args.engine == "elevenlabs" else None, args.el_model, args.speed)
            if name == "kokoro":
                return KokoroEngine(args.voice if args.engine == "kokoro" else None, args.speed)
            if name == "piper":
                return PiperEngine(args.voice if args.engine == "piper" else None, args.speed)
            if name == "mock":
                return MockEngine()
        except Exception as e:  # noqa: BLE001 — report and try the next engine
            errors.append(f"{name}: {str(e).splitlines()[0][:160] if str(e) else type(e).__name__}")
    sys.exit("no TTS engine available:\n  " + "\n  ".join(errors))


# ----------------------------------------------------------------------------- alignment
_whisper = None


def whisper_words(np, a16, model_name: str) -> list[dict]:
    """faster-whisper word timestamps. Takes a float32 16 kHz array (not a file path: the installed
    `av` build breaks whisper's own file decoding)."""
    global _whisper
    from faster_whisper import WhisperModel
    if _whisper is None:
        _whisper = WhisperModel(model_name, device="cpu", compute_type="int8")
    segs, _ = _whisper.transcribe(a16, word_timestamps=True, language="en", beam_size=5, vad_filter=False,
                                  condition_on_previous_text=False)
    return [{"w": w.word.strip(), "start": float(w.start), "end": float(w.end)} for s in segs for w in (s.words or [])]


NUM_WORDS = {"zero": "0", "one": "1", "two": "2", "three": "3", "four": "4", "five": "5", "six": "6", "seven": "7",
             "eight": "8", "nine": "9", "ten": "10"}


def norm_tok(w: str) -> str:
    t = re.sub(r"[^0-9a-z]", "", w.lower())
    return NUM_WORDS.get(t, t)


def map_to_script(script: list[str], heard: list[dict], clip_dur: float) -> tuple[list[dict], float]:
    """Give every SCRIPT word a time from whisper's words. Returns (words, match ratio)."""
    if not script:
        return [], 1.0
    if not heard:
        est, dur = estimate_words(" ".join(script))
        k = clip_dur / dur if dur else 1
        return [{"w": w["w"], "start": w["start"] * k, "end": w["end"] * k} for w in est], 0.0
    a = [norm_tok(w) for w in script]
    b = [norm_tok(w["w"]) for w in heard]
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    times: list[tuple[float, float] | None] = [None] * len(script)
    matched = 0
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == "equal":
            for k in range(i2 - i1):
                times[i1 + k] = (heard[j1 + k]["start"], heard[j1 + k]["end"])
                matched += 1
        elif op == "replace" or op == "delete":
            # spread the script run across whisper's replaced span (or leave for interpolation)
            if op == "replace" and j2 > j1:
                s, e = heard[j1]["start"], heard[j2 - 1]["end"]
                weights = [max(1, len(norm_tok(x))) for x in script[i1:i2]]
                tot, t = sum(weights), s
                for k, wt in enumerate(weights):
                    d = (e - s) * wt / tot
                    times[i1 + k] = (t, t + d)
                    t += d
    # interpolate anything still missing between known neighbours
    i = 0
    while i < len(times):
        if times[i] is None:
            j = i
            while j < len(times) and times[j] is None:
                j += 1
            s = times[i - 1][1] if i > 0 else 0.0
            e = times[j][0] if j < len(times) else clip_dur
            n = j - i
            step = max(0.05, (e - s) / n) if e > s else 0.12
            for k in range(n):
                times[i + k] = (s + k * step, s + (k + 1) * step)
            i = j
        else:
            i += 1
    out = []
    last = 0.0
    for w, (s, e) in zip(script, times):
        s = max(s, last)
        e = max(e, s + 0.04)
        out.append({"w": w, "start": round(s, 3), "end": round(e, 3)})
        last = s
    return out, matched / len(script)


# ----------------------------------------------------------------------------- captions
def fmt_ts(t: float) -> str:
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def write_srt(vo: list[dict], path: str, max_chars: int = 42, max_dur: float = 6.0) -> None:
    cues: list[list] = []
    n = 1
    for ln in vo:
        cur: list[dict] = []
        def flush():
            nonlocal n
            if cur:
                text = " ".join(w["w"] for w in cur)
                if len(text) > max_chars:  # wrap to 2 lines at the space nearest the middle
                    mid = len(text) // 2
                    cut = min((i for i, c in enumerate(text) if c == " "), key=lambda i: abs(i - mid), default=None)
                    if cut:
                        text = text[:cut] + "\n" + text[cut + 1:]
                cues.append([cur[0]["start"], cur[-1]["end"] + 0.1, text])
                n += 1
                cur.clear()
        for w in ln["words"]:
            if cur and (len(" ".join(x["w"] for x in cur + [w])) > max_chars * 2 or w["end"] - cur[0]["start"] > max_dur):
                flush()
            cur.append(w)
            if re.search(r"[.!?]$", w["w"]):
                flush()
        flush()
    for i in range(len(cues) - 1):  # a cue never runs into the next one
        cues[i][1] = min(cues[i][1], cues[i + 1][0] - 0.02)
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(f"{i+1}\n{fmt_ts(s)} --> {fmt_ts(e)}\n{t}\n" for i, (s, e, t) in enumerate(cues)))


# ----------------------------------------------------------------------------- main
def check() -> None:
    env = load_env()
    print("ElevenLabs :", "key set (paid; used first by --engine auto)" if env.get("ELEVENLABS_API_KEY") else "no key (fine — free engines below)")
    for name, mod in (("kokoro-onnx", "kokoro_onnx"), ("kokoro (torch)", "kokoro"), ("piper", "piper"), ("faster-whisper", "faster_whisper"), ("soundfile", "soundfile"), ("numpy", "numpy")):
        try:
            __import__(mod)
            print(f"{name:15}: installed")
        except Exception as e:  # noqa: BLE001
            print(f"{name:15}: NOT installed ({type(e).__name__})")
    print("ffmpeg     :", shutil.which("ffmpeg") or "MISSING")
    print("piper voices:", ", ".join(sorted(f[:-5] for f in os.listdir(MODELS) if f.endswith(".onnx") and not f.startswith("kokoro"))) if os.path.isdir(MODELS) else "none downloaded yet")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    src = ap.add_mutually_exclusive_group()
    src.add_argument("--lines", help="vo lines: .json ({vo:[...]}) or .txt/.md (one line per paragraph)")
    src.add_argument("--text", help="a single text (split into sentences)")
    src.add_argument("--check", action="store_true", help="report which engines are installed")
    ap.add_argument("--out", help="output dir (voice.wav, words.json, voice.srt, cache/)")
    ap.add_argument("--engine", default="auto", choices=["auto", "elevenlabs", "kokoro", "piper", "mock"])
    ap.add_argument("--voice", help="piper: en_US-ryan-high | en_GB-alan-medium …; kokoro: am_michael | af_heart | bm_george …; elevenlabs: voice_id")
    ap.add_argument("--el-model", default=DEFAULT_EL_MODEL)
    ap.add_argument("--speed", type=float, default=1.0, help="1.0 = engine default; 1.05 = 5%% faster")
    ap.add_argument("--gap", type=float, default=DEFAULT_GAP, help="default silence between lines (s); a line's pauseBefore overrides")
    ap.add_argument("--lead", type=float, default=0.3, help="silence before the first line (s)")
    ap.add_argument("--tail", type=float, default=0.6, help="silence after the last line (s)")
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--lufs", type=float, default=-16.0)
    ap.add_argument("--tp", type=float, default=-1.5)
    ap.add_argument("--whisper", default="base.en", help="faster-whisper model for local engines")
    ap.add_argument("--force", action="store_true", help="ignore the cache")
    args = ap.parse_args()
    if args.check:
        check()
        return
    if not (args.lines or args.text) or not args.out:
        ap.error("--lines or --text, and --out, are required")
    import numpy as np

    ep_id, fps, lines = load_lines(args)
    env = load_env()
    eng = make_engine(args, env)
    out_dir = os.path.abspath(args.out)
    cache = os.path.join(out_dir, "cache")
    os.makedirs(cache, exist_ok=True)
    log(f"tts: {len(lines)} lines · engine {eng.label()}" + ("" if eng.native_words else f" · aligner faster-whisper:{args.whisper}"))

    clips = []
    synth_s = align_s = audio_s = 0.0
    low_match = []
    for i, ln in enumerate(lines):
        spoken = ln.get("tts") or ln["text"]
        key = hashlib.sha1(json.dumps([eng.label(), args.speed, spoken, args.whisper], ensure_ascii=False).encode()).hexdigest()[:14]
        wav_p, words_p = os.path.join(cache, f"{key}.wav"), os.path.join(cache, f"{key}.words.json")
        if not args.force and os.path.exists(wav_p) and os.path.exists(words_p):
            a, sr = read_wav_mono(wav_p, np)
            with open(words_p, encoding="utf-8") as f:
                cw = json.load(f)
            words, ratio = cw["words"], cw.get("match", 1.0)
            cached = True
        else:
            cached = False
            t0 = time.time()
            a, sr, native = eng.synth(spoken, np)
            a = to_mono_f32(a, np)
            synth_s += time.time() - t0
            off = 0.0
            if eng.name != "mock":
                a, off = trim_silence(np, a, sr)
            dur = len(a) / sr
            audio_s += dur
            script = speech_words(ln["text"])
            if native is not None:
                heard = [{"w": w["w"], "start": w["start"] - off, "end": w["end"] - off} for w in native]
                words, ratio = map_to_script(script, heard, dur)
            else:
                t1 = time.time()
                heard = whisper_words(np, resample(np, a, sr, WHISPER_SR), args.whisper)
                align_s += time.time() - t1
                words, ratio = map_to_script(script, heard, dur)
            write_wav_f32_as_pcm16(wav_p, np, a, sr)
            with open(words_p, "w", encoding="utf-8") as f:
                json.dump({"words": words, "match": ratio, "heard": " ".join(h["w"] for h in heard)}, f, ensure_ascii=False)
        if ratio < 0.8 and eng.name != "mock":
            low_match.append((ln["id"], ratio))
        clips.append((ln, a, sr, words, cached))

    # timeline
    sr = clips[0][2]
    t = args.lead
    vo_out, buf_parts = [], []
    cursor = 0
    lead_samples = int(round(args.lead * sr))
    buf_parts.append(np.zeros(lead_samples, np.float32))
    cursor = lead_samples
    for i, (ln, a, csr, words, _) in enumerate(clips):
        if csr != sr:
            a = resample(np, a, csr, sr)
        if i > 0:
            gap = float(ln.get("pauseBefore", args.gap))
            g = int(round(gap * sr))
            buf_parts.append(np.zeros(g, np.float32))
            cursor += g
        start = cursor / sr
        buf_parts.append(a)
        cursor += len(a)
        end = cursor / sr
        n = len(words)
        vo_out.append({"id": ln["id"], "text": ln["text"], **({"tts": ln["tts"]} if ln.get("tts") else {}),
                       **({k: ln[k] for k in ("chapter", "scene") if k in ln}),
                       "start": round(start, 3), "end": round(end, 3),
                       "wps": round(n / max(0.01, end - start), 2),
                       "words": [{"w": w["w"], "start": round(start + w["start"], 3), "end": round(start + w["end"], 3)} for w in words]})
    tail = int(round(args.tail * sr))
    buf_parts.append(np.zeros(tail, np.float32))
    full = np.concatenate(buf_parts)
    total = round(len(full) / sr, 3)

    raw = os.path.join(out_dir, "voice.raw.wav")
    write_wav_f32_as_pcm16(raw, np, full, sr)
    voice = os.path.join(out_dir, "voice.wav")
    if eng.name == "mock":
        run(["ffmpeg", "-y", "-v", "error", "-i", raw, "-ar", str(SR_OUT), "-ac", "2", voice])
    else:
        loudnorm_two_pass(raw, voice, args.lufs, args.tp)
    os.remove(raw)

    n_words = sum(len(v["words"]) for v in vo_out)
    speech = sum(v["end"] - v["start"] for v in vo_out)
    doc = {"id": ep_id, "fps": fps, "source": eng.label(), "aligner": None if eng.native_words else f"faster-whisper:{args.whisper}",
           "mock": eng.name == "mock", "totalSec": total, "durationSec": total,
           "pace": {"words": n_words, "speechSec": round(speech, 2), "wps": round(n_words / max(0.01, speech), 2)},
           "vo": vo_out}
    with open(os.path.join(out_dir, "words.json"), "w", encoding="utf-8") as f:
        json.dump(doc, f, indent=1, ensure_ascii=False)
        f.write("\n")
    write_srt(vo_out, os.path.join(out_dir, "voice.srt"))

    log(f"  {'id':14} {'start':>7} {'end':>7} {'w/s':>5}  text")
    for v in vo_out:
        flag = "  FAST" if v["wps"] > 3.0 else ""
        log(f"  {v['id']:14} {v['start']:7.2f} {v['end']:7.2f} {v['wps']:5.2f}  {v['text'][:60]}{flag}")
    log(f"  total {total:.2f}s · {n_words} words · {doc['pace']['wps']} w/s over speech")
    if audio_s > 0:
        log(f"  synth {synth_s:.1f}s for {audio_s:.1f}s of new audio → RTF {synth_s / audio_s:.3f}"
            + (f" · align {align_s:.1f}s (RTF {align_s / audio_s:.3f})" if align_s else ""))
    else:
        log("  all lines from cache")
    for lid, r in low_match:
        log(f"  WARN {lid}: only {r:.0%} of script words matched what whisper heard — listen to this line (mispronounced number/name?)")
    if eng.name == "mock":
        log("  MOCK voice: silent wav + estimated timings — never ship this; install piper-tts or kokoro")
    log(f"-> {voice}\n-> {os.path.join(out_dir, 'words.json')}\n-> {os.path.join(out_dir, 'voice.srt')}")


if __name__ == "__main__":
    main()
