import React from 'react';
import { motion } from 'framer-motion';
import { useProfileStore } from './stores/useProfileStore';
import { getIconByName } from './IconMapper';
import { Loader2 } from 'lucide-react';

export const Services: React.FC = () => {
  const { profile, loading } = useProfileStore();

  if (loading || !profile) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <section id="services" className="py-section-padding px-margin-mobile md:px-gutter max-w-container-max mx-auto relative">
      {/* Background ambient glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="mb-stack-lg flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 mb-4">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="font-label-bold text-xs text-secondary uppercase tracking-widest">Specialized Capabilities</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">
            Full-Stack <span className="gradient-text">Precision.</span>
          </h2>
        </div>
        <p className="text-text-secondary font-body-md max-w-md">
          Delivering end-to-end digital mastery — from robust backend architectures to captivating, fluid user experiences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {profile.services.map((service, index) => {
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: index * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative group rounded-3xl p-px bg-gradient-to-b from-surface-variant/40 via-surface-variant/10 to-transparent hover:from-primary/50 hover:via-primary/20 hover:to-transparent transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-primary/10"
            >
              <div className="h-full w-full bg-surface/90 dark:bg-slate-950/70 backdrop-blur-xl p-7 md:p-9 rounded-[23px] flex flex-col justify-between overflow-hidden relative">
                {/* Decorative subtle background grid pattern & watermarks */}
                <div className="absolute -top-12 -right-12 w-36 h-36 bg-primary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                
                <div>
                  {/* Top Bar: Icon + Modern Index Number */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 dark:bg-primary/15 border border-primary/25 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                      <div className="scale-105 flex items-center justify-center">
                        {getIconByName(service.iconName, 26)}
                      </div>
                    </div>
                    <span className="font-mono text-3xl font-black text-on-surface/15 dark:text-white/10 group-hover:text-primary/30 transition-colors">
                      0{index + 1}
                    </span>
                  </div>
                  
                  {/* Title */}
                  <h3 className="font-headline-md text-xl md:text-2xl text-on-surface font-bold tracking-tight mb-3 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="font-body-md text-text-secondary dark:text-slate-300 text-sm md:text-[15px] leading-relaxed mb-6">
                    {service.description}
                  </p>
                </div>

                {/* Bottom Impact / Benefit Pill */}
                {service.benefit && (
                  <div className="mt-auto pt-4 border-t border-surface-variant/20 dark:border-white/5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <span className="font-semibold uppercase tracking-wider text-[10px] opacity-80 mr-1.5">Impact:</span>
                      {service.benefit}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
