import { Hexagon } from "./Hexagon";
import { tokens } from "@/tokens";

interface ClusterChipProps {
  size?: number;
  /** Whether the inner accent square is rendered — visual "active" state. */
  active?: boolean;
  /** Swap the accent square for a pair of micro-bars (mini dashboard look). */
  variant?: "plain" | "bars";
  label?: string;
}

export function ClusterChip({
  size = 44,
  active = true,
  variant = "plain",
  label,
}: ClusterChipProps) {
  return (
    <Hexagon
      orientation="pointy"
      size={size}
      fill={tokens.color.bgElevated}
      stroke={tokens.color.borderStrong}
      strokeWidth={1.5}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      {active && variant === "plain" && (
        <span
          aria-hidden
          style={{
            inlineSize: size * 0.22,
            blockSize: size * 0.22,
            borderRadius: 3,
            backgroundColor: tokens.color.accentPrimary,
            display: "block",
          }}
        />
      )}
      {active && variant === "bars" && (
        <span
          aria-hidden
          style={{
            display: "flex",
            gap: 2,
            alignItems: "flex-end",
          }}
        >
          <span
            style={{
              inlineSize: size * 0.08,
              blockSize: size * 0.2,
              backgroundColor: tokens.color.accentPrimary,
              borderRadius: 1.5,
              display: "block",
            }}
          />
          <span
            style={{
              inlineSize: size * 0.08,
              blockSize: size * 0.32,
              backgroundColor: tokens.color.accentPrimary,
              borderRadius: 1.5,
              display: "block",
            }}
          />
          <span
            style={{
              inlineSize: size * 0.08,
              blockSize: size * 0.14,
              backgroundColor: tokens.color.accentPrimary,
              borderRadius: 1.5,
              display: "block",
            }}
          />
        </span>
      )}
    </Hexagon>
  );
}
