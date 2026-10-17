"use client";

import { useEffect, useState } from "react";

const THEMES = [
  { id: "noir", label: "Noir" },
  { id: "spec", label: "Spec" },
  { id: "cockpit", label: "Cockpit" }
] as const;

const MODES = [
  { id: "light", label: "Day" },
  { id: "dark", label: "Dark" }
] as const;

function remember(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage can be unavailable; the choice just will not persist */
  }
}

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<string>("noir");
  const [mode, setMode] = useState<string>("dark");

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme || "noir");
    setMode(document.documentElement.dataset.mode || "dark");
  }, []);

  function chooseTheme(id: string) {
    setTheme(id);
    document.documentElement.dataset.theme = id;
    remember("theme", id);
  }

  function chooseMode(id: string) {
    setMode(id);
    document.documentElement.dataset.mode = id;
    remember("mode", id);
  }

  return (
    <div className="header-tools">
      <div className="theme-switch" role="group" aria-label="Day or dark mode">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            className={mode === m.id ? "is-active" : ""}
            aria-pressed={mode === m.id}
            onClick={() => chooseMode(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="theme-switch" role="group" aria-label="Visual style">
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            className={theme === t.id ? "is-active" : ""}
            aria-pressed={theme === t.id}
            onClick={() => chooseTheme(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
