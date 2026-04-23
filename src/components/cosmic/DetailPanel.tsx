import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface DetailPanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/**
 * Edge-of-viewport panel. Slides from the right as a full-height drawer
 * on sm+; on narrower viewports it becomes a bottom sheet that only
 * occupies the lower ~85% of the screen, keeping part of the web
 * visible so the user hasn't "lost" the context they clicked from.
 */
export function DetailPanel({ open, onClose, title, children }: DetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery("(min-width: 640px)");

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

  const initial = isDesktop
    ? { x: "calc(100% + 2rem)", opacity: 0 }
    : { y: "100%", opacity: 0 };
  const exit = initial;

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          ref={panelRef}
          role="dialog"
          aria-label={title}
          tabIndex={-1}
          className="fixed z-50 flex flex-col overflow-hidden border border-border-subtle bg-bg-elevated shadow-[0_20px_60px_rgba(0,0,0,0.6)] focus-visible:outline-none
            inset-x-0 bottom-0 max-h-[85vh] rounded-t-[var(--radius-xl)]
            sm:inset-x-auto sm:bottom-4 sm:right-4 sm:top-4 sm:max-h-none sm:w-[24rem] sm:max-w-[calc(100vw-2rem)] sm:rounded-[var(--radius-xl)]"
          initial={initial}
          animate={{ x: 0, y: 0, opacity: 1 }}
          exit={exit}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Grab affordance — mobile only */}
          <div
            aria-hidden
            className="flex justify-center pt-2 sm:hidden"
          >
            <span className="block h-1 w-10 rounded-full bg-border-strong" />
          </div>

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

          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-6 sm:pt-8">
            {children}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
