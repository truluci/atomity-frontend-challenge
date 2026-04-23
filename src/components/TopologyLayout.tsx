import { useState } from "react";
import { ProviderNode } from "./ProviderNode";
import { TopologyChart } from "./TopologyChart";
import { tokens } from "@/tokens";
import type { Provider, ProviderId } from "@/lib/types";

interface TopologyLayoutProps {
  providers: Provider[];
}

/** Fixed ordering so the four corners always render in the same slots. */
const CORNER_ORDER: ProviderId[] = ["aws", "azure", "gcp", "on-prem"];

/** Each provider's grid cell + the relative origin for its connector line. */
const CORNER_PLACEMENT: Record<ProviderId, { cls: string; lineFrom: { x: number; y: number } }> = {
  aws: { cls: "md:col-start-1 md:row-start-1 md:justify-self-end", lineFrom: { x: 22, y: 22 } },
  azure: { cls: "md:col-start-3 md:row-start-1 md:justify-self-start", lineFrom: { x: 78, y: 22 } },
  gcp: { cls: "md:col-start-1 md:row-start-3 md:justify-self-end", lineFrom: { x: 22, y: 78 } },
  "on-prem": { cls: "md:col-start-3 md:row-start-3 md:justify-self-start", lineFrom: { x: 78, y: 78 } },
};

export function TopologyLayout({ providers }: TopologyLayoutProps) {
  const [activeProvider, setActiveProvider] = useState<ProviderId | null>(null);

  const byId = new Map(providers.map((p) => [p.id, p]));

  const handleSelect = (id: ProviderId) => {
    setActiveProvider((current) => (current === id ? null : id));
  };

  return (
    <div
      className="relative grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-[1fr_minmax(0,22rem)_1fr] md:grid-rows-[auto_auto_auto] md:gap-x-12 md:gap-y-16"
    >
      {/* Connector layer — decorative, desktop only */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden size-full md:block"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {CORNER_ORDER.map((id) => {
          const { lineFrom } = CORNER_PLACEMENT[id];
          const isActive = activeProvider === id;
          return (
            <line
              key={id}
              x1={lineFrom.x}
              y1={lineFrom.y}
              x2={50}
              y2={50}
              stroke={isActive ? tokens.color.accentPrimaryStrong : tokens.color.accentPrimary}
              strokeWidth={isActive ? 2 : 1.25}
              strokeDasharray="0.6 2"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              style={{
                transition: "stroke 0.3s var(--ease-out-soft), stroke-width 0.3s var(--ease-out-soft)",
              }}
            />
          );
        })}
      </svg>

      {CORNER_ORDER.map((id) => {
        const provider = byId.get(id);
        if (!provider) return null;
        return (
          <div key={id} className={CORNER_PLACEMENT[id].cls}>
            <ProviderNode
              provider={provider}
              isActive={activeProvider === id}
              onSelect={handleSelect}
            />
          </div>
        );
      })}

      <div className="order-first col-span-2 md:order-none md:col-span-1 md:col-start-2 md:row-start-2 md:self-center">
        <TopologyChart providers={providers} activeProvider={activeProvider} />
      </div>
    </div>
  );
}
