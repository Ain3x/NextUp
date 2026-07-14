import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants';

type Theme = {
  colors: {
    background: string;
    surface: string;
    primary: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    anime: string;
    movie: string;
    show: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  font: {
    sizes: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
    weights: {
      regular: '400';
      medium: '500';
      bold: '700';
    };
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
};

const lightTheme: Theme = {
  colors: {
    background: '#FFFFFF',
    surface: '#F5F5F5',
    primary: '#6C63FF',
    text: '#111111',
    textSecondary: '#666666',
    border: '#E0E0E0',
    error: '#E53935',
    success: '#43A047',
    anime: '#8B85FF',
    movie: '#42A5F5',
    show: '#26A69A',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  font: {
    sizes: { xs: 11, sm: 13, md: 15, lg: 18, xl: 24 },
    weights: { regular: '400', medium: '500', bold: '700' },
  },
  radius: { sm: 6, md: 12, lg: 20, full: 999 },
};

const darkTheme: Theme = {
  colors: {
    background: '#111111',
    surface: '#1E1E1E',
    primary: '#8B85FF',
    text: '#F5F5F5',
    textSecondary: '#999999',
    border: '#2C2C2C',
    error: '#EF5350',
    success: '#66BB6A',
    anime: '#8B85FF',
    movie: '#42A5F5',
    show: '#26A69A',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  font: {
    sizes: { xs: 11, sm: 13, md: 15, lg: 18, xl: 24 },
    weights: { regular: '400', medium: '500', bold: '700' },
  },
  radius: { sm: 6, md: 12, lg: 20, full: 999 },
};

type ThemeContextType = {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.THEME).then((value) => {
      if (value === 'dark') setIsDark(true);
    });
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(STORAGE_KEYS.THEME, next ? 'dark' : 'light');
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{
      theme: isDark ? darkTheme : lightTheme,
      isDark,
      toggleTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);