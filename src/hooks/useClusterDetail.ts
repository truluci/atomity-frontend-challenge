import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { productToClusterDetail, type DummyProductFull } from "@/lib/mappers";
import type { ClusterDetail } from "@/lib/types";

/**
 * Fetches per-cluster detail from `/products/{id}`. Each id gets its own
 * cache entry, so re-opening the same cluster is instant and re-opening
 * a different one triggers a fresh fetch with a loading state.
 */
export function useClusterDetail(clusterId: string | null) {
  return useQuery<ClusterDetail>({
    queryKey: ["clusterDetail", clusterId],
    queryFn: async () => {
      const data = await apiFetch<DummyProductFull>(`/products/${clusterId}`);
      return productToClusterDetail(data);
    },
    enabled: clusterId !== null,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
