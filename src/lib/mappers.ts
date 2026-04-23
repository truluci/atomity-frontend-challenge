import type { Cluster, MetricKey, Provider, ProviderId } from "./types";

interface DummyProduct {
  id: number;
  title: string;
  price: number;
  stock: number;
  rating: number;
  weight?: number;
  minimumOrderQuantity?: number;
  warrantyInformation?: string;
}

const PROVIDER_IDS: ProviderId[] = ["aws", "azure", "gcp", "on-prem"];
const PROVIDER_LABELS: Record<ProviderId, string> = {
  aws: "AWS",
  azure: "Azure",
  gcp: "Google Cloud",
  "on-prem": "On-Premise",
};
const METRIC_KEYS: MetricKey[] = ["cpu", "gpu", "ram", "pv", "network", "cloud"];

/** Deterministic pseudo-random in [0, 1) from an integer seed. */
function seeded(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function productToCluster(p: DummyProduct, index: number): Cluster {
  const provider = PROVIDER_IDS[index % PROVIDER_IDS.length];
  const cpuUsage = Math.round(20 + seeded(p.id) * 180);
  const cpuRequest = Math.round(cpuUsage * (2 + seeded(p.id + 1) * 6));
  const memoryUsage = Math.round(256 + seeded(p.id + 2) * 1024);
  const memoryRequest = Math.round(memoryUsage * (1.8 + seeded(p.id + 3) * 4)) / 1024;
  const savings = Math.round((50 + seeded(p.id + 4) * 400) * 10) / 10;

  const metrics = METRIC_KEYS.reduce<Record<MetricKey, number>>((acc, key, i) => {
    acc[key] = Math.round(20 + seeded(p.id + 10 + i) * 80);
    return acc;
  }, {} as Record<MetricKey, number>);

  return {
    id: String(p.id),
    name: p.title,
    provider,
    cpuUsageMillicores: cpuUsage,
    cpuRequestMillicores: cpuRequest,
    memoryUsageMib: memoryUsage,
    memoryRequestGib: Math.max(1, Math.round(memoryRequest)),
    estimatedMonthlySavingsUsd: savings,
    metrics,
  };
}

export function productsToProviders(products: DummyProduct[]): Provider[] {
  const clusters = products.map(productToCluster);
  return PROVIDER_IDS.map((id) => ({
    id,
    label: PROVIDER_LABELS[id],
    clusters: clusters.filter((c) => c.provider === id),
  }));
}

export type { DummyProduct };
