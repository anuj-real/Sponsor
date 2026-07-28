import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type ThemeName = 'dark' | 'light';

const STORAGE_KEY = 'SBR_THEME';

interface ThemeContextValue {
  theme: ThemeName;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggleTheme: () => {},
});

/**
 * App-wide light/dark preference. Lives above App so the header toggle and any
 * deeply-nested consumer (e.g. TreeVisualizer inside AdminPanel) stay in sync
 * without prop drilling. Persisted separately from session data so it survives
 * logout, which clears the other SBR_* keys.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'dark' || stored === 'light' ? stored : 'light';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
