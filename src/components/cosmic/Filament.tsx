import { motion } from "framer-motion";
import { bezierPath, type Point } from "@/lib/cosmicGeometry";
import { tokens } from "@/tokens";

interface FilamentProps {
  from: Point;
  to: Point;
  curve?: number;
  active?: boolean;
  /** Push into the background when another filament is the focus. */
  dim?: boolean;
  /** Delay (seconds) applied to the entrance fade. */
  delay?: number;
  /** Lower = tighter dash spacing. */
  density?: "dense" | "sparse";
  /** Animation duration for the flowing dash offset, seconds. */
  flowDuration?: number;
}

export function Filament({
  from,
  to,
  curve = 4,
  active = false,
  dim = false,
  delay = 0,
  density = "dense",
  flowDuration = 6,
}: FilamentProps) {
  const d = bezierPath(from, to, curve);
  const dashArray = density === "dense" ? "0.6 2" : "0.4 4";
  const stroke = active ? tokens.color.cosmicFilament : tokens.color.cosmicFilamentDim;
  const strokeWidth = active ? 0.6 : 0.3;
  const targetOpacity = active ? 1 : dim ? 0.18 : 0.85;

  return (
    <motion.path
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeDasharray={dashArray}
      vectorEffect="non-scaling-stroke"
      initial={{ opacity: 0 }}
      animate={{ opacity: targetOpacity }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{
        animation: `cosmic-flow ${flowDuration}s linear infinite`,
        transition:
          "stroke 0.4s var(--ease-out-soft), stroke-width 0.4s var(--ease-out-soft)",
      }}
    />
  );
}
