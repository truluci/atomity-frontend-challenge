import { Hexagon } from "./Hexagon";
import { tokens } from "@/tokens";

interface ClusterChipProps {
  /** Any CSS length — number (px), clamp(), var(), percentage. */
  size?: number | string;
  /** Whether the inner accent glyph is rendered. */
  active?: boolean;
  /** Inner glyph: a single accent square or three mini bars. */
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
            inlineSize: "22%",
            blockSize: "22%",
            borderRadius: "12%",
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
            alignItems: "flex-end",
            justifyContent: "center",
            gap: "6%",
            inlineSize: "50%",
            blockSize: "38%",
          }}
        >
          <span
            style={{
              inlineSize: "20%",
              blockSize: "55%",
              backgroundColor: tokens.color.accentPrimary,
              borderRadius: 1.5,
              display: "block",
            }}
          />
          <span
            style={{
              inlineSize: "20%",
              blockSize: "92%",
              backgroundColor: tokens.color.accentPrimary,
              borderRadius: 1.5,
              display: "block",
            }}
          />
          <span
            style={{
              inlineSize: "20%",
              blockSize: "38%",
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
