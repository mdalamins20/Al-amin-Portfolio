import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from './Layout';
import { SEO } from './SEO';
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
      <SEO 
        title={project.seoTitle || `${project.title} | Project`} 
        description={project.metaDescription || project.description}
        keywords={project.keywords}
        image={project.image}
        type="website"
        schemaType="project"
        url={`https://alamins20.ami.bd/project/${project.id}`}
      />
      
      <main className="w-full bg-theme-bg text-theme-text min-h-screen pb-20">
        
        {/* TOP NAVBAR AREA */}
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-6 pb-6 flex justify-start items-center">
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

        {/* SPLIT HERO SECTION */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 mb-16 md:mb-24 relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/5 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-start relative z-10"
            >
              {project.category && (
                <span className="inline-block px-4 py-1.5 bg-brand/10 text-brand font-bold text-xs tracking-[0.2em] uppercase rounded-full mb-6 border border-brand/20">
                  {project.category}
                </span>
              )}
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-sans font-black text-theme-text mb-6 tracking-tight leading-[1.1]">
                {project.title}
              </h1>
              
              <p className="text-lg md:text-xl text-theme-dim leading-relaxed font-light mb-10">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-4">
                {project.appLink && (
                  <a 
                    href={project.appLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-8 py-3.5 bg-emerald-600 text-white hover:bg-emerald-700 font-bold rounded-full flex items-center space-x-2 transition-all shadow-[0_8px_30px_rgb(5,150,105,0.3)] hover:-translate-y-1"
                  >
                    <Smartphone size={18} />
                    <span>Download App {project.appVersion && <span className="opacity-80">({project.appVersion})</span>}</span>
                  </a>
                )}
                {project.platformLinks && project.platformLinks.length > 0 ? (
                   project.platformLinks.map((platform, idx) => (
                     <a 
                       key={idx}
                       href={platform.url} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="px-8 py-3.5 bg-brand text-white hover:bg-brand-700 font-bold rounded-full flex items-center space-x-2 transition-all shadow-[0_8px_30px_rgb(139,92,246,0.3)] hover:-translate-y-1"
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
                    className="px-8 py-3.5 bg-brand text-white hover:bg-brand-700 font-bold rounded-full flex items-center space-x-2 transition-all shadow-[0_8px_30px_rgb(139,92,246,0.3)] hover:-translate-y-1"
                  >
                    <ExternalLink size={18} />
                    <span>Live Preview</span>
                  </a>
                ) : null}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative z-10"
            >
              <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border border-outline-variant/30 bg-surface relative group">
                <img 
                  src={project.image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1600'} 
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-brand/20 to-transparent mix-blend-overlay"></div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* TECH STACK PILLS */}
        {project.techStack && project.techStack.length > 0 && (
          <section className="w-full bg-surface-variant/20 border-y border-outline-variant/30 py-8 mb-16 md:mb-24 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
              <div className="flex flex-wrap items-center justify-center gap-3">
                {project.techStack.map((tech, idx) => (
                  <motion.span 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    key={tech} 
                    className="px-5 py-2.5 bg-surface border border-outline-variant/50 rounded-xl text-sm font-bold text-theme-text shadow-sm hover:border-brand hover:text-brand transition-colors cursor-default"
                  >
                    {tech}
                  </motion.span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* MAIN CONTENT & SIDEBAR */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 mb-24">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
            
            {/* LEFT COLUMN: OVERVIEW */}
            <div className="w-full lg:w-2/3 min-w-0">
              <div className="mb-10">
                <h2 className="text-3xl md:text-4xl font-sans font-bold text-theme-text mb-4">Case Study</h2>
                <div className="w-16 h-1 bg-brand rounded-full"></div>
              </div>
              
              {project.longDescription ? (
                <div 
                  className="prose prose-lg dark:prose-invert prose-headings:font-sans prose-headings:font-bold prose-headings:mt-12 prose-headings:mb-6 prose-a:text-brand max-w-none text-theme-text/80 leading-[1.9] whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(project.longDescription) }}
                />
              ) : (
                <p className="text-xl text-theme-text/80 leading-loose font-light whitespace-pre-wrap">
                  {project.description}
                </p>
              )}
            </div>

            {/* RIGHT COLUMN: STICKY INFO */}
            <div className="w-full lg:w-1/3 lg:sticky lg:top-24 space-y-6">
              <div className="bg-surface border border-outline-variant/50 rounded-[2rem] p-8 shadow-sm">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Info size={20} className="text-brand" /> Project Info
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <span className="text-xs text-theme-dim font-bold uppercase tracking-wider block mb-1">Role</span>
                    <strong className="text-theme-text text-lg">{project.role || 'Lead Developer'}</strong>
                  </div>
                  <div className="w-full h-px bg-outline-variant/30"></div>
                  
                  <div>
                    <span className="text-xs text-theme-dim font-bold uppercase tracking-wider block mb-1">Platform</span>
                    <strong className="text-theme-text text-lg">
                      {project.platformLinks && project.platformLinks.length > 0 
                        ? project.platformLinks.map(p => p.name).join(', ')
                        : 'Web Application'}
                    </strong>
                  </div>
                  <div className="w-full h-px bg-outline-variant/30"></div>
                  
                  <div>
                    <span className="text-xs text-theme-dim font-bold uppercase tracking-wider block mb-1">Status</span>
                    <strong className="text-brand text-lg flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-brand animate-pulse"></span>
                      Completed
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* KEY FEATURES */}
        {project.features && project.features.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 md:px-8 mb-24">
            <div className="mb-12 text-center">
              <h2 className="text-3xl md:text-4xl font-sans font-bold text-theme-text mb-4">Core Features</h2>
              <div className="w-16 h-1 bg-brand rounded-full mx-auto"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {project.features.map((feature, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx} 
                  className="bg-surface/60 backdrop-blur-md border border-outline-variant/50 p-8 rounded-3xl hover:border-brand/30 hover:shadow-[0_8px_30px_rgb(139,92,246,0.1)] transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <CheckCircle size={24} />
                  </div>
                  <div 
                    className="text-[17px] text-theme-text leading-relaxed feature-text whitespace-pre-wrap font-medium"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(feature) }}
                  />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* GALLERY */}
        {project.screenshots && project.screenshots.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 md:px-8 mb-24">
            <div className="mb-12 text-center">
              <h2 className="text-3xl md:text-4xl font-sans font-bold text-theme-text mb-4">Gallery</h2>
              <div className="w-16 h-1 bg-brand rounded-full mx-auto"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {project.screenshots.map((shot, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx} 
                  className="overflow-hidden rounded-3xl shadow-lg border border-outline-variant/30 group bg-surface relative"
                >
                  <img 
                    src={shot} 
                    alt={`Screenshot ${idx + 1}`}
                    className="w-full h-auto transform transition-transform duration-700 group-hover:scale-105" 
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-brand/0 group-hover:bg-brand/10 transition-colors duration-500 pointer-events-none"></div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* RESULTS */}
        {project.result && (
          <section className="max-w-4xl mx-auto px-4 md:px-8 mb-24">
            <div className="bg-gradient-to-br from-brand/5 to-purple-500/5 border border-brand/20 rounded-[3rem] p-10 md:p-16 text-center relative overflow-hidden shadow-[0_8px_40px_rgb(139,92,246,0.05)]">
              <div className="inline-flex bg-brand/10 p-5 rounded-3xl text-brand mb-8">
                <Star size={40} className="fill-brand" />
              </div>
              <h2 className="text-3xl md:text-4xl font-sans font-black text-theme-text mb-8">
                The Outcome
              </h2>
              <p className="text-xl md:text-2xl text-theme-text/80 font-light leading-relaxed italic whitespace-pre-wrap">
                "{project.result}"
              </p>
            </div>
          </section>
        )}

        {/* PRIVACY POLICY */}
        {project.privacyPolicy && (
          <section className="max-w-4xl mx-auto px-4 md:px-8 mb-24">
            <div className="bg-surface/50 border border-outline-variant/50 rounded-3xl p-8 md:p-12 shadow-sm">
              <div className="flex items-center gap-6 mb-10 pb-8 border-b border-outline-variant/50">
                <div className="bg-brand/10 p-4 rounded-2xl text-brand">
                  <Shield size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-sans">Privacy Policy</h2>
                  <p className="text-theme-dim mt-1">Legal and data privacy information</p>
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
