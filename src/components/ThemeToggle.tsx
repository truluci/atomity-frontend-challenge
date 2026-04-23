import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";

/**
 * Fixed corner button that swaps between light and dark. The icon shown
 * reflects the *destination* theme (moon while in light mode, sun while
 * in dark) so the affordance reads as "switch to this".
 */
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const nextLabel = theme === "light" ? "dark" : "light";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${nextLabel} mode`}
      title={`Switch to ${nextLabel} mode`}
      className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-bg-elevated text-text-primary shadow-[0_4px_16px_rgba(0,0,0,0.18)] transition-colors hover:bg-bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary-strong"
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "dark" ? (
          <motion.svg
            key="sun"
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
            initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <circle
              cx="12"
              cy="12"
              r="4"
              stroke="currentColor"
              strokeWidth="1.7"
            />
            <path
              d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </motion.svg>
        ) : (
          <motion.svg
            key="moon"
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
            initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <path
              d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </button>
  );
}
