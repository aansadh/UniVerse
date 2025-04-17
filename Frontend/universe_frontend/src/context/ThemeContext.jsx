import { createContext, useContext, useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const storageKey = "vite-ui-theme";
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(storageKey) || "dark"; // system
  });
  const [Icon, setIcon] = useState(() => {
    return theme === "light" ? Moon : Sun;
  });
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    localStorage.setItem(storageKey, theme);
  }, [theme]);

  const toggleTheme = () => {
    // const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    const next = theme === "light" ? "dark" : "light";
    setIcon(theme === "light" ? Moon : Sun);
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ toggleTheme, Icon }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};
