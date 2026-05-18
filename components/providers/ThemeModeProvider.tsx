'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { alpha, CssBaseline, ThemeProvider, createTheme } from '@mui/material';

export type ThemeMode = 'light' | 'dark';

type ThemeModeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
};

const STORAGE_KEY = 'stellaiverse-theme-mode';

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);

function readInitialMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  const storedMode = window.localStorage.getItem(STORAGE_KEY);
  if (storedMode === 'light' || storedMode === 'dark') {
    return storedMode;
  }

  const themeAttribute = document.documentElement.dataset.theme;
  if (themeAttribute === 'light' || themeAttribute === 'dark') {
    return themeAttribute;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function syncThemeAttribute(mode: ThemeMode) {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.dataset.theme = mode;
  document.documentElement.style.colorScheme = mode;
}

function buildTheme(mode: ThemeMode) {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#8b5cf6' : '#6d28d9',
        contrastText: '#ffffff',
      },
      secondary: {
        main: isDark ? '#06b6d4' : '#0f766e',
      },
      background: {
        default: isDark ? '#0a0e27' : '#f7f8fc',
        paper: isDark ? '#10172b' : '#ffffff',
      },
      text: {
        primary: isDark ? '#f8fafc' : '#0f172a',
        secondary: isDark ? '#cbd5e1' : '#475569',
      },
      divider: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(99, 102, 241, 0.2)',
    },
    shape: {
      borderRadius: 16,
    },
    typography: {
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      button: {
        textTransform: 'none',
        fontWeight: 700,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            height: '100%',
            transition: 'background-color 240ms ease, color 240ms ease',
          },
          body: {
            minHeight: '100%',
            backgroundColor: isDark ? '#0a0e27' : '#f7f8fc',
            color: isDark ? '#f8fafc' : '#0f172a',
            transition:
              'background-color 240ms ease, color 240ms ease, border-color 240ms ease',
          },
          '*': {
            transitionProperty: 'background-color, border-color, color, fill, stroke, box-shadow',
            transitionDuration: '240ms',
            transitionTimingFunction: 'ease',
          },
          '::selection': {
            backgroundColor: alpha(isDark ? '#8b5cf6' : '#6d28d9', 0.22),
            color: isDark ? '#ffffff' : '#0f172a',
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 9999,
            border: isDark ? '1px solid rgba(139, 92, 246, 0.25)' : '1px solid rgba(99, 102, 241, 0.18)',
            backgroundColor: isDark ? 'rgba(17, 24, 39, 0.72)' : 'rgba(255, 255, 255, 0.92)',
            boxShadow: isDark ? '0 0 0 1px rgba(139, 92, 246, 0.08)' : 'none',
          },
        },
      },
    },
  });
}

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(readInitialMode);

  useEffect(() => {
    syncThemeAttribute(mode);

    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Ignore storage failures so the theme still works.
    }
  }, [mode]);

  const toggleMode = useCallback(() => {
    setMode((currentMode) => (currentMode === 'dark' ? 'light' : 'dark'));
  }, []);

  const theme = useMemo(() => buildTheme(mode), [mode]);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      toggleMode,
    }),
    [mode, toggleMode]
  );

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext);

  if (!context) {
    throw new Error('useThemeMode must be used within ThemeModeProvider');
  }

  return context;
}
