import { create } from 'zustand';

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

interface ThemeState {
  language: LanguageType;
  mode: ModeType;
  accentColor: string;
  setLanguage: (l: LanguageType) => void;
  toggleMode: () => void;
  setAccentColor: (id: string) => void;
  init: () => void;
}

const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  language: 'en',
  mode: 'light',
  accentColor: 'violet',
  setLanguage: (l) => {
    set({ language: l });
    localStorage.setItem('site-lang', l);
    document.documentElement.setAttribute('data-language', l);
  },
  toggleMode: () => {
    const currentMode = get().mode;
    const newMode = currentMode === 'light' ? 'dark' : 'light';
    set({ mode: newMode });
    localStorage.setItem('site-mode', newMode);
    document.documentElement.setAttribute('data-mode', newMode);
    if (newMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
  setAccentColor: (id) => {
    const color = ACCENT_COLORS.find(c => c.id === id) || ACCENT_COLORS[0];
    set({ accentColor: id });
    localStorage.setItem('site-accent', id);
    document.documentElement.style.setProperty('--accent', color.val);
    document.documentElement.style.setProperty('--accent-rgb', hexToRgb(color.val));
    document.documentElement.style.setProperty('--accent-hover', color.hover);
    document.documentElement.style.setProperty('--accent-50', color.soft);
  },
  init: () => {
    const savedLang = (localStorage.getItem('site-lang') as LanguageType) || 'en';
    const savedMode = (localStorage.getItem('site-mode') as ModeType) || 'light';
    const savedColor = localStorage.getItem('site-accent') || 'violet';
    
    get().setLanguage(savedLang);
    
    set({ mode: savedMode });
    document.documentElement.setAttribute('data-mode', savedMode);
    if (savedMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    get().setAccentColor(savedColor);
  }
}));
