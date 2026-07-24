import React from 'react';
import { motion } from 'framer-motion';
import { useProfileStore } from './stores/useProfileStore';
import { getIconByName } from './IconMapper';
import { Loader2 } from 'lucide-react';

export const Services: React.FC = () => {
  const { profile, loading } = useProfileStore();

  if (loading || !profile) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <section id="services" className="py-section-padding px-margin-mobile md:px-gutter max-w-container-max mx-auto">
      <div className="mb-stack-lg text-center md:text-left">
        <span className="font-label-bold text-label-bold text-secondary uppercase tracking-widest mb-4 block">Capabilities</span>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">
          Full-Stack <span className="gradient-text">Precision.</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        {profile.services.map((service, index) => {
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card relative p-8 md:p-10 rounded-[2rem] group hover:-translate-y-2 transition-transform flex flex-col"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="w-16 h-16 bg-surface-elevated border border-outline-variant/10 rounded-2xl flex items-center justify-center group-hover:bg-primary-container text-on-surface group-hover:text-white transition-colors">
                  <div className="scale-100 flex items-center justify-center">
                    {getIconByName(service.iconName, 32)}
                  </div>
                </div>
                <span className="text-6xl font-display-xl font-black text-surface-elevated/50 group-hover:text-primary/10 transition-colors">
                  0{index + 1}
                </span>
              </div>
              
              <h4 className="font-headline-md text-2xl text-on-surface mb-4">
                {service.title}
              </h4>
              <p className="font-body-md text-text-secondary leading-relaxed flex-grow">
                {service.description}
              </p>
              {service.benefit && (
                <p className="mt-6 text-primary font-label-bold text-sm uppercase tracking-widest">
                  Benefit: {service.benefit}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
