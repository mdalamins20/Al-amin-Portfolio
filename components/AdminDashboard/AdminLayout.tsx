
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation, Outlet } from 'react-router-dom';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { 
  LayoutDashboard, 
  Briefcase, 
  Wrench, 
  BookOpen, 
  MessageSquare, 
  LogOut, 
  Menu, 
  X,
  User,
  ShieldAlert,
  ChevronRight,
  Sun,
  Moon,
  Key,
  Activity,
  Award,
  Palette,
  Users as UsersIcon
} from 'lucide-react';
import { useThemeStore } from '../stores/useThemeStore';
import { useProfileStore } from '../stores/useProfileStore';
import { ThemeSelector } from '../ThemeSelector';
import { motion, AnimatePresence } from 'framer-motion';
import { AISettingsModal } from './AISettingsModal';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);
  const [isSkinMenuOpen, setIsSkinMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleMode } = useThemeStore();
  const { profile } = useProfileStore();
  const mainRef = useRef<HTMLElement>(null);
  const skinMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (skinMenuRef.current && !skinMenuRef.current.contains(event.target as Node)) {
        setIsSkinMenuOpen(false);
      }
    };
    if (isSkinMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSkinMenuOpen]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('adminSessionId');
      await signOut(auth);
      navigate('/admin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/admin-dashboard', color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
    { icon: Briefcase, label: 'Projects', path: '/admin-dashboard/projects', color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
    { icon: Wrench, label: 'Skills', path: '/admin-dashboard/skills', color: 'text-pink-500', bg: 'bg-pink-500/10 border-pink-500/20' },
    { icon: Award, label: 'Experience', path: '/admin-dashboard/experience', color: 'text-cyan-500', bg: 'bg-cyan-500/10 border-cyan-500/20' },
    { icon: BookOpen, label: 'Blogs', path: '/admin-dashboard/blogs', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { icon: UsersIcon, label: 'Newsletter', path: '/admin-dashboard/subscribers', color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-500/20' },
    { icon: MessageSquare, label: 'Reviews', path: '/admin-dashboard/reviews', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
    { icon: Activity, label: 'Analytics', path: '/admin-dashboard/analytics', color: 'text-orange-500', bg: 'bg-orange-500/10 border-orange-500/20' },
    { icon: ShieldAlert, label: 'Security', path: '/admin-dashboard/sessions', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' },
    { icon: User, label: 'Profile', path: '/admin-dashboard/profile', color: 'text-violet-500', bg: 'bg-violet-500/10 border-violet-500/20' },
  ];

  return (
    <div className="h-screen w-full overflow-hidden bg-background flex text-on-surface font-sans selection:bg-primary/20">
      {/* Decorative Ambient Background Glows */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[140px] -z-10 opacity-60 pointer-events-none mix-blend-screen" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] -z-10 opacity-50 pointer-events-none mix-blend-screen" />

      {/* Mobile Top Header & Toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-xl border-b border-surface-variant/30 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center p-0.5 overflow-hidden">
            {profile?.favicon ? (
              <img src={profile.favicon} alt="Favicon" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <span className="text-primary font-black text-sm">A</span>
            )}
          </div>
          <span className="font-black tracking-tighter text-lg text-on-surface">Al-amin<span className="text-primary">.</span></span>
          <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">Admin</span>
        </Link>
        
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2.5 bg-surface text-primary rounded-xl border border-surface-variant/40 shadow-md backdrop-blur-md active:scale-95 transition-transform"
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static top-0 left-0 h-full z-50 flex-shrink-0
        w-72 bg-surface/95 lg:bg-surface/85 backdrop-blur-2xl border-r border-surface-variant/30 dark:border-white/10
        transform transition-transform duration-300 ease-out shadow-2xl lg:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="h-full flex flex-col pt-6 pb-6">
          
          {/* Luxury Brand Header */}
          <div className="px-6 pb-5 border-b border-surface-variant/20 dark:border-white/5 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-surface border border-surface-variant/40 dark:border-white/10 flex items-center justify-center p-1 shadow-sm overflow-hidden group-hover:border-primary/50 transition-colors">
                  {profile?.favicon ? (
                    <img src={profile.favicon} alt="Favicon" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <span className="text-primary font-black text-base">A</span>
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-surface" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black tracking-tight text-lg text-on-surface">Al-amin<span className="text-primary">.</span></span>
                </div>
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Admin Control</p>
              </div>
            </Link>

            {/* Quick Dark/Light Toggle */}
            <button
              onClick={toggleMode}
              className="w-8 h-8 rounded-xl bg-surface-variant/20 dark:bg-white/5 border border-surface-variant/30 dark:border-white/10 flex items-center justify-center text-text-secondary hover:text-primary transition-colors"
              title={`Switch to ${mode === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {mode === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>

          {/* Navigation Menu */}
          <div className="px-5 flex-1 overflow-y-auto custom-scrollbar pt-5 pb-3">
            <p className="text-[11px] font-black text-text-secondary uppercase tracking-widest pl-2 mb-3">Workspace</p>
            <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    group flex items-center justify-between px-3 py-2.5 rounded-2xl transition-all duration-200
                    ${isActive 
                      ? 'bg-primary/10 border border-primary/25 shadow-sm font-bold' 
                      : 'hover:bg-surface-variant/25 dark:hover:bg-white/5 border border-transparent font-medium'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-all
                      ${isActive ? `${item.bg} ${item.color}` : `bg-surface-variant/30 border-surface-variant/40 ${item.color} group-hover:${item.bg} group-hover:border-opacity-100`}`}>
                      <item.icon size={16} />
                    </div>
                    <span className={`text-sm transition-colors ${isActive ? item.color : 'text-on-surface-variant group-hover:text-on-surface'}`}>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight size={14} className={item.color} />}
                </Link>
              );
            })}
            </nav>
          </div>

          {/* Bottom Actions & Skin Picker */}
          <div className="px-5 pt-4 border-t border-surface-variant/20 dark:border-white/5 shrink-0 space-y-2.5">
            {/* Skin Palette Dropdown Toggle */}
            <div className="relative" ref={skinMenuRef}>
              <button
                type="button"
                onClick={() => setIsSkinMenuOpen(!isSkinMenuOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-surface-variant/20 dark:bg-white/5 border border-surface-variant/30 dark:border-white/10 text-xs font-bold text-on-surface hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Palette size={15} className="text-primary" />
                  <span>Color Theme Skin</span>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-primary/20" />
              </button>

              <AnimatePresence>
                {isSkinMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full left-0 right-0 mb-2 z-50"
                  >
                    <ThemeSelector onSelect={() => setIsSkinMenuOpen(false)} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setIsAISettingsOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-white font-bold tracking-wide text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/25"
            >
              <Key size={16} />
              API Settings
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-red-500 hover:bg-red-500/10 transition-colors font-bold text-sm"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main id="admin-main-content" ref={mainRef} className="flex-1 min-w-0 h-full overflow-y-auto w-full scroll-smooth pt-16 lg:pt-0">
        <div className="p-5 md:p-8 lg:p-10 max-w-7xl mx-auto">
          <div className="w-full">
            {children || <Outlet />}
          </div>
        </div>
      </main>
      <AISettingsModal isOpen={isAISettingsOpen} onClose={() => setIsAISettingsOpen(false)} />
    </div>
  );
};
