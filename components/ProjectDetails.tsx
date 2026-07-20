import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from './Layout';
import { DynamicSEO } from './DynamicSEO';
import { ArrowLeft, ExternalLink, Github, CheckCircle, Loader2, Star, Shield, Smartphone, Globe, Info } from 'lucide-react';
import { Project } from '../types';
import { useData } from './DataContext';

export const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { projects, loading } = useData();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    // Disable smooth scrolling temporarily so it jumps to top instantly
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    // Restore the smooth scrolling after a small delay
    setTimeout(() => {
      document.documentElement.style.scrollBehavior = '';
    }, 50);
  }, [id]);

  useEffect(() => {
    if (!loading) {
      const found = projects.find(p => p.id === id);
      setProject(found || null);
    }
  }, [id, projects, loading]);

  if (loading) {
    return (
      <Layout onViewCV={() => {}} hideNavigation={true}>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-brand" size={48} />
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout onViewCV={() => {}} hideNavigation={true}>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <h2 className="text-4xl font-bold mb-4">Project Not Found</h2>
          <Link to="/" className="text-brand hover:underline">Return to Home</Link>
        </div>
      </Layout>
    );
  }

  const getPlatformIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('app store') || lower.includes('ios') || lower.includes('apple')) return <Smartphone size={18} />;
    if (lower.includes('play store') || lower.includes('android')) return <Smartphone size={18} />;
    if (lower.includes('github')) return <Github size={18} />;
    return <Globe size={18} />;
  };

  return (
    <Layout onViewCV={() => {}} hideNavigation={true}>
      <DynamicSEO title={`${project.title} | Portfolio`} description={project.description} />
      
      <main className="w-full bg-theme-bg text-theme-text pb-24">
        
        {/* HERO SECTION (HTML Template Style) */}
        <section className="relative w-full h-[60vh] min-h-[500px] max-h-[800px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src={project.image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1600'} 
              alt={project.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-[2px]"></div>
          </div>
          
          <div className="absolute top-8 left-4 md:left-8 z-50">
            <Link 
              to="/#work" 
              className="inline-flex items-center space-x-2 text-white hover:text-brand transition-all hover:-translate-x-1 bg-black/40 backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-full shadow-lg"
            >
              <ArrowLeft size={18} />
              <span className="font-semibold text-sm">Back to Projects</span>
            </Link>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto mt-10"
          >
            {project.category && (
              <span className="inline-block px-4 py-1.5 bg-brand text-white font-bold text-xs tracking-[0.15em] uppercase rounded-full mb-6 shadow-sm">
                {project.category}
              </span>
            )}
            
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif font-black text-white mb-6 leading-tight">
              {project.title}
            </h1>
            
            <p className="text-lg md:text-xl text-gray-200 opacity-90 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
              {project.description}
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              {project.platformLinks && project.platformLinks.length > 0 ? (
                 project.platformLinks.map((platform, idx) => (
                   <a 
                     key={idx}
                     href={platform.url} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="px-8 py-3.5 bg-brand hover:bg-brand-700 text-white font-bold rounded-full flex items-center space-x-2 transition-all shadow-lg hover:-translate-y-1"
                   >
                     {getPlatformIcon(platform.name)}
                     <span>{platform.name}</span>
                   </a>
                 ))
              ) : project.link ? (
                <a 
                  href={project.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-8 py-3.5 bg-brand hover:bg-brand-700 text-white font-bold rounded-full flex items-center space-x-2 transition-all shadow-lg hover:-translate-y-1"
                >
                  <ExternalLink size={18} />
                  <span>Live Preview</span>
                </a>
              ) : null}
            </div>
          </motion.div>
        </section>

        {/* PROJECT OVERVIEW & INFO (HTML Template Layout) */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-20">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
            
            {/* Overview (Left) */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-8">
                <span className="w-8 h-1 bg-brand rounded-full"></span>
                <h2 className="text-3xl font-serif font-bold text-theme-text">Project Overview</h2>
              </div>
              
              {project.longDescription ? (
                <div 
                  className="prose prose-lg dark:prose-invert prose-headings:font-serif prose-a:text-brand max-w-none text-theme-dim leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: project.longDescription }}
                />
              ) : (
                <p className="text-lg text-theme-dim leading-relaxed">
                  {project.description}
                </p>
              )}
            </div>

            {/* Info Card (Right) */}
            <div className="w-full lg:w-80 shrink-0">
              <div className="bg-theme-card border border-theme-border rounded-3xl p-8 shadow-xl lg:sticky lg:top-28">
                <h3 className="text-xl font-bold font-serif mb-6 flex items-center gap-2">
                  <Info size={20} className="text-brand" />
                  Project Info
                </h3>
                
                <div className="space-y-6">
                  {project.category && (
                    <div className="flex flex-col pb-4 border-b border-theme-border/50">
                      <span className="text-sm text-theme-dim font-medium uppercase tracking-wider mb-1">Category</span>
                      <strong className="text-theme-text">{project.category}</strong>
                    </div>
                  )}
                  
                  {project.role && (
                    <div className="flex flex-col pb-4 border-b border-theme-border/50">
                      <span className="text-sm text-theme-dim font-medium uppercase tracking-wider mb-1">Role</span>
                      <strong className="text-theme-text">{project.role}</strong>
                    </div>
                  )}
                  
                  <div className="flex flex-col pb-4 border-b border-theme-border/50">
                    <span className="text-sm text-theme-dim font-medium uppercase tracking-wider mb-1">Platform</span>
                    <strong className="text-theme-text flex gap-2 flex-wrap">
                      {project.platformLinks && project.platformLinks.length > 0 
                        ? project.platformLinks.map(p => p.name).join(', ')
                        : 'Web / App'}
                    </strong>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm text-theme-dim font-medium uppercase tracking-wider mb-1">Status</span>
                    <strong className="text-green-500 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      Completed
                    </strong>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </section>

        {/* GALLERY (HTML Template Grid Layout) */}
        {project.screenshots && project.screenshots.length > 0 && (
          <section className="bg-theme-card/30 border-y border-theme-border/50 py-20">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
              <h2 className="text-3xl font-serif font-bold text-theme-text mb-10 text-center">Gallery</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {project.screenshots.map((shot, idx) => {
                  // Make the first image span 2 columns and 2 rows for a premium masonry look
                  const isFirst = idx === 0 && project.screenshots!.length > 1;
                  return (
                    <div 
                      key={idx} 
                      className={`overflow-hidden rounded-3xl border border-theme-border group shadow-lg ${isFirst ? 'md:col-span-2 md:row-span-2' : 'col-span-1'}`}
                    >
                      <div 
                        className={`w-full ${isFirst ? 'aspect-[4/3] md:aspect-auto md:h-full' : 'aspect-square'} bg-cover bg-center transition-transform duration-700 group-hover:scale-110`} 
                        style={{ backgroundImage: `url(${shot})` }}
                      ></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* KEY FEATURES (HTML Template Card Layout) */}
        {project.features && project.features.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 md:px-8 py-20">
            <h2 className="text-3xl font-serif font-bold text-theme-text mb-10 text-center">Key Features</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {project.features.map((feature, idx) => (
                <div 
                  key={idx} 
                  className="bg-theme-card border border-theme-border p-6 rounded-2xl flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300 shadow-md group"
                >
                  <div className="bg-brand/10 p-4 rounded-xl text-brand mb-4 group-hover:scale-110 transition-transform">
                    <CheckCircle size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-theme-text font-serif leading-relaxed">
                    {feature}
                  </h3>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TECHNOLOGY STACK (HTML Template Pill Layout) */}
        {project.techStack && project.techStack.length > 0 && (
          <section className="bg-theme-card/30 border-y border-theme-border/50 py-20">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <h2 className="text-3xl font-serif font-bold text-theme-text mb-10">Technology Stack</h2>
              <div className="flex flex-wrap justify-center gap-4">
                {project.techStack.map((tech) => (
                  <span 
                    key={tech} 
                    className="px-6 py-2.5 bg-theme-bg border border-theme-border rounded-full text-sm font-bold text-theme-text shadow-sm hover:border-brand hover:text-brand transition-colors"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* RESULTS / OUTCOME (HTML Template Results Section) */}
        {project.result && (
          <section className="max-w-7xl mx-auto px-4 md:px-8 py-20">
            <h2 className="text-3xl font-serif font-bold text-theme-text mb-10 text-center">Results</h2>
            <div className="bg-theme-card border border-theme-border rounded-3xl p-8 md:p-12 shadow-xl max-w-4xl mx-auto text-center">
              <div className="inline-flex bg-brand/10 p-4 rounded-full text-brand mb-6">
                <Star size={32} />
              </div>
              <p className="text-xl md:text-2xl text-theme-text font-medium leading-relaxed max-w-3xl mx-auto">
                "{project.result}"
              </p>
            </div>
          </section>
        )}

        {/* PRIVACY POLICY */}
        {project.privacyPolicy && (
          <section className="max-w-4xl mx-auto px-4 md:px-8 py-20">
            <div className="bg-theme-card border border-theme-border rounded-3xl p-8 md:p-12 shadow-xl">
              <div className="flex items-center space-x-4 mb-8 pb-8 border-b border-theme-border">
                <div className="bg-brand/10 p-4 rounded-2xl text-brand shrink-0">
                  <Shield size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold font-serif">Privacy Policy</h2>
                  <p className="text-theme-dim">Legal and data privacy information for {project.title}.</p>
                </div>
              </div>
              <div 
                className="prose prose-lg dark:prose-invert prose-headings:font-serif prose-a:text-brand max-w-none text-theme-dim"
                dangerouslySetInnerHTML={{ __html: project.privacyPolicy }}
              />
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
};
