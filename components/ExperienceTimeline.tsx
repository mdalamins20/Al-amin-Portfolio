import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Loader2 } from 'lucide-react';
import { useDataStore } from './stores/useDataStore';

export const ExperienceTimeline: React.FC = () => {
  const { experiences, loading, init } = useDataStore();

  React.useEffect(() => {
    init();
  }, [init]);

  const sortedExperiences = [...experiences].reverse();
  
  return (
    <section id="experience" className="py-section-padding px-margin-mobile md:px-gutter max-w-container-max mx-auto relative overflow-visible">
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Unified Section Header */}
      <div className="mb-14 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-label-bold text-xs uppercase tracking-widest mb-4">
          <Briefcase size={14} />
          <span>Career Journey</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-on-surface tracking-tight mb-4">
          Professional <span className="gradient-text">Experience.</span>
        </h2>
        <p className="text-text-secondary dark:text-slate-300 font-normal text-sm sm:text-base leading-relaxed">
          A timeline of my professional journey, highlighting key roles, achievements, and the technologies I've mastered.
        </p>
      </div>

      <div className="relative max-w-4xl mx-auto">
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/40 via-surface-variant/30 to-transparent rounded-full transform -translate-x-1/2"></div>

        <div className="space-y-10">
          {loading ? (
             <div className="flex justify-center py-10">
               <Loader2 className="animate-spin text-primary" size={40} />
             </div>
          ) : sortedExperiences.length === 0 ? (
             <div className="text-center py-20 rounded-3xl border border-surface-variant/30 bg-surface/80 dark:bg-slate-900/60 backdrop-blur-xl relative overflow-hidden group max-w-lg mx-auto">
               <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
               <Briefcase size={40} className="mx-auto text-primary/40 mb-4" />
               <h3 className="text-xl font-bold text-on-surface mb-2 relative z-10">My Journey Starts Here</h3>
               <p className="text-text-secondary relative z-10">Experience data will be updated soon. Stay tuned!</p>
             </div>
          ) : sortedExperiences.map((exp, index) => (
            <motion.div 
              key={exp.id || index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
              className={`relative flex flex-col md:flex-row items-start ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
            >
              <div className="absolute left-4 md:left-1/2 w-8 h-8 rounded-full bg-surface dark:bg-slate-950 border-2 border-primary flex items-center justify-center transform -translate-x-1/2 mt-1 md:mt-0 shadow-lg shadow-primary/30 z-10">
                <Briefcase size={13} className="text-primary" />
              </div>

              <div className={`w-full md:w-1/2 pl-12 md:pl-0 ${index % 2 === 0 ? 'md:pr-14 text-left md:text-right' : 'md:pl-14 text-left'}`}>
                <div className="group rounded-3xl p-px bg-gradient-to-b from-surface-variant/40 via-surface-variant/10 to-transparent hover:from-primary/50 hover:via-primary/20 hover:to-transparent transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
                  <div className="bg-surface/85 dark:bg-slate-950/70 backdrop-blur-xl p-6 sm:p-8 rounded-[23px] border border-surface-variant/30 dark:border-white/10">
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-3 border border-primary/20">
                      {exp.period}
                    </span>
                    <h3 className="text-xl md:text-2xl font-bold text-on-surface mb-1 group-hover:text-primary transition-colors tracking-tight">{exp.role}</h3>
                    <h4 className="text-xs sm:text-sm font-bold text-text-secondary dark:text-slate-400 uppercase tracking-wider mb-4">{exp.company}</h4>
                    <p className="text-sm text-text-secondary dark:text-slate-300 leading-relaxed mb-6 whitespace-pre-wrap font-normal">
                      {exp.description}
                    </p>
                    
                    <div className={`flex flex-wrap gap-1.5 ${index % 2 === 0 ? 'md:justify-end' : 'justify-start'}`}>
                      {(exp.technologies || []).map(tech => (
                        <span key={tech} className="px-2.5 py-1 bg-surface-variant/20 dark:bg-white/5 border border-surface-variant/30 dark:border-white/10 rounded-md text-[11px] font-medium text-on-surface-variant dark:text-slate-300">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
