import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tool } from '../types';
import { Loader2, LayoutGrid, Globe } from 'lucide-react';
import TagCloud from 'TagCloud';
import { useData } from './DataContext';

export const Expertise: React.FC = () => {
  const { skills, loading } = useData();
  const [viewMode, setViewMode] = useState<'grid' | '3d'>('grid');
  const cloudContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewMode === '3d' && !loading && skills.length > 0 && cloudContainerRef.current) {
      cloudContainerRef.current.innerHTML = ''; 

      const radius = window.innerWidth < 768 ? 200 : 350;
      
      const texts = skills.map(s => s.name);
      
      const tc = TagCloud([cloudContainerRef.current] as any, texts, {
        radius: radius,
        maxSpeed: 'fast',
        initSpeed: 'normal',
        keep: true,
      });

      const items = cloudContainerRef.current.querySelectorAll('.tagcloud--item');
      items.forEach((item, i) => {
        const skill = skills[i];
        if (skill) {
          item.innerHTML = `
            <div class="flex flex-col items-center justify-center p-3 glass-card rounded-2xl hover:-translate-y-1 transition-transform cursor-pointer">
              <img src="${skill.icon}" alt="${skill.name}" class="w-8 h-8 md:w-10 md:h-10 object-contain mb-2" />
              <span class="text-[10px] md:text-xs font-label-bold text-on-surface">${skill.name}</span>
            </div>
          `;
        }
      });

      return () => {
        tc.destroy();
      };
    }
  }, [viewMode, loading, skills]);

  return (
    <section id="expertise" className="py-section-padding px-margin-mobile md:px-gutter max-w-container-max mx-auto">
      <div className="mb-stack-lg text-center">
        <span className="font-label-bold text-label-bold text-primary tracking-widest uppercase mb-4 block">Capabilities & Arsenal</span>
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-8">
          Industry Standard <span className="gradient-text">Tech Stack.</span>
        </h2>
        
        <div className="flex justify-center mb-12">
          <div className="flex bg-surface-container p-1 rounded-full border border-surface-variant/20">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-label-bold transition-all ${
                viewMode === 'grid' ? 'bg-primary-container text-white' : 'text-text-secondary hover:text-on-surface'
              }`}
            >
              <LayoutGrid size={16} />
              Grid View
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-label-bold transition-all ${
                viewMode === '3d' ? 'bg-primary-container text-white' : 'text-text-secondary hover:text-on-surface'
              }`}
            >
              <Globe size={16} />
              3D Sphere
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      ) : skills.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-3xl">
          <p className="text-text-secondary italic">No skills listed yet.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
        >
          {skills.map((tool, index) => (
            <motion.div
              key={tool.id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="flex flex-col items-center justify-center p-6 glass-card rounded-2xl group hover:-translate-y-2 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mb-4 relative z-10">
                <img 
                  src={tool.icon} 
                  alt={tool.name} 
                  loading="lazy"
                  className="w-full h-full object-contain opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-300" 
                />
              </div>
              <div className="text-center relative z-10">
                <h4 className="text-sm md:text-base font-bold text-on-surface mb-1 group-hover:text-primary transition-colors">
                  {tool.name}
                </h4>
                <p className="text-[9px] font-black text-text-secondary tracking-widest uppercase">
                  {tool.tag}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="flex justify-center items-center w-full min-h-[400px] md:min-h-[600px] overflow-hidden"
        >
          <div ref={cloudContainerRef} className="tagcloud-wrapper flex justify-center items-center font-body-md text-on-surface relative z-10">
             <style>{`
               .tagcloud--item {
                 transition: transform 0.3s ease;
               }
               .tagcloud--item:hover {
                 z-index: 100 !important;
               }
             `}</style>
          </div>
        </motion.div>
      )}
    </section>
  );
};
