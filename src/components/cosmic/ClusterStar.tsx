import { motion } from "framer-motion";
import { tokens } from "@/tokens";
import type { Cluster } from "@/lib/types";
import type { Point } from "@/lib/cosmicGeometry";
import { twinkleDelay } from "@/lib/cosmicGeometry";

interface ClusterStarProps {
  cluster: Cluster;
  position: Point;
  active?: boolean;
  dim?: boolean;
  delay?: number;
  onSelect?: (cluster: Cluster) => void;
}

const currencyFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/**
 * Clickable "foreground" star. Visibly bright by default (these are the
 * cluster nodes, not ambient decoration), with a 32×32 invisible hit
 * area so the target is always generous even though the visible dot
 * stays tight. Dims only when another node is the focus.
 */
export function ClusterStar({
  cluster,
  position,
  active = false,
  dim = false,
  delay = 0,
  onSelect,
}: ClusterStarProps) {
  const dotSize = active ? 13 : 8;
  const haloSize = active ? 32 : 18;
  const opacity = active ? 1 : dim ? 0.3 : 0.95;
  const twDelay = twinkleDelay(cluster.id);

  return (
    <motion.button
      type="button"
      onClick={() => onSelect?.(cluster)}
      aria-label={`${cluster.name} — ${currencyFmt.format(cluster.estimatedMonthlySavingsUsd)} monthly savings`}
      className="group/star absolute z-10 grid -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary-strong"
      style={{
        top: `${position.y}%`,
        left: `${position.x}%`,
        inlineSize: "32px",
        blockSize: "32px",
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: active ? 1.1 : 1.25 }}
    >
      {/* Soft halo — always present, stronger when active */}
      <span
        aria-hidden
        className="absolute rounded-full"
        style={{
          inlineSize: `${haloSize}px`,
          blockSize: `${haloSize}px`,
          backgroundColor: active
            ? tokens.color.cosmicHalo
            : `color-mix(in oklab, ${tokens.color.cosmicAccent} 18%, transparent)`,
          filter: "blur(6px)",
          transition:
            "background-color 0.3s var(--ease-out-soft), inline-size 0.3s var(--ease-out-soft), block-size 0.3s var(--ease-out-soft)",
        }}
      />
      {/* Bright dot */}
      <span
        aria-hidden
        className="relative block rounded-full"
        style={{
          inlineSize: `${dotSize}px`,
          blockSize: `${dotSize}px`,
          backgroundColor: active
            ? tokens.color.cosmicAccent
            : tokens.color.cosmicStar,
          boxShadow: active
            ? `0 0 16px color-mix(in oklab, ${tokens.color.cosmicAccent} 75%, transparent), 0 0 34px color-mix(in oklab, ${tokens.color.cosmicAccent} 40%, transparent)`
            : `0 0 10px color-mix(in oklab, ${tokens.color.cosmicStar} 60%, transparent), 0 0 20px color-mix(in oklab, ${tokens.color.cosmicAccent} 25%, transparent)`,
          animation: active
            ? undefined
            : `cosmic-twinkle 4s ease-in-out ${twDelay}s infinite`,
          transition:
            "inline-size 0.3s var(--ease-out-soft), block-size 0.3s var(--ease-out-soft), background-color 0.3s var(--ease-out-soft), box-shadow 0.3s var(--ease-out-soft)",
        }}
      />
      {/* Hover label */}
      <span
        className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 whitespace-nowrap rounded-[var(--radius-md)] border border-border-subtle bg-bg-elevated px-2.5 py-1.5 text-xs text-text-primary opacity-0 shadow-[0_4px_16px_rgba(0,0,0,0.4)] transition-opacity duration-200 group-hover/star:opacity-100 group-focus-visible/star:opacity-100"
      >
        <span className="block font-medium">{cluster.name}</span>
        <span className="mt-0.5 block text-[10px] text-accent-primary">
          {currencyFmt.format(cluster.estimatedMonthlySavingsUsd)} /mo saved
        </span>
      </span>
    </motion.button>
  );
}
