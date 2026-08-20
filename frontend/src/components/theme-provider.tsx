"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const PORTAL_THEME_KEY = "ghs-portal-theme";
export const SITE_THEME_KEY = "ghs-site-theme";
const LEGACY_THEME_KEY = "ghs-theme";

// portal paths - keep theme separate from public site
const PORTAL_PREFIXES = [
  "/dashboard",
  "/team",
  "/team-chat",
  "/mentor-chat",
  "/workspace",
  "/kanban",
  "/announcements",
  "/leaderboard",
  "/submit",
  "/settings",
  "/notifications",
  "/onboarding",
  "/mentor",
  "/admin",
  "/judge",
];

export function isPortalPath(pathname: string) {
  const path = pathname.split("?")[0] || "/";
  return PORTAL_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );
}

function storageKeyFor(pathname: string) {
  return isPortalPath(pathname) ? PORTAL_THEME_KEY : SITE_THEME_KEY;
}

function readStoredTheme(key: string): Theme | null {
  try {
    const stored = localStorage.getItem(key);
    if (stored === "light" || stored === "dark") return stored;
    if (key === PORTAL_THEME_KEY) {
      const legacy = localStorage.getItem(LEGACY_THEME_KEY);
      if (legacy === "light" || legacy === "dark") return legacy;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function systemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveTheme(key: string): Theme {
  return readStoredTheme(key) ?? systemTheme();
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const storageKey = storageKeyFor(pathname);
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const preferred = resolveTheme(storageKey);
    setThemeState(preferred);
    applyTheme(preferred);
  }, [storageKey]);

  const setTheme = useCallback(
    (next: Theme) => {
      setThemeState(next);
      try {
        localStorage.setItem(storageKey, next);
        if (storageKey === PORTAL_THEME_KEY) {
          localStorage.removeItem(LEGACY_THEME_KEY);
        }
      } catch {
        /* ignore */
      }
      applyTheme(next);
    },
    [storageKey]
  );

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next = current === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(storageKey, next);
        if (storageKey === PORTAL_THEME_KEY) {
          localStorage.removeItem(LEGACY_THEME_KEY);
        }
      } catch {
        /* ignore */
      }
      applyTheme(next);
      return next;
    });
  }, [storageKey]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
