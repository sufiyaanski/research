---
description: Plan next week — fill every channel's calendar slots from the backlogs (best scores, variety rules, fact load), then wait for approval.
argument-hint: "[optional: week start date or constraints, e.g. 'light week' or 'skip Friday']"
---

# /plan-week

Constraints from the user: **$ARGUMENTS**

1. Read `studio/STATUS.md`, every live bible's `## Cadence`, every `ideas.md`, every `calendar.md`, and the newest weekly review in `studio/reviews/` (if any).
2. Work out next week (Mon–Sun, ISO week) and the slots each channel needs per its bible cadence. Long-form follows its 2-week cycle in `channels/longform/calendar.md`.
3. Fill slots with the highest-scoring `scored` ideas, but obey:
   - **Variety:** no two consecutive posts on a channel with the same series AND hook type; Q-ROSITY: no repeated scenario+outcome within the last 10 Used; long-form: domain differs from the previous episode.
   - **Load:** at most 2 fact-heavy (Fact safety ≤ 3) pieces in the week; at most 1 piece needing a new 3D set.
   - **Doubles-downs first:** any format the last review marked "scale" (≥ 2× median) gets its follow-ups before new ideas.
4. Show the week as one table (day · channel · idea · series/hook type · why) plus the user's estimated hours, and **stop for approval**.
5. After "go": write the rows into each `calendar.md`, set those ideas to `picked`, and add them to "Up next" in `studio/STATUS.md`.
