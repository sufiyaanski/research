#!/usr/bin/env python3
"""
gen_sfx.py — grow the shared SFX library from media/library/sfx/palette.json.

For every palette sound that is NOT already on disk, generates the clip with the ElevenLabs
sound-generation API, loudness-normalizes it (target LUFS with a peak ceiling) and (re)writes
media/library/sfx/catalog.json with source + license. Library-first: existing clips are never
re-billed unless --force.

Also imports clips you already own (royalty-free packs, your own recordings) into the same
catalog so mix_sfx.py can use them:
  python3 -I tools/gen_sfx.py --import path/to/clip.wav --id paper-rustle --category foley \\
      --source "file:freesound.org/s/12345" --license "CC0" [--peak-s 0.03] [--tags a,b]

Usage:
  python3 -I tools/gen_sfx.py --dry-run            # what WOULD be generated (no key needed)
  python3 -I tools/gen_sfx.py                      # generate all missing palette sounds
  python3 -I tools/gen_sfx.py --only pop-reveal,tick --force
  python3 -I tools/gen_sfx.py --renorm             # re-measure/normalize existing clips, no API

API (verified 2026-11 against elevenlabs.io/docs/api-reference/text-to-sound-effects/convert):
  POST https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128
  headers: xi-api-key, Content-Type: application/json
  body: { text (required), duration_seconds (0.5..30, null = inferred), prompt_influence (0..1, default 0.3),
          loop (bool, default false), model_id: eleven_text_to_sound_v2 (default) | eleven_text_to_sound_v3 }
  200: binary audio in the requested output_format.
Env: ELEVENLABS_API_KEY (or .env at repo root). ffmpeg/ffprobe on PATH.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SFX_DIR = os.path.join(ROOT, "media", "library", "sfx")
PALETTE = os.path.join(SFX_DIR, "palette.json")
CATALOG = os.path.join(SFX_DIR, "catalog.json")
API_URL = "https://api.elevenlabs.io/v1/sound-generation"
LICENSE_EL = ("ElevenLabs generated (text-to-sfx); owner: the generating account; commercial use per that "
              "account's ElevenLabs plan")


def log(msg: str) -> None:
    print(msg, file=sys.stderr)


def load_env() -> dict:
    env = {}
    p = os.path.join(ROOT, ".env")
    if os.path.exists(p):
        with open(p, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    env[k.strip()] = v.strip().strip('"').strip("'")
    return {**env, **os.environ}


def capture(cmd: list[str]) -> str:
    return subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True).stdout


def probe_duration(path: str) -> float | None:
    out = capture(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", path]).strip()
    try:
        return round(float(out), 3)
    except ValueError:
        return None


def measure(path: str) -> tuple[float | None, float | None, float | None]:
    """(integrated LUFS or None if gated, sample peak dBFS, seconds to the loudest 10 ms frame)."""
    out = capture(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "ebur128=peak=sample", "-f", "null", os.devnull])
    lufs = None
    m = re.findall(r"I:\s*(-?[\d.]+|-inf)\s*LUFS", out)
    if m and m[-1] != "-inf":
        lufs = float(m[-1])
        if lufs < -50:
            lufs = None
    peak = None
    pm = re.findall(r"Peak:\s*(-?[\d.]+|-inf)\s*dBFS", out)
    if pm and pm[-1] != "-inf":
        peak = float(pm[-1])
    # perceptual hit: time of the max absolute sample via astats per 10 ms frame
    st = capture(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af",
                  "asetnsamples=480,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.Peak_level",
                  "-f", "null", os.devnull])
    best_t, best_v = 0.0, -999.0
    cur_t = 0.0
    for line in st.splitlines():
        mt = re.search(r"pts_time:([\d.]+)", line)
        if mt:
            cur_t = float(mt.group(1))
        mv = re.search(r"Peak_level=(-?[\d.]+|-inf)", line)
        if mv and mv.group(1) != "-inf" and float(mv.group(1)) > best_v:
            best_v, best_t = float(mv.group(1)), cur_t
    return lufs, peak, round(best_t, 3)


def normalize(path: str, target_lufs: float, ceiling: float) -> None:
    """Gain the clip to target_lufs, clamped so the peak never exceeds ceiling (transients hit the
    ceiling first and stay quieter than the target — mix_sfx.py compensates from the catalog)."""
    lufs, peak, _ = measure(path)
    if peak is None:
        return
    gain = (ceiling - peak) if lufs is None else min(target_lufs - lufs, ceiling - peak)
    if abs(gain) < 0.1:
        return
    tmp = path + ".tmp" + os.path.splitext(path)[1]
    codec = ["-c:a", "libmp3lame", "-q:a", "2"] if path.endswith(".mp3") else ["-c:a", "pcm_s16le"]
    capture(["ffmpeg", "-y", "-hide_banner", "-v", "error", "-i", path, "-af", f"volume={gain:.2f}dB", *codec, tmp])
    if os.path.exists(tmp) and os.path.getsize(tmp) > 0:
        os.replace(tmp, path)
    elif os.path.exists(tmp):
        os.remove(tmp)


def generate(key: str, prompt: str, duration_s: float | None, prompt_influence: float, model: str, fmt: str) -> bytes:
    body = {"text": prompt, "prompt_influence": float(prompt_influence), "model_id": model, "loop": False}
    if duration_s:
        body["duration_seconds"] = float(duration_s)
    req = urllib.request.Request(f"{API_URL}?output_format={fmt}", data=json.dumps(body).encode("utf-8"),
                                 headers={"xi-api-key": key, "Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


def load_catalog() -> dict:
    if os.path.exists(CATALOG):
        with open(CATALOG, encoding="utf-8") as f:
            return json.load(f)
    return {"_schema": {"ref_lufs": -20.0, "ceiling_dbfs": -1.5}, "clips": []}


def save_catalog(cat: dict, order: list[str]) -> None:
    by_id = {c["id"]: c for c in cat["clips"]}
    cat["clips"] = [by_id[i] for i in order if i in by_id] + [c for i, c in by_id.items() if i not in order]
    with open(CATALOG, "w", encoding="utf-8") as f:
        json.dump(cat, f, indent=2, ensure_ascii=False)
        f.write("\n")
    log(f"catalog -> {os.path.relpath(CATALOG, ROOT)}  ({len(cat['clips'])} clips)")


def entry_for(path: str, rel: str, meta: dict, old: dict | None, source: str, license_: str, model: str | None) -> dict:
    lufs, peak, hit = measure(path)
    e = {
        "id": meta["id"], "file": rel, "category": meta.get("category", ""), "function": meta.get("function", ""),
        "tags": meta.get("tags", []), "duration_s": probe_duration(path),
        "peak_s": meta.get("peak_s") if meta.get("peak_s") is not None else hit,
        "peak_dbfs": peak, "loudness_lufs": lufs, "source": source,
    }
    if model:
        e["model"] = model
    e["license"] = license_
    if meta.get("prompt"):
        e["prompt"] = meta["prompt"]
    e["used_in"] = (old or {}).get("used_in", [])
    log(f"   {e['id']}: dur={e['duration_s']}s  peak={peak} dBFS  lufs={lufs}  hit@{e['peak_s']}s")
    return e


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--force", action="store_true", help="regenerate even if the clip exists (re-bills)")
    ap.add_argument("--only", help="comma-separated ids")
    ap.add_argument("--renorm", action="store_true", help="re-measure + normalize existing clips, no API")
    ap.add_argument("--import", dest="import_path", help="import an existing audio file into the library")
    ap.add_argument("--id"), ap.add_argument("--category", default="foley"), ap.add_argument("--function", default="emphasis")
    ap.add_argument("--tags", default=""), ap.add_argument("--source", default=None), ap.add_argument("--license", default=None)
    ap.add_argument("--peak-s", type=float, default=None, help="seconds to the hit (default: measured loudest frame)")
    ap.add_argument("--no-normalize", action="store_true", help="--import: keep the file's level")
    args = ap.parse_args()

    with open(PALETTE, encoding="utf-8") as f:
        palette = json.load(f)
    d = palette.get("defaults", {})
    model = d.get("model", "eleven_text_to_sound_v2")
    pinf = float(d.get("prompt_influence", 0.3))
    fmt = d.get("output_format", "mp3_44100_128")
    target = float(d.get("target_lufs", -20.0))
    ceiling = float(d.get("ceiling_dbfs", -1.5))
    order = [s["id"] for s in palette["sounds"]]
    cat = load_catalog()
    cat.setdefault("_schema", {})["ref_lufs"] = target
    cat["_schema"]["ceiling_dbfs"] = ceiling
    by_id = {c["id"]: c for c in cat["clips"]}
    clips_dir = os.path.join(SFX_DIR, "clips")
    os.makedirs(clips_dir, exist_ok=True)

    # ---- import an owned clip
    if args.import_path:
        if not args.id or not args.source or not args.license:
            sys.exit("--import needs --id, --source and --license (record provenance or do not ship it)")
        ext = os.path.splitext(args.import_path)[1].lower() or ".wav"
        rel = f"clips/{args.id}{ext}"
        dst = os.path.join(SFX_DIR, rel)
        shutil.copyfile(args.import_path, dst)
        if not args.no_normalize:
            normalize(dst, target, ceiling)
        meta = {"id": args.id, "category": args.category, "function": args.function,
                "tags": [t for t in args.tags.split(",") if t], "peak_s": args.peak_s}
        by_id[args.id] = entry_for(dst, rel, meta, by_id.get(args.id), args.source, args.license, None)
        cat["clips"] = list(by_id.values())
        save_catalog(cat, order)
        return

    only = set(args.only.split(",")) if args.only else None
    sounds = [s for s in palette["sounds"] if not only or s["id"] in only]

    if args.renorm:
        n = 0
        for s in sounds:
            rel = f"clips/{s['id']}.mp3"
            path = os.path.join(SFX_DIR, rel)
            if os.path.exists(path):
                normalize(path, target, ceiling)
                by_id[s["id"]] = entry_for(path, rel, s, by_id.get(s["id"]), "elevenlabs:sound-generation", LICENSE_EL, model)
                n += 1
        cat["clips"] = list(by_id.values())
        save_catalog(cat, order)
        log(f"re-normalized {n} clips")
        return

    todo, have = [], []
    for s in sounds:
        rel = f"clips/{s['id']}.mp3"
        path = os.path.join(SFX_DIR, rel)
        (have if os.path.exists(path) and not args.force else todo).append((s, rel, path))
    print(f"palette: {len(palette['sounds'])} sounds | to generate: {len(todo)} | exist: {len(have)}")
    for s, rel, _ in todo:
        print(f"  {'WOULD generate' if args.dry_run else 'generate'} {s['id']:<20} {s.get('duration_s') or 'auto':>5}s  "
              f"[{s.get('function', '')}]  \"{s['prompt'][:70]}…\"")
    if args.dry_run or not todo:
        if not todo:
            print("nothing to do")
        return

    key = load_env().get("ELEVENLABS_API_KEY", "").strip()
    if not key:
        sys.exit("ELEVENLABS_API_KEY not set (env or .env). Use --dry-run, or --import your own clips.")

    for s, rel, path in todo:
        log(f"-> {s['id']}")
        try:
            audio = generate(key, s["prompt"], s.get("duration_s"), s.get("prompt_influence", pinf), model, fmt)
        except urllib.error.HTTPError as e:
            sys.exit(f"ElevenLabs HTTP {e.code}: {e.read().decode('utf-8', 'ignore')[:500]}")
        with open(path, "wb") as f:
            f.write(audio)
        normalize(path, target, ceiling)
        by_id[s["id"]] = entry_for(path, rel, s, by_id.get(s["id"]), "elevenlabs:sound-generation", LICENSE_EL, model)
        cat["clips"] = list(by_id.values())
        save_catalog(cat, order)  # save after each clip so a crash never loses paid generations


if __name__ == "__main__":
    main()
