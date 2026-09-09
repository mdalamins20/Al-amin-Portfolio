import React, { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ExternalLink, Smartphone, Layers } from 'lucide-react';
import { useDataStore } from './stores/useDataStore';

export const ProjectGrid: React.FC = () => {
  const { projects, loading, init } = useDataStore();

  useEffect(() => {
    init();
  }, [init]);

  const displayProjects = useMemo(() => {
    if (!projects || projects.length === 0) return [];
    return [...projects];
  }, [projects]);

  return (
    <section id="work" className="py-section-padding px-margin-mobile md:px-gutter max-w-container-max mx-auto relative overflow-visible">
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Unified Section Header */}
      <div className="mb-14 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-label-bold text-xs uppercase tracking-widest mb-4">
          <Layers size={14} />
          <span>Selected Works</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-on-surface tracking-tight mb-4">
          Proof of <span className="gradient-text">Quality.</span>
        </h2>
        <p className="text-text-secondary dark:text-slate-300 font-normal text-sm sm:text-base leading-relaxed">
          Every project is an investment in strategic design and robust engineering, crafted with meticulous attention to detail.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-text-secondary">No projects added yet.</p>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          <AnimatePresence>
            {displayProjects.map((project, index) => {
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  key={project.id} 
                  className="break-inside-avoid group flex flex-col bg-surface/80 dark:bg-surface-variant/10 backdrop-blur-md border border-surface-variant/25 dark:border-white/10 rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1.5 transition-all duration-300"
                >
                  {/* Image section */}
                  <div className="w-full relative bg-surface-variant/5 dark:bg-black/20 overflow-hidden group/img">
                    <img 
                      loading="lazy"
                      decoding="async"
                      className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" 
                      src={project.image || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97'} 
                      alt={project.title}
                      referrerPolicy="no-referrer"
                      width="800"
                      height="600"
                    />
                  </div>
                  
                  {/* Card Content */}
                  <div className="p-6 md:p-7 flex flex-col grow">
                    {/* Category Pill with high contrast */}
                    {project.category && (
                      <div className="mb-2">
                        <span className="inline-block px-2.5 py-1 text-[10px] md:text-[11px] font-bold uppercase tracking-wider rounded-md bg-primary/10 text-primary border border-primary/20">
                          {project.category}
                        </span>
                      </div>
                    )}

                    {/* Title & App Version Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-headline-md text-xl md:text-2xl text-on-surface font-bold tracking-tight group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      {project.appVersion && (
                        <span className="shrink-0 px-2 py-0.5 text-[11px] font-mono font-medium rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          v{project.appVersion.replace(/^v/, '')}
                        </span>
                      )}
                    </div>

                    {/* Full Description with improved typography and breathing space */}
                    <p className="text-text-secondary dark:text-slate-300 text-sm md:text-[15px] leading-relaxed mb-6 font-normal">
                      {project.description}
                    </p>
                    
                    {/* Modern Tech Stack Badges */}
                    {project.techStack && project.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {project.techStack.map(tech => (
                          <span 
                            key={tech} 
                            className="px-2.5 py-1 bg-surface-variant/20 dark:bg-white/5 hover:bg-surface-variant/35 border border-surface-variant/30 dark:border-white/10 rounded-md text-[11px] font-medium text-on-surface-variant dark:text-slate-300 transition-colors"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Action Links - Side by side Premium CTAs */}
                    {(project.appLink || project.link) && (
                      <div className="mt-auto pt-4 border-t border-surface-variant/15 dark:border-white/10 flex items-center gap-2.5">
                        {project.appLink && (
                          <a 
                            href={project.appLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95 font-label-bold text-xs md:text-sm rounded-full shadow-sm hover:shadow-emerald-600/25 transition-all text-center whitespace-nowrap"
                          >
                            <Smartphone size={15} /> 
                            <span>Download App</span>
                          </a>
                        )}
                        {project.link && (
                          <a 
                            href={project.link}
                            target="_blank"
                            rel="noreferrer"
                            className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-white active:scale-95 border border-primary/25 hover:border-primary font-label-bold text-xs md:text-sm rounded-full transition-all text-center whitespace-nowrap shadow-sm hover:shadow-md hover:shadow-primary/20 ${project.appLink ? 'flex-1' : 'w-full'}`}
                          >
                            <span>Live Preview</span>
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
};
