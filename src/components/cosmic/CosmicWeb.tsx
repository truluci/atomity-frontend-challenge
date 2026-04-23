import { useMemo, useState } from "react";
import { CosmicCore } from "./CosmicCore";
import { ProviderHub } from "./ProviderHub";
import { ClusterStar } from "./ClusterStar";
import { Filament } from "./Filament";
import {
  CORE_POSITION,
  PROVIDER_POSITION,
  clusterPosition,
} from "@/lib/cosmicGeometry";
import type { Cluster, Provider, ProviderId } from "@/lib/types";

interface CosmicWebProps {
  providers: Provider[];
  onClusterFocus?: (cluster: Cluster | null) => void;
}

const CORNER_ORDER: ProviderId[] = ["aws", "azure", "gcp", "on-prem"];

export function CosmicWeb({ providers, onClusterFocus }: CosmicWebProps) {
  const [activeProvider, setActiveProvider] = useState<ProviderId | null>(null);
  const [activeCluster, setActiveCluster] = useState<Cluster | null>(null);

  const byId = useMemo(
    () => new Map(providers.map((p) => [p.id, p])),
    [providers],
  );

  /** Precompute each cluster's position once per data change. */
  const starsByProvider = useMemo(() => {
    const map = new Map<ProviderId, Array<{ cluster: Cluster; pos: ReturnType<typeof clusterPosition> }>>();
    for (const id of CORNER_ORDER) {
      const p = byId.get(id);
      if (!p) continue;
      const hub = PROVIDER_POSITION[id];
      const total = p.clusters.length;
      map.set(
        id,
        p.clusters.map((c, i) => ({
          cluster: c,
          pos: clusterPosition(c, hub, i, total),
        })),
      );
    }
    return map;
  }, [byId]);

  const handleHubSelect = (id: ProviderId) => {
    setActiveProvider((curr) => (curr === id ? null : id));
    setActiveCluster(null);
    onClusterFocus?.(null);
  };

  const handleStarSelect = (cluster: Cluster) => {
    setActiveCluster((curr) => (curr?.id === cluster.id ? null : cluster));
    onClusterFocus?.(activeCluster?.id === cluster.id ? null : cluster);
  };

  const anySelection = activeProvider !== null || activeCluster !== null;

  const isProviderDim = (id: ProviderId) => {
    if (!anySelection) return false;
    if (activeProvider === id) return false;
    if (activeCluster?.provider === id) return false;
    return true;
  };

  return (
    <div
      className="relative w-full"
      style={{
        aspectRatio: "5 / 4",
        containerType: "inline-size",
      }}
    >
      {/* Filament layer — behind hubs/stars, above the page backdrop. */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Core → hub filaments. Active when either the hub or any of
             its clusters is the current selection, so a star click
             illuminates the full path back to the core. */}
        {CORNER_ORDER.map((id, i) => {
          const hub = PROVIDER_POSITION[id];
          const hubSelected = activeProvider === id;
          const starSelected = activeCluster?.provider === id;
          const active = hubSelected || starSelected;
          const dim = anySelection && !active;
          return (
            <Filament
              key={`core-${id}`}
              from={CORE_POSITION}
              to={hub}
              curve={5}
              active={active}
              dim={dim}
              delay={0.35 + i * 0.08}
              density="dense"
              flowDuration={active ? 3.2 : 7}
            />
          );
        })}

        {/* Hub → cluster filaments. The specific filament to the active
             star is emphasized; its siblings fade, so a single route
             stands out through the whole web. */}
        {CORNER_ORDER.flatMap((id) => {
          const hub = PROVIDER_POSITION[id];
          const providerActive = activeProvider === id;
          const stars = starsByProvider.get(id) ?? [];
          return stars.map(({ cluster, pos }, j) => {
            const clusterActive = activeCluster?.id === cluster.id;
            const active = providerActive || clusterActive;
            const dim = anySelection && !active;
            return (
              <Filament
                key={`hub-${id}-${cluster.id}`}
                from={hub}
                to={pos}
                curve={1.5}
                active={active}
                dim={dim}
                delay={0.85 + j * 0.025}
                density="sparse"
                flowDuration={dim ? 10 : active ? 4 : 6}
              />
            );
          });
        })}
      </svg>

      <CosmicCore providers={providers} activeProvider={activeProvider} />

      {CORNER_ORDER.map((id, i) => {
        const provider = byId.get(id);
        if (!provider) return null;
        return (
          <ProviderHub
            key={id}
            provider={provider}
            position={PROVIDER_POSITION[id]}
            active={activeProvider === id}
            dim={isProviderDim(id)}
            delay={0.55 + i * 0.1}
            onSelect={handleHubSelect}
          />
        );
      })}

      {CORNER_ORDER.flatMap((id, providerIndex) => {
        const stars = starsByProvider.get(id) ?? [];
        return stars.map(({ cluster, pos }, j) => {
          const isActive = activeCluster?.id === cluster.id;
          // A star is dim if *something* is selected and it isn't the
          // focus: another provider is active, or another star is.
          let dim = false;
          if (anySelection && !isActive) {
            if (activeCluster) dim = true;
            else if (activeProvider !== id) dim = true;
          }
          return (
            <ClusterStar
              key={cluster.id}
              cluster={cluster}
              position={pos}
              active={isActive}
              dim={dim}
              delay={1 + providerIndex * 0.04 + j * 0.035}
              onSelect={handleStarSelect}
            />
          );
        });
      })}
    </div>
  );
}
