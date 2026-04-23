import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface DetailPanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/**
 * Inline detail panel. Rendered in the normal document flow next to (or
 * below) the cosmic web — never as a fixed overlay — so hubs and stars
 * stay visible while the user reads the details.
 */
export function DetailPanel({ open, onClose, title, children }: DetailPanelProps) {
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
    if (!open) return;
    const el = panelRef.current;
    if (!el) return;
    // `preventScroll` so the focus() call doesn't jerk-scroll — we do a
    // smooth scrollIntoView instead. When the panel is already in view
    // (side-by-side on lg+), `block: "nearest"` is a no-op.
    el.focus({ preventScroll: true });
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [open]);

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.aside
          ref={panelRef}
          role="region"
          aria-label={title}
          tabIndex={-1}
          className="relative flex w-full flex-col overflow-hidden rounded-[var(--radius-xl)] border border-border-subtle bg-bg-elevated shadow-[0_12px_40px_-18px_color-mix(in_oklab,var(--color-cosmic-accent)_32%,transparent)] focus-visible:outline-none"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
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

          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-8">
            {children}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
