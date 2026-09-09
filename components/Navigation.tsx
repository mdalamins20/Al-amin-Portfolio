import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useThemeStore } from './stores/useThemeStore';
import { useProfileStore } from './stores/useProfileStore';
import { ThemeSelector } from './ThemeSelector';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, 
  Moon, 
  Palette, 
  Download, 
  PhoneCall, 
  MessageSquare, 
  ChevronDown, 
  Sparkles, 
  Menu, 
  X,
  ExternalLink
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  const themeRef = useRef<HTMLDivElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { mode, toggleMode } = useThemeStore();
  const { profile } = useProfileStore();

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setShowThemeSelector(false);
      }
      if (quickActionsRef.current && !quickActionsRef.current.contains(e.target as Node)) {
        setShowQuickActions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 24);
          
          // Scroll spy logic
          if (window.location.pathname === '/') {
            const sections = ['hero', 'work', 'testimonials', 'contact'];
            let current = '';
            for (const section of sections) {
              const element = document.getElementById(section);
              if (element) {
                const rect = element.getBoundingClientRect();
                if (rect.top <= 200 && rect.bottom >= 200) {
                  current = section;
                }
              }
            }
            if ((window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight - 120) {
               current = 'contact';
            }
            
            if (current) {
              setActiveSection(current);
            } else if (window.scrollY < 120) {
              setActiveSection('hero');
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setIsMobileMenuOpen(false);
    if (href.startsWith('/#') && location.pathname === '/') {
      e.preventDefault();
      const hash = href.substring(1);
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', hash);
      }
    }
  };

  const isLinkActive = (href: string) => {
    if (location.pathname !== '/') {
      return location.pathname === href;
    }
    if (href.startsWith('/#')) {
      const section = href.substring(2);
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

  const whatsappNumber = profile?.phone?.replace(/[^0-9]/g, '') || '8801778189644';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hello Muhammad Al-amin, I reviewed your portfolio and would like to discuss a project.")}`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out flex justify-center px-3 sm:px-6 pt-3 sm:pt-4">
      <nav 
        className={`w-full max-w-6xl transition-all duration-500 ease-out flex items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-3 rounded-2xl md:rounded-full ${
          isScrolled
            ? 'bg-surface/85 dark:bg-slate-950/85 backdrop-blur-2xl shadow-xl shadow-black/5 dark:shadow-black/40 border border-surface-variant/30 dark:border-white/10 ring-1 ring-black/5 dark:ring-white/5'
            : 'bg-surface/50 dark:bg-slate-900/40 backdrop-blur-lg border border-surface-variant/20 dark:border-white/5 shadow-sm'
        }`}
      >
        {/* Brand Logo & Favicon */}
        <Link 
          to="/" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
          className="group flex items-center gap-2.5 py-1 focus:outline-none"
        >
          <img 
            src={profile?.favicon || "https://i.ibb.co.com/4ZtpFT0b/IMG.png"} 
            alt={profile?.name || "Muhammad Al-amin"} 
            className="w-8 h-8 rounded-full object-cover shadow-sm ring-1 ring-surface-variant/30 dark:ring-white/15 group-hover:scale-105 transition-transform"
          />
          <span className="font-headline-md font-bold tracking-tight text-on-surface text-base sm:text-lg group-hover:text-primary transition-colors">
            Al-amin<span className="text-primary font-black">.</span>
          </span>
        </Link>
        
        {/* Center: Desktop Navigation with Theme-Colored Animated Sliding Pill */}
        <div 
          className="hidden md:flex items-center p-1.5 rounded-full bg-surface-variant/20 dark:bg-white/5 border border-surface-variant/20 dark:border-white/5 backdrop-blur-md"
          onMouseLeave={() => setHoveredNav(null)}
        >
          {navLinks.map((link) => {
            const active = isLinkActive(link.href);
            const isHovered = hoveredNav === link.name;
            return (
              <Link 
                key={link.name}
                to={link.href} 
                onClick={(e) => handleNavClick(e as any, link.href)}
                onMouseEnter={() => setHoveredNav(link.name)}
                className={`relative px-4 py-1.5 text-xs sm:text-[13px] font-semibold tracking-wide rounded-full transition-colors z-10 ${
                  active 
                    ? 'text-white font-bold' 
                    : isHovered
                    ? 'text-primary font-bold'
                    : 'text-on-surface-variant dark:text-slate-300 hover:text-on-surface dark:hover:text-white'
                }`}
              >
                {/* Active Sliding Background Pill Glowing in Theme Accent Color - Always visible when active */}
                {active && (
                  <motion.div
                    layoutId="activeNavPill"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="absolute inset-0 rounded-full bg-primary shadow-lg shadow-primary/30 -z-10"
                  />
                )}
                {/* Hover Indicator for non-active links */}
                {isHovered && !active && (
                  <motion.div
                    layoutId="hoverNavPill"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="absolute inset-0 rounded-full bg-primary/10 dark:bg-white/10 -z-10"
                  />
                )}
                {link.name}
              </Link>
            );
          })}
        </div>
        
        {/* Right Section: Interactive Tools Pill + Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Integrated Interactive Tools Island (Dark Mode & Skin Palette) */}
          <div className="hidden sm:flex items-center p-1 rounded-full bg-surface-variant/20 dark:bg-white/5 border border-surface-variant/25 dark:border-white/5 backdrop-blur-md">
            <button 
              onClick={toggleMode}
              className="w-8 h-8 text-on-surface-variant dark:text-slate-300 hover:text-primary dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-800/80 rounded-full transition-all duration-200 flex items-center justify-center active:scale-95"
              title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme Mode"
            >
              {mode === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            
            {/* Color Skin Selector Button */}
            <div className="relative" ref={themeRef}>
              <button 
                onClick={() => {
                  setShowThemeSelector(!showThemeSelector);
                  setShowQuickActions(false);
                }}
                className={`w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center active:scale-95 ${
                  showThemeSelector 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'text-on-surface-variant dark:text-slate-300 hover:text-primary dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-800/80'
                }`}
                title="Change Color Theme"
                aria-label="Theme Color Skins"
              >
                <Palette size={15} />
              </button>

              <AnimatePresence>
                {showThemeSelector && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-3 w-max min-w-[210px] rounded-2xl overflow-hidden shadow-2xl z-50"
                  >
                    <ThemeSelector onSelect={() => setShowThemeSelector(false)} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Quick Actions Dropdown (Hire Me / Resume / WhatsApp) */}
          <div className="relative" ref={quickActionsRef}>
            <button 
              onClick={() => {
                setShowQuickActions(!showQuickActions);
                setShowThemeSelector(false);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-primary text-white rounded-full font-label-bold text-xs sm:text-sm shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Sparkles size={14} className="animate-pulse" />
              <span>Hire Me</span>
              <ChevronDown size={13} className={`transition-transform duration-200 ${showQuickActions ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showQuickActions && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-3 w-64 p-2 bg-surface/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-surface-variant/30 dark:border-white/10 rounded-2xl shadow-2xl z-50 flex flex-col gap-1"
                >
                  <div className="px-3 py-2 border-b border-surface-variant/20 dark:border-white/10">
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-text-secondary dark:text-slate-400">Quick Actions</p>
                    <p className="text-xs text-on-surface-variant dark:text-slate-300 font-medium">Let's build something remarkable together</p>
                  </div>

                  <Link
                    to="/#contact"
                    onClick={(e) => {
                      handleNavClick(e as any, '/#contact');
                      setShowQuickActions(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/10 text-on-surface hover:text-primary transition-all text-xs font-semibold"
                  >
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <PhoneCall size={14} />
                    </div>
                    <div>
                      <p className="font-bold">Book Strategy Call</p>
                      <p className="text-[10px] text-text-secondary dark:text-slate-400">Direct consultation</p>
                    </div>
                  </Link>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setShowQuickActions(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-500/10 text-on-surface hover:text-emerald-500 transition-all text-xs font-semibold"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <MessageSquare size={14} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold flex items-center justify-between">
                        WhatsApp Chat
                        <ExternalLink size={11} className="opacity-60" />
                      </p>
                      <p className="text-[10px] text-text-secondary dark:text-slate-400">Instant response</p>
                    </div>
                  </a>

                  {profile?.cvFileUrl && (
                    <a
                      href={profile.cvFileUrl}
                      download={`${profile.firstName || 'Resume'}_CV.pdf`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setShowQuickActions(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-variant/30 dark:hover:bg-white/5 text-on-surface hover:text-primary transition-all text-xs font-semibold"
                    >
                      <div className="w-7 h-7 rounded-lg bg-surface-variant/30 dark:bg-white/10 flex items-center justify-center text-on-surface">
                        <Download size={14} />
                      </div>
                      <div>
                        <p className="font-bold">Download CV / Resume</p>
                        <p className="text-[10px] text-text-secondary dark:text-slate-400">Verified PDF credentials</p>
                      </div>
                    </a>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-surface-variant/20 dark:bg-white/5 text-on-surface border border-surface-variant/20 dark:border-white/10 active:scale-95 transition-all"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>
      
      {/* Mobile Menu Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 inset-x-3 sm:inset-x-6 bg-surface/95 dark:bg-slate-950/95 backdrop-blur-2xl border border-surface-variant/30 dark:border-white/10 rounded-3xl shadow-2xl p-5 md:hidden z-40 overflow-y-auto max-h-[calc(100vh-6rem)]"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-surface-variant/20 dark:border-white/10">
                <span className="text-xs font-extrabold uppercase tracking-widest text-text-secondary dark:text-slate-400">Navigation</span>
              </div>

              {navLinks.map((link) => {
                const active = isLinkActive(link.href);
                return (
                  <Link 
                    key={link.name}
                    to={link.href} 
                    onClick={(e) => handleNavClick(e as any, link.href)}
                    className={`flex items-center justify-between text-base py-3 px-4 rounded-2xl transition-all ${
                      active 
                        ? 'bg-primary/15 text-primary font-bold shadow-sm' 
                        : 'text-on-surface font-medium hover:bg-surface-variant/20 dark:hover:bg-white/5'
                    }`}
                  >
                    {link.name}
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  </Link>
                );
              })}

              <div className="h-px bg-surface-variant/20 dark:border-white/10 my-3" />

              {/* Mobile Appearance Settings */}
              <div className="space-y-3">
                <p className="text-xs font-extrabold uppercase tracking-widest text-text-secondary dark:text-slate-400">Appearance</p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button 
                    onClick={toggleMode}
                    className="py-3 px-3.5 bg-surface-variant/20 dark:bg-white/5 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs text-on-surface border border-surface-variant/20 dark:border-white/5 active:scale-95 transition-all"
                  >
                    {mode === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                    {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </button>

                  <button 
                    onClick={() => setShowThemeSelector(!showThemeSelector)}
                    className="py-3 px-3.5 bg-surface-variant/20 dark:bg-white/5 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs text-on-surface border border-surface-variant/20 dark:border-white/5 active:scale-95 transition-all"
                  >
                    <Palette size={15} />
                    Themes
                  </button>
                </div>

                <AnimatePresence>
                  {showThemeSelector && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden pt-2"
                    >
                      <ThemeSelector onSelect={() => setShowThemeSelector(false)} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Quick Action Buttons */}
              <div className="pt-4 flex flex-col gap-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  <MessageSquare size={16} />
                  Chat on WhatsApp
                </a>

                {profile?.cvFileUrl && (
                  <a
                    href={profile.cvFileUrl}
                    download={`${profile.firstName || 'Resume'}_CV.pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-surface-variant/30 dark:bg-white/10 text-on-surface rounded-2xl font-bold text-sm border border-surface-variant/30 active:scale-95 transition-all"
                  >
                    <Download size={16} />
                    Download Resume (PDF)
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

