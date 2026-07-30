
import React from 'react';
import { useThemeStore } from './stores/useThemeStore';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  onViewCV: () => void;
  hideNavigation?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, onViewCV, hideNavigation }) => {
  const { language, mode } = useThemeStore();

  return (
    <div className="min-h-screen relative bg-background text-on-surface transition-colors duration-500 overflow-x-hidden">
      {!hideNavigation && <Navigation />}

      <main className={`relative z-0 ${hideNavigation ? 'pt-8' : 'pt-24'} pb-32 md:pb-20`}>
        <div className="section-container">
          {children}
        </div>
      </main>
      
      {!hideNavigation && <Footer />}
    </div>
  );
};
