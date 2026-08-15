import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

interface ThemeToggleProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, toggleTheme }) => {
  return (
    <motion.button
      onClick={toggleTheme}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="fixed bottom-8 right-8 z-50 p-4 rounded-full bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xl border border-neutral-200 dark:border-neutral-700 hover:scale-110 transition-transform duration-300 group"
      aria-label="Toggle Dark Mode"
    >
      <div className="relative w-6 h-6 overflow-hidden">
        <motion.div
          animate={{ y: isDark ? 30 : 0, opacity: isDark ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Sun className="w-5 h-5 text-brand-600" />
        </motion.div>
        
        <motion.div
          animate={{ y: isDark ? 0 : -30, opacity: isDark ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Moon className="w-5 h-5 text-brand-400" />
        </motion.div>
      </div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full bg-brand-500 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-300"></div>
    </motion.button>
  );
};