import type { ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@gonext/theme';
const PRIMARY_COLOR_STORAGE_KEY = '@gonext/primaryColor';

export type ThemeMode = 'light' | 'dark';

export const PRIMARY_COLORS: string[] = [
  '#6750A4', // фиолетовый (MD3 default)
  '#1976D2', // синий
  '#00796B', // бирюзовый
  '#388E3C', // зелёный
  '#689F38', // салатовый
  '#F57C00', // оранжевый
  '#D32F2F', // красный
  '#7B1FA2', // пурпурный
  '#0288D1', // голубой
  '#C2185B', // розовый
];

interface ThemeContextValue {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [primaryColor, setPrimaryColorState] = useState<string>(PRIMARY_COLORS[0]);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark') {
        setThemeModeState(stored);
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(PRIMARY_COLOR_STORAGE_KEY).then((stored) => {
      if (stored && PRIMARY_COLORS.includes(stored)) {
        setPrimaryColorState(stored);
      }
    });
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
  }, []);

  const setPrimaryColor = useCallback((color: string) => {
    setPrimaryColorState(color);
    AsyncStorage.setItem(PRIMARY_COLOR_STORAGE_KEY, color);
  }, []);

  const value: ThemeContextValue = {
    themeMode,
    setThemeMode,
    isDark: themeMode === 'dark',
    primaryColor,
    setPrimaryColor,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useThemeMode(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeMode must be used within ThemeProvider');
  }
  return ctx;
}
