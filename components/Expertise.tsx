import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Tool } from '../types';
import { Loader2 } from 'lucide-react';
import { useDataStore } from './stores/useDataStore';

export const Expertise: React.FC = () => {
  const { skills, loading } = useDataStore();

  return (
    <section id="expertise" className="py-section-padding px-margin-mobile md:px-gutter max-w-container-max mx-auto">
      <div className="mb-stack-lg text-center">
        <span className="font-label-bold text-label-bold text-primary tracking-widest uppercase mb-4 block">Capabilities & Arsenal</span>
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-8">
          Industry Standard <span className="gradient-text">Tech Stack.</span>
        </h2>
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
      )}
    </section>
  );
};
