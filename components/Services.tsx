import React from 'react';
import { SectionWrapper } from './SectionWrapper';
import { motion } from 'framer-motion';
import { useProfile } from './ProfileContext';
import { getIconByName } from './IconMapper';
import { Loader2 } from 'lucide-react';

export const Services: React.FC = () => {
  const { profile, loading } = useProfile();

  if (loading || !profile) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Loader2 className="animate-spin text-brand" size={48} />
      </div>
    );
  }

  return (
    <SectionWrapper id="services" className="py-24 relative overflow-hidden">
      <div className="mb-20 text-center md:text-left">
        <h2 className="text-brand-600 font-bold uppercase tracking-[0.25em] text-xs mb-3">
          Capabilities
        </h2>
        <h3 className="text-4xl md:text-7xl font-serif font-bold text-slate-950 dark:text-white">
          Full-Stack Precision.
        </h3>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {profile.services.map((service, index) => {
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-brand-500/30 transition-all duration-300 group shadow-sm hover:shadow-xl hover:-translate-y-1 will-change-transform transform-gpu"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-all duration-500 shadow-sm">
                  {getIconByName(service.iconName, 32)}
                </div>
                <span className="text-6xl font-serif font-black text-slate-100 dark:text-slate-800 transition-colors group-hover:text-brand-600/10">
                  0{index + 1}
                </span>
              </div>
              
              <h4 className="text-2xl font-bold text-slate-950 dark:text-white mb-4">
                {service.title}
              </h4>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-lg font-medium">
                {service.description}
              </p>
              {service.benefit && (
                <p className="mt-4 text-brand text-sm font-bold uppercase tracking-widest">
                  Benefit: {service.benefit}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </SectionWrapper>
  );
};
