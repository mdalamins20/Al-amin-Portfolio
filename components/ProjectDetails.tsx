import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from './Layout';
import { DynamicSEO } from './DynamicSEO';
import { ArrowLeft, ExternalLink, Github, CheckCircle, Loader2, Star, Shield, Smartphone, Globe, Info } from 'lucide-react';
import { Project } from '../types';
import { useDataStore } from './stores/useDataStore';

const parseMarkdown = (text: string) => {
  if (!text) return '';
  let parsed = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  parsed = parsed.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Replace non-breaking spaces with standard spaces to fix text wrapping issues
  parsed = parsed.replace(/&nbsp;|\u00A0/g, ' ');
  return parsed;
};

export const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { projects, loading } = useDataStore();
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
      
      <main className="w-full bg-theme-bg text-theme-text min-h-screen">
        
        {/* TOP NAVBAR AREA */}
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-2 pb-4 flex justify-start items-center">
          <Link 
            to="/#work" 
            className="inline-flex items-center space-x-2 text-theme-dim hover:text-brand transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center group-hover:-translate-x-1 transition-transform">
              <ArrowLeft size={18} />
            </div>
            <span className="font-semibold text-sm hidden sm:block">Back to Projects</span>
          </Link>
        </div>

        {/* CLEAN TEXT HERO */}
        <section className="max-w-4xl mx-auto px-4 md:px-8 pt-4 pb-12 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            {project.category && (
              <span className="inline-block px-4 py-1.5 bg-surface-variant text-theme-dim font-bold text-xs tracking-[0.2em] uppercase rounded-full mb-6">
                {project.category}
              </span>
            )}
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-sans font-black text-theme-text mb-8 tracking-tight leading-[1.1] break-words">
              {project.title}
            </h1>
            
            <p className="text-lg md:text-2xl text-theme-dim leading-relaxed font-light max-w-3xl break-words whitespace-pre-wrap mb-10">
              {project.description}
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              {project.appLink && (
                <a 
                  href={project.appLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-8 py-3.5 bg-emerald-600 text-white hover:bg-emerald-700 font-bold rounded-full flex items-center space-x-2 transition-all shadow-lg hover:-translate-y-1"
                >
                  <Smartphone size={18} />
                  <span>
                    Download App
                    {project.appVersion && <span className="text-xs opacity-80 font-normal ml-1">({project.appVersion})</span>}
                  </span>
                </a>
              )}
              {project.platformLinks && project.platformLinks.length > 0 ? (
                 project.platformLinks.map((platform, idx) => (
                   <a 
                     key={idx}
                     href={platform.url} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="px-8 py-3.5 bg-brand text-white hover:bg-brand-700 font-bold rounded-full flex items-center space-x-2 transition-all shadow-lg hover:-translate-y-1"
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
                  className="px-8 py-3.5 bg-brand text-white hover:bg-brand-700 font-bold rounded-full flex items-center space-x-2 transition-all shadow-lg hover:-translate-y-1"
                >
                  <ExternalLink size={18} />
                  <span>Live Preview</span>
                </a>
              ) : null}
            </div>
          </motion.div>
        </section>

        {/* HERO IMAGE SHOWCASE */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 pb-12 md:pb-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full aspect-[16/9] md:aspect-[21/9] rounded-[2rem] overflow-hidden shadow-2xl relative"
          >
            <img 
              src={project.image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1600'} 
              alt={project.title}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </section>

        {/* QUICK INFO BAR */}
        <section className="border-y border-outline-variant/30 bg-surface/50 backdrop-blur-sm py-10">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="flex flex-col">
                <span className="text-sm text-theme-dim font-medium uppercase tracking-wider mb-2">Category</span>
                <strong className="text-theme-text text-lg">{project.category || 'Portfolio'}</strong>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-theme-dim font-medium uppercase tracking-wider mb-2">Role</span>
                <strong className="text-theme-text text-lg">{project.role || 'Lead Developer'}</strong>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-theme-dim font-medium uppercase tracking-wider mb-2">Platform</span>
                <strong className="text-theme-text text-lg">
                  {project.platformLinks && project.platformLinks.length > 0 
                    ? project.platformLinks.map(p => p.name).join(', ')
                    : 'Web Application'}
                </strong>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-theme-dim font-medium uppercase tracking-wider mb-2">Status</span>
                <strong className="text-brand text-lg flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand animate-pulse"></span>
                  Completed
                </strong>
              </div>
            </div>
          </div>
        </section>

        {/* PROJECT OVERVIEW */}
        <section className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-sans font-bold text-theme-text mb-4">Project Overview</h2>
            <div className="w-16 h-1 bg-brand rounded-full"></div>
          </div>
          
          {project.longDescription ? (
            <div 
              className="prose prose-lg dark:prose-invert prose-headings:font-sans prose-headings:font-bold prose-headings:mt-12 prose-headings:mb-6 prose-a:text-brand max-w-none text-theme-text/80 leading-loose break-words whitespace-pre-wrap"
              style={{ overflowWrap: 'anywhere' }}
              dangerouslySetInnerHTML={{ __html: parseMarkdown(project.longDescription) }}
            />
          ) : (
            <p className="text-xl text-theme-text/80 leading-loose font-light break-words whitespace-pre-wrap" style={{ overflowWrap: 'anywhere' }}>
              {project.description}
            </p>
          )}
        </section>

        {/* KEY FEATURES */}
        {project.features && project.features.length > 0 && (
          <section className="bg-surface-variant/30 py-12 md:py-16">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
              <div className="mb-16 text-center">
                <h2 className="text-3xl md:text-4xl font-sans font-bold text-theme-text mb-4">Key Features</h2>
                <div className="w-16 h-1 bg-brand rounded-full mx-auto"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {project.features.map((feature, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx} 
                    className="bg-surface border border-outline-variant/50 p-8 rounded-[2rem] hover:shadow-2xl transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 bg-brand/10 text-brand rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <CheckCircle size={24} />
                    </div>
                    <div 
                      className="text-lg text-theme-text leading-relaxed feature-text break-words whitespace-pre-wrap"
                      style={{ overflowWrap: 'anywhere' }}
                      dangerouslySetInnerHTML={{ __html: parseMarkdown(feature) }}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* GALLERY */}
        {project.screenshots && project.screenshots.length > 0 && (
          <section className="py-12 md:py-16">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
              <div className="mb-16">
                <h2 className="text-3xl md:text-4xl font-sans font-bold text-theme-text mb-4">Gallery</h2>
                <div className="w-16 h-1 bg-brand rounded-full"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {project.screenshots.map((shot, idx) => (
                  <div 
                    key={idx} 
                    className="overflow-hidden rounded-[2rem] shadow-lg border border-outline-variant/30 group bg-surface"
                  >
                    <img 
                      src={shot} 
                      alt={`Screenshot ${idx + 1}`}
                      className="w-full h-auto transform transition-transform duration-700 group-hover:scale-105" 
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* TECHNOLOGY STACK */}
        {project.techStack && project.techStack.length > 0 && (
          <section className="bg-surface-variant/30 py-12 md:py-16 border-y border-outline-variant/30">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <h2 className="text-3xl font-sans font-bold text-theme-text mb-12">Technology Stack</h2>
              <div className="flex flex-wrap justify-center gap-4">
                {project.techStack.map((tech) => (
                  <span 
                    key={tech} 
                    className="px-6 py-3 bg-surface border border-outline-variant/50 rounded-2xl text-sm font-bold text-theme-text shadow-sm hover:border-brand hover:text-brand transition-all hover:-translate-y-1"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* RESULTS */}
        {project.result && (
          <section className="max-w-5xl mx-auto px-4 md:px-8 py-32">
            <div className="bg-gradient-to-br from-brand/5 to-brand/10 border border-brand/20 rounded-[3rem] p-10 md:p-16 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 blur-[100px] rounded-full pointer-events-none" />
              <div className="inline-flex bg-brand/20 p-5 rounded-3xl text-brand mb-8">
                <Star size={40} className="fill-brand" />
              </div>
              <h2 className="text-3xl md:text-5xl font-sans font-black text-theme-text mb-8 leading-tight">
                The Outcome
              </h2>
              <p className="text-xl md:text-3xl text-theme-text/80 font-light leading-relaxed max-w-4xl mx-auto italic break-words whitespace-pre-wrap">
                "{project.result}"
              </p>
            </div>
          </section>
        )}

        {/* PRIVACY POLICY */}
        {project.privacyPolicy && (
          <section className="max-w-4xl mx-auto px-4 md:px-8 pb-32">
            <div className="bg-surface border border-outline-variant/50 rounded-[2rem] p-8 md:p-12 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10 pb-8 border-b border-outline-variant/50">
                <div className="bg-brand/10 p-4 rounded-2xl text-brand shrink-0">
                  <Shield size={32} />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold font-sans">Privacy Policy</h2>
                  <p className="text-theme-dim mt-2">Legal and data privacy information</p>
                </div>
              </div>
              <div 
                className="prose prose-lg dark:prose-invert prose-headings:font-sans prose-a:text-brand max-w-none text-theme-text/80"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(project.privacyPolicy) }}
              />
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
};
