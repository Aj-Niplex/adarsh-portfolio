"use client";

import { useEffect, useState } from "react";

const THEMES = [
  { id: "spec", label: "Spec" },
  { id: "noir", label: "Noir" },
  { id: "cockpit", label: "Cockpit" }
] as const;

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<string>("spec");

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme || "spec");
  }, []);

  function choose(id: string) {
    setTheme(id);
    document.documentElement.dataset.theme = id;
    try {
      localStorage.setItem("theme", id);
    } catch {
      /* storage can be unavailable; the choice just will not persist */
    }
  }

  return (
    <div className="theme-switch" role="group" aria-label="Visual style">
      {THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          className={theme === t.id ? "is-active" : ""}
          aria-pressed={theme === t.id}
          onClick={() => choose(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
