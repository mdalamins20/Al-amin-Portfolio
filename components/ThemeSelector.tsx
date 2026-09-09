
import React from 'react';
import { useThemeStore, ACCENT_COLORS } from './stores/useThemeStore';
import { Check, Sparkles } from 'lucide-react';

export const ThemeSelector: React.FC<{ onSelect?: () => void }> = ({ onSelect }) => {
  const { accentColor, setAccentColor } = useThemeStore();

  return (
    <div className="p-3.5 bg-surface/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-surface-variant/30 dark:border-white/10 rounded-2xl shadow-2xl min-w-[200px]">
      <div className="flex items-center gap-2 px-2.5 pb-2.5 mb-1.5 border-b border-surface-variant/20 dark:border-white/10">
        <Sparkles size={13} className="text-primary" />
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-text-secondary dark:text-slate-400">Premium Skins</p>
      </div>
      <div className="space-y-1">
        {ACCENT_COLORS.map((t) => {
          const isSelected = accentColor === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                setAccentColor(t.id);
                onSelect?.();
              }}
              className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl transition-all ${
                isSelected 
                  ? 'bg-primary/10 border border-primary/25 shadow-sm' 
                  : 'hover:bg-surface-variant/20 dark:hover:bg-white/5 text-on-surface'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3.5 h-3.5 rounded-full shadow-sm ring-2 ring-white/20 dark:ring-black/40" 
                  style={{ backgroundColor: t.val }}
                />
                <span className={`text-[12px] font-bold tracking-tight ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                  {t.name}
                </span>
              </div>
              {isSelected && <Check size={14} className="text-primary stroke-[2.5]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
