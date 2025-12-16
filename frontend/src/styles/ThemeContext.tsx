import { createContext, useContext, ReactNode } from "react";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import { lightTheme, darkTheme, Theme } from "./theme";
import { useLocalStorageState } from "../hooks/useLocalStorageState";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getSystemTheme = (): ThemeMode =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const themeSerializer = {
  serialize: (value: ThemeMode) => value,
  deserialize: (value: string | null): ThemeMode =>
    value === "light" || value === "dark" ? value : getSystemTheme(),
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useLocalStorageState<ThemeMode>("theme", getSystemTheme(), themeSerializer);

  const theme = mode === "dark" ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, theme }}>
      <StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
