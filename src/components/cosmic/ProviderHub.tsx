import { motion } from "framer-motion";
import { tokens } from "@/tokens";
import type { Provider } from "@/lib/types";
import type { Point } from "@/lib/cosmicGeometry";

interface ProviderHubProps {
  provider: Provider;
  /** Percentage-based position in the radial web. Omit to render inline
   *  (used by the stacked mobile layout). */
  position?: Point;
  active?: boolean;
  dim?: boolean;
  delay?: number;
  onSelect?: (providerId: Provider["id"]) => void;
}

/**
 * Galactic-nucleus hub: concentric orbital rings + bright pulsing core.
 * Clearly distinct from `ClusterStar` (bigger, with structure) so users
 * read it as a "gravity center" rather than just another star.
 */
export function ProviderHub({
  provider,
  position,
  active = false,
  dim = false,
  delay = 0,
  onSelect,
}: ProviderHubProps) {
  const stroke = active
    ? tokens.color.cosmicAccentStrong
    : tokens.color.cosmicAccent;
  const coreBoost = active ? 1.15 : 1;

  return (
    <motion.button
      type="button"
      onClick={() => onSelect?.(provider.id)}
      aria-pressed={active}
      aria-label={`Select ${provider.label} (${provider.clusters.length} clusters)`}
      className={
        position
          ? "group/hub absolute flex -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col items-center gap-2 p-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-primary-strong"
          : "group/hub flex cursor-pointer flex-col items-center gap-2 p-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-primary-strong"
      }
      style={{
        ...(position ? { top: `${position.y}%`, left: `${position.x}%` } : {}),
        opacity: dim ? 0.42 : 1,
        transition: "opacity 0.4s var(--ease-out-soft)",
      }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: dim ? 0.42 : 1, scale: 1 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.05 }}
    >
      <span
        className="relative block"
        style={{
          // Size tracks the web's container width (cqw) with a tight
          // mobile floor so the hubs stay distinct without crushing
          // adjacent cluster stars.
          inlineSize: "clamp(2.75rem, 10cqw, 5.5rem)",
          aspectRatio: "1",
        }}
      >
        {/* Outer soft halo — pushes the hub forward off the backdrop */}
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            inlineSize: "140%",
            blockSize: "140%",
            background: active
              ? `radial-gradient(circle, color-mix(in oklab, ${tokens.color.cosmicAccent} 42%, transparent) 0%, transparent 68%)`
              : `radial-gradient(circle, color-mix(in oklab, ${tokens.color.cosmicAccent} 22%, transparent) 0%, transparent 68%)`,
            filter: "blur(10px)",
            transition: "background 0.4s var(--ease-out-soft)",
          }}
        />

        {/* Orbital rings — crisp, non-scaling stroke keeps the lines 1px */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 size-full overflow-visible"
          aria-hidden
        >
          <circle
            cx={50}
            cy={50}
            r={42}
            fill="none"
            stroke={stroke}
            strokeOpacity={active ? 0.75 : 0.45}
            strokeWidth={1}
            strokeDasharray="2 3"
            vectorEffect="non-scaling-stroke"
            style={{
              transformOrigin: "50% 50%",
              animation: "cosmic-orbit 40s linear infinite",
            }}
          />
          <circle
            cx={50}
            cy={50}
            r={28}
            fill="none"
            stroke={stroke}
            strokeOpacity={active ? 1 : 0.7}
            strokeWidth={1.3}
            vectorEffect="non-scaling-stroke"
          />
          <circle
            cx={50}
            cy={50}
            r={14 * coreBoost}
            fill={tokens.color.cosmicAccent}
            style={{
              filter: active
                ? `drop-shadow(0 0 6px ${tokens.color.cosmicAccent}) drop-shadow(0 0 14px color-mix(in oklab, ${tokens.color.cosmicAccent} 60%, transparent))`
                : `drop-shadow(0 0 4px ${tokens.color.cosmicAccent}) drop-shadow(0 0 10px color-mix(in oklab, ${tokens.color.cosmicAccent} 40%, transparent))`,
              transformOrigin: "50% 50%",
              animation: "cosmic-pulse 3.2s ease-in-out infinite",
              transition: "r 0.3s var(--ease-out-soft)",
            }}
          />
        </svg>
      </span>

      <span className="flex items-center gap-1.5">
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-text-primary">
          {provider.label}
        </span>
        <span className="hidden text-[11px] tabular-nums text-text-muted @sm:inline">
          ·&nbsp;{provider.clusters.length}
        </span>
      </span>
    </motion.button>
  );
}
