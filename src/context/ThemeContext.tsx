import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { Theme } from '../types';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = 'flash-pizza-theme';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // localStorage might be unavailable
  }
  // Default to light mode always
  return 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  // Compute resolved theme - always light or dark, default to light
  const resolvedTheme = useMemo<'light' | 'dark'>(() => {
    if (theme === 'light' || theme === 'dark') {
      return theme;
    }
    return 'light'; // Default to light
  }, [theme]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove no-transitions class after initial load
    root.classList.remove('no-transitions');
    
    // Apply dark class
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }

    // Update meta theme color
    const metaThemeColor = document.querySelector('meta[name=\"theme-color\"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', resolvedTheme === 'dark' ? '#1f2937' : '#f97316');
    }
  }, [resolvedTheme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_KEY, newTheme);
    } catch {
      // localStorage might be unavailable
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  }, [resolvedTheme, setTheme]);

  const value = useMemo(() => ({
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  }), [theme, resolvedTheme, setTheme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
