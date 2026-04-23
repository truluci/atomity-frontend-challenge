/**
 * Design tokens — authoritative values live in `src/index.css` as CSS
 * custom properties. This file exposes them as a typed map so components
 * written in TS/JS (e.g. inline style props passed to framer-motion
 * animations, SVG `fill`, chart libs) can reference them without ever
 * hardcoding a hex value.
 */

const cssVar = (name: string) => `var(${name})` as const;

export const tokens = {
  color: {
    bgPrimary: cssVar("--color-bg-primary"),
    bgElevated: cssVar("--color-bg-elevated"),
    bgMuted: cssVar("--color-bg-muted"),
    borderSubtle: cssVar("--color-border-subtle"),
    borderStrong: cssVar("--color-border-strong"),

    textPrimary: cssVar("--color-text-primary"),
    textSecondary: cssVar("--color-text-secondary"),
    textMuted: cssVar("--color-text-muted"),

    accentPrimary: cssVar("--color-accent-primary"),
    accentPrimaryStrong: cssVar("--color-accent-primary-strong"),
    accentPrimarySoft: cssVar("--color-accent-primary-soft"),
    accentInfo: cssVar("--color-accent-info"),
    accentWarn: cssVar("--color-accent-warn"),
    accentError: cssVar("--color-accent-error"),

    cosmicVoid: cssVar("--color-cosmic-void"),
    cosmicDeep: cssVar("--color-cosmic-deep"),
    cosmicNebula: cssVar("--color-cosmic-nebula"),
    cosmicFilament: cssVar("--color-cosmic-filament"),
    cosmicFilamentDim: cssVar("--color-cosmic-filament-dim"),
    cosmicStar: cssVar("--color-cosmic-star"),
    cosmicStarDim: cssVar("--color-cosmic-star-dim"),
    cosmicHalo: cssVar("--color-cosmic-halo"),
  },
  radius: {
    sm: cssVar("--radius-sm"),
    md: cssVar("--radius-md"),
    lg: cssVar("--radius-lg"),
    xl: cssVar("--radius-xl"),
  },
  ease: {
    outSoft: [0.22, 1, 0.36, 1] as const,
    outSnappy: [0.16, 1, 0.3, 1] as const,
  },
  duration: {
    fast: 0.2,
    base: 0.4,
    slow: 0.7,
  },
} as const;

export type Tokens = typeof tokens;
