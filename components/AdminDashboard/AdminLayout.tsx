
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
  Activity
} from 'lucide-react';
import { useThemeStore } from '../stores/useThemeStore';
import { motion, AnimatePresence } from 'framer-motion';
import { AISettingsModal } from './AISettingsModal';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleMode } = useThemeStore();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/admin-dashboard' },
    { icon: Briefcase, label: 'Projects', path: '/admin-dashboard/projects' },
    { icon: Wrench, label: 'Skills', path: '/admin-dashboard/skills' },
    { icon: BookOpen, label: 'Blogs', path: '/admin-dashboard/blogs' },
    { icon: MessageSquare, label: 'Reviews', path: '/admin-dashboard/reviews' },
    { icon: Activity, label: 'Analytics', path: '/admin-dashboard/analytics' },
    { icon: User, label: 'Profile', path: '/admin-dashboard/profile' },
  ];

  return (
    <div className="h-screen w-full overflow-hidden bg-background flex text-on-surface font-sans selection:bg-brand/30">
      {/* Decorative Background Glows */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-brand/20 rounded-full blur-[120px] -z-10 opacity-50 pointer-events-none mix-blend-screen" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] -z-10 opacity-50 pointer-events-none mix-blend-screen" />

      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2.5 bg-surface text-brand rounded-xl border border-outline-variant shadow-lg backdrop-blur-md"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static top-0 left-0 h-full z-40 flex-shrink-0
        w-72 bg-surface lg:bg-surface/80 backdrop-blur-xl border-r border-outline-variant
        transform transition-transform duration-500 ease-out shadow-2xl lg:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="h-full flex flex-col pt-8 pb-6 px-6 overflow-y-auto overflow-x-hidden">
          <div className="flex items-center gap-4 mb-12">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand to-purple-500 rounded-2xl blur opacity-70 group-hover:opacity-100 transition duration-200"></div>
              <div className="w-12 h-12 relative rounded-2xl bg-surface flex items-center justify-center text-brand font-black text-2xl border border-outline-variant shadow-inner">
                A
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">Admin Panel</span>
              <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-brand mt-0.5">
                <ShieldAlert size={10} />
                <span>Secure Console</span>
              </div>
            </div>
          </div>

          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2 mb-4">Menu</p>
          <nav className="flex-1 space-y-1.5">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300
                    ${isActive 
                      ? 'bg-gradient-to-r from-brand/10 to-transparent dark:from-brand/20 dark:to-brand/5 border border-brand/20 text-brand shadow-sm shadow-brand/5' 
                      : 'text-on-surface-variant hover:bg-surface-variant hover:text-slate-900 dark:hover:text-white border border-transparent'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} className={isActive ? 'text-brand' : 'group-hover:text-brand transition-colors'} />
                    <span className="font-semibold text-sm">{item.label}</span>
                  </div>
                  {isActive && <ChevronRight size={14} className="text-brand" />}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-outline-variant">
            <button
              onClick={toggleMode}
              className="w-full mb-3 flex items-center justify-between px-4 py-3 rounded-xl bg-surface-variant text-on-surface-variant font-bold tracking-wide text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-sm"
            >
              <span>{mode === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              {mode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={() => setIsAISettingsOpen(true)}
              className="w-full mb-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-brand to-purple-600 text-white font-bold tracking-wide text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-brand/20"
            >
              <Key size={16} />
              API Settings
            </button>
            <Link 
              to="/"  
              className="w-full mb-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-on-surface text-surface font-bold tracking-wide text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-black/10 dark:shadow-white/10"
            >
              View Live Site
            </Link>
            
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-variant border border-outline-variant mb-3">
              <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-outline-variant flex items-center justify-center text-slate-500">
                <User size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-on-surface truncate">Admin Account</p>
                <p className="text-[10px] text-slate-500 truncate">{auth.currentUser?.email}</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-bold text-sm"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main ref={mainRef} className="flex-1 min-w-0 h-full overflow-y-auto w-full scroll-smooth">
        <div className="p-6 md:p-8 lg:p-12 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children || <Outlet />}
          </motion.div>
        </div>
      </main>
      <AISettingsModal isOpen={isAISettingsOpen} onClose={() => setIsAISettingsOpen(false)} />
    </div>
  );
};
