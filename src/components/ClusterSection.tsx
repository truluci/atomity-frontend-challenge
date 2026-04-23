import { useClusters } from "@/hooks/useClusters";
import { TopologyLayout } from "./TopologyLayout";

export function ClusterSection() {
  const { data, isLoading, isError, refetch } = useClusters();

  return (
    <section
      aria-labelledby="cluster-heading"
      className="relative mx-auto w-full max-w-6xl px-[clamp(1rem,4vw,2rem)] py-[clamp(4rem,10vw,8rem)]"
    >
      <header className="mb-[clamp(2.5rem,4vw,4rem)] max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent-primary-strong">
          Multi-cloud inventory
        </p>
        <h2
          id="cluster-heading"
          className="mt-3 font-semibold tracking-tight text-text-primary text-[clamp(2rem,1.2rem_+_2.5vw,3.25rem)] leading-[1.08]"
        >
          Every cluster, every cloud — one view.
        </h2>
        <p className="mt-4 text-text-secondary text-[clamp(1rem,0.9rem_+_0.3vw,1.125rem)]">
          Atomity reads usage and request signals from each workload you run
          across AWS, Azure, Google Cloud, and on-premise clusters — then
          surfaces the savings hiding inside over-provisioned pods.
        </p>
      </header>

      {isLoading && <TopologySkeleton />}

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

      {data && <TopologyLayout providers={data} />}
    </section>
  );
}

function TopologySkeleton() {
  return (
    <div
      aria-hidden
      className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-[1fr_minmax(0,22rem)_1fr] md:gap-x-12 md:gap-y-16"
    >
      <div className="h-40 animate-pulse rounded-[var(--radius-lg)] bg-bg-muted md:col-start-1" />
      <div className="h-40 animate-pulse rounded-[var(--radius-lg)] bg-bg-muted md:col-start-3" />
      <div className="order-first col-span-2 h-56 animate-pulse rounded-[var(--radius-xl)] bg-bg-muted md:order-none md:col-start-2 md:row-start-2" />
      <div className="h-40 animate-pulse rounded-[var(--radius-lg)] bg-bg-muted md:col-start-1 md:row-start-3" />
      <div className="h-40 animate-pulse rounded-[var(--radius-lg)] bg-bg-muted md:col-start-3 md:row-start-3" />
    </div>
  );
}
