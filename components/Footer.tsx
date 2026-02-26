
import React from 'react';
import { Link } from 'react-router-dom';
import { USER_INFO, SOCIAL_LINKS, NAV_ITEMS } from '../constants';
import { ArrowUp, FileText, Settings } from 'lucide-react';

export const Footer: React.FC<{ onViewCV: () => void }> = ({ onViewCV }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white dark:bg-[#050505] border-t border-neutral-200 dark:border-neutral-900 pt-20 pb-10 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-20">
          
          <div className="md:col-span-2">
            <h2 className="text-3xl font-serif text-neutral-900 dark:text-white mb-6">
              {USER_INFO.name}<span className="text-brand-600">.</span>
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-sm mb-8">
              Creating high-performance digital products that merge minimalist aesthetics with powerful engineering strategies.
            </p>
            <div className="flex flex-wrap gap-3">
              {SOCIAL_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <a 
                    key={link.name} 
                    href={link.url}
                    target="_blank"
                    rel="noreferrer" 
                    title={link.name}
                    className="w-10 h-10 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-500 hover:text-brand-600 hover:border-brand-600 dark:hover:text-brand-400 dark:hover:border-brand-400 transition-colors"
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-white mb-6">Sitemap</h3>
            <ul className="space-y-4">
              {NAV_ITEMS.map((item) => (
                <li key={item.label}>
                  {item.isAction ? (
                    <button 
                      onClick={onViewCV}
                      className="flex items-center space-x-2 text-neutral-500 dark:text-neutral-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                    >
                      <FileText size={14} />
                      <span>{item.label}</span>
                    </button>
                  ) : (
                    item.href.startsWith('/#') || item.href.startsWith('#') ? (
                      <a href={item.href} className="text-neutral-500 dark:text-neutral-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                        {item.label}
                      </a>
                    ) : (
                      <Link to={item.href} className="text-neutral-500 dark:text-neutral-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                        {item.label}
                      </Link>
                    )
                  )}
                </li>
              ))}
              <li>
                <Link to="/admin-login" className="text-xs font-bold uppercase tracking-widest text-theme-dim hover:text-brand transition-colors flex items-center gap-2">
                  <Settings size={14} />
                  <span>Admin Login</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-white mb-6">Contact</h3>
            <ul className="space-y-4 text-neutral-500 dark:text-neutral-400">
              <li className="font-bold text-slate-900 dark:text-white">{USER_INFO.email}</li>
              <li>{USER_INFO.phone}</li>
              <li>Dhaka, Bangladesh</li>
              <li className="pt-4 text-[10px] font-black uppercase tracking-widest">Available for Remote / Freelance</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-neutral-100 dark:border-neutral-900">
          <p className="text-xs text-neutral-400 font-mono uppercase tracking-widest">
            &copy; {new Date().getFullYear()} {USER_INFO.name}. All Rights Reserved.
          </p>
          
          <button 
            onClick={scrollToTop} 
            className="mt-4 md:mt-0 flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-neutral-900 dark:text-white hover:text-brand-600 transition-colors"
          >
            <span>Back to Top</span>
            <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
};
