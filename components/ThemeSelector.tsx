
import React from 'react';
// Fix: Removed non-existent ThemeType and unused motion import to clean up the component.
import { useThemeStore } from './stores/useThemeStore';
import { Check, Palette, Monitor, Zap, Shield, Terminal } from 'lucide-react';

// Fix: Aligned THEMES IDs with the valid accentColor IDs defined in ThemeContext.tsx
const THEMES = [
  { id: 'violet', name: 'Violet', icon: Monitor, color: '#7c3aed' },
  { id: 'blue', name: 'Ocean', icon: Zap, color: '#2563eb' },
  { id: 'orange', name: 'Sunset', icon: Shield, color: '#ea580c' },
  { id: 'emerald', name: 'Forest', icon: Monitor, color: '#059669' },
  { id: 'pink', name: 'Cyber', icon: Terminal, color: '#db2777' },
] as const;

export const ThemeSelector: React.FC<{ onSelect?: () => void }> = ({ onSelect }) => {
  // Fix: Changed 'theme' to 'accentColor' and 'setTheme' to 'setAccentColor' to match the ThemeContextType definition.
  const { accentColor, setAccentColor } = useThemeStore();

  return (
    <div className="p-4 bg-theme-bg">
      <div className="flex items-center space-x-2 px-2 pb-3 mb-2 border-b border-theme-border">
        <Palette size={14} className="text-brand" />
        <p className="text-[10px] font-black uppercase tracking-widest text-theme-dim">UI Skin Selection</p>
      </div>
      <div className="space-y-1">
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setAccentColor(t.id);
              onSelect?.();
            }}
            className={`flex items-center justify-between w-full px-4 py-3 rounded-theme transition-all ${
              accentColor === t.id ? 'bg-brand/10 border border-brand/20' : 'hover:bg-theme-card'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full shadow-inner" 
                style={{ backgroundColor: t.color }}
              />
              <span className={`text-[12px] font-bold tracking-tight ${accentColor === t.id ? 'text-brand' : 'text-theme-text'}`}>
                {t.name}
              </span>
            </div>
            {accentColor === t.id && <Check size={14} className="text-brand" />}
          </button>
        ))}
      </div>
    </div>
  );
};
