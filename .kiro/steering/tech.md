# Tech steering — Vigil

## Stack

React 19 + TypeScript (strict) + Vite 7. Vitest for the model. No CSS framework —
one hand-written stylesheet, because the visual is the entry.

## Layering

- `src/lib/session.ts` — the whole domain. Pure functions over an immutable
  `SessionState`. **No React, no DOM, no timers inside it.**
- `src/App.tsx` — owns the ticker and renders. Talks to the model only through
  the exported transitions.
- `src/components/` — dumb presentational parts.

If a rule can be tested without a browser, it belongs in `lib/` and gets a test.
The current suite covers ticking, the haunt ladder, dread, and every transition.

## State rules

- All transitions return a **new** object and are no-ops when the status
  disallows them (`visit` while paused, `tick` after `done`). Never mutate.
- `haunt` clamps to `MAX_HAUNT`. Visits still append after the clamp so the
  verdict and the recap chart stay honest.
- Dread is derived, never stored.

## CSS conventions

- Drive intensity through the `--dread` and `--lamp` custom properties on
  `:root`; do not toggle per-state classes for darkness.
- Keep the flame as the only warm hue; ghosts are `--ghost`, the ladder's last
  step is `--blood`.

## Testing

`pnpm test` must stay green. A change to the haunt ladder or dread curve without
a matching test update is incomplete.
