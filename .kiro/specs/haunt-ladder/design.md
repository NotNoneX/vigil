# Design — the haunt ladder

## Why a ladder and not a counter

A flat "distractions: 7" reads as a statistic. A ghost that physically arrives
reads as a threat. So the model stores a stage (`haunt`, 0..4) and the UI renders
four ghosts whose opacity, scale and blur interpolate with the stage.

## Tolerance curve

```
hauntThreshold(state, step) = max(45, floor(totalSeconds / 10 / (step + 1)))
```

`totalSeconds / 10` makes a 25-minute watch tolerate 150s at step 0 while a
90-minute siege tolerates 540s. Dividing by `step + 1` tightens each rung: step 3
of a 25-minute watch allows 37s, floored to 45s.

Deliberately not a percentage of remaining time — a ladder that speeds up purely
because the clock is low would punish long sessions twice.

## Transition shape

```ts
visit(s): SessionState
```

1. Bail if `status !== 'running'`.
2. Record `elapsedSeconds` in `distractions`.
3. Compute the gap since the previous visit (or since start).
4. Advance `haunt` by one only when `gap <= hauntThreshold(s, s.haunt)`.

Clamping happens at write time, so `haunt` is always in range and consumers never
guard it.

## Dread

```
dread = min(100, round(haunt / MAX_HAUNT * 70 + min(30, visits * 6)))
```

Haunt dominates because it encodes cadence; raw visit count only tops up, capped
at 30, so a long siege with slow, considered check-ins still reads as defended.

## Rendering

`--dread` drives fog opacity and animation speed; `--lamp` (derived, clamped at
0.18) drives the candle glow radius and the clock's text-shadow. Both are set on
`:root` from an effect, not per-element, so one React commit restyles the room.

## Alternatives considered

- **Decay over time**: ghosts retreat if you stay clean for a while. Rejected for
  v1 — it made the ladder feel like it un-happened, and test cases doubled.
- **Percentage-of-remaining threshold**: rejected, see above.
- **Storing dread**: rejected, it drifts out of sync with the recorded visits.
