"use client";

import { useTheme as useNextTheme } from "next-themes";

export type Theme = "light" | "dark" | "system";

const NEXT_THEME: Readonly<Record<Theme, Theme>> = {
  system: "light",
  light: "dark",
  dark: "system",
} as const;

export interface UseThemeReturn {
  theme: Theme;
  resolvedTheme: "light" | "dark" | undefined;
  setTheme: (theme: Theme) => void;
  cycleTheme: () => void;
}

export function useTheme(): UseThemeReturn {
  const { theme, resolvedTheme, setTheme } = useNextTheme();

  const current = (theme as Theme) ?? "system";

  return {
    theme: current,
    resolvedTheme: resolvedTheme as "light" | "dark" | undefined,
    setTheme: (t: Theme) => setTheme(t),
    cycleTheme: () => setTheme(NEXT_THEME[current]),
  };
}
