import { motion, type Variants } from "framer-motion";
import { useClusters } from "@/hooks/useClusters";
import { CosmicWeb } from "./cosmic/CosmicWeb";

const headerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const headerChild: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export function ClusterSection() {
  const { data, isLoading, isError, refetch } = useClusters();

  return (
    <section
      aria-labelledby="cluster-heading"
      className="relative mx-auto w-full max-w-6xl px-[clamp(1rem,4vw,2rem)] py-[clamp(4rem,10vw,8rem)]"
    >
      <motion.header
        className="mb-[clamp(2.5rem,4vw,4rem)] max-w-2xl"
        variants={headerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
      >
        <motion.p
          variants={headerChild}
          className="text-sm font-medium uppercase tracking-[0.18em] text-accent-primary-strong"
        >
          Multi-cloud inventory
        </motion.p>
        <motion.h2
          id="cluster-heading"
          variants={headerChild}
          className="mt-3 font-semibold tracking-tight text-text-primary text-[clamp(2rem,1.2rem_+_2.5vw,3.25rem)] leading-[1.08]"
        >
          A cosmic web of clusters, across every cloud.
        </motion.h2>
        <motion.p
          variants={headerChild}
          className="mt-4 text-text-secondary text-[clamp(1rem,0.9rem_+_0.3vw,1.125rem)]"
        >
          Atomity maps every workload you run — AWS, Azure, Google Cloud,
          on-premise — into one living topology. Each star is a cluster;
          each filament, the resources flowing through it.
        </motion.p>
      </motion.header>

      {isLoading && <CosmicSkeleton />}

      {isError && (
        <div
          role="alert"
          className="rounded-[var(--radius-lg)] border border-border-subtle bg-bg-elevated p-6 text-sm"
        >
          <p className="text-accent-error">Couldn't reach the DummyJSON API.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 rounded-[var(--radius-sm)] border border-border-strong px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-bg-muted"
          >
            Retry
          </button>
        </div>
      )}

      {data && <CosmicWeb providers={data} />}
    </section>
  );
}

function CosmicSkeleton() {
  return (
    <div
      aria-hidden
      className="relative w-full"
      style={{ aspectRatio: "5 / 4" }}
    >
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse text-xs font-medium tracking-[0.24em] text-text-muted">
        MAPPING THE WEB…
      </div>
    </div>
  );
}
