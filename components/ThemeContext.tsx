
import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageType = 'en' | 'bn';
export type ModeType = 'light' | 'dark';

export const ACCENT_COLORS = [
  { id: 'violet', val: '#7c3aed', hover: '#6d28d9', soft: '#f5f3ff' },
  { id: 'blue', val: '#2563eb', hover: '#1d4ed8', soft: '#eff6ff' },
  { id: 'emerald', val: '#059669', hover: '#047857', soft: '#ecfdf5' },
  { id: 'rose', val: '#e11d48', hover: '#be123c', soft: '#fff1f2' },
  { id: 'orange', val: '#ea580c', hover: '#c2410c', soft: '#fff7ed' },
  { id: 'cyan', val: '#0891b2', hover: '#0e7490', soft: '#ecfeff' },
  { id: 'amber', val: '#d97706', hover: '#b45309', soft: '#fffbeb' },
  { id: 'indigo', val: '#4f46e5', hover: '#4338ca', soft: '#eef2ff' },
  { id: 'pink', val: '#db2777', hover: '#be185d', soft: '#fdf2f8' },
  { id: 'teal', val: '#0d9488', hover: '#0f766e', soft: '#f0fdfa' },
];

interface ThemeContextType {
  language: LanguageType;
  setLanguage: (l: LanguageType) => void;
  mode: ModeType;
  toggleMode: () => void;
  accentColor: string;
  setAccentColor: (colorId: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLangState] = useState<LanguageType>('en');
  const [mode, setModeState] = useState<ModeType>('light');
  const [accentColor, setAccentState] = useState('violet');

  useEffect(() => {
    const savedLang = localStorage.getItem('site-lang') as LanguageType;
    const savedMode = localStorage.getItem('site-mode') as ModeType;
    const savedColor = localStorage.getItem('site-accent') || 'violet';
    
    if (savedLang) {
      setLangState(savedLang);
      document.documentElement.setAttribute('data-language', savedLang);
    }
    
    if (savedMode) {
      setModeState(savedMode);
      document.documentElement.setAttribute('data-mode', savedMode);
      if (savedMode === 'dark') document.documentElement.classList.add('dark');
    }

    setAccentColor(savedColor);
  }, []);

  const setLanguage = (l: LanguageType) => {
    setLangState(l);
    localStorage.setItem('site-lang', l);
    document.documentElement.setAttribute('data-language', l);
  };

  const toggleMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setModeState(newMode);
    localStorage.setItem('site-mode', newMode);
    document.documentElement.setAttribute('data-mode', newMode);
    if (newMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const setAccentColor = (id: string) => {
    const color = ACCENT_COLORS.find(c => c.id === id) || ACCENT_COLORS[0];
    setAccentState(id);
    localStorage.setItem('site-accent', id);
    document.documentElement.style.setProperty('--accent', color.val);
    document.documentElement.style.setProperty('--accent-hover', color.hover);
    document.documentElement.style.setProperty('--accent-50', color.soft);
  };

  return (
    <ThemeContext.Provider value={{ language, setLanguage, mode, toggleMode, accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
