import type { CSSProperties } from "react";
import { Hexagon } from "./Hexagon";
import { ClusterChip } from "./ClusterChip";
import { tokens } from "@/tokens";
import type { Provider } from "@/lib/types";

interface ProviderNodeProps {
  provider: Provider;
  isActive?: boolean;
  onSelect?: (providerId: Provider["id"]) => void;
}

/**
 * Positions chips inside the hex as percentages of the wrapper. Tuned by
 * eye so 1–3 chips sit comfortably within the flat-top silhouette.
 */
const CHIP_POSITIONS: Record<number, Array<{ top: string; left: string }>> = {
  1: [{ top: "42%", left: "50%" }],
  2: [
    { top: "36%", left: "36%" },
    { top: "52%", left: "64%" },
  ],
  3: [
    { top: "30%", left: "34%" },
    { top: "34%", left: "66%" },
    { top: "62%", left: "50%" },
  ],
};

export function ProviderNode({ provider, isActive = false, onSelect }: ProviderNodeProps) {
  const chipCount = provider.clusters.length;
  const visibleChips = Math.min(chipCount, 3);
  const positions = CHIP_POSITIONS[visibleChips] ?? [];
  const overflow = chipCount - visibleChips;

  const strokeColor = isActive ? tokens.color.accentPrimaryStrong : tokens.color.accentPrimary;
  const strokeWidth = isActive ? 3 : 2;

  const buttonStyle = {
    "--hex-size": "clamp(7rem, 18vw, 11rem)",
  } as CSSProperties;

  return (
    <figure className="group/provider relative flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => onSelect?.(provider.id)}
        aria-pressed={isActive}
        aria-label={`Select ${provider.label} (${chipCount} clusters)`}
        className="relative cursor-pointer rounded-[var(--radius-lg)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-primary-strong"
        style={buttonStyle}
      >
        <Hexagon
          orientation="flat"
          size="var(--hex-size)"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill={isActive ? tokens.color.accentPrimarySoft : "transparent"}
          wrapperStyle={{
            transition: "transform 0.3s var(--ease-out-soft), filter 0.3s var(--ease-out-soft)",
          }}
          wrapperClassName="group-hover/provider:scale-[1.03] group-hover/provider:[filter:drop-shadow(0_8px_24px_color-mix(in_oklab,var(--color-accent-primary)_28%,transparent))]"
        />

        {positions.map((pos, i) => (
          <span
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ top: pos.top, left: pos.left }}
          >
            <ClusterChip
              size="calc(var(--hex-size) * 0.24)"
              variant={i === Math.floor(visibleChips / 2) ? "bars" : "plain"}
              label={provider.clusters[i]?.name}
            />
          </span>
        ))}

        {overflow > 0 && (
          <span
            className="absolute rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums"
            style={{
              top: "72%",
              left: "72%",
              backgroundColor: tokens.color.accentPrimary,
              color: tokens.color.bgElevated,
            }}
          >
            +{overflow}
          </span>
        )}
      </button>

      <figcaption className="flex items-center gap-2 text-sm font-medium text-text-primary">
        <span
          aria-hidden
          className="block h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: tokens.color.accentPrimary }}
        />
        {provider.label}
      </figcaption>
    </figure>
  );
}
