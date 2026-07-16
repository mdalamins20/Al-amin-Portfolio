
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, CheckCircle2, Loader2, Code } from 'lucide-react';
import { SectionWrapper } from './SectionWrapper';
import { db, isConfigured } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Project } from '../types';
import { PROJECTS as FALLBACK_PROJECTS } from '../constants';

export const ProjectGrid: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!isConfigured || !db) {
        setProjects(FALLBACK_PROJECTS);
        setLoading(false);
        return;
      }
      try {
        const q = query(collection(db, 'projects'), orderBy('id', 'desc'));
        const querySnapshot = await getDocs(q);
        const projectsData = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as Project[];
        
        if (projectsData.length > 0) {
          setProjects(projectsData);
        } else {
          setProjects(FALLBACK_PROJECTS);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjects(FALLBACK_PROJECTS);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <SectionWrapper id="work" className="py-20 bg-theme-card dark:bg-theme-bg/50 transition-colors duration-500 rounded-[3rem] my-10">
      <div className="flex flex-col items-center md:items-start mb-16 md:mb-24 text-center md:text-left relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
           <div className="inline-flex items-center gap-3 mb-4">
             <div className="w-8 h-[1px] bg-brand/50"></div>
             <h2 className="text-brand font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs">Selected Works</h2>
             <div className="w-8 h-[1px] bg-brand/50 md:hidden"></div>
           </div>
           <h3 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-theme-text mb-6">
             Proof of Quality<span className="text-brand">.</span>
           </h3>
           <p className="text-base md:text-lg text-theme-dim max-w-xl font-light">
             Every project is an investment in strategic design and robust engineering, crafted with meticulous attention to detail.
           </p>
        </motion.div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
          <Loader2 className="animate-spin text-brand" size={56} />
          <p className="text-theme-dim font-medium tracking-wide">Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-32 bg-theme-bg/30 backdrop-blur-sm rounded-[3rem] border border-dashed border-theme-border">
          <p className="text-theme-dim text-lg">No projects added yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10 w-full">
          {projects.map((project, index) => (
            <motion.a
              key={project.id}
              href={project.link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group relative flex flex-col bg-theme-bg dark:bg-theme-card border border-theme-border transition-all duration-300 hover:z-10 hover:shadow-xl hover:border-brand/30 rounded-2xl md:rounded-[2.5rem] overflow-hidden"
            >
              {/* Project Image */}
              <div className="aspect-[16/10] overflow-hidden relative bg-theme-bg">
                {project.image ? (
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 transform-gpu"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-theme-card">
                    <Code size={48} className="text-theme-dim opacity-20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              <div className="p-3 md:p-6 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-2 md:mb-4">
                   <div></div>
                   <span className="text-3xl md:text-4xl font-serif font-bold text-theme-border/30 dark:text-theme-border/20 select-none transition-colors group-hover:text-brand/10">
                      {index + 1 < 10 ? `0${index + 1}` : index + 1}
                   </span>
                </div>

                <div className="flex-grow mb-3 md:mb-4">
                   <h3 className="text-base md:text-2xl font-serif font-bold text-theme-text leading-tight group-hover:text-brand transition-colors mb-1 md:mb-2 line-clamp-1 md:line-clamp-none">
                      {project.title}
                   </h3>
                   <p className="text-theme-dim text-xs md:text-xs leading-relaxed mb-2 md:mb-4 line-clamp-2 md:line-clamp-3">
                     {project.description}
                   </p>
                   
                   <div className="flex flex-wrap gap-1">
                     {project.techStack?.slice(0, 3).map(tech => (
                       <span key={tech} className="text-[8px] md:text-[9px] font-black bg-theme-card dark:bg-theme-bg border border-theme-border px-1.5 py-0.5 md:px-2 md:py-0.5 rounded text-theme-dim">{tech}</span>
                     ))}
                   </div>
                </div>

                <div className="pt-3 md:pt-4 border-t border-theme-border flex justify-between items-center transition-colors group-hover:border-brand/20">
                   <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.25em] text-theme-dim group-hover:text-brand transition-colors">
                      Case Study
                   </span>
                   <div className="w-8 h-8 md:w-10 md:h-10 bg-theme-card dark:bg-theme-bg rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-brand group-hover:text-white border border-theme-border group-hover:border-brand shadow-sm">
                      <ArrowUpRight size={14} className="md:w-[18px] md:h-[18px]" />
                   </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      )}
    </SectionWrapper>
  );
};
