import React from 'react';
import { motion } from 'framer-motion';
import { useProfileStore } from './stores/useProfileStore';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export const Hero: React.FC = () => {
  const { profile, loading } = useProfileStore();
  
  if (loading || !profile) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  // Find years of experience
  const yearsExp = profile.stats.find(s => s.label.toLowerCase().includes('year'))?.value || '5';

  return (
    <>
      <Helmet>
        <link rel="preload" as="image" href={profile.image} fetchPriority="high" />
      </Helmet>
      <section id="hero" className="relative pt-4 md:pt-16 pb-section-padding px-margin-mobile md:px-gutter max-w-container-max mx-auto">
        <div className="hero-glow -top-20 -left-20"></div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-stack-lg items-center">
        <div className="space-y-stack-md">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/10 border border-primary/20 text-primary font-label-bold text-label-bold"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            AVAILABLE FOR NEW PROJECTS
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display-xl-mobile md:font-display-xl text-display-xl-mobile md:text-display-xl text-on-background"
          >
            {profile.firstName} <br/> <span className="gradient-text">{profile.lastName}.</span>
          </motion.h1>
          
          <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className="font-headline-md text-headline-md text-on-surface opacity-90 font-medium"
          >
             {profile.tagline || 'Full Stack Developer'}
          </motion.p>
          
          <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
             className="font-body-lg text-body-lg text-text-secondary max-w-xl"
          >
            {profile.supportingLine || 'Transforming Complex Problems Into Elegant Digital Solutions. I help startups and businesses build fast, modern, conversion-focused websites that scale effortlessly.'}
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-4 pt-4"
          >
            <Link to="/#contact" className="flex items-center gap-2 px-8 py-4 bg-primary-container text-white rounded-lg font-label-bold text-label-bold hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary-container/30">
              <span className="material-symbols-outlined">event</span>
              Strategy Session
            </Link>
            {profile.cvFileUrl ? (
              <a 
                href={profile.cvFileUrl}
                download={`${profile.firstName}_CV.pdf`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-8 py-4 border border-outline text-on-surface rounded-lg font-label-bold text-label-bold hover:bg-surface-elevated transition-all"
              >
                <span className="material-symbols-outlined">download</span>
                Download PDF
              </a>
            ) : (
              <button 
                disabled
                className="flex items-center gap-2 px-8 py-4 border border-outline text-on-surface rounded-lg font-label-bold text-label-bold hover:bg-surface-elevated transition-all opacity-50 cursor-not-allowed"
                title="CV not uploaded yet"
              >
                <span className="material-symbols-outlined">download</span>
                Download PDF
              </button>
            )}
          </motion.div>
        </div>
        
        <motion.div 
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.8 }}
           className="relative justify-self-center lg:justify-self-end"
        >
          <div className="relative z-10 w-full max-w-md rounded-[2rem] overflow-hidden border-2 border-surface-variant/30 shadow-2xl">
            <img 
              className="w-full h-auto max-h-[600px] object-contain bg-surface-variant/20" 
              alt={profile.name} 
              src={profile.image}
              referrerPolicy="no-referrer"
              fetchPriority="high"
              decoding="sync"
            />
          </div>
          <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 z-20 bg-surface border border-outline-variant p-4 sm:p-6 rounded-2xl shadow-xl flex flex-col items-center scale-75 sm:scale-100 origin-bottom-right">
            <span className="font-headline-lg text-headline-lg text-on-surface font-black">{yearsExp}+</span>
            <span className="font-label-bold text-label-bold text-text-secondary uppercase">Years Exp.</span>
          </div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/20 blur-[80px] rounded-full"></div>
        </motion.div>
      </div>
      </section>
    </>
  );
};
