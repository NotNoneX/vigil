# Vigil

A focus timer for the small hours. Every time you drift, a ghost steps closer to
your candle and the room gets darker.

**[Live demo →](https://notnonex.github.io/vigil/)**

> Started on 30 October 2026 for [Kiroween 2026](https://kiroween.devpost.com/) —
> **Costume Contest** category.

## The idea

Pomodoro apps tell the time. They do not tell you that you just rebuilt your
attention span around a notification. Vigil does: the candle is your clock, and
four ghosts are how much slack you have left. Report a drift and one of them
takes a step toward the flame.

It is not punitive. The countdown keeps running. The ghosts are just a way to
make an abstraction you can feel.

| Distance | Visit gap | What it means |
|---|---|---|
| Farthest | > 4× tolerance | You held |
| … | … | The ladder tightens each step |
| At the candle | ≤ 45 s | You are losing the room |

The room dims with `dread` — a derived 0–100 score that leans on the ladder, not
on the raw count, so a long siege is not automatically a failed one.

## Using it

1. Pick 25, 50 or 90 minutes.
2. Say what you are keeping watch over. It stays on screen the whole session.
3. Light the candle. Leave the tab open; the countdown also rides in the tab title.
4. Every time something pulls you away, press **Something caught my eye**.
5. At the end you get a verdict and a recap of when the ghosts found you.

Nothing leaves the browser. No account, no storage, no network.

## Running it

```sh
pnpm install
pnpm dev      # http://localhost:5173
pnpm test     # domain suite
pnpm build    # typecheck + bundle
```

Requires Node 22 · `pnpm` and `package.json` are the source of truth for the toolchain.

## How Kiro was used

The whole build ran inside Kiro. `.kiro/` is committed and deliberately **not**
git-ignored.

- **Specs** — `.kiro/specs/haunt-ladder/` is the design of record: requirements →
  design → tasks. The tolerance curve, the clamp rule and the no-decay decision
  were all settled in the design doc before any code, and the alternative
  section records what got rejected and why.
- **Steering** — `.kiro/steering/product.md` pins the non-goals (no backend, no
  accounts, no streak economy) so the agent stops proposing them;
  `.kiro/steering/tech.md` pins the layering rule that keeps the domain pure and
  out of React.
- **Hooks** — `.kiro/hooks/` runs the strict typecheck before a build and the
  model suite whenever `src/lib` changes. Both caught real regressions during the
  build, including a threshold formula that degenerated to zero on the last rung.
- **Spec-driven vs vibing** — the model is 19 tests, all writing through the
  requirement IDs they came from. Without the spec the agent kept inlining the
  tolerance arithmetic into the component, which is exactly what made the last
  rung impossible to reason about.

## Stack

React 19 · TypeScript (strict) · Vite 7 · Vitest · one hand-written stylesheet.
The domain lives in `src/lib/session.ts` as pure, immutable transitions with no
React, DOM or timer imports; `src/App.tsx` owns the single ticker. See
`.kiro/steering/tech.md`.

## Layout

```
src/lib/session.ts        the ladder, the clock, the verdict
src/lib/session.test.ts   19 tests against the requirement IDs
src/components/Ghost.tsx  presentational only
src/App.tsx               ticker + screens
.kiro/                    specs, steering, hooks
```

## Disclosure

No pre-existing code or boilerplate beyond the frameworks listed above. The
`pnpm` scaffold and `vite` template are stock; every line in `src/` was written
for this project.

## License

MIT — see [LICENSE](./LICENSE).
