import React, { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useDataStore } from './stores/useDataStore';
import { useNavigate } from 'react-router-dom';

export const ProjectGrid: React.FC = () => {
  const { projects, loading, init } = useDataStore();
  const navigate = useNavigate();

  useEffect(() => {
    init();
  }, [init]);

  const displayProjects = useMemo(() => {
    if (!projects || projects.length === 0) return [];
    // Copy the array and shuffle it randomly
    const shuffled = [...projects].sort(() => Math.random() - 0.5);
    return shuffled;
  }, [projects]);

  const getBentoClasses = (index: number) => {
    const cycle = index % 8;
    switch (cycle) {
      case 0:
        return 'md:col-span-8 group relative overflow-hidden rounded-2xl border border-surface-variant/20 min-h-[400px] cursor-pointer';
      case 1:
        return 'md:col-span-4 group relative overflow-hidden rounded-2xl border border-surface-variant/20 bg-surface-container cursor-pointer';
      case 2:
      case 3:
      case 4:
        return 'md:col-span-4 glass-card p-8 rounded-2xl cursor-pointer hover:-translate-y-1 transition-transform';
      case 5:
        return 'md:col-span-6 group relative overflow-hidden rounded-2xl border border-surface-variant/20 h-[300px] cursor-pointer';
      case 6:
      case 7:
        return 'md:col-span-6 glass-card p-8 rounded-2xl flex flex-col justify-center cursor-pointer hover:-translate-y-1 transition-transform';
      default:
        return 'md:col-span-4 glass-card p-8 rounded-2xl cursor-pointer hover:-translate-y-1 transition-transform';
    }
  };

  return (
    <section id="work" className="py-section-padding px-margin-mobile md:px-gutter max-w-container-max mx-auto">
      <div className="mb-stack-lg">
        <span className="font-label-bold text-label-bold text-secondary uppercase tracking-widest mb-4 block">Selected Works</span>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Proof of <span className="gradient-text">Quality.</span></h2>
        <p className="text-text-secondary font-body-lg max-w-xl mt-4">Every project is an investment in strategic design and robust engineering, crafted with meticulous attention to detail.</p>
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
                  transition={{ duration: 0.4 }}
                  key={project.id} 
                  className="break-inside-avoid group cursor-pointer bg-surface border border-surface-variant/20 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  onClick={() => navigate(`/project/${project.id}`)}
                >
                  {/* Image section: Full uncropped image with natural aspect ratio */}
                  <div className="w-full bg-surface-variant/10 flex items-center justify-center overflow-hidden">
                    <img 
                      loading="lazy"
                      decoding="async"
                      className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-[1.02]" 
                      src={project.image || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97'} 
                      alt={project.title}
                      referrerPolicy="no-referrer"
                      width="800"
                      height="600"
                    />
                  </div>
                  
                  {/* Text section: Clean presentation below the image */}
                  <div className="p-6 md:p-8">
                    <span className="text-primary font-label-bold text-xs uppercase tracking-widest mb-3 block">
                      {project.category || 'Project'}
                    </span>
                    <h3 className="font-headline-md text-xl md:text-2xl text-on-surface mb-3 line-clamp-1">{project.title}</h3>
                    <p className="text-text-secondary text-sm md:text-base line-clamp-2 md:line-clamp-3 mb-6 leading-relaxed">
                      {project.description}
                    </p>
                    
                    {/* Tech Stack */}
                    {project.techStack && project.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.techStack.slice(0, 4).map(tech => (
                          <span key={tech} className="px-3 py-1 bg-surface-variant/30 rounded-full text-[10px] md:text-xs font-label-bold text-on-surface-variant">
                            {tech}
                          </span>
                        ))}
                        {project.techStack.length > 4 && (
                           <span className="px-3 py-1 bg-surface-variant/30 rounded-full text-[10px] md:text-xs font-label-bold text-on-surface-variant">
                             +{project.techStack.length - 4}
                           </span>
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
