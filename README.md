# Atomity Frontend Challenge

Interactive "cosmic web" of cloud clusters across AWS, Azure, GCP, and on-prem. A central core connects to four provider hubs; each hub fans out into cluster stars. Click a hub or star to open a detail panel.

```bash
pnpm install
pnpm dev
```

## Feature chosen

**Cluster topology visualization(Option B)** A table would have been easier, but the web metaphor actually earns its space spatial grouping makes the provider-to-cluster relationship cooler, and it allowed me to be more free with animations.

## Animation

[framer-motion](https://www.framer.com/motion/) with timing tokens in [src/tokens/index.ts](src/tokens/index.ts).

- One source of truth for focus (`Selection` union in [CosmicWeb.tsx](src/components/cosmic/CosmicWeb.tsx)) — you can't be focused on two things at once.
- Layout animations over keyframes: the web shrinks and shifts when the panel opens.
- Stagger on entry, not exit. Cascading exits feel fussy.
- Easing curves carry the feel (`outSoft`, `outSnappy`), not durations.

## Tokens and styles

CSS custom properties in [src/index.css](src/index.css) are the source of truth, mirrored into a typed TS map in [src/tokens/index.ts](src/tokens/index.ts) for inline use (framer-motion, SVG fills).

## Data fetching

[TanStack Query](https://tanstack.com/query) against [DummyJSON](https://dummyjson.com), reshaped via [mappers.ts](src/lib/mappers.ts).

- [useClusters](src/hooks/useClusters.ts) — list, `staleTime: 5min`.
- [useClusterDetail](src/hooks/useClusterDetail.ts) — per-id, gated with `enabled`, keyed by cluster id so re-opening is instant.
- `refetchOnWindowFocus: false` — data isn't volatile enough to justify the jank.

## Libraries

| | Why |
|---|---|
| React 19 + TS | Baseline. |
| Vite | Fast HMR — motion code iterates best with instant reload. |
| Tailwind v4 | Utility-first, consumes the same CSS vars as framer-motion. |
| framer-motion | Springs, layout animations, `AnimatePresence`. Not worth hand-rolling. |
| TanStack Query | Keyed caching and `enabled` flag. Rebuilding this with `useEffect` is half its code. |

## Tradeoffs

- **Responsiveness.** Style I went with is too random and not neatly organized. Displaying the cosmic web style in smaller scales really hard. 
- **SVG over Canvas.** ~30 stars; DOM cost is negligible and theming comes for free.


## What I'd improve

- Derived geometry so the layout isn't pinned to exactly four providers.
- Better color palette for light mode
