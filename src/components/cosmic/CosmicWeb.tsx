import { useMemo, useState } from "react";
import { CosmicCore } from "./CosmicCore";
import { ProviderHub } from "./ProviderHub";
import { ClusterStar } from "./ClusterStar";
import { Filament } from "./Filament";
import { DetailPanel } from "./DetailPanel";
import { ClusterDetailView } from "./ClusterDetailView";
import { ProviderDetailView } from "./ProviderDetailView";
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

/**
 * A single source of truth for what the user is looking at. Collapsing
 * hub + cluster focus into one discriminated union means selecting a
 * star in provider B automatically clears a prior selection on hub A —
 * you can't be focused on two things at once.
 */
type Selection =
  | { type: "provider"; providerId: ProviderId }
  | { type: "cluster"; cluster: Cluster };

const CORNER_ORDER: ProviderId[] = ["aws", "azure", "gcp", "on-prem"];

export function CosmicWeb({ providers, onClusterFocus }: CosmicWebProps) {
  const [selection, setSelection] = useState<Selection | null>(null);

  const byId = useMemo(
    () => new Map(providers.map((p) => [p.id, p])),
    [providers],
  );

  const starsByProvider = useMemo(() => {
    const map = new Map<
      ProviderId,
      Array<{ cluster: Cluster; pos: ReturnType<typeof clusterPosition> }>
    >();
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

  // ---- Derived selection helpers --------------------------------------
  const selectedCluster: Cluster | null =
    selection?.type === "cluster" ? selection.cluster : null;

  /** The "in focus" provider — either directly selected or owner of the selected cluster. */
  const focusedProviderId: ProviderId | null =
    selection?.type === "provider"
      ? selection.providerId
      : selection?.type === "cluster"
        ? selection.cluster.provider
        : null;

  /** True iff this hub was itself clicked (as opposed to owning a selected cluster). */
  const isHubDirectlySelected = (id: ProviderId) =>
    selection?.type === "provider" && selection.providerId === id;

  const hubIsActive = (id: ProviderId) => focusedProviderId === id;
  const hubIsDim = (id: ProviderId) =>
    selection !== null && focusedProviderId !== id;

  // ---- Handlers -------------------------------------------------------
  const handleHubSelect = (id: ProviderId) => {
    setSelection((curr) => {
      if (curr?.type === "provider" && curr.providerId === id) return null;
      return { type: "provider", providerId: id };
    });
    onClusterFocus?.(null);
  };

  const handleStarSelect = (cluster: Cluster) => {
    setSelection((curr) => {
      if (curr?.type === "cluster" && curr.cluster.id === cluster.id) {
        onClusterFocus?.(null);
        return null;
      }
      onClusterFocus?.(cluster);
      return { type: "cluster", cluster };
    });
  };

  const handleClosePanel = () => {
    setSelection(null);
    onClusterFocus?.(null);
  };

  // ---- Panel content --------------------------------------------------
  const panelProvider = focusedProviderId ? byId.get(focusedProviderId) ?? null : null;
  const panelOpen = selection !== null;
  const panelTitle = selectedCluster
    ? selectedCluster.name
    : panelProvider
      ? panelProvider.label
      : "";

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
        {/* Core → hub: brighten when the hub's lineage contains the selection. */}
        {CORNER_ORDER.map((id, i) => {
          const hub = PROVIDER_POSITION[id];
          const active = focusedProviderId === id;
          const dim = selection !== null && !active;
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

        {/* Hub → cluster: a direct hub selection lights every one of its
             filaments; a star selection lights only the path to that
             one cluster, leaving siblings dim. */}
        {CORNER_ORDER.flatMap((id) => {
          const hub = PROVIDER_POSITION[id];
          const hubDirect = isHubDirectlySelected(id);
          const stars = starsByProvider.get(id) ?? [];
          return stars.map(({ cluster, pos }, j) => {
            const clusterSelected = selectedCluster?.id === cluster.id;
            const active = hubDirect || clusterSelected;
            const dim = selection !== null && !active;
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

      <CosmicCore
        providers={providers}
        activeProvider={focusedProviderId}
        activeCluster={selectedCluster}
      />

      {CORNER_ORDER.map((id, i) => {
        const provider = byId.get(id);
        if (!provider) return null;
        return (
          <ProviderHub
            key={id}
            provider={provider}
            position={PROVIDER_POSITION[id]}
            active={hubIsActive(id)}
            dim={hubIsDim(id)}
            delay={0.55 + i * 0.1}
            onSelect={handleHubSelect}
          />
        );
      })}

      {CORNER_ORDER.flatMap((id, providerIndex) => {
        const stars = starsByProvider.get(id) ?? [];
        const hubDirect = isHubDirectlySelected(id);
        return stars.map(({ cluster, pos }, j) => {
          const isActive = selectedCluster?.id === cluster.id;
          // Star is dim when *something else* holds the focus. A hub
          // selection still counts its own stars as bright; a star
          // selection leaves only that one star bright.
          let dim = false;
          if (selection !== null && !isActive) {
            if (selectedCluster) dim = true;
            else if (!hubDirect) dim = true;
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

      <DetailPanel
        open={panelOpen}
        onClose={handleClosePanel}
        title={panelTitle}
      >
        {selectedCluster ? (
          <ClusterDetailView
            cluster={selectedCluster}
            provider={panelProvider ?? undefined}
          />
        ) : panelProvider ? (
          <ProviderDetailView provider={panelProvider} />
        ) : null}
      </DetailPanel>
    </div>
  );
}
