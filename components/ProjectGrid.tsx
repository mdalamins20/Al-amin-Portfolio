
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
          setProjects([]);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <SectionWrapper id="work" className="py-20 bg-theme-card dark:bg-theme-bg/50 transition-colors duration-500 rounded-[3rem] my-10">
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-20 text-center md:text-left">
        <div>
           <h2 className="text-brand font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs mb-3">Selected Works</h2>
           <h3 className="text-4xl md:text-6xl font-serif font-bold text-theme-text">
             Proof of Quality<span className="text-brand">.</span>
           </h3>
           <p className="text-sm text-theme-dim mt-4 max-w-sm">Every project is an investment in strategic design and robust engineering.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-brand" size={48} />
          <p className="text-theme-dim font-medium">Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-theme-card rounded-[3rem] border border-dashed border-theme-border">
          <p className="text-theme-dim italic">No projects added yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {projects.map((project, index) => (
            <motion.a
              key={project.id}
              href={project.link || '#'}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group relative flex flex-col bg-theme-bg dark:bg-theme-card border border-theme-border transition-all duration-300 hover:z-10 hover:shadow-xl hover:border-brand/30 rounded-[2.5rem] overflow-hidden will-change-transform"
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

              <div className="p-8 md:p-10 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-8">
                   <div>
                     <span className="px-4 py-1.5 bg-theme-card dark:bg-theme-bg text-theme-dim text-[10px] font-bold uppercase tracking-widest rounded-full border border-theme-border transition-colors group-hover:bg-brand/10 group-hover:text-brand group-hover:border-brand/20">
                        {project.category}
                     </span>
                     <p className="text-[10px] font-bold text-theme-dim mt-4 uppercase tracking-widest">Role: {project.role}</p>
                   </div>
                   <span className="text-5xl font-serif font-bold text-theme-border/30 dark:text-theme-border/20 select-none transition-colors group-hover:text-brand/10">
                      {index + 1 < 10 ? `0${index + 1}` : index + 1}
                   </span>
                </div>

                <div className="flex-grow mb-8">
                   <h3 className="text-2xl md:text-3xl font-serif font-bold text-theme-text leading-tight group-hover:text-brand transition-colors mb-4">
                      {project.title}
                   </h3>
                   <p className="text-theme-dim text-sm leading-relaxed mb-6 line-clamp-3">
                     {project.description}
                   </p>
                   
                   {project.result && (
                     <div className="flex items-center space-x-2 text-brand mb-6">
                        <CheckCircle2 size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">{project.result}</span>
                     </div>
                   )}

                   <div className="flex flex-wrap gap-2">
                     {project.techStack?.map(tech => (
                       <span key={tech} className="text-[9px] font-black bg-theme-card dark:bg-theme-bg border border-theme-border px-3 py-1 rounded text-theme-dim">{tech}</span>
                     ))}
                   </div>
                </div>

                <div className="pt-8 border-t border-theme-border flex justify-between items-center transition-colors group-hover:border-brand/20">
                   <span className="text-[10px] font-black uppercase tracking-[0.25em] text-theme-dim group-hover:text-brand transition-colors">
                      Case Study
                   </span>
                   <div className="w-10 h-10 bg-theme-card dark:bg-theme-bg rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-brand group-hover:text-white border border-theme-border group-hover:border-brand shadow-sm">
                      <ArrowUpRight size={18} />
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
