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
import type { Point } from "@/lib/cosmicGeometry";
import { useMediaQuery } from "@/hooks/useMediaQuery";
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

/** Top-row hubs push their label upward so it doesn't collide with the
 *  arc of cluster stars that orbits toward the core. */
const HUB_LABEL_ABOVE: Record<ProviderId, boolean> = {
  aws: true,
  azure: true,
  gcp: false,
  "on-prem": false,
};

export function CosmicWeb({ providers, onClusterFocus }: CosmicWebProps) {
  const [selection, setSelection] = useState<Selection | null>(null);
  // Position the panel pops up below. Set on click; intentionally not
  // cleared on close so the exit animation has a stable origin.
  const [panelAnchor, setPanelAnchor] = useState<Point | null>(null);
  const isWide = useMediaQuery("(min-width: 640px)");

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

  const computeStarDim = (id: ProviderId, clusterId: string) => {
    if (selection === null) return false;
    if (selectedCluster?.id === clusterId) return false;
    if (selectedCluster) return true;
    if (!isHubDirectlySelected(id)) return true;
    return false;
  };

  // ---- Handlers -------------------------------------------------------
  const handleHubSelect = (id: ProviderId) => {
    setSelection((curr) => {
      if (curr?.type === "provider" && curr.providerId === id) return null;
      return { type: "provider", providerId: id };
    });
    setPanelAnchor(PROVIDER_POSITION[id]);
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
    const stars = starsByProvider.get(cluster.provider);
    const pos = stars?.find((s) => s.cluster.id === cluster.id)?.pos;
    if (pos) setPanelAnchor(pos);
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

  // Anchor for the popup panel: set whenever a star/hub is selected,
  // and intentionally NOT cleared on close so the exit animation has a
  // stable origin to shrink back into. `panelOpen` gates visibility.
  const renderAnchor = panelAnchor ?? undefined;

  const panelChildren = selectedCluster ? (
    <ClusterDetailView cluster={selectedCluster} provider={panelProvider ?? undefined} />
  ) : panelProvider ? (
    <ProviderDetailView provider={panelProvider} />
  ) : null;

  // ---- Canvas (web) ---------------------------------------------------
  // Stacked layout (< sm). Core centered at top; each hub with its stars
  // arranged in its own row. No filaments — the hierarchy is conveyed by
  // the layout itself.
  const stackedCanvas = (
    <div
      className="relative w-full"
      style={{ containerType: "inline-size" }}
    >
      <div className="flex flex-col items-stretch gap-10">
        <div className="flex justify-center pt-2">
          <CosmicCore
            providers={providers}
            activeProvider={focusedProviderId}
            activeCluster={selectedCluster}
            stacked
          />
        </div>

        {CORNER_ORDER.map((id, providerIndex) => {
          const provider = byId.get(id);
          if (!provider) return null;
          return (
            <section
              key={id}
              className="flex flex-col items-center gap-4"
              aria-label={`${provider.label} clusters`}
            >
              <ProviderHub
                provider={provider}
                active={hubIsActive(id)}
                dim={hubIsDim(id)}
                delay={0.2 + providerIndex * 0.08}
                onSelect={handleHubSelect}
              />

              <ul className="flex max-w-[min(22rem,90%)] flex-wrap items-center justify-center gap-1">
                {provider.clusters.map((cluster, j) => (
                  <li key={cluster.id} className="list-none">
                    <ClusterStar
                      cluster={cluster}
                      active={selectedCluster?.id === cluster.id}
                      dim={computeStarDim(id, cluster.id)}
                      delay={0.4 + providerIndex * 0.08 + j * 0.03}
                      onSelect={handleStarSelect}
                    />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );

  // Radial web (sm+). Original cosmic layout with filaments.
  const radialCanvas = (
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
            labelAbove={HUB_LABEL_ABOVE[id]}
            active={hubIsActive(id)}
            dim={hubIsDim(id)}
            delay={0.55 + i * 0.1}
            onSelect={handleHubSelect}
          />
        );
      })}

      {CORNER_ORDER.flatMap((id, providerIndex) => {
        const stars = starsByProvider.get(id) ?? [];
        return stars.map(({ cluster, pos }, j) => {
          return (
            <ClusterStar
              key={cluster.id}
              cluster={cluster}
              position={pos}
              active={selectedCluster?.id === cluster.id}
              dim={computeStarDim(id, cluster.id)}
              delay={1 + providerIndex * 0.04 + j * 0.035}
              onSelect={handleStarSelect}
            />
          );
        });
      })}

      {/* Anchored panel: pops up below the clicked star/hub, sharing the
           same 0..100 coord space as the rest of the radial layout. */}
      <DetailPanel
        open={panelOpen}
        onClose={handleClosePanel}
        title={panelTitle}
        anchor={renderAnchor}
      >
        {panelChildren}
      </DetailPanel>
    </div>
  );

  // ---- Layout ----------------------------------------------------------
  // • Radial (sm+): the panel is rendered inside the canvas, anchored
  //   below the clicked star/hub.
  // • Stacked (<sm): stars are already in vertical flow, so the panel
  //   stacks below the web in document order.
  if (isWide) {
    return <div className="relative w-full">{radialCanvas}</div>;
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="w-full">{stackedCanvas}</div>
      <div className="w-full">
        <DetailPanel open={panelOpen} onClose={handleClosePanel} title={panelTitle}>
          {panelChildren}
        </DetailPanel>
      </div>
    </div>
  );
}
