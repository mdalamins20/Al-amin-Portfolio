import { create } from 'zustand';

export type LanguageType = 'en' | 'bn';
export type ModeType = 'light' | 'dark';

export const ACCENT_COLORS = [
  { id: 'indigo', name: 'Electric Indigo', val: '#6366f1', hover: '#4f46e5', soft: '#eef2ff' },
  { id: 'cyan', name: 'Royal Cyan', val: '#06b6d4', hover: '#0891b2', soft: '#ecfeff' },
  { id: 'emerald', name: 'Emerald Luxe', val: '#10b981', hover: '#059669', soft: '#ecfdf5' },
  { id: 'amber', name: 'Sunset Gold', val: '#f59e0b', hover: '#d97706', soft: '#fffbeb' },
  { id: 'rose', name: 'Rose Quartz', val: '#f43f5e', hover: '#e11d48', soft: '#fff1f2' },
  { id: 'violet', name: 'Deep Violet', val: '#8b5cf6', hover: '#7c3aed', soft: '#f5f3ff' },
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
