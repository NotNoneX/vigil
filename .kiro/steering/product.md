# Product steering — Vigil

## What this is

A focus timer for late-night work. The twist: distraction has a body. Each time the
user admits they drifted, a ghost steps closer to their candle and the room dims.
The candle is the clock; the ghosts are the metric. Nothing is punitive — the
timer keeps running either way.

## Who it is for

Students and knowledge workers doing the 22:00–03:00 shift, who already tried a
tidy pomodoro app and found it too polite to hold their attention.

## Non-goals

- No accounts, no cloud sync, no backend. Everything is local and instant.
- No notification permission prompts. The tab title carries the countdown.
- No gamified streak economy. One session, one verdict, done.
- No reward for zero distraction beyond the verdict line itself.

## Voice

Quiet, nocturnal, slightly arch. Second person, present tense. UI copy is English.
Prefer concrete nouns (candle, ghost, room) over abstractions (focus score, productivity).

## Design rules

- Dark by default; the only warm colour in the interface is the flame.
- The room must visibly darken as dread rises. If the page looks the same at 90%
  dread as at 0%, the feature is broken.
- Motion is slow (0.9s+) except the last ghost, which should feel urgent.
- `prefers-reduced-motion` disables the fog and hover animations, never the state change.
