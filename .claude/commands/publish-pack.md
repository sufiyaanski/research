---
description: Write publish.md for an episode — per-platform title, caption, hashtags, trial-reel hook variants, cover frame, upload checklist. Never posts or schedules anything.
argument-hint: "<episode folder id>"
---

# /publish-pack $ARGUMENTS

1. Open `studio/episodes/$ARGUMENTS/` (brief, script, facts, status) and the channel bible (§ CTA rules, § Platform notes, § Cadence). Confirm Gate 3 (phone check) is approved in `status.md`; if not, stop and say so.
2. Check the render(s): duration per platform cut, loudness (`ffmpeg -i <mp4> -af ebur128=peak=true -f null -` → ≈ −14 LUFS, ≤ −1 dBTP), no watermark, 1080×1920 (shorts) / 1920×1080 (long-form).
3. Write `publish.md` with these sections:
   - **Files:** the exact mp4 per platform (IG, TikTok, YT Shorts — or the long-form mp4, thumbnail PNG, `captions.srt`).
   - **Instagram:** caption (hook line ≤ 125 chars first, then 1–2 lines, source credit), 0–3 hashtags, cover = frame 0 (say which frame), alt text, "Trial reel?" (only if ≥ 1,000 followers).
   - **Trial-reel variants:** 2 genuinely different hooks (different first line AND first frame/text — research 02 §9.4: one variable per test, never the identical reel), with ids `<EP>-HA` / `<EP>-HB`, and the 24 h read-out rule.
   - **TikTok:** caption + question, 2–4 hashtags, which cut (61–75 s for Signal), AI label: not needed (non-realistic animation) unless something realistic was used.
   - **YouTube Shorts:** title ≤ 60 chars, 1–2 hashtags, "Related video" link (long-form episode if any).
   - **Long-form only:** 3 title options (≤ 60 chars) + 2 thumbnail texts for YouTube's A/B test, `description.md` path, chapters from `chapters.txt` (≥ 3, first 0:00), captions file, end-screen elements (2 videos + subscribe), playlist.
   - **CTA:** whether this post carries one (≤ 1 in 3 per the bible) and the exact line.
   - **Posting slot:** day/time from the calendar; "post manually or schedule in Metricool/Postiz/Upload-Post yourself".
   - **Checklist** the user ticks: facts re-read · watched on phone · right file per platform · caption pasted · posted.
4. Update `status.md` → `pack ready`, STATUS board, calendar cell. **Do not upload, post or schedule — not even as a draft — unless the user explicitly asks in this conversation, names the tool, and has approved this exact pack.**
