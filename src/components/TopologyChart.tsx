import { useMemo } from "react";
import { tokens } from "@/tokens";
import type { MetricKey, Provider, ProviderId } from "@/lib/types";

interface TopologyChartProps {
  providers: Provider[];
  activeProvider?: ProviderId | null;
}

const METRIC_LABELS: Record<MetricKey, string> = {
  cpu: "CPU",
  gpu: "GPU",
  ram: "RAM",
  pv: "PV",
  network: "Network",
  cloud: "Cloud",
};

const METRIC_ORDER: MetricKey[] = ["cpu", "gpu", "ram", "pv", "network", "cloud"];

export function TopologyChart({ providers, activeProvider = null }: TopologyChartProps) {
  const metricValues = useMemo(() => {
    const clusters = providers
      .filter((p) => !activeProvider || p.id === activeProvider)
      .flatMap((p) => p.clusters);

    if (clusters.length === 0) {
      return METRIC_ORDER.map((key) => ({ key, value: 0 }));
    }

    return METRIC_ORDER.map((key) => {
      const avg =
        clusters.reduce((sum, c) => sum + c.metrics[key], 0) / clusters.length;
      return { key, value: Math.round(avg) };
    });
  }, [providers, activeProvider]);

  const max = Math.max(...metricValues.map((m) => m.value), 1);

  return (
    <div
      className="@container relative mx-auto flex w-full max-w-md flex-col gap-3 rounded-[var(--radius-xl)] border border-border-subtle bg-bg-elevated p-[clamp(1rem,4cqi,1.75rem)] shadow-[0_8px_32px_rgba(15,23,42,0.06)] @xs:gap-4"
      aria-label="Aggregate resource usage across selected providers"
    >
      <div className="flex h-28 items-end justify-between gap-1.5 px-1 @xs:h-36 @xs:gap-2.5 @md:h-40 @md:gap-3">
        {metricValues.map(({ key, value }) => {
          const pct = Math.max(6, (value / max) * 100);
          return (
            <div
              key={key}
              className="flex flex-1 flex-col items-center justify-end gap-2"
            >
              <div
                role="img"
                aria-label={`${METRIC_LABELS[key]}: ${value}`}
                className="w-full rounded-t-[var(--radius-sm)]"
                style={{
                  blockSize: `${pct}%`,
                  backgroundColor: tokens.color.accentPrimary,
                  transition: "block-size 0.6s var(--ease-out-soft)",
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-between gap-1.5 px-1 text-[10px] font-medium text-text-secondary @xs:gap-2.5 @xs:text-[11px] @md:gap-3 @md:text-[12px]">
        {metricValues.map(({ key }) => (
          <span key={key} className="flex-1 text-center">
            {METRIC_LABELS[key]}
          </span>
        ))}
      </div>
    </div>
  );
}
