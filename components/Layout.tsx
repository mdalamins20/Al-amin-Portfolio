
import React from 'react';
import { useTheme } from './ThemeContext';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  onViewCV: () => void;
  hideNavigation?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, onViewCV, hideNavigation }) => {
  const { language, mode } = useTheme();

  return (
    <div className="min-h-screen relative bg-background text-on-surface transition-colors duration-500 overflow-x-hidden">
      {!hideNavigation && <Navigation />}

      <main className={`relative z-0 ${hideNavigation ? 'pt-8' : 'pt-24'} pb-32 md:pb-20`}>
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
      
      {!hideNavigation && <Footer />}
    </div>
  );
};
