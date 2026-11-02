#!/usr/bin/env python3
"""
check_audio.py — audio QA gate for a rendered reel. Writes qa/audio-report.json, exits 1 on FAIL.

Checks (ffprobe + ffmpeg ebur128/silencedetect, nothing else):
  duration   video stream vs audio stream length            FAIL if |diff| > 50 ms
  loudness   integrated LUFS vs target (default -14)        FAIL if off by > 1.0 LU (WARN > 0.5)
  true peak  dBTP (ebur128 peak=true)                       FAIL if > ceiling (default -1.0)
  lra        loudness range                                 WARN if > 15 LU (dialogue-led reel should be tight)
  head       leading silence                                WARN if > 0.3 s (hook starts late)
  tail       trailing silence                               WARN if > 1.0 s (dead air)
  stream     sample rate / channels / codec                 WARN if not 48 kHz stereo
  vo (opt)   --beats: last word must end before the video ends; first word >= 0.1 s in
  mock (opt) --beats: FAIL if voiceStatus is "mock" and --allow-mock is not given (never ship silence)

Usage:
  python3 -I tools/check_audio.py renders/<ep>-final.mp4 [--beats episodes/<ep>/beats.json] [--report qa/audio-report.json]
  python3 -I tools/check_audio.py x.mp4 --lufs -14 --tp -1 --allow-mock
"""
from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def capture(cmd: list[str]) -> str:
    return subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True).stdout


def probe(path: str) -> dict:
    out = capture(["ffprobe", "-v", "error", "-show_entries",
                   "stream=index,codec_type,codec_name,sample_rate,channels,duration,r_frame_rate,nb_frames:format=duration",
                   "-of", "json", path])
    try:
        return json.loads(out)
    except json.JSONDecodeError:
        sys.exit(f"ffprobe failed on {path}:\n{out[-1500:]}")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video")
    ap.add_argument("--beats", help="beats.json to cross-check VO timing / mock status")
    ap.add_argument("--report", help="default: <video dir>/qa/audio-report.json")
    ap.add_argument("--lufs", type=float, default=-14.0)
    ap.add_argument("--lufs-tol", type=float, default=1.0)
    ap.add_argument("--tp", type=float, default=-1.0)
    ap.add_argument("--max-drift-ms", type=float, default=50.0)
    ap.add_argument("--head-silence", type=float, default=0.3)
    ap.add_argument("--allow-mock", action="store_true")
    args = ap.parse_args()

    video = os.path.abspath(args.video)
    if not os.path.exists(video):
        sys.exit(f"not found: {video}")
    report_path = os.path.abspath(args.report) if args.report else os.path.join(os.path.dirname(video), "qa", "audio-report.json")

    checks: list[dict] = []

    def add(name: str, status: str, value, detail: str) -> None:
        checks.append({"check": name, "status": status, "value": value, "detail": detail})

    info = probe(video)
    streams = info.get("streams", [])
    v = next((s for s in streams if s["codec_type"] == "video"), None)
    a = next((s for s in streams if s["codec_type"] == "audio"), None)
    fmt_dur = float(info["format"]["duration"])
    if not a:
        add("audio_stream", "FAIL", None, "no audio stream in the file")
        result = {"video": video, "checked_at": time.strftime("%Y-%m-%dT%H:%M:%S"), "status": "FAIL", "checks": checks}
        os.makedirs(os.path.dirname(report_path), exist_ok=True)
        json.dump(result, open(report_path, "w", encoding="utf-8"), indent=2)
        print(json.dumps(result, indent=2))
        sys.exit(1)

    # ---- durations (decode the audio to get its real length; container tags can lie)
    a_dec = capture(["ffmpeg", "-hide_banner", "-nostats", "-i", video, "-map", "0:a:0", "-f", "null", os.devnull])
    m = re.findall(r"time=(\d+):(\d+):([\d.]+)", a_dec)
    a_dur = float(a.get("duration") or 0) or fmt_dur
    if m:
        h, mi, s = m[-1]
        a_dur = int(h) * 3600 + int(mi) * 60 + float(s)
    v_dur = float(v.get("duration") or fmt_dur) if v else fmt_dur
    diff_ms = (a_dur - v_dur) * 1000
    if v:
        add("duration_match", "FAIL" if abs(diff_ms) > args.max_drift_ms else "PASS", round(diff_ms, 1),
            f"audio {a_dur:.3f}s vs video {v_dur:.3f}s (limit ±{args.max_drift_ms:.0f} ms)")
    else:
        add("duration_match", "WARN", None, "no video stream (audio-only file)")

    # ---- loudness / true peak / LRA
    eb = capture(["ffmpeg", "-hide_banner", "-nostats", "-i", video, "-map", "0:a:0", "-af", "ebur128=peak=true", "-f", "null", os.devnull])
    summary = eb[eb.rfind("Summary:"):] if "Summary:" in eb else eb
    def grab(label: str) -> float | None:
        mm = re.search(label + r":\s*(-?[\d.]+|-inf)", summary)
        if not mm or mm.group(1) == "-inf":
            return None
        return float(mm.group(1))
    lufs, lra, tp = grab(r"I"), grab(r"LRA"), grab(r"Peak")
    if lufs is None:
        add("integrated_lufs", "FAIL", None, "audio is silent (mock voice or empty mix?)")
    else:
        off = lufs - args.lufs
        st = "PASS" if abs(off) <= 0.5 else ("WARN" if abs(off) <= args.lufs_tol else "FAIL")
        add("integrated_lufs", st, round(lufs, 1), f"target {args.lufs} LUFS, off by {off:+.1f} LU")
    if tp is not None:
        add("true_peak_dbtp", "FAIL" if tp > args.tp + 0.05 else "PASS", round(tp, 1), f"ceiling {args.tp} dBTP")
    if lra is not None:
        add("loudness_range", "WARN" if lra > 15 else "PASS", round(lra, 1), "LU; >15 means the mix is uneven (music too dynamic or VO levels jump)")

    # ---- head / tail silence
    sd = capture(["ffmpeg", "-hide_banner", "-nostats", "-i", video, "-map", "0:a:0", "-af", "silencedetect=n=-45dB:d=0.1", "-f", "null", os.devnull])
    starts = [float(x) for x in re.findall(r"silence_start:\s*(-?[\d.]+)", sd)]
    ends = [float(x) for x in re.findall(r"silence_end:\s*(-?[\d.]+)", sd)]
    head = 0.0
    if starts and starts[0] <= 0.05:
        head = ends[0] if ends else a_dur
    add("head_silence_s", "WARN" if head > args.head_silence else "PASS", round(head, 2),
        f"silence before first sound (hook should start within {args.head_silence}s)")
    tail = 0.0
    if starts and (len(ends) < len(starts) or starts[-1] > (ends[-1] if ends else 0)):
        tail = a_dur - starts[-1]
    add("tail_silence_s", "WARN" if tail > 1.0 else "PASS", round(tail, 2), "dead air after the last sound (loop should land, not trail)")

    # ---- stream format
    sr, ch = int(a.get("sample_rate", 0)), int(a.get("channels", 0))
    add("stream_format", "PASS" if (sr == 48000 and ch == 2) else "WARN", f"{a.get('codec_name')} {sr}Hz {ch}ch",
        "expected aac 48000Hz 2ch")

    # ---- beats cross-check
    if args.beats:
        with open(os.path.abspath(args.beats), encoding="utf-8") as f:
            beats = json.load(f)
        if str(beats.get("voiceStatus", "")).startswith("mock"):
            add("voice_is_mock", "WARN" if args.allow_mock else "FAIL", beats.get("voiceStatus"),
                "beats.json says the voice is a mock (silent) track — generate the real VO before shipping")
        words = [w for ln in beats.get("vo", []) for w in (ln.get("words") or [])]
        if words:
            first = float(words[0].get("start", words[0].get("s")))
            last = float(words[-1].get("end", words[-1].get("e")))
            add("vo_first_word_s", "WARN" if first < 0.1 else "PASS", first, "first word should start >= 0.1 s (no clipped hook)")
            add("vo_last_word_vs_video", "FAIL" if last > v_dur else "PASS", round(v_dur - last, 2),
                f"seconds between last word ({last}s) and video end ({v_dur:.2f}s)")
            bfps = beats.get("fps") or beats.get("format", {}).get("fps")
            if v and bfps and v.get("r_frame_rate"):
                num, den = v["r_frame_rate"].split("/")
                vfps = float(num) / float(den)
                add("fps_match", "PASS" if abs(vfps - float(bfps)) < 0.01 else "FAIL", vfps, f"beats.json fps={bfps}")

    worst = "PASS"
    for c in checks:
        if c["status"] == "FAIL":
            worst = "FAIL"
        elif c["status"] == "WARN" and worst == "PASS":
            worst = "WARN"
    result = {"video": video, "checked_at": time.strftime("%Y-%m-%dT%H:%M:%S"), "status": worst,
              "targets": {"lufs": args.lufs, "tp": args.tp, "max_drift_ms": args.max_drift_ms},
              "measured": {"integrated_lufs": lufs, "true_peak_dbtp": tp, "lra": lra, "audio_s": round(a_dur, 3),
                           "video_s": round(v_dur, 3), "head_silence_s": round(head, 2), "tail_silence_s": round(tail, 2)},
              "checks": checks}
    os.makedirs(os.path.dirname(report_path), exist_ok=True)
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)
        f.write("\n")
    for c in checks:
        print(f"  {c['status']:4} {c['check']:<24} {str(c['value']):>14}  {c['detail']}")
    print(f"{worst}: report -> {report_path}")
    sys.exit(1 if worst == "FAIL" else 0)


if __name__ == "__main__":
    main()
