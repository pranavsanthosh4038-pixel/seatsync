import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function applyTheme(theme: "light" | "dark") {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

export const THEME_EVENT = "seatsync-theme-change";

export function setTheme(theme: "light" | "dark") {
  localStorage.setItem("seatsync-theme", theme);
  applyTheme(theme);
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: theme }));
}

export function getTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return (localStorage.getItem("seatsync-theme") as "light" | "dark" | null) ?? "light";
}

export function ThemeToggle() {
  const [theme, setThemeState] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = (localStorage.getItem("seatsync-theme") as "light" | "dark" | null) ?? "light";
    setThemeState(stored);
    applyTheme(stored);
    const onChange = (e: Event) =>
      setThemeState((e as CustomEvent<"light" | "dark">).detail ?? "light");
    window.addEventListener(THEME_EVENT, onChange);
    return () => window.removeEventListener(THEME_EVENT, onChange);
  }, []);

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="w-9 h-9 rounded-full border border-border bg-surface flex items-center justify-center text-foreground hover:bg-surface-2 transition-colors"
    >
      {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}
