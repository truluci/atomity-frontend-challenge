import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Point } from "@/lib/cosmicGeometry";

interface DetailPanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** When provided, the panel is absolutely positioned inside its
   *  containing block (in 0..100 % coords) and pops up below the anchor
   *  point — used to anchor the panel under the clicked star/hub. */
  anchor?: Point;
}

/**
 * Inline detail panel. Rendered either in the normal document flow
 * (stacked layout) or as a popover anchored below the clicked star/hub
 * (radial layout) — never as a fixed overlay, so the cosmic web stays
 * visible while the user reads the details.
 */
export function DetailPanel({ open, onClose, title, children, anchor }: DetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || anchor) return;
    const el = panelRef.current;
    if (!el) return;
    // `preventScroll` so the focus() call doesn't jerk-scroll — we do a
    // smooth scrollIntoView instead. Skip when anchored: the panel
    // pops up next to the click, which is already in view.
    el.focus({ preventScroll: true });
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [open, anchor]);

  // Anchored mode: 20rem wide, centered horizontally on the anchor with
  // CSS clamp so the panel never overflows its container, popping below
  // the star with a small gap. % values resolve against the same 0..100
  // coordinate system the stars/hubs use.
  const anchoredStyle = anchor
    ? ({
        position: "absolute" as const,
        top: `calc(${anchor.y}% + 1.5rem)`,
        left: `clamp(0.5rem, calc(${anchor.x}% - 10rem), calc(100% - 20rem - 0.5rem))`,
        inlineSize: "20rem",
        zIndex: 30,
        transformOrigin: "50% 0%",
      } as const)
    : undefined;

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.aside
          ref={panelRef}
          role="region"
          aria-label={title}
          tabIndex={-1}
          className={
            anchor
              ? "flex flex-col overflow-hidden rounded-[var(--radius-xl)] border border-border-subtle bg-bg-elevated shadow-[0_18px_56px_-18px_color-mix(in_oklab,var(--color-cosmic-accent)_44%,transparent)] focus-visible:outline-none"
              : "relative flex w-full flex-col overflow-hidden rounded-[var(--radius-xl)] border border-border-subtle bg-bg-elevated shadow-[0_12px_40px_-18px_color-mix(in_oklab,var(--color-cosmic-accent)_32%,transparent)] focus-visible:outline-none"
          }
          style={anchoredStyle}
          initial={anchor ? { opacity: 0, scale: 0.92, y: -8 } : { opacity: 0, x: 24 }}
          animate={anchor ? { opacity: 1, scale: 1, y: 0 } : { opacity: 1, x: 0 }}
          exit={anchor ? { opacity: 0, scale: 0.94, y: -6 } : { opacity: 0, x: 24 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close detail panel"
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-bg-muted hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary-strong"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M1 1L13 13M13 1L1 13"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <div className="flex-1 px-6 pb-6 pt-8">
            {children}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
