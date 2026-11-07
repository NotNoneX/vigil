# Requirements — the haunt ladder

## R1 · A visit can move a ghost

When the user reports a distraction during a running session, the ghost ladder may
advance one step. Whether it advances depends on how long it has been since the
previous visit: a short gap means the ghosts press in, a long gap means they held.

- R1.1 The tolerance shrinks as the ladder climbs.
- R1.2 The tolerance is never below 45 seconds, so the last step is not free.
- R1.3 Tolerance scales with session length: a 90-minute siege tolerates far more
  than a 25-minute short watch.
- R1.4 At `MAX_HAUNT` the ladder stops climbing.
- R1.5 Every visit is recorded, including ones after the clamp.

## R2 · Visits are impossible while paused or done

`visit()` returns the same state when `status` is not `running`.

## R3 · Dread is a total function of state

Dread is 0..100, monotonic in both haunt level and visit count, and never stored.
A clean session reports 0.

## R4 · The room answers to dread

The UI binds dread to a `--dread` custom property and shrinks `--lamp` as it rises.
At high dread the page is visibly darker than a fresh session.

## R5 · The clock is authoritative

The countdown clamps at zero and flips status to `done`. Ticks after `done` are
no-ops. `remainingSeconds` never returns a negative number.

## R6 · The verdict is honest

The ending line is chosen from the visit count, not the remaining time, so
quitting early with no visits never reads as a perfect session.
