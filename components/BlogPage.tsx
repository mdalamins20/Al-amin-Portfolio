import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Calendar, BookOpen, Clock, Sparkles } from 'lucide-react';
import { Layout } from './Layout';
import { SectionWrapper } from './SectionWrapper';
import { Link, useNavigate } from 'react-router-dom';
import { SEO } from './SEO';
import { useDataStore } from './stores/useDataStore';
import { db, isConfigured } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Blog } from '../types';

import { showAlert } from './stores/useDialogStore';

const NewsletterBanner = () => {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !isConfigured) return;
    
    // Rate Limiting (Spam Protection)
    const lastSubscribed = localStorage.getItem('last_subscribed_time');
    if (lastSubscribed && Date.now() - parseInt(lastSubscribed) < 1000 * 60 * 60) {
      showAlert("Notice", "You have already subscribed recently. Please try again later.");
      return;
    }

    setSubscribing(true);
    try {
      await addDoc(collection(db, 'subscribers'), {
        email,
        source: 'blog_page_banner',
        subscribedAt: serverTimestamp()
      });
      setSubscribed(true);
      setEmail('');
      localStorage.setItem('lastSubscribed', Date.now().toString());
    } catch (error) {
      console.error(error);
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="rounded-3xl p-px bg-gradient-to-b from-primary/30 via-surface-variant/20 to-transparent shadow-xl mb-16 md:mb-24 w-full max-w-[1200px] mx-auto overflow-hidden">
      <div className="bg-surface/90 dark:bg-slate-950/80 backdrop-blur-2xl rounded-[23px] border border-surface-variant/30 dark:border-white/10 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Desktop Newsletter */}
        <div className="hidden md:flex items-center justify-between p-10 md:p-12 relative z-10">
          <div className="w-[58%] text-on-surface">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs uppercase tracking-widest mb-4">
              <Mail size={13} />
              <span>Stay Ahead</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-on-surface mb-3 tracking-tight">Stay ahead of the Vibe.</h3>
            <p className="text-text-secondary dark:text-slate-300 mb-6 leading-relaxed text-sm md:text-[15px]">
              Get weekly insights into software engineering, architecture, and design delivered to your inbox. No spam, promise!
            </p>
            
            {subscribed ? (
              <div className="bg-primary/10 text-primary px-5 py-3 rounded-full font-bold inline-block border border-primary/25">
                Thanks for subscribing! 🎉
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2.5 w-full max-w-md">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address" 
                  className="flex-1 bg-surface-variant/20 dark:bg-white/5 border border-surface-variant/30 dark:border-white/10 rounded-full px-5 py-3 text-sm text-on-surface outline-none focus:border-primary transition-colors font-medium shadow-inner"
                  required
                />
                <button 
                  type="submit" 
                  disabled={subscribing}
                  className="bg-primary text-white px-6 py-3 rounded-full font-bold text-xs md:text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-md shadow-primary/25 shrink-0 disabled:opacity-50"
                >
                  {subscribing ? 'Wait...' : 'Subscribe'}
                </button>
              </form>
            )}
          </div>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none text-primary">
            <Mail size={260} />
          </div>
        </div>

        {/* Mobile Newsletter */}
        <div className="md:hidden p-7 text-center relative z-10 flex flex-col items-center">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary border border-primary/20">
            <Mail size={24} />
          </div>
          <h3 className="text-xl font-black text-on-surface mb-2 tracking-tight">Stay ahead of the Vibe.</h3>
          <p className="text-text-secondary dark:text-slate-300 text-xs sm:text-sm mb-6 leading-relaxed">
            Get weekly insights into the future of tech and leadership delivered to your inbox.
          </p>
          
          {subscribed ? (
            <div className="bg-primary/10 text-primary w-full px-5 py-3 rounded-full font-bold text-xs border border-primary/25">
              Thanks! 🎉
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2.5 w-full">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address" 
                className="w-full bg-surface-variant/20 dark:bg-white/5 border border-surface-variant/30 dark:border-white/10 rounded-full px-4 py-3 text-xs sm:text-sm text-on-surface outline-none text-center font-medium"
                required
              />
              <button 
                type="submit" 
                disabled={subscribing}
                className="w-full bg-primary text-white py-3 rounded-full font-bold text-xs sm:text-sm shadow-md shadow-primary/25 transition-transform active:scale-95 disabled:opacity-50"
              >
                {subscribing ? 'Wait...' : 'Subscribe'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};


export const BlogPage: React.FC = () => {
  const { blogs, loading } = useDataStore();
  const navigate = useNavigate();

  const stripHtmlAndTruncate = (html: string, maxLength: number) => {
    if (!html) return '';
    try {
      const plainText = html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ');
      return plainText.length > maxLength ? plainText.substring(0, maxLength) + '...' : plainText;
    } catch {
      return '';
    }
  };

  const getReadingTime = (content: string) => {
    return Math.max(1, Math.ceil((content || '').replace(/<[^>]*>?/gm, '').split(/\s+/).length / 200));
  };

  const getCategoryColor = (index: number) => {
    const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];
    return colors[index % colors.length];
  };

  const featuredBlog = blogs[0];
  const bentoGridBlogs = blogs.slice(1, 5);
  const standardBlogs = blogs.slice(5);

  return (
    <Layout onViewCV={() => {}}>
      <SEO 
        title="The Journal - Blog & Insights" 
        description="প্রযুক্তি এবং ডিজাইনের ভবিষ্যৎ নিয়ে আমাদের চিন্তা, টিউটোরিয়াল এবং অন্তর্দৃষ্টি।"
      />
      <div className="pt-6 md:pt-16 pb-20 w-full overflow-hidden relative">
        {/* Subtle ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] pointer-events-none -z-10" />
        
        {/* Unified Section Header */}
        <div className="text-center mb-12 md:mb-16 px-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-label-bold text-xs uppercase tracking-widest mb-4">
            <BookOpen size={14} />
            <span>Engineering Blog</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-on-surface tracking-tight mb-3">
            The <span className="gradient-text">Journal.</span>
          </h1>
          <p className="text-text-secondary dark:text-slate-300 font-normal text-sm sm:text-base leading-relaxed">
            Thoughts, tutorials, and insights on the future of tech and design.
          </p>
        </div>

        {blogs.length === 0 && !loading ? (
          <div className="text-center py-20 text-text-secondary">No articles published yet.</div>
        ) : (
          <div className="max-w-[1200px] mx-auto px-4 md:px-8">
            
            {/* FEATURED POST with Unified Glassmorphism Card */}
            {featuredBlog && (
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group cursor-pointer mb-16 md:mb-20 flex flex-col rounded-3xl overflow-hidden bg-surface/85 dark:bg-slate-950/70 backdrop-blur-xl border border-surface-variant/30 dark:border-white/10 shadow-xl hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 w-full mx-auto"
                onClick={() => navigate(`/blog/${featuredBlog.id}`)}
              >
                <div className="w-full aspect-video md:aspect-[21/9] overflow-hidden relative border-b border-surface-variant/20 dark:border-white/10">
                  <img 
                    src={featuredBlog.image} 
                    alt={featuredBlog.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                
                <div className="p-6 md:p-10 flex flex-col items-start w-full">
                  <span className="bg-primary/10 text-primary border border-primary/20 px-3.5 py-1 text-[10px] md:text-xs font-bold rounded-full mb-3 uppercase tracking-widest">
                    Featured Article
                  </span>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-on-surface mb-4 leading-tight group-hover:text-primary transition-colors tracking-tight">
                    {featuredBlog.title}
                  </h2>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4 mt-3 pt-4 border-t border-surface-variant/15 dark:border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center font-bold text-xs uppercase text-primary shrink-0">
                        {featuredBlog.author?.charAt(0) || 'A'}
                      </div>
                      <span className="text-xs sm:text-sm text-text-secondary dark:text-slate-300 font-medium">
                        {featuredBlog.author || 'Al-amin'} • {getReadingTime(featuredBlog.content)} min read
                      </span>
                    </div>
                    
                    <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-primary/25 group-hover:scale-[1.02] active:scale-95 transition-all">
                      Read Full Article <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </motion.article>
            )}

            {/* DESKTOP BENTO GRID (Hidden on mobile) */}
            {bentoGridBlogs.length >= 4 && (
              <div className="hidden md:grid grid-cols-12 grid-rows-2 gap-8 mb-24">
                {/* 1. Tall Left Card (Span 4 cols, 2 rows) */}
                <article 
                  className="col-span-4 row-span-2 group cursor-pointer bg-theme-card rounded-[2rem] overflow-hidden shadow-lg border border-transparent hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  onClick={() => navigate(`/blog/${bentoGridBlogs[0].id}`)}
                >
                  <div className="w-full aspect-video overflow-hidden mb-6 bg-theme-border/20">
                    <img src={bentoGridBlogs[0].image} alt={bentoGridBlogs[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="px-8 pb-8">
                    <span style={{color: getCategoryColor(0)}} className="font-bold text-[10px] uppercase tracking-widest mb-3 block">
                      {(bentoGridBlogs[0] as any).category || 'Technology'}
                    </span>
                    <h3 className="text-[26px] font-serif font-bold text-theme-text mb-6 leading-[1.3] group-hover:text-brand transition-colors">
                      {bentoGridBlogs[0].title}
                    </h3>
                    <span className="text-[#8B5CF6] font-bold text-xs flex items-center gap-2 group-hover:gap-3 transition-all uppercase tracking-widest mt-auto">
                      READ <ArrowRight size={14} />
                    </span>
                  </div>
                </article>

                {/* 2. Top Middle Square (Span 4 cols, 1 row) */}
                <article 
                  className="col-span-4 row-span-1 group cursor-pointer bg-theme-card rounded-[2rem] overflow-hidden shadow-lg border border-transparent hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                  onClick={() => navigate(`/blog/${bentoGridBlogs[1].id}`)}
                >
                  <div className="w-full aspect-video overflow-hidden bg-theme-border/20 shrink-0">
                    <img src={bentoGridBlogs[1].image} alt={bentoGridBlogs[1].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="px-6 py-5 flex-1 flex flex-col justify-center">
                    <span style={{color: getCategoryColor(1)}} className="font-bold text-[10px] uppercase tracking-widest mb-2 block">
                      {(bentoGridBlogs[1] as any).category || 'Development'}
                    </span>
                    <h3 className="text-xl font-serif font-bold text-theme-text line-clamp-3 leading-snug group-hover:text-brand transition-colors mb-2">
                      {bentoGridBlogs[1].title}
                    </h3>
                  </div>
                </article>

                {/* 3. Top Right Square (Span 4 cols, 1 row) */}
                <article 
                  className="col-span-4 row-span-1 group cursor-pointer bg-theme-card rounded-[2rem] overflow-hidden shadow-lg border border-transparent hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                  onClick={() => navigate(`/blog/${bentoGridBlogs[2].id}`)}
                >
                  <div className="w-full aspect-video overflow-hidden bg-theme-border/20 shrink-0">
                    <img src={bentoGridBlogs[2].image} alt={bentoGridBlogs[2].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="px-6 py-5 flex-1 flex flex-col justify-center">
                    <span style={{color: getCategoryColor(2)}} className="font-bold text-[10px] uppercase tracking-widest mb-2 block">
                      {(bentoGridBlogs[2] as any).category || 'UI/UX'}
                    </span>
                    <h3 className="text-xl font-serif font-bold text-theme-text line-clamp-3 leading-snug group-hover:text-brand transition-colors mb-2">
                      {bentoGridBlogs[2].title}
                    </h3>
                  </div>
                </article>

                {/* 4. Bottom Wide Card (Span 8 cols, 1 row) */}
                <article 
                  className="col-span-8 row-span-1 group cursor-pointer flex gap-8 items-center bg-theme-card p-4 rounded-[2rem] shadow-lg border border-transparent hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  onClick={() => navigate(`/blog/${bentoGridBlogs[3].id}`)}
                >
                  <div className="w-2/5 aspect-video rounded-2xl overflow-hidden bg-theme-border/20 shrink-0">
                    <img src={bentoGridBlogs[3].image} alt={bentoGridBlogs[3].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="w-3/5 py-4 pr-8">
                    <span style={{color: getCategoryColor(3)}} className="font-bold text-[10px] uppercase tracking-widest mb-3 block">
                      {(bentoGridBlogs[3] as any).category || 'Backend'}
                    </span>
                    <h3 className="text-[28px] font-serif font-bold text-theme-text mb-6 leading-[1.2] group-hover:text-brand transition-colors">
                      {bentoGridBlogs[3].title}
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-[10px] uppercase shrink-0">
                        {bentoGridBlogs[3].author?.charAt(0) || 'A'}
                      </div>
                      <span className="text-xs text-theme-dim font-bold">{bentoGridBlogs[3].author || 'Al-amin'} • {getReadingTime(bentoGridBlogs[3].content)} min read</span>
                    </div>
                  </div>
                </article>
              </div>
            )}

            {/* MOBILE VERTICAL LIST (Hidden on desktop) */}
            <div className="md:hidden flex flex-col gap-10 mb-16">
              {bentoGridBlogs.map((blog, idx) => (
                <article key={blog.id} className="group cursor-pointer" onClick={() => navigate(`/blog/${blog.id}`)}>
                  <div className="w-full aspect-video rounded-xl overflow-hidden mb-4 bg-theme-border/20 shadow-sm">
                    <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="px-1">
                    <span 
                      style={{ color: getCategoryColor(idx), backgroundColor: `${getCategoryColor(idx)}15` }} 
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest mb-3 inline-block"
                    >
                      {(blog as any).category || 'Technology'}
                    </span>
                    <h3 className="text-[22px] font-serif font-bold text-theme-text mb-4 leading-snug line-clamp-3">
                      {blog.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-theme-dim font-bold mt-auto">
                      <Calendar size={12} /> {blog.date} 
                      <span className="mx-1">•</span>
                      {blog.author || 'Al-amin'}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* NEWSLETTER BANNER */}
            <NewsletterBanner />

            {/* MOBILE: READ BY CATEGORY (Only mobile) */}
            {standardBlogs.length > 0 && (
              <div className="md:hidden mb-16 px-1">
                <h3 className="text-xl font-serif font-bold text-theme-text flex items-center justify-between mb-6 border-b border-theme-border pb-4">
                  Read by Category <ArrowRight size={20} className="text-[#8B5CF6]" />
                </h3>
                <div className="flex flex-col gap-4">
                  {standardBlogs.slice(0, 3).map((blog, i) => (
                    <div 
                      key={blog.id} 
                      className="flex gap-4 items-center bg-theme-card p-3 rounded-2xl shadow-sm cursor-pointer"
                      onClick={() => navigate(`/blog/${blog.id}`)}
                    >
                      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-theme-border/20">
                        <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <span style={{ color: getCategoryColor(i) }} className="text-[10px] font-bold uppercase tracking-widest mb-1 block">
                          {(blog as any).category || 'Article'}
                        </span>
                        <h4 className="font-bold text-theme-text text-sm leading-snug line-clamp-2 font-bengali">
                          {blog.title}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BOTTOM STANDARD GRID */}
            {standardBlogs.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                {standardBlogs.map((blog, idx) => (
                  <article key={blog.id} className="group cursor-pointer bg-theme-card rounded-2xl shadow-sm overflow-hidden border border-transparent hover:shadow-md transition-all flex flex-col h-full" onClick={() => navigate(`/blog/${blog.id}`)}>
                    <div className="w-full aspect-video overflow-hidden bg-theme-border/20">
                      <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <span style={{ color: getCategoryColor(idx) }} className="font-bold text-[10px] uppercase tracking-widest mb-3 block">
                        {(blog as any).category || 'Technology'}
                      </span>
                      <h3 className="text-xl font-serif font-bold text-theme-text mb-4 leading-snug line-clamp-3 group-hover:text-brand transition-colors">
                        {blog.title}
                      </h3>
                      <div className="mt-auto text-xs font-bold text-theme-dim flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1"><Calendar size={12}/> {blog.date}</span>
                        <span className="mx-1">•</span>
                        <span>{blog.author || 'Al-amin'}</span>
                        <span className="mx-1">•</span>
                        <span>{getReadingTime(blog.content)} min</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

          </div>
        )}
      </div>
    </Layout>
  );
};
