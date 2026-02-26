
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Languages, Palette, Check, Globe, X, Home, Layers, Code, Mail, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NAV_ITEMS, LANGUAGES } from '../constants';
import { useTheme, ACCENT_COLORS } from './ThemeContext';

interface NavigationProps {
  onViewCV: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onViewCV }) => {
  const { mode, toggleMode, accentColor, setAccentColor } = useTheme();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [currentLangCode, setCurrentLangCode] = useState(() => {
    const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
    return match ? match[1] : 'en';
  });

  const paletteRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    const handleClickOutside = (e: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target as Node)) {
        setIsPaletteOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    document.documentElement.setAttribute('data-applied-lang', currentLangCode);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [currentLangCode]);

  const changeLanguage = (langCode: string) => {
    setCurrentLangCode(langCode);
    setIsLangOpen(false);
    
    const domain = window.location.hostname === 'localhost' ? '' : `; domain=.${window.location.hostname}`;
    document.cookie = `googtrans=/en/${langCode}; path=/;${domain}`;
    document.cookie = `googtrans=/en/${langCode}; path=/;`;

    document.documentElement.setAttribute('data-applied-lang', langCode);

    const triggerTranslation = () => {
      const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (combo) {
        combo.value = langCode;
        combo.dispatchEvent(new Event('change'));
        combo.dispatchEvent(new Event('input'));
      }
    };

    if (langCode === 'en') {
      const cookies = ['googtrans'];
      cookies.forEach(name => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        if (window.location.hostname !== 'localhost') {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
        }
      });
      window.location.reload();
    } else {
      triggerTranslation();
      setTimeout(triggerTranslation, 400);
      setTimeout(triggerTranslation, 1200);
    }
  };

  const currentLang = LANGUAGES.find(l => l.code === currentLangCode) || LANGUAGES[0];

  const isLinkActive = (href: string) => {
    if (href.startsWith('/#')) {
      return location.pathname === '/' && location.hash === href.replace(/^\//, '');
    }
    if (href.startsWith('#')) {
      return location.pathname === '/' && location.hash === href;
    }
    return location.pathname === href;
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
      isScrolled ? 'bg-theme-bg/90 backdrop-blur-md border-b border-theme-border py-4' : 'bg-transparent py-6'
    }`}>
      <div className="section-container flex justify-between items-center">
        <a href="#" className="text-2xl font-bold tracking-tighter text-theme-text group">
          Al-amin<span className="text-brand inline-block group-hover:scale-125 transition-transform">.</span>
        </a>

        <div className="hidden md:flex items-center space-x-6">
           {NAV_ITEMS.filter(i => !i.isAction).map(item => {
             const active = isLinkActive(item.href);
             return item.href.startsWith('/#') || item.href.startsWith('#') ? (
               <a 
                 key={item.label} 
                 href={item.href} 
                 className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                   active ? 'text-brand' : 'text-theme-dim hover:text-brand'
                 }`}
               >
                 {item.label}
               </a>
             ) : (
               <Link 
                 key={item.label} 
                 to={item.href} 
                 className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                   active ? 'text-brand' : 'text-theme-dim hover:text-brand'
                 }`}
               >
                 {item.label}
               </Link>
             );
           })}
           
           <div className="h-4 w-[1px] bg-theme-border"></div>

           <div className="flex items-center space-x-3">
              <div className="relative" ref={langRef}>
                <button 
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border transition-all bg-theme-card ${
                    isLangOpen ? 'border-brand text-brand shadow-sm' : 'border-theme-border text-theme-dim hover:border-brand hover:text-brand'
                  }`}
                >
                  <Globe size={14} />
                  <span className="text-[10px] font-black uppercase tracking-tighter">
                    {currentLang.native}
                  </span>
                </button>

                <AnimatePresence>
                  {isLangOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full mt-3 right-0 w-64 bg-theme-bg border border-theme-border rounded-2xl shadow-2xl p-2 z-[110] max-h-[70vh] overflow-y-auto custom-scrollbar"
                    >
                      <p className="text-[9px] font-black uppercase tracking-widest text-theme-dim mb-2 px-3 pt-2">Switch Language</p>
                      <div className="space-y-1">
                        {LANGUAGES.map(lang => (
                          <button
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left group ${
                              currentLangCode === lang.code ? 'bg-brand/10 text-brand' : 'hover:bg-theme-card text-theme-dim hover:text-theme-text'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">{lang.flag}</span>
                              <div className="flex flex-col">
                                <span className="text-xs font-bold">{lang.native}</span>
                                <span className="text-[9px] opacity-60 uppercase tracking-tighter font-medium">{lang.label}</span>
                              </div>
                            </div>
                            {currentLangCode === lang.code && <Check size={12} />}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative" ref={paletteRef}>
                <button 
                  onClick={() => setIsPaletteOpen(!isPaletteOpen)}
                  className={`p-2 rounded-full transition-all border ${isPaletteOpen ? 'bg-brand text-white border-brand shadow-lg' : 'text-theme-dim bg-theme-card border-theme-border hover:border-brand'}`}
                >
                  <Palette size={18} />
                </button>
                
                <AnimatePresence>
                  {isPaletteOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full mt-3 right-0 w-48 bg-theme-bg border border-theme-border rounded-2xl shadow-2xl p-3 z-[110]"
                    >
                      <p className="text-[9px] font-black uppercase tracking-widest text-theme-dim mb-3 px-1">Interface Color</p>
                      <div className="grid grid-cols-5 gap-2">
                        {ACCENT_COLORS.map(c => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setAccentColor(c.id);
                              setIsPaletteOpen(false);
                            }}
                            className={`w-full aspect-square rounded-lg flex items-center justify-center relative overflow-hidden transition-transform active:scale-95 shadow-sm border ${accentColor === c.id ? 'border-brand' : 'border-transparent'}`}
                            style={{ backgroundColor: c.val }}
                          >
                            {accentColor === c.id && <Check size={12} className="text-white drop-shadow-md" />}
                            <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity"></div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button onClick={toggleMode} className="p-2 rounded-full text-theme-dim bg-theme-card border border-theme-border hover:border-brand transition-all">
                {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
           </div>
        </div>
        
        <div className="md:hidden flex items-center space-x-2">
           <button 
              onClick={() => { setIsLangOpen(!isLangOpen); setIsPaletteOpen(false); }} 
              className={`px-3 py-1.5 text-[10px] font-black border rounded-full uppercase flex items-center space-x-1.5 transition-all shadow-sm ${
                isLangOpen ? 'border-brand bg-brand/10 text-brand scale-105' : 'border-theme-border text-theme-text bg-theme-card'
              }`}
           >
             <Globe size={14} />
             <span>{currentLang.code.toUpperCase()}</span>
           </button>
           
           <button 
              onClick={() => { setIsPaletteOpen(!isPaletteOpen); setIsLangOpen(false); }} 
              className={`p-2 rounded-full transition-all border shadow-sm ${
                isPaletteOpen ? 'bg-brand text-white border-brand scale-110' : 'text-brand bg-theme-card border-theme-border'
              }`}
           >
              <Palette size={20} />
           </button>
           
           <button 
              onClick={toggleMode} 
              className="p-2 text-theme-dim bg-theme-card border border-theme-border rounded-full shadow-sm active:rotate-45 transition-transform"
           >
              {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
           </button>
        </div>
      </div>
      
      <AnimatePresence>
        {isLangOpen && (
          <div className="md:hidden fixed inset-0 z-[200]">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsLangOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              className="absolute bottom-0 left-0 right-0 bg-theme-bg rounded-t-[2.5rem] border-t border-theme-border p-6 pt-4 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
            >
               <div className="w-12 h-1 bg-theme-border mx-auto mb-6 rounded-full" />
               <div className="flex justify-between items-center mb-6 px-2">
                 <h3 className="text-xl font-serif font-black">Choose Language</h3>
                 <button onClick={() => setIsLangOpen(false)} className="p-2 bg-theme-card rounded-full"><X size={18}/></button>
               </div>
               <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pb-10 custom-scrollbar">
                 {LANGUAGES.map(lang => (
                   <button
                     key={lang.code}
                     onClick={() => changeLanguage(lang.code)}
                     className={`flex flex-col p-4 rounded-2xl border transition-all text-left group ${
                        currentLangCode === lang.code ? 'border-brand bg-brand/5' : 'border-theme-border bg-theme-card'
                     }`}
                   >
                     <span className="text-2xl mb-2 group-active:scale-125 transition-transform">{lang.flag}</span>
                     <span className={`text-sm font-bold truncate ${currentLangCode === lang.code ? 'text-brand' : 'text-theme-text'}`}>{lang.native}</span>
                     <span className="text-[10px] uppercase opacity-50 font-bold">{lang.label}</span>
                   </button>
                 ))}
               </div>
            </motion.div>
          </div>
        )}

        {isPaletteOpen && (
          <div className="md:hidden fixed inset-0 z-[200]">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsPaletteOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              className="absolute bottom-0 left-0 right-0 bg-theme-bg rounded-t-[2.5rem] border-t border-theme-border p-6 pt-4 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
            >
               <div className="w-12 h-1 bg-theme-border mx-auto mb-6 rounded-full" />
               <div className="flex justify-between items-center mb-8 px-2">
                 <h3 className="text-xl font-serif font-black">Interface Theme</h3>
                 <button onClick={() => setIsPaletteOpen(false)} className="p-2 bg-theme-card rounded-full"><X size={18}/></button>
               </div>
               <div className="grid grid-cols-5 gap-4 pb-12">
                 {ACCENT_COLORS.map(c => (
                   <button
                     key={c.id}
                     onClick={() => {
                       setAccentColor(c.id);
                       setIsPaletteOpen(false);
                     }}
                     className="relative flex flex-col items-center"
                   >
                     <div 
                        className={`w-full aspect-square rounded-2xl flex items-center justify-center border-4 transition-all active:scale-90 ${
                          accentColor === c.id ? 'border-brand scale-110 shadow-lg' : 'border-transparent shadow-sm'
                        }`}
                        style={{ backgroundColor: c.val }}
                     >
                       {accentColor === c.id && <Check size={20} className="text-white drop-shadow-lg" />}
                     </div>
                     <span className={`text-[9px] font-black uppercase mt-2 tracking-tighter ${accentColor === c.id ? 'text-brand' : 'text-theme-dim'}`}>
                        {c.id}
                     </span>
                   </button>
                 ))}
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </nav>

    {/* Mobile Floating App Bar */}
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm">
      <div className="bg-theme-card/90 backdrop-blur-xl border border-theme-border rounded-[2rem] p-2 flex justify-between items-center shadow-2xl">
        {[
          { icon: Home, href: '/#hero' },
          { icon: Layers, href: '/#services' },
          { icon: Code, href: '/#work' },
          { icon: BookOpen, href: '/blog' },
          { icon: Mail, href: '/#contact' },
        ].map((item, index) => {
          const Icon = item.icon;
          const active = isLinkActive(item.href);
          return item.href.startsWith('/#') || item.href.startsWith('#') ? (
            <a 
              key={index}
              href={item.href} 
              className={`flex-1 flex justify-center py-3 rounded-2xl transition-all duration-300 ${
                active 
                  ? 'text-brand bg-brand/10' 
                  : 'text-theme-dim hover:text-theme-text'
              }`}
            >
              <Icon size={20} className={active ? 'scale-110' : 'scale-100'} />
            </a>
          ) : (
            <Link 
              key={index}
              to={item.href} 
              className={`flex-1 flex justify-center py-3 rounded-2xl transition-all duration-300 ${
                active 
                  ? 'text-brand bg-brand/10' 
                  : 'text-theme-dim hover:text-theme-text'
              }`}
            >
              <Icon size={20} className={active ? 'scale-110' : 'scale-100'} />
            </Link>
          );
        })}
      </div>
    </div>
  </>
  );
};
