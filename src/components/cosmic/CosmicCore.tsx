import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { tokens } from "@/tokens";
import { arcPath, polarPoint } from "@/lib/cosmicGeometry";
import type { Cluster, MetricKey, Provider, ProviderId } from "@/lib/types";

interface CosmicCoreProps {
  providers: Provider[];
  /** Narrow aggregation to a single provider. Ignored when `activeCluster` is set. */
  activeProvider?: ProviderId | null;
  /** If set, the arcs show this one cluster's raw metrics instead of an average. */
  activeCluster?: Cluster | null;
}

const METRIC_ORDER: MetricKey[] = ["cpu", "gpu", "ram", "pv", "network", "cloud"];
const METRIC_LABELS: Record<MetricKey, string> = {
  cpu: "CPU",
  gpu: "GPU",
  ram: "RAM",
  pv: "PV",
  network: "Net",
  cloud: "Cloud",
};

const SLOT_SIZE = 60;
const SLOT_GAP = 6;

export function CosmicCore({
  providers,
  activeProvider = null,
  activeCluster = null,
}: CosmicCoreProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, amount: 0.3 });
  const [entered, setEntered] = useState(false);
  const [phase, setPhase] = useState<"initial" | "post">("initial");

  useEffect(() => {
    if (!inView) return;
    setEntered(true);
    const t = setTimeout(() => setPhase("post"), 1800);
    return () => clearTimeout(t);
  }, [inView]);

  const metricValues = useMemo(() => {
    // Cluster selection wins — show its raw numbers rather than an average
    // so the core accurately reflects what the panel is describing.
    if (activeCluster) {
      return METRIC_ORDER.map((key) => ({
        key,
        value: activeCluster.metrics[key],
      }));
    }
    const scoped = providers.filter((p) => !activeProvider || p.id === activeProvider);
    const clusters = scoped.flatMap((p) => p.clusters);
    const len = clusters.length || 1;
    return METRIC_ORDER.map((key) => {
      const avg = clusters.reduce((sum, c) => sum + c.metrics[key], 0) / len;
      return { key, value: Math.round(avg) };
    });
  }, [providers, activeProvider, activeCluster]);

  const cx = 50;
  const cy = 50;
  const ringRadius = 40;
  const arcWidth = 3;
  const labelRadius = 49;

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none"
      style={{
        inlineSize: "clamp(12rem, 22vw, 17rem)",
        aspectRatio: "1",
      }}
    >
      {/* Tight nucleus aura — contained so it doesn't wash out the arcs. */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          inlineSize: "44%",
          blockSize: "44%",
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--color-cosmic-accent) 40%, transparent) 0%, color-mix(in oklab, var(--color-cosmic-accent) 12%, transparent) 40%, transparent 72%)",
          filter: "blur(4px)",
          animation: "cosmic-pulse 5s ease-in-out infinite",
        }}
      />

      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full overflow-visible">
        {/* Ring background — one arc per slot */}
        {METRIC_ORDER.map((key, i) => {
          const slotStart = -90 + i * SLOT_SIZE + SLOT_GAP / 2;
          const slotEnd = slotStart + SLOT_SIZE - SLOT_GAP;
          return (
            <path
              key={`bg-${key}`}
              d={arcPath(cx, cy, ringRadius, slotStart, slotEnd)}
              fill="none"
              stroke={tokens.color.cosmicFilamentDim}
              strokeWidth={arcWidth}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}

        {/* Filled arcs — pathLength normalized so progress animates cleanly */}
        {metricValues.map(({ key, value }, i) => {
          const slotStart = -90 + i * SLOT_SIZE + SLOT_GAP / 2;
          const slotEnd = slotStart + SLOT_SIZE - SLOT_GAP;
          const progress = Math.max(0, Math.min(1, value / 100));
          const enterDelay = 0.2 + i * 0.08;
          return (
            <motion.path
              key={`fill-${key}`}
              d={arcPath(cx, cy, ringRadius, slotStart, slotEnd)}
              pathLength={1}
              fill="none"
              stroke={tokens.color.cosmicAccent}
              strokeWidth={arcWidth + 0.4}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={
                entered
                  ? { pathLength: progress, opacity: 1 }
                  : { pathLength: 0, opacity: 0 }
              }
              transition={{
                duration: 0.75,
                delay: phase === "initial" ? enterDelay : 0,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                filter: `drop-shadow(0 0 3px color-mix(in oklab, ${tokens.color.cosmicAccent} 55%, transparent))`,
              }}
            />
          );
        })}

        {/* Slot-boundary ticks */}
        {METRIC_ORDER.map((_, i) => {
          const angle = -90 + i * SLOT_SIZE;
          const inner = polarPoint(cx, cy, ringRadius - 3, angle);
          const outer = polarPoint(cx, cy, ringRadius + 3, angle);
          return (
            <line
              key={`tick-${i}`}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke={tokens.color.cosmicFilamentDim}
              strokeWidth={0.6}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}

        {/* Bright nucleus at center — crisp, fills the empty middle */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={5}
          fill={tokens.color.cosmicAccent}
          initial={{ opacity: 0, scale: 0 }}
          animate={entered ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          style={{
            filter: `drop-shadow(0 0 6px ${tokens.color.cosmicAccent}) drop-shadow(0 0 14px color-mix(in oklab, ${tokens.color.cosmicAccent} 60%, transparent))`,
            transformOrigin: `${cx}px ${cy}px`,
          }}
        />
      </svg>

      {/* Metric labels in HTML so typography stays predictable across scale */}
      {METRIC_ORDER.map((key, i) => {
        const angle = -90 + i * SLOT_SIZE + SLOT_SIZE / 2;
        const pos = polarPoint(cx, cy, labelRadius, angle);
        return (
          <span
            key={`label-${key}`}
            className="pointer-events-none absolute text-[10px] font-medium tabular-nums text-text-secondary"
            style={{
              top: `${pos.y}%`,
              left: `${pos.x}%`,
              transform: "translate(-50%, -50%)",
              opacity: entered ? 1 : 0,
              transition: `opacity 0.5s var(--ease-out-soft) ${0.4 + i * 0.06}s`,
            }}
          >
            {METRIC_LABELS[key]}
          </span>
        );
      })}
    </div>
  );
}
