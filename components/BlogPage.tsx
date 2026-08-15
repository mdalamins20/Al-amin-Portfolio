import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Calendar } from 'lucide-react';
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
    <div className="bg-brand rounded-3xl overflow-hidden relative mb-16 md:mb-24 shadow-xl border border-brand/20 w-full max-w-[1200px] mx-auto">
      {/* Desktop Newsletter */}
      <div className="hidden md:flex items-center justify-between p-12">
        <div className="z-10 w-[55%] text-white">
          <h3 className="text-3xl font-serif font-bold mb-4">Stay ahead of the Vibe.</h3>
          <p className="text-white/90 mb-8 leading-relaxed text-[15px]">
            Get weekly insights into the future of software engineering, system architecture, and tech leadership delivered to your inbox. No spam, promise!
          </p>
          
          {subscribed ? (
            <div className="bg-white/20 text-white px-6 py-4 rounded-xl font-bold inline-block border border-white/30 backdrop-blur-sm">
              Thanks for subscribing! 🎉
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-3 w-full max-w-md">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address" 
                className="flex-1 bg-white dark:bg-slate-900 rounded-xl px-5 py-4 text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-brand/30 font-medium"
                required
              />
              <button 
                type="submit" 
                disabled={subscribing}
                className="bg-slate-900 dark:bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-black transition-colors shrink-0 disabled:opacity-50"
              >
                {subscribing ? 'Wait...' : 'Subscribe Here'}
              </button>
            </form>
          )}
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[20%] opacity-[0.07] pointer-events-none">
          <Mail size={380} />
        </div>
      </div>

      {/* Mobile Newsletter */}
      <div className="md:hidden p-8 text-center text-white relative z-10 flex flex-col items-center">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm border border-white/20">
          <Mail size={32} />
        </div>
        <h3 className="text-2xl font-serif font-bold mb-4">Stay ahead of the Vibe.</h3>
        <p className="text-white/90 text-sm mb-8 leading-relaxed">
          Get weekly insights into the future of tech and leadership delivered to your inbox.
        </p>
        
        {subscribed ? (
          <div className="bg-white/20 text-white w-full px-6 py-4 rounded-xl font-bold border border-white/30">
            Thanks! 🎉
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex flex-col gap-3 w-full">
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address" 
              className="w-full bg-theme-bg dark:bg-slate-900 rounded-xl px-5 py-4 text-theme-text dark:text-white outline-none text-center font-medium"
              required
            />
            <button 
              type="submit" 
              disabled={subscribing}
              className="w-full bg-brand-50 text-brand py-4 rounded-xl font-bold transition-colors disabled:opacity-50 text-base hover:bg-white"
            >
              {subscribing ? 'Wait...' : 'Subscribe Here'}
            </button>
          </form>
        )}
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
  const bentoGridBlogs = blogs.slice(1, 5); // Next 4 posts for bento grid
  const standardBlogs = blogs.slice(5); // Remaining posts



  return (
    <Layout onViewCV={() => {}}>
      <SEO 
        title="The Journal - Blog & Insights" 
        description="প্রযুক্তি এবং ডিজাইনের ভবিষ্যৎ নিয়ে আমাদের চিন্তা, টিউটোরিয়াল এবং অন্তর্দৃষ্টি।"
      />
      <div className="pt-2 md:pt-16 pb-20 w-full overflow-hidden bg-theme-bg">
        
        {/* Header */}
        <div className="text-center mb-10 md:mb-16 px-4">
          <h1 className="text-[40px] md:text-[64px] font-serif font-black text-theme-text tracking-tight mb-2 md:mb-4">
            The Journal<span className="text-brand">.</span>
          </h1>
          <p className="text-theme-dim text-sm md:text-base">Thoughts, tutorials, and insights on the future of tech and design.</p>
        </div>

        {blogs.length === 0 && !loading ? (
          <div className="text-center py-20 text-theme-dim">No articles published yet.</div>
        ) : (
          <div className="max-w-[1200px] mx-auto px-4 md:px-8">
            
            {/* FEATURED POST */}
            {featuredBlog && (
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group cursor-pointer mb-16 md:mb-24 flex flex-col rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden bg-theme-card shadow-lg border border-theme-border transition-all hover:shadow-xl hover:-translate-y-1 w-full mx-auto"
                onClick={() => navigate(`/blog/${featuredBlog.id}`)}
              >
                <div className="w-full aspect-video overflow-hidden relative border-b border-theme-border/50">
                  <img 
                    src={featuredBlog.image} 
                    alt={featuredBlog.title} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                </div>
                
                <div className="p-6 md:p-12 flex flex-col items-start w-full">
                  <span className="bg-brand/10 text-brand px-4 py-1.5 text-[10px] md:text-xs font-bold rounded-full mb-4 md:mb-6 uppercase tracking-widest">
                    Featured Article
                  </span>
                  <h2 className="text-2xl md:text-[40px] font-serif font-bold text-theme-text mb-4 md:mb-6 leading-[1.3] group-hover:text-brand transition-colors">
                    {featuredBlog.title}
                  </h2>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-6 mt-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-theme-bg border border-theme-border flex items-center justify-center font-bold text-sm uppercase text-theme-text shrink-0">
                        {featuredBlog.author?.charAt(0) || 'A'}
                      </div>
                      <span className="text-sm text-theme-dim font-bold">{featuredBlog.author || 'Al-amin'} • {getReadingTime(featuredBlog.content)} min read</span>
                    </div>
                    
                    <button className="bg-brand text-white px-8 py-3.5 rounded-full font-bold text-xs tracking-wider flex items-center justify-center gap-2 hover:bg-brand-700 transition-colors shadow-md">
                      READ FULL ARTICLE <ArrowRight size={16} />
                    </button>
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
