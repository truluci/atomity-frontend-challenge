import { useClusterDetail } from "@/hooks/useClusterDetail";
import { AnimatedNumber } from "../AnimatedNumber";
import { tokens } from "@/tokens";
import type { Cluster, MetricKey, Provider } from "@/lib/types";

interface ClusterDetailViewProps {
  cluster: Cluster;
  provider?: Provider;
}

const METRIC_LABEL: Record<MetricKey, string> = {
  cpu: "CPU",
  gpu: "GPU",
  ram: "RAM",
  pv: "PV",
  network: "Network",
  cloud: "Cloud",
};

const relativeTimeFmt = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
function relativeFromIso(iso: string): string {
  const mins = Math.round((Date.parse(iso) - Date.now()) / 60_000);
  if (Math.abs(mins) < 60) return relativeTimeFmt.format(mins, "minute");
  const hours = Math.round(mins / 60);
  if (Math.abs(hours) < 24) return relativeTimeFmt.format(hours, "hour");
  return relativeTimeFmt.format(Math.round(hours / 24), "day");
}

export function ClusterDetailView({ cluster, provider }: ClusterDetailViewProps) {
  const { data: detail, isLoading, isError } = useClusterDetail(cluster.id);

  const utilization = Math.min(
    100,
    Math.round((cluster.cpuUsageMillicores / cluster.cpuRequestMillicores) * 100),
  );

  return (
    <div className="space-y-6 text-text-primary">
      <header>
        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-accent-primary">
          <span className="block h-1.5 w-1.5 rounded-full bg-accent-primary" />
          {provider?.label ?? cluster.provider}
        </div>
        <h3 className="mt-2 pr-8 text-lg font-semibold leading-tight">
          {cluster.name}
        </h3>
        {detail && (
          <p className="mt-1 text-xs text-text-muted tabular-nums">
            {detail.nodeCount} nodes · {detail.region} · last scanned{" "}
            {relativeFromIso(detail.lastScanned)}
          </p>
        )}
        {isLoading && !detail && (
          <p className="mt-1 text-xs text-text-muted">Loading metadata…</p>
        )}
        {isError && (
          <p className="mt-1 text-xs text-accent-error">
            Metadata couldn't be loaded.
          </p>
        )}
      </header>

      <section className="rounded-[var(--radius-lg)] border border-border-subtle bg-bg-muted p-4">
        <div className="flex items-baseline justify-between">
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-accent-primary-strong">
            Estimated savings
          </div>
          <div className="text-[10px] tabular-nums text-text-muted">
            {utilization}% utilized
          </div>
        </div>
        <div className="mt-1 font-semibold tabular-nums text-accent-primary text-[clamp(1.5rem,2.4vw,1.9rem)] leading-[1]">
          <AnimatedNumber
            value={cluster.estimatedMonthlySavingsUsd}
            format={(v) => `$${v.toFixed(1)}`}
          />
          <span className="ml-1 text-xs font-medium text-text-secondary">/mo</span>
        </div>
      </section>

      <section>
        <h4 className="text-[10px] font-medium uppercase tracking-[0.14em] text-text-secondary">
          Resource Utilization
        </h4>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
          <div>
            <dt className="text-[11px] text-text-muted">CPU Usage</dt>
            <dd className="text-sm font-medium tabular-nums">
              {cluster.cpuUsageMillicores} m
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-text-muted">CPU Request</dt>
            <dd className="text-sm font-medium tabular-nums">
              {cluster.cpuRequestMillicores} m
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-text-muted">Memory Usage</dt>
            <dd className="text-sm font-medium tabular-nums">
              {cluster.memoryUsageMib} MiB
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-text-muted">Memory Request</dt>
            <dd className="text-sm font-medium tabular-nums">
              {cluster.memoryRequestGib} GiB
            </dd>
          </div>
        </dl>
      </section>

      <section>
        <h4 className="text-[10px] font-medium uppercase tracking-[0.14em] text-text-secondary">
          Metric Breakdown
        </h4>
        <ul className="mt-3 space-y-2">
          {(Object.entries(cluster.metrics) as [MetricKey, number][]).map(([key, value]) => (
            <li key={key} className="flex items-center gap-3">
              <span className="w-14 text-[11px] font-medium text-text-secondary">
                {METRIC_LABEL[key]}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-muted">
                <div
                  className="h-full rounded-full"
                  style={{
                    inlineSize: `${value}%`,
                    backgroundColor: tokens.color.accentPrimary,
                    transition: "inline-size 0.5s var(--ease-out-soft)",
                  }}
                />
              </div>
              <span className="w-9 text-right text-[11px] tabular-nums text-text-primary">
                {value}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {detail?.description && (
        <section>
          <h4 className="text-[10px] font-medium uppercase tracking-[0.14em] text-text-secondary">
            Workload
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            {detail.description}
          </p>
        </section>
      )}

      {detail && detail.tags.length > 0 && (
        <section>
          <h4 className="text-[10px] font-medium uppercase tracking-[0.14em] text-text-secondary">
            Labels
          </h4>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {detail.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-border-subtle bg-bg-muted px-2 py-0.5 text-[11px] text-text-primary"
              >
                {t}
              </span>
            ))}
          </div>
        </section>
      )}

      {detail?.notes && (
        <section>
          <h4 className="text-[10px] font-medium uppercase tracking-[0.14em] text-text-secondary">
            Recommendation
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            {detail.notes}
          </p>
        </section>
      )}
    </div>
  );
}
