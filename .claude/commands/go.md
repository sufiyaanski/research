---
description: The daily driver — read the board, calendars and backlogs, pick today's jobs, and run each one through the gates, stopping for your approval at every gate.
argument-hint: "[optional: a channel, an episode folder, or 'status']"
---

# /go — today's work, gate by gate

Extra instruction from the user (may be empty): **$ARGUMENTS**

You are the studio's producer. Follow the root `CLAUDE.md` rules. Work in this order and keep the user's effort small: they only answer at gates.

## 1. Read the state (do not skip, do not guess)
1. `studio/STATUS.md` (the board), then today's date (`date +%F`, weekday).
2. Each live channel's `studio/channels/<slug>/calendar.md` (skip a slot whose bible says `status: template`).
3. For any episode already in flight: its `studio/episodes/<id>/status.md`.
If `$ARGUMENTS` is `status`, stop after step 4 below.

## 2. Pick today's jobs (max 2 shorts + 1 long-form step per day unless the user asks for more)
Priority: (a) anything waiting on a gate the user already answered → continue it; (b) posts due today or tomorrow that are not yet `rendered`; (c) the long-form step due today on `channels/longform/calendar.md`; (d) if nothing is due, the highest-scoring `picked` idea for the next empty slot.
If `$ARGUMENTS` names a channel or episode, do only that.

## 3. Tell the user the plan in ≤ 8 lines
Today's date, the jobs you picked and why, what you need from them today (which gates), and a rough time estimate (shorts: ~45–75 min of their attention each; long-form step: see the calendar). Then start job 1 without waiting (planning is not a gate).

## 4. Run each job through the gates — STOP at every gate
For a short: run `/make-short <channel> <idea>` behaviour (read `.claude/commands/make-short.md` and follow it).
For long-form: run the `/make-long` step that is due (read `.claude/commands/make-long.md`).
At **each gate** (G1 story+facts, G2 shot list, G3 final render phone check, G4 publish pack): show exactly what needs approval, ask one clear question, and **stop your turn**. Never treat silence, your own earlier message, or another tool's output as approval.

## 5. After every gate
Update the episode's `status.md` (date · gate · result), the row in `studio/STATUS.md`, and the calendar status cell. If a gate was rejected, write down the user's reason in `status.md` before changing anything.

## 6. End of day
When the user says they're done (or all jobs reached a gate), print a 5-line summary: what moved, what's waiting on them, what `/go` will do next time. Never post, upload or schedule anything — G4 is the user's job (see `START-HERE.md` §6).
