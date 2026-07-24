import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useThemeStore } from './stores/useThemeStore';
import { ThemeSelector } from './ThemeSelector';
import { motion, AnimatePresence } from 'framer-motion';

export const Navigation: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { mode, toggleMode } = useThemeStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      // Scroll spy logic
      if (window.location.pathname === '/') {
        const sections = ['hero', 'work', 'testimonials', 'contact'];
        let current = '';
        for (const section of sections) {
          const element = document.getElementById(section);
          if (element) {
            const rect = element.getBoundingClientRect();
            // If the section is within the top portion of the screen
            if (rect.top <= 150 && rect.bottom >= 150) {
              current = section;
            }
          }
        }
        // If at the very bottom of the page, force 'contact'
        if ((window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight - 100) {
           current = 'contact';
        }
        
        if (current) {
          setActiveSection(current);
        } else if (window.scrollY < 100) {
          setActiveSection('hero');
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // init
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setIsMobileMenuOpen(false); // Close mobile menu on click
    if (href.startsWith('/#') && location.pathname === '/') {
      e.preventDefault();
      const hash = href.substring(1); // e.g., "#work"
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        // Update URL hash without jumping
        window.history.pushState(null, '', hash);
      }
    }
  };

  const isLinkActive = (href: string) => {
    if (location.pathname !== '/') {
      return location.pathname === href;
    }
    
    if (href.startsWith('/#')) {
      const section = href.substring(2); // extracts 'hero', 'work', etc.
      return activeSection === section;
    }
    
    if (href.startsWith('#')) {
      const section = href.substring(1);
      return activeSection === section;
    }
    
    return location.pathname === href;
  };

  const navLinks = [
    { name: 'Home', href: '/#hero' },
    { name: 'Work', href: '/#work' },
    { name: 'Reviews', href: '/#testimonials' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/#contact' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-surface/80 backdrop-blur-xl border-b border-surface-variant/20 shadow-sm' : 'bg-transparent'
    } h-20`}>
      <div className="flex justify-between items-center max-w-container-max mx-auto px-margin-mobile md:px-gutter h-full">
        <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="font-headline-md text-headline-md font-bold text-on-surface">
          Al-amin.
        </Link>
        
        <div className="hidden md:flex items-center gap-stack-md">
          {navLinks.map((link) => {
            const active = isLinkActive(link.href);
            return (
              <Link 
                key={link.name}
                to={link.href} 
                onClick={(e) => handleNavClick(e as any, link.href)}
                className={`font-body-md transition-colors ${
                  active 
                    ? 'text-primary font-bold border-b-2 border-primary pb-1' 
                    : 'text-on-surface-variant font-medium hover:text-on-surface'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-2">
            <button 
              onClick={toggleMode}
              className="p-2 text-on-surface-variant hover:bg-surface-elevated/50 rounded-full transition-all duration-300 flex items-center justify-center"
            >
              <span className="material-symbols-outlined">{mode === 'dark' ? 'light_mode' : 'dark_mode'}</span>
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowThemeSelector(!showThemeSelector)}
                className="p-2 text-on-surface-variant hover:bg-surface-elevated/50 rounded-full transition-all duration-300 flex items-center justify-center"
                title="Change Color Theme"
              >
                <span className="material-symbols-outlined">palette</span>
              </button>
              {showThemeSelector && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden shadow-2xl border border-surface-variant/20 z-50">
                  <ThemeSelector onSelect={() => setShowThemeSelector(false)} />
                </div>
              )}
            </div>
          </div>
          <Link to="/#contact" onClick={(e) => handleNavClick(e as any, '/#contact')} className="hidden md:flex px-6 py-2.5 bg-primary-container text-white rounded-lg font-label-bold text-label-bold hover:scale-[1.02] transition-transform shadow-lg shadow-primary-container/20">
            Hire Me
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-on-surface p-2"
          >
            <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '100vh' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-20 left-0 w-full bg-white dark:bg-slate-950 md:hidden overflow-y-auto"
            style={{ height: 'calc(100vh - 5rem)' }}
          >
            <div className="flex flex-col py-8 px-6 gap-3 pb-24">
              <div className="flex flex-col gap-2">
                {navLinks.map((link, idx) => {
                  const active = isLinkActive(link.href);
                  return (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      key={link.name}
                    >
                      <Link 
                        to={link.href} 
                        onClick={(e) => handleNavClick(e as any, link.href)}
                        className={`block text-lg py-4 px-5 rounded-2xl transition-colors ${
                          active 
                            ? 'bg-primary/10 text-primary font-bold' 
                            : 'text-on-surface font-medium hover:bg-surface-variant'
                        }`}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navLinks.length * 0.1 }}
                className="mt-4"
              >
                <Link 
                  to="/#contact" 
                  onClick={(e) => handleNavClick(e as any, '/#contact')} 
                  className="flex justify-center w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                >
                  Hire Me
                </Link>
              </motion.div>
              
              <div className="h-px bg-slate-200 dark:bg-white/10 my-6 mx-2" />
              
              <div className="px-2">
                <p className="text-xs font-bold text-on-surface-variant mb-4 uppercase tracking-wider">Appearance</p>
                <div className="flex gap-4">
                  <button 
                    onClick={toggleMode}
                    className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl flex items-center justify-center gap-2 font-bold shadow-sm transition-all active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[20px]">{mode === 'dark' ? 'light_mode' : 'dark_mode'}</span>
                    {mode === 'dark' ? 'Light' : 'Dark'}
                  </button>
                  <div className="flex-1 relative">
                    <button 
                      onClick={() => setShowThemeSelector(!showThemeSelector)}
                      className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl flex items-center justify-center gap-2 font-bold shadow-sm transition-all active:scale-[0.98]"
                    >
                      <span className="material-symbols-outlined text-[20px]">palette</span>
                      Theme
                    </button>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {showThemeSelector && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-xl mx-2">
                      <ThemeSelector onSelect={() => setShowThemeSelector(false)} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
