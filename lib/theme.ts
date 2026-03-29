"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "autoleap-theme";

type Theme = "dark" | "light";

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return (localStorage.getItem(STORAGE_KEY) as Theme) || "dark";
}

export function toggleTheme(): Theme {
  const current = getStoredTheme();
  const next: Theme = current === "dark" ? "light" : "dark";
  localStorage.setItem(STORAGE_KEY, next);
  applyTheme(next);
  return next;
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(getStoredTheme());
  }, []);

  const toggle = useCallback(() => {
    const next = toggleTheme();
    setTheme(next);
  }, []);

  return { theme, toggleTheme: toggle };
}
