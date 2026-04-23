import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface DetailPanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/**
 * Right-edge slide-in panel — not a full modal, because the cosmic web
 * stays interactive while it's open (click another star and the
 * contents swap). ESC closes, focus is moved into the panel on open
 * for keyboard users.
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
    panelRef.current?.focus();
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          ref={panelRef}
          role="dialog"
          aria-label={title}
          tabIndex={-1}
          className="fixed right-4 top-4 bottom-4 z-50 flex w-[24rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[var(--radius-xl)] border border-border-subtle bg-bg-elevated shadow-[0_20px_60px_rgba(0,0,0,0.6)] focus-visible:outline-none"
          initial={{ x: "calc(100% + 2rem)", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "calc(100% + 2rem)", opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close detail panel"
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-bg-muted hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary-strong"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden
            >
              <path
                d="M1 1L13 13M13 1L1 13"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-8">{children}</div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
