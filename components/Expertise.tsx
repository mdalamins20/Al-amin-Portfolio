import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tool } from '../types';
import { Loader2, Cpu } from 'lucide-react';
import { useDataStore } from './stores/useDataStore';

export const Expertise: React.FC = () => {
  const { skills, loading, init } = useDataStore();

  useEffect(() => {
    init();
  }, [init]);

  return (
    <section id="expertise" className="py-section-padding px-margin-mobile md:px-gutter max-w-container-max mx-auto relative overflow-visible">
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="mb-14 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-label-bold text-xs uppercase tracking-widest mb-4">
          <Cpu size={14} />
          <span>Arsenal &amp; Tooling</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-on-surface tracking-tight mb-4">
          Industry Standard <span className="gradient-text">Tech Stack.</span>
        </h2>
        <p className="text-text-secondary dark:text-slate-300 font-normal text-sm sm:text-base leading-relaxed">
          Crafted with modern languages, resilient frameworks, and high-performance cloud tools to build fast, scalable applications.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      ) : skills.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-3xl">
          <p className="text-text-secondary italic">No skills listed yet.</p>
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5"
        >
          <AnimatePresence>
            {skills.map((tool, index) => (
              <motion.div
                key={tool.id || tool.name}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                className="group relative rounded-2xl p-px bg-gradient-to-b from-surface-variant/30 via-surface-variant/10 to-transparent hover:from-primary/50 hover:via-primary/20 hover:to-transparent transition-all duration-500 hover:-translate-y-1.5 shadow-sm hover:shadow-xl hover:shadow-primary/10"
              >
                <div className="h-full w-full bg-surface/90 dark:bg-slate-950/70 backdrop-blur-xl border border-surface-variant/30 dark:border-white/10 group-hover:border-primary/40 rounded-[15px] p-5 sm:p-6 flex flex-col items-center justify-center text-center relative overflow-hidden transition-colors">
                  {/* Subtle hover backlight */}
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  {/* Icon Container with large proportional size */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-surface-variant/15 dark:bg-white/5 border border-surface-variant/20 dark:border-white/10 flex items-center justify-center p-3 mb-3 group-hover:scale-105 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-300">
                    <img 
                      src={tool.icon} 
                      alt={tool.name} 
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-300" 
                    />
                  </div>

                  {/* Name - Fully visible with multiline wrap */}
                  <h3 className="text-xs sm:text-sm font-bold text-on-surface group-hover:text-primary transition-colors leading-snug line-clamp-2 max-w-full break-words">
                    {tool.name}
                  </h3>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
};
