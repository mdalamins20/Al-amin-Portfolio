import React from 'react';
import { motion } from 'framer-motion';
import { useDataStore } from './stores/useDataStore';
import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowRight, Loader2, BookOpen } from 'lucide-react';

export const RecentBlogs: React.FC = () => {
  const { blogs, loading, init } = useDataStore();
  const navigate = useNavigate();

  React.useEffect(() => {
    init();
  }, [init]);

  const stripHtmlAndTruncate = (html: string, maxLength: number) => {
    if (!html) return '';
    try {
      const plainText = html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ');
      return plainText.length > maxLength ? plainText.substring(0, maxLength) + '...' : plainText;
    } catch {
      return '';
    }
  };

  const getCategoryColor = (index: number) => {
    const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];
    return colors[index % colors.length];
  };

  // Show only 3 recent blogs
  const recentBlogs = blogs.slice(0, 3);

  return (
    <section id="blog" className="py-section-padding px-margin-mobile md:px-gutter max-w-container-max mx-auto relative overflow-visible">
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Unified Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-label-bold text-xs uppercase tracking-widest mb-4">
            <BookOpen size={14} />
            <span>Latest Articles</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-on-surface tracking-tight">
            The <span className="gradient-text">Journal.</span>
          </h2>
          <p className="text-text-secondary dark:text-slate-300 font-normal text-sm sm:text-base leading-relaxed max-w-xl mt-3">
            Thoughts, tutorials, and insights on the future of tech and design.
          </p>
        </div>
        <button 
          onClick={() => navigate('/blog')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/25 font-bold text-xs sm:text-sm transition-all shadow-sm hover:shadow-primary/20 active:scale-95 whitespace-nowrap self-start md:self-end"
        >
          <span>See All Articles</span>
          <ArrowRight size={15} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-text-secondary">No articles published yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {recentBlogs.map((blog, idx) => (
            <motion.article 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4 }}
              key={blog.id} 
              className="group cursor-pointer glass-card rounded-2xl shadow-sm overflow-hidden border border-transparent hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col h-full" 
              onClick={() => navigate(`/blog/${blog.id}`)}
            >
              <div className="w-full aspect-video overflow-hidden bg-surface-variant/20">
                <img 
                  src={blog.image} 
                  alt={blog.title} 
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  width="400"
                  height="225"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <span style={{ color: getCategoryColor(idx) }} className="font-bold text-[10px] uppercase tracking-widest mb-3 block">
                  {(blog as any).category || 'Technology'}
                </span>
                <h3 className="text-xl font-serif font-bold text-on-surface mb-6 leading-snug group-hover:text-primary transition-colors break-words">
                  {blog.title}
                </h3>
                <div className="mt-auto text-xs font-bold text-text-secondary/70 flex items-center gap-2">
                  <Calendar size={12}/> {blog.date}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
      
      <div className="mt-12 text-center md:hidden">
         <button 
           onClick={() => navigate('/blog')}
           className="px-8 py-3 bg-primary-container text-white rounded-lg font-label-bold w-full hover:scale-[1.02] transition-transform"
         >
           Explore All Articles
         </button>
      </div>
    </section>
  );
};
