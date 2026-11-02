---
description: Weekly review — the user pastes analytics (or a Metricool export path); turn it into decisions, lessons appended to HARNESS, and a re-scored backlog.
argument-hint: "<paste the numbers, or a path to a CSV/XLSX export>"
---

# /weekly-review

Input: **$ARGUMENTS** (pasted numbers, or a file path). If empty, ask the user to paste, per post: platform, date, length, views, (YT) viewed-vs-swiped %, (IG) skip rate + avg watch time + sends, (TT) avg watch time + completion, follows, comments — or export from Metricool (Analytics → export CSV) / YouTube Studio / Instagram Insights. Do not log in anywhere yourself.

1. Parse the data into one table per channel. Match each post to its episode folder (date + channel). Compute each channel's **own** medians (rule zero: compare with yourself; the platforms publish no "good" thresholds).
2. Apply the decision rules (research/02 §8 & §9.6):
   - **Hook problem:** YT viewed-vs-swiped < 60 % or IG skip rate > 10 pts worse than the 30-day median → rework the hook type.
   - **Middle problem:** hook fine but retention drops > 25 pts between 3 s and 50 %.
   - **Scale:** ≥ 2× median non-follower views AND ≥ median sends (IG) / subs per 1K engaged views (YT) → 3 follow-ups in the same format within 7 days.
   - **Kill:** a series with 6 consecutive below-median hooks → retire or re-hook.
   - CTA posts vs non-CTA reach (4-week window) → keep 1 in 3 or cut to 1 in 5.
   - Trial reels: winner = lower skip rate and ≥ 1.3× views.
3. Write `studio/reviews/<YYYY>-W<ww>.md`: wins, losses, the 3 decisions for next week, hook-type tally (number-first / contradiction / POV / question / stakes).
4. **Lessons → HARNESS:** each generalisable lesson becomes ONE line appended under `## Learned from reviews` in `toolkit/HARNESS.md`: `- <rule> — weekly review <YYYY-Www>, <date>`. Only rules backed by this data; no vague advice. Bible-level strategy changes (cadence, series) → edit that channel's bible and say what changed.
5. **Re-score the backlogs:** update Novelty (what just shipped) and Hook (which hook types are winning) in each `ideas.md`; move shipped ideas to `## Used` with their 7-day numbers.
6. Update the "Shipped" rows in `studio/STATUS.md`. Then suggest running `/plan-week`.
