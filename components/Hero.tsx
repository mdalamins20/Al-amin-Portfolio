import React from 'react';
import { m, LazyMotion, domAnimation } from 'framer-motion';
import { useProfileStore } from './stores/useProfileStore';
import { Loader2, Sparkles, Download } from 'lucide-react';
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
        <link rel="preload" as="image" href="/profile-hero.webp" fetchPriority="high" type="image/webp" />
      </Helmet>
      <section id="hero" className="relative pt-6 md:pt-14 pb-16 md:pb-24 px-margin-mobile md:px-gutter max-w-container-max mx-auto overflow-visible">
        <LazyMotion features={domAnimation}>
        {/* Ambient atmospheric glows */}
        <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-10" />
        <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-secondary/10 rounded-full blur-[90px] pointer-events-none -z-10" />
      
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Content (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-start z-10 pr-0 lg:pr-4">
            {/* Status Pill */}
            <m.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-label-bold text-xs uppercase tracking-wider mb-5 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Available For New Projects</span>
            </m.div>
            
            {/* Single Line Name Headline - Scaled safely so dot never overlaps image */}
            <m.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] xl:text-[3.75rem] font-black text-on-surface tracking-tight leading-tight mb-4 whitespace-nowrap"
            >
              <span>{profile.firstName || 'Muhammad'}</span>{' '}
              <span className="gradient-text">{profile.lastName || 'Al-amin'}.</span>
            </m.h1>

            {/* Role & Tagline Badge */}
            <m.div 
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface-variant/30 dark:bg-white/5 border border-surface-variant/40 dark:border-white/10 text-primary font-semibold text-sm md:text-base mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>{profile.role || 'Digital Solutions Architect'}</span>
            </m.div>

            {/* Supporting Pitch Text */}
            <m.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-text-secondary dark:text-slate-300 font-normal text-base sm:text-lg leading-relaxed max-w-xl mb-8"
            >
              {profile.supportingLine || profile.tagline || 'I architect high-performance full-stack web applications, scalable automation tools, and intuitive digital interfaces engineered for maximum business growth.'}
            </m.p>
            
            {/* CTAs & Action Buttons */}
            <m.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap items-center gap-3.5 w-full sm:w-auto"
            >
              <Link 
                to="/#contact" 
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary-hover active:scale-95 text-white rounded-full font-label-bold text-sm md:text-base transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02]"
              >
                <Sparkles size={17} className="animate-pulse" />
                <span>Strategy Session</span>
              </Link>
              {profile.cvFileUrl ? (
                <a 
                  href={profile.cvFileUrl}
                  download={`${profile.firstName || 'Resume'}_CV.pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-surface-variant/40 dark:border-white/10 hover:border-primary/50 text-on-surface hover:text-primary rounded-full font-label-bold text-sm md:text-base bg-surface/60 dark:bg-white/5 backdrop-blur-md hover:bg-surface-variant/30 active:scale-95 transition-all shadow-sm"
                >
                  <Download size={16} />
                  <span>Download CV</span>
                </a>
              ) : (
                <button 
                  disabled
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-surface-variant/20 text-on-surface/40 rounded-full font-label-bold text-sm md:text-base cursor-not-allowed opacity-50 bg-surface/30 dark:bg-white/5"
                  title="CV not uploaded yet"
                >
                  <Download size={16} />
                  <span>Download CV</span>
                </button>
              )}
            </m.div>
          </div>
          
          {/* Right Column: Visual Portrait (5 cols) */}
          <m.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.7, ease: "easeOut" }}
             className="lg:col-span-5 relative flex justify-center items-center"
          >
            {/* Soft decorative backdrop glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/15 to-secondary/15 rounded-3xl filter blur-3xl -z-10 transform scale-90" />

            {/* Clean Image Container without artificial borders or cropping */}
            <div className="relative w-full max-w-sm sm:max-w-md rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center min-h-[380px] sm:min-h-[480px]">
              <img 
                className="w-full h-auto object-contain max-h-[600px] transition-all duration-300 rounded-3xl" 
                alt={profile.name || 'Muhammad Al-amin'} 
                src={profile.image || '/profile-hero.webp'}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== window.location.origin + '/profile-hero.webp') {
                    target.src = '/profile-hero.webp';
                  }
                }}
                referrerPolicy="no-referrer"
                fetchPriority="high"
                decoding="sync"
                width="467"
                height="640"
              />
            </div>

            {/* High-Contrast Experience Floating Badge */}
            <div className="absolute -bottom-2 right-0 sm:bottom-2 sm:right-2 z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 p-3.5 sm:p-4 rounded-2xl shadow-2xl flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <span className="font-headline-md text-xl sm:text-2xl font-black">{yearsExp}+</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider leading-none mb-1">
                  Years Exp.
                </span>
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 leading-none">
                  Proven Expertise
                </span>
              </div>
            </div>
          </m.div>
        </div>
        </LazyMotion>
      </section>
    </>
  );
};
