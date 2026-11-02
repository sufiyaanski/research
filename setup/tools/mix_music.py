#!/usr/bin/env python3
"""
mix_music.py — duck a music bed under the voice, mix, and loudness-normalize the final.

Takes the voiced (and usually SFX'd) video, lays a music bed under it, ducks the bed under
speech, fades it in/out, sums everything, then runs TWO-PASS loudnorm to the delivery target
(-14 LUFS integrated, -1 dBTP, LRA 11 by default) and muxes the result back onto the video.

Two ducking engines:

  --duck envelope  (default when --beats has word times)  DETERMINISTIC
      Builds speech regions from the VO word times in beats.json (gaps < --merge-gap s are
      bridged), then drives ffmpeg's `volume` filter with a per-frame expression:
        bed gain = under_db while speaking, lifted by --gap-lift dB in the gaps,
        ramping down over --attack s BEFORE a region starts (the music is already out of the
        way when the first consonant lands) and recovering over --release s after it ends.
      Exact numbers, no pumping, same result every render.

  --duck sidechain  (fallback when there are no word times)  ADAPTIVE
      ffmpeg sidechaincompress keyed by the video's own audio:
        threshold 0.02 (~ -34 dBFS), ratio 8, attack 20 ms, release 400 ms, makeup 1, rms detection.
      With VO at ~-16 LUFS this pulls the bed roughly 10-15 dB during speech; the bed base
      level is pre-set 8 dB higher than under_db so speech-time level lands near under_db.
      Approximate by nature — use envelope mode for the final.

Levels: "-20 dB under VO" means the bed's integrated loudness during speech sits 20 LU below
the VO's integrated loudness (both measured with ebur128), which is the common felt-not-heard
zone for narration-led shorts. --under-db changes it. Fades: 1.5 s in, out over the last 2 s.

Usage:
  python3 -I tools/mix_music.py --video renders/<ep>-sfx.mp4 --bed signal-focus-pad \\
      --beats episodes/<ep>/beats.json --out renders/<ep>-final.mp4
  python3 -I tools/mix_music.py --video v.mp4 --music path/to/bed.mp3 --duck sidechain --out final.mp4
  python3 -I tools/mix_music.py --video v.mp4 --vo episodes/<ep>/voice/voice.wav --bed x ...   # video has no audio yet
  --print  shows the resolved levels/regions and the filter graph, no render.

Loudness: the final mix is normalized with ffmpeg loudnorm in two passes (measure with
print_format=json, then apply with measured_I/LRA/TP/thresh + offset and linear=true), per
ffmpeg-filters.html#loudnorm. -14 LUFS / -1 dBTP is a widely used streaming/social delivery
practice; platforms re-normalize on ingest, so the point is CONSISTENCY across episodes and
headroom for AAC, not hitting a published platform spec (none of the short-form platforms
publish a hard LUFS requirement at the time of writing).
"""
from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MUSIC_CATALOG = os.path.join(ROOT, "media", "library", "music", "catalog.json")
SR = 48000


def log(msg: str) -> None:
    print(msg, file=sys.stderr)


def run(cmd: list[str]) -> str:
    r = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    if r.returncode != 0:
        sys.exit(f"ffmpeg failed ({r.returncode}):\n  {' '.join(cmd)}\n{r.stdout[-3000:]}")
    return r.stdout


def capture(cmd: list[str]) -> str:
    return subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True).stdout


def probe(path: str) -> dict:
    j = json.loads(run(["ffprobe", "-v", "error", "-show_entries", "stream=codec_type:format=duration", "-of", "json", path]))
    return {"duration": float(j["format"]["duration"]),
            "has_audio": any(s.get("codec_type") == "audio" for s in j.get("streams", [])),
            "has_video": any(s.get("codec_type") == "video" for s in j.get("streams", []))}


def measure_lufs(path: str, extra_af: str = "") -> float | None:
    af = (extra_af + "," if extra_af else "") + "ebur128=peak=true"
    out = capture(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", af, "-f", "null", os.devnull])
    m = re.findall(r"I:\s*(-?[\d.]+|-inf)\s*LUFS", out)
    if not m or m[-1] == "-inf":
        return None
    return float(m[-1])


def loudnorm_two_pass(src_cmd_inputs: list[str], src_filter: str, dst: str, I: float, TP: float, LRA: float) -> dict:
    """Pass 1 measures the mixed signal; pass 2 re-renders with measured_* + linear=true."""
    first = capture(["ffmpeg", "-hide_banner", "-nostats", *src_cmd_inputs, "-filter_complex",
                     src_filter + f";[mix]loudnorm=I={I}:TP={TP}:LRA={LRA}:print_format=json[ln]",
                     "-map", "[ln]", "-f", "null", os.devnull])
    m = re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", first, re.S)
    if not m:
        sys.exit("loudnorm pass 1 produced no stats:\n" + first[-2500:])
    st = json.loads(m.group(0))
    af = (f"[mix]loudnorm=I={I}:TP={TP}:LRA={LRA}:measured_I={st['input_i']}:measured_LRA={st['input_lra']}:"
          f"measured_TP={st['input_tp']}:measured_thresh={st['input_thresh']}:offset={st['target_offset']}:"
          f"linear=true:print_format=summary,aresample={SR}[final]")
    run(["ffmpeg", "-y", "-hide_banner", "-v", "error", *src_cmd_inputs, "-filter_complex", src_filter + ";" + af,
         "-map", "[final]", "-ar", str(SR), "-ac", "2", "-c:a", "pcm_s16le", dst])
    return st


def speech_regions(beats: dict, merge_gap: float) -> list[tuple[float, float]]:
    pts = []
    for ln in beats.get("vo", []):
        ws = ln.get("words") or []
        if ws:  # kit shape {w,start,end}; compact shape {w,s,e}
            pts.append((float(ws[0].get("start", ws[0].get("s"))), float(ws[-1].get("end", ws[-1].get("e")))))
        elif "start" in ln and "end" in ln:
            pts.append((float(ln["start"]), float(ln["end"])))
    pts.sort()
    regions: list[list[float]] = []
    for s, e in pts:
        if regions and s - regions[-1][1] <= merge_gap:
            regions[-1][1] = max(regions[-1][1], e)
        else:
            regions.append([s, e])
    return [(round(s, 3), round(e, 3)) for s, e in regions]


def envelope_expr(regions: list[tuple[float, float]], under_db: float, lift_db: float, attack: float, release: float) -> str:
    """ffmpeg `volume` expression (eval=frame): gain in dB = under_db + lift_db * (1 - duck(t)),
    duck(t) in 0..1 = max over regions of ramp-in before start x ramp-out after end."""
    terms = []
    for s, e in regions:
        ramp_in = f"clip((t-({s - attack:.3f}))/{attack:.3f},0,1)"
        ramp_out = f"clip((({e + release:.3f})-t)/{release:.3f},0,1)"
        terms.append(f"({ramp_in}*{ramp_out})")
    if not terms:
        duck = "0"
    else:
        duck = terms[0]
        for t in terms[1:]:
            duck = f"max({duck},{t})"
    gain_db = f"({under_db:.2f}+{lift_db:.2f}*(1-{duck}))"
    return f"volume=volume='pow(10,{gain_db}/20)':eval=frame"


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--video", required=True, help="the render (with VO+SFX audio, or silent + --vo)")
    ap.add_argument("--vo", help="voice.wav to use as the dialogue track when the video has no audio")
    ap.add_argument("--sfx", help="optional SFX bus wav to add (if not already in the video)")
    ap.add_argument("--bed", help="music bed id from media/library/music/catalog.json")
    ap.add_argument("--music", help="music file path (instead of --bed)")
    ap.add_argument("--beats", help="beats.json with word times (enables envelope ducking)")
    ap.add_argument("--plan", help="sfx-plan.json whose music.bed names the bed (used when --bed/--music absent)")
    ap.add_argument("--out", help="output mp4 (default <video>-final.mp4)")
    ap.add_argument("--out-wav", help="also write the final mixed audio as wav")
    ap.add_argument("--duck", choices=["auto", "envelope", "sidechain", "none"], default="auto")
    ap.add_argument("--under-db", type=float, default=-20.0, help="bed loudness relative to VO during speech (LU)")
    ap.add_argument("--gap-lift", type=float, default=8.0, help="dB the bed comes up in speech gaps / intro / outro")
    ap.add_argument("--attack", type=float, default=0.25, help="s to duck BEFORE speech starts (envelope)")
    ap.add_argument("--release", type=float, default=0.8, help="s to recover after speech ends (envelope)")
    ap.add_argument("--merge-gap", type=float, default=0.6, help="gaps shorter than this stay ducked (envelope)")
    ap.add_argument("--fade-in", type=float, default=1.5)
    ap.add_argument("--fade-out", type=float, default=2.0)
    ap.add_argument("--music-offset", type=float, default=0.0, help="start the bed this many s into the file")
    ap.add_argument("--highpass", type=float, default=90.0, help="Hz high-pass on the bed so it never muddies speech (0 = off)")
    ap.add_argument("--lufs", type=float, default=-14.0)
    ap.add_argument("--tp", type=float, default=-1.0, help="delivery true-peak ceiling AFTER AAC encoding")
    ap.add_argument("--codec-headroom", type=float, default=0.5,
                    help="dB below --tp to normalize the PCM mix, so AAC overshoot (measured ~0.1-0.3 dB) still lands under --tp")
    ap.add_argument("--lra", type=float, default=11.0)
    ap.add_argument("--no-loudnorm", action="store_true")
    ap.add_argument("--print", dest="print_only", action="store_true")
    args = ap.parse_args()

    video = os.path.abspath(args.video)
    if not os.path.exists(video):
        sys.exit(f"video not found: {video}")
    vinfo = probe(video)
    total = vinfo["duration"]
    out = os.path.abspath(args.out) if args.out else os.path.splitext(video)[0] + "-final.mp4"

    # ---- dialogue source
    if vinfo["has_audio"]:
        dlg_inputs, dlg_sel = [], "0:a"
    elif args.vo:
        dlg_inputs, dlg_sel = ["-i", os.path.abspath(args.vo)], None  # resolved after we know the index
    else:
        sys.exit("video has no audio stream — pass --vo voice.wav")

    # ---- music source
    if args.plan and not (args.music or args.bed):
        with open(os.path.abspath(args.plan), encoding="utf-8") as f:
            mblock = json.load(f).get("music") or {}
        if mblock.get("bed"):
            args.bed = mblock["bed"]
            log(f"  bed from plan: {args.bed}")
        else:
            sys.exit(f"{args.plan} has no music.bed — pass --bed <id> or --music <file>")
    if args.music:
        music = os.path.abspath(args.music)
        bed_meta = {}
    elif args.bed:
        with open(MUSIC_CATALOG, encoding="utf-8") as f:
            cat = json.load(f)
        bed_meta = next((c for c in cat.get("clips", []) if c["id"] == args.bed), None)
        if not bed_meta:
            sys.exit(f"bed '{args.bed}' not in {MUSIC_CATALOG}: " + ", ".join(c["id"] for c in cat.get("clips", [])))
        music = os.path.join(os.path.dirname(MUSIC_CATALOG), bed_meta["file"])
    else:
        sys.exit("pass --bed <id> or --music <file>")
    if not os.path.exists(music):
        sys.exit(f"music file missing: {music} (drop the file in media/library/music/clips/ or pass --music)")

    # ---- decide ducking engine
    beats = None
    regions: list[tuple[float, float]] = []
    if args.beats:
        with open(os.path.abspath(args.beats), encoding="utf-8") as f:
            beats = json.load(f)
        regions = speech_regions(beats, args.merge_gap)
    duck = args.duck
    if duck == "auto":
        duck = "envelope" if regions else "sidechain"
    if duck == "envelope" and not regions:
        sys.exit("envelope ducking needs --beats with vo[].words (run gen_voice.py first)")

    # ---- levels: measure VO and bed loudness so --under-db is a real LU relationship
    dlg_path = video if vinfo["has_audio"] else os.path.abspath(args.vo)
    vo_lufs = measure_lufs(dlg_path)
    bed_lufs = measure_lufs(music, f"highpass=f={args.highpass}" if args.highpass > 0 else "")
    if vo_lufs is None:
        log("  WARN dialogue measures silent (mock voice?) — assuming -16 LUFS for level math")
        vo_lufs = -16.0
    if bed_lufs is None:
        sys.exit("music bed measures silent")
    speech_target = vo_lufs + args.under_db                 # bed level during speech
    if duck == "envelope":
        base_gain = speech_target - bed_lufs                # expression adds +lift in the gaps
    elif duck == "sidechain":
        base_gain = speech_target - bed_lufs + args.gap_lift  # compressor pulls it back down during speech
    else:
        base_gain = speech_target - bed_lufs

    # ---- build graph
    inputs = ["-i", video, "-stream_loop", "-1", "-ss", f"{args.music_offset:.3f}", "-i", music]
    music_idx = 1
    next_idx = 2
    if not vinfo["has_audio"]:
        inputs += dlg_inputs
        dlg_sel = f"{next_idx}:a"
        next_idx += 1
    sfx_sel = None
    if args.sfx:
        inputs += ["-i", os.path.abspath(args.sfx)]
        sfx_sel = f"{next_idx}:a"
        next_idx += 1

    parts = []
    bed_chain = [f"aformat=sample_rates={SR}:channel_layouts=stereo"]
    if args.highpass > 0:
        bed_chain.append(f"highpass=f={args.highpass:.0f}")
    bed_chain += [f"atrim=0:{total:.3f}", "asetpts=N/SR/TB", f"volume={base_gain:.2f}dB"]
    if duck == "envelope":
        bed_chain.append(envelope_expr(regions, 0.0, args.gap_lift, args.attack, args.release))
    bed_chain += [f"afade=t=in:st=0:d={args.fade_in:.2f}",
                  f"afade=t=out:st={max(0.0, total - args.fade_out):.3f}:d={args.fade_out:.2f}"]
    parts.append(f"[{music_idx}:a]" + ",".join(bed_chain) + "[bed]")

    parts.append(f"[{dlg_sel}]aformat=sample_rates={SR}:channel_layouts=stereo,apad,atrim=0:{total:.3f}[dlg0]")
    if sfx_sel:
        parts.append(f"[{sfx_sel}]aformat=sample_rates={SR}:channel_layouts=stereo,apad,atrim=0:{total:.3f}[sfx]")
        parts.append("[dlg0][sfx]amix=inputs=2:normalize=0:dropout_transition=0[dlg1]")
    else:
        parts.append("[dlg0]anull[dlg1]")

    if duck == "sidechain":
        parts.append("[dlg1]asplit=2[key][dlg]")
        parts.append("[bed][key]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=400:makeup=1:detection=rms[bedd]")
    else:
        parts.append("[dlg1]anull[dlg]")
        parts.append("[bed]anull[bedd]")
    parts.append("[dlg][bedd]amix=inputs=2:normalize=0:dropout_transition=0[mix]")
    graph = ";".join(parts)

    print(f"video: {video} ({total:.2f}s, audio={'yes' if vinfo['has_audio'] else 'from --vo'})")
    print(f"bed:   {music}" + (f"  [{bed_meta.get('id')} {bed_meta.get('mood','')} {bed_meta.get('bpm','')}bpm]" if bed_meta else ""))
    print(f"VO {vo_lufs:.1f} LUFS | bed {bed_lufs:.1f} LUFS -> speech-time target {speech_target:.1f} LUFS "
          f"(under_db {args.under_db:+.0f}), gap lift +{args.gap_lift:.0f} dB, base gain {base_gain:+.1f} dB")
    print(f"duck: {duck}" + (f", {len(regions)} speech regions, attack {args.attack}s release {args.release}s" if duck == "envelope" else
                             (", sidechaincompress threshold=0.02 ratio=8 attack=20ms release=400ms" if duck == "sidechain" else "")))
    if duck == "envelope":
        for s, e in regions:
            print(f"  speak {s:7.2f} - {e:7.2f}")
    tp_pcm = args.tp - args.codec_headroom
    print(f"fades: in {args.fade_in}s, out last {args.fade_out}s | loudnorm: "
          + ("off" if args.no_loudnorm else
             f"two-pass I={args.lufs} TP={tp_pcm:.1f} (= {args.tp} delivery - {args.codec_headroom} AAC headroom) LRA={args.lra}"))
    print(f"out:   {out}")
    if args.print_only:
        print("\nfilter_complex:\n  " + graph.replace(";", ";\n  "))
        return

    tmp_wav = os.path.splitext(out)[0] + ".mix.wav"
    os.makedirs(os.path.dirname(out), exist_ok=True)
    if args.no_loudnorm:
        run(["ffmpeg", "-y", "-hide_banner", "-v", "error", *inputs, "-filter_complex", graph, "-map", "[mix]",
             "-ar", str(SR), "-ac", "2", "-c:a", "pcm_s16le", tmp_wav])
    else:
        st = loudnorm_two_pass(inputs, graph, tmp_wav, args.lufs, tp_pcm, args.lra)
        print(f"loudnorm pass 1: input I={st['input_i']} LUFS, TP={st['input_tp']} dBTP, LRA={st['input_lra']} "
              f"-> pass 2 target I={args.lufs}, TP={tp_pcm:.1f} (linear=true; ffmpeg falls back to dynamic if the "
              f"linear gain would break the TP ceiling)")
    final_lufs = measure_lufs(tmp_wav)
    print(f"final audio: {final_lufs if final_lufs is not None else 'n/a'} LUFS integrated")

    run(["ffmpeg", "-y", "-hide_banner", "-v", "error", "-i", video, "-i", tmp_wav, "-map", "0:v:0", "-map", "1:a:0",
         "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", str(SR), "-t", f"{total:.3f}",
         "-movflags", "+faststart", out])
    if args.out_wav:
        os.replace(tmp_wav, os.path.abspath(args.out_wav))
    else:
        os.remove(tmp_wav)
    log(f"final -> {out}")


if __name__ == "__main__":
    main()
