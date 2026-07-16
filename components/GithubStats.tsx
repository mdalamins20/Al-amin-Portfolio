import React, { useEffect, useState } from 'react';
import { SectionWrapper } from './SectionWrapper';
import { motion } from 'framer-motion';
import { Github, Star, GitFork, BookOpen, Activity } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { useProfile } from './ProfileContext';

export const GithubStats: React.FC = () => {
  const username = "mdalamins20";
  const { theme } = useTheme();
  const { profile } = useProfile();

  return (
    <SectionWrapper id="github-stats" className="py-20 md:py-32">
      <div className="mb-12 md:mb-20 text-center md:text-left">
        <h2 className="text-brand font-bold uppercase tracking-[0.25em] text-xs mb-3 flex items-center justify-center md:justify-start gap-2">
          <Github size={16} />
          <span>Open Source</span>
        </h2>
        <h3 className="text-3xl md:text-6xl lg:text-7xl font-serif font-bold text-slate-900 dark:text-white tracking-tighter">
          Code <span className="text-brand">Activity.</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Stats Cards */}
        <div className="flex flex-col gap-4 md:gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-slate-900/40 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-xl hover:border-brand/30 transition-all duration-300 flex items-center gap-4 group"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-brand/10 flex items-center justify-center text-brand group-hover:scale-110 transition-transform">
              <BookOpen size={24} className="md:w-7 md:h-7" />
            </div>
            <div>
              <p className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Repositories</p>
              <p className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mt-1">
                {profile?.githubReposCount || "0"}
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-900/40 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-xl hover:border-brand/30 transition-all duration-300 flex items-center gap-4 group"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
              <Star size={24} className="md:w-7 md:h-7" />
            </div>
            <div>
              <p className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Stars</p>
              <p className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mt-1">
                {profile?.githubTotalStars || "0"}
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-900/40 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-xl hover:border-brand/30 transition-all duration-300 flex items-center gap-4 group"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
              <GitFork size={24} className="md:w-7 md:h-7" />
            </div>
            <div>
              <p className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Forks</p>
              <p className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mt-1">
                {profile?.githubTotalForks || "0"}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Contribution Graph & Top Languages */}
        <div className="lg:col-span-2 flex flex-col gap-4 md:gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-900/40 p-6 md:p-10 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand/10 rounded-xl text-brand">
                    <Activity size={20} />
                </div>
                <h4 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Contribution Graph</h4>
              </div>
              <a 
                href={`https://github.com/${username}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs font-bold text-brand hover:text-brand-700 bg-brand/10 px-4 py-2 rounded-full transition-colors flex items-center gap-2 self-start sm:self-auto"
              >
                View GitHub <Github size={12} />
              </a>
            </div>
            
            <div className="flex-grow flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-8 md:p-12 relative z-10 border border-slate-100 dark:border-white/5 overflow-hidden text-center">
               <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-10 pointer-events-none">
                 <div className="w-[300px] h-[300px] md:w-[600px] md:h-[300px] rounded-[100%] bg-brand blur-[80px]" />
               </div>
               
               <p className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 tracking-widest uppercase mb-4 relative z-20">Total Contributions</p>
               <h3 className="text-6xl md:text-8xl lg:text-[100px] font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-800 to-slate-400 dark:from-white dark:to-slate-500 tracking-tighter relative z-20">
                 {profile?.githubTotalContributions || "0"}
               </h3>
               <p className="text-xs md:text-sm font-medium text-slate-400 mt-4 max-w-sm relative z-20">In the last year</p>
            </div>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
};
