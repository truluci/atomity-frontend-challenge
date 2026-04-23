import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "atomity-theme";

/**
 * Initial theme is always pre-seeded onto `<html data-theme>` by the
 * inline script in index.html (to prevent a light→dark flash). We just
 * mirror it into React state here and keep the two in sync on change.
 */
function readInitial(): Theme {
  if (typeof document === "undefined") return "dark";
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "light" ? "light" : "dark";
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(readInitial);

  // Keep state in sync if something else changes the attribute (e.g.
  // another tab + localStorage event).
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const v = e.newValue;
      if (v === "light" || v === "dark") {
        document.documentElement.setAttribute("data-theme", v);
        setThemeState(v);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage unavailable (private mode) — not a failure worth surfacing
    }
    setThemeState(next);
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  return { theme, setTheme, toggle };
}
