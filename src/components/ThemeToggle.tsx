import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme
    const isLight = document.documentElement.classList.contains("light");
    setIsDark(!isLight);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("light");
      setIsDark(false);
    } else {
      root.classList.remove("light");
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-8 right-6 md:right-12 z-50 p-4 rounded-full bg-[var(--color-surface)] text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors shadow-xl border border-[var(--color-bg)]"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
