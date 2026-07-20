import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useData } from './DataContext';
import { useNavigate } from 'react-router-dom';

export const ProjectGrid: React.FC = () => {
  const { projects, loading } = useData();
  const navigate = useNavigate();

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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          <AnimatePresence>
            {projects.map((project, index) => {
              const cycle = index % 8;
              let classes = 'group relative overflow-hidden rounded-2xl border border-surface-variant/20 cursor-pointer ';
              
              if (cycle === 0) classes += 'md:col-span-8 min-h-[400px]';
              else if (cycle === 1) classes += 'md:col-span-4 min-h-[400px]';
              else if (cycle >= 2 && cycle <= 4) classes += 'md:col-span-4 min-h-[350px]';
              else if (cycle === 5) classes += 'md:col-span-6 min-h-[300px]';
              else classes += 'md:col-span-6 min-h-[350px]';

              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  key={project.id} 
                  className={classes}
                  onClick={() => navigate(`/project/${project.id}`)}
                >
                  <img 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 absolute inset-0" 
                    src={project.image || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97'} 
                    alt={project.title}
                    referrerPolicy="no-referrer"
                  />
                  {/* Always use a dark gradient for image overlays so white text is readable in Light & Dark Mode */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-90 transition-opacity group-hover:opacity-100"></div>
                  
                  <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end z-10">
                    <div className="flex justify-between items-end">
                      <div className="w-full">
                        <span className="text-primary font-label-bold text-label-bold uppercase">
                          {(index + 1).toString().padStart(2, '0')} / {project.category || 'Project'}
                        </span>
                        <h3 className="font-headline-md text-2xl md:text-3xl text-white mt-2 mb-2 line-clamp-1">{project.title}</h3>
                        <p className="text-gray-300 line-clamp-2 md:line-clamp-3 max-w-lg mb-4">
                          {project.description}
                        </p>
                        
                        {/* Only show tech stack for some sizes to keep variety */}
                        {(cycle === 1 || cycle === 0) && project.techStack && (
                          <div className="flex flex-wrap gap-2 mt-4 hidden md:flex">
                            {project.techStack.slice(0, 3).map(tech => (
                              <span key={tech} className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-[10px] font-label-bold border border-white/20 text-white">
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {cycle === 0 && (
                        <div className="items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white font-label-bold hover:bg-white/20 transition-all hidden lg:flex whitespace-nowrap">
                          Case Study <span className="material-symbols-outlined">arrow_forward</span>
                        </div>
                      )}
                    </div>
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
