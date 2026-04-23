export type ProviderId = "aws" | "azure" | "gcp" | "on-prem";

export type MetricKey = "cpu" | "gpu" | "ram" | "pv" | "network" | "cloud";

export interface Cluster {
  id: string;
  name: string;
  provider: ProviderId;
  cpuUsageMillicores: number;
  cpuRequestMillicores: number;
  memoryUsageMib: number;
  memoryRequestGib: number;
  estimatedMonthlySavingsUsd: number;
  metrics: Record<MetricKey, number>;
}

export interface Provider {
  id: ProviderId;
  label: string;
  clusters: Cluster[];
}

/**
 * Extra fields fetched on demand when a cluster is selected — kept
 * separate from `Cluster` so the list query stays lean and the detail
 * query is cached independently per id.
 */
export interface ClusterDetail {
  id: string;
  description: string;
  tags: string[];
  category: string;
  region: string;
  nodeCount: number;
  notes: string;
  lastScanned: string;
}
