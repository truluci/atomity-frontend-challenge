import { useState } from "react";
import { motion, type Variants } from "framer-motion";
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
const CORNER_PLACEMENT: Record<
  ProviderId,
  { cls: string; lineFrom: { x: number; y: number }; entry: { x: number; y: number } }
> = {
  aws: {
    cls: "md:col-start-1 md:row-start-1 md:justify-self-end",
    lineFrom: { x: 22, y: 22 },
    entry: { x: -24, y: -18 },
  },
  azure: {
    cls: "md:col-start-3 md:row-start-1 md:justify-self-start",
    lineFrom: { x: 78, y: 22 },
    entry: { x: 24, y: -18 },
  },
  gcp: {
    cls: "md:col-start-1 md:row-start-3 md:justify-self-end",
    lineFrom: { x: 22, y: 78 },
    entry: { x: -24, y: 18 },
  },
  "on-prem": {
    cls: "md:col-start-3 md:row-start-3 md:justify-self-start",
    lineFrom: { x: 78, y: 78 },
    entry: { x: 24, y: 18 },
  },
};

const stage: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.1, staggerChildren: 0.08 } },
};

const providerVariant: Variants = {
  hidden: ({ x, y }: { x: number; y: number }) => ({
    opacity: 0,
    x,
    y,
    scale: 0.92,
  }),
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const chartSlotVariant: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const lineGroupVariant: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.55, staggerChildren: 0.08 } },
};

const lineVariant: Variants = {
  hidden: { x1: 50, y1: 50, opacity: 0 },
  visible: ({ x, y }: { x: number; y: number }) => ({
    x1: x,
    y1: y,
    opacity: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function TopologyLayout({ providers }: TopologyLayoutProps) {
  const [activeProvider, setActiveProvider] = useState<ProviderId | null>(null);

  const byId = new Map(providers.map((p) => [p.id, p]));

  const handleSelect = (id: ProviderId) => {
    setActiveProvider((current) => (current === id ? null : id));
  };

  return (
    <motion.div
      className="relative grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-[1fr_minmax(0,22rem)_1fr] md:grid-rows-[auto_auto_auto] md:gap-x-12 md:gap-y-16"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={stage}
    >
      <motion.svg
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden size-full md:block"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        variants={lineGroupVariant}
      >
        {CORNER_ORDER.map((id) => {
          const { lineFrom } = CORNER_PLACEMENT[id];
          const isActive = activeProvider === id;
          return (
            <motion.line
              key={id}
              custom={lineFrom}
              variants={lineVariant}
              x2={50}
              y2={50}
              stroke={isActive ? tokens.color.accentPrimaryStrong : tokens.color.accentPrimary}
              strokeWidth={isActive ? 2 : 1.25}
              strokeDasharray="0.6 2"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              style={{
                transition:
                  "stroke 0.3s var(--ease-out-soft), stroke-width 0.3s var(--ease-out-soft)",
              }}
            />
          );
        })}
      </motion.svg>

      {CORNER_ORDER.map((id) => {
        const provider = byId.get(id);
        if (!provider) return null;
        const { cls, entry } = CORNER_PLACEMENT[id];
        return (
          <motion.div
            key={id}
            className={cls}
            custom={entry}
            variants={providerVariant}
          >
            <ProviderNode
              provider={provider}
              isActive={activeProvider === id}
              onSelect={handleSelect}
            />
          </motion.div>
        );
      })}

      <motion.div
        className="order-first col-span-2 md:order-none md:col-span-1 md:col-start-2 md:row-start-2 md:self-center"
        variants={chartSlotVariant}
      >
        <TopologyChart providers={providers} activeProvider={activeProvider} />
      </motion.div>
    </motion.div>
  );
}
