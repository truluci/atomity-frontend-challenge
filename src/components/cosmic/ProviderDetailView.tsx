import { useMemo } from "react";
import { AnimatedNumber } from "../AnimatedNumber";
import { tokens } from "@/tokens";
import type { MetricKey, Provider } from "@/lib/types";

interface ProviderDetailViewProps {
  provider: Provider;
}

const METRIC_LABEL: Record<MetricKey, string> = {
  cpu: "CPU",
  gpu: "GPU",
  ram: "RAM",
  pv: "PV",
  network: "Network",
  cloud: "Cloud",
};
const METRIC_ORDER: MetricKey[] = ["cpu", "gpu", "ram", "pv", "network", "cloud"];

export function ProviderDetailView({ provider }: ProviderDetailViewProps) {
  const stats = useMemo(() => {
    const clusters = provider.clusters;
    const totalSavings = clusters.reduce(
      (sum, c) => sum + c.estimatedMonthlySavingsUsd,
      0,
    );
    const avgUtil =
      clusters.length === 0
        ? 0
        : Math.round(
            clusters.reduce(
              (sum, c) =>
                sum + (c.cpuUsageMillicores / c.cpuRequestMillicores) * 100,
              0,
            ) / clusters.length,
          );
    const metrics = METRIC_ORDER.map((key) => {
      const avg =
        clusters.length === 0
          ? 0
          : Math.round(
              clusters.reduce((sum, c) => sum + c.metrics[key], 0) /
                clusters.length,
            );
      return { key, avg };
    });
    const topClusters = [...clusters]
      .sort((a, b) => b.estimatedMonthlySavingsUsd - a.estimatedMonthlySavingsUsd)
      .slice(0, 5);
    return { totalSavings, avgUtil, metrics, topClusters };
  }, [provider]);

  return (
    <div className="space-y-6 text-text-primary">
      <header>
        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-accent-primary">
          <span className="block h-1.5 w-1.5 rounded-full bg-accent-primary" />
          Provider
        </div>
        <h3 className="mt-2 pr-8 text-lg font-semibold leading-tight">
          {provider.label}
        </h3>
        <p className="mt-1 text-xs text-text-muted tabular-nums">
          {provider.clusters.length} clusters
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-bg-muted p-3">
          <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-text-secondary">
            Savings
          </div>
          <div className="mt-1 font-semibold tabular-nums text-accent-primary text-lg leading-none">
            <AnimatedNumber
              value={stats.totalSavings}
              format={(v) => `$${Math.round(v)}`}
            />
            <span className="ml-1 text-[10px] text-text-secondary">/mo</span>
          </div>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-bg-muted p-3">
          <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-text-secondary">
            Avg Utilization
          </div>
          <div className="mt-1 text-lg font-semibold tabular-nums leading-none">
            <AnimatedNumber value={stats.avgUtil} />
            <span className="ml-0.5 text-[10px] text-text-secondary">%</span>
          </div>
        </div>
      </section>

      <section>
        <h4 className="text-[10px] font-medium uppercase tracking-[0.14em] text-text-secondary">
          Average Metric Usage
        </h4>
        <ul className="mt-3 space-y-2">
          {stats.metrics.map(({ key, avg }) => (
            <li key={key} className="flex items-center gap-3">
              <span className="w-14 text-[11px] font-medium text-text-secondary">
                {METRIC_LABEL[key]}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-muted">
                <div
                  className="h-full rounded-full"
                  style={{
                    inlineSize: `${avg}%`,
                    backgroundColor: tokens.color.accentPrimary,
                    transition: "inline-size 0.5s var(--ease-out-soft)",
                  }}
                />
              </div>
              <span className="w-9 text-right text-[11px] tabular-nums text-text-primary">
                {avg}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h4 className="text-[10px] font-medium uppercase tracking-[0.14em] text-text-secondary">
          Top Savings Candidates
        </h4>
        <ul className="mt-3 divide-y divide-border-subtle">
          {stats.topClusters.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-3 py-2 text-sm"
            >
              <span className="truncate" title={c.name}>
                {c.name}
              </span>
              <span className="flex-shrink-0 tabular-nums text-accent-primary">
                ${c.estimatedMonthlySavingsUsd.toFixed(1)}/mo
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
