import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Loader2 } from 'lucide-react';
import { useDataStore } from './stores/useDataStore';

export const ExperienceTimeline: React.FC = () => {
  const { experiences, loading } = useDataStore();

  const sortedExperiences = [...experiences].reverse();
  
  return (
    <section id="experience" className="py-section-padding px-margin-mobile md:px-gutter max-w-container-max mx-auto">
      <div className="mb-stack-lg text-center">
        <span className="font-label-bold text-label-bold text-secondary uppercase tracking-widest mb-4 block">Career Journey</span>
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">
          Professional <span className="gradient-text">Experience.</span>
        </h2>
        <p className="text-text-secondary font-body-lg max-w-xl mx-auto">
          A timeline of my professional journey, highlighting key roles, achievements, and the technologies I've mastered.
        </p>
      </div>

      <div className="relative max-w-4xl mx-auto">
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-surface-variant/30 rounded-full transform -translate-x-1/2"></div>

        <div className="space-y-12">
          {loading ? (
             <div className="flex justify-center py-10">
               <Loader2 className="animate-spin text-primary" size={40} />
             </div>
          ) : sortedExperiences.length === 0 ? (
             <div className="text-center py-20 glass-card rounded-3xl border border-surface-variant/30 relative overflow-hidden group max-w-lg mx-auto">
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
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`relative flex flex-col md:flex-row items-start ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
            >
              <div className="absolute left-4 md:left-1/2 w-8 h-8 rounded-full bg-surface-deep border-4 border-primary flex items-center justify-center transform -translate-x-1/2 mt-1 md:mt-0 shadow-[0_0_15px_rgba(var(--accent-rgb),0.4)] z-10">
                <Briefcase size={12} className="text-primary" />
              </div>

              <div className={`w-full md:w-1/2 pl-12 md:pl-0 ${index % 2 === 0 ? 'md:pr-16 text-left md:text-right' : 'md:pl-16 text-left'}`}>
                <div className="glass-card rounded-3xl p-6 md:p-8 hover:-translate-y-1 transition-transform group">
                  <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-label-bold uppercase tracking-widest mb-4 border border-primary/20">
                    {exp.period}
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold text-on-surface mb-1 group-hover:text-primary transition-colors">{exp.role}</h3>
                  <h4 className="text-sm font-label-bold text-text-secondary uppercase tracking-wider mb-4">{exp.company}</h4>
                  <p className="text-sm text-text-secondary leading-relaxed mb-6 break-words whitespace-pre-wrap" style={{ overflowWrap: 'anywhere' }}>
                    {exp.description}
                  </p>
                  
                  <div className={`flex flex-wrap gap-2 ${index % 2 === 0 ? 'md:justify-end' : 'justify-start'}`}>
                    {exp.technologies.map(tech => (
                      <span key={tech} className="px-3 py-1 bg-surface-elevated border border-outline-variant/10 rounded-lg text-xs font-label-bold text-on-surface">
                        {tech}
                      </span>
                    ))}
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
