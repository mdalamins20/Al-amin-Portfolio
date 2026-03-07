
import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
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
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin-login');
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
    { icon: User, label: 'Profile', path: '/admin-dashboard/profile' },
  ];

  return (
    <div className="min-h-screen bg-theme-bg flex">
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-brand text-white rounded-lg shadow-lg"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-theme-card border-r border-theme-border
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center text-white font-bold text-xl">
              A
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-theme-text">Admin Panel</span>
              <Link to="/" className="text-[10px] font-bold uppercase tracking-widest text-brand hover:underline">View Site</Link>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${isActive 
                      ? 'bg-brand text-white shadow-lg shadow-brand/20' 
                      : 'text-theme-dim hover:bg-theme-bg hover:text-theme-text'}
                  `}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-theme-border">
            <div className="flex items-center gap-3 mb-6 px-4">
              <div className="w-8 h-8 rounded-full bg-theme-bg border border-theme-border flex items-center justify-center text-theme-dim">
                <User size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-theme-text truncate">Admin User</p>
                <p className="text-xs text-theme-dim truncate">{auth.currentUser?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all font-medium"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="p-6 lg:p-10 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
