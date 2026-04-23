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
