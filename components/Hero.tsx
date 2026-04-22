
import React from 'react';
import { motion } from 'framer-motion';
import { useProfile } from './ProfileContext';
import { ArrowRight, Calendar, MessageCircle, Loader2 } from 'lucide-react';

export const Hero: React.FC = () => {
  const { profile, loading } = useProfile();
  
  if (loading || !profile) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-brand" size={48} />
      </div>
    );
  }

  const whatsappLink = `https://wa.me/${profile.phone.replace(/\+/g, '')}?text=Hello%20${profile.firstName}!`;

  return (
    <section id="hero" className="relative min-h-[90vh] flex items-center py-20 overflow-visible">
      {/* Decorative background elements that stay behind content */}
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-brand/5 rounded-full blur-[120px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[20vw] h-[20vw] bg-blue-500/5 rounded-full blur-[100px] -z-10"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full relative z-10">
        
        {/* Content Column */}
        <div className="lg:col-span-7 order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 bg-theme-card border border-theme-border px-4 py-2 rounded-full mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-theme-dim">
               Available for new projects
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif font-black tracking-tight text-theme-text leading-[1.05] mb-8"
          >
            {profile.firstName}{' '}
            <span className="text-brand">{profile.lastName}.</span>
          </motion.h1>

          <motion.p
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className="text-lg md:text-xl text-theme-dim font-medium max-w-xl leading-relaxed mb-10"
          >
            {profile.tagline} {profile.supportingLine}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <a 
              href="#contact"
              className="px-8 py-4 bg-brand hover:bg-brand-700 text-white font-bold rounded-theme flex items-center justify-center space-x-3 transition-all shadow-lg shadow-brand/20 group"
            >
              <Calendar size={20} />
              <span>Strategy Session</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>

            <a 
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-theme-card border border-theme-border text-theme-text font-bold rounded-theme flex items-center justify-center space-x-3 transition-all hover:bg-theme-bg"
            >
              <MessageCircle size={20} className="text-brand" />
              <span>Quick Chat</span>
            </a>
          </motion.div>
        </div>

        {/* Image Column */}
        <div className="lg:col-span-5 order-1 lg:order-2 flex justify-center lg:justify-end relative z-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative w-full max-w-[400px] aspect-[4/5]"
          >
            {/* Stable Frame */}
            <div className="absolute -inset-4 bg-theme-card rounded-theme border border-theme-border -z-10"></div>
            
            <div className="w-full h-full overflow-hidden rounded-theme shadow-2xl border border-theme-border">
              <img 
                src={profile.image} 
                alt={profile.name} 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105 transform-gpu"
                referrerPolicy="no-referrer"
                loading="eager"
                fetchPriority="high"
              />
              
              <div className="absolute bottom-6 -right-6 bg-theme-card border border-theme-border p-6 rounded-theme shadow-xl z-20 text-center">
                <p className="text-4xl font-serif font-black text-brand mb-1">
                  {profile.stats.find(s => s.label.toLowerCase().includes('year'))?.value || '3'}+
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-theme-dim leading-tight">
                  Years of<br/>Mastery
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
