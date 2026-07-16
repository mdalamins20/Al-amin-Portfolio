
import React from 'react';
import { useTheme } from './ThemeContext';
import { Navigation } from './Navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  onViewCV: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onViewCV }) => {
  const { language, mode } = useTheme();

  return (
    <div className="min-h-screen relative bg-theme-bg text-theme-text transition-colors duration-500 overflow-x-hidden">
      <Navigation onViewCV={onViewCV} />

      <main className="relative z-0 pt-24 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${language}-${mode}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="section-container"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
