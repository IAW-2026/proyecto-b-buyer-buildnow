"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const THEME_STORAGE_KEY = "buildnow:theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initialTheme = getInitialTheme();

    document.documentElement.classList.toggle(
      "dark",
      initialTheme === "dark"
    );
    window.localStorage.setItem(THEME_STORAGE_KEY, initialTheme);

    window.setTimeout(() => {
      setTheme(initialTheme);
      setMounted(true);
    }, 0);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    document.documentElement.classList.toggle(
      "dark",
      theme === "dark"
    );
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [mounted, theme]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () =>
        setTheme((current) =>
          current === "dark" ? "light" : "dark"
        ),
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
      {mounted ? <ThemeToggleButton /> : null}
    </ThemeContext.Provider>
  );
}

function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="fixed bottom-4 right-4 z-[70] flex h-12 w-12 items-center justify-center rounded-full border border-orange-200 bg-white text-[#823A00] shadow-[0_12px_30px_rgba(130,58,0,0.22)] transition-[background-color,border-color,color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[#ED6F00] hover:bg-[#FFF4E8] dark:border-stone-700 dark:bg-stone-900 dark:text-orange-100 dark:shadow-[0_12px_30px_rgba(0,0,0,0.45)] dark:hover:bg-stone-800"
      aria-label={
        isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
      }
      title={isDark ? "Modo claro" : "Modo oscuro"}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M20.99 13.18A8 8 0 1 1 10.82 3.01 6 6 0 0 0 20.99 13.18Z" />
    </svg>
  );
}

function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme debe usarse dentro de ThemeProvider");
  }

  return context;
}
