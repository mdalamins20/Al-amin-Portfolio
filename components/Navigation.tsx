import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from './ThemeContext';

export const Navigation: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { mode, toggleMode } = useTheme();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
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
    if (href.startsWith('/#')) {
      return location.pathname === '/' && location.hash === href.replace(/^\//, '');
    }
    if (href.startsWith('#')) {
      return location.pathname === '/' && location.hash === href;
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
        <Link to="/" className="font-headline-md text-headline-md font-bold text-on-surface">
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
            <button className="p-2 text-on-surface-variant hover:bg-surface-elevated/50 rounded-full transition-all duration-300">
              <span className="material-symbols-outlined">language</span>
            </button>
          </div>
          <Link to="/#contact" onClick={(e) => handleNavClick(e as any, '/#contact')} className="hidden md:flex px-6 py-2.5 bg-primary-container text-white rounded-lg font-label-bold text-label-bold hover:scale-[1.02] transition-transform shadow-lg shadow-primary-container/20">
            Hire Me
          </Link>
          <button className="md:hidden text-on-surface">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
