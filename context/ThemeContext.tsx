import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const themes = {
  default: { primary: '#E91E63', secondary: '#C2185B', background: '#F3E5F5' },
  blue: { primary: '#2196F3', secondary: '#1976D2', background: '#E3F2FD' },
  green: { primary: '#4CAF50', secondary: '#388E3C', background: '#E8F5E8' },
  purple: { primary: '#9C27B0', secondary: '#7B1FA2', background: '#F3E5F5' },
  orange: { primary: '#FF9800', secondary: '#F57C00', background: '#FFF3E0' },
};

interface ThemeContextType {
  currentTheme: string;
  colors: { primary: string; secondary: string; background: string };
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('default');
  const [colors, setColors] = useState(themes.default);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('chatTheme');
      if (savedTheme && themes[savedTheme as keyof typeof themes]) {
        setCurrentTheme(savedTheme);
        setColors(themes[savedTheme as keyof typeof themes]);
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    }
  };

  const setTheme = async (theme: string) => {
    try {
      await AsyncStorage.setItem('chatTheme', theme);
      setCurrentTheme(theme);
      setColors(themes[theme as keyof typeof themes]);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, colors, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};